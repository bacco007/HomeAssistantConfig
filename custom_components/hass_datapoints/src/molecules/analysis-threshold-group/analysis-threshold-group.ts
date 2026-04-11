import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-threshold-group.styles";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";
import "@/atoms/form/inline-select/inline-select";

@localized()
export class AnalysisThresholdGroup extends LitElement {
  @property({ type: Object }) accessor analysis: NormalizedAnalysis =
    {} as NormalizedAnalysis;

  @property({ type: String, attribute: "entity-id" })
  accessor entityId: string = "";

  @property({ type: String }) accessor unit: string = "";

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
    this._emit("show_threshold_analysis", e.detail.checked);
  }

  private _onCheckbox(key: string, e: Event) {
    this._emit(key, (e.target as HTMLInputElement).checked);
  }

  private _onInput(key: string, e: Event) {
    this._emit(key, (e.target as HTMLInputElement).value);
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
          <div class="toggle-group">
            <input
              class="input"
              type="number"
              step="any"
              inputmode="decimal"
              .value=${a.threshold_value}
              placeholder=${msg("Threshold")}
              @change=${(e: Event) => this._onInput("threshold_value", e)}
            />
            ${this.unit ? html`<span>${this.unit}</span>` : nothing}
          </div>
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
                  @dp-select-change=${(e: Event) =>
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
