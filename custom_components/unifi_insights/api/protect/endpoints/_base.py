"""Shared base for simple UniFi Protect device-family endpoints."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Generic, TypeVar

from pydantic import BaseModel, ValidationError

if TYPE_CHECKING:
    from ..client import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)

_ModelT = TypeVar("_ModelT", bound=BaseModel)


class ProtectDeviceEndpoint(Generic[_ModelT]):
    """
    Base endpoint providing standard ``get_all``/``get``/``update`` behaviour.

    Subclasses set ``_resource`` (the URL segment, e.g. ``"bridges"``) and
    ``_model`` (the pydantic model to parse into). Responses may be a bare JSON
    array or wrapped in ``{"data": ...}``; both are handled.
    """

    _resource: str
    _model: type[_ModelT]

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[_ModelT]:
        """
        List all resources of this device family.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of parsed models.

        """
        path = self._client.build_api_path(f"/{self._resource}", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if not isinstance(data, list):
            return []

        items: list[_ModelT] = []
        for item in data:
            try:
                items.append(self._model.model_validate(item))
            except ValidationError as err:
                _LOGGER.warning(
                    "Skipping %s that failed to parse (id=%s): %s",
                    self._resource,
                    item.get("id") if isinstance(item, dict) else "?",
                    err,
                )
        return items

    async def get(self, resource_id: str, site_id: str | None = None) -> _ModelT:
        """
        Get a specific resource by ID.

        Args:
            resource_id: The resource ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            The parsed model.

        Raises:
            ValueError: If the resource is not found.

        """
        path = self._client.build_api_path(f"/{self._resource}/{resource_id}", site_id)
        response = await self._client._get(path)

        if isinstance(response, dict):
            data = response.get("data", response)
            if isinstance(data, dict):
                return self._model.model_validate(data)
            if isinstance(data, list) and len(data) > 0:
                return self._model.model_validate(data[0])
        raise ValueError(f"{self._resource} {resource_id} not found")

    async def update(
        self,
        resource_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> _ModelT:
        """
        Update a resource via ``PATCH``.

        Args:
            resource_id: The resource ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated model.

        Raises:
            ValueError: If the update fails.

        """
        path = self._client.build_api_path(f"/{self._resource}/{resource_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return self._model.model_validate(result)
        raise ValueError(f"Failed to update {self._resource}")
