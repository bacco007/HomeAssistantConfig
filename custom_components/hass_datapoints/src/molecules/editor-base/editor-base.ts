import { CSSResultGroup, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { localized } from "@/lib/i18n/localize";

import { styles } from "./editor-base.styles";
import type { CardConfig, HassLike } from "@/lib/types";
/**
 * EditorBase — Lit base class for all card editors.
 *
 * Subclasses override `render()` to compose form atoms.
 * Provides `_set(key, value)` and `_fire(config)` for config updates.
 */
@localized()
export class EditorBase extends LitElement {
  @state() accessor _config: CardConfig = {};

  @property({ type: Object }) accessor hass: Nullable<HassLike> = null;

  static styles: CSSResultGroup = styles;

  setConfig(config: CardConfig): void {
    this._config = { ...config };
  }

  _fire(cfg: CardConfig): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...cfg } },
        bubbles: true,
        composed: true,
      })
    );
  }

  _set(key: string, value: unknown): void {
    const cfg = { ...this._config };
    if (value === "" || value === null || value === undefined) {
      delete cfg[key];
    } else {
      cfg[key] = value;
    }
    this._config = cfg;
    this._fire(cfg);
  }
}
customElements.define("editor-base", EditorBase);
