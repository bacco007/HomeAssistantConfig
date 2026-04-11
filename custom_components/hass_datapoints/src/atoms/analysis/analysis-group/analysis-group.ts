import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./analysis-group.styles";

export class AnalysisGroup extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: Boolean }) accessor checked: boolean = false;

  @property({ type: Boolean }) accessor disabled: boolean = false;

  @property({ type: Boolean, attribute: "align-top" })
  accessor alignTop: boolean = false;

  static styles = styles;

  private _onChange(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    // Optimistically update local state so sub-options show/hide immediately,
    // before the parent propagates the new value back down via the property.
    this.checked = checked;
    this.dispatchEvent(
      new CustomEvent("dp-group-change", {
        detail: { checked },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    const groupClass = ["group", this.checked ? "is-open" : ""]
      .filter(Boolean)
      .join(" ");
    const optionClass = [
      "option",
      this.alignTop ? "top" : "",
      this.disabled ? "is-disabled" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class=${groupClass}>
        <label class=${optionClass}>
          <input
            type="checkbox"
            .checked=${this.checked}
            ?disabled=${this.disabled}
            @change=${this._onChange}
          />
          <span
            ><slot name="label">${this.label}</slot><slot name="hint"></slot
          ></span>
        </label>
        ${this.checked
          ? html`
              <div class="group-body">
                <slot></slot>
              </div>
            `
          : nothing}
      </div>
    `;
  }
}

customElements.define("analysis-group", AnalysisGroup);
