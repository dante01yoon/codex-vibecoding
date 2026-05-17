# Tasks: 미니 코스 추천

**Input**: Design documents from `specs/001-mini-course-recommendation/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Tests**: Automated tests are not requested for this MVP. Browser verification tasks are included because the feature is user-visible and the constitution requires mobile and desktop checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified as an independent increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the smallest readable React + Vite app baseline.

- [X] T001 Create React + Vite package scripts and baseline dependencies in `package.json`
- [X] T002 Create the Vite HTML root element in `index.html`
- [X] T003 Create the React entry point that renders the app in `src/main.jsx`
- [X] T004 Create the beginner-readable app shell and stylesheet entry in `src/App.jsx` and `src/App.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared local data, recommendation, storage, and responsive style foundations that must exist before user story UI work begins.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Create fixed input option constants and readable mock mini course data in `src/data/mockQuests.js`
- [X] T006 Implement deterministic recommendation filtering and tie-breakers in `src/lib/recommendQuest.js`
- [X] T007 [P] Implement latest-only `localStorage` read/write helpers with safe fallback behavior in `src/lib/storage.js`
- [X] T008 [P] Define mobile-first base layout, spacing, and reusable responsive card styles in `src/App.css`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - 조건을 선택해 바로 미니 코스를 받기 (Priority: P1)

**Goal**: Users choose mood, time, budget, and companion status and receive one matching mini course from local mock data.

**Independent Test**: Select all four required conditions, request a recommendation, and confirm one matching course with a course title, fit reason, and activity list appears on the same page.

### Implementation for User Story 1

- [X] T009 [P] [US1] Build the fixed-choice input form and missing-field messages in `src/components/QuestForm.jsx`
- [X] T010 [P] [US1] Build the base recommendation card with course title, fit reason, and activity list in `src/components/RecommendationCard.jsx`
- [X] T011 [US1] Wire preference state, required-field validation, recommendation request, and current result state in `src/App.jsx`
- [X] T012 [US1] Connect `QuestForm` and `RecommendationCard` into the primary page flow in `src/App.jsx`

**Checkpoint**: User Story 1 can be demonstrated independently, but the production MVP must continue through User Story 2 because time and cost visibility is constitutional.

---

## Phase 4: User Story 2 - 시간과 비용을 보고 실행 가능 여부 판단하기 (Priority: P2)

**Goal**: Users can decide whether the recommendation is realistic by seeing total and activity-level estimated time and cost.

**Independent Test**: Generate a recommendation and confirm the result shows total estimated time, total estimated cost, and each activity's estimated time and estimated cost without opening another screen.

### Implementation for User Story 2

- [X] T013 [US2] Extend the recommendation card to show total estimated time and total estimated cost in `src/components/RecommendationCard.jsx`
- [X] T014 [US2] Extend the recommendation card to show each activity's estimated time and estimated cost in `src/components/RecommendationCard.jsx`
- [X] T015 [US2] Add readable time/cost alignment, wrapping, and compact mobile styles in `src/App.css`

**Checkpoint**: User Stories 1 and 2 together form the minimum constitution-compliant MVP recommendation flow.

---

## Phase 5: User Story 3 - 조건에 맞는 추천이 없을 때 이유를 이해하기 (Priority: P3)

**Goal**: Users understand when no exact recommendation exists and can adjust time or budget without leaving the page.

**Independent Test**: Choose an input combination with no matching mock course, request a recommendation, and confirm `정확히 맞는 코스 없음` plus time/budget guidance appears; then adjust inputs and request again.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create the no-match empty state with `정확히 맞는 코스 없음` and time/budget guidance in `src/components/EmptyState.jsx`
- [X] T017 [US3] Return and render no-match outcomes without replacing a valid latest recommendation in `src/App.jsx`
- [X] T018 [US3] Ensure mock data supports at least one manually verifiable no-match input combination in `src/data/mockQuests.js`

**Checkpoint**: Empty state behavior works independently and does not break successful recommendations.

---

## Phase 6: User Story 4 - 최근 추천 결과 다시 보기 (Priority: P3)

**Goal**: Users can revisit the app in the same browser and see the most recent successful recommendation.

**Independent Test**: Create a successful recommendation, refresh the browser, and confirm the latest recommendation appears with selected conditions, course summary, and activity-level time/cost; create another successful recommendation and confirm it replaces the previous one.

### Implementation for User Story 4

- [X] T019 [P] [US4] Build the recent recommendation view with selected conditions, course summary, and activity time/cost in `src/components/RecentRecommendation.jsx`
- [X] T020 [US4] Save only the latest successful recommendation through the storage helper in `src/App.jsx`
- [X] T021 [US4] Restore the latest recommendation on first render and ignore missing or malformed saved data in `src/App.jsx`
- [X] T022 [US4] Add responsive recent recommendation section styles in `src/App.css`

**Checkpoint**: Recent recommendation persistence works in the same browser and stays latest-only.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify the complete local-only UI and keep the implementation beginner-readable.

- [X] T023 Review `package.json`, `src/App.jsx`, `src/lib/recommendQuest.js`, and `src/lib/storage.js` to confirm there are no unplanned runtime libraries, external API calls, login flows, or server-owned state
- [X] T024 Run `npm run build` and fix any build blockers in `package.json`, `src/main.jsx`, and `src/App.jsx`
- [X] T025 Run `npm run dev` and complete the primary recommendation, no-match, and recent recommendation browser checks from `specs/001-mini-course-recommendation/quickstart.md`
- [X] T026 Verify mobile `390px` and desktop `1280px` layouts and adjust responsive behavior in `src/App.css`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion.
- **User Story 2 (Phase 4)**: Depends on User Story 1 because it extends the result card and completes the visible time/cost output.
- **User Story 3 (Phase 5)**: Depends on Foundational and can be implemented after US1 integration is available.
- **User Story 4 (Phase 6)**: Depends on User Story 1 and the storage helper from Foundational.
- **Polish (Phase 7)**: Depends on all selected user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Core input and recommendation flow; no dependency on other user stories after Foundational.
- **US2 (P2)**: Extends US1 result UI; required for the constitution-compliant MVP.
- **US3 (P3)**: Adds no-match handling; can start after US1 state integration is in place.
- **US4 (P3)**: Adds latest recommendation persistence; can start after US1 result creation exists.

### Implementation Order

1. Complete Setup.
2. Complete Foundational.
3. Complete US1.
4. Complete US2 and validate the minimum constitution-compliant MVP.
5. Complete US3 and US4 in either order.
6. Complete Polish verification.

---

## Parallel Opportunities

- T007 and T008 can run in parallel after T001-T004 because they touch different files.
- T009 and T010 can run in parallel after Foundational because the form and result card are separate components.
- T016 can run in parallel with US2 work because it creates a separate component, but T017 waits for `src/App.jsx` integration.
- T019 can run in parallel with US3 component work because it creates a separate component, but T020-T021 wait for `src/App.jsx` integration.

## Parallel Example: User Story 1

```text
Task: "T009 Build the fixed-choice input form and missing-field messages in src/components/QuestForm.jsx"
Task: "T010 Build the base recommendation card with course title, fit reason, and activity list in src/components/RecommendationCard.jsx"
```

## Parallel Example: User Stories 3 and 4 Component Work

```text
Task: "T016 Create the no-match empty state in src/components/EmptyState.jsx"
Task: "T019 Build the recent recommendation view in src/components/RecentRecommendation.jsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Complete Phase 4: User Story 2.
5. Stop and validate: one successful recommendation shows course, reason, total time/cost, and activity-level time/cost in the browser.

### Incremental Delivery

1. Add US1 to make the app recommend one matching course.
2. Add US2 to make the recommendation decision-ready with visible time and cost.
3. Add US3 to make no-match cases useful.
4. Add US4 to restore the latest successful recommendation.
5. Run cross-cutting build and browser verification.

### Validation Notes

- Do not add automated test dependencies unless a later task explicitly changes the plan.
- Keep every implementation file shallow and named by responsibility.
- Keep recent recommendation behavior latest-only, despite the earlier planning prompt mentioning three recommendations.
- Treat missing time/cost output, skipped mobile/desktop browser checks, or server/API scope creep as blockers.
