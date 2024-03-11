import voluptuous as vol

from homeassistant.helpers import config_validation as cv

"""Constants used for Awtrix."""

DOMAIN = "awtrix"
CONF_DEVICE = "device"
DATA_CONFIG_ENTRIES = "config_entries"
DATA_CONFIG_ENTRY = "config_entry"

# Services
SERVICE_PUSH_APP_DATA = "push_app_data"
SERVICE_SETTINGS = "settings"
SERVICE_SWITCH_APP = "switch_app"
SERVICE_WEATHER_APP = "weather_app"
SERVICES = [
    SERVICE_PUSH_APP_DATA,
    SERVICE_SETTINGS,
    SERVICE_SWITCH_APP,
    SERVICE_WEATHER_APP
]

SERVICE_DATA = "data"
SERVICE_APP_NAME = "name"

SERVICE_PUSH_APP_DATA_SCHEMA = vol.All(
    vol.Schema(
        {
            vol.Required(SERVICE_APP_NAME): str,
            vol.Required(SERVICE_DATA, default={}): dict,
        }
    ),
    cv.has_at_least_one_key(SERVICE_APP_NAME),
)

SERVICE_SWITCH_APP_SCHEMA = vol.All(
    vol.Schema(
        {
            vol.Required(SERVICE_APP_NAME): str,
        }
    ),
    cv.has_at_least_one_key(SERVICE_APP_NAME),
)

SERVICE_SETTINGS_SCHEMA = vol.All(
)

SERVICE_WEATHER_APP_SCHEMA = vol.All(
    vol.Schema(
        {
            vol.Required("weather"): cv.entity_id,
            vol.Optional("outside_temperature"): cv.entity_id,
            vol.Optional("home_temperature"): cv.entity_id,
            vol.Optional("sensor"): cv.entity_id,
            vol.Optional("sun"): cv.entity_id,
            vol.Optional("moon"): cv.entity_id,
            vol.Optional("data", default={}): dict
        }
    ),
    extra=vol.ALLOW_EXTRA,
)

SERVICE_PUSH_APP_DATA_FIELDS = {
    "name": {
        "description": "The application name",
        "required": True,
        "example": "Test",
        "selector": {
            "text": ""
        }
    },
    "data": {
        "example": 'text : "Hello, AWTRIX Light!"\nrainbow: true\nicon: "87"\nduration: 5\npushIcon: 2\nlifetime: 900\nrepeat: 1',
        "selector": {
            "object": ""
        }
    }
}
SERVICE_SWITCH_APP_FIELDS = {
    "name": {
        "description": "The application name",
        "required": True,
        "example": "Test",
        "selector": {
            "text": ""
        }
    }
}
SERVICE_SETTINGS_FIELDS = {
}

SERVICE_WEATHER_APP_FIELDS = {
    "weather": {
        "description": "Weather entity",
        "required": True,
        "example": "weather.forecast_home",
        "selector": {
            "entity": {
                "domain": "weather"
            }
        }
    },
    "outside_temperature": {
        "description": "Outside temperature entity",
        "example": "sensor.easyweatherv1_6_4_outdoor_temperature",
        "required": False,
        "selector": {
            "entity": {
                "domain": "sensor",
                "device_class": "temperature"
            }
        }
    },
    "home_temperature": {
        "description": "Home (average) temperature entity",
        "example": "sensor.home_temperature",
        "required": False,
        "selector": {
            "entity": {
                "domain": "sensor",
                "device_class": "temperature"
            }
        }
    },
    "moon": {
        "description": "Moon phase entity",
        "example": "sensor.moon_phase",
        "required": False,
        "selector": {
            "entity": {
                "domain": "sensor",
                "device_class": "enum"
            }
        }
    },
    "sun": {
        "description": "Sun entity",
        "example": "sun.sun",
        "required": False,
        "selector": {
            "entity": {
                "domain": "sun"
            }
        }
    }
}

SERVICE_TO_FIELDS = {
    SERVICE_PUSH_APP_DATA: SERVICE_PUSH_APP_DATA_FIELDS,
    SERVICE_SETTINGS: SERVICE_SETTINGS_FIELDS,
    SERVICE_SWITCH_APP: SERVICE_SWITCH_APP_FIELDS,
    SERVICE_WEATHER_APP: SERVICE_WEATHER_APP_FIELDS
}

SERVICE_TO_SCHEMA = {
    SERVICE_PUSH_APP_DATA: SERVICE_PUSH_APP_DATA_SCHEMA,
    SERVICE_SETTINGS: SERVICE_SETTINGS_SCHEMA,
    SERVICE_SWITCH_APP: SERVICE_SWITCH_APP_SCHEMA,
    SERVICE_WEATHER_APP: SERVICE_WEATHER_APP_SCHEMA
}
