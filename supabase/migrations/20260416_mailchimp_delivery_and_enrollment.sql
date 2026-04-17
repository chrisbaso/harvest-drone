create extension if not exists pg_net with schema extensions;

alter table if exists public.source_orders
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists county text,
  add column if not exists product text default 'SOURCE',
  add column if not exists invoice_reminder_sent timestamptz;

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

alter table public.automation_flags enable row level security;

drop policy if exists "Authenticated users can manage automation flags" on public.automation_flags;
create policy "Authenticated users can manage automation flags"
on public.automation_flags
for all
to authenticated
using (true)
with check (true);

drop trigger if exists trg_grower_drip_enroll on public.grower_leads;
drop trigger if exists trg_operator_drip_enroll on public.operator_leads;
drop trigger if exists trg_source_drip_enroll on public.source_orders;
drop trigger if exists trg_notify_grower on public.grower_leads;
drop trigger if exists trg_notify_operator on public.operator_leads;
drop trigger if exists trg_notify_source on public.source_orders;
drop trigger if exists grower_leads_make_webhook on public.grower_leads;
drop trigger if exists operator_leads_make_webhook on public.operator_leads;
drop trigger if exists source_orders_make_webhook on public.source_orders;

create or replace function public.enroll_lead_via_edge()
returns trigger
language plpgsql
as $$
begin
  perform net.http_post(
    url := 'https://tmnrjldripqzqiewuqym.supabase.co/functions/v1/enroll-lead',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || coalesce(current_setting('supabase.service_role_key', true), ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'lead_type', TG_ARGV[0],
      'lead_id', NEW.id,
      'email', NEW.email,
      'first_name', coalesce(NEW.first_name, ''),
      'last_name', coalesce(NEW.last_name, ''),
      'state', coalesce(NEW.state, ''),
      'county', coalesce(NEW.county, ''),
      'acres', coalesce(NEW.acres::text, ''),
      'phone', coalesce(NEW.mobile, ''),
      'created_at', NEW.created_at
    )
  );

  return NEW;
exception
  when others then
    return NEW;
end;
$$;

create or replace function public.enroll_source_via_edge()
returns trigger
language plpgsql
as $$
begin
  perform net.http_post(
    url := 'https://tmnrjldripqzqiewuqym.supabase.co/functions/v1/enroll-lead',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || coalesce(current_setting('supabase.service_role_key', true), ''),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'lead_type', 'source',
      'lead_id', NEW.id,
      'email', NEW.email,
      'first_name', coalesce(NEW.first_name, ''),
      'last_name', '',
      'state', coalesce(NEW.state, ''),
      'county', coalesce(NEW.county, ''),
      'acres', coalesce(NEW.acres::text, ''),
      'phone', '',
      'product', coalesce(NEW.product, 'SOURCE'),
      'estimated_total', coalesce(NEW.estimated_total::text, ''),
      'created_at', NEW.created_at
    )
  );

  return NEW;
exception
  when others then
    return NEW;
end;
$$;

drop trigger if exists trg_enroll_grower on public.grower_leads;
create trigger trg_enroll_grower
after insert on public.grower_leads
for each row
execute function public.enroll_lead_via_edge('grower');

drop trigger if exists trg_enroll_operator on public.operator_leads;
create trigger trg_enroll_operator
after insert on public.operator_leads
for each row
execute function public.enroll_lead_via_edge('operator');

drop trigger if exists trg_enroll_source on public.source_orders;
create trigger trg_enroll_source
after insert on public.source_orders
for each row
execute function public.enroll_source_via_edge();
