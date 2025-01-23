"""Base entity for the UniFi Site Manager integration."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo, EntityDescription
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, MANUFACTURER
from .coordinator import UnifiSiteManagerDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

class UnifiSiteManagerEntity(CoordinatorEntity[UnifiSiteManagerDataUpdateCoordinator]):
    """Base entity for UniFi Site Manager integration."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: UnifiSiteManagerDataUpdateCoordinator,
        description: EntityDescription,
        site_id: str | None = None,
        host_id: str | None = None,
        device_id: str | None = None,  # Add device_id parameter
    ) -> None:
        """Initialize the entity."""
        super().__init__(coordinator)
        self.entity_description = description
        self._site_id = site_id
        self._host_id = host_id
        self._device_id = device_id  # Store device_id

        # Create a single device identifier for all entities
        if site_id:
            site_data = coordinator.get_site(site_id)
            _LOGGER.debug("Creating entity for site %s with data: %s", site_id, site_data)
            name = site_data.get("meta", {}).get("name", site_id)
            
            self._attr_unique_id = f"{site_id}_{description.key}"
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"site_{site_id}")},
                name=f"UniFi Site {name}",
                manufacturer=MANUFACTURER,
                model="UniFi Site Manager",
                sw_version=coordinator.data.get("version"),
                entry_type=DeviceEntryType.SERVICE,
            )
        # Add device info creation for device entities
        elif device_id:
            device_data = coordinator.get_device(device_id)
            _LOGGER.debug("Creating entity for device %s with data: %s", device_id, device_data)
            
            self._attr_unique_id = f"{device_id}_{description.key}"
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"device_{device_id}")},
                name=device_data.get("name", device_id),
                manufacturer=MANUFACTURER,
                model=device_data.get("model", "Unknown"),
                sw_version=device_data.get("version"),
                hw_version=device_data.get("hardwareVersion"),
                suggested_area=device_data.get("location"),
                entry_type=DeviceEntryType.SERVICE,
            )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        if self._site_id:
            site_data = self.coordinator.get_site(self._site_id)
            if not site_data:
                self._attr_available = False
                self.async_write_ha_state()
                return
        elif self._host_id:
            host_data = self.coordinator.get_host(self._host_id)
            if not host_data:
                self._attr_available = False
                self.async_write_ha_state()
                return
        elif self._device_id:  # Add device data check
            device_data = self.coordinator.get_device(self._device_id)
            if not device_data:
                self._attr_available = False
                self.async_write_ha_state()
                return

        self._attr_available = True
        self.async_write_ha_state()

    @property
    def site_data(self) -> dict[str, Any] | None:
        """Get site data."""
        if not self._site_id:
            return None
        return self.coordinator.get_site(self._site_id)

    @property
    def host_data(self) -> dict[str, Any] | None:
        """Get host data."""
        if not self._host_id:
            return None
        return self.coordinator.get_host(self._host_id)

    @property
    def device_data(self) -> dict[str, Any] | None:
        """Get device data."""
        if not self._device_id:
            return None
        return self.coordinator.get_device(self._device_id)

    @property
    def site_metrics(self) -> dict[str, Any] | None:
        """Get site metrics."""
        if not self._site_id:
            return None
                
        metrics = self.coordinator.get_site_metrics(self._site_id)
        if not metrics or not isinstance(metrics, list) or not metrics:
            return None
                
        # Get first metric set
        metric_set = metrics[0]  # Get first metric result
        if not metric_set.get("periods"):
            return None
                
        periods = metric_set["periods"]
        if not periods:
            return None
                
        # Get most recent period data
        latest_period = periods[0]
        return latest_period.get("data", {})


class UnifiSiteManagerSiteEntity(UnifiSiteManagerEntity):
    """Base entity for UniFi Site Manager site entities."""

    def __init__(
        self,
        coordinator: UnifiSiteManagerDataUpdateCoordinator,
        description: EntityDescription,
        site_id: str,
    ) -> None:
        """Initialize the site entity."""
        super().__init__(coordinator, description, site_id=site_id)


class UnifiSiteManagerHostEntity(UnifiSiteManagerEntity):
    """Base entity for UniFi Site Manager host entities."""

    def __init__(
        self,
        coordinator: UnifiSiteManagerDataUpdateCoordinator,
        description: EntityDescription,
        host_id: str,
    ) -> None:
        """Initialize the host entity."""
        super().__init__(coordinator, description, host_id=host_id)


class UnifiSiteManagerDeviceEntity(UnifiSiteManagerEntity):
    """Base entity for UniFi Site Manager device entities."""

    def __init__(
        self,
        coordinator: UnifiSiteManagerDataUpdateCoordinator,
        description: EntityDescription,
        device_id: str,
    ) -> None:
        """Initialize the device entity."""
        super().__init__(coordinator, description, device_id=device_id)