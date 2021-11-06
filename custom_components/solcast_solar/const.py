"""Constants for the Solcast Solar integration."""
from __future__ import annotations

from typing import Final

#from homeassistant.const import CONF_API_KEY

DOMAIN = "solcast_solar"


#CONF_APIKEY = "apikey"
#CONF_ROOFTOP = "rooftop"
#CONF_POLL_INTERVAL = "pollapi_interval"
ATTR_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_SERVICE: Final = "service"

DATA_COORDINATOR = "coordinator"
SERVICE_SOLCAST = "solcastservice"
ATTRIBUTION: Final = "Data retrieved from Solcast"

CONF_RESOURCE_ID = "resource_id"
CONF_API_LIMIT = "api_limit"
CONF_SSL_DISABLE = "disable_ssl_check"
CONF_AUTO_FORCAST = "disable_automatic_forecast_fetching"
CONF_AUTO_HISTORY = "disable_automatic_history_fetching"