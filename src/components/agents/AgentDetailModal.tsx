"use client";

import type { AgentProfile } from "@/lib/agents/agent-types";
import { X, Shield, Zap, MessageSquare, ArrowRight } from "lucide-react";

interface AgentDetailModalProps {
  agent: AgentProfile;
  onClose: () => void;
}

const statusLabel: Record<string, string> = {
  active:   "Aktiv",
  busy:     "Beschäftigt",
  standby:  "Standby",
  inactive: "Inaktiv",
};

export function AgentDetailModal({ agent, onClose }: AgentDetailModalProps) {
  const isJarvis = agent.id === "jarvis";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-[#111111]"
        style={{
          borderColor: isJarvis ? "#CC1100" : "#2A2A2A",
          boxShadow: isJarvis ? "var(--glow-red)" : "0 25px 50px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent */}
        {isJarvis && (
          <div className="h-0.5 w-full rounded-t-2xl" style={{ background: "var(--gradient-phoenix)" }} />
        )}

        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-[#2A2A2A]">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-xl text-3xl shrink-0"
            style={{
              background: isJarvis ? "var(--gradient-phoenix)" : "#1A1A1A",
              border: isJarvis ? "none" : "1px solid #2A2A2A",
              boxShadow: isJarvis ? "var(--glow-red)" : "none",
            }}
          >
            {agent.emoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              {isJarvis && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#CC1100] text-white">
                  Orchestrator
                </span>
              )}
              <span className="text-xs text-[#999999] px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A]">
                {statusLabel[agent.status]}
              </span>
            </div>
            <p className="text-sm text-[#999999] mt-1">{agent.role}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-[#999999] hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Kernzweck */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#CC1100] font-semibold mb-2">
              Kernzweck
            </p>
            <p className="text-sm text-white leading-relaxed">{agent.corePurpose}</p>
          </div>

          {/* Capabilities Row */}
          <div className="flex flex-wrap gap-2">
            {agent.canBeDirectlyMessaged && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CC1100]/10 border border-[#CC1100]/20 text-xs text-[#CC1100] font-medium">
                <MessageSquare className="w-3 h-3" /> Direkt ansprechbar
              </span>
            )}
            {agent.canBeAutoActivatedByJarvis && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-xs text-[#C9A84C] font-medium">
                <Zap className="w-3 h-3" /> Jarvis-Auto-Aktivierung
              </span>
            )}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#999999]">
              <Shield className="w-3 h-3" /> Risiko: {agent.riskLevel}
            </span>
          </div>

          {/* Two Column: Responsibilities + Boundaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#C9A84C] font-semibold mb-2">
                Hauptaufgaben
              </p>
              <ul className="space-y-1.5">
                {agent.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-[#cccccc]">
                    <ArrowRight className="w-3 h-3 text-[#C9A84C] mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#999999] font-semibold mb-2">
                Grenzen
              </p>
              <ul className="space-y-1.5">
                {agent.boundaries.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-[#999999]">
                    <span className="text-[#2A2A2A] mt-0.5 shrink-0 font-bold">—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Typische Outputs */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999999] font-semibold mb-2">
              Typische Outputs
            </p>
            <div className="flex flex-wrap gap-2">
              {agent.typicalOutputs.map((o) => (
                <span
                  key={o}
                  className="px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#cccccc]"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>

          {/* Handoff Logic */}
          {Object.keys(agent.handoffLogic).length > 0 && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#999999] font-semibold mb-2">
                Übergabe-Logik
              </p>
              <div className="space-y-1.5">
                {Object.entries(agent.handoffLogic).map(([intent, targets]) => (
                  <div key={intent} className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#999999] font-mono">
                      {intent}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#2A2A2A] shrink-0" />
                    <span className="text-[#cccccc]">{(targets as string[]).join(", ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#2A2A2A]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#999999] bg-[#1A1A1A] border border-[#2A2A2A] hover:text-white transition-colors"
          >
            Schließen
          </button>
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "var(--gradient-phoenix)" }}
          >
            {isJarvis ? "Jarvis befragen" : `${agent.name} über Jarvis aktivieren`}
          </button>
        </div>
      </div>
    </div>
  );
}
