import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./sidebar-analysis-section.styles";
import "@/atoms/display/sidebar-options-section/sidebar-options-section";
import "@/atoms/form/checkbox-list/checkbox-list";
import "@/atoms/form/radio-group/radio-group";

export const ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS = [
  { value: "all", label: "Show all anomalies" },
  { value: "only", label: "Overlaps only" },
];

@localized()
export class SidebarAnalysisSection extends LitElement {
  @property({ type: String, attribute: "anomaly-overlap-mode" })
  accessor anomalyOverlapMode: string = "all";

  @property({ type: Boolean, attribute: "show-correlated-anomalies" })
  accessor showCorrelatedAnomalies: boolean = false;

  /** True when at least one target has "Show anomalies" enabled. */
  @property({ type: Boolean, attribute: false })
  accessor anyAnomaliesEnabled: boolean = false;

  @property({ type: Boolean }) accessor collapsible: boolean = false;

  @property({ type: Boolean }) accessor open: boolean = true;

  static styles = styles;

  private _localizedOptions(
    options: Array<{ value: string; label: string }>
  ): Array<{ value: string; label: string }> {
    return options.map((opt) => ({
      ...opt,
      label: msg(opt.label),
    }));
  }

  private _emitAnalysis(kind: string, value: boolean | string) {
    this.dispatchEvent(
      new CustomEvent("dp-analysis-change", {
        detail: { kind, value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onAnomalyOverlapModeChange(e: CustomEvent) {
    this._emitAnalysis("anomaly_overlap_mode", e.detail.value);
  }

  private _onCheckboxChange(e: CustomEvent) {
    const { name, checked } = e.detail;
    this.dispatchEvent(
      new CustomEvent("dp-display-change", {
        detail: { kind: name, value: checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <sidebar-options-section
        .title=${msg("Analysis")}
        .subtitle=${msg(
          "Configure how anomalies and overlapping detections are displayed."
        )}
        .collapsible=${this.collapsible}
        .open=${this.open}
      >
        ${this.anyAnomaliesEnabled
          ? html`
              <checkbox-list
                .items=${[
                  {
                    name: "correlated_anomalies",
                    label: msg("Highlight correlated anomalies"),
                    checked: this.showCorrelatedAnomalies,
                  },
                ]}
                @dp-item-change=${this._onCheckboxChange}
              ></checkbox-list>
              <radio-group
                .name=${"chart-anomaly-overlap-mode"}
                .value=${this.anomalyOverlapMode}
                .options=${this._localizedOptions(
                  ANALYSIS_ANOMALY_OVERLAP_MODE_OPTIONS
                )}
                @dp-radio-change=${this._onAnomalyOverlapModeChange}
              ></radio-group>
            `
          : html`
              <p class="no-anomalies-notice">
                ${msg(
                  "Enable anomaly detection on a target first — open a target's settings and check Show anomalies."
                )}
              </p>
            `}
      </sidebar-options-section>
    `;
  }
}

customElements.define("sidebar-analysis-section", SidebarAnalysisSection);
