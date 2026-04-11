import { DOMAIN } from "@/constants";
import {
  normalizeDateWindows,
  type HistoryDateWindowInput,
} from "@/lib/history-page/history-url-state";
import type { SelectOption } from "@/lib/types";

/**
 * Session and preference ownership helpers for the history page.
 */

export const PANEL_HISTORY_PREFERENCES_KEY = `${DOMAIN}:panel_history_preferences`;
export const PANEL_HISTORY_SESSION_KEY = `${DOMAIN}:panel_history_session`;

export interface HistoryPageSource {
  _entities: string[];
  _seriesRows: unknown[];
  _targetSelection: Nullable<RecordWithUnknownValues>;
  _targetSelectionRaw: Nullable<RecordWithUnknownValues>;
  _datapointScope: string;
  _showChartDatapointIcons: boolean;
  _showChartDatapointLines: boolean;
  _showChartTooltips: boolean;
  _showChartEmphasizedHoverGuides: boolean;
  _chartHoverSnapMode: string;
  _delinkChartYAxis: boolean;
  _splitChartView: boolean;
  _showCorrelatedAnomalies: boolean;
  _chartAnomalyOverlapMode?: Nullable<string>;
  _showDataGaps: boolean;
  _dataGapThreshold: string;
  _contentSplitRatio: number;
  _startTime: Nullable<Date>;
  _endTime: Nullable<Date>;
  _chartZoomCommittedRange: Nullable<{
    start: string | number | Date;
    end: string | number | Date;
  }>;
  _comparisonWindows: HistoryDateWindowInput[];
  _hours: number;
  _sidebarCollapsed: boolean;
  _sidebarAccordionTargetsOpen?: boolean;
  _sidebarAccordionDatapointsOpen?: boolean;
  _sidebarAccordionAnalysisOpen?: boolean;
  _sidebarAccordionChartOpen?: boolean;
  _zoomLevel: string;
  _dateSnapping: string;
  _preferredSeriesColors: RecordWithStringValues;
}

export interface HistoryPageSessionState {
  [key: string]: unknown;
  entities: string[];
  series_rows: unknown[];
  target_selection: Nullable<RecordWithUnknownValues>;
  target_selection_raw: Nullable<RecordWithUnknownValues>;
  datapoint_scope: string;
  show_chart_datapoint_icons: boolean;
  show_chart_datapoint_lines: boolean;
  show_chart_tooltips: boolean;
  show_chart_emphasized_hover_guides: boolean;
  chart_hover_snap_mode: string;
  delink_chart_y_axis: boolean;
  split_chart_view: boolean;
  show_chart_trend_lines: boolean;
  show_chart_summary_stats: boolean;
  show_chart_rate_of_change: boolean;
  show_chart_threshold_analysis: boolean;
  show_chart_threshold_shading: boolean;
  show_chart_anomalies: boolean;
  chart_anomaly_method: string;
  chart_anomaly_rate_window: string;
  chart_anomaly_zscore_window: string;
  chart_anomaly_persistence_window: string;
  chart_anomaly_comparison_window_id: Nullable<string>;
  hide_chart_source_series: boolean;
  show_chart_trend_crosshairs: boolean;
  chart_trend_method: string;
  chart_trend_window: string;
  chart_rate_window: string;
  chart_anomaly_sensitivity: string;
  chart_threshold_values: RecordWithUnknownValues;
  chart_threshold_directions: RecordWithUnknownValues;
  show_chart_delta_analysis: boolean;
  show_chart_delta_tooltip: boolean;
  show_chart_delta_lines: boolean;
  show_chart_correlated_anomalies: boolean;
  chart_anomaly_overlap_mode: string;
  show_data_gaps: boolean;
  data_gap_threshold: string;
  content_split_ratio: number;
  start_time: Nullable<string>;
  end_time: Nullable<string>;
  zoom_start_time: Nullable<string>;
  zoom_end_time: Nullable<string>;
  date_windows: ReturnType<typeof normalizeDateWindows>;
  hours: number;
  sidebar_collapsed: boolean;
  sidebar_accordion_targets_open: boolean;
  sidebar_accordion_datapoints_open: boolean;
  sidebar_accordion_analysis_open: boolean;
  sidebar_accordion_chart_open: boolean;
}

export interface HistoryPagePreferences {
  zoom_level?: string;
  date_snapping?: string;
  series_colors?: RecordWithStringValues;
  date_windows?: HistoryDateWindowInput[];
  page_state?: Nullable<RecordWithUnknownValues>;
}

export interface NormalizedHistoryPagePreferences {
  zoomLevel: string;
  dateSnapping: string;
  preferredSeriesColors: RecordWithStringValues;
  comparisonWindows: ReturnType<typeof normalizeDateWindows>;
  pageState: Nullable<
    RecordWithUnknownValues & {
      date_windows?: ReturnType<typeof normalizeDateWindows>;
    }
  >;
  shouldPersistDefaults: boolean;
}

export interface HistoryPagePreferencesOptions {
  zoomOptions?: SelectOption[];
  snapOptions?: SelectOption[];
}

export function readHistoryPageSessionState(): Nullable<RecordWithUnknownValues> {
  try {
    const raw = window.sessionStorage?.getItem(PANEL_HISTORY_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as RecordWithUnknownValues)
      : null;
  } catch {
    return null;
  }
}

export function buildHistoryPageSessionState(
  source: HistoryPageSource
): HistoryPageSessionState {
  return {
    entities: source._entities,
    series_rows: source._seriesRows,
    target_selection: source._targetSelection,
    target_selection_raw: source._targetSelectionRaw,
    datapoint_scope: source._datapointScope,
    show_chart_datapoint_icons: source._showChartDatapointIcons,
    show_chart_datapoint_lines: source._showChartDatapointLines,
    show_chart_tooltips: source._showChartTooltips,
    show_chart_emphasized_hover_guides: source._showChartEmphasizedHoverGuides,
    chart_hover_snap_mode: source._chartHoverSnapMode,
    delink_chart_y_axis: source._delinkChartYAxis,
    split_chart_view: source._splitChartView,
    show_chart_trend_lines: false,
    show_chart_summary_stats: false,
    show_chart_rate_of_change: false,
    show_chart_threshold_analysis: false,
    show_chart_threshold_shading: false,
    show_chart_anomalies: false,
    chart_anomaly_method: "trend_residual",
    chart_anomaly_rate_window: "1h",
    chart_anomaly_zscore_window: "24h",
    chart_anomaly_persistence_window: "1h",
    chart_anomaly_comparison_window_id: null,
    hide_chart_source_series: false,
    show_chart_trend_crosshairs: false,
    chart_trend_method: "rolling_average",
    chart_trend_window: "24h",
    chart_rate_window: "1h",
    chart_anomaly_sensitivity: "medium",
    chart_threshold_values: {},
    chart_threshold_directions: {},
    show_chart_delta_analysis: false,
    show_chart_delta_tooltip: true,
    show_chart_delta_lines: false,
    show_chart_correlated_anomalies: source._showCorrelatedAnomalies,
    chart_anomaly_overlap_mode: source._chartAnomalyOverlapMode || "all",
    show_data_gaps: source._showDataGaps,
    data_gap_threshold: source._dataGapThreshold,
    content_split_ratio: source._contentSplitRatio,
    start_time: source._startTime?.toISOString() || null,
    end_time: source._endTime?.toISOString() || null,
    zoom_start_time: source._chartZoomCommittedRange
      ? new Date(source._chartZoomCommittedRange.start).toISOString()
      : null,
    zoom_end_time: source._chartZoomCommittedRange
      ? new Date(source._chartZoomCommittedRange.end).toISOString()
      : null,
    date_windows: normalizeDateWindows(source._comparisonWindows),
    hours: source._hours,
    sidebar_collapsed: source._sidebarCollapsed,
    sidebar_accordion_targets_open:
      source._sidebarAccordionTargetsOpen !== false,
    sidebar_accordion_datapoints_open:
      source._sidebarAccordionDatapointsOpen !== false,
    sidebar_accordion_analysis_open:
      source._sidebarAccordionAnalysisOpen !== false,
    sidebar_accordion_chart_open: source._sidebarAccordionChartOpen !== false,
  };
}

export function writeHistoryPageSessionState(source: HistoryPageSource): void {
  try {
    window.sessionStorage?.setItem(
      PANEL_HISTORY_SESSION_KEY,
      JSON.stringify(buildHistoryPageSessionState(source))
    );
  } catch {
    // Ignore session storage failures.
  }
}

export function normalizeHistoryPagePreferences(
  preferences: Nullable<HistoryPagePreferences> | undefined,
  options: HistoryPagePreferencesOptions = {}
): NormalizedHistoryPagePreferences {
  const zoomValues = new Set(
    (options.zoomOptions || []).map((option) => option.value)
  );
  const snapValues = new Set(
    (options.snapOptions || []).map((option) => option.value)
  );
  let shouldPersistDefaults = false;

  const normalized: NormalizedHistoryPagePreferences = {
    zoomLevel: "auto",
    dateSnapping: "hour",
    preferredSeriesColors: {},
    comparisonWindows: [],
    pageState: null,
    shouldPersistDefaults,
  };

  if (preferences && typeof preferences === "object") {
    if (preferences.zoom_level && zoomValues.has(preferences.zoom_level)) {
      normalized.zoomLevel = preferences.zoom_level;
    } else {
      shouldPersistDefaults = true;
    }

    if (
      preferences.date_snapping &&
      snapValues.has(preferences.date_snapping)
    ) {
      normalized.dateSnapping = preferences.date_snapping;
    } else {
      shouldPersistDefaults = true;
    }

    normalized.preferredSeriesColors =
      preferences.series_colors && typeof preferences.series_colors === "object"
        ? Object.entries(
            preferences.series_colors
          ).reduce<RecordWithStringValues>((acc, [entityId, color]) => {
            if (
              typeof entityId === "string" &&
              /^#[0-9a-f]{6}$/i.test(color || "")
            ) {
              acc[entityId] = color;
            }
            return acc;
          }, {})
        : {};

    normalized.comparisonWindows = normalizeDateWindows(
      preferences.date_windows
    );
    normalized.pageState =
      preferences.page_state && typeof preferences.page_state === "object"
        ? {
            ...preferences.page_state,
            date_windows: normalizeDateWindows(
              preferences.page_state?.date_windows as HistoryDateWindowInput[]
            ),
          }
        : null;
  } else {
    shouldPersistDefaults = true;
  }

  normalized.shouldPersistDefaults = shouldPersistDefaults;
  return normalized;
}

export function buildHistoryPagePreferencesPayload(
  source: HistoryPageSource
): HistoryPagePreferences {
  const preferredSeriesColors =
    source._seriesRows.reduce<RecordWithStringValues>(
      (acc, row) => {
        const entityId =
          typeof row === "object" && row && "entity_id" in row
            ? row.entity_id
            : null;
        const color =
          typeof row === "object" && row && "color" in row ? row.color : null;
        if (
          typeof entityId === "string" &&
          /^#[0-9a-f]{6}$/i.test(String(color || ""))
        ) {
          acc[entityId] = String(color);
        }
        return acc;
      },
      { ...source._preferredSeriesColors }
    );

  return {
    zoom_level: source._zoomLevel,
    date_snapping: source._dateSnapping,
    series_colors: preferredSeriesColors,
    date_windows: normalizeDateWindows(source._comparisonWindows),
    page_state: buildHistoryPageSessionState(source) as unknown as Record<
      string,
      unknown
    >,
  };
}
