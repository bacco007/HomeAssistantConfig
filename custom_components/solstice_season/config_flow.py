"""Config flow for Solstice Season integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers import selector
from homeassistant.util import slugify

from .const import (
    CONF_HEMISPHERE,
    CONF_MODE,
    CONF_NAME,
    DEFAULT_NAME,
    DOMAIN,
    HEMISPHERE_NORTHERN,
    HEMISPHERE_SOUTHERN,
    MODE_ASTRONOMICAL,
    MODE_METEOROLOGICAL,
)


class SolsticeSeasonConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Solstice Season."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step.

        This is the only step in the config flow. Users provide:
        - A name for the instance (becomes entity prefix)
        - The hemisphere (northern or southern)
        - The calculation mode (astronomical or meteorological)
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            # Generate unique ID from name
            unique_id = slugify(user_input[CONF_NAME])
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=user_input[CONF_NAME],
                data=user_input,
            )

        # Determine default hemisphere from Home Assistant's configured latitude
        default_hemisphere = (
            HEMISPHERE_NORTHERN if self.hass.config.latitude >= 0 else HEMISPHERE_SOUTHERN
        )

        # Build the form schema
        data_schema = vol.Schema(
            {
                vol.Required(CONF_NAME, default=DEFAULT_NAME): str,
                vol.Required(
                    CONF_HEMISPHERE, default=default_hemisphere
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=HEMISPHERE_NORTHERN,
                                label="Northern Hemisphere",
                            ),
                            selector.SelectOptionDict(
                                value=HEMISPHERE_SOUTHERN,
                                label="Southern Hemisphere",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="hemisphere",
                    ),
                ),
                vol.Required(
                    CONF_MODE, default=MODE_ASTRONOMICAL
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=MODE_ASTRONOMICAL,
                                label="Astronomical",
                            ),
                            selector.SelectOptionDict(
                                value=MODE_METEOROLOGICAL,
                                label="Meteorological",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="mode",
                    ),
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
        )
