## Why
Event lists become harder to scan as the schedule grows. Users need quick controls to focus by sport/status and save personal priorities.

## What Changes
- Add filters by sport and status.
- Add per-event favorite toggle with local persistence.
- Add favorites-only display mode.

## Capabilities
### New Capabilities
- `event-filters-favorites`: Client-side event filtering and persistent favorites management.

### Modified Capabilities
- None.

## Impact
- Affected code: `components/EventList.tsx`, page-level view-model derivation.
- LocalStorage key: `favorite_event_ids_v1`.
