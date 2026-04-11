import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { localized, msg } from "@/lib/i18n/localize";
import { styles } from "./comparison-tab-rail.styles";
import "@/molecules/comparison-tab/comparison-tab";

export interface TabItem {
  id: string;
  label: string;
  detail: string;
  active: boolean;
  editable: boolean;
}

/**
 * `comparison-tab-rail` renders the full comparison tab bar: a scrollable
 * row of `comparison-tab` elements and an "Add date window" button.
 *
 * @fires dp-tab-activate - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-hover - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-leave - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-edit - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-delete - `{ tabId: string }` re-dispatched from child tabs
 * @fires dp-tab-add - `{}` fired when the "Add date window" button is clicked
 */
@localized()
export class ComparisonTabRail extends LitElement {
  static styles = styles;

  /** Array of tab descriptors to render. */
  @property({ type: Array }) accessor tabs: TabItem[] = [];

  /** IDs of tabs that are currently loading data. */
  @property({ type: Array, attribute: false }) accessor loadingIds: string[] =
    [];

  /** ID of the tab currently being previewed (hovered). */
  @property({ type: String, attribute: "hovered-id" })
  accessor hoveredId: string = "";

  /** Whether the rail is overflowing horizontally (collapses "Add" button to icon only). */
  @property({ type: Boolean }) accessor overflowing: boolean = false;

  private _resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    if (this._resizeObserver) {
      return;
    }
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
    this.updateComplete.then(() => {
      if (!this.isConnected || !this._resizeObserver) {
        return;
      }
      const shell = this.shadowRoot?.querySelector(
        ".chart-tabs-shell"
      ) as Nullable<HTMLElement>;
      if (shell) {
        this._resizeObserver.observe(shell);
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  private _checkOverflow() {
    const shell = this.shadowRoot?.querySelector(
      ".chart-tabs-shell"
    ) as Nullable<HTMLElement>;
    if (!shell) {
      return;
    }
    const rail = shell.querySelector(
      ".chart-tabs-rail"
    ) as Nullable<HTMLElement>;
    if (!rail) {
      return;
    }
    this.overflowing = rail.scrollWidth > rail.clientWidth;
  }

  private _onAddClick() {
    this.dispatchEvent(
      new CustomEvent("dp-tab-add", {
        detail: {},
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const shellClasses = classMap({
      "chart-tabs-shell": true,
      overflowing: this.overflowing,
    });

    return html`
      <div class=${shellClasses}>
        <div class="chart-tabs-rail">
          <div class="chart-tabs">
            ${repeat(
              this.tabs,
              (tab) => tab.id,
              (tab) => html`
                <comparison-tab
                  .tabId=${tab.id}
                  .label=${tab.label}
                  .detail=${tab.detail}
                  .active=${tab.active}
                  .previewing=${this.hoveredId === tab.id}
                  .loading=${this.loadingIds.includes(tab.id)}
                  .editable=${tab.editable}
                ></comparison-tab>
              `
            )}
          </div>
        </div>
        <button type="button" class="chart-tabs-add" @click=${this._onAddClick}>
          <ha-icon icon="mdi:plus"></ha-icon>
          <span class="chart-tabs-add-label">${msg("Add date window")}</span>
        </button>
      </div>
    `;
  }
}

customElements.define("comparison-tab-rail", ComparisonTabRail);

declare global {
  interface HTMLElementTagNameMap {
    "comparison-tab-rail": ComparisonTabRail;
  }
}
