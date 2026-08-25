import { LitElement, html } from "lit";
import { localized, msg } from "@/lib/i18n/localize";

import { AnalysisGroupMixin } from "../analysis-group-shared/analysis-group.mixin";
import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-rate-group.styles";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";

export const ANALYSIS_RATE_WINDOW_OPTIONS = [
  { value: "point_to_point", label: "Point to point" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "2h", label: "2 hours" },
  { value: "3h", label: "3 hours" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
];

/**
 * @fires dp-group-analysis-change - `{ entityId, key: "show_rate_analysis" | "rate_window", value }` — analysis field changed
 */
@localized()
export class AnalysisRateGroup extends AnalysisGroupMixin(LitElement) {
  static styles = [sharedStyles, styles];

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_rate_of_change", e.detail.checked);
  }

  render() {
    const a = this.analysis;
    return html`
      <analysis-group
        .label=${msg("Show rate of change")}
        .checked=${a.show_rate_of_change}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_rate_crosshairs}
            @change=${(e: Event) => this._onCheckbox("show_rate_crosshairs", e)}
          />
          <span>${msg("Show rate of change crosshairs")}</span>
        </label>
        <label class="field">
          <span class="field-label">${msg("Rate window")}</span>
          <inline-select
            .value=${a.rate_window}
            .options=${this._localizedOptions(ANALYSIS_RATE_WINDOW_OPTIONS)}
            @dp-change=${(e: Event) =>
              this._emit(
                "rate_window",
                (e as CustomEvent<{ value: string }>).detail.value
              )}
          ></inline-select>
        </label>
      </analysis-group>
    `;
  }
}

customElements.define("analysis-rate-group", AnalysisRateGroup);
