import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./quick-annotation.styles";

export class CardQuickAnnotation extends LitElement {
  static styles = styles;

  @property({ type: String }) accessor label = "Annotation";

  @property({ type: String }) accessor placeholder =
    "Detailed note shown on chart hover…";

  @property({ type: String }) accessor value = "";

  private _onInput(event: Event): void {
    this.value = (event.currentTarget as HTMLTextAreaElement).value;
    this.dispatchEvent(
      new CustomEvent("dp-annotation-input", {
        detail: {
          value: this.value,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="annotation-row">
        <label class="annotation-label" for="ann">${this.label}</label>
        <textarea
          id="ann"
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${this._onInput}
        ></textarea>
      </div>
    `;
  }
}

customElements.define("quick-annotation", CardQuickAnnotation);
