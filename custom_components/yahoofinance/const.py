"""Constants for Yahoo Finance sensor."""

from __future__ import annotations

from datetime import timedelta
from typing import Final

# Additional attributes exposed by the sensor
ATTR_CURRENCY_SYMBOL: Final = "currencySymbol"
ATTR_QUOTE_TYPE: Final = "quoteType"
ATTR_QUOTE_SOURCE_NAME: Final = "quoteSourceName"
ATTR_SYMBOL: Final = "symbol"
ATTR_TRENDING: Final = "trending"
ATTR_MARKET_STATE: Final = "marketState"
ATTR_DIVIDEND_DATE: Final = "dividendDate"

# Hass data
HASS_DATA_CONFIG: Final = "config"
HASS_DATA_COORDINATORS: Final = "coordinators"

# JSON data pieces
DATA_CURRENCY_SYMBOL: Final = "currency"
DATA_FINANCIAL_CURRENCY: Final = "financialCurrency"
DATA_QUOTE_TYPE: Final = "quoteType"
DATA_QUOTE_SOURCE_NAME: Final = "quoteSourceName"
DATA_SHORT_NAME: Final = "shortName"
DATA_MARKET_STATE: Final = "marketState"
DATA_DIVIDEND_DATE: Final = "dividendDate"

DATA_REGULAR_MARKET_PREVIOUS_CLOSE: Final = "regularMarketPreviousClose"
DATA_REGULAR_MARKET_PRICE: Final = "regularMarketPrice"

CONF_DECIMAL_PLACES: Final = "decimal_places"
CONF_INCLUDE_FIFTY_DAY_VALUES: Final = "include_fifty_day_values"
CONF_INCLUDE_POST_VALUES: Final = "include_post_values"
CONF_INCLUDE_PRE_VALUES: Final = "include_pre_values"
CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES: Final = "include_two_hundred_day_values"
CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES: Final = "include_fifty_two_week_values"
CONF_SHOW_TRENDING_ICON: Final = "show_trending_icon"
CONF_TARGET_CURRENCY: Final = "target_currency"
CONF_NO_UNIT: Final = "no_unit"

DEFAULT_CONF_DECIMAL_PLACES: Final = 2
DEFAULT_CONF_INCLUDE_FIFTY_DAY_VALUES: Final = True
DEFAULT_CONF_INCLUDE_POST_VALUES: Final = True
DEFAULT_CONF_INCLUDE_PRE_VALUES: Final = True
DEFAULT_CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES: Final = True
DEFAULT_CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES: Final = True
DEFAULT_CONF_SHOW_TRENDING_ICON: Final = False
DEFAULT_CONF_NO_UNIT: Final = False

DEFAULT_NUMERIC_DATA_GROUP: Final = "default"

# Data keys grouped into categories. The values for the categories except for
# DEFAULT_NUMERIC_DATA_GROUP can be conditionally pulled into attributes. The
# first value of the set is the key and the second boolean value indicates if
# the attribute is a currency.
NUMERIC_DATA_GROUPS: Final = {
    DEFAULT_NUMERIC_DATA_GROUP: [
        ("averageDailyVolume10Day", False),
        ("averageDailyVolume3Month", False),
        ("regularMarketChange", True),
        ("regularMarketChangePercent", False),
        ("regularMarketDayHigh", True),
        ("regularMarketDayLow", True),
        (DATA_REGULAR_MARKET_PREVIOUS_CLOSE, True),
        (DATA_REGULAR_MARKET_PRICE, True),
        ("regularMarketVolume", False),
        ("regularMarketTime", False),
        (DATA_DIVIDEND_DATE, False),
    ],
    CONF_INCLUDE_FIFTY_DAY_VALUES: [
        ("fiftyDayAverage", True),
        ("fiftyDayAverageChange", True),
        ("fiftyDayAverageChangePercent", False),
    ],
    CONF_INCLUDE_PRE_VALUES: [
        ("preMarketChange", True),
        ("preMarketChangePercent", False),
        ("preMarketTime", False),
        ("preMarketPrice", True),
    ],
    CONF_INCLUDE_POST_VALUES: [
        ("postMarketChange", True),
        ("postMarketChangePercent", False),
        ("postMarketPrice", True),
        ("postMarketTime", False),
    ],
    CONF_INCLUDE_TWO_HUNDRED_DAY_VALUES: [
        ("twoHundredDayAverage", True),
        ("twoHundredDayAverageChange", True),
        ("twoHundredDayAverageChangePercent", False),
    ],
    CONF_INCLUDE_FIFTY_TWO_WEEK_VALUES: [
        ("fiftyTwoWeekLow", True),
        ("fiftyTwoWeekLowChange", True),
        ("fiftyTwoWeekLowChangePercent", False),
        ("fiftyTwoWeekHigh", True),
        ("fiftyTwoWeekHighChange", True),
        ("fiftyTwoWeekHighChangePercent", False),
    ],
}

PERCENTAGE_DATA_KEYS_NEEDING_MULTIPLICATION: Final = [
    "fiftyDayAverageChangePercent",
    "twoHundredDayAverageChangePercent",
    "fiftyTwoWeekLowChangePercent",
    "fiftyTwoWeekHighChangePercent",
]


# Defaults for missing numeric keys
NUMERIC_DATA_DEFAULTS: Final = {DATA_DIVIDEND_DATE: None}

STRING_DATA_KEYS: Final = [
    DATA_CURRENCY_SYMBOL,
    DATA_FINANCIAL_CURRENCY,
    DATA_QUOTE_TYPE,
    DATA_QUOTE_SOURCE_NAME,
    DATA_SHORT_NAME,
    DATA_MARKET_STATE,
]


ATTRIBUTION: Final = "Data provided by Yahoo Finance"
BASE: Final = "https://query1.finance.yahoo.com/v7/finance/quote?symbols="

CRUMB_URL: Final = "https://finance.yahoo.com/quote/NQ%3DF"
CONSENT_HOST: Final = "consent.yahoo.com"
GET_CRUMB_URL: Final = "https://query2.finance.yahoo.com/v1/test/getcrumb"

# pylint: disable=line-too-long
USER_AGENT: Final = "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
HEADER_ACCEPT: Final = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
# pylint: enable=line-too-long

HEADER_ACCEPT_ENCODING: Final = "gzip, deflate, br"

REQUEST_HEADERS: Final = {
    "User-Agent": USER_AGENT,
    "accept-encoding": HEADER_ACCEPT_ENCODING,
    "accept": HEADER_ACCEPT,
}

CONF_SYMBOLS: Final = "symbols"
DEFAULT_CURRENCY: Final = "USD"
DEFAULT_CURRENCY_SYMBOL: Final = "$"
DOMAIN: Final = "yahoofinance"
SERVICE_REFRESH: Final = "refresh_symbols"

DEFAULT_SCAN_INTERVAL: Final = timedelta(hours=6)
MINIMUM_SCAN_INTERVAL: Final = timedelta(seconds=30)

CURRENCY_CODES: Final = {
    "bdt": "৳",
    "brl": "R$",
    "btc": "₿",
    "chf": "₣",
    "cny": "¥",
    "eth": "Ξ",
    "eur": "€",
    "gbp": "£",
    "ils": "₪",
    "inr": "₹",
    "jpy": "¥",
    "krw": "₩",
    "kzt": "лв",
    "ngn": "₦",
    "php": "₱",
    "rial": "﷼",
    "rub": "₽",
    "sign": "",
    "try": "₺",
    "twd": "$",
    "usd": "$",
}
