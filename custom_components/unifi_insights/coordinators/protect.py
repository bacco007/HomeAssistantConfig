"""Protect coordinator for UniFi Insights - handles Protect device data."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.helpers import device_registry as dr
from unifi_official_api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)

from custom_components.unifi_insights.const import (
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_SENSOR,
    DEVICE_TYPE_VIEWER,
    DOMAIN,
    SCAN_INTERVAL_PROTECT,
)

from .base import UnifiBaseCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class UnifiProtectCoordinator(UnifiBaseCoordinator):
    """
    Coordinator for UniFi Protect device data (30 second updates + WebSocket).

    Handles:
    - Cameras (with streaming support)
    - Lights
    - Sensors
    - NVR
    - Viewers
    - Chimes
    - Liveviews
    - Real-time events via WebSocket
    """

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the Protect coordinator."""
        super().__init__(
            hass=hass,
            network_client=network_client,
            protect_client=protect_client,
            entry=entry,
            name="protect",
            update_interval=SCAN_INTERVAL_PROTECT,
        )
        # Track previous device IDs for stale device cleanup (Gold requirement)
        self._previous_protect_device_ids: dict[str, set[str]] = {
            "cameras": set(),
            "lights": set(),
            "sensors": set(),
            "nvrs": set(),
            "viewers": set(),
            "chimes": set(),
        }
        self.data: dict[str, Any] = {
            "cameras": {},
            "lights": {},
            "sensors": {},
            "nvrs": {},
            "viewers": {},
            "chimes": {},
            "liveviews": {},
            "protect_info": {},
            "events": {},
            "last_update": None,
        }

        # Register WebSocket callbacks if Protect API is available
        if self.protect_client:
            self._setup_websocket_callbacks()

    def _setup_websocket_callbacks(self) -> None:
        """Set up WebSocket callbacks for real-time updates."""
        if not self.protect_client:
            return

        try:
            if hasattr(self.protect_client, "register_device_update_callback"):
                self.protect_client.register_device_update_callback(
                    self._handle_device_update
                )
            if hasattr(self.protect_client, "register_event_update_callback"):
                self.protect_client.register_event_update_callback(
                    self._handle_event_update
                )
            _LOGGER.debug("Protect coordinator: WebSocket callbacks registered")
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug(
                "Protect coordinator: WebSocket callbacks not supported: %s", err
            )

    def _handle_device_update(
        self, model_key: str, device_data: dict[str, Any]
    ) -> None:
        """Handle device update from WebSocket."""
        device_id = device_data.get("id")
        if not device_id:
            return

        _LOGGER.debug(
            "Protect coordinator: WebSocket device update for %s: %s",
            model_key,
            device_id,
        )

        if model_key == DEVICE_TYPE_CAMERA:
            self.data["cameras"][device_id] = device_data
        elif model_key == DEVICE_TYPE_LIGHT:
            self.data["lights"][device_id] = device_data
        elif model_key == DEVICE_TYPE_SENSOR:
            self.data["sensors"][device_id] = device_data
        elif model_key == DEVICE_TYPE_NVR:
            self.data["nvrs"][device_id] = device_data
        elif model_key == DEVICE_TYPE_VIEWER:
            self.data["viewers"][device_id] = device_data
        elif model_key == DEVICE_TYPE_CHIME:
            self.data["chimes"][device_id] = device_data

        self.async_update_listeners()

    def _handle_event_update(self, event_type: str, event_data: dict[str, Any]) -> None:
        """Handle event update from WebSocket."""
        event_id = event_data.get("id")
        if not event_id:
            return

        _LOGGER.debug(
            "Protect coordinator: WebSocket event update for %s: %s",
            event_type,
            event_id,
        )

        # Store event data
        if event_type not in self.data["events"]:
            self.data["events"][event_type] = {}

        self.data["events"][event_type][event_id] = event_data

        # Update device last event time if applicable
        device_id = event_data.get("device")
        if device_id:
            self._process_event_for_device(event_type, event_data, device_id)

        self.async_update_listeners()

    def _process_event_for_device(
        self, event_type: str, event_data: dict[str, Any], device_id: str
    ) -> None:
        """Process event data and update relevant device."""
        # Check if this is a camera motion event
        if event_type == "motion" and device_id in self.data["cameras"]:
            self.data["cameras"][device_id]["lastMotionStart"] = event_data.get("start")
            self.data["cameras"][device_id]["lastMotionEnd"] = event_data.get("end")
            self.data["cameras"][device_id]["lastSmartDetectTypes"] = []
            _LOGGER.info(
                "Protect coordinator: Motion event for camera %s: start=%s, end=%s",
                device_id,
                event_data.get("start"),
                event_data.get("end"),
            )

        # Check if this is a light motion event
        elif event_type == "motion" and device_id in self.data["lights"]:
            self.data["lights"][device_id]["lastMotionStart"] = event_data.get("start")
            self.data["lights"][device_id]["lastMotionEnd"] = event_data.get("end")

        # Check if this is a smart detection event
        elif event_type == "smartDetectZone" and device_id in self.data["cameras"]:
            smart_detect_types = event_data.get("smartDetectTypes", [])
            event_start = event_data.get("start", 0)
            event_end = event_data.get("end")

            self.data["cameras"][device_id]["lastMotionStart"] = event_start
            self.data["cameras"][device_id]["lastMotionEnd"] = event_end
            self.data["cameras"][device_id]["lastSmartDetectTypes"] = smart_detect_types

            _LOGGER.info(
                "Protect coordinator: Smart detection for camera %s: %s "
                "(start=%s, end=%s)",
                device_id,
                smart_detect_types,
                event_start,
                event_end,
            )

        # Check if this is a doorbell ring event
        elif event_type == "ring" and device_id in self.data["cameras"]:
            self.data["cameras"][device_id]["lastRingStart"] = event_data.get("start")
            self.data["cameras"][device_id]["lastRingEnd"] = event_data.get("end")
            _LOGGER.info(
                "Protect coordinator: Doorbell ring for camera %s: start=%s, end=%s",
                device_id,
                event_data.get("start"),
                event_data.get("end"),
            )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch Protect data from API."""
        if not self.protect_client:
            _LOGGER.debug("Protect coordinator: No Protect client available")
            return self.data

        try:
            _LOGGER.debug("Protect coordinator: Fetching Protect data")

            # Fetch cameras
            await self._fetch_cameras()

            # Fetch lights
            await self._fetch_lights()

            # Fetch sensors
            await self._fetch_sensors()

            # Fetch NVR
            await self._fetch_nvr()

            # Fetch chimes
            await self._fetch_chimes()

            # Fetch viewers
            await self._fetch_viewers()

            # Fetch liveviews
            await self._fetch_liveviews()

            self._available = True
            self.data["last_update"] = datetime.now(tz=UTC)

            # Clean up stale devices (Gold requirement)
            self._cleanup_stale_devices()

            _LOGGER.debug(
                "Protect coordinator: Update complete - "
                "%d cameras, %d lights, %d sensors, %d NVRs, "
                "%d chimes, %d viewers, %d liveviews",
                len(self.data["cameras"]),
                len(self.data["lights"]),
                len(self.data["sensors"]),
                len(self.data["nvrs"]),
                len(self.data["chimes"]),
                len(self.data["viewers"]),
                len(self.data["liveviews"]),
            )

            return self.data  # noqa: TRY300

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:  # noqa: BLE001
            self._handle_generic_error(err)

        # Should never reach here due to raises above
        return self.data  # pragma: no cover

    async def _fetch_cameras(self) -> None:
        """Fetch camera data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching cameras")
        cameras_models = await self.protect_client.cameras.get_all()
        for camera_model in cameras_models:
            camera = self._model_to_dict(camera_model)
            camera_id = camera.get("id")
            if camera_id:
                # Extract smartDetectTypes from featureFlags
                feature_flags = camera.get("feature_flags", {})
                if isinstance(feature_flags, dict):
                    camera["smartDetectTypes"] = feature_flags.get(
                        "smart_detect_types", []
                    )
                else:
                    camera["smartDetectTypes"] = []

                # Initialize last detection fields (preserve existing if present)
                if "lastSmartDetectTypes" not in camera:
                    camera["lastSmartDetectTypes"] = []
                if "lastMotion" not in camera:
                    camera["lastMotion"] = 0
                if "lastRing" not in camera:
                    camera["lastRing"] = 0

                self.data["cameras"][camera_id] = camera

                _LOGGER.debug(
                    "Protect coordinator: Camera %s supports smart detection: %s",
                    camera.get("name", camera_id),
                    camera.get("smartDetectTypes", []),
                )

    async def _fetch_lights(self) -> None:
        """Fetch light data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching lights")
        lights_models = await self.protect_client.lights.get_all()
        for light_model in lights_models:
            light = self._model_to_dict(light_model)
            light_id = light.get("id")
            if light_id:
                self.data["lights"][light_id] = light

    async def _fetch_sensors(self) -> None:
        """Fetch sensor data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching sensors")
        try:
            sensors_models = await self.protect_client.sensors.get_all()
            for sensor_model in sensors_models:
                sensor = self._model_to_dict(sensor_model)
                sensor_id = sensor.get("id")
                if sensor_id:
                    self.data["sensors"][sensor_id] = sensor
            _LOGGER.debug(
                "Protect coordinator: Successfully fetched %d sensors",
                len(sensors_models),
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Protect coordinator: Error fetching sensors: %s", err)

    async def _fetch_nvr(self) -> None:
        """Fetch NVR data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching NVR")
        try:
            nvr_model = await self.protect_client.nvr.get()
            nvr = self._model_to_dict(nvr_model)
            if nvr:
                nvr_id = nvr.get("id")
                if nvr_id:
                    self.data["nvrs"][nvr_id] = nvr
                    _LOGGER.debug(
                        "Protect coordinator: Successfully fetched NVR: %s", nvr_id
                    )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Protect coordinator: Error fetching NVR: %s", err)

    async def _fetch_chimes(self) -> None:
        """Fetch chime data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching chimes")
        try:
            chimes_models = await self.protect_client.chimes.get_all()
            for chime_model in chimes_models:
                chime = self._model_to_dict(chime_model)
                chime_id = chime.get("id")
                if chime_id:
                    self.data["chimes"][chime_id] = chime
            _LOGGER.debug(
                "Protect coordinator: Successfully fetched %d chimes",
                len(chimes_models),
            )
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Protect coordinator: Error fetching chimes: %s", err)

    async def _fetch_viewers(self) -> None:
        """Fetch viewer data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching viewers")
        try:
            if hasattr(self.protect_client, "viewers"):
                viewers_models = await self.protect_client.viewers.get_all()
                for viewer_model in viewers_models:
                    viewer = self._model_to_dict(viewer_model)
                    viewer_id = viewer.get("id")
                    if viewer_id:
                        self.data["viewers"][viewer_id] = viewer
                _LOGGER.debug(
                    "Protect coordinator: Successfully fetched %d viewers",
                    len(viewers_models),
                )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Protect coordinator: Error fetching viewers: %s", err)

    async def _fetch_liveviews(self) -> None:
        """Fetch liveview data."""
        if not self.protect_client:
            return

        _LOGGER.debug("Protect coordinator: Fetching liveviews")
        try:
            if hasattr(self.protect_client, "liveviews"):
                liveviews_models = await self.protect_client.liveviews.get_all()
                for liveview_model in liveviews_models:
                    liveview = self._model_to_dict(liveview_model)
                    liveview_id = liveview.get("id")
                    if liveview_id:
                        self.data["liveviews"][liveview_id] = liveview
                _LOGGER.debug(
                    "Protect coordinator: Successfully fetched %d liveviews",
                    len(liveviews_models),
                )
        except Exception as err:  # noqa: BLE001
            _LOGGER.debug("Protect coordinator: Error fetching liveviews: %s", err)

    def _cleanup_stale_devices(self) -> None:
        """Remove stale Protect devices from the device registry (Gold requirement)."""
        device_registry = dr.async_get(self.hass)

        for device_type in [
            "cameras",
            "lights",
            "sensors",
            "nvrs",
            "viewers",
            "chimes",
        ]:
            current_ids: set[str] = set(self.data.get(device_type, {}).keys())
            previous_ids = self._previous_protect_device_ids.get(device_type, set())

            stale_ids = previous_ids - current_ids
            for device_id in stale_ids:
                # Try both identifier patterns (with and without "protect_" prefix)
                for identifier in [
                    f"protect_{device_type[:-1]}_{device_id}",  # protect_camera_xyz
                    device_id,  # Just the device ID
                ]:
                    device = device_registry.async_get_device(
                        identifiers={(DOMAIN, identifier)}
                    )
                    if device:
                        _LOGGER.info(
                            "Protect coordinator: Removing stale %s device: %s",
                            device_type,
                            device_id,
                        )
                        device_registry.async_update_device(
                            device_id=device.id,
                            remove_config_entry_id=self.config_entry.entry_id,
                        )
                        break

            self._previous_protect_device_ids[device_type] = current_ids

    def get_camera(self, camera_id: str) -> dict[str, Any] | None:
        """Get camera data by ID."""
        result = self.data.get("cameras", {}).get(camera_id)
        return result if isinstance(result, dict) else None

    def get_light(self, light_id: str) -> dict[str, Any] | None:
        """Get light data by ID."""
        result = self.data.get("lights", {}).get(light_id)
        return result if isinstance(result, dict) else None

    def get_sensor(self, sensor_id: str) -> dict[str, Any] | None:
        """Get sensor data by ID."""
        result = self.data.get("sensors", {}).get(sensor_id)
        return result if isinstance(result, dict) else None

    def get_nvr(self, nvr_id: str) -> dict[str, Any] | None:
        """Get NVR data by ID."""
        result = self.data.get("nvrs", {}).get(nvr_id)
        return result if isinstance(result, dict) else None
