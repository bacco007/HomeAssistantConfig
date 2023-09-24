"""Helper functions."""
from datetime import datetime

from pytz import utc

DEFAULT_TIME_ZONE = None


# ---------------------------
#   format_attribute
# ---------------------------
def format_attribute(attr: str) -> str:
    """Format attribute."""
    res = attr.replace("_", " ")
    res = res.replace("-", " ")
    res = res.capitalize()
    return res


# ---------------------------
#   as_local
# ---------------------------
def as_local(dattim: datetime) -> datetime:
    """Convert a UTC datetime object to local time zone."""
    if dattim.tzinfo == DEFAULT_TIME_ZONE:
        return dattim
    if dattim.tzinfo is None:
        dattim = utc.localize(dattim)

    return dattim.astimezone(DEFAULT_TIME_ZONE)
