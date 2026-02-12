## ADDED Requirements

### Requirement: Notifications SHALL be explicit opt-in
The application SHALL default notifications to disabled and SHALL require explicit user opt-in before sending any browser notification.

#### Scenario: Default install state
- **WHEN** a first-time user opens the app
- **THEN** notification setting is disabled and no notification is fired

### Requirement: Medal increase SHALL emit one notification
The system SHALL compare prior and current Dutch medal counts and emit one notification when any medal bucket increases.

#### Scenario: Gold count increments
- **WHEN** Dutch gold count increases between polling intervals
- **THEN** exactly one medal-update notification is shown

### Requirement: Live transition SHALL emit one notification per event
The system SHALL detect event status transitions to `live` and notify once per event transition.

#### Scenario: Upcoming to live transition
- **WHEN** an event changes from `upcoming` to `live`
- **THEN** one live-event notification is shown and duplicates are suppressed
