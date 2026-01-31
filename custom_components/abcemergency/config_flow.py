"""Config flow for ABC Emergency integration.

This module provides the configuration flow for setting up ABC Emergency
via the Home Assistant UI. Users can select instance types (State, Zone, or Person)
and configure each accordingly.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.const import (
    CONF_LATITUDE,
    CONF_LONGITUDE,
)
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    LocationSelector,
    LocationSelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
from homeassistant.util import slugify

from .api import ABCEmergencyClient
from .const import (
    CONF_INSTANCE_TYPE,
    CONF_PERSON_ENTITY_ID,
    CONF_PERSON_NAME,
    CONF_RADIUS_BUSHFIRE,
    CONF_RADIUS_EARTHQUAKE,
    CONF_RADIUS_FIRE,
    CONF_RADIUS_FLOOD,
    CONF_RADIUS_HEAT,
    CONF_RADIUS_OTHER,
    CONF_RADIUS_STORM,
    CONF_STATE,
    CONF_ZONE_NAME,
    DEFAULT_RADIUS_BUSHFIRE,
    DEFAULT_RADIUS_EARTHQUAKE,
    DEFAULT_RADIUS_FIRE,
    DEFAULT_RADIUS_FLOOD,
    DEFAULT_RADIUS_HEAT,
    DEFAULT_RADIUS_OTHER,
    DEFAULT_RADIUS_STORM,
    DOMAIN,
    INSTANCE_TYPE_PERSON,
    INSTANCE_TYPE_STATE,
    INSTANCE_TYPE_ZONE,
    STATE_NAMES,
    STATES,
)
from .exceptions import ABCEmergencyAPIError, ABCEmergencyConnectionError

_LOGGER = logging.getLogger(__name__)


class ABCEmergencyConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow for ABC Emergency."""

    VERSION = 3

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._data: dict[str, Any] = {}

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle the initial step - instance type selection."""
        if user_input is not None:
            instance_type = user_input[CONF_INSTANCE_TYPE]
            self._data[CONF_INSTANCE_TYPE] = instance_type

            if instance_type == INSTANCE_TYPE_STATE:
                return await self.async_step_state()
            if instance_type == INSTANCE_TYPE_ZONE:
                return await self.async_step_zone_name()
            if instance_type == INSTANCE_TYPE_PERSON:
                return await self.async_step_person()

        instance_type_options = [
            SelectOptionDict(
                value=INSTANCE_TYPE_STATE,
                label="Monitor a State/Territory",
            ),
            SelectOptionDict(
                value=INSTANCE_TYPE_ZONE,
                label="Monitor a fixed location (zone)",
            ),
            SelectOptionDict(
                value=INSTANCE_TYPE_PERSON,
                label="Monitor a person's location",
            ),
        ]

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_INSTANCE_TYPE): SelectSelector(
                        SelectSelectorConfig(
                            options=instance_type_options,
                            mode=SelectSelectorMode.LIST,
                        )
                    ),
                }
            ),
        )

    async def async_step_state(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle state selection for state instance."""
        errors: dict[str, str] = {}

        if user_input is not None:
            state = user_input[CONF_STATE]

            # Create unique ID for state instance
            unique_id = f"abc_emergency_state_{state}"
            await self.async_set_unique_id(unique_id)
            self._abort_if_unique_id_configured()

            # Test API connectivity
            try:
                session = async_get_clientsession(self.hass)
                client = ABCEmergencyClient(session)
                await client.async_get_emergencies_by_state(state)
            except ABCEmergencyConnectionError:
                errors["base"] = "cannot_connect"
            except ABCEmergencyAPIError:
                errors["base"] = "api_error"
            except Exception:
                _LOGGER.exception("Unexpected error during API test")
                errors["base"] = "unknown"

            if not errors:
                self._data[CONF_STATE] = state
                state_name = STATE_NAMES.get(state, state.upper())
                return self.async_create_entry(
                    title=f"ABC Emergency ({state_name})",
                    data=self._data,
                )

        # Build state options
        state_options = [
            SelectOptionDict(value=code, label=STATE_NAMES.get(code, code.upper()))
            for code in STATES
        ]

        return self.async_show_form(
            step_id="state",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_STATE): SelectSelector(
                        SelectSelectorConfig(
                            options=state_options,
                            mode=SelectSelectorMode.DROPDOWN,
                        )
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_zone_name(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle zone name and location configuration."""
        errors: dict[str, str] = {}

        if user_input is not None:
            zone_name = user_input.get(CONF_ZONE_NAME, "").strip()
            if not zone_name:
                errors["base"] = "name_required"
            else:
                # Check for duplicate zone name
                unique_id = f"abc_emergency_zone_{slugify(zone_name)}"
                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()

                self._data[CONF_ZONE_NAME] = zone_name

                # Get location (LocationSelector always returns valid data with required=True)
                location = user_input.get("location", {})
                if location:
                    self._data[CONF_LATITUDE] = location.get("latitude")
                    self._data[CONF_LONGITUDE] = location.get("longitude")
                else:  # pragma: no cover - defensive fallback, Required selector always provides value
                    self._data[CONF_LATITUDE] = self.hass.config.latitude
                    self._data[CONF_LONGITUDE] = self.hass.config.longitude

                return await self.async_step_zone_radius()

        # Default location to home
        default_location = {
            "latitude": self.hass.config.latitude,
            "longitude": self.hass.config.longitude,
        }

        return self.async_show_form(
            step_id="zone_name",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_ZONE_NAME): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Required("location", default=default_location): LocationSelector(
                        LocationSelectorConfig(radius=False, icon="mdi:map-marker")
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_zone_radius(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle per-incident-type radius configuration for zone."""
        if user_input is not None:
            self._data[CONF_RADIUS_BUSHFIRE] = user_input.get(
                CONF_RADIUS_BUSHFIRE, DEFAULT_RADIUS_BUSHFIRE
            )
            self._data[CONF_RADIUS_EARTHQUAKE] = user_input.get(
                CONF_RADIUS_EARTHQUAKE, DEFAULT_RADIUS_EARTHQUAKE
            )
            self._data[CONF_RADIUS_STORM] = user_input.get(CONF_RADIUS_STORM, DEFAULT_RADIUS_STORM)
            self._data[CONF_RADIUS_FLOOD] = user_input.get(CONF_RADIUS_FLOOD, DEFAULT_RADIUS_FLOOD)
            self._data[CONF_RADIUS_FIRE] = user_input.get(CONF_RADIUS_FIRE, DEFAULT_RADIUS_FIRE)
            self._data[CONF_RADIUS_HEAT] = user_input.get(CONF_RADIUS_HEAT, DEFAULT_RADIUS_HEAT)
            self._data[CONF_RADIUS_OTHER] = user_input.get(CONF_RADIUS_OTHER, DEFAULT_RADIUS_OTHER)

            zone_name = self._data.get(CONF_ZONE_NAME, "Zone")
            return self.async_create_entry(
                title=f"ABC Emergency ({zone_name})",
                data=self._data,
            )

        radius_config = NumberSelectorConfig(
            min=1,
            max=500,
            step=1,
            unit_of_measurement="km",
            mode=NumberSelectorMode.BOX,
        )

        return self.async_show_form(
            step_id="zone_radius",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_RADIUS_BUSHFIRE, default=DEFAULT_RADIUS_BUSHFIRE
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_EARTHQUAKE, default=DEFAULT_RADIUS_EARTHQUAKE
                    ): NumberSelector(radius_config),
                    vol.Required(CONF_RADIUS_STORM, default=DEFAULT_RADIUS_STORM): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_FLOOD, default=DEFAULT_RADIUS_FLOOD): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_FIRE, default=DEFAULT_RADIUS_FIRE): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_HEAT, default=DEFAULT_RADIUS_HEAT): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_OTHER, default=DEFAULT_RADIUS_OTHER): NumberSelector(
                        radius_config
                    ),
                }
            ),
        )

    async def async_step_person(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle person entity selection."""
        errors: dict[str, str] = {}

        if user_input is not None:
            person_entity_id = user_input.get(CONF_PERSON_ENTITY_ID)
            # EntitySelector with Required always provides a value, but handle edge case
            if not person_entity_id:  # pragma: no cover - defensive fallback
                errors["base"] = "person_required"
            else:
                # Check for duplicate person
                entity_slug = slugify(person_entity_id.replace(".", "_"))
                unique_id = f"abc_emergency_person_{entity_slug}"
                await self.async_set_unique_id(unique_id)
                self._abort_if_unique_id_configured()

                self._data[CONF_PERSON_ENTITY_ID] = person_entity_id

                # Get friendly name from entity registry or entity state
                ent_reg = er.async_get(self.hass)
                entity_entry = ent_reg.async_get(person_entity_id)
                if entity_entry and entity_entry.name:
                    person_name = entity_entry.name
                else:
                    state = self.hass.states.get(person_entity_id)
                    if state and state.attributes.get("friendly_name"):
                        person_name = state.attributes["friendly_name"]
                    else:
                        # Extract name from entity_id (e.g., "person.dad" -> "Dad")
                        person_name = person_entity_id.split(".")[-1].replace("_", " ").title()

                self._data[CONF_PERSON_NAME] = person_name
                return await self.async_step_person_radius()

        return self.async_show_form(
            step_id="person",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_PERSON_ENTITY_ID): EntitySelector(
                        EntitySelectorConfig(domain="person")
                    ),
                }
            ),
            errors=errors,
        )

    async def async_step_person_radius(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle per-incident-type radius configuration for person."""
        if user_input is not None:
            self._data[CONF_RADIUS_BUSHFIRE] = user_input.get(
                CONF_RADIUS_BUSHFIRE, DEFAULT_RADIUS_BUSHFIRE
            )
            self._data[CONF_RADIUS_EARTHQUAKE] = user_input.get(
                CONF_RADIUS_EARTHQUAKE, DEFAULT_RADIUS_EARTHQUAKE
            )
            self._data[CONF_RADIUS_STORM] = user_input.get(CONF_RADIUS_STORM, DEFAULT_RADIUS_STORM)
            self._data[CONF_RADIUS_FLOOD] = user_input.get(CONF_RADIUS_FLOOD, DEFAULT_RADIUS_FLOOD)
            self._data[CONF_RADIUS_FIRE] = user_input.get(CONF_RADIUS_FIRE, DEFAULT_RADIUS_FIRE)
            self._data[CONF_RADIUS_HEAT] = user_input.get(CONF_RADIUS_HEAT, DEFAULT_RADIUS_HEAT)
            self._data[CONF_RADIUS_OTHER] = user_input.get(CONF_RADIUS_OTHER, DEFAULT_RADIUS_OTHER)

            person_name = self._data.get(CONF_PERSON_NAME, "Person")
            return self.async_create_entry(
                title=f"ABC Emergency ({person_name})",
                data=self._data,
            )

        radius_config = NumberSelectorConfig(
            min=1,
            max=500,
            step=1,
            unit_of_measurement="km",
            mode=NumberSelectorMode.BOX,
        )

        return self.async_show_form(
            step_id="person_radius",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_RADIUS_BUSHFIRE, default=DEFAULT_RADIUS_BUSHFIRE
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_EARTHQUAKE, default=DEFAULT_RADIUS_EARTHQUAKE
                    ): NumberSelector(radius_config),
                    vol.Required(CONF_RADIUS_STORM, default=DEFAULT_RADIUS_STORM): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_FLOOD, default=DEFAULT_RADIUS_FLOOD): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_FIRE, default=DEFAULT_RADIUS_FIRE): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_HEAT, default=DEFAULT_RADIUS_HEAT): NumberSelector(
                        radius_config
                    ),
                    vol.Required(CONF_RADIUS_OTHER, default=DEFAULT_RADIUS_OTHER): NumberSelector(
                        radius_config
                    ),
                }
            ),
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: ConfigEntry,
    ) -> OptionsFlow:
        """Get the options flow."""
        return ABCEmergencyOptionsFlow()


class ABCEmergencyOptionsFlow(OptionsFlow):
    """Options flow for ABC Emergency."""

    async def async_step_init(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle options initialization."""
        instance_type = self.config_entry.data.get(CONF_INSTANCE_TYPE, INSTANCE_TYPE_STATE)

        # State instances have no configurable options
        if instance_type == INSTANCE_TYPE_STATE:
            return self.async_abort(reason="no_options_state")

        # Zone and person instances can modify radii
        return await self.async_step_radius()

    async def async_step_radius(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> ConfigFlowResult:
        """Handle radius options for zone/person instances."""
        if user_input is not None:
            return self.async_create_entry(
                title="",
                data={
                    CONF_RADIUS_BUSHFIRE: user_input.get(
                        CONF_RADIUS_BUSHFIRE, DEFAULT_RADIUS_BUSHFIRE
                    ),
                    CONF_RADIUS_EARTHQUAKE: user_input.get(
                        CONF_RADIUS_EARTHQUAKE, DEFAULT_RADIUS_EARTHQUAKE
                    ),
                    CONF_RADIUS_STORM: user_input.get(CONF_RADIUS_STORM, DEFAULT_RADIUS_STORM),
                    CONF_RADIUS_FLOOD: user_input.get(CONF_RADIUS_FLOOD, DEFAULT_RADIUS_FLOOD),
                    CONF_RADIUS_FIRE: user_input.get(CONF_RADIUS_FIRE, DEFAULT_RADIUS_FIRE),
                    CONF_RADIUS_HEAT: user_input.get(CONF_RADIUS_HEAT, DEFAULT_RADIUS_HEAT),
                    CONF_RADIUS_OTHER: user_input.get(CONF_RADIUS_OTHER, DEFAULT_RADIUS_OTHER),
                },
            )

        def get_radius(key: str, default: int) -> int:
            value = self.config_entry.options.get(key, self.config_entry.data.get(key, default))
            return int(value) if value is not None else default

        radius_config = NumberSelectorConfig(
            min=1,
            max=500,
            step=1,
            unit_of_measurement="km",
            mode=NumberSelectorMode.BOX,
        )

        return self.async_show_form(
            step_id="radius",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_RADIUS_BUSHFIRE,
                        default=get_radius(CONF_RADIUS_BUSHFIRE, DEFAULT_RADIUS_BUSHFIRE),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_EARTHQUAKE,
                        default=get_radius(CONF_RADIUS_EARTHQUAKE, DEFAULT_RADIUS_EARTHQUAKE),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_STORM,
                        default=get_radius(CONF_RADIUS_STORM, DEFAULT_RADIUS_STORM),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_FLOOD,
                        default=get_radius(CONF_RADIUS_FLOOD, DEFAULT_RADIUS_FLOOD),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_FIRE,
                        default=get_radius(CONF_RADIUS_FIRE, DEFAULT_RADIUS_FIRE),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_HEAT,
                        default=get_radius(CONF_RADIUS_HEAT, DEFAULT_RADIUS_HEAT),
                    ): NumberSelector(radius_config),
                    vol.Required(
                        CONF_RADIUS_OTHER,
                        default=get_radius(CONF_RADIUS_OTHER, DEFAULT_RADIUS_OTHER),
                    ): NumberSelector(radius_config),
                }
            ),
        )
