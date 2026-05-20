/**
 * Pure config-diffing utilities for the history card.
 *
 * Used by `setConfig()` to determine which parts of the chart need updating
 * when the card configuration changes.
 */

import type { CardConfig } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────

interface SeriesSettingEntry {
  entity_id?: string;
  entity?: string;
  entityId?: string;
  [key: string]: unknown;
}

export interface ConfigDiffResult {
  dataChanged: boolean;
  viewChanged: boolean;
  comparisonChanged: boolean;
  preloadComparisonChanged: boolean;
  comparisonOverlayChanged: boolean;
}

// ── Key builders ─────────────────────────────────────────────────────────

/** Build a stable JSON key for data-affecting config fields. */
export function buildDataKey(config: Partial<CardConfig>): string {
  return JSON.stringify({
    target: config.target || null,
    entities: config.entities,
    entity: config.entity,
    series_entities: Array.isArray(config.series_settings)
      ? (config.series_settings as SeriesSettingEntry[]).map(
          (entry) =>
            entry?.entity_id || entry?.entity || entry?.entityId || null
        )
      : null,
    datapoint_scope: config.datapoint_scope,
    hours_to_show: config.hours_to_show,
    start_time: config.start_time,
    end_time: config.end_time,
  });
}

/** Build a stable JSON key for view/rendering config fields. */
export function buildViewKey(config: Partial<CardConfig>): string {
  return JSON.stringify({
    series_settings: config.series_settings || [],
    zoom_start_time: config.zoom_start_time,
    zoom_end_time: config.zoom_end_time,
    message_filter: config.message_filter || "",
    hidden_event_ids: config.hidden_event_ids || [],
    hovered_event_ids: config.hovered_event_ids || [],
    show_event_markers: config.show_event_markers !== false,
    show_event_lines: config.show_event_lines !== false,
    show_tooltips: config.show_tooltips !== false,
    emphasize_hover_guides: config.emphasize_hover_guides === true,
    hover_snap_mode: (config.hover_snap_mode as string) || "follow_series",
    show_correlated_anomalies: config.show_correlated_anomalies === true,
    show_trend_lines: config.show_trend_lines === true,
    show_summary_stats: config.show_summary_stats === true,
    show_rate_of_change: config.show_rate_of_change === true,
    show_threshold_analysis: config.show_threshold_analysis === true,
    show_threshold_shading: config.show_threshold_shading === true,
    show_anomalies: config.show_anomalies === true,
    hide_raw_data: config.hide_raw_data === true,
    show_trend_crosshairs: config.show_trend_crosshairs === true,
    trend_method: (config.trend_method as string) || "rolling_average",
    trend_window: (config.trend_window as string) || "24h",
    rate_window: (config.rate_window as string) || "1h",
    anomaly_sensitivity: (config.anomaly_sensitivity as string) || "medium",
    threshold_values: config.threshold_values || {},
    threshold_directions: config.threshold_directions || {},
    show_delta_analysis: config.show_delta_analysis === true,
    show_delta_tooltip: config.show_delta_tooltip !== false,
    show_delta_lines: config.show_delta_lines === true,
    hide_delta_source_series: config.hide_delta_source_series === true,
    delink_y_axis: config.delink_y_axis === true,
    split_view: config.split_view === true,
    show_data_gaps: config.show_data_gaps !== false,
    data_gap_threshold: (config.data_gap_threshold as string) || "2h",
    comparison_hover_active: config.comparison_hover_active === true,
    selected_comparison_window_id: config.selected_comparison_window_id || null,
    hovered_comparison_window_id: config.hovered_comparison_window_id || null,
  });
}

/** Build a stable JSON key for comparison window config fields. */
export function buildComparisonKey(config: Partial<CardConfig>): string {
  return JSON.stringify(config.comparison_windows || []);
}

/** Build a stable JSON key for preload comparison window config. */
export function buildPreloadComparisonKey(config: Partial<CardConfig>): string {
  return JSON.stringify(config.preload_comparison_windows || []);
}

/** Build a stable JSON key for comparison overlay config. */
export function buildComparisonOverlayKey(config: Partial<CardConfig>): string {
  return JSON.stringify(config.comparison_preview_overlay || null);
}

/**
 * Compare two card configs and return which aspects changed.
 */
export function diffCardConfig(
  currentConfig: Partial<CardConfig>,
  nextConfig: Partial<CardConfig>
): ConfigDiffResult {
  return {
    dataChanged: buildDataKey(currentConfig) !== buildDataKey(nextConfig),
    viewChanged: buildViewKey(currentConfig) !== buildViewKey(nextConfig),
    comparisonChanged:
      buildComparisonKey(currentConfig) !== buildComparisonKey(nextConfig),
    preloadComparisonChanged:
      buildPreloadComparisonKey(currentConfig) !==
      buildPreloadComparisonKey(nextConfig),
    comparisonOverlayChanged:
      buildComparisonOverlayKey(currentConfig) !==
      buildComparisonOverlayKey(nextConfig),
  };
}

// ── Data inspection helpers ──────────────────────────────────────────────

/**
 * Check if any entity has drawable history or statistics data.
 */
export function hasDrawableHistoryData(
  entityIds: string[],
  histResult: Record<string, unknown>,
  statsResult: Record<string, unknown>
): boolean {
  return entityIds.some((entityId) => {
    const histData = histResult[entityId];
    const statsData = statsResult[entityId];
    const histPoints = Array.isArray(histData) ? histData.length : 0;
    const statsPoints = Array.isArray(statsData) ? statsData.length : 0;
    return histPoints > 0 || statsPoints > 0;
  });
}

/**
 * Compute a quality descriptor for drawable data, used to avoid
 * downgrading a high-resolution draw with a lower-resolution one.
 */
export function getDrawableHistoryQuality(
  entityIds: string[],
  histResult: Record<string, unknown>,
  statsResult: Record<string, unknown>
): { totalPoints: number } {
  let totalPoints = 0;
  for (const entityId of entityIds) {
    const histData = histResult[entityId];
    const statsData = statsResult[entityId];
    totalPoints += Array.isArray(histData) ? histData.length : 0;
    totalPoints += Array.isArray(statsData) ? statsData.length : 0;
  }
  return { totalPoints };
}

/**
 * Filter events by visibility and optional message search query.
 */
export function filterEvents(
  events: unknown[],
  hiddenEventIds: Set<string>,
  messageFilter: string
): unknown[] {
  const query = String(messageFilter || "")
    .trim()
    .toLowerCase();
  const visibleEvents = events.filter(
    (event) => !hiddenEventIds.has((event as { id?: string })?.id ?? "")
  );
  if (!query) {
    return visibleEvents;
  }
  return visibleEvents.filter((event) => {
    const ev = event as {
      message?: string;
      annotation?: string;
      entity_ids?: string[];
    };
    const haystack = [
      ev?.message || "",
      ev?.annotation || "",
      ...(ev?.entity_ids || []).filter(Boolean),
    ]
      .join("\n")
      .toLowerCase();
    return haystack.includes(query);
  });
}
