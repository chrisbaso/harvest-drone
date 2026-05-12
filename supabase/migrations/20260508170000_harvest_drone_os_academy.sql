create table if not exists public.academy_modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  slug text not null unique,
  title text not null,
  description text,
  category text not null,
  estimated_minutes integer not null default 0,
  embedded_video_url text,
  assigned_roles text[] not null default array['operator', 'dealer', 'admin'],
  certification_required boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.academy_lessons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  module_id uuid not null references public.academy_modules (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  estimated_minutes integer not null default 0,
  video_url text,
  content text,
  content_path text,
  resources jsonb not null default '[]'::jsonb,
  checklist_items jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  unique (module_id, slug)
);

create table if not exists public.academy_resources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  module_id uuid references public.academy_modules (id) on delete set null,
  title text not null,
  description text,
  category text not null,
  resource_type text not null default 'Guide',
  url text not null,
  sort_order integer not null default 0,
  status text not null default 'published' check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.academy_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null,
  module_id uuid not null references public.academy_modules (id) on delete cascade,
  lesson_id uuid not null references public.academy_lessons (id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  checklist_state jsonb not null default '{}'::jsonb,
  unique (user_id, lesson_id)
);

create table if not exists public.academy_certifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  user_id uuid not null unique,
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Ready for Field Review', 'Certified')),
  field_review_requested_at timestamptz,
  field_review_passed_at timestamptz,
  certified_at timestamptz,
  certified_by uuid,
  notes text
);

create table if not exists public.academy_comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  module_id uuid not null references public.academy_modules (id) on delete cascade,
  parent_id uuid references public.academy_comments (id) on delete cascade,
  user_id uuid,
  author_name text not null default 'Academy user',
  body text not null,
  pinned boolean not null default false
);

create index if not exists academy_modules_category_idx on public.academy_modules (category, sort_order);
create index if not exists academy_lessons_module_idx on public.academy_lessons (module_id, sort_order);
create index if not exists academy_resources_category_idx on public.academy_resources (category, sort_order);
create index if not exists academy_progress_user_idx on public.academy_progress (user_id, status);
create index if not exists academy_comments_module_idx on public.academy_comments (module_id, created_at desc);

alter table public.academy_modules enable row level security;
alter table public.academy_lessons enable row level security;
alter table public.academy_resources enable row level security;
alter table public.academy_progress enable row level security;
alter table public.academy_certifications enable row level security;
alter table public.academy_comments enable row level security;

do $$
declare
  table_name text;
  read_policy text;
  manage_policy text;
begin
  foreach table_name in array array[
    'academy_modules',
    'academy_lessons',
    'academy_resources',
    'academy_comments'
  ]
  loop
    read_policy := 'Authenticated can read ' || table_name;
    manage_policy := 'Authenticated can manage ' || table_name;
    execute format('drop policy if exists %I on public.%I', read_policy, table_name);
    execute format('create policy %I on public.%I for select to authenticated using (true)', read_policy, table_name);
    execute format('drop policy if exists %I on public.%I', manage_policy, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using (exists (select 1 from public.user_profiles where id = auth.uid() and role in (''admin'', ''network_manager'', ''dealer''))) with check (exists (select 1 from public.user_profiles where id = auth.uid() and role in (''admin'', ''network_manager'', ''dealer'')))',
      manage_policy,
      table_name
    );
  end loop;
end $$;

drop policy if exists "Users can read own academy progress" on public.academy_progress;
create policy "Users can read own academy progress"
  on public.academy_progress for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer'))
  );

drop policy if exists "Users can update own academy progress" on public.academy_progress;
create policy "Users can update own academy progress"
  on public.academy_progress for all to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer'))
  )
  with check (
    user_id = auth.uid()
    or exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer'))
  );

drop policy if exists "Users can read own academy certification" on public.academy_certifications;
create policy "Users can read own academy certification"
  on public.academy_certifications for select to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer'))
  );

drop policy if exists "Managers can manage academy certification" on public.academy_certifications;
create policy "Managers can manage academy certification"
  on public.academy_certifications for all to authenticated
  using (exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer')))
  with check (exists (select 1 from public.user_profiles where id = auth.uid() and role in ('admin', 'network_manager', 'dealer')));

insert into public.academy_modules (slug, title, description, category, estimated_minutes, embedded_video_url, assigned_roles, certification_required, sort_order, status)
values
  ('start-here', 'Start Here: Harvest Drone OS Academy', 'Orientation for operators, managers, and enterprise stakeholders using Harvest Drone OS.', 'Start Here', 18, 'https://www.youtube.com/embed/dQw4w9WgXcQ', array['operator','dealer','network_manager','admin'], true, 1, 'published'),
  ('operator-foundations', 'Hylio Operator Foundations', 'Core operator onboarding linked to Harvest-authored Hylio training content.', 'Operator Training', 92, 'https://www.youtube.com/embed/ysz5S6PUM-U', array['operator','dealer','admin'], true, 2, 'published'),
  ('drone-safety-compliance', 'Drone Safety & Compliance', 'Part 107 readiness, aircraft registration, Remote ID, site safety, and pre-flight discipline.', 'Drone Safety', 55, 'https://www.youtube.com/embed/ScMzIvxBSi4', array['operator','dealer','admin'], true, 3, 'published'),
  ('field-operations-basics', 'Field Operations Basics', 'Field mapping, weather decisions, product windows, and job closeout.', 'Field Operations', 64, 'https://www.youtube.com/embed/ysz5S6PUM-U', array['operator','dealer','admin'], true, 4, 'published'),
  ('source-education', 'SOURCE Product Education', 'How SOURCE fits into the Harvest Drone sales and education workflow.', 'SOURCE Education', 42, null, array['operator','dealer','network_manager','admin'], false, 5, 'published'),
  ('enterprise-playbooks', 'Enterprise Deployment Playbooks', 'Operating model, RDO-style rollout, network reporting, and executive compliance views.', 'Enterprise Playbooks', 46, null, array['dealer','network_manager','admin'], false, 6, 'published'),
  ('sop-library', 'SOP Library', 'Pre-flight, post-flight, chemical handling, battery handling, emergency response, and drift management.', 'SOP Library', 38, null, array['operator','dealer','network_manager','admin'], true, 7, 'published'),
  ('operator-certification', 'Operator Certification', 'Final knowledge check, field review scheduling, and certification status tracking.', 'Certification', 35, null, array['operator','dealer','admin'], true, 8, 'published')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  estimated_minutes = excluded.estimated_minutes,
  embedded_video_url = excluded.embedded_video_url,
  assigned_roles = excluded.assigned_roles,
  certification_required = excluded.certification_required,
  sort_order = excluded.sort_order,
  status = excluded.status,
  updated_at = timezone('utc', now());

insert into public.academy_lessons (module_id, slug, title, description, estimated_minutes, video_url, content, content_path, checklist_items, sort_order, status)
select m.id, lesson.slug, lesson.title, lesson.description, lesson.estimated_minutes, lesson.video_url, lesson.content, lesson.content_path, lesson.checklist_items::jsonb, lesson.sort_order, 'published'
from public.academy_modules m
join (
  values
    ('start-here', 'how-academy-works', 'How the Academy works', 'Assigned modules, SOP evidence, completion tracking, and field review requirements.', 8, 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Harvest Drone OS Academy is the operating training hub for safe, documented drone application work.', null, '["Review dashboard","Open assigned module"]', 1),
    ('operator-foundations', 'harvest-operating-model', 'Harvest Drone operating model', 'Training as an operating gate for safe, documented Hylio work.', 18, 'https://www.youtube.com/embed/ysz5S6PUM-U', null, 'content/training/hylio/00-orientation.mdx', '["Review operating model","Acknowledge stop-work authority"]', 1),
    ('operator-foundations', 'compliance-foundations', 'Compliance foundations', 'Part 107, Part 137, 44807, Remote ID, pesticide licensing, and credential evidence.', 40, null, null, 'content/training/hylio/01-compliance-foundations.mdx', '["Review credential requirements","Confirm renewal cadence"]', 2),
    ('drone-safety-compliance', 'preflight-discipline', 'Pre-flight checklist discipline', 'The checklist is an operating control, not a paperwork step.', 18, null, 'Pre-flight review confirms aircraft condition, batteries, payload, boundaries, obstacles, weather, emergency landing zones, and communication plan before launch.', null, '["Open pre-flight SOP","Confirm checklist cadence"]', 1),
    ('field-operations-basics', 'field-mapping-boundaries', 'Field mapping and boundaries', 'Create accurate field maps for safe and effective coverage.', 14, 'https://www.youtube.com/embed/ysz5S6PUM-U', 'Accurate field maps include boundary confirmation, obstacle marking, sensitive areas, buffer zones, product constraints, and staging locations.', null, '["Mark boundaries","Identify buffer zones"]', 1),
    ('sop-library', 'core-sop-review', 'Core SOP review', 'The procedures every operator must know before field operations.', 20, null, 'Core SOPs define how operators inspect aircraft, handle batteries, mix products, manage drift, respond to emergencies, and close out jobs.', null, '["Open core SOPs","Acknowledge stop-work criteria"]', 1),
    ('operator-certification', 'certification-readiness', 'Certification readiness review', 'Confirm completion, credentials, SOPs, and field review readiness.', 18, null, 'Operators become Ready for Field Review when assigned certification-required modules are complete.', null, '["Assigned modules complete","Field review requested"]', 1)
) as lesson(module_slug, slug, title, description, estimated_minutes, video_url, content, content_path, checklist_items, sort_order)
on m.slug = lesson.module_slug
on conflict (module_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  estimated_minutes = excluded.estimated_minutes,
  video_url = excluded.video_url,
  content = excluded.content,
  content_path = excluded.content_path,
  checklist_items = excluded.checklist_items,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.academy_resources (module_id, title, description, category, resource_type, url, sort_order, status)
select m.id, resource.title, resource.description, resource.category, resource.resource_type, resource.url, resource.sort_order, 'published'
from public.academy_modules m
join (
  values
    ('operator-foundations', 'Full Hylio Operator Foundations course', 'Existing course route with detailed lessons and assessments.', 'Operator Training', 'Course', '/training/courses/hylio-operator-foundations', 1),
    ('drone-safety-compliance', 'Drone Pre-Flight SOP', 'Mission-specific pre-flight checklist.', 'SOPs & Procedures', 'SOP', '/training/checklists/hylio-preflight-checklist', 1),
    ('field-operations-basics', 'Post-Flight Checklist', 'Closeout and inspection checklist.', 'SOPs & Procedures', 'SOP', '/training/checklists/hylio-postflight-checklist', 1),
    ('source-education', 'SOURCE Mode of Action', 'SOURCE education entrypoint.', 'SOURCE Education', 'Guide', '/source', 1),
    ('enterprise-playbooks', 'RDO Enterprise Demo Runbook', 'Enterprise rollout guide.', 'Enterprise Deployment', 'Guide', '/docs/rdo-enterprise-demo-runbook.md', 1),
    ('sop-library', 'Chemical Handling & Mixing SOP', 'Chemical label, PPE, mixing, loading, and spill controls.', 'SOPs & Procedures', 'SOP', '/training/checklists/chemical-mixing-loading', 1),
    ('sop-library', 'Battery Maintenance Guide', 'Battery handling, charging, quarantine, and fire response.', 'Maintenance', 'SOP', '/training/checklists/battery-handling', 2),
    ('operator-certification', 'Pilot Readiness Checklist', 'Certification and field review evidence checklist.', 'Certification', 'Checklist', '/docs/rdo-pilot-readiness-checklist.md', 1)
) as resource(module_slug, title, description, category, resource_type, url, sort_order)
on m.slug = resource.module_slug;

notify pgrst, 'reload schema';
