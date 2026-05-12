create extension if not exists pg_net with schema extensions;

create or replace function public.enroll_lead_via_edge()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  service_role_key text;
begin
  select decrypted_secret
    into service_role_key
  from vault.decrypted_secrets
  where name = 'supabase_service_role_key'
  limit 1;

  if nullif(service_role_key, '') is null then
    service_role_key := current_setting('supabase.service_role_key', true);
  end if;

  if nullif(service_role_key, '') is null then
    raise warning 'Missing service role key for enroll_lead_via_edge';
    return NEW;
  end if;

  perform net.http_post(
    url := 'https://tmnrjldripqzqiewuqym.supabase.co/functions/v1/enroll-lead',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'apikey', service_role_key,
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
    raise warning 'enroll_lead_via_edge failed: %', SQLERRM;
    return NEW;
end;
$$;

create or replace function public.enroll_source_via_edge()
returns trigger
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  service_role_key text;
begin
  select decrypted_secret
    into service_role_key
  from vault.decrypted_secrets
  where name = 'supabase_service_role_key'
  limit 1;

  if nullif(service_role_key, '') is null then
    service_role_key := current_setting('supabase.service_role_key', true);
  end if;

  if nullif(service_role_key, '') is null then
    raise warning 'Missing service role key for enroll_source_via_edge';
    return NEW;
  end if;

  perform net.http_post(
    url := 'https://tmnrjldripqzqiewuqym.supabase.co/functions/v1/enroll-lead',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || service_role_key,
      'apikey', service_role_key,
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
    raise warning 'enroll_source_via_edge failed: %', SQLERRM;
    return NEW;
end;
$$;
