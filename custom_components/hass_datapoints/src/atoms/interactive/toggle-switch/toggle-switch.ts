import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./toggle-switch.styles";

export class ToggleSwitch extends LitElement {
  @property({ type: Boolean }) accessor checked: boolean = false;

  @property({ type: String }) accessor label: string = "";

  @property({ type: String, attribute: "entity-id" }) accessor entityId:
    | string
    | undefined = undefined;

  static styles = styles;

  _onChange() {
    this.dispatchEvent(
      new CustomEvent("dp-toggle-change", {
        detail: { checked: !this.checked, entityId: this.entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <label>
        <input
          type="checkbox"
          .checked=${this.checked}
          @change=${this._onChange}
        />
        <div class="track ${this.checked ? "on" : ""}">
          <div class="thumb"></div>
        </div>
        ${this.label}
      </label>
    `;
  }
}
customElements.define("toggle-switch", ToggleSwitch);
