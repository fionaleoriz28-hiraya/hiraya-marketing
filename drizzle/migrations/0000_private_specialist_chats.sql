DROP POLICY IF EXISTS "agents read conversations" ON public.conversations;
DROP POLICY IF EXISTS "agents update conversations" ON public.conversations;
CREATE POLICY "agents read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND (agent_id IS NULL OR agent_id = auth.uid()));
CREATE POLICY "agents update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND (agent_id IS NULL OR agent_id = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'agent') AND (agent_id IS NULL OR agent_id = auth.uid()));
DROP POLICY IF EXISTS "agents read all messages" ON public.chat_messages;
CREATE POLICY "agents read assigned messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'agent') AND EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = chat_messages.conversation_id
      AND (c.agent_id IS NULL OR c.agent_id = auth.uid())));