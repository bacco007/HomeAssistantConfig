"""Support for UniFi Insights WiFi QR code images."""

from __future__ import annotations

import io
import logging
from typing import TYPE_CHECKING, Any

import segno
from homeassistant.components.image import ImageEntity
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import dt as dt_util

from .const import DOMAIN, MANUFACTURER
from .coordinators import UnifiFacadeCoordinator

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry

_LOGGER = logging.getLogger(__name__)

# Coordinator handles updates centrally
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up WiFi QR code images for UniFi Insights."""
    coordinator = entry.runtime_data.coordinator

    entities: list[UnifiWifiQrCodeImage] = []
    for site_id, wifi_networks in coordinator.data.get("wifi", {}).items():
        for wifi_id, wifi_data in wifi_networks.items():
            # Only networks for which we resolved a connect string (i.e. the
            # passphrase was available from the classic API) get a QR code.
            if not wifi_data.get("qr_code"):
                continue
            wifi_name = wifi_data.get("name") or wifi_data.get("ssid", wifi_id)
            _LOGGER.debug("Creating WiFi QR code image for %s (%s)", wifi_name, wifi_id)
            entities.append(
                UnifiWifiQrCodeImage(
                    hass=hass,
                    coordinator=coordinator,
                    site_id=site_id,
                    wifi_id=wifi_id,
                )
            )

    if entities:
        async_add_entities(entities)


class UnifiWifiQrCodeImage(CoordinatorEntity[UnifiFacadeCoordinator], ImageEntity):
    """A QR code image that joins a device to a WiFi network."""

    _attr_has_entity_name = True
    _attr_content_type = "image/png"

    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        wifi_id: str,
    ) -> None:
        """Initialize the WiFi QR code image."""
        CoordinatorEntity.__init__(self, coordinator)
        ImageEntity.__init__(self, hass)
        self._site_id = site_id
        self._wifi_id = wifi_id

        wifi_data = self._get_wifi_data()
        wifi_name = wifi_data.get("name") or wifi_data.get("ssid", wifi_id)

        self._attr_unique_id = f"{site_id}_{wifi_id}_qr_code"
        self._attr_name = "WiFi QR code"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"wifi_{wifi_id}")},
            name=f"WiFi: {wifi_name}",
            manufacturer=MANUFACTURER,
            model="WiFi Network",
        )

        # Cache the rendered QR for a given payload so we only regenerate the
        # PNG when the SSID/passphrase actually changes.
        self._cached_payload: str | None = None
        self._cached_png: bytes | None = None
        self._attr_image_last_updated = dt_util.utcnow()

    def _get_wifi_data(self) -> dict[str, Any]:
        """Get WiFi data for this network from the coordinator."""
        result: dict[str, Any] = (
            self.coordinator.data.get("wifi", {})
            .get(self._site_id, {})
            .get(self._wifi_id, {})
        )
        return result

    def _current_payload(self) -> str | None:
        """Return the current WiFi connect (QR) payload, if available."""
        payload = self._get_wifi_data().get("qr_code")
        return payload if isinstance(payload, str) and payload else None

    @property
    def available(self) -> bool:
        """Return True if entity is available."""
        return bool(self.coordinator.last_update_success and self._current_payload())

    def _handle_coordinator_update(self) -> None:
        """Refresh the image timestamp when the connect string changes."""
        payload = self._current_payload()
        if payload != self._cached_payload:
            self._attr_image_last_updated = dt_util.utcnow()
        super()._handle_coordinator_update()

    async def async_image(self) -> bytes | None:
        """Return the QR code as PNG bytes."""
        payload = self._current_payload()
        if payload is None:
            return None

        if payload == self._cached_payload and self._cached_png is not None:
            return self._cached_png

        buffer = io.BytesIO()
        segno.make(payload, error="m").save(buffer, kind="png", scale=6, border=2)
        self._cached_payload = payload
        self._cached_png = buffer.getvalue()
        return self._cached_png
