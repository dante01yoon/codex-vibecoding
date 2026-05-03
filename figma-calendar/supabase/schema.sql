-- Figma Calendar Supabase schema
-- Development/demo project only. Review this file before running it.
-- Do not run this against production data or real personal schedules.

create extension if not exists "pgcrypto";

create table if not exists public.schedule_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color_key text not null check (color_key in ('green', 'red', 'gold', 'mint', 'violet', 'blue')),
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 80),
  event_date date not null,
  start_time time,
  end_time time,
  category_id uuid references public.schedule_categories(id),
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists schedule_events_user_date_idx
on public.schedule_events (user_id, event_date, start_time);

alter table public.schedule_categories enable row level security;
alter table public.schedule_events enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.schedule_categories to anon, authenticated;
grant select, insert on public.schedule_events to authenticated;

create policy "Categories are readable by browser clients"
on public.schedule_categories
for select
to anon, authenticated
using (true);

create policy "Users can read their own events"
on public.schedule_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own events"
on public.schedule_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

insert into public.schedule_categories (name, color_key, sort_order)
values
  ('Work', 'green', 1),
  ('Meeting', 'blue', 2),
  ('Deadline', 'red', 3),
  ('Personal', 'gold', 4),
  ('Focus', 'violet', 5)
on conflict (name) do nothing;
