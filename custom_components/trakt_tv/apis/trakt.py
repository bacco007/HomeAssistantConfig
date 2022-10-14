"""API for TraktTV bound to Home Assistant OAuth."""
import json
import logging
from asyncio import gather
from datetime import datetime

import pytz
from aiohttp import ClientResponse, ClientSession
from async_timeout import timeout
from homeassistant.core import HomeAssistant
from homeassistant.helpers.config_entry_oauth2_flow import OAuth2Session

from custom_components.trakt_tv.utils import compute_calendar_args

from ..configuration import Configuration
from ..const import API_HOST, DOMAIN
from ..models.kind import BASIC_KINDS, TraktKind
from ..models.media import Medias
from ..utils import deserialize_json

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

    async def fetch_watched(self, excluded_shows: list):
        response = await self.request("get", f"sync/watched/shows?extended=noseasons")
        raw_shows = await response.json()
        raw_medias = []
        for show in raw_shows:
            try:
                ids = show["show"]["ids"]
                is_excluded = ids["slug"] in excluded_shows
            except IndexError:
                is_excluded = False

            if is_excluded:
                continue

            try:
                response_progress = await self.fetch_show_progress(ids["trakt"])
                raw_episode = await response_progress.json()
                if raw_episode.get("next_episode") is not None:
                    if raw_episode["next_episode"].get("season") is not None:
                        response_episode = await self.fetch_show_informations(
                            ids["trakt"],
                            raw_episode["next_episode"].get("season"),
                            raw_episode["next_episode"].get("number"),
                        )
                        raw_episode_full = await response_episode.json()
                        show["episode"] = raw_episode_full
                        show["first_aired"] = raw_episode_full["first_aired"]
                        raw_medias.append(show)
            except IndexError:
                LOGGER.warning("Show %s doesn't contain any trakt ID", ids["slug"])
                continue

        return raw_medias

    async def fetch_show_progress(self, id: str):
        return await self.request("get", f"shows/{id}/progress/watched")

    async def fetch_show_informations(
        self, show_id: str, season_nbr: str, episode_nbr: str
    ):
        return await self.request(
            "get",
            f"shows/{show_id}/seasons/{season_nbr}/episodes/{episode_nbr}?extended=full",
        )

    async def fetch_upcoming(
        self, trakt_kind: TraktKind, all_medias: bool, next_to_watch: bool
    ):
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

        if (
            not configuration.upcoming_identifier_exists(identifier, all_medias)
        ) and not (configuration.next_to_watch_identifier_exists(identifier)):
            return None

        if next_to_watch and trakt_kind.value.identifier != "show":
            return None

        configuration = Configuration(data=self.hass.data)

        max_medias = configuration.get_upcoming_max_medias(identifier, all_medias)
        language = configuration.get_language()
        only_aired = False

        if next_to_watch:
            excluded_shows = configuration.get_exclude_shows(identifier)
            only_aired = configuration.get_only_aired(identifier)
            raw_medias = await self.fetch_watched(excluded_shows)
        else:
            days_to_fetch = configuration.get_upcoming_days_to_fetch(
                identifier, all_medias
            )
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

        if next_to_watch:
            if only_aired:
                timezoned_now = datetime.now(
                    pytz.timezone(configuration.get_timezone())
                )
                new_medias = [
                    media for media in medias if media.released < timezoned_now
                ]
            else:
                new_medias = medias
        else:
            timezoned_now = datetime.now(pytz.timezone(configuration.get_timezone()))
            new_medias = [media for media in medias if media.released >= timezoned_now]

        await gather(*[media.get_more_information(language) for media in new_medias])

        return trakt_kind, Medias(new_medias)

    async def fetch_next_to_watch(self):
        data = await gather(
            *[self.fetch_upcoming(kind, False, True) for kind in TraktKind]
        )
        data = filter(lambda x: x is not None, data)
        return {trakt_kind: medias for trakt_kind, medias in data}

    async def fetch_upcomings(self, all_medias: bool):
        data = await gather(
            *[self.fetch_upcoming(kind, all_medias, False) for kind in TraktKind]
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
            raw_medias = deserialize_json(payload)
            medias = [trakt_kind.value.model.from_trakt(media) for media in raw_medias]
            await gather(*[media.get_more_information(language) for media in medias])
            res[trakt_kind] = Medias(medias)
        return res

    async def retrieve_data(self):
        async with timeout(60):
            titles = ["upcoming", "all_upcoming", "recommendation", "next_to_watch"]
            data = await gather(
                *[
                    self.fetch_upcomings(all_medias=False),
                    self.fetch_upcomings(all_medias=True),
                    self.fetch_recommendations(),
                    self.fetch_next_to_watch(),
                ]
            )
            return {title: medias for title, medias in zip(titles, data)}
