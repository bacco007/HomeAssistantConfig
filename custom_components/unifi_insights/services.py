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


async def async_setup_services(hass: HomeAssistant) -> None:
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
        site_id = call.data["site_id"]
        device_id = call.data["device_id"]

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_restart_device(site_id, device_id)

    async def async_handle_set_recording_mode(call: ServiceCall) -> None:
        """Handle the set_recording_mode service call."""
        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_recording_mode(camera_id, mode)

    async def async_handle_set_hdr_mode(call: ServiceCall) -> None:
        """Handle the set_hdr_mode service call."""
        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_hdr_mode(camera_id, mode)

    async def async_handle_set_video_mode(call: ServiceCall) -> None:
        """Handle the set_video_mode service call."""
        camera_id = call.data["camera_id"]
        mode = call.data["mode"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_video_mode(camera_id, mode)

    async def async_handle_set_mic_volume(call: ServiceCall) -> None:
        """Handle the set_mic_volume service call."""
        camera_id = call.data["camera_id"]
        volume = call.data["volume"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_microphone_volume(camera_id, volume)

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

    async def async_handle_set_light_mode(call: ServiceCall) -> None:
        """Handle the set_light_mode service call."""
        light_id = call.data["light_id"]
        mode = call.data["mode"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_light_mode(light_id, mode)

    async def async_handle_set_light_level(call: ServiceCall) -> None:
        """Handle the set_light_level service call."""
        light_id = call.data["light_id"]
        level = call.data["level"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_light_brightness(light_id, level)

    async def async_handle_ptz_move(call: ServiceCall) -> None:
        """Handle the ptz_move service call."""
        camera_id = call.data["camera_id"]
        preset = call.data["preset"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_move_ptz_to_preset(camera_id, preset)

    async def async_handle_ptz_patrol(call: ServiceCall) -> None:
        """Handle the ptz_patrol service call."""
        camera_id = call.data["camera_id"]
        action = call.data["action"]
        slot = call.data.get("slot", 0)

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        if action == "start":
            await coordinator.async_start_ptz_patrol(camera_id, slot)
        else:
            await coordinator.async_stop_ptz_patrol(camera_id)

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

    async def async_handle_set_chime_volume(call: ServiceCall) -> None:
        """Handle the set_chime_volume service call."""
        chime_id = call.data["chime_id"]
        volume = call.data["volume"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_chime_volume(chime_id, volume)

    async def async_handle_play_chime_ringtone(call: ServiceCall) -> None:
        """Handle the play_chime_ringtone service call."""
        chime_id = call.data["chime_id"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_play_chime(chime_id)

    async def async_handle_set_chime_ringtone(call: ServiceCall) -> None:
        """Handle the set_chime_ringtone service call."""
        chime_id = call.data["chime_id"]
        ringtone_id = call.data["ringtone_id"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_chime_ringtone(chime_id, ringtone_id)

    async def async_handle_set_chime_repeat_times(call: ServiceCall) -> None:
        """Handle the set_chime_repeat_times service call."""
        chime_id = call.data["chime_id"]
        repeat_times = call.data["repeat_times"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_set_chime_repeat(chime_id, repeat_times)

    async def async_handle_authorize_guest(_call: ServiceCall) -> None:
        """Handle the authorize_guest service call."""
        msg = (
            "authorize_guest is not supported by the current UniFi API. "
            "Use the UniFi controller UI to authorize guests."
        )
        raise HomeAssistantError(msg)

    async def async_handle_generate_voucher(call: ServiceCall) -> None:
        """Handle the generate_voucher service call."""
        site_id = call.data["site_id"]
        count = call.data.get("count", 1)
        duration_minutes = call.data.get("duration_minutes")
        upload_limit_kbps = call.data.get("upload_limit_kbps")
        download_limit_kbps = call.data.get("download_limit_kbps")
        data_limit_mb = call.data.get("data_limit_mb")
        note = call.data.get("note")

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_generate_voucher(
            site_id,
            count=count,
            time_limit_minutes=duration_minutes,
            tx_rate_limit_kbps=upload_limit_kbps,
            rx_rate_limit_kbps=download_limit_kbps,
            data_usage_limit_mbytes=data_limit_mb,
            name=note,
        )

    async def async_handle_delete_voucher(call: ServiceCall) -> None:
        """Handle the delete_voucher service call."""
        site_id = call.data["site_id"]
        voucher_id = call.data["voucher_id"]

        coordinator = _get_first_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Insights coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_delete_voucher(site_id, voucher_id)

    async def async_handle_trigger_alarm(call: ServiceCall) -> None:
        """Handle the trigger_alarm service call."""
        alarm_id = call.data["alarm_id"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_trigger_alarm(alarm_id)

    async def async_handle_create_liveview(call: ServiceCall) -> None:
        """Handle the create_liveview service call."""
        name = call.data["name"]
        layout = call.data["layout"]
        is_default = call.data.get("is_default", False)

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_create_liveview(
            name=name,
            layout=layout,
            is_default=is_default,
        )

    async def async_handle_set_liveview(call: ServiceCall) -> None:
        """Handle the set_liveview service call."""
        viewer_id = call.data["viewer_id"]
        liveview_id = call.data["liveview_id"]

        coordinator = _get_protect_coordinator(hass)
        if not coordinator:
            msg = "No UniFi Protect coordinator found"
            raise HomeAssistantError(msg)

        await coordinator.async_update_viewer(viewer_id, liveview=liveview_id)

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
