import { AppShell } from "@/components/layout/AppShell";
import { AgentsView } from "@/components/agents/AgentsView";
import { AGENT_REGISTRY } from "@/lib/agents/agent-registry";

export default function AgentsPage() {
  return (
    <AppShell
      title="Agententeam"
      subtitle="14 operative KI-Agenten unter Jarvis-Führung"
    >
      <AgentsView agents={AGENT_REGISTRY} />
    </AppShell>
  );
}
