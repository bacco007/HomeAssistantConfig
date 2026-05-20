import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./sidebar-section-header.styles";

const DEFAULT_I18N = createDefaultI18n(["Collapse", "Expand"]);

export class SidebarSectionHeader extends LitElement {
  @property({ type: String }) accessor title: string = "";

  @property({ type: String }) accessor subtitle: string = "";

  @property({ type: Boolean }) accessor collapsible: boolean = false;

  @property({ type: Boolean }) accessor open: boolean = true;

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

  private _emitToggle() {
    this.dispatchEvent(
      new CustomEvent("dp-section-toggle", { bubbles: true, composed: true })
    );
  }

  private _onHeaderClick() {
    if (!this.collapsible) {
      return;
    }

    this._emitToggle();
  }

  private _onHeaderKeydown(e: KeyboardEvent) {
    if (!this.collapsible) {
      return;
    }

    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }

    e.preventDefault();
    this._emitToggle();
  }

  private _onButtonClick(e: Event) {
    e.stopPropagation();
    this._emitToggle();
  }

  render() {
    return html`
      <div
        class="sidebar-section-header ${this.collapsible
          ? "is-collapsible"
          : ""}"
        role=${this.collapsible ? "button" : "presentation"}
        tabindex=${this.collapsible ? "0" : "-1"}
        aria-expanded=${this.collapsible ? String(this.open) : "false"}
        @click=${this._onHeaderClick}
        @keydown=${this._onHeaderKeydown}
      >
        <div class="sidebar-section-header-row">
          <div class="sidebar-section-title">${this.title}</div>
          ${this.collapsible
            ? html`
                <button
                  type="button"
                  class="sidebar-section-toggle ${this.open ? "is-open" : ""}"
                  aria-label="${this._t(
                    this.open ? "Collapse" : "Expand"
                  )} ${this.title}"
                  aria-expanded=${this.open}
                  @click=${this._onButtonClick}
                >
                  <ha-icon icon="mdi:chevron-down"></ha-icon>
                </button>
              `
            : nothing}
        </div>
        ${this.subtitle
          ? html`<div class="sidebar-section-subtitle">${this.subtitle}</div>`
          : nothing}
      </div>
    `;
  }
}
customElements.define("sidebar-section-header", SidebarSectionHeader);
