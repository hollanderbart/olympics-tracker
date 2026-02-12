## ADDED Requirements

### Requirement: Summary card SHALL present next Team NL event
The homepage SHALL render a summary card showing the next upcoming or live Dutch event with human-readable label and time.

#### Scenario: Upcoming event available
- **WHEN** at least one Dutch event is upcoming
- **THEN** card displays that event as next with date/time context

### Requirement: Summary card SHALL present countdown
The summary card SHALL display a countdown to the next event start and update over time.

#### Scenario: Countdown display
- **WHEN** next event has a future start timestamp
- **THEN** card shows a decreasing countdown in Dutch-friendly format

### Requirement: Latest medal update SHALL be conditionally shown
If recent medal change data is available, the summary card SHALL display a compact latest-update text; otherwise it SHALL omit that section.

#### Scenario: No medal-change payload
- **WHEN** there is no latest medal update in view-model
- **THEN** card renders without medal-update row and remains visually complete
