import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./chart-shell.styles";
import "@/atoms/display/loading-indicator/loading-indicator";
import "@/atoms/display/chart-message/chart-message";

export class ChartShell extends LitElement {
  @property({ type: String, attribute: "card-title" })
  accessor cardTitle: string = "";

  @property({ type: Boolean }) accessor loading: boolean = false;

  @property({ type: String }) accessor message: string = "";

  static styles = styles;

  render() {
    return html`
      <ha-card>
        ${this.cardTitle
          ? html`
              <div class="card-header">
                <span class="card-header-title">${this.cardTitle}</span>
                <span class="card-header-action">
                  <slot name="header-action"></slot>
                </span>
              </div>
            `
          : ""}
        <slot name="top"></slot>
        <div class="chart-wrap">
          <loading-indicator .active=${this.loading}></loading-indicator>
          <chart-message .message=${this.message}></chart-message>
          <slot></slot>
        </div>
        <slot name="legend"></slot>
        <slot name="bottom"></slot>
      </ha-card>
    `;
  }
}
customElements.define("chart-shell", ChartShell);
