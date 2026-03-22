"""Camera models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class CameraType(str, Enum):
    """Types of UniFi cameras."""

    UVC_G3 = "UVC G3"
    UVC_G3_DOME = "UVC G3 Dome"
    UVC_G3_FLEX = "UVC G3 Flex"
    UVC_G3_PRO = "UVC G3 Pro"
    UVC_G3_BULLET = "UVC G3 Bullet"
    UVC_G4_BULLET = "UVC G4 Bullet"
    UVC_G4_PRO = "UVC G4 Pro"
    UVC_G4_DOME = "UVC G4 Dome"
    UVC_G4_DOORBELL = "UVC G4 Doorbell"
    UVC_G4_DOORBELL_PRO = "UVC G4 Doorbell Pro"
    UVC_G4_INSTANT = "UVC G4 Instant"
    UVC_G5_BULLET = "UVC G5 Bullet"
    UVC_G5_DOME = "UVC G5 Dome"
    UVC_G5_FLEX = "UVC G5 Flex"
    UVC_G5_PRO = "UVC G5 Pro"
    UVC_AI_360 = "UVC AI 360"
    UVC_AI_BULLET = "UVC AI Bullet"
    UVC_AI_PRO = "UVC AI Pro"
    UNKNOWN = "Unknown"


class CameraState(str, Enum):
    """Camera connection states."""

    CONNECTED = "CONNECTED"
    DISCONNECTED = "DISCONNECTED"
    CONNECTING = "CONNECTING"
    ADOPTING = "ADOPTING"
    UPDATING = "UPDATING"
    UNKNOWN = "UNKNOWN"


class RecordingMode(str, Enum):
    """Recording modes for cameras."""

    ALWAYS = "always"
    MOTION = "motion"
    SMART = "smart"
    SCHEDULE = "schedule"
    NEVER = "never"


class VideoMode(str, Enum):
    """Video modes for cameras."""

    DEFAULT = "default"
    HIGH_FPS = "highFps"
    SPORT = "sport"
    SLOW_SHUTTER = "slowShutter"
    # LPR (License Plate Recognition) related modes
    LPR_NONE_REFLEX = "lprNoneReflex"
    LPR_SLOW_SHUTTER = "lprSlowShutter"


class CameraChannel(BaseModel):
    """Camera video channel configuration."""

    id: int
    name: str | None = None
    enabled: bool = True
    width: int | None = None
    height: int | None = None
    fps: int | None = None
    bitrate: int | None = None
    is_rtsp_enabled: bool = Field(default=False, alias="isRtspEnabled")
    rtsp_url: str | None = Field(default=None, alias="rtspUrl")

    model_config = {"populate_by_name": True, "extra": "allow"}


class Camera(BaseModel):
    """Model representing a UniFi Protect camera."""

    id: str
    mac: str
    name: str | None = None
    type: str | None = None
    model: str | None = None
    state: CameraState = CameraState.UNKNOWN
    host: str | None = None
    connection_host: str | None = Field(default=None, alias="connectionHost")
    firmware_version: str | None = Field(default=None, alias="firmwareVersion")
    hardware_revision: str | None = Field(default=None, alias="hardwareRevision")
    uptime: int | None = None
    last_seen: datetime | None = Field(default=None, alias="lastSeen")
    connected_since: datetime | None = Field(default=None, alias="connectedSince")
    is_connected: bool = Field(default=False, alias="isConnected")
    is_dark: bool = Field(default=False, alias="isDark")
    is_recording: bool = Field(default=False, alias="isRecording")
    is_motion_detected: bool = Field(default=False, alias="isMotionDetected")
    is_smart_detected: bool = Field(default=False, alias="isSmartDetected")
    recording_mode: RecordingMode | str | None = Field(
        default=None, alias="recordingMode"
    )
    video_mode: VideoMode | str | None = Field(default=None, alias="videoMode")
    hdr_mode: bool = Field(default=False, alias="hdrMode")
    mic_volume: int = Field(default=100, alias="micVolume")
    speaker_volume: int = Field(default=100, alias="speakerVolume")
    channels: list[CameraChannel] = Field(default_factory=list)
    feature_flags: dict[str, Any] = Field(default_factory=dict, alias="featureFlags")
    is_ptz: bool = Field(default=False, alias="isPtz")
    has_speaker: bool = Field(default=False, alias="hasSpeaker")
    has_microphone: bool = Field(default=False, alias="hasMicrophone")
    has_led_ir: bool = Field(default=False, alias="hasLedIr")
    has_led_status: bool = Field(default=False, alias="hasLedStatus")
    motion_zones: list[dict[str, Any]] = Field(
        default_factory=list, alias="motionZones"
    )
    privacy_zones: list[dict[str, Any]] = Field(
        default_factory=list, alias="privacyZones"
    )
    smart_detect_zones: list[dict[str, Any]] = Field(
        default_factory=list, alias="smartDetectZones"
    )
    smart_detect_types: list[str] = Field(
        default_factory=list, alias="smartDetectTypes"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the camera."""
        return self.name or self.mac

    def construct_rtsp_url(
        self,
        nvr_host: str,
        port: int = 7441,
        channel: int = 0,
        *,
        use_srtp: bool = True,
    ) -> str:
        """
        Construct an RTSP URL for this camera using the static format.

        WARNING: This constructs a static URL that may not work with all setups.
        The recommended approach is to use `cameras.create_rtsps_stream()` which
        provides dynamic, token-based URLs that are more secure and reliable.

        The integration API does not provide RTSP URLs directly in the camera
        response. This helper constructs a URL based on the standard UniFi
        Protect static format (camera_id + channel index).

        Args:
            nvr_host: The NVR/Protect device IP or hostname.
            port: RTSPS port (default 7441 for RTSPS).
            channel: Video channel index (0 for high quality, 1 for medium, 2 for low).
            use_srtp: Whether to use SRTP encryption (default True for secure streams).

        Returns:
            Constructed RTSPS URL string.

        Example:
            # Preferred method - dynamic URL
            stream = await client.cameras.create_rtsps_stream(camera.id)
            url = stream.high  # e.g., rtsps://192.168.1.1:7441/abc123?enableSrtp

            # Alternative - static URL construction
            url = camera.construct_rtsp_url('192.168.1.1')

        """
        scheme = "rtsps" if use_srtp else "rtsp"
        srtp_param = "?enableSrtp" if use_srtp else ""
        return f"{scheme}://{nvr_host}:{port}/{self.id}_{channel}{srtp_param}"
