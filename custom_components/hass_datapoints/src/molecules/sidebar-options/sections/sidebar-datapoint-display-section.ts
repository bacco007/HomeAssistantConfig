import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./sidebar-datapoint-display-section.styles";
import "@/atoms/display/sidebar-options-section/sidebar-options-section";
import "@/atoms/form/checkbox-list/checkbox-list";

@localized()
export class SidebarDatapointDisplaySection extends LitElement {
  @property({ type: Boolean, attribute: "show-icons" })
  accessor showIcons: boolean = true;

  @property({ type: Boolean, attribute: "show-lines" })
  accessor showLines: boolean = true;

  @property({ type: Boolean }) accessor collapsible: boolean = false;

  @property({ type: Boolean }) accessor open: boolean = true;

  static styles = styles;

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
        .title=${msg("Datapoint Display")}
        .subtitle=${msg(
          "Control how annotation datapoints are rendered on the chart."
        )}
        .collapsible=${this.collapsible}
        .open=${this.open}
      >
        <checkbox-list
          .items=${[
            {
              name: "icons",
              label: msg("Show datapoint icons"),
              checked: this.showIcons,
            },
            {
              name: "lines",
              label: msg("Show dotted lines"),
              checked: this.showLines,
            },
          ]}
          @dp-item-change=${this._onCheckboxChange}
        ></checkbox-list>
      </sidebar-options-section>
    `;
  }
}

customElements.define(
  "sidebar-datapoint-display-section",
  SidebarDatapointDisplaySection
);
