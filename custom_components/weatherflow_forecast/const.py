"""Constants for WeatherFlow Forecast component."""

ATTR_ATTRIBUTION = "Weather data delivered by WeatherFlow"
ATTR_DESCRIPTION = "description"
ATTR_HW_FIRMWARE_REVISION = "Firmware Revision"
ATTR_HW_SERIAL_NUMBER = "Serial Number"
ATTR_HW_STATION_ID = "Station ID"

BATTERY_MODE_DESCRIPTION = [
    "All sensors enabled and operating at full performance. Wind sampling interval every 3 seconds",
    "Wind sampling interval set to 6 seconds",
    "Wind sampling interval set to one minute",
    "Wind sampling interval set to 5 minutes. All other sensors sampling interval set to 5 minutes. Haptic Rain sensor disabled from active listening",
]

CONCENTRATION_GRAMS_PER_CUBIC_METER = "g/m³"
CONCENTRATION_KILO_PER_CUBIC_METER = "kg/m³"
CONCENTRATION_POUND_PER_CUBIC_FOOT = "lb/ft³"
CONF_ADD_SENSORS = "add_sensors"
CONF_API_TOKEN = "api_token"
CONF_DEVICE_ID = "device_id"
CONF_FIRMWARE_REVISION = "firmware_revision"
CONF_FORECAST_HOURS = "forecast_hours"
CONF_SERIAL_NUMBER = "serial_number"
CONF_STATION_ID = "station_id"

DEFAULT_ADD_SENSOR = False
DEFAULT_FORECAST_HOURS = 48
DEFAULT_NAME = "WeatherFlow Forecast"
DOMAIN = "weatherflow_forecast"

MANUFACTURER = "WeatherFlow"
MODEL = "Rest API"

PRECIPITATION_TYPE_DESCRIPTION = [
    "No Precipitation",
    "Rain",
    "Heavy Rain/Hail",
]

TIMESTAMP_SENSORS = [
    "lightning_strike_last_epoch",
    "timestamp",
]

STARTUP = """
-------------------------------------------------------------------
Weatherflow Forecast

Version: %s
ID: %s
This is a custom integration
If you have any issues with this you need to open an issue here:
https://github.com/briis/weatherflow_forecast/issues
Pleae make sure to supply enough debugging information
-------------------------------------------------------------------
"""
