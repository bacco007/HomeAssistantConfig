import { LitElement, html } from "lit";
import { property, state } from "lit/decorators.js";

import { styles } from "./panel-timeline.styles";
import type { EventMarker } from "./types";
import type { RangeBounds } from "@/atoms/interactive/range-timeline/types";
import "@/atoms/interactive/range-timeline/range-timeline";
import { clampNumber } from "@/lib/timeline/timeline-scale";

/**
 * `panel-timeline` is a panel-history-specific wrapper around `range-timeline`.
 *
 * It adds the overlay layers (hover preview, comparison preview, zoom highlights,
 * chart hover lines, event dots) via named slots, keeping the core slider atom
 * free of panel-specific state.
 *
 * All `dp-range-*` events from the inner atom bubble through naturally.
 *
 * @fires dp-range-draft         - Bubbled from inner range-timeline
 * @fires dp-range-commit        - Bubbled from inner range-timeline
 * @fires dp-range-period-select - Bubbled from inner range-timeline
 * @fires dp-range-period-hover  - Bubbled from inner range-timeline
 * @fires dp-range-period-leave  - Bubbled from inner range-timeline
 * @fires dp-range-scroll        - Bubbled from inner range-timeline
 */
export class PanelTimeline extends LitElement {
  @property({ type: Object }) accessor startTime: Nullable<Date> = null;

  @property({ type: Object }) accessor endTime: Nullable<Date> = null;

  @property({ type: Object }) accessor rangeBounds: Nullable<RangeBounds> =
    null;

  @property({ type: String }) accessor zoomLevel: string = "day";

  @property({ type: String }) accessor dateSnapping: string = "auto";

  @property({ type: Boolean }) accessor isLiveEdge: boolean = false;

  @property({ type: String }) accessor locale: string = "";

  @state() accessor hoveredPeriodRange: Nullable<{
    start: number;
    end: number;
  }> = null;

  @property({ type: Object }) accessor comparisonPreview: Nullable<{
    start: number;
    end: number;
  }> = null;

  @property({ type: Object }) accessor zoomRange: Nullable<{
    start: number;
    end: number;
  }> = null;

  @property({ type: Object }) accessor zoomWindowRange: Nullable<{
    start: number;
    end: number;
  }> = null;

  @property({ type: Number }) accessor chartHoverTimeMs: Nullable<number> =
    null;

  @property({ type: Number })
  accessor chartHoverWindowTimeMs: Nullable<number> = null;

  @property({ type: Array }) accessor events: EventMarker[] = [];

  static styles = styles;

  // Cached overlay DOM refs (set in firstUpdated)
  _rangeHoverPreviewEl: Nullable<HTMLElement> = null;

  _rangeComparisonPreviewEl: Nullable<HTMLElement> = null;

  _rangeZoomHighlightEl: Nullable<HTMLElement> = null;

  _rangeZoomWindowHighlightEl: Nullable<HTMLElement> = null;

  _rangeChartHoverLineEl: Nullable<HTMLElement> = null;

  _rangeChartHoverWindowLineEl: Nullable<HTMLElement> = null;

  _rangeEventLayerEl: Nullable<HTMLElement> = null;

  private _liveZoomRange: Nullable<{ start: number; end: number }> | undefined =
    undefined;

  private _liveZoomWindowRange:
    | Nullable<{ start: number; end: number }>
    | undefined = undefined;

  firstUpdated() {
    const sr = this.shadowRoot!;
    this._rangeHoverPreviewEl = sr.getElementById("range-hover-preview");
    this._rangeComparisonPreviewEl = sr.getElementById(
      "range-comparison-preview"
    );
    this._rangeZoomHighlightEl = sr.getElementById("range-zoom-highlight");
    this._rangeZoomWindowHighlightEl = sr.getElementById(
      "range-zoom-window-highlight"
    );
    this._rangeChartHoverLineEl = sr.getElementById("range-chart-hover-line");
    this._rangeChartHoverWindowLineEl = sr.getElementById(
      "range-chart-hover-window-line"
    );
    this._rangeEventLayerEl = sr.getElementById("range-event-layer");

    this._syncAllOverlays();
  }

  updated(changed: Map<string, unknown>) {
    const trackProps = [
      "hoveredPeriodRange",
      "comparisonPreview",
      "zoomRange",
      "zoomWindowRange",
      "rangeBounds",
    ];
    const timelineProps = [
      "chartHoverTimeMs",
      "chartHoverWindowTimeMs",
      "events",
      "rangeBounds",
    ];

    if (trackProps.some((p) => changed.has(p))) {
      if (changed.has("zoomRange")) {
        this._liveZoomRange = this.zoomRange ?? null;
      }
      if (changed.has("zoomWindowRange")) {
        this._liveZoomWindowRange = this.zoomWindowRange ?? null;
      }
      this._syncTrackOverlays();
    }
    if (timelineProps.some((p) => changed.has(p))) {
      this._syncTimelineOverlays();
    }
  }

  render() {
    return html`
      <range-timeline
        .startTime=${this.startTime}
        .endTime=${this.endTime}
        .rangeBounds=${this.rangeBounds}
        .zoomLevel=${this.zoomLevel}
        .dateSnapping=${this.dateSnapping}
        .isLiveEdge=${this.isLiveEdge}
        .locale=${this.locale}
        @dp-range-period-hover=${this._onPeriodHoverInternal}
        @dp-range-period-leave=${this._onPeriodLeaveInternal}
      >
        <!-- track overlays: positioned inside .range-track of range-timeline -->
        <div
          slot="track-overlays"
          id="range-hover-preview"
          class="range-hover-preview"
        ></div>
        <div
          slot="track-overlays"
          id="range-comparison-preview"
          class="range-comparison-preview"
        ></div>
        <div
          slot="track-overlays"
          id="range-zoom-highlight"
          class="range-zoom-highlight"
        ></div>
        <div
          slot="track-overlays"
          id="range-zoom-window-highlight"
          class="range-zoom-window-highlight"
        ></div>
        <!-- timeline overlays: positioned inside .range-timeline of range-timeline -->
        <div
          slot="timeline-overlays"
          id="range-chart-hover-line"
          class="range-chart-hover-line"
          aria-hidden="true"
        ></div>
        <div
          slot="timeline-overlays"
          id="range-chart-hover-window-line"
          class="range-chart-hover-window-line"
          aria-hidden="true"
        ></div>
        <div
          slot="timeline-overlays"
          id="range-event-layer"
          class="range-event-layer"
        ></div>
      </range-timeline>
    `;
  }

  // ---------------------------------------------------------------------------
  // Coordinate helper
  // ---------------------------------------------------------------------------

  _pct(ms: number): number {
    if (!this.rangeBounds) return 0;
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    return ((ms - this.rangeBounds.min) / total) * 100;
  }

  // ---------------------------------------------------------------------------
  // Internal period hover handling (from dp-range-period-hover/leave events
  // bubbling up from the inner range-timeline atom)
  // ---------------------------------------------------------------------------

  revealSelection() {
    const timeline = this.shadowRoot?.querySelector(
      "range-timeline"
    ) as HTMLElement & { revealSelection?: () => void };
    timeline?.revealSelection?.();
  }

  syncZoomHighlights(
    zoomRange: Nullable<{ start: number; end: number }>,
    zoomWindowRange: Nullable<{ start: number; end: number }>
  ) {
    this._liveZoomRange = zoomRange ? { ...zoomRange } : null;
    this._liveZoomWindowRange = zoomWindowRange ? { ...zoomWindowRange } : null;
    this._setRangeOverlay(this._rangeZoomHighlightEl, this._liveZoomRange);
    this._setRangeOverlay(
      this._rangeZoomWindowHighlightEl,
      this._liveZoomWindowRange
    );
  }

  _onPeriodHoverInternal(ev: CustomEvent) {
    const { start, end } = ev.detail as { start: Date; end: Date };
    this.hoveredPeriodRange = { start: start.getTime(), end: end.getTime() };
  }

  _onPeriodLeaveInternal() {
    this.hoveredPeriodRange = null;
  }

  // ---------------------------------------------------------------------------
  // Overlay sync
  // ---------------------------------------------------------------------------

  _syncAllOverlays() {
    this._syncTrackOverlays();
    this._syncTimelineOverlays();
  }

  _setRangeOverlay(
    el: Nullable<HTMLElement>,
    range: Nullable<{ start: number; end: number }>
  ) {
    if (!el) return;
    if (!range || !this.rangeBounds) {
      el.classList.remove("visible");
      return;
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const startClamped = clampNumber(
      range.start,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    const endClamped = clampNumber(
      range.end,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    const startPct = ((startClamped - this.rangeBounds.min) / total) * 100;
    const endPct = ((endClamped - this.rangeBounds.min) / total) * 100;
    el.style.left = `${startPct}%`;
    el.style.width = `${Math.max(0, endPct - startPct)}%`;
    el.classList.add("visible");
  }

  _setHoverLine(el: Nullable<HTMLElement>, timeMs: Nullable<number>) {
    if (!el) return;
    if (timeMs == null || !this.rangeBounds) {
      el.classList.remove("visible");
      return;
    }
    const clamped = clampNumber(
      timeMs,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    el.style.left = `${this._pct(clamped)}%`;
    el.classList.add("visible");
  }

  _syncTrackOverlays() {
    const zoomRange =
      this._liveZoomRange !== undefined
        ? this._liveZoomRange
        : (this.zoomRange ?? null);
    const zoomWindowRange =
      this._liveZoomWindowRange !== undefined
        ? this._liveZoomWindowRange
        : (this.zoomWindowRange ?? null);
    this._setRangeOverlay(
      this._rangeHoverPreviewEl,
      this.hoveredPeriodRange ?? null
    );
    this._setRangeOverlay(
      this._rangeComparisonPreviewEl,
      this.comparisonPreview ?? null
    );
    this._setRangeOverlay(this._rangeZoomHighlightEl, zoomRange);
    this._setRangeOverlay(this._rangeZoomWindowHighlightEl, zoomWindowRange);
  }

  _syncTimelineOverlays() {
    this._setHoverLine(
      this._rangeChartHoverLineEl,
      this.chartHoverTimeMs ?? null
    );
    this._setHoverLine(
      this._rangeChartHoverWindowLineEl,
      this.chartHoverWindowTimeMs ?? null
    );
    this._syncEventLayer();
  }

  _syncEventLayer() {
    if (!this._rangeEventLayerEl || !this.rangeBounds) return;
    this._rangeEventLayerEl.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    for (const event of this.events) {
      const timestamp = new Date(event.timestamp as string).getTime();
      if (
        !Number.isFinite(timestamp) ||
        timestamp < this.rangeBounds.min ||
        timestamp > this.rangeBounds.max
      )
        continue;
      const dot = document.createElement("span");
      dot.className = "range-event-dot";
      dot.style.left = `${((timestamp - this.rangeBounds.min) / total) * 100}%`;
      dot.style.background = event.color ?? "#03a9f4";
      fragment.appendChild(dot);
    }
    this._rangeEventLayerEl.appendChild(fragment);
  }
}

customElements.define("panel-timeline", PanelTimeline);
