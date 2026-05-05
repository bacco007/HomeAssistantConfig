from __future__ import annotations

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.helpers import selector

from .const import (
    DOMAIN,
    LEAGUES,
    CONF_LEAGUES,
    CONF_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL,
    CONF_TICKER_SPEED,
    DEFAULT_TICKER_SPEED,
    CONF_TICKER_THEME,
    DEFAULT_TICKER_THEME,
    TICKER_THEME_LIGHT,
    TICKER_THEME_DARK,
)

DEFAULT_LEAGUES = ["mlb", "nfl"]


def _league_options() -> list[selector.SelectOptionDict]:
    # Nice labels in UI, values remain lowercase keys
    return [{"value": k, "label": k.upper()} for k in sorted(LEAGUES.keys())]


class SportsTickerConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        if user_input is not None:
            leagues = user_input.get(CONF_LEAGUES, DEFAULT_LEAGUES)
            if isinstance(leagues, str):
                leagues = [leagues]
            leagues = [str(x).strip().lower() for x in (leagues or [])]

            data = {
                CONF_LEAGUES: leagues,
                CONF_POLL_INTERVAL: int(user_input.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL)),
                CONF_TICKER_SPEED: int(user_input.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED)),
                CONF_TICKER_THEME: str(user_input.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME)),
            }

            return self.async_create_entry(title="Sports Ticker", data=data)

        schema = vol.Schema(
            {
                vol.Required(CONF_LEAGUES, default=DEFAULT_LEAGUES): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=_league_options(),
                        multiple=True,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(CONF_POLL_INTERVAL, default=DEFAULT_POLL_INTERVAL): vol.All(
                    vol.Coerce(int), vol.Range(min=15, max=600)
                ),
                vol.Optional(CONF_TICKER_SPEED, default=DEFAULT_TICKER_SPEED): vol.All(
                    vol.Coerce(int), vol.Range(min=4, max=40)
                ),
                vol.Optional(CONF_TICKER_THEME, default=DEFAULT_TICKER_THEME): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            {"value": TICKER_THEME_LIGHT, "label": "Light"},
                            {"value": TICKER_THEME_DARK, "label": "Dark"},
                        ],
                        multiple=False,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(step_id="user", data_schema=schema)

    @staticmethod
    def async_get_options_flow(config_entry):
        return SportsTickerOptionsFlow(config_entry)


class SportsTickerOptionsFlow(config_entries.OptionsFlow):
    """Options flow handler."""

    def __init__(self, config_entry):
        # DO NOT set self.config_entry (it's a read-only property set by HA).
        self._config_entry = config_entry

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            leagues = user_input.get(CONF_LEAGUES, DEFAULT_LEAGUES)
            if isinstance(leagues, str):
                leagues = [leagues]
            leagues = [str(x).strip().lower() for x in (leagues or [])]

            return self.async_create_entry(
                title="",
                data={
                    CONF_LEAGUES: leagues,
                    CONF_POLL_INTERVAL: int(user_input.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL)),
                    CONF_TICKER_SPEED: int(user_input.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED)),
                    CONF_TICKER_THEME: str(user_input.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME)),
                },
            )

        current = {**self._config_entry.data, **self._config_entry.options}

        schema = vol.Schema(
            {
                vol.Required(
                    CONF_LEAGUES,
                    default=current.get(CONF_LEAGUES, DEFAULT_LEAGUES),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=_league_options(),
                        multiple=True,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
                vol.Optional(
                    CONF_POLL_INTERVAL,
                    default=current.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
                ): vol.All(vol.Coerce(int), vol.Range(min=15, max=600)),
                vol.Optional(
                    CONF_TICKER_SPEED,
                    default=current.get(CONF_TICKER_SPEED, DEFAULT_TICKER_SPEED),
                ): vol.All(vol.Coerce(int), vol.Range(min=4, max=40)),
                vol.Optional(
                    CONF_TICKER_THEME,
                    default=current.get(CONF_TICKER_THEME, DEFAULT_TICKER_THEME),
                ): selector.SelectSelector(
                    selector.SelectSelectorConfig(
                        options=[
                            {"value": TICKER_THEME_LIGHT, "label": "Light"},
                            {"value": TICKER_THEME_DARK, "label": "Dark"},
                        ],
                        multiple=False,
                        mode=selector.SelectSelectorMode.DROPDOWN,
                    )
                ),
            }
        )

        return self.async_show_form(step_id="init", data_schema=schema)