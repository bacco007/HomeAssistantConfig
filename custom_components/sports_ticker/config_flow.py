from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers import selector

from .const import (
    CONF_FAVORITE_TEAMS,
    CONF_LEAGUES,
    CONF_POLL_INTERVAL,
    CONF_TICKER_SPEED,
    CONF_TICKER_THEME,
    DEFAULT_POLL_INTERVAL,
    DEFAULT_TICKER_SPEED,
    DEFAULT_TICKER_THEME,
    DOMAIN,
    LEAGUE_LABELS,
    LEAGUES,
    TEAM_OPTIONS,
    TICKER_THEME_DARK,
    TICKER_THEME_LIGHT,
)

DEFAULT_LEAGUES = ["mlb", "nfl"]


def _league_options() -> list[selector.SelectOptionDict]:
    """Return league options for setup UI."""
    return [
        {
            "value": league,
            "label": LEAGUE_LABELS.get(league, league.upper()),
        }
        for league in LEAGUES
    ]


def _team_options(league: str) -> list[selector.SelectOptionDict]:
    """Return favorite team options for a league."""
    options: list[selector.SelectOptionDict] = [
        {
            "value": "",
            "label": "No favorite team",
        }
    ]

    for team in TEAM_OPTIONS.get(league, []):
        options.append(
            {
                "value": team["value"],
                "label": team["label"],
            }
        )

    return options


def _favorite_field(league: str) -> str:
    """Return the dynamic favorite-team field name."""
    return f"favorite_team_{league}"


class SportsTickerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle Sports Ticker config flow."""

    VERSION = 1

    def __init__(self) -> None:
        """Initialize the flow."""
        self._selected_leagues: list[str] = []
        self._basic_config: dict[str, Any] = {}

    async def async_step_user(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Step 1: choose sports and leagues."""
        errors: dict[str, str] = {}

        if user_input is not None:
            leagues = user_input.get(CONF_LEAGUES, DEFAULT_LEAGUES)

            if isinstance(leagues, str):
                leagues = [leagues]

            leagues = [
                str(league).strip().lower()
                for league in (leagues or [])
                if str(league).strip().lower() in LEAGUES
            ]

            if not leagues:
                errors["base"] = "no_leagues_selected"
            else:
                self._selected_leagues = leagues
                self._basic_config = {
                    CONF_LEAGUES: leagues,
                    CONF_POLL_INTERVAL: int(
                        user_input.get(
                            CONF_POLL_INTERVAL,
                            DEFAULT_POLL_INTERVAL,
                        )
                    ),
                    CONF_TICKER_SPEED: int(
                        user_input.get(
                            CONF_TICKER_SPEED,
                            DEFAULT_TICKER_SPEED,
                        )
                    ),
                    CONF_TICKER_THEME: str(
                        user_input.get(
                            CONF_TICKER_THEME,
                            DEFAULT_TICKER_THEME,
                        )
                    ),
                }

                return await self.async_step_favorites()

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LEAGUES,
                    default=DEFAULT_LEAGUES,
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=_league_options(),
                        multiple=True,
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
                vol.Optional(
                    CONF_POLL_INTERVAL,
                    default=DEFAULT_POLL_INTERVAL,
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=15,
                        max=600,
                        step=15,
                        mode=selector.NumberSelectorMode.BOX,
                        unit_of_measurement="seconds",
                    )
                ),
                vol.Optional(
                    CONF_TICKER_SPEED,
                    default=DEFAULT_TICKER_SPEED,
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=4,
                        max=40,
                        step=1,
                        mode=selector.NumberSelectorMode.SLIDER,
                    )
                ),
                vol.Optional(
                    CONF_TICKER_THEME,
                    default=DEFAULT_TICKER_THEME,
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            {
                                "value": TICKER_THEME_LIGHT,
                                "label": "Light",
                            },
                            {
                                "value": TICKER_THEME_DARK,
                                "label": "Dark",
                            },
                        ],
                        multiple=False,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "step_title": "Choose Sports & Leagues",
            },
        )

    async def async_step_favorites(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Step 2: choose favorite teams."""
        if user_input is not None:
            favorite_teams: dict[str, str] = {}

            for league in self._selected_leagues:
                value = user_input.get(_favorite_field(league), "")

                if value:
                    favorite_teams[league] = str(value)

            data = {
                **self._basic_config,
                CONF_FAVORITE_TEAMS: favorite_teams,
            }

            return self.async_create_entry(
                title="Sports Ticker",
                data=data,
            )

        schema_dict: dict[Any, Any] = {}

        for league in self._selected_leagues:
            schema_dict[
                vol.Optional(
                    _favorite_field(league),
                    default="",
                    description={
                        "suggested_value": "",
                    },
                )
            ] = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=_team_options(league),
                    multiple=False,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                    translation_key=f"favorite_team_{league}",
                )
            )

        schema = vol.Schema(schema_dict)

        return self.async_show_form(
            step_id="favorites",
            data_schema=schema,
            description_placeholders={
                "step_title": "Favorite Teams",
            },
        )

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> "SportsTickerOptionsFlow":
        """Create the options flow."""
        return SportsTickerOptionsFlow(config_entry)


class SportsTickerOptionsFlow(config_entries.OptionsFlow):
    """Options flow handler."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize options flow."""
        # Do not set self.config_entry; HA owns that property.
        self._config_entry = config_entry
        self._selected_leagues: list[str] = []
        self._basic_config: dict[str, Any] = {}

    async def async_step_init(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Options step 1: choose leagues."""
        errors: dict[str, str] = {}

        current = {
            **self._config_entry.data,
            **self._config_entry.options,
        }

        current_leagues = current.get(CONF_LEAGUES, DEFAULT_LEAGUES)

        if isinstance(current_leagues, str):
            current_leagues = [current_leagues]

        current_leagues = [
            str(league).strip().lower()
            for league in (current_leagues or [])
            if str(league).strip().lower() in LEAGUES
        ]

        if user_input is not None:
            leagues = user_input.get(CONF_LEAGUES, DEFAULT_LEAGUES)

            if isinstance(leagues, str):
                leagues = [leagues]

            leagues = [
                str(league).strip().lower()
                for league in (leagues or [])
                if str(league).strip().lower() in LEAGUES
            ]

            if not leagues:
                errors["base"] = "no_leagues_selected"
            else:
                self._selected_leagues = leagues
                self._basic_config = {
                    CONF_LEAGUES: leagues,
                    CONF_POLL_INTERVAL: int(
                        user_input.get(
                            CONF_POLL_INTERVAL,
                            current.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
                        )
                    ),
                    CONF_TICKER_SPEED: int(
                        user_input.get(
                            CONF_TICKER_SPEED,
                            current.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED),
                        )
                    ),
                    CONF_TICKER_THEME: str(
                        user_input.get(
                            CONF_TICKER_THEME,
                            current.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME),
                        )
                    ),
                }

                return await self.async_step_favorites()

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LEAGUES,
                    default=current_leagues or DEFAULT_LEAGUES,
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=_league_options(),
                        multiple=True,
                        mode=selector.SelectSelectorMode.LIST,
                    )
                ),
                vol.Optional(
                    CONF_POLL_INTERVAL,
                    default=current.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=15,
                        max=600,
                        step=15,
                        mode=selector.NumberSelectorMode.BOX,
                        unit_of_measurement="seconds",
                    )
                ),
                vol.Optional(
                    CONF_TICKER_SPEED,
                    default=current.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED),
                ): selector.NumberSelector(
                    selector.NumberSelectorConfig(
                        min=4,
                        max=40,
                        step=1,
                        mode=selector.NumberSelectorMode.SLIDER,
                    )
                ),
                vol.Optional(
                    CONF_TICKER_THEME,
                    default=current.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            {
                                "value": TICKER_THEME_LIGHT,
                                "label": "Light",
                            },
                            {
                                "value": TICKER_THEME_DARK,
                                "label": "Dark",
                            },
                        ],
                        multiple=False,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(
            step_id="init",
            data_schema=schema,
            errors=errors,
            description_placeholders={
                "step_title": "Choose Sports & Leagues",
            },
        )

    async def async_step_favorites(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> config_entries.ConfigFlowResult:
        """Options step 2: choose favorite teams."""
        current = {
            **self._config_entry.data,
            **self._config_entry.options,
        }

        current_favorites = current.get(CONF_FAVORITE_TEAMS, {})

        if not isinstance(current_favorites, dict):
            current_favorites = {}

        if user_input is not None:
            favorite_teams: dict[str, str] = {}

            for league in self._selected_leagues:
                value = user_input.get(_favorite_field(league), "")

                if value:
                    favorite_teams[league] = str(value)

            return self.async_create_entry(
                title="",
                data={
                    **self._basic_config,
                    CONF_FAVORITE_TEAMS: favorite_teams,
                },
            )

        schema_dict: dict[Any, Any] = {}

        for league in self._selected_leagues:
            current_value = current_favorites.get(league, "")

            schema_dict[
                vol.Optional(
                    _favorite_field(league),
                    default=current_value,
                )
            ] = selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=_team_options(league),
                    multiple=False,
                    mode=selector.SelectSelectorMode.DROPDOWN,
                    translation_key=f"favorite_team_{league}",
                )
            )

        schema = vol.Schema(schema_dict)

        return self.async_show_form(
            step_id="favorites",
            data_schema=schema,
            description_placeholders={
                "step_title": "Favorite Teams",
            },
        )
