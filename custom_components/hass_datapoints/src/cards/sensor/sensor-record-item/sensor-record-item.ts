import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { fmtDateTime, fmtRelativeTime } from "@/lib/util/format";
import type { EventRecordFull } from "@/lib/types";
import { styles } from "./sensor-record-item.styles";

export class SensorRecordItem extends LitElement {
  @property({ type: Object, attribute: false })
  accessor event: Nullable<EventRecordFull> = null;

  @property({ type: Boolean }) accessor hidden: boolean = false;

  @property({ type: Boolean, attribute: "show-full-message" })
  accessor showFullMessage: boolean = true;

  @state() private accessor _noteExpanded: boolean = false;

  static styles = styles;

  private _onToggleVisibility(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("dp-sensor-record-toggle-visibility", {
        detail: { id: this.event?.id },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onNavigate(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("dp-sensor-record-navigate", {
        detail: { event: this.event },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const ev = this.event;
    if (!ev) return html``;

    const color = ev.color || "#03a9f4";
    const icon = ev.icon || "mdi:bookmark";
    const annText =
      ev.annotation && ev.annotation !== ev.message ? ev.annotation : "";
    const isSimple = !annText;
    const visibilityIcon = this.hidden ? "mdi:eye" : "mdi:eye-off";
    const visibilityLabel = this.hidden
      ? "Show chart marker"
      : "Hide chart marker";
    const showNoteInline = this.showFullMessage;
    const noteHidden = !showNoteInline && !this._noteExpanded;

    return html`
      <div
        class="ann-item${this.hidden ? " is-hidden" : ""}${isSimple
          ? " simple"
          : ""}"
        @click=${!showNoteInline && annText
          ? () => {
              this._noteExpanded = !this._noteExpanded;
            }
          : undefined}
      >
        <div class="ann-icon-wrap" style="background:${color}">
          <ha-icon
            class="ann-icon-main"
            .icon=${icon}
            style="--mdc-icon-size:18px"
          ></ha-icon>
          <button
            class="ann-visibility-btn"
            type="button"
            title=${visibilityLabel}
            aria-label=${visibilityLabel}
            @click=${this._onToggleVisibility}
          >
            <ha-icon .icon=${visibilityIcon}></ha-icon>
          </button>
        </div>
        <div class="ann-body">
          <div class="ann-header">
            <span class="ann-msg">
              ${ev.message}
              ${ev.dev ? html`<span class="ann-dev-badge">DEV</span>` : ""}
              ${annText && !showNoteInline
                ? html`<button class="ann-expand-chip" title="Show annotation">
                    ···
                  </button>`
                : ""}
            </span>
            <span class="ann-time-wrap">
              <span
                class="ann-time"
                title=${fmtDateTime(ev.timestamp) as string}
              >
                ${fmtRelativeTime(ev.timestamp)}
              </span>
              <button
                class="ann-history-btn"
                type="button"
                title="Open related history"
                @click=${this._onNavigate}
              >
                <ha-icon icon="mdi:history"></ha-icon>
              </button>
            </span>
          </div>
          ${annText
            ? html`<div class="ann-note${noteHidden ? " hidden" : ""}">
                ${annText}
              </div>`
            : ""}
        </div>
      </div>
    `;
  }
}
customElements.define("sensor-record-item", SensorRecordItem);
