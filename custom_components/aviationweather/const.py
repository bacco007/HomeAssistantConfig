"""Constants for the aviationweather-hacs integration."""

from datetime import timedelta
import logging

DOMAIN = "aviationweather"
CONF_ENABLED_SENSORS = "sensors"
CONF_ICAO_ID = "icao_id"

COORDINATOR_UPDATE_INTERVAL: timedelta = timedelta(minutes=1)

_LOGGER = logging.getLogger(__name__)
