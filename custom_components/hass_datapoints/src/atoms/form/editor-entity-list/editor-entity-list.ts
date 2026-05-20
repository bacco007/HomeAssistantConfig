import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./editor-entity-list.styles";
import type { HassLike } from "@/lib/types";

const DEFAULT_I18N = createDefaultI18n(["Add entity", "Remove entity"]);

export class EditorEntityList extends LitElement {
  @property({ type: Array }) accessor entities: string[] = [];

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  @property({ type: String, attribute: "button-label" })
  accessor buttonLabel: string = "";

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

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
    const buttonLabel = this.buttonLabel || this._t("Add entity");
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
                aria-label=${this._t("Remove entity")}
              ></button>
            </div>
          `
        )}
      </div>
      <div class="add-wrap">
        <ha-button outlined data-action="add" @click=${this._onAdd}>
          ${buttonLabel}
        </ha-button>
      </div>
    `;
  }
}
customElements.define("editor-entity-list", EditorEntityList);
