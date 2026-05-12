create extension if not exists pgcrypto;

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'integration_events'
  ) then
    alter table public.integration_events
      drop constraint if exists integration_events_provider_check;

    alter table public.integration_events
      add constraint integration_events_provider_check
      check (provider in ('gmail', 'calendar', 'google', 'jobber', 'quickbooks', 'twilio', 'slack', 'internal'));
  end if;
end $$;

create table if not exists public.integration_account (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('google')),
  account_email text,
  scopes text[] not null default '{}'::text[],
  token_ciphertext text,
  token_iv text,
  token_auth_tag text,
  status text not null default 'not_connected' check (status in ('not_connected', 'connected', 'expired', 'error')),
  last_connected_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, account_email)
);

create table if not exists public.ops_loops (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('gmail', 'calendar', 'jobber', 'twilio', 'slack', 'internal')),
  source_external_id text,
  related_contact_name text,
  related_contact_email text,
  related_contact_phone text,
  related_jobber_id text,
  related_customer_id uuid,
  loop_type text not null check (
    loop_type in (
      'customer_reply_needed',
      'quote_needed',
      'job_scheduling_needed',
      'invoice_followup',
      'calendar_followup',
      'rdo_followup',
      'maintenance_issue',
      'support_issue',
      'internal_admin_task',
      'unknown_review_needed'
    )
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  title text not null,
  summary text,
  suggested_next_action text,
  draft_response text,
  owner_user_id uuid references public.user_profiles (id) on delete set null,
  status text not null default 'open' check (status in ('open', 'assigned', 'resolved', 'ignored')),
  due_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz,
  unique (source, source_external_id)
);

create table if not exists public.ops_daily_brief (
  id uuid primary key default gen_random_uuid(),
  brief_date date not null unique,
  timezone text not null default 'America/Chicago',
  summary jsonb not null default '{}'::jsonb,
  slack_status text not null default 'not_sent' check (slack_status in ('not_sent', 'skipped', 'sent', 'error')),
  slack_error text,
  generated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_brief_item (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.ops_daily_brief (id) on delete cascade,
  loop_id uuid references public.ops_loops (id) on delete set null,
  source text not null check (source in ('gmail', 'calendar', 'jobber', 'twilio', 'slack', 'internal')),
  item_type text not null,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  title text not null,
  summary text,
  suggested_next_action text,
  payload_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists integration_account_provider_idx
  on public.integration_account (provider, status);

create index if not exists ops_loops_status_priority_idx
  on public.ops_loops (status, priority, due_at);

create index if not exists ops_loops_source_external_idx
  on public.ops_loops (source, source_external_id);

create index if not exists ops_loops_owner_idx
  on public.ops_loops (owner_user_id, status);

create index if not exists ops_daily_brief_date_idx
  on public.ops_daily_brief (brief_date desc);

create index if not exists ops_brief_item_brief_idx
  on public.ops_brief_item (brief_id, priority);

alter table public.integration_account enable row level security;
alter table public.ops_loops enable row level security;
alter table public.ops_daily_brief enable row level security;
alter table public.ops_brief_item enable row level security;

drop policy if exists integration_account_admin_select on public.integration_account;
create policy integration_account_admin_select on public.integration_account
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists ops_loops_admin_select on public.ops_loops;
create policy ops_loops_admin_select on public.ops_loops
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists ops_loops_admin_update on public.ops_loops;
create policy ops_loops_admin_update on public.ops_loops
  for update to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  ) with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists ops_daily_brief_admin_select on public.ops_daily_brief;
create policy ops_daily_brief_admin_select on public.ops_daily_brief
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists ops_brief_item_admin_select on public.ops_brief_item;
create policy ops_brief_item_admin_select on public.ops_brief_item
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

notify pgrst, 'reload schema';
