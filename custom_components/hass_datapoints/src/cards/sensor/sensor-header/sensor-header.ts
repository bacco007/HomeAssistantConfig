import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { styles } from "./sensor-header.styles";
import type { HassLike } from "@/lib/types";

export class SensorHeader extends LitElement {
  @property({ type: String }) accessor name: string = "—";

  @property({ type: String }) accessor value: string = "—";

  @property({ type: String }) accessor unit: string = "";

  @property({ type: Object, attribute: false }) accessor stateObj: Nullable<
    Record<string, unknown>
  > = null;

  @property({ type: Object, attribute: false })
  accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  private _onHeaderClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("dp-sensor-header-click", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="header" @click=${this._onHeaderClick}>
        <div class="name">${this.name}</div>
        <div class="icon">
          <ha-state-icon
            .stateObj=${this.stateObj}
            .hass=${this.hass}
          ></ha-state-icon>
        </div>
      </div>
      <div class="info" @click=${this._onHeaderClick}>
        <span class="value first-part">${this.value}</span>
        <span class="measurement">${this.unit}</span>
      </div>
    `;
  }
}
customElements.define("sensor-header", SensorHeader);
