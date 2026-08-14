-- ============================================
-- SUPREMEALPHA OS — SUPABASE SCHEMA
-- ============================================

-- Enable RLS
alter table if exists profiles enable row level security;

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  is_admin boolean default false,
  avatar_url text,
  created_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  status text default 'soon' check (status in ('live', 'soon')),
  url text,
  logo_url text,
  tags text[] default '{}',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Sponsor Tiers
create table if not exists sponsor_tiers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null,
  amount text not null,
  status text default 'active' check (status in ('active', 'inactive')),
  benefits text[] default '{}',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Messages (contact + sponsor inquiries)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  type text default 'contact' check (type in ('contact', 'sponsor_inquiry')),
  status text default 'new' check (status in ('new', 'read', 'replied')),
  sponsor_tier_id uuid references sponsor_tiers,
  created_at timestamptz default now()
);

-- Page Views (analytics)
create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  page text default '/',
  session_id text,
  user_agent text,
  referrer text,
  created_at timestamptz default now()
);

-- Milestones (Timeline)
create table if not exists milestones (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  title text not null,
  description text,
  category text default 'career',
  icon text,
  highlight boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Graveyard
create table if not exists graveyard (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  year int not null,
  description text,
  why_it_died text,
  lessons text,
  screenshot_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Skills
create table if not exists skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  level int default 5 check (level between 1 and 10),
  category text,
  years_exp int,
  icon text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Posts (Writings / Blog)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  cover_image text,
  published boolean default false,
  featured boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes (Digital Garden)
create table if not exists notes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  backlinks text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- TIL (Today I Learned)
create table if not exists til (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  date date default now(),
  category text default 'tech',
  source_url text,
  created_at timestamptz default now()
);

-- Principles
create table if not exists principles (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  category text default 'life',
  source text,
  date_adopted date,
  story text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Reading List
create table if not exists reading_list (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  status text default 'wishlist' check (status in ('reading', 'finished', 'wishlist')),
  rating int check (rating between 1 and 5),
  notes text,
  cover_url text,
  finished_at date,
  created_at timestamptz default now()
);

-- Bookmarks (Link Garden)
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  title text not null,
  category text default 'general',
  note text,
  date_added date default now(),
  featured boolean default false,
  created_at timestamptz default now()
);

-- Media Gallery
create table if not exists media (
  id uuid default gen_random_uuid() primary key,
  url text not null,
  caption text,
  category text default 'life',
  date date,
  location text,
  featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Travel Map
create table if not exists travel_map (
  id uuid default gen_random_uuid() primary key,
  city text not null,
  country text not null,
  lat decimal,
  lng decimal,
  date date,
  purpose text,
  note text,
  image_url text,
  created_at timestamptz default now()
);

-- Goals (OKRs)
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  quarter text not null,
  year int not null,
  title text not null,
  target int default 100,
  current int default 0,
  status text default 'on_track' check (status in ('on_track', 'at_risk', 'completed')),
  category text default 'business',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Predictions
create table if not exists predictions (
  id uuid default gen_random_uuid() primary key,
  prediction text not null,
  confidence int default 50,
  date_made date default now(),
  resolution_date date,
  result text default 'pending' check (result in ('pending', 'right', 'wrong')),
  category text default 'tech',
  created_at timestamptz default now()
);

-- AMA Questions
create table if not exists ama_questions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  category text default 'tech',
  question text not null,
  answered boolean default false,
  answer text,
  created_at timestamptz default now()
);

-- Guestbook
create table if not exists guestbook (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  website text,
  message text not null,
  created_at timestamptz default now()
);

-- Subscribers (Newsletter)
create table if not exists subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  source text default 'website',
  subscribed_at timestamptz default now(),
  active boolean default true
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles: users can read own, admins can read all
create policy "Public profiles are viewable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Projects: public read, admin write
create policy "Public read projects" on projects for select using (true);
create policy "Admin write projects" on projects for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Sponsor Tiers: public read, admin write
create policy "Public read sponsors" on sponsor_tiers for select using (true);
create policy "Admin write sponsors" on sponsor_tiers for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Messages: users read own, admin read all, authenticated insert
create policy "Users read own messages" on messages for select using (user_id = auth.uid());
create policy "Admin read all messages" on messages for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Authenticated insert messages" on messages for insert with check (auth.role() = 'authenticated');
create policy "Admin update messages" on messages for update using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admin delete messages" on messages for delete using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Page Views: public insert (for tracking), admin read
create policy "Public insert page_views" on page_views for insert with check (true);
create policy "Admin read page_views" on page_views for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Milestones: public read, admin write
create policy "Public read milestones" on milestones for select using (true);
create policy "Admin write milestones" on milestones for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Graveyard: public read, admin write
create policy "Public read graveyard" on graveyard for select using (true);
create policy "Admin write graveyard" on graveyard for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Skills: public read, admin write
create policy "Public read skills" on skills for select using (true);
create policy "Admin write skills" on skills for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Posts: public read published, admin write all
create policy "Public read published posts" on posts for select using (published = true);
create policy "Admin read all posts" on posts for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admin write posts" on posts for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Notes: public read, admin write
create policy "Public read notes" on notes for select using (true);
create policy "Admin write notes" on notes for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- TIL: public read, admin write
create policy "Public read til" on til for select using (true);
create policy "Admin write til" on til for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Principles: public read, admin write
create policy "Public read principles" on principles for select using (true);
create policy "Admin write principles" on principles for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Reading List: public read, admin write
create policy "Public read reading" on reading_list for select using (true);
create policy "Admin write reading" on reading_list for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Bookmarks: public read, admin write
create policy "Public read bookmarks" on bookmarks for select using (true);
create policy "Admin write bookmarks" on bookmarks for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Media: public read, admin write
create policy "Public read media" on media for select using (true);
create policy "Admin write media" on media for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Travel Map: public read, admin write
create policy "Public read travel" on travel_map for select using (true);
create policy "Admin write travel" on travel_map for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Goals: public read, admin write
create policy "Public read goals" on goals for select using (true);
create policy "Admin write goals" on goals for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Predictions: public read, admin write
create policy "Public read predictions" on predictions for select using (true);
create policy "Admin write predictions" on predictions for all using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- AMA: public read answered, admin read all, public insert
create policy "Public read answered ama" on ama_questions for select using (answered = true);
create policy "Admin read all ama" on ama_questions for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Public insert ama" on ama_questions for insert with check (true);
create policy "Admin update ama" on ama_questions for update using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
create policy "Admin delete ama" on ama_questions for delete using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Guestbook: public read/insert, admin delete
create policy "Public read guestbook" on guestbook for select using (true);
create policy "Public insert guestbook" on guestbook for insert with check (true);
create policy "Admin delete guestbook" on guestbook for delete using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Subscribers: public insert, admin read
create policy "Public insert subscribers" on subscribers for insert with check (true);
create policy "Admin read subscribers" on subscribers for select using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
