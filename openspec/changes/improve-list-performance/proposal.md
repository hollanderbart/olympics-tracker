## Why
As list size grows, rendering all rows and recomputing derived lists on each render impacts responsiveness, especially on mobile.

## What Changes
- Memoize expensive derived list operations.
- Add conditional virtualization for long event/tally lists.
- Keep non-virtualized rendering for small lists to reduce complexity.

## Capabilities
### New Capabilities
- `event-list-performance`: Conditional virtualization and memoized list derivations for smooth interaction.

### Modified Capabilities
- None.

## Impact
- Affected code: list rendering components and view-model derivation utilities.
- New dependency: `react-window` (or equivalent virtualization library).
