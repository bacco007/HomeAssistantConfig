"""The Trakt integration."""

import asyncio
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_CLIENT_ID, CONF_CLIENT_SECRET
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_entry_oauth2_flow
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.config_entry_oauth2_flow import (
    OAuth2Session,
    async_get_config_entry_implementation,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .apis.trakt import TraktApi
from .config_flow import OAuth2FlowHandler
from .const import DOMAIN, OAUTH2_AUTHORIZE, OAUTH2_TOKEN
from .schema import configuration_schema
from .utils import update_domain_data

LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = configuration_schema
PLATFORMS = ["sensor"]


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the TraktTV component from a yaml (not supported)."""
    update_domain_data(hass, "configuration", CONFIG_SCHEMA(config).get(DOMAIN, {}))
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up TraktTV from a config entry."""
    OAuth2FlowHandler.async_register_implementation(
        hass,
        config_entry_oauth2_flow.LocalOAuth2Implementation(
            hass,
            DOMAIN,
            entry.data[CONF_CLIENT_ID],
            entry.data[CONF_CLIENT_SECRET],
            OAUTH2_AUTHORIZE,
            OAUTH2_TOKEN,
        ),
    )

    implementation = await async_get_config_entry_implementation(hass, entry)
    session = OAuth2Session(hass, entry, implementation)

    configuration = {"client_id": entry.data[CONF_CLIENT_ID]}
    update_domain_data(hass, "configuration", configuration)

    api = TraktApi(async_get_clientsession(hass), session, hass)

    coordinator = DataUpdateCoordinator(
        hass=hass,
        logger=LOGGER,
        name="trakt",
        update_method=api.retrieve_data,
    )

    await coordinator.async_config_entry_first_refresh()

    instances = {"coordinator": coordinator, "api": api}
    update_domain_data(hass, "instances", instances)

    for platform in PLATFORMS:
        hass.async_create_task(
            hass.config_entries.async_forward_entry_setup(entry, platform)
        )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload a config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[
                hass.config_entries.async_forward_entry_unload(entry, platform)
                for platform in PLATFORMS
            ]
        )
    )

    if unload_ok:
        hass.data.pop(DOMAIN)

    return unload_ok
