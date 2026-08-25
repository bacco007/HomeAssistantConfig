# Quick card — context

## Purpose

Minimal one-tap recording card: a text input for a short annotation and a submit button. Designed for dashboards where low friction matters more than detail. The main entrypoint is [`quick.ts`](quick.ts).

## State & data flow

- Config supplies entities/areas/devices as targets; the user only provides the annotation text.
- `_annotation` holds the current text input value.
- Feedback state (`_feedbackClass`, `_feedbackText`, `_feedbackVisible`) drives `feedback-banner`.
- On submit the annotation field is cleared; no color or target selection is exposed in this card.

## External dependencies

- `hass.callService("hass_datapoints", "record_event", ...)` for the write.
- `feedback-banner` atom for submit feedback.
- `quick-annotation` molecule for the annotation input UI.

## Non-obvious behaviors

- `resolveEntityIdsFromTarget` is used to flatten the config target into entity IDs before calling the service — entity IDs, area IDs, and device IDs can all appear in the target config.
- Keyboard shortcut: pressing Enter in the annotation field triggers submit.

## Conventions

- Keep this card intentionally minimal — do not add color pickers, target selectors, or other controls. If those features are needed use the action card instead.
- The editor is in `editor.ts` and extends `EditorBase`.
