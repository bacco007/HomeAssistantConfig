"""CAP Alerts — one entity per active weather alert."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.instance_id import async_get as async_get_instance_id

from .const import (
    CONF_PROVIDER,
    CONF_TIMEOUT,
    DEFAULT_TIMEOUT,
    DOMAIN,
    PLATFORMS,
    USER_AGENT,
)
from .coordinator import AlertsDataUpdateCoordinator
from .flows.common import compute_scope_key
from .geometry_store import GeometryStore
from .providers import get_provider
from .providers.cap_content_cache import CAPContentCache
from .views import CapAlertsGeometryView
from .websocket import async_register as async_register_ws

_LOGGER = logging.getLogger(__name__)

type CAPAlertsConfigEntry = ConfigEntry[AlertsDataUpdateCoordinator]


@callback
def _async_ensure_scope_key(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Backfill the scope key on an entry created before issue #130.

    The flow now sets it at creation, but every entry that already exists has
    ``unique_id is None`` and would go on colliding with nothing — the
    duplicate guard would protect new installs only. Setting it at setup is
    what makes the guard retroactive.

    A key already held by another entry is left unset rather than forced:
    Home Assistant logs an error and re-indexes on a duplicate, and these are
    exactly the pre-existing duplicates the feature is meant to prevent, which
    nothing here can safely merge. One warning names both so the user can
    delete the one they don't want.
    """
    if entry.unique_id is not None:
        return
    key = compute_scope_key(entry.data)
    existing = hass.config_entries.async_entry_for_domain_unique_id(DOMAIN, key)
    if existing is not None:
        _LOGGER.warning(
            "%s duplicates %s: both watch %s. Delete one — until then neither "
            "is protected from a third",
            entry.title,
            existing.title,
            key,
        )
        return
    hass.config_entries.async_update_entry(entry, unique_id=key)


async def async_setup_entry(hass: HomeAssistant, entry: CAPAlertsConfigEntry) -> bool:
    """Set up CAP Alerts from a config entry."""
    _async_ensure_scope_key(hass, entry)
    instance_id = await async_get_instance_id(hass)
    user_agent = USER_AGENT.format(instance_id)

    domain_data = hass.data.setdefault(DOMAIN, {})
    if "geometry_store" not in domain_data:
        domain_data["geometry_store"] = GeometryStore()
    if "cap_content_cache" not in domain_data:
        domain_data["cap_content_cache"] = CAPContentCache()
    if not domain_data.get("registered"):
        hass.http.register_view(CapAlertsGeometryView(domain_data["geometry_store"]))
        async_register_ws(hass)
        domain_data["registered"] = True

    provider = get_provider(entry.data[CONF_PROVIDER])
    coordinator = AlertsDataUpdateCoordinator(
        hass,
        entry,
        provider,
        user_agent,
        domain_data["geometry_store"],
        domain_data["cap_content_cache"],
    )
    await coordinator.async_config_entry_first_refresh()

    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    # Start the NAAD real-time stream (no-op unless ECCC streaming is enabled).
    # The first refresh above already seeded the active set from the GeoRSS
    # backfill, so the stream only needs to carry live updates + reconnect gaps.
    await coordinator.async_start_stream()
    entry.async_on_unload(coordinator.async_stop_stream)
    entry.async_on_unload(entry.add_update_listener(_async_entry_updated))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: CAPAlertsConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def _async_entry_updated(
    hass: HomeAssistant, entry: CAPAlertsConfigEntry
) -> None:
    """Apply an entry update, reloading only when the change requires it.

    This listener is the **sole** owner of reload decisions. The reconfigure
    flow deliberately calls ``async_update_and_abort`` rather than
    ``async_update_reload_and_abort``: pairing a reloading flow method with an
    update listener reloads the entry twice and can race, which Home Assistant
    deprecated in 2026.6 and makes an error in 2026.12. So anything the flow
    used to reload for has to be recognised here instead.

    Cheap options — poll interval, timeout — are applied in place. That is the
    reason the listener exists at all rather than reloading unconditionally:
    a reload tears down and re-establishes the ECCC NAAD stream socket, which
    is far too heavy a price for nudging a scan interval.
    """
    coordinator: AlertsDataUpdateCoordinator = entry.runtime_data
    # A reconfigure rewrites entry data — provider, location, source, filter
    # mode — all of which are read once when the coordinator is constructed.
    # Nothing short of a rebuild picks them up.
    if coordinator.entry_data_changed(entry):
        hass.config_entries.async_schedule_reload(entry.entry_id)
        return
    # Toggling real-time streaming changes ingestion wiring captured when the
    # coordinator was built (the stream task, the poll-vs-resync interval), so a
    # clean reload is simpler and safer than in-place re-wiring.
    if AlertsDataUpdateCoordinator.streaming_enabled(entry) != coordinator.streaming:
        hass.config_entries.async_schedule_reload(entry.entry_id)
        return
    coordinator.update_interval = coordinator.resolve_update_interval(entry)
    coordinator.update_timeout(entry.options.get(CONF_TIMEOUT, DEFAULT_TIMEOUT))
    await coordinator.async_request_refresh()
