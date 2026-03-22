"""Endpoint modules for UniFi Protect API."""

from __future__ import annotations

from .application import ApplicationEndpoint
from .cameras import CamerasEndpoint
from .chimes import ChimesEndpoint
from .events import EventsEndpoint
from .lights import LightsEndpoint
from .liveviews import LiveViewsEndpoint
from .nvr import NVREndpoint
from .sensors import SensorsEndpoint
from .viewers import ViewersEndpoint

__all__ = [
    "ApplicationEndpoint",
    "CamerasEndpoint",
    "ChimesEndpoint",
    "EventsEndpoint",
    "LightsEndpoint",
    "LiveViewsEndpoint",
    "NVREndpoint",
    "SensorsEndpoint",
    "ViewersEndpoint",
]
