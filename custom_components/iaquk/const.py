"""Constants for calculate IAQ UK index."""

# Base component constants
DOMAIN = "iaquk"
VERSION = "1.1.2"
ISSUE_URL = "https://github.com/Limych/ha-iaquk/issues"
ATTRIBUTION = None
DATA_IAQUK = 'iaquk'

SUPPORT_LIB_URL = "https://github.com/Limych/iaquk/issues/new/choose"

CONF_SOURCES = "sources"
CONF_TEMPERATURE = "temperature"
CONF_HUMIDITY = "humidity"
CONF_CO2 = "co2"
CONF_TVOC = "tvoc"
CONF_PM = "pm"
CONF_NO2 = "no2"
CONF_CO = "co"
CONF_HCHO = "hcho"  # Formaldehyde

LEVEL_EXCELLENT = "Excellent"
LEVEL_GOOD = "Good"
LEVEL_FAIR = "Fair"
LEVEL_POOR = "Poor"
LEVEL_INADEQUATE = "Inadequate"
