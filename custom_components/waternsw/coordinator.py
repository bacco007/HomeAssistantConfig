from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
import logging

from aiohttp import ClientError

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import REQUEST_TIMEOUT, UPDATE_INTERVAL

_LOGGER = logging.getLogger(__name__)


def format_trace_value(value: object) -> str:
    """Format WaterNSW trace values exactly as expected."""
    try:
        return f"{Decimal(str(value)):.2f}"
    except (InvalidOperation, ValueError, TypeError):
        return str(value)


@dataclass(frozen=True)
class WaterNSWData:
    """Fetched WaterNSW trace data."""

    value: str | float | int | None
    timestamp: datetime | None
    raw: dict


class WaterNSWCoordinator(DataUpdateCoordinator[WaterNSWData]):
    """Coordinator for a single WaterNSW trace pair."""

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        site_id: str,
        var_from: str,
        var_to: str,
    ) -> None:
        self.site_id = str(site_id)
        self.var_from = format_trace_value(var_from)
        self.var_to = format_trace_value(var_to)

        super().__init__(
            hass,
            _LOGGER,
            name=f"waternsw_{self.site_id}_{self.var_from}_{self.var_to}",
            update_interval=UPDATE_INTERVAL,
        )

    @property
    def url(self) -> str:
        """Build the original-style WaterNSW URL."""
        return (
            "https://realtimedata.waternsw.com.au/cgi/webservice.exe?"
            "{'function':'get_latest_ts_values','version':'2','params':{'site_list':'"
            f"{self.site_id}"
            "','datasource':'PROV','trace_list':[{'varfrom':'"
            f"{self.var_from}"
            "','varto':'"
            f"{self.var_to}"
            "'}]}}&ver=2"
        )

    async def _async_update_data(self) -> WaterNSWData:
        """Fetch data from WaterNSW."""
        session = async_get_clientsession(self.hass)

        try:
            async with session.get(self.url, timeout=REQUEST_TIMEOUT) as response:
                response.raise_for_status()
                payload = await response.json(content_type=None)
        except (ClientError, TimeoutError, ValueError) as err:
            raise UpdateFailed(f"Error communicating with WaterNSW: {err}") from err

        try:
            result = payload["return"][self.site_id][0]["values"][0]
            raw_value = result.get("v")
            raw_time = result.get("time")
        except (KeyError, IndexError, TypeError) as err:
            raise UpdateFailed("Unexpected response structure from WaterNSW") from err

        parsed_time = None
        if raw_time:
            try:
                parsed_time = datetime.strptime(raw_time, "%Y%m%d%H%M%S")
            except ValueError:
                _LOGGER.warning("Unable to parse WaterNSW timestamp: %s", raw_time)

        return WaterNSWData(
            value=raw_value,
            timestamp=parsed_time,
            raw=payload,
        )