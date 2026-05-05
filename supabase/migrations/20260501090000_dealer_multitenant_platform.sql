create extension if not exists pgcrypto;

create table if not exists public.dealer_networks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  network_id uuid references public.dealer_networks(id) on delete set null,
  name text not null,
  slug text unique not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  state text,
  counties_served text[],
  territory_description text,
  is_active boolean default true,
  onboarded_at timestamptz,
  training_status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'dealer' check (role in ('admin', 'network_manager', 'dealer', 'operator')),
  dealer_id uuid references public.dealers(id) on delete set null,
  network_id uuid references public.dealer_networks(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.grower_leads add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.grower_leads add column if not exists dealer_slug text;
alter table public.operator_leads add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.operator_leads add column if not exists dealer_slug text;
alter table public.source_orders add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.source_orders add column if not exists dealer_slug text;
alter table public.crm_leads add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.jobs add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.harvest_drone_leads add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table public.harvest_drone_leads add column if not exists dealer_slug text;

alter table if exists public.training_enrollments add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table if exists public.lesson_progress add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table if exists public.assessment_attempts add column if not exists dealer_id uuid references public.dealers(id) on delete set null;
alter table if exists public.operator_credentials add column if not exists dealer_id uuid references public.dealers(id) on delete set null;

create index if not exists idx_dealers_network on public.dealers(network_id);
create index if not exists idx_dealers_state on public.dealers(state);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_dealer on public.user_profiles(dealer_id);
create index if not exists idx_grower_leads_dealer on public.grower_leads(dealer_id);
create index if not exists idx_operator_leads_dealer on public.operator_leads(dealer_id);
create index if not exists idx_source_orders_dealer on public.source_orders(dealer_id);
create index if not exists idx_crm_leads_dealer on public.crm_leads(dealer_id);
create index if not exists idx_harvest_drone_leads_dealer on public.harvest_drone_leads(dealer_id);

create or replace function public.get_user_role()
returns text as $$
  select role from public.user_profiles where id = auth.uid() and is_active = true;
$$ language sql security definer stable;

create or replace function public.get_user_dealer_id()
returns uuid as $$
  select dealer_id from public.user_profiles where id = auth.uid() and is_active = true;
$$ language sql security definer stable;

create or replace function public.get_user_network_id()
returns uuid as $$
  select network_id from public.user_profiles where id = auth.uid() and is_active = true;
$$ language sql security definer stable;

alter table public.dealer_networks enable row level security;
alter table public.dealers enable row level security;
alter table public.user_profiles enable row level security;
alter table public.grower_leads enable row level security;
alter table public.operator_leads enable row level security;
alter table public.source_orders enable row level security;
alter table public.crm_leads enable row level security;
alter table public.jobs enable row level security;
alter table public.harvest_drone_leads enable row level security;

drop policy if exists dealer_networks_access on public.dealer_networks;
create policy dealer_networks_access on public.dealer_networks
  for select using (
    public.get_user_role() = 'admin'
    or id = public.get_user_network_id()
  );

drop policy if exists dealers_access on public.dealers;
create policy dealers_access on public.dealers
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and network_id = public.get_user_network_id())
    or (public.get_user_role() = 'dealer' and id = public.get_user_dealer_id())
  );

drop policy if exists dealer_onboarding_insert on public.dealers;
create policy dealer_onboarding_insert on public.dealers
  for insert to anon, authenticated with check (true);

drop policy if exists user_profiles_access on public.user_profiles;
create policy user_profiles_access on public.user_profiles
  for select using (
    public.get_user_role() = 'admin'
    or id = auth.uid()
    or (public.get_user_role() = 'network_manager' and network_id = public.get_user_network_id())
  );

drop policy if exists user_profiles_onboarding_insert on public.user_profiles;
create policy user_profiles_onboarding_insert on public.user_profiles
  for insert to authenticated with check (id = auth.uid() and role in ('dealer', 'operator'));

drop policy if exists grower_leads_access on public.grower_leads;
create policy grower_leads_access on public.grower_leads
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

drop policy if exists operator_leads_access on public.operator_leads;
create policy operator_leads_access on public.operator_leads
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

drop policy if exists source_orders_access on public.source_orders;
create policy source_orders_access on public.source_orders
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

drop policy if exists source_orders_public_insert on public.source_orders;
create policy source_orders_public_insert on public.source_orders
  for insert to anon, authenticated with check (true);

drop policy if exists crm_leads_access on public.crm_leads;
create policy crm_leads_access on public.crm_leads
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

drop policy if exists jobs_access on public.jobs;
create policy jobs_access on public.jobs
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

drop policy if exists harvest_drone_leads_access on public.harvest_drone_leads;
create policy harvest_drone_leads_access on public.harvest_drone_leads
  for select using (
    public.get_user_role() = 'admin'
    or (public.get_user_role() = 'network_manager' and dealer_id in (select id from public.dealers where network_id = public.get_user_network_id()))
    or (public.get_user_role() = 'dealer' and dealer_id = public.get_user_dealer_id())
  );

insert into public.dealer_networks (name, slug, contact_name, contact_email)
values ('Harvest Demo Network', 'harvest-demo-network', 'Demo Contact', 'demo@harvestdrone.local')
on conflict (slug) do update set name = excluded.name, contact_name = excluded.contact_name, contact_email = excluded.contact_email;

insert into public.dealers (network_id, name, slug, state, counties_served, training_status, is_active)
values
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'Harvest Demo Territory', 'demo-territory', 'Upper Midwest', array['Demo County A', 'Demo County B', 'Demo County C'], 'active', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'North Demo Territory', 'north-demo-territory', 'Northern Plains', array['Demo County D', 'Demo County E', 'Demo County F'], 'qualified', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'South Demo Territory', 'south-demo-territory', 'Southern Plains', array['Demo County G', 'Demo County H', 'Demo County I'], 'in_progress', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'East Demo Territory', 'east-demo-territory', 'Eastern Corn Belt', array['Demo County J', 'Demo County K', 'Demo County L'], 'active', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'West Demo Territory', 'west-demo-territory', 'Western Plains', array['Demo County M', 'Demo County N', 'Demo County O'], 'pending', true)
on conflict (slug) do update set
  network_id = excluded.network_id,
  name = excluded.name,
  state = excluded.state,
  counties_served = excluded.counties_served,
  training_status = excluded.training_status,
  is_active = excluded.is_active;

notify pgrst, 'reload schema';
