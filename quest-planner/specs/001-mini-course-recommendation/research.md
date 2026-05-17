# Research: 미니 코스 추천

## Decision: Use React + Vite baseline only

**Rationale**: The requested app is a client-only single page app. Vite's React template provides the standard local development, build, and preview workflow without extra routing or server features. This matches the constitution's local-only and minimal-dependency principles.

**Alternatives considered**:

- Plain static HTML/CSS/JavaScript: rejected because the user explicitly requested React + Vite.
- Next.js or another framework: rejected because server/routing features are unnecessary for this local-only MVP.
- Additional UI library: rejected because ordinary React components and CSS are enough and easier for beginners to understand.

## Decision: Keep recent recommendation storage to one item

**Rationale**: The active spec clarifies that the app stores the most recent recommendation 1건 with selected conditions, course summary, and activity-level time/cost. The plan prompt mentioned three recent recommendations, but following that would conflict with `FR-014`, `FR-015`, and the clarified v1 scope.

**Alternatives considered**:

- Store three recent recommendations: rejected for this plan because it changes the accepted spec and adds list-management behavior.
- Store no recent recommendation: rejected because the spec requires same-browser recall of the latest recommendation.
- Store only the course title: rejected because the spec requires the selected conditions and activity-level time/cost.

## Decision: Use deterministic recommendation rules

**Rationale**: The recommendation must be explainable from local mock data. The rule is: filter courses that satisfy mood, time, budget, and companion status; if multiple courses match, choose the lowest total cost; if still tied, choose the shortest total time. If still tied after those two checks, choose the first matching course in the mock data file to keep behavior stable.

**Alternatives considered**:

- Random recommendation: rejected because it is harder to test and explain.
- Show multiple recommendations: rejected because the spec asks for one primary recommendation.
- Weighted scoring: rejected because it adds hidden complexity for a beginner-facing demo.

## Decision: Use local mock data shaped for manual validation

**Rationale**: The mock data should include enough courses to verify successful matches, no-match states, budget filtering, time filtering, companion filtering, and tie-breaking. Keeping this data in one file lets learners open and read the source of recommendations directly.

**Alternatives considered**:

- External recommendation API: rejected by scope.
- Generated data at runtime: rejected because deterministic examples are easier to explain and verify.
- Large fixture set: rejected because this MVP needs a readable teaching dataset, not coverage of a real city catalog.

## Decision: Use `App.jsx` for orchestration and small named components for UI

**Rationale**: React's official guidance supports organizing components in separate files with imports/exports. For this beginner project, `App.jsx` can hold the small amount of app state while `QuestForm`, `RecommendationCard`, `RecentRecommendation`, and `EmptyState` keep the visible UI readable.

**Alternatives considered**:

- Global state library: rejected because the state is small and local.
- Context/reducer setup: rejected for v1 because it adds concepts without reducing complexity.
- Single large component: rejected because it makes the teaching flow harder to scan.

## Decision: Use ordinary CSS for responsive layout

**Rationale**: The constitution prefers the existing CSS approach unless a new UI dependency is justified. A small layout can use regular CSS with mobile-first stacking, constrained widths, flexible grids, and readable cards.

**Alternatives considered**:

- Tailwind or component library: rejected because a new dependency is unnecessary.
- Desktop-first fixed layout: rejected because the spec and constitution require mobile and desktop support.

## Decision: Verify with local browser checks instead of adding a test framework

**Rationale**: The feature's main risks are visible UI behavior, deterministic recommendation output, no-match messaging, and localStorage persistence. Manual browser checks plus `npm run build` are enough for the first plan and avoid adding teaching cost.

**Alternatives considered**:

- Add Vitest/Testing Library now: deferred because this would introduce new tools before the app exists.
- Skip build verification: rejected because Vite build is a low-cost quality gate.
