"""Platform for sensor integration."""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Final

import iso8601
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.sensor import SensorDeviceClass
from homeassistant.const import (
    ATTR_ATTRIBUTION,
    ATTR_DATE,
    ATTR_STATE,
)
from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo, Entity, EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from zoneinfo import ZoneInfo

from . import BomDataUpdateCoordinator
from .const import (
    ATTRIBUTION,
    COLLECTOR,
    CONF_ENTITY_PREFIX,
    CONF_FORECASTS_CREATE,
    CONF_FORECASTS_DAYS,
    CONF_FORECASTS_MONITORED,
    CONF_OBSERVATIONS_CREATE,
    CONF_OBSERVATIONS_MONITORED,
    CONF_WEATHER_NAME,
    COORDINATOR,
    DOMAIN,
    SHORT_ATTRIBUTION,
    MODEL_NAME,
    OBSERVATION_SENSOR_TYPES,
    FORECAST_SENSOR_TYPES,
    ATTR_API_NOW_LABEL,
    ATTR_API_TEMP_NOW,
    ATTR_API_LATER_LABEL,
    ATTR_API_TEMP_LATER,
    ATTR_API_CONDITION,
    ATTR_API_EXTENDED_TEXT,
    ATTR_API_FIRE_DANGER,
    MAP_CONDITION,
    CONDITION_FRIENDLY,
)
from .PyBoM.collector import Collector

_LOGGER = logging.getLogger(__name__)

MAX_STATE_LENGTH: Final[int] = 251  # Maximum length for sensor state before truncation


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Add sensors for passed config_entry in HA."""
    hass_data = hass.data[DOMAIN][config_entry.entry_id]

    new_entities = []
    create_observations = config_entry.options.get(
        CONF_OBSERVATIONS_CREATE, config_entry.data.get(CONF_OBSERVATIONS_CREATE)
    )
    create_forecasts = config_entry.options.get(
        CONF_FORECASTS_CREATE, config_entry.data.get(CONF_FORECASTS_CREATE)
    )

    # Get location name and entity prefix (shared across all sensors)
    location_name = config_entry.options.get(
        CONF_WEATHER_NAME, config_entry.data.get(CONF_WEATHER_NAME, "Home")
    )
    entity_prefix = config_entry.options.get(
        CONF_ENTITY_PREFIX,
        config_entry.data.get(
            CONF_ENTITY_PREFIX,
            f"bom_{location_name.lower().replace(' ', '_').replace('-', '_')}"
        )
    )

    if create_observations is True:
        observations = config_entry.options.get(
            CONF_OBSERVATIONS_MONITORED,
            config_entry.data.get(CONF_OBSERVATIONS_MONITORED, None),
        )

        for observation in observations:
            new_entities.append(
                ObservationSensor(
                    hass_data,
                    location_name,
                    entity_prefix,
                    observation,
                    [
                        description
                        for description in OBSERVATION_SENSOR_TYPES
                        if description.key == observation
                    ][0],
                )
            )

    if create_forecasts is True:
        forecast_days = config_entry.options.get(
            CONF_FORECASTS_DAYS, config_entry.data.get(CONF_FORECASTS_DAYS, [])
        )
        forecasts_monitored = config_entry.options.get(
            CONF_FORECASTS_MONITORED, config_entry.data.get(CONF_FORECASTS_MONITORED)
        )

        # Ensure forecast_days is a list
        if isinstance(forecast_days, int):
            # Legacy support: convert old integer format to list
            forecast_days = list(range(0, forecast_days + 1))
        elif not isinstance(forecast_days, list):
            forecast_days = []

        for day in forecast_days:
            for forecast in forecasts_monitored:
                if forecast in [
                    ATTR_API_NOW_LABEL,
                    ATTR_API_TEMP_NOW,
                    ATTR_API_LATER_LABEL,
                    ATTR_API_TEMP_LATER,
                ]:
                    if day == 0:
                        new_entities.append(
                            NowLaterSensor(
                                hass_data,
                                location_name,
                                entity_prefix,
                                forecast,
                                [
                                    description
                                    for description in FORECAST_SENSOR_TYPES
                                    if description.key == forecast
                                ][0],
                            )
                        )
                else:
                    # Limit extended_text and fire_danger to 4 days (0-3) as API data is not available beyond that
                    if forecast in [ATTR_API_EXTENDED_TEXT, ATTR_API_FIRE_DANGER] and day >= 4:
                        continue
                    new_entities.append(
                        ForecastSensor(
                            hass_data,
                            location_name,
                            entity_prefix,
                            day,
                            forecast,
                            [
                                description
                                for description in FORECAST_SENSOR_TYPES
                                if description.key == forecast
                            ][0],
                        )
                    )

    # Always create catch-all warnings sensor (shows all warnings, even unknown types)
    new_entities.append(
        WarningsSensor(
            hass_data,
            location_name,
            entity_prefix,
        )
    )

    # Note: Individual warning binary sensors are handled by binary_sensor platform
    # See binary_sensor.py for warning binary sensor implementation

    if new_entities:
        async_add_entities(new_entities, update_before_add=False)


class SensorBase(CoordinatorEntity[BomDataUpdateCoordinator], SensorEntity):
    """Base representation of a BOM Sensor."""

    def __init__(self, hass_data, location_name, entity_prefix, sensor_name, description: SensorEntityDescription, device_type: str = "Sensors") -> None:
        """Initialize the sensor."""
        super().__init__(hass_data[COORDINATOR])
        self.collector: Collector = hass_data[COLLECTOR]
        self.coordinator: BomDataUpdateCoordinator = hass_data[COORDINATOR]
        self.location_name: str = location_name
        self.entity_prefix: str = entity_prefix
        self.sensor_name: str = sensor_name
        self.current_state: Any = None
        self.entity_description = description

        # Determine device identifier suffix based on device type
        device_suffix = device_type.lower().replace(" ", "_")

        self._attr_device_info = DeviceInfo(
            entry_type=DeviceEntryType.SERVICE,
            identifiers={(DOMAIN, f"{self.entity_prefix}_{device_suffix}")},
            manufacturer=SHORT_ATTRIBUTION,
            model=MODEL_NAME,
            name=f"BOM {self.location_name} {device_type}",
        )

    async def async_added_to_hass(self) -> None:
        """Set up a listener and load data."""
        self.async_on_remove(self.coordinator.async_add_listener(self._update_callback))
        self._update_callback()

    @callback
    def _update_callback(self) -> None:
        self.async_write_ha_state()

    @property
    def should_poll(self) -> bool:
        """Entities do not individually poll."""
        return False

    async def async_update(self) -> None:
        """Refresh the data on the collector object."""
        await self.collector.async_update()


class ObservationSensor(SensorBase):
    """Representation of a BOM Observation Sensor."""

    def __init__(self, hass_data, location_name, entity_prefix, sensor_name, description: SensorEntityDescription,):
        """Initialize the sensor."""
        super().__init__(hass_data, location_name, entity_prefix, sensor_name, description, device_type="Sensors")

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return f"{self.entity_prefix}_{self.sensor_name}"

    @property
    def native_value(self) -> Any:
        """Return the state of the device."""
        # For condition sensor, use the computed state value
        if self.sensor_name == ATTR_API_CONDITION:
            return self.state
        return self.coordinator.data.get(self.entity_description.key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        attr = {}

        if not self.collector.locations_data or "data" not in self.collector.locations_data:
            return {ATTR_ATTRIBUTION: ATTRIBUTION}
        if not self.collector.observations_data or "metadata" not in self.collector.observations_data:
            return {ATTR_ATTRIBUTION: ATTRIBUTION}

        tzinfo = ZoneInfo(self.collector.locations_data["data"]["timezone"])
        for key in self.collector.observations_data["metadata"]:
            try:
                attr[key] = iso8601.parse_date(self.collector.observations_data["metadata"][key]).astimezone(tzinfo).isoformat()
            except iso8601.ParseError:
                attr[key] = self.collector.observations_data["metadata"][key]

        attr.update(self.collector.observations_data["data"]["station"])
        attr[ATTR_ATTRIBUTION] = ATTRIBUTION

        # Add extended forecast text for condition sensor
        if self.sensor_name == ATTR_API_CONDITION:
            if self.collector.daily_forecasts_data and "data" in self.collector.daily_forecasts_data:
                if len(self.collector.daily_forecasts_data["data"]) > 0:
                    extended_text = self.collector.daily_forecasts_data["data"][0].get("extended_text")
                    if extended_text:
                        attr["forecast_text"] = extended_text

        # Only proceed for max_temp or min_temp
        if self.sensor_name not in ("max_temp", "min_temp"):
            return attr
    
        # Get data safely
        data = self.collector.observations_data.get("data")
        if not data:
            return attr
    
        # Get sensor data safely
        sensor_data = data.get(self.sensor_name)
        if not sensor_data:
            return attr
    
        # Get time safely
        time_str = sensor_data.get("time")
        if not time_str:
            return attr

        # We have all required data, now add the time_observed attribute
        attr["time_observed"] = iso8601.parse_date(time_str).astimezone(tzinfo).isoformat()
        return attr

    @property
    def state(self) -> Any:
        """Return the state of the sensor."""
        # Special handling for condition sensor - use short_text from daily forecast
        if self.sensor_name == ATTR_API_CONDITION:
            if self.collector.daily_forecasts_data and "data" in self.collector.daily_forecasts_data:
                if len(self.collector.daily_forecasts_data["data"]) > 0:
                    short_text = self.collector.daily_forecasts_data["data"][0].get("short_text")
                    if short_text:
                        # Remove trailing punctuation for cleaner display
                        return short_text.rstrip(".!,;:")
            return None

        # Standard observation sensor handling
        if not self.collector.observations_data or "data" not in self.collector.observations_data:
            return None
        if self.sensor_name in self.collector.observations_data["data"]:
            if self.collector.observations_data["data"][self.sensor_name] is not None:
                if self.sensor_name == "max_temp" or self.sensor_name == "min_temp":
                    return self.collector.observations_data["data"][self.sensor_name]["value"]
                else:
                    return self.collector.observations_data["data"][self.sensor_name]
        return None

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} {self.sensor_name.replace('_', ' ').title()}"


class ForecastSensor(SensorBase):
    """Representation of a BOM Forecast Sensor."""

    def __init__(self, hass_data, location_name, entity_prefix, day, sensor_name, description: SensorEntityDescription,):
        """Initialize the sensor."""
        self.day = day
        super().__init__(hass_data, location_name, entity_prefix, sensor_name, description, device_type="Forecast Sensors")

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return f"{self.entity_prefix}_{self.day}_{self.sensor_name}"

    @property
    def native_value(self) -> Any:
        """Return the state of the device."""
        return self.coordinator.data.get(self.entity_description.key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        attr = {}

        if not self.collector.daily_forecasts_data or "data" not in self.collector.daily_forecasts_data:
            return attr
        if not self.collector.locations_data or "data" not in self.collector.locations_data:
            return attr

        # If there is no data for this day, do not add attributes for this day.
        if self.day < len(self.collector.daily_forecasts_data["data"]):
            tzinfo = ZoneInfo(self.collector.locations_data["data"]["timezone"])
            for key in self.collector.daily_forecasts_data["metadata"]:
                try:
                    attr[key] = iso8601.parse_date(self.collector.daily_forecasts_data["metadata"][key]).astimezone(tzinfo).isoformat()
                except iso8601.ParseError:
                    attr[key] = self.collector.daily_forecasts_data["metadata"][key]
            attr[ATTR_ATTRIBUTION] = ATTRIBUTION
            attr[ATTR_DATE] = iso8601.parse_date(self.collector.daily_forecasts_data["data"][self.day]["date"]).astimezone(tzinfo).isoformat()
            if (self.sensor_name == "fire_danger") and (self.current_state is not None):
                # Safely get fire_danger_category (may be null after ~4pm, but restored by coordinator)
                fire_danger_category = self.collector.daily_forecasts_data["data"][self.day].get("fire_danger_category")
                if fire_danger_category and fire_danger_category.get("default_colour"):
                    attr["color_fill"] = fire_danger_category["default_colour"]
                    attr["color_text"] = "#ffffff" if (fire_danger_category.get("text") == "Catastrophic") else "#000000"
            if self.sensor_name.startswith("extended"):
                attr[ATTR_STATE] = self.collector.daily_forecasts_data["data"][self.day]["extended_text"]
        return attr

    @property
    def state(self) -> Any:
        """Return the state of the sensor."""
        if not self.collector.daily_forecasts_data or "data" not in self.collector.daily_forecasts_data:
            return None
        if not self.collector.locations_data or "data" not in self.collector.locations_data:
            return None
        # If there is no data for this day, return state as 'None'.
        if self.day < len(self.collector.daily_forecasts_data["data"]):
            if self.device_class == SensorDeviceClass.TIMESTAMP:
                tzinfo = ZoneInfo(
                    self.collector.locations_data["data"]["timezone"]
                )
                try:
                    return iso8601.parse_date(self.collector.daily_forecasts_data["data"][self.day][self.sensor_name]).astimezone(tzinfo).isoformat()
                except iso8601.ParseError:
                    return self.collector.daily_forecasts_data["data"][self.day][self.sensor_name]
            if self.sensor_name == "uv_forecast":
                if self.collector.daily_forecasts_data["data"][self.day]["uv_category"] is None:
                    return None
                if self.collector.daily_forecasts_data["data"][self.day]["uv_start_time"] is None:
                    return (
                        f"Sun protection not required, UV Index predicted to reach "
                        f'{self.collector.daily_forecasts_data["data"][self.day]["uv_max_index"]} '
                        f'[{self.collector.daily_forecasts_data["data"][self.day]["uv_category"].replace("veryhigh", "very high").title()}]'
                    )
                else:
                    utc = timezone.utc
                    local = ZoneInfo(self.collector.locations_data["data"]["timezone"])
                    start_time = datetime.strptime(self.collector.daily_forecasts_data["data"][self.day]["uv_start_time"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=utc).astimezone(local)
                    end_time = datetime.strptime(self.collector.daily_forecasts_data["data"][self.day]["uv_end_time"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=utc).astimezone(local)
                    return (
                        f'Sun protection recommended from {start_time.strftime("%-I:%M%p").lower()} to '
                        f'{end_time.strftime("%-I:%M%p").lower()}, UV Index predicted to reach '
                        f'{self.collector.daily_forecasts_data["data"][self.day]["uv_max_index"]} '
                        f'[{self.collector.daily_forecasts_data["data"][self.day]["uv_category"].replace("veryhigh", "very high").title()}]'
                    )
            new_state = self.collector.daily_forecasts_data["data"][self.day][self.sensor_name]

            if isinstance(new_state, str) and len(new_state) > MAX_STATE_LENGTH:
                self.current_state = new_state[:MAX_STATE_LENGTH] + "..."
            else:
                self.current_state = new_state
            if (self.sensor_name == "uv_category") and (self.current_state is not None):
                self.current_state = self.current_state.replace("veryhigh", "very high").title()
            # Strip trailing period from short_text for cleaner display
            if (self.sensor_name == "short_text") and isinstance(self.current_state, str) and self.current_state.endswith("."):
                self.current_state = self.current_state.rstrip(".")
            return self.current_state
        else:
            return None

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} {self.sensor_name.replace('_', ' ').title()} {self.day}"


class NowLaterSensor(SensorBase):
    """Representation of a BOM Forecast Sensor."""

    def __init__(self, hass_data, location_name, entity_prefix, sensor_name, description: SensorEntityDescription,):
        """Initialize the sensor."""
        super().__init__(hass_data, location_name, entity_prefix, sensor_name, description, device_type="Forecast Sensors")

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return f"{self.entity_prefix}_{self.sensor_name}"

    @property
    def native_value(self) -> Any:
        """Return the state of the device."""
        return self.coordinator.data.get(self.entity_description.key)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        if not self.collector.daily_forecasts_data or "metadata" not in self.collector.daily_forecasts_data:
            return {ATTR_ATTRIBUTION: ATTRIBUTION}
        attr = dict(self.collector.daily_forecasts_data["metadata"])
        attr[ATTR_ATTRIBUTION] = ATTRIBUTION
        return attr

    @property
    def state(self) -> Any:
        """Return the state of the sensor."""
        if not self.collector.daily_forecasts_data or "data" not in self.collector.daily_forecasts_data:
            return None
        data = self.collector.daily_forecasts_data["data"]
        if not data:
            return None
        self.current_state = data[0].get(self.sensor_name)
        return self.current_state

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} {self.sensor_name.replace('_', ' ').title()}"


class WarningsSensor(SensorBase):
    """Representation of a BOM Warnings Sensor (catch-all for all warnings)."""

    def __init__(self, hass_data, location_name, entity_prefix):
        """Initialize the sensor."""
        # Create a basic description for the warnings sensor
        description = SensorEntityDescription(
            key="warnings",
            name="Warnings",
            icon="mdi:alert-circle",
        )
        super().__init__(hass_data, location_name, entity_prefix, "warnings", description, device_type="Warnings")

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return f"{self.entity_prefix}_warnings"

    @property
    def native_value(self) -> Any:
        """Return the state of the device."""
        return self.state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        attr = {}

        # Add all warnings data to attributes
        if (
            self.collector.warnings_data
            and "data" in self.collector.warnings_data
        ):
            # Include the warnings array
            attr["warnings"] = self.collector.warnings_data["data"]

            # Include metadata
            if "metadata" in self.collector.warnings_data:
                attr["response_timestamp"] = self.collector.warnings_data["metadata"].get("response_timestamp")

        attr[ATTR_ATTRIBUTION] = ATTRIBUTION
        return attr

    @property
    def state(self) -> Any:
        """Return the state of the sensor (count of active warnings)."""
        if (
            self.collector.warnings_data
            and "data" in self.collector.warnings_data
        ):
            # Return the count of warnings
            return len(self.collector.warnings_data["data"])
        return 0

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} Warnings"
