/**
 * Pure logic for the anomaly monitor wizard.
 *
 * All functions are stateless — no DOM, no events, no component state.
 */

import type {
  AnomalyMonitor,
  CreateMonitorPayload,
} from "@/lib/data/monitors-api";

// ── Constants ─────────────────────────────────────────────────────────────

export const LOOK_BACK_OPTIONS = [
  { value: 6, label: "6 hours" },
  { value: 12, label: "12 hours" },
  { value: 24, label: "24 hours" },
  { value: 48, label: "48 hours" },
  { value: 168, label: "7 days" },
];

export const SCAN_INTERVAL_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
  { value: 360, label: "6 hours" },
];

// ── Per-entity analysis config ────────────────────────────────────────────

export interface EntityAnalysisConfig {
  anomaly_methods: string[];
  anomaly_overlap_mode: string;
  anomaly_sensitivity: string;
  anomaly_rate_window: string;
  anomaly_zscore_window: string;
  anomaly_persistence_window: string;
  anomaly_comparison_window_id: string | null;
  anomaly_comparison_entity_id: string | null;
  anomaly_trend_method: string;
  anomaly_trend_window: string;
  sample_interval: string;
  sample_aggregate: string;
  anomaly_use_sampled_data: boolean;
  baseline_entity_id: string | null;
  baseline_time_offset_hours: number;
}

// ── Analysis type for sub-component consumption ───────────────────────────

export interface WizardNormalizedAnalysis {
  show_anomalies: boolean;
  anomaly_methods: string[];
  anomaly_sensitivity: string;
  anomaly_rate_window: string;
  anomaly_zscore_window: string;
  anomaly_persistence_window: string;
  anomaly_trend_method: string;
  anomaly_trend_window: string;
  anomaly_use_sampled_data: boolean;
  sample_interval: string;
  sample_aggregate: string;
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
  anomaly_overlap_mode: string;
  anomaly_comparison_window_id: string | null;
  anomaly_comparison_entity_id: string | null;
  show_delta_analysis: boolean;
  show_delta_tooltip: boolean;
  show_delta_lines: boolean;
  hide_source_series: boolean;
  stepped_series: boolean;
  expanded: boolean;
}

// ── Factory: default config ───────────────────────────────────────────────

interface PartialPrefill {
  anomaly_methods?: string[];
  anomaly_overlap_mode?: string;
  anomaly_sensitivity?: string;
  anomaly_rate_window?: string;
  anomaly_zscore_window?: string;
  anomaly_persistence_window?: string;
  anomaly_comparison_window_id?: string | null;
  anomaly_comparison_entity_id?: string | null;
  anomaly_trend_method?: string;
  anomaly_trend_window?: string;
  sample_interval?: string;
  sample_aggregate?: string;
  anomaly_use_sampled_data?: boolean;
}

export function defaultEntityConfig(
  prefill?: Partial<PartialPrefill> | null
): EntityAnalysisConfig {
  return {
    anomaly_methods: prefill?.anomaly_methods?.length
      ? [...prefill.anomaly_methods]
      : ["trend_residual"],
    anomaly_overlap_mode: prefill?.anomaly_overlap_mode ?? "all",
    anomaly_sensitivity: prefill?.anomaly_sensitivity ?? "medium",
    anomaly_rate_window: prefill?.anomaly_rate_window ?? "1h",
    anomaly_zscore_window: prefill?.anomaly_zscore_window ?? "24h",
    anomaly_persistence_window: prefill?.anomaly_persistence_window ?? "1h",
    anomaly_comparison_window_id: prefill?.anomaly_comparison_window_id ?? null,
    anomaly_comparison_entity_id: prefill?.anomaly_comparison_entity_id ?? null,
    anomaly_trend_method: prefill?.anomaly_trend_method || "rolling_average",
    anomaly_trend_window: prefill?.anomaly_trend_window ?? "24h",
    sample_interval: prefill?.sample_interval ?? "raw",
    sample_aggregate: prefill?.sample_aggregate ?? "mean",
    anomaly_use_sampled_data: prefill?.anomaly_use_sampled_data ?? false,
    baseline_entity_id: null,
    baseline_time_offset_hours: 0,
  };
}

// ── Factory: config from existing monitor ─────────────────────────────────

export function configFromMonitor(m: AnomalyMonitor): EntityAnalysisConfig {
  const baselineEntityId =
    ((m as unknown as Record<string, unknown>).baseline_entity_id as string) ??
    null;
  const rawMethods = [...m.anomaly_methods];
  const frontendMethods = rawMethods.map((method) => {
    if (method === "comparison_window" && baselineEntityId) {
      return "similar_entity";
    }
    return method;
  });

  return {
    anomaly_methods: frontendMethods,
    anomaly_overlap_mode: m.anomaly_overlap_mode ?? "all",
    anomaly_sensitivity: m.anomaly_sensitivity,
    anomaly_rate_window: m.anomaly_rate_window,
    anomaly_zscore_window: m.anomaly_zscore_window,
    anomaly_persistence_window: m.anomaly_persistence_window,
    anomaly_comparison_window_id: null,
    anomaly_comparison_entity_id: baselineEntityId,
    anomaly_trend_method: m.anomaly_trend_method,
    anomaly_trend_window: m.anomaly_trend_window,
    sample_interval: m.sample_interval ?? "raw",
    sample_aggregate: m.sample_aggregate ?? "mean",
    anomaly_use_sampled_data: m.anomaly_use_sampled_data ?? false,
    baseline_entity_id: baselineEntityId,
    baseline_time_offset_hours:
      ((m as unknown as Record<string, unknown>)
        .baseline_time_offset_hours as number) ?? 0,
  };
}

// ── Convert wizard config to full analysis ────────────────────────────────

export function entityConfigToAnalysis(
  cfg: EntityAnalysisConfig
): WizardNormalizedAnalysis {
  return {
    show_anomalies: true,
    anomaly_methods: [...cfg.anomaly_methods],
    anomaly_overlap_mode: cfg.anomaly_overlap_mode,
    anomaly_sensitivity: cfg.anomaly_sensitivity,
    anomaly_rate_window: cfg.anomaly_rate_window,
    anomaly_zscore_window: cfg.anomaly_zscore_window,
    anomaly_persistence_window: cfg.anomaly_persistence_window,
    anomaly_comparison_window_id: cfg.anomaly_comparison_window_id,
    anomaly_comparison_entity_id: cfg.anomaly_comparison_entity_id,
    anomaly_trend_method: cfg.anomaly_trend_method,
    anomaly_trend_window: cfg.anomaly_trend_window,
    anomaly_use_sampled_data: cfg.anomaly_use_sampled_data,
    sample_interval: cfg.sample_interval,
    sample_aggregate: cfg.sample_aggregate,
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
    threshold_value: "0",
    threshold_direction: "above",
    show_delta_analysis: false,
    show_delta_tooltip: false,
    show_delta_lines: false,
    hide_source_series: false,
    stepped_series: false,
    expanded: true,
  };
}

// ── Entity config manipulation ────────────────────────────────────────────

export function toggleMethod(
  config: EntityAnalysisConfig,
  method: string,
  checked: boolean
): EntityAnalysisConfig {
  const methods = checked
    ? [...config.anomaly_methods, method]
    : config.anomaly_methods.filter((m) => m !== method);
  return { ...config, anomaly_methods: methods };
}

// ── Build create/update payload ───────────────────────────────────────────

export function buildConfigPayload(
  config: EntityAnalysisConfig
): Partial<CreateMonitorPayload> {
  const hasSimilarEntity = config.anomaly_methods.includes("similar_entity");
  const backendMethods = hasSimilarEntity
    ? [
        ...new Set(
          config.anomaly_methods.map((method) =>
            method === "similar_entity" ? "comparison_window" : method
          )
        ),
      ]
    : [...config.anomaly_methods];
  const baselineEntityId =
    config.anomaly_comparison_entity_id ?? config.baseline_entity_id;
  const base: Partial<CreateMonitorPayload> = {
    anomaly_methods: backendMethods,
    anomaly_overlap_mode: config.anomaly_overlap_mode,
    anomaly_sensitivity: config.anomaly_sensitivity,
    anomaly_rate_window: config.anomaly_rate_window,
    anomaly_zscore_window: config.anomaly_zscore_window,
    anomaly_persistence_window: config.anomaly_persistence_window,
    anomaly_trend_method: config.anomaly_trend_method || "rolling_average",
    anomaly_trend_window: config.anomaly_trend_window || "24h",
  };
  if (config.sample_interval && config.sample_interval !== "raw") {
    base.sample_interval = config.sample_interval;
    base.sample_aggregate = config.sample_aggregate;
    base.anomaly_use_sampled_data = true;
  }
  if (baselineEntityId) {
    base.baseline_entity_id = baselineEntityId;
    base.baseline_time_offset_hours = config.baseline_time_offset_hours;
  }
  return base;
}

// ── Validation ────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateStep1(entityIds: string[]): ValidationResult {
  if (entityIds.length === 0) {
    return { valid: false, error: "Select at least one entity." };
  }
  return { valid: true };
}

export function validateStep2(
  entityIds: string[],
  getConfig: (id: string) => EntityAnalysisConfig
): ValidationResult {
  const anyEmpty = entityIds.some(
    (id) => getConfig(id).anomaly_methods.length === 0
  );
  if (anyEmpty) {
    return {
      valid: false,
      error: "Each entity needs at least one detection method.",
    };
  }
  const anyMissingComparisonEntity = entityIds.some((id) => {
    const cfg = getConfig(id);
    return (
      cfg.anomaly_methods.includes("similar_entity") &&
      !cfg.anomaly_comparison_entity_id
    );
  });
  if (anyMissingComparisonEntity) {
    return {
      valid: false,
      error: "Select a comparison entity for the Similar entity method.",
    };
  }
  return { valid: true };
}

// ── Auto-populate name ────────────────────────────────────────────────────

export function autoPopulateMonitorName(
  currentName: string,
  entityIds: string[]
): string {
  if (currentName) return currentName;
  const firstId = entityIds[0] ?? "";
  const baseName = firstId.split(".").pop() ?? firstId;
  return entityIds.length > 1 ? "Anomaly monitor" : `${baseName} anomalies`;
}

// ── Overlap mode options ──────────────────────────────────────────────────

export interface OverlapOption {
  value: string;
  label: string;
}

export function buildOverlapOptions(entityCount: number): OverlapOption[] {
  const options: OverlapOption[] = [
    { value: "all", label: "All sensors" },
    { value: "any", label: "Any sensor" },
  ];
  for (let n = 2; n < entityCount; n++) {
    options.push({ value: `any_${n}`, label: `Any ${n} sensors` });
  }
  return options;
}
