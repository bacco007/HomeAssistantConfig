/**
 * Pure target selection helpers shared by cards and the history page.
 */

import type { HassEntity, HassLike } from "@/lib/types";

export interface NormalizedTargetSelection {
  entity_id: string[];
  device_id: string[];
  area_id: string[];
  label_id: string[];
}

export interface TargetValueShape {
  entity_id?: unknown;
  entity_ids?: unknown;
  entity?: unknown;
  entities?: unknown;
  device_id?: unknown;
  area_id?: unknown;
  label_id?: unknown;
}

export interface PanelTargetConfig {
  target?: unknown;
  entities?: string[];
  entity?: string | string[];
}

type TargetSelectionValue =
  | string
  | string[]
  | Nullable<TargetValueShape>
  | undefined;

interface ResolvableEntityEntry extends Partial<HassEntity> {
  deviceId?: Nullable<string>;
  areaId?: Nullable<string>;
  label_ids?: string[];
}

export function normalizeEntityIds(value: unknown): string[] {
  if (!value) {
    return [];
  }

  return (Array.isArray(value) ? value : [value])
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export function normalizeTargetValue(
  targetValue: TargetSelectionValue
): Partial<NormalizedTargetSelection> {
  if (!targetValue) {
    return {};
  }

  if (Array.isArray(targetValue)) {
    return { entity_id: normalizeEntityIds(targetValue) };
  }

  if (typeof targetValue === "string") {
    return targetValue ? { entity_id: [targetValue] } : {};
  }

  const normalized: NormalizedTargetSelection = {
    entity_id: [
      ...normalizeEntityIds(targetValue.entity_id),
      ...normalizeEntityIds(targetValue.entity_ids),
      ...normalizeEntityIds(targetValue.entity),
      ...normalizeEntityIds(targetValue.entities),
    ],
    device_id: normalizeEntityIds(targetValue.device_id),
    area_id: normalizeEntityIds(targetValue.area_id),
    label_id: normalizeEntityIds(targetValue.label_id),
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([, entries]) => entries.length)
  ) as Partial<NormalizedTargetSelection>;
}

export function normalizeTargetSelection(
  targetValue: TargetSelectionValue
): NormalizedTargetSelection {
  const normalized = normalizeTargetValue(targetValue);
  return {
    entity_id: [...new Set(normalized.entity_id || [])],
    device_id: [...new Set(normalized.device_id || [])],
    area_id: [...new Set(normalized.area_id || [])],
    label_id: [...new Set(normalized.label_id || [])],
  };
}

export function mergeTargetSelections(
  ...targets: TargetSelectionValue[]
): NormalizedTargetSelection {
  const merged: NormalizedTargetSelection = {
    entity_id: [],
    device_id: [],
    area_id: [],
    label_id: [],
  };

  for (const target of targets) {
    const normalized = normalizeTargetSelection(target);
    for (const key of Object.keys(
      merged
    ) as (keyof NormalizedTargetSelection)[]) {
      merged[key].push(...normalized[key]);
    }
  }

  for (const key of Object.keys(
    merged
  ) as (keyof NormalizedTargetSelection)[]) {
    merged[key] = [...new Set(merged[key])];
  }

  return merged;
}

export function resolveEntityIdsFromTarget(
  hass: Nullable<Pick<HassLike, "entities">> | undefined,
  targetValue: TargetSelectionValue
): string[] {
  const target = normalizeTargetSelection(targetValue);
  const resolved = new Set(normalizeEntityIds(target.entity_id));
  const entityRegistry = hass?.entities || {};
  const selectedDevices = new Set(normalizeEntityIds(target.device_id));
  const selectedAreas = new Set(normalizeEntityIds(target.area_id));
  const selectedLabels = new Set(normalizeEntityIds(target.label_id));

  Object.entries(entityRegistry).forEach(([entityId, entry]) => {
    const entityEntry = entry as Nullable<ResolvableEntityEntry> | undefined;
    if (!entityEntry || typeof entityEntry !== "object") {
      return;
    }

    const deviceId = entityEntry.device_id || entityEntry.deviceId || null;
    const areaId = entityEntry.area_id || entityEntry.areaId || null;
    const labels = [
      ...(Array.isArray(entityEntry.labels) ? entityEntry.labels : []),
      ...(Array.isArray(entityEntry.label_ids) ? entityEntry.label_ids : []),
    ];

    if (
      (deviceId && selectedDevices.has(deviceId)) ||
      (areaId && selectedAreas.has(areaId)) ||
      labels.some((labelId) => selectedLabels.has(labelId))
    ) {
      resolved.add(entityId);
    }
  });

  return [...resolved];
}

export function panelConfigTarget(
  panelCfg: Nullable<PanelTargetConfig> | undefined
): Partial<NormalizedTargetSelection> {
  if (!panelCfg) {
    return {};
  }

  if (panelCfg.target) {
    return normalizeTargetValue(panelCfg.target);
  }

  return normalizeTargetValue({
    entity_id: panelCfg.entities?.length ? panelCfg.entities : panelCfg.entity,
  });
}
