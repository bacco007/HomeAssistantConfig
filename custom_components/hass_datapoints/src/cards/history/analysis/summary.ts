import type { Point, SummaryStats } from "./types";

export function buildSummaryStats(points: Point[]): Nullable<SummaryStats> {
  if (!Array.isArray(points) || !points.length) {
    return null;
  }
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let count = 0;
  for (const point of points) {
    const value = Number(point?.[1]);
    if (!Number.isFinite(value)) {
      continue;
    }
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
    sum += value;
    count += 1;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || count === 0) {
    return null;
  }
  return {
    min,
    max,
    mean: sum / count,
  };
}
