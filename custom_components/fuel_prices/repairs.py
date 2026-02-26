"""Implementations for repairs."""

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.components.repairs import RepairsFlow
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN, CONF_SOURCES, CONF_CHEAPEST_SENSORS, CONF_CHEAPEST_SENSORS_FUEL_TYPE, CONF_CHEAPEST_SENSORS_COUNT


class DirectLeaseDeprecationFlow(RepairsFlow):
    """Repairs flow for DirectLease data source deprecation."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize the flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Handle the initial step."""
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input=None):
        """Handle the confirmation step."""
        if user_input is not None:
            new_data = dict(self._config_entry.data.items())
            # Remove the deprecated data source from the config entry data
            new_data[CONF_SOURCES] = {
                k: v for k, v in new_data[CONF_SOURCES].items() if k != "directlease"}
            # Add the replacement data source if it's not already in the list of sources
            new_data[CONF_SOURCES]["anwbonderweg"] = {}
            self.hass.config_entries.async_update_entry(
                self._config_entry, data=new_data, options={})
            ir.async_delete_issue(self.hass, DOMAIN, "deprecate_directlease")
            await self.hass.config_entries.async_reload(self._config_entry.entry_id)
            return self.async_create_entry(data={})
        return self.async_show_form(
            step_id="confirm",
        )


class CheapestStationsDeprecationFlow(RepairsFlow):
    """Repairs flow for cheapest stations option deprecation."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize the flow."""
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Handle the initial step."""
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input=None):
        """Handle the confirmation step."""
        if user_input is not None:
            new_data = dict(self._config_entry.data.items())
            for area in new_data.get("areas", []):
                area.pop(CONF_CHEAPEST_SENSORS, None)
                area.pop(CONF_CHEAPEST_SENSORS_FUEL_TYPE, None)
                area.pop(CONF_CHEAPEST_SENSORS_COUNT, None)
            self.hass.config_entries.async_update_entry(
                self._config_entry, data=new_data, options={})
            ir.async_delete_issue(
                self.hass, DOMAIN, "deprecate_cheapest_stations")
            await self.hass.config_entries.async_reload(self._config_entry.entry_id)
            return self.async_create_entry(data={})
        return self.async_show_form(
            step_id="confirm",
        )


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, Any] | None
):
    """Create a fix flow."""
    if not data or "entry_id" not in data:
        raise ValueError("Missing data for repair flow.")
    entry_id = data["entry_id"]
    entry = hass.config_entries.async_get_entry(entry_id)
    if issue_id == "deprecate_directlease":
        return DirectLeaseDeprecationFlow(entry)
    if issue_id == "deprecate_cheapest_stations":
        return CheapestStationsDeprecationFlow(entry)
    raise ValueError(f"Unknown issue_id {issue_id} for repair flow.")


def raise_feature_deprecation(hass: HomeAssistant, config_entry: ConfigEntry, feature_key: str, break_version: str):
    """Raise a feature deprecation warning."""
    ir.async_create_issue(
        hass,
        domain=DOMAIN,
        issue_id=f"deprecate_{feature_key}",
        is_fixable=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key=f"deprecate_{feature_key}",
        breaks_in_ha_version=break_version,
        learn_more_url="https://github.com/pantherale0/ha-fuelprices/issues/47"
    )


def raise_fixable_deprecation(hass: HomeAssistant, config_entry: ConfigEntry, feature_key: str, break_version: str):
    """Raise a fixable feature deprecation warning."""
    ir.async_create_issue(
        hass,
        domain=DOMAIN,
        data={"entry_id": config_entry.entry_id},
        issue_id=f"deprecate_{feature_key}",
        is_fixable=True,
        severity=ir.IssueSeverity.WARNING,
        translation_key=f"deprecate_{feature_key}",
        breaks_in_ha_version=break_version,
    )
