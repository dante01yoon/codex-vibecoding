create extension if not exists pgcrypto;

create table public.guestbook_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 24),
  message text not null check (char_length(message) between 1 and 500),
  avatar_color text not null check (
    avatar_color in (
      '#2563eb',
      '#059669',
      '#d97706',
      '#dc2626',
      '#7c3aed',
      '#0f766e'
    )
  ),
  mood text not null check (
    mood in ('happy', 'cheer', 'celebrate', 'idea', 'love')
  ),
  attachment_path text,
  attachment_kind text check (
    attachment_kind is null or attachment_kind in ('image', 'drawing')
  ),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint guestbook_posts_attachment_pair check (
    (attachment_path is null and attachment_kind is null)
    or (attachment_path is not null and attachment_kind is not null)
  )
);

create table public.guestbook_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.guestbook_posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 240),
  mood text not null check (
    mood in ('happy', 'cheer', 'celebrate', 'idea', 'love')
  ),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index guestbook_posts_created_at_idx
  on public.guestbook_posts (created_at desc)
  where deleted_at is null;

create index guestbook_comments_post_created_at_idx
  on public.guestbook_comments (post_id, created_at desc)
  where deleted_at is null;

alter table public.guestbook_posts enable row level security;
alter table public.guestbook_comments enable row level security;

revoke all privileges on public.guestbook_posts from anon, authenticated;
revoke all privileges on public.guestbook_comments from anon, authenticated;

grant select on public.guestbook_posts to authenticated;
grant insert (
  author_id,
  display_name,
  message,
  avatar_color,
  mood,
  attachment_path,
  attachment_kind
) on public.guestbook_posts to authenticated;
grant update (deleted_at) on public.guestbook_posts to authenticated;

grant select on public.guestbook_comments to authenticated;
grant insert (
  post_id,
  author_id,
  message,
  mood
) on public.guestbook_comments to authenticated;
grant update (deleted_at) on public.guestbook_comments to authenticated;

create policy "Guests can read active posts"
  on public.guestbook_posts
  for select
  to authenticated
  using (deleted_at is null);

create policy "Guests can create own posts"
  on public.guestbook_posts
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and deleted_at is null
  );

create policy "Guests can soft delete own posts"
  on public.guestbook_posts
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

create policy "Guests can read active comments"
  on public.guestbook_comments
  for select
  to authenticated
  using (
    deleted_at is null
    and exists (
      select 1
      from public.guestbook_posts
      where guestbook_posts.id = guestbook_comments.post_id
        and guestbook_posts.deleted_at is null
    )
  );

create policy "Guests can create own comments"
  on public.guestbook_comments
  for insert
  to authenticated
  with check (
    author_id = (select auth.uid())
    and deleted_at is null
    and exists (
      select 1
      from public.guestbook_posts
      where guestbook_posts.id = guestbook_comments.post_id
        and guestbook_posts.deleted_at is null
    )
  );

create policy "Guests can soft delete own comments"
  on public.guestbook_comments
  for update
  to authenticated
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'guestbook-media',
  'guestbook-media',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anyone can read guestbook media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'guestbook-media');

create policy "Guests can upload own guestbook media"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'guestbook-media'
    and (storage.foldername(name))[1] = 'posts'
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );

create policy "Guests can remove own guestbook media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'guestbook-media'
    and (storage.foldername(name))[1] = 'posts'
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guestbook_posts'
  ) then
    alter publication supabase_realtime add table public.guestbook_posts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'guestbook_comments'
  ) then
    alter publication supabase_realtime add table public.guestbook_comments;
  end if;
end $$;
