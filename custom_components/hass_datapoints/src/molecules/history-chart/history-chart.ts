/**
 * `history-chart` is a lightweight custom-element wrapper around
 * `hass-datapoints-history-card` that encapsulates config diffing and hass
 * propagation. It is intentionally a plain HTMLElement (no LitElement) so the
 * inner card is created **synchronously** — callers can access `chartEl`
 * immediately after `appendChild`.
 *
 * @property config  - Full chart config object; `setConfig` is called on the
 *                     inner card only when the serialized key changes.
 * @property hass    - HA hass object forwarded to the inner card.
 *
 * @fires hass-datapoints-chart-zoom  - Re-dispatched from the inner card
 * @fires hass-datapoints-chart-hover - Re-dispatched from the inner card
 *
 * @method setExternalZoomRange(range) - Delegates to the inner card
 * @property chartEl - Direct reference to the inner card element
 */
import type { CardConfig, HassLike } from "@/lib/types";

export class HistoryChart extends HTMLElement {
  // ── Internal state ─────────────────────────────────────────────────────────

  private _configKey = "";

  private _config: Nullable<CardConfig> = null;

  private _hass: Nullable<HassLike> = null;

  private _chartEl: Nullable<
    HTMLElement & {
      setConfig(cfg: CardConfig): void;
      setExternalZoomRange?(
        range: Nullable<{ start: number; end: number }>
      ): void;
      hass: Nullable<HassLike>;
    }
  > = null;

  // ── Construction ───────────────────────────────────────────────────────────

  connectedCallback() {
    if (!this._chartEl) {
      const card = document.createElement(
        "hass-datapoints-history-card"
      ) as unknown as HTMLElement & {
        setConfig(cfg: CardConfig): void;
        setExternalZoomRange?(
          range: Nullable<{ start: number; end: number }>
        ): void;
        hass: Nullable<HassLike>;
      };
      // Make the inner card fill the molecule's flex space.
      (card as HTMLElement).style.cssText =
        "flex:1 1 auto;min-width:0;min-height:0;width:100%;height:100%;";
      this.appendChild(card);
      this._chartEl = card;
      // Apply any config/hass that was set before connection.
      this._applyConfig();
      if (this._hass !== null && this._chartEl) {
        this._chartEl.hass = this._hass;
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Direct reference to the inner `hass-datapoints-history-card` element. */
  get chartEl() {
    return this._chartEl;
  }

  get config(): Nullable<CardConfig> {
    return this._config;
  }

  set config(value: Nullable<CardConfig>) {
    this._config = value;
    this._applyConfig();
  }

  get hass(): Nullable<HassLike> {
    return this._hass;
  }

  set hass(value: Nullable<HassLike>) {
    this._hass = value;
    if (this._chartEl) {
      this._chartEl.hass = value;
    }
  }

  /**
   * Passes an external committed zoom range to the inner card.
   */
  setExternalZoomRange(range: Nullable<{ start: number; end: number }>) {
    this._chartEl?.setExternalZoomRange?.(range);
  }

  // ── Internal helpers ───────────────────────────────────────────────────────

  private _applyConfig() {
    if (!this._chartEl || !this._config) return;
    const nextKey = JSON.stringify(this._config);
    if (nextKey !== this._configKey) {
      this._chartEl.setConfig(this._config);
      this._configKey = nextKey;
    }
  }
}

customElements.define("history-chart", HistoryChart);

declare global {
  interface HTMLElementTagNameMap {
    "history-chart": HistoryChart;
  }
}
