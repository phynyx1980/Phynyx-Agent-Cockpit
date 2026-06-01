import { AppShell } from "@/components/layout/AppShell";
import { ApprovalStats } from "@/components/approvals/ApprovalStats";
import { ApprovalList } from "@/components/approvals/ApprovalList";

export default function ApprovalsPage() {
  return (
    <AppShell
      title="Freigabezentrum"
      subtitle="Kritische Aktionen · Risikobewertung · Entscheidungen"
    >
      <div className="space-y-6">
        <ApprovalStats approvals={[]} />
        <ApprovalList approvals={[]} />
      </div>
    </AppShell>
  );
}
