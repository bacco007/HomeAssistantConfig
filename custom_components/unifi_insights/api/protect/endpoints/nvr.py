"""NVR endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import NVR

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class NVREndpoint:
    """Endpoint for managing UniFi Protect NVR."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the NVR endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get(self, site_id: str | None = None) -> NVR:
        """
        Get NVR information.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The NVR information.

        """
        path = self._client.build_api_path("/nvrs", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return NVR.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return NVR.model_validate(data[0])
        raise ValueError("NVR not found")

    async def update(
        self,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> NVR:
        """
        Update NVR settings.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated NVR.

        """
        path = self._client.build_api_path("/nvr", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return NVR.model_validate(result)
        raise ValueError("Failed to update NVR")

    async def restart(self, site_id: str | None = None) -> bool:
        """
        Restart the NVR.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path("/nvr/restart", site_id)
        await self._client._post(path)
        return True

    async def set_recording_retention(
        self,
        days: int,
        site_id: str | None = None,
    ) -> NVR:
        """
        Set recording retention period.

        Args:
            days: Number of days to retain recordings.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated NVR.

        """
        if days < 1:
            raise ValueError("Retention days must be at least 1")
        return await self.update(site_id, recordingRetentionDays=days)
