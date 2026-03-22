"""Constants for the UniFi Official API library."""

from __future__ import annotations

from enum import Enum
from typing import Final

from ._version import __version__


class ConnectionType(str, Enum):
    """
    Connection type for UniFi API access.

    LOCAL: Direct connection to the UniFi console (e.g., https://192.168.1.1)
           - Uses local API key generated on the console
           - Endpoints: /proxy/network/integration/v1/...

    REMOTE: Cloud connection via Ubiquiti's API (https://api.ui.com)
            - Uses cloud API key from account.ui.com
            - Endpoints: /v1/connector/consoles/{consoleId}/network/integration/v1/...
    """

    LOCAL = "local"
    REMOTE = "remote"


# API Base URLs
NETWORK_API_BASE_URL: Final[str] = "https://api.ui.com"
PROTECT_API_BASE_URL: Final[str] = "https://api.ui.com"

# API Versions
NETWORK_API_VERSION: Final[str] = "v1"
PROTECT_API_VERSION: Final[str] = "v1"

# Network Integration API path prefix (used for both local and remote)
NETWORK_INTEGRATION_PATH: Final[str] = "/proxy/network/integration/v1"

# Network legacy API path prefix (used for both local and remote)
NETWORK_LEGACY_PATH: Final[str] = "/proxy/network/api"

# Protect Integration API path prefix (used for both local and remote)
PROTECT_INTEGRATION_PATH: Final[str] = "/proxy/protect/integration/v1"

# Default timeouts (in seconds)
DEFAULT_TIMEOUT: Final[int] = 30
DEFAULT_CONNECT_TIMEOUT: Final[int] = 10

# Rate limiting
DEFAULT_RATE_LIMIT_RETRY_AFTER: Final[int] = 60

# User agent - uses version from single source of truth
USER_AGENT: Final[str] = f"unifi-official-api/{__version__}"

# HTTP Headers
HEADER_CONTENT_TYPE: Final[str] = "Content-Type"
HEADER_ACCEPT: Final[str] = "Accept"
HEADER_USER_AGENT: Final[str] = "User-Agent"
HEADER_API_KEY: Final[str] = "X-API-Key"

# Content types
CONTENT_TYPE_JSON: Final[str] = "application/json"
