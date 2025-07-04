"""Support for  HA_EPG."""

from __future__ import annotations

import datetime
import logging
import os
import re
from pathlib import Path
from typing import Final

import aiohttp
import pytz

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
)
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.update_coordinator import (
    CoordinatorEntity,
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import DOMAIN, ICON
from .guide_classes import Guide
from datetime import timedelta

_LOGGER: Final = logging.getLogger(__name__)


class EpgDataUpdateCoordinator(DataUpdateCoordinator[Guide | None]):
    """Class to manage fetching EPG data."""

    def __init__(self, hass: HomeAssistant, config_entry: ConfigEntry, config: dict):
        """Initialize."""
        self.config_entry = config_entry
        self.config_options = config  # Store options from config entry
        self.hass = hass
        self._guide: Guide | None = None

        # Define the update interval
        update_interval = timedelta(minutes=1)
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN} {config_entry.entry_id}",
            update_interval=update_interval,
        )

    def need_to_update(self, file_path: str) -> bool:
        """Check if the file needs to be updated."""
        if not Path(file_path).exists():
            return True
        file_mod_time = datetime.datetime.fromtimestamp(os.path.getmtime(file_path))
        return (datetime.datetime.now() - file_mod_time) > timedelta(hours=24)

    async def _async_update_data(self) -> Guide | None:
        """Fetch data from API endpoint.

        if not self.need_to_update(file_path):
        """
        _LOGGER.debug("Coordinator: Starting data update")
        file_name = self.config_options.get("file_name")
        generated = self.config_options.get("generated", False)
        selected_channels = "ALL" if generated else self.config_options.get("selected_channels", [])
        file_path = self.config_options.get("file_path")
        time_zone = await self.hass.async_add_executor_job(
            pytz.timezone, self.hass.config.time_zone
        )
        if not self.need_to_update(file_path):
            try:
                # Read file content asynchronously using executor job
                local_data = await self.hass.async_add_executor_job(
                    read_file, file_path
                )
                if not local_data:
                    _LOGGER.warning(
                        "Local file '%s' exists but is empty or could not be read.",
                        file_path,
                    )

                else:
                    guide = await self.hass.async_add_executor_job(
                        Guide, local_data, selected_channels, time_zone
                    )
                    _LOGGER.info(
                        "Successfully loaded EPG guide from local file: %s", file_path
                    )
                    self._guide = guide  # Update internal state
                    return guide  # Return the guide loaded from the file

            except FileNotFoundError:
                _LOGGER.warning(
                    "Local file '%s' not found unexpectedly. Will attempt network fetch.",
                    file_path,
                )
            except Exception as err:
                _LOGGER.error(
                    "Failed to read or parse local EPG file '%s': %s. "
                    "Will attempt to fetch from network.",
                    file_path,
                    err,
                )
        if generated:
            guide_url = f"https://www.open-epg.com/generate/{file_name}.xml"
            selected_channels_param = "ALL"  # Guide class handles "ALL"
        else:
            # Ensure filename is clean for URL
            clean_file_name = "".join(file_name.split()).lower()
            guide_url = f"https://www.open-epg.com/files/{clean_file_name}.xml"
            selected_channels_param = selected_channels

        session = async_get_clientsession(self.hass)

        guide = None

        try:
            _LOGGER.debug("Coordinator: Fetching guide from %s", guide_url)
            response = await session.get(guide_url)
            response.raise_for_status()
            data = await response.text()

            if data and "channel" in data:
                _LOGGER.debug(
                    f"Coordinator: Successfully fetched guide data for {file_name}"
                )

                os.makedirs(os.path.dirname(file_path), exist_ok=True)
                # Write the fetched data to the file asynchronously
                await self.hass.async_add_executor_job(write_file, file_path, data)
                # Parse the guide data
                guide = await self.hass.async_add_executor_job(
                    Guide, data, selected_channels_param, time_zone
                )
                _LOGGER.debug(
                    f"Coordinator: Guide parsed with {len(guide.channels()) if guide else 0} channels."
                )
                self._guide = guide  # Store the latest guide
                return guide
            else:
                _LOGGER.error(
                    f"Coordinator: No valid 'channel' data received from {guide_url}. Response snippet: {data[:200]}"
                )
                return self._guide  # Keep old data on error

        except aiohttp.ClientError as err:
            _LOGGER.error(f"Coordinator: Error fetching guide from {guide_url}: {err}")
            return self._guide  # Keep old data on transient error
        except Exception as err:
            _LOGGER.exception(
                f"Coordinator: Unexpected error during update for {file_name}: {err}"
            )
            # Raise UpdateFailed for unexpected errors
            raise UpdateFailed(f"Unexpected error during update: {err}")


async def async_setup_entry(
    hass: HomeAssistant, config_entry: ConfigEntry, async_add_entities
):
    """Set up the EPG sensor platform."""
    await _register_services(hass, config_entry)
    coordinator = await _initialize_coordinator(hass, config_entry)
    entities = await _create_entities(coordinator, config_entry)
    if entities:
        async_add_entities(entities)


async def _register_services(hass: HomeAssistant, config_entry: ConfigEntry):
    """Register services for the EPG integration."""

    async def handle_update_channels(call):
        """Handle the service call to manually refresh."""
        await _handle_update_channels(hass, config_entry, call)

    async def handle_search_program(call: ServiceCall) -> ServiceResponse:
        """Handle the service call to search for programs."""
        return await _handle_search_program(hass, call)

    hass.services.async_register(
        DOMAIN, "handle_update_channels", handle_update_channels
    )
    if not hass.services.has_service(DOMAIN, "search_program"):
        hass.services.async_register(
            DOMAIN,
            "search_program",
            handle_search_program,
            supports_response=SupportsResponse.ONLY,
        )


async def _initialize_coordinator(hass: HomeAssistant, config_entry: ConfigEntry):
    """Initialize the data update coordinator."""
    coordinator = EpgDataUpdateCoordinator(hass, config_entry, config_entry.options)
    await coordinator.async_config_entry_first_refresh()
    hass.data.setdefault(DOMAIN, {})[config_entry.entry_id] = coordinator
    return coordinator


async def _create_entities(coordinator, config_entry):
    """Create sensor entities based on the coordinator data."""
    entities = []
    if coordinator.data:
        guide: Guide = coordinator.data
        config_options = config_entry.options
        file_name = config_options.get("file_name")
        generated = config_options.get("generated", False)

        if generated:
            entities.extend(
                ChannelSensor(coordinator, channel.id, channel.name(), config_options)
                for channel in guide.channels()
            )
        else:
            selected_channels_names = config_options.get("selected_channels", [])
            for channel_name in selected_channels_names:
                channel = guide.get_channel_by_id(channel_name)
                if channel:
                    entities.append(
                        ChannelSensor(
                            coordinator, channel.id, channel.name(), config_options
                        )
                    )
    return entities


async def _handle_update_channels(hass: HomeAssistant, config_entry: ConfigEntry, call):
    """Handle the service call to manually refresh."""
    entry_id_to_refresh = call.data.get("entry_id", config_entry.entry_id)
    coordinator_to_refresh = hass.data[DOMAIN].get(entry_id_to_refresh)
    if coordinator_to_refresh:
        file_path = coordinator_to_refresh.config_options.get("file_path", [])
        if Path(file_path).exists():
            Path(file_path).rename(f"{file_path}.bak")
        await coordinator_to_refresh.async_request_refresh()
        if Path(file_path).exists():
            _LOGGER.debug("update channels successful")
            Path(f"{file_path}.bak").unlink()
        else:
            _LOGGER.debug("update channels failed")

            raise HomeAssistantError(
                f"Failed to update channels for entry {entry_id_to_refresh}"
            )


async def _handle_search_program(
    hass: HomeAssistant, call: ServiceCall
) -> ServiceResponse:
    """Handle the service call to search for programs."""
    search_title = call.data.get("title", "").lower()
    search_channel_name = call.data.get("channel_name")
    date_filter = call.data.get("date_filter", "all_future")
    target_entry_id = call.data.get("entry_id")
    search_results = []
    coordinators_to_search = _get_coordinators_to_search(hass, target_entry_id)
    for coordinator in coordinators_to_search:
        if coordinator.last_update_success and isinstance(coordinator.data, Guide):
            search_results.extend(
                _search_guide(
                    coordinator.data, search_title, search_channel_name, date_filter
                )
            )
    sorted_results = sorted(search_results, key=lambda x: x["start_datetime_iso"])
    return {"results": sorted_results}


def _get_coordinators_to_search(hass: HomeAssistant, target_entry_id: str):
    """Get the list of coordinators to search."""
    all_coordinators = hass.data.get(DOMAIN, {})
    if target_entry_id:
        coordinator = all_coordinators.get(target_entry_id)
        return [coordinator] if coordinator else []
    return [
        coord
        for coord in all_coordinators.values()
        if isinstance(coord, EpgDataUpdateCoordinator)
    ]


def _search_guide(
    guide: Guide, search_title: str, search_channel_name: str, date_filter: str
):
    """Search the guide for matching programs."""
    search_results = []
    for channel in guide.channels():
        if search_channel_name and channel.name() != search_channel_name:
            continue
        all_programmes = channel.get_programmes_per_day()
        search_results.extend(
            _filter_programmes(
                all_programmes, search_title, date_filter, channel.name()
            )
        )
    return search_results


def _filter_programmes(all_programmes, search_title, date_filter, channel_name):
    """Filter programs based on the search criteria."""
    results = []
    for day in ["today", "tomorrow"]:
        if date_filter in [day, "any"]:
            for programme in all_programmes.get(day, []).values():
                if re.search(search_title, programme.get("title", "").lower()):
                    results.append(_format_programme(programme, day, channel_name))
    return results


def _format_programme(programme, day, channel_name):
    """Format a program into a result dictionary."""
    hour, minute = map(int, programme.get("start").split(":"))
    start_datetime_iso = (
        (datetime.datetime.now() + timedelta(days=1 if day == "tomorrow" else 0))
        .replace(hour=hour, minute=minute, second=0, microsecond=0)
        .isoformat()
    )
    return {
        "channel_name": channel_name,
        "title": programme.get("title"),
        "description": programme.get("desc") or "No description",
        "start_time": programme.get("start"),
        "end_time": programme.get("end"),
        "date": datetime.date.today() + timedelta(1 if day == "tomorrow" else 0),
        "start_datetime_iso": start_datetime_iso,
    }


def read_file(file):
    with open(file, "r") as guide_file:
        content = guide_file.readlines()
    content = "".join(content)
    return content


def write_file(file, data):
    with open(file, "w") as file:
        file.write(data)
        file.close()


class ChannelSensor(CoordinatorEntity[EpgDataUpdateCoordinator], SensorEntity):
    """Representation of a ChannelSensor ."""

    _attr_icon: str = ICON
    _attr_has_entity_name = False

    def __init__(
        self,
        coordinator: EpgDataUpdateCoordinator,
        channel_id: str,
        channel_name: str,
        config_options: dict,
    ) -> None:
        """Initialize the sensor."""
        # Pass the coordinator to CoordinatorEntity
        super().__init__(coordinator)

        self._channel_id = channel_id
        self._channel_name = channel_name  # Keep original name for reference if needed
        self._config_options = config_options

        # Set unique ID and device info if you have a device associated with the config entry
        self._attr_unique_id = f"{coordinator.config_entry.entry_id}_{self._channel_id}"
        # Example device info - link sensor to the config entry's device
        self._attr_device_info = {
            "identifiers": {(DOMAIN, coordinator.config_entry.entry_id)},
            "name": f"EPG {config_options.get('file_name', coordinator.config_entry.entry_id)}",
            "manufacturer": "Open-EPG",  # Or your integration name
            "entry_type": "service",  # Or DEVICE_INFO_ENTRY_TYPE_SERVICE if imported
        }
        self._attr_name = f"{channel_name}"

    @property
    def _channel_data(self) -> Guide.Channel | None:
        """Helper to get the specific channel data from the coordinator."""
        if self.coordinator.data:
            return self.coordinator.data.get_channel_by_id(self._channel_id)
        return None

    @property
    def available(self) -> bool:
        """Return True if coordinator has data and channel exists."""
        return super().available and self._channel_data is not None

    @property
    def native_value(self):  # Use native_value instead of state
        """Return the state of the device."""
        channel = self._channel_data
        if channel:
            current_title = channel.get_current_title()
            return (
                current_title if current_title is not None else "Unavailable"
            )  # Or None
        return "Unavailable"  # Or None if the channel data isn't found

    @property
    def extra_state_attributes(self) -> dict[str, str] | None:
        """Return the state attributes."""
        channel = self._channel_data
        if not channel:
            return None

        if self._config_options.get("full_schedule"):
            ret = channel.get_programmes_per_day()
        else:
            ret = channel.get_programmes_for_today()

        # Ensure 'desc' key exists even if description is None
        ret["desc"] = channel.get_current_desc() or "No description"
        ret["sub_title"] = channel.get_current_subtitle() or "No subtitle"
        # Add next program info?
        next_prog = channel.get_next_programme()
        if next_prog:
            ret["next_program_title"] = next_prog.title
            ret["next_program_start_time"] = next_prog.start_hour
            ret["next_program_end_time"] = next_prog.end_hour
            ret["next_program_desc"] = next_prog.desc or "No description"
            ret["next_program_sub_title"] = next_prog.sub_title or "No subtitle"
        else:
            ret["next_program_title"] = "Unavailable"

        # Add channel metadata if useful
        ret["channel_id"] = channel.id
        ret["channel_display_name"] = channel.name()

        return ret
