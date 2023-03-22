"""Constants for the Solcast Solar integration."""
from __future__ import annotations

from typing import Final

DOMAIN = "solcast_solar"
SOLCAST_URL = "https://api.solcast.com.au"

CONST_DISABLEAUTOPOLL = "const_disableautopoll"

ATTR_ENTRY_TYPE: Final = "entry_type"
ENTRY_TYPE_SERVICE: Final = "service"

ATTRIBUTION: Final = "Data retrieved from Solcast"

SERVICE_UPDATE = "update_forecasts"
SERVICE_ACTUALS_UPDATE = "update_actual_forecasts"
SERVICE_CLEAR_DATA = "clear_all_solcast_data"