-- Hiraya Marketing recurring subscription billing
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade unique,
  stripe_customer_id text unique, stripe_subscription_id text unique, stripe_price_id text,
  plan text not null default 'free' check (plan in ('free','starter','growth','pro')), status text not null default 'inactive',
  current_period_end timestamptz, cancel_at_period_end boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_stripe_customer_id_idx on public.subscriptions(stripe_customer_id);
create index if not exists subscriptions_stripe_subscription_id_idx on public.subscriptions(stripe_subscription_id);
alter table public.subscriptions enable row level security;
drop policy if exists "Users can view their own subscription" on public.subscriptions;
create policy "Users can view their own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();
