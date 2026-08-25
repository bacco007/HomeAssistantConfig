"""Pydantic models for UniFi Protect API."""

from __future__ import annotations

from .arm_profile import ArmProfile
from .bridge import Bridge
from .camera import Camera, CameraState, CameraType, RecordingMode, VideoMode
from .chime import Chime
from .doorlock import DoorLock
from .event import Event, EventType
from .files import ApplicationInfo, DeviceFile, FileType, RTSPSStream, TalkbackSession
from .fob import Fob
from .light import Light, LightMode
from .link_station import AlarmHub, LinkStation
from .liveview import LiveView
from .nvr import NVR
from .relay import Relay
from .sensor import BatteryStatus, Sensor, SensorType
from .siren import Siren
from .speaker import Speaker
from .viewer import Viewer, ViewerState
from .viewport import Viewport

__all__ = [
    # Application/Files
    "ApplicationInfo",
    "DeviceFile",
    "FileType",
    "RTSPSStream",
    "TalkbackSession",
    # Alarm hub / arm profile
    "AlarmHub",
    "ArmProfile",
    # Bridge
    "Bridge",
    # Camera
    "Camera",
    "CameraState",
    "CameraType",
    "RecordingMode",
    "VideoMode",
    # Chime
    "Chime",
    # Door lock (WebSocket-only)
    "DoorLock",
    # Event
    "Event",
    "EventType",
    # Fob
    "Fob",
    # Light
    "Light",
    "LightMode",
    # Link station
    "LinkStation",
    # LiveView
    "LiveView",
    # NVR
    "NVR",
    # Relay
    "Relay",
    # Sensor
    "BatteryStatus",
    "Sensor",
    "SensorType",
    # Siren
    "Siren",
    # Speaker
    "Speaker",
    # Viewer
    "Viewer",
    "ViewerState",
    # Viewport (WebSocket-only)
    "Viewport",
]
