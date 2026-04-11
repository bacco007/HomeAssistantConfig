import { LitElement, html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-entity-picker.styles";
import type { HassLike } from "@/lib/types";

type HaSelector = HTMLElement & {
  label?: string;
  selector?: unknown;
  hass?: HassLike;
  value?: string;
};
export class EditorEntityPicker extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor value: string = "";

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  firstUpdated() {
    const el = this.shadowRoot!.querySelector(
      "ha-selector"
    ) as Nullable<HaSelector>;
    if (el) {
      el.label = this.label;
      el.selector = { entity: {} };
      if (this.hass) {
        el.hass = this.hass;
      }
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
    if (changedProps.has("hass") && this.hass) {
      el.hass = this.hass;
    }
  }

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
      @value-changed=${this._onValueChanged}
    ></ha-selector>`;
  }
}
customElements.define("editor-entity-picker", EditorEntityPicker);
