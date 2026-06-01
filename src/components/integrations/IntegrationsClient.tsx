"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn, signOut } from "next-auth/react";
import { Mail, Calendar, CheckSquare, LogOut, RefreshCw, ExternalLink, Loader2, CheckCheck, Trash2 } from "lucide-react";
import type { GmailMessage } from "@/lib/integrations/gmail";
import type { CalendarEvent } from "@/lib/integrations/calendar";
import type { GoogleTask } from "@/lib/integrations/tasks";
import { DriveBrowser } from "./DriveBrowser";

interface Props {
  isConnected: boolean;
  userEmail:   string | null;
}

function relativeTime(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("de-AT", {
      weekday: "short", day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function IntegrationsClient({ isConnected, userEmail }: Props) {
  const [emails,  setEmails]  = useState<GmailMessage[]>([]);
  const [events,  setEvents]  = useState<CalendarEvent[]>([]);
  const [tasks,   setTasks]   = useState<GoogleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    setError(null);
    try {
      const [gmailRes, calRes, tasksRes] = await Promise.all([
        fetch("/api/google/gmail"),
        fetch("/api/google/calendar"),
        fetch("/api/google/tasks"),
      ]);
      const [gmail, cal, task] = await Promise.all([
        gmailRes.json(), calRes.json(), tasksRes.json(),
      ]);
      if (gmail.success) setEmails(gmail.data);
      if (cal.success)   setEvents(cal.data);
      if (task.success)  setTasks(task.data);
    } catch {
      setError("Fehler beim Laden der Google-Daten.");
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Nicht verbunden ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 max-w-sm mx-auto">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{ background: "linear-gradient(135deg, #8B0000 0%, #CC1100 100%)", boxShadow: "0 0 20px rgba(204,17,0,0.3)" }}
        >
          🔗
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Google verbinden</h2>
          <p className="text-sm text-[#999999] mt-1">
            Gmail, Kalender und Tasks werden nach dem Login live geladen.
          </p>
        </div>
        <button
          onClick={() => signIn("google")}
          className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-[#1A1A1A] font-semibold text-sm hover:bg-[#f0f0f0] transition-all active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Mit Google verbinden
        </button>
      </div>
    );
  }

  // ── Verbunden ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Status Header */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#1A1A1A] border border-[#22C55E]/30">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-white">Google verbunden</p>
            <p className="text-xs text-[#999999]">{userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-xs text-[#999999] hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Aktualisieren
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2A2A] text-xs text-[#999999] hover:text-[#CC1100] transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Trennen
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#CC1100]/10 border border-[#CC1100]/30 text-sm text-[#CC1100]">
          {error}
        </div>
      )}

      {loading && emails.length === 0 && (
        <div className="flex items-center justify-center py-16 gap-3 text-[#999999]">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Google-Daten werden geladen…</span>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Gmail */}
          <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#CC1100]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Gmail</h3>
                {emails.filter((e) => e.unread).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CC1100] text-white">
                    {emails.filter((e) => e.unread).length}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#999999]">{emails.length} Mails</span>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {emails.length === 0 ? (
                <p className="text-xs text-[#555555] text-center py-8">Keine E-Mails</p>
              ) : emails.map((mail) => (
                <div key={mail.id} className="px-4 py-3 hover:bg-[#111111] transition-colors">
                  <div className="flex items-start gap-2">
                    {mail.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#CC1100] mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${mail.unread ? "text-white font-semibold" : "text-[#cccccc]"}`}>
                        {mail.subject}
                      </p>
                      <p className="text-[10px] text-[#999999] truncate mt-0.5">{mail.from.split("<")[0].trim()}</p>
                      <p className="text-[10px] text-[#555555] mt-0.5 line-clamp-1">{mail.snippet}</p>
                    </div>
                    <span className="text-[10px] text-[#555555] shrink-0">{relativeTime(mail.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A84C]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Kalender</h3>
              </div>
              <span className="text-[10px] text-[#999999]">{events.length} Events</span>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {events.length === 0 ? (
                <p className="text-xs text-[#555555] text-center py-8">Keine bevorstehenden Events</p>
              ) : events.map((event) => (
                <div key={event.id} className="px-4 py-3 hover:bg-[#111111] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-white font-medium truncate">{event.title}</p>
                      <p className="text-[10px] text-[#C9A84C] mt-0.5">{formatDate(event.start)}</p>
                      {event.location && (
                        <p className="text-[10px] text-[#555555] truncate mt-0.5">{event.location}</p>
                      )}
                    </div>
                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-[#555555] hover:text-[#C9A84C] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#22C55E]" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Tasks</h3>
                {tasks.filter((t) => !t.completed).length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#22C55E]/20 text-[#22C55E]">
                    {tasks.filter((t) => !t.completed).length} offen
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#999999]">{tasks.length} gesamt</span>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {tasks.length === 0 ? (
                <p className="text-xs text-[#555555] text-center py-8">Keine Tasks</p>
              ) : tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#111111] transition-colors">
                  <div
                    className="w-3.5 h-3.5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      borderColor: task.completed ? "#22C55E" : "#2A2A2A",
                      backgroundColor: task.completed ? "#22C55E" : "transparent",
                    }}
                  >
                    {task.completed && <span className="text-[8px] text-white">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs truncate ${task.completed ? "text-[#555555] line-through" : "text-white"}`}>
                      {task.title}
                    </p>
                    {task.due && (
                      <p className="text-[10px] text-[#999999] mt-0.5">{formatDate(task.due)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Drive — navigierbarer Browser */}
          <DriveBrowser />

        </div>
      )}
    </div>
  );
}
