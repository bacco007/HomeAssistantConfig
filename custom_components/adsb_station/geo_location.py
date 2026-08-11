"""Geolocation platform for the ADS-B Station integration.

An aircraft overhead is not a state that changes, it is a thing that comes
past, and `geo_location` is the platform Home Assistant has for exactly that:
the same one the earthquake and wildfire integrations use. One entity appears
when an aircraft comes inside the nearby radius and disappears when it leaves.

Nothing new is read to do it. The positions are already in every poll, next to
the distance the proximity sensors are built on.

**These entities have no unique ID, on purpose.** With one, every aircraft
that ever passed would leave an entry in the entity registry, come back as
`unavailable` after a restart, and fill every entity picker for good. Without
one they live only in the state machine, from arrival to departure, and there
is nothing left to clean up. The cost is real and worth knowing: they cannot
be renamed, hidden or assigned to an area from the interface, and they are not
listed under the station's device. A map layer is what they are for.
"""

from __future__ import annotations

from homeassistant.components.geo_location import GeolocationEvent
from homeassistant.const import MATCH_ALL, UnitOfLength
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import CONF_MAP_AIRCRAFT, DEFAULT_MAP_AIRCRAFT, DOMAIN
from .coordinator import (
    AdsbStationConfigEntry,
    AdsbStationDataUpdateCoordinator,
    AircraftSummary,
    aircraft_attributes,
)

# Updates are centralized through the coordinator
PARALLEL_UPDATES = 0


async def async_setup_entry(
    hass: HomeAssistant,
    entry: AdsbStationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the aircraft on the map, if this station was asked for them."""
    if not entry.options.get(CONF_MAP_AIRCRAFT, DEFAULT_MAP_AIRCRAFT):
        # Turning the option on reloads the entry, so this runs again.
        return

    coordinator = entry.runtime_data
    shown: dict[str, AdsbStationAircraftLocation] = {}

    @callback
    def _follow() -> None:
        """Put every aircraft in range on the map, and take the rest off."""
        aircraft = coordinator.data.aircraft
        nearby = () if aircraft is None else aircraft.nearby

        arrived: list[AdsbStationAircraftLocation] = []
        in_range: set[str] = set()
        for summary in nearby:
            # Everything in range has a position that was believed, because
            # the coordinator drops an aircraft it cannot place before it ever
            # reaches this list. Narrowing it here is for the type checker,
            # which cannot know that.
            if (position := summary.position) is None:
                continue
            in_range.add(summary.hex)
            if (entity := shown.get(summary.hex)) is None:
                entity = AdsbStationAircraftLocation(coordinator, summary, position)
                shown[summary.hex] = entity
                arrived.append(entity)
            else:
                entity.follow(summary, position)

        if arrived:
            async_add_entities(arrived)

        for hex_code in shown.keys() - in_range:
            shown.pop(hex_code).leave()

    _follow()
    entry.async_on_unload(coordinator.async_add_listener(_follow))


class AdsbStationAircraftLocation(GeolocationEvent):
    """One aircraft on the map, for as long as it is in range."""

    _attr_should_poll = False
    _attr_source = DOMAIN
    _attr_unit_of_measurement = UnitOfLength.KILOMETERS
    # The map reads these off the live state; writing a row per aircraft per
    # poll would fill the database with a track nobody asked to keep. What is
    # worth keeping is the passage board, which is built for it.
    _attr_unrecorded_attributes = frozenset({MATCH_ALL})

    def __init__(
        self,
        coordinator: AdsbStationDataUpdateCoordinator,
        summary: AircraftSummary,
        position: tuple[float, float],
    ) -> None:
        """Initialize the aircraft at the position it arrived on."""
        # Fixed at arrival and never changed afterwards. A callsign often
        # turns up a few polls after the aircraft does, and renaming then
        # would move the entity ID out from under a dashboard halfway
        # through a passage.
        self._attr_name = summary.flight or summary.hex
        self._apply(summary, position)

    def _apply(self, summary: AircraftSummary, position: tuple[float, float]) -> None:
        """Take over the position and distance of one poll."""
        self._summary = summary
        self._attr_latitude, self._attr_longitude = position
        self._attr_distance = (
            None if summary.distance is None else summary.distance / 1000
        )

    @callback
    def follow(self, summary: AircraftSummary, position: tuple[float, float]) -> None:
        """Move the aircraft to where the latest poll saw it."""
        self._apply(summary, position)
        self.async_write_ha_state()

    @callback
    def leave(self) -> None:
        """Take the aircraft off the map now that it has flown on.

        Forced, because an entity with no unique ID has no registry entry to
        fall back on, and what would otherwise stay behind is an `unavailable`
        aircraft that is never coming back. An aircraft that arrived and left
        before it was ever added has nothing to remove.
        """
        if self.hass is not None:
            self.hass.async_create_task(self.async_remove(force_remove=True))

    @property
    def extra_state_attributes(self) -> dict[str, str | float | None]:
        """Return everything else known about this aircraft.

        The same set the proximity sensors carry, minus the distance, which is
        the state of this entity.
        """
        return aircraft_attributes(self._summary)
