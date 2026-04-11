import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./annotation-chip.styles";
import type { HassLike, HassState } from "@/lib/types";

export class AnnotationChip extends LitElement {
  @property({ type: String }) accessor type: string = "";

  @property({ type: String, attribute: "item-id" }) accessor itemId: string =
    "";

  @property({ type: String }) accessor icon: string = "";

  @property({ type: String }) accessor name: string = "";

  @property({ type: String, attribute: "secondary-text" })
  accessor secondaryText: string = "";

  @property({ type: Object, attribute: false })
  accessor stateObj: Nullable<HassState> = null;

  @property({ type: Object, attribute: false })
  accessor hass: Nullable<HassLike> = null;

  static styles = styles;

  _onRemove() {
    this.dispatchEvent(
      new CustomEvent("dp-chip-remove", {
        detail: { type: this.type, itemId: this.itemId },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <span class="context-chip">
        ${this.stateObj
          ? html`<ha-state-icon
              .stateObj=${this.stateObj}
              .hass=${this.hass ?? null}
            ></ha-state-icon>`
          : html`<ha-icon icon="${this.icon}"></ha-icon>`}
        <span class="context-chip-text">
          <span class="context-chip-primary">${this.name}</span>
          ${this.secondaryText
            ? html`<span class="context-chip-secondary"
                >${this.secondaryText}</span
              >`
            : html``}
        </span>
        <button
          class="context-chip-remove"
          type="button"
          aria-label="Remove ${this.name}"
          @click=${this._onRemove}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </span>
    `;
  }
}
customElements.define("annotation-chip", AnnotationChip);
