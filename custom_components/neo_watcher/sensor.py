"""Sensor platform for NEO Watcher."""

import asyncio
import logging
from datetime import datetime, date
from typing import Any, List
from urllib.parse import quote

import aiohttp
import voluptuous as vol
from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.const import ATTR_ATTRIBUTION
from homeassistant.core import callback, HomeAssistant
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN, ATTRIBUTION, CONF_API_KEY, CONF_TOP_NEOS, DEFAULT_TOP_NEOS, CONF_NEO_SELECTION, NEO_SELECTION_OPTIONS, CONF_SPECIFIC_NEO
from .coordinator import NeoWatcherCoordinator

_LOGGER = logging.getLogger(__name__)

# Constants for rate limiting and retries
HORIZONS_API_DELAY = 7  # Delay between Horizons API calls (in seconds)
HORIZONS_API_RETRIES = 7  # Number of retries for failed Horizons API calls
HORIZONS_API_TIMEOUT = 15 # Timeout for the aiohttp request

async def async_setup_entry(
    hass: HomeAssistant, config_entry, async_add_entities
) -> None:
    """Set up the NEO Watcher sensor."""
    _LOGGER.debug("Setting up NEO Watcher sensor platform.")
    _LOGGER.debug(f"Config entry data: {config_entry.data}")
    # Get the coordinator from hass.data instead of creating a new one
    coordinator: NeoWatcherCoordinator = hass.data[DOMAIN][config_entry.entry_id]
    _LOGGER.debug("Retrieved NeoWatcherCoordinator instance from hass.data.")
    # No need to call coordinator.async_config_entry_first_refresh() again here

    # Add the new combined sensor
    async_add_entities([NEOWatcherStatsSensor(coordinator, config_entry.data)])

    # Conditional sensor creation
    if config_entry.data.get(CONF_NEO_SELECTION) == NEO_SELECTION_OPTIONS[0]:
        # Determine the number of top NEOs to display
        top_neos = config_entry.data.get(CONF_TOP_NEOS, DEFAULT_TOP_NEOS)
        _LOGGER.debug(f"Displaying top {top_neos} NEOs.")

        # Loop around to get the top hazardous objects
        _LOGGER.debug(
            f"Found {len(coordinator.all_hazardous_objects)} potentially hazardous objects and {len(coordinator.all_objects)} total objects."
        )
        hazardous_feed_entities: List[Entity] = []
        for i in range(min(top_neos, len(coordinator.all_hazardous_objects))):
            _LOGGER.debug(
                f"Creating NEOWatcherFeedSensor for hazardous object at index {i}."
            )
            hazardous_feed_entities.append(
                NEOWatcherFeedSensor(hass, coordinator, i, i + 1)
            )
        _LOGGER.debug(
            f"Adding {len(hazardous_feed_entities)} hazardous feed entities to Home Assistant."
        )

        # Loop around to get the top non hazardous objects
        _LOGGER.debug(
            f"Found {len(coordinator.all_non_hazardous_objects)} non hazardous objects and {len(coordinator.all_objects)} total objects."
        )
        non_hazardous_feed_entities: List[Entity] = []
        for i in range(min(top_neos, len(coordinator.all_non_hazardous_objects))):
            _LOGGER.debug(
                f"Creating NEOWatcherNonHazardousFeedSensor for non hazardous object at index {i}."
            )
            non_hazardous_feed_entities.append(
                NEOWatcherNonHazardousFeedSensor(hass, coordinator, i, i + 1)
            )
        _LOGGER.debug(
            f"Adding {len(non_hazardous_feed_entities)} non hazardous feed entities to Home Assistant."
        )

        # Add entities synchronously
        if hazardous_feed_entities:
            async_add_entities(hazardous_feed_entities)
        if non_hazardous_feed_entities:
            async_add_entities(non_hazardous_feed_entities)
        await coordinator.async_fetch_horizon_data_for_objects(
            hass, hazardous_feed_entities + non_hazardous_feed_entities
        )
    elif config_entry.data.get(CONF_NEO_SELECTION) == NEO_SELECTION_OPTIONS[1]:
        # Create NEOWatcherSpecificSensor
        specific_neo = config_entry.data.get(CONF_SPECIFIC_NEO)
        _LOGGER.debug(f"Creating NEOWatcherSpecificSensor for {specific_neo}.")
        sensor = NEOWatcherSpecificSensor(hass, coordinator, specific_neo) # Create the sensor
        async_add_entities([sensor]) # Add the sensor to HA
        await sensor._async_fetch_and_set_extra_attributes() #Fetch and set attributes

        #coordinator.specific_neo = specific_neo 
        #async_add_entities([NEOWatcherSpecificSensor(hass, coordinator, specific_neo)])
        #await coordinator.async_fetch_horizon_data_for_objects(
        #    hass, [NEOWatcherSpecificSensor(hass, coordinator, specific_neo)]
        #)
        

    _LOGGER.debug("NEO Watcher sensor platform setup completed.")
    coordinator.async_update_listeners()




class NEOWatcherFeedSensor(CoordinatorEntity, SensorEntity):
    """Representation of a NEO Watcher sensor."""

    def __init__(self, hass: HomeAssistant, coordinator: NeoWatcherCoordinator, index: int, rank: int) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.hass = hass
        self._index = index
        self._rank = rank
        self._attr_name = f"neo_watcher_potentially_hazardous_{self._rank}{self._get_rank_suffix(self._rank)}"
        self._attr_unique_id = f"neo_watcher_potentially_hazardous_feed_{self._rank}" # <--- Fixed unique_id
        self._attr_attribution = ATTRIBUTION
        self._attr_icon = "mdi:earth-arrow-right" # <--- Added icon here
        #self._attr_native_value = self.data['name'] # Removed, as it is not available yet
        _LOGGER.debug(f"NEOWatcherFeedSensor initialized for object at rank: {self._rank}")
        self._extra_attributes = {}  # Initialize as an empty dict

    def _get_rank_suffix(self, rank):
        """Return the suffix for the rank."""
        if 11 <= rank <= 13:
            return "th"
        return {1: "st", 2: "nd", 3: "rd"}.get(rank % 10, "th")

    @property
    def data(self) -> dict[str, Any]:
        """Return data for this sensor."""
        return self.coordinator.all_hazardous_objects[self._index]

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        return self.data['name']

    async def fetch_horizon_data(self, url, retry_count=0):
        """Fetch data from the Horizons API with retries and delay."""
        _LOGGER.debug(f"fetch_horizon_data for URL: {url}")
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=HORIZONS_API_TIMEOUT)) as session:
                async with session.get(url) as response:
                    response.raise_for_status()
                    data = await response.json()
                    return data
        except aiohttp.ClientResponseError as err:
        # ... (rest of the error handling)
            if err.status == 503 and retry_count < HORIZONS_API_RETRIES:
                _LOGGER.warning(
                    f"Horizons API returned 503. Retrying in {HORIZONS_API_DELAY} seconds (attempt {retry_count + 1}/{HORIZONS_API_RETRIES}). URL: {url}"
                )
                await asyncio.sleep(HORIZONS_API_DELAY)
                return await self.fetch_horizon_data(url, retry_count + 1)
            else:
                _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
                return None
        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
            return None
        except asyncio.TimeoutError:
            _LOGGER.error(f"Timeout communicating with API, URL: {url}")
            return None
        except Exception as err:
            _LOGGER.error(f"An unexpected error occurred: {err}, URL: {url}")
            return None
        finally:
            # Introduce a delay after each call
            await asyncio.sleep(HORIZONS_API_DELAY)
    
    async def _async_fetch_and_set_extra_attributes(self):
        """Fetch and set the extra state attributes."""
        data = self.data
        closest_approach = data.get("close_approach_data", [])[0]
        _LOGGER.debug(f"Getting extra state attributes for object: {data['name']}")
        name = data.get("name")
        # Corrected parenthesis removal
        if name.startswith("(") and name.endswith(")"):
            name_without_brackets = name[1:-1]
            name_without_brackets = name_without_brackets.replace("+", "%20")
        else:
            name_without_brackets = name
        # If name has brackets after the first character then remove anything from the bracket onwards
        if name_without_brackets.find("(") > 1:
            name_without_brackets = name_without_brackets[0:name.find('(')].strip()
            _LOGGER.debug(f"{name} was changed to {name_without_brackets}")
        neo_reference_id = data.get("neo_reference_id")
        name_urlencoded = quote(name_without_brackets)
        horizon_url = f"https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27DES%3D{neo_reference_id}%27"
        _LOGGER.debug(f"Horizon URL for {name} is {horizon_url}")

            # New code to fetch and parse data from horizon_url
        horizon_data = await self.fetch_horizon_data(horizon_url)

        if horizon_data is None:
                adist = 0
                argument_of_perihelion_wrt_ecliptic = 0
                perihelion = 0
                magnitude = 0
                epoch = 0
                ecliptic = 0
                perihelion_julian_day = 0
                semi_major_axis = 0
                perihelion_distance = 0
                mean_motion = 0
                inclination_wrt_ecliptic = 0
                longitude_of_ascending_node_wrt_ecliptic = 0
                neo_watcher_orbit_viewer_url = None
        else:
                result_text = horizon_data.get("result", "")

                adist = self._extract_value(result_text, "ADIST=")
                _LOGGER.debug(f"adist value {adist}")
                argument_of_perihelion_wrt_ecliptic = self._extract_value(result_text, "W=")
                _LOGGER.debug(f"argument_of_perihelion_wrt_ecliptic value {argument_of_perihelion_wrt_ecliptic}")
                perihelion_str = self._extract_value(result_text, "TP=")
                perihelion = float(perihelion_str) * 365.25 if perihelion_str is not None and perihelion_str != "" else None
                _LOGGER.debug(f"perihelion value {perihelion}")
                magnitude = self._extract_value(result_text, "MA=")
                _LOGGER.debug(f"magnitude value {magnitude}")
                epoch = self._extract_value(result_text, "EPOCH=")
                _LOGGER.debug(f"epoch value {epoch}")
                ecliptic = self._extract_value(result_text, "EC=")
                _LOGGER.debug(f"ecliptic value {ecliptic}")
                perihelion_julian_day = self._extract_value(result_text, "TP=")
                _LOGGER.debug(f"perihelion_julian_day value {perihelion_julian_day}")
                semi_major_axis = self._extract_value(result_text, "A=")
                _LOGGER.debug(f"semi_major_axis value {semi_major_axis}")
                perihelion_distance = self._extract_value(result_text, "QR=")
                _LOGGER.debug(f"perihelion_distance value {perihelion_distance}")
                mean_motion = self._extract_value(result_text, "N=")
                _LOGGER.debug(f"mean_motion value {mean_motion}")
                inclination_wrt_ecliptic = self._extract_value(result_text, "IN=")
                _LOGGER.debug(f"inclination_wrt_ecliptic value {inclination_wrt_ecliptic}")
                longitude_of_ascending_node_wrt_ecliptic = self._extract_value(result_text, "OM=")
                _LOGGER.debug(f"longitude_of_ascending_node_wrt_ecliptic value {longitude_of_ascending_node_wrt_ecliptic}")

                neo_watcher_orbit_viewer_url = (
                    f"https://ssd.jpl.nasa.gov/ov/index.html#no-add-menu=1&elem=ad:{adist},w:{argument_of_perihelion_wrt_ecliptic},label:{quote('('+name_without_brackets+')')},per:{perihelion},ma:{magnitude},epoch:{epoch},e:{ecliptic},tp:{perihelion_julian_day},a:{semi_major_axis},q:{perihelion_distance},n:{mean_motion},i:{inclination_wrt_ecliptic},om:{longitude_of_ascending_node_wrt_ecliptic}"
                )
                _LOGGER.debug(f"neo_watcher_orbit_viewer_url value {neo_watcher_orbit_viewer_url}")

        self._extra_attributes = {
                "name": name,
                "nasa_jpl_url": data.get("nasa_jpl_url"),
                "Neo_Watcher_Orbit_Viewer_URL": neo_watcher_orbit_viewer_url,
                "horizon_url": horizon_url,
                "absolute_magnitude_h": data.get("absolute_magnitude_h"),
                "estimated_diameter_min_km": data.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_min"),
                "estimated_diameter_max_km": data.get("estimated_diameter", {}).get("kilometers", {}).get("estimated_diameter_max"),
                "estimated_diameter_min_mi": data.get("estimated_diameter", {}).get("miles", {}).get("estimated_diameter_min"),
                "estimated_diameter_max_mi": data.get("estimated_diameter", {}).get("miles", {}).get("estimated_diameter_max"),
                "is_potentially_hazardous_asteroid": data.get("is_potentially_hazardous_asteroid"),
                "close_approach_date": closest_approach.get("close_approach_date"),
                "close_approach_date_full": closest_approach.get("close_approach_date_full"),
                "relative_velocity_km_per_s": closest_approach.get("relative_velocity", {}).get("kilometers_per_second"),
                "relative_velocity_km_per_h": closest_approach.get("relative_velocity", {}).get("kilometers_per_hour"),
                "relative_velocity_mi_per_h": closest_approach.get("relative_velocity", {}).get("miles_per_hour"),
                "miss_distance_km": closest_approach.get("miss_distance", {}).get("kilometers"),
                "miss_distance_mi": closest_approach.get("miss_distance", {}).get("miles"),
                "orbiting_body": closest_approach.get("orbiting_body"),
                "ADIST": adist,
                "Argument_of_perihelion_wrt_ecliptic": argument_of_perihelion_wrt_ecliptic,
                "Perihelion": perihelion,
                "Magnitude": magnitude,
                "Epoch": epoch,
                "Ecliptic": ecliptic,
                "Perihelion_Julian_Day": perihelion_julian_day,
                "Semi-major_axis": semi_major_axis,
                "Perihelion distance": perihelion_distance,
                "Mean_motion": mean_motion,
                "Inclination_wrt_ecliptic": inclination_wrt_ecliptic,
                "Longitude_of_ascending_node_wrt_ecliptic": longitude_of_ascending_node_wrt_ecliptic,
                "name_urlencoded": name_urlencoded,
            }
        self.async_write_ha_state()

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return the state attributes."""
        return self._extra_attributes

    def _extract_value(self, text, key):
        """Extract a numeric value directly following the key within the first 1500 characters."""
        
        truncated_text = text[:1500]  # Limit to the first 1500 characters
        
        try:
            start_index = truncated_text.find(key)
            if start_index == -1:
                return None
            start_index += len(key)
            _LOGGER.debug(f"extract_value start_index: {start_index} key: {key}")
            # Extract the numeric value
            value_str = ""
            for char in truncated_text[start_index:]:
                if char.isdigit() or char == '.' or char == '-' or char == 'e':
                    value_str += char
                else:
                    if char == ' ':
                        # ignore it!
                        char = char
                    else:
                        break
            _LOGGER.debug(f"extract_value start_index: {start_index} key: {key} value_str: {value_str}")
            if not value_str:
                return None
            
            # Check if the value is n.a.
            if value_str == "n.a.":
                return None

            # Convert to float if possible, otherwise return as string
            try:
                return float(value_str)
            except ValueError:
                return value_str.strip()

        except Exception as e:
            _LOGGER.error(f"Error extracting value for key '{key}': {e}")
            return None



    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return self._attr_icon

    @property
    def unit_of_measurement(self) -> None:
        """Return the unit of measurement."""
        return None

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        _LOGGER.debug(f"Coordinator updated for {self._attr_name}")
        self.async_write_ha_state()

class NEOWatcherNonHazardousFeedSensor(NEOWatcherFeedSensor):
    """Representation of a NEO Watcher sensor."""

    def __init__(self, hass: HomeAssistant, coordinator: NeoWatcherCoordinator, index: int, rank: int) -> None:
        """Initialize the sensor."""
        super().__init__(hass, coordinator, index, rank)
        self._attr_name = f"neo_watcher_non_hazardous_{self._rank}{self._get_rank_suffix(self._rank)}"
        self._attr_unique_id = f"neo_watcher_non_hazardous_feed_{self._rank}" # <--- Fixed unique_id
        _LOGGER.debug(f"NEOWatcherNonHazardousFeedSensor initialized for object at rank: {self._rank}")

    @property
    def data(self) -> dict[str, Any]:
        """Return data for this sensor."""
        return self.coordinator.all_non_hazardous_objects[self._index]

class NEOWatcherSpecificSensor(CoordinatorEntity, SensorEntity):
    """Representation of a NEO Watcher sensor for a specific object."""

    def __init__(self, hass: HomeAssistant, coordinator: NeoWatcherCoordinator, specific_neo: str) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.hass = hass
        self.specific_neo = specific_neo
        self._attr_name = f"neo_watcher_specific_{self.specific_neo}"
        self._attr_unique_id = f"neo_watcher_specific_{self.specific_neo}"
        self._attr_attribution = ATTRIBUTION
        self._attr_icon = "mdi:earth-arrow-right"
        self._attr_extra_state_attributes = {}
        self.entity_id = f"sensor.neo_watcher_specific_{self.specific_neo.lower().replace('(', '').replace(')', '').replace(' ', '_')}"
        self._neo_data = None #Store the data

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor."""
        return self.specific_neo

    async def fetch_neo_data(self, url, retry_count=0):
        """Fetch data from the NASA API with retries."""
        _LOGGER.debug(f"fetch_neo_data for URL: {url}")
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=HORIZONS_API_TIMEOUT)
            ) as session:
                async with session.get(url) as response:
                    response.raise_for_status()
                    data = await response.json()
                    if not data or "name" not in data: # Check for empty or malformed JSON
                        raise ValueError(f"Invalid or empty JSON response from NASA API: {data}")
                    _LOGGER.debug(f"2025_04_04X Data: {data}")
                    return data
        except aiohttp.ClientResponseError as err:
            if err.status == 503 and retry_count < HORIZONS_API_RETRIES:
                _LOGGER.warning(
                    f"NASA API returned 503. Retrying in {HORIZONS_API_DELAY} seconds (attempt {retry_count + 1}/{HORIZONS_API_RETRIES}). URL: {url}"
                )
                await asyncio.sleep(HORIZONS_API_DELAY)
                return await self.fetch_neo_data(url, retry_count + 1)
            else:
                _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
                return None
        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
            return None
        except asyncio.TimeoutError:
            _LOGGER.error(f"Timeout communicating with API, URL: {url}")
            return None
        except ValueError as err: # Catch ValueError for JSON issues
            _LOGGER.error(f"Error parsing JSON response from NASA API: {err}, URL: {url}")

        except Exception as err:
            _LOGGER.error(f"An unexpected error occurred: {err}, URL: {url}")
            return None
        finally:
            # Introduce a delay after each call
            await asyncio.sleep(HORIZONS_API_DELAY)

    async def fetch_horizon_data(self, url, retry_count=0):
        """Fetch data from the Horizons API with retries and delay."""
        _LOGGER.debug(f"fetch_horizon_data for URL: {url}")
        try:
            async with aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=HORIZONS_API_TIMEOUT)
            ) as session:
                async with session.get(url) as response:
                    response.raise_for_status()
                    data = await response.json()
                    return data
        except aiohttp.ClientResponseError as err:
            if err.status == 503 and retry_count < HORIZONS_API_RETRIES:
                _LOGGER.warning(
                    f"Horizons API returned 503. Retrying in {HORIZONS_API_DELAY} seconds (attempt {retry_count + 1}/{HORIZONS_API_RETRIES}). URL: {url}"
                )
                await asyncio.sleep(HORIZONS_API_DELAY)
                return await self.fetch_horizon_data(url, retry_count + 1)
            else:
                _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
                return None
        except aiohttp.ClientError as err:
            _LOGGER.error(f"Error communicating with API: {err}, URL: {url}")
            return None
        except asyncio.TimeoutError:
            _LOGGER.error(f"Timeout communicating with API, URL: {url}")
            return None
        except Exception as err:
            _LOGGER.error(f"An unexpected error occurred: {err}, URL: {url}")
            return None
        finally:
            # Introduce a delay after each call
            await asyncio.sleep(HORIZONS_API_DELAY)

    async def _async_fetch_and_set_extra_attributes(self):
        """Fetch and set the extra state attributes."""
        encoded_neo = quote(self.specific_neo)
        neo_url = f"http://api.nasa.gov/neo/rest/v1/neo/{encoded_neo}?api_key={self.coordinator.api_key}"
        #_LOGGER.debug(f"Fetching data for specific NEO URL: {neo_url}")
        neo_data = await self.fetch_neo_data(neo_url)
        self._neo_data = neo_data #Store the data
        if neo_data is None:
            return

        # Find the closest approach data for today or the next future date
        today = date.today()
        closest_approach_data = None
        future_approaches = []
        for approach in neo_data.get("close_approach_data", []):
            approach_date = datetime.strptime(approach["close_approach_date"], "%Y-%m-%d").date()
            if approach_date == today:
                closest_approach_data = approach
                break  # Found today's approach, no need to look further
            elif approach_date > today:
                future_approaches.append((approach_date, approach))

        if closest_approach_data is None and future_approaches:
            # Sort future approaches by date and take the closest one
            future_approaches.sort(key=lambda x: x[0]) #Sort by the first element in the tuple
            closest_approach_data = future_approaches[0][1]

        if closest_approach_data is None:
            _LOGGER.warning("No close approach data found for today or future dates.")
            return  # Exit early if no data


        _LOGGER.debug(f"Getting extra state attributes for object: {neo_data['name']}")
        name = neo_data.get("name")
        # Corrected parenthesis removal
        if name.startswith("(") and name.endswith(")"):
            name_without_brackets = name[1:-1]
            name_without_brackets = name_without_brackets.replace("+", "%20")
        else:
            name_without_brackets = name
        # If name has brackets after the first character then remove anything from the bracket onwards
        if name_without_brackets.find("(") > 1:
            name_without_brackets = name_without_brackets[0 : name.find("(")].strip()
            _LOGGER.debug(f"{name} was changed to {name_without_brackets}")
        neo_reference_id = neo_data.get("neo_reference_id")
        name_urlencoded = quote(name_without_brackets)
        horizon_url = f"https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND=%27DES%3D{neo_reference_id}%27"
        _LOGGER.debug(f"Horizon URL for {name} is {horizon_url}")

        # New code to fetch and parse data from horizon_url
        horizon_data = await self.fetch_horizon_data(horizon_url)

        if horizon_data is None:
            adist = 0
            argument_of_perihelion_wrt_ecliptic = 0
            perihelion = 0
            magnitude = 0
            epoch = 0
            ecliptic = 0
            perihelion_julian_day = 0
            semi_major_axis = 0
            perihelion_distance = 0
            mean_motion = 0
            inclination_wrt_ecliptic = 0
            longitude_of_ascending_node_wrt_ecliptic = 0
            neo_watcher_orbit_viewer_url = None
        else:
            result_text = horizon_data.get("result", "")

            adist = self._extract_value(result_text, "ADIST=")
            _LOGGER.debug(f"adist value {adist}")
            argument_of_perihelion_wrt_ecliptic = self._extract_value(result_text, "W=")
            _LOGGER.debug(
                f"argument_of_perihelion_wrt_ecliptic value {argument_of_perihelion_wrt_ecliptic}"
            )
            perihelion_str = self._extract_value(result_text, "TP=")
            perihelion = (
                float(perihelion_str) * 365.25
                if perihelion_str is not None and perihelion_str != ""
                else None
            )
            _LOGGER.debug(f"perihelion value {perihelion}")
            magnitude = self._extract_value(result_text, "MA=")
            _LOGGER.debug(f"magnitude value {magnitude}")
            epoch = self._extract_value(result_text, "EPOCH=")
            _LOGGER.debug(f"epoch value {epoch}")
            ecliptic = self._extract_value(result_text, "EC=")
            _LOGGER.debug(f"ecliptic value {ecliptic}")
            perihelion_julian_day = self._extract_value(result_text, "TP=")
            _LOGGER.debug(f"perihelion_julian_day value {perihelion_julian_day}")
            semi_major_axis = self._extract_value(result_text, "A=")
            _LOGGER.debug(f"semi_major_axis value {semi_major_axis}")
            perihelion_distance = self._extract_value(result_text, "QR=")
            _LOGGER.debug(f"perihelion_distance value {perihelion_distance}")
            mean_motion = self._extract_value(result_text, "N=")
            _LOGGER.debug(f"mean_motion value {mean_motion}")
            inclination_wrt_ecliptic = self._extract_value(result_text, "IN=")
            _LOGGER.debug(f"inclination_wrt_ecliptic value {inclination_wrt_ecliptic}")
            longitude_of_ascending_node_wrt_ecliptic = self._extract_value(
                result_text, "OM="
            )
            _LOGGER.debug(
                f"longitude_of_ascending_node_wrt_ecliptic value {longitude_of_ascending_node_wrt_ecliptic}"
            )

            neo_watcher_orbit_viewer_url = f"https://ssd.jpl.nasa.gov/ov/index.html#no-add-menu=1&elem=ad:{adist},w:{argument_of_perihelion_wrt_ecliptic},label:{quote('('+name_without_brackets+')')},per:{perihelion},ma:{magnitude},epoch:{epoch},e:{ecliptic},tp:{perihelion_julian_day},a:{semi_major_axis},q:{perihelion_distance},n:{mean_motion},i:{inclination_wrt_ecliptic},om:{longitude_of_ascending_node_wrt_ecliptic}"
            _LOGGER.debug(f"neo_watcher_orbit_viewer_url value {neo_watcher_orbit_viewer_url}")

        self._attr_extra_state_attributes = {
            "name": name,
            "nasa_jpl_url": neo_data.get("nasa_jpl_url"),
            "Neo_Watcher_Orbit_Viewer_URL": neo_watcher_orbit_viewer_url,
            "horizon_url": horizon_url,
            "absolute_magnitude_h": neo_data.get("absolute_magnitude_h"),
            "estimated_diameter_min_km": neo_data.get("estimated_diameter", {}).get(
                "kilometers", {}
            ).get("estimated_diameter_min"),
            "estimated_diameter_max_km": neo_data.get("estimated_diameter", {}).get(
                "kilometers", {}
            ).get("estimated_diameter_max"),
            "estimated_diameter_min_mi": neo_data.get("estimated_diameter", {}).get(
                "miles", {}
            ).get("estimated_diameter_min"),
            "estimated_diameter_max_mi": neo_data.get("estimated_diameter", {}).get(
                "miles", {}
            ).get("estimated_diameter_max"),
            "is_potentially_hazardous_asteroid": neo_data.get(
                "is_potentially_hazardous_asteroid"
            ),
            "close_approach_date": closest_approach_data.get("close_approach_date"),
            "close_approach_date_full": closest_approach_data.get(
                "close_approach_date_full"
            ),
            "relative_velocity_km_per_s": closest_approach_data.get(
                "relative_velocity", {}
            ).get("kilometers_per_second"),
            "relative_velocity_km_per_h": closest_approach_data.get(
                "relative_velocity", {}
            ).get("kilometers_per_hour"),
            "relative_velocity_mi_per_h": closest_approach_data.get(
                "relative_velocity", {}
            ).get("miles_per_hour"),
            "miss_distance_km": closest_approach_data.get("miss_distance", {}).get(
                "kilometers"
            ),
            "miss_distance_mi": closest_approach_data.get("miss_distance", {}).get("miles"),
            "orbiting_body": closest_approach_data.get("orbiting_body"),
            "ADIST": adist,
            "Argument_of_perihelion_wrt_ecliptic": argument_of_perihelion_wrt_ecliptic,
            "Perihelion": perihelion,
            "Magnitude": magnitude,
            "Epoch": epoch,
            "Ecliptic": ecliptic,
            "Perihelion_Julian_Day": perihelion_julian_day,
            "Semi-major_axis": semi_major_axis,
            "Perihelion distance": perihelion_distance,
            "Mean_motion": mean_motion,
            "Inclination_wrt_ecliptic": inclination_wrt_ecliptic,
            "Longitude_of_ascending_node_wrt_ecliptic": longitude_of_ascending_node_wrt_ecliptic,
            "name_urlencoded": name_urlencoded,
        }
        self.async_write_ha_state()

    def _extract_value(self, text, key):
        """Extract a numeric value directly following the key within the first 1500 characters."""

        truncated_text = text[:1500]  # Limit to the first 1500 characters

        try:
            start_index = truncated_text.find(key)
            if start_index == -1:
                return None
            start_index += len(key)
            _LOGGER.debug(f"extract_value start_index: {start_index} key: {key}")
            # Extract the numeric value
            value_str = ""
            for char in truncated_text[start_index:]:
                if char.isdigit() or char == "." or char == "-" or char == "e":
                    value_str += char
                else:
                    if char == " ":
                        # ignore it!
                        char = char
                    else:
                        break
            _LOGGER.debug(
                f"extract_value start_index: {start_index} key: {key} value_str: {value_str}"
            )
            if not value_str:
                return None

            # Check if the value is n.a.
            if value_str == "n.a.":
                return None

            # Convert to float if possible, otherwise return as string
            try:
                return float(value_str)
            except ValueError:
                return value_str.strip()

        except Exception as e:
            _LOGGER.error(f"Error extracting value for key '{key}': {e}")
            return None

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return self._attr_icon

    @property
    def unit_of_measurement(self) -> None:
        """Return the unit of measurement."""
        return None

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        _LOGGER.debug(f"Coordinator updated for {self._attr_name}")
        self.async_write_ha_state()


class NEOWatcherStatsSensor(CoordinatorEntity, SensorEntity):
    """Representation of a combined NEO Watcher stats sensor."""

    def __init__(self, coordinator: NeoWatcherCoordinator, config_data: dict[str, Any]) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        if config_data.get(CONF_NEO_SELECTION) == NEO_SELECTION_OPTIONS[1]:
            self._attr_name = "Neo Watcher Stats_" + config_data.get(CONF_SPECIFIC_NEO)
            self._attr_unique_id = "neo_watcher_stats" + config_data.get(CONF_SPECIFIC_NEO)
        else:
            self._attr_name = "Neo Watcher Stats"
            self._attr_unique_id = "neo_watcher_stats"
        self._attr_attribution = ATTRIBUTION
        self._attr_icon = "mdi:chart-timeline-variant-shimmer"  # Choose an appropriate icon
        self._rate_limit_limit = None
        self._rate_limit_remaining = None
        self._total_potentially_hazardous_objects = None
        self._total_objects = None
        self._weeks_ahead = None
        self._from_date = None
        self._to_date = None
        self._process_start_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # Capture start time
        self._last_update_time = None
        self._number_of_objects_being_watched = None
        self._config_data = config_data
        self._update_attributes()
        _LOGGER.debug(f"NEOWatcherStatsSensor initialized.{self._attr_name}")

    def _update_attributes(self):
        """Update the attributes with the latest data."""
        if self.coordinator.headers:
            self._rate_limit_limit = self.coordinator.headers.get("X-RateLimit-Limit")
            self._rate_limit_remaining = self.coordinator.headers.get("X-RateLimit-Remaining")
        self._total_potentially_hazardous_objects = len(self.coordinator.all_hazardous_objects)
        self._total_objects = len(self.coordinator.all_objects)
        self._weeks_ahead = self.coordinator.weeks_ahead
        self._from_date = self.coordinator.from_date.strftime("%Y-%m-%d") if self.coordinator.from_date else None
        self._to_date = self.coordinator.to_date.strftime("%Y-%m-%d") if self.coordinator.to_date else None
        self._last_update_time = self.coordinator.last_update_time
        if self._config_data.get(CONF_NEO_SELECTION) == NEO_SELECTION_OPTIONS[0]:
            self._number_of_objects_being_watched = self._config_data.get(CONF_TOP_NEOS)
            self._specific_neo_watched = None
        elif self._config_data.get(CONF_NEO_SELECTION) == NEO_SELECTION_OPTIONS[1]:
            self._number_of_objects_being_watched = None
            self._specific_neo_watched = self._config_data.get(CONF_SPECIFIC_NEO)
        else:
            self._number_of_objects_being_watched = None
            self._specific_neo_watched = None


    @property
    def native_value(self) -> str:
        """Return the state of the sensor."""
        return "OK"  # Or any other suitable string to indicate the sensor is working

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        attributes = {
        }
        if self._number_of_objects_being_watched is not None:
            attributes["Weeks ahead"] = self._weeks_ahead
            attributes["From date"] = self._from_date
            attributes["To date"] = self._to_date
            attributes["Number of objects being watched"] = self._number_of_objects_being_watched
            attributes["Total Near Earth Objects found"] = self._total_objects
            attributes["Total potentially hazardous Near Earth Ojects found"] = self._total_potentially_hazardous_objects

        if self._specific_neo_watched is not None:
            attributes["NEO object watched"] = self._specific_neo_watched


        attributes["Your NASA API rate limit"] = self._rate_limit_limit
        attributes["Your NASA API Rate limit remaining"] = self._rate_limit_remaining
        attributes["Process Start Time"] = self._process_start_time
        attributes["Last Update Time"] = self._last_update_time
        return attributes

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        _LOGGER.debug(f"Coordinator updated for {self._attr_name}")
        self._update_attributes()
        self.async_write_ha_state()

    @property
    def unit_of_measurement(self) -> None:
        """Return the unit of measurement."""
        return None
