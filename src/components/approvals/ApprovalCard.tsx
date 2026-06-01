"use client";

import { useState } from "react";
import type { Approval, RiskLevel, ApprovalStatus, ActionType } from "@/lib/agents/agent-types";
import { getAgentById } from "@/lib/agents/agent-registry";
import {
  Clock, CheckCircle2, RefreshCcw, XCircle, MinusCircle,
  Mail, Share2, FileText, Zap, CalendarPlus, BadgeCheck,
  Trash2, Database, PenLine, Bot, Download, Loader2, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

// ── Design-Config ─────────────────────────────────────────────────────────────

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

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std`;
  return `vor ${Math.floor(hrs / 24)} Tagen`;
}

// ── Payload-Vorschau ──────────────────────────────────────────────────────────

function PayloadPreview({ approval }: { approval: Approval }) {
  const [expanded, setExpanded] = useState(false);
  const p = approval.payload;
  if (!p) return null;

  return (
    <div className="rounded-lg bg-[#111111] border border-[#2A2A2A] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-[#999999] hover:text-white transition-colors"
      >
        <span className="font-medium">
          {p.type === "offer_pdf"  && "📄 Angebot-Details anzeigen"}
          {p.type === "email"      && `📧 E-Mail-Entwurf anzeigen (An: ${p.to})`}
          {p.type === "calendar"   && `📅 Kalender-Eintrag anzeigen`}
          {p.type === "general"    && "📋 Inhalt anzeigen"}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-[#2A2A2A]">
          {/* Offer PDF */}
          {p.type === "offer_pdf" && p.offerData && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] text-[#C9A84C] font-semibold uppercase tracking-wider">Kunde</p>
              <p className="text-xs text-white">{p.offerData.client}</p>
              {p.offerData.items.length > 0 && (
                <>
                  <p className="text-[10px] text-[#C9A84C] font-semibold uppercase tracking-wider mt-2">Positionen</p>
                  <div className="space-y-1.5">
                    {p.offerData.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-white">{item.name}</p>
                          {item.description && <p className="text-[10px] text-[#555555]">{item.description}</p>}
                        </div>
                        <p className="text-xs text-[#C9A84C] font-medium shrink-0">{item.price}</p>
                      </div>
                    ))}
                  </div>
                  {p.offerData.total && (
                    <div className="flex justify-between items-center pt-2 border-t border-[#2A2A2A]">
                      <p className="text-xs font-bold text-white">Gesamt (netto)</p>
                      <p className="text-sm font-bold text-[#C9A84C]">{p.offerData.total}</p>
                    </div>
                  )}
                </>
              )}
              {p.offerData.notes && (
                <p className="text-[10px] text-[#999999] italic">{p.offerData.notes}</p>
              )}
            </div>
          )}

          {/* Email */}
          {p.type === "email" && (
            <div className="space-y-1.5 pt-2">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <span className="text-[#555555]">An:</span>      <span className="text-white">{p.to}</span>
                <span className="text-[#555555]">Betreff:</span> <span className="text-white font-medium">{p.subject}</span>
              </div>
              {p.content && (
                <div className="mt-2 p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A]">
                  <p className="text-[11px] text-[#cccccc] leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {p.content}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Calendar */}
          {p.type === "calendar" && p.calendarData && (
            <div className="space-y-1 pt-2 text-xs">
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <span className="text-[#555555]">Titel:</span> <span className="text-white font-medium">{p.calendarData.title}</span>
                <span className="text-[#555555]">Start:</span> <span className="text-[#C9A84C]">{new Date(p.calendarData.start).toLocaleString("de-AT")}</span>
                <span className="text-[#555555]">Ende:</span>  <span className="text-[#999999]">{new Date(p.calendarData.end).toLocaleString("de-AT")}</span>
              </div>
            </div>
          )}

          {/* General content */}
          {p.type === "general" && p.content && (
            <p className="text-[11px] text-[#cccccc] leading-relaxed pt-2 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {p.content}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Haupt-Komponente ──────────────────────────────────────────────────────────

interface ApprovalCardProps {
  approval:        Approval;
  onStatusChange?: (id: string, newStatus: Approval["status"]) => void;
  onDelete?:       (id: string) => void;
}

export function ApprovalCard({ approval, onStatusChange, onDelete }: ApprovalCardProps) {
  const [localStatus,    setLocalStatus]    = useState<Approval["status"]>(approval.status);
  const [executing,      setExecuting]      = useState(false);
  const [deleting,       setDeleting]       = useState(false);
  const [deleted,        setDeleted]        = useState(false);
  const [result,         setResult]         = useState<{ type: string; message: string; data?: unknown } | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject,  setConfirmReject]  = useState(false);
  const [confirmDefer,   setConfirmDefer]   = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState(false);

  if (deleted) return null;

  async function doDelete() {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await fetch(`/api/approvals/${approval.id}`, { method: "DELETE", credentials: "include" });
      setDeleted(true);
      onDelete?.(approval.id);
    } finally { setDeleting(false); }
  }

  const risk       = riskConfig[approval.riskLevel];
  const status     = statusConfig[localStatus];
  const StatusIcon = status.Icon;
  const ActionIcon = actionIcons[approval.actionType] ?? FileText;
  const isDone     = ["approved", "rejected", "deferred"].includes(localStatus);
  const isActive   = localStatus === "open" || localStatus === "revised";

  async function executeAction(action: "approve" | "reject" | "defer") {
    setExecuting(true);
    setConfirmApprove(false);
    setConfirmReject(false);
    setConfirmDefer(false);

    try {
      const res  = await fetch(`/api/approvals/${approval.id}`, {
        method:  "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action }),
      });
      const json = await res.json();

      if (json.success) {
        const newStatus = json.status as Approval["status"];
        setLocalStatus(newStatus);
        onStatusChange?.(approval.id, newStatus);

        if (json.execution) {
          setResult(json.execution);

          // PDF-Download ausführen (client-seitig)
          if (json.execution.type === "offer_pdf" && approval.payload) {
            const { generateOfferPDF } = await import("@/lib/pdf/generate-offer");
            await generateOfferPDF(approval.payload, approval.title);
          }
        }
      }
    } catch (err) {
      console.error("Approval execution error:", err);
      setResult({ type: "error", message: "Fehler bei der Ausführung." });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div
      className="rounded-xl bg-[#1A1A1A] overflow-hidden transition-all"
      style={{
        borderLeft:      `4px solid ${isDone ? `${risk.border}80` : risk.border}`,
        border:          "1px solid #2A2A2A",
        borderLeftWidth: "4px",
        borderLeftColor: isDone ? `${risk.border}80` : risk.border,
        boxShadow:       !isDone && risk.glow ? risk.glow : undefined,
      }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${risk.color}18` }}>
            <ActionIcon className="w-4 h-4" style={{ color: risk.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ backgroundColor: risk.bg, color: risk.color, border: `1px solid ${risk.border}50` }}>
                {risk.label}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                <StatusIcon className="w-2.5 h-2.5" />{status.label}
              </span>
            </div>
            <p className="text-sm font-medium text-white mt-1.5 leading-snug">{approval.title}</p>
          </div>
          {/* Delete-Button */}
          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            title="Löschen"
            className="shrink-0 p-1.5 rounded-lg text-[#555555] hover:text-[#CC1100] hover:bg-[#CC1100]/10 transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-[#999999] leading-relaxed">{approval.description}</p>

        {/* Payload-Vorschau */}
        <PayloadPreview approval={approval} />

        {/* Notes */}
        {approval.notes && (
          <div className="px-3 py-2 rounded-lg bg-[#111111] border border-[#2A2A2A]">
            <p className="text-[11px] text-[#C9A84C] leading-relaxed">{approval.notes}</p>
          </div>
        )}

        {/* Ergebnis nach Ausführung */}
        {result && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
            result.type === "error"
              ? "bg-[#CC1100]/10 text-[#CC1100] border border-[#CC1100]/30"
              : "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30"
          }`}>
            {result.type === "error" ? "⚠ " : "✓ "}
            {result.message}
            {result.type === "offer_pdf" && (
              <button
                onClick={async () => {
                  const { generateOfferPDF } = await import("@/lib/pdf/generate-offer");
                  if (approval.payload) await generateOfferPDF(approval.payload, approval.title);
                }}
                className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-[#22C55E]/20 hover:bg-[#22C55E]/30 transition-colors"
              >
                <Download className="w-3 h-3" /> PDF erneut laden
              </button>
            )}
          </div>
        )}

        {/* Agents + Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {approval.involvedAgents.slice(0, 5).map((id) => {
              const agent = getAgentById(id);
              return (
                <span key={id} title={agent?.name ?? id}
                  className="w-7 h-7 rounded-full bg-[#111111] border border-[#2A2A2A] flex items-center justify-center text-sm -ml-1 first:ml-0">
                  {agent?.emoji ?? "🤖"}
                </span>
              );
            })}
          </div>
          <span className="text-[10px] text-[#999999]">{relativeTime(approval.createdAt)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {isActive && (
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[#2A2A2A] bg-[#111111]">
          <button
            onClick={() => setConfirmApprove(true)}
            disabled={executing}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: "#CC1100", boxShadow: "0 0 0 rgba(204,17,0,0)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 12px rgba(204,17,0,0.5)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 rgba(204,17,0,0)"; }}
          >
            {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {executing ? "Wird ausgeführt…" : "Genehmigen & Ausführen"}
          </button>
          <button onClick={() => setConfirmDefer(true)} disabled={executing}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors disabled:opacity-50">
            Zurückstellen
          </button>
          <button onClick={() => setConfirmReject(true)} disabled={executing}
            className="px-4 py-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-50"
            style={{ borderColor: "#2A2A2A", color: "#9CA3AF" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#CC1100"; (e.currentTarget as HTMLButtonElement).style.color = "#CC1100"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#2A2A2A"; (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF"; }}
          >
            Ablehnen
          </button>
        </div>
      )}

      {/* Bestätigungs-Dialoge */}
      <ConfirmDialog
        open={confirmApprove}
        title="Freigabe erteilen?"
        description={`"${approval.title}" wird jetzt genehmigt und die Aktion ausgeführt.${
          approval.payload?.type === "offer_pdf" ? " Das Angebot wird als PDF generiert und heruntergeladen." :
          approval.payload?.type === "email"     ? ` Die E-Mail an ${approval.payload.to} wird gesendet.` :
          approval.payload?.type === "calendar"  ? " Der Kalender-Eintrag wird angelegt." : ""
        }`}
        confirmLabel="Ja, freigeben & ausführen"
        onConfirm={() => executeAction("approve")}
        onCancel={() => setConfirmApprove(false)}
      />
      <ConfirmDialog
        open={confirmReject}
        title="Ablehnen?"
        description={`"${approval.title}" wird abgelehnt. Die Aktion wird nicht ausgeführt.`}
        confirmLabel="Ja, ablehnen"
        danger
        onConfirm={() => executeAction("reject")}
        onCancel={() => setConfirmReject(false)}
      />
      <ConfirmDialog
        open={confirmDefer}
        title="Zurückstellen?"
        description={`"${approval.title}" wird zurückgestellt und kann später bearbeitet werden.`}
        confirmLabel="Ja, zurückstellen"
        onConfirm={() => executeAction("defer")}
        onCancel={() => setConfirmDefer(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Freigabe löschen?"
        description={`"${approval.title}" wird dauerhaft aus dem Freigabezentrum entfernt.`}
        confirmLabel="Ja, löschen"
        danger
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
