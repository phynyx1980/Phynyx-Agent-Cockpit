"use client";

import { useState, useMemo } from "react";
import type { Approval, RiskLevel } from "@/lib/agents/agent-types";
import { ApprovalCard } from "./ApprovalCard";

type Filter = "open" | "revised" | "done" | "all";

const FILTER_TABS: { key: Filter; label: string; empty: string }[] = [
  { key: "open",    label: "Offen",       empty: "Keine offenen Freigaben — alles erledigt." },
  { key: "revised", label: "Ausstehend",  empty: "Kein Approval wartet auf Überarbeitung." },
  { key: "done",    label: "Erledigt",    empty: "Noch keine erledigten Freigaben." },
  { key: "all",     label: "Alle",        empty: "Keine Approvals vorhanden." },
];

// JENNY Sort: critical > high > medium > low, dann createdAt asc
const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

function sortByRiskThenDate(a: Approval, b: Approval): number {
  const riskDiff = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
  if (riskDiff !== 0) return riskDiff;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function sortByDateDesc(a: Approval, b: Approval): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

interface ApprovalListProps {
  approvals: Approval[];
}

export function ApprovalList({ approvals: initial }: ApprovalListProps) {
  const [filter, setFilter] = useState<Filter>("open");
  const [items, setItems] = useState<Approval[]>(initial);

  const counts = useMemo(() => ({
    open:    items.filter((a) => a.status === "open").length,
    revised: items.filter((a) => a.status === "revised").length,
    done:    items.filter((a) => ["approved", "rejected", "deferred"].includes(a.status)).length,
    all:     items.length,
  }), [items]);

  const filtered = useMemo(() => {
    if (filter === "open")    return [...items.filter((a) => a.status === "open")].sort(sortByRiskThenDate);
    if (filter === "revised") return [...items.filter((a) => a.status === "revised")].sort(sortByRiskThenDate);
    if (filter === "done")    return [...items.filter((a) => ["approved", "rejected", "deferred"].includes(a.status))].sort(sortByDateDesc);
    // all: active first (sorted by risk), then done (sorted by date desc)
    const active = [...items.filter((a) => ["open", "revised"].includes(a.status))].sort(sortByRiskThenDate);
    const done   = [...items.filter((a) => ["approved", "rejected", "deferred"].includes(a.status))].sort(sortByDateDesc);
    return { active, done };
  }, [items, filter]);

  function handleStatusChange(id: string, newStatus: Approval["status"]) {
    setItems((prev) => prev.map((a) =>
      a.id === id ? { ...a, status: newStatus, approvedAt: newStatus === "approved" ? new Date().toISOString() : a.approvedAt } : a
    ));
  }

  const activeTab = FILTER_TABS.find((t) => t.key === filter)!;

  const isAllView   = filter === "all";
  const activeItems = isAllView ? (filtered as { active: Approval[]; done: Approval[] }).active : (filtered as Approval[]);
  const doneItems   = isAllView ? (filtered as { active: Approval[]; done: Approval[] }).done   : [];

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] w-fit">
        {FILTER_TABS.map(({ key, label }) => {
          const isActive = filter === key;
          const count = counts[key];
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive ? "#CC1100" : "transparent",
                color: isActive ? "#ffffff" : "#999999",
              }}
            >
              {label}
              {count > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#2A2A2A",
                    color: isActive ? "#fff" : key === "open" && count > 0 ? "#CC1100" : "#999999",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {isAllView ? (
        <>
          {/* Aktive Approvals */}
          {activeItems.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {activeItems.map((a) => (
                <ApprovalCard
                  key={a.id}
                  approval={a}
                  onStatusChange={handleStatusChange}
                  onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
                />
              ))}
            </div>
          )}

          {/* Erledigt-Sektion */}
          {doneItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#2A2A2A]" />
                <span className="text-[11px] uppercase tracking-widest text-[#555555]">Abgeschlossen</span>
                <div className="h-px flex-1 bg-[#2A2A2A]" />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {doneItems.map((a) => (
                  <ApprovalCard key={a.id} approval={a} />
                ))}
              </div>
            </div>
          )}

          {activeItems.length === 0 && doneItems.length === 0 && (
            <EmptyState message={activeTab.empty} />
          )}
        </>
      ) : (
        <>
          {(activeItems as Approval[]).length === 0 ? (
            <EmptyState message={activeTab.empty} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {(activeItems as Approval[]).map((a) => (
                <ApprovalCard
                  key={a.id}
                  approval={a}
                  onStatusChange={handleStatusChange}
                  onDelete={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">✅</span>
      <p className="text-sm text-[#999999]">{message}</p>
    </div>
  );
}
