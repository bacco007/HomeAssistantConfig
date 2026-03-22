"""Pydantic models for UniFi Protect API."""

from __future__ import annotations

from .camera import Camera, CameraState, CameraType, RecordingMode, VideoMode
from .chime import Chime
from .event import Event, EventType
from .files import ApplicationInfo, DeviceFile, FileType, RTSPSStream, TalkbackSession
from .light import Light, LightMode
from .liveview import LiveView
from .nvr import NVR
from .sensor import BatteryStatus, Sensor, SensorType
from .viewer import Viewer, ViewerState

__all__ = [
    # Application/Files
    "ApplicationInfo",
    "DeviceFile",
    "FileType",
    "RTSPSStream",
    "TalkbackSession",
    # Camera
    "Camera",
    "CameraState",
    "CameraType",
    "RecordingMode",
    "VideoMode",
    # Chime
    "Chime",
    # Event
    "Event",
    "EventType",
    # Light
    "Light",
    "LightMode",
    # LiveView
    "LiveView",
    # NVR
    "NVR",
    # Sensor
    "BatteryStatus",
    "Sensor",
    "SensorType",
    # Viewer
    "Viewer",
    "ViewerState",
]
