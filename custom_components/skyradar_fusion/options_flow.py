import voluptuous as vol
from homeassistant import config_entries
from .const import CONF_RADIUS, CONF_LATITUDE, CONF_LONGITUDE


class SkyRadarFusionOptionsFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry):
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_LATITUDE, default=self.config_entry.data.get(CONF_LATITUDE)
                    ): float,
                    vol.Required(
                        CONF_LONGITUDE,
                        default=self.config_entry.data.get(CONF_LONGITUDE),
                    ): float,
                    vol.Required(
                        CONF_RADIUS, default=self.config_entry.data.get(CONF_RADIUS)
                    ): int,
                }
            ),
        )
