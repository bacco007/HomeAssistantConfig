import { LitElement, html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-switch.styles";

type HaFormField = HTMLElement & { label?: string };
type HaSwitch = HTMLElement & { checked?: boolean };
export class EditorSwitch extends LitElement {
  @property({ type: String }) accessor label: string = "";

  @property({ type: Boolean }) accessor checked: boolean = false;

  @property({ type: String }) accessor tooltip: string = "";

  static styles = styles;

  firstUpdated() {
    const ff = this.shadowRoot!.querySelector(
      "ha-formfield"
    ) as Nullable<HaFormField>;
    if (ff) {
      ff.label = this.label;
    }
    const sw = this.shadowRoot!.querySelector(
      "ha-switch"
    ) as Nullable<HaSwitch>;
    if (sw) {
      sw.checked = this.checked;
    }
  }

  updated(changedProps: PropertyValues) {
    if (changedProps.has("checked")) {
      const sw = this.shadowRoot!.querySelector(
        "ha-switch"
      ) as Nullable<HaSwitch>;
      if (sw) {
        sw.checked = this.checked;
      }
    }
    if (changedProps.has("label")) {
      const ff = this.shadowRoot!.querySelector(
        "ha-formfield"
      ) as Nullable<HaFormField>;
      if (ff) {
        ff.label = this.label;
      }
    }
  }

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
        <ha-formfield>
          <ha-switch @change=${this._onChange}></ha-switch>
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
