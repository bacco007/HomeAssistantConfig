import { LitElement, html, nothing } from "lit";
import { localized, msg } from "@/lib/i18n/localize";

import { AnalysisGroupMixin } from "../analysis-group-shared/analysis-group.mixin";
import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-trend-group.styles";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";

export const ANALYSIS_TREND_METHOD_OPTIONS = [
  { value: "rolling_average", label: "Rolling average" },
  { value: "linear_trend", label: "Linear trend" },
  { value: "ema", label: "Exponential moving average" },
  { value: "polynomial_trend", label: "Polynomial trend" },
  { value: "lowess", label: "LOWESS smooth" },
];

export const ANALYSIS_TREND_WINDOW_OPTIONS = [
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "14d", label: "14 days" },
  { value: "21d", label: "21 days" },
  { value: "28d", label: "28 days" },
];

/**
 * @fires dp-group-analysis-change - `{ entityId, key: "show_trend_analysis" | "trend_method" | "trend_window" | "trend_polynomial_degree", value }` — analysis field changed
 */
@localized()
export class AnalysisTrendGroup extends AnalysisGroupMixin(LitElement) {
  static styles = [sharedStyles, styles];

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_trend_lines", e.detail.checked);
  }

  render() {
    const a = this.analysis;
    return html`
      <analysis-group
        .label=${msg("Show trend lines")}
        .checked=${a.show_trend_lines}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_trend_crosshairs}
            @change=${(e: Event) =>
              this._onCheckbox("show_trend_crosshairs", e)}
          />
          <span>${msg("Show trend crosshairs")}</span>
        </label>
        <label class="field">
          <span class="field-label">${msg("Trend method")}</span>
          <inline-select
            .value=${a.trend_method}
            .options=${this._localizedOptions(ANALYSIS_TREND_METHOD_OPTIONS)}
            @dp-change=${(e: Event) =>
              this._emit(
                "trend_method",
                (e as CustomEvent<{ value: string }>).detail.value
              )}
          ></inline-select>
        </label>
        ${["rolling_average", "ema", "lowess"].includes(a.trend_method)
          ? html`
              <label class="field">
                <span class="field-label">${msg("Trend window")}</span>
                <inline-select
                  .value=${a.trend_window}
                  .options=${this._localizedOptions(
                    ANALYSIS_TREND_WINDOW_OPTIONS
                  )}
                  @dp-change=${(e: Event) =>
                    this._emit(
                      "trend_window",
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

customElements.define("analysis-trend-group", AnalysisTrendGroup);
