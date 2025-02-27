"""Binary sensor processing for WiCAN Integration.

Purpose: provide binary sensor data for available WiCAN sensors.
"""

from homeassistant.const import STATE_OFF, STATE_ON, EntityCategory
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .entity import WiCanPidEntity, WiCanStatusEntity


def binary_state(target_state: str):
    """Check binary state for provided str.

    Parameters
    ----------
    target_state : str
        state to be checked.

    Returns
    -------
    lambda:
        returns homeassistant const STATE_ON or STATE_OFF based on provided input.

    """

    return lambda state: STATE_ON if state == target_state else STATE_OFF


async def async_setup_entry(hass: HomeAssistant, entry, async_add_entities):
    """Create and provide list of binary sensors containing WiCanStatusEntities and WiCanPidEntities.

    Parameters
    ----------
    hass : HomeAssistant
        HomeAssistant object for coordinator.
    entry: any
        WiCAN entry in HomeAssistant data for coordinator.
    async_add_entities: any
        Object to be called with list of WiCanEntities.

    Returns
    -------
    async_add_entities: function:
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
                "key": "ble_status",
                "name": "Bluetooth Status",
                "category": EntityCategory.DIAGNOSTIC,
            },
            binary_state("enable"),
        )
    )
    entities.append(
        WiCanStatusEntity(
            coordinator,
            {
                "key": "sleep_status",
                "name": "Sleep Status",
                "category": EntityCategory.DIAGNOSTIC,
                "attributes": {"voltage": "sleep_volt"},
            },
            binary_state("enable"),
        )
    )
    entities.append(
        WiCanStatusEntity(
            coordinator,
            {
                "key": "mqtt_en",
                "name": "MQTT Status",
                "category": EntityCategory.DIAGNOSTIC,
                "attributes": {
                    "url": "mqtt_url",
                    "port": "mqtt_port",
                    "user": "mqtt_user",
                },
            },
            binary_state("enable"),
        )
    )
    entities.append(
        WiCanStatusEntity(
            coordinator,
            {
                "key": "ecu_status",
                "name": "ECU Status",
                "category": EntityCategory.DIAGNOSTIC,
                "target_state": "online",
            },
            binary_state("online"),
        )
    )

    if not coordinator.ecu_online:
        async_add_entities(entities)

    if not coordinator.data["pid"]:
        return async_add_entities(entities)

    for key in coordinator.data["pid"]:
        if coordinator.data["pid"][key].get("sensor_type") is not None:
            if coordinator.data["pid"][key]["sensor_type"] == "binary_sensor":
                entities.append(
                    WiCanPidEntity(
                        coordinator,
                        {
                            "key": key,
                            "name": key,
                            "class": coordinator.data["pid"][key]["class"],
                        },
                        binary_state("on"),
                    )
                )

    return async_add_entities(entities)
