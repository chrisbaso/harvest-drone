-- Flight readiness audit records

create table if not exists public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  record_number text unique not null,
  mission_id uuid references public.application_schedule(id) on delete set null,
  drone_id uuid references public.fleet_drones(id) on delete set null,

  field_name text not null,
  field_location text,
  field_acres numeric,
  crop_type text,
  application_number integer,
  total_applications integer,
  product_applied text not null,
  application_rate text,
  actual_acres_sprayed numeric,

  pilot_name text not null,
  part107_current boolean,
  pesticide_license_current boolean,
  training_complete boolean,
  insurance_current boolean,

  drone_serial_number text,
  drone_model text,
  faa_registration text,
  flight_hours_at_mission numeric,
  maintenance_current boolean,

  preflight_completed boolean default false,
  postflight_completed boolean default false,

  weather_conditions text,
  wind_speed_mph numeric,
  temperature_f numeric,
  humidity_pct numeric,

  mission_started timestamptz,
  mission_completed timestamptz,
  flight_duration_minutes numeric,

  all_gates_passed boolean default true,
  override_used boolean default false,
  override_reason text,
  override_authorized_by text,

  dealer_id uuid references public.dealers(id) on delete set null,
  network_id uuid references public.dealer_networks(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_compliance_records_mission on public.compliance_records(mission_id);
create index if not exists idx_compliance_records_drone on public.compliance_records(drone_id);
create index if not exists idx_compliance_records_dealer on public.compliance_records(dealer_id);
create index if not exists idx_compliance_records_date on public.compliance_records(mission_completed);

alter table public.compliance_records enable row level security;

drop policy if exists compliance_records_admin_select on public.compliance_records;
create policy compliance_records_admin_select on public.compliance_records
  for select using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists compliance_records_admin_insert on public.compliance_records;
create policy compliance_records_admin_insert on public.compliance_records
  for insert with check (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists compliance_records_network_select on public.compliance_records;
create policy compliance_records_network_select on public.compliance_records
  for select using (
    network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
  );

drop policy if exists compliance_records_dealer_select on public.compliance_records;
create policy compliance_records_dealer_select on public.compliance_records
  for select using (
    dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
  );

notify pgrst, 'reload schema';
