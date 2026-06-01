"use client";

import type { Approval, RiskLevel, ApprovalStatus, ActionType } from "@/lib/agents/agent-types";
import { getAgentById } from "@/lib/agents/agent-registry";
import {
  Clock, CheckCircle2, RefreshCcw, XCircle, MinusCircle,
  Mail, Share2, FileText, Zap, CalendarPlus, BadgeCheck,
  Trash2, Database, PenLine, Bot,
} from "lucide-react";

// ── ELARA Design-Spec ──────────────────────────────────────────────

const riskConfig: Record<RiskLevel, { label: string; color: string; border: string; bg: string; glow?: string }> = {
  critical: { label: "Kritisch",  color: "#FF2020", border: "#CC1100", bg: "#8B000030", glow: "0 0 12px rgba(204,17,0,0.35)" },
  high:     { label: "Hoch",      color: "#FB923C", border: "#EA580C", bg: "#7C2D1230" },
  medium:   { label: "Mittel",    color: "#D4AF37", border: "#C9A84C", bg: "#713F1230" },
  low:      { label: "Niedrig",   color: "#22C55E", border: "#16A34A", bg: "#14532D30" },
};

const statusConfig: Record<ApprovalStatus, { label: string; color: string; Icon: React.ElementType }> = {
  open:     { label: "AUSSTEHEND",     color: "#C9A84C", Icon: Clock },
  approved: { label: "GENEHMIGT",      color: "#22C55E", Icon: CheckCircle2 },
  revised:  { label: "ÜBERARBEITUNG",  color: "#FB923C", Icon: RefreshCcw },
  rejected: { label: "ABGELEHNT",      color: "#CC1100", Icon: XCircle },
  deferred: { label: "ZURÜCKGESTELLT", color: "#9CA3AF", Icon: MinusCircle },
};

const actionIcons: Record<ActionType, React.ElementType> = {
  send_email:           Mail,
  post_social:          Share2,
  send_offer:           FileText,
  trigger_external_api: Zap,
  book_appointment:     CalendarPlus,
  confirm_price:        BadgeCheck,
  delete_file:          Trash2,
  database_migration:   Database,
  create_draft:         PenLine,
  activate_agent:       Bot,
  friday_integration:   Zap,
  internal_analysis:    FileText,
  modify_customer_data: Database,
};

// ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

interface ApprovalCardProps {
  approval: Approval;
  onApprove?: (id: string) => void;
  onReject?:  (id: string) => void;
  onDefer?:   (id: string) => void;
}

export function ApprovalCard({ approval, onApprove, onReject, onDefer }: ApprovalCardProps) {
  const risk   = riskConfig[approval.riskLevel];
  const status = statusConfig[approval.status];
  const StatusIcon = status.Icon;
  const ActionIcon = actionIcons[approval.actionType] ?? FileText;

  const isDone    = ["approved", "rejected", "deferred"].includes(approval.status);
  const isActive  = approval.status === "open" || approval.status === "revised";

  return (
    <div
      className="rounded-xl bg-[#1A1A1A] overflow-hidden transition-all"
      style={{
        borderLeft: `4px solid ${isDone ? `${risk.border}80` : risk.border}`,
        border: `1px solid #2A2A2A`,
        borderLeftWidth: "4px",
        borderLeftColor: isDone ? `${risk.border}80` : risk.border,
        boxShadow: !isDone && risk.glow ? risk.glow : undefined,
      }}
    >
      {/* Header */}
      <div className="p-4 space-y-3">
        {/* Top row: Action Icon + Title + Status */}
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${risk.color}18` }}
          >
            <ActionIcon className="w-4 h-4" style={{ color: risk.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Risk Badge */}
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: risk.bg, color: risk.color, border: `1px solid ${risk.border}50` }}
              >
                {risk.label}
              </span>
              {/* Status Badge */}
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${status.color}15`, color: status.color }}
              >
                <StatusIcon className="w-2.5 h-2.5" />
                {status.label}
              </span>
            </div>
            <p className="text-sm font-medium text-white mt-1.5 leading-snug">
              {approval.title}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#999999] leading-relaxed">{approval.description}</p>

        {/* Notes */}
        {approval.notes && (
          <div className="px-3 py-2 rounded-lg bg-[#111111] border border-[#2A2A2A]">
            <p className="text-[11px] text-[#C9A84C] leading-relaxed">{approval.notes}</p>
          </div>
        )}

        {/* Agents + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {approval.involvedAgents.slice(0, 5).map((id) => {
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
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#999999]">{relativeTime(approval.createdAt)}</p>
            {approval.approvedAt && (
              <p className="text-[10px] text-[#22C55E]">
                Erledigt {relativeTime(approval.approvedAt)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons – nur bei open / revised */}
      {isActive && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#2A2A2A] bg-[#111111]">
          {/* Genehmigen */}
          <button
            onClick={() => onApprove?.(approval.id)}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
            style={{
              backgroundColor: "#CC1100",
              boxShadow: "0 0 0 0 rgba(204,17,0,0)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 12px rgba(204,17,0,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 0 0 rgba(204,17,0,0)";
            }}
          >
            Genehmigen
          </button>

          {/* Zurückstellen */}
          <button
            onClick={() => onDefer?.(approval.id)}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
          >
            Zurückstellen
          </button>

          {/* Ablehnen */}
          <button
            onClick={() => onReject?.(approval.id)}
            className="px-4 py-2 rounded-lg text-xs font-medium border transition-all"
            style={{ borderColor: "#2A2A2A", color: "#9CA3AF" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#CC1100";
              el.style.color = "#CC1100";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#2A2A2A";
              el.style.color = "#9CA3AF";
            }}
          >
            Ablehnen
          </button>
        </div>
      )}
    </div>
  );
}
