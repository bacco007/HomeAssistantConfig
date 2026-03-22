"""Authentication handling for UniFi APIs."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class ApiKeyType(Enum):
    """Type of API key for UniFi services."""

    NETWORK = "network"
    PROTECT = "protect"


@dataclass(frozen=True, slots=True)
class ApiKeyAuth:
    """
    API Key authentication for UniFi APIs.

    The API key is linked to a specific organization or UI account.
    """

    api_key: str
    key_type: ApiKeyType | None = None

    def get_headers(self) -> dict[str, str]:
        """
        Get authentication headers for API requests.

        Returns:
            Dictionary of headers to include in requests.

        """
        return {"X-API-Key": self.api_key}


@dataclass(frozen=True, slots=True)
class LocalAuth:
    """
    Local authentication for UniFi Protect (on-premise).

    Used when connecting directly to a local UniFi Protect installation.
    """

    api_key: str
    verify_ssl: bool = True

    def get_headers(self) -> dict[str, str]:
        """
        Get authentication headers for API requests.

        Returns:
            Dictionary of headers to include in requests.

        """
        return {"X-API-Key": self.api_key}
