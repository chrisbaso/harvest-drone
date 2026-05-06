create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  name text not null,
  short_name text,
  organization_type text not null default 'enterprise_grower',
  headquarters text,
  operating_states text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.enterprise_divisions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  crop_focus text,
  operating_model text,
  aircraft_family text,
  status text not null default 'planning',
  readiness_target_date date,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.division_blueprints (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  division_id uuid not null references public.enterprise_divisions (id) on delete cascade,
  phase text not null,
  steps jsonb not null default '[]'::jsonb,
  assumptions jsonb not null default '[]'::jsonb
);

create table if not exists public.farm_locations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  state text,
  county text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.fields (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  farm_location_id uuid references public.farm_locations (id) on delete set null,
  name text not null,
  crop text,
  acres numeric,
  boundary_geojson jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.crop_seasons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  crop text not null,
  season_year integer not null,
  stage text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.spray_programs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  crop_season_id uuid references public.crop_seasons (id) on delete set null,
  name text not null,
  operation_type text not null,
  compliance_config jsonb not null default '{}'::jsonb
);

create table if not exists public.spray_windows (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  spray_program_id uuid not null references public.spray_programs (id) on delete cascade,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  state text,
  status text not null default 'watching',
  weather_summary text,
  field_ids uuid[] not null default '{}'::uuid[],
  readiness_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.enterprise_operators (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  role text,
  base_location_id uuid references public.farm_locations (id) on delete set null,
  state text,
  aircraft_models text[] not null default '{}'::text[],
  payload_types text[] not null default '{}'::text[],
  training_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.operator_credentials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid not null references public.enterprise_operators (id) on delete cascade,
  credential_type text not null,
  status text not null default 'pending_review',
  state text,
  category text,
  aircraft_model text,
  payload_type text,
  verified_at timestamptz,
  expires_at timestamptz,
  evidence_url text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.operator_qualifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid not null references public.enterprise_operators (id) on delete cascade,
  qualification_level text not null,
  aircraft_model text,
  payload_type text,
  state text,
  status text not null default 'active',
  effective_at timestamptz,
  expires_at timestamptz,
  gate_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  title text not null,
  audience text,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid not null references public.enterprise_operators (id) on delete cascade,
  course_id uuid not null references public.training_courses (id) on delete cascade,
  status text not null default 'enrolled',
  progress_percent integer not null default 0,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.practical_evaluations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid not null references public.enterprise_operators (id) on delete cascade,
  evaluator_id uuid references public.enterprise_operators (id) on delete set null,
  aircraft_model text,
  payload_type text,
  status text not null default 'scheduled',
  evaluated_at timestamptz,
  rubric_snapshot jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb
);

create table if not exists public.aircraft (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  tail_number text not null,
  model text not null,
  status text not null default 'active',
  registration_status text not null default 'pending_review',
  remote_id_status text not null default 'pending_review',
  maintenance_blocked boolean not null default false,
  readiness jsonb not null default '{}'::jsonb
);

create table if not exists public.aircraft_readiness (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  aircraft_id uuid not null references public.aircraft (id) on delete cascade,
  calibration_status text,
  battery_checklist_status text,
  last_inspection_at timestamptz,
  readiness_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.application_jobs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  spray_window_id uuid references public.spray_windows (id) on delete set null,
  field_id uuid references public.fields (id) on delete set null,
  assigned_operator_id uuid references public.enterprise_operators (id) on delete set null,
  aircraft_id uuid references public.aircraft (id) on delete set null,
  title text not null,
  status text not null default 'draft',
  operation_type text not null,
  payload_type text,
  state text,
  acres numeric,
  required_checklist_slugs text[] not null default '{}'::text[],
  completed_checklist_slugs text[] not null default '{}'::text[],
  documents_attached boolean not null default false,
  weather_acknowledged boolean not null default false,
  prior_records_overdue boolean not null default false,
  readiness_snapshot jsonb not null default '{}'::jsonb
);

create table if not exists public.application_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  application_job_id uuid references public.application_jobs (id) on delete set null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  completed_at timestamptz,
  acres_applied numeric,
  operator_id uuid references public.enterprise_operators (id) on delete set null,
  aircraft_id uuid references public.aircraft (id) on delete set null,
  status text not null default 'draft',
  record_payload jsonb not null default '{}'::jsonb,
  attachments jsonb not null default '[]'::jsonb
);

create table if not exists public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  aircraft_id uuid not null references public.aircraft (id) on delete cascade,
  title text not null,
  status text not null default 'open',
  due_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  aircraft_id uuid references public.aircraft (id) on delete set null,
  title text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  owner text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.readiness_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  application_job_id uuid not null references public.application_jobs (id) on delete cascade,
  operator_id uuid references public.enterprise_operators (id) on delete set null,
  aircraft_id uuid references public.aircraft (id) on delete set null,
  ready boolean not null default false,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  gate_snapshot jsonb not null default '{}'::jsonb
);

alter table public.readiness_checks
  add column if not exists application_job_id uuid references public.application_jobs (id) on delete cascade,
  add column if not exists aircraft_id uuid references public.aircraft (id) on delete set null,
  add column if not exists ready boolean not null default false,
  add column if not exists gate_snapshot jsonb not null default '{}'::jsonb;

create table if not exists public.readiness_blockers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  readiness_check_id uuid not null references public.readiness_checks (id) on delete cascade,
  blocker_type text not null,
  message text not null,
  status text not null default 'open',
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  metric_key text not null,
  label text not null,
  metric_value text not null,
  period_label text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists enterprise_divisions_org_idx on public.enterprise_divisions (organization_id);
create index if not exists spray_windows_program_status_idx on public.spray_windows (spray_program_id, status);
create index if not exists application_jobs_org_status_idx on public.application_jobs (organization_id, status);
create index if not exists operator_credentials_operator_idx on public.operator_credentials (operator_id, credential_type);
create index if not exists aircraft_org_status_idx on public.aircraft (organization_id, status);
create index if not exists readiness_checks_job_idx on public.readiness_checks (application_job_id, created_at desc);
create index if not exists support_tickets_org_status_idx on public.support_tickets (organization_id, status);

alter table public.organizations enable row level security;
alter table public.enterprise_divisions enable row level security;
alter table public.division_blueprints enable row level security;
alter table public.farm_locations enable row level security;
alter table public.fields enable row level security;
alter table public.crop_seasons enable row level security;
alter table public.spray_programs enable row level security;
alter table public.spray_windows enable row level security;
alter table public.enterprise_operators enable row level security;
alter table public.operator_credentials enable row level security;
alter table public.operator_qualifications enable row level security;
alter table public.training_courses enable row level security;
alter table public.training_enrollments enable row level security;
alter table public.practical_evaluations enable row level security;
alter table public.aircraft enable row level security;
alter table public.aircraft_readiness enable row level security;
alter table public.application_jobs enable row level security;
alter table public.application_records enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.support_tickets enable row level security;
alter table public.readiness_checks enable row level security;
alter table public.readiness_blockers enable row level security;
alter table public.performance_metrics enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations',
    'enterprise_divisions',
    'division_blueprints',
    'farm_locations',
    'fields',
    'crop_seasons',
    'spray_programs',
    'spray_windows',
    'enterprise_operators',
    'operator_credentials',
    'operator_qualifications',
    'training_courses',
    'training_enrollments',
    'practical_evaluations',
    'aircraft',
    'aircraft_readiness',
    'application_jobs',
    'application_records',
    'maintenance_records',
    'support_tickets',
    'readiness_checks',
    'readiness_blockers',
    'performance_metrics'
  ]
  loop
    execute format('drop policy if exists "Authenticated can read %I" on public.%I', table_name, table_name);
    execute format('create policy "Authenticated can read %I" on public.%I for select to authenticated using (true)', table_name, table_name);
    execute format('drop policy if exists "Authenticated can manage %I" on public.%I', table_name, table_name);
    execute format('create policy "Authenticated can manage %I" on public.%I for all to authenticated using (true) with check (true)', table_name, table_name);
  end loop;
end $$;

notify pgrst, 'reload schema';
