"""Siren endpoint for UniFi Protect API."""

from __future__ import annotations

from ..models import Siren
from ._base import ProtectDeviceEndpoint


class SirensEndpoint(ProtectDeviceEndpoint[Siren]):
    """Endpoint for managing UniFi Protect sirens."""

    _resource = "sirens"
    _model = Siren

    async def play(self, siren_id: str, site_id: str | None = None) -> bool:
        """
        Start playing a siren.

        Args:
            siren_id: The siren ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path(f"/sirens/{siren_id}/play", site_id)
        await self._client._post(path)
        return True

    async def stop(self, siren_id: str, site_id: str | None = None) -> bool:
        """
        Stop a playing siren.

        Args:
            siren_id: The siren ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path(f"/sirens/{siren_id}/stop", site_id)
        await self._client._post(path)
        return True

    async def test_sound(self, siren_id: str, site_id: str | None = None) -> bool:
        """
        Play the siren test sound.

        Args:
            siren_id: The siren ID.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path(f"/sirens/{siren_id}/test-sound", site_id)
        await self._client._post(path)
        return True
