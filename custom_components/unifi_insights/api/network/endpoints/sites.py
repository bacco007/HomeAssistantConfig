"""Sites endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Site

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class SitesEndpoint:
    """Endpoint for managing UniFi sites."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the sites endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    async def get_all(
        self,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[Site]:
        """
        List all sites.

        Args:
            offset: Number of sites to skip (pagination).
            limit: Maximum number of sites to return.
            filter_str: Filter string for site properties.

        Returns:
            List of sites.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path("/sites")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Site.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str) -> Site:
        """
        Get a specific site.

        Args:
            site_id: The site ID.

        Returns:
            The site.

        """
        path = self._client.build_api_path(f"/sites/{site_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Site.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Site.model_validate(data[0])
        raise ValueError(f"Site {site_id} not found")

    async def get_legacy_all(self) -> list[dict[str, Any]]:
        """
        List all sites from the legacy Network API.

        Returns:
            Raw legacy site dictionaries from ``/self/sites``.

        """
        path = self._client.build_legacy_global_api_path("/self/sites")
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [item for item in data if isinstance(item, dict)]
        if isinstance(data, dict):
            return [data]
        return []
