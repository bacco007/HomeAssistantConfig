"""Portainer coordinator."""
from __future__ import annotations

from asyncio import Lock as Asyncio_lock, wait_for as asyncio_wait_for
from datetime import timedelta
from logging import getLogger

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_API_KEY,
    CONF_HOST,
    CONF_NAME,
    CONF_SSL,
    CONF_VERIFY_SSL,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import DOMAIN, SCAN_INTERVAL
from .apiparser import parse_api
from .api import PortainerAPI

_LOGGER = getLogger(__name__)


# ---------------------------
#   PortainerControllerData
# ---------------------------
class PortainerCoordinator(DataUpdateCoordinator):
    """PortainerControllerData Class."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry) -> None:
        """Initialize PortainerController."""
        super().__init__(
            hass, _LOGGER, name=DOMAIN, update_interval=timedelta(seconds=SCAN_INTERVAL)
        )
        self.hass = hass
        self.name = config_entry.data[CONF_NAME]
        self.host = config_entry.data[CONF_HOST]

        self.data = {
            "endpoints": {},
            "containers": {},
        }

        self.lock = Asyncio_lock()

        self.api = PortainerAPI(
            hass,
            config_entry.data[CONF_HOST],
            config_entry.data[CONF_API_KEY],
            config_entry.data[CONF_SSL],
            config_entry.data[CONF_VERIFY_SSL],
        )

        self._systemstats_errored = []
        self.datasets_hass_device_id = None

    # ---------------------------
    #   connected
    # ---------------------------
    def connected(self) -> bool:
        """Return connected state."""
        return self.api.connected()

    # ---------------------------
    #   _async_update_data
    # ---------------------------
    async def _async_update_data(self) -> None:
        """Update Portainer data."""
        try:
            await asyncio_wait_for(self.lock.acquire(), timeout=10)
        except Exception:
            return

        try:
            await self.hass.async_add_executor_job(self.get_endpoints)
            await self.hass.async_add_executor_job(self.get_containers)
        except Exception as error:
            self.lock.release()
            raise UpdateFailed(error) from error

        self.lock.release()
        async_dispatcher_send(self.hass, "update_sensors", self)
        return self.data

    # ---------------------------
    #   get_endpoints
    # ---------------------------
    def get_endpoints(self) -> None:
        """Get endpoints."""
        self.data["endpoints"] = parse_api(
            data={},
            source=self.api.query("endpoints"),
            key="Id",
            vals=[
                {"name": "Id", "default": 0},
                {"name": "Name", "default": "unknown"},
                {"name": "Snapshots", "default": "unknown"},
                {"name": "Type", "default": 0},
                {"name": "Status", "default": 0},
            ],
        )
        if not self.data["endpoints"]:
            return

        for uid in self.data["endpoints"]:
            self.data["endpoints"][uid] = parse_api(
                data=self.data["endpoints"][uid],
                source=self.data["endpoints"][uid]["Snapshots"][0],
                vals=[
                    {"name": "DockerVersion", "default": "unknown"},
                    {"name": "Swarm", "default": False},
                    {"name": "TotalCPU", "default": 0},
                    {"name": "TotalMemory", "default": 0},
                    {"name": "RunningContainerCount", "default": 0},
                    {"name": "StoppedContainerCount", "default": 0},
                    {"name": "HealthyContainerCount", "default": 0},
                    {"name": "UnhealthyContainerCount", "default": 0},
                    {"name": "VolumeCount", "default": 0},
                    {"name": "ImageCount", "default": 0},
                    {"name": "ServiceCount", "default": 0},
                    {"name": "StackCount", "default": 0},
                ],
            )

        del self.data["endpoints"][uid]["Snapshots"]

    # ---------------------------
    #   get_containers
    # ---------------------------
    def get_containers(self) -> None:
        self.data["containers"] = {}
        for eid in self.data["endpoints"]:
            self.data["containers"] = parse_api(
                data=self.data["containers"],
                source=self.api.query(
                    f"endpoints/{eid}/docker/containers/json", "get", {"all": True}
                ),
                key="Id",
                vals=[
                    {"name": "Id", "default": "unknown"},
                    {"name": "Names", "default": "unknown"},
                    {"name": "Image", "default": "unknown"},
                    {"name": "State", "default": "unknown"},
                    {"name": "Ports", "default": "unknown"},
                    {
                        "name": "Network",
                        "source": "HostConfig/NetworkMode",
                        "default": "unknown",
                    },
                    {
                        "name": "Compose_Stack",
                        "source": "Labels/com.docker.compose.project",
                        "default": "",
                    },
                    {
                        "name": "Compose_Service",
                        "source": "Labels/com.docker.compose.service",
                        "default": "",
                    },
                    {
                        "name": "Compose_Version",
                        "source": "Labels/com.docker.compose.version",
                        "default": "",
                    },
                ],
                ensure_vals=[
                    {"name": "Name", "default": "unknown"},
                    {"name": "EndpointId", "default": eid},
                ],
            )
            for cid in self.data["containers"]:
                self.data["containers"][cid]["Environment"] = self.data["endpoints"][
                    eid
                ]["Name"]
                self.data["containers"][cid]["Name"] = self.data["containers"][cid][
                    "Names"
                ][0][1:]
