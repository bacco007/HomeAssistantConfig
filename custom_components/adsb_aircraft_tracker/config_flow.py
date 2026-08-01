"""Config flow for ADSB Aircraft Tracker integration."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    DOMAIN,
    CONF_ADSB_HOST,
    CONF_ADSB_PORT,
    CONF_UPDATE_INTERVAL,
    CONF_DISTANCE_LIMIT,
    CONF_NOTIFICATION_DEVICE,
    CONF_EXTERNAL_URL,
    CONF_MILITARY_NOTIFICATIONS,
    CONF_CLOSE_AIRCRAFT_ENABLED,
    CONF_CLOSE_AIRCRAFT_DISTANCE,
    CONF_CLOSE_AIRCRAFT_ALTITUDE,
    CONF_EMERGENCY_NOTIFICATIONS,
    DEFAULT_ADSB_PORT,
    DEFAULT_UPDATE_INTERVAL,
    DEFAULT_DISTANCE_LIMIT,
    DEFAULT_MILITARY_NOTIFICATIONS,
    DEFAULT_CLOSE_AIRCRAFT_ENABLED,
    DEFAULT_CLOSE_AIRCRAFT_DISTANCE,
    DEFAULT_CLOSE_AIRCRAFT_ALTITUDE,
    DEFAULT_EMERGENCY_NOTIFICATIONS,
)

_LOGGER = logging.getLogger(__name__)

def get_user_data_schema(hass=None):
    """Get the user data schema with helpful defaults and labels."""
    # Determine distance unit based on Home Assistant's unit system
    distance_unit = "miles"
    max_distance = 1000
    if hass and hass.config.units.length == "km":
        distance_unit = "kilometers"
        max_distance = 1600  # ~1000 miles in km
    
    return vol.Schema(
        {
            vol.Required(CONF_ADSB_HOST): str,
            vol.Optional(CONF_ADSB_PORT, default=DEFAULT_ADSB_PORT): vol.All(vol.Coerce(int), vol.Range(min=1, max=65535)),
            vol.Optional(CONF_UPDATE_INTERVAL, default=DEFAULT_UPDATE_INTERVAL): vol.All(vol.Coerce(int), vol.Range(min=5, max=300)),
            vol.Optional(CONF_DISTANCE_LIMIT, default=DEFAULT_DISTANCE_LIMIT): vol.All(vol.Coerce(int), vol.Range(min=0, max=max_distance)),
        }
    )


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""

    host = data[CONF_ADSB_HOST].strip()
    port = data[CONF_ADSB_PORT]
    url = f"http://{host}:{port}/data/aircraft.json"

    session = async_get_clientsession(hass)

    try:
        async with asyncio.timeout(10):
            async with session.get(url) as response:
                if response.status != 200:
                    raise InvalidHost(f"HTTP {response.status}")

                json_data = await response.json()

                # Validate required structure
                if "aircraft" not in json_data:
                    raise InvalidADSBData("Missing aircraft data in response")

                if not isinstance(json_data["aircraft"], list):
                    raise InvalidADSBData("Aircraft data is not a list")

                return {
                    "title": f"ADSB Tracker ({host}:{port})",
                    "aircraft_count": len(json_data["aircraft"]),
                    "last_update": json_data.get("now"),
                }

    except asyncio.TimeoutError:
        raise ConnectionTimeout(
            f"Timed out connecting to {host}:{port}"
        )
    except aiohttp.ClientConnectorError as err:
        if isinstance(err.os_error, ConnectionRefusedError):
            raise ConnectionRefused(
                f"Connection refused by {host}:{port}"
            )
        err_msg = str(err).lower()
        if "not found" in err_msg or "not known" in err_msg or "nodename" in err_msg:
            raise CannotResolve(
                f"Cannot resolve hostname: {host}"
            )
        raise CannotConnect(f"Network error connecting to {host}:{port}: {err}")
    except aiohttp.ClientError as err:
        raise CannotConnect(f"Network error connecting to {host}:{port}: {err}")
    except (InvalidHost, InvalidADSBData):
        raise
    except Exception as err:
        _LOGGER.exception("Unexpected error validating ADSB connection")
        raise CannotConnect(f"Unexpected error: {err}")


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for ADSB Aircraft Tracker."""

    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Create the options flow."""
        return OptionsFlowHandler()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)

                # Create unique entry ID based on host:port
                host = user_input[CONF_ADSB_HOST]
                port = user_input[CONF_ADSB_PORT]
                unique_id = f"{host}:{port}"

                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()

                # Store the basic config and validation info
                self._user_input = user_input
                self._title = info["title"]
                self._validation_info = info
                return await self.async_step_summary()

            except ConnectionRefused:
                errors["base"] = "connection_refused"
            except ConnectionTimeout:
                errors["base"] = "timeout"
            except CannotResolve:
                errors[CONF_ADSB_HOST] = "cannot_resolve"
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidHost:
                errors["base"] = "invalid_host"
            except InvalidADSBData:
                errors["base"] = "invalid_adsb_data"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        return self.async_show_form(
            step_id="user",
            data_schema=get_user_data_schema(self.hass),
            errors=errors,
        )

    async def async_step_summary(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show connection summary and setup choice."""
        if user_input is not None:
            if user_input.get("setup_choice") == "configure_now":
                return await self.async_step_notifications()
            else:
                # Create entry with minimal configuration
                return self.async_create_entry(
                    title=self._title,
                    data=self._user_input,
                )

        # Build summary information
        info = self._validation_info
        aircraft_count = info.get("aircraft_count", 0)
        last_update = info.get("last_update")

        summary_text = f"✅ **Connection Successful!**\n\n"
        summary_text += f"🛜 **Found:** {aircraft_count} aircraft currently tracked\n"
        if last_update:
            summary_text += f"🕐 **Last Update:** {last_update}\n"
        summary_text += f"📡 **Source:** {self._user_input[CONF_ADSB_HOST]}:{self._user_input[CONF_ADSB_PORT]}\n\n"
        summary_text += "You can set up notifications and alerts now, or configure them later in the integration options."

        schema = vol.Schema({
            vol.Required("setup_choice", default="configure_later"): vol.In({
                "configure_now": "Configure notifications now",
                "configure_later": "Finish setup (configure notifications later)"
            })
        })

        return self.async_show_form(
            step_id="summary",
            data_schema=schema,
            description_placeholders={"summary_text": summary_text}
        )

    async def async_step_notifications(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle notification configuration during initial setup."""
        if user_input is not None:
            # Combine basic config with notification settings
            final_data = {**self._user_input, **user_input}
            return self.async_create_entry(
                title=self._title,
                data=final_data,
            )

        # Get notification devices
        notification_devices = self._get_notification_devices()

        # Create simplified schema focusing on key notification settings
        notifications_schema = vol.Schema(
            {
                vol.Optional(CONF_NOTIFICATION_DEVICE, default=""): vol.In([""] + notification_devices),
                vol.Optional(CONF_EXTERNAL_URL, default=""): str,
                vol.Optional(CONF_MILITARY_NOTIFICATIONS, default=DEFAULT_MILITARY_NOTIFICATIONS): bool,
                vol.Optional(CONF_EMERGENCY_NOTIFICATIONS, default=DEFAULT_EMERGENCY_NOTIFICATIONS): bool,
                vol.Optional(CONF_CLOSE_AIRCRAFT_ENABLED, default=DEFAULT_CLOSE_AIRCRAFT_ENABLED): bool,
            }
        )

        return self.async_show_form(
            step_id="notifications",
            data_schema=notifications_schema,
        )


    def _get_notification_devices(self) -> list[str]:
        """Get available mobile app notification devices."""
        devices = []
        
        # Look for mobile_app services
        for domain, services in self.hass.services.async_services().items():
            if domain == "notify":
                for service_name in services:
                    if service_name.startswith("mobile_app_"):
                        devices.append(service_name)
        
        return sorted(devices)


class CannotConnect(Exception):
    """Error to indicate we cannot connect."""


class ConnectionRefused(Exception):
    """Error to indicate the connection was actively refused."""


class ConnectionTimeout(Exception):
    """Error to indicate the connection timed out."""


class CannotResolve(Exception):
    """Error to indicate hostname resolution failed."""


class InvalidHost(Exception):
    """Error to indicate there is an invalid hostname."""


class InvalidADSBData(Exception):
    """Error to indicate invalid ADSB data format."""


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for ADSB Aircraft Tracker."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial options step - choose configuration area."""
        if user_input is not None:
            if user_input.get("config_area") == "basic":
                return await self.async_step_basic_settings()
            else:
                return await self.async_step_notifications_settings()

        schema = vol.Schema({
            vol.Required("config_area", default="basic"): vol.In({
                "basic": "📊 Basic Settings (connection, updates, range)",
                "notifications": "🔔 Notifications & Alerts"
            })
        })

        current_host = self.config_entry.data.get(CONF_ADSB_HOST, "unknown")
        current_port = self.config_entry.data.get(CONF_ADSB_PORT, DEFAULT_ADSB_PORT)

        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            description_placeholders={
                "current_host": current_host,
                "current_port": str(current_port),
            },
        )

    async def async_step_basic_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle basic connection and data settings."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Convert distance back to miles for storage if user is using metric
            if self.hass.config.units.length == "km" and user_input.get(CONF_DISTANCE_LIMIT, 0) > 0:
                user_input[CONF_DISTANCE_LIMIT] = int(user_input[CONF_DISTANCE_LIMIT] / 1.60934)

            # Update config entry with new options
            return self.async_create_entry(
                title="",
                data=user_input,
            )

        # Get current values from config entry
        current_data = self.config_entry.data
        current_options = self.config_entry.options

        # Get current values for display
        current_update = current_options.get(CONF_UPDATE_INTERVAL, current_data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL))
        current_distance = current_options.get(CONF_DISTANCE_LIMIT, current_data.get(CONF_DISTANCE_LIMIT, DEFAULT_DISTANCE_LIMIT))

        # Determine distance unit based on Home Assistant's unit system
        distance_unit = "miles"
        max_distance = 1000
        if self.hass.config.units.length == "km":
            distance_unit = "kilometers"
            max_distance = 1600  # ~1000 miles in km
            # Convert current distance to km if needed (stored in miles)
            if current_distance > 0:
                current_distance = int(current_distance * 1.60934)

        basic_schema = vol.Schema(
            {
                vol.Optional(CONF_UPDATE_INTERVAL, default=current_update): vol.All(vol.Coerce(int), vol.Range(min=5, max=300)),
                vol.Optional(CONF_DISTANCE_LIMIT, default=current_distance): vol.All(vol.Coerce(int), vol.Range(min=0, max=max_distance)),
            }
        )

        return self.async_show_form(
            step_id="basic_settings",
            data_schema=basic_schema,
            errors=errors,
        )

    async def async_step_notifications_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle notification and alert settings."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Convert close aircraft distance back to miles for storage if user is using metric
            if self.hass.config.units.length == "km" and user_input.get(CONF_CLOSE_AIRCRAFT_DISTANCE, 0) > 0:
                user_input[CONF_CLOSE_AIRCRAFT_DISTANCE] = user_input[CONF_CLOSE_AIRCRAFT_DISTANCE] / 1.60934

            # Update config entry with new options
            return self.async_create_entry(
                title="",
                data=user_input,
            )

        # Get current values from config entry
        current_data = self.config_entry.data
        current_options = self.config_entry.options

        # Get notification devices
        notification_devices = self._get_notification_devices()

        # Get current values for display
        current_device = current_options.get(CONF_NOTIFICATION_DEVICE, "")
        current_url = current_options.get(CONF_EXTERNAL_URL, "")

        # Get current notification settings
        current_military = current_options.get(CONF_MILITARY_NOTIFICATIONS, current_data.get(CONF_MILITARY_NOTIFICATIONS, DEFAULT_MILITARY_NOTIFICATIONS))
        current_close_enabled = current_options.get(CONF_CLOSE_AIRCRAFT_ENABLED, current_data.get(CONF_CLOSE_AIRCRAFT_ENABLED, DEFAULT_CLOSE_AIRCRAFT_ENABLED))
        current_close_distance = current_options.get(CONF_CLOSE_AIRCRAFT_DISTANCE, current_data.get(CONF_CLOSE_AIRCRAFT_DISTANCE, DEFAULT_CLOSE_AIRCRAFT_DISTANCE))
        current_close_altitude = current_options.get(CONF_CLOSE_AIRCRAFT_ALTITUDE, current_data.get(CONF_CLOSE_AIRCRAFT_ALTITUDE, DEFAULT_CLOSE_AIRCRAFT_ALTITUDE))
        current_emergency = current_options.get(CONF_EMERGENCY_NOTIFICATIONS, current_data.get(CONF_EMERGENCY_NOTIFICATIONS, DEFAULT_EMERGENCY_NOTIFICATIONS))

        # Convert close distance for display if metric
        close_distance_display = current_close_distance
        if self.hass.config.units.length == "km":
            close_distance_display = current_close_distance * 1.60934

        notifications_schema = vol.Schema(
            {
                vol.Optional(CONF_NOTIFICATION_DEVICE, default=current_device): vol.In([""] + notification_devices),
                vol.Optional(CONF_EXTERNAL_URL, default=current_url): str,
                vol.Optional(CONF_MILITARY_NOTIFICATIONS, default=current_military): bool,
                vol.Optional(CONF_CLOSE_AIRCRAFT_ENABLED, default=current_close_enabled): bool,
                vol.Optional(CONF_CLOSE_AIRCRAFT_DISTANCE, default=close_distance_display): vol.All(vol.Coerce(float), vol.Range(min=0.1, max=50)),
                vol.Optional(CONF_CLOSE_AIRCRAFT_ALTITUDE, default=current_close_altitude): vol.All(vol.Coerce(int), vol.Range(min=100, max=10000)),
                vol.Optional(CONF_EMERGENCY_NOTIFICATIONS, default=current_emergency): bool,
            }
        )

        return self.async_show_form(
            step_id="notifications_settings",
            data_schema=notifications_schema,
            errors=errors,
        )

    def _get_notification_devices(self) -> list[str]:
        """Get available mobile app notification devices."""
        devices = []
        
        # Look for mobile_app services
        for domain, services in self.hass.services.async_services().items():
            if domain == "notify":
                for service_name in services:
                    if service_name.startswith("mobile_app_"):
                        devices.append(service_name)
        
        return sorted(devices)