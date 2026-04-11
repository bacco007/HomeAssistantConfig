import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { classMap } from "lit/directives/class-map.js";
import { styles } from "./comparison-tab.styles";

/**
 * `comparison-tab` renders a single comparison date-window tab in the chart
 * tab rail, handling active, previewing, loading, and editable states.
 *
 * @fires dp-tab-activate - `{ tabId: string }` fired when the trigger button is clicked
 * @fires dp-tab-hover - `{ tabId: string }` fired on mouseenter / trigger focus
 * @fires dp-tab-leave - `{ tabId: string }` fired on mouseleave / trigger blur
 * @fires dp-tab-edit - `{ tabId: string }` fired when the edit action button is clicked
 * @fires dp-tab-delete - `{ tabId: string }` fired when the delete action button is clicked
 */
export class ComparisonTab extends LitElement {
  static styles = styles;

  /** Unique identifier for this tab; included in all event detail objects. */
  @property({ type: String, attribute: "tab-id" }) accessor tabId: string = "";

  /** Primary label displayed in the tab (e.g. "Selected range" or a user-defined name). */
  @property({ type: String }) accessor label: string = "";

  /** Secondary detail text shown below the label (e.g. formatted date range). */
  @property({ type: String }) accessor detail: string = "";

  /** Whether this tab represents the currently active date window. */
  @property({ type: Boolean }) accessor active: boolean = false;

  /** Whether the chart is previewing this tab's date range on hover/focus. */
  @property({ type: Boolean }) accessor previewing: boolean = false;

  /** Whether this tab's data is currently loading. */
  @property({ type: Boolean }) accessor loading: boolean = false;

  /** Whether edit and delete action buttons are shown. */
  @property({ type: Boolean }) accessor editable: boolean = false;

  private _emit(name: string) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: { tabId: this.tabId },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onTriggerClick() {
    this._emit("dp-tab-activate");
  }

  private _onMouseEnter() {
    this._emit("dp-tab-hover");
  }

  private _onMouseLeave() {
    this._emit("dp-tab-leave");
  }

  private _onTriggerFocus() {
    this._emit("dp-tab-hover");
  }

  private _onTriggerBlur() {
    this._emit("dp-tab-leave");
  }

  private _onEditClick(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    this._emit("dp-tab-edit");
  }

  private _onDeleteClick(ev: Event) {
    ev.preventDefault();
    ev.stopPropagation();
    this._emit("dp-tab-delete");
  }

  render() {
    const tabClasses = classMap({
      "chart-tab": true,
      active: this.active,
      previewing: this.previewing,
      loading: this.loading,
    });

    return html`
      <div
        class=${tabClasses}
        @mouseenter=${this._onMouseEnter}
        @mouseleave=${this._onMouseLeave}
      >
        <button
          type="button"
          class="chart-tab-trigger"
          ?aria-current=${this.active}
          @click=${this._onTriggerClick}
          @focus=${this._onTriggerFocus}
          @blur=${this._onTriggerBlur}
        >
          <span class="chart-tab-content">
            <span class="chart-tab-main">
              ${this.loading
                ? html`<span
                    class="chart-tab-spinner"
                    aria-hidden="true"
                  ></span>`
                : null}
              <span class="chart-tab-label">${this.label}</span>
            </span>
            <span class="chart-tab-detail-row">
              <span class="chart-tab-detail">${this.detail}</span>
            </span>
          </span>
        </button>
        ${this.editable
          ? html`
              <span class="chart-tab-actions">
                <button
                  type="button"
                  class="chart-tab-action edit"
                  aria-label="Edit ${this.label}"
                  @click=${this._onEditClick}
                >
                  <ha-icon icon="mdi:pencil-outline"></ha-icon>
                </button>
                <button
                  type="button"
                  class="chart-tab-action delete"
                  aria-label="Delete ${this.label}"
                  @click=${this._onDeleteClick}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </span>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("comparison-tab", ComparisonTab);

declare global {
  interface HTMLElementTagNameMap {
    "comparison-tab": ComparisonTab;
  }
}
