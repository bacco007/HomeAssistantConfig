from dataclasses import dataclass
from enum import Enum

from .media import Media, Movie, Show


@dataclass
class CalendarInformation:
    identifier: str
    name: str
    path: str
    model: Media


class TraktKind(Enum):
    SHOW = CalendarInformation("show", "Shows", "shows", Show)
    NEW_SHOW = CalendarInformation("new_show", "New Shows", "shows/new", Show)
    PREMIERE = CalendarInformation("premiere", "Premieres", "shows/premieres", Show)
    MOVIE = CalendarInformation("movie", "Movies", "movies", Movie)
    DVD = CalendarInformation("dvd", "DVD", "dvd", Movie)
    NEXT_TO_WATCH_ALL = CalendarInformation("all", "All", "shows", Show)
    NEXT_TO_WATCH_AIRED = CalendarInformation("only_aired", "Only Aired", "shows", Show)
    NEXT_TO_WATCH_UPCOMING = CalendarInformation(
        "only_upcoming", "Only Upcoming", "shows", Show
    )


BASIC_KINDS = [TraktKind.SHOW, TraktKind.MOVIE]
NEXT_TO_WATCH_KINDS = [
    TraktKind.NEXT_TO_WATCH_ALL,
    TraktKind.NEXT_TO_WATCH_AIRED,
    TraktKind.NEXT_TO_WATCH_UPCOMING,
]
