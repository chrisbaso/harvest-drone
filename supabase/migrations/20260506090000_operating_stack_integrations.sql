create extension if not exists pgcrypto;

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('gmail', 'calendar', 'google', 'jobber', 'quickbooks', 'twilio', 'slack', 'internal')),
  event_type text not null,
  external_id text,
  status text not null default 'received',
  payload_summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create table if not exists public.integration_external_links (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('google', 'jobber', 'quickbooks', 'twilio', 'slack', 'internal')),
  external_resource_type text not null,
  external_id text not null,
  local_table text,
  local_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider, external_resource_type, external_id)
);

create table if not exists public.sms_message_logs (
  id uuid primary key default gen_random_uuid(),
  direction text not null check (direction in ('inbound', 'outbound')),
  from_number text,
  to_number text,
  body_preview text,
  status text not null default 'queued',
  provider_message_id text,
  lead_id uuid references public.harvest_drone_leads (id) on delete set null,
  payload_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sms_opt_outs (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  opted_out boolean not null default true,
  source text not null default 'twilio',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.harvest_drone_leads
  add column if not exists jobber_external_id text,
  add column if not exists jobber_client_id text,
  add column if not exists jobber_request_id text,
  add column if not exists last_jobber_sync_at timestamptz;

alter table if exists public.crm_accounts
  add column if not exists jobber_external_id text,
  add column if not exists last_jobber_sync_at timestamptz;

alter table if exists public.crm_contacts
  add column if not exists jobber_external_id text,
  add column if not exists last_jobber_sync_at timestamptz;

alter table if exists public.crm_leads
  add column if not exists jobber_external_id text,
  add column if not exists last_jobber_sync_at timestamptz;

alter table if exists public.crm_opportunities
  add column if not exists jobber_external_id text,
  add column if not exists jobber_quote_id text,
  add column if not exists jobber_job_id text,
  add column if not exists jobber_invoice_id text,
  add column if not exists last_jobber_sync_at timestamptz;

alter table if exists public.application_jobs
  add column if not exists jobber_external_id text,
  add column if not exists jobber_job_id text,
  add column if not exists jobber_invoice_id text,
  add column if not exists last_jobber_sync_at timestamptz;

create index if not exists integration_events_provider_created_idx
  on public.integration_events (provider, created_at desc);

create index if not exists integration_events_status_idx
  on public.integration_events (status, created_at desc);

create index if not exists integration_external_links_local_idx
  on public.integration_external_links (local_table, local_id);

create index if not exists sms_message_logs_created_idx
  on public.sms_message_logs (created_at desc);

create index if not exists sms_message_logs_provider_message_idx
  on public.sms_message_logs (provider_message_id);

create index if not exists sms_opt_outs_phone_idx
  on public.sms_opt_outs (phone_number);

alter table public.integration_events enable row level security;
alter table public.integration_external_links enable row level security;
alter table public.sms_message_logs enable row level security;
alter table public.sms_opt_outs enable row level security;

drop policy if exists integration_events_admin_select on public.integration_events;
create policy integration_events_admin_select on public.integration_events
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists integration_external_links_admin_select on public.integration_external_links;
create policy integration_external_links_admin_select on public.integration_external_links
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists sms_message_logs_admin_select on public.sms_message_logs;
create policy sms_message_logs_admin_select on public.sms_message_logs
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists sms_opt_outs_admin_select on public.sms_opt_outs;
create policy sms_opt_outs_admin_select on public.sms_opt_outs
  for select to authenticated using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

notify pgrst, 'reload schema';
