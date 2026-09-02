"""VPN Clients endpoint for UniFi Network API."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from custom_components.unifi_insights.api.const import ENDPOINT_NETWORKCONF
from custom_components.unifi_insights.api.exceptions import UniFiResponseError
from custom_components.unifi_insights.api.network.models.vpn_client import VpnClient

if TYPE_CHECKING:
    from custom_components.unifi_insights.api.network.client import UniFiNetworkClient

_LOGGER = logging.getLogger(__name__)


class VpnClientsEndpoint:
    """
    Endpoint for managing VPN Client network configurations.

    Targets the controller endpoint:
    ``/proxy/network/api/s/{site_name}/rest/networkconf``
    """

    def __init__(self, client: UniFiNetworkClient) -> None:
        """Initialize the VPN Clients endpoint."""
        self._client = client

    def _extract_items(self, response: Any) -> list[dict[str, Any]]:
        """Extract data items from a legacy response envelope."""
        if response is None:
            return []

        if isinstance(response, dict):
            meta = response.get("meta")
            if isinstance(meta, dict) and meta.get("rc") == "error":
                msg = meta.get("msg", "UniFi Network API error")
                raise UniFiResponseError(
                    msg, status_code=200, response_body=str(response)
                )

            data = response.get("data", response)
            if isinstance(data, list):
                return [item for item in data if isinstance(item, dict)]
            if isinstance(data, dict):
                return [data]
            return []

        if isinstance(response, list):
            return [item for item in response if isinstance(item, dict)]

        return []

    async def list_vpn_clients(self, site_name: str = "default") -> list[VpnClient]:
        """
        List all VPN Client connections configured for a site.

        Args:
            site_name: The UniFi classic site name (default: "default").

        Returns:
            List of VpnClient models.

        """
        path = self._client.build_legacy_api_path(site_name, ENDPOINT_NETWORKCONF)
        response = await self._client._get(path)
        items = self._extract_items(response)

        clients: list[VpnClient] = []
        for item in items:
            if item.get("purpose") != "vpn-client":
                continue
            try:
                clients.append(VpnClient.model_validate(item))
            except Exception as err:
                _LOGGER.debug("Skipping invalid VPN client item: %s", err)
                continue

        return clients

    async def get_vpn_client(self, site_name: str, client_id: str) -> VpnClient:
        """
        Get a specific VPN client configuration by ID.

        Args:
            site_name: The UniFi classic site name.
            client_id: The ID of the VPN client network.

        Returns:
            The VpnClient model.

        Raises:
            ValueError: If the VPN client is not found.

        """
        path = self._client.build_legacy_api_path(
            site_name, f"{ENDPOINT_NETWORKCONF}/{client_id}"
        )
        response = await self._client._get(path)
        items = self._extract_items(response)
        for item in items:
            if (
                item.get("_id") == client_id or item.get("id") == client_id
            ) and item.get("purpose") == "vpn-client":
                return VpnClient.model_validate(item)

        all_clients = await self.list_vpn_clients(site_name)
        for client in all_clients:
            if client.id == client_id:
                return client

        msg = f"VPN Client {client_id} not found"
        raise ValueError(msg)

    async def update_vpn_client(
        self,
        site_name: str,
        client_id: str,
        *,
        enabled: bool | None = None,
        **kwargs: Any,
    ) -> VpnClient:
        """
        Update a VPN client configuration (e.g. enable/disable).

        Args:
            site_name: The UniFi classic site name.
            client_id: The ID of the VPN client network.
            enabled: Set enabled state (True/False).
            **kwargs: Additional fields to update.

        Returns:
            The updated VpnClient model.

        Raises:
            ValueError: If the VPN client is not found.

        """
        path = self._client.build_legacy_api_path(
            site_name, f"{ENDPOINT_NETWORKCONF}/{client_id}"
        )
        response = await self._client._get(path)
        items = self._extract_items(response)

        current_payload: dict[str, Any] | None = None
        for item in items:
            if (
                item.get("_id") == client_id or item.get("id") == client_id
            ) and item.get("purpose") == "vpn-client":
                current_payload = item
                break

        if current_payload is None:
            # Fall back to list_vpn_clients search
            list_path = self._client.build_legacy_api_path(
                site_name, ENDPOINT_NETWORKCONF
            )
            list_response = await self._client._get(list_path)
            for item in self._extract_items(list_response):
                if (
                    item.get("_id") == client_id or item.get("id") == client_id
                ) and item.get("purpose") == "vpn-client":
                    current_payload = item
                    break

        if current_payload is None:
            msg = f"VPN Client {client_id} not found"
            raise ValueError(msg)

        current_payload = dict(current_payload)
        if enabled is not None:
            current_payload["enabled"] = enabled

        current_payload.update(kwargs)

        put_response = await self._client._put(path, json_data=current_payload)
        put_items = self._extract_items(put_response)
        if put_items:
            return VpnClient.model_validate(put_items[0])

        return VpnClient.model_validate(current_payload)
