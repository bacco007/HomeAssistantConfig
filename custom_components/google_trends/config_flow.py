import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_NAME

from .const import DOMAIN, CONF_COUNTRY_CODE, CONF_UPDATE_INTERVAL, CONF_TRENDS_COUNT

class GoogleTrendsFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    async def async_step_user(self, user_input=None):
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        errors = {}

        if user_input is not None:
            return self.async_create_entry(title="Google Trends", data=user_input)

        data_schema = {
            vol.Required(
                CONF_COUNTRY_CODE, description={"suggested_value": "united_kingdom"}
            ): str,
            vol.Required(
                CONF_UPDATE_INTERVAL, default=5, description={"suggested_value": 5}
            ): int,
            vol.Required(
                CONF_TRENDS_COUNT, default=5, description={"suggested_value": 5}
            ): int,
        }

        return self.async_show_form(
            step_id="user", data_schema=vol.Schema(data_schema), errors=errors
        )