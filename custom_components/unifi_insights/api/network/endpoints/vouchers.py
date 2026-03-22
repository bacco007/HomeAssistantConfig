"""Vouchers endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.voucher import Voucher

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class VouchersEndpoint:
    """Endpoint for managing hotspot vouchers."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the vouchers endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    async def get_all(
        self,
        site_id: str,
        *,
        offset: int = 0,
        limit: int = 100,
        filter_str: str | None = None,
    ) -> list[Voucher]:
        """
        List all vouchers.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results (max 1000).
            filter_str: Filter query string using API filter syntax.
                Example: "expired.eq(false)" or "and(name.like('guest*'), expired.eq(false))"

        Returns:
            List of vouchers.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/hotspot/vouchers")
        params: dict[str, Any] = {"offset": offset, "limit": min(limit, 1000)}
        if filter_str:
            params["filter"] = filter_str

        response = await self._client._get(path, params=params)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [Voucher.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str, voucher_id: str) -> Voucher:
        """
        Get a specific voucher.

        Args:
            site_id: The site ID.
            voucher_id: The voucher ID.

        Returns:
            The voucher.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/hotspot/vouchers/{voucher_id}"
        )
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return Voucher.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return Voucher.model_validate(data[0])
        raise ValueError(f"Voucher {voucher_id} not found")

    async def create(
        self,
        site_id: str,
        *,
        count: int = 1,
        name: str | None = None,
        authorized_guest_limit: int | None = None,
        time_limit_minutes: int | None = None,
        data_usage_limit_mbytes: int | None = None,
        rx_rate_limit_kbps: int | None = None,
        tx_rate_limit_kbps: int | None = None,
    ) -> list[Voucher]:
        """
        Generate new vouchers.

        Args:
            site_id: The site ID.
            count: Number of vouchers to create (1-10000).
            name: Optional voucher note/label.
            authorized_guest_limit: Maximum guests per voucher.
            time_limit_minutes: Access duration in minutes.
            data_usage_limit_mbytes: Download limit in megabytes.
            rx_rate_limit_kbps: Download speed limit.
            tx_rate_limit_kbps: Upload speed limit.

        Returns:
            List of created vouchers.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/hotspot/vouchers")
        data: dict[str, Any] = {"count": count}
        if name is not None:
            data["name"] = name
        if authorized_guest_limit is not None:
            data["authorizedGuestLimit"] = authorized_guest_limit
        if time_limit_minutes is not None:
            data["timeLimitMinutes"] = time_limit_minutes
        if data_usage_limit_mbytes is not None:
            data["dataUsageLimitMBytes"] = data_usage_limit_mbytes
        if rx_rate_limit_kbps is not None:
            data["rxRateLimitKbps"] = rx_rate_limit_kbps
        if tx_rate_limit_kbps is not None:
            data["txRateLimitKbps"] = tx_rate_limit_kbps

        response = await self._client._post(path, json_data=data)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, list) and len(result) > 0:
                return [Voucher.model_validate(item) for item in result]
            if isinstance(result, dict):
                return [Voucher.model_validate(result)]
        raise ValueError("Failed to create vouchers")

    async def delete(self, site_id: str, voucher_id: str) -> bool:
        """
        Delete a specific voucher.

        Args:
            site_id: The site ID.
            voucher_id: The voucher ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(
            f"/sites/{site_id}/hotspot/vouchers/{voucher_id}"
        )
        await self._client._delete(path)
        return True

    async def delete_multiple(self, site_id: str, voucher_ids: list[str]) -> bool:
        """
        Delete multiple vouchers.

        Args:
            site_id: The site ID.
            voucher_ids: List of voucher IDs to delete.

        Returns:
            True if successful.

        """
        # Delete each voucher individually
        for voucher_id in voucher_ids:
            await self.delete(site_id, voucher_id)
        return True
