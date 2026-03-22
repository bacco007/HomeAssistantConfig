"""DNS Policies endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.dns import DNSPolicy, DNSRecordType

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class DNSEndpoint:
    """
    Endpoint for managing DNS policies.

    DNS policies allow custom DNS record management on a UniFi site,
    including A, AAAA, CNAME, MX, TXT, SRV records, and domain forwarding.
    """

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the DNS endpoint.

        Args:
            client: The UniFi Network client.

        """
        self._client = client

    async def get_all(
        self,
        site_id: str,
        *,
        offset: int = 0,
        limit: int = 25,
        filter_query: str | None = None,
    ) -> list[DNSPolicy]:
        """
        List all DNS policies.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results to return.
            filter_query: Optional filter query string.

        Returns:
            List of DNS policies.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dns/policies")
        params: dict[str, Any] = {"offset": offset, "limit": limit}
        if filter_query:
            params["filter"] = filter_query

        response = await self._client._get(path, params=params)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [DNSPolicy.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str, policy_id: str) -> DNSPolicy:
        """
        Get a specific DNS policy.

        Args:
            site_id: The site ID.
            policy_id: The DNS policy ID.

        Returns:
            The DNS policy.

        Raises:
            ValueError: If the policy is not found.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dns/policies/{policy_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return DNSPolicy.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return DNSPolicy.model_validate(data[0])
        raise ValueError(f"DNS policy {policy_id} not found")

    async def create(
        self,
        site_id: str,
        *,
        record_type: str | DNSRecordType,
        enabled: bool = True,
        domain: str | None = None,
        ipv4_address: str | None = None,
        ttl_seconds: int | None = None,
        **kwargs: Any,
    ) -> DNSPolicy:
        """
        Create a new DNS policy.

        Args:
            site_id: The site ID.
            record_type: The DNS record type (A_RECORD, AAAA_RECORD, etc).
            enabled: Whether the policy is enabled.
            domain: The domain name.
            ipv4_address: The IPv4 address (for A records).
            ttl_seconds: Time to live in seconds.
            **kwargs: Additional parameters.

        Returns:
            The created DNS policy.

        Raises:
            ValueError: If the policy creation fails.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dns/policies")
        type_value = (
            record_type.value if isinstance(record_type, DNSRecordType) else record_type
        )
        data: dict[str, Any] = {
            "type": type_value,
            "enabled": enabled,
        }
        if domain is not None:
            data["domain"] = domain
        if ipv4_address is not None:
            data["ipv4Address"] = ipv4_address
        if ttl_seconds is not None:
            data["ttlSeconds"] = ttl_seconds
        data.update(kwargs)

        response = await self._client._post(path, json_data=data)
        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return DNSPolicy.model_validate(result)
        raise ValueError("Failed to create DNS policy")

    async def update(
        self,
        site_id: str,
        policy_id: str,
        *,
        record_type: str | DNSRecordType | None = None,
        enabled: bool | None = None,
        domain: str | None = None,
        ipv4_address: str | None = None,
        ttl_seconds: int | None = None,
        **kwargs: Any,
    ) -> DNSPolicy:
        """
        Update a DNS policy.

        Args:
            site_id: The site ID.
            policy_id: The DNS policy ID.
            record_type: The DNS record type.
            enabled: Whether the policy is enabled.
            domain: The domain name.
            ipv4_address: The IPv4 address.
            ttl_seconds: Time to live in seconds.
            **kwargs: Additional parameters.

        Returns:
            The updated DNS policy.

        Raises:
            ValueError: If the policy update fails.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dns/policies/{policy_id}")
        data: dict[str, Any] = {}
        if record_type is not None:
            data["type"] = (
                record_type.value
                if isinstance(record_type, DNSRecordType)
                else record_type
            )
        if enabled is not None:
            data["enabled"] = enabled
        if domain is not None:
            data["domain"] = domain
        if ipv4_address is not None:
            data["ipv4Address"] = ipv4_address
        if ttl_seconds is not None:
            data["ttlSeconds"] = ttl_seconds
        data.update(kwargs)

        response = await self._client._put(path, json_data=data)
        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return DNSPolicy.model_validate(result)
        raise ValueError("Failed to update DNS policy")

    async def delete(self, site_id: str, policy_id: str) -> bool:
        """
        Delete a DNS policy.

        Args:
            site_id: The site ID.
            policy_id: The DNS policy ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/dns/policies/{policy_id}")
        await self._client._delete(path)
        return True
