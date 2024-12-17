"""Config flow for the Playstation Network integration."""

import logging
from typing import Any
import re

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry, ConfigFlow
from homeassistant.const import CONF_USERNAME
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import AbortFlow, FlowResult
from homeassistant.exceptions import (
    ConfigEntryAuthFailed,
    ConfigEntryNotReady,
    HomeAssistantError,
)
from homeassistant.helpers import entity_registry as er, device_registry as dr
from psnawp_api.core.psnawp_exceptions import PSNAWPAuthenticationError
from psnawp_api.psnawp import PSNAWP

from .const import DOMAIN, CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES
from .coordinator import PsnCoordinator

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema({vol.Required("npsso"): str})


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect.

    Data has the keys from STEP_USER_DATA_SCHEMA with values provided by the user.
    """
    try:
        npsso = data.get("npsso")
        psn = PSNAWP(npsso)
    except PSNAWPAuthenticationError as error:
        raise ConfigEntryAuthFailed(error) from error
    except Exception as ex:
        raise ConfigEntryNotReady(ex) from ex

    try:
        user = await hass.async_add_executor_job(lambda: psn.user(online_id="me"))
        client = psn.me()
        coordinator = PsnCoordinator(hass, psn, user, client)
        await coordinator._async_update_data()
    except PSNAWPAuthenticationError as error:
        raise ConfigEntryAuthFailed(error) from error
    except Exception as ex:
        raise ConfigEntryNotReady(ex) from ex

    # Return info that you want to store in the config entry.
    return {
        "title": "Playstation Network",
        "npsso": npsso,
        "username": coordinator.data.get("username"),
        "data": data,
    }


class PlaystationNetworkConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Playstation Network."""

    VERSION = 1
    CONNECTION_CLASS = config_entries.CONN_CLASS_CLOUD_POLL

    reauth_entry: ConfigEntry | None = None

    def __init__(self) -> None:
        """Playstation Network Config Flow."""
        self.psn: PSNAWP = None

    # @staticmethod
    # @callback
    # def async_get_options_flow(config_entry: ConfigEntry) -> PlaystationNetworkOptionsFlowHandler:
    #     """Get the options flow for this handler."""
    #     return PlaystationNetworkOptionsFlowHandler(config_entry)

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ):
        """Get the options flow for this handler."""
        return PlaystationNetworkOptionsFlowHandler(config_entry)

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}
        if user_input is None or user_input == {}:
            return self.async_show_form(
                step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
            )

        try:
            info = await validate_input(self.hass, user_input)
            await self._async_set_unique_id_and_abort_if_already_configured(
                info[CONF_USERNAME]
            )
        except CannotConnect:
            errors = {"base": "Cannot Connect"}
        except InvalidAuth:
            errors = {"base": "Invalid Authentication"}
        except AbortFlow:
            errors = {"base": "This account is already configured"}
        except Exception:  # pylint: disable=broad-except
            _LOGGER.exception("Unexpected exception")
            errors["base"] = "unknown"
        else:
            return self.async_create_entry(title=info["title"], data=info)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )

    async def async_step_reauth(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Perform reauth upon an API authentication error."""
        user_input["npsso"] = None
        return await self.async_step_reauth_confirm(user_input)

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Dialog that informs the user that reauth is required."""
        errors = {}
        if user_input is None:
            user_input = {}

        self.reauth_entry = self.hass.config_entries.async_get_entry(
            self.context["entry_id"]
        )

        _LOGGER.debug("Playstation async_step_reauth_confirm %s", self.reauth_entry)

        if user_input.get("npsso") is None:
            return self.async_show_form(
                step_id="reauth_confirm",
                data_schema=STEP_USER_DATA_SCHEMA,
                errors=errors,
            )

        try:
            info = await validate_input(self.hass, user_input)
        except CannotConnect:
            errors = {"base": "Cannot Connect"}
        except InvalidAuth:
            errors = {"base": "Invalid Authentication"}
        except Exception:  # pylint: disable=broad-except
            _LOGGER.exception("Unexpected exception")
            errors["base"] = "unknown"
        else:
            existing_entry = await self.async_set_unique_id(
                self.reauth_entry.unique_id, raise_on_progress=False
            )
            if existing_entry:
                self.hass.config_entries.async_update_entry(existing_entry, data=info)
                await self.hass.config_entries.async_reload(existing_entry.entry_id)
                return self.async_abort(
                    reason="reauth_successful",
                    description_placeholders={
                        "reauth_successful": "You reauthenticated successfully"
                    },
                )

            return self.async_create_entry(
                title=info["title"],
                data=info,
            )
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )

    async def _async_set_unique_id_and_abort_if_already_configured(
        self, unique_id: str
    ) -> None:
        """Set the unique ID and abort if already configured."""
        await self.async_set_unique_id(unique_id, raise_on_progress=False)
        self._abort_if_unique_id_configured(
            updates={CONF_USERNAME: unique_id},
        )


class PlaystationNetworkOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle Playstation Network options."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry
        self.options = dict(config_entry.options)

    async def async_step_init(self, user_input=None):  # pylint: disable=unused-argument
        """Manage the options."""
        return await self.async_step_entities()

    async def async_step_entities(self, user_input=None):
        """Handle options initialized by the user."""
        if user_input is not None:
            self.options.update(user_input)
            return await self._update_options()

        return self.async_show_form(
            step_id="entities",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES,
                        default=self.config_entry.options.get(
                            CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES, False
                        ),
                    ): bool,
                }
            ),
            last_step=True,
        )

    async def _update_options(self):
        """Update config entry options."""
        if self.options.get(CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES) is False:
            self._remove_unused_entities()

        return self.async_create_entry(title="", data=self.options)

    def _remove_unused_entities(self):
        try:
            entities_to_remove = []
            device = None
            if self.options.get(CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES) is False:
                entity_registry = er.async_get(self.hass)
                dev_reg = dr.async_get(self.hass)
                devices: list[dr.DeviceEntry] = dr.async_entries_for_config_entry(
                    dev_reg, self.config_entry.entry_id
                )
                for device in devices:
                    if device.name.lower() == self.config_entry.unique_id.lower():
                        continue

                if device is not None:
                    entity_entries = er.async_entries_for_device(
                        er.async_get(self.hass),
                        device.id,
                        include_disabled_entities=True,
                    )

                    for entity in entity_entries:
                        try:
                            if re.search("_attr$", entity.unique_id):
                                entities_to_remove.append(
                                    entity_registry.async_get_entity_id(
                                        "sensor", DOMAIN, entity.unique_id
                                    )
                                )
                        except Exception as ex:
                            _LOGGER.debug(
                                "Unexpected item when looping over entities %s", ex
                            )
                    for entity_id in entities_to_remove:
                        _LOGGER.debug("Removing entity: %s", entity_id)
                        entity_registry.async_remove(entity_id)
                else:
                    _LOGGER.debug(
                        "Unable to find device matching name: %s",
                        self.config_entry.unique_id,
                    )
        except Exception as ex:
            _LOGGER.debug("Unexpected issue when removing entities: %s", ex)


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""
