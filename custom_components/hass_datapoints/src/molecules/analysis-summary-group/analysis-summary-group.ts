import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-summary-group.styles";
import type { NormalizedAnalysis } from "@/molecules/target-row/types";
import "@/atoms/analysis/analysis-group/analysis-group";

@localized()
export class AnalysisSummaryGroup extends LitElement {
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

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_summary_stats", e.detail.checked);
  }

  private _onCheckbox(key: string, e: Event) {
    this._emit(key, (e.target as HTMLInputElement).checked);
  }

  render() {
    const a = this.analysis;
    return html`
      <analysis-group
        .label=${msg("Show min / max / mean")}
        .checked=${a.show_summary_stats}
        @dp-group-change=${this._onGroupChange}
      >
        <label class="option">
          <input
            type="checkbox"
            .checked=${a.show_summary_stats_shading}
            @change=${(e: Event) =>
              this._onCheckbox("show_summary_stats_shading", e)}
          />
          <span>${msg("Show range shading")}</span>
        </label>
      </analysis-group>
    `;
  }
}

customElements.define("analysis-summary-group", AnalysisSummaryGroup);
