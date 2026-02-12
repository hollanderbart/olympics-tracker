## Why
Users currently experience blank or unclear states while data is loading or when requests fail. This reduces trust and makes recovery difficult.

## What Changes
- Add skeleton UI for medal overview, next event highlight, and event list.
- Add explicit error panels with retry actions for medals and events requests.
- Distinguish "games not started" state from true fetch failure state.

## Capabilities
### New Capabilities
- `loading-error-ux`: Predictable loading placeholders and actionable error handling across core homepage sections.

### Modified Capabilities
- None.

## Impact
- Affected code: `app/page.tsx`, `components/*Skeleton*.tsx`, query state handling in page-level containers.
- No API contract changes.
