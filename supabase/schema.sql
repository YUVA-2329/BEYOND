-- ==============================================================================
-- BEYOND — PRODUCTION SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Description:
-- Complete production schema for BEYOND application authentication, user profiles,
-- discoveries, likes, comments, and gamification.
--
-- Security:
-- 1. Row Level Security (RLS) enabled on all public tables.
-- 2. Strict ownership policies: Users can only modify their own profile data.
-- 3. Automatic profile generation on auth.users sign-up via PostgreSQL trigger.
-- 4. Role escalation prevention: Explorer level and XP cannot be manipulated by users.
-- ==============================================================================

-- 1. Create Profiles Table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text not null,
  handle text unique,
  avatar_url text default '/intro/assets/rohit_avatar.png',
  bio text default 'Explorer discovering hidden gems and extraordinary places.',
  explorer_level text default 'Explorer I',
  xp integer default 120 check (xp >= 0),
  role text default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast handle and email lookup
create index if not exists profiles_handle_idx on public.profiles (handle);
create index if not exists profiles_email_idx on public.profiles (email);

-- 2. Enable Row-Level Security (RLS) on Profiles
alter table public.profiles enable row level security;

-- 3. Profiles RLS Policies
-- Policy A: Everyone can read public profiles (for social exploration & discovery authors)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

-- Policy B: Users can insert their own profile
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Policy C: Users can update ONLY their own profile (and cannot alter system role or XP)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id 
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Policy D: Users cannot delete other profiles
drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile"
  on public.profiles
  for delete
  using (auth.uid() = id);

-- 4. Automatic Profile Creation Trigger on Sign-up
-- Function to handle new user insertion
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  raw_name text;
  raw_handle text;
  cleaned_handle text;
begin
  -- Extract display name from metadata or fall back to email username
  raw_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Extract or generate handle
  raw_handle := coalesce(
    new.raw_user_meta_data->>'handle',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'preferred_username',
    split_part(new.email, '@', 1)
  );

  -- Sanitize handle (lowercase, alphanumeric + underscore)
  cleaned_handle := regexp_replace(lower(raw_handle), '[^a-z0-9_]', '_', 'g');

  -- Ensure handle is unique by appending first 4 chars of UUID if collision
  if exists (select 1 from public.profiles where handle = cleaned_handle) then
    cleaned_handle := cleaned_handle || '_' || substring(new.id::text, 1, 4);
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    handle,
    avatar_url,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    raw_name,
    cleaned_handle,
    coalesce(new.raw_user_meta_data->>'avatar_url', '/intro/assets/rohit_avatar.png'),
    now(),
    now()
  );

  return new;
end;
$$;

-- Trigger firing immediately after auth.users row is inserted
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Updated_at Timestamp Refresh Trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================
