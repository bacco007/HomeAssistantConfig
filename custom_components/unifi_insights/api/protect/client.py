"""UniFi Protect API client."""

from __future__ import annotations

from typing import Any

import aiohttp

from ..auth import ApiKeyAuth, LocalAuth
from ..base import BaseUniFiClient
from ..const import (
    DEFAULT_CONNECT_TIMEOUT,
    DEFAULT_TIMEOUT,
    PROTECT_API_BASE_URL,
    PROTECT_INTEGRATION_PATH,
    ConnectionType,
)
from ..exceptions import UniFiConnectionError, UniFiTimeoutError
from .endpoints import (
    ApplicationEndpoint,
    CamerasEndpoint,
    ChimesEndpoint,
    EventsEndpoint,
    LightsEndpoint,
    LiveViewsEndpoint,
    NVREndpoint,
    SensorsEndpoint,
    ViewersEndpoint,
)
from .websocket import ProtectWebSocket


class UniFiProtectClient(BaseUniFiClient):
    """
    Async client for the UniFi Protect API.

    This client provides access to the official UniFi Protect API for managing
    cameras, sensors, lights, chimes, viewers, and NVR settings.

    Supports two connection types:
    - LOCAL: Direct connection to a UniFi console (e.g., UDM-Pro at 192.168.1.1)
    - REMOTE: Cloud connection via api.ui.com (requires cloud API key)

    Example (Local Connection):
        ```python
        from custom_components.unifi_insights.api import LocalAuth, ConnectionType
        from custom_components.unifi_insights.api.protect import UniFiProtectClient

        async with UniFiProtectClient(
            auth=LocalAuth(api_key="your-local-api-key", verify_ssl=False),
            base_url="https://192.168.1.1",
            connection_type=ConnectionType.LOCAL,
        ) as client:
            # List all cameras (no site_id needed for local)
            cameras = await client.cameras.get_all()

            # Get a camera snapshot
            snapshot = await client.cameras.get_snapshot(camera_id="camera-id")
        ```

    Example (Remote/Cloud Connection):
        ```python
        from custom_components.unifi_insights.api import ApiKeyAuth, ConnectionType
        from custom_components.unifi_insights.api.protect import UniFiProtectClient

        async with UniFiProtectClient(
            auth=ApiKeyAuth(api_key="your-cloud-api-key"),
            connection_type=ConnectionType.REMOTE,
            console_id="your-console-id",
        ) as client:
            # List all cameras (site_id required for remote)
            cameras = await client.cameras.get_all(site_id="your-site-id")

            # Get a camera snapshot
            snapshot = await client.cameras.get_snapshot(
                camera_id="camera-id",
                site_id="your-site-id"
            )
        ```
    """

    def __init__(
        self,
        auth: ApiKeyAuth | LocalAuth,
        *,
        base_url: str | None = None,
        connection_type: ConnectionType = ConnectionType.LOCAL,
        console_id: str | None = None,
        session: aiohttp.ClientSession | None = None,
        timeout: int = DEFAULT_TIMEOUT,
        connect_timeout: int = DEFAULT_CONNECT_TIMEOUT,
    ) -> None:
        """
        Initialize the UniFi Protect client.

        Args:
            auth: API key authentication (ApiKeyAuth for cloud, LocalAuth for local).
            base_url: Base URL for the API. For LOCAL, this is the console IP
                (e.g., https://192.168.1.1). For REMOTE, defaults to api.ui.com.
            connection_type: Connection type (LOCAL or REMOTE).
            console_id: Console ID for REMOTE connections (required for REMOTE).
            session: Optional aiohttp session to reuse.
            timeout: Request timeout in seconds.
            connect_timeout: Connection timeout in seconds.

        Raises:
            ValueError: If REMOTE connection type is used without console_id.

        """
        # Determine base URL
        if base_url is None:
            if connection_type == ConnectionType.REMOTE:
                base_url = PROTECT_API_BASE_URL
            else:
                raise ValueError("base_url is required for LOCAL connection type")

        # Validate console_id for REMOTE
        if connection_type == ConnectionType.REMOTE and not console_id:
            raise ValueError("console_id is required for REMOTE connection type")

        super().__init__(
            auth=auth,
            base_url=base_url,
            session=session,
            timeout=timeout,
            connect_timeout=connect_timeout,
        )

        self._connection_type = connection_type
        self._console_id = console_id

        # Initialize endpoints
        self._cameras = CamerasEndpoint(self)
        self._sensors = SensorsEndpoint(self)
        self._lights = LightsEndpoint(self)
        self._chimes = ChimesEndpoint(self)
        self._nvr = NVREndpoint(self)
        self._liveviews = LiveViewsEndpoint(self)
        self._events = EventsEndpoint(self)
        self._viewers = ViewersEndpoint(self)
        self._application = ApplicationEndpoint(self)
        self._websocket = ProtectWebSocket(self)

    @property
    def connection_type(self) -> ConnectionType:
        """Return the connection type."""
        return self._connection_type

    @property
    def console_id(self) -> str | None:
        """Return the console ID (for REMOTE connections)."""
        return self._console_id

    def build_api_path(self, endpoint: str, site_id: str | None = None) -> str:
        """
        Build the full API path based on connection type.

        For LOCAL connections, the Protect API does not use site prefixes.
        For REMOTE connections, the site_id is included in the path.

        Args:
            endpoint: The API endpoint path (e.g., "/cameras", "/cameras/{id}").
            site_id: The site ID (required for REMOTE, ignored for LOCAL).

        Returns:
            Full API path with proper prefix for the connection type.

        """
        # Ensure endpoint starts with /
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"

        if self._connection_type == ConnectionType.LOCAL:
            # Local: /proxy/protect/integration/v1{endpoint}
            # Note: LOCAL Protect API does NOT use /sites/{site_id} prefix
            return f"{PROTECT_INTEGRATION_PATH}{endpoint}"
        # Remote: /v1/connector/consoles/{consoleId}/proxy/protect/...
        # .../integration/v1/sites/{siteId}{endpoint}
        if not site_id:
            raise ValueError("site_id is required for REMOTE connection type")
        base = f"/v1/connector/consoles/{self._console_id}"
        return f"{base}{PROTECT_INTEGRATION_PATH}/sites/{site_id}{endpoint}"

    @property
    def cameras(self) -> CamerasEndpoint:
        """Access camera management endpoints."""
        return self._cameras

    @property
    def sensors(self) -> SensorsEndpoint:
        """Access sensor management endpoints."""
        return self._sensors

    @property
    def lights(self) -> LightsEndpoint:
        """Access light management endpoints."""
        return self._lights

    @property
    def chimes(self) -> ChimesEndpoint:
        """Access chime management endpoints."""
        return self._chimes

    @property
    def nvr(self) -> NVREndpoint:
        """Access NVR management endpoints."""
        return self._nvr

    @property
    def liveviews(self) -> LiveViewsEndpoint:
        """Access live view management endpoints."""
        return self._liveviews

    @property
    def events(self) -> EventsEndpoint:
        """Access event management endpoints."""
        return self._events

    @property
    def viewers(self) -> ViewersEndpoint:
        """Access viewer management endpoints."""
        return self._viewers

    @property
    def application(self) -> ApplicationEndpoint:
        """Access application info and file management endpoints."""
        return self._application

    @property
    def websocket(self) -> ProtectWebSocket:
        """Access WebSocket subscription manager for real-time updates."""
        return self._websocket

    async def validate_connection(self) -> bool:
        """
        Validate the connection to the UniFi Protect API.

        Makes a simple API call to verify authentication and connectivity.

        Returns:
            True if the connection is valid.

        Raises:
            UniFiAuthenticationError: If authentication fails.
            UniFiConnectionError: If connection fails.

        """
        response = await self._get(self.build_api_path("/sites"))
        return response is not None

    async def get_sites(self) -> list[dict[str, Any]]:
        """
        Get list of available sites.

        Returns:
            List of site information dictionaries.

        """
        response = await self._get(self.build_api_path("/sites"))
        if response is None:
            return []
        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return data
        return []

    async def get_host_id(self) -> str:
        """
        Get the host ID for WebSocket subscriptions.

        The host ID is the NVR ID, which is required for WebSocket subscriptions.
        This is useful for establishing real-time event streams.

        Returns:
            The host ID (NVR ID).

        Raises:
            ValueError: If NVR info cannot be retrieved.

        Example:
            ```python
            # Get host_id for WebSocket subscriptions
            host_id = await client.get_host_id()
            site_id = "your-site-id"  # Or get from client.get_sites()

            async with client.websocket.subscribe_events(host_id, site_id) as events:
                async for event in events:
                    print(f"Event: {event}")
            ```

        """
        nvr = await self.nvr.get()
        return nvr.id

    async def _get_binary(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
    ) -> bytes:
        """
        Make a GET request that returns binary data.

        Args:
            path: API path.
            params: Query parameters.

        Returns:
            Binary response data.

        Raises:
            UniFiConnectionError: If connection fails.
            UniFiTimeoutError: If request times out.

        """
        session = await self._ensure_session()
        url = self._build_url(path)
        headers = self._get_headers()
        # Remove JSON content type for binary requests
        headers.pop("Content-Type", None)
        headers["Accept"] = "*/*"

        try:
            async with session.get(
                url,
                params=params,
                headers=headers,
            ) as response:
                if response.status >= 400:
                    text = await response.text()
                    raise UniFiConnectionError(
                        f"Failed to fetch binary data: {response.status} - {text}"
                    )
                return await response.read()

        except aiohttp.ClientConnectorError as err:
            raise UniFiConnectionError(f"Failed to connect to {url}: {err}") from err
        except TimeoutError as err:
            raise UniFiTimeoutError(f"Request to {url} timed out") from err
        except aiohttp.ClientError as err:
            raise UniFiConnectionError(f"Request to {url} failed: {err}") from err
