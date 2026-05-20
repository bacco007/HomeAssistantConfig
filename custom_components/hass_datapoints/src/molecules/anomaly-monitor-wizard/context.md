# Anomaly monitor wizard — context

## Purpose

Owns the dialog flow for creating and editing anomaly monitors from the datapoints UI. The wizard is a three-step create flow (entities → analysis → schedule) and a two-step edit flow (analysis → schedule).

## State & data flow

- Step 1 stores raw target-picker state in `_target`, then resolves the effective entity set with `resolveEntityIdsFromTarget(...)` when advancing or when quick-add affordances need to reason about the current selection.
- Step 2 keeps per-entity analysis state in `_entityConfigs`, keyed by entity ID, and projects that slim wizard config back into `NormalizedAnalysis` for the embedded analysis groups. Comparison-entity and overlap selections must round-trip through this map or the UI silently resets.
- Step 3 derives the final monitor payload from `_entityIds`, `_monitorType`, schedule fields, and the active entity config before calling `createMonitor()` or `updateMonitor()`. The wizard owns one extra normalization step here: frontend `similar_entity` is persisted as backend `comparison_window` plus a baseline entity reference.

## External dependencies

- Home Assistant target resolution through `target-selection` helpers.
- `analysis-sample-group` and `analysis-anomaly-group` for the embedded analysis controls.
- `monitors-api` for create/update persistence.
- `@lit/localize` runtime mode for user-visible strings.

## Non-obvious behaviors

- Quick-add actions intentionally collapse mixed target-picker state into an explicit `entity_id` list. This favors predictability over preserving area/device/label targeting once the user starts adding chart-derived entities.
- `suggestedEntityIds` and `allSeriesEntityIds` are separate on purpose: suggestions exclude the origin series, while the all-series set includes it so clearing step 1 is recoverable.
- The quick-add area filters against the resolved target entity set, not just `_target.entity_id`, so area/device selections suppress duplicate add buttons correctly.
- Create mode auto-populates the monitor name only when moving from step 2 to step 3 with a blank name; edit mode skips the entities step entirely.
- The wizard reuses `analysis-anomaly-group`, but explicitly hides that component's standalone "Save as anomaly monitor" CTA to avoid nested monitor-creation flows.
- Monitor persistence does not accept `anomaly_comparison_window_id`; that remains chart/display state only unless a future implementation adds an explicit conversion to `baseline_entity_id` / `baseline_time_offset_hours`.

## Conventions

- Keep wizard-only analysis shape in `monitor-wizard-logic.ts`; use the component class for orchestration and event handling rather than embedding more pure logic inline.
- When changing visible copy here, update the co-located `i18n/` locale files in the same directory.
