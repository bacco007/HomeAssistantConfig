import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-entity-picker.styles";
import { dispatchChange } from "@/lib/events";
import type { HassLike } from "@/lib/types";

/**
 * Single-entity picker wrapping `ha-selector` in entity mode.
 * @fires dp-change - `{ type: "entity", value: string }`
 */
export class EditorEntityPicker extends LitElement {
  /** Label shown above the selector. */
  @property({ type: String }) accessor label: string = "";

  /** Currently selected entity ID. */
  @property({ type: String }) accessor value: string = "";

  /** HA hass object forwarded to `ha-selector`. */
  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    dispatchChange(this, { type: "entity", value: e.detail.value });
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
