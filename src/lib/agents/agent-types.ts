export type AgentStatus = "active" | "inactive" | "busy" | "standby";

export type AgentType =
  | "orchestrator"
  | "frontoffice"
  | "strategy"
  | "communication"
  | "technical"
  | "creative"
  | "marketing"
  | "sales"
  | "legal"
  | "security"
  | "learning"
  | "developer"
  | "voice"
  | "quality";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type TaskStatus =
  | "pending"
  | "routing"
  | "in_progress"
  | "awaiting_approval"
  | "completed"
  | "failed"
  | "cancelled";

export type ApprovalStatus =
  | "open"
  | "approved"
  | "revised"
  | "rejected"
  | "deferred";

export type ActionType =
  | "send_email"
  | "post_social"
  | "book_appointment"
  | "send_offer"
  | "confirm_price"
  | "modify_customer_data"
  | "delete_file"
  | "trigger_external_api"
  | "friday_integration"
  | "database_migration"
  | "internal_analysis"
  | "create_draft"
  | "activate_agent";

export type Intent =
  | "general_question"
  | "customer_inquiry"
  | "create_offer"
  | "sales_strategy"
  | "write_communication"
  | "plan_content"
  | "create_social_post"
  | "technical_issue"
  | "system_concept"
  | "compliance_check"
  | "security_qa_check"
  | "academy_learning"
  | "developer_briefing"
  | "voice_interface"
  | "show_agents"
  | "show_approvals"
  | "show_tasks"
  | "gmail_query"
  | "gmail_reply"
  | "calendar_query"
  | "tasks_query"
  | "drive_query";

export interface AgentProfile {
  id: string;
  name: string;
  emoji: string;
  status: AgentStatus;
  role: string;
  type: AgentType;
  corePurpose: string;
  responsibilities: string[];
  boundaries: string[];
  handoffLogic: Record<string, string[]>;
  typicalOutputs: string[];
  canBeDirectlyMessaged: boolean;
  canBeAutoActivatedByJarvis: boolean;
  riskLevel: RiskLevel;
  enabled: boolean;
  color: string;
}

export interface AgentTask {
  id: string;
  source: "user" | "jarvis" | "system";
  userMessage: string;
  intent: Intent;
  assignedAgents: string[];
  status: TaskStatus;
  priority: "low" | "medium" | "high" | "urgent";
  resultSummary?: string;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentResult {
  id: string;
  taskId: string;
  agentId: string;
  status: "pending" | "working" | "done" | "failed";
  summary: string;
  details: string;
  suggestedActions: string[];
  risks: string[];
  createdAt: string;
}

export interface ApprovalPayload {
  type:           "email" | "offer_pdf" | "calendar" | "general";
  content?:       string;          // Volltext (Email-Body, Angebot-Text)
  to?:            string;          // Empfänger
  subject?:       string;          // Betreff
  draftId?:       string;          // Gmail Draft ID
  offerData?: {                    // Strukturierte Angebotsdaten
    client:       string;
    items:        Array<{ name: string; price: string; description?: string }>;
    total?:       string;
    notes?:       string;
  };
  calendarData?: {
    title: string; start: string; end: string; description?: string;
  };
}

export interface Approval {
  id: string;
  taskId: string;
  title: string;
  description: string;
  actionType: ActionType;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  involvedAgents: string[];
  createdAt: string;
  approvedAt?: string;
  notes?: string;
  payload?: ApprovalPayload;
}

export interface WorkflowLog {
  id: string;
  taskId: string;
  eventType:
    | "task_created"
    | "agent_activated"
    | "agent_result"
    | "approval_requested"
    | "approval_resolved"
    | "task_completed"
    | "task_failed";
  agentId?: string;
  message: string;
  createdAt: string;
}

export interface JarvisResponse {
  taskId: string;
  intent: Intent;
  activatedAgents: string[];
  summary: string;
  results: AgentResult[];
  approvalRequired: boolean;
  approvals: Approval[];
  logs: WorkflowLog[];
  nextSteps: string[];
}
