import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./checkbox-list.styles";
import { dispatchChange } from "@/lib/events";

export interface CheckboxItem {
  name: string;
  label: string;
  checked: boolean;
}

/**
 * List of labeled checkboxes driven by an items array.
 * Each checkbox input carries a `name` attribute used as the item identifier.
 * @fires dp-change - `{ type: "item", value: string, checked: boolean }` — `value` is the item's `name`
 */
export class CheckboxList extends LitElement {
  /** Items to render; each must have a unique `name` used as the identifier. */
  @property({ type: Array }) accessor items: CheckboxItem[] = [];

  static styles = styles;

  _onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    dispatchChange(this, {
      type: "item",
      value: input.name,
      checked: input.checked,
    });
  }

  render() {
    return html`
      <div class="checkbox-group">
        ${this.items.map(
          (item) => html`
            <label class="checkbox-option">
              <input
                type="checkbox"
                name=${item.name}
                .checked=${item.checked}
                @change=${this._onChange}
              />
              ${item.label}
            </label>
          `
        )}
      </div>
    `;
  }
}
customElements.define("checkbox-list", CheckboxList);
