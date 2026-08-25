import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-select.styles";
import { dispatchChange } from "@/lib/events";
import type { SelectOption } from "@/lib/types";

/**
 * Wraps `ha-selector` in select mode for use in card editors.
 * @fires dp-change - `{ type: "select", value: string }`
 */
export class EditorSelect extends LitElement {
  /** Label shown above the selector. */
  @property({ type: String }) accessor label: string = "";

  /** Currently selected value. */
  @property({ type: String }) accessor value: string = "";

  /** Available options passed to `ha-selector`. */
  @property({ type: Array }) accessor options: SelectOption[] = [];

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    dispatchChange(this, { type: "select", value: e.detail.value });
  }

  render() {
    return html`<ha-selector
      .label=${this.label}
      .selector=${{ select: { options: this.options } }}
      .value=${this.value}
      @value-changed=${this._onValueChanged}
    ></ha-selector>`;
  }
}
customElements.define("editor-select", EditorSelect);
