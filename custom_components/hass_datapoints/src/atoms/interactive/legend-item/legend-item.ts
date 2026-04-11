import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./legend-item.styles";

export class LegendItem extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor color: string = "#888";

  @property({ type: String }) accessor unit: string = "";

  @property({ type: Boolean }) accessor pressed: boolean = true;

  @property({ type: Number }) accessor opacity: number = 1;

  static styles = styles;

  _onClick() {
    this.dispatchEvent(
      new CustomEvent("dp-legend-toggle", {
        detail: { pressed: !this.pressed },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const displayText = this.unit ? `${this.label} (${this.unit})` : this.label;
    return html`
      <button
        type="button"
        aria-pressed="${this.pressed}"
        title="${this.pressed ? "Hide" : "Show"} ${this.label}"
        @click=${this._onClick}
      >
        <div
          class="legend-line"
          style="background-color: ${this.color}; opacity: ${this.opacity}"
        ></div>
        ${displayText}
      </button>
    `;
  }
}
customElements.define("legend-item", LegendItem);
