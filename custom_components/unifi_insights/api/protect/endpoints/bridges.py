"""Bridge endpoint for UniFi Protect API."""

from __future__ import annotations

from ..models import Bridge
from ._base import ProtectDeviceEndpoint


class BridgesEndpoint(ProtectDeviceEndpoint[Bridge]):
    """Endpoint for managing UniFi Protect bridges."""

    _resource = "bridges"
    _model = Bridge
