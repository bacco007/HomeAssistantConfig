import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./search-bar.styles";

const DEFAULT_I18N = createDefaultI18n(["Search..."]);

export class SearchBar extends LitElement {
  @property({ type: String }) accessor query: string = "";

  @property({ type: String }) accessor placeholder: string = "";

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

  _onInput(e: Event) {
    this.dispatchEvent(
      new CustomEvent("dp-search", {
        detail: { query: (e.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const placeholder = this.placeholder || this._t("Search...");
    return html`
      <div class="search-wrap">
        <input
          type="text"
          .value=${this.query}
          placeholder=${placeholder}
          @input=${this._onInput}
        />
      </div>
    `;
  }
}
customElements.define("search-bar", SearchBar);
