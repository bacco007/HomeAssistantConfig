import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./annotation-chip.styles";
import type { HassLike, HassState } from "@/lib/types";
import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";

const DEFAULT_I18N = createDefaultI18n(["Remove {0}"]);

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

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string, ...values: Array<string | number>): string {
    return t(this.i18n, key, ...values);
  }

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
          aria-label=${this._t("Remove {0}", this.name)}
          @click=${this._onRemove}
        >
          <ha-icon icon="mdi:close"></ha-icon>
        </button>
      </span>
    `;
  }
}
customElements.define("annotation-chip", AnnotationChip);
