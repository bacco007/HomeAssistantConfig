import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./date-time-input.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Native `datetime-local` input with an optional label.
 * @fires dp-change - `{ type: "datetime", value: string }` — ISO datetime string
 */
export class DateTimeInput extends LitElement {
  /** Current value as an ISO-format datetime string (compatible with `datetime-local`). */
  @property({ type: String }) accessor value: string = "";

  /** Optional label rendered above the input. */
  @property({ type: String }) accessor label: string = "";

  static styles = styles;

  _onChange(e: Event) {
    dispatchChange(this, {
      type: "datetime",
      value: (e.target as HTMLInputElement).value,
    });
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
