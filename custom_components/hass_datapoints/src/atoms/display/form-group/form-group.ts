import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./form-group.styles";

export class FormGroup extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: String }) accessor description: string = "";

  static styles = styles;

  render() {
    return html`
      <div class="form-group">
        ${this.label
          ? html`<div class="form-label">${this.label}</div>`
          : nothing}
        ${this.description
          ? html`<div class="form-help">${this.description}</div>`
          : nothing}
        <slot></slot>
      </div>
    `;
  }
}
customElements.define("form-group", FormGroup);
