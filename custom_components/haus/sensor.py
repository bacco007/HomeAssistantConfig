"""Sensor entities for HAUS."""

from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorStateClass,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import (
    COMMUNITY_AS_OF,
    COMMUNITY_AVG_AUTOMATIONS,
    COMMUNITY_AVG_USERS,
    COMMUNITY_REPORTING_INSTALLS,
    COMMUNITY_SOURCE_URL,
    SCORE_HISTORY_WEEKS,
)
from .coordinator import HausConfigEntry, HausCoordinator
from .entity import HausEntity
from .scoring import pillar_values

# Every sensor here reads a value the coordinator has already fetched; there is
# no device to overwhelm and nothing to serialise, so no limit is needed. The
# quality scale asks for this to be stated rather than left to the default.
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: HausConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the HAUS sensors."""
    coordinator = entry.runtime_data
    async_add_entities(
        [
            HausScoreSensor(coordinator, entry),
            HausPillarSensor(coordinator, entry, pillar="usage"),
            HausPillarSensor(coordinator, entry, pillar="diversity"),
            HausPillarSensor(coordinator, entry, pillar="users"),
        ]
    )


class HausScoreSensor(HausEntity, SensorEntity):
    """The headline HAUS score, 0-100.

    Three quality-scale rules are deliberately not satisfied here, because
    satisfying them would be wrong rather than better.

    No `device_class`: none of Home Assistant's 62 exists for a composite
    score. The nearest by name are `power_factor`, `duration` and
    `blood_glucose_concentration`, and claiming any of them would make the
    sensor lie about what it measures for the sake of a filled-in field.

    No `entity_category`: that marks an entity as configuration or as a
    diagnostic *of a device* - signal strength, uptime, firmware. This is the
    measurement the integration exists to publish, which is the opposite.

    Not `disabled_by_default`: it is the primary entity.
    """

    _attr_translation_key = "score"
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, coordinator: HausCoordinator, entry: HausConfigEntry) -> None:
        """Initialise the score sensor."""
        super().__init__(coordinator, entry)
        self._attr_unique_id = f"{entry.entry_id}_score"

    @property
    def native_value(self) -> int:
        """Return the current score."""
        return self.coordinator.data.score

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the breakdown behind the score."""
        result = self.coordinator.data
        return {
            "tier": result.tier,
            "haghs_available": result.haghs_available,
            "pillars": {
                "hygiene": result.pillars.hygiene,
                "usage": result.pillars.usage,
                "diversity": result.pillars.diversity,
                "users": result.pillars.users,
            },
            "effective_weights": result.effective_weights,
            "contributions": result.contributions,
            "score_history": self.coordinator.store.score_history(SCORE_HISTORY_WEEKS),
            # Published so the breakdown card can quote them rather than
            # hard-code them: these move when a release refreshes them.
            "community": {
                "automations": COMMUNITY_AVG_AUTOMATIONS,
                "users": COMMUNITY_AVG_USERS,
                "as_of": COMMUNITY_AS_OF,
                "reporting_installs": COMMUNITY_REPORTING_INSTALLS,
                "source": COMMUNITY_SOURCE_URL,
            },
        }


class HausPillarSensor(HausEntity, SensorEntity):
    """One owned pillar, published so it can be graphed in its own right.

    The same three rules, and the entity_category one is the arguable case:
    these are secondary to the score, so `DIAGNOSTIC` is tempting. It is still
    wrong. A diagnostic entity reports on the health of the thing producing the
    data; a pillar *is* the data, one of four components of the headline
    number, and the docstring above says why it is published separately at all.
    Marking them diagnostic would file the breakdown away from the measurement
    it breaks down.

    Nor are they disabled by default. The rule targets noisy or non-essential
    entities, and these are neither: the breakdown and spread cards read them,
    so shipping them disabled would leave a fresh install with cards that
    render nothing until the user goes hunting in the entity registry.
    """

    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1

    def __init__(
        self,
        coordinator: HausCoordinator,
        entry: HausConfigEntry,
        *,
        pillar: str,
    ) -> None:
        """Initialise a pillar sensor."""
        super().__init__(coordinator, entry)
        self._pillar = pillar
        self._attr_translation_key = pillar
        self._attr_unique_id = f"{entry.entry_id}_{pillar}"

    @property
    def native_value(self) -> float | None:
        """Return this pillar's score."""
        return pillar_values(self.coordinator.data.pillars).get(self._pillar)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the metrics and facts that make up this pillar."""
        result = self.coordinator.data
        attributes: dict[str, Any] = dict(result.details.get(self._pillar, {}))
        metrics = result.metrics.get(self._pillar)
        if metrics:
            attributes["metrics"] = metrics
        return attributes
