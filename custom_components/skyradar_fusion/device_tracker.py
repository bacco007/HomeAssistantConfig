"""Device tracker platform for SkyRadar Fusion."""

from homeassistant.components.device_tracker.config_entry import TrackerEntity
from homeassistant.components.device_tracker.const import SourceType
from homeassistant.core import callback
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN, CONF_ENABLE_TRACKER


async def async_setup_entry(hass, config_entry, async_add_entities):
    coordinator = hass.data[DOMAIN][config_entry.entry_id]

    tracked_hexes = set()

    @callback
    def _update():
        if not coordinator.config_entry.options.get(CONF_ENABLE_TRACKER, True):
            return

        new_entities = []

        for ac in coordinator.data.get("tracked_aircraft", []):
            hex_id = ac.get("hex")
            if hex_id and hex_id not in tracked_hexes:
                tracked_hexes.add(hex_id)
                new_entities.append(SkyRadarFusionTracker(coordinator, hex_id))

        if new_entities:
            async_add_entities(new_entities)

    coordinator.async_add_listener(_update)
    _update()


class SkyRadarFusionTracker(CoordinatorEntity, TrackerEntity):
    def __init__(self, coordinator, hex_id):
        super().__init__(coordinator)
        self._hex_id = hex_id

        ac_data = self._ac_live_or_offline()
        callsign = ac_data.get("flight", "").strip() or self._hex_id

        self._attr_has_entity_name = False
        self._attr_name = f"skyradar_fusion_{callsign}"
        self._attr_unique_id = f"skyradar_fusion_{self._hex_id}"

    def _ac_live_or_offline(self):
        current_ac = next(
            (
                ac
                for ac in self.coordinator.data.get("tracked_aircraft", [])
                if ac.get("hex") == self._hex_id
            ),
            None,
        )

        if current_ac:
            return current_ac

        return {
            "hex": self._hex_id,
            "flight": "Offline",
            "lat": None,
            "lon": None,
            "air_category": "Offline",
            "is_offline": True,
        }

    @property
    def latitude(self):
        return self._ac_live_or_offline().get("lat")

    @property
    def longitude(self):
        return self._ac_live_or_offline().get("lon")

    @property
    def source_type(self):
        return SourceType.GPS

    @property
    def icon(self):
        ac = self._ac_live_or_offline()

        if ac.get("is_offline"):
            return "mdi:airplane-off"

        ac_type = ac.get("desc", "").lower()
        baro_rate = ac.get("baro_rate", 0)

        if "heli" in ac_type or "rotor" in ac_type:
            return "mdi:helicopter"
        if "glider" in ac_type:
            return "mdi:paper-airplane"
        if "balloon" in ac_type:
            return "mdi:hot-air-balloon"

        if baro_rate > 250:
            return "mdi:airplane-takeoff"
        elif baro_rate < -250:
            return "mdi:airplane-landing"

        return "mdi:airplane"

    @property
    def entity_picture(self):
        ac_data = self._ac_live_or_offline()

        if ac_data.get("is_offline"):
            return None

        api_photo = ac_data.get("api_photo_url")
        if api_photo:
            return api_photo

        icao_type = ac_data.get("t")
        if icao_type:
            return f"/skyradar_fusion_assets/planes/{icao_type.upper()}.png"

        return None

    @property
    def extra_state_attributes(self):
        ac = self._ac_live_or_offline()

        if ac.get("is_offline"):
            return {
                "Status": "Offline / Out of Range",
                "Info": "Radar tracking is disabled or aircraft left the area.",
            }

        # --- NIEUW: Duidelijke Status Indicator ---
        attrs = {}
        if ac.get("on_ground"):
            attrs["Status"] = "Landed / On Ground"
        else:
            attrs["Status"] = "Airborne / In Flight"

        raw_attrs = {
            "Callsign": ac.get("flight", "Unknown").strip(),
            "Registration": ac.get("r", "Unknown"),
            "Type": ac.get("t", "Unknown"),
            "Description": ac.get("desc"),
            "Category": ac.get("air_category"),
            "Altitude (ft)": ac.get("alt_baro"),
            "Target Altitude (ft)": ac.get("nav_altitude_mcp"),
            "Ground Speed (kts)": ac.get("gs"),
            "Mach": ac.get("mach"),
            "Vertical Rate (ft/min)": ac.get("baro_rate"),
            "Heading (deg)": ac.get("track"),
            "Squawk": ac.get("squawk"),
            "Emergency": ac.get("emergency"),
            "Outside Temp (C)": ac.get("oat"),
            "Distance (m)": ac.get("distance_meter", "N/A"),
        }

        # Combineer de velden
        for k, v in raw_attrs.items():
            if v is not None and v != "none":
                attrs[k] = v

        if ac.get("fr24_route") and ac.get("fr24_route") != "N/A - N/A":
            attrs["Route (FR24)"] = ac.get("fr24_route")
        if ac.get("airline"):
            attrs["Airline"] = ac.get("airline")
        if ac.get("airline_icao"):
            attrs["Airline ICAO"] = ac.get("airline_icao")
        if ac.get("airport_origin_name"):
            attrs["Origin Airport"] = ac.get("airport_origin_name")
        if ac.get("airport_origin_city"):
            attrs["Origin City"] = ac.get("airport_origin_city")
        if ac.get("airport_origin_country_code"):
            attrs["Origin Country"] = ac.get("airport_origin_country_code")
        if ac.get("airport_destination_name"):
            attrs["Destination Airport"] = ac.get("airport_destination_name")
        if ac.get("airport_destination_country_name"):
            attrs["Destination Country"] = ac.get("airport_destination_country_name")

        if ac.get("fr24_scheduled_departure"):
            attrs["Scheduled Departure"] = ac.get("fr24_scheduled_departure")
        if ac.get("fr24_real_departure"):
            attrs["Actual Departure"] = ac.get("fr24_real_departure")
        if ac.get("fr24_scheduled_arrival"):
            attrs["Scheduled Arrival"] = ac.get("fr24_scheduled_arrival")
        if ac.get("fr24_estimated_arrival"):
            attrs["Estimated Arrival (ETA)"] = ac.get("fr24_estimated_arrival")

        return attrs
