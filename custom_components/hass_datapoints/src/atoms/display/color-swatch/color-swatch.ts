import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./color-swatch.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Compact color swatch button backed by a native color `<input>`.
 * @fires dp-change - `{ type: "color", color: string }`
 */
export class ColorSwatch extends LitElement {
  /** Current color as a CSS hex string (e.g. `"#ff9800"`). */
  @property({ type: String }) accessor color: string = "#ff9800";

  /** Optional label rendered above the swatch button. */
  @property({ type: String }) accessor label: string = "";

  static styles = styles;

  _onInput(e: Event) {
    dispatchChange(this, {
      type: "color",
      color: (e.target as HTMLInputElement).value,
    });
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
