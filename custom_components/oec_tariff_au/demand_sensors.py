"""Demand charge sensors for OEC Tariff."""

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_BILLING_DAY, CONF_POWER_ENTITY, DEFAULT_BILLING_DAY, DOMAIN
from .coordinator import OecTariffCoordinator
from .demand_tracker import DemandTracker


async def async_setup_demand_sensors(
    hass: HomeAssistant,
    entry: ConfigEntry,
    coordinator: OecTariffCoordinator,
    async_add_entities: AddEntitiesCallback,
) -> DemandTracker | None:
    """Set up demand tracking sensors if configured."""
    power_entity = entry.data.get(CONF_POWER_ENTITY)
    if not power_entity:
        return None

    # Get demand config from tariff detail
    detail = coordinator.tariff_detail
    if not detail or not detail.get("demand"):
        return None

    demand = detail["demand"]
    billing_day = entry.data.get(CONF_BILLING_DAY, DEFAULT_BILLING_DAY)

    # Parse season_months from API response
    season_months = demand.get("season_months")

    tracker = DemandTracker(
        hass=hass,
        power_entity_id=power_entity,
        measurement_method=demand["measurement_method"],
        window_start=demand["window_start"],
        window_end=demand["window_end"],
        days=demand["days"],
        season_months=season_months,
        billing_day=billing_day,
    )

    entities = [
        OecMonthPeakDemandSensor(coordinator, entry, tracker),
        OecMonthlyDemandChargeSensor(coordinator, entry, tracker),
        OecDemandSurchargePerKwhSensor(coordinator, entry, tracker),
    ]
    async_add_entities(entities)

    return tracker


class OecDemandBaseSensor(CoordinatorEntity, RestoreEntity, SensorEntity):
    """Base class for demand sensors with state restoration."""

    def __init__(
        self,
        coordinator: OecTariffCoordinator,
        entry: ConfigEntry,
        tracker: DemandTracker,
        key: str,
    ) -> None:
        """Initialize."""
        super().__init__(coordinator)
        self._tracker = tracker
        self._attr_unique_id = f"{entry.entry_id}_{key}"
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": f"Tariff ({coordinator.dnsp}/{coordinator.tariff})",
            "manufacturer": "Open Energy Collective",
            "model": "Network Tariff",
        }


class OecMonthPeakDemandSensor(OecDemandBaseSensor):
    """Month-to-date peak demand sensor."""

    def __init__(
        self, coordinator: OecTariffCoordinator, entry: ConfigEntry, tracker: DemandTracker
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, tracker, "month_peak_demand")
        self._attr_name = "Month Peak Demand"
        self._attr_native_unit_of_measurement = "kW"
        self._attr_device_class = SensorDeviceClass.POWER
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_suggested_display_precision = 3
        self._attr_icon = "mdi:chart-line-variant"

    async def async_added_to_hass(self) -> None:
        """Restore state on startup."""
        await super().async_added_to_hass()
        last_state = await self.async_get_last_extra_data()
        if last_state:
            self._tracker.restore_state(last_state.as_dict())
        # Start tracking
        self._tracker.start()

    async def async_will_remove_from_hass(self) -> None:
        """Stop tracking on removal."""
        self._tracker.stop()

    @property
    def native_value(self) -> float:
        """Return current month peak demand."""
        return self._tracker.chargeable_demand

    @property
    def extra_state_attributes(self) -> dict:
        """Return tracking metadata."""
        return {
            "measurement_method": self._tracker.measurement_method,
            "demand_window": f"{self._tracker.window_start.strftime('%H:%M')}-{self._tracker.window_end.strftime('%H:%M')}",
            "demand_days": self._tracker.days,
            "season_months": self._tracker.season_months,
            "billing_day": self._tracker.billing_day,
            "last_reset": self._tracker.last_reset.isoformat() if self._tracker.last_reset else None,
            "previous_month_peak": self._tracker.previous_month_peak_kw,
            "current_block_samples": len(self._tracker.current_block_samples),
            "power_entity": self._tracker.power_entity_id,
        }

    @property
    def extra_restore_state_data(self):
        """Return state to persist."""
        from homeassistant.helpers.restore_state import ExtraStoredData

        class DemandStoredData(ExtraStoredData):
            def __init__(self, data):
                self._data = data

            def as_dict(self):
                return self._data

            @classmethod
            def from_dict(cls, data):
                return cls(data)

        return DemandStoredData(self._tracker.save_state())


class OecMonthlyDemandChargeSensor(OecDemandBaseSensor):
    """Monthly demand charge in dollars."""

    def __init__(
        self, coordinator: OecTariffCoordinator, entry: ConfigEntry, tracker: DemandTracker
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, tracker, "monthly_demand_charge")
        self._attr_name = "Monthly Demand Charge"
        self._attr_native_unit_of_measurement = "$"
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_suggested_display_precision = 2
        self._attr_icon = "mdi:currency-usd"

    @property
    def native_value(self) -> float | None:
        """Return monthly demand charge."""
        if self.coordinator.data and self.coordinator.data.get("detail"):
            demand = self.coordinator.data["detail"].get("demand")
            if demand:
                return round(self._tracker.chargeable_demand * demand["rate"], 2)
        return None


class OecDemandSurchargePerKwhSensor(OecDemandBaseSensor):
    """Demand surcharge amortized per kWh."""

    def __init__(
        self, coordinator: OecTariffCoordinator, entry: ConfigEntry, tracker: DemandTracker
    ) -> None:
        """Initialize."""
        super().__init__(coordinator, entry, tracker, "demand_surcharge_per_kwh")
        self._attr_name = "Demand Surcharge"
        self._attr_native_unit_of_measurement = "$/kWh"
        self._attr_device_class = SensorDeviceClass.MONETARY
        self._attr_state_class = SensorStateClass.MEASUREMENT
        self._attr_suggested_display_precision = 3
        self._attr_icon = "mdi:lightning-bolt"

    @property
    def native_value(self) -> float | None:
        """Return demand surcharge per kWh (from API calculation)."""
        if not self.coordinator.data:
            return None

        detail = self.coordinator.data.get("detail")
        if not detail or not detail.get("demand"):
            return None

        demand = detail["demand"]
        peak_kw = self._tracker.chargeable_demand
        if peak_kw <= 0:
            return 0.0

        # Calculate window hours per month
        start = self._tracker.window_start
        end = self._tracker.window_end
        if start == end:
            # "Applies at all other times" convention (e.g. Jemena/AusNet
            # all-day demand windows) — the full day.
            hours_per_day = 24.0
        elif start <= end:
            hours_per_day = (end.hour + end.minute / 60) - (start.hour + start.minute / 60)
        else:
            hours_per_day = (24 - start.hour - start.minute / 60) + (end.hour + end.minute / 60)

        window_hours_per_month = hours_per_day * 30
        monthly_charge = peak_kw * demand["rate"]
        return round(monthly_charge / window_hours_per_month, 5)
