"""Platform for sensor integration."""
from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Final

from homeassistant.config_entries import ConfigEntry
from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.const import (
    ATTR_DATE,
    ATTR_STATE,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.entity import DeviceInfo
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
)
from .PyBoM.collector import Collector
from .PyBoM.helpers import parse_iso_datetime

_LOGGER = logging.getLogger(__name__)

MAX_STATE_LENGTH: Final[int] = 251  # Maximum length for sensor state before truncation


def format_short_time(value: datetime) -> str:
    """Format a time as e.g. '6:12am'.

    Avoids strftime's "%-I" hour padding modifier, which is a glibc extension
    and raises ValueError on Windows, and its locale-dependent "%p".
    """
    meridiem = "am" if value.hour < 12 else "pm"
    return f"{value.hour % 12 or 12}:{value.minute:02d}{meridiem}"


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

    _attr_attribution = ATTRIBUTION

    def __init__(self, hass_data, location_name, entity_prefix, sensor_name, description: SensorEntityDescription, device_type: str = "Sensors") -> None:
        """Initialize the sensor."""
        super().__init__(hass_data[COORDINATOR])
        self.collector: Collector = hass_data[COLLECTOR]
        self.location_name: str = location_name
        self.entity_prefix: str = entity_prefix
        self.sensor_name: str = sensor_name
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

    def _timezone(self) -> ZoneInfo | None:
        """Return the BOM location's timezone, or None when it is unavailable."""
        location = (self.collector.locations_data or {}).get("data") or {}
        timezone = location.get("timezone")
        return ZoneInfo(timezone) if timezone else None


class ObservationSensor(SensorBase):
    """Representation of a BOM Observation Sensor."""

    def __init__(self, hass_data, location_name, entity_prefix, sensor_name, description: SensorEntityDescription,):
        """Initialize the sensor."""
        super().__init__(hass_data, location_name, entity_prefix, sensor_name, description, device_type="Sensors")

    @property
    def unique_id(self) -> str:
        """Return Unique ID string."""
        return f"{self.entity_prefix}_{self.sensor_name}"

    def _observations(self) -> dict[str, Any]:
        """Return the observations payload, or an empty dict when unavailable."""
        data = (self.collector.observations_data or {}).get("data")
        return data if isinstance(data, dict) else {}

    def _today_forecast(self) -> dict[str, Any]:
        """Return today's daily forecast, or an empty dict when unavailable."""
        data = (self.collector.daily_forecasts_data or {}).get("data")
        if not data:
            return {}
        return data[0] if isinstance(data[0], dict) else {}

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        attr: dict[str, Any] = {}

        tzinfo = self._timezone()
        if tzinfo is None:
            return attr

        # BOM can send "metadata": null, which is not iterable.
        metadata = (self.collector.observations_data or {}).get("metadata")
        if metadata is None:
            return attr

        for key, value in metadata.items():
            try:
                attr[key] = parse_iso_datetime(value).astimezone(tzinfo).isoformat()
            except ValueError:
                attr[key] = value

        attr.update(self._observations().get("station") or {})

        # Add extended forecast text for condition sensor
        if self.sensor_name == ATTR_API_CONDITION:
            extended_text = self._today_forecast().get("extended_text")
            if extended_text:
                attr["forecast_text"] = extended_text

        # Only proceed for max_temp or min_temp
        if self.sensor_name not in ("max_temp", "min_temp"):
            return attr

        # These arrive as {"value": ..., "time": ...} rather than a bare number.
        sensor_data = self._observations().get(self.sensor_name)
        if not isinstance(sensor_data, dict):
            return attr

        time_str = sensor_data.get("time")
        if not time_str:
            return attr

        # We have all required data, now add the time_observed attribute
        attr["time_observed"] = parse_iso_datetime(time_str).astimezone(tzinfo).isoformat()
        return attr

    @property
    def native_value(self) -> Any:
        """Return the value reported by the sensor."""
        # The condition sensor has no observation of its own: it reports the
        # daily forecast's short_text.
        if self.sensor_name == ATTR_API_CONDITION:
            short_text = self._today_forecast().get("short_text")
            if not short_text:
                return None
            # Remove trailing punctuation for cleaner display
            return short_text.rstrip(".!,;:")

        value = self._observations().get(self.sensor_name)
        if value is None:
            return None
        if self.sensor_name in ("max_temp", "min_temp"):
            # These arrive as {"value": ..., "time": ...} rather than a bare number.
            return value.get("value") if isinstance(value, dict) else None
        return value

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

    def _day_forecast(self) -> dict[str, Any] | None:
        """Return this sensor's day of the daily forecast, or None when absent."""
        data = (self.collector.daily_forecasts_data or {}).get("data")
        if not data or self.day >= len(data):
            return None
        return data[self.day] if isinstance(data[self.day], dict) else None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        attr: dict[str, Any] = {}

        # If there is no data for this day, do not add attributes for this day.
        day_data = self._day_forecast()
        if day_data is None:
            return attr
        tzinfo = self._timezone()
        if tzinfo is None:
            return attr

        # BOM can send "metadata": null, which is not iterable.
        metadata = (self.collector.daily_forecasts_data or {}).get("metadata") or {}
        for key, value in metadata.items():
            try:
                attr[key] = parse_iso_datetime(value).astimezone(tzinfo).isoformat()
            except ValueError:
                attr[key] = value

        date = day_data.get("date")
        try:
            attr[ATTR_DATE] = parse_iso_datetime(date).astimezone(tzinfo).isoformat()
        except ValueError:
            attr[ATTR_DATE] = date

        if self.sensor_name == "fire_danger" and day_data.get("fire_danger") is not None:
            # Safely get fire_danger_category (may be null after ~4pm, but restored by coordinator)
            fire_danger_category = day_data.get("fire_danger_category")
            if fire_danger_category and fire_danger_category.get("default_colour"):
                attr["color_fill"] = fire_danger_category["default_colour"]
                attr["color_text"] = "#ffffff" if (fire_danger_category.get("text") == "Catastrophic") else "#000000"
        if self.sensor_name.startswith("extended"):
            attr[ATTR_STATE] = day_data.get("extended_text")
        return attr

    def _uv_forecast(self, day_data: dict[str, Any]) -> str | None:
        """Build the UV protection summary string."""
        uv_category = day_data.get("uv_category")
        if uv_category is None:
            return None
        category = uv_category.replace("veryhigh", "very high").title()
        max_index = day_data.get("uv_max_index")
        no_protection_required = (
            f"Sun protection not required, UV Index predicted to reach "
            f"{max_index} [{category}]"
        )

        local = self._timezone()
        if local is None:
            return no_protection_required

        # BOM omits both UV times overnight and outside the UV season, and has
        # been seen returning one of the pair without the other.
        try:
            start_time = parse_iso_datetime(day_data.get("uv_start_time")).astimezone(local)
            end_time = parse_iso_datetime(day_data.get("uv_end_time")).astimezone(local)
        except ValueError:
            return no_protection_required

        return (
            f"Sun protection recommended from {format_short_time(start_time)} to "
            f"{format_short_time(end_time)}, UV Index predicted to reach "
            f"{max_index} [{category}]"
        )

    @property
    def state(self) -> Any:
        """Return the state of the sensor.

        Only the TIMESTAMP sensors are served here; everything else delegates to
        SensorEntity.state, which reads native_value. Those four still report an
        ISO 8601 string in the location's local time. Returning a datetime from
        native_value instead — what a TIMESTAMP sensor is documented to do —
        makes Home Assistant re-render the state in UTC, which breaks templates
        that compare or slice the string, so it is held for a release of its own.
        """
        if self.device_class != SensorDeviceClass.TIMESTAMP:
            return super().state

        day_data = self._day_forecast()
        if day_data is None:
            return None
        value = day_data.get(self.sensor_name)
        tzinfo = self._timezone()
        if tzinfo is None:
            return value
        try:
            return parse_iso_datetime(value).astimezone(tzinfo).isoformat()
        except ValueError:
            return value

    @property
    def native_value(self) -> Any:
        """Return the value reported by the sensor."""
        # If there is no data for this day, report no value for this day.
        day_data = self._day_forecast()
        if day_data is None:
            return None

        if self.sensor_name == "uv_forecast":
            return self._uv_forecast(day_data)

        value = day_data.get(self.sensor_name)

        if self.sensor_name == "uv_category" and value is not None:
            value = value.replace("veryhigh", "very high").title()
        # Strip trailing period from short_text for cleaner display
        elif self.sensor_name == "short_text" and isinstance(value, str):
            value = value.rstrip(".")

        if isinstance(value, str) and len(value) > MAX_STATE_LENGTH:
            value = value[:MAX_STATE_LENGTH] + "..."
        return value

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
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes of the sensor."""
        if not self.collector.daily_forecasts_data or "metadata" not in self.collector.daily_forecasts_data:
            return {}
        return dict(self.collector.daily_forecasts_data["metadata"])

    @property
    def native_value(self) -> Any:
        """Return the value reported by the sensor."""
        data = (self.collector.daily_forecasts_data or {}).get("data")
        if not data:
            return None
        return data[0].get(self.sensor_name) if isinstance(data[0], dict) else None

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

        return attr

    @property
    def native_value(self) -> int:
        """Return the count of active warnings.

        Reports 0 rather than None when there is no warnings data, so the state
        stays numeric for template arithmetic and history graphs. A BOM outage
        is therefore indistinguishable from a quiet day.
        """
        if not self.collector.warnings_data:
            return 0
        # BOM can send "data": null, which len() cannot take.
        return len(self.collector.warnings_data.get("data") or [])

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return f"BOM {self.location_name} Warnings"
