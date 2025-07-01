"""Support for PSN Send Message service."""

from __future__ import annotations

import logging

from homeassistant.components.notify import ATTR_TARGET, BaseNotificationService
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from psnawp_api.core.psnawp_exceptions import PSNAWPNotFoundError

from .const import DOMAIN, PSN_API

_LOGGER = logging.getLogger(__name__)


def get_service(
    hass: HomeAssistant,
    config_entry: ConfigType,
    discovery_info: DiscoveryInfoType | None = None,
) -> PsnNotificationService | None:
    """Get the Psn notification service."""
    if discovery_info is None:
        return None

    data = hass.data[DOMAIN][discovery_info.get("entry_id")][PSN_API]
    return PsnNotificationService(data, hass)


class PsnNotificationService(BaseNotificationService):
    """Implement the notification service for the PSN Network."""

    def __init__(self, psn, hass) -> None:
        """Initialize the service."""
        self.psn = psn
        self.hass = hass

    async def async_send_message(self, message="", **kwargs):
        """Send a message."""
        users = kwargs.get(ATTR_TARGET)
        user_list = []

        if not users:
            raise ValueError("Missing required argument: target")

        for user in users:
            try:
                individual = await self.hass.async_add_executor_job(
                    lambda: self.psn.user(online_id=user)
                )
                user_list.append(individual)
            except PSNAWPNotFoundError as err:
                _LOGGER.error("User not found: %s", user)
                raise err

        group = await self.hass.async_add_executor_job(
            lambda: self.psn.group(users_list=user_list)
        )
        response = await self.hass.async_add_executor_job(
            lambda: group.send_message(message)
        )
        _LOGGER.debug("Send Message Response: %s", response)
