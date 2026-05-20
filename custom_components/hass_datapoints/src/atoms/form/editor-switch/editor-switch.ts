import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-switch.styles";

export class EditorSwitch extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: Boolean }) accessor checked: boolean = false;

  @property({ type: String }) accessor tooltip: string = "";

  static styles = styles;

  _onChange(e: Event) {
    this.dispatchEvent(
      new CustomEvent("dp-switch-change", {
        detail: { checked: (e.target as HTMLInputElement).checked },
        bubbles: true,
        composed: true,
      })
    );
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
