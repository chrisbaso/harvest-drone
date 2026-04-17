create extension if not exists pgcrypto;

create table if not exists public.grower_leads (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new',
  lead_source text not null default 'website-grower-funnel',
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  first_name text not null,
  last_name text not null,
  mobile text not null,
  email text not null,
  state text not null,
  county text,
  farm_name text,
  crop_type text,
  acres numeric,
  interest_type text,
  route_type text,
  lead_score integer not null default 0,
  assigned_to text,
  assigned_operator_id uuid references public.operator_leads (id) on delete set null,
  current_spraying_method text,
  interested_in_product_recommendations boolean,
  notes text
);

alter table public.grower_leads
  add column if not exists sequence_state text not null default 'pending',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists source text,
  add column if not exists county text,
  add column if not exists interest_type text,
  add column if not exists route_type text,
  add column if not exists lead_score integer not null default 0,
  add column if not exists assigned_to text,
  add column if not exists assigned_operator_id uuid references public.operator_leads (id) on delete set null;

create table if not exists public.operator_leads (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new',
  lead_source text not null default 'website-operator-funnel',
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  first_name text not null,
  last_name text not null,
  mobile text not null,
  email text not null,
  state text not null,
  company_name text,
  counties_served text,
  acreage_access numeric,
  equipment_details text,
  compliance_status text,
  acreage_capacity numeric,
  operator_score integer not null default 0,
  interest_type text,
  experience_level text,
  budget_range text,
  lead_tag text,
  calculator_acres_per_month numeric,
  calculator_revenue_per_acre numeric,
  calculator_months_active_per_year numeric,
  calculator_equipment_cost numeric,
  calculator_growth_factor numeric,
  call_notes text,
  next_action_date timestamptz,
  owns_spray_drone boolean,
  drone_model text,
  licensed_for_application boolean,
  service_radius text,
  acres_capacity_per_week numeric,
  interested_in_buying_drone boolean,
  notes text
);

alter table public.operator_leads
  add column if not exists sequence_state text not null default 'pending',
  add column if not exists last_contacted_at timestamptz,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists source text,
  add column if not exists counties_served text,
  add column if not exists acreage_access numeric,
  add column if not exists equipment_details text,
  add column if not exists compliance_status text,
  add column if not exists acreage_capacity numeric,
  add column if not exists operator_score integer not null default 0,
  add column if not exists interest_type text,
  add column if not exists experience_level text,
  add column if not exists budget_range text,
  add column if not exists lead_tag text,
  add column if not exists calculator_acres_per_month numeric,
  add column if not exists calculator_revenue_per_acre numeric,
  add column if not exists calculator_months_active_per_year numeric,
  add column if not exists calculator_equipment_cost numeric,
  add column if not exists calculator_growth_factor numeric,
  add column if not exists call_notes text,
  add column if not exists next_action_date timestamptz;

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'unassigned',
  lead_source text not null default 'grower-qualification',
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  grower_lead_id uuid references public.grower_leads (id) on delete set null,
  assigned_operator_id uuid references public.operator_leads (id) on delete set null,
  assigned_to text,
  title text not null,
  state text,
  county text,
  crop_type text,
  acres numeric,
  route_type text,
  notes text
);

alter table public.jobs
  add column if not exists source text,
  add column if not exists assigned_to text,
  add column if not exists county text,
  add column if not exists route_type text;

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  lead_type text not null check (lead_type in ('grower', 'operator')),
  lead_id uuid not null,
  activity_type text not null,
  status text not null default 'completed',
  channel text,
  template_key text,
  subject text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null,
  account_type text not null check (account_type in ('grower', 'operator', 'hylio', 'dealer', 'partner')),
  owner text,
  state text,
  county text,
  acres numeric,
  source text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  first_name text not null,
  last_name text,
  full_name text not null,
  email text,
  mobile text,
  contact_type text not null check (contact_type in ('grower', 'operator', 'hylio', 'dealer', 'partner')),
  owner text,
  state text,
  county text,
  title text,
  source text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  lead_type text not null check (lead_type in ('grower', 'operator', 'hylio', 'dealer')),
  stage text not null default 'new',
  route_type text,
  owner text,
  source text,
  state text,
  county text,
  acres numeric,
  revenue_stream text,
  assigned_operator_id uuid references public.operator_leads (id) on delete set null,
  legacy_grower_lead_id uuid references public.grower_leads (id) on delete set null,
  legacy_operator_lead_id uuid references public.operator_leads (id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_opportunities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  lead_id uuid references public.crm_leads (id) on delete set null,
  opportunity_type text not null check (
    opportunity_type in (
      'grower_direct',
      'operator_routed',
      'hylio_sale',
      'dealer_distribution',
      'earthoptics_distribution',
      'sound_ag_direct'
    )
  ),
  stage text not null default 'open',
  route_type text,
  owner text,
  state text,
  county text,
  acres numeric,
  estimated_value numeric not null default 0,
  revenue_stream text,
  hylio_budget_range text,
  hylio_experience_level text,
  hylio_area_qualified boolean,
  legacy_job_id uuid references public.jobs (id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_acres (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  lead_id uuid references public.crm_leads (id) on delete set null,
  opportunity_id uuid references public.crm_opportunities (id) on delete set null,
  acres numeric not null default 0,
  crop_type text,
  state text,
  county text,
  route_type text,
  owner text,
  source text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_operators (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  lead_id uuid references public.crm_leads (id) on delete set null,
  legacy_operator_lead_id uuid references public.operator_leads (id) on delete set null,
  operator_type text not null check (operator_type in ('operator', 'hylio', 'dealer', 'partner')),
  status text not null default 'new',
  state text,
  counties_served text,
  acreage_capacity numeric,
  equipment_details text,
  compliance_status text,
  experience_level text,
  budget_range text,
  owner text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  account_id uuid references public.crm_accounts (id) on delete set null,
  contact_id uuid references public.crm_contacts (id) on delete set null,
  lead_id uuid references public.crm_leads (id) on delete set null,
  opportunity_id uuid references public.crm_opportunities (id) on delete set null,
  activity_type text not null,
  stage text,
  owner text,
  state text,
  subject text,
  outcome text,
  due_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.source_orders (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  email text,
  state text,
  county text,
  crop_type text,
  acres integer,
  product text default 'SOURCE',
  estimated_total numeric,
  order_type text,
  status text default 'pending',
  invoice_reminder_sent timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.automation_flags (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  email text not null,
  action text not null,
  tag text,
  processed boolean not null default false,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  email text,
  phone text,
  page_url text,
  conversation jsonb,
  lead_captured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.agent_action_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  executed_at timestamptz,
  action_type text not null,
  target_table text not null,
  target_id uuid,
  target_label text,
  request_message text,
  reason text,
  updates jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  result_summary text,
  error_message text
);

create index if not exists grower_leads_status_idx on public.grower_leads (status);
create index if not exists grower_leads_created_at_idx on public.grower_leads (created_at desc);
create index if not exists grower_leads_sequence_state_idx on public.grower_leads (sequence_state);
create index if not exists grower_leads_next_follow_up_idx on public.grower_leads (next_follow_up_at);
create index if not exists grower_leads_route_type_idx on public.grower_leads (route_type);
create index if not exists grower_leads_state_county_idx on public.grower_leads (state, county);
create index if not exists operator_leads_status_idx on public.operator_leads (status);
create index if not exists operator_leads_created_at_idx on public.operator_leads (created_at desc);
create index if not exists operator_leads_sequence_state_idx on public.operator_leads (sequence_state);
create index if not exists operator_leads_next_follow_up_idx on public.operator_leads (next_follow_up_at);
create index if not exists operator_leads_state_status_idx on public.operator_leads (state, status);
create index if not exists jobs_status_idx on public.jobs (status);
create index if not exists jobs_created_at_idx on public.jobs (created_at desc);
create index if not exists jobs_route_type_idx on public.jobs (route_type);
create index if not exists lead_activities_created_at_idx on public.lead_activities (created_at desc);
create index if not exists lead_activities_lead_lookup_idx on public.lead_activities (lead_type, lead_id, created_at desc);
create index if not exists crm_accounts_type_idx on public.crm_accounts (account_type);
create index if not exists crm_accounts_state_idx on public.crm_accounts (state);
create index if not exists crm_contacts_type_idx on public.crm_contacts (contact_type);
create index if not exists crm_contacts_owner_idx on public.crm_contacts (owner);
create index if not exists crm_leads_type_stage_idx on public.crm_leads (lead_type, stage);
create index if not exists crm_leads_route_type_idx on public.crm_leads (route_type);
create index if not exists crm_leads_state_idx on public.crm_leads (state);
create index if not exists crm_leads_owner_idx on public.crm_leads (owner);
create index if not exists crm_opportunities_type_stage_idx on public.crm_opportunities (opportunity_type, stage);
create index if not exists crm_opportunities_route_type_idx on public.crm_opportunities (route_type);
create index if not exists crm_opportunities_owner_idx on public.crm_opportunities (owner);
create index if not exists crm_opportunities_state_idx on public.crm_opportunities (state);
create index if not exists crm_acres_lead_idx on public.crm_acres (lead_id);
create index if not exists crm_acres_route_type_idx on public.crm_acres (route_type);
create index if not exists crm_acres_state_idx on public.crm_acres (state);
create index if not exists crm_operators_status_idx on public.crm_operators (status);
create index if not exists crm_operators_type_idx on public.crm_operators (operator_type);
create index if not exists crm_activities_created_at_idx on public.crm_activities (created_at desc);
create index if not exists crm_activities_owner_idx on public.crm_activities (owner);
create index if not exists source_orders_created_at_idx on public.source_orders (created_at desc);
create index if not exists source_orders_status_idx on public.source_orders (status);
create index if not exists automation_flags_processed_idx on public.automation_flags (processed, created_at desc);
create index if not exists idx_chat_leads_captured on public.chat_leads (lead_captured);
create index if not exists idx_chat_leads_created on public.chat_leads (created_at desc);
create index if not exists agent_action_logs_created_at_idx on public.agent_action_logs (created_at desc);
create index if not exists agent_action_logs_action_type_idx on public.agent_action_logs (action_type);

alter table public.grower_leads enable row level security;
alter table public.operator_leads enable row level security;
alter table public.jobs enable row level security;
alter table public.lead_activities enable row level security;
alter table public.crm_accounts enable row level security;
alter table public.crm_contacts enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_opportunities enable row level security;
alter table public.crm_acres enable row level security;
alter table public.crm_operators enable row level security;
alter table public.crm_activities enable row level security;
alter table public.source_orders enable row level security;
alter table public.automation_flags enable row level security;
alter table public.chat_leads enable row level security;
alter table public.agent_action_logs enable row level security;

drop policy if exists "Public can insert grower leads" on public.grower_leads;
create policy "Public can insert grower leads"
on public.grower_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Public can insert operator leads" on public.operator_leads;
create policy "Public can insert operator leads"
on public.operator_leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Authenticated users can read grower leads" on public.grower_leads;
drop policy if exists "Public can read grower leads" on public.grower_leads;
create policy "Public can read grower leads"
on public.grower_leads
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can read operator leads" on public.operator_leads;
drop policy if exists "Public can read operator leads" on public.operator_leads;
create policy "Public can read operator leads"
on public.operator_leads
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can read jobs" on public.jobs;
drop policy if exists "Public can read jobs" on public.jobs;
create policy "Public can read jobs"
on public.jobs
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage jobs" on public.jobs;
drop policy if exists "Public can manage jobs" on public.jobs;
create policy "Public can manage jobs"
on public.jobs
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read lead activities" on public.lead_activities;
create policy "Public can read lead activities"
on public.lead_activities
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read crm accounts" on public.crm_accounts;
create policy "Public can read crm accounts"
on public.crm_accounts
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm accounts" on public.crm_accounts;
create policy "Public can manage crm accounts"
on public.crm_accounts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read crm contacts" on public.crm_contacts;
create policy "Public can read crm contacts"
on public.crm_contacts
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm contacts" on public.crm_contacts;
create policy "Public can manage crm contacts"
on public.crm_contacts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read crm leads" on public.crm_leads;
create policy "Public can read crm leads"
on public.crm_leads
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm leads" on public.crm_leads;
create policy "Public can manage crm leads"
on public.crm_leads
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can read agent action logs" on public.agent_action_logs;
create policy "Authenticated users can read agent action logs"
on public.agent_action_logs
for select
to authenticated
using (true);

drop policy if exists "Allow anon insert on source_orders" on public.source_orders;
create policy "Allow anon insert on source_orders"
on public.source_orders
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow authenticated read on source_orders" on public.source_orders;
create policy "Allow authenticated read on source_orders"
on public.source_orders
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can manage automation flags" on public.automation_flags;
create policy "Authenticated users can manage automation flags"
on public.automation_flags
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read chat leads" on public.chat_leads;
create policy "Public can read chat leads"
on public.chat_leads
for select
to anon, authenticated
using (true);

drop policy if exists "Public can read crm opportunities" on public.crm_opportunities;
create policy "Public can read crm opportunities"
on public.crm_opportunities
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm opportunities" on public.crm_opportunities;
create policy "Public can manage crm opportunities"
on public.crm_opportunities
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read crm acres" on public.crm_acres;
create policy "Public can read crm acres"
on public.crm_acres
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm acres" on public.crm_acres;
create policy "Public can manage crm acres"
on public.crm_acres
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read crm operators" on public.crm_operators;
create policy "Public can read crm operators"
on public.crm_operators
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm operators" on public.crm_operators;
create policy "Public can manage crm operators"
on public.crm_operators
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Public can read crm activities" on public.crm_activities;
create policy "Public can read crm activities"
on public.crm_activities
for select
to anon, authenticated
using (true);

drop policy if exists "Public can manage crm activities" on public.crm_activities;
create policy "Public can manage crm activities"
on public.crm_activities
for all
to anon, authenticated
using (true)
with check (true);

notify pgrst, 'reload schema';
