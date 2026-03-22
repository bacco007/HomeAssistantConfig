"""Events endpoint for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from ..models import Event, EventType

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class EventsEndpoint:
    """Endpoint for managing UniFi Protect events."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the events endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(
        self,
        *,
        start: datetime | None = None,
        end: datetime | None = None,
        types: list[EventType | str] | None = None,
        camera_ids: list[str] | None = None,
        limit: int = 100,
        site_id: str | None = None,
    ) -> list[Event]:
        """
        List events.

        Args:
            start: Start time filter.
            end: End time filter.
            types: Event types to filter by.
            camera_ids: Camera IDs to filter by.
            limit: Maximum number of events to return.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of events.

        """
        path = self._client.build_api_path("/events", site_id)
        params: dict[str, Any] = {"limit": limit}

        if start is not None:
            params["start"] = int(start.timestamp() * 1000)
        if end is not None:
            params["end"] = int(end.timestamp() * 1000)
        if types is not None:
            params["types"] = ",".join(
                t.value if isinstance(t, EventType) else t for t in types
            )
        if camera_ids is not None:
            params["cameraIds"] = ",".join(camera_ids)

        response = await self._client._get(path, params=params)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Event.model_validate(item) for item in data]
        return []

    async def get(self, event_id: str, site_id: str | None = None) -> Event:
        """
        Get a specific event.

        Args:
            event_id: The event ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The event.

        """
        path = self._client.build_api_path(f"/events/{event_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Event.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Event.model_validate(data[0])
        raise ValueError(f"Event {event_id} not found")

    async def get_thumbnail(
        self,
        event_id: str,
        width: int | None = None,
        height: int | None = None,
        site_id: str | None = None,
    ) -> bytes:
        """
        Get event thumbnail image.

        Args:
            event_id: The event ID.
            width: Optional thumbnail width.
            height: Optional thumbnail height.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The thumbnail image bytes.

        """
        params: dict[str, Any] = {}
        if width is not None:
            params["w"] = width
        if height is not None:
            params["h"] = height

        path = self._client.build_api_path(f"/events/{event_id}/thumbnail", site_id)
        return await self._client._get_binary(path, params=params)

    async def get_heatmap(
        self,
        event_id: str,
        site_id: str | None = None,
    ) -> bytes:
        """
        Get event heatmap image.

        Args:
            event_id: The event ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The heatmap image bytes.

        """
        path = self._client.build_api_path(f"/events/{event_id}/heatmap", site_id)
        return await self._client._get_binary(path)

    async def list_motion_events(
        self,
        *,
        start: datetime | None = None,
        end: datetime | None = None,
        camera_ids: list[str] | None = None,
        limit: int = 100,
        site_id: str | None = None,
    ) -> list[Event]:
        """
        List motion events.

        Args:
            start: Start time filter.
            end: End time filter.
            camera_ids: Camera IDs to filter by.
            limit: Maximum number of events to return.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of motion events.

        """
        return await self.get_all(
            start=start,
            end=end,
            types=[EventType.MOTION],
            camera_ids=camera_ids,
            limit=limit,
            site_id=site_id,
        )

    async def list_smart_detect_events(
        self,
        *,
        start: datetime | None = None,
        end: datetime | None = None,
        camera_ids: list[str] | None = None,
        limit: int = 100,
        site_id: str | None = None,
    ) -> list[Event]:
        """
        List smart detect events.

        Args:
            start: Start time filter.
            end: End time filter.
            camera_ids: Camera IDs to filter by.
            limit: Maximum number of events to return.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of smart detect events.

        """
        return await self.get_all(
            start=start,
            end=end,
            types=[EventType.SMART_DETECT],
            camera_ids=camera_ids,
            limit=limit,
            site_id=site_id,
        )
