import { COLORS, DOMAIN } from "@/constants";
import { entityName } from "@/lib/ha/entity-name";
import { msg, syncFrontendLocale } from "@/lib/i18n/localize";
import {
  confirmDestructiveAction,
  ensureHaComponents,
} from "@/lib/ha/ha-components";
import { PANEL_HISTORY_SAVED_PAGE_KEY } from "@/lib/data/preferences-api";
import {
  buildHistorySeriesRows,
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
  slugifySeriesName,
} from "@/lib/domain/history-series";
import {
  normalizeEntityIds,
  normalizeTargetValue,
  panelConfigTarget,
  resolveEntityIdsFromTarget,
} from "@/lib/domain/target-selection";
import { parseDateValue } from "@/lib/domain/chart-zoom";
import {
  buildHistoryPagePreferencesPayload,
  buildHistoryPageSessionState,
  type HistoryPageSessionState,
  type HistoryPageSource,
  normalizeHistoryPagePreferences,
  PANEL_HISTORY_PREFERENCES_KEY,
} from "@/lib/history-page/history-session-state";
import {
  type NormalizedHistoryDateWindow,
  makeDateWindowId,
  normalizeDateWindows,
} from "@/lib/history-page/history-url-state";
import {
  addUnit,
  clampNumber,
  DAY_MS,
  endOfUnit,
  extractRangeValue,
  HOUR_MS,
  MINUTE_MS,
  RANGE_AUTO_ZOOM_DEBOUNCE_MS,
  RANGE_AUTO_ZOOM_SELECTION_PADDING_RATIO,
  RANGE_FUTURE_BUFFER_YEARS,
  RANGE_SLIDER_MIN_SPAN_MS,
  RANGE_SLIDER_WINDOW_MS,
  RANGE_SNAP_OPTIONS,
  RANGE_ZOOM_CONFIGS,
  RANGE_ZOOM_OPTIONS,
  type RangeUnit,
  SECOND_MS,
  startOfUnit,
} from "@/lib/timeline/timeline-scale";
import { logger } from "@/lib/logger";
import type { HassLike } from "@/lib/types";

import "@/molecules/target-row/target-row";
import "@/molecules/target-row-list/target-row-list";
import "@/molecules/sidebar-options/sidebar-options";
import "@/molecules/collapsed-options-menu/collapsed-options-menu";
import "@/molecules/comparison-tab-rail/comparison-tab-rail";
import "@/molecules/date-window-dialog/date-window-dialog";
import "@/atoms/interactive/resizable-panes/resizable-panes";
import "@/molecules/history-chart/history-chart";
import "@/panels/datapoints/components/panel-shell/panel-shell";
import "@/panels/datapoints/components/history-targets/history-targets";
import "@/panels/datapoints/components/range-toolbar/range-toolbar";
import { createHistoryPageContext } from "@/panels/datapoints/context/create-history-page-context";
import type {
  HistoryPageContext,
  HistoryComparisonWindowState,
  HistoryTargetRowState,
} from "@/panels/datapoints/context/types";
import {
  PANEL_HISTORY_LOADING_STYLE,
  PANEL_HISTORY_STYLE,
} from "./datapoints.styles";

const DATA_GAP_THRESHOLD_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "5m", label: "5 minutes" },
  { value: "15m", label: "15 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
];

const ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS = [
  { value: "all", label: "Show all anomalies" },
  { value: "only", label: "Overlaps only" },
];

type DetailEvent<T> = Event & { detail?: T };

type HistoryTargetsElement = HTMLElement & {
  rows: unknown[];
  states: RecordWithUnknownValues;
  hass: unknown;
  comparisonWindows: NormalizedHistoryDateWindow[];
  canShowDeltaAnalysis: boolean;
  sidebarCollapsed: boolean;
  getRowListEl(): Nullable<RowListElement>;
};

type RowListElement = HTMLElement & {
  rows: unknown[];
  states: RecordWithUnknownValues;
  hass: unknown;
  canShowDeltaAnalysis: boolean;
  comparisonWindows: NormalizedHistoryDateWindow[];
  computingEntityIds: Set<string>;
  analysisProgress: number;
  computingMethodsByEntity: Map<string, unknown>;
};

type TargetPickerElement = HTMLElement & {
  hass?: unknown;
  value: RecordWithUnknownValues;
};

type TargetRowElement = HTMLElement & {
  hideDragHandle: boolean;
  color: Nullable<string>;
  visible: boolean;
  analysis: RecordWithUnknownValues;
  index: number;
  entityId: string;
  stateObj: unknown;
  hass: unknown;
  canShowDeltaAnalysis: boolean;
  comparisonWindows: NormalizedHistoryDateWindow[];
};

type RangeToolbarElement = HTMLElement & {
  startTime: Nullable<Date>;
  endTime: Nullable<Date>;
  rangeBounds: unknown;
  zoomLevel: string;
  dateSnapping: string;
  sidebarCollapsed: boolean;
  hass: unknown;
  isLiveEdge: boolean;
  timelineEvents: unknown[];
  comparisonPreview: unknown;
  zoomRange: Nullable<{ start: number; end: number }>;
  zoomWindowRange: unknown;
  chartHoverTimeMs: Nullable<number>;
  chartHoverWindowTimeMs: Nullable<number>;
  updateComplete: Promise<void>;
  syncMobileDates(start: Nullable<Date>, end: Nullable<Date>): void;
  syncZoomHighlights(
    zoomRange: Nullable<{ start: number; end: number }>,
    zoomWindowRange: Nullable<{ start: number; end: number }>
  ): void;
  closeMenus(): void;
  syncOptionsLabels(): void;
  revealSelection(): void;
};

type PanelShellElement = HTMLElement & {
  hass: unknown;
  narrow: boolean;
  sidebarCollapsed: boolean;
  hasSavedState: boolean;
  layoutMode: string;
  updateComplete: Promise<unknown>;
  syncLayoutHeight(): void;
  getTargetPopupEl(): Nullable<HTMLElement>;
  getOptionsPopupEl(): Nullable<HTMLElement>;
  closePageMenu(): void;
};

type SidebarOptionsElement = HTMLElement & {
  datapointScope: string;
  showIcons: boolean;
  showLines: boolean;
  showTooltips: boolean;
  showHoverGuides: boolean;
  hoverSnapMode: string;
  showCorrelatedAnomalies: boolean;
  showDataGaps: boolean;
  dataGapThreshold: string;
  yAxisMode: string;
  anomalyOverlapMode: string;
  anyAnomaliesEnabled: boolean;
  targetsOpen: boolean;
  datapointsOpen: boolean;
  analysisOpen: boolean;
  chartOpen: boolean;
};

type LegacyDialogElement = HTMLElement & {
  open: boolean;
  headerTitle: string;
};

type DialogInputElement = HTMLElement & {
  value: string;
  hass?: unknown;
};

type DateWindowDialogElement = HTMLElement & {
  open: boolean;
  heading: string;
  submitLabel: string;
  showDelete: boolean;
  showShortcuts: boolean;
  name: string;
  startValue: string;
  endValue: string;
  rangeBounds: unknown;
  zoomLevel: string;
  dateSnapping: string;
};
type CollapsedOptionsMenuElement = HTMLElement & {
  datapointScope: string;
  showIcons: boolean;
  showLines: boolean;
  showTooltips: boolean;
  showHoverGuides: boolean;
  hoverSnapMode: string;
  showCorrelatedAnomalies: boolean;
  showDataGaps: boolean;
  dataGapThreshold: string;
  yAxisMode: string;
  anomalyOverlapMode: string;
  anyAnomaliesEnabled: boolean;
};

type HistoryCardElement = HTMLElement & {
  hass?: unknown;
  setConfig(config: RecordWithUnknownValues): void;
  setExternalZoomRange?(range: Nullable<{ start: number; end: number }>): void;
  _adjustComparisonAxisScale?: boolean;
};

type ListCardElement = HTMLElement & {
  hass?: unknown;
  setConfig(config: RecordWithUnknownValues): void;
};

type ResizablePanesElement = HTMLElement & {
  ratio: number;
  min: number;
  max: number;
  secondHidden: boolean;
};

/**
 * hass-datapoints-history-panel – Sidebar panel for annotated history exploration.
 */

// Shared timeline, domain, and history-page helpers now live in dedicated subsystem files.

export class HassRecordsHistoryPanel extends HTMLElement {
  [key: string]: unknown;

  // Explicit declarations take precedence over the index signature so TypeScript
  // knows the concrete types for the properties accessed most frequently.
  declare _context: HistoryPageContext;

  declare _hass: Nullable<HassLike>;

  declare _mqTablet: MediaQueryList;

  declare _mqMobile: MediaQueryList;

  declare _onLayoutChange: () => void;

  declare _onChartHover: EventListener;

  declare _onChartZoom: EventListener;

  declare _onRecordsSearch: EventListener;

  declare _onToggleEventVisibility: EventListener;

  declare _onHoverEventRecord: EventListener;

  declare _onToggleSeriesVisibility: EventListener;

  declare _onComparisonLoading: EventListener;

  declare _onAnalysisComputing: EventListener;

  declare _onAnalysisMethodResult: EventListener;

  declare _onEventRecorded: () => void;

  declare _onPopState: () => void;

  declare _onLocationChanged: () => void;

  declare _onOverlayKeydown: Nullable<(ev: KeyboardEvent) => void>;

  // Additional typed property declarations
  declare _rendered: boolean;

  declare _shellBuilt: boolean;

  declare _narrow: boolean;

  declare _hours: number;

  declare _panel: Nullable<{ config?: RecordWithUnknownValues }>;

  declare _layoutMode: string;

  declare _contentKey: string;

  declare _contentSplitRatio: number;

  declare _datapointScope: string;

  declare _showChartDatapointIcons: boolean;

  declare _showChartDatapointLines: boolean;

  declare _showChartTooltips: boolean;

  declare _showChartEmphasizedHoverGuides: boolean;

  declare _chartHoverSnapMode: string;

  declare _delinkChartYAxis: boolean;

  declare _splitChartView: boolean;

  declare _showCorrelatedAnomalies: boolean;

  declare _chartAnomalyOverlapMode: string;

  declare _showDataGaps: boolean;

  declare _dataGapThreshold: string;

  declare _historyStartTime: Nullable<Date>;

  declare _historyEndTime: Nullable<Date>;

  declare _timelineEvents: unknown[];

  declare _preferredSeriesColors: RecordWithStringValues;

  declare _loadingComparisonWindowIds: string[];

  declare _comparisonTabsHostEl: Nullable<HTMLElement>;

  declare _comparisonTabRailComp: Nullable<HTMLElement>;

  declare _pendingAnomalyComparisonWindowEntityId: Nullable<string>;

  declare _dateWindowDialogOpen: boolean;

  declare _editingDateWindowId: Nullable<string>;

  declare _dateWindowDialogComp: Nullable<DateWindowDialogElement>;

  declare _dateWindowDialogEl: Nullable<LegacyDialogElement>;

  declare _dateWindowDialogNameEl: Nullable<DialogInputElement>;

  declare _dateWindowDialogStartEl: Nullable<DialogInputElement>;

  declare _dateWindowDialogEndEl: Nullable<DialogInputElement>;

  declare _dateWindowDialogShortcutsEl: Nullable<HTMLElement>;

  declare _dateWindowDialogDraftRange: Nullable<{ start: Date; end: Date }>;

  declare _uiReadyPromise: Nullable<Promise<unknown>>;

  declare _uiReadyApplied: boolean;

  declare _chartEl: Nullable<HistoryCardElement>;

  declare _historyChartMol: Nullable<{
    _configKey: string;
    chartEl: HTMLElement;
  }>;

  declare _listEl: Nullable<ListCardElement>;

  declare _chartConfigKey: string;

  declare _listConfigKey: string;

  declare _shellEl: Nullable<PanelShellElement>;

  declare _contentHostEl: Nullable<HTMLElement>;

  declare _contentSplitterEl: Nullable<ResizablePanesElement>;

  declare _targetControl: Nullable<TargetPickerElement>;

  declare _targetRowsEl: Nullable<HistoryTargetsElement>;

  declare _historyTargetsComp: Nullable<HistoryTargetsElement>;

  declare _rowListEl: Nullable<RowListElement>;

  declare _targetRowsRenderKey: string;

  declare _sidebarOptionsEl: Nullable<HTMLElement>;

  declare _sidebarOptionsComp: Nullable<SidebarOptionsElement>;

  declare _sidebarAccordionTargetsOpen: boolean;

  declare _sidebarAccordionDatapointsOpen: boolean;

  declare _sidebarAccordionAnalysisOpen: boolean;

  declare _sidebarAccordionChartOpen: boolean;

  declare _dateControl: Nullable<HTMLElement>;

  declare _dateRangePickerEl: Nullable<HTMLElement>;

  declare _panelTimelineEl: Nullable<RangeToolbarElement>;

  declare _rangeToolbarComp: Nullable<RangeToolbarElement>;

  declare _rangeBounds: Nullable<{ min: number; max: number; config: unknown }>;

  declare _autoZoomTimer: Nullable<number>;

  declare _rangeCommitTimer: Nullable<number>;

  declare _chartZoomStateCommitTimer: Nullable<number>;

  declare _resolvedAutoZoomLevel: Nullable<string>;

  declare _hoveredPeriodRange: Nullable<unknown>;

  declare _chartHoverTimeMs: Nullable<number>;

  declare _zoomLevel: string;

  declare _dateSnapping: string;

  declare _hasTargetInUrl: boolean;

  declare _hasRangeInUrl: boolean;

  declare _hasPageStateInUrl: boolean;

  declare _localPageStateDirty: boolean;

  declare _pendingPreferencesSaveTimer: Nullable<number>;

  declare _recordsSearchQuery: string;

  declare _hiddenEventIds: string[];

  declare _hoveredEventIds: string[];

  declare _restoredFromSession: boolean;

  declare _pageMenuOpen: boolean;

  declare _onWindowPointerDown: EventListener;

  declare _onWindowResize: () => void;

  declare _onCollapsedSidebarClick: EventListener;

  declare _haEventUnsubscribe: Nullable<() => void>;

  declare _computingEntityIds: Set<string>;

  declare _analysisProgress: number;

  declare _computingMethods: Map<string, Set<string>>;

  declare _draftStartTime: Nullable<Date>;

  declare _draftEndTime: Nullable<Date>;

  declare _entities: string[];

  declare _collapsedPopupEntityId: Nullable<string>;

  declare _collapsedPopupAnchorEl: Nullable<HTMLElement>;

  declare _collapsedPopupOutsideClickHandler: Nullable<EventListener>;

  declare _collapsedPopupKeyHandler: Nullable<(ev: KeyboardEvent) => void>;

  declare _collapsedOptionsOutsideClickHandler: Nullable<EventListener>;

  declare _collapsedOptionsKeyHandler: Nullable<(ev: KeyboardEvent) => void>;

  declare _collapsedOptionsPopupOpen: boolean;

  declare _collapsedOptionsAnchorEl: Nullable<HTMLElement>;

  /** The last locale string returned by syncFrontendLocale — used to detect
   *  actual locale changes so we can avoid a full re-render on routine hass
   *  updates where the locale hasn't changed. */
  declare _lastSyncedLocale: string;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._context = createHistoryPageContext();
    this._rendered = false;
    this._shellBuilt = false;
    this._entities = [];
    this._seriesRows = [];
    this._targetSelection = {};
    this._targetSelectionRaw = {};
    this._hours = 24;
    this._startTime = null;
    this._endTime = null;
    this._panel = null;
    this._narrow = false;
    this._contentKey = "";
    this._contentSplitRatio = 0.44;
    this._sidebarCollapsed = false;
    this._layoutMode = "desktop"; // "desktop" | "tablet" | "mobile"
    this._mqTablet = window.matchMedia("(max-width: 900px)");
    this._mqMobile = window.matchMedia("(max-width: 720px)");
    this._onLayoutChange = () => this._updateLayoutMode();
    this._collapsedPopupEntityId = null;
    this._collapsedPopupAnchorEl = null;
    this._collapsedPopupOutsideClickHandler = null;
    this._collapsedPopupKeyHandler = null;
    this._lastSyncedLocale = "";
    this._datapointScope = "linked";
    this._showChartDatapointIcons = true;
    this._showChartDatapointLines = true;
    this._showChartTooltips = true;
    this._showChartEmphasizedHoverGuides = false;
    this._chartHoverSnapMode = "follow_series";
    this._delinkChartYAxis = false;
    this._showCorrelatedAnomalies = false;
    this._chartAnomalyOverlapMode = "all";
    this._showDataGaps = true;
    this._dataGapThreshold = "2h";
    this._historyStartTime = null;
    this._historyEndTime = null;
    this._historyBoundsLoaded = false;
    this._timelineEvents = [];
    this._timelineEventsKey = "";
    this._preferredSeriesColors = {};
    this._preferencesLoaded = false;
    this._comparisonWindows = [];
    this._selectedComparisonWindowId = null;
    this._hoveredComparisonWindowId = null;
    this._loadingComparisonWindowIds = [];
    this._comparisonTabsHostEl = null;
    this._comparisonTabRailComp = null;
    this._pendingAnomalyComparisonWindowEntityId = null;
    this._dateWindowDialogOpen = false;
    this._editingDateWindowId = null;
    this._dateWindowDialogComp = null;
    this._splitChartView = false;
    this._dateWindowDialogNameEl = null;
    this._dateWindowDialogStartEl = null;
    this._dateWindowDialogEndEl = null;
    this._dateWindowDialogShortcutsEl = null;
    this._dateWindowDialogDraftRange = null;
    this._uiReadyPromise = null;
    this._uiReadyApplied = false;
    this._chartEl = null;
    this._historyChartMol = null;
    this._listEl = null;
    this._chartConfigKey = "";
    this._listConfigKey = "";
    this._shellEl = null;
    this._contentHostEl = null;
    this._contentSplitterEl = null;
    this._targetControl = null;
    this._targetRowsEl = null;
    this._rowListEl = null;
    this._targetRowsRenderKey = "";
    this._sidebarOptionsEl = null;
    this._sidebarOptionsComp = null;
    this._sidebarAccordionTargetsOpen = true;
    this._sidebarAccordionDatapointsOpen = true;
    this._sidebarAccordionAnalysisOpen = true;
    this._sidebarAccordionChartOpen = true;
    this._dateControl = null;
    this._dateRangePickerEl = null;
    this._panelTimelineEl = null;
    this._rangeBounds = null;
    this._autoZoomTimer = null;
    this._resolvedAutoZoomLevel = null;
    this._hoveredPeriodRange = null;
    this._chartHoverTimeMs = null;
    this._chartZoomRange = null;
    this._chartZoomCommittedRange = null;
    this._chartZoomStateCommitTimer = null;
    this._zoomLevel = "auto";
    this._dateSnapping = "auto";
    this._hasTargetInUrl = false;
    this._hasRangeInUrl = false;
    this._hasPageStateInUrl = false;
    this._localPageStateDirty = false;
    this._pendingPreferencesSaveTimer = null;
    this._recordsSearchQuery = "";
    this._hiddenEventIds = [];
    this._hoveredEventIds = [];
    this._restoredFromSession = false;
    this._savedPageLoaded = false;
    this._hasSavedPage = false;
    this._pageMenuOpen = false;
    this._onChartHover = (ev: Event) => this._handleChartHover(ev);
    this._onChartZoom = (ev: Event) => this._handleChartZoom(ev);
    this._onRecordsSearch = (ev: Event) => this._handleRecordsSearch(ev);
    this._onToggleEventVisibility = (ev: Event) =>
      this._handleToggleEventVisibility(ev);
    this._onHoverEventRecord = (ev: Event) => this._handleHoverEventRecord(ev);
    this._onToggleSeriesVisibility = (ev: Event) =>
      this._handleToggleSeriesVisibility(ev);
    this._onComparisonLoading = (ev: Event) =>
      this._handleComparisonLoading(ev);
    this._computingEntityIds = new Set();
    this._analysisProgress = 0;
    this._computingMethods = new Map(); // entityId → Set<methodName> of in-flight anomaly methods
    this._onAnalysisComputing = (ev: Event) =>
      this._handleAnalysisComputing(ev);
    this._onAnalysisMethodResult = (ev: Event) =>
      this._handleAnalysisMethodResult(ev);
    this._onWindowPointerDown = (_ev: Event) => this._handleWindowPointerDown();
    this._onWindowResize = () => {
      if (this._rendered) {
        this._syncPageLayoutHeight();
        this._applyContentSplitLayout();
        this._requestChartResizeRedraw();
        this._syncRangeControl();
      }
    };
    this._onCollapsedSidebarClick = (_ev: Event) =>
      this._handleCollapsedSidebarClick();
    this._onEventRecorded = () => this._handleEventRecorded();
    this._haEventUnsubscribe = null;
    this._onPopState = () => {
      this._initFromContext();
      if (this._rendered) {
        this._syncControls();
        this._renderContent();
      }
    };
    this._onLocationChanged = () => {
      this._initFromContext();
      if (this._rendered) {
        this._syncControls();
        this._renderContent();
      }
    };
  }

  _appState() {
    return this._context.app;
  }

  get _targetSelection() {
    return this._appState().state.targets.selection;
  }

  set _targetSelection(value) {
    this._appState().setTargetSelection(value || {});
  }

  get _targetSelectionRaw() {
    return this._appState().state.targets.rawSelection;
  }

  set _targetSelectionRaw(value) {
    this._appState().setTargetSelectionRaw(value || {});
  }

  get _seriesRows() {
    return this._appState().state.targets.rows;
  }

  set _seriesRows(value) {
    this._appState().setSeriesRows(Array.isArray(value) ? value : []);
  }

  get _startTime() {
    return this._appState().state.range.startTime;
  }

  set _startTime(value) {
    this._appState().setRange(value || null, this._endTime || null);
  }

  get _endTime() {
    return this._appState().state.range.endTime;
  }

  set _endTime(value) {
    this._appState().setRange(this._startTime || null, value || null);
  }

  get _sidebarCollapsed() {
    return this._appState().state.display.sidebarCollapsed;
  }

  set _sidebarCollapsed(value) {
    this._appState().setSidebarCollapsed(!!value);
  }

  get _comparisonWindows() {
    return this._appState().state.comparison.windows;
  }

  set _comparisonWindows(value) {
    this._appState().setComparisonWindows(Array.isArray(value) ? value : []);
  }

  get _selectedComparisonWindowId() {
    return this._appState().state.comparison.selectedWindowId;
  }

  set _selectedComparisonWindowId(value) {
    this._appState().setSelectedComparisonWindowId(value || null);
  }

  get _hoveredComparisonWindowId() {
    return this._appState().state.comparison.hoveredWindowId;
  }

  set _hoveredComparisonWindowId(value) {
    this._appState().setHoveredComparisonWindowId(value || null);
  }

  get _chartZoomRange() {
    return this._appState().state.range.previewZoomRange;
  }

  set _chartZoomRange(value) {
    this._appState().setPreviewZoomRange(value || null);
  }

  get _chartZoomCommittedRange() {
    return this._appState().state.range.committedZoomRange;
  }

  set _chartZoomCommittedRange(value) {
    this._appState().setCommittedZoomRange(value || null);
  }

  get _historyBoundsLoaded() {
    return this._context.fetch.state.historyBoundsLoaded;
  }

  set _historyBoundsLoaded(value) {
    this._context.fetch.state.historyBoundsLoaded = !!value;
  }

  get _preferencesLoaded() {
    return this._context.fetch.state.preferencesLoaded;
  }

  set _preferencesLoaded(value) {
    this._context.fetch.state.preferencesLoaded = !!value;
  }

  get _savedPageLoaded() {
    return this._context.fetch.state.savedPageLoaded;
  }

  set _savedPageLoaded(value) {
    this._context.fetch.state.savedPageLoaded = !!value;
  }

  get _hasSavedPage() {
    return this._context.fetch.state.hasSavedPage;
  }

  set _hasSavedPage(value) {
    this._context.fetch.state.hasSavedPage = !!value;
  }

  get _timelineEventsKey() {
    return this._context.fetch.state.timelineEventsKey;
  }

  set _timelineEventsKey(value) {
    this._context.fetch.state.timelineEventsKey = String(value || "");
  }

  get _savePageBusy() {
    return this._context.persistence.state.savePageBusy;
  }

  set _savePageBusy(value) {
    this._context.persistence.state.savePageBusy = !!value;
  }

  get _exportBusy() {
    return this._context.persistence.state.exportBusy;
  }

  set _exportBusy(value) {
    this._context.persistence.state.exportBusy = !!value;
  }

  set hass(hass: HassLike) {
    this._hass = hass;
    this._context.hass = hass;
    syncFrontendLocale(this._hass).then((locale) => {
      if (!this.isConnected) {
        return;
      }
      if (!this._shellBuilt && this._rendered) {
        this._buildLoadingShell();
        return;
      }
      if (!this._rendered) {
        return;
      }
      if (locale !== this._lastSyncedLocale) {
        // Locale changed (e.g. user switched language) — full re-render needed
        // to pick up newly translated strings.
        this._lastSyncedLocale = locale;
        this._renderContent();
      } else {
        // Routine hass update — push hass directly to already-mounted
        // sub-components without a full re-render.  _renderContent() is
        // called explicitly from every code path that actually changes
        // entity / config state.
        if (this._shellEl && this._hass) {
          this._shellEl.hass = this._hass;
        }
        if (this._chartEl) {
          this._chartEl.hass = this._hass;
        }
        if (this._listEl) {
          this._listEl.hass = this._hass;
        }
        if (this._targetControl && this._hass) {
          this._targetControl.hass = this._hass;
        }
        // Sidebar: push live states so entity icons/labels stay current.
        if (this._historyTargetsComp) {
          this._historyTargetsComp.hass = this._hass ?? null;
          this._historyTargetsComp.states =
            (this._hass?.states as RecordWithUnknownValues) ?? {};
        }
        if (this._rowListEl) {
          this._rowListEl.hass = this._hass ?? null;
          this._rowListEl.states =
            (this._hass?.states as RecordWithUnknownValues) ?? {};
        }
        if (this._rangeToolbarComp) {
          this._rangeToolbarComp.hass = this._hass ?? null;
        }
        // Inline HA state-icon elements rendered directly into the shadow DOM.
        this.shadowRoot
          ?.querySelectorAll(
            "[data-series-icon-entity-id], [data-series-collapsed-icon-entity-id]"
          )
          .forEach((iconEl) => {
            const icon = iconEl as HTMLElement & {
              dataset: DOMStringMap;
              stateObj?: unknown;
              hass?: unknown;
            };
            const entityId =
              icon.dataset.seriesIconEntityId ||
              icon.dataset.seriesCollapsedIconEntityId;
            if (!entityId) return;
            icon.stateObj = this._hass?.states?.[entityId];
            icon.hass = this._hass;
          });
      }
    });
    if (!this._haEventUnsubscribe && this._hass?.connection) {
      this._hass.connection
        .subscribeEvents(
          () => this._handleEventRecorded(),
          `${DOMAIN}_event_recorded`
        )
        .then((unsub: () => void) => {
          this._haEventUnsubscribe = unsub;
        })
        .catch(() => {});
    }
    if (!this._rendered) {
      this._rendered = true;
      this._initFromContext();
      if (this.isConnected) {
        this._buildLoadingShell();
      }
    }
    if (
      !this._seriesRows.length &&
      Object.keys(this._targetSelection || {}).length
    ) {
      this._seriesRows = buildHistorySeriesRows(
        resolveEntityIdsFromTarget(this._hass, this._targetSelection)
      );
    }
    this._syncSeriesState();
    if (!this._shellBuilt) {
      return;
    }
    // Re-attempt the one-time data fetches on every hass update — the fetch
    // context guards each with a loaded/loading flag so they only fire once.
    // This handles the case where hass arrived after the shell was first built
    // and the initial bootstrap ran without a valid connection.
    this._ensureHistoryBounds();
    this._ensureUserPreferences();
    this._loadSavedPageIndicator();
    // _bootstrapAfterShellBuilt() is intentionally NOT called here — it was
    // previously called on every hass update which triggered _renderContent()
    // and _syncHassBindings() (including DOM querySelectorAll and full target-
    // row re-renders) multiple times per second.  Those are now handled by the
    // microtask above (hass push) and by explicit calls from state-change
    // handlers.
  }

  set panel(panel: Nullable<{ config?: RecordWithUnknownValues }>) {
    this._panel = panel;
    this._initFromContext();
    if (this._rendered) {
      this._syncControls();
      this._renderContent();
    }
  }

  set narrow(value: boolean) {
    this._narrow = value;
  }

  connectedCallback() {
    this._mqTablet.addEventListener("change", this._onLayoutChange);
    this._mqMobile.addEventListener("change", this._onLayoutChange);
    this._updateLayoutMode();
    this._onOverlayKeydown = (ev: KeyboardEvent) => {
      if (
        ev.key === "Escape" &&
        !this._sidebarCollapsed &&
        this._layoutMode !== "desktop"
      ) {
        this._toggleSidebarCollapsed();
      }
    };
    window.addEventListener("keydown", this._onOverlayKeydown);
    window.addEventListener("popstate", this._onPopState);
    window.addEventListener("location-changed", this._onLocationChanged);
    window.addEventListener("pointerdown", this._onWindowPointerDown, true);
    window.addEventListener("resize", this._onWindowResize);
    window.addEventListener(
      "hass-datapoints-event-recorded",
      this._onEventRecorded
    );
    this.addEventListener("hass-datapoints-chart-hover", this._onChartHover);
    this.addEventListener("hass-datapoints-chart-zoom", this._onChartZoom);
    this.addEventListener(
      "hass-datapoints-records-search",
      this._onRecordsSearch
    );
    this.addEventListener(
      "hass-datapoints-toggle-event-visibility",
      this._onToggleEventVisibility
    );
    this.addEventListener(
      "hass-datapoints-hover-event-record",
      this._onHoverEventRecord
    );
    this.addEventListener(
      "hass-datapoints-toggle-series-visibility",
      this._onToggleSeriesVisibility
    );
    this.addEventListener(
      "hass-datapoints-comparison-loading",
      this._onComparisonLoading
    );
    this.addEventListener(
      "hass-datapoints-analysis-computing",
      this._onAnalysisComputing
    );
    this.addEventListener(
      "hass-datapoints-analysis-method-result",
      this._onAnalysisMethodResult
    );
    if (this._rendered && !this._shellBuilt) {
      this._buildLoadingShell();
    }
    this._ensureUiComponentsReady();
    if (this._rendered && this._shellBuilt) {
      window.requestAnimationFrame(() => {
        if (!this.isConnected) {
          return;
        }
        this._syncControls();
        this._renderContent();
        if (this._restoredFromSession) {
          this._restoredFromSession = false;
          this._updateUrl({ push: false });
        }
      });
    }
  }

  disconnectedCallback() {
    this._mqTablet.removeEventListener("change", this._onLayoutChange);
    this._mqMobile.removeEventListener("change", this._onLayoutChange);
    if (this._onOverlayKeydown) {
      window.removeEventListener("keydown", this._onOverlayKeydown);
    }
    window.removeEventListener("popstate", this._onPopState);
    window.removeEventListener("location-changed", this._onLocationChanged);
    window.removeEventListener("pointerdown", this._onWindowPointerDown, true);
    window.removeEventListener("resize", this._onWindowResize);
    window.removeEventListener(
      "hass-datapoints-event-recorded",
      this._onEventRecorded
    );
    if (this._haEventUnsubscribe) {
      this._haEventUnsubscribe();
      this._haEventUnsubscribe = null;
    }
    this.removeEventListener("hass-datapoints-chart-hover", this._onChartHover);
    this.removeEventListener("hass-datapoints-chart-zoom", this._onChartZoom);
    this.removeEventListener(
      "hass-datapoints-records-search",
      this._onRecordsSearch
    );
    this.removeEventListener(
      "hass-datapoints-toggle-event-visibility",
      this._onToggleEventVisibility
    );
    this.removeEventListener(
      "hass-datapoints-hover-event-record",
      this._onHoverEventRecord
    );
    this.removeEventListener(
      "hass-datapoints-toggle-series-visibility",
      this._onToggleSeriesVisibility
    );
    this.removeEventListener(
      "hass-datapoints-comparison-loading",
      this._onComparisonLoading
    );
    this.removeEventListener(
      "hass-datapoints-analysis-computing",
      this._onAnalysisComputing
    );
    this.removeEventListener(
      "hass-datapoints-analysis-method-result",
      this._onAnalysisMethodResult
    );
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    if (this._autoZoomTimer) {
      window.clearTimeout(this._autoZoomTimer);
      this._autoZoomTimer = null;
    }
    if (this._pendingPreferencesSaveTimer) {
      window.clearTimeout(this._pendingPreferencesSaveTimer);
      this._pendingPreferencesSaveTimer = null;
    }
    if (this._chartZoomStateCommitTimer) {
      window.clearTimeout(this._chartZoomStateCommitTimer);
      this._chartZoomStateCommitTimer = null;
    }
    this._hideCollapsedTargetPopup();
    this._hideCollapsedOptionsPopup();
    this._uiReadyPromise = null;
    this._uiReadyApplied = false;
    this._context.orchestration.cancelChartResizeRedraw();
  }

  _initFromContext() {
    const {
      entityFromUrl,
      deviceFromUrl,
      areaFromUrl,
      labelFromUrl,
      datapointsScopeFromUrl,
      startFromUrl,
      endFromUrl,
      zoomStartFromUrl,
      zoomEndFromUrl,
      seriesColorsFromUrl,
      dateWindowsFromUrl,
      hoursFromUrl,
      hasTargetInUrl,
      hasRangeInUrl,
      pageStateFromUrl,
      sessionState,
    } = this._context.navigation.readStateFromLocation();
    type PersistedState = Partial<HistoryPageSessionState> & {
      [key: string]: unknown;
    };
    const persistedState: PersistedState | null = (
      pageStateFromUrl && typeof pageStateFromUrl === "object"
        ? { ...(sessionState || {}), ...pageStateFromUrl }
        : sessionState
    ) as PersistedState | null;
    const panelCfg = this._panel?.config ?? ({} as RecordWithUnknownValues);
    this._hasTargetInUrl = hasTargetInUrl;
    this._hasRangeInUrl = hasRangeInUrl;
    this._hasPageStateInUrl = !!pageStateFromUrl;
    this._localPageStateDirty = false;
    this._restoredFromSession =
      !hasTargetInUrl && !hasRangeInUrl && !!persistedState;
    this._sidebarCollapsed = !!persistedState?.sidebar_collapsed;
    this._sidebarAccordionTargetsOpen =
      persistedState?.sidebar_accordion_targets_open !== false;
    this._sidebarAccordionDatapointsOpen =
      persistedState?.sidebar_accordion_datapoints_open !== false;
    this._sidebarAccordionAnalysisOpen =
      persistedState?.sidebar_accordion_analysis_open !== false;
    this._sidebarAccordionChartOpen =
      persistedState?.sidebar_accordion_chart_open !== false;
    if (persistedState && Number.isFinite(persistedState.content_split_ratio)) {
      this._contentSplitRatio = clampNumber(
        persistedState.content_split_ratio as number,
        0.25,
        0.75
      );
    }
    let resolvedDatapointScope;
    if (datapointsScopeFromUrl === "all") {
      resolvedDatapointScope = "all";
    } else if (datapointsScopeFromUrl === "hidden") {
      resolvedDatapointScope = "hidden";
    } else if (
      !datapointsScopeFromUrl &&
      persistedState?.datapoint_scope === "all"
    ) {
      resolvedDatapointScope = "all";
    } else if (
      !datapointsScopeFromUrl &&
      persistedState?.datapoint_scope === "hidden"
    ) {
      resolvedDatapointScope = "hidden";
    } else {
      resolvedDatapointScope = "linked";
    }
    this._datapointScope = resolvedDatapointScope;
    this._showChartDatapointIcons =
      persistedState?.show_chart_datapoint_icons !== false;
    this._showChartDatapointLines =
      persistedState?.show_chart_datapoint_lines !== false;
    this._showChartTooltips = persistedState?.show_chart_tooltips !== false;
    this._showChartEmphasizedHoverGuides =
      persistedState?.show_chart_emphasized_hover_guides === true;
    this._chartHoverSnapMode =
      persistedState?.chart_hover_snap_mode === "snap_to_data_points"
        ? "snap_to_data_points"
        : "follow_series";
    this._delinkChartYAxis = persistedState?.delink_chart_y_axis === true;
    this._splitChartView = persistedState?.split_chart_view === true;
    this._showCorrelatedAnomalies =
      persistedState?.show_chart_correlated_anomalies === true;
    this._chartAnomalyOverlapMode = ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS.some(
      (o) => o.value === persistedState?.chart_anomaly_overlap_mode
    )
      ? (persistedState!.chart_anomaly_overlap_mode as string)
      : "all";
    this._showDataGaps = persistedState?.show_data_gaps !== false;
    this._dataGapThreshold = DATA_GAP_THRESHOLD_OPTIONS.some(
      (option) => option.value === persistedState?.data_gap_threshold
    )
      ? (persistedState!.data_gap_threshold as string)
      : "2h";
    this._comparisonWindows = dateWindowsFromUrl.length
      ? dateWindowsFromUrl
      : normalizeDateWindows(
          persistedState?.date_windows as
            | NormalizedHistoryDateWindow[]
            | undefined
        );
    const targetFromUrl = normalizeTargetValue({
      entity_id: entityFromUrl ? entityFromUrl.split(",") : [],
      device_id: deviceFromUrl ? deviceFromUrl.split(",") : [],
      area_id: areaFromUrl ? areaFromUrl.split(",") : [],
      label_id: labelFromUrl ? labelFromUrl.split(",") : [],
    });
    const panelTarget = panelConfigTarget(panelCfg);
    let nextTargetSelection;
    if (Object.keys(targetFromUrl).length) {
      nextTargetSelection = targetFromUrl;
    } else if (!hasTargetInUrl && persistedState?.entities?.length) {
      nextTargetSelection = normalizeTargetValue(
        persistedState.target_selection_raw ||
          persistedState.target_selection || {
            entity_id: persistedState.entities,
          }
      );
    } else {
      nextTargetSelection = panelTarget;
    }
    this._targetSelection = nextTargetSelection;
    this._targetSelectionRaw =
      !hasTargetInUrl && persistedState?.target_selection_raw
        ? persistedState.target_selection_raw
        : nextTargetSelection;
    this._seriesRows =
      !hasTargetInUrl && Array.isArray(persistedState?.series_rows)
        ? normalizeHistorySeriesRows(persistedState.series_rows)
        : buildHistorySeriesRows(
            resolveEntityIdsFromTarget(this._hass, this._targetSelection)
          );
    if (Array.isArray(persistedState?.series_rows)) {
      this._seriesRows = this._mergeSavedSeriesRows(
        this._seriesRows,
        persistedState.series_rows
      );
    }
    this._seriesRows = this._applyPreferredSeriesColors(
      this._seriesRows,
      seriesColorsFromUrl
    );
    this._syncSeriesState();

    const start =
      parseDateValue(startFromUrl) ||
      (!hasRangeInUrl ? parseDateValue(persistedState?.start_time) : null) ||
      parseDateValue(panelCfg.start_time as string | undefined);
    const end =
      parseDateValue(endFromUrl) ||
      (!hasRangeInUrl ? parseDateValue(persistedState?.end_time) : null) ||
      parseDateValue(panelCfg.end_time as string | undefined);
    const zoomStart =
      parseDateValue(zoomStartFromUrl) ||
      (!zoomStartFromUrl && !zoomEndFromUrl
        ? parseDateValue(persistedState?.zoom_start_time)
        : null);
    const zoomEnd =
      parseDateValue(zoomEndFromUrl) ||
      (!zoomStartFromUrl && !zoomEndFromUrl
        ? parseDateValue(persistedState?.zoom_end_time)
        : null);
    this._chartZoomRange = null;
    this._chartZoomCommittedRange =
      zoomStart && zoomEnd && zoomStart < zoomEnd
        ? { start: zoomStart.getTime(), end: zoomEnd.getTime() }
        : null;
    if (start && end && start < end) {
      this._startTime = start;
      this._endTime = end;
      this._hours = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / 3600000)
      );
      return;
    }

    if (Number.isFinite(hoursFromUrl) && hoursFromUrl > 0) {
      this._hours = hoursFromUrl;
    } else if (
      !hasRangeInUrl &&
      persistedState &&
      Number.isFinite(persistedState.hours) &&
      (persistedState.hours as number) > 0
    ) {
      this._hours = persistedState.hours as number;
    } else if (panelCfg.hours_to_show) {
      this._hours = panelCfg.hours_to_show as number;
    }
    const now = new Date();
    this._startTime = startOfUnit(now, "week");
    this._endTime = endOfUnit(now, "week");
    this._hours = Math.max(
      1,
      Math.round(
        (this._endTime.getTime() - this._startTime.getTime()) / 3600000
      )
    );
  }

  _saveSessionState() {
    this._localPageStateDirty = true;
    this._context.navigation.saveSessionState(this);
    this._scheduleUserPreferencesSave();
  }

  _scheduleUserPreferencesSave() {
    if (this._pendingPreferencesSaveTimer) {
      window.clearTimeout(this._pendingPreferencesSaveTimer);
    }
    this._pendingPreferencesSaveTimer = window.setTimeout(() => {
      this._pendingPreferencesSaveTimer = null;
      this._saveUserPreferences();
    }, 160);
  }

  _applyPreferencePageState(state: Nullable<RecordWithUnknownValues>) {
    if (!state || typeof state !== "object") {
      return;
    }
    // Cast to typed partial for safe property access
    const s = state as Partial<HistoryPageSessionState> & {
      [key: string]: unknown;
    };
    if (!this._hasPageStateInUrl) {
      this._sidebarCollapsed = !!s.sidebar_collapsed;
      this._sidebarAccordionTargetsOpen =
        s.sidebar_accordion_targets_open !== false;
      this._sidebarAccordionDatapointsOpen =
        s.sidebar_accordion_datapoints_open !== false;
      this._sidebarAccordionAnalysisOpen =
        s.sidebar_accordion_analysis_open !== false;
      this._sidebarAccordionChartOpen =
        s.sidebar_accordion_chart_open !== false;
      if (Number.isFinite(s.content_split_ratio)) {
        this._contentSplitRatio = clampNumber(
          s.content_split_ratio as number,
          0.25,
          0.75
        );
      }
      this._showChartDatapointIcons = s.show_chart_datapoint_icons !== false;
      this._showChartDatapointLines = s.show_chart_datapoint_lines !== false;
      this._showChartTooltips = s.show_chart_tooltips !== false;
      this._showChartEmphasizedHoverGuides =
        s.show_chart_emphasized_hover_guides === true;
      this._chartHoverSnapMode =
        s.chart_hover_snap_mode === "snap_to_data_points"
          ? "snap_to_data_points"
          : "follow_series";
      this._delinkChartYAxis = s.delink_chart_y_axis === true;
      this._splitChartView = s.split_chart_view === true;
      this._showCorrelatedAnomalies =
        s.show_chart_correlated_anomalies === true;
      this._chartAnomalyOverlapMode =
        ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS.some(
          (option) => option.value === s.chart_anomaly_overlap_mode
        )
          ? (s.chart_anomaly_overlap_mode as string)
          : "all";
      this._showDataGaps = s.show_data_gaps !== false;
      this._dataGapThreshold = DATA_GAP_THRESHOLD_OPTIONS.some(
        (option) => option.value === s.data_gap_threshold
      )
        ? (s.data_gap_threshold as string)
        : this._dataGapThreshold;
      this._datapointScope =
        s.datapoint_scope === "all" || s.datapoint_scope === "hidden"
          ? s.datapoint_scope
          : "linked";
    }

    if (!this._hasTargetInUrl) {
      if (s.target_selection) {
        this._targetSelection = normalizeTargetValue(
          s.target_selection as RecordWithUnknownValues
        );
      }
      if (s.target_selection_raw) {
        this._targetSelectionRaw =
          s.target_selection_raw as RecordWithUnknownValues;
      }
    }

    if (Array.isArray(s.series_rows)) {
      const nextRows = !this._hasTargetInUrl
        ? normalizeHistorySeriesRows(s.series_rows)
        : this._mergeSavedSeriesRows(this._seriesRows, s.series_rows);
      this._seriesRows = this._applyPreferredSeriesColors(nextRows);
      this._syncSeriesState();
    }

    if (!this._hasRangeInUrl) {
      const start = parseDateValue(s.start_time);
      const end = parseDateValue(s.end_time);
      if (start && end && start < end) {
        this._startTime = start;
        this._endTime = end;
      }
      const zoomStart = parseDateValue(s.zoom_start_time);
      const zoomEnd = parseDateValue(s.zoom_end_time);
      this._chartZoomCommittedRange =
        zoomStart && zoomEnd && zoomStart < zoomEnd
          ? { start: zoomStart.getTime(), end: zoomEnd.getTime() }
          : this._chartZoomCommittedRange;
      if (s.hours && Number.isFinite(s.hours) && (s.hours as number) > 0) {
        this._hours = s.hours as number;
      }
      if (Array.isArray(s.date_windows) && !this._hasPageStateInUrl) {
        this._comparisonWindows = normalizeDateWindows(
          s.date_windows as NormalizedHistoryDateWindow[]
        );
      }
    }
  }

  _buildLoadingShell() {
    this._shellBuilt = false;
    const loadingLabel = msg("Loading Datapoints…");
    const root = this.shadowRoot;
    if (!root) {
      return;
    }
    root.innerHTML = `
      <style>${PANEL_HISTORY_LOADING_STYLE}</style>
      <div class="history-panel-loading">
        <div class="history-panel-loading-card" role="status" aria-live="polite">
          <div class="history-panel-loading-spinner" aria-hidden="true"></div>
          <div class="history-panel-loading-text">${loadingLabel}</div>
        </div>
      </div>
    `;
  }

  _buildShell() {
    this._shellBuilt = true;
    const root = this.shadowRoot;
    if (!root) {
      return;
    }
    root.innerHTML = `<style>${PANEL_HISTORY_STYLE}</style>`;

    const shell = document.createElement("panel-shell");
    if (this._hass) {
      shell.hass = this._hass;
    }
    shell.narrow = this._narrow;
    shell.sidebarCollapsed = this._sidebarCollapsed;
    shell.hasSavedState = this._hasSavedPage;
    shell.layoutMode = this._layoutMode;
    root.appendChild(shell);
    this._shellEl = shell;

    // Unslotted content host — projected into panel-shell's default slot.
    // _renderContent and _applyContentSplitLayout operate on this element.
    const contentHost = document.createElement("div");
    contentHost.id = "content";
    shell.appendChild(contentHost);
    this._contentHostEl = contentHost;

    // Wire shell events → panel actions
    shell.addEventListener("dp-shell-menu-download", () =>
      this._downloadSpreadsheet()
    );
    shell.addEventListener("dp-shell-menu-save", () => this._savePageState());
    shell.addEventListener("dp-shell-menu-restore", () =>
      this._restorePageState()
    );
    shell.addEventListener("dp-shell-menu-clear", () =>
      this._clearSavedPageState()
    );
    shell.addEventListener("dp-shell-sidebar-toggle", () =>
      this._toggleSidebarCollapsed()
    );
    shell.addEventListener("dp-shell-scrim-click", () => {
      if (!this._sidebarCollapsed) {
        this._toggleSidebarCollapsed();
      }
    });
    shell.addEventListener("click", this._onCollapsedSidebarClick);

    // Defer DOM-access until after Lit's first render completes.
    shell.updateComplete.then(() => {
      if (!this.isConnected) {
        return;
      }
      this._sidebarOptionsEl =
        shell.shadowRoot?.querySelector("#sidebar-options") ?? null;
      shell.syncLayoutHeight();
      this._applyContentSplitLayout();
      this._mountControls();
      this._renderSidebarOptions();
      this._ensureUiComponentsReady();
    });
  }

  _syncPageLayoutHeight() {
    this._shellEl?.syncLayoutHeight();
  }

  _bootstrapAfterShellBuilt() {
    if (!this._shellBuilt) {
      return;
    }
    this._ensureHistoryBounds();
    this._ensureUserPreferences();
    this._loadSavedPageIndicator();
    this._syncHassBindings();
    this._renderContent();
    if (this._restoredFromSession) {
      this._restoredFromSession = false;
      this._updateUrl({ push: false });
    }
  }

  _ensureUiComponentsReady() {
    if (this._uiReadyPromise) {
      return this._uiReadyPromise;
    }
    const componentTags = [
      "ha-top-app-bar-fixed",
      "ha-menu-button",
      "ha-icon-button",
      "ha-dialog",
      "ha-tooltip",
      "ha-target-picker",
      "ha-date-range-picker",
    ];
    this._uiReadyPromise = ensureHaComponents(componentTags)
      .then((results) => results)
      .then(() => {
        if (!this.isConnected || !this._rendered) {
          return;
        }
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            if (!this.isConnected || !this._rendered) {
              return;
            }
            this._uiReadyApplied = true;
            if (!this._shellBuilt) {
              // First load only — build the full shell DOM.  On reconnect after
              // navigation, _shellBuilt is already true so we skip this; tearing
              // down root.innerHTML while connectedCallback's RAF is mid-flight
              // was the root cause of the crash-on-return bug.
              this._buildShell();
            }
            this._syncControls();
            this._bootstrapAfterShellBuilt();
          });
        });
      })
      .catch((error) => {
        logger.warn(
          "[hass-datapoints panel] ensure UI components ready failed",
          {
            message: error?.message || String(error),
          }
        );
      });
    return this._uiReadyPromise;
  }

  _syncControls() {
    this._syncPageLayoutHeight();
    this._syncHassBindings();
    this._syncRangeUi();
    this._renderSidebarOptions();
  }

  _syncSeriesState() {
    this._seriesRows = normalizeHistorySeriesRows(this._seriesRows);
    this._entities = this._seriesRows.map(
      (row: { entity_id: string }) => row.entity_id
    );
    this._targetSelection = this._entities.length
      ? { entity_id: [...this._entities] }
      : {};
    this._targetSelectionRaw = this._targetSelection;
  }

  _seriesColorQueryKey(entityId: string) {
    return slugifySeriesName(entityName(this._hass, entityId) || entityId);
  }

  _applyPreferredSeriesColors(
    rows: unknown,
    urlColorMap: Nullable<RecordWithStringValues> = null
  ) {
    const queryColors =
      urlColorMap && typeof urlColorMap === "object"
        ? urlColorMap
        : ({} as RecordWithStringValues);
    return normalizeHistorySeriesRows(rows).map((row) => {
      const queryColor = queryColors[this._seriesColorQueryKey(row.entity_id)];
      const preferredColor = this._preferredSeriesColors?.[row.entity_id];
      let nextColor;
      if (/^#[0-9a-f]{6}$/i.test(queryColor || "")) {
        nextColor = queryColor;
      } else if (/^#[0-9a-f]{6}$/i.test(preferredColor || "")) {
        nextColor = preferredColor;
      } else {
        nextColor = row.color;
      }
      return nextColor === row.color ? row : { ...row, color: nextColor };
    });
  }

  _mergeSavedSeriesRows(rows: unknown, savedRows: unknown) {
    const normalizedRows = normalizeHistorySeriesRows(rows);
    const normalizedSavedRows = normalizeHistorySeriesRows(savedRows);
    if (!normalizedSavedRows.length) {
      return normalizedRows;
    }
    const savedRowMap = new Map(
      normalizedSavedRows.map((row) => [row.entity_id, row])
    );
    return normalizedRows.map((row) => {
      const savedRow = savedRowMap.get(row.entity_id);
      if (!savedRow) {
        return row;
      }
      return {
        ...row,
        color: savedRow.color,
        visible: savedRow.visible,
        analysis: savedRow.analysis,
      };
    });
  }

  _syncHassBindings() {
    if (this._shellEl) {
      if (this._hass) {
        this._shellEl.hass = this._hass;
      }
      this._shellEl.narrow = this._narrow;
    }
    this._syncSidebarUi();
    if (this._targetControl) {
      if (this._hass) {
        this._targetControl.hass = this._hass;
      }
      this._targetControl.value = {};
    }
    this._renderTargetRows();
    this.shadowRoot
      ?.querySelectorAll(
        "[data-series-icon-entity-id], [data-series-collapsed-icon-entity-id]"
      )
      .forEach((iconEl) => {
        const icon = iconEl as HTMLElement & {
          dataset: DOMStringMap;
          stateObj?: unknown;
          hass?: unknown;
        };
        const entityId =
          icon.dataset.seriesIconEntityId ||
          icon.dataset.seriesCollapsedIconEntityId;
        if (!entityId) {
          return;
        }
        icon.stateObj = this._hass?.states?.[entityId];
        icon.hass = this._hass;
      });
    if (this._rangeToolbarComp) {
      this._rangeToolbarComp.hass = this._hass ?? null;
    }
  }

  _syncRangeUi() {
    if (!this._dateControl) {
      return;
    }
    this._syncOptionsMenu();
    this._syncRangeControl();
  }

  _renderSidebarOptions() {
    if (!this._sidebarOptionsComp) {
      return;
    }
    let yAxisMode;
    if (this._splitChartView) {
      yAxisMode = "split";
    } else if (this._delinkChartYAxis) {
      yAxisMode = "unique";
    } else {
      yAxisMode = "combined";
    }
    this._sidebarOptionsComp.datapointScope = this._datapointScope;
    this._sidebarOptionsComp.showIcons = this._showChartDatapointIcons;
    this._sidebarOptionsComp.showLines = this._showChartDatapointLines;
    this._sidebarOptionsComp.showTooltips = this._showChartTooltips;
    this._sidebarOptionsComp.showHoverGuides =
      this._showChartEmphasizedHoverGuides;
    this._sidebarOptionsComp.hoverSnapMode = this._chartHoverSnapMode;
    this._sidebarOptionsComp.showCorrelatedAnomalies =
      this._showCorrelatedAnomalies;
    this._sidebarOptionsComp.showDataGaps = this._showDataGaps;
    this._sidebarOptionsComp.dataGapThreshold = this._dataGapThreshold;
    this._sidebarOptionsComp.yAxisMode = yAxisMode;
    this._sidebarOptionsComp.anomalyOverlapMode = this._chartAnomalyOverlapMode;
    this._sidebarOptionsComp.anyAnomaliesEnabled = (
      this._seriesRows ?? []
    ).some(
      (r: { analysis?: { show_anomalies?: boolean } }) =>
        r.analysis?.show_anomalies === true
    );
    this._sidebarOptionsComp.targetsOpen = this._sidebarAccordionTargetsOpen;
    this._sidebarOptionsComp.datapointsOpen =
      this._sidebarAccordionDatapointsOpen;
    this._sidebarOptionsComp.analysisOpen = this._sidebarAccordionAnalysisOpen;
    this._sidebarOptionsComp.chartOpen = this._sidebarAccordionChartOpen;
    this._refreshCollapsedOptionsPopup();
  }

  _formatComparisonLabel(start: Date, end: Date) {
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const fmtYear = (d: Date) =>
      d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    const sameYear = start.getFullYear() === end.getFullYear();
    return sameYear
      ? `${fmt(start)} – ${fmt(end)}`
      : `${fmtYear(start)} – ${fmtYear(end)}`;
  }

  _getComparisonPreviewOverlay() {
    const comparisonWindow = this._getActiveComparisonWindow();
    if (!comparisonWindow || !this._startTime || !this._endTime) {
      return null;
    }
    const windowStart = parseDateValue(comparisonWindow.start_time);
    const windowEnd = parseDateValue(comparisonWindow.end_time);
    if (!windowStart || !windowEnd) {
      return null;
    }
    const actualSpanMs = this._endTime.getTime() - this._startTime.getTime();
    if (!Number.isFinite(actualSpanMs) || actualSpanMs <= 0) {
      return null;
    }
    const actualStart = new Date(windowStart.getTime());
    const actualEnd = new Date(windowStart.getTime() + actualSpanMs);
    const windowRangeLabel = this._formatComparisonLabel(
      windowStart,
      windowEnd
    );
    const actualRangeLabel = this._formatComparisonLabel(
      actualStart,
      actualEnd
    );
    if (windowRangeLabel === actualRangeLabel) {
      return null;
    }
    return {
      label: comparisonWindow.label || "Preview",
      window_range_label: windowRangeLabel,
      actual_range_label: actualRangeLabel,
    };
  }

  _getPreviewComparisonWindows() {
    const comparisonIds = [];
    if (this._selectedComparisonWindowId) {
      comparisonIds.push(this._selectedComparisonWindowId);
    }
    if (
      this._hoveredComparisonWindowId &&
      !comparisonIds.includes(this._hoveredComparisonWindowId)
    ) {
      comparisonIds.push(this._hoveredComparisonWindowId);
    }
    if (!comparisonIds.length) {
      return [];
    }
    if (!this._startTime || !this._endTime) {
      return [];
    }
    const startTime = this._startTime!;
    const previewWindows = comparisonIds
      .map(
        (id: string) => this._comparisonWindows.find((w) => w.id === id) ?? null
      )
      .filter((w): w is HistoryComparisonWindowState => w !== null)
      .map((window) => ({
        ...window,
        time_offset_ms:
          new Date(window.start_time).getTime() - startTime.getTime(),
      }));
    return previewWindows;
  }

  _getPreloadComparisonWindows() {
    if (!this._startTime || !this._endTime) {
      return [];
    }
    const startTime = this._startTime!;
    const preloadWindows = this._comparisonWindows
      .map((window) => ({
        ...window,
        time_offset_ms:
          new Date(window.start_time).getTime() - startTime.getTime(),
      }))
      .filter((window) => Number.isFinite(window.time_offset_ms));
    return preloadWindows;
  }

  _getActiveComparisonWindow() {
    if (this._hoveredComparisonWindowId) {
      return (
        this._comparisonWindows.find(
          (window: NormalizedHistoryDateWindow) =>
            window.id === this._hoveredComparisonWindowId
        ) || null
      );
    }
    if (this._selectedComparisonWindowId) {
      return (
        this._comparisonWindows.find(
          (window: NormalizedHistoryDateWindow) =>
            window.id === this._selectedComparisonWindowId
        ) || null
      );
    }
    return null;
  }

  _formatDateWindowInputValue(date: Nullable<Date>) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  _parseDateWindowInputValue(value: Nullable<string> | undefined) {
    if (!value || typeof value !== "string") {
      return null;
    }
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
    if (!match) {
      return null;
    }
    const [, year, month, day, hour, minute] = match;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      0,
      0
    );
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }

  _shiftDateWindowByUnit(date: Date, unit: RangeUnit, amount: number) {
    const shifted = new Date(date);
    if (unit === "day") {
      shifted.setDate(shifted.getDate() + amount);
      return shifted;
    }
    if (unit === "week") {
      shifted.setDate(shifted.getDate() + amount * 7);
      return shifted;
    }
    if (unit === "month") {
      shifted.setMonth(shifted.getMonth() + amount);
      return shifted;
    }
    if (unit === "year") {
      shifted.setFullYear(shifted.getFullYear() + amount);
      return shifted;
    }
    return shifted;
  }

  _getRoundedDateWindowUnit(start: Date, end: Date): Nullable<RangeUnit> {
    if (!(start instanceof Date) || !(end instanceof Date) || !(start < end)) {
      return null;
    }
    const supportedUnits: RangeUnit[] = ["day", "week", "month", "year"];
    for (const unit of supportedUnits) {
      const roundedStart = startOfUnit(start, unit);
      const roundedEnd = endOfUnit(start, unit);
      if (
        roundedStart?.getTime?.() === start.getTime() &&
        roundedEnd?.getTime?.() === end.getTime()
      ) {
        return unit;
      }
    }
    return null;
  }

  _syncDateWindowDialogInputs() {
    const startVal = this._formatDateWindowInputValue(
      this._dateWindowDialogDraftRange?.start || null
    );
    const endVal = this._formatDateWindowInputValue(
      this._dateWindowDialogDraftRange?.end || null
    );
    // Update the LitElement component when mounted.
    if (this._dateWindowDialogComp) {
      this._dateWindowDialogComp.startValue = startVal;
      this._dateWindowDialogComp.endValue = endVal;
      return;
    }
    // Legacy ha-dialog fallback.
    if (this._dateWindowDialogStartEl) {
      this._dateWindowDialogStartEl.value = startVal;
    }
    if (this._dateWindowDialogEndEl) {
      this._dateWindowDialogEndEl.value = endVal;
    }
  }

  _handleDateWindowDialogInputChange() {
    const start = this._parseDateWindowInputValue(
      this._dateWindowDialogStartEl?.value || ""
    );
    const end = this._parseDateWindowInputValue(
      this._dateWindowDialogEndEl?.value || ""
    );
    if (start && end && start < end) {
      this._dateWindowDialogDraftRange = { start, end };
      return;
    }
    this._dateWindowDialogDraftRange = null;
  }

  _applyDateWindowShortcut(direction: number) {
    if (this._editingDateWindowId) {
      return;
    }
    const start = this._dateWindowDialogDraftRange?.start;
    const end = this._dateWindowDialogDraftRange?.end;
    if (!(start instanceof Date) || !(end instanceof Date) || !(start < end)) {
      return;
    }
    const roundedUnit = this._getRoundedDateWindowUnit(start, end);
    let nextStart;
    let nextEnd;
    if (roundedUnit) {
      nextStart = startOfUnit(
        this._shiftDateWindowByUnit(start, roundedUnit, direction),
        roundedUnit
      );
      nextEnd = endOfUnit(nextStart, roundedUnit);
    } else {
      const spanMs = end.getTime() - start.getTime();
      nextStart = new Date(start.getTime() + direction * spanMs);
      nextEnd = new Date(end.getTime() + direction * spanMs);
    }
    this._dateWindowDialogDraftRange = {
      start: nextStart,
      end: nextEnd,
    };
    this._syncDateWindowDialogInputs();
  }

  _ensureDateWindowDialog() {
    // The dialog is pre-mounted as a LitElement in _mountControls(); no legacy ha-dialog needed.
    if (
      this._dateWindowDialogComp ||
      this._dateWindowDialogEl ||
      !this.shadowRoot
    )
      return;
    const dialog = document.createElement("ha-dialog") as HTMLElement & {
      scrimClickAction?: boolean;
      escapeKeyAction?: boolean;
      open?: boolean;
      headerTitle?: string;
    };
    dialog.id = "date-window-dialog";
    dialog.setAttribute("hideActions", "");
    dialog.scrimClickAction = true;
    dialog.escapeKeyAction = true;
    dialog.open = false;
    dialog.headerTitle = "Add date window";
    dialog.style.setProperty(
      "--dialog-content-padding",
      `0 var(--dp-spacing-lg) var(--dp-spacing-lg)`
    );
    dialog.innerHTML = `
      <div class="date-window-dialog-content">
        <div class="date-window-dialog-body">
          A date window saves a named date range as a tab, so you can quickly preview it against the selected range or jump the chart back to it later.
        </div>
        <div class="date-window-dialog-field name-field">
          <ha-textfield id="date-window-name" label="Name" placeholder="e.g. Heating season start"></ha-textfield>
        </div>
        <div class="date-window-dialog-field">
          <label>Date range</label>
          <div class="date-window-dialog-dates">
            <div class="date-window-dialog-field">
              <label for="date-window-start">Start</label>
              <input id="date-window-start" class="date-window-dialog-input" type="datetime-local" step="60">
            </div>
            <div class="date-window-dialog-field">
              <label for="date-window-end">End</label>
              <input id="date-window-end" class="date-window-dialog-input" type="datetime-local" step="60">
            </div>
          </div>
        </div>
        <div class="date-window-dialog-shortcuts" id="date-window-shortcuts" hidden>
          <ha-button id="date-window-previous">Use previous range</ha-button>
          <ha-button id="date-window-next">Use next range</ha-button>
        </div>
        <div class="date-window-dialog-actions">
          <ha-button class="date-window-dialog-delete" id="date-window-delete" hidden>Delete date window</ha-button>
          <div class="date-window-dialog-actions-right">
            <ha-button class="date-window-dialog-cancel" id="date-window-cancel">Cancel</ha-button>
            <ha-button raised class="date-window-dialog-submit" id="date-window-submit">Create date window</ha-button>
          </div>
        </div>
      </div>
    `;
    dialog.addEventListener("closed", () => this._closeDateWindowDialog(true));
    this.shadowRoot.appendChild(dialog);
    this._dateWindowDialogEl = dialog as unknown as LegacyDialogElement;
    this._dateWindowDialogNameEl = dialog.querySelector("#date-window-name");
    this._dateWindowDialogStartEl = dialog.querySelector("#date-window-start");
    this._dateWindowDialogEndEl = dialog.querySelector("#date-window-end");
    this._dateWindowDialogShortcutsEl = dialog.querySelector(
      "#date-window-shortcuts"
    );
    if (this._hass && this._dateWindowDialogNameEl) {
      this._dateWindowDialogNameEl.hass = this._hass;
    }
    dialog
      .querySelector("#date-window-cancel")
      ?.addEventListener("click", () => this._closeDateWindowDialog());
    dialog
      .querySelector("#date-window-submit")
      ?.addEventListener("click", () => this._createDateWindowFromDialog());
    dialog
      .querySelector("#date-window-delete")
      ?.addEventListener("click", () => this._deleteEditingDateWindow());
    this._dateWindowDialogStartEl?.addEventListener("change", () =>
      this._handleDateWindowDialogInputChange()
    );
    this._dateWindowDialogEndEl?.addEventListener("change", () =>
      this._handleDateWindowDialogInputChange()
    );
    dialog
      .querySelector("#date-window-previous")
      ?.addEventListener("click", () => this._applyDateWindowShortcut(-1));
    dialog
      .querySelector("#date-window-next")
      ?.addEventListener("click", () => this._applyDateWindowShortcut(1));
  }

  _openDateWindowDialog(
    targetWindow: Nullable<NormalizedHistoryDateWindow> = null
  ) {
    this._ensureDateWindowDialog();
    this._dateWindowDialogOpen = true;
    this._editingDateWindowId = targetWindow?.id || null;
    const dialogStart = targetWindow
      ? parseDateValue(targetWindow.start_time)
      : this._startTime;
    const dialogEnd = targetWindow
      ? parseDateValue(targetWindow.end_time)
      : this._endTime;
    this._dateWindowDialogDraftRange =
      dialogStart && dialogEnd && dialogStart < dialogEnd
        ? { start: new Date(dialogStart), end: new Date(dialogEnd) }
        : null;

    // Prefer the new LitElement component if mounted.
    if (this._dateWindowDialogComp) {
      this._dateWindowDialogComp.heading = targetWindow
        ? msg("Edit date window")
        : msg("Add date window");
      this._dateWindowDialogComp.submitLabel = targetWindow
        ? msg("Save date window")
        : msg("Create date window");
      this._dateWindowDialogComp.showDelete = !!targetWindow;
      this._dateWindowDialogComp.showShortcuts = !targetWindow;
      this._dateWindowDialogComp.name = targetWindow?.label || "";
      this._dateWindowDialogComp.startValue = this._formatDateWindowInputValue(
        this._dateWindowDialogDraftRange?.start || null
      );
      this._dateWindowDialogComp.endValue = this._formatDateWindowInputValue(
        this._dateWindowDialogDraftRange?.end || null
      );
      this._dateWindowDialogComp.rangeBounds = this._rangeBounds ?? null;
      this._dateWindowDialogComp.zoomLevel = this._zoomLevel ?? "auto";
      this._dateWindowDialogComp.dateSnapping = this._dateSnapping ?? "hour";
      this._dateWindowDialogComp.open = true;
      return;
    }

    // Legacy ha-dialog fallback (used when _dateWindowDialogComp is not available).
    if (this._dateWindowDialogEl) {
      this._dateWindowDialogEl.open = true;
      this._dateWindowDialogEl.headerTitle = targetWindow
        ? msg("Edit date window")
        : msg("Add date window");
    }
    const submitButton = this._dateWindowDialogEl?.querySelector(
      "#date-window-submit"
    );
    if (submitButton) {
      submitButton.textContent = targetWindow
        ? msg("Save date window")
        : msg("Create date window");
    }
    const deleteButton = this._dateWindowDialogEl?.querySelector(
      "#date-window-delete"
    ) as HTMLElement | null;
    if (deleteButton) {
      deleteButton.hidden = !targetWindow;
      deleteButton.style.display = targetWindow ? "" : "none";
    }
    if (this._dateWindowDialogShortcutsEl) {
      this._dateWindowDialogShortcutsEl.hidden = !!targetWindow;
    }
    if (this._dateWindowDialogNameEl) {
      this._dateWindowDialogNameEl.value = targetWindow?.label || "";
    }
    this._syncDateWindowDialogInputs();
    window.requestAnimationFrame(() => this._dateWindowDialogNameEl?.focus());
  }

  _closeDateWindowDialog(fromClosedEvent = false) {
    this._dateWindowDialogOpen = false;
    this._editingDateWindowId = null;
    this._dateWindowDialogDraftRange = null;
    this._pendingAnomalyComparisonWindowEntityId = null;
    if (!fromClosedEvent) {
      if (this._dateWindowDialogComp) {
        this._dateWindowDialogComp.open = false;
      } else if (this._dateWindowDialogEl) {
        this._dateWindowDialogEl.open = false;
      }
    }
  }

  _createDateWindowFromDialog(
    overrides: { name?: unknown; start?: unknown; end?: unknown } = {}
  ) {
    // Accept optional overrides from the LitElement component's dp-window-submit event.
    const rawName =
      overrides.name != null
        ? overrides.name
        : this._dateWindowDialogNameEl?.value || "";
    const label = String(rawName).trim();
    const parsedStart = overrides.start
      ? this._parseDateWindowInputValue(String(overrides.start))
      : null;
    const parsedEnd = overrides.end
      ? this._parseDateWindowInputValue(String(overrides.end))
      : null;
    const start =
      parsedStart || this._dateWindowDialogDraftRange?.start || null;
    const end = parsedEnd || this._dateWindowDialogDraftRange?.end || null;
    if (!label || !start || !end || start >= end) {
      return;
    }
    const existingIds = new Set<string>(
      this._comparisonWindows.map(
        (window: NormalizedHistoryDateWindow) => window.id
      )
    );
    const nextWindow = {
      id: this._editingDateWindowId || makeDateWindowId(label, existingIds),
      label,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    };
    this._comparisonWindows = normalizeDateWindows(
      this._editingDateWindowId
        ? this._comparisonWindows.map((window: NormalizedHistoryDateWindow) =>
            window.id === this._editingDateWindowId ? nextWindow : window
          )
        : [...this._comparisonWindows, nextWindow]
    );
    this._saveUserPreferences();
    this._saveSessionState();
    this._updateUrl({ push: false });
    const pendingEntityId = this._pendingAnomalyComparisonWindowEntityId;
    const wasCreatingNew = !this._editingDateWindowId;
    this._pendingAnomalyComparisonWindowEntityId = null;
    this._closeDateWindowDialog();
    if (pendingEntityId && wasCreatingNew) {
      this._setSeriesAnalysisOption(
        pendingEntityId,
        "anomaly_comparison_window_id",
        nextWindow.id
      );
    }
    this._renderContent();
  }

  async _deleteDateWindow(id: string) {
    if (!id) {
      return;
    }
    const windowToDelete = this._comparisonWindows.find(
      (window: NormalizedHistoryDateWindow) => window.id === id
    );
    const confirmed = await confirmDestructiveAction(this, {
      title: msg("Delete date window"),
      message: `${msg("Delete")} "${windowToDelete?.label || msg("this date window")}"?`,
      confirmLabel: msg("Delete date window"),
    });
    if (!confirmed) {
      return false;
    }
    const nextWindows = this._comparisonWindows.filter(
      (window: NormalizedHistoryDateWindow) => window.id !== id
    );
    if (nextWindows.length === this._comparisonWindows.length) {
      return false;
    }
    if (this._hoveredComparisonWindowId === id) {
      this._hoveredComparisonWindowId = null;
    }
    if (this._selectedComparisonWindowId === id) {
      this._selectedComparisonWindowId = null;
      this._clearDeltaAnalysisSelectionState();
    }
    if (this._hoveredComparisonWindowId == null) {
      this._updateComparisonRangePreview();
    }
    this._comparisonWindows = nextWindows;
    this._saveUserPreferences();
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderContent();
    return true;
  }

  async _deleteEditingDateWindow() {
    const id = this._editingDateWindowId;
    if (!id) {
      return;
    }
    const deleted = await this._deleteDateWindow(id);
    if (deleted) {
      this._closeDateWindowDialog();
    }
  }

  _handleComparisonTabHover(id: Nullable<string>) {
    this._context.orchestration.handleComparisonTabHover({
      id,
      hoveredComparisonWindowId: this._hoveredComparisonWindowId,
      setHoveredComparisonWindowId: (value: Nullable<string>) => {
        this._hoveredComparisonWindowId = value;
      },
      updateComparisonRangePreview: () => {
        this._updateComparisonRangePreview();
      },
      updateChartHoverIndicator: () => {
        this._updateChartHoverIndicator();
      },
      renderContent: () => {
        this._renderContent();
      },
    });
  }

  _handleComparisonTabLeave(id: Nullable<string>) {
    this._context.orchestration.handleComparisonTabLeave({
      id,
      hoveredComparisonWindowId: this._hoveredComparisonWindowId,
      setHoveredComparisonWindowId: (value: Nullable<string>) => {
        this._hoveredComparisonWindowId = value;
      },
      updateComparisonRangePreview: () => {
        this._updateComparisonRangePreview();
      },
      updateChartHoverIndicator: () => {
        this._updateChartHoverIndicator();
      },
      renderContent: () => {
        this._renderContent();
      },
    });
  }

  _handleComparisonLoading(
    ev: DetailEvent<{ ids?: string[]; loading?: boolean }>
  ) {
    const ids = Array.isArray(ev?.detail?.ids)
      ? ev.detail.ids.filter(Boolean)
      : [];
    const loading = ev?.detail?.loading === true;
    this._loadingComparisonWindowIds = loading
      ? [...new Set([...this._loadingComparisonWindowIds, ...ids])]
      : this._loadingComparisonWindowIds.filter(
          (id: string) => !ids.includes(id)
        );
    this._renderComparisonTabs();
  }

  _handleAnalysisComputing(
    ev: DetailEvent<{
      computing?: boolean;
      entityIds?: string[];
      progress?: number;
    }>
  ) {
    const computing = ev?.detail?.computing === true;
    const entityIds = Array.isArray(ev?.detail?.entityIds)
      ? ev.detail.entityIds
      : [];
    const computingProgress = computing ? 0 : 100;
    const progress =
      typeof ev?.detail?.progress === "number"
        ? ev.detail.progress
        : computingProgress;

    if (computing) {
      for (const id of entityIds) {
        this._computingEntityIds.add(id);
      }
      // On the initial progress=0 signal, seed _computingMethods from the current row
      // configs so each entity knows which anomaly method spinners to show.
      if (progress === 0) {
        for (const id of entityIds) {
          const row = this._seriesRows?.find((r) => r.entity_id === id);
          const methods =
            row?.analysis?.show_anomalies === true &&
            Array.isArray(row.analysis.anomaly_methods)
              ? row.analysis.anomaly_methods
              : [];
          this._computingMethods.set(id, new Set(methods));
          logger.log(
            `[datapoints] analysis started for ${id} — methods: [${methods.join(", ")}]`
          );
        }
      } else {
        logger.log(`[datapoints] analysis progress ${progress}%`);
      }
    } else {
      for (const id of entityIds) {
        this._computingEntityIds.delete(id);
        this._computingMethods.delete(id);
      }
      logger.log(`[datapoints] analysis complete (${entityIds.join(", ")})`);
    }
    this._analysisProgress = progress;
    this._pushComputingStateToRowList();
  }

  _handleAnalysisMethodResult(
    ev: DetailEvent<{ entityId?: string; method?: string }>
  ) {
    logger.log("[datapoints] _handleAnalysisMethodResult received", ev?.detail);
    const entityId = ev?.detail?.entityId;
    const method = ev?.detail?.method;
    if (!entityId || !method) {
      logger.log(
        "[datapoints] _handleAnalysisMethodResult: missing entityId or method, ignoring"
      );
      return;
    }
    // Replace the Set with a new instance so Lit detects the reference change and re-renders.
    // Mutating the existing Set in place would leave the same object reference in the Map,
    // which Lit treats as unchanged and skips the re-render.
    const current = this._computingMethods.get(entityId);
    if (current) {
      const next = new Set(current);
      next.delete(method);
      this._computingMethods.set(entityId, next);
    }
    const remaining = [...(this._computingMethods.get(entityId) ?? [])];
    logger.log(
      `[datapoints] method done: ${method} for ${entityId} — remaining: [${remaining.join(", ") || "none"}]`
    );
    this._pushComputingStateToRowList();
  }

  _pushComputingStateToRowList() {
    if (this._rowListEl) {
      this._rowListEl.computingEntityIds = new Set(this._computingEntityIds);
      this._rowListEl.analysisProgress = this._analysisProgress;
      // Pass a fresh Map so Lit detects the reference change and re-renders.
      this._rowListEl.computingMethodsByEntity = new Map(
        this._computingMethods
      );
    }
  }

  _clearDeltaAnalysisSelectionState() {}

  _handleComparisonTabActivate(id: Nullable<string>) {
    this._context.orchestration.handleComparisonTabActivate({
      id,
      comparisonWindows: this._comparisonWindows,
      selectedComparisonWindowId: this._selectedComparisonWindowId,
      setSelectedComparisonWindowId: (value: Nullable<string>) => {
        this._selectedComparisonWindowId = value;
      },
      setHoveredComparisonWindowId: (value: Nullable<string>) => {
        this._hoveredComparisonWindowId = value;
      },
      clearDeltaAnalysisSelectionState: () => {
        this._clearDeltaAnalysisSelectionState();
      },
      updateComparisonRangePreview: () => {
        this._updateComparisonRangePreview();
      },
      updateChartHoverIndicator: () => {
        this._updateChartHoverIndicator();
      },
      renderComparisonTabs: () => {
        this._renderComparisonTabs();
      },
      renderContent: () => {
        this._renderContent();
      },
      setAdjustComparisonAxisScale: (value: boolean) => {
        if (this._chartEl) {
          this._chartEl._adjustComparisonAxisScale = value;
        }
      },
    });
  }

  _syncSidebarUi() {
    if (this._shellEl) {
      this._shellEl.sidebarCollapsed = this._sidebarCollapsed;
    }
    if (this._historyTargetsComp) {
      this._historyTargetsComp.sidebarCollapsed = this._sidebarCollapsed;
    }
    if (this._rangeToolbarComp) {
      this._rangeToolbarComp.sidebarCollapsed = this._sidebarCollapsed;
    }
  }

  _updateLayoutMode() {
    const prev = this._layoutMode;
    if (this._mqMobile.matches) {
      this._layoutMode = "mobile";
    } else if (this._mqTablet.matches) {
      this._layoutMode = "tablet";
    } else {
      this._layoutMode = "desktop";
    }
    if (prev !== this._layoutMode) {
      if (this._shellEl) {
        this._shellEl.layoutMode = this._layoutMode;
      }
      this._syncSidebarUi();
      this._syncMobileDateInputs();
    }
  }

  _syncMobileDateInputs() {
    this._rangeToolbarComp?.syncMobileDates(this._startTime, this._endTime);
  }

  _applyContentSplitLayout() {
    const content = this._contentHostEl;
    if (!content) {
      return;
    }
    // Drive the resizable-panes atom when present; fall back to CSS variable.
    const resizablePanes = content.querySelector(
      "#content-resizable-panes"
    ) as Nullable<ResizablePanesElement>;
    if (resizablePanes) {
      resizablePanes.ratio = this._contentSplitRatio;
    } else {
      content.style.setProperty(
        "--content-top-size",
        `${Math.round(this._contentSplitRatio * 1000) / 10}%`
      );
    }
    this._updateComparisonTabsOverflow();
  }

  _requestChartResizeRedraw() {
    this._context.orchestration.requestChartResizeRedraw(this._chartEl);
  }

  _toggleSidebarCollapsed() {
    this._sidebarCollapsed = !this._sidebarCollapsed;
    if (!this._sidebarCollapsed) {
      this._hideCollapsedTargetPopup();
    }
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._syncSidebarUi();
    window.requestAnimationFrame(() => {
      if (!this.isConnected) {
        return;
      }
      this._syncRangeControl();
    });
  }

  _handleCollapsedSidebarClick() {
    if (!this._sidebarCollapsed) {
      // Intentionally ignored. Background clicks in the collapsed rail should do nothing.
    }
  }

  _openTargetPicker(anchorEl: Nullable<HTMLElement> | undefined = null) {
    this._context.orchestration.openTargetPicker(this._targetControl, anchorEl);
  }

  _setDatapointScope(scope: string) {
    let nextScope;
    if (scope === "all") {
      nextScope = "all";
    } else if (scope === "hidden") {
      nextScope = "hidden";
    } else {
      nextScope = "linked";
    }
    if (nextScope === this._datapointScope) {
      return;
    }
    this._datapointScope = nextScope;
    this._timelineEvents = [];
    this._timelineEventsKey = "";
    this._saveSessionState();
    this._renderSidebarOptions();
    this._updateUrl({ push: false });
    this._ensureTimelineEvents();
    this._renderContent();
  }

  _setChartYAxisMode(mode: string) {
    const nextDelink = mode === "unique";
    const nextSplit = mode === "split";
    if (
      this._delinkChartYAxis === nextDelink &&
      this._splitChartView === nextSplit
    ) {
      return;
    }
    this._delinkChartYAxis = nextDelink;
    this._splitChartView = nextSplit;
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderSidebarOptions();
    this._renderContent();
  }

  _setChartDatapointDisplayOption(kind: string, enabled: unknown) {
    const normalized = !!enabled;
    if (kind === "icons") {
      if (this._showChartDatapointIcons === normalized) {
        return;
      }
      this._showChartDatapointIcons = normalized;
    } else if (kind === "lines") {
      if (this._showChartDatapointLines === normalized) {
        return;
      }
      this._showChartDatapointLines = normalized;
    } else if (kind === "tooltips") {
      if (this._showChartTooltips === normalized) {
        return;
      }
      this._showChartTooltips = normalized;
    } else if (kind === "hover_guides") {
      if (this._showChartEmphasizedHoverGuides === normalized) {
        return;
      }
      this._showChartEmphasizedHoverGuides = normalized;
    } else if (kind === "hover_snap_mode") {
      const value =
        String(enabled) === "snap_to_data_points"
          ? "snap_to_data_points"
          : "follow_series";
      if (this._chartHoverSnapMode === value) {
        return;
      }
      this._chartHoverSnapMode = value;
    } else if (kind === "correlated_anomalies") {
      if (this._showCorrelatedAnomalies === normalized) {
        return;
      }
      this._showCorrelatedAnomalies = normalized;
    } else if (kind === "delink_y_axis") {
      if (this._delinkChartYAxis === normalized) {
        return;
      }
      this._delinkChartYAxis = normalized;
      if (normalized) {
        this._splitChartView = false;
      }
    } else if (kind === "split_chart_view") {
      if (this._splitChartView === normalized) {
        return;
      }
      this._splitChartView = normalized;
      if (normalized) {
        this._delinkChartYAxis = false;
      }
    } else if (kind === "data_gaps") {
      if (this._showDataGaps === normalized) {
        return;
      }
      this._showDataGaps = normalized;
    } else if (kind === "data_gap_threshold") {
      const value = String(enabled);
      if (this._dataGapThreshold === value) {
        return;
      }
      this._dataGapThreshold = value;
    } else {
      return;
    }
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderSidebarOptions();
    this._renderContent();
  }

  async _ensureHistoryBounds() {
    await this._context.fetch.ensureHistoryBounds({
      onSuccess: ({ start, end }: { start: unknown; end: unknown }) => {
        this._historyStartTime = parseDateValue(
          start as string | number | Nullable<Date> | undefined
        );
        this._historyEndTime = parseDateValue(
          end as string | number | Nullable<Date> | undefined
        );
        if (this._zoomLevel === "auto") {
          this._resolvedAutoZoomLevel = null;
        }
        if (this._rendered) {
          this._syncControls();
        }
      },
      onError: (err: unknown) => {
        logger.warn("[hass-datapoints] failed to load event bounds:", err);
      },
    });
  }

  async _ensureTimelineEvents() {
    if (!this._hass || !this._rangeBounds) {
      return;
    }
    if (
      this._datapointScope === "hidden" ||
      (this._datapointScope === "linked" && this._entities.length === 0)
    ) {
      this._timelineEvents = [];
      this._context.fetch.resetTimelineEvents();
      if (this._rendered && this._rangeToolbarComp) {
        this._rangeToolbarComp.timelineEvents = [];
      }
      return;
    }
    const startIso = new Date(this._rangeBounds!.min).toISOString();
    const endIso = new Date(this._rangeBounds!.max).toISOString();
    await this._context.fetch.loadTimelineEvents({
      startIso,
      endIso,
      datapointScope: this._datapointScope,
      entityIds: this._entities,
      onSuccess: (events: unknown[], key: string) => {
        this._timelineEvents = events;
        this._timelineEventsKey = key;
        if (this._rendered && this._rangeToolbarComp) {
          this._rangeToolbarComp.timelineEvents = this._timelineEvents;
        }
      },
      onError: (err: unknown) => {
        logger.warn("[hass-datapoints] failed to load timeline events:", err);
      },
    });
  }

  async _ensureUserPreferences() {
    await this._context.fetch.ensureUserPreferences({
      preferencesKey: PANEL_HISTORY_PREFERENCES_KEY,
      fallbackValue: null,
      onSuccess: (preferences: unknown) => {
        const normalized = normalizeHistoryPagePreferences(
          preferences as Nullable<RecordWithUnknownValues>,
          {
            zoomOptions: RANGE_ZOOM_OPTIONS,
            snapOptions: RANGE_SNAP_OPTIONS,
          }
        );
        this._zoomLevel = normalized.zoomLevel;
        this._dateSnapping = normalized.dateSnapping;
        this._resolvedAutoZoomLevel =
          normalized.zoomLevel === "auto" ? null : this._resolvedAutoZoomLevel;
        this._preferredSeriesColors = normalized.preferredSeriesColors;
        this._comparisonWindows = this._comparisonWindows.length
          ? this._comparisonWindows
          : normalized.comparisonWindows;
        this._seriesRows = this._applyPreferredSeriesColors(this._seriesRows);
        if (!this._localPageStateDirty) {
          this._applyPreferencePageState(normalized.pageState);
        }
        if (normalized.shouldPersistDefaults) {
          this._saveUserPreferences();
        }
        if (this._rendered) {
          this._renderTargetRows();
          this._syncControls();
          this._updateUrl({ push: false });
          this._renderContent();
        }
      },
      onError: (err: unknown) => {
        logger.warn("[hass-datapoints] failed to load panel preferences:", err);
      },
    });
  }

  _saveUserPreferences() {
    if (!this._hass) {
      return;
    }
    const payload = buildHistoryPagePreferencesPayload(
      this as unknown as HistoryPageSource
    );
    this._preferredSeriesColors = payload.series_colors ?? {};
    this._context.persistence.saveUserPreferences({
      preferencesKey: PANEL_HISTORY_PREFERENCES_KEY,
      payload,
    });
  }

  _mountControls() {
    if (!this._shellEl) {
      return;
    }

    const histTargets = this._mountHistoryTargetsControl();
    this._mountTargetPickerControl(histTargets);
    this._mountRangeToolbarControl();
    this._mountSidebarOptionsControl();
    this._mountDateWindowDialogControl();
    this._syncControls();
  }

  _mountHistoryTargetsControl() {
    const histTargets = document.createElement(
      "history-targets"
    ) as HistoryTargetsElement;
    histTargets.slot = "sidebar";
    histTargets.rows = [];
    histTargets.states = {};
    histTargets.hass = this._hass ?? null;
    histTargets.comparisonWindows = this._comparisonWindows;
    histTargets.canShowDeltaAnalysis = false;
    histTargets.sidebarCollapsed = this._sidebarCollapsed;
    // Bubble row events from history-targets → panel actions
    histTargets.addEventListener(
      "dp-row-color-change",
      (ev: DetailEvent<{ index?: number; color?: string }>) => {
        const { index, color } = ev.detail || {};
        this._updateSeriesRowColor(index, color);
      }
    );
    histTargets.addEventListener(
      "dp-row-visibility-change",
      (ev: DetailEvent<{ entityId?: string; visible?: boolean }>) => {
        const { entityId, visible } = ev.detail || {};
        this._updateSeriesRowVisibilityByEntityId(entityId, visible);
      }
    );
    histTargets.addEventListener(
      "dp-row-remove",
      (ev: DetailEvent<{ index?: number }>) => {
        const { index } = ev.detail || {};
        this._removeSeriesRow(index);
      }
    );
    histTargets.addEventListener(
      "dp-row-toggle-analysis",
      (ev: DetailEvent<{ entityId?: string }>) => {
        const { entityId } = ev.detail || {};
        this._toggleSeriesAnalysisExpanded(entityId);
      }
    );
    histTargets.addEventListener(
      "dp-row-analysis-change",
      (
        ev: DetailEvent<{ entityId?: string; key?: string; value?: unknown }>
      ) => {
        const { entityId, key, value } = ev.detail || {};
        this._setSeriesAnalysisOption(entityId, key, value);
      }
    );
    histTargets.addEventListener(
      "dp-row-copy-analysis-to-all",
      (ev: DetailEvent<{ entityId?: string; analysis?: unknown }>) => {
        const { entityId, analysis } = ev.detail || {};
        this._copyAnalysisToAll(entityId, analysis);
      }
    );
    histTargets.addEventListener(
      "dp-rows-reorder",
      (ev: DetailEvent<{ rows?: unknown[] }>) => {
        const { rows } = ev.detail || {};
        if (!Array.isArray(rows)) {
          return;
        }
        this._seriesRows = rows as HistoryTargetRowState[];
        this._syncSeriesState();
        this._saveSessionState();
        this._renderTargetRows();
        this._syncControls();
        this._updateUrl({ push: true });
        this._renderContent();
      }
    );
    histTargets.addEventListener("dp-targets-prefs-click", (ev: Event) => {
      ev.stopPropagation();
      const anchor = ev.composedPath()[0] || ev.target;
      if (!(anchor instanceof HTMLElement)) {
        return;
      }
      if (this._collapsedOptionsPopupOpen) {
        this._hideCollapsedOptionsPopup();
      } else {
        this._showCollapsedOptionsPopup(anchor);
      }
    });
    histTargets.addEventListener(
      "dp-targets-add-click",
      (ev: DetailEvent<{ buttonEl?: Nullable<HTMLElement> }>) => {
        const { buttonEl } = ev.detail || {};
        this._openTargetPicker(buttonEl ?? undefined);
      }
    );
    histTargets.addEventListener(
      "dp-collapsed-entity-click",
      (
        ev: DetailEvent<{ entityId?: string; buttonEl?: Nullable<HTMLElement> }>
      ) => {
        const { entityId, buttonEl } = ev.detail || {};
        if (!entityId) {
          return;
        }
        if (this._collapsedPopupEntityId === entityId) {
          this._hideCollapsedTargetPopup();
        } else {
          this._showCollapsedTargetPopup(entityId, buttonEl ?? undefined);
        }
      }
    );
    this._shellEl!.appendChild(histTargets);
    this._historyTargetsComp = histTargets;

    // target-row-list is rendered inside history-targets; keep a ref via its accessor
    this._rowListEl = null; // will be updated lazily via histTargets.getRowListEl()
    return histTargets;
  }

  _mountTargetPickerControl(histTargets: HTMLElement) {
    const targetControl = document.createElement(
      "ha-target-picker"
    ) as TargetPickerElement;
    targetControl.slot = "picker";
    targetControl.style.display = "block";
    targetControl.style.width = "100%";
    if (this._hass) {
      targetControl.hass = this._hass;
    }
    targetControl.addEventListener(
      "value-changed",
      (ev: DetailEvent<{ value?: unknown }>) => {
        const hasValue = ev.detail && Object.hasOwn(ev.detail, "value");
        if (!hasValue) {
          return;
        }
        const rawValue = normalizeTargetValue(
          (ev.detail?.value ?? null) as RecordWithUnknownValues
        );
        const nextEntityIds = resolveEntityIdsFromTarget(this._hass, rawValue);
        if (!nextEntityIds.length) {
          return;
        }
        this._addSeriesRows(nextEntityIds);
        targetControl.value = {};
        this._saveSessionState();
        this._syncControls();
        this._updateUrl({ push: true });
        this._renderContent();
      }
    );
    histTargets.appendChild(targetControl);
    this._targetControl = targetControl;
    ensureHaComponents(["ha-target-picker"]).then(() => {
      if (!this.isConnected || this._targetControl !== targetControl) {
        return;
      }
      if (this._hass) {
        targetControl.hass = this._hass;
      }
      targetControl.value = {};
    });
  }

  _mountRangeToolbarControl() {
    const rangeToolbar = document.createElement(
      "range-toolbar"
    ) as unknown as RangeToolbarElement;
    rangeToolbar.slot = "controls";
    rangeToolbar.startTime = this._startTime;
    rangeToolbar.endTime = this._endTime;
    rangeToolbar.rangeBounds = this._rangeBounds;
    rangeToolbar.zoomLevel = this._zoomLevel;
    rangeToolbar.dateSnapping = this._dateSnapping;
    rangeToolbar.sidebarCollapsed = this._sidebarCollapsed;
    rangeToolbar.hass = this._hass ?? null;
    rangeToolbar.isLiveEdge = this._isOnLiveEdge();
    rangeToolbar.timelineEvents = this._timelineEvents || [];
    rangeToolbar.comparisonPreview = null;
    rangeToolbar.zoomRange = this._chartZoomCommittedRange
      ? {
          start: +this._chartZoomCommittedRange.start,
          end: +this._chartZoomCommittedRange.end,
        }
      : null;
    rangeToolbar.zoomWindowRange = null;
    rangeToolbar.chartHoverTimeMs = null;
    rangeToolbar.chartHoverWindowTimeMs = null;
    rangeToolbar.addEventListener(
      "dp-range-commit",
      (ev: DetailEvent<{ start?: Date; end?: Date; push?: boolean }>) => {
        this._applyCommittedRange(ev.detail?.start, ev.detail?.end, {
          push: ev.detail?.push ?? false,
        });
      }
    );
    rangeToolbar.addEventListener(
      "dp-range-draft",
      (ev: DetailEvent<{ start?: Date; end?: Date }>) => {
        this._scheduleAutoZoomUpdate(ev.detail?.start, ev.detail?.end);
      }
    );
    rangeToolbar.addEventListener("dp-toolbar-sidebar-toggle", () =>
      this._toggleSidebarCollapsed()
    );
    rangeToolbar.addEventListener(
      "dp-zoom-level-change",
      (ev: DetailEvent<{ value?: string }>) => {
        const { value } = ev.detail || {};
        if (value && value !== this._zoomLevel) {
          this._zoomLevel = value;
          this._clearAutoZoomTimer();
          this._resolvedAutoZoomLevel =
            value === "auto" ? null : this._resolvedAutoZoomLevel;
          this._saveSessionState();
          this._updateUrl({ push: false });
          this._syncRangeControl();
          this._saveUserPreferences();
        }
      }
    );
    rangeToolbar.addEventListener(
      "dp-snap-change",
      (ev: DetailEvent<{ value?: string }>) => {
        const { value } = ev.detail || {};
        if (value && value !== this._dateSnapping) {
          this._dateSnapping = value;
          this._saveSessionState();
          this._updateUrl({ push: false });
          this._syncRangeControl();
          this._saveUserPreferences();
        }
      }
    );
    rangeToolbar.addEventListener("dp-date-picker-change", (ev) => {
      this._handleDatePickerChange(ev);
    });
    this._shellEl!.appendChild(rangeToolbar);
    this._rangeToolbarComp = rangeToolbar;

    this._dateControl = rangeToolbar;

    // Once the range toolbar renders, sync controls so the forwarded props receive initial data.
    rangeToolbar.updateComplete.then(() => {
      if (!this.isConnected || this._rangeToolbarComp !== rangeToolbar) {
        return;
      }
      this._syncControls();
      this._renderContent();
    });

    // Sync initial sidebar UI for toolbar toggle icon direction
    this._syncSidebarUi();
  }

  _mountSidebarOptionsControl() {
    if (this._sidebarOptionsEl) {
      const sidebarComp = document.createElement(
        "sidebar-options"
      ) as SidebarOptionsElement;
      sidebarComp.addEventListener(
        "dp-scope-change",
        (ev: DetailEvent<{ value?: string }>) => {
          const { value } = ev.detail || {};
          if (value) {
            this._setDatapointScope(value);
          }
        }
      );
      sidebarComp.addEventListener(
        "dp-display-change",
        (ev: DetailEvent<{ kind?: string; value?: unknown }>) => {
          const { kind, value } = ev.detail || {};
          if (!kind) {
            return;
          }
          if (kind === "y_axis_mode") {
            this._setChartYAxisMode(String(value || ""));
          } else {
            this._setChartDatapointDisplayOption(kind, value);
          }
        }
      );
      sidebarComp.addEventListener(
        "dp-analysis-change",
        (
          ev: DetailEvent<{
            kind?: string;
            value?: string;
          }>
        ) => {
          const { kind, value } = ev.detail || {};
          if (
            kind === "anomaly_overlap_mode" &&
            ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS.some((o) => o.value === value)
          ) {
            if (this._chartAnomalyOverlapMode === value) {
              return;
            }
            this._chartAnomalyOverlapMode = value!;
            this._saveSessionState();
            this._updateUrl({ push: false });
            this._renderSidebarOptions();
            this._renderContent();
          }
        }
      );
      sidebarComp.addEventListener(
        "dp-accordion-change",
        (
          ev: DetailEvent<{
            targetsOpen?: boolean;
            datapointsOpen?: boolean;
            analysisOpen?: boolean;
            chartOpen?: boolean;
          }>
        ) => {
          const { targetsOpen, datapointsOpen, analysisOpen, chartOpen } =
            ev.detail || {};
          if (typeof targetsOpen === "boolean") {
            this._sidebarAccordionTargetsOpen = targetsOpen;
          }
          if (typeof datapointsOpen === "boolean") {
            this._sidebarAccordionDatapointsOpen = datapointsOpen;
          }
          if (typeof analysisOpen === "boolean") {
            this._sidebarAccordionAnalysisOpen = analysisOpen;
          }
          if (typeof chartOpen === "boolean") {
            this._sidebarAccordionChartOpen = chartOpen;
          }
          this._saveSessionState();
          this._updateUrl({ push: false });
        }
      );
      this._sidebarOptionsEl.appendChild(sidebarComp);
      this._sidebarOptionsComp = sidebarComp;
    }
  }

  _mountDateWindowDialogControl() {
    if (this.shadowRoot) {
      const dialogComp = document.createElement(
        "date-window-dialog"
      ) as DateWindowDialogElement;
      dialogComp.addEventListener("dp-window-close", () =>
        this._closeDateWindowDialog()
      );
      dialogComp.addEventListener(
        "dp-window-submit",
        (ev: DetailEvent<RecordWithUnknownValues>) => {
          this._createDateWindowFromDialog(ev.detail || {});
        }
      );
      dialogComp.addEventListener("dp-window-delete", () =>
        this._deleteEditingDateWindow()
      );
      dialogComp.addEventListener(
        "dp-window-shortcut",
        (ev: DetailEvent<{ direction?: number }>) => {
          if (typeof ev.detail?.direction === "number") {
            this._applyDateWindowShortcut(ev.detail.direction);
          }
        }
      );
      dialogComp.addEventListener(
        "dp-window-date-change",
        (ev: DetailEvent<{ start?: string; end?: string }>) => {
          const start = this._parseDateWindowInputValue(ev.detail?.start || "");
          const end = this._parseDateWindowInputValue(ev.detail?.end || "");
          if (start && end && start < end) {
            this._dateWindowDialogDraftRange = { start, end };
          } else {
            this._dateWindowDialogDraftRange = null;
          }
        }
      );
      this.shadowRoot.appendChild(dialogComp);
      this._dateWindowDialogComp = dialogComp;
    }
  }

  _renderTargetRows() {
    if (!this._historyTargetsComp) {
      return;
    }

    // Update history-targets properties — the component re-renders reactively.
    this._historyTargetsComp.rows = this._seriesRows;
    this._historyTargetsComp.states = this._hass?.states ?? {};
    this._historyTargetsComp.hass = this._hass ?? null;
    this._historyTargetsComp.canShowDeltaAnalysis =
      !!this._selectedComparisonWindowId;
    this._historyTargetsComp.comparisonWindows = this._comparisonWindows;

    // Keep legacy rowListEl ref in sync (used by _renderCollapsedTargetPopup etc.)
    if (!this._rowListEl) {
      this._rowListEl = this._historyTargetsComp.getRowListEl();
    } else {
      this._rowListEl.rows = this._seriesRows;
      this._rowListEl.states = this._hass?.states ?? {};
      this._rowListEl.hass = this._hass ?? null;
      this._rowListEl.canShowDeltaAnalysis = !!this._selectedComparisonWindowId;
      this._rowListEl.comparisonWindows = this._comparisonWindows;
    }

    this._refreshCollapsedTargetPopup();
  }

  _addSeriesRows(entityIds: string[] | string) {
    const merged = new Map<string, HistoryTargetRowState>(
      this._seriesRows.map((row) => [row.entity_id, row])
    );
    normalizeEntityIds(entityIds).forEach((entityId, index) => {
      if (merged.has(entityId)) {
        return;
      }
      merged.set(entityId, {
        entity_id: entityId,
        color:
          this._preferredSeriesColors?.[entityId] &&
          /^#[0-9a-f]{6}$/i.test(this._preferredSeriesColors[entityId])
            ? this._preferredSeriesColors[entityId]
            : COLORS[(merged.size + index) % COLORS.length],
        visible: true,
        analysis: normalizeHistorySeriesAnalysis(null),
      });
    });
    this._seriesRows = [...merged.values()];
    this._syncSeriesState();
    this._renderTargetRows();
  }

  _updateSeriesRowColor(index: number | undefined, color: string | undefined) {
    if (
      !Number.isInteger(index) ||
      index === undefined ||
      index < 0 ||
      index >= this._seriesRows.length
    ) {
      return;
    }
    if (!/^#[0-9a-f]{6}$/i.test(color || "")) {
      return;
    }
    if (this._seriesRows[index].color === color) {
      return;
    }
    this._seriesRows[index] = {
      ...this._seriesRows[index],
      color: color as string,
    };
    this._saveUserPreferences();
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
    this._renderContent();
  }

  _updateSeriesRowVisibility(index: number | undefined, visible: unknown) {
    if (
      !Number.isInteger(index) ||
      index === undefined ||
      index < 0 ||
      index >= this._seriesRows.length
    ) {
      return;
    }
    if (this._seriesRows[index].visible === !!visible) {
      return;
    }
    this._seriesRows[index] = {
      ...this._seriesRows[index],
      visible: !!visible,
    };
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
    this._renderContent();
  }

  /** Open (or re-render) the collapsed-sidebar target popup for *entityId*,
   *  anchored to *anchorEl*.  Wires all the same controls as the full sidebar row. */
  _showCollapsedTargetPopup(
    entityId: string,
    anchorEl: Nullable<HTMLElement> | undefined
  ) {
    const popup = this._shellEl?.getTargetPopupEl();
    if (!popup) {
      return;
    }
    const index = this._seriesRows.findIndex(
      (r: { entity_id: string }) => r.entity_id === entityId
    );
    if (index < 0) {
      this._hideCollapsedTargetPopup();
      return;
    }
    const row = this._seriesRows[index];

    // Store state for refresh after re-renders
    this._collapsedPopupEntityId = entityId;
    this._collapsedPopupAnchorEl = anchorEl ?? null;

    // Mount a target-row — replacing the old _buildSingleRowHTML + data-attribute wiring.
    popup.innerHTML = "";
    const targetRow = document.createElement("target-row") as TargetRowElement;
    targetRow.hideDragHandle = true;
    targetRow.color = row.color;
    targetRow.visible = row.visible !== false;
    targetRow.analysis = (row.analysis || {}) as RecordWithUnknownValues;
    targetRow.index = index;
    targetRow.entityId = row.entity_id;
    targetRow.stateObj = this._hass?.states?.[row.entity_id] ?? null;
    targetRow.hass = this._hass ?? null;
    targetRow.canShowDeltaAnalysis = !!this._selectedComparisonWindowId;
    targetRow.comparisonWindows = this._comparisonWindows || [];
    targetRow.addEventListener(
      "dp-row-color-change",
      (ev: DetailEvent<{ index?: number; color?: string }>) => {
        this._updateSeriesRowColor(ev.detail?.index, ev.detail?.color);
      }
    );
    targetRow.addEventListener(
      "dp-row-visibility-change",
      (ev: DetailEvent<{ entityId?: string; visible?: boolean }>) => {
        this._updateSeriesRowVisibilityByEntityId(
          ev.detail?.entityId,
          ev.detail?.visible
        );
      }
    );
    targetRow.addEventListener(
      "dp-row-toggle-analysis",
      (ev: DetailEvent<{ entityId?: string }>) => {
        this._toggleSeriesAnalysisExpanded(ev.detail?.entityId);
      }
    );
    targetRow.addEventListener(
      "dp-row-analysis-change",
      (
        ev: DetailEvent<{ entityId?: string; key?: string; value?: unknown }>
      ) => {
        this._setSeriesAnalysisOption(
          ev.detail?.entityId,
          ev.detail?.key,
          ev.detail?.value
        );
      }
    );
    targetRow.addEventListener(
      "dp-row-copy-analysis-to-all",
      (ev: DetailEvent<{ entityId?: string; analysis?: unknown }>) => {
        const { entityId: id, analysis } = ev.detail || {};
        this._copyAnalysisToAll(id, analysis);
      }
    );
    targetRow.addEventListener(
      "dp-row-remove",
      (ev: DetailEvent<{ index?: number }>) => {
        this._hideCollapsedTargetPopup();
        this._removeSeriesRow(ev.detail?.index);
      }
    );
    popup.appendChild(targetRow);

    // Position the popup to the right of the anchor button.
    // max-height is set dynamically so the popup never extends below the viewport,
    // and overflow-y: auto allows scrolling if content exceeds the available space.
    popup.removeAttribute("hidden");
    if (!anchorEl) {
      return;
    }
    const anchorRect = anchorEl.getBoundingClientRect();
    const popupHeight = popup.offsetHeight;
    const top = Math.max(
      8,
      Math.min(anchorRect.top, window.innerHeight - popupHeight - 16)
    );
    popup.style.top = `${top}px`;
    popup.style.left = `${anchorRect.right + 8}px`;
    popup.style.maxHeight = `${window.innerHeight - top - 16}px`;

    // Dismiss on outside click (uses composedPath to handle shadow DOM)
    if (this._collapsedPopupOutsideClickHandler) {
      document.removeEventListener(
        "click",
        this._collapsedPopupOutsideClickHandler,
        true
      );
    }
    this._collapsedPopupOutsideClickHandler = (ev: Event) => {
      const path = ev.composedPath();
      if (!path.includes(popup) && !path.includes(anchorEl)) {
        this._hideCollapsedTargetPopup();
      }
    };
    document.addEventListener(
      "click",
      this._collapsedPopupOutsideClickHandler,
      true
    );

    // Dismiss on Escape key
    if (this._collapsedPopupKeyHandler) {
      document.removeEventListener("keydown", this._collapsedPopupKeyHandler);
    }
    this._collapsedPopupKeyHandler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        this._hideCollapsedTargetPopup();
        anchorEl.focus();
      }
    };
    document.addEventListener("keydown", this._collapsedPopupKeyHandler);
  }

  /** Close the collapsed-sidebar target popup and clean up all listeners. */
  _hideCollapsedTargetPopup() {
    const popup = this._shellEl?.getTargetPopupEl();
    if (popup) {
      popup.setAttribute("hidden", "");
      popup.innerHTML = "";
    }
    if (this._collapsedPopupOutsideClickHandler) {
      document.removeEventListener(
        "click",
        this._collapsedPopupOutsideClickHandler,
        true
      );
      this._collapsedPopupOutsideClickHandler = null;
    }
    if (this._collapsedPopupKeyHandler) {
      document.removeEventListener("keydown", this._collapsedPopupKeyHandler);
      this._collapsedPopupKeyHandler = null;
    }
    this._collapsedPopupEntityId = null;
    this._collapsedPopupAnchorEl = null;
  }

  /** Re-render the popup in-place after a state change (e.g. analysis toggle).
   *  Called at the end of _renderTargetRows so the popup stays in sync. */
  _refreshCollapsedTargetPopup() {
    if (!this._collapsedPopupEntityId) {
      return;
    }
    const row = this._seriesRows.find(
      (r: { entity_id: string }) => r.entity_id === this._collapsedPopupEntityId
    );
    if (!row) {
      this._hideCollapsedTargetPopup();
      return;
    }
    // Sync lightweight properties on the existing targetRow without rebuilding
    // the DOM — avoids flickering and preserves in-progress user interaction.
    const popup = this._shellEl?.getTargetPopupEl();
    const targetRow = popup?.querySelector(
      "target-row"
    ) as TargetRowElement | null;
    if (targetRow) {
      targetRow.analysis = row.analysis as unknown as RecordWithUnknownValues;
      targetRow.color = row.color;
      targetRow.visible = row.visible !== false;
      targetRow.stateObj = this._hass?.states?.[row.entity_id] ?? null;
      targetRow.hass = this._hass ?? null;
    }
  }

  // ── Collapsed-sidebar options popup ──────────────────────────────────────

  /** Open the collapsed-sidebar options popup, anchored to *anchorEl*. */
  _showCollapsedOptionsPopup(anchorEl: HTMLElement) {
    const popup = this._shellEl?.getOptionsPopupEl();
    if (!popup) {
      return;
    }

    // Build or reuse the collapsed-options-menu element.
    let menu = popup.querySelector(
      "collapsed-options-menu"
    ) as Nullable<CollapsedOptionsMenuElement>;
    if (!menu) {
      menu = document.createElement(
        "collapsed-options-menu"
      ) as CollapsedOptionsMenuElement;
      menu.addEventListener(
        "dp-scope-change",
        (ev: DetailEvent<{ value?: string }>) => {
          const { value } = ev.detail || {};
          if (value) {
            this._setDatapointScope(value);
          }
        }
      );
      menu.addEventListener(
        "dp-display-change",
        (ev: DetailEvent<{ kind?: string; value?: unknown }>) => {
          const { kind, value } = ev.detail || {};
          if (!kind) {
            return;
          }
          if (kind === "y_axis_mode") {
            this._setChartYAxisMode(String(value || ""));
          } else {
            this._setChartDatapointDisplayOption(kind, value);
          }
        }
      );
      menu.addEventListener(
        "dp-analysis-change",
        (
          ev: DetailEvent<{
            kind?: string;
            value?: string;
          }>
        ) => {
          const { kind, value } = ev.detail || {};
          if (
            kind === "anomaly_overlap_mode" &&
            value !== this._chartAnomalyOverlapMode
          ) {
            this._chartAnomalyOverlapMode = value!;
            this._saveSessionState();
            this._updateUrl({ push: false });
            this._renderSidebarOptions();
            this._renderContent();
          }
        }
      );
      popup.appendChild(menu);
    }

    this._syncCollapsedOptionsMenu(menu);

    this._collapsedOptionsPopupOpen = true;
    this._collapsedOptionsAnchorEl = anchorEl;

    popup.removeAttribute("hidden");
    const anchorRect = anchorEl.getBoundingClientRect();
    const popupHeight = popup.offsetHeight;
    const top = Math.max(
      8,
      Math.min(anchorRect.top, window.innerHeight - popupHeight - 16)
    );
    popup.style.top = `${top}px`;
    popup.style.left = `${anchorRect.right + 8}px`;

    if (this._collapsedOptionsOutsideClickHandler) {
      document.removeEventListener(
        "click",
        this._collapsedOptionsOutsideClickHandler,
        true
      );
    }
    this._collapsedOptionsOutsideClickHandler = (ev: Event) => {
      const path = ev.composedPath();
      if (!path.includes(popup) && !path.includes(anchorEl)) {
        this._hideCollapsedOptionsPopup();
      }
    };
    document.addEventListener(
      "click",
      this._collapsedOptionsOutsideClickHandler,
      true
    );

    if (this._collapsedOptionsKeyHandler) {
      document.removeEventListener("keydown", this._collapsedOptionsKeyHandler);
    }
    this._collapsedOptionsKeyHandler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        this._hideCollapsedOptionsPopup();
        anchorEl.focus();
      }
    };
    document.addEventListener("keydown", this._collapsedOptionsKeyHandler);
  }

  /** Close the collapsed-sidebar options popup and clean up all listeners. */
  _hideCollapsedOptionsPopup() {
    const popup = this._shellEl?.getOptionsPopupEl();
    if (popup) {
      popup.setAttribute("hidden", "");
    }
    if (this._collapsedOptionsOutsideClickHandler) {
      document.removeEventListener(
        "click",
        this._collapsedOptionsOutsideClickHandler,
        true
      );
      this._collapsedOptionsOutsideClickHandler = null;
    }
    if (this._collapsedOptionsKeyHandler) {
      document.removeEventListener("keydown", this._collapsedOptionsKeyHandler);
      this._collapsedOptionsKeyHandler = null;
    }
    this._collapsedOptionsPopupOpen = false;
    this._collapsedOptionsAnchorEl = null;
  }

  /** Sync option props on the menu element — called from _renderSidebarOptions. */
  _refreshCollapsedOptionsPopup() {
    if (!this._collapsedOptionsPopupOpen) {
      return;
    }
    const popup = this._shellEl?.getOptionsPopupEl();
    const menu = popup?.querySelector(
      "collapsed-options-menu"
    ) as Nullable<CollapsedOptionsMenuElement>;
    if (menu) {
      this._syncCollapsedOptionsMenu(menu);
    }
  }

  /** Write all current option values onto a collapsed-options-menu element. */
  _syncCollapsedOptionsMenu(menu: CollapsedOptionsMenuElement) {
    let yAxisMode;
    if (this._splitChartView) {
      yAxisMode = "split";
    } else if (this._delinkChartYAxis) {
      yAxisMode = "unique";
    } else {
      yAxisMode = "combined";
    }
    menu.datapointScope = this._datapointScope;
    menu.showIcons = this._showChartDatapointIcons;
    menu.showLines = this._showChartDatapointLines;
    menu.showTooltips = this._showChartTooltips;
    menu.showHoverGuides = this._showChartEmphasizedHoverGuides;
    menu.hoverSnapMode = this._chartHoverSnapMode;
    menu.showCorrelatedAnomalies = this._showCorrelatedAnomalies;
    menu.showDataGaps = this._showDataGaps;
    menu.dataGapThreshold = this._dataGapThreshold;
    menu.yAxisMode = yAxisMode;
    menu.anomalyOverlapMode = this._chartAnomalyOverlapMode;
    menu.anyAnomaliesEnabled = (this._seriesRows ?? []).some(
      (r: { analysis?: { show_anomalies?: boolean } }) =>
        r.analysis?.show_anomalies === true
    );
  }

  _updateSeriesRowVisibilityByEntityId(entityId: unknown, visible: unknown) {
    const normalizedEntityId = String(entityId || "").trim();
    if (!normalizedEntityId) {
      return;
    }
    const index = this._seriesRows.findIndex(
      (row: { entity_id: string }) => row.entity_id === normalizedEntityId
    );
    if (index === -1) {
      return;
    }
    this._updateSeriesRowVisibility(index, visible);
  }

  _toggleSeriesAnalysisExpanded(entityId: unknown) {
    const normalizedEntityId = String(entityId || "").trim();
    if (!normalizedEntityId) {
      return;
    }
    const index = this._seriesRows.findIndex(
      (row: { entity_id: string }) => row.entity_id === normalizedEntityId
    );
    if (index === -1) {
      return;
    }
    const row = this._seriesRows[index];
    const currentAnalysis = normalizeHistorySeriesAnalysis(row.analysis);
    const nextAnalysis = normalizeHistorySeriesAnalysis({
      ...row.analysis,
      expanded: !currentAnalysis.expanded,
    });
    this._seriesRows[index] = {
      ...row,
      analysis: nextAnalysis,
    };
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
  }

  _setSeriesAnalysisOption(entityId: unknown, key: unknown, value: unknown) {
    const normalizedEntityId = String(entityId || "").trim();
    const normalizedKey = String(key || "").trim();
    if (!normalizedEntityId || !normalizedKey) {
      return;
    }
    if (
      normalizedKey === "anomaly_comparison_window_id" &&
      value === "__add_new__"
    ) {
      this._pendingAnomalyComparisonWindowEntityId = normalizedEntityId;
      this._openDateWindowDialog();
      return;
    }
    const index = this._seriesRows.findIndex(
      (row: { entity_id: string }) => row.entity_id === normalizedEntityId
    );
    if (index === -1) {
      return;
    }
    const row = this._seriesRows[index];
    const analysis = normalizeHistorySeriesAnalysis(row.analysis);

    // Handle method toggle: add/remove a method from anomaly_methods array
    let nextKey = normalizedKey;
    let nextValue = value;
    if (nextKey.startsWith("anomaly_method_toggle_")) {
      const method = nextKey.slice("anomaly_method_toggle_".length);
      const currentMethods = analysis.anomaly_methods;
      const nextMethods =
        nextValue === true
          ? [...new Set([...currentMethods, method])]
          : currentMethods.filter((m) => m !== method);
      nextKey = "anomaly_methods";
      nextValue = nextMethods;
    }

    const nextSource: RecordWithUnknownValues = {
      ...analysis,
      [nextKey]: nextValue,
    };
    if (nextKey === "show_trend_lines" && nextValue !== true) {
      nextSource.show_trend_crosshairs = false;
    }
    if (nextKey === "show_threshold_analysis" && nextValue !== true) {
      nextSource.show_threshold_shading = false;
    }
    if (nextKey === "show_delta_analysis" && nextValue !== true) {
      nextSource.show_delta_tooltip = true;
      nextSource.show_delta_lines = false;
    }
    if (
      nextKey === "show_anomalies" &&
      nextValue === true &&
      (!Array.isArray(analysis.anomaly_methods) ||
        analysis.anomaly_methods.length === 0)
    ) {
      // Default to trend_residual so anomalies appear immediately on first enable.
      nextSource.anomaly_methods = ["trend_residual"];
    }
    const nextAnalysis = normalizeHistorySeriesAnalysis({
      ...nextSource,
      expanded: true,
    });
    const unchanged = JSON.stringify(nextAnalysis) === JSON.stringify(analysis);
    if (unchanged) {
      return;
    }
    this._seriesRows[index] = {
      ...row,
      analysis: nextAnalysis,
    };
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
    this._renderSidebarOptions();
    this._renderContent();
  }

  _copyAnalysisToAll(sourceEntityId: unknown, sourceAnalysis: unknown) {
    const normalizedEntityId = String(sourceEntityId || "").trim();
    if (!normalizedEntityId || !sourceAnalysis) {
      return;
    }
    let changed = false;
    this._seriesRows = this._seriesRows.map((row) => {
      if (row.entity_id === normalizedEntityId) {
        return row;
      }
      const currentAnalysis = normalizeHistorySeriesAnalysis(row.analysis);
      const nextAnalysis = normalizeHistorySeriesAnalysis({
        ...sourceAnalysis,
        // Preserve per-row state that shouldn't be overwritten
        expanded: currentAnalysis.expanded,
        // Don't copy anomaly_comparison_window_id — it's entity-specific
        anomaly_comparison_window_id:
          currentAnalysis.anomaly_comparison_window_id,
      });
      if (JSON.stringify(nextAnalysis) === JSON.stringify(currentAnalysis)) {
        return row;
      }
      changed = true;
      return { ...row, analysis: nextAnalysis };
    });
    if (!changed) {
      return;
    }
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
    this._renderContent();
  }

  _removeSeriesRow(index: number | undefined) {
    if (
      !Number.isInteger(index) ||
      index === undefined ||
      index < 0 ||
      index >= this._seriesRows.length
    ) {
      return;
    }
    this._seriesRows = this._seriesRows.filter(
      (_row: unknown, rowIndex: number) => rowIndex !== index
    );
    this._syncSeriesState();
    this._saveSessionState();
    this._renderTargetRows();
    this._syncControls();
    this._updateUrl({ push: true });
    this._renderContent();
  }

  _clearAutoZoomTimer() {
    if (this._autoZoomTimer) {
      window.clearTimeout(this._autoZoomTimer);
      this._autoZoomTimer = null;
    }
  }

  _toggleDatePickerMenu(force = false) {
    if (!force) {
      this._rangeToolbarComp?.closeMenus();
    }
  }

  _togglePageMenu(force = !this._pageMenuOpen) {
    this._pageMenuOpen = !!force;
    if (!force) {
      this._shellEl?.closePageMenu();
    }
  }

  _handleWindowPointerDown() {
    // Outside-click dismissal for all floating menus is now handled internally
    // by floating-menu via dp-menu-close events.
  }

  _syncOptionsMenu() {
    this._rangeToolbarComp?.syncOptionsLabels();
  }

  _handleDatePickerChange(ev: Event) {
    const { start, end } = extractRangeValue(
      ev as Parameters<typeof extractRangeValue>[0]
    );
    if (!start || !end || start >= end) {
      return;
    }
    if (ev.type === "change") {
      this._toggleDatePickerMenu(false);
    }
    this._applyCommittedRange(start, end, { push: true });
  }

  async _downloadSpreadsheet() {
    if (this._exportBusy || !this._hass || !this._startTime || !this._endTime) {
      return;
    }
    this._togglePageMenu(false);
    await this._context.persistence.downloadSpreadsheet({
      entityIds: this._entities,
      startTime: this._startTime,
      endTime: this._endTime,
      datapointScope: this._datapointScope,
      onError: (error: unknown) => {
        logger.error(
          "[hass-datapoints panel] spreadsheet export:failed",
          error
        );
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Saved page state (persistent via HA frontend user data)
  // ---------------------------------------------------------------------------

  async _loadSavedPageIndicator() {
    await this._context.fetch.loadSavedPageIndicator({
      savedPageKey: PANEL_HISTORY_SAVED_PAGE_KEY,
      fallbackValue: null,
      onSuccess: () => {
        this._syncSavedPageMenuItems();
      },
      onError: () => {
        // Non-critical — ignore failures.
      },
    });
  }

  _syncSavedPageMenuItems() {
    if (this._shellEl) {
      this._shellEl.hasSavedState = this._hasSavedPage;
    }
  }

  async _savePageState() {
    if (this._savePageBusy || !this._hass) {
      return;
    }
    this._togglePageMenu(false);
    await this._context.persistence.savePageState({
      savedPageKey: PANEL_HISTORY_SAVED_PAGE_KEY,
      state: buildHistoryPageSessionState(this as unknown as HistoryPageSource),
      onSuccess: () => {
        this._hasSavedPage = true;
        this._syncSavedPageMenuItems();
      },
      onError: (err: unknown) => {
        logger.error("[hass-datapoints panel] save page state failed:", err);
      },
    });
  }

  async _restorePageState() {
    if (!this._hass) {
      return;
    }
    this._togglePageMenu(false);
    await this._context.persistence.restorePageState({
      savedPageKey: PANEL_HISTORY_SAVED_PAGE_KEY,
      fallbackValue: null,
      onSuccess: (saved: unknown) => {
        try {
          window.sessionStorage.setItem(
            `${DOMAIN}:panel_history_session`,
            JSON.stringify(saved)
          );
        } catch {
          // sessionStorage may be unavailable — ignore.
        }
        const baseUrl = window.location.pathname;
        window.history.replaceState(null, "", baseUrl);
        window.location.reload();
      },
      onError: (err: unknown) => {
        logger.error("[hass-datapoints panel] restore page state failed:", err);
      },
    });
  }

  async _clearSavedPageState() {
    if (!this._hass) {
      return;
    }
    this._togglePageMenu(false);
    await this._context.persistence.clearSavedPageState({
      savedPageKey: PANEL_HISTORY_SAVED_PAGE_KEY,
      onSuccess: () => {
        this._hasSavedPage = false;
        this._syncSavedPageMenuItems();
      },
      onError: (err: unknown) => {
        logger.error(
          "[hass-datapoints panel] clear saved page state failed:",
          err
        );
      },
    });
  }

  _getEffectiveZoomLevel() {
    if (this._zoomLevel !== "auto") {
      return this._zoomLevel;
    }
    if (!this._resolvedAutoZoomLevel) {
      const referenceSpanMs = Math.max(
        (this._endTime?.getTime() || Date.now()) -
          (this._startTime?.getTime() || Date.now() - RANGE_SLIDER_WINDOW_MS),
        RANGE_SLIDER_MIN_SPAN_MS
      );
      this._resolvedAutoZoomLevel =
        this._computeZoomLevelForSpan(referenceSpanMs);
    }
    return this._resolvedAutoZoomLevel;
  }

  _getZoomConfig() {
    return (
      RANGE_ZOOM_CONFIGS[this._getEffectiveZoomLevel()] ||
      RANGE_ZOOM_CONFIGS.month_short
    );
  }

  _computeZoomLevelForSpan(spanMs: number) {
    const normalizedSpanMs = Math.max(spanMs, RANGE_SLIDER_MIN_SPAN_MS);
    if (normalizedSpanMs >= 180 * DAY_MS) {
      return "quarterly";
    }
    if (normalizedSpanMs >= 120 * DAY_MS) {
      return "month_compressed";
    }
    if (normalizedSpanMs >= 60 * DAY_MS) {
      return "month_short";
    }
    if (normalizedSpanMs >= 21 * DAY_MS) {
      return "month_expanded";
    }
    if (normalizedSpanMs >= 7 * DAY_MS) {
      return "week_compressed";
    }
    if (normalizedSpanMs >= 2 * DAY_MS) {
      return "week_expanded";
    }
    return "day";
  }

  _getEffectiveSnapUnit() {
    if (this._dateSnapping !== "auto") {
      return this._dateSnapping;
    }
    switch (this._getEffectiveZoomLevel()) {
      case "quarterly":
      case "month_compressed":
        return "month";
      case "month_short":
      case "month_expanded":
      case "week_compressed":
        return "week";
      case "week_expanded":
        return "day";
      case "day":
        return "hour";
      default:
        return "day";
    }
  }

  _getSnapSpanMs(reference = this._startTime || new Date()) {
    const snapUnit = this._getEffectiveSnapUnit() as RangeUnit;
    const start = startOfUnit(reference, snapUnit);
    const end = endOfUnit(reference, snapUnit);
    return Math.max(SECOND_MS, end.getTime() - start.getTime());
  }

  _deriveRangeBounds() {
    const config = this._getZoomConfig();
    const startMs = this._startTime?.getTime() || Date.now() - 24 * HOUR_MS;
    const endMs = this._endTime?.getTime() || Date.now();
    const historyStartMs = this._historyStartTime?.getTime();
    const historyEndMs = this._historyEndTime?.getTime();
    const maxLookAheadMs = addUnit(new Date(), "month", 3).getTime();

    // Anchor left bound to history start (if loaded) or selection start.
    // Also guarantee enough left context before the selection for centering —
    // take whichever is earlier: the natural anchor or (startMs - 30% baseline).
    const anchorMs = historyStartMs ?? startMs;
    const naturalMin = startOfUnit(
      new Date(anchorMs),
      config.boundsUnit
    ).getTime();
    const paddedMin = startOfUnit(
      new Date(startMs - config.baselineMs * 0.3),
      config.boundsUnit
    ).getTime();
    const min = Math.min(naturalMin, paddedMin);

    const futureReference = addUnit(
      new Date(historyEndMs ?? endMs),
      "year",
      RANGE_FUTURE_BUFFER_YEARS
    ).getTime();
    const maxReference = Math.min(
      maxLookAheadMs,
      Math.max(
        futureReference,
        endMs,
        startMs + this._getSnapSpanMs(this._startTime || new Date())
      )
    );
    const max = endOfUnit(new Date(maxReference), config.boundsUnit).getTime();
    return { min, max: Math.max(max, min + SECOND_MS), config };
  }

  _syncRangeControl() {
    if (!this._rangeToolbarComp) {
      return;
    }
    this._rangeBounds = this._deriveRangeBounds();
    this._ensureTimelineEvents();
    this._rangeToolbarComp.startTime = this._startTime
      ? new Date(this._startTime)
      : null;
    this._rangeToolbarComp.endTime = this._endTime
      ? new Date(this._endTime)
      : null;
    this._rangeToolbarComp.rangeBounds = this._rangeBounds;
    this._rangeToolbarComp.zoomLevel = this._getEffectiveZoomLevel();
    this._rangeToolbarComp.dateSnapping = this._dateSnapping;
    this._rangeToolbarComp.isLiveEdge = this._isOnLiveEdge();
    this._rangeToolbarComp.timelineEvents = this._timelineEvents || [];
    this._updateComparisonRangePreview();
    this._updateChartHoverIndicator();
    this._updateChartZoomHighlight();
    this._syncMobileDateInputs();
  }

  _updateComparisonRangePreview() {
    if (!this._rangeToolbarComp) {
      return;
    }
    const comparisonWindow = this._getActiveComparisonWindow();
    if (!this._rangeBounds || !comparisonWindow) {
      this._rangeToolbarComp.comparisonPreview = null;
      this._updateZoomWindowHighlight();
      return;
    }
    const startMs = new Date(comparisonWindow.start_time).getTime();
    const endMs = new Date(comparisonWindow.end_time).getTime();
    if (
      !Number.isFinite(startMs) ||
      !Number.isFinite(endMs) ||
      startMs >= endMs
    ) {
      this._rangeToolbarComp.comparisonPreview = null;
      this._updateZoomWindowHighlight();
      return;
    }
    this._rangeToolbarComp.comparisonPreview = { start: startMs, end: endMs };
    this._updateZoomWindowHighlight();
  }

  _handleChartHover(ev: DetailEvent<{ timeMs?: Nullable<number> }>) {
    this._chartHoverTimeMs = ev?.detail?.timeMs ?? null;
    this._updateChartHoverIndicator();
  }

  _handleChartZoom(
    ev: DetailEvent<{
      startTime?: number;
      endTime?: number;
      preview?: boolean;
      source?: string;
    }>
  ) {
    const detail = ev.detail;
    const start = Number.isFinite(detail?.startTime)
      ? (detail?.startTime ?? null)
      : null;
    const end = Number.isFinite(detail?.endTime)
      ? (detail?.endTime ?? null)
      : null;
    const isPreview = !!detail?.preview;
    const source = detail?.source || "select";
    const nextRange =
      start != null && end != null && start < end ? { start, end } : null;
    if (isPreview) {
      this._chartZoomRange = nextRange;
    } else {
      this._chartZoomRange = nextRange;
      this._chartZoomCommittedRange = nextRange ? { ...nextRange } : null;
      if (this._hoveredComparisonWindowId) {
        this._hoveredComparisonWindowId = null;
      }
      if (source === "scroll") {
        this._scheduleChartZoomStateCommit();
      } else {
        this._saveSessionState();
        this._updateUrl({ push: false });
        this._syncListZoomState();
      }
    }
    this._updateChartZoomHighlight();
    if (!isPreview && source !== "scroll") {
      this._renderComparisonTabs();
    }
    if (!nextRange) {
      this._rangeToolbarComp?.revealSelection?.();
    }
  }

  _scheduleChartZoomStateCommit() {
    if (this._chartZoomStateCommitTimer) {
      window.clearTimeout(this._chartZoomStateCommitTimer);
    }
    this._chartZoomStateCommitTimer = window.setTimeout(() => {
      this._chartZoomStateCommitTimer = null;
      this._saveSessionState();
      this._updateUrl({ push: false });
      this._syncListZoomState();
    }, 180);
  }

  _syncListZoomState() {
    if (!this._listEl) {
      return;
    }
    const listConfig = {
      entities: this._entities,
      datapoint_scope: this._datapointScope,
      hours_to_show: this._hours,
      start_time: this._startTime?.toISOString(),
      end_time: this._endTime?.toISOString(),
      zoom_start_time: this._chartZoomCommittedRange
        ? new Date(this._chartZoomCommittedRange.start).toISOString()
        : null,
      zoom_end_time: this._chartZoomCommittedRange
        ? new Date(this._chartZoomCommittedRange.end).toISOString()
        : null,
      page_size: 15,
      show_entities: true,
      show_actions: true,
      show_search: true,
      hidden_event_ids: this._hiddenEventIds,
    };
    const nextListConfigKey = JSON.stringify(listConfig);
    if (this._listConfigKey !== nextListConfigKey) {
      this._listEl.setConfig(listConfig);
      this._listConfigKey = nextListConfigKey;
    }
    this._listEl.hass = this._hass;
  }

  _handleRecordsSearch(ev: DetailEvent<{ query?: string }>) {
    const nextQuery = String(ev?.detail?.query || "")
      .trim()
      .toLowerCase();
    if (nextQuery === this._recordsSearchQuery) {
      return;
    }
    this._recordsSearchQuery = nextQuery;
    this._renderContent();
  }

  _handleToggleEventVisibility(ev: DetailEvent<{ eventId?: string }>) {
    const eventId = ev?.detail?.eventId;
    if (!eventId) {
      return;
    }
    const wasPreviouslyHidden = this._hiddenEventIds.includes(eventId);
    if (wasPreviouslyHidden) {
      this._hiddenEventIds = this._hiddenEventIds.filter(
        (id: string) => id !== eventId
      );
    } else {
      this._hiddenEventIds = [...this._hiddenEventIds, eventId];
    }
    this._renderContent();
  }

  _handleHoverEventRecord(
    ev: DetailEvent<{ eventId?: string; hovered?: boolean }>
  ) {
    const eventId = String(ev?.detail?.eventId || "").trim();
    if (!eventId) {
      return;
    }
    const hovered = ev?.detail?.hovered === true;
    const alreadyHovered = this._hoveredEventIds.includes(eventId);
    if (hovered && alreadyHovered) {
      return;
    }
    if (!hovered && !alreadyHovered) {
      return;
    }
    this._hoveredEventIds = hovered ? [eventId] : [];
    this._renderContent();
  }

  _handleToggleSeriesVisibility(
    ev: DetailEvent<{ entityId?: string; visible?: boolean }>
  ) {
    const entityId = String(ev?.detail?.entityId || "").trim();
    const visible = ev?.detail?.visible;
    if (!entityId || typeof visible !== "boolean") {
      return;
    }
    const index = this._seriesRows.findIndex(
      (row: { entity_id: string; visible?: boolean }) =>
        row.entity_id === entityId
    );
    if (index === -1 || this._seriesRows[index].visible === visible) {
      return;
    }
    this._seriesRows[index] = { ...this._seriesRows[index], visible };
    this._saveSessionState();
    this._updateUrl({ push: false });
    this._renderTargetRows();
    this._renderContent();
  }

  _updateChartHoverIndicator() {
    if (!this._rangeToolbarComp) {
      return;
    }
    if (!this._rangeBounds || this._chartHoverTimeMs == null) {
      this._rangeToolbarComp.chartHoverTimeMs = null;
      this._rangeToolbarComp.chartHoverWindowTimeMs = null;
      return;
    }
    this._rangeToolbarComp.chartHoverTimeMs = this._chartHoverTimeMs;
    const activeWindow = this._getActiveComparisonWindow();
    if (activeWindow && this._startTime) {
      const timeOffsetMs =
        new Date(activeWindow.start_time).getTime() - this._startTime.getTime();
      this._rangeToolbarComp.chartHoverWindowTimeMs =
        this._chartHoverTimeMs + timeOffsetMs;
    } else {
      this._rangeToolbarComp.chartHoverWindowTimeMs = null;
    }
  }

  _updateChartZoomHighlight() {
    if (!this._rangeToolbarComp) {
      return;
    }
    const highlightRange =
      this._chartZoomRange || this._chartZoomCommittedRange;
    const nextZoomRange =
      this._rangeBounds && highlightRange
        ? {
            start: +highlightRange.start,
            end: +highlightRange.end,
          }
        : null;
    const nextZoomWindowRange = this._getZoomWindowHighlightRange();
    this._rangeToolbarComp.syncZoomHighlights(
      nextZoomRange,
      nextZoomWindowRange
    );
  }

  _updateZoomWindowHighlight() {
    if (!this._rangeToolbarComp) {
      return;
    }
    this._rangeToolbarComp.syncZoomHighlights(
      this._rangeBounds &&
        (this._chartZoomRange || this._chartZoomCommittedRange)
        ? {
            start: +(this._chartZoomRange || this._chartZoomCommittedRange)!
              .start,
            end: +(this._chartZoomRange || this._chartZoomCommittedRange)!.end,
          }
        : null,
      this._getZoomWindowHighlightRange()
    );
  }

  _getZoomWindowHighlightRange() {
    const activeWindow = this._getActiveComparisonWindow();
    const zoomRange = this._chartZoomRange || this._chartZoomCommittedRange;
    if (!this._rangeBounds || !activeWindow || !zoomRange || !this._startTime) {
      return null;
    }
    const windowStartMs = new Date(activeWindow.start_time).getTime();
    const windowEndMs = new Date(activeWindow.end_time).getTime();
    if (
      !Number.isFinite(windowStartMs) ||
      !Number.isFinite(windowEndMs) ||
      windowStartMs >= windowEndMs
    ) {
      return null;
    }
    // The zoom range is in main-chart time. Shift it into the comparison
    // window's real-time coordinate space so it can be overlaid on the
    // comparison preview band (which uses actual dates on the timeline).
    const timeOffsetMs = windowStartMs - this._startTime.getTime();
    const zoomStartMs = +zoomRange.start + timeOffsetMs;
    const zoomEndMs = +zoomRange.end + timeOffsetMs;
    const intersectStart = Math.max(windowStartMs, zoomStartMs);
    const intersectEnd = Math.min(windowEndMs, zoomEndMs);
    if (intersectStart >= intersectEnd) {
      return null;
    }
    return {
      start: intersectStart,
      end: intersectEnd,
    };
  }

  _scheduleAutoZoomUpdate(
    draftStart?: Nullable<Date>,
    draftEnd?: Nullable<Date>
  ) {
    if (this._zoomLevel !== "auto" || !this._rangeBounds) {
      return;
    }
    const start = draftStart || this._startTime;
    const end = draftEnd || this._endTime;
    if (!start || !end || start >= end) {
      return;
    }

    const currentLevel = this._getEffectiveZoomLevel();
    const selectionSpanMs = Math.max(
      end.getTime() - start.getTime(),
      RANGE_SLIDER_MIN_SPAN_MS
    );
    const paddedSelectionSpanMs = Math.max(
      selectionSpanMs * (1 + RANGE_AUTO_ZOOM_SELECTION_PADDING_RATIO),
      RANGE_SLIDER_MIN_SPAN_MS
    );
    const candidateLevel = this._computeZoomLevelForSpan(paddedSelectionSpanMs);

    if (candidateLevel === currentLevel) {
      this._clearAutoZoomTimer();
      return;
    }

    this._clearAutoZoomTimer();
    this._autoZoomTimer = window.setTimeout(() => {
      this._autoZoomTimer = null;
      const latestStart = draftStart || this._startTime;
      const latestEnd = draftEnd || this._endTime;
      if (
        !latestStart ||
        !latestEnd ||
        latestStart >= latestEnd ||
        this._zoomLevel !== "auto" ||
        !this._rangeBounds
      ) {
        return;
      }

      const latestLevel = this._getEffectiveZoomLevel();
      const latestSelectionSpanMs = Math.max(
        latestEnd.getTime() - latestStart.getTime(),
        RANGE_SLIDER_MIN_SPAN_MS
      );
      const latestPaddedSelectionSpanMs = Math.max(
        latestSelectionSpanMs * (1 + RANGE_AUTO_ZOOM_SELECTION_PADDING_RATIO),
        RANGE_SLIDER_MIN_SPAN_MS
      );
      const latestCandidateLevel = this._computeZoomLevelForSpan(
        latestPaddedSelectionSpanMs
      );

      if (latestCandidateLevel === latestLevel) {
        return;
      }
      this._resolvedAutoZoomLevel = latestCandidateLevel;
      this._syncRangeControl();
    }, RANGE_AUTO_ZOOM_DEBOUNCE_MS);
  }

  // ---------------------------------------------------------------------------
  // Live-edge detection and handle indicator
  // ---------------------------------------------------------------------------

  /** Returns true when the committed end time is at or very near "now",
   *  meaning new annotations should cause the visible range to advance. */
  _isOnLiveEdge() {
    if (!this._endTime) {
      return false;
    }
    // Within 2 minutes of now, or in the future.
    return this._endTime.getTime() >= Date.now() - 2 * MINUTE_MS;
  }

  /** Toggle the live-edge indicator on the end handle. */
  _syncLiveEdgeHandle() {
    if (!this._rangeToolbarComp) {
      return;
    }
    this._rangeToolbarComp.isLiveEdge = this._isOnLiveEdge();
  }

  /** Called whenever a new annotation is recorded (HA event or window event).
   *  If the current range is on the live edge, advance the end time to now
   *  so the chart immediately shows the new data point. */
  _handleEventRecorded() {
    if (!this._isOnLiveEdge() || !this._startTime) {
      return;
    }
    this._applyCommittedRange(this._startTime, new Date(), { push: false });
  }

  _applyCommittedRange(
    start: Nullable<Date> | undefined,
    end: Nullable<Date> | undefined,
    { push = false }: { push?: boolean } = {}
  ) {
    if (!start || !end || start >= end) {
      return;
    }
    const nextStart = new Date(start);
    const nextEnd = new Date(end);
    const didChange =
      !this._startTime ||
      !this._endTime ||
      this._startTime.getTime() !== nextStart.getTime() ||
      this._endTime.getTime() !== nextEnd.getTime();

    this._startTime = nextStart;
    this._endTime = nextEnd;
    this._hours = Math.max(
      1,
      Math.round((nextEnd.getTime() - nextStart.getTime()) / HOUR_MS)
    );
    this._syncLiveEdgeHandle();
    this._scheduleAutoZoomUpdate(undefined, undefined);
    this._syncControls();
    this._chartEl?.setExternalZoomRange?.(this._chartZoomCommittedRange);
    if (!didChange) {
      return;
    }
    this._saveSessionState();
    this._updateUrl({ push });
    this._renderContent();
  }

  _commitRangeSelection({ push = false } = {}) {
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    if (
      !this._draftStartTime ||
      !this._draftEndTime ||
      this._draftStartTime >= this._draftEndTime
    ) {
      return;
    }
    this._applyCommittedRange(this._draftStartTime, this._draftEndTime, {
      push,
    });
  }

  _updateUrl({ push = false }: { push?: boolean } = {}) {
    this._context.navigation.updateUrl({
      entities: this._entities,
      datapointScope: this._datapointScope,
      startTime: this._startTime,
      endTime: this._endTime,
      hours: this._hours,
      committedZoomRange: this._chartZoomCommittedRange,
      comparisonWindows: this._comparisonWindows,
      pageState: buildHistoryPageSessionState(
        this as unknown as HistoryPageSource
      ),
      seriesRows: this._seriesRows,
      seriesColorQueryKey: (entityId: string) =>
        this._seriesColorQueryKey(entityId),
      push,
    });
  }

  _renderComparisonTabs() {
    const result = this._context.orchestration.renderComparisonTabs({
      chartEl: this._chartEl,
      comparisonWindows: Array.isArray(this._comparisonWindows)
        ? this._comparisonWindows
        : [],
      selectedComparisonWindowId: this._selectedComparisonWindowId,
      hoveredComparisonWindowId: this._hoveredComparisonWindowId,
      startTime: this._startTime,
      endTime: this._endTime,
      loadingComparisonWindowIds: [...this._loadingComparisonWindowIds],
      comparisonTabRailComp: this._comparisonTabRailComp,
      comparisonTabsHostEl: this._comparisonTabsHostEl,
      formatComparisonLabel: (startTime: Date, endTime: Date) =>
        this._formatComparisonLabel(startTime, endTime),
      onActivate: (tabId: Nullable<string>) => {
        this._handleComparisonTabActivate(tabId);
      },
      onHover: (tabId: Nullable<string>) => {
        this._handleComparisonTabHover(tabId);
      },
      onLeave: (tabId: Nullable<string>) => {
        this._handleComparisonTabLeave(tabId);
      },
      onEdit: (tabId: Nullable<string>) => {
        const win = this._comparisonWindows.find(
          (entry: NormalizedHistoryDateWindow) => entry.id === tabId
        );
        if (win) {
          this._openDateWindowDialog(win);
        }
      },
      onDelete: (tabId: Nullable<string>) => {
        if (tabId) {
          this._deleteDateWindow(tabId);
        }
      },
      onAdd: () => {
        this._openDateWindowDialog();
      },
    });
    this._comparisonTabRailComp = result.comparisonTabRailComp;
    this._comparisonTabsHostEl = result.comparisonTabsHostEl;
  }

  _updateComparisonTabsOverflow() {
    this._context.orchestration.updateComparisonTabsOverflow(this._chartEl);
  }

  _renderContent() {
    const content = this._contentHostEl;
    if (!content) {
      return;
    }

    if (!this._entities.length) {
      // Guard: if the empty-state card is already shown there's nothing to do.
      if (this._contentKey === "__empty__") {
        return;
      }
      this._chartHoverTimeMs = null;
      this._updateChartHoverIndicator();
      this._chartZoomRange = null;
      this._chartZoomCommittedRange = null;
      this._updateChartZoomHighlight();
      content.innerHTML = `
        <ha-card class="empty">
          Select one or more entities to inspect annotated history.
        </ha-card>
      `;
      // Use a sentinel so subsequent calls (e.g. on every hass update) know
      // the empty state is already rendered and bail out immediately above.
      this._contentKey = "__empty__";
      this._chartEl = null;
      this._historyChartMol = null;
      this._listEl = null;
      this._chartConfigKey = "";
      this._listConfigKey = "";
      return;
    }

    const contentKey = JSON.stringify({
      entities: this._entities,
      series_entity_ids: this._seriesRows.map(
        (row: { entity_id: string }) => row.entity_id
      ),
      datapoint_scope: this._datapointScope,
      start: this._startTime?.toISOString() || null,
      end: this._endTime?.toISOString() || null,
      hours: this._hours,
    });

    const showRecordsPanel = this._datapointScope !== "hidden";
    const chartMounted = !!(
      this._chartEl &&
      this._chartEl.isConnected &&
      content.contains(this._chartEl)
    );
    const listMounted =
      !showRecordsPanel ||
      !!(
        this._listEl &&
        this._listEl.isConnected &&
        content.contains(this._listEl)
      );

    if (this._contentKey !== contentKey || !chartMounted || !listMounted) {
      this._chartHoverTimeMs = null;
      this._updateChartHoverIndicator();
      this._chartZoomRange = null;
      this._updateChartZoomHighlight();
      this._hoveredEventIds = [];
      // Reset the records search filter so the new list card and chart start
      // in sync — the list card always renders with an empty search field when
      // newly created, so we must clear our cached query to match.
      this._recordsSearchQuery = "";
      content.innerHTML = `
        <resizable-panes
          id="content-resizable-panes"
          direction="vertical"
          style="height:100%;min-height:0;"
        >
          <div slot="first" id="chart-host" class="chart-host">
            <div id="chart-card-host" class="chart-card-host"></div>
          </div>
          <div slot="second" id="list-host" class="list-host"></div>
        </resizable-panes>
      `;

      const chartConfig = {
        entities: this._entities,
        series_settings: this._seriesRows.map((row) => ({
          ...row,
          analysis: {
            ...(row.analysis || {}),
            anomaly_overlap_mode: this._chartAnomalyOverlapMode,
          },
        })),
        datapoint_scope: this._datapointScope,
        show_event_markers: this._showChartDatapointIcons,
        show_event_lines: this._showChartDatapointLines,
        show_tooltips: this._showChartTooltips,
        emphasize_hover_guides: this._showChartEmphasizedHoverGuides,
        hover_snap_mode: this._chartHoverSnapMode,
        show_correlated_anomalies: this._showCorrelatedAnomalies,
        anomaly_overlap_mode: this._chartAnomalyOverlapMode,
        delink_y_axis: this._delinkChartYAxis,
        split_view: this._splitChartView,
        show_data_gaps: this._showDataGaps,
        data_gap_threshold: this._dataGapThreshold,
        hours_to_show: this._hours,
        start_time: this._startTime?.toISOString(),
        end_time: this._endTime?.toISOString(),
        zoom_start_time: this._chartZoomCommittedRange
          ? new Date(this._chartZoomCommittedRange.start).toISOString()
          : null,
        zoom_end_time: this._chartZoomCommittedRange
          ? new Date(this._chartZoomCommittedRange.end).toISOString()
          : null,
        message_filter: this._recordsSearchQuery || "",
        hidden_event_ids: this._hiddenEventIds,
        hovered_event_ids: this._hoveredEventIds,
        comparison_windows: this._getPreviewComparisonWindows(),
        preload_comparison_windows: this._getPreloadComparisonWindows(),
        comparison_preview_overlay: this._getComparisonPreviewOverlay(),
        comparison_hover_active: !!this._hoveredComparisonWindowId,
        selected_comparison_window_id: this._selectedComparisonWindowId,
        hovered_comparison_window_id: this._hoveredComparisonWindowId,
      };
      // Create the chart card directly to avoid any extra DOM wrapping that could
      // disrupt HA's tooltip element hierarchy (getElementById lookups).
      const chart = document.createElement(
        "hass-datapoints-history-card"
      ) as HistoryCardElement;
      chart.setConfig(chartConfig);
      (content.querySelector("#chart-card-host") as HTMLElement).appendChild(
        chart
      );
      // Use history-chart as a pure JS config-diffing controller — not a DOM wrapper.
      const historyChartMol = {
        _configKey: JSON.stringify(chartConfig),
        chartEl: chart,
      };
      this._historyChartMol = historyChartMol;
      if (showRecordsPanel) {
        const listConfig = {
          entities: this._entities,
          datapoint_scope: this._datapointScope,
          hours_to_show: this._hours,
          start_time: this._startTime?.toISOString(),
          end_time: this._endTime?.toISOString(),
          zoom_start_time: this._chartZoomCommittedRange
            ? new Date(this._chartZoomCommittedRange.start).toISOString()
            : null,
          zoom_end_time: this._chartZoomCommittedRange
            ? new Date(this._chartZoomCommittedRange.end).toISOString()
            : null,
          page_size: 15,
          show_entities: true,
          show_actions: true,
          show_search: true,
          hidden_event_ids: this._hiddenEventIds,
        };
        const list = document.createElement(
          "hass-datapoints-list-card"
        ) as ListCardElement;
        list.setConfig(listConfig);
        (content.querySelector("#list-host") as HTMLElement).appendChild(list);
        this._listEl = list;
      } else {
        this._listEl = null;
      }
      // Wire the resizable-panes atom for the content split ratio.
      const resizablePanes = content.querySelector(
        "#content-resizable-panes"
      ) as Nullable<ResizablePanesElement>;
      this._contentSplitterEl = resizablePanes; // kept for legacy _applyContentSplitLayout reference
      if (resizablePanes) {
        resizablePanes.ratio = this._contentSplitRatio;
        resizablePanes.min = 0.2;
        resizablePanes.max = 0.8;
        resizablePanes.addEventListener(
          "dp-panes-resize",
          (ev: DetailEvent<{ ratio?: number; committed?: boolean }>) => {
            this._contentSplitRatio =
              ev.detail?.ratio ?? this._contentSplitRatio;
            this._requestChartResizeRedraw();
            if (ev.detail?.committed) {
              this._saveSessionState();
              window.requestAnimationFrame(() => this._syncRangeControl());
            }
          }
        );
      }
      this._chartEl = chart;
      this._historyChartMol = historyChartMol;
      this._contentKey = contentKey;
      this._chartConfigKey = "";
      this._listConfigKey = "";
    }

    content.classList.toggle("datapoints-hidden", !showRecordsPanel);
    const resizablePanesEl = content.querySelector(
      "#content-resizable-panes"
    ) as Nullable<ResizablePanesElement>;
    if (resizablePanesEl) {
      resizablePanesEl.secondHidden = !showRecordsPanel;
    }
    this._applyContentSplitLayout();
    this._renderComparisonTabs();
    const chartConfig = {
      entities: this._entities,
      series_settings: this._seriesRows.map((row) => ({
        ...row,
        analysis: {
          ...(row.analysis || {}),
          anomaly_overlap_mode: this._chartAnomalyOverlapMode,
        },
      })),
      datapoint_scope: this._datapointScope,
      show_event_markers: this._showChartDatapointIcons,
      show_event_lines: this._showChartDatapointLines,
      show_tooltips: this._showChartTooltips,
      emphasize_hover_guides: this._showChartEmphasizedHoverGuides,
      hover_snap_mode: this._chartHoverSnapMode,
      show_correlated_anomalies: this._showCorrelatedAnomalies,
      anomaly_overlap_mode: this._chartAnomalyOverlapMode,
      delink_y_axis: this._delinkChartYAxis,
      split_view: this._splitChartView,
      show_data_gaps: this._showDataGaps,
      data_gap_threshold: this._dataGapThreshold,
      hours_to_show: this._hours,
      start_time: this._startTime?.toISOString(),
      end_time: this._endTime?.toISOString(),
      zoom_start_time: this._chartZoomCommittedRange
        ? new Date(this._chartZoomCommittedRange.start).toISOString()
        : null,
      zoom_end_time: this._chartZoomCommittedRange
        ? new Date(this._chartZoomCommittedRange.end).toISOString()
        : null,
      message_filter: this._recordsSearchQuery || "",
      hidden_event_ids: this._hiddenEventIds,
      hovered_event_ids: this._hoveredEventIds,
      comparison_windows: this._getPreviewComparisonWindows(),
      preload_comparison_windows: this._getPreloadComparisonWindows(),
      comparison_preview_overlay: this._getComparisonPreviewOverlay(),
      comparison_hover_active: !!this._hoveredComparisonWindowId,
      selected_comparison_window_id: this._selectedComparisonWindowId,
      hovered_comparison_window_id: this._hoveredComparisonWindowId,
    };
    // Use the config-diffing controller to avoid unnecessary setConfig calls.
    if (this._chartEl) {
      const nextChartConfigKey = JSON.stringify(chartConfig);
      const molKey = this._historyChartMol?._configKey;
      const prevKey = molKey !== undefined ? molKey : this._chartConfigKey;
      if (prevKey !== nextChartConfigKey) {
        this._chartEl.setConfig(chartConfig);
        if (this._historyChartMol) {
          this._historyChartMol._configKey = nextChartConfigKey;
        } else {
          this._chartConfigKey = nextChartConfigKey;
        }
      }
    }
    if (showRecordsPanel) {
      const listConfig = {
        entities: this._entities,
        datapoint_scope: this._datapointScope,
        hours_to_show: this._hours,
        start_time: this._startTime?.toISOString(),
        end_time: this._endTime?.toISOString(),
        zoom_start_time: this._chartZoomCommittedRange
          ? new Date(this._chartZoomCommittedRange.start).toISOString()
          : null,
        zoom_end_time: this._chartZoomCommittedRange
          ? new Date(this._chartZoomCommittedRange.end).toISOString()
          : null,
        page_size: 15,
        show_entities: true,
        show_actions: true,
        show_search: true,
        hidden_event_ids: this._hiddenEventIds,
      };
      const nextListConfigKey = JSON.stringify(listConfig);
      if (this._listEl && this._listConfigKey !== nextListConfigKey) {
        this._listEl.setConfig(listConfig);
        this._listConfigKey = nextListConfigKey;
      }
      if (this._listEl) {
        this._listEl.hass = this._hass;
      }
    } else {
      this._listConfigKey = "";
    }
    if (this._chartEl) {
      this._chartEl.hass = this._hass;
    }
    this._chartEl?.setExternalZoomRange?.(this._chartZoomCommittedRange);
  }
}
