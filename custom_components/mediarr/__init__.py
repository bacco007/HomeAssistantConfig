# mediarr/__init__.py
"""The Mediarr integration."""

DOMAIN = "mediarr"

async def async_setup(hass, config):
    """Set up the Mediarr component."""
    return True

async def async_setup_entry(hass, entry):
    """Set up Mediarr from a config entry."""
    hass.async_create_task(
        hass.config_entries.async_forward_entry_setup(entry, "sensor")
    )
    return True