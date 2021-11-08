"""Constants for the Solcast Solar integration."""
from __future__ import annotations

from typing import Final

DOMAIN = "solcast_solar"

ATTR_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_SERVICE: Final = "service"

ATTRIBUTION: Final = "Data retrieved from Solcast"

CONF_RESOURCE_ID = "resource_id"
CONF_SSL_DISABLE = "disable_ssl_check"
CONF_AUTO_FETCH = "disable_auto_fetching"

CONF_SOLCAST_URL = "https://api.solcast.com.au/"
