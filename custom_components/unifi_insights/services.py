"""Services for the UniFi Insights integration."""
from __future__ import annotations

import logging


import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import (
    CHIME_RINGTONE_DEFAULT,
    CHIME_RINGTONE_MECHANICAL,
    CHIME_RINGTONE_DIGITAL,
    CHIME_RINGTONE_CHRISTMAS,
    CHIME_RINGTONE_TRADITIONAL,
    CHIME_RINGTONE_CUSTOM_1,
    CHIME_RINGTONE_CUSTOM_2,
    DOMAIN,
    SERVICE_SET_RECORDING_MODE,
    SERVICE_SET_HDR_MODE,
    SERVICE_SET_VIDEO_MODE,
    SERVICE_SET_MIC_VOLUME,
    SERVICE_SET_LIGHT_MODE,
    SERVICE_SET_LIGHT_LEVEL,
    SERVICE_SET_CHIME_VOLUME,
    SERVICE_PLAY_CHIME_RINGTONE,
    SERVICE_SET_CHIME_RINGTONE,
    SERVICE_SET_CHIME_REPEAT_TIMES,
    SERVICE_PTZ_MOVE,
    SERVICE_PTZ_PATROL,
    HDR_MODE_AUTO,
    HDR_MODE_ON,
    HDR_MODE_OFF,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
    VIDEO_MODE_SPORT,
    VIDEO_MODE_SLOW_SHUTTER,
    LIGHT_MODE_ALWAYS,
    LIGHT_MODE_MOTION,
    LIGHT_MODE_OFF,
)
from .coordinator import UnifiInsightsDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

SERVICE_REFRESH_DATA = "refresh_data"
SERVICE_RESTART_DEVICE = "restart_device"

# Schema for refresh_data service
REFRESH_DATA_SCHEMA = vol.Schema({
    vol.Optional("site_id"): cv.string,
})

# Schema for restart_device service
RESTART_DEVICE_SCHEMA = vol.Schema({
    vol.Required("site_id"): cv.string,
    vol.Required("device_id"): cv.string,
})

# Schema for set_recording_mode service
SET_RECORDING_MODE_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("mode"): cv.string,
})

# Schema for set_hdr_mode service
SET_HDR_MODE_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("mode"): vol.In([HDR_MODE_AUTO, HDR_MODE_ON, HDR_MODE_OFF]),
})

# Schema for set_video_mode service
SET_VIDEO_MODE_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("mode"): vol.In([
        VIDEO_MODE_DEFAULT,
        VIDEO_MODE_HIGH_FPS,
        VIDEO_MODE_SPORT,
        VIDEO_MODE_SLOW_SHUTTER,
    ]),
})

# Schema for set_mic_volume service
SET_MIC_VOLUME_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("volume"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
})

# Schema for set_light_mode service
SET_LIGHT_MODE_SCHEMA = vol.Schema({
    vol.Required("light_id"): cv.string,
    vol.Required("mode"): vol.In([
        LIGHT_MODE_ALWAYS,
        LIGHT_MODE_MOTION,
        LIGHT_MODE_OFF,
    ]),
})

# Schema for set_light_level service
SET_LIGHT_LEVEL_SCHEMA = vol.Schema({
    vol.Required("light_id"): cv.string,
    vol.Required("level"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
})

# Schema for ptz_move service
PTZ_MOVE_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("preset"): vol.All(vol.Coerce(int), vol.Range(min=0, max=15)),
})



# Schema for ptz_patrol service
PTZ_PATROL_SCHEMA = vol.Schema({
    vol.Required("camera_id"): cv.string,
    vol.Required("action"): vol.In(["start", "stop"]),
    vol.Optional("slot", default=0): vol.All(
        vol.Coerce(int), vol.Range(min=0, max=15)
    ),
})

# Schema for set_chime_volume service
SET_CHIME_VOLUME_SCHEMA = vol.Schema({
    vol.Required("chime_id"): cv.string,
    vol.Required("volume"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
    vol.Optional("camera_id"): cv.string,
})

# Schema for play_chime_ringtone service
PLAY_CHIME_RINGTONE_SCHEMA = vol.Schema({
    vol.Required("chime_id"): cv.string,
    vol.Optional("ringtone_id"): vol.In([
        CHIME_RINGTONE_DEFAULT,
        CHIME_RINGTONE_MECHANICAL,
        CHIME_RINGTONE_DIGITAL,
        CHIME_RINGTONE_CHRISTMAS,
        CHIME_RINGTONE_TRADITIONAL,
        CHIME_RINGTONE_CUSTOM_1,
        CHIME_RINGTONE_CUSTOM_2,
    ]),
})

# Schema for set_chime_ringtone service
SET_CHIME_RINGTONE_SCHEMA = vol.Schema({
    vol.Required("chime_id"): cv.string,
    vol.Required("ringtone_id"): vol.In([
        CHIME_RINGTONE_DEFAULT,
        CHIME_RINGTONE_MECHANICAL,
        CHIME_RINGTONE_DIGITAL,
        CHIME_RINGTONE_CHRISTMAS,
        CHIME_RINGTONE_TRADITIONAL,
        CHIME_RINGTONE_CUSTOM_1,
        CHIME_RINGTONE_CUSTOM_2,
    ]),
    vol.Optional("camera_id"): cv.string,
})

# Schema for set_chime_repeat_times service
SET_CHIME_REPEAT_TIMES_SCHEMA = vol.Schema({
    vol.Required("chime_id"): cv.string,
    vol.Required("repeat_times"): vol.All(vol.Coerce(int), vol.Range(min=1, max=10)),
    vol.Optional("camera_id"): cv.string,
})

async def async_setup_services(hass: HomeAssistant) -> None:
    """Set up the UniFi Insights services."""
    _LOGGER.debug("Setting up UniFi Insights services")

    async def async_handle_refresh_data(call: ServiceCall) -> None:
        """Handle the refresh data service call."""
        _LOGGER.debug("Handling refresh_data service call with data: %s", call.data)

        site_id = call.data.get("site_id")

        if not hass.data.get(DOMAIN):
            _LOGGER.error("No UniFi Insights integration configured")
            raise HomeAssistantError("No UniFi Insights integration configured")

        # Get all coordinators
        coordinators: list[UnifiInsightsDataUpdateCoordinator] = [
            coordinator for coordinator in hass.data[DOMAIN].values()
            if isinstance(coordinator, UnifiInsightsDataUpdateCoordinator)
        ]

        if not coordinators:
            _LOGGER.error("No UniFi Insights coordinators found")
            raise HomeAssistantError("No UniFi Insights coordinators found")

        _LOGGER.info(
            "Refreshing data for %s site%s",
            "specific" if site_id else "all",
            f" (ID: {site_id})" if site_id else "s"
        )

        for coordinator in coordinators:
            try:
                # If site_id is specified, only refresh that site
                if site_id and site_id not in coordinator.data["sites"]:
                    _LOGGER.debug("Skipping coordinator - site %s not found", site_id)
                    continue

                _LOGGER.debug("Requesting coordinator refresh")
                await coordinator.async_refresh()
                _LOGGER.info("Successfully refreshed coordinator data")

            except Exception as err:
                _LOGGER.error("Error refreshing coordinator data: %s", err)
                raise HomeAssistantError(f"Error refreshing data: {err}") from err

    async def async_handle_restart_device(call: ServiceCall) -> None:
        """Handle the restart device service call."""
        _LOGGER.debug("Handling restart_device service call with data: %s", call.data)

        site_id = call.data["site_id"]
        device_id = call.data["device_id"]

        if not hass.data.get(DOMAIN):
            _LOGGER.error("No UniFi Insights integration configured")
            raise HomeAssistantError("No UniFi Insights integration configured")

        # Get first coordinator (we only need one to restart a device)
        coordinator = next(iter(hass.data[DOMAIN].values()), None)

        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            raise HomeAssistantError("No UniFi Insights coordinator found")

        _LOGGER.info(
            "Attempting to restart device %s in site %s",
            device_id,
            site_id
        )

        try:
            success = await coordinator.api.async_restart_device(site_id, device_id)
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    device_id,
                    site_id
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s",
                    device_id,
                    site_id
                )
                raise HomeAssistantError(f"Failed to restart device {device_id}")

        except Exception as err:
            _LOGGER.error(
                "Error restarting device %s in site %s: %s",
                device_id,
                site_id,
                err
            )
            raise HomeAssistantError(f"Error restarting device: {err}") from err

    # Define Unifi Protect service handlers
    async def async_handle_set_recording_mode(call: ServiceCall) -> None:
        """Handle the set_recording_mode service call."""
        _LOGGER.debug("Handling set_recording_mode service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_update_camera(
                camera_id=camera_id,
                data={"recordingSettings": {"mode": mode}},
            )
            _LOGGER.info("Successfully set recording mode to %s for camera %s", mode, camera_id)
        except Exception as err:
            _LOGGER.error("Error setting recording mode: %s", err)
            raise HomeAssistantError(f"Error setting recording mode: {err}") from err

    async def async_handle_set_hdr_mode(call: ServiceCall) -> None:
        """Handle the set_hdr_mode service call."""
        _LOGGER.debug("Handling set_hdr_mode service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_camera_hdr_mode(
                camera_id=camera_id,
                mode=mode,
            )
            _LOGGER.info("Successfully set HDR mode to %s for camera %s", mode, camera_id)
        except Exception as err:
            _LOGGER.error("Error setting HDR mode: %s", err)
            raise HomeAssistantError(f"Error setting HDR mode: {err}") from err

    async def async_handle_set_video_mode(call: ServiceCall) -> None:
        """Handle the set_video_mode service call."""
        _LOGGER.debug("Handling set_video_mode service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_camera_video_mode(
                camera_id=camera_id,
                mode=mode,
            )
            _LOGGER.info("Successfully set video mode to %s for camera %s", mode, camera_id)
        except Exception as err:
            _LOGGER.error("Error setting video mode: %s", err)
            raise HomeAssistantError(f"Error setting video mode: {err}") from err

    async def async_handle_set_mic_volume(call: ServiceCall) -> None:
        """Handle the set_mic_volume service call."""
        _LOGGER.debug("Handling set_mic_volume service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        volume = call.data["volume"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_camera_mic_volume(
                camera_id=camera_id,
                volume=volume,
            )
            _LOGGER.info("Successfully set mic volume to %s for camera %s", volume, camera_id)
        except Exception as err:
            _LOGGER.error("Error setting mic volume: %s", err)
            raise HomeAssistantError(f"Error setting mic volume: {err}") from err

    # Register services
    _LOGGER.debug("Registering UniFi Insights services")
    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH_DATA,
        async_handle_refresh_data,
        schema=REFRESH_DATA_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_RESTART_DEVICE,
        async_handle_restart_device,
        schema=RESTART_DEVICE_SCHEMA,
    )

    # Register Unifi Protect services
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_RECORDING_MODE,
        async_handle_set_recording_mode,
        schema=SET_RECORDING_MODE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_HDR_MODE,
        async_handle_set_hdr_mode,
        schema=SET_HDR_MODE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_VIDEO_MODE,
        async_handle_set_video_mode,
        schema=SET_VIDEO_MODE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_MIC_VOLUME,
        async_handle_set_mic_volume,
        schema=SET_MIC_VOLUME_SCHEMA,
    )

    # Define light service handlers
    async def async_handle_set_light_mode(call: ServiceCall) -> None:
        """Handle the set_light_mode service call."""
        _LOGGER.debug("Handling set_light_mode service call with data: %s", call.data)

        light_id = call.data["light_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_light_mode(
                light_id=light_id,
                mode=mode,
            )
            _LOGGER.info("Successfully set light mode to %s for light %s", mode, light_id)
        except Exception as err:
            _LOGGER.error("Error setting light mode: %s", err)
            raise HomeAssistantError(f"Error setting light mode: {err}") from err

    async def async_handle_set_light_level(call: ServiceCall) -> None:
        """Handle the set_light_level service call."""
        _LOGGER.debug("Handling set_light_level service call with data: %s", call.data)

        light_id = call.data["light_id"]
        level = call.data["level"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_light_level(
                light_id=light_id,
                level=level,
            )
            _LOGGER.info("Successfully set light level to %s for light %s", level, light_id)
        except Exception as err:
            _LOGGER.error("Error setting light level: %s", err)
            raise HomeAssistantError(f"Error setting light level: {err}") from err

    # Define PTZ service handlers
    async def async_handle_ptz_move(call: ServiceCall) -> None:
        """Handle the ptz_move service call."""
        _LOGGER.debug("Handling ptz_move service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        preset = call.data["preset"]

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_ptz_move(
                camera_id=camera_id,
                preset=preset,
            )
            _LOGGER.info("Successfully moved PTZ camera %s to preset %s", camera_id, preset)
        except Exception as err:
            _LOGGER.error("Error moving PTZ camera: %s", err)
            raise HomeAssistantError(f"Error moving PTZ camera: {err}") from err

    async def async_handle_ptz_patrol(call: ServiceCall) -> None:
        """Handle the ptz_patrol service call."""
        _LOGGER.debug("Handling ptz_patrol service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        action = call.data["action"]
        slot = call.data.get("slot", 0)

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            if action == "start":
                await coordinator.protect_api.async_ptz_patrol_start(
                    camera_id=camera_id,
                    slot=slot,
                )
                _LOGGER.info("Successfully started PTZ patrol for camera %s on slot %s", camera_id, slot)
            else:
                await coordinator.protect_api.async_ptz_patrol_stop(
                    camera_id=camera_id,
                )
                _LOGGER.info("Successfully stopped PTZ patrol for camera %s", camera_id)
        except Exception as err:
            _LOGGER.error("Error controlling PTZ patrol: %s", err)
            raise HomeAssistantError(f"Error controlling PTZ patrol: {err}") from err

    # Register light services
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_LIGHT_MODE,
        async_handle_set_light_mode,
        schema=SET_LIGHT_MODE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_LIGHT_LEVEL,
        async_handle_set_light_level,
        schema=SET_LIGHT_LEVEL_SCHEMA,
    )

    # Register PTZ services
    hass.services.async_register(
        DOMAIN,
        SERVICE_PTZ_MOVE,
        async_handle_ptz_move,
        schema=PTZ_MOVE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_PTZ_PATROL,
        async_handle_ptz_patrol,
        schema=PTZ_PATROL_SCHEMA,
    )

    # Define chime service handlers
    async def async_handle_set_chime_volume(call: ServiceCall) -> None:
        """Handle the set_chime_volume service call."""
        _LOGGER.debug("Handling set_chime_volume service call with data: %s", call.data)

        chime_id = call.data["chime_id"]
        volume = call.data["volume"]
        camera_id = call.data.get("camera_id")

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_chime_volume(
                chime_id=chime_id,
                volume=volume,
                camera_id=camera_id,
            )
            _LOGGER.info("Successfully set chime volume to %s for chime %s", volume, chime_id)
        except Exception as err:
            _LOGGER.error("Error setting chime volume: %s", err)
            raise HomeAssistantError(f"Error setting chime volume: {err}") from err

    async def async_handle_play_chime_ringtone(call: ServiceCall) -> None:
        """Handle the play_chime_ringtone service call."""
        _LOGGER.debug("Handling play_chime_ringtone service call with data: %s", call.data)

        chime_id = call.data["chime_id"]
        ringtone_id = call.data.get("ringtone_id")

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_play_chime_ringtone(
                chime_id=chime_id,
                ringtone_id=ringtone_id,
            )
            _LOGGER.info("Successfully played ringtone on chime %s", chime_id)
        except Exception as err:
            _LOGGER.error("Error playing chime ringtone: %s", err)
            raise HomeAssistantError(f"Error playing chime ringtone: {err}") from err

    async def async_handle_set_chime_ringtone(call: ServiceCall) -> None:
        """Handle the set_chime_ringtone service call."""
        _LOGGER.debug("Handling set_chime_ringtone service call with data: %s", call.data)

        chime_id = call.data["chime_id"]
        ringtone_id = call.data["ringtone_id"]
        camera_id = call.data.get("camera_id")

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_chime_ringtone(
                chime_id=chime_id,
                ringtone_id=ringtone_id,
                camera_id=camera_id,
            )
            _LOGGER.info("Successfully set ringtone to %s for chime %s", ringtone_id, chime_id)
        except Exception as err:
            _LOGGER.error("Error setting chime ringtone: %s", err)
            raise HomeAssistantError(f"Error setting chime ringtone: {err}") from err

    async def async_handle_set_chime_repeat_times(call: ServiceCall) -> None:
        """Handle the set_chime_repeat_times service call."""
        _LOGGER.debug("Handling set_chime_repeat_times service call with data: %s", call.data)

        chime_id = call.data["chime_id"]
        repeat_times = call.data["repeat_times"]
        camera_id = call.data.get("camera_id")

        # Get first coordinator with Protect API
        coordinator = next(
            (
                coord for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_api") and coord.protect_api is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            raise HomeAssistantError("No UniFi Protect coordinator found")

        try:
            await coordinator.protect_api.async_set_chime_repeat_times(
                chime_id=chime_id,
                repeat_times=repeat_times,
                camera_id=camera_id,
            )
            _LOGGER.info("Successfully set repeat times to %s for chime %s", repeat_times, chime_id)
        except Exception as err:
            _LOGGER.error("Error setting chime repeat times: %s", err)
            raise HomeAssistantError(f"Error setting chime repeat times: {err}") from err

    # Register chime services
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_CHIME_VOLUME,
        async_handle_set_chime_volume,
        schema=SET_CHIME_VOLUME_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_PLAY_CHIME_RINGTONE,
        async_handle_play_chime_ringtone,
        schema=PLAY_CHIME_RINGTONE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_CHIME_RINGTONE,
        async_handle_set_chime_ringtone,
        schema=SET_CHIME_RINGTONE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_CHIME_REPEAT_TIMES,
        async_handle_set_chime_repeat_times,
        schema=SET_CHIME_REPEAT_TIMES_SCHEMA,
    )

    _LOGGER.info("UniFi Insights services registered successfully")

async def async_unload_services(hass: HomeAssistant) -> None:
    """Unload UniFi Insights services."""
    _LOGGER.debug("Unloading UniFi Insights services")

    # Unload core services
    if hass.services.has_service(DOMAIN, SERVICE_REFRESH_DATA):
        hass.services.async_remove(DOMAIN, SERVICE_REFRESH_DATA)

    if hass.services.has_service(DOMAIN, SERVICE_RESTART_DEVICE):
        hass.services.async_remove(DOMAIN, SERVICE_RESTART_DEVICE)

    # Unload Unifi Protect services
    if hass.services.has_service(DOMAIN, SERVICE_SET_RECORDING_MODE):
        hass.services.async_remove(DOMAIN, SERVICE_SET_RECORDING_MODE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_HDR_MODE):
        hass.services.async_remove(DOMAIN, SERVICE_SET_HDR_MODE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_VIDEO_MODE):
        hass.services.async_remove(DOMAIN, SERVICE_SET_VIDEO_MODE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_MIC_VOLUME):
        hass.services.async_remove(DOMAIN, SERVICE_SET_MIC_VOLUME)

    if hass.services.has_service(DOMAIN, SERVICE_SET_LIGHT_MODE):
        hass.services.async_remove(DOMAIN, SERVICE_SET_LIGHT_MODE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_LIGHT_LEVEL):
        hass.services.async_remove(DOMAIN, SERVICE_SET_LIGHT_LEVEL)

    if hass.services.has_service(DOMAIN, SERVICE_PTZ_MOVE):
        hass.services.async_remove(DOMAIN, SERVICE_PTZ_MOVE)

    if hass.services.has_service(DOMAIN, SERVICE_PTZ_PATROL):
        hass.services.async_remove(DOMAIN, SERVICE_PTZ_PATROL)

    # Unload chime services
    if hass.services.has_service(DOMAIN, SERVICE_SET_CHIME_VOLUME):
        hass.services.async_remove(DOMAIN, SERVICE_SET_CHIME_VOLUME)

    if hass.services.has_service(DOMAIN, SERVICE_PLAY_CHIME_RINGTONE):
        hass.services.async_remove(DOMAIN, SERVICE_PLAY_CHIME_RINGTONE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_CHIME_RINGTONE):
        hass.services.async_remove(DOMAIN, SERVICE_SET_CHIME_RINGTONE)

    if hass.services.has_service(DOMAIN, SERVICE_SET_CHIME_REPEAT_TIMES):
        hass.services.async_remove(DOMAIN, SERVICE_SET_CHIME_REPEAT_TIMES)

    _LOGGER.info("UniFi Insights services unloaded successfully")