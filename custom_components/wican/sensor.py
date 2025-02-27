"""Sensor processing for WiCAN Integration.

Purpose: provide sensor data for available WiCAN sensors.
"""

import logging

from homeassistant.components.number import NumberDeviceClass
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .entity import WiCanPidEntity, WiCanStatusEntity

_LOGGER = logging.getLogger(__name__)


def process_status_voltage(i):
    """Convert status voltage to type float.

    Parameters
    ----------
    i : Any
        Voltage value.

    Returns
    -------
    float:
        Voltage value converted to type float.

    """
    return float(i[:-1])


async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities):
    """Create and provide list of sensors containing WiCanStatusEntities and WiCanPidEntities.

    Parameters
    ----------
    hass : HomeAssistant
        HomeAssistant object for coordinator.
    entry: Any
        WiCan entry in HomeAssistant data for coordinator.
    async_add_entities: Any
        Object to be called with list of WiCanEntities.

    Returns
    -------
    async_add_entities: method:
        Calls function async_add_entities containing newly created list of WiCanEntities.

    """
    coordinator = hass.data[DOMAIN][entry.entry_id]

    entities = []
    if not coordinator.data["status"]:
        return None

    entities.append(
        WiCanStatusEntity(
            coordinator,
            {
                "key": "batt_voltage",
                "name": "Battery Voltage",
                "class": NumberDeviceClass.VOLTAGE,
                "unit": "V",
                "category": EntityCategory.DIAGNOSTIC,
            },
            process_status_voltage,
        )
    )
    entities.append(
        WiCanStatusEntity(
            coordinator,
            {
                "key": "sta_ip",
                "name": "IP Address",
                "category": EntityCategory.DIAGNOSTIC,
            },
        )
    )
    entities.append(
        WiCanStatusEntity(
            coordinator,
            {"key": "protocol", "name": "Mode", "category": EntityCategory.DIAGNOSTIC},
        )
    )

    if not coordinator.ecu_online:
        async_add_entities(entities)

    if not coordinator.data["pid"]:
        return async_add_entities(entities)

    for key in coordinator.data["pid"]:
        append = False
        if coordinator.data["pid"][key].get("sensor_type") is not None:
            if coordinator.data["pid"][key]["sensor_type"] != "binary_sensor":
                append = True
        else:
            append = True

        if append:
            entities.append(
                WiCanPidEntity(
                    coordinator,
                    {
                        "key": key,
                        "name": key,
                        "class": coordinator.data["pid"][key]["class"],
                        "unit": coordinator.data["pid"][key]["unit"],
                    },
                )
            )

    return async_add_entities(entities)
