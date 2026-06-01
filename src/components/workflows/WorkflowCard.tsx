"use client";

import { useState } from "react";
import type { AgentTask, WorkflowLog } from "@/lib/agents/agent-types";
import { getAgentById } from "@/lib/agents/agent-registry";
import {
  Clock,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface WorkflowCardProps {
  task: AgentTask;
  logs?: WorkflowLog[];
}

const statusConfig = {
  pending:          { label: "Wartend",         icon: Clock,        color: "#999999", bg: "#99999915" },
  routing:          { label: "Routing",          icon: Loader2,      color: "#C9A84C", bg: "#C9A84C15" },
  in_progress:      { label: "In Bearbeitung",   icon: Loader2,      color: "#C9A84C", bg: "#C9A84C15" },
  awaiting_approval:{ label: "Freigabe nötig",   icon: ShieldCheck,  color: "#CC1100", bg: "#CC110015" },
  completed:        { label: "Abgeschlossen",    icon: CheckCircle,  color: "#22C55E", bg: "#22C55E15" },
  failed:           { label: "Fehlgeschlagen",   icon: XCircle,      color: "#CC1100", bg: "#CC110015" },
  cancelled:        { label: "Abgebrochen",      icon: XCircle,      color: "#999999", bg: "#99999915" },
};

const priorityConfig = {
  low:    { label: "Niedrig", color: "#999999" },
  medium: { label: "Mittel",  color: "#C9A84C" },
  high:   { label: "Hoch",    color: "#CC1100" },
  urgent: { label: "Urgent",  color: "#FF2020" },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

const logEventLabel: Record<string, string> = {
  task_created:       "Aufgabe erstellt",
  agent_activated:    "Agent aktiviert",
  agent_result:       "Ergebnis eingegangen",
  approval_requested: "Freigabe angefordert",
  approval_resolved:  "Freigabe erteilt",
  task_completed:     "Abgeschlossen",
  task_failed:        "Fehlgeschlagen",
};

export function WorkflowCard({ task, logs = [] }: WorkflowCardProps) {
  const [showLogs, setShowLogs] = useState(false);
  const cfg = statusConfig[task.status];
  const Icon = cfg.icon;
  const prio = priorityConfig[task.priority];
  const isAnimated = task.status === "in_progress" || task.status === "routing";

  return (
    <div
      className="rounded-xl border bg-[#1A1A1A] overflow-hidden transition-all"
      style={{
        borderColor: task.status === "awaiting_approval" ? "#CC1100" :
                     task.status === "completed"         ? "#22C55E20" : "#2A2A2A",
      }}
    >
      {/* Priority bar */}
      <div
        className="h-0.5 w-full"
        style={{ backgroundColor: prio.color }}
      />

      {/* Header */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: cfg.bg }}
          >
            <Icon
              className={`w-4 h-4 ${isAnimated ? "animate-spin" : ""}`}
              style={{ color: cfg.color }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {cfg.label}
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                style={{ borderColor: `${prio.color}40`, color: prio.color }}
              >
                {prio.label}
              </span>
              {task.requiresApproval && task.status === "awaiting_approval" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#CC1100] text-white">
                  Freigabe
                </span>
              )}
            </div>
            <p className="text-sm text-white mt-1.5 leading-relaxed line-clamp-2">
              {task.userMessage}
            </p>
          </div>
        </div>

        {/* Result Summary */}
        {task.resultSummary && (
          <div className="px-3 py-2.5 rounded-lg bg-[#111111] border border-[#2A2A2A]">
            <p className="text-xs text-[#cccccc] leading-relaxed">{task.resultSummary}</p>
          </div>
        )}

        {/* Agents + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {task.assignedAgents.slice(0, 5).map((id) => {
              const agent = getAgentById(id);
              return (
                <span
                  key={id}
                  title={agent?.name ?? id}
                  className="w-7 h-7 rounded-full bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-sm -ml-1 first:ml-0"
                >
                  {agent?.emoji ?? "🤖"}
                </span>
              );
            })}
            {task.assignedAgents.length > 5 && (
              <span className="w-7 h-7 rounded-full bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-[10px] text-[#999999] -ml-1">
                +{task.assignedAgents.length - 5}
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#999999]">
            {relativeTime(task.updatedAt)}
          </span>
        </div>
      </div>

      {/* Log Toggle */}
      {logs.length > 0 && (
        <>
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-[#2A2A2A] text-xs text-[#999999] hover:text-white hover:bg-[#111111] transition-colors"
          >
            {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showLogs ? "Logs ausblenden" : `${logs.length} Workflow-Ereignisse anzeigen`}
          </button>

          {showLogs && (
            <div className="px-4 pb-4 border-t border-[#2A2A2A] pt-3 space-y-2">
              {logs.map((log) => {
                const agent = log.agentId ? getAgentById(log.agentId) : null;
                return (
                  <div key={log.id} className="flex items-start gap-2.5 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-base leading-none">
                        {agent?.emoji ?? "🧠"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[#C9A84C] font-medium">
                        {logEventLabel[log.eventType] ?? log.eventType}
                      </span>
                      <span className="text-[#999999] mx-1">·</span>
                      <span className="text-[#cccccc]">{log.message}</span>
                    </div>
                    <span className="text-[#999999] shrink-0 text-[10px]">
                      {relativeTime(log.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
