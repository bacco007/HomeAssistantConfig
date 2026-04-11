import { LitElement, html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-icon-picker.styles";
import type { HassLike } from "@/lib/types";

type HaIconPicker = HTMLElement & {
  label?: string;
  hass?: HassLike;
  value?: string;
};
export class EditorIconPicker extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "mdi:bookmark";

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  firstUpdated() {
    const el = this.shadowRoot!.querySelector(
      "ha-icon-picker"
    ) as Nullable<HaIconPicker>;
    if (el) {
      el.label = this.label;
      if (this.hass) {
        el.hass = this.hass;
      }
      el.value = this.value;
    }
  }

  updated(changedProps: PropertyValues) {
    const el = this.shadowRoot!.querySelector(
      "ha-icon-picker"
    ) as Nullable<HaIconPicker>;
    if (!el) {
      return;
    }
    if (changedProps.has("value")) {
      el.value = this.value;
    }
    if (changedProps.has("hass") && this.hass) {
      el.hass = this.hass;
    }
  }

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
      @value-changed=${this._onValueChanged}
    ></ha-icon-picker>`;
  }
}
customElements.define("editor-icon-picker", EditorIconPicker);
