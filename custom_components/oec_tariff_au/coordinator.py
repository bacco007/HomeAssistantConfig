"""Data update coordinator for OEC Tariff."""

import logging
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_API_URL, CONF_DNSP, CONF_TARIFF, DEFAULT_API_URL, DEFAULT_SCAN_INTERVAL

_LOGGER = logging.getLogger(__name__)


class OecTariffCoordinator(DataUpdateCoordinator):
    """Fetch tariff data from OEC API."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize coordinator."""
        self.api_url = entry.data.get(CONF_API_URL, DEFAULT_API_URL)
        self.dnsp = entry.data[CONF_DNSP]
        self.tariff = entry.data[CONF_TARIFF]
        self._session = async_get_clientsession(hass)
        self.tariff_detail: dict | None = None

        super().__init__(
            hass,
            _LOGGER,
            name=f"OEC Tariff ({self.dnsp}/{self.tariff})",
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

    async def _async_update_data(self) -> dict:
        """Fetch current rate from OEC API."""
        from datetime import datetime, timezone

        now = datetime.now(timezone.utc).astimezone()
        dt_str = now.isoformat()

        # Fetch current rate
        url = f"{self.api_url}/calculate/current-rate"
        params = {"dnsp": self.dnsp, "tariff": self.tariff, "datetime": dt_str}

        try:
            async with self._session.get(url, params=params, timeout=10) as resp:
                if resp.status != 200:
                    raise UpdateFailed(f"API returned {resp.status}: {await resp.text()}")
                rate_data = await resp.json()
        except Exception as err:
            raise UpdateFailed(f"Error fetching current rate: {err}") from err

        # Fetch tariff detail (less frequently — only if not cached)
        if self.tariff_detail is None:
            detail_url = f"{self.api_url}/tariffs/{self.dnsp}/{self.tariff}"
            try:
                async with self._session.get(detail_url, timeout=10) as resp:
                    if resp.status == 200:
                        self.tariff_detail = await resp.json()
            except Exception:
                _LOGGER.warning("Failed to fetch tariff detail, will retry next update")

        return {
            "rate": rate_data,
            "detail": self.tariff_detail,
        }
