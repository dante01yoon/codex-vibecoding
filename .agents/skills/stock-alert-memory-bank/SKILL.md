---
name: stock-alert-memory-bank
description: Maintain the My Stock Alert stock-alarm project memory bank. Use when starting or resuming a stock-alarm Codex session, preparing a small implementation task, summarizing completed work, updating project notes, creating .memory-bank files, or writing task cards under .memory-bank/tasks.
---

# Stock Alert Memory Bank

## Purpose

Keep the `stock-alarm` project easy to resume by maintaining short, beginner-friendly memory notes. Treat `stock-alarm/` as the project root unless the user clearly says otherwise.

## First Read

When the files exist, read them before planning or editing:

1. `AGENTS.md`
2. `DESIGN.md`
3. `docs/superpowers/specs/2026-05-07-stock-alarm-prd.md`
4. `docs/superpowers/specs/2026-05-06-stock-alarm-design.md`
5. `.memory-bank/project-brief.md`
6. `.memory-bank/active-context.md`
7. `.memory-bank/progress.md`
8. `.memory-bank/decision-log.md`
9. `.memory-bank/next-actions.md`
10. `.memory-bank/verification-log.md`

If a file is missing, keep going with the available context and create the missing memory-bank files when the task involves memory setup or update.

## Memory Files

Maintain these files under `stock-alarm/.memory-bank/`:

- `project-brief.md`: stable product summary, audience, scope, and non-goals.
- `active-context.md`: what changed recently, current focus, and important local context for the next session.
- `progress.md`: status of major milestones using `done`, `in progress`, `blocked`, and `next`.
- `decision-log.md`: durable decisions with date, decision, reason, and consequence.
- `next-actions.md`: small follow-up tasks that are ready to pick up.
- `verification-log.md`: commands, manual checks, results, and known gaps.

Keep notes concise. Prefer Korean when the surrounding project notes are Korean. Avoid long narrative summaries; write what the next beginner needs to continue safely.

## Task Cards

Create one small task card under `stock-alarm/.memory-bank/tasks/` for each focused task. Use a kebab-case filename such as `add-demo-alert-evaluator.md`.

Include:

- Goal
- Status: `done`, `in progress`, `blocked`, or `next`
- Files to inspect or edit
- Plan
- Verification
- Notes for the next session

Update the task card as work progresses instead of leaving stale plans behind.

## Workflow

1. Locate the project root. Default to `stock-alarm/`.
2. Read the first-read files that exist.
3. If `.memory-bank/` does not exist and memory work is in scope, create the directory and the six core files.
4. Before implementation work, write or update the relevant task card.
5. Keep product notes aligned with `AGENTS.md`, `DESIGN.md`, and the PRD/design specs.
6. After completing work, update `active-context.md`, `progress.md`, `decision-log.md` when a durable decision changed, `next-actions.md`, `verification-log.md`, and the task card.
7. Summarize what changed, what remains next, and what verification was or was not run.

If the user asks for planning only, keep app code read-only and ask before making implementation edits. Memory-bank planning notes may be updated only when the user requested note creation or update.

## Project Boundaries

Honor these stock-alarm constraints:

- This is an educational personal stock alert app, not investment advice.
- Do not add stock recommendations, predictions, buy/sell guidance, trading signals, or order execution UI.
- Real KIS or Alpha Vantage API integration is out of scope for section 11-7.
- Supabase Auth and Supabase DB are out of scope for section 11-7.
- Use Demo Provider data first.
- UI work must follow `DESIGN.md` and avoid a trading-terminal feel.

## Safety

Never store secrets in memory-bank files:

- API keys
- access tokens
- refresh tokens
- provider credentials
- private account data
- Supabase service role keys
- `.env` contents

If secret-like data appears in a command output or file, omit it from notes and mention only that a credential was present.
