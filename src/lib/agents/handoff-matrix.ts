import type { Intent } from "./agent-types";

export interface HandoffEntry {
  intent: Intent;
  primaryAgent: string;
  supportingAgents: string[];
  requiresApproval: boolean;
  approvalReason?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

export const HANDOFF_MATRIX: Record<Intent, HandoffEntry> = {
  general_question: {
    intent: "general_question",
    primaryAgent: "jarvis",
    supportingAgents: [],
    requiresApproval: false,
    priority: "low",
  },
  customer_inquiry: {
    intent: "customer_inquiry",
    primaryAgent: "nova",
    supportingAgents: ["vega", "lina"],
    requiresApproval: false,
    priority: "medium",
  },
  create_offer: {
    intent: "create_offer",
    primaryAgent: "vega",
    supportingAgents: ["lina", "kira", "nox"],
    requiresApproval: true,
    approvalReason: "Angebot vor Versand freigeben — verbindliche Preiszusage",
    priority: "high",
  },
  sales_strategy: {
    intent: "sales_strategy",
    primaryAgent: "vega",
    supportingAgents: ["lina", "jarvis"],
    requiresApproval: false,
    priority: "medium",
  },
  write_communication: {
    intent: "write_communication",
    primaryAgent: "lina",
    supportingAgents: ["jarvis"],
    requiresApproval: true,
    approvalReason: "Externe Kommunikation vor dem Senden freigeben",
    priority: "high",
  },
  plan_content: {
    intent: "plan_content",
    primaryAgent: "elara",
    supportingAgents: ["orion", "lina", "vega", "kira", "nox"],
    requiresApproval: false,
    priority: "medium",
  },
  create_social_post: {
    intent: "create_social_post",
    primaryAgent: "elara",
    supportingAgents: ["lina", "orion", "kira", "nox"],
    requiresApproval: true,
    approvalReason: "Social-Media-Post vor Veröffentlichung freigeben",
    priority: "high",
  },
  technical_issue: {
    intent: "technical_issue",
    primaryAgent: "soren",
    supportingAgents: ["atlas", "nox", "forge"],
    requiresApproval: false,
    priority: "high",
  },
  system_concept: {
    intent: "system_concept",
    primaryAgent: "atlas",
    supportingAgents: ["jarvis", "nox", "kira"],
    requiresApproval: false,
    priority: "medium",
  },
  compliance_check: {
    intent: "compliance_check",
    primaryAgent: "kira",
    supportingAgents: ["nox", "jarvis"],
    requiresApproval: false,
    priority: "high",
  },
  security_qa_check: {
    intent: "security_qa_check",
    primaryAgent: "nox",
    supportingAgents: ["kira", "atlas", "soren"],
    requiresApproval: false,
    priority: "high",
  },
  academy_learning: {
    intent: "academy_learning",
    primaryAgent: "milo",
    supportingAgents: ["atlas", "lina", "elara"],
    requiresApproval: false,
    priority: "low",
  },
  developer_briefing: {
    intent: "developer_briefing",
    primaryAgent: "forge",
    supportingAgents: ["soren", "atlas", "nox"],
    requiresApproval: false,
    priority: "medium",
  },
  voice_interface: {
    intent: "voice_interface",
    primaryAgent: "echo",
    supportingAgents: ["atlas", "soren"],
    requiresApproval: true,
    approvalReason: "Friday-Integration und Voice-Änderungen sind freigabepflichtig",
    priority: "high",
  },
  show_agents: {
    intent: "show_agents",
    primaryAgent: "jarvis",
    supportingAgents: [],
    requiresApproval: false,
    priority: "low",
  },
  show_approvals: {
    intent: "show_approvals",
    primaryAgent: "jarvis",
    supportingAgents: [],
    requiresApproval: false,
    priority: "low",
  },
  show_tasks: {
    intent: "show_tasks",
    primaryAgent: "jarvis",
    supportingAgents: [],
    requiresApproval: false,
    priority: "low",
  },
  gmail_query: {
    intent: "gmail_query",
    primaryAgent: "lina",
    supportingAgents: ["jarvis"],
    requiresApproval: false,
    priority: "medium",
  },
  gmail_reply: {
    intent: "gmail_reply",
    primaryAgent: "lina",
    supportingAgents: ["vega", "kira"],
    requiresApproval: true,
    approvalReason: "Antwortmail vor dem Senden freigeben",
    priority: "high",
  },
  calendar_query: {
    intent: "calendar_query",
    primaryAgent: "jenny",
    supportingAgents: ["jarvis"],
    requiresApproval: false,
    priority: "low",
  },
  tasks_query: {
    intent: "tasks_query",
    primaryAgent: "jenny",
    supportingAgents: ["jarvis"],
    requiresApproval: false,
    priority: "low",
  },
  drive_query: {
    intent: "drive_query",
    primaryAgent: "atlas",
    supportingAgents: ["jarvis"],
    requiresApproval: false,
    priority: "low",
  },
};

export function getHandoffEntry(intent: Intent): HandoffEntry {
  return HANDOFF_MATRIX[intent] ?? HANDOFF_MATRIX.general_question;
}

export function getAllAgentsForIntent(intent: Intent): string[] {
  const entry = getHandoffEntry(intent);
  return [entry.primaryAgent, ...entry.supportingAgents];
}
