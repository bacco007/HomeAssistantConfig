import { LitElement, html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./analysis-checkbox.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Single checkbox with an optional `ha-tooltip` help popup.
 * @fires dp-change - `{ type: "check", checked: boolean }`
 */
export class AnalysisCheckbox extends LitElement {
  /** Whether the checkbox is checked. */
  @property({ type: Boolean }) accessor checked: boolean = false;

  /** Label text rendered next to the checkbox. */
  @property({ type: String }) accessor label: string = "";

  /** When true the checkbox is rendered but non-interactive. */
  @property({ type: Boolean }) accessor disabled: boolean = false;

  /** Tooltip content shown on hover; only rendered when non-empty. */
  @property({ type: String, attribute: "help-text" })
  accessor helpText: string = "";

  /** ID used to associate the tooltip with its trigger element. */
  @property({ type: String, attribute: "help-id" }) accessor helpId: string =
    "";

  static styles = styles;

  private _onChange(e: Event) {
    dispatchChange(this, {
      type: "check",
      checked: (e.target as HTMLInputElement).checked,
    });
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
