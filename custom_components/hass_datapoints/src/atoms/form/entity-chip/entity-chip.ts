import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./entity-chip.styles";
import type { ChipItemType, HassLike } from "@/lib/types";
import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";

const DEFAULT_I18N = createDefaultI18n(["Remove"]);

export class EntityChip extends LitElement {
  @property({ type: String }) accessor type: ChipItemType = "entity";

  @property({ type: String, attribute: "item-id" }) accessor itemId: string =
    "";

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @property({ type: Boolean }) accessor removable: boolean = false;

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

  _getName(): string {
    if (!this.hass || !this.itemId) {
      return this.itemId || "";
    }
    switch (this.type) {
      case "entity": {
        const state = this.hass.states?.[this.itemId];
        return (
          (state?.attributes?.friendly_name as string | undefined) ??
          this.itemId
        );
      }
      case "device": {
        const device = this.hass.devices?.[this.itemId];
        return device?.name ?? this.itemId;
      }
      case "area": {
        const area = this.hass.areas?.[this.itemId];
        return area?.name ?? this.itemId;
      }
      default:
        return this.itemId;
    }
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
      <span class="chip">
        ${this._getName()}
        ${this.removable
          ? html`<button
              class="remove"
              data-action="remove"
              @click=${this._onRemove}
              aria-label=${this._t("Remove")}
            ></button>`
          : ""}
      </span>
    `;
  }
}
customElements.define("entity-chip", EntityChip);
