# Realtime Guestbook Design

Date: 2026-05-10
Project: `realtime-feed`

## Summary

Build a small deployable Korean realtime guestbook with React, Vite, Vercel, and Supabase. Visitors should be able to open the app, get an invisible Supabase anonymous session, write a guestbook post, optionally attach one uploaded image or one simple canvas drawing, and see new posts arrive live in the feed.

The first version favors a focused community feed over a large social platform. Posts are realtime at the main feed level. Comments are realtime only when a post is expanded, which keeps the first implementation understandable and avoids subscribing to every comment thread at once.

## Confirmed Product Decisions

- Deployment target: Vercel for the frontend and Supabase for auth, database, realtime, and storage.
- UI language: Korean.
- Layout: split write-and-read layout on desktop; stacked composer-first layout on mobile.
- Identity: Supabase anonymous auth. Users do not see a login screen.
- Post fields: name, message, avatar color, mood/emoji, optional attachment.
- Attachment scope: optional, at most one per post; either one uploaded image or one canvas drawing.
- Canvas scope: simple drawing only, with a small color palette, erase, and clear.
- Feed behavior: newest-first infinite feed. New posts appear at the top in realtime.
- Comments: supported in the first version. Each comment has text plus mood/emoji.
- Delete behavior: only the anonymous session that created a post or comment can delete it.
- Admin/moderation UI: out of scope for the first version.

## Goals

- Let a visitor create a guestbook post without visible sign-up friction.
- Make live posting obvious by showing newly created posts in another browser without refresh.
- Support lightweight media expression through image upload or canvas drawing.
- Keep the codebase teachable: UI components should not contain raw Supabase query details.
- Keep the production surface small enough to deploy and verify quickly.

## Non-Goals

- Full user accounts, profiles, password login, or social login.
- Admin dashboard, report queue, or global moderation workflow.
- Multiple attachments per post.
- Rich canvas features such as layers, stickers, undo stacks, or text tools.
- Full-text search, hashtags, notifications, or nested comment threads.

## User Experience

The first screen is the guestbook itself, not a marketing landing page.

Desktop layout uses two main regions:

- Left composer panel: name, mood/emoji, avatar color picker, message input, attachment controls, preview, and submit button.
- Right feed panel: live status, newest-first post list, load-more control, expanded comment areas, and delete controls for owned content.

Mobile layout stacks the composer above the feed. The composer should remain compact after successful submission so users can continue reading without a large fixed panel blocking the feed.

Post cards show avatar color, name, mood/emoji, relative timestamp, message, optional media preview, comment count, expand/collapse control, and a delete button only when the row belongs to the current anonymous user.

Attachment controls offer two mutually exclusive modes:

- Upload image: choose a supported image file and preview it before posting.
- Draw: open a simple canvas with pen color choices, erase, and clear.

Comments appear when the user expands a post. The expanded area loads existing comments for that post, subscribes to new comments for that post, and includes a compact Korean comment composer with text and mood/emoji.

## Architecture

Use React and Vite for the frontend. Vercel serves the static app. Supabase provides anonymous auth, Postgres tables, realtime subscriptions, and storage. There is no separate Node server in the first version.

Keep code in three broad layers:

- UI layer: React components for layout, composer, canvas tool, attachment preview, feed, post card, and comment thread.
- Client service layer: small modules for `auth`, `posts`, `comments`, and `attachments`. These modules own Supabase calls and normalize returned data for UI components.
- Supabase backend: database tables, row level security policies, realtime publication configuration, and a storage bucket for post media.

The UI should call service functions and subscribe/unsubscribe through service helpers rather than importing Supabase query logic into every component. This keeps RLS changes, storage path changes, and query changes localized.

## Data Model

Use UUID primary keys and `auth.uid()` for ownership.

`guestbook_posts`

- `id uuid primary key`
- `author_id uuid not null`
- `display_name text not null`
- `message text not null`
- `avatar_color text not null`
- `mood text not null`
- `attachment_path text`
- `attachment_kind text` with allowed values `image` or `drawing`
- `created_at timestamptz not null default now()`
- `deleted_at timestamptz`

`guestbook_comments`

- `id uuid primary key`
- `post_id uuid not null references guestbook_posts(id) on delete cascade`
- `author_id uuid not null`
- `message text not null`
- `mood text not null`
- `created_at timestamptz not null default now()`
- `deleted_at timestamptz`

The app should query only rows where `deleted_at is null`. Soft deletion keeps realtime delete handling and auditability simple. Attachment cleanup can still attempt to remove the storage object when a post is deleted.

For the first version, comments do not support media attachments or nested replies.

## Supabase Security

The frontend uses only public browser-safe Supabase environment variables. It must never expose a service role or secret key.

Enable RLS on both tables.

Policy shape:

- Anyone with an anonymous authenticated session can read non-deleted posts and comments.
- Authenticated anonymous users can insert rows where `author_id = auth.uid()`.
- Users can soft-delete only rows where `author_id = auth.uid()`.
- Users cannot update other fields after creation in the first version.

Storage should use one bucket for guestbook media. Object paths should include the user id and a generated file name, for example `posts/{user_id}/{uuid}.webp`. Storage policies should allow authenticated users to upload only under their own user-id prefix and allow public read for objects shown in the feed.

Implementation should verify current Supabase docs and changelog before writing migrations or storage policies, because CLI commands and policy details can change.

## Realtime Behavior

The main feed subscribes to `guestbook_posts` insert and delete/update events for visible posts. New inserts are placed at the top if they are not already present. Delete or soft-delete events remove the row from the visible list.

Initial load fetches the first page ordered by `created_at desc`. Older posts are fetched with a cursor or range-based pagination through a "더 보기" control.

Comments are scoped to expanded posts. When a user expands a post, the app fetches that post's comments and subscribes to changes for that `post_id`. When the post is collapsed or unmounted, the comment subscription is removed.

If realtime reconnects after an interruption, the app should refresh the latest post page and any expanded comment threads to reduce missed updates.

## Write Flow

On app start:

1. Create or restore a Supabase anonymous session.
2. Load the newest post page.
3. Start the posts realtime subscription.

On post submit:

1. Validate name, message, mood, avatar color, attachment type, and attachment size.
2. If an attachment exists, upload it to Supabase Storage.
3. Insert the post row with the uploaded attachment path, if any.
4. Reset the composer after success.
5. Let realtime insert events update other connected clients.

On comment submit:

1. Validate message and mood.
2. Insert the comment row for the expanded post.
3. Let the scoped comment subscription update the visible thread.

On delete:

1. Confirm the current row belongs to the anonymous session.
2. Soft-delete the post or comment.
3. If deleting a post with an attachment, attempt to remove the storage object.
4. Show a retryable Korean error if the delete or storage cleanup fails.

## Error Handling

Use short Korean messages and preserve user input when possible.

- Anonymous auth failure: disable writing and show "방명록을 준비하지 못했어요. 잠시 후 다시 시도해 주세요."
- Feed load failure: keep the feed region visible with a retry button.
- Upload failure: do not create the post automatically. Let the user retry upload or remove the attachment.
- Invalid file: show type or size guidance before upload.
- Realtime interruption: keep existing posts visible and show a small "실시간 연결을 다시 시도 중이에요." status.
- Permission failure on delete: show "내가 작성한 항목만 삭제할 수 있어요."
- General delete failure: show "삭제하지 못했어요. 다시 시도해 주세요."

## Validation Rules

The first version should enforce these concrete limits in both UI and Supabase-facing code:

- Name is required and must be 2 to 24 characters.
- Post message is required and must be 1 to 500 characters.
- Comment message is required and must be 1 to 240 characters.
- Mood/emoji must come from this initial set: happy, cheer, celebrate, idea, love.
- Avatar color must come from this initial palette: `#2563eb`, `#059669`, `#d97706`, `#dc2626`, `#7c3aed`, `#0f766e`.
- Image attachments must be `image/jpeg`, `image/png`, or `image/webp` and no larger than 4 MB.
- Canvas drawings should be exported as `image/webp` when supported, with `image/png` as fallback, and no larger than 2 MB after export.

## Testing Plan

Automated tests should cover:

- Supabase response mapping for posts and comments.
- Attachment validation for allowed types, rejected types, and size limits.
- Canvas export helper behavior with a mocked canvas/blob path where practical.
- Feed merge behavior for initial rows plus realtime inserts.
- Delete button visibility for owned versus unowned posts and comments.
- Comment expansion state and scoped comment loading.

Manual deployment checks should cover:

- Two browsers open to the deployed Vercel URL.
- A text-only post appears in the other browser without refresh.
- An uploaded-image post appears in the other browser without refresh.
- A canvas-drawing post appears in the other browser without refresh.
- An expanded post receives a realtime comment in the other browser.
- The author browser can delete its own post and comment.
- The non-author browser does not see delete controls for content it did not create.
- Refresh preserves the anonymous session and ownership controls in the original browser.
- Older posts load through "더 보기".
- Mobile layout stacks cleanly and text does not overflow controls.

Before shipping, run the local build, lint, and test commands defined by the project. Also verify Vercel environment variables and Supabase RLS/storage policies against the deployed project.

## Implementation Boundary

The next step should be an implementation plan, not direct coding. The plan should start by scaffolding a minimal React/Vite app only if the project is still empty, then add Supabase configuration, schema/migrations, service modules, UI components, realtime subscriptions, tests, and deployment verification in small steps.
