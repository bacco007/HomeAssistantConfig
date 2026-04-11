import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./editor-entity-list.styles";
import type { HassLike } from "@/lib/types";

export class EditorEntityList extends LitElement {
  @property({ type: Array }) accessor entities: string[] = [];

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @property({ type: String, attribute: "button-label" })
  accessor buttonLabel: string = "Add entity";

  static styles = styles;

  _onRemove(index: number) {
    const next = [...this.entities];
    next.splice(index, 1);
    this.dispatchEvent(
      new CustomEvent("dp-entity-list-change", {
        detail: { entities: next },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onAdd() {
    this.dispatchEvent(
      new CustomEvent("dp-entity-list-change", {
        detail: { entities: [...this.entities, ""] },
        bubbles: true,
        composed: true,
      })
    );
  }

  _onEntityChange(index: number, e: CustomEvent<{ value: string }>) {
    const next = [...this.entities];
    next[index] = e.detail.value;
    this.dispatchEvent(
      new CustomEvent("dp-entity-list-change", {
        detail: { entities: next },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="list">
        ${this.entities.map(
          (entityId, i) => html`
            <div class="entity-row">
              <ha-selector
                .selector=${{ entity: {} }}
                .value=${entityId}
                .hass=${this.hass}
                @value-changed=${(e: CustomEvent<{ value: string }>) =>
                  this._onEntityChange(i, e)}
              ></ha-selector>
              <button
                class="remove-btn"
                data-action="remove"
                @click=${() => this._onRemove(i)}
                aria-label="Remove entity"
              ></button>
            </div>
          `
        )}
      </div>
      <div class="add-wrap">
        <ha-button outlined data-action="add" @click=${this._onAdd}>
          ${this.buttonLabel}
        </ha-button>
      </div>
    `;
  }
}
customElements.define("editor-entity-list", EditorEntityList);
