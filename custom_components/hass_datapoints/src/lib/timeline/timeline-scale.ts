import { parseDateValue } from "@/lib/domain/chart-zoom";
import { msg } from "@/lib/i18n/localize";
import type { SelectOption } from "@/lib/types";

/**
 * Timeline subsystem helpers: range math, labels, snapping, and scale config.
 */

export const SECOND_MS = 1000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
export const RANGE_SLIDER_MIN_SPAN_MS = 15 * 60 * 1000;
export const RANGE_SLIDER_WINDOW_MS = 30 * DAY_MS;
export const RANGE_AUTO_ZOOM_DEBOUNCE_MS = 3000;
export const RANGE_AUTO_ZOOM_SELECTION_PADDING_RATIO = 0.6;
export const RANGE_FUTURE_BUFFER_YEARS = 1;
export const RANGE_LABEL_MIN_GAP_PX = 10;
export const RANGE_CONTEXT_LABEL_MIN_GAP_PX = 14;
export const RANGE_HANDLE_EDGE_SCROLL_THRESHOLD_PX = 48;
export const RANGE_HANDLE_EDGE_SCROLL_MAX_STEP_PX = 28;

export const RANGE_ZOOM_OPTIONS: SelectOption[] = [
  { value: "auto", label: "Auto" },
  { value: "quarterly", label: "Quarterly" },
  { value: "month_compressed", label: "Month Compressed" },
  { value: "month_short", label: "Month Short" },
  { value: "month_expanded", label: "Month Expanded" },
  { value: "week_compressed", label: "Week Compressed" },
  { value: "week_expanded", label: "Week Expanded" },
  { value: "day", label: "Day" },
];

export const RANGE_SNAP_OPTIONS: SelectOption[] = [
  { value: "auto", label: "Auto" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
  { value: "second", label: "Second" },
];

export type RangeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

export type ZoomLevel = "" | "quarterly" | "month_short";

export interface RangeZoomConfig {
  baselineMs: number;
  boundsUnit: RangeUnit;
  contextUnit: "year" | "month" | "day";
  detailUnit?: RangeUnit;
  detailStep?: number;
  majorUnit: RangeUnit;
  labelUnit: RangeUnit;
  minorUnit: RangeUnit;
  pixelsPerUnit: number;
}

export const RANGE_ZOOM_CONFIGS: Record<string, RangeZoomConfig> = {
  quarterly: {
    baselineMs: 730 * DAY_MS,
    boundsUnit: "month",
    contextUnit: "year",
    detailUnit: "month",
    majorUnit: "quarter",
    labelUnit: "quarter",
    minorUnit: "month",
    pixelsPerUnit: 96,
  },
  month_compressed: {
    baselineMs: 365 * DAY_MS,
    boundsUnit: "month",
    contextUnit: "year",
    detailUnit: "week",
    majorUnit: "month",
    labelUnit: "month",
    minorUnit: "month",
    pixelsPerUnit: 76,
  },
  month_short: {
    baselineMs: 180 * DAY_MS,
    boundsUnit: "week",
    contextUnit: "month",
    detailUnit: "day",
    majorUnit: "week",
    labelUnit: "week",
    minorUnit: "week",
    pixelsPerUnit: 54,
  },
  month_expanded: {
    baselineMs: 90 * DAY_MS,
    boundsUnit: "week",
    contextUnit: "month",
    detailUnit: "day",
    majorUnit: "week",
    labelUnit: "week",
    minorUnit: "week",
    pixelsPerUnit: 72,
  },
  week_compressed: {
    baselineMs: 56 * DAY_MS,
    boundsUnit: "week",
    contextUnit: "month",
    detailUnit: "day",
    majorUnit: "week",
    labelUnit: "week",
    minorUnit: "week",
    pixelsPerUnit: 120,
  },
  week_expanded: {
    baselineMs: 28 * DAY_MS,
    boundsUnit: "day",
    contextUnit: "month",
    detailUnit: "hour",
    detailStep: 12,
    majorUnit: "day",
    labelUnit: "day",
    minorUnit: "day",
    pixelsPerUnit: 30,
  },
  day: {
    baselineMs: 48 * HOUR_MS,
    boundsUnit: "hour",
    contextUnit: "day",
    majorUnit: "hour",
    labelUnit: "hour",
    minorUnit: "hour",
    pixelsPerUnit: 9,
  },
};

interface RangeValueLike {
  startDate?: string | Nullable<number | Date>;
  endDate?: string | Nullable<number | Date>;
}

interface RangeEventLike {
  detail?: {
    value?: RangeValueLike;
    startDate?: string | Nullable<number | Date>;
    endDate?: string | Nullable<number | Date>;
  };
  value?: RangeValueLike;
  startDate?: string | Nullable<number | Date>;
  endDate?: string | Nullable<number | Date>;
  target?: {
    value?: RangeValueLike;
    startDate?: string | Nullable<number | Date>;
    endDate?: string | Nullable<number | Date>;
  };
}

export function extractRangeValue(
  source: Nullable<RangeEventLike> | undefined
): {
  start: Nullable<Date>;
  end: Nullable<Date>;
} {
  if (!source) {
    return { start: null, end: null };
  }

  const detail = source.detail || {};
  const value = detail.value || source.value || source.target?.value || {};
  return {
    start: parseDateValue(
      detail.startDate ||
        value.startDate ||
        source.startDate ||
        source.target?.startDate
    ),
    end: parseDateValue(
      detail.endDate ||
        value.endDate ||
        source.endDate ||
        source.target?.endDate
    ),
  };
}

export function formatRangeDateTime(value: Date, locale?: string): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "--";
  }

  return value.toLocaleString(locale ? [locale] : [], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRangeTick(value: Date, locale?: string): string {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "--";
  }

  return value.toLocaleString(locale ? [locale] : [], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRangeDuration(start: Date, end: Date): string {
  if (!(start instanceof Date) || !(end instanceof Date)) {
    return "--";
  }

  const totalMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 60000)
  );
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days) {
    parts.push(`${days}d`);
  }

  if (hours) {
    parts.push(`${hours}h`);
  }

  if (minutes || !parts.length) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
}

export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function startOfLocalHour(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    0,
    0,
    0
  );
}

function startOfLocalMinute(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    value.getMinutes(),
    0,
    0
  );
}

function startOfLocalSecond(value: Date): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
    value.getHours(),
    value.getMinutes(),
    value.getSeconds(),
    0
  );
}

function startOfLocalMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfLocalMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth() + 1, 1);
}

function startOfLocalYear(value: Date): Date {
  return new Date(value.getFullYear(), 0, 1);
}

function startOfLocalWeek(value: Date): Date {
  const day = value.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const result = startOfLocalDay(value);
  result.setDate(result.getDate() + mondayOffset);
  return result;
}

function startOfLocalQuarter(value: Date): Date {
  return new Date(value.getFullYear(), Math.floor(value.getMonth() / 3) * 3, 1);
}

function endOfLocalHour(value: Date): Date {
  const result = startOfLocalHour(value);
  result.setHours(result.getHours() + 1);
  return result;
}

function endOfLocalDay(value: Date): Date {
  const result = startOfLocalDay(value);
  result.setDate(result.getDate() + 1);
  return result;
}

function endOfLocalWeek(value: Date): Date {
  const result = startOfLocalWeek(value);
  result.setDate(result.getDate() + 7);
  return result;
}

function endOfLocalQuarter(value: Date): Date {
  const result = startOfLocalQuarter(value);
  result.setMonth(result.getMonth() + 3);
  return result;
}

function endOfLocalMinute(value: Date): Date {
  const result = startOfLocalMinute(value);
  result.setMinutes(result.getMinutes() + 1);
  return result;
}

function endOfLocalSecond(value: Date): Date {
  const result = startOfLocalSecond(value);
  result.setSeconds(result.getSeconds() + 1);
  return result;
}

function formatMonthLabel(value: Date, locale?: string): string {
  return value.toLocaleString(locale ? [locale] : [], { month: "short" });
}

function formatYearLabel(value: Date, locale?: string): string {
  return value.toLocaleString(locale ? [locale] : [], { year: "numeric" });
}

function formatRangeSummary(start: Date, end: Date, locale?: string): string {
  return `${formatRangeDateTime(start, locale)} - ${formatRangeDateTime(end, locale)} (${formatRangeDuration(start, end)})`;
}

function getWeekOfYear(value: Date): number {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
}

function getWeekLabel(value: Date, locale?: string): string {
  return value.toLocaleString(locale ? [locale] : [], {
    month: "short",
    day: "numeric",
  });
}

function formatDayLabel(value: Date, locale?: string): string {
  return value.toLocaleString(locale ? [locale] : [], { day: "numeric" });
}

function formatHourLabel(value: Date, locale?: string): string {
  return value.toLocaleTimeString(locale ? [locale] : [], { hour: "2-digit" });
}

function formatQuarterLabel(
  value: Date,
  zoomLevel: ZoomLevel = "",
  locale?: string
): string {
  return zoomLevel === "quarterly"
    ? `Q${Math.floor(value.getMonth() / 3) + 1}`
    : formatMonthLabel(value, locale);
}

function formatScaleLabel(
  value: Date,
  unit: RangeUnit,
  zoomLevel: ZoomLevel = "",
  locale?: string
): string {
  switch (unit) {
    case "quarter":
      return formatQuarterLabel(value, zoomLevel, locale);
    case "month":
      return formatMonthLabel(value, locale);
    case "week":
      return zoomLevel === "month_short"
        ? `${msg("Wk")} ${getWeekOfYear(value)}`
        : getWeekLabel(value, locale);
    case "day":
      return formatDayLabel(value, locale);
    case "hour":
      return formatHourLabel(value, locale);
    default:
      return formatRangeTick(value, locale);
  }
}

function formatContextLabel(
  value: Date,
  unit: "year" | "month" | "day",
  locale?: string
): string {
  switch (unit) {
    case "year":
      return formatYearLabel(value, locale);
    case "month":
      return value.toLocaleString(locale ? [locale] : [], {
        month: "short",
        year: "numeric",
      });
    case "day":
      return value.toLocaleString(locale ? [locale] : [], {
        month: "short",
        day: "numeric",
      });
    default:
      return formatRangeTick(value, locale);
  }
}

function formatPeriodSelectionLabel(
  value: Date,
  unit: RangeUnit,
  locale?: string
): string {
  switch (unit) {
    case "year":
      return formatYearLabel(value, locale);
    case "quarter":
      return `${formatQuarterLabel(value, "", locale)} ${formatYearLabel(value, locale)}`;
    case "month":
      return value.toLocaleString(locale ? [locale] : [], {
        month: "long",
        year: "numeric",
      });
    case "week":
      return `${msg("Week of")} ${value.toLocaleString(locale ? [locale] : [], { month: "short", day: "numeric", year: "numeric" })}`;
    case "day":
      return value.toLocaleString(locale ? [locale] : [], {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "hour":
      return value.toLocaleString(locale ? [locale] : [], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
      });
    default:
      return formatRangeTick(value, locale);
  }
}

function startOfUnit(value: Date, unit: RangeUnit): Date {
  switch (unit) {
    case "second":
      return startOfLocalSecond(value);
    case "minute":
      return startOfLocalMinute(value);
    case "hour":
      return startOfLocalHour(value);
    case "day":
      return startOfLocalDay(value);
    case "week":
      return startOfLocalWeek(value);
    case "month":
      return startOfLocalMonth(value);
    case "quarter":
      return startOfLocalQuarter(value);
    case "year":
      return startOfLocalYear(value);
    default:
      return new Date(value);
  }
}

function endOfUnit(value: Date, unit: RangeUnit): Date {
  switch (unit) {
    case "second":
      return endOfLocalSecond(value);
    case "minute":
      return endOfLocalMinute(value);
    case "hour":
      return endOfLocalHour(value);
    case "day":
      return endOfLocalDay(value);
    case "week":
      return endOfLocalWeek(value);
    case "month":
      return endOfLocalMonth(value);
    case "quarter":
      return endOfLocalQuarter(value);
    case "year": {
      const result = startOfLocalYear(value);
      result.setFullYear(result.getFullYear() + 1);
      return result;
    }
    default:
      return new Date(value);
  }
}

function addUnit(value: Date, unit: RangeUnit, amount = 1): Date {
  const result = new Date(value);
  switch (unit) {
    case "second":
      result.setSeconds(result.getSeconds() + amount);
      break;
    case "minute":
      result.setMinutes(result.getMinutes() + amount);
      break;
    case "hour":
      result.setHours(result.getHours() + amount);
      break;
    case "day":
      result.setDate(result.getDate() + amount);
      break;
    case "week":
      result.setDate(result.getDate() + amount * 7);
      break;
    case "month":
      result.setMonth(result.getMonth() + amount);
      break;
    case "quarter":
      result.setMonth(result.getMonth() + amount * 3);
      break;
    case "year":
      result.setFullYear(result.getFullYear() + amount);
      break;
    default:
      break;
  }
  return result;
}

function snapDateToUnit(value: Date, unit: RangeUnit): Date {
  const start = startOfUnit(value, unit);
  const end = endOfUnit(value, unit);
  return value.getTime() - start.getTime() < end.getTime() - value.getTime()
    ? start
    : end;
}

export {
  addUnit,
  endOfLocalDay,
  endOfLocalHour,
  endOfLocalMinute,
  endOfLocalMonth,
  endOfLocalQuarter,
  endOfLocalSecond,
  endOfLocalWeek,
  endOfUnit,
  formatContextLabel,
  formatDayLabel,
  formatHourLabel,
  formatMonthLabel,
  formatPeriodSelectionLabel,
  formatQuarterLabel,
  formatRangeSummary,
  formatScaleLabel,
  formatYearLabel,
  getWeekLabel,
  getWeekOfYear,
  snapDateToUnit,
  startOfLocalDay,
  startOfLocalHour,
  startOfLocalMinute,
  startOfLocalMonth,
  startOfLocalQuarter,
  startOfLocalSecond,
  startOfLocalWeek,
  startOfLocalYear,
  startOfUnit,
};
