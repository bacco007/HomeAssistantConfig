import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./pagination.styles";

const DEFAULT_I18N = createDefaultI18n([
  "Previous page",
  "Next page",
  "Page {0} of {1}",
  "records",
]);

export class Pagination extends LitElement {
  @property({ type: Number }) accessor page: number = 0;

  @property({ type: Number }) accessor totalPages: number = 1;

  @property({ type: Number }) accessor totalItems: number = 0;

  @property({ type: String }) accessor label: string = "";

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string, ...values: Array<string | number>): string {
    return t(this.i18n, key, ...values);
  }

  _onPrev() {
    if (this.page > 0) {
      this.dispatchEvent(
        new CustomEvent("dp-page-change", {
          detail: { page: this.page - 1 },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  _onNext() {
    if (this.page < this.totalPages - 1) {
      this.dispatchEvent(
        new CustomEvent("dp-page-change", {
          detail: { page: this.page + 1 },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  render() {
    const label = this.label || this._t("records");
    return html`
      <button
        type="button"
        data-action="prev"
        ?disabled=${this.page <= 0}
        @click=${this._onPrev}
        aria-label=${this._t("Previous page")}
      >
        ‹
      </button>
      <span class="info">
        <span
          >${this._t("Page {0} of {1}", this.page + 1, this.totalPages)}</span
        >
        <span class="sep" aria-hidden="true">•</span>
        <span>${this.totalItems} ${label}</span>
      </span>
      <button
        type="button"
        data-action="next"
        ?disabled=${this.page >= this.totalPages - 1}
        @click=${this._onNext}
        aria-label=${this._t("Next page")}
      >
        ›
      </button>
    `;
  }
}
customElements.define("pagination-nav", Pagination);
