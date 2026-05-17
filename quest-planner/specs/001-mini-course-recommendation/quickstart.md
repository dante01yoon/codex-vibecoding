# Quickstart: 미니 코스 추천

## Setup

If the React + Vite app has not been scaffolded yet, create it in the project root:

```bash
npm create vite@latest . -- --template react
```

Install dependencies:

```bash
npm install
```

Do not install additional UI, routing, state, API, or storage libraries for this MVP.

## Run Locally

```bash
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Build Check

```bash
npm run build
```

Optional local production preview:

```bash
npm run preview
```

## Manual Browser Verification

### Primary Recommendation Flow

1. Select one mood, one time limit, one budget, and one companion option.
2. Request a recommendation.
3. Confirm one mini course appears.
4. Confirm the course shows total estimated time and total estimated cost.
5. Confirm every activity shows estimated time and estimated cost.

### Tie-Breaking Flow

1. Use a mock data case where multiple courses match.
2. Confirm the lowest total cost course is selected.
3. If cost is tied, confirm the shorter total time course is selected.

### No-Match Flow

1. Choose a condition combination that has no matching mock course.
2. Confirm the UI shows `정확히 맞는 코스 없음`.
3. Confirm the UI suggests broadening time or budget.
4. Adjust inputs and confirm a new recommendation or no-match state replaces the previous state.

### Recent Recommendation Flow

1. Create a successful recommendation.
2. Refresh the browser.
3. Confirm the latest recommendation appears with selected conditions, course summary, and activity-level time/cost.
4. Create another successful recommendation.
5. Refresh again and confirm only the latest recommendation is shown.

### Responsive Flow

Check at least:

- Mobile viewport around `390px` wide
- Desktop viewport around `1280px` wide

Confirm:

- Inputs do not overflow.
- Result and recent recommendation text does not overlap.
- Time and cost remain visible.
- Long activity names wrap cleanly.
