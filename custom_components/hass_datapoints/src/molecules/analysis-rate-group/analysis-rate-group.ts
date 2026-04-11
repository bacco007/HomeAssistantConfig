import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-rate-group.styles";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";

export const ANALYSIS_RATE_WINDOW_OPTIONS = [
  { value: "point_to_point", label: "Point to point" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
];

@localized()
export class AnalysisRateGroup extends LitElement {
  @property({ type: Object }) accessor analysis: NormalizedAnalysis =
    {} as NormalizedAnalysis;

  @property({ type: String, attribute: "entity-id" })
  accessor entityId: string = "";

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

  private _localizedOptions(
    options: Array<{ value: string; label: string }>
  ): Array<{ value: string; label: string }> {
    return options.map((opt) => ({
      ...opt,
      label: msg(opt.label),
    }));
  }

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_rate_of_change", e.detail.checked);
  }

  private _onCheckbox(key: string, e: Event) {
    this._emit(key, (e.target as HTMLInputElement).checked);
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
            @dp-select-change=${(e: Event) =>
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
