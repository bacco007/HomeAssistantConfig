import type { HistoryPageState, HistoryTargetRowState } from "./types";

export function selectVisibleRows(
  state: HistoryPageState
): HistoryTargetRowState[] {
  return state.targets.rows.filter((row) => row.visible !== false);
}

export function selectHiddenRows(
  state: HistoryPageState
): HistoryTargetRowState[] {
  return state.targets.rows.filter((row) => row.visible === false);
}

export function selectVisibleEntityIds(state: HistoryPageState): string[] {
  return selectVisibleRows(state).map((row) => row.entity_id);
}

export function selectHiddenEntityIds(state: HistoryPageState): string[] {
  return selectHiddenRows(state).map((row) => row.entity_id);
}

export function selectEffectiveZoomRange(
  state: HistoryPageState
): Nullable<{ start: number; end: number }> {
  return state.range.previewZoomRange || state.range.committedZoomRange;
}

export function selectActiveComparisonWindow(state: HistoryPageState) {
  const activeId =
    state.comparison.selectedWindowId || state.comparison.hoveredWindowId;
  if (!activeId) {
    return null;
  }
  return (
    state.comparison.windows.find((window) => window.id === activeId) || null
  );
}
