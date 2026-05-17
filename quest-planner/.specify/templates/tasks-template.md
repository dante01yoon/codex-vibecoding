---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Include automated tests only when requested by the feature spec or
when the plan introduces logic that is easier to protect with a small unit test.
Browser verification tasks are required for user-visible implementation work.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **React app**: `src/` at repository root
- **Components**: `src/components/`
- **Mock data**: `src/data/`
- **Recommendation/storage helpers**: `src/lib/`
- **Styles**: `src/styles/` or the existing project stylesheet path
- **Tests**: `tests/` or `src/__tests__/` only if introduced by the plan

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Constitution requirements for beginner-readable structure, visible time/cost,
    responsive UI, browser verification, and minimal dependencies

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the smallest readable React structure for the feature.

- [ ] T001 Create or confirm the shallow `src/` structure from plan.md
- [ ] T002 Confirm the local dev command and package scripts in `package.json`
- [ ] T003 [P] Confirm no new runtime dependency is needed, or document the plan-approved dependency rationale

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared local data, recommendation, storage, and styling foundations
that MUST be complete before user story UI work begins.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Create or update local mock quest data in `src/data/[mock-data-file]`
- [ ] T005 Create or update recommendation logic in `src/lib/[recommendation-file]`
- [ ] T006 [P] Create or update localStorage helper in `src/lib/[storage-file]`
- [ ] T007 [P] Create or update shared responsive styles in `[stylesheet-path]`
- [ ] T008 Confirm mock data includes estimated time and estimated cost fields

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - [Title] (Priority: P1) MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for recommendation matching in `tests/[test-file]`
- [ ] T010 [P] [US1] Unit test for localStorage behavior in `tests/[test-file]`

### Implementation for User Story 1

- [ ] T011 [P] [US1] Build or update input controls in `src/components/[form-component]`
- [ ] T012 [P] [US1] Build or update recommendation result UI in `src/components/[result-component]`
- [ ] T013 [US1] Connect form state, recommendation logic, and result rendering in `src/App.[jsx|tsx]`
- [ ] T014 [US1] Ensure the result displays estimated time and estimated cost
- [ ] T015 [US1] Add empty/no-match state that explains the constraint conflict

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested)

- [ ] T016 [P] [US2] Unit test for [behavior] in `tests/[test-file]`

### Implementation for User Story 2

- [ ] T017 [P] [US2] Update [component/helper] in `[exact-path]`
- [ ] T018 [US2] Integrate with the primary recommendation flow without adding server or API dependencies
- [ ] T019 [US2] Confirm time and cost remain visible after the new interaction

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested)

- [ ] T020 [P] [US3] Unit test for [behavior] in `tests/[test-file]`

### Implementation for User Story 3

- [ ] T021 [P] [US3] Update [component/helper] in `[exact-path]`
- [ ] T022 [US3] Preserve local-only state and beginner-readable file placement

**Checkpoint**: All selected user stories work independently.

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] TXXX [P] Documentation updates in docs/ or README.md if present
- [ ] TXXX Code cleanup that keeps the file structure beginner-readable
- [ ] TXXX Responsive pass for mobile and desktop layouts
- [ ] TXXX [P] Additional unit tests (if requested) in `tests/` or `src/__tests__/`
- [ ] TXXX Dependency audit: confirm no unplanned runtime libraries were added
- [ ] TXXX Run the local app and complete browser verification on mobile and desktop viewports
- [ ] TXXX Run quickstart.md validation if quickstart.md exists

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel if they touch different files
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but must remain independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but must remain independently testable

### Within Each User Story

- Tests, if included, MUST be written and fail before implementation
- Mock data and helpers before components that consume them
- Components before app-level integration
- Core implementation before responsive polish
- Story complete before moving to the next priority unless plan.md says otherwise

### Parallel Opportunities

- Setup tasks marked [P] can run in parallel
- Foundational tasks marked [P] can run in parallel when they touch different files
- Tests for a user story marked [P] can run in parallel
- Components and helpers marked [P] can run in parallel
- Different user stories can be worked on in parallel only when file ownership is clear

---

## Parallel Example: User Story 1

```bash
# Launch optional tests for User Story 1 together:
Task: "Unit test for recommendation matching in tests/[test-file]"
Task: "Unit test for localStorage behavior in tests/[test-file]"

# Launch independent UI/helper tasks together:
Task: "Build input controls in src/components/[form-component]"
Task: "Build recommendation result UI in src/components/[result-component]"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: Test User Story 1 independently in the browser
5. Demo if mobile and desktop browser checks pass

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test independently -> Browser demo
3. Add User Story 2 -> Test independently -> Browser demo
4. Add User Story 3 -> Test independently -> Browser demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story must be independently completable and testable
- Verify optional tests fail before implementing
- Commit after each task or logical group when the workflow requests commits
- Stop at each checkpoint to validate the story independently
- Avoid vague tasks, same-file conflicts, server/API scope creep, and hidden dependencies
