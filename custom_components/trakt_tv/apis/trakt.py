"""API for TraktTV bound to Home Assistant OAuth."""

import logging
from asyncio import gather, sleep
from datetime import datetime
from typing import Any, Dict

import pytz
from aiohttp import ClientResponse, ClientSession
from async_timeout import timeout
from homeassistant.core import HomeAssistant
from homeassistant.helpers.config_entry_oauth2_flow import OAuth2Session

from custom_components.trakt_tv.utils import compute_calendar_args

from ..configuration import Configuration
from ..const import API_HOST, DOMAIN
from ..exception import TraktException
from ..models.kind import BASIC_KINDS, UPCOMING_KINDS, TraktKind
from ..models.media import Medias
from ..utils import cache_insert, cache_retrieve, deserialize_json

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

    def cache(self) -> Dict[str, Any]:
        return self.hass.data[DOMAIN].get("cache", {})

    async def async_get_access_token(self) -> str:
        """Return a valid access token."""
        if not self.oauth_session.valid_token:
            await self.oauth_session.async_ensure_token_valid()

        return self.oauth_session.token["access_token"]

    async def retry_request(self, wait_time, response, method, url, retry, **kwargs):
        """Retry a request {retry} times before logging an error and raising an exception."""
        content = await response.text()
        error = f"Can't request {url} with {method} because it returns a {response.status} status code with content {content}."

        if retry > 0:
            retry = retry - 1
            guidance = f"Retrying at least {retry} time(s)."
            LOGGER.warn(f"{error} {guidance}")
            await sleep(wait_time)
            return await self.request(method, url, retry, **kwargs)
        else:
            guidance = f"Too many retries, if you find this error, please raise an issue at https://github.com/dylandoamaral/trakt-integration/issues."
            raise TraktException(f"{error} {guidance}")

    async def request(self, method, url, retry=10, **kwargs) -> ClientResponse:
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

        response = await self.web_session.request(
            method,
            f"{self.host}/{url}",
            **kwargs,
            headers=headers,
        )

        async with response:
            if response.ok:
                text = await response.text()
                return deserialize_json(text)
            elif response.status == 429:
                wait_time = (
                    int(response.headers["Retry-After"]) + 20
                )  # Arbitrary value to have a security
                await self.retry_request(
                    wait_time, response, method, url, retry, **kwargs
                )
            else:
                await self.retry_request(300, response, method, url, retry, **kwargs)

    async def fetch_calendar(
        self, path: str, from_date: str, nb_days: int, all_medias: bool
    ):
        cache_key = f"user_calendar_{path}_{from_date}_{nb_days}"

        maybe_answer = cache_retrieve(self.cache(), cache_key)
        if maybe_answer is not None:
            return maybe_answer

        root = "all" if all_medias else "my"
        response = await self.request(
            "get", f"calendars/{root}/{path}/{from_date}/{nb_days}"
        )

        cache_insert(self.cache(), cache_key, response)

        return response

    def is_show_excluded(self, show, excluded_shows: list, hidden_shows: list) -> bool:
        """Check if a show should be excluded or not."""
        try:
            ids = show["show"]["ids"]
            return ids["slug"] in excluded_shows or ids["trakt"] in hidden_shows
        except IndexError:
            return False

    def is_show_finished(self, show) -> bool:
        """Check if a show is finished or not."""
        try:
            return show["aired"] == show["completed"]
        except KeyError:
            return False

    async def fetch_watched(
        self, excluded_shows: list, excluded_finished: bool = False
    ):
        """First, let's retrieve hidden items from user as a workaround for a potential bug in show progress_watch API"""
        cache_key = f"user_hidden_shows"

        maybe_answer = cache_retrieve(self.cache(), cache_key)
        if maybe_answer is not None:
            hidden_shows = maybe_answer
        else:
            hidden_shows = []
            for section in [
                "calendar",
                "progress_watched",
                "progress_watched_reset",
                "progress_collected",
            ]:
                hidden_items = await self.request(
                    "get", f"users/hidden/{section}?type=show"
                )
                if hidden_items is not None:
                    for hidden_item in hidden_items:
                        try:
                            trakt_id = hidden_item["show"]["ids"]["trakt"]
                            hidden_shows.append(trakt_id)
                        except IndexError:
                            LOGGER.error(
                                "Error while trying to retrieve hidden items in section %s",
                                section,
                            )
            cache_insert(self.cache(), cache_key, hidden_shows)

        """Then, let's retrieve progress for current user by removing hidden or excluded shows"""
        raw_shows = await self.request("get", f"sync/watched/shows?extended=noseasons")
        raw_medias = []

        for show in raw_shows or []:
            try:
                ids = show["show"]["ids"]

                is_excluded = self.is_show_excluded(show, excluded_shows, hidden_shows)

                if is_excluded:
                    continue

                identifier = ids["slug"]
                raw_show_progress = await self.fetch_show_progress(ids["trakt"])
                is_finished = self.is_show_finished(raw_show_progress)

                """aired date and completed date will always be the same for next to watch tvshows if you're up-to-date"""
                if excluded_finished and is_finished:
                    continue

                raw_next_episode = await self.fetch_show_informations(
                    ids["trakt"],
                    raw_show_progress["next_episode"]["season"],
                    raw_show_progress["next_episode"]["number"],
                )

                show["episode"] = raw_next_episode
                show["first_aired"] = raw_next_episode["first_aired"]
                raw_medias.append(show)
            except IndexError:
                LOGGER.warning(f"Show {identifier} doesn't contain any trakt ID")
                continue
            except TypeError as e:
                LOGGER.warning(f"Show {identifier} can't be extracted due to {e}")
                continue
            except KeyError as e:
                LOGGER.warning(f"Show {identifier} can't be extracted due to {e}")
                continue

        return raw_medias

    async def fetch_show_progress(self, id: str):
        cache_key = f"show_progress_{id}"

        maybe_answer = cache_retrieve(self.cache(), cache_key)

        if maybe_answer is not None:
            return maybe_answer

        response = await self.request("get", f"shows/{id}/progress/watched")

        cache_insert(self.cache(), cache_key, response)

        return response

    async def fetch_show_informations(
        self, show_id: str, season_nbr: str, episode_nbr: str
    ):
        return await self.request(
            "get",
            f"shows/{show_id}/seasons/{season_nbr}/episodes/{episode_nbr}?extended=full",
        )

    async def fetch_upcoming(
        self,
        trakt_kind: TraktKind,
        all_medias: bool,
        next_to_watch: bool,
        only_aired: bool,
        only_upcoming: bool,
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

        upcoming_identifier_exists = configuration.upcoming_identifier_exists(
            identifier, all_medias
        )
        next_to_watch_identifier_exists = configuration.next_to_watch_identifier_exists(
            identifier
        )

        if (next_to_watch and (not next_to_watch_identifier_exists)) or (
            (not next_to_watch) and (not upcoming_identifier_exists)
        ):
            return None

        configuration = Configuration(data=self.hass.data)

        max_medias = configuration.get_upcoming_max_medias(identifier, all_medias)
        language = configuration.get_language()

        if next_to_watch:
            excluded_shows = configuration.get_exclude_shows(identifier)
            raw_medias = await self.fetch_watched(excluded_shows, not only_upcoming)
        else:
            days_to_fetch = configuration.get_upcoming_days_to_fetch(
                identifier, all_medias
            )
            calendar_args = compute_calendar_args(days_to_fetch, 33)
            data = await gather(
                *[
                    self.fetch_calendar(path, args[0], args[1], all_medias)
                    for args in calendar_args
                ]
            )
            raw_medias = [media for medias in data for media in medias]
            raw_medias = raw_medias[0:max_medias]

        medias = [trakt_kind.value.model.from_trakt(media) for media in raw_medias]

        if next_to_watch:
            if only_aired:
                timezoned_now = datetime.now(
                    pytz.timezone(configuration.get_timezone())
                )
                new_medias = [
                    media for media in medias if media.released <= timezoned_now
                ]
            elif only_upcoming:
                timezoned_now = datetime.now(
                    pytz.timezone(configuration.get_timezone())
                )
                new_medias = [
                    media for media in medias if media.released > timezoned_now
                ]
            else:
                new_medias = medias
        else:
            timezoned_now = datetime.now(pytz.timezone(configuration.get_timezone()))
            new_medias = [media for media in medias if media.released >= timezoned_now]

        await gather(*[media.get_more_information(language) for media in new_medias])

        return trakt_kind, Medias(new_medias)

    async def fetch_next_to_watch(
        self,
        configured_kind: TraktKind,
        only_aired: bool = False,
        only_upcoming: bool = False,
    ):
        data = await self.fetch_upcoming(
            configured_kind,
            False,
            True,
            only_aired,
            only_upcoming,
        )

        if data is None:
            return {}

        return dict([data])

    async def fetch_upcomings(
        self, configured_kinds: list[TraktKind], all_medias: bool
    ):
        kinds = []

        for kind in configured_kinds:
            if kind in UPCOMING_KINDS:
                kinds.append(kind)
            else:
                LOGGER.warn(
                    f"Upcomings doesn't support {kind}, you should remove it from the configuration."
                )

        data = await gather(
            *[
                self.fetch_upcoming(kind, all_medias, False, False, False)
                for kind in kinds
            ]
        )
        data = filter(lambda x: x is not None, data)
        return {trakt_kind: medias for trakt_kind, medias in data}

    async def fetch_recommendation(self, path: str, max_items: int):
        return await self.request(
            "get", f"recommendations/{path}?limit={max_items}&ignore_collected=false"
        )

    async def fetch_recommendations(self, configured_kinds: list[TraktKind]):
        kinds = []

        for kind in configured_kinds:
            if kind in BASIC_KINDS:
                kinds.append(kind)
            else:
                LOGGER.warn(
                    f"Recommendation doesn't support {kind}, you should remove it from the configuration."
                )

        configuration = Configuration(data=self.hass.data)
        language = configuration.get_language()
        data = await gather(
            *[
                self.fetch_recommendation(
                    kind.value.path,
                    configuration.get_recommendation_max_medias(kind.value.identifier),
                )
                for kind in kinds
            ]
        )

        res = {}

        for trakt_kind, raw_medias in zip(kinds, data):
            if raw_medias is not None:
                medias = [
                    trakt_kind.value.model.from_trakt(media) for media in raw_medias
                ]
                await gather(
                    *[media.get_more_information(language) for media in medias]
                )
                res[trakt_kind] = Medias(medias)

        return res

    async def retrieve_data(self):
        async with timeout(1800):
            configuration = Configuration(data=self.hass.data)

            sources = []
            coroutine_sources_data = []

            source_function = {
                "upcoming": lambda kinds: self.fetch_upcomings(
                    configured_kinds=kinds,
                    all_medias=False,
                ),
                "all_upcoming": lambda kinds: self.fetch_upcomings(
                    configured_kinds=kinds,
                    all_medias=True,
                ),
                "recommendation": lambda kinds: self.fetch_recommendations(
                    configured_kinds=kinds,
                ),
                "all": lambda: self.fetch_next_to_watch(
                    configured_kind=TraktKind.NEXT_TO_WATCH_ALL,
                ),
                "only_aired": lambda: self.fetch_next_to_watch(
                    configured_kind=TraktKind.NEXT_TO_WATCH_AIRED,
                    only_aired=True,
                ),
                "only_upcoming": lambda: self.fetch_next_to_watch(
                    configured_kind=TraktKind.NEXT_TO_WATCH_UPCOMING,
                    only_upcoming=True,
                ),
            }

            """First, let's configure which sensors we need depending on configuration"""
            for source in [
                "upcoming",
                "all_upcoming",
                "recommendation",
            ]:
                if configuration.source_exists(source):
                    sources.append(source)
                    kinds = configuration.get_kinds(source)
                    coroutine_sources_data.append(source_function.get(source)(kinds))

            """Then, let's add the next to watch sensors if needed"""
            for sub_source in [
                "all",
                "only_aired",
                "only_upcoming",
            ]:
                if configuration.next_to_watch_identifier_exists(sub_source):
                    sources.append(sub_source)
                    coroutine_sources_data.append(source_function.get(sub_source)())

            sources_data = await gather(*coroutine_sources_data)

            return {
                source: source_data
                for source, source_data in zip(sources, sources_data)
            }
