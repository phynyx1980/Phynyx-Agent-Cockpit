import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function SalesPage() {
  return (
    <AppShell title="Angebote / Sales" subtitle="Angebotsstruktur, Preisargumentation und Closing-Vorbereitung">
      <ComingSoon
        title="Angebote & Sales"
        description="Angebote strukturieren, Pakete konfigurieren, Preisargumentationen und Compliance-Checks durchführen."
        agents={["Vega", "Lina", "Kira", "Nox", "Jarvis"]}
      />
    </AppShell>
  );
}
