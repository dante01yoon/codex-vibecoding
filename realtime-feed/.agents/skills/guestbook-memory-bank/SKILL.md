---
name: guestbook-memory-bank
description: Maintain the Realtime Guestbook project memory bank. Use when starting or resuming a realtime-feed Codex session, preparing a small implementation task, summarizing completed work, updating project notes, creating .memory-bank files, or writing task cards under .memory-bank/tasks.
---

# Guestbook Memory Bank

## Purpose

Keep the `realtime-feed` project easy to resume by maintaining short, beginner-friendly memory notes. Treat `realtime-feed/` as the project root unless the user clearly says otherwise.

## First Read

When the files exist, read them before planning or editing:

1. `AGENTS.md`
2. `DESIGN.md`
3. `docs/superpowers/specs/2026-05-10-realtime-guestbook-design.md`
4. `.memory-bank/project-brief.md`
5. `.memory-bank/active-context.md`
6. `.memory-bank/progress.md`
7. `.memory-bank/decision-log.md`
8. `.memory-bank/next-actions.md`
9. `.memory-bank/verification-log.md`

If a file is missing, keep going with the available context. Create the missing `.memory-bank/` files only when the task involves memory setup or memory updates.

## Memory Files

Maintain these files under `realtime-feed/.memory-bank/`:

- `project-brief.md`: stable product summary, audience, scope, and non-goals.
- `active-context.md`: current focus, recent changes, and what the next session needs to know.
- `progress.md`: milestone status using `done`, `in progress`, `blocked`, and `next`.
- `decision-log.md`: durable decisions with date, decision, reason, and consequence.
- `next-actions.md`: small follow-up tasks that are ready to pick up.
- `verification-log.md`: commands, manual checks, results, and known gaps.

Keep notes concise. Prefer Korean when the surrounding project notes are Korean. Write for a beginner who needs to continue safely, not for someone archiving a full conversation.

## Task Cards

Create one small task card under `realtime-feed/.memory-bank/tasks/` for each focused task. Use a kebab-case filename such as `build-sample-feed.md`.

Include:

- Goal
- Status: `done`, `in progress`, `blocked`, or `next`
- Files to inspect or edit
- Plan
- Verification
- Notes for the next session

Update the task card as work progresses instead of leaving stale plans behind.

## Workflow

1. Locate the project root. Default to `realtime-feed/`.
2. Read the first-read files that exist.
3. If `.memory-bank/` does not exist and memory work is in scope, create the directory, the six core files, and `.memory-bank/tasks/`.
4. Before implementation work, write or update the relevant task card when the user asked for memory-bank tracking.
5. Keep product notes aligned with `AGENTS.md`, `DESIGN.md`, and the PRD/design spec.
6. After completing work, update `active-context.md`, `progress.md`, `decision-log.md` when a durable decision changed, `next-actions.md`, `verification-log.md`, and the task card.
7. Summarize what changed, what remains next, and what verification was or was not run.

If the user asks for planning only, keep app code read-only and ask before making implementation edits. Memory-bank planning notes may be updated only when the user requested note creation or update.

## Project Boundaries

Honor these realtime guestbook constraints:

- This is a Korean realtime guestbook, not a marketing landing page.
- The first screen should show the actual guestbook experience.
- Keep the warm post-it gallery direction from `DESIGN.md`.
- Use sample guestbook data first.
- Actual Supabase connection is out of scope for section 11-7 unless the user explicitly asks for it.
- Login, signup, passwords, and social auth are out of scope for section 11-7.
- Do not add admin dashboards, moderation UI, search, notifications, hashtags, nested comments, or multi-attachment posts unless the user explicitly expands scope.

## Safety

Never store secrets or private values in memory-bank files:

- Passwords
- API keys
- Access tokens or refresh tokens
- Supabase service role keys
- Supabase URL values
- `.env` contents
- Personal account data

If secret-like data appears in a command output or file, omit it from notes and mention only that a credential-like value was present.
