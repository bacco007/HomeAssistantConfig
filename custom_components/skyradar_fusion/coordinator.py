import logging
from datetime import timedelta
import math
import re
from homeassistant.helpers.storage import Store
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.util import dt as dt_util

from .api import SkyRadarFusionAPI
from .const import (
    DOMAIN,
    CONF_TRACKING_MODE,
    CONF_RADIUS,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    CONF_GLOBAL_EMERGENCY,
    CONF_GLOBAL_MILITARY,
    CONF_FR24_RADIUS,
    CONF_ENABLE_FR24_ENRICHMENT,
    CONF_FR24_COMMERCIAL,
    CONF_FR24_PRIVATE,
    CONF_FR24_HELICOPTER,
    CONF_ADVANCED_ADSB_FILTER,
    MODE_ZONE,
    DEFAULT_SCAN_INTERVAL,
)

_LOGGER = logging.getLogger(__name__)


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 3440.065
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    )
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class SkyRadarFusionCoordinator(DataUpdateCoordinator):
    def __init__(self, hass: HomeAssistant, config_entry):
        self.config_entry = config_entry
        self.api = SkyRadarFusionAPI(async_get_clientsession(hass), hass)
        self.mode = config_entry.data.get(CONF_TRACKING_MODE, MODE_ZONE)

        self.previous_hexes = None
        self.entered_area = 0
        self.exited_area = 0

        self.tracked_list = set()
        self.consecutive_errors = 0
        self.last_update_status = "Pending"
        self.last_update_time = None
        self.photo_cache = {}
        self.fr24_cache = {}
        self.recent_history = []
        self.tracker_memory = {}

        self.store = Store(hass, 1, f"{DOMAIN}_history_{config_entry.entry_id}")
        self._history_loaded = False

        state_obj = hass.states.get("sensor.skyradar_fusion_additional_tracked")
        if state_obj:
            saved_list = state_obj.attributes.get("tracking_list")
            if saved_list:
                for item in str(saved_list).split(","):
                    if item.strip():
                        self.add_track(item.strip())
            elif (
                state_obj.state
                and not state_obj.state.isdigit()
                and state_obj.state not in ["unknown", "unavailable"]
            ):
                for item in str(state_obj.state).split(","):
                    if item.strip():
                        self.add_track(item.strip())

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

    def add_track(self, identifier):
        if identifier:
            clean_id = identifier.strip().upper().replace(" ", "")
            self.tracked_list.add(clean_id)
            _LOGGER.info(
                "SkyRadar Fusion: Target '%s' added to tracking list.", clean_id
            )

    def remove_track(self, identifier):
        if identifier:
            clean_id = identifier.strip().upper().replace(" ", "")
            self.tracked_list.discard(clean_id)
            _LOGGER.info(
                "SkyRadar Fusion: Target '%s' removed from tracking list.", clean_id
            )

    def clear_tracks(self):
        self.tracked_list.clear()

    def clean_aircraft_data(self, ac):
        keys_to_keep = [
            "hex",
            "flight",
            "r",
            "t",
            "desc",
            "alt_baro",
            "gs",
            "ias",
            "tas",
            "mach",
            "track",
            "roll",
            "mag_heading",
            "true_heading",
            "baro_rate",
            "squawk",
            "emergency",
            "category",
            "nav_altitude_mcp",
            "lat",
            "lon",
            "oat",
            "tat",
            "dbFlags",  # Added new field
            "ownOp",  # Added new field
            "year",  # Added new field
        ]
        cleaned = {
            k: ac.get(k)
            for k in keys_to_keep
            if k in ac and ac.get(k) is not None and str(ac.get(k)).strip() != ""
        }
        cleaned["air_category"] = self.classify_aircraft(ac)
        return cleaned

    def classify_aircraft(self, ac):
        desc = ac.get("desc", "").lower()
        flight = ac.get("flight", "").strip().upper()
        cat = ac.get("category", "").strip().upper()
        t_code = ac.get("t", "").strip().upper()

        if (
            "heli" in desc
            or "rotor" in desc
            or "ecureuil" in desc
            or cat == "A7"
            or t_code
            in ["AS50", "EC30", "EC35", "R44", "R66", "B06", "H60", "H64", "A189"]
        ):
            return "helicopter"
        if "military" in desc or "mil" in desc or cat == "A6":
            return "military"

        if flight:
            if re.match(r"^[A-Z]{3}\d", flight):
                return "commercial"
            commercial_prefixes = (
                "AAL",
                "AAR",
                "ACA",
                "AEE",
                "AFR",
                "AHO",
                "AIC",
                "ALK",
                "AMX",
                "ANA",
                "ASA",
                "AUA",
                "AVA",
                "AWC",
                "BAW",
                "BCS",
                "BEL",
                "BOX",
                "BTI",
                "CAL",
                "CBJ",
                "CCA",
                "CCX",
                "CHH",
                "CKS",
                "CLA",
                "CLX",
                "CLY",
                "CMP",
                "CND",
                "CPA",
                "CSH",
                "CSN",
                "DAL",
                "DCS",
                "DHK",
                "DHL",
                "DLH",
                "EIN",
                "EJA",
                "EJM",
                "ETD",
                "EVA",
                "EWE",
                "EWG",
                "EWL",
                "EXS",
                "EZS",
                "EZY",
                "FBA",
                "FDX",
                "FFT",
                "FIN",
                "FLX",
                "FLY",
                "FYG",
                "GAC",
                "GFA",
                "GTI",
                "HAL",
                "HFY",
                "HVN",
                "IBE",
                "ICE",
                "IGO",
                "ITY",
                "JAL",
                "JAS",
                "JBU",
                "JFA",
                "JSX",
                "KAL",
                "KLM",
                "KMM",
                "KQA",
                "KZR",
                "LAN",
                "LOG",
                "LOT",
                "LUX",
                "LXJ",
                "LYX",
                "LZB",
                "MAS",
                "MPH",
                "MXY",
                "NJE",
                "NKS",
                "OMA",
                "PAC",
                "PH",
                "PIA",
                "QFA",
                "QQE",
                "QTR",
                "QXE",
                "RJA",
                "RYA",
                "SAS",
                "SCW",
                "SCX",
                "SIA",
                "SKW",
                "SLR",
                "SRU",
                "SVA",
                "SVW",
                "SWA",
                "SWR",
                "TAG",
                "TAP",
                "TAY",
                "THA",
                "THY",
                "TOM",
                "TRA",
                "TUI",
                "TVS",
                "UAE",
                "UAL",
                "UPS",
                "VIR",
                "VIV",
                "VJT",
                "VOI",
                "WJA",
                "WUP",
                "XGO",
            )
            if flight.startswith(commercial_prefixes):
                return "commercial"

        if cat in ["A3", "A4", "A5"]:
            return "commercial"

        return "private"

    async def _fetch_photo_background(self, reg, hex_code, cache_key):
        photo_url = await self.api.get_planespotters_photo(reg, hex_code)
        if photo_url:
            self.photo_cache[cache_key] = photo_url
        else:
            self.photo_cache[cache_key] = "None"

    async def _fetch_fr24_background(
        self, search_id, lat=None, lon=None, hex_code=None
    ):
        try:
            fr24_data = await self.api.get_fr24_enrichment(
                search_id, lat, lon, hex_code
            )
            if fr24_data:
                self.fr24_cache[search_id] = fr24_data
            else:
                self.fr24_cache[search_id] = "None"
        except Exception:
            self.fr24_cache[search_id] = "None"

    async def _async_update_data(self):
        try:
            if not self._history_loaded:
                stored_history = await self.store.async_load()
                if stored_history:
                    self.recent_history = stored_history
                self._history_loaded = True

            radius_meters = self.config_entry.options.get(
                CONF_RADIUS, self.config_entry.data.get(CONF_RADIUS, 5000)
            )
            fr24_radius_meters = self.config_entry.options.get(
                CONF_FR24_RADIUS, self.config_entry.data.get(CONF_FR24_RADIUS, 3000)
            )
            enable_emergencies = self.config_entry.options.get(
                CONF_GLOBAL_EMERGENCY, False
            )
            enable_military = self.config_entry.options.get(CONF_GLOBAL_MILITARY, False)
            enable_fr24 = self.config_entry.options.get(
                CONF_ENABLE_FR24_ENRICHMENT, False
            )

            fr24_comm = self.config_entry.options.get(CONF_FR24_COMMERCIAL, True)
            fr24_priv = self.config_entry.options.get(CONF_FR24_PRIVATE, False)
            fr24_heli = self.config_entry.options.get(CONF_FR24_HELICOPTER, False)

            home_lat = self.config_entry.options.get(
                CONF_LATITUDE,
                self.config_entry.data.get(CONF_LATITUDE, self.hass.config.latitude),
            )
            home_lon = self.config_entry.options.get(
                CONF_LONGITUDE,
                self.config_entry.data.get(CONF_LONGITUDE, self.hass.config.longitude),
            )

            cat_counts = {"helicopter": 0, "military": 0, "commercial": 0, "private": 0}
            closest_aircraft = None
            closest_distance_meters = float("inf")
            filtered_aircraft = []
            current_hexes = set()
            global_emergencies_data = []
            global_military_data = []

            if self.mode == MODE_ZONE:
                radius_nm = max(1, math.ceil(radius_meters / 1852.0))
                aircraft_list = await self.api.get_aircraft_in_zone(
                    home_lat, home_lon, radius_nm
                )

                if aircraft_list is None:
                    if self.data:
                        filtered_aircraft = self.data.get("aircraft", [])
                        cat_counts = self.data.get("counts", cat_counts)
                        closest_aircraft = self.data.get("closest", None)
                        current_hexes = self.previous_hexes or set()
                else:
                    for ac in aircraft_list:
                        ac_lat, ac_lon = ac.get("lat"), ac.get("lon")
                        if ac_lat is None or ac_lon is None:
                            continue

                        dist_meters = (
                            haversine_distance(home_lat, home_lon, ac_lat, ac_lon)
                            * 1852.0
                        )

                        if dist_meters <= radius_meters:
                            current_hexes.add(ac.get("hex"))
                            clean_ac = self.clean_aircraft_data(ac)
                            clean_ac["distance_meter"] = round(dist_meters, 1)
                            cat_counts[clean_ac["air_category"]] += 1
                            filtered_aircraft.append(clean_ac)

                            if dist_meters < closest_distance_meters:
                                closest_distance_meters = dist_meters
                                closest_aircraft = clean_ac

            if enable_emergencies:
                em_raw = await self.api.get_global_emergencies()

                if em_raw is None or (
                    len(em_raw) == 0
                    and self.data
                    and len(self.data.get("global_emergencies", [])) > 0
                ):
                    global_emergencies_data = (
                        self.data.get("global_emergencies", []) if self.data else []
                    )
                else:
                    for ac in em_raw:
                        clean_ac = self.clean_aircraft_data(ac)
                        if clean_ac.get("lat") and clean_ac.get("lon"):
                            clean_ac["distance_meter"] = round(
                                haversine_distance(
                                    home_lat, home_lon, clean_ac["lat"], clean_ac["lon"]
                                )
                                * 1852.0,
                                1,
                            )
                        global_emergencies_data.append(clean_ac)

            if enable_military:
                mil_raw = await self.api.get_global_military()
                if mil_raw is None or (
                    len(mil_raw) == 0
                    and self.data
                    and len(self.data.get("global_military", [])) > 0
                ):
                    global_military_data = (
                        self.data.get("global_military", []) if self.data else []
                    )
                else:
                    for ac in mil_raw:
                        clean_ac = self.clean_aircraft_data(ac)
                        if clean_ac.get("lat") and clean_ac.get("lon"):
                            clean_ac["distance_meter"] = round(
                                haversine_distance(
                                    home_lat, home_lon, clean_ac["lat"], clean_ac["lon"]
                                )
                                * 1852.0,
                                1,
                            )
                        global_military_data.append(clean_ac)

            tracked_aircraft_data = []
            for identifier in self.tracked_list:
                clean_id = identifier.strip().upper()

                found = next(
                    (
                        ac
                        for ac in filtered_aircraft
                        + global_emergencies_data
                        + global_military_data
                        if ac.get("flight", "").strip().upper() == clean_id
                        or ac.get("hex", "").upper() == clean_id
                        or ac.get("r", "").strip().upper() == clean_id
                    ),
                    None,
                )

                if found:
                    ac_copy = found.copy()
                    ac_copy["raw_hex"] = ac_copy.get("hex")
                    ac_copy["hex"] = clean_id
                    tracked_aircraft_data.append(ac_copy)
                else:
                    res = (
                        await self.api.get_aircraft_by_callsign(clean_id)
                        or await self.api.get_aircraft_by_hex(clean_id)
                        or await self.api.get_aircraft_by_reg(clean_id)
                    )
                    if res:
                        ac_clean = self.clean_aircraft_data(res[0])
                        ac_clean["raw_hex"] = ac_clean.get("hex")
                        ac_clean["hex"] = clean_id
                        tracked_aircraft_data.append(ac_clean)
                    else:
                        tracked_aircraft_data.append(
                            {
                                "hex": clean_id,
                                "raw_hex": clean_id,
                                "flight": "Offline",
                                "r": clean_id,
                                "air_category": "Offline",
                                "distance_meter": "N/A",
                                "is_offline": True,
                            }
                        )

            map_tracker_targets = (
                tracked_aircraft_data + global_emergencies_data + global_military_data
            )
            unique_map_targets = {
                target.get("hex"): target for target in map_tracker_targets
            }.values()

            advanced_filter_str = self.config_entry.options.get(
                CONF_ADVANCED_ADSB_FILTER, ""
            )
            advanced_filters = [
                x.strip().upper() for x in advanced_filter_str.split(",") if x.strip()
            ]

            allowed_fr24_cats = []
            if fr24_comm:
                allowed_fr24_cats.append("commercial")
            if fr24_priv:
                allowed_fr24_cats.append("private")
            if fr24_heli:
                allowed_fr24_cats.append("helicopter")

            overhead_aircraft = []
            for ac in filtered_aircraft:
                if ac.get("distance_meter", float("inf")) <= fr24_radius_meters:
                    if advanced_filters:
                        if ac.get("category", "").strip().upper() in advanced_filters:
                            overhead_aircraft.append(ac)
                    else:
                        if ac.get("air_category") in allowed_fr24_cats:
                            overhead_aircraft.append(ac)

            fr24_targets_raw = (
                tracked_aircraft_data + global_emergencies_data + overhead_aircraft
            )
            unique_fr24_targets = {
                target.get("hex"): target for target in fr24_targets_raw
            }.values()

            for target in unique_fr24_targets:
                reg = target.get("r") or "Unknown"
                hex_code = target.get("raw_hex") or target.get("hex") or "Unknown"
                callsign = target.get("flight", "").strip().upper()
                ac_lat = target.get("lat")
                ac_lon = target.get("lon")

                search_id = callsign if callsign and callsign != "Unknown" else reg
                if not search_id or search_id == "Unknown":
                    search_id = hex_code

                cache_key = hex_code if hex_code != "Unknown" else search_id

                if cache_key != "Unknown" and cache_key not in self.photo_cache:
                    self.photo_cache[cache_key] = "Loading"
                    self.hass.async_create_task(
                        self._fetch_photo_background(reg, hex_code, cache_key)
                    )

                if enable_fr24 and search_id and search_id != "Unknown":
                    if search_id not in self.fr24_cache:
                        self.fr24_cache[search_id] = "Loading"
                        self.hass.async_create_task(
                            self._fetch_fr24_background(
                                search_id, ac_lat, ac_lon, hex_code
                            )
                        )

            for target in filtered_aircraft + list(unique_map_targets):
                reg = target.get("r") or "Unknown"
                hex_code = target.get("raw_hex") or target.get("hex") or "Unknown"
                callsign = target.get("flight", "").strip().upper()

                search_id = callsign if callsign and callsign != "Unknown" else reg
                if not search_id or search_id == "Unknown":
                    search_id = hex_code

                cache_key = hex_code if hex_code != "Unknown" else search_id

                if self.photo_cache.get(cache_key) and self.photo_cache[
                    cache_key
                ] not in ["None", "Loading"]:
                    target["api_photo_url"] = self.photo_cache[cache_key]

                target_on_ground = False
                if str(target.get("alt_baro")).lower() == "ground":
                    target_on_ground = True

                if enable_fr24:
                    fr24_data = self.fr24_cache.get(search_id)
                    if fr24_data and isinstance(fr24_data, dict):
                        target.update(fr24_data)
                        if fr24_data.get("fr24_photo"):
                            target["api_photo_url"] = fr24_data["fr24_photo"]

                        if fr24_data.get("fr24_on_ground") in [1, "1", True]:
                            target_on_ground = True

                        if (
                            target.get("lat") is None
                            and fr24_data.get("fr24_lat") is not None
                        ):
                            target["lat"] = fr24_data["fr24_lat"]
                            target["lon"] = fr24_data["fr24_lon"]
                            target["track"] = fr24_data["fr24_track"]
                            target["alt_baro"] = fr24_data["fr24_alt"]
                            target["gs"] = fr24_data["fr24_gs"]

                            sq = fr24_data.get("fr24_squawk")
                            if sq and str(sq).strip() != "":
                                target["squawk"] = sq

                            if target.get(
                                "t", "Unknown"
                            ) == "Unknown" and fr24_data.get(
                                "fr24_aircraft_code"
                            ) not in [None, "Unknown"]:
                                target["t"] = fr24_data["fr24_aircraft_code"]
                                target["air_category"] = self.classify_aircraft(
                                    {
                                        "flight": target.get("flight", ""),
                                        "category": "",
                                        "desc": target["t"],
                                    }
                                )

                            if target.get("is_offline"):
                                target.pop("is_offline", None)
                            if target.get("flight") == "Offline":
                                target["flight"] = search_id

                target["on_ground"] = target_on_ground
                if target_on_ground:
                    target["alt_baro"] = "Ground"
                    target["gs"] = 0
                    target["baro_rate"] = 0

            current_time = dt_util.now().timestamp()

            for target in filtered_aircraft + list(unique_map_targets):
                tid = target.get("raw_hex") or target.get("hex")
                if not tid or tid == "Unknown":
                    continue

                is_placeholder = target.get("is_offline", False)

                if not is_placeholder:
                    if tid not in self.tracker_memory:
                        self.tracker_memory[tid] = {"data": {}}
                    self.tracker_memory[tid]["last_seen"] = current_time
                    for k, v in target.items():
                        if (
                            v is not None
                            and str(v).strip() != ""
                            and str(v).lower() not in ["unknown", "n/a", "none"]
                        ):
                            self.tracker_memory[tid]["data"][k] = v

                if tid in self.tracker_memory:
                    time_since_seen = (
                        current_time - self.tracker_memory[tid]["last_seen"]
                    )

                    if time_since_seen < 300:
                        if is_placeholder:
                            target.pop("is_offline", None)
                            target["flight"] = self.tracker_memory[tid]["data"].get(
                                "flight", target.get("flight")
                            )
                            target["air_category"] = self.tracker_memory[tid][
                                "data"
                            ].get("air_category", "Unknown")
                            target["r"] = self.tracker_memory[tid]["data"].get(
                                "r", target.get("r")
                            )
                            target["on_ground"] = self.tracker_memory[tid]["data"].get(
                                "on_ground", False
                            )

                        for k, v in self.tracker_memory[tid]["data"].items():
                            if (
                                target.get(k) is None
                                or str(target.get(k)).strip() == ""
                                or str(target.get(k)).lower()
                                in ["unknown", "n/a", "none"]
                            ):
                                target[k] = v

            expired_keys = []
            for tid, mem in self.tracker_memory.items():
                if current_time - mem["last_seen"] > 300:
                    expired_keys.append(tid)
            for tid in expired_keys:
                del self.tracker_memory[tid]

            for ac in filtered_aircraft:
                hex_code = ac.get("hex")
                if hex_code:
                    self.recent_history = [
                        item
                        for item in self.recent_history
                        if item.get("hex") != hex_code
                    ]
                    ac_copy = ac.copy()
                    ac_copy["spotted_time"] = dt_util.now().isoformat()
                    self.recent_history.insert(0, ac_copy)

            self.recent_history = self.recent_history[:50]
            self.store.async_delay_save(lambda: self.recent_history, 60)

            if self.previous_hexes is not None:
                new_hexes = current_hexes - self.previous_hexes
                exited_hexes = self.previous_hexes - current_hexes

                self.entered_area = len(new_hexes)
                self.exited_area = len(exited_hexes)

                for hex_code in new_hexes:
                    ac_data = next(
                        (ac for ac in filtered_aircraft if ac.get("hex") == hex_code),
                        None,
                    )
                    if ac_data:
                        self.hass.bus.async_fire("skyradar_fusion_entry", ac_data)

                for hex_code in exited_hexes:
                    self.hass.bus.async_fire("skyradar_fusion_exit", {"hex": hex_code})
            else:
                self.entered_area = 0
                self.exited_area = 0

            self.previous_hexes = current_hexes

            self.consecutive_errors = 0
            self.last_update_status = "Success"
            self.last_update_time = dt_util.now()

            return {
                "aircraft": filtered_aircraft,
                "tracked_aircraft": list(unique_map_targets),
                "global_emergencies": global_emergencies_data,
                "global_military": global_military_data,
                "total": len(filtered_aircraft),
                "counts": cat_counts,
                "closest": closest_aircraft,
                "entered": self.entered_area,
                "exited": self.exited_area,
                "additional_tracked": len(self.tracked_list),
                "tracking_list": ",".join(self.tracked_list)
                if self.tracked_list
                else "",
            }

        except Exception as err:
            self.consecutive_errors += 1
            self.last_update_status = "Failed"
            self.last_update_time = dt_util.now()
            if self.data:
                return self.data
            raise UpdateFailed(f"Error fetching data: {err}")
