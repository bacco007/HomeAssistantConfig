"""FoldingAtHomeControl services."""
import voluptuous as vol
from homeassistant.helpers import config_validation as cv

from .const import _LOGGER, CONF_ADDRESS, DOMAIN

DOMAIN_SERVICES = f"{DOMAIN}_services"

SERVICE_ADDRESS = "address"
SERVICE_SLOT = "slot"

SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT = "request_work_server_assignment"
SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT_SCHEMA = vol.Schema(
    {vol.Required(SERVICE_ADDRESS): cv.string}
)

SERVICE_PAUSE = "pause"
SERVICE_UNPAUSE = "unpause"
SERVICE_SLOT_SCHEMA = vol.Schema(
    {
        vol.Required(SERVICE_ADDRESS): cv.string,
        vol.Optional(SERVICE_SLOT, default=None): cv.string,
    }
)

SERVICE_SHUTDOWN = "shutdown"
SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT = "request_work_server_assignment"
SERVICE_SCHEMA = vol.Schema({vol.Required(SERVICE_ADDRESS): cv.string})


async def async_setup_services(hass):
    """Set up services for FoldingAtHomeControl integration."""
    if hass.data.get(DOMAIN_SERVICES, False):
        return

    hass.data[DOMAIN_SERVICES] = True

    async def async_call_folding_at_home_control_service(service_call):
        """Call correct FoldingAtHomeControl service."""
        service = service_call.service
        service_data = service_call.data

        if service == SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT:
            await async_request_assignment_service(hass, service_data)
        if service == SERVICE_PAUSE:
            await async_pause_service(hass, service_data)
        if service == SERVICE_UNPAUSE:
            await async_unpause_service(hass, service_data)
        if service == SERVICE_SHUTDOWN:
            await async_shutdown_service(hass, service_data)

    hass.services.async_register(
        DOMAIN,
        SERVICE_PAUSE,
        async_call_folding_at_home_control_service,
        schema=SERVICE_SLOT_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_UNPAUSE,
        async_call_folding_at_home_control_service,
        schema=SERVICE_SLOT_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT,
        async_call_folding_at_home_control_service,
        schema=SERVICE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SHUTDOWN,
        async_call_folding_at_home_control_service,
        schema=SERVICE_SCHEMA,
    )


async def async_unload_services(hass):
    """Unload deCONZ services."""
    if not hass.data.get(DOMAIN_SERVICES):
        return

    hass.data[DOMAIN_SERVICES] = False

    hass.services.async_remove(DOMAIN, SERVICE_PAUSE)
    hass.services.async_remove(DOMAIN, SERVICE_UNPAUSE)
    hass.services.async_remove(DOMAIN, SERVICE_SHUTDOWN)
    hass.services.async_remove(DOMAIN, SERVICE_REQUEST_WORK_SERVER_ASSIGNMENT)


async def async_pause_service(hass, data):
    """Let the client pause one or all slots."""

    address = data[SERVICE_ADDRESS]
    slot = data[SERVICE_SLOT]

    for config_entry in hass.data[DOMAIN]:
        if hass.data[DOMAIN][config_entry].config_entry.data[CONF_ADDRESS] == address:
            if slot is not None:
                await hass.data[DOMAIN][config_entry].client.pause_slot_async(slot)
                return
            await hass.data[DOMAIN][config_entry].client.pause_all_slots_async()
            return
    _LOGGER.warning("Could not find a registered integration with address: %s", address)


async def async_unpause_service(hass, data):
    """Let the client unpause one or all slots."""

    address = data[SERVICE_ADDRESS]
    slot = data[SERVICE_SLOT]

    for config_entry in hass.data[DOMAIN]:
        if hass.data[DOMAIN][config_entry].config_entry.data[CONF_ADDRESS] == address:
            if slot is not None:
                await hass.data[DOMAIN][config_entry].client.unpause_slot_async(slot)
                return
            await hass.data[DOMAIN][config_entry].client.unpause_all_slots_async()
            return
    _LOGGER.warning("Could not find a registered integration with address: %s", address)


async def async_shutdown_service(hass, data):
    """Let the client shutdown."""

    address = data[SERVICE_ADDRESS]

    for config_entry in hass.data[DOMAIN]:
        if hass.data[DOMAIN][config_entry].config_entry.data[CONF_ADDRESS] == address:
            await hass.data[DOMAIN][config_entry].client.shutdown()
            return
    _LOGGER.warning("Could not find a registered integration with address: %s", address)


async def async_request_assignment_service(hass, data):
    """Let the client request a new work server assignment."""

    address = data[SERVICE_ADDRESS]

    for config_entry in hass.data[DOMAIN]:
        if hass.data[DOMAIN][config_entry].config_entry.data[CONF_ADDRESS] == address:
            await hass.data[DOMAIN][
                config_entry
            ].client.request_work_server_assignment()
            return
    _LOGGER.warning("Could not find a registered integration with address: %s", address)
