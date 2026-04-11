import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";

import { styles } from "./chart-legend.styles";
import type { SeriesItem } from "@/lib/types";
import "@/atoms/interactive/legend-item/legend-item";

export class ChartLegend extends LitElement {
  @property({ type: Array }) accessor series: SeriesItem[] = [];

  @property({ type: Object }) accessor hiddenSeries: Set<string> = new Set();

  @property({ type: Boolean, attribute: "wrap-rows" })
  accessor wrapRows: boolean = false;

  static styles = styles;

  _onToggle(entityId: string, e: CustomEvent<{ pressed: boolean }>) {
    this.dispatchEvent(
      new CustomEvent("dp-series-toggle", {
        detail: { entityId, visible: e.detail.pressed },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    return html`
      <div class="legend ${this.wrapRows ? "wrap-rows" : ""}">
        ${this.series.map(
          (s) => html`
            <legend-item
              .label=${s.label}
              .color=${s.color}
              .unit=${s.unit ?? ""}
              .pressed=${!this.hiddenSeries.has(s.entityId)}
              .opacity=${1}
              @dp-legend-toggle=${(e: CustomEvent<{ pressed: boolean }>) =>
                this._onToggle(s.entityId, e)}
            ></legend-item>
          `
        )}
      </div>
    `;
  }
}
customElements.define("chart-legend", ChartLegend);
