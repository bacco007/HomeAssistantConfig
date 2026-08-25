"""Relay endpoint for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from ..models import Relay
from ._base import ProtectDeviceEndpoint


class RelaysEndpoint(ProtectDeviceEndpoint[Relay]):
    """Endpoint for managing UniFi Protect relays."""

    _resource = "relays"
    _model = Relay

    async def activate_output(
        self,
        relay_id: str,
        output_id: str,
        site_id: str | None = None,
        **kwargs: Any,
    ) -> bool:
        """
        Activate a relay output.

        Args:
            relay_id: The relay ID.
            output_id: The output ID to activate.
            site_id: The site ID (required for REMOTE connections, ignored for LOCAL).
            **kwargs: Optional activation payload fields.

        Returns:
            True if the request was accepted.

        """
        path = self._client.build_api_path(
            f"/relays/{relay_id}/outputs/{output_id}/activate", site_id
        )
        await self._client._post(path, json_data=kwargs or None)
        return True
