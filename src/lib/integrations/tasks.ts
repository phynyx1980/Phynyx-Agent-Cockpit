import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface GoogleTask {
  id:        string;
  title:     string;
  due?:      string;
  completed: boolean;
  notes?:    string;
}

export async function getTasks(
  accessToken: string,
  maxResults   = 20,
): Promise<GoogleTask[]> {
  const auth  = getGoogleClient(accessToken);
  const tasks = google.tasks({ version: "v1", auth });

  // Erste Taskliste holen
  const listRes = await tasks.tasklists.list({ maxResults: 1 });
  const listId  = listRes.data.items?.[0]?.id;
  if (!listId) return [];

  const res = await tasks.tasks.list({
    tasklist:   listId,
    maxResults,
    showHidden: false,
  });

  return (res.data.items ?? []).map((t) => ({
    id:        t.id!,
    title:     t.title ?? "",
    due:       t.due ?? undefined,
    completed: t.status === "completed",
    notes:     t.notes ?? undefined,
  }));
}

export async function createTask(
  accessToken: string,
  title:       string,
  notes?:      string,
  due?:        string,
): Promise<GoogleTask> {
  const auth  = getGoogleClient(accessToken);
  const tasks = google.tasks({ version: "v1", auth });

  const listRes = await tasks.tasklists.list({ maxResults: 1 });
  const listId  = listRes.data.items?.[0]?.id ?? "@default";

  const res = await tasks.tasks.insert({
    tasklist:    listId,
    requestBody: { title, notes, due },
  });

  const t = res.data;
  return {
    id:        t.id!,
    title:     t.title ?? title,
    due:       t.due ?? undefined,
    completed: t.status === "completed",
    notes:     t.notes ?? undefined,
  };
}
