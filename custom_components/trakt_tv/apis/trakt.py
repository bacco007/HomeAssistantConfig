"""API for TraktTV bound to Home Assistant OAuth."""
import json
import logging
from asyncio import gather

from aiohttp import ClientResponse, ClientSession
from async_timeout import timeout
from homeassistant.core import HomeAssistant
from homeassistant.helpers.config_entry_oauth2_flow import OAuth2Session

from custom_components.trakt_tv.utils import compute_calendar_args

from ..configuration import Configuration
from ..const import API_HOST, DOMAIN
from ..models.kind import BASIC_KINDS, TraktKind
from ..models.media import Medias

LOGGER = logging.getLogger(__name__)


class TraktApi:
    """Provide TraktTV authentication tied to an OAuth2 based config entry."""

    def __init__(
        self,
        websession: ClientSession,
        oauth_session: OAuth2Session,
        hass: HomeAssistant,
    ):
        """Initialize TraktTV auth."""
        self.web_session = websession
        self.host = API_HOST
        self.oauth_session = oauth_session
        self.hass = hass

    async def async_get_access_token(self) -> str:
        """Return a valid access token."""
        if not self.oauth_session.valid_token:
            await self.oauth_session.async_ensure_token_valid()

        return self.oauth_session.token["access_token"]

    async def request(self, method, url, **kwargs) -> ClientResponse:
        """Make a request."""
        access_token = await self.async_get_access_token()
        client_id = self.hass.data[DOMAIN]["configuration"]["client_id"]
        headers = {
            **kwargs.get("headers", {}),
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
            "trakt-api-version": "2",
            "trakt-api-key": client_id,
        }

        return await self.web_session.request(
            method,
            f"{self.host}/{url}",
            **kwargs,
            headers=headers,
        )

    async def fetch_calendar(
        self, path: str, from_date: str, nb_days: int, all_medias: bool
    ):
        root = "all" if all_medias else "my"
        return await self.request(
            "get", f"calendars/{root}/{path}/{from_date}/{nb_days}"
        )

    async def fetch_upcoming(self, trakt_kind: TraktKind, all_medias: bool):
        """
        Fetch the calendar of the user trakt account based on the trak_type containing
        the calendar type.

        Since the maximum number of days to fetch using trakt API is 33 days, we have to
        make multiple API calls if we want to retrieve a larger amount of time.

        :param trak_type: The TraktKind describing which calendar we should request
        """
        configuration = Configuration(data=self.hass.data)
        path = trakt_kind.value.path
        identifier = trakt_kind.value.identifier

        if not configuration.upcoming_identifier_exists(identifier, all_medias):
            return None

        configuration = Configuration(data=self.hass.data)
        days_to_fetch = configuration.get_upcoming_days_to_fetch(identifier, all_medias)
        max_medias = configuration.get_upcoming_max_medias(identifier, all_medias)
        language = configuration.get_language()

        calendar_args = compute_calendar_args(days_to_fetch, 33)

        responses = await gather(
            *[
                self.fetch_calendar(path, args[0], args[1], all_medias)
                for args in calendar_args
            ]
        )
        data = await gather(*[response.text() for response in responses])
        raw_medias = [media for medias in data for media in json.loads(medias)]
        raw_medias = raw_medias[0:max_medias]
        medias = [trakt_kind.value.model.from_trakt(media) for media in raw_medias]

        await gather(*[media.get_more_information(language) for media in medias])

        return trakt_kind, Medias(medias)

    async def fetch_upcomings(self, all_medias: bool):
        data = await gather(
            *[self.fetch_upcoming(kind, all_medias) for kind in TraktKind]
        )
        data = filter(lambda x: x is not None, data)
        return {trakt_kind: medias for trakt_kind, medias in data}

    async def fetch_recommendation(self, path: str, max_items: int):
        return await self.request(
            "get", f"recommendations/{path}?limit={max_items}&ignore_collected=false"
        )

    async def fetch_recommendations(self):
        configuration = Configuration(data=self.hass.data)
        language = configuration.get_language()
        responses = await gather(
            *[
                self.fetch_recommendation(
                    kind.value.path,
                    configuration.get_recommendation_max_medias(kind.value.identifier),
                )
                for kind in BASIC_KINDS
            ]
        )
        data = await gather(*[response.text() for response in responses])
        res = {}
        for trakt_kind, payload in zip(BASIC_KINDS, data):
            raw_medias = json.loads(payload)
            medias = [trakt_kind.value.model.from_trakt(media) for media in raw_medias]
            await gather(*[media.get_more_information(language) for media in medias])
            res[trakt_kind] = Medias(medias)
        return res

    async def retrieve_data(self):
        async with timeout(60):
            titles = ["upcoming", "all_upcoming", "recommendation"]
            data = await gather(
                *[
                    self.fetch_upcomings(all_medias=False),
                    self.fetch_upcomings(all_medias=True),
                    self.fetch_recommendations(),
                ]
            )
            return {title: medias for title, medias in zip(titles, data)}
