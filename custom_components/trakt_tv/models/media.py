from abc import ABC, abstractmethod, abstractstaticmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from custom_components.trakt_tv.apis.tmdb import get_movie_data, get_show_data

from ..const import UPCOMING_DATA_FORMAT

first_item = {
    "title_default": "$title",
    "line1_default": "$episode",
    "line2_default": "$release",
    "line3_default": "$rating - $runtime",
    "line4_default": "$number - $studio",
    "icon": "mdi:arrow-down-bold",
}


@dataclass
class Identifiers:
    trakt: Optional[int]
    slug: Optional[str]
    tvdb: Optional[int]
    imdb: Optional[str]
    tmdb: Optional[int]

    @staticmethod
    def from_trakt(data) -> "Identifiers":
        """
        Create identifiers from trakt api by providing the base root of the ids.
        """
        ids = data["ids"]

        return Identifiers(
            trakt=int(ids["trakt"]) if ids.get("trakt") else None,
            slug=ids.get("slug"),
            tvdb=int(ids["tvdb"]) if ids.get("tvdb") else None,
            imdb=ids.get("imdb"),
            tmdb=int(ids["tmdb"]) if ids.get("tmdb") else None,
        )


@dataclass
class Media(ABC):
    name: str
    ids: Identifiers

    @abstractstaticmethod
    def from_trakt(data) -> "Media":
        """
        Create a model from trakt api.
        """

    @abstractmethod
    def to_homeassistant(self) -> Dict[str, Any]:
        """
        Convert the Media to upcoming data.

        :return: The dictionary containing all necessary information for upcoming media
                 card
        """

    def common_information(self) -> Dict[str, Any]:
        """
        Common upcoming information.

        :return: The dictionary containing all common information for all kind of medias
        """
        default = {
            "title": self.name,
            "poster": self.poster,
            "fanart": self.fanart,
            "genres": self.genres,
            "rating": self.rating,
            "studio": self.studio,
        }

        return {k: v for k, v in default.items() if v is not None}

    async def get_more_information(self, language):
        """
        Get information from other API calls to complete the trakt movie.

        :param language: The favorite language of the user
        """


@dataclass
class Movie(Media):
    """
    An upcoming movie
    """

    genres: List[str] = field(default_factory=list)
    poster: Optional[str] = None
    fanart: Optional[str] = None
    rating: Optional[int] = None
    runtime: Optional[int] = None
    studio: Optional[str] = None
    released: Optional[datetime] = None  # This one is actually mandatory

    @staticmethod
    def from_trakt(data) -> "Movie":
        """
        Create a Movie from trakt api.
        """
        movie = data if data.get("title") else data["movie"]

        released = (
            datetime.fromisoformat(data["released"]) if data.get("released") else None
        )

        return Movie(
            name=movie["title"],
            released=released,
            ids=Identifiers.from_trakt(movie),
        )

    async def get_more_information(self, language):
        """
        Get information from other API calls to complete the trakt movie.

        :param language: The favorite language of the user
        """
        data = await get_movie_data(self.ids.tmdb, language)
        if title := data.get("title"):
            self.name = title
        if poster := data.get("poster_path"):
            self.poster = f"https://image.tmdb.org/t/p/w500{poster}"
        if fanart := data.get("backdrop_path"):
            self.fanart = f"https://image.tmdb.org/t/p/w500{fanart}"
        if genres := data.get("genres"):
            self.genres = [genre["name"] for genre in genres]
        if vote_average := data.get("vote_average"):
            if vote_average != 0:
                self.rating = vote_average
        if runtime := data.get("runtime"):
            self.runtime = runtime
        if production_companies := data.get("production_companies"):
            self.studio = production_companies[0].get("name")
        if not self.released:
            if data.get("release_date"):
                self.released = datetime.fromisoformat(data["release_date"])
            else:
                self.released = datetime.min

    def to_homeassistant(self) -> Dict[str, Any]:
        """
        Convert the Movie to upcoming data.

        :return: The dictionary containing all necessary information for upcoming media
                 card
        """
        default = {
            **self.common_information(),
            "runtime": self.runtime,
            "release": "$day, $date $time",
            "airdate": self.released.isoformat() + "Z",
        }

        return default


@dataclass
class Episode:
    number: int
    season: int
    title: str
    ids: Identifiers

    @staticmethod
    def from_trakt(data) -> "Episode":
        """
        Create an Episode from trakt api.
        """
        episode = data

        return Episode(
            number=episode["number"],
            season=episode["season"],
            title=episode["title"],
            ids=Identifiers.from_trakt(episode),
        )


@dataclass
class Show(Media):
    poster: Optional[str] = None
    fanart: Optional[str] = None
    genres: List[str] = field(default_factory=list)
    rating: Optional[int] = None
    studio: Optional[str] = None
    episode: Optional[Episode] = None
    released: Optional[datetime] = None

    @staticmethod
    def from_trakt(data) -> "Show":
        """
        Create a Show from trakt api.
        """
        show = data if data.get("title") else data["show"]

        released = (
            datetime.strptime(data["first_aired"], UPCOMING_DATA_FORMAT)
            if data.get("first_aired")
            else None
        )
        episode = Episode.from_trakt(data["episode"]) if data.get("episode") else None

        return Show(
            name=show["title"],
            ids=Identifiers.from_trakt(show),
            released=released,
            episode=episode,
        )

    def update_common_information(self, data: Dict[str, Any]):
        if title := data.get("title"):
            self.name = title
        if fanart := data.get("backdrop_path"):
            self.fanart = f"https://image.tmdb.org/t/p/w500{fanart}"
        if genres := data.get("genres"):
            self.genres = [genre["name"] for genre in genres]
        if vote_average := data.get("vote_average"):
            if vote_average != 0:
                self.rating = vote_average
        if networks := data.get("networks"):
            self.studio = networks[0].get("name")
        if not self.released:
            if data.get("first_air_date"):
                self.released = datetime.fromisoformat(data["first_air_date"])
            else:
                # If we really can't find the release date, we set it to the minimum date
                self.released = datetime.min

    async def get_more_information(self, language):
        """
        Get information from other API calls to complete the trakt movie.

        :param language: The favorite language of the user
        """
        data = await get_show_data(self.ids.tmdb, language)
        self.update_common_information(data)

    def to_homeassistant(self) -> Dict[str, Any]:
        """
        Convert the Show to upcoming data.

        :return: The dictionary containing all necessary information for upcoming media
                 card
        """
        default = {
            **self.common_information(),
            "release": "$day, $date $time",
            "airdate": self.released.isoformat() + "Z",
        }

        if self.episode:
            season = self.episode.season
            season = season if season >= 10 else f"0{season}"

            episode = self.episode.number
            episode = episode if episode >= 10 else f"0{episode}"

            default = {
                **default,
                "episode": self.episode.title,
                "number": f"S{season}E{episode}",
            }

        return default


@dataclass
class Medias:
    items: List[Media]

    def to_homeassistant(self) -> Dict[str, Any]:
        """
        Convert the List of medias to recommendation data.

        :return: The dictionary containing all necessary information for upcoming media
                 card
        """
        medias = sorted(self.items, key=lambda media: media.released)
        medias = [media.to_homeassistant() for media in medias]
        return [first_item] + medias
