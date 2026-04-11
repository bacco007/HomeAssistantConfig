import { fmtTime } from "@/lib/util/format";
import { hexToRgba } from "@/lib/util/color";

export type ChartPad = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ResolvedAxis = {
  key: string;
  min: number;
  max: number;
  side: "left" | "right";
  unit: string;
  color: Nullable<string>;
  slot?: number;
  ticks?: number[];
};

export type AxisInput = {
  key?: string;
  min: number;
  max: number;
  side?: "left" | "right";
  unit?: string;
  color?: Nullable<string>;
};

export type ChartPoint = [number, number];

export type AnnotationEvent = {
  id?: string;
  timestamp: string;
  color?: Nullable<string>;
  chart_value?: Nullable<number | string>;
  chart_unit?: string;
  message?: string;
  annotation?: string;
  entity_ids?: string[];
  device_ids?: string[];
  area_ids?: string[];
  label_ids?: string[];
};

export type SeriesWithPoints = {
  pts: ChartPoint[];
};

export type AnomalyPoint = {
  timeMs: number;
  value: number;
};

export type AnomalyCluster = {
  points?: AnomalyPoint[];
};

export type AnomalyRegion = {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  cluster: AnomalyCluster;
};

type DrawGridOptions = {
  fixedAxisOverlay?: boolean;
  hideTimeLabels?: boolean;
};

type DrawLineOptions = {
  fillAlpha?: number;
  smooth?: boolean;
  stepped?: boolean;
  dashed?: boolean;
  dotted?: boolean;
  dashPattern?: number[];
  lineOpacity?: number;
  lineWidth?: number;
};

type DrawBarsOptions = {
  fillAlpha?: number;
  widthFactor?: number;
};

type DrawAnnotationsOptions = {
  showLines?: boolean;
  showMarkers?: boolean;
};

type GradientBandOptions = {
  fillAlpha?: number;
};

type ThresholdAreaOptions = {
  mode?: "above" | "below";
  fillAlpha?: number;
};

type DrawAnomalyClusterOptions = {
  strokeAlpha?: number;
  lineWidth?: number;
  haloWidth?: number;
  haloColor?: string;
  haloAlpha?: number;
  fillColor?: Nullable<string>;
  fillAlpha?: number;
  pointPadding?: number;
  minRadiusX?: number;
  minRadiusY?: number;
};

type DrawBlipOptions = {
  maxRadius?: number;
  duration?: number;
};

type AnomalyRegionOptions = {
  pointPadding?: number;
  minRadiusX?: number;
  minRadiusY?: number;
};

function createFallbackCanvasContext() {
  return {
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    fill() {},
    fillRect() {},
    clearRect() {},
    rect() {},
    clip() {},
    save() {},
    restore() {},
    scale() {},
    setLineDash() {},
    fillText() {},
    closePath() {},
    bezierCurveTo() {},
    arc() {},
    measureText() {
      return { width: 0 };
    },
  } as unknown as CanvasRenderingContext2D;
}

/**
 * Canvas-based chart renderer – grids, lines, annotations.
 */

export class ChartRenderer {
  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  cssW: number;

  cssH: number;

  basePad: ChartPad;

  pad: ChartPad;

  labelColor: string;

  _activeAxes: ResolvedAxis[] = [];

  constructor(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") || createFallbackCanvasContext();
    this.cssW = cssWidth;
    this.cssH = cssHeight;
    this.basePad = { top: 24, right: 12, bottom: 48, left: 12 };
    this.pad = { ...this.basePad };
    this.labelColor = "rgba(214,218,224,0.92)";
  }

  static get AXIS_SLOT_WIDTH() {
    return 30;
  }

  get cw() {
    return this.cssW - this.pad.left - this.pad.right;
  }

  get ch() {
    return this.cssH - this.pad.top - this.pad.bottom;
  }

  xOf(t: number, t0: number, t1: number): number {
    return this.pad.left + ((t - t0) / (t1 - t0)) * this.cw;
  }

  yOf(v: number, vMin: number, vMax: number): number {
    return this.pad.top + this.ch - ((v - vMin) / (vMax - vMin)) * this.ch;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _normalizeAxes(
    vMinOrAxes: number | AxisInput[],
    vMax?: number
  ): ResolvedAxis[] {
    const axisColumnWidth = ChartRenderer.AXIS_SLOT_WIDTH;
    const inputAxes = Array.isArray(vMinOrAxes)
      ? vMinOrAxes
      : [
          {
            key: "default",
            min: vMinOrAxes,
            max: vMax ?? vMinOrAxes,
            side: "left",
            unit: "",
            color: null,
          },
        ];
    const leftAxes: ResolvedAxis[] = [];
    const rightAxes: ResolvedAxis[] = [];
    const axes: ResolvedAxis[] = inputAxes.map((axis, index) => {
      const normalized: ResolvedAxis = {
        key: axis.key || `axis-${index}`,
        min: axis.min,
        max: axis.max,
        side: axis.side === "right" ? "right" : "left",
        unit: axis.unit || "",
        color: axis.color || "rgba(128,128,128,0.85)",
      };
      const bucket = normalized.side === "right" ? rightAxes : leftAxes;
      normalized.slot = bucket.length;
      bucket.push(normalized);
      return normalized;
    });

    this.pad = {
      top: this.basePad.top,
      bottom: this.basePad.bottom,
      left: this.basePad.left + Math.max(1, leftAxes.length) * axisColumnWidth,
      right: this.basePad.right + rightAxes.length * axisColumnWidth,
    };
    this._activeAxes = axes;
    return axes;
  }

  _formatAxisTick(v: number, _unit?: string): string {
    const numeric =
      Math.abs(v) >= 1000
        ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`
        : v.toFixed(v % 1 !== 0 ? 1 : 0);
    return numeric;
  }

  _axisLabelX(axis: ResolvedAxis): number {
    const columnWidth = ChartRenderer.AXIS_SLOT_WIDTH;
    const leftAxisX = this.pad.left;
    const rightAxisX = this.pad.left + this.cw;
    if (axis.side === "right") {
      return rightAxisX + 10 + (axis.slot ?? 0) * columnWidth;
    }
    return leftAxisX - 10 - (axis.slot ?? 0) * columnWidth;
  }

  _formatTimeTick(
    t: number,
    t0: number,
    t1: number,
    tickSpanMs: Nullable<number> = null
  ): string {
    const value = new Date(t);
    const spanMs = Math.max(0, t1 - t0);
    const detailSpanMs: number =
      Number.isFinite(tickSpanMs) && (tickSpanMs ?? 0) > 0
        ? (tickSpanMs as number)
        : spanMs;
    const start = new Date(t0);
    const end = new Date(t1);
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    const sameMonth =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth();

    if (detailSpanMs <= 2 * 60 * 60 * 1000) {
      return value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (detailSpanMs <= 12 * 60 * 60 * 1000) {
      return value.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (detailSpanMs <= 2 * 24 * 60 * 60 * 1000) {
      return value.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    }
    if (sameDay) {
      return value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (detailSpanMs <= 6 * 60 * 60 * 1000) {
      return value.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (detailSpanMs <= 24 * 60 * 60 * 1000) {
      return value.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
      });
    }
    if (sameMonth && spanMs <= 14 * 24 * 60 * 60 * 1000) {
      return value.toLocaleDateString([], { day: "numeric" });
    }
    if (spanMs >= 2 * 24 * 60 * 60 * 1000) {
      return value.toLocaleDateString([], { month: "short", day: "numeric" });
    }
    if (spanMs >= 24 * 60 * 60 * 1000) {
      return value.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return fmtTime(value.toISOString());
  }

  _niceNumber(value: number, round: boolean): number {
    if (!Number.isFinite(value) || value <= 0) {
      return 1;
    }
    const exponent = Math.floor(Math.log10(value));
    const fraction = value / 10 ** exponent;
    let niceFraction;
    if (round) {
      if (fraction < 1.5) {
        niceFraction = 1;
      } else if (fraction < 3) {
        niceFraction = 2;
      } else if (fraction < 7) {
        niceFraction = 5;
      } else {
        niceFraction = 10;
      }
    } else if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
    return niceFraction * 10 ** exponent;
  }

  _buildNiceAxisScale(
    axis: ResolvedAxis,
    tickCount: number
  ): { min: number; max: number; step: number; ticks: number[] } {
    const rawMin = Number.isFinite(axis.min) ? axis.min : 0;
    const rawMax = Number.isFinite(axis.max) ? axis.max : 1;
    if (rawMin === rawMax) {
      const pad = Math.abs(rawMin || 1);
      const step = this._niceNumber((pad * 2) / Math.max(1, tickCount), true);
      const niceMin = Math.floor((rawMin - pad) / step) * step;
      const niceMax = Math.ceil((rawMax + pad) / step) * step;
      const ticks = [];
      for (let value = niceMin; value <= niceMax + step * 0.5; value += step) {
        ticks.push(Number(value.toFixed(10)));
      }
      return { min: niceMin, max: niceMax, step, ticks };
    }

    const range = this._niceNumber(rawMax - rawMin, false);
    const step = this._niceNumber(range / Math.max(1, tickCount), true);
    const niceMin = Math.floor(rawMin / step) * step;
    const niceMax = Math.ceil(rawMax / step) * step;
    const ticks = [];
    for (let value = niceMin; value <= niceMax + step * 0.5; value += step) {
      ticks.push(Number(value.toFixed(10)));
    }
    return { min: niceMin, max: niceMax, step, ticks };
  }

  _alignTimeTick(timestamp: number, stepMs: number): number {
    const date = new Date(timestamp);
    if (stepMs < 60 * 1000) {
      return Math.floor(timestamp / stepMs) * stepMs;
    }
    if (stepMs < 60 * 60 * 1000) {
      const minutes = Math.max(1, Math.round(stepMs / (60 * 1000)));
      date.setSeconds(0, 0);
      date.setMinutes(Math.floor(date.getMinutes() / minutes) * minutes);
      return date.getTime();
    }
    if (stepMs < 24 * 60 * 60 * 1000) {
      const hours = Math.max(1, Math.round(stepMs / (60 * 60 * 1000)));
      date.setMinutes(0, 0, 0);
      date.setHours(Math.floor(date.getHours() / hours) * hours);
      return date.getTime();
    }
    if (stepMs < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.max(1, Math.round(stepMs / (24 * 60 * 60 * 1000)));
      date.setHours(0, 0, 0, 0);
      const dayOfMonth = date.getDate();
      date.setDate(dayOfMonth - ((dayOfMonth - 1) % days));
      return date.getTime();
    }
    if (stepMs < 30 * 24 * 60 * 60 * 1000) {
      date.setHours(0, 0, 0, 0);
      const day = date.getDay();
      const offset = (day + 6) % 7;
      date.setDate(date.getDate() - offset);
      return date.getTime();
    }
    date.setHours(0, 0, 0, 0);
    date.setDate(1);
    return date.getTime();
  }

  _getTimeTickStep(targetStepMs: number): number {
    const candidates = [
      5 * 60 * 1000,
      10 * 60 * 1000,
      15 * 60 * 1000,
      30 * 60 * 1000,
      60 * 60 * 1000,
      2 * 60 * 60 * 1000,
      3 * 60 * 60 * 1000,
      6 * 60 * 60 * 1000,
      12 * 60 * 60 * 1000,
      24 * 60 * 60 * 1000,
      2 * 24 * 60 * 60 * 1000,
      7 * 24 * 60 * 60 * 1000,
      14 * 24 * 60 * 60 * 1000,
      30 * 24 * 60 * 60 * 1000,
    ];
    return (
      candidates.find((step) => step >= targetStepMs) ||
      candidates[candidates.length - 1]
    );
  }

  _buildTimeTicks(t0: number, t1: number): { ticks: number[]; stepMs: number } {
    const approxTickCount = Math.max(
      2,
      Math.min(96, Math.floor(this.cw / 120))
    );
    const stepMs = this._getTimeTickStep(
      (t1 - t0) / Math.max(1, approxTickCount)
    );
    const ticks = [];
    let tick = this._alignTimeTick(t0, stepMs);
    if (tick < t0) {
      tick += stepMs;
    }
    while (tick <= t1) {
      ticks.push(tick);
      tick += stepMs;
    }
    if (!ticks.length) {
      ticks.push(t0, t1);
    }
    return { ticks, stepMs };
  }

  drawGrid(
    t0: number,
    t1: number,
    vMin: number | AxisInput[],
    vMax?: number,
    yTicks = 5,
    options: DrawGridOptions = {}
  ): void {
    const { ctx, pad } = this;
    const gridColor = "rgba(128,128,128,0.15)";
    const labelColor = this.labelColor;
    const fixedAxisOverlay = !!options.fixedAxisOverlay;
    const hideTimeLabels = !!options.hideTimeLabels;
    const axes = this._normalizeAxes(vMin, vMax);
    const unitCounts = axes.reduce((counts, axis) => {
      if (!axis.unit) {
        return counts;
      }
      counts.set(axis.unit, (counts.get(axis.unit) || 0) + 1);
      return counts;
    }, new Map());
    const axisLabelColor = (axis: ResolvedAxis): string => {
      const duplicateUnit =
        !!axis?.unit && (unitCounts.get(axis.unit) || 0) > 1;
      if (!duplicateUnit || !axis?.color) {
        return labelColor;
      }
      return axis.color;
    };
    axes.forEach((axis) => {
      const scale = this._buildNiceAxisScale(axis, yTicks);
      axis.min = scale.min;
      axis.max = scale.max;
      axis.ticks = scale.ticks;
    });
    const primaryAxis = axes[0];

    ctx.font = "12px sans-serif";

    for (const v of primaryAxis.ticks || []) {
      const y = this.yOf(v, primaryAxis.min, primaryAxis.max);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + this.cw, y);
      ctx.stroke();

      if (!fixedAxisOverlay) {
        ctx.fillStyle = axisLabelColor(primaryAxis);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(
          this._formatAxisTick(v, primaryAxis.unit),
          this._axisLabelX(primaryAxis),
          y
        );
      }
    }

    if (!fixedAxisOverlay) {
      for (const axis of axes.slice(1)) {
        for (const v of axis.ticks || []) {
          const y = this.yOf(v, axis.min, axis.max);
          ctx.fillStyle = axisLabelColor(axis);
          ctx.textAlign = axis.side === "right" ? "left" : "right";
          ctx.textBaseline = "middle";
          ctx.fillText(
            this._formatAxisTick(v, axis.unit),
            this._axisLabelX(axis),
            y
          );
        }
      }
    }

    if (!fixedAxisOverlay) {
      for (const axis of axes) {
        if (!axis.unit) {
          continue;
        }
        ctx.fillStyle = axisLabelColor(axis);
        ctx.textAlign = axis.side === "right" ? "left" : "right";
        ctx.textBaseline = "bottom";
        ctx.fillText(axis.unit, this._axisLabelX(axis), pad.top - 6);
      }
    }

    const { ticks: timeTicks, stepMs: tickSpanMs } = this._buildTimeTicks(
      t0,
      t1
    );
    for (const t of timeTicks) {
      const x = this.xOf(t, t0, t1);
      const label = this._formatTimeTick(t, t0, t1, tickSpanMs);

      ctx.strokeStyle = "rgba(128,128,128,0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + this.ch);
      ctx.stroke();

      if (!hideTimeLabels) {
        ctx.fillStyle = labelColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelWidth = ctx.measureText(label).width;
        const labelX = Math.min(
          pad.left + this.cw - labelWidth / 2,
          Math.max(pad.left + labelWidth / 2, x)
        );
        ctx.fillText(label, labelX, pad.top + this.ch + 6);
      }
    }

    ctx.strokeStyle = "rgba(128,128,128,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (!fixedAxisOverlay) {
      ctx.moveTo(pad.left, pad.top);
      ctx.lineTo(pad.left, pad.top + this.ch);
    }
    ctx.moveTo(pad.left, pad.top + this.ch);
    ctx.lineTo(pad.left + this.cw, pad.top + this.ch);
    if (axes.some((axis) => axis.side === "right") && !fixedAxisOverlay) {
      ctx.moveTo(pad.left + this.cw, pad.top);
      ctx.lineTo(pad.left + this.cw, pad.top + this.ch);
    }
    ctx.stroke();
  }

  drawRowLabel(text: string, color = "rgba(214,218,224,0.85)"): void {
    if (!text) {
      return;
    }
    const { ctx, pad } = this;
    ctx.save();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, pad.left + 6, pad.top + 5);
    ctx.restore();
  }

  /**
   * Append Catmull-Rom bezier segments to the current path, starting from pts[0]
   * (caller must have already called moveTo(pts[0])). Each segment passes exactly
   * through the data points with tangents derived from neighbouring points.
   */
  static _catmullRomPath(
    ctx: CanvasRenderingContext2D,
    pts: ChartPoint[]
  ): void {
    for (let i = 1; i < pts.length; i++) {
      const pm1 = pts[Math.max(0, i - 2)];
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[Math.min(pts.length - 1, i + 1)];
      const cp1x = p0[0] + (p1[0] - pm1[0]) / 6;
      const cp1y = p0[1] + (p1[1] - pm1[1]) / 6;
      const cp2x = p1[0] - (p2[0] - p0[0]) / 6;
      const cp2y = p1[1] - (p2[1] - p0[1]) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p1[0], p1[1]);
    }
  }

  static _steppedPath(ctx: CanvasRenderingContext2D, pts: ChartPoint[]): void {
    for (let i = 1; i < pts.length; i++) {
      const previous = pts[i - 1];
      const current = pts[i];
      ctx.lineTo(current[0], previous[1]);
      ctx.lineTo(current[0], current[1]);
    }
  }

  drawLine(
    points: ChartPoint[],
    color: string,
    t0: number,
    t1: number,
    vMin: number,
    vMax: number,
    options: DrawLineOptions = {}
  ): void {
    if (!points.length) {
      return;
    }
    const { ctx, pad } = this;
    const fillAlpha = Number.isFinite(options.fillAlpha)
      ? (options.fillAlpha as number)
      : 0;
    const smooth = !!options.smooth;
    const stepped = options.stepped === true;
    const dashed = !!options.dashed;
    const dotted = !!options.dotted;
    const dashPattern = Array.isArray(options.dashPattern)
      ? options.dashPattern.filter(
          (entry) => Number.isFinite(entry) && entry > 0
        )
      : null;
    const lineOpacity = Number.isFinite(options.lineOpacity)
      ? (options.lineOpacity as number)
      : 1;
    const lineWidth = Number.isFinite(options.lineWidth)
      ? (options.lineWidth as number)
      : 1.75;

    // Pre-convert to pixel coords once (required for smooth mode, reused for fill+stroke).
    const px: ChartPoint[] = points.map(([t, v]) => [
      this.xOf(t, t0, t1),
      this.yOf(v, vMin, vMax),
    ]);
    const bottom = pad.top + this.ch;

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, this.cw, this.ch);
    ctx.clip();
    if (dashPattern && dashPattern.length) {
      ctx.setLineDash(dashPattern);
    } else if (dotted) {
      ctx.setLineDash([1, 3]);
      ctx.lineCap = "round";
    } else if (dashed) {
      ctx.setLineDash([6, 4]);
    }
    if (lineOpacity < 1) {
      ctx.globalAlpha = lineOpacity;
    }

    if (fillAlpha > 0) {
      ctx.beginPath();
      ctx.moveTo(px[0][0], bottom);
      ctx.lineTo(px[0][0], px[0][1]);
      if (stepped) {
        ChartRenderer._steppedPath(ctx, px);
      } else if (smooth) {
        ChartRenderer._catmullRomPath(ctx, px);
      } else {
        for (let i = 1; i < px.length; i++) {
          ctx.lineTo(px[i][0], px[i][1]);
        }
      }
      ctx.lineTo(px[px.length - 1][0], bottom);
      ctx.closePath();
      ctx.fillStyle = hexToRgba(color, fillAlpha);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(px[0][0], px[0][1]);
    if (stepped) {
      ChartRenderer._steppedPath(ctx, px);
    } else if (smooth) {
      ChartRenderer._catmullRomPath(ctx, px);
    } else {
      for (let i = 1; i < px.length; i++) {
        ctx.lineTo(px[i][0], px[i][1]);
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    if (stepped) {
      ctx.lineJoin = "miter";
      ctx.lineCap = "butt";
    } else {
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    }
    ctx.stroke();

    ctx.restore();
  }

  drawBars(
    points: ChartPoint[],
    color: string,
    t0: number,
    t1: number,
    vMin: number,
    vMax: number,
    options: DrawBarsOptions = {}
  ): void {
    if (!points.length) {
      return;
    }
    const { ctx } = this;
    const fillAlpha = Number.isFinite(options.fillAlpha)
      ? (options.fillAlpha as number)
      : 0.78;
    const widthFactor = Number.isFinite(options.widthFactor)
      ? (options.widthFactor as number)
      : 0.72;
    const baselineY = this.yOf(Math.max(vMin, 0), vMin, vMax);
    const xs = points.map(([t]) => this.xOf(t, t0, t1));
    let minGap = this.cw / Math.max(points.length, 1);
    for (let i = 1; i < xs.length; i++) {
      minGap = Math.min(minGap, xs[i] - xs[i - 1]);
    }
    const barWidth = Math.max(3, Math.min(28, minGap * widthFactor));

    ctx.save();
    ctx.fillStyle = hexToRgba(color, fillAlpha);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    for (let i = 0; i < points.length; i++) {
      const [, v] = points[i];
      const x = xs[i];
      const y = this.yOf(v, vMin, vMax);
      const top = Math.min(y, baselineY);
      const height = Math.max(1, Math.abs(baselineY - y));
      const left = x - barWidth / 2;
      ctx.fillRect(left, top, barWidth, height);
    }
    ctx.restore();
  }

  drawStateBands(
    spans: Nullable<Array<{ start: number; end: number }>> | undefined,
    t0: number,
    t1: number,
    color = "#03a9f4",
    alpha = 0.12
  ): void {
    if (!spans?.length) {
      return;
    }
    const { ctx, pad } = this;
    ctx.save();
    ctx.fillStyle = hexToRgba(color, alpha);
    for (const span of spans) {
      const start = Math.max(t0, span.start);
      const end = Math.min(t1, span.end);
      if (!(start < end)) {
        continue;
      }
      const x0 = this.xOf(start, t0, t1);
      const x1 = this.xOf(end, t0, t1);
      ctx.fillRect(x0, pad.top, Math.max(1, x1 - x0), this.ch);
    }
    ctx.restore();
  }

  drawAnnotations(
    events: AnnotationEvent[],
    t0: number,
    t1: number,
    options: DrawAnnotationsOptions = {}
  ): Array<{ event: AnnotationEvent; x: number; y: number }> {
    const { ctx, pad } = this;
    const hits = [];
    const showLines = options.showLines !== false;
    const showMarkers = options.showMarkers !== false;

    for (const event of events) {
      const t = new Date(event.timestamp).getTime();
      if (t < t0 || t > t1) {
        continue;
      }

      const x = this.xOf(t, t0, t1);
      const color = event.color || "#03a9f4";

      if (showLines) {
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.moveTo(x, pad.top + 8);
        ctx.lineTo(x, pad.top + this.ch);
        ctx.stroke();
        ctx.restore();
      }

      if (showMarkers) {
        const d = 5;
        ctx.save();
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, pad.top - d);
        ctx.lineTo(x + d, pad.top);
        ctx.lineTo(x, pad.top + d);
        ctx.lineTo(x - d, pad.top);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      hits.push({ event, x, y: pad.top });
    }

    return hits;
  }

  /**
   * Draw sensor-style vertical annotation lines that terminate on the data line
   * with a small circle marker.
   */
  drawAnnotationLinesOnLine(
    events: AnnotationEvent[],
    allSeries: SeriesWithPoints[],
    t0: number,
    t1: number,
    vMin: number,
    vMax: number
  ): Array<{ event: AnnotationEvent; x: number; y: number; value: number }> {
    const { ctx, pad } = this;
    const firstPts = allSeries.length ? allSeries[0].pts : [];
    const hits = [];

    for (const event of events) {
      const t = new Date(event.timestamp).getTime();
      if (t < t0 || t > t1) {
        continue;
      }

      const x = this.xOf(t, t0, t1);
      const value = this._interpolateValue(firstPts, t);
      if (value === null) {
        continue;
      }
      const y = this.yOf(value, vMin, vMax);

      const color = event.color || "#03a9f4";

      ctx.save();
      ctx.setLineDash([4, 3]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(x, pad.top + this.ch);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      hits.push({ event, x, y, value });
    }

    return hits;
  }

  /**
   * Interpolate the Y pixel position on a data series at a given timestamp.
   * Uses linear interpolation between surrounding data points.
   */
  _interpolateY(
    seriesPoints: ChartPoint[],
    t: number,
    _t0: number,
    _t1: number,
    vMin: number,
    vMax: number
  ): Nullable<number> {
    if (!seriesPoints.length) {
      return null;
    }
    // Before first or after last point – clamp to nearest
    if (t <= seriesPoints[0][0]) {
      return this.yOf(seriesPoints[0][1], vMin, vMax);
    }
    if (t >= seriesPoints[seriesPoints.length - 1][0]) {
      return this.yOf(seriesPoints[seriesPoints.length - 1][1], vMin, vMax);
    }
    // Find the two surrounding points
    for (let i = 0; i < seriesPoints.length - 1; i++) {
      const [t1p, v1p] = seriesPoints[i];
      const [t2p, v2p] = seriesPoints[i + 1];
      if (t >= t1p && t <= t2p) {
        const frac = (t - t1p) / (t2p - t1p);
        const v = v1p + frac * (v2p - v1p);
        return this.yOf(v, vMin, vMax);
      }
    }
    return null;
  }

  _interpolateValue(seriesPoints: ChartPoint[], t: number): Nullable<number> {
    const len = seriesPoints.length;
    if (!len) {
      return null;
    }
    if (t < seriesPoints[0][0]) {
      return null;
    }
    if (t > seriesPoints[len - 1][0]) {
      return null;
    }
    // Binary search for the rightmost index whose timestamp <= t, then interpolate.
    let lo = 0;
    let hi = len - 1;
    while (lo + 1 < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (seriesPoints[mid][0] <= t) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const [t0, v0] = seriesPoints[lo];
    const [t1, v1] = seriesPoints[hi];
    if (t0 === t1) return v0;
    return v0 + (v1 - v0) * ((t - t0) / (t1 - t0));
  }

  /**
   * Draw annotation markers directly on a sensor data line.
   * No vertical dotted line — only a coloured circle on the line.
   *
   * @param {Array} events    Recorded events array
   * @param {Array} allSeries Array of {pts} objects — first series used for Y
   * @param {number} t0       Start time ms
   * @param {number} t1       End time ms
   * @param {number} vMin     Y axis min
   * @param {number} vMax     Y axis max
   * @returns {Array}         Array of {event, x, y} for hit-testing
   */
  drawAnnotationsOnLine(
    events: AnnotationEvent[],
    allSeries: SeriesWithPoints[],
    t0: number,
    t1: number,
    vMin: number,
    vMax: number
  ): Array<{ event: AnnotationEvent; x: number; y: number; value: number }> {
    const { ctx } = this;
    const firstPts = allSeries.length ? allSeries[0].pts : [];
    const hits = [];

    for (const event of events) {
      const t = new Date(event.timestamp).getTime();
      if (t < t0 || t > t1) {
        continue;
      }

      const x = this.xOf(t, t0, t1);
      const value = this._interpolateValue(firstPts, t);
      if (value === null) {
        continue;
      }
      const y = this.yOf(value, vMin, vMax);

      const color = event.color || "#03a9f4";
      const r = 10;

      // White outline circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r + 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.restore();

      // Coloured circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      hits.push({ event, x, y, value });
    }

    return hits;
  }

  /**
   * Draw a gradient-filled band between two data values, fading from the edge
   * value toward the midpoint value. Used for min/max shading that fades toward
   * the mean line.
   *
   * @param {number} valueEdge  Data value at the opaque edge (the min or max line)
   * @param {number} valueMid   Data value at the transparent end (the mean line)
   * @param {string} color      Hex color string (e.g. "#03a9f4")
   * @param {number} t0         Render start time ms
   * @param {number} t1         Render end time ms
   * @param {number} vMin       Y-axis minimum data value
   * @param {number} vMax       Y-axis maximum data value
   * @param {object} options    { fillAlpha }
   */
  drawGradientBand(
    valueEdge: number,
    valueMid: number,
    color: string,
    _t0: number,
    _t1: number,
    vMin: number,
    vMax: number,
    options: GradientBandOptions = {}
  ): void {
    const fillAlpha = Number.isFinite(options.fillAlpha)
      ? (options.fillAlpha as number)
      : 0.08;
    if (fillAlpha <= 0) {
      return;
    }
    const hexMatch = String(color || "").match(
      /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i
    );
    if (!hexMatch) {
      return;
    }
    const r = parseInt(hexMatch[1], 16);
    const g = parseInt(hexMatch[2], 16);
    const b = parseInt(hexMatch[3], 16);
    const yEdge = this.yOf(valueEdge, vMin, vMax);
    const yMid = this.yOf(valueMid, vMin, vMax);
    if (Math.abs(yMid - yEdge) < 1) {
      return;
    }
    const { ctx, pad } = this;
    const grad = ctx.createLinearGradient(0, yEdge, 0, yMid);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fillAlpha})`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, this.cw, this.ch);
    ctx.clip();
    ctx.fillStyle = grad;
    ctx.fillRect(
      pad.left,
      Math.min(yEdge, yMid),
      this.cw,
      Math.abs(yMid - yEdge)
    );
    ctx.restore();
  }

  drawThresholdArea(
    points: ChartPoint[],
    thresholdValue: number,
    color: string,
    t0: number,
    t1: number,
    vMin: number,
    vMax: number,
    options: ThresholdAreaOptions = {}
  ): void {
    if (!Array.isArray(points) || points.length < 2) {
      return;
    }
    if (!Number.isFinite(thresholdValue)) {
      return;
    }
    const mode = options.mode === "below" ? "below" : "above";
    const fillAlpha = Number.isFinite(options.fillAlpha)
      ? (options.fillAlpha as number)
      : 0.12;
    if (fillAlpha <= 0) {
      return;
    }

    const segments: ChartPoint[][] = [];
    let currentSegment: ChartPoint[] = [];

    const isInside = (value: number): boolean => {
      if (mode === "below") {
        return value <= thresholdValue;
      }
      return value >= thresholdValue;
    };

    const flushSegment = () => {
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }
      currentSegment = [];
    };

    for (let index = 0; index < points.length - 1; index += 1) {
      const startPoint = points[index];
      const endPoint = points[index + 1];
      const startInside = isInside(startPoint[1]);
      const endInside = isInside(endPoint[1]);

      if (startInside && currentSegment.length === 0) {
        currentSegment.push(startPoint);
      }

      if (startInside && endInside) {
        currentSegment.push(endPoint);
        continue;
      }

      if (startInside !== endInside) {
        const deltaValue = endPoint[1] - startPoint[1];
        if (deltaValue === 0) {
          flushSegment();
          continue;
        }
        const fraction = (thresholdValue - startPoint[1]) / deltaValue;
        const crossingTime =
          startPoint[0] + (endPoint[0] - startPoint[0]) * fraction;
        const crossingPoint: ChartPoint = [crossingTime, thresholdValue];
        if (startInside) {
          currentSegment.push(crossingPoint);
          flushSegment();
        } else {
          currentSegment.push(crossingPoint);
          currentSegment.push(endPoint);
        }
        continue;
      }

      if (!startInside && !endInside) {
        flushSegment();
      }
    }

    flushSegment();

    if (!segments.length) {
      return;
    }

    const { ctx, pad } = this;
    const thresholdY = this.yOf(thresholdValue, vMin, vMax);
    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, this.cw, this.ch);
    ctx.clip();
    ctx.fillStyle = hexToRgba(color, fillAlpha);

    segments.forEach((segment) => {
      if (!Array.isArray(segment) || segment.length < 2) {
        return;
      }
      ctx.beginPath();
      const firstPoint = segment[0];
      ctx.moveTo(this.xOf(firstPoint[0], t0, t1), thresholdY);
      segment.forEach((point) => {
        ctx.lineTo(this.xOf(point[0], t0, t1), this.yOf(point[1], vMin, vMax));
      });
      const lastPoint = segment[segment.length - 1];
      ctx.lineTo(this.xOf(lastPoint[0], t0, t1), thresholdY);
      ctx.closePath();
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw diagonal hash marks at gap boundary points to indicate the start/end
   * of contiguous data ranges.
   *
   * @param {Array} boundaryPoints  Array of [timeMs, value] pairs at gap edges
   * @param {string} color          Stroke colour
   * @param {number} t0             Start time ms
   * @param {number} t1             End time ms
   * @param {number} vMin           Y axis min
   * @param {number} vMax           Y axis max
   */
  drawGapMarkers(
    boundaryPoints: ChartPoint[],
    color: string,
    t0: number,
    t1: number,
    vMin: number,
    vMax: number
  ): void {
    if (!boundaryPoints.length) {
      return;
    }
    const { ctx, pad } = this;
    const h = 7;
    const w = 3;
    const gap = 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, this.cw, this.ch);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.55;

    for (let i = 0; i < boundaryPoints.length; i++) {
      const [t, v] = boundaryPoints[i];
      const x = this.xOf(t, t0, t1);
      const y = this.yOf(v, vMin, vMax);
      // Even indices are opening marks (\\), odd indices are closing marks (//)
      const dir = i % 2 === 0 ? 1 : -1;
      for (let d = -gap; d <= gap; d += gap * 2) {
        ctx.beginPath();
        ctx.moveTo(x + d - w * dir, y - h);
        ctx.lineTo(x + d + w * dir, y + h);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawAnomalyClusters(
    clusters: AnomalyCluster[],
    color: string,
    t0: number,
    t1: number,
    vMin: number,
    vMax: number,
    options: DrawAnomalyClusterOptions = {}
  ): void {
    if (!Array.isArray(clusters) || clusters.length === 0) {
      return;
    }
    const strokeAlpha = Number.isFinite(options.strokeAlpha)
      ? (options.strokeAlpha as number)
      : 0.92;
    const lineWidth = Number.isFinite(options.lineWidth)
      ? (options.lineWidth as number)
      : 2;
    const haloWidth = Number.isFinite(options.haloWidth)
      ? (options.haloWidth as number)
      : Math.max(2.5, lineWidth + 1.5);
    const haloColor =
      typeof options.haloColor === "string" && options.haloColor
        ? options.haloColor
        : "rgba(255,255,255,0.9)";
    const haloAlpha = Number.isFinite(options.haloAlpha)
      ? (options.haloAlpha as number)
      : 0.9;
    const fillColor =
      typeof options.fillColor === "string" && options.fillColor
        ? options.fillColor
        : null;
    const fillAlpha = Number.isFinite(options.fillAlpha)
      ? (options.fillAlpha as number)
      : 0;
    const pointPadding = Number.isFinite(options.pointPadding)
      ? (options.pointPadding as number)
      : 10;
    const minRadiusX = Number.isFinite(options.minRadiusX)
      ? (options.minRadiusX as number)
      : 10;
    const minRadiusY = Number.isFinite(options.minRadiusY)
      ? (options.minRadiusY as number)
      : 10;
    const clusterRegions = this.getAnomalyClusterRegions(
      clusters,
      t0,
      t1,
      vMin,
      vMax,
      {
        pointPadding,
        minRadiusX,
        minRadiusY,
      }
    );
    const { ctx, pad } = this;

    ctx.save();
    ctx.beginPath();
    ctx.rect(pad.left, pad.top, this.cw, this.ch);
    ctx.clip();

    clusterRegions.forEach((region) => {
      ctx.save();
      ctx.setLineDash([]);
      if (fillColor && fillAlpha > 0) {
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.ellipse(
          region.centerX,
          region.centerY,
          region.radiusX,
          region.radiusY,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.globalAlpha = haloAlpha;
      ctx.strokeStyle = haloColor;
      ctx.lineWidth = haloWidth;
      ctx.beginPath();
      ctx.ellipse(
        region.centerX,
        region.centerY,
        region.radiusX,
        region.radiusY,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.globalAlpha = strokeAlpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.ellipse(
        region.centerX,
        region.centerY,
        region.radiusX,
        region.radiusY,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Animate a "blip" circle at the given canvas coordinates.
   * The circle expands with a bouncy overshoot, holds briefly, then shrinks to nothing.
   * Uses a separate overlay canvas so it doesn't interfere with the main chart.
   */
  drawBlip(
    cx: number,
    cy: number,
    color: string,
    options: DrawBlipOptions = {}
  ): void {
    const resolvedOptions = options;
    const maxRadius = resolvedOptions.maxRadius || 6;
    const duration = resolvedOptions.duration || 600;
    const canvas = this.canvas;
    const parent = canvas.parentElement;
    if (!parent) {
      return;
    }

    // Create a small overlay canvas positioned exactly over the chart canvas.
    const overlay = document.createElement("canvas");
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.style.cssText = `position:absolute;top:0;left:0;width:${canvas.style.width || `${canvas.offsetWidth}px`};height:${canvas.style.height || `${canvas.offsetHeight}px`};pointer-events:none;z-index:2;`;
    parent.style.position = parent.style.position || "relative";
    parent.appendChild(overlay);

    const ctx = overlay.getContext("2d");
    if (!ctx) {
      overlay.remove();
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const pxCx = cx * dpr;
    const pxCy = cy * dpr;
    const pxMaxR = maxRadius * dpr;
    const start = performance.now();

    const animate = (now: number): void => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, overlay.width, overlay.height);

      // Phase 1 (0–0.35): bouncy expand  Phase 2 (0.35–0.6): hold  Phase 3 (0.6–1): shrink out
      let radius: number;
      let alpha: number;
      if (t < 0.35) {
        // Overshoot bounce: ease to 1.3x then settle to 1x
        const p = t / 0.35;
        const bounce =
          p < 0.6 ? (p / 0.6) * 1.3 : 1.3 - 0.3 * ((p - 0.6) / 0.4);
        radius = pxMaxR * Math.min(bounce, 1.3);
        alpha = Math.min(p * 2.5, 0.85);
      } else if (t < 0.6) {
        radius = pxMaxR;
        alpha = 0.85;
      } else {
        const p = (t - 0.6) / 0.4;
        // Ease out cubic for smooth shrink
        const ease = 1 - (1 - p) ** 3;
        radius = pxMaxR * (1 - ease);
        alpha = 0.85 * (1 - ease);
      }

      if (radius > 0.2 && alpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pxCx, pxCy, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Outer ring for extra visibility
        ctx.beginPath();
        ctx.arc(pxCx, pxCy, radius * 1.6, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 * dpr;
        ctx.globalAlpha = alpha * 0.4;
        ctx.stroke();
        ctx.restore();
      }

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        overlay.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  getAnomalyClusterRegions(
    clusters: AnomalyCluster[],
    t0: number,
    t1: number,
    vMin: number,
    vMax: number,
    options: AnomalyRegionOptions = {}
  ): AnomalyRegion[] {
    if (!Array.isArray(clusters) || clusters.length === 0) {
      return [];
    }
    const pointPadding = Number.isFinite(options.pointPadding)
      ? (options.pointPadding as number)
      : 10;
    const minRadiusX = Number.isFinite(options.minRadiusX)
      ? (options.minRadiusX as number)
      : 10;
    const minRadiusY = Number.isFinite(options.minRadiusY)
      ? (options.minRadiusY as number)
      : 10;

    return clusters.flatMap((cluster) => {
      if (!Array.isArray(cluster?.points) || cluster.points.length === 0) {
        return [];
      }
      const xs: number[] = [];
      const ys: number[] = [];
      cluster.points.forEach((point) => {
        xs.push(this.xOf(point.timeMs, t0, t1));
        ys.push(this.yOf(point.value, vMin, vMax));
      });
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      return [
        {
          centerX: (minX + maxX) / 2,
          centerY: (minY + maxY) / 2,
          radiusX: Math.max(minRadiusX, (maxX - minX) / 2 + pointPadding),
          radiusY: Math.max(minRadiusY, (maxY - minY) / 2 + pointPadding),
          cluster,
        },
      ];
    });
  }
}
