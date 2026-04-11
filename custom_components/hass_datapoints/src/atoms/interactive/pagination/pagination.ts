import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./pagination.styles";

export class Pagination extends LitElement {
  @property({ type: Number }) accessor page: number = 0;

  @property({ type: Number }) accessor totalPages: number = 1;

  @property({ type: Number }) accessor totalItems: number = 0;

  @property({ type: String }) accessor label: string = "records";

  static styles = styles;

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
    return html`
      <button
        type="button"
        data-action="prev"
        ?disabled=${this.page <= 0}
        @click=${this._onPrev}
        aria-label="Previous page"
      >
        ‹
      </button>
      <span class="info">
        <span>Page ${this.page + 1} of ${this.totalPages}</span>
        <span class="sep" aria-hidden="true">•</span>
        <span>${this.totalItems} ${this.label}</span>
      </span>
      <button
        type="button"
        data-action="next"
        ?disabled=${this.page >= this.totalPages - 1}
        @click=${this._onNext}
        aria-label="Next page"
      >
        ›
      </button>
    `;
  }
}
customElements.define("pagination-nav", Pagination);
