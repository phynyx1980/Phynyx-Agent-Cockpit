"use client";

import { useState } from "react";
import type { AgentProfile } from "@/lib/agents/agent-types";
import { Shield, Zap, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface AgentCardProps {
  agent: AgentProfile;
  onSelect?: (agent: AgentProfile) => void;
}

const statusConfig = {
  active:   { label: "Aktiv",    dot: "#22C55E", bg: "#22C55E15", text: "#22C55E" },
  busy:     { label: "Beschäftigt", dot: "#C9A84C", bg: "#C9A84C15", text: "#C9A84C" },
  standby:  { label: "Standby",  dot: "#999999", bg: "#99999915", text: "#999999" },
  inactive: { label: "Inaktiv", dot: "#CC1100", bg: "#CC110015", text: "#CC1100" },
};

const riskBadge = {
  low:      { label: "Niedrig",   color: "#22C55E" },
  medium:   { label: "Mittel",    color: "#C9A84C" },
  high:     { label: "Hoch",      color: "#CC1100" },
  critical: { label: "Kritisch",  color: "#FF2020" },
};

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isJarvis = agent.id === "jarvis";
  const status = statusConfig[agent.status];
  const risk = riskBadge[agent.riskLevel];

  return (
    <div
      className={[
        "relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden",
        isJarvis
          ? "border-[#CC1100]/40 bg-gradient-to-b from-[#1A0A0A] to-[#1A1A1A]"
          : "border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#CC1100]/20",
        !agent.enabled ? "opacity-50" : "",
      ].join(" ")}
      style={isJarvis ? { boxShadow: "0 0 30px rgba(204,17,0,0.08)" } : {}}
    >
      {/* Jarvis-Badge */}
      {isJarvis && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "var(--gradient-phoenix)" }}
        />
      )}

      {/* Card Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Emoji Avatar */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
          style={{
            background: isJarvis ? "var(--gradient-phoenix)" : "#111111",
            border: `1px solid ${isJarvis ? "transparent" : "#2A2A2A"}`,
            boxShadow: isJarvis ? "var(--glow-red)" : "none",
          }}
        >
          {agent.emoji}
        </div>

        {/* Name + Role */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-white">{agent.name}</h3>
            {isJarvis && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#CC1100] text-white">
                Orchestrator
              </span>
            )}
            {/* Status Badge */}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: status.bg, color: status.text }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: status.dot }}
              />
              {status.label}
            </span>
          </div>
          <p className="text-[11px] text-[#999999] mt-0.5 leading-relaxed line-clamp-2">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Core Purpose */}
      <div className="px-4 pb-3">
        <p className="text-xs text-[#cccccc] leading-relaxed">{agent.corePurpose}</p>
      </div>

      {/* Capability Badges */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {agent.canBeDirectlyMessaged && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#CC1100]/10 border border-[#CC1100]/20 text-[10px] text-[#CC1100] font-medium">
            <MessageSquare className="w-2.5 h-2.5" />
            Direkt ansprechbar
          </span>
        )}
        {agent.canBeAutoActivatedByJarvis && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[10px] text-[#C9A84C] font-medium">
            <Zap className="w-2.5 h-2.5" />
            Jarvis-Auto
          </span>
        )}
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
          style={{
            backgroundColor: `${risk.color}10`,
            border: `1px solid ${risk.color}30`,
            color: risk.color,
          }}
        >
          <Shield className="w-2.5 h-2.5" />
          Risiko: {risk.label}
        </span>
      </div>

      {/* Expandable Details */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3 border-t border-[#2A2A2A] pt-3">
          {/* Hauptaufgaben */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold mb-1.5">
              Hauptaufgaben
            </p>
            <ul className="space-y-1">
              {agent.responsibilities.slice(0, 4).map((r) => (
                <li key={r} className="flex items-start gap-1.5 text-xs text-[#cccccc]">
                  <span className="text-[#CC1100] mt-0.5 shrink-0">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Grenzen */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold mb-1.5">
              Grenzen
            </p>
            <ul className="space-y-1">
              {agent.boundaries.slice(0, 3).map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-xs text-[#999999]">
                  <span className="text-[#2A2A2A] mt-0.5 shrink-0">—</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Typische Outputs */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-[#999999] font-semibold mb-1.5">
              Typische Outputs
            </p>
            <div className="flex flex-wrap gap-1">
              {agent.typicalOutputs.map((o) => (
                <span
                  key={o}
                  className="px-2 py-0.5 rounded bg-[#111111] border border-[#2A2A2A] text-[10px] text-[#999999]"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#2A2A2A] mt-auto">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-[#999999] hover:text-white transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Weniger
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> Details
            </>
          )}
        </button>
        <div className="flex-1" />
        {onSelect && (
          <button
            onClick={() => onSelect(agent)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: isJarvis ? "var(--gradient-phoenix)" : "#CC1100" }}
          >
            Aktivieren
          </button>
        )}
      </div>
    </div>
  );
}
