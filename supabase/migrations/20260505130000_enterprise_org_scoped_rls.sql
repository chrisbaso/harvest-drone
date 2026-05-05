create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('org_admin', 'operations_manager', 'crop_manager', 'operator', 'compliance_reviewer', 'harvest_support')),
  is_active boolean not null default true,
  unique (organization_id, user_id)
);

create index if not exists organization_members_user_idx
  on public.organization_members (user_id, organization_id)
  where is_active = true;

create or replace function public.is_harvest_admin()
returns boolean as $$
  select exists (
    select 1
    from public.user_profiles
    where id = auth.uid()
      and is_active = true
      and role in ('admin', 'network_manager')
  );
$$ language sql security definer stable;

create or replace function public.is_enterprise_org_member(target_organization_id uuid)
returns boolean as $$
  select public.is_harvest_admin()
    or exists (
      select 1
      from public.organization_members
      where organization_id = target_organization_id
        and user_id = auth.uid()
        and is_active = true
    );
$$ language sql security definer stable;

create or replace function public.can_manage_enterprise_org(target_organization_id uuid)
returns boolean as $$
  select public.is_harvest_admin()
    or exists (
      select 1
      from public.organization_members
      where organization_id = target_organization_id
        and user_id = auth.uid()
        and is_active = true
        and role in ('org_admin', 'operations_manager', 'compliance_reviewer', 'harvest_support')
    );
$$ language sql security definer stable;

alter table public.organization_members enable row level security;

drop policy if exists organization_members_select on public.organization_members;
create policy organization_members_select
  on public.organization_members
  for select
  to authenticated
  using (
    public.is_harvest_admin()
    or user_id = auth.uid()
    or public.can_manage_enterprise_org(organization_id)
  );

drop policy if exists organization_members_manage on public.organization_members;
create policy organization_members_manage
  on public.organization_members
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read organizations" on public.organizations;
drop policy if exists "Authenticated can manage organizations" on public.organizations;
drop policy if exists organizations_select_by_member on public.organizations;
create policy organizations_select_by_member
  on public.organizations
  for select
  to authenticated
  using (public.is_enterprise_org_member(id));

drop policy if exists organizations_manage_by_member on public.organizations;
create policy organizations_manage_by_member
  on public.organizations
  for all
  to authenticated
  using (public.can_manage_enterprise_org(id))
  with check (public.can_manage_enterprise_org(id));

drop policy if exists "Authenticated can read enterprise_divisions" on public.enterprise_divisions;
drop policy if exists "Authenticated can manage enterprise_divisions" on public.enterprise_divisions;
drop policy if exists enterprise_divisions_select_by_member on public.enterprise_divisions;
create policy enterprise_divisions_select_by_member
  on public.enterprise_divisions
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists enterprise_divisions_manage_by_member on public.enterprise_divisions;
create policy enterprise_divisions_manage_by_member
  on public.enterprise_divisions
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read enterprise_operators" on public.enterprise_operators;
drop policy if exists "Authenticated can manage enterprise_operators" on public.enterprise_operators;
drop policy if exists enterprise_operators_select_by_member on public.enterprise_operators;
create policy enterprise_operators_select_by_member
  on public.enterprise_operators
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists enterprise_operators_manage_by_member on public.enterprise_operators;
create policy enterprise_operators_manage_by_member
  on public.enterprise_operators
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read operator_credentials" on public.operator_credentials;
drop policy if exists "Authenticated can manage operator_credentials" on public.operator_credentials;
drop policy if exists operator_credentials_select_by_member on public.operator_credentials;
create policy operator_credentials_select_by_member
  on public.operator_credentials
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.enterprise_operators operator
      where operator.id = operator_credentials.operator_id
        and public.is_enterprise_org_member(operator.organization_id)
    )
  );

drop policy if exists operator_credentials_manage_by_member on public.operator_credentials;
create policy operator_credentials_manage_by_member
  on public.operator_credentials
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.enterprise_operators operator
      where operator.id = operator_credentials.operator_id
        and public.can_manage_enterprise_org(operator.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.enterprise_operators operator
      where operator.id = operator_credentials.operator_id
        and public.can_manage_enterprise_org(operator.organization_id)
    )
  );

drop policy if exists "Authenticated can read aircraft" on public.aircraft;
drop policy if exists "Authenticated can manage aircraft" on public.aircraft;
drop policy if exists aircraft_select_by_member on public.aircraft;
create policy aircraft_select_by_member
  on public.aircraft
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists aircraft_manage_by_member on public.aircraft;
create policy aircraft_manage_by_member
  on public.aircraft
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read application_jobs" on public.application_jobs;
drop policy if exists "Authenticated can manage application_jobs" on public.application_jobs;
drop policy if exists application_jobs_select_by_member on public.application_jobs;
create policy application_jobs_select_by_member
  on public.application_jobs
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists application_jobs_manage_by_member on public.application_jobs;
create policy application_jobs_manage_by_member
  on public.application_jobs
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read application_records" on public.application_records;
drop policy if exists "Authenticated can manage application_records" on public.application_records;
drop policy if exists application_records_select_by_member on public.application_records;
create policy application_records_select_by_member
  on public.application_records
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists application_records_manage_by_member on public.application_records;
create policy application_records_manage_by_member
  on public.application_records
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read support_tickets" on public.support_tickets;
drop policy if exists "Authenticated can manage support_tickets" on public.support_tickets;
drop policy if exists support_tickets_select_by_member on public.support_tickets;
create policy support_tickets_select_by_member
  on public.support_tickets
  for select
  to authenticated
  using (public.is_enterprise_org_member(organization_id));

drop policy if exists support_tickets_manage_by_member on public.support_tickets;
create policy support_tickets_manage_by_member
  on public.support_tickets
  for all
  to authenticated
  using (public.can_manage_enterprise_org(organization_id))
  with check (public.can_manage_enterprise_org(organization_id));

drop policy if exists "Authenticated can read readiness_checks" on public.readiness_checks;
drop policy if exists "Authenticated can manage readiness_checks" on public.readiness_checks;
drop policy if exists readiness_checks_select_by_member on public.readiness_checks;
create policy readiness_checks_select_by_member
  on public.readiness_checks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and public.is_enterprise_org_member(job.organization_id)
    )
  );

drop policy if exists readiness_checks_manage_by_member on public.readiness_checks;
create policy readiness_checks_manage_by_member
  on public.readiness_checks
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and public.can_manage_enterprise_org(job.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.application_jobs job
      where job.id = readiness_checks.application_job_id
        and public.can_manage_enterprise_org(job.organization_id)
    )
  );

notify pgrst, 'reload schema';
