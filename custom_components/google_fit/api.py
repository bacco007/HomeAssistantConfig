"""API for Google Fit bound to Home Assistant OAuth."""
from datetime import datetime
from aiohttp import ClientSession
from google.auth.exceptions import RefreshError
from google.oauth2.credentials import Credentials
from google.oauth2.utils import OAuthClientAuthHandler
from googleapiclient.discovery import build
from googleapiclient.discovery_cache.base import Cache

from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_ACCESS_TOKEN
from homeassistant.helpers import config_entry_oauth2_flow
from homeassistant.helpers.update_coordinator import UpdateFailed

from .api_types import (
    FitService,
    FitnessData,
    FitnessObject,
    FitnessDataPoint,
    FitnessSessionResponse,
)
from .const import SLEEP_STAGE, LOGGER


class AsyncConfigEntryAuth(OAuthClientAuthHandler):
    """Provide Google Fit authentication tied to an OAuth2 based config entry."""

    def __init__(
        self,
        websession: ClientSession,
        oauth2Session: config_entry_oauth2_flow.OAuth2Session,
    ) -> None:
        """Initialise Google Fit Auth."""
        self.oauth_session = oauth2Session
        self.discovery_cache = SimpleDiscoveryCache()
        super().__init__(websession)

    @property
    def access_token(self) -> str:
        """Return the access token."""
        return self.oauth_session.token[CONF_ACCESS_TOKEN]

    async def check_and_refresh_token(self) -> str:
        """Check the token."""
        await self.oauth_session.async_ensure_token_valid()
        return self.access_token

    async def get_resource(self, hass: HomeAssistant) -> FitService:
        """Get current resource."""

        try:
            credentials = Credentials(await self.check_and_refresh_token())
        except RefreshError as ex:
            self.oauth_session.config_entry.async_start_reauth(self.oauth_session.hass)
            raise ex

        def get_fitness() -> FitService:
            return build(
                "fitness",
                "v1",
                credentials=credentials,
                cache=self.discovery_cache,
                static_discovery=False,
            )

        return await hass.async_add_executor_job(get_fitness)


class SimpleDiscoveryCache(Cache):
    """A very simple discovery cache."""

    def __init__(self) -> None:
        """Cache Initialisation."""
        self._data = {}

    def get(self, url):
        """Cache Getter (if available)."""
        if url in self._data:
            return self._data[url]
        return None

    def set(self, url, content) -> None:
        """Cache Setter."""
        self._data[url] = content


class GoogleFitParse:
    """Parse raw data received from the Google Fit API."""

    data: FitnessData

    def __init__(self):
        """Initialise the data to base value and add a timestamp."""
        self.data = FitnessData(
            lastUpdate=datetime.now(),
            activeMinutes=None,
            calories=None,
            basalMetabolicRate=None,
            distance=None,
            heartMinutes=None,
            height=None,
            weight=None,
            bodyFat=None,
            bodyTemperature=None,
            steps=None,
            awakeSeconds=None,
            sleepSeconds=None,
            lightSleepSeconds=None,
            deepSleepSeconds=None,
            remSleepSeconds=None,
            heartRate=None,
            heartRateResting=None,
            bloodPressureSystolic=None,
            bloodPressureDiastolic=None,
            bloodGlucose=None,
            hydration=None,
            oxygenSaturation=None,
        )

    def _sum_points_int(self, response: FitnessObject) -> int | None:
        counter = 0
        found_value = False
        for point in response.get("point"):
            value = point.get("value")[0].get("intVal")
            if value is not None:
                found_value = True
                counter += value
        if found_value:
            return counter
        # If no value is found, return None to keep sensor value as "Unknown"
        LOGGER.debug("No int data points found for %s", response.get("dataSourceId"))
        return None

    def _sum_points_float(self, response: FitnessObject) -> float | None:
        counter = 0
        found_value = False
        for point in response.get("point"):
            value = point.get("value")[0].get("fpVal")
            if value is not None:
                found_value = True
                counter += value
        if found_value:
            return round(counter, 2)
        # If no value is found, return None to keep sensor value as "Unknown"
        LOGGER.debug("No float data points found for %s", response.get("dataSourceId"))
        return None

    def _get_latest_data_point(
        self, response: FitnessDataPoint, index: int = 0
    ) -> float | None:
        value = None
        data_points = response.get("insertedDataPoint")
        latest_time = 0
        for point in data_points:
            if int(point.get("endTimeNanos")) > latest_time:
                values = point.get("value")
                if len(values) > 0:
                    data_point = values[index].get("fpVal")
                    if data_point is not None:
                        # Update the latest found time and update the value
                        latest_time = int(point.get("endTimeNanos"))
                        value = round(data_point, 2)
        if value is None:
            LOGGER.debug("No data points found for %s", response.get("dataSourceId"))
        return value

    def _parse_sleep(self, response: FitnessObject) -> None:
        found_point = False
        data_points = response.get("point")

        for point in data_points:
            found_point = True
            sleep_type = point.get("value")[0].get("intVal")
            start_time = point.get("startTimeNanos")
            end_time = point.get("endTimeNanos")
            if (
                sleep_type is not None
                and start_time is not None
                and end_time is not None
            ):
                sleep_stage = SLEEP_STAGE.get(sleep_type)
                if sleep_stage == "Out-of-bed":
                    LOGGER.debug("Out of bed sleep sensor not supported. Ignoring.")
                elif sleep_stage is not None:
                    # If field is still at None, initialise it to zero
                    if self.data[sleep_stage] is None:
                        self.data[sleep_stage] = 0

                    if end_time >= start_time:
                        self.data[sleep_stage] += (
                            int(end_time) - int(start_time)
                        ) / 1000000000
                    else:
                        raise UpdateFailed(
                            "Invalid data from Google. End time "
                            f"({end_time}) is less than the start time "
                            f"({start_time})."
                        )
                else:
                    raise UpdateFailed(
                        f"Unknown sleep stage type. Got enum: {sleep_type}"
                    )
            else:
                raise UpdateFailed(
                    "Invalid data from Google. Got:\r"
                    "Sleep Type: {sleep_type}\r"
                    "Start Time (ns): {start_time}\r"
                    "End Time (ns): {end_time}"
                )

        if found_point is False:
            LOGGER.debug(
                "No sleep type data points found. Values will be set to configured default."
            )

    def _parse_object(self, request_id: str, response: FitnessObject) -> None:
        """Parse the given fit object from the API according to the passed request_id."""
        # Sensor types where data is returned as integer and needs summing
        if request_id in ["activeMinutes", "steps"]:
            self.data[request_id] = self._sum_points_int(response)
        # Sensor types where data is returned as float and needs summing
        elif request_id in ["calories", "distance", "heartMinutes", "hydration"]:
            self.data[request_id] = self._sum_points_float(response)
        # Sleep types need special handling to determine sleep segment type
        elif request_id in [
            "awakeSeconds",
            "lightSleepSeconds",
            "deepSleepSeconds",
            "remSleepSeconds",
        ]:
            self._parse_sleep(response)
        else:
            raise UpdateFailed(
                f"Unknown request ID specified for parsing: {request_id}"
            )

    def _parse_session(self, request_id: str, response: FitnessSessionResponse) -> None:
        """Parse the given session data from the API according to the passed request_id."""
        if request_id == "sleepSeconds":
            # Sum all the session times (in milliseconds) from within the response
            summed_millis: int | None = None
            sessions = response.get("session")
            if sessions is None:
                raise UpdateFailed(
                    "Google Fit returned invalid sleep session data. Session data is None."
                )
            for session in sessions:
                # Initialise data is it is None
                if summed_millis is None:
                    summed_millis = 0

                summed_millis += int(session.get("endTimeMillis")) - int(
                    session.get("startTimeMillis")
                )

            if summed_millis is not None:
                # Time is in milliseconds, need to convert to seconds
                self.data["sleepSeconds"] = summed_millis / 1000
            else:
                LOGGER.debug(
                    "No sleep sessions found for time period in Google Fit account."
                )
        else:
            raise UpdateFailed(
                f"Unknown request ID specified for parsing: {request_id}"
            )

    def _parse_point(self, request_id: str, response: FitnessDataPoint) -> None:
        """Parse the given single data point from the API according to the passed request_id."""
        if request_id in [
            "height",
            "weight",
            "basalMetabolicRate",
            "bodyFat",
            "bodyTemperature",
            "heartRate",
            "heartRateResting",
            "bloodPressureSystolic",
            "bloodGlucose",
            "oxygenSaturation",
        ]:
            self.data[request_id] = self._get_latest_data_point(response)
        elif request_id == "bloodPressureDiastolic":
            self.data[request_id] = self._get_latest_data_point(response, 1)
        else:
            raise UpdateFailed(
                f"Unknown request ID specified for parsing: {request_id}"
            )

    def parse(
        self,
        request_id: str,
        fit_object: FitnessObject | None = None,
        fit_point: FitnessDataPoint | None = None,
        fit_session: FitnessSessionResponse | None = None,
    ) -> None:
        """Parse the given fit object or point according to request_id.

        Only one fit_ type object should be specified.
        """
        if fit_object is not None:
            self._parse_object(request_id, fit_object)
        elif fit_point is not None:
            self._parse_point(request_id, fit_point)
        elif fit_session is not None:
            self._parse_session(request_id, fit_session)
        else:
            raise UpdateFailed(
                "Invalid parse call." + "A fit type object must be passed to be parsed."
            )

    @property
    def fit_data(self) -> FitnessData:
        """Returns the local data. Should be called after parse."""
        return self.data
