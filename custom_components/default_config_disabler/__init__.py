"""The Default Config Disabler integration."""

from __future__ import annotations

import logging

import homeassistant.components.default_config as ha_default_config
from homeassistant.config import YAML_CONFIG_FILE
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv, issue_registry as ir
from homeassistant.helpers.typing import ConfigType
from homeassistant.setup import async_setup_component

from .const import CONF_COMPONENTS_TO_DISABLE, DOMAIN
from .helpers import get_default_config_components

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)
_RESTART_LOG_MESSAGE = "Restart Home Assistant to apply changes"
_ISSUE_RESTART_REQUIRED = "restart_required"


_DEFAULT_CONFIG_ENABLED = """
default_config:
"""

_DEFAULT_CONFIG_DISABLED = """
# default_config:
"""


def _create_restart_issue(hass: HomeAssistant) -> None:
    ir.async_create_issue(
        hass,
        DOMAIN,
        _ISSUE_RESTART_REQUIRED,
        is_fixable=True,
        severity=ir.IssueSeverity.WARNING,
        translation_key=_ISSUE_RESTART_REQUIRED,
    )


def _delete_restart_issue(hass: HomeAssistant) -> None:
    ir.async_delete_issue(hass, DOMAIN, _ISSUE_RESTART_REQUIRED)


def _update_default_config(hass: HomeAssistant, disable: bool) -> bool:
    """Update configuration.yaml to enable/disable default_config."""
    updated = False

    config_path = hass.config.path(YAML_CONFIG_FILE)
    with open(config_path, encoding="utf-8") as config_file:
        config_raw = config_file.read()
    old = _DEFAULT_CONFIG_ENABLED if disable else _DEFAULT_CONFIG_DISABLED
    new = _DEFAULT_CONFIG_DISABLED if disable else _DEFAULT_CONFIG_ENABLED
    if old in config_raw:
        config_raw = config_raw.replace(old, new)
        with open(config_path, "w", encoding="utf-8") as config_file:
            config_file.write(config_raw)
        updated = True

    return updated


async def _async_disable_default_config(hass: HomeAssistant) -> None:
    _LOGGER.debug("Disabling default_config in configuration.yaml")
    updated = await hass.async_add_executor_job(_update_default_config, hass, True)
    if updated:
        _LOGGER.warning("Disabled default_config. %s", _RESTART_LOG_MESSAGE)
        _create_restart_issue(hass)
    else:
        _LOGGER.debug("default_config is already disabled in configuration.yaml")


async def _async_enable_default_config(hass: HomeAssistant) -> None:
    _LOGGER.debug("Enabling default_config in configuration.yaml")
    updated = await hass.async_add_executor_job(_update_default_config, hass, False)
    if updated:
        _LOGGER.warning("Enabled default_config. %s", _RESTART_LOG_MESSAGE)
        _create_restart_issue(hass)
    else:
        _LOGGER.debug("default_config is already enabled in configuration.yaml")


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the integration."""
    _LOGGER.debug("Setting up default_config_disabler")
    if "default_config" in config:
        await _async_disable_default_config(hass)
        return True

    _delete_restart_issue(hass)
    # Setup the default_config dependencies in its manifest except those that are disabled
    _LOGGER.debug("Getting default_config dependencies")
    components = await hass.async_add_executor_job(get_default_config_components)
    _LOGGER.debug("Got default_config dependencies: %s", components)
    disabled_components = []
    for entry in hass.config_entries.async_entries(DOMAIN):
        disabled_components.extend(entry.options.get(CONF_COMPONENTS_TO_DISABLE, []))
    _LOGGER.debug("Setting up dependencies except: %s", disabled_components)
    for component in components:
        if component in disabled_components:
            continue
        await async_setup_component(hass, component, config)
    _LOGGER.debug("Setup of default_config dependencies complete")

    # Setup any components that are conditionally loaded by default_config
    # and are not in the dependencies of its manifest.
    # This is currently empty but in the past this used to conditionally setup
    # e.g. backup for non hassio installations, stream for supported installations, etc.
    await ha_default_config.async_setup(hass, config)

    _LOGGER.debug("Setup default_config_disabler complete")
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up entry."""
    _LOGGER.debug("Setting up default_config_disabler entry")
    await _async_disable_default_config(hass)
    entry.async_on_unload(entry.add_update_listener(update_listener))
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.debug("Unloading default_config_disabler entry")
    await _async_enable_default_config(hass)
    return True


async def update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Handle options update."""
    _LOGGER.warning("Updated disabled components. %s", _RESTART_LOG_MESSAGE)
    _create_restart_issue(hass)
