import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./inline-select.styles";
import { dispatchChange } from "@/lib/events";
import type { SelectOption } from "@/lib/types";

/**
 * Compact native `<select>` for use inside analysis groups and sidebar sections.
 * @fires dp-change - `{ type: "select", value: string }`
 */
export class InlineSelect extends LitElement {
  /** Currently selected value. Must match one of the option values. */
  @property({ type: String }) accessor value: string = "";

  /** Available options; supports the `disabled` flag per option. */
  @property({ type: Array }) accessor options: SelectOption[] = [];

  /** When true the select is rendered but non-interactive. */
  @property({ type: Boolean }) accessor disabled: boolean = false;

  static styles = styles;

  private _onChange(e: Event) {
    dispatchChange(this, {
      type: "select",
      value: (e.target as HTMLSelectElement).value,
    });
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
