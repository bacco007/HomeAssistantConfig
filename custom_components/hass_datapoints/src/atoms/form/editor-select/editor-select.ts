import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-select.styles";
import type { SelectOption } from "@/lib/types";

export class EditorSelect extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: Array }) accessor options: SelectOption[] = [];

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    this.dispatchEvent(
      new CustomEvent("dp-select-change", {
        detail: { value: e.detail.value },
        bubbles: true,
        composed: true,
      })
    );
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
