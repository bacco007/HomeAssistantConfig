/**
 * Pure data preparation utilities extracted from history-chart.ts.
 *
 * All functions are stateless data transformations with no DOM dependency.
 */

import {
  getHistoryStatesForEntity,
  mergeNumericHistoryWithStatistics,
  normalizeBinaryHistory,
  normalizeNumericHistory,
  normalizeStatisticsHistory,
} from "@/cards/history/history-data";

// ── Build binary state spans ────────────────────────────────────────────────

export function buildBinaryStateSpans(
  stateList: Array<{ lu: number; s: string }>,
  t0: number,
  t1: number
): Array<{ start: number; end: number; state: string }> {
  const spans: Array<{ start: number; end: number; state: string }> = [];
  if (!stateList.length) return spans;
  let current = stateList[0];
  for (let i = 1; i < stateList.length; i++) {
    const next = stateList[i];
    const start = Math.max(current.lu * 1000, t0);
    const end = Math.min(next.lu * 1000, t1);
    if (end > start) {
      spans.push({ start, end, state: current.s });
    }
    current = next;
  }
  // Last span extends to t1
  const lastStart = Math.max(current.lu * 1000, t0);
  if (t1 > lastStart) {
    spans.push({ start: lastStart, end: t1, state: current.s });
  }
  return spans;
}

// ── Build entity state list ─────────────────────────────────────────────────

export function buildEntityStateList(
  entityId: string,
  histResult: unknown,
  statsResult: unknown,
  entityIds: string[]
): Array<{ lu: number; s: string }> {
  const historyStates = getHistoryStatesForEntity(
    histResult,
    entityId,
    entityIds
  );
  const isBinary = entityId.split(".")[0] === "binary_sensor";
  const rawHistory = isBinary
    ? normalizeBinaryHistory(entityId, historyStates)
    : normalizeNumericHistory(entityId, historyStates);
  const statsHistory = normalizeStatisticsHistory(entityId, statsResult);
  return mergeNumericHistoryWithStatistics(rawHistory, statsHistory);
}

// ── Filter events ───────────────────────────────────��───────────────────────

export function filterEvents(
  events: Array<{
    id?: string;
    message?: string;
    annotation?: string;
    entity_ids?: string[];
  }>,
  hiddenEventIds: Set<string>,
  messageFilter: string
): Array<{
  id?: string;
  message?: string;
  annotation?: string;
  entity_ids?: string[];
}> {
  const query = String(messageFilter || "")
    .trim()
    .toLowerCase();
  const visibleEvents = events.filter(
    (event) => !hiddenEventIds.has(event?.id ?? "")
  );
  if (!query) {
    return visibleEvents;
  }
  return visibleEvents.filter((event) => {
    const haystack = [
      event?.message || "",
      event?.annotation || "",
      ...(event?.entity_ids || []).filter(Boolean),
    ]
      .join("\n")
      .toLowerCase();
    return haystack.includes(query);
  });
}
