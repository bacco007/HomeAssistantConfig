import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./number-input.styles";

export class NumberInput extends LitElement {
  @property({ type: String }) accessor value: string = "";

  @property({ type: String }) accessor placeholder: string = "";

  @property({ type: String }) accessor suffix: string = "";

  @property({ type: String }) accessor step: string = "any";

  static styles = styles;

  private _onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent("dp-number-change", {
        detail: { value: target.value },
        bubbles: true,
        composed: true,
      })
    );
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
