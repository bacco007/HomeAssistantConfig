import logging
from typing import Any

from aiohttp import ClientSession, ClientTimeout

_LOGGER = logging.getLogger(__name__)


class DockhandError(Exception):
    """Base class for Dockhand API errors."""


class DockhandAuthError(DockhandError):
    """Authentication failed — 401 received.

    With token auth this means the token is invalid or revoked.
    With no-auth installs it means authentication was re-enabled in Dockhand.
    """


class DockhandClient:
    """Client for interacting with the Dockhand API.

    Authentication is handled via an optional Bearer token (dh_...).
    When no token is stored the client sends unauthenticated requests,
    which works when Dockhand authentication is disabled.
    """

    def __init__(self, session: ClientSession, config: dict[str, Any]) -> None:
        self._session = session
        self._api_url = config.get("api_url", "").rstrip("/")
        self._api_token: str | None = config.get("api_token")

    # ------------------------------------------------------------------ #
    # Internal helper
    # ------------------------------------------------------------------ #

    async def _request(
        self, method: str, path: str, timeout_seconds: int = 30, **kwargs
    ) -> Any:
        url = f"{self._api_url}{path}"
        headers = kwargs.pop("headers", {})

        if self._api_token:
            headers["Authorization"] = f"Bearer {self._api_token}"

        headers.setdefault("Accept", "application/json")

        timeout = ClientTimeout(total=timeout_seconds)
        async with self._session.request(
            method, url, headers=headers, timeout=timeout, **kwargs
        ) as resp:
            if resp.status == 401:
                raise DockhandAuthError("Unauthorized — token invalid or revoked")
            if resp.status >= 400:
                text = await resp.text()
                raise DockhandError(f"API error {resp.status}: {text}")
            try:
                return await resp.json(content_type=None)
            except Exception:
                return await resp.text()

    # ------------------------------------------------------------------ #
    # Connectivity probe — used by config flow to detect auth state
    # ------------------------------------------------------------------ #

    async def async_probe(self) -> None:
        """Probe the server by fetching environments.

        Raises DockhandAuthError on 401, DockhandError on other failures,
        or an aiohttp exception if the server is unreachable.
        """
        await self.async_get_environments()

    # ------------------------------------------------------------------ #
    # Read endpoints
    # ------------------------------------------------------------------ #

    async def async_get_environments(self) -> list[dict[str, Any]]:
        return await self._request("GET", "/api/environments")

    async def async_get_dashboard_stats(self, env_id: int) -> dict[str, Any]:
        return await self._request("GET", f"/api/dashboard/stats?env={env_id}")

    async def async_get_all_dashboard_stats(self) -> list[dict[str, Any]]:
        """Fetch dashboard stats for all environments in a single call.

        GET /api/dashboard/stats (no env parameter)

        Returns a list of environment stat objects, each identical in shape
        to the single-env response, with an 'id' field for correlation.
        More efficient than N per-environment calls on each fast poll cycle.
        """
        result = await self._request("GET", "/api/dashboard/stats")
        return result if isinstance(result, list) else []

    async def async_get_container_stats(self, env_id: int) -> list[dict[str, Any]]:
        """Fetch resource stats for all running containers in an environment.

        GET /api/containers/stats?env=X

        Returns one entry per running container.  Stopped, exited, or created
        containers are absent from the response — callers should treat a missing
        entry as unavailable rather than zero.

        Response fields per container:
            id            str   — full container SHA256
            name          str   — container name (used as lookup key)
            cpuPercent    float — CPU usage as a percentage of host capacity
            memoryUsage   int   — effective memory in bytes (raw minus cache),
                                  matches Docker CLI 'docker stats' display
            memoryRaw     int   — total memory bytes before cache subtraction
            memoryCache   int   — page-cache bytes (memoryRaw - memoryUsage)
            memoryLimit   int   — configured limit, or host RAM when unconstrained
            memoryPercent float — memoryUsage / memoryLimit * 100
            networkRx     int   — cumulative bytes received (resets on restart)
            networkTx     int   — cumulative bytes transmitted (resets on restart)
            blockRead     int   — cumulative bytes read from block devices
            blockWrite    int   — cumulative bytes written to block devices
        """
        result = await self._request("GET", f"/api/containers/stats?env={env_id}")
        return result if isinstance(result, list) else []

    async def async_get_containers(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/containers?env={env_id}")

    async def async_get_stacks(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/stacks?env={env_id}")

    async def async_get_networks(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/networks?env={env_id}")

    async def async_get_images(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/images?env={env_id}")

    async def async_get_schedules(self) -> list[dict[str, Any]]:
        """Return all schedules (global, not per-environment). GET /api/schedules"""
        data = await self._request("GET", "/api/schedules")
        if isinstance(data, dict):
            return data.get("schedules", [])
        return data if isinstance(data, list) else []

    async def async_get_volumes(self, env_id: int) -> list[dict[str, Any]]:
        """Return volumes for an environment. GET /api/volumes?env=X"""
        return await self._request("GET", f"/api/volumes?env={env_id}")

    # ------------------------------------------------------------------ #
    # Container actions
    # ------------------------------------------------------------------ #

    async def async_start_container(self, env_id: int, container_id: str) -> None:
        """Start a stopped container. POST /api/containers/[id]/start?env=X"""
        await self._request(
            "POST", f"/api/containers/{container_id}/start?env={env_id}"
        )

    async def async_stop_container(self, env_id: int, container_id: str) -> None:
        """Stop a running container. POST /api/containers/[id]/stop?env=X"""
        await self._request("POST", f"/api/containers/{container_id}/stop?env={env_id}")

    async def async_restart_container(self, env_id: int, container_id: str) -> None:
        """Restart a running container. POST /api/containers/[id]/restart?env=X"""
        await self._request(
            "POST", f"/api/containers/{container_id}/restart?env={env_id}"
        )

    async def async_check_container_updates(self, env_id: int) -> list[dict[str, Any]]:
        """Check for available image updates for all containers in an environment.

        POST /api/containers/check-updates?env=X

        Sending Accept: application/json (set by _request default) causes
        Dockhand to run the registry check synchronously and return results
        directly rather than a job-ID reference for async polling.

        Response shape (confirmed fields):
          containerId     str        — Docker container ID
          containerName   str        — Container name
          imageName       str        — Full image reference
          hasUpdate       bool       — True when a newer digest is available
          currentDigest   str        — Current image digest.
                                       Format: "image@sha256:<hex>"
          newDigest       str        — New image digest.
                                       Format: "sha256:<hex>".
                                       Only present when hasUpdate=True.
          systemContainer str | None — Non-null for Dockhand infrastructure containers
                                       (e.g. "hawser"). These cannot be updated via
                                       batch-update even when hasUpdate=True.
          updateDisabled  bool       — True when dockhand.update=false label is set
        """
        data = await self._request(
            "POST", f"/api/containers/check-updates?env={env_id}"
        )
        results = data.get("results") if isinstance(data, dict) else data
        return results if isinstance(results, list) else []

    async def async_batch_update_container(
        self, env_id: int, container_id: str
    ) -> None:
        """Trigger an image pull and container recreation for a single container.

        POST /api/containers/batch-update?env=X
        Body: {"containerIds": [container_id]}

        Pulls the latest image, then recreates the container preserving all
        settings. Note: vulnerability scanning and criteria evaluation are not
        applied by this endpoint — that workflow is only available through the
        Dockhand UI. A warning is surfaced in the HA update entity's release
        summary when scanning is enabled on the environment.

        A generous timeout is used (300 s) because the operation must pull the
        image before recreating the container, which can be slow on limited
        connections or for large images.
        """
        await self._request(
            "POST",
            f"/api/containers/batch-update?env={env_id}",
            timeout_seconds=300,
            json={"containerIds": [container_id]},
        )

    # ------------------------------------------------------------------ #
    # Stack actions
    #
    # Stack endpoints support long-running operations. Sending
    # Accept: application/json (set by _request's default) causes Dockhand
    # to run the operation synchronously and return a single JSON result
    # rather than a job-ID reference for async polling. This ensures our
    # switch/button entities surface real success or failure.
    # ------------------------------------------------------------------ #

    async def async_start_stack(self, env_id: int, stack_name: str) -> None:
        """Start a stopped stack. POST /api/stacks/[name]/start?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/start?env={env_id}")

    async def async_stop_stack(self, env_id: int, stack_name: str) -> None:
        """Stop a running stack. POST /api/stacks/[name]/stop?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/stop?env={env_id}")

    async def async_restart_stack(self, env_id: int, stack_name: str) -> None:
        """Restart a running stack. POST /api/stacks/[name]/restart?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/restart?env={env_id}")
