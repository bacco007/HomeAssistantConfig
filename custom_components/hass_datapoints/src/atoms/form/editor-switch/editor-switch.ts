import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-switch.styles";
import { dispatchChange } from "@/lib/events";

/**
 * Labeled toggle switch for use in card editors.
 * @fires dp-change - `{ type: "switch", checked: boolean }`
 */
export class EditorSwitch extends LitElement {
  /** Label text displayed next to the switch. */
  @property({ type: String }) accessor label: string = "";

  /** Whether the switch is currently on. */
  @property({ type: Boolean }) accessor checked: boolean = false;

  /** Optional tooltip text shown as a hover overlay next to the label. */
  @property({ type: String }) accessor tooltip: string = "";

  static styles = styles;

  _onChange(e: Event) {
    dispatchChange(this, {
      type: "switch",
      checked: (e.target as HTMLInputElement).checked,
    });
  }

  render() {
    return html`
      <div class="switch-row">
        <ha-formfield .label=${this.label}>
          <ha-switch
            .checked=${this.checked}
            @change=${this._onChange}
          ></ha-switch>
        </ha-formfield>
        ${this.tooltip
          ? html`
              <span class="help-icon">
                ?
                <span class="help-tooltip">${this.tooltip}</span>
              </span>
            `
          : ""}
      </div>
    `;
  }
}
customElements.define("editor-switch", EditorSwitch);
