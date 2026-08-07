"""Service handlers for unifi_alerts.clear_category and unifi_alerts.clear_all."""

from __future__ import annotations

import logging
from collections.abc import Iterator
from typing import TYPE_CHECKING

import voluptuous as vol
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers import config_validation as cv

from .const import ALL_CATEGORIES, DOMAIN

if TYPE_CHECKING:
    from .coordinator import UniFiAlertsCoordinator

_LOGGER = logging.getLogger(__name__)

SERVICE_CLEAR_CATEGORY = "clear_category"
SERVICE_CLEAR_ALL = "clear_all"

ATTR_CATEGORY = "category"
ATTR_ENTRY_ID = "entry_id"

CLEAR_CATEGORY_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_CATEGORY): vol.In(ALL_CATEGORIES),
        vol.Optional(ATTR_ENTRY_ID): cv.string,
    }
)

CLEAR_ALL_SCHEMA = vol.Schema(
    {
        vol.Optional(ATTR_ENTRY_ID): cv.string,
    }
)


def _get_coordinators(
    hass: HomeAssistant, entry_id: str | None
) -> Iterator[UniFiAlertsCoordinator]:
    """Yield coordinator(s) from loaded entries, optionally filtered by entry_id.

    When entry_id is given explicitly and it does not resolve to a currently
    loaded UniFi Alerts config entry, a translatable ServiceValidationError is
    raised so the failure is visible in the UI/automation trace instead of only
    the log. entry_id=None (act on every loaded entry) never raises: an empty
    result set is a valid outcome for that case.
    """
    if entry_id is not None:
        entry = hass.config_entries.async_get_entry(entry_id)
        if entry is None or entry.domain != DOMAIN:
            _LOGGER.warning(
                "clear service called with unknown entry_id %r — no coordinator found",
                entry_id,
            )
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="unknown_entry_id",
                translation_placeholders={"entry_id": entry_id},
            )
        if entry.state != ConfigEntryState.LOADED:
            _LOGGER.warning(
                "clear service called on entry %r which is not loaded (state: %s)",
                entry_id,
                entry.state,
            )
            raise ServiceValidationError(
                translation_domain=DOMAIN,
                translation_key="entry_not_loaded",
                translation_placeholders={"entry_id": entry_id},
            )
        yield entry.runtime_data.coordinator
    else:
        for entry in hass.config_entries.async_entries(DOMAIN):
            if entry.state == ConfigEntryState.LOADED:
                yield entry.runtime_data.coordinator


async def _handle_clear_category(call: ServiceCall) -> None:
    """Handle the clear_category service call."""
    hass: HomeAssistant = call.hass
    category: str = call.data[ATTR_CATEGORY]
    entry_id: str | None = call.data.get(ATTR_ENTRY_ID)

    for coordinator in _get_coordinators(hass, entry_id):
        await coordinator.async_clear_category(category)
        _LOGGER.debug("Service clear_category: cleared category %s", category)


async def _handle_clear_all(call: ServiceCall) -> None:
    """Handle the clear_all service call."""
    hass: HomeAssistant = call.hass
    entry_id: str | None = call.data.get(ATTR_ENTRY_ID)

    for coordinator in _get_coordinators(hass, entry_id):
        await coordinator.async_clear_all()
        _LOGGER.debug("Service clear_all: cleared all categories")


def async_register_services(hass: HomeAssistant) -> None:
    """Register integration services. Idempotent — safe to call multiple times."""
    if not hass.services.has_service(DOMAIN, SERVICE_CLEAR_CATEGORY):
        hass.services.async_register(
            DOMAIN,
            SERVICE_CLEAR_CATEGORY,
            _handle_clear_category,
            schema=CLEAR_CATEGORY_SCHEMA,
        )

    if not hass.services.has_service(DOMAIN, SERVICE_CLEAR_ALL):
        hass.services.async_register(
            DOMAIN,
            SERVICE_CLEAR_ALL,
            _handle_clear_all,
            schema=CLEAR_ALL_SCHEMA,
        )


def async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister integration services. Only call when the last entry is unloaded."""
    if hass.services.has_service(DOMAIN, SERVICE_CLEAR_CATEGORY):
        hass.services.async_remove(DOMAIN, SERVICE_CLEAR_CATEGORY)

    if hass.services.has_service(DOMAIN, SERVICE_CLEAR_ALL):
        hass.services.async_remove(DOMAIN, SERVICE_CLEAR_ALL)
