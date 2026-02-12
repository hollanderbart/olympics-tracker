## Why
When source parsing fails or fallback chains activate, diagnosing failures is slow without structured client telemetry.

## What Changes
- Add lightweight client logger wrapper with stable event names.
- Emit fetch/parse/fallback telemetry with metadata.
- Gate verbose logging via environment flag.

## Capabilities
### New Capabilities
- `client-fetch-telemetry`: Structured client-side telemetry for fetch attempts, outcomes, and fallback paths.

### Modified Capabilities
- None.

## Impact
- Affected code: `lib/telemetry/logger.ts`, olympics fetch modules.
- New env flag: `NEXT_PUBLIC_DEBUG_TELEMETRY`.
