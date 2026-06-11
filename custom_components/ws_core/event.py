"""HA Event entities for Weather Station Core.  (v2.0)

Provides one-shot event notifications for significant weather transitions:
  - Rain onset / cessation
  - Frost onset / thaw
  - Lightning strike detected

Events are fired from the coordinator via _fire_ws_events() which runs
inside every compute cycle and detects state transitions.

Compatible with HA 2023.8+.  On older HA the platform is silently skipped
(async_setup_entry will simply not be called).
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.update_coordinator import CoordinatorEntity

try:
    from homeassistant.components.event import EventEntity

    _HAS_EVENT = True
except ImportError:
    _HAS_EVENT = False  # HA < 2023.8

from .const import (
    CONF_PREFIX,
    DEFAULT_PREFIX,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities,
) -> None:
    if not _HAS_EVENT:
        _LOGGER.debug("ws_core: event platform not available (HA < 2023.8); skipping")
        return

    coordinator = hass.data[DOMAIN][entry.entry_id]
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()

    entities: list[EventEntity] = [
        WSRainEvent(coordinator, entry, prefix),
        WSFrostEvent(coordinator, entry, prefix),
        WSLightningEvent(coordinator, entry, prefix),
    ]
    async_add_entities(entities)

    # Store references so coordinator can call trigger_event()
    hass.data[DOMAIN].setdefault(f"{entry.entry_id}_events", {})
    for ent in entities:
        hass.data[DOMAIN][f"{entry.entry_id}_events"][ent.__class__.__name__] = ent


if _HAS_EVENT:

    class WSRainEvent(CoordinatorEntity, EventEntity):
        """Fires when rain starts or stops."""

        _attr_event_types = ["started", "stopped"]
        _attr_has_entity_name = True
        _attr_translation_key = "ws_rain_event"
        _attr_icon = "mdi:weather-pouring"

        def __init__(self, coordinator, entry: ConfigEntry, prefix: str) -> None:
            super().__init__(coordinator)
            self._entry = entry
            self._attr_unique_id = f"{entry.entry_id}_rain_event"
            self._attr_suggested_object_id = f"{prefix}_rain_event"
            self._prev_raining: bool | None = None

        @property
        def device_info(self):
            return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

        async def async_added_to_hass(self) -> None:
            await super().async_added_to_hass()
            desired = f"event.{self._attr_suggested_object_id}"
            if self.entity_id and self.entity_id != desired:
                reg = er.async_get(self.hass)
                current = reg.async_get(self.entity_id)
                if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                    reg.async_update_entity(self.entity_id, new_entity_id=desired)

        def check_and_fire(self, data: dict[str, Any]) -> None:
            """Called from coordinator on each compute cycle."""
            rate = data.get("rain_rate_mmph_filtered", 0.0) or 0.0
            is_raining = float(rate) > 0.1
            if self._prev_raining is None:
                self._prev_raining = is_raining
                return
            if is_raining and not self._prev_raining:
                self._trigger_event(
                    "started",
                    {
                        "rain_rate_mmph": round(float(rate), 1),
                        "rain_today_mm": data.get("_rain_today_mm"),
                    },
                )
                self.async_write_ha_state()
            elif not is_raining and self._prev_raining:
                self._trigger_event(
                    "stopped",
                    {
                        "rain_today_mm": data.get("_rain_today_mm"),
                        "rain_1h_mm": data.get("rain_accum_1h_mm"),
                    },
                )
                self.async_write_ha_state()
            self._prev_raining = is_raining

    class WSFrostEvent(CoordinatorEntity, EventEntity):
        """Fires when temperature crosses the freeze threshold."""

        _attr_event_types = ["frost", "thaw"]
        _attr_has_entity_name = True
        _attr_translation_key = "ws_frost_event"
        _attr_icon = "mdi:snowflake-alert"

        def __init__(self, coordinator, entry: ConfigEntry, prefix: str) -> None:
            super().__init__(coordinator)
            self._entry = entry
            self._attr_unique_id = f"{entry.entry_id}_frost_event"
            self._attr_suggested_object_id = f"{prefix}_frost_event"
            self._prev_frozen: bool | None = None

        @property
        def device_info(self):
            return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

        async def async_added_to_hass(self) -> None:
            await super().async_added_to_hass()
            desired = f"event.{self._attr_suggested_object_id}"
            if self.entity_id and self.entity_id != desired:
                reg = er.async_get(self.hass)
                current = reg.async_get(self.entity_id)
                if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                    reg.async_update_entity(self.entity_id, new_entity_id=desired)

        def check_and_fire(self, data: dict[str, Any], threshold_c: float = 2.0) -> None:
            tc = data.get("norm_temperature_c")
            if tc is None:
                return
            is_frozen = float(tc) <= threshold_c
            if self._prev_frozen is None:
                self._prev_frozen = is_frozen
                return
            if is_frozen and not self._prev_frozen:
                self._trigger_event(
                    "frost",
                    {
                        "temperature_c": round(float(tc), 1),
                        "frost_point_c": data.get("frost_point_c"),
                        "dew_point_c": data.get("dew_point_c"),
                    },
                )
                self.async_write_ha_state()
            elif not is_frozen and self._prev_frozen:
                self._trigger_event(
                    "thaw",
                    {
                        "temperature_c": round(float(tc), 1),
                    },
                )
                self.async_write_ha_state()
            self._prev_frozen = is_frozen

    class WSLightningEvent(CoordinatorEntity, EventEntity):
        """Fires when new lightning strikes are detected."""

        _attr_event_types = ["strike_detected", "proximity_alert"]
        _attr_has_entity_name = True
        _attr_translation_key = "ws_lightning_event"
        _attr_icon = "mdi:lightning-bolt"

        def __init__(self, coordinator, entry: ConfigEntry, prefix: str) -> None:
            super().__init__(coordinator)
            self._entry = entry
            self._attr_unique_id = f"{entry.entry_id}_lightning_event"
            self._attr_suggested_object_id = f"{prefix}_lightning_event"
            self._prev_count_1h: float = 0.0
            self._prev_proximity: str = "clear"

        @property
        def device_info(self):
            return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

        async def async_added_to_hass(self) -> None:
            await super().async_added_to_hass()
            desired = f"event.{self._attr_suggested_object_id}"
            if self.entity_id and self.entity_id != desired:
                reg = er.async_get(self.hass)
                current = reg.async_get(self.entity_id)
                if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                    reg.async_update_entity(self.entity_id, new_entity_id=desired)

        def check_and_fire(self, data: dict[str, Any]) -> None:
            count_1h = data.get("lightning_count_1h", 0) or 0
            proximity = data.get("lightning_proximity", "clear") or "clear"
            if float(count_1h) > self._prev_count_1h:
                self._trigger_event(
                    "strike_detected",
                    {
                        "count_1h": int(count_1h),
                        "distance_km": data.get("lightning_distance_km"),
                        "proximity": proximity,
                    },
                )
                self.async_write_ha_state()
            if proximity == "near" and self._prev_proximity == "clear":
                self._trigger_event(
                    "proximity_alert",
                    {
                        "distance_km": data.get("lightning_distance_km"),
                    },
                )
                self.async_write_ha_state()
            self._prev_count_1h = float(count_1h)
            self._prev_proximity = proximity

else:
    # Stub classes for HA < 2023.8 (never instantiated)
    class WSRainEvent:  # type: ignore[no-redef]
        pass

    class WSFrostEvent:  # type: ignore[no-redef]
        pass

    class WSLightningEvent:  # type: ignore[no-redef]
        pass
