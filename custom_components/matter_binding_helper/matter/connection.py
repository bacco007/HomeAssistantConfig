"""Optional direct connection to a Matter server (issue #61).

By default the integration uses the Matter client owned by Home Assistant's
Matter integration. When a server URL is configured, it instead connects
directly to that server — useful for a non-default location, a development
server, or as a fallback when reaching into HA's Matter integration breaks.

The configured URL must point at the same Matter server (controller / fabric)
the user otherwise runs, or commissioned devices will not be visible.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

# How long to wait for the server to push its initial node state after connect.
LISTEN_READY_TIMEOUT = 30


class DirectMatterConnection:
    """Owns a directly-connected matter-server client and its listen task."""

    def __init__(self, hass: HomeAssistant, url: str) -> None:
        self._hass = hass
        self._url = url
        self._client: Any = None
        self._listen_task: asyncio.Task | None = None
        self._ready = False

    @property
    def client(self) -> Any:
        """The connected client, or None until it is ready."""
        return self._client if self._ready else None

    async def async_connect(self) -> None:
        """Connect and wait for the server's initial state.

        Raises on connection failure or if the server never becomes ready, after
        cleaning up — the caller turns that into ConfigEntryNotReady.
        """
        # Imported lazily: python-matter-server is provided by HA's Matter
        # integration (a hard dependency of this integration).
        from matter_server.client import MatterClient

        self._client = MatterClient(self._url, async_get_clientsession(self._hass))
        await self._client.connect()

        init_ready = asyncio.Event()
        self._listen_task = self._hass.async_create_background_task(
            self._listen(init_ready), "matter_binding_helper_direct_listen"
        )
        try:
            async with asyncio.timeout(LISTEN_READY_TIMEOUT):
                await init_ready.wait()
        except TimeoutError:
            await self.async_disconnect()
            raise
        self._ready = True
        _LOGGER.info("Connected directly to Matter server at %s", self._url)

    async def _listen(self, init_ready: asyncio.Event) -> None:
        try:
            await self._client.start_listening(init_ready)
        except asyncio.CancelledError:
            raise
        except Exception as err:  # noqa: BLE001 - logged; reconnect is HA's job
            _LOGGER.warning("Direct Matter client listener stopped: %s", err)

    async def async_disconnect(self) -> None:
        """Cancel the listen task and disconnect the client."""
        self._ready = False
        if self._listen_task is not None:
            self._listen_task.cancel()
            self._listen_task = None
        if self._client is not None:
            try:
                await self._client.disconnect()
            except Exception as err:  # noqa: BLE001 - best-effort teardown
                _LOGGER.debug("Error disconnecting direct Matter client: %s", err)
            self._client = None
