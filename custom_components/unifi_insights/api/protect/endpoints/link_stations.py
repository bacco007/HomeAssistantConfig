"""Link station endpoint for UniFi Protect API."""

from __future__ import annotations

from ..models import LinkStation
from ._base import ProtectDeviceEndpoint


class LinkStationsEndpoint(ProtectDeviceEndpoint[LinkStation]):
    """Endpoint for managing UniFi Protect link stations."""

    _resource = "link-stations"
    _model = LinkStation
