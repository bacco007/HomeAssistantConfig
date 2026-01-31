"""Implementations for repairs."""

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN

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
