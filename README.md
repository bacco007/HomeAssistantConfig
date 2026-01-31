# 🏠 TBSmartHome - Home Assistant Configuration 🏠

This is my [Home Assistant](https://www.home-assistant.io/) configuration - based on many of the other great configurations are out there (and listed below).  I live in ![Australia](http://flags.ox3.in/mini/au.png) so some of what you find here may not be relevent, or you may have access to better (and probably cheaper) ways.  It's very much a work-in-progress, but feel free to steal ideas or code to use for your own setup

_Please :star: this repo if you find it useful_

| My Config | Contact Me |
| :---: | :---: |
| [![Home Assistant Version][ha-version-shield]][ha-version] | [![Home Assistant Community Forum][ha-community-shield]][ha-community] |
| [![Github Action Status][github-build-status-shield]][github-build-status] | [![Twitter][social-twitter-shield]][social-twitter] |
| [![Last Commit][github-last-commit]][github-master] | | ![Mastodon Follow](https://img.shields.io/mastodon/follow/000451950?domain=https%3A%2F%2Fmastodon.social) |
| [![GitHub Activity][commits-shield]][commits] |  |
| [![Github Stars][github-stars-shield]][github-stars] | |

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

---

## Menu

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [TL;DR](#tldr)
- [Stats](#stats)
- [Integrations Used](#integrations-used)
- [Screenshots](#screenshots)
- [Licence](#licence)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->
---

## TL;DR

This is my Home Assistant config - documentation isn't my strongest skill, so if you've got any questions, feel free to reach out via GitHub issues, the HA Forums or on Twitter (X) or Mastodon (my usernames there are the same as my github username)

| [Menu](#menu) |

---

## Stats

_Stats as at 05:00, unknown_

| Stat | Qty |
| ---|--- |
| HA Version | 2025.4.4 |
| No. Integrations | 225 |
| No. Custom Integrations | 104 |
| No. Entities | 5846 |
| No. Sensors | 3828 |
| No. Automations | 159 |

<details>
<summary>Expand Entity Breakdown</summary>

Type | Qty
-- | --
Air quality | 0
Alarm control panels | 2
Areas | 18
Binary sensors | 475
Buttons | 212
Calendars | 84
Cameras | 6
Climate | 2
Covers | 0
Dates | 0
Date/times | 0
Device trackers | 54
Devices | 608
Fans | 3
Humidifiers | 0
Images | 7
Input booleans | 27
Input buttons | 0
Input date/times | 0
Input numbers | 10
Input selects | 3
Input texts | 3
Lights | 13
Locks | 0
Media players | 30
Numbers | 52
Persistent notifications | 7
Persons | 4
Remotes | 7
Scenes | 2
Scripts | 85
Selects | 57
Sensors | 3828
Sirens | 0
Speech-to-text | 1
Suns | 1
Switches | 244
Texts | 2
Times | 0
Text-to-speech | 1
Update | 242
Vacuums | 0
Water heaters | 0
Weather | 14
Zones | 4
</details>

| [Menu](#menu) |

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)


<details><summary>692 Integrations</summary>

| Name |
| --- |
| [accuweather](https://www.home-assistant.io/components/accuweather) |
| [accuweather.sensor](https://www.home-assistant.io/components/accuweather.sensor) |
| [accuweather.weather](https://www.home-assistant.io/components/accuweather.weather) |
| [adaptive_lighting](https://www.home-assistant.io/components/adaptive_lighting) |
| [adaptive_lighting.switch](https://www.home-assistant.io/components/adaptive_lighting.switch) |
| [adguard](https://www.home-assistant.io/components/adguard) |
| [adguard.sensor](https://www.home-assistant.io/components/adguard.sensor) |
| [adguard.switch](https://www.home-assistant.io/components/adguard.switch) |
| [adsb_lol](https://www.home-assistant.io/components/adsb_lol) |
| [adsb_lol.sensor](https://www.home-assistant.io/components/adsb_lol.sensor) |
| [airvisual](https://www.home-assistant.io/components/airvisual) |
| [airvisual.sensor](https://www.home-assistant.io/components/airvisual.sensor) |
| [airvisual_pro](https://www.home-assistant.io/components/airvisual_pro) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alert](https://www.home-assistant.io/components/alert) |
| [analytics](https://www.home-assistant.io/components/analytics) |
| [analytics_insights](https://www.home-assistant.io/components/analytics_insights) |
| [analytics_insights.sensor](https://www.home-assistant.io/components/analytics_insights.sensor) |
| [anniversaries](https://www.home-assistant.io/components/anniversaries) |
| [anniversaries.calendar](https://www.home-assistant.io/components/anniversaries.calendar) |
| [anniversaries.sensor](https://www.home-assistant.io/components/anniversaries.sensor) |
| [api](https://www.home-assistant.io/components/api) |
| [apple_tv](https://www.home-assistant.io/components/apple_tv) |
| [apple_tv.media_player](https://www.home-assistant.io/components/apple_tv.media_player) |
| [apple_tv.remote](https://www.home-assistant.io/components/apple_tv.remote) |
| [application_credentials](https://www.home-assistant.io/components/application_credentials) |
| [assist_pipeline](https://www.home-assistant.io/components/assist_pipeline) |
| [astroweather](https://www.home-assistant.io/components/astroweather) |
| [astroweather.binary_sensor](https://www.home-assistant.io/components/astroweather.binary_sensor) |
| [astroweather.sensor](https://www.home-assistant.io/components/astroweather.sensor) |
| [astroweather.weather](https://www.home-assistant.io/components/astroweather.weather) |
| [aurora](https://www.home-assistant.io/components/aurora) |
| [aurora.binary_sensor](https://www.home-assistant.io/components/aurora.binary_sensor) |
| [aurora.sensor](https://www.home-assistant.io/components/aurora.sensor) |
| [aus_space_weather](https://www.home-assistant.io/components/aus_space_weather) |
| [aus_space_weather.binary_sensor](https://www.home-assistant.io/components/aus_space_weather.binary_sensor) |
| [aus_space_weather.sensor](https://www.home-assistant.io/components/aus_space_weather.sensor) |
| [auth](https://www.home-assistant.io/components/auth) |
| [automation](https://www.home-assistant.io/components/automation) |
| [average](https://www.home-assistant.io/components/average) |
| [average.sensor](https://www.home-assistant.io/components/average.sensor) |
| [awtrix](https://www.home-assistant.io/components/awtrix) |
| [awtrix.notify](https://www.home-assistant.io/components/awtrix.notify) |
| [backup](https://www.home-assistant.io/components/backup) |
| [backup.sensor](https://www.home-assistant.io/components/backup.sensor) |
| [bayesian.binary_sensor](https://www.home-assistant.io/components/bayesian.binary_sensor) |
| [bermuda](https://www.home-assistant.io/components/bermuda) |
| [bermuda.device_tracker](https://www.home-assistant.io/components/bermuda.device_tracker) |
| [bermuda.number](https://www.home-assistant.io/components/bermuda.number) |
| [bermuda.sensor](https://www.home-assistant.io/components/bermuda.sensor) |
| [binary_sensor](https://www.home-assistant.io/components/binary_sensor) |
| [ble_monitor](https://www.home-assistant.io/components/ble_monitor) |
| [ble_monitor.binary_sensor](https://www.home-assistant.io/components/ble_monitor.binary_sensor) |
| [ble_monitor.device_tracker](https://www.home-assistant.io/components/ble_monitor.device_tracker) |
| [ble_monitor.sensor](https://www.home-assistant.io/components/ble_monitor.sensor) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blitzortung.geo_location](https://www.home-assistant.io/components/blitzortung.geo_location) |
| [blitzortung.sensor](https://www.home-assistant.io/components/blitzortung.sensor) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [bluetooth](https://www.home-assistant.io/components/bluetooth) |
| [bluetooth_adapters](https://www.home-assistant.io/components/bluetooth_adapters) |
| [broadlink](https://www.home-assistant.io/components/broadlink) |
| [broadlink.remote](https://www.home-assistant.io/components/broadlink.remote) |
| [broadlink.sensor](https://www.home-assistant.io/components/broadlink.sensor) |
| [broadlink.switch](https://www.home-assistant.io/components/broadlink.switch) |
| [browser_mod](https://www.home-assistant.io/components/browser_mod) |
| [browser_mod.binary_sensor](https://www.home-assistant.io/components/browser_mod.binary_sensor) |
| [browser_mod.camera](https://www.home-assistant.io/components/browser_mod.camera) |
| [browser_mod.light](https://www.home-assistant.io/components/browser_mod.light) |
| [browser_mod.media_player](https://www.home-assistant.io/components/browser_mod.media_player) |
| [browser_mod.sensor](https://www.home-assistant.io/components/browser_mod.sensor) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [bureau_of_meteorology.sensor](https://www.home-assistant.io/components/bureau_of_meteorology.sensor) |
| [bureau_of_meteorology.weather](https://www.home-assistant.io/components/bureau_of_meteorology.weather) |
| [button](https://www.home-assistant.io/components/button) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [camera](https://www.home-assistant.io/components/camera) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cast.media_player](https://www.home-assistant.io/components/cast.media_player) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [cert_expiry.sensor](https://www.home-assistant.io/components/cert_expiry.sensor) |
| [climate](https://www.home-assistant.io/components/climate) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [cloud.binary_sensor](https://www.home-assistant.io/components/cloud.binary_sensor) |
| [cloud.stt](https://www.home-assistant.io/components/cloud.stt) |
| [cloud.tts](https://www.home-assistant.io/components/cloud.tts) |
| [cloudflare_speed_test](https://www.home-assistant.io/components/cloudflare_speed_test) |
| [cloudflare_speed_test.sensor](https://www.home-assistant.io/components/cloudflare_speed_test.sensor) |
| [cloudflare_tunnel_monitor](https://www.home-assistant.io/components/cloudflare_tunnel_monitor) |
| [cloudflare_tunnel_monitor.sensor](https://www.home-assistant.io/components/cloudflare_tunnel_monitor.sensor) |
| [co2signal](https://www.home-assistant.io/components/co2signal) |
| [co2signal.sensor](https://www.home-assistant.io/components/co2signal.sensor) |
| [command_line](https://www.home-assistant.io/components/command_line) |
| [command_line.binary_sensor](https://www.home-assistant.io/components/command_line.binary_sensor) |
| [command_line.sensor](https://www.home-assistant.io/components/command_line.sensor) |
| [config](https://www.home-assistant.io/components/config) |
| [conversation](https://www.home-assistant.io/components/conversation) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cupertino](https://www.home-assistant.io/components/cupertino) |
| [custom_icons](https://www.home-assistant.io/components/custom_icons) |
| [custom_templates](https://www.home-assistant.io/components/custom_templates) |
| [daily](https://www.home-assistant.io/components/daily) |
| [daily.sensor](https://www.home-assistant.io/components/daily.sensor) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [default_config_disabler](https://www.home-assistant.io/components/default_config_disabler) |
| [derivative](https://www.home-assistant.io/components/derivative) |
| [derivative.sensor](https://www.home-assistant.io/components/derivative.sensor) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tools](https://www.home-assistant.io/components/device_tools) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [diagnostics](https://www.home-assistant.io/components/diagnostics) |
| [doomsday_clock.sensor](https://www.home-assistant.io/components/doomsday_clock.sensor) |
| [dynamic_energy_cost](https://www.home-assistant.io/components/dynamic_energy_cost) |
| [dynamic_energy_cost.sensor](https://www.home-assistant.io/components/dynamic_energy_cost.sensor) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [dyson_local.binary_sensor](https://www.home-assistant.io/components/dyson_local.binary_sensor) |
| [dyson_local.button](https://www.home-assistant.io/components/dyson_local.button) |
| [dyson_local.climate](https://www.home-assistant.io/components/dyson_local.climate) |
| [dyson_local.fan](https://www.home-assistant.io/components/dyson_local.fan) |
| [dyson_local.select](https://www.home-assistant.io/components/dyson_local.select) |
| [dyson_local.sensor](https://www.home-assistant.io/components/dyson_local.sensor) |
| [dyson_local.switch](https://www.home-assistant.io/components/dyson_local.switch) |
| [emsc_earthquake](https://www.home-assistant.io/components/emsc_earthquake) |
| [emsc_earthquake.sensor](https://www.home-assistant.io/components/emsc_earthquake.sensor) |
| [energy](https://www.home-assistant.io/components/energy) |
| [energy.sensor](https://www.home-assistant.io/components/energy.sensor) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [esphome.button](https://www.home-assistant.io/components/esphome.button) |
| [esphome.select](https://www.home-assistant.io/components/esphome.select) |
| [esphome.sensor](https://www.home-assistant.io/components/esphome.sensor) |
| [esphome.switch](https://www.home-assistant.io/components/esphome.switch) |
| [esphome.update](https://www.home-assistant.io/components/esphome.update) |
| [eufy_security](https://www.home-assistant.io/components/eufy_security) |
| [eufy_security.alarm_control_panel](https://www.home-assistant.io/components/eufy_security.alarm_control_panel) |
| [eufy_security.binary_sensor](https://www.home-assistant.io/components/eufy_security.binary_sensor) |
| [eufy_security.button](https://www.home-assistant.io/components/eufy_security.button) |
| [eufy_security.camera](https://www.home-assistant.io/components/eufy_security.camera) |
| [eufy_security.image](https://www.home-assistant.io/components/eufy_security.image) |
| [eufy_security.lock](https://www.home-assistant.io/components/eufy_security.lock) |
| [eufy_security.number](https://www.home-assistant.io/components/eufy_security.number) |
| [eufy_security.select](https://www.home-assistant.io/components/eufy_security.select) |
| [eufy_security.sensor](https://www.home-assistant.io/components/eufy_security.sensor) |
| [eufy_security.switch](https://www.home-assistant.io/components/eufy_security.switch) |
| [event](https://www.home-assistant.io/components/event) |
| [f1_sensor](https://www.home-assistant.io/components/f1_sensor) |
| [f1_sensor.sensor](https://www.home-assistant.io/components/f1_sensor.sensor) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fastdotcom](https://www.home-assistant.io/components/fastdotcom) |
| [fastdotcom.sensor](https://www.home-assistant.io/components/fastdotcom.sensor) |
| [feedparser.sensor](https://www.home-assistant.io/components/feedparser.sensor) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [file](https://www.home-assistant.io/components/file) |
| [file.notify](https://www.home-assistant.io/components/file.notify) |
| [file_upload](https://www.home-assistant.io/components/file_upload) |
| [filter.sensor](https://www.home-assistant.io/components/filter.sensor) |
| [flightradar24](https://www.home-assistant.io/components/flightradar24) |
| [flightradar24.button](https://www.home-assistant.io/components/flightradar24.button) |
| [flightradar24.device_tracker](https://www.home-assistant.io/components/flightradar24.device_tracker) |
| [flightradar24.sensor](https://www.home-assistant.io/components/flightradar24.sensor) |
| [flightradar24.switch](https://www.home-assistant.io/components/flightradar24.switch) |
| [flightradar24.text](https://www.home-assistant.io/components/flightradar24.text) |
| [folder.sensor](https://www.home-assistant.io/components/folder.sensor) |
| [fontawesome](https://www.home-assistant.io/components/fontawesome) |
| [forecast_solar](https://www.home-assistant.io/components/forecast_solar) |
| [forecast_solar.sensor](https://www.home-assistant.io/components/forecast_solar.sensor) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [fuel_prices](https://www.home-assistant.io/components/fuel_prices) |
| [fuel_prices.sensor](https://www.home-assistant.io/components/fuel_prices.sensor) |
| [fully_kiosk](https://www.home-assistant.io/components/fully_kiosk) |
| [fully_kiosk.binary_sensor](https://www.home-assistant.io/components/fully_kiosk.binary_sensor) |
| [fully_kiosk.button](https://www.home-assistant.io/components/fully_kiosk.button) |
| [fully_kiosk.camera](https://www.home-assistant.io/components/fully_kiosk.camera) |
| [fully_kiosk.image](https://www.home-assistant.io/components/fully_kiosk.image) |
| [fully_kiosk.media_player](https://www.home-assistant.io/components/fully_kiosk.media_player) |
| [fully_kiosk.notify](https://www.home-assistant.io/components/fully_kiosk.notify) |
| [fully_kiosk.number](https://www.home-assistant.io/components/fully_kiosk.number) |
| [fully_kiosk.sensor](https://www.home-assistant.io/components/fully_kiosk.sensor) |
| [fully_kiosk.switch](https://www.home-assistant.io/components/fully_kiosk.switch) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [garbage_collection.calendar](https://www.home-assistant.io/components/garbage_collection.calendar) |
| [garbage_collection.sensor](https://www.home-assistant.io/components/garbage_collection.sensor) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [gdacs.geo_location](https://www.home-assistant.io/components/gdacs.geo_location) |
| [gdacs.sensor](https://www.home-assistant.io/components/gdacs.sensor) |
| [geo_json_events](https://www.home-assistant.io/components/geo_json_events) |
| [geo_json_events.geo_location](https://www.home-assistant.io/components/geo_json_events.geo_location) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [github](https://www.home-assistant.io/components/github) |
| [github.sensor](https://www.home-assistant.io/components/github.sensor) |
| [go2rtc](https://www.home-assistant.io/components/go2rtc) |
| [google](https://www.home-assistant.io/components/google) |
| [google.calendar](https://www.home-assistant.io/components/google.calendar) |
| [google_drive](https://www.home-assistant.io/components/google_drive) |
| [google_home](https://www.home-assistant.io/components/google_home) |
| [google_home.number](https://www.home-assistant.io/components/google_home.number) |
| [google_home.sensor](https://www.home-assistant.io/components/google_home.sensor) |
| [google_home.switch](https://www.home-assistant.io/components/google_home.switch) |
| [google_translate.tts](https://www.home-assistant.io/components/google_translate.tts) |
| [group](https://www.home-assistant.io/components/group) |
| [group.light](https://www.home-assistant.io/components/group.light) |
| [group.notify](https://www.home-assistant.io/components/group.notify) |
| [gtfs2](https://www.home-assistant.io/components/gtfs2) |
| [gtfs2.sensor](https://www.home-assistant.io/components/gtfs2.sensor) |
| [gtfs_realtime](https://www.home-assistant.io/components/gtfs_realtime) |
| [gtfs_realtime.binary_sensor](https://www.home-assistant.io/components/gtfs_realtime.binary_sensor) |
| [gtfs_realtime.button](https://www.home-assistant.io/components/gtfs_realtime.button) |
| [gtfs_realtime.number](https://www.home-assistant.io/components/gtfs_realtime.number) |
| [gtfs_realtime.sensor](https://www.home-assistant.io/components/gtfs_realtime.sensor) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [hacs.switch](https://www.home-assistant.io/components/hacs.switch) |
| [hacs.update](https://www.home-assistant.io/components/hacs.update) |
| [hardware](https://www.home-assistant.io/components/hardware) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [harmony.remote](https://www.home-assistant.io/components/harmony.remote) |
| [harmony.select](https://www.home-assistant.io/components/harmony.select) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [hassio.binary_sensor](https://www.home-assistant.io/components/hassio.binary_sensor) |
| [hassio.sensor](https://www.home-assistant.io/components/hassio.sensor) |
| [hassio.update](https://www.home-assistant.io/components/hassio.update) |
| [haveibeenpwned.sensor](https://www.home-assistant.io/components/haveibeenpwned.sensor) |
| [hdhomerun](https://www.home-assistant.io/components/hdhomerun) |
| [hdhomerun.binary_sensor](https://www.home-assistant.io/components/hdhomerun.binary_sensor) |
| [hdhomerun.button](https://www.home-assistant.io/components/hdhomerun.button) |
| [hdhomerun.select](https://www.home-assistant.io/components/hdhomerun.select) |
| [hdhomerun.sensor](https://www.home-assistant.io/components/hdhomerun.sensor) |
| [hdhomerun.update](https://www.home-assistant.io/components/hdhomerun.update) |
| [here_travel_time](https://www.home-assistant.io/components/here_travel_time) |
| [here_travel_time.sensor](https://www.home-assistant.io/components/here_travel_time.sensor) |
| [history](https://www.home-assistant.io/components/history) |
| [history_stats.sensor](https://www.home-assistant.io/components/history_stats.sensor) |
| [holiday](https://www.home-assistant.io/components/holiday) |
| [holiday.calendar](https://www.home-assistant.io/components/holiday.calendar) |
| [holidays](https://www.home-assistant.io/components/holidays) |
| [holidays.calendar](https://www.home-assistant.io/components/holidays.calendar) |
| [homeassistant](https://www.home-assistant.io/components/homeassistant) |
| [homeassistant.scene](https://www.home-assistant.io/components/homeassistant.scene) |
| [homeassistant_alerts](https://www.home-assistant.io/components/homeassistant_alerts) |
| [homeassistant_hardware](https://www.home-assistant.io/components/homeassistant_hardware) |
| [homeassistant_sky_connect](https://www.home-assistant.io/components/homeassistant_sky_connect) |
| [homeassistant_sky_connect.update](https://www.home-assistant.io/components/homeassistant_sky_connect.update) |
| [homekit](https://www.home-assistant.io/components/homekit) |
| [http](https://www.home-assistant.io/components/http) |
| [humidifier](https://www.home-assistant.io/components/humidifier) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [iaquk.sensor](https://www.home-assistant.io/components/iaquk.sensor) |
| [ibeacon](https://www.home-assistant.io/components/ibeacon) |
| [ibeacon.device_tracker](https://www.home-assistant.io/components/ibeacon.device_tracker) |
| [ibeacon.sensor](https://www.home-assistant.io/components/ibeacon.sensor) |
| [ics_calendar](https://www.home-assistant.io/components/ics_calendar) |
| [ics_calendar.calendar](https://www.home-assistant.io/components/ics_calendar.calendar) |
| [illuminance](https://www.home-assistant.io/components/illuminance) |
| [illuminance.sensor](https://www.home-assistant.io/components/illuminance.sensor) |
| [image](https://www.home-assistant.io/components/image) |
| [image_upload](https://www.home-assistant.io/components/image_upload) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_boolean](https://www.home-assistant.io/components/input_boolean) |
| [input_button](https://www.home-assistant.io/components/input_button) |
| [input_datetime](https://www.home-assistant.io/components/input_datetime) |
| [input_number](https://www.home-assistant.io/components/input_number) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [input_text](https://www.home-assistant.io/components/input_text) |
| [integration](https://www.home-assistant.io/components/integration) |
| [integration.sensor](https://www.home-assistant.io/components/integration.sensor) |
| [intent](https://www.home-assistant.io/components/intent) |
| [ios](https://www.home-assistant.io/components/ios) |
| [ios.notify](https://www.home-assistant.io/components/ios.notify) |
| [ios.sensor](https://www.home-assistant.io/components/ios.sensor) |
| [lastfm](https://www.home-assistant.io/components/lastfm) |
| [lastfm.sensor](https://www.home-assistant.io/components/lastfm.sensor) |
| [lg_thinq](https://www.home-assistant.io/components/lg_thinq) |
| [lg_thinq.binary_sensor](https://www.home-assistant.io/components/lg_thinq.binary_sensor) |
| [lg_thinq.climate](https://www.home-assistant.io/components/lg_thinq.climate) |
| [lg_thinq.event](https://www.home-assistant.io/components/lg_thinq.event) |
| [lg_thinq.fan](https://www.home-assistant.io/components/lg_thinq.fan) |
| [lg_thinq.number](https://www.home-assistant.io/components/lg_thinq.number) |
| [lg_thinq.select](https://www.home-assistant.io/components/lg_thinq.select) |
| [lg_thinq.sensor](https://www.home-assistant.io/components/lg_thinq.sensor) |
| [lg_thinq.switch](https://www.home-assistant.io/components/lg_thinq.switch) |
| [lg_thinq.vacuum](https://www.home-assistant.io/components/lg_thinq.vacuum) |
| [lg_thinq.water_heater](https://www.home-assistant.io/components/lg_thinq.water_heater) |
| [light](https://www.home-assistant.io/components/light) |
| [llmvision](https://www.home-assistant.io/components/llmvision) |
| [local_ip](https://www.home-assistant.io/components/local_ip) |
| [local_ip.sensor](https://www.home-assistant.io/components/local_ip.sensor) |
| [lock](https://www.home-assistant.io/components/lock) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [lovelace_gen](https://www.home-assistant.io/components/lovelace_gen) |
| [lunar_phase](https://www.home-assistant.io/components/lunar_phase) |
| [lunar_phase.sensor](https://www.home-assistant.io/components/lunar_phase.sensor) |
| [mastodon](https://www.home-assistant.io/components/mastodon) |
| [mastodon.notify](https://www.home-assistant.io/components/mastodon.notify) |
| [mastodon.sensor](https://www.home-assistant.io/components/mastodon.sensor) |
| [material_symbols](https://www.home-assistant.io/components/material_symbols) |
| [matter](https://www.home-assistant.io/components/matter) |
| [matter.binary_sensor](https://www.home-assistant.io/components/matter.binary_sensor) |
| [matter.button](https://www.home-assistant.io/components/matter.button) |
| [matter.climate](https://www.home-assistant.io/components/matter.climate) |
| [matter.cover](https://www.home-assistant.io/components/matter.cover) |
| [matter.event](https://www.home-assistant.io/components/matter.event) |
| [matter.fan](https://www.home-assistant.io/components/matter.fan) |
| [matter.light](https://www.home-assistant.io/components/matter.light) |
| [matter.lock](https://www.home-assistant.io/components/matter.lock) |
| [matter.number](https://www.home-assistant.io/components/matter.number) |
| [matter.select](https://www.home-assistant.io/components/matter.select) |
| [matter.sensor](https://www.home-assistant.io/components/matter.sensor) |
| [matter.switch](https://www.home-assistant.io/components/matter.switch) |
| [matter.update](https://www.home-assistant.io/components/matter.update) |
| [matter.vacuum](https://www.home-assistant.io/components/matter.vacuum) |
| [matter.valve](https://www.home-assistant.io/components/matter.valve) |
| [media_extractor](https://www.home-assistant.io/components/media_extractor) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_source](https://www.home-assistant.io/components/media_source) |
| [mediarr](https://www.home-assistant.io/components/mediarr) |
| [met](https://www.home-assistant.io/components/met) |
| [met.weather](https://www.home-assistant.io/components/met.weather) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [mobile_app.binary_sensor](https://www.home-assistant.io/components/mobile_app.binary_sensor) |
| [mobile_app.device_tracker](https://www.home-assistant.io/components/mobile_app.device_tracker) |
| [mobile_app.notify](https://www.home-assistant.io/components/mobile_app.notify) |
| [mobile_app.sensor](https://www.home-assistant.io/components/mobile_app.sensor) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [monitor_docker.button](https://www.home-assistant.io/components/monitor_docker.button) |
| [monitor_docker.sensor](https://www.home-assistant.io/components/monitor_docker.sensor) |
| [monitor_docker.switch](https://www.home-assistant.io/components/monitor_docker.switch) |
| [moon](https://www.home-assistant.io/components/moon) |
| [moon.sensor](https://www.home-assistant.io/components/moon.sensor) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [mqtt.binary_sensor](https://www.home-assistant.io/components/mqtt.binary_sensor) |
| [mqtt.button](https://www.home-assistant.io/components/mqtt.button) |
| [mqtt.light](https://www.home-assistant.io/components/mqtt.light) |
| [mqtt.number](https://www.home-assistant.io/components/mqtt.number) |
| [mqtt.select](https://www.home-assistant.io/components/mqtt.select) |
| [mqtt.sensor](https://www.home-assistant.io/components/mqtt.sensor) |
| [mqtt.switch](https://www.home-assistant.io/components/mqtt.switch) |
| [mqtt.update](https://www.home-assistant.io/components/mqtt.update) |
| [multiscrape](https://www.home-assistant.io/components/multiscrape) |
| [multiscrape.button](https://www.home-assistant.io/components/multiscrape.button) |
| [multiscrape.sensor](https://www.home-assistant.io/components/multiscrape.sensor) |
| [music_assistant](https://www.home-assistant.io/components/music_assistant) |
| [music_assistant.media_player](https://www.home-assistant.io/components/music_assistant.media_player) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [myjdownloader.sensor](https://www.home-assistant.io/components/myjdownloader.sensor) |
| [myjdownloader.switch](https://www.home-assistant.io/components/myjdownloader.switch) |
| [myjdownloader.update](https://www.home-assistant.io/components/myjdownloader.update) |
| [network](https://www.home-assistant.io/components/network) |
| [network_scanner](https://www.home-assistant.io/components/network_scanner) |
| [network_scanner.sensor](https://www.home-assistant.io/components/network_scanner.sensor) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [nodered.binary_sensor](https://www.home-assistant.io/components/nodered.binary_sensor) |
| [nodered.sensor](https://www.home-assistant.io/components/nodered.sensor) |
| [nodered.switch](https://www.home-assistant.io/components/nodered.switch) |
| [notify](https://www.home-assistant.io/components/notify) |
| [nsw_air_quality.sensor](https://www.home-assistant.io/components/nsw_air_quality.sensor) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_fuel_station.sensor](https://www.home-assistant.io/components/nsw_fuel_station.sensor) |
| [nsw_rural_fire_service_feed.geo_location](https://www.home-assistant.io/components/nsw_rural_fire_service_feed.geo_location) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [nsw_rural_fire_service_fire_danger.binary_sensor](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger.binary_sensor) |
| [nsw_rural_fire_service_fire_danger.sensor](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger.sensor) |
| [number](https://www.home-assistant.io/components/number) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [open_meteo](https://www.home-assistant.io/components/open_meteo) |
| [open_meteo.weather](https://www.home-assistant.io/components/open_meteo.weather) |
| [open_meteo_solar_forecast](https://www.home-assistant.io/components/open_meteo_solar_forecast) |
| [open_meteo_solar_forecast.sensor](https://www.home-assistant.io/components/open_meteo_solar_forecast.sensor) |
| [opennem](https://www.home-assistant.io/components/opennem) |
| [opennem.sensor](https://www.home-assistant.io/components/opennem.sensor) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [openuv.binary_sensor](https://www.home-assistant.io/components/openuv.binary_sensor) |
| [openuv.sensor](https://www.home-assistant.io/components/openuv.sensor) |
| [openweathermap](https://www.home-assistant.io/components/openweathermap) |
| [openweathermap.sensor](https://www.home-assistant.io/components/openweathermap.sensor) |
| [openweathermap.weather](https://www.home-assistant.io/components/openweathermap.weather) |
| [otbr](https://www.home-assistant.io/components/otbr) |
| [panel_custom](https://www.home-assistant.io/components/panel_custom) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [ping](https://www.home-assistant.io/components/ping) |
| [ping.binary_sensor](https://www.home-assistant.io/components/ping.binary_sensor) |
| [ping.device_tracker](https://www.home-assistant.io/components/ping.device_tracker) |
| [ping.sensor](https://www.home-assistant.io/components/ping.sensor) |
| [pirateweather](https://www.home-assistant.io/components/pirateweather) |
| [pirateweather.sensor](https://www.home-assistant.io/components/pirateweather.sensor) |
| [pirateweather.weather](https://www.home-assistant.io/components/pirateweather.weather) |
| [playstation_network](https://www.home-assistant.io/components/playstation_network) |
| [playstation_network.image](https://www.home-assistant.io/components/playstation_network.image) |
| [playstation_network.media_player](https://www.home-assistant.io/components/playstation_network.media_player) |
| [playstation_network.notify](https://www.home-assistant.io/components/playstation_network.notify) |
| [playstation_network.sensor](https://www.home-assistant.io/components/playstation_network.sensor) |
| [plex](https://www.home-assistant.io/components/plex) |
| [plex.button](https://www.home-assistant.io/components/plex.button) |
| [plex.media_player](https://www.home-assistant.io/components/plex.media_player) |
| [plex.sensor](https://www.home-assistant.io/components/plex.sensor) |
| [plex.update](https://www.home-assistant.io/components/plex.update) |
| [plex_recently_added](https://www.home-assistant.io/components/plex_recently_added) |
| [plex_recently_added.sensor](https://www.home-assistant.io/components/plex_recently_added.sensor) |
| [pocketcasts.sensor](https://www.home-assistant.io/components/pocketcasts.sensor) |
| [powercalc](https://www.home-assistant.io/components/powercalc) |
| [powercalc.sensor](https://www.home-assistant.io/components/powercalc.sensor) |
| [private_ble_device](https://www.home-assistant.io/components/private_ble_device) |
| [private_ble_device.device_tracker](https://www.home-assistant.io/components/private_ble_device.device_tracker) |
| [private_ble_device.sensor](https://www.home-assistant.io/components/private_ble_device.sensor) |
| [prometheus_query.sensor](https://www.home-assistant.io/components/prometheus_query.sensor) |
| [prometheus_sensor.sensor](https://www.home-assistant.io/components/prometheus_sensor.sensor) |
| [proximity](https://www.home-assistant.io/components/proximity) |
| [proximity.sensor](https://www.home-assistant.io/components/proximity.sensor) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [proxmoxve.binary_sensor](https://www.home-assistant.io/components/proxmoxve.binary_sensor) |
| [proxmoxve.button](https://www.home-assistant.io/components/proxmoxve.button) |
| [proxmoxve.sensor](https://www.home-assistant.io/components/proxmoxve.sensor) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [qbittorrent](https://www.home-assistant.io/components/qbittorrent) |
| [qbittorrent.sensor](https://www.home-assistant.io/components/qbittorrent.sensor) |
| [qbittorrent.switch](https://www.home-assistant.io/components/qbittorrent.switch) |
| [qbittorrent_alt](https://www.home-assistant.io/components/qbittorrent_alt) |
| [qbittorrent_alt.button](https://www.home-assistant.io/components/qbittorrent_alt.button) |
| [qbittorrent_alt.number](https://www.home-assistant.io/components/qbittorrent_alt.number) |
| [qbittorrent_alt.sensor](https://www.home-assistant.io/components/qbittorrent_alt.sensor) |
| [qbittorrent_alt.switch](https://www.home-assistant.io/components/qbittorrent_alt.switch) |
| [radarr](https://www.home-assistant.io/components/radarr) |
| [radarr.binary_sensor](https://www.home-assistant.io/components/radarr.binary_sensor) |
| [radarr.calendar](https://www.home-assistant.io/components/radarr.calendar) |
| [radarr.sensor](https://www.home-assistant.io/components/radarr.sensor) |
| [radarr_upcoming_media](https://www.home-assistant.io/components/radarr_upcoming_media) |
| [radarr_upcoming_media.sensor](https://www.home-assistant.io/components/radarr_upcoming_media.sensor) |
| [radio_browser](https://www.home-assistant.io/components/radio_browser) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [repairs](https://www.home-assistant.io/components/repairs) |
| [rest](https://www.home-assistant.io/components/rest) |
| [rest.sensor](https://www.home-assistant.io/components/rest.sensor) |
| [sabnzbd](https://www.home-assistant.io/components/sabnzbd) |
| [sabnzbd.binary_sensor](https://www.home-assistant.io/components/sabnzbd.binary_sensor) |
| [sabnzbd.button](https://www.home-assistant.io/components/sabnzbd.button) |
| [sabnzbd.number](https://www.home-assistant.io/components/sabnzbd.number) |
| [sabnzbd.sensor](https://www.home-assistant.io/components/sabnzbd.sensor) |
| [satellitetracker](https://www.home-assistant.io/components/satellitetracker) |
| [satellitetracker.binary_sensor](https://www.home-assistant.io/components/satellitetracker.binary_sensor) |
| [satellitetracker.device_tracker](https://www.home-assistant.io/components/satellitetracker.device_tracker) |
| [satellitetracker.sensor](https://www.home-assistant.io/components/satellitetracker.sensor) |
| [scene](https://www.home-assistant.io/components/scene) |
| [schedule](https://www.home-assistant.io/components/schedule) |
| [script](https://www.home-assistant.io/components/script) |
| [search](https://www.home-assistant.io/components/search) |
| [season](https://www.home-assistant.io/components/season) |
| [season.sensor](https://www.home-assistant.io/components/season.sensor) |
| [select](https://www.home-assistant.io/components/select) |
| [sensibo](https://www.home-assistant.io/components/sensibo) |
| [sensibo.binary_sensor](https://www.home-assistant.io/components/sensibo.binary_sensor) |
| [sensibo.button](https://www.home-assistant.io/components/sensibo.button) |
| [sensibo.climate](https://www.home-assistant.io/components/sensibo.climate) |
| [sensibo.number](https://www.home-assistant.io/components/sensibo.number) |
| [sensibo.select](https://www.home-assistant.io/components/sensibo.select) |
| [sensibo.sensor](https://www.home-assistant.io/components/sensibo.sensor) |
| [sensibo.switch](https://www.home-assistant.io/components/sensibo.switch) |
| [sensibo.update](https://www.home-assistant.io/components/sensibo.update) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [shell_command](https://www.home-assistant.io/components/shell_command) |
| [simpleicons](https://www.home-assistant.io/components/simpleicons) |
| [siren](https://www.home-assistant.io/components/siren) |
| [slack](https://www.home-assistant.io/components/slack) |
| [slack.notify](https://www.home-assistant.io/components/slack.notify) |
| [slack.sensor](https://www.home-assistant.io/components/slack.sensor) |
| [smartthinq_sensors](https://www.home-assistant.io/components/smartthinq_sensors) |
| [smartthinq_sensors.binary_sensor](https://www.home-assistant.io/components/smartthinq_sensors.binary_sensor) |
| [smartthinq_sensors.button](https://www.home-assistant.io/components/smartthinq_sensors.button) |
| [smartthinq_sensors.climate](https://www.home-assistant.io/components/smartthinq_sensors.climate) |
| [smartthinq_sensors.fan](https://www.home-assistant.io/components/smartthinq_sensors.fan) |
| [smartthinq_sensors.humidifier](https://www.home-assistant.io/components/smartthinq_sensors.humidifier) |
| [smartthinq_sensors.light](https://www.home-assistant.io/components/smartthinq_sensors.light) |
| [smartthinq_sensors.select](https://www.home-assistant.io/components/smartthinq_sensors.select) |
| [smartthinq_sensors.sensor](https://www.home-assistant.io/components/smartthinq_sensors.sensor) |
| [smartthinq_sensors.switch](https://www.home-assistant.io/components/smartthinq_sensors.switch) |
| [smartthinq_sensors.water_heater](https://www.home-assistant.io/components/smartthinq_sensors.water_heater) |
| [snmp.sensor](https://www.home-assistant.io/components/snmp.sensor) |
| [solcast_solar](https://www.home-assistant.io/components/solcast_solar) |
| [solcast_solar.select](https://www.home-assistant.io/components/solcast_solar.select) |
| [solcast_solar.sensor](https://www.home-assistant.io/components/solcast_solar.sensor) |
| [sonarr](https://www.home-assistant.io/components/sonarr) |
| [sonarr.sensor](https://www.home-assistant.io/components/sonarr.sensor) |
| [sonarr_upcoming_media](https://www.home-assistant.io/components/sonarr_upcoming_media) |
| [sonarr_upcoming_media.sensor](https://www.home-assistant.io/components/sonarr_upcoming_media.sensor) |
| [sonos](https://www.home-assistant.io/components/sonos) |
| [sonos.binary_sensor](https://www.home-assistant.io/components/sonos.binary_sensor) |
| [sonos.media_player](https://www.home-assistant.io/components/sonos.media_player) |
| [sonos.number](https://www.home-assistant.io/components/sonos.number) |
| [sonos.sensor](https://www.home-assistant.io/components/sonos.sensor) |
| [sonos.switch](https://www.home-assistant.io/components/sonos.switch) |
| [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet) |
| [speedtestdotnet.sensor](https://www.home-assistant.io/components/speedtestdotnet.sensor) |
| [spook](https://www.home-assistant.io/components/spook) |
| [spook.binary_sensor](https://www.home-assistant.io/components/spook.binary_sensor) |
| [spook.button](https://www.home-assistant.io/components/spook.button) |
| [spook.event](https://www.home-assistant.io/components/spook.event) |
| [spook.number](https://www.home-assistant.io/components/spook.number) |
| [spook.select](https://www.home-assistant.io/components/spook.select) |
| [spook.sensor](https://www.home-assistant.io/components/spook.sensor) |
| [spook.switch](https://www.home-assistant.io/components/spook.switch) |
| [spook.time](https://www.home-assistant.io/components/spook.time) |
| [spotify](https://www.home-assistant.io/components/spotify) |
| [spotify.media_player](https://www.home-assistant.io/components/spotify.media_player) |
| [spotifyplus](https://www.home-assistant.io/components/spotifyplus) |
| [spotifyplus.media_player](https://www.home-assistant.io/components/spotifyplus.media_player) |
| [sql](https://www.home-assistant.io/components/sql) |
| [sql.sensor](https://www.home-assistant.io/components/sql.sensor) |
| [sql_json.sensor](https://www.home-assistant.io/components/sql_json.sensor) |
| [ssdp](https://www.home-assistant.io/components/ssdp) |
| [start_time](https://www.home-assistant.io/components/start_time) |
| [start_time.sensor](https://www.home-assistant.io/components/start_time.sensor) |
| [statistics.sensor](https://www.home-assistant.io/components/statistics.sensor) |
| [stream](https://www.home-assistant.io/components/stream) |
| [stt](https://www.home-assistant.io/components/stt) |
| [sun](https://www.home-assistant.io/components/sun) |
| [sun.sensor](https://www.home-assistant.io/components/sun.sensor) |
| [sun2](https://www.home-assistant.io/components/sun2) |
| [sun2.binary_sensor](https://www.home-assistant.io/components/sun2.binary_sensor) |
| [sun2.sensor](https://www.home-assistant.io/components/sun2.sensor) |
| [swatch_time](https://www.home-assistant.io/components/swatch_time) |
| [swatch_time.sensor](https://www.home-assistant.io/components/swatch_time.sensor) |
| [switch](https://www.home-assistant.io/components/switch) |
| [synology_dsm](https://www.home-assistant.io/components/synology_dsm) |
| [synology_dsm.binary_sensor](https://www.home-assistant.io/components/synology_dsm.binary_sensor) |
| [synology_dsm.button](https://www.home-assistant.io/components/synology_dsm.button) |
| [synology_dsm.camera](https://www.home-assistant.io/components/synology_dsm.camera) |
| [synology_dsm.sensor](https://www.home-assistant.io/components/synology_dsm.sensor) |
| [synology_dsm.switch](https://www.home-assistant.io/components/synology_dsm.switch) |
| [synology_dsm.update](https://www.home-assistant.io/components/synology_dsm.update) |
| [syslog.notify](https://www.home-assistant.io/components/syslog.notify) |
| [system_health](https://www.home-assistant.io/components/system_health) |
| [system_log](https://www.home-assistant.io/components/system_log) |
| [systemmonitor](https://www.home-assistant.io/components/systemmonitor) |
| [systemmonitor.binary_sensor](https://www.home-assistant.io/components/systemmonitor.binary_sensor) |
| [systemmonitor.sensor](https://www.home-assistant.io/components/systemmonitor.sensor) |
| [tag](https://www.home-assistant.io/components/tag) |
| [tautulli](https://www.home-assistant.io/components/tautulli) |
| [tautulli.sensor](https://www.home-assistant.io/components/tautulli.sensor) |
| [teamtracker](https://www.home-assistant.io/components/teamtracker) |
| [teamtracker.sensor](https://www.home-assistant.io/components/teamtracker.sensor) |
| [temperature_feels_like.sensor](https://www.home-assistant.io/components/temperature_feels_like.sensor) |
| [template](https://www.home-assistant.io/components/template) |
| [template.binary_sensor](https://www.home-assistant.io/components/template.binary_sensor) |
| [template.fan](https://www.home-assistant.io/components/template.fan) |
| [template.sensor](https://www.home-assistant.io/components/template.sensor) |
| [template.switch](https://www.home-assistant.io/components/template.switch) |
| [template.weather](https://www.home-assistant.io/components/template.weather) |
| [text](https://www.home-assistant.io/components/text) |
| [thermal_comfort](https://www.home-assistant.io/components/thermal_comfort) |
| [thermal_comfort.sensor](https://www.home-assistant.io/components/thermal_comfort.sensor) |
| [thread](https://www.home-assistant.io/components/thread) |
| [time](https://www.home-assistant.io/components/time) |
| [time_date](https://www.home-assistant.io/components/time_date) |
| [time_date.sensor](https://www.home-assistant.io/components/time_date.sensor) |
| [timer](https://www.home-assistant.io/components/timer) |
| [tod](https://www.home-assistant.io/components/tod) |
| [tod.binary_sensor](https://www.home-assistant.io/components/tod.binary_sensor) |
| [tomorrowio](https://www.home-assistant.io/components/tomorrowio) |
| [tomorrowio.sensor](https://www.home-assistant.io/components/tomorrowio.sensor) |
| [tomorrowio.weather](https://www.home-assistant.io/components/tomorrowio.weather) |
| [trace](https://www.home-assistant.io/components/trace) |
| [trend.binary_sensor](https://www.home-assistant.io/components/trend.binary_sensor) |
| [tts](https://www.home-assistant.io/components/tts) |
| [tuya](https://www.home-assistant.io/components/tuya) |
| [tuya.alarm_control_panel](https://www.home-assistant.io/components/tuya.alarm_control_panel) |
| [tuya.binary_sensor](https://www.home-assistant.io/components/tuya.binary_sensor) |
| [tuya.button](https://www.home-assistant.io/components/tuya.button) |
| [tuya.camera](https://www.home-assistant.io/components/tuya.camera) |
| [tuya.climate](https://www.home-assistant.io/components/tuya.climate) |
| [tuya.cover](https://www.home-assistant.io/components/tuya.cover) |
| [tuya.fan](https://www.home-assistant.io/components/tuya.fan) |
| [tuya.humidifier](https://www.home-assistant.io/components/tuya.humidifier) |
| [tuya.light](https://www.home-assistant.io/components/tuya.light) |
| [tuya.number](https://www.home-assistant.io/components/tuya.number) |
| [tuya.scene](https://www.home-assistant.io/components/tuya.scene) |
| [tuya.select](https://www.home-assistant.io/components/tuya.select) |
| [tuya.sensor](https://www.home-assistant.io/components/tuya.sensor) |
| [tuya.siren](https://www.home-assistant.io/components/tuya.siren) |
| [tuya.switch](https://www.home-assistant.io/components/tuya.switch) |
| [tuya.vacuum](https://www.home-assistant.io/components/tuya.vacuum) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [unifi.button](https://www.home-assistant.io/components/unifi.button) |
| [unifi.device_tracker](https://www.home-assistant.io/components/unifi.device_tracker) |
| [unifi.image](https://www.home-assistant.io/components/unifi.image) |
| [unifi.sensor](https://www.home-assistant.io/components/unifi.sensor) |
| [unifi.switch](https://www.home-assistant.io/components/unifi.switch) |
| [unifi.update](https://www.home-assistant.io/components/unifi.update) |
| [unifi_insights](https://www.home-assistant.io/components/unifi_insights) |
| [unifi_insights.binary_sensor](https://www.home-assistant.io/components/unifi_insights.binary_sensor) |
| [unifi_insights.button](https://www.home-assistant.io/components/unifi_insights.button) |
| [unifi_insights.sensor](https://www.home-assistant.io/components/unifi_insights.sensor) |
| [unifi_mqtt](https://www.home-assistant.io/components/unifi_mqtt) |
| [universal.media_player](https://www.home-assistant.io/components/universal.media_player) |
| [untappd.sensor](https://www.home-assistant.io/components/untappd.sensor) |
| [update](https://www.home-assistant.io/components/update) |
| [uptime](https://www.home-assistant.io/components/uptime) |
| [uptime.sensor](https://www.home-assistant.io/components/uptime.sensor) |
| [uptime_kuma](https://www.home-assistant.io/components/uptime_kuma) |
| [uptime_kuma.binary_sensor](https://www.home-assistant.io/components/uptime_kuma.binary_sensor) |
| [uptime_kuma.sensor](https://www.home-assistant.io/components/uptime_kuma.sensor) |
| [usb](https://www.home-assistant.io/components/usb) |
| [usgs_earthquakes_feed.geo_location](https://www.home-assistant.io/components/usgs_earthquakes_feed.geo_location) |
| [utility_meter](https://www.home-assistant.io/components/utility_meter) |
| [utility_meter.sensor](https://www.home-assistant.io/components/utility_meter.sensor) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [valve](https://www.home-assistant.io/components/valve) |
| [version](https://www.home-assistant.io/components/version) |
| [version.binary_sensor](https://www.home-assistant.io/components/version.binary_sensor) |
| [version.sensor](https://www.home-assistant.io/components/version.sensor) |
| [wake_on_lan](https://www.home-assistant.io/components/wake_on_lan) |
| [wake_word](https://www.home-assistant.io/components/wake_word) |
| [waqi](https://www.home-assistant.io/components/waqi) |
| [waqi.sensor](https://www.home-assistant.io/components/waqi.sensor) |
| [watchman](https://www.home-assistant.io/components/watchman) |
| [watchman.sensor](https://www.home-assistant.io/components/watchman.sensor) |
| [water_heater](https://www.home-assistant.io/components/water_heater) |
| [waternsw.sensor](https://www.home-assistant.io/components/waternsw.sensor) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weatherflow](https://www.home-assistant.io/components/weatherflow) |
| [weatherflow.sensor](https://www.home-assistant.io/components/weatherflow.sensor) |
| [weatherflow_cloud](https://www.home-assistant.io/components/weatherflow_cloud) |
| [weatherflow_cloud.sensor](https://www.home-assistant.io/components/weatherflow_cloud.sensor) |
| [weatherflow_cloud.weather](https://www.home-assistant.io/components/weatherflow_cloud.weather) |
| [weatherflow_forecast](https://www.home-assistant.io/components/weatherflow_forecast) |
| [weatherflow_forecast.binary_sensor](https://www.home-assistant.io/components/weatherflow_forecast.binary_sensor) |
| [weatherflow_forecast.sensor](https://www.home-assistant.io/components/weatherflow_forecast.sensor) |
| [weatherflow_forecast.weather](https://www.home-assistant.io/components/weatherflow_forecast.weather) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [webostv](https://www.home-assistant.io/components/webostv) |
| [webostv.media_player](https://www.home-assistant.io/components/webostv.media_player) |
| [webostv.notify](https://www.home-assistant.io/components/webostv.notify) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
| [withings](https://www.home-assistant.io/components/withings) |
| [withings.binary_sensor](https://www.home-assistant.io/components/withings.binary_sensor) |
| [withings.calendar](https://www.home-assistant.io/components/withings.calendar) |
| [withings.sensor](https://www.home-assistant.io/components/withings.sensor) |
| [workday](https://www.home-assistant.io/components/workday) |
| [workday.binary_sensor](https://www.home-assistant.io/components/workday.binary_sensor) |
| [worldclock](https://www.home-assistant.io/components/worldclock) |
| [worldclock.sensor](https://www.home-assistant.io/components/worldclock.sensor) |
| [worlds_air_quality_index](https://www.home-assistant.io/components/worlds_air_quality_index) |
| [worlds_air_quality_index.sensor](https://www.home-assistant.io/components/worlds_air_quality_index.sensor) |
| [wud_getupdates](https://www.home-assistant.io/components/wud_getupdates) |
| [wud_getupdates.sensor](https://www.home-assistant.io/components/wud_getupdates.sensor) |
| [xtend_tuya](https://www.home-assistant.io/components/xtend_tuya) |
| [xtend_tuya.alarm_control_panel](https://www.home-assistant.io/components/xtend_tuya.alarm_control_panel) |
| [xtend_tuya.binary_sensor](https://www.home-assistant.io/components/xtend_tuya.binary_sensor) |
| [xtend_tuya.button](https://www.home-assistant.io/components/xtend_tuya.button) |
| [xtend_tuya.camera](https://www.home-assistant.io/components/xtend_tuya.camera) |
| [xtend_tuya.climate](https://www.home-assistant.io/components/xtend_tuya.climate) |
| [xtend_tuya.cover](https://www.home-assistant.io/components/xtend_tuya.cover) |
| [xtend_tuya.fan](https://www.home-assistant.io/components/xtend_tuya.fan) |
| [xtend_tuya.humidifier](https://www.home-assistant.io/components/xtend_tuya.humidifier) |
| [xtend_tuya.light](https://www.home-assistant.io/components/xtend_tuya.light) |
| [xtend_tuya.lock](https://www.home-assistant.io/components/xtend_tuya.lock) |
| [xtend_tuya.number](https://www.home-assistant.io/components/xtend_tuya.number) |
| [xtend_tuya.scene](https://www.home-assistant.io/components/xtend_tuya.scene) |
| [xtend_tuya.select](https://www.home-assistant.io/components/xtend_tuya.select) |
| [xtend_tuya.sensor](https://www.home-assistant.io/components/xtend_tuya.sensor) |
| [xtend_tuya.siren](https://www.home-assistant.io/components/xtend_tuya.siren) |
| [xtend_tuya.switch](https://www.home-assistant.io/components/xtend_tuya.switch) |
| [xtend_tuya.time](https://www.home-assistant.io/components/xtend_tuya.time) |
| [xtend_tuya.vacuum](https://www.home-assistant.io/components/xtend_tuya.vacuum) |
| [yahoofinance](https://www.home-assistant.io/components/yahoofinance) |
| [yahoofinance.sensor](https://www.home-assistant.io/components/yahoofinance.sensor) |
| [youtube](https://www.home-assistant.io/components/youtube) |
| [youtube.sensor](https://www.home-assistant.io/components/youtube.sensor) |
| [zeroconf](https://www.home-assistant.io/components/zeroconf) |
| [zha](https://www.home-assistant.io/components/zha) |
| [zha.alarm_control_panel](https://www.home-assistant.io/components/zha.alarm_control_panel) |
| [zha.binary_sensor](https://www.home-assistant.io/components/zha.binary_sensor) |
| [zha.button](https://www.home-assistant.io/components/zha.button) |
| [zha.climate](https://www.home-assistant.io/components/zha.climate) |
| [zha.cover](https://www.home-assistant.io/components/zha.cover) |
| [zha.device_tracker](https://www.home-assistant.io/components/zha.device_tracker) |
| [zha.fan](https://www.home-assistant.io/components/zha.fan) |
| [zha.light](https://www.home-assistant.io/components/zha.light) |
| [zha.lock](https://www.home-assistant.io/components/zha.lock) |
| [zha.number](https://www.home-assistant.io/components/zha.number) |
| [zha.select](https://www.home-assistant.io/components/zha.select) |
| [zha.sensor](https://www.home-assistant.io/components/zha.sensor) |
| [zha.siren](https://www.home-assistant.io/components/zha.siren) |
| [zha.switch](https://www.home-assistant.io/components/zha.switch) |
| [zha.update](https://www.home-assistant.io/components/zha.update) |
| [zodiac](https://www.home-assistant.io/components/zodiac) |
| [zodiac.sensor](https://www.home-assistant.io/components/zodiac.sensor) |
| [zone](https://www.home-assistant.io/components/zone) |
</details>

<details><summary>96 Custom Integrations</summary>

| Name | Version | Description | Authors |
| --- | --- | --- | --- |
| [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting) |  [v1.25.0] | Adaptive Lighting custom component for Home Assistant |[@basnijholt](https://github.com/basnijholt), [@RubenKelevra](https://github.com/RubenKelevra), [@th3w1zard1](https://github.com/th3w1zard1), [@protyposis](https://github.com/protyposis).|
| [Adsb.Lol For Homeassistant](https://github.com/vingerha/ha_adsb_lol) |  [v0.1.3] | Home Assistant Integration with adsb.lol |[@vingerha](https://github.com/vingerha).|
| [Anniversaries](https://github.com/pinkywafer/Anniversaries) |  [v6.0.1] | Anniversary Countdown Sensor for Home Assistant |[@pinkywafer](https://github.com/pinkywafer).|
| [Apparent Temperature](https://github.com/Limych/ha-apparent-temperature) |  [v1.1.1] | Sensor of Apparent Temperature for Home Assistant. |[@Limych](https://github.com/Limych).|
| [Astroweather](https://github.com/mawinkler/astroweather) |  [v0.73.0] | Asynchronous Astro Weather Forecast for Home Assistant |[@mawinkler](https://github.com/mawinkler).|
| [Australian Space Weather](https://github.com/kcoffau/AUS_BOM_Space_Weather_Alert_System) |  [v1.0.1] | Provides the Australian Bureau of Meteorology Space Weather Alert System values |[@kcoffau](https://github.com/kcoffau).|
| [Average Sensor](https://github.com/Limych/ha-average) |  [v2.4.0] | Average Sensor for Home Assistant |[@Limych](https://github.com/Limych).|
| [Awtrix Notifications](https://github.com/10der/homeassistant-custom_components-awtrix) |  | HASS awtrix |[@10der](https://github.com/10der).|
| [Bermuda Ble Trilateration](https://github.com/agittins/bermuda) |  [v0.8.1] | Bermuda Bluetooth/BLE Triangulation / Trilateration for HomeAssistant |[@agittins](https://github.com/agittins).|
| [Blitzortung.Org Lightning Detector](https://github.com/mrk-its/homeassistant-blitzortung) |  [v1.3.9] | Custom Component for fetching lightning data from blitzortung.org |[@mrk-its](https://github.com/mrk-its).|
| [Browser Mod](https://github.com/thomasloven/hass-browser_mod) |  [v2.3.3] | 🔹 A Home Assistant integration to turn your browser into a controllable entity and media player ||
| [Bureau Of Meteorology](https://github.com/bremor/bureau_of_meteorology) |  [v1.3.5] | Custom component for retrieving weather information from the Bureau of Meteorology. |[@bremor,@makin-things](https://github.com/bremor,makin-things).|
| [Cloudflare Speed Test](https://github.com/DigitallyRefined/ha-cloudflare-speed-test) |  [v0.0.1] | Cloudflare Speed Test for Home Assistant |[@DigitallyRefined](https://github.com/DigitallyRefined).|
| [Cloudflare Tunnel Monitor](https://github.com/deadbeef3137/ha-cloudflare-tunnel-monitor) |  [v2.1.7.2] | Integration (custom_component) for Home Assistant that monitors the status of your Cloudflare tunnels. |[@deadbeef3137](https://github.com/deadbeef3137).|
| [Composite Device Tracker](https://github.com/pnbruckner/ha-composite-tracker) |  [v3.4.5] | Home Assistant Composite Device Tracker |[@pnbruckner](https://github.com/pnbruckner).|
| [Cupertino Icons](https://github.com/menahishayan/HomeAssistant-Cupertino-Icons) |  [v3.0.2] | Apple SF Symbols icons for Home Assistant! (3000+ icons) ||
| [Custom Icons](https://github.com/thomasloven/hass-custom_icons) |  | 🔹 Use custom svg icons in Home Assistant |[@thomasloven](https://github.com/thomasloven).|
| [Custom Templates](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Custom-Templates) |  [v1.4.1] | This integration adds possibility to use new functions in Home Assistant Jinja2 templating engine. |[@PiotrMachowski](https://github.com/PiotrMachowski).|
| [Daily Sensor](https://github.com/jeroenterheerdt/HADailySensor) |  [v2025.4.0] | Sensor for Home Assistant that gets reset at midnight |[@jeroenterheerdt](https://github.com/jeroenterheerdt).|
| [Default Config Disabler](https://github.com/tronikos/default_config_disabler) |  [v0.0.5] | Disables components from Home Assistant's default_config |[@tronikos](https://github.com/tronikos).|
| [Device Tools](https://github.com/EuleMitKeule/device-tools) |  [v1.9.0] | Device Tools: Create, modify and merge your Home Assistant devices. |[@EuleMitKeule](https://github.com/EuleMitKeule).|
| [Dynamic Energy Cost](https://github.com/martinarva/dynamic_energy_cost) |  [v0.8.1] | A Home Assistant integration to provide real-time and cumulative energy cost tracking, optimized for dynamic electricity prices like Nord Pool. |[@martinarva](https://github.com/martinarva).|
| [Dyson](https://github.com/libdyson-wg/ha-dyson) |  [v1.5.2] | Home Assistant custom integration for Wi-Fi connected Dyson devices |[@libdyson-wg](https://github.com/libdyson-wg), [@dotvezz](https://github.com/dotvezz).|
| [Emsc Earthquake](https://github.com/febalci/ha_emsc_earthquake) |  | Home Assistant Custom Component for Near Realtime Notifications of Earthquakes from EMSC |[@your_github_handle](https://github.com/your_github_handle).|
| [Eufy Security](https://github.com/fuatakgun/eufy_security) |  [v8.1.1] | Home Assistant integration to manage Eufy Security devices as cameras, home base stations, doorbells, motion and contact sensors. |[@fuatakgun](https://github.com/fuatakgun).|
| [F1 Sensor](https://github.com/Nicxe/f1_sensor) |  [v0.1.1] | A Home Assistant Custom Integration that provides information about the next Formula 1 race and the full season calendar |[@Nicxe](https://github.com/Nicxe).|
| [Feedparser](https://github.com/custom-components/feedparser) |  [v0.1.12] | 📰 RSS Feed Integration |[@iantrich](https://github.com/iantrich), [@ogajduse](https://github.com/ogajduse).|
| [Flightradar24](https://github.com/AlexandrErohin/home-assistant-flightradar24) |  [v1.25.2] | Flightradar24 integration for Home Assistant |[@AlexandrErohin](https://github.com/AlexandrErohin).|
| [Fontawesome](https://github.com/thomasloven/hass-fontawesome) |  [v2.2.3] | 🔹 Use icons from fontawesome in home-assistant |[@thomasloven](https://github.com/thomasloven).|
| [Fuel Prices](https://github.com/pantherale0/ha-fuelprices) |  [v2025.4.2] | A generic and extensible integration with pyfuelprices to retrieve local (or remote) fuel price data. |[@pantherale0](https://github.com/pantherale0).|
| [Generate Readme](https://github.com/custom-components/readme) |  [v0.5.0] | Use Jinja and data from Home Assistant to generate your README.md file |[@ludeeus](https://github.com/ludeeus).|
| [Google Home](https://github.com/leikoilja/ha-google-home) |  [v1.12.1] | Home Assistant Google Home custom component |[@leikoilja](https://github.com/leikoilja), [@DurgNomis-drol](https://github.com/DurgNomis-drol), [@ArnyminerZ](https://github.com/ArnyminerZ), [@KapJI](https://github.com/KapJI).|
| [Gtfs Realtime](https://github.com/bcpearce/homeassistant-gtfs-realtime) |  [v0.2.5] | Home Assistant Custom Integration for GTFS Realtime Data |[@bcpearce](https://github.com/bcpearce).|
| [Gtfs2 For Homeassistant](https://github.com/vingerha/gtfs2) |  [v0.5.6.1] | Support GTFS in Home Assistant GUI-only |[@vingerha](https://github.com/vingerha).|
| [Home Assistant Community Store (HACS)](https://github.com/hacs/integration) |  [v2.0.5] | HACS gives you a powerful UI to handle downloads of all your custom needs. |[@ludeeus](https://github.com/ludeeus).|
| [Hdhomerun](https://github.com/uvjim/hass_hdhomerun) |  [v2025.2.1] | Home Assistant integration for HDHomeRun |[@uvjim](https://github.com/uvjim).|
| [Holidays](https://github.com/bruxy70/Holidays) |  [v1.9.10] | 📅 Custom Home Assistant integration for public holidays - also used for garbage_collection integration to automatically move scheduled events that fall on a public holiday (by an automation blueprint) |[@bruxy70](https://github.com/bruxy70).|
| [Ical Sensor](https://github.com/tybritten/ical-sensor-homeassistant) |  [v1.7.2] | an iCal Sensor for Home Assistant |[@Olen](https://github.com/Olen), [@TyBritten](https://github.com/TyBritten).|
| [Icloud3 V3 Idevice Tracker](https://github.com/gcobb321/icloud3) |  [v3.1.6.1] | iCloud3 v3, iDevice Tracker - An advanced iDevice tracker that uses Apple iCloud account and HA Mobile App data for presence detection and location based automations. |[@gcobb321](https://github.com/gcobb321).|
| [Icloud3 V3, Idevice Tracker, Dev Edition](https://github.com/gcobb321/icloud3_v3) |  [v3.1.6.1] | iCloud3 v3, iDevice Tracker, Development Version - This Repo/Version is used for development and testing of new and updated features. It is not the official release of iCloud3 v3, . |[@gcobb321](https://github.com/gcobb321).|
| [Ics Calendar (Icalendar)](https://github.com/franc6/ics_calendar) |  [v5.1.3] | Provides an ICS (icalendar) platform for the Home Assistant calendar |[@franc6](https://github.com/franc6).|
| [Illuminance](https://github.com/pnbruckner/ha-illuminance) |  [v5.6.1] | Home Assistant Illuminance Sensor |[@pnbruckner](https://github.com/pnbruckner).|
| [Indoor Air Quality Uk Index](https://github.com/Limych/ha-iaquk) |  [v1.6.10] | Indoor Air Quality Sensor Component for Home Assistant |[@Limych](https://github.com/Limych).|
| [Iphone Device Tracker](https://github.com/mudape/iphonedetect) |  [v2.4.1] | A custom component for Home Assistant to detect iPhones connected to local LAN, even if the phone is in deep sleep. |[@mudape](https://github.com/mudape).|
| [Llm Vision](https://github.com/valentinfrlch/ha-llmvision) |  [v1.4.2] | Let Home Assistant see! |[@valentinfrlch](https://github.com/valentinfrlch).|
| [Lovelace Gen](https://github.com/thomasloven/hass-lovelace_gen) |  [v0.1.3] | 🔹 Improve the lovelace yaml parser for Home Assistant ||
| [Lunar Phase](https://github.com/ngocjohn/lunar-phase) |  [v0.2.2] | 🌘  Lunar Phase Integration for Home Assistant |[@ngocjohn](https://github.com/ngocjohn).|
| [Material Symbols](https://github.com/beecho01/material-symbols) |  [v2025.04.11] | Material Symbols for Home Assistant is a collection of 14,028 Google Material Symbols for use within Home Assistant. It uses the icon-set produced and maintained by iconify. |[@beecho01](https://github.com/beecho01).|
| [Measureit](https://github.com/danieldotnl/ha-measureit) |  [v0.8.2] | Measure anything in Home Assistant based on time and conditions. |[@danieldotnl](https://github.com/danieldotnl).|
| [Mediarr](https://github.com/Vansmak/mediarr_sensor) |  [v3.1.4] |  |[@vansmak](https://github.com/vansmak).|
| [Monitor Docker](https://github.com/ualex73/monitor_docker) |  [v1.19] | Monitor Docker containers from Home Assistant |[@ualex73](https://github.com/ualex73).|
| [Multiscrape](https://github.com/danieldotnl/ha-multiscrape) |  [v8.0.5] | Home Assistant custom component for scraping (html, xml or json) multiple values (from a single HTTP request) with a separate sensor/attribute for each value. Support for (login) form-submit functionality. |[@danieldotnl](https://github.com/danieldotnl).|
| [Myjdownloader](https://github.com/doudz/homeassistant-myjdownloader) |  [v2.5.0] | myjdownloader integration for home assistant |[@doudz](https://github.com/doudz), [@oribafi](https://github.com/oribafi).|
| [Network Scanner](https://github.com/parvez/network_scanner) |  [v1.0.7] | This Home Assistant integration provides a network scanner that identifies all devices on your local network. Utilizing the provided IP range and MAC address mappings, it gives each identified device a user-friendly name and manufacturer information. |[@parvez](https://github.com/parvez).|
| [Node Red Companion](https://github.com/zachowj/hass-node-red) |  [v4.1.2] | Companion Component for node-red-contrib-home-assistant-websocket to help integrate Node-RED with Home Assistant Core |[@zachowj](https://github.com/zachowj).|
| [Nsw Rural Fire Service   Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger) |  [v0.20] | Home Assistant Custom Component: NSW Rural Fire Service Fire Danger |[@exxamalte](https://github.com/exxamalte).|
| [Open Meteo Solar Forecast](https://github.com/rany2/ha-open-meteo-solar-forecast) |  [v0.1.21] | Home Assistant Open-Meteo Solar Forecast Integration |[@rany2](https://github.com/rany2).|
| [Opennem (Au) Data](https://github.com/bacco007/sensor.opennem) |  [v2023.09.1] | OpenNEM Sensor for Home Assistant |[@bacco007](https://github.com/bacco007).|
| [Passive Ble Monitor Integration](https://github.com/custom-components/ble_monitor) |  [v13.2.0-beta] | BLE monitor for passive BLE sensors |[@Ernst79](https://github.com/Ernst79), [@myhomeiot](https://github.com/myhomeiot).|
| [Pirate Weather](https://github.com/Pirate-Weather/pirate-weather-ha) |  [v1.7.2] | Replacement for the default Dark Sky Home Assistant integration using Pirate Weather |[@alexander0042](https://github.com/alexander0042).|
| [Playstation Network](https://github.com/JackJPowell/hass-psn) |  [v0.7.4] | Home Assistant integration for the Playstation Network |[@jackjpowell](https://github.com/jackjpowell).|
| [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added) |  [v0.5.3] | ▶️ Plex component to feed Upcoming Media Card. |[@maykar](https://github.com/maykar).|
| [Powercalc](https://github.com/bramstroker/homeassistant-powercalc) |  [v1.17.11] | Custom component to calculate estimated power consumption of lights and other appliances |[@bramstroker](https://github.com/bramstroker).|
| [Prometheus Sensor](https://github.com/mweinelt/ha-prometheus-sensor) |  [v1.1.2] | Import 🔥 Prometheus query results into 🏡 Home Assistant 📈 |[@mweinelt](https://github.com/mweinelt).|
| [Proxmox Ve](https://github.com/dougiteixeira/proxmoxve) |  [v3.5.2] | Proxmox VE Custom Integration Home Assistant |[@dougiteixeira](https://github.com/dougiteixeira).|
| [Pyscript](https://github.com/custom-components/pyscript) |  [v1.6.4] | Pyscript adds rich Python scripting to HASS |[@craigbarratt](https://github.com/craigbarratt).|
| [Qbittorrent Alt](https://github.com/chris-mc1/qBittorrent-hass) |  [v0.1.0] | Alternative qBittorrent integration for Home Assistant |[@chris-mc1](https://github.com/chris-mc1).|
| [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media) |  [v0.4.2] | 🎬 Radarr component to feed Upcoming Media Card. |[@maykar](https://github.com/maykar).|
| [Response As Sensor](https://github.com/gjohansson-ST/response_as_sensor) |  [v1.0] | Home Assistant Service call response as entity |[@gjohansson-ST](https://github.com/gjohansson-ST).|
| [Satellite Tracker (N2Yo)](https://github.com/djtimca/hasatellitetracker) |  [v0.0.14] | Using the N2YO API, this Home Assistant integration will provide visible satellite passes (general) and to add specific satellites for monitoring. |[@djtimca](https://github.com/djtimca).|
| [Simpleicons](https://github.com/vigonotion/hass-simpleicons) |  [v2.3.1] | Use Simple Icons in Home Assistant ||
| [Smartthinq Lge Sensors](https://github.com/ollo69/ha-smartthinq-sensors) |  [v0.41.1] | HomeAssistant custom integration for SmartThinQ LG devices |[@ollo69](https://github.com/ollo69).|
| [Solcast Pv Forecast](https://github.com/BJReplay/ha-solcast-solar) |  [v4.3.2] | Solcast Integration for Home Assistant |[@BJReplay](https://github.com/BJReplay), [@autoSteve](https://github.com/autoSteve).|
| [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media) |  [v0.4.3] | 📺 Sonarr component to feed Upcoming Media Card. |[@maykar](https://github.com/maykar).|
| [Spook 👻 Your Homie](https://github.com/frenck/spook) |  [v3.1.0] | A scary 👻 powerful toolbox 🧰 for Home Assistant 🏡 |[@frenck](https://github.com/frenck).|
| [Spotifyplus](https://github.com/thlucas1/homeassistantcomponent_spotifyplus) |  [v1.0.120] | Home Assistant integration for Spotify Player control, services, and soundtouchplus integration support. |[@thlucas1](https://github.com/thlucas1).|
| [Sql (With Json Detection)](https://github.com/crowbarz/ha-sql_json) |  [v1.1.3] | Updated SQL integration for Home Assistant that supports JSON attributes |[@dgomes](https://github.com/dgomes), [@crowbarz](https://github.com/crowbarz).|
| [Start Time](https://github.com/AlexxIT/StartTime) |  [v1.1.8] | Start Time sensor for Home Assistant |[@AlexxIT](https://github.com/AlexxIT).|
| [Sun2](https://github.com/pnbruckner/ha-sun2) |  [v3.3.5] | Home Assistant Sun2 Sensor |[@pnbruckner](https://github.com/pnbruckner).|
| [Swatch Time](https://github.com/andrewjswan/SwatchTime) |  [v1.0.13] | Swatch / Internet Time for Home Assistant |[@andrewjswan](https://github.com/andrewjswan).|
| [Team Tracker](https://github.com/vasqued2/ha-teamtracker) |  [v0.14.9] | Home Assistant integration that provides real-time scores in multiple professional (NBA, NFL, NHL, MLB, MLS, and more), college (NCAA), and international (soccer, golf, tennis, mma, racing) sports using ESPN APIs. |[@vasqued2](https://github.com/vasqued2).|
| [Thermal Comfort](https://github.com/dolezsa/thermal_comfort) |  [v2.2.5] | Thermal Comfort sensor for HA (absolute humidity, heat index, dew point, thermal perception) |[@dolezsa](https://github.com/dolezsa).|
| [Unifi Device Info](https://github.com/w1tw0lf/Unifi-Device-info) |  [v1.0.2] | Unifi device stats via API for home assistant |[@w1tw0lf](https://github.com/w1tw0lf), [@ingoldsby](https://github.com/ingoldsby).|
| [Unifi Insights](https://github.com/domalab/ha-unifi-insights) |  [v2025.01.22] | Home Assistant integration that uses the UniFi Network API to monitor and manage UniFi devices |[@domalab](https://github.com/domalab).|
| [Unifi Site Manager](https://github.com/domalab/ha-unifi-site-manager) |  [v2025.01.22] | This integration allows you to monitor all UniFi sites from Home Assistant |[@domalab](https://github.com/domalab).|
| [Uptime Kuma](https://github.com/meichthys/uptime_kuma) |  [v2.3.1] | Uptime Kuma HACS integration |[@meichthys](https://github.com/meichthys), [@jayakornk](https://github.com/jayakornk).|
| [Variables+History](https://github.com/enkama/hass-variables) |  [v3.4.9] | Home Assistant variables component |[@rogro82](https://github.com/rogro82), [@enkama](https://github.com/enkama), [@Snuffy2](https://github.com/Snuffy2).|
| [Watchman](https://github.com/dummylabs/thewatchman) |  [v0.6.5] | Home Assistant custom integration to keep track of missing entities and actions in your config files |[@dummylabs](https://github.com/dummylabs).|
| [Waternsw Real Time Data](https://github.com/bacco007/sensor.waternsw) |  [v0.6] | Home Assistant Sensor for WaterNSW Real Time Data |[@bacco007](https://github.com/bacco007).|
| [Weatherflow Forecast And Sensor Integration](https://github.com/briis/weatherflow_forecast) |  [v1.0.13] | Home Assistant integration for WeatherFlow Forecast |[@briis](https://github.com/briis).|
| [Whats Up Docker Updates Monitor](https://github.com/pveiga90/What-s-up-Docker-Updates-Monitor) |  [v0.5] | Basic integration for What's up Docker API |[@pveiga90](https://github.com/pveiga90).|
| [Wican](https://github.com/jay-oswald/ha-wican) |  [v0.3.0] |  |[@jay-oswald](https://github.com/jay-oswald).|
| [World'S Air Quality Index](https://github.com/pawkakol1/worlds-air-quality-index) |  [v1.1.0] | HACS World's Air Quality Index integration from waqi.info |[@pawkakol1](https://github.com/pawkakol1).|
| [XMLTV EPG](https://github.com/shadow578/homeassistant_xmltv-epg) |  [v2.4.1] | XMLTV EPG for HomeAssisstant |[@shadow578](https://github.com/shadow578).|
| [Xtend Tuya](https://github.com/azerty9971/xtend_tuya) |  [v3.1.0] | eXtend Tuya's integration |[@azerty9971](https://github.com/azerty9971).|
| [Yahoo Finance](https://github.com/iprak/yahoofinance) |  [v1.2.15] | Home Assistant component which allows you to get stock updates from Yahoo finance. |[@iprak](https://github.com/iprak).|
</details>

<details><summary>71 Lovelace Plugins</summary>

| Name | Version | Description |
| --- | --- | --- |
| [Apexcharts Card](https://github.com/RomRider/apexcharts-card) |  [v2.1.2] | 📈 A Lovelace card to display advanced graphs and charts based on ApexChartsJS for Home Assistant |
| [Atomic Calendar Revive](https://github.com/totaldebug/atomic-calendar-revive) |  [v10.1.0-beta.1] | An advanced calendar card for Home Assistant Lovelace. |
| [Auto Entities](https://github.com/thomasloven/lovelace-auto-entities) |  [v1.13.0] | 🔹Automatically populate the entities-list of lovelace cards |
| [Bar Card](https://github.com/custom-cards/bar-card) |  [v3.2.0] | Customizable Animated Bar card for Home Assistant Lovelace |
| [Better Moment Card](https://github.com/ibz0q/better-moment-card) |  [v2025.01.11] | Digital date/time card for Lovelace 🕔 |
| [Bom Radar Card](https://github.com/Makin-Things/bom-radar-card) |  [v3.0.2] | A rain radar card using the new tiled images from the Australian BOM |
| [Bubble Card](https://github.com/Clooos/Bubble-Card) |  [v3.0.0-beta.4] | Bubble Card is a minimalist card collection for Home Assistant with a nice pop-up touch. |
| [Button Card](https://github.com/custom-cards/button-card) |  [v4.1.2] | ❇️ Lovelace button-card for home assistant |
| [Calendar Card Pro](https://github.com/alexpfau/calendar-card-pro) |  [v2.4.5] | 📅 A sleek and highly customizable calendar card for Home Assistant, designed for performance and a clean, modern look. |
| [Card Mod](https://github.com/thomasloven/lovelace-card-mod) |  [v3.4.4] | 🔹 Add CSS styles to (almost) any lovelace card |
| [Card Tools](https://github.com/thomasloven/lovelace-card-tools) |  [v11] | 🔹A collection of tools for other lovelace plugins to use |
| [Clock Weather Card](https://github.com/pkissling/clock-weather-card) |  [v2.8.11] | A Home Assistant Card indicating today's date/time, along with an iOS inspired weather forecast for the next days with animated icons |
| [Collapsable Cards](https://github.com/RossMcMillan92/lovelace-collapsable-cards) |  [v0.7.0] | A custom Lovelace card that hides other cards behind a dropdown toggle |
| [Compass Card](https://github.com/tomvanswam/compass-card) |  [v2.0.2] | A Lovelace card that shows a directional indicator on a compass for Home Assistant |
| [Config Template Card](https://github.com/iantrich/config-template-card) |  [v1.3.6] | 📝 Templatable Lovelace Configurations |
| [Custom Brand Icons](https://github.com/elax46/custom-brand-icons) |  [v2025.2.0] | Custom brand icons for Home Assistant |
| [Custom Features For Home Assistant Cards](https://github.com/Nerwyn/custom-card-features) |  [v4.3.9] | Home Assistant custom features for tile cards and more. Call any action using buttons, dropdowns, selectors, sliders, spinboxes, and toggles. |
| [Decluttering Card](https://github.com/custom-cards/decluttering-card) |  [v1.0.0] | 🧹 Declutter your lovelace configuration with the help of this card |
| [Device Card](https://github.com/homeassistant-extras/device-card) |  [v0.9.0] | Device Card to summarize device information in Home Assistant |
| [Digital Clock](https://github.com/wassy92x/lovelace-digital-clock) |  [v1.2.4] | A custom digital clock card for Home Assistant |
| [Easy Layout Card](https://github.com/kamtschatka/lovelace-easy-layout-card) |  | A modified version of the layout-card with an easier way to configure cards |
| [Expander Card](https://github.com/MelleD/lovelace-expander-card) |  [v2.3.2] | Expander card for HomeAssistant |
| [Firemote Card](https://github.com/PRProd/HA-Firemote) |  [v4.1.8] | Apple TV, Amazon Fire TV, Chromecast, Homatics, NVIDIA Shield, onn., Roku, Xiaomi Mi, and Android TV remote control card for Home Assistant |
| [Flex Table   Highly Customizable, Data Visualization](https://github.com/custom-cards/flex-table-card) |  [v0.7.8] | Highly Flexible Lovelace Card - arbitrary contents/columns/rows, regex matched, perfect to show appdaemon created content and anything breaking out of the entity_id + attributes concept |
| [Flightradar24 Card](https://github.com/Springvar/home-assistant-flightradar24-card) |  [v0.0.11] | Custom card to use with Flightradar24 integration for Home Assistant |
| [Fold Entity Row](https://github.com/thomasloven/lovelace-fold-entity-row) |  [v2.2.0] | 🔹 A foldable row for entities card, containing other rows |
| [Formula One Card](https://github.com/marcokreeft87/formulaone-card) |  [v1.12.4] | Present the data of Formula One in a pretty way |
| [Heatmap Card](https://github.com/kandsten/ha-heatmap-card) |  [vac99408] | Heatmap custom card for Home Assistant |
| [Horizon Card](https://github.com/rejuvenate/lovelace-horizon-card) |  [v1.3.1] | Sun Card successor: Visualize the position of the Sun over the horizon. |
| [Hourly Weather Card](https://github.com/decompil3d/lovelace-hourly-weather) |  [v6.6.1] | Hourly weather card for Home Assistant. Visualize upcoming weather conditions as a colored horizontal bar. |
| [Html Jinja2 Template Card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-HTML-Jinja2-Template-card) |  [v1.0.2] | This card displays provided Jinja2 template as an HTML content of a card. It uses exactly the same engine as Home Assistant in Developer tools. |
| [Hui Element](https://github.com/thomasloven/lovelace-hui-element) |  | 🔹 Use built-in elements in the wrong place |
| [Kiosk Mode](https://github.com/NemesisRE/kiosk-mode) |  [v6.7.0] | 🙈 Hides the Home Assistant header and/or sidebar |
| [Layout Card](https://github.com/thomasloven/lovelace-layout-card) |  [v2.4.5] | 🔹 Get more control over the placement of lovelace cards. |
| [Lovelace Card Templater](https://github.com/gadgetchnnel/lovelace-card-templater) |  [v0.0.17] | Custom Lovelace card which allows Jinja2 templates to be applied to other cards |
| [Mediarr Card](https://github.com/Vansmak/mediarr_card) |  [v1.5.1-tmdb] | custom component for home assistant |
| [Mediocre Hass Media Player Cards](https://github.com/antontanderup/mediocre-hass-media-player-cards) |  [v0.19.0] | Media Player Cards for Homeassistant. |
| [Mini Graph Card](https://github.com/kalkih/mini-graph-card) |  [v0.12.1] | Minimalistic graph card for Home Assistant Lovelace UI |
| [Mini Media Player](https://github.com/kalkih/mini-media-player) |  [v1.16.9] | Minimalistic media card for Home Assistant Lovelace UI |
| [Multiple Entity Row](https://github.com/benct/lovelace-multiple-entity-row) |  [v4.5.1] | Show multiple entity states and attributes on entity rows in Home Assistant's Lovelace UI |
| [Mushroom](https://github.com/piitaya/lovelace-mushroom) |  [v4.4.0] | Build a beautiful Home Assistant dashboard easily |
| [My Cards Bundle](https://github.com/AnthonMS/my-cards) |  [v1.0.6] | Bundle of my custom Lovelace cards for Home Assistant. Includes: my-slider, my-slider-v2, my-button |
| [Navbar Card](https://github.com/joseluis9595/lovelace-navbar-card) |  [v0.6.0] | Custom lovelace card that displays a bottom nav in mobile devices, and a side nav in desktop devices for easy navigation. |
| [Number Box](https://github.com/junkfix/numberbox-card) |  [v4.17] | Replace input_number sliders with plus and minus buttons |
| [Paper Buttons Row](https://github.com/jcwillox/lovelace-paper-buttons-row) |  [v2.2.0] | Adds highly configurable buttons that use actions and per-state styling. |
| [Plotly Graph Card](https://github.com/dbuezas/lovelace-plotly-graph-card) |  [v3.3.5] | Highly customisable Lovelace card to plot interactive graphs. Brings scrolling, zooming, and much more! |
| [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) |  [v0.2.5] | A power distribution card inspired by the official Energy Distribution card for Home Assistant |
| [Pqina Flip Clock](https://github.com/Thyraz/pqina-flip-clock-card) |  [v1.1.1] | Home Assistant Lovelace custom card showing a flip clock using the "PQINA flip" web component |
| [Sankey Chart Card](https://github.com/MindFreeze/ha-sankey-chart) |  [v3.7.0] | A Home Assistant lovelace card to display a sankey chart. For example for power consumption |
| [Search Card](https://github.com/postlund/search-card) |  [vefd0c2c] | Quickly search for entities from a Lovelace card. |
| [Secondaryinfo Entity Row](https://github.com/custom-cards/secondaryinfo-entity-row) |  [v5.0] | Custom entity row for HomeAssistant, providing additional types of data to be displayed in the secondary info area of the Lovelace Entities card |
| [Simple Weather Card](https://github.com/kalkih/simple-weather-card) |  [v0.8.5] | Minimalistic weather card for Home Assistant |
| [Slider Button Card](https://github.com/custom-cards/slider-button-card) |  [v1.13.0] | A button card with integrated slider |
| [Sonos Card](https://github.com/punxaphil/custom-sonos-card) |  [v8.6.0] | Home Assistant custom lovelace sonos card |
| [Spotify Lovelace Card](https://github.com/custom-cards/spotify-card) |  [v2.4.0] | Spotify playlist card for Home Assistant card |
| [Stack In Card](https://github.com/custom-cards/stack-in-card) |  [v0.2.0] | 🛠 group multiple cards into one card without the borders |
| [State Switch](https://github.com/thomasloven/lovelace-state-switch) |  [v1.9.5] | 🔹Dynamically replace lovelace cards depending on occasion |
| [Streamline Card](https://github.com/brunosabot/streamline-card) |  [v0.1.0] | Streamline your Lovelace configuration with with a card template system. |
| [Swipe Card](https://github.com/bramkragten/swipe-card) |  [v5.0.0] | Card that allows you to swipe throught multiple cards for Home Assistant Lovelace |
| [Swiss Army Knife Custom Card](https://github.com/AmoebeLabs/swiss-army-knife-card) |  [v2.5.1] | The versatile custom Swiss Army Knife card for Home Assistant allows you to create your unique visualization using several graphical tools, styling options and animations. |
| [Tabbed Card](https://github.com/kinghat/tabbed-card) |  [v0.3.2] | a custom card for home assistant that utilizes tabs to segregate individual cards. |
| [Team Tracker Card](https://github.com/vasqued2/ha-teamtracker-card) |  [v0.14.15] | A Home Assistant frontend custom card that will display real-time updates for teams tracked with the ha-teamtracker integration.  Has custom in-game layouts for football, baseball, basketball, hockey, soccer, golf, tennis, racing, and mma. |
| [Temperature Heatmap Card](https://github.com/zanac/temperature-heatmap-card) |  [v1.0.8] | Temperature Hetmap for Home Assistant heatmap |
| [Template Entity Row](https://github.com/thomasloven/lovelace-template-entity-row) |  [v1.4.1] | 🔹 Display whatever you want in an entities card row. |
| [Universal Remote Card](https://github.com/Nerwyn/universal-remote-card) |  [v4.4.3] | A completely customizable universal remote card for Home Assistant. Supports multiple platforms out of the box. |
| [Uptime Card](https://github.com/dylandoamaral/uptime-card) |  [v0.16.0] | Minimalistic uptime card for Home Assistant Lovelace UI |
| [Vertical Stack In Card](https://github.com/ofekashery/vertical-stack-in-card) |  [v1.0.1] | 📐 Home Assistant Card: Group multiple cards into a single sleek card. |
| [Weather Card](https://github.com/bramkragten/weather-card) |  [v1.5.0] | Weather Card with animated icons for Home Assistant Lovelace |
| [Weather Radar Card](https://github.com/Makin-Things/weather-radar-card) |  [v2.1.0] | A rain radar card using the tiled images from RainViewer |
| [Week Planner Card](https://github.com/FamousWolf/week-planner-card) |  [v1.12.0] | Custom Home Assistant card displaying a responsive overview or multiple days with events from one of multiple calendars |
| [Zigbee2Mqtt Networkmap Card](https://github.com/azuwis/zigbee2mqtt-networkmap) |  [v0.10.0] | Home Assistant Custom Card to show Zigbee2mqtt network map |
</details><details><summary>3 Themes</summary>

| Name | Version | Description |
| --- | --- | --- |
| [Bubble](https://github.com/Clooos/Bubble) |  [v1.2] | A dark minimalist theme with a mobile first approach for Home Assistant |
| [Metrology   Metro + Fluent + Windows Themes   By Mmak.Es](https://github.com/Madelena/Metrology-for-Hass) |  [v.1.9.1] | 🎨 Give your Home Assistant a modern and clean facelift. 🟥🟧🟩🟦🟪 24 Variations with 2 Styles + 6 Colors (Magenta Red / Orange / Green / Blue / Purple) + 🌞 Light and 🌚 Dark modes included. Based on Metro and Fluent UI Design Systems from Microsoft Windows. |
| [Noctis](https://github.com/aFFekopp/noctis) |  [v3.1] | 🐵 Dark Blue Theme for Home Assistant |
</details>

<details><summary>25 Addons via HA Operating System</summary>

| Name | Version | Description | Repository |
| --- | --- | --- | --- |
| Advanced SSH & Web Terminal | 20.0.2 |  | a0d7b954 |
| Browserless Chromium | 2.28.0 |  | db21ed7f |
| Cloudflared | 5.2.12 |  | 9074a9fa |
| DbStats | 0.5.12 |  | 8bce8ef4 |
| ESPHome Device Builder | 2025.4.1 |  | 15ef4d2f |
| eufy-security-ws | 1.9.2 |  | 402f1039 |
| Get HACS | 1.3.1 |  | cb646a50 |
| Glances | 0.21.1 |  | a0d7b954 |
| GoSungrow | 3.0.7 |  | ba22da74 |
| Home Assistant Google Drive Backup | 0.112.1 |  | cebe7a76 |
| Home Assistant Stream Deck | 2025.4.3 |  | dc473884 |
| JupyterLab | 0.15.9 |  | a0d7b954 |
| MariaDB | 2.7.2 |  | core |
| Matter Server | 7.0.0 |  | core |
| Music Assistant Server | 2.5.2 |  | d5369777 |
| Node-RED | 19.0.2 |  | a0d7b954 |
| OpenThread Border Router | 2.13.0 |  | core |
| phpMyAdmin | 0.11.1 |  | a0d7b954 |
| Samba share | 12.5.1 |  | core |
| Silicon Labs Multiprotocol | 2.4.5 |  | core |
| SNMPD | 0.4.0 |  | ca021f77 |
| SunGather | 0.1.4 |  | 7b536ee6 |
| Zigbee2MQTT | 2.2.1-1 |  | 45df7312 |
| ZigStar Silicon Labs FW Flasher | 0.1.1 |  | 193f5383 |
| ZigStar TI CC2652P/P7 FW Flasher | 0.4.1 |  | 193f5383 |
</details>


| [Menu](#menu) |

---

## Screenshots

![Screenshot - Home](./.assets/home.png?raw=True){: width="30%"}
![Screenshot - Devices](./.assets/devices.png?raw=True){: width="30%"}
![Screenshot - Home Assistant](./.assets/homeassistant.png?raw=True){: width="30%"}
![Screenshot - Sports](./.assets/sports.png?raw=True){: width="30%"}
![Screenshot - Solar](./.assets/solar.png?raw=True){: width="30%"}
![Screenshot - Untappd](./.assets/untappd.png?raw=True){: width="30%"}
![Screenshot - Weather](./.assets/weather.png?raw=True){: width="30%"}

| [Menu](#menu) |

---

## Licence

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to [https://unlicense.org](https://unlicense.org)

| [Menu](#menu) |

---

Generated by the [custom readme integration](https://github.com/custom-components/readme)

[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg
[buymeacoffee]: https://www.buymeacoffee.com/bacco007

[home-assistant]: https://home-assistant.io

[ha-version]: https://www.home-assistant.io/blog/categories/release-notes/
[ha-version-shield]: https://img.shields.io/badge/2025.4.4-555555?style=flat-square&logo=home-assistant

[github-build-status-shield]: https://img.shields.io/github/actions/workflow/status/bacco007/HomeAssistantConfig/homeassistant.yaml?branch=master&style=flat-square&logo=github-actions&logoColor=838B95
[github-build-status]: https://github.com/bacco007/HomeAssistantConfig/actions/workflows/homeassistant.yaml

[github-last-commit]: https://img.shields.io/github/last-commit/bacco007/HomeAssistantConfig/master?style=flat-square&logo=github&logoColor=838B95
[github-master]: https://github.com/bacco007/HomeAssistantConfig/commits/master

[commits-shield]: https://img.shields.io/github/commit-activity/m/bacco007/HomeAssistantConfig/master?style=flat-square&logo=github&logoColor=838B95
[commits]: https://github.com/bacco007/HomeAssistantConfig/commits/master

[forum-shield]: https://img.shields.io/discourse/topics?style=flat-square&label=community&logo=discourse&color=46B4ED&logoColor=46B4ED&server=https%3A%2F%2Fcommunity.home-assistant.io
[forum]: https://community.home-assistant.io

[discord-shield]: https://img.shields.io/discord/330944238910963714?style=flat-square&color=7289da&label=discord&logo=discord
[discord]: https://discord.gg/c5DvZ4e

[automations]: https://github.com/bacco007/HomeAssistantConfig/blob/master/automations.yaml
[integrations]: https://github.com/bacco007/HomeAssistantConfig/tree/master/integrations

[github-stars-shield]: https://img.shields.io/github/stars/bacco007/HomeAssistantConfig.svg?style=plasticr
[github-stars]: https://github.com/bacco007/HomeAssistantConfig/stargazers

[licence-shield]: https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square

[social-twitter-shield]: https://img.shields.io/twitter/follow/bacco007?style=social
[social-twitter]: https://www.x.com/bacco007
[social-mastodon-shield]: https://img.shields.io/mastodon/follow/000451950?domain=https%3A%2F%2Fmastodon.social
[social-mastodon]: https://mastodon.social/bacco007
[ha-community-shield]: https://img.shields.io/badge/HA%20community-forum-orange
[ha-community]: https://community.home-assistant.io/u/bacco007/summary