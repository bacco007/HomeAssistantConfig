"""Core components of AWTRIX Light."""

from datetime import datetime
import json

from homeassistant.components.media_source import Unresolvable

"""Support for AWTRIX service."""

icon_clear_night_icon = 'a12181'
icon_cloudy_icon = 'a2283'
icon_exceptional_icon = 'a2364'
icon_fog_icon = '17056'
icon_hail_icon = 'a2441'
icon_lightning_icon = 'a630'
icon_lightning_rainy_icon = 'a49299'
icon_partlycloudy_icon = 'a2286'
icon_pouring_icon = 'a49300'
icon_rainy_icon = 'a2284'
icon_snowy_icon = 'a2289'
icon_snowy_rainy_icon = 'a49301'
icon_sunny_icon = 'a2282'
icon_windy_icon = 'a15618'
icon_windy_variant_icon = 'a15618'

full_moon_icon = '2314'
waning_gibbous_icon = '2315'
last_quarter_icon = '2316'
waning_crescent_icon = '2317'
new_moon_icon = '2318'
waxing_crescent_icon = '2319'
first_quarter_icon = '2320'
waxing_gibbous_icon = '36234'

sunrise_icon = '485'
sunset_icon = '486'

home_icon = "96"


def hsv_to_rgb(h, s, v, a) -> tuple:
    """Convert HSV to RGB."""

    a = int(255*a)
    if s:
        if h == 1.0:
            h = 0.0
        i = int(h*6.0)
        f = h*6.0 - i

        w = int(255*(v * (1.0 - s)))
        q = int(255*(v * (1.0 - s * f)))
        t = int(255*(v * (1.0 - s * (1.0 - f))))
        v = int(255*v)

        if i == 0:
            return (v, t, w, a)
        if i == 1:
            return (q, v, w, a)
        if i == 2:
            return (w, v, t, a)
        if i == 3:
            return (w, q, v, a)
        if i == 4:
            return (t, w, v, a)
        if i == 5:
            return (v, w, q, a)
    else:
        v = int(255*v)
        return (v, v, v, a)


def temperature_color(temperature):
    """Map the temperature."""

    hue = 30 + 240 * (30 - temperature) / 60
    rgb = hsv_to_rgb(hue / 360.0, 1.0, 1.0, 1.0)
    return f'#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}'


class AwtrixTime:
    """Allows to send updated to applications."""

    def __init__(self,
                 hass,
                 entity_id
                 ) -> None:
        """Initialize the device."""

        self.hass = hass
        self.entity_id = entity_id

    async def push_app_data(self, data):
        """Update the application data."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            if "name" not in data:
                raise Unresolvable("No app name")
            app_id = data["name"]
            topic = state.state + "/custom/" + app_id

            data = data.get("data", {}) or {}
            msg = data.copy()

            payload = json.dumps(msg) if len(msg) else ""
            service_data = {"payload_template": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def switch_app(self, data):
        """Call API switch app."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            topic = state.state + "/switch"
            if "name" not in data:
                raise Unresolvable("No app name")
            app_id = data["name"]

            payload = json.dumps({"name": app_id})
            service_data = {"payload_template": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    async def settings(self, data):
        """Call API settings."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            topic = state.state + "/settings"

            data = data or {}
            msg = data.copy()

            payload = json.dumps(msg)
            service_data = {"payload_template": payload,
                            "topic": topic}

            return await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

    def weather_forecast(self, weather, temperature, hourly):
        """Get Weather forecast app."""
        try:
            weather_icons = {'clear-night': icon_clear_night_icon,
                            'cloudy': icon_cloudy_icon,
                            'exceptional': icon_exceptional_icon,
                            'fog': icon_fog_icon,
                            'hail': icon_hail_icon,
                            'lightning': icon_lightning_icon,
                            'lightning-rainy': icon_lightning_rainy_icon,
                            'partlycloudy': icon_partlycloudy_icon,
                            'pouring': icon_pouring_icon,
                            'rainy': icon_rainy_icon,
                            'snowy': icon_snowy_icon,
                            'snowy-rainy': icon_snowy_rainy_icon,
                            'sunny': icon_sunny_icon,
                            'windy': icon_windy_icon,
                            'windy-variant': icon_windy_variant_icon,
                            'unavailable': icon_exceptional_icon}

            forecast = []
            if hourly:
                for idx, x in enumerate(hourly):
                    forecast.append(
                        {"dp": [idx + 8, 7, temperature_color(x['temperature'])]})
                    if idx + 8 > 32:
                        break

                # for x in range(8, 32):
                #    forecast.append({"dp": [x, 7, "#FFFFFF"]})

            forecast.append({"dt": [16.0, 1, ("+" if temperature >
                                            0 else "") + f'{temperature:.0f}' + "°", temperature_color(temperature)]})
            icon = weather_icons[weather]
            payload = {"draw":
                    forecast,
                    "icon": icon,
                    "duration": 5,
                    "pushIcon": 2,
                    "lifetime": 900,
                    "weather": weather,
                    "repeat": 1
                    }
            return payload
        except Exception:
            return {}

    def weather_night(self, moon, temperature):
        """Get Weather night app."""

        try:
            moon = moon or full_moon_icon
            moon_icons = {
                'full_moon': full_moon_icon,
                'waning_gibbous': waning_gibbous_icon,
                'last_quarter': last_quarter_icon,
                'waning_crescent': waning_crescent_icon,
                'new_moon': new_moon_icon,
                'waxing_crescent': waxing_crescent_icon,
                'first_quarter': first_quarter_icon,
                'waxing_gibbous': waxing_gibbous_icon}

            icon = moon_icons[moon]
            payload = {
                "icon": icon,
                "text":  ("+" if temperature >
                        0 else "") + f'{temperature:.0f}' + "°",
                "color": temperature_color(temperature),
                "lifetime": 900,
                "repeat": 1
            }
            return payload
        except Exception:
            return {}

    def weather_home(self, temperature):
        """Get Home climate app."""

        try:
            icon = home_icon
            payload = {
                "icon": icon,
                "text":  ("+" if temperature >
                        0 else "") + f'{temperature:.0f}' + "°",
                "color": temperature_color(temperature),
                "lifetime": 900,
                "repeat": 1
            }
            return payload
        except Exception:
            return {}

    def weather_sun(self, next_rising, next_setting):
        """Get sun rise/set app."""

        try:
            payload = {
            }

            now = datetime.now()
            rising = (datetime.fromisoformat(next_rising)).replace(tzinfo=None)
            delta = rising - now
            min = delta.total_seconds() / 60
            if min < 30:
                icon = sunrise_icon
                payload = {
                    "icon": icon,
                    "text":  rising.strftime('%H:%M'),
                    "lifetime": 900,
                    "repeat": 1
                }

            setting = (datetime.fromisoformat(next_setting)).replace(tzinfo=None)
            delta = setting - now
            min = delta.total_seconds() / 60
            if min < 30:
                icon = sunrise_icon
                payload = {
                    "icon": icon,
                    "text":  setting.strftime('%H:%M'),
                    "lifetime": 900,
                    "repeat": 1
                }

            return payload
        except Exception:
            return {}

    async def weather_app(self, data):
        """Call Weather app."""

        state = self.hass.states.get(self.entity_id)
        if state is not None and state.state is not None:
            topic = state.state + "/custom/"
            # topic = "temp" + "/custom/"

            #
            weather_entity = data['weather']
            outside_temperature_entity = data.get('outside_temperature')

            weather = self.hass.states.get(weather_entity)
            temperature = weather.attributes.get("temperature")

            if outside_temperature_entity is not None:
                outside_temperature = self.hass.states.get(
                    outside_temperature_entity)
                if outside_temperature is not None:
                    temperature = outside_temperature.state

            templow = temperature
            forecast = weather.attributes.get("forecast")
            if not forecast:
                templow = temperature
            else:
                templow = forecast[0].get("templow")

            hourly = []
            try:
                hourly_response = await self.hass.services.async_call(
                    "weather", "get_forecasts",
                    {'entity_id': weather_entity, 'type': 'hourly'},
                    blocking=True,
                    return_response=True
                )
                hourly = hourly_response[weather_entity].get('forecast')
                night_temperature = None
                for d in hourly:
                    dt = (datetime.fromisoformat(
                        d['datetime'])).replace(tzinfo=None)
                    if dt.hour >= 0 and dt.hour <= 6:
                        night_temperature = d['temperature'] if night_temperature is None else min(
                            night_temperature, d['temperature'])
                        # print(d)
                    elif night_temperature:
                        break

                templow = templow if night_temperature is None else night_temperature
            except Exception:
                pass

            # Forecast
            payload = self.weather_forecast(weather.state, temperature, hourly)
            payload = json.dumps(payload)
            service_data = {"payload_template": payload,
                            "topic": topic + "weather"}

            await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

            # Night
            moon_entity = data.get('moon')
            moon_phase = None
            if moon_entity:
                moon = self.hass.states.get(moon_entity)
                moon_phase = moon.state
            payload = self.weather_night(moon_phase, templow)
            payload = json.dumps(payload)
            service_data = {"payload_template": payload,
                            "topic": topic + "weather_night"}

            await self.hass.services.async_call(
                "mqtt", "publish", service_data
            )

            # home
            home_temperature_entity = data.get('home_temperature')
            if home_temperature_entity:
                home_temperature = self.hass.states.get(
                    home_temperature_entity)
                if home_temperature is not None:
                    payload = self.weather_home(int(home_temperature.state))
                    payload = json.dumps(payload)
                    service_data = {"payload_template": payload,
                                    "topic": topic + "weather_home"}

                    await self.hass.services.async_call(
                        "mqtt", "publish", service_data
                    )

            # Sun
            sun_entity = data.get('sun')
            if sun_entity:
                sun = self.hass.states.get(sun_entity)
                if sun is not None:
                    payload = self.weather_sun(sun.attributes.get(
                        'next_rising'), sun.attributes.get('next_setting'))
                    payload = json.dumps(payload)
                    service_data = {"payload_template": payload,
                                    "topic": topic + "weather_sun"}

                    await self.hass.services.async_call(
                        "mqtt", "publish", service_data
                    )

            return True
