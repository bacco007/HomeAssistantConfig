from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import _LOGGER


def is_number(s):
    if s:
        try:
            float(s)
            return True
        except ValueError:
            return False
    return False


def parse_sensor_state(state):
    if not state:
        return STATE_UNKNOWN
    if is_number(state.state):
        return state.state
    if not state or not state.state or state.state == STATE_UNAVAILABLE:
        return STATE_UNAVAILABLE
    return STATE_UNKNOWN


def convert_to_float(float_value):
    """Convert to Float."""
    try:
        return float(float_value)
    except (ValueError, TypeError):
        _LOGGER.debug(
            f"Unable to convert {float_value} to float. Source sensor may be unavailable."
        )
        return STATE_UNAVAILABLE
