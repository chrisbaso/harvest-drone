alter table public.harvest_drone_leads
  add column if not exists sms_consent boolean not null default false,
  add column if not exists sms_consent_at timestamptz,
  add column if not exists sms_consent_language text;

notify pgrst, 'reload schema';
