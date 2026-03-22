"""Networks endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Network

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class NetworksEndpoint:
    """Endpoint for managing network configurations."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the networks endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    async def get_all(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[Network]:
        """
        List all networks.

        Args:
            site_id: The site ID.
            offset: Number of networks to skip (pagination).
            limit: Maximum number of networks to return.
            filter_str: Filter string for network properties.

        Returns:
            List of networks.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/networks")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Network.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str, network_id: str) -> Network:
        """
        Get a specific network.

        Args:
            site_id: The site ID.
            network_id: The network ID.

        Returns:
            The network.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/networks/{network_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Network.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Network.model_validate(data[0])
        raise ValueError(f"Network {network_id} not found")

    async def create(
        self,
        site_id: str,
        *,
        name: str,
        vlan_id: int | None = None,
        subnet: str | None = None,
        dhcp_enabled: bool = True,
        **kwargs: Any,
    ) -> Network:
        """
        Create a new network.

        Args:
            site_id: The site ID.
            name: Network name.
            vlan_id: VLAN ID.
            subnet: Network subnet (e.g., "192.168.1.0/24").
            dhcp_enabled: Whether DHCP is enabled.
            **kwargs: Additional network parameters.

        Returns:
            The created network.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/networks")
        data: dict[str, Any] = {
            "name": name,
            "dhcpEnabled": dhcp_enabled,
        }
        if vlan_id is not None:
            data["vlanId"] = vlan_id
        if subnet is not None:
            data["subnet"] = subnet
        data.update(kwargs)

        response = await self._client._post(path, json_data=data)
        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Network.model_validate(result)
        raise ValueError("Failed to create network")

    async def update(
        self,
        site_id: str,
        network_id: str,
        **kwargs: Any,
    ) -> Network:
        """
        Update a network.

        Args:
            site_id: The site ID.
            network_id: The network ID.
            **kwargs: Network parameters to update.

        Returns:
            The updated network.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/networks/{network_id}")
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Network.model_validate(result)
        raise ValueError("Failed to update network")

    async def delete(self, site_id: str, network_id: str) -> bool:
        """
        Delete a network.

        Args:
            site_id: The site ID.
            network_id: The network ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/networks/{network_id}")
        await self._client._delete(path)
        return True

    async def get_references(self, site_id: str, network_id: str) -> dict[str, Any]:
        """
        Get references to a network.

        Returns information about what resources reference this network,
        such as WiFi broadcasts, firewall rules, or other configurations
        that use this network.

        Args:
            site_id: The site ID.
            network_id: The network ID.

        Returns:
            Dictionary containing references to this network.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/networks/{network_id}/references"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return data
        return {}
