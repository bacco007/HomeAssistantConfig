# Datapoints panel — context

## Purpose

Owns the full Datapoints history page: target selection, range controls, comparison windows, chart/list composition, sidebar state, and panel-only overlays such as monitors and saved date windows. The main entrypoint is [`datapoints.ts`](/Users/ollie/Repos/HASS-Data-Points/custom_components/hass_datapoints/src/panels/datapoints/datapoints.ts).

## State & data flow

- Page state lives in the history-page context helpers and is exposed back through imperative getters/setters on `HassDatapointsHistoryPanel`.
- `panel-shell` owns only layout and menu events; `datapoints.ts` listens for those events and performs the real work.
- The main content area is mounted imperatively into `panel-shell` and uses a vertical `resizable-panes` split: chart first, records list second.
- Comparison windows, target rows, and saved-page state are treated as canonical panel state and then mirrored into the child controls/cards.

## External dependencies

- Home Assistant `hass` object and websocket APIs for panel data, monitor management, and anomaly queries.
- `hass-datapoints-history-card` for chart rendering and `hass-datapoints-list-card` for records.
- Local history-page helpers under `src/lib/history-page/` for persistence, URL/session state, and now the AI query brief builder.

## Non-obvious behaviors

- Dialog-style panel features are mounted directly on the panel shadow root rather than inside the slotted content area. This avoids layout coupling with the chart/list split and matches the existing date-window + monitor wizard pattern.
- The AI query brief is intentionally MCP-agnostic. The exported text names the data to fetch and the underlying `hass_datapoints` endpoint semantics, but it does not guess the receiving AI tool's exact Home Assistant MCP command names.
- Monitor context in the AI brief is best-effort only. Monitor websocket endpoints are admin-only, so non-admin users still get an entity/history/anomaly brief with an explicit note that monitor detail was omitted.

## Conventions

- Keep shell-level actions thin: add menu labels/events in `panel-shell`, then handle side effects in `datapoints.ts`.
- When a feature depends on committed panel state rather than child DOM, prefer building it from the panel's canonical state objects and lib helpers instead of reading from rendered subcomponents.
