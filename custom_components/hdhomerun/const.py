"""Constants for HDHomeRun"""

# region #-- imports --#
from homeassistant.components.binary_sensor import DOMAIN as BINARY_SENSOR_DOMAIN
from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
# TODO: remove try/except when minimum version of HASS is 2022.4.0
try:
    from homeassistant.components.update import DOMAIN as UPDATE_DOMAIN
except ImportError:
    UPDATE_DOMAIN = None
# endregion

DOMAIN: str = "hdhomerun"
ENTITY_SLUG: str = "HDHomeRun"

CONF_DATA_COORDINATOR_GENERAL: str = "data_coordinator_general"
CONF_DATA_COORDINATOR_TUNER_STATUS: str = "data_coordinaror_tuner_status"
CONF_HOST: str = "host"
CONF_SCAN_INTERVAL_TUNER_STATUS: str = "scan_interval_tuner_status"
CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH: str = "channel_entity_picture_path"
CONF_TUNER_CHANNEL_FORMAT: str = "channel_format"
CONF_TUNER_CHANNEL_NAME: str = "channel_name"
CONF_TUNER_CHANNEL_NUMBER_NAME: str = "channel_number_name"
CONF_TUNER_CHANNEL_NUMBER: str = "channel_number"

CONF_TUNER_CHANNEL_AVAILABLE_FORMATS: dict = {
    CONF_TUNER_CHANNEL_NAME: "Channel name, e.g. BBC One HD",
    CONF_TUNER_CHANNEL_NUMBER: "Channel number, e.g. 101",
    CONF_TUNER_CHANNEL_NUMBER_NAME: "Channel number and name, e.g. 101: BBC One HD",
}

DEF_SCAN_INTERVAL_SECS: int = 300
DEF_SCAN_INTERVAL_TUNER_STATUS_SECS: int = 10
DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH: str = ""
DEF_TUNER_CHANNEL_FORMAT: str = CONF_TUNER_CHANNEL_NAME


PLATFORMS = [
    BINARY_SENSOR_DOMAIN,
    SENSOR_DOMAIN,
    UPDATE_DOMAIN,
]
