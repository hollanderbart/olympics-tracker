## ADDED Requirements

### Requirement: Interactive controls SHALL be keyboard accessible
All clickable non-link controls SHALL use semantic button elements or equivalent keyboard-operable semantics.

#### Scenario: Keyboard activation
- **WHEN** user tabs to an interactive control and presses Enter or Space
- **THEN** the same action occurs as pointer click

### Requirement: Critical non-text controls SHALL include accessible names
Controls represented primarily by iconography SHALL expose descriptive accessible labels.

#### Scenario: Screen reader traversal
- **WHEN** a screen reader user navigates medal controls
- **THEN** each control announces a meaningful name and purpose

### Requirement: Reduced-motion preference SHALL suppress high-motion effects
When user preference is `prefers-reduced-motion: reduce`, confetti and other high-motion decorative animations SHALL be disabled or significantly reduced.

#### Scenario: Reduced motion enabled
- **WHEN** OS/browser reduced-motion preference is on
- **THEN** confetti trigger does not launch standard animation burst
