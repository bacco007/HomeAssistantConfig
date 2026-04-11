import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-delta-group.styles";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";

@localized()
export class AnalysisDeltaGroup extends LitElement {
  @property({ type: Object }) accessor analysis: NormalizedAnalysis =
    {} as NormalizedAnalysis;

  @property({ type: String, attribute: "entity-id" })
  accessor entityId: string = "";

  @property({ type: Boolean, attribute: "can-show-delta-analysis" })
  accessor canShowDeltaAnalysis: boolean = false;

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
    this._emit("show_delta_analysis", e.detail.checked);
  }

  private _onCheckbox(key: string, e: Event) {
    this._emit(key, (e.target as HTMLInputElement).checked);
  }

  render() {
    const a = this.analysis;
    const isOpen = a.show_delta_analysis && this.canShowDeltaAnalysis;

    return html`
      <analysis-group
        .label=${msg("Show delta vs selected date window")}
        .checked=${isOpen}
        .disabled=${!this.canShowDeltaAnalysis}
        .alignTop=${true}
        @dp-group-change=${this._onGroupChange}
      >
        ${!this.canShowDeltaAnalysis
          ? html`
              <span slot="hint"
                ><br /><span class="help-text"
                  >${msg(
                    "Select a date window tab to enable delta analysis."
                  )}</span
                ></span
              >
            `
          : nothing}
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_delta_tooltip}
            @change=${(e: Event) => this._onCheckbox("show_delta_tooltip", e)}
          />
          <span>${msg("Show delta in tooltip")}</span>
        </label>
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_delta_lines}
            @change=${(e: Event) => this._onCheckbox("show_delta_lines", e)}
          />
          <span>${msg("Show delta lines")}</span>
        </label>
      </analysis-group>
    `;
  }
}

customElements.define("analysis-delta-group", AnalysisDeltaGroup);
