"""
Constants for the HA WeatherSense integration.

@license: CC BY-NC-SA 4.0 International
@author: SMKRV
@github: https://github.com/smkrv/ha-weathersense
@source: https://github.com/smkrv/ha-weathersense
"""
DOMAIN = "weathersense"
NAME = "WeatherSense"

# Configuration options
CONF_TEMPERATURE_SENSOR = "temperature_sensor"
CONF_HUMIDITY_SENSOR = "humidity_sensor"
CONF_WIND_SPEED_SENSOR = "wind_speed_sensor"
CONF_PRESSURE_SENSOR = "pressure_sensor"
CONF_IS_OUTDOOR = "is_outdoor"
CONF_SOLAR_RADIATION_SENSOR = "solar_radiation_sensor"
CONF_TIME_OF_DAY = "time_of_day"
CONF_DISPLAY_UNIT = "display_unit"

# Default values
DEFAULT_NAME = "Feels Like Temperature"
DEFAULT_IS_OUTDOOR = True

# Comfort levels (short form)
COMFORT_EXTREME_COLD = "extreme_cold"
COMFORT_VERY_COLD = "very_cold"
COMFORT_COLD = "cold"
COMFORT_COOL = "cool"
COMFORT_SLIGHTLY_COOL = "slightly_cool"
COMFORT_COMFORTABLE = "comfortable"
COMFORT_SLIGHTLY_WARM = "slightly_warm"
COMFORT_WARM = "warm"
COMFORT_HOT = "hot"
COMFORT_VERY_HOT = "very_hot"
COMFORT_EXTREME_HOT = "extreme_hot"

# Comfort level descriptions
COMFORT_DESCRIPTIONS = {
    COMFORT_EXTREME_COLD: "Extreme Cold Stress",
    COMFORT_VERY_COLD: "Very Strong Cold Stress",
    COMFORT_COLD: "Strong Cold Stress",
    COMFORT_COOL: "Moderate Cold Stress",
    COMFORT_SLIGHTLY_COOL: "Slight Cold Stress",
    COMFORT_COMFORTABLE: "No Thermal Stress (Comfort)",
    COMFORT_SLIGHTLY_WARM: "Slight Heat Stress",
    COMFORT_WARM: "Moderate Heat Stress",
    COMFORT_HOT: "Strong Heat Stress",
    COMFORT_VERY_HOT: "Very Strong Heat Stress",
    COMFORT_EXTREME_HOT: "Extreme Heat Stress"
}

# Comfort level detailed explanations
COMFORT_EXPLANATIONS = {
    COMFORT_EXTREME_COLD: "Extreme risk: frostbite possible in less than 5 minutes",
    COMFORT_VERY_COLD: "High risk: frostbite possible in 5-10 minutes",
    COMFORT_COLD: "Warning: frostbite possible in 10-30 minutes",
    COMFORT_COOL: "Caution: prolonged exposure may cause discomfort",
    COMFORT_SLIGHTLY_COOL: "Slightly cool: light discomfort for sensitive individuals",
    COMFORT_COMFORTABLE: "Optimal thermal conditions: most people feel comfortable",
    COMFORT_SLIGHTLY_WARM: "Slightly warm: light discomfort for sensitive individuals",
    COMFORT_WARM: "Caution: fatigue possible with prolonged exposure",
    COMFORT_HOT: "Extreme caution: heat exhaustion possible",
    COMFORT_VERY_HOT: "Danger: heat cramps and exhaustion likely",
    COMFORT_EXTREME_HOT: "Extreme danger: heat stroke imminent"
}

COMFORT_ICONS = {
    COMFORT_EXTREME_COLD:  "mdi:snowflake-alert",
    COMFORT_VERY_COLD:     "mdi:snowflake-thermometer",
    COMFORT_COLD:          "mdi:thermometer-low",
    COMFORT_COOL:          "mdi:thermometer-minus",
    COMFORT_SLIGHTLY_COOL: "mdi:thermometer-minus",
    COMFORT_COMFORTABLE:   "mdi:hand-okay",
    COMFORT_SLIGHTLY_WARM: "mdi:thermometer-plus",
    COMFORT_WARM:          "mdi:thermometer-high",
    COMFORT_HOT:           "mdi:thermometer-alert",
    COMFORT_VERY_HOT:      "mdi:heat-wave",
    COMFORT_EXTREME_HOT:   "mdi:fire-alert",
}

# Sensor attributes
ATTR_COMFORT_LEVEL = "comfort_level"
ATTR_COMFORT_DESCRIPTION = "comfort_description"
ATTR_COMFORT_EXPLANATION = "comfort_explanation"
ATTR_CALCULATION_METHOD = "calculation_method"
ATTR_TEMPERATURE = "temperature"
ATTR_HUMIDITY = "humidity"
ATTR_WIND_SPEED = "wind_speed"
ATTR_PRESSURE = "pressure"
ATTR_IS_OUTDOOR = "is_outdoor"
ATTR_TIME_OF_DAY = "time_of_day"
ATTR_IS_COMFORTABLE = "is_comfortable"
