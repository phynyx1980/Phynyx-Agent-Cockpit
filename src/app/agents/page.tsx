import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function AgentsPage() {
  return (
    <AppShell title="Agententeam" subtitle="14 operative KI-Agenten unter Jarvis-Führung">
      <ComingSoon
        title="Agententeam"
        description="Alle 14 Phynyx-Agenten als interaktive Karten — Rolle, Zuständigkeit, Status und direkte Aktivierung."
        agents={["Jarvis", "Nova", "Jenny", "Atlas", "Lina", "Soren", "Orion", "Elara", "Vega", "Kira", "Nox", "Milo", "Forge", "Echo"]}
      />
    </AppShell>
  );
}
