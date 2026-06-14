import asyncio
import logging
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import DockhandAuthError, DockhandClient
from .const import (
    CONF_ENABLE_IMAGES,
    CONF_ENABLE_NETWORKS,
    CONF_ENABLE_SCHEDULES,
    CONF_ENABLE_VOLUMES,
    CONF_POLL_INTERVAL,
    CONF_POLL_INTERVAL_SLOW,
    CONF_POLL_INTERVAL_UPDATES,
    DEFAULT_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL_SLOW,
    DEFAULT_POLL_INTERVAL_UPDATES,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


def _safe_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _unwrap(val: Any, default: Any, label: str) -> Any:
    if isinstance(val, Exception):
        _LOGGER.warning("Dockhand: error fetching %s: %s", label, val)
        return default
    return val


class DockhandFastCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls 60s: dashboard stats, containers, stacks, container resource stats.

    Shape: {
        env_id: {
            "stats": {},
            "containers": [],
            "stacks": [],
            "container_stats": {name: {}},
        }
    }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        config: dict[str, Any],
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_fast",
            update_interval=timedelta(
                seconds=int(config.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self._fetch()
        except DockhandAuthError as err:
            # Token is invalid or revoked — surface immediately so HA prompts
            # the user to re-authenticate. No retry is possible without a new token.
            raise ConfigEntryAuthFailed(
                "Dockhand API token is invalid or was revoked. "
                "Go to Settings → Devices & Services → Dockhand → Re-authenticate."
            ) from err
        except Exception as err:
            raise UpdateFailed(f"Fast data error: {err}") from err

    async def _fetch(self) -> dict[str, Any]:
        environments_list = _safe_list(await self.client.async_get_environments())

        # Fetch stats for all environments in a single API call, then index by id.
        # Failure here is non-fatal — containers/stacks still update, stats
        # entities show unavailable until the next successful poll.
        try:
            all_stats_list = _safe_list(
                await self.client.async_get_all_dashboard_stats()
            )
        except Exception as err:
            _LOGGER.warning("Dockhand: error fetching dashboard stats: %s", err)
            all_stats_list = []
        all_stats: dict[int, dict] = {
            s["id"]: s for s in all_stats_list if isinstance(s, dict) and "id" in s
        }

        async def _fetch_env(env: dict) -> tuple[int, dict]:
            eid = env["id"]
            results = await asyncio.gather(
                self.client.async_get_containers(eid),
                self.client.async_get_stacks(eid),
                self.client.async_get_container_stats(eid),
                return_exceptions=True,
            )
            # Index container stats by name for O(1) lookup from sensor entities.
            # Stopped/exited containers are absent from the stats response — their
            # sensors will return None (unavailable) until the container is running.
            raw_stats = _safe_list(
                _unwrap(results[2], [], f"container_stats env={eid}")
            )
            container_stats: dict[str, dict] = {
                s["name"]: s for s in raw_stats if isinstance(s, dict) and "name" in s
            }
            return eid, {
                "stats": all_stats.get(eid, {}),
                "containers": _safe_list(
                    _unwrap(results[0], [], f"containers env={eid}")
                ),
                "stacks": _safe_list(_unwrap(results[1], [], f"stacks env={eid}")),
                "container_stats": container_stats,
            }

        out: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env(e) for e in environments_list], return_exceptions=True
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand fast env error: %s", result)
            else:
                eid, data = result
                out[eid] = data
        return out


class DockhandSlowCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls 600s: images, volumes, networks, schedules (all optional).

    Shape: {
        "environments": {
            env_id: {"env": {}, "images": [], "networks": [], "volumes": []}
        },
        "schedules": []
    }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        config: dict[str, Any],
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        self._enable_schedules = bool(config.get(CONF_ENABLE_SCHEDULES, False))
        self._enable_images = bool(config.get(CONF_ENABLE_IMAGES, False))
        self._enable_volumes = bool(config.get(CONF_ENABLE_VOLUMES, False))
        self._enable_networks = bool(config.get(CONF_ENABLE_NETWORKS, False))
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_slow",
            update_interval=timedelta(
                seconds=int(
                    config.get(CONF_POLL_INTERVAL_SLOW, DEFAULT_POLL_INTERVAL_SLOW)
                )
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self._fetch()
        except DockhandAuthError as err:
            # Let the fast coordinator own reauth — just surface as transient failure.
            raise UpdateFailed(
                "API token rejected — fast coordinator will surface reauth"
            ) from err
        except Exception as err:
            raise UpdateFailed(f"Slow data error: {err}") from err

    async def _fetch(self) -> dict[str, Any]:
        top_coros: list = [self.client.async_get_environments()]
        if self._enable_schedules:
            top_coros.append(self.client.async_get_schedules())
        top_results = await asyncio.gather(*top_coros, return_exceptions=True)

        # Environments are required — re-raise any exception from that call.
        if isinstance(top_results[0], BaseException):
            raise top_results[0]
        environments_list = _safe_list(top_results[0])
        schedules = (
            _safe_list(_unwrap(top_results[1], [], "schedules"))
            if self._enable_schedules and len(top_results) > 1
            else []
        )

        async def _fetch_env(env: dict) -> tuple[int, dict]:
            eid = env["id"]

            # Build a named mapping of coroutines so result indexing is
            # explicit rather than fragile positional arithmetic.
            named: dict[str, Any] = {}
            if self._enable_images:
                named["images"] = self.client.async_get_images(eid)
            if self._enable_networks:
                named["networks"] = self.client.async_get_networks(eid)
            if self._enable_volumes:
                named["volumes"] = self.client.async_get_volumes(eid)

            results: dict[str, list] = {}
            if named:
                keys = list(named)
                gathered = await asyncio.gather(*named.values(), return_exceptions=True)
                for key, val in zip(keys, gathered, strict=False):
                    results[key] = _safe_list(_unwrap(val, [], f"{key} env={eid}"))

            return eid, {
                "env": env,
                "images": results.get("images", []),
                "networks": results.get("networks", []),
                "volumes": results.get("volumes", []),
            }

        environments: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env(e) for e in environments_list], return_exceptions=True
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand slow env error: %s", result)
            else:
                eid, data = result
                environments[eid] = data
        return {"environments": environments, "schedules": schedules}


class DockhandUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls for container image update availability.

    Default interval: 86400s (24 hours). Only created when the user enables
    the update platform (CONF_ENABLE_UPDATES). Each poll calls
    POST /api/containers/check-updates for every environment, which performs
    real registry queries — deliberately infrequent to avoid bogging down
    the Docker host.

    Requires a reference to the fast coordinator so it can reuse the already-
    fetched environment list rather than making a redundant API call.

    Data shape:
        {
            env_id: {
                container_id: {
                    "containerName": str,
                    "imageName": str,
                    "hasUpdate": bool,
                    "currentDigest": str,
                    "newDigest": str,          # only present when hasUpdate=True
                    "systemContainer": str | None,
                    "updateDisabled": bool,
                }
            }
        }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        fast_coordinator: DockhandFastCoordinator,
        config: dict[str, Any],
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        self._fast = fast_coordinator
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_updates",
            update_interval=timedelta(
                seconds=int(
                    config.get(
                        CONF_POLL_INTERVAL_UPDATES, DEFAULT_POLL_INTERVAL_UPDATES
                    )
                )
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self._fetch()
        except DockhandAuthError as err:
            raise UpdateFailed(
                "API token rejected — fast coordinator will surface reauth"
            ) from err
        except Exception as err:
            raise UpdateFailed(f"Update check error: {err}") from err

    async def _fetch(self) -> dict[str, Any]:
        # Reuse the fast coordinator's environment list — it is always fresher
        # than making a separate async_get_environments() call and avoids a
        # redundant API round trip on every update check.
        env_ids = list(self._fast.data.keys()) if self._fast.data else []

        async def _fetch_env(eid: int) -> tuple[int, dict[str, dict]]:
            try:
                results = await self.client.async_check_container_updates(eid)
            except Exception as exc:
                _LOGGER.warning(
                    "Dockhand: update check failed for env %s: %s", eid, exc
                )
                results = []
            # Index by container ID for O(1) lookup by update entities.
            return eid, {
                item["containerId"]: item for item in results if item.get("containerId")
            }

        out: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env(eid) for eid in env_ids], return_exceptions=True
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand update env error: %s", result)
            else:
                eid, data = result
                out[eid] = data
        return out
