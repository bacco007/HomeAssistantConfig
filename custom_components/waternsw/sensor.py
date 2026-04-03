from __future__ import annotations

from datetime import datetime
import asyncio

import voluptuous as vol

from homeassistant.components.sensor import PLATFORM_SCHEMA, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ATTRIBUTION, CONF_ICON, CONF_NAME
from homeassistant.core import HomeAssistant
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTRIBUTION,
    CONF_SITE_ID,
    CONF_WATERBODY_NAME,
    DEFAULT_ICON,
    DOMAIN,
    STALE_AFTER_DAYS,
    WATERBODY_SENSOR_TYPES,
)
from .coordinator import WaterNSWCoordinator, format_trace_value

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_NAME): cv.string,
        vol.Optional(CONF_ICON, default=DEFAULT_ICON): cv.icon,
        vol.Required(CONF_SITE_ID): cv.string,
        vol.Required("from_variable"): cv.string,
        vol.Required("to_variable"): cv.string,
        vol.Required("unit_of_measure"): cv.string,
    }
)


async def async_setup_platform(
    hass: HomeAssistant,
    config: dict,
    async_add_entities: AddEntitiesCallback,
    discovery_info=None,
) -> None:
    """Keep legacy YAML support."""
    coordinator = WaterNSWCoordinator(
        hass,
        site_id=str(config[CONF_SITE_ID]),
        var_from=config["from_variable"],
        var_to=config["to_variable"],
    )
    await coordinator.async_config_entry_first_refresh()
    async_add_entities(
        [
            WaterNSWLegacySensor(
                coordinator=coordinator,
                config=config,
                unique_prefix="yaml",
            )
        ]
    )


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up all standard WaterNSW sensors for a UI-created waterbody."""
    waterbody_name = entry.data[CONF_WATERBODY_NAME]
    site_id = str(entry.data[CONF_SITE_ID])

    coordinators: list[tuple[dict, WaterNSWCoordinator]] = []

    for definition in WATERBODY_SENSOR_TYPES:
        coordinator = WaterNSWCoordinator(
            hass,
            site_id=site_id,
            var_from=definition["from_variable"],
            var_to=definition["to_variable"],
        )
        coordinators.append((definition, coordinator))

    results = await asyncio.gather(
        *[coordinator.async_config_entry_first_refresh() for _, coordinator in coordinators],
        return_exceptions=True,
    )

    entities: list[WaterNSWUISensor] = []
    errors: list[Exception] = []

    for (definition, coordinator), result in zip(coordinators, results, strict=True):
        if isinstance(result, Exception):
            errors.append(result)
            continue

        entities.append(
            WaterNSWUISensor(
                coordinator=coordinator,
                entry=entry,
                waterbody_name=waterbody_name,
                site_id=site_id,
                definition=definition,
            )
        )

    if not entities and errors:
        raise errors[0]

    async_add_entities(entities)


class _WaterNSWBaseSensor(CoordinatorEntity[WaterNSWCoordinator], SensorEntity):
    """Shared WaterNSW sensor logic."""

    _attr_has_entity_name = False

    def __init__(self, coordinator: WaterNSWCoordinator) -> None:
        super().__init__(coordinator)

    @property
    def native_value(self):
        data = self.coordinator.data
        if data is None or data.timestamp is None:
            return None

        age = datetime.now() - data.timestamp
        if age.days > STALE_AFTER_DAYS:
            return None

        return data.value

    @property
    def extra_state_attributes(self) -> dict:
        data = self.coordinator.data
        timestamp = data.timestamp if data else None

        stale = None
        if timestamp is not None:
            stale = (datetime.now() - timestamp).days > STALE_AFTER_DAYS

        return {
            "site_id": self.coordinator.site_id,
            "from_variable": self.coordinator.var_from,
            "to_variable": self.coordinator.var_to,
            "lastupdate": timestamp,
            "stale": stale,
            ATTR_ATTRIBUTION: ATTRIBUTION,
        }

    @property
    def device_info(self) -> dict:
        return {
            "identifiers": {(DOMAIN, self.coordinator.site_id)},
            "name": f"WaterNSW Site {self.coordinator.site_id}",
            "manufacturer": "WaterNSW",
            "model": "Real Time Data Platform",
            "entry_type": "service",
            "configuration_url": "https://realtimedata.waternsw.com.au/",
        }


class WaterNSWUISensor(_WaterNSWBaseSensor):
    """UI-created standard waterbody sensor."""

    def __init__(
        self,
        coordinator: WaterNSWCoordinator,
        *,
        entry: ConfigEntry,
        waterbody_name: str,
        site_id: str,
        definition: dict,
    ) -> None:
        super().__init__(coordinator)

        self._attr_name = f"WaterNSW {waterbody_name} {definition['name_suffix']}"
        self._attr_unique_id = f"{entry.entry_id}_{definition['key']}"
        self._attr_native_unit_of_measurement = definition["unit_of_measure"]
        self._attr_icon = definition.get("icon", DEFAULT_ICON)


class WaterNSWLegacySensor(_WaterNSWBaseSensor):
    """Legacy YAML-configured sensor."""

    def __init__(
        self,
        coordinator: WaterNSWCoordinator,
        *,
        config: dict,
        unique_prefix: str,
    ) -> None:
        super().__init__(coordinator)

        name = config[CONF_NAME]
        site_id = str(config[CONF_SITE_ID])
        var_from = format_trace_value(config["from_variable"])
        var_to = format_trace_value(config["to_variable"])

        self._attr_name = f"WaterNSW {name}"
        self._attr_unique_id = f"{unique_prefix}_{site_id}_{var_from}_{var_to}_{name.lower().replace(' ', '_')}"
        self._attr_native_unit_of_measurement = config["unit_of_measure"]
        self._attr_icon = config.get(CONF_ICON, DEFAULT_ICON)
