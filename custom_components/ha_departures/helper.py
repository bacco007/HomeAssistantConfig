"""Helper function for custom integration."""

import logging
import math
from datetime import datetime

from homeassistant.util import dt as dt_util

_LOGGER = logging.getLogger(__name__)


def str_to_datetime(date: str) -> datetime | None:
    """Convert a time string to a (local) datetime object.

    Args:
        date (str): The date/time string in ISO 8601 format.

    Returns:
        datetime | None: The corresponding (local) datetime object, or None if the input is invalid.

    """
    if not date:
        return None

    try:
        dt = dt_util.parse_datetime(date)

        return dt_util.as_local(dt) if dt else None
    except ValueError:
        _LOGGER.error("Invalid datetime format: %s", date)
        return None


def bounding_box(lat, lon, radius_m):
    """Calculate a bounding box around a point given a radius in meters."""

    meters_per_degree = 111_320

    delta_lat = radius_m / meters_per_degree
    delta_lon = radius_m / (meters_per_degree * math.cos(math.radians(lat)))

    upper_left = (lat + delta_lat, lon - delta_lon)
    lower_right = (lat - delta_lat, lon + delta_lon)

    return upper_left, lower_right
