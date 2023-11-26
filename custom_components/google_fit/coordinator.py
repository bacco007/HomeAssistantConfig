"""DataUpdateCoordinator for Google Fit."""
from __future__ import annotations

from datetime import timedelta, datetime
import async_timeout
from googleapiclient.http import HttpError
from homeassistant.config_entries import ConfigEntry
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)
from homeassistant.helpers.config_entry_oauth2_flow import OAuth2Session
from homeassistant.const import CONF_SCAN_INTERVAL

from .api import AsyncConfigEntryAuth, GoogleFitParse
from .api_types import (
    FitnessData,
    FitnessObject,
    FitnessDataPoint,
    FitnessSessionResponse,
    SumPointsSensorDescription,
    LastPointSensorDescription,
    SumSessionSensorDescription,
)
from .const import (
    DOMAIN,
    LOGGER,
    ENTITY_DESCRIPTIONS,
    DEFAULT_SCAN_INTERVAL,
    NANOSECONDS_SECONDS_CONVERSION,
)


# https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
class Coordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    _auth: AsyncConfigEntryAuth
    _config: ConfigEntry
    fitness_data: FitnessData | None = None

    def __init__(
        self,
        hass: HomeAssistant,
        auth: AsyncConfigEntryAuth,
        config: ConfigEntry,
    ) -> None:
        """Initialise."""
        self._auth = auth
        self._config = config
        update_time = config.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        LOGGER.debug(
            "Setting up Google Fit Coordinator. Updating every %u minutes",
            update_time,
        )
        super().__init__(
            hass=hass,
            logger=LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=update_time),
        )

    @property
    def oauth_session(self) -> OAuth2Session | None:
        """Returns the OAuth Session associated with the coordinator, or None if not available."""
        if self._auth is None:
            return None
        return self._auth.oauth_session

    @property
    def current_data(self) -> FitnessData | None:
        """Return the current data, or None is data is not available."""
        return self.fitness_data

    def _get_interval(self, interval_period: int = 0) -> str:
        """Return the necessary interval for API queries, with start and end time in nanoseconds.

        If midnight_reset is true, start time is considered to be midnight of that day.
        If false, start time is considered to be exactly 24 hours ago.
        """
        start = 0
        if interval_period == 0:
            start = (
                int(
                    datetime.combine(
                        datetime.today().date(), datetime.min.time()
                    ).timestamp()
                )
                * NANOSECONDS_SECONDS_CONVERSION
            )
        else:
            start = (int(datetime.today().timestamp()) - interval_period)
            start = start * NANOSECONDS_SECONDS_CONVERSION
        now = int(datetime.today().timestamp() * NANOSECONDS_SECONDS_CONVERSION)
        return f"{start}-{now}"

    async def _async_update_data(self) -> FitnessData | None:
        """Update data via library."""
        LOGGER.debug(
            "Fetching data for account %s",
            self._auth.oauth_session.config_entry.unique_id,
        )

        # Start by initialising data to None
        self.fitness_data = None
        try:
            async with async_timeout.timeout(30):
                service = await self._auth.get_resource(self.hass)
                parser = GoogleFitParse()

                def _get_data(source: str, dataset: str) -> FitnessObject:
                    return (
                        service.users()
                        .dataSources()
                        .datasets()
                        .get(userId="me", dataSourceId=source, datasetId=dataset)
                        .execute()
                    )

                def _get_data_changes(source: str) -> FitnessDataPoint:
                    return (
                        service.users()
                        .dataSources()
                        .dataPointChanges()
                        .list(userId="me", dataSourceId=source)
                        .execute()
                    )

                def _get_session(activity_id: int) -> FitnessSessionResponse:
                    """Return a list of sessions for the activity whose end time was in last 24h."""
                    end_time = datetime.utcnow().isoformat() + "Z"
                    start_time = (
                        datetime.utcnow() - timedelta(days=1)
                    ).isoformat() + "Z"
                    return (
                        service.users()
                        .sessions()
                        .list(
                            userId="me",
                            activityType=activity_id,
                            startTime=start_time,
                            endTime=end_time,
                        )
                        .execute()
                    )

                fetched_sleep = False
                for entity in ENTITY_DESCRIPTIONS:
                    if isinstance(entity, SumPointsSensorDescription):
                        # Only need to call once to get all different sleep segments
                        if entity.is_sleep and fetched_sleep:
                            continue

                        dataset = self._get_interval(entity.period_seconds)
                        response = await self.hass.async_add_executor_job(
                            _get_data, entity.source, dataset
                        )

                        if entity.is_sleep:
                            fetched_sleep = True

                        parser.parse(entity, fit_object=response)
                    elif isinstance(entity, LastPointSensorDescription):
                        response = await self.hass.async_add_executor_job(
                            _get_data_changes, entity.source
                        )
                        parser.parse(entity, fit_point=response)
                    elif isinstance(entity, SumSessionSensorDescription):
                        response = await self.hass.async_add_executor_job(
                            _get_session, entity.activity_id
                        )
                        parser.parse(entity, fit_session=response)
                    else:
                        raise UpdateFailed(
                            f"Unknown sensor type for {entity.data_key}. Got: {type(entity)}"
                        )

                # Update globally stored data with fetched and parsed data
                self.fitness_data = parser.fit_data
        except HttpError as err:
            if 400 <= err.status_code < 500:
                raise ConfigEntryAuthFailed(
                    "OAuth session is not valid, re-authentication required."
                ) from err
            raise err
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err

        return self.fitness_data
