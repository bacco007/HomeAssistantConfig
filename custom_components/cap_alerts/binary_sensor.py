"""Binary sensor entities for CAP Alerts: NAAD stream connectivity."""

from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.device_registry import DeviceInfo

from .const import DOMAIN
from .coordinator import AlertsDataUpdateCoordinator

# Coordinator-backed; the entity reflects socket state and issues no requests.
PARALLEL_UPDATES = 0

STREAM_CONNECTED_SUFFIX = "stream_connected"


async def async_setup_entry(
    hass,
    entry: ConfigEntry,
    async_add_entities,
) -> None:
    """Set up the NAAD stream connectivity sensor, for streaming entries only."""
    coordinator: AlertsDataUpdateCoordinator = entry.runtime_data
    unique_id = f"{entry.entry_id}_{STREAM_CONNECTED_SUFFIX}"

    if not coordinator.streaming:
        # Turning streaming off (or a non-ECCC entry) leaves no socket to report
        # on. Drop any registry entry from a previous streaming run rather than
        # letting it linger as a permanently unavailable orphan.
        ent_reg = er.async_get(hass)
        stale = ent_reg.async_get_entity_id("binary_sensor", DOMAIN, unique_id)
        if stale is not None:
            ent_reg.async_remove(stale)
        return

    async_add_entities([StreamConnectivitySensor(coordinator, unique_id)])


class StreamConnectivitySensor(BinarySensorEntity):
    """Whether the NAAD real-time socket is currently connected.

    Answers the question a timestamp cannot: with Canada often quiet for hours, a
    "last stream event" reading is indistinguishable between a healthy idle socket
    and a dead one. Connectivity is the falsifiable signal, and HA gives its
    ``last_changed`` for free — so "connected since" and "down since" need no
    second entity.

    Deliberately not a ``CoordinatorEntity``: that base ties ``available`` to
    ``last_update_success``, so a failing backfill would make this entity
    unavailable exactly when a user is trying to work out whether the socket is
    the problem. It subscribes to the coordinator directly instead.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_device_class = BinarySensorDeviceClass.CONNECTIVITY
    _attr_translation_key = STREAM_CONNECTED_SUFFIX

    def __init__(
        self,
        coordinator: AlertsDataUpdateCoordinator,
        unique_id: str,
    ) -> None:
        self._coordinator = coordinator
        self._attr_unique_id = unique_id

    @property
    def device_info(self) -> DeviceInfo:
        return self._coordinator.device_info

    @property
    def is_on(self) -> bool:
        return self._coordinator.stream_connected

    async def async_added_to_hass(self) -> None:
        """Subscribe to coordinator notifications, including connection changes."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self._coordinator.async_add_listener(self.async_write_ha_state)
        )
