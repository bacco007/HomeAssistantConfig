'''Weather history class defn constants.'''

DOMAIN                  = 'openweathermaphistory'
CONST_API_CALL          = 'https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=%s&lon=%s&dt=%s&appid=%s&units=metric'
CONST_API_FORECAST      = 'https://api.openweathermap.org/data/3.0/onecall?lat=%s&lon=%s&exclude=minutely,alerts&appid=%s&units=metric'
CONF_FORMULA            = "formula"
CONF_DATA               = "data"
CONF_ATTRIBUTES         = "attributes"
CONF_MAX_DAYS           = "max_days"
CONF_INTIAL_DAYS        = "initial_days"
CONF_PRECISION          = "numeric_precision"
CONF_STATECLASS         = "state_class"
CONF_SENSORCLASS        = "sensor_class"
CONF_UID                = "unique_id"

#prevent accidental duplicate instances
CONST_PROXIMITY         = 1000
#max calls in a single refresh
CONST_CALLS             = 24
#max calls in any 24 hour period
CONF_MAX_CALLS          = "max_calls"

ATTRIBUTION             = "Data provided by OpenWeatherMap"
