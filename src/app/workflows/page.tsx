import { AppShell } from "@/components/layout/AppShell";
import { WorkflowStats } from "@/components/workflows/WorkflowStats";
import { WorkflowList } from "@/components/workflows/WorkflowList";

export default function WorkflowsPage() {
  return (
    <AppShell
      title="Workflow Center"
      subtitle="Laufende & abgeschlossene Tasks · Agentenbeteiligung · Status-Tracking"
    >
      <div className="space-y-6">
        <WorkflowStats tasks={[]} />
        <WorkflowList tasks={[]} logs={{}} />
      </div>
    </AppShell>
  );
}
