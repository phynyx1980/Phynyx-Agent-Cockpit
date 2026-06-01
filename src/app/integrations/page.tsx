import { AppShell } from "@/components/layout/AppShell";
import { auth } from "@/auth";
import { IntegrationsClient } from "@/components/integrations/IntegrationsClient";

export default async function IntegrationsPage() {
  const session = await auth();
  const isConnected = !!session?.accessToken;

  return (
    <AppShell title="Integrationen" subtitle="Google, Gmail, Kalender, Tasks — live verbunden">
      <IntegrationsClient isConnected={isConnected} userEmail={session?.user?.email ?? null} />
    </AppShell>
  );
}
