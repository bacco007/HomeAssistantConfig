import { LitElement, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./action-targets.styles";
import type { ConfigChipItem, PartialTargetMap } from "@/cards/action/types";
import type { HassLike } from "@/lib/types";
import "@/molecules/chip-group/chip-group";

export class CardActionTargets extends LitElement {
  static styles = styles;

  @property({ attribute: false }) accessor hass: Nullable<HassLike> = null;

  @property({ type: Boolean, attribute: "show-config-targets" })
  accessor showConfigTargets: boolean = true;

  @property({ type: Boolean, attribute: "show-target-picker" })
  accessor showTargetPicker: boolean = true;

  @property({ attribute: false }) accessor configChips: ConfigChipItem[] = [];

  @state() accessor _targetValue: PartialTargetMap = {};

  resetSelection(): void {
    this._targetValue = {};
  }

  private _onTargetChanged(e: CustomEvent<{ value: PartialTargetMap }>): void {
    this._targetValue = e.detail.value || {};
    this.dispatchEvent(
      new CustomEvent("dp-target-change", {
        detail: { value: this._targetValue },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const hasChips = this.configChips.length > 0;

    return html`
      ${this.showConfigTargets && hasChips
        ? html`
            <chip-group
              .items=${this.configChips}
              .hass=${this.hass}
              .removable=${false}
              label="Data point will be associated with"
            ></chip-group>
          `
        : nothing}
      ${this.showTargetPicker
        ? html`
            <ha-selector
              id="target-sel"
              class="target-selector"
              .selector=${{ target: {} }}
              .hass=${this.hass}
              .value=${this._targetValue}
              @value-changed=${this._onTargetChanged}
            ></ha-selector>
          `
        : nothing}
    `;
  }
}

customElements.define("action-targets", CardActionTargets);
