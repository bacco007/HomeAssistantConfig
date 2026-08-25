# Sensor card — context

## Purpose

Inline sensor card combining a spark-line chart with a paginated annotation event list. Designed for entity dashboard pages. The main entrypoint is [`sensor.ts`](sensor.ts).

## State & data flow

- `_annEvents` holds the fetched `EventRecordFull[]` for the configured entity.
- `_hiddenEventIds` is a `Set<string>` tracking which annotation markers are toggled off.
- `_recordsFooterHeight` is measured from the records list so the chart can size itself to fill remaining space.
- Events are fetched by `fetchEvents()` on hass update when the entity changes.
- Chart rendering is delegated to `sensor-chart`; annotation list rendering to `sensor-records`.

## External dependencies

- `fetchEvents` from `src/lib/data/events-api` for annotation data.
- `sensor-chart` molecule (inner element) for canvas chart rendering.
- `sensor-records` molecule for the scrollable annotation list.
- `sensor-header` molecule for the entity title and navigation link.
- `navigateToDataPointsHistory` to open full history panel.

## Non-obvious behaviors

- `_hiddenEventIds` is initialized from `_annEvents` on every load but can be mutated per user toggle — it is reset on each reload rather than persisted.
- `_recordsFooterHeight` is observed from a `ResizeObserver` on the records element so the chart can fill the remaining vertical space.
- Pagination state lives in the card, not in `sensor-records`, so page resets happen when the event list changes.

## Conventions

- The sensor card uses `static properties = {}` (old-style) rather than decorators — this is intentional for backwards compat with the existing card registration pattern.
- The editor (`editor.ts`) extends `EditorBase`.
