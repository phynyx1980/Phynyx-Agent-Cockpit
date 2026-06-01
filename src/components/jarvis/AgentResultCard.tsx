"use client";

import { useState } from "react";
import type { AgentResult } from "@/lib/agents/agent-types";
import { getAgentById } from "@/lib/agents/agent-registry";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface AgentResultCardProps {
  result: AgentResult;
}

export function AgentResultCard({ result }: AgentResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const agent = getAgentById(result.agentId);
  const hasRisks = result.risks.length > 0;

  return (
    <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1A] transition-colors text-left"
      >
        <span className="text-lg shrink-0">{agent?.emoji ?? "🤖"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">{agent?.name ?? result.agentId}</span>
            {hasRisks ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#CC1100]/15 text-[#CC1100] text-[10px] font-medium">
                <AlertTriangle className="w-2.5 h-2.5" />
                {result.risks.length} Risiko{result.risks.length > 1 ? "en" : ""}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-medium">
                <CheckCircle className="w-2.5 h-2.5" />
                OK
              </span>
            )}
          </div>
          <p className="text-xs text-[#999999] mt-0.5 truncate">{result.summary}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#999999] shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#999999] shrink-0" />
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2A2A2A] pt-3">
          {/* Details */}
          <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-line">
            {result.details}
          </p>

          {/* Suggested Actions */}
          {result.suggestedActions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#C9A84C] font-semibold mb-1.5">
                Empfohlene Schritte
              </p>
              <ul className="space-y-1">
                {result.suggestedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#cccccc]">
                    <ArrowRight className="w-3 h-3 text-[#C9A84C] mt-0.5 shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {hasRisks && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.1em] text-[#CC1100] font-semibold mb-1.5">
                Risiko-Hinweise
              </p>
              <ul className="space-y-1">
                {result.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#CC1100]">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
