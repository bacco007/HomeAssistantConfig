import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./date-time-input.styles";

export class DateTimeInput extends LitElement {
  @property({ type: String }) accessor value: string = "";

  @property({ type: String }) accessor label: string = "";

  static styles = styles;

  _onChange(e: Event) {
    this.dispatchEvent(
      new CustomEvent("dp-datetime-change", {
        detail: { value: (e.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      ${this.label ? html`<label>${this.label}</label>` : ""}
      <input
        type="datetime-local"
        .value=${this.value}
        @change=${this._onChange}
      />
    `;
  }
}
customElements.define("date-time-input", DateTimeInput);
