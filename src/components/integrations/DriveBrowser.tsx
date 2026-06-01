"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HardDrive, Folder, FileText, File, Image, ChevronRight,
  ArrowLeft, ExternalLink, Loader2, Search, X,
} from "lucide-react";
import type { DriveFile } from "@/lib/integrations/drive";

interface BreadcrumbItem { id: string; name: string }

function getDriveIcon(mimeType: string, isFolder: boolean) {
  if (isFolder) return Folder;
  if (mimeType === "application/vnd.google-apps.document")   return FileText;
  if (mimeType === "application/vnd.google-apps.spreadsheet") return FileText;
  if (mimeType === "application/vnd.google-apps.presentation") return FileText;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType === "application/pdf") return FileText;
  return File;
}

function iconColor(isFolder: boolean, mimeType: string) {
  if (isFolder) return "#C9A84C";
  if (mimeType === "application/vnd.google-apps.document")    return "#3B82F6";
  if (mimeType === "application/vnd.google-apps.spreadsheet") return "#22C55E";
  if (mimeType === "application/vnd.google-apps.presentation") return "#F59E0B";
  if (mimeType === "application/pdf") return "#CC1100";
  return "#999999";
}

function relativeTime(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `vor ${mins} Min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

export function DriveBrowser() {
  const [files,       setFiles]       = useState<DriveFile[]>([]);
  const [folderName,  setFolderName]  = useState("Mein Drive");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Mein Drive" },
  ]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [searching, setSearching] = useState(false);

  const currentFolder = breadcrumbs[breadcrumbs.length - 1];

  const loadFolder = useCallback(async (folderId: string) => {
    setLoading(true);
    setSearch("");
    try {
      const res  = await fetch(`/api/google/drive?folderId=${folderId}`);
      const json = await res.json();
      if (json.success) {
        setFiles(json.data);
        setFolderName(json.folderName ?? "Mein Drive");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { loadFolder(currentFolder.id); return; }
    setSearching(true);
    try {
      const res  = await fetch(`/api/google/drive?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (json.success) setFiles(json.data);
    } finally {
      setSearching(false);
    }
  }, [currentFolder.id, loadFolder]);

  useEffect(() => { loadFolder("root"); }, [loadFolder]);

  function openFolder(file: DriveFile) {
    if (!file.isFolder) return;
    setBreadcrumbs((prev) => [...prev, { id: file.id, name: file.name }]);
    loadFolder(file.id);
  }

  function navigateBreadcrumb(index: number) {
    const crumb = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    loadFolder(crumb.id);
  }

  const folderCount = files.filter((f) => f.isFolder).length;
  const fileCount   = files.filter((f) => !f.isFolder).length;

  return (
    <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden flex flex-col" style={{ minHeight: 400 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] shrink-0">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Drive</h3>
          <span className="text-[10px] text-[#999999]">
            {folderCount > 0 && `${folderCount} Ordner`}
            {folderCount > 0 && fileCount > 0 && " · "}
            {fileCount > 0 && `${fileCount} Dateien`}
          </span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#2A2A2A] bg-[#111111] shrink-0 overflow-x-auto">
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="w-3 h-3 text-[#555555]" />}
            <button
              onClick={() => navigateBreadcrumb(i)}
              className={`text-[11px] hover:text-white transition-colors truncate max-w-[120px] ${
                i === breadcrumbs.length - 1 ? "text-white font-medium" : "text-[#999999]"
              }`}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Suche */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2A2A2A] shrink-0">
        <Search className="w-3.5 h-3.5 text-[#555555] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch(search)}
          placeholder="Datei suchen… (Enter)"
          className="flex-1 bg-transparent text-xs text-white placeholder:text-[#555555] outline-none"
        />
        {search && (
          <button onClick={() => { setSearch(""); loadFolder(currentFolder.id); }}>
            <X className="w-3 h-3 text-[#555555] hover:text-white" />
          </button>
        )}
        {searching && <Loader2 className="w-3 h-3 text-[#C9A84C] animate-spin shrink-0" />}
      </div>

      {/* Zurück-Button */}
      {breadcrumbs.length > 1 && (
        <button
          onClick={() => navigateBreadcrumb(breadcrumbs.length - 2)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#999999] hover:text-white hover:bg-[#111111] transition-colors border-b border-[#2A2A2A] shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück
        </button>
      )}

      {/* Inhalt */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#2A2A2A]">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-[#555555]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Lade Drive…</span>
          </div>
        ) : files.length === 0 ? (
          <p className="text-xs text-[#555555] text-center py-10">
            {search ? `Keine Ergebnisse für "${search}"` : "Dieser Ordner ist leer"}
          </p>
        ) : files.map((file) => {
          const Icon  = getDriveIcon(file.mimeType, file.isFolder);
          const color = iconColor(file.isFolder, file.mimeType);
          return (
            <div
              key={file.id}
              className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                file.isFolder ? "cursor-pointer hover:bg-[#1F1A0A]" : "hover:bg-[#111111]"
              }`}
              onClick={() => file.isFolder && openFolder(file)}
            >
              <Icon className="w-4 h-4 shrink-0" style={{ color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white truncate font-medium">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-[#555555]">{file.friendlyType}</span>
                  {file.modifiedTime && (
                    <span className="text-[10px] text-[#555555]">· {relativeTime(file.modifiedTime)}</span>
                  )}
                </div>
              </div>
              {file.isFolder ? (
                <ChevronRight className="w-3.5 h-3.5 text-[#555555] shrink-0" />
              ) : file.webViewLink ? (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 text-[#555555] hover:text-[#3B82F6] transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
