import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./color-picker-field.styles";

export class ColorPickerField extends LitElement {
  @property({ type: String }) accessor color: string = "#ff9800";

  @property({ type: String, attribute: "entity-id" }) accessor entityId:
    | string
    | undefined = undefined;

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
