#  Copyright (c) 2019-2024, Andrey "Limych" Khrolenok <andrey@khrolenok.ru>
#  Creative Commons BY-NC-SA 4.0 International Public License
#  (see LICENSE.md or https://creativecommons.org/licenses/by-nc-sa/4.0/)

"""
The Average Sensor.

For more details about this sensor, please refer to the documentation at
https://github.com/Limych/ha-average/
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import voluptuous as vol
from homeassistant.const import SERVICE_RELOAD
from homeassistant.helpers.reload import async_reload_integration_platforms

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant, ServiceCall
    from homeassistant.helpers.typing import ConfigType

from .const import DOMAIN, PLATFORMS, STARTUP_MESSAGE

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:  # noqa: ARG001
    """Set up the platforms."""
    # Print startup message
    _LOGGER.info(STARTUP_MESSAGE)

    async def reload_service_handler(service: ServiceCall) -> None:  # noqa: ARG001
        """Reload all average sensors from config."""
        await async_reload_integration_platforms(hass, DOMAIN, PLATFORMS)

    hass.services.async_register(
        DOMAIN, SERVICE_RELOAD, reload_service_handler, schema=vol.Schema({})
    )

    return True
