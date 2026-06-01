import { AppShell } from "@/components/layout/AppShell";
import { ComingSoon } from "@/components/layout/ComingSoon";

export default function IntegrationsPage() {
  return (
    <AppShell title="Integrationen" subtitle="Friday, Gmail, Google, Social Media, Telegram und Supabase">
      <ComingSoon
        title="Integrationen"
        description="Adapter-Schicht für Friday, Gmail, Google Calendar, Google Drive, Telegram, LinkedIn, Instagram und Supabase. Alle im Mock-Modus vorbereitet."
        agents={["Echo", "Atlas", "Soren", "Nox", "Jarvis"]}
      />
    </AppShell>
  );
}
