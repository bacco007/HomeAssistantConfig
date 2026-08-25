import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./number-input.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Numeric input with optional suffix label.
 * @fires dp-change - `{ type: "number", value: string }` — raw string from the input element
 */
export class NumberInput extends LitElement {
  /** Current numeric value as a string. */
  @property({ type: String }) accessor value: string = "";

  /** Placeholder shown inside the input when empty. */
  @property({ type: String }) accessor placeholder: string = "";

  /** Optional suffix (e.g. unit) rendered after the input. */
  @property({ type: String }) accessor suffix: string = "";

  /** The `step` attribute forwarded to the native `<input type="number">`. */
  @property({ type: String }) accessor step: string = "any";

  static styles = styles;

  private _onInput(e: Event) {
    dispatchChange(this, {
      type: "number",
      value: (e.target as HTMLInputElement).value,
    });
  }

  render() {
    return html`
      <input
        type="number"
        .value=${this.value}
        placeholder=${this.placeholder}
        step=${this.step}
        @input=${this._onInput}
      />
      ${this.suffix
        ? html`<span class="suffix">${this.suffix}</span>`
        : nothing}
    `;
  }
}

customElements.define("number-input", NumberInput);
