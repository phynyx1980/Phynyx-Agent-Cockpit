import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface CalendarEvent {
  id:        string;
  title:     string;
  start:     string;
  end:       string;
  location?: string;
  link?:     string;
}

export async function getUpcomingEvents(
  accessToken: string,
  maxResults   = 10,
): Promise<CalendarEvent[]> {
  const auth     = getGoogleClient(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.list({
    calendarId:   "primary",
    timeMin:      new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy:      "startTime",
  });

  return (res.data.items ?? []).map((e) => ({
    id:       e.id!,
    title:    e.summary ?? "(Kein Titel)",
    start:    e.start?.dateTime ?? e.start?.date ?? "",
    end:      e.end?.dateTime   ?? e.end?.date   ?? "",
    location: e.location ?? undefined,
    link:     e.htmlLink ?? undefined,
  }));
}

export async function createEvent(
  accessToken: string,
  title:       string,
  start:       string,
  end:         string,
  description?: string,
): Promise<CalendarEvent> {
  const auth     = getGoogleClient(accessToken);
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.events.insert({
    calendarId:  "primary",
    requestBody: {
      summary:     title,
      description,
      start: { dateTime: start, timeZone: "Europe/Vienna" },
      end:   { dateTime: end,   timeZone: "Europe/Vienna" },
    },
  });

  const e = res.data;
  return {
    id:    e.id!,
    title: e.summary ?? title,
    start: e.start?.dateTime ?? start,
    end:   e.end?.dateTime   ?? end,
    link:  e.htmlLink ?? undefined,
  };
}
