import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./loading-indicator.styles";

export class LoadingIndicator extends LitElement {
  @property({ type: Boolean, reflect: true }) accessor active: boolean = false;

  static styles = styles;

  render() {
    return html`
      <div class="wrapper ${this.active ? "active" : ""}">
        <div class="spinner"></div>
      </div>
    `;
  }
}
customElements.define("loading-indicator", LoadingIndicator);
