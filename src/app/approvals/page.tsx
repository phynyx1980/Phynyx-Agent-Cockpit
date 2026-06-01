import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ApprovalsPage() {
  return (
    <AppShell title="Freigabezentrum" subtitle="Kritische Aktionen warten auf deine Entscheidung">
      <ComingSoon
        title="Freigabezentrum"
        description="Alle freigabepflichtigen Aktionen mit Risikobewertung, beteiligten Agenten und Entscheidungsoptionen."
        agents={["Jarvis", "Nox", "Kira", "Vega", "Lina"]}
      />
    </AppShell>
  );
}
