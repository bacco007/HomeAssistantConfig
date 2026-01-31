"""Config and Options flow for Moon Astro.

This module implements the configuration and options flows.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import (
    CONF_ALT,
    CONF_EVENTS_REFRESH_FALLBACK,
    CONF_HIGH_PRECISION,
    CONF_LAT,
    CONF_LON,
    CONF_SCAN_INTERVAL,
    CONF_USE_HA_TZ,
    DEFAULT_EVENTS_REFRESH_FALLBACK,
    DEFAULT_HIGH_PRECISION,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_USE_HA_TZ,
    DOMAIN,
)
from .utils import (
    cleanup_cache_dir,
    ensure_valid_ephemeris,
    get_ephemeris_lock,
    validate_ephemeris_file,
)

_LOGGER = logging.getLogger(__name__)


class MoonAstroConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Moon Astro."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._user_input: dict[str, Any] | None = None
        self._download_task: asyncio.Task[bool] | None = None
        self._download_success: bool = False
        self._options_input: dict[str, Any] | None = None

    def _is_reconfigure_flow(self) -> bool:
        """Return True when the current flow is a reconfiguration flow.

        Returns:
            True if the flow targets an existing entry, False otherwise.
        """
        if self.context.get("source") == config_entries.SOURCE_RECONFIGURE:
            return True
        return self.context.get("entry_id") is not None

    def _get_target_entry(self) -> config_entries.ConfigEntry | None:
        """Return the config entry targeted by the current flow.

        Returns:
            The targeted ConfigEntry or None if it cannot be resolved.
        """
        entry_id = self.context.get("entry_id")
        if entry_id:
            return self.hass.config_entries.async_get_entry(entry_id)

        entries = self.hass.config_entries.async_entries(DOMAIN)
        if len(entries) == 1:
            return entries[0]

        return None

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the main step for GPS coordinates and altitude.

        Args:
            user_input: User-provided coordinates and altitude.

        Returns:
            A ConfigFlowResult showing the form or proceeding to the next step.
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            self._user_input = user_input

            if self._is_reconfigure_flow():
                entry = self._get_target_entry()
                if entry is None:
                    return self.async_abort(reason="missing_data")

                return self.async_update_reload_and_abort(
                    entry, data_updates=user_input
                )

            self._download_success = False
            self._download_task = None
            return await self.async_step_download()

        hass_lat = self.hass.config.latitude
        hass_lon = self.hass.config.longitude
        hass_elev = self.hass.config.elevation or 0

        default_lat = (
            float(self._user_input[CONF_LAT])
            if self._user_input and CONF_LAT in self._user_input
            else hass_lat
        )
        default_lon = (
            float(self._user_input[CONF_LON])
            if self._user_input and CONF_LON in self._user_input
            else hass_lon
        )
        default_alt = (
            float(self._user_input[CONF_ALT])
            if self._user_input and CONF_ALT in self._user_input
            else hass_elev
        )

        schema = vol.Schema(
            {
                vol.Required(CONF_LAT, default=default_lat): vol.Coerce(float),
                vol.Required(CONF_LON, default=default_lon): vol.Coerce(float),
                vol.Optional(CONF_ALT, default=default_alt): vol.Coerce(float),
            }
        )
        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)

    async def async_step_download(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Download ephemeris with progress display.

        This step can be invoked multiple times by the flow manager. It must not
        create a new task if one is already running.

        Args:
            user_input: Optional input (not used by this step).

        Returns:
            A ConfigFlowResult showing progress or advancing to the next step.
        """
        # Fast-path: if the ephemeris is already valid, skip the progress UI entirely.
        # This avoids staying stuck on the progress screen when no download is needed.
        if self._download_task is None:
            try:
                if await validate_ephemeris_file(self.hass, remove_on_invalid=False):
                    self._download_success = True
                    return self.async_show_progress_done(next_step_id="precision")
            except (OSError, RuntimeError, ValueError, AttributeError):
                # Any unexpected validation failure will fall back to the normal download logic.
                self._download_success = False

        # Normal path: create the download task once and reuse it across step calls.
        if self._download_task is None:
            self._download_task = self.hass.async_create_task(
                self._async_ensure_ephemeris()
            )

        if not self._download_task.done():
            return self.async_show_progress(
                step_id="download",
                progress_action="download_ephemeris",
                progress_task=self._download_task,
            )

        try:
            self._download_success = self._download_task.result()
        except asyncio.CancelledError:
            self._download_success = False

        self._download_task = None

        next_step_id = "precision" if self._download_success else "user"
        return self.async_show_progress_done(next_step_id=next_step_id)

    async def _async_ensure_ephemeris(self) -> bool:
        """Ensure a valid ephemeris exists, cleaning up on failure or cancellation.

        A global lock is used to avoid concurrent downloads across config flows
        and startup setup.

        Returns:
            True if a valid ephemeris is available, False otherwise.
        """
        lock = get_ephemeris_lock(self.hass)

        try:
            _LOGGER.info("Config flow ephemeris: waiting for download lock")
            async with lock:
                _LOGGER.info("Config flow ephemeris: acquired download lock")

                # Revalidate under lock to avoid unnecessary downloads when another task
                # completed the preparation while this flow was waiting.
                try:
                    if await validate_ephemeris_file(
                        self.hass, remove_on_invalid=False
                    ):
                        return True
                except (OSError, RuntimeError, ValueError, AttributeError):
                    # Fall back to the standard ensure path.
                    pass

                return await ensure_valid_ephemeris(self.hass)
        except asyncio.CancelledError:
            await cleanup_cache_dir(self.hass, remove_empty_dir=True)
            raise
        except (OSError, RuntimeError, ValueError, AttributeError):
            await cleanup_cache_dir(self.hass, remove_empty_dir=True)
            return False

    async def async_step_precision(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Configure precision-related options.

        Args:
            user_input: Optional user-provided values.

        Returns:
            A ConfigFlowResult showing the form or moving to the finalize step.
        """
        if user_input is not None:
            self._options_input = user_input
            return await self.async_step_finalize()

        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_HIGH_PRECISION,
                    default=DEFAULT_HIGH_PRECISION,
                ): bool,
            }
        )
        return self.async_show_form(step_id="precision", data_schema=schema)

    async def async_step_finalize(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Finalize the initial configuration.

        Args:
            user_input: Optional input (not used by this step).

        Returns:
            A ConfigFlowResult creating the entry or aborting.
        """
        if self._user_input is None:
            return self.async_abort(reason="missing_data")

        if not self._download_success:
            return self.async_abort(reason="missing_data")

        await self.async_set_unique_id(DOMAIN)
        self._abort_if_unique_id_configured()

        options: dict[str, Any] = {}
        if self._options_input is not None:
            options.update(self._options_input)

        return self.async_create_entry(
            title="Moon Astro",
            data=self._user_input,
            options=options,
        )

    async def async_step_import(
        self, user_input: dict[str, Any]
    ) -> config_entries.ConfigFlowResult:
        """Support YAML import if needed in the future.

        Args:
            user_input: Configuration dictionary from YAML.

        Returns:
            A ConfigFlowResult from the user step.
        """
        return await self.async_step_user(user_input)

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Start a reconfiguration flow.

        Args:
            user_input: Optional reconfiguration data.

        Returns:
            A ConfigFlowResult showing the form.
        """
        entry = self._get_target_entry()
        if entry is not None:
            self._user_input = dict(entry.data)
        return await self.async_step_user()

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Return the options flow handler.

        Args:
            config_entry: The config entry being configured.

        Returns:
            An instance of MoonAstroOptionsFlow.
        """
        return MoonAstroOptionsFlow(config_entry)


class MoonAstroOptionsFlow(config_entries.OptionsFlow):
    """Handle options for Moon Astro."""

    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        """Initialize Moon Astro options flow.

        Args:
            entry: The config entry to configure options for.
        """
        self._entry = entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """First step of options flow.

        Args:
            user_input: User-provided option values.

        Returns:
            A ConfigFlowResult creating the options entry or showing the form.
        """
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        options = self._entry.options
        schema = vol.Schema(
            {
                vol.Optional(
                    CONF_SCAN_INTERVAL,
                    default=options.get(
                        CONF_SCAN_INTERVAL,
                        DEFAULT_SCAN_INTERVAL,
                    ),
                ): vol.All(vol.Coerce(int), vol.Range(min=30, max=21600)),
                vol.Optional(
                    CONF_USE_HA_TZ,
                    default=options.get(
                        CONF_USE_HA_TZ,
                        DEFAULT_USE_HA_TZ,
                    ),
                ): bool,
                vol.Optional(
                    CONF_HIGH_PRECISION,
                    default=options.get(
                        CONF_HIGH_PRECISION,
                        DEFAULT_HIGH_PRECISION,
                    ),
                ): bool,
                vol.Optional(
                    CONF_EVENTS_REFRESH_FALLBACK,
                    default=options.get(
                        CONF_EVENTS_REFRESH_FALLBACK,
                        DEFAULT_EVENTS_REFRESH_FALLBACK,
                    ),
                ): vol.All(vol.Coerce(int), vol.Range(min=3600, max=604800)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
