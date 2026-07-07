"""Config flow for BOM."""
from __future__ import annotations

import logging
from typing import Any

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant import config_entries, exceptions
from homeassistant.const import CONF_LATITUDE, CONF_LONGITUDE
from homeassistant.core import HomeAssistant, callback

from .const import (
    CONF_ENTITY_PREFIX,
    CONF_FORECASTS_CREATE,
    CONF_FORECASTS_DAYS,
    CONF_FORECASTS_MONITORED,
    CONF_OBSERVATIONS_CREATE,
    CONF_OBSERVATIONS_MONITORED,
    CONF_WARNINGS_CREATE,
    CONF_WARNINGS_MONITORED,
    CONF_WEATHER_NAME,
    DEFAULT_FORECAST_DAYS,
    DOMAIN,
    OBSERVATION_SENSOR_TYPES,
    FORECAST_SENSOR_TYPES,
    WARNING_TYPES,
)
from .PyBoM.collector import Collector

_LOGGER = logging.getLogger(__name__)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for BOM."""

    VERSION = 2

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        return BomOptionsFlow(config_entry)

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the initial step."""
        # Build schema with postcode option (uses BOM API postcode search)
        data_schema = vol.Schema(
            {
                vol.Required(CONF_LATITUDE, default=self.hass.config.latitude): float,
                vol.Required(CONF_LONGITUDE, default=self.hass.config.longitude): float,
                vol.Optional("use_postcode", default=False): bool,
                vol.Optional("postcode"): cv.string,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                latitude = user_input.get(CONF_LATITUDE)
                longitude = user_input.get(CONF_LONGITUDE)
                use_postcode = user_input.get("use_postcode", False)
                postcode = user_input.get("postcode")

                # If use_postcode is checked and postcode is provided, query BOM API for locations
                if use_postcode:
                    if postcode and postcode.strip():
                        # Query BOM API for locations in this postcode
                        import aiohttp
                        try:
                            async with aiohttp.ClientSession() as session:
                                url = f"https://api.weather.bom.gov.au/v1/locations?search={postcode.strip()}"
                                headers = {"User-Agent": "MakeThisAPIOpenSource/1.0.0"}
                                async with session.get(url, headers=headers) as resp:
                                    if resp.status == 200:
                                        result = await resp.json()
                                        locations = result.get("data", [])

                                        if not locations:
                                            _LOGGER.debug(f"No locations found for postcode: {postcode}")
                                            errors["base"] = "invalid_postcode"
                                        elif len(locations) == 1:
                                            # Only one location, use it directly
                                            location = locations[0]
                                            self.postcode_location = location
                                            # Store postcode for later use
                                            self.postcode = postcode.strip()
                                            # Move to weather_name step (will extract coords from geohash there)
                                            return await self.async_step_weather_name()
                                        else:
                                            # Multiple locations, let user choose
                                            self.postcode_locations = locations
                                            self.postcode = postcode.strip()
                                            return await self.async_step_select_location()
                                    else:
                                        _LOGGER.debug(f"BOM API returned status {resp.status} for postcode: {postcode}")
                                        errors["base"] = "invalid_postcode"
                        except Exception as e:
                            _LOGGER.exception(f"Error querying BOM API for postcode {postcode}: {e}")
                            errors["base"] = "cannot_connect"
                    else:
                        errors["base"] = "postcode_required"

                # Proceed if we have valid coordinates and no errors
                if not errors:
                    # Create the collector object with the given long. and lat.
                    self.collector = Collector(
                        float(latitude),
                        float(longitude),
                    )

                    # Save the coordinates to data
                    self.data = {
                        CONF_LATITUDE: float(latitude),
                        CONF_LONGITUDE: float(longitude),
                    }

                    # Check if location is valid
                    await self.collector.get_locations_data()
                    if self.collector.locations_data is None:
                        _LOGGER.debug(f"Unsupported Lat/Lon")
                        errors["base"] = "bad_location"
                    else:
                        # Populate observations and daily forecasts data
                        await self.collector.async_update()

                        # Move onto the next step of the config flow
                        return await self.async_step_weather_name()

            except ValueError:
                _LOGGER.exception("Invalid coordinates")
                errors["base"] = "invalid_coords"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    async def async_step_select_location(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle location selection when multiple locations found for postcode."""
        # Build a list of location names for the dropdown
        location_options = {
            loc["id"]: f"{loc['name']} ({loc['state']})"
            for loc in self.postcode_locations
        }

        data_schema = vol.Schema(
            {
                vol.Required("location_id"): vol.In(location_options),
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Find the selected location
                selected_id = user_input["location_id"]
                selected_location = next(
                    loc for loc in self.postcode_locations if loc["id"] == selected_id
                )
                self.postcode_location = selected_location

                # Move to weather_name step
                return await self.async_step_weather_name()

            except Exception:
                _LOGGER.exception("Error selecting location")
                errors["base"] = "unknown"

        # Show form with location dropdown
        return self.async_show_form(
            step_id="select_location",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={"postcode": self.postcode},
        )

    async def async_step_weather_name(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the entity prefix configuration step."""
        # If coming from postcode flow, create the collector using BOM location data
        if hasattr(self, 'postcode_location') and not hasattr(self, 'collector'):
            location = self.postcode_location
            geohash = location["geohash"]

            # Decode geohash to get lat/lon
            from .PyBoM.helpers import geohash_decode
            latitude, longitude = geohash_decode(geohash)

            # Create collector with BOM's geohash (not calculated)
            self.collector = Collector(
                float(latitude),
                float(longitude),
                geohash=geohash  # Pass BOM's geohash directly
            )

            # Save the coordinates to data
            self.data = {
                CONF_LATITUDE: float(latitude),
                CONF_LONGITUDE: float(longitude),
            }

            # Fetch location data to populate collector
            await self.collector.get_locations_data()
            if self.collector.locations_data is None:
                _LOGGER.error(f"Failed to get location data for geohash {geohash}")
                return self.async_abort(reason="bad_location")

            # Populate observations and daily forecasts data
            await self.collector.async_update()

            # Debug: Check what we got
            _LOGGER.info(f"Postcode flow - Location: {location['name']}, Geohash: {geohash}")
            _LOGGER.info(f"Observations available: {self.collector.observations_data is not None}")
            if self.collector.observations_data and "data" in self.collector.observations_data:
                station = self.collector.observations_data["data"].get("station")
                _LOGGER.info(f"Station data: {station}")

        # Check if observations are available
        self.has_observations = False
        if self.collector.observations_data and "data" in self.collector.observations_data:
            station = self.collector.observations_data["data"].get("station")
            if station:
                self.has_observations = True

        # Get location information from BOM API
        # Use postcode_location name if coming from postcode flow, otherwise use collector's location name
        if hasattr(self, 'postcode_location'):
            location_name = self.postcode_location["name"]
        else:
            location_name = self.collector.locations_data["data"]["name"]

        # Store location_name for use in async_create_entry
        self.location_name = location_name

        # Generate default entity prefix from location name
        default_prefix = f"BoM_{location_name.lower().replace(' ', '_').replace('-', '_')}"

        # Build description with station information
        if not self.has_observations:
            # No observation station - show limited availability message
            description_placeholders = {
                "location_name": location_name,
                "default_prefix": default_prefix,
                "station_name": "None (forecasts and warnings only)",
                "station_id": "N/A",
            }
        else:
            description_placeholders = {
                "location_name": location_name,
                "default_prefix": default_prefix,
                "station_name": "Unknown",
                "station_id": "Unknown",
            }

            # Try to get station name from observations if available
            if self.collector.observations_data and "data" in self.collector.observations_data:
                station_data = self.collector.observations_data["data"].get("station", {})
                if station_data:
                    description_placeholders["station_name"] = station_data.get("name", "Unknown")
                    description_placeholders["station_id"] = station_data.get("bom_id", "Unknown")

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_ENTITY_PREFIX,
                    default=default_prefix,
                ): str,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Save the entity prefix and use location name from API
                self.data[CONF_ENTITY_PREFIX] = user_input[CONF_ENTITY_PREFIX]
                self.data[CONF_WEATHER_NAME] = location_name  # Use API location name

                return await self.async_step_sensors_create()

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="weather_name",
            data_schema=data_schema,
            errors=errors,
            description_placeholders=description_placeholders,
        )

    async def async_step_sensors_create(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle sensor type selection step."""
        # Default observations to False if no observation station available
        observations_default = getattr(self, 'has_observations', True)

        data_schema = vol.Schema(
            {
                vol.Required(CONF_OBSERVATIONS_CREATE, default=observations_default): bool,
                vol.Required(CONF_FORECASTS_CREATE, default=True): bool,
                vol.Required(CONF_WARNINGS_CREATE, default=True): bool,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Save the user input into self.data so it's retained
                self.data.update(user_input)

                # Move onto the next step of the config flow
                if self.data[CONF_OBSERVATIONS_CREATE]:
                    return await self.async_step_observations_monitored()
                elif self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                elif self.data[CONF_WARNINGS_CREATE]:
                    return await self.async_step_warnings_monitored()
                else:
                    return self.async_create_entry(
                        title=self.location_name,
                        data=self.data,
                    )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="sensors_create", data_schema=data_schema, errors=errors
        )

    async def async_step_observations_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the observations monitored step."""
        # Build schema with individual checkboxes for each sensor
        schema_dict = {}
        for sensor in OBSERVATION_SENSOR_TYPES:
            schema_dict[vol.Optional(sensor.key, default=True)] = bool

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Convert checkbox selections to list of selected sensors
                selected_sensors = [key for key, value in user_input.items() if value is True]
                self.data[CONF_OBSERVATIONS_MONITORED] = selected_sensors

                # Move onto the next step of the config flow
                # Warnings before forecasts
                if self.data[CONF_WARNINGS_CREATE]:
                    return await self.async_step_warnings_monitored()
                elif self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                else:
                    return self.async_create_entry(
                        title=self.location_name,
                        data=self.data,
                    )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="observations_monitored", data_schema=data_schema, errors=errors
        )

    async def async_step_forecasts_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the forecasts monitored step."""
        # Build schema with individual checkboxes for each forecast sensor
        schema_dict = {}
        for sensor in FORECAST_SENSOR_TYPES:
            schema_dict[vol.Optional(sensor.key, default=True)] = bool

        # Add number of forecast days as a numeric input (0-7)
        schema_dict[vol.Required(CONF_FORECASTS_DAYS, default=5)] = vol.All(
            vol.Coerce(int), vol.Range(min=0, max=7)
        )

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Extract forecast days
                forecast_days = user_input.pop(CONF_FORECASTS_DAYS)

                # Convert checkbox selections to list of selected sensors
                selected_sensors = [key for key, value in user_input.items() if value is True]

                # Save to data
                self.data[CONF_FORECASTS_MONITORED] = selected_sensors
                # Convert integer to list of days (0 to forecast_days)
                self.data[CONF_FORECASTS_DAYS] = list(range(0, forecast_days + 1))

                # Forecasts is the last step
                return self.async_create_entry(
                    title=self.location_name, data=self.data
                )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="forecasts_monitored", data_schema=data_schema, errors=errors
        )

    async def async_step_warnings_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the warnings monitored step."""
        # Build schema with individual checkboxes for each warning type
        schema_dict = {}
        for warning_type, warning_info in WARNING_TYPES.items():
            schema_dict[vol.Optional(warning_type, default=True)] = bool

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Convert checkbox selections to list of selected warning types
                selected_warnings = [key for key, value in user_input.items() if value is True]
                self.data[CONF_WARNINGS_MONITORED] = selected_warnings

                # Forecasts come last
                if self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                return self.async_create_entry(
                    title=self.location_name, data=self.data
                )
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="warnings_monitored", data_schema=data_schema, errors=errors
        )


class BomOptionsFlow(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialise the options flow."""
        super().__init__()
        self.data = {}

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the initial step."""
        # Build schema with postcode option (uses BOM API postcode search)
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_LATITUDE,
                    default=self.config_entry.options.get(
                        CONF_LATITUDE,
                        self.config_entry.data.get(
                            CONF_LATITUDE, self.hass.config.latitude
                        ),
                    ),
                ): float,
                vol.Required(
                    CONF_LONGITUDE,
                    default=self.config_entry.options.get(
                        CONF_LONGITUDE,
                        self.config_entry.data.get(
                            CONF_LONGITUDE, self.hass.config.longitude
                        ),
                    ),
                ): float,
                vol.Optional("use_postcode", default=False): bool,
                vol.Optional("postcode"): cv.string,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                latitude = user_input.get(CONF_LATITUDE)
                longitude = user_input.get(CONF_LONGITUDE)
                use_postcode = user_input.get("use_postcode", False)
                postcode = user_input.get("postcode")

                # If use_postcode is checked and postcode is provided, query BOM API for locations
                if use_postcode:
                    if postcode and postcode.strip():
                        # Query BOM API for locations in this postcode
                        import aiohttp
                        try:
                            async with aiohttp.ClientSession() as session:
                                url = f"https://api.weather.bom.gov.au/v1/locations?search={postcode.strip()}"
                                headers = {"User-Agent": "MakeThisAPIOpenSource/1.0.0"}
                                async with session.get(url, headers=headers) as resp:
                                    if resp.status == 200:
                                        result = await resp.json()
                                        locations = result.get("data", [])

                                        if not locations:
                                            _LOGGER.debug(f"No locations found for postcode: {postcode}")
                                            errors["base"] = "invalid_postcode"
                                        elif len(locations) == 1:
                                            # Only one location, use it directly
                                            location = locations[0]
                                            self.postcode_location = location
                                            self.postcode = postcode.strip()
                                            return await self.async_step_weather_name()
                                        else:
                                            # Multiple locations, let user choose
                                            self.postcode_locations = locations
                                            self.postcode = postcode.strip()
                                            return await self.async_step_select_location()
                                    else:
                                        _LOGGER.debug(f"BOM API returned status {resp.status} for postcode: {postcode}")
                                        errors["base"] = "invalid_postcode"
                        except Exception as e:
                            _LOGGER.exception(f"Error querying BOM API for postcode {postcode}: {e}")
                            errors["base"] = "cannot_connect"
                    else:
                        errors["base"] = "postcode_required"

                # Proceed with lat/lon if not using postcode
                if not errors and not use_postcode:
                    # Create the collector object with the given long. and lat.
                    self.collector = Collector(
                        user_input[CONF_LATITUDE],
                        user_input[CONF_LONGITUDE],
                    )

                    # Save the user input into self.data so it's retained
                    self.data = user_input

                    # Check if location is valid
                    await self.collector.get_locations_data()
                    if self.collector.locations_data is None:
                        _LOGGER.debug(f"Unsupported Lat/Lon")
                        errors["base"] = "bad_location"
                    else:
                        # Populate observations and daily forecasts data
                        await self.collector.async_update()

                        # Move onto the next step of the config flow
                        return await self.async_step_weather_name()

            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="init", data_schema=data_schema, errors=errors
        )

    async def async_step_select_location(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle location selection when multiple locations found for postcode."""
        # Build a list of location names for the dropdown
        location_options = {
            loc["id"]: f"{loc['name']} ({loc['state']})"
            for loc in self.postcode_locations
        }

        data_schema = vol.Schema(
            {
                vol.Required("location_id"): vol.In(location_options),
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Find the selected location
                selected_id = user_input["location_id"]
                selected_location = next(
                    loc for loc in self.postcode_locations if loc["id"] == selected_id
                )
                self.postcode_location = selected_location

                # Move to weather_name step
                return await self.async_step_weather_name()

            except Exception:
                _LOGGER.exception("Error selecting location")
                errors["base"] = "unknown"

        # Show form with location dropdown
        return self.async_show_form(
            step_id="select_location",
            data_schema=data_schema,
            errors=errors,
            description_placeholders={"postcode": self.postcode},
        )

    async def async_step_weather_name(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the entity prefix configuration step."""
        # If coming from postcode flow, create the collector using BOM location data
        if hasattr(self, 'postcode_location') and not hasattr(self, 'collector'):
            location = self.postcode_location
            geohash = location["geohash"]

            # Decode geohash to get lat/lon
            from .PyBoM.helpers import geohash_decode
            latitude, longitude = geohash_decode(geohash)

            # Create collector with BOM's geohash (not calculated)
            self.collector = Collector(
                float(latitude),
                float(longitude),
                geohash=geohash  # Pass BOM's geohash directly
            )

            # Save the coordinates to data
            self.data = {
                CONF_LATITUDE: float(latitude),
                CONF_LONGITUDE: float(longitude),
            }

            # Fetch location data to populate collector
            await self.collector.get_locations_data()
            if self.collector.locations_data is None:
                _LOGGER.error(f"Failed to get location data for geohash {geohash}")
                return self.async_abort(reason="bad_location")

            # Populate observations and daily forecasts data
            await self.collector.async_update()

        # Get location information from BOM API
        # Use postcode_location name if coming from postcode flow
        # Otherwise, preserve existing location name from config entry
        if hasattr(self, 'postcode_location'):
            location_name = self.postcode_location["name"]
        else:
            # Preserve existing location name - don't overwrite with collector's name
            location_name = self.config_entry.options.get(
                CONF_WEATHER_NAME,
                self.config_entry.data.get(CONF_WEATHER_NAME, "Unknown")
            )

        # Store location_name for use in async_create_entry
        self.location_name = location_name

        # Get existing entity prefix, or generate default from location name
        existing_prefix = self.config_entry.options.get(
            CONF_ENTITY_PREFIX,
            self.config_entry.data.get(CONF_ENTITY_PREFIX)
        )
        default_prefix = existing_prefix if existing_prefix else f"bom_{location_name.lower().replace(' ', '_').replace('-', '_')}"

        # Build description with station information
        description_placeholders = {
            "location_name": location_name,
            "default_prefix": default_prefix,
        }

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_ENTITY_PREFIX,
                    default=self.config_entry.options.get(
                        CONF_ENTITY_PREFIX,
                        self.config_entry.data.get(
                            CONF_ENTITY_PREFIX,
                            default_prefix,
                        ),
                    ),
                ): str,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Save the entity prefix and location name
                self.data[CONF_ENTITY_PREFIX] = user_input[CONF_ENTITY_PREFIX]
                self.data[CONF_WEATHER_NAME] = location_name  # Preserve existing or use new from postcode search

                return await self.async_step_sensors_create()

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="weather_name",
            data_schema=data_schema,
            errors=errors,
            description_placeholders=description_placeholders,
        )

    async def async_step_sensors_create(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the observations step."""
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_OBSERVATIONS_CREATE,
                    default=self.config_entry.options.get(
                        CONF_OBSERVATIONS_CREATE,
                        self.config_entry.data.get(CONF_OBSERVATIONS_CREATE, True),
                    ),
                ): bool,
                vol.Required(
                    CONF_FORECASTS_CREATE,
                    default=self.config_entry.options.get(
                        CONF_FORECASTS_CREATE,
                        self.config_entry.data.get(CONF_FORECASTS_CREATE, True),
                    ),
                ): bool,
                vol.Required(
                    CONF_WARNINGS_CREATE,
                    default=self.config_entry.options.get(
                        CONF_WARNINGS_CREATE,
                        self.config_entry.data.get(CONF_WARNINGS_CREATE, True),
                    ),
                ): bool,
            }
        )

        errors = {}
        if user_input is not None:
            try:
                # Save the user input into self.data so it's retained
                self.data.update(user_input)

                # Move onto the next step of the config flow
                # Order: observations → warnings → forecasts (last)
                if self.data[CONF_OBSERVATIONS_CREATE]:
                    return await self.async_step_observations_monitored()
                elif self.data[CONF_WARNINGS_CREATE]:
                    return await self.async_step_warnings_monitored()
                elif self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                else:
                    return self.async_create_entry(
                        title=self.location_name,
                        data=self.data,
                    )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="sensors_create", data_schema=data_schema, errors=errors
        )

    async def async_step_observations_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the observations monitored step."""
        # Get current selections
        current_selections = self.config_entry.options.get(
            CONF_OBSERVATIONS_MONITORED,
            self.config_entry.data.get(CONF_OBSERVATIONS_MONITORED, [])
        )

        # Build schema with individual checkboxes for each sensor
        schema_dict = {}
        for sensor in OBSERVATION_SENSOR_TYPES:
            default_value = sensor.key in current_selections if current_selections else True
            schema_dict[vol.Optional(sensor.key, default=default_value)] = bool

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Convert checkbox selections to list of selected sensors
                selected_sensors = [key for key, value in user_input.items() if value is True]
                self.data[CONF_OBSERVATIONS_MONITORED] = selected_sensors

                # Move onto the next step of the config flow
                # Warnings before forecasts
                if self.data[CONF_WARNINGS_CREATE]:
                    return await self.async_step_warnings_monitored()
                elif self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                else:
                    return self.async_create_entry(
                        title=self.location_name,
                        data=self.data,
                    )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="observations_monitored", data_schema=data_schema, errors=errors
        )

    async def async_step_forecasts_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the forecasts monitored step."""
        # Get current selections
        current_selections = self.config_entry.options.get(
            CONF_FORECASTS_MONITORED,
            self.config_entry.data.get(CONF_FORECASTS_MONITORED, [])
        )
        current_days = self.config_entry.options.get(
            CONF_FORECASTS_DAYS,
            self.config_entry.data.get(CONF_FORECASTS_DAYS, [0, 1, 2, 3, 4, 5])
        )
        # Convert list to max day number
        default_days = max(current_days) if isinstance(current_days, list) and current_days else 5

        # Build schema with individual checkboxes for each forecast sensor
        schema_dict = {}
        for sensor in FORECAST_SENSOR_TYPES:
            default_value = sensor.key in current_selections if current_selections else True
            schema_dict[vol.Optional(sensor.key, default=default_value)] = bool

        # Add number of forecast days as a numeric input (0-7)
        schema_dict[vol.Required(CONF_FORECASTS_DAYS, default=default_days)] = vol.All(
            vol.Coerce(int), vol.Range(min=0, max=7)
        )

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Extract forecast days
                forecast_days = user_input.pop(CONF_FORECASTS_DAYS)

                # Convert checkbox selections to list of selected sensors
                selected_sensors = [key for key, value in user_input.items() if value is True]

                # Save to data
                self.data[CONF_FORECASTS_MONITORED] = selected_sensors
                # Convert integer to list of days (0 to forecast_days)
                self.data[CONF_FORECASTS_DAYS] = list(range(0, forecast_days + 1))

                # Forecasts is the last step
                return self.async_create_entry(
                    title=self.location_name, data=self.data
                )

            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="forecasts_monitored", data_schema=data_schema, errors=errors
        )

    async def async_step_warnings_monitored(self, user_input: dict[str, Any] | None = None) -> Any:
        """Handle the warnings monitored step."""
        # Get current selections
        current_selections = self.config_entry.options.get(
            CONF_WARNINGS_MONITORED,
            self.config_entry.data.get(CONF_WARNINGS_MONITORED, list(WARNING_TYPES.keys()))
        )

        # Build schema with individual checkboxes for each warning type
        schema_dict = {}
        for warning_type, warning_info in WARNING_TYPES.items():
            default_value = warning_type in current_selections if current_selections else True
            schema_dict[vol.Optional(warning_type, default=default_value)] = bool

        data_schema = vol.Schema(schema_dict)

        errors = {}
        if user_input is not None:
            try:
                # Convert checkbox selections to list of selected warning types
                selected_warnings = [key for key, value in user_input.items() if value is True]
                self.data[CONF_WARNINGS_MONITORED] = selected_warnings

                # Forecasts come last
                if self.data[CONF_FORECASTS_CREATE]:
                    return await self.async_step_forecasts_monitored()
                return self.async_create_entry(
                    title=self.location_name, data=self.data
                )
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"

        # If there is no user input or there were errors, show the form again, including any errors that were found with the input.
        return self.async_show_form(
            step_id="warnings_monitored", data_schema=data_schema, errors=errors
        )


class CannotConnect(exceptions.HomeAssistantError):
    """Error to indicate we cannot connect."""
