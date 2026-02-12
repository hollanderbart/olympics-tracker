## Why
Core reliability depends on fallback chains, cache behavior, and time-sensitive status logic. Current coverage leaves regressions hard to catch early.

## What Changes
- Expand deterministic unit and integration tests for data source fallback chains.
- Add stale/offline cache behavior coverage.
- Add page-level tests for loading, retry, and offline indicators.

## Capabilities
### New Capabilities
- `critical-data-flow-tests`: Deterministic test coverage for medal/event data paths and cache fallback behavior.

### Modified Capabilities
- None.

## Impact
- Affected code: Jest test suites in `lib/` and `app/page/`.
- No runtime behavior changes.
