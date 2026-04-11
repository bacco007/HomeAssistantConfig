import { html } from "lit";
import "../analysis-summary-group";
import type { NormalizedAnalysis } from "../../target-row/types";

export default {
  title: "Molecules/Analysis/Summary Group",
  component: "analysis-summary-group",
  parameters: {
    actions: {
      handles: ["dp-group-analysis-change"],
    },
  },
};

function makeAnalysis(
  overrides: Partial<NormalizedAnalysis> = {}
): NormalizedAnalysis {
  return {
    expanded: false,
    show_trend_lines: false,
    trend_method: "rolling_average",
    trend_window: "24h",
    show_trend_crosshairs: false,
    show_summary_stats: false,
    show_summary_stats_shading: false,
    show_rate_of_change: false,
    show_rate_crosshairs: false,
    rate_window: "1h",
    show_threshold_analysis: false,
    show_threshold_shading: false,
    threshold_value: "",
    threshold_direction: "above",
    show_anomalies: false,
    anomaly_methods: [],
    anomaly_overlap_mode: "all",
    anomaly_sensitivity: "medium",
    anomaly_rate_window: "1h",
    anomaly_zscore_window: "24h",
    anomaly_persistence_window: "1h",
    anomaly_comparison_window_id: null,
    show_delta_analysis: false,
    show_delta_tooltip: false,
    show_delta_lines: false,
    hide_source_series: false,
    sample_interval: "raw",
    sample_aggregate: "mean",
    stepped_series: false,
    anomaly_use_sampled_data: false,
    anomaly_trend_method: "",
    anomaly_trend_window: "24h",
    ...overrides,
  };
}

export const Default = {
  render: () => html`
    <analysis-summary-group
      .analysis=${makeAnalysis()}
      .entityId=${"sensor.temperature"}
    ></analysis-summary-group>
  `,
};

export const Checked = {
  render: () => html`
    <analysis-summary-group
      .analysis=${makeAnalysis({ show_summary_stats: true })}
      .entityId=${"sensor.temperature"}
    ></analysis-summary-group>
  `,
};

export const CheckedWithShading = {
  render: () => html`
    <analysis-summary-group
      .analysis=${makeAnalysis({
        show_summary_stats: true,
        show_summary_stats_shading: true,
      })}
      .entityId=${"sensor.temperature"}
    ></analysis-summary-group>
  `,
};
