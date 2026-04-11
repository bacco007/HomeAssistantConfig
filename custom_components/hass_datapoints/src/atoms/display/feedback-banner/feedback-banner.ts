import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./feedback-banner.styles";

export class FeedbackBanner extends LitElement {
  static styles = styles;

  @property({ type: String }) accessor kind = "";

  @property({ type: String }) accessor text = "";

  @property({ type: Boolean }) accessor visible = false;

  @property({ type: String }) accessor variant = "default";

  render() {
    if (!this.text) {
      return nothing;
    }

    return html`
      <div
        part="feedback"
        class="feedback ${this.kind} ${this.visible ? "visible" : ""} ${this
          .variant}"
      >
        ${this.text}
      </div>
    `;
  }
}

customElements.define("feedback-banner", FeedbackBanner);
