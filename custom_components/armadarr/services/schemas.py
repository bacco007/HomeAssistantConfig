"""Service schemas for Armadarr."""

import voluptuous as vol
from homeassistant.helpers import config_validation as cv

SCHEMA_BASE = vol.Schema({vol.Required("entry_id"): cv.string})
SCHEMA_SYSTEM_TASK = SCHEMA_BASE.extend({vol.Required("task"): cv.string})
SCHEMA_DELETE_QUEUE_ITEM = SCHEMA_BASE.extend(
    {vol.Required("item_id"): cv.positive_int}
)
SCHEMA_LOOKUP = SCHEMA_BASE.extend({vol.Required("term"): cv.string})
SCHEMA_SEARCH_ITEM = SCHEMA_BASE.extend({vol.Required("item_id"): cv.positive_int})
SCHEMA_ADD_BASE = SCHEMA_BASE.extend(
    {
        vol.Required("quality_profile_id"): cv.positive_int,
        vol.Required("root_folder_path"): cv.string,
    }
)
SCHEMA_ADD_SERIES = SCHEMA_ADD_BASE.extend(
    {
        vol.Optional("title"): cv.string,
        vol.Optional("tvdb_id"): cv.positive_int,
    }
)
SCHEMA_ADD_MOVIE = SCHEMA_ADD_BASE.extend(
    {
        vol.Optional("title"): cv.string,
        vol.Optional("tmdb_id"): cv.positive_int,
    }
)
SCHEMA_ADD_ARTIST_AUTHOR_BASE = SCHEMA_ADD_BASE.extend(
    {
        vol.Optional("name"): cv.string,
        vol.Required("metadata_profile_id"): cv.positive_int,
    }
)
SCHEMA_ADD_ARTIST = SCHEMA_ADD_ARTIST_AUTHOR_BASE.extend(
    {vol.Optional("mb_id"): cv.string}
)
SCHEMA_ADD_AUTHOR = SCHEMA_ADD_ARTIST_AUTHOR_BASE.extend(
    {vol.Optional("author_id"): cv.string}
)
SCHEMA_DISPATCHARR_REFRESH_M3U = SCHEMA_BASE.extend(
    {
        vol.Optional("data"): dict,
    }
)
SCHEMA_DISPATCHARR_REFRESH_EPG = SCHEMA_BASE.extend(
    {
        vol.Optional("data"): dict,
    }
)
SCHEMA_DISPATCHARR_RUN_PLUGIN = SCHEMA_BASE.extend(
    {
        vol.Required("plugin_id"): cv.string,
        vol.Optional("data"): dict,
    }
)
SCHEMA_DISPATCHARR_PROXY_ACTION = SCHEMA_BASE.extend(
    {
        vol.Required("action"): vol.In(["change_stream", "next_stream", "stop_stream"]),
        vol.Required("channel_id"): cv.positive_int,
    }
)
