create extension if not exists pgcrypto;

-- Field operations role overlay. Existing app roles stay intact; ops_role lets
-- Harvest Drone add dispatcher/sales semantics without breaking legacy auth.
alter table public.user_profiles
  add column if not exists ops_role text;

do $$
begin
  alter table public.user_profiles
    add constraint user_profiles_ops_role_check
    check (
      ops_role is null
      or ops_role in ('admin', 'owner', 'dispatcher', 'ops_manager', 'sales', 'lead_manager', 'operator')
    );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  company_name text,
  email text,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  zip text,
  notes text,
  source text,
  jobber_client_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  address_line_1 text,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.fields
  add column if not exists farm_id uuid references public.farms (id) on delete set null,
  add column if not exists crop_type text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  description text,
  default_rate_per_acre numeric,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, name)
);

create table if not exists public.operator_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  phone text,
  email text,
  certification_status text not null default 'pending_review',
  service_regions text[] not null default '{}'::text[],
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ops_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete restrict,
  farm_id uuid references public.farms (id) on delete set null,
  field_id uuid references public.fields (id) on delete set null,
  title text not null,
  service_type text not null,
  crop_type text,
  acres numeric,
  status text not null default 'new_request' check (
    status in (
      'new_request',
      'qualified',
      'quoted',
      'scheduled',
      'operator_assigned',
      'pre_flight',
      'in_progress',
      'completed',
      'needs_review',
      'invoice_needed',
      'closed',
      'cancelled'
    )
  ),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  requested_date date,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  assigned_operator_id uuid references public.operator_profiles (id) on delete set null,
  application_product text,
  source_interest boolean not null default false,
  notes text,
  internal_notes text,
  metadata_json jsonb not null default '{}'::jsonb,
  invoice_needed boolean not null default false,
  jobber_job_id text,
  jobber_request_id text,
  created_from_lead_id uuid references public.harvest_drone_leads (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid not null references public.ops_jobs (id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references auth.users (id) on delete set null,
  changed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid not null references public.ops_jobs (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  note text not null,
  visibility text not null default 'internal' check (visibility in ('internal', 'operator', 'customer')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_checklists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid not null references public.ops_jobs (id) on delete cascade,
  checklist_type text not null,
  items_json jsonb not null default '[]'::jsonb,
  completed_by uuid references auth.users (id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_attachments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  job_id uuid not null references public.ops_jobs (id) on delete cascade,
  file_url text not null,
  file_name text not null,
  file_type text,
  uploaded_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.jobber_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  local_entity_type text not null,
  local_entity_id uuid not null,
  jobber_entity_type text not null,
  jobber_entity_id text not null,
  jobber_url text,
  sync_status text not null default 'not_synced' check (sync_status in ('not_synced', 'synced', 'manual', 'external')),
  last_synced_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fleet_assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  serial_number text,
  model text,
  assigned_operator_id uuid references public.operator_profiles (id) on delete set null,
  home_base text,
  status text not null default 'at_yard' check (status in ('at_yard', 'in_transit', 'on_site', 'flying', 'complete', 'offline')),
  last_latitude numeric,
  last_longitude numeric,
  last_accuracy_meters numeric,
  last_seen_at timestamptz,
  current_job_id uuid references public.ops_jobs (id) on delete set null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, serial_number)
);

create table if not exists public.fleet_location_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  fleet_asset_id uuid references public.fleet_assets (id) on delete set null,
  operator_id uuid references public.operator_profiles (id) on delete set null,
  job_id uuid references public.ops_jobs (id) on delete set null,
  status text not null check (status in ('at_yard', 'in_transit', 'on_site', 'flying', 'complete', 'offline')),
  latitude numeric,
  longitude numeric,
  accuracy_meters numeric,
  note text,
  source text not null default 'operator_checkin',
  captured_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clients_org_name_idx on public.clients (organization_id, name);
create index if not exists farms_org_client_idx on public.farms (organization_id, client_id);
create index if not exists fields_ops_farm_idx on public.fields (organization_id, farm_id);
create index if not exists services_org_active_idx on public.services (organization_id, active);
create index if not exists operator_profiles_org_active_idx on public.operator_profiles (organization_id, active);
create index if not exists operator_profiles_user_idx on public.operator_profiles (user_id) where user_id is not null;
create index if not exists ops_jobs_org_status_idx on public.ops_jobs (organization_id, status);
create index if not exists ops_jobs_schedule_idx on public.ops_jobs (organization_id, scheduled_start);
create index if not exists ops_jobs_operator_idx on public.ops_jobs (assigned_operator_id, scheduled_start);
create index if not exists ops_jobs_client_idx on public.ops_jobs (client_id, created_at desc);
create index if not exists ops_jobs_lead_idx on public.ops_jobs (created_from_lead_id) where created_from_lead_id is not null;
create index if not exists job_notes_job_idx on public.job_notes (job_id, created_at desc);
create index if not exists job_checklists_job_idx on public.job_checklists (job_id, checklist_type);
create index if not exists job_status_history_job_idx on public.job_status_history (job_id, changed_at desc);
create index if not exists jobber_links_local_idx on public.jobber_links (local_entity_type, local_entity_id);
create index if not exists fleet_assets_org_status_idx on public.fleet_assets (organization_id, status, active);
create index if not exists fleet_assets_operator_idx on public.fleet_assets (assigned_operator_id) where assigned_operator_id is not null;
create index if not exists fleet_location_events_asset_idx on public.fleet_location_events (fleet_asset_id, captured_at desc);
create index if not exists fleet_location_events_job_idx on public.fleet_location_events (job_id, captured_at desc);

create or replace function public.can_manage_field_ops_org(target_organization_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select public.is_harvest_admin()
    or exists (
      select 1
      from public.organization_members member
      where member.organization_id = target_organization_id
        and member.user_id = auth.uid()
        and member.is_active = true
        and member.role in ('org_admin', 'operations_manager', 'crop_manager', 'compliance_reviewer', 'harvest_support')
    );
$$;

create or replace function public.is_assigned_field_ops_operator(target_operator_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.operator_profiles operator
    where operator.id = target_operator_id
      and operator.user_id = auth.uid()
      and operator.active = true
  );
$$;

create or replace function public.can_access_field_ops_job(target_job_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.ops_jobs job
    where job.id = target_job_id
      and (
        public.can_manage_field_ops_org(job.organization_id)
        or public.is_assigned_field_ops_operator(job.assigned_operator_id)
      )
  );
$$;

alter table public.clients enable row level security;
alter table public.farms enable row level security;
alter table public.services enable row level security;
alter table public.operator_profiles enable row level security;
alter table public.ops_jobs enable row level security;
alter table public.job_status_history enable row level security;
alter table public.job_notes enable row level security;
alter table public.job_checklists enable row level security;
alter table public.job_attachments enable row level security;
alter table public.activity_log enable row level security;
alter table public.jobber_links enable row level security;
alter table public.fleet_assets enable row level security;
alter table public.fleet_location_events enable row level security;

drop policy if exists clients_select_field_ops on public.clients;
create policy clients_select_field_ops on public.clients
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or exists (
      select 1
      from public.ops_jobs job
      where job.client_id = clients.id
        and public.is_assigned_field_ops_operator(job.assigned_operator_id)
    )
  );

drop policy if exists clients_manage_field_ops on public.clients;
create policy clients_manage_field_ops on public.clients
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists farms_select_field_ops on public.farms;
create policy farms_select_field_ops on public.farms
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or exists (
      select 1
      from public.ops_jobs job
      where job.farm_id = farms.id
        and public.is_assigned_field_ops_operator(job.assigned_operator_id)
    )
  );

drop policy if exists farms_manage_field_ops on public.farms;
create policy farms_manage_field_ops on public.farms
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists fields_select_assigned_field_ops on public.fields;
create policy fields_select_assigned_field_ops on public.fields
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.ops_jobs job
      where job.field_id = fields.id
        and public.is_assigned_field_ops_operator(job.assigned_operator_id)
    )
  );

drop policy if exists services_select_field_ops on public.services;
create policy services_select_field_ops on public.services
  for select
  to authenticated
  using (public.can_manage_field_ops_org(organization_id));

drop policy if exists services_manage_field_ops on public.services;
create policy services_manage_field_ops on public.services
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists operator_profiles_select_field_ops on public.operator_profiles;
create policy operator_profiles_select_field_ops on public.operator_profiles
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or user_id = auth.uid()
  );

drop policy if exists operator_profiles_manage_field_ops on public.operator_profiles;
create policy operator_profiles_manage_field_ops on public.operator_profiles
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists ops_jobs_select_field_ops on public.ops_jobs;
create policy ops_jobs_select_field_ops on public.ops_jobs
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or public.is_assigned_field_ops_operator(assigned_operator_id)
  );

drop policy if exists ops_jobs_manage_field_ops on public.ops_jobs;
create policy ops_jobs_manage_field_ops on public.ops_jobs
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists ops_jobs_operator_update on public.ops_jobs;
create policy ops_jobs_operator_update on public.ops_jobs
  for update
  to authenticated
  using (public.is_assigned_field_ops_operator(assigned_operator_id))
  with check (public.is_assigned_field_ops_operator(assigned_operator_id));

drop policy if exists job_status_history_select_field_ops on public.job_status_history;
create policy job_status_history_select_field_ops on public.job_status_history
  for select
  to authenticated
  using (public.can_access_field_ops_job(job_id));

drop policy if exists job_status_history_insert_field_ops on public.job_status_history;
create policy job_status_history_insert_field_ops on public.job_status_history
  for insert
  to authenticated
  with check (public.can_access_field_ops_job(job_id));

drop policy if exists job_notes_select_field_ops on public.job_notes;
create policy job_notes_select_field_ops on public.job_notes
  for select
  to authenticated
  using (public.can_access_field_ops_job(job_id));

drop policy if exists job_notes_insert_field_ops on public.job_notes;
create policy job_notes_insert_field_ops on public.job_notes
  for insert
  to authenticated
  with check (public.can_access_field_ops_job(job_id));

drop policy if exists job_notes_update_field_ops on public.job_notes;
create policy job_notes_update_field_ops on public.job_notes
  for update
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists job_checklists_select_field_ops on public.job_checklists;
create policy job_checklists_select_field_ops on public.job_checklists
  for select
  to authenticated
  using (public.can_access_field_ops_job(job_id));

drop policy if exists job_checklists_manage_field_ops on public.job_checklists;
create policy job_checklists_manage_field_ops on public.job_checklists
  for all
  to authenticated
  using (public.can_access_field_ops_job(job_id))
  with check (public.can_access_field_ops_job(job_id));

drop policy if exists job_attachments_select_field_ops on public.job_attachments;
create policy job_attachments_select_field_ops on public.job_attachments
  for select
  to authenticated
  using (public.can_access_field_ops_job(job_id));

drop policy if exists job_attachments_manage_field_ops on public.job_attachments;
create policy job_attachments_manage_field_ops on public.job_attachments
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists activity_log_select_field_ops on public.activity_log;
create policy activity_log_select_field_ops on public.activity_log
  for select
  to authenticated
  using (public.can_manage_field_ops_org(organization_id));

drop policy if exists activity_log_insert_field_ops on public.activity_log;
create policy activity_log_insert_field_ops on public.activity_log
  for insert
  to authenticated
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists jobber_links_select_field_ops on public.jobber_links;
create policy jobber_links_select_field_ops on public.jobber_links
  for select
  to authenticated
  using (public.can_manage_field_ops_org(organization_id));

drop policy if exists jobber_links_manage_field_ops on public.jobber_links;
create policy jobber_links_manage_field_ops on public.jobber_links
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists fleet_assets_select_field_ops on public.fleet_assets;
create policy fleet_assets_select_field_ops on public.fleet_assets
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or public.is_assigned_field_ops_operator(assigned_operator_id)
  );

drop policy if exists fleet_assets_manage_field_ops on public.fleet_assets;
create policy fleet_assets_manage_field_ops on public.fleet_assets
  for all
  to authenticated
  using (public.can_manage_field_ops_org(organization_id))
  with check (public.can_manage_field_ops_org(organization_id));

drop policy if exists fleet_assets_operator_checkin_field_ops on public.fleet_assets;
create policy fleet_assets_operator_checkin_field_ops on public.fleet_assets
  for update
  to authenticated
  using (public.is_assigned_field_ops_operator(assigned_operator_id))
  with check (public.is_assigned_field_ops_operator(assigned_operator_id));

drop policy if exists fleet_location_events_select_field_ops on public.fleet_location_events;
create policy fleet_location_events_select_field_ops on public.fleet_location_events
  for select
  to authenticated
  using (
    public.can_manage_field_ops_org(organization_id)
    or public.is_assigned_field_ops_operator(operator_id)
    or exists (
      select 1
      from public.fleet_assets asset
      where asset.id = fleet_location_events.fleet_asset_id
        and public.is_assigned_field_ops_operator(asset.assigned_operator_id)
    )
  );

drop policy if exists fleet_location_events_insert_field_ops on public.fleet_location_events;
create policy fleet_location_events_insert_field_ops on public.fleet_location_events
  for insert
  to authenticated
  with check (
    public.can_manage_field_ops_org(organization_id)
    or public.is_assigned_field_ops_operator(operator_id)
    or (job_id is not null and public.can_access_field_ops_job(job_id))
  );

grant select, insert, update, delete on
  public.clients,
  public.farms,
  public.services,
  public.operator_profiles,
  public.ops_jobs,
  public.job_status_history,
  public.job_notes,
  public.job_checklists,
  public.job_attachments,
  public.activity_log,
  public.jobber_links,
  public.fleet_assets,
  public.fleet_location_events
to authenticated;

grant select, insert, update on public.fields to authenticated;

-- Demo seed data for local previews and first workspace walkthroughs.
insert into public.organizations (id, name, short_name, organization_type, headquarters, operating_states, metadata)
values (
  '33333333-3333-4333-8333-333333333333',
  'Harvest Drone Field Ops',
  'HD Ops',
  'field_operations',
  'Minnesota',
  array['MN', 'IA', 'ND', 'SD'],
  '{"purpose":"Internal Harvest Drone field operations demo"}'::jsonb
)
on conflict (id) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  organization_type = excluded.organization_type,
  headquarters = excluded.headquarters,
  operating_states = excluded.operating_states,
  metadata = excluded.metadata,
  updated_at = timezone('utc', now());

insert into public.clients (id, organization_id, name, company_name, email, phone, address_line_1, city, state, zip, notes, source, jobber_client_id)
values
  ('44444444-4444-4444-8444-000000000001', '33333333-3333-4333-8333-333333333333', 'Miller Family Farms', 'Miller Family Farms', 'sam@millerfarms.example', '555-0101', '412 County Road 8', 'Marshall', 'MN', '56258', 'Potato and corn acres. Prefers text before dispatch.', 'Harvest Drone Funnel', 'JB-C-1024'),
  ('44444444-4444-4444-8444-000000000002', '33333333-3333-4333-8333-333333333333', 'Nelson Ag', 'Nelson Ag', 'riley@nelsonag.example', '555-0102', '88 Prairie View', 'Redwood Falls', 'MN', '56283', 'Interested in SOURCE consultation and spot treatment.', 'Referral', null),
  ('44444444-4444-4444-8444-000000000003', '33333333-3333-4333-8333-333333333333', 'Carter Acres', 'Carter Acres', 'devon@carteracres.example', '555-0103', '1930 River Bend Road', 'Willmar', 'MN', '56201', 'High-touch customer, wants completion notes quickly.', 'Jobber', 'JB-C-2048')
on conflict (id) do update set
  name = excluded.name,
  company_name = excluded.company_name,
  email = excluded.email,
  phone = excluded.phone,
  notes = excluded.notes,
  jobber_client_id = excluded.jobber_client_id,
  updated_at = timezone('utc', now());

insert into public.farms (id, organization_id, client_id, name, address_line_1, city, state, zip, latitude, longitude, notes)
values
  ('55555555-5555-4555-8555-000000000001', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000001', 'Miller Home Farm', '412 County Road 8', 'Marshall', 'MN', '56258', 44.446, -95.79, 'South entrance has the best staging area.'),
  ('55555555-5555-4555-8555-000000000002', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000002', 'Nelson West Farm', '88 Prairie View', 'Redwood Falls', 'MN', '56283', null, null, 'Confirm county road access before hauling.'),
  ('55555555-5555-4555-8555-000000000003', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000003', 'River Bend Farm', '1930 River Bend Road', 'Willmar', 'MN', '56201', null, null, 'Irrigation pivot near west edge.')
on conflict (id) do update set
  name = excluded.name,
  client_id = excluded.client_id,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

insert into public.fields (id, organization_id, farm_id, name, crop, crop_type, acres, boundary_geojson, notes, metadata)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-000000000001', 'North 220', 'Potatoes', 'Potatoes', 220, null, 'Tight wind window.', '{}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-000000000001', 'South 260', 'Corn', 'Corn', 260, null, 'Completed SOURCE trial area.', '{}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-000000000002', 'West Quarter', 'Soybeans', 'Soybeans', 150, null, 'Avoid the north tree line.', '{}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-000000000003', 'River Bottom', 'Corn', 'Corn', 320, null, 'Use east road for staging.', '{}'::jsonb),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000005', '33333333-3333-4333-8333-333333333333', '55555555-5555-4555-8555-000000000002', 'SOURCE Test Block', 'Soybeans', 'Soybeans', 60, null, 'Grower is comparing SOURCE timing.', '{}'::jsonb)
on conflict (id) do update set
  farm_id = excluded.farm_id,
  name = excluded.name,
  crop = excluded.crop,
  crop_type = excluded.crop_type,
  acres = excluded.acres,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

insert into public.services (id, organization_id, name, description, default_rate_per_acre, active)
values
  ('66666666-6666-4666-8666-000000000001', '33333333-3333-4333-8333-333333333333', 'Drone Application', 'Aerial application work for grower fields.', 18, true),
  ('66666666-6666-4666-8666-000000000002', '33333333-3333-4333-8333-333333333333', 'SOURCE Consultation', 'SOURCE acre review and product fit support.', null, true),
  ('66666666-6666-4666-8666-000000000003', '33333333-3333-4333-8333-333333333333', 'Field Scouting', 'Pre-application scouting and field condition review.', 4, true),
  ('66666666-6666-4666-8666-000000000004', '33333333-3333-4333-8333-333333333333', 'Spot Treatment', 'Targeted treatment for limited-acre problem areas.', 24, true),
  ('66666666-6666-4666-8666-000000000005', '33333333-3333-4333-8333-333333333333', 'Enterprise Drone Program Support', 'Planning and operating support for larger drone programs.', null, true)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  default_rate_per_acre = excluded.default_rate_per_acre,
  active = excluded.active,
  updated_at = timezone('utc', now());

insert into public.operator_profiles (id, organization_id, user_id, name, phone, email, certification_status, service_regions, active, notes)
values
  ('77777777-7777-4777-8777-000000000001', '33333333-3333-4333-8333-333333333333', null, 'Ada Miller', '555-0141', 'ada@harvestdrone.local', 'current', array['Lyon County', 'Redwood County'], true, 'Lead operator for west region.'),
  ('77777777-7777-4777-8777-000000000002', '33333333-3333-4333-8333-333333333333', null, 'Ben Carter', '555-0142', 'ben@harvestdrone.local', 'current', array['Kandiyohi County', 'Lyon County'], true, 'Strong fit for large-acre corn applications.')
on conflict (id) do update set
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email,
  certification_status = excluded.certification_status,
  service_regions = excluded.service_regions,
  active = excluded.active,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

insert into public.ops_jobs (
  id,
  organization_id,
  client_id,
  farm_id,
  field_id,
  title,
  service_type,
  crop_type,
  acres,
  status,
  priority,
  requested_date,
  scheduled_start,
  scheduled_end,
  assigned_operator_id,
  application_product,
  source_interest,
  notes,
  internal_notes,
  metadata_json,
  invoice_needed,
  jobber_job_id,
  jobber_request_id
)
values
  ('88888888-8888-4888-8888-000000000001', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000002', '55555555-5555-4555-8555-000000000002', null, 'Nelson SOURCE acre review', 'SOURCE Consultation', 'Soybeans', 180, 'new_request', 'normal', current_date, null, null, null, 'SOURCE', true, 'Lead asked for timing and application options.', 'Qualify before scheduling.', '{"staging_area":"Phone consult until field boundary is confirmed.","access_notes":"Ask grower for field entrance and county road details.","weather_window":"Consultation only; flight window not needed yet.","loadout":["SOURCE acre review worksheet","Grower ROI calculator"]}'::jsonb, false, null, null),
  ('88888888-8888-4888-8888-000000000002', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000001', '55555555-5555-4555-8555-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'Miller North fungicide application', 'Drone Application', 'Potatoes', 220, 'scheduled', 'urgent', current_date, date_trunc('day', now()) + interval '9 hours', date_trunc('day', now()) + interval '12 hours', '77777777-7777-4777-8777-000000000001', 'Fungicide - Chlorothalonil', false, 'Call Sam when drone is loaded.', 'Wind cutoff 10 mph.', '{"staging_area":"South entrance off County Road 8, gravel pad by the machine shed.","access_notes":"Avoid the wet lane north of the bins; Sam will unlock the south gate.","weather_window":"Best flight window is before 11 AM.","wind_limit_mph":10,"forecast":{"label":"Marshall AM window","wind_mph":7,"gust_mph":11,"temperature_f":62,"rain_window":"Clear until noon"},"application_rate":"2 pt/ac","spray_volume_gpa":2,"water_source":"Nurse tank at south pad","ppe":"Chemical gloves, eye protection, long sleeves","loadout":["Charged batteries x3","Chlorothalonil tote","Nozzle kit","RTK base","PPE kit"]}'::jsonb, false, 'JB-J-4100', null),
  ('88888888-8888-4888-8888-000000000003', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000002', '55555555-5555-4555-8555-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'Nelson West soybean spot treatment', 'Spot Treatment', 'Soybeans', 150, 'scheduled', 'high', current_date, date_trunc('day', now()) + interval '1 day 9 hours', date_trunc('day', now()) + interval '1 day 12 hours', null, 'Herbicide - grower supplied', true, 'Needs operator assignment before confirmation.', null, '{"staging_area":"West approach from Prairie View.","access_notes":"Stay clear of the north tree line and confirm drift buffer.","weather_window":"Tomorrow afternoon is marginal; confirm wind before dispatch.","wind_limit_mph":12,"forecast":{"label":"Redwood Falls afternoon","wind_mph":14,"gust_mph":18,"temperature_f":69,"rain_window":"Dry"},"application_rate":"Grower supplied; rate pending","spray_volume_gpa":2,"water_source":"Bring water unless grower confirms tender.","loadout":["Grower-supplied herbicide","Boundary tablet","PPE kit"]}'::jsonb, false, null, 'JB-R-8821'),
  ('88888888-8888-4888-8888-000000000004', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000003', '55555555-5555-4555-8555-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'Carter River Bottom application', 'Drone Application', 'Corn', 320, 'in_progress', 'urgent', current_date, date_trunc('day', now()) + interval '14 hours', date_trunc('day', now()) + interval '17 hours', '77777777-7777-4777-8777-000000000002', 'Foliar feed', false, 'Operator is in field.', 'Capture completion report after flight.', '{"staging_area":"East road, south of the irrigation pivot.","access_notes":"Keep truck on east road; pivot on west edge.","weather_window":"Afternoon slot acceptable if gusts stay below 13 mph.","wind_limit_mph":13,"forecast":{"label":"Willmar afternoon","wind_mph":9,"gust_mph":12,"temperature_f":66,"rain_window":"Clear"},"application_rate":"1 qt/ac","spray_volume_gpa":2,"water_source":"Tender truck on site","loadout":["Foliar feed","Battery generator","Completion report template"]}'::jsonb, false, 'JB-J-4101', null),
  ('88888888-8888-4888-8888-000000000005', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000003', '55555555-5555-4555-8555-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'Carter post-rain scouting', 'Field Scouting', 'Corn', 260, 'completed', 'normal', current_date - 1, date_trunc('day', now()) - interval '1 day' + interval '10 hours', date_trunc('day', now()) - interval '1 day' + interval '12 hours', '77777777-7777-4777-8777-000000000002', null, false, 'No major issues found.', 'Completion report sent to Devon.', '{"staging_area":"East road by pivot.","access_notes":"Post-rain scouting completed without application.","weather_window":"Completed.","loadout":["Scouting drone","Field camera","Battery set"]}'::jsonb, false, null, null),
  ('88888888-8888-4888-8888-000000000006', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000001', '55555555-5555-4555-8555-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'Miller South SOURCE completion', 'SOURCE Consultation', 'Corn', 260, 'invoice_needed', 'normal', current_date - 2, date_trunc('day', now()) - interval '2 days' + interval '9 hours', date_trunc('day', now()) - interval '2 days' + interval '11 hours', '77777777-7777-4777-8777-000000000001', 'SOURCE', true, 'Grower wants next-step recommendation.', 'Invoice in Jobber after report review.', '{"staging_area":"Report review, no active flight.","access_notes":"Completed SOURCE consultation for south field.","weather_window":"Completed.","loadout":["SOURCE report","Invoice handoff notes"]}'::jsonb, true, 'JB-J-4097', null),
  ('88888888-8888-4888-8888-000000000007', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000002', '55555555-5555-4555-8555-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000005', 'Nelson SOURCE test block', 'SOURCE Consultation', 'Soybeans', 60, 'qualified', 'normal', current_date, null, null, null, 'SOURCE', true, 'Qualified but not yet quoted.', null, '{"staging_area":"TBD after quote approval.","access_notes":"Needs boundary and preferred treatment area.","weather_window":"Flexible, not scheduled.","loadout":["SOURCE acre review worksheet"]}'::jsonb, false, null, null),
  ('88888888-8888-4888-8888-000000000008', '33333333-3333-4333-8333-333333333333', '44444444-4444-4444-8444-000000000001', '55555555-5555-4555-8555-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'Miller early season closed job', 'Field Scouting', 'Corn', 90, 'closed', 'low', current_date - 14, date_trunc('day', now()) - interval '12 days' + interval '9 hours', date_trunc('day', now()) - interval '12 days' + interval '11 hours', '77777777-7777-4777-8777-000000000002', null, false, 'Closed after customer review.', null, '{"staging_area":"Closed job.","access_notes":"No active dispatch needs.","weather_window":"Closed.","loadout":["Archived scouting notes"]}'::jsonb, false, null, null)
on conflict (id) do update set
  status = excluded.status,
  priority = excluded.priority,
  scheduled_start = excluded.scheduled_start,
  scheduled_end = excluded.scheduled_end,
  assigned_operator_id = excluded.assigned_operator_id,
  metadata_json = excluded.metadata_json,
  invoice_needed = excluded.invoice_needed,
  jobber_job_id = excluded.jobber_job_id,
  jobber_request_id = excluded.jobber_request_id,
  updated_at = timezone('utc', now());

insert into public.fleet_assets (
  id,
  organization_id,
  name,
  serial_number,
  model,
  assigned_operator_id,
  home_base,
  status,
  last_latitude,
  last_longitude,
  last_accuracy_meters,
  last_seen_at,
  current_job_id,
  active,
  notes
)
values
  ('cccccccc-cccc-4ccc-8ccc-000000000001', '33333333-3333-4333-8333-333333333333', 'Ares 01', 'HD-ARES-001', 'Hylio Ares', '77777777-7777-4777-8777-000000000001', 'Marshall yard', 'flying', 44.452, -95.79, 18, date_trunc('day', now()) + interval '9 hours 52 minutes', '88888888-8888-4888-8888-000000000002', true, 'Primary application drone for west region.'),
  ('cccccccc-cccc-4ccc-8ccc-000000000002', '33333333-3333-4333-8333-333333333333', 'Ares 02', 'HD-ARES-002', 'Hylio Ares', '77777777-7777-4777-8777-000000000002', 'Willmar yard', 'on_site', 45.121, -95.045, 24, date_trunc('day', now()) + interval '13 hours 42 minutes', '88888888-8888-4888-8888-000000000004', true, 'Large-acre corn application unit.'),
  ('cccccccc-cccc-4ccc-8ccc-000000000003', '33333333-3333-4333-8333-333333333333', 'Scout 01', 'HD-SCOUT-001', 'Scout drone', null, 'Marshall yard', 'at_yard', 44.446, -95.79, 35, date_trunc('day', now()) + interval '8 hours 18 minutes', null, true, 'Scouting and documentation backup.')
on conflict (id) do update set
  name = excluded.name,
  serial_number = excluded.serial_number,
  model = excluded.model,
  assigned_operator_id = excluded.assigned_operator_id,
  home_base = excluded.home_base,
  status = excluded.status,
  last_latitude = excluded.last_latitude,
  last_longitude = excluded.last_longitude,
  last_accuracy_meters = excluded.last_accuracy_meters,
  last_seen_at = excluded.last_seen_at,
  current_job_id = excluded.current_job_id,
  active = excluded.active,
  notes = excluded.notes,
  updated_at = timezone('utc', now());

insert into public.fleet_location_events (
  id,
  organization_id,
  fleet_asset_id,
  operator_id,
  job_id,
  status,
  latitude,
  longitude,
  accuracy_meters,
  note,
  source,
  captured_at
)
values
  ('dddddddd-dddd-4ddd-8ddd-000000000001', '33333333-3333-4333-8333-333333333333', 'cccccccc-cccc-4ccc-8ccc-000000000001', '77777777-7777-4777-8777-000000000001', '88888888-8888-4888-8888-000000000002', 'flying', 44.452, -95.79, 18, 'Demo check-in from Miller North field.', 'operator_gps', date_trunc('day', now()) + interval '9 hours 52 minutes'),
  ('dddddddd-dddd-4ddd-8ddd-000000000002', '33333333-3333-4333-8333-333333333333', 'cccccccc-cccc-4ccc-8ccc-000000000002', '77777777-7777-4777-8777-000000000002', '88888888-8888-4888-8888-000000000004', 'on_site', 45.121, -95.045, 24, 'Demo check-in from Carter River Bottom.', 'operator_gps', date_trunc('day', now()) + interval '13 hours 42 minutes'),
  ('dddddddd-dddd-4ddd-8ddd-000000000003', '33333333-3333-4333-8333-333333333333', 'cccccccc-cccc-4ccc-8ccc-000000000003', null, null, 'at_yard', 44.446, -95.79, 35, 'Demo yard position.', 'manual', date_trunc('day', now()) + interval '8 hours 18 minutes')
on conflict (id) do nothing;

insert into public.job_checklists (id, organization_id, job_id, checklist_type, items_json)
select
  gen_random_uuid(),
  job.organization_id,
  job.id,
  checklist_type,
  items_json
from public.ops_jobs job
cross join (
  values
    (
      'pre_flight',
      '[
        {"id":"drone_inspected","label":"Drone inspected","completed":false},
        {"id":"batteries_checked","label":"Batteries checked","completed":false},
        {"id":"weather_checked","label":"Weather checked","completed":false},
        {"id":"field_location_confirmed","label":"Field location confirmed","completed":false},
        {"id":"application_details_confirmed","label":"Product/application details confirmed","completed":false},
        {"id":"safety_area_reviewed","label":"Safety area reviewed","completed":false},
        {"id":"operator_notes_added","label":"Operator notes added","completed":false}
      ]'::jsonb
    ),
    (
      'completion',
      '[
        {"id":"application_recorded","label":"Application record captured","completed":false},
        {"id":"postflight_complete","label":"Post-flight inspection complete","completed":false},
        {"id":"completion_notes_added","label":"Completion notes added","completed":false}
      ]'::jsonb
    )
) as templates(checklist_type, items_json)
where job.organization_id = '33333333-3333-4333-8333-333333333333'
  and not exists (
    select 1
    from public.job_checklists existing
    where existing.job_id = job.id
      and existing.checklist_type = templates.checklist_type
  );

insert into public.job_status_history (organization_id, job_id, old_status, new_status, changed_at)
select organization_id, id, null, status, timezone('utc', now())
from public.ops_jobs job
where job.organization_id = '33333333-3333-4333-8333-333333333333'
  and not exists (
    select 1
    from public.job_status_history history
    where history.job_id = job.id
  );

insert into public.jobber_links (id, organization_id, local_entity_type, local_entity_id, jobber_entity_type, jobber_entity_id, jobber_url, sync_status)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-000000000001',
  '33333333-3333-4333-8333-333333333333',
  'job',
  '88888888-8888-4888-8888-000000000002',
  'job',
  'JB-J-4100',
  'https://secure.getjobber.com/work_orders/JB-J-4100',
  'manual'
)
on conflict (id) do update set
  jobber_entity_id = excluded.jobber_entity_id,
  jobber_url = excluded.jobber_url,
  sync_status = excluded.sync_status,
  updated_at = timezone('utc', now());

notify pgrst, 'reload schema';
