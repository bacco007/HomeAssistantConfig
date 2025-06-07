"""UniFi Protect API client."""
from __future__ import annotations

import asyncio
import logging
import random
import time
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional, Set

import aiohttp
import async_timeout
from aiohttp import ClientSession, ClientWebSocketResponse, WSMsgType
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_create_clientsession

from .const import (
    API_PATH_CAMERA,
    API_PATH_CAMERA_RTSPS,
    API_PATH_CAMERA_SNAPSHOT,
    API_PATH_CAMERAS,
    API_PATH_CHIME,
    API_PATH_CHIME_PLAY,
    API_PATH_CHIMES,
    API_PATH_INFO,
    API_PATH_LIGHT,
    API_PATH_LIGHTS,
    API_PATH_NVR,
    API_PATH_NVRS,
    API_PATH_PTZ_MOVE,
    API_PATH_PTZ_PATROL_START,
    API_PATH_PTZ_PATROL_STOP,
    API_PATH_SENSOR,
    API_PATH_SENSORS,
    API_PATH_WEBSOCKET_DEVICES,
    API_PATH_WEBSOCKET_EVENTS,
    CAMERA_STATE_CONNECTED,
    CAMERA_STATE_CONNECTING,
    CAMERA_STATE_DISCONNECTED,
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_SENSOR,
    DEVICE_TYPE_VIEWER,
    HDR_MODE_AUTO,
    HDR_MODE_OFF,
    HDR_MODE_ON,
    LIGHT_MODE_ALWAYS,
    LIGHT_MODE_MOTION,
    LIGHT_MODE_OFF,
    UNIFI_API_HEADERS,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
    VIDEO_MODE_SLOW_SHUTTER,
    VIDEO_MODE_SPORT,
    WS_CONNECTION_TIMEOUT,
    WS_INITIAL_CONNECTION_TIMEOUT,
    WS_ADAPTIVE_TIMEOUT_MULTIPLIER,
    WS_MAX_CONNECTION_TIMEOUT,
    WS_DEVICE_UPDATE_TYPES,
    WS_ERROR_AUTHENTICATION,
    WS_ERROR_NETWORK,
    WS_ERROR_SERVER,
    WS_ERROR_TIMEOUT,
    WS_ERROR_UNKNOWN,
    WS_EVENT_UPDATE_TYPES,
    WS_HEARTBEAT_INTERVAL,
    WS_HEARTBEAT_TIMEOUT,
    WS_HEALTH_CHECK_INTERVAL,
    WS_MAX_CONSECUTIVE_ERRORS,
    WS_RECONNECT_BASE_DELAY,
    WS_RECONNECT_JITTER,
    WS_RECONNECT_MAX_DELAY,
    WS_STALE_CONNECTION_THRESHOLD,
    WS_STATE_CONNECTED,
    WS_STATE_CONNECTING,
    WS_STATE_DISCONNECTED,
    WS_STATE_FAILED,
    WS_STATE_RECONNECTING,
)

_LOGGER = logging.getLogger(__name__)


class UnifiProtectAuthError(Exception):
    """Exception raised for authentication errors."""


class UnifiProtectConnectionError(Exception):
    """Exception raised for connection errors."""


class UnifiProtectApiError(Exception):
    """Exception raised for API errors."""


@dataclass
class WebSocketConnectionStats:
    """WebSocket connection statistics."""

    state: str = WS_STATE_DISCONNECTED
    last_connected: Optional[datetime] = None
    last_disconnected: Optional[datetime] = None
    last_error: Optional[str] = None
    last_error_time: Optional[datetime] = None
    connection_attempts: int = 0
    successful_connections: int = 0
    failed_connections: int = 0
    consecutive_errors: int = 0
    messages_received: int = 0
    last_message_time: Optional[datetime] = None
    last_heartbeat_time: Optional[datetime] = None
    heartbeat_response_time: Optional[float] = None
    reconnect_delay: float = WS_RECONNECT_BASE_DELAY
    buffered_messages: List[Dict[str, Any]] = field(default_factory=list)
    processed_message_ids: Set[str] = field(default_factory=set)

    def update_state(self, new_state: str) -> None:
        """Update connection state with timestamp."""
        self.state = new_state
        now = datetime.now()

        if new_state == WS_STATE_CONNECTED:
            self.last_connected = now
            self.successful_connections += 1
            self.consecutive_errors = 0
            # Reset reconnect delay on successful connection
            self.reconnect_delay = WS_RECONNECT_BASE_DELAY
        elif new_state in (WS_STATE_DISCONNECTED, WS_STATE_FAILED):
            self.last_disconnected = now

    def record_error(self, error_type: str) -> None:
        """Record an error with timestamp."""
        self.last_error = error_type
        self.last_error_time = datetime.now()
        self.failed_connections += 1
        self.consecutive_errors += 1

    def record_message(self) -> None:
        """Record a received message."""
        self.messages_received += 1
        self.last_message_time = datetime.now()

    def record_heartbeat(self, response_time: float) -> None:
        """Record a heartbeat with response time."""
        self.last_heartbeat_time = datetime.now()
        self.heartbeat_response_time = response_time

    def calculate_reconnect_delay(self) -> float:
        """Calculate reconnect delay with exponential backoff and jitter."""
        # Calculate base delay with exponential backoff
        delay = min(
            self.reconnect_delay * (2 ** (self.connection_attempts - 1)),
            WS_RECONNECT_MAX_DELAY,
        )

        # Add jitter (±20%)
        jitter_factor = 1.0 + random.uniform(-WS_RECONNECT_JITTER, WS_RECONNECT_JITTER)
        delay = delay * jitter_factor

        # Update for next time
        self.reconnect_delay = delay

        return delay

    def calculate_adaptive_timeout(self) -> float:
        """Calculate adaptive connection timeout based on connection attempts."""
        base_timeout = WS_CONNECTION_TIMEOUT

        # Increase timeout for subsequent attempts
        if self.connection_attempts > 1:
            timeout = min(
                base_timeout * (WS_ADAPTIVE_TIMEOUT_MULTIPLIER ** (self.connection_attempts - 1)),
                WS_MAX_CONNECTION_TIMEOUT
            )
        else:
            timeout = WS_INITIAL_CONNECTION_TIMEOUT

        return timeout

    def is_connection_stale(self) -> bool:
        """Check if connection appears stale based on message timing."""
        if not self.last_message_time:
            return False

        time_since_message = (datetime.now() - self.last_message_time).total_seconds()
        return time_since_message > WS_STALE_CONNECTION_THRESHOLD

    def should_force_reconnect(self) -> bool:
        """Determine if we should force a reconnection."""
        return (
            self.state == WS_STATE_CONNECTED and
            self.is_connection_stale() and
            self.consecutive_errors < WS_MAX_CONSECUTIVE_ERRORS
        )

    def buffer_message(self, message: Dict[str, Any]) -> None:
        """Buffer a message for later processing."""
        self.buffered_messages.append(message)

    def get_buffered_messages(self) -> List[Dict[str, Any]]:
        """Get and clear buffered messages."""
        messages = self.buffered_messages.copy()
        self.buffered_messages.clear()
        return messages

    def is_message_duplicate(self, message_id: str) -> bool:
        """Check if a message has already been processed."""
        if message_id in self.processed_message_ids:
            return True

        # Add to processed set and maintain a reasonable size
        self.processed_message_ids.add(message_id)
        if len(self.processed_message_ids) > 1000:
            # Remove oldest entries (this is approximate since sets don't maintain order)
            # In a production environment, you might want a more sophisticated approach
            self.processed_message_ids = set(list(self.processed_message_ids)[-500:])

        return False


class UnifiProtectClient:
    """UniFi Protect API client."""

    def __init__(
        self,
        hass: HomeAssistant,
        api_key: str,
        host: str,
        session: ClientSession | None = None,
        verify_ssl: bool = False,
    ) -> None:
        """Initialize the API client."""
        _LOGGER.debug("Initializing UniFi Protect API client with host: %s", host)
        self._api_key = api_key
        self._host = host
        self._verify_ssl = verify_ssl

        if session:
            self._session = session
        else:
            self._session = async_create_clientsession(
                hass,
                verify_ssl=verify_ssl,
            )

        self._request_lock = asyncio.Lock()
        self._ws_devices: Optional[ClientWebSocketResponse] = None
        self._ws_events: Optional[ClientWebSocketResponse] = None
        self._ws_devices_task: Optional[asyncio.Task] = None
        self._ws_events_task: Optional[asyncio.Task] = None
        self._device_update_callbacks: List[Callable[[str, Dict[str, Any]], None]] = []
        self._event_update_callbacks: List[Callable[[str, Dict[str, Any]], None]] = []

        # WebSocket connection stats
        self._ws_devices_stats = WebSocketConnectionStats()
        self._ws_events_stats = WebSocketConnectionStats()

        # Heartbeat tasks
        self._ws_devices_heartbeat_task: Optional[asyncio.Task] = None
        self._ws_events_heartbeat_task: Optional[asyncio.Task] = None

        _LOGGER.info("UniFi Protect API client initialized")

    @property
    def host(self) -> str:
        """Return the host address for the UniFi Protect system."""
        return self._host

    @property
    def is_local_network(self) -> bool:
        """Check if we're connecting to a local network."""
        return any(local in self._host for local in ['192.168.', '10.', '172.', 'localhost', '127.0.0.1'])

    def get_network_optimized_config(self) -> dict:
        """Get WebSocket configuration optimized for network conditions."""
        if self.is_local_network:
            return {
                'connection_timeout': 15.0,
                'heartbeat_interval': 30.0,
                'health_check_interval': 10.0,
                'max_errors': 10,
            }
        else:
            # WAN connection - be more patient
            return {
                'connection_timeout': 30.0,
                'heartbeat_interval': 45.0,
                'health_check_interval': 15.0,
                'max_errors': 15,
            }

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Make an API request."""
        async with self._request_lock:
            headers = {
                **UNIFI_API_HEADERS,
                "X-API-Key": self._api_key,
            }

            if "headers" in kwargs:
                headers.update(kwargs.pop("headers"))

            url = f"{self._host}{endpoint}"
            _LOGGER.debug("Making %s request to %s", method, url)

            try:
                async with async_timeout.timeout(30):
                    response = await self._session.request(
                        method,
                        url,
                        headers=headers,
                        **kwargs,
                    )

                    if response.status == 401:
                        _LOGGER.error("Authentication error: Invalid API key")
                        raise UnifiProtectAuthError("Invalid API key")

                    if response.status == 403:
                        _LOGGER.error("Authentication error: Forbidden")
                        raise UnifiProtectAuthError("Forbidden")

                    if response.status >= 400:
                        text = await response.text()
                        _LOGGER.error(
                            "Request failed with status %s: %s",
                            response.status,
                            text,
                        )
                        raise UnifiProtectApiError(
                            f"Request failed with status {response.status}: {text}"
                        )

                    if response.status == 204:
                        return {}

                    return await response.json()

            except asyncio.TimeoutError as err:
                _LOGGER.error("Request timeout: %s", err)
                raise UnifiProtectConnectionError("Request timeout") from err
            except aiohttp.ClientError as err:
                _LOGGER.error("Connection error: %s", err)
                raise UnifiProtectConnectionError(f"Connection error: {err}") from err
            except Exception as err:
                _LOGGER.error("Unexpected error: %s", err)
                raise UnifiProtectApiError(f"Unexpected error: {err}") from err

    async def async_get_api_info(self) -> dict[str, Any]:
        """Get API information."""
        _LOGGER.debug("Getting API information")
        return await self._request("GET", API_PATH_INFO)

    async def async_validate_api_key(self) -> bool:
        """Validate API key by fetching API information."""
        _LOGGER.debug("Validating API key")
        try:
            await self.async_get_api_info()
            _LOGGER.info("API key validation successful")
            return True
        except UnifiProtectAuthError:
            _LOGGER.error("API key validation failed")
            return False
        except Exception as err:
            _LOGGER.error("Unexpected error during API key validation: %s", err)
            return False

    async def async_get_cameras(self) -> list[dict[str, Any]]:
        """Get all cameras."""
        _LOGGER.debug("Getting all cameras")
        response = await self._request("GET", API_PATH_CAMERAS)

        # First, check if we have pre-existing dual-camera entities (per API documentation)
        processed_cameras = self._process_existing_dual_camera_entities(response)

        # If no pre-existing dual cameras found, use our synthetic approach
        if len(processed_cameras) == len(response):
            # No dual-camera grouping occurred, process for synthetic dual-camera support
            final_cameras = []
            for camera in processed_cameras:
                final_cameras.extend(self._process_camera_for_dual_support(camera))
            processed_cameras = final_cameras

        _LOGGER.debug("Processed %d cameras into %d camera entities", len(response), len(processed_cameras))
        return processed_cameras

    async def async_get_camera(self, camera_id: str) -> dict[str, Any]:
        """Get camera details."""
        _LOGGER.debug("Getting camera details for %s", camera_id)
        endpoint = API_PATH_CAMERA.format(id=camera_id)
        return await self._request("GET", endpoint)

    async def async_update_camera(
        self, camera_id: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update camera settings."""
        _LOGGER.debug("Updating camera settings for %s", camera_id)
        endpoint = API_PATH_CAMERA.format(id=camera_id)
        return await self._request("PATCH", endpoint, json=data)

    async def async_set_camera_hdr_mode(self, camera_id: str, mode: str) -> dict[str, Any]:
        """Set camera HDR mode."""
        _LOGGER.debug("Setting HDR mode to %s for camera %s", mode, camera_id)
        return await self.async_update_camera(camera_id, {"hdrType": mode})

    async def async_set_camera_video_mode(self, camera_id: str, mode: str) -> dict[str, Any]:
        """Set camera video mode."""
        _LOGGER.debug("Setting video mode to %s for camera %s", mode, camera_id)
        return await self.async_update_camera(camera_id, {"videoMode": mode})

    async def async_set_camera_mic_volume(self, camera_id: str, volume: int) -> dict[str, Any]:
        """Set camera microphone volume."""
        _LOGGER.debug("Setting microphone volume to %s for camera %s", volume, camera_id)
        return await self.async_update_camera(camera_id, {"micVolume": volume})

    async def async_set_light_level(self, light_id: str, level: int) -> dict[str, Any]:
        """Set light brightness level."""
        _LOGGER.debug("Setting light level to %s for light %s", level, light_id)
        endpoint = API_PATH_LIGHT.format(id=light_id)
        return await self._request("PATCH", endpoint, json={"lightDeviceSettings": {"ledLevel": level}})

    async def async_get_camera_snapshot(
        self, camera_id: str, high_quality: bool = False
    ) -> bytes:
        """Get camera snapshot."""
        _LOGGER.debug("Getting camera snapshot for %s (high_quality=%s)", camera_id, high_quality)

        # Handle dual-camera IDs by extracting the original camera ID
        original_camera_id = self._get_original_camera_id(camera_id)
        endpoint = API_PATH_CAMERA_SNAPSHOT.format(id=original_camera_id)
        if high_quality:
            endpoint = f"{endpoint}?highQuality=true"

        async with self._request_lock:
            headers = {
                **UNIFI_API_HEADERS,
                "X-API-Key": self._api_key,
                "Accept": "image/jpeg",
            }

            url = f"{self._host}{endpoint}"

            try:
                async with async_timeout.timeout(30):
                    response = await self._session.get(
                        url,
                        headers=headers,
                    )

                    if response.status == 401:
                        _LOGGER.error("Authentication error: Invalid API key")
                        raise UnifiProtectAuthError("Invalid API key")

                    if response.status == 403:
                        _LOGGER.error("Authentication error: Forbidden")
                        raise UnifiProtectAuthError("Forbidden")

                    if response.status == 400:
                        text = await response.text()
                        if "Camera does not support full HD snapshot" in text:
                            _LOGGER.debug(
                                "Camera %s does not support full HD snapshot, try with high_quality=False",
                                camera_id,
                            )
                            # This is a specific error we want to handle gracefully
                            raise UnifiProtectApiError(
                                f"Camera does not support full HD snapshot: {text}"
                            )
                        else:
                            _LOGGER.error(
                                "Request failed with status %s: %s",
                                response.status,
                                text,
                            )
                            raise UnifiProtectApiError(
                                f"Request failed with status {response.status}: {text}"
                            )

                    if response.status >= 400:
                        text = await response.text()
                        _LOGGER.error(
                            "Request failed with status %s: %s",
                            response.status,
                            text,
                        )
                        raise UnifiProtectApiError(
                            f"Request failed with status {response.status}: {text}"
                        )

                    return await response.read()

            except asyncio.TimeoutError as err:
                _LOGGER.error("Request timeout: %s", err)
                raise UnifiProtectConnectionError("Request timeout") from err
            except aiohttp.ClientError as err:
                _LOGGER.error("Connection error: %s", err)
                raise UnifiProtectConnectionError(f"Connection error: {err}") from err
            except UnifiProtectApiError:
                # Re-raise API errors without wrapping them
                raise
            except Exception as err:
                _LOGGER.error("Unexpected error: %s", err)
                raise UnifiProtectApiError(f"Unexpected error: {err}") from err

    async def async_get_camera_rtsps_stream(
        self, camera_id: str, qualities: list[str]
    ) -> dict[str, Any]:
        """Get RTSPS stream URLs for a camera."""
        _LOGGER.debug("Getting RTSPS stream URLs for camera %s", camera_id)

        # Handle dual-camera IDs by extracting the original camera ID
        original_camera_id = self._get_original_camera_id(camera_id)
        endpoint = API_PATH_CAMERA_RTSPS.format(id=original_camera_id)
        data = {"qualities": qualities}
        return await self._request("POST", endpoint, json=data)

    def _process_existing_dual_camera_entities(self, cameras: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Process cameras to detect pre-existing dual-camera doorbell entities (per API documentation)."""
        _LOGGER.debug("Checking for pre-existing dual-camera doorbell entities")

        # Group cameras by potential doorbell pairs (per API documentation approach)
        potential_doorbells = {}
        regular_cameras = []

        for camera in cameras:
            camera_id = camera.get("id", "")
            camera_name = camera.get("name", "")

            # Check if this camera supports package detection (primary indicator)
            feature_flags = camera.get("featureFlags", {})
            smart_detect_types = feature_flags.get("smartDetectTypes", [])

            if "package" in smart_detect_types:
                # This camera supports package detection - check if it's part of a dual-camera doorbell
                base_id = camera_id

                # Remove potential suffixes as suggested in documentation
                if camera_id.endswith("_main") or camera_id.endswith("_package"):
                    base_id = camera_id.rsplit("_", 1)[0]
                elif "Main" in camera_name or "Package" in camera_name:
                    # Use a normalized base ID based on name pattern
                    base_name = camera_name.replace(" Main Camera", "").replace(" Package Camera", "")
                    base_id = f"doorbell_{hash(base_name) % 10000}"  # Create consistent base ID

                if base_id not in potential_doorbells:
                    potential_doorbells[base_id] = []
                potential_doorbells[base_id].append(camera)

                _LOGGER.debug("Camera %s (%s) supports package detection, grouped under base ID %s",
                             camera_name, camera_id, base_id)
            else:
                # Regular camera without package detection
                regular_cameras.append(camera)

        # Identify actual dual-camera doorbells (groups with 2 cameras)
        processed_cameras = regular_cameras.copy()
        dual_camera_count = 0

        for base_id, doorbell_cameras in potential_doorbells.items():
            if len(doorbell_cameras) == 2:
                # Found a dual-camera doorbell with pre-existing separate entities
                main_camera = None
                package_camera = None

                # Identify main vs package camera
                for camera in doorbell_cameras:
                    camera_name = camera.get("name", "")
                    camera_id = camera.get("id", "")

                    if "Main" in camera_name or camera_id.endswith("_main"):
                        main_camera = camera
                    elif "Package" in camera_name or camera_id.endswith("_package"):
                        package_camera = camera
                    else:
                        # Fallback: first camera is main, second is package
                        if main_camera is None:
                            main_camera = camera
                        else:
                            package_camera = camera

                if main_camera and package_camera:
                    # Mark cameras with dual-camera metadata
                    main_camera["_camera_type"] = "doorbell_main"
                    main_camera["_is_package_camera"] = False
                    main_camera["_parent_camera_id"] = base_id
                    main_camera["_original_camera_id"] = main_camera.get("id")

                    package_camera["_camera_type"] = "doorbell_package"
                    package_camera["_is_package_camera"] = True
                    package_camera["_parent_camera_id"] = base_id
                    package_camera["_original_camera_id"] = package_camera.get("id")

                    processed_cameras.extend([main_camera, package_camera])
                    dual_camera_count += 1

                    _LOGGER.info("Detected pre-existing dual-camera doorbell: %s (main: %s, package: %s)",
                                base_id, main_camera.get("name"), package_camera.get("name"))
                else:
                    # Couldn't identify main/package, treat as regular cameras
                    processed_cameras.extend(doorbell_cameras)
            else:
                # Single camera with package detection or incomplete pair
                for camera in doorbell_cameras:
                    camera["_camera_type"] = "doorbell"
                    camera["_is_package_camera"] = False
                    camera["_parent_camera_id"] = None
                    processed_cameras.append(camera)

        if dual_camera_count > 0:
            _LOGGER.info("Found %d pre-existing dual-camera doorbell(s) with separate entities", dual_camera_count)

        return processed_cameras

    def _process_camera_for_dual_support(self, camera: dict[str, Any]) -> list[dict[str, Any]]:
        """Process a camera to detect and create dual-camera doorbell entities."""
        camera_id = camera.get("id")
        camera_name = camera.get("name", "Unknown Camera")
        camera_type = camera.get("type", "").lower()

        # Check if this camera supports package detection
        has_package_detection = self._detect_package_camera_support(camera)

        # Check if this is a doorbell camera
        is_doorbell = any(doorbell_type in camera_type for doorbell_type in [
            "doorbell", "g4-doorbell", "ai-doorbell", "g4doorbell", "aidoorbell"
        ])

        # NOTE: Dual-camera creation is only for cameras that appear as separate entities in the API
        # Single cameras with package detection should remain as single entities with package detection capability
        if has_package_detection:
            _LOGGER.debug("Camera %s (%s) supports package detection but appears as single camera - keeping as single entity with package detection", camera_name, camera_id)

        # Set camera type based on doorbell status and package detection
        if is_doorbell:
            if has_package_detection:
                camera["_camera_type"] = "doorbell_with_package_detection"
            else:
                camera["_camera_type"] = "doorbell"
        else:
            if has_package_detection:
                camera["_camera_type"] = "camera_with_package_detection"
            else:
                camera["_camera_type"] = "regular"

        camera["_is_package_camera"] = False
        camera["_parent_camera_id"] = None
        camera["_supports_package_detection"] = has_package_detection

        return [camera]

    def _detect_package_camera_support(self, camera: dict[str, Any]) -> bool:
        """Detect if a doorbell camera supports package detection (dual-camera)."""
        camera_name = camera.get("name", "Unknown")

        # PRIMARY INDICATOR: Check smartDetectTypes for "package" support (per API documentation)
        feature_flags = camera.get("featureFlags", {})
        smart_detect_types = feature_flags.get("smartDetectTypes", [])

        if "package" in smart_detect_types:
            _LOGGER.debug("Found 'package' in smartDetectTypes for camera %s - primary dual-camera indicator", camera_name)
            return True

        # SECONDARY INDICATOR: Check smartDetectSettings.objectTypes for package detection
        smart_detect_settings = camera.get("smartDetectSettings", {})
        object_types = smart_detect_settings.get("objectTypes", [])

        if "package" in object_types:
            _LOGGER.debug("Found 'package' in smartDetectSettings.objectTypes for camera %s", camera_name)
            return True

        # TERTIARY INDICATORS: Check other feature flags for dual-camera support
        package_indicators = [
            "hasPackageCamera",
            "packageDetection",
            "dualCamera",
            "secondaryCamera",
            "packageCameraSupport",
            "multiCamera"
        ]

        for indicator in package_indicators:
            if feature_flags.get(indicator, False):
                _LOGGER.debug("Found package camera indicator '%s' for camera %s", indicator, camera_name)
                return True

        # Check for multiple video channels/streams
        channels = camera.get("channels", [])
        video_channels = camera.get("videoChannels", [])
        streams = camera.get("streams", [])

        if len(channels) > 1 or len(video_channels) > 1 or len(streams) > 1:
            _LOGGER.debug("Found multiple video channels/streams for camera %s, indicating dual-camera support", camera_name)
            return True

        # Check for package-related settings in video configuration
        video_settings = camera.get("videoSettings", {})
        if any("package" in str(key).lower() for key in video_settings.keys()):
            _LOGGER.debug("Found package-related video settings for camera %s", camera_name)
            return True

        # Check model name for known dual-camera models
        model = camera.get("model", "").lower()
        dual_camera_models = [
            "g4-doorbell-pro",
            "ai-doorbell",
            "g4doorbell-pro",
            "aidoorbell"
        ]

        if any(dual_model in model for dual_model in dual_camera_models):
            _LOGGER.debug("Camera model %s indicates dual-camera support for camera %s", model, camera_name)
            return True

        return False

    def _configure_package_camera_streams(self, package_camera: dict[str, Any]) -> None:
        """Configure stream settings for package camera."""
        camera_name = package_camera.get("name", "Unknown")

        # Add package camera specific configuration
        package_camera["_stream_type"] = "package"
        package_camera["_package_detection_enabled"] = True

        # For synthetic dual-camera creation, both cameras use the same stream initially
        # but we mark the package camera for potential different handling
        package_camera["_synthetic_dual_camera"] = True

        # If there are multiple channels, use the second one for package camera
        channels = package_camera.get("channels", [])
        if len(channels) > 1:
            package_camera["_preferred_channel"] = 1  # Second channel (0-indexed)
            _LOGGER.debug("Package camera %s configured to use channel 1", camera_name)
        else:
            package_camera["_preferred_channel"] = 0  # Use same channel as main camera
            _LOGGER.debug("Package camera %s using same channel as main camera", camera_name)

        video_channels = package_camera.get("videoChannels", [])
        if len(video_channels) > 1:
            package_camera["_preferred_video_channel"] = 1
        else:
            package_camera["_preferred_video_channel"] = 0

        streams = package_camera.get("streams", [])
        if len(streams) > 1:
            package_camera["_preferred_stream"] = 1
        else:
            package_camera["_preferred_stream"] = 0

        # Add package-specific smart detection settings
        smart_detect_settings = package_camera.get("smartDetectSettings", {})
        object_types = smart_detect_settings.get("objectTypes", [])

        # Ensure package detection is enabled for package camera
        if "package" not in object_types:
            object_types_copy = object_types.copy()
            object_types_copy.append("package")
            package_camera["smartDetectSettings"] = smart_detect_settings.copy()
            package_camera["smartDetectSettings"]["objectTypes"] = object_types_copy
            _LOGGER.debug("Added package detection to smartDetectSettings for package camera %s", camera_name)

    def _get_original_camera_id(self, camera_id: str) -> str:
        """Extract the original camera ID from a dual-camera ID."""
        # If this is a dual-camera ID (ends with _main or _package), extract the original ID
        if camera_id.endswith("_main") or camera_id.endswith("_package"):
            return camera_id.rsplit("_", 1)[0]
        return camera_id

    async def async_ptz_move(self, camera_id: str, preset: int) -> None:
        """Move PTZ camera to preset position."""
        _LOGGER.debug("Moving PTZ camera %s to preset %s", camera_id, preset)
        endpoint = API_PATH_PTZ_MOVE.format(id=camera_id, slot=preset)
        await self._request("POST", endpoint)

    async def async_ptz_patrol_start(self, camera_id: str, slot: int = 0) -> None:
        """Start PTZ camera patrol."""
        _LOGGER.debug("Starting PTZ camera %s patrol on slot %s", camera_id, slot)
        endpoint = API_PATH_PTZ_PATROL_START.format(id=camera_id, slot=slot)
        await self._request("POST", endpoint)

    async def async_ptz_patrol_stop(self, camera_id: str) -> None:
        """Stop PTZ camera patrol."""
        _LOGGER.debug("Stopping PTZ camera %s patrol", camera_id)
        endpoint = API_PATH_PTZ_PATROL_STOP.format(id=camera_id)
        await self._request("POST", endpoint)

    async def async_get_lights(self) -> list[dict[str, Any]]:
        """Get all lights."""
        _LOGGER.debug("Getting all lights")
        response = await self._request("GET", API_PATH_LIGHTS)
        return response

    async def async_get_sensors(self) -> list[dict[str, Any]]:
        """Get all sensors."""
        _LOGGER.debug("Getting all sensors")
        response = await self._request("GET", API_PATH_SENSORS)
        return response

    async def async_get_sensor(self, sensor_id: str) -> dict[str, Any]:
        """Get sensor details."""
        _LOGGER.debug("Getting sensor details for %s", sensor_id)
        endpoint = API_PATH_SENSOR.format(id=sensor_id)
        return await self._request("GET", endpoint)

    async def async_update_sensor(self, sensor_id: str, data: dict[str, Any]) -> dict[str, Any]:
        """Update sensor settings."""
        _LOGGER.debug("Updating sensor settings for %s", sensor_id)
        endpoint = API_PATH_SENSOR.format(id=sensor_id)
        return await self._request("PATCH", endpoint, json=data)

    async def async_get_nvrs(self) -> list[dict[str, Any]]:
        """Get all NVRs."""
        _LOGGER.debug("Getting all NVRs")
        response = await self._request("GET", API_PATH_NVRS)
        return response

    async def async_get_nvr(self, nvr_id: str) -> dict[str, Any]:
        """Get NVR details."""
        _LOGGER.debug("Getting NVR details for %s", nvr_id)
        endpoint = API_PATH_NVR.format(id=nvr_id)
        return await self._request("GET", endpoint)

    async def async_get_chimes(self) -> list[dict[str, Any]]:
        """Get all chimes."""
        _LOGGER.debug("Getting all chimes")
        response = await self._request("GET", API_PATH_CHIMES)
        return response

    async def async_get_chime(self, chime_id: str) -> dict[str, Any]:
        """Get chime details."""
        _LOGGER.debug("Getting chime details for %s", chime_id)
        endpoint = API_PATH_CHIME.format(id=chime_id)
        return await self._request("GET", endpoint)

    async def async_update_chime(self, chime_id: str, data: dict[str, Any]) -> dict[str, Any]:
        """Update chime settings."""
        _LOGGER.debug("Updating chime settings for %s", chime_id)
        endpoint = API_PATH_CHIME.format(id=chime_id)
        return await self._request("PATCH", endpoint, json=data)

    async def async_set_chime_volume(self, chime_id: str, volume: int, camera_id: str = None) -> dict[str, Any]:
        """Set chime volume level."""
        _LOGGER.debug("Setting chime %s volume to %s", chime_id, volume)

        # Get current chime data to update the correct ring settings
        chime_data = await self.async_get_chime(chime_id)
        ring_settings = chime_data.get("ringSettings", [])

        # If camera_id is specified, only update that camera's settings
        if camera_id:
            updated = False
            for setting in ring_settings:
                if setting.get("cameraId") == camera_id:
                    setting["volume"] = volume
                    updated = True
                    break

            # If camera not found in settings, add it
            if not updated and camera_id in chime_data.get("cameraIds", []):
                ring_settings.append({
                    "cameraId": camera_id,
                    "volume": volume,
                    "repeatTimes": 3,  # Default value
                    "ringtoneId": "default"  # Default value
                })
        # Otherwise update all cameras
        else:
            for setting in ring_settings:
                setting["volume"] = volume

        # Update the chime settings
        data = {"ringSettings": ring_settings}
        return await self.async_update_chime(chime_id, data)

    async def async_set_chime_ringtone(self, chime_id: str, ringtone_id: str, camera_id: str = None) -> dict[str, Any]:
        """Set chime ringtone."""
        _LOGGER.debug("Setting chime %s ringtone to %s", chime_id, ringtone_id)

        # Get current chime data to update the correct ring settings
        chime_data = await self.async_get_chime(chime_id)
        ring_settings = chime_data.get("ringSettings", [])

        # If camera_id is specified, only update that camera's settings
        if camera_id:
            updated = False
            for setting in ring_settings:
                if setting.get("cameraId") == camera_id:
                    setting["ringtoneId"] = ringtone_id
                    updated = True
                    break

            # If camera not found in settings, add it
            if not updated and camera_id in chime_data.get("cameraIds", []):
                ring_settings.append({
                    "cameraId": camera_id,
                    "volume": 80,  # Default value
                    "repeatTimes": 3,  # Default value
                    "ringtoneId": ringtone_id
                })
        # Otherwise update all cameras
        else:
            for setting in ring_settings:
                setting["ringtoneId"] = ringtone_id

        # Update the chime settings
        data = {"ringSettings": ring_settings}
        return await self.async_update_chime(chime_id, data)

    async def async_set_chime_repeat_times(self, chime_id: str, repeat_times: int, camera_id: str = None) -> dict[str, Any]:
        """Set chime repeat times."""
        _LOGGER.debug("Setting chime %s repeat times to %s", chime_id, repeat_times)

        # Get current chime data to update the correct ring settings
        chime_data = await self.async_get_chime(chime_id)
        ring_settings = chime_data.get("ringSettings", [])

        # If camera_id is specified, only update that camera's settings
        if camera_id:
            updated = False
            for setting in ring_settings:
                if setting.get("cameraId") == camera_id:
                    setting["repeatTimes"] = repeat_times
                    updated = True
                    break

            # If camera not found in settings, add it
            if not updated and camera_id in chime_data.get("cameraIds", []):
                ring_settings.append({
                    "cameraId": camera_id,
                    "volume": 80,  # Default value
                    "repeatTimes": repeat_times,
                    "ringtoneId": "default"  # Default value
                })
        # Otherwise update all cameras
        else:
            for setting in ring_settings:
                setting["repeatTimes"] = repeat_times

        # Update the chime settings
        data = {"ringSettings": ring_settings}
        return await self.async_update_chime(chime_id, data)

    async def async_play_chime_ringtone(self, chime_id: str, ringtone_id: str = None) -> None:
        """Play a ringtone on the chime."""
        _LOGGER.debug("Playing ringtone %s on chime %s", ringtone_id, chime_id)

        endpoint = API_PATH_CHIME_PLAY.format(id=chime_id)
        data = {}

        # If ringtone_id is specified, include it in the request
        if ringtone_id:
            data["ringtoneId"] = ringtone_id

        await self._request("POST", endpoint, json=data)

    async def async_get_light(self, light_id: str) -> dict[str, Any]:
        """Get light details."""
        _LOGGER.debug("Getting light details for %s", light_id)
        endpoint = API_PATH_LIGHT.format(id=light_id)
        return await self._request("GET", endpoint)

    async def async_update_light(
        self, light_id: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update light settings."""
        _LOGGER.debug("Updating light settings for %s", light_id)
        endpoint = API_PATH_LIGHT.format(id=light_id)
        return await self._request("PATCH", endpoint, json=data)

    async def async_set_light_mode(
        self, light_id: str, mode: str, enable_at: str = "fulltime"
    ) -> dict[str, Any]:
        """Set light mode."""
        _LOGGER.debug("Setting light %s mode to %s", light_id, mode)
        data = {
            "lightModeSettings": {
                "mode": mode,
                "enableAt": enable_at,
            }
        }
        return await self.async_update_light(light_id, data)

    async def async_set_light_level(self, light_id: str, level: int) -> dict[str, Any]:
        """Set light brightness level."""
        _LOGGER.debug("Setting light %s level to %s", light_id, level)
        data = {
            "lightDeviceSettings": {
                "ledLevel": level,
            }
        }
        return await self.async_update_light(light_id, data)

    async def async_set_camera_mic_volume(
        self, camera_id: str, volume: int
    ) -> dict[str, Any]:
        """Set camera microphone volume."""
        _LOGGER.debug("Setting camera %s mic volume to %s", camera_id, volume)
        data = {"micVolume": volume}
        return await self.async_update_camera(camera_id, data)

    async def async_set_camera_hdr_mode(
        self, camera_id: str, mode: str
    ) -> dict[str, Any]:
        """Set camera HDR mode."""
        _LOGGER.debug("Setting camera %s HDR mode to %s", camera_id, mode)
        data = {"hdrType": mode}
        return await self.async_update_camera(camera_id, data)

    async def async_set_camera_video_mode(
        self, camera_id: str, mode: str
    ) -> dict[str, Any]:
        """Set camera video mode."""
        _LOGGER.debug("Setting camera %s video mode to %s", camera_id, mode)
        data = {"videoMode": mode}
        return await self.async_update_camera(camera_id, data)

    async def async_start_websocket(self) -> None:
        """Start WebSocket connections."""
        _LOGGER.debug("Starting WebSocket connections")
        try:
            # Start device updates WebSocket
            try:
                await self._start_ws_devices()
            except Exception as err:
                _LOGGER.warning("Failed to start device WebSocket connection: %s", err)
                _LOGGER.info("Integration will continue to function without real-time device updates")

            # Start events WebSocket
            try:
                await self._start_ws_events()
            except Exception as err:
                _LOGGER.warning("Failed to start events WebSocket connection: %s", err)
                _LOGGER.info("Integration will continue to function without real-time event updates")

        except Exception as err:
            _LOGGER.warning("Failed to start WebSocket connections: %s", err)
            _LOGGER.info("Integration will continue to function without real-time updates")

    async def async_stop_websocket(self) -> None:
        """Stop WebSocket connections."""
        _LOGGER.debug("Stopping WebSocket connections")
        await self._stop_ws_devices()
        await self._stop_ws_events()

    def register_device_update_callback(
        self, callback: Callable[[str, Dict[str, Any]], None]
    ) -> None:
        """Register a callback for device updates."""
        _LOGGER.debug("Registering device update callback")
        self._device_update_callbacks.append(callback)

    def register_event_update_callback(
        self, callback: Callable[[str, Dict[str, Any]], None]
    ) -> None:
        """Register a callback for event updates."""
        _LOGGER.debug("Registering event update callback")
        self._event_update_callbacks.append(callback)

    def get_websocket_status(self) -> Dict[str, Any]:
        """Get WebSocket connection status information for the UI."""
        devices_stats = self._ws_devices_stats
        events_stats = self._ws_events_stats

        return {
            "devices": {
                "state": devices_stats.state,
                "last_connected": devices_stats.last_connected.isoformat() if devices_stats.last_connected else None,
                "last_disconnected": devices_stats.last_disconnected.isoformat() if devices_stats.last_disconnected else None,
                "connection_attempts": devices_stats.connection_attempts,
                "successful_connections": devices_stats.successful_connections,
                "failed_connections": devices_stats.failed_connections,
                "consecutive_errors": devices_stats.consecutive_errors,
                "last_error": devices_stats.last_error,
                "last_error_time": devices_stats.last_error_time.isoformat() if devices_stats.last_error_time else None,
                "messages_received": devices_stats.messages_received,
                "last_message_time": devices_stats.last_message_time.isoformat() if devices_stats.last_message_time else None,
                "last_heartbeat_time": devices_stats.last_heartbeat_time.isoformat() if devices_stats.last_heartbeat_time else None,
                "heartbeat_response_time": devices_stats.heartbeat_response_time,
            },
            "events": {
                "state": events_stats.state,
                "last_connected": events_stats.last_connected.isoformat() if events_stats.last_connected else None,
                "last_disconnected": events_stats.last_disconnected.isoformat() if events_stats.last_disconnected else None,
                "connection_attempts": events_stats.connection_attempts,
                "successful_connections": events_stats.successful_connections,
                "failed_connections": events_stats.failed_connections,
                "consecutive_errors": events_stats.consecutive_errors,
                "last_error": events_stats.last_error,
                "last_error_time": events_stats.last_error_time.isoformat() if events_stats.last_error_time else None,
                "messages_received": events_stats.messages_received,
                "last_message_time": events_stats.last_message_time.isoformat() if events_stats.last_message_time else None,
                "last_heartbeat_time": events_stats.last_heartbeat_time.isoformat() if events_stats.last_heartbeat_time else None,
                "heartbeat_response_time": events_stats.heartbeat_response_time,
            }
        }

    async def _start_ws_devices(self) -> None:
        """Start WebSocket connection for device updates."""
        if self._ws_devices_task is not None:
            _LOGGER.debug("WebSocket devices task already running")
            return

        _LOGGER.debug("Starting WebSocket devices task")
        self._ws_devices_stats.update_state(WS_STATE_CONNECTING)
        self._ws_devices_task = asyncio.create_task(
            self._ws_devices_listener()
        )

    async def _start_ws_events(self) -> None:
        """Start WebSocket connection for event updates."""
        if self._ws_events_task is not None:
            _LOGGER.debug("WebSocket events task already running")
            return

        _LOGGER.debug("Starting WebSocket events task")
        self._ws_events_stats.update_state(WS_STATE_CONNECTING)
        self._ws_events_task = asyncio.create_task(
            self._ws_events_listener()
        )

    async def _start_ws_devices_heartbeat(self) -> None:
        """Start heartbeat for devices WebSocket connection."""
        if self._ws_devices_heartbeat_task is not None:
            _LOGGER.debug("WebSocket devices heartbeat task already running")
            return

        _LOGGER.debug("Starting WebSocket devices heartbeat task")
        self._ws_devices_heartbeat_task = asyncio.create_task(
            self._ws_heartbeat_task(
                "devices",
                self._ws_devices,
                self._ws_devices_stats
            )
        )

    async def _start_ws_events_heartbeat(self) -> None:
        """Start heartbeat for events WebSocket connection."""
        if self._ws_events_heartbeat_task is not None:
            _LOGGER.debug("WebSocket events heartbeat task already running")
            return

        _LOGGER.debug("Starting WebSocket events heartbeat task")
        self._ws_events_heartbeat_task = asyncio.create_task(
            self._ws_heartbeat_task(
                "events",
                self._ws_events,
                self._ws_events_stats
            )
        )

    async def _ws_heartbeat_task(
        self,
        ws_type: str,
        ws: ClientWebSocketResponse,
        stats: WebSocketConnectionStats
    ) -> None:
        """Send periodic heartbeats to keep the connection alive."""
        try:
            while ws is not None and not ws.closed:
                try:
                    # Instead of using ping/pong which requires receive(),
                    # we'll just check the connection status periodically

                    # Record the current time
                    current_time = time.time()

                    # Check if we've received a message recently
                    if stats.last_message_time:
                        last_message_time = stats.last_message_time.timestamp()
                        time_since_last_message = current_time - last_message_time

                        if time_since_last_message < WS_HEARTBEAT_INTERVAL:
                            # We've received a message recently, connection is healthy
                            _LOGGER.debug(
                                "%s WebSocket connection is healthy (message received %.2f seconds ago)",
                                ws_type.capitalize(),
                                time_since_last_message
                            )
                            stats.record_heartbeat(time_since_last_message)
                        elif time_since_last_message > WS_HEARTBEAT_TIMEOUT:
                            # No message received for too long, connection might be dead
                            _LOGGER.debug(
                                "%s WebSocket connection may be dead (no message for %.2f seconds)",
                                ws_type.capitalize(),
                                time_since_last_message
                            )

                            # Try to send a ping to check connection
                            try:
                                # Send a proper WebSocket ping instead of JSON
                                await ws.ping()
                                _LOGGER.debug("%s WebSocket ping sent successfully", ws_type.capitalize())
                                stats.record_heartbeat(0.0)  # Record successful heartbeat
                            except Exception as err:
                                _LOGGER.debug(
                                    "%s WebSocket ping failed, closing connection: %s",
                                    ws_type.capitalize(),
                                    err
                                )
                                # Connection is likely dead, close it to trigger reconnection
                                await ws.close()
                                break
                    else:
                        # No message received yet, wait for initial messages
                        _LOGGER.debug(
                            "%s WebSocket waiting for initial messages",
                            ws_type.capitalize()
                        )

                except Exception as err:
                    _LOGGER.debug(
                        "Error in %s WebSocket heartbeat: %s",
                        ws_type,
                        err
                    )
                    # If we can't check the connection, it's likely dead
                    try:
                        await ws.close()
                    except Exception:
                        pass
                    break

                # Wait for next heartbeat interval
                await asyncio.sleep(WS_HEARTBEAT_INTERVAL)

        except asyncio.CancelledError:
            _LOGGER.debug("%s WebSocket heartbeat task cancelled", ws_type.capitalize())
        except Exception as err:
            _LOGGER.debug(
                "Unexpected error in %s WebSocket heartbeat task: %s",
                ws_type,
                err
            )
        finally:
            if ws_type == "devices":
                self._ws_devices_heartbeat_task = None
            else:
                self._ws_events_heartbeat_task = None

    async def _stop_ws_devices(self) -> None:
        """Stop WebSocket connection for device updates."""
        _LOGGER.debug("Stopping WebSocket devices connection")

        # Stop heartbeat task
        if self._ws_devices_heartbeat_task is not None:
            self._ws_devices_heartbeat_task.cancel()
            try:
                await self._ws_devices_heartbeat_task
            except asyncio.CancelledError:
                pass
            self._ws_devices_heartbeat_task = None

        # Stop main WebSocket task
        if self._ws_devices_task is not None:
            self._ws_devices_task.cancel()
            try:
                await self._ws_devices_task
            except asyncio.CancelledError:
                pass
            self._ws_devices_task = None

        # Close WebSocket connection
        if self._ws_devices is not None:
            await self._ws_devices.close()
            self._ws_devices = None

        # Update connection state
        self._ws_devices_stats.update_state(WS_STATE_DISCONNECTED)

    async def _stop_ws_events(self) -> None:
        """Stop WebSocket connection for event updates."""
        _LOGGER.debug("Stopping WebSocket events connection")

        # Stop heartbeat task
        if self._ws_events_heartbeat_task is not None:
            self._ws_events_heartbeat_task.cancel()
            try:
                await self._ws_events_heartbeat_task
            except asyncio.CancelledError:
                pass
            self._ws_events_heartbeat_task = None

        # Stop main WebSocket task
        if self._ws_events_task is not None:
            self._ws_events_task.cancel()
            try:
                await self._ws_events_task
            except asyncio.CancelledError:
                pass
            self._ws_events_task = None

        # Close WebSocket connection
        if self._ws_events is not None:
            await self._ws_events.close()
            self._ws_events = None

        # Update connection state
        self._ws_events_stats.update_state(WS_STATE_DISCONNECTED)

    async def _ws_devices_listener(self) -> None:
        """Listen for device updates on WebSocket."""
        stats = self._ws_devices_stats

        while True:
            try:
                # Update connection state and stats
                stats.update_state(WS_STATE_CONNECTING)
                stats.connection_attempts += 1

                # Calculate adaptive timeout
                connection_timeout = stats.calculate_adaptive_timeout()

                _LOGGER.debug(
                    "Connecting to WebSocket devices endpoint (attempt %d, timeout: %.1fs)",
                    stats.connection_attempts,
                    connection_timeout
                )

                headers = {
                    **UNIFI_API_HEADERS,
                    "X-API-Key": self._api_key,
                    "Connection": "Upgrade",
                    "Upgrade": "websocket",
                    "Sec-WebSocket-Version": "13",
                }

                url = f"{self._host}{API_PATH_WEBSOCKET_DEVICES}"
                _LOGGER.debug("WebSocket devices URL: %s", url)

                try:
                    async with async_timeout.timeout(connection_timeout):
                        async with self._session.ws_connect(
                            url,
                            headers=headers,
                            verify_ssl=self._verify_ssl,
                            heartbeat=None,  # We handle heartbeats ourselves
                            compress=0,  # Disable compression to reduce overhead
                            max_msg_size=0,  # No limit on message size
                            timeout=aiohttp.ClientTimeout(total=connection_timeout),
                            autoping=False,  # We handle pings ourselves
                        ) as ws:
                            self._ws_devices = ws

                            # Update connection state and stats
                            stats.update_state(WS_STATE_CONNECTED)
                            _LOGGER.info(
                                "Connected to WebSocket devices endpoint (after %d attempts)",
                                stats.connection_attempts
                            )

                            # Start heartbeat task
                            await self._start_ws_devices_heartbeat()

                            # Process any buffered messages
                            buffered_messages = stats.get_buffered_messages()
                            if buffered_messages:
                                _LOGGER.debug(
                                    "Processing %d buffered device messages",
                                    len(buffered_messages)
                                )
                                for message in buffered_messages:
                                    await self._process_device_message(message)

                            # Process incoming messages
                            async for msg in ws:
                                if msg.type == WSMsgType.TEXT:
                                    try:
                                        stats.record_message()
                                        data = msg.json()
                                        await self._process_device_message(data)
                                    except Exception as err:
                                        _LOGGER.debug(
                                            "Error processing WebSocket device message: %s", err
                                        )
                                elif msg.type == WSMsgType.ERROR:
                                    error = ws.exception() or "Unknown error"
                                    _LOGGER.debug(
                                        "WebSocket devices connection error: %s", error
                                    )
                                    stats.record_error(WS_ERROR_UNKNOWN)
                                    break
                                elif msg.type == WSMsgType.CLOSED:
                                    _LOGGER.debug("WebSocket devices connection closed normally")
                                    break
                                elif msg.type == WSMsgType.PING:
                                    # Respond to ping with pong
                                    await ws.pong(msg.data)
                                    _LOGGER.debug("Responded to WebSocket devices ping")

                except asyncio.TimeoutError as err:
                    # Connection timeout
                    _LOGGER.debug("WebSocket devices connection timeout: %s", err)
                    stats.record_error(WS_ERROR_TIMEOUT)

                except aiohttp.ClientResponseError as err:
                    # HTTP error response
                    if err.status in (401, 403):
                        _LOGGER.debug("WebSocket devices authentication error: %s", err)
                        stats.record_error(WS_ERROR_AUTHENTICATION)
                    elif err.status >= 500:
                        _LOGGER.debug("WebSocket devices server error: %s", err)
                        stats.record_error(WS_ERROR_SERVER)
                    else:
                        _LOGGER.debug("WebSocket devices client error: %s", err)
                        stats.record_error(WS_ERROR_NETWORK)

                except aiohttp.ClientError as err:
                    # Network or connection error
                    _LOGGER.debug("WebSocket devices network error: %s", err)
                    stats.record_error(WS_ERROR_NETWORK)

            except asyncio.CancelledError:
                _LOGGER.debug("WebSocket devices listener cancelled")
                break

            except Exception as err:
                # Unexpected error
                _LOGGER.debug(
                    "Unexpected error in WebSocket devices listener: %s",
                    err
                )
                stats.record_error(WS_ERROR_UNKNOWN)

            finally:
                # Clean up
                self._ws_devices = None

                # Stop heartbeat task if it's still running
                if self._ws_devices_heartbeat_task is not None:
                    self._ws_devices_heartbeat_task.cancel()
                    self._ws_devices_heartbeat_task = None

                # Update connection state
                if stats.state != WS_STATE_DISCONNECTED:
                    stats.update_state(WS_STATE_RECONNECTING)

            # Check if we should stop reconnection attempts
            if stats.consecutive_errors >= WS_MAX_CONSECUTIVE_ERRORS:
                _LOGGER.warning(
                    "Too many consecutive WebSocket devices errors (%s), stopping reconnection attempts",
                    stats.consecutive_errors
                )
                _LOGGER.info("Integration will continue to function without real-time device updates")
                stats.update_state(WS_STATE_FAILED)
                break

            # Calculate reconnect delay with exponential backoff and jitter
            delay = stats.calculate_reconnect_delay()
            _LOGGER.debug(
                "WebSocket devices connection failed, retrying in %.2f seconds (error: %s)",
                delay,
                stats.last_error
            )
            await asyncio.sleep(delay)

    async def _process_device_message(self, data: Dict[str, Any]) -> None:
        """Process a device message from the WebSocket."""
        if data.get("type") == "add" and "item" in data:
            item = data["item"]
            model_key = item.get("modelKey")
            item_id = item.get("id", "unknown")

            # Check if this is a device update we care about
            if model_key in WS_DEVICE_UPDATE_TYPES:
                _LOGGER.debug(
                    "Received device update for %s: %s",
                    model_key,
                    item_id
                )

                # Check for duplicate message
                message_id = f"{model_key}_{item_id}_{hash(str(item))}"
                if not self._ws_devices_stats.is_message_duplicate(message_id):
                    # Process the message with all registered callbacks
                    for callback in self._device_update_callbacks:
                        try:
                            callback(model_key, item)
                        except Exception as callback_err:
                            _LOGGER.debug(
                                "Error in device update callback: %s", callback_err
                            )

    async def _ws_events_listener(self) -> None:
        """Listen for event updates on WebSocket."""
        stats = self._ws_events_stats

        while True:
            try:
                # Update connection state and stats
                stats.update_state(WS_STATE_CONNECTING)
                stats.connection_attempts += 1

                # Calculate adaptive timeout
                connection_timeout = stats.calculate_adaptive_timeout()

                _LOGGER.debug(
                    "Connecting to WebSocket events endpoint (attempt %d, timeout: %.1fs)",
                    stats.connection_attempts,
                    connection_timeout
                )

                headers = {
                    **UNIFI_API_HEADERS,
                    "X-API-Key": self._api_key,
                    "Connection": "Upgrade",
                    "Upgrade": "websocket",
                    "Sec-WebSocket-Version": "13",
                }

                url = f"{self._host}{API_PATH_WEBSOCKET_EVENTS}"
                _LOGGER.debug("WebSocket events URL: %s", url)

                try:
                    async with async_timeout.timeout(connection_timeout):
                        async with self._session.ws_connect(
                            url,
                            headers=headers,
                            verify_ssl=self._verify_ssl,
                            heartbeat=None,  # We handle heartbeats ourselves
                            compress=0,  # Disable compression to reduce overhead
                            max_msg_size=0,  # No limit on message size
                            timeout=aiohttp.ClientTimeout(total=connection_timeout),
                            autoping=False,  # We handle pings ourselves
                        ) as ws:
                            self._ws_events = ws

                            # Update connection state and stats
                            stats.update_state(WS_STATE_CONNECTED)
                            _LOGGER.info(
                                "Connected to WebSocket events endpoint (after %d attempts)",
                                stats.connection_attempts
                            )

                            # Start heartbeat task
                            await self._start_ws_events_heartbeat()

                            # Process any buffered messages
                            buffered_messages = stats.get_buffered_messages()
                            if buffered_messages:
                                _LOGGER.debug(
                                    "Processing %d buffered event messages",
                                    len(buffered_messages)
                                )
                                for message in buffered_messages:
                                    await self._process_event_message(message)

                            # Process incoming messages
                            async for msg in ws:
                                if msg.type == WSMsgType.TEXT:
                                    try:
                                        stats.record_message()
                                        data = msg.json()
                                        await self._process_event_message(data)
                                    except Exception as err:
                                        _LOGGER.debug(
                                            "Error processing WebSocket event message: %s", err
                                        )
                                elif msg.type == WSMsgType.ERROR:
                                    error = ws.exception() or "Unknown error"
                                    _LOGGER.debug(
                                        "WebSocket events connection error: %s", error
                                    )
                                    stats.record_error(WS_ERROR_UNKNOWN)
                                    break
                                elif msg.type == WSMsgType.CLOSED:
                                    _LOGGER.debug("WebSocket events connection closed normally")
                                    break
                                elif msg.type == WSMsgType.PING:
                                    # Respond to ping with pong
                                    await ws.pong(msg.data)
                                    _LOGGER.debug("Responded to WebSocket events ping")

                except asyncio.TimeoutError as err:
                    # Connection timeout
                    _LOGGER.debug("WebSocket events connection timeout: %s", err)
                    stats.record_error(WS_ERROR_TIMEOUT)

                except aiohttp.ClientResponseError as err:
                    # HTTP error response
                    if err.status in (401, 403):
                        _LOGGER.debug("WebSocket events authentication error: %s", err)
                        stats.record_error(WS_ERROR_AUTHENTICATION)
                    elif err.status >= 500:
                        _LOGGER.debug("WebSocket events server error: %s", err)
                        stats.record_error(WS_ERROR_SERVER)
                    else:
                        _LOGGER.debug("WebSocket events client error: %s", err)
                        stats.record_error(WS_ERROR_NETWORK)

                except aiohttp.ClientError as err:
                    # Network or connection error
                    _LOGGER.debug("WebSocket events network error: %s", err)
                    stats.record_error(WS_ERROR_NETWORK)

            except asyncio.CancelledError:
                _LOGGER.debug("WebSocket events listener cancelled")
                break

            except Exception as err:
                # Unexpected error
                _LOGGER.debug(
                    "Unexpected error in WebSocket events listener: %s",
                    err
                )
                stats.record_error(WS_ERROR_UNKNOWN)

            finally:
                # Clean up
                self._ws_events = None

                # Stop heartbeat task if it's still running
                if self._ws_events_heartbeat_task is not None:
                    self._ws_events_heartbeat_task.cancel()
                    self._ws_events_heartbeat_task = None

                # Update connection state
                if stats.state != WS_STATE_DISCONNECTED:
                    stats.update_state(WS_STATE_RECONNECTING)

            # Check if we should stop reconnection attempts
            if stats.consecutive_errors >= WS_MAX_CONSECUTIVE_ERRORS:
                _LOGGER.warning(
                    "Too many consecutive WebSocket events errors (%s), stopping reconnection attempts",
                    stats.consecutive_errors
                )
                _LOGGER.info("Integration will continue to function without real-time event updates")
                stats.update_state(WS_STATE_FAILED)
                break

            # Calculate reconnect delay with exponential backoff and jitter
            delay = stats.calculate_reconnect_delay()
            _LOGGER.debug(
                "WebSocket events connection failed, retrying in %.2f seconds (error: %s)",
                delay,
                stats.last_error
            )
            await asyncio.sleep(delay)

    async def _process_event_message(self, data: Dict[str, Any]) -> None:
        """Process an event message from the WebSocket."""
        message_type = data.get("type")

        if message_type in ["add", "update"] and "item" in data:
            item = data["item"]
            event_type = item.get("type")
            item_id = item.get("id", "unknown")
            device_id = item.get("device", "unknown")

            # Check if this is an event update we care about
            if event_type in WS_EVENT_UPDATE_TYPES:
                # Log smart detection details if available
                smart_detect_types = item.get("smartDetectTypes", [])
                if smart_detect_types:
                    _LOGGER.info(
                        "Received %s event for %s (device: %s): %s with smart detection: %s",
                        message_type,
                        event_type,
                        device_id,
                        item_id,
                        smart_detect_types
                    )
                else:
                    _LOGGER.debug(
                        "Received %s event for %s (device: %s): %s",
                        message_type,
                        event_type,
                        device_id,
                        item_id
                    )

                # Check for duplicate message
                message_id = f"{event_type}_{item_id}_{hash(str(item))}"
                if not self._ws_events_stats.is_message_duplicate(message_id):
                    # Process the message with all registered callbacks
                    for callback in self._event_update_callbacks:
                        try:
                            callback(event_type, item)
                        except Exception as callback_err:
                            _LOGGER.debug(
                                "Error in event update callback: %s", callback_err
                            )