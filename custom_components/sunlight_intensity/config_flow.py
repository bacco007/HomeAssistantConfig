"""Config flow for Sunlight Intensity integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

def get_default_location(hass: HomeAssistant) -> tuple[float, float]:
    """Get default latitude and longitude from Home Assistant configuration."""
    # Get latitude and longitude from Home Assistant's configuration
    latitude = hass.config.latitude or 0.0
    longitude = hass.config.longitude or 0.0
    return latitude, longitude

def create_user_schema(hass: HomeAssistant) -> vol.Schema:
    """Create the user schema with default values from Home Assistant."""
    latitude, longitude = get_default_location(hass)
    
    return vol.Schema(
        {
            vol.Required("latitude", default=latitude): vol.Coerce(float),
            vol.Required("longitude", default=longitude): vol.Coerce(float),
            vol.Required("house_angle", default=0.0): vol.Coerce(float),
        }
    )

async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""
    
    # Validate latitude
    if not -90 <= data["latitude"] <= 90:
        raise InvalidLatitude
    
    # Validate longitude
    if not -180 <= data["longitude"] <= 180:
        raise InvalidLongitude
    
    # Validate house angle
    if not 0 <= data["house_angle"] <= 360:
        raise InvalidHouseAngle

    # Return info that you want to store in the config entry.
    return {"title": f"Sun Wall Intensity ({data['latitude']}, {data['longitude']})"}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Sun Wall Intensity."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except InvalidLatitude:
                errors["latitude"] = "invalid_latitude"
            except InvalidLongitude:
                errors["longitude"] = "invalid_longitude"
            except InvalidHouseAngle:
                errors["house_angle"] = "invalid_house_angle"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title=info["title"], data=user_input)

        # Create schema with Home Assistant's location as defaults
        user_schema = create_user_schema(self.hass)
        
        return self.async_show_form(
            step_id="user", data_schema=user_schema, errors=errors
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle reconfiguration of the integration."""
        errors: dict[str, str] = {}
        
        # Get current config entry data
        config_entry = self._get_reconfigure_entry()
        current_data = config_entry.data
        
        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except InvalidLatitude:
                errors["latitude"] = "invalid_latitude"
            except InvalidLongitude:
                errors["longitude"] = "invalid_longitude"
            except InvalidHouseAngle:
                errors["house_angle"] = "invalid_house_angle"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                # Update the existing config entry with new data
                return self.async_update_reload_and_abort(
                    config_entry,
                    data=user_input,
                    reason="reconfigure_successful"
                )
        
        # Create schema with current values as defaults
        reconfigure_schema = vol.Schema(
            {
                vol.Required("latitude", default=current_data.get("latitude", 0.0)): vol.Coerce(float),
                vol.Required("longitude", default=current_data.get("longitude", 0.0)): vol.Coerce(float),
                vol.Required("house_angle", default=current_data.get("house_angle", 0.0)): vol.Coerce(float),
            }
        )
        
        return self.async_show_form(
            step_id="reconfigure", 
            data_schema=reconfigure_schema, 
            errors=errors
        )


class InvalidLatitude(HomeAssistantError):
    """Error to indicate latitude is invalid."""


class InvalidLongitude(HomeAssistantError):
    """Error to indicate longitude is invalid."""


class InvalidHouseAngle(HomeAssistantError):
    """Error to indicate house angle is invalid."""
