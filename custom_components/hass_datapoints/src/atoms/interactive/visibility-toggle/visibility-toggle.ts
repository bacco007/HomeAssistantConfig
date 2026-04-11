import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./visibility-toggle.styles";

export class VisibilityToggle extends LitElement {
  @property({ type: Boolean }) accessor pressed: boolean = true;

  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor icon: string = "mdi:eye";

  static styles = styles;

  _onClick() {
    this.dispatchEvent(
      new CustomEvent("dp-visibility-change", {
        detail: { pressed: !this.pressed },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button
        type="button"
        aria-pressed="${this.pressed}"
        title="${this.pressed ? "Hide" : "Show"} ${this.label}"
        @click=${this._onClick}
      >
        ${this.label}
      </button>
    `;
  }
}
customElements.define("visibility-toggle", VisibilityToggle);
