"""Lights endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Light, LightMode

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class LightsEndpoint:
    """Endpoint for managing UniFi Protect lights."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the lights endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[Light]:
        """
        List all lights.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of lights.

        """
        path = self._client.build_api_path("/lights", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Light.model_validate(item) for item in data]
        return []

    async def get(self, light_id: str, site_id: str | None = None) -> Light:
        """
        Get a specific light.

        Args:
            light_id: The light ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The light.

        """
        path = self._client.build_api_path(f"/lights/{light_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Light.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Light.model_validate(data[0])
        raise ValueError(f"Light {light_id} not found")

    async def update(
        self,
        light_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> Light:
        """
        Update light settings.

        Args:
            light_id: The light ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated light.

        """
        path = self._client.build_api_path(f"/lights/{light_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Light.model_validate(result)
        raise ValueError("Failed to update light")

    async def turn_on(self, light_id: str, site_id: str | None = None) -> Light:
        """
        Turn on a light.

        Args:
            light_id: The light ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated light.

        """
        return await self.update(light_id, site_id, lightMode=LightMode.ON.value)

    async def turn_off(self, light_id: str, site_id: str | None = None) -> Light:
        """
        Turn off a light.

        Args:
            light_id: The light ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated light.

        """
        return await self.update(light_id, site_id, lightMode=LightMode.OFF.value)

    async def set_mode(
        self,
        light_id: str,
        mode: LightMode,
        site_id: str | None = None,
    ) -> Light:
        """
        Set light mode.

        Args:
            light_id: The light ID.
            mode: The light mode.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated light.

        """
        return await self.update(light_id, site_id, lightMode=mode.value)

    async def set_brightness(
        self,
        light_id: str,
        brightness: int,
        site_id: str | None = None,
    ) -> Light:
        """
        Set light brightness.

        Args:
            light_id: The light ID.
            brightness: Brightness level (0-100).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated light.

        """
        if not 0 <= brightness <= 100:
            raise ValueError("Brightness must be between 0 and 100")
        return await self.update(light_id, site_id, brightness=brightness)
