import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";
import { styles } from "./editor-entity-list.styles";
import { dispatchChange } from "@/lib/events";
import type { HassLike } from "@/lib/types";

const DEFAULT_I18N = createDefaultI18n(["Add entity", "Remove entity"]);

/**
 * Editable list of entity pickers with add/remove controls.
 * @fires dp-change - `{ type: "entity-list", value: string[] }` — full updated entity array
 */
export class EditorEntityList extends LitElement {
  /** Current list of entity IDs. */
  @property({ type: Array }) accessor entities: string[] = [];

  /** HA hass object forwarded to each `ha-selector`. */
  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  /** Label for the "add entity" button; falls back to the i18n default. */
  @property({ type: String, attribute: "button-label" })
  accessor buttonLabel: string = "";

  /** Localization strings; defaults to English `"Add entity"` / `"Remove entity"`. */
  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string): string {
    return t(this.i18n, key);
  }

  _onRemove(index: number) {
    const next = [...this.entities];
    next.splice(index, 1);
    dispatchChange(this, { type: "entity-list", value: next });
  }

  _onAdd() {
    dispatchChange(this, {
      type: "entity-list",
      value: [...this.entities, ""],
    });
  }

  _onEntityChange(index: number, e: CustomEvent<{ value: string }>) {
    const next = [...this.entities];
    next[index] = e.detail.value;
    dispatchChange(this, { type: "entity-list", value: next });
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
