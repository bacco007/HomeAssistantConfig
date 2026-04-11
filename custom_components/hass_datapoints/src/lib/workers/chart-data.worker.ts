/**
 * Chart data worker — offloads CPU-bound data preparation from the main thread.
 *
 * Currently handles:
 *   • downsample  — fixed-width time-bucket aggregation (mean/min/max/median/first/last)
 */

export type ChartAggregate =
  | "mean"
  | "min"
  | "max"
  | "median"
  | "first"
  | "last";
export type ChartPoint = [number, number];

export interface DownsamplePayload {
  pts: ChartPoint[];
  intervalMs: number;
  aggregate: ChartAggregate;
}

export function downsamplePts(
  pts: ChartPoint[],
  intervalMs: number,
  aggregate: string
): ChartPoint[] {
  if (!pts.length || intervalMs <= 0) {
    return pts;
  }
  const buckets = new Map<number, number[]>();
  const bucketRepTime = new Map<number, number>();
  for (const [time, value] of pts) {
    const idx = Math.floor(time / intervalMs);
    if (!buckets.has(idx)) {
      buckets.set(idx, []);
      bucketRepTime.set(idx, time);
    }
    buckets.get(idx)?.push(value);
  }
  const result: ChartPoint[] = [];
  for (const idx of [...buckets.keys()].sort((a, b) => a - b)) {
    const values = buckets.get(idx) || [];
    const repTime = bucketRepTime.get(idx) || 0;
    let agg: number;
    if (aggregate === "min") {
      agg = Math.min(...values);
    } else if (aggregate === "max") {
      agg = Math.max(...values);
    } else if (aggregate === "median") {
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      agg =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
    } else if (aggregate === "first") {
      agg = values[0];
    } else if (aggregate === "last") {
      agg = values[values.length - 1];
    } else {
      agg = values.reduce((sum, current) => sum + current, 0) / values.length;
    }
    result.push([repTime, agg]);
  }
  return result;
}

interface ChartDataWorkerRequest {
  id: number;
  type: "downsample";
  payload: DownsamplePayload;
}

interface ChartDataWorkerResponse {
  id: number;
  result?: ChartPoint[];
  error?: string;
}

declare const self: Worker;

self.onmessage = ({ data }: MessageEvent<ChartDataWorkerRequest>) => {
  const { id, type, payload } = data || {};
  try {
    let result: ChartPoint[];
    if (type === "downsample") {
      result = downsamplePts(
        payload.pts,
        payload.intervalMs,
        payload.aggregate
      );
    } else {
      throw new Error(`Unknown message type: ${type}`);
    }
    self.postMessage({ id, result } satisfies ChartDataWorkerResponse);
  } catch (err) {
    self.postMessage({
      id,
      error: String(err),
    } satisfies ChartDataWorkerResponse);
  }
};
