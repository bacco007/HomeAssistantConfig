/**
 * Pure analysis utilities extracted from history-chart.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import {
  type HistorySeriesAnalysis,
  normalizeHistorySeriesAnalysis,
} from "@/lib/domain/history-series";
import {
  buildDeltaPoints,
  buildEmaTrend,
  buildLinearTrend,
  buildLowessTrend,
  buildPolynomialTrend,
  buildRateOfChangePoints,
  buildRollingAverageTrend,
  buildSummaryStats,
  getEmaAlpha,
  getLowessBandwidth,
  getTrendWindowMs,
} from "@/cards/history/analysis";
import type { ComputeHistoryAnalysisPayload } from "@/lib/workers/history-analysis.worker";

// ── Local type aliases ──────────────────────────────────────────────────────

type SeriesAnalysis = HistorySeriesAnalysis;

interface AnalysisSeriesItem {
  entityId: string;
  pts: [number, number][];
  [key: string]: unknown;
}

// ── Analysis cache key ──────────────────────────────────────────────────────

const ANALYSIS_FIELDS = [
  "show_trend_lines",
  "trend_method",
  "trend_window",
  "show_rate_of_change",
  "rate_window",
  "show_delta_analysis",
  "show_summary_stats",
  "show_anomalies",
  "anomaly_methods",
  "anomaly_sensitivity",
  "anomaly_overlap_mode",
  "anomaly_rate_window",
  "anomaly_zscore_window",
  "anomaly_persistence_window",
  "anomaly_comparison_window_id",
  "anomaly_use_sampled_data",
  "anomaly_trend_method",
  "anomaly_trend_window",
] as const;

export function buildAnalysisCacheKey(
  visibleSeries: AnalysisSeriesItem[],
  selectedComparisonSeriesMap: Map<string, AnalysisSeriesItem>,
  analysisMap: Map<string, SeriesAnalysis>,
  allComparisonWindowsData: Record<string, Record<string, [number, number][]>>,
  t0: number,
  t1: number
): string {
  const seriesPart = visibleSeries
    .map((s) => {
      const a =
        analysisMap.get(s.entityId) || normalizeHistorySeriesAnalysis(null);
      const first = s.pts[0]?.[0] ?? 0;
      const last = s.pts[s.pts.length - 1]?.[0] ?? 0;
      const aKey = ANALYSIS_FIELDS.map((f) => JSON.stringify(a[f])).join(",");
      return `${s.entityId}:${s.pts.length}:${first}:${last}:${aKey}`;
    })
    .join("|");

  const cmpPart = Array.from(selectedComparisonSeriesMap.values())
    .map((s) => {
      const first = s.pts[0]?.[0] ?? 0;
      const last = s.pts[s.pts.length - 1]?.[0] ?? 0;
      return `${s.entityId}:${s.pts.length}:${first}:${last}`;
    })
    .sort()
    .join("|");

  const allCmpPart = Object.entries(allComparisonWindowsData)
    .flatMap(([windowId, entities]) =>
      Object.entries(entities).map(([entityId, pts]) => {
        const first = pts[0]?.[0] ?? 0;
        const last = pts[pts.length - 1]?.[0] ?? 0;
        return `${windowId}:${entityId}:${pts.length}:${first}:${last}`;
      })
    )
    .sort()
    .join("|");

  return `${t0}:${t1}|${seriesPart}|${cmpPart}|${allCmpPart}`;
}

// ── Analysis payload builder ────────────────────────────────────────────────

export function buildHistoryAnalysisPayload(
  visibleSeries: AnalysisSeriesItem[],
  selectedComparisonSeriesMap: Map<string, AnalysisSeriesItem>,
  analysisMap: Map<string, SeriesAnalysis>,
  hasSelectedComparisonWindow: boolean,
  allComparisonWindowsData: Record<
    string,
    Record<string, [number, number][]>
  > = {}
): ComputeHistoryAnalysisPayload {
  const defaultAnalysis = normalizeHistorySeriesAnalysis(null);
  const series: ComputeHistoryAnalysisPayload["series"] = visibleSeries.map(
    (seriesItem) => ({
      entityId: seriesItem.entityId,
      pts: seriesItem.pts,
      analysis: analysisMap.get(seriesItem.entityId) || defaultAnalysis,
    })
  );
  const comparisonSeries: ComputeHistoryAnalysisPayload["comparisonSeries"] =
    Array.from(selectedComparisonSeriesMap.values()).map((seriesItem) => ({
      entityId: seriesItem.entityId,
      pts: seriesItem.pts,
    }));

  const seriesAnalysisConfigs: Record<string, Partial<SeriesAnalysis>> = {};
  for (const seriesItem of visibleSeries) {
    seriesAnalysisConfigs[seriesItem.entityId] =
      analysisMap.get(seriesItem.entityId) || defaultAnalysis;
  }

  return {
    series,
    comparisonSeries,
    hasSelectedComparisonWindow: hasSelectedComparisonWindow === true,
    allComparisonWindowsData,
    seriesAnalysisConfigs,
  };
}

// ── Trend point builders ────────────────────────────────────────────────────

export function buildTrendPoints(
  pts: [number, number][],
  method?: string,
  window?: string
): [number, number][] {
  if (!Array.isArray(pts) || pts.length < 2) {
    return [];
  }
  const m = method || "rolling_average";
  const w = window || "24h";
  switch (m) {
    case "linear_trend":
      return buildLinearTrend(pts);
    case "ema":
      return buildEmaTrend(pts, getEmaAlpha(w));
    case "polynomial_trend":
      return buildPolynomialTrend(pts);
    case "lowess":
      return buildLowessTrend(pts, getLowessBandwidth(w, pts));
    default:
      return buildRollingAverageTrend(pts, getTrendWindowMs(w));
  }
}

export function buildRateOfChange(
  pts: [number, number][],
  window?: string
): [number, number][] {
  if (!Array.isArray(pts) || pts.length < 2) {
    return [];
  }
  return buildRateOfChangePoints(pts, window || "1h");
}

export function buildDelta(
  pts: [number, number][],
  comparisonPts: [number, number][]
): [number, number][] {
  return buildDeltaPoints(pts, comparisonPts);
}

export function buildSummary(pts: [number, number][]): {
  min: number;
  max: number;
  mean: number;
} {
  return buildSummaryStats(pts) ?? { min: 0, max: 0, mean: 0 };
}

// ── Series analysis state checks ────────────────────────────────────────────

export function seriesHasActiveAnalysis(
  analysis: SeriesAnalysis,
  hasSelectedComparisonWindow = false
): boolean {
  return !!(
    analysis.show_trend_lines ||
    analysis.show_summary_stats ||
    analysis.show_rate_of_change ||
    analysis.show_threshold_analysis ||
    analysis.show_anomalies ||
    (analysis.show_delta_analysis && hasSelectedComparisonWindow)
  );
}

export function seriesShouldHideSource(
  analysis: SeriesAnalysis,
  hasSelectedComparisonWindow = false
): boolean {
  return (
    analysis.hide_source_series === true &&
    seriesHasActiveAnalysis(analysis, hasSelectedComparisonWindow)
  );
}

// ── Trend render options ────────────────────────────────────────────────────

export interface TrendRenderOptions {
  colorAlpha: number;
  lineOpacity: number;
  lineWidth: number;
  dashed: boolean;
  dotted: boolean;
}

export function getTrendRenderOptions(
  method = "rolling_average",
  hideRawData = false
): TrendRenderOptions {
  if (method === "linear_trend") {
    return {
      colorAlpha: hideRawData ? 0.94 : 0.88,
      lineOpacity: hideRawData ? 0.86 : 0.74,
      lineWidth: 2.1,
      dashed: true,
      dotted: false,
    };
  }
  if (method === "ema") {
    return {
      colorAlpha: hideRawData ? 0.92 : 0.84,
      lineOpacity: hideRawData ? 0.86 : 0.65,
      lineWidth: 2.0,
      dashed: false,
      dotted: true,
    };
  }
  if (method === "polynomial_trend") {
    return {
      colorAlpha: hideRawData ? 0.94 : 0.86,
      lineOpacity: hideRawData ? 0.86 : 0.72,
      lineWidth: 2.0,
      dashed: true,
      dotted: false,
    };
  }
  if (method === "lowess") {
    return {
      colorAlpha: hideRawData ? 0.9 : 0.82,
      lineOpacity: hideRawData ? 0.84 : 0.6,
      lineWidth: 1.8,
      dashed: false,
      dotted: false,
    };
  }
  return {
    colorAlpha: hideRawData ? 0.9 : 0.82,
    lineOpacity: hideRawData ? 0.84 : 0.62,
    lineWidth: 2.2,
    dashed: false,
    dotted: true,
  };
}

// ── Series analysis map builder ─────────────────────────────────────────────

export function buildSeriesAnalysisMap(
  seriesSettings: Array<{
    entity_id?: string;
    analysis?: Nullable<Record<string, unknown>>;
  }>
): Map<string, SeriesAnalysis> {
  return new Map(
    seriesSettings
      .filter((entry) => entry?.entity_id != null)
      .map((entry) => [
        entry.entity_id as string,
        normalizeHistorySeriesAnalysis(entry?.analysis),
      ])
  );
}
