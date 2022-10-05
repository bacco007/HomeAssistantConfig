import random
from typing import Optional
from dataclasses import dataclass

from custom_components.formulaone_api.ergast import ErgastResponse

@dataclass
class F1(object):
    secure: Optional[bool] = False
    offset: Optional[int] = None
    limit: Optional[int] = None

    __all__ = {
        "all_drivers": "drivers",
        "all_circuits": "circuits",
        "all_seasons": "seasons",
        "current_schedule": "current",
        "last_result": "current/last/results",
        "season_schedule": "{season}",
        "all_constructors": "constructors",
        "race_standings": "{season}/driverStandings",
        "constructor_standings": "{season}/constructorStandings",
        "driver_standings": "{season}/driverStandings",
        "driver_season": "{season}/drivers",
    }

    def __getattr__(self, attr):
        path = self.__all__.get(attr)
        if path is None:
            raise AttributeError

        def outer(path):
            def inner(**kwargs):
                url = self._build_url(path, **kwargs)
                return ErgastResponse(url)

            return inner

        return outer(self.__all__[attr])

    def random(self, **kwargs):
        applicable_actions = []
        for action in self.__all__.keys():
            applicable_actions.append(action)
        choice = getattr(self, random.choice(applicable_actions))
        return choice(**kwargs)

    def _build_url(self, path, **kwargs) -> str:
        url = "{protocol}://ergastcache.mobiusmedia.ca/f1/{path}".format(
            protocol="http" if self.secure else "http", path=path.format(**kwargs)
        )
        return url