from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigFlowResult
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers import selector

from .const import (
    DOMAIN,
    CONF_HOST,
    CONF_API_KEY,
    CONF_SITE,
    CONF_VERIFY_SSL,
    CONF_SCAN_INTERVAL,
    CONF_RATE_INTERVAL,
    CONF_AUTO_SPEEDTEST,
    CONF_AUTO_SPEEDTEST_MINUTES,
    DEFAULT_SITE,
    DEFAULT_VERIFY_SSL,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_RATE_INTERVAL,
    DEFAULT_AUTO_SPEEDTEST,
    DEFAULT_AUTO_SPEEDTEST_MINUTES,
)

_LOGGER = logging.getLogger(__name__)

API_KEY_SELECTOR = selector.selector({"text": {"type": "password"}})


class CannotConnect(Exception):
    """Error to indicate we cannot connect."""


class InvalidAuth(Exception):
    """Error to indicate the API key was rejected."""


async def _async_validate(
    hass: HomeAssistant, host: str, api_key: str, site: str, verify_ssl: bool
) -> None:
    """Probe /stat/device to check connectivity and basic shape."""
    host = (host or "").strip().rstrip("/")
    api_key = (api_key or "").strip()
    site = (site or DEFAULT_SITE).strip()
    session = async_get_clientsession(hass, verify_ssl)
    url = f"https://{host}/proxy/network/api/s/{site}/stat/device"
    headers = {"X-API-Key": api_key}
    try:
        async with session.get(url, headers=headers) as resp:
            if resp.status in (401, 403):
                raise InvalidAuth(f"HTTP {resp.status}")
            text = await resp.text()
            if resp.status != 200:
                raise CannotConnect(f"HTTP {resp.status}: {text[:200]}")
            js = await resp.json(content_type=None)
    except (InvalidAuth, CannotConnect):
        raise
    except Exception as e:
        raise CannotConnect(str(e)) from e
    if not isinstance(js, dict) or "data" not in js:
        raise CannotConnect("Unexpected response shape")


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input[CONF_HOST]
            api_key = user_input[CONF_API_KEY]
            site = user_input.get(CONF_SITE, DEFAULT_SITE)
            verify_ssl = user_input.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            auto_enable = user_input.get(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST)
            auto_minutes = max(
                1,
                int(
                    user_input.get(
                        CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES
                    )
                ),
            )

            try:
                await _async_validate(self.hass, host, api_key, site, verify_ssl)
            except InvalidAuth as e:
                _LOGGER.warning("Validation failed (auth): %s", e)
                errors["base"] = "invalid_auth"
            except CannotConnect as e:
                _LOGGER.warning("Validation failed: %s", e)
                errors["base"] = "cannot_connect"
            else:
                unique_id = (
                    f"{host.strip().rstrip('/')}-{(site or DEFAULT_SITE).strip()}"
                )
                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"UniFi WAN ({host})",
                    data={
                        CONF_HOST: host,
                        CONF_API_KEY: api_key,
                        CONF_SITE: site,
                        CONF_VERIFY_SSL: verify_ssl,
                        CONF_AUTO_SPEEDTEST: auto_enable,
                        CONF_AUTO_SPEEDTEST_MINUTES: auto_minutes,
                    },
                )

        data_schema = vol.Schema(
            {
                vol.Required(CONF_HOST): str,
                vol.Required(CONF_API_KEY): API_KEY_SELECTOR,
                vol.Optional(CONF_SITE, default=DEFAULT_SITE): str,
                vol.Optional(CONF_VERIFY_SSL, default=DEFAULT_VERIFY_SSL): bool,
                vol.Optional(CONF_AUTO_SPEEDTEST, default=DEFAULT_AUTO_SPEEDTEST): bool,
                vol.Optional(
                    CONF_AUTO_SPEEDTEST_MINUTES,
                    default=DEFAULT_AUTO_SPEEDTEST_MINUTES,
                ): int,
            }
        )
        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    async def async_step_import(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        return await self.async_step_user(user_input)

    async def async_step_reauth(
        self, entry_data: Mapping[str, Any]
    ) -> ConfigFlowResult:
        """Handle reauthentication when the API key stops working."""
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        entry = self._get_reauth_entry()
        host = entry.options.get(CONF_HOST, entry.data.get(CONF_HOST, ""))
        site = entry.options.get(CONF_SITE, entry.data.get(CONF_SITE, DEFAULT_SITE))
        verify_ssl = entry.options.get(
            CONF_VERIFY_SSL, entry.data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
        )

        if user_input is not None:
            api_key = user_input[CONF_API_KEY]
            try:
                await _async_validate(self.hass, host, api_key, site, verify_ssl)
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except CannotConnect:
                errors["base"] = "cannot_connect"
            else:
                # The API key may also be stored in options (the options flow
                # writes it there); update both so the new key takes effect.
                new_options = dict(entry.options)
                if CONF_API_KEY in new_options:
                    new_options[CONF_API_KEY] = api_key
                return self.async_update_reload_and_abort(
                    entry,
                    data_updates={CONF_API_KEY: api_key},
                    options=new_options,
                )

        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema({vol.Required(CONF_API_KEY): API_KEY_SELECTOR}),
            description_placeholders={"host": host},
            errors=errors,
        )

    @staticmethod
    def async_get_options_flow(entry):
        return OptionsFlowHandler()


class OptionsFlowHandler(config_entries.OptionsFlow):
    def _opt(self, key: str, default: Any = None) -> Any:
        """Current effective value: options first, then data, then default."""
        entry = self.config_entry
        return entry.options.get(key, entry.data.get(key, default))

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input.get(CONF_HOST) or self._opt(CONF_HOST, "")
            # An empty API key field means "keep the stored key"
            api_key = user_input.get(CONF_API_KEY) or self._opt(CONF_API_KEY, "")
            site = user_input.get(CONF_SITE) or self._opt(CONF_SITE, DEFAULT_SITE)
            verify_ssl = user_input.get(
                CONF_VERIFY_SSL, self._opt(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            )
            scan_interval = max(
                5, int(user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL))
            )
            rate_interval = max(
                0, int(user_input.get(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL))
            )
            auto_enable = user_input.get(
                CONF_AUTO_SPEEDTEST, self._opt(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST)
            )
            auto_minutes = max(
                1,
                int(
                    user_input.get(
                        CONF_AUTO_SPEEDTEST_MINUTES,
                        self._opt(
                            CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES
                        ),
                    )
                ),
            )

            new_options = {
                CONF_HOST: host,
                CONF_API_KEY: api_key,
                CONF_SITE: site,
                CONF_VERIFY_SSL: verify_ssl,
                CONF_SCAN_INTERVAL: scan_interval,
                CONF_RATE_INTERVAL: rate_interval,
                CONF_AUTO_SPEEDTEST: auto_enable,
                CONF_AUTO_SPEEDTEST_MINUTES: auto_minutes,
            }

            try:
                await _async_validate(self.hass, host, api_key, site, verify_ssl)
            except InvalidAuth as e:
                _LOGGER.warning("Options validation failed (auth): %s", e)
                errors["base"] = "invalid_auth"
            except CannotConnect as e:
                _LOGGER.warning("Options validation failed: %s", e)
                errors["base"] = "cannot_connect"

            if not errors:
                return self.async_create_entry(title="", data=new_options)

            return self.async_show_form(
                step_id="init",
                data_schema=self._schema(new_options),
                errors=errors,
            )

        return self.async_show_form(step_id="init", data_schema=self._schema())

    def _schema(self, overrides: dict[str, Any] | None = None) -> vol.Schema:
        o = overrides or {}

        def d(key: str, default: Any) -> Any:
            return o.get(key, self._opt(key, default))

        return vol.Schema(
            {
                vol.Optional(CONF_HOST, default=d(CONF_HOST, "")): str,
                vol.Optional(CONF_API_KEY): API_KEY_SELECTOR,
                vol.Optional(CONF_SITE, default=d(CONF_SITE, DEFAULT_SITE)): str,
                vol.Optional(
                    CONF_VERIFY_SSL, default=d(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
                ): bool,
                vol.Optional(
                    CONF_SCAN_INTERVAL, default=d(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
                ): int,
                vol.Optional(
                    CONF_RATE_INTERVAL, default=d(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL)
                ): int,
                vol.Optional(
                    CONF_AUTO_SPEEDTEST,
                    default=d(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST),
                ): bool,
                vol.Optional(
                    CONF_AUTO_SPEEDTEST_MINUTES,
                    default=d(CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES),
                ): int,
            }
        )
