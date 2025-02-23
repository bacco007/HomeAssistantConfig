from typing import Final

DOMAIN: Final = "plex_recently_added"
TIMEOUT_MINUTES: Final = 10


DEFAULT_NAME: Final = 'Plex Recently Added'
CONF_TOKEN: Final = 'token'
CONF_MAX: Final = 'max'
CONF_SECTION_TYPES: Final = 'section_types'
ALL_SECTION_TYPES: Final = ["movie", "show", "artist", "photo"]
CONF_SECTION_LIBRARIES: Final = 'section_libraries'
CONF_EXCLUDE_KEYWORDS: Final = 'exclude_keywords'
CONF_SECTION_LIBRARIES_LABEL: Final = 'Which libraries to consider:'
CONF_EXCLUDE_KEYWORDS_LABEL: Final = 'Keyword to be exclude from the sensor:'
CONF_ON_DECK: Final = 'on_deck'
CONF_VERIFY_SSL: Final = 'verify_ssl'


USER_AGENT: Final = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36"
ACCEPTS: Final = "application/xml, text/xml;q=0.9"

DEFAULT_PARSE_DICT: Final = {
    'title_default': '$title',
    'line1_default': '$episode',
    'line2_default': '$release',
    'line3_default': '$number - $rating - $runtime',
    'line4_default': '$genres',
    'icon': 'mdi:eye-off'
}