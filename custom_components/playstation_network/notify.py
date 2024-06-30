"""Support for PSN Send Message service."""

from __future__ import annotations

import logging

from homeassistant.components.notify import ATTR_TARGET, BaseNotificationService
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType

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
    return PsnNotificationService(data)


class PsnNotificationService(BaseNotificationService):
    """Implement the notification service for the PSN Network."""

    def __init__(self, psn) -> None:
        """Initialize the service."""
        self.psn = psn

    async def async_send_message(self, message="", **kwargs):
        """Send a message."""
        users = kwargs.get(ATTR_TARGET)
        user_list = []

        if not users:
            raise ValueError("Missing required argument: target")

        for user in users:
            individual = await self.psn.user(online_id=user)
            user_list.append(individual)

        group = await self.psn.group(users_list=user_list)
        response = await group.send_message(message)
        _LOGGER.debug("Send Message Response: %s", response)
