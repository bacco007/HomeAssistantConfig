"""LiveViews endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import LiveView

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class LiveViewsEndpoint:
    """Endpoint for managing UniFi Protect live views."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the live views endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[LiveView]:
        """
        List all live views.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of live views.

        """
        path = self._client.build_api_path("/liveviews", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [LiveView.model_validate(item) for item in data]
        return []

    async def get(self, liveview_id: str, site_id: str | None = None) -> LiveView:
        """
        Get a specific live view.

        Args:
            liveview_id: The live view ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The live view.

        """
        path = self._client.build_api_path(f"/liveviews/{liveview_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return LiveView.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return LiveView.model_validate(data[0])
        raise ValueError(f"LiveView {liveview_id} not found")

    async def create(
        self,
        *,
        name: str,
        layout: int = 1,
        slots: list[dict[str, Any]] | None = None,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> LiveView:
        """
        Create a new live view.

        Args:
            name: Name of the live view.
            layout: Layout grid size (1, 4, 9, 16).
            slots: List of slot configurations.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Additional parameters.

        Returns:
            The created live view.

        """
        path = self._client.build_api_path("/liveviews", site_id)
        data: dict[str, Any] = {
            "name": name,
            "layout": layout,
        }
        if slots is not None:
            data["slots"] = slots
        data.update(kwargs)

        response = await self._client._post(path, json_data=data)
        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return LiveView.model_validate(result)
        raise ValueError("Failed to create live view")

    async def update(
        self,
        liveview_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> LiveView:
        """
        Update a live view.

        Args:
            liveview_id: The live view ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Parameters to update.

        Returns:
            The updated live view.

        """
        path = self._client.build_api_path(f"/liveviews/{liveview_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return LiveView.model_validate(result)
        raise ValueError("Failed to update live view")

    async def delete(self, liveview_id: str, site_id: str | None = None) -> bool:
        """
        Delete a live view.

        Args:
            liveview_id: The live view ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/liveviews/{liveview_id}", site_id)
        await self._client._delete(path)
        return True
