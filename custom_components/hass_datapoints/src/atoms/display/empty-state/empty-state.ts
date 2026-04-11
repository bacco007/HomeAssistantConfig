import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { styles } from "./empty-state.styles";

export class EmptyState extends LitElement {
  @property({ type: String }) accessor message = "";

  static styles = styles;

  render() {
    return html`<div class="empty-state">${this.message}</div>`;
  }
}
customElements.define("empty-state", EmptyState);
