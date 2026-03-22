"""Chimes endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Chime

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class ChimesEndpoint:
    """Endpoint for managing UniFi Protect chimes."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the chimes endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[Chime]:
        """
        List all chimes.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of chimes.

        """
        path = self._client.build_api_path("/chimes", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Chime.model_validate(item) for item in data]
        return []

    async def get(self, chime_id: str, site_id: str | None = None) -> Chime:
        """
        Get a specific chime.

        Args:
            chime_id: The chime ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The chime.

        """
        path = self._client.build_api_path(f"/chimes/{chime_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Chime.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Chime.model_validate(data[0])
        raise ValueError(f"Chime {chime_id} not found")

    async def update(
        self,
        chime_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> Chime:
        """
        Update chime settings.

        Args:
            chime_id: The chime ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated chime.

        """
        path = self._client.build_api_path(f"/chimes/{chime_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Chime.model_validate(result)
        raise ValueError("Failed to update chime")

    async def set_volume(
        self,
        chime_id: str,
        volume: int,
        site_id: str | None = None,
    ) -> Chime:
        """
        Set chime volume.

        Args:
            chime_id: The chime ID.
            volume: Volume level (0-100).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated chime.

        """
        if not 0 <= volume <= 100:
            raise ValueError("Volume must be between 0 and 100")
        return await self.update(chime_id, site_id, volume=volume)

    async def play(self, chime_id: str, site_id: str | None = None) -> bool:
        """
        Play the chime sound.

        Args:
            chime_id: The chime ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/chimes/{chime_id}/play", site_id)
        await self._client._post(path)
        return True
