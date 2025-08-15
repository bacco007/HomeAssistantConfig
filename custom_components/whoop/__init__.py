"""The WHOOP integration."""

import asyncio
from datetime import timedelta
import logging
from typing import Any, Dict

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.config_entry_oauth2_flow import (
    OAuth2Session,
    async_get_config_entry_implementation,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import WhoopApiClient
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]
SCAN_INTERVAL = timedelta(minutes=2)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up WHOOP from a config entry."""
    _LOGGER.info("Setting up WHOOP integration for entry: %s", entry.title)
    hass.data.setdefault(DOMAIN, {})

    implementation = await async_get_config_entry_implementation(hass, entry)
    oauth_session = OAuth2Session(hass, entry, implementation)

    try:
        await oauth_session.async_ensure_token_valid()
    except ConfigEntryAuthFailed as err:
        _LOGGER.error("Initial token validation failed: %s", err)
        raise
    except Exception as err:
        _LOGGER.exception("Unexpected error during initial token validation: %s", err)
        raise ConfigEntryAuthFailed("Unexpected error during token validation") from err

    api_client = WhoopApiClient(
        async_get_clientsession(hass), oauth_session.token["access_token"]
    )

    async def async_update_data() -> Dict[str, Any]:
        """Fetch data from API endpoint."""
        _LOGGER.debug("--- Starting async_update_data for WHOOP ---")
        data_dict: Dict[str, Any] = {
            "profile": None,
            "body_measurement": None,
            "latest_recovery": None,
            "latest_sleep": None,
            "latest_cycle": None,
            "latest_workout": None,
        }
        try:
            await oauth_session.async_ensure_token_valid()
            api_client.update_access_token(oauth_session.token["access_token"])

            _LOGGER.debug("Fetching all WHOOP data with asyncio.gather...")
            results = await asyncio.gather(
                api_client.get_user_profile_basic(),
                api_client.get_body_measurement(),
                api_client.get_latest_recovery(),
                api_client.get_latest_sleep(),
                api_client.get_latest_cycle(),
                api_client.get_latest_workout(),
                return_exceptions=True,
            )
            _LOGGER.debug("asyncio.gather results: %s", results)

            keys = [
                "profile",
                "body_measurement",
                "latest_recovery",
                "latest_sleep",
                "latest_cycle",
                "latest_workout",
            ]
            any_data_fetched = False

            for i, key in enumerate(keys):
                result_item = results[i]
                if isinstance(result_item, Exception):
                    _LOGGER.error("Error fetching %s: %s", key, result_item)
                elif result_item is None:
                    _LOGGER.debug(
                        "No data returned for %s (API method returned None).", key
                    )
                else:
                    _LOGGER.debug("Successfully fetched data for %s.", key)
                    data_dict[key] = result_item
                    any_data_fetched = True

            if not any_data_fetched and not any(isinstance(r, dict) for r in results):
                _LOGGER.warning(
                    "All WHOOP API calls failed or returned no data in this update cycle."
                )

            _LOGGER.debug(
                "Coordinator data prepared (types): %s",
                {k: type(v).__name__ for k, v in data_dict.items()},
            )
            return data_dict

        except ConfigEntryAuthFailed as err:
            _LOGGER.error("Authentication failed during WHOOP data update: %s", err)
            raise
        except UpdateFailed as err:
            _LOGGER.error("UpdateFailed during WHOOP data update: %s", err)
            raise
        except Exception as err:
            _LOGGER.exception("Unexpected critical error in async_update_data: %s", err)
            raise UpdateFailed(f"Unexpected critical error: {err}") from err

    coordinator = DataUpdateCoordinator(
        hass,
        _LOGGER,
        name=f"{DOMAIN}_coordinator_{entry.entry_id}",
        update_method=async_update_data,
        update_interval=SCAN_INTERVAL,
    )

    _LOGGER.debug("Attempting first coordinator refresh for WHOOP...")
    await coordinator.async_config_entry_first_refresh()
    _LOGGER.debug("First coordinator refresh for WHOOP completed.")

    user_profile_data = coordinator.data.get("profile") if coordinator.data else None

    device_identifier: str
    device_name_suffix: str

    if (
        user_profile_data
        and isinstance(user_profile_data, dict)
        and user_profile_data.get("user_id")
    ):
        device_identifier = str(user_profile_data.get("user_id"))
        device_name_suffix = user_profile_data.get(
            "first_name", f"User {device_identifier}"
        )
    else:
        _LOGGER.warning(
            "WHOOP user_id not found in profile data for entry %s; using config entry ID for device uniqueness.",
            entry.entry_id,
        )
        device_identifier = entry.entry_id
        device_name_suffix = entry.entry_id[:8]

    device_info = DeviceInfo(
        identifiers={(DOMAIN, device_identifier)},
        name=f"WHOOP({device_name_suffix})",
        manufacturer="WHOOP",
        model="WHOOP Wearable",
    )

    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "device_info": device_info,
    }

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading WHOOP integration for entry: %s", entry.title)
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
    return unload_ok
