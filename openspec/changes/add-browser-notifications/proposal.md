## Why
Users miss important moments when not actively watching the page. Opt-in browser notifications improve awareness of Dutch medals and live events.

## What Changes
- Add opt-in notification setting.
- Notify when NL medal counts increase.
- Notify when an event transitions to live.
- Deduplicate repeated notifications across refresh cycles.

## Capabilities
### New Capabilities
- `nl-event-medal-notifications`: Browser notifications for Dutch medal and live-event deltas.

### Modified Capabilities
- None.

## Impact
- Affected code: new notification service and homepage query-delta observers.
- LocalStorage key: `notifications_enabled_v1` and dedupe keys.
