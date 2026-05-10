create extension if not exists pgcrypto with schema extensions;

create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  market text not null check (market in ('US', 'KR')),
  provider text not null,
  display_name text not null,
  exchange text not null,
  currency text not null,
  created_at timestamptz not null default now(),
  unique (user_id, symbol, market, provider)
);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  watchlist_item_id uuid not null references public.watchlist_items(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  rule_type text not null check (rule_type in ('price', 'daily_change_percent')),
  operator text not null check (operator in ('above', 'below')),
  threshold_value numeric not null,
  cooldown_minutes integer not null default 15 check (cooldown_minutes >= 0),
  last_triggered_at timestamptz,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.alert_events (
  id uuid primary key default gen_random_uuid(),
  alert_rule_id uuid not null references public.alert_rules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,
  message text not null,
  triggered_value text not null,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz
);

create index watchlist_items_user_symbol_idx on public.watchlist_items (user_id, symbol);
create index alert_rules_user_symbol_idx on public.alert_rules (user_id, symbol);
create index alert_rules_watchlist_item_idx on public.alert_rules (watchlist_item_id);
create index alert_events_user_created_idx on public.alert_events (user_id, created_at desc);
create index alert_events_pending_idx on public.alert_events (user_id, symbol)
where acknowledged_at is null;

alter table public.watchlist_items enable row level security;
alter table public.alert_rules enable row level security;
alter table public.alert_events enable row level security;

create policy "watchlist items are visible to their owner"
on public.watchlist_items
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "watchlist items are inserted by their owner"
on public.watchlist_items
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "watchlist items are updated by their owner"
on public.watchlist_items
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "watchlist items are deleted by their owner"
on public.watchlist_items
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "alert rules are visible to their owner"
on public.alert_rules
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "alert rules are inserted by their owner"
on public.alert_rules
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "alert rules are updated by their owner"
on public.alert_rules
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "alert rules are deleted by their owner"
on public.alert_rules
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "alert events are visible to their owner"
on public.alert_events
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "alert events are inserted by their owner"
on public.alert_events
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "alert events are updated by their owner"
on public.alert_events
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "alert events are deleted by their owner"
on public.alert_events
for delete
to authenticated
using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.watchlist_items to authenticated;
grant select, insert, update, delete on public.alert_rules to authenticated;
grant select, insert, update, delete on public.alert_events to authenticated;
