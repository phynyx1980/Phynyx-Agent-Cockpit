import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface GmailMessage {
  id:       string;
  subject:  string;
  from:     string;
  date:     string;
  snippet:  string;
  unread:   boolean;
}

export async function getInbox(accessToken: string, maxResults = 10): Promise<GmailMessage[]> {
  const auth   = getGoogleClient(accessToken);
  const gmail  = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId:     "me",
    maxResults,
    labelIds:   ["INBOX"],
  });

  const messages = listRes.data.messages ?? [];

  const results = await Promise.all(
    messages.map(async (m) => {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id:     m.id!,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const headers = msg.data.payload?.headers ?? [];
      const get     = (name: string) =>
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

  return results;
}

export async function sendEmail(
  accessToken: string,
  to:          string,
  subject:     string,
  body:        string,
): Promise<{ id: string }> {
  const auth  = getGoogleClient(accessToken);
  const gmail = google.gmail({ version: "v1", auth });

  // RFC 2822 Mail aufbauen
  const raw = Buffer.from(
    `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
  ).toString("base64url");

  const res = await gmail.users.messages.send({
    userId:      "me",
    requestBody: { raw },
  });

  return { id: res.data.id! };
}
