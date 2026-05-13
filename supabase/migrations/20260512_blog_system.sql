create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  meta_title text,
  meta_description text check (meta_description is null or char_length(meta_description) <= 155),
  body text not null,
  excerpt text,
  category text not null default 'insights' check (category in ('pain-points', 'product-education', 'proof-results', 'industry-regulatory', 'insights')),
  tags text[] default '{}'::text[],
  status text default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  published_at timestamptz,
  author_name text default 'Jake Lund',
  author_role text default 'Founder, Harvest Drone',
  ai_generated boolean default false,
  ai_prompt text,
  ai_model text,
  ai_generated_at timestamptz,
  human_reviewed boolean default false,
  human_reviewed_by text,
  human_reviewed_at timestamptz,
  canonical_url text,
  featured_image_url text,
  featured_image_alt text,
  reading_time_minutes integer,
  word_count integer,
  cta_type text default 'acre-plan' check (cta_type in ('acre-plan', 'roi-calculator', 'enterprise-contact', 'none')),
  cta_text text default 'Get your free acre plan ->',
  cta_url text default '/growers#grower-acre-plan-form',
  view_count integer default 0,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.blog_content_calendar (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  category text not null check (category in ('pain-points', 'product-education', 'proof-results', 'industry-regulatory', 'insights')),
  target_keywords text[] default '{}'::text[],
  brief text,
  target_publish_date date,
  status text default 'planned' check (status in ('planned', 'generating', 'draft', 'published', 'skipped')),
  post_id uuid references public.blog_posts(id) on delete set null,
  priority integer default 5,
  created_at timestamptz default timezone('utc', now())
);

create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_published on public.blog_posts(published_at desc);
create index if not exists idx_blog_posts_category on public.blog_posts(category);
create index if not exists idx_blog_calendar_status on public.blog_content_calendar(status);

create or replace function public.set_blog_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_blog_updated_at();

create or replace function public.increment_blog_view(post_slug text)
returns void as $$
begin
  update public.blog_posts
  set view_count = view_count + 1,
      updated_at = timezone('utc', now())
  where slug = post_slug
    and status = 'published';
end;
$$ language plpgsql;

alter table public.blog_posts enable row level security;
alter table public.blog_content_calendar enable row level security;

drop policy if exists blog_posts_public_published_select on public.blog_posts;
create policy blog_posts_public_published_select
on public.blog_posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists blog_posts_admin_select on public.blog_posts;
create policy blog_posts_admin_select
on public.blog_posts
for select
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_posts_admin_insert on public.blog_posts;
create policy blog_posts_admin_insert
on public.blog_posts
for insert
to authenticated
with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_posts_admin_update on public.blog_posts;
create policy blog_posts_admin_update
on public.blog_posts
for update
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_posts_admin_delete on public.blog_posts;
create policy blog_posts_admin_delete
on public.blog_posts
for delete
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_posts_public_view_counter_update on public.blog_posts;
create policy blog_posts_public_view_counter_update
on public.blog_posts
for update
to anon
using (status = 'published')
with check (status = 'published');

drop policy if exists blog_calendar_admin_select on public.blog_content_calendar;
create policy blog_calendar_admin_select
on public.blog_content_calendar
for select
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_calendar_admin_insert on public.blog_content_calendar;
create policy blog_calendar_admin_insert
on public.blog_content_calendar
for insert
to authenticated
with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_calendar_admin_update on public.blog_content_calendar;
create policy blog_calendar_admin_update
on public.blog_content_calendar
for update
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists blog_calendar_admin_delete on public.blog_content_calendar;
create policy blog_calendar_admin_delete
on public.blog_content_calendar
for delete
to authenticated
using (
  exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
);

grant select on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant update (view_count, updated_at) on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_content_calendar to authenticated;
grant execute on function public.increment_blog_view(text) to anon, authenticated;

insert into public.blog_content_calendar (title, category, target_keywords, brief, priority) values
('Why Your Nitrogen Bill Keeps Going Up - And What One Ounce Can Do About It',
 'pain-points', array['nitrogen fertilizer cost', 'reduce nitrogen spend', 'anhydrous ammonia alternative'],
 'Lead with the pain of rising nitrogen costs. Introduce SOURCE as a $15/acre synthetic activator where one ounce replaces 25 lbs of N. End with the acre plan CTA.', 1),

('The Hidden Cost of Ground Rig Compaction on Your Yield',
 'pain-points', array['soil compaction yield loss', 'ground rig damage crops', 'drone spraying vs ground rig'],
 'Explain how late-season ground rig passes compact soil and damage crops. Quantify yield loss per compaction event. Position drone application as the alternative.', 2),

('6 Ways Minnesota Corn Growers Are Cutting Input Costs in 2026',
 'pain-points', array['reduce farm input costs', 'Minnesota corn farming', 'cut fertilizer costs'],
 'Listicle format. Include SOURCE as item #1 with specific savings data. Cover precision application, soil testing, variable rate, cover crops, and timing optimization.', 2),

('Missed Your Spray Window? Here Is What It Actually Cost You',
 'pain-points', array['missed spray window cost', 'fungicide timing potatoes', 'late blight potato loss'],
 'Quantify the cost of missed spray windows on potatoes and corn. Position drone capability as the solution - spray when ground rigs cannot access the field.', 3),

('What Happens When You Cut 25 lbs of Synthetic N Per Acre',
 'pain-points', array['reduce synthetic nitrogen', 'nitrogen reduction farming', 'SOURCE soil activator'],
 'Walk through the biology: what SOURCE actually does in the soil, how microbes deliver N, why one ounce replaces 25 lbs. Data-driven, not marketing language.', 2),

('SOURCE vs Anhydrous Ammonia: The Per-Acre Math',
 'product-education', array['SOURCE vs anhydrous', 'SOURCE Sound Agriculture', 'nitrogen replacement product'],
 'Side-by-side cost comparison. SOURCE at $15/acre vs anhydrous at current market prices. Show the math on 500, 1000, and 2000 acre operations. Include yield lift data.', 1),

('What Does Drone Spraying Actually Cost Per Acre?',
 'product-education', array['drone spraying cost per acre', 'ag drone application pricing', 'drone vs airplane spraying'],
 'Transparent breakdown: $8-14/acre depending on field size, product, and logistics. Compare to ground rig and aerial applicator costs. Include when drone makes sense and when it does not.', 1),

('EarthOptics Soil Scanning: What It Shows and Why It Matters',
 'product-education', array['EarthOptics soil scanning', 'subsurface soil mapping', 'precision agriculture soil data'],
 'Explain what EarthOptics reveals that satellite imagery cannot - compaction, drainage, nutrient variability below the surface. How prescription maps drive targeted application.', 3),

('SOURCE Is Not a Biological - Here Is Why That Matters',
 'product-education', array['SOURCE synthetic vs biological', 'Sound Agriculture SOURCE', 'soil activator synthetic'],
 'Address the most common misconception. SOURCE is synthetic with an ultra-low use rate. Explain why this means consistent performance regardless of soil biology conditions. Farmers who know the difference will trust you more for getting it right.', 2),

('The Complete Guide to Applying SOURCE on Corn',
 'product-education', array['SOURCE application corn', 'SOURCE foliar spray', 'how to apply SOURCE'],
 'Practical application guide. Timing, rate, tank mix compatibility, carrier volume, check strip methodology. Written for the farmer who just bought SOURCE and wants to apply it correctly.', 3),

('First-Season SOURCE Results: What 1 Million Acres of Data Shows',
 'proof-results', array['SOURCE results data', 'SOURCE yield improvement', 'Sound Agriculture field trials'],
 'Pull from Sound Agriculture published data: 84% win rate on corn, 6-12 bushel yield improvements, 150% net retention. Position these as industry data, not Harvest Drone claims.', 1),

('How a 1,400-Acre Minnesota Corn Operation Cut $30/Acre Off Urea',
 'proof-results', array['SOURCE case study Minnesota', 'reduce urea cost corn', 'SOURCE farmer results'],
 'Case study format. Walk through the operation, the decision to try SOURCE, the trial methodology (check strips), and the harvest results. Include the expansion decision for next season.', 2),

('Drone Application vs Ground Rig: A Side-by-Side Field Comparison',
 'proof-results', array['drone vs ground rig comparison', 'drone spraying advantages', 'precision application drone'],
 'Compare compaction, coverage uniformity, speed, wet field access, crop damage, and cost. Use real field data where available. Honest about where ground rigs still win.', 2),

('Why Growers Who Try SOURCE Put It on All Their Acres',
 'proof-results', array['SOURCE repeat purchase', 'SOURCE grower retention', 'SOURCE expand acres'],
 'Explain the 150% net retention rate. The pattern: trial on partial acres, compare at harvest, expand. Include 3-4 grower perspectives. End with the free acre plan CTA.', 2),

('2027 Drone Regulations: What Every Ag Operation Needs to Know',
 'industry-regulatory', array['2027 ag drone regulations', 'American made drone requirement', 'DJI ban agriculture'],
 'Explain the upcoming American-made mandate. What it means for operations currently using DJI. Why Hylio is positioned as the compliant alternative. Timeline for compliance.', 1),

('Part 107 for Ag Drone Pilots: The Complete Minnesota Guide',
 'industry-regulatory', array['Part 107 agriculture Minnesota', 'drone pilot license farming', 'FAA Part 107 ag drone'],
 'Step-by-step guide to getting Part 107 certified. Cost, study materials, test locations in Minnesota, renewal requirements. Position Harvest Drone training program as prep resource.', 2),

('Restricted-Use Pesticide Application by Drone: State Requirements',
 'industry-regulatory', array['drone pesticide application license', 'restricted use pesticide drone', 'pesticide applicator license drone'],
 'State-by-state overview focusing on Minnesota, North Dakota, South Dakota, Wisconsin. What licenses are needed beyond Part 107. Link to the compliance credential tracking in the platform.', 3),

('How Sound Agriculture Went From Startup to 1 Million Acres',
 'industry-regulatory', array['Sound Agriculture company', 'Sound Agriculture growth', 'SOURCE product history'],
 'Company profile of Sound Agriculture. Founding, product development, field trial results, growth trajectory. Positions Harvest Drone as a distribution partner of a proven company.', 4),

('Building a Drone Division Inside Your Farm Operation',
 'industry-regulatory', array['build drone division farm', 'own vs hire drone spraying', 'enterprise drone agriculture'],
 'The case for owning drone capability vs hiring applicators. ROI model, staffing requirements, training needs, regulatory compliance. Link to the ROI calculator. This is the RDO-relevant content that also ranks for enterprise search queries.', 1),

('The Ag IMO Model: How Distribution Networks Work in Precision Agriculture',
 'industry-regulatory', array['ag distribution network', 'precision agriculture distribution', 'IMO model agriculture'],
 'Explain the distribution model. Hub (Harvest Drone) manages systems, training, compliance, and demand. Dealers/operators service local territories. Draw parallels to insurance IMO and pharmaceutical distribution.', 4)
on conflict (title) do nothing;

notify pgrst, 'reload schema';
