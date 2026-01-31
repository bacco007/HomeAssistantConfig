"""Config flow for NSW Fire Danger Ratings integration."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp
import async_timeout
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError

_LOGGER = logging.getLogger(__name__)

DOMAIN = "nsw_fire_danger"
API_URL = "https://www.rfs.nsw.gov.au/_designs/xml/fire-danger-ratings/fire-danger-ratings-v2"

# All available NSW RFS fire weather areas
FIRE_AREAS = {
    "1": "Far North Coast",
    "2": "North Coast",
    "3": "Greater Hunter",
    "4": "Greater Sydney Region",
    "5": "Illawarra/Shoalhaven",
    "6": "Far South Coast",
    "7": "Monaro Alpine",
    "8": "ACT",
    "9": "Southern Ranges",
    "10": "Central Ranges",
    "11": "New England",
    "12": "Northern Slopes",
    "13": "North Western",
    "14": "Upper Central West Plains",
    "15": "Lower Central West Plains",
    "16": "Southern Slopes",
    "17": "Eastern Riverina",
    "18": "Southern Riverina",
    "19": "Northern Riverina",
    "20": "South Western",
    "21": "Far Western",
}


async def validate_api(hass: HomeAssistant, area_id: str) -> dict[str, Any]:
    """Validate that the API is accessible and the area exists."""
    try:
        async with async_timeout.timeout(15):
            headers = {
                "User-Agent": "HomeAssistant/NSWFireDanger",
                "Accept": "application/json, text/html",
            }
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(API_URL) as response:
                    if response.status != 200:
                        _LOGGER.error(f"API returned status {response.status}")
                        raise CannotConnect(f"API returned status {response.status}")
                    
                    # Read as text first, then parse as JSON
                    text = await response.text()
                    try:
                        data = await response.json(content_type=None)
                    except Exception:
                        # Try parsing the text we got
                        import json
                        data = json.loads(text)
                    
                    # Check if our area exists in the response
                    fire_areas = data.get("fireWeatherAreaRatings", [])
                    if not fire_areas:
                        _LOGGER.error("No fire weather areas in API response")
                        raise CannotConnect("No fire weather areas in API response")
                    
                    for area in fire_areas:
                        if area.get("areaId") == area_id:
                            return {
                                "area_name": area.get("areaName"),
                                "area_councils": area.get("areaCouncils", ""),
                            }
                    
                    raise InvalidArea(f"Area ID {area_id} not found in API response")
    except aiohttp.ClientError as err:
        _LOGGER.error(f"ClientError connecting to API: {err}")
        raise CannotConnect(f"Cannot connect to API: {err}")
    except asyncio.TimeoutError:
        _LOGGER.error("Timeout connecting to API")
        raise CannotConnect("Timeout connecting to API")
    except Exception as err:
        _LOGGER.exception(f"Unexpected exception validating API: {err}")
        raise CannotConnect(f"Unexpected error: {err}")


class NSWFireDangerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for NSW Fire Danger Ratings."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            area_id = user_input["area"]
            
            try:
                info = await validate_api(self.hass, area_id)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidArea:
                errors["base"] = "invalid_area"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                # Create a unique ID based on the area
                await self.async_set_unique_id(f"nsw_fire_danger_{area_id}")
                self._abort_if_unique_id_configured()
                
                return self.async_create_entry(
                    title=f"NSW Fire Danger - {info['area_name']}",
                    data={
                        "area": area_id,
                        "area_name": info["area_name"],
                    },
                )

        # Show the form with a dropdown selector
        data_schema = vol.Schema(
            {
                vol.Required("area", default="4"): vol.In(
                    {k: f"{v} (ID: {k})" for k, v in FIRE_AREAS.items()}
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
        )


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidArea(HomeAssistantError):
    """Error to indicate the area is invalid."""
