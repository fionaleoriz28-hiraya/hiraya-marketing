insert into public.user_roles (user_id, role)
values
  ('742fae3d-fa1f-46bd-b520-dc0a9b657c10', 'agent'),
  ('602ab258-68a8-4007-9d41-02f456da16dd', 'agent')
on conflict (user_id, role) do nothing;