"""Config flow: one confirmation step, plus options for the alert window."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
)

from .const import (
    ALERT_WINDOW_CHOICES,
    ALERT_WINDOW_DAYS,
    CONF_ALERT_WINDOW_DAYS,
    CONF_IGNORED_DOMAINS,
    DOMAIN,
    INDEX_URL,
    NAME,
)


class BreakageRadarConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Breakage Radar."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Confirm and create the single entry."""
        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})

        return self.async_show_form(
            step_id="user",
            description_placeholders={"index_url": INDEX_URL},
        )

    @staticmethod
    @callback
    def async_get_options_flow(entry: ConfigEntry) -> BreakageRadarOptionsFlow:
        return BreakageRadarOptionsFlow()


class BreakageRadarOptionsFlow(OptionsFlow):
    """How far ahead a deadline is worth its own notification, and what to skip."""

    def _ignorable_domains(self) -> list[str]:
        """What the ignore list offers: affected domains, plus what is ignored.

        An ignored domain is dropped from the report, so without the union it
        would disappear from the very picker that ignores it.
        """
        coordinator = self.hass.data.get(DOMAIN, {}).get(self.config_entry.entry_id)
        report = getattr(coordinator, "data", None) or {}
        ignored = self.config_entry.options.get(CONF_IGNORED_DOMAINS) or []
        return sorted({*report.get("affected_domains", []), *ignored})

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        if user_input is not None:
            return self.async_create_entry(
                data={
                    CONF_ALERT_WINDOW_DAYS: int(user_input[CONF_ALERT_WINDOW_DAYS]),
                    CONF_IGNORED_DOMAINS: user_input.get(CONF_IGNORED_DOMAINS) or [],
                }
            )

        current = self.config_entry.options.get(
            CONF_ALERT_WINDOW_DAYS, ALERT_WINDOW_DAYS
        )
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ALERT_WINDOW_DAYS, default=str(current)
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=[str(days) for days in ALERT_WINDOW_CHOICES],
                        mode=SelectSelectorMode.DROPDOWN,
                        translation_key=CONF_ALERT_WINDOW_DAYS,
                    )
                ),
                vol.Optional(
                    CONF_IGNORED_DOMAINS,
                    default=self.config_entry.options.get(CONF_IGNORED_DOMAINS)
                    or [],
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=self._ignorable_domains(),
                        multiple=True,
                        # A domain fixed upstream drops off the affected list.
                        # Without this its stored entry is not a valid option
                        # any more and the selector would silently discard it,
                        # un-ignoring the integration if it ever regresses.
                        custom_value=True,
                        mode=SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
