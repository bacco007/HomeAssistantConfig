import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./radio-group.styles";
import { dispatchChange } from "@/lib/events";
import type { SelectOption } from "@/lib/types";

/**
 * Group of radio buttons rendered from an options array.
 * @fires dp-change - `{ type: "radio", value: string }`
 */
export class RadioGroup extends LitElement {
  /** The `name` attribute shared by all radio inputs in the group. */
  @property({ type: String }) accessor name: string = "";

  /** The currently selected value. Must match one of the option values. */
  @property({ type: String }) accessor value: string = "";

  /** Options to render as radio buttons. */
  @property({ type: Array }) accessor options: SelectOption[] = [];

  static styles = styles;

  _onChange(e: Event) {
    dispatchChange(this, {
      type: "radio",
      value: (e.target as HTMLInputElement).value,
    });
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
