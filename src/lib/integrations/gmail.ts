import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface GmailMessage {
  id:       string;
  subject:  string;
  from:     string;
  date:     string;
  snippet:  string;
  unread:   boolean;
  body?:    string;   // Volltext beim Detail-Abruf
}

function extractBody(payload: {
  mimeType?: string | null;
  body?:     { data?: string | null } | null;
  parts?:    Array<{ mimeType?: string | null; body?: { data?: string | null } | null; parts?: unknown[] }> | null;
}): string {
  // Direkt text/plain im body
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  // Parts durchsuchen — bevorzuge text/plain, fallback text/html
  if (payload.parts) {
    const plain = payload.parts.find((p) => p.mimeType === "text/plain");
    if (plain?.body?.data) return Buffer.from(plain.body.data, "base64").toString("utf-8");
    const html = payload.parts.find((p) => p.mimeType === "text/html");
    if (html?.body?.data) {
      const raw = Buffer.from(html.body.data, "base64").toString("utf-8");
      // HTML-Tags entfernen
      return raw.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
    }
  }
  return "";
}

// Inbox laden (Liste, kein Body)
export async function getInbox(accessToken: string, maxResults = 10): Promise<GmailMessage[]> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me", maxResults, labelIds: ["INBOX"],
  });

  const messages = listRes.data.messages ?? [];

  return Promise.all(
    messages.map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me", id: m.id!, format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });
      const headers = msg.data.payload?.headers ?? [];
      const get = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

      return {
        id:      m.id!,
        subject: get("Subject") || "(Kein Betreff)",
        from:    get("From"),
        date:    get("Date"),
        snippet: msg.data.snippet ?? "",
        unread:  (msg.data.labelIds ?? []).includes("UNREAD"),
      };
    })
  );
}

// Einzelne Mail vollständig laden (inkl. Body)
export async function getEmailDetail(accessToken: string, messageId: string): Promise<GmailMessage | null> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  try {
    const msg = await gmail.users.messages.get({
      userId: "me", id: messageId, format: "full",
    });

    const headers = msg.data.payload?.headers ?? [];
    const get = (name: string) =>
      headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";

    const body = msg.data.payload ? extractBody(msg.data.payload as Parameters<typeof extractBody>[0]) : "";

    return {
      id:      messageId,
      subject: get("Subject") || "(Kein Betreff)",
      from:    get("From"),
      date:    get("Date"),
      snippet: msg.data.snippet ?? "",
      unread:  (msg.data.labelIds ?? []).includes("UNREAD"),
      body,
    };
  } catch {
    return null;
  }
}

// Als gelesen markieren
export async function markAsRead(accessToken: string, messageId: string): Promise<void> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.modify({
    userId: "me", id: messageId,
    requestBody: { removeLabelIds: ["UNREAD"] },
  });
}

// In Papierkorb verschieben
export async function trashEmail(accessToken: string, messageId: string): Promise<void> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.trash({ userId: "me", id: messageId });
}

// Mail senden
export async function sendEmail(
  accessToken: string, to: string, subject: string, body: string,
): Promise<{ id: string }> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");

  const res = await gmail.users.messages.send({ userId: "me", requestBody: { raw } });
  return { id: res.data.id! };
}
