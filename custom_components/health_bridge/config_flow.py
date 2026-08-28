"""Config flow for Health Bridge integration."""
from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_TOKEN
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import device_registry as dr

from . import async_delete_device_for_entry
from .const import DOMAIN

CONF_DEVICE_ID = "device_id"
CONF_NUTRIENT_MASS_UNIT = "nutrient_mass_unit"
CONF_WATER_VOLUME_UNIT = "water_volume_unit"

DEFAULT_NUTRIENT_MASS_UNIT = "g"
DEFAULT_WATER_VOLUME_UNIT = "mL"


def _build_options_schema(
    mass_unit: str = DEFAULT_NUTRIENT_MASS_UNIT,
    water_unit: str = DEFAULT_WATER_VOLUME_UNIT,
) -> vol.Schema:
    """Build the options form schema."""
    return vol.Schema(
        {
            vol.Required(
                CONF_NUTRIENT_MASS_UNIT,
                default=mass_unit,
            ): vol.In(["g", "oz"]),
            vol.Required(
                CONF_WATER_VOLUME_UNIT,
                default=water_unit,
            ): vol.In(["mL", "fl_oz"]),
        }
    )


class HealthBridgeConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Health Bridge."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None) -> FlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            token = user_input[CONF_TOKEN]

            await self.async_set_unique_id(token)
            self._abort_if_unique_id_configured(updates={CONF_TOKEN: token})

            # Create the config entry; options can be set/changed later
            return self.async_create_entry(
                title="Health Bridge",
                data={CONF_TOKEN: token},
                options={
                    CONF_NUTRIENT_MASS_UNIT: DEFAULT_NUTRIENT_MASS_UNIT,
                    CONF_WATER_VOLUME_UNIT: DEFAULT_WATER_VOLUME_UNIT,
                },
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_TOKEN): str}),
            errors=errors,
        )

    async def async_step_reconfigure(
        self, user_input: dict | None = None
    ) -> FlowResult:
        """Handle updates to config entry data from the settings UI."""
        entry = self._get_reconfigure_entry()

        if user_input is not None:
            token = user_input[CONF_TOKEN]
            await self.async_set_unique_id(token)
            self._abort_if_unique_id_mismatch(reason="already_configured")

            return self.async_update_reload_and_abort(
                entry,
                data_updates={CONF_TOKEN: token},
            )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=vol.Schema(
                {vol.Required(CONF_TOKEN, default=entry.data.get(CONF_TOKEN, "")): str}
            ),
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlowHandler:
        return OptionsFlowHandler()


class OptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options."""

    def __init__(self) -> None:
        self._selected_device_id: str | None = None

    async def async_step_init(self, user_input: dict | None = None) -> FlowResult:
        return self.async_show_menu(
            step_id="init",
            menu_options=["units", "edit_delete"],
        )

    async def async_step_units(self, user_input: dict | None = None) -> FlowResult:
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        cur = self.config_entry.options
        mass_unit = cur.get(CONF_NUTRIENT_MASS_UNIT, DEFAULT_NUTRIENT_MASS_UNIT)
        vol_unit = cur.get(CONF_WATER_VOLUME_UNIT, DEFAULT_WATER_VOLUME_UNIT)

        return self.async_show_form(
            step_id="units",
            data_schema=_build_options_schema(mass_unit, vol_unit),
        )

    async def async_step_edit_delete(
        self, user_input: dict | None = None
    ) -> FlowResult:
        devices = self._get_health_bridge_devices()
        if not devices:
            return self.async_abort(reason="no_devices")

        if user_input is not None:
            self._selected_device_id = user_input[CONF_DEVICE_ID]
            return await self.async_step_confirm_delete()

        return self.async_show_form(
            step_id="edit_delete",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_DEVICE_ID): vol.In(
                        {
                            device.id: self._get_device_label(device)
                            for device in devices
                        }
                    )
                }
            ),
        )

    async def async_step_confirm_delete(
        self, user_input: dict | None = None
    ) -> FlowResult:
        device = self._get_selected_device()
        if device is None:
            return self.async_abort(reason="device_not_found")

        if user_input is not None:
            if user_input["confirm"]:
                await async_delete_device_for_entry(
                    self.hass, self.config_entry, device.id
                )
                return self.async_create_entry(
                    title="",
                    data=dict(self.config_entry.options),
                )

            return await self.async_step_init()

        return self.async_show_form(
            step_id="confirm_delete",
            data_schema=vol.Schema({vol.Required("confirm", default=False): bool}),
            description_placeholders={"device_name": self._get_device_label(device)},
        )

    def _get_health_bridge_devices(self) -> list[dr.DeviceEntry]:
        """Return Health Bridge devices attached to this config entry."""
        device_registry = dr.async_get(self.hass)
        return [
            device
            for device in dr.async_entries_for_config_entry(
                device_registry, self.config_entry.entry_id
            )
            if any(identifier[0] == DOMAIN for identifier in device.identifiers)
        ]

    def _get_selected_device(self) -> dr.DeviceEntry | None:
        """Return the device selected for deletion."""
        if self._selected_device_id is None:
            return None

        return dr.async_get(self.hass).async_get(self._selected_device_id)

    @staticmethod
    def _get_device_label(device: dr.DeviceEntry) -> str:
        """Build a readable device label for the options UI."""
        return device.name_by_user or device.name or device.id
