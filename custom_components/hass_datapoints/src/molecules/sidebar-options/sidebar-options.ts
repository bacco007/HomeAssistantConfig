import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./sidebar-options.styles";
import "./sections/sidebar-datapoints-section";
import "./sections/sidebar-datapoint-display-section";
import "./sections/sidebar-analysis-section";
import "./sections/sidebar-chart-display-section";

export class SidebarOptions extends LitElement {
  @property({ type: String, attribute: "datapoint-scope" })
  accessor datapointScope: string = "linked";

  @property({ type: Boolean, attribute: "show-icons" })
  accessor showIcons: boolean = true;

  @property({ type: Boolean, attribute: "show-lines" })
  accessor showLines: boolean = true;

  @property({ type: Boolean, attribute: "show-tooltips" })
  accessor showTooltips: boolean = true;

  @property({ type: Boolean, attribute: "show-hover-guides" })
  accessor showHoverGuides: boolean = false;

  @property({ type: Boolean, attribute: "show-correlated-anomalies" })
  accessor showCorrelatedAnomalies: boolean = false;

  @property({ type: Boolean, attribute: "show-data-gaps" })
  accessor showDataGaps: boolean = true;

  @property({ type: String, attribute: "data-gap-threshold" })
  accessor dataGapThreshold: string = "2h";

  @property({ type: String, attribute: "y-axis-mode" })
  accessor yAxisMode: string = "combined";

  @property({ type: String, attribute: "hover-snap-mode" })
  accessor hoverSnapMode: string = "follow_series";

  @property({ type: String, attribute: "anomaly-overlap-mode" })
  accessor anomalyOverlapMode: string = "all";

  @property({ type: Boolean, attribute: false })
  accessor anyAnomaliesEnabled: boolean = false;

  @state() accessor targetsOpen: boolean = true;

  @property({ type: Boolean, attribute: "datapoints-open" })
  accessor datapointsOpen: boolean = true;

  @property({ type: Boolean, attribute: "analysis-open" })
  accessor analysisOpen: boolean = true;

  @property({ type: Boolean, attribute: "chart-open" })
  accessor chartOpen: boolean = true;

  static styles = styles;

  private _onTargetsToggle(e: CustomEvent) {
    this.targetsOpen = e.detail.open;
    this._emitAccordionChange();
  }

  private _onDatapointsToggle(e: CustomEvent) {
    this.datapointsOpen = e.detail.open;
    this._emitAccordionChange();
  }

  private _onAnalysisToggle(e: CustomEvent) {
    this.analysisOpen = e.detail.open;
    this._emitAccordionChange();
  }

  private _onChartToggle(e: CustomEvent) {
    this.chartOpen = e.detail.open;
    this._emitAccordionChange();
  }

  private _emitAccordionChange() {
    this.dispatchEvent(
      new CustomEvent("dp-accordion-change", {
        detail: {
          targetsOpen: this.targetsOpen,
          datapointsOpen: this.datapointsOpen,
          analysisOpen: this.analysisOpen,
          chartOpen: this.chartOpen,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="sidebar-options-card">
        <sidebar-datapoints-section
          .datapointScope=${this.datapointScope}
          collapsible
          .open=${this.targetsOpen}
          @dp-section-toggle=${this._onTargetsToggle}
        ></sidebar-datapoints-section>
        <sidebar-datapoint-display-section
          .showIcons=${this.showIcons}
          .showLines=${this.showLines}
          collapsible
          .open=${this.datapointsOpen}
          @dp-section-toggle=${this._onDatapointsToggle}
        ></sidebar-datapoint-display-section>
        <sidebar-analysis-section
          .anomalyOverlapMode=${this.anomalyOverlapMode}
          .showCorrelatedAnomalies=${this.showCorrelatedAnomalies}
          .anyAnomaliesEnabled=${this.anyAnomaliesEnabled}
          collapsible
          .open=${this.analysisOpen}
          @dp-section-toggle=${this._onAnalysisToggle}
        ></sidebar-analysis-section>
        <sidebar-chart-display-section
          .showTooltips=${this.showTooltips}
          .showHoverGuides=${this.showHoverGuides}
          .showDataGaps=${this.showDataGaps}
          .dataGapThreshold=${this.dataGapThreshold}
          .yAxisMode=${this.yAxisMode}
          .hoverSnapMode=${this.hoverSnapMode}
          collapsible
          .open=${this.chartOpen}
          @dp-section-toggle=${this._onChartToggle}
        ></sidebar-chart-display-section>
      </div>
    `;
  }
}

customElements.define("sidebar-options", SidebarOptions);
