import logging
import re
import time
from datetime import timedelta
from typing import Any

import aiohttp
import async_timeout

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import CONF_ACCOUNT_ID, CONF_API_KEY, CONF_METRICS_URL, DOMAIN

_LOGGER = logging.getLogger(__name__)

_SAMPLE_RE = re.compile(
    r"^([a-zA-Z_:][a-zA-Z0-9_:]*)"
    r"(?:\{([^}]*)\})?"
    r"\s+"
    r"([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)"
    r"(?:\s+\d+)?$"
)


def parse_prometheus_text(text: str) -> dict[str, dict[str, Any]]:
    """Parse Prometheus exposition text into unlabeled and labeled metric groups."""
    parsed: dict[str, dict[str, Any]] = {"unlabeled": {}, "labeled": {}}

    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        try:
            match = _SAMPLE_RE.match(line)
            if not match:
                continue

            metric_name, labels_str, value_str = match.groups()
            value = float(value_str)

            if labels_str:
                labels = dict(re.findall(r'(\w+)="([^"]*)"', labels_str))
                parsed["labeled"].setdefault(metric_name, []).append(
                    {"labels": labels, "value": value}
                )
            else:
                parsed["unlabeled"][metric_name] = value
        except Exception:
            continue

    return parsed


class CloudflareApiCoordinator(DataUpdateCoordinator[list[dict[str, Any]]]):
    """Coordinator for Cloudflare tunnel API data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize the Cloudflare API coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_api_{entry.entry_id}",
            update_interval=timedelta(minutes=1),
        )
        self.api_key = entry.data[CONF_API_KEY]
        self.account_id = entry.data[CONF_ACCOUNT_ID]
        self.entry_id = entry.entry_id

    async def _async_update_data(self) -> list[dict[str, Any]]:
        """Fetch current tunnel list from the Cloudflare API."""
        session = async_get_clientsession(self.hass)
        url = (
            f"https://api.cloudflare.com/client/v4/accounts/"
            f"{self.account_id}/cfd_tunnel?is_deleted=false"
        )
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with async_timeout.timeout(10):
                response = await session.get(url, headers=headers)
                response.raise_for_status()
                data = await response.json()

            return data.get("result", [])
        except (aiohttp.ClientError, TimeoutError) as err:
            raise UpdateFailed(f"Error fetching Cloudflare API data: {err}") from err


class CloudflaredMetricsCoordinator(DataUpdateCoordinator[dict[str, dict[str, Any]]]):
    """Coordinator for scraping and parsing cloudflared Prometheus metrics.

    Security note: The cloudflared /metrics endpoint may expose internal
    operational data. Users should bind it to localhost or firewall access,
    and provide a URL reachable only by Home Assistant.
    """

    def __init__(
        self, hass: HomeAssistant, entry: ConfigEntry, metrics_url: str
    ) -> None:
        """Initialize the cloudflared metrics coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_metrics_{entry.entry_id}",
            update_interval=timedelta(minutes=1),
        )
        self.metrics_url = metrics_url
        self._prev_sent_total: float | None = None
        self._prev_recv_total: float | None = None
        self._prev_mono: float | None = None
        self.sent_rate: float | None = None
        self.recv_rate: float | None = None

    async def _async_update_data(self) -> dict[str, dict[str, Any]]:
        """Fetch metrics text, parse samples, and compute throughput rates."""
        session = async_get_clientsession(self.hass)

        try:
            async with async_timeout.timeout(10):
                response = await session.get(self.metrics_url)
                response.raise_for_status()
                text = await response.text()
        except (aiohttp.ClientError, TimeoutError) as err:
            _LOGGER.warning("Error fetching cloudflared metrics: %s", err)
            raise UpdateFailed(f"Error fetching cloudflared metrics: {err}") from err

        parsed = parse_prometheus_text(text)

        sent_total = sum(
            sample["value"]
            for sample in parsed["labeled"].get("quic_client_sent_bytes", [])
        )
        recv_total = sum(
            sample["value"]
            for sample in parsed["labeled"].get("quic_client_receive_bytes", [])
        )

        now_mono = time.monotonic()
        sent_rate: float | None = None
        recv_rate: float | None = None

        if self._prev_mono is not None:
            dt = now_mono - self._prev_mono
            if 0 < dt < 600:
                if self._prev_sent_total is not None:
                    sent_delta = sent_total - self._prev_sent_total
                    if sent_delta >= 0:
                        sent_rate = sent_delta / dt
                if self._prev_recv_total is not None:
                    recv_delta = recv_total - self._prev_recv_total
                    if recv_delta >= 0:
                        recv_rate = recv_delta / dt

        self.sent_rate = sent_rate
        self.recv_rate = recv_rate
        self._prev_sent_total = sent_total
        self._prev_recv_total = recv_total
        self._prev_mono = now_mono

        return parsed


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the Cloudflare Tunnel component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Cloudflare Tunnel from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    api_coordinator = CloudflareApiCoordinator(hass, entry)
    await api_coordinator.async_config_entry_first_refresh()

    metrics_coordinator: CloudflaredMetricsCoordinator | None = None
    metrics_url = entry.data.get(CONF_METRICS_URL)
    if metrics_url:
        metrics_coordinator = CloudflaredMetricsCoordinator(hass, entry, metrics_url)
        try:
            await metrics_coordinator.async_refresh()
        except Exception as err:
            _LOGGER.warning(
                "Initial metrics refresh failed; continuing without metrics coordinator: %s",
                err,
            )
            metrics_coordinator = None

    hass.data[DOMAIN][entry.entry_id] = {
        "api_coordinator": api_coordinator,
        "metrics_coordinator": metrics_coordinator,
    }

    await hass.config_entries.async_forward_entry_setups(entry, ["sensor"])

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_forward_entry_unload(entry, "sensor")

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    else:
        _LOGGER.error("Failed to unload entry: %s", entry.entry_id)

    return unload_ok
