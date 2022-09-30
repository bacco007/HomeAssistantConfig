import json
from datetime import datetime, timedelta
from math import ceil
from typing import Any, Dict, List, Tuple

from .const import DOMAIN
from .exception import TraktException


def update_domain_data(hass, key, content):
    if hass.data.get(DOMAIN) and hass.data[DOMAIN].get(key):
        hass.data[DOMAIN][key].update(content)
    else:
        hass.data.setdefault(DOMAIN, {})
        hass.data[DOMAIN][key] = content


def split(number: int, by: int) -> List[int]:
    size = ceil(number / by)
    res = []
    for i in range(0, size):
        if i + 1 == size:
            rest = number % by
            if rest == 0:
                res.append(by)
            else:
                res.append(rest)
        else:
            res.append(by)
    return res


# It take the days to fetch starting at yesterday because of timezone.
def compute_calendar_args(
    days_to_fetch: int, max_days_per_request: int
) -> List[Tuple[str, int]]:
    group_of_days = split(days_to_fetch, by=max_days_per_request)
    previous_date = datetime.now() - timedelta(1)
    res = []
    for days in group_of_days:
        from_date = previous_date
        res.append((from_date.strftime("%Y-%m-%d"), days))
        previous_date = from_date + timedelta(days)
    return res


def deserialize_json(document: str) -> Dict[str, Any]:
    """
    Deserialize a json returning a better error than JSONDecodeError.

    :param document: The json document
    :return: The dictionary
    """
    try:
        return json.loads(document)
    except json.decoder.JSONDecodeError:
        raise TraktException(f"Can't deserialize the following json:\n{document}")
