create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  title text not null,
  description text,
  audience text,
  status text not null default 'draft',
  estimated_duration_minutes integer,
  content_version text not null default 'v1'
);

create table if not exists public.training_modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  course_id uuid not null references public.training_courses (id) on delete cascade,
  slug text not null,
  title text not null,
  sort_order integer not null default 0,
  unique (course_id, slug)
);

create table if not exists public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  module_id uuid not null references public.training_modules (id) on delete cascade,
  slug text not null,
  title text not null,
  lesson_type text not null check (lesson_type in ('article', 'video', 'external_link', 'checklist', 'scenario', 'file_download')),
  content_path text,
  external_url text,
  official_material_required boolean not null default false,
  checklist_slug text,
  required boolean not null default true,
  estimated_minutes integer,
  sort_order integer not null default 0,
  content_version text not null default 'v1',
  unique (module_id, slug)
);

create table if not exists public.training_assessments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  course_id uuid references public.training_courses (id) on delete cascade,
  slug text not null unique,
  title text not null,
  passing_score integer not null default 80,
  retakes_allowed boolean not null default true,
  status text not null default 'draft'
);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.training_assessments (id) on delete cascade,
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'scenario')),
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_choice integer not null,
  explanation text,
  sort_order integer not null default 0
);

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  course_id uuid not null references public.training_courses (id) on delete cascade,
  status text not null default 'assigned',
  assigned_by uuid,
  due_at timestamptz,
  completed_at timestamptz,
  unique (operator_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  lesson_id uuid not null references public.training_lessons (id) on delete cascade,
  status text not null default 'not_started',
  completed_at timestamptz,
  content_version text,
  unique (operator_id, lesson_id)
);

create table if not exists public.assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  assessment_id uuid not null references public.training_assessments (id) on delete cascade,
  score integer not null,
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  attempt_number integer not null default 1
);

create table if not exists public.practical_evaluations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  template_slug text not null,
  title text not null,
  status text not null default 'pending',
  evaluator_id uuid,
  evaluator_role text,
  signed_at timestamptz,
  evidence_url text,
  notes text
);

create table if not exists public.practical_evaluation_items (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.practical_evaluations (id) on delete cascade,
  label text not null,
  required boolean not null default true,
  passed boolean,
  retest_required boolean not null default false,
  notes text,
  evidence_url text,
  evaluated_at timestamptz
);

create table if not exists public.training_evidence (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  lesson_id uuid references public.training_lessons (id) on delete set null,
  practical_evaluation_id uuid references public.practical_evaluations (id) on delete set null,
  job_id uuid references public.jobs (id) on delete set null,
  evidence_type text not null default 'file',
  storage_path text,
  external_url text,
  notes text
);

create table if not exists public.operator_credentials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  organization_id uuid,
  aircraft_id uuid,
  credential_type text not null,
  issuing_authority text,
  identifier_masked text,
  state_territory text,
  category text,
  aircraft_model text,
  payload_type text,
  issue_date date,
  expiration_date date,
  verification_status text not null default 'missing' check (verification_status in ('missing', 'uploaded', 'pending_review', 'verified', 'rejected', 'expired')),
  reviewer_id uuid,
  evidence_url text,
  notes text,
  audit_metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.credential_requirements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  credential_type text not null,
  state_territory text,
  category text,
  aircraft_model text,
  payload_type text,
  operation_type text,
  required boolean not null default true,
  legal_or_safety_critical boolean not null default true,
  notes text
);

create table if not exists public.operator_qualifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  operator_id uuid references public.operator_leads (id) on delete cascade,
  level text not null check (level in ('OBSERVER', 'TRAINEE', 'QUALIFIED_OPERATOR', 'LEAD_OPERATOR', 'CHIEF_PILOT_OR_ADMIN')),
  aircraft_model text,
  payload_type text,
  state_territory text,
  category text,
  effective_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  granted_by uuid,
  notes text
);

create table if not exists public.qualification_rules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  title text not null,
  rule_json jsonb not null default '{}'::jsonb,
  severity text not null default 'blocker' check (severity in ('blocker', 'warning')),
  active boolean not null default true
);

create table if not exists public.readiness_checks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  job_id uuid references public.jobs (id) on delete cascade,
  operator_id uuid references public.operator_leads (id) on delete set null,
  result text not null check (result in ('ready', 'blocked', 'warning')),
  blockers jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  checked_by uuid,
  override_by uuid,
  override_reason text
);

create table if not exists public.sop_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  title text not null,
  content_path text,
  version text not null default 'v1',
  status text not null default 'draft'
);

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  content_type text not null,
  content_slug text not null,
  version text not null,
  change_summary text,
  recurrent_training_required boolean not null default false,
  unique (content_type, content_slug, version)
);

create index if not exists operator_credentials_operator_idx on public.operator_credentials (operator_id);
create index if not exists operator_credentials_type_status_idx on public.operator_credentials (credential_type, verification_status);
create index if not exists operator_credentials_expiration_idx on public.operator_credentials (expiration_date);
create index if not exists readiness_checks_job_idx on public.readiness_checks (job_id, created_at desc);

alter table public.training_courses enable row level security;
alter table public.training_modules enable row level security;
alter table public.training_lessons enable row level security;
alter table public.training_assessments enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.training_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assessment_attempts enable row level security;
alter table public.practical_evaluations enable row level security;
alter table public.practical_evaluation_items enable row level security;
alter table public.training_evidence enable row level security;
alter table public.operator_credentials enable row level security;
alter table public.credential_requirements enable row level security;
alter table public.operator_qualifications enable row level security;
alter table public.qualification_rules enable row level security;
alter table public.readiness_checks enable row level security;
alter table public.sop_documents enable row level security;
alter table public.content_versions enable row level security;

do $$
declare
  table_name text;
  read_policy text;
  manage_policy text;
begin
  foreach table_name in array array[
    'training_courses',
    'training_modules',
    'training_lessons',
    'training_assessments',
    'assessment_questions',
    'training_enrollments',
    'lesson_progress',
    'assessment_attempts',
    'practical_evaluations',
    'practical_evaluation_items',
    'training_evidence',
    'operator_credentials',
    'credential_requirements',
    'operator_qualifications',
    'qualification_rules',
    'readiness_checks',
    'sop_documents',
    'content_versions'
  ]
  loop
    read_policy := 'Authenticated can read ' || table_name;
    manage_policy := 'Authenticated can manage ' || table_name;
    execute format('drop policy if exists %I on public.%I', read_policy, table_name);
    execute format('create policy %I on public.%I for select to authenticated using (true)', read_policy, table_name);
    execute format('drop policy if exists %I on public.%I', manage_policy, table_name);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', manage_policy, table_name);
  end loop;
end $$;

notify pgrst, 'reload schema';
