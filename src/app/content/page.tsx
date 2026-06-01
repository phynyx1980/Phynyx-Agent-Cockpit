import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ContentPage() {
  return (
    <AppShell title="Content / Marketing" subtitle="Contentplanung, Kampagnen und Social-Media-Briefings">
      <ComingSoon
        title="Content & Marketing"
        description="Contentpläne erstellen, Themencluster definieren, Kampagnen strukturieren und Social-Media-Briefings vorbereiten."
        agents={["Elara", "Orion", "Lina", "Vega", "Kira", "Nox"]}
      />
    </AppShell>
  );
}
