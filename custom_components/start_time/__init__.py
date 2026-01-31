from homeassistant.config_entries import ConfigEntry, SOURCE_IMPORT
from homeassistant.core import HomeAssistant

from .sensor import DOMAIN, StartTime


async def async_setup(hass: HomeAssistant, hass_config: dict):
    hass.data[DOMAIN] = StartTime()

    if DOMAIN in hass_config and not hass.config_entries.async_entries(DOMAIN):
        hass.async_create_task(
            hass.config_entries.flow.async_init(
                DOMAIN, context={"source": SOURCE_IMPORT}
            )
        )
    return True


async def async_setup_entry(hass: HomeAssistant, config_entry: ConfigEntry):
    await hass.config_entries.async_forward_entry_setups(config_entry, ["sensor"])
    return True
