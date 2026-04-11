import type { Point } from "./types";
import { getTrendWindowMs } from "./windows";

export function getEmaAlpha(window: string): number {
  const alphas: Record<string, number> = {
    "30m": 0.97,
    "1h": 0.92,
    "2h": 0.88,
    "3h": 0.84,
    "6h": 0.75,
    "24h": 0.5,
    "7d": 0.25,
    "14d": 0.15,
    "21d": 0.1,
    "28d": 0.07,
  };
  return alphas[window] ?? 0.5;
}

export function getLowessBandwidth(window: string, points: Point[]): number {
  const fractions: Record<string, number> = {
    "30m": 0.05,
    "1h": 0.1,
    "2h": 0.13,
    "3h": 0.16,
    "6h": 0.2,
    "24h": 0.3,
    "7d": 0.4,
    "14d": 0.55,
    "21d": 0.7,
    "28d": 0.85,
  };
  const fraction = fractions[window] ?? 0.3;
  if (points.length < 2) return fraction;
  const span = points[points.length - 1][0] - points[0][0];
  return span > 0 ? fraction * span : fraction;
}

export function buildRollingAverageTrend(
  points: Point[],
  windowMs: number
): Point[] {
  if (
    !Array.isArray(points) ||
    points.length < 2 ||
    !Number.isFinite(windowMs) ||
    windowMs <= 0
  ) {
    return [];
  }
  const trendPoints: Point[] = [];
  let windowStartIndex = 0;
  let windowSum = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [time, value] = points[index];
    windowSum += value;
    while (
      windowStartIndex < index &&
      time - points[windowStartIndex][0] > windowMs
    ) {
      windowSum -= points[windowStartIndex][1];
      windowStartIndex += 1;
    }
    const count = index - windowStartIndex + 1;
    if (count > 0) {
      trendPoints.push([time, windowSum / count]);
    }
  }
  return trendPoints;
}

export function buildLinearTrend(points: Point[]): Point[] {
  if (!Array.isArray(points) || points.length < 2) {
    return [];
  }
  const origin = points[0][0];
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;
  for (const [time, value] of points) {
    const x = (time - origin) / (60 * 60 * 1000);
    sumX += x;
    sumY += value;
    sumXX += x * x;
    sumXY += x * value;
  }
  const count = points.length;
  const denominator = count * sumXX - sumX * sumX;
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-9) {
    return [];
  }
  const slope = (count * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / count;
  const firstTime = points[0][0];
  const lastTime = points[points.length - 1][0];
  const firstX = (firstTime - origin) / (60 * 60 * 1000);
  const lastX = (lastTime - origin) / (60 * 60 * 1000);
  return [
    [firstTime, intercept + slope * firstX],
    [lastTime, intercept + slope * lastX],
  ];
}

export function buildEmaTrend(points: Point[], alpha: number): Point[] {
  if (!Array.isArray(points) || points.length < 2) {
    return [];
  }
  const a = Math.max(0, Math.min(1, alpha));
  const result: Point[] = [[points[0][0], points[0][1]]];
  for (let i = 1; i < points.length; i += 1) {
    const ema = a * points[i][1] + (1 - a) * result[i - 1][1];
    result.push([points[i][0], ema]);
  }
  return result;
}

export function buildPolynomialTrend(points: Point[]): Point[] {
  if (!Array.isArray(points) || points.length < 3) {
    return [];
  }
  const origin = points[0][0];
  const scale = points[points.length - 1][0] - origin || 1;
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let t0 = 0;
  let t1 = 0;
  let t2 = 0;
  for (const [time, value] of points) {
    const x = (time - origin) / scale;
    const x2 = x * x;
    s0 += 1;
    s1 += x;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;
    t0 += value;
    t1 += x * value;
    t2 += x2 * value;
  }
  const det =
    s0 * (s2 * s4 - s3 * s3) -
    s1 * (s1 * s4 - s3 * s2) +
    s2 * (s1 * s3 - s2 * s2);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) {
    return [];
  }
  const a =
    (t0 * (s2 * s4 - s3 * s3) -
      s1 * (t1 * s4 - s3 * t2) +
      s2 * (t1 * s3 - s2 * t2)) /
    det;
  const b =
    (s0 * (t1 * s4 - s3 * t2) -
      t0 * (s1 * s4 - s3 * s2) +
      s2 * (s1 * t2 - t1 * s2)) /
    det;
  const c =
    (s0 * (s2 * t2 - t1 * s3) -
      s1 * (s1 * t2 - t1 * s2) +
      t0 * (s1 * s3 - s2 * s2)) /
    det;
  return points.map(([time]) => {
    const x = (time - origin) / scale;
    return [time, a + b * x + c * x * x] as Point;
  });
}

export function buildLowessTrend(points: Point[], bandwidth: number): Point[] {
  if (!Array.isArray(points) || points.length < 2) {
    return [];
  }
  const MAX_INPUT = 2000;
  const MAX_OUTPUT = 300;
  const subsample = (n: number, max: number): number[] =>
    n <= max
      ? Array.from({ length: n }, (_, i) => i)
      : Array.from({ length: max }, (_, i) =>
          Math.round((i / (max - 1)) * (n - 1))
        );

  const inputIdx = subsample(points.length, MAX_INPUT);
  const outputIdx = subsample(points.length, MAX_OUTPUT);

  const result: Point[] = [];
  for (const oi of outputIdx) {
    const xi = points[oi][0];
    let sumW = 0;
    let sumWX = 0;
    let sumWY = 0;
    let sumWXX = 0;
    let sumWXY = 0;
    for (let k = 0; k < inputIdx.length; k += 1) {
      const d = Math.abs(points[inputIdx[k]][0] - xi);
      if (d >= bandwidth) continue;
      const normDist = d / bandwidth;
      const u = 1 - normDist * normDist * normDist;
      const w = u * u * u;
      if (w <= 0) continue;
      const xj = points[inputIdx[k]][0];
      const yj = points[inputIdx[k]][1];
      sumW += w;
      sumWX += w * xj;
      sumWY += w * yj;
      sumWXX += w * xj * xj;
      sumWXY += w * xj * yj;
    }
    const denom = sumW * sumWXX - sumWX * sumWX;
    if (!Number.isFinite(denom) || Math.abs(denom) < 1e-12) {
      result.push([xi, sumW > 0 ? sumWY / sumW : points[oi][1]]);
      continue;
    }
    const slope = (sumW * sumWXY - sumWX * sumWY) / denom;
    const intercept = (sumWY - slope * sumWX) / sumW;
    result.push([xi, intercept + slope * xi]);
  }
  return result;
}

export function interpolateSeriesValue(
  points: Point[],
  timeMs: number
): Nullable<number> {
  if (!Array.isArray(points) || !points.length) {
    return null;
  }
  if (timeMs < points[0][0] || timeMs > points[points.length - 1][0]) {
    return null;
  }
  if (timeMs === points[0][0]) {
    return points[0][1];
  }
  if (timeMs === points[points.length - 1][0]) {
    return points[points.length - 1][1];
  }
  for (let index = 0; index < points.length - 1; index += 1) {
    const [startTime, startValue] = points[index];
    const [endTime, endValue] = points[index + 1];
    if (timeMs >= startTime && timeMs <= endTime) {
      const fraction = (timeMs - startTime) / (endTime - startTime);
      return startValue + fraction * (endValue - startValue);
    }
  }
  return null;
}

export function buildRateOfChangePoints(
  points: Point[],
  rateWindow = "1h"
): Point[] {
  if (!Array.isArray(points) || points.length < 2) {
    return [];
  }
  const ratePoints: Point[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const [timeMs, value] = points[index];
    let comparisonPoint: Nullable<Point> = null;
    if (rateWindow === "point_to_point") {
      comparisonPoint = points[index - 1];
    } else {
      const windowMs = getTrendWindowMs(rateWindow);
      if (!Number.isFinite(windowMs) || windowMs <= 0) {
        continue;
      }
      for (
        let candidateIndex = index - 1;
        candidateIndex >= 0;
        candidateIndex -= 1
      ) {
        const candidatePoint = points[candidateIndex];
        if (timeMs - candidatePoint[0] >= windowMs) {
          comparisonPoint = candidatePoint;
          break;
        }
      }
      if (!comparisonPoint) {
        comparisonPoint = points[0];
      }
    }
    if (!Array.isArray(comparisonPoint) || comparisonPoint.length < 2) {
      continue;
    }
    const deltaMs = timeMs - comparisonPoint[0];
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      continue;
    }
    const deltaHours = deltaMs / (60 * 60 * 1000);
    if (!Number.isFinite(deltaHours) || deltaHours <= 0) {
      continue;
    }
    const rateValue = (value - comparisonPoint[1]) / deltaHours;
    if (!Number.isFinite(rateValue)) {
      continue;
    }
    ratePoints.push([timeMs, rateValue]);
  }
  return ratePoints;
}

export function buildDeltaPoints(
  sourcePoints: Point[],
  comparisonPoints: Point[]
): Point[] {
  if (
    !Array.isArray(sourcePoints) ||
    sourcePoints.length < 2 ||
    !Array.isArray(comparisonPoints) ||
    comparisonPoints.length < 2
  ) {
    return [];
  }
  const deltaPoints: Point[] = [];
  for (const [timeMs, value] of sourcePoints) {
    const comparisonValue = interpolateSeriesValue(comparisonPoints, timeMs);
    if (comparisonValue == null) {
      continue;
    }
    deltaPoints.push([timeMs, value - comparisonValue]);
  }
  return deltaPoints;
}
