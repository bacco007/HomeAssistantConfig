import { html, render, type TemplateResult } from "lit";
import { msg } from "@/lib/i18n/localize";
import {
  areaIcon,
  areaName,
  deviceIcon,
  deviceName,
  entityIcon,
  entityName,
  labelIcon,
  labelName,
} from "@/lib/ha/entity-name";
import { fmtDateTime } from "@/lib/util/format";
import {
  clampChartValue,
  formatTooltipDisplayValue,
  formatTooltipValue,
} from "@/lib/chart/chart-shell";
import type { ChartRenderer, ResolvedAxis } from "@/lib/chart/chart-renderer";
import {
  positionTooltip,
  renderChartAxisHoverDots,
} from "@/charts/utils/chart-dom";
import type { HassLike } from "@/lib/types";

type ChartInteractionState = {
  _hass?: Nullable<HassLike>;
  _chartHoverCleanup?: NullableCleanup;
  _chartZoomCleanup?: NullableCleanup;
  _chartLastHover?: Nullable<HoverState>;
  _chartZoomDragging?: boolean;
};

type ChartInteractionHost = HTMLElement;

interface TooltipBounds {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

type AnomalyMethod =
  | "trend_residual"
  | "rate_of_change"
  | "iqr"
  | "rolling_zscore"
  | "persistence"
  | "comparison_window";

interface AnomalyPoint {
  timeMs: number;
  residual: number;
  baselineValue: number;
  value: number;
}

interface AnomalyCluster {
  points: AnomalyPoint[];
  anomalyMethod?: AnomalyMethod | string;
  flatRange?: number;
  detectedByMethods?: string[];
}

export interface AnomalyRegion {
  label?: string;
  relatedEntityId?: string;
  unit?: string;
  color?: Nullable<string>;
  sensitivity?: string;
  startTime?: number;
  endTime?: number;
  cluster?: Nullable<AnomalyCluster>;
  centerX?: number;
  centerY?: number;
  radiusX?: number;
  radiusY?: number;
}

interface AnomalyTooltipSection {
  methodLabel: string;
  description: string;
  alert: string;
}

interface AnomalyTooltipContent {
  title: string;
  description: string;
  alert: string;
  instruction: string;
}

export interface ChartEventRecord {
  id?: string;
  timestamp: string;
  chart_value?: Nullable<number | string>;
  chart_unit?: string;
  color?: Nullable<string>;
  message?: string;
  annotation?: string;
  entity_ids?: string[];
  device_ids?: string[];
  area_ids?: string[];
  label_ids?: string[];
}

type SeriesPoint = [number, number];

interface HoverAxisLike {
  min: number;
  max: number;
  side?: "left" | "right";
  slot?: number;
}

export interface HoverSeriesLike {
  entityId?: string;
  pts?: SeriesPoint[];
  axis?: HoverAxisLike | ResolvedAxis;
  label?: string;
  baseLabel?: string;
  windowLabel?: string;
  relatedEntityId?: string;
  comparisonParentId?: string;
  unit?: string;
  color?: Nullable<string>;
  hoverOpacity?: number;
  rawVisible?: boolean;
  comparisonDerived?: boolean;
  showCrosshair?: boolean;
  summaryType?: string;
  comparison?: boolean;
  grouped?: boolean;
  value?: Nullable<number | string>;
  spans?: Array<{ start: number; end: number }>;
  onLabel?: string;
  offLabel?: string;
}

export interface HoverValueEntry {
  entityId: string;
  comparisonParentId?: string;
  relatedEntityId?: string;
  label: string;
  baseLabel?: string;
  windowLabel?: string;
  value: Nullable<number | string>;
  unit: string;
  color?: Nullable<string>;
  opacity?: number;
  hasValue: boolean;
  x?: number;
  y?: number;
  axisSide?: "left" | "right";
  axisSlot?: number;
  trend?: boolean;
  rate?: boolean;
  delta?: boolean;
  summary?: boolean;
  summaryType?: string;
  threshold?: boolean;
  comparison?: boolean;
  rawVisible?: boolean;
  comparisonDerived?: boolean;
  grouped?: boolean;
  key?: string;
  showCrosshair?: boolean;
  active?: boolean;
}

export interface HoverState {
  x: number;
  y?: number;
  timeMs: number;
  rangeStartMs?: number;
  rangeEndMs?: number;
  values?: HoverValueEntry[];
  trendValues?: HoverValueEntry[];
  rateValues?: HoverValueEntry[];
  deltaValues?: HoverValueEntry[];
  summaryValues?: HoverValueEntry[];
  thresholdValues?: HoverValueEntry[];
  comparisonValues?: HoverValueEntry[];
  binaryValues?: HoverValueEntry[];
  primary?: Nullable<HoverValueEntry>;
  event?: Nullable<ChartEventRecord>;
  events?: ChartEventRecord[];
  anomalyRegions?: AnomalyRegion[];
  emphasizeGuides?: boolean;
  splitVertical?: { top: number; height: number };
  showTrendCrosshairs?: boolean;
  showRateCrosshairs?: boolean;
  hideRawData?: boolean;
}

interface TooltipRelatedEvent {
  entity_ids?: string[];
  device_ids?: string[];
  area_ids?: string[];
  label_ids?: string[];
}

interface AttachLineChartHoverOptions {
  binaryStates?: HoverSeriesLike[];
  comparisonSeries?: HoverSeriesLike[];
  trendSeries?: HoverSeriesLike[];
  rateSeries?: HoverSeriesLike[];
  deltaSeries?: HoverSeriesLike[];
  summarySeries?: HoverSeriesLike[];
  thresholdSeries?: HoverSeriesLike[];
  anomalyRegions?: AnomalyRegion[];
  hoverSurfaceEl?: Nullable<HTMLElement>;
  hoverSnapMode?: "follow_series" | "snap_to_data_points";
  showTrendCrosshairs?: boolean;
  showRateCrosshairs?: boolean;
  showDeltaTooltip?: boolean;
  emphasizeHoverGuides?: boolean;
  hideRawData?: boolean;
  showTooltip?: boolean;
  onAddAnnotation?: (hover: Nullable<HoverState>, event: Event) => void;
  onContextMenu?: (hover: Nullable<HoverState>, event: Event) => void;
  onAnomalyClick?: (regions: AnomalyRegion[], event: Event) => void;
}

interface ZoomRangeSelection {
  startTime: number;
  endTime: number;
}

interface AttachLineChartRangeZoomOptions {
  onPreview?: (selection: Nullable<ZoomRangeSelection>) => void;
  onZoom?: (selection: ZoomRangeSelection) => void;
  onReset?: () => void;
}

type FrameHandle = Nullable<number>;
type TimerHandle = Nullable<number>;

type HoveredEventRecord = ChartEventRecord & {
  _hoverDistanceMs: number;
};

/**
 * Returns the DOM root that contains the chart's elements.
 * For cards with a shadow root (legacy HTMLElement-based cards) this is
 * `card.shadowRoot`. For sub-components that render into the parent's shadow
 * DOM (like `hass-datapoints-history-chart`) there is no own shadow root, so we fall back
 * to `getRootNode()` which returns the ancestor ShadowRoot.
 */
function getRoot(card: ChartInteractionHost): Document | ShadowRoot {
  const rootNode = card.shadowRoot ?? card.getRootNode();
  if (rootNode instanceof ShadowRoot || rootNode instanceof Document) {
    return rootNode;
  }
  return document;
}

function getInteractionState(
  card: ChartInteractionHost
): ChartInteractionState {
  return card as ChartInteractionHost & ChartInteractionState;
}

function toChartBounds(
  bounds: Nullable<DOMRect> | undefined
): Nullable<TooltipBounds> {
  if (!bounds) {
    return null;
  }
  return {
    left: bounds.left + 8,
    right: bounds.right - 8,
    top: bounds.top + 8,
    bottom: bounds.bottom - 8,
  };
}

function formatTooltipDateTimeFromMs(timeMs: number): string {
  if (!Number.isFinite(timeMs)) {
    return "";
  }
  return fmtDateTime(new Date(timeMs).toISOString());
}

function t(key: string, ...values: string[]): string {
  let s = msg(key);
  values.forEach((v, i) => {
    s = s.replace(new RegExp(`\\{${i}\\}`, "g"), v);
  });
  return s;
}

function getAnomalyMethodLabels() {
  return {
    trend_residual: msg("Trend deviation"),
    rate_of_change: msg("Sudden change"),
    iqr: msg("Statistical outlier (IQR)"),
    rolling_zscore: msg("Rolling Z-score"),
    persistence: msg("Flat-line / stuck"),
    comparison_window: msg("Comparison window"),
  };
}
// Keep backwards-compatible alias
export const ANOMALY_METHOD_LABELS = {
  trend_residual: "Trend deviation",
  rate_of_change: "Sudden change",
  iqr: "Statistical outlier (IQR)",
  rolling_zscore: "Rolling Z-score",
  persistence: "Flat-line / stuck",
  comparison_window: "Comparison window",
};

function buildAnomalyMethodSection(
  region: Nullable<AnomalyRegion> | undefined
): Nullable<AnomalyTooltipSection> {
  // Returns { methodLabel, description, alert } for a single region, or null if invalid.
  if (!region?.cluster?.points?.length) {
    return null;
  }
  const points = region.cluster.points;
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const peakPoint = points.reduce(
    (peak: Nullable<AnomalyPoint>, p: AnomalyPoint) =>
      !peak || Math.abs(p.residual) > Math.abs(peak.residual) ? p : peak,
    null
  );
  if (!peakPoint) {
    return null;
  }

  const label = region.label || region.relatedEntityId || "Series";
  const unit = region.unit || "";
  const cluster = region.cluster;
  const method = cluster.anomalyMethod ?? "trend_residual";
  const methodLabel =
    getAnomalyMethodLabels()[method as keyof typeof ANOMALY_METHOD_LABELS] ||
    method;

  let description;
  let alert;
  if (method === "rate_of_change") {
    const rateUnit = unit ? `${unit}/h` : "units/h";
    description = t(
      "{0} shows an unusual rate of change between {1} and {2}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs)
    );
    alert = t(
      "Peak rate deviation: {0} from a typical rate of {1} at {2}.",
      formatTooltipValue(peakPoint.residual, rateUnit),
      formatTooltipValue(peakPoint.baselineValue, rateUnit),
      formatTooltipDateTimeFromMs(peakPoint.timeMs)
    );
  } else if (method === "iqr") {
    description = t(
      "{0} contains statistical outliers between {1} and {2}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs)
    );
    alert = t(
      "Peak value: {0}, deviating {1} from the median at {2}.",
      formatTooltipValue(peakPoint.value, unit),
      formatTooltipValue(Math.abs(peakPoint.residual), unit),
      formatTooltipDateTimeFromMs(peakPoint.timeMs)
    );
  } else if (method === "rolling_zscore") {
    description = t(
      "{0} shows statistically unusual values between {1} and {2}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs)
    );
    alert = t(
      "Peak deviation: {0} from a rolling mean of {1} at {2}.",
      formatTooltipValue(peakPoint.residual, unit),
      formatTooltipValue(peakPoint.baselineValue, unit),
      formatTooltipDateTimeFromMs(peakPoint.timeMs)
    );
  } else if (method === "persistence") {
    const flatRange =
      typeof cluster.flatRange === "number" ? cluster.flatRange : null;
    const rangeStr =
      flatRange !== null
        ? t(" (range: {0})", formatTooltipValue(flatRange, unit))
        : "";
    description = t(
      "{0} appears stuck or flat between {1} and {2}{3}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs),
      rangeStr
    );
    alert = t(
      "Value remained near {0} for an unusually long period.",
      formatTooltipValue(peakPoint.baselineValue, unit)
    );
  } else if (method === "comparison_window") {
    description = t(
      "{0} deviates significantly from the comparison window between {1} and {2}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs)
    );
    alert = t(
      "Peak deviation from comparison: {0} at {1}.",
      formatTooltipValue(peakPoint.residual, unit),
      formatTooltipDateTimeFromMs(peakPoint.timeMs)
    );
  } else {
    description = t(
      "{0} deviates from its expected trend between {1} and {2}.",
      label,
      formatTooltipDateTimeFromMs(startPoint.timeMs),
      formatTooltipDateTimeFromMs(endPoint.timeMs)
    );
    alert = t(
      "Peak deviation: {0} from a baseline of {1} at {2}.",
      formatTooltipValue(peakPoint.residual, unit),
      formatTooltipValue(peakPoint.baselineValue, unit),
      formatTooltipDateTimeFromMs(peakPoint.timeMs)
    );
  }
  return { methodLabel, description, alert };
}

export function buildAnomalyTooltipContent(
  regions: AnomalyRegion | Nullable<AnomalyRegion[]> | undefined
): Nullable<AnomalyTooltipContent> {
  let regionsArray: AnomalyRegion[];
  if (Array.isArray(regions)) {
    regionsArray = regions;
  } else if (regions) {
    regionsArray = [regions];
  } else {
    regionsArray = [];
  }
  if (regionsArray.length === 0) {
    return null;
  }

  const sections = regionsArray
    .map(buildAnomalyMethodSection)
    .filter((section): section is AnomalyTooltipSection => section !== null);
  if (sections.length === 0) {
    return null;
  }

  const instruction = msg(
    "Click the highlighted circle to add an annotation.",
    { id: "Click the highlighted circle to add an annotation." }
  );

  // Single region — check for "only" mode overlap (single cluster confirmed by multiple methods)
  if (sections.length === 1) {
    const section = sections[0];
    const cluster = regionsArray[0]?.cluster;
    const detectedByMethods =
      Array.isArray(cluster?.detectedByMethods) &&
      cluster.detectedByMethods.length > 1
        ? cluster.detectedByMethods
        : null;
    const isMultiMethod = detectedByMethods !== null;
    const title = isMultiMethod
      ? msg("⚠️ Multi-method Anomaly")
      : msg("⚠️ Anomaly Insight");
    const labels = getAnomalyMethodLabels();
    const confirmedNote = isMultiMethod
      ? `\n${msg("Confirmed by")} ${detectedByMethods.length} ${msg("methods:")} ${detectedByMethods
          .map(
            (method) =>
              labels[method as keyof typeof ANOMALY_METHOD_LABELS] || method
          )
          .join(", ")}.`
      : "";
    return {
      title,
      description: section.description + confirmedNote,
      alert: `${msg("Alert:")} ${section.alert}`,
      instruction,
    };
  }

  // Multiple regions — show each method's finding separately
  const description = sections
    .map((s) => `${s.methodLabel}:\n${s.description}`)
    .join("\n\n");
  const alert = sections.map((s) => `${s.methodLabel}: ${s.alert}`).join("\n");
  return {
    title: msg("⚠️ Multi-method Anomaly"),
    description,
    alert,
    instruction,
  };
}

function positionAnomalyTooltip(
  tooltip: Nullable<HTMLElement>,
  clientX: number,
  clientY: number,
  mainTooltip: Nullable<HTMLElement>,
  bounds: Nullable<TooltipBounds> = null
): void {
  if (!tooltip) {
    return;
  }
  tooltip.style.display = "block";
  const tipRect = tooltip.getBoundingClientRect();
  const tipW = tipRect.width || 220;
  const tipH = tipRect.height || 64;
  const gap = 12; // same gap as the main tooltip
  const minLeft = Number.isFinite(bounds?.left)
    ? (bounds?.left as number)
    : gap;
  const maxLeft = Number.isFinite(bounds?.right)
    ? (bounds?.right as number)
    : window.innerWidth - gap;
  const minTop = Number.isFinite(bounds?.top) ? (bounds?.top as number) : gap;
  const maxTop = Number.isFinite(bounds?.bottom)
    ? (bounds?.bottom as number)
    : window.innerHeight - gap;

  // Primary position: left of crosshair with the same gap as the main tooltip
  // → right edge of anomaly tooltip lands at clientX - gap (symmetric with main tooltip)
  let left = clientX - gap - tipW;
  if (left < minLeft) {
    // No room on the left — fall back to right of main tooltip
    const mainRect = mainTooltip ? mainTooltip.getBoundingClientRect() : null;
    left = mainRect ? mainRect.right + gap : clientX + gap;
  }

  // Vertically align with the top of the main tooltip
  const mainRect = mainTooltip ? mainTooltip.getBoundingClientRect() : null;
  let top = mainRect ? mainRect.top : clientY - tipH - gap;
  if (top + tipH > maxTop) {
    top = Math.max(minTop, maxTop - tipH);
  }

  left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft - tipW));
  top = Math.min(Math.max(top, minTop), Math.max(minTop, maxTop - tipH));

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function positionSecondaryTooltip(
  tooltip: Nullable<HTMLElement>,
  anchorTooltip: Nullable<HTMLElement>,
  bounds: Nullable<TooltipBounds> = null
): void {
  if (!tooltip || !anchorTooltip) {
    return;
  }
  tooltip.style.display = "block";
  const anchorRect = anchorTooltip.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const gap = 10;
  const minLeft = Number.isFinite(bounds?.left)
    ? (bounds?.left as number)
    : gap;
  const maxLeft = Number.isFinite(bounds?.right)
    ? (bounds?.right as number)
    : window.innerWidth - gap;
  const minTop = Number.isFinite(bounds?.top) ? (bounds?.top as number) : gap;
  const maxTop = Number.isFinite(bounds?.bottom)
    ? (bounds?.bottom as number)
    : window.innerHeight - gap;

  let left = anchorRect.right + gap;
  if (left + tipRect.width > maxLeft) {
    left = anchorRect.left - tipRect.width - gap;
  }

  let top = anchorRect.top;
  if (top + tipRect.height > maxTop) {
    top = Math.max(minTop, maxTop - tipRect.height);
  }

  left = Math.min(
    Math.max(left, minLeft),
    Math.max(minLeft, maxLeft - tipRect.width)
  );
  top = Math.min(
    Math.max(top, minTop),
    Math.max(minTop, maxTop - tipRect.height)
  );

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function positionTooltipBelow(
  tooltip: Nullable<HTMLElement>,
  anchorTooltip: Nullable<HTMLElement>,
  bounds: Nullable<TooltipBounds> = null
): void {
  if (!tooltip || !anchorTooltip) {
    return;
  }
  tooltip.style.display = "block";
  const anchorRect = anchorTooltip.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  const gap = 8;
  const minLeft = Number.isFinite(bounds?.left)
    ? (bounds?.left as number)
    : gap;
  const maxLeft = Number.isFinite(bounds?.right)
    ? (bounds?.right as number)
    : window.innerWidth - gap;
  const minTop = Number.isFinite(bounds?.top) ? (bounds?.top as number) : gap;
  const maxTop = Number.isFinite(bounds?.bottom)
    ? (bounds?.bottom as number)
    : window.innerHeight - gap;

  let left = anchorRect.left;
  if (left + tipRect.width > maxLeft) {
    left = Math.max(minLeft, maxLeft - tipRect.width);
  }

  let top = anchorRect.bottom + gap;
  if (top + tipRect.height > maxTop) {
    top = Math.max(minTop, anchorRect.top - tipRect.height - gap);
  }

  left = Math.min(
    Math.max(left, minLeft),
    Math.max(minLeft, maxLeft - tipRect.width)
  );
  top = Math.min(
    Math.max(top, minTop),
    Math.max(minTop, maxTop - tipRect.height)
  );

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function getAnnotationTooltipContainer(
  card: ChartInteractionHost
): Nullable<HTMLElement> {
  if (!card || !getRoot(card)) {
    return null;
  }
  return getRoot(card).getElementById("annotation-tooltips");
}

function clearAnnotationTooltips(card: ChartInteractionHost): void {
  const container = getAnnotationTooltipContainer(card);
  if (!container) {
    return;
  }
  container.innerHTML = "";
}

function buildAnnotationTooltip(
  card: ChartInteractionHost,
  event: ChartEventRecord
): HTMLDivElement {
  const interactionState = getInteractionState(card);
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip secondary annotation-tooltip";

  const hasValue = event?.chart_value != null && event.chart_value !== "";
  const message = event?.message || "Data point";
  const annotation =
    event?.annotation && event.annotation !== event.message
      ? event.annotation
      : "";
  const chips = buildTooltipRelatedChips(interactionState._hass, event);

  render(
    html`
      <div class="tt-time">${fmtDateTime(event.timestamp)}</div>
      ${hasValue
        ? html`<div class="tt-value">
            ${formatTooltipValue(event.chart_value, event.chart_unit)}
          </div>`
        : ""}
      <div class="tt-message-row">
        <span
          class="tt-dot"
          style="background:${event?.color || "#03a9f4"}"
        ></span>
        <span class="tt-message">${message}</span>
      </div>
      <div
        class="tt-annotation"
        style="display:${annotation ? "block" : "none"}"
      >
        ${annotation}
      </div>
      <div class="tt-entities" style="display:${chips ? "flex" : "none"}">
        ${chips}
      </div>
    `,
    tooltip
  );
  return tooltip;
}

function renderAnnotationTooltips(
  card: ChartInteractionHost,
  hover: Nullable<{ events?: ChartEventRecord[] }> | undefined,
  anchorTooltip: Nullable<HTMLElement>,
  bounds: Nullable<TooltipBounds> = null
): HTMLDivElement[] {
  const container = getAnnotationTooltipContainer(card);
  if (!container) {
    return [];
  }
  clearAnnotationTooltips(card);
  const annotationEvents = Array.isArray(hover?.events) ? hover.events : [];
  if (!annotationEvents.length) {
    return [];
  }

  const renderedTooltips = [];
  let anchorEl = anchorTooltip;
  for (const event of annotationEvents) {
    const tooltip = buildAnnotationTooltip(card, event);
    container.appendChild(tooltip);
    if (renderedTooltips.length === 0) {
      positionSecondaryTooltip(tooltip, anchorEl, bounds);
    } else {
      positionTooltipBelow(tooltip, anchorEl, bounds);
    }
    renderedTooltips.push(tooltip);
    anchorEl = tooltip;
  }
  return renderedTooltips;
}

export function showTooltip(
  card: ChartInteractionHost,
  _canvas: Nullable<HTMLCanvasElement>,
  _renderer: unknown,
  event: ChartEventRecord,
  clientX: number,
  clientY: number
): void {
  const interactionState = getInteractionState(card);
  const root = getRoot(card);
  const tooltip = root.getElementById("tooltip") as Nullable<HTMLElement>;
  const ttTime = root.getElementById("tt-time");
  const ttValue = root.getElementById("tt-value") as Nullable<HTMLElement>;
  const ttSeries = root.getElementById("tt-series") as Nullable<HTMLElement>;
  const ttMessageRow = root.getElementById(
    "tt-message-row"
  ) as Nullable<HTMLElement>;
  const ttDot = root.getElementById("tt-dot") as Nullable<HTMLElement>;
  const ttMsg = root.getElementById("tt-message");
  const ttAnn = root.getElementById("tt-annotation") as Nullable<HTMLElement>;
  const ttEntities = root.getElementById(
    "tt-entities"
  ) as Nullable<HTMLElement>;
  if (
    !tooltip ||
    !ttTime ||
    !ttValue ||
    !ttDot ||
    !ttMsg ||
    !ttAnn ||
    !ttEntities
  ) {
    return;
  }

  ttTime.textContent = fmtDateTime(event.timestamp);
  const hasValue = event.chart_value != null && event.chart_value !== "";
  ttValue.textContent = hasValue
    ? formatTooltipValue(event.chart_value, event.chart_unit)
    : "";
  ttValue.style.display = hasValue ? "block" : "none";
  if (ttSeries) {
    render(html``, ttSeries);
    ttSeries.style.display = "none";
  }
  ttDot.style.background = event.color || "#03a9f4";
  ttMsg.textContent = event.message || "";
  if (ttMessageRow) {
    ttMessageRow.style.display = "flex";
  }
  const ann = event.annotation !== event.message ? event.annotation : "";
  ttAnn.textContent = ann || "";
  ttAnn.style.display = ann ? "block" : "none";
  const chips = buildTooltipRelatedChips(interactionState._hass, event);
  render(chips ?? html``, ttEntities);
  ttEntities.style.display = chips ? "flex" : "none";

  const chartBounds = (
    root.querySelector(".chart-wrap") ?? card
  ).getBoundingClientRect();
  positionTooltip(tooltip, clientX, clientY, toChartBounds(chartBounds));
}

export function hideTooltip(card: ChartInteractionHost): void {
  const tooltip = getRoot(card).getElementById("tooltip");
  const anomalyTooltip = getRoot(card).getElementById("anomaly-tooltip");
  if (tooltip) {
    tooltip.style.display = "none";
  }
  if (anomalyTooltip) {
    anomalyTooltip.style.display = "none";
  }
  clearAnnotationTooltips(card);
}

function resolveTooltipSeriesLabel(entry: HoverValueEntry): string {
  const isSubordinate = entry.grouped === true && entry.rawVisible === true;
  const isComparisonDerived =
    entry.comparisonDerived === true && entry.grouped === true;
  if (entry.comparison === true) {
    const windowLabel = String(entry.windowLabel || msg("Date window"));
    if (entry.grouped === true) {
      return windowLabel;
    }
    return `${windowLabel}: ${String(entry.label || "")}`;
  }
  if (entry.trend === true) {
    const trendLabel = msg("Trend");
    if (isSubordinate || isComparisonDerived) {
      return trendLabel;
    }
    return `${trendLabel}: ${entry.baseLabel || entry.label || ""}`;
  }
  if (entry.rate === true) {
    const rateLabel = msg("Rate");
    if (isSubordinate || isComparisonDerived) {
      return rateLabel;
    }
    return `${rateLabel}: ${entry.baseLabel || entry.label || ""}`;
  }
  if (entry.delta === true) {
    const deltaLabel = msg("Delta");
    if (isSubordinate || isComparisonDerived) {
      return deltaLabel;
    }
    return `${deltaLabel}: ${entry.baseLabel || entry.label || ""}`;
  }
  if (entry.summary === true) {
    const summaryLabel = String(entry.summaryType || "").toUpperCase();
    if (isSubordinate || isComparisonDerived) {
      return summaryLabel;
    }
    return `${summaryLabel}: ${entry.baseLabel || entry.label || ""}`;
  }
  if (entry.threshold === true) {
    const thresholdLabel = msg("Threshold");
    if (isSubordinate || isComparisonDerived) {
      return thresholdLabel;
    }
    return `${thresholdLabel}: ${entry.baseLabel || entry.label || ""}`;
  }
  return String(entry.label || "");
}

export function showLineChartTooltip(
  card: ChartInteractionHost,
  hover: HoverState,
  clientX: number,
  clientY: number
): void {
  const root = getRoot(card);
  const tooltip = root.getElementById("tooltip") as Nullable<HTMLElement>;
  const ttTime = root.getElementById("tt-time");
  const ttValue = root.getElementById("tt-value") as Nullable<HTMLElement>;
  const ttSeries = root.getElementById("tt-series") as Nullable<HTMLElement>;
  const anomalyTooltip = root.getElementById(
    "anomaly-tooltip"
  ) as Nullable<HTMLElement>;
  const ttSecondaryTitle = root.getElementById("tt-secondary-title");
  const ttSecondaryDescription = root.getElementById(
    "tt-secondary-description"
  );
  const ttSecondaryAlert = root.getElementById("tt-secondary-alert");
  const ttSecondaryInstruction = root.getElementById(
    "tt-secondary-instruction"
  );
  const ttMessageRow = root.getElementById(
    "tt-message-row"
  ) as Nullable<HTMLElement>;
  const ttMsg = root.getElementById("tt-message");
  const ttAnn = root.getElementById("tt-annotation") as Nullable<HTMLElement>;
  const ttEntities = root.getElementById(
    "tt-entities"
  ) as Nullable<HTMLElement>;
  if (
    !tooltip ||
    !ttTime ||
    !ttValue ||
    !ttMessageRow ||
    !ttMsg ||
    !ttAnn ||
    !ttEntities
  ) {
    return;
  }

  const rangeStartMs = Number.isFinite(hover.rangeStartMs)
    ? (hover.rangeStartMs as number)
    : hover.timeMs;
  const rangeEndMs = Number.isFinite(hover.rangeEndMs)
    ? (hover.rangeEndMs as number)
    : hover.timeMs;
  ttTime.textContent =
    rangeStartMs === rangeEndMs
      ? fmtDateTime(new Date(hover.timeMs).toISOString())
      : `${fmtDateTime(new Date(rangeStartMs).toISOString())} - ${fmtDateTime(new Date(rangeEndMs).toISOString())}`;

  const values = Array.isArray(hover.values) ? hover.values : [];
  const trendValues = Array.isArray(hover.trendValues) ? hover.trendValues : [];
  const rateValues = Array.isArray(hover.rateValues) ? hover.rateValues : [];
  const deltaValues = Array.isArray(hover.deltaValues) ? hover.deltaValues : [];
  const summaryValues = Array.isArray(hover.summaryValues)
    ? hover.summaryValues
    : [];
  const thresholdValues = Array.isArray(hover.thresholdValues)
    ? hover.thresholdValues
    : [];
  const binaryValues = Array.isArray(hover.binaryValues)
    ? hover.binaryValues
    : [];
  const comparisonValues = Array.isArray(hover.comparisonValues)
    ? hover.comparisonValues
    : [];
  const displayRows: HoverValueEntry[] = [];
  const usedTrendRows = new Set<number>();
  const usedRateRows = new Set<number>();
  const usedDeltaRows = new Set<number>();
  const usedSummaryRows = new Set<number>();
  const usedThresholdRows = new Set<number>();
  const usedComparisonRows = new Set<number>();
  const pushComparisonDerivedRows = (
    comparisonEntry: HoverValueEntry,
    comparisonIndex: number
  ) => {
    trendValues.forEach((trendEntry, trendIndex) => {
      if (usedTrendRows.has(trendIndex)) {
        return;
      }
      if (
        trendEntry.comparisonParentId !== comparisonEntry.entityId &&
        !(
          trendEntry.relatedEntityId === comparisonEntry.relatedEntityId &&
          trendEntry.windowLabel === comparisonEntry.windowLabel
        )
      ) {
        return;
      }
      usedTrendRows.add(trendIndex);
      displayRows.push({
        ...trendEntry,
        rawVisible: true,
        comparisonDerived: true,
        grouped: true,
        key: `comparison-trend-${comparisonIndex}-${trendIndex}`,
      });
    });
    rateValues.forEach((rateEntry, rateIndex) => {
      if (usedRateRows.has(rateIndex)) {
        return;
      }
      if (
        rateEntry.comparisonParentId !== comparisonEntry.entityId &&
        !(
          rateEntry.relatedEntityId === comparisonEntry.relatedEntityId &&
          rateEntry.windowLabel === comparisonEntry.windowLabel
        )
      ) {
        return;
      }
      usedRateRows.add(rateIndex);
      displayRows.push({
        ...rateEntry,
        rawVisible: true,
        comparisonDerived: true,
        grouped: true,
        key: `comparison-rate-${comparisonIndex}-${rateIndex}`,
      });
    });
    summaryValues.forEach((summaryEntry, summaryIndex) => {
      if (usedSummaryRows.has(summaryIndex)) {
        return;
      }
      if (
        summaryEntry.comparisonParentId !== comparisonEntry.entityId &&
        !(
          summaryEntry.relatedEntityId === comparisonEntry.relatedEntityId &&
          summaryEntry.windowLabel === comparisonEntry.windowLabel
        )
      ) {
        return;
      }
      usedSummaryRows.add(summaryIndex);
      displayRows.push({
        ...summaryEntry,
        rawVisible: true,
        comparisonDerived: true,
        grouped: true,
        key: `comparison-summary-${comparisonIndex}-${summaryIndex}`,
      });
    });
    thresholdValues.forEach((thresholdEntry, thresholdIndex) => {
      if (usedThresholdRows.has(thresholdIndex)) {
        return;
      }
      if (
        thresholdEntry.comparisonParentId !== comparisonEntry.entityId &&
        !(
          thresholdEntry.relatedEntityId === comparisonEntry.relatedEntityId &&
          thresholdEntry.windowLabel === comparisonEntry.windowLabel
        )
      ) {
        return;
      }
      usedThresholdRows.add(thresholdIndex);
      displayRows.push({
        ...thresholdEntry,
        rawVisible: true,
        comparisonDerived: true,
        grouped: true,
        key: `comparison-threshold-${comparisonIndex}-${thresholdIndex}`,
      });
    });
  };
  values.forEach((entry, index) => {
    displayRows.push(entry);
    trendValues.forEach((trendEntry, trendIndex) => {
      if (usedTrendRows.has(trendIndex)) {
        return;
      }
      const sameEntity =
        trendEntry.relatedEntityId &&
        trendEntry.relatedEntityId === entry.entityId;
      const sameLabel =
        !trendEntry.relatedEntityId &&
        trendEntry.baseLabel &&
        trendEntry.baseLabel === entry.label;
      if (!sameEntity && !sameLabel) {
        return;
      }
      usedTrendRows.add(trendIndex);
      displayRows.push({
        ...trendEntry,
        rawVisible: trendEntry.rawVisible !== false,
        grouped: true,
        key: `trend-${index}-${trendIndex}`,
      });
    });
    rateValues.forEach((rateEntry, rateIndex) => {
      if (usedRateRows.has(rateIndex)) {
        return;
      }
      const sameEntity =
        rateEntry.relatedEntityId &&
        rateEntry.relatedEntityId === entry.entityId;
      const sameLabel =
        !rateEntry.relatedEntityId &&
        rateEntry.baseLabel &&
        rateEntry.baseLabel === entry.label;
      if (!sameEntity && !sameLabel) {
        return;
      }
      usedRateRows.add(rateIndex);
      displayRows.push({
        ...rateEntry,
        rawVisible: rateEntry.rawVisible !== false,
        grouped: true,
        key: `rate-${index}-${rateIndex}`,
      });
    });
    deltaValues.forEach((deltaEntry, deltaIndex) => {
      if (usedDeltaRows.has(deltaIndex)) {
        return;
      }
      const sameEntity =
        deltaEntry.relatedEntityId &&
        deltaEntry.relatedEntityId === entry.entityId;
      const sameLabel =
        !deltaEntry.relatedEntityId &&
        deltaEntry.baseLabel &&
        deltaEntry.baseLabel === entry.label;
      if (!sameEntity && !sameLabel) {
        return;
      }
      usedDeltaRows.add(deltaIndex);
      displayRows.push({
        ...deltaEntry,
        rawVisible: deltaEntry.rawVisible !== false,
        grouped: true,
        key: `delta-${index}-${deltaIndex}`,
      });
    });
    summaryValues.forEach((summaryEntry, summaryIndex) => {
      if (usedSummaryRows.has(summaryIndex)) {
        return;
      }
      const sameEntity =
        summaryEntry.relatedEntityId &&
        summaryEntry.relatedEntityId === entry.entityId;
      const sameLabel =
        !summaryEntry.relatedEntityId &&
        summaryEntry.baseLabel &&
        summaryEntry.baseLabel === entry.label;
      if (!sameEntity && !sameLabel) {
        return;
      }
      usedSummaryRows.add(summaryIndex);
      displayRows.push({
        ...summaryEntry,
        rawVisible: summaryEntry.rawVisible !== false,
        grouped: true,
        key: `summary-${index}-${summaryIndex}`,
      });
    });
    thresholdValues.forEach((thresholdEntry, thresholdIndex) => {
      if (usedThresholdRows.has(thresholdIndex)) {
        return;
      }
      const sameEntity =
        thresholdEntry.relatedEntityId &&
        thresholdEntry.relatedEntityId === entry.entityId;
      const sameLabel =
        !thresholdEntry.relatedEntityId &&
        thresholdEntry.baseLabel &&
        thresholdEntry.baseLabel === entry.label;
      if (!sameEntity && !sameLabel) {
        return;
      }
      usedThresholdRows.add(thresholdIndex);
      displayRows.push({
        ...thresholdEntry,
        rawVisible: thresholdEntry.rawVisible !== false,
        grouped: true,
        key: `threshold-${index}-${thresholdIndex}`,
      });
    });
    comparisonValues.forEach((compEntry, compIndex) => {
      if (usedComparisonRows.has(compIndex)) {
        return;
      }
      if (
        !compEntry.relatedEntityId ||
        compEntry.relatedEntityId !== entry.entityId
      ) {
        return;
      }
      usedComparisonRows.add(compIndex);
      const groupedEntry = {
        ...compEntry,
        grouped: true,
        comparison: true,
        key: `comparison-${index}-${compIndex}`,
      };
      displayRows.push(groupedEntry);
      pushComparisonDerivedRows(groupedEntry, compIndex);
    });
  });
  trendValues.forEach((trendEntry, trendIndex) => {
    if (usedTrendRows.has(trendIndex)) {
      return;
    }
    if (
      trendEntry.comparisonDerived === true ||
      typeof trendEntry.comparisonParentId === "string"
    ) {
      return;
    }
    displayRows.push({
      ...trendEntry,
      rawVisible: trendEntry.rawVisible !== false,
    });
  });
  rateValues.forEach((rateEntry, rateIndex) => {
    if (usedRateRows.has(rateIndex)) {
      return;
    }
    if (
      rateEntry.comparisonDerived === true ||
      typeof rateEntry.comparisonParentId === "string"
    ) {
      return;
    }
    displayRows.push({
      ...rateEntry,
      rawVisible: rateEntry.rawVisible !== false,
    });
  });
  deltaValues.forEach((deltaEntry, deltaIndex) => {
    if (usedDeltaRows.has(deltaIndex)) {
      return;
    }
    displayRows.push({
      ...deltaEntry,
      rawVisible: deltaEntry.rawVisible !== false,
    });
  });
  summaryValues.forEach((summaryEntry, summaryIndex) => {
    if (usedSummaryRows.has(summaryIndex)) {
      return;
    }
    if (
      summaryEntry.comparisonDerived === true ||
      typeof summaryEntry.comparisonParentId === "string"
    ) {
      return;
    }
    displayRows.push({
      ...summaryEntry,
      rawVisible: summaryEntry.rawVisible !== false,
    });
  });
  thresholdValues.forEach((thresholdEntry, thresholdIndex) => {
    if (usedThresholdRows.has(thresholdIndex)) {
      return;
    }
    if (
      thresholdEntry.comparisonDerived === true ||
      typeof thresholdEntry.comparisonParentId === "string"
    ) {
      return;
    }
    displayRows.push({
      ...thresholdEntry,
      rawVisible: thresholdEntry.rawVisible !== false,
    });
  });
  comparisonValues.forEach((compEntry, compIndex) => {
    if (usedComparisonRows.has(compIndex)) {
      return;
    }
    const groupedEntry = { ...compEntry, comparison: true };
    displayRows.push(groupedEntry);
    pushComparisonDerivedRows(groupedEntry, compIndex);
  });
  displayRows.push(...binaryValues);
  const useSingleValueMode =
    displayRows.length === 1 &&
    trendValues.length === 0 &&
    rateValues.length === 0 &&
    deltaValues.length === 0 &&
    summaryValues.length === 0 &&
    thresholdValues.length === 0 &&
    comparisonValues.length === 0 &&
    binaryValues.length === 0 &&
    displayRows[0]?.comparison !== true;
  if (useSingleValueMode) {
    const value = displayRows[0];
    ttValue.textContent = value
      ? formatTooltipDisplayValue(value.value, value.unit)
      : "";
    ttValue.style.display = value ? "block" : "none";
    if (ttSeries) {
      render(html``, ttSeries);
      ttSeries.style.display = "none";
    }
  } else {
    ttValue.textContent = "";
    ttValue.style.display = "none";
    if (ttSeries) {
      render(
        html`${displayRows.map(
          (entry) => html`
            <div
              class="tt-series-row ${entry.grouped === true &&
              entry.rawVisible === true
                ? "subordinate"
                : ""}"
            >
              <div class="tt-series-main">
                ${entry.grouped === true && entry.rawVisible === true
                  ? ""
                  : html`<span
                      class="tt-dot"
                      style="background:${entry.color || "#03a9f4"}"
                    ></span>`}
                <span class="tt-series-label"
                  >${resolveTooltipSeriesLabel(entry)}</span
                >
              </div>
              <span class="tt-series-value"
                >${formatTooltipDisplayValue(entry.value, entry.unit)}</span
              >
            </div>
          `
        )}`,
        ttSeries
      );
      ttSeries.style.display = displayRows.length ? "grid" : "none";
    }
  }

  ttMessageRow.style.display = "none";
  ttMsg.textContent = "";
  ttAnn.textContent = "";
  ttAnn.style.display = "none";
  render(html``, ttEntities);
  ttEntities.style.display = "none";

  if (
    anomalyTooltip &&
    ttSecondaryTitle &&
    ttSecondaryDescription &&
    ttSecondaryAlert &&
    ttSecondaryInstruction
  ) {
    const anomalyContent = buildAnomalyTooltipContent(hover.anomalyRegions);
    if (anomalyContent) {
      ttSecondaryTitle.textContent = anomalyContent.title;
      ttSecondaryDescription.textContent = anomalyContent.description;
      ttSecondaryAlert.textContent = anomalyContent.alert;
      ttSecondaryInstruction.textContent = anomalyContent.instruction;
    } else {
      ttSecondaryTitle.textContent = "";
      ttSecondaryDescription.textContent = "";
      ttSecondaryAlert.textContent = "";
      ttSecondaryInstruction.textContent = "";
      anomalyTooltip.style.display = "none";
    }
  }

  const chartBounds = (
    root.querySelector(".chart-wrap") ?? card
  ).getBoundingClientRect();
  positionTooltip(tooltip, clientX, clientY, toChartBounds(chartBounds));
  if (anomalyTooltip && (hover.anomalyRegions?.length ?? 0) > 0) {
    positionAnomalyTooltip(
      anomalyTooltip,
      clientX,
      clientY,
      tooltip,
      toChartBounds(chartBounds)
    );
  }
  if (Array.isArray(hover.events) && hover.events.length > 0) {
    renderAnnotationTooltips(card, hover, tooltip, toChartBounds(chartBounds));
  } else {
    clearAnnotationTooltips(card);
  }
}

export function buildTooltipRelatedChips(
  hass: Nullable<HassLike> | undefined,
  event: Nullable<TooltipRelatedEvent> | undefined
): TemplateResult | null {
  const entities = Array.isArray(event?.entity_ids) ? event.entity_ids : [];
  const devices = Array.isArray(event?.device_ids) ? event.device_ids : [];
  const areas = Array.isArray(event?.area_ids) ? event.area_ids : [];
  const labels = Array.isArray(event?.label_ids) ? event.label_ids : [];
  const chips = [
    ...entities.map((id) => ({
      icon: entityIcon(hass, id),
      label: entityName(hass, id),
    })),
    ...devices.map((id) => ({
      icon: deviceIcon(hass, id),
      label: deviceName(hass, id),
    })),
    ...areas.map((id) => ({
      icon: areaIcon(hass, id),
      label: areaName(hass, id),
    })),
    ...labels.map((id) => ({
      icon: labelIcon(hass, id),
      label: labelName(hass, id),
    })),
  ].filter((chip) => chip.label);
  if (!chips.length) return null;
  return html`${chips.map(
    (chip) => html`
      <span class="tt-entity-chip" title="${chip.label}">
        <ha-icon icon="${chip.icon}"></ha-icon>
        <span>${chip.label}</span>
      </span>
    `
  )}`;
}

export function showLineChartCrosshair(
  card: ChartInteractionHost,
  renderer: Pick<ChartRenderer, "pad" | "ch">,
  hover: HoverState
): void {
  const overlay = getRoot(card).getElementById("chart-crosshair");
  const vertical = getRoot(card).getElementById("crosshair-vertical");
  const horizontal = getRoot(card).getElementById("crosshair-horizontal");
  const points = getRoot(card).getElementById("crosshair-points");
  const addButton = getRoot(card).getElementById("chart-add-annotation");
  if (!overlay || !vertical || !horizontal || !points) return;

  overlay.hidden = false;
  vertical.style.left = `${hover.x}px`;
  if (hover.splitVertical) {
    vertical.style.top = `${hover.splitVertical.top}px`;
    vertical.style.height = `${hover.splitVertical.height}px`;
  } else {
    vertical.style.top = `${renderer.pad.top}px`;
    vertical.style.height = `${renderer.ch}px`;
  }
  horizontal.hidden = true;
  const crosshairValues = [
    ...(hover.values || []),
    ...(hover.showTrendCrosshairs === true
      ? (hover.trendValues || []).filter(
          (entry) => entry.showCrosshair === true
        )
      : []),
    ...(hover.showRateCrosshairs === true
      ? (hover.rateValues || []).filter((entry) => entry.showCrosshair === true)
      : []),
    ...(hover.comparisonValues || []),
  ];
  render(
    html`
      ${crosshairValues
        .filter((entry) => entry.hasValue !== false)
        .map(
          (entry) => html`
            <span
              class="crosshair-line horizontal series ${hover.emphasizeGuides
                ? "emphasized"
                : "subtle"}"
              style="top:${entry.y}px;color:${entry.color ||
              "#03a9f4"};opacity:${Number.isFinite(entry.opacity)
                ? entry.opacity
                : 1}"
            ></span>
          `
        )}
      ${crosshairValues
        .filter((entry) => entry.hasValue !== false)
        .map(
          (entry) => html`
            <span
              class="crosshair-point"
              style="left:${entry.x}px;top:${entry.y}px;background:${entry.color ||
              "#03a9f4"};opacity:${Number.isFinite(entry.opacity)
                ? entry.opacity
                : 1}"
            ></span>
          `
        )}
    `,
    points
  );
  renderChartAxisHoverDots(card, crosshairValues);
  if (addButton && addButton.dataset.allowAddAnnotation !== "false") {
    addButton.hidden = false;
    addButton.style.left = `${hover.x}px`;
    if (hover.splitVertical) {
      addButton.style.top = `${hover.splitVertical.top + hover.splitVertical.height}px`;
    } else {
      addButton.style.top = `${renderer.pad.top + renderer.ch}px`;
    }
  }
}

export function dispatchLineChartHover(
  card: ChartInteractionHost,
  hover: Nullable<HoverState>
): void {
  card.dispatchEvent(
    new CustomEvent("hass-datapoints-chart-hover", {
      bubbles: true,
      composed: true,
      detail: hover ? { timeMs: hover.timeMs } : { timeMs: null },
    })
  );
}

function findNearestSeriesPointTime(
  seriesPoints: Nullable<SeriesPoint[]> | undefined,
  timeMs: number
): Nullable<number> {
  if (!Array.isArray(seriesPoints) || seriesPoints.length === 0) {
    return null;
  }
  let lo = 0;
  let hi = seriesPoints.length - 1;
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (seriesPoints[mid][0] <= timeMs) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const left = seriesPoints[lo]?.[0];
  const right = seriesPoints[hi]?.[0];
  if (!Number.isFinite(left) && !Number.isFinite(right)) {
    return null;
  }
  if (!Number.isFinite(left)) {
    return right;
  }
  if (!Number.isFinite(right)) {
    return left;
  }
  return Math.abs(left - timeMs) <= Math.abs(right - timeMs) ? left : right;
}

export function resolveLineChartHoverTime(
  series: Nullable<HoverSeriesLike[]> | undefined,
  timeMs: number,
  mode = "follow_series"
): number {
  if (mode !== "snap_to_data_points") {
    return timeMs;
  }
  let bestTime = null;
  let bestDistance = Infinity;
  for (const seriesItem of Array.isArray(series) ? series : []) {
    const candidateTime = findNearestSeriesPointTime(seriesItem?.pts, timeMs);
    if (candidateTime == null || !Number.isFinite(candidateTime)) {
      continue;
    }
    const distance = Math.abs(candidateTime - timeMs);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestTime = candidateTime;
    }
  }
  return bestTime != null && Number.isFinite(bestTime) ? bestTime : timeMs;
}

export function hideLineChartHover(card: ChartInteractionHost): void {
  dispatchLineChartHover(card, null);
  hideTooltip(card);
  const overlay = getRoot(card).getElementById("chart-crosshair");
  const points = getRoot(card).getElementById("crosshair-points");
  const addButton = getRoot(card).getElementById("chart-add-annotation");
  if (overlay) overlay.hidden = true;
  if (points) render(html``, points);
  renderChartAxisHoverDots(card, []);
  const horizontal = getRoot(card).getElementById("crosshair-horizontal");
  if (horizontal) horizontal.hidden = true;
  if (addButton) addButton.hidden = true;
}

export function attachLineChartHover(
  card: ChartInteractionHost,
  canvas: Nullable<HTMLCanvasElement>,
  renderer: Nullable<ChartRenderer>,
  series: Nullable<HoverSeriesLike[]> | undefined,
  events: Nullable<ChartEventRecord[]> | undefined,
  t0: number,
  t1: number,
  vMin: number,
  vMax: number,
  axes: Nullable<ResolvedAxis[]> = null,
  options: AttachLineChartHoverOptions = {}
): void {
  const interactionState = getInteractionState(card);
  if (!canvas || !renderer) {
    return;
  }
  if (interactionState._chartHoverCleanup) {
    interactionState._chartHoverCleanup();
    interactionState._chartHoverCleanup = null;
  }

  const resolvedSeries = Array.isArray(series) ? series : [];
  const eventThresholdMs = renderer.cw ? 14 * ((t1 - t0) / renderer.cw) : 0;
  const binaryStates = Array.isArray(options.binaryStates)
    ? options.binaryStates
    : [];
  const comparisonSeries = Array.isArray(options.comparisonSeries)
    ? options.comparisonSeries
    : [];
  const trendSeries = Array.isArray(options.trendSeries)
    ? options.trendSeries
    : [];
  const rateSeries = Array.isArray(options.rateSeries)
    ? options.rateSeries
    : [];
  const deltaSeries = Array.isArray(options.deltaSeries)
    ? options.deltaSeries
    : [];
  const summarySeries = Array.isArray(options.summarySeries)
    ? options.summarySeries
    : [];
  const thresholdSeries = Array.isArray(options.thresholdSeries)
    ? options.thresholdSeries
    : [];
  const anomalyRegions = Array.isArray(options.anomalyRegions)
    ? options.anomalyRegions
    : [];
  if (
    !resolvedSeries.length &&
    !binaryStates.length &&
    !comparisonSeries.length &&
    !trendSeries.length &&
    !rateSeries.length &&
    !deltaSeries.length &&
    !summarySeries.length &&
    !thresholdSeries.length &&
    !anomalyRegions.length
  ) {
    return;
  }
  const hoverSurfaceEl = options.hoverSurfaceEl || null;
  const addAnnotationButton =
    getRoot(card)?.getElementById("chart-add-annotation") || null;
  const resolveHoverAxis = (
    seriesItem: HoverSeriesLike
  ): HoverAxisLike | ResolvedAxis =>
    seriesItem.axis || (axes && axes[0]) || { min: vMin, max: vMax };
  const buildHoverValueEntry = (
    seriesItem: HoverSeriesLike,
    value: Nullable<number | string>,
    axis: HoverAxisLike | ResolvedAxis,
    extra: Partial<HoverValueEntry> = {},
    entryOpts: { includePosition?: boolean; x?: number } = {}
  ): HoverValueEntry => {
    const hasNumericValue = typeof value === "number" && Number.isFinite(value);
    const includePosition =
      entryOpts.includePosition === true && hasNumericValue;
    return {
      entityId: seriesItem.entityId || "",
      comparisonParentId: seriesItem.comparisonParentId || "",
      relatedEntityId: seriesItem.relatedEntityId || "",
      label: seriesItem.label || seriesItem.entityId || "",
      baseLabel: seriesItem.baseLabel || "",
      windowLabel: seriesItem.windowLabel || "",
      value: hasNumericValue ? value : (value ?? null),
      unit: seriesItem.unit || "",
      color: seriesItem.color,
      opacity: Number.isFinite(seriesItem.hoverOpacity)
        ? seriesItem.hoverOpacity
        : 1,
      hasValue: hasNumericValue || value != null,
      x: includePosition ? entryOpts.x : undefined,
      y: includePosition
        ? renderer.yOf(value as number, axis.min, axis.max)
        : undefined,
      axisSide: axis.side === "right" ? "right" : "left",
      axisSlot: Number.isFinite(axis.slot) ? axis.slot : 0,
      rawVisible: seriesItem.rawVisible !== false,
      comparisonDerived: seriesItem.comparisonDerived === true,
      showCrosshair: seriesItem.showCrosshair === true,
      ...extra,
    };
  };
  const findAnomalyRegions = (
    clientX: number,
    clientY: number
  ): AnomalyRegion[] => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return [];
    }
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    const hits: AnomalyRegion[] = [];
    for (const region of anomalyRegions) {
      const radiusX = Number(region?.radiusX) || 0;
      const radiusY = Number(region?.radiusY) || 0;
      if (radiusX <= 0 || radiusY <= 0) {
        continue;
      }
      const dx = (localX - (region.centerX as number)) / radiusX;
      const dy = (localY - (region.centerY as number)) / radiusY;
      if (dx * dx + dy * dy <= 1) {
        hits.push(region);
      }
    }
    return hits;
  };
  const buildHoverState = (
    clientX: number,
    clientY: number
  ): Nullable<HoverState> => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height || !renderer.cw || !renderer.ch) {
      return null;
    }

    const localX = clampChartValue(
      clientX - rect.left,
      renderer.pad.left,
      renderer.pad.left + renderer.cw
    );
    const localY = clampChartValue(
      clientY - rect.top,
      renderer.pad.top,
      renderer.pad.top + renderer.ch
    );
    const ratio = renderer.cw ? (localX - renderer.pad.left) / renderer.cw : 0;
    const rawTimeMs = t0 + ratio * (t1 - t0);
    const timeMs = resolveLineChartHoverTime(
      resolvedSeries,
      rawTimeMs,
      options.hoverSnapMode || "follow_series"
    );
    const x = renderer.xOf(timeMs, t0, t1);

    const values = resolvedSeries.map((seriesItem) => {
      const value = renderer._interpolateValue(seriesItem.pts || [], timeMs);
      const axis = resolveHoverAxis(seriesItem);
      return buildHoverValueEntry(
        seriesItem,
        value,
        axis,
        {},
        {
          includePosition: value != null,
          x,
        }
      );
    });

    const comparisonValues = comparisonSeries.map((seriesItem) => {
      const value = renderer._interpolateValue(seriesItem.pts || [], timeMs);
      const axis = resolveHoverAxis(seriesItem);
      return buildHoverValueEntry(
        seriesItem,
        value,
        axis,
        { comparison: true },
        { includePosition: value != null, x }
      );
    });

    const trendValues = trendSeries.map((seriesItem) => {
      const value = renderer._interpolateValue(seriesItem.pts || [], timeMs);
      const axis = resolveHoverAxis(seriesItem);
      return buildHoverValueEntry(
        seriesItem,
        value,
        axis,
        { trend: true },
        { includePosition: value != null, x }
      );
    });
    const rateValues = rateSeries.map((seriesItem) => {
      const value = renderer._interpolateValue(seriesItem.pts || [], timeMs);
      const axis = resolveHoverAxis(seriesItem);
      return buildHoverValueEntry(
        seriesItem,
        value,
        axis,
        { rate: true },
        { includePosition: value != null, x }
      );
    });
    const deltaValues = deltaSeries.map((seriesItem) => {
      const value = renderer._interpolateValue(seriesItem.pts || [], timeMs);
      const axis = resolveHoverAxis(seriesItem);
      return buildHoverValueEntry(
        seriesItem,
        value,
        axis,
        { delta: true },
        { includePosition: value != null, x }
      );
    });
    const summaryValues = summarySeries.map((seriesItem) => {
      const axis = resolveHoverAxis(seriesItem);
      const value = Number(seriesItem.value);
      return buildHoverValueEntry(seriesItem, value, axis, {
        summary: true,
        summaryType: seriesItem.summaryType || "",
      });
    });
    const thresholdValues = thresholdSeries.map((seriesItem) => {
      const axis = resolveHoverAxis(seriesItem);
      const value = Number(seriesItem.value);
      return buildHoverValueEntry(seriesItem, value, axis, {
        threshold: true,
      });
    });

    const plottedValues = [
      ...values.filter((entry) => entry?.hasValue !== false),
      ...comparisonValues.filter((entry) => entry?.hasValue !== false),
      ...rateValues.filter((entry) => entry?.hasValue !== false),
      ...(options.showTrendCrosshairs === true
        ? trendValues.filter(
            (entry) => entry?.hasValue !== false && entry.showCrosshair === true
          )
        : []),
    ];

    let rangeStartMs = timeMs;
    let rangeEndMs = timeMs;
    let primary = plottedValues[0] || null;
    if (primary) {
      for (const entry of plottedValues) {
        if (
          Number.isFinite(entry.y) &&
          Number.isFinite(primary.y) &&
          Math.abs((entry.y as number) - localY) <
            Math.abs((primary.y as number) - localY)
        ) {
          primary = entry;
        }
      }
    }
    const activePrimarySeries = primary
      ? resolvedSeries.find(
          (seriesItem) => seriesItem.entityId === primary.entityId
        ) || null
      : null;
    if (activePrimarySeries?.pts?.length) {
      const pts = activePrimarySeries.pts;
      const pLen = pts.length;
      // Binary search for the rightmost index whose timestamp <= timeMs.
      let lo = 0;
      let hi = pLen - 1;
      let previousIndex = -1;
      if (pts[0][0] <= timeMs) {
        while (lo + 1 < hi) {
          const mid = Math.floor((lo + hi) / 2);
          if (pts[mid][0] <= timeMs) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        previousIndex = pts[hi][0] <= timeMs ? hi : lo;
      }
      const nextIndex = previousIndex < pLen - 1 ? previousIndex + 1 : -1;
      const previous = previousIndex >= 0 ? pts[previousIndex] : null;
      let next = null;
      if (nextIndex >= 0) {
        next = pts[nextIndex];
      } else if (previousIndex < 0) {
        next = pts[0];
      }
      if (previous && next) {
        const prevPrev = pts[Math.max(0, previousIndex - 1)] || previous;
        const nextNext = pts[Math.min(pLen - 1, nextIndex + 1)] || next;
        rangeStartMs =
          previous === next
            ? previous[0]
            : Math.round((previous[0] + prevPrev[0]) / 2);
        rangeEndMs =
          previous === next ? next[0] : Math.round((next[0] + nextNext[0]) / 2);
      } else if (previous) {
        rangeStartMs = previous[0];
        rangeEndMs = previous[0];
      } else if (next) {
        rangeStartMs = next[0];
        rangeEndMs = next[0];
      }
    }

    const binaryValues: HoverValueEntry[] = binaryStates
      .map((entry) => {
        const activeSpan = (entry.spans || []).find(
          (span) => timeMs >= span.start && timeMs <= span.end
        );
        return {
          entityId: entry.entityId || "",
          label: entry.label || entry.entityId || "",
          value: activeSpan ? entry.onLabel || "on" : entry.offLabel || "off",
          unit: "",
          color: entry.color,
          hasValue: true,
          active: !!activeSpan,
        };
      })
      .filter((entry) => Boolean(entry.label));
    if (
      !values.length &&
      !binaryValues.length &&
      !trendValues.length &&
      !rateValues.length &&
      !deltaValues.length &&
      !summaryValues.length &&
      !thresholdValues.length &&
      !comparisonValues.length
    ) {
      return null;
    }

    const fallbackY = renderer.pad.top + 12;
    const hoverY = primary ? primary.y : fallbackY;

    const hoveredEvents: HoveredEventRecord[] = [];
    for (const event of events || []) {
      const eventTime = new Date(event.timestamp).getTime();
      if (eventTime < t0 || eventTime > t1) {
        continue;
      }
      const distance = Math.abs(eventTime - timeMs);
      if (distance <= eventThresholdMs) {
        hoveredEvents.push({
          ...event,
          _hoverDistanceMs: distance,
        });
      }
    }
    hoveredEvents.sort((left, right) => {
      const distanceDelta =
        (left._hoverDistanceMs || 0) - (right._hoverDistanceMs || 0);
      if (distanceDelta !== 0) {
        return distanceDelta;
      }
      return (
        new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
      );
    });
    const normalizedHoveredEvents: ChartEventRecord[] = hoveredEvents.map(
      (event) => {
        const { _hoverDistanceMs: _, ...normalizedEvent } = event;
        return normalizedEvent;
      }
    );

    return {
      x,
      y: hoverY,
      timeMs,
      rangeStartMs,
      rangeEndMs,
      values,
      trendValues,
      rateValues,
      deltaValues: options.showDeltaTooltip === true ? deltaValues : [],
      summaryValues,
      thresholdValues,
      comparisonValues,
      binaryValues,
      primary,
      event: normalizedHoveredEvents[0] || null,
      events: normalizedHoveredEvents,
      emphasizeGuides: options.emphasizeHoverGuides === true,
      showTrendCrosshairs: options.showTrendCrosshairs === true,
      showRateCrosshairs: options.showRateCrosshairs === true,
      hideRawData: options.hideRawData === true,
    };
  };

  const showFromPointer = (clientX: number, clientY: number): void => {
    if (interactionState._chartZoomDragging) {
      return;
    }
    const anomalyRegionsHit = findAnomalyRegions(clientX, clientY);
    const hover = buildHoverState(clientX, clientY);
    if (!hover) {
      interactionState._chartLastHover = null;
      hideLineChartHover(card);
      canvas.style.cursor = "default";
      return;
    }
    hover.anomalyRegions = anomalyRegionsHit;
    interactionState._chartLastHover = hover;
    showLineChartCrosshair(card, renderer, hover);
    if (
      options.showTooltip !== false ||
      (Array.isArray(hover.events) && hover.events.length > 0)
    ) {
      showLineChartTooltip(card, hover, clientX, clientY);
    } else {
      hideTooltip(card);
    }
    dispatchLineChartHover(card, hover);
    canvas.style.cursor =
      anomalyRegionsHit.length > 0 ? "pointer" : "crosshair";
  };

  const hideHover = (): void => {
    interactionState._chartLastHover = null;
    hideLineChartHover(card);
    canvas.style.cursor = "default";
  };

  // Throttle mousemove processing to one frame — intermediate positions are
  // dropped because the visible result of each frame overwrites the last.
  let _rafHandle: FrameHandle = null;
  let _pendingX = 0;
  let _pendingY = 0;
  const onMouseMove = (ev: MouseEvent): void => {
    _pendingX = ev.clientX;
    _pendingY = ev.clientY;
    if (_rafHandle !== null) {
      return;
    }
    _rafHandle = requestAnimationFrame(() => {
      _rafHandle = null;
      showFromPointer(_pendingX, _pendingY);
    });
  };
  const onMouseLeave = (ev: MouseEvent): void => {
    const nextTarget = ev.relatedTarget;
    if (
      nextTarget instanceof Node &&
      hoverSurfaceEl &&
      hoverSurfaceEl.contains(nextTarget)
    ) {
      return;
    }
    if (
      nextTarget instanceof Node &&
      addAnnotationButton &&
      addAnnotationButton.contains(nextTarget)
    ) {
      return;
    }
    hideHover();
  };
  const onOverlayMove = (ev: MouseEvent): void => {
    showFromPointer(ev.clientX, ev.clientY);
  };
  const onOverlayLeave = (ev: MouseEvent): void => {
    const nextTarget = ev.relatedTarget;
    if (nextTarget instanceof Node && canvas.contains(nextTarget)) {
      return;
    }
    if (
      nextTarget instanceof Node &&
      addAnnotationButton &&
      addAnnotationButton.contains(nextTarget)
    ) {
      return;
    }
    hideHover();
  };
  const onAddButtonLeave = (ev: MouseEvent): void => {
    const nextTarget = ev.relatedTarget;
    if (
      nextTarget instanceof Node &&
      (canvas.contains(nextTarget) ||
        (hoverSurfaceEl && hoverSurfaceEl.contains(nextTarget)))
    ) {
      return;
    }
    hideHover();
  };
  const onAddButtonClick = (ev: MouseEvent): void => {
    if (
      typeof options.onAddAnnotation !== "function" ||
      !interactionState._chartLastHover
    ) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    options.onAddAnnotation(interactionState._chartLastHover, ev);
  };
  const onContextMenu = (ev: MouseEvent): void => {
    if (typeof options.onContextMenu !== "function") {
      return;
    }
    const hover = buildHoverState(ev.clientX, ev.clientY);
    if (!hover) {
      return;
    }
    ev.preventDefault();
    interactionState._chartLastHover = hover;
    showLineChartCrosshair(card, renderer, hover);
    showLineChartTooltip(card, hover, ev.clientX, ev.clientY);
    dispatchLineChartHover(card, hover);
    options.onContextMenu(hover, ev);
  };
  const onClick = (ev: MouseEvent): void => {
    if (typeof options.onAnomalyClick !== "function") {
      return;
    }
    const regions = findAnomalyRegions(ev.clientX, ev.clientY);
    if (!regions.length) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    options.onAnomalyClick(regions, ev);
  };

  let touchTimer: TimerHandle = null;
  const scheduleTouchHide = () => {
    if (touchTimer) {
      window.clearTimeout(touchTimer);
    }
    touchTimer = window.setTimeout(() => hideHover(), 1800);
  };
  const onTouchStart = (ev: TouchEvent): void => {
    ev.preventDefault();
    const touch = ev.touches[0];
    if (!touch) {
      return;
    }
    showFromPointer(touch.clientX, touch.clientY);
    scheduleTouchHide();
  };
  const onTouchMove = (ev: TouchEvent): void => {
    ev.preventDefault();
    const touch = ev.touches[0];
    if (!touch) {
      return;
    }
    showFromPointer(touch.clientX, touch.clientY);
    scheduleTouchHide();
  };
  const onTouchEnd = (): void => scheduleTouchHide();

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseleave", onMouseLeave);
  canvas.addEventListener("click", onClick);
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
  canvas.addEventListener("touchend", onTouchEnd);
  canvas.addEventListener("touchcancel", onTouchEnd);
  hoverSurfaceEl?.addEventListener("mousemove", onOverlayMove);
  hoverSurfaceEl?.addEventListener("mouseleave", onOverlayLeave);
  addAnnotationButton?.addEventListener("mouseleave", onAddButtonLeave);
  addAnnotationButton?.addEventListener("click", onAddButtonClick);

  interactionState._chartHoverCleanup = () => {
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("mouseleave", onMouseLeave);
    canvas.removeEventListener("click", onClick);
    canvas.removeEventListener("contextmenu", onContextMenu);
    canvas.removeEventListener("touchstart", onTouchStart);
    canvas.removeEventListener("touchmove", onTouchMove);
    canvas.removeEventListener("touchend", onTouchEnd);
    canvas.removeEventListener("touchcancel", onTouchEnd);
    hoverSurfaceEl?.removeEventListener("mousemove", onOverlayMove);
    hoverSurfaceEl?.removeEventListener("mouseleave", onOverlayLeave);
    addAnnotationButton?.removeEventListener("mouseleave", onAddButtonLeave);
    addAnnotationButton?.removeEventListener("click", onAddButtonClick);
    if (_rafHandle !== null) {
      cancelAnimationFrame(_rafHandle);
      _rafHandle = null;
    }
    if (touchTimer) {
      window.clearTimeout(touchTimer);
      touchTimer = null;
    }
    hideHover();
  };
}

export function attachLineChartRangeZoom(
  card: ChartInteractionHost,
  canvas: Nullable<HTMLCanvasElement>,
  renderer: Nullable<ChartRenderer>,
  t0: number,
  t1: number,
  options: AttachLineChartRangeZoomOptions = {}
): void {
  const interactionState = getInteractionState(card);
  if (!canvas || !renderer) {
    return;
  }
  if (interactionState._chartZoomCleanup) {
    interactionState._chartZoomCleanup();
    interactionState._chartZoomCleanup = null;
  }

  const selection = getRoot(card).getElementById(
    "chart-zoom-selection"
  ) as Nullable<HTMLElement>;
  if (!selection) {
    return;
  }

  let pointerId: Nullable<number> = null;
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  const hideSelection = () => {
    selection.hidden = true;
    selection.classList.remove("visible");
  };

  const clientXToTime = (clientX: number): number => {
    const rect = canvas.getBoundingClientRect();
    const localX = clampChartValue(
      clientX - rect.left,
      renderer.pad.left,
      renderer.pad.left + renderer.cw
    );
    const ratio = renderer.cw ? (localX - renderer.pad.left) / renderer.cw : 0;
    return t0 + ratio * (t1 - t0);
  };

  const inPlotBounds = (clientX: number, clientY: number): boolean => {
    const rect = canvas.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;
    return (
      localX >= renderer.pad.left &&
      localX <= renderer.pad.left + renderer.cw &&
      localY >= renderer.pad.top &&
      localY <= renderer.pad.top + renderer.ch
    );
  };

  const renderSelection = (): void => {
    const left = Math.min(startX, currentX);
    const width = Math.abs(currentX - startX);
    selection.style.left = `${left}px`;
    selection.style.top = `${renderer.pad.top}px`;
    selection.style.width = `${width}px`;
    selection.style.height = `${renderer.ch}px`;
    selection.hidden = false;
    selection.classList.add("visible");
  };

  const emitPreview = (): void => {
    if (!dragging || Math.abs(currentX - startX) < 8) {
      options.onPreview?.(null);
      return;
    }
    const rectLeft = canvas.getBoundingClientRect().left;
    const startTime = Math.min(
      clientXToTime(rectLeft + startX),
      clientXToTime(rectLeft + currentX)
    );
    const endTime = Math.max(
      clientXToTime(rectLeft + startX),
      clientXToTime(rectLeft + currentX)
    );
    options.onPreview?.({ startTime, endTime });
  };

  const resetDragging = (clearPreview = true): void => {
    pointerId = null;
    dragging = false;
    interactionState._chartZoomDragging = false;
    hideSelection();
    if (clearPreview) {
      options.onPreview?.(null);
    }
  };

  const onPointerMove = (ev: PointerEvent): void => {
    if (pointerId == null || ev.pointerId !== pointerId) {
      return;
    }
    currentX = clampChartValue(
      ev.clientX - canvas.getBoundingClientRect().left,
      renderer.pad.left,
      renderer.pad.left + renderer.cw
    );
    const movedPx = Math.abs(currentX - startX);
    if (!dragging && movedPx < 6) {
      return;
    }
    dragging = true;
    interactionState._chartZoomDragging = true;
    hideLineChartHover(card);
    renderSelection();
    emitPreview();
    ev.preventDefault();
  };

  const finish = (ev: PointerEvent): void => {
    if (pointerId == null || ev.pointerId !== pointerId) {
      return;
    }
    const didDrag = dragging;
    const endX = currentX;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);
    if (!didDrag || Math.abs(endX - startX) < 8) {
      resetDragging(true);
      return;
    }
    const rectLeft = canvas.getBoundingClientRect().left;
    const startTime = Math.min(
      clientXToTime(rectLeft + startX),
      clientXToTime(rectLeft + endX)
    );
    const endTime = Math.max(
      clientXToTime(rectLeft + startX),
      clientXToTime(rectLeft + endX)
    );
    options.onZoom?.({ startTime, endTime });
    resetDragging(false);
  };

  const onPointerDown = (ev: PointerEvent): void => {
    if (ev.button !== 0 || !inPlotBounds(ev.clientX, ev.clientY)) {
      return;
    }
    pointerId = ev.pointerId;
    const rect = canvas.getBoundingClientRect();
    startX = clampChartValue(
      ev.clientX - rect.left,
      renderer.pad.left,
      renderer.pad.left + renderer.cw
    );
    currentX = startX;
    dragging = false;
    interactionState._chartZoomDragging = false;
    options.onPreview?.(null);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
  };

  const onDoubleClick = (ev: MouseEvent): void => {
    if (!inPlotBounds(ev.clientX, ev.clientY)) {
      return;
    }
    if (!options.onReset) {
      return;
    }
    ev.preventDefault();
    options.onReset();
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("dblclick", onDoubleClick);

  interactionState._chartZoomCleanup = () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("dblclick", onDoubleClick);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);
    resetDragging();
  };
}

export function attachTooltipBehaviour(
  card: ChartInteractionHost,
  canvas: Nullable<HTMLCanvasElement>,
  renderer: Nullable<ChartRenderer>,
  events: Nullable<ChartEventRecord[]> | undefined,
  t0: number,
  t1: number
): void {
  if (!canvas || !renderer) {
    return;
  }
  const resolvedCanvas = canvas;
  const resolvedRenderer = renderer;

  function findNearest(clientX: number): Nullable<ChartEventRecord> {
    const rect = resolvedCanvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const msPerPx = (t1 - t0) / resolvedRenderer.cw;
    const threshold = 14 * msPerPx;
    const tAtX =
      t0 + ((x - resolvedRenderer.pad.left) / resolvedRenderer.cw) * (t1 - t0);

    let best: Nullable<ChartEventRecord> = null;
    let bestDist = Infinity;
    for (const ev of events || []) {
      const evTimeMs = new Date(ev.timestamp).getTime();
      if (evTimeMs < t0 || evTimeMs > t1) {
        continue;
      }
      const d = Math.abs(evTimeMs - tAtX);
      if (d < threshold && d < bestDist) {
        bestDist = d;
        best = ev;
      }
    }
    return best;
  }

  const onMouseMove = (e: MouseEvent): void => {
    const best = findNearest(e.clientX);
    if (best) {
      showTooltip(
        card,
        resolvedCanvas,
        resolvedRenderer,
        best,
        e.clientX,
        e.clientY
      );
      resolvedCanvas.style.cursor = "pointer";
    } else {
      hideTooltip(card);
      resolvedCanvas.style.cursor = "default";
    }
  };

  const onMouseLeave = (): void => {
    hideTooltip(card);
  };

  let touchTimer: TimerHandle = null;
  const clearTouchTimer = (): void => {
    if (touchTimer !== null) {
      clearTimeout(touchTimer);
    }
  };
  const scheduleTouchHide = (): void => {
    clearTouchTimer();
    touchTimer = window.setTimeout(() => hideTooltip(card), 3000);
  };
  const onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const best = findNearest(touch.clientX);
    if (best) {
      showTooltip(card, canvas, renderer, best, touch.clientX, touch.clientY);
      scheduleTouchHide();
    } else {
      hideTooltip(card);
    }
  };
  const onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const best = findNearest(touch.clientX);
    if (best) {
      showTooltip(card, canvas, renderer, best, touch.clientX, touch.clientY);
      scheduleTouchHide();
    } else {
      hideTooltip(card);
    }
  };

  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseleave", onMouseLeave);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });
}
