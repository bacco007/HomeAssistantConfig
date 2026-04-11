import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./collapsed-options-menu.styles";
import "../sidebar-options/sections/sidebar-datapoints-section";
import "../sidebar-options/sections/sidebar-datapoint-display-section";
import "../sidebar-options/sections/sidebar-analysis-section";
import "../sidebar-options/sections/sidebar-chart-display-section";

const SECTIONS = [
  { key: "datapoints", label: "Datapoints" },
  { key: "datapoint-display", label: "Datapoint Display" },
  { key: "analysis", label: "Analysis" },
  { key: "chart-display", label: "Chart Display" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

/**
 * `collapsed-options-menu` renders a two-panel nested options menu for use
 * in the collapsed sidebar. Level 1 shows section group names; hovering or
 * clicking a name opens Level 2 to the right with that section's controls.
 *
 * All option-change events (`dp-scope-change`, `dp-display-change`,
 * `dp-analysis-change`) bubble out via `composed: true` from the section
 * children — no re-firing needed.
 */
export class CollapsedOptionsMenu extends LitElement {
  @property({ type: String }) accessor datapointScope: string = "linked";

  @property({ type: Boolean }) accessor showIcons: boolean = true;

  @property({ type: Boolean }) accessor showLines: boolean = true;

  @property({ type: Boolean }) accessor showTooltips: boolean = true;

  @property({ type: Boolean }) accessor showHoverGuides: boolean = false;

  @property({ type: Boolean }) accessor showCorrelatedAnomalies: boolean =
    false;

  @property({ type: Boolean }) accessor showDataGaps: boolean = true;

  @property({ type: String }) accessor dataGapThreshold: string = "2h";

  @property({ type: String }) accessor yAxisMode: string = "combined";

  @property({ type: String }) accessor hoverSnapMode: string = "follow_series";

  @property({ type: String }) accessor anomalyOverlapMode: string = "all";

  @property({ type: Boolean }) accessor anyAnomaliesEnabled: boolean = false;

  @state() accessor activeSection: Nullable<SectionKey> = null;

  private _closeTimer: Nullable<ReturnType<typeof setTimeout>> = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  private _activateSection(key: SectionKey) {
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
    this.activeSection = key;
  }

  private _scheduleClose() {
    if (this._closeTimer !== null) clearTimeout(this._closeTimer);
    this._closeTimer = setTimeout(() => {
      this.activeSection = null;
      this._closeTimer = null;
    }, 200);
  }

  private _cancelClose() {
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  private _renderSection() {
    switch (this.activeSection) {
      case "datapoints":
        return html`
          <sidebar-datapoints-section
            .datapointScope=${this.datapointScope}
            .open=${true}
          ></sidebar-datapoints-section>
        `;
      case "datapoint-display":
        return html`
          <sidebar-datapoint-display-section
            .showIcons=${this.showIcons}
            .showLines=${this.showLines}
            .open=${true}
          ></sidebar-datapoint-display-section>
        `;
      case "analysis":
        return html`
          <sidebar-analysis-section
            .anomalyOverlapMode=${this.anomalyOverlapMode}
            .anyAnomaliesEnabled=${this.anyAnomaliesEnabled}
            .open=${true}
          ></sidebar-analysis-section>
        `;
      case "chart-display":
        return html`
          <sidebar-chart-display-section
            .showTooltips=${this.showTooltips}
            .showHoverGuides=${this.showHoverGuides}
            .showCorrelatedAnomalies=${this.showCorrelatedAnomalies}
            .showDataGaps=${this.showDataGaps}
            .dataGapThreshold=${this.dataGapThreshold}
            .yAxisMode=${this.yAxisMode}
            .hoverSnapMode=${this.hoverSnapMode}
            .open=${true}
          ></sidebar-chart-display-section>
        `;
      default:
        return nothing;
    }
  }

  render() {
    return html`
      <div class="nested-menu">
        <div class="menu-level1" @mouseleave=${this._scheduleClose}>
          ${SECTIONS.map(
            (s) => html`
              <button
                type="button"
                class="menu-item ${this.activeSection === s.key
                  ? "is-active"
                  : ""}"
                @mouseenter=${() => this._activateSection(s.key)}
                @click=${() => this._activateSection(s.key)}
              >
                <span class="menu-item-label">${s.label}</span>
                <ha-icon
                  class="menu-item-chevron"
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>
            `
          )}
        </div>
        ${this.activeSection
          ? html`
              <div
                class="menu-level2"
                @mouseenter=${this._cancelClose}
                @mouseleave=${this._scheduleClose}
              >
                ${this._renderSection()}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  static styles = styles;
}

customElements.define("collapsed-options-menu", CollapsedOptionsMenu);

declare global {
  interface HTMLElementTagNameMap {
    "collapsed-options-menu": CollapsedOptionsMenu;
  }
}
