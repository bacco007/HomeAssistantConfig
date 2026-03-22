"""Supporting resources endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.resources import (
    DeviceTag,
    RADIUSProfile,
    VPNServer,
    VPNTunnel,
    WANInterface,
)

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class ResourcesEndpoint:
    """Endpoint for accessing supporting network resources."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the resources endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    # WAN Interfaces

    async def get_wan_interfaces(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[WANInterface]:
        """
        List all WAN interfaces.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results.
            filter_str: Filter query string using API filter syntax.

        Returns:
            List of WAN interfaces.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/wans")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [WANInterface.model_validate(item) for item in data]
        return []

    # VPN Tunnels

    async def get_vpn_tunnels(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[VPNTunnel]:
        """
        List all site-to-site VPN tunnels.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results.
            filter_str: Filter query string using API filter syntax.

        Returns:
            List of VPN tunnels.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/vpn/tunnels")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [VPNTunnel.model_validate(item) for item in data]
        return []

    # VPN Servers

    async def get_vpn_servers(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[VPNServer]:
        """
        List all VPN servers.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results.
            filter_str: Filter query string using API filter syntax.

        Returns:
            List of VPN servers.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/vpn/servers")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [VPNServer.model_validate(item) for item in data]
        return []

    # RADIUS Profiles

    async def get_radius_profiles(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[RADIUSProfile]:
        """
        List all RADIUS profiles.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results.
            filter_str: Filter query string using API filter syntax.

        Returns:
            List of RADIUS profiles.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/radius/profiles")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [RADIUSProfile.model_validate(item) for item in data]
        return []

    # Device Tags

    async def get_device_tags(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[DeviceTag]:
        """
        List all device tags.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results.
            filter_str: Filter query string using API filter syntax.

        Returns:
            List of device tags.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/device-tags")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [DeviceTag.model_validate(item) for item in data]
        return []
