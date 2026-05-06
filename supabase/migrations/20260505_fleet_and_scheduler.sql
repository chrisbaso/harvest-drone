create extension if not exists pgcrypto;

-- Fleet management tables
create table if not exists public.fleet_drones (
  id uuid primary key default gen_random_uuid(),
  serial_number text not null,
  model text default 'Hylio AG-272',
  nickname text,
  dealer_id uuid references public.dealers(id) on delete set null,
  network_id uuid references public.dealer_networks(id) on delete set null,
  assigned_pilot_id uuid,
  assigned_pilot_name text,
  status text default 'available' check (status in ('available','in_flight','maintenance','grounded','retired')),
  location_description text,
  total_flight_hours numeric default 0,
  hours_since_maintenance numeric default 0,
  maintenance_due_hours numeric default 50,
  last_maintenance_date date,
  next_maintenance_date date,
  firmware_version text,
  insurance_expiry date,
  faa_registration text,
  purchase_date date,
  purchase_price numeric,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists fleet_drones_serial_number_key on public.fleet_drones(serial_number);

create table if not exists public.fleet_maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  drone_id uuid references public.fleet_drones(id) on delete cascade,
  maintenance_type text not null check (maintenance_type in ('scheduled','repair','inspection','firmware','calibration')),
  description text not null,
  performed_by text,
  hours_at_service numeric,
  parts_used text,
  cost numeric default 0,
  completed_at timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists public.fleet_flight_logs (
  id uuid primary key default gen_random_uuid(),
  drone_id uuid references public.fleet_drones(id) on delete cascade,
  pilot_name text not null,
  field_name text,
  field_location text,
  crop_type text,
  product_applied text,
  application_rate text,
  acres_sprayed numeric,
  flight_duration_minutes numeric,
  weather_conditions text,
  wind_speed_mph numeric,
  temperature_f numeric,
  humidity_pct numeric,
  preflight_checklist_completed boolean default false,
  postflight_inspection_completed boolean default false,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Application scheduler tables
create table if not exists public.application_fields (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_description text,
  county text,
  state text default 'Minnesota',
  total_acres numeric not null,
  crop_type text default 'Potatoes',
  applications_per_season integer default 12,
  dealer_id uuid references public.dealers(id) on delete set null,
  network_id uuid references public.dealer_networks(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.application_schedule (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references public.application_fields(id) on delete cascade,
  field_name text not null,
  field_location text,
  field_acres numeric not null,
  crop_type text default 'Potatoes',
  product_to_apply text not null,
  application_rate text,
  application_number integer,
  total_applications integer default 12,
  window_opens timestamptz,
  window_closes timestamptz,
  priority text default 'normal' check (priority in ('urgent','normal','flexible')),
  status text default 'scheduled' check (status in ('scheduled','assigned','in_progress','completed','missed','cancelled')),
  assigned_drone_id uuid references public.fleet_drones(id) on delete set null,
  assigned_drone_serial text,
  assigned_pilot_name text,
  weather_clear boolean default true,
  wind_max_mph numeric,
  actual_acres_sprayed numeric,
  actual_product_used text,
  dealer_id uuid references public.dealers(id) on delete set null,
  network_id uuid references public.dealer_networks(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.enterprise_inquiries (
  id uuid primary key default gen_random_uuid(),
  contact_name text not null,
  email text not null,
  company text,
  phone text,
  message text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_fleet_drones_dealer on public.fleet_drones(dealer_id);
create index if not exists idx_fleet_drones_network on public.fleet_drones(network_id);
create index if not exists idx_fleet_drones_status on public.fleet_drones(status);
create index if not exists idx_flight_logs_drone on public.fleet_flight_logs(drone_id);
create index if not exists idx_flight_logs_completed on public.fleet_flight_logs(completed_at);
create index if not exists idx_maintenance_logs_drone on public.fleet_maintenance_logs(drone_id);
create index if not exists idx_app_fields_dealer on public.application_fields(dealer_id);
create index if not exists idx_app_schedule_status on public.application_schedule(status);
create index if not exists idx_app_schedule_window on public.application_schedule(window_opens);
create index if not exists idx_app_schedule_dealer on public.application_schedule(dealer_id);
create index if not exists idx_app_schedule_field on public.application_schedule(field_id);

-- Row level security
alter table public.fleet_drones enable row level security;
alter table public.fleet_maintenance_logs enable row level security;
alter table public.fleet_flight_logs enable row level security;
alter table public.application_fields enable row level security;
alter table public.application_schedule enable row level security;
alter table public.enterprise_inquiries enable row level security;

drop policy if exists fleet_drones_admin on public.fleet_drones;
create policy fleet_drones_admin on public.fleet_drones for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists fleet_drones_network on public.fleet_drones;
create policy fleet_drones_network on public.fleet_drones for all using (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
) with check (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
);

drop policy if exists fleet_drones_dealer on public.fleet_drones;
create policy fleet_drones_dealer on public.fleet_drones for all using (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
) with check (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
);

drop policy if exists fleet_maintenance_admin on public.fleet_maintenance_logs;
create policy fleet_maintenance_admin on public.fleet_maintenance_logs for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists fleet_maintenance_scoped on public.fleet_maintenance_logs;
create policy fleet_maintenance_scoped on public.fleet_maintenance_logs for all using (
  exists (
    select 1
    from public.fleet_drones d
    join public.user_profiles p on p.id = auth.uid()
    where d.id = public.fleet_maintenance_logs.drone_id
      and (
        (p.role = 'network_manager' and d.network_id = p.network_id)
        or (p.role = 'dealer' and d.dealer_id = p.dealer_id)
      )
  )
) with check (
  exists (
    select 1
    from public.fleet_drones d
    join public.user_profiles p on p.id = auth.uid()
    where d.id = public.fleet_maintenance_logs.drone_id
      and (
        (p.role = 'network_manager' and d.network_id = p.network_id)
        or (p.role = 'dealer' and d.dealer_id = p.dealer_id)
      )
  )
);

drop policy if exists fleet_flights_admin on public.fleet_flight_logs;
create policy fleet_flights_admin on public.fleet_flight_logs for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists fleet_flights_scoped on public.fleet_flight_logs;
create policy fleet_flights_scoped on public.fleet_flight_logs for all using (
  exists (
    select 1
    from public.fleet_drones d
    join public.user_profiles p on p.id = auth.uid()
    where d.id = public.fleet_flight_logs.drone_id
      and (
        (p.role = 'network_manager' and d.network_id = p.network_id)
        or (p.role = 'dealer' and d.dealer_id = p.dealer_id)
      )
  )
) with check (
  exists (
    select 1
    from public.fleet_drones d
    join public.user_profiles p on p.id = auth.uid()
    where d.id = public.fleet_flight_logs.drone_id
      and (
        (p.role = 'network_manager' and d.network_id = p.network_id)
        or (p.role = 'dealer' and d.dealer_id = p.dealer_id)
      )
  )
);

drop policy if exists app_fields_admin on public.application_fields;
create policy app_fields_admin on public.application_fields for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists app_fields_network on public.application_fields;
create policy app_fields_network on public.application_fields for all using (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
) with check (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
);

drop policy if exists app_fields_dealer on public.application_fields;
create policy app_fields_dealer on public.application_fields for all using (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
) with check (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
);

drop policy if exists app_schedule_admin on public.application_schedule;
create policy app_schedule_admin on public.application_schedule for all using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
) with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists app_schedule_network on public.application_schedule;
create policy app_schedule_network on public.application_schedule for all using (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
) with check (
  network_id = (select network_id from public.user_profiles where id = auth.uid() and role = 'network_manager')
);

drop policy if exists app_schedule_dealer on public.application_schedule;
create policy app_schedule_dealer on public.application_schedule for all using (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
) with check (
  dealer_id = (select dealer_id from public.user_profiles where id = auth.uid() and role = 'dealer')
);

drop policy if exists enterprise_inquiries_public_insert on public.enterprise_inquiries;
create policy enterprise_inquiries_public_insert on public.enterprise_inquiries
  for insert to anon, authenticated with check (true);

drop policy if exists enterprise_inquiries_admin_select on public.enterprise_inquiries;
create policy enterprise_inquiries_admin_select on public.enterprise_inquiries
  for select using (
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- Seed data for demo
do $$
declare
  demo_dealer_id uuid;
  demo_network_id uuid;
  alpha_id uuid;
  bravo_id uuid;
  charlie_id uuid;
begin
  select id into demo_dealer_id from public.dealers where slug in ('rdo-marshall-mn', 'demo-territory') order by case slug when 'rdo-marshall-mn' then 0 else 1 end limit 1;
  select id into demo_network_id from public.dealer_networks where slug in ('rdo', 'harvest-demo-network') order by case slug when 'rdo' then 0 else 1 end limit 1;

  insert into public.fleet_drones (serial_number, model, nickname, dealer_id, network_id, assigned_pilot_name, status, location_description, total_flight_hours, hours_since_maintenance, maintenance_due_hours, last_maintenance_date, purchase_date, purchase_price, faa_registration)
  values
  ('HY-AG272-0041', 'Hylio AG-272', 'Alpha', demo_dealer_id, demo_network_id, 'Jody Bjornson', 'available', 'Marshall, MN - Main Shop', 127.5, 22.5, 50, '2026-03-15', '2025-11-01', 46000, 'FA3XXHD041'),
  ('HY-AG272-0042', 'Hylio AG-272', 'Bravo', demo_dealer_id, demo_network_id, 'Jody Bjornson', 'available', 'Marshall, MN - Main Shop', 98.3, 48.3, 50, '2026-02-20', '2025-11-01', 46000, 'FA3XXHD042'),
  ('HY-AG272-0043', 'Hylio AG-272', 'Charlie', demo_dealer_id, demo_network_id, null, 'maintenance', 'HD Shop - Waconia', 156.7, 6.7, 50, '2026-04-01', '2025-06-15', 46000, 'FA3XXHD043'),
  ('HY-AG272-0044', 'Hylio AG-272', 'Delta', demo_dealer_id, demo_network_id, null, 'available', 'Marshall, MN - Training', 45.2, 45.2, 50, '2026-01-10', '2026-01-05', 46000, 'FA3XXHD044')
  on conflict (serial_number) do update set
    dealer_id = excluded.dealer_id,
    network_id = excluded.network_id,
    nickname = excluded.nickname,
    status = excluded.status,
    location_description = excluded.location_description;

  select id into alpha_id from public.fleet_drones where serial_number = 'HY-AG272-0041';
  select id into bravo_id from public.fleet_drones where serial_number = 'HY-AG272-0042';
  select id into charlie_id from public.fleet_drones where serial_number = 'HY-AG272-0043';

  insert into public.fleet_maintenance_logs (drone_id, maintenance_type, description, performed_by, hours_at_service, cost)
  select alpha_id, 'scheduled', '50-hour inspection: prop balance, motor temps, battery health check', 'Jody Bjornson', 105, 350
  where alpha_id is not null and not exists (select 1 from public.fleet_maintenance_logs where drone_id = alpha_id and description like '50-hour inspection:%battery%');

  insert into public.fleet_maintenance_logs (drone_id, maintenance_type, description, performed_by, hours_at_service, cost)
  select bravo_id, 'scheduled', '50-hour inspection: full teardown and reassembly', 'Jody Bjornson', 50, 450
  where bravo_id is not null and not exists (select 1 from public.fleet_maintenance_logs where drone_id = bravo_id and description like '50-hour inspection:%teardown%');

  insert into public.fleet_maintenance_logs (drone_id, maintenance_type, description, performed_by, hours_at_service, cost)
  select charlie_id, 'repair', 'Pump seal replacement - spray nozzle 3 leaking under pressure', 'Jody Bjornson', 150, 180
  where charlie_id is not null and not exists (select 1 from public.fleet_maintenance_logs where drone_id = charlie_id and description like 'Pump seal replacement%');

  insert into public.fleet_maintenance_logs (drone_id, maintenance_type, description, performed_by, hours_at_service, cost)
  select charlie_id, 'firmware', 'Firmware update to v4.2.1 - improved GPS hold in crosswind', 'Jody Bjornson', 156, 0
  where charlie_id is not null and not exists (select 1 from public.fleet_maintenance_logs where drone_id = charlie_id and description like 'Firmware update%');

  insert into public.application_fields (name, location_description, county, total_acres, crop_type, applications_per_season, dealer_id, network_id)
  select field_name, field_location, field_county, acres, crop, apps, demo_dealer_id, demo_network_id
  from (values
    ('North 40', 'Section 12, Lyon County', 'Lyon', 320::numeric, 'Potatoes', 12),
    ('South 80', 'Section 24, Lyon County', 'Lyon', 640::numeric, 'Potatoes', 10),
    ('West Quarter', 'Section 8, Redwood County', 'Redwood', 160::numeric, 'Potatoes', 12),
    ('River Bottom', 'Section 31, Yellow Medicine County', 'Yellow Medicine', 480::numeric, 'Potatoes', 8),
    ('Training Field', 'Marshall Airport Ag Plot', 'Lyon', 40::numeric, 'Soybeans', 3)
  ) as rows(field_name, field_location, field_county, acres, crop, apps)
  where not exists (
    select 1 from public.application_fields f
    where f.name = rows.field_name and f.dealer_id is not distinct from demo_dealer_id
  );

  insert into public.application_schedule (field_name, field_location, field_acres, crop_type, product_to_apply, application_number, total_applications, window_opens, window_closes, priority, status, assigned_pilot_name, dealer_id, network_id)
  select sched_field, sched_location, sched_acres, crop, product, app_no, total_apps, opens_at, closes_at, priority_value, status_value, pilot, demo_dealer_id, demo_network_id
  from (values
    ('North 40', 'Lyon County, MN', 320::numeric, 'Potatoes', 'Fungicide - Chlorothalonil', 7, 12, now() + interval '1 day', now() + interval '3 days', 'urgent', 'scheduled', null::text),
    ('South 80', 'Lyon County, MN', 640::numeric, 'Potatoes', 'Insecticide - Imidacloprid', 5, 10, now() + interval '2 days', now() + interval '5 days', 'normal', 'scheduled', null::text),
    ('West Quarter', 'Redwood County, MN', 160::numeric, 'Potatoes', 'Fungicide - Mancozeb', 8, 12, now(), now() + interval '2 days', 'urgent', 'assigned', 'Jody Bjornson'),
    ('North 40', 'Lyon County, MN', 320::numeric, 'Potatoes', 'Fungicide - Chlorothalonil', 6, 12, now() - interval '5 days', now() - interval '3 days', 'normal', 'completed', 'Jody Bjornson'),
    ('South 80', 'Lyon County, MN', 640::numeric, 'Potatoes', 'Insecticide - Imidacloprid', 4, 10, now() - interval '8 days', now() - interval '6 days', 'normal', 'completed', 'Jody Bjornson'),
    ('River Bottom', 'Yellow Medicine County, MN', 480::numeric, 'Potatoes', 'Desiccant - Reglone', 1, 1, now() + interval '21 days', now() + interval '25 days', 'flexible', 'scheduled', null::text),
    ('Training Field', 'Marshall, MN', 40::numeric, 'Soybeans', 'SOURCE', 1, 2, now() + interval '7 days', now() + interval '10 days', 'normal', 'scheduled', null::text)
  ) as rows(sched_field, sched_location, sched_acres, crop, product, app_no, total_apps, opens_at, closes_at, priority_value, status_value, pilot)
  where not exists (
    select 1 from public.application_schedule s
    where s.field_name = rows.sched_field
      and s.product_to_apply = rows.product
      and s.application_number = rows.app_no
      and s.dealer_id is not distinct from demo_dealer_id
  );
end $$;

notify pgrst, 'reload schema';
