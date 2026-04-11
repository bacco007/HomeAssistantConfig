import { COLORS } from "@/constants";
import { normalizeEntityIds } from "@/lib/domain/target-selection";

/**
 * Pure history-series state helpers.
 */

export interface HistorySeriesAnalysis {
  expanded: boolean;
  show_trend_lines: boolean;
  trend_method:
    | "linear_trend"
    | "rolling_average"
    | "ema"
    | "polynomial_trend"
    | "lowess";
  trend_window: string;
  show_trend_crosshairs: boolean;
  show_summary_stats: boolean;
  show_summary_stats_shading: boolean;
  show_rate_of_change: boolean;
  show_rate_crosshairs: boolean;
  rate_window: string;
  show_threshold_analysis: boolean;
  show_threshold_shading: boolean;
  threshold_value: string;
  threshold_direction: "above" | "below";
  show_anomalies: boolean;
  anomaly_methods: string[];
  anomaly_overlap_mode: "all" | "only";
  anomaly_sensitivity: string;
  anomaly_rate_window: string;
  anomaly_zscore_window: string;
  anomaly_persistence_window: string;
  anomaly_comparison_window_id: Nullable<string>;
  anomaly_trend_method: string;
  anomaly_trend_window: string;
  show_delta_analysis: boolean;
  show_delta_tooltip: boolean;
  show_delta_lines: boolean;
  hide_source_series: boolean;
  sample_interval: string;
  sample_aggregate: string;
  stepped_series: boolean;
  anomaly_use_sampled_data: boolean;
}

export interface HistorySeriesRow {
  entity_id: string;
  color: string;
  visible: boolean;
  analysis: HistorySeriesAnalysis;
}

export type PartialHistorySeriesAnalysis = Partial<
  Record<keyof HistorySeriesAnalysis | "anomaly_method", unknown>
>;

const VALID_ANOMALY_METHODS = [
  "trend_residual",
  "rate_of_change",
  "iqr",
  "rolling_zscore",
  "persistence",
  "comparison_window",
];

const VALID_SAMPLE_INTERVALS = [
  "raw",
  "1s",
  "5s",
  "10s",
  "15s",
  "30s",
  "1m",
  "2m",
  "5m",
  "10m",
  "15m",
  "30m",
  "1h",
  "2h",
  "3h",
  "4h",
  "6h",
  "12h",
  "24h",
];

const VALID_SAMPLE_AGGREGATES = [
  "mean",
  "min",
  "max",
  "median",
  "first",
  "last",
];

export function normalizeHistorySeriesAnalysis(
  analysis: Nullable<PartialHistorySeriesAnalysis> | undefined
): HistorySeriesAnalysis {
  const source = analysis && typeof analysis === "object" ? analysis : {};
  return {
    expanded: source.expanded === true,
    show_trend_lines: source.show_trend_lines === true,
    trend_method: (
      [
        "linear_trend",
        "rolling_average",
        "ema",
        "polynomial_trend",
        "lowess",
      ] as const
    ).includes(source.trend_method as HistorySeriesAnalysis["trend_method"])
      ? (source.trend_method as HistorySeriesAnalysis["trend_method"])
      : "rolling_average",
    trend_window:
      typeof source.trend_window === "string" && source.trend_window
        ? source.trend_window
        : "24h",
    show_trend_crosshairs: source.show_trend_crosshairs !== false,
    show_summary_stats: source.show_summary_stats === true,
    show_summary_stats_shading: source.show_summary_stats_shading === true,
    show_rate_of_change: source.show_rate_of_change === true,
    show_rate_crosshairs: source.show_rate_crosshairs !== false,
    rate_window:
      typeof source.rate_window === "string" && source.rate_window
        ? source.rate_window
        : "1h",
    show_threshold_analysis: source.show_threshold_analysis === true,
    show_threshold_shading: source.show_threshold_shading === true,
    threshold_value:
      typeof source.threshold_value === "string" ||
      typeof source.threshold_value === "number"
        ? String(source.threshold_value).trim()
        : "",
    threshold_direction:
      source.threshold_direction === "below" ? "below" : "above",
    show_anomalies: source.show_anomalies === true,
    anomaly_methods: (() => {
      if (Array.isArray(source.anomaly_methods)) {
        return source.anomaly_methods.filter(
          (method): method is string =>
            typeof method === "string" && VALID_ANOMALY_METHODS.includes(method)
        );
      }
      const legacy =
        typeof source.anomaly_method === "string" &&
        VALID_ANOMALY_METHODS.includes(source.anomaly_method)
          ? source.anomaly_method
          : null;
      return legacy ? [legacy] : [];
    })(),
    anomaly_overlap_mode:
      source.anomaly_overlap_mode === "only" ? "only" : "all",
    anomaly_sensitivity:
      typeof source.anomaly_sensitivity === "string" &&
      source.anomaly_sensitivity
        ? source.anomaly_sensitivity
        : "medium",
    anomaly_rate_window:
      typeof source.anomaly_rate_window === "string" &&
      source.anomaly_rate_window
        ? source.anomaly_rate_window
        : "1h",
    anomaly_zscore_window:
      typeof source.anomaly_zscore_window === "string" &&
      source.anomaly_zscore_window
        ? source.anomaly_zscore_window
        : "24h",
    anomaly_persistence_window:
      typeof source.anomaly_persistence_window === "string" &&
      source.anomaly_persistence_window
        ? source.anomaly_persistence_window
        : "1h",
    anomaly_comparison_window_id:
      typeof source.anomaly_comparison_window_id === "string" &&
      source.anomaly_comparison_window_id
        ? source.anomaly_comparison_window_id
        : null,
    anomaly_trend_method:
      typeof source.anomaly_trend_method === "string"
        ? source.anomaly_trend_method
        : "",
    anomaly_trend_window:
      typeof source.anomaly_trend_window === "string" &&
      source.anomaly_trend_window
        ? source.anomaly_trend_window
        : "24h",
    show_delta_analysis: source.show_delta_analysis === true,
    show_delta_tooltip: source.show_delta_tooltip !== false,
    show_delta_lines: source.show_delta_lines === true,
    hide_source_series: source.hide_source_series === true,
    sample_interval:
      typeof source.sample_interval === "string" &&
      VALID_SAMPLE_INTERVALS.includes(source.sample_interval)
        ? source.sample_interval
        : "1m",
    sample_aggregate:
      typeof source.sample_aggregate === "string" &&
      VALID_SAMPLE_AGGREGATES.includes(source.sample_aggregate)
        ? source.sample_aggregate
        : "mean",
    stepped_series: source.stepped_series === true,
    anomaly_use_sampled_data: source.anomaly_use_sampled_data !== false,
  };
}

export function historySeriesRowHasConfiguredAnalysis(
  row:
    | Nullable<{ analysis?: Nullable<PartialHistorySeriesAnalysis> }>
    | undefined
): boolean {
  const analysis = normalizeHistorySeriesAnalysis(row?.analysis);
  return (
    analysis.show_trend_lines ||
    analysis.show_summary_stats ||
    analysis.show_rate_of_change ||
    analysis.show_threshold_analysis ||
    analysis.show_anomalies ||
    analysis.show_delta_analysis ||
    analysis.stepped_series ||
    analysis.hide_source_series
  );
}

export function normalizeHistorySeriesRows(rows: unknown): HistorySeriesRow[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  const seen = new Set<string>();
  const normalized: HistorySeriesRow[] = [];
  rows.forEach((row, index) => {
    const entityId =
      typeof row?.entity_id === "string" ? row.entity_id.trim() : "";
    if (!entityId || seen.has(entityId)) {
      return;
    }
    seen.add(entityId);
    normalized.push({
      entity_id: entityId,
      color:
        typeof row?.color === "string" && /^#[0-9a-f]{6}$/i.test(row.color)
          ? row.color
          : COLORS[index % COLORS.length],
      visible: row?.visible !== false,
      analysis: normalizeHistorySeriesAnalysis(row?.analysis),
    });
  });
  return normalized;
}

export function buildHistorySeriesRows(
  entityIds: unknown,
  previousRows: unknown[] = []
): HistorySeriesRow[] {
  const normalizedPrevious = normalizeHistorySeriesRows(previousRows);
  const previousMap = new Map(
    normalizedPrevious.map((row) => [row.entity_id, row])
  );
  const intervals = normalizedPrevious.map(
    (row) => row.analysis.sample_interval
  );
  const allSame =
    intervals.length > 0 &&
    intervals.every((interval) => interval === intervals[0]);
  const inheritedSampleSettings = allSame
    ? {
        sample_interval: intervals[0],
        sample_aggregate: normalizedPrevious[0].analysis.sample_aggregate,
      }
    : null;

  return normalizeEntityIds(entityIds).map((entityId, index) => {
    const existing = previousMap.get(entityId);
    if (existing) {
      return existing;
    }
    return {
      entity_id: entityId,
      color: COLORS[index % COLORS.length],
      visible: true,
      analysis: normalizeHistorySeriesAnalysis(inheritedSampleSettings),
    };
  });
}

export function slugifySeriesName(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseSeriesColorsParam(value: unknown): RecordWithStringValues {
  if (!value || typeof value !== "string") {
    return {};
  }

  return value.split(",").reduce<RecordWithStringValues>((acc, entry) => {
    const [rawKey, rawColor] = entry.split(":");
    const key = decodeURIComponent(rawKey || "").trim();
    const color = String(rawColor || "").trim();
    if (!key || !/^#[0-9a-f]{6}$/i.test(color)) {
      return acc;
    }
    acc[key] = color;
    return acc;
  }, {});
}
