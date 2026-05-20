import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./drag-handle.styles";

const DEFAULT_I18N = createDefaultI18n(["Drag to reorder"]);

export class DragHandle extends LitElement {
  @property({ type: String }) accessor label: string | undefined = undefined;

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

  _onDragStart() {
    this.dispatchEvent(
      new CustomEvent("dp-drag-start", {
        bubbles: true,
        composed: true,
      })
    );
  }

  _onDragEnd() {
    this.dispatchEvent(
      new CustomEvent("dp-drag-end", {
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <button
        type="button"
        draggable="true"
        aria-label="${this.label || this._t("Drag to reorder")}"
        @dragstart=${this._onDragStart}
        @dragend=${this._onDragEnd}
      >
        <ha-icon icon="mdi:drag-vertical"></ha-icon>
      </button>
    `;
  }
}
customElements.define("drag-handle", DragHandle);
