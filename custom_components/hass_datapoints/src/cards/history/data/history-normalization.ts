import type { HaStateEntry, NormalisedState } from "./types";

/**
 * Normalises a raw binary sensor state list from the HA history API into a
 * sorted array of `{ lu, s }` records.
 */
export function normalizeBinaryHistory(
  _entityId: string,
  histStates: unknown
): NormalisedState[] {
  return (Array.isArray(histStates) ? (histStates as HaStateEntry[]) : [])
    .map((state) => {
      const rawTimestamp = state?.lu;
      const timeSec =
        typeof rawTimestamp === "number"
          ? rawTimestamp
          : new Date(state?.last_changed || state?.lu || 0).getTime() / 1000;
      if (!Number.isFinite(timeSec)) {
        return null;
      }
      return {
        lu: Math.round(timeSec * 1000) / 1000,
        s: String(state?.s ?? state?.state ?? ""),
      };
    })
    .filter((entry): entry is NormalisedState => entry !== null)
    .sort((a, b) => a.lu - b.lu);
}

/**
 * Normalises a raw numeric sensor state list from the HA history API into an
 * array of `{ lu, s }` records (non-finite values filtered out).
 */
export function normalizeNumericHistory(
  _entityId: string,
  histStates: unknown
): NormalisedState[] {
  return (Array.isArray(histStates) ? (histStates as HaStateEntry[]) : [])
    .map((state) => {
      const value = parseFloat(state?.s ?? "");
      if (Number.isNaN(value)) {
        return null;
      }
      const rawTimestamp =
        state?.lu ?? state?.lc ?? state?.last_changed ?? state?.last_updated;
      const timeSec =
        typeof rawTimestamp === "number"
          ? rawTimestamp
          : new Date((rawTimestamp as string | undefined) || 0).getTime() /
            1000;
      if (!Number.isFinite(timeSec)) {
        return null;
      }
      return {
        lu: Math.round(timeSec * 1000) / 1000,
        s: String(value),
      };
    })
    .filter((entry): entry is NormalisedState => entry !== null);
}

/**
 * Extracts the state array for a given entity from the various response shapes
 * returned by different versions of the HA history WebSocket API.
 */
export function getHistoryStatesForEntity(
  histResult: unknown,
  entityId: string,
  entityIds: string[] = []
): HaStateEntry[] {
  if (!histResult) {
    return [];
  }
  const result = histResult as RecordWithUnknownValues;
  if (Array.isArray(result[entityId])) {
    return result[entityId] as HaStateEntry[];
  }
  if (Array.isArray(histResult)) {
    const entries = histResult as unknown[];
    const entityIndex = entityIds.indexOf(entityId);
    if (entityIndex >= 0 && Array.isArray(entries[entityIndex])) {
      return entries[entityIndex] as HaStateEntry[];
    }
    if (
      entries.every(
        (entry) => entry && typeof entry === "object" && !Array.isArray(entry)
      )
    ) {
      return (entries as HaStateEntry[]).filter(
        (entry) => entry.entity_id === entityId
      );
    }
  }
  if (histResult && typeof histResult === "object") {
    const wrapped = histResult as { result?: unknown };
    if (
      Array.isArray((wrapped.result as RecordWithUnknownValues)?.[entityId])
    ) {
      return (wrapped.result as Record<string, unknown[]>)[
        entityId
      ] as HaStateEntry[];
    }
    if (Array.isArray(wrapped.result)) {
      if (
        (wrapped.result as unknown[]).every(
          (entry) => entry && typeof entry === "object" && !Array.isArray(entry)
        )
      ) {
        return (wrapped.result as HaStateEntry[]).filter(
          (entry) => entry.entity_id === entityId
        );
      }
      const entityIndex = entityIds.indexOf(entityId);
      if (
        entityIndex >= 0 &&
        Array.isArray((wrapped.result as unknown[])[entityIndex])
      ) {
        return (wrapped.result as unknown[][])[entityIndex] as HaStateEntry[];
      }
    }
  }
  return [];
}
