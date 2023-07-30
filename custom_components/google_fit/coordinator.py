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
    FitService,
    FitnessData,
    FitnessObject,
    FitnessDataPoint,
    FitnessSessionResponse,
)
from .const import (
    DOMAIN,
    LOGGER,
    ENTITY_DESCRIPTIONS,
    DEFAULT_SCAN_INTERVAL,
    DEFAULT_NO_DATA_USE_ZERO,
    CONF_NO_DATA_USE_ZERO,
)


# https://developers.home-assistant.io/docs/integration_fetching_data#coordinated-single-api-poll-for-data-for-all-entities
class Coordinator(DataUpdateCoordinator):
    """Class to manage fetching data from the API."""

    _auth: AsyncConfigEntryAuth
    _config: ConfigEntry
    fitness_data: FitnessData | None = None
    _use_zero: bool

    def __init__(
        self,
        hass: HomeAssistant,
        auth: AsyncConfigEntryAuth,
        config: ConfigEntry,
    ) -> None:
        """Initialise."""
        self._auth = auth
        self._config = config
        self._use_zero = config.options.get(
            CONF_NO_DATA_USE_ZERO, DEFAULT_NO_DATA_USE_ZERO
        )
        update_time = config.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        LOGGER.debug(
            "Setting up Google Fit Coordinator. Use zero=%s and updating every %u minutes",
            str(self._use_zero),
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

    @property
    def use_zero(self) -> bool:
        """Return the config option on whether to use zero for when there is no sensor data."""
        return self._use_zero

    def _get_interval(self, midnight_reset: bool = True) -> str:
        """Return the necessary interval for API queries, with start and end time in nanoseconds.

        If midnight_reset is true, start time is considered to be midnight of that day.
        If false, start time is considered to be exactly 24 hours ago.
        """
        start = 0
        if midnight_reset:
            start = (
                int(
                    datetime.combine(
                        datetime.today().date(), datetime.min.time()
                    ).timestamp()
                )
                * 1000000000
            )
        # Make start time exactly 24 hours ago
        else:
            start = (int(datetime.today().timestamp()) - 60 * 60 * 24) * 1000000000
        now = int(datetime.today().timestamp() * 1000000000)
        return f"{start}-{now}"

    async def _async_update_data(self) -> FitService | None:
        """Update data via library."""
        LOGGER.debug(
            "Fetching data for account %s",
            self._auth.oauth_session.config_entry.unique_id,
        )
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
                    if entity.data_key in [
                        "activeMinutes",
                        "calories",
                        "distance",
                        "heartMinutes",
                        "steps",
                        "hydration",
                    ]:
                        dataset = self._get_interval()
                        response = await self.hass.async_add_executor_job(
                            _get_data, entity.source, dataset
                        )
                        parser.parse(entity.data_key, fit_object=response)
                    elif entity.data_key in [
                        "awakeSeconds",
                        "lightSleepSeconds",
                        "deepSleepSeconds",
                        "remSleepSeconds",
                    ]:
                        # Only need to call once to get all different sleep segments
                        if fetched_sleep is False:
                            dataset = self._get_interval(False)
                            response = await self.hass.async_add_executor_job(
                                _get_data, entity.source, dataset
                            )
                            fetched_sleep = True
                            parser.parse(entity.data_key, fit_object=response)
                    elif entity.data_key == "sleepSeconds":
                        response = await self.hass.async_add_executor_job(
                            _get_session, 72
                        )
                        parser.parse(entity.data_key, fit_session=response)
                    # Single data point fetches
                    else:
                        response = await self.hass.async_add_executor_job(
                            _get_data_changes, entity.source
                        )
                        parser.parse(entity.data_key, fit_point=response)

                self.fitness_data = parser.fit_data

        except HttpError as err:
            if 400 <= err.status_code < 500:
                raise ConfigEntryAuthFailed(
                    "OAuth session is not valid, re-authentication required."
                ) from err
            raise err
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}") from err
