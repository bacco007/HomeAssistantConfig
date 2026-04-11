import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./page-menu-item.styles";

export class PageMenuItem extends LitElement {
  @property({ type: String }) accessor icon: string = "";

  @property({ type: String }) accessor label: string = "";

  @property({ type: Boolean }) accessor disabled: boolean = false;

  static styles = styles;

  _onClick() {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("dp-menu-action", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button type="button" ?disabled=${this.disabled} @click=${this._onClick}>
        <ha-icon icon="${this.icon}"></ha-icon>
        ${this.label}
      </button>
    `;
  }
}
customElements.define("page-menu-item", PageMenuItem);
