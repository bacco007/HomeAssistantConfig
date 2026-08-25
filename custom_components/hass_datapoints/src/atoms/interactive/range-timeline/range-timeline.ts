import { html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";
import type { I18nMap } from "@/lib/i18n/i18n-prop";
import { createDefaultI18n, t } from "@/lib/i18n/i18n-prop";

import { styles } from "./range-timeline.styles";
import type { RangeBounds } from "./types";
import {
  computeAutoScrollDelta,
  computeDraftRangeForHandle,
  computeIntervalSelectionRange,
  computeSelectionDragDelta,
  computeShiftedDraftRange,
  resolveCloserHandle,
  timestampFromClientPosition,
} from "./lib/range-pointer-math";
import {
  computeScrollPositionForRange,
  computeSelectionJumpVisibility,
} from "./lib/range-scroll-math";
import "./range-handle";
import "./range-scale";
import "./range-tooltip";
import "./range-track";
import type { RangeUnit, RangeZoomConfig } from "@/lib/timeline/timeline-scale";
import {
  addUnit,
  clampNumber,
  endOfUnit,
  formatRangeDateTime,
  RANGE_ZOOM_CONFIGS,
  SECOND_MS,
  snapDateToUnit,
  startOfUnit,
} from "@/lib/timeline/timeline-scale";

const DEFAULT_I18N = createDefaultI18n([
  "Updates with new data",
  "Scroll to selected range",
  "Start date and time",
  "End date and time",
]);

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
export class RangeTimeline extends LitElement {
  @property({ type: Object }) accessor startTime: Nullable<Date> = null;

  @property({ type: Object }) accessor endTime: Nullable<Date> = null;

  @property({ type: Object }) accessor rangeBounds: Nullable<RangeBounds> =
    null;

  @property({ type: String }) accessor zoomLevel: string = "day";

  @property({ type: String }) accessor dateSnapping: string = "auto";

  @property({ type: Boolean }) accessor isLiveEdge: boolean = false;

  @property({ type: String }) accessor locale: string = "";

  @property({ attribute: false }) accessor i18n: I18nMap = DEFAULT_I18N;

  static styles = styles;

  private _t(key: string, ...values: Array<string | number>): string {
    return t(this.i18n, key, ...values);
  }

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

  @state() accessor _rangeContentWidth: number = 0;

  _rangeCommitTimer: Nullable<number> = null;

  // Reactive tooltip state
  @state() accessor _startTooltipVisible: boolean = false;

  @state() accessor _startTooltipLeftPx: number = 0;

  @state() accessor _startTooltipContent: string = "";

  @state() accessor _endTooltipVisible: boolean = false;

  @state() accessor _endTooltipLeftPx: number = 0;

  @state() accessor _endTooltipContent: string = "";

  @state() accessor _endTooltipIsLive: boolean = false;

  @state() accessor _endTooltipLiveHint: string = "";

  // Reactive layout state
  @state() accessor _selectionLeftPct: number = 0;

  @state() accessor _selectionWidthPct: number = 0;

  @state() accessor _scrollbarVisible: boolean = false;

  @state() accessor _viewportDragging: boolean = false;

  @state() accessor _selectionDragging: boolean = false;

  @state() accessor _startHandlePosition: number = 0;

  @state() accessor _endHandlePosition: number = 0;

  @state() accessor _startHandleZIndex: number = 3;

  @state() accessor _endHandleZIndex: number = 4;

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

  // DOM refs via @query (resolved from shadow DOM)
  @query("#range-scroll-viewport")
  accessor _rangeScrollViewportEl: Nullable<HTMLElement> = null;

  @query("#range-track") accessor _rangeTrackEl: Nullable<HTMLElement> = null;

  @query("#range-start-handle")
  accessor _rangeStartHandleEl: Nullable<HTMLElement> = null;

  @query("#range-end-handle")
  accessor _rangeEndHandleEl: Nullable<HTMLElement> = null;

  @query("#range-jump-left")
  accessor _rangeJumpLeftEl: Nullable<HTMLElement> = null;

  @query("#range-jump-right")
  accessor _rangeJumpRightEl: Nullable<HTMLElement> = null;

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

  willUpdate(changed: Map<string, unknown>) {
    const rangeProps = [
      "startTime",
      "endTime",
      "rangeBounds",
      "zoomLevel",
      "dateSnapping",
    ];
    if (rangeProps.some((p) => changed.has(p)) && this.rangeBounds) {
      this._draftStartTime = this.startTime ? new Date(this.startTime) : null;
      this._draftEndTime = this.endTime ? new Date(this.endTime) : null;
      this._updateHandleStacking();
      this._updateRangePreview();
    }
  }

  firstUpdated() {
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(() => {
        this._syncTimelineWidth();
        this._updateSelectionJumpControls();
        this._revealSelectionInTimeline("auto");
      });
      if (this._rangeScrollViewportEl) {
        this._resizeObserver.observe(this._rangeScrollViewportEl);
      }
    }

    this._scheduleDomSync();
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
      this._scheduleDomSync();
    }
  }

  private _scheduleDomSync() {
    this.updateComplete.then(() => {
      if (
        this.isConnected &&
        this._rangeTrackEl &&
        this._rangeStartHandleEl &&
        this._rangeEndHandleEl &&
        this.rangeBounds
      ) {
        this._syncTimelineWidth();
        this._updateSelectionJumpControls();
        this._revealSelectionInTimeline("auto");
      }
    });
  }

  render() {
    return html`
      <ha-icon-button
        id="range-jump-left"
        class="range-selection-jump left"
        .label=${this._t("Scroll to selected range")}
        hidden
        @click=${() => this._revealSelectionInTimeline("smooth")}
      >
        <ha-icon icon="mdi:chevron-left"></ha-icon>
      </ha-icon-button>
      <ha-icon-button
        id="range-jump-right"
        class="range-selection-jump right"
        .label=${this._t("Scroll to selected range")}
        hidden
        @click=${() => this._revealSelectionInTimeline("smooth")}
      >
        <ha-icon icon="mdi:chevron-right"></ha-icon>
      </ha-icon-button>
      <div
        id="range-scroll-viewport"
        class="range-scroll-viewport ${this._scrollbarVisible
          ? "scrollbar-visible"
          : ""} ${this._viewportDragging ? "dragging" : ""}"
        @scroll=${this._onRangeScroll}
        @pointerdown=${this._handleTimelinePointerDown}
        @pointermove=${this._handleRangeViewportPointerMove}
        @pointerleave=${this._handleRangeViewportPointerLeave}
      >
        <div
          id="range-timeline"
          class="range-timeline"
          style="width:${this._rangeContentWidth}px"
        >
          <slot name="timeline-overlays"></slot>
          <range-scale
            .rangeBounds=${this.rangeBounds}
            .zoomLevel=${this.zoomLevel}
            .contentWidth=${this._rangeContentWidth}
            .locale=${this.locale}
            .i18n=${this.i18n}
            @dp-scale-period-select=${this._handleScalePeriodSelect}
            @dp-scale-period-hover=${this._handleScalePeriodHover}
            @dp-scale-period-leave=${this._handleScalePeriodLeave}
          ></range-scale>
          <range-track
            id="range-track"
            .selectionLeftPct=${this._selectionLeftPct}
            .selectionWidthPct=${this._selectionWidthPct}
            .selectionDragging=${this._selectionDragging}
          >
            <slot name="track-overlays" slot="track-overlays"></slot>
          </range-track>
          <range-handle
            id="range-start-handle"
            .label=${this._t("Start date and time")}
            .position=${this._startHandlePosition}
            .zIndex=${this._startHandleZIndex}
            .i18n=${this.i18n}
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
            .label=${this._t("End date and time")}
            .position=${this._endHandlePosition}
            .live=${this.isLiveEdge}
            .zIndex=${this._endHandleZIndex}
            .i18n=${this.i18n}
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
      <range-tooltip
        side="start"
        .content=${this._startTooltipContent}
        .visible=${this._startTooltipVisible}
        .position=${this._startTooltipLeftPx}
      ></range-tooltip>
      <range-tooltip
        side="end"
        .content=${this._endTooltipContent}
        .visible=${this._endTooltipVisible}
        .position=${this._endTooltipLeftPx}
        .isLive=${this._endTooltipIsLive}
        .liveHint=${this._endTooltipLiveHint}
      ></range-tooltip>
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
    if (perMs[unit]) {
      return Math.ceil(totalMs / perMs[unit]);
    }
    if (unit === "month") {
      return Math.ceil(totalMs / (30.44 * 24 * 60 * 60 * SECOND_MS));
    }
    if (unit === "quarter") {
      return Math.ceil(totalMs / (91.3 * 24 * 60 * 60 * SECOND_MS));
    }
    if (unit === "year") {
      return Math.ceil(totalMs / (365.25 * 24 * 60 * 60 * SECOND_MS));
    }
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
    ) {
      return;
    }
    if (!this.rangeBounds) {
      return;
    }
    this._draftStartTime = this.startTime ? new Date(this.startTime) : null;
    this._draftEndTime = this.endTime ? new Date(this.endTime) : null;
    this._syncTimelineWidth();
    this._updateHandleStacking();
    this._updateRangePreview();
    this._updateSelectionJumpControls();
    this._revealSelectionInTimeline("auto");
  }

  _syncTimelineWidth() {
    if (!this.rangeBounds) {
      return;
    }
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
    this._rangeContentWidth = Math.max(
      viewportWidth,
      unitCount * (config.pixelsPerUnit || 60)
    );
  }

  // ---------------------------------------------------------------------------
  // Handle position / tooltip
  // ---------------------------------------------------------------------------

  _updateHandleStacking(activeHandle = this._activeRangeHandle) {
    this._startHandleZIndex = activeHandle === "start" ? 5 : 3;
    this._endHandleZIndex = activeHandle === "end" ? 5 : 4;
  }

  _updateRangePreview() {
    if (!this.rangeBounds || !this._draftStartTime || !this._draftEndTime) {
      return;
    }
    const total = Math.max(1, this.rangeBounds.max - this.rangeBounds.min);
    const startPct =
      ((this._draftStartTime.getTime() - this.rangeBounds.min) / total) * 100;
    const endPct =
      ((this._draftEndTime.getTime() - this.rangeBounds.min) / total) * 100;
    this._selectionLeftPct = startPct;
    this._selectionWidthPct = Math.max(0, endPct - startPct);
    this._startHandlePosition = startPct;
    this._endHandlePosition = endPct;

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
    if (this._activeRangeHandle === handle) {
      return;
    }
    if (this._hoveredRangeHandle === handle) {
      this._hoveredRangeHandle = null;
    }
    this._updateRangeTooltip();
  }

  _setRangeTooltipFocusHandle(handle: "start" | "end") {
    this._focusedRangeHandle = handle;
    this._updateRangeTooltip();
  }

  _clearRangeTooltipFocusHandle(handle: "start" | "end") {
    if (this._activeRangeHandle === handle) {
      return;
    }
    if (this._focusedRangeHandle === handle) {
      this._focusedRangeHandle = null;
    }
    this._updateRangeTooltip();
  }

  _updateRangeTooltip() {
    if (!this.rangeBounds || !this._rangeScrollViewportEl) {
      return;
    }
    const visibleHandles = new Set(this._getVisibleRangeTooltipHandles());
    this._updateRangeTooltipForHandle("start", visibleHandles.has("start"));
    this._updateRangeTooltipForHandle("end", visibleHandles.has("end"));
  }

  _updateRangeTooltipForHandle(handle: "start" | "end", visible: boolean) {
    const value =
      handle === "start" ? this._draftStartTime : this._draftEndTime;
    if (
      !visible ||
      !value ||
      !this.rangeBounds ||
      !this._rangeScrollViewportEl
    ) {
      if (handle === "start") {
        this._startTooltipVisible = false;
      } else {
        this._endTooltipVisible = false;
        this._endTooltipIsLive = false;
      }
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
    const content = formatRangeDateTime(value, this.locale || undefined);
    if (handle === "start") {
      this._startTooltipVisible = true;
      this._startTooltipLeftPx = clampedX;
      this._startTooltipContent = content;
    } else {
      this._endTooltipVisible = true;
      this._endTooltipLeftPx = clampedX;
      this._endTooltipContent = content;
      this._endTooltipIsLive = this.isLiveEdge;
      this._endTooltipLiveHint = this.isLiveEdge
        ? this._t("Updates with new data")
        : "";
    }
  }

  // ---------------------------------------------------------------------------
  // Period hover
  // ---------------------------------------------------------------------------

  _handleScalePeriodSelect(e: CustomEvent) {
    const { unit, startTime, originalEvent } = e.detail;
    this._handleRangePeriodSelect(unit, startTime, originalEvent);
  }

  _handleScalePeriodHover(e: CustomEvent) {
    const { unit, startTime } = e.detail;
    this._setHoveredPeriodRange(unit, startTime);
  }

  _handleScalePeriodLeave(e: CustomEvent) {
    const { unit, startTime } = e.detail;
    this._clearHoveredPeriodRange(unit, startTime);
  }

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
    if (!this._hoveredPeriodRange) {
      return;
    }
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
      if (this._rangeJumpLeftEl) {
        this._rangeJumpLeftEl.hidden = true;
      }
      if (this._rangeJumpRightEl) {
        this._rangeJumpRightEl.hidden = true;
      }
      return;
    }
    const { showLeft, showRight } = computeSelectionJumpVisibility(
      this._rangeScrollViewportEl.scrollLeft,
      this._rangeScrollViewportEl.clientWidth,
      this._rangeContentWidth,
      this.startTime.getTime(),
      this.endTime.getTime(),
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    if (this._rangeJumpLeftEl) {
      this._rangeJumpLeftEl.hidden = !showLeft;
    }
    if (this._rangeJumpRightEl) {
      this._rangeJumpRightEl.hidden = !showRight;
    }
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
    ) {
      return;
    }
    const nextLeft = computeScrollPositionForRange(
      range.start,
      range.end,
      this.rangeBounds.min,
      this.rangeBounds.max,
      this._rangeContentWidth,
      this._rangeScrollViewportEl.clientWidth,
      center
    );
    if (nextLeft == null) {
      return;
    }
    this._rangeScrollViewportEl.scrollTo({ left: nextLeft, behavior });
  }

  revealSelection() {
    this._revealSelectionInTimeline("smooth");
  }

  _revealSelectionInTimeline(behavior: ScrollBehavior = "auto") {
    if (!this.startTime || !this.endTime) {
      return;
    }
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
    this._scrollbarVisible = true;
    if (this._scrollbarHideTimer) {
      window.clearTimeout(this._scrollbarHideTimer);
    }
    this._scrollbarHideTimer = window.setTimeout(() => {
      this._scrollbarHideTimer = null;
      this._scrollbarVisible = false;
    }, 1500);
  }

  // ---------------------------------------------------------------------------
  // Coordinate math
  // ---------------------------------------------------------------------------

  _timestampFromClientX(clientX: number): Nullable<number> {
    if (!this.rangeBounds || !this._rangeTrackEl) {
      return null;
    }
    const rect = this._rangeTrackEl.getBoundingClientRect();
    return timestampFromClientPosition(
      clientX,
      rect.left,
      rect.width,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
  }

  _getTimelineSelectionDragDeltaMs(timestamp: number): number {
    if (timestamp == null || this._timelinePointerStartTimestamp == null) {
      return 0;
    }
    return computeSelectionDragDelta(
      timestamp,
      this._timelinePointerStartTimestamp,
      this._getEffectiveSnapUnit()
    );
  }

  // ---------------------------------------------------------------------------
  // Draft range manipulation
  // ---------------------------------------------------------------------------

  _setDraftRangeFromTimestamp(handle: "start" | "end", timestamp: number) {
    if (!this.rangeBounds) {
      return;
    }
    const currentStartMs =
      this._draftStartTime?.getTime() ??
      this.startTime?.getTime() ??
      this.rangeBounds.min;
    const currentEndMs =
      this._draftEndTime?.getTime() ??
      this.endTime?.getTime() ??
      this.rangeBounds.max;
    const snapUnit = this._getEffectiveSnapUnit();
    const snapSpanMs = this._getSnapSpanMs(
      new Date(snapDateToUnit(new Date(timestamp), snapUnit).getTime())
    );
    const { startMs, endMs } = computeDraftRangeForHandle(
      handle,
      timestamp,
      currentStartMs,
      currentEndMs,
      this.rangeBounds.min,
      this.rangeBounds.max,
      snapUnit,
      snapSpanMs
    );
    this._draftStartTime = new Date(startMs);
    this._draftEndTime = new Date(endMs);
    this._updateHandleStacking(handle);
    this._updateRangePreview();
    this._fireDraftEvent();
    this._scheduleRangeCommit();
  }

  _shiftDraftRangeByDelta(deltaMs: number) {
    if (!this.rangeBounds) {
      return;
    }
    const { startMs, endMs } = computeShiftedDraftRange(
      deltaMs,
      this._timelineDragStartRangeMs,
      this._timelineDragEndRangeMs,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    this._draftStartTime = new Date(startMs);
    this._draftEndTime = new Date(endMs);
    this._updateRangePreview();
    this._fireDraftEvent();
    this._scheduleRangeCommit();
  }

  _setDraftRangeFromIntervalSelection(
    startTimestamp: number,
    endTimestamp: number
  ) {
    if (!this.rangeBounds) {
      return;
    }
    const unit: RangeUnit =
      this.rangeBounds.config?.labelUnit || this._getEffectiveSnapUnit();
    const result = computeIntervalSelectionRange(
      startTimestamp,
      endTimestamp,
      unit,
      this.rangeBounds.min,
      this.rangeBounds.max
    );
    if (!result) {
      return;
    }
    this._draftStartTime = new Date(result.startMs);
    this._draftEndTime = new Date(result.endMs);
    this._updateRangePreview();
  }

  _fireDraftEvent() {
    if (!this._draftStartTime || !this._draftEndTime) {
      return;
    }
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
    ) {
      return;
    }
    if (this._rangeCommitTimer) {
      window.clearTimeout(this._rangeCommitTimer);
    }
    this._rangeCommitTimer = window.setTimeout(() => {
      this._rangeCommitTimer = null;
      this._commitRangeSelection({ push: false });
    }, 240);
  }

  _commitRangeSelection({ push = false }: { push?: boolean } = {}) {
    if (!this._draftStartTime || !this._draftEndTime) {
      return;
    }
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
    if (!this._rangeTrackEl) {
      return;
    }
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
    if (!this._rangeScrollViewportEl) {
      return;
    }
    const viewport = this._rangeScrollViewportEl;
    const rect = viewport.getBoundingClientRect();
    if (!rect.width) {
      return;
    }
    const maxScrollLeft = Math.max(
      0,
      viewport.scrollWidth - viewport.clientWidth
    );
    if (maxScrollLeft <= 0) {
      return;
    }
    const delta = computeAutoScrollDelta(clientX, rect.left, rect.right);
    if (!delta) {
      return;
    }
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
    if (!this._activeRangeHandle) {
      return;
    }
    if (this._rangePointerId != null && ev.pointerId !== this._rangePointerId) {
      return;
    }
    this._maybeAutoScrollTimelineDuringHandleDrag(ev.clientX);
    const timestamp = this._timestampFromClientX(ev.clientX);
    if (timestamp == null) {
      return;
    }
    ev.preventDefault();
    this._setDraftRangeFromTimestamp(this._activeRangeHandle, timestamp);
  }

  _finishRangePointerInteraction(ev: PointerEvent) {
    if (!this._activeRangeHandle) {
      return;
    }
    if (this._rangePointerId != null && ev.pointerId !== this._rangePointerId) {
      return;
    }
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
    if (!this.rangeBounds) {
      return;
    }
    const snapUnit = this._getEffectiveSnapUnit();
    const currentValue =
      handle === "start"
        ? (this._draftStartTime?.getTime() ?? this.startTime?.getTime())
        : (this._draftEndTime?.getTime() ?? this.endTime?.getTime());
    if (currentValue == null) {
      return;
    }

    const config = this._getZoomConfig();
    let nextValue: Nullable<number> = null;
    if (detail.key === "ArrowLeft" || detail.key === "ArrowDown") {
      nextValue = addUnit(new Date(currentValue), snapUnit, -1).getTime();
    }
    if (detail.key === "ArrowRight" || detail.key === "ArrowUp") {
      nextValue = addUnit(new Date(currentValue), snapUnit, 1).getTime();
    }
    if (detail.key === "PageDown") {
      nextValue = addUnit(
        new Date(currentValue),
        config.majorUnit,
        -1
      ).getTime();
    }
    if (detail.key === "PageUp") {
      nextValue = addUnit(
        new Date(currentValue),
        config.majorUnit,
        1
      ).getTime();
    }
    if (detail.key === "Home") {
      nextValue = this.rangeBounds.min;
    }
    if (detail.key === "End") {
      nextValue = this.rangeBounds.max;
    }
    if (nextValue == null) {
      return;
    }

    this._focusedRangeHandle = handle;
    this._setDraftRangeFromTimestamp(handle, nextValue);
  }

  // ---------------------------------------------------------------------------
  // Timeline pan / interval-select interactions
  // ---------------------------------------------------------------------------

  _handleTimelinePointerDown(ev: PointerEvent) {
    if (ev.button !== 0) {
      return;
    }
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
    if ((ev.target as Element)?.closest?.(".range-period-button")) {
      return;
    }
    if (!this._rangeScrollViewportEl) {
      return;
    }

    const isSelectionDrag = ev
      .composedPath()
      .some(
        (el) =>
          el instanceof Element && el.classList?.contains?.("range-selection")
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
      !!(ev.target as Element)?.closest?.("range-track");
    this._viewportDragging = false;
    this._selectionDragging = isSelectionDrag;

    window.addEventListener("pointermove", this._onTimelinePointerMove);
    window.addEventListener("pointerup", this._onTimelinePointerUp);
    window.addEventListener("pointercancel", this._onTimelinePointerUp);
  }

  _detachTimelinePointerListeners() {
    window.removeEventListener("pointermove", this._onTimelinePointerMove);
    window.removeEventListener("pointerup", this._onTimelinePointerUp);
    window.removeEventListener("pointercancel", this._onTimelinePointerUp);
    this._viewportDragging = false;
    this._selectionDragging = false;
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
    ) {
      return;
    }
    if (this._timelinePointerMode === "selection") {
      const timestamp = this._timestampFromClientX(ev.clientX);
      if (timestamp == null || this._timelinePointerStartTimestamp == null) {
        return;
      }
      const deltaX = ev.clientX - this._timelinePointerStartX;
      if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) {
        return;
      }
      this._timelinePointerMoved = true;
      this._shiftDraftRangeByDelta(
        this._getTimelineSelectionDragDeltaMs(timestamp)
      );
      ev.preventDefault();
      return;
    }
    if (this._timelinePointerMode === "interval_select") {
      const timestamp = this._timestampFromClientX(ev.clientX);
      if (timestamp == null || this._timelinePointerStartTimestamp == null) {
        return;
      }
      const deltaX = ev.clientX - this._timelinePointerStartX;
      if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) {
        return;
      }
      this._timelinePointerMoved = true;
      this._setDraftRangeFromIntervalSelection(
        this._timelinePointerStartTimestamp,
        timestamp
      );
      ev.preventDefault();
      return;
    }
    const deltaX = ev.clientX - this._timelinePointerStartX;
    if (!this._timelinePointerMoved && Math.abs(deltaX) < 4) {
      return;
    }
    this._timelinePointerMoved = true;
    this._timelineTrackClickPending = false;
    this._viewportDragging = true;
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
    ) {
      return;
    }
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
    if (timestamp == null) {
      return;
    }
    const startMs =
      this._draftStartTime?.getTime() ??
      this.startTime?.getTime() ??
      this.rangeBounds?.min;
    const endMs =
      this._draftEndTime?.getTime() ??
      this.endTime?.getTime() ??
      this.rangeBounds?.max;
    if (startMs == null || endMs == null) {
      return;
    }
    const handle = resolveCloserHandle(timestamp, startMs, endMs);
    this._setDraftRangeFromTimestamp(handle, timestamp);
  }

  _handleRangeViewportPointerMove(ev: PointerEvent) {
    if (this._timelinePointerId != null || this._rangePointerId != null) {
      return;
    }
    if (
      ev
        .composedPath()
        .some((el) => (el as Element).tagName === "DP-RANGE-HANDLE")
    ) {
      return;
    }
    if ((ev.target as Element)?.closest?.(".range-period-button")) {
      return;
    }
    if (
      ev
        .composedPath()
        .some(
          (el) =>
            el instanceof Element && el.classList?.contains?.("range-selection")
        )
    ) {
      return;
    }
    const timestamp = this._timestampFromClientX(ev.clientX);
    if (timestamp == null || !this.rangeBounds) {
      return;
    }
    const unit =
      this.rangeBounds.config?.labelUnit || this._getEffectiveSnapUnit();
    if (!unit) {
      return;
    }
    this._setHoveredPeriodRange(unit, new Date(timestamp));
  }

  _handleRangeViewportPointerLeave() {
    if (this._timelinePointerId != null || this._rangePointerId != null) {
      return;
    }
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
