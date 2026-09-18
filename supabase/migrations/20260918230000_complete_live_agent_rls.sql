-- Complete live-agent authorization and system-message policies.
CREATE POLICY "admins read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "agents write system messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender = 'system'
    AND sender_id = auth.uid()
    AND (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "admins read messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins write agent messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender = 'agent'
    AND sender_id = auth.uid()
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "agents read live-agent requests" ON public.agent_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "agents update live-agent requests" ON public.agent_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'));
