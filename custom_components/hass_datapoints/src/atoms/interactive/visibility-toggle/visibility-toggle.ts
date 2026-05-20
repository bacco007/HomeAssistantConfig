import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./visibility-toggle.styles";

const DEFAULT_I18N = createDefaultI18n(["Hide {0}", "Show {0}"]);

export class VisibilityToggle extends LitElement {
  @property({ type: Boolean }) accessor pressed: boolean = true;

  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor icon: string = "mdi:eye";

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string, ...values: Array<string | number>): string {
    return t(this.i18n, key, ...values);
  }

  _onClick() {
    this.dispatchEvent(
      new CustomEvent("dp-visibility-change", {
        detail: { pressed: !this.pressed },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button
        type="button"
        aria-pressed="${this.pressed}"
        title="${this._t(this.pressed ? "Hide {0}" : "Show {0}", this.label)}"
        @click=${this._onClick}
      >
        ${this.label}
      </button>
    `;
  }
}
customElements.define("visibility-toggle", VisibilityToggle);
