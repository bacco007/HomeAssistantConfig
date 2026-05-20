/**
 * Comparison preview overlay sub-component extracted from history-chart.ts.
 *
 * Displays the comparison window vs actual range labels.
 */

import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

@localized()
@customElement("history-chart-comparison-overlay")
export class HistoryChartComparisonOverlay extends LitElement {
  @property({ attribute: "window-label" })
  accessor windowRangeLabel = "";

  @property({ attribute: "actual-label" })
  accessor actualRangeLabel = "";

  @property({ type: Number, attribute: "left-offset" })
  accessor leftOffset: number | null = null;

  static override styles = css`
    :host {
      position: absolute;
      top: calc(var(--dp-chart-top-slot-height, 0px) + var(--dp-spacing-sm));
      left: var(--dp-spacing-md);
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-width: min(340px, calc(100% - (var(--dp-spacing-lg) * 2)));
      padding: 8px 12px;
      border-radius: 10px;
      background: color-mix(
        in srgb,
        var(--card-background-color, #fff) 90%,
        transparent
      );
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      backdrop-filter: blur(4px);
      pointer-events: none;
      z-index: 4;
    }
    :host([hidden]) {
      display: none;
    }
    .line {
      font-size: 0.74rem;
      line-height: 1.2;
      color: var(--secondary-text-color);
    }
    .line strong {
      color: color-mix(
        in srgb,
        var(--warning-color, #f59e0b) 72%,
        var(--primary-text-color, #111)
      );
      font-weight: 600;
    }
  `;

  override render() {
    if (!this.windowRangeLabel || !this.actualRangeLabel) return nothing;
    return html`
      <div class="line">
        <strong>${msg("Date window:")}</strong> ${this.windowRangeLabel}
      </div>
      <div class="line">
        <strong>${msg("Actual:")}</strong> ${this.actualRangeLabel}
      </div>
    `;
  }

  override updated() {
    if (this.leftOffset != null) {
      this.style.left = `${Math.max(8, this.leftOffset + 8)}px`;
    } else {
      this.style.left = "";
    }
    this.hidden = !this.windowRangeLabel || !this.actualRangeLabel;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "history-chart-comparison-overlay": HistoryChartComparisonOverlay;
  }
}
