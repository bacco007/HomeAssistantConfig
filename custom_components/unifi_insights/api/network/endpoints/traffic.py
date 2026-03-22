"""Traffic Matching endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.traffic import (
    Country,
    DPIApplication,
    DPICategory,
    TrafficMatchingList,
    TrafficMatchingType,
)

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class TrafficEndpoint:
    """Endpoint for managing traffic matching lists and DPI resources."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the traffic endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    # Traffic Matching Lists

    async def get_all_lists(
        self,
        site_id: str,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[TrafficMatchingList]:
        """
        List all traffic matching lists.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results (max 200).
            filter_str: Filter query string using API filter syntax.
                Example: "type.eq('IP_ADDRESS')" or "name.like('block*')"

        Returns:
            List of traffic matching lists.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = min(limit, 200)
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/traffic-matching-lists")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [TrafficMatchingList.model_validate(item) for item in data]
        return []

    async def get_list(self, site_id: str, list_id: str) -> TrafficMatchingList:
        """
        Get a specific traffic matching list.

        Args:
            site_id: The site ID.
            list_id: The list ID.

        Returns:
            The traffic matching list.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/traffic-matching-lists/{list_id}"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return TrafficMatchingList.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return TrafficMatchingList.model_validate(data[0])
        raise ValueError(f"Traffic matching list {list_id} not found")

    async def create_list(
        self,
        site_id: str,
        *,
        name: str,
        list_type: TrafficMatchingType,
        entries: list[str] | None = None,
        description: str | None = None,
    ) -> TrafficMatchingList:
        """
        Create a new traffic matching list.

        Args:
            site_id: The site ID.
            name: List name.
            list_type: List type.
            entries: List entries.
            description: Optional description.

        Returns:
            The created traffic matching list.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/traffic-matching-lists")
        data: dict[str, Any] = {
            "name": name,
            "type": list_type.value,
            "entries": entries or [],
        }
        if description:
            data["description"] = description

        response = await self._client._post(path, json_data=data)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return TrafficMatchingList.model_validate(result)
        raise ValueError("Failed to create traffic matching list")

    async def update_list(
        self,
        site_id: str,
        list_id: str,
        **kwargs: Any,
    ) -> TrafficMatchingList:
        """
        Update a traffic matching list.

        Args:
            site_id: The site ID.
            list_id: The list ID.
            **kwargs: Parameters to update.

        Returns:
            The updated traffic matching list.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/traffic-matching-lists/{list_id}"
        )
        response = await self._client._put(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return TrafficMatchingList.model_validate(result)
        raise ValueError("Failed to update traffic matching list")

    async def delete_list(self, site_id: str, list_id: str) -> bool:
        """
        Delete a traffic matching list.

        Args:
            site_id: The site ID.
            list_id: The list ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/traffic-matching-lists/{list_id}"
        )
        await self._client._delete(path)
        return True

    # DPI Resources

    async def get_dpi_categories(self, site_id: str) -> list[DPICategory]:
        """
        List all DPI categories.

        Args:
            site_id: The site ID.

        Returns:
            List of DPI categories.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dpi/categories")
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [DPICategory.model_validate(item) for item in data]
        return []

    async def get_dpi_applications(self, site_id: str) -> list[DPIApplication]:
        """
        List all DPI applications.

        Args:
            site_id: The site ID.

        Returns:
            List of DPI applications.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dpi/applications")
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [DPIApplication.model_validate(item) for item in data]
        return []

    async def get_countries(self, site_id: str) -> list[Country]:
        """
        List all countries/regions.

        Args:
            site_id: The site ID.

        Returns:
            List of countries.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/geo/countries")
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Country.model_validate(item) for item in data]
        return []
