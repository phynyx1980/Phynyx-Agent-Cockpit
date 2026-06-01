import { AppShell } from "@/components/layout/AppShell";
import {
  Users, GitBranch, ShieldCheck, CheckCircle,
  Clock, Zap, TrendingUp, TrendingDown, AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { buildDataSource, getAgentStats, getTaskStats, getApprovalStats, getRecentActivity } from "@/lib/dashboard-stats";
import { getTasks, getApprovals } from "@/lib/supabase/queries";
import type { ActivityEventType } from "@/lib/dashboard-stats";
import { getAgentById } from "@/lib/agents/agent-registry";

// ── Event-Dot-Farben (ELARA-Spec) ────────────────────────────────────────────

const eventDotColor: Record<ActivityEventType, string> = {
  task_created:       "#3B82F6",
  task_completed:     "#22C55E",
  task_failed:        "#CC1100",
  approval_requested: "#C9A84C",
  approval_resolved:  "#22C55E",
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

// ── Page (Server Component — liest echte Mock-Daten) ─────────────────────────

export default function DashboardPage() {
  const [tasks, approvals] = await Promise.all([getTasks(), getApprovals()]);
  const source    = buildDataSource(tasks, approvals);
  const agents    = source.getAgents();

  const agentStats    = getAgentStats(agents);
  const taskStats     = getTaskStats(tasks);
  const approvalStats = getApprovalStats(approvals);
  const feed          = getRecentActivity(tasks, approvals, 8);

  const hasUrgent   = taskStats.urgent > 0;
  const hasApprovals = approvalStats.open > 0;

  const kpiCards = [
    {
      label: "Aktive Agenten",
      value: String(agentStats.active),
      sub: `${agentStats.busy} beschäftigt · ${agentStats.inactive} Standby`,
      trend: null,
      icon: Users,
      color: "#CC1100",
      href: "/agents",
      critical: false,
    },
    {
      label: "Offene Tasks",
      value: String(taskStats.inProgress + taskStats.pending),
      sub: `${taskStats.inProgress} in Bearbeitung`,
      trend: taskStats.urgent > 0 ? { label: `${taskStats.urgent} urgent`, up: false } : null,
      icon: GitBranch,
      color: "#C9A84C",
      href: "/workflows",
      critical: hasUrgent,
    },
    {
      label: "Offene Freigaben",
      value: String(approvalStats.open),
      sub: approvalStats.critical > 0 ? `${approvalStats.critical} kritisch` : `${approvalStats.high} hoch`,
      trend: approvalStats.critical > 0 ? { label: `${approvalStats.critical} kritisch`, up: false } : null,
      icon: ShieldCheck,
      color: "#CC1100",
      href: "/approvals",
      critical: hasApprovals,
    },
    {
      label: "Abgeschlossen",
      value: String(taskStats.completed),
      sub: `${taskStats.failed} fehlgeschlagen`,
      trend: taskStats.completed > 0 ? { label: `+${taskStats.completed}`, up: true } : null,
      icon: CheckCircle,
      color: "#22C55E",
      href: "/workflows",
      critical: false,
    },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Guten Morgen, Philip — Jarvis hat den Überblick."
    >
      <div className="space-y-6 max-w-7xl">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="group flex flex-col gap-3 p-4 rounded-xl bg-[#1A1A1A] border transition-all"
                style={{
                  borderColor: card.critical ? "rgba(204,17,0,0.6)" : "#2A2A2A",
                  boxShadow: card.critical ? "0 0 12px rgba(204,17,0,0.25)" : undefined,
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#999999] uppercase tracking-[0.1em] font-medium">
                    {card.label}
                  </p>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-[#999999] mt-0.5">{card.sub}</p>
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1">
                    {card.trend.up
                      ? <TrendingUp  className="w-3 h-3" style={{ color: "#22C55E" }} />
                      : <TrendingDown className="w-3 h-3" style={{ color: "#CC1100" }} />}
                    <span
                      className="text-xs font-medium"
                      style={{ color: card.trend.up ? "#22C55E" : "#CC1100" }}
                    >
                      {card.trend.label}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Main Grid: Activity + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Letzte Aktivitäten */}
          <div className="lg:col-span-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#CC1100]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white">
                  Letzte Aktivitäten
                </h2>
                {/* LIVE-Indikator (ELARA) */}
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest text-[#22C55E] font-semibold">
                    Live
                  </span>
                </div>
              </div>
              <Link href="/workflows" className="text-xs text-[#CC1100] hover:underline">
                Alle anzeigen
              </Link>
            </div>

            <div className="divide-y divide-[#2A2A2A]">
              {feed.map((item) => {
                const dotColor = eventDotColor[item.eventType];
                const firstAgent = item.involvedAgents[0]
                  ? getAgentById(item.involvedAgents[0])
                  : null;
                return (
                  <Link
                    key={item.id}
                    href={item.href ?? "#"}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#111111] transition-colors"
                  >
                    {/* Colored dot */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-xl w-8 text-center">
                        {firstAgent?.emoji ?? "🤖"}
                      </span>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{item.title}</p>
                      <p className="text-xs text-[#999999] mt-0.5">
                        {item.involvedAgents
                          .slice(0, 3)
                          .map((id) => getAgentById(id)?.name ?? id)
                          .join(", ")}{" "}
                        · {relativeTime(item.timestamp)}
                      </p>
                    </div>

                    {/* Status-Icon */}
                    <div className="shrink-0">
                      {item.eventType === "task_completed" || item.eventType === "approval_resolved" ? (
                        <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      ) : item.eventType === "approval_requested" ? (
                        <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                      ) : item.eventType === "task_failed" ? (
                        <AlertTriangle className="w-4 h-4 text-[#CC1100]" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Jarvis Chat */}
            <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[#CC1100]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white">
                  Jarvis fragen
                </h2>
              </div>
              <Link
                href="/"
                className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: "var(--gradient-phoenix)" }}
              >
                Chat öffnen
              </Link>
            </div>

            {/* Schnellaktionen */}
            <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-[#2A2A2A]">
                <TrendingUp className="w-4 h-4 text-[#C9A84C]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white">
                  Schnellaktionen
                </h2>
              </div>
              <div className="divide-y divide-[#2A2A2A]">
                {[
                  { label: "Kundenanfrage bearbeiten", hint: 'Sage: "neue Kundenanfrage"' },
                  { label: "Angebot erstellen",         hint: 'Sage: "erstelle ein Angebot"' },
                  { label: "Content planen",            hint: 'Sage: "plane Content"' },
                  { label: "Security prüfen",           hint: 'Sage: "prüfe auf Risiken"' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href="/"
                    className="flex flex-col px-5 py-3 hover:bg-[#111111] transition-colors"
                  >
                    <span className="text-sm text-white font-medium">{action.label}</span>
                    <span className="text-xs text-[#999999] mt-0.5">{action.hint}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Risiko-Alert / Success (ELARA: dynamisch) */}
            {approvalStats.open > 0 ? (
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(204,17,0,0.08)", border: "1px solid rgba(204,17,0,0.2)" }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-[#CC1100] shrink-0" />
                  <p className="text-sm font-semibold text-white">
                    {approvalStats.open} offene{" "}
                    {approvalStats.open === 1 ? "Freigabe" : "Freigaben"}
                    {approvalStats.critical > 0 && (
                      <span className="ml-1 text-[#FF2020]">
                        ({approvalStats.critical} kritisch)
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-xs text-[#999999]">
                  Agenten haben Aktionen vorbereitet, die deine Entscheidung brauchen.
                </p>
                <Link
                  href="/approvals"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-[#CC1100] hover:underline"
                >
                  Jetzt prüfen →
                </Link>
              </div>
            ) : (
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
                  <p className="text-sm font-semibold text-white">Keine offenen Freigaben</p>
                </div>
                <p className="text-xs text-[#999999] mt-1">
                  Alle Aktionen sind abgearbeitet — alles grün.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
