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
  devices?: Record<string, { name?: string }>;
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
