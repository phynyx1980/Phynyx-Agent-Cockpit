"use client";

import { useState } from "react";
import type { AgentProfile } from "@/lib/agents/agent-types";
import { AgentGrid } from "./AgentGrid";
import { AgentDetailModal } from "./AgentDetailModal";

interface AgentsViewProps {
  agents: AgentProfile[];
}

export function AgentsView({ agents }: AgentsViewProps) {
  const [detailAgent, setDetailAgent] = useState<AgentProfile | null>(null);

  return (
    <>
      <AgentGrid agents={agents} />
      {detailAgent && (
        <AgentDetailModal
          agent={detailAgent}
          onClose={() => setDetailAgent(null)}
        />
      )}
    </>
  );
}
