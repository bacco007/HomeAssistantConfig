import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { localized, msg } from "@/lib/i18n/localize";

import { styles } from "./range-timeline.styles";
import type { RangeBounds } from "./types";
import "@/atoms/interactive/range-handle/range-handle";
import {
  RANGE_ZOOM_CONFIGS,
  RANGE_LABEL_MIN_GAP_PX,
  RANGE_CONTEXT_LABEL_MIN_GAP_PX,
  RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
  RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX,
  SECOND_MS,
  addUnit,
  startOfUnit,
  endOfUnit,
  clampNumber,
  snapDateToUnit,
  formatRangeDateTime,
  formatScaleLabel,
  formatContextLabel,
  formatPeriodSelectionLabel,
} from "@/lib/timeline/timeline-scale";
import type {
  RangeUnit,
  RangeZoomConfig,
  ZoomLevel,
} from "@/lib/timeline/timeline-scale";

/**
 * `range-timeline` is a scrollable, interactive time range slider atom.
 *
 * The parent provides `startTime`, `endTime`, `rangeBounds` (pre-derived), the
 * effective `zoomLevel` (already resolved from "auto"), and `dateSnapping`.
 * Panel-specific overlays (hover preview, comparison preview, chart hover lines)
 * are injected via named slots:
 *
 * - `timeline-overlays` — inside `.range-timeline`, for chart hover lines / event dots
 * - `track-overlays`    — inside `.range-track`, for comparison/zoom/hover highlights
 *
 * @fires dp-range-draft         - `{ start, end }` fired on each drag frame for auto-zoom
 * @fires dp-range-commit        - `{ start, end, push }` fired when range is committed
 * @fires dp-range-period-select - `{ unit, startTime }` period button clicked
 * @fires dp-range-period-hover  - `{ start, end }` period button hovered
 * @fires dp-range-period-leave  - `{}` period button left
 * @fires dp-range-scroll        - `{}` timeline scrolled
 */
@localized()
export class RangeTimeline extends LitElement {
  @property({ type: Object }) accessor startTime: Nullable<Date> = null;

  @property({ type: Object }) accessor endTime: Nullable<Date> = null;

  @property({ type: Object }) accessor rangeBounds: Nullable<RangeBounds> =
    null;

  @property({ type: String }) accessor zoomLevel: string = "day";

  @property({ type: String }) accessor dateSnapping: string = "auto";

  @property({ type: Boolean }) accessor isLiveEdge: boolean = false;

  @property({ type: String }) accessor locale: string = "";

  static styles = styles;

  // --- Internal drag state ---
  _draftStartTime: Nullable<Date> = null;

  _draftEndTime: Nullable<Date> = null;

  _activeRangeHandle: Nullable<"start" | "end"> = null;

  _hoveredRangeHandle: Nullable<"start" | "end"> = null;

  _focusedRangeHandle: Nullable<"start" | "end"> = null;

  _hoveredPeriodRange: Nullable<{
    unit: RangeUnit;
    start: number;
    end: number;
  }> = null;

  _rangePointerId: Nullable<number> = null;

  _rangeInteractionActive = false;

  _rangeContentWidth = 0;

  _rangeCommitTimer: Nullable<number> = null;

  // Scrollbar visibility state
  _isProgrammaticScroll = false;

  _scrollbarHideTimer: Nullable<number> = null;

  // Timeline pan/select state
  _timelinePointerId: Nullable<number> = null;

  _timelinePointerStartX = 0;

  _timelinePointerStartScrollLeft = 0;

  _timelinePointerStartTimestamp: Nullable<number> = null;

  _timelinePointerMode: Nullable<"pan" | "selection" | "interval_select"> =
    null;

  _timelineDragStartRangeMs = 0;

  _timelineDragEndRangeMs = 0;

  _timelineDragStartZoomRange: Nullable<{ start: number; end: number }> = null;

  _timelinePointerMoved = false;

  _timelineTrackClickPending = false;

  // Cached DOM refs (set in firstUpdated)
  _rangeScrollViewportEl: Nullable<HTMLElement> = null;

  _rangeTimelineEl: Nullable<HTMLElement> = null;

  _rangeTrackEl: Nullable<HTMLElement> = null;

  _rangeTickLayerEl: Nullable<HTMLElement> = null;

  _rangeLabelLayerEl: Nullable<HTMLElement> = null;

  _rangeContextLayerEl: Nullable<HTMLElement> = null;

  _rangeSelectionEl: Nullable<HTMLElement> = null;

  _rangeStartHandleEl: Nullable<HTMLElement> = null;

  _rangeEndHandleEl: Nullable<HTMLElement> = null;

  _rangeStartTooltipEl: Nullable<HTMLElement> = null;

  _rangeEndTooltipEl: Nullable<HTMLElement> = null;

  _rangeJumpLeftEl: Nullable<HTMLElement> = null;

  _rangeJumpRightEl: Nullable<HTMLElement> = null;

  _resizeObserver: Nullable<ResizeObserver> = null;

  _onRangeScroll: () => void;

  // Bound handlers
  _onRangePointerMove: (ev: PointerEvent) => void;

  _onRangePointerUp: (ev: PointerEvent) => void;

  _onTimelinePointerMove: (ev: PointerEvent) => void;

  _onTimelinePointerUp: (ev: PointerEvent) => void;

  constructor() {
    super();

    this._onRangePointerMove = (ev: PointerEvent) =>
      this._handleRangePointerMove(ev);
    this._onRangePointerUp = (ev: PointerEvent) =>
      this._finishRangePointerInteraction(ev);
    this._onTimelinePointerMove = (ev: PointerEvent) =>
      this._handleTimelinePointerMove(ev);
    this._onTimelinePointerUp = (ev: PointerEvent) =>
      this._finishTimelinePointerInteraction(ev);
    this._onRangeScroll = () => {
      this._updateSelectionJumpControls();
      this._syncVisibleRangeLabels();
      this._updateRangeTooltip();
      this.dispatchEvent(
        new CustomEvent("dp-range-scroll", { bubbles: true, composed: true })
      );
      if (!this._isProgrammaticScroll) {
        this._showScrollbar();
      }
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._rangeScrollViewportEl) {
      this._rangeScrollViewportEl.removeEventListener(
        "scroll",
        this._onRangeScroll
      );
    }
    this._detachRangePointerListeners();
    this._detachTimelinePointerListeners();
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    if (this._scrollbarHideTimer) {
      window.clearTimeout(this._scrollbarHideTimer);
      this._scrollbarHideTimer = null;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
  }

  firstUpdated() {
    const sr = this.shadowRoot!;
    this._rangeScrollViewportEl = sr.getElementById("range-scroll-viewport");
    this._rangeTimelineEl = sr.getElementById("range-timeline");
    this._rangeTrackEl = sr.getElementById("range-track");
    this._rangeTickLayerEl = sr.getElementById("range-tick-layer");
    this._rangeLabelLayerEl = sr.getElementById("range-label-layer");
    this._rangeContextLayerEl = sr.getElementById("range-context-layer");
    this._rangeSelectionEl = sr.getElementById("range-selection");
    this._rangeStartHandleEl = sr.getElementById("range-start-handle");
    this._rangeEndHandleEl = sr.getElementById("range-end-handle");
    this._rangeStartTooltipEl = sr.getElementById("range-tooltip-start");
    this._rangeEndTooltipEl = sr.getElementById("range-tooltip-end");

    this._rangeJumpLeftEl = sr.getElementById("range-jump-left");
    this._rangeJumpRightEl = sr.getElementById("range-jump-right");

    this._rangeScrollViewportEl?.addEventListener(
      "scroll",
      this._onRangeScroll
    );

    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => {
        this._syncTimelineWidth();
        this._updateSelectionJumpControls();
        this._syncVisibleRangeLabels();
        this._revealSelectionInTimeline("auto");
      });
      if (this._rangeScrollViewportEl) {
        this._resizeObserver.observe(this._rangeScrollViewportEl);
      }
    }

    this._syncRangeControl();
  }

  updated(changed: Map<string, unknown>) {
    const rangeProps = [
      "startTime",
      "endTime",
      "rangeBounds",
      "zoomLevel",
      "dateSnapping",
    ];
    if (rangeProps.some((p) => changed.has(p))) {
      this._syncRangeControl();
    }
  }

  _pctForTime(time: Nullable<Date>): number {
    if (!time || !this.rangeBounds) return 0;
    const { min, max } = this.rangeBounds;
    return Math.max(
      0,
      Math.min(100, ((time.getTime() - min) / (max - min)) * 100)
    );
  }

  render() {
    return html`
      <ha-icon-button
        id="range-jump-left"
        class="range-selection-jump left"
        .label=${msg("Scroll to selected range")}
        hidden
        @click=${() => this._revealSelectionInTimeline("smooth")}
      >
        <ha-icon icon="mdi:chevron-left"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        id="range-jump-right"
        class="range-selection-jump right"
        .label=${msg("Scroll to selected range")}
        hidden
        @click=${() => this._revealSelectionInTimeline("smooth")}
      >
        <ha-icon icon="mdi:chevron-right"></ha-icon>
      </ha-icon-button>
      <div
        id="range-scroll-viewport"
        class="range-scroll-viewport"
        @pointerdown=${this._handleTimelinePointerDown}
        @pointermove=${this._handleRangeViewportPointerMove}
        @pointerleave=${this._handleRangeViewportPointerLeave}
      >
        <div id="range-timeline" class="range-timeline">
          <slot name="timeline-overlays"></slot>
          <div id="range-context-layer" class="range-context-layer"></div>
          <div id="range-tick-layer" class="range-tick-layer"></div>
          <div id="range-track" class="range-track">
            <slot name="track-overlays"></slot>
            <div id="range-selection" class="range-selection"></div>
          </div>
          <div id="range-label-layer" class="range-label-layer"></div>
          <range-handle
            id="range-start-handle"
            .label=${msg("Start date and time")}
            .position=${this._pctForTime(this.startTime)}
            @dp-handle-drag-start=${(e: CustomEvent) =>
              this._beginRangePointerInteraction(
                "start",
                e.detail.pointerId,
                e.detail.clientX
              )}
            @dp-handle-keydown=${(e: CustomEvent) =>
              this._handleRangeHandleKeyDown("start", e.detail)}
            @dp-handle-hover=${() => this._setRangeTooltipHoverHandle("start")}
            @dp-handle-leave=${() =>
              this._clearRangeTooltipHoverHandle("start")}
            @dp-handle-focus=${() => this._setRangeTooltipFocusHandle("start")}
            @dp-handle-blur=${() => this._clearRangeTooltipFocusHandle("start")}
          ></range-handle>
          <range-handle
            id="range-end-handle"
            .label=${msg("End date and time")}
            .position=${this._pctForTime(this.endTime)}
            .live=${this.isLiveEdge}
            @dp-handle-drag-start=${(e: CustomEvent) =>
              this._beginRangePointerInteraction(
                "end",
                e.detail.pointerId,
                e.detail.clientX
              )}
            @dp-handle-keydown=${(e: CustomEvent) =>
              this._handleRangeHandleKeyDown("end", e.detail)}
            @dp-handle-hover=${() => this._setRangeTooltipHoverHandle("end")}
            @dp-handle-leave=${() => this._clearRangeTooltipHoverHandle("end")}
            @dp-handle-focus=${() => this._setRangeTooltipFocusHandle("end")}
            @dp-handle-blur=${() => this._clearRangeTooltipFocusHandle("end")}
          ></range-handle>
        </div>
      </div>
      <div
        id="range-tooltip-start"
        class="range-tooltip start"
        aria-hidden="true"
      ></div>
      <div
        id="range-tooltip-end"
        class="range-tooltip end"
        aria-hidden="true"
      ></div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Zoom / snap helpers
  // ---------------------------------------------------------------------------

  _getZoomConfig(): RangeZoomConfig {
    return RANGE_ZOOM_CONFIGS[this.zoomLevel] || RANGE_ZOOM_CONFIGS.month_short;
  }

  _getEffectiveSnapUnit(): RangeUnit {
    if (this.dateSnapping !== "auto") {
      return this.dateSnapping as RangeUnit;
    }
    switch (this.zoomLevel) {
      case "quarterly":
      case "month_compressed":
        return "month";
      case "month_short":
      case "month_expanded":
      case "week_compressed":
        return "week";
      case "week_expanded":
        return "day";
      case "day":
        return "hour";
      default:
        return "day";
    }
  }

  _getScaleLabelZoomLevel(): ZoomLevel {
    if (this.zoomLevel === "quarterly" || this.zoomLevel === "month_short") {
      return this.zoomLevel;
    }
    return "";
  }

  _getSnapSpanMs(reference: Date = new Date()): number {
    const snapUnit = this._getEffectiveSnapUnit();
    const start = startOfUnit(reference, snapUnit);
    const end = endOfUnit(reference, snapUnit);
    return Math.max(SECOND_MS, end.getTime() - start.getTime());
  }

  _countUnitsInRange(startMs: number, endMs: number, unit: RangeUnit): number {
    const totalMs = Math.max(0, endMs - startMs);
    const perMs: RecordWithNumericValues = {
      second: SECOND_MS,
      minute: 60 * SECOND_MS,
      hour: 60 * 60 * SECOND_MS,
      day: 24 * 60 * 60 * SECOND_MS,
      week: 7 * 24 * 60 * 60 * SECOND_MS,
    };
    if (perMs[unit]) return Math.ceil(totalMs / perMs[unit]);
    if (unit === "month")
      return Math.ceil(totalMs / (30.44 * 24 * 60 * 60 * SECOND_MS));
    if (unit === "quarter")
      return Math.ceil(totalMs / (91.3 * 24 * 60 * 60 * SECOND_MS));
    if (unit === "year")
      return Math.ceil(totalMs / (365.25 * 24 * 60 * 60 * SECOND_MS));
    return Math.max(1, Math.ceil(totalMs / (24 * 60 * 60 * SECOND_MS)));
  }

  // ---------------------------------------------------------------------------
  // Sync / render
  // ---------------------------------------------------------------------------

  _syncRangeControl() {
    if (
      !this._rangeTrackEl ||
      !this._rangeStartHandleEl ||
      !this._rangeEndHandleEl
    )
      return;
    if (!this.rangeBounds) return;
    this._draftStartTime = this.startTime ? new Date(this.startTime) : null;
    this._draftEndTime = this.endTime ? new Date(this.endTime) : null;
    this._syncTimelineWidth();
    this._updateHandleStacking();
    this._renderRangeScale();
    this._updateRangePreview();
    this._updateSelectionJumpControls();
    this._revealSelectionInTimeline("auto");
  }

  _syncTimelineWidth() {
    if (!this.rangeBounds || !this._rangeTimelineEl) return;
    const { config } = this.rangeBounds;
    const viewportWidth = Math.max(
      this._rangeScrollViewportEl?.clientWidth || 0,
      320
    );
    const unitCount = this._countUnitsInRange(
      this.rangeBounds.min,
      this.rangeBounds.max,
      config.majorUnit
    );
    const contentWidth = Math.max(
      viewportWidth,
      unitCount * (config.pixelsPerUnit || 60)
    );
    this._rangeContentWidth = contentWidth;
    this._rangeTimelineEl.style.width = `${contentWidth}px`;
  }

  _renderScaleMarkers(
    fragment: DocumentFragment,
    unit: RangeUnit,
    className: string,
    total: number,
    step = 1
  ) {
    if (!this.rangeBounds) return;
    let markerTime = addUnit(
      startOfUnit(new Date(this.rangeBounds.min), unit),
      unit,
      0
    );
    if (markerTime.getTime() < this.rangeBounds.min) {
      markerTime = addUnit(markerTime, unit, step);
    }
    while (markerTime.getTime() < this.rangeBounds.max) {
      const tick = document.createElement("span");
      tick.className = `range-tick ${className}`;
      tick.style.left = `${((markerTime.getTime() - this.rangeBounds.min) / total) * 100}%`;
      fragment.appendChild(tick);
      markerTime = addUnit(markerTime, unit, step);
    }
  }

  _buildRangePeriodButton(
    className: string,
    leftValue: number,
    total: number,
    text: string,
    unit: RangeUnit,
    startTime: Date
  ): HTMLButtonElement {
    if (!this.rangeBounds) return document.createElement("button");
    const button = document.createElement("button");
    button.type = "button";
    button.className = `range-period-button ${className}`;
    button.style.left = `${((leftValue - this.rangeBounds.min) / total) * 100}%`;
    button.textContent = text;
    const selectionLabel = formatPeriodSelectionLabel(
      startTime,
      unit,
      this.locale || undefined
    );
    const selectTitle = `${msg("Select")} ${selectionLabel}`;
    button.title = selectTitle;
    button.setAttribute("aria-label", selectTitle);
    button.addEventListener("click", (ev) =>
      this._handleRangePeriodSelect(unit, startTime, ev)
    );
    button.addEventListener("pointerenter", () =>
      this._setHoveredPeriodRange(unit, startTime)
    );
    button.addEventListener("pointerleave", () =>
      this._clearHoveredPeriodRange(unit, startTime)
    );
    button.addEventListener("focus", () =>
      this._setHoveredPeriodRange(unit, startTime)
    );
    button.addEventListener("blur", () =>
      this._clearHoveredPeriodRange(unit, startTime)
    );
    return button;
  }

  _getRangeUnitAnchorMs(
    startTime: Date,
    unit: RangeUnit,
    anchor: "auto" | "center" | "start" = "auto"
  ): number {
    const unitStart = Math.max(
      startOfUnit(new Date(startTime), unit).getTime(),
      this.rangeBounds?.min ?? -Infinity
    );
    const unitEnd = Math.min(
      endOfUnit(new Date(startTime), unit).getTime(),
      this.rangeBounds?.max ?? Infinity
    );
    let resolvedAnchor = anchor;
    if (resolvedAnchor === "auto") {
      resolvedAnchor = unit === "day" || unit === "week" ? "center" : "start";
    }
    if (resolvedAnchor === "center") {
      return unitStart + Math.max(0, (unitEnd - unitStart) / 2);
    }
    return unitStart;
  }

  _estimateRangeLabelWidth(
    text: string,
    className: string,
    minGap: number
  ): number {
    const basePadding = className === "range-context-label" ? 20 : 14;
    const charWidth = className === "range-context-label" ? 8.2 : 7.2;
    return String(text).length * charWidth + basePadding + minGap;
  }

  _computeRangeLabelStride(
    unit: RangeUnit,
    formatter: (d: Date) => string,
    className: string,
    minGap: number
  ): number {
    if (!this.rangeBounds || !this._rangeContentWidth) return 1;
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    let current = startOfUnit(new Date(this.rangeBounds.min), unit);
    let previousMs: Nullable<number> = null;
    let minSpacingPx = Infinity;
    let maxLabelWidthPx = 0;
    let samples = 0;

    while (current.getTime() < this.rangeBounds.max && samples < 24) {
      const currentMs = Math.max(current.getTime(), this.rangeBounds.min);
      const text = formatter(current);
      maxLabelWidthPx = Math.max(
        maxLabelWidthPx,
        this._estimateRangeLabelWidth(text, className, minGap)
      );
      if (previousMs != null) {
        const spacingPx =
          ((currentMs - previousMs) / total) * this._rangeContentWidth;
        if (spacingPx > 0) minSpacingPx = Math.min(minSpacingPx, spacingPx);
      }
      previousMs = currentMs;
      current = addUnit(current, unit, 1);
      samples += 1;
    }

    if (!Number.isFinite(minSpacingPx) || minSpacingPx <= 0) return 1;
    return Math.max(1, Math.ceil(maxLabelWidthPx / minSpacingPx));
  }

  _syncVisibleRangeLabels() {
    // Label visibility is currently governed by stride computation in _renderRangeScale.
    // This is a hook for future overflow-based hiding.
  }

  _renderRangeScale() {
    if (
      !this.rangeBounds ||
      !this._rangeTickLayerEl ||
      !this._rangeLabelLayerEl ||
      !this._rangeContextLayerEl
    )
      return;
    this._rangeTickLayerEl.innerHTML = "";
    this._rangeLabelLayerEl.innerHTML = "";
    this._rangeContextLayerEl.innerHTML = "";
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const { config } = this.rangeBounds;
    const tickFragment = document.createDocumentFragment();
    const labelFragment = document.createDocumentFragment();
    const contextFragment = document.createDocumentFragment();
    const scaleLabelZoomLevel = this._getScaleLabelZoomLevel();

    const scaleLabelStride =
      config.labelUnit === "month" || config.labelUnit === "day"
        ? 1
        : this._computeRangeLabelStride(
            config.labelUnit,
            (value) =>
              formatScaleLabel(
                value,
                config.labelUnit,
                scaleLabelZoomLevel,
                this.locale || undefined
              ),
            "range-scale-label",
            RANGE_LABEL_MIN_GAP_PX
          );
    const contextLabelStride =
      config.contextUnit === "month" || config.contextUnit === "day"
        ? 1
        : this._computeRangeLabelStride(
            config.contextUnit,
            (value) =>
              formatContextLabel(
                value,
                config.contextUnit,
                this.locale || undefined
              ),
            "range-context-label",
            RANGE_CONTEXT_LABEL_MIN_GAP_PX
          );

    if (
      config.detailUnit &&
      config.detailUnit !== config.minorUnit &&
      config.detailUnit !== config.majorUnit
    ) {
      this._renderScaleMarkers(
        tickFragment,
        config.detailUnit,
        "fine",
        total,
        config.detailStep || 1
      );
    }
    if (config.minorUnit !== config.majorUnit) {
      this._renderScaleMarkers(tickFragment, config.minorUnit, "", total);
    }
    this._renderScaleMarkers(tickFragment, config.majorUnit, "major", total);

    let labelRef = startOfUnit(
      new Date(this.rangeBounds.min),
      config.labelUnit
    );
    let labelIndex = 0;
    while (labelRef.getTime() < this.rangeBounds.max) {
      if (labelIndex % scaleLabelStride === 0) {
        const leftValue = this._getRangeUnitAnchorMs(
          labelRef,
          config.labelUnit,
          "auto"
        );
        const label = this._buildRangePeriodButton(
          "range-scale-label",
          leftValue,
          total,
          formatScaleLabel(
            labelRef,
            config.labelUnit,
            scaleLabelZoomLevel,
            this.locale || undefined
          ),
          config.labelUnit,
          labelRef
        );
        labelFragment.appendChild(label);
      }
      labelRef = addUnit(labelRef, config.labelUnit, 1);
      labelIndex += 1;
    }

    let contextRef = startOfUnit(
      new Date(this.rangeBounds.min),
      config.contextUnit
    );
    if (contextRef.getTime() < this.rangeBounds.min) {
      contextRef = addUnit(contextRef, config.contextUnit, 1);
    }
    let contextIndex = 0;
    while (contextRef.getTime() < this.rangeBounds.max) {
      const left = `${((contextRef.getTime() - this.rangeBounds.min) / total) * 100}%`;
      const divider = document.createElement("span");
      divider.className = "range-divider";
      divider.style.left = left;
      contextFragment.appendChild(divider);

      if (contextIndex % contextLabelStride === 0) {
        const label = this._buildRangePeriodButton(
          "range-context-label",
          contextRef.getTime(),
          total,
          formatContextLabel(
            contextRef,
            config.contextUnit,
            this.locale || undefined
          ),
          config.contextUnit,
          contextRef
        );
        contextFragment.appendChild(label);
      }
      contextRef = addUnit(contextRef, config.contextUnit, 1);
      contextIndex += 1;
    }

    this._rangeTickLayerEl.appendChild(tickFragment);
    this._rangeLabelLayerEl.appendChild(labelFragment);
    this._rangeContextLayerEl.appendChild(contextFragment);
    this._syncVisibleRangeLabels();
  }

  // ---------------------------------------------------------------------------
  // Handle position / tooltip
  // ---------------------------------------------------------------------------

  _updateHandleStacking(activeHandle = this._activeRangeHandle) {
    if (!this._rangeStartHandleEl || !this._rangeEndHandleEl) return;
    this._rangeStartHandleEl.style.zIndex =
      activeHandle === "start" ? "5" : "3";
    this._rangeEndHandleEl.style.zIndex = activeHandle === "end" ? "5" : "4";
  }

  _updateRangePreview() {
    if (!this.rangeBounds || !this._draftStartTime || !this._draftEndTime)
      return;
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const startPct =
      ((this._draftStartTime.getTime() - this.rangeBounds.min) / total) * 100;
    const endPct =
      ((this._draftEndTime.getTime() - this.rangeBounds.min) / total) * 100;
    if (this._rangeSelectionEl) {
      this._rangeSelectionEl.style.left = `${startPct}%`;
      this._rangeSelectionEl.style.width = `${Math.max(0, endPct - startPct)}%`;
    }
    if (this._rangeStartHandleEl) {
      this._rangeStartHandleEl.style.left = `${startPct}%`;
      this._rangeStartHandleEl.setAttribute(
        "aria-valuetext",
        formatRangeDateTime(this._draftStartTime, this.locale || undefined)
      );
    }
    if (this._rangeEndHandleEl) {
      this._rangeEndHandleEl.style.left = `${endPct}%`;
      this._rangeEndHandleEl.setAttribute(
        "aria-valuetext",
        formatRangeDateTime(this._draftEndTime, this.locale || undefined)
      );
    }

    this._updateRangeTooltip();
  }

  _getVisibleRangeTooltipHandles(): ("start" | "end")[] {
    if (
      this._timelinePointerMode === "selection" ||
      this._timelinePointerMode === "interval_select"
    ) {
      return ["start", "end"];
    }
    const handle =
      this._activeRangeHandle ||
      this._focusedRangeHandle ||
      this._hoveredRangeHandle ||
      null;
    return handle ? [handle] : [];
  }

  _setRangeTooltipHoverHandle(handle: "start" | "end") {
    this._hoveredRangeHandle = handle;
    this._updateRangeTooltip();
  }

  _clearRangeTooltipHoverHandle(handle: "start" | "end") {
    if (this._activeRangeHandle === handle) return;
    if (this._hoveredRangeHandle === handle) this._hoveredRangeHandle = null;
    this._updateRangeTooltip();
  }

  _setRangeTooltipFocusHandle(handle: "start" | "end") {
    this._focusedRangeHandle = handle;
    this._updateRangeTooltip();
  }

  _clearRangeTooltipFocusHandle(handle: "start" | "end") {
    if (this._activeRangeHandle === handle) return;
    if (this._focusedRangeHandle === handle) this._focusedRangeHandle = null;
    this._updateRangeTooltip();
  }

  _updateRangeTooltip() {
    if (!this.rangeBounds || !this._rangeScrollViewportEl) return;
    const visibleHandles = new Set(this._getVisibleRangeTooltipHandles());
    this._updateRangeTooltipForHandle("start", visibleHandles.has("start"));
    this._updateRangeTooltipForHandle("end", visibleHandles.has("end"));
  }

  _updateRangeTooltipForHandle(handle: "start" | "end", visible: boolean) {
    const tooltip =
      handle === "start" ? this._rangeStartTooltipEl : this._rangeEndTooltipEl;
    if (!tooltip) return;
    if (!visible) {
      tooltip.classList.remove("visible");
      tooltip.setAttribute("aria-hidden", "true");
      return;
    }
    const value =
      handle === "start" ? this._draftStartTime : this._draftEndTime;
    if (!value || !this.rangeBounds || !this._rangeScrollViewportEl) {
      tooltip.classList.remove("visible");
      tooltip.setAttribute("aria-hidden", "true");
      return;
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const contentWidth = Math.max(
      this._rangeContentWidth || 0,
      this._rangeScrollViewportEl.clientWidth || 0,
      1
    );
    const valuePx =
      ((value.getTime() - this.rangeBounds.min) / total) * contentWidth;
    const viewportX = valuePx - this._rangeScrollViewportEl.scrollLeft;
    const clampedX = clampNumber(
      viewportX,
      0,
      this._rangeScrollViewportEl.clientWidth
    );
    if (handle === "end" && this.isLiveEdge) {
      const dateEl = document.createElement("span");
      dateEl.textContent = formatRangeDateTime(value, this.locale || undefined);
      const hintEl = document.createElement("span");
      hintEl.className = "range-tooltip-live-hint";
      hintEl.textContent = msg("Updates with new data");
      tooltip.textContent = "";
      tooltip.append(dateEl, hintEl);
    } else {
      tooltip.textContent = formatRangeDateTime(
        value,
        this.locale || undefined
      );
    }
    tooltip.style.left = `${clampedX}px`;
    tooltip.classList.add("visible");
    tooltip.setAttribute("aria-hidden", "false");
  }

  // ---------------------------------------------------------------------------
  // Period hover
  // ---------------------------------------------------------------------------

  _handleRangePeriodSelect(unit: RangeUnit, startTime: Date, ev: MouseEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    const periodStart = startOfUnit(new Date(startTime), unit);
    const periodEnd = endOfUnit(new Date(startTime), unit);
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    this._draftStartTime = new Date(periodStart);
    this._draftEndTime = new Date(periodEnd);
    this._updateRangePreview();
    this.dispatchEvent(
      new CustomEvent("dp-range-period-select", {
        detail: { unit, startTime: periodStart },
        bubbles: true,
        composed: true,
      })
    );
    this._commitRangeSelection({ push: true });
  }

  _setHoveredPeriodRange(unit: RangeUnit, startTime: Date) {
    const start = startOfUnit(new Date(startTime), unit);
    const end = endOfUnit(new Date(startTime), unit);
    this._hoveredPeriodRange = {
      unit,
      start: start.getTime(),
      end: end.getTime(),
    };
    this.dispatchEvent(
      new CustomEvent("dp-range-period-hover", {
        detail: { start, end },
        bubbles: true,
        composed: true,
      })
    );
  }

  _clearHoveredPeriodRange(unit: RangeUnit, startTime: Date) {
    if (!this._hoveredPeriodRange) return;
    const start = startOfUnit(new Date(startTime), unit).getTime();
    const end = endOfUnit(new Date(startTime), unit).getTime();
    if (
      this._hoveredPeriodRange.start === start &&
      this._hoveredPeriodRange.end === end
    ) {
      this._hoveredPeriodRange = null;
      this.dispatchEvent(
        new CustomEvent("dp-range-period-leave", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Jump controls / scroll
  // ---------------------------------------------------------------------------

  _updateSelectionJumpControls() {
    if (
      !this._rangeScrollViewportEl ||
      !this.rangeBounds ||
      !this._rangeContentWidth ||
      !this.startTime ||
      !this.endTime
    ) {
      if (this._rangeJumpLeftEl) this._rangeJumpLeftEl.hidden = true;
      if (this._rangeJumpRightEl) this._rangeJumpRightEl.hidden = true;
      return;
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const viewportWidth = this._rangeScrollViewportEl.clientWidth;
    const currentLeft = this._rangeScrollViewportEl.scrollLeft;
    const currentRight = currentLeft + viewportWidth;
    const startPx =
      ((this.startTime.getTime() - this.rangeBounds.min) / total) *
      this._rangeContentWidth;
    const endPx =
      ((this.endTime.getTime() - this.rangeBounds.min) / total) *
      this._rangeContentWidth;
    if (this._rangeJumpLeftEl)
      this._rangeJumpLeftEl.hidden = !(endPx < currentLeft);
    if (this._rangeJumpRightEl)
      this._rangeJumpRightEl.hidden = !(startPx > currentRight);
  }

  _scrollTimelineToRange(
    range: { start: number; end: number },
    behavior: ScrollBehavior = "auto",
    { center = false } = {}
  ) {
    if (
      !this._rangeScrollViewportEl ||
      !this.rangeBounds ||
      !this._rangeContentWidth ||
      !range
    )
      return;
    const viewportWidth = this._rangeScrollViewportEl.clientWidth;
    if (!viewportWidth || this._rangeContentWidth <= viewportWidth) return;
    const totalMs = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const visibleSpanMs =
      totalMs * Math.min(1, viewportWidth / this._rangeContentWidth);
    const maxScrollLeft = Math.max(0, this._rangeContentWidth - viewportWidth);
    const viewportRangeMs = Math.max(0, totalMs - visibleSpanMs);
    if (viewportRangeMs <= 0) return;

    const targetStart = center
      ? clampNumber(
          (range.start + range.end) / 2 - visibleSpanMs / 2,
          this.rangeBounds.min,
          this.rangeBounds.max - visibleSpanMs
        )
      : clampNumber(
          range.start,
          this.rangeBounds.min,
          this.rangeBounds.max - visibleSpanMs
        );
    const ratio = (targetStart - this.rangeBounds.min) / viewportRangeMs;
    const nextLeft = clampNumber(ratio * maxScrollLeft, 0, maxScrollLeft);
    this._rangeScrollViewportEl.scrollTo({ left: nextLeft, behavior });
  }

  revealSelection() {
    this._revealSelectionInTimeline("smooth");
  }

  _revealSelectionInTimeline(behavior: ScrollBehavior = "auto") {
    if (!this.startTime || !this.endTime) return;
    this._isProgrammaticScroll = true;
    this._scrollTimelineToRange(
      { start: this.startTime.getTime(), end: this.endTime.getTime() },
      behavior,
      { center: true }
    );
    window.setTimeout(() => {
      this._isProgrammaticScroll = false;
    }, 50);
  }

  _showScrollbar() {
    if (!this._rangeScrollViewportEl) return;
    this._rangeScrollViewportEl.classList.add("scrollbar-visible");
    if (this._scrollbarHideTimer) window.clearTimeout(this._scrollbarHideTimer);
    this._scrollbarHideTimer = window.setTimeout(() => {
      this._scrollbarHideTimer = null;
      this._rangeScrollViewportEl?.classList.remove("scrollbar-visible");
    }, 1500);
  }

  // ---------------------------------------------------------------------------
  // Coordinate math
  // ---------------------------------------------------------------------------

  _timestampFromClientX(clientX: number): Nullable<number> {
    if (!this.rangeBounds || !this._rangeTrackEl) return null;
    const rect = this._rangeTrackEl.getBoundingClientRect();
    if (!rect.width) return null;
    const ratio = clampNumber((clientX - rect.left) / rect.width, 0, 1);
    return (
      this.rangeBounds.min +
      ratio * (this.rangeBounds.max - this.rangeBounds.min)
    );
  }

  _getTimelineSelectionDragDeltaMs(timestamp: number): number {
    if (timestamp == null || this._timelinePointerStartTimestamp == null)
      return 0;
    const snapUnit = this._getEffectiveSnapUnit();
    if (!snapUnit) return timestamp - this._timelinePointerStartTimestamp;
    const snappedStart = snapDateToUnit(
      new Date(this._timelinePointerStartTimestamp),
      snapUnit
    ).getTime();
    const snappedCurrent = snapDateToUnit(
      new Date(timestamp),
      snapUnit
    ).getTime();
    return snappedCurrent - snappedStart;
  }

  // ---------------------------------------------------------------------------
  // Draft range manipulation
  // ---------------------------------------------------------------------------

  _setDraftRangeFromTimestamp(handle: "start" | "end", timestamp: number) {
    if (!this.rangeBounds) return;
    const snapUnit = this._getEffectiveSnapUnit();
    let startMs =
      this._draftStartTime?.getTime() ??
      this.startTime?.getTime() ??
      this.rangeBounds.min;
    let endMs =
      this._draftEndTime?.getTime() ??
      this.endTime?.getTime() ??
      this.rangeBounds.max;
    const snapped = clampNumber(
      snapDateToUnit(new Date(timestamp), snapUnit).getTime(),
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    const minSpan = Math.max(this._getSnapSpanMs(new Date(snapped)), SECOND_MS);
    if (handle === "start") {
      startMs = clampNumber(snapped, this.rangeBounds.min, endMs - minSpan);
    } else {
      endMs = clampNumber(snapped, startMs + minSpan, this.rangeBounds.max);
    }
    this._draftStartTime = new Date(startMs);
    this._draftEndTime = new Date(endMs);
    this._updateHandleStacking(handle);
    this._updateRangePreview();
    this._fireDraftEvent();
    this._scheduleRangeCommit();
  }

  _shiftDraftRangeByDelta(deltaMs: number) {
    if (!this.rangeBounds) return;
    const startMs = this._timelineDragStartRangeMs;
    const endMs = this._timelineDragEndRangeMs;
    const minDelta = this.rangeBounds.min - startMs;
    const maxDelta = this.rangeBounds.max - endMs;
    const clampedDelta = clampNumber(deltaMs, minDelta, maxDelta);
    this._draftStartTime = new Date(startMs + clampedDelta);
    this._draftEndTime = new Date(endMs + clampedDelta);
    this._updateRangePreview();
    this._fireDraftEvent();
    this._scheduleRangeCommit();
  }

  _setDraftRangeFromIntervalSelection(
    startTimestamp: number,
    endTimestamp: number
  ) {
    if (!this.rangeBounds) return;
    const unit: RangeUnit =
      this.rangeBounds.config?.labelUnit || this._getEffectiveSnapUnit();
    const startValue = Math.min(startTimestamp, endTimestamp);
    const endValue = Math.max(startTimestamp, endTimestamp);
    const rangeStart = clampNumber(
      startOfUnit(new Date(startValue), unit).getTime(),
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    const rangeEnd = clampNumber(
      endOfUnit(new Date(endValue), unit).getTime(),
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    if (rangeStart >= rangeEnd) return;
    this._draftStartTime = new Date(rangeStart);
    this._draftEndTime = new Date(rangeEnd);
    this._updateRangePreview();
  }

  _fireDraftEvent() {
    if (!this._draftStartTime || !this._draftEndTime) return;
    this.dispatchEvent(
      new CustomEvent("dp-range-draft", {
        detail: {
          start: new Date(this._draftStartTime),
          end: new Date(this._draftEndTime),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  _scheduleRangeCommit() {
    if (
      this._rangeInteractionActive ||
      this._timelinePointerMode === "selection" ||
      this._timelinePointerMode === "interval_select"
    )
      return;
    if (this._rangeCommitTimer) window.clearTimeout(this._rangeCommitTimer);
    this._rangeCommitTimer = window.setTimeout(() => {
      this._rangeCommitTimer = null;
      this._commitRangeSelection({ push: false });
    }, 240);
  }

  _commitRangeSelection({ push = false }: { push?: boolean } = {}) {
    if (!this._draftStartTime || !this._draftEndTime) return;
    this.dispatchEvent(
      new CustomEvent("dp-range-commit", {
        detail: {
          start: new Date(this._draftStartTime),
          end: new Date(this._draftEndTime),
          push,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Handle drag interaction
  // ---------------------------------------------------------------------------

  _beginRangePointerInteraction(
    handle: "start" | "end",
    pointerId: number,
    clientX: number
  ) {
    if (!this._rangeTrackEl) return;
    this._rangeInteractionActive = true;
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    this._activeRangeHandle = handle;
    this._hoveredRangeHandle = handle;
    this._rangePointerId = pointerId;
    this._updateHandleStacking(handle);
    this._updateRangeTooltip();
    this._attachRangePointerListeners();
    const target =
      handle === "start" ? this._rangeStartHandleEl : this._rangeEndHandleEl;
    (target as HTMLElement & { focus?: () => void })?.focus?.();
    const timestamp = this._timestampFromClientX(clientX);
    if (timestamp != null) {
      this._setDraftRangeFromTimestamp(handle, timestamp);
    }
  }

  _maybeAutoScrollTimelineDuringHandleDrag(clientX: number) {
    if (!this._rangeScrollViewportEl) return;
    const viewport = this._rangeScrollViewportEl;
    const rect = viewport.getBoundingClientRect();
    if (!rect.width) return;
    const maxScrollLeft = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth
    );
    if (maxScrollLeft <= 0) return;

    let delta = 0;
    const leftDistance = clientX - rect.left;
    const rightDistance = rect.right - clientX;
    if (leftDistance < RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX) {
      const ratio = clampNumber(
        (RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX - leftDistance) /
          RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
        0,
        1
      );
      delta = -Math.max(
        1,
        Math.round(ratio * RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX)
      );
    } else if (rightDistance < RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX) {
      const ratio = clampNumber(
        (RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX - rightDistance) /
          RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX,
        0,
        1
      );
      delta = Math.max(
        1,
        Math.round(ratio * RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX)
      );
    }
    if (!delta) return;
    viewport.scrollLeft = clampNumber(
      viewport.scrollLeft + delta,
      0,
      maxScrollLeft
    );
  }

  _attachRangePointerListeners() {
    window.addEventListener("pointermove", this._onRangePointerMove);
    window.addEventListener("pointerup", this._onRangePointerUp);
    window.addEventListener("pointercancel", this._onRangePointerUp);
  }

  _detachRangePointerListeners() {
    window.removeEventListener("pointermove", this._onRangePointerMove);
    window.removeEventListener("pointerup", this._onRangePointerUp);
    window.removeEventListener("pointercancel", this._onRangePointerUp);
    this._rangePointerId = null;
    this._activeRangeHandle = null;
    this._rangeInteractionActive = false;
    this._updateHandleStacking();
    this._updateRangeTooltip();
  }

  _handleRangePointerMove(ev: PointerEvent) {
    if (!this._activeRangeHandle) return;
    if (this._rangePointerId != null && ev.pointerId !== this._rangePointerId)
      return;
    this._maybeAutoScrollTimelineDuringHandleDrag(ev.clientX);
    const timestamp = this._timestampFromClientX(ev.clientX);
    if (timestamp == null) return;
    ev.preventDefault();
    this._setDraftRangeFromTimestamp(this._activeRangeHandle, timestamp);
  }

  _finishRangePointerInteraction(ev: PointerEvent) {
    if (!this._activeRangeHandle) return;
    if (this._rangePointerId != null && ev.pointerId !== this._rangePointerId)
      return;
    this._detachRangePointerListeners();
    this._focusedRangeHandle = null;
    this._hoveredRangeHandle = null;
    this._updateRangeTooltip();
    this._commitRangeSelection({ push: true });
  }

  _handleRangeHandleKeyDown(
    handle: "start" | "end",
    detail: { key: string; shiftKey: boolean }
  ) {
    if (!this.rangeBounds) return;
    const snapUnit = this._getEffectiveSnapUnit();
    const currentValue =
      handle === "start"
        ? (this._draftStartTime?.getTime() ?? this.startTime?.getTime())
        : (this._draftEndTime?.getTime() ?? this.endTime?.getTime());
    if (currentValue == null) return;

    const config = this._getZoomConfig();
    let nextValue: Nullable<number> = null;
    if (detail.key === "ArrowLeft" || detail.key === "ArrowDown")
      nextValue = addUnit(new Date(currentValue), snapUnit, -1).getTime();
    if (detail.key === "ArrowRight" || detail.key === "ArrowUp")
      nextValue = addUnit(new Date(currentValue), snapUnit, 1).getTime();
    if (detail.key === "PageDown")
      nextValue = addUnit(
        new Date(currentValue),
        config.majorUnit,
        -1
      ).getTime();
    if (detail.key === "PageUp")
      nextValue = addUnit(
        new Date(currentValue),
        config.majorUnit,
        1
      ).getTime();
    if (detail.key === "Home") nextValue = this.rangeBounds.min;
    if (detail.key === "End") nextValue = this.rangeBounds.max;
    if (nextValue == null) return;

    this._focusedRangeHandle = handle;
    this._setDraftRangeFromTimestamp(handle, nextValue);
  }

  // ---------------------------------------------------------------------------
  // Timeline pan / interval-select interactions
  // ---------------------------------------------------------------------------

  _handleTimelinePointerDown(ev: PointerEvent) {
    if (ev.button !== 0) return;
    // Ignore events originating from range-handle
    if (
      ev
        .composedPath()
        .some(
          (node) =>
            node instanceof Element &&
            (node.tagName === "RANGE-HANDLE" || node.closest?.("range-handle"))
        )
    ) {
      return;
    }
    if ((ev.target as Element)?.closest?.(".range-period-button")) return;
    if (!this._rangeScrollViewportEl) return;

    const isSelectionDrag = !!(ev.target as Element)?.closest?.(
      ".range-selection"
    );
    const trackRect = this._rangeTrackEl?.getBoundingClientRect();
    const isTrackRegion =
      !!trackRect &&
      ev.clientY >= trackRect.top - 6 &&
      ev.clientY <= trackRect.bottom + 6;
    const isIntervalSelect = !isSelectionDrag && !isTrackRegion;

    this._detachTimelinePointerListeners();
    this._rangeInteractionActive = isSelectionDrag || isIntervalSelect;
    if ((isSelectionDrag || isIntervalSelect) && this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
      this._rangeCommitTimer = null;
    }
    this._timelinePointerId = ev.pointerId;
    this._timelinePointerStartX = ev.clientX;
    this._timelinePointerStartScrollLeft =
      this._rangeScrollViewportEl.scrollLeft;
    this._timelinePointerStartTimestamp =
      isSelectionDrag || isIntervalSelect
        ? this._timestampFromClientX(ev.clientX)
        : null;
    if (isSelectionDrag) {
      this._timelinePointerMode = "selection";
    } else if (isIntervalSelect) {
      this._timelinePointerMode = "interval_select";
    } else {
      this._timelinePointerMode = "pan";
    }
    this._timelineDragStartRangeMs =
      this._draftStartTime?.getTime() ?? this.startTime?.getTime() ?? 0;
    this._timelineDragEndRangeMs =
      this._draftEndTime?.getTime() ?? this.endTime?.getTime() ?? 0;
    this._timelinePointerMoved = false;
    this._timelineTrackClickPending =
      !isSelectionDrag &&
      !isIntervalSelect &&
      !!(ev.target as Element)?.closest?.(".range-track");
    this._rangeScrollViewportEl.classList.remove("dragging");
    this._rangeSelectionEl?.classList.toggle("dragging", isSelectionDrag);

    window.addEventListener("pointermove", this._onTimelinePointerMove);
    window.addEventListener("pointerup", this._onTimelinePointerUp);
    window.addEventListener("pointercancel", this._onTimelinePointerUp);
  }

  _detachTimelinePointerListeners() {
    window.removeEventListener("pointermove", this._onTimelinePointerMove);
    window.removeEventListener("pointerup", this._onTimelinePointerUp);
    window.removeEventListener("pointercancel", this._onTimelinePointerUp);
    if (this._rangeScrollViewportEl)
      this._rangeScrollViewportEl.classList.remove("dragging");
    this._rangeSelectionEl?.classList.remove("dragging");
    this._timelinePointerId = null;
    this._timelinePointerStartTimestamp = null;
    this._timelinePointerMode = null;
    this._rangeInteractionActive = false;
    this._timelinePointerMoved = false;
    this._timelineTrackClickPending = false;
  }

  _handleTimelinePointerMove(ev: PointerEvent) {
    if (
      this._timelinePointerId == null ||
      ev.pointerId !== this._timelinePointerId ||
      !this._rangeScrollViewportEl
    )
      return;
    if (this._timelinePointerMode === "selection") {
      const timestamp = this._timestampFromClientX(ev.clientX);
      if (timestamp == null || this._timelinePointerStartTimestamp == null)
        return;
      const deltaX = ev.clientX - this._timelinePointerStartX;
      if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) return;
      this._timelinePointerMoved = true;
      this._shiftDraftRangeByDelta(
        this._getTimelineSelectionDragDeltaMs(timestamp)
      );
      ev.preventDefault();
      return;
    }
    if (this._timelinePointerMode === "interval_select") {
      const timestamp = this._timestampFromClientX(ev.clientX);
      if (timestamp == null || this._timelinePointerStartTimestamp == null)
        return;
      const deltaX = ev.clientX - this._timelinePointerStartX;
      if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) return;
      this._timelinePointerMoved = true;
      this._setDraftRangeFromIntervalSelection(
        this._timelinePointerStartTimestamp,
        timestamp
      );
      ev.preventDefault();
      return;
    }
    const deltaX = ev.clientX - this._timelinePointerStartX;
    if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) return;
    this._timelinePointerMoved = true;
    this._timelineTrackClickPending = false;
    this._rangeScrollViewportEl.classList.add("dragging");
    const maxScrollLeft = Math.max(
      0,
      this._rangeScrollViewportEl.scrollWidth -
        this._rangeScrollViewportEl.clientWidth
    );
    this._rangeScrollViewportEl.scrollLeft = clampNumber(
      this._timelinePointerStartScrollLeft - deltaX,
      0,
      maxScrollLeft
    );
    ev.preventDefault();
  }

  _finishTimelinePointerInteraction(ev: PointerEvent) {
    if (
      this._timelinePointerId == null ||
      ev.pointerId !== this._timelinePointerId
    )
      return;
    const mode = this._timelinePointerMode;
    const didMove = this._timelinePointerMoved;
    const shouldSelectTrack = this._timelineTrackClickPending && !didMove;
    const clientX = ev.clientX;
    this._detachTimelinePointerListeners();
    if (mode === "selection") {
      this._focusedRangeHandle = null;
      this._hoveredRangeHandle = null;
      this._updateRangeTooltip();
      if (didMove) {
        this._commitRangeSelection({ push: true });
      }
      return;
    }
    if (mode === "interval_select") {
      this._hoveredPeriodRange = null;
      this._updateRangeTooltip();
      if (didMove) {
        this._commitRangeSelection({ push: true });
      }
      return;
    }
    if (shouldSelectTrack) {
      this._handleTrackSelectionAtClientX(clientX);
    }
  }

  _handleTrackSelectionAtClientX(clientX: number) {
    const timestamp = this._timestampFromClientX(clientX);
    if (timestamp == null) return;
    const startMs =
      this._draftStartTime?.getTime() ??
      this.startTime?.getTime() ??
      this.rangeBounds?.min;
    const endMs =
      this._draftEndTime?.getTime() ??
      this.endTime?.getTime() ??
      this.rangeBounds?.max;
    if (startMs == null || endMs == null) return;
    const handle =
      Math.abs(timestamp - startMs) <= Math.abs(timestamp - endMs)
        ? "start"
        : "end";
    this._setDraftRangeFromTimestamp(handle, timestamp);
  }

  _handleRangeViewportPointerMove(ev: PointerEvent) {
    if (this._timelinePointerId != null || this._rangePointerId != null) return;
    if (
      ev
        .composedPath()
        .some((el) => (el as Element).tagName === "DP-RANGE-HANDLE")
    )
      return;
    if ((ev.target as Element)?.closest?.(".range-period-button")) return;
    if ((ev.target as Element)?.closest?.(".range-selection")) return;
    const timestamp = this._timestampFromClientX(ev.clientX);
    if (timestamp == null || !this.rangeBounds) return;
    const unit =
      this.rangeBounds.config?.labelUnit || this._getEffectiveSnapUnit();
    if (!unit) return;
    this._setHoveredPeriodRange(unit, new Date(timestamp));
  }

  _handleRangeViewportPointerLeave() {
    if (this._timelinePointerId != null || this._rangePointerId != null) return;
    if (this._hoveredPeriodRange) {
      this._hoveredPeriodRange = null;
      this.dispatchEvent(
        new CustomEvent("dp-range-period-leave", {
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}
customElements.define("range-timeline", RangeTimeline);
