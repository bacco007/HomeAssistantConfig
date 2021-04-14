"""Support for Solcast PV forecast."""
import asyncio
from datetime import datetime, timedelta, timezone
from enum import Enum
import logging

import aiohttp
from isodate import parse_datetime, parse_duration, duration_isoformat, datetime_isoformat
import voluptuous as vol
import json

from homeassistant.const import (
    CONF_API_KEY,
    EVENT_STATE_CHANGED,
    SUN_EVENT_SUNSET,
)
from homeassistant.core import EventOrigin, State, callback
from homeassistant.helpers import discovery
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.event import (
    async_call_later,
    async_track_sunrise,
    async_track_utc_time_change,
)
from homeassistant.helpers.sun import (
    get_astral_location,
    get_location_astral_event_next,
)
import homeassistant.util.dt as dt_util

_LOGGER = logging.getLogger(__name__)

DOMAIN = "solcast"

CONF_RESOURCE_ID = "resource_id"
CONF_API_LIMIT = "api_limit"
CONF_SSL_DISABLE = "disable_ssl_check"
CONF_AUTO_FORCAST = "disable_automatic_forecast_fetching"
CONF_AUTO_HISTORY = "disable_automatic_history_fetching"

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_API_KEY): cv.string,
                vol.Required(CONF_RESOURCE_ID): cv.string,
                vol.Optional(CONF_AUTO_FORCAST, default=False): cv.boolean,
                vol.Optional(CONF_AUTO_HISTORY, default=False): cv.boolean,
                vol.Optional(CONF_API_LIMIT, default=20): cv.positive_int,
                vol.Optional(CONF_SSL_DISABLE, default=False): cv.boolean,
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)

_SERVICE_MAP = {
    "update_forecast": "update_forecast_service",
    "update_history": "update_history_service",
    "push_measurement": "push_measurement_service",
}


async def async_setup(hass, config):
    """Set up solcast parameters."""
    api_key = config[DOMAIN][CONF_API_KEY]

    resource_id = config[DOMAIN][CONF_RESOURCE_ID]
    api_limit = config[DOMAIN][CONF_API_LIMIT]
    disable_ssl = config[DOMAIN][CONF_SSL_DISABLE]
    disable_auto_forecast_fetching = config[DOMAIN][CONF_AUTO_FORCAST]
    disable_auto_history_fetching = config[DOMAIN][CONF_AUTO_HISTORY]

    rooftop_site = SolcastRooftopSite(hass, api_key, resource_id, api_limit, disable_ssl, disable_auto_forecast_fetching, disable_auto_history_fetching)
    hass.data[DOMAIN] = rooftop_site

    # Load sensors
    hass.async_create_task(
        discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config)
    )

    # Register services to hass
    async def execute_service(call):
        """Execute a service to Solcast rooftop site.
        """
        function_name = _SERVICE_MAP[call.service]
        function_call = getattr(rooftop_site, function_name)
        await function_call(call.data)

    for service in _SERVICE_MAP:
        hass.services.async_register(DOMAIN, service, execute_service)

    # start periodic request of new data
    rooftop_site.start_periodic_update()
    return True


class SensorType(Enum):
    """Representation of Solcast SensorTypes."""

    forecast = 1
    history = 2
    api_count = 3


class SolcastAPI:
    """Representation of the Solcast API."""

    def __init__(self, api_key, api_limit):
        """Initialize solcast API."""

        self._api_key = api_key
        self._base_url = "https://api.solcast.com.au/"
        self._api_limit = api_limit
        self._api_remaining = self._api_limit

    async def request_data(self, path, ssl=True):
        """Request data via the Solcast API."""
        params = {"format": "json", "api_key": self._api_key}
        async with aiohttp.ClientSession() as session:
            async with session.get(
                url=f"{self._base_url}{path}", params=params, ssl=ssl
            ) as resp:
                json = await resp.json()
                status = resp.status
        if status == 429:
            _LOGGER.warning("Exceeded API rate limit")
            self._api_remaining = 0
            return False
        elif status == 400:
            _LOGGER.error(
                "The rooftop site missing capacity, please specify capacity or provide historic data for tuning."
            )
            return False
        elif status == 404:
            _LOGGER.error("The rooftop site cannot be found or is not accessible.")
            return False
        elif status == 200:
            _LOGGER.debug("get request successful")
            self._api_remaining = self._api_remaining - 1
            return json

    def get_remaining_API_count(self):
        return self._api_remaining

    def reset_api_limit(self, *args):
        self._api_remaining = self._api_limit

    async def post_data(self, path, data, ssl=True):
        """Request data via the Solcast API as json."""

        params = {"api_key": self._api_key}
        headers = {"content-type": "application/json"}
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url=f"{self._base_url}{path}", params=params, data=data, headers=headers, ssl=ssl
            ) as resp:
                text = await resp.text()
                _LOGGER.debug(f"Post {text}")
                status = resp.status
        if status == 400:
            _LOGGER.error(
                "The measurement does not pass validation (only for single measurement)."
            )
        elif status == 404:
            _LOGGER.error("The rooftop site cannot be found or is not accessible.")
        elif status == 200:
            _LOGGER.debug("post_single_measurements success")
            return True
        return False


class SolcastRooftopSite(SolcastAPI):
    """Representation of a Solcast rooftop site."""

    _states = {
        SensorType.history: None,
        SensorType.forecast: None,
        SensorType.api_count: 20
    }

    _attributes = {
        SensorType.history: {},
        SensorType.forecast: {
            "tomorrow": None,
            "the day after tomorrow": None,
            "the day after the day after tomorrow": None,
        },
        SensorType.api_count: {}
    }

    _forecasts = []
    _estimated_actuals = []

    def __init__(self, hass, api_key, resource_id, api_limit, disable_ssl, disable_auto_forecast_fetching, disable_auto_history_fetching):
        """Initialize solcast rooftop site."""

        super().__init__(api_key, api_limit)
        self._hass = hass
        self._resource_id = resource_id
        self._disable_ssl = disable_ssl
        self._disable_auto_forecast_fetching = disable_auto_forecast_fetching
        self._disable_auto_history_fetching = disable_auto_history_fetching

        self._last_processed_time_history = None
        self._forecast_entity_id = None
        self._history_entity_id = None

        self._update_listeners = []

    def get_resource_id(self):
        """Get Solcast rooftopsite resource id."""
        return self._resource_id

    def get_state(self, sensor_type):
        """Get Solcast rooftopsite states."""
        return self._states[sensor_type]

    def set_state(self, sensor_type, state):
        """Get Solcast rooftopsite states."""
        self._states[sensor_type] = state

    def get_attributes(self, sensor_type):
        """Get Solcast rooftopsite attributes."""
        return self._attributes[sensor_type]

    def start_periodic_update(self):
        """Start periodic data polling."""

        # Register API limit reset
        _LOGGER.debug("register API limit reset")
        async_track_utc_time_change(self._hass, self.reset_api_limit, hour=0, minute=0, second=0, local=True)

        @callback
        def sunrise_call_action(now=None):
            """Call action with right context."""
            next_setting = get_location_astral_event_next(
                get_astral_location(self._hass), SUN_EVENT_SUNSET, dt_util.utcnow()
            ) + timedelta(hours=1)
            _LOGGER.info(
                f"Good Morning! Time to prepare the day until the sun will set at {next_setting - timedelta(hours=1)}"
            )

            remaining_api_calls = self.get_remaining_API_count()
            delay = (next_setting - dt_util.utcnow()) / (remaining_api_calls - 1)
            _LOGGER.info(f"During the day, there will be {remaining_api_calls} updates delayed by {delay} each")

            # Schedule updates over the day (starting on 0 to process early morning update)
            for i in range(0, remaining_api_calls):
                exec_delay = delay.total_seconds() * i
                exec_time = dt_util.utcnow() + timedelta(seconds=exec_delay)

                _LOGGER.info(f"History update scheduled update at {exec_time.isoformat()}")
                async_call_later(self._hass, exec_delay, self.update_history)

        # Initial sensor update
        if not self._disable_auto_history_fetching:
            _LOGGER.debug("register initial history update in 20 seconds")
            async_call_later(self._hass, 20, self.update_history)

            # Set periodical history update
            _LOGGER.debug("register history update at sunrise")

            # Run history update
            # TEST: async_call_later(self._hass, 30, sunrise_call_action)
            async_track_sunrise(self._hass, sunrise_call_action)

        # Set daily forecast update
        if not self._disable_auto_forecast_fetching:
            _LOGGER.debug("register daily forecast update at 00:00:00")
            async_track_utc_time_change(self._hass, self.update_forecast, hour=0, minute=0, second=0, local=True)

    async def update_forecast_service(self, param=None):
        """Update forecast state service call."""
        await self.update_forecast(dt_util.utcnow())

    async def push_measurement_service(self, param=None):

        total_power = float(param["total_power"])
        period = parse_duration(param["period"])
        period_end = parse_datetime(param["period_end"])

        data = {
            "measurement": {
                "period_end": datetime_isoformat(period_end),
                "period": duration_isoformat(period),
                "total_power": total_power
            }
        }
        return await self._post_single_measurement(json.dumps(data))

    async def update_history_service(self, param=None):
        """Update history state service call."""
        await self.update_history()

    async def update_forecast(self, now, *args):
        """Update forecast state."""
        # Process it in case of successful fetching
        if not await self._fetch_forecasts():
            _LOGGER.warning("Could not fetch data from Solcast, try again next day")
        else:
            # Process data in case the forecast entity is already registered
            if self._forecast_entity_id is None:
                _LOGGER.warning(
                    "Solcast entities not yet registered, try again next day"
                )
            else:
                _LOGGER.debug("Forecast successfully fetched and entity available")

                today_start = datetime(
                    year=now.year,
                    month=now.month,
                    day=now.day,
                    hour=0,
                    minute=0,
                    tzinfo=timezone.utc,
                )
                self._states[SensorType.forecast] = round(
                    self._calculate_energy_forecast(
                        today_start, today_start + timedelta(1)
                    ),
                    2,
                )
                self._attributes[SensorType.forecast] = {
                    "tomorrow": round(
                        self._calculate_energy_forecast(
                            today_start + timedelta(1), today_start + timedelta(2)
                        ),
                        2,
                    ),
                    "the day after tomorrow": round(
                        self._calculate_energy_forecast(
                            today_start + timedelta(2), today_start + timedelta(3)
                        ),
                        2,
                    ),
                }

                # All data processed -> notify sensors for updated values
                self._notify_listeners(SensorType.forecast)
                _LOGGER.debug("Updated forecasts")

    async def update_history(self, *args):
        """Update history state."""
        # Process history data in case of successful fetching
        if await self._fetch_estimated_actuals():

            # Process data in case the history entity is already registered
            if self._history_entity_id is not None:
                _LOGGER.debug("History successfully fetched and entity available")

                update_performed = False
                # Process history data
                for estimated_actual in self._estimated_actuals:
                    start = estimated_actual["period_start"]
                    end = estimated_actual["period_end"]
                    value = estimated_actual["pv_estimate"]

                    # Process new events only
                    if (
                        self._last_processed_time_history is None
                        or start > self._last_processed_time_history
                    ):
                        _LOGGER.debug(
                            f"Process state from {start} - {end}: pv_estimate: {value}"
                        )
                        await self._fire_state_changed(
                            self._history_entity_id, value, start
                        )
                        await asyncio.sleep(5e-3)  # Wait 5ms for database persistence
                        update_performed = True

                # Set latest estimated state and last processed time history for faster processing the next time
                if update_performed:
                    self._last_processed_time_history = self._estimated_actuals[0][
                        "period_start"
                    ]
                    self._states[SensorType.history] = self._estimated_actuals[0][
                        "pv_estimate"
                    ]

                    # All data processed -> notify sensors for updated values
                    self._notify_listeners(SensorType.history)
                    _LOGGER.debug("Updated history")
            else:
                _LOGGER.warning(
                    "Solcast entities not yet registered, try again next time"
                )
        else:
            _LOGGER.warning("Could not fetch data from Solcast, try again next time")

    def add_update_listener(self, listener):
        """Add a listener for update notifications."""
        self._update_listeners.append(listener)

        if listener.get_type() is SensorType.forecast:
            self._forecast_entity_id = listener.entity_id
            _LOGGER.debug(f"registered forecast sensor {listener.entity_id}")
        elif listener.get_type() is SensorType.history:
            self._history_entity_id = listener.entity_id
            _LOGGER.debug(f"registered history sensor {listener.entity_id}")
        elif listener.get_type() is SensorType.api_count:
            _LOGGER.debug(f"registered API count sensor {listener.entity_id}")
        else:
            _LOGGER.warning("Try to register unknown sensor type")
        
        # initial data is already loaded, thus update the component
        listener.update_callback()

    def _notify_listeners(self, type=None):

        # Inform entities about updated values
        d = 0
        for listener in self._update_listeners:
            if type is None:
                # type is not defined -> inform all sensors
                listener.update_callback()
                d += 1
            elif listener.get_type() is type:
                # inform only defined type
                listener.update_callback()
                d += 1
        _LOGGER.debug("Notifying %d listeners", d)

    async def _fire_state_changed(self, entity_id, state, time):
        new_state = str(state)
        state = State(entity_id, new_state, None, time, time, None)
        self._hass.bus.async_fire(
            EVENT_STATE_CHANGED,
            {"entity_id": entity_id, "old_state": None, "new_state": state},
            EventOrigin.local,
            None,
        )

    def _calculate_energy_forecast(self, startdate, enddate):
        """Calculate the total forecasted energy for the given day."""

        e_total = 0.0
        for forecast in self._forecasts:
            f_start = forecast["period_start"]
            f_end = forecast["period_end"]
            if f_start >= startdate and f_end <= enddate:
                hours = forecast["period"].total_seconds() / 3600
                power = forecast["pv_estimate"]  # in kW
                energy = power * hours
                e_total += energy
        return e_total

    def _update_API_call_sensor(self):
        self._states[SensorType.api_count] = self.get_remaining_API_count()
        self._notify_listeners(SensorType.api_count)
        _LOGGER.debug("Updated API count sensor")

    async def _fetch_forecasts(self) -> bool:
        """Fetch the forecasts for this rooftop site."""

        resp = await self.request_data(f"/rooftop_sites/{self._resource_id}/forecasts", ssl=not self._disable_ssl)
        self._update_API_call_sensor()
        if resp is False:
            return False

        f = []
        for forecast in resp.get("forecasts"):

            # Convert period_end and period. All other fields should already be the correct type
            forecast["period_end"] = parse_datetime(forecast["period_end"])
            forecast["period"] = parse_duration(forecast["period"])
            forecast["period_start"] = forecast["period_end"] - forecast["period"]
            f.append(forecast)
        self._forecasts = f
        return True

    async def _fetch_estimated_actuals(self) -> bool:
        """Fetch the estimated (historical) actual values for this rooftop site."""

        resp = await self.request_data(
            f"/rooftop_sites/{self._resource_id}/estimated_actuals", ssl=not self._disable_ssl
        )
        self._update_API_call_sensor()
        if resp is False:
            return False

        a = []
        for estimated_actual in resp.get("estimated_actuals"):

            # Convert period_end and period. All other fields should already be the correct type
            estimated_actual["period_end"] = parse_datetime(
                estimated_actual["period_end"]
            )
            estimated_actual["period"] = parse_duration(estimated_actual["period"])
            estimated_actual["period_start"] = (
                estimated_actual["period_end"] - estimated_actual["period"]
            )
            a.append(estimated_actual)
        self._estimated_actuals = a
        return True

    async def _post_single_measurement(self, data):
        """Post single measurement."""

        return await self.post_data(
            f"/rooftop_sites/{self._resource_id}/measurements", data, ssl=not self._disable_ssl
        )
