import { google } from "googleapis";
import { getGoogleClient } from "./google-client";

export interface DriveFile {
  id:           string;
  name:         string;
  mimeType:     string;
  modifiedTime: string;
  size?:        string;
  webViewLink?: string;
  iconLink?:    string;
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

export async function getRecentFiles(
  accessToken: string,
  maxResults   = 10,
): Promise<DriveFile[]> {
  const auth  = getGoogleClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.list({
    pageSize: maxResults,
    orderBy:  "modifiedTime desc",
    q:        `mimeType != '${FOLDER_MIME}' and trashed = false`,
    fields:   "files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)",
  });

  return (res.data.files ?? []).map((f) => ({
    id:           f.id!,
    name:         f.name ?? "(Kein Name)",
    mimeType:     f.mimeType ?? "",
    modifiedTime: f.modifiedTime ?? "",
    size:         f.size ?? undefined,
    webViewLink:  f.webViewLink ?? undefined,
    iconLink:     f.iconLink ?? undefined,
    friendlyType: friendlyType(f.mimeType ?? ""),
  }));
}
