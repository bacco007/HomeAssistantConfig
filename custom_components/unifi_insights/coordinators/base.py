"""Base coordinator for UniFi Insights."""

from __future__ import annotations

import logging
from datetime import timedelta  # noqa: TC003
from typing import TYPE_CHECKING, Any

from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from unifi_official_api import (  # noqa: TC002
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)

from custom_components.unifi_insights.const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class UnifiBaseCoordinator(DataUpdateCoordinator[dict[str, Any]]):  # type: ignore[misc]
    """Base class for UniFi Insights coordinators."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
        name: str,
        update_interval: timedelta,
    ) -> None:
        """Initialize the base coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{name}",
            update_interval=update_interval,
        )
        self.network_client = network_client
        self.protect_client = protect_client
        self.config_entry = entry
        self._available = True
        self.data: dict[str, Any] = {}

    @property
    def available(self) -> bool:
        """Return coordinator availability."""
        return self._available

    def _model_to_dict(self, model: Any) -> dict[str, Any]:
        """
        Convert a model object to a dictionary.

        Handles both pydantic models (with model_dump) and objects with __dict__.
        Uses by_alias=True to get camelCase field names that match the
        original API format.
        """
        if model is None:
            return {}
        if isinstance(model, dict):
            return model
        if hasattr(model, "model_dump"):
            # Use by_alias=True to get camelCase field names matching the API response
            # This ensures compatibility with entity code expecting camelCase keys
            try:
                result = model.model_dump(by_alias=True, exclude_none=False)
                return result if isinstance(result, dict) else {}
            except TypeError:
                # Fall back to regular model_dump if by_alias not supported
                result = model.model_dump()
                return result if isinstance(result, dict) else {}
        if hasattr(model, "__dict__"):
            return {k: v for k, v in model.__dict__.items() if not k.startswith("_")}
        return {}

    def _handle_auth_error(self, err: UniFiAuthenticationError) -> None:
        """Handle authentication error."""
        self._available = False
        msg = f"Authentication failed: {err}"
        raise ConfigEntryAuthFailed(msg) from err

    def _handle_connection_error(self, err: UniFiConnectionError) -> None:
        """Handle connection error."""
        self._available = False
        msg = f"Error communicating with API: {err}"
        raise UpdateFailed(msg) from err

    def _handle_timeout_error(self, err: UniFiTimeoutError) -> None:
        """Handle timeout error."""
        self._available = False
        _LOGGER.warning("Timeout during update: %s", err)
        msg = f"Timeout: {err}"
        raise UpdateFailed(msg) from err

    def _handle_response_error(self, err: UniFiResponseError) -> None:
        """Handle API response error."""
        self._available = False
        _LOGGER.exception("API error during update")
        msg = f"API error: {err}"
        raise UpdateFailed(msg) from err

    def _handle_generic_error(self, err: Exception) -> None:
        """Handle generic error."""
        self._available = False
        _LOGGER.exception("Unexpected error updating data")
        msg = f"Error updating data: {err}"
        raise UpdateFailed(msg) from err
