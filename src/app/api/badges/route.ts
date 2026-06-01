import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const db = createServerClient();

  const [tasksRes, approvalsRes] = await Promise.all([
    db
      .from("agent_tasks")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "routing", "in_progress", "awaiting_approval"]),
    db
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "revised"]),
  ]);

  return NextResponse.json({
    workflows: tasksRes.count ?? 0,
    approvals: approvalsRes.count ?? 0,
  });
}
