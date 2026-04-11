import type { Point } from "./types";

/**
 * Map of human-readable interval strings to milliseconds.
 * Used when configuring downsampling bucket widths.
 */
export const SAMPLE_INTERVAL_MS: RecordWithNumericValues = {
  "1s": 1_000,
  "5s": 5_000,
  "10s": 10_000,
  "15s": 15_000,
  "30s": 30_000,
  "1m": 60_000,
  "2m": 2 * 60_000,
  "5m": 5 * 60_000,
  "10m": 10 * 60_000,
  "15m": 15 * 60_000,
  "30m": 30 * 60_000,
  "1h": 60 * 60_000,
  "2h": 2 * 60 * 60_000,
  "3h": 3 * 60 * 60_000,
  "4h": 4 * 60 * 60_000,
  "6h": 6 * 60 * 60_000,
  "12h": 12 * 60 * 60_000,
  "24h": 24 * 60 * 60_000,
};

/**
 * Bucket time-series data into fixed-width intervals and reduce each bucket
 * using the specified aggregate function (default: mean).
 */
export function downsamplePts(
  pts: Point[],
  intervalMs: number,
  aggregate: "mean" | "min" | "max" | "median" | "first" | "last" = "mean"
): Point[] {
  if (!pts.length || intervalMs <= 0) {
    return pts;
  }
  const buckets = new Map<number, number[]>();
  const bucketRepTime = new Map<number, number>();
  for (const [timeMs, value] of pts) {
    const bucketIndex = Math.floor(timeMs / intervalMs);
    if (!buckets.has(bucketIndex)) {
      buckets.set(bucketIndex, []);
      bucketRepTime.set(bucketIndex, timeMs);
    }
    buckets.get(bucketIndex)!.push(value);
  }
  const result: Point[] = [];
  for (const bucketIndex of [...buckets.keys()].sort((a, b) => a - b)) {
    const values = buckets.get(bucketIndex)!;
    const repTime = bucketRepTime.get(bucketIndex)!;
    let aggregateValue: number;
    if (aggregate === "min") {
      aggregateValue = Math.min(...values);
    } else if (aggregate === "max") {
      aggregateValue = Math.max(...values);
    } else if (aggregate === "median") {
      const sortedValues = [...values].sort((a, b) => a - b);
      const midpoint = Math.floor(sortedValues.length / 2);
      if (sortedValues.length % 2 !== 0) {
        aggregateValue = sortedValues[midpoint];
      } else {
        aggregateValue =
          (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2;
      }
    } else if (aggregate === "first") {
      aggregateValue = values[0];
    } else if (aggregate === "last") {
      aggregateValue = values[values.length - 1];
    } else {
      aggregateValue =
        values.reduce((sum, entry) => sum + entry, 0) / values.length;
    }
    result.push([repTime, aggregateValue]);
  }
  return result;
}
