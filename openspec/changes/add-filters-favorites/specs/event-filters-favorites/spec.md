## ADDED Requirements

### Requirement: Event list SHALL support sport and status filters
The UI SHALL allow users to filter events by sport and by status (`live`, `upcoming`, `completed`, `all`).

#### Scenario: Status filter applied
- **WHEN** user selects `upcoming`
- **THEN** only events with `status=upcoming` are visible

### Requirement: Favorites SHALL persist locally across reloads
Users SHALL be able to mark/unmark events as favorites, and favorite state SHALL persist in local storage between sessions.

#### Scenario: Reload after favoriting
- **WHEN** user favorites an event and reloads the page
- **THEN** the same event remains marked as favorite

### Requirement: Favorites-only mode SHALL limit visible events
The UI SHALL provide a favorites-only control that hides non-favorite events.

#### Scenario: Favorites-only enabled
- **WHEN** favorites-only mode is turned on
- **THEN** only events marked favorite are displayed
