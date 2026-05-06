-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  linkedin_url text,
  github_url text,
  skills text[] default '{}',
  experience_years integer default 0,
  experience_level text default 'mid' check (experience_level in ('entry','mid','senior','lead','executive')),
  preferred_countries text[] default '{}',
  needs_visa boolean default false,
  expected_salary_min integer,
  expected_salary_max integer,
  salary_currency text default 'USD',
  job_titles text[] default '{}',
  freelance_interest boolean default false,
  work_mode text[] default '{"remote"}',
  resume_url text,
  resume_text text,
  summary text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Applications tracker
create table if not exists public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  company text not null,
  position text not null,
  job_url text,
  source text,
  status text default 'saved' check (status in ('saved','applied','interview','offer','rejected')),
  applied_at timestamptz,
  match_score integer,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Saved jobs cache
create table if not exists public.saved_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  job_data jsonb not null,
  source_id text,
  created_at timestamptz default now()
);

-- Chat history
create table if not exists public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Job search cache (TTL-based)
create table if not exists public.job_cache (
  id uuid default uuid_generate_v4() primary key,
  cache_key text unique not null,
  data jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Analytics events
create table if not exists public.analytics_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  event_data jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.chat_sessions enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own applications" on public.applications for all using (auth.uid() = user_id);
create policy "Users can manage own saved jobs" on public.saved_jobs for all using (auth.uid() = user_id);
create policy "Users can manage own chat sessions" on public.chat_sessions for all using (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clean expired cache entries (call periodically)
create or replace function public.clean_job_cache()
returns void as $$
begin
  delete from public.job_cache where expires_at < now();
end;
$$ language plpgsql;
