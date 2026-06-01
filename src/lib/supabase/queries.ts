import { createServerClient } from "./server";
import type { AgentTask, Approval, WorkflowLog } from "@/lib/agents/agent-types";

// ── Helpers: DB-Row → TypeScript-Typ ─────────────────────────────────────────

function rowToTask(r: Record<string, unknown>): AgentTask {
  return {
    id:              r.id as string,
    source:          r.source as AgentTask["source"],
    userMessage:     r.user_message as string,
    intent:          r.intent as AgentTask["intent"],
    assignedAgents:  (r.assigned_agents as string[]) ?? [],
    status:          r.status as AgentTask["status"],
    priority:        r.priority as AgentTask["priority"],
    resultSummary:   r.result_summary as string | undefined,
    requiresApproval: r.requires_approval as boolean,
    createdAt:       r.created_at as string,
    updatedAt:       r.updated_at as string,
  };
}

function rowToApproval(r: Record<string, unknown>): Approval {
  return {
    id:             r.id as string,
    taskId:         r.task_id as string,
    title:          r.title as string,
    description:    r.description as string,
    actionType:     r.action_type as Approval["actionType"],
    riskLevel:      r.risk_level as Approval["riskLevel"],
    status:         r.status as Approval["status"],
    involvedAgents: (r.involved_agents as string[]) ?? [],
    createdAt:      r.created_at as string,
    approvedAt:     r.approved_at as string | undefined,
    notes:          r.notes as string | undefined,
    payload:        r.payload as Approval["payload"] | undefined,
  };
}

function rowToLog(r: Record<string, unknown>): WorkflowLog {
  return {
    id:        r.id as string,
    taskId:    r.task_id as string,
    eventType: r.event_type as WorkflowLog["eventType"],
    agentId:   r.agent_id as string | undefined,
    message:   r.message as string,
    createdAt: r.created_at as string,
  };
}

// ── Tasks ─────────────────────────────────────────────────────────────────────

export async function getTasks(): Promise<AgentTask[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("agent_tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("getTasks error:", error); return []; }
  return (data ?? []).map(rowToTask);
}

export async function createTask(
  task: Omit<AgentTask, "id" | "createdAt" | "updatedAt">,
): Promise<AgentTask | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("agent_tasks")
    .insert({
      source:           task.source,
      user_message:     task.userMessage,
      intent:           task.intent,
      assigned_agents:  task.assignedAgents,
      status:           task.status,
      priority:         task.priority,
      result_summary:   task.resultSummary ?? null,
      requires_approval: task.requiresApproval,
    })
    .select()
    .single();

  if (error) { console.error("createTask error:", error); return null; }
  return rowToTask(data);
}

export async function updateTaskStatus(
  id: string,
  status: AgentTask["status"],
  resultSummary?: string,
): Promise<void> {
  const db = createServerClient();
  const { error } = await db
    .from("agent_tasks")
    .update({ status, ...(resultSummary ? { result_summary: resultSummary } : {}) })
    .eq("id", id);
  if (error) console.error("updateTaskStatus error:", error);
}

// ── Approvals ─────────────────────────────────────────────────────────────────

export async function getApprovals(): Promise<Approval[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("approvals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("getApprovals error:", error); return []; }
  return (data ?? []).map(rowToApproval);
}

export async function createApproval(
  approval: Omit<Approval, "id" | "createdAt">,
): Promise<Approval | null> {
  const db = createServerClient();
  const { data, error } = await db
    .from("approvals")
    .insert({
      task_id:         approval.taskId,
      title:           approval.title,
      description:     approval.description,
      action_type:     approval.actionType,
      risk_level:      approval.riskLevel,
      status:          approval.status,
      involved_agents: approval.involvedAgents,
      notes:           approval.notes ?? null,
      payload:         approval.payload ?? null,
    })
    .select()
    .single();

  if (error) { console.error("createApproval error:", error); return null; }
  return rowToApproval(data);
}

export async function updateApprovalStatus(
  id: string,
  status: Approval["status"],
): Promise<void> {
  const db = createServerClient();
  const { error } = await db
    .from("approvals")
    .update({
      status,
      ...(status === "approved" ? { approved_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) console.error("updateApprovalStatus error:", error);
}

// ── Workflow Logs ─────────────────────────────────────────────────────────────

export async function getLogsForTask(taskId: string): Promise<WorkflowLog[]> {
  const db = createServerClient();
  const { data, error } = await db
    .from("workflow_logs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) { console.error("getLogsForTask error:", error); return []; }
  return (data ?? []).map(rowToLog);
}

export async function createLog(
  log: Omit<WorkflowLog, "id" | "createdAt">,
): Promise<void> {
  const db = createServerClient();
  const { error } = await db
    .from("workflow_logs")
    .insert({
      task_id:    log.taskId,
      event_type: log.eventType,
      agent_id:   log.agentId ?? null,
      message:    log.message,
    });
  if (error) console.error("createLog error:", error);
}
