import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./color-picker-field.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Native color `<input>` with an optional HA entity icon overlay.
 * @fires dp-change - `{ type: "color", color: string }`
 */
export class ColorPickerField extends LitElement {
  /** Current color as a CSS hex string (e.g. `"#ff9800"`). */
  @property({ type: String }) accessor color: string = "#ff9800";

  /** When set, renders the entity's `ha-state-icon` over the color swatch. */
  @property({ type: String, attribute: "entity-id" }) accessor entityId:
    | string
    | undefined = undefined;

  static styles = styles;

  _onInput(e: Event) {
    dispatchChange(this, {
      type: "color",
      color: (e.target as HTMLInputElement).value,
    });
  }

  render() {
    return html`
      <div class="color-field" style="background-color: ${this.color}">
        <input type="color" .value=${this.color} @input=${this._onInput} />
        ${this.entityId
          ? html`
              <div class="icon-overlay">
                <ha-state-icon .entityId=${this.entityId}></ha-state-icon>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
customElements.define("color-picker-field", ColorPickerField);
