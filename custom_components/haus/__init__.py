"""The HAUS integration: a score for how much Home Assistant is being used."""

from homeassistant.config_entries import (
    SIGNAL_CONFIG_ENTRY_CHANGED,
    ConfigEntry,
    ConfigEntryChange,
)
from homeassistant.const import (
    ATTR_DOMAIN,
    EVENT_CALL_SERVICE,
    EVENT_STATE_CHANGED,
    Platform,
)
from homeassistant.core import (
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.start import async_at_started
from homeassistant.helpers.typing import ConfigType
from homeassistant.util import dt as dt_util

from .const import DOMAIN, HAGHS_DOMAIN, NOTIFY_DOMAIN
from .coordinator import HausConfigEntry, HausCoordinator
from .frontend import async_register as async_register_frontend
from .frontend import async_remove_resource as async_remove_frontend
from .store import HausStore
from .websocket import async_register as async_register_websocket

PLATFORMS = [Platform.SENSOR]

# async_setup exists to register the websocket command and the frontend - the
# parts that happen once rather than once per entry - which is what makes
# hassfest ask for a schema. HAUS reads nothing from YAML, so a `haus:` block
# is a mistake, and this says so with a repair issue rather than silently
# ignoring it.
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the parts of HAUS that exist once, not once per entry."""
    async_register_websocket(hass)

    async def _register_frontend(_: HomeAssistant) -> None:
        """Serve and register the card once the HTTP stack is up."""
        await async_register_frontend(hass)

    async_at_started(hass, _register_frontend)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: HausConfigEntry) -> bool:
    """Set up HAUS from a config entry."""
    store = HausStore(hass)
    await store.async_load()

    @callback
    def _tally_notification(event: Event) -> None:
        """Count notify service calls as they happen.

        The recorder is the only other source for this, and querying it on the
        event loop is not an option, so HAUS keeps the count itself.
        """
        if event.data.get(ATTR_DOMAIN) == NOTIFY_DOMAIN:
            store.record_notification(dt_util.utcnow())

    @callback
    def _tally_action(event: Event[EventStateChangedData]) -> None:
        """Attribute a state change to the person who caused it.

        Only changes carrying a user in their context count: an automation
        firing is not a person operating the house. Per-user counts stay in the
        store and never reach a state attribute.
        """
        user_id = event.context.user_id
        if user_id:
            store.record_action(user_id, dt_util.utcnow())

    entry.async_on_unload(
        hass.bus.async_listen(EVENT_CALL_SERVICE, _tally_notification)
    )
    entry.async_on_unload(hass.bus.async_listen(EVENT_STATE_CHANGED, _tally_action))

    coordinator = HausCoordinator(hass, entry, store)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    @callback
    def _config_entries_changed(
        change: ConfigEntryChange, changed: ConfigEntry
    ) -> None:
        """Re-evaluate the hygiene pillar when integrations come and go.

        Installing HAGHS later makes the pillar appear without touching HAUS's
        own configuration, and removing it makes the score renormalise.
        """
        if changed.domain == HAGHS_DOMAIN:
            entry.async_create_task(hass, coordinator.async_refresh())

    entry.async_on_unload(
        async_dispatcher_connect(
            hass, SIGNAL_CONFIG_ENTRY_CHANGED, _config_entries_changed
        )
    )

    async def _recollect_when_started(_: HomeAssistant) -> None:
        """Collect again once every other component has loaded.

        Home Assistant sets integrations up while others are still loading, so
        the first collection can see an instance with no automations, scripts
        or scenes and publish a score that is wrong until the next interval.
        """
        await coordinator.async_refresh()

    entry.async_on_unload(async_at_started(hass, _recollect_when_started))
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: HausConfigEntry) -> None:
    """Reload when the options change, so no restart is needed."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_remove_entry(hass: HomeAssistant, entry: HausConfigEntry) -> None:
    """Clean up everything HAUS put outside its own config entry.

    Two things outlive the entry otherwise: the Lovelace resource, which would
    point at a file no longer served, and the counter store on disk. Neither is
    dangerous and both are surprising.
    """
    await async_remove_frontend(hass)
    await HausStore(hass).async_remove()


async def async_unload_entry(hass: HomeAssistant, entry: HausConfigEntry) -> bool:
    """Unload a HAUS config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
