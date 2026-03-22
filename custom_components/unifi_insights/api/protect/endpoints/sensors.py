"""Sensors endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Sensor

if TYPE_CHECKING:
    from ..client import UniFiProtectClient


class SensorsEndpoint:
    """Endpoint for managing UniFi Protect sensors."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the sensors endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[Sensor]:
        """
        List all sensors.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of sensors.

        """
        path = self._client.build_api_path("/sensors", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Sensor.model_validate(item) for item in data]
        return []

    async def get(self, sensor_id: str, site_id: str | None = None) -> Sensor:
        """
        Get a specific sensor.

        Args:
            sensor_id: The sensor ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The sensor.

        """
        path = self._client.build_api_path(f"/sensors/{sensor_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Sensor.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Sensor.model_validate(data[0])
        raise ValueError(f"Sensor {sensor_id} not found")

    async def update(
        self,
        sensor_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> Sensor:
        """
        Update sensor settings.

        Args:
            sensor_id: The sensor ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated sensor.

        """
        path = self._client.build_api_path(f"/sensors/{sensor_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return Sensor.model_validate(result)
        raise ValueError("Failed to update sensor")

    async def set_status_led(
        self,
        sensor_id: str,
        enabled: bool,
        site_id: str | None = None,
    ) -> Sensor:
        """
        Enable or disable the status LED.

        Args:
            sensor_id: The sensor ID.
            enabled: Whether to enable the LED.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated sensor.

        """
        return await self.update(sensor_id, site_id, openStatusLedEnabled=enabled)

    async def set_motion_sensitivity(
        self,
        sensor_id: str,
        sensitivity: int,
        site_id: str | None = None,
    ) -> Sensor:
        """
        Set motion sensitivity.

        Args:
            sensor_id: The sensor ID.
            sensitivity: Sensitivity level (0-100).
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The updated sensor.

        """
        if not 0 <= sensitivity <= 100:
            raise ValueError("Sensitivity must be between 0 and 100")
        return await self.update(sensor_id, site_id, motionSensitivity=sensitivity)
