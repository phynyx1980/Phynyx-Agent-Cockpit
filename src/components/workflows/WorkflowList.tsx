"use client";

import { useState, useMemo } from "react";
import type { AgentTask, WorkflowLog } from "@/lib/agents/agent-types";
import { WorkflowCard } from "./WorkflowCard";
import { Search, SlidersHorizontal } from "lucide-react";

type Filter = "all" | "active" | "awaiting_approval" | "completed";

const FILTER_TABS: { key: Filter; label: string }[] = [
  { key: "all",                label: "Alle" },
  { key: "active",             label: "Aktiv" },
  { key: "awaiting_approval",  label: "Freigabe nötig" },
  { key: "completed",          label: "Abgeschlossen" },
];

interface WorkflowListProps {
  tasks: AgentTask[];
  logs: Record<string, WorkflowLog[]>;
}

export function WorkflowList({ tasks: initial, logs }: WorkflowListProps) {
  const [tasks,  setTasks]  = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = useMemo(() => {
    let result = tasks;


    if (filter === "active") {
      result = result.filter(
        (t) => t.status === "in_progress" || t.status === "routing" || t.status === "pending"
      );
    } else if (filter === "awaiting_approval") {
      result = result.filter((t) => t.status === "awaiting_approval");
    } else if (filter === "completed") {
      result = result.filter(
        (t) => t.status === "completed" || t.status === "failed" || t.status === "cancelled"
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.userMessage.toLowerCase().includes(q) ||
          t.resultSummary?.toLowerCase().includes(q) ||
          t.assignedAgents.some((a) => a.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tasks, filter, search]);

  const counts: Record<Filter, number> = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter(
        (t) => t.status === "in_progress" || t.status === "routing" || t.status === "pending"
      ).length,
      awaiting_approval: tasks.filter((t) => t.status === "awaiting_approval").length,
      completed: tasks.filter(
        (t) => t.status === "completed" || t.status === "failed" || t.status === "cancelled"
      ).length,
    }),
    [tasks]
  );

  return (
    <div className="space-y-4">
      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
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
                      color: isActive ? "#fff" : key === "awaiting_approval" && count > 0 ? "#CC1100" : "#999999",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] min-w-0">
          <Search className="w-3.5 h-3.5 text-[#666666] shrink-0" />
          <input
            type="text"
            placeholder="Tasks durchsuchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#555555] outline-none min-w-0"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-[#555555] hover:text-white transition-colors text-xs shrink-0"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort placeholder */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-[#666666] hover:text-white hover:border-[#3A3A3A] transition-colors shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sortieren</span>
        </button>
      </div>

      {/* Task Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="text-4xl mb-3">🤖</span>
          <p className="text-sm text-[#999999]">
            {search ? `Keine Tasks für "${search}" gefunden.` : "Keine Tasks in dieser Kategorie."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtered.map((task) => (
            <WorkflowCard key={task.id} task={task} logs={logs[task.id] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
