---
story_id: "4.1"
story_key: 4-1-localstorage-save-restore
epic: "Epic 4 - 최근 플랜 저장과 모바일 검증"
status: done
created: 2026-05-18
source:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prds/prd-popup-store-survival-planner-2026-05-18/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
previous_story:
  - _bmad-output/implementation-artifacts/3-2-checklist-progress-message.md
---

# Story 4.1: Recent Plan localStorage Save And Restore

Status: done

## Story

As a popup store visitor,  
I want my plan to be saved in the browser,  
so that I do not have to re-enter it after refresh.

## Scope

This story starts Epic 4 by saving the current raw plan to browser localStorage and restoring it on page load.

Included:

- Save visit info, goods items, and checklist checked state
- Restore those values after refresh
- Use localStorage key `popupStoreSurvivalPlanner.plan.v1`
- Store raw plan data only, not computed survival-card output
- Unit tests for storage serialization helpers

Excluded:

- Visible save-status text
- Reset button
- Storage failure messaging
- Multiple plan history
- Server/account sync

## Acceptance Criteria

1. Plan saves under the approved key
   - Given the user changes visit info, goods, or checklist
   - When the app state changes
   - Then the recent plan is saved under `popupStoreSurvivalPlanner.plan.v1`

2. Plan restores after refresh
   - Given localStorage has a saved recent plan
   - When the user reloads the page
   - Then visit info, goods items, and checklist checked state are restored

3. Raw plan only
   - Given the survival plan card is displayed
   - When saved JSON is inspected
   - Then computed card values such as budget total, priority goods list, checklist progress label, and messages are not stored

4. Existing behavior preservation
   - Given implementation is complete
   - When prior Epic 1-3 flows are checked
   - Then prior behavior still works

## Tasks / Subtasks

- [x] Task 1: Confirm current code and scope (AC: 4)
  - [x] Read current App, storage-relevant architecture notes, and tests.
  - [x] Preserve visit, goods, priority-card, checklist, and progress behavior.
  - [x] Do not add server, auth, multiple-plan history, or external API.

- [x] Task 2: Add storage helper (AC: 1, 3)
  - [x] Add `src/utils/storage.js`.
  - [x] Export `STORAGE_KEY`.
  - [x] Add serialize/parse helpers that keep only raw plan fields.
  - [x] Add focused tests for the key and raw-plan serialization.

- [x] Task 3: Wire save/restore into App (AC: 1, 2)
  - [x] Restore visit info, goods, and checklist state during initial render.
  - [x] Save the current raw plan whenever relevant state changes.
  - [x] Avoid storing computed card values.

- [x] Task 4: Verify and review (AC: 1-4)
  - [x] Run `npm test`.
  - [x] Run `npm run build`.
  - [x] Browser-check saved key, refresh restore, raw JSON, and prior behavior.

## Senior Developer Review (AI)

### Review Outcome

Approve - no blocking findings.

### Review Summary

- Blind Hunter: Storage stays browser-only and uses the approved key with no account/server/multi-plan scope.
- Edge Case Hunter: Parser handles broken JSON by returning null; checklist restore maps saved checked state onto current default labels.
- Acceptance Auditor: AC 1-4 passed through unit tests, build, and browser checks.

### Action Items

- None.

### Residual Risk

- Save failure UX is not implemented here by design; it is Story 4.2 scope.

## Dev Notes

### Architecture Guardrails

- Use localStorage only; no server or account sync.
- Store source plan data, not computed card output.
- Use React `useEffect` for save.
- Keep the key exactly `popupStoreSurvivalPlanner.plan.v1`.

### Expected Files To Modify

- `src/App.jsx`
- `src/utils/storage.js`
- `src/utils/planCalculations.test.mjs`
- `_bmad-output/implementation-artifacts/4-1-localstorage-save-restore.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-05-18: Story created and started from Epic 4 backlog.
- RED check: `npm test` failed because `src/utils/storage.js` did not exist yet.
- Unit/regression check: `npm test` passed after storage helpers were implemented.
- Production build check: `npm run build` passed.
- Browser check: Playwright at `http://127.0.0.1:5176/` verified storage under `popupStoreSurvivalPlanner.plan.v1`, raw JSON without computed card fields, fresh-page restore of visit info/goods/checklist, and card reflection of restored data.
- Browser console check: only the React DevTools informational message appeared; no app errors were logged.

### Implementation Plan

- Test storage key and raw serializer first.
- Restore initial state from storage once.
- Save raw state with an effect.

### Completion Notes

- Added `src/utils/storage.js` with approved key, raw-plan serializer, parser, read, and write helpers.
- Restored visit info, goods, and checklist state from localStorage during initial render.
- Saved raw plan state through a React effect.
- BMAD-style review approved the story with no blocking findings.

### File List

- `_bmad-output/implementation-artifacts/4-1-localstorage-save-restore.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/verification/popup-store-survival-planner-4-1-restore.png`
- `src/App.jsx`
- `src/utils/planCalculations.test.mjs`
- `src/utils/storage.js`

### Change Log

- 2026-05-18: Created and started Story 4.1 implementation.
- 2026-05-18: Implemented localStorage save/restore, tests, browser verification, and BMAD review.
