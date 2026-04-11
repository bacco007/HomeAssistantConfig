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
  interpolateSeriesValue,
} from "@/cards/history/analysis";

export {
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
  interpolateSeriesValue,
};

// ── Worker-specific types ─────────────────────────────────────────────────────

/** Alias kept for backward compat with worker message payload types. */
export type HistoryAnalysisPoint = [number, number];

export interface WorkerSeriesAnalysis {
  show_trend_lines: boolean;
  trend_method:
    | "linear_trend"
    | "rolling_average"
    | "ema"
    | "polynomial_trend"
    | "lowess";
  trend_window: string;
  show_summary_stats: boolean;
  show_rate_of_change: boolean;
  rate_window: string;
  show_delta_analysis: boolean;
}

export interface WorkerSeriesInput {
  entityId: string;
  pts: HistoryAnalysisPoint[];
  analysis?: Partial<Record<keyof WorkerSeriesAnalysis, unknown>>;
}

export interface ComparisonSeriesInput {
  entityId: string;
  pts: HistoryAnalysisPoint[];
}

export interface ComputeHistoryAnalysisPayload {
  series?: WorkerSeriesInput[];
  comparisonSeries?: ComparisonSeriesInput[];
  hasSelectedComparisonWindow?: boolean;
  allComparisonWindowsData?: Record<
    string,
    Record<string, HistoryAnalysisPoint[]>
  >;
  /** Per-entity analysis config used to compute comparisonWindowResults. */
  seriesAnalysisConfigs?: Record<string, Partial<WorkerSeriesAnalysis>>;
}

export interface ComparisonWindowAnalysis {
  trendPts: HistoryAnalysisPoint[];
  ratePts: HistoryAnalysisPoint[];
  summaryStats: Nullable<{ min: number; max: number; mean: number }>;
}

export interface TrendSeriesResult {
  entityId: string;
  pts: HistoryAnalysisPoint[];
}

export interface SummaryStatsResult {
  entityId: string;
  min: number;
  max: number;
  mean: number;
}

export interface HistoryAnalysisResult {
  trendSeries: TrendSeriesResult[];
  rateSeries: TrendSeriesResult[];
  deltaSeries: TrendSeriesResult[];
  summaryStats: SummaryStatsResult[];
  anomalySeries: unknown[];
  /** Pre-computed analysis per comparison window and entity. */
  comparisonWindowResults: Record<
    string,
    Record<string, ComparisonWindowAnalysis>
  >;
}

// ── Worker-specific logic ─────────────────────────────────────────────────────

export function normalizeSeriesAnalysis(
  analysis:
    | Partial<Nullable<Record<keyof WorkerSeriesAnalysis, unknown>>>
    | undefined
): WorkerSeriesAnalysis {
  const source = analysis && typeof analysis === "object" ? analysis : {};

  return {
    show_trend_lines: source.show_trend_lines === true,
    trend_method: (
      [
        "linear_trend",
        "rolling_average",
        "ema",
        "polynomial_trend",
        "lowess",
      ] as const
    ).includes(source.trend_method as WorkerSeriesAnalysis["trend_method"])
      ? (source.trend_method as WorkerSeriesAnalysis["trend_method"])
      : "rolling_average",
    trend_window:
      typeof source.trend_window === "string" && source.trend_window
        ? source.trend_window
        : "24h",
    show_summary_stats: source.show_summary_stats === true,
    show_rate_of_change: source.show_rate_of_change === true,
    rate_window:
      typeof source.rate_window === "string" && source.rate_window
        ? source.rate_window
        : "1h",
    show_delta_analysis: source.show_delta_analysis === true,
  };
}

export function buildTrendPoints(
  points: HistoryAnalysisPoint[],
  method: string,
  trendWindow: string
): HistoryAnalysisPoint[] {
  if (!Array.isArray(points) || points.length < 2) {
    return [];
  }
  switch (method) {
    case "linear_trend":
      return buildLinearTrend(points);
    case "ema":
      return buildEmaTrend(points, getEmaAlpha(trendWindow));
    case "polynomial_trend":
      return buildPolynomialTrend(points);
    case "lowess":
      return buildLowessTrend(points, getLowessBandwidth(trendWindow, points));
    default:
      return buildRollingAverageTrend(points, getTrendWindowMs(trendWindow));
  }
}

export function computeHistoryAnalysis(
  payload: ComputeHistoryAnalysisPayload
): HistoryAnalysisResult {
  const series = (Array.isArray(payload?.series) ? payload.series : []).map(
    (seriesItem) => ({
      ...seriesItem,
      analysis: normalizeSeriesAnalysis(seriesItem?.analysis),
    })
  );
  const comparisonSeries = new Map(
    (Array.isArray(payload?.comparisonSeries) ? payload.comparisonSeries : [])
      .filter((entry) => entry?.entityId)
      .map((entry) => [entry.entityId, entry])
  );
  const result: HistoryAnalysisResult = {
    trendSeries: [],
    rateSeries: [],
    deltaSeries: [],
    summaryStats: [],
    anomalySeries: [],
    comparisonWindowResults: {},
  };

  for (const seriesItem of series) {
    const points = Array.isArray(seriesItem?.pts) ? seriesItem.pts : [];
    const analysis = normalizeSeriesAnalysis(seriesItem?.analysis);
    if (points.length < 2) {
      continue;
    }

    if (analysis.show_trend_lines === true) {
      const trendPoints = buildTrendPoints(
        points,
        analysis.trend_method,
        analysis.trend_window
      );
      if (trendPoints.length >= 2) {
        result.trendSeries.push({
          entityId: seriesItem.entityId,
          pts: trendPoints,
        });
      }
    }

    if (analysis.show_rate_of_change === true) {
      const ratePoints = buildRateOfChangePoints(points, analysis.rate_window);
      if (ratePoints.length >= 2) {
        result.rateSeries.push({
          entityId: seriesItem.entityId,
          pts: ratePoints,
        });
      }
    }

    if (analysis.show_summary_stats === true) {
      const summaryStats = buildSummaryStats(points);
      if (summaryStats) {
        result.summaryStats.push({
          entityId: seriesItem.entityId,
          ...summaryStats,
        });
      }
    }

    if (
      analysis.show_delta_analysis === true &&
      payload?.hasSelectedComparisonWindow === true
    ) {
      const comparisonEntry = comparisonSeries.get(seriesItem.entityId);
      const comparisonPoints = comparisonEntry?.pts ?? [];
      if (comparisonPoints.length >= 2) {
        const deltaPoints = buildDeltaPoints(points, comparisonPoints);
        if (deltaPoints.length >= 2) {
          result.deltaSeries.push({
            entityId: seriesItem.entityId,
            pts: deltaPoints,
          });
        }
      }
    }
  }

  // Comparison window analysis — per-window, per-entity trend/rate/summary.
  const seriesAnalysisConfigs =
    typeof payload?.seriesAnalysisConfigs === "object" &&
    payload.seriesAnalysisConfigs !== null
      ? payload.seriesAnalysisConfigs
      : {};
  const allComparisonWindowsData =
    typeof payload?.allComparisonWindowsData === "object" &&
    payload.allComparisonWindowsData !== null
      ? payload.allComparisonWindowsData
      : {};

  for (const [windowId, entityPtsMap] of Object.entries(
    allComparisonWindowsData
  )) {
    result.comparisonWindowResults[windowId] = {};
    for (const [entityId, pts] of Object.entries(entityPtsMap)) {
      const winAnalysis = normalizeSeriesAnalysis(
        seriesAnalysisConfigs[entityId]
      );
      result.comparisonWindowResults[windowId][entityId] = {
        trendPts:
          winAnalysis.show_trend_lines && pts.length >= 2
            ? buildTrendPoints(
                pts,
                winAnalysis.trend_method,
                winAnalysis.trend_window
              )
            : [],
        ratePts:
          winAnalysis.show_rate_of_change && pts.length >= 2
            ? buildRateOfChangePoints(pts, winAnalysis.rate_window)
            : [],
        summaryStats: winAnalysis.show_summary_stats
          ? buildSummaryStats(pts)
          : null,
      };
    }
  }

  return result;
}

// ── Message handler ───────────────────────────────────────────────────────────

const workerScope = globalThis as typeof globalThis & {
  onmessage: Nullable<
    (
      event: MessageEvent<{
        id?: number;
        payload: ComputeHistoryAnalysisPayload;
      }>
    ) => void
  >;
  postMessage: (message: unknown) => void;
};

workerScope.onmessage = (
  event: MessageEvent<{ id?: number; payload: ComputeHistoryAnalysisPayload }>
) => {
  const { id, payload } = event.data || {};
  try {
    const result = computeHistoryAnalysis(payload);
    workerScope.postMessage({ id, result });
  } catch (error) {
    workerScope.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
