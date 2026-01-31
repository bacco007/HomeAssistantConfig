"""Data update coordinator for UniFi Insights."""

from __future__ import annotations

import asyncio
import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from unifi_official_api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)

from .const import (
    DEVICE_TYPE_CAMERA,
    DEVICE_TYPE_CHIME,
    DEVICE_TYPE_LIGHT,
    DEVICE_TYPE_NVR,
    DEVICE_TYPE_SENSOR,
    DEVICE_TYPE_VIEWER,
    DOMAIN,
    SCAN_INTERVAL_NORMAL,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class UnifiInsightsDataUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):  # type: ignore[misc]
    """Class to manage fetching UniFi Insights data."""

    config_entry: ConfigEntry

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None = None,
        entry: ConfigEntry = None,
    ) -> None:
        """Initialize the coordinator."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=SCAN_INTERVAL_NORMAL,
        )
        self.network_client = network_client
        self.protect_client = protect_client
        self.config_entry = entry
        self._available = True
        # Track previous device IDs for stale device cleanup (Gold requirement)
        self._previous_network_device_ids: set[str] = set()
        self._previous_protect_device_ids: dict[str, set[str]] = {
            "cameras": set(),
            "lights": set(),
            "sensors": set(),
            "nvrs": set(),
            "viewers": set(),
            "chimes": set(),
        }
        self.data: dict[str, Any] = {
            "sites": {},
            "devices": {},
            "clients": {},
            "stats": {},
            "network_info": {},
            "vouchers": {},
            "wifi": {},
            "protect": {
                "cameras": {},
                "lights": {},
                "sensors": {},
                "nvrs": {},
                "viewers": {},
                "chimes": {},
                "liveviews": {},
                "protect_info": {},
                "events": {},
            },
            "last_update": None,
        }

        # Register WebSocket callbacks if Protect API is available
        if self.protect_client:
            try:
                if hasattr(self.protect_client, "register_device_update_callback"):
                    self.protect_client.register_device_update_callback(
                        self._handle_device_update
                    )
                if hasattr(self.protect_client, "register_event_update_callback"):
                    self.protect_client.register_event_update_callback(
                        self._handle_event_update
                    )
            except Exception as err:  # noqa: BLE001
                _LOGGER.debug("WebSocket callbacks not supported: %s", err)

    def get_site(self, site_id: str) -> dict[str, Any] | None:
        """Get site data by site ID."""
        sites = self.data.get("sites", {})
        result = sites.get(site_id)
        return result if isinstance(result, dict) else None

    def _handle_device_update(
        self, model_key: str, device_data: dict[str, Any]
    ) -> None:
        """Handle device update from WebSocket."""
        device_id = device_data.get("id")
        if not device_id:
            return

        _LOGGER.debug("Handling device update for %s: %s", model_key, device_id)

        if model_key == DEVICE_TYPE_CAMERA:
            self.data["protect"]["cameras"][device_id] = device_data
        elif model_key == DEVICE_TYPE_LIGHT:
            self.data["protect"]["lights"][device_id] = device_data
        elif model_key == DEVICE_TYPE_SENSOR:
            self.data["protect"]["sensors"][device_id] = device_data
        elif model_key == DEVICE_TYPE_NVR:
            self.data["protect"]["nvrs"][device_id] = device_data
        elif model_key == DEVICE_TYPE_VIEWER:
            self.data["protect"]["viewers"][device_id] = device_data
        elif model_key == DEVICE_TYPE_CHIME:
            self.data["protect"]["chimes"][device_id] = device_data

        self.async_update_listeners()

    def _handle_event_update(self, event_type: str, event_data: dict[str, Any]) -> None:
        """Handle event update from WebSocket."""
        event_id = event_data.get("id")
        if not event_id:
            return

        _LOGGER.debug("Handling event update for %s: %s", event_type, event_id)

        # Store event data
        if event_type not in self.data["protect"]["events"]:
            self.data["protect"]["events"][event_type] = {}

        self.data["protect"]["events"][event_type][event_id] = event_data

        # Update device last event time if applicable
        device_id = event_data.get("device")
        if device_id:
            # Check if this is a camera motion event
            if event_type == "motion" and device_id in self.data["protect"]["cameras"]:
                # Store both start and end times for motion events
                self.data["protect"]["cameras"][device_id]["lastMotionStart"] = (
                    event_data.get("start")
                )
                self.data["protect"]["cameras"][device_id]["lastMotionEnd"] = (
                    event_data.get("end")
                )
                # Clear smart detect types for basic motion
                self.data["protect"]["cameras"][device_id]["lastSmartDetectTypes"] = []
                _LOGGER.info(
                    "Motion event for camera %s: start=%s, end=%s",
                    device_id,
                    event_data.get("start"),
                    event_data.get("end"),
                )

            # Check if this is a light motion event
            elif event_type == "motion" and device_id in self.data["protect"]["lights"]:
                self.data["protect"]["lights"][device_id]["lastMotionStart"] = (
                    event_data.get("start")
                )
                self.data["protect"]["lights"][device_id]["lastMotionEnd"] = (
                    event_data.get("end")
                )

            # Check if this is a smart detection event (per API documentation)
            elif (
                event_type == "smartDetectZone"
                and device_id in self.data["protect"]["cameras"]
            ):
                # Extract smart detection types from event data
                smart_detect_types = event_data.get("smartDetectTypes", [])
                event_start = event_data.get("start", 0)
                event_end = event_data.get("end")

                # Update camera with smart detection information
                self.data["protect"]["cameras"][device_id]["lastMotionStart"] = (
                    event_start
                )
                self.data["protect"]["cameras"][device_id]["lastMotionEnd"] = event_end
                self.data["protect"]["cameras"][device_id]["lastSmartDetectTypes"] = (
                    smart_detect_types
                )

                _LOGGER.info(
                    "Smart detection event for camera %s: %s (start=%s, end=%s)",
                    device_id,
                    smart_detect_types,
                    event_start,
                    event_end,
                )

            # Check if this is a doorbell ring event
            elif event_type == "ring" and device_id in self.data["protect"]["cameras"]:
                self.data["protect"]["cameras"][device_id]["lastRingStart"] = (
                    event_data.get("start")
                )
                self.data["protect"]["cameras"][device_id]["lastRingEnd"] = (
                    event_data.get("end")
                )
                _LOGGER.info(
                    "Doorbell ring for camera %s: start=%s, end=%s",
                    device_id,
                    event_data.get("start"),
                    event_data.get("end"),
                )

        self.async_update_listeners()

    def get_device(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device data by site ID and device ID."""
        devices = self.data.get("devices", {}).get(site_id, {})
        result = devices.get(device_id)
        return result if isinstance(result, dict) else None

    def get_device_stats(self, site_id: str, device_id: str) -> dict[str, Any] | None:
        """Get device statistics by site ID and device ID."""
        stats = self.data.get("stats", {}).get(site_id, {})
        result = stats.get(device_id)
        return result if isinstance(result, dict) else None

    def _model_to_dict(self, model: Any) -> dict[str, Any]:
        """
        Convert a model object to a dictionary.

        Handles both pydantic models (with model_dump) and objects with __dict__.
        Uses by_alias=True to get camelCase field names that match the
        original API format.
        """
        if model is None:
            return {}
        if isinstance(model, dict):
            return model
        if hasattr(model, "model_dump"):
            # Use by_alias=True to get camelCase field names matching the API response
            # This ensures compatibility with entity code expecting camelCase keys
            try:
                result = model.model_dump(by_alias=True, exclude_none=False)
                return result if isinstance(result, dict) else {}
            except TypeError:
                # Fall back to regular model_dump if by_alias not supported
                result = model.model_dump()
                return result if isinstance(result, dict) else {}
        if hasattr(model, "__dict__"):
            return {k: v for k, v in model.__dict__.items() if not k.startswith("_")}
        return {}

    async def _process_device(
        self, site_id: str, device_dict: dict[str, Any], clients: list[dict[str, Any]]
    ) -> tuple[str, dict[str, Any], dict[str, Any]]:
        """Process a single device and its stats."""
        device_id = device_dict.get("id")
        device_name = device_dict.get("name", device_id)

        try:
            # Get device statistics
            stats_model = await self.network_client.devices.get_statistics(
                site_id, device_id=device_id
            )
            stats = self._model_to_dict(stats_model) if stats_model else {}

            # Add client data to stats
            if stats:
                # Use camelCase uplinkDeviceId as returned by model_dump(by_alias=True)
                stats["clients"] = [
                    c
                    for c in clients
                    if (c.get("uplinkDeviceId") or c.get("uplink_device_id"))
                    == device_id
                ]
                stats["id"] = device_id

            return device_id, device_dict, stats  # noqa: TRY300

        except Exception as err:  # noqa: BLE001
            _LOGGER.debug(
                "Error getting stats for device %s (%s): %s",
                device_name,
                device_id,
                err,
            )
            return device_id, device_dict, {}

    async def _process_site(
        self, site_id: str
    ) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]] | None:
        """Process a single site's devices and clients."""
        try:
            # Get devices and clients in parallel using new API
            devices_task = self.network_client.devices.get_all(site_id)
            clients_task = self.network_client.clients.get_all(site_id)
            devices_models, clients_models = await asyncio.gather(
                devices_task, clients_task
            )

            # Convert model objects to dictionaries
            devices = [self._model_to_dict(d) for d in devices_models]
            clients = [self._model_to_dict(c) for c in clients_models]

            _LOGGER.debug(
                "Site %s: Found %d devices and %d clients",
                site_id,
                len(devices),
                len(clients),
            )

            # Log sample device keys for debugging data format issues
            if devices:
                sample_device = devices[0]
                _LOGGER.debug(
                    "Sample device keys for site %s: %s",
                    site_id,
                    list(sample_device.keys()),
                )
                _LOGGER.debug(
                    "Sample device data: id=%s, name=%s, model=%s, state/status=%s",
                    sample_device.get("id"),
                    sample_device.get("name"),
                    sample_device.get("model"),
                    sample_device.get("state") or sample_device.get("status"),
                )

            # Process devices in parallel (get stats)
            tasks = [
                self._process_device(site_id, device, clients) for device in devices
            ]
            results = await asyncio.gather(*tasks)

            # Organize results
            devices_dict = {}
            stats_dict = {}
            for device_id, device, stats in results:
                if device_id:
                    devices_dict[device_id] = device
                    stats_dict[device_id] = stats

            clients_dict = {
                client.get("id"): client for client in clients if client.get("id")
            }

            return devices_dict, stats_dict, clients_dict  # noqa: TRY300

        except Exception:
            _LOGGER.exception("Error processing site %s", site_id)
            return None

    async def _async_update_data(self) -> dict[str, Any]:  # noqa: C901, PLR0912, PLR0915
        """Fetch data from API."""
        try:
            # Get all sites first using new API
            sites_models = await self.network_client.sites.get_all()
            sites = [self._model_to_dict(s) for s in sites_models]
            self.data["sites"] = {
                site.get("id"): site for site in sites if site.get("id")
            }

            # Process all sites in parallel
            tasks = [self._process_site(site_id) for site_id in self.data["sites"]]
            results = await asyncio.gather(*tasks)

            # Update data structure with results
            for site_id, result in zip(self.data["sites"], results, strict=False):
                if result is not None:
                    devices_dict, stats_dict, clients_dict = result
                    self.data["devices"][site_id] = devices_dict
                    self.data["stats"][site_id] = stats_dict
                    self.data["clients"][site_id] = clients_dict

                    _LOGGER.debug(
                        "Successfully processed site %s with %d devices and %d clients",
                        site_id,
                        len(devices_dict),
                        len(clients_dict),
                    )

            # Fetch WiFi networks for each site
            for site_id in self.data["sites"]:
                try:
                    _LOGGER.debug("Fetching WiFi networks for site %s", site_id)
                    wifi_models = await self.network_client.wifi.get_all(site_id)
                    wifi_dict = {}
                    for wifi_model in wifi_models:
                        wifi = self._model_to_dict(wifi_model)
                        wifi_id = wifi.get("id")
                        if wifi_id:
                            wifi_dict[wifi_id] = wifi
                    self.data["wifi"][site_id] = wifi_dict
                    _LOGGER.debug(
                        "Successfully fetched %d WiFi networks for site %s",
                        len(wifi_dict),
                        site_id,
                    )
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning(
                        "Error fetching WiFi networks for site %s: %s", site_id, err
                    )
                    self.data["wifi"][site_id] = {}

            # Fetch Unifi Protect data if API is available
            if self.protect_client:
                try:
                    _LOGGER.debug("Fetching Unifi Protect data")

                    # Fetch cameras using new API
                    _LOGGER.debug("Fetching Unifi Protect cameras")
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

                            # Initialize last detection fields
                            camera["lastSmartDetectTypes"] = []
                            camera["lastMotion"] = 0
                            camera["lastRing"] = 0

                            self.data["protect"]["cameras"][camera_id] = camera

                            _LOGGER.debug(
                                "Camera %s supports smart detection types: %s",
                                camera.get("name", camera_id),
                                camera.get("smartDetectTypes", []),
                            )

                    # Fetch lights using new API
                    _LOGGER.debug("Fetching Unifi Protect lights")
                    lights_models = await self.protect_client.lights.get_all()
                    for light_model in lights_models:
                        light = self._model_to_dict(light_model)
                        light_id = light.get("id")
                        if light_id:
                            self.data["protect"]["lights"][light_id] = light

                    # Fetch sensors using new API
                    _LOGGER.debug("Fetching Unifi Protect sensors")
                    try:
                        sensors_models = await self.protect_client.sensors.get_all()
                        for sensor_model in sensors_models:
                            sensor = self._model_to_dict(sensor_model)
                            sensor_id = sensor.get("id")
                            if sensor_id:
                                self.data["protect"]["sensors"][sensor_id] = sensor
                        _LOGGER.debug(
                            "Successfully fetched %d sensors", len(sensors_models)
                        )
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.warning("Error fetching sensors: %s", err)

                    # Fetch NVR using new API
                    _LOGGER.debug("Fetching Unifi Protect NVR")
                    try:
                        nvr_model = await self.protect_client.nvr.get()
                        nvr = self._model_to_dict(nvr_model)
                        if nvr:
                            nvr_id = nvr.get("id")
                            if nvr_id:
                                self.data["protect"]["nvrs"][nvr_id] = nvr
                                _LOGGER.debug("Successfully fetched NVR: %s", nvr_id)
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.debug("Error fetching NVR: %s", err)

                    # Fetch chimes using new API
                    _LOGGER.debug("Fetching Unifi Protect chimes")
                    try:
                        chimes_models = await self.protect_client.chimes.get_all()
                        for chime_model in chimes_models:
                            chime = self._model_to_dict(chime_model)
                            chime_id = chime.get("id")
                            if chime_id:
                                self.data["protect"]["chimes"][chime_id] = chime
                        _LOGGER.debug(
                            "Successfully fetched %d chimes", len(chimes_models)
                        )
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.warning("Error fetching chimes: %s", err)

                    # Fetch viewers using new API (if available)
                    _LOGGER.debug("Fetching Unifi Protect viewers")
                    try:
                        if hasattr(self.protect_client, "viewers"):
                            viewers_models = await self.protect_client.viewers.get_all()
                            for viewer_model in viewers_models:
                                viewer = self._model_to_dict(viewer_model)
                                viewer_id = viewer.get("id")
                                if viewer_id:
                                    self.data["protect"]["viewers"][viewer_id] = viewer
                            _LOGGER.debug(
                                "Successfully fetched %d viewers", len(viewers_models)
                            )
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.debug("Error fetching viewers: %s", err)

                    # Fetch liveviews using new API (if available)
                    _LOGGER.debug("Fetching Unifi Protect liveviews")
                    try:
                        if hasattr(self.protect_client, "liveviews"):
                            liveviews_models = (
                                await self.protect_client.liveviews.get_all()
                            )
                            for liveview_model in liveviews_models:
                                liveview = self._model_to_dict(liveview_model)
                                liveview_id = liveview.get("id")
                                if liveview_id:
                                    self.data["protect"]["liveviews"][liveview_id] = (
                                        liveview
                                    )
                            _LOGGER.debug(
                                "Successfully fetched %d liveviews",
                                len(liveviews_models),
                            )
                    except Exception as err:  # noqa: BLE001
                        _LOGGER.debug("Error fetching liveviews: %s", err)

                    _LOGGER.debug(
                        "Successfully fetched Unifi Protect data: "
                        "%d cameras, %d lights, %d sensors, %d NVRs, "
                        "%d chimes, %d viewers, %d liveviews",
                        len(self.data["protect"]["cameras"]),
                        len(self.data["protect"]["lights"]),
                        len(self.data["protect"]["sensors"]),
                        len(self.data["protect"]["nvrs"]),
                        len(self.data["protect"]["chimes"]),
                        len(self.data["protect"]["viewers"]),
                        len(self.data["protect"]["liveviews"]),
                    )

                except Exception:
                    _LOGGER.exception("Error fetching Unifi Protect data")

            self._available = True
            self.data["last_update"] = datetime.now(tz=UTC)

            # Clean up stale devices (Gold requirement)
            self._cleanup_stale_devices()

            return self.data  # noqa: TRY300

        except UniFiAuthenticationError as err:
            self._available = False
            msg = f"Authentication failed: {err}"
            raise ConfigEntryAuthFailed(msg) from err
        except UniFiConnectionError as err:
            self._available = False
            msg = f"Error communicating with API: {err}"
            raise UpdateFailed(msg) from err
        except UniFiTimeoutError as err:
            self._available = False
            _LOGGER.warning("Timeout during update: %s", err)
            msg = f"Timeout: {err}"
            raise UpdateFailed(msg) from err
        except UniFiResponseError as err:
            self._available = False
            _LOGGER.exception("API error during update")
            msg = f"API error: {err}"
            raise UpdateFailed(msg) from err
        except Exception as err:
            self._available = False
            _LOGGER.exception("Unexpected error updating data")
            msg = f"Error updating data: {err}"
            raise UpdateFailed(msg) from err

    @property
    def available(self) -> bool:
        """Return coordinator availability."""
        return self._available

    def _cleanup_stale_devices(self) -> None:
        """Remove stale devices from the device registry (Gold requirement)."""
        device_registry = dr.async_get(self.hass)

        # Collect current network device IDs
        current_network_device_ids: set[str] = set()
        for site_id, devices in self.data.get("devices", {}).items():
            for device_id in devices:
                current_network_device_ids.add(f"{site_id}_{device_id}")

        # Find and remove stale network devices
        stale_network_ids = (
            self._previous_network_device_ids - current_network_device_ids
        )
        for device_identifier in stale_network_ids:
            device = device_registry.async_get_device(
                identifiers={(DOMAIN, device_identifier)}
            )
            if device:
                _LOGGER.info(
                    "Removing stale network device from registry: %s",
                    device_identifier,
                )
                device_registry.async_update_device(
                    device_id=device.id,
                    remove_config_entry_id=self.config_entry.entry_id,
                )

        self._previous_network_device_ids = current_network_device_ids

        # Collect current Protect device IDs and cleanup stale ones
        if self.protect_client:
            for device_type in [
                "cameras",
                "lights",
                "sensors",
                "nvrs",
                "viewers",
                "chimes",
            ]:
                current_ids: set[str] = set(
                    self.data.get("protect", {}).get(device_type, {}).keys()
                )
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
                                "Removing stale %s device from registry: %s",
                                device_type,
                                device_id,
                            )
                            device_registry.async_update_device(
                                device_id=device.id,
                                remove_config_entry_id=self.config_entry.entry_id,
                            )
                            break

                self._previous_protect_device_ids[device_type] = current_ids
