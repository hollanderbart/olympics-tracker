## ADDED Requirements

### Requirement: Fallback source order SHALL be covered by tests
The test suite SHALL verify medal data fallback order and outcomes for source success/failure combinations.

#### Scenario: Primary source fails, secondary succeeds
- **WHEN** page scrape fails and JSON source succeeds
- **THEN** tests assert successful parse and expected source selection

### Requirement: Offline cache behavior SHALL be covered by tests
The test suite SHALL verify cached-data serving behavior on network failure, including stale metadata exposure.

#### Scenario: Network failure with valid cache
- **WHEN** live fetch fails and cache exists
- **THEN** tests assert cached payload returned with cache metadata and offline indicator conditions

### Requirement: Loading and retry UX SHALL be covered by tests
The test suite SHALL verify skeleton display during pending state and query retry invocation from error panels.

#### Scenario: Retry after error
- **WHEN** user clicks retry in an error panel
- **THEN** the associated query refetch function is called
