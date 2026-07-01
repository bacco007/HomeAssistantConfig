"""Config flow for SolsticeHub integration.

This implements a multi-step config flow:
1. Step 1 (user): Device type selection
2. Step 2: Device-specific options (varies by device type)

The instance name is not asked here: Home Assistant's standard final step
("name and assign area") lets the user name the device, so asking for a name
up front would be redundant. Each device type gets a sensible default name
that the user can override in that final step.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers import selector

from .const import (
    CONF_DEVICE_TYPE,
    CONF_HEMISPHERE,
    CONF_MODE,
    CONF_NAME,
    CONF_NAMING,
    CONF_SCOPE,
    DEVICE_CHINESE,
    DEVICE_CROSS_QUARTER,
    DEVICE_FOUR_SEASONS,
    DOMAIN,
    HEMISPHERE_NORTHERN,
    HEMISPHERE_SOUTHERN,
    MODE_ASTRONOMICAL,
    MODE_METEOROLOGICAL,
    MODE_TRADITIONAL,
    NAMING_CELTIC,
    NAMING_HANZI,
    NAMING_PINYIN,
    NAMING_SYSTEM,
    SCOPE_8_MAJOR,
    SCOPE_ALL_24,
)
from .device import device_model


class SolsticeHubConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for SolsticeHub."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._data: dict[str, Any] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle step 1: Device type selection.

        This is the entry point for the config flow. The user only picks the
        device type (Four Seasons, Cross-Quarter, or Chinese); the name is set
        later in Home Assistant's standard final step.
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            device_type = user_input[CONF_DEVICE_TYPE]

            # Store the type for the next step. The name is derived once the
            # device-specific options are known (see device_model) and can be
            # changed in HA's final "name and area" step.
            self._data = {CONF_DEVICE_TYPE: device_type}

            # Route to device-specific step
            if device_type == DEVICE_FOUR_SEASONS:
                return await self.async_step_four_seasons()
            elif device_type == DEVICE_CROSS_QUARTER:
                return await self.async_step_cross_quarter()
            elif device_type == DEVICE_CHINESE:
                return await self.async_step_chinese()

        # Build the form schema for step 1: device type as radio buttons.
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_DEVICE_TYPE, default=DEVICE_FOUR_SEASONS
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=DEVICE_FOUR_SEASONS,
                                label="Four Seasons",
                            ),
                            selector.SelectOptionDict(
                                value=DEVICE_CROSS_QUARTER,
                                label="Cross-Quarter / Celtic",
                            ),
                            selector.SelectOptionDict(
                                value=DEVICE_CHINESE,
                                label="Chinese Solar Terms",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.LIST,
                        translation_key="device_type",
                    ),
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_four_seasons(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle step 2 for Four Seasons device.

        Options:
        - Hemisphere (northern/southern)
        - Mode (astronomical/meteorological)
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            # Merge with data from step 1
            self._data[CONF_HEMISPHERE] = user_input[CONF_HEMISPHERE]
            self._data[CONF_MODE] = user_input[CONF_MODE]

            self._data[CONF_NAME] = device_model(
                DEVICE_FOUR_SEASONS, self._data, self.hass.config.language
            )
            return self.async_create_entry(
                title=self._data[CONF_NAME],
                data=self._data,
            )

        # Determine default hemisphere from Home Assistant's configured latitude
        default_hemisphere = (
            HEMISPHERE_NORTHERN if self.hass.config.latitude >= 0 else HEMISPHERE_SOUTHERN
        )

        data_schema = vol.Schema(
            {
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
            step_id="four_seasons",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_cross_quarter(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle step 2 for Cross-Quarter / Celtic device.

        Options:
        - Calculation mode (astronomical/traditional)
        - Naming (system language/celtic)
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            # Merge with data from step 1
            self._data[CONF_MODE] = user_input[CONF_MODE]
            self._data[CONF_NAMING] = user_input[CONF_NAMING]
            # Cross-Quarter is only for Northern Hemisphere
            self._data[CONF_HEMISPHERE] = HEMISPHERE_NORTHERN

            self._data[CONF_NAME] = device_model(
                DEVICE_CROSS_QUARTER, self._data, self.hass.config.language
            )
            return self.async_create_entry(
                title=self._data[CONF_NAME],
                data=self._data,
            )

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_MODE, default=MODE_ASTRONOMICAL
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=MODE_ASTRONOMICAL,
                                label="Astronomical (exact midpoints)",
                            ),
                            selector.SelectOptionDict(
                                value=MODE_TRADITIONAL,
                                label="Traditional (fixed dates)",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="cross_quarter_mode",
                    ),
                ),
                vol.Required(
                    CONF_NAMING, default=NAMING_SYSTEM
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=NAMING_SYSTEM,
                                label="System Language",
                            ),
                            selector.SelectOptionDict(
                                value=NAMING_CELTIC,
                                label="Celtic Names",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="naming",
                    ),
                ),
            }
        )

        return self.async_show_form(
            step_id="cross_quarter",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_chinese(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle step 2 for Chinese Solar Terms device.

        Options:
        - Scope (all 24 terms / 8 major terms)
        - Naming (system language/pinyin/hanzi)
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            # Merge with data from step 1
            self._data[CONF_SCOPE] = user_input[CONF_SCOPE]
            self._data[CONF_NAMING] = user_input[CONF_NAMING]
            # Chinese calendar is hemisphere-independent (historically Northern)
            self._data[CONF_HEMISPHERE] = HEMISPHERE_NORTHERN

            self._data[CONF_NAME] = device_model(
                DEVICE_CHINESE, self._data, self.hass.config.language
            )
            return self.async_create_entry(
                title=self._data[CONF_NAME],
                data=self._data,
            )

        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_SCOPE, default=SCOPE_ALL_24
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=SCOPE_ALL_24,
                                label="All 24 Solar Terms",
                            ),
                            selector.SelectOptionDict(
                                value=SCOPE_8_MAJOR,
                                label="8 Major Terms only",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="scope",
                    ),
                ),
                vol.Required(
                    CONF_NAMING, default=NAMING_SYSTEM
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            selector.SelectOptionDict(
                                value=NAMING_SYSTEM,
                                label="System Language",
                            ),
                            selector.SelectOptionDict(
                                value=NAMING_PINYIN,
                                label="Pinyin",
                            ),
                            selector.SelectOptionDict(
                                value=NAMING_HANZI,
                                label="Hanzi (Chinese Characters)",
                            ),
                        ],
                        mode=selector.SelectSelectorMode.DROPDOWN,
                        translation_key="chinese_naming",
                    ),
                ),
            }
        )

        return self.async_show_form(
            step_id="chinese",
            data_schema=data_schema,
            errors=errors,
        )
