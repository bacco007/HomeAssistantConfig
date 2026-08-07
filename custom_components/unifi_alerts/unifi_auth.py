"""Authentication seam for the UniFi Network controller.

Holds the shared auth exceptions and the UniFiAuth class that UniFiClient
composes for API-key verification and header construction. Kept in its own
module so auth logic is unit-testable independently of transport, pagination,
or alarm parsing.

Decision (#279): this module is retained rather than folded into
``unifi_client.py``. Even reduced to API-key verification plus header
construction it owns the shared auth exceptions (``CannotConnectError``,
``SslCertificateError``, ``InvalidAuthError``) imported across the integration
(config flow, coordinator, client); inlining it would churn those imports for
no real gain and lose the isolated test surface in ``test_unifi_auth.py``.
"""

from __future__ import annotations

import logging

import aiohttp

from .const import (
    CONF_API_KEY,
    CONF_VERIFY_SSL,
    DEFAULT_VERIFY_SSL,
)
from .models import UniFiClientConfig

_LOGGER = logging.getLogger(__name__)

# UniFi OS consoles (UDM, UCG, etc.) prefix all network API paths
UNIFI_OS_NETWORK_PREFIX = "/proxy/network"


class CannotConnectError(Exception):
    """Raised when the controller is unreachable."""


class SslCertificateError(CannotConnectError):
    """Raised when TLS certificate verification fails.

    Subclass of CannotConnectError so coordinator/integration code that only
    catches CannotConnectError continues to work. The config flow catches this
    subclass first to surface a dedicated, actionable error message.
    """


class InvalidAuthError(Exception):
    """Raised on 401/403 responses.

    Attributes:
        login_url: The URL that returned the auth failure; surfaced in the UI.
    """

    def __init__(self, message: str, *, login_url: str = "") -> None:
        super().__init__(message)
        self.login_url = login_url


class UniFiAuth:
    """Authentication seam for UniFi OS controllers using API-key auth.

    Verifies the configured API key against the controller and builds the
    ``X-API-Key`` request header. API keys are stateless: there is no session,
    cookie, or login/logout to manage, so this class holds no auth state.
    """

    def __init__(
        self,
        session: aiohttp.ClientSession,
        base_url: str,
        config: UniFiClientConfig,
    ) -> None:
        self._session = session
        self._base = base_url
        self._config = config

    def headers(self) -> dict[str, str]:
        """Return HTTP headers for an authenticated request."""
        return {
            "Accept": "application/json",
            "X-API-Key": self._config.get(CONF_API_KEY, ""),
        }

    async def authenticate(self) -> None:
        """Verify the configured API key against the UniFi OS controller.

        Raises InvalidAuthError if the key is missing or rejected, or a
        CannotConnectError subclass if the controller is unreachable.
        """
        await self._verify_api_key()
        _LOGGER.debug("Authenticated via API key")

    async def _verify_api_key(self) -> None:
        api_key = self._config.get(CONF_API_KEY, "")
        if not api_key:
            raise InvalidAuthError("No API key provided")
        endpoint = f"{self._base}{UNIFI_OS_NETWORK_PREFIX}/api/s/default/self"
        try:
            async with self._session.get(
                endpoint,
                headers={"X-API-Key": api_key, "Accept": "application/json"},
                ssl=self._config.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
                timeout=aiohttp.ClientTimeout(total=8),
                allow_redirects=False,
            ) as resp:
                if 300 <= resp.status < 400:
                    raise CannotConnectError(
                        f"Controller issued a redirect (HTTP {resp.status}) on an authenticated "
                        "request; refusing to follow to protect credentials"
                    )
                if resp.status == 404:
                    raise CannotConnectError(
                        "API key endpoint not found — check the controller URL "
                        "and that UniFi OS is accessible at this address"
                    )
                if resp.status in (401, 403):
                    _LOGGER.warning(
                        "API key authentication failed for %s (HTTP %d)", endpoint, resp.status
                    )
                    raise InvalidAuthError("Invalid API key", login_url=endpoint)
                resp.raise_for_status()
        except CannotConnectError, InvalidAuthError:
            raise
        except aiohttp.ClientConnectorCertificateError as err:
            raise SslCertificateError(type(err).__name__) from err
        except aiohttp.ClientError as err:
            raise CannotConnectError(type(err).__name__) from err
