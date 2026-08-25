import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { AnalysisGroupMixin } from "../analysis-group-shared/analysis-group.mixin";
import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-threshold-group.styles";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";
import "@/atoms/form/number-input/number-input";

/**
 * @fires dp-group-analysis-change - `{ entityId, key: "show_threshold_analysis" | "threshold_value" | "threshold_comparison" | "threshold_shade_direction", value }` — analysis field changed
 */
@localized()
export class AnalysisThresholdGroup extends AnalysisGroupMixin(LitElement) {
  @property({ type: String }) accessor unit: string = "";

  static styles = [sharedStyles, styles];

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_threshold_analysis", e.detail.checked);
  }

  render() {
    const a = this.analysis;
    return html`
      <analysis-group
        .label=${msg("Show threshold analysis")}
        .checked=${a.show_threshold_analysis}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_threshold_shading}
            @change=${(e: Event) =>
              this._onCheckbox("show_threshold_shading", e)}
          />
          <span>${msg("Shade threshold area")}</span>
        </label>
        <label class="field">
          <span class="field-label">${msg("Threshold")}</span>
          <number-input
            .value=${a.threshold_value}
            .placeholder=${msg("Threshold")}
            .suffix=${this.unit}
            step="any"
            @dp-change=${(e: Event) =>
              this._emit(
                "threshold_value",
                (e as CustomEvent<{ value: string }>).detail.value
              )}
          ></number-input>
        </label>
        ${a.show_threshold_shading
          ? html`
              <label class="field">
                <span class="field-label">${msg("Shade area")}</span>
                <inline-select
                  .value=${a.threshold_direction}
                  .options=${this._localizedOptions([
                    { value: "above", label: "Shade above" },
                    { value: "below", label: "Shade below" },
                  ])}
                  @dp-change=${(e: Event) =>
                    this._emit(
                      "threshold_direction",
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

customElements.define("analysis-threshold-group", AnalysisThresholdGroup);
