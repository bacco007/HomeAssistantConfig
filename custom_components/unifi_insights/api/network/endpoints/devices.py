"""Devices endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models import Device, LegacyPortMetrics, PortBytesMetrics

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class DevicesEndpoint:
    """Endpoint for managing UniFi network devices."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the devices endpoint.

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
    ) -> list[Device]:
        """
        List all adopted devices on a site.

        Args:
            site_id: The site ID.
            offset: Number of devices to skip (pagination).
            limit: Maximum number of devices to return.
            filter_str: Filter string for device properties.

        Returns:
            List of devices.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path(f"/sites/{site_id}/devices")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Device.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str, device_id: str) -> Device:
        """
        Get a specific device.

        Args:
            site_id: The site ID.
            device_id: The device ID.

        Returns:
            The device.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/devices/{device_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Device.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Device.model_validate(data[0])
        raise ValueError(f"Device {device_id} not found")

    async def restart(self, site_id: str, device_id: str) -> bool:
        """
        Restart a device.

        Args:
            site_id: The site ID.
            device_id: The device ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/devices/{device_id}/restart"
        )
        await self._client._post(path)
        return True

    async def adopt(
        self,
        site_id: str,
        mac: str,
    ) -> bool:
        """
        Adopt a device.

        Args:
            site_id: The site ID.
            mac: The device MAC address.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/devices/adopt")
        await self._client._post(path, json_data={"macAddress": mac})
        return True

    async def forget(self, site_id: str, device_id: str) -> bool:
        """
        Forget/remove a device.

        Args:
            site_id: The site ID.
            device_id: The device ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/devices/{device_id}")
        await self._client._delete(path)
        return True

    async def locate(self, site_id: str, device_id: str, enabled: bool = True) -> bool:
        """
        Enable or disable locate mode (LED blinking) on a device.

        Args:
            site_id: The site ID.
            device_id: The device ID.
            enabled: Whether to enable or disable locate mode.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/devices/{device_id}/locate"
        )
        await self._client._post(path, json_data={"enabled": enabled})
        return True

    async def get_pending_adoption(
        self,
        *,
        offset: int | None = None,
        limit: int | None = None,
        filter_str: str | None = None,
    ) -> list[Device]:
        """
        List devices pending adoption.

        Args:
            offset: Number of devices to skip (pagination).
            limit: Maximum number of devices to return.
            filter_str: Filter string for device properties.

        Returns:
            List of devices pending adoption.

        """
        params: dict[str, Any] = {}
        if offset is not None:
            params["offset"] = offset
        if limit is not None:
            params["limit"] = limit
        if filter_str:
            params["filter"] = filter_str

        path = self._client.build_api_path("/pending-devices")
        response = await self._client._get(path, params=params if params else None)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Device.model_validate(item) for item in data]
        return []

    async def get_statistics(
        self,
        site_id: str,
        device_id: str,
    ) -> dict[str, Any]:
        """
        Get latest device statistics.

        Args:
            site_id: The site ID.
            device_id: The device ID.

        Returns:
            Device statistics dictionary.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/devices/{device_id}/statistics/latest"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return data
        return {}

    async def get_legacy_device_stats(
        self,
        site_name: str,
        device_mac: str,
    ) -> dict[str, Any]:
        """
        Get raw legacy device statistics for a device.

        Args:
            site_name: The UniFi site name, for example ``default``.
            device_mac: The device MAC address used by the legacy endpoint.

        Returns:
            Raw legacy device statistics from ``data[0]`` or an empty
            dictionary when the response is missing or malformed.

        """
        path = self._client.build_legacy_api_path(
            site_name, f"/stat/device/{device_mac}"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, list) and data and isinstance(data[0], dict):
                return data[0]
            if isinstance(data, dict):
                return data
        return {}

    async def get_legacy_site_devices(
        self,
        site_name: str,
    ) -> list[dict[str, Any]]:
        """
        Get raw legacy device data for all devices on a site.

        Args:
            site_name: The UniFi site name, for example ``default``.

        Returns:
            Raw legacy device dictionaries from ``/stat/device``.

        """
        path = self._client.build_legacy_api_path(site_name, "/stat/device")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, list):
                return [item for item in data if isinstance(item, dict)]
            if isinstance(data, dict):
                return [data]
        return []

    async def get_port_metrics(
        self,
        site_name: str,
        device_mac: str,
    ) -> LegacyPortMetrics:
        """
        Get normalized legacy per-port metrics for a device.

        Args:
            site_name: The UniFi site name, for example ``default``.
            device_mac: The device MAC address used by the legacy endpoint.

        Returns:
            Normalized per-port legacy metrics. Port dictionary keys preserve
            the index reported by the legacy API and are not normalized to the
            0-based numbering expected by ``execute_port_action()``.

        """
        legacy = await self.get_legacy_device_stats(site_name, device_mac)
        if not legacy:
            return LegacyPortMetrics()

        port_table = legacy.get("port_table")
        if not isinstance(port_table, list):
            port_table = []

        poe_ports: dict[int, float] = {}
        port_bytes: dict[int, PortBytesMetrics] = {}

        def _to_float(value: Any) -> float | None:
            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        def _to_int(value: Any) -> int | None:
            try:
                return int(value)
            except (TypeError, ValueError):
                return None

        def _get_port_idx(port: dict[str, Any]) -> int | None:
            idx = port.get("port_idx")
            if idx is None:
                idx = port.get("portIdx")
            return _to_int(idx)

        for port in port_table:
            if not isinstance(port, dict):
                continue

            port_idx = _get_port_idx(port)
            if port_idx is None:
                continue

            poe_power = port.get("poe_power")
            if poe_power is None:
                poe_power = port.get("poePower")
            poe_w = _to_float(poe_power)
            if poe_w is not None:
                poe_ports[port_idx] = poe_w

            rx_bytes = port.get("rx_bytes")
            if rx_bytes is None:
                rx_bytes = port.get("rxBytes")
            tx_bytes = port.get("tx_bytes")
            if tx_bytes is None:
                tx_bytes = port.get("txBytes")

            rx_i = _to_int(rx_bytes)
            tx_i = _to_int(tx_bytes)
            if rx_i is not None or tx_i is not None:
                port_bytes[port_idx] = PortBytesMetrics(
                    rx_bytes=rx_i if rx_i is not None else 0,
                    tx_bytes=tx_i if tx_i is not None else 0,
                )

        total_used = legacy.get("total_used_power")
        if total_used is None:
            total_used = legacy.get("totalUsedPower")
        if total_used is None:
            total_used = legacy.get("total_poe_power")
        if total_used is None:
            total_used = legacy.get("poe_total_power")

        poe_total_w = _to_float(total_used)
        if poe_total_w is None and poe_ports:
            poe_total_w = float(sum(poe_ports.values()))

        return LegacyPortMetrics(
            poe_total_w=poe_total_w,
            poe_ports=poe_ports,
            port_bytes=port_bytes,
        )

    async def execute_port_action(
        self,
        site_id: str,
        device_id: str,
        port_idx: int,
        *,
        poe_mode: str | None = None,
        speed: str | None = None,
        enabled: bool | None = None,
    ) -> bool:
        """
        Execute an action on a device port.

        Args:
            site_id: The site ID.
            device_id: The device ID.
            port_idx: The port index (0-based).
            poe_mode: PoE mode (off, auto, passive24, passthrough).
            speed: Port speed (auto, 10, 100, 1000, 2500, 10000).
            enabled: Whether the port is enabled.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/devices/{device_id}/ports/{port_idx}"
        )
        data: dict[str, Any] = {}
        if poe_mode is not None:
            data["poeMode"] = poe_mode
        if speed is not None:
            data["speed"] = speed
        if enabled is not None:
            data["enabled"] = enabled

        if not data:
            raise ValueError("At least one port setting must be provided")

        await self._client._patch(path, json_data=data)
        return True

    async def execute_action(
        self,
        site_id: str,
        device_id: str,
        action: str,
    ) -> bool:
        """
        Execute an action on a device.

        Args:
            site_id: The site ID.
            device_id: The device ID.
            action: The action to execute (restart, locate, provision, upgrade).

        Returns:
            True if successful.

        """
        valid_actions = {"restart", "locate", "provision", "upgrade"}
        if action not in valid_actions:
            raise ValueError(f"Action must be one of: {', '.join(valid_actions)}")

        path = self._client.build_api_path(
            f"/sites/{site_id}/devices/{device_id}/{action}"
        )
        await self._client._post(path)
        return True
