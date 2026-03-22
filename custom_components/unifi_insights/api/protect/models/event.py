"""Event models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Types of Protect events."""

    MOTION = "motion"
    SMART_DETECT = "smartDetect"
    RING = "ring"
    SENSOR_OPENED = "sensorOpened"
    SENSOR_CLOSED = "sensorClosed"
    SENSOR_ALARM = "sensorAlarm"
    DISCONNECT = "disconnect"
    CONNECT = "connect"
    ACCESS = "access"
    UNKNOWN = "unknown"


class SmartDetectType(str, Enum):
    """Smart detection types."""

    PERSON = "person"
    VEHICLE = "vehicle"
    ANIMAL = "animal"
    PACKAGE = "package"
    FACE = "face"
    LICENSE_PLATE = "licensePlate"


class Event(BaseModel):
    """Model representing a UniFi Protect event."""

    id: str
    type: EventType | str
    start: datetime | None = None
    end: datetime | None = None
    score: int | None = None
    camera: str | None = None
    camera_id: str | None = Field(default=None, alias="cameraId")
    sensor: str | None = None
    sensor_id: str | None = Field(default=None, alias="sensorId")
    smart_detect_types: list[str] = Field(
        default_factory=list, alias="smartDetectTypes"
    )
    smart_detect_events: list[str] = Field(
        default_factory=list, alias="smartDetectEvents"
    )
    thumbnail: str | None = None
    heatmap: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def duration(self) -> float | None:
        """Calculate event duration in seconds."""
        if self.start and self.end:
            return (self.end - self.start).total_seconds()
        return None
