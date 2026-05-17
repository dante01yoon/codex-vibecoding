# Data Model: 미니 코스 추천

## UserPreference

Represents the user's selected recommendation conditions.

**Fields**:

- `mood`: one of 4 fixed mood options
- `timeLimitMinutes`: one of 3 fixed time options
- `budgetLimitWon`: one of 3 fixed budget options
- `companion`: one of 2 fixed options: `solo` or `with-companion`

**Validation rules**:

- All four fields are required before recommendation.
- Values must come from the fixed option lists shown by the form.

## MiniCourse

Represents one locally defined recommendation candidate.

**Fields**:

- `id`: stable unique identifier
- `title`: visible course name
- `moods`: list of mood options this course supports
- `companionOptions`: list of companion options this course supports
- `activities`: ordered list of activities
- `whyItFits`: short visible explanation for the match

**Derived values**:

- `totalMinutes`: sum of activity minutes
- `totalCostWon`: sum of activity costs

**Validation rules**:

- Must contain at least one activity.
- `totalMinutes` must be less than or equal to the selected `timeLimitMinutes` to match.
- `totalCostWon` must be less than or equal to the selected `budgetLimitWon` to match.
- Must include the selected mood and selected companion option to match.

## Activity

Represents one step in a mini course.

**Fields**:

- `name`: visible activity label
- `minutes`: estimated time in minutes
- `costWon`: estimated cost in Korean won

**Validation rules**:

- `minutes` must be greater than 0.
- `costWon` must be 0 or greater.
- Activity labels should be short enough to remain readable on mobile.

## RecommendationResult

Represents the outcome of a recommendation request.

**Fields**:

- `preference`: the selected `UserPreference`
- `course`: the selected `MiniCourse`, or empty when no match exists
- `matchedAt`: timestamp-like display value or local record value for the latest result
- `reason`: visible explanation for why the recommendation fits

**Selection rules**:

1. Filter courses that match mood and companion option.
2. Remove courses whose total time exceeds the selected time limit.
3. Remove courses whose total cost exceeds the selected budget limit.
4. If no course remains, return a no-match result.
5. If multiple courses remain, choose the course with the lowest total cost.
6. If total cost is tied, choose the course with the shortest total time.
7. If total cost and total time are still tied, choose the first matching course in `mockQuests.js`.

## RecentRecommendation

Represents the latest recommendation restored from the same browser.

**Fields**:

- `preference`: selected conditions from the latest successful recommendation
- `courseSummary`: course title, total time, total cost, and fit reason
- `activities`: activity names with estimated time and cost

**Lifecycle**:

- Empty on first visit or when stored data cannot be read.
- Created after a successful recommendation.
- Replaced whenever a new successful recommendation is created.
- Ignored if stored data is malformed, so the main recommendation flow still works.

## UI State Transitions

```text
First visit
  -> no current result, maybe no recent recommendation

Complete required inputs
  -> ready to request recommendation

Request recommendation with match
  -> show RecommendationResult
  -> save RecentRecommendation

Request recommendation without match
  -> show "정확히 맞는 코스 없음"
  -> do not replace the latest successful RecentRecommendation

Change any input and request again
  -> replace current result or empty state with the new outcome
```
