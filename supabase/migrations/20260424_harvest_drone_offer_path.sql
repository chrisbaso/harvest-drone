alter table public.harvest_drone_leads
  add column if not exists offer_path text;

notify pgrst, 'reload schema';
