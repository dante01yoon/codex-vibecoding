# UI Contract: 미니 코스 추천

This feature has no external API contract. The contract below defines the browser-visible behavior that implementation must satisfy.

## Input Form

The form must show four required groups:

- Mood: 4 fixed options
- Available time: 3 fixed options
- Budget: 3 fixed options
- Companion: 2 fixed options

Contract:

- A user can select exactly one option in each group.
- The recommendation action is available from the same screen as the inputs.
- If the user requests a recommendation before choosing all groups, the UI identifies missing groups.

## Recommendation Result

When a match exists, the result must show:

- Course title
- Reason the course fits the selected conditions
- Total estimated time
- Total estimated cost
- Activity list, with each activity showing estimated time and estimated cost

Selection contract:

- The course must satisfy all selected conditions.
- If multiple courses satisfy all selected conditions, show the lowest total cost course.
- If total cost is tied, show the shorter total time course.
- If total cost and time are tied, show the first matching local mock course.

## Empty State

When no course satisfies all selected conditions, the UI must show:

- The phrase `정확히 맞는 코스 없음`
- Guidance to broaden time or budget
- A way for the user to adjust inputs and try again without leaving the page

## Recent Recommendation

When a user has a stored recent recommendation in the same browser, the UI must show the latest one with:

- Selected conditions
- Course summary
- Activity-level time and cost

Contract:

- Store only the latest successful recommendation.
- Replace the stored recommendation after each new successful recommendation.
- Do not block the main recommendation flow if stored data is missing, unavailable, or malformed.

## Responsive Behavior

Mobile contract:

- Input groups stack vertically.
- Recommendation and recent result sections remain readable without horizontal scrolling.
- Long labels wrap without overlapping time/cost values.

Desktop contract:

- The page may use a wider layout, but the primary flow remains visible and scannable.
- Result and recent result sections must not depend on fixed desktop-only widths.

## Browser Verification Contract

Before implementation is considered complete:

- Run the app locally.
- Verify the primary match flow.
- Verify the no-match flow.
- Verify recent recommendation persistence in the same browser.
- Verify one mobile viewport and one desktop viewport.
