"""Services for the UniFi Insights integration."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv

from .const import (
    CHIME_RINGTONE_CHRISTMAS,
    CHIME_RINGTONE_CUSTOM_1,
    CHIME_RINGTONE_CUSTOM_2,
    CHIME_RINGTONE_DEFAULT,
    CHIME_RINGTONE_DIGITAL,
    CHIME_RINGTONE_MECHANICAL,
    CHIME_RINGTONE_TRADITIONAL,
    DOMAIN,
    HDR_MODE_AUTO,
    HDR_MODE_OFF,
    HDR_MODE_ON,
    LIGHT_MODE_ALWAYS,
    LIGHT_MODE_MOTION,
    LIGHT_MODE_OFF,
    SERVICE_AUTHORIZE_GUEST,
    SERVICE_CREATE_LIVEVIEW,
    SERVICE_DELETE_VOUCHER,
    SERVICE_GENERATE_VOUCHER,
    SERVICE_PLAY_CHIME_RINGTONE,
    SERVICE_PTZ_MOVE,
    SERVICE_PTZ_PATROL,
    SERVICE_SET_CHIME_REPEAT_TIMES,
    SERVICE_SET_CHIME_RINGTONE,
    SERVICE_SET_CHIME_VOLUME,
    SERVICE_SET_HDR_MODE,
    SERVICE_SET_LIGHT_LEVEL,
    SERVICE_SET_LIGHT_MODE,
    SERVICE_SET_LIVEVIEW,
    SERVICE_SET_MIC_VOLUME,
    SERVICE_SET_RECORDING_MODE,
    SERVICE_SET_VIDEO_MODE,
    SERVICE_TRIGGER_ALARM,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
    VIDEO_MODE_SLOW_SHUTTER,
    VIDEO_MODE_SPORT,
)

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall


_LOGGER = logging.getLogger(__name__)


def _get_coordinators(hass: HomeAssistant) -> list[Any]:
    """Get all UniFi Insights coordinators from config entries."""
    return [
        entry.runtime_data.coordinator
        for entry in hass.config_entries.async_entries(DOMAIN)
        if hasattr(entry, "runtime_data") and entry.runtime_data
    ]


def _get_first_coordinator(
    hass: HomeAssistant,
) -> Any | None:
    """Get the first available UniFi Insights coordinator."""
    coordinators = _get_coordinators(hass)
    return coordinators[0] if coordinators else None


def _get_protect_coordinator(
    hass: HomeAssistant,
) -> Any | None:
    """Get the first coordinator with Protect API available."""
    for entry in hass.config_entries.async_entries(DOMAIN):
        if hasattr(entry, "runtime_data") and entry.runtime_data:
            coordinator = entry.runtime_data.coordinator
            if coordinator.protect_client is not None:
                return coordinator
    return None


SERVICE_REFRESH_DATA = "refresh_data"
SERVICE_RESTART_DEVICE = "restart_device"

# Schema for refresh_data service
REFRESH_DATA_SCHEMA = vol.Schema(
    {
        vol.Optional("site_id"): cv.string,
    }
)

# Schema for restart_device service
RESTART_DEVICE_SCHEMA = vol.Schema(
    {
        vol.Required("site_id"): cv.string,
        vol.Required("device_id"): cv.string,
    }
)

# Schema for set_recording_mode service
SET_RECORDING_MODE_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("mode"): cv.string,
    }
)

# Schema for set_hdr_mode service
SET_HDR_MODE_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("mode"): vol.In([HDR_MODE_AUTO, HDR_MODE_ON, HDR_MODE_OFF]),
    }
)

# Schema for set_video_mode service
SET_VIDEO_MODE_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("mode"): vol.In(
            [
                VIDEO_MODE_DEFAULT,
                VIDEO_MODE_HIGH_FPS,
                VIDEO_MODE_SPORT,
                VIDEO_MODE_SLOW_SHUTTER,
            ]
        ),
    }
)

# Schema for set_mic_volume service
SET_MIC_VOLUME_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("volume"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
    }
)

# Schema for set_light_mode service
SET_LIGHT_MODE_SCHEMA = vol.Schema(
    {
        vol.Required("light_id"): cv.string,
        vol.Required("mode"): vol.In(
            [
                LIGHT_MODE_ALWAYS,
                LIGHT_MODE_MOTION,
                LIGHT_MODE_OFF,
            ]
        ),
    }
)

# Schema for set_light_level service
SET_LIGHT_LEVEL_SCHEMA = vol.Schema(
    {
        vol.Required("light_id"): cv.string,
        vol.Required("level"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
    }
)

# Schema for ptz_move service
PTZ_MOVE_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("preset"): vol.All(vol.Coerce(int), vol.Range(min=0, max=15)),
    }
)


# Schema for ptz_patrol service
PTZ_PATROL_SCHEMA = vol.Schema(
    {
        vol.Required("camera_id"): cv.string,
        vol.Required("action"): vol.In(["start", "stop"]),
        vol.Optional("slot", default=0): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=15)
        ),
    }
)

# Schema for set_chime_volume service
SET_CHIME_VOLUME_SCHEMA = vol.Schema(
    {
        vol.Required("chime_id"): cv.string,
        vol.Required("volume"): vol.All(vol.Coerce(int), vol.Range(min=0, max=100)),
        vol.Optional("camera_id"): cv.string,
    }
)

# Schema for play_chime_ringtone service
PLAY_CHIME_RINGTONE_SCHEMA = vol.Schema(
    {
        vol.Required("chime_id"): cv.string,
        vol.Optional("ringtone_id"): vol.In(
            [
                CHIME_RINGTONE_DEFAULT,
                CHIME_RINGTONE_MECHANICAL,
                CHIME_RINGTONE_DIGITAL,
                CHIME_RINGTONE_CHRISTMAS,
                CHIME_RINGTONE_TRADITIONAL,
                CHIME_RINGTONE_CUSTOM_1,
                CHIME_RINGTONE_CUSTOM_2,
            ]
        ),
    }
)

# Schema for set_chime_ringtone service
SET_CHIME_RINGTONE_SCHEMA = vol.Schema(
    {
        vol.Required("chime_id"): cv.string,
        vol.Required("ringtone_id"): vol.In(
            [
                CHIME_RINGTONE_DEFAULT,
                CHIME_RINGTONE_MECHANICAL,
                CHIME_RINGTONE_DIGITAL,
                CHIME_RINGTONE_CHRISTMAS,
                CHIME_RINGTONE_TRADITIONAL,
                CHIME_RINGTONE_CUSTOM_1,
                CHIME_RINGTONE_CUSTOM_2,
            ]
        ),
        vol.Optional("camera_id"): cv.string,
    }
)

# Schema for set_chime_repeat_times service
SET_CHIME_REPEAT_TIMES_SCHEMA = vol.Schema(
    {
        vol.Required("chime_id"): cv.string,
        vol.Required("repeat_times"): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=10)
        ),
        vol.Optional("camera_id"): cv.string,
    }
)

# Schema for authorize_guest service
AUTHORIZE_GUEST_SCHEMA = vol.Schema(
    {
        vol.Required("site_id"): cv.string,
        vol.Required("client_id"): cv.string,
        vol.Optional("duration_minutes", default=480): vol.All(
            vol.Coerce(int), vol.Range(min=1)
        ),
        vol.Optional("upload_limit_kbps"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("download_limit_kbps"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("data_limit_mb"): vol.All(vol.Coerce(int), vol.Range(min=0)),
    }
)

# Schema for generate_voucher service
GENERATE_VOUCHER_SCHEMA = vol.Schema(
    {
        vol.Required("site_id"): cv.string,
        vol.Optional("count", default=1): vol.All(
            vol.Coerce(int), vol.Range(min=1, max=100)
        ),
        vol.Optional("duration_minutes", default=480): vol.All(
            vol.Coerce(int), vol.Range(min=1)
        ),
        vol.Optional("upload_limit_kbps"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("download_limit_kbps"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("data_limit_mb"): vol.All(vol.Coerce(int), vol.Range(min=0)),
        vol.Optional("note"): cv.string,
    }
)

# Schema for delete_voucher service
DELETE_VOUCHER_SCHEMA = vol.Schema(
    {
        vol.Required("site_id"): cv.string,
        vol.Required("voucher_id"): cv.string,
    }
)

# Schema for trigger_alarm service
TRIGGER_ALARM_SCHEMA = vol.Schema(
    {
        vol.Required("alarm_id"): cv.string,
    }
)

# Schema for create_liveview service
CREATE_LIVEVIEW_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("layout"): vol.All(vol.Coerce(int), vol.Range(min=1, max=4)),
        vol.Optional("is_default", default=False): cv.boolean,
    }
)

# Schema for set_liveview service
SET_LIVEVIEW_SCHEMA = vol.Schema(
    {
        vol.Required("viewer_id"): cv.string,
        vol.Required("liveview_id"): cv.string,
    }
)


async def async_setup_services(hass: HomeAssistant) -> None:  # noqa: C901, PLR0915
    """Set up the UniFi Insights services."""
    _LOGGER.debug("Setting up UniFi Insights services")

    async def async_handle_refresh_data(call: ServiceCall) -> None:
        """Handle the refresh data service call."""
        _LOGGER.debug("Handling refresh_data service call with data: %s", call.data)

        site_id = call.data.get("site_id")

        # Get all coordinators from config entries
        coordinators = _get_coordinators(hass)

        if not coordinators:
            _LOGGER.error("No UniFi Insights coordinators found")
            msg = "No UniFi Insights coordinators found"
            raise HomeAssistantError(msg)

        _LOGGER.info(
            "Refreshing data for %s site%s",
            "specific" if site_id else "all",
            f" (ID: {site_id})" if site_id else "s",
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
                _LOGGER.exception("Error refreshing coordinator data")
                msg = f"Error refreshing data: {err}"
                raise HomeAssistantError(msg) from err

    async def async_handle_restart_device(call: ServiceCall) -> None:
        """Handle the restart device service call."""
        _LOGGER.debug("Handling restart_device service call with data: %s", call.data)

        site_id = call.data["site_id"]
        device_id = call.data["device_id"]

        # Get first coordinator (we only need one to restart a device)
        coordinator = _get_first_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        _LOGGER.info("Attempting to restart device %s in site %s", device_id, site_id)

        try:
            success = await coordinator.network_client.restart_device(
                site_id, device_id
            )
            if success:
                _LOGGER.info(
                    "Successfully initiated restart for device %s in site %s",
                    device_id,
                    site_id,
                )
            else:
                _LOGGER.error(
                    "Failed to restart device %s in site %s", device_id, site_id
                )
                msg = f"Failed to restart device {device_id}"
                raise HomeAssistantError(msg)  # noqa: TRY301

        except Exception as err:
            _LOGGER.exception(
                "Error restarting device %s in site %s", device_id, site_id
            )
            msg = f"Error restarting device: {err}"
            raise HomeAssistantError(msg) from err

    # Define Unifi Protect service handlers
    async def async_handle_set_recording_mode(call: ServiceCall) -> None:
        """Handle the set_recording_mode service call."""
        _LOGGER.debug(
            "Handling set_recording_mode service call with data: %s", call.data
        )

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.update_camera(
                camera_id=camera_id,
                data={"recordingSettings": {"mode": mode}},
            )
            _LOGGER.info(
                "Successfully set recording mode to %s for camera %s", mode, camera_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting recording mode")
            msg = f"Error setting recording mode: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_hdr_mode(call: ServiceCall) -> None:
        """Handle the set_hdr_mode service call."""
        _LOGGER.debug("Handling set_hdr_mode service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_hdr_mode(
                camera_id=camera_id,
                mode=mode,
            )
            _LOGGER.info(
                "Successfully set HDR mode to %s for camera %s", mode, camera_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting HDR mode")
            msg = f"Error setting HDR mode: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_video_mode(call: ServiceCall) -> None:
        """Handle the set_video_mode service call."""
        _LOGGER.debug("Handling set_video_mode service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_video_mode(
                camera_id=camera_id,
                mode=mode,
            )
            _LOGGER.info(
                "Successfully set video mode to %s for camera %s", mode, camera_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting video mode")
            msg = f"Error setting video mode: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_mic_volume(call: ServiceCall) -> None:
        """Handle the set_mic_volume service call."""
        _LOGGER.debug("Handling set_mic_volume service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        volume = call.data["volume"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_microphone_volume(
                camera_id=camera_id,
                volume=volume,
            )
            _LOGGER.info(
                "Successfully set mic volume to %s for camera %s", volume, camera_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting mic volume")
            msg = f"Error setting mic volume: {err}"
            raise HomeAssistantError(msg) from err

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
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_light_mode(
                light_id=light_id,
                mode=mode,
            )
            _LOGGER.info(
                "Successfully set light mode to %s for light %s", mode, light_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting light mode")
            msg = f"Error setting light mode: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_light_level(call: ServiceCall) -> None:
        """Handle the set_light_level service call."""
        _LOGGER.debug("Handling set_light_level service call with data: %s", call.data)

        light_id = call.data["light_id"]
        level = call.data["level"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_light_brightness(
                light_id=light_id,
                level=level,
            )
            _LOGGER.info(
                "Successfully set light level to %s for light %s", level, light_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting light level")
            msg = f"Error setting light level: {err}"
            raise HomeAssistantError(msg) from err

    # Define PTZ service handlers
    async def async_handle_ptz_move(call: ServiceCall) -> None:
        """Handle the ptz_move service call."""
        _LOGGER.debug("Handling ptz_move service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        preset = call.data["preset"]

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.ptz_move_to_preset(
                camera_id=camera_id,
                preset=preset,
            )
            _LOGGER.info(
                "Successfully moved PTZ camera %s to preset %s", camera_id, preset
            )
        except Exception as err:
            _LOGGER.exception("Error moving PTZ camera")
            msg = f"Error moving PTZ camera: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_ptz_patrol(call: ServiceCall) -> None:
        """Handle the ptz_patrol service call."""
        _LOGGER.debug("Handling ptz_patrol service call with data: %s", call.data)

        camera_id = call.data["camera_id"]
        action = call.data["action"]
        slot = call.data.get("slot", 0)

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            if action == "start":
                await coordinator.protect_client.ptz_start_patrol(
                    camera_id=camera_id,
                    slot=slot,
                )
                _LOGGER.info(
                    "Successfully started PTZ patrol for camera %s on slot %s",
                    camera_id,
                    slot,
                )
            else:
                await coordinator.protect_client.ptz_stop_patrol(
                    camera_id=camera_id,
                )
                _LOGGER.info("Successfully stopped PTZ patrol for camera %s", camera_id)
        except Exception as err:
            _LOGGER.exception("Error controlling PTZ patrol")
            msg = f"Error controlling PTZ patrol: {err}"
            raise HomeAssistantError(msg) from err

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
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_chime_volume(
                chime_id=chime_id,
                volume=volume,
                camera_id=camera_id,
            )
            _LOGGER.info(
                "Successfully set chime volume to %s for chime %s", volume, chime_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting chime volume")
            msg = f"Error setting chime volume: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_play_chime_ringtone(call: ServiceCall) -> None:
        """Handle the play_chime_ringtone service call."""
        _LOGGER.debug(
            "Handling play_chime_ringtone service call with data: %s", call.data
        )

        chime_id = call.data["chime_id"]
        ringtone_id = call.data.get("ringtone_id")

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.play_chime(
                chime_id=chime_id,
                ringtone_id=ringtone_id,
            )
            _LOGGER.info("Successfully played ringtone on chime %s", chime_id)
        except Exception as err:
            _LOGGER.exception("Error playing chime ringtone")
            msg = f"Error playing chime ringtone: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_chime_ringtone(call: ServiceCall) -> None:
        """Handle the set_chime_ringtone service call."""
        _LOGGER.debug(
            "Handling set_chime_ringtone service call with data: %s", call.data
        )

        chime_id = call.data["chime_id"]
        ringtone_id = call.data["ringtone_id"]
        camera_id = call.data.get("camera_id")

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_chime_ringtone(
                chime_id=chime_id,
                ringtone_id=ringtone_id,
                camera_id=camera_id,
            )
            _LOGGER.info(
                "Successfully set ringtone to %s for chime %s", ringtone_id, chime_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting chime ringtone")
            msg = f"Error setting chime ringtone: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_chime_repeat_times(call: ServiceCall) -> None:
        """Handle the set_chime_repeat_times service call."""
        _LOGGER.debug(
            "Handling set_chime_repeat_times service call with data: %s", call.data
        )

        chime_id = call.data["chime_id"]
        repeat_times = call.data["repeat_times"]
        camera_id = call.data.get("camera_id")

        # Get first coordinator with Protect API
        coordinator = _get_protect_coordinator(hass)

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.set_chime_repeat(
                chime_id=chime_id,
                repeat_times=repeat_times,
                camera_id=camera_id,
            )
            _LOGGER.info(
                "Successfully set repeat times to %s for chime %s",
                repeat_times,
                chime_id,
            )
        except Exception as err:
            _LOGGER.exception("Error setting chime repeat times")
            msg = f"Error setting chime repeat times: {err}"
            raise HomeAssistantError(msg) from err

    # Define UniFi Network service handlers
    async def async_handle_authorize_guest(call: ServiceCall) -> None:
        """Handle the authorize_guest service call."""
        _LOGGER.debug("Handling authorize_guest service call with data: %s", call.data)

        site_id = call.data["site_id"]
        client_id = call.data["client_id"]
        duration_minutes = call.data.get("duration_minutes", 480)
        upload_limit_kbps = call.data.get("upload_limit_kbps")
        download_limit_kbps = call.data.get("download_limit_kbps")
        data_limit_mb = call.data.get("data_limit_mb")

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.network_client.authorize_guest(
                site_id=site_id,
                client_id=client_id,
                duration_minutes=duration_minutes,
                upload_limit_kbps=upload_limit_kbps,
                download_limit_kbps=download_limit_kbps,
                data_limit_mb=data_limit_mb,
            )
            _LOGGER.info(
                "Successfully authorized guest %s in site %s", client_id, site_id
            )
        except Exception as err:
            _LOGGER.exception("Error authorizing guest")
            msg = f"Error authorizing guest: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_generate_voucher(call: ServiceCall) -> None:
        """Handle the generate_voucher service call."""
        _LOGGER.debug("Handling generate_voucher service call with data: %s", call.data)

        site_id = call.data["site_id"]
        count = call.data.get("count", 1)
        duration_minutes = call.data.get("duration_minutes", 480)
        upload_limit_kbps = call.data.get("upload_limit_kbps")
        download_limit_kbps = call.data.get("download_limit_kbps")
        data_limit_mb = call.data.get("data_limit_mb")
        note = call.data.get("note")

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.network_client.generate_voucher(
                site_id=site_id,
                count=count,
                duration_minutes=duration_minutes,
                upload_limit_kbps=upload_limit_kbps,
                download_limit_kbps=download_limit_kbps,
                data_limit_mb=data_limit_mb,
                note=note,
            )
            _LOGGER.info(
                "Successfully generated %d voucher(s) in site %s", count, site_id
            )
        except Exception as err:
            _LOGGER.exception("Error generating voucher")
            msg = f"Error generating voucher: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_delete_voucher(call: ServiceCall) -> None:
        """Handle the delete_voucher service call."""
        _LOGGER.debug("Handling delete_voucher service call with data: %s", call.data)

        site_id = call.data["site_id"]
        voucher_id = call.data["voucher_id"]

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            _LOGGER.error("No UniFi Insights coordinator found")
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.network_client.delete_voucher(
                site_id=site_id,
                voucher_id=voucher_id,
            )
            _LOGGER.info(
                "Successfully deleted voucher %s in site %s", voucher_id, site_id
            )
        except Exception as err:
            _LOGGER.exception("Error deleting voucher")
            msg = f"Error deleting voucher: {err}"
            raise HomeAssistantError(msg) from err

    # Define UniFi Protect service handlers
    async def async_handle_trigger_alarm(call: ServiceCall) -> None:
        """Handle the trigger_alarm service call."""
        _LOGGER.debug("Handling trigger_alarm service call with data: %s", call.data)

        alarm_id = call.data["alarm_id"]

        coordinator = next(
            (
                coord
                for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_client") and coord.protect_client is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            await coordinator.protect_client.trigger_alarm(alarm_id=alarm_id)
            _LOGGER.info("Successfully triggered alarm %s", alarm_id)
        except Exception as err:
            _LOGGER.exception("Error triggering alarm")
            msg = f"Error triggering alarm: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_create_liveview(call: ServiceCall) -> None:
        """Handle the create_liveview service call."""
        _LOGGER.debug("Handling create_liveview service call with data: %s", call.data)

        name = call.data["name"]
        layout = call.data["layout"]
        is_default = call.data.get("is_default", False)

        coordinator = next(
            (
                coord
                for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_client") and coord.protect_client is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            data = {
                "name": name,
                "layout": layout,
                "isDefault": is_default,
            }
            await coordinator.protect_client.create_liveview(data=data)
            _LOGGER.info("Successfully created liveview %s", name)
        except Exception as err:
            _LOGGER.exception("Error creating liveview")
            msg = f"Error creating liveview: {err}"
            raise HomeAssistantError(msg) from err

    async def async_handle_set_liveview(call: ServiceCall) -> None:
        """Handle the set_liveview service call."""
        _LOGGER.debug("Handling set_liveview service call with data: %s", call.data)

        viewer_id = call.data["viewer_id"]
        liveview_id = call.data["liveview_id"]

        coordinator = next(
            (
                coord
                for coord in hass.data[DOMAIN].values()
                if hasattr(coord, "protect_client") and coord.protect_client is not None
            ),
            None,
        )

        if not coordinator:
            _LOGGER.error("No UniFi Protect coordinator found")
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        try:
            data = {"liveview": liveview_id}
            await coordinator.protect_client.update_viewer(
                viewer_id=viewer_id, data=data
            )
            _LOGGER.info(
                "Successfully set liveview %s for viewer %s", liveview_id, viewer_id
            )
        except Exception as err:
            _LOGGER.exception("Error setting liveview")
            msg = f"Error setting liveview: {err}"
            raise HomeAssistantError(msg) from err

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

    # Register UniFi Network services
    hass.services.async_register(
        DOMAIN,
        SERVICE_AUTHORIZE_GUEST,
        async_handle_authorize_guest,
        schema=AUTHORIZE_GUEST_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_GENERATE_VOUCHER,
        async_handle_generate_voucher,
        schema=GENERATE_VOUCHER_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DELETE_VOUCHER,
        async_handle_delete_voucher,
        schema=DELETE_VOUCHER_SCHEMA,
    )

    # Register UniFi Protect services
    hass.services.async_register(
        DOMAIN,
        SERVICE_TRIGGER_ALARM,
        async_handle_trigger_alarm,
        schema=TRIGGER_ALARM_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_CREATE_LIVEVIEW,
        async_handle_create_liveview,
        schema=CREATE_LIVEVIEW_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_LIVEVIEW,
        async_handle_set_liveview,
        schema=SET_LIVEVIEW_SCHEMA,
    )

    _LOGGER.info("UniFi Insights services registered successfully")


async def async_unload_services(hass: HomeAssistant) -> None:  # noqa: PLR0912
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

    # Unload UniFi Network services
    if hass.services.has_service(DOMAIN, SERVICE_AUTHORIZE_GUEST):
        hass.services.async_remove(DOMAIN, SERVICE_AUTHORIZE_GUEST)

    if hass.services.has_service(DOMAIN, SERVICE_GENERATE_VOUCHER):
        hass.services.async_remove(DOMAIN, SERVICE_GENERATE_VOUCHER)

    if hass.services.has_service(DOMAIN, SERVICE_DELETE_VOUCHER):
        hass.services.async_remove(DOMAIN, SERVICE_DELETE_VOUCHER)

    # Unload UniFi Protect services
    if hass.services.has_service(DOMAIN, SERVICE_TRIGGER_ALARM):
        hass.services.async_remove(DOMAIN, SERVICE_TRIGGER_ALARM)

    if hass.services.has_service(DOMAIN, SERVICE_CREATE_LIVEVIEW):
        hass.services.async_remove(DOMAIN, SERVICE_CREATE_LIVEVIEW)

    if hass.services.has_service(DOMAIN, SERVICE_SET_LIVEVIEW):
        hass.services.async_remove(DOMAIN, SERVICE_SET_LIVEVIEW)

    _LOGGER.info("UniFi Insights services unloaded successfully")
