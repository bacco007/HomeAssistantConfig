"""Constants for Yahoo Finance sensor."""

ATTR_CURRENCY_SYMBOL = "currencySymbol"
ATTR_FIFTY_DAY_AVERAGE = "fiftyDayAverage"
ATTR_FIFTY_DAY_AVERAGE_CHANGE = "fiftyDayAverageChange"
ATTR_FIFTY_DAY_AVERAGE_CHANGE_PERCENTAGE = "fiftyDayAverageChangePercent"
ATTR_PREVIOUS_CLOSE = "previousClose"
ATTR_MARKET_CHANGE = "marketChange"
ATTR_MARKET_CHANGE_PERCENTAGE = "marketChangePercent"
ATTR_SYMBOL = "symbol"
ATTRIBUTION = "Data provided by Yahoo Finance"

BASE = "https://query1.finance.yahoo.com/v7/finance/quote?symbols="
CONF_SHOW_TRENDING_ICON = "show_trending_icon"
CONF_SYMBOLS = "symbols"
DEFAULT_CURRENCY = "USD"
DEFAULT_CURRENCY_SYMBOL = "$"
DEFAULT_ICON = "mdi:currency-usd"
DOMAIN = "yahoofinance"
SERVICE_REFRESH = "refresh_symbols"

CURRENCY_CODES = {
    "bdt": "৳",
    "brl": "R$",
    "btc": "₿",
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
