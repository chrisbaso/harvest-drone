-- Enterprise pilot compatibility layer.
--
-- Earlier training migrations created shared operator/training/readiness tables for
-- lead workflows. The enterprise pilot keeps those tables intact and adds explicit
-- enterprise columns so RDO-style organizations can use the same records without
-- breaking legacy operator_leads/jobs data.

alter table public.operator_credentials
  add column if not exists enterprise_operator_id uuid references public.enterprise_operators (id) on delete cascade,
  add column if not exists enterprise_organization_id uuid references public.organizations (id) on delete cascade,
  add column if not exists verification_status text not null default 'pending_review',
  add column if not exists verified_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists evidence_storage_path text,
  add column if not exists evidence_label text;

alter table public.training_enrollments
  add column if not exists enterprise_operator_id uuid references public.enterprise_operators (id) on delete cascade,
  add column if not exists enterprise_organization_id uuid references public.organizations (id) on delete cascade,
  add column if not exists progress_percent integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.practical_evaluations
  add column if not exists enterprise_operator_id uuid references public.enterprise_operators (id) on delete cascade,
  add column if not exists enterprise_organization_id uuid references public.organizations (id) on delete cascade,
  add column if not exists evaluator_enterprise_operator_id uuid references public.enterprise_operators (id) on delete set null,
  add column if not exists template_id text,
  add column if not exists aircraft_model text,
  add column if not exists payload_type text,
  add column if not exists evaluated_at timestamptz,
  add column if not exists rubric_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists evidence jsonb not null default '[]'::jsonb;

alter table public.training_evidence
  add column if not exists enterprise_operator_id uuid references public.enterprise_operators (id) on delete cascade,
  add column if not exists enterprise_organization_id uuid references public.organizations (id) on delete cascade,
  add column if not exists application_job_id uuid references public.application_jobs (id) on delete set null,
  add column if not exists evidence_label text,
  add column if not exists evidence_status text not null default 'uploaded';

alter table public.readiness_checks
  add column if not exists application_job_id uuid references public.application_jobs (id) on delete cascade,
  add column if not exists enterprise_operator_id uuid references public.enterprise_operators (id) on delete set null,
  add column if not exists aircraft_id uuid references public.aircraft (id) on delete set null,
  add column if not exists ready boolean not null default false,
  add column if not exists gate_snapshot jsonb not null default '{}'::jsonb;

create index if not exists operator_credentials_enterprise_operator_idx
  on public.operator_credentials (enterprise_operator_id, credential_type);

create index if not exists operator_credentials_enterprise_org_status_idx
  on public.operator_credentials (enterprise_organization_id, credential_type, verification_status)
  where enterprise_organization_id is not null;

create index if not exists training_enrollments_enterprise_operator_idx
  on public.training_enrollments (enterprise_operator_id, course_id)
  where enterprise_operator_id is not null;

create index if not exists practical_evaluations_enterprise_operator_idx
  on public.practical_evaluations (enterprise_operator_id, template_id)
  where enterprise_operator_id is not null;

create index if not exists training_evidence_enterprise_operator_idx
  on public.training_evidence (enterprise_operator_id, created_at desc)
  where enterprise_operator_id is not null;

create index if not exists readiness_checks_enterprise_job_idx
  on public.readiness_checks (application_job_id, created_at desc)
  where application_job_id is not null;

create or replace function public.enterprise_operator_org_id(target_enterprise_operator_id uuid)
returns uuid
language sql
security definer
stable
set search_path = ''
as $$
  select operator.organization_id
  from public.enterprise_operators operator
  where operator.id = target_enterprise_operator_id
  limit 1;
$$;

create or replace function public.enterprise_storage_object_org_id(object_name text)
returns uuid
language plpgsql
immutable
set search_path = ''
as $$
declare
  org_text text;
begin
  org_text := split_part(object_name, '/', 1);

  if org_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    return org_text::uuid;
  end if;

  return null;
end;
$$;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'enterprise-credential-evidence',
  'enterprise-credential-evidence',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists enterprise_credential_evidence_select on storage.objects;
create policy enterprise_credential_evidence_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'enterprise-credential-evidence'
    and (select public.is_enterprise_org_member(public.enterprise_storage_object_org_id(name)))
  );

drop policy if exists enterprise_credential_evidence_insert on storage.objects;
create policy enterprise_credential_evidence_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'enterprise-credential-evidence'
    and (select public.can_manage_enterprise_org(public.enterprise_storage_object_org_id(name)))
  );

drop policy if exists enterprise_credential_evidence_update on storage.objects;
create policy enterprise_credential_evidence_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'enterprise-credential-evidence'
    and (select public.can_manage_enterprise_org(public.enterprise_storage_object_org_id(name)))
  )
  with check (
    bucket_id = 'enterprise-credential-evidence'
    and (select public.can_manage_enterprise_org(public.enterprise_storage_object_org_id(name)))
  );

drop policy if exists enterprise_credential_evidence_delete on storage.objects;
create policy enterprise_credential_evidence_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'enterprise-credential-evidence'
    and (select public.can_manage_enterprise_org(public.enterprise_storage_object_org_id(name)))
  );

drop policy if exists "Authenticated can read operator_credentials" on public.operator_credentials;
drop policy if exists "Authenticated can manage operator_credentials" on public.operator_credentials;
drop policy if exists operator_credentials_select_by_enterprise_member on public.operator_credentials;
create policy operator_credentials_select_by_enterprise_member
  on public.operator_credentials
  for select
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.is_enterprise_org_member(enterprise_organization_id))
  );

drop policy if exists operator_credentials_manage_by_enterprise_member on public.operator_credentials;
create policy operator_credentials_manage_by_enterprise_member
  on public.operator_credentials
  for all
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  )
  with check (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  );

drop policy if exists "Authenticated can read training_enrollments" on public.training_enrollments;
drop policy if exists "Authenticated can manage training_enrollments" on public.training_enrollments;
drop policy if exists training_enrollments_select_by_enterprise_member on public.training_enrollments;
create policy training_enrollments_select_by_enterprise_member
  on public.training_enrollments
  for select
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.is_enterprise_org_member(enterprise_organization_id))
  );

drop policy if exists training_enrollments_manage_by_enterprise_member on public.training_enrollments;
create policy training_enrollments_manage_by_enterprise_member
  on public.training_enrollments
  for all
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  )
  with check (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  );

drop policy if exists "Authenticated can read practical_evaluations" on public.practical_evaluations;
drop policy if exists "Authenticated can manage practical_evaluations" on public.practical_evaluations;
drop policy if exists practical_evaluations_select_by_enterprise_member on public.practical_evaluations;
create policy practical_evaluations_select_by_enterprise_member
  on public.practical_evaluations
  for select
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.is_enterprise_org_member(enterprise_organization_id))
  );

drop policy if exists practical_evaluations_manage_by_enterprise_member on public.practical_evaluations;
create policy practical_evaluations_manage_by_enterprise_member
  on public.practical_evaluations
  for all
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  )
  with check (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  );

drop policy if exists "Authenticated can read training_evidence" on public.training_evidence;
drop policy if exists "Authenticated can manage training_evidence" on public.training_evidence;
drop policy if exists training_evidence_select_by_enterprise_member on public.training_evidence;
create policy training_evidence_select_by_enterprise_member
  on public.training_evidence
  for select
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.is_enterprise_org_member(enterprise_organization_id))
  );

drop policy if exists training_evidence_manage_by_enterprise_member on public.training_evidence;
create policy training_evidence_manage_by_enterprise_member
  on public.training_evidence
  for all
  to authenticated
  using (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  )
  with check (
    enterprise_organization_id is not null
    and (select public.can_manage_enterprise_org(enterprise_organization_id))
  );

drop policy if exists "Authenticated can read readiness_checks" on public.readiness_checks;
drop policy if exists "Authenticated can manage readiness_checks" on public.readiness_checks;
drop policy if exists readiness_checks_select_by_enterprise_member on public.readiness_checks;
create policy readiness_checks_select_by_enterprise_member
  on public.readiness_checks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and (select public.is_enterprise_org_member(job.organization_id))
    )
  );

drop policy if exists readiness_checks_manage_by_enterprise_member on public.readiness_checks;
create policy readiness_checks_manage_by_enterprise_member
  on public.readiness_checks
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and (select public.can_manage_enterprise_org(job.organization_id))
    )
  )
  with check (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and (select public.can_manage_enterprise_org(job.organization_id))
    )
  );

notify pgrst, 'reload schema';
