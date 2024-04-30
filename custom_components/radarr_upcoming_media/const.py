from typing import Final

DOMAIN: Final = "radarr_upcoming_media"

CONF_DAYS: Final = 'days'
CONF_URLBASE: Final = 'urlbase'
CONF_THEATERS: Final = 'theaters'
CONF_MAX: Final = 'max'

DEFAULT_PARSE_DICT: Final = {
    'title_default': '$title',
    'line1_default': '$episode',
    'line2_default': '$release',
    'line3_default': '$rating - $runtime',
    'line4_default': '$number - $studio',
    'icon': 'mdi:arrow-down-bold'
}