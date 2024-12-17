import json
import logging
from typing import Any

import aiohttp
from gtfs_station_stop.route_info import RouteInfoDatabase
from gtfs_station_stop.static_database import async_factory
from gtfs_station_stop.station_stop_info import LocationType, StationStopInfoDatabase
from homeassistant import config_entries
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.selector import (
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
import voluptuous as vol

from .const import (
    CONF_API_KEY,
    CONF_ARRIVAL_LIMIT,
    CONF_GTFS_PROVIDER,
    CONF_GTFS_STATIC_DATA,
    CONF_ROUTE_ICONS,
    CONF_ROUTE_IDS,
    CONF_STOP_IDS,
    CONF_URL_ENDPOINTS,
    DOMAIN,
)

DOMAIN_SCHEMA = vol.Schema(
    {
        vol.Optional(CONF_API_KEY): cv.string,
        vol.Required(CONF_URL_ENDPOINTS): vol.All([cv.url]),
        vol.Optional(CONF_GTFS_STATIC_DATA): vol.All([cv.url]),
        vol.Optional(CONF_ROUTE_ICONS): cv.path,
    }
)


_LOGGER = logging.getLogger(__name__)


class GtfsRealtimeConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for GTFS Realtime"""

    VERSION = 1
    FEEDS_URL = "https://gist.githubusercontent.com/bcpearce/cc60c18f4022c4a11c460c5ccd2ec158/raw/feeds.json"
    feeds = {}

    def __init__(self) -> None:
        """Initialize config flow."""
        self.device_config: dict[str, Any] = {}

    async def get_feeds():
        async with aiohttp.ClientSession() as session:
            async with session.get(GtfsRealtimeConfigFlow.FEEDS_URL) as response:
                if response.status >= 200 and response.status < 400:
                    GtfsRealtimeConfigFlow.feeds = json.loads(await response.text())

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            if CONF_GTFS_PROVIDER in user_input:
                return await self.async_step_choose_static_and_realtime_feeds(
                    user_input
                )

        # Update the feeds, typically this will be from an externally hosted
        # file so it may be kept up to date without requiring updates to this repository.
        # It can also be monkey patched to support testing.
        try:
            await GtfsRealtimeConfigFlow.get_feeds()
        except Exception as e:
            # do not allow errors to propagate, this is for convenience
            _LOGGER.error("Failed to get preconfigured feeds")
            errors["base"] = f"Failed to get preconfigured feeds: {e}"

        options = {"_": "Other - Enter Manually"}
        for k, v in GtfsRealtimeConfigFlow.feeds.items():
            options[k] = v["name"]

        data_schema = vol.Schema(
            {
                vol.Required(CONF_GTFS_PROVIDER): SelectSelector(
                    SelectSelectorConfig(
                        mode=SelectSelectorMode.DROPDOWN,
                        options=[
                            SelectOptionDict(value=k, label=v)
                            for k, v in options.items()
                        ],
                    )
                ),
            }
        )
        return self.async_show_form(
            step_id="user", data_schema=data_schema, errors=errors
        )

    async def async_step_choose_static_and_realtime_feeds(
        self, user_input: dict[str, str], errors: dict[str, str] = {}
    ):
        if (
            CONF_GTFS_STATIC_DATA in user_input
            and CONF_URL_ENDPOINTS in user_input
            and not errors
        ):
            self.device_config = self.device_config | user_input
            return await self.async_step_choose_informed_entities(user_input)
        gtfs_provider = user_input.get(CONF_GTFS_PROVIDER)
        realtime_feeds = [""]
        static_feeds = [""]
        route_icons = ""
        self.device_config[CONF_GTFS_PROVIDER] = "Manual"
        feed_data = GtfsRealtimeConfigFlow.feeds.get(gtfs_provider)
        if feed_data is not None:
            realtime_feeds = list(feed_data["realtime_feeds"].values())
            static_feeds = list(feed_data["static_feeds"].values())
            route_icons = feed_data.get("route_icons", route_icons)
            self.device_config[CONF_GTFS_PROVIDER] = feed_data["name"]

        data_schema = vol.Schema(
            {
                vol.Optional(CONF_API_KEY, default=""): cv.string,
                vol.Optional(
                    CONF_URL_ENDPOINTS,
                    default=realtime_feeds,
                    description={"suggested_value": ["https://"]}
                    if realtime_feeds == [""]
                    else {},
                ): TextSelector(
                    TextSelectorConfig(
                        multiline=False,
                        type=TextSelectorType.URL,
                        multiple=True,
                    )
                ),
                vol.Optional(
                    CONF_GTFS_STATIC_DATA,
                    default=static_feeds,
                    description={"suggested_value": ["https://"]}
                    if static_feeds == [""]
                    else {},
                ): TextSelector(TextSelectorConfig(multiline=False, multiple=True)),
                vol.Optional(
                    CONF_ROUTE_ICONS,
                    default=route_icons,
                ): cv.string,
            }
        )
        return self.async_show_form(
            step_id="choose_static_and_realtime_feeds",
            data_schema=data_schema,
            errors=errors,
        )

    async def async_step_choose_informed_entities(self, user_input):
        if CONF_ROUTE_IDS in user_input or CONF_STOP_IDS in user_input:
            self.device_config = self.device_config | user_input
            return self.async_create_entry(
                title=user_input[CONF_GTFS_PROVIDER],
                data=self.device_config,
            )
        errors = {}
        headers = {}
        if user_input.get(CONF_API_KEY):
            headers["api_key"] = user_input[CONF_API_KEY]
        try:
            ssi_db = await async_factory(
                StationStopInfoDatabase,
                *user_input[CONF_GTFS_STATIC_DATA],
                headers=headers,
            )
            rt_db = await async_factory(
                RouteInfoDatabase, *user_input[CONF_GTFS_STATIC_DATA], headers=headers
            )
        except Exception as e:
            errors["base"] = str(e)
            return await self.async_step_choose_static_and_realtime_feeds(
                {CONF_GTFS_PROVIDER: self.device_config.get(CONF_GTFS_PROVIDER)}, errors
            )
        stops = [
            SelectOptionDict(
                value=k,
                label=f"{v.name} {f' - {v.desc}' if v.desc is not None else ''} ({v.id})",
            )
            for k, v in ssi_db.station_stop_infos.items()
            if v.location_type == LocationType.STOP
        ]
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_GTFS_PROVIDER,
                    default=self.device_config.get(
                        CONF_GTFS_PROVIDER, "Generic GTFS Provider"
                    ),
                ): cv.string,
                vol.Optional(CONF_ROUTE_IDS): SelectSelector(
                    SelectSelectorConfig(
                        options=[
                            SelectOptionDict(
                                value=k,
                                label=f"{k}: {rt_db.route_infos[k].long_name or rt_db.route_infos[k].short_name}",
                            )
                            for k in rt_db.route_infos.keys()
                        ],
                        mode=SelectSelectorMode.DROPDOWN,
                        multiple=True,
                    )
                ),
                vol.Optional(CONF_STOP_IDS): SelectSelector(
                    SelectSelectorConfig(
                        options=stops,
                        mode=SelectSelectorMode.DROPDOWN,
                        multiple=True,
                    )
                ),
                vol.Required(CONF_ARRIVAL_LIMIT, default=4): int,
            }
        )

        return self.async_show_form(
            step_id="choose_informed_entities", data_schema=data_schema, errors=errors
        )
