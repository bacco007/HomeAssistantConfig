/**
 * Pure anomaly config builder extracted from history-chart.ts.
 */

import type { BackendAnomalyConfig } from "@/lib/data/history-api";

export function buildBackendAnomalyConfig(
  analysis: RecordWithUnknownValues
): BackendAnomalyConfig {
  const rawMethods: string[] = Array.isArray(analysis.anomaly_methods)
    ? (analysis.anomaly_methods as string[])
    : [];
  const hasSimilarEntity = rawMethods.includes("similar_entity");
  // Map similar_entity → comparison_window for the backend, deduplicating
  const backendMethods = hasSimilarEntity
    ? [
        ...new Set(
          rawMethods.map((m) =>
            m === "similar_entity" ? "comparison_window" : m
          )
        ),
      ]
    : rawMethods;
  const config: BackendAnomalyConfig = {
    anomaly_methods: backendMethods.length > 0 ? backendMethods : undefined,
    anomaly_sensitivity:
      typeof analysis.anomaly_sensitivity === "string"
        ? analysis.anomaly_sensitivity
        : undefined,
    anomaly_overlap_mode:
      typeof analysis.anomaly_overlap_mode === "string"
        ? analysis.anomaly_overlap_mode
        : undefined,
    anomaly_rate_window:
      typeof analysis.anomaly_rate_window === "string"
        ? analysis.anomaly_rate_window
        : undefined,
    anomaly_zscore_window:
      typeof analysis.anomaly_zscore_window === "string"
        ? analysis.anomaly_zscore_window
        : undefined,
    anomaly_persistence_window:
      typeof analysis.anomaly_persistence_window === "string"
        ? analysis.anomaly_persistence_window
        : undefined,
    trend_method: (() => {
      if (
        typeof analysis.anomaly_trend_method === "string" &&
        analysis.anomaly_trend_method
      ) {
        return analysis.anomaly_trend_method;
      }
      return typeof analysis.trend_method === "string"
        ? analysis.trend_method
        : undefined;
    })(),
    trend_window: (() => {
      if (
        typeof analysis.anomaly_trend_method === "string" &&
        analysis.anomaly_trend_method &&
        typeof analysis.anomaly_trend_window === "string" &&
        analysis.anomaly_trend_window
      ) {
        return analysis.anomaly_trend_window;
      }
      return typeof analysis.trend_window === "string"
        ? analysis.trend_window
        : undefined;
    })(),
    anomaly_use_sampled_data: analysis.anomaly_use_sampled_data !== false,
    comparison_entity_id:
      hasSimilarEntity &&
      typeof analysis.anomaly_comparison_entity_id === "string" &&
      analysis.anomaly_comparison_entity_id
        ? analysis.anomaly_comparison_entity_id
        : null,
  };
  if (analysis.anomaly_use_sampled_data !== false) {
    config.sample_interval =
      typeof analysis.sample_interval === "string"
        ? analysis.sample_interval
        : null;
    config.sample_aggregate =
      typeof analysis.sample_aggregate === "string"
        ? analysis.sample_aggregate
        : null;
  }
  return config;
}
