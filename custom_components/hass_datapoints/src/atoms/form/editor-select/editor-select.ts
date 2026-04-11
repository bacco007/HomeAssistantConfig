import { LitElement, html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-select.styles";
import type { SelectOption } from "@/lib/types";

type HaSelector = HTMLElement & {
  label?: string;
  selector?: unknown;
  value?: string;
};
export class EditorSelect extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: Array }) accessor options: SelectOption[] = [];

  static styles = styles;

  firstUpdated() {
    const el = this.shadowRoot!.querySelector(
      "ha-selector"
    ) as Nullable<HaSelector>;
    if (el) {
      el.label = this.label;
      el.selector = { select: { options: this.options } };
      el.value = this.value;
    }
  }

  updated(changedProps: PropertyValues) {
    const el = this.shadowRoot!.querySelector(
      "ha-selector"
    ) as Nullable<HaSelector>;
    if (!el) {
      return;
    }
    if (changedProps.has("value")) {
      el.value = this.value;
    }
    if (changedProps.has("options")) {
      el.selector = { select: { options: this.options } };
    }
  }

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
      @value-changed=${this._onValueChanged}
    ></ha-selector>`;
  }
}
customElements.define("editor-select", EditorSelect);
