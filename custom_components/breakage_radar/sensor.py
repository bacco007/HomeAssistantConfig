"""Sensor platform: how many of my custom integrations are going to break."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceEntryType, DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTR_DETAILS,
    ATTR_INDEX_GENERATED,
    ATTR_SCHEDULE,
    DOMAIN,
    MAX_SENSOR_FINDINGS,
    NAME,
)
from .coordinator import BreakageRadarCoordinator


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the single Breakage Radar sensor."""
    coordinator: BreakageRadarCoordinator = hass.data[DOMAIN][entry.entry_id]
    async_add_entities([BreakageRadarSensor(coordinator, entry)])


class BreakageRadarSensor(CoordinatorEntity[BreakageRadarCoordinator], SensorEntity):
    """Number of installed custom integrations with at least one finding."""

    _attr_has_entity_name = True
    _attr_translation_key = "affected"
    _attr_icon = "mdi:radar"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_native_unit_of_measurement = "integrations"

    def __init__(
        self, coordinator: BreakageRadarCoordinator, entry: ConfigEntry | None = None
    ) -> None:
        super().__init__(coordinator)
        unique_suffix = entry.entry_id if entry else "default"
        self._attr_unique_id = f"{DOMAIN}_{unique_suffix}_affected"
        self.entity_id = f"sensor.{DOMAIN}_affected"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, unique_suffix)},
            name=NAME,
            manufacturer="Breakage Radar",
            entry_type=DeviceEntryType.SERVICE,
            configuration_url="https://booyaka101.github.io/hass-breakage-radar/",
        )

    @property
    def native_value(self) -> int | None:
        data = self.coordinator.data
        if not data:
            return None
        return int(data.get("affected_count", 0))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """A compact summary of the report.

        Home Assistant's recorder drops state attributes over 16 KB, and the
        full finding list went past that on a system with nine affected
        integrations. Each finding is trimmed to the fields worth templating
        on; the messages, links and versions are in the downloadable
        diagnostics instead.
        """
        data = self.coordinator.data or {}
        findings = [
            {
                "domain": detail["domain"],
                "breaks_in": detail["breaks_in"],
                "when": detail["when"],
                "file": detail["file"],
                "line": detail["line"],
                "confidence": detail["confidence"],
                "rule_id": detail["rule_id"],
            }
            for detail in data.get("details", [])[:MAX_SENSOR_FINDINGS]
        ]
        attributes: dict[str, Any] = {
            ATTR_SCHEDULE: data.get("schedule", []),
            ATTR_DETAILS: findings,
            ATTR_INDEX_GENERATED: data.get("index_generated_utc", ""),
            "affected_domains": data.get("affected_domains", []),
            "broken_now": data.get("broken_now", {}),
            "broken_now_count": data.get("broken_now_count", 0),
            "imminent": data.get("imminent", {}),
            "imminent_count": data.get("imminent_count", 0),
            "earliest_release": data.get("earliest_release"),
            "alert_window_days": data.get("alert_window_days", 0),
            "ignored_domains": data.get("ignored_domains", []),
            "total_findings": data.get("total_findings", 0),
            "details_truncated": data.get("total_findings", 0) > len(findings),
            "installed_count": data.get("installed_count", 0),
            "cards_installed_count": data.get("cards_installed_count", 0),
            "affected_cards": data.get("affected_cards", []),
            "cards_not_analysed": data.get("cards_not_analysed", []),
            "skipped_minified_files": data.get("skipped_minified_files", 0),
            "clean_count": len(data.get("clean_domains", [])),
            "not_analysed": data.get("not_in_index", []),
            "files_scanned": data.get("files_scanned", 0),
            "unparsed_files": data.get("unparsed_files", 0),
            "skipped_files": data.get("skipped_files", 0),
            "index_core_version": data.get("index_core_version", ""),
            "index_url": self.coordinator.index_url,
        }
        if self.coordinator.last_error:
            attributes["last_error"] = self.coordinator.last_error
        return attributes
