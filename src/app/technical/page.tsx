import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function TechnicalPage() {
  return (
    <AppShell title="Technik / QA" subtitle="Issue-Intake, Security-Check und Developer-Briefings">
      <ComingSoon
        title="Technik & QA"
        description="Technische Probleme aufnehmen, priorisieren, Security-Checks durchführen und Developer-Briefings vorbereiten."
        agents={["Soren", "Atlas", "Nox", "Forge", "Kira"]}
      />
    </AppShell>
  );
}
