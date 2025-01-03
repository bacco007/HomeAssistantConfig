from dataclasses import asdict
from typing import Any

from homeassistant.core import HomeAssistant

from custom_components.gtfs_realtime import GtfsRealtimeConfigEntry


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: GtfsRealtimeConfigEntry
) -> dict[str, Any]:
    return {
        "schedule": asdict(entry.runtime_data.data.schedule),
        "last_static_update": entry.runtime_data.last_static_update,
        "static_update_frequency": entry.runtime_data.static_timedelta,
    }
