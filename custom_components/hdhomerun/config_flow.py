"""Provide UI for configuring the integration."""

# region #-- imports --#
from __future__ import annotations

import asyncio
import json
import logging
from typing import Dict, List, Optional
from urllib.parse import urlparse

import voluptuous as vol
from homeassistant import config_entries, data_entry_flow
from homeassistant.components import ssdp
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import callback
from homeassistant.helpers import selector
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_HOST,
    CONF_SCAN_INTERVAL_TUNER_STATUS,
    CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    CONF_TUNER_CHANNEL_FORMAT,
    CONF_TUNER_CHANNEL_NAME,
    CONF_TUNER_CHANNEL_NUMBER,
    CONF_TUNER_CHANNEL_NUMBER_NAME,
    DEF_SCAN_INTERVAL_SECS,
    DEF_SCAN_INTERVAL_TUNER_STATUS_SECS,
    DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    DEF_TUNER_CHANNEL_FORMAT,
    DOMAIN,
)
from .logger import Logger
from .pyhdhr.discover import Discover, HDHomeRunDevice
from .pyhdhr.exceptions import HDHomeRunDeviceNotFoundError

# endregion


_LOGGER = logging.getLogger(__name__)

CONF_FRIENDLY_NAME: str = "friendly_name"
STEP_DETAILS: str = "details"
STEP_FINISH: str = "finish"
STEP_FRIENDLY_NAME: str = "friendly_name"
STEP_OPTIONS: str = "options"
STEP_SELECT_DEVICE: str = "select_device"
STEP_TIMEOUTS: str = "timeouts"
STEP_USER: str = "user"


async def _async_build_schema_with_user_input(step: str, user_input=None) -> vol.Schema:
    """Build the input and validation schema for the config UI.

    :param step: the step we're in for a configuration or installation of the integration
    :param user_input: the data that should be used as defaults
    :return: the schema including necessary restrictions, defaults, pre-selections etc.
    """
    if user_input is None:
        user_input = {}

    schema = {}
    if step == STEP_FRIENDLY_NAME:
        schema = {
            vol.Required(
                CONF_FRIENDLY_NAME, default=user_input.get(CONF_FRIENDLY_NAME, "")
            ): selector.TextSelector(),
        }

    if step == STEP_OPTIONS:
        schema = {
            vol.Optional(
                CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                default=user_input.get(
                    CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                    DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                ),
            ): selector.TextSelector(),
            vol.Required(
                CONF_TUNER_CHANNEL_FORMAT,
                default=user_input.get(
                    CONF_TUNER_CHANNEL_FORMAT, DEF_TUNER_CHANNEL_FORMAT
                ),
            ): selector.SelectSelector(
                config=selector.SelectSelectorConfig(
                    mode=selector.SelectSelectorMode.DROPDOWN,
                    multiple=False,
                    options=[
                        CONF_TUNER_CHANNEL_NAME,
                        CONF_TUNER_CHANNEL_NUMBER,
                        CONF_TUNER_CHANNEL_NUMBER_NAME,
                    ],
                    translation_key="channel_format",
                ),
            ),
        }

    if step == STEP_SELECT_DEVICE:
        schema = {
            vol.Required(CONF_HOST,): selector.SelectSelector(
                config=selector.SelectSelectorConfig(
                    mode=selector.SelectSelectorMode.LIST,
                    multiple=False,
                    options=user_input,
                ),
            ),
        }

    if step == STEP_TIMEOUTS:
        schema = {
            vol.Optional(
                CONF_SCAN_INTERVAL,
                default=user_input.get(CONF_SCAN_INTERVAL, DEF_SCAN_INTERVAL_SECS),
            ): selector.NumberSelector(
                config=selector.NumberSelectorConfig(
                    max=86400,
                    min=1,
                    mode=selector.NumberSelectorMode.BOX,
                    unit_of_measurement="seconds",
                )
            ),
            vol.Optional(
                CONF_SCAN_INTERVAL_TUNER_STATUS,
                default=user_input.get(
                    CONF_SCAN_INTERVAL_TUNER_STATUS, DEF_SCAN_INTERVAL_TUNER_STATUS_SECS
                ),
            ): selector.NumberSelector(
                config=selector.NumberSelectorConfig(
                    max=86400,
                    min=1,
                    mode=selector.NumberSelectorMode.BOX,
                    unit_of_measurement="seconds",
                )
            ),
        }

    if step == STEP_USER:
        schema = {
            vol.Optional(
                CONF_HOST, default=user_input.get(CONF_HOST, "")
            ): selector.TextSelector(),
        }

    return vol.Schema(schema)


class HDHomerunConfigFlow(config_entries.ConfigFlow, Logger, domain=DOMAIN):
    """Potential flows the configuration can follow.

    1.  SSDP -> Friendly Name -> Finish
    2.  User -> IP provided -> Details -> Friendly Name -> Finish
    3.  User -> No IP provided -> Discover -> Selection -> Friendly Name -> Finish
    """

    def __init__(self):
        """Initialis."""
        Logger.__init__(self)

        self._discovered_devices: Dict[str, str] | None = None
        self._discovered_devices_hd: List[HDHomeRunDevice] | None = None
        self._errors: dict = {}
        self._error_message: str = ""
        self._friendly_name: str = ""
        self._host: str = ""
        self._task_details: asyncio.Task | None = None

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return HDHomerunOptionsFlowHandler(config_entry=config_entry)

    async def _async_task_discover_all(self) -> None:
        """Discover all available devices."""
        err_msg: str | None = None
        try:
            self._discovered_devices_hd: List[HDHomeRunDevice] = await Discover(
                session=async_get_clientsession(hass=self.hass)
            ).async_discover()
            if len(self._discovered_devices_hd) == 0:
                raise ValueError
        except Exception as err:  # pylint: disable=broad-except
            err_msg = "generic_hdhomerun_error"
            self._error_message = str(err)
            _LOGGER.error(self.format("%s"), err)

        if err_msg is not None:
            self._errors["base"] = err_msg

        self.hass.async_create_task(
            self.hass.config_entries.flow.async_configure(flow_id=self.flow_id)
        )

    async def _async_task_discover_single(self) -> None:
        """Discover a single device as specified by the instance host."""
        err_msg: Optional[str] = None
        if self._host:
            hdhomerun_device: List[HDHomeRunDevice] | HDHomeRunDevice
            try:
                hdhomerun_device = await Discover(
                    broadcast_address=self._host,
                    session=async_get_clientsession(hass=self.hass),
                ).async_discover()
            except HDHomeRunDeviceNotFoundError as err:
                err_msg = "generic_hdhomerun_error"
                self._error_message = str(err)
            else:
                hdhomerun_device = hdhomerun_device[0]
                await hdhomerun_device.async_gather_details()
                if hdhomerun_device.friendly_name:
                    self._friendly_name = hdhomerun_device.friendly_name
                self._friendly_name += (
                    f" {hdhomerun_device.device_id}"
                    if self._friendly_name
                    else hdhomerun_device.device_id
                )
                await self.async_set_unique_id(
                    unique_id=hdhomerun_device.device_id, raise_on_progress=False
                )

        if err_msg is not None:
            self._errors["base"] = err_msg

        self.hass.async_create_task(
            self.hass.config_entries.flow.async_configure(flow_id=self.flow_id)
        )

    async def async_step_details(self, user_input=None) -> data_entry_flow.FlowResult:
        """Execute the discovery before proceeding."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        if not self._task_details:
            _LOGGER.debug(self.format("creating task for gathering details"))
            if self._host:  # try and lookup the device
                self._task_details = self.hass.async_create_task(
                    self._async_task_discover_single()
                )
            else:  # do discovery now
                self._task_details = self.hass.async_create_task(
                    self._async_task_discover_all()
                )
            return self.async_show_progress(
                step_id=STEP_DETAILS, progress_action="_task_details"
            )

        await self._task_details

        _LOGGER.debug(self.format("_errors: %s"), self._errors)
        if self._errors:
            return self.async_show_progress_done(next_step_id=STEP_USER)

        _LOGGER.debug(self.format("proceeding to next step"))
        if self._discovered_devices_hd is None:
            return self.async_show_progress_done(next_step_id=STEP_FRIENDLY_NAME)

        return self.async_show_progress_done(next_step_id=STEP_SELECT_DEVICE)

    async def async_step_finish(self, _=None) -> data_entry_flow.FlowResult:
        """Finalise the configuration entry."""
        _LOGGER.debug(self.format("entered"))

        return self.async_create_entry(
            title=self._friendly_name or "HDHomerun", data={CONF_HOST: self._host}
        )

    async def async_step_friendly_name(
        self, user_input=None
    ) -> data_entry_flow.FlowResult:
        """Specify a friendly name.

        N.B. defaults to the value of the friendly_name instance variable
        """
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)

        self._abort_if_unique_id_configured()

        if user_input is not None:
            self._friendly_name = user_input.get(CONF_FRIENDLY_NAME, "")
            return await self.async_step_finish()

        return self.async_show_form(
            step_id=STEP_FRIENDLY_NAME,
            data_schema=await _async_build_schema_with_user_input(
                STEP_FRIENDLY_NAME, {CONF_FRIENDLY_NAME: self._friendly_name}
            ),
        )

    async def async_step_select_device(
        self, user_input=None
    ) -> data_entry_flow.FlowResult:
        """Present a screen to select available devices from."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        if user_input is not None:
            self._errors = {}
            self._host = user_input.get(CONF_HOST)
            self._friendly_name = self._discovered_devices.get(self._host)
            _LOGGER.debug(self.format("friendly_name: %s"), self._friendly_name)
            serial = [
                dev.device_id
                for dev in self._discovered_devices_hd
                if dev.ip == self._host
            ][0]
            _LOGGER.debug(self.format("serial: %s"), serial)
            _LOGGER.debug(self.format("setting unique_id to: %s"), serial)
            await self.async_set_unique_id(unique_id=serial, raise_on_progress=False)
            return await self.async_step_friendly_name()

        # region #-- build the names to show as options --#
        existing_entries: List[
            config_entries.ConfigEntry
        ] = self.hass.config_entries.async_entries(domain=DOMAIN)
        existing_ids: List[str] = [ce.unique_id for ce in existing_entries]
        for dev in self._discovered_devices_hd:
            await dev.async_gather_details()
            if dev.device_id not in existing_ids:
                dev_name: str = ""
                if dev.friendly_name:
                    dev_name += dev.friendly_name
                dev_name += f" {dev.device_id}" if dev_name else dev.device_id
                if self._discovered_devices is None:
                    self._discovered_devices = {}
                self._discovered_devices[dev.ip] = dev_name
        # endregion

        # region #-- no additional sensors found --#
        if self._discovered_devices is None:
            raise data_entry_flow.AbortFlow(reason="no_additional")
        # endregion

        return self.async_show_form(
            step_id=STEP_SELECT_DEVICE,
            data_schema=await _async_build_schema_with_user_input(
                STEP_SELECT_DEVICE,
                user_input=[
                    {"label": dev_name, "value": dev_ip}
                    for dev_ip, dev_name in self._discovered_devices.items()
                ],
            ),
            errors=self._errors,
            last_step=False,
        )

    async def async_step_ssdp(
        self, discovery_info: ssdp.SsdpServiceInfo
    ) -> data_entry_flow.FlowResult:
        """Manage the devices discovered by SSDP."""
        _LOGGER.debug(self.format("entered, discovery_info: %s"), discovery_info)

        # region #-- get the important information --#
        self._friendly_name = (
            f"{discovery_info.upnp.get('modelName', '')} "
            f"{discovery_info.upnp.get('serialNumber', '')}"
        )
        service_list = discovery_info.upnp.get("serviceList", {}).get("service")
        if service_list:
            _LOGGER.debug(self.format("%s"), json.dumps(service_list))
            service = service_list[0]
            self._host = urlparse(url=service.get("controlURL", "")).hostname
        serial: str = discovery_info.upnp.get("serialNumber", "")
        # endregion

        # region #-- set a unique_id, update details if device has changed IP --#
        _LOGGER.debug(self.format("setting unique_id: %s"), serial)
        await self.async_set_unique_id(unique_id=serial)
        matching_instance: List[
            config_entries.ConfigEntry
        ] | config_entries.ConfigEntry = [
            instance for instance in self.hass.config_entries.async_entries(DOMAIN)
        ]
        if matching_instance:
            matching_instance = matching_instance[0]
            if matching_instance.source == "ssdp":
                _LOGGER.debug(self.format("instance already configured, updating host"))
                self._abort_if_unique_id_configured(updates={CONF_HOST: self._host})
            else:
                _LOGGER.debug(
                    self.format("instance already configured, not updating host")
                )
        # endregion

        self.context["title_placeholders"] = {
            "name": self._friendly_name
        }  # set the name of the flow

        return await self.async_step_friendly_name()

    async def async_step_user(self, user_input=None) -> data_entry_flow.FlowResult:
        """Handle a flow initiated by the user."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)

        if user_input is not None:
            self._errors = {}
            self._friendly_name = user_input.get(CONF_FRIENDLY_NAME, "")
            self._host = user_input.get(CONF_HOST, "")
            self._task_details = None
            return await self.async_step_details()

        return self.async_show_form(
            step_id=STEP_USER,
            data_schema=await _async_build_schema_with_user_input(
                STEP_USER, user_input
            ),
            description_placeholders={"error_message": self._error_message},
            errors=self._errors,
            last_step=False,
        )


class HDHomerunOptionsFlowHandler(config_entries.OptionsFlow, Logger):
    """Manage the options flow."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialise."""
        super().__init__()
        self._config_entry = config_entry
        self._errors: dict = {}
        self._options: dict = dict(config_entry.options)

    async def async_step_finish(self, user_input=None) -> data_entry_flow.FlowResult:
        """Finalise the settings to write back."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        return self.async_create_entry(
            title=self._config_entry.title, data=self._options
        )

    async def async_step_init(self, user_input=None) -> data_entry_flow.FlowResult:
        """First step in the flow."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        return await self.async_step_timeouts()

    async def async_step_options(
        self, user_input: Optional[dict] = None
    ) -> data_entry_flow.FlowResult:
        """Present the main options."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        if user_input is not None:
            self._errors = {}
            user_input[CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH] = user_input.get(
                CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
            ).strip()
            self._options.update(user_input)
            return await self.async_step_finish()

        return self.async_show_form(
            step_id=STEP_OPTIONS,
            data_schema=await _async_build_schema_with_user_input(
                STEP_OPTIONS, self._options
            ),
            errors=self._errors,
            last_step=True,
        )

    async def async_step_timeouts(
        self, user_input: Optional[dict] = None
    ) -> data_entry_flow.FlowResult:
        """Present the timeout options."""
        _LOGGER.debug(self.format("entered, user_input: %s"), user_input)
        if user_input is not None:
            self._errors = {}
            self._options.update(user_input)
            return await self.async_step_options()

        return self.async_show_form(
            step_id=STEP_TIMEOUTS,
            data_schema=await _async_build_schema_with_user_input(
                STEP_TIMEOUTS, self._options
            ),
            errors=self._errors,
            last_step=False,
        )
