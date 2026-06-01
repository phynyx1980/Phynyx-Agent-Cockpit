"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ShieldCheck, ChevronRight, Loader2 } from "lucide-react";
import { detectIntent } from "@/lib/agents/intent-router";
import { getAllAgentsForIntent, getHandoffEntry } from "@/lib/agents/handoff-matrix";
import { getAgentById } from "@/lib/agents/agent-registry";
import type { JarvisResponse, AgentResult, Approval } from "@/lib/agents/agent-types";
import { AgentResultCard } from "./AgentResultCard";

interface ChatMessage {
  id: string;
  role: "user" | "jarvis";
  content: string;
  jarvisResponse?: JarvisResponse;
  timestamp: Date;
}

const EXAMPLE_PROMPTS = [
  "Jarvis, zeig mir mein Agententeam.",
  "Jarvis, ich habe eine neue Kundenanfrage. Wer soll das übernehmen?",
  "Jarvis, erstelle mir eine Angebotsstruktur für einen KI-Chatbot.",
  "Jarvis, plane mir Content für nächste Woche über KI-Automatisierung.",
  "Jarvis, ich habe ein technisches Problem mit einer API.",
  "Jarvis, prüfe diesen Workflow auf Risiken.",
  "Jarvis, bereite ein Developer-Briefing für Claude Code vor.",
  "Jarvis, erstelle ein Voice-Konzept für spätere Friday-Integration.",
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
}

function AgentActivationBar({ agentIds }: { agentIds: string[] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] text-[#999999] uppercase tracking-[0.1em]">Aktiviert:</span>
      {agentIds.map((id) => {
        const agent = getAgentById(id);
        return (
          <span
            key={id}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[10px] text-[#cccccc]"
          >
            <span>{agent?.emoji ?? "🤖"}</span>
            <span>{agent?.name ?? id}</span>
          </span>
        );
      })}
    </div>
  );
}

function JarvisResponseBubble({ response }: { response: JarvisResponse }) {
  const [showAll, setShowAll] = useState(false);
  const visibleResults = showAll ? response.results : response.results.slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Agenten-Bar */}
      <AgentActivationBar agentIds={response.activatedAgents} />

      {/* Jarvis-Summary */}
      <div
        className="px-4 py-3 rounded-xl border text-sm text-white leading-relaxed"
        style={{
          background: "linear-gradient(135deg, #1A0A0A 0%, #1A1A1A 100%)",
          borderColor: "#CC1100",
          boxShadow: "0 0 15px rgba(204,17,0,0.06)",
        }}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg shrink-0 mt-0.5">🧠</span>
          <p className="text-[13px] leading-relaxed text-[#e0e0e0]"
            dangerouslySetInnerHTML={{
              __html: response.summary
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
                .replace(/⚠️/g, '<span class="text-[#C9A84C]">⚠️</span>')
                .replace(/✅/g, '<span class="text-[#22C55E]">✅</span>')
                .replace(/🔒/g, '<span class="text-[#CC1100]">🔒</span>'),
            }}
          />
        </div>
      </div>

      {/* Freigabe-Banner */}
      {response.approvalRequired && response.approvals.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#CC1100]/40 bg-[#CC1100]/8">
          <ShieldCheck className="w-4 h-4 text-[#CC1100] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white">
              Freigabe erforderlich
            </p>
            <p className="text-xs text-[#999999] mt-0.5">
              {response.approvals[0].description}
            </p>
          </div>
          <span className="px-2 py-1 rounded bg-[#CC1100] text-[10px] font-bold text-white shrink-0">
            {response.approvals.length}
          </span>
        </div>
      )}

      {/* Agenten-Ergebnisse */}
      {visibleResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold">
            Agentenergebnisse
          </p>
          {visibleResults.map((result) => (
            <AgentResultCard key={result.id} result={result} />
          ))}
          {!showAll && response.results.length > 3 && (
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center gap-1.5 text-xs text-[#CC1100] hover:underline"
            >
              <ChevronRight className="w-3 h-3" />
              {response.results.length - 3} weitere Agentenergebnisse anzeigen
            </button>
          )}
        </div>
      )}

      {/* Nächste Schritte */}
      {response.nextSteps.length > 0 && (
        <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#C9A84C] font-semibold mb-2">
            Nächste Schritte
          </p>
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

export function JarvisChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate Jarvis processing delay for realism
    setTimeout(() => {
      const response = runJarvisOrchestrator(text.trim());
      const jarvisMsg: ChatMessage = {
        id: Math.random().toString(36).slice(2),
        role: "jarvis",
        content: response.summary,
        jarvisResponse: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, jarvisMsg]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Empty State */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center pb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg"
            style={{
              background: "var(--gradient-phoenix)",
              boxShadow: "var(--glow-red)",
            }}
          >
            🧠
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Jarvis ist bereit</h2>
          <p className="text-sm text-[#999999] text-center max-w-sm mb-6">
            Stelle eine Aufgabe — ich koordiniere das Agententeam und liefere
            strukturierte Ergebnisse.
          </p>
          <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
            {EXAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="px-3 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white hover:border-[#CC1100]/30 transition-all text-left"
              >
                {p.replace("Jarvis, ", "")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat History */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {messages.map((msg) => (
            <div key={msg.id} className={msg.role === "user" ? "flex justify-end" : "flex flex-col gap-2"}>
              {msg.role === "user" ? (
                <div className="max-w-[80%]">
                  <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#CC1100] text-white text-sm leading-relaxed">
                    {msg.content}
                  </div>
                  <p className="text-[10px] text-[#999999] text-right mt-1 pr-1">
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-[#999999] pl-1">
                    Jarvis · {formatTime(msg.timestamp)}
                  </p>
                  {msg.jarvisResponse ? (
                    <JarvisResponseBubble response={msg.jarvisResponse} />
                  ) : (
                    <div className="px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] text-sm text-white">
                      {msg.content}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: "var(--gradient-phoenix)" }}
              >
                🧠
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                <Loader2 className="w-3.5 h-3.5 text-[#CC1100] animate-spin" />
                <span className="text-xs text-[#999999]">Jarvis koordiniert das Agententeam…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 pt-4">
        <div className="flex items-end gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] focus-within:border-[#CC1100]/40 transition-colors">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mb-0.5"
            style={{ background: "var(--gradient-phoenix)" }}
          >
            🧠
          </div>
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
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-[#999999] mt-1.5">
          Jarvis führt · Das Agententeam unterstützt · Phynyx entscheidet
        </p>
      </div>
    </div>
  );
}
