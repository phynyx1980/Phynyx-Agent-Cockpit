"use client";

import { useMemo } from "react";
import type { Approval } from "@/lib/agents/agent-types";
import { Clock, ShieldAlert, CheckCircle2, RefreshCcw } from "lucide-react";

interface ApprovalStatsProps {
  approvals: Approval[];
}

export function ApprovalStats({ approvals }: ApprovalStatsProps) {
  const stats = useMemo(() => ({
    open:     approvals.filter((a) => a.status === "open").length,
    critical: approvals.filter((a) => a.riskLevel === "critical").length,
    approved: approvals.filter((a) => a.status === "approved").length,
    revised:  approvals.filter((a) => a.status === "revised").length,
  }), [approvals]);

  const items = [
    {
      label: "Offen",
      value: stats.open,
      icon: Clock,
      color: "#C9A84C",
      bg: "#C9A84C12",
      border: stats.open > 0 ? "#C9A84C50" : "#2A2A2A",
      pulse: stats.open > 0,
    },
    {
      label: "Kritisches Risiko",
      value: stats.critical,
      icon: ShieldAlert,
      color: "#FF2020",
      bg: "#CC110012",
      border: stats.critical > 0 ? "#CC1100" : "#2A2A2A",
      pulse: stats.critical > 0,
    },
    {
      label: "Genehmigt",
      value: stats.approved,
      icon: CheckCircle2,
      color: "#22C55E",
      bg: "#22C55E12",
      border: "#22C55E30",
    },
    {
      label: "In Überarbeitung",
      value: stats.revised,
      icon: RefreshCcw,
      color: "#FB923C",
      bg: "#FB923C12",
      border: stats.revised > 0 ? "#FB923C50" : "#2A2A2A",
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
            <p className="text-[11px] mt-1 uppercase tracking-widest text-[#999999]">
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
