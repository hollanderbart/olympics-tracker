## ADDED Requirements

### Requirement: Long lists SHALL use virtualization
The application SHALL render virtualized rows when event or medal list size exceeds the configured threshold.

#### Scenario: More than threshold items
- **WHEN** list item count is greater than 30
- **THEN** virtualization renderer is used for that list

### Requirement: Small lists SHALL render fully
The application SHALL keep regular non-virtualized rendering for small lists to preserve simple layout behavior.

#### Scenario: At or below threshold
- **WHEN** list item count is 30 or fewer
- **THEN** standard mapped row rendering is used

### Requirement: Derived list transforms SHALL be memoized
Filtering, sorting, and favorites projections SHALL be memoized to avoid unnecessary recomputation.

#### Scenario: Unrelated state update
- **WHEN** unrelated UI state changes without list input changes
- **THEN** derived event list reference remains stable
