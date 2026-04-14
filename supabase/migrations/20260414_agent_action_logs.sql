create table if not exists public.agent_action_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  executed_at timestamptz,
  action_type text not null,
  target_table text not null,
  target_id uuid,
  target_label text,
  request_message text,
  reason text,
  updates jsonb not null default '{}'::jsonb,
  status text not null default 'completed',
  result_summary text,
  error_message text
);

create index if not exists agent_action_logs_created_at_idx
on public.agent_action_logs (created_at desc);

create index if not exists agent_action_logs_action_type_idx
on public.agent_action_logs (action_type);

alter table public.agent_action_logs enable row level security;

drop policy if exists "Authenticated users can read agent action logs" on public.agent_action_logs;
create policy "Authenticated users can read agent action logs"
on public.agent_action_logs
for select
to authenticated
using (true);
