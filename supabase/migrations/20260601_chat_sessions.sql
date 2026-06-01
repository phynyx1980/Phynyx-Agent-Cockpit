-- ============================================================
-- Migration: 20260601_chat_sessions
-- Erstellt: 2026-06-01
-- Zweck: Chat-Persistenz für Jarvis im Agent Cockpit
-- Projekt: ajmfqrhedcnumavetbar
-- ============================================================

-- ------------------------------------------------------------
-- Tabelle 1: chat_sessions
-- ------------------------------------------------------------
CREATE TABLE public.chat_sessions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-Update Trigger für updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS aktivieren
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat_sessions"
  ON public.chat_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chat_sessions"
  ON public.chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chat_sessions"
  ON public.chat_sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chat_sessions"
  ON public.chat_sessions FOR DELETE
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- Tabelle 2: chat_messages
-- ------------------------------------------------------------
CREATE TABLE public.chat_messages (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id   UUID        NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL CHECK (role IN ('user', 'jarvis')),
  content      TEXT        NOT NULL DEFAULT '',
  jarvis_data  JSONB       NULL,
  google_data  JSONB       NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indizes
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- RLS aktivieren
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat_messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert chat_messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update chat_messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete chat_messages"
  ON public.chat_messages FOR DELETE
  TO authenticated
  USING (true);
