"""Clients endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ...exceptions import UniFiResponseError
from ..models import Client

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class ClientsEndpoint:
    """Endpoint for managing network clients."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the clients endpoint.

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
    ) -> list[Client]:
        """
        List all connected clients.

        Automatically paginates through all results when offset/limit
        are not explicitly provided.

        Args:
            site_id: The site ID.
            offset: Number of clients to skip (pagination).
            limit: Maximum number of clients to return.
            filter_str: Filter string for client properties.

        Returns:
            List of clients.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/clients")

        # When caller specifies offset/limit, do a single request (manual pagination)
        if offset is not None or limit is not None:
            params: dict[str, Any] = {}
            if offset is not None:
                params["offset"] = offset
            if limit is not None:
                params["limit"] = limit
            if filter_str:
                params["filter"] = filter_str
            return await self._fetch_page(path, params if params else None)

        # Auto-paginate: fetch all pages
        page_size = 100
        current_offset = 0
        all_clients: list[Client] = []

        while True:
            params = {"offset": current_offset, "limit": page_size}
            if filter_str:
                params["filter"] = filter_str

            response = await self._client._get(path, params=params)
            if response is None:
                break

            if not isinstance(response, dict):
                break

            data = response.get("data", response)
            if isinstance(data, list):
                all_clients.extend(
                    Client.model_validate(item) for item in data
                )

            total_count = response.get("totalCount")
            count = response.get("count", 0)
            if total_count is None or not isinstance(count, int) or count == 0:
                break

            current_offset += count
            if current_offset >= total_count:
                break

        return all_clients

    async def _fetch_page(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> list[Client]:
        """Fetch a single page of clients."""
        response = await self._client._get(path, params=params)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Client.model_validate(item) for item in data]
        return []

    async def get_active_legacy(self, site_name: str) -> list[dict[str, Any]]:
        """
        List active clients from the classic API (includes SSID/essid).

        The official Integration API ``/clients`` endpoint does not populate the
        ``essid`` field, so per-SSID client counts are derived from the classic
        ``/stat/sta`` endpoint instead.

        Args:
            site_name: The classic site name (for example ``default``).

        Returns:
            List of raw active-client dictionaries.

        """
        path = self._client.build_legacy_api_path(site_name, "/stat/sta")
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
        return []

    async def get(self, site_id: str, client_id: str) -> Client:
        """
        Get a specific client.

        Args:
            site_id: The site ID.
            client_id: The client ID or MAC address.

        Returns:
            The client.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/clients/{client_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Client.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Client.model_validate(data[0])
        raise ValueError(f"Client {client_id} not found")

    async def _stamgr_command(
        self,
        site_name: str,
        command: str,
        mac: str,
    ) -> bool:
        """
        Run a classic ("legacy") station-manager command for a client.

        The official Network Integration API does not expose block, unblock,
        reconnect, or forget operations (the client resource is read-only and
        ``/clients/{id}/actions`` only supports guest authorization). These
        actions are therefore issued against the classic API endpoint
        ``/api/s/{site}/cmd/stamgr``, which accepts the client MAC address.

        Args:
            site_name: The classic site name (for example ``default``).
            command: The stamgr command (``block-sta``, ``unblock-sta``,
                ``kick-sta``, ``forget-sta``).
            mac: The client MAC address.

        Returns:
            True if successful.

        """
        path = self._client.build_legacy_api_path(site_name, "/cmd/stamgr")
        response = await self._client._post(
            path, json_data={"cmd": command, "mac": mac}
        )
        # The classic API can return HTTP 200 with an error in the envelope.
        if isinstance(response, dict):
            meta = response.get("meta")
            if isinstance(meta, dict) and meta.get("rc") == "error":
                msg = meta.get("msg", "unknown error")
                raise UniFiResponseError(
                    f"Classic API command '{command}' failed: {msg}",
                    status_code=200,
                    response_body=str(meta),
                )
        return True

    async def block(self, site_name: str, mac: str) -> bool:
        """
        Block a client (classic API ``block-sta``).

        Args:
            site_name: The classic site name (for example ``default``).
            mac: The client MAC address.

        Returns:
            True if successful.

        """
        return await self._stamgr_command(site_name, "block-sta", mac)

    async def unblock(self, site_name: str, mac: str) -> bool:
        """
        Unblock a client (classic API ``unblock-sta``).

        Args:
            site_name: The classic site name (for example ``default``).
            mac: The client MAC address.

        Returns:
            True if successful.

        """
        return await self._stamgr_command(site_name, "unblock-sta", mac)

    async def reconnect(self, site_name: str, mac: str) -> bool:
        """
        Force a client to reconnect (classic API ``kick-sta``).

        Args:
            site_name: The classic site name (for example ``default``).
            mac: The client MAC address.

        Returns:
            True if successful.

        """
        return await self._stamgr_command(site_name, "kick-sta", mac)

    async def forget(self, site_name: str, mac: str) -> bool:
        """
        Forget/remove a client from the network (classic API ``forget-sta``).

        Args:
            site_name: The classic site name (for example ``default``).
            mac: The client MAC address.

        Returns:
            True if successful.

        """
        return await self._stamgr_command(site_name, "forget-sta", mac)

    async def execute_action(
        self,
        site_name: str,
        mac: str,
        action: str,
    ) -> bool:
        """
        Execute a client action via the classic station-manager endpoint.

        Args:
            site_name: The classic site name (for example ``default``).
            mac: The client MAC address.
            action: The action (``block``, ``unblock``, ``reconnect``,
                ``forget``).

        Returns:
            True if successful.

        """
        command_map = {
            "block": "block-sta",
            "unblock": "unblock-sta",
            "reconnect": "kick-sta",
            "forget": "forget-sta",
        }
        command = command_map.get(action)
        if command is None:
            raise ValueError(
                f"Action must be one of: {', '.join(sorted(command_map))}"
            )
        return await self._stamgr_command(site_name, command, mac)

    async def authorize_guest(
        self,
        site_id: str,
        client_id: str,
    ) -> bool:
        """
        Authorize guest access for a client (official Integration API).

        Args:
            site_id: The integration site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/actions"
        )
        await self._client._post(path, json_data={"action": "AUTHORIZE_GUEST_ACCESS"})
        return True

    async def unauthorize_guest(
        self,
        site_id: str,
        client_id: str,
    ) -> bool:
        """
        Remove guest authorization for a client (official Integration API).

        Args:
            site_id: The integration site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/actions"
        )
        await self._client._post(
            path, json_data={"action": "UNAUTHORIZE_GUEST_ACCESS"}
        )
        return True
