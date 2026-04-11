interface HiddenSeriesCandidate {
  visible?: boolean;
  entity_id?: string;
  entity?: string;
  entityId?: string;
}

export function createHiddenSeriesSet(
  seriesSettings: HiddenSeriesCandidate[] = []
): Set<string> {
  return new Set(
    (Array.isArray(seriesSettings) ? seriesSettings : [])
      .filter((entry) => entry?.visible === false)
      .map((entry) => entry.entity_id || entry.entity || entry.entityId)
      .filter((value): value is string => Boolean(value))
  );
}

export function createHiddenEventIdSet(
  hiddenEventIds: string[] = []
): Set<string> {
  return new Set(
    (Array.isArray(hiddenEventIds) ? hiddenEventIds : []).filter(Boolean)
  );
}
