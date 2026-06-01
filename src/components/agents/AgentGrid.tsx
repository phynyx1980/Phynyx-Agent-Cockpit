"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import type { AgentProfile, AgentStatus } from "@/lib/agents/agent-types";
import { AgentCard } from "./AgentCard";

interface AgentGridProps {
  agents: AgentProfile[];
}

type FilterType = "all" | AgentStatus;

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "all",      label: "Alle" },
  { value: "active",   label: "Aktiv" },
  { value: "standby",  label: "Standby" },
  { value: "busy",     label: "Beschäftigt" },
  { value: "inactive", label: "Inaktiv" },
];

export function AgentGrid({ agents }: AgentGridProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);

  const filtered = agents.filter((a) => {
    const matchesFilter = filter === "all" || a.status === filter;
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      a.corePurpose.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Jarvis immer zuerst, dann nach Status sortieren
  const sorted = [...filtered].sort((a, b) => {
    if (a.id === "jarvis") return -1;
    if (b.id === "jarvis") return 1;
    const order: AgentStatus[] = ["active", "busy", "standby", "inactive"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  const activeCount  = agents.filter((a) => a.status === "active").length;
  const standbyCount = agents.filter((a) => a.status === "standby").length;
  const autoCount    = agents.filter((a) => a.canBeAutoActivatedByJarvis).length;

  return (
    <div className="space-y-5">
      {/* Statistik-Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Aktive Agenten",    value: activeCount,  color: "#22C55E" },
          { label: "Im Standby",        value: standbyCount, color: "#999999" },
          { label: "Jarvis-Auto",        value: autoCount,    color: "#C9A84C" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]"
          >
            <span className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-xs text-[#999999]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter & Suche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#999999]" />
          <input
            type="text"
            placeholder="Agent suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-sm text-white placeholder-[#999999] focus:outline-none focus:border-[#CC1100]/40 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#999999] shrink-0" />
          <div className="flex gap-1.5 flex-wrap">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={[
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  filter === opt.value
                    ? "bg-[#CC1100] text-white"
                    : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#999999] hover:text-white hover:border-[#CC1100]/20",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-xs text-[#999999]">
        {sorted.length} von {agents.length} Agenten
        {search && ` · Suche: „${search}"`}
      </p>

      {/* Grid */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">🔍</span>
          <p className="text-sm text-[#999999]">Kein Agent gefunden für „{search}"</p>
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="mt-3 text-xs text-[#CC1100] hover:underline"
          >
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelect={setSelectedAgent}
            />
          ))}
        </div>
      )}

      {/* Aktivierungs-Feedback */}
      {selectedAgent && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-lg z-50"
          style={{
            background: "#1A1A1A",
            borderColor: "#CC1100",
            boxShadow: "var(--glow-red)",
          }}
        >
          <span className="text-xl">{selectedAgent.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-white">
              {selectedAgent.name} aktiviert
            </p>
            <p className="text-xs text-[#999999]">
              Jarvis übernimmt die Koordination
            </p>
          </div>
          <button
            onClick={() => setSelectedAgent(null)}
            className="ml-4 text-xs text-[#999999] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
