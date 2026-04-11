import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./drag-handle.styles";

export class DragHandle extends LitElement {
  @property({ type: String }) accessor label: string | undefined = undefined;

  static styles = styles;

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
        aria-label="${this.label || "Drag to reorder"}"
        @dragstart=${this._onDragStart}
        @dragend=${this._onDragEnd}
      >
        <ha-icon icon="mdi:drag-vertical"></ha-icon>
      </button>
    `;
  }
}
customElements.define("drag-handle", DragHandle);
