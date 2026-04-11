import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./color-swatch.styles";

export class ColorSwatch extends LitElement {
  @property({ type: String }) accessor color: string = "#ff9800";

  @property({ type: String }) accessor label: string = "";

  static styles = styles;

  _onInput(e: Event) {
    const newColor = (e.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent("dp-color-change", {
        detail: { color: newColor },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="swatch-wrap">
        ${this.label ? html`<span class="label">${this.label}</span>` : ""}
        <button class="swatch-btn" type="button">
          <input type="color" .value=${this.color} @input=${this._onInput} />
          <span
            class="swatch-inner"
            style="background-color: ${this.color}"
          ></span>
        </button>
      </div>
    `;
  }
}
customElements.define("color-swatch", ColorSwatch);
