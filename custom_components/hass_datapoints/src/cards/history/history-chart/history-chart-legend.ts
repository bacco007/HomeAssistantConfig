/**
 * Legend sub-component extracted from history-chart.ts.
 *
 * Renders series legend chips with visibility toggle buttons.
 * Dispatches `dp-legend-toggle` events when items are clicked.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export interface LegendItem {
  entityId: string;
  label: string;
  color: string;
}

/**
 * @fires dp-legend-toggle - `{ entityId: string }` when a legend item is toggled.
 */
@customElement("history-chart-legend")
export class HistoryChartLegend extends LitElement {
  @property({ type: Array })
  accessor items: LegendItem[] = [];

  @property({ attribute: false })
  accessor hiddenSeries: Set<string> = new Set();

  @property({ type: Boolean, reflect: true, attribute: "wrap-rows" })
  accessor wrapRows = false;

  static override styles = css`
    :host {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: var(--dp-spacing-sm, 6px);
      padding: var(--dp-spacing-sm, 6px) var(--dp-spacing-md, 12px)
        var(--dp-spacing-md, 12px);
      padding-left: calc(
        var(--dp-spacing-md, 12px) + var(--dp-chart-axis-left-width, 0px)
      );
      padding-right: max(
        var(--dp-spacing-md, 12px),
        var(--dp-chart-axis-right-width, 0px)
      );
      flex: 0 0 auto;
      border-top: 1px solid
        color-mix(
          in srgb,
          var(--divider-color, rgba(0, 0, 0, 0.12)) 88%,
          transparent
        );
      min-width: 0;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    :host([wrap-rows]) {
      flex-wrap: wrap;
      align-items: flex-start;
      overflow-x: hidden;
      overflow-y: auto;
      max-height: calc((30px * 3) + (var(--dp-spacing-sm, 6px) * 2));
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: calc(var(--spacing, 8px) * 0.625);
      font-size: 0.78em;
      color: var(--secondary-text-color);
      flex: 0 0 auto;
    }
    :host([wrap-rows]) .legend-item {
      max-width: 100%;
    }
    .legend-toggle {
      display: inline-flex;
      align-items: center;
      gap: calc(var(--spacing, 8px) * 0.625);
      border: 0;
      padding: calc(var(--spacing, 8px) * 0.375) var(--dp-spacing-sm, 6px);
      background: none;
      font: inherit;
      line-height: 1.2;
      text-align: left;
      cursor: pointer;
      border-radius: 999px;
      transition:
        opacity 120ms ease,
        color 120ms ease,
        background-color 120ms ease;
      white-space: nowrap;
    }
    .legend-toggle:hover,
    .legend-toggle:focus-visible {
      color: var(--primary-text-color);
      background: color-mix(
        in srgb,
        var(--primary-text-color, #111) 6%,
        transparent
      );
      outline: none;
    }
    .legend-toggle[aria-pressed="false"] {
      opacity: 0.45;
    }
    .legend-line {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      flex: 0 0 12px;
    }
    .legend-label {
      display: inline-block;
      min-width: 0;
    }
  `;

  override render() {
    if (!this.items.length) return nothing;
    return this.items.map((item) => {
      const hidden = this.hiddenSeries.has(item.entityId);
      return html`
        <div class="legend-item">
          <button
            type="button"
            class="legend-toggle"
            aria-pressed="${hidden ? "false" : "true"}"
            @click=${() => this._handleToggle(item.entityId)}
          >
            <span class="legend-line" style="background:${item.color}"></span>
            <span class="legend-label">${item.label}</span>
          </button>
        </div>
      `;
    });
  }

  private _handleToggle(entityId: string) {
    this.dispatchEvent(
      new CustomEvent("dp-legend-toggle", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "history-chart-legend": HistoryChartLegend;
  }
}
