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

export const FOLDER_MIME = "application/vnd.google-apps.folder";

function friendlyType(mimeType: string): string {
  const map: Record<string, string> = {
    [FOLDER_MIME]:                                "Ordner",
    "application/vnd.google-apps.document":       "Docs",
    "application/vnd.google-apps.spreadsheet":    "Sheets",
    "application/vnd.google-apps.presentation":   "Slides",
    "application/pdf":                             "PDF",
    "image/jpeg":                                  "Bild",
    "image/png":                                   "Bild",
    "image/gif":                                   "Bild",
    "application/zip":                             "ZIP",
  };
  return map[mimeType] ?? "Datei";
}

function mapFile(f: {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  modifiedTime?: string | null;
  size?: string | null;
  webViewLink?: string | null;
}): DriveFile {
  return {
    id:           f.id!,
    name:         f.name ?? "(Kein Name)",
    mimeType:     f.mimeType ?? "",
    modifiedTime: f.modifiedTime ?? "",
    size:         f.size ?? undefined,
    webViewLink:  f.webViewLink ?? undefined,
    isFolder:     f.mimeType === FOLDER_MIME,
    friendlyType: friendlyType(f.mimeType ?? ""),
  };
}

// Inhalt eines Ordners (oder Root) laden — Ordner zuerst, dann Dateien
export async function getFolderContents(
  accessToken: string,
  folderId    = "root",
  maxResults   = 50,
): Promise<DriveFile[]> {
  const auth  = getGoogleClient(accessToken);
  const drive = google.drive({ version: "v3", auth });

  // Ordner und Dateien parallel laden
  const [foldersRes, filesRes] = await Promise.all([
    drive.files.list({
      pageSize: maxResults,
      q:        `'${folderId}' in parents and mimeType = '${FOLDER_MIME}' and trashed = false`,
      orderBy:  "name",
      fields:   "files(id,name,mimeType,modifiedTime,webViewLink)",
      spaces:   "drive",
    }),
    drive.files.list({
      pageSize: maxResults,
      q:        `'${folderId}' in parents and mimeType != '${FOLDER_MIME}' and trashed = false`,
      orderBy:  "modifiedTime desc",
      fields:   "files(id,name,mimeType,modifiedTime,size,webViewLink)",
      spaces:   "drive",
    }),
  ]);

  const folders = (foldersRes.data.files ?? []).map(mapFile);
  const files   = (filesRes.data.files  ?? []).map(mapFile);
  return [...folders, ...files];
}

// Datei/Ordner-Name für Breadcrumb
export async function getFileName(
  accessToken: string,
  fileId:      string,
): Promise<string> {
  const auth  = getGoogleClient(accessToken);
  const drive = google.drive({ version: "v3", auth });
  const res   = await drive.files.get({ fileId, fields: "name" });
  return res.data.name ?? fileId;
}

// Datei-Suche quer durch Drive
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

  return (res.data.files ?? []).map(mapFile);
}
