"""Config Flow for GTFS Realtime."""

import asyncio
import json
import logging
from typing import Any

import aiohttp
from gtfs_station_stop.route_info import RouteInfoDataset
from gtfs_station_stop.static_dataset import async_factory
from gtfs_station_stop.station_stop_info import LocationType, StationStopInfoDataset
from homeassistant.config_entries import ConfigFlow
from homeassistant.data_entry_flow import SectionConfig, section
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.selector import (
    DurationSelector,
    DurationSelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
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
    CONF_ARRIVAL_LIMIT,
    CONF_AUTH_HEADER,
    CONF_GTFS_PROVIDER,
    CONF_GTFS_PROVIDER_ID,
    CONF_GTFS_STATIC_DATA,
    CONF_MINOR_VERSION,
    CONF_ROUTE_ICONS,
    CONF_ROUTE_IDS,
    CONF_SELECT_AT_LEAST_ONE_STOP_OR_ROUTE,
    CONF_STATIC_SOURCES_UPDATE_FREQUENCY,
    CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT,
    CONF_STOP_IDS,
    CONF_URL_ENDPOINTS,
    CONF_VERSION,
    DOMAIN,
    FEEDS_URL,
)
from .helpers import header_dict_from_header_str

_LOGGER = logging.getLogger(__name__)


class GtfsRealtimeConfigFlow(ConfigFlow, domain=DOMAIN):
    """Config flow for GTFS Realtime."""

    VERSION = CONF_VERSION
    MINOR_VERSION = CONF_MINOR_VERSION
    feeds: dict[str, str] = {}

    def __init__(self) -> None:
        """Initialize config flow."""
        self.hub_config: dict[str, Any] = {}

    async def _get_feeds():
        async with aiohttp.ClientSession() as session:
            async with session.get(FEEDS_URL) as response:
                if response.status >= 200 and response.status < 400:
                    GtfsRealtimeConfigFlow.feeds = json.loads(await response.text())

    async def async_step_user(self, user_input=None):
        """User initiated Config Flow."""
        errors = {}
        if user_input is not None:
            if CONF_GTFS_PROVIDER_ID in user_input:
                return await self.async_step_choose_static_and_realtime_feeds(
                    user_input
                )
            else:
                errors["base"] = "unexpected_user_input"

        # Update the feeds, typically this will be from an externally hosted
        # file so it may be kept up to date without requiring updates to this repository.
        # It can also be monkey patched to support testing.
        try:
            await GtfsRealtimeConfigFlow._get_feeds()
        except Exception as e:
            # do not allow errors to propagate, this is for convenience
            _LOGGER.error("failed_preconfigured_feeds")
            errors["base"] = f"failed_preconfigured_feeds: {e}"

        options = {"_": "..."}
        for k, v in GtfsRealtimeConfigFlow.feeds.items():
            options[k] = v["name"]

        data_schema = vol.Schema(
            {
                vol.Required(CONF_GTFS_PROVIDER_ID): SelectSelector(
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
        self, user_input: dict[str, str] = {}, errors: dict[str, str] = {}
    ):
        """Select Static and Realtime Feed URIs."""
        if (
            CONF_GTFS_STATIC_DATA in user_input
            and CONF_URL_ENDPOINTS in user_input
            and not errors
        ):
            self.hub_config = self.hub_config | user_input
            return await self.async_step_choose_informed_entities()
        gtfs_provider_id = user_input.get(CONF_GTFS_PROVIDER_ID)
        self.hub_config[CONF_GTFS_PROVIDER] = "Manual"
        feed_data: dict[str, Any] = GtfsRealtimeConfigFlow.feeds.get(
            gtfs_provider_id, {}
        )
        realtime_feeds: list[str] = list(
            feed_data.get("realtime_feeds", {"_": [""]}).values()
        )
        static_feeds: list[str] = list(
            feed_data.get("static_feeds", {"blank_user_entry": [""]}).values()
        )
        route_icons: str = feed_data.get("route_icons", "")
        self.hub_config[CONF_GTFS_PROVIDER] = feed_data.get("name", "")
        self.hub_config[CONF_GTFS_PROVIDER_ID] = gtfs_provider_id

        data_schema = vol.Schema(
            {
                vol.Optional(
                    CONF_AUTH_HEADER,
                    default=feed_data.get("auth_hint"),
                ): cv.string,
                vol.Optional(
                    CONF_URL_ENDPOINTS,
                    default=realtime_feeds,
                    description=(
                        {"suggested_value": ["https://"]}
                        if realtime_feeds == [""]
                        else {}
                    ),
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
                    description=(
                        {"suggested_value": ["https://"]}
                        if static_feeds == [""]
                        else {}
                    ),
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

    async def _get_route_options(self, headers={}) -> list[SelectOptionDict]:
        route_db = await async_factory(
            RouteInfoDataset, *self.hub_config[CONF_GTFS_STATIC_DATA], headers=headers
        )
        return [
            SelectOptionDict(
                value=k,
                label=f"{k}: {route_db.route_infos[k].long_name or route_db.route_infos[k].short_name}",
            )
            for k in route_db.route_infos.keys()
        ]

    async def _get_stop_options(self, headers={}) -> list[SelectOptionDict]:
        ssi_db = await async_factory(
            StationStopInfoDataset,
            *self.hub_config[CONF_GTFS_STATIC_DATA],
            headers=headers,
        )
        return [
            SelectOptionDict(
                value=k,
                label=f"{v.name} {f' - {v.desc}' if v.desc is not None else ''} ({v.id})",
            )
            for k, v in ssi_db.station_stop_infos.items()
            if v.location_type == LocationType.STOP
        ]

    def _create_config_schema(
        self,
        stops: list[SelectOptionDict],
        routes: list[SelectOptionDict],
        selected_stops: list[str] = [],
        selected_routes: list[str] = [],
    ) -> vol.Schema:
        """Populate the config schema with stops and routes to choose."""
        data_schema = vol.Schema(
            {
                vol.Required(
                    CONF_GTFS_PROVIDER,
                    default=self.hub_config.get(
                        CONF_GTFS_PROVIDER, "Generic GTFS Provider"
                    ),
                ): cv.string,
                vol.Optional(
                    CONF_ROUTE_IDS,
                    default=selected_routes,
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=routes,
                        mode=SelectSelectorMode.DROPDOWN,
                        multiple=True,
                    )
                ),
                vol.Optional(
                    CONF_STOP_IDS,
                    default=selected_stops,
                ): SelectSelector(
                    SelectSelectorConfig(
                        options=stops,
                        mode=SelectSelectorMode.DROPDOWN,
                        multiple=True,
                    )
                ),
                vol.Required(CONF_ARRIVAL_LIMIT, default=4): NumberSelector(
                    NumberSelectorConfig(min=1, step=1, mode=NumberSelectorMode.BOX)
                ),
                CONF_STATIC_SOURCES_UPDATE_FREQUENCY: section(
                    vol.Schema(
                        {
                            vol.Required(
                                uri,
                                default={
                                    "hours": CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT
                                },
                            ): DurationSelector(
                                DurationSelectorConfig(
                                    allow_negative=False,
                                    enable_day=True,
                                    enable_millisecond=False,
                                )
                            )
                            for uri in self.hub_config[CONF_GTFS_STATIC_DATA]
                        }
                    ),
                    SectionConfig({"collapsed": True}),
                ),
            }
        )
        return data_schema

    async def async_step_choose_informed_entities(
        self, user_input: dict[str, str] | None = None
    ):
        """Select informed entities for sensor and binary_sensor platforms."""
        errors = {}
        if user_input is not None:
            if (
                len(user_input.get(CONF_ROUTE_IDS, [])) > 0
                or len(user_input.get(CONF_STOP_IDS, [])) > 0
            ):
                self.hub_config |= user_input
                # There appears to be a bug having the section for specific update intervals
                # Default any missing ones here
                for uri in self.hub_config[CONF_GTFS_STATIC_DATA]:
                    if uri not in self.hub_config.setdefault(
                        CONF_STATIC_SOURCES_UPDATE_FREQUENCY, {}
                    ):
                        self.hub_config[CONF_STATIC_SOURCES_UPDATE_FREQUENCY][uri] = {
                            "hours": CONF_STATIC_SOURCES_UPDATE_FREQUENCY_DEFAULT
                        }
                return self.async_create_entry(
                    title=user_input.get(CONF_GTFS_PROVIDER, "generic_gtfs_provider"),
                    data=self.hub_config,
                )
            else:
                errors[CONF_ROUTE_IDS] = CONF_SELECT_AT_LEAST_ONE_STOP_OR_ROUTE
                errors[CONF_STOP_IDS] = CONF_SELECT_AT_LEAST_ONE_STOP_OR_ROUTE

        headers = header_dict_from_header_str(self.hub_config.get(CONF_AUTH_HEADER))
        try:
            stops, routes = await asyncio.gather(
                self._get_stop_options(headers), self._get_route_options(headers)
            )
            data_schema = self._create_config_schema(stops=stops, routes=routes)
        except Exception as e:
            errors["base"] = str(e)
            return await self.async_step_choose_static_and_realtime_feeds(
                {CONF_GTFS_PROVIDER_ID: self.hub_config.get(CONF_GTFS_PROVIDER_ID)},
                errors,
            )

        return self.async_show_form(
            step_id="choose_informed_entities",
            data_schema=data_schema,
            errors=errors,
            last_step=True,
        )

    async def async_step_reconfigure(self, user_input: dict[str, str] | None = None):
        entry = self._get_reconfigure_entry()
        self.hub_config = entry.data
        if user_input is not None:
            await self.async_set_unique_id()
            self._abort_if_unique_id_mismatch()
            return self.async_update_reload_and_abort(
                self._get_reconfigure_entry(), data_updates=user_input
            )

        stops, routes = await asyncio.gather(
            self._get_stop_options(),
            self._get_route_options(),
        )
        data_schema = self._create_config_schema(
            stops=stops,
            routes=routes,
            selected_stops=self.hub_config.get("stop_ids", []),
            selected_routes=self.hub_config.get("route_ids", []),
        )
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=data_schema,
        )
