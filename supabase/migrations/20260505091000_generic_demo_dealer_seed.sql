insert into public.dealer_networks (name, slug, contact_name, contact_email)
values ('Harvest Demo Network', 'harvest-demo-network', 'Demo Contact', 'demo@harvestdrone.local')
on conflict (slug) do update set
  name = excluded.name,
  contact_name = excluded.contact_name,
  contact_email = excluded.contact_email;

insert into public.dealers (network_id, name, slug, state, counties_served, territory_description, training_status, is_active)
values
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'Harvest Demo Territory', 'demo-territory', 'Upper Midwest', array['Demo County A', 'Demo County B', 'Demo County C'], 'Generic demo territory for attribution and operator readiness walkthroughs.', 'active', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'North Demo Territory', 'north-demo-territory', 'Northern Plains', array['Demo County D', 'Demo County E', 'Demo County F'], 'Generic demo territory for attribution and operator readiness walkthroughs.', 'qualified', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'South Demo Territory', 'south-demo-territory', 'Southern Plains', array['Demo County G', 'Demo County H', 'Demo County I'], 'Generic demo territory for attribution and operator readiness walkthroughs.', 'in_progress', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'East Demo Territory', 'east-demo-territory', 'Eastern Corn Belt', array['Demo County J', 'Demo County K', 'Demo County L'], 'Generic demo territory for attribution and operator readiness walkthroughs.', 'active', true),
((select id from public.dealer_networks where slug = 'harvest-demo-network'), 'West Demo Territory', 'west-demo-territory', 'Western Plains', array['Demo County M', 'Demo County N', 'Demo County O'], 'Generic demo territory for attribution and operator readiness walkthroughs.', 'pending', true)
on conflict (slug) do update set
  network_id = excluded.network_id,
  name = excluded.name,
  state = excluded.state,
  counties_served = excluded.counties_served,
  territory_description = excluded.territory_description,
  training_status = excluded.training_status,
  is_active = excluded.is_active;

update public.grower_leads
set dealer_slug = case dealer_slug
  when 'rdo-marshall-mn' then 'demo-territory'
  when 'rdo-fargo-nd' then 'north-demo-territory'
  when 'rdo-aberdeen-sd' then 'south-demo-territory'
  when 'rdo-moorhead-mn' then 'east-demo-territory'
  when 'rdo-wahpeton-nd' then 'west-demo-territory'
  else dealer_slug
end
where dealer_slug in ('rdo-marshall-mn', 'rdo-fargo-nd', 'rdo-aberdeen-sd', 'rdo-moorhead-mn', 'rdo-wahpeton-nd');

update public.operator_leads
set dealer_slug = case dealer_slug
  when 'rdo-marshall-mn' then 'demo-territory'
  when 'rdo-fargo-nd' then 'north-demo-territory'
  when 'rdo-aberdeen-sd' then 'south-demo-territory'
  when 'rdo-moorhead-mn' then 'east-demo-territory'
  when 'rdo-wahpeton-nd' then 'west-demo-territory'
  else dealer_slug
end
where dealer_slug in ('rdo-marshall-mn', 'rdo-fargo-nd', 'rdo-aberdeen-sd', 'rdo-moorhead-mn', 'rdo-wahpeton-nd');

update public.source_orders
set dealer_slug = case dealer_slug
  when 'rdo-marshall-mn' then 'demo-territory'
  when 'rdo-fargo-nd' then 'north-demo-territory'
  when 'rdo-aberdeen-sd' then 'south-demo-territory'
  when 'rdo-moorhead-mn' then 'east-demo-territory'
  when 'rdo-wahpeton-nd' then 'west-demo-territory'
  else dealer_slug
end
where dealer_slug in ('rdo-marshall-mn', 'rdo-fargo-nd', 'rdo-aberdeen-sd', 'rdo-moorhead-mn', 'rdo-wahpeton-nd');

update public.harvest_drone_leads
set dealer_slug = case dealer_slug
  when 'rdo-marshall-mn' then 'demo-territory'
  when 'rdo-fargo-nd' then 'north-demo-territory'
  when 'rdo-aberdeen-sd' then 'south-demo-territory'
  when 'rdo-moorhead-mn' then 'east-demo-territory'
  when 'rdo-wahpeton-nd' then 'west-demo-territory'
  when 'northern-plains-ag' then 'north-demo-territory'
  when 'heartland-coop' then 'east-demo-territory'
  when 'dakota-ag-services' then 'west-demo-territory'
  else dealer_slug
end
where dealer_slug in (
  'rdo-marshall-mn',
  'rdo-fargo-nd',
  'rdo-aberdeen-sd',
  'rdo-moorhead-mn',
  'rdo-wahpeton-nd',
  'northern-plains-ag',
  'heartland-coop',
  'dakota-ag-services'
);

do $$
declare
  old_network_id uuid;
  new_network_id uuid;
  old_dealer_id uuid;
  new_dealer_id uuid;
  slug_pair text[];
  slug_pairs text[][] := array[
    array['rdo-marshall-mn', 'demo-territory'],
    array['rdo-fargo-nd', 'north-demo-territory'],
    array['rdo-aberdeen-sd', 'south-demo-territory'],
    array['rdo-moorhead-mn', 'east-demo-territory'],
    array['rdo-wahpeton-nd', 'west-demo-territory']
  ];
begin
  select id into old_network_id from public.dealer_networks where slug = 'rdo';
  select id into new_network_id from public.dealer_networks where slug = 'harvest-demo-network';

  foreach slug_pair slice 1 in array slug_pairs loop
    select id into old_dealer_id from public.dealers where slug = slug_pair[1];
    select id into new_dealer_id from public.dealers where slug = slug_pair[2];

    if old_dealer_id is not null and new_dealer_id is not null and old_dealer_id <> new_dealer_id then
      update public.user_profiles set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.grower_leads set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.operator_leads set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.source_orders set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.crm_leads set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.jobs set dealer_id = new_dealer_id where dealer_id = old_dealer_id;
      update public.harvest_drone_leads set dealer_id = new_dealer_id where dealer_id = old_dealer_id;

      if to_regclass('public.training_enrollments') is not null then
        execute 'update public.training_enrollments set dealer_id = $1 where dealer_id = $2' using new_dealer_id, old_dealer_id;
      end if;

      if to_regclass('public.lesson_progress') is not null then
        execute 'update public.lesson_progress set dealer_id = $1 where dealer_id = $2' using new_dealer_id, old_dealer_id;
      end if;

      if to_regclass('public.assessment_attempts') is not null then
        execute 'update public.assessment_attempts set dealer_id = $1 where dealer_id = $2' using new_dealer_id, old_dealer_id;
      end if;

      if to_regclass('public.operator_credentials') is not null then
        execute 'update public.operator_credentials set dealer_id = $1 where dealer_id = $2' using new_dealer_id, old_dealer_id;
      end if;

      delete from public.dealers where id = old_dealer_id;
    end if;
  end loop;

  if old_network_id is not null and new_network_id is not null and old_network_id <> new_network_id then
    update public.user_profiles set network_id = new_network_id where network_id = old_network_id;
    update public.dealers set network_id = new_network_id where network_id = old_network_id;
    delete from public.dealer_networks where id = old_network_id;
  end if;
end $$;

notify pgrst, 'reload schema';
