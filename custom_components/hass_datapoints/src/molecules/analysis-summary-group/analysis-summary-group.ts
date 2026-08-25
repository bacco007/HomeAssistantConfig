import { LitElement, html } from "lit";
import { localized, msg } from "@/lib/i18n/localize";

import { AnalysisGroupMixin } from "../analysis-group-shared/analysis-group.mixin";
import { sharedStyles } from "../analysis-group-shared/analysis-group-shared.styles";
import { styles } from "./analysis-summary-group.styles";
import "@/atoms/analysis/analysis-group/analysis-group";

/**
 * @fires dp-group-analysis-change - `{ entityId, key: "show_summary_stats" | "show_summary_stats_shading", value }` — analysis field changed
 */
@localized()
export class AnalysisSummaryGroup extends AnalysisGroupMixin(LitElement) {
  static styles = [sharedStyles, styles];

  private _onGroupChange(e: CustomEvent) {
    this._emit("show_summary_stats", e.detail.checked);
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
