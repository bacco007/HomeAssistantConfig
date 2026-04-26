"""Config flow for Awtrix integration."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any, Self

from homeassistant import config_entries
from typing_extensions import override

from .const import (
    DOMAIN,
)

if TYPE_CHECKING:
    from homeassistant.data_entry_flow import FlowResult

_LOGGER = logging.getLogger(__name__)


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Awtrix."""

    VERSION = 2
    single_instance_allowed = True

    def __init__(self) -> None:
        """Initialize values."""
        self._errors = None

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> FlowResult:
        """Config flow for Awtrix."""
        self._errors = {}

        return self.async_create_entry(title="Awtrix", data={})

    @override
    def is_matching(self, other_flow: Self) -> bool:
        return False
