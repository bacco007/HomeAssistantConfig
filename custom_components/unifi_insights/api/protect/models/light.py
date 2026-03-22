"""Light models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LightMode(str, Enum):
    """Light operating modes."""

    OFF = "off"
    ON = "on"
    MOTION = "motion"
    SCHEDULE = "schedule"
    AUTO = "auto"


class Light(BaseModel):
    """Model representing a UniFi Protect light."""

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
    is_light_on: bool = Field(default=False, alias="isLightOn")
    is_pir_motion_detected: bool = Field(default=False, alias="isPirMotionDetected")
    is_dark: bool = Field(default=False, alias="isDark")
    light_mode: LightMode = Field(default=LightMode.OFF, alias="lightMode")
    light_on_settings: dict[str, Any] | None = Field(
        default=None, alias="lightOnSettings"
    )
    light_device_settings: dict[str, Any] | None = Field(
        default=None, alias="lightDeviceSettings"
    )
    brightness: int | None = None
    led_level: int | None = Field(default=None, alias="ledLevel")
    pir_sensitivity: int | None = Field(default=None, alias="pirSensitivity")
    pir_duration: int | None = Field(default=None, alias="pirDuration")
    camera: str | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the light."""
        return self.name or self.mac
