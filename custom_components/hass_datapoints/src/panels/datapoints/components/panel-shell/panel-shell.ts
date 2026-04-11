import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { classMap } from "lit/directives/class-map.js";
import { styles } from "./panel-shell.styles";
import { localized, msg } from "@/lib/i18n/localize";
import type { HassLike } from "@/lib/types";
import "@/molecules/floating-menu/floating-menu";
import "@/atoms/interactive/page-menu-item/page-menu-item";

/**
 * `panel-shell` renders the outer layout shell for the Datapoints panel.
 *
 * It provides the top app bar, sidebar/content split, sidebar collapse behaviour,
 * and the page-level options menu. All dynamic content is projected via named slots.
 *
 * ## Slots
 * - `controls`         — content placed inside the controls-section bar (e.g. range toolbar)
 * - `sidebar`          — content placed inside the collapsible page sidebar (e.g. history targets)
 * - `sidebar-options`  — content placed below the sidebar content (e.g. sidebar options panel)
 * - (default)          — main content area
 *
 * @fires dp-shell-menu-download  — user clicked "Download spreadsheet"
 * @fires dp-shell-menu-save      — user clicked "Save page state"
 * @fires dp-shell-menu-restore   — user clicked "Restore saved page"
 * @fires dp-shell-menu-clear     — user clicked "Clear saved page"
 * @fires dp-shell-sidebar-toggle — user clicked the sidebar toggle button
 * @fires dp-shell-scrim-click    — user clicked the sidebar scrim overlay
 */
@localized()
export class PanelShell extends LitElement {
  static styles = styles;

  /** Home Assistant object — forwarded to ha-menu-button and ha-top-app-bar-fixed. */
  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  /** Narrow layout flag — forwarded to ha-menu-button and ha-top-app-bar-fixed. */
  @property({ type: Boolean }) accessor narrow: boolean = false;

  /** Whether the sidebar is currently in collapsed state. Controlled by the parent. */
  @property({ type: Boolean, attribute: "sidebar-collapsed" })
  accessor sidebarCollapsed: boolean = false;

  /** Whether a saved page state exists — controls visibility of Restore/Clear menu items. */
  @property({ type: Boolean, attribute: "has-saved-state" })
  accessor hasSavedState: boolean = false;

  /**
   * Current layout mode. Used to determine scrim visibility.
   * "desktop" | "tablet" | "mobile"
   */
  @property({ type: String, attribute: "layout-mode" })
  accessor layoutMode: string = "desktop";

  @state() accessor _pageMenuOpen: boolean = false;

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Returns the `#page-content` element for layout height calculations. */
  getPageContentEl(): Nullable<HTMLElement> {
    return this.shadowRoot?.querySelector<HTMLElement>("#page-content") ?? null;
  }

  /** Returns the main `#content` element. */
  getContentEl(): Nullable<HTMLElement> {
    return this.shadowRoot?.querySelector<HTMLElement>("#content") ?? null;
  }

  /** Returns the `#collapsed-target-popup` element for imperative positioning. */
  getTargetPopupEl(): Nullable<HTMLElement> {
    return (
      this.shadowRoot?.querySelector<HTMLElement>("#collapsed-target-popup") ??
      null
    );
  }

  /** Returns the `#collapsed-options-popup` element for imperative positioning. */
  getOptionsPopupEl(): Nullable<HTMLElement> {
    return (
      this.shadowRoot?.querySelector<HTMLElement>("#collapsed-options-popup") ??
      null
    );
  }

  /**
   * Recalculates and applies the `--history-page-content-height` CSS property so
   * the page-content area fills the remaining viewport height below the top bar.
   */
  syncLayoutHeight(): void {
    const pageContentEl = this.getPageContentEl();
    if (!pageContentEl) return;
    const pageRect = pageContentEl.getBoundingClientRect();
    const hostRect = this.getBoundingClientRect();
    const availableHeight = Math.max(0, hostRect.bottom - pageRect.top);
    if (availableHeight > 0) {
      pageContentEl.style.setProperty(
        "--history-page-content-height",
        `${availableHeight}px`
      );
    }
  }

  /** Closes the page options menu without emitting an event. */
  closePageMenu(): void {
    if (this._pageMenuOpen) {
      this._pageMenuOpen = false;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private _emit(name: string, detail: RecordWithUnknownValues = {}): void {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true })
    );
  }

  private _computeMenuPosition(
    anchorEl: HTMLElement,
    menuWidth: number
  ): { left: number; top: number } {
    const viewportPadding = 8;
    const anchorRect = anchorEl.getBoundingClientRect();
    const left = Math.max(
      viewportPadding,
      Math.min(
        anchorRect.right - menuWidth,
        window.innerWidth - menuWidth - viewportPadding
      )
    );
    const top = Math.max(viewportPadding, anchorRect.bottom + 8);
    return { left, top };
  }

  private _togglePageMenu(force?: boolean): void {
    const next = force !== undefined ? force : !this._pageMenuOpen;
    this._pageMenuOpen = next;
    if (next) {
      const menuEl = this.shadowRoot?.querySelector<
        HTMLElement & { open?: boolean }
      >("#page-menu");
      const buttonEl =
        this.shadowRoot?.querySelector<HTMLElement>("#page-menu-button");
      if (menuEl && buttonEl) {
        const { left, top } = this._computeMenuPosition(
          buttonEl,
          Math.max(220, menuEl.offsetWidth || 220)
        );
        menuEl.style.setProperty("--floating-menu-left", `${left}px`);
        menuEl.style.setProperty("--floating-menu-top", `${top}px`);
      }
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  private _onPageMenuButtonClick(): void {
    this._togglePageMenu();
  }

  private _onPageMenuClose(): void {
    this._togglePageMenu(false);
  }

  private _onMenuDownload(): void {
    this._togglePageMenu(false);
    this._emit("dp-shell-menu-download");
  }

  private _onMenuSave(): void {
    this._togglePageMenu(false);
    this._emit("dp-shell-menu-save");
  }

  private _onMenuRestore(): void {
    this._togglePageMenu(false);
    this._emit("dp-shell-menu-restore");
  }

  private _onMenuClear(): void {
    this._togglePageMenu(false);
    this._emit("dp-shell-menu-clear");
  }

  private _onSidebarToggle(): void {
    this._emit("dp-shell-sidebar-toggle");
  }

  private _onScrimClick(): void {
    this._emit("dp-shell-scrim-click");
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  render() {
    const isOverlay = this.layoutMode !== "desktop";
    const sidebarIcon = this.sidebarCollapsed
      ? "mdi:chevron-right"
      : "mdi:chevron-left";
    const sidebarLabel = this.sidebarCollapsed
      ? msg("Expand targets sidebar")
      : msg("Collapse targets sidebar");

    return html`
      <ha-top-app-bar-fixed .hass=${this.hass} .narrow=${this.narrow}>
        <ha-menu-button
          slot="navigationIcon"
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></ha-menu-button>
        <div slot="title">${msg("Datapoints")}</div>

        <div slot="actionItems" class="page-header-actions">
          <div class="page-menu-wrap">
            <ha-icon-button
              id="page-menu-button"
              class="page-menu-button"
              label=${msg("Page options")}
              aria-haspopup="menu"
              aria-expanded=${this._pageMenuOpen ? "true" : "false"}
              @click=${this._onPageMenuButtonClick}
            >
              <ha-icon icon="mdi:dots-vertical"></ha-icon>
            </ha-icon-button>
            <floating-menu
              id="page-menu"
              .open=${this._pageMenuOpen}
              @dp-menu-close=${this._onPageMenuClose}
            >
              <page-menu-item
                icon="mdi:file-excel-outline"
                label=${msg("Download spreadsheet")}
                @dp-menu-action=${this._onMenuDownload}
              ></page-menu-item>
              <page-menu-item
                icon="mdi:content-save-outline"
                label=${msg("Save page state")}
                @dp-menu-action=${this._onMenuSave}
              ></page-menu-item>
              ${this.hasSavedState
                ? html`
                    <page-menu-item
                      icon="mdi:restore"
                      label=${msg("Restore saved page")}
                      @dp-menu-action=${this._onMenuRestore}
                    ></page-menu-item>
                    <page-menu-item
                      icon="mdi:delete-outline"
                      label=${msg("Clear saved page")}
                      @dp-menu-action=${this._onMenuClear}
                    ></page-menu-item>
                  `
                : nothing}
            </floating-menu>
          </div>
        </div>

        <div class="controls-section">
          <div class="controls-grid">
            <div id="date-slot" class="control-date">
              <slot name="controls"></slot>
            </div>
          </div>
        </div>

        <div
          id="page-content"
          class=${classMap({
            "page-content": true,
            "sidebar-collapsed": this.sidebarCollapsed,
          })}
        >
          <div
            id="sidebar-scrim"
            class=${classMap({
              "sidebar-scrim": true,
              visible: isOverlay && !this.sidebarCollapsed,
            })}
            @click=${this._onScrimClick}
          ></div>

          <div
            id="page-sidebar"
            class=${classMap({
              "page-sidebar": true,
              collapsed: this.sidebarCollapsed,
            })}
          >
            <ha-icon-button
              id="sidebar-toggle"
              class="sidebar-toggle-button"
              label=${sidebarLabel}
              @click=${this._onSidebarToggle}
            >
              <ha-icon icon=${sidebarIcon}></ha-icon>
            </ha-icon-button>

            <div id="target-slot" class="control-target">
              <slot name="sidebar"></slot>
            </div>
            <div id="sidebar-options" class="sidebar-options">
              <slot name="sidebar-options"></slot>
            </div>
          </div>

          <div class="content" id="content">
            <slot></slot>
          </div>
        </div>

        <div
          id="collapsed-target-popup"
          class="collapsed-target-popup"
          hidden
        ></div>
        <div
          id="collapsed-options-popup"
          class="collapsed-options-popup"
          hidden
        ></div>
      </ha-top-app-bar-fixed>
    `;
  }
}

customElements.define("panel-shell", PanelShell);

declare global {
  interface HTMLElementTagNameMap {
    "panel-shell": PanelShell;
  }
}
