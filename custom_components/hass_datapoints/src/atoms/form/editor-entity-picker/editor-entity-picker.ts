import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-entity-picker.styles";
import type { HassLike } from "@/lib/types";

export class EditorEntityPicker extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    this.dispatchEvent(
      new CustomEvent("dp-entity-change", {
        detail: { value: e.detail.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`<ha-selector
      .label=${this.label}
      .selector=${{ entity: {} }}
      .hass=${this.hass}
      .value=${this.value}
      @value-changed=${this._onValueChanged}
    ></ha-selector>`;
  }
}
customElements.define("editor-entity-picker", EditorEntityPicker);
