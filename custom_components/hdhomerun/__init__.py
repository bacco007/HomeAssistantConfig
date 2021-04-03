"""The HDHomeRun component."""
__version__ = '0.0.6'

import voluptuous as vol
import homeassistant.helpers.config_validation as cv

from homeassistant import config_entries
from homeassistant.const import CONF_PORT
from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from .const import DOMAIN, CONF_HOST

DEVICE_SCHEMA = vol.Schema(
    {
        CONF_HOST: cv.string
    }
)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: {
            SENSOR_DOMAIN: vol.Schema(
                vol.All(cv.ensure_list, [DEVICE_SCHEMA])
            )
        }
    },
    extra=vol.ALLOW_EXTRA
)

async def async_setup(hass, config):
    """Set up the HDHomeRun component."""
    conf = config.get(DOMAIN)

    hass.data[DOMAIN] = conf or {}

    if conf is not None:
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN, context={"source": config_entries.SOURCE_IMPORT}
            )
        )

    return True


async def async_setup_entry(hass, entry):
    """Set up HDHomeRun from a config entry."""
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(entry, SENSOR_DOMAIN)
    )

    return True


async def async_unload_entry(hass, entry):
    """Unload a config entry."""
    await hass.config_entries.async_forward_entry_unload(entry, SENSOR_DOMAIN)

    return True