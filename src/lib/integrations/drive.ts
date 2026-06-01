import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface DriveFile {
  id:           string;
  name:         string;
  mimeType:     string;
  modifiedTime: string;
  size?:        string;
  webViewLink?: string;
  isFolder:     boolean;
  friendlyType: string;
}

const FOLDER_MIME = "application/vnd.google-apps.folder";

function friendlyType(mimeType: string): string {
  const map: Record<string, string> = {
    "application/vnd.google-apps.document":     "Docs",
    "application/vnd.google-apps.spreadsheet":  "Sheets",
    "application/vnd.google-apps.presentation": "Slides",
    "application/vnd.google-apps.folder":       "Ordner",
    "application/pdf":                           "PDF",
    "image/jpeg":                                "Bild",
    "image/png":                                 "Bild",
  };
  return map[mimeType] ?? "Datei";
}

// Zuletzt geänderte Dateien UND Ordner
export async function getRecentFiles(
  accessToken: string,
  maxResults   = 15,
): Promise<DriveFile[]> {
  const auth  = getGoogleClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    pageSize: maxResults,
    orderBy:  "modifiedTime desc",
    q:        "trashed = false",          // Ordner UND Dateien
    fields:   "files(id,name,mimeType,modifiedTime,size,webViewLink)",
    spaces:   "drive",
  });

  return (res.data.files ?? []).map((f) => ({
    id:           f.id!,
    name:         f.name ?? "(Kein Name)",
    mimeType:     f.mimeType ?? "",
    modifiedTime: f.modifiedTime ?? "",
    size:         f.size ?? undefined,
    webViewLink:  f.webViewLink ?? undefined,
    isFolder:     f.mimeType === FOLDER_MIME,
    friendlyType: friendlyType(f.mimeType ?? ""),
  }));
}

// Dateien in einem bestimmten Ordner suchen
export async function searchFiles(
  accessToken: string,
  query:       string,
  maxResults   = 10,
): Promise<DriveFile[]> {
  const auth  = getGoogleClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    pageSize: maxResults,
    q:        `name contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
    orderBy:  "modifiedTime desc",
    fields:   "files(id,name,mimeType,modifiedTime,size,webViewLink)",
    spaces:   "drive",
  });

  return (res.data.files ?? []).map((f) => ({
    id:           f.id!,
    name:         f.name ?? "(Kein Name)",
    mimeType:     f.mimeType ?? "",
    modifiedTime: f.modifiedTime ?? "",
    size:         f.size ?? undefined,
    webViewLink:  f.webViewLink ?? undefined,
    isFolder:     f.mimeType === FOLDER_MIME,
    friendlyType: friendlyType(f.mimeType ?? ""),
  }));
}
