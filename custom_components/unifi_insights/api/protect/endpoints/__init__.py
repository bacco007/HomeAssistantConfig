"""Endpoint modules for UniFi Protect API."""

from __future__ import annotations

from .alarm_hubs import AlarmHubsEndpoint
from .application import ApplicationEndpoint
from .arm_profiles import ArmProfilesEndpoint
from .bridges import BridgesEndpoint
from .cameras import CamerasEndpoint
from .chimes import ChimesEndpoint
from .events import EventsEndpoint
from .fobs import FobsEndpoint
from .lights import LightsEndpoint
from .link_stations import LinkStationsEndpoint
from .liveviews import LiveViewsEndpoint
from .nvr import NVREndpoint
from .relays import RelaysEndpoint
from .sensors import SensorsEndpoint
from .sirens import SirensEndpoint
from .speakers import SpeakersEndpoint
from .viewers import ViewersEndpoint

__all__ = [
    "AlarmHubsEndpoint",
    "ApplicationEndpoint",
    "ArmProfilesEndpoint",
    "BridgesEndpoint",
    "CamerasEndpoint",
    "ChimesEndpoint",
    "EventsEndpoint",
    "FobsEndpoint",
    "LightsEndpoint",
    "LinkStationsEndpoint",
    "LiveViewsEndpoint",
    "NVREndpoint",
    "RelaysEndpoint",
    "SensorsEndpoint",
    "SirensEndpoint",
    "SpeakersEndpoint",
    "ViewersEndpoint",
]
