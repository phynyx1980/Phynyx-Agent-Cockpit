-- ============================================================
-- PHYNYX AGENT COCKPIT — Initial Schema
-- Migration: 20260601_initial_schema
-- ============================================================

-- ============================================================
-- TABLE: agent_tasks
-- ============================================================
CREATE TABLE public.agent_tasks (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  source           TEXT        NOT NULL
                               CHECK (source IN ('user', 'jarvis', 'system')),
  user_message     TEXT        NOT NULL,
  intent           TEXT        NOT NULL,
  assigned_agents  TEXT[]      NOT NULL DEFAULT '{}',
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'routing', 'in_progress', 'awaiting_approval', 'completed', 'failed', 'cancelled')),
  priority         TEXT        NOT NULL DEFAULT 'medium'
                               CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  result_summary   TEXT,
  requires_approval BOOLEAN    NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_tasks_status     ON public.agent_tasks (status);
CREATE INDEX idx_agent_tasks_created_at ON public.agent_tasks (created_at DESC);
CREATE INDEX idx_agent_tasks_priority   ON public.agent_tasks (priority);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage own tasks"
  ON public.agent_tasks
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_agent_tasks_updated_at
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- TABLE: approvals
-- ============================================================
CREATE TABLE public.approvals (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id          UUID        NOT NULL
                               REFERENCES public.agent_tasks (id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT        NOT NULL,
  action_type      TEXT        NOT NULL,
  risk_level       TEXT        NOT NULL
                               CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  status           TEXT        NOT NULL DEFAULT 'open'
                               CHECK (status IN ('open', 'approved', 'revised', 'rejected', 'deferred')),
  involved_agents  TEXT[]      NOT NULL DEFAULT '{}',
  notes            TEXT,
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approvals_task_id    ON public.approvals (task_id);
CREATE INDEX idx_approvals_status     ON public.approvals (status);
CREATE INDEX idx_approvals_created_at ON public.approvals (created_at DESC);
CREATE INDEX idx_approvals_risk_level ON public.approvals (risk_level);

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage approvals"
  ON public.approvals
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE TRIGGER trg_approvals_updated_at
  BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- TABLE: workflow_logs
-- ============================================================
CREATE TABLE public.workflow_logs (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id     UUID        NOT NULL
                          REFERENCES public.agent_tasks (id) ON DELETE CASCADE,
  event_type  TEXT        NOT NULL
                          CHECK (event_type IN (
                            'task_created',
                            'agent_activated',
                            'agent_result',
                            'approval_requested',
                            'approval_resolved',
                            'task_completed',
                            'task_failed'
                          )),
  agent_id    TEXT,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_logs_task_id    ON public.workflow_logs (task_id);
CREATE INDEX idx_workflow_logs_event_type ON public.workflow_logs (event_type);
CREATE INDEX idx_workflow_logs_created_at ON public.workflow_logs (created_at DESC);
CREATE INDEX idx_workflow_logs_agent_id   ON public.workflow_logs (agent_id)
  WHERE agent_id IS NOT NULL;

ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage workflow logs"
  ON public.workflow_logs
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- workflow_logs ist append-only — kein updated_at Trigger noetig
