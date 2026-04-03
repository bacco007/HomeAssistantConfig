from .const import DOMAIN


async def async_get_config_entry_diagnostics(hass, entry):
    coordinator = hass.data.get(DOMAIN, {}).get(entry.entry_id)

    diagnostics = {
        "config": {
            "username": entry.data.get("username"),
            "client_id": "<redacted>",
            "client_secret": "<redacted>",
        },
        "coordinator_loaded": coordinator is not None,
    }

    if coordinator is None:
        return diagnostics

    diagnostics["last_update_success"] = coordinator.last_update_success
    diagnostics["last_exception"] = (
        str(coordinator.last_exception) if coordinator.last_exception else None
    )

    if coordinator.data:
        diagnostics["rate_limit"] = coordinator.data.rate_limit
        diagnostics["rate_remaining"] = coordinator.data.rate_remaining

    return diagnostics
