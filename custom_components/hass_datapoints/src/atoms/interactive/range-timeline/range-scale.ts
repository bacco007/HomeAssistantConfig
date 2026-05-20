import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t as translate } from "@/lib/i18n/i18n-prop";

import { styles } from "./range-scale.styles";
import type { RangeBounds } from "./types";
import {
  computeRangeLabelStride,
  getRangeUnitAnchorMs,
} from "./lib/range-scale-math";
import type { RangeUnit, ZoomLevel } from "@/lib/timeline/timeline-scale";
import {
  addUnit,
  formatContextLabel,
  formatPeriodSelectionLabel,
  formatScaleLabel,
  RANGE_CONTEXT_LABEL_MIN_GAP_PX,
  RANGE_LABEL_MIN_GAP_PX,
  startOfUnit,
} from "@/lib/timeline/timeline-scale";

const DEFAULT_I18N = createDefaultI18n(["Select"]);

interface TickMark {
  leftPct: number;
  className: string;
}

interface PeriodButton {
  leftPct: number;
  text: string;
  title: string;
  className: string;
  unit: RangeUnit;
  startTime: Date;
}

interface ContextDivider {
  leftPct: number;
}

/**
 * `range-scale` renders the tick marks, scale labels, and context dividers
 * for a range-timeline. All rendering is declarative via Lit templates.
 *
 * @fires dp-scale-period-select - `{ unit, startTime, originalEvent }` period button clicked
 * @fires dp-scale-period-hover  - `{ unit, start, end }` period button hovered/focused
 * @fires dp-scale-period-leave  - `{ unit, start, end }` period button left/blurred
 */
export class RangeScale extends LitElement {
  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  @property({ type: Object }) accessor rangeBounds: Nullable<RangeBounds> =
    null;

  @property({ type: String }) accessor zoomLevel: string = "day";

  @property({ type: Number }) accessor contentWidth: number = 0;

  @property({ type: String }) accessor locale: string = "";

  static styles = styles;

  private _t(key: string, ...values: Array<string | number>): string {
    return translate(this.i18n, key, ...values);
  }

  render() {
    if (!this.rangeBounds) {
      return nothing;
    }

    const ticks = this._computeTicks();
    const labels = this._computeLabels();
    const { dividers, contextLabels } = this._computeContext();

    return html`
      <div class="range-context-layer">
        ${dividers.map(
          (d) =>
            html`<span class="range-divider" style="left:${d.leftPct}%"></span>`
        )}
        ${contextLabels.map((b) => this._renderPeriodButton(b))}
      </div>
      <div class="range-tick-layer">
        ${ticks.map(
          (t) =>
            html`<span
              class="range-tick ${t.className}"
              style="left:${t.leftPct}%"
            ></span>`
        )}
      </div>
      <div class="range-label-layer">
        ${labels.map((b) => this._renderPeriodButton(b))}
      </div>
    `;
  }

  private _renderPeriodButton(b: PeriodButton) {
    return html`<button
      type="button"
      class="range-period-button ${b.className}"
      style="left:${b.leftPct}%"
      title=${b.title}
      aria-label=${b.title}
      @click=${(ev: MouseEvent) => this._onPeriodSelect(b, ev)}
      @pointerenter=${() => this._onPeriodHover(b)}
      @pointerleave=${() => this._onPeriodLeave(b)}
      @focus=${() => this._onPeriodHover(b)}
      @blur=${() => this._onPeriodLeave(b)}
    >
      ${b.text}
    </button>`;
  }

  // ---------------------------------------------------------------------------
  // Computation
  // ---------------------------------------------------------------------------

  private _getScaleLabelZoomLevel(): ZoomLevel {
    if (this.zoomLevel === "quarterly" || this.zoomLevel === "month_short") {
      return this.zoomLevel;
    }
    return "";
  }

  private _computeTicksForUnit(
    unit: RangeUnit,
    className: string,
    total: number,
    step = 1
  ): TickMark[] {
    if (!this.rangeBounds) {
      return [];
    }
    const marks: TickMark[] = [];
    let markerTime = addUnit(
      startOfUnit(new Date(this.rangeBounds.min), unit),
      unit,
      0
    );
    if (markerTime.getTime() < this.rangeBounds.min) {
      markerTime = addUnit(markerTime, unit, step);
    }
    while (markerTime.getTime() < this.rangeBounds.max) {
      marks.push({
        leftPct: ((markerTime.getTime() - this.rangeBounds.min) / total) * 100,
        className,
      });
      markerTime = addUnit(markerTime, unit, step);
    }
    return marks;
  }

  private _computeTicks(): TickMark[] {
    if (!this.rangeBounds) {
      return [];
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const { config } = this.rangeBounds;
    const ticks: TickMark[] = [];

    if (
      config.detailUnit &&
      config.detailUnit !== config.minorUnit &&
      config.detailUnit !== config.majorUnit
    ) {
      ticks.push(
        ...this._computeTicksForUnit(
          config.detailUnit,
          "fine",
          total,
          config.detailStep || 1
        )
      );
    }
    if (config.minorUnit !== config.majorUnit) {
      ticks.push(...this._computeTicksForUnit(config.minorUnit, "", total));
    }
    ticks.push(...this._computeTicksForUnit(config.majorUnit, "major", total));
    return ticks;
  }

  private _computeLabelStride(
    unit: RangeUnit,
    formatter: (d: Date) => string,
    className: string,
    minGap: number
  ): number {
    if (!this.rangeBounds || !this.contentWidth) {
      return 1;
    }
    return computeRangeLabelStride(
      this.rangeBounds.min,
      this.rangeBounds.max,
      this.contentWidth,
      unit,
      formatter,
      className,
      minGap
    );
  }

  private _computeLabels(): PeriodButton[] {
    if (!this.rangeBounds) {
      return [];
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const { config } = this.rangeBounds;
    const scaleLabelZoomLevel = this._getScaleLabelZoomLevel();
    const locale = this.locale || undefined;

    const stride =
      config.labelUnit === "month" || config.labelUnit === "day"
        ? 1
        : this._computeLabelStride(
            config.labelUnit,
            (value) =>
              formatScaleLabel(
                value,
                config.labelUnit,
                scaleLabelZoomLevel,
                locale
              ),
            "range-scale-label",
            RANGE_LABEL_MIN_GAP_PX
          );

    const buttons: PeriodButton[] = [];
    let ref = startOfUnit(new Date(this.rangeBounds.min), config.labelUnit);
    let index = 0;
    while (ref.getTime() < this.rangeBounds.max) {
      if (index % stride === 0) {
        const leftValue = getRangeUnitAnchorMs(
          ref,
          config.labelUnit,
          this.rangeBounds.min,
          this.rangeBounds.max,
          "auto"
        );
        const text = formatScaleLabel(
          ref,
          config.labelUnit,
          scaleLabelZoomLevel,
          locale
        );
        const selectionLabel = formatPeriodSelectionLabel(
          ref,
          config.labelUnit,
          locale
        );
        buttons.push({
          leftPct: ((leftValue - this.rangeBounds.min) / total) * 100,
          text,
          title: `${this._t("Select")} ${selectionLabel}`,
          className: "range-scale-label",
          unit: config.labelUnit,
          startTime: new Date(ref),
        });
      }
      ref = addUnit(ref, config.labelUnit, 1);
      index += 1;
    }
    return buttons;
  }

  private _computeContext(): {
    dividers: ContextDivider[];
    contextLabels: PeriodButton[];
  } {
    if (!this.rangeBounds) {
      return { dividers: [], contextLabels: [] };
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const { config } = this.rangeBounds;
    const locale = this.locale || undefined;

    const stride =
      config.contextUnit === "month" || config.contextUnit === "day"
        ? 1
        : this._computeLabelStride(
            config.contextUnit,
            (value) => formatContextLabel(value, config.contextUnit, locale),
            "range-context-label",
            RANGE_CONTEXT_LABEL_MIN_GAP_PX
          );

    const dividers: ContextDivider[] = [];
    const contextLabels: PeriodButton[] = [];

    let ref = startOfUnit(new Date(this.rangeBounds.min), config.contextUnit);
    if (ref.getTime() < this.rangeBounds.min) {
      ref = addUnit(ref, config.contextUnit, 1);
    }
    let index = 0;
    while (ref.getTime() < this.rangeBounds.max) {
      const leftPct = ((ref.getTime() - this.rangeBounds.min) / total) * 100;
      dividers.push({ leftPct });

      if (index % stride === 0) {
        const text = formatContextLabel(ref, config.contextUnit, locale);
        const selectionLabel = formatPeriodSelectionLabel(
          ref,
          config.contextUnit,
          locale
        );
        contextLabels.push({
          leftPct,
          text,
          title: `${this._t("Select")} ${selectionLabel}`,
          className: "range-context-label",
          unit: config.contextUnit,
          startTime: new Date(ref),
        });
      }
      ref = addUnit(ref, config.contextUnit, 1);
      index += 1;
    }
    return { dividers, contextLabels };
  }

  // ---------------------------------------------------------------------------
  // Event dispatching
  // ---------------------------------------------------------------------------

  private _onPeriodSelect(b: PeriodButton, ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("dp-scale-period-select", {
        detail: { unit: b.unit, startTime: b.startTime, originalEvent: ev },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onPeriodHover(b: PeriodButton) {
    this.dispatchEvent(
      new CustomEvent("dp-scale-period-hover", {
        detail: { unit: b.unit, startTime: b.startTime },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _onPeriodLeave(b: PeriodButton) {
    this.dispatchEvent(
      new CustomEvent("dp-scale-period-leave", {
        detail: { unit: b.unit, startTime: b.startTime },
        bubbles: true,
        composed: true,
      })
    );
  }
}
customElements.define("range-scale", RangeScale);
