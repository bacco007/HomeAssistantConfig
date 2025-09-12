"""
Support for Weather.com weather service.
For more details about this platform, please refer to the documentation at
https://github.com/jaydeethree/Home-Assistant-weatherdotcom
"""
from typing import Final

from homeassistant.components.weather import (
    ATTR_CONDITION_CLEAR_NIGHT,
    ATTR_CONDITION_CLOUDY,
    ATTR_CONDITION_EXCEPTIONAL,
    ATTR_CONDITION_FOG,
    ATTR_CONDITION_HAIL,
    ATTR_CONDITION_LIGHTNING,
    ATTR_CONDITION_LIGHTNING_RAINY,
    ATTR_CONDITION_PARTLYCLOUDY,
    ATTR_CONDITION_POURING,
    ATTR_CONDITION_RAINY,
    ATTR_CONDITION_SNOWY,
    ATTR_CONDITION_SNOWY_RAINY,
    ATTR_CONDITION_SUNNY,
    ATTR_CONDITION_WINDY,
    ATTR_CONDITION_WINDY_VARIANT
)

DOMAIN = 'weatherdotcom'
# MANUFACTURER = 'WeatherUnderground'
# NAME = 'WeatherUnderground'
CONF_ATTRIBUTION = 'Data provided by the Weather.com weather service'
CONF_LANG = 'lang'

ENTRY_WEATHER_COORDINATOR = 'weather_coordinator'

# Language Supported Codes
LANG_CODES = [
    'am-ET', 'ar-AE', 'az-AZ', 'bg-BG', 'bn-BD', 'bn-IN', 'bs-BA', 'ca-ES', 'cs-CZ', 'da-DK', 'de-DE', 'el-GR', 'en-GB',
    'en-IN', 'en-US', 'es-AR', 'es-ES', 'es-LA', 'es-MX', 'es-UN', 'es-US', 'et-EE', 'fa-IR', 'fi-FI', 'fr-CA', 'fr-FR',
    'gu-IN', 'he-IL', 'hi-IN', 'hr-HR', 'hu-HU', 'in-ID', 'is-IS', 'it-IT', 'iw-IL', 'ja-JP', 'jv-ID', 'ka-GE', 'kk-KZ',
    'km-KH', 'kn-IN', 'ko-KR', 'lo-LA', 'lt-LT', 'lv-LV', 'mk-MK', 'mn-MN', 'mr-IN', 'ms-MY', 'my-MM', 'ne-IN', 'ne-NP',
    'nl-NL', 'no-NO', 'om-ET', 'pa-IN', 'pa-PK', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'si-LK', 'sk-SK', 'sl-SI',
    'sq-AL', 'sr-BA', 'sr-ME', 'sr-RS', 'sv-SE', 'sw-KE', 'ta-IN', 'ta-LK', 'te-IN', 'ti-ER', 'ti-ET', 'tg-TJ', 'th-TH',
    'tk-TM', 'tl-PH', 'tr-TR', 'uk-UA', 'ur-PK', 'uz-UZ', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-TW'
]
# Only the TWC  5-day forecast API handles the translation of phrases for values of the following data.
# However, when formatting a request URL a valid language must be passed along.
# dayOfWeek,daypartName,moonPhase,qualifierPhrase,uvDescription,windDirectionCardinal,windPhrase,wxPhraseLong

ICON_CONDITION_MAP: Final[dict[str, list[int]]] = {
    ATTR_CONDITION_CLEAR_NIGHT: [31, 33],
    ATTR_CONDITION_CLOUDY: [26, 27, 28],
    ATTR_CONDITION_EXCEPTIONAL: [0, 1, 2, 19, 22, 36],  # 44 is Not Available (N/A)
    ATTR_CONDITION_FOG: [20, 21],
    ATTR_CONDITION_HAIL: [17],
    ATTR_CONDITION_LIGHTNING: [],
    ATTR_CONDITION_LIGHTNING_RAINY: [3, 4, 37, 38, 47],
    ATTR_CONDITION_PARTLYCLOUDY: [29, 30],
    ATTR_CONDITION_POURING: [40],
    ATTR_CONDITION_RAINY: [9, 11, 12, 39, 45],
    ATTR_CONDITION_SNOWY: [13, 14, 15, 16, 41, 42, 43, 46],
    ATTR_CONDITION_SNOWY_RAINY: [5, 6, 7, 8, 10, 18, 25, 35],
    ATTR_CONDITION_SUNNY: [32, 34],
    ATTR_CONDITION_WINDY: [23, 24],
    ATTR_CONDITION_WINDY_VARIANT: []
}

DEFAULT_LANG = 'en-US'
API_IMPERIAL: Final = "imperial"
API_METRIC: Final = "metric"
API_URL_IMPERIAL: Final = "e"
API_URL_METRIC: Final = "m"

TEMPUNIT = 0
LENGTHUNIT = 1
SPEEDUNIT = 3
PRESSUREUNIT = 4

RESULTS_CURRENT = 'current'
RESULTS_FORECAST_DAILY = 'daily'
RESULTS_FORECAST_HOURLY = 'hourly'

FIELD_CLOUD_COVER = 'cloudCover'
FIELD_DAYPART = 'daypart'
FIELD_DESCRIPTION = 'wxPhraseLong'
FIELD_DEW_POINT = 'temperatureDewPoint'
FIELD_FEELS_LIKE = 'temperatureFeelsLike'
FIELD_HUMIDITY = 'relativeHumidity'
FIELD_ICONCODE = 'iconCode'
FIELD_PRECIPCHANCE = 'precipChance'
FIELD_PRESSURE = 'pressureAltimeter'
FIELD_QPF = 'qpf'
FIELD_TEMPERATUREMAX = 'temperatureMax'
FIELD_TEMPERATUREMIN = 'temperatureMin'
FIELD_TEMP = 'temperature'
FIELD_UV_INDEX = 'uvIndex'
FIELD_VALIDTIMEUTC = 'validTimeUtc'
FIELD_VISIBILITY = 'visibility'
FIELD_WINDDIRECTIONCARDINAL = 'windDirectionCardinal'
FIELD_WINDDIR = 'windDirection'
FIELD_WINDGUST = 'windGust'
FIELD_WINDSPEED = 'windSpeed'

ICON_THERMOMETER = 'mdi:thermometer'
ICON_UMBRELLA = 'mdi:umbrella'
ICON_WIND = 'mdi:weather-windy'

HIGH_TEMP_TODAY_STORAGE = 'high_temp_today'
HIGH_TEMP_TODAY_TIMESTAMP_STORAGE = 'high_temp_today_timestamp'