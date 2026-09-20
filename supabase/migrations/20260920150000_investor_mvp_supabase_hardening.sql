-- Hiraya Marketing: production / investor-MVP Supabase hardening
-- Safe, additive migration. No data is deleted.

-- Keep conversation timestamps reliable.
DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Keep agent request timestamps reliable when status/contact details change.
ALTER TABLE public.agent_requests
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS agent_requests_updated_at ON public.agent_requests;
CREATE TRIGGER agent_requests_updated_at
BEFORE UPDATE ON public.agent_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Useful indexes for the authenticated app and live-agent inbox.
CREATE INDEX IF NOT EXISTS businesses_user_id_idx
  ON public.businesses (user_id);

CREATE INDEX IF NOT EXISTS audits_user_created_idx
  ON public.audits (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_user_posted_idx
  ON public.posts (user_id, posted_at DESC);

CREATE INDEX IF NOT EXISTS growth_snapshots_user_period_idx
  ON public.growth_snapshots (user_id, period DESC);

CREATE INDEX IF NOT EXISTS content_items_user_date_idx
  ON public.content_items (user_id, scheduled_date DESC);

CREATE INDEX IF NOT EXISTS strategies_user_created_idx
  ON public.strategies (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ad_campaigns_user_created_idx
  ON public.ad_campaigns (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS assistant_messages_user_created_idx
  ON public.assistant_messages (user_id, created_at ASC);

CREATE INDEX IF NOT EXISTS agent_requests_status_created_idx
  ON public.agent_requests (status, created_at ASC);

CREATE INDEX IF NOT EXISTS conversations_agent_status_idx
  ON public.conversations (agent_id, status, last_message_at DESC);

CREATE INDEX IF NOT EXISTS conversations_user_status_idx
  ON public.conversations (user_id, status, last_message_at DESC);

-- Defense-in-depth: authenticated users may only read their own role rows.
-- Do not grant role-management permissions to normal users.
DROP POLICY IF EXISTS "own roles readable" ON public.user_roles;
CREATE POLICY "own roles readable"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Ensure the realtime tables have a deterministic identity for updates.
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
