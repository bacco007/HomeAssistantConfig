"""Config flow for OEC Tariff integration."""

import logging

import aiohttp
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_API_URL,
    CONF_BILLING_DAY,
    CONF_DNSP,
    CONF_POWER_ENTITY,
    CONF_TARIFF,
    DEFAULT_API_URL,
    DEFAULT_BILLING_DAY,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)

BILLING_DAY_OPTIONS = {i: f"{i}{'st' if i == 1 else 'nd' if i == 2 else 'rd' if i == 3 else 'th'} of month" for i in range(1, 29)}


class OecTariffConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for OEC Tariff."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize."""
        self._dnsps: list[dict] = []
        self._tariffs: list[dict] = []
        self._selected_dnsp: str = ""
        self._selected_tariff: str = ""

    async def async_step_user(self, user_input=None):
        """Handle the initial step — select DNSP."""
        errors = {}

        if user_input is not None:
            self._selected_dnsp = user_input[CONF_DNSP]
            return await self.async_step_tariff()

        # Fetch available DNSPs from API
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                f"{DEFAULT_API_URL}/dnsps", timeout=10
            ) as resp:
                if resp.status == 200:
                    self._dnsps = await resp.json()
                else:
                    errors["base"] = "cannot_connect"
        except (aiohttp.ClientError, TimeoutError):
            errors["base"] = "cannot_connect"

        if errors:
            return self.async_show_form(
                step_id="user",
                data_schema=vol.Schema({vol.Required(CONF_DNSP): str}),
                errors=errors,
            )

        dnsp_options = {
            d["code"]: f"{d['name']} ({d['state']})" for d in self._dnsps
        }

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {vol.Required(CONF_DNSP): vol.In(dnsp_options)}
            ),
            errors=errors,
        )

    async def async_step_tariff(self, user_input=None):
        """Handle tariff selection step."""
        errors = {}

        if user_input is not None:
            self._selected_tariff = user_input[CONF_TARIFF]
            if await self._tariff_has_demand_component():
                return await self.async_step_demand()
            return await self._async_finish_entry()

        # Fetch tariffs for selected DNSP
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                f"{DEFAULT_API_URL}/tariffs/{self._selected_dnsp}", timeout=10
            ) as resp:
                if resp.status == 200:
                    self._tariffs = await resp.json()
                else:
                    errors["base"] = "cannot_connect"
        except (aiohttp.ClientError, TimeoutError):
            errors["base"] = "cannot_connect"

        if errors:
            return self.async_show_form(
                step_id="tariff",
                data_schema=vol.Schema({vol.Required(CONF_TARIFF): str}),
                errors=errors,
            )

        tariff_options = {
            t["code"]: f"{t['code']} — {t['name']}" for t in self._tariffs
        }

        return self.async_show_form(
            step_id="tariff",
            data_schema=vol.Schema(
                {vol.Required(CONF_TARIFF): vol.In(tariff_options)}
            ),
            errors=errors,
        )

    async def _tariff_has_demand_component(self) -> bool:
        """Check whether the selected tariff has a demand-charge component.

        The tariff *list* endpoint (used by async_step_tariff's own form)
        deliberately only returns summary fields (code/name/tariff_type) --
        `demand` is only present on the per-tariff detail endpoint. Fetch it
        here so the demand-tracking step can be skipped entirely for
        tariffs that have no demand component (e.g. flat/ToU-only tariffs),
        instead of always asking for an optional power sensor that would
        never actually do anything.
        """
        session = async_get_clientsession(self.hass)
        try:
            async with session.get(
                f"{DEFAULT_API_URL}/tariffs/{self._selected_dnsp}/{self._selected_tariff}",
                timeout=10,
            ) as resp:
                if resp.status == 200:
                    detail = await resp.json()
                    return bool(detail.get("demand"))
        except (aiohttp.ClientError, TimeoutError):
            pass
        # If the check itself fails (network hiccup, etc.), fail open --
        # show the demand step rather than silently skip setup for a
        # tariff that might genuinely have a demand component.
        return True

    async def _async_finish_entry(self, power_entity=None, billing_day=None):
        """Create the config entry."""
        await self.async_set_unique_id(
            f"{self._selected_dnsp}_{self._selected_tariff}"
        )
        self._abort_if_unique_id_configured()

        data = {
            CONF_DNSP: self._selected_dnsp,
            CONF_TARIFF: self._selected_tariff,
            CONF_API_URL: DEFAULT_API_URL,
        }
        if power_entity:
            data[CONF_POWER_ENTITY] = power_entity
            data[CONF_BILLING_DAY] = billing_day or DEFAULT_BILLING_DAY

        return self.async_create_entry(
            title=f"{self._selected_dnsp}/{self._selected_tariff}",
            data=data,
        )

    async def async_step_demand(self, user_input=None):
        """Handle optional demand tracking configuration."""
        from homeassistant.helpers import selector

        if user_input is not None:
            return await self._async_finish_entry(
                user_input.get(CONF_POWER_ENTITY),
                user_input.get(CONF_BILLING_DAY, DEFAULT_BILLING_DAY),
            )

        return self.async_show_form(
            step_id="demand",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_POWER_ENTITY): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            device_class="power",
                        )
                    ),
                    vol.Optional(CONF_BILLING_DAY, default=DEFAULT_BILLING_DAY): vol.In(
                        BILLING_DAY_OPTIONS
                    ),
                }
            ),
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow handler."""
        return OecTariffOptionsFlow(config_entry)


class OecTariffOptionsFlow(config_entries.OptionsFlow):
    """Handle options for OEC Tariff."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Handle options step."""
        from homeassistant.helpers import selector

        if user_input is not None:
            # Update the config entry data
            new_data = {**self._config_entry.data}
            if user_input.get(CONF_POWER_ENTITY):
                new_data[CONF_POWER_ENTITY] = user_input[CONF_POWER_ENTITY]
            elif CONF_POWER_ENTITY in new_data:
                del new_data[CONF_POWER_ENTITY]
            new_data[CONF_BILLING_DAY] = user_input.get(CONF_BILLING_DAY, DEFAULT_BILLING_DAY)

            self.hass.config_entries.async_update_entry(
                self._config_entry, data=new_data
            )
            return self.async_create_entry(title="", data={})

        current_power = self._config_entry.data.get(CONF_POWER_ENTITY, "")
        current_billing_day = self._config_entry.data.get(CONF_BILLING_DAY, DEFAULT_BILLING_DAY)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_POWER_ENTITY, default=current_power): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            device_class="power",
                        )
                    ),
                    vol.Optional(CONF_BILLING_DAY, default=current_billing_day): vol.In(
                        BILLING_DAY_OPTIONS
                    ),
                }
            ),
        )
