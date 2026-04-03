async def async_get_config_entry_diagnostics(hass, entry):
    coordinator = hass.data["untappd"].get(entry.entry_id)

    return {
        "config": dict(entry.data),
        "rate_limit": coordinator.data.rate_limit,
        "rate_remaining": coordinator.data.rate_remaining,
    }