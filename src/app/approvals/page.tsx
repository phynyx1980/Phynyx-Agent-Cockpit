import { AppShell } from "@/components/layout/AppShell";
import { ApprovalStats } from "@/components/approvals/ApprovalStats";
import { ApprovalList } from "@/components/approvals/ApprovalList";
import { getApprovals } from "@/lib/supabase/queries";

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <AppShell
      title="Freigabezentrum"
      subtitle="Kritische Aktionen · Risikobewertung · Entscheidungen"
    >
      <div className="space-y-6">
        <ApprovalStats approvals={approvals} />
        <ApprovalList approvals={approvals} />
      </div>
    </AppShell>
  );
}
