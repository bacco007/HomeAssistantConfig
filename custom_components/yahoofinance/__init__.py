"""
The Yahoo finance component.

https://github.com/iprak/yahoofinance
"""

from datetime import timedelta
import logging
from typing import Union

from homeassistant.const import CONF_SCAN_INTERVAL
from homeassistant.helpers import discovery
import homeassistant.helpers.config_validation as cv
import voluptuous as vol

from custom_components.yahoofinance.coordinator import YahooSymbolUpdateCoordinator

from .const import (
    CONF_DECIMAL_PLACES,
    CONF_INCLUDE_FIFTY_DAY_VALUES,
    CONF_INCLUDE_POST_VALUES,
    CONF_INCLUDE_PRE_VALUES,
    CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
    CONF_SHOW_TRENDING_ICON,
    CONF_SYMBOLS,
    CONF_TARGET_CURRENCY,
    DEFAULT_CONF_DECIMAL_PLACES,
    DEFAULT_CONF_INCLUDE_FIFTY_DAY_VALUES,
    DEFAULT_CONF_INCLUDE_POST_VALUES,
    DEFAULT_CONF_INCLUDE_PRE_VALUES,
    DEFAULT_CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES,
    DEFAULT_CONF_SHOW_TRENDING_ICON,
    DOMAIN,
    HASS_DATA_CONFIG,
    HASS_DATA_COORDINATOR,
    SERVICE_REFRESH,
)
from .coordinator import YahooSymbolUpdateCoordinator

_LOGGER = logging.getLogger(__name__)
DEFAULT_SCAN_INTERVAL = timedelta(hours=6)
MINIMUM_SCAN_INTERVAL = timedelta(seconds=30)


BASIC_SYMBOL_SCHEMA = vol.All(cv.string, vol.Upper)

COMPLEX_SYMBOL_SCHEMA = vol.All(
    dict,
    vol.Schema(
        {
            vol.Required("symbol"): BASIC_SYMBOL_SCHEMA,
            vol.Optional(CONF_TARGET_CURRENCY): BASIC_SYMBOL_SCHEMA,
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
                ): vol.Any("none", "None", cv.positive_time_period),
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
            }
        )
    },
    # The complete HA configuration is passed down to`async_setup`, allow the extra keys.
    extra=vol.ALLOW_EXTRA,
)


def parse_scan_interval(scan_interval: Union[timedelta, str]) -> timedelta:
    """Parse and validate scan_interval."""
    if isinstance(scan_interval, str):
        if isinstance(scan_interval, str):
            if scan_interval.lower() == "none":
                scan_interval = None
            else:
                raise vol.Invalid(
                    f"Invalid {CONF_SCAN_INTERVAL} specified: {scan_interval}"
                )
    elif scan_interval < MINIMUM_SCAN_INTERVAL:
        raise vol.Invalid("Scan interval should be at least 30 seconds.")

    return scan_interval


def normalize_input(defined_symbols):
    """Normalize input and remove duplicates."""
    symbols = set()
    normalized_symbols = []

    for value in defined_symbols:
        if isinstance(value, str):
            if value not in symbols:
                symbols.add(value)
                normalized_symbols.append({"symbol": value})
        else:
            if value["symbol"] not in symbols:
                symbols.add(value["symbol"])
                normalized_symbols.append(value)

    return (list(symbols), normalized_symbols)


async def async_setup(hass, config) -> bool:
    """Set up the component."""
    domain_config = config.get(DOMAIN, {})
    defined_symbols = domain_config.get(CONF_SYMBOLS, [])

    symbols, normalized_symbols = normalize_input(defined_symbols)
    domain_config[CONF_SYMBOLS] = normalized_symbols

    scan_interval = parse_scan_interval(domain_config.get(CONF_SCAN_INTERVAL))

    # Populate parsed value into domain_config
    domain_config[CONF_SCAN_INTERVAL] = scan_interval

    coordinator = YahooSymbolUpdateCoordinator(symbols, hass, scan_interval)

    # Refresh coordinator to get initial symbol data
    _LOGGER.info(
        "Requesting data from coordinator with update interval of %s.", scan_interval
    )
    await coordinator.async_refresh()

    # Pass down the coordinator and config to platforms.
    hass.data[DOMAIN] = {
        HASS_DATA_COORDINATOR: coordinator,
        HASS_DATA_CONFIG: domain_config,
    }

    async def handle_refresh_symbols(_call):
        """Refresh symbol data."""
        _LOGGER.info("Processing refresh_symbols")
        await coordinator.async_request_refresh()

    hass.services.async_register(
        DOMAIN,
        SERVICE_REFRESH,
        handle_refresh_symbols,
    )

    if not coordinator.last_update_success:
        _LOGGER.debug("Coordinator did not report any data, requesting async_refresh")
        hass.async_create_task(coordinator.async_request_refresh())

    hass.async_create_task(
        discovery.async_load_platform(hass, "sensor", DOMAIN, {}, config)
    )

    return True
