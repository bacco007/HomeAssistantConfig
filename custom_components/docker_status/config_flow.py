"""Adds config flow for Docker status integration."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast
import uuid

import docker
from docker import errors
import voluptuous as vol

# from homeassistant.components.sensor import DOMAIN as CONF_SENSORS
from homeassistant.const import CONF_SCAN_INTERVAL, CONF_UNIQUE_ID
from homeassistant.helpers import config_validation as cv, entity_registry as er
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaCommonFlowHandler,
    SchemaConfigFlowHandler,
    SchemaFlowError,
    SchemaFlowFormStep,
    SchemaFlowMenuStep,
)
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
)
from homeassistant.util.uuid import random_uuid_hex

from .const import (
    CONF_DOCKER_BASE_NAME,
    CONF_DOCKER_BASE_NAME_USE_IN_SENSOR_NAME,
    CONF_DOCKER_ENGINE_URL,
    CONF_DOCKER_ENV_SENSOR_NAME,
    CONF_INDEX,
    CONF_SENSORS,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    LOGGER,
)
from .hass_util import async_hass_add_executor_job


# ------------------------------------------------------------------
async def validate_docker_base_setup(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Validate base setup."""
    user_input[CONF_UNIQUE_ID] = str(uuid.uuid1())

    return user_input


# ------------------------------------------------------------------
async def validate_docker_base_edit(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Validate base setup."""
    return user_input


# ------------------------------------------------------------------
@async_hass_add_executor_job()
def validate_docker_url(base_url: str) -> None:
    """Validate base url input."""
    try:
        client: docker.DockerClient = docker.DockerClient(base_url)
        client.close()

    except errors.DockerException as exc:
        LOGGER.error("Error creating docker client: %s", exc)
        raise SchemaFlowError("base_url_error") from exc


# ------------------------------------------------------------------
async def validate_sensor_name(name: str, sensors: list[dict[str, Any]]) -> bool:
    """Validate sensor name input."""

    for sensor in sensors:
        if name.upper() == sensor.get(CONF_DOCKER_ENV_SENSOR_NAME, "").upper():
            raise SchemaFlowError("sensor_name_error")

    return True


# ------------------------------------------------------------------
async def validate_docker_sensor_setup(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Validate sensor input."""
    user_input[CONF_UNIQUE_ID] = str(uuid.uuid1())

    await validate_docker_url(user_input[CONF_DOCKER_ENGINE_URL])

    sensors: list[dict[str, Any]] = handler.options.setdefault(CONF_SENSORS, [])
    await validate_sensor_name(user_input[CONF_DOCKER_ENV_SENSOR_NAME], sensors)
    # Standard behavior is to merge the result with the options.
    # In this case, we want to add a sub-item so we update the options directly.
    sensors.append(user_input)
    return {}


# ------------------------------------------------------------------
async def validate_select_docker_sensor(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Store sensor index in flow state."""
    handler.flow_state["_idx"] = int(user_input[CONF_INDEX])
    return {}


# ------------------------------------------------------------------
async def get_select_docker_sensor_schema(
    handler: SchemaCommonFlowHandler,
) -> vol.Schema:
    """Return schema for selecting a sensor."""
    return vol.Schema(
        {
            vol.Required(CONF_INDEX): vol.In(
                {
                    str(index): config[CONF_DOCKER_ENV_SENSOR_NAME]
                    for index, config in enumerate(handler.options[CONF_SENSORS])
                },
            )
        }
    )


# ------------------------------------------------------------------
async def get_edit_docker_sensor_suggested_values(
    handler: SchemaCommonFlowHandler,
) -> dict[str, Any]:
    """Return suggested values for sensor editing."""
    idx: int = handler.flow_state["_idx"]
    return cast(dict[str, Any], handler.options[CONF_SENSORS][idx])


# ------------------------------------------------------------------
async def validate_docker_sensor_edit(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Update edited sensor."""
    await validate_docker_url(user_input[CONF_DOCKER_ENGINE_URL])

    # sensors: list[dict[str, Any]] = handler.options.setdefault(CONF_SENSORS, [])
    # await validate_sensor_name(user_input[CONF_DOCKER_ENV_SENSOR_NAME], sensors)

    #    user_input[CONF_INDEX] = int(user_input[CONF_INDEX])

    # Standard behavior is to merge the result with the options.
    # In this case, we want to add a sub-item so we update the options directly.
    idx: int = handler.flow_state["_idx"]
    handler.options[CONF_SENSORS][idx].update(user_input)
    return {}


# ------------------------------------------------------------------
async def get_remove_docker_sensor_schema(
    handler: SchemaCommonFlowHandler,
) -> vol.Schema:
    """Return schema for sensor removal."""
    return vol.Schema(
        {
            vol.Required(CONF_INDEX): cv.multi_select(
                {
                    str(index): config[CONF_DOCKER_ENV_SENSOR_NAME]
                    for index, config in enumerate(handler.options[CONF_SENSORS])
                },
            )
        }
    )


# ------------------------------------------------------------------
async def validate_docker_remove_sensor(
    handler: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Validate remove sensor."""
    removed_indexes: set[str] = set(user_input[CONF_INDEX])

    # Standard behavior is to merge the result with the options.
    # In this case, we want to remove sub-items so we update the options directly.
    entity_registry = er.async_get(handler.parent_handler.hass)
    sensors: list[dict[str, Any]] = []
    sensor: dict[str, Any]
    for index, sensor in enumerate(handler.options[CONF_SENSORS]):
        if str(index) not in removed_indexes:
            sensors.append(sensor)
        elif entity_id := entity_registry.async_get_entity_id(
            CONF_SENSORS, DOMAIN, sensor[CONF_UNIQUE_ID]
        ):
            entity_registry.async_remove(entity_id)

    handler.options[CONF_SENSORS] = sensors
    return {}


# ------------------------------------------------------------------
async def config_docker_base_setup_schema(
    handler: SchemaCommonFlowHandler,
) -> vol.Schema:
    """Return schema for the sensor config step."""

    if handler.parent_handler.unique_id is None:
        await handler.parent_handler.async_set_unique_id(random_uuid_hex())
        handler.parent_handler._abort_if_unique_id_configured()  # noqa: SLF001

    return DATA_SCHEMA_DOCKER_BASE


DOCKER_BASE_SETUP = {
    vol.Required(
        CONF_SCAN_INTERVAL,
        default=DEFAULT_SCAN_INTERVAL,
    ): NumberSelector(
        NumberSelectorConfig(
            min=5, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="Minutes"
        )
    ),
}

DOCKER_SENSOR_SETUP = {
    vol.Required(CONF_DOCKER_ENGINE_URL): TextSelector(),
}


DATA_SCHEMA_EDIT_DOCKER_BASE = vol.Schema(DOCKER_BASE_SETUP)
DATA_SCHEMA_DOCKER_BASE = vol.Schema(
    {
        vol.Required(CONF_DOCKER_BASE_NAME, default=""): TextSelector(),
        vol.Required(
            CONF_DOCKER_BASE_NAME_USE_IN_SENSOR_NAME, default=True
        ): BooleanSelector(),
        **DOCKER_BASE_SETUP,
    }
)

DATA_SCHEMA_EDIT_DOCKER_SENSOR = vol.Schema(DOCKER_SENSOR_SETUP)
DATA_SCHEMA_DOCKER_SENSOR = vol.Schema(
    {
        vol.Required(
            CONF_DOCKER_ENV_SENSOR_NAME,
            default="",
        ): TextSelector(),
        **DOCKER_SENSOR_SETUP,
    }
)

CONFIG_FLOW = {
    "user": SchemaFlowFormStep(
        schema=config_docker_base_setup_schema,
        next_step="sensor",
        validate_user_input=validate_docker_base_setup,
    ),
    "sensor": SchemaFlowFormStep(
        schema=DATA_SCHEMA_DOCKER_SENSOR,
        validate_user_input=validate_docker_sensor_setup,
    ),
}
OPTIONS_FLOW = {
    "init": SchemaFlowMenuStep(
        [
            "docker_base_setup",
            "add_docker_sensor",
            "select_edit_docker_sensor",
            "remove_docker_sensor",
        ]
    ),
    "docker_base_setup": SchemaFlowFormStep(
        DATA_SCHEMA_EDIT_DOCKER_BASE,
        validate_user_input=validate_docker_base_edit,
    ),
    "add_docker_sensor": SchemaFlowFormStep(
        DATA_SCHEMA_DOCKER_SENSOR,
        suggested_values=None,
        validate_user_input=validate_docker_sensor_setup,
    ),
    "select_edit_docker_sensor": SchemaFlowFormStep(
        get_select_docker_sensor_schema,
        suggested_values=None,
        validate_user_input=validate_select_docker_sensor,
        next_step="edit_docker_sensor",
    ),
    "edit_docker_sensor": SchemaFlowFormStep(
        DATA_SCHEMA_EDIT_DOCKER_SENSOR,
        suggested_values=get_edit_docker_sensor_suggested_values,
        validate_user_input=validate_docker_sensor_edit,
    ),
    "remove_docker_sensor": SchemaFlowFormStep(
        get_remove_docker_sensor_schema,
        suggested_values=None,
        validate_user_input=validate_docker_remove_sensor,
    ),
}


# ------------------------------------------------------------------
# ------------------------------------------------------------------
class DockerStatusConfigFlowHandler(SchemaConfigFlowHandler, domain=DOMAIN):
    """Handle a config flow for Docker status."""

    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW

    def async_config_entry_title(self, options: Mapping[str, Any]) -> str:
        """Return config entry title."""
        return cast(str, options[CONF_DOCKER_BASE_NAME].strip())
