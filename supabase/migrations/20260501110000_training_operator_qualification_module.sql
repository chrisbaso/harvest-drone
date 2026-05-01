create table if not exists public.operator_qualification_reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  requested_at timestamptz not null default timezone('utc', now()),
  decided_at timestamptz,
  operator_id uuid references public.operator_leads (id) on delete cascade,
  job_id uuid references public.jobs (id) on delete set null,
  requested_by uuid,
  reviewer_id uuid,
  status text not null default 'requested' check (
    status in ('requested', 'approved', 'needs_remediation', 'revoked', 'expired')
  ),
  requested_level text not null check (
    requested_level in ('OBSERVER', 'TRAINEE', 'QUALIFIED_OPERATOR', 'LEAD_OPERATOR', 'CHIEF_PILOT_OR_ADMIN')
  ),
  computed_level text check (
    computed_level in ('OBSERVER', 'TRAINEE', 'QUALIFIED_OPERATOR', 'LEAD_OPERATOR', 'CHIEF_PILOT_OR_ADMIN')
  ),
  aircraft_model text,
  payload_type text,
  state_territory text,
  category text,
  gate_snapshot jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  approval_scope jsonb not null default '{}'::jsonb,
  effective_at timestamptz,
  expires_at timestamptz,
  reviewer_notes text,
  remediation_notes text
);

create table if not exists public.operator_qualification_review_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  review_id uuid not null references public.operator_qualification_reviews (id) on delete cascade,
  event_type text not null check (
    event_type in ('requested', 'gate_snapshot_updated', 'approved', 'needs_remediation', 'revoked', 'expired', 'note_added')
  ),
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists operator_qualification_reviews_operator_idx
  on public.operator_qualification_reviews (operator_id, created_at desc);

create index if not exists operator_qualification_reviews_job_idx
  on public.operator_qualification_reviews (job_id, created_at desc)
  where job_id is not null;

create index if not exists operator_qualification_reviews_status_idx
  on public.operator_qualification_reviews (status, requested_at desc)
  where status in ('requested', 'needs_remediation');

create index if not exists operator_qualification_review_events_review_idx
  on public.operator_qualification_review_events (review_id, created_at desc);

alter table public.operator_qualification_reviews enable row level security;
alter table public.operator_qualification_review_events enable row level security;

drop policy if exists "Authenticated can read operator qualification reviews" on public.operator_qualification_reviews;
create policy "Authenticated can read operator qualification reviews"
  on public.operator_qualification_reviews
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can manage operator qualification reviews" on public.operator_qualification_reviews;
create policy "Authenticated can manage operator qualification reviews"
  on public.operator_qualification_reviews
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated can read operator qualification review events" on public.operator_qualification_review_events;
create policy "Authenticated can read operator qualification review events"
  on public.operator_qualification_review_events
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated can manage operator qualification review events" on public.operator_qualification_review_events;
create policy "Authenticated can manage operator qualification review events"
  on public.operator_qualification_review_events
  for all
  to authenticated
  using (true)
  with check (true);

notify pgrst, 'reload schema';
