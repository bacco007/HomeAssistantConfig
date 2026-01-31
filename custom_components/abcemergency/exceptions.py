"""Exceptions for ABC Emergency integration."""

from __future__ import annotations

from homeassistant.exceptions import HomeAssistantError


class ABCEmergencyError(HomeAssistantError):
    """Base exception for ABC Emergency integration."""


class ABCEmergencyConnectionError(ABCEmergencyError):
    """Exception raised when connection to ABC Emergency API fails."""


class ABCEmergencyAPIError(ABCEmergencyError):
    """Exception raised when ABC Emergency API returns an error."""


class ABCEmergencyAuthError(ABCEmergencyError):
    """Exception raised for authentication errors (unexpected - API is public)."""
