// ---------------------------------------------------------------------------
// Shared types for target-row and related components
// ---------------------------------------------------------------------------

export interface NormalizedAnalysis {
  expanded: boolean;
  show_trend_lines: boolean;
  trend_method: string;
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
  threshold_direction: string;
  show_anomalies: boolean;
  anomaly_methods: string[];
  anomaly_overlap_mode: string;
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

export interface ComparisonWindow {
  id: string;
  label?: string;
}

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: RecordWithUnknownValues;
  last_changed?: string;
  last_updated?: string;
  context?: {
    id: string;
    parent_id: Nullable<string>;
    user_id: Nullable<string>;
  };
}
