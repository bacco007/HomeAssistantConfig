from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict

from dateutil.tz import tzlocal

from custom_components.trakt_tv.const import DOMAIN


@dataclass
class Configuration:
    data: Dict[str, Any]

    @property
    def conf(self) -> Dict[str, Any]:
        return self.data[DOMAIN]["configuration"]

    def get_language(self) -> str:
        try:
            return self.conf["language"]
        except KeyError:
            return "en"

    def get_timezone(self) -> str:
        try:
            return self.conf["timezone"]
        except KeyError:
            return datetime.now(tzlocal()).tzname()

    def identifier_exists(self, identifier: str, source: str) -> bool:
        try:
            self.conf["sensors"][source][identifier]
            return True
        except KeyError:
            return False

    def get_days_to_fetch(self, identifier: str, source: str) -> int:
        try:
            return self.conf["sensors"][source][identifier]["days_to_fetch"]
        except KeyError:
            return 30

    def get_max_medias(self, identifier: str, source: str) -> int:
        try:
            return self.conf["sensors"][source][identifier]["max_medias"]
        except KeyError:
            return 3

    def get_exclude_shows(self, identifier: str) -> list:
        try:
            return self.conf["sensors"]["next_to_watch"][identifier]["exclude"]
        except KeyError:
            return []

    def next_to_watch_identifier_exists(self, identifier: str) -> bool:
        return self.identifier_exists(identifier, "next_to_watch")

    def upcoming_identifier_exists(
        self, identifier: str, all_medias: bool = False
    ) -> bool:
        source = "all_upcoming" if all_medias else "upcoming"
        return self.identifier_exists(identifier, source)

    def get_upcoming_days_to_fetch(
        self, identifier: str, all_medias: bool = False
    ) -> int:
        source = "all_upcoming" if all_medias else "upcoming"
        return self.get_days_to_fetch(identifier, source)

    def get_upcoming_max_medias(self, identifier: str, all_medias: bool = False) -> int:
        source = "all_upcoming" if all_medias else "upcoming"
        return self.get_max_medias(identifier, source)

    def recommendation_identifier_exists(self, identifier: str) -> bool:
        return self.identifier_exists(identifier, "recommendation")

    def get_recommendation_max_medias(self, identifier: str) -> int:
        return self.get_max_medias(identifier, "recommendation")

    def source_exists(self, source: str) -> bool:
        try:
            self.conf["sensors"][source]
            return True
        except KeyError:
            return False
