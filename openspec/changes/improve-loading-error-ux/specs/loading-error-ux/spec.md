## ADDED Requirements

### Requirement: Section skeletons SHALL render during async fetches
The homepage SHALL render skeleton placeholders for medal overview, next event, and event list while corresponding queries are pending.

#### Scenario: Initial page load
- **WHEN** the page renders and data queries are still pending
- **THEN** skeleton components are shown instead of empty sections

### Requirement: Error panels SHALL provide retry actions
The homepage SHALL show a clear error panel with a retry action when a medals or events query fails without valid fallback data.

#### Scenario: Events fetch failure
- **WHEN** events query fails and no cache/fallback data is available
- **THEN** the user sees an error panel and can trigger a new fetch with a retry control

### Requirement: Games-not-started state SHALL be distinct from network failures
The system SHALL present a dedicated pre-games message when no medal data exists due to competition not yet started, and SHALL not label this as network failure.

#### Scenario: Pre-games period
- **WHEN** medal source returns empty standings without transport error
- **THEN** UI shows a pre-games informational state instead of a generic error state
