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
    GoogleFitSensorDescription,
    SumPointsSensorDescription,
    LastPointSensorDescription,
    SumSessionSensorDescription,
)
from .const import SLEEP_STAGE, LOGGER, NANOSECONDS_SECONDS_CONVERSION


class AsyncConfigEntryAuth(OAuthClientAuthHandler):
    """Provide Google Fit authentication tied to an OAuth2 based config entry."""

    def __init__(
        self,
        websession: ClientSession,
        oauth2Session: config_entry_oauth2_flow.OAuth2Session,
    ) -> None:
        """Initialise Google Fit Auth."""
        LOGGER.debug("Initialising Google Fit Authentication Session")
        self.oauth_session = oauth2Session
        self.discovery_cache = SimpleDiscoveryCache()
        super().__init__(websession)

    @property
    def access_token(self) -> str:
        """Return the access token."""
        return self.oauth_session.token[CONF_ACCESS_TOKEN]

    async def check_and_refresh_token(self) -> str:
        """Check the token."""
        LOGGER.debug("Verifying account access token")
        await self.oauth_session.async_ensure_token_valid()
        return self.access_token

    async def get_resource(self, hass: HomeAssistant) -> FitService:
        """Get current resource."""

        try:
            credentials = Credentials(await self.check_and_refresh_token())
            LOGGER.debug("Successfully retrieved existing access credentials.")
        except RefreshError as ex:
            LOGGER.warning(
                "Failed to refresh account access token. Starting re-authentication."
            )
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
    unknown_sleep_warn: bool

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
            awakeSeconds=0,
            sleepSeconds=0,
            lightSleepSeconds=0,
            deepSleepSeconds=0,
            remSleepSeconds=0,
            heartRate=None,
            heartRateResting=None,
            bloodPressureSystolic=None,
            bloodPressureDiastolic=None,
            bloodGlucose=None,
            hydration=None,
            oxygenSaturation=None,
        )
        self.unknown_sleep_warn = False

    def _sum_points_int(self, response: FitnessObject) -> int:
        """Get the most recent integer point value.

        If no data points exist, return 0.
        """
        counter = 0
        found_value = False
        for point in response.get("point"):
            value = point.get("value")[0].get("intVal")
            if value is not None:
                found_value = True
                counter += value

        if not found_value:
            LOGGER.debug(
                "No int data points found for %s", response.get("dataSourceId")
            )

        return counter

    def _sum_points_float(self, response: FitnessObject) -> float:
        """Get the most recent floating point value.

        If no data points exist, return 0.
        """
        counter = 0
        found_value = False
        for point in response.get("point"):
            value = point.get("value")[0].get("fpVal")
            if value is not None:
                found_value = True
                counter += value

        if not found_value:
            LOGGER.debug(
                "No float data points found for %s", response.get("dataSourceId")
            )

        return round(counter, 2)

    def _get_latest_data_float(
        self, response: FitnessDataPoint, index: int = 0
    ) -> float | None:
        """Get the most recent floating point value.

        If no data exists in the account return None.
        """
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
            LOGGER.debug(
                "No float data points found for %s", response.get("dataSourceId")
            )
        return value

    def _get_latest_data_int(
        self, response: FitnessDataPoint, index: int = 0
    ) -> int | None:
        """Get the most recent integer point value.

        If no data exists in the account return None.
        """
        value = None
        data_points = response.get("insertedDataPoint")
        latest_time = 0
        for point in data_points:
            if int(point.get("endTimeNanos")) > latest_time:
                values = point.get("value")
                if len(values) > 0:
                    value = values[index].get("intVal")
                    if value is not None:
                        # Update the latest found time and update the value
                        latest_time = int(point.get("endTimeNanos"))
        if value is None:
            LOGGER.debug(
                "No int data points found for %s", response.get("dataSourceId")
            )
        return value

    def _parse_sleep(self, response: FitnessObject) -> None:
        data_points = response.get("point")

        for point in data_points:
            sleep_type = point.get("value")[0].get("intVal")
            start_time_ns = point.get("startTimeNanos")
            end_time_ns = point.get("endTimeNanos")
            if (
                sleep_type is not None
                and start_time_ns is not None
                and end_time_ns is not None
            ):
                sleep_stage = SLEEP_STAGE.get(sleep_type)
                start_time = int(start_time_ns) / NANOSECONDS_SECONDS_CONVERSION
                start_time_str = datetime.fromtimestamp(start_time).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )
                end_time = int(end_time_ns) / NANOSECONDS_SECONDS_CONVERSION
                end_time_str = datetime.fromtimestamp(end_time).strftime(
                    "%Y-%m-%d %H:%M:%S"
                )

                if sleep_stage == "Out-of-bed":
                    LOGGER.debug("Out of bed sleep sensor not supported. Ignoring.")
                elif sleep_stage == "unspecified":
                    LOGGER.warning(
                        "Google Fit reported an unspecified or unknown value "
                        "for sleep stage between %s and %s. Please report this as a bug to the "
                        "original data provider. This will not be reported in "
                        "Home Assistant.",
                        start_time_str,
                        end_time_str,
                    )
                elif sleep_stage is not None:
                    if end_time >= start_time:
                        self.data[sleep_stage] += end_time - start_time
                    else:
                        raise UpdateFailed(
                            "Invalid data from Google. End time "
                            f"({end_time_str}) is less than the start time "
                            f"({start_time_str})."
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

    def _parse_object(
        self, entity: SumPointsSensorDescription, response: FitnessObject
    ) -> None:
        """Parse the given fit object from the API according to the passed request_id."""
        # Sleep data needs to be handled separately
        if entity.is_sleep:
            self._parse_sleep(response)
        else:
            if entity.is_int:
                self.data[entity.data_key] = self._sum_points_int(response)
            else:
                self.data[entity.data_key] = self._sum_points_float(response)

    def _parse_session(
        self, entity: SumSessionSensorDescription, response: FitnessSessionResponse
    ) -> None:
        """Parse the given session data from the API according to the passed request_id."""
        # Sum all the session times (in milliseconds) from within the response
        summed_millis: int = 0
        sessions = response.get("session")
        if sessions is None:
            raise UpdateFailed(
                f"Google Fit returned invalid session data for source: {entity.source}.\r"
                "Session data is None."
            )
        for session in sessions:
            summed_millis += int(session.get("endTimeMillis")) - int(
                session.get("startTimeMillis")
            )

        # Time is in milliseconds, need to convert to seconds
        self.data[entity.data_key] = summed_millis / 1000

    def _parse_point(
        self, entity: LastPointSensorDescription, response: FitnessDataPoint
    ) -> None:
        """Parse the given single data point from the API according to the passed request_id."""
        if entity.is_int:
            self.data[entity.data_key] = self._get_latest_data_int(
                response, entity.index
            )
        else:
            self.data[entity.data_key] = self._get_latest_data_float(
                response, entity.index
            )

    def parse(
        self,
        entity: GoogleFitSensorDescription,
        fit_object: FitnessObject | None = None,
        fit_point: FitnessDataPoint | None = None,
        fit_session: FitnessSessionResponse | None = None,
    ) -> None:
        """Parse the given fit object or point according to the entity type.

        Only one fit_ type object should be specified.
        """
        if isinstance(entity, SumPointsSensorDescription):
            if fit_object is not None:
                self._parse_object(entity, fit_object)
            else:
                raise UpdateFailed(
                    "Bad Google Fit parse call. "
                    + "FitnessObject must not be None for summed sensor type"
                )
        elif isinstance(entity, LastPointSensorDescription):
            if fit_point is not None:
                self._parse_point(entity, fit_point)
            else:
                raise UpdateFailed(
                    "Bad Google Fit parse call. "
                    + "FitnessDataPoint must not be None for last point sensor type"
                )
        elif isinstance(entity, SumSessionSensorDescription):
            if fit_session is not None:
                self._parse_session(entity, fit_session)
            else:
                raise UpdateFailed(
                    "Bad Google Fit parse call. "
                    + "FitnessSessionResponse must not be None for sum session sensor type"
                )
        else:
            raise UpdateFailed(
                "Invalid parse call. "
                + "A fit type object must be passed to be parsed."
            )

    @property
    def fit_data(self) -> FitnessData:
        """Returns the local data. Should be called after parse."""
        return self.data
