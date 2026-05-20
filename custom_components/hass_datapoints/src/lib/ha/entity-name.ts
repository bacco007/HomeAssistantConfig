/**
 * Shared helpers to resolve registry IDs to friendly names.
 * All fall back to the raw ID if not found.
 */

import type { HassLike, HassState } from "@/lib/types";

interface RegistryEntryWithIcon {
  icon?: string;
  device_id?: Nullable<string>;
  deviceId?: Nullable<string>;
  area_id?: Nullable<string>;
  areaId?: Nullable<string>;
  labels?: string[];
  label_ids?: string[];
}

interface HassWithLabels {
  locale?: HassLike["locale"];
  connection?: HassLike["connection"];
  labels?: Record<string, { name?: string }>;
  states?: Record<string, HassState>;
  entities?: Record<string, RegistryEntryWithIcon>;
  devices?: Record<string, { name?: string; area_id?: Nullable<string> }>;
  areas?: Record<string, { name?: string }>;
}

export function entityName(
  hass: Nullable<HassWithLabels> | undefined,
  entityId: Nullable<string> | undefined
): string {
  if (!hass || !entityId) {
    return entityId || "";
  }

  const state = hass.states?.[entityId];
  return (
    (state && state.attributes && state.attributes.friendly_name) || entityId
  );
}

export function entityIcon(
  hass: Nullable<HassWithLabels> | undefined,
  entityId: Nullable<string> | undefined
): string {
  if (!hass || !entityId) {
    return "mdi:link-variant";
  }

  const state = hass.states?.[entityId];
  if (state?.attributes?.icon) {
    return state.attributes.icon;
  }

  const domain = String(entityId).split(".")[0];
  const entry = hass.entities?.[entityId];
  if (entry?.icon) {
    return entry.icon;
  }

  switch (domain) {
    case "light":
      return "mdi:lightbulb";
    case "switch":
      return "mdi:toggle-switch";
    case "binary_sensor":
      return "mdi:radiobox-marked";
    case "sensor":
      return "mdi:chart-line";
    case "climate":
      return "mdi:thermostat";
    case "cover":
      return "mdi:window-shutter";
    case "lock":
      return "mdi:lock";
    case "media_player":
      return "mdi:play-box";
    case "person":
      return "mdi:account";
    case "device_tracker":
      return "mdi:crosshairs-gps";
    default:
      return "mdi:link-variant";
  }
}

function entityRegistryEntries(
  hass: Nullable<HassWithLabels> | undefined
): [string, RegistryEntryWithIcon][] {
  return Object.entries(hass?.entities || {}) as [
    string,
    RegistryEntryWithIcon,
  ][];
}

function firstRelatedEntityId(
  hass: Nullable<HassWithLabels> | undefined,
  matcher: (entry: RegistryEntryWithIcon) => boolean
): string {
  return (
    entityRegistryEntries(hass).find(
      ([, entry]) => entry && typeof entry === "object" && matcher(entry)
    )?.[0] || ""
  );
}

export function deviceName(
  hass: Nullable<HassWithLabels> | undefined,
  deviceId: Nullable<string> | undefined
): string {
  if (!hass || !deviceId) {
    return deviceId || "";
  }

  return hass.devices?.[deviceId]?.name ?? deviceId;
}

export function deviceIcon(
  hass: Nullable<HassWithLabels> | undefined,
  deviceId: Nullable<string> | undefined
): string {
  if (!hass || !deviceId) {
    return "mdi:devices";
  }

  const entityId = firstRelatedEntityId(
    hass,
    (entry) => (entry.device_id || entry.deviceId) === deviceId
  );
  return entityId ? entityIcon(hass, entityId) : "mdi:devices";
}

export function areaName(
  hass: Nullable<HassWithLabels> | undefined,
  areaId: Nullable<string> | undefined
): string {
  if (!hass || !areaId) {
    return areaId || "";
  }

  return hass.areas?.[areaId]?.name ?? areaId;
}

export function areaIcon(
  hass: Nullable<HassWithLabels> | undefined,
  areaId: Nullable<string> | undefined
): string {
  if (!hass || !areaId) {
    return "mdi:floor-plan";
  }

  const entityId = firstRelatedEntityId(
    hass,
    (entry) => (entry.area_id || entry.areaId) === areaId
  );
  return entityId ? entityIcon(hass, entityId) : "mdi:floor-plan";
}

/**
 * Returns a Map of entityId → display label. When multiple entity IDs share
 * the same friendly name, duplicates are prefixed with the best available
 * qualifier in order: area name → device name → last segment of entity_id.
 */
export function disambiguateEntityNames(
  hass: Nullable<HassWithLabels> | undefined,
  entityIds: string[]
): Map<string, string> {
  const labels = new Map<string, string>();
  if (!entityIds.length) return labels;

  // First pass: collect raw friendly names
  for (const entityId of entityIds) {
    labels.set(entityId, entityName(hass, entityId) || entityId);
  }

  // Find names that appear more than once
  const nameCounts = new Map<string, number>();
  for (const label of labels.values()) {
    nameCounts.set(label, (nameCounts.get(label) ?? 0) + 1);
  }

  // Second pass: qualify duplicates
  for (const entityId of entityIds) {
    const name = labels.get(entityId)!;
    if ((nameCounts.get(name) ?? 0) <= 1) continue;

    const entry = hass?.entities?.[entityId] as
      | RegistryEntryWithIcon
      | undefined;
    const deviceId = entry?.device_id || entry?.deviceId;
    // Area can be set directly on the entity, or inherited from its parent device
    const areaId =
      entry?.area_id ||
      entry?.areaId ||
      (deviceId ? hass?.devices?.[deviceId]?.area_id : null);

    let qualifier;
    if (areaId) {
      qualifier = areaName(hass, areaId);
    } else if (deviceId) {
      qualifier = deviceName(hass, deviceId);
    } else {
      // Fall back to the unique part of the entity_id (segment after the dot)
      qualifier = entityId.split(".")[1] ?? entityId;
    }

    if (qualifier && qualifier !== name) {
      labels.set(entityId, `${qualifier} · ${name}`);
    }
  }

  return labels;
}

export function labelName(
  hass: Nullable<HassWithLabels> | undefined,
  labelId: Nullable<string> | undefined
): string {
  if (!hass || !labelId) {
    return labelId || "";
  }

  return hass.labels?.[labelId]?.name ?? labelId;
}

export function labelIcon(
  hass: Nullable<HassWithLabels> | undefined,
  labelId: Nullable<string> | undefined
): string {
  if (!hass || !labelId) {
    return "mdi:label-outline";
  }

  const entityId = firstRelatedEntityId(hass, (entry) => {
    const labels = [
      ...(Array.isArray(entry.labels) ? entry.labels : []),
      ...(Array.isArray(entry.label_ids) ? entry.label_ids : []),
    ];
    return labels.includes(labelId);
  });
  return entityId ? entityIcon(hass, entityId) : "mdi:label-outline";
}
