"""Arm profile endpoint for UniFi Protect API."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from pydantic import ValidationError

from ..models import ArmProfile

if TYPE_CHECKING:
    from ..client import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class ArmProfilesEndpoint:
    """Endpoint for managing UniFi Protect arm profiles."""

    def __init__(self, client: UniFiProtectClient) -> None:
        """
        Initialize the arm profiles endpoint.

        Args:
            client: The UniFi Protect client.

        """
        self._client = client

    async def get_all(self, site_id: str | None = None) -> list[ArmProfile]:
        """
        List all arm profiles.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            List of arm profiles.

        """
        path = self._client.build_api_path("/arm-profiles", site_id)
        response = await self._client._get(path)

        if response is None:
            return []

        data = (
            response.get("data", response) if isinstance(response, dict) else response
        )
        if not isinstance(data, list):
            return []

        profiles: list[ArmProfile] = []
        for item in data:
            try:
                profiles.append(ArmProfile.model_validate(item))
            except ValidationError as err:
                _LOGGER.warning(
                    "Skipping arm profile that failed to parse (id=%s): %s",
                    item.get("id") if isinstance(item, dict) else "?",
                    err,
                )
        return profiles

    async def create(self, site_id: str | None = None, **kwargs: Any) -> ArmProfile:
        """
        Create a new arm profile.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Arm profile payload fields.

        Returns:
            The created arm profile.

        Raises:
            ValueError: If creation fails.

        """
        path = self._client.build_api_path("/arm-profiles", site_id)
        response = await self._client._post(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return ArmProfile.model_validate(result)
        raise ValueError("Failed to create arm profile")

    async def update(
        self,
        arm_profile_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> ArmProfile:
        """
        Update an arm profile.

        Args:
            arm_profile_id: The arm profile ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            The updated arm profile.

        Raises:
            ValueError: If the update fails.

        """
        path = self._client.build_api_path(f"/arm-profiles/{arm_profile_id}", site_id)
        response = await self._client._patch(path, json_data=kwargs)

        if isinstance(response, dict):
            result = response.get("data", response)
            if isinstance(result, dict):
                return ArmProfile.model_validate(result)
        raise ValueError("Failed to update arm profile")

    async def delete(self, arm_profile_id: str, site_id: str | None = None) -> bool:
        """
        Delete an arm profile.

        Args:
            arm_profile_id: The arm profile ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if successful.

        """
        path = self._client.build_api_path(f"/arm-profiles/{arm_profile_id}", site_id)
        await self._client._delete(path)
        return True

    async def enable(self, site_id: str | None = None, **kwargs: Any) -> bool:
        """
        Enable arm profiles.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Optional request payload fields.

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path("/arm-profiles/enable", site_id)
        await self._client._post(path, json_data=kwargs or None)
        return True

    async def disable(self, site_id: str | None = None, **kwargs: Any) -> bool:
        """
        Disable arm profiles.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Optional request payload fields.

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path("/arm-profiles/disable", site_id)
        await self._client._post(path, json_data=kwargs or None)
        return True

    async def update_settings(self, site_id: str | None = None, **kwargs: Any) -> bool:
        """
        Update global arm profile settings.

        Args:
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Settings to update.

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path("/arm-profiles/settings", site_id)
        await self._client._patch(path, json_data=kwargs)
        return True
