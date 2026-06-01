"use client";

import { useMemo } from "react";
import type { AgentTask } from "@/lib/agents/agent-types";
import { Activity, ShieldAlert, CheckCircle2, LayoutList } from "lucide-react";

interface WorkflowStatsProps {
  tasks: AgentTask[];
}

export function WorkflowStats({ tasks }: WorkflowStatsProps) {
  const stats = useMemo(() => {
    const active = tasks.filter(
      (t) => t.status === "in_progress" || t.status === "routing"
    ).length;
    const pending = tasks.filter((t) => t.status === "awaiting_approval").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const total = tasks.length;
    return { active, pending, completed, total };
  }, [tasks]);

  const items = [
    {
      label: "Aktive Tasks",
      value: stats.active,
      icon: Activity,
      color: "#C9A84C",
      bg: "#C9A84C12",
      border: "#C9A84C30",
    },
    {
      label: "Freigabe ausstehend",
      value: stats.pending,
      icon: ShieldAlert,
      color: "#CC1100",
      bg: "#CC110012",
      border: stats.pending > 0 ? "#CC1100" : "#CC110030",
      pulse: stats.pending > 0,
    },
    {
      label: "Abgeschlossen",
      value: stats.completed,
      icon: CheckCircle2,
      color: "#22C55E",
      bg: "#22C55E12",
      border: "#22C55E30",
    },
    {
      label: "Gesamt",
      value: stats.total,
      icon: LayoutList,
      color: "#999999",
      bg: "#99999912",
      border: "#2A2A2A",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(({ label, value, icon: Icon, color, bg, border, pulse }) => (
        <div
          key={label}
          className="rounded-xl p-4 flex items-center gap-3 relative overflow-hidden"
          style={{ backgroundColor: bg, border: `1px solid ${border}` }}
        >
          {pulse && (
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: color }}
            />
          )}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white leading-none">{value}</p>
            <p className="text-[11px] mt-1 uppercase tracking-widest" style={{ color: "#999999" }}>
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
