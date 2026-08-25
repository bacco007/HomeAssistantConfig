"""Alarm hub endpoint for UniFi Protect API."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from pydantic import ValidationError

from ..models import AlarmHub

if TYPE_CHECKING:
    from ..client import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class AlarmHubsEndpoint:
    """Endpoint for managing UniFi Protect alarm hubs."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the alarm hubs endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[AlarmHub]:
        """
        List all alarm hubs.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of alarm hubs.

        """
        path = self._client.build_api_path("/alarm-hubs", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if not isinstance(data, list):
            return []

        hubs: list[AlarmHub] = []
        for item in data:
            try:
                hubs.append(AlarmHub.model_validate(item))
            except ValidationError as err:
                _LOGGER.warning(
                    "Skipping alarm hub that failed to parse (id=%s): %s",
                    item.get("id") if isinstance(item, dict) else "?",
                    err,
                )
        return hubs

    async def get(self, alarm_hub_id: str, site_id: str | None = None) -> AlarmHub:
        """
        Get a specific alarm hub.

        Args:
            alarm_hub_id: The alarm hub ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The alarm hub.

        Raises:
            ValueError: If the alarm hub is not found.

        """
        path = self._client.build_api_path(f"/alarm-hubs/{alarm_hub_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return AlarmHub.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return AlarmHub.model_validate(data[0])
        raise ValueError(f"Alarm hub {alarm_hub_id} not found")

    async def update(
        self,
        alarm_hub_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> AlarmHub:
        """
        Update alarm hub settings.

        Args:
            alarm_hub_id: The alarm hub ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated alarm hub.

        """
        path = self._client.build_api_path(f"/alarm-hubs/{alarm_hub_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return AlarmHub.model_validate(result)
        raise ValueError("Failed to update alarm hub")

    async def trigger_output(
        self,
        alarm_hub_id: str,
        output_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> bool:
        """
        Trigger an alarm hub output.

        Args:
            alarm_hub_id: The alarm hub ID.
            output_id: The output ID to trigger.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Optional trigger payload fields.

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path(
            f"/alarm-hubs/{alarm_hub_id}/outputs/{output_id}/trigger", site_id
        )
        await self._client._post(path, json_data=kwargs or None)
        return True
