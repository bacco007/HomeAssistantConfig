"""DataUpdateCoordinator for ABC Emergency.

This module provides the coordinator that manages polling the ABC Emergency API
and distributing data to all entities. It handles distance calculations, data
transformation, and aggregation of emergency incident information.

The coordinator supports three instance types:
- State: Monitors all incidents in a selected state
- Zone: Monitors incidents near a fixed location
- Person: Monitors incidents near a person's dynamic location
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Literal, TypedDict, cast

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from .api import ABCEmergencyClient
from .const import (
    CONF_RADIUS_BUSHFIRE,
    CONF_RADIUS_EARTHQUAKE,
    CONF_RADIUS_FIRE,
    CONF_RADIUS_FLOOD,
    CONF_RADIUS_HEAT,
    CONF_RADIUS_OTHER,
    CONF_RADIUS_STORM,
    DEFAULT_RADIUS_BUSHFIRE,
    DEFAULT_RADIUS_EARTHQUAKE,
    DEFAULT_RADIUS_FIRE,
    DEFAULT_RADIUS_FLOOD,
    DEFAULT_RADIUS_HEAT,
    DEFAULT_RADIUS_OTHER,
    DEFAULT_RADIUS_STORM,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    INCIDENT_TYPE_TO_RADIUS_CATEGORY,
    INSTANCE_TYPE_PERSON,
    INSTANCE_TYPE_STATE,
    INSTANCE_TYPE_ZONE,
    AlertLevel,
    ContainmentState,
    Emergency,
    Feature,
    Geometry,
    GeometryCollectionGeometry,
    PolygonGeometry,
    StoredPolygon,
    TopLevelMultiPolygonGeometry,
    TopLevelPointGeometry,
    TopLevelPolygonGeometry,
)
from .exceptions import ABCEmergencyAPIError, ABCEmergencyConnectionError
from .helpers import (
    bearing_to_direction,
    calculate_distance,
    get_bearing,
    get_state_from_coordinates,
)
from .helpers_geo import point_in_incident
from .models import Coordinate, CoordinatorData, EmergencyIncident

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

# Priority order for alert levels (highest to lowest)
ALERT_LEVEL_PRIORITY: dict[str, int] = {
    AlertLevel.EMERGENCY: 4,
    AlertLevel.WATCH_AND_ACT: 3,
    AlertLevel.ADVICE: 2,
    AlertLevel.INFORMATION: 1,
    "": 0,
}

# Storage configuration for incident ID persistence
STORAGE_VERSION = 2  # v2: dict with timestamps instead of list
STORAGE_KEY_PREFIX = f"{DOMAIN}_seen_incidents"

# Seen incident retention (days) - incidents older than this are cleaned up
SEEN_INCIDENT_RETENTION_DAYS = 30


class _ContainmentSummary(TypedDict):
    """TypedDict for containment summary data."""

    containing_incidents: list[EmergencyIncident]
    inside_polygon: bool
    inside_emergency_warning: bool
    inside_watch_and_act: bool
    inside_advice: bool
    highest_containing_alert_level: str


class ABCEmergencyCoordinator(DataUpdateCoordinator[CoordinatorData]):
    """Coordinator for ABC Emergency data.

    This coordinator polls the ABC Emergency API at regular intervals and
    processes the data for consumption by entities. It supports three modes:
    - State mode: Fetches all incidents for a state
    - Zone mode: Fetches incidents and filters by distance from a fixed location
    - Person mode: Fetches incidents and filters by distance from a person's location
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: ABCEmergencyClient,
        entry: ConfigEntry,
        *,
        instance_type: Literal["state", "zone", "person"],
        state: str | None = None,
        latitude: float | None = None,
        longitude: float | None = None,
        person_entity_id: str | None = None,
    ) -> None:
        """Initialize the coordinator.

        Args:
            hass: Home Assistant instance.
            client: ABC Emergency API client.
            entry: Config entry for this coordinator.
            instance_type: Type of instance (state, zone, person).
            state: Australian state/territory code (for state mode).
            latitude: Latitude of the monitored location (for zone mode).
            longitude: Longitude of the monitored location (for zone mode).
            person_entity_id: Person entity ID (for person mode).
        """
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

        self._client = client
        self._entry = entry
        self._instance_type = instance_type
        self._state = state
        self._latitude = latitude
        self._longitude = longitude
        self._person_entity_id = person_entity_id

        # Radii configuration (for zone/person modes)
        self._radii: dict[str, int] = self._load_radii()

        # Incident tracking for event firing
        # Maps incident ID to ISO timestamp of when it was last seen
        self._seen_incidents: dict[str, str] = {}
        self._first_refresh: bool = True

        # Containment tracking for enter/exit events
        # Maps incident ID to its previous containment state (was_containing, alert_level)
        # This tracks actual containment state, not just ID presence, to detect:
        # - Polygon expansion (incident exists but wasn't containing -> now containing)
        # - Polygon contraction (incident was containing -> still exists but not containing)
        # - Severity changes (alert level changed while containing)
        self._previous_containment_state: dict[str, ContainmentState] = {}
        # Cache of incident objects from previous cycle for exit event data
        self._previously_containing_incidents: dict[str, EmergencyIncident] = {}
        self._first_containment_check: bool = True

        # Storage for persisting seen incident IDs with timestamps
        self._store: Store[dict[str, dict[str, str] | list[str]]] = Store(
            hass,
            STORAGE_VERSION,
            f"{STORAGE_KEY_PREFIX}_{entry.entry_id}",
        )

    @property
    def instance_type(self) -> Literal["state", "zone", "person"]:
        """Return the instance type.

        Returns:
            The instance type (state, zone, or person).
        """
        return self._instance_type

    def _load_radii(self) -> dict[str, int]:
        """Load radius configuration from entry data/options."""

        def get_radius(key: str, default: int) -> int:
            value = self._entry.options.get(key, self._entry.data.get(key, default))
            return int(value) if value is not None else default

        return {
            "bushfire": get_radius(CONF_RADIUS_BUSHFIRE, DEFAULT_RADIUS_BUSHFIRE),
            "earthquake": get_radius(CONF_RADIUS_EARTHQUAKE, DEFAULT_RADIUS_EARTHQUAKE),
            "storm": get_radius(CONF_RADIUS_STORM, DEFAULT_RADIUS_STORM),
            "flood": get_radius(CONF_RADIUS_FLOOD, DEFAULT_RADIUS_FLOOD),
            "fire": get_radius(CONF_RADIUS_FIRE, DEFAULT_RADIUS_FIRE),
            "heat": get_radius(CONF_RADIUS_HEAT, DEFAULT_RADIUS_HEAT),
            "other": get_radius(CONF_RADIUS_OTHER, DEFAULT_RADIUS_OTHER),
        }

    def _get_radius_for_incident(self, event_type: str) -> int:
        """Get the configured radius for an incident type."""
        category = INCIDENT_TYPE_TO_RADIUS_CATEGORY.get(event_type, "other")
        return self._radii.get(category, self._radii["other"])

    def _filter_emergencies_by_state(
        self,
        emergencies: list[Emergency],
        features: list[Feature],
        target_state: str,
    ) -> list[Emergency]:
        """Filter emergencies to only include those from the target state.

        The ABC Emergency API returns incidents from neighboring states when
        querying for a specific state. This method filters them out using the
        state field from the features array, which has a 1:1 mapping with
        emergencies via the id field.

        Args:
            emergencies: List of emergency objects from the API.
            features: List of feature objects from the API (contain state info).
            target_state: The state code to filter for (e.g., 'nsw', 'vic').

        Returns:
            List of emergencies that belong to the target state.
        """
        # Build mapping from feature ID to state
        feature_state_map: dict[str, str] = {}
        for feature in features:
            feature_id = feature.get("id", "")
            properties = feature.get("properties", {})
            state = properties.get("state", "")
            if feature_id and state:
                feature_state_map[feature_id] = state.lower()

        # If no feature-to-state mapping is available, return all emergencies
        # This handles edge cases where the API response doesn't include features
        if not feature_state_map:
            _LOGGER.debug(
                "No feature state mapping available, returning all %d emergencies",
                len(emergencies),
            )
            return emergencies

        # Filter emergencies to only include those from the target state
        target_state_lower = target_state.lower()
        filtered: list[Emergency] = []
        excluded_count = 0

        for emergency in emergencies:
            emergency_id = emergency.get("id", "")
            emergency_state = feature_state_map.get(emergency_id, "")

            if emergency_state == target_state_lower:
                filtered.append(emergency)
            else:
                excluded_count += 1

        if excluded_count > 0:
            _LOGGER.debug(
                "Filtered out %d incidents from other states (keeping %d for %s)",
                excluded_count,
                len(filtered),
                target_state,
            )

        return filtered

    @property
    def _seen_incident_ids(self) -> set[str]:
        """Return the set of seen incident IDs for backwards compatibility."""
        return set(self._seen_incidents.keys())

    async def async_load_seen_incidents(self) -> None:
        """Load previously seen incident IDs from storage.

        This allows the coordinator to resume tracking after a Home Assistant
        restart without re-announcing previously seen incidents.

        Handles migration from v1 (list of IDs) to v2 (dict with timestamps).
        """
        data = await self._store.async_load()
        if data is None:
            return

        # Handle v2 format: dict with timestamps
        if "seen_incidents" in data and isinstance(data["seen_incidents"], dict):
            self._seen_incidents = dict(data["seen_incidents"])
            self._cleanup_old_incidents()
            self._first_refresh = False
            _LOGGER.debug(
                "Loaded %d previously seen incident IDs from storage (v2 format)",
                len(self._seen_incidents),
            )
            return

        # Handle v1 format: list of IDs - migrate to v2
        if "seen_ids" in data and isinstance(data["seen_ids"], list):
            now = datetime.now(UTC).isoformat()
            self._seen_incidents = dict.fromkeys(data["seen_ids"], now)
            self._first_refresh = False
            _LOGGER.debug(
                "Loaded %d previously seen incident IDs from storage (migrated from v1)",
                len(self._seen_incidents),
            )
            # Save in v2 format to complete migration
            await self._save_seen_incidents()

    def _cleanup_old_incidents(self) -> None:
        """Remove incidents not seen in the retention period.

        Cleans up the _seen_incidents dict by removing entries with
        timestamps older than SEEN_INCIDENT_RETENTION_DAYS.
        """
        cutoff = datetime.now(UTC) - timedelta(days=SEEN_INCIDENT_RETENTION_DAYS)
        to_remove: list[str] = []

        for incident_id, timestamp_str in self._seen_incidents.items():
            try:
                timestamp = datetime.fromisoformat(timestamp_str)
                # Ensure timezone-aware comparison
                if timestamp.tzinfo is None:
                    timestamp = timestamp.replace(tzinfo=UTC)
                if timestamp < cutoff:
                    to_remove.append(incident_id)
            except (ValueError, TypeError):
                # Invalid timestamp - remove it
                to_remove.append(incident_id)
                _LOGGER.debug(
                    "Removing incident %s with invalid timestamp: %s",
                    incident_id,
                    timestamp_str,
                )

        for incident_id in to_remove:
            del self._seen_incidents[incident_id]

        if to_remove:
            _LOGGER.debug("Cleaned up %d old incident IDs", len(to_remove))

    async def _save_seen_incidents(self) -> None:
        """Save seen incident IDs to storage in v2 format."""
        await self._store.async_save({"seen_incidents": self._seen_incidents})

    async def async_remove_storage(self) -> None:
        """Remove storage file when config entry is removed."""
        await self._store.async_remove()

    async def _async_update_data(self) -> CoordinatorData:
        """Fetch and process emergency data.

        Returns:
            Processed coordinator data with all emergency information.

        Raises:
            UpdateFailed: If fetching or processing data fails.
        """
        if self._instance_type == INSTANCE_TYPE_STATE:
            data = await self._update_state_mode()
        elif self._instance_type == INSTANCE_TYPE_ZONE:
            data = await self._update_zone_mode()
        elif self._instance_type == INSTANCE_TYPE_PERSON:
            data = await self._update_person_mode()
        else:
            raise UpdateFailed(f"Unknown instance type: {self._instance_type}")

        # Detect new incidents and fire events
        await self._handle_new_incident_detection(data)

        # Fire containment events for zone/person modes
        self._fire_containment_events(data)

        return data

    async def _handle_new_incident_detection(self, data: CoordinatorData) -> None:
        """Detect new incidents and fire events for them.

        Args:
            data: The processed coordinator data.
        """
        # Get current incident IDs
        current_ids = {incident.id for incident in data.incidents}

        # Detect new incidents (skip first refresh to avoid spam on startup)
        if not self._first_refresh:
            new_ids = current_ids - self._seen_incident_ids
            if new_ids:
                new_incidents = [i for i in data.incidents if i.id in new_ids]
                await self._fire_new_incident_events(new_incidents)

        # Update tracking state with current timestamps
        # This refreshes timestamps for existing incidents and adds new ones
        now = datetime.now(UTC).isoformat()
        self._seen_incidents = dict.fromkeys(current_ids, now)
        self._first_refresh = False

        # Persist to storage
        await self._save_seen_incidents()

    async def _update_state_mode(self) -> CoordinatorData:
        """Fetch data for state mode (all incidents in a state)."""
        if not self._state:
            raise UpdateFailed("No state configured")

        try:
            _LOGGER.debug("Fetching emergency data for state: %s", self._state)
            response = await self._client.async_get_emergencies_by_state(self._state)
        except ABCEmergencyConnectionError as err:
            raise UpdateFailed(f"Connection error: {err}") from err
        except ABCEmergencyAPIError as err:
            raise UpdateFailed(f"API error: {err}") from err

        # Filter emergencies to only include those from the configured state
        # The ABC API returns incidents from neighboring states (Issue #117)
        filtered_emergencies = self._filter_emergencies_by_state(
            response["emergencies"],
            response["features"],
            self._state,
        )

        return self._process_state_emergencies(filtered_emergencies)

    async def _update_zone_mode(self) -> CoordinatorData:
        """Fetch data for zone mode (incidents near a fixed location)."""
        if self._latitude is None or self._longitude is None:
            raise UpdateFailed("No location configured")

        # Determine which state to query based on coordinates
        state = get_state_from_coordinates(self._latitude, self._longitude)
        if not state:
            raise UpdateFailed("Could not determine state from coordinates")

        try:
            _LOGGER.debug(
                "Fetching emergency data for zone at %s, %s", self._latitude, self._longitude
            )
            response = await self._client.async_get_emergencies_by_state(state)
        except ABCEmergencyConnectionError as err:
            raise UpdateFailed(f"Connection error: {err}") from err
        except ABCEmergencyAPIError as err:
            raise UpdateFailed(f"API error: {err}") from err

        # Filter emergencies to only include those from the determined state
        # The ABC API returns incidents from neighboring states (Issue #117)
        filtered_emergencies = self._filter_emergencies_by_state(
            response["emergencies"],
            response["features"],
            state,
        )

        return self._process_location_emergencies(
            filtered_emergencies,
            self._latitude,
            self._longitude,
            INSTANCE_TYPE_ZONE,
        )

    async def _update_person_mode(self) -> CoordinatorData:
        """Fetch data for person mode (incidents near a person's location)."""
        if not self._person_entity_id:
            raise UpdateFailed("No person entity configured")

        # Get person's current location
        person_state = self.hass.states.get(self._person_entity_id)
        if person_state is None:
            raise UpdateFailed(f"Person entity {self._person_entity_id} not found")

        latitude = person_state.attributes.get("latitude")
        longitude = person_state.attributes.get("longitude")

        if latitude is None or longitude is None:
            # Person location is unknown - return empty data
            _LOGGER.debug("Person %s has no location data", self._person_entity_id)
            return CoordinatorData(
                incidents=[],
                total_count=0,
                nearby_count=0,
                instance_type=INSTANCE_TYPE_PERSON,
                location_available=False,
            )

        # Determine which state to query based on coordinates
        state = get_state_from_coordinates(latitude, longitude)
        if not state:
            # Person might be outside Australia
            _LOGGER.debug("Person %s is outside tracked area", self._person_entity_id)
            return CoordinatorData(
                incidents=[],
                total_count=0,
                nearby_count=0,
                instance_type=INSTANCE_TYPE_PERSON,
                location_available=True,
                current_latitude=latitude,
                current_longitude=longitude,
            )

        try:
            _LOGGER.debug("Fetching emergency data for person at %s, %s", latitude, longitude)
            response = await self._client.async_get_emergencies_by_state(state)
        except ABCEmergencyConnectionError as err:
            raise UpdateFailed(f"Connection error: {err}") from err
        except ABCEmergencyAPIError as err:
            raise UpdateFailed(f"API error: {err}") from err

        # Filter emergencies to only include those from the determined state
        # The ABC API returns incidents from neighboring states (Issue #117)
        filtered_emergencies = self._filter_emergencies_by_state(
            response["emergencies"],
            response["features"],
            state,
        )

        return self._process_location_emergencies(
            filtered_emergencies,
            latitude,
            longitude,
            INSTANCE_TYPE_PERSON,
        )

    def _process_state_emergencies(
        self,
        emergencies: list[Emergency],
    ) -> CoordinatorData:
        """Process emergencies for state mode (no distance filtering).

        Args:
            emergencies: List of emergency objects from the API.

        Returns:
            Processed coordinator data.
        """
        incidents: list[EmergencyIncident] = []

        for emergency in emergencies:
            incident = self._create_incident(emergency, latitude=None, longitude=None)
            if incident:
                incidents.append(incident)

        # Determine highest alert level in state
        highest_alert_level = self._get_highest_alert_level(incidents)

        # Count incidents by type
        incidents_by_type: dict[str, int] = {}
        for incident in incidents:
            event_type = incident.event_type
            incidents_by_type[event_type] = incidents_by_type.get(event_type, 0) + 1

        return CoordinatorData(
            incidents=incidents,
            total_count=len(incidents),
            nearby_count=None,  # Not applicable for state mode
            nearest_distance_km=None,  # Not applicable for state mode
            nearest_incident=None,  # Not applicable for state mode
            highest_alert_level=highest_alert_level,
            incidents_by_type=incidents_by_type,
            instance_type=INSTANCE_TYPE_STATE,
            location_available=True,
        )

    def _process_location_emergencies(
        self,
        emergencies: list[Emergency],
        latitude: float,
        longitude: float,
        instance_type: Literal["zone", "person"],
    ) -> CoordinatorData:
        """Process emergencies for zone/person mode (with distance filtering).

        CRITICAL: Containment is checked for ALL incidents BEFORE radius filtering.
        This ensures that large polygons whose centroid is far away but which still
        contain the monitored point are properly detected.

        Args:
            emergencies: List of emergency objects from the API.
            latitude: Reference latitude.
            longitude: Reference longitude.
            instance_type: Type of instance (zone or person).

        Returns:
            Processed coordinator data.
        """
        all_incidents: list[EmergencyIncident] = []

        for emergency in emergencies:
            incident = self._create_incident(emergency, latitude=latitude, longitude=longitude)
            if incident:
                all_incidents.append(incident)

        # CRITICAL: Check containment for ALL incidents BEFORE radius filtering
        # This is required because a polygon's centroid may be far away but the
        # polygon itself may still contain the monitored point (issue #73)
        containing_incidents: list[EmergencyIncident] = []
        for incident in all_incidents:
            if incident.has_polygon:
                # Use cached prepared geometries for efficient containment check
                contains = point_in_incident(latitude, longitude, incident)
                # Use object.__setattr__ to modify frozen-like dataclass field
                object.__setattr__(incident, "contains_point", contains)
                if contains:
                    containing_incidents.append(incident)
            else:
                # Point geometry cannot contain the monitored point
                object.__setattr__(incident, "contains_point", False)

        # Calculate containment summary fields
        containment_data = self._calculate_containment_summary(containing_incidents)

        # Sort by distance (nearest first)
        all_incidents.sort(
            key=lambda i: i.distance_km if i.distance_km is not None else float("inf")
        )

        # Calculate nearby incidents based on per-type radii
        nearby_incidents = [
            i
            for i in all_incidents
            if i.distance_km is not None
            and i.distance_km <= self._get_radius_for_incident(i.event_type)
        ]

        # Find nearest incident
        nearest_incident: EmergencyIncident | None = None
        nearest_distance: float | None = None
        if all_incidents:
            nearest_incident = all_incidents[0]
            nearest_distance = nearest_incident.distance_km

        # Determine highest alert level in nearby area
        highest_alert_level = self._get_highest_alert_level(nearby_incidents)

        # Count incidents by type (for nearby incidents)
        incidents_by_type: dict[str, int] = {}
        for incident in nearby_incidents:
            event_type = incident.event_type
            incidents_by_type[event_type] = incidents_by_type.get(event_type, 0) + 1

        return CoordinatorData(
            incidents=nearby_incidents,  # Only include incidents within configured radii
            total_count=len(all_incidents),  # Total in the state for reference
            nearby_count=len(nearby_incidents),
            nearest_distance_km=nearest_distance,
            nearest_incident=nearest_incident,
            highest_alert_level=highest_alert_level,
            incidents_by_type=incidents_by_type,
            instance_type=instance_type,
            location_available=True,
            current_latitude=latitude,
            current_longitude=longitude,
            containing_incidents=containment_data["containing_incidents"],
            inside_polygon=containment_data["inside_polygon"],
            inside_emergency_warning=containment_data["inside_emergency_warning"],
            inside_watch_and_act=containment_data["inside_watch_and_act"],
            inside_advice=containment_data["inside_advice"],
            highest_containing_alert_level=containment_data["highest_containing_alert_level"],
        )

    def _calculate_containment_summary(
        self,
        containing_incidents: list[EmergencyIncident],
    ) -> _ContainmentSummary:
        """Calculate containment summary fields from containing incidents.

        Args:
            containing_incidents: List of incidents whose polygons contain the point.

        Returns:
            Dictionary with containment summary fields.
        """
        inside_polygon = len(containing_incidents) > 0

        # Check alert levels in containing incidents
        inside_emergency_warning = False
        inside_watch_and_act = False
        inside_advice = False

        for incident in containing_incidents:
            level = incident.alert_level
            if level == AlertLevel.EMERGENCY:
                inside_emergency_warning = True
                inside_watch_and_act = True  # Emergency implies Watch and Act
                inside_advice = True  # Emergency implies Advice
            elif level == AlertLevel.WATCH_AND_ACT:
                inside_watch_and_act = True
                inside_advice = True  # Watch and Act implies Advice
            elif level == AlertLevel.ADVICE:
                inside_advice = True

        # Calculate highest containing alert level
        highest_containing_alert_level = self._get_highest_alert_level(containing_incidents)

        return _ContainmentSummary(
            containing_incidents=containing_incidents,
            inside_polygon=inside_polygon,
            inside_emergency_warning=inside_emergency_warning,
            inside_watch_and_act=inside_watch_and_act,
            inside_advice=inside_advice,
            highest_containing_alert_level=highest_containing_alert_level,
        )

    def _create_incident(
        self,
        emergency: Emergency,
        *,
        latitude: float | None,
        longitude: float | None,
    ) -> EmergencyIncident | None:
        """Create an EmergencyIncident from raw API data.

        Args:
            emergency: Emergency object from the API.
            latitude: Reference latitude for distance calculation (None for state mode).
            longitude: Reference longitude for distance calculation (None for state mode).

        Returns:
            Processed EmergencyIncident or None if coordinates can't be extracted.
        """
        # Extract coordinates and geometry from raw geometry
        location, geometry_type, polygons = self._extract_location_and_geometry(
            emergency["geometry"]
        )
        if location is None:
            _LOGGER.warning(
                "Could not extract location for emergency: %s",
                emergency["id"],
            )
            return None

        # Calculate distance and bearing if reference location provided
        distance: float | None = None
        bearing: float | None = None
        direction: str | None = None

        if latitude is not None and longitude is not None:
            distance = calculate_distance(
                latitude,
                longitude,
                location.latitude,
                location.longitude,
            )
            bearing = get_bearing(
                latitude,
                longitude,
                location.latitude,
                location.longitude,
            )
            direction = bearing_to_direction(bearing)

        # Parse timestamp
        try:
            updated = datetime.fromisoformat(emergency["emergencyTimestampPrepared"]["updatedTime"])
        except (ValueError, KeyError):
            updated = datetime.now()

        # cardBody fields may be missing in some incidents
        card_body = emergency.get("cardBody", {})

        return EmergencyIncident(
            id=emergency["id"],
            headline=emergency["headline"],
            alert_level=emergency["alertLevelInfoPrepared"]["level"],
            alert_text=emergency["alertLevelInfoPrepared"]["text"],
            event_type=emergency["eventLabelPrepared"]["labelText"],
            event_icon=emergency["eventLabelPrepared"]["icon"],
            status=card_body.get("status"),
            size=card_body.get("size"),
            source=card_body.get("source", "Unknown"),
            location=location,
            updated=updated,
            distance_km=distance,
            bearing=bearing,
            direction=direction,
            geometry_type=geometry_type,
            polygons=polygons,
            has_polygon=polygons is not None and len(polygons) > 0,
        )

    def _extract_location_and_geometry(
        self, geometry: Geometry
    ) -> tuple[Coordinate | None, str | None, list[StoredPolygon] | None]:
        """Extract location coordinates AND polygon geometry from geometry.

        Handles various geometry types:
        - GeometryCollection: Uses first Point geometry for location, extracts polygon
        - Point: Uses coordinates directly, no polygon
        - Polygon/MultiPolygon: Calculates centroid, extracts polygon coordinates

        Args:
            geometry: Geometry object from the API.

        Returns:
            Tuple of (location, geometry_type, polygons).
        """
        geom_type = geometry["type"]
        location: Coordinate | None = None
        polygons: list[StoredPolygon] | None = None

        if geom_type == "GeometryCollection":
            collection = cast(GeometryCollectionGeometry, geometry)
            geometries = collection["geometries"]

            # First pass: find Point for location
            for geom in geometries:
                if geom["type"] == "Point":
                    coords = geom["coordinates"]
                    if len(coords) >= 2:
                        location = Coordinate(latitude=coords[1], longitude=coords[0])
                    break

            # Second pass: extract Polygon for containment
            for geom in geometries:
                if geom["type"] == "Polygon":
                    # mypy narrows type after the check above, no cast needed
                    polygons = [self._extract_stored_polygon(geom["coordinates"])]
                    # If no point found, use polygon centroid for location
                    if location is None:
                        location = self._calculate_polygon_centroid_from_polygon(geom)
                    break

        elif geom_type == "Point":
            point = cast(TopLevelPointGeometry, geometry)
            coords = point["coordinates"]
            if len(coords) >= 2:
                location = Coordinate(latitude=coords[1], longitude=coords[0])
            # No polygon for Point geometry

        elif geom_type == "Polygon":
            poly = cast(TopLevelPolygonGeometry, geometry)
            polygons = [self._extract_stored_polygon(poly["coordinates"])]
            location = self._calculate_polygon_centroid(poly)

        elif geom_type == "MultiPolygon":
            multi = cast(TopLevelMultiPolygonGeometry, geometry)
            polygons = [
                self._extract_stored_polygon(poly_coords) for poly_coords in multi["coordinates"]
            ]
            location = self._calculate_multipolygon_centroid(multi)

        return (location, geom_type, polygons)

    def _extract_stored_polygon(self, coordinates: list[list[list[float]]]) -> StoredPolygon:
        """Convert GeoJSON polygon coordinates to StoredPolygon.

        Args:
            coordinates: GeoJSON polygon coordinates [[outer_ring], [hole1], ...].

        Returns:
            StoredPolygon with outer_ring and optional inner_rings.
        """
        outer_ring = coordinates[0] if coordinates else []
        inner_rings = coordinates[1:] if len(coordinates) > 1 else None

        return StoredPolygon(
            outer_ring=outer_ring,
            inner_rings=inner_rings if inner_rings else None,
        )

    def _calculate_polygon_centroid(self, geometry: TopLevelPolygonGeometry) -> Coordinate | None:
        """Calculate the centroid of a top-level polygon."""
        coords = geometry["coordinates"]
        if not coords:
            return None

        all_points: list[tuple[float, float]] = []

        if len(coords) > 0:
            ring = coords[0]  # Outer ring
            for point in ring:
                if len(point) >= 2:
                    all_points.append((point[0], point[1]))

        if not all_points:
            return None

        avg_lon = sum(p[0] for p in all_points) / len(all_points)
        avg_lat = sum(p[1] for p in all_points) / len(all_points)

        return Coordinate(latitude=avg_lat, longitude=avg_lon)

    def _calculate_multipolygon_centroid(
        self, geometry: TopLevelMultiPolygonGeometry
    ) -> Coordinate | None:
        """Calculate the centroid of a multipolygon."""
        coords = geometry["coordinates"]
        if not coords:
            return None

        all_points: list[tuple[float, float]] = []

        for polygon in coords:
            if polygon and len(polygon) > 0:
                ring = polygon[0]  # Outer ring
                for point in ring:
                    if len(point) >= 2:
                        all_points.append((point[0], point[1]))

        if not all_points:
            return None

        avg_lon = sum(p[0] for p in all_points) / len(all_points)
        avg_lat = sum(p[1] for p in all_points) / len(all_points)

        return Coordinate(latitude=avg_lat, longitude=avg_lon)

    def _calculate_polygon_centroid_from_polygon(
        self, geometry: PolygonGeometry
    ) -> Coordinate | None:
        """Calculate the centroid of a nested polygon geometry."""
        coords = geometry["coordinates"]
        if not coords:
            return None

        all_points: list[tuple[float, float]] = []

        if len(coords) > 0:
            ring = coords[0]  # Outer ring
            for point in ring:
                if len(point) >= 2:
                    all_points.append((point[0], point[1]))

        if not all_points:
            return None

        avg_lon = sum(p[0] for p in all_points) / len(all_points)
        avg_lat = sum(p[1] for p in all_points) / len(all_points)

        return Coordinate(latitude=avg_lat, longitude=avg_lon)

    def _get_highest_alert_level(
        self,
        incidents: list[EmergencyIncident],
    ) -> str:
        """Get the highest alert level among incidents.

        Args:
            incidents: List of emergency incidents.

        Returns:
            The highest alert level string, or empty string if no incidents.
        """
        if not incidents:
            return ""

        highest_priority = 0
        highest_level = ""

        for incident in incidents:
            level = incident.alert_level
            priority = ALERT_LEVEL_PRIORITY.get(level, 0)
            if priority > highest_priority:
                highest_priority = priority
                highest_level = level

        return highest_level

    def _slugify_event_type(self, event_type: str) -> str:
        """Convert event type to slug format for event names.

        Args:
            event_type: Event type like "Bushfire", "Extreme Heat".

        Returns:
            Slugified string like "bushfire", "extreme_heat".
        """
        return event_type.lower().replace(" ", "_")

    async def _fire_new_incident_events(
        self,
        new_incidents: list[EmergencyIncident],
    ) -> None:
        """Fire events for new incidents.

        Fires both a generic abc_emergency_new_incident event and a
        type-specific event (e.g., abc_emergency_new_bushfire) for each
        new incident detected.

        Args:
            new_incidents: List of newly detected incidents.
        """
        for incident in new_incidents:
            event_data = {
                "config_entry_id": self._entry.entry_id,
                "instance_name": self._entry.title or "ABC Emergency",
                "instance_type": self._instance_type,
                "incident_id": incident.id,
                "headline": incident.headline,
                "event_type": incident.event_type,
                "event_icon": incident.event_icon,
                "alert_level": incident.alert_level,
                "alert_text": incident.alert_text,
                "distance_km": incident.distance_km,
                "direction": incident.direction,
                "bearing": incident.bearing,
                "latitude": incident.location.latitude,
                "longitude": incident.location.longitude,
                "status": incident.status,
                "size": incident.size,
                "source": incident.source,
                "updated": incident.updated.isoformat(),
            }

            # Fire generic event
            self.hass.bus.async_fire(
                "abc_emergency_new_incident",
                event_data,
            )

            # Fire type-specific event
            type_slug = self._slugify_event_type(incident.event_type)
            self.hass.bus.async_fire(
                f"abc_emergency_new_{type_slug}",
                event_data,
            )

            _LOGGER.info(
                "New %s incident detected: %s",
                incident.event_type,
                incident.headline,
            )

    def _fire_containment_events(self, data: CoordinatorData) -> None:
        """Fire events for containment state changes.

        Fires events when the monitored location enters, exits, or is inside
        an emergency polygon. Only fires for zone/person modes.

        This method tracks ACTUAL containment state, not just incident IDs.
        This enables detection of:
        - Polygon expansion: incident existed but wasn't containing, now is
        - Polygon contraction: incident was containing, still exists but isn't
        - Severity changes: alert level changed while still containing (Issue #92)

        Args:
            data: The processed coordinator data.
        """
        # Skip containment events for state mode (no monitored point)
        if self._instance_type == INSTANCE_TYPE_STATE:
            return

        # Build map of current incidents for lookup
        current_incident_map = {inc.id: inc for inc in data.incidents}

        # Build set of currently containing incident IDs
        current_containing_ids = {inc.id for inc in data.containing_incidents}

        # Handle first containment check - populate state without firing events
        if self._first_containment_check:
            self._previous_containment_state = {
                inc.id: ContainmentState(
                    was_containing=True,
                    alert_level=inc.alert_level,
                    alert_text=inc.alert_text,
                )
                for inc in data.containing_incidents
            }
            self._previously_containing_incidents = {
                inc.id: inc for inc in data.containing_incidents
            }
            self._first_containment_check = False
            return

        # Handle person mode with unknown location - clear state without firing events
        if self._instance_type == INSTANCE_TYPE_PERSON and not data.location_available:
            self._previous_containment_state = {}
            self._previously_containing_incidents = {}
            return

        # Get monitored coordinates
        monitored_lat = data.current_latitude
        monitored_lon = data.current_longitude

        # Detect ENTERED polygons:
        # - New incident that contains the point, OR
        # - Existing incident that wasn't containing but now is (polygon expanded)
        for incident_id in current_containing_ids:
            incident = current_incident_map.get(incident_id)
            if not incident:  # pragma: no cover - defensive guard for impossible state
                continue

            prev_state = self._previous_containment_state.get(incident_id)

            # Fire entered event if:
            # 1. Incident is new (no previous state), OR
            # 2. Incident existed but wasn't containing (polygon expanded to include point)
            if prev_state is None or not prev_state["was_containing"]:
                self._fire_entered_polygon_event(incident, data, monitored_lat, monitored_lon)

        # Detect EXITED polygons:
        # - Incident was containing and is now gone, OR
        # - Incident was containing and still exists but no longer contains (polygon shrank)
        for incident_id, prev_state in self._previous_containment_state.items():
            if not prev_state[
                "was_containing"
            ]:  # pragma: no cover - already skipped at state update
                continue

            # Check if still containing
            if incident_id in current_containing_ids:
                continue

            # Was containing, now not containing - fire exit event
            # Use current incident if still exists, otherwise cached incident
            incident = current_incident_map.get(
                incident_id
            ) or self._previously_containing_incidents.get(incident_id)
            if incident:
                self._fire_exited_polygon_event(incident, data, monitored_lat, monitored_lon)

        # Fire inside events for all currently containing incidents
        for incident in data.containing_incidents:
            self._fire_inside_polygon_event(incident, data, monitored_lat, monitored_lon)

        # Check for severity changes while inside polygon (Issue #92)
        # Fire severity_changed event when alert level changes for containing incidents
        for incident_id in current_containing_ids:
            incident = current_incident_map.get(incident_id)
            if not incident:  # pragma: no cover - defensive guard for impossible state
                continue

            prev_state = self._previous_containment_state.get(incident_id)
            if prev_state is None or not prev_state["was_containing"]:
                # New containment or wasn't containing - no severity comparison
                continue

            # Check if alert level changed
            if prev_state["alert_level"] != incident.alert_level:
                self._fire_severity_changed_event(
                    incident=incident,
                    previous_alert_level=prev_state["alert_level"],
                    previous_alert_text=prev_state["alert_text"],
                    data=data,
                    monitored_lat=monitored_lat,
                    monitored_lon=monitored_lon,
                )

        # Update tracking state for next cycle
        # Track state for ALL incidents we know about, marking whether they contain
        new_containment_state: dict[str, ContainmentState] = {}
        for incident in data.incidents:
            is_containing = incident.id in current_containing_ids
            new_containment_state[incident.id] = ContainmentState(
                was_containing=is_containing,
                alert_level=incident.alert_level,
                alert_text=incident.alert_text,
            )

        self._previous_containment_state = new_containment_state
        self._previously_containing_incidents = {inc.id: inc for inc in data.containing_incidents}

    def _build_containment_event_data(
        self,
        incident: EmergencyIncident,
        data: CoordinatorData,
        monitored_lat: float | None,
        monitored_lon: float | None,
    ) -> dict[str, str | float | None]:
        """Build event data for containment events.

        Args:
            incident: The incident that the point entered/exited/is inside.
            data: The coordinator data.
            monitored_lat: The monitored point latitude.
            monitored_lon: The monitored point longitude.

        Returns:
            Dictionary of event data.
        """
        return {
            "config_entry_id": self._entry.entry_id,
            "instance_name": self._entry.title or "ABC Emergency",
            "instance_type": self._instance_type,
            "incident_id": incident.id,
            "headline": incident.headline,
            "event_type": incident.event_type,
            "event_icon": incident.event_icon,
            "alert_level": incident.alert_level,
            "alert_text": incident.alert_text,
            "latitude": incident.location.latitude,
            "longitude": incident.location.longitude,
            "monitored_latitude": monitored_lat,
            "monitored_longitude": monitored_lon,
            "status": incident.status,
            "source": incident.source,
            "updated": incident.updated.isoformat() if incident.updated else None,
        }

    def _fire_entered_polygon_event(
        self,
        incident: EmergencyIncident,
        data: CoordinatorData,
        monitored_lat: float | None,
        monitored_lon: float | None,
    ) -> None:
        """Fire event when monitored point enters a polygon.

        Args:
            incident: The incident polygon that was entered.
            data: The coordinator data.
            monitored_lat: The monitored point latitude.
            monitored_lon: The monitored point longitude.
        """
        event_data = self._build_containment_event_data(
            incident, data, monitored_lat, monitored_lon
        )
        self.hass.bus.async_fire("abc_emergency_entered_polygon", event_data)
        _LOGGER.info(
            "Entered polygon: %s (%s)",
            incident.headline,
            incident.alert_text,
        )

    def _fire_exited_polygon_event(
        self,
        incident: EmergencyIncident,
        data: CoordinatorData,
        monitored_lat: float | None,
        monitored_lon: float | None,
    ) -> None:
        """Fire event when monitored point exits a polygon.

        Args:
            incident: The incident polygon that was exited.
            data: The coordinator data.
            monitored_lat: The monitored point latitude.
            monitored_lon: The monitored point longitude.
        """
        event_data = self._build_containment_event_data(
            incident, data, monitored_lat, monitored_lon
        )
        self.hass.bus.async_fire("abc_emergency_exited_polygon", event_data)
        _LOGGER.info("Exited polygon: %s", incident.headline)

    def _fire_inside_polygon_event(
        self,
        incident: EmergencyIncident,
        data: CoordinatorData,
        monitored_lat: float | None,
        monitored_lon: float | None,
    ) -> None:
        """Fire event while monitored point is inside a polygon.

        Args:
            incident: The incident polygon containing the point.
            data: The coordinator data.
            monitored_lat: The monitored point latitude.
            monitored_lon: The monitored point longitude.
        """
        event_data = self._build_containment_event_data(
            incident, data, monitored_lat, monitored_lon
        )
        self.hass.bus.async_fire("abc_emergency_inside_polygon", event_data)

    def _fire_severity_changed_event(
        self,
        incident: EmergencyIncident,
        previous_alert_level: str,
        previous_alert_text: str,
        data: CoordinatorData,
        monitored_lat: float | None,
        monitored_lon: float | None,
    ) -> None:
        """Fire event when alert level changes while inside a polygon.

        This event fires when the severity of an incident changes while the
        monitored point remains inside its polygon. This enables automations
        to respond to escalation (e.g., Advice -> Emergency Warning) or
        de-escalation events.

        Args:
            incident: The incident whose severity changed.
            previous_alert_level: The previous alert level (extreme, severe, moderate, minor).
            previous_alert_text: The previous human-readable alert text.
            data: The coordinator data.
            monitored_lat: The monitored point latitude.
            monitored_lon: The monitored point longitude.
        """
        # Determine if this is an escalation or de-escalation
        previous_priority = ALERT_LEVEL_PRIORITY.get(previous_alert_level, 0)
        current_priority = ALERT_LEVEL_PRIORITY.get(incident.alert_level, 0)
        escalated = current_priority > previous_priority

        # Build event data with severity change specific fields
        event_data = self._build_containment_event_data(
            incident, data, monitored_lat, monitored_lon
        )
        event_data.update(
            {
                "previous_alert_level": previous_alert_level,
                "previous_alert_text": previous_alert_text,
                "new_alert_level": incident.alert_level,
                "new_alert_text": incident.alert_text,
                "escalated": escalated,
            }
        )

        self.hass.bus.async_fire("abc_emergency_containment_severity_changed", event_data)

        direction = "escalated" if escalated else "de-escalated"
        _LOGGER.info(
            "Severity %s for %s: %s -> %s",
            direction,
            incident.headline,
            previous_alert_text or previous_alert_level,
            incident.alert_text or incident.alert_level,
        )
