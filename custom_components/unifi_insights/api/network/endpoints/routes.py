"""Policy-Based Route (Traffic Route) endpoint for UniFi Network API."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from custom_components.unifi_insights.api.const import ENDPOINT_TRAFFIC_ROUTES
from custom_components.unifi_insights.api.exceptions import UniFiResponseError
from custom_components.unifi_insights.api.network.models.routes import PolicyBasedRoute

if TYPE_CHECKING:
    from custom_components.unifi_insights.api.network.client import UniFiNetworkClient

_LOGGER = logging.getLogger(__name__)


class RoutesEndpoint:
    """
    Endpoint for managing Policy-Based Routes (Traffic Routes).

    Targets the private controller endpoint:
    ``/proxy/network/v2/api/site/{site_name}/trafficroutes``
    """

    def __init__(self, client: UniFiNetworkClient) -> None:
        """
        Initialize the Routes endpoint.

        Args:
            client: The UniFi Network client instance.

        """
        self._client = client

    def _extract_routes_list(self, response: Any) -> list[dict[str, Any]]:
        """
        Extract the list of route dictionaries from a response envelope.

        The UniFi API may return either a list or a dictionary with 'data'
        key.
        """
        if response is None:
            return []

        if isinstance(response, dict):
            meta = response.get("meta")
            if isinstance(meta, dict) and meta.get("rc") == "error":
                msg = meta.get("msg", "UniFi Network API error")
                raise UniFiResponseError(
                    msg, status_code=200, response_body=str(response)
                )

            data = response.get("data", response)
            if isinstance(data, list):
                return [item for item in data if isinstance(item, dict)]
            if isinstance(data, dict):
                return [data]
            return []

        if isinstance(response, list):
            return [item for item in response if isinstance(item, dict)]

        return []

    async def list_routes(self, site_name: str = "default") -> list[PolicyBasedRoute]:
        """
        Get all policy-based routes (traffic routes) for a site.

        Args:
            site_name: The UniFi classic site name (default: "default").

        Returns:
            List of PolicyBasedRoute models.

        """
        path = self._client.build_legacy_v2_api_path(site_name, ENDPOINT_TRAFFIC_ROUTES)
        response = await self._client._get(path)
        items: list[dict[str, Any]] = self._extract_routes_list(response)

        routes: list[PolicyBasedRoute] = []
        for item in items:
            try:
                routes.append(PolicyBasedRoute.model_validate(item))
            except Exception as err:
                _LOGGER.debug("Skipping invalid policy-based route item: %s", err)
                continue

        return routes

    async def get_route(self, site_name: str, route_id: str) -> PolicyBasedRoute:
        """
        Get a specific policy-based route by ID.

        Args:
            site_name: The UniFi classic site name.
            route_id: The ID of the policy-based route.

        Returns:
            The PolicyBasedRoute model.

        Raises:
            ValueError: If the route is not found.

        """
        path = self._client.build_legacy_v2_api_path(
            site_name, f"{ENDPOINT_TRAFFIC_ROUTES}/{route_id}"
        )
        response = await self._client._get(path)
        items: list[dict[str, Any]] = self._extract_routes_list(response)
        if items:
            return PolicyBasedRoute.model_validate(items[0])

        all_routes = await self.list_routes(site_name)
        for route in all_routes:
            if route.id == route_id:
                return route

        msg = f"Policy-Based Route {route_id} not found"
        raise ValueError(msg)

    async def update_route(
        self,
        site_name: str,
        route_id: str,
        *,
        enabled: bool | None = None,
        **kwargs: Any,
    ) -> PolicyBasedRoute:
        """
        Update a policy-based route.

        Fetches the current route object, modifies the requested fields,
        and PUTs the full object back to the UniFi API.

        Args:
            site_name: The UniFi classic site name.
            route_id: The ID of the policy-based route.
            enabled: Set enabled state (True/False).
            **kwargs: Additional route fields to update.

        Returns:
            The updated PolicyBasedRoute model.

        Raises:
            ValueError: If the route is not found.

        """
        path = self._client.build_legacy_v2_api_path(site_name, ENDPOINT_TRAFFIC_ROUTES)
        response = await self._client._get(path)
        items: list[dict[str, Any]] = self._extract_routes_list(response)

        current_payload: dict[str, Any] | None = None
        for item in items:
            item_id = item.get("id") or item.get("_id")
            if item_id == route_id:
                current_payload = item
                break

        if current_payload is None:
            msg = f"Policy-Based Route {route_id} not found"
            raise ValueError(msg)

        current_payload = dict(current_payload)
        if enabled is not None:
            current_payload["enabled"] = enabled

        current_payload.update(kwargs)

        put_path = self._client.build_legacy_v2_api_path(
            site_name, f"{ENDPOINT_TRAFFIC_ROUTES}/{route_id}"
        )
        put_response = await self._client._put(put_path, json_data=current_payload)
        put_items: list[dict[str, Any]] = self._extract_routes_list(put_response)
        if put_items:
            return PolicyBasedRoute.model_validate(put_items[0])

        return PolicyBasedRoute.model_validate(current_payload)
