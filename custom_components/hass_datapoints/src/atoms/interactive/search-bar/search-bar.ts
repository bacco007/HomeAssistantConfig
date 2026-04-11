import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./search-bar.styles";

export class SearchBar extends LitElement {
  @property({ type: String }) accessor query: string = "";

  @property({ type: String }) accessor placeholder: string = "Search...";

  static styles = styles;

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
    return html`
      <div class="search-wrap">
        <input
          type="text"
          .value=${this.query}
          placeholder=${this.placeholder}
          @input=${this._onInput}
        />
      </div>
    `;
  }
}
customElements.define("search-bar", SearchBar);
