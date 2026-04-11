import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./radio-group.styles";
import type { SelectOption } from "@/lib/types";

export class RadioGroup extends LitElement {
  @property({ type: String }) accessor name: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: Array }) accessor options: SelectOption[] = [];

  static styles = styles;

  _onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent("dp-radio-change", {
        detail: { value: input.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <fieldset role="radiogroup">
        <div class="radio-group">
          ${this.options.map(
            (opt) => html`
              <label class="radio-option">
                <input
                  type="radio"
                  name=${this.name}
                  .value=${opt.value}
                  .checked=${this.value === opt.value}
                  @change=${this._onChange}
                />
                ${opt.label}
              </label>
            `
          )}
        </div>
      </fieldset>
    `;
  }
}
customElements.define("radio-group", RadioGroup);
