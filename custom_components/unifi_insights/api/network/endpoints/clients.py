"""Clients endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

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

    async def block(self, site_id: str, client_id: str) -> bool:
        """
        Block a client.

        Args:
            site_id: The site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/block"
        )
        await self._client._post(path)
        return True

    async def unblock(self, site_id: str, client_id: str) -> bool:
        """
        Unblock a client.

        Args:
            site_id: The site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/unblock"
        )
        await self._client._post(path)
        return True

    async def reconnect(self, site_id: str, client_id: str) -> bool:
        """
        Force a client to reconnect.

        Args:
            site_id: The site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/reconnect"
        )
        await self._client._post(path)
        return True

    async def forget(self, site_id: str, client_id: str) -> bool:
        """
        Forget/remove a client from the network.

        Args:
            site_id: The site ID.
            client_id: The client ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/clients/{client_id}")
        await self._client._delete(path)
        return True

    async def execute_action(
        self,
        site_id: str,
        client_id: str,
        action: str,
    ) -> bool:
        """
        Execute an action on a client.

        Args:
            site_id: The site ID.
            client_id: The client ID.
            action: The action (block, unblock, reconnect).

        Returns:
            True if successful.

        """
        valid_actions = {"block", "unblock", "reconnect"}
        if action not in valid_actions:
            raise ValueError(f"Action must be one of: {', '.join(valid_actions)}")

        path = self._client.build_api_path(
            f"/sites/{site_id}/clients/{client_id}/{action}"
        )
        await self._client._post(path)
        return True
