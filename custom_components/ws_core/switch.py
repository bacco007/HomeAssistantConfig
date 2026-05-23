"""Switch entities for Weather Station Core.

Includes:
  - WSToggleSwitch: restore-state switches (e.g. dashboard animations)
  - WSFeatureSwitch: config-backed feature toggles that write to
    entry.options and trigger a coordinator reload when toggled
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import (
    CONF_ENABLE_ADVANCED_SENSORS,
    CONF_ENABLE_AIR_QUALITY,
    CONF_ENABLE_COMFORT_INDICES,
    CONF_ENABLE_DIAGNOSTICS,
    CONF_ENABLE_DISPLAY_SENSORS,
    CONF_ENABLE_FIRE_RISK,
    CONF_ENABLE_FOG,
    CONF_ENABLE_FWI_COMPONENTS,
    CONF_ENABLE_MOON,
    CONF_ENABLE_NOWCAST,
    CONF_ENABLE_POLLEN,
    CONF_ENABLE_SEA_TEMP,
    CONF_ENABLE_SOLAR_FORECAST,
    CONF_ENABLE_THUNDERSTORM,
    CONF_ENABLE_VIGICRUES,
    CONF_ENABLE_VIGILANCE_METEO,
    CONF_ENABLE_WUNDERGROUND,
    CONF_PREFIX,
    DEFAULT_ENABLE_ADVANCED_SENSORS,
    DEFAULT_ENABLE_AIR_QUALITY,
    DEFAULT_ENABLE_COMFORT_INDICES,
    DEFAULT_ENABLE_DIAGNOSTICS,
    DEFAULT_ENABLE_DISPLAY_SENSORS,
    DEFAULT_ENABLE_FIRE_RISK,
    DEFAULT_ENABLE_FOG,
    DEFAULT_ENABLE_FWI_COMPONENTS,
    DEFAULT_ENABLE_MOON,
    DEFAULT_ENABLE_NOWCAST,
    DEFAULT_ENABLE_POLLEN,
    DEFAULT_ENABLE_SEA_TEMP,
    DEFAULT_ENABLE_SOLAR_FORECAST,
    DEFAULT_ENABLE_THUNDERSTORM,
    DEFAULT_ENABLE_VIGICRUES,
    DEFAULT_ENABLE_VIGILANCE_METEO,
    DEFAULT_ENABLE_WUNDERGROUND,
    DEFAULT_PREFIX,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Feature toggle descriptors
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class WSFeatureDesc:
    """Descriptor for a config-backed feature toggle switch."""

    conf_key: str
    default: bool
    name: str
    icon: str


FEATURE_SWITCHES: tuple[WSFeatureDesc, ...] = (
    WSFeatureDesc(
        conf_key=CONF_ENABLE_DISPLAY_SENSORS,
        default=DEFAULT_ENABLE_DISPLAY_SENSORS,
        name="Feature: Display Sensors",
        icon="mdi:monitor-dashboard",
    ),
    # v0.3.0: removed laundry/stargazing/running score switches (cut sensors)
    WSFeatureDesc(
        conf_key=CONF_ENABLE_FIRE_RISK,
        default=DEFAULT_ENABLE_FIRE_RISK,
        name="Feature: Fire Risk Score",
        icon="mdi:fire-alert",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_FOG,
        default=DEFAULT_ENABLE_FOG,
        name="Feature: Fog Probability",
        icon="mdi:weather-fog",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_THUNDERSTORM,
        default=DEFAULT_ENABLE_THUNDERSTORM,
        name="Feature: Thunderstorm Risk",
        icon="mdi:weather-lightning",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_SEA_TEMP,
        default=DEFAULT_ENABLE_SEA_TEMP,
        name="Feature: Sea Surface Temperature",
        icon="mdi:waves",
    ),
    # v0.3.0: removed degree-days/METAR/CWOP/Export feature switches
    WSFeatureDesc(
        conf_key=CONF_ENABLE_WUNDERGROUND,
        default=DEFAULT_ENABLE_WUNDERGROUND,
        name="Feature: Weather Underground",
        icon="mdi:cloud-upload",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_AIR_QUALITY,
        default=DEFAULT_ENABLE_AIR_QUALITY,
        name="Feature: Air Quality Index",
        icon="mdi:air-filter",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_POLLEN,
        default=DEFAULT_ENABLE_POLLEN,
        name="Feature: Pollen Levels",
        icon="mdi:flower-pollen",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_MOON,
        default=DEFAULT_ENABLE_MOON,
        name="Feature: Moon Phase",
        icon="mdi:moon-waning-crescent",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_SOLAR_FORECAST,
        default=DEFAULT_ENABLE_SOLAR_FORECAST,
        name="Feature: Solar PV Forecast",
        icon="mdi:solar-power",
    ),
    # v1.5.0
    WSFeatureDesc(
        conf_key=CONF_ENABLE_COMFORT_INDICES,
        default=DEFAULT_ENABLE_COMFORT_INDICES,
        name="Feature: Comfort Indices",
        icon="mdi:thermometer-check",
    ),
    # v1.6.0
    WSFeatureDesc(
        conf_key=CONF_ENABLE_VIGILANCE_METEO,
        default=DEFAULT_ENABLE_VIGILANCE_METEO,
        name="Feature: Meteo Vigilance",
        icon="mdi:alert-octagon",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_VIGICRUES,
        default=DEFAULT_ENABLE_VIGICRUES,
        name="Feature: Vigicrues River Level",
        icon="mdi:waves",
    ),
    # v1.6.2
    WSFeatureDesc(
        conf_key=CONF_ENABLE_DIAGNOSTICS,
        default=DEFAULT_ENABLE_DIAGNOSTICS,
        name="Feature: Station Diagnostics",
        icon="mdi:stethoscope",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_FWI_COMPONENTS,
        default=DEFAULT_ENABLE_FWI_COMPONENTS,
        name="Feature: FWI Components",
        icon="mdi:fire-circle",
    ),
    WSFeatureDesc(
        conf_key=CONF_ENABLE_ADVANCED_SENSORS,
        default=DEFAULT_ENABLE_ADVANCED_SENSORS,
        name="Feature: Advanced Sensors",
        icon="mdi:tune-variant",
    ),
    # v1.7.0
    WSFeatureDesc(
        conf_key=CONF_ENABLE_NOWCAST,
        default=DEFAULT_ENABLE_NOWCAST,
        name="Feature: Precipitation Nowcast",
        icon="mdi:weather-pouring",
    ),
)


# ---------------------------------------------------------------------------
# Platform setup
# ---------------------------------------------------------------------------


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up switch entities."""
    prefix = (entry.options.get(CONF_PREFIX) or entry.data.get(CONF_PREFIX) or DEFAULT_PREFIX).strip().lower()

    entities: list[SwitchEntity] = [
        # Existing dashboard toggle (restore-state)
        WSToggleSwitch(
            entry,
            prefix,
            key="enable_animations",
            name="Dashboard: Animations",
            icon="mdi:animation-play",
            default=True,
        ),
    ]

    # Config-backed feature toggles
    for desc in FEATURE_SWITCHES:
        entities.append(WSFeatureSwitch(entry, prefix, desc))

    async_add_entities(entities)


# ---------------------------------------------------------------------------
# Restore-state toggle (unchanged from v1.0.0)
# ---------------------------------------------------------------------------


class WSToggleSwitch(RestoreEntity, SwitchEntity):
    """A toggle switch owned by the integration."""

    _attr_has_entity_name = True

    def __init__(
        self,
        entry: ConfigEntry,
        prefix: str,
        *,
        key: str,
        name: str,
        icon: str,
        default: bool = True,
    ) -> None:
        self._entry = entry
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_suggested_object_id = f"{prefix}_{key}"
        self._attr_translation_key = f"ws_{key}"
        self._attr_icon = icon
        self._attr_is_on = default

    @property
    def device_info(self):
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        """Restore last state."""
        await super().async_added_to_hass()
        desired = f"switch.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)
        last_state = await self.async_get_last_state()
        if last_state:
            self._attr_is_on = last_state.state == "on"

    async def async_turn_on(self, **kwargs) -> None:
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs) -> None:
        self._attr_is_on = False
        self.async_write_ha_state()


# ---------------------------------------------------------------------------
# Config-backed feature toggle
# ---------------------------------------------------------------------------


class WSFeatureSwitch(SwitchEntity):
    """A switch that reflects and modifies a boolean config entry option.

    Toggling writes to entry.options which fires the update listener
    and triggers a coordinator reload.
    """

    _attr_entity_category = EntityCategory.CONFIG
    _attr_has_entity_name = True

    def __init__(
        self,
        entry: ConfigEntry,
        prefix: str,
        desc: WSFeatureDesc,
    ) -> None:
        self._entry = entry
        self._desc = desc
        # Use the conf_key as the object-id suffix (e.g. enable_air_quality)
        self._attr_unique_id = f"{entry.entry_id}_{desc.conf_key}"
        self._attr_suggested_object_id = f"{prefix}_{desc.conf_key}"
        self._attr_translation_key = f"ws_{desc.conf_key}"
        self._attr_icon = desc.icon

    @property
    def device_info(self) -> dict[str, Any]:
        return {"identifiers": {(DOMAIN, self._entry.entry_id)}}

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        desired = f"switch.{self._attr_suggested_object_id}"
        if self.entity_id and self.entity_id != desired:
            reg = er.async_get(self.hass)
            current = reg.async_get(self.entity_id)
            if current and current.unique_id == self.unique_id and reg.async_get(desired) is None:
                reg.async_update_entity(self.entity_id, new_entity_id=desired)

    @property
    def is_on(self) -> bool:
        """Read current state from the config entry."""
        return bool(
            self._entry.options.get(
                self._desc.conf_key,
                self._entry.data.get(self._desc.conf_key, self._desc.default),
            )
        )

    async def async_turn_on(self, **kwargs) -> None:
        """Enable the feature."""
        await self._write(True)

    async def async_turn_off(self, **kwargs) -> None:
        """Disable the feature."""
        await self._write(False)

    async def _write(self, value: bool) -> None:
        """Persist value to entry.options (triggers reload via update listener)."""
        new_options = dict(self._entry.options)
        new_options[self._desc.conf_key] = value
        self.hass.config_entries.async_update_entry(self._entry, options=new_options)
