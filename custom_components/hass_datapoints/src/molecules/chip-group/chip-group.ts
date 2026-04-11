import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./chip-group.styles";
import type { ChipItem, HassLike } from "@/lib/types";
import "@/atoms/form/entity-chip/entity-chip";

export class ChipGroup extends LitElement {
  @property({ type: Array }) accessor items: ChipItem[] = [];

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @property({ type: Boolean }) accessor removable: boolean = false;

  @property({ type: String }) accessor label: string = "";

  static styles = styles;

  _onRemove(e: CustomEvent<{ type: string; itemId: string }>) {
    const { type, itemId } = e.detail;
    const next = this.items.filter(
      (item) => !(item.type === type && item.id === itemId)
    );
    this.dispatchEvent(
      new CustomEvent("dp-chips-change", {
        detail: { items: next },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      ${this.label ? html`<div class="label">${this.label}</div>` : ""}
      <div class="chips">
        ${this.items.map(
          (item) => html`
            <entity-chip
              .type=${item.type}
              .itemId=${item.id}
              .hass=${this.hass}
              .removable=${this.removable}
              @dp-chip-remove=${this._onRemove}
            ></entity-chip>
          `
        )}
      </div>
    `;
  }
}
customElements.define("chip-group", ChipGroup);
