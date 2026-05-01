create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

create table if not exists public.drip_sequences (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  lead_type text not null check (lead_type in ('grower', 'operator', 'source', 'hylio')),
  name text not null,
  description text,
  is_active boolean not null default true
);

alter table public.drip_sequences add column if not exists slug text;
alter table public.drip_sequences add column if not exists lead_type text;
alter table public.drip_sequences add column if not exists name text;
alter table public.drip_sequences add column if not exists description text;
alter table public.drip_sequences add column if not exists is_active boolean not null default true;
alter table public.drip_sequences add column if not exists updated_at timestamptz not null default timezone('utc', now());

create table if not exists public.drip_emails (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  sequence_id uuid not null references public.drip_sequences (id) on delete cascade,
  step_number integer not null,
  slug text not null,
  subject text not null,
  mailchimp_tag text not null,
  delay_days integer not null default 0,
  is_active boolean not null default true,
  unique (sequence_id, step_number),
  unique (sequence_id, slug)
);

alter table public.drip_emails add column if not exists sequence_id uuid references public.drip_sequences (id) on delete cascade;
alter table public.drip_emails add column if not exists step_number integer;
alter table public.drip_emails add column if not exists slug text;
alter table public.drip_emails add column if not exists subject text;
alter table public.drip_emails add column if not exists mailchimp_tag text;
alter table public.drip_emails add column if not exists delay_days integer not null default 0;
alter table public.drip_emails add column if not exists is_active boolean not null default true;

create table if not exists public.drip_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  sequence_id uuid references public.drip_sequences (id) on delete set null,
  lead_type text not null,
  lead_id uuid not null,
  email text not null,
  first_name text,
  current_step integer not null default 0,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'stopped')),
  next_send_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.drip_enrollments add column if not exists sequence_id uuid references public.drip_sequences (id) on delete set null;
alter table public.drip_enrollments add column if not exists lead_type text;
alter table public.drip_enrollments add column if not exists lead_id uuid;
alter table public.drip_enrollments add column if not exists email text;
alter table public.drip_enrollments add column if not exists first_name text;
alter table public.drip_enrollments add column if not exists current_step integer not null default 0;
alter table public.drip_enrollments add column if not exists status text not null default 'active';
alter table public.drip_enrollments add column if not exists next_send_at timestamptz;
alter table public.drip_enrollments add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists drip_sequences_lead_type_idx on public.drip_sequences (lead_type, is_active);
create index if not exists drip_emails_sequence_idx on public.drip_emails (sequence_id, step_number);
create unique index if not exists drip_emails_sequence_step_unique_idx on public.drip_emails (sequence_id, step_number);
create unique index if not exists drip_emails_sequence_slug_unique_idx on public.drip_emails (sequence_id, slug);
create index if not exists drip_enrollments_status_idx on public.drip_enrollments (status, next_send_at);
create index if not exists drip_enrollments_email_idx on public.drip_enrollments (email);

alter table public.drip_sequences enable row level security;
alter table public.drip_emails enable row level security;
alter table public.drip_enrollments enable row level security;

drop policy if exists "Authenticated can read drip sequences" on public.drip_sequences;
create policy "Authenticated can read drip sequences"
  on public.drip_sequences for select to authenticated using (true);

drop policy if exists "Authenticated can read drip emails" on public.drip_emails;
create policy "Authenticated can read drip emails"
  on public.drip_emails for select to authenticated using (true);

drop policy if exists "Authenticated can read drip enrollments" on public.drip_enrollments;
create policy "Authenticated can read drip enrollments"
  on public.drip_enrollments for select to authenticated using (true);

insert into public.drip_sequences (slug, lead_type, name, description)
values
  ('grower-welcome', 'grower', 'Grower Welcome', 'Mailchimp customer journey for grower funnel leads.'),
  ('operator-welcome', 'operator', 'Operator Welcome', 'Mailchimp customer journey for operator network leads.'),
  ('source-order', 'source', 'SOURCE Order', 'Mailchimp customer journey for new SOURCE orders.'),
  ('source-post-purchase', 'source', 'SOURCE Post Purchase', 'Mailchimp customer journey for paid SOURCE customers.')
on conflict (slug) do update set
  lead_type = excluded.lead_type,
  name = excluded.name,
  description = excluded.description,
  is_active = true,
  updated_at = timezone('utc', now());

with seed(sequence_slug, step_number, slug, subject, mailchimp_tag, delay_days) as (
  values
    ('grower-welcome', 1, 'grower-welcome-1', 'Your Harvest Drone acre review', 'grower-welcome-1', 0),
    ('grower-welcome', 2, 'grower-welcome-2', 'What happens after the fit check', 'grower-welcome-2', 1),
    ('grower-welcome', 3, 'grower-welcome-3', 'SOURCE pricing and application timing', 'grower-welcome-3', 3),
    ('grower-welcome', 4, 'grower-welcome-4', 'Drone application windows', 'grower-welcome-4', 5),
    ('grower-welcome', 5, 'grower-welcome-5', 'EarthOptics scan opportunity', 'grower-welcome-5', 7),
    ('grower-welcome', 6, 'grower-welcome-6', 'Your next best acre decision', 'grower-welcome-6', 10),
    ('grower-welcome', 7, 'grower-welcome-7', 'Still want an acre review?', 'grower-welcome-7', 14),
    ('operator-welcome', 1, 'operator-welcome-1', 'Harvest Drone operator network', 'operator-welcome-1', 0),
    ('operator-welcome', 2, 'operator-welcome-2', 'How routed acreage works', 'operator-welcome-2', 2),
    ('operator-welcome', 3, 'operator-welcome-3', 'Qualification and compliance checklist', 'operator-welcome-3', 5),
    ('operator-welcome', 4, 'operator-welcome-4', 'Dealer and operator economics', 'operator-welcome-4', 8),
    ('operator-welcome', 5, 'operator-welcome-5', 'Schedule your territory review', 'operator-welcome-5', 12),
    ('source-order', 1, 'source-order-1', 'Your SOURCE order request', 'source-order-1', 0),
    ('source-order', 2, 'source-order-2', 'SOURCE order logistics and timing', 'source-order-2', 2),
    ('source-post-purchase', 1, 'source-post-purchase-1', 'SOURCE application planning', 'source-post-purchase-1', 0),
    ('source-post-purchase', 2, 'source-post-purchase-2', 'What to watch after application', 'source-post-purchase-2', 7),
    ('source-post-purchase', 3, 'source-post-purchase-3', 'Capture your acre results', 'source-post-purchase-3', 21),
    ('source-post-purchase', 4, 'source-post-purchase-4', 'Plan next season reorder acres', 'source-post-purchase-4', 45)
)
insert into public.drip_emails (sequence_id, step_number, slug, subject, mailchimp_tag, delay_days)
select ds.id, seed.step_number, seed.slug, seed.subject, seed.mailchimp_tag, seed.delay_days
from seed
join public.drip_sequences ds on ds.slug = seed.sequence_slug
on conflict (sequence_id, step_number) do update set
  slug = excluded.slug,
  subject = excluded.subject,
  mailchimp_tag = excluded.mailchimp_tag,
  delay_days = excluded.delay_days,
  is_active = true;

create or replace function public.sync_grower_to_crm()
returns trigger
language plpgsql
as $$
declare
  existing_crm_lead_id uuid;
begin
  select id into existing_crm_lead_id
  from public.crm_leads
  where legacy_grower_lead_id = new.id
  limit 1;

  if existing_crm_lead_id is null then
    insert into public.crm_leads (
      lead_type,
      stage,
      route_type,
      owner,
      source,
      state,
      county,
      acres,
      revenue_stream,
      assigned_operator_id,
      legacy_grower_lead_id,
      notes,
      dealer_id,
      metadata
    )
    values (
      'grower',
      coalesce(new.status, 'new'),
      coalesce(new.route_type, 'direct_hd'),
      coalesce(new.assigned_to, 'Harvest Drone'),
      coalesce(new.source, new.lead_source),
      new.state,
      new.county,
      new.acres,
      case when new.route_type = 'route_to_operator' then 'routed_acreage' else 'direct_service' end,
      new.assigned_operator_id,
      new.id,
      new.notes,
      new.dealer_id,
      jsonb_build_object(
        'lead_score', new.lead_score,
        'fit_score', new.fit_score,
        'lead_priority', new.lead_priority,
        'utm_source', new.utm_source,
        'utm_medium', new.utm_medium,
        'utm_campaign', new.utm_campaign
      )
    );
  else
    update public.crm_leads
    set
      stage = coalesce(new.status, stage),
      route_type = coalesce(new.route_type, route_type),
      owner = coalesce(new.assigned_to, owner),
      assigned_operator_id = new.assigned_operator_id,
      dealer_id = new.dealer_id,
      notes = new.notes,
      updated_at = timezone('utc', now())
    where id = existing_crm_lead_id;
  end if;

  return new;
end;
$$;

create or replace function public.sync_operator_to_crm()
returns trigger
language plpgsql
as $$
declare
  existing_crm_lead_id uuid;
begin
  select id into existing_crm_lead_id
  from public.crm_leads
  where legacy_operator_lead_id = new.id
  limit 1;

  if existing_crm_lead_id is null then
    insert into public.crm_leads (
      lead_type,
      stage,
      route_type,
      owner,
      source,
      state,
      acres,
      revenue_stream,
      legacy_operator_lead_id,
      notes,
      dealer_id,
      metadata
    )
    values (
      'operator',
      coalesce(new.status, 'new'),
      'operator_pool',
      coalesce(new.assigned_to, 'Harvest Drone'),
      coalesce(new.source, new.lead_source),
      new.state,
      coalesce(new.acreage_access, new.acreage_capacity),
      'operator_network',
      new.id,
      new.notes,
      new.dealer_id,
      jsonb_build_object(
        'operator_score', new.operator_score,
        'experience_level', new.experience_level,
        'budget_range', new.budget_range,
        'counties_served', new.counties_served
      )
    );
  else
    update public.crm_leads
    set
      stage = coalesce(new.status, stage),
      owner = coalesce(new.assigned_to, owner),
      dealer_id = new.dealer_id,
      notes = new.notes,
      updated_at = timezone('utc', now())
    where id = existing_crm_lead_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_sync_grower_to_crm on public.grower_leads;
create trigger trg_sync_grower_to_crm
after insert or update on public.grower_leads
for each row
execute function public.sync_grower_to_crm();

drop trigger if exists trg_sync_operator_to_crm on public.operator_leads;
create trigger trg_sync_operator_to_crm
after insert or update on public.operator_leads
for each row
execute function public.sync_operator_to_crm();

select cron.unschedule('process-drip-queue-every-15-min')
where exists (
  select 1 from cron.job where jobname = 'process-drip-queue-every-15-min'
);

select cron.schedule(
  'process-drip-queue-every-15-min',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://tmnrjldripqzqiewuqym.supabase.co/functions/v1/process-drip-queue',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || coalesce(current_setting('supabase.service_role_key', true), ''),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);

notify pgrst, 'reload schema';
