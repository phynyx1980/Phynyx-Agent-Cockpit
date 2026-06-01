import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function WorkflowsPage() {
  return (
    <AppShell title="Workflow Center" subtitle="Aufgaben, Status und Agentenbeteiligung">
      <ComingSoon
        title="Workflow Center"
        description="Alle laufenden und abgeschlossenen Tasks mit beteiligten Agenten, Status-Tracking und Ergebnissen."
        agents={["Jarvis", "Nova", "Atlas", "Soren", "Forge"]}
      />
    </AppShell>
  );
}
