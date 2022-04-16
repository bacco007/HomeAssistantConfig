"""Provice UI for configuring the integration"""

# region #-- imports --#
from __future__ import annotations

import asyncio
import json
import logging
from typing import Optional
from urllib.parse import urlparse

import aiohttp
import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant import (
    config_entries,
    data_entry_flow,
)
from homeassistant.components import ssdp
from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_HOST,
    CONF_SCAN_INTERVAL_TUNER_STATUS,
    CONF_TUNER_CHANNEL_AVAILABLE_FORMATS,
    CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    CONF_TUNER_CHANNEL_FORMAT,
    DEF_SCAN_INTERVAL_SECS,
    DEF_SCAN_INTERVAL_TUNER_STATUS_SECS,
    DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
    DEF_TUNER_CHANNEL_FORMAT,
    DOMAIN,
)
from .hdhomerun import (
    HDHomeRunDevice,
    HDHomeRunExceptionOldFirmware,
    HDHomeRunExceptionUnreachable,
)
from .logger import HDHomerunLogger

# endregion


_LOGGER = logging.getLogger(__name__)

CONF_FRIENDLY_NAME: str = "friendly_name"
STEP_CONFIRM: str = "confirm"
STEP_DETAILS: str = "details"
STEP_FINISH: str = "finish"
STEP_FRIENDLY_NAME: str = "friendly_name"
STEP_OPTIONS: str = "options"
STEP_TIMEOUTS: str = "timeouts"
STEP_USER: str = "user"


async def _async_build_schema_with_user_input(step: str, user_input: dict) -> vol.Schema:
    """Build the input and validation schema for the config UI

    :param step: the step we're in for a configuration or installation of the integration
    :param user_input: the data that should be used as defaults
    :return: the schema including necessary restrictions, defaults, pre-selections etc.
    """

    schema = {}
    if step == STEP_FRIENDLY_NAME:
        schema = {
            vol.Required(
                CONF_FRIENDLY_NAME,
                default=user_input.get(CONF_FRIENDLY_NAME, "")
            ): str,
        }

    if step == STEP_OPTIONS:
        schema = {
            vol.Optional(
                CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                default=user_input.get(CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH, DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH)
            ): cv.string,
            vol.Required(
                CONF_TUNER_CHANNEL_FORMAT,
                default=user_input.get(CONF_TUNER_CHANNEL_FORMAT, DEF_TUNER_CHANNEL_FORMAT)
            ): vol.In(CONF_TUNER_CHANNEL_AVAILABLE_FORMATS),
        }

    if step == STEP_TIMEOUTS:
        schema = {
            vol.Optional(
                CONF_SCAN_INTERVAL,
                default=user_input.get(CONF_SCAN_INTERVAL, DEF_SCAN_INTERVAL_SECS),
            ): cv.positive_int,
            vol.Optional(
                CONF_SCAN_INTERVAL_TUNER_STATUS,
                default=user_input.get(CONF_SCAN_INTERVAL_TUNER_STATUS, DEF_SCAN_INTERVAL_TUNER_STATUS_SECS),
            ): cv.positive_int,
        }

    if step == STEP_USER:
        schema = {
            vol.Optional(
                CONF_FRIENDLY_NAME,
                default=user_input.get(CONF_FRIENDLY_NAME, "")
            ): str,
            vol.Required(
                CONF_HOST,
                default=user_input.get(CONF_HOST, "")
            ): str,
        }

    return vol.Schema(schema)


class HDHomerunConfigFlow(config_entries.ConfigFlow, HDHomerunLogger, domain=DOMAIN):
    """"""

    def __init__(self):
        """"""

        HDHomerunLogger.__init__(self)

        self._errors: dict = {}
        self._error_message: str = ""
        self._friendly_name: str = ""
        self._host: str = ""
        self._serial: str = ""
        self._task_details: Optional[asyncio.Task] = None

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: config_entries.ConfigEntry) -> config_entries.OptionsFlow:
        """Get the options flow for this handler"""

        return HDHomerunOptionsFlowHandler(config_entry=config_entry)

    async def _async_get_details(self) -> None:
        """"""

        _LOGGER.debug(self.message_format("entered"))

        hdhomerun_device = HDHomeRunDevice(
            host=self._host,
            loop=self.hass.loop,
            session=async_get_clientsession(hass=self.hass),
        )
        try:
            await hdhomerun_device.get_details(include_discover=True, include_tuner_status=True)
        except aiohttp.ClientConnectorError:
            self._errors["base"] = "connection_error"
        except HDHomeRunExceptionUnreachable:
            self._errors["base"] = "connection_error"
        except HDHomeRunExceptionOldFirmware as err:
            _LOGGER.warning(self.message_format("%s"), err)
        except Exception as err:
            self._errors["base"] = "client_response_error"
            self._error_message = str(err)
            _LOGGER.error(self.message_format("%s --> %s"), type(err), err)
        else:
            await asyncio.sleep(1)
            if not self._friendly_name:
                self._friendly_name = f"{hdhomerun_device.friendly_name} {hdhomerun_device.serial}"
            self._serial = hdhomerun_device.serial

            # region #-- raise errors with response --#
            if not self._serial:
                self._errors["base"] = "invalid_serial"
                self._error_message = f"serial={self._serial}"
            # endregion

        self.hass.async_create_task(self.hass.config_entries.flow.async_configure(flow_id=self.flow_id))
        _LOGGER.debug(self.message_format("exited"))

    async def async_step_details(self, user_input=None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)
        if not self._task_details:
            _LOGGER.debug(self.message_format("creating task for gathering details"))
            self._task_details = self.hass.async_create_task(target=self._async_get_details())
            return self.async_show_progress(step_id=STEP_DETAILS, progress_action="_task_details")

        try:
            await self._task_details
        except Exception as err:
            _LOGGER.debug(self.message_format("exception: %s"), err)
            return self.async_abort(reason="abort_details")

        _LOGGER.debug(self.message_format("_errors: %s"), self._errors)
        if self._errors:
            return self.async_show_progress_done(next_step_id=STEP_USER)

        _LOGGER.debug(self.message_format("proceeding to next step"))
        return self.async_show_progress_done(next_step_id=STEP_FINISH)

    async def async_step_finish(self, _=None) -> data_entry_flow.FlowResult:
        """Finalise the configuration entry"""

        _LOGGER.debug(self.message_format("entered"))

        if not self.unique_id:
            await self.async_set_unique_id(unique_id=self._serial, raise_on_progress=False)
            self._abort_if_unique_id_configured(updates={CONF_HOST: self._host})

        data = {CONF_HOST: self._host}

        return self.async_create_entry(title=self._friendly_name or "HDHomerun", data=data)

    async def async_step_friendly_name(self, user_input=None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)

        if user_input is not None:
            self._friendly_name = user_input.get(CONF_FRIENDLY_NAME, "")
            return await self.async_step_finish()

        return self.async_show_form(
            step_id=STEP_FRIENDLY_NAME,
            data_schema=await _async_build_schema_with_user_input(
                STEP_FRIENDLY_NAME,
                {CONF_FRIENDLY_NAME: self._friendly_name}
            ),
        )

    async def async_step_ssdp(self, discovery_info: ssdp.SsdpServiceInfo) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, discovery_info: %s"), discovery_info)

        # region #-- get the important information --#
        self._friendly_name = f"{discovery_info.upnp.get('modelName', '')} " \
                              f"{discovery_info.upnp.get('serialNumber', '')}"
        service_list = discovery_info.upnp.get("serviceList", {}).get("service")
        if service_list:
            _LOGGER.debug(self.message_format("%s"), json.dumps(service_list))
            service = service_list[0]
            self._host = urlparse(url=service.get("controlURL", "")).hostname
        self._serial: str = discovery_info.upnp.get("serialNumber", "")
        # endregion

        # region #-- set a unique_id, update details if device has changed IP --#
        _LOGGER.debug(self.message_format("setting unique_id: %s"), self._serial)
        await self.async_set_unique_id(unique_id=self._serial)
        self._abort_if_unique_id_configured(updates={CONF_HOST: self._host})
        # endregion

        self.context["title_placeholders"] = {"name": self._friendly_name}  # set the name of the flow

        return await self.async_step_friendly_name()

    async def async_step_user(self, user_input=None) -> data_entry_flow.FlowResult:
        """Handle a flow initiated by the user"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)

        if user_input is not None:
            self._errors = {}
            self._friendly_name = user_input.get(CONF_FRIENDLY_NAME, "")
            self._host = user_input.get(CONF_HOST, "")
            self._task_details = None
            return await self.async_step_details()

        return self.async_show_form(
            step_id=STEP_USER,
            data_schema=await _async_build_schema_with_user_input(
                STEP_USER,
                {
                    CONF_FRIENDLY_NAME: self._friendly_name,
                    CONF_HOST: self._host,
                }
            ),
            errors=self._errors,
            description_placeholders={
                "error_message": self._error_message
            }
        )


class HDHomerunOptionsFlowHandler(config_entries.OptionsFlow, HDHomerunLogger):
    """"""

    def __init__(self, config_entry: config_entries.ConfigEntry):
        """Constructor"""

        super().__init__()
        self._config_entry = config_entry
        self._errors: dict = {}
        self._options: dict = dict(config_entry.options)

    # noinspection PyUnusedLocal
    async def async_step_finish(self, user_input=None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)
        return self.async_create_entry(title=self._config_entry.title, data=self._options)

    async def async_step_init(self, user_input=None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)
        return await self.async_step_timeouts()

    async def async_step_options(self, user_input: Optional[dict] = None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)
        if user_input is not None:
            self._errors = {}
            user_input[CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH] = user_input.get(
                CONF_TUNER_CHANNEL_ENTITY_PICTURE_PATH,
                DEF_TUNER_CHANNEL_ENTITY_PICTURE_PATH
            ).strip()
            self._options.update(user_input)
            return await self.async_step_finish()

        return self.async_show_form(
            step_id=STEP_OPTIONS,
            data_schema=await _async_build_schema_with_user_input(STEP_OPTIONS, self._options),
            errors=self._errors,
            last_step=True
        )

    async def async_step_timeouts(self, user_input: Optional[dict] = None) -> data_entry_flow.FlowResult:
        """"""

        _LOGGER.debug(self.message_format("entered, user_input: %s"), user_input)
        if user_input is not None:
            self._errors = {}
            self._options.update(user_input)
            return await self.async_step_options()

        return self.async_show_form(
            step_id=STEP_TIMEOUTS,
            data_schema=await _async_build_schema_with_user_input(STEP_TIMEOUTS, self._options),
            errors=self._errors,
            last_step=False
        )
