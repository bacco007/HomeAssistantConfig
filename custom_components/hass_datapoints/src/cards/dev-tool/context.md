# Dev-tool card — context

## Purpose

Developer/testing card for inspecting raw datapoints API responses across configurable time windows. Not intended for end-user dashboards — it exposes raw JSON results and a bulk-delete operation. The main entrypoint is [`dev-tool.ts`](dev-tool.ts).

## State & data flow

- `_entities` is the flat list of entity IDs derived from the config target.
- `_results` holds `WindowResult[]`, one entry per configured window, populated after running the analysis.
- `_analyzing` and `_deleting` flags drive loading states in the UI.
- Results are computed on demand (user presses "Analyze") rather than on config/hass update.

## External dependencies

- Multiple raw `hass.callWS` calls to the `hass_datapoints` websocket API for per-window analysis.
- `dev-tool-results` molecule for the JSON result display.
- `dev-tool-windows` molecule for the window configuration UI.
- `confirmDestructiveAction` for the bulk-delete confirmation dialog.

## Non-obvious behaviors

- The bulk-delete operation calls `hass_datapoints.delete_events` for each entity in `_entities` — this is irreversible. The delete confirmation text should always name the target entities.
- `_devCount` is a running counter of API calls made in this card session, shown for debugging purposes.
- Analysis results are not persisted; they are cleared on each new "Analyze" run.

## Conventions

- This card is intentionally underdeveloped — it exists as an internal debugging aid, not a polished UI. Avoid adding user-facing features here.
- The editor (`editor.ts`) is a minimal class that registers only entity and window config.
