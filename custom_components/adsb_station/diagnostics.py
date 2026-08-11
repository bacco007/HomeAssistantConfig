"""Diagnostics support for the ADS-B Station integration."""

from __future__ import annotations

from dataclasses import asdict
from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant

from .const import CONF_AIRCRAFT_URL, CONF_STATS_URL
from .coordinator import AdsbStationConfigEntry, AircraftStats

# The feed alias names the user's public Flightradar24 feed and site_url their
# FlightAware account, fr24key is a credential, and the URLs carry the address
# of their receiver.
TO_REDACT = {
    CONF_HOST,
    CONF_AIRCRAFT_URL,
    CONF_STATS_URL,
    "feed_alias",
    "fr24key",
    "site_url",
    "local_ips",
}


def _aircraft(stats: AircraftStats) -> dict[str, Any]:
    """Describe one poll, without repeating the whole sky.

    Every aircraft the decoder was holding is kept for the services to answer
    out of, and on a good afternoon that is a few hundred. What helps here is
    how many there were, not which; the ones that are worth naming are the
    superlatives and the aircraft in range, and those are still here in full.
    """
    payload = asdict(stats)
    payload["heard"] = len(stats.heard)
    return payload


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: AdsbStationConfigEntry
) -> dict[str, Any]:
    """Return diagnostics for a config entry."""
    coordinator = entry.runtime_data
    data = coordinator.data
    return {
        "entry_data": async_redact_data(dict(entry.data), TO_REDACT),
        "entry_options": dict(entry.options),
        "has_feeder": coordinator.client.has_feeder,
        "feeder_type": coordinator.feeder_type,
        "receiver_version": coordinator.receiver_version,
        "feeder": (
            None if data.feeder is None else async_redact_data(data.feeder, TO_REDACT)
        ),
        "aircraft": None if data.aircraft is None else _aircraft(data.aircraft),
        "reception": None if data.stats is None else asdict(data.stats),
        "range_measured_from": coordinator.origin,
        "range_measured_from_source": coordinator.origin_source,
    }
