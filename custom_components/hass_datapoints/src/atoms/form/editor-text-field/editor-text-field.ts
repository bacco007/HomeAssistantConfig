import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-text-field.styles";

export class EditorTextField extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: String }) accessor type: string = "text";

  @property({ type: String }) accessor placeholder: string = "";

  @property({ type: String }) accessor suffix: string = "";

  static styles = styles;

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
    return html`<ha-textfield
      .label=${this.label}
      .value=${this.value}
      .type=${this.type}
      .placeholder=${this.placeholder}
      .suffix=${this.suffix}
      @input=${this._onInput}
    ></ha-textfield>`;
  }
}
customElements.define("editor-text-field", EditorTextField);
