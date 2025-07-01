import voluptuous as vol

from homeassistant import config_entries

from .const import CONF_ENABLED_SENSORS, DOMAIN, CONF_ICAO_ID


class AviationWeatherConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Aviation weather config flow."""

    # The schema version of the entries that it creates
    # Home Assistant will call your migrate method if the version changes
    VERSION = 1

    async def async_step_user(self, info):
        self.aviationweather_schema = vol.Schema({vol.Required(CONF_ICAO_ID): str})

        if info is not None:
            await self.async_set_unique_id(info[CONF_ICAO_ID])
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title="Aviation weather for " + info[CONF_ICAO_ID], data=info
            )

        return self.async_show_form(
            step_id="user", data_schema=self.aviationweather_schema
        )
