# Annotation Dialog — context

## Purpose

Owns the history-chart "Create data point" modal as an imperative controller rather than a Lit component. It builds the dialog markup on demand, prefills it from chart hover state, and submits the final annotation through the backend `record` service.

## State & data flow

- State lives on the controller instance: `_linkedTarget` for chart-derived defaults and `_target` for user-added selector values.
- `open()` renders the dialog from the hover snapshot, then `bindFields()` wires the target selector, chip row, color preview, and submit/cancel actions.
- `submit()` reads the current DOM field values directly, merges linked and manually selected targets, and calls `hass.callService(DOMAIN, "record", payload)`.

## External dependencies

- Home Assistant dialog/button/selector/icon-picker elements are injected directly into the host shadow root.
- `annotation-chip-row` is mounted into a placeholder div for linked target display/removal.
- `invalidateEventsCache()` and the global `hass-datapoints-event-recorded` window event keep the rest of the UI in sync after save.

## Non-obvious behaviors

- The message and date controls intentionally use native `<input>` elements instead of `ha-textfield`. This dialog is rendered via `innerHTML` into an imperative panel, and native inputs avoid timing/upgrade issues where unregistered HA textfields can render as missing controls.
- Linked targets are split into two buckets: defaults inferred from visible chart series and additional selections from the target selector. The chip row always shows the merged view, but removing a chip only affects the linked-default side when it originated there.
