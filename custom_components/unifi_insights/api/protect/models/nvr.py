"""NVR models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class StorageInfo(BaseModel):
    """NVR storage information."""

    total_size: int = Field(default=0, alias="totalSize")
    used_size: int = Field(default=0, alias="usedSize")
    available_size: int = Field(default=0, alias="availableSize")
    device_type: str | None = Field(default=None, alias="deviceType")
    healthy: bool = True

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def usage_percent(self) -> float:
        """Calculate storage usage percentage."""
        if self.total_size == 0:
            return 0.0
        return (self.used_size / self.total_size) * 100


class NVR(BaseModel):
    """Model representing a UniFi Protect NVR."""

    id: str
    mac: str | None = None
    name: str | None = None
    type: str | None = None
    model: str | None = None
    host_type: str | None = Field(default=None, alias="hostType")
    firmware_version: str | None = Field(default=None, alias="firmwareVersion")
    hardware_revision: str | None = Field(default=None, alias="hardwareRevision")
    uptime: int | None = None
    last_seen: datetime | None = Field(default=None, alias="lastSeen")
    host: str | None = None
    version: str | None = None
    is_connected_to_cloud: bool = Field(default=False, alias="isConnectedToCloud")
    is_setup: bool = Field(default=False, alias="isSetup")
    is_recording_disabled: bool = Field(default=False, alias="isRecordingDisabled")
    is_recording_motion_only: bool = Field(default=False, alias="isRecordingMotionOnly")
    storage_info: StorageInfo | dict[str, Any] | None = Field(
        default=None, alias="storageInfo"
    )
    timezone: str | None = None
    cpu_load: float | None = Field(default=None, alias="cpuLoad")
    memory_usage: float | None = Field(default=None, alias="memoryUsage")
    camera_count: int = Field(default=0, alias="cameraCount")
    recording_retention_days: int | None = Field(
        default=None, alias="recordingRetentionDays"
    )
    enable_automatic_backups: bool = Field(
        default=False, alias="enableAutomaticBackups"
    )
    feature_flags: dict[str, Any] | None = Field(default=None, alias="featureFlags")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the NVR."""
        return self.name or self.mac or self.id
