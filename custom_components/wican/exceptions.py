"""Exceptions for WiCAN integration."""

from __future__ import annotations

from homeassistant.exceptions import HomeAssistantError


class WiCANError(HomeAssistantError):
    """Base exception for WiCAN integration."""


class WiCANConnectionError(WiCANError):
    """Exception raised when connection to device fails."""


class WiCANDeviceNotFoundError(WiCANError):
    """Exception raised when device is not reachable."""


class WiCANWebhookError(WiCANError):
    """Exception raised for webhook-related errors."""


class WiCANDataError(WiCANError):
    """Exception raised when data from device is invalid or malformed."""


class WiCANFirmwareError(WiCANError):
    """Base exception for firmware update errors."""


class FirmwareDownloadError(WiCANFirmwareError):
    """Raised when firmware download from GitHub fails."""


class FirmwareUploadError(WiCANFirmwareError):
    """Raised when firmware upload to device fails."""


class FirmwareVersionNotFoundError(WiCANFirmwareError):
    """Raised when requested firmware version doesn't exist."""
