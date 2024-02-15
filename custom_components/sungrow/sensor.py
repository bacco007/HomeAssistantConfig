"""Sensor platform integration for Sungrow Inverters"""

from __future__ import annotations

import logging
from datetime import timedelta

from homeassistant.components.sensor import SensorEntity
from homeassistant.components.sensor.const import (
    DEVICE_CLASS_STATE_CLASSES,
    SensorDeviceClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_SCAN_INTERVAL,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import (
    DOMAIN,
)
from .core.inverter import SungrowInverter

logger = logging.getLogger(__name__)

MIN_TIME_BETWEEN_UPDATES = timedelta(seconds=5)


def guess_device_class(unit: str | None) -> SensorDeviceClass | None:
    # A solar specific copy of homeassistant.components.sensor.const.DEVICE_CLASS_UNITS.
    # Note: this is a first guess to avoid writing this in the yaml file.
    device_class_units = {
        SensorDeviceClass.BATTERY: ["%"],
        SensorDeviceClass.POWER: ["kW", "KW", "W"],
        SensorDeviceClass.CURRENT: ["A"],
        SensorDeviceClass.TEMPERATURE: ["°C"],
        SensorDeviceClass.DURATION: ["h", "min"],
        SensorDeviceClass.FREQUENCY: ["Hz"],
        SensorDeviceClass.WEIGHT: ["kg"],
        SensorDeviceClass.REACTIVE_POWER: ["kVar", "Var", "var"],
        SensorDeviceClass.ENERGY: ["kWh"],
        SensorDeviceClass.VOLTAGE: ["V"],
        SensorDeviceClass.APPARENT_POWER: ["VA"],
        # FYI: MM is minute and month. Let's just preserve that bug.
        None: ["k-ohm", "YYYY", "MM", "DD", "HH", "MM", "SS"],
    }

    # If there is no unit, it's probably a fixed value
    if unit is None:
        return SensorDeviceClass.ENUM
    else:
        for device_class, units in device_class_units.items():
            if unit in units:
                return device_class

    logger.warning(f"Unknown unit '{unit}', not sure what device class to use.")
    return None


def guess_state_class(device_class: SensorDeviceClass | None):
    """Guess SensorStateClass.MESAUREMENT or TOTAL"""

    if device_class:
        state_classes = DEVICE_CLASS_STATE_CLASSES.get(device_class, None)
        if state_classes:
            return next(iter(state_classes))

    return None


async def create_sensor_entities(
    inverter: SungrowInverter,
    device_identifiers: set[tuple[str, str]],
    coordinator: DataUpdateCoordinator,
) -> list[SungrowInverterSensorEntity]:
    """Register sensor entities based on the inverter data."""

    if not inverter.data:
        await inverter.pull_data()

    entities = []
    for d in inverter.data.values():
        if isinstance(d.value, list | dict):
            continue  # FIXME: we don't support lists yet
        entities.append(
            SungrowInverterSensorEntity(
                coordinator,
                inverter,
                device_identifiers,
                d.name,
                d.unit_of_measurement,
            )
        )
    return entities


class InverterCoordinator(DataUpdateCoordinator):
    """Coordinator for pilling data from one inverter."""

    def __init__(self, hass, inverter, update_interval):
        """Initialize the coordinator."""
        logger.warning(
            "Creating Sungrow Inverter Coordinator with "
            f"update interval {update_interval}"
        )
        self.inverter = inverter
        super().__init__(
            hass,
            logger,
            name="Sungrow Inverter Coordinator",
            update_interval=update_interval,
        )

    async def _async_update_data(self):
        logger.warning("_async_update_data: Updating data from Sungrow Inverter")
        # async with async_timeout.timeout(10):
        data = await self.inverter.pull_data()
        if data:
            logger.warning(
                f"_async_update_data: Got data from Sungrow Inverter: {data}"
            )
            return data

        else:
            logger.warning(
                "_async_update_data: Failed to get data from Sungrow Inverter"
            )
            raise UpdateFailed("Failed pulling data from Sungrow Inverter")


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
):
    """
    Setup sensors from a config entry created in the integrations UI.

    Called upon config_flow completion and on start of Home Assistant.
    """

    inverter = await SungrowInverter.create(config_entry.data)
    if not inverter:
        raise ConfigEntryNotReady("Failed to connect to inverter")

    async with inverter:
        update_interval = max(
            timedelta(seconds=config_entry.data.get(CONF_SCAN_INTERVAL, 60)),
            MIN_TIME_BETWEEN_UPDATES,
        )
        coordinator = InverterCoordinator(
            hass,
            inverter=inverter,
            update_interval=update_interval,
        )

        # Fetch data once so it's available for the first update.
        # ToDo: is this really needed?
        await coordinator.async_config_entry_first_refresh()

        # Register our inverter device
        device_registry = dr.async_get(hass)
        device_entry = device_registry.async_get_or_create(
            config_entry_id=config_entry.entry_id,
            identifiers={(DOMAIN, inverter.serial_number)},
            manufacturer="Sungrow",
            # Note: name can be changed in the UI!
            name=f"Sungrow {inverter.slave_master_standalone}",
            model=inverter.model,
            serial_number=inverter.serial_number,
        )

        entities = await create_sensor_entities(
            inverter, device_entry.identifiers, coordinator
        )
        logger.warning(f"async_setup_entry -> async_add_entities({len(entities)})")
        async_add_entities(entities, update_before_add=True)

        inverter.detach()


class SungrowInverterSensorEntity(CoordinatorEntity, SensorEntity):
    """Implementation of a Sungrow Inverter sensor."""

    def __init__(
        self,
        coordinator: DataUpdateCoordinator,
        inverter: SungrowInverter,
        device_identifiers: set[tuple[str, str]],
        signal_name: str,
        signal_unit: str | None,
    ):
        super().__init__(coordinator)

        self.coordinator = coordinator
        self.signal_name = signal_name
        self.device_object_id = inverter.slave_master_standalone

        self._attr_native_unit_of_measurement = signal_unit
        self._attr_device_class = guess_device_class(signal_unit)
        self._attr_state_class = guess_state_class(self.device_class)
        # Note: name can be changed in the UI!
        signal_pretty = signal_name.replace("_", " ").title()
        if inverter.slave_master_standalone == "Standalone":
            self._attr_name = signal_pretty
        else:
            self._attr_name = inverter.slave_master_standalone + " - " + signal_pretty

        # This will link the sensor to the matching device.
        self._attr_device_info = DeviceInfo(
            identifiers=device_identifiers,
        )

        # self._attr_available = False

        # All data is preserved based on unique id.
        # Note: you'll not see this ID anywhere in the UI.
        # sn = coordinator.data["serial_number"]
        sn = inverter.serial_number
        self._attr_unique_id = f"sungrow_{sn}_{signal_name}"

    @property
    def suggested_object_id(self) -> str:
        """This is the 'Entity ID' in the UI"""

        # By default (see SensorEntity) this is derived from the name.
        # In order to set them separately, we need to override this property.

        # This object/entity id is the one you'll see across the UI, incl automations.
        # We need object id to be something simple, so it's usable in shared dashboards!

        return f"sungrow_{self.device_object_id}_{self.signal_name}"

    @property
    def native_value(self):
        """Return the state of the sensor. This runs very quickly."""

        # Latest data is stored by the coordinator.
        # Of course we could also access self.inverter.data directly,
        # but that's not how it is meant to be?!
        data = self.coordinator.data

        value = data.get(self.signal_name, None)
        if value:
            assert isinstance(value, SungrowInverter.Datapoint)
            # self._attr_available = True
            value = value.value
            return value
        else:
            # self._attr_available = False
            return None
