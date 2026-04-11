import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./inline-select.styles";
import type { SelectOption } from "@/lib/types";

export class InlineSelect extends LitElement {
  @property({ type: String }) accessor value: string = "";

  @property({ type: Array }) accessor options: SelectOption[] = [];

  @property({ type: Boolean }) accessor disabled: boolean = false;

  static styles = styles;

  private _onChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    this.dispatchEvent(
      new CustomEvent("dp-select-change", {
        detail: { value: target.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <select
        .value=${this.value}
        ?disabled=${this.disabled}
        @change=${this._onChange}
      >
        ${this.options.map(
          (opt) => html`
            <option
              value=${opt.value}
              ?selected=${opt.value === this.value}
              ?disabled=${opt.disabled === true}
            >
              ${opt.label}
            </option>
          `
        )}
      </select>
    `;
  }
}

customElements.define("inline-select", InlineSelect);
