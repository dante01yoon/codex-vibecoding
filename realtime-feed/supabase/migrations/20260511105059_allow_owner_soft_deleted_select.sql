drop policy "Guests can read active posts" on public.guestbook_posts;
drop policy "Guests can read active comments" on public.guestbook_comments;

create policy "Guests can read visible posts"
  on public.guestbook_posts
  for select
  to authenticated
  using (
    deleted_at is null
    or (
      author_id = (select auth.uid())
      and deleted_at is not null
    )
  );

create policy "Guests can read visible comments"
  on public.guestbook_comments
  for select
  to authenticated
  using (
    (
      deleted_at is null
      and exists (
        select 1
        from public.guestbook_posts
        where guestbook_posts.id = guestbook_comments.post_id
          and guestbook_posts.deleted_at is null
      )
    )
    or (
      author_id = (select auth.uid())
      and deleted_at is not null
    )
  );
