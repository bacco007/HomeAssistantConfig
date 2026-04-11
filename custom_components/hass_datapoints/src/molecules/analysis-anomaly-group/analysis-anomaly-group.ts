import type { TemplateResult } from "lit";
import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-anomaly-group.styles";
import { localized, msg } from "@/lib/i18n/localize";
import type {
  ComparisonWindow,
  NormalizedAnalysis,
} from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/analysis/analysis-method-subopts/analysis-method-subopts";
import "@/atoms/form/inline-select/inline-select";
import {
  ANALYSIS_TREND_METHOD_OPTIONS,
  ANALYSIS_TREND_WINDOW_OPTIONS,
} from "@/molecules/analysis-trend-group/analysis-trend-group";

export const ANALYSIS_ANOMALY_SENSITIVITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const ANALYSIS_ANOMALY_METHOD_OPTIONS = [
  {
    value: "trend_residual",
    label: "Trend deviation",
    help: "Flags points that deviate significantly from a fitted trend line. Good for catching gradual drift or sudden jumps away from a steady baseline.",
  },
  {
    value: "rate_of_change",
    label: "Sudden change",
    help: "Flags unusually fast rises or drops compared to the typical rate of change. Best for detecting spikes, crashes, or rapid transitions.",
  },
  {
    value: "iqr",
    label: "Statistical outlier (IQR)",
    help: "Uses the interquartile range to flag values far outside the normal spread of data. Robust against outliers that skew averages.",
  },
  {
    value: "rolling_zscore",
    label: "Rolling Z-score",
    help: "Compares each value to a rolling mean and standard deviation. Catches unusual readings relative to recent context rather than the whole series.",
  },
  {
    value: "persistence",
    label: "Flat-line / stuck value",
    help: "Flags when a sensor reports nearly the same value for an unusually long time. Useful for detecting stuck sensors or frozen readings.",
  },
  {
    value: "comparison_window",
    label: "Comparison window deviation",
    help: "Compares the current period to a reference date window. Highlights differences from an expected historical pattern, such as last week or the same day last year.",
  },
];

export const ANALYSIS_ANOMALY_RATE_WINDOW_OPTIONS = [
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
];

export const ANALYSIS_ANOMALY_ZSCORE_WINDOW_OPTIONS = [
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
];

export const ANALYSIS_ANOMALY_PERSISTENCE_WINDOW_OPTIONS = [
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" },
];

export const ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS = [
  { value: "all", label: "Show all anomalies" },
  { value: "only", label: "Overlaps only" },
];

@localized()
export class AnalysisAnomalyGroup extends LitElement {
  @property({ type: Object }) accessor analysis: NormalizedAnalysis =
    {} as NormalizedAnalysis;

  @property({ type: String, attribute: "entity-id" })
  accessor entityId: string = "";

  @property({ type: Array, attribute: "comparison-windows" })
  accessor comparisonWindows: ComparisonWindow[] = [];

  /** Whether analysis is currently being computed in the worker for this entity. */
  @property({ type: Boolean, attribute: false }) accessor computing: boolean =
    false;

  /** Overall analysis computation progress (0–100) shown in the group header. */
  @property({ type: Number, attribute: false })
  accessor computingProgress: number = 0;

  /** Set of anomaly method names still in-flight in the worker. Each method shows its own spinner. */
  @property({ type: Object, attribute: false })
  accessor computingMethods: Set<string> = new Set();

  static styles = [sharedStyles, styles];

  private _emit(key: string, value: unknown) {
    this.dispatchEvent(
      new CustomEvent("dp-group-analysis-change", {
        detail: { entityId: this.entityId, key, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_anomalies", e.detail.checked);
  }

  private _localizedOptions(
    options: Array<{ value: string; label: string; help?: string }>
  ): Array<{ value: string; label: string; help?: string }> {
    return options.map((option) => ({
      ...option,
      label: msg(option.label),
      help: option.help ? msg(option.help) : undefined,
    }));
  }

  private _renderMethodSubopts(
    opt: { value: string },
    a: NormalizedAnalysis
  ): TemplateResult | typeof nothing {
    if (opt.value === "trend_residual") {
      const storedMethod = a.anomaly_trend_method || "";
      const trendLinesEnabled = a.show_trend_lines === true;
      // When "Same as display trend" is disabled (trend lines off) and the
      // stored value is "" (follow display), fall back to the first real method
      // so the select is never stuck on a disabled option.
      const effectiveMethod =
        !trendLinesEnabled && storedMethod === ""
          ? (ANALYSIS_TREND_METHOD_OPTIONS[0]?.value ?? "rolling_average")
          : storedMethod;
      const methodOptions = [
        {
          value: "",
          label: msg("Same as display trend"),
          disabled: !trendLinesEnabled,
        },
        ...this._localizedOptions(ANALYSIS_TREND_METHOD_OPTIONS),
      ];
      const windowOptions = this._localizedOptions(
        ANALYSIS_TREND_WINDOW_OPTIONS
      );
      const showWindow = ["rolling_average", "ema", "lowess"].includes(
        effectiveMethod
      );
      return html`
        <analysis-method-subopts>
          <label class="field">
            <span class="field-label">${msg("Trend method")}</span>
            <inline-select
              .value=${effectiveMethod}
              .options=${methodOptions}
              @dp-select-change=${(e: Event) =>
                this._emit(
                  "anomaly_trend_method",
                  (e as CustomEvent<{ value: string }>).detail.value
                )}
            ></inline-select>
          </label>
          ${showWindow
            ? html`
                <label class="field">
                  <span class="field-label">${msg("Trend window")}</span>
                  <inline-select
                    .value=${a.anomaly_trend_window}
                    .options=${windowOptions}
                    @dp-select-change=${(e: Event) =>
                      this._emit(
                        "anomaly_trend_window",
                        (e as CustomEvent<{ value: string }>).detail.value
                      )}
                  ></inline-select>
                </label>
              `
            : nothing}
        </analysis-method-subopts>
      `;
    }
    if (opt.value === "rate_of_change") {
      return html`
        <analysis-method-subopts>
          <label class="field">
            <span class="field-label">${msg("Rate window")}</span>
            <inline-select
              .value=${a.anomaly_rate_window}
              .options=${this._localizedOptions(
                ANALYSIS_ANOMALY_RATE_WINDOW_OPTIONS
              )}
              @dp-select-change=${(e: Event) =>
                this._emit(
                  "anomaly_rate_window",
                  (e as CustomEvent<{ value: string }>).detail.value
                )}
            ></inline-select>
          </label>
        </analysis-method-subopts>
      `;
    }
    if (opt.value === "rolling_zscore") {
      return html`
        <analysis-method-subopts>
          <label class="field">
            <span class="field-label">${msg("Rolling window")}</span>
            <inline-select
              .value=${a.anomaly_zscore_window}
              .options=${this._localizedOptions(
                ANALYSIS_ANOMALY_ZSCORE_WINDOW_OPTIONS
              )}
              @dp-select-change=${(e: Event) =>
                this._emit(
                  "anomaly_zscore_window",
                  (e as CustomEvent<{ value: string }>).detail.value
                )}
            ></inline-select>
          </label>
        </analysis-method-subopts>
      `;
    }
    if (opt.value === "persistence") {
      return html`
        <analysis-method-subopts>
          <label class="field">
            <span class="field-label">${msg("Min flat duration")}</span>
            <inline-select
              .value=${a.anomaly_persistence_window}
              .options=${this._localizedOptions(
                ANALYSIS_ANOMALY_PERSISTENCE_WINDOW_OPTIONS
              )}
              @dp-select-change=${(e: Event) =>
                this._emit(
                  "anomaly_persistence_window",
                  (e as CustomEvent<{ value: string }>).detail.value
                )}
            ></inline-select>
          </label>
        </analysis-method-subopts>
      `;
    }
    if (opt.value === "comparison_window") {
      const comparisonOptions = [
        { value: "", label: msg("— select window —") },
        ...this.comparisonWindows.map((win) => ({
          value: win.id,
          label: win.label || win.id,
        })),
      ];
      return html`
        <analysis-method-subopts>
          <label class="field">
            <span class="field-label">${msg("Compare to window")}</span>
            <inline-select
              .value=${a.anomaly_comparison_window_id ?? ""}
              .options=${comparisonOptions}
              @dp-select-change=${(e: Event) =>
                this._emit(
                  "anomaly_comparison_window_id",
                  (e as CustomEvent<{ value: string }>).detail.value
                )}
            ></inline-select>
          </label>
        </analysis-method-subopts>
      `;
    }
    return nothing;
  }

  render() {
    const a = this.analysis;
    const sensitivityOptions = this._localizedOptions(
      ANALYSIS_ANOMALY_SENSITIVITY_OPTIONS
    );
    const overlapOptions = this._localizedOptions(
      ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS
    );
    const methodOptions = this._localizedOptions(
      ANALYSIS_ANOMALY_METHOD_OPTIONS
    );
    return html`
      <analysis-group
        .label=${msg("Show anomalies")}
        .checked=${a.show_anomalies}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="field">
          <span class="field-label">${msg("Sensitivity")}</span>
          <inline-select
            .value=${a.anomaly_sensitivity}
            .options=${sensitivityOptions}
            @dp-select-change=${(e: Event) =>
              this._emit(
                "anomaly_sensitivity",
                (e as CustomEvent<{ value: string }>).detail.value
              )}
          ></inline-select>
        </label>
        ${a.sample_interval && a.sample_interval !== "raw"
          ? html`
              <label class="option">
                <input
                  type="checkbox"
                  .checked=${a.anomaly_use_sampled_data !== false}
                  @change=${(e: Event) =>
                    this._emit(
                      "anomaly_use_sampled_data",
                      (e.target as HTMLInputElement).checked
                    )}
                />
                <span>${msg("Use downsampled data for detection")}</span>
              </label>
            `
          : nothing}
        <div class="method-list">
          ${methodOptions.map((opt) => {
            const isChecked =
              Array.isArray(a.anomaly_methods) &&
              a.anomaly_methods.includes(opt.value);
            const isComputing =
              isChecked && (this.computingMethods?.has(opt.value) ?? false);
            const helpId = `anomaly-help-${opt.value}`;
            return html`
              <div class="method-item">
                <label class="option">
                  <input
                    type="checkbox"
                    .checked=${isChecked}
                    @change=${(e: Event) =>
                      this._emit(
                        `anomaly_method_toggle_${opt.value}`,
                        (e.target as HTMLInputElement).checked
                      )}
                  />
                  <span>${opt.label}</span>
                  ${opt.help
                    ? html`
                        <button
                          id=${helpId}
                          class="method-help"
                          type="button"
                          aria-label=${`${opt.label} explanation`}
                        >
                          ?
                        </button>
                        <ha-tooltip
                          class="method-tooltip"
                          for=${helpId}
                          placement="right"
                          distance="8"
                          hoist
                          style="--ha-tooltip-padding: var(--dp-spacing-md, calc(var(--spacing, 8px) * 1.5));"
                        >
                          ${opt.help}
                        </ha-tooltip>
                      `
                    : nothing}
                  ${isComputing
                    ? html`
                        <span
                          class="method-computing-indicator"
                          aria-label=${msg("Computing…")}
                        >
                          <span class="method-computing-spinner"></span>
                          <span class="method-computing-progress"
                            >${this.computingProgress}%</span
                          >
                        </span>
                      `
                    : nothing}
                </label>
                ${isChecked ? this._renderMethodSubopts(opt, a) : nothing}
              </div>
            `;
          })}
        </div>
        ${Array.isArray(a.anomaly_methods) && a.anomaly_methods.length >= 2
          ? html`
              <label class="field">
                <span class="field-label">${msg("When methods overlap")}</span>
                <inline-select
                  .value=${a.anomaly_overlap_mode}
                  .options=${overlapOptions}
                  @dp-select-change=${(e: Event) =>
                    this._emit(
                      "anomaly_overlap_mode",
                      (e as CustomEvent<{ value: string }>).detail.value
                    )}
                ></inline-select>
              </label>
            `
          : nothing}
      </analysis-group>
    `;
  }
}

customElements.define("analysis-anomaly-group", AnalysisAnomalyGroup);
