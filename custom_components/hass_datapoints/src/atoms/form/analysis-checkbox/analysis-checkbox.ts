import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./analysis-checkbox.styles";

export class AnalysisCheckbox extends LitElement {
  @property({ type: Boolean }) accessor checked: boolean = false;

  @property({ type: String }) accessor label: string = "";

  @property({ type: Boolean }) accessor disabled: boolean = false;

  @property({ type: String, attribute: "help-text" })
  accessor helpText: string = "";

  @property({ type: String, attribute: "help-id" }) accessor helpId: string =
    "";

  static styles = styles;

  private _onChange(e: Event) {
    const target = e.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent("dp-check-change", {
        detail: { checked: target.checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const labelClass = this.disabled ? "disabled" : "";
    const checkbox = html`
      <label class=${labelClass}>
        <input
          type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this._onChange}
        />
        <span>${this.label}</span>
        ${this.helpText
          ? html`<ha-tooltip
              .id=${this.helpId}
              .content=${this.helpText}
            ></ha-tooltip>`
          : nothing}
      </label>
    `;
    return checkbox;
  }
}

customElements.define("analysis-checkbox", AnalysisCheckbox);
