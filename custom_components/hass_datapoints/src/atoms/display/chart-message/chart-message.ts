import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./chart-message.styles";

export class ChartMessage extends LitElement {
  @property({ type: String }) accessor message: string = "";

  static styles = styles;

  render() {
    return html`
      <div class="message ${this.message ? "visible" : ""}">
        ${this.message}
      </div>
    `;
  }
}
customElements.define("chart-message", ChartMessage);
