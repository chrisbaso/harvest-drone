create extension if not exists pgcrypto;

create table if not exists public.harvest_drone_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  farm_name text,
  preferred_contact_method text,
  state text not null,
  county text,
  zip text,
  acreage_range text not null,
  crops text[] not null default '{}',
  application_method text not null,
  primary_goal text not null,
  decision_timing text not null,
  interest_level text not null,
  notes text,
  lead_score integer not null default 0,
  lead_tier text not null,
  recommended_action text not null,
  reason_codes jsonb not null default '[]'::jsonb,
  source text not null default 'Harvest Drone Funnel',
  campaign text,
  ad_set text,
  ad_name text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  landing_page_url text,
  referrer text,
  status text not null default 'New',
  assigned_to text,
  last_contacted_at timestamptz,
  follow_up_stage text not null default 'none',
  revenue_status text not null default 'unconfirmed',
  estimated_acres integer,
  estimated_value numeric,
  actual_revenue numeric,
  internal_notes text,
  lead_summary jsonb not null default '{}'::jsonb,
  result_headline text,
  result_body text,
  result_cta text,
  offer_path text
);

alter table public.harvest_drone_leads
  add column if not exists offer_path text;

create table if not exists public.harvest_drone_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  lead_id uuid references public.harvest_drone_leads (id) on delete cascade,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb
);

create index if not exists harvest_drone_leads_created_at_idx
  on public.harvest_drone_leads (created_at desc);

create index if not exists harvest_drone_leads_tier_idx
  on public.harvest_drone_leads (lead_tier);

create index if not exists harvest_drone_leads_status_idx
  on public.harvest_drone_leads (status);

create index if not exists harvest_drone_leads_state_idx
  on public.harvest_drone_leads (state);

create index if not exists harvest_drone_events_lead_id_idx
  on public.harvest_drone_events (lead_id, created_at desc);

alter table if exists public.harvest_drone_leads enable row level security;
alter table if exists public.harvest_drone_events enable row level security;

drop policy if exists "Authenticated can read harvest drone leads" on public.harvest_drone_leads;
create policy "Authenticated can read harvest drone leads"
on public.harvest_drone_leads
for select
to authenticated
using (true);

drop policy if exists "Authenticated can read harvest drone events" on public.harvest_drone_events;
create policy "Authenticated can read harvest drone events"
on public.harvest_drone_events
for select
to authenticated
using (true);

notify pgrst, 'reload schema';
