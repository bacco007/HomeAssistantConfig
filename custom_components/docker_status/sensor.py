"""Support for Docker status."""

from __future__ import annotations

from homeassistant.components.sensor import (  # SensorDeviceClass,; SensorEntityDescription,
    SensorEntity,
)
from homeassistant.const import CONF_UNIQUE_ID
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import CommonConfigEntry
from .component_api import ComponentApi
from .const import (
    CONF_DOCKER_BASE_NAME,
    CONF_DOCKER_BASE_NAME_USE_IN_SENSOR_NAME,
    CONF_DOCKER_ENGINE_URL,
    CONF_DOCKER_ENV_SENSOR_NAME,
    CONF_SENSORS,
    DOCKER_SENSORS,
    DOCKER_SENSORS_SUM,
    TRANSLATION_KEY,
)
from .entity import ComponentEntity


# ------------------------------------------------------
async def async_setup_entry(
    hass: HomeAssistant,
    entry: CommonConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Entry for Docker status setup."""
    sensors = []

    config = dict(entry.options)

    for sensor in config[CONF_SENSORS]:
        sensors.extend(
            DockerSensor(
                hass,
                entry,
                config.get(CONF_DOCKER_BASE_NAME, ""),
                sensor[CONF_DOCKER_ENV_SENSOR_NAME],
                docker_sensor,
                sensor[CONF_DOCKER_ENGINE_URL],
                sensor[CONF_UNIQUE_ID],
            )
            for docker_sensor in DOCKER_SENSORS
        )

    # -- Sum sensors
    if len(config[CONF_SENSORS]) > 1:
        sensors.extend(
            DockerSensorSum(
                entry,
                config.get(CONF_DOCKER_BASE_NAME, ""),
                docker_sensor,
                config[CONF_UNIQUE_ID],
            )
            for docker_sensor in DOCKER_SENSORS_SUM
        )

    async_add_entities(sensors)


# ------------------------------------------------------
# ------------------------------------------------------
class DockerSensor(ComponentEntity, SensorEntity):
    """Sensor class Docker."""

    # ------------------------------------------------------
    def __init__(
        self,
        hass: HomeAssistant,
        entry: CommonConfigEntry,
        docker_base_name: str,
        sensor_env_name: str,
        sensor_type: str,
        sensor_engine_url: str,
        sensor_unigue_id: str,
    ) -> None:
        """Docker sensor."""
        super().__init__(entry.runtime_data.coordinator, entry)

        self.hass: HomeAssistant = hass
        self.component_api: ComponentApi = entry.runtime_data.component_api
        self.coordinator = entry.runtime_data.coordinator
        self.entry: CommonConfigEntry = entry
        self.docker_base_name = docker_base_name
        self.env_name = sensor_env_name
        self.sensor_type: str = sensor_type
        self.engine_url = sensor_engine_url
        self._unique_id = sensor_unigue_id

        self.translation_key = TRANSLATION_KEY

    # ------------------------------------------------------
    @property
    def name(self) -> str:
        """Name."""

        return (
            f"{self.docker_base_name} {self.env_name} - {self.sensor_type}"
            if self.entry.options.get(CONF_DOCKER_BASE_NAME_USE_IN_SENSOR_NAME, False)
            else f"{self.env_name} - {self.sensor_type}"
        )

    # ------------------------------------------------------
    @property
    def native_value(self) -> int | float | None:
        """Native value."""
        return self.component_api.get_value(self.env_name, self.sensor_type)

    # ------------------------------------------------------
    @property
    def native_unit_of_measurement(self) -> str | None:
        """Return the unit the value is expressed in."""
        return self.component_api.get_value_uom(self.env_name, self.sensor_type)

    # ------------------------------------------------------
    @property
    def extra_state_attributes(self) -> dict:
        """Extra state attributes."""

        return self.component_api.get_extra_state_attributes(
            self.env_name, self.sensor_type
        )

    # ------------------------------------------------------
    @property
    def unique_id(self) -> str:
        """Unique id."""
        return self._unique_id + self.sensor_type

    # ------------------------------------------------------
    @property
    def should_poll(self) -> bool:
        """No need to poll. Coordinator notifies entity of updates."""
        return False

    # ------------------------------------------------------
    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    # ------------------------------------------------------
    async def async_update(self) -> None:
        """Update the entity. Only used by the generic entity update service."""
        await self.coordinator.async_request_refresh()

    # ------------------------------------------------------
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""

        await super().async_added_to_hass()

        self.async_on_remove(
            self.coordinator.async_add_listener(self.async_write_ha_state)
        )


# ------------------------------------------------------
# ------------------------------------------------------
class DockerSensorSum(ComponentEntity, SensorEntity):
    """Sensor class Docker sum."""

    # ------------------------------------------------------
    def __init__(
        self,
        entry: CommonConfigEntry,
        docker_base_name: str,
        sensor_type: str,
        sensor_unigue_id: str,
    ) -> None:
        """Docker sensor sum."""
        super().__init__(entry.runtime_data.coordinator, entry)

        self.component_api = entry.runtime_data.component_api
        self.entry: CommonConfigEntry = entry
        self.coordinator = entry.runtime_data.coordinator
        self.docker_base_name = docker_base_name
        self.sensor_type: str = sensor_type
        self.sensor_unique_id = sensor_unigue_id

        self.translation_key = TRANSLATION_KEY

    # ------------------------------------------------------
    @property
    def name(self) -> str:
        """Name."""
        return (
            f"{self.docker_base_name} summary - {self.sensor_type}"
            if self.entry.options.get(CONF_DOCKER_BASE_NAME_USE_IN_SENSOR_NAME, False)
            else f"Summary - {self.sensor_type}"
        )

    # ------------------------------------------------------
    # @property
    # def icon(self) -> str:
    #     """Icon."""
    #     return "mdi:docker"

    # ------------------------------------------------------
    @property
    def native_value(self) -> int | float | None:
        """Native value."""
        return self.component_api.get_value_sum(self.sensor_type)

    # ------------------------------------------------------
    @property
    def native_unit_of_measurement(self) -> str | None:
        """Return the unit the value is expressed in."""
        return self.component_api.get_value_sum_uom(self.sensor_type)

    # ------------------------------------------------------
    @property
    def extra_state_attributes(self) -> dict:
        """Extra state attributes."""
        attr: dict = {}

        return attr

    # ------------------------------------------------------
    @property
    def unique_id(self) -> str:
        """Unique id."""
        return self.sensor_unique_id + self.sensor_type

    # ------------------------------------------------------
    @property
    def should_poll(self) -> bool:
        """No need to poll. Coordinator notifies entity of updates."""
        return False

    # ------------------------------------------------------
    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return self.coordinator.last_update_success

    # ------------------------------------------------------
    async def async_update(self) -> None:
        """Update the entity. Only used by the generic entity update service."""
        await self.coordinator.async_request_refresh()

    # ------------------------------------------------------
    async def async_added_to_hass(self) -> None:
        """When entity is added to hass."""
        self.async_on_remove(
            self.coordinator.async_add_listener(self.async_write_ha_state)
        )
