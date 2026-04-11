/**
 * Date parsing and zoom state helpers shared by chart/timeline subsystems.
 */

export function parseDateValue(
  value: string | number | Nullable<Date> | undefined
): Nullable<Date> {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function createChartZoomRange(
  startValue: string | number | Nullable<Date> | undefined,
  endValue: string | number | Nullable<Date> | undefined
): Nullable<{ start: number; end: number }> {
  const startDate = parseDateValue(startValue);
  const endDate = parseDateValue(endValue);
  const start = startDate?.getTime();
  const end = endDate?.getTime();
  if (
    typeof start === "number" &&
    Number.isFinite(start) &&
    typeof end === "number" &&
    Number.isFinite(end) &&
    start < end
  ) {
    return { start: start as number, end: end as number };
  }
  return null;
}
