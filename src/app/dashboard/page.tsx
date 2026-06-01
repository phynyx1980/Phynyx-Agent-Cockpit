import { AppShell } from "@/components/layout/AppShell";
import {
  Users,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

const kpiCards = [
  {
    label: "Aktive Agenten",
    value: "11",
    sub: "3 im Standby",
    icon: Users,
    color: "#CC1100",
    href: "/agents",
  },
  {
    label: "Offene Tasks",
    value: "3",
    sub: "2 in Bearbeitung",
    icon: GitBranch,
    color: "#C9A84C",
    href: "/workflows",
  },
  {
    label: "Offene Freigaben",
    value: "2",
    sub: "1 kritisch",
    icon: ShieldCheck,
    color: "#CC1100",
    href: "/approvals",
  },
  {
    label: "Abgeschlossen",
    value: "14",
    sub: "diese Woche",
    icon: CheckCircle,
    color: "#22C55E",
    href: "/workflows",
  },
];

const recentActivity = [
  {
    agent: "Nova",
    emoji: "📬",
    action: "Neue Kundenanfrage klassifiziert",
    time: "vor 5 Min",
    status: "done",
  },
  {
    agent: "Vega",
    emoji: "💼",
    action: "Angebotsstruktur KI-Chatbot vorbereitet",
    time: "vor 23 Min",
    status: "approval",
  },
  {
    agent: "Nox",
    emoji: "🔒",
    action: "Security-Check abgeschlossen — 2 Findings",
    time: "vor 1 Std",
    status: "warning",
  },
  {
    agent: "Elara",
    emoji: "📣",
    action: "Contentplan KI-Automatisierung erstellt",
    time: "vor 2 Std",
    status: "done",
  },
  {
    agent: "Kira",
    emoji: "⚖️",
    action: "Compliance-Check Angebotstext — 1 Risiko",
    time: "vor 3 Std",
    status: "warning",
  },
];

const quickActions = [
  { label: "Kundenanfrage bearbeiten", hint: 'Sage: "neue Kundenanfrage"', href: "/" },
  { label: "Angebot erstellen", hint: 'Sage: "erstelle ein Angebot"', href: "/" },
  { label: "Content planen", hint: 'Sage: "plane Content"', href: "/" },
  { label: "Security prüfen", hint: 'Sage: "prüfe auf Risiken"', href: "/" },
];

export default function DashboardPage() {
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
                className="group flex flex-col gap-3 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#CC1100]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#999999] uppercase tracking-[0.1em] font-medium">
                    {card.label}
                  </p>
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{ backgroundColor: `${card.color}15` }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: card.color }}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-[#999999] mt-0.5">{card.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Main Grid: Activity + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Letzte Aktivitäten */}
          <div className="lg:col-span-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CC1100]" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white">
                  Letzte Aktivitäten
                </h2>
              </div>
              <Link
                href="/workflows"
                className="text-xs text-[#CC1100] hover:underline"
              >
                Alle anzeigen
              </Link>
            </div>
            <div className="divide-y divide-[#2A2A2A]">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#111111] transition-colors"
                >
                  <span className="text-xl w-8 shrink-0 text-center">
                    {item.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{item.action}</p>
                    <p className="text-xs text-[#999999] mt-0.5">
                      {item.agent} · {item.time}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {item.status === "done" && (
                      <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                    )}
                    {item.status === "approval" && (
                      <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                    )}
                    {item.status === "warning" && (
                      <AlertTriangle className="w-4 h-4 text-[#CC1100]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            {/* Jarvis Prompt */}
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
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col px-5 py-3 hover:bg-[#111111] transition-colors"
                  >
                    <span className="text-sm text-white font-medium">
                      {action.label}
                    </span>
                    <span className="text-xs text-[#999999] mt-0.5">
                      {action.hint}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Risiko-Hinweis */}
            <div className="rounded-xl bg-[#CC1100]/8 border border-[#CC1100]/20 p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4 h-4 text-[#CC1100] shrink-0" />
                <p className="text-sm font-semibold text-white">
                  2 offene Freigaben
                </p>
              </div>
              <p className="text-xs text-[#999999]">
                Nox und Kira haben Risiken markiert, die deine Freigabe
                brauchen.
              </p>
              <Link
                href="/approvals"
                className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-[#CC1100] hover:underline"
              >
                Jetzt prüfen →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
