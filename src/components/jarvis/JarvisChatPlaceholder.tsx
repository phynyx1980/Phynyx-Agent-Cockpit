"use client";

import { useState } from "react";
import { Send, Users, ShieldCheck, GitBranch, Briefcase } from "lucide-react";

const examplePrompts = [
  { label: "Agententeam anzeigen", prompt: "Jarvis, zeig mir mein Agententeam." },
  { label: "Kundenanfrage", prompt: "Jarvis, ich habe eine neue Kundenanfrage. Wer soll das übernehmen?" },
  { label: "Angebot erstellen", prompt: "Jarvis, erstelle mir eine Angebotsstruktur für einen KI-Chatbot." },
  { label: "Content planen", prompt: "Jarvis, plane mir Content für nächste Woche über KI-Automatisierung." },
  { label: "Tech-Problem melden", prompt: "Jarvis, ich habe ein technisches Problem mit einer API." },
  { label: "Workflow prüfen", prompt: "Jarvis, prüfe diesen Workflow auf Risiken." },
  { label: "Developer-Briefing", prompt: "Jarvis, bereite ein Developer-Briefing für Claude Code vor." },
  { label: "Voice-Konzept", prompt: "Jarvis, erstelle ein Voice-Konzept für spätere Friday-Integration." },
];

const agentPreviews = [
  { emoji: "🧠", name: "Jarvis", color: "#CC1100" },
  { emoji: "📬", name: "Nova", color: "#C9A84C" },
  { emoji: "💼", name: "Vega", color: "#C9A84C" },
  { emoji: "✍️", name: "Lina", color: "#C9A84C" },
  { emoji: "🔒", name: "Nox", color: "#CC1100" },
  { emoji: "⚖️", name: "Kira", color: "#CC1100" },
];

export function JarvisChatPlaceholder() {
  const [input, setInput] = useState("");

  function handleSelectPrompt(prompt: string) {
    setInput(prompt);
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Hero-Bereich */}
      <div className="flex-1 flex flex-col items-center justify-center pb-8 pt-4">
        {/* Jarvis Avatar */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
            style={{
              background: "var(--gradient-phoenix)",
              boxShadow: "var(--glow-red)",
            }}
          >
            🧠
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#22C55E] items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
          </span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Jarvis ist bereit</h2>
        <p className="text-sm text-[#999999] text-center max-w-md mb-8">
          Stelle eine Aufgabe — Jarvis koordiniert das Agententeam, wählt die
          passenden Spezialisten und liefert dir ein strukturiertes Ergebnis.
        </p>

        {/* Aktive Agenten Preview */}
        <div className="flex items-center gap-1.5 mb-8">
          <div className="flex -space-x-2">
            {agentPreviews.map((a) => (
              <div
                key={a.name}
                title={a.name}
                className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] flex items-center justify-center text-sm bg-[#1A1A1A]"
              >
                {a.emoji}
              </div>
            ))}
          </div>
          <span className="ml-2 text-xs text-[#999999]">+ 8 weitere Agenten bereit</span>
        </div>

        {/* Beispiel-Prompts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full mb-8">
          {examplePrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPrompt(p.prompt)}
              className="px-3 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999] hover:text-white hover:border-[#CC1100]/30 hover:bg-[#1A1A1A] transition-all text-left truncate"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Info-Karten */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {[
            { icon: Users, label: "14 Agenten", sub: "aktiv im Team", color: "#CC1100" },
            { icon: GitBranch, label: "3 Tasks", sub: "in Bearbeitung", color: "#C9A84C" },
            { icon: ShieldCheck, label: "2 Freigaben", sub: "warten auf dich", color: "#CC1100" },
            { icon: Briefcase, label: "Mock Modus", sub: "keine Live-Aktionen", color: "#22C55E" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{card.label}</p>
                  <p className="text-[10px] text-[#999999] truncate">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat-Eingabe (Fixiert unten) */}
      <div className="shrink-0 pb-2">
        <div className="flex items-end gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] focus-within:border-[#CC1100]/40 transition-colors">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 mb-0.5"
            style={{ background: "var(--gradient-phoenix)" }}
          >
            🧠
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            }}
            placeholder="Stelle Jarvis eine Aufgabe... (Enter zum Senden, Shift+Enter für neue Zeile)"
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-[#999999] resize-none focus:outline-none min-h-[36px] max-h-40 py-1.5 leading-relaxed"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            className="flex items-center justify-center w-9 h-9 rounded-lg text-white transition-all active:scale-95 shrink-0 disabled:opacity-40"
            style={{ background: input.trim() ? "var(--gradient-phoenix)" : "#2A2A2A" }}
            disabled={!input.trim()}
            title="Senden"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-[#999999] mt-2">
          Jarvis führt · Das Agententeam unterstützt · Phynyx entscheidet
        </p>
      </div>
    </div>
  );
}
