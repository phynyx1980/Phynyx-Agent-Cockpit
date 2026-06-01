import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function SettingsPage() {
  return (
    <AppShell title="Einstellungen" subtitle="Agenten, Freigaben, Modus und Integrationen konfigurieren">
      <ComingSoon
        title="Einstellungen"
        description="Agenten aktivieren/deaktivieren, Freigabepflicht einstellen, Mock/Live-Modus wechseln und API-Verbindungen vorbereiten."
        agents={["Jarvis", "Nox", "Kira"]}
      />
    </AppShell>
  );
}
