"""Sensor models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class SensorType(str, Enum):
    """Types of UniFi sensors."""

    DOOR = "door"
    WINDOW = "window"
    MOTION = "motion"
    WATER = "water"
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    LIGHT = "light"
    UNKNOWN = "unknown"


class BatteryStatus(BaseModel):
    """Model representing battery status for a UniFi Protect sensor."""

    percentage: int | None = None
    is_low: bool = Field(default=False, alias="isLow")

    model_config = {"populate_by_name": True, "extra": "allow"}


class Sensor(BaseModel):
    """Model representing a UniFi Protect sensor."""

    id: str
    mac: str
    name: str | None = None
    type: str | None = None
    model: str | None = None
    state: str | None = None
    firmware_version: str | None = Field(default=None, alias="firmwareVersion")
    hardware_revision: str | None = Field(default=None, alias="hardwareRevision")
    uptime: int | None = None
    last_seen: datetime | None = Field(default=None, alias="lastSeen")
    connected_since: datetime | None = Field(default=None, alias="connectedSince")
    is_connected: bool = Field(default=False, alias="isConnected")
    battery_status: BatteryStatus | None = Field(default=None, alias="batteryStatus")
    battery_level: int | None = Field(default=None, alias="batteryLevel")
    is_opened: bool | None = Field(default=None, alias="isOpened")
    is_motion_detected: bool | None = Field(default=None, alias="isMotionDetected")
    is_alarm_detected: bool | None = Field(default=None, alias="isAlarmDetected")
    temperature: float | None = None
    humidity: float | None = None
    light_value: float | None = Field(default=None, alias="lightValue")
    motion_sensitivity: int | None = Field(default=None, alias="motionSensitivity")
    open_status_led_enabled: bool = Field(default=True, alias="openStatusLedEnabled")
    alarm_settings: dict[str, Any] | None = Field(default=None, alias="alarmSettings")
    mount_type: str | None = Field(default=None, alias="mountType")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the sensor."""
        return self.name or self.mac
