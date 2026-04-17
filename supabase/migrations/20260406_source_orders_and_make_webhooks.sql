create extension if not exists pgcrypto;
create extension if not exists pg_net with schema extensions;

create table if not exists public.source_orders (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  email text,
  state text,
  crop_type text,
  acres integer,
  estimated_total numeric,
  order_type text,
  status text default 'pending',
  created_at timestamptz default now()
);

comment on table public.source_orders is 'Direct SOURCE product orders captured from the /source landing page.';

alter table public.source_orders enable row level security;

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

-- Legacy Make.com webhook triggers were previously created here using
-- supabase_functions.http_request. They are intentionally skipped now
-- because this project uses pg_net + edge functions for enrollment flow.

-- Current app behavior note:
-- Hylio form submissions are stored in public.operator_leads by the existing /api/submit-lead handler.
-- In Make.com, branch Hylio records from operator_leads using lead_tag = 'High Ticket'
-- or interest_type matching the Hylio flow.
-- If you later introduce a dedicated public.hylio_leads table, create the same trigger pattern there.
