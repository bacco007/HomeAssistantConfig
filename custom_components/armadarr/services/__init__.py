"""Services for Armadarr."""

from __future__ import annotations

from functools import partial
from typing import TYPE_CHECKING, Any

from homeassistant.core import SupportsResponse

from custom_components.armadarr.const import DOMAIN

from .handlers import (
    async_handle_add_artist,
    async_handle_add_author,
    async_handle_add_movie,
    async_handle_add_series,
    async_handle_delete_queue_item,
    async_handle_dispatcharr_proxy_action,
    async_handle_dispatcharr_refresh_epg,
    async_handle_dispatcharr_refresh_m3u,
    async_handle_dispatcharr_run_plugin,
    async_handle_get_config_data,
    async_handle_lookup_artist,
    async_handle_lookup_author,
    async_handle_lookup_movie,
    async_handle_lookup_series,
    async_handle_search_item,
    async_handle_search_missing,
    async_handle_sync_indexers,
    async_handle_system_task,
)
from .schemas import (
    SCHEMA_ADD_ARTIST,
    SCHEMA_ADD_AUTHOR,
    SCHEMA_ADD_MOVIE,
    SCHEMA_ADD_SERIES,
    SCHEMA_BASE,
    SCHEMA_DELETE_QUEUE_ITEM,
    SCHEMA_DISPATCHARR_PROXY_ACTION,
    SCHEMA_DISPATCHARR_REFRESH_EPG,
    SCHEMA_DISPATCHARR_REFRESH_M3U,
    SCHEMA_DISPATCHARR_RUN_PLUGIN,
    SCHEMA_LOOKUP,
    SCHEMA_SEARCH_ITEM,
    SCHEMA_SYSTEM_TASK,
)

if TYPE_CHECKING:
    import voluptuous as vol
    from homeassistant.core import HomeAssistant


async def async_setup_services(hass: HomeAssistant, app_type: str) -> None:
    """Set up services for Armadarr based on app type."""

    def _register(
        name: str,
        handler: Any,
        schema: vol.Schema,
        response: SupportsResponse = SupportsResponse.NONE,
    ) -> None:
        if not hass.services.has_service(DOMAIN, name):
            hass.services.async_register(
                DOMAIN, name, handler, schema=schema, supports_response=response
            )

    # Common services
    _register(
        "system_task",
        partial(async_handle_system_task, hass),
        SCHEMA_SYSTEM_TASK,
    )
    _register(
        "search_missing",
        partial(async_handle_search_missing, hass),
        SCHEMA_BASE,
    )
    _register(
        "get_config_data",
        partial(async_handle_get_config_data, hass),
        SCHEMA_BASE,
        SupportsResponse.ONLY,
    )
    _register(
        "delete_queue_item",
        partial(async_handle_delete_queue_item, hass),
        SCHEMA_DELETE_QUEUE_ITEM,
    )
    _register(
        "search_item",
        partial(async_handle_search_item, hass),
        SCHEMA_SEARCH_ITEM,
    )

    # App-specific services
    app_services: dict[str, list[tuple[Any, ...]]] = {
        "Prowlarr": [
            (
                "sync_indexers",
                partial(async_handle_sync_indexers, hass),
                SCHEMA_BASE,
            ),
        ],
        "Dispatcharr": [
            (
                "sync_indexers",
                partial(async_handle_sync_indexers, hass),
                SCHEMA_BASE,
            ),
            (
                "refresh_m3u",
                partial(async_handle_dispatcharr_refresh_m3u, hass),
                SCHEMA_DISPATCHARR_REFRESH_M3U,
            ),
            (
                "refresh_epg",
                partial(async_handle_dispatcharr_refresh_epg, hass),
                SCHEMA_DISPATCHARR_REFRESH_EPG,
            ),
            (
                "run_plugin",
                partial(async_handle_dispatcharr_run_plugin, hass),
                SCHEMA_DISPATCHARR_RUN_PLUGIN,
            ),
            (
                "proxy_action",
                partial(async_handle_dispatcharr_proxy_action, hass),
                SCHEMA_DISPATCHARR_PROXY_ACTION,
            ),
        ],
        "Sonarr": [
            (
                "add_series",
                partial(async_handle_add_series, hass),
                SCHEMA_ADD_SERIES,
            ),
            (
                "lookup_series",
                partial(async_handle_lookup_series, hass),
                SCHEMA_LOOKUP,
                SupportsResponse.ONLY,
            ),
        ],
        "Radarr": [
            (
                "add_movie",
                partial(async_handle_add_movie, hass),
                SCHEMA_ADD_MOVIE,
            ),
            (
                "lookup_movie",
                partial(async_handle_lookup_movie, hass),
                SCHEMA_LOOKUP,
                SupportsResponse.ONLY,
            ),
        ],
        "Lidarr": [
            (
                "add_artist",
                partial(async_handle_add_artist, hass),
                SCHEMA_ADD_ARTIST,
            ),
            (
                "lookup_artist",
                partial(async_handle_lookup_artist, hass),
                SCHEMA_LOOKUP,
                SupportsResponse.ONLY,
            ),
        ],
        "Readarr": [
            (
                "add_author",
                partial(async_handle_add_author, hass),
                SCHEMA_ADD_AUTHOR,
            ),
            (
                "lookup_author",
                partial(async_handle_lookup_author, hass),
                SCHEMA_LOOKUP,
                SupportsResponse.ONLY,
            ),
        ],
    }
    app_services["Whisparr"] = app_services["Sonarr"]

    for service_info in app_services.get(app_type, []):
        _register(*service_info)
