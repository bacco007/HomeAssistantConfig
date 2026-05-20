/**
 * Pure comparison-window utilities extracted from history-chart.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import type { AnomalyCluster } from "@/lib/chart/chart-renderer";

// ── Comparison window line styling ──────────────────────────────────────────

export interface ComparisonWindowLineStyle {
  lineOpacity: number;
  lineWidth?: number;
  dashed: boolean;
  dashPattern?: number[];
  hoverOpacity: number;
}

export function getComparisonWindowLineStyle(
  isHovered: boolean,
  isSelected: boolean,
  hoveringDifferentComparison: boolean
): ComparisonWindowLineStyle {
  if (isHovered) {
    return {
      lineOpacity: 1,
      dashed: false,
      hoverOpacity: 0.85,
    };
  }
  if (hoveringDifferentComparison && isSelected) {
    return {
      lineOpacity: 0.25,
      lineWidth: 1.25,
      dashed: false,
      hoverOpacity: 0.25,
    };
  }
  return {
    lineOpacity: 0.85,
    dashed: false,
    hoverOpacity: 0.85,
  };
}

// ── Comparison anomaly cache key ────────────────────────────────────────────

export function getComparisonAnomalyCacheKey(
  windowId: string,
  entityId: string
): string {
  return `${windowId}:${entityId}`;
}

// ── Shift comparison anomaly clusters ───────────────────────────────────────

export function shiftComparisonAnomalyClusters(
  clusters: AnomalyCluster[],
  timeOffsetMs: number
): AnomalyCluster[] {
  return (Array.isArray(clusters) ? clusters : []).map((cluster) => ({
    ...cluster,
    points: Array.isArray(cluster.points)
      ? cluster.points.map((point) => ({
          ...point,
          timeMs: Number(point.timeMs) - timeOffsetMs,
        }))
      : [],
  }));
}

// ── Filter clusters by correlated spans ─────────────────────────────────────

export function filterClustersByCorrelatedSpans(
  anomalyClusters: AnomalyCluster[],
  correlatedSpans: Array<{ start: number; end: number }>
): AnomalyCluster[] {
  if (!Array.isArray(anomalyClusters) || anomalyClusters.length === 0) {
    return [];
  }
  if (!Array.isArray(correlatedSpans) || correlatedSpans.length === 0) {
    return [];
  }

  return anomalyClusters.filter((cluster) => {
    const points = (cluster as { points?: Array<{ timeMs: number }> }).points;
    if (!Array.isArray(points) || points.length === 0) {
      return false;
    }
    const startTime = Number(points[0]?.timeMs);
    const endTime = Number(points[points.length - 1]?.timeMs);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return false;
    }
    const clusterStart = Math.min(startTime, endTime);
    const clusterEnd = Math.max(startTime, endTime);

    return correlatedSpans.some((span) => {
      const spanStart = Number(span.start);
      const spanEnd = Number(span.end);
      if (!Number.isFinite(spanStart) || !Number.isFinite(spanEnd)) {
        return false;
      }
      return clusterEnd >= spanStart && clusterStart <= spanEnd;
    });
  });
}

// ── Resolve anomaly cluster display mode ────────────────────────────────────

export function resolveAnomalyClusterDisplay(
  anomalyClusters: AnomalyCluster[],
  overlapMode: Nullable<string> | undefined,
  correlatedSpans: Array<{ start: number; end: number }> = []
): {
  baseClusters: AnomalyCluster[];
  regionClusters: AnomalyCluster[];
  showCorrelatedSpans: boolean;
} {
  const normalClusters = anomalyClusters.filter(
    (c) => !(c as { isOverlap?: boolean }).isOverlap
  );
  const overlapClusters = anomalyClusters.filter(
    (c) => (c as { isOverlap?: boolean }).isOverlap === true
  );

  if (overlapMode === "only") {
    const overlapOnlyClusters = filterClustersByCorrelatedSpans(
      anomalyClusters,
      correlatedSpans
    );
    return {
      baseClusters: overlapOnlyClusters,
      regionClusters: overlapOnlyClusters,
      showCorrelatedSpans: true,
    };
  }

  return {
    baseClusters: [...normalClusters, ...overlapClusters],
    regionClusters: [...normalClusters, ...overlapClusters],
    showCorrelatedSpans: false,
  };
}

// ── Build correlated anomaly spans ──────────────────────────────────────────

export function buildCorrelatedAnomalySpans(
  visibleSeries: Array<{
    entityId: string;
    pts: [number, number][];
  }>,
  anomalyClustersMap: Map<string, Array<{ points: Array<{ timeMs: number }> }>>,
  analysisMap: Map<string, unknown>
): Array<{ start: number; end: number }> {
  const seriesIntervals: Array<{
    entityId: string;
    intervals: Array<{ start: number; end: number }>;
  }> = [];
  for (const seriesItem of visibleSeries) {
    const analysis = analysisMap.get(seriesItem.entityId) as
      | RecordWithUnknownValues
      | undefined;
    if (analysis?.show_anomalies !== true) continue;
    const clusters = anomalyClustersMap.get(seriesItem.entityId) || [];
    if (!clusters.length) continue;

    const pts = seriesItem.pts;
    let tolerance = 60000;
    if (Array.isArray(pts) && pts.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < pts.length; i++) {
        const diff = pts[i][0] - pts[i - 1][0];
        if (diff > 0) intervals.push(diff);
      }
      if (intervals.length) {
        intervals.sort((a, b) => a - b);
        const mid = Math.floor(intervals.length / 2);
        tolerance =
          intervals.length % 2 === 0
            ? (intervals[mid - 1] + intervals[mid]) / 2
            : intervals[mid];
        tolerance = Math.max(tolerance, 1000);
      }
    }

    const entityIntervals: Array<{ start: number; end: number }> = [];
    for (const cluster of clusters) {
      if (!Array.isArray(cluster.points) || cluster.points.length === 0)
        continue;
      const startTime = cluster.points[0]?.timeMs;
      const endTime = cluster.points[cluster.points.length - 1]?.timeMs;
      if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) continue;
      entityIntervals.push({
        start: Math.min(startTime, endTime) - tolerance,
        end: Math.max(startTime, endTime) + tolerance,
      });
    }
    if (entityIntervals.length) {
      seriesIntervals.push({
        entityId: seriesItem.entityId,
        intervals: entityIntervals,
      });
    }
  }

  if (seriesIntervals.length < 2) return [];

  const events: Array<{ time: number; delta: number; entityId: string }> = [];
  for (const { entityId, intervals } of seriesIntervals) {
    for (const { start, end } of intervals) {
      events.push({ time: start, delta: 1, entityId });
      events.push({ time: end, delta: -1, entityId });
    }
  }
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  const activeCounts = new Map<string, number>();
  const spans: Array<{ start: number; end: number }> = [];
  let spanStart: Nullable<number> = null;

  for (const event of events) {
    const prev = activeCounts.get(event.entityId) || 0;
    const next = prev + event.delta;
    if (next <= 0) {
      activeCounts.delete(event.entityId);
    } else {
      activeCounts.set(event.entityId, next);
    }
    const activeCount = activeCounts.size;
    if (spanStart === null && activeCount >= 2) {
      spanStart = event.time;
    } else if (spanStart !== null && activeCount < 2) {
      spans.push({ start: spanStart, end: event.time });
      spanStart = null;
    }
  }
  if (spanStart !== null && events.length > 0) {
    spans.push({ start: spanStart, end: events[events.length - 1].time });
  }

  return spans;
}

// ── Filter annotated anomaly clusters ───────────────────────────────────────

export function filterAnnotatedAnomalyClusters(
  seriesItem: {
    entityId: string;
    anomalyClusters?: AnomalyCluster[];
  },
  events: Array<{
    timestamp: string;
    entity_ids?: unknown;
    [k: string]: unknown;
  }>
): AnomalyCluster[] {
  if (
    !Array.isArray(seriesItem?.anomalyClusters) ||
    seriesItem.anomalyClusters.length === 0
  ) {
    return [];
  }
  const visibleEvents = Array.isArray(events) ? events : [];
  if (visibleEvents.length === 0) {
    return seriesItem.anomalyClusters;
  }

  const getClusterRange = (cluster: AnomalyCluster) => {
    if (!Array.isArray(cluster.points) || cluster.points.length === 0)
      return null;
    const startTime = cluster.points[0]?.timeMs;
    const endTime = cluster.points[cluster.points.length - 1]?.timeMs;
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return null;
    return {
      startTime: Math.min(startTime, endTime),
      endTime: Math.max(startTime, endTime),
    };
  };

  return seriesItem.anomalyClusters.filter((cluster): boolean => {
    const clusterRange = getClusterRange(cluster);
    if (!clusterRange) return true;
    return !visibleEvents.some((event) => {
      const eventEntityIds = Array.isArray(event.entity_ids)
        ? (event.entity_ids as string[]).filter(Boolean)
        : [];
      if (!eventEntityIds.includes(seriesItem.entityId)) return false;
      const eventTime = new Date(event.timestamp).getTime();
      if (!Number.isFinite(eventTime)) return false;
      return (
        eventTime >= clusterRange.startTime && eventTime <= clusterRange.endTime
      );
    });
  });
}
