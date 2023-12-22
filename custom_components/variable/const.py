from homeassistant.const import Platform

PLATFORM_NAME = "Variables+History"
DOMAIN = "variable"

PLATFORMS: list[str] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.DEVICE_TRACKER,
]

# Defaults
DEFAULT_FORCE_UPDATE = False
DEFAULT_ICON = "mdi:variable"
DEFAULT_REPLACE_ATTRIBUTES = False
DEFAULT_RESTORE = True
DEFAULT_EXCLUDE_FROM_RECORDER = False

CONF_ATTRIBUTES = "attributes"
CONF_ENTITY_PLATFORM = "entity_platform"
CONF_FORCE_UPDATE = "force_update"
CONF_RESTORE = "restore"
CONF_TZOFFSET = "tz_offset"
CONF_VALUE = "value"
CONF_VALUE_TYPE = "value_type"
CONF_VARIABLE_ID = "variable_id"
CONF_YAML_PRESENT = "yaml_present"
CONF_YAML_VARIABLE = "yaml_variable"
CONF_EXCLUDE_FROM_RECORDER = "exclude_from_recorder"
CONF_UPDATED = "config_updated"

ATTR_ATTRIBUTES = "attributes"
ATTR_DELETE_LOCATION_NAME = "delete_location_name"
ATTR_ENTITY = "entity"
ATTR_NATIVE_UNIT_OF_MEASUREMENT = "native_unit_of_measurement"
ATTR_SUGGESTED_UNIT_OF_MEASUREMENT = "suggested_unit_of_measurement"
ATTR_REPLACE_ATTRIBUTES = "replace_attributes"
ATTR_VALUE = "value"
ATTR_VARIABLE = "variable"

SERVICE_UPDATE_SENSOR = "update_sensor"
SERVICE_UPDATE_BINARY_SENSOR = "update_binary_sensor"
SERVICE_UPDATE_DEVICE_TRACKER = "update_device_tracker"
