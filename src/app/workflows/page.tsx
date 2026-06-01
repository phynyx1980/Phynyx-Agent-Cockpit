import { AppShell } from "@/components/layout/AppShell";
import { WorkflowStats } from "@/components/workflows/WorkflowStats";
import { WorkflowList } from "@/components/workflows/WorkflowList";
import { MOCK_TASKS, MOCK_LOGS } from "@/lib/mock-data/workflows";

export default function WorkflowsPage() {
  return (
    <AppShell
      title="Workflow Center"
      subtitle="Laufende & abgeschlossene Tasks · Agentenbeteiligung · Status-Tracking"
    >
      <div className="space-y-6">
        <WorkflowStats tasks={MOCK_TASKS} />
        <WorkflowList tasks={MOCK_TASKS} logs={MOCK_LOGS} />
      </div>
    </AppShell>
  );
}
