# History card — context

## Purpose

Renders the full HA lovelace history chart card: entity target selection, time range, zoom, comparison windows, annotations, and chart rendering. The main entrypoint is [`history.ts`](history.ts), which extends [`ChartCardBase`](../../charts/base/chart-card-base.ts).

## State & data flow

- `ChartCardBase` owns `hass`, `_config`, and the shared `setConfig` / `getCardSize` HA card lifecycle.
- `history.ts` adds its own reactive state: zoom range, annotation dialog state, comparison window results, hidden series, and hidden event IDs.
- The main load path (`_load()`) fetches history, statistics, and events in parallel with a `_loadRequestId` cancellation counter. Each sub-request resolves independently and calls `maybeDraw()` so the chart renders as soon as enough data is available — do not collapse this into a single awaited promise.
- The comparison window path (`_loadComparisonWindows()`) iterates windows and calls `_loadComparisonWindowData()` per window; results are written into `this._comparisonWindowData`.
- `history-chart` is constructed imperatively via `document.createElement` and assigned a `config` object; it is not rendered via `html` template. This is intentional — the chart must be created once and kept alive across re-renders.

## External dependencies

- `fetchHistoryDuringPeriod`, `fetchStatisticsDuringPeriod`, `fetchEvents` from `src/lib/data/` for backend calls.
- `HistoryAnnotationDialogController` for the annotation dialog lifecycle.
- `history-chart` (inner shadow element) for actual chart canvas rendering.
- `navigateToDataPointsHistory` to open the history panel from the card.

## Non-obvious behaviors

- **Cancellation pattern**: every call to `_load()` increments `this._loadRequestId`. Callbacks check if the ID still matches before writing state, preventing stale responses from overwriting newer ones.
- **Progressive draw**: `maybeDraw()` is called after each sub-request (hist, stats, events). The chart renders with partial data if enough is available. Don't gate all drawing behind a single `Promise.all`.
- **Zoom state**: stored as `{ start, end }` offsets from the current range, not as absolute timestamps. `_getRange()` resolves the current window.
- **Keyboard shortcuts**: the card registers global `keydown` listeners for annotation shortcuts. These are attached/removed in `connectedCallback`/`disconnectedCallback`.

## Conventions

- Keep the `_load()` streaming pattern intact — it is not compatible with `@lit/task` due to progressive partial-state drawing.
- Use `diffCardConfig()` to decide whether a config change requires a full reload vs. a partial redraw.
- The editor (`editor.ts`) extends `EditorBase` from `src/molecules/editor-base/`.
