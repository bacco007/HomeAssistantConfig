"""
Vendored UniFi API client package for UniFi Network and Protect.

This package provides async Python clients for the UniFi APIs used by the
integration:
- UniFi Network API: Manage network devices, clients, WiFi, and more
- UniFi Protect API: Manage cameras, sensors, lights, and NVR settings

Supports both LOCAL (direct to device) and REMOTE (via cloud) connections.

Example (Local Connection):
    ```python
    from custom_components.unifi_insights.api import LocalAuth, ConnectionType
    from custom_components.unifi_insights.api.network import UniFiNetworkClient

    async with UniFiNetworkClient(
        auth=LocalAuth(api_key="your-local-api-key", verify_ssl=False),
        base_url="https://192.168.1.1",
        connection_type=ConnectionType.LOCAL,
    ) as client:
        sites = await client.sites.get_all()
        devices = await client.devices.get_all(site_id="default")
    ```

Example (Remote/Cloud Connection):
    ```python
    from custom_components.unifi_insights.api import ApiKeyAuth, ConnectionType
    from custom_components.unifi_insights.api.network import UniFiNetworkClient

    async with UniFiNetworkClient(
        auth=ApiKeyAuth(api_key="your-cloud-api-key"),
        connection_type=ConnectionType.REMOTE,
        console_id="your-console-id",
    ) as client:
        sites = await client.sites.get_all()
        devices = await client.devices.get_all(site_id="default")
    ```
"""

from __future__ import annotations

from ._version import __version__
from .auth import ApiKeyAuth, ApiKeyType, LocalAuth
from .const import ConnectionType
from .exceptions import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiError,
    UniFiNotFoundError,
    UniFiRateLimitError,
    UniFiResponseError,
    UniFiTimeoutError,
    UniFiValidationError,
)

__all__ = [
    # Version
    "__version__",
    # Authentication
    "ApiKeyAuth",
    "ApiKeyType",
    "LocalAuth",
    # Connection types
    "ConnectionType",
    # Exceptions
    "UniFiAuthenticationError",
    "UniFiConnectionError",
    "UniFiError",
    "UniFiNotFoundError",
    "UniFiRateLimitError",
    "UniFiResponseError",
    "UniFiTimeoutError",
    "UniFiValidationError",
]
