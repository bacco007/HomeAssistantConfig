"""Switching LAG and MC-LAG endpoints for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.lag import LAG, McLagDomain

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class LagsEndpoint:
    """
    Endpoint for read-only access to switching LAGs and MC-LAG domains.

    Covers UniFi Network 10.4.57 ``/switching/lags`` and
    ``/switching/mc-lag-domains`` resources.
    """

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the LAGs endpoint.

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
    ) -> list[LAG]:
        """
        List all link aggregation groups for a site.

        Automatically paginates through all results when ``offset``/``limit``
        are not explicitly provided.

        Args:
            site_id: The site ID.
            offset: Pagination offset (single-page fetch when set).
            limit: Maximum results (single-page fetch when set).
            filter_str: Optional filter query string.

        Returns:
            List of LAGs.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/switching/lags")
        return await _list_paginated(self._client, path, LAG, offset, limit, filter_str)

    async def get(self, site_id: str, lag_id: str) -> LAG:
        """
        Get a specific link aggregation group.

        Args:
            site_id: The site ID.
            lag_id: The LAG ID.

        Returns:
            The LAG.

        Raises:
            ValueError: If the LAG is not found.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/switching/lags/{lag_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return LAG.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return LAG.model_validate(data[0])
        raise ValueError(f"LAG {lag_id} not found")

    async def get_mc_lag_domains(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[McLagDomain]:
        """
        List all multi-chassis LAG domains for a site.

        Args:
            site_id: The site ID.
            offset: Pagination offset (single-page fetch when set).
            limit: Maximum results (single-page fetch when set).
            filter_str: Optional filter query string.

        Returns:
            List of MC-LAG domains.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/switching/mc-lag-domains")
        return await _list_paginated(
            self._client, path, McLagDomain, offset, limit, filter_str
        )

    async def get_mc_lag_domain(
        self, site_id: str, mc_lag_domain_id: str
    ) -> McLagDomain:
        """
        Get a specific multi-chassis LAG domain.

        Args:
            site_id: The site ID.
            mc_lag_domain_id: The MC-LAG domain ID.

        Returns:
            The MC-LAG domain.

        Raises:
            ValueError: If the MC-LAG domain is not found.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/switching/mc-lag-domains/{mc_lag_domain_id}"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return McLagDomain.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return McLagDomain.model_validate(data[0])
        raise ValueError(f"MC-LAG domain {mc_lag_domain_id} not found")


async def _list_paginated(
    client: UniFiNetworkClient,
    path: str,
    model: type,
    offset: int | None,
    limit: int | None,
    filter_str: str | None,
) -> list[Any]:
    """
    Fetch a paginated Network list resource that returns ``totalCount``.

    When ``offset``/``limit`` are provided a single page is returned. Otherwise
    all pages are fetched using the ``count``/``totalCount`` envelope.
    """
    if offset is not None or limit is not None:
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str
        response = await client._get(path, params=params if params else None)
        return _parse_items(response, model)

    page_size = 100
    current_offset = 0
    results: list[Any] = []

    while True:
        params = {"offset": current_offset, "limit": page_size}
        if filter_str:
            params["filter"] = filter_str

        response = await client._get(path, params=params)
        if not isinstance(response, dict):
            break

        results.extend(_parse_items(response, model))

        total_count = response.get("totalCount")
        count = response.get("count", 0)
        if total_count is None or not isinstance(count, int) or count == 0:
            break

        current_offset += count
        if current_offset >= total_count:
            break

    return results


def _parse_items(response: Any, model: type) -> list[Any]:
    """Parse a wrapped or unwrapped list response into model instances."""
    if response is None:
        return []
    data = response.get("data", response) if isinstance(response, dict) else response
    if isinstance(data, list):
        return [model.model_validate(item) for item in data]
    return []
