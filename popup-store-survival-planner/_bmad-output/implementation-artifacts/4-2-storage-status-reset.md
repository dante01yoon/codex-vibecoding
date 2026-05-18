---
story_id: "4.2"
story_key: 4-2-storage-status-reset
epic: "Epic 4 - 최근 플랜 저장과 모바일 검증"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/4-1-localstorage-save-restore.md
---

# Story 4.2: Storage Status And Reset

Status: done

## Story

As a popup store visitor,  
I want to see save status and reset the recent plan,  
so that I can manage browser-saved plan data safely.

## Scope

This story adds a recent-plan storage area with save status, save-failure handling, and a reset button that clears the approved localStorage key and returns the app to defaults.

Included:

- `최근 플랜 저장됨` status after successful save
- `이 브라우저에서는 저장을 사용할 수 없어요.` status when localStorage save throws
- Reset button with confirmation
- Remove `popupStoreSurvivalPlanner.plan.v1` on reset
- Reset visit info, goods items, and checklist state to defaults

Excluded:

- Multiple saved plans
- Export/import
- Server/account sync
- Custom checklist item persistence

## Acceptance Criteria

1. Successful save status
   - Given plan saving succeeds
   - When the screen is viewed
   - Then `최근 플랜 저장됨` is displayed

2. Save failure status
   - Given localStorage saving fails
   - When the app attempts to save
   - Then `이 브라우저에서는 저장을 사용할 수 없어요.` is displayed and the app does not stop

3. Reset clears storage and inputs
   - Given a saved plan exists
   - When the user clicks reset and confirms
   - Then the localStorage key is deleted and inputs return to the default state

4. Reset survives refresh
   - Given reset is complete
   - When the user refreshes
   - Then the previous plan is not restored

## Tasks / Subtasks

- [x] Task 1: Confirm current storage wiring (AC: 1-4)
  - [x] Read `src/App.jsx` and `src/utils/storage.js`.
  - [x] Preserve Story 4.1 raw-plan save/restore behavior.
  - [x] Do not add server, account sync, multiple plan history, or new dependencies.

- [x] Task 2: Extend storage helpers and tests (AC: 3)
  - [x] Add a helper to remove the approved storage key.
  - [x] Add tests for key removal with a fake storage object.

- [x] Task 3: Add save status and reset UI (AC: 1, 2, 3)
  - [x] Add a recent plan storage section.
  - [x] Show saved or unavailable status.
  - [x] Add reset button with confirmation.
  - [x] Reset app state to defaults and prevent immediate re-saving of the deleted key.

- [x] Task 4: Verify and review (AC: 1-4)
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check saved status, save failure status, reset delete/default state, and refresh after reset.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: No server/account/multiple-plan scope entered the storage UI story.
- Edge Case Hunter: Save failure is caught in the effect and reset skips one save cycle so the deleted key is not immediately recreated.
- Acceptance Auditor: AC 1-4 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- Reset uses `window.confirm`, which is intentionally simple and consistent with the architecture note for this beginner MVP.

## Dev Notes

- Keep storage local and raw-plan-only.
- Reset must delete the key and must not immediately re-create it with default data.
- Use `window.confirm` for the reset confirmation.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-18: Story created and started from Epic 4 backlog.
- RED check: `npm test` failed because `removeStoredPlan` was not exported yet.
- Unit/regression check: `npm test` passed after the remove helper was implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5176/` verified `최근 플랜 저장됨`, forced save failure message, app continued rendering, confirmed reset deleted the key, reset inputs to defaults, and a fresh page did not restore the previous plan.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Add remove helper and tests.
- Add save status state around the existing save effect.
- Add reset handler that clears storage and skips one save cycle.

### Completion Notes

- Added `removeStoredPlan`.
- Added a recent-plan storage section with save status and reset button.
- Added save failure handling around localStorage writes.
- Added reset logic that clears storage, resets app state, and avoids immediate default re-save.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/4-2-storage-status-reset.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-4-2-reset.png`
- `src/App.jsx`
- `src/styles.css`
- `src/utils/planCalculations.test.mjs`
- `src/utils/storage.js`

### Change Log

- 2026-05-18: Created and started Story 4.2 implementation.
- 2026-05-18: Implemented storage status/reset, tests, browser verification, and BMAD review.
