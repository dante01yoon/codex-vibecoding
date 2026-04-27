# Decision Log

## Decisions

### Use plain HTML, CSS, and JavaScript

Reason:

- The goal of this lesson is context engineering, not framework setup.
- A static app keeps the demo beginner-friendly.

### Use localStorage

Reason:

- Persistence can be demonstrated without backend setup.
- It is enough for the first version.

### Exclude login, backend, notifications, and deployment

Reason:

- These features would make the first implementation too large.
- They distract from Write, Select, Compress, and Isolate.

### Create the first version as three static app files

Reason:

- `index.html`, `styles.css`, and `script.js` keep the project beginner-friendly.
- The structure is easy to explain in a lesson.
- No build step or dev server is required for the first version.

### Use one localStorage key for v1 state

Reason:

- The app only needs to store one focus goal and one task list.
- A single key keeps the persistence logic simple.
- The data shape can be expanded later if new features are added.

Implementation note:

- Current key: `today-board-state-v1`

### Use browser local date formatting

Reason:

- The first version does not need timezone settings or calendar logic.
- Browser-local date display is enough for a daily personal board.

### Use headless Chrome for implementation verification

Reason:

- It confirms the app runs in a real browser engine.
- It verifies localStorage persistence, task interactions, and mobile overflow without adding test dependencies.

### Keep v1 feature scope small

Reason:

- The goal is a calm first version, not a full productivity system.
- Filters, clear-completed, export, notifications, login, backend, and deployment remain future candidates.

## Open Questions

- Should the next version add task filters?
- Should users be able to clear all completed tasks?
- Should the app support exporting the day as text?
