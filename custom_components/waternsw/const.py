from __future__ import annotations

from datetime import timedelta

DOMAIN = "waternsw"

CONF_SITE_ID = "site_id"
CONF_WATERBODY_NAME = "waterbody_name"
CONF_UNIT_OF_MEASURE = "unit_of_measure"

DEFAULT_ICON = "mdi:water"

ATTRIBUTION = "Data provided by WaterNSW Real Time Data Platform"

UPDATE_INTERVAL = timedelta(minutes=10)
STALE_AFTER_DAYS = 7
REQUEST_TIMEOUT = 30

WATERBODY_SENSOR_TYPES: list[dict] = [
    {
        "key": "volume",
        "name_suffix": "Volume",
        "from_variable": "130.00",
        "to_variable": "136.00",
        "unit_of_measure": "ML",
        "icon": "mdi:waves-arrow-up",
    },
    {
        "key": "water_level",
        "name_suffix": "Water Level",
        "from_variable": "130.00",
        "to_variable": "130.00",
        "unit_of_measure": "m",
        "icon": "mdi:ruler-vertical",
    },
    {
        "key": "storage",
        "name_suffix": "Storage",
        "from_variable": "130.00",
        "to_variable": "448.00",
        "unit_of_measure": "%",
        "icon": "mdi:gauge",
    },
    {
        "key": "rainfall",
        "name_suffix": "Rainfall",
        "from_variable": "10.00",
        "to_variable": "10.00",
        "unit_of_measure": "mm",
        "icon": "mdi:weather-rainy",
    },
    {
        "key": "net_inflow_24h",
        "name_suffix": "Net Inflow (24hrs)",
        "from_variable": "422.00",
        "to_variable": "422.00",
        "unit_of_measure": "ML",
        "icon": "mdi:arrow-down-bold-circle",
    },
    {
        "key": "releases_24h",
        "name_suffix": "Releases (24hrs)",
        "from_variable": "459.00",
        "to_variable": "459.00",
        "unit_of_measure": "ML",
        "icon": "mdi:arrow-up-bold-circle",
    },
    {
        "key": "evaporation_24h",
        "name_suffix": "Evaporation (24hrs)",
        "from_variable": "700.00",
        "to_variable": "700.00",
        "unit_of_measure": "mm",
        "icon": "mdi:weather-sunny-alert",
    },
]