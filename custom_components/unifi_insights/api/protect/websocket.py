"""WebSocket subscription support for UniFi Protect API."""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from typing import TYPE_CHECKING, Any

import aiohttp

if TYPE_CHECKING:
    from .client import UniFiProtectClient


class ProtectWebSocket:
    """
    WebSocket subscription manager for UniFi Protect.

    Provides real-time event streaming for device updates and Protect events.

    To use WebSocket subscriptions, you need a `host_id` and `site_id`:
    - `host_id`: The NVR ID, obtainable via `await client.get_host_id()`
    - `site_id`: For local connections, use "default". For remote, get from cloud API.

    Example:
        ```python
        # Get the host_id (NVR ID)
        host_id = await client.get_host_id()
        site_id = "default"  # For local connections

        # Subscribe to events
        async with client.websocket.subscribe_events(host_id, site_id) as events:
            async for event in events:
                print(f"Event type: {event.get('type')}")
        ```

    """

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize WebSocket manager.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client
        self._ws: aiohttp.ClientWebSocketResponse | None = None
        self._running = False

    async def _connect(
        self, path: str
    ) -> aiohttp.ClientWebSocketResponse:  # pragma: no cover
        """
        Establish WebSocket connection.

        Args:
            path: WebSocket endpoint path.

        Returns:
            WebSocket connection.

        """
        session = await self._client._ensure_session()
        url = str(self._client._build_url(path)).replace("https://", "wss://")
        headers = self._client._get_headers()

        ws = await session.ws_connect(url, headers=headers)
        return ws

    @asynccontextmanager
    async def subscribe_devices(  # pragma: no cover
        self,
        host_id: str,
        site_id: str,
    ) -> AsyncIterator[AsyncIterator[dict[str, Any]]]:
        """
        Subscribe to device update messages.

        Args:
            host_id: The host ID.
            site_id: The site ID.

        Yields:
            Async iterator of device update messages.

        Example:
            async with client.websocket.subscribe_devices(host_id, site_id) as updates:
                async for update in updates:
                    print(f"Device update: {update}")

        """
        path = f"/ea/hosts/{host_id}/sites/{site_id}/subscribe/devices"
        ws = await self._connect(path)
        self._running = True

        async def message_iterator() -> AsyncIterator[dict[str, Any]]:
            try:
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        try:
                            data = json.loads(msg.data)
                            yield data
                        except json.JSONDecodeError:
                            continue
                    elif msg.type in (
                        aiohttp.WSMsgType.ERROR,
                        aiohttp.WSMsgType.CLOSED,
                    ):
                        break
            finally:
                self._running = False

        try:
            yield message_iterator()
        finally:
            self._running = False
            await ws.close()

    @asynccontextmanager
    async def subscribe_events(  # pragma: no cover
        self,
        host_id: str,
        site_id: str,
    ) -> AsyncIterator[AsyncIterator[dict[str, Any]]]:
        """
        Subscribe to Protect event messages.

        Args:
            host_id: The host ID.
            site_id: The site ID.

        Yields:
            Async iterator of event messages.

        Example:
            async with client.websocket.subscribe_events(host_id, site_id) as events:
                async for event in events:
                    print(f"Event: {event}")

        """
        path = f"/ea/hosts/{host_id}/sites/{site_id}/subscribe/events"
        ws = await self._connect(path)
        self._running = True

        async def message_iterator() -> AsyncIterator[dict[str, Any]]:
            try:
                async for msg in ws:
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        try:
                            data = json.loads(msg.data)
                            yield data
                        except json.JSONDecodeError:
                            continue
                    elif msg.type in (
                        aiohttp.WSMsgType.ERROR,
                        aiohttp.WSMsgType.CLOSED,
                    ):
                        break
            finally:
                self._running = False

        try:
            yield message_iterator()
        finally:
            self._running = False
            await ws.close()

    async def subscribe_with_callback(
        self,
        host_id: str,
        site_id: str,
        subscription_type: str,
        callback: Callable[[dict[str, Any]], None],
        *,
        reconnect: bool = True,
        reconnect_delay: float = 5.0,
    ) -> None:
        """
        Subscribe with a callback function.

        Args:
            host_id: The host ID.
            site_id: The site ID.
            subscription_type: Type of subscription ("devices" or "events").
            callback: Function to call for each message.
            reconnect: Whether to automatically reconnect on disconnect.
            reconnect_delay: Delay in seconds before reconnecting.

        """
        if subscription_type not in ("devices", "events"):
            raise ValueError("subscription_type must be 'devices' or 'events'")

        self._running = True  # pragma: no cover

        while self._running:  # pragma: no cover
            try:
                path = (
                    f"/ea/hosts/{host_id}/sites/{site_id}/subscribe/{subscription_type}"
                )
                ws = await self._connect(path)

                async for msg in ws:
                    if not self._running:
                        break
                    if msg.type == aiohttp.WSMsgType.TEXT:
                        try:
                            data = json.loads(msg.data)
                            callback(data)
                        except json.JSONDecodeError:
                            continue
                    elif msg.type in (
                        aiohttp.WSMsgType.ERROR,
                        aiohttp.WSMsgType.CLOSED,
                    ):
                        break

                await ws.close()

            except (aiohttp.ClientError, asyncio.CancelledError):
                # Expected during disconnects or cancellations; allow reconnection logic below
                pass

            if self._running and reconnect:
                await asyncio.sleep(reconnect_delay)
            else:
                break

    def stop(self) -> None:
        """Stop the WebSocket subscription."""
        self._running = False
