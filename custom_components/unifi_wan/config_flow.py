from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult
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
    async with session.get(url, headers=headers) as resp:
        text = await resp.text()
        if resp.status != 200:
            raise Exception(f"HTTP {resp.status}: {text[:200]}")
        js = await resp.json(content_type=None)
        if not isinstance(js, dict) or "data" not in js:
            raise Exception("Unexpected response shape")


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            host = user_input[CONF_HOST]
            api_key = user_input[CONF_API_KEY]
            site = user_input.get(CONF_SITE, DEFAULT_SITE)
            verify_ssl = user_input.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            auto_enable = user_input.get(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST)
            auto_minutes = int(
                user_input.get(
                    CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES
                )
            )
            if auto_minutes < 1:
                auto_minutes = 1

            try:
                await _async_validate(self.hass, host, api_key, site, verify_ssl)
            except Exception as e:
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
                vol.Required(CONF_API_KEY): selector.selector(
                    {"text": {"type": "password"}}
                ),
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
    ) -> FlowResult:
        return await self.async_step_user(user_input)

    async def async_step_reauth(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        return await self.async_step_user(user_input)

    @staticmethod
    def async_get_options_flow(entry):
        return OptionsFlowHandler(entry)


class OptionsFlowHandler(config_entries.OptionsFlow):
    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        self.entry = entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        opts = self.entry.options
        data = self.entry.data

        if user_input is not None:
            host = user_input.get(
                CONF_HOST, opts.get(CONF_HOST, data.get(CONF_HOST, ""))
            )
            api_key = user_input.get(CONF_API_KEY)
            if not api_key:
                api_key = opts.get(CONF_API_KEY, data.get(CONF_API_KEY, ""))
            site = user_input.get(
                CONF_SITE, opts.get(CONF_SITE, data.get(CONF_SITE, DEFAULT_SITE))
            )
            verify_ssl = user_input.get(
                CONF_VERIFY_SSL,
                opts.get(
                    CONF_VERIFY_SSL, data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
                ),
            )

            scan_interval = int(
                user_input.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
            )
            rate_interval = int(
                user_input.get(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL)
            )
            auto_enable = user_input.get(
                CONF_AUTO_SPEEDTEST,
                data.get(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST),
            )
            auto_minutes = int(
                user_input.get(
                    CONF_AUTO_SPEEDTEST_MINUTES,
                    data.get(
                        CONF_AUTO_SPEEDTEST_MINUTES, DEFAULT_AUTO_SPEEDTEST_MINUTES
                    ),
                )
            )

            if scan_interval < 5:
                scan_interval = 5
            if rate_interval < 0:
                rate_interval = 0
            if auto_minutes < 1:
                auto_minutes = 1

            errors: dict[str, str] = {}
            try:
                await _async_validate(self.hass, host, api_key, site, verify_ssl)
            except Exception as e:
                _LOGGER.warning("Options validation failed: %s", e)
                errors["base"] = "cannot_connect"

            if errors:
                schema = self._schema(
                    host=host,
                    api_key=api_key,
                    site=site,
                    verify_ssl=verify_ssl,
                    scan_interval=scan_interval,
                    rate_interval=rate_interval,
                    auto_enable=auto_enable,
                    auto_minutes=auto_minutes,
                )
                return self.async_show_form(
                    step_id="init", data_schema=schema, errors=errors
                )

            user_input[CONF_HOST] = host
            user_input[CONF_API_KEY] = api_key
            user_input[CONF_SITE] = site
            user_input[CONF_VERIFY_SSL] = verify_ssl
            user_input[CONF_SCAN_INTERVAL] = scan_interval
            user_input[CONF_RATE_INTERVAL] = rate_interval
            user_input[CONF_AUTO_SPEEDTEST] = auto_enable
            user_input[CONF_AUTO_SPEEDTEST_MINUTES] = auto_minutes

            return self.async_create_entry(title="", data=user_input)

        schema = self._schema()
        return self.async_show_form(step_id="init", data_schema=schema)

    def _schema(
        self,
        host: str | None = None,
        api_key: str | None = None,
        site: str | None = None,
        verify_ssl: bool | None = None,
        scan_interval: int | None = None,
        rate_interval: int | None = None,
        auto_enable: bool | None = None,
        auto_minutes: int | None = None,
    ):
        opts = self.entry.options
        data = self.entry.data

        host_default = (
            host
            if host is not None
            else opts.get(CONF_HOST, data.get(CONF_HOST, ""))
        )
        api_default = (
            api_key
            if api_key is not None
            else opts.get(CONF_API_KEY, data.get(CONF_API_KEY, ""))
        )
        site_default = (
            site
            if site is not None
            else opts.get(CONF_SITE, data.get(CONF_SITE, DEFAULT_SITE))
        )
        verify_default = (
            verify_ssl
            if verify_ssl is not None
            else opts.get(
                CONF_VERIFY_SSL, data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            )
        )
        scan_default = (
            scan_interval
            if scan_interval is not None
            else opts.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        )
        rate_default = (
            rate_interval
            if rate_interval is not None
            else opts.get(CONF_RATE_INTERVAL, DEFAULT_RATE_INTERVAL)
        )
        auto_default = (
            auto_enable
            if auto_enable is not None
            else opts.get(
                CONF_AUTO_SPEEDTEST,
                data.get(CONF_AUTO_SPEEDTEST, DEFAULT_AUTO_SPEEDTEST),
            )
        )
        auto_min_default = (
            auto_minutes
            if auto_minutes is not None
            else opts.get(
                CONF_AUTO_SPEEDTEST_MINUTES,
                data.get(
                    CONF_AUTO_SPEEDTEST_MINUTES,
                    DEFAULT_AUTO_SPEEDTEST_MINUTES,
                ),
            )
        )

        return vol.Schema(
            {
                vol.Optional(CONF_HOST, default=host_default): str,
                vol.Optional(CONF_API_KEY): selector.selector(
                    {"text": {"type": "password"}}
                ),
                vol.Optional(CONF_SITE, default=site_default): str,
                vol.Optional(CONF_VERIFY_SSL, default=verify_default): bool,
                vol.Optional(CONF_SCAN_INTERVAL, default=scan_default): int,
                vol.Optional(CONF_RATE_INTERVAL, default=rate_default): int,
                vol.Optional(CONF_AUTO_SPEEDTEST, default=auto_default): bool,
                vol.Optional(
                    CONF_AUTO_SPEEDTEST_MINUTES, default=auto_min_default
                ): int,
            }
        )
