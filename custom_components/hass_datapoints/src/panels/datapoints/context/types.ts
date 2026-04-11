import type { HassLike } from "@/lib/types";
import type { HistorySeriesAnalysis } from "@/lib/domain/history-series";
import type { NormalizedHistoryDateWindow } from "@/lib/history-page/history-url-state";

export interface HistoryTargetRowState {
  entity_id: string;
  color: string;
  visible?: boolean;
  analysis?: HistorySeriesAnalysis;
}

export interface HistoryRangeState {
  startTime: Nullable<Date>;
  endTime: Nullable<Date>;
  previewZoomRange: Nullable<{ start: number; end: number }>;
  committedZoomRange: Nullable<{ start: number; end: number }>;
}

export interface HistoryComparisonWindowState {
  id: string;
  name?: string;
  label?: string;
  start_time: string;
  end_time: string;
  color?: string;
  [key: string]: unknown;
}

export interface HistoryComparisonState {
  windows: HistoryComparisonWindowState[];
  selectedWindowId: Nullable<string>;
  hoveredWindowId: Nullable<string>;
}

export interface HistoryDisplayState {
  sidebarCollapsed: boolean;
}

export interface HistoryTargetSelectionState {
  selection: RecordWithUnknownValues;
  rawSelection: RecordWithUnknownValues;
  rows: HistoryTargetRowState[];
}

export interface HistoryPageState {
  display: HistoryDisplayState;
  range: HistoryRangeState;
  comparison: HistoryComparisonState;
  targets: HistoryTargetSelectionState;
}

export interface HistoryFetchState {
  historyBoundsLoaded: boolean;
  historyBoundsLoading: boolean;
  preferencesLoaded: boolean;
  preferencesLoading: boolean;
  savedPageLoaded: boolean;
  hasSavedPage: boolean;
  timelineEventsLoading: boolean;
  timelineEventsKey: string;
}

export interface HistoryPersistenceState {
  savingPreferences: boolean;
  savePageBusy: boolean;
  exportBusy: boolean;
}

export interface HistoryNavigationReadState {
  entityFromUrl: Nullable<string>;
  deviceFromUrl: Nullable<string>;
  areaFromUrl: Nullable<string>;
  labelFromUrl: Nullable<string>;
  datapointsScopeFromUrl: Nullable<string>;
  startFromUrl: Nullable<string>;
  endFromUrl: Nullable<string>;
  zoomStartFromUrl: Nullable<string>;
  zoomEndFromUrl: Nullable<string>;
  seriesColorsFromUrl: RecordWithStringValues;
  dateWindowsFromUrl: NormalizedHistoryDateWindow[];
  pageStateFromUrl: Nullable<RecordWithUnknownValues>;
  hoursFromUrl: number;
  hasTargetInUrl: boolean;
  hasRangeInUrl: boolean;
  sessionState: Nullable<RecordWithUnknownValues>;
}

export interface HistoryPanelRefs {
  shellEl: Nullable<HTMLElement>;
  chartEl: Nullable<HTMLElement>;
  listEl: Nullable<HTMLElement>;
  historyTargetsEl: Nullable<HTMLElement>;
  rangeToolbarEl: Nullable<HTMLElement>;
}

export interface HistoryAppStateContext {
  state: HistoryPageState;
  setSidebarCollapsed(value: boolean): void;
  setRange(startTime: Nullable<Date>, endTime: Nullable<Date>): void;
  setPreviewZoomRange(value: Nullable<{ start: number; end: number }>): void;
  setCommittedZoomRange(value: Nullable<{ start: number; end: number }>): void;
  setTargetSelection(value: RecordWithUnknownValues): void;
  setTargetSelectionRaw(value: RecordWithUnknownValues): void;
  setSeriesRows(rows: HistoryTargetRowState[]): void;
  setComparisonWindows(windows: HistoryComparisonWindowState[]): void;
  setSelectedComparisonWindowId(value: Nullable<string>): void;
  setHoveredComparisonWindowId(value: Nullable<string>): void;
}

export interface HistoryPageContext {
  hass: Nullable<HassLike>;
  app: HistoryAppStateContext;
  fetch: HistoryFetchContext;
  persistence: HistoryPersistenceContext;
  orchestration: HistoryOrchestrationContext;
  navigation: HistoryNavigationContext;
}

export interface HistoryFetchContext {
  state: HistoryFetchState;
  ensureHistoryBounds(options: {
    onSuccess(payload: {
      start: Nullable<string>;
      end: Nullable<string>;
    }): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  ensureUserPreferences<T>(options: {
    preferencesKey: string;
    fallbackValue: T;
    onSuccess(preferences: T): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  loadSavedPageIndicator<T>(options: {
    savedPageKey: string;
    fallbackValue: T;
    onSuccess(saved: Nullable<T>): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  resetTimelineEvents(): void;
  loadTimelineEvents(options: {
    startIso: string;
    endIso: string;
    datapointScope: string;
    entityIds: string[];
    onSuccess(events: unknown[], key: string): void;
    onError?(error: unknown): void;
  }): Promise<void>;
}

export interface HistoryPersistenceContext {
  state: HistoryPersistenceState;
  saveUserPreferences<T>(options: {
    preferencesKey: string;
    payload: T;
    onSuccess?(): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  downloadSpreadsheet(options: {
    entityIds: string[];
    startTime: Date;
    endTime: Date;
    datapointScope: string;
    onSuccess?(): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  savePageState<T>(options: {
    savedPageKey: string;
    state: T;
    onSuccess?(): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  restorePageState<T>(options: {
    savedPageKey: string;
    fallbackValue: T;
    onSuccess?(saved: T): void;
    onMissing?(): void;
    onError?(error: unknown): void;
  }): Promise<void>;
  clearSavedPageState(options: {
    savedPageKey: string;
    onSuccess?(): void;
    onError?(error: unknown): void;
  }): Promise<void>;
}

export interface HistoryOrchestrationContext {
  requestChartResizeRedraw(chartEl: Nullable<HTMLElement>): void;
  cancelChartResizeRedraw(): void;
  openTargetPicker(
    targetControl: Nullable<HTMLElement>,
    anchorEl?: Nullable<HTMLElement>
  ): void;
  renderComparisonTabs(options: {
    chartEl: Nullable<HTMLElement>;
    comparisonWindows: Array<{
      id: string;
      label?: string;
      start_time: string;
      end_time: string;
    }>;
    selectedComparisonWindowId: Nullable<string>;
    hoveredComparisonWindowId: Nullable<string>;
    startTime: Nullable<Date>;
    endTime: Nullable<Date>;
    loadingComparisonWindowIds: string[];
    comparisonTabRailComp: Nullable<HTMLElement>;
    comparisonTabsHostEl: Nullable<HTMLElement>;
    formatComparisonLabel(startTime: Date, endTime: Date): string;
    onActivate(tabId: string): void;
    onHover(tabId: string): void;
    onLeave(tabId: string): void;
    onEdit(tabId: string): void;
    onDelete(tabId: string): void;
    onAdd(): void;
  }): {
    comparisonTabRailComp: Nullable<HTMLElement>;
    comparisonTabsHostEl: Nullable<HTMLElement>;
  };
  updateComparisonTabsOverflow(chartEl: Nullable<HTMLElement>): void;
  handleComparisonTabHover(options: {
    id: Nullable<string> | undefined;
    hoveredComparisonWindowId: Nullable<string>;
    setHoveredComparisonWindowId(value: Nullable<string>): void;
    updateComparisonRangePreview(): void;
    updateChartHoverIndicator(): void;
    renderContent(): void;
  }): void;
  handleComparisonTabLeave(options: {
    id: Nullable<string> | undefined;
    hoveredComparisonWindowId: Nullable<string>;
    setHoveredComparisonWindowId(value: Nullable<string>): void;
    updateComparisonRangePreview(): void;
    updateChartHoverIndicator(): void;
    renderContent(): void;
  }): void;
  handleComparisonTabActivate(options: {
    id: Nullable<string> | undefined;
    comparisonWindows: Array<{ id: string }>;
    selectedComparisonWindowId: Nullable<string>;
    setSelectedComparisonWindowId(value: Nullable<string>): void;
    setHoveredComparisonWindowId(value: Nullable<string>): void;
    clearDeltaAnalysisSelectionState(): void;
    updateComparisonRangePreview(): void;
    updateChartHoverIndicator(): void;
    renderComparisonTabs(): void;
    renderContent(): void;
    setAdjustComparisonAxisScale(value: boolean): void;
  }): void;
}

export interface HistoryNavigationContext {
  readStateFromLocation(): HistoryNavigationReadState;
  readSessionState(): Nullable<RecordWithUnknownValues>;
  saveSessionState(source: unknown): void;
  updateUrl(options: {
    entities: string[];
    datapointScope: string;
    startTime: Nullable<Date>;
    endTime: Nullable<Date>;
    hours: number;
    committedZoomRange: Nullable<{ start: number; end: number }>;
    comparisonWindows: Array<RecordWithUnknownValues>;
    pageState: RecordWithUnknownValues;
    seriesRows: Array<{ entity_id: string; color: string }>;
    seriesColorQueryKey(entityId: string): string;
    push?: boolean;
  }): void;
}
