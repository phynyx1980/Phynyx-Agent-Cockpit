import { AppShell } from "@/components/layout/AppShell";
import { ApprovalStats } from "@/components/approvals/ApprovalStats";
import { ApprovalList } from "@/components/approvals/ApprovalList";
import { MOCK_APPROVALS } from "@/lib/mock-data/approvals";

export default function ApprovalsPage() {
  return (
    <AppShell
      title="Freigabezentrum"
      subtitle="Kritische Aktionen · Risikobewertung · Entscheidungen"
    >
      <div className="space-y-6">
        <ApprovalStats approvals={MOCK_APPROVALS} />
        <ApprovalList approvals={MOCK_APPROVALS} />
      </div>
    </AppShell>
  );
}
