import { CSSResultGroup, html, PropertyValues } from "lit";
import { msg } from "@/lib/i18n/localize";
import { EditorBase } from "@/molecules/editor-base/editor-base";
import { styles } from "./editor.styles";
import type { HassLike } from "@/lib/types";
import {
  buildHistorySeriesRows,
  normalizeHistorySeriesAnalysis,
  normalizeHistorySeriesRows,
  type HistorySeriesAnalysis,
} from "@/lib/domain/history-series";
import {
  normalizeTargetValue,
  resolveEntityIdsFromTarget,
} from "@/lib/domain/target-selection";
import "@/atoms/display/section-heading/section-heading";
import "@/atoms/form/editor-text-field/editor-text-field";
import "@/atoms/form/editor-switch/editor-switch";
import "@/molecules/analysis-sample-group/analysis-sample-group";
import "@/molecules/analysis-trend-group/analysis-trend-group";
import "@/molecules/analysis-summary-group/analysis-summary-group";
import "@/molecules/analysis-rate-group/analysis-rate-group";
import "@/molecules/analysis-threshold-group/analysis-threshold-group";
import "@/molecules/analysis-anomaly-group/analysis-anomaly-group";
import "@/molecules/analysis-delta-group/analysis-delta-group";
import "@/molecules/sidebar-options/sections/sidebar-datapoints-section";
import "@/molecules/sidebar-options/sections/sidebar-datapoint-display-section";
import "@/molecules/sidebar-options/sections/sidebar-analysis-section";
import "@/molecules/sidebar-options/sections/sidebar-chart-display-section";

type TargetPickerValue = Record<string, string[]>;
type TargetPickerElement = Element & {
  hass?: Nullable<HassLike>;
  value?: TargetPickerValue;
};

type AnalysisChangeDetail = {
  entityId?: string;
  key?: string;
  value?: unknown;
};

export class HassRecordsHistoryCardEditor extends EditorBase {
  static styles: CSSResultGroup = [EditorBase.styles, styles];

  private _configTarget(): TargetPickerValue {
    if (this._config.target) {
      return (
        (normalizeTargetValue(this._config.target) as TargetPickerValue) ?? {}
      );
    }
    const rowEntityIds = normalizeHistorySeriesRows(
      this._config.series_settings
    ).map((row) => row.entity_id);
    let entityIdValue: unknown;
    if (rowEntityIds.length > 0) {
      entityIdValue = rowEntityIds;
    } else if (
      Array.isArray(this._config.entities) &&
      this._config.entities.length
    ) {
      entityIdValue = this._config.entities;
    } else {
      entityIdValue = this._config.entity;
    }
    return (
      (normalizeTargetValue({
        entity_id: entityIdValue,
      }) as TargetPickerValue) ?? {}
    );
  }

  private _globalAnalysis(): HistorySeriesAnalysis {
    const normalizedRows = normalizeHistorySeriesRows(
      this._config.series_settings
    );
    if (normalizedRows.length > 0) {
      return normalizeHistorySeriesAnalysis(normalizedRows[0].analysis);
    }
    return normalizeHistorySeriesAnalysis({
      show_trend_lines: this._config.show_trend_lines,
      trend_method: this._config.trend_method,
      trend_window: this._config.trend_window,
      show_trend_crosshairs: this._config.show_trend_crosshairs,
      show_summary_stats: this._config.show_summary_stats,
      show_rate_of_change: this._config.show_rate_of_change,
      rate_window: this._config.rate_window,
      show_threshold_analysis: this._config.show_threshold_analysis,
      show_threshold_shading: this._config.show_threshold_shading,
      show_anomalies: this._config.show_anomalies,
      anomaly_overlap_mode:
        this._config.anomaly_overlap_mode ||
        this._config.chart_anomaly_overlap_mode,
      anomaly_sensitivity: this._config.anomaly_sensitivity,
      show_delta_analysis: this._config.show_delta_analysis,
      show_delta_tooltip: this._config.show_delta_tooltip,
      show_delta_lines: this._config.show_delta_lines,
      hide_source_series: this._config.hide_delta_source_series,
      stepped_series: this._config.stepped_series,
    });
  }

  private _syncTargetPicker(): void {
    const tp = this.shadowRoot?.querySelector(
      "#target-picker"
    ) as Nullable<TargetPickerElement>;
    if (!tp) {
      return;
    }
    if (this.hass) {
      tp.hass = this.hass;
    }
    tp.value = this._configTarget();
  }

  private _emitConfig(cfg: RecordWithUnknownValues): void {
    this._config = cfg;
    this._fire(cfg);
  }

  private _targetEntityIds(target: TargetPickerValue | undefined): string[] {
    return resolveEntityIdsFromTarget(this.hass, target);
  }

  private _compatConfigFromAnalysis(
    analysis: HistorySeriesAnalysis
  ): RecordWithUnknownValues {
    return {
      show_trend_lines: analysis.show_trend_lines,
      trend_method: analysis.trend_method,
      trend_window: analysis.trend_window,
      show_trend_crosshairs: analysis.show_trend_crosshairs,
      show_summary_stats: analysis.show_summary_stats,
      show_rate_of_change: analysis.show_rate_of_change,
      rate_window: analysis.rate_window,
      show_threshold_analysis: analysis.show_threshold_analysis,
      show_threshold_shading: analysis.show_threshold_shading,
      show_anomalies: analysis.show_anomalies,
      anomaly_overlap_mode: analysis.anomaly_overlap_mode,
      anomaly_sensitivity: analysis.anomaly_sensitivity,
      show_delta_analysis: analysis.show_delta_analysis,
      show_delta_tooltip: analysis.show_delta_tooltip,
      show_delta_lines: analysis.show_delta_lines,
      hide_delta_source_series: analysis.hide_source_series,
      stepped_series: analysis.stepped_series,
    };
  }

  private _updateTargetAndRows(target: TargetPickerValue | undefined): void {
    const currentRows = normalizeHistorySeriesRows(
      this._config.series_settings
    );
    const analysis = this._globalAnalysis();
    const entityIds = this._targetEntityIds(target);
    const rows = buildHistorySeriesRows(entityIds, currentRows).map((row) => ({
      ...row,
      analysis: normalizeHistorySeriesAnalysis(analysis),
    }));
    const cfg: RecordWithUnknownValues = {
      ...this._config,
      ...this._compatConfigFromAnalysis(analysis),
    };
    delete cfg.entity;
    delete cfg.entities;
    if (!target || Object.values(target).every((value) => !value?.length)) {
      delete cfg.target;
    } else {
      cfg.target = target;
    }
    if (rows.length === 0) {
      delete cfg.series_settings;
    } else {
      cfg.series_settings = rows;
    }
    this._emitConfig(cfg);
  }

  private _updateGlobalAnalysis(
    updater: (analysis: HistorySeriesAnalysis) => HistorySeriesAnalysis
  ): void {
    const nextAnalysis = normalizeHistorySeriesAnalysis(
      updater(this._globalAnalysis())
    );
    const target = this._configTarget();
    const currentRows = normalizeHistorySeriesRows(
      this._config.series_settings
    );
    const entityIds = this._targetEntityIds(target);
    const rows = buildHistorySeriesRows(entityIds, currentRows).map((row) => ({
      ...row,
      analysis: nextAnalysis,
    }));
    const cfg: RecordWithUnknownValues = {
      ...this._config,
      ...this._compatConfigFromAnalysis(nextAnalysis),
      target,
    };
    if (rows.length === 0) {
      delete cfg.series_settings;
    } else {
      cfg.series_settings = rows;
    }
    this._emitConfig(cfg);
  }

  private _onTargetChanged = (
    e: CustomEvent<{ value?: TargetPickerValue }>
  ): void => {
    const val = e.detail.value;
    const isEmpty = !val || Object.values(val).every((value) => !value?.length);
    this._updateTargetAndRows(isEmpty ? undefined : val);
  };

  private _onAnalysisChange = (e: CustomEvent<AnalysisChangeDetail>): void => {
    const { key, value } = e.detail || {};
    if (!key) {
      return;
    }
    this._updateGlobalAnalysis((analysis) => {
      if (key.startsWith("anomaly_method_toggle_")) {
        const method = key.slice("anomaly_method_toggle_".length);
        const currentMethods = Array.isArray(analysis.anomaly_methods)
          ? analysis.anomaly_methods
          : [];
        return {
          ...analysis,
          anomaly_methods:
            value === true
              ? [...new Set([...currentMethods, method])]
              : currentMethods.filter((entry) => entry !== method),
        };
      }
      return {
        ...analysis,
        [key]: value,
      };
    });
  };

  private _onScopeChange = (e: CustomEvent<{ value: string }>): void => {
    this._set("datapoint_scope", e.detail.value);
  };

  private _onDisplayChange = (
    e: CustomEvent<{ kind?: string; value?: boolean | string }>
  ): void => {
    const { kind, value } = e.detail || {};
    if (!kind) {
      return;
    }
    if (kind === "icons") {
      this._set("show_event_markers", value === true ? undefined : false);
      return;
    }
    if (kind === "lines") {
      this._set("show_event_lines", value === true ? undefined : false);
      return;
    }
    if (kind === "tooltips") {
      this._set("show_tooltips", value === true ? undefined : false);
      return;
    }
    if (kind === "hover_guides") {
      this._set("emphasize_hover_guides", value === true ? true : undefined);
      return;
    }
    if (kind === "correlated_anomalies") {
      this._set("show_correlated_anomalies", value === true ? true : undefined);
      return;
    }
    if (kind === "data_gaps") {
      this._set("show_data_gaps", value === true ? undefined : false);
      return;
    }
    if (kind === "data_gap_threshold") {
      this._set("data_gap_threshold", value);
      return;
    }
    if (kind === "hover_snap_mode") {
      this._set("hover_snap_mode", value);
      return;
    }
    if (kind === "y_axis_mode") {
      const cfg = { ...this._config };
      if (value === "split") {
        cfg.split_view = true;
        delete cfg.delink_y_axis;
      } else if (value === "unique") {
        delete cfg.split_view;
        cfg.delink_y_axis = true;
      } else {
        delete cfg.split_view;
        delete cfg.delink_y_axis;
      }
      this._emitConfig(cfg);
    }
  };

  private _onChartAnalysisChange = (
    e: CustomEvent<{ kind?: string; value?: boolean | string }>
  ): void => {
    const { kind, value } = e.detail || {};
    if (kind === "anomaly_overlap_mode" && typeof value === "string") {
      this._set("anomaly_overlap_mode", value);
      this._updateGlobalAnalysis((analysis) => ({
        ...analysis,
        anomaly_overlap_mode: value === "only" ? "only" : "all",
      }));
    }
  };

  private _yAxisMode(): string {
    if (this._config.split_view === true) {
      return "split";
    }
    if (this._config.delink_y_axis === true) {
      return "unique";
    }
    return "combined";
  }

  updated(changedProps: PropertyValues<this>): void {
    if (changedProps.has("hass") || changedProps.has("_config")) {
      this._syncTargetPicker();
    }
  }

  render() {
    const c = this._config;
    const analysis = this._globalAnalysis();
    return html`
      <div class="ed">
        <section-heading .text=${msg("General")}></section-heading>
        <editor-text-field
          .label=${msg("Card title (optional)")}
          .value=${c.title || ""}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("title", e.detail.value)}
        ></editor-text-field>
        <editor-text-field
          .label=${msg("Hours to show")}
          type="number"
          .value=${String(c.hours_to_show ?? 24)}
          @dp-field-change=${(e: CustomEvent<{ value: string }>) =>
            this._set("hours_to_show", e.detail.value)}
        ></editor-text-field>

        <section-heading .text=${msg("Targets")}></section-heading>
        <div class="note">
          ${msg(
            "Choose the entities, devices, areas or labels to chart. Analysis settings below are applied to every selected target.",
            {
              id: "Choose the entities, devices, areas or labels to chart. Analysis settings below are applied to every selected target.",
            }
          )}
        </div>
        <ha-selector
          id="target-picker"
          .selector=${{ target: {} }}
          .hass=${this.hass}
          .value=${this._configTarget()}
          @value-changed=${this._onTargetChanged}
          style="display:block;width:100%"
        ></ha-selector>

        <section-heading .text=${msg("Target Analysis")}></section-heading>
        <analysis-sample-group
          entity-id="__all__"
          .analysis=${analysis}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-sample-group>
        <editor-switch
          .label=${msg("Stepped series")}
          .checked=${analysis.stepped_series === true}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._updateGlobalAnalysis((currentAnalysis) => ({
              ...currentAnalysis,
              stepped_series: e.detail.checked,
            }))}
        ></editor-switch>
        <analysis-trend-group
          entity-id="__all__"
          .analysis=${analysis}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-trend-group>
        <analysis-summary-group
          entity-id="__all__"
          .analysis=${analysis}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-summary-group>
        <analysis-rate-group
          entity-id="__all__"
          .analysis=${analysis}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-rate-group>
        <analysis-threshold-group
          entity-id="__all__"
          .analysis=${analysis}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-threshold-group>
        <analysis-anomaly-group
          entity-id="__all__"
          .analysis=${analysis}
          .comparisonWindows=${[]}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-anomaly-group>
        <analysis-delta-group
          entity-id="__all__"
          .analysis=${analysis}
          .canShowDeltaAnalysis=${false}
          @dp-group-analysis-change=${this._onAnalysisChange}
        ></analysis-delta-group>

        <section-heading .text=${msg("Chart Options")}></section-heading>
        <sidebar-datapoints-section
          .datapointScope=${String(c.datapoint_scope || "linked")}
          @dp-scope-change=${this._onScopeChange}
        ></sidebar-datapoints-section>
        <sidebar-datapoint-display-section
          .showIcons=${c.show_event_markers !== false}
          .showLines=${c.show_event_lines !== false}
          @dp-display-change=${this._onDisplayChange}
        ></sidebar-datapoint-display-section>
        <sidebar-analysis-section
          .anyAnomaliesEnabled=${true}
          .showCorrelatedAnomalies=${c.show_correlated_anomalies === true}
          .anomalyOverlapMode=${String(
            c.anomaly_overlap_mode || analysis.anomaly_overlap_mode || "all"
          )}
          @dp-display-change=${this._onDisplayChange}
          @dp-analysis-change=${this._onChartAnalysisChange}
        ></sidebar-analysis-section>
        <sidebar-chart-display-section
          .showTooltips=${c.show_tooltips !== false}
          .showHoverGuides=${c.emphasize_hover_guides === true}
          .showDataGaps=${c.show_data_gaps !== false}
          .dataGapThreshold=${String(c.data_gap_threshold || "2h")}
          .yAxisMode=${this._yAxisMode()}
          .hoverSnapMode=${String(c.hover_snap_mode || "follow_series")}
          @dp-display-change=${this._onDisplayChange}
        ></sidebar-chart-display-section>
        <editor-switch
          .label=${msg("Show create datapoint button on chart crosshair")}
          .checked=${c.show_add_annotation_button !== false}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set(
              "show_add_annotation_button",
              e.detail.checked ? undefined : false
            )}
        ></editor-switch>

        <section-heading .text=${msg("Series Display")}></section-heading>
        <editor-switch
          .label=${msg("Hide raw data when analysis is enabled")}
          .checked=${c.hide_raw_data === true}
          @dp-switch-change=${(e: CustomEvent<{ checked: boolean }>) =>
            this._set("hide_raw_data", e.detail.checked ? true : undefined)}
        ></editor-switch>
      </div>
    `;
  }
}
