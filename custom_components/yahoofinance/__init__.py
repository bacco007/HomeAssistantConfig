"""The Yahoo finance component.

https://github.com/iprak/yahoofinance
"""

from __future__ import annotations

from datetime import timedelta
import logging

import voluptuous as vol

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import discovery
import homeassistant.helpers.config_validation as cv
from homeassistant.helpers.event import async_call_later
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_DECIMAL_PLACES,
    CONF_INCLUDE_FIFTY_DAY_VALUES,
    CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES,
    CONF_INCLUDE_POST_VALUES,
    CONF_INCLUDE_PRE_VALUES,
    CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
    CONF_NO_UNIT,
    CONF_SHOW_TRENDING_ICON,
    CONF_SYMBOLS,
    CONF_TARGET_CURRENCY,
    CRUMB_RETRY_DELAY,
    DEFAULT_CONF_DECIMAL_PLACES,
    DEFAULT_CONF_INCLUDE_FIFTY_DAY_VALUES,
    DEFAULT_CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES,
    DEFAULT_CONF_INCLUDE_POST_VALUES,
    DEFAULT_CONF_INCLUDE_PRE_VALUES,
    DEFAULT_CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
    DEFAULT_CONF_NO_UNIT,
    DEFAULT_CONF_SHOW_TRENDING_ICON,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    HASS_DATA_CONFIG,
    HASS_DATA_COORDINATORS,
    MANUAL_SCAN_INTERVAL,
    MINIMUM_SCAN_INTERVAL,
    SERVICE_REFRESH,
)
from .coordinator import CrumbCoordinator, YahooSymbolUpdateCoordinator

_LOGGER = logging.getLogger(__name__)
BASIC_SYMBOL_SCHEMA = vol.All(cv.string, vol.Upper)

def minimum_scan_interval(value: timedelta) -> timedelta:
    """Validate scan_interval is the minimum value."""
    if value < MINIMUM_SCAN_INTERVAL:
        raise vol.Invalid("Scan interval should be at least 30 seconds")
    return value

MANUAL_SCAN_INTERVAL_SCHEMA = vol.All(vol.Lower, MANUAL_SCAN_INTERVAL)
CUSTOM_SCAN_INTERVAL_SCHEMA = vol.All(cv.time_period, minimum_scan_interval)
SCAN_INTERVAL_SCHEMA = vol.Any(MANUAL_SCAN_INTERVAL_SCHEMA, CUSTOM_SCAN_INTERVAL_SCHEMA)

COMPLEX_SYMBOL_SCHEMA = vol.All(
    dict,
    vol.Schema(
        {
            vol.Required("symbol"): BASIC_SYMBOL_SCHEMA,
            vol.Optional(CONF_TARGET_CURRENCY): BASIC_SYMBOL_SCHEMA,
            vol.Optional(CONF_SCAN_INTERVAL): SCAN_INTERVAL_SCHEMA,
            vol.Optional(CONF_NO_UNIT, default=DEFAULT_CONF_NO_UNIT): cv.boolean,
        }
    ),
)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Required(CONF_SYMBOLS): vol.All(
                    cv.ensure_list,
                    [vol.Any(BASIC_SYMBOL_SCHEMA, COMPLEX_SYMBOL_SCHEMA)],
                ),
                vol.Optional(
                    CONF_SCAN_INTERVAL, default=DEFAULT_SCAN_INTERVAL
                ): SCAN_INTERVAL_SCHEMA,
                vol.Optional(CONF_TARGET_CURRENCY): vol.All(cv.string, vol.Upper),
                vol.Optional(
                    CONF_SHOW_TRENDING_ICON, default=DEFAULT_CONF_SHOW_TRENDING_ICON
                ): cv.boolean,
                vol.Optional(
                    CONF_DECIMAL_PLACES, default=DEFAULT_CONF_DECIMAL_PLACES
                ): vol.Coerce(int),
                vol.Optional(
                    CONF_INCLUDE_FIFTY_DAY_VALUES,
                    default=DEFAULT_CONF_INCLUDE_FIFTY_DAY_VALUES,
                ): cv.boolean,
                vol.Optional(
                    CONF_INCLUDE_POST_VALUES, default=DEFAULT_CONF_INCLUDE_POST_VALUES
                ): cv.boolean,
                vol.Optional(
                    CONF_INCLUDE_PRE_VALUES, default=DEFAULT_CONF_INCLUDE_PRE_VALUES
                ): cv.boolean,
                vol.Optional(
                    CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
                    default=DEFAULT_CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
                ): cv.boolean,
                vol.Optional(
                    CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES,
                    default=DEFAULT_CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES,
                ): cv.boolean,
            }
        )
    },
    # The complete HA configuration is passed down to`async_setup`, allow the extra keys.
    extra=vol.ALLOW_EXTRA,
)


class SymbolDefinition:
    """Symbol definition."""

    symbol: str
    target_currency: str | None = None
    scan_interval: str | timedelta | None = None
    no_unit: bool = False

    def __init__(self, symbol: str, **kwargs: any) -> None:
        """Create a new symbol definition.

        ### Parameters
            symbol(str): The symbol
            **scan_interval (time_delta): The symbol scan interval
        """
        self.symbol = symbol

        if "target_currency" in kwargs:
            self.target_currency = kwargs["target_currency"]
        if "scan_interval" in kwargs:
            self.scan_interval = kwargs["scan_interval"]
        if "no_unit" in kwargs:
            self.no_unit = kwargs["no_unit"]

    def __repr__(self) -> str:
        """Return the representation."""
        return f"{self.symbol},{self.target_currency},{self.scan_interval},{self.no_unit}"

    def __eq__(self, other: any) -> bool:
        """Return the comparison."""
        return (
            isinstance(other, SymbolDefinition)
            and self.symbol == other.symbol
            and self.target_currency == other.target_currency
            and self.scan_interval == other.scan_interval
            and self.no_unit == other.no_unit
        )

    def __hash__(self) -> int:
        """Make hashable."""
        return hash((self.symbol, self.target_currency, self.scan_interval, self.no_unit))


def normalize_input_symbols(
    defined_symbols: list,
) -> tuple[list[str], list[SymbolDefinition]]:
    """Normalize input and remove duplicates."""
    symbols = set()
    symbol_definitions: list[SymbolDefinition] = []

    for value in defined_symbols:
        if isinstance(value, str):
            if value not in symbols:
                symbols.add(value)
                symbol_definitions.append(SymbolDefinition(value))
        else:
            symbol = value["symbol"]
            if symbol not in symbols:
                symbols.add(symbol)
                symbol_definitions.append(
                    SymbolDefinition(
                        symbol,
                        target_currency=value.get(CONF_TARGET_CURRENCY),
                        scan_interval=value.get(CONF_SCAN_INTERVAL),
                        no_unit=value.get(CONF_NO_UNIT),
                    )
                )

    return (list(symbols), symbol_definitions)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the component."""
    domain_config = config.get(DOMAIN, {})
    defined_symbols = domain_config.get(CONF_SYMBOLS, [])

    symbol_definitions: list[SymbolDefinition]
    symbols, symbol_definitions = normalize_input_symbols(defined_symbols)
    domain_config[CONF_SYMBOLS] = symbol_definitions

    global_scan_interval = domain_config.get(CONF_SCAN_INTERVAL)

    # Populate parsed value into domain_config
    domain_config[CONF_SCAN_INTERVAL] = global_scan_interval

    # Group symbols by scan_interval
    symbols_by_scan_interval: dict[timedelta, list[str]] = {}
    for symbol in symbol_definitions:
        # Use integration level scan_interval if none defined
        if symbol.scan_interval is None:
            symbol.scan_interval = global_scan_interval

        if symbol.scan_interval in symbols_by_scan_interval:
            symbols_by_scan_interval[symbol.scan_interval].append(symbol.symbol)
        else:
            symbols_by_scan_interval[symbol.scan_interval] = [symbol.symbol]

    _LOGGER.info("Total %d unique scan intervals", len(symbols_by_scan_interval))

     # Pass down the config to platforms.
    hass.data[DOMAIN] = {
        HASS_DATA_CONFIG: domain_config,
    }

    async def _setup_coordinator(now = None) -> None:
        crumb_coordinator = CrumbCoordinator(hass)
        crumb = await crumb_coordinator.try_get_crumb_cookies()  # Get crumb first
        if crumb is None:
            _LOGGER.warning("Unable to get crumb, re-trying in %d seconds", CRUMB_RETRY_DELAY)
            async_call_later(hass, CRUMB_RETRY_DELAY, _setup_coordinator)
            return

        coordinators: dict[timedelta, YahooSymbolUpdateCoordinator] = {}
        for key_scan_interval, symbols in symbols_by_scan_interval.items():
            _LOGGER.info(
                "Creating coordinator with scan_interval %s for symbols %s",
                key_scan_interval,
                symbols,
            )
            coordinator = YahooSymbolUpdateCoordinator(
                symbols, hass, key_scan_interval, crumb_coordinator
            )
            coordinators[key_scan_interval] = coordinator

            _LOGGER.info(
                "Requesting initial data from coordinator with update interval of %s",
                key_scan_interval,
            )
            await coordinator.async_refresh()

        # Pass down the coordinator to platforms.
        hass.data[DOMAIN][HASS_DATA_COORDINATORS] = coordinators

        async def handle_refresh_symbols(_call) -> None:
            """Refresh symbol data."""
            _LOGGER.info("Processing refresh_symbols")

            for coordinator in coordinators.values():
                await coordinator.async_refresh()

        hass.services.async_register(
            DOMAIN,
            SERVICE_REFRESH,
            handle_refresh_symbols,
        )

        for coordinator in coordinators.values():
            if not coordinator.last_update_success:
                _LOGGER.debug("Coordinator did not report any data, requesting async_refresh")
                hass.async_create_task(coordinator.async_request_refresh())

        hass.async_create_task(
            discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config)
        )

    await _setup_coordinator()
    return True


def convert_to_float(value) -> float | None:
    """Convert specified value to float."""
    try:
        return float(value)
    except:  # noqa: E722 pylint: disable=bare-except
        return None
