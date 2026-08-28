"""The Health Bridge integration."""
from __future__ import annotations

import logging
import math
import os
import re
from datetime import datetime, timezone
import voluptuous as vol

from aiohttp import web

from homeassistant.const import CONF_TOKEN, Platform
from homeassistant.components import webhook, persistent_notification, frontend
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import config_validation as cv
from homeassistant.config_entries import ConfigEntry

from .const import DOMAIN, METRIC_ATTRIBUTES_MAP
from .history_backfill import (
    BACKFILL_PROTOCOL_VERSION,
    BackfillCompatibilityError,
    BackfillEntityNotReadyError,
    BackfillUnavailableError,
    BackfillValidationError,
    async_commit_backfill,
    validate_backfill_series,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: vol.Schema({vol.Required(CONF_TOKEN): cv.string})},
    extra=vol.ALLOW_EXTRA,
)

# Built-in Lovelace cards. Bump CARD_VERSION whenever the JS changes so the
# `?v=` query busts the browser cache (same lesson as the promo-site deploy).
CARD_VERSION = "0.4.8"
_CARD_URL = "/health_bridge/health-bridge-cards.js"


class HealthBridgeCardView(HomeAssistantView):
    """Serve the built-in cards bundle with no-store caching.

    Static paths let browsers heuristically cache the module, so during active
    development a same-URL edit could be served stale (or mid-edit/broken),
    showing "custom element doesn't exist". no-store forces a fresh fetch on
    every page load, so edits always appear after a normal refresh.
    """

    requires_auth = False
    url = _CARD_URL
    name = "health_bridge:cards"

    def __init__(self, file_path: str) -> None:
        self._file_path = file_path

    async def get(self, request):
        return web.FileResponse(
            self._file_path,
            headers={
                "Cache-Control": "no-store, max-age=0",
                "Content-Type": "text/javascript",
            },
        )

# --- Sleep helpers / config ---------------------------------------------------
# Add near the top (module-level constant)
_LAST_SYNC_MIN_INTERVAL_SECONDS = 10
_LIVE_PROTOCOL_VERSION = 1
_LIVE_REQUEST_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")
def _normalize_sleep_to_hours(v):
    """Assume input is seconds; return float hours rounded to 2 decimals."""
    try:
        v = float(v)
    except (TypeError, ValueError):
        return v
    return round(v / 3600.0, 2)

# Sleep metrics that should be stored as HOURS
_SLEEP_HOUR_KEYS = {
    "sleep_duration",
    "sleep_rem_hours",
    "sleep_core_hours",   # Apple's “Core” ≈ light
    "sleep_deep_hours",
    "sleep_awake_hours",
    "sleep_unspecified_hours",
}

# Metrics whose raw value arrives as a 0..1 fraction and must be scaled to a
# 0..100 percentage (and clamped).
_PERCENT_0_1_KEYS = {
    "body_fat_percentage",
    "walking_asymmetry_percentage",
    "walking_double_support_percentage",
    "oxygen_saturation",
    "walking_steadiness",
}


def _normalize_metric_value(metric_name, value):
    """Normalize a raw datapoint value to the sensor's native scale.

    Mirrors exactly the per-metric conversions applied to the live state so that
    back-filled history points sit on the same scale as the current value.
    """
    if value is None:
        return value

    if metric_name in _PERCENT_0_1_KEYS:
        try:
            v = float(value)
        except (TypeError, ValueError):
            return value
        if 0.0 <= v <= 1.0:
            return v * 100.0
        if v < 0.0:
            return 0.0
        if v > 100.0:
            return 100.0
        return value  # already a native 0..100 percentage — leave untouched

    if metric_name in _SLEEP_HOUR_KEYS:
        return _normalize_sleep_to_hours(value)

    return value


def _parse_epoch(value):
    """Parse a datapoint timestamp (ISO-8601 string or number) to epoch seconds."""
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        except ValueError:
            return None
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.timestamp()
    return None


def _backfill_error(message: str, status: int, code: str) -> web.Response:
    """Return a stable, machine-readable backfill failure response."""
    return web.json_response(
        {
            "ok": False,
            "committed": False,
            "protocol_version": BACKFILL_PROTOCOL_VERSION,
            "error": code,
            "message": message,
        },
        status=status,
    )


def _resolve_backfill_entity_id(
    hass: HomeAssistant, user_id: str, metric_name: str
) -> str | None:
    """Resolve the entity actually registered for a metric without creating it."""
    unique_id = f"{DOMAIN}_{metric_name}_{user_id}"
    registry_entity_id = er.async_get(hass).async_get_entity_id(
        "sensor", DOMAIN, unique_id
    )
    if registry_entity_id:
        return registry_entity_id

    runtime_entity_id = (
        hass.data.get(DOMAIN, {})
        .get("entities", {})
        .get(user_id, {})
        .get(metric_name)
    )
    if runtime_entity_id:
        return runtime_entity_id
    return None


def _prepare_backfill_batch(hass: HomeAssistant, data: dict, user_id: str):
    """Strictly validate and normalize an explicit backfill request."""
    if not isinstance(user_id, str) or not user_id or len(user_id) > 128:
        raise BackfillValidationError("user_id must be a non-empty string")
    if data.get("protocol_version") != BACKFILL_PROTOCOL_VERSION:
        raise BackfillValidationError(
            f"protocol_version must be {BACKFILL_PROTOCOL_VERSION}"
        )

    health_data = data.get("data")
    if not isinstance(health_data, dict) or not health_data:
        raise BackfillValidationError("backfill data must be a non-empty object")

    series_by_entity: dict[str, list[tuple[float, float]]] = {}
    for metric_name, datapoints in health_data.items():
        attrs = METRIC_ATTRIBUTES_MAP.get(metric_name)
        if not attrs or not attrs.get("state_class"):
            raise BackfillValidationError(
                f"metric '{metric_name}' is not eligible for numeric history backfill"
            )
        if not isinstance(datapoints, list):
            raise BackfillValidationError(
                f"metric '{metric_name}' must contain an array of datapoints"
            )

        entity_id = _resolve_backfill_entity_id(hass, user_id, metric_name)
        if entity_id is None:
            raise BackfillEntityNotReadyError(
                f"metric '{metric_name}' does not have a live sensor yet"
            )

        points: list[tuple[float, float]] = []
        for datapoint in datapoints:
            if not isinstance(datapoint, dict):
                raise BackfillValidationError(
                    f"metric '{metric_name}' contains a malformed datapoint"
                )
            timestamp = _parse_epoch(datapoint.get("timestamp"))
            if timestamp is None:
                raise BackfillValidationError(
                    f"metric '{metric_name}' contains an invalid timestamp"
                )
            try:
                value = float(
                    _normalize_metric_value(metric_name, datapoint.get("value"))
                )
            except (TypeError, ValueError) as exc:
                raise BackfillValidationError(
                    f"metric '{metric_name}' contains a non-numeric value"
                ) from exc
            if not math.isfinite(value):
                raise BackfillValidationError(
                    f"metric '{metric_name}' contains a non-finite value"
                )
            points.append((timestamp, value))

        series_by_entity[entity_id] = points

    return validate_backfill_series(data.get("request_id"), series_by_entity)


async def _handle_backfill_webhook(
    hass: HomeAssistant, data: dict, user_id: str
) -> web.Response:
    """Commit an explicit backfill request and acknowledge only after commit."""
    try:
        batch = _prepare_backfill_batch(hass, data, user_id)
        result = await async_commit_backfill(hass, batch)
    except BackfillValidationError as exc:
        return _backfill_error(str(exc), 422, "invalid_backfill")
    except BackfillEntityNotReadyError as exc:
        return _backfill_error(str(exc), 503, "entity_not_ready")
    except BackfillCompatibilityError as exc:
        return _backfill_error(str(exc), 409, "unsupported_recorder")
    except BackfillUnavailableError as exc:
        return _backfill_error(str(exc), 503, "recorder_unavailable")
    except Exception:
        _LOGGER.exception(
            "Health Bridge: backfill commit failed request=%s",
            data.get("request_id", "invalid"),
        )
        return _backfill_error(
            "recorder commit failed", 500, "backfill_commit_failed"
        )

    return web.json_response(result.as_dict())

# Pretty display names for specific metrics (enforced each sync)
_DISPLAY_NAME_OVERRIDES = {
    "sleep_duration": "Sleep Duration",
    "sleep_rem_hours": "REM Sleep Duration",
    "sleep_core_hours": "Light Sleep Duration",
    "sleep_deep_hours": "Deep Sleep Duration",
    "sleep_awake_hours": "Sleep Awake Duration",
    "sleep_unspecified_hours": "Unspecified Sleep Duration",
    "sleep_details": "Sleep Details",
    "last_sync_time": "Last Sync Time",
    "uv_index": "UV Index",
    "time_in_daylight": "Time in Daylight",
    "uv_exposure_sed": "UV Exposure",
    "asleep_time": "Asleep Time",
    "wake_time": "Wake Time",
    "net_calories": "Net Calories",
    "last_apple_workout": "Last Apple Workout",
}

# --- Setup / teardown ---------------------------------------------------------

async def _load_integration_version(hass: HomeAssistant) -> None:
    """Cache the running integration version so the app can compare it against the
    latest published on GitHub and prompt the user to update when behind."""
    hass.data.setdefault(DOMAIN, {})
    try:
        from homeassistant.loader import async_get_integration
        integration = await async_get_integration(hass, DOMAIN)
        hass.data[DOMAIN]["integration_version"] = str(integration.version)
    except Exception:  # noqa: BLE001 - version is best-effort, never block setup
        hass.data[DOMAIN].setdefault("integration_version", None)


async def async_setup(hass: HomeAssistant, config) -> bool:
    if DOMAIN not in config:
        return True
    token = config[DOMAIN].get(CONF_TOKEN)
    if not token:
        _LOGGER.error("Health Bridge: Token missing in YAML config")
        return False

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["token"] = token
    hass.data[DOMAIN].setdefault("entities", {})
    await _load_integration_version(hass)
    _setup_webhook(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    _LOGGER.debug("Health Bridge: Setting up config entry %s", entry.entry_id)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["token"] = entry.data[CONF_TOKEN]
    hass.data[DOMAIN]["entry_id"] = entry.entry_id
    hass.data[DOMAIN].setdefault("entities", {})
    await _load_integration_version(hass)

    # Ensure the sensor platform is loaded so add_sensor/update_sensor are available
    await hass.config_entries.async_forward_entry_setups(entry, [Platform.SENSOR])

    _setup_webhook(hass)
    await _register_frontend(hass)
    return True


async def _register_frontend(hass: HomeAssistant) -> None:
    """Serve and auto-load the built-in Lovelace cards (no HACS resource needed).

    Registration is process-lifetime (a static path + a global extra-JS URL), so
    it's guarded to run once and is intentionally best-effort: the cards are a
    convenience and must never block the integration from setting up.
    """
    data = hass.data.setdefault(DOMAIN, {})
    if data.get("frontend_registered"):
        return
    try:
        card_file = os.path.join(
            os.path.dirname(__file__), "cards", "health-bridge-cards.js"
        )
        # no-store view (never cached) — edits always load on a normal refresh.
        hass.http.register_view(HealthBridgeCardView(card_file))
        # A version token is still handy for the log/URL; caching is off anyway.
        try:
            token = f"{CARD_VERSION}.{int(os.path.getmtime(card_file))}"
        except OSError:
            token = CARD_VERSION
        frontend.add_extra_js_url(hass, f"{_CARD_URL}?v={token}")
        data["frontend_registered"] = True
        _LOGGER.info(
            "Health Bridge: registered built-in dashboard cards v%s", CARD_VERSION
        )
    except Exception as exc:  # cards are non-critical; never block setup
        _LOGGER.warning(
            "Health Bridge: could not register dashboard cards: %s", exc, exc_info=True
        )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # Unload the platform we forwarded in setup — without this, reloading the
    # entry forwards Platform.SENSOR a second time and HA raises
    # "Config entry ... has already been set up!".
    unload_ok = await hass.config_entries.async_unload_platforms(entry, [Platform.SENSOR])

    if unload_ok:
        domain_data = hass.data.get(DOMAIN, {})

        # Unregister the webhook so setup re-registers cleanly on reload.
        if domain_data.get("webhook_registered"):
            try:
                webhook.async_unregister(hass, "health_bridge")
            except (ValueError, KeyError):
                pass
            domain_data["webhook_registered"] = False

        # Drop per-entry runtime state so a subsequent setup rebuilds it and
        # the sensor platform recreates entities from the registry.
        for key in ("token", "add_sensor", "update_sensor", "entity_objs", "entities"):
            domain_data.pop(key, None)

    return unload_ok


async def async_remove_config_entry_device(
    hass: HomeAssistant, config_entry: ConfigEntry, device_entry: dr.DeviceEntry
) -> bool:
    """Allow a Health Bridge device to be removed from the device page."""
    return await async_delete_device_for_entry(hass, config_entry, device_entry.id)


# --- Webhook ------------------------------------------------------------------

def _setup_webhook(hass: HomeAssistant) -> None:
    if hass.data.get(DOMAIN, {}).get("webhook_registered"):
        return

    async def handle_webhook(hass: HomeAssistant, webhook_id: str, request):
        try:
            data = await request.json()
        except Exception as exc:
            _LOGGER.error("Health Bridge: Webhook JSON parse error: %s", exc, exc_info=True)
            return None
        if not isinstance(data, dict):
            return web.json_response(
                {"ok": False, "error": "invalid_payload"}, status=400
            )

        stored_token = hass.data.get(DOMAIN, {}).get("token")
        received_token = data.get("token")
        user_id = data.get("user_id", "unknown")

        # Normalize: an accidental trailing space (in the app field OR the
        # integration config) must not silently reject every sync.
        stored_norm = stored_token.strip() if isinstance(stored_token, str) else ""
        received_norm = received_token.strip() if isinstance(received_token, str) else ""

        # Authenticate BEFORE touching any state. Reject if no token is
        # configured (can't authenticate) or the token doesn't match, and
        # return HTTP 401 so the client sees a real failure instead of a 200.
        if not stored_norm or received_norm != stored_norm:
            # Privacy-safe diagnostics (never log the secret itself):
            #  stored_present=False -> integration didn't load a token at setup
            #  differing lengths    -> whitespace/typo in one side
            _LOGGER.warning(
                "Health Bridge: rejecting payload — token mismatch "
                "(stored_present=%s stored_len=%d received_len=%d)",
                bool(stored_norm), len(stored_norm), len(received_norm),
            )
            return web.Response(status=401, text="invalid token")

        request_type = data.get("request_type") or "live"
        if request_type == "backfill":
            return await _handle_backfill_webhook(hass, data, user_id)
        if request_type != "live":
            return web.json_response(
                {"ok": False, "error": "unsupported_request_type"}, status=422
            )

        health_data = data.get("data", {}) or {}
        if not isinstance(health_data, dict):
            return web.json_response(
                {"ok": False, "error": "invalid_health_data"}, status=422
            )

        # New clients require a request-matched acknowledgement. Legacy live
        # payloads remain supported, but an explicitly versioned request must
        # provide valid metadata so a generic HTTP 2xx can never be mistaken
        # for an applied sync.
        request_id = data.get("request_id")
        protocol_version = data.get("protocol_version")
        explicit_live_ack = request_id is not None or protocol_version is not None
        if explicit_live_ack:
            if protocol_version != _LIVE_PROTOCOL_VERSION:
                return web.json_response(
                    {"ok": False, "error": "unsupported_live_protocol"}, status=422
                )
            if not isinstance(request_id, str) or not _LIVE_REQUEST_ID_RE.fullmatch(request_id):
                return web.json_response(
                    {"ok": False, "error": "invalid_request_id"}, status=422
                )

        if "test_connection" in health_data:
            persistent_notification.async_create(
                hass,
                "Health Bridge connection successful!",
                title="Health Bridge",
                notification_id="health_bridge_test_success",
            )
            return web.json_response(
                {
                    "ok": True,
                    "integration_version": hass.data.get(DOMAIN, {}).get("integration_version"),
                    "backfill_protocol": BACKFILL_PROTOCOL_VERSION,
                    "backfill_ack": "committed",
                    "statistics_policy": "history_only",
                }
            )

        if not health_data:
            _LOGGER.debug("Health Bridge: Webhook had no health data")
            return web.json_response(
                {"ok": False, "error": "empty_health_data"}, status=422
            )

        # Ensure device exists
        device_registry = dr.async_get(hass)
        device = device_registry.async_get_or_create(
            config_entry_id=hass.data.get(DOMAIN, {}).get("entry_id"),
            identifiers={(DOMAIN, f"health_bridge_{user_id}")},
            name=f"Health Bridge ({user_id})",
            manufacturer="Health Bridge",
            model="Health Tracker",
            sw_version="1.0",
        )

        # Callbacks from the sensor platform (sensor.py)
        add_sensor = hass.data.get(DOMAIN, {}).get("add_sensor")
        update_sensor = hass.data.get(DOMAIN, {}).get("update_sensor")
        if not add_sensor:
            _LOGGER.warning("Health Bridge: sensor platform not ready (no add_sensor); dropping payload")
            return web.json_response(
                {"ok": False, "error": "sensor_platform_not_ready"}, status=503
            )

        entity_registry = er.async_get(hass)
        user_entities = hass.data[DOMAIN]["entities"].setdefault(user_id, {})

        # Medications (iOS 26+) arrive as an array of per-medication dicts — not
        # {timestamp, value} datapoints — so handle them before the generic loop.
        # One TEXT sensor per medication: state = pending/partial/taken, and every
        # other field (taken, scheduled, dose_taken, unit, summary…) as attributes.
        health_data = dict(health_data)
        received_entities = len(health_data)
        applied_entities = 0
        skipped_entities = 0
        medications = health_data.pop("medications", None)
        if isinstance(medications, list):
            for med in medications:
                if not isinstance(med, dict):
                    continue
                med_id = med.get("id")
                state = med.get("state")
                if not med_id or state is None:
                    continue

                metric_name = f"medication_{med_id}"
                med_attrs = {k: v for k, v in med.items() if k not in ("id", "state")}
                display = med.get("name") or str(med_id).replace("_", " ").title()

                unique_id = f"{DOMAIN}_{metric_name}_{user_id}"
                suggested_object_id = f"{metric_name}_{user_id}"
                entity_id = f"sensor.{suggested_object_id}"

                entry = entity_registry.async_get(entity_id)
                if entry is None:
                    entry = entity_registry.async_get_or_create(
                        domain="sensor",
                        platform=DOMAIN,
                        unique_id=unique_id,
                        suggested_object_id=suggested_object_id,
                        device_id=device.id,
                        original_name=f"Medication: {display} ({user_id})",
                    )

                if metric_name not in user_entities:
                    # Empty attrs => plain text sensor (no device_class/state_class/unit).
                    add_sensor(user_id, metric_name, {}, state, None, med_attrs)
                    user_entities[metric_name] = entry.entity_id
                    applied_entities += 1
                elif update_sensor:
                    update_sensor(user_id, metric_name, state, None, med_attrs)
                    applied_entities += 1
                else:
                    skipped_entities += 1
        elif medications is not None:
            skipped_entities += 1

        for metric_name, datapoints in health_data.items():
            if not datapoints:
                skipped_entities += 1
                continue

            # Workouts arrive as a single dict. The state is a human-readable
            # composite (type + breakdown); every field is also kept as an
            # attribute so automations/cards read clean values, not the string.
            workout_attrs = None
            if metric_name == "last_apple_workout":
                payload = datapoints[-1] or {}
                latest_value = _compose_workout_state(payload)
                latest_timestamp = payload.get("last_synced") or payload.get("end_time")
                workout_attrs = dict(payload)
            else:
                latest_value = datapoints[-1].get("value")
                latest_timestamp = datapoints[-1].get("timestamp")

            if latest_value is None:
                skipped_entities += 1
                continue

            # Normalize to the sensor's native scale (percent 0..1 -> 0..100 and
            # clamp; sleep seconds -> hours). The same helper feeds the history
            # back-fill below so current value and history stay on one scale.
            latest_value = _normalize_metric_value(metric_name, latest_value)

            # Attributes from const map; ensure native unit key present if legacy key used
            attrs = METRIC_ATTRIBUTES_MAP.get(metric_name, {}).copy()
            if "native_unit_of_measurement" not in attrs and "unit_of_measurement" in attrs:
                attrs["native_unit_of_measurement"] = attrs["unit_of_measurement"]

            unique_id = f"{DOMAIN}_{metric_name}_{user_id}"
            suggested_object_id = f"{metric_name}_{user_id}"
            entity_id = f"sensor.{suggested_object_id}"

            # --- Ensure the registry entry exists
            entry = entity_registry.async_get(entity_id)
            if entry is None:
                entry = entity_registry.async_get_or_create(
                    domain="sensor",
                    platform=DOMAIN,
                    unique_id=unique_id,
                    suggested_object_id=suggested_object_id,
                    device_id=device.id,
                    original_name=f"{_DISPLAY_NAME_OVERRIDES.get(metric_name, metric_name.replace('_', ' ').title())} ({user_id})",
                )

            # --- Ensure runtime entity exists and update
            if metric_name not in user_entities:
                # Create runtime entity via sensor platform
                add_sensor(
                    user_id,
                    metric_name,
                    attrs,
                    latest_value,
                    latest_timestamp,
                    workout_attrs,
                )
                user_entities[metric_name] = entry.entity_id
                applied_entities += 1
            else:
                if update_sensor:
                    update_sensor(
                        user_id,
                        metric_name,
                        latest_value,
                        latest_timestamp,
                        workout_attrs,
                    )
                    applied_entities += 1
                else:
                    skipped_entities += 1

        if applied_entities == 0:
            _LOGGER.warning(
                "Health Bridge: live request %s applied no entities (received=%d skipped=%d)",
                request_id or "legacy", received_entities, skipped_entities,
            )
            return web.json_response(
                {
                    "ok": False,
                    "applied": False,
                    "error": "no_entities_applied",
                    "request_type": "live",
                    "protocol_version": _LIVE_PROTOCOL_VERSION,
                    "request_id": request_id,
                    "received_entities": received_entities,
                    "updated_entities": 0,
                    "skipped_entities": skipped_entities,
                },
                status=422,
            )

        # This is a commit marker, not an attempt marker: move it only after at
        # least one runtime entity accepted a value.
        last_sync_updated = _update_last_sync_time_entity(hass, user_id=user_id)
        return web.json_response(
            {
                "ok": True,
                "applied": True,
                "integration_version": hass.data.get(DOMAIN, {}).get("integration_version"),
                "request_type": "live",
                "protocol_version": _LIVE_PROTOCOL_VERSION,
                "request_id": request_id,
                "received_entities": received_entities,
                "updated_entities": applied_entities,
                "skipped_entities": skipped_entities,
                "last_sync_updated": last_sync_updated,
            }
        )

    webhook.async_register(hass, DOMAIN, "Health Bridge", "health_bridge", handle_webhook)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["webhook_registered"] = True
    _LOGGER.info("Health Bridge webhook registered")


# --- Helpers ------------------------------------------------------------------

def _compose_workout_state(payload: dict) -> str | None:
    """Build the workout sensor's state: '<Type> · <duration> · <distance?> ·
    <energy?> · <avg HR?>'. Optional fields are included only when present, so
    it degrades gracefully across every workout type (a strength session simply
    has no distance). Returns None if there's no workout type to key on."""
    workout_type = payload.get("workout_type")
    if not workout_type:
        return None

    parts: list[str] = [str(workout_type)]

    duration = payload.get("duration_min")
    if duration is not None:
        parts.append(f"{int(round(float(duration)))} min")

    distance_km = payload.get("distance_km")
    if distance_km:
        parts.append(f"{distance_km} km")

    energy = payload.get("active_energy_kcal")
    if energy:
        parts.append(f"{int(round(float(energy)))} kcal")

    avg_hr = payload.get("average_heart_rate_bpm")
    if avg_hr:
        parts.append(f"{int(round(float(avg_hr)))} bpm")

    return " · ".join(parts)


async def async_delete_device_for_entry(
    hass: HomeAssistant, config_entry: ConfigEntry, device_id: str
) -> bool:
    """Delete a Health Bridge device and clean up its entities/runtime state."""
    device_registry = dr.async_get(hass)
    entity_registry = er.async_get(hass)

    device = device_registry.async_get(device_id)
    if device is None:
        return False

    user_id = _get_user_id_from_device(device)

    for entity_entry in list(er.async_entries_for_device(entity_registry, device_id)):
        hass.states.async_remove(entity_entry.entity_id)
        entity_registry.async_remove(entity_entry.entity_id)

    device_registry.async_remove_device(device_id)

    domain_data = hass.data.get(DOMAIN, {})
    if user_id is not None:
        domain_data.get("entities", {}).pop(user_id, None)
        domain_data.get("entity_objs", {}).pop(user_id, None)

    return True


def _get_user_id_from_device(device: dr.DeviceEntry) -> str | None:
    """Extract the Health Bridge user id from a device registry entry."""
    for domain, identifier in device.identifiers:
        if domain == DOMAIN and identifier.startswith("health_bridge_"):
            return identifier.removeprefix("health_bridge_")
    return None

def _update_last_sync_time_entity(hass: HomeAssistant, user_id: str) -> bool:
    """Create/update per-user last_sync_time entity, but only if ≥10s since last update."""
    try:
        metric_name = "last_sync_time"
        unique_id = f"{DOMAIN}_{metric_name}_{user_id}"
        suggested_object_id = f"{metric_name}_{user_id}"
        entity_id = f"sensor.{suggested_object_id}"

        # --- Smoothing: skip if last update was < threshold ago
        prev_state = hass.states.get(entity_id)
        now = datetime.now(timezone.utc)
        if prev_state is not None:
            last_updated = prev_state.last_updated
            # Ensure tz-aware for subtraction
            if last_updated.tzinfo is None:
                last_updated = last_updated.replace(tzinfo=timezone.utc)
            elapsed = (now - last_updated).total_seconds()
            if elapsed < _LAST_SYNC_MIN_INTERVAL_SECONDS:
                _LOGGER.debug(
                    "Health Bridge: Skipping last_sync_time update for %s (%.2fs < %ds)",
                    user_id, elapsed, _LAST_SYNC_MIN_INTERVAL_SECONDS
                )
                return False

        # We’re past the smoothing window (or no previous state) — proceed.
        ent_reg = er.async_get(hass)
        dev_reg = dr.async_get(hass)

        # Ensure device exists
        device = dev_reg.async_get_or_create(
            config_entry_id=hass.data.get(DOMAIN, {}).get("entry_id"),
            identifiers={(DOMAIN, f"health_bridge_{user_id}")},
            name=f"Health Bridge ({user_id})",
            manufacturer="Health Bridge",
            model="Health Tracker",
            sw_version="1.0",
        )

        # Ensure registry entry exists
        if ent_reg.async_get(entity_id) is None:
            ent_reg.async_get_or_create(
                domain="sensor",
                platform=DOMAIN,
                unique_id=unique_id,
                suggested_object_id=suggested_object_id,
                device_id=device.id,
                original_name=f"{_DISPLAY_NAME_OVERRIDES.get(metric_name, 'Last Sync Time')} ({user_id})",
            )

        # Route through the sensor platform so last_sync_time is a real,
        # restorable entity (survives Core restarts) — not a bare state write,
        # which would leave no live entity object after startup.
        domain_data = hass.data.get(DOMAIN, {})
        add_sensor = domain_data.get("add_sensor")
        update_sensor = domain_data.get("update_sensor")
        user_entities = domain_data.setdefault("entities", {}).setdefault(user_id, {})
        attrs = METRIC_ATTRIBUTES_MAP.get(metric_name, {}).copy()

        if metric_name in user_entities:
            if update_sensor:
                update_sensor(user_id, metric_name, now)
                return True
        elif add_sensor:
            add_sensor(user_id, metric_name, attrs, now)
            user_entities[metric_name] = entity_id
            return True
        return False
    except Exception as exc:
        _LOGGER.error(
            "Health Bridge: Failed to update last_sync_time for %s: %s",
            user_id, exc, exc_info=True
        )
        return False
