/**
 * Pure scroll position calculation extracted from history-chart.ts.
 */

import { clampChartValue } from "@/lib/chart/chart-shell";

export function calculateViewportScrollPosition(
  t0: number,
  t1: number,
  canvasWidth: number,
  viewportWidth: number,
  zoomStart: number,
  zoomEnd: number
): number {
  const totalMs = Math.max(1, t1 - t0);
  const spanMs = Math.max(1, zoomEnd - zoomStart);
  const maxScrollLeft = Math.max(
    0,
    Math.max(canvasWidth, viewportWidth) - viewportWidth
  );
  const maxStartOffsetMs = Math.max(0, totalMs - spanMs);
  const clampedStart = clampChartValue(zoomStart, t0, t1 - spanMs);
  const ratio =
    maxStartOffsetMs > 0 ? (clampedStart - t0) / maxStartOffsetMs : 0;
  return ratio * maxScrollLeft;
}
