# Action card — context

## Purpose

Full data-recording form card: lets the user pick a time, add a color-coded message, choose related entities/areas/devices, and submit to `hass_datapoints.record_event`. The main entrypoint is [`action.ts`](action.ts).

## State & data flow

- Config-supplied targets are rendered as non-removable chip-group chips via `action-targets`.
- A `ha-selector` (target schema) lets the user add extra targets per submission; it resets to empty after each successful record.
- On submit, config targets and user-selected targets are merged into a single `PartialTargetMap`.
- Feedback state (`_feedbackClass`, `_feedbackText`, `_feedbackVisible`) drives a `feedback-banner` to show success/error after the service call.
- Color state (`_color`) is initialised from the config default and can be changed via `color-swatch`; it is not persisted between sessions.

## External dependencies

- `hass.callService("hass_datapoints", "record_event", ...)` for the actual write.
- `color-swatch` atom for the interactive color chip.
- `action-targets` molecule for the target chip UI.

## Non-obvious behaviors

- **Related-items UI pattern**: the config sets a permanent target list (shown as locked chips); the selector adds ephemeral per-recording targets. They are kept separate until the submit payload is assembled.
- After a successful submission, the extra-targets selector is cleared and the annotation input is reset, but the color is preserved.

## Conventions

- The editor (`editor.ts`) extends `EditorBase`; it handles `dp-change` events from all form atoms via a single dispatcher pattern.
- Do not merge config-set and user-selected targets at the state level — keep them separate until submit time.
