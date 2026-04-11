import type {
  HistoryAppStateContext,
  HistoryComparisonWindowState,
  HistoryPageState,
  HistoryTargetRowState,
} from "./types";

function createInitialHistoryPageState(): HistoryPageState {
  return {
    display: {
      sidebarCollapsed: false,
    },
    range: {
      startTime: null,
      endTime: null,
      previewZoomRange: null,
      committedZoomRange: null,
    },
    comparison: {
      windows: [],
      selectedWindowId: null,
      hoveredWindowId: null,
    },
    targets: {
      selection: {},
      rawSelection: {},
      rows: [],
    },
  };
}

export function createHistoryPageAppStateContext(): HistoryAppStateContext {
  const state = createInitialHistoryPageState();

  return {
    state,

    setSidebarCollapsed(value: boolean): void {
      state.display.sidebarCollapsed = value;
    },

    setRange(startTime: Nullable<Date>, endTime: Nullable<Date>): void {
      state.range.startTime = startTime;
      state.range.endTime = endTime;
    },

    setPreviewZoomRange(value: Nullable<{ start: number; end: number }>): void {
      state.range.previewZoomRange = value ? { ...value } : null;
    },

    setCommittedZoomRange(
      value: Nullable<{ start: number; end: number }>
    ): void {
      state.range.committedZoomRange = value ? { ...value } : null;
    },

    setTargetSelection(value: RecordWithUnknownValues): void {
      state.targets.selection = { ...(value || {}) };
    },

    setTargetSelectionRaw(value: RecordWithUnknownValues): void {
      state.targets.rawSelection = { ...(value || {}) };
    },

    setSeriesRows(rows: HistoryTargetRowState[]): void {
      state.targets.rows = Array.isArray(rows)
        ? rows.map((row) => ({ ...row }))
        : [];
    },

    setComparisonWindows(windows: HistoryComparisonWindowState[]): void {
      state.comparison.windows = Array.isArray(windows)
        ? windows.map((window) => ({ ...window }))
        : [];
    },

    setSelectedComparisonWindowId(value: Nullable<string>): void {
      state.comparison.selectedWindowId = value || null;
    },

    setHoveredComparisonWindowId(value: Nullable<string>): void {
      state.comparison.hoveredWindowId = value || null;
    },
  };
}
