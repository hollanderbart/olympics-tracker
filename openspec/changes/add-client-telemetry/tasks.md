## 1. Logger Foundation

- [ ] 1.1 Add typed telemetry logger utility with `info/warn/error`
- [ ] 1.2 Implement environment gating for verbose output

## 2. Instrumentation

- [ ] 2.1 Instrument medal fetch attempt/success/failure events
- [ ] 2.2 Instrument parse-failure and fallback-level events
- [ ] 2.3 Include metadata fields (`source`, `elapsedMs`, `rowsParsed`, `fallbackLevel`)

## 3. Validation

- [ ] 3.1 Add unit tests for logger gating behavior
- [ ] 3.2 Add instrumentation tests with logger mocks
