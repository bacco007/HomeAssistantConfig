import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-icon-picker.styles";
import { dispatchChange } from "@/lib/events";
import type { HassLike } from "@/lib/types";

/**
 * MDI icon picker backed by `ha-icon-picker`.
 * @fires dp-change - `{ type: "icon", value: string }` — MDI icon string (e.g. `"mdi:home"`)
 */
export class EditorIconPicker extends LitElement {
  /** Label shown above the picker. */
  @property({ type: String }) accessor label: string = "";

  /** Currently selected MDI icon string. */
  @property({ type: String }) accessor value: string = "mdi:bookmark";

  /** HA hass object forwarded to `ha-icon-picker`. */
  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  _onValueChanged(e: CustomEvent<{ value: string }>) {
    dispatchChange(this, { type: "icon", value: e.detail.value });
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
