"""ACL Rules endpoint for UniFi Network API."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from ..models.acl import ACLAction, ACLRule, ACLRuleOrdering, ACLRuleType

if TYPE_CHECKING:
    from ..client import UniFiNetworkClient


class ACLEndpoint:
    """Endpoint for managing ACL (Access Control List) rules."""

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the ACL endpoint.

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
        filter_str: str | None = None,
    ) -> list[ACLRule]:
        """
        List all ACL rules.

        Args:
            site_id: The site ID.
            offset: Pagination offset.
            limit: Maximum results (max 200).
            filter_str: Filter query string using API filter syntax.
                Example: "action.eq('BLOCK')" or "and(enabled.eq(true), type.eq('IPV4'))"

        Returns:
            List of ACL rules.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules")
        params: dict[str, Any] = {"offset": offset, "limit": min(limit, 200)}
        if filter_str:
            params["filter"] = filter_str

        response = await self._client._get(path, params=params)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if isinstance(data, list):
            return [ACLRule.model_validate(item) for item in data]
        return []

    async def get(self, site_id: str, rule_id: str) -> ACLRule:
        """
        Get a specific ACL rule.

        Args:
            site_id: The site ID.
            rule_id: The ACL rule ID.

        Returns:
            The ACL rule.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules/{rule_id}")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return ACLRule.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return ACLRule.model_validate(data[0])
        raise ValueError(f"ACL rule {rule_id} not found")

    async def create(
        self,
        site_id: str,
        *,
        name: str,
        rule_type: ACLRuleType = ACLRuleType.IPV4,
        action: ACLAction = ACLAction.BLOCK,
        index: int = 0,
        enabled: bool = True,
        description: str | None = None,
        **kwargs: Any,
    ) -> ACLRule:
        """
        Create a new ACL rule.

        Args:
            site_id: The site ID.
            name: Rule name.
            rule_type: Rule type (IPV4 or MAC).
            action: Allow or block action.
            index: Priority index (lower = higher priority).
            enabled: Whether rule is active.
            description: Optional description.
            **kwargs: Additional parameters (sourceFilter, destinationFilter, etc).

        Returns:
            The created ACL rule.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules")
        data: dict[str, Any] = {
            "type": rule_type.value,
            "name": name,
            "action": action.value,
            "index": index,
            "enabled": enabled,
        }
        if description:
            data["description"] = description
        data.update(kwargs)

        response = await self._client._post(path, json_data=data)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return ACLRule.model_validate(result)
        raise ValueError("Failed to create ACL rule")

    async def update(
        self,
        site_id: str,
        rule_id: str,
        **kwargs: Any,
    ) -> ACLRule:
        """
        Update an ACL rule.

        Args:
            site_id: The site ID.
            rule_id: The ACL rule ID.
            **kwargs: Parameters to update.

        Returns:
            The updated ACL rule.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules/{rule_id}")
        response = await self._client._put(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return ACLRule.model_validate(result)
        raise ValueError("Failed to update ACL rule")

    async def delete(self, site_id: str, rule_id: str) -> bool:
        """
        Delete an ACL rule.

        Only user-defined rules can be deleted.

        Args:
            site_id: The site ID.
            rule_id: The ACL rule ID.

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules/{rule_id}")
        await self._client._delete(path)
        return True

    async def get_ordering(self, site_id: str) -> ACLRuleOrdering:
        """
        Get user-defined ACL rule ordering.

        Args:
            site_id: The site ID.

        Returns:
            The ACL rule ordering.

        Raises:
            ValueError: If the ordering cannot be retrieved.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules/ordering")
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return ACLRuleOrdering.model_validate(data)
        raise ValueError("Failed to get ACL rule ordering")

    async def update_ordering(
        self,
        site_id: str,
        *,
        ordered_rule_ids: list[str],
    ) -> ACLRuleOrdering:
        """
        Reorder user-defined ACL rules.

        Args:
            site_id: The site ID.
            ordered_rule_ids: List of ACL rule IDs in desired order.

        Returns:
            The updated ACL rule ordering.

        Raises:
            ValueError: If the reordering fails.

        """
        path = self._client.build_api_path(f"/sites/{site_id}/acl-rules/ordering")
        data: dict[str, Any] = {
            "orderedAclRuleIds": ordered_rule_ids,
        }
        response = await self._client._put(path, json_data=data)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return ACLRuleOrdering.model_validate(result)
        raise ValueError("Failed to update ACL rule ordering")
