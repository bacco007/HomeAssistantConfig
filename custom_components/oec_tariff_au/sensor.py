"""Sensor entities for OEC Tariff."""

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import OecTariffCoordinator
from .demand_tracker import DemandWindowScheduler


async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up OEC Tariff sensors from a config entry."""
    data = hass.data[DOMAIN][entry.entry_id]
    coordinator: OecTariffCoordinator = data["coordinator"]

    entities = [
        OecCurrentRateSensor(coordinator, entry),
        OecCurrentPeriodSensor(coordinator, entry),
        OecDailySupplyChargeSensor(coordinator, entry),
        OecTariffNameSensor(coordinator, entry),
    ]
    if coordinator.tariff_detail and coordinator.tariff_detail.get("demand"):
        entities.append(OecDemandRateSensor(coordinator, entry))
        entities.append(OecDemandWindowStatusSensor(coordinator, entry))
    async_add_entities(entities)

    # Set up demand tracking sensors if power entity configured
    from .demand_sensors import async_setup_demand_sensors

    tracker = await async_setup_demand_sensors(hass, entry, coordinator, async_add_entities)
    if tracker:
        data["demand_tracker"] = tracker


class OecBaseSensor(CoordinatorEntity, SensorEntity):
    """Base class for OEC Tariff sensors."""

    def __init__(
        self, coordinator: OecTariffCoordinator, entry: ConfigEntry, key: str
    ) -> None:
        """Initialize sensor."""
        super().__init__(coordinator)
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": f"Tariff ({coordinator.dnsp}/{coordinator.tariff})",
            "manufacturer": "Open Energy Collective",
            "model": "Network Tariff",
        }


class OecCurrentRateSensor(OecBaseSensor):
    """Current energy rate sensor."""

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "current_rate")
        self._attr_name = "Current Rate"
        self._attr_native_unit_of_measurement = "$/kWh"
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_suggested_display_precision = 5

    @property
    def native_value(self) -> float | None:
        """Return current rate."""
        if self.coordinator.data and self.coordinator.data.get("rate"):
            return self.coordinator.data["rate"].get("rate")
        return None

    @property
    def extra_state_attributes(self) -> dict:
        """Return additional attributes."""
        if self.coordinator.data and self.coordinator.data.get("rate"):
            rate = self.coordinator.data["rate"]
            return {
                "period": rate.get("period"),
                "in_demand_window": rate.get("in_demand_window"),
                "dnsp": rate.get("dnsp"),
                "tariff": rate.get("tariff"),
                "datetime": rate.get("datetime"),
            }
        return {}


class OecCurrentPeriodSensor(OecBaseSensor):
    """Current tariff period sensor."""

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "current_period")
        self._attr_name = "Current Period"
        self._attr_icon = "mdi:clock-time-four-outline"

    @property
    def native_value(self) -> str | None:
        """Return current period name."""
        if self.coordinator.data and self.coordinator.data.get("rate"):
            return self.coordinator.data["rate"].get("period")
        return None


class OecDailySupplyChargeSensor(OecBaseSensor):
    """Daily supply charge sensor."""

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "daily_supply_charge")
        self._attr_name = "Daily Supply Charge"
        self._attr_native_unit_of_measurement = "$/day"
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_suggested_display_precision = 4

    @property
    def native_value(self) -> float | None:
        """Return daily supply charge."""
        if self.coordinator.data and self.coordinator.data.get("detail"):
            return self.coordinator.data["detail"].get("daily_supply_charge")
        return None


class OecDemandRateSensor(OecBaseSensor):
    """Demand charge rate sensor."""

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "demand_rate")
        self._attr_name = "Demand Rate"
        self._attr_native_unit_of_measurement = "$/kW/month"
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_suggested_display_precision = 2

    @property
    def native_value(self) -> float | None:
        """Return demand rate."""
        if self.coordinator.data and self.coordinator.data.get("detail"):
            demand = self.coordinator.data["detail"].get("demand")
            if demand:
                return demand.get("rate")
        return None

    @property
    def extra_state_attributes(self) -> dict:
        """Return demand window details."""
        if self.coordinator.data and self.coordinator.data.get("detail"):
            demand = self.coordinator.data["detail"].get("demand")
            if demand:
                return {
                    "window_start": demand.get("window_start"),
                    "window_end": demand.get("window_end"),
                    "measurement_method": demand.get("measurement_method"),
                    "days": demand.get("days"),
                    "season_months": demand.get("season_months"),
                }
        return {}


class OecDemandWindowStatusSensor(OecBaseSensor):
    """Enum sensor for demand window status (active/inactive).

    An enum sensor's `options` render as a fixed dropdown in the automation
    state trigger/condition UI, so "active"/"inactive" can be picked
    directly without a custom value.

    The stored/matched value is lowercase ("active"/"inactive" — the HA
    enum-sensor convention for machine values); `translation_key` maps that
    to "Active"/"Inactive" for display, via the `entity.sensor` block in
    strings.json.
    """

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = ["active", "inactive"]
    _attr_translation_key = "demand_window"

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "demand_window")
        self._attr_name = "Demand Window"
        self._attr_icon = "mdi:flash-alert"
        self._scheduler: DemandWindowScheduler | None = None

    @callback
    def _handle_transition(self, is_active: bool) -> None:
        """Write updated state when the window transitions."""
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """Start tracking the window boundary once added."""
        await super().async_added_to_hass()
        self._scheduler = DemandWindowScheduler(self.hass, self._handle_transition)
        detail = self.coordinator.tariff_detail
        demand = detail.get("demand") if detail else None
        if demand:
            self._scheduler.start(demand)

    async def async_will_remove_from_hass(self) -> None:
        """Cancel any pending scheduled transition."""
        if self._scheduler:
            self._scheduler.stop()

    @property
    def native_value(self) -> str | None:
        """Return "active" or "inactive"."""
        if self._scheduler is None or self._scheduler.is_active is None:
            return None
        return "active" if self._scheduler.is_active else "inactive"


class OecTariffNameSensor(OecBaseSensor):
    """Tariff name sensor."""

    def __init__(self, coordinator: OecTariffCoordinator, entry: ConfigEntry) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, "tariff_name")
        self._attr_name = "Tariff Name"
        self._attr_icon = "mdi:tag-text-outline"

    @property
    def native_value(self) -> str | None:
        """Return tariff name."""
        if self.coordinator.data and self.coordinator.data.get("detail"):
            return self.coordinator.data["detail"].get("name")
        return None
