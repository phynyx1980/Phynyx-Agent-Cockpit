import { AppShell } from "@/components/layout/AppShell";
import { WorkflowStats } from "@/components/workflows/WorkflowStats";
import { WorkflowList } from "@/components/workflows/WorkflowList";
import { getTasks, getLogsForTask } from "@/lib/supabase/queries";
import type { WorkflowLog } from "@/lib/agents/agent-types";

export default async function WorkflowsPage() {
  const tasks = await getTasks();

  // Logs für alle Tasks parallel laden
  const logsEntries = await Promise.all(
    tasks.map(async (t) => [t.id, await getLogsForTask(t.id)] as [string, WorkflowLog[]])
  );
  const logs = Object.fromEntries(logsEntries);

  return (
    <AppShell
      title="Workflow Center"
      subtitle="Laufende & abgeschlossene Tasks · Agentenbeteiligung · Status-Tracking"
    >
      <div className="space-y-6">
        <WorkflowStats tasks={tasks} />
        <WorkflowList tasks={tasks} logs={logs} />
      </div>
    </AppShell>
  );
}
