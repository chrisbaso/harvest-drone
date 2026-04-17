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

create index if not exists idx_chat_leads_captured on public.chat_leads (lead_captured);
create index if not exists idx_chat_leads_created on public.chat_leads (created_at desc);

alter table public.chat_leads enable row level security;

drop policy if exists "Public can read chat leads" on public.chat_leads;
create policy "Public can read chat leads"
on public.chat_leads
for select
to anon, authenticated
using (true);
