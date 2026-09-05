/*
 * Australian Fire Watch for Home Assistant
 *
 * Dependency-free frontend bundle. It registers:
 *   - <australian-fire-watch-panel> for the integration-owned sidebar panel
 *   - <australian-fire-watch-card> for Lovelace dashboards
 *   - custom:australian-fire-watch as a Home Assistant 2026.5+ Community dashboard
 *
 * Safety rule: absent, unknown, or stale data is never described as safe.
 */

const DOMAIN = "australian_fire_watch";
const DEFAULT_RFS_URL =
  "https://www.rfs.nsw.gov.au/fire-information/fires-near-me";
const DEFAULT_RATINGS_URL =
  "https://www.rfs.nsw.gov.au/plan-and-prepare/fire-danger-ratings";
const DEFAULT_BOM_URL = "https://www.bom.gov.au/nsw/warnings/";
const BOM_ATTRIBUTION_URL =
  "http://www.bom.gov.au/data-access/3rd-party-attribution.shtml";
// Official, unmodified Bureau website-footer colour attribution image (558 x 22).
// The data URI keeps attribution available through local HA and Nabu Casa alike.
const BOM_ATTRIBUTION_IMAGE =
  "data:image/png;base64,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";
const DEFAULT_GEO_SOURCE = "nsw_rural_fire_service_feed";
const MAP_DEFAULT_ZOOM = 11;
const FIRE_WATCH_CARD_TAG = "australian-fire-watch-card";
const FIRE_WATCH_CARD_TYPE = `custom:${FIRE_WATCH_CARD_TAG}`;
const FIRE_WATCH_RECOVERY_DELAYS = Object.freeze([
  0,
  50,
  250,
  750,
  2100,
  2600,
  4000,
]);
const FIRE_WATCH_RECOVERY_FLAG = Symbol.for(
  "australian-fire-watch-card.recovery-scheduled",
);
const fireWatchRecoveryAttempts = new WeakSet();

const WARNING_WEIGHT = Object.freeze({
  emergency_warning: 4,
  watch_and_act: 3,
  advice: 2,
  not_applicable: 0,
  none: 0,
  unknown: -1,
});

const CONTROL_WEIGHT = Object.freeze({
  out_of_control: 3,
  not_yet_controlled: 3,
  being_controlled: 2,
  under_control: 1,
  unknown: 0,
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const slug = (value) =>
  String(value ?? "unknown")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";

const titleCase = (value) =>
  String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isPresent = (value) =>
  value !== undefined && value !== null && value !== "";

const isUnavailable = (value) =>
  ["unknown", "unavailable", "none", "null", ""].includes(
    String(value ?? "").trim().toLowerCase(),
  );

const firstPresent = (...values) => values.find(isPresent);

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!isPresent(value)) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }
  return [];
};

const asBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["true", "yes", "on", "1", "active"].includes(normalized)) return true;
  if (["false", "no", "off", "0", "inactive"].includes(normalized)) return false;
  return null;
};

const asNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};

const validCoordinates = (latitude, longitude) =>
  latitude !== null &&
  longitude !== null &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

const safeUrl = (value, fallback = null) => {
  if (!isPresent(value)) return fallback;
  try {
    const url = new URL(String(value), window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
  } catch (_error) {
    return fallback;
  }
};

const parseDate = (value) => {
  if (!isPresent(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatAbsolute = (value) => {
  const date = parseDate(value);
  if (!date) return "Time not supplied";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatRelative = (value) => {
  const date = parseDate(value);
  if (!date) return "update time unavailable";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absolute = Math.abs(seconds);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (absolute < 60) return formatter.format(seconds, "second");
  if (absolute < 3600) return formatter.format(Math.round(seconds / 60), "minute");
  if (absolute < 86400) return formatter.format(Math.round(seconds / 3600), "hour");
  return formatter.format(Math.round(seconds / 86400), "day");
};

const formatDistance = (value) => {
  const distance = asNumber(value);
  if (distance === null) return "Distance not supplied";
  const digits = distance < 10 ? 1 : 0;
  return `${distance.toFixed(digits)} km away`;
};

const warningKey = (value) => {
  const key = slug(value);
  if (key.includes("emergency")) return "emergency_warning";
  if (key.includes("watch") && key.includes("act")) return "watch_and_act";
  if (key === "advice" || key.includes("advice")) return "advice";
  if (["not_applicable", "n_a", "na"].includes(key)) return "not_applicable";
  if (["none", "no_current_warning", "no_warning"].includes(key)) return "none";
  return "unknown";
};

const warningLabel = (value) => {
  const key = warningKey(value);
  return {
    emergency_warning: "Emergency Warning",
    watch_and_act: "Watch and Act",
    advice: "Advice",
    not_applicable: "No official warning level",
    none: "No current warning",
    unknown: "Warning level not supplied",
  }[key];
};

const ratingKey = (value) => {
  const key = slug(value);
  if (key.includes("catastrophic")) return "catastrophic";
  if (key.includes("extreme")) return "extreme";
  if (key === "high" || key.includes("high_fire")) return "high";
  if (key.includes("moderate")) return "moderate";
  if (key.includes("no_rating") || key === "none") return "no_rating";
  return "unknown";
};

const ratingLabel = (value) => {
  const key = ratingKey(value);
  return {
    catastrophic: "Catastrophic",
    extreme: "Extreme",
    high: "High",
    moderate: "Moderate",
    no_rating: "No Rating",
    unknown: "Not available",
  }[key];
};

const controlKey = (value) => {
  const key = slug(value);
  if (key.includes("not_yet") || key.includes("out_of_control")) {
    return key.includes("not_yet") ? "not_yet_controlled" : "out_of_control";
  }
  if (key.includes("being_controlled")) return "being_controlled";
  if (key.includes("under_control")) return "under_control";
  return "unknown";
};

const controlLabel = (value) => {
  if (!isPresent(value) || isUnavailable(value)) return "Control status not supplied";
  return titleCase(value);
};

const actionFor = (warning, rating) => {
  const warningActions = {
    emergency_warning: "Take action immediately",
    watch_and_act: "Start taking action now",
    advice: "Stay up to date",
  };
  const ratingActions = {
    catastrophic: "Leave bush fire risk areas",
    extreme: "Take action now",
    high: "Be ready to act",
    moderate: "Plan and prepare",
    no_rating: "Review conditions before acting",
    unknown: "Check official sources before acting",
  };
  return warningActions[warningKey(warning)] || ratingActions[ratingKey(rating)];
};

const severityClass = (warning, rating = null) => {
  const warningLevel = warningKey(warning);
  if (warningLevel === "emergency_warning") return "severity-emergency";
  if (warningLevel === "watch_and_act") return "severity-watch";
  if (warningLevel === "advice") return "severity-advice";
  const ratingLevel = ratingKey(rating);
  if (ratingLevel === "catastrophic") return "severity-emergency";
  if (ratingLevel === "extreme") return "severity-watch";
  if (ratingLevel === "high") return "severity-advice";
  if (ratingLevel === "moderate") return "severity-moderate";
  return "severity-unknown";
};

const isPlannedIncident = (incident) => {
  if (asBoolean(incident?.is_planned) === true) return true;
  const type = slug(firstPresent(incident?.type, incident?.incident_type));
  return ["burn_off", "hazard_reduction", "planned_burn", "prescribed_burn"].some(
    (term) => type.includes(term),
  );
};

const normalizeIncident = (raw, index = 0) => {
  const incident = raw && typeof raw === "object" ? raw : {};
  const id = String(
    firstPresent(
      incident.id,
      incident.incident_id,
      incident.external_id,
      incident.entity_id,
      `incident-${index + 1}`,
    ),
  );
  return {
    id,
    entityId: firstPresent(incident.entity_id, incident.source_entity_id),
    title: firstPresent(
      incident.title,
      incident.name,
      incident.location,
      "Location not supplied",
    ),
    type: firstPresent(incident.type, incident.incident_type, "Incident type not supplied"),
    warning: firstPresent(
      incident.warning_level,
      incident.official_warning_level,
      incident.category,
      "unknown",
    ),
    control: firstPresent(incident.control_status, incident.status, "unknown"),
    distanceKm: firstPresent(incident.distance_km, incident.distance),
    direction: firstPresent(incident.direction, incident.bearing),
    council: firstPresent(incident.council, incident.council_area),
    updatedAt: firstPresent(
      incident.updated_at,
      incident.last_updated,
      incident.publication_date,
      incident.published_at,
    ),
    publishedAt: firstPresent(incident.published_at, incident.publication_date),
    sizeHa: firstPresent(incident.size_ha, incident.size),
    latitude: asNumber(incident.latitude),
    longitude: asNumber(incident.longitude),
    officialUrl: safeUrl(
      firstPresent(incident.official_url, incident.url, incident.link),
      DEFAULT_RFS_URL,
    ),
    isPlanned: isPlannedIncident(incident),
    acknowledged: asBoolean(incident.acknowledged) === true,
    snoozedUntil: firstPresent(incident.snoozed_until, incident.snooze_until),
    raw: incident,
  };
};

const sortIncidents = (incidents) =>
  [...incidents].sort((left, right) => {
    const leftDistance = asNumber(left.distanceKm) ?? Number.POSITIVE_INFINITY;
    const rightDistance = asNumber(right.distanceKm) ?? Number.POSITIVE_INFINITY;
    if (leftDistance !== rightDistance) return leftDistance - rightDistance;

    const warningDifference =
      (WARNING_WEIGHT[warningKey(right.warning)] ?? -1) -
      (WARNING_WEIGHT[warningKey(left.warning)] ?? -1);
    if (warningDifference !== 0) return warningDifference;

    const controlDifference =
      (CONTROL_WEIGHT[controlKey(right.control)] ?? 0) -
      (CONTROL_WEIGHT[controlKey(left.control)] ?? 0);
    if (controlDifference !== 0) return controlDifference;

    const leftUpdated = parseDate(left.updatedAt)?.getTime() ?? 0;
    const rightUpdated = parseDate(right.updatedAt)?.getTime() ?? 0;
    return rightUpdated - leftUpdated;
  });

const sortIncidentsByPriority = (incidents) =>
  [...incidents].sort((left, right) => {
    const warningDifference =
      (WARNING_WEIGHT[warningKey(right.warning)] ?? -1) -
      (WARNING_WEIGHT[warningKey(left.warning)] ?? -1);
    if (warningDifference !== 0) return warningDifference;
    const controlDifference =
      (CONTROL_WEIGHT[controlKey(right.control)] ?? 0) -
      (CONTROL_WEIGHT[controlKey(left.control)] ?? 0);
    if (controlDifference !== 0) return controlDifference;
    const leftDistance = asNumber(left.distanceKm) ?? Number.POSITIVE_INFINITY;
    const rightDistance = asNumber(right.distanceKm) ?? Number.POSITIVE_INFINITY;
    return leftDistance - rightDistance;
  });

const normalizeDangerDay = (raw = {}, fallback = {}) => {
  const source = raw && typeof raw === "object" ? raw : {};
  const units = source.units && typeof source.units === "object" ? source.units : {};
  return {
    rating: firstPresent(
      source.rating,
      source.danger_rating,
      source.fire_danger_rating,
      fallback.rating,
      "unknown",
    ),
    fbi: firstPresent(
      source.fbi,
      source.fire_behaviour_index,
      source.fire_behavior_index,
      fallback.fbi,
    ),
    totalFireBan: asBoolean(
      firstPresent(
        source.total_fire_ban,
        source.fire_ban,
        source.toban,
        fallback.totalFireBan,
      ),
    ),
    issuedAt: firstPresent(source.issued_at, source.updated_at, fallback.issuedAt),
    temperatureC: firstPresent(source.temperature_c, source.temperature),
    humidityPercent: firstPresent(source.humidity_percent, source.humidity),
    windSpeedKmh: firstPresent(source.wind_speed_kmh, source.wind_speed),
    windGustKmh: firstPresent(
      source.wind_gust_kmh,
      source.wind_gust_speed,
      source.wind_gust,
    ),
    rainMm: firstPresent(source.rain_mm, source.precipitation_mm),
    condition: firstPresent(source.condition, source.weather_condition),
    weatherAvailable: asBoolean(source.available),
    weatherNote: firstPresent(source.note, source.context_note),
    temperatureUnit: firstPresent(
      units.temperature,
      source.temperature_unit,
      fallback.temperatureUnit,
    ),
    humidityUnit: firstPresent(
      units.humidity,
      source.humidity_unit,
      fallback.humidityUnit,
      "%",
    ),
    windSpeedUnit: firstPresent(
      units.wind_speed,
      source.wind_speed_unit,
      fallback.windSpeedUnit,
    ),
    rainUnit: firstPresent(
      units.rain,
      units.precipitation,
      source.rain_unit,
      fallback.rainUnit,
    ),
    sourceUrl: safeUrl(firstPresent(source.source_url, fallback.sourceUrl)),
  };
};

const discoverSummaryEntity = (hass, configuredEntity) => {
  if (!hass?.states) return null;
  if (configuredEntity && hass.states[configuredEntity]) return hass.states[configuredEntity];

  const candidates = Object.entries(hass.states)
    .filter(([entityId, state]) => {
      if (!entityId.startsWith("sensor.")) return false;
      const attributes = state.attributes || {};
      return (
        attributes.integration === DOMAIN ||
        attributes.fire_watch === true ||
        (isPresent(attributes.entry_id) &&
          (Array.isArray(attributes.incidents) ||
            Array.isArray(attributes.active_incidents))) ||
        entityId.includes("australian_fire_watch")
      );
    })
    .sort(([leftId, left], [rightId, right]) => {
      const leftScore =
        (left.attributes?.integration === DOMAIN ? 4 : 0) +
        (Array.isArray(left.attributes?.incidents) ? 2 : 0) +
        (leftId.includes("status") ? 1 : 0);
      const rightScore =
        (right.attributes?.integration === DOMAIN ? 4 : 0) +
        (Array.isArray(right.attributes?.incidents) ? 2 : 0) +
        (rightId.includes("status") ? 1 : 0);
      return rightScore - leftScore;
    });

  return candidates[0]?.[1] || null;
};

const entityIdForState = (hass, stateObject) => {
  if (!stateObject || !hass?.states) return null;
  return (
    Object.entries(hass.states).find(([, state]) => state === stateObject)?.[0] ||
    stateObject.entity_id ||
    null
  );
};

const normalizeReadiness = (hass, attributes, config) => {
  const structured = asArray(
    firstPresent(attributes.readiness_items, attributes.readiness),
  ).map((item, index) => {
    const source = item && typeof item === "object" ? item : { label: item };
    const entityId = source.entity_id;
    const stateObject = entityId ? hass?.states?.[entityId] : null;
    const state = firstPresent(source.state, stateObject?.state);
    return {
      id: String(firstPresent(source.id, entityId, `readiness-${index + 1}`)),
      label: firstPresent(
        source.label,
        source.name,
        stateObject?.attributes?.friendly_name,
        "Readiness item",
      ),
      entityId,
      complete:
        asBoolean(firstPresent(source.complete, source.completed)) ??
        (state === "on" ? true : state === "off" ? false : null),
      state,
    };
  });

  const knownIds = new Set(structured.map((item) => item.entityId).filter(Boolean));
  const configuredIds = [
    ...asArray(config?.readiness_entities),
    ...asArray(attributes.readiness_entities),
  ];
  for (const entityId of configuredIds) {
    if (!entityId || knownIds.has(entityId)) continue;
    const stateObject = hass?.states?.[entityId];
    const state = stateObject?.state;
    structured.push({
      id: entityId,
      label: stateObject?.attributes?.friendly_name || titleCase(entityId.split(".")[1]),
      entityId,
      complete: state === "on" ? true : state === "off" ? false : null,
      state,
    });
  }
  return structured;
};

const normalizeModel = (hass, config = {}) => {
  const summary = discoverSummaryEntity(
    hass,
    firstPresent(config.entity, config.status_entity),
  );
  if (!summary) {
    return {
      connected: Boolean(hass),
      configured: false,
      config,
      incidents: [],
      plannedBurns: [],
      readiness: [],
    };
  }

  const attributes = summary.attributes || {};
  const monitoredLocation =
    attributes.monitored_location &&
    typeof attributes.monitored_location === "object"
      ? attributes.monitored_location
      : {};
  const danger =
    attributes.danger && typeof attributes.danger === "object"
      ? attributes.danger
      : {};
  const weatherContext =
    attributes.weather_context && typeof attributes.weather_context === "object"
      ? attributes.weather_context
      : attributes.weather && typeof attributes.weather === "object"
        ? attributes.weather
        : {};
  const todayWeather =
    (weatherContext.today && typeof weatherContext.today === "object"
      ? weatherContext.today
      : weatherContext.current && typeof weatherContext.current === "object"
        ? weatherContext.current
        : weatherContext) || {};
  const tomorrowWeather =
    weatherContext.tomorrow && typeof weatherContext.tomorrow === "object"
      ? weatherContext.tomorrow
      : {};
  const todaySource = {
    ...todayWeather,
    ...(attributes.today && typeof attributes.today === "object" ? attributes.today : {}),
    ...(danger.today && typeof danger.today === "object" ? danger.today : {}),
  };
  const tomorrowSource = {
    ...tomorrowWeather,
    ...(attributes.tomorrow && typeof attributes.tomorrow === "object"
      ? attributes.tomorrow
      : {}),
    ...(danger.tomorrow && typeof danger.tomorrow === "object" ? danger.tomorrow : {}),
  };
  const today = normalizeDangerDay(todaySource, {
    rating: firstPresent(attributes.danger_rating_today, attributes.rating_today),
    fbi: firstPresent(attributes.fire_behaviour_index_today, attributes.fbi_today),
    totalFireBan: firstPresent(
      attributes.total_fire_ban_today,
      attributes.fire_ban_today,
    ),
    issuedAt: attributes.danger_issued_at,
    temperatureUnit: attributes.temperature_unit,
    windSpeedUnit: attributes.wind_speed_unit,
    rainUnit: attributes.precipitation_unit,
  });
  const tomorrow = normalizeDangerDay(tomorrowSource, {
    rating: firstPresent(attributes.danger_rating_tomorrow, attributes.rating_tomorrow),
    fbi: firstPresent(attributes.fire_behaviour_index_tomorrow, attributes.fbi_tomorrow),
    totalFireBan: firstPresent(
      attributes.total_fire_ban_tomorrow,
      attributes.fire_ban_tomorrow,
    ),
    temperatureUnit: attributes.temperature_unit,
    windSpeedUnit: attributes.wind_speed_unit,
    rainUnit: attributes.precipitation_unit,
  });

  const allIncidents = [
    ...asArray(firstPresent(attributes.incidents, attributes.active_incidents)),
    ...asArray(attributes.planned_burns).map((item) => ({
      ...(item && typeof item === "object" ? item : {}),
      is_planned: true,
    })),
  ].map(normalizeIncident);

  const deduplicated = [...new Map(allIncidents.map((item) => [item.id, item])).values()];
  const incidents = sortIncidents(deduplicated.filter((item) => !item.isPlanned));
  const plannedBurns = sortIncidents(deduplicated.filter((item) => item.isPlanned));
  const explicitPriority = attributes.highest_priority_incident
    ? normalizeIncident(attributes.highest_priority_incident)
    : null;
  const priorityIncident = explicitPriority || sortIncidentsByPriority(incidents)[0] || null;

  const feedAttributes =
    attributes.feed && typeof attributes.feed === "object" ? attributes.feed : {};
  const lastSuccessfulUpdate = firstPresent(
    feedAttributes.last_successful_update,
    attributes.last_successful_update,
    attributes.feed_last_successful_update,
    summary.last_updated,
  );
  const calculatedAge = parseDate(lastSuccessfulUpdate)
    ? Math.max(0, Math.round((Date.now() - parseDate(lastSuccessfulUpdate).getTime()) / 1000))
    : null;
  const ageSeconds =
    asNumber(
      firstPresent(
        feedAttributes.age_seconds,
        attributes.data_age_seconds,
        attributes.feed_age_seconds,
      ),
    ) ?? calculatedAge;
  const staleAfterSeconds =
    asNumber(
      firstPresent(
        feedAttributes.stale_after_seconds,
        attributes.stale_after_seconds,
      ),
    ) ?? 2700;
  const statedFeedStatus = slug(
    firstPresent(feedAttributes.status, attributes.feed_status, "unknown"),
  );
  const stateStatus = slug(summary.state);
  const incidentCount = Math.max(
    incidents.length,
    asNumber(attributes.incident_count) ?? incidents.length,
  );
  const plannedBurnCount = Math.max(
    plannedBurns.length,
    asNumber(attributes.planned_burn_count) ?? plannedBurns.length,
  );
  const stale =
    ["stale", "unavailable", "error", "failed", "offline", "unknown"].includes(
      statedFeedStatus,
    ) ||
    ["stale", "unavailable", "unknown"].includes(stateStatus) ||
    (ageSeconds !== null && ageSeconds > staleAfterSeconds);

  let officialWarning = firstPresent(
    attributes.official_warning_level,
    attributes.warning_level,
    priorityIncident?.warning,
    "none",
  );
  if (
    priorityIncident &&
    (WARNING_WEIGHT[warningKey(priorityIncident.warning)] ?? -1) >
      (WARNING_WEIGHT[warningKey(officialWarning)] ?? -1)
  ) {
    officialWarning = priorityIncident.warning;
  }

  return {
    connected: true,
    configured: true,
    config,
    summary,
    entityId: entityIdForState(hass, summary),
    entryId: firstPresent(attributes.entry_id, attributes.config_entry_id),
    locationName: firstPresent(
      attributes.location_name,
      attributes.zone_name,
      attributes.friendly_name,
      config.title,
      "Australian Fire Watch",
    ),
    state: stateStatus,
    integrationName: firstPresent(
      attributes.integration_name,
      "Australian Fire Watch",
    ),
    jurisdiction: firstPresent(attributes.jurisdiction, "NSW"),
    jurisdictionName: firstPresent(attributes.jurisdiction_name, "New South Wales"),
    officialWarning,
    summaryText: firstPresent(attributes.summary, attributes.status_summary),
    recommendedAction: firstPresent(
      attributes.recommended_action,
      attributes.action,
      actionFor(officialWarning, today.rating),
    ),
    today,
    tomorrow,
    incidents,
    incidentCount,
    plannedBurns,
    plannedBurnCount,
    priorityIncident,
    readiness: normalizeReadiness(hass, attributes, config),
    fireWeatherWarnings: asArray(attributes.fire_weather_warnings).map(
      (warning, index) => ({
        id: String(firstPresent(warning?.id, warning?.link, `weather-warning-${index + 1}`)),
        title: firstPresent(warning?.title, "Fire weather warning"),
        publishedAt: firstPresent(warning?.published_at, warning?.updated_at),
        link: safeUrl(warning?.link, DEFAULT_BOM_URL),
      }),
    ),
    alertAssignment: (() => {
      const targets = asArray(
        firstPresent(
          attributes.alert_targets,
          attributes.notification_targets,
          attributes.notify_services,
        ),
      );
      const explicit = asBoolean(
        firstPresent(attributes.alerts_assigned, attributes.notifications_enabled),
      );
      return {
        count: targets.length,
        configured: explicit ?? (targets.length ? true : null),
      };
    })(),
    zoneEntityId: firstPresent(
      config.zone_entity,
      attributes.zone_entity_id,
      attributes.zone_entity,
      "zone.home",
    ),
    monitoredLatitude: asNumber(
      firstPresent(monitoredLocation.latitude, attributes.monitored_latitude),
    ),
    monitoredLongitude: asNumber(
      firstPresent(monitoredLocation.longitude, attributes.monitored_longitude),
    ),
    feed: {
      status: stale ? "stale" : statedFeedStatus,
      stale,
      lastSuccessfulUpdate,
      ageSeconds,
      staleAfterSeconds,
      sourceName: firstPresent(
        feedAttributes.source_name,
        attributes.source_name,
        firstPresent(attributes.official_source_name, "Official emergency service"),
      ),
      officialUrl: safeUrl(
        firstPresent(
          feedAttributes.official_url,
          attributes.official_url,
          attributes.source_url,
        ),
        DEFAULT_RFS_URL,
      ),
      attribution: firstPresent(
        feedAttributes.attribution,
        attributes.attribution,
        attributes.official_source_name,
        "Official emergency service",
      ),
      geoLocationSource: firstPresent(
        config.geo_location_source,
        feedAttributes.geo_location_source,
        attributes.geo_location_source,
        DEFAULT_GEO_SOURCE,
      ),
      message: firstPresent(feedAttributes.message, attributes.feed_message),
    },
  };
};

const icon = (name) => {
  const paths = {
    fire: '<path d="M12.7 2.2c.4 3-1.5 4.2-2.8 5.8-1.2 1.4-2.2 3-1.4 5.1.3.8.9 1.5 1.7 2-.2-1.5.6-3 1.8-3.9-.1 1.8 1.6 2.8 2.2 4.2.8-.6 1.4-1.4 1.7-2.4.7-2.2-.4-4.3-3.2-6.5.2 1.6-.3 2.7-1.1 3.5.1-2.4-1-4.7 1.1-7.8ZM12 22a7 7 0 0 1-7-7c0-3.2 1.8-5.6 4-8 0 2 .4 3.3 1.1 4.1.1-2.6 1.4-4.7 3.9-6.7-.1 2.4 1.4 3.8 2.7 5.4 1.2 1.5 2.3 3.1 2.3 5.2a7 7 0 0 1-7 7Z"/>',
    warning:
      '<path d="M12 2 1 21h22L12 2Zm0 6.2c.6 0 1 .4 1 1v5.1a1 1 0 0 1-2 0V9.2c0-.6.4-1 1-1Zm0 9.7a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4Z"/>',
    clock:
      '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v4.6l3.2 1.9-1 1.7-4.2-2.5V7h2Z"/>',
    shield:
      '<path d="m12 2 8 3.6V11c0 5-3.4 9.7-8 11-4.6-1.3-8-6-8-11V5.6L12 2Zm-1 13.2 5.5-5.5-1.4-1.4-4.1 4.1-2.1-2.1-1.4 1.4 3.5 3.5Z"/>',
    map: '<path d="m15 4.5-6-2-7 2.4V21l7-2.4 6 2 7-2.4V2.1l-7 2.4Zm-1 13.7-4-1.3V4.8l4 1.3v12.1Zm-10-12 4-1.4v12.1l-4 1.4V6.2Zm16 10.5-4 1.4V6l4-1.4v12.1Z"/>',
    home: '<path d="m12 3 9 8h-3v9h-5v-6h-2v6H6v-9H3l9-8Z"/>',
    chevron:
      '<path d="m8.6 9.2 3.4 3.4 3.4-3.4 1.4 1.4-4.8 4.8-4.8-4.8 1.4-1.4Z"/>',
    external:
      '<path d="M14 3h7v7h-2V6.4l-8.8 8.8-1.4-1.4L17.6 5H14V3ZM5 5h6v2H5v12h12v-6h2v8H3V5h2Z"/>',
    check:
      '<path d="m9.2 16.6-4.3-4.3 1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9Z"/>',
    radio:
      '<path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4.2-2.2a6 6 0 0 0 0 8.4l1.4-1.4a4 4 0 0 1 0-5.6L7.8 7.8Zm8.4 0-1.4 1.4a4 4 0 0 1 0 5.6l1.4 1.4a6 6 0 0 0 0-8.4ZM5 5a10 10 0 0 0 0 14l1.4-1.4a8 8 0 0 1 0-11.2L5 5Zm14 0-1.4 1.4a8 8 0 0 1 0 11.2L19 19a10 10 0 0 0 0-14Z"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.fire}</svg>`;
};

const STYLES = `
  :host {
    display: block;
    box-sizing: border-box;
    min-height: 100%;
    color: var(--primary-text-color, #ecf2f8);
    background: var(--primary-background-color, #0b1117);
    font-family: var(--paper-font-body1_-_font-family, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
    font-size: 16px;
    line-height: 1.45;
    --fw-surface: var(--card-background-color, #17212b);
    --fw-surface-strong: color-mix(in srgb, var(--card-background-color, #17212b) 88%, white 12%);
    --fw-border: color-mix(in srgb, var(--primary-text-color, #ecf2f8) 18%, transparent);
    --fw-muted: var(--secondary-text-color, #aab7c4);
    --fw-link: var(--primary-color, #5cc8ff);
    --fw-focus: #67d4ff;
    --fw-red: #b91c1c;
    --fw-red-dark: #7f1d1d;
    --fw-orange: #9a3412;
    --fw-yellow: #facc15;
    --fw-green: #166534;
    --fw-blue: #1d4ed8;
    --fw-neutral: #475569;
  }

  *, *::before, *::after { box-sizing: border-box; }

  a { color: inherit; }

  button, select, input { font: inherit; }

  button, .button-link, select, .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible,
  summary:focus-visible, [role="button"]:focus-visible {
    outline: 3px solid var(--fw-focus);
    outline-offset: 3px;
  }

  .icon { width: 1.25rem; height: 1.25rem; fill: currentColor; flex: 0 0 auto; }

  .app-shell {
    width: min(100%, 1180px);
    margin: 0 auto;
    padding: 0 12px 40px;
  }

  .command-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    min-height: 58px;
    margin: 0 -12px 10px;
    padding: max(7px, env(safe-area-inset-top)) 12px 7px;
    border-bottom: 1px solid var(--fw-border);
    background: color-mix(in srgb, var(--primary-background-color, #0b1117) 92%, transparent);
    box-shadow: 0 6px 18px rgba(0, 0, 0, .16);
    backdrop-filter: blur(16px) saturate(1.15);
  }

  .home-exit {
    display: inline-flex;
    gap: 7px;
    align-items: center;
    justify-content: center;
    min-width: 82px;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--fw-border);
    border-radius: 12px;
    background: var(--fw-surface);
    color: var(--primary-text-color, #fff);
    font-weight: 900;
    text-decoration: none;
  }

  .home-exit:hover { filter: brightness(1.08); }
  .command-nav-context { min-width: 0; }
  .command-nav-context span,
  .command-nav-context strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .command-nav-context span { color: var(--fw-muted); font-size: .7rem; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
  .command-nav-context strong { font-size: .96rem; }
  .nav-feed-status {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    min-height: 44px;
    color: var(--fw-muted);
    font-size: .77rem;
    font-weight: 900;
  }
  .nav-feed-status::before {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, .16);
    content: "";
  }
  .nav-feed-status.delayed::before { background: #facc15; box-shadow: 0 0 0 3px rgba(250, 204, 21, .16); }

  .app-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin: 4px 2px 14px;
  }

  .eyebrow {
    display: block;
    margin: 0 0 3px;
    color: var(--fw-muted);
    font-size: .78rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  h1, h2, h3, p { margin-top: 0; }

  h1 { margin-bottom: 2px; font-size: clamp(1.55rem, 5vw, 2.15rem); line-height: 1.15; }
  h2 { margin-bottom: 12px; font-size: 1.22rem; line-height: 1.25; }
  h3 { margin-bottom: 5px; font-size: 1.05rem; line-height: 1.25; }
  p { margin-bottom: 10px; }

  .subtle { color: var(--fw-muted); }
  .small { font-size: .88rem; }
  .nowrap { white-space: nowrap; }
  .visually-hidden {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    clip-path: inset(50%) !important;
    white-space: nowrap !important;
  }

  .supplementary-chip, .data-chip, .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--fw-border);
    border-radius: 999px;
    font-weight: 800;
    line-height: 1.2;
  }

  .supplementary-chip {
    flex: 0 0 auto;
    padding: 8px 10px;
    background: var(--fw-surface);
    color: var(--fw-muted);
    font-size: .75rem;
    text-transform: uppercase;
  }

  .surface {
    margin-bottom: 12px;
    padding: 16px;
    border: 1px solid var(--fw-border);
    border-radius: 18px;
    background: var(--fw-surface);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .12);
  }

  .command-brief {
    overflow: hidden;
    margin-bottom: 12px;
    border: 1px solid var(--fw-border);
    border-radius: 20px;
    background: var(--fw-surface);
    box-shadow: 0 8px 24px rgba(0, 0, 0, .16);
  }

  .brief-status {
    position: relative;
    overflow: hidden;
    padding: 16px;
    color: white;
    background: linear-gradient(135deg, #334155, #1e293b);
  }
  .brief-status.severity-emergency { background: linear-gradient(135deg, var(--fw-red-dark), var(--fw-red)); }
  .brief-status.severity-watch { background: linear-gradient(135deg, #7c2d12, var(--fw-orange)); }
  .brief-status.severity-advice { background: #715b08; }
  .brief-status.severity-moderate { background: #1e3a4b; }
  .brief-status.severity-unknown { background: linear-gradient(135deg, #334155, #1e293b); }
  .brief-status::after {
    position: absolute;
    right: -54px;
    bottom: -92px;
    width: 190px;
    height: 190px;
    border-radius: 50%;
    background: rgba(255, 255, 255, .07);
    content: "";
    pointer-events: none;
  }
  .brief-heading { position: relative; z-index: 1; display: flex; gap: 11px; align-items: flex-start; }
  .brief-heading .hero-icon { width: 42px; height: 42px; }
  .brief-heading .hero-icon .icon { width: 23px; height: 23px; }
  .brief-heading h2 { margin: 0 0 3px; font-size: clamp(1.45rem, 7vw, 2.2rem); }
  .brief-action { margin: 0; font-size: 1rem; font-weight: 900; }
  .brief-summary { position: relative; z-index: 1; max-width: 760px; margin: 10px 0 0; color: rgba(255, 255, 255, .9); font-size: .91rem; }
  .brief-freshness { position: relative; z-index: 1; display: inline-flex; gap: 6px; align-items: center; margin-top: 10px; color: rgba(255, 255, 255, .84); font-size: .76rem; font-weight: 800; }
  .brief-freshness .icon { width: 15px; height: 15px; }

  .brief-facts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-bottom: 1px solid var(--fw-border);
  }
  .brief-fact {
    min-width: 0;
    min-height: 70px;
    padding: 10px 12px;
    border-right: 1px solid var(--fw-border);
    border-bottom: 1px solid var(--fw-border);
  }
  .brief-fact:nth-child(2n) { border-right: 0; }
  .brief-fact:nth-last-child(-n + 2) { border-bottom: 0; }
  .brief-fact span { display: block; color: var(--fw-muted); font-size: .68rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
  .brief-fact strong { display: block; margin-top: 3px; overflow-wrap: anywhere; font-size: .98rem; line-height: 1.2; }
  .brief-fact small { display: block; margin-top: 2px; color: var(--fw-muted); font-size: .74rem; }
  .brief-fact.rating-catastrophic strong { color: #ff7b7b; }
  .brief-fact.rating-extreme strong { color: #ff9a67; }
  .brief-fact.rating-high strong,
  .brief-fact .ban-declared { color: #ffd75e; }

  .brief-warning-line {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    padding: 10px 12px;
    border-bottom: 1px solid var(--fw-border);
    background: rgba(250, 204, 21, .09);
    font-size: .83rem;
    font-weight: 800;
  }
  .brief-warning-line .icon { color: #facc15; }

  .brief-priority { padding: 12px; border-bottom: 1px solid var(--fw-border); }
  .brief-priority-header { display: flex; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .brief-priority-header .eyebrow { margin: 0; }
  .brief-distance { color: var(--primary-text-color, #fff); font-size: .9rem; font-weight: 900; white-space: nowrap; }
  .brief-priority .badges { margin-bottom: 6px; }
  .brief-priority h3 { margin: 0 0 3px; overflow-wrap: anywhere; font-size: 1.02rem; }
  .brief-priority p { margin: 0; color: var(--fw-muted); font-size: .84rem; }
  .brief-priority-meta { display: flex; flex-wrap: wrap; gap: 5px 10px; margin-top: 6px; color: var(--fw-muted); font-size: .78rem; }
  .brief-empty { color: var(--fw-muted); }

  .brief-controls { margin: 0; padding: 10px 12px; }
  .brief-controls > .button,
  .brief-controls > .button-link { flex: 1 1 140px; }
  .brief-alert-options { width: 100%; margin: 0; padding-top: 0; border-top: 0; }
  .brief-alert-options summary { color: var(--fw-muted); font-size: .85rem; }
  .brief-alert-options[open] summary { margin-bottom: 8px; }
  .snooze-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; }
  .snooze-controls label { flex: 1 1 145px; }
  .snooze-controls select { width: 100%; margin-top: 3px; }

  .operations-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .operations-grid > .surface { margin-bottom: 0; }
  .detail-hub { margin-top: 12px; padding: 0 14px; }
  .info-drawer { margin: 0; padding: 0; border-top: 1px solid var(--fw-border); }
  .info-drawer:first-child { border-top: 0; }
  .info-drawer > summary { justify-content: space-between; min-height: 58px; padding: 8px 0; list-style: none; }
  .info-drawer > summary::-webkit-details-marker { display: none; }
  .drawer-title { display: grid; min-width: 0; }
  .drawer-title strong { font-size: .98rem; }
  .drawer-title small { overflow: hidden; color: var(--fw-muted); font-size: .76rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .drawer-chevron { transition: transform 150ms ease; }
  .info-drawer[open] > summary .drawer-chevron { transform: rotate(180deg); }
  .drawer-content { padding: 2px 0 14px; }

  .hero {
    position: relative;
    overflow: hidden;
    padding: 18px;
    border: 2px solid transparent;
    border-radius: 20px;
    color: white;
  }

  .hero::after {
    content: "";
    position: absolute;
    right: -60px;
    bottom: -95px;
    width: 210px;
    height: 210px;
    border-radius: 50%;
    background: rgba(255,255,255,.075);
    pointer-events: none;
  }

  .hero.severity-emergency { background: linear-gradient(135deg, var(--fw-red-dark), var(--fw-red)); }
  .hero.severity-watch { background: linear-gradient(135deg, #7c2d12, var(--fw-orange)); }
  .hero.severity-advice { background: #715b08; color: #fff; }
  .hero.severity-moderate { background: #1e3a4b; }
  .hero.severity-unknown { background: linear-gradient(135deg, #334155, #1e293b); }

  .hero-status {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    position: relative;
    z-index: 1;
  }

  .hero-icon {
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    width: 48px;
    height: 48px;
    border: 1px solid rgba(255,255,255,.38);
    border-radius: 50%;
    background: rgba(0,0,0,.16);
  }

  .hero-icon .icon { width: 26px; height: 26px; }
  .hero h2 { margin: 0 0 5px; font-size: clamp(1.45rem, 6vw, 2.35rem); }
  .hero-action { margin: 0; font-size: 1.06rem; font-weight: 800; }
  .hero-summary { margin: 10px 0 0; max-width: 760px; color: rgba(255,255,255,.9); }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 0; }
  .hero .data-chip { padding: 7px 9px; background: rgba(0,0,0,.16); font-size: .82rem; }

  .hero-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: stretch;
    position: relative;
    z-index: 1;
    margin-top: 16px;
  }

  .button, .button-link, select {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 1px solid var(--fw-border);
    border-radius: 12px;
    padding: 9px 13px;
    background: var(--fw-surface-strong);
    color: var(--primary-text-color, #fff);
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .hero .button, .hero .button-link, .hero select {
    border-color: rgba(255,255,255,.4);
    background: rgba(0,0,0,.22);
    color: white;
  }

  .button.primary, .button-link.primary { background: var(--fw-blue); color: white; border-color: transparent; }
  .button.critical, .button-link.critical { background: white; color: #7f1d1d; border-color: white; }
  .button:disabled { opacity: .58; cursor: wait; }
  .button:hover, .button-link:hover { filter: brightness(1.08); }

  .layout-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .layout-grid > .surface { margin-bottom: 0; }
  .section-heading { display: flex; gap: 10px; align-items: center; justify-content: space-between; }
  .section-heading h2 { margin-bottom: 0; }

  .forecast-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .forecast-card { overflow: hidden; border: 1px solid var(--fw-border); border-radius: 15px; background: rgba(0,0,0,.08); }
  .forecast-rating { min-height: 78px; padding: 12px; }
  .forecast-rating.severity-emergency { background: var(--fw-red); color: white; }
  .forecast-rating.severity-watch { background: var(--fw-orange); color: white; }
  .forecast-rating.severity-advice { background: var(--fw-yellow); color: #231f00; }
  .forecast-rating.severity-moderate { background: var(--fw-green); color: white; }
  .forecast-rating.severity-unknown { background: var(--fw-neutral); color: white; }
  .day-label { display: block; margin-bottom: 3px; font-size: .78rem; font-weight: 900; text-transform: uppercase; }
  .rating-label { display: block; font-size: clamp(1.15rem, 4vw, 1.5rem); font-weight: 900; }
  .forecast-details { padding: 11px 12px; }
  .metric-row { display: flex; justify-content: space-between; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--fw-border); }
  .metric-row:last-child { border-bottom: 0; }
  .metric-row strong { text-align: right; }
  .ban-yes { color: #ffcf66; }
  .weather-facts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; }
  .weather-fact { padding: 5px 8px; border-radius: 8px; background: rgba(127,127,127,.14); font-size: .82rem; }
  .weather-warning-list { display: grid; gap: 8px; margin-top: 12px; }
  .weather-warning {
    padding: 12px;
    border: 1px solid #facc15;
    border-radius: 12px;
    background: rgba(250,204,21,.09);
  }
  .weather-warning p { margin-bottom: 8px; }
  .bom-attribution-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 66px;
    margin-top: 12px;
    padding: 33px;
    border-top: 1px solid var(--fw-border);
  }
  .bom-attribution { display: block; max-width: 100%; min-height: 44px; padding: 11px 0; }
  .bom-attribution img { display: block; width: 558px; max-width: 100%; height: auto; }

  .priority-card { margin-top: 12px; padding: 14px; border: 2px solid var(--fw-border); border-radius: 15px; background: rgba(0,0,0,.1); }
  .priority-card.severity-emergency { border-color: #ef4444; }
  .priority-card.severity-watch { border-color: #f97316; }
  .priority-card.severity-advice { border-color: #facc15; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
  .badge { padding: 5px 8px; font-size: .75rem; }
  .badge.warning-emergency { border-color: #ef4444; background: var(--fw-red); color: white; }
  .badge.warning-watch { border-color: #f97316; background: var(--fw-orange); color: white; }
  .badge.warning-advice { border-color: #facc15; background: var(--fw-yellow); color: #231f00; }
  .badge.warning-none, .badge.control, .badge.meta { background: rgba(127,127,127,.14); color: var(--primary-text-color, #fff); }
  .badge.acknowledged { background: #14532d; color: white; border-color: #22c55e; }
  .incident-meta { display: flex; flex-wrap: wrap; gap: 5px 12px; margin: 7px 0; color: var(--fw-muted); font-size: .88rem; }
  .incident-meta span { display: inline-flex; align-items: center; gap: 4px; }
  .incident-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }

  .readiness-list, .incident-list { display: grid; gap: 8px; margin: 12px 0 0; padding: 0; list-style: none; }
  .readiness-item { display: flex; gap: 10px; align-items: center; min-height: 48px; padding: 9px 10px; border: 1px solid var(--fw-border); border-radius: 12px; background: rgba(0,0,0,.08); }
  .readiness-state { display: grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; border: 2px solid var(--fw-border); border-radius: 50%; color: var(--fw-muted); }
  .readiness-state.complete { border-color: #22c55e; background: #14532d; color: white; }
  .readiness-toggle { width: 100%; justify-content: flex-start; text-align: left; background: transparent; border: 0; padding: 0; color: inherit; cursor: pointer; }

  .incident-item { padding: 13px; border: 1px solid var(--fw-border); border-left: 5px solid var(--fw-neutral); border-radius: 12px; background: rgba(0,0,0,.08); }
  .incident-item.severity-emergency { border-left-color: #ef4444; }
  .incident-item.severity-watch { border-left-color: #f97316; }
  .incident-item.severity-advice { border-left-color: #facc15; }
  .incident-item h3 { overflow-wrap: anywhere; }
  .incident-item .badges { margin-bottom: 6px; }
  .incident-item > h3 { margin-bottom: 5px; font-size: .98rem; }
  .incident-scanline { display: flex; flex-wrap: wrap; gap: 4px 10px; margin: 0; color: var(--fw-muted); font-size: .8rem; }
  .incident-scanline > strong { color: var(--primary-text-color, #fff); }
  .incident-scanline .icon { width: 14px; height: 14px; }
  .incident-detail-drawer { margin-top: 7px; padding-top: 0; border-top: 0; }
  .incident-detail-drawer summary { min-height: 44px; color: var(--fw-link); font-size: .82rem; }
  .incident-detail-drawer .incident-actions { margin-top: 7px; }

  .empty-state { padding: 18px; border: 1px dashed var(--fw-border); border-radius: 13px; color: var(--fw-muted); text-align: center; }
  .empty-state .icon { width: 30px; height: 30px; margin-bottom: 5px; }

  details { border-top: 1px solid var(--fw-border); margin-top: 12px; padding-top: 10px; }
  summary { min-height: 44px; display: flex; align-items: center; gap: 8px; font-weight: 900; cursor: pointer; }

  .map-host { position: relative; height: 330px; min-height: 330px; overflow: hidden; border: 1px solid var(--fw-border); border-radius: 14px; background: rgba(0,0,0,.1); }
  .map-host > * { display: block; min-height: 330px; }
  .map-host > * { width: 100%; }
  .map-fallback { min-height: 330px; display: grid; place-items: center; padding: 24px; text-align: center; }
  .map-fallback p { margin-bottom: 10px; }
  .map-fallback .button-link { margin: 4px; }
  .map-provider-credit { margin: 8px 2px 0; color: var(--fw-muted); font-size: .66rem; line-height: 1.35; text-align: right; }
  .map-provider-credit a { color: inherit; }
  .map-marker {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 3px solid white;
    border-radius: 50%;
    background: #64748b;
    box-shadow: 0 2px 8px rgba(0,0,0,.45);
    color: white;
    cursor: pointer;
  }
  .map-marker::after { width: 8px; height: 8px; border-radius: 50%; background: currentColor; content: ""; }
  .map-marker.warning-emergency { width: 34px; height: 34px; background: #b91c1c; }
  .map-marker.warning-watch { width: 32px; height: 32px; background: #ea580c; }
  .map-marker.warning-advice { background: #ca8a04; }
  .map-marker.planned { width: 24px; height: 24px; background: #16804a; }
  .map-marker.home { width: 28px; height: 28px; border-radius: 8px; background: #1565c0; transform: rotate(45deg); cursor: default; }
  .map-marker.home::after { transform: rotate(-45deg); background: white; }
  .map-popup-title { margin: 0 0 5px; font-size: .94rem; line-height: 1.25; }
  .map-popup-meta { margin: 2px 0; color: #475569; font-size: .78rem; }
  .map-popup-link { display: inline-block; min-height: 36px; margin-top: 7px; color: #0b57a4; font-size: .8rem; font-weight: 800; }

  .health-grid { display: grid; grid-template-columns: 1fr; gap: 9px; }
  .health-item { padding: 11px; border: 1px solid var(--fw-border); border-radius: 12px; background: rgba(0,0,0,.08); }
  .health-item span { display: block; color: var(--fw-muted); font-size: .78rem; font-weight: 800; text-transform: uppercase; }
  .health-item strong { display: block; margin-top: 3px; overflow-wrap: anywhere; }
  .status-fresh { color: #72e59a; }
  .status-stale { color: #ffd166; }

  .official-links { display: grid; gap: 8px; margin-top: 12px; }
  .official-links .button-link { justify-content: space-between; text-align: left; }
  .source-attribution { margin: 10px 0 0; color: var(--fw-muted); font-size: .72rem; line-height: 1.35; }
  .source-attribution a { color: inherit; }
  .disclaimer { margin: 13px 0 0; padding: 11px; border-left: 4px solid #facc15; background: rgba(250,204,21,.09); font-size: .88rem; }
  .support-link { margin: 12px 0 0; color: var(--fw-muted); font-size: .76rem; text-align: center; }
  .support-link a { color: inherit; font-weight: 700; }

  .notice { margin: 0 0 12px; padding: 11px 13px; border: 1px solid var(--fw-border); border-radius: 12px; background: #1e3a5f; color: white; }
  .notice.error { background: #7f1d1d; }

  .compact-shell {
    width: 100%;
    margin: 0;
    padding: 0;
  }

  .compact-card {
    overflow: hidden;
    border: 1px solid var(--fw-border);
    border-radius: var(--ha-card-border-radius, 16px);
    background: var(--fw-surface);
    box-shadow: var(--ha-card-box-shadow, 0 4px 16px rgba(0, 0, 0, .16));
  }

  .compact-status {
    padding: 14px 16px 15px;
    color: white;
    background: linear-gradient(135deg, #334155, #1e293b);
  }

  .compact-status.severity-emergency { background: linear-gradient(135deg, var(--fw-red-dark), var(--fw-red)); }
  .compact-status.severity-watch { background: linear-gradient(135deg, #7c2d12, var(--fw-orange)); }
  .compact-status.severity-advice { background: #715b08; }
  .compact-status.severity-moderate { background: #1e3a4b; }
  .compact-status.severity-unknown { background: linear-gradient(135deg, #334155, #1e293b); }

  .compact-kicker-row,
  .compact-title-row,
  .compact-danger,
  .compact-actions {
    display: flex;
    align-items: center;
  }

  .compact-kicker-row { justify-content: space-between; gap: 10px; }
  .compact-kicker-row .eyebrow { margin: 0; color: rgba(255,255,255,.78); }
  .compact-freshness {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    flex: 0 0 auto;
    color: rgba(255,255,255,.9);
    font-size: .75rem;
    font-weight: 800;
  }
  .compact-freshness .icon { width: 15px; height: 15px; }
  .compact-title-row { align-items: flex-start; gap: 10px; margin-top: 8px; }
  .compact-title-row .hero-icon { width: 40px; height: 40px; }
  .compact-title-row .hero-icon .icon { width: 22px; height: 22px; }
  .compact-title-row h2 { margin: 0; font-size: 1.35rem; line-height: 1.18; }
  .compact-title-row p { margin: 3px 0 0; font-size: .93rem; font-weight: 800; }

  .compact-danger {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    border-bottom: 1px solid var(--fw-border);
  }
  .compact-metric { min-width: 0; min-height: 68px; padding: 10px 12px; border-right: 1px solid var(--fw-border); border-bottom: 1px solid var(--fw-border); }
  .compact-metric:nth-child(2n) { border-right: 0; }
  .compact-metric:nth-last-child(-n + 2) { border-bottom: 0; }
  .compact-metric span { display: block; color: var(--fw-muted); font-size: .69rem; font-weight: 900; letter-spacing: .055em; text-transform: uppercase; }
  .compact-metric strong { display: block; margin-top: 3px; overflow-wrap: anywhere; font-size: .94rem; line-height: 1.25; }
  .compact-metric small { display: block; margin-top: 2px; color: var(--fw-muted); font-size: .72rem; }
  .compact-metric.rating-catastrophic strong { color: #ff7b7b; }
  .compact-metric.rating-extreme strong { color: #ff9a67; }
  .compact-metric.rating-high strong,
  .compact-metric .ban-declared { color: #ffd75e; }

  .compact-priority { padding: 12px 14px; border-bottom: 1px solid var(--fw-border); }
  .compact-priority .badges { margin-bottom: 7px; }
  .compact-priority h3 { margin: 0 0 3px; overflow-wrap: anywhere; font-size: 1rem; }
  .compact-priority p { margin: 0; color: var(--fw-muted); font-size: .86rem; }
  .compact-priority-meta { display: flex; flex-wrap: wrap; gap: 5px 10px; margin-top: 6px; color: var(--fw-muted); font-size: .8rem; }
  .compact-priority-empty { color: var(--fw-muted); }

  .compact-map { padding: 0 12px 12px; border-bottom: 1px solid var(--fw-border); }
  .compact-map-heading { display: flex; align-items: center; justify-content: space-between; min-height: 44px; }
  .compact-map-heading strong { font-size: .9rem; }
  .compact-map-heading span { color: var(--fw-muted); font-size: .72rem; }
  .compact-map-host { height: 240px; min-height: 240px; border-radius: 12px; }
  .compact-map-host > * { min-height: 240px; }
  .compact-map .map-fallback { min-height: 240px; padding: 18px; }
  .compact-map .map-provider-credit { text-align: left; }

  .compact-feed-message { margin: 0; padding: 10px 14px; border-bottom: 1px solid var(--fw-border); background: rgba(250,204,21,.09); color: var(--primary-text-color, #fff); font-size: .82rem; }
  .compact-bom-attribution {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 20px;
    border-bottom: 1px solid var(--fw-border);
  }
  .compact-bom-attribution img { display: block; width: 320px; max-width: 100%; height: auto; }
  .compact-actions { gap: 8px; padding: 11px 12px; }
  .compact-actions .button-link { flex: 1 1 0; padding-inline: 10px; }
  .compact-actions .primary { flex-grow: 1.35; }
  .compact-disclaimer { margin: 0; padding: 0 14px 12px; color: var(--fw-muted); font-size: .75rem; }
  .compact-attribution { margin: 0; padding: 0 14px 13px; color: var(--fw-muted); font-size: .64rem; line-height: 1.35; }
  .compact-attribution a { color: inherit; }

  .compact-setup { padding: 16px; }
  .compact-setup h1 { margin-bottom: 8px; font-size: 1.25rem; }
  .compact-setup p { color: var(--fw-muted); font-size: .88rem; }

  .setup { max-width: 720px; margin: 42px auto; }
  .setup-code { display: block; overflow-wrap: anywhere; margin: 10px 0; padding: 10px; border-radius: 9px; background: rgba(0,0,0,.22); font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }

  .test-controls { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 7px; }

  @media (min-width: 720px) {
    .app-shell { padding: 0 20px 50px; }
    .command-nav { margin-inline: -20px; padding-inline: 20px; }
    .hero { padding: 24px; }
    .brief-status { padding: 20px; }
    .brief-facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .brief-fact { border-right: 1px solid var(--fw-border); border-bottom: 0; }
    .brief-fact:nth-child(2n) { border-right: 1px solid var(--fw-border); }
    .brief-fact:last-child { border-right: 0; }
    .layout-grid { grid-template-columns: minmax(0, 1.08fr) minmax(320px, .92fr); }
    .forecast-card { display: grid; grid-template-columns: minmax(140px, .8fr) minmax(170px, 1.2fr); }
    .forecast-rating { min-height: 100%; }
    .health-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .official-links { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (min-width: 1000px) {
    .wide-grid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(340px, .75fr); gap: 12px; }
    .wide-grid > .surface { margin-bottom: 0; }
    .operations-grid { grid-template-columns: minmax(0, 1.15fr) minmax(360px, .85fr); align-items: start; }
  }

  @media (max-width: 430px) {
    .command-nav-context span { font-size: .64rem; }
    .command-nav-context strong { font-size: .86rem; }
    .nav-feed-status { font-size: .7rem; }
    .hero-controls > * { flex: 1 1 auto; }
    .forecast-grid { grid-template-columns: 1fr; }
    .surface { padding: 13px; border-radius: 16px; }
    .detail-hub { padding: 0 12px; }
    .drawer-content .bom-attribution-wrap { padding: 16px; }
    .official-links .button-link,
    .test-controls > *,
    .incident-actions > * { width: 100%; }
  }

  @media (max-width: 350px) {
    .compact-actions { align-items: stretch; flex-direction: column; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
  }

  @media print {
    :host { background: white; color: black; }
    .button, .button-link, select, .test-controls, .map-host { display: none !important; }
    .surface { box-shadow: none; break-inside: avoid; }
  }
`;

const metricWithUnit = (value, unit) => {
  if (!isPresent(value) || isUnavailable(value)) return null;
  const rendered = String(value).trim();
  if (!unit || /[°%]|km\/h|kph|mm|m\/s/i.test(rendered)) return rendered;
  return `${rendered} ${unit}`;
};

const renderWeatherContext = (day) => {
  if (day.weatherAvailable === false) return "";
  const facts = [
    ["Conditions", isPresent(day.condition) ? titleCase(day.condition) : null],
    ["Temperature", metricWithUnit(day.temperatureC, day.temperatureUnit)],
    ["Humidity", metricWithUnit(day.humidityPercent, day.humidityUnit)],
    ["Wind", metricWithUnit(day.windSpeedKmh, day.windSpeedUnit)],
    ["Gusts", metricWithUnit(day.windGustKmh, day.windSpeedUnit)],
    ["Rain", metricWithUnit(day.rainMm, day.rainUnit)],
  ].filter(([, value]) => value !== null);
  if (!facts.length) return "";
  return `
    <div class="weather-context" aria-label="Weather context">
      <span class="eyebrow">Weather context</span>
      <div class="weather-facts">
        ${facts
          .map(
            ([label, value]) =>
              `<span class="weather-fact"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`,
          )
          .join("")}
      </div>
      ${day.weatherNote ? `<p class="small subtle">${escapeHtml(day.weatherNote)}</p>` : ""}
    </div>
  `;
};

const hasWeatherContext = (day) =>
  day.weatherAvailable !== false &&
  [
    day.condition,
    day.temperatureC,
    day.humidityPercent,
    day.windSpeedKmh,
    day.windGustKmh,
    day.rainMm,
  ].some(isPresent);

const renderBomAttribution = () => `
  <div class="bom-attribution-wrap">
    <a class="bom-attribution" href="${BOM_ATTRIBUTION_URL}" target="_blank" rel="noopener noreferrer" aria-label="Bureau weather-data attribution information">
      <img src="${BOM_ATTRIBUTION_IMAGE}" width="558" height="22" alt="Weather data sourced from the Bureau of Meteorology" />
    </a>
  </div>
`;

const renderCompactBomAttribution = () => `
  <a class="compact-bom-attribution" href="${BOM_ATTRIBUTION_URL}" target="_blank" rel="noopener noreferrer" aria-label="Bureau weather-data attribution information">
    <img src="${BOM_ATTRIBUTION_IMAGE}" width="558" height="22" alt="Weather data sourced from the Bureau of Meteorology" />
  </a>
`;

const renderFireWeatherWarnings = (warnings) => {
  if (!warnings.length) return "";
  return `
    <div class="weather-warning-list" aria-label="Fire weather warnings">
      ${warnings
        .map(
          (warning) => `
            <article class="weather-warning">
              <span class="eyebrow">Fire weather warning</span>
              <h3>${escapeHtml(warning.title)}</h3>
              ${
                warning.publishedAt
                  ? `<p class="small subtle" title="${escapeHtml(
                      formatAbsolute(warning.publishedAt),
                    )}">Published ${escapeHtml(formatRelative(warning.publishedAt))}</p>`
                  : ""
              }
              <a class="button-link" href="${escapeHtml(
                warning.link,
              )}" target="_blank" rel="noopener noreferrer">Open the official warning article ${icon(
                "external",
              )}</a>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
};

const renderForecastDay = (label, day) => {
  const rating = ratingLabel(day.rating);
  const fbi = !isPresent(day.fbi) || isUnavailable(day.fbi) ? "Not supplied" : day.fbi;
  const fireBan =
    day.totalFireBan === true
      ? '<strong class="ban-yes">Declared</strong>'
      : day.totalFireBan === false
        ? "Not declared"
        : "Status unavailable";
  const issued = day.issuedAt
    ? `<p class="small subtle" title="${escapeHtml(formatAbsolute(day.issuedAt))}">Issued ${escapeHtml(formatRelative(day.issuedAt))}</p>`
    : "";
  return `
    <article class="forecast-card" aria-label="${escapeHtml(label)} fire danger">
      <div class="forecast-rating ${severityClass(null, day.rating)}">
        <span class="day-label">${escapeHtml(label)}</span>
        <span class="rating-label">${escapeHtml(rating)}</span>
      </div>
      <div class="forecast-details">
        <div class="metric-row"><span>Fire Behaviour Index</span><strong>${escapeHtml(fbi)}</strong></div>
        <div class="metric-row"><span>Total Fire Ban</span>${fireBan}</div>
        ${renderWeatherContext(day)}
        ${issued}
      </div>
    </article>
  `;
};

const renderBadges = (incident) => {
  const warning = warningKey(incident.warning);
  const warningClass = {
    emergency_warning: "warning-emergency",
    watch_and_act: "warning-watch",
    advice: "warning-advice",
  }[warning] || "warning-none";
  const badges = [
    `<span class="badge ${warningClass}">${escapeHtml(warningLabel(incident.warning))}</span>`,
    `<span class="badge control">${escapeHtml(controlLabel(incident.control))}</span>`,
  ];
  if (incident.acknowledged) {
    badges.push(`<span class="badge acknowledged">${icon("check")} Acknowledged</span>`);
  }
  if (incident.snoozedUntil && parseDate(incident.snoozedUntil)?.getTime() > Date.now()) {
    badges.push(
      `<span class="badge meta">Snoozed until ${escapeHtml(
        new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
          parseDate(incident.snoozedUntil),
        ),
      )}</span>`,
    );
  }
  return `<div class="badges">${badges.join("")}</div>`;
};

const renderIncidentMeta = (incident) => {
  const metadata = [
    formatDistance(incident.distanceKm),
    incident.direction ? `${incident.direction} of your monitored location` : null,
    incident.council ? `${incident.council} area` : null,
    incident.sizeHa ? `${incident.sizeHa} ha reported` : null,
  ].filter(Boolean);
  return `
    <div class="incident-meta">
      ${metadata.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    </div>
  `;
};

const renderIncidentActions = (incident) => {
  const moreInfo = incident.entityId
    ? `<button class="button" type="button" data-action="more-info" data-entity-id="${escapeHtml(
        incident.entityId,
      )}">Details in Home Assistant</button>`
    : "";
  return `
    <div class="incident-actions">
      <a class="button-link" href="${escapeHtml(
        incident.officialUrl,
      )}" target="_blank" rel="noopener noreferrer">
        Official source ${icon("external")}
      </a>
      ${moreInfo}
    </div>
  `;
};

const renderIncident = (incident, priority = false) => {
  const updated = incident.updatedAt
    ? `<span title="${escapeHtml(formatAbsolute(incident.updatedAt))}">${icon(
        "clock",
      )} Updated ${escapeHtml(formatRelative(incident.updatedAt))}</span>`
    : `<span>${icon("clock")} Update time not supplied</span>`;
  if (!priority) {
    return `
      <article class="incident-item ${severityClass(
        incident.warning,
      )}" data-incident-id="${escapeHtml(incident.id)}">
        ${renderBadges(incident)}
        <h3>${escapeHtml(incident.title)}</h3>
        <p class="incident-scanline"><strong>${escapeHtml(
          formatDistance(incident.distanceKm),
        )}</strong><span>${escapeHtml(incident.type)}</span>${updated}</p>
        <details class="incident-detail-drawer">
          <summary>Details &amp; official links</summary>
          ${renderIncidentMeta(incident)}
          ${renderIncidentActions(incident)}
        </details>
      </article>
    `;
  }
  return `
    <article class="priority-card ${severityClass(
      incident.warning,
    )}" data-incident-id="${escapeHtml(incident.id)}">
      ${renderBadges(incident)}
      <h3>${escapeHtml(incident.title)}</h3>
      <p>${escapeHtml(incident.type)}</p>
      ${renderIncidentMeta(incident)}
      <div class="incident-meta">${updated}</div>
      ${renderIncidentActions(incident)}
    </article>
  `;
};

const deriveHero = (model) => {
  const warning = warningKey(model.officialWarning);
  const rating = ratingKey(model.today.rating);
  const hasOfficialWarning = WARNING_WEIGHT[warning] >= 2;
  let title;
  if (warning === "emergency_warning") title = "Emergency Warning";
  else if (warning === "watch_and_act") title = "Watch and Act";
  else if (warning === "advice") title = "Advice";
  else if (rating === "catastrophic") title = "Catastrophic fire danger";
  else if (model.feed.stale) title = "Live updates unavailable";
  else if (model.state === "incident_nearby") title = "Incident nearby";
  else if (model.state === "planned_activity") title = "Planned fire activity nearby";
  else if (warning === "unknown" && model.state !== "no_current_warning") {
    title = "Official warning level unavailable";
  }
  else title = "No current warning";

  const severity = model.feed.stale && !hasOfficialWarning && rating !== "catastrophic"
    ? "severity-unknown"
    : severityClass(model.officialWarning, model.today.rating);

  let summary = model.summaryText;
  if (!summary && model.priorityIncident) {
    summary = `${model.priorityIncident.type} at ${model.priorityIncident.title}, ${formatDistance(
      model.priorityIncident.distanceKm,
    )}.`;
  }
  if (!summary && model.feed.stale) {
    summary = "The last known information is retained below and may no longer be current.";
  }
  if (!summary && warning === "unknown" && model.state !== "no_current_warning") {
    summary = "An official warning level was not supplied. Check the official emergency service before acting.";
  }
  if (!summary) {
    summary =
      "No official warning is currently shown for the monitored area. Conditions can change quickly.";
  }

  return {
    title,
    severity,
    action: model.recommendedAction || actionFor(model.officialWarning, model.today.rating),
    summary,
    hasOfficialWarning,
  };
};

const renderHeroControls = (model, hero, busy) => {
  const incident = model.priorityIncident;
  const warning = warningKey(model.officialWarning);
  const controls = [
    `<a class="button-link ${warning === "emergency_warning" ? "critical" : ""}" href="${escapeHtml(
      model.feed.officialUrl,
    )}" target="_blank" rel="noopener noreferrer">Official source ${icon("external")}</a>`,
  ];
  let reminderOptions = "";

  if (incident && hero.hasOfficialWarning) {
    controls.push(
      `<button class="button" type="button" data-action="acknowledge" data-incident-id="${escapeHtml(
        incident.id,
      )}" ${busy ? "disabled" : ""}>${icon("check")} Acknowledge</button>`,
    );
    if (warning !== "emergency_warning") {
      const options =
        warning === "watch_and_act"
          ? [15, 30]
          : [30, 60, 120];
      reminderOptions = `
        <details class="brief-alert-options">
          <summary>Reminder options</summary>
          <div class="snooze-controls">
            <label>
              <span class="eyebrow">Snooze reminders</span>
              <select id="snooze-duration" aria-label="Snooze reminder duration">
                ${options
                  .map(
                    (minutes) =>
                      `<option value="${minutes}">${minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}</option>`,
                  )
                  .join("")}
              </select>
            </label>
            <button class="button" type="button" data-action="snooze" data-incident-id="${escapeHtml(
              incident.id,
            )}" ${busy ? "disabled" : ""}>${icon("clock")} Snooze</button>
          </div>
        </details>
      `;
    }
  }
  return `<div class="hero-controls brief-controls">${controls.join("")}${reminderOptions}</div>`;
};

const renderHero = (model, busy) => {
  const hero = deriveHero(model);
  const updated = model.feed.lastSuccessfulUpdate
    ? `Updated ${formatRelative(model.feed.lastSuccessfulUpdate)}`
    : "Update time unavailable";
  const staleChip = model.feed.stale
    ? `<span class="data-chip">${icon("warning")} Live feed delayed</span>`
    : `<span class="data-chip">${icon("radio")} Live feed current</span>`;
  return `
    <section class="hero ${hero.severity}" aria-labelledby="fire-watch-status">
      <div class="hero-status">
        <span class="hero-icon">${icon(
          hero.severity === "severity-emergency" ? "warning" : "fire",
        )}</span>
        <div>
          <span class="eyebrow">${escapeHtml(model.locationName)}</span>
          <h2 id="fire-watch-status">${escapeHtml(hero.title)}</h2>
          <p class="hero-action">${escapeHtml(hero.action)}</p>
          <p class="hero-summary">${escapeHtml(hero.summary)}</p>
          <div class="hero-meta">
            ${staleChip}
            <span class="data-chip" title="${escapeHtml(
              formatAbsolute(model.feed.lastSuccessfulUpdate),
            )}">${icon("clock")} ${escapeHtml(updated)}</span>
          </div>
        </div>
      </div>
      ${renderHeroControls(model, hero, busy)}
    </section>
  `;
};

const renderCommandNav = (model, title) => {
  const feedLabel = model.feed.stale ? "Delayed" : "Live";
  return `
    <nav class="command-nav" aria-label="Command centre navigation">
      <a class="home-exit" href="/lovelace/default_view" aria-label="Return to Home dashboard">
        ${icon("home")} <span>Home</span>
      </a>
      <div class="command-nav-context">
        <span>${escapeHtml(title || model.integrationName || "Australian Fire Watch")}</span>
        <strong>${escapeHtml(model.locationName)}</strong>
      </div>
      <span class="nav-feed-status ${model.feed.stale ? "delayed" : ""}" title="${escapeHtml(
        model.feed.lastSuccessfulUpdate
          ? `Last update ${formatAbsolute(model.feed.lastSuccessfulUpdate)}`
          : "Last update time unavailable",
      )}">${feedLabel}</span>
    </nav>
  `;
};

const renderCommandBrief = (model, busy) => {
  const hero = deriveHero(model);
  const todayRating = ratingLabel(model.today.rating);
  const tomorrowRating = ratingLabel(model.tomorrow.rating);
  const todayFbi =
    isPresent(model.today.fbi) && !isUnavailable(model.today.fbi)
      ? `FBI ${model.today.fbi}`
      : "FBI not supplied";
  const todayBan =
    model.today.totalFireBan === true
      ? '<strong class="ban-declared">Declared</strong>'
      : model.today.totalFireBan === false
        ? "Not declared"
        : "Not supplied";
  const tomorrowBan =
    model.tomorrow.totalFireBan === true
      ? "Total Fire Ban"
      : model.tomorrow.totalFireBan === false
        ? "No total fire ban"
        : "Ban status not supplied";
  const nearestDistance = model.incidents
    .filter((incident) => isPresent(incident.distanceKm))
    .map((incident) => asNumber(incident.distanceKm))
    .filter((distance) => distance !== null)
    .reduce((nearest, distance) => Math.min(nearest, distance), Number.POSITIVE_INFINITY);
  const incidentSubline = Number.isFinite(nearestDistance)
    ? `Nearest ${formatDistance(nearestDistance)}`
    : model.feed.stale
      ? "List may be incomplete"
      : "None shown in radius";
  const updateText = model.feed.lastSuccessfulUpdate
    ? `Updated ${formatRelative(model.feed.lastSuccessfulUpdate)}`
    : "Update time unavailable";
  const weatherWarning = model.fireWeatherWarnings[0];

  let priority;
  if (model.priorityIncident) {
    const incident = model.priorityIncident;
    const updated = incident.updatedAt
      ? `Updated ${formatRelative(incident.updatedAt)}`
      : "Update time not supplied";
    priority = `
      <article class="brief-priority ${severityClass(incident.warning)}" aria-labelledby="brief-priority-heading">
        <div class="brief-priority-header">
          <span class="eyebrow">Priority incident</span>
          <span class="brief-distance">${escapeHtml(formatDistance(incident.distanceKm))}</span>
        </div>
        ${renderBadges(incident)}
        <h3 id="brief-priority-heading">${escapeHtml(incident.title)}</h3>
        <p>${escapeHtml(incident.type)}</p>
        <div class="brief-priority-meta">
          <span>${escapeHtml(updated)}</span>
        </div>
      </article>
    `;
  } else {
    priority = `
      <div class="brief-priority brief-empty" aria-label="Incident summary">
        <strong>No current incidents are shown in your configured radius.</strong>
        <p>${
          model.feed.stale
            ? "Live data is delayed; check the official source before relying on this list."
            : "Conditions can change quickly; keep official alerts enabled."
        }</p>
      </div>
    `;
  }

  return `
    <section class="command-brief" aria-labelledby="fire-watch-status">
      <div class="brief-status ${hero.severity}">
        <div class="brief-heading">
          <span class="hero-icon">${icon(
            hero.severity === "severity-emergency" ? "warning" : "fire",
          )}</span>
          <div>
            <span class="eyebrow">What you need to know now</span>
            <h2 id="fire-watch-status">${escapeHtml(hero.title)}</h2>
            <p class="brief-action">${escapeHtml(hero.action)}</p>
          </div>
        </div>
        <p class="brief-summary">${escapeHtml(hero.summary)}</p>
        <span class="brief-freshness" title="${escapeHtml(
          formatAbsolute(model.feed.lastSuccessfulUpdate),
        )}">${icon(model.feed.stale ? "warning" : "radio")} ${escapeHtml(updateText)}${
          model.feed.stale ? " · feed delayed" : " · feed current"
        }</span>
      </div>

      <div class="brief-facts" aria-label="Fire conditions at a glance">
        <div class="brief-fact rating-${ratingKey(model.today.rating)}">
          <span>Today</span>
          <strong>${escapeHtml(todayRating)}</strong>
          <small>${escapeHtml(todayFbi)}</small>
        </div>
        <div class="brief-fact">
          <span>Total Fire Ban today</span>
          ${todayBan}
          <small>${model.today.totalFireBan === true ? "Restrictions apply" : "Check for changes"}</small>
        </div>
        <div class="brief-fact rating-${ratingKey(model.tomorrow.rating)}">
          <span>Tomorrow</span>
          <strong>${escapeHtml(tomorrowRating)}</strong>
          <small>${escapeHtml(tomorrowBan)}</small>
        </div>
        <div class="brief-fact">
          <span>Incidents in radius</span>
          <strong>${model.incidentCount}</strong>
          <small>${escapeHtml(incidentSubline)}</small>
        </div>
      </div>

      ${
        weatherWarning
          ? `<div class="brief-warning-line">${icon("warning")}<span>${escapeHtml(
              weatherWarning.title || "BOM fire weather warning issued",
            )}</span></div>`
          : ""
      }
      ${priority}
      ${renderHeroControls(model, hero, busy)}
    </section>
  `;
};

const renderCompact = (model, title, showMap = false) => {
  const hero = deriveHero(model);
  const rating = ratingLabel(model.today.rating);
  const fbi =
    !isPresent(model.today.fbi) || isUnavailable(model.today.fbi)
      ? "Not supplied"
      : model.today.fbi;
  const fireBan =
    model.today.totalFireBan === true
      ? '<strong class="ban-declared">Declared</strong>'
      : model.today.totalFireBan === false
        ? "Not declared"
        : "Unavailable";
  const tomorrowRating = ratingLabel(model.tomorrow.rating);
  const tomorrowBan =
    model.tomorrow.totalFireBan === true
      ? "Total Fire Ban"
      : model.tomorrow.totalFireBan === false
        ? "No ban declared"
        : "Ban status unavailable";
  const nearestIncident = model.incidents[0];
  const nearestSummary = nearestIncident
    ? formatDistance(nearestIncident.distanceKm)
    : model.feed.stale
      ? "List may be incomplete"
      : "None shown in radius";
  const updateText = model.feed.lastSuccessfulUpdate
    ? formatRelative(model.feed.lastSuccessfulUpdate)
    : "time unavailable";
  const freshness = model.feed.stale
    ? `${icon("warning")} Feed delayed · ${escapeHtml(updateText)}`
    : `${icon("radio")} Feed current · ${escapeHtml(updateText)}`;

  let priority;
  if (model.priorityIncident) {
    const incident = model.priorityIncident;
    const updated = incident.updatedAt
      ? `Updated ${formatRelative(incident.updatedAt)}`
      : "Update time not supplied";
    priority = `
      <section class="compact-priority" aria-labelledby="compact-priority-heading">
        <span class="eyebrow">Highest priority incident</span>
        ${renderBadges(incident)}
        <h3 id="compact-priority-heading">${escapeHtml(incident.title)}</h3>
        <p>${escapeHtml(incident.type)}</p>
        <div class="compact-priority-meta">
          <span>${escapeHtml(formatDistance(incident.distanceKm))}</span>
          <span>${escapeHtml(updated)}</span>
        </div>
      </section>
    `;
  } else {
    priority = `
      <section class="compact-priority compact-priority-empty" aria-label="Incident summary">
        <strong>No current incidents are shown in the configured radius.</strong>
        <p>${
          model.feed.stale
            ? "The incident list may be incomplete while live updates are delayed."
            : "Conditions can change quickly; keep official alerts enabled."
        }</p>
      </section>
    `;
  }

  const feedMessage = model.feed.stale
    ? model.feed.message ||
      "Last known information is retained and may no longer be current. Check the official emergency service."
    : model.feed.message;

  return `
    <main class="compact-shell">
      <article class="compact-card" aria-labelledby="compact-status-heading">
        <header class="compact-status ${hero.severity}">
          <div class="compact-kicker-row">
            <span class="eyebrow">${escapeHtml(title || model.integrationName || "Australian Fire Watch")}</span>
            <span class="compact-freshness" title="${escapeHtml(
              formatAbsolute(model.feed.lastSuccessfulUpdate),
            )}">${freshness}</span>
          </div>
          <div class="compact-title-row">
            <span class="hero-icon">${icon(
              hero.severity === "severity-emergency" ? "warning" : "fire",
            )}</span>
            <div>
              <h2 id="compact-status-heading">${escapeHtml(hero.title)}</h2>
              <p>${escapeHtml(hero.action)}</p>
            </div>
          </div>
        </header>

        <section class="compact-danger" aria-label="Today’s fire danger">
          <div class="compact-metric rating-${ratingKey(model.today.rating)}">
            <span>Today</span>
            <strong>${escapeHtml(rating)}</strong>
            <small>FBI ${escapeHtml(fbi)}</small>
          </div>
          <div class="compact-metric">
            <span>Total Fire Ban today</span>
            ${fireBan}
            <small>${model.today.totalFireBan === true ? "Restrictions apply" : "Check for changes"}</small>
          </div>
          <div class="compact-metric rating-${ratingKey(model.tomorrow.rating)}">
            <span>Tomorrow</span>
            <strong>${escapeHtml(tomorrowRating)}</strong>
            <small>${escapeHtml(tomorrowBan)}</small>
          </div>
          <div class="compact-metric">
            <span>Incidents in radius</span>
            <strong>${model.incidentCount}</strong>
            <small>${escapeHtml(nearestSummary)}</small>
          </div>
        </section>

        ${priority}
        ${showMap ? renderCompactMap() : ""}
        ${
          feedMessage
            ? `<p class="compact-feed-message">${escapeHtml(feedMessage)}</p>`
            : ""
        }
        ${
          isPresent(model.today.fbi) ||
          isPresent(model.tomorrow.fbi) ||
          model.fireWeatherWarnings.length > 0
            ? renderCompactBomAttribution()
            : ""
        }
        <nav class="compact-actions" aria-label="Fire Watch links">
          <a class="button-link primary" href="/australian-fire-watch">Open command centre</a>
          <a class="button-link" href="${escapeHtml(
            model.feed.officialUrl,
          )}" target="_blank" rel="noopener noreferrer">Official source ${icon(
            "external",
          )}</a>
        </nav>
        <p class="compact-disclaimer">Supplementary only — keep official emergency alerts enabled.</p>
        <p class="compact-attribution"><a href="${escapeHtml(
          model.feed.officialUrl,
        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          model.feed.attribution,
        )}</a></p>
      </article>
    </main>
  `;
};

const renderPriority = (model) => {
  if (!model.priorityIncident) {
    const message = model.feed.stale
      ? "The incident list may be incomplete while live updates are unavailable."
      : "No current incidents are shown in your configured radius. Conditions can change quickly.";
    return `
      <section class="surface" aria-labelledby="priority-heading">
        <div class="section-heading"><h2 id="priority-heading">Highest priority incident</h2></div>
        <div class="empty-state">${icon("radio")}<p>${escapeHtml(message)}</p></div>
      </section>
    `;
  }
  return `
    <section class="surface" aria-labelledby="priority-heading">
      <div class="section-heading"><h2 id="priority-heading">Highest priority incident</h2></div>
      ${renderIncident(model.priorityIncident, true)}
    </section>
  `;
};

const renderDangerDetails = (model) => {
  const preview = `Today ${ratingLabel(model.today.rating)} · Tomorrow ${ratingLabel(
    model.tomorrow.rating,
  )}`;
  return `
    <details class="info-drawer">
      <summary>
        <span class="drawer-title"><strong>Forecast &amp; fire weather</strong><small>${escapeHtml(
          preview,
        )}</small></span>
        <span class="drawer-chevron">${icon("chevron")}</span>
      </summary>
      <div class="drawer-content">
        <div class="forecast-grid">
          ${renderForecastDay("Today", model.today)}
          ${renderForecastDay("Tomorrow", model.tomorrow)}
        </div>
        ${renderFireWeatherWarnings(model.fireWeatherWarnings)}
        ${
          isPresent(model.today.fbi) ||
          isPresent(model.tomorrow.fbi) ||
          model.fireWeatherWarnings.length > 0
            ? renderBomAttribution()
            : ""
        }
      </div>
    </details>
  `;
};

const fallbackReadiness = () => [
  { id: "plan", label: "Review your household bush fire survival plan", complete: null },
  { id: "alerts", label: "Keep official emergency alerts audible", complete: null },
  { id: "leave", label: "Know when, where, and how your household will leave", complete: null },
];

const renderReadiness = (model) => {
  const readiness = model.readiness.length ? model.readiness : fallbackReadiness();
  const completeCount = readiness.filter((item) => item.complete === true).length;
  const items = readiness
    .map((item) => {
      const stateClass = item.complete === true ? "complete" : "";
      const stateIcon = item.complete === true ? icon("check") : icon("shield");
      const label = escapeHtml(item.label);
      const control =
        item.entityId && item.entityId.startsWith("input_boolean.")
          ? `<button class="readiness-toggle touch-target" type="button" data-action="toggle-readiness" data-entity-id="${escapeHtml(
              item.entityId,
            )}" aria-pressed="${item.complete === true}">${label}</button>`
          : `<span>${label}</span>`;
      return `
        <li class="readiness-item">
          <span class="readiness-state ${stateClass}">${stateIcon}</span>
          ${control}
        </li>
      `;
    })
    .join("");
  return `
    <details class="info-drawer">
      <summary>
        <span class="drawer-title"><strong>Household readiness</strong><small>${completeCount} of ${readiness.length} checked</small></span>
        <span class="drawer-chevron">${icon("chevron")}</span>
      </summary>
      <div class="drawer-content">
        <p class="subtle small">Use your own bush fire survival plan. This dashboard does not decide whether it is safe to stay or leave.</p>
        <ul class="readiness-list">${items}</ul>
        <div class="incident-actions">
          <a class="button-link" href="${escapeHtml(model.feed.officialUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.feed.sourceName)} preparation guidance ${icon(
            "external",
          )}</a>
        </div>
      </div>
    </details>
  `;
};

const renderIncidentList = (model, showAll) => {
  const limit = Math.max(1, asNumber(model.config.max_incidents) || 10);
  const shown = showAll ? model.incidents : model.incidents.slice(0, limit);
  const hiddenCount = model.incidents.length - shown.length;
  const publisherHiddenCount = Math.max(0, model.incidentCount - model.incidents.length);
  let body;
  if (!shown.length) {
    body = `<div class="empty-state"><p>${escapeHtml(
      model.feed.stale
        ? "Live incident data is unavailable or delayed. Check official sources."
        : "No current incidents are shown in your configured radius.",
    )}</p></div>`;
  } else {
    body = `<ol class="incident-list">${shown.map((item) => `<li>${renderIncident(item)}</li>`).join("")}</ol>`;
  }
  const showAllButton = hiddenCount > 0
    ? `<button class="button" type="button" data-action="show-all-incidents">Show all ${model.incidents.length} incidents</button>`
    : "";
  return `
    <section class="surface" aria-labelledby="incidents-heading">
      <div class="section-heading">
        <h2 id="incidents-heading">Current incidents</h2>
        <span class="badge meta">${model.incidentCount}</span>
      </div>
      <p class="subtle small">Nearest first. The decision brief above keeps the highest official warning prominent even when it is farther away.</p>
      ${publisherHiddenCount ? `<p class="subtle small">Showing the ${model.incidents.length} nearest incidents of ${model.incidentCount}; use the official source for the complete live set.</p>` : ""}
      ${body}
      ${showAllButton ? `<div class="incident-actions">${showAllButton}</div>` : ""}
    </section>
  `;
};

const renderPlannedBurns = (model) => {
  if (!model.plannedBurns.length) return "";
  const publisherHiddenCount = Math.max(
    0,
    model.plannedBurnCount - model.plannedBurns.length,
  );
  return `
    <details class="info-drawer">
      <summary>
        <span class="drawer-title"><strong>Planned activity &amp; burn-offs</strong><small>${model.plannedBurnCount} reported in range</small></span>
        <span class="drawer-chevron">${icon("chevron")}</span>
      </summary>
      <div class="drawer-content">
        <p class="subtle small">Separated from active incidents so planned activity does not obscure official warnings.</p>
        ${publisherHiddenCount ? `<p class="subtle small">Showing the ${model.plannedBurns.length} nearest planned activities of ${model.plannedBurnCount}.</p>` : ""}
        <ol class="incident-list">
          ${model.plannedBurns.map((item) => `<li>${renderIncident(item)}</li>`).join("")}
        </ol>
      </div>
    </details>
  `;
};

const renderMapFallback = (
  message = "Loading the Home Assistant incident map…",
  officialUrl = DEFAULT_RFS_URL,
) => `
  <div class="map-fallback"><div>
    <p>${escapeHtml(message)}</p>
    <a class="button-link" href="${escapeHtml(
      safeUrl(officialUrl, DEFAULT_RFS_URL),
    )}" target="_blank" rel="noopener noreferrer">Open official Fires Near Me ${icon("external")}</a>
  </div></div>
`;

const renderCompactMap = () => `
  <section class="compact-map" aria-labelledby="compact-map-heading">
    <div class="compact-map-heading">
      <strong id="compact-map-heading">Incidents near home</strong>
      <span>Home Assistant map · local view</span>
    </div>
    <div id="incident-map" class="map-host compact-map-host" aria-label="Fire incidents near the monitored location">
      ${renderMapFallback()}
    </div>
  </section>
`;

const renderMap = () => `
  <section class="surface" aria-labelledby="map-heading">
    <div class="section-heading"><h2 id="map-heading">Incident map</h2>${icon("map")}</div>
    <p class="subtle small">Centred on your monitored location. Markers show reported locations, not fire spread, travel safety, or evacuation routes.</p>
    <div id="incident-map" class="map-host" aria-label="Official fire incident map">
      ${renderMapFallback()}
    </div>
  </section>
`;

const renderHealth = (model, busy) => {
  const status = model.feed.stale ? "Updates delayed or unavailable" : "Receiving updates";
  const statusClass = model.feed.stale ? "status-stale" : "status-fresh";
  const lastUpdate = model.feed.lastSuccessfulUpdate
    ? `${formatAbsolute(model.feed.lastSuccessfulUpdate)} (${formatRelative(
        model.feed.lastSuccessfulUpdate,
      )})`
    : "Not supplied";
  const alertAssignment =
    model.alertAssignment.configured === false
      ? "Not configured"
      : model.alertAssignment.count > 0
        ? `${model.alertAssignment.count} notification channel${
            model.alertAssignment.count === 1 ? "" : "s"
          }`
        : model.alertAssignment.configured === true
          ? "Configured"
          : "Status not supplied";
  return `
    <details class="info-drawer">
      <summary>
        <span class="drawer-title"><strong>Sources, alerts &amp; data health</strong><small>${escapeHtml(
          status,
        )} · ${escapeHtml(alertAssignment)}</small></span>
        <span class="drawer-chevron">${icon("chevron")}</span>
      </summary>
      <div class="drawer-content">
        <div class="health-grid">
        <div class="health-item"><span>Feed status</span><strong class="${statusClass}">${escapeHtml(
          status,
        )}</strong></div>
        <div class="health-item"><span>Last successful update</span><strong>${escapeHtml(
          lastUpdate,
        )}</strong></div>
        <div class="health-item"><span>Incident source</span><strong>${escapeHtml(
          model.feed.sourceName,
        )}</strong></div>
        <div class="health-item"><span>Assigned alert delivery</span><strong>${escapeHtml(
          alertAssignment,
        )}</strong></div>
        </div>
        ${model.feed.message ? `<p class="notice ${model.feed.stale ? "error" : ""}">${escapeHtml(model.feed.message)}</p>` : ""}
        <div class="official-links">
          <a class="button-link" href="${escapeHtml(
            model.feed.officialUrl,
          )}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(model.feed.sourceName)} ${icon("external")}</a>
          ${model.jurisdiction === "NSW" ? `<a class="button-link" href="${DEFAULT_RATINGS_URL}" target="_blank" rel="noopener noreferrer">Fire danger ratings ${icon("external")}</a><a class="button-link" href="${DEFAULT_BOM_URL}" target="_blank" rel="noopener noreferrer">BOM NSW warnings ${icon("external")}</a>` : ""}
        </div>
        <p class="source-attribution"><a href="${escapeHtml(
          model.feed.officialUrl,
        )}" target="_blank" rel="noopener noreferrer">${escapeHtml(
          model.feed.attribution,
        )}</a></p>
        <details>
          <summary>Test assigned alert delivery</summary>
          <p class="subtle small">Tests are clearly labelled and use your configured alert automation. They do not create an official warning.</p>
          <div class="test-controls">
            <a class="button-link" href="/config/integrations/integration/australian_fire_watch">Manage alert assignment</a>
            <button class="button" type="button" data-action="test-alert" data-level="advice" ${busy ? "disabled" : ""}>Test Advice</button>
            <button class="button" type="button" data-action="test-alert" data-level="watch_and_act" ${busy ? "disabled" : ""}>Test Watch and Act</button>
            <button class="button" type="button" data-action="test-alert" data-level="emergency_warning" ${busy ? "disabled" : ""}>Test Emergency Warning</button>
          </div>
        </details>
        <p class="disclaimer"><strong>Supplementary information only.</strong> Do not rely on Home Assistant as your only warning channel. Follow ${escapeHtml(model.feed.sourceName)}, your official emergency app, emergency services, and local radio. Warnings may not precede a fast-moving fire. In an emergency, call Triple Zero (000).</p>
        <p class="support-link">Like Australian Fire Watch? <a href="https://buymeacoffee.com/hallyaus" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>.</p>
      </div>
    </details>
  `;
};

class AustralianFireWatchBase extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._panel = null;
    this._signature = null;
    this._incidentMap = null;
    this._renderToken = 0;
    this._showAllIncidents = false;
    this._busy = false;
    this._notice = null;
    this._minuteTimer = null;
    this.shadowRoot.addEventListener("click", (event) => this._handleClick(event));
  }

  connectedCallback() {
    if (!this._minuteTimer) {
      this._minuteTimer = window.setInterval(() => this._render(true), 300_000);
    }
    this._render(true);
  }

  disconnectedCallback() {
    if (this._minuteTimer) window.clearInterval(this._minuteTimer);
    this._minuteTimer = null;
    this._destroyIncidentMap();
  }

  set hass(value) {
    this._hass = value;
    const model = normalizeModel(value, this._config);
    const readinessStates = model.readiness?.map((item) => [item.entityId, item.state]);
    let signature;
    try {
      signature = JSON.stringify({
        entity: model.entityId,
        state: model.summary?.state,
        updated: model.summary?.last_updated,
        attributes: model.summary?.attributes,
        readinessStates,
        config: this._config,
        notice: this._notice,
        busy: this._busy,
        showAll: this._showAllIncidents,
        refreshBucket: Math.floor(Date.now() / 300_000),
      });
    } catch (_error) {
      signature = `${Date.now()}`;
    }
    if (signature === this._signature) {
      if (this._incidentMap) this._incidentMap.hass = value;
      return;
    }
    this._signature = signature;
    this._render(false, model);
  }

  get hass() {
    return this._hass;
  }

  set panel(value) {
    this._panel = value;
    this._config = { ...(value?.config || {}) };
    this._signature = null;
    this._render(true);
  }

  get panel() {
    return this._panel;
  }

  set narrow(_value) {
    // Layout is driven by container width; property retained for the panel API.
  }

  set route(_value) {
    // The panel currently has one route; property retained for the panel API.
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Australian Fire Watch card configuration must be an object.");
    }
    this._config = { ...config };
    this._signature = null;
    this._render(true);
  }

  getCardSize() {
    if (asBoolean(this._config.compact) === true) {
      return this._config.show_map === true ? 8 : 4;
    }
    return 12;
  }

  _render(force = false, suppliedModel = null) {
    if (!this.isConnected && !force) return;
    const model = suppliedModel || normalizeModel(this._hass, this._config);
    const compact = asBoolean(this._config.compact) === true;
    const token = ++this._renderToken;
    this._destroyIncidentMap();

    if (!model.configured) {
      if (compact) {
        const setupMessage = model.connected
          ? "No Australian Fire Watch summary entity is available yet. Finish configuring the integration, then reload this page."
          : "Connecting to Home Assistant…";
        this.shadowRoot.innerHTML = `
          <style>${STYLES}</style>
          <main class="compact-shell">
            <section class="compact-card compact-setup" aria-labelledby="setup-heading">
              <span class="eyebrow">Australian Fire Watch</span>
              <h1 id="setup-heading">Finish integration setup</h1>
              <p>${escapeHtml(setupMessage)}</p>
              <a class="button-link primary" href="/config/integrations/integration/australian_fire_watch">Open integration settings</a>
              <p class="compact-disclaimer"><strong>Missing dashboard data does not mean conditions are safe.</strong></p>
            </section>
          </main>
        `;
        return;
      }
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>
        <main class="app-shell">
          <section class="surface setup" aria-labelledby="setup-heading">
            ${icon("fire")}
            <span class="eyebrow">Australian Fire Watch</span>
            <h1 id="setup-heading">Finish integration setup</h1>
            <p>${
              model.connected
                ? "No Australian Fire Watch summary entity is available yet. Add or finish configuring the integration, then reload this page."
                : "Connecting to Home Assistant…"
            }</p>
            <p class="subtle">If you have multiple monitored locations, set the card’s <code class="setup-code">entity: sensor.australian_fire_watch_…</code> option.</p>
            <a class="button-link primary" href="/config/integrations/integration/australian_fire_watch">Configure Australian Fire Watch</a>
            <p class="disclaimer"><strong>Do not treat missing dashboard data as safe.</strong> Continue to use your state or territory’s official warnings and emergency app.</p>
          </section>
        </main>
      `;
      return;
    }

    if (compact) {
      const showMap = this._config.show_map === true;
      this.shadowRoot.innerHTML = `
        <style>${STYLES}</style>
        ${renderCompact(model, this._config.title, showMap)}
      `;
      if (showMap) this._mountIncidentMap(model, token);
      return;
    }

    const showReadiness = this._config.show_readiness !== false;
    const showMap = this._config.show_map !== false;
    const notice = this._notice
      ? `<div class="notice ${this._notice.error ? "error" : ""}" role="status" aria-live="polite">${escapeHtml(
          this._notice.message,
        )}</div>`
      : `<div class="visually-hidden" aria-live="polite"></div>`;

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <main class="app-shell">
        <h1 class="visually-hidden">${escapeHtml(
          this._config.title || "Australian Fire Watch command centre",
        )}</h1>
        ${renderCommandNav(model, this._config.title)}
        ${notice}
        ${renderCommandBrief(model, this._busy)}
        <div class="operations-grid">
          ${showMap ? renderMap() : ""}
          ${renderIncidentList(model, this._showAllIncidents)}
        </div>
        <section class="surface detail-hub" aria-label="More fire information and settings">
          ${renderDangerDetails(model)}
          ${showReadiness ? renderReadiness(model) : ""}
          ${renderPlannedBurns(model)}
          ${renderHealth(model, this._busy)}
        </section>
      </main>
    `;

    if (showMap) this._mountIncidentMap(model, token);
  }

  _destroyIncidentMap() {
    this._incidentMap = null;
  }

  _showMapFailure(host, model) {
    this._destroyIncidentMap();
    if (!host?.isConnected) return;
    host.innerHTML = renderMapFallback(
      "The Home Assistant map is unavailable on this device. Incident status and distance remain available above.",
      model.feed.officialUrl,
    );
  }

  async _mountIncidentMap(model, token) {
    const host = this.shadowRoot.getElementById("incident-map");
    if (!host) return;
    try {
      if (typeof window.loadCardHelpers !== "function") {
        throw new Error("Home Assistant card helpers are unavailable");
      }
      const helpers = await window.loadCardHelpers();
      if (token !== this._renderToken || !host.isConnected) return;
      const entities = [];
      if (model.zoneEntityId) {
        entities.push({ entity: model.zoneEntityId, focus: true });
      }
      const seenIncidentIds = new Set();
      for (const incident of [
        model.priorityIncident,
        ...model.incidents,
        ...model.plannedBurns,
      ]) {
        if (!incident?.entityId || seenIncidentIds.has(incident.entityId)) continue;
        seenIncidentIds.add(incident.entityId);
        entities.push({ entity: incident.entityId, focus: false });
      }
      const mapCard = helpers.createCardElement({
        type: "map",
        entities,
        default_zoom: MAP_DEFAULT_ZOOM,
        auto_fit: false,
        fit_zones: false,
        hours_to_show: 0,
        cluster: true,
      });
      mapCard.hass = this._hass;
      host.replaceChildren(mapCard);
      this._incidentMap = mapCard;
    } catch (_error) {
      if (token !== this._renderToken) return;
      console.warn("Australian Fire Watch native map unavailable", _error);
      this._showMapFailure(host, model);
    }
  }

  async _handleClick(event) {
    const target = event.target.closest?.("[data-action]");
    if (!target || !this.shadowRoot.contains(target)) return;
    const action = target.dataset.action;

    if (action === "show-all-incidents") {
      this._showAllIncidents = true;
      this._signature = null;
      this._render(true);
      return;
    }

    if (action === "more-info") {
      this.dispatchEvent(
        new CustomEvent("hass-more-info", {
          bubbles: true,
          composed: true,
          detail: { entityId: target.dataset.entityId },
        }),
      );
      return;
    }

    if (action === "toggle-readiness") {
      const entityId = target.dataset.entityId;
      if (entityId?.startsWith("input_boolean.")) {
        await this._callService(
          "input_boolean",
          "toggle",
          { entity_id: entityId },
          "Readiness item updated.",
        );
      }
      return;
    }

    const model = normalizeModel(this._hass, this._config);
    const incidentId = target.dataset.incidentId;
    if (action === "acknowledge") {
      await this._callIntegrationService(
        "acknowledge",
        { incident_id: incidentId },
        "Alert acknowledged. Escalations will still notify you.",
        model,
      );
      return;
    }

    if (action === "snooze") {
      const duration = asNumber(this.shadowRoot.getElementById("snooze-duration")?.value);
      if (!duration) return;
      await this._callIntegrationService(
        "snooze",
        { incident_id: incidentId, duration_minutes: duration },
        `Reminders snoozed for ${duration} minutes. Any escalation will override the snooze.`,
        model,
      );
      return;
    }

    if (action === "test-alert") {
      const level = target.dataset.level;
      const label = warningLabel(level);
      if (!window.confirm(`Send a clearly labelled test ${label} notification?`)) return;
      await this._callIntegrationService(
        "test_alert",
        { level },
        `Test ${label} event sent to your assigned alert automation.`,
        model,
      );
    }
  }

  async _callIntegrationService(service, data, successMessage, model) {
    const serviceData = { ...data };
    if (model.entryId) serviceData.entry_id = model.entryId;
    await this._callService(DOMAIN, service, serviceData, successMessage);
  }

  async _callService(domain, service, data, successMessage) {
    if (!this._hass?.callService || this._busy) return;
    this._busy = true;
    this._notice = { message: "Sending request…", error: false };
    this._signature = null;
    this._render(true);
    try {
      await this._hass.callService(domain, service, data);
      this._notice = { message: successMessage, error: false };
    } catch (error) {
      this._notice = {
        message: `Request failed: ${error?.message || "Home Assistant did not accept the service call."}`,
        error: true,
      };
    } finally {
      this._busy = false;
      this._signature = null;
      this._render(true);
    }
  }
}

class AustralianFireWatchPanel extends AustralianFireWatchBase {}

class AustralianFireWatchCard extends AustralianFireWatchBase {
  static getConfigElement() {
    return document.createElement("australian-fire-watch-card-editor");
  }

  static getStubConfig(hass) {
    const entity = entityIdForState(hass, discoverSummaryEntity(hass));
    return entity ? { entity } : {};
  }
}

class AustralianFireWatchCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
  }

  setConfig(config) {
    this._config = { ...(config || {}) };
    this._render();
  }

  set hass(value) {
    this._hass = value;
    this._render();
  }

  _render() {
    const candidates = this._hass
      ? Object.entries(this._hass.states)
          .filter(([entityId, state]) =>
            entityId.startsWith("sensor.") &&
            (state.attributes?.integration === DOMAIN || entityId.includes("australian_fire_watch")),
          )
          .map(([entityId, state]) => [
            entityId,
            state.attributes?.friendly_name || entityId,
          ])
      : [];
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; padding: 12px 0; color: var(--primary-text-color); font: 16px/1.4 system-ui, sans-serif; }
        label { display: grid; gap: 5px; margin-bottom: 12px; font-weight: 700; }
        input, select { min-height: 44px; padding: 8px 10px; border: 1px solid var(--divider-color); border-radius: 8px; background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
        .check { display: flex; align-items: center; gap: 9px; min-height: 44px; }
        .check input { width: 22px; min-height: 22px; }
        p { color: var(--secondary-text-color); }
      </style>
      <p>Select the summary entity created for the monitored location.</p>
      <label>Summary entity
        <select id="entity">
          <option value="">Auto-discover</option>
          ${candidates
            .map(
              ([entityId, name]) =>
                `<option value="${escapeHtml(entityId)}" ${this._config.entity === entityId ? "selected" : ""}>${escapeHtml(
                  name,
                )} (${escapeHtml(entityId)})</option>`,
            )
            .join("")}
        </select>
      </label>
      <label>Dashboard title
        <input id="title" type="text" value="${escapeHtml(
          this._config.title || "Australian Fire Watch",
        )}" />
      </label>
      <label class="check"><input id="compact" type="checkbox" ${
        asBoolean(this._config.compact) === true ? "checked" : ""
      } /> Compact Home-card mode</label>
      <label class="check"><input id="show-map" type="checkbox" ${
        this._config.show_map !== false ? "checked" : ""
      } /> Show incident map</label>
      <label class="check"><input id="show-readiness" type="checkbox" ${
        this._config.show_readiness !== false ? "checked" : ""
      } /> Show household readiness</label>
    `;
    this.shadowRoot.querySelectorAll("input, select").forEach((element) => {
      element.addEventListener("change", () => this._changed());
    });
  }

  _changed() {
    const entity = this.shadowRoot.getElementById("entity")?.value;
    const title = this.shadowRoot.getElementById("title")?.value;
    const config = {
      ...this._config,
      ...(entity ? { entity } : {}),
      title: title || "Australian Fire Watch",
      compact: this.shadowRoot.getElementById("compact")?.checked === true,
      show_map: this.shadowRoot.getElementById("show-map")?.checked !== false,
      show_readiness:
        this.shadowRoot.getElementById("show-readiness")?.checked !== false,
    };
    if (!entity) delete config.entity;
    this._config = config;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        bubbles: true,
        composed: true,
        detail: { config },
      }),
    );
  }
}

class AustralianFireWatchDashboardStrategy extends HTMLElement {
  static noEditor = true;

  static getCreateSuggestions(_hass) {
    return {
      title: "Australian Fire Watch",
      icon: "mdi:fire-alert",
    };
  }

  static async generate(config, hass) {
    const entity = firstPresent(
      config.entity,
      entityIdForState(hass, discoverSummaryEntity(hass)),
    );
    const cardConfig = {
      type: "custom:australian-fire-watch-card",
      ...(entity ? { entity } : {}),
      title: firstPresent(config.card_title, "Australian Fire Watch"),
      show_map: config.show_map !== false,
      show_readiness: config.show_readiness !== false,
      ...(config.zone_entity ? { zone_entity: config.zone_entity } : {}),
      ...(config.geo_location_source
        ? { geo_location_source: config.geo_location_source }
        : {}),
      ...(config.readiness_entities
        ? { readiness_entities: config.readiness_entities }
        : {}),
    };
    return {
      title: firstPresent(config.title, "Australian Fire Watch"),
      views: [
        {
          title: "Fire Watch",
          path: "fire-watch",
          icon: "mdi:fire-alert",
          type: "panel",
          cards: [cardConfig],
        },
      ],
    };
  }
}

const elementTagName = (element) =>
  String(element?.localName || element?.tagName || "").toLowerCase();

const composedElements = (root) => {
  const elements = [];
  const visited = new Set();
  const pending = [root];
  for (let index = 0; index < pending.length; index += 1) {
    const current = pending[index];
    if (!current || visited.has(current)) continue;
    visited.add(current);
    if (elementTagName(current)) elements.push(current);
    if (current.shadowRoot) pending.push(current.shadowRoot);
    if (current.children) pending.push(...Array.from(current.children));
  }
  return elements;
};

const isMissingFireWatchElementError = (element) => {
  if (elementTagName(element) !== "hui-error-card") return false;
  const config = element._config || element.config || {};
  const rawMessage = config.message ?? config.error ?? element.message;
  const message = rawMessage instanceof Error ? rawMessage.message : rawMessage;
  return /^custom element (?:doesn't exist|not found): australian-fire-watch-card\.?$/i.test(
    String(message || "").trim(),
  );
};

const dispatchFireWatchRebuild = (element) => {
  if (!element || typeof element.dispatchEvent !== "function") return false;
  try {
    element.dispatchEvent(
      new CustomEvent("ll-rebuild", { bubbles: true, composed: true }),
    );
    return true;
  } catch (error) {
    console.warn("Australian Fire Watch could not request a Lovelace card rebuild", error);
    return false;
  }
};

const recoverFailedFireWatchCards = (root = document) => {
  const elements = composedElements(root);
  let recovered = 0;
  for (const wrapper of elements) {
    if (elementTagName(wrapper) !== "hui-card") continue;
    const config = wrapper.config || wrapper._config || {};
    const errorElement = wrapper._element;
    if (
      config.type !== FIRE_WATCH_CARD_TYPE ||
      !isMissingFireWatchElementError(errorElement) ||
      fireWatchRecoveryAttempts.has(wrapper) ||
      fireWatchRecoveryAttempts.has(errorElement)
    ) {
      continue;
    }
    if (dispatchFireWatchRebuild(errorElement)) {
      fireWatchRecoveryAttempts.add(wrapper);
      fireWatchRecoveryAttempts.add(errorElement);
      recovered += 1;
    }
  }
  for (const errorElement of elements) {
    if (
      !isMissingFireWatchElementError(errorElement) ||
      fireWatchRecoveryAttempts.has(errorElement) ||
      errorElement.isConnected === false
    ) {
      continue;
    }
    if (dispatchFireWatchRebuild(errorElement)) {
      fireWatchRecoveryAttempts.add(errorElement);
      recovered += 1;
    }
  }
  return recovered;
};

const scheduleFireWatchCardRecovery = () => {
  if (window[FIRE_WATCH_RECOVERY_FLAG]) return;
  window[FIRE_WATCH_RECOVERY_FLAG] = true;
  for (const delay of FIRE_WATCH_RECOVERY_DELAYS) {
    window.setTimeout(() => recoverFailedFireWatchCards(), delay);
  }
};

const defineElement = (name, constructor) => {
  if (!customElements.get(name)) customElements.define(name, constructor);
};

defineElement("australian-fire-watch-panel", AustralianFireWatchPanel);
defineElement(FIRE_WATCH_CARD_TAG, AustralianFireWatchCard);
scheduleFireWatchCardRecovery();
defineElement("australian-fire-watch-card-editor", AustralianFireWatchCardEditor);
defineElement("ll-strategy-dashboard-australian-fire-watch", AustralianFireWatchDashboardStrategy);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "australian-fire-watch-card")) {
  window.customCards.push({
    type: "australian-fire-watch-card",
    name: "Australian Fire Watch",
    description:
      "Mobile-first Australian fire incident, readiness, and alert dashboard.",
    preview: true,
    documentationURL: "https://github.com/hallyaus/australian-fire-watch",
  });
}

window.customStrategies = window.customStrategies || [];
if (!window.customStrategies.some((strategy) => strategy.type === "australian-fire-watch")) {
  window.customStrategies.push({
    type: "australian-fire-watch",
    strategyType: "dashboard",
    name: "Australian Fire Watch",
    description:
      "A severity-first dashboard for official Australian fire incidents and assigned alerts.",
    documentationURL: "https://github.com/hallyaus/australian-fire-watch",
  });
}

console.info(
  "%c AUSTRALIAN FIRE WATCH %c frontend loaded",
  "background:#b91c1c;color:white;font-weight:800;padding:3px 6px;border-radius:4px 0 0 4px",
  "background:#17212b;color:white;padding:3px 6px;border-radius:0 4px 4px 0",
);
