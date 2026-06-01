"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send, ShieldCheck, ChevronRight, Loader2, Mail, Calendar,
  CheckSquare, HardDrive, ExternalLink, Plus, MessageSquare,
  ChevronDown, ChevronUp, Clock, CheckCheck, Trash2, SendHorizonal, CalendarPlus,
} from "lucide-react";
import { detectIntent } from "@/lib/agents/intent-router";
import { getAllAgentsForIntent, getHandoffEntry } from "@/lib/agents/handoff-matrix";
import { getAgentById } from "@/lib/agents/agent-registry";
import type { JarvisResponse, AgentResult, Approval } from "@/lib/agents/agent-types";
import type { GmailMessage } from "@/lib/integrations/gmail";
import type { CalendarEvent } from "@/lib/integrations/calendar";
import type { GoogleTask } from "@/lib/integrations/tasks";
import type { DriveFile } from "@/lib/integrations/drive";
import { AgentResultCard } from "./AgentResultCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ── Typen ─────────────────────────────────────────────────────────────────────

interface GoogleData {
  gmail?:    GmailMessage[];
  calendar?: CalendarEvent[];
  tasks?:    GoogleTask[];
  drive?:    DriveFile[];
}

interface DraftData {
  emailDraft?:    EmailDraft;
  calendarDraft?: CalendarDraft;
}

interface ChatMessage {
  id:              string;
  role:            "user" | "jarvis";
  content:         string;
  jarvisResponse?: JarvisResponse;
  googleData?:     GoogleData;
  draftData?:      DraftData;
  timestamp:       Date;
}

interface ChatSession {
  id:        string;
  title:     string;
  updatedAt: string;
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

const formatTime   = (d: Date) => d.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
const formatDateDE = (iso: string) => {
  try { return new Date(iso).toLocaleString("de-AT", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return iso; }
};
const relativeDay = (iso: string) => {
  try {
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff === 0) return "Heute";
    if (diff === 1) return "Gestern";
    return d.toLocaleDateString("de-AT", { day: "2-digit", month: "short" });
  } catch { return iso; }
};

// ── Aufklappbare E-Mail-Karte ─────────────────────────────────────────────────

function EmailCard({ mail, onRemove }: { mail: GmailMessage; onRemove?: (id: string) => void }) {
  const [open,          setOpen]          = useState(false);
  const [body,          setBody]          = useState<string | null>(mail.body ?? null);
  const [loading,       setLoading]       = useState(false);
  const [unread,        setUnread]        = useState(mail.unread);
  const [deleted,       setDeleted]       = useState(false);
  const [acting,        setActing]        = useState<"read" | "delete" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRead,   setConfirmRead]   = useState(false);

  if (deleted) return null;

  async function loadBody() {
    if (body !== null) { setOpen((v) => !v); return; }
    setLoading(true);
    try {
      const res  = await fetch(`/api/google/gmail/${mail.id}`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setBody(json.data.body ?? "(Kein Inhalt)");
    } catch { setBody("(Fehler beim Laden)"); }
    finally { setLoading(false); setOpen(true); }
  }

  async function doMarkRead() {
    setActing("read");
    try {
      await fetch(`/api/google/gmail/${mail.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead" }),
      });
      setUnread(false);
    } finally { setActing(null); setConfirmRead(false); }
  }

  async function doDelete() {
    setActing("delete");
    try {
      await fetch(`/api/google/gmail/${mail.id}`, { method: "DELETE", credentials: "include" });
      setDeleted(true);
      onRemove?.(mail.id);
    } catch { setActing(null); }
    setConfirmDelete(false);
  }

  return (
    <div className={`border-b border-[#1A1A1A] last:border-0 ${open ? "bg-[#0D0D0D]" : ""}`}>
      <div className="flex items-start gap-2 px-3 py-2.5 hover:bg-[#0F0F0F] transition-colors group">
        {/* Klickbereich: Mail öffnen */}
        <button onClick={loadBody} className="flex items-start gap-2 flex-1 min-w-0 text-left">
          {unread
            ? <span className="w-1.5 h-1.5 rounded-full bg-[#CC1100] mt-1.5 shrink-0" />
            : <span className="w-1.5 h-1.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${unread ? "text-white font-semibold" : "text-[#cccccc]"}`}>
              {mail.subject}
            </p>
            <p className="text-[10px] text-[#999999] truncate mt-0.5">{mail.from.split("<")[0].trim()}</p>
            {!open && <p className="text-[10px] text-[#555555] line-clamp-1 mt-0.5">{mail.snippet}</p>}
          </div>
        </button>

        {/* Aktions-Buttons */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {unread && (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmRead(true); }}
              title="Als gelesen markieren"
              className="p-1 rounded hover:bg-[#22C55E]/20 text-[#555555] hover:text-[#22C55E] transition-colors"
            >
              {acting === "read" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            title="In Papierkorb"
            className="p-1 rounded hover:bg-[#CC1100]/20 text-[#555555] hover:text-[#CC1100] transition-colors"
          >
            {acting === "delete" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={loadBody} className="p-1 text-[#555555] hover:text-white transition-colors">
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Bestätigungs-Dialoge */}
      <ConfirmDialog
        open={confirmDelete}
        title="Mail löschen?"
        description={`"${mail.subject}" wird in den Gmail-Papierkorb verschoben.`}
        confirmLabel="Ja, löschen"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
      <ConfirmDialog
        open={confirmRead}
        title="Als gelesen markieren?"
        description={`"${mail.subject}" wird als gelesen markiert.`}
        confirmLabel="Ja, markieren"
        onConfirm={doMarkRead}
        onCancel={() => setConfirmRead(false)}
      />

      {open && body !== null && (
        <div className="px-3 pb-3">
          <div className="rounded-lg bg-[#111111] border border-[#2A2A2A] p-3">
            <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
              {body || "(Kein Inhalt)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rich Google-Content im Chat ───────────────────────────────────────────────

function GmailBlock({ messages: initial }: { messages: GmailMessage[] }) {
  const [mails, setMails] = useState<GmailMessage[]>(initial);
  const unreadCount = mails.filter((m) => m.unread).length;
  if (!mails.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <Mail className="w-3.5 h-3.5 text-[#CC1100]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Gmail · {mails.length} Mails</span>
        {unreadCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#CC1100] text-white text-[10px] font-bold">{unreadCount} neu</span>
        )}
        <span className="ml-auto text-[10px] text-[#555555]">Hover → Aktionen</span>
      </div>
      {mails.map((mail) => (
        <EmailCard
          key={mail.id}
          mail={mail}
          onRemove={(id) => setMails((prev) => prev.filter((m) => m.id !== id))}
        />
      ))}
    </div>
  );
}

function CalendarBlock({ events }: { events: CalendarEvent[] }) {
  if (!events.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Kalender · {events.length} Termine</span>
      </div>
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0F0F0F]">
          <div className="w-1 self-stretch rounded-full bg-[#C9A84C] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium">{event.title}</p>
            <p className="text-[10px] text-[#C9A84C] mt-0.5">{formatDateDE(event.start)}</p>
            {event.location && <p className="text-[10px] text-[#555555] truncate mt-0.5">{event.location}</p>}
          </div>
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="text-[#555555] hover:text-[#C9A84C]">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function TasksBlock({ tasks }: { tasks: GoogleTask[] }) {
  const open = tasks.filter((t) => !t.completed);
  if (!open.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <CheckSquare className="w-3.5 h-3.5 text-[#22C55E]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Tasks · {open.length} offen</span>
      </div>
      {open.map((task) => (
        <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0">
          <div className="w-3 h-3 rounded-full border border-[#2A2A2A] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white">{task.title}</p>
            {task.due && <p className="text-[10px] text-[#999999] mt-0.5">fällig: {task.due}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function DriveBlock({ files }: { files: DriveFile[] }) {
  if (!files.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <HardDrive className="w-3.5 h-3.5 text-[#3B82F6]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Drive · {files.length} Einträge</span>
      </div>
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0F0F0F]">
          <span className="text-sm">{file.isFolder ? "📁" : "📄"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{file.name}</p>
            <p className="text-[10px] text-[#555555] mt-0.5">{file.friendlyType}</p>
          </div>
          {file.webViewLink && (
            <a href={file.webViewLink} target="_blank" rel="noopener noreferrer" className="text-[#555555] hover:text-[#3B82F6]">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ── E-Mail-Entwurf Freigabe-Card ─────────────────────────────────────────────

interface EmailDraft {
  to:      string;
  subject: string;
  body:    string;
  draftId?: string;
}

interface CalendarDraft {
  title:       string;
  start:       string;
  end:         string;
  description?: string;
}

function EmailDraftCard({ draft }: { draft: EmailDraft }) {
  const [status,          setStatus]          = useState<"idle" | "creating" | "ready" | "sending" | "sent" | "error">("idle");
  const [draftId,         setDraftId]         = useState<string | null>(draft.draftId ?? null);
  const [confirmPrepare,  setConfirmPrepare]  = useState(false);
  const [confirmSend,     setConfirmSend]     = useState(false);

  async function doPrepare() {
    setConfirmPrepare(false);
    setStatus("creating");
    try {
      const res  = await fetch("/api/google/gmail/draft", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: draft.to, subject: draft.subject, body: draft.body }),
      });
      const json = await res.json();
      if (json.success) { setDraftId(json.data.draftId); setStatus("ready"); }
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  async function doSend() {
    if (!draftId) return;
    setConfirmSend(false);
    setStatus("sending");
    try {
      const res = await fetch("/api/google/gmail/draft/send", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      if ((await res.json()).success) setStatus("sent");
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <div className="rounded-xl border border-[#CC1100]/50 bg-[#1A0A0A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#CC1100]/30">
        <Mail className="w-3.5 h-3.5 text-[#CC1100]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">E-Mail-Entwurf — Freigabe erforderlich</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[#CC1100]/20 text-[#CC1100] text-[10px] font-bold">⚠ Noch nicht gesendet</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <span className="text-[#555555]">An:</span>     <span className="text-white">{draft.to}</span>
          <span className="text-[#555555]">Betreff:</span><span className="text-white font-medium">{draft.subject}</span>
        </div>
        <div className="rounded-lg bg-[#111111] border border-[#2A2A2A] p-2.5">
          <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">{draft.body}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#2A2A2A] bg-[#111111]">
        {status === "idle" && (
          <button onClick={() => setConfirmPrepare(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2A2A2A] text-xs text-[#999999] hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5" /> In Gmail-Entwürfen ablegen
          </button>
        )}
        {status === "creating" && <span className="flex items-center gap-2 text-xs text-[#999999]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Entwurf wird angelegt…</span>}
        {status === "ready" && (
          <>
            <span className="text-[10px] text-[#22C55E]">✓ Entwurf in Gmail gespeichert</span>
            <button onClick={() => setConfirmSend(true)}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-[#CC1100] text-xs font-bold text-white hover:brightness-110 transition-all"
              style={{ boxShadow: "0 0 12px rgba(204,17,0,0.4)" }}>
              <SendHorizonal className="w-3.5 h-3.5" /> Jetzt senden →
            </button>
          </>
        )}
        {status === "sending" && <span className="flex items-center gap-2 text-xs text-[#C9A84C]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Wird gesendet…</span>}
        {status === "sent"    && <span className="text-xs text-[#22C55E] font-semibold">✓ E-Mail erfolgreich gesendet</span>}
        {status === "error"   && <span className="text-xs text-[#CC1100]">Fehler — bitte erneut versuchen</span>}
      </div>

      <ConfirmDialog
        open={confirmPrepare}
        title="Entwurf in Gmail ablegen?"
        description={`An: ${draft.to}\nBetreff: "${draft.subject}"\n\nDer Entwurf wird in deinen Gmail-Entwürfen gespeichert. Noch nichts wird gesendet.`}
        confirmLabel="Ja, ablegen"
        onConfirm={doPrepare}
        onCancel={() => setConfirmPrepare(false)}
      />
      <ConfirmDialog
        open={confirmSend}
        title="E-Mail wirklich senden?"
        description={`Die E-Mail an ${draft.to} mit dem Betreff "${draft.subject}" wird jetzt unwiderruflich gesendet.`}
        confirmLabel="Ja, jetzt senden"
        danger
        onConfirm={doSend}
        onCancel={() => setConfirmSend(false)}
      />
    </div>
  );
}

function CalendarDraftCard({ draft }: { draft: CalendarDraft }) {
  const [status, setStatus] = useState<"idle" | "creating" | "done" | "error">("idle");

  async function createNow() {
    setStatus("creating");
    try {
      const res = await fetch("/api/google/calendar/event", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if ((await res.json()).success) setStatus("done");
      else setStatus("error");
    } catch { setStatus("error"); }
  }

  return (
    <div className="rounded-xl border border-[#C9A84C]/50 bg-[#1A1500] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#C9A84C]/30">
        <Calendar className="w-3.5 h-3.5 text-[#C9A84C]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Kalender-Eintrag — Freigabe erforderlich</span>
        <span className="ml-auto px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold">⚠ Noch nicht erstellt</span>
      </div>
      <div className="p-3 space-y-1.5">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <span className="text-[#555555]">Titel:</span>  <span className="text-white font-medium">{draft.title}</span>
          <span className="text-[#555555]">Start:</span>  <span className="text-[#C9A84C]">{new Date(draft.start).toLocaleString("de-AT")}</span>
          <span className="text-[#555555]">Ende:</span>   <span className="text-[#999999]">{new Date(draft.end).toLocaleString("de-AT")}</span>
          {draft.description && <><span className="text-[#555555]">Info:</span><span className="text-[#cccccc]">{draft.description}</span></>}
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 border-t border-[#2A2A2A] bg-[#111111]">
        {status === "idle" && (
          <button onClick={createNow}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A84C] text-xs font-bold text-[#0A0A0A] hover:brightness-110 transition-all">
            <CalendarPlus className="w-3.5 h-3.5" /> In Kalender eintragen (Freigabe)
          </button>
        )}
        {status === "creating" && <span className="flex items-center gap-2 text-xs text-[#999999]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Wird erstellt…</span>}
        {status === "done"     && <span className="text-xs text-[#22C55E] font-semibold">✓ Kalender-Eintrag erstellt</span>}
        {status === "error"    && <span className="text-xs text-[#CC1100]">Fehler — bitte erneut versuchen</span>}
      </div>
    </div>
  );
}

// ── Agent Bar ─────────────────────────────────────────────────────────────────

function AgentBar({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-[#999999] uppercase tracking-[0.1em]">Aktiviert:</span>
      {agentIds.map((id) => {
        const agent = getAgentById(id);
        return (
          <span key={id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#cccccc]">
            {agent?.emoji ?? "🤖"} {agent?.name ?? id}
          </span>
        );
      })}
    </div>
  );
}

// ── Jarvis Response Bubble ────────────────────────────────────────────────────

function JarvisResponseBubble({ response, googleData, draftData }: { response: JarvisResponse; googleData?: GoogleData; draftData?: DraftData }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? response.results : response.results.slice(0, 3);

  return (
    <div className="space-y-3">
      <AgentBar agentIds={response.activatedAgents} />

      <div className="px-4 py-3 rounded-xl border" style={{ background: "linear-gradient(135deg,#1A0A0A,#1A1A1A)", borderColor: "#CC1100", boxShadow: "0 0 15px rgba(204,17,0,0.06)" }}>
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">🧠</span>
          <p className="text-[13px] leading-relaxed text-[#e0e0e0]"
            dangerouslySetInnerHTML={{ __html: response.summary
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/⚠️/g, '<span class="text-[#C9A84C]">⚠️</span>')
              .replace(/✅/g, '<span class="text-[#22C55E]">✅</span>') }}
          />
        </div>
      </div>

      {/* Google Rich Content */}
      {googleData?.gmail    && googleData.gmail.length    > 0 && <GmailBlock    messages={googleData.gmail} />}
      {googleData?.calendar && googleData.calendar.length > 0 && <CalendarBlock events={googleData.calendar} />}
      {googleData?.tasks    && googleData.tasks.length    > 0 && <TasksBlock    tasks={googleData.tasks} />}
      {googleData?.drive    && googleData.drive.length    > 0 && <DriveBlock    files={googleData.drive} />}

      {/* Entwurf-Freigabe Cards */}
      {draftData?.emailDraft    && <EmailDraftCard    draft={draftData.emailDraft} />}
      {draftData?.calendarDraft && <CalendarDraftCard draft={draftData.calendarDraft} />}

      {response.approvalRequired && response.approvals.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#CC1100]/40 bg-[#CC1100]/8">
          <ShieldCheck className="w-4 h-4 text-[#CC1100] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-white">Freigabe erforderlich</p>
            <p className="text-xs text-[#999999] mt-0.5">{response.approvals[0].description}</p>
          </div>
          <span className="px-2 py-1 rounded bg-[#CC1100] text-[10px] font-bold text-white">{response.approvals.length}</span>
        </div>
      )}

      {visible.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold">Agentenergebnisse</p>
          {visible.map((r) => <AgentResultCard key={r.id} result={r} />)}
          {!showAll && response.results.length > 3 && (
            <button onClick={() => setShowAll(true)} className="flex items-center gap-1.5 text-xs text-[#CC1100] hover:underline">
              <ChevronRight className="w-3 h-3" />{response.results.length - 3} weitere
            </button>
          )}
        </div>
      )}

      {response.nextSteps.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#C9A84C] font-semibold mb-2">Nächste Schritte</p>
          <ul className="space-y-1.5">
            {response.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#cccccc]">
                <span className="text-[#C9A84C] font-bold shrink-0">{i + 1}.</span>{step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Beispiel-Prompts ──────────────────────────────────────────────────────────

const EXAMPLES = [
  "Zeig mir meine ungelesenen Mails",
  "Was habe ich heute im Kalender?",
  "Neue Kundenanfrage aus Wien — was tun?",
  "Erstelle Angebotsstruktur KI-Chatbot",
  "Welche Drive-Dateien zuletzt geändert?",
  "Content-Plan nächste Woche KI-Automatisierung",
];

// ── Haupt-Komponente ──────────────────────────────────────────────────────────

export function JarvisChat() {
  const [messages,        setMessages]        = useState<ChatMessage[]>([]);
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [sessionId,       setSessionId]       = useState<string | null>(null);
  const [sessions,        setSessions]        = useState<ChatSession[]>([]);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Sessions laden
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res  = await fetch("/api/chat/sessions", { credentials: "include" });
      const json = await res.json();
      if (json.success) setSessions(json.data);
    } finally { setLoadingSessions(false); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Session wechseln / öffnen
  async function openSession(id: string) {
    setSessionId(id);
    setSidebarOpen(false);
    const res  = await fetch(`/api/chat/messages?sessionId=${id}`, { credentials: "include" });
    const json = await res.json();
    if (!json.success) return;

    const msgs: ChatMessage[] = json.data.map((row: {
      id: string; role: "user" | "jarvis"; content: string;
      jarvisData: unknown; googleData: unknown; createdAt: string;
    }) => ({
      id:             row.id,
      role:           row.role,
      content:        row.content,
      jarvisResponse: row.role === "jarvis" && row.jarvisData ? (row.jarvisData as JarvisResponse) : undefined,
      googleData:     row.googleData as GoogleData | undefined,
      timestamp:      new Date(row.createdAt),
    }));
    setMessages(msgs);
  }

  // Neue Session
  function newSession() {
    setSessionId(null);
    setMessages([]);
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    // Session anlegen falls noch keine existiert
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const res  = await fetch("/api/chat/sessions", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: text.trim().slice(0, 60) }),
      });
      const json = await res.json();
      if (json.success) {
        currentSessionId = json.data.id;
        setSessionId(currentSessionId);
        setSessions((prev) => [json.data, ...prev]);
      }
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user", content: text.trim(), timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // User-Message in Supabase speichern
    if (currentSessionId) {
      await fetch("/api/chat/messages", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSessionId, role: "user", content: text.trim() }),
      }).catch(() => {});
    }

    try {
      const route           = detectIntent(text.trim());
      const intent          = route.intent;
      const activatedAgents = getAllAgentsForIntent(intent);
      const handoff         = getHandoffEntry(intent);

      const res = await fetch("/api/jarvis/chat", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), intent, activatedAgents }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const json       = await res.json();
      const data       = json.data;
      const googleData = json.googleData as GoogleData | undefined;
      const draftData  = json.draftData  as DraftData  | undefined;
      const taskId     = Math.random().toString(36).slice(2);

      const results: AgentResult[] = (data.agentResults ?? []).map((r: {
        agentId: string; summary: string; details: string; suggestedActions: string[]; risks: string[];
      }, i: number) => ({
        id: `r-${i}`, taskId, agentId: r.agentId, status: "done" as const,
        summary: r.summary, details: r.details,
        suggestedActions: r.suggestedActions ?? [], risks: r.risks ?? [],
        createdAt: new Date().toISOString(),
      }));

      const approvals: Approval[] = (data.requiresApproval ?? handoff.requiresApproval) ? [{
        id: `apr-${taskId}`, taskId,
        title: `Freigabe: ${intent.replace(/_/g, " ")}`,
        description: handoff.approvalReason ?? "Diese Aktion erfordert deine Freigabe.",
        actionType: "trigger_external_api",
        riskLevel: handoff.priority === "urgent" ? "critical" : handoff.priority === "high" ? "high" : "medium",
        status: "open", involvedAgents: activatedAgents, createdAt: new Date().toISOString(),
      }] : [];

      const response: JarvisResponse = {
        taskId, intent, activatedAgents,
        summary: data.summary ?? "Jarvis hat die Aufgabe bearbeitet.",
        results, approvalRequired: approvals.length > 0, approvals,
        logs: [], nextSteps: data.nextSteps ?? [],
      };

      const jarvisMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "jarvis", content: response.summary,
        jarvisResponse: response, googleData, draftData, timestamp: new Date(),
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      // Jarvis-Message in Supabase speichern
      if (currentSessionId) {
        await fetch("/api/chat/messages", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId, role: "jarvis",
            content: response.summary,
            jarvisData: response, googleData,
          }),
        }).catch(() => {});
        // Session-Liste aktualisieren
        setSessions((prev) => prev.map((s) =>
          s.id === currentSessionId ? { ...s, updatedAt: new Date().toISOString() } : s
        ));
      }

    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: "jarvis",
        content: "Entschuldigung — Jarvis konnte die Anfrage nicht verarbeiten.",
        timestamp: new Date(),
      }]);
      console.error("Jarvis error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <div className="flex h-full gap-0 max-w-6xl mx-auto">

      {/* Session Sidebar */}
      <div className={`flex flex-col shrink-0 transition-all duration-200 ${sidebarOpen ? "w-56" : "w-0"} overflow-hidden`}>
        <div className="w-56 flex flex-col h-full bg-[#111111] border-r border-[#2A2A2A]">
          <div className="flex items-center justify-between px-3 py-3 border-b border-[#2A2A2A]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">Chats</span>
            <button onClick={newSession} className="flex items-center gap-1 text-[10px] text-[#CC1100] hover:underline">
              <Plus className="w-3 h-3" /> Neu
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {loadingSessions ? (
              <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 text-[#555555] animate-spin" /></div>
            ) : sessions.length === 0 ? (
              <p className="text-[11px] text-[#555555] text-center py-6">Noch keine Chats</p>
            ) : sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => openSession(s.id)}
                className={`w-full flex flex-col px-3 py-2.5 text-left hover:bg-[#1A1A1A] transition-colors border-b border-[#1A1A1A] ${s.id === sessionId ? "bg-[#1A1A1A] border-l-2 border-l-[#CC1100]" : ""}`}
              >
                <p className="text-xs text-white truncate">{s.title || "Neuer Chat"}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-[#555555]" />
                  <p className="text-[10px] text-[#555555]">{relativeDay(s.updatedAt)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat-Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-[#2A2A2A] mb-4 shrink-0">
          <button
            onClick={() => { setSidebarOpen((v) => !v); if (!sidebarOpen) loadSessions(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{sidebarOpen ? "Schließen" : `Chats${sessions.length > 0 ? ` (${sessions.length})` : ""}`}</span>
          </button>
          {sessionId && (
            <button onClick={newSession} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> Neuer Chat
            </button>
          )}
          {sessionId && (
            <span className="text-xs text-[#555555] truncate">
              {sessions.find((s) => s.id === sessionId)?.title ?? "Chat"}
            </span>
          )}
        </div>

        {/* Empty State */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center pb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg"
              style={{ background: "var(--gradient-phoenix)", boxShadow: "var(--glow-red)" }}>
              🧠
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Jarvis ist bereit</h2>
            <p className="text-sm text-[#999999] text-center max-w-sm mb-6">
              Stelle eine Aufgabe — Chats werden automatisch gespeichert.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {EXAMPLES.map((p) => (
                <button key={p} onClick={() => sendMessage(p)}
                  className="px-3 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white hover:border-[#CC1100]/30 transition-all text-left">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nachrichten */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto py-2 space-y-6 pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
                {msg.role === "user" ? (
                  <div className="max-w-[80%]">
                    <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#CC1100] text-white text-sm leading-relaxed">
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-[#999999] text-right mt-1 pr-1">{formatTime(msg.timestamp)}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-[#999999] pl-1">Jarvis · {formatTime(msg.timestamp)}</p>
                    {msg.jarvisResponse ? (
                      <JarvisResponseBubble response={msg.jarvisResponse} googleData={msg.googleData} draftData={msg.draftData} />
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-sm text-white leading-relaxed">
                        {msg.content}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: "var(--gradient-phoenix)" }}>🧠</div>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                  <Loader2 className="w-3.5 h-3.5 text-[#CC1100] animate-spin" />
                  <span className="text-xs text-[#999999]">Jarvis koordiniert das Agententeam…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 pt-4">
          <div className="flex items-end gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] focus-within:border-[#CC1100]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mb-0.5" style={{ background: "var(--gradient-phoenix)" }}>🧠</div>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Stelle Jarvis eine Aufgabe… (Enter senden · Shift+Enter neue Zeile)"
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-white placeholder-[#999999] resize-none focus:outline-none min-h-[36px] max-h-40 py-1.5 leading-relaxed disabled:opacity-50"
              style={{ scrollbarWidth: "none" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-white transition-all active:scale-95 shrink-0 disabled:opacity-40"
              style={{ background: input.trim() && !loading ? "var(--gradient-phoenix)" : "#2A2A2A" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-[#999999] mt-1.5">
            Jarvis führt · Agententeam unterstützt · Chats werden gespeichert
          </p>
        </div>
      </div>
    </div>
  );
}
