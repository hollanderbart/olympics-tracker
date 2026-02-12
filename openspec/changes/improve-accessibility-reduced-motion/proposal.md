## Why
Interactive elements and animations must be usable for keyboard and assistive-technology users, and motion-heavy effects can negatively impact motion-sensitive users.

## What Changes
- Ensure interactive controls are semantic and keyboard-operable.
- Add ARIA labels and live regions for important status updates.
- Respect `prefers-reduced-motion` by reducing or disabling confetti/animations.

## Capabilities
### New Capabilities
- `accessibility-reduced-motion`: Baseline accessibility semantics and reduced-motion behavior across interactive UI.

### Modified Capabilities
- None.

## Impact
- Affected code: medal controls, list controls, confetti triggers, shared UI utilities.
