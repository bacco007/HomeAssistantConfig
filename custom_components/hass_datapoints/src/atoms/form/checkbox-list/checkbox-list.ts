import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./checkbox-list.styles";

export interface CheckboxItem {
  name: string;
  label: string;
  checked: boolean;
}

export class CheckboxList extends LitElement {
  @property({ type: Array }) accessor items: CheckboxItem[] = [];

  static styles = styles;

  _onChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent("dp-item-change", {
        detail: { name: input.name, checked: input.checked },
        bubbles: true,
        composed: true,
      })
    );
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
