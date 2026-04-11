import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./event-list-item.styles";
import type { EventRecord, HassLike } from "@/lib/types";

export class EventListItem extends LitElement {
  @property({ type: Object }) accessor event: Nullable<EventRecord> = null;

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @property({ type: Boolean }) accessor editable: boolean = false;

  static styles = styles;

  _formatTime(isoStr: Nullable<string> | undefined): string {
    if (!isoStr) {
      return "";
    }
    try {
      const d = new Date(isoStr);
      return d.toLocaleString();
    } catch {
      return isoStr;
    }
  }

  _onDelete() {
    this.dispatchEvent(
      new CustomEvent("dp-event-delete", {
        detail: { id: this.event?.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onEdit() {
    this.dispatchEvent(
      new CustomEvent("dp-event-edit", {
        detail: { id: this.event?.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.event) {
      return html``;
    }
    const ev = this.event;
    return html`
      <div class="item">
        <div class="icon-wrap" style="background-color: ${ev.color || "#888"}">
          ${ev.icon
            ? html`<ha-icon
                .icon=${ev.icon}
                style="--mdc-icon-size: 16px; color: #fff;"
              ></ha-icon>`
            : ""}
        </div>
        <div class="content">
          <div class="message">${ev.message || ""}</div>
          ${ev.annotation
            ? html`<div class="annotation">${ev.annotation}</div>`
            : ""}
          <div class="time">${this._formatTime(ev.timestamp)}</div>
        </div>
        ${this.editable
          ? html`
              <div class="actions">
                <button
                  class="action-btn"
                  data-action="edit"
                  @click=${this._onEdit}
                >
                  Edit
                </button>
                <button
                  class="action-btn delete"
                  data-action="delete"
                  @click=${this._onDelete}
                >
                  Delete
                </button>
              </div>
            `
          : ""}
      </div>
    `;
  }
}
customElements.define("event-list-item", EventListItem);
