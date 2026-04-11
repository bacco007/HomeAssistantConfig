import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./section-heading.styles";

export class SectionHeading extends LitElement {
  @property({ type: String }) accessor text: string = "";

  static styles = styles;

  render() {
    return html`<div class="heading">${this.text}</div>`;
  }
}
customElements.define("section-heading", SectionHeading);
