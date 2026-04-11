import { LitElement, html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-text-field.styles";

type HaTextField = HTMLElement & {
  label?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  suffix?: string;
};
export class EditorTextField extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: String }) accessor type: string = "text";

  @property({ type: String }) accessor placeholder: string = "";

  @property({ type: String }) accessor suffix: string = "";

  static styles = styles;

  firstUpdated() {
    const field = this.shadowRoot!.querySelector(
      "ha-textfield"
    ) as Nullable<HaTextField>;
    if (field) {
      field.label = this.label;
      field.value = this.value;
      if (this.type) {
        field.type = this.type;
      }
      if (this.placeholder) {
        field.placeholder = this.placeholder;
      }
      if (this.suffix) {
        field.suffix = this.suffix;
      }
    }
  }

  updated(changedProps: PropertyValues) {
    const field = this.shadowRoot!.querySelector(
      "ha-textfield"
    ) as Nullable<HaTextField>;
    if (!field) {
      return;
    }
    if (changedProps.has("value")) {
      field.value = this.value;
    }
    if (changedProps.has("label")) {
      field.label = this.label;
    }
  }

  _onInput(e: Event) {
    const rawValue = (e.target as HTMLInputElement).value;
    const value = this.type === "number" ? parseFloat(rawValue) : rawValue;
    this.dispatchEvent(
      new CustomEvent("dp-field-change", {
        detail: {
          value:
            this.type === "number" && Number.isNaN(value as number)
              ? undefined
              : value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`<ha-textfield @input=${this._onInput}></ha-textfield>`;
  }
}
customElements.define("editor-text-field", EditorTextField);
