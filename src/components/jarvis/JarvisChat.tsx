"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, ShieldCheck, ChevronRight, Loader2,
  Mail, Calendar, CheckSquare, HardDrive, ExternalLink,
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

// ── Typen ─────────────────────────────────────────────────────────────────────

interface GoogleData {
  gmail?:    GmailMessage[];
  calendar?: CalendarEvent[];
  tasks?:    GoogleTask[];
  drive?:    DriveFile[];
}

interface ChatMessage {
  id:             string;
  role:           "user" | "jarvis";
  content:        string;
  jarvisResponse?: JarvisResponse;
  googleData?:    GoogleData;
  timestamp:      Date;
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

function formatTime(date: Date) {
  return date.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("de-AT", {
      weekday: "short", day: "2-digit", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

// ── Rich Google-Content direkt im Chat ───────────────────────────────────────

function GmailBlock({ messages }: { messages: GmailMessage[] }) {
  if (!messages.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <Mail className="w-3.5 h-3.5 text-[#CC1100]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
          Gmail · {messages.length} Mails
        </span>
        {messages.filter(m => m.unread).length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#CC1100] text-white text-[10px] font-bold">
            {messages.filter(m => m.unread).length} ungelesen
          </span>
        )}
      </div>
      {messages.map((mail) => (
        <div key={mail.id} className="flex items-start gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0F0F0F] transition-colors">
          {mail.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#CC1100] mt-1.5 shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className={`text-xs truncate ${mail.unread ? "text-white font-semibold" : "text-[#cccccc]"}`}>
              {mail.subject}
            </p>
            <p className="text-[10px] text-[#999999] truncate mt-0.5">
              {mail.from.split("<")[0].trim()}
            </p>
            <p className="text-[10px] text-[#555555] line-clamp-1 mt-0.5">{mail.snippet}</p>
          </div>
        </div>
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
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
          Kalender · {events.length} Termine
        </span>
      </div>
      {events.map((event) => (
        <div key={event.id} className="flex items-start gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0F0F0F] transition-colors">
          <div className="w-1 self-stretch rounded-full bg-[#C9A84C] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{event.title}</p>
            <p className="text-[10px] text-[#C9A84C] mt-0.5">{formatDate(event.start)}</p>
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
  const open = tasks.filter(t => !t.completed);
  if (!open.length) return null;
  return (
    <div className="rounded-xl border border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111111] border-b border-[#2A2A2A]">
        <CheckSquare className="w-3.5 h-3.5 text-[#22C55E]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
          Tasks · {open.length} offen
        </span>
      </div>
      {open.map((task) => (
        <div key={task.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0">
          <div className="w-3 h-3 rounded-full border border-[#2A2A2A] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{task.title}</p>
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
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">
          Drive · {files.length} Einträge
        </span>
      </div>
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-3 px-3 py-2.5 border-b border-[#1A1A1A] last:border-0 hover:bg-[#0F0F0F]">
          <span className="text-sm shrink-0">{file.isFolder ? "📁" : "📄"}</span>
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

// ── Agent-Aktivierungs-Bar ────────────────────────────────────────────────────

function AgentActivationBar({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-[#999999] uppercase tracking-[0.1em]">Aktiviert:</span>
      {agentIds.map((id) => {
        const agent = getAgentById(id);
        return (
          <span key={id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#cccccc]">
            <span>{agent?.emoji ?? "🤖"}</span>
            <span>{agent?.name ?? id}</span>
          </span>
        );
      })}
    </div>
  );
}

// ── Jarvis Response Bubble ────────────────────────────────────────────────────

function JarvisResponseBubble({ response, googleData }: { response: JarvisResponse; googleData?: GoogleData }) {
  const [showAll, setShowAll] = useState(false);
  const visibleResults = showAll ? response.results : response.results.slice(0, 3);

  return (
    <div className="space-y-3">
      <AgentActivationBar agentIds={response.activatedAgents} />

      {/* Jarvis Summary */}
      <div
        className="px-4 py-3 rounded-xl border text-sm text-white leading-relaxed"
        style={{ background: "linear-gradient(135deg, #1A0A0A 0%, #1A1A1A 100%)", borderColor: "#CC1100", boxShadow: "0 0 15px rgba(204,17,0,0.06)" }}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">🧠</span>
          <p
            className="text-[13px] leading-relaxed text-[#e0e0e0]"
            dangerouslySetInnerHTML={{
              __html: response.summary
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/⚠️/g, '<span class="text-[#C9A84C]">⚠️</span>')
                .replace(/✅/g, '<span class="text-[#22C55E]">✅</span>'),
            }}
          />
        </div>
      </div>

      {/* Google Rich Content direkt im Chat */}
      {googleData?.gmail    && googleData.gmail.length    > 0 && <GmailBlock    messages={googleData.gmail} />}
      {googleData?.calendar && googleData.calendar.length > 0 && <CalendarBlock events={googleData.calendar} />}
      {googleData?.tasks    && googleData.tasks.length    > 0 && <TasksBlock    tasks={googleData.tasks} />}
      {googleData?.drive    && googleData.drive.length    > 0 && <DriveBlock    files={googleData.drive} />}

      {/* Freigabe-Banner */}
      {response.approvalRequired && response.approvals.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#CC1100]/40 bg-[#CC1100]/8">
          <ShieldCheck className="w-4 h-4 text-[#CC1100] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white">Freigabe erforderlich</p>
            <p className="text-xs text-[#999999] mt-0.5">{response.approvals[0].description}</p>
          </div>
          <span className="px-2 py-1 rounded bg-[#CC1100] text-[10px] font-bold text-white shrink-0">{response.approvals.length}</span>
        </div>
      )}

      {/* Agenten-Ergebnisse */}
      {visibleResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold">Agentenergebnisse</p>
          {visibleResults.map((result) => <AgentResultCard key={result.id} result={result} />)}
          {!showAll && response.results.length > 3 && (
            <button onClick={() => setShowAll(true)} className="flex items-center gap-1.5 text-xs text-[#CC1100] hover:underline">
              <ChevronRight className="w-3 h-3" />
              {response.results.length - 3} weitere anzeigen
            </button>
          )}
        </div>
      )}

      {/* Nächste Schritte */}
      {response.nextSteps.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#C9A84C] font-semibold mb-2">Nächste Schritte</p>
          <ul className="space-y-1.5">
            {response.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#cccccc]">
                <span className="text-[#C9A84C] font-bold shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Beispiel-Prompts ──────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "Zeig mir meine ungelesenen Mails",
  "Was habe ich heute im Kalender?",
  "Neue Kundenanfrage von einem KMU aus Wien",
  "Erstelle Angebotsstruktur für KI-Chatbot",
  "Plane Content für nächste Woche",
  "Welche Drive-Dateien habe ich zuletzt geändert?",
  "Prüfe diesen Workflow auf Risiken",
  "Developer-Briefing für neue API-Integration",
];

// ── Haupt-Komponente ──────────────────────────────────────────────────────────

export function JarvisChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, {
      id: Math.random().toString(36).slice(2),
      role: "user", content: text.trim(), timestamp: new Date(),
    }]);
    setInput("");
    setLoading(true);

    try {
      const route           = detectIntent(text.trim());
      const intent          = route.intent;
      const activatedAgents = getAllAgentsForIntent(intent);
      const handoff         = getHandoffEntry(intent);

      const res = await fetch("/api/jarvis/chat", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ message: text.trim(), intent, activatedAgents }),
      });

      if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);

      const json       = await res.json();
      const data       = json.data;
      const googleData = json.googleData as GoogleData | undefined;
      const taskId     = Math.random().toString(36).slice(2);

      const results: AgentResult[] = (data.agentResults ?? []).map((r: {
        agentId: string; summary: string; details: string;
        suggestedActions: string[]; risks: string[];
      }, i: number) => ({
        id: `r-${i}`, taskId, agentId: r.agentId, status: "done" as const,
        summary: r.summary, details: r.details,
        suggestedActions: r.suggestedActions ?? [],
        risks: r.risks ?? [],
        createdAt: new Date().toISOString(),
      }));

      const approvals: Approval[] = (data.requiresApproval ?? handoff.requiresApproval) ? [{
        id: `apr-${taskId}`, taskId,
        title: `Freigabe: ${intent.replace(/_/g, " ")}`,
        description: handoff.approvalReason ?? "Diese Aktion erfordert deine Freigabe.",
        actionType: "trigger_external_api",
        riskLevel: handoff.priority === "urgent" ? "critical" : handoff.priority === "high" ? "high" : "medium",
        status: "open", involvedAgents: activatedAgents,
        createdAt: new Date().toISOString(),
      }] : [];

      const response: JarvisResponse = {
        taskId, intent, activatedAgents,
        summary:         data.summary ?? "Jarvis hat die Aufgabe bearbeitet.",
        results,
        approvalRequired: approvals.length > 0,
        approvals,
        logs: [],
        nextSteps: data.nextSteps ?? [],
      };

      setMessages((prev) => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: "jarvis", content: response.summary,
        jarvisResponse: response, googleData,
        timestamp: new Date(),
      }]);

    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Math.random().toString(36).slice(2),
        role: "jarvis",
        content: "Entschuldigung — Jarvis konnte die Anfrage nicht verarbeiten. Bitte prüfe den OpenAI API Key in .env.local.",
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
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center pb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg"
            style={{ background: "var(--gradient-phoenix)", boxShadow: "var(--glow-red)" }}>
            🧠
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Jarvis ist bereit</h2>
          <p className="text-sm text-[#999999] text-center max-w-sm mb-6">
            Stelle eine Aufgabe — ich koordiniere das Agententeam und liefere direkt nutzbare Ergebnisse.
          </p>
          <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
            {EXAMPLE_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)}
                className="px-3 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white hover:border-[#CC1100]/30 transition-all text-left">
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
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
                    <JarvisResponseBubble response={msg.jarvisResponse} googleData={msg.googleData} />
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-sm text-white">
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
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white transition-all active:scale-95 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !loading ? "var(--gradient-phoenix)" : "#2A2A2A" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-[#999999] mt-1.5">
          Jarvis führt · Das Agententeam unterstützt · Phynyx entscheidet
        </p>
      </div>
    </div>
  );
}
