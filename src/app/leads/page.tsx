import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function LeadsPage() {
  return (
    <AppShell title="Kunden / Leads" subtitle="Anfragen, Leads und Kundenstatus">
      <ComingSoon
        title="Kunden & Leads"
        description="Kundenanfragen klassifizieren, Leads priorisieren und an die passenden Agenten weiterleiten."
        agents={["Nova", "Vega", "Lina", "Jarvis"]}
      />
    </AppShell>
  );
}
