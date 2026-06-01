import { createServerClient } from "./server";

// ── Typen ──────────────────────────────────────────────────────────────────

export interface ChatSession {
  id:         string;
  title:      string;
  createdAt:  string;
  updatedAt:  string;
}

export interface ChatMessageRow {
  id:          string;
  sessionId:   string;
  role:        "user" | "jarvis";
  content:     string;
  jarvisData?: unknown;
  googleData?: unknown;
  createdAt:   string;
}

// ── Sessions ───────────────────────────────────────────────────────────────

export async function getSessions(limit = 20): Promise<ChatSession[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) { console.error("getSessions:", error); return []; }
  return (data ?? []).map((r) => ({
    id: r.id, title: r.title,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }));
}

export async function createSession(title: string): Promise<ChatSession | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("chat_sessions")
    .insert({ title: title.slice(0, 60) })
    .select().single();
  if (error) { console.error("createSession:", error); return null; }
  return { id: data.id, title: data.title, createdAt: data.created_at, updatedAt: data.updated_at };
}

export async function touchSession(sessionId: string): Promise<void> {
  const db = createServerClient();
  await db.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
}

// ── Messages ───────────────────────────────────────────────────────────────

export async function getMessages(sessionId: string): Promise<ChatMessageRow[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getMessages:", error); return []; }
  return (data ?? []).map((r) => ({
    id: r.id, sessionId: r.session_id,
    role: r.role, content: r.content,
    jarvisData: r.jarvis_data, googleData: r.google_data,
    createdAt: r.created_at,
  }));
}

export async function saveMessage(
  sessionId: string,
  role:      "user" | "jarvis",
  content:   string,
  jarvisData?: unknown,
  googleData?: unknown,
): Promise<string | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("chat_messages")
    .insert({
      session_id:  sessionId,
      role,
      content,
      jarvis_data: jarvisData ?? null,
      google_data: googleData ?? null,
    })
    .select("id").single();
  if (error) { console.error("saveMessage:", error); return null; }
  await touchSession(sessionId);
  return data.id;
}
