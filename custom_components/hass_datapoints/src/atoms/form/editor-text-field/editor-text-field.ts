import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-text-field.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Wraps `ha-textfield` for use in card editors.
 * @fires dp-change - `{ type: "field", value: string }`
 */
export class EditorTextField extends LitElement {
  /** Label shown above the field. */
  @property({ type: String }) accessor label: string = "";

  /** Current field value. */
  @property({ type: String }) accessor value: string = "";

  /** HTML input type forwarded to `ha-textfield` (e.g. `"text"`, `"number"`). */
  @property({ type: String }) accessor type: string = "text";

  /** Placeholder text shown when the field is empty. */
  @property({ type: String }) accessor placeholder: string = "";

  /** Suffix label rendered after the input (e.g. a unit of measurement). */
  @property({ type: String }) accessor suffix: string = "";

  static styles = styles;

  _onInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    dispatchChange(this, { type: "field", value });
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
