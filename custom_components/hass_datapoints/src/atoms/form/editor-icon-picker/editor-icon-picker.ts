import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-icon-picker.styles";
import type { HassLike } from "@/lib/types";

export class EditorIconPicker extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "mdi:bookmark";

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    this.dispatchEvent(
      new CustomEvent("dp-icon-change", {
        detail: { value: e.detail.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`<ha-icon-picker
      .label=${this.label}
      .hass=${this.hass}
      .value=${this.value}
      @value-changed=${this._onValueChanged}
    ></ha-icon-picker>`;
  }
}
customElements.define("editor-icon-picker", EditorIconPicker);
