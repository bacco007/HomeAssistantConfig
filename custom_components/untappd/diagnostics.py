from .const import DOMAIN


async def async_get_config_entry_diagnostics(hass, entry):
    coordinator = hass.data.get(DOMAIN, {}).get(entry.entry_id)

    diagnostics = {
        "config": dict(entry.data),
        "coordinator_loaded": coordinator is not None,
    }

    if coordinator is None:
        return diagnostics

    diagnostics["rate_limit"] = (
        coordinator.data.rate_limit if coordinator.data else None
    )
    diagnostics["rate_remaining"] = (
        coordinator.data.rate_remaining if coordinator.data else None
    )

    return diagnostics