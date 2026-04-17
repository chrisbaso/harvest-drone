alter table if exists public.chat_leads
  add column if not exists notification_sent boolean not null default false,
  add column if not exists notification_sent_at timestamptz,
  add column if not exists notification_error text;
