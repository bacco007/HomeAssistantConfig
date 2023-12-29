# 🏠TBSmartHome - Home Assistant Configuration

<img align="right" src="./.assets/logo.png?raw=true">

This is my [Home Assistant](https://www.home-assistant.io/) configuration - based on many of the other great configurations are out there (and listed below)

I live in ![Australia](http://flags.ox3.in/mini/au.png) so some of what you find here may not be relevent, or you may have access to better (and probably cheaper) ways.

It's very much a work-in-progress, but feel free to steal ideas or code to use for your own setup

_Please :star: this repo if you find it useful_

![GitHub last commit](https://img.shields.io/github/last-commit/bacco007/HomeAssistantConfig?style=flat-square)
![GitHub commit activity](https://img.shields.io/github/commit-activity/w/bacco007/HomeAssistantConfig?style=flat-square)
![Licence](https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square)

![Twitter Follow](https://img.shields.io/twitter/follow/bacco007?style=social)
![Mastodon Follow](https://img.shields.io/mastodon/follow/000451950?domain=https%3A%2F%2Fmastodon.social&style=social)

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

---

## Table of Contents

- [🏠TBSmartHome - Home Assistant Configuration](#tbsmarthome---home-assistant-configuration)
  - [Table of Contents](#table-of-contents)
  - [TL;DR](#tldr)
  - [Stats](#stats)
  - [Integrations Used](#integrations-used)
    - [Custom Components Used](#custom-components-used)
  - [Screenshots](#screenshots)
  - [HA Supervisor](#ha-supervisor)
    - [Addons](#addons)
  - [Licence](#licence)

---

## TL;DR

This is my Home Assistant config - documentation isn't my strongest skill, so if you've got any questions, hit me up

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Stats

_Stats as at 05:00, Saturday, December 30th 2023_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 2024.1.0b1 | 590     | 5370         | 3529 | 136 |

Type | Qty
-- | --
Alarm Control Panel | 2
Alert | 35
Automation | 136
Binary Sensor | 342
Camera | 5
Device Tracker | 95
Group | 43
Input Boolean | 23
Input Datetime | 0
Input Text | 3
Light | 14
Media Player | 22
Person | 4
Scene | 2
Script | 13
Sensor | 3529
Sun | 1
Switch | 311
Weather | 20
Zone | 3

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)

<details>
<summary>Expand Integrations List</summary>

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
| [airvisual](https://www.home-assistant.io/components/airvisual) |
| [airvisual.sensor](https://www.home-assistant.io/components/airvisual.sensor) |
| [airvisual_pro](https://www.home-assistant.io/components/airvisual_pro) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alert](https://www.home-assistant.io/components/alert) |
| [analytics](https://www.home-assistant.io/components/analytics) |
| [androidtv](https://www.home-assistant.io/components/androidtv) |
| [androidtv.media_player](https://www.home-assistant.io/components/androidtv.media_player) |
| [androidtv_remote](https://www.home-assistant.io/components/androidtv_remote) |
| [androidtv_remote.media_player](https://www.home-assistant.io/components/androidtv_remote.media_player) |
| [androidtv_remote.remote](https://www.home-assistant.io/components/androidtv_remote.remote) |
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
| [auth](https://www.home-assistant.io/components/auth) |
| [auto_backup](https://www.home-assistant.io/components/auto_backup) |
| [auto_backup.sensor](https://www.home-assistant.io/components/auto_backup.sensor) |
| [automation](https://www.home-assistant.io/components/automation) |
| [average](https://www.home-assistant.io/components/average) |
| [average.sensor](https://www.home-assistant.io/components/average.sensor) |
| [bayesian.binary_sensor](https://www.home-assistant.io/components/bayesian.binary_sensor) |
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
| [bluetooth_le_tracker.device_tracker](https://www.home-assistant.io/components/bluetooth_le_tracker.device_tracker) |
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
| [clock_drift](https://www.home-assistant.io/components/clock_drift) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [cloud.binary_sensor](https://www.home-assistant.io/components/cloud.binary_sensor) |
| [cloud.stt](https://www.home-assistant.io/components/cloud.stt) |
| [cloud.tts](https://www.home-assistant.io/components/cloud.tts) |
| [cloudflare_tunnel_monitor](https://www.home-assistant.io/components/cloudflare_tunnel_monitor) |
| [cloudflare_tunnel_monitor.sensor](https://www.home-assistant.io/components/cloudflare_tunnel_monitor.sensor) |
| [co2signal](https://www.home-assistant.io/components/co2signal) |
| [co2signal.sensor](https://www.home-assistant.io/components/co2signal.sensor) |
| [color_extractor](https://www.home-assistant.io/components/color_extractor) |
| [command_line](https://www.home-assistant.io/components/command_line) |
| [command_line.binary_sensor](https://www.home-assistant.io/components/command_line.binary_sensor) |
| [command_line.sensor](https://www.home-assistant.io/components/command_line.sensor) |
| [config](https://www.home-assistant.io/components/config) |
| [conversation](https://www.home-assistant.io/components/conversation) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cupertino](https://www.home-assistant.io/components/cupertino) |
| [custom_templates](https://www.home-assistant.io/components/custom_templates) |
| [daily](https://www.home-assistant.io/components/daily) |
| [daily.sensor](https://www.home-assistant.io/components/daily.sensor) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [derivative](https://www.home-assistant.io/components/derivative) |
| [derivative.sensor](https://www.home-assistant.io/components/derivative.sensor) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [diagnostics](https://www.home-assistant.io/components/diagnostics) |
| [dlna_dms](https://www.home-assistant.io/components/dlna_dms) |
| [doomsday_clock.sensor](https://www.home-assistant.io/components/doomsday_clock.sensor) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [dyson_local.binary_sensor](https://www.home-assistant.io/components/dyson_local.binary_sensor) |
| [dyson_local.button](https://www.home-assistant.io/components/dyson_local.button) |
| [dyson_local.select](https://www.home-assistant.io/components/dyson_local.select) |
| [dyson_local.sensor](https://www.home-assistant.io/components/dyson_local.sensor) |
| [dyson_local.switch](https://www.home-assistant.io/components/dyson_local.switch) |
| [energy](https://www.home-assistant.io/components/energy) |
| [energy.sensor](https://www.home-assistant.io/components/energy.sensor) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [esphome.button](https://www.home-assistant.io/components/esphome.button) |
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
| [fan](https://www.home-assistant.io/components/fan) |
| [fastdotcom](https://www.home-assistant.io/components/fastdotcom) |
| [fastdotcom.sensor](https://www.home-assistant.io/components/fastdotcom.sensor) |
| [feedparser.sensor](https://www.home-assistant.io/components/feedparser.sensor) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [file.notify](https://www.home-assistant.io/components/file.notify) |
| [file_upload](https://www.home-assistant.io/components/file_upload) |
| [filter.sensor](https://www.home-assistant.io/components/filter.sensor) |
| [flightradar24](https://www.home-assistant.io/components/flightradar24) |
| [flightradar24.sensor](https://www.home-assistant.io/components/flightradar24.sensor) |
| [fontawesome](https://www.home-assistant.io/components/fontawesome) |
| [forecast_solar](https://www.home-assistant.io/components/forecast_solar) |
| [forecast_solar.sensor](https://www.home-assistant.io/components/forecast_solar.sensor) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [garbage_collection.calendar](https://www.home-assistant.io/components/garbage_collection.calendar) |
| [garbage_collection.sensor](https://www.home-assistant.io/components/garbage_collection.sensor) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [gdacs.geo_location](https://www.home-assistant.io/components/gdacs.geo_location) |
| [gdacs.sensor](https://www.home-assistant.io/components/gdacs.sensor) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [github](https://www.home-assistant.io/components/github) |
| [github.sensor](https://www.home-assistant.io/components/github.sensor) |
| [glances](https://www.home-assistant.io/components/glances) |
| [glances.sensor](https://www.home-assistant.io/components/glances.sensor) |
| [google](https://www.home-assistant.io/components/google) |
| [google.calendar](https://www.home-assistant.io/components/google.calendar) |
| [google_fit](https://www.home-assistant.io/components/google_fit) |
| [google_fit.sensor](https://www.home-assistant.io/components/google_fit.sensor) |
| [google_translate.tts](https://www.home-assistant.io/components/google_translate.tts) |
| [group](https://www.home-assistant.io/components/group) |
| [group.light](https://www.home-assistant.io/components/group.light) |
| [group.notify](https://www.home-assistant.io/components/group.notify) |
| [gtfs2](https://www.home-assistant.io/components/gtfs2) |
| [gtfs2.sensor](https://www.home-assistant.io/components/gtfs2.sensor) |
| [gtfs_rt.sensor](https://www.home-assistant.io/components/gtfs_rt.sensor) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [hacs.sensor](https://www.home-assistant.io/components/hacs.sensor) |
| [hardware](https://www.home-assistant.io/components/hardware) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [harmony.remote](https://www.home-assistant.io/components/harmony.remote) |
| [harmony.select](https://www.home-assistant.io/components/harmony.select) |
| [harmony.switch](https://www.home-assistant.io/components/harmony.switch) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [hassio.binary_sensor](https://www.home-assistant.io/components/hassio.binary_sensor) |
| [hassio.sensor](https://www.home-assistant.io/components/hassio.sensor) |
| [hassio.update](https://www.home-assistant.io/components/hassio.update) |
| [hdhomerun](https://www.home-assistant.io/components/hdhomerun) |
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
| [homekit](https://www.home-assistant.io/components/homekit) |
| [http](https://www.home-assistant.io/components/http) |
| [humidifier](https://www.home-assistant.io/components/humidifier) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [iaquk.sensor](https://www.home-assistant.io/components/iaquk.sensor) |
| [ibeacon](https://www.home-assistant.io/components/ibeacon) |
| [ibeacon.device_tracker](https://www.home-assistant.io/components/ibeacon.device_tracker) |
| [ibeacon.sensor](https://www.home-assistant.io/components/ibeacon.sensor) |
| [ical](https://www.home-assistant.io/components/ical) |
| [ical.calendar](https://www.home-assistant.io/components/ical.calendar) |
| [ical.sensor](https://www.home-assistant.io/components/ical.sensor) |
| [icloud3](https://www.home-assistant.io/components/icloud3) |
| [icloud3.device_tracker](https://www.home-assistant.io/components/icloud3.device_tracker) |
| [icloud3.sensor](https://www.home-assistant.io/components/icloud3.sensor) |
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
| [iss](https://www.home-assistant.io/components/iss) |
| [iss.sensor](https://www.home-assistant.io/components/iss.sensor) |
| [lastfm](https://www.home-assistant.io/components/lastfm) |
| [lastfm.sensor](https://www.home-assistant.io/components/lastfm.sensor) |
| [lawn_mower](https://www.home-assistant.io/components/lawn_mower) |
| [light](https://www.home-assistant.io/components/light) |
| [local_calendar](https://www.home-assistant.io/components/local_calendar) |
| [local_calendar.calendar](https://www.home-assistant.io/components/local_calendar.calendar) |
| [local_ip](https://www.home-assistant.io/components/local_ip) |
| [local_ip.sensor](https://www.home-assistant.io/components/local_ip.sensor) |
| [localtuya](https://www.home-assistant.io/components/localtuya) |
| [localtuya.sensor](https://www.home-assistant.io/components/localtuya.sensor) |
| [lock](https://www.home-assistant.io/components/lock) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [lovelace_gen](https://www.home-assistant.io/components/lovelace_gen) |
| [map](https://www.home-assistant.io/components/map) |
| [mastodon_profile_stats](https://www.home-assistant.io/components/mastodon_profile_stats) |
| [mastodon_profile_stats.sensor](https://www.home-assistant.io/components/mastodon_profile_stats.sensor) |
| [matter](https://www.home-assistant.io/components/matter) |
| [matter.binary_sensor](https://www.home-assistant.io/components/matter.binary_sensor) |
| [matter.climate](https://www.home-assistant.io/components/matter.climate) |
| [matter.cover](https://www.home-assistant.io/components/matter.cover) |
| [matter.event](https://www.home-assistant.io/components/matter.event) |
| [matter.light](https://www.home-assistant.io/components/matter.light) |
| [matter.lock](https://www.home-assistant.io/components/matter.lock) |
| [matter.sensor](https://www.home-assistant.io/components/matter.sensor) |
| [matter.switch](https://www.home-assistant.io/components/matter.switch) |
| [media_extractor](https://www.home-assistant.io/components/media_extractor) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_source](https://www.home-assistant.io/components/media_source) |
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
| [mqtt.alarm_control_panel](https://www.home-assistant.io/components/mqtt.alarm_control_panel) |
| [mqtt.binary_sensor](https://www.home-assistant.io/components/mqtt.binary_sensor) |
| [mqtt.button](https://www.home-assistant.io/components/mqtt.button) |
| [mqtt.camera](https://www.home-assistant.io/components/mqtt.camera) |
| [mqtt.climate](https://www.home-assistant.io/components/mqtt.climate) |
| [mqtt.cover](https://www.home-assistant.io/components/mqtt.cover) |
| [mqtt.device_tracker](https://www.home-assistant.io/components/mqtt.device_tracker) |
| [mqtt.event](https://www.home-assistant.io/components/mqtt.event) |
| [mqtt.fan](https://www.home-assistant.io/components/mqtt.fan) |
| [mqtt.humidifier](https://www.home-assistant.io/components/mqtt.humidifier) |
| [mqtt.image](https://www.home-assistant.io/components/mqtt.image) |
| [mqtt.lawn_mower](https://www.home-assistant.io/components/mqtt.lawn_mower) |
| [mqtt.light](https://www.home-assistant.io/components/mqtt.light) |
| [mqtt.lock](https://www.home-assistant.io/components/mqtt.lock) |
| [mqtt.number](https://www.home-assistant.io/components/mqtt.number) |
| [mqtt.scene](https://www.home-assistant.io/components/mqtt.scene) |
| [mqtt.select](https://www.home-assistant.io/components/mqtt.select) |
| [mqtt.sensor](https://www.home-assistant.io/components/mqtt.sensor) |
| [mqtt.siren](https://www.home-assistant.io/components/mqtt.siren) |
| [mqtt.switch](https://www.home-assistant.io/components/mqtt.switch) |
| [mqtt.text](https://www.home-assistant.io/components/mqtt.text) |
| [mqtt.update](https://www.home-assistant.io/components/mqtt.update) |
| [mqtt.vacuum](https://www.home-assistant.io/components/mqtt.vacuum) |
| [mqtt.valve](https://www.home-assistant.io/components/mqtt.valve) |
| [mqtt.water_heater](https://www.home-assistant.io/components/mqtt.water_heater) |
| [multiscrape](https://www.home-assistant.io/components/multiscrape) |
| [multiscrape.sensor](https://www.home-assistant.io/components/multiscrape.sensor) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [myjdownloader.binary_sensor](https://www.home-assistant.io/components/myjdownloader.binary_sensor) |
| [myjdownloader.sensor](https://www.home-assistant.io/components/myjdownloader.sensor) |
| [myjdownloader.switch](https://www.home-assistant.io/components/myjdownloader.switch) |
| [myjdownloader.update](https://www.home-assistant.io/components/myjdownloader.update) |
| [network](https://www.home-assistant.io/components/network) |
| [network_scanner](https://www.home-assistant.io/components/network_scanner) |
| [network_scanner.sensor](https://www.home-assistant.io/components/network_scanner.sensor) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [nodered.sensor](https://www.home-assistant.io/components/nodered.sensor) |
| [notify](https://www.home-assistant.io/components/notify) |
| [nsw_air_quality.sensor](https://www.home-assistant.io/components/nsw_air_quality.sensor) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_fuel_station.sensor](https://www.home-assistant.io/components/nsw_fuel_station.sensor) |
| [nsw_rural_fire_service_feed.geo_location](https://www.home-assistant.io/components/nsw_rural_fire_service_feed.geo_location) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [number](https://www.home-assistant.io/components/number) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
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
| [pirateweather](https://www.home-assistant.io/components/pirateweather) |
| [pirateweather.sensor](https://www.home-assistant.io/components/pirateweather.sensor) |
| [pirateweather.weather](https://www.home-assistant.io/components/pirateweather.weather) |
| [plex](https://www.home-assistant.io/components/plex) |
| [plex.button](https://www.home-assistant.io/components/plex.button) |
| [plex.media_player](https://www.home-assistant.io/components/plex.media_player) |
| [plex.sensor](https://www.home-assistant.io/components/plex.sensor) |
| [plex.update](https://www.home-assistant.io/components/plex.update) |
| [plex_recently_added.sensor](https://www.home-assistant.io/components/plex_recently_added.sensor) |
| [powercalc](https://www.home-assistant.io/components/powercalc) |
| [powercalc.sensor](https://www.home-assistant.io/components/powercalc.sensor) |
| [private_ble_device](https://www.home-assistant.io/components/private_ble_device) |
| [private_ble_device.device_tracker](https://www.home-assistant.io/components/private_ble_device.device_tracker) |
| [private_ble_device.sensor](https://www.home-assistant.io/components/private_ble_device.sensor) |
| [profiler](https://www.home-assistant.io/components/profiler) |
| [prometheus_query.sensor](https://www.home-assistant.io/components/prometheus_query.sensor) |
| [proximity](https://www.home-assistant.io/components/proximity) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [proxmoxve.binary_sensor](https://www.home-assistant.io/components/proxmoxve.binary_sensor) |
| [proxmoxve.button](https://www.home-assistant.io/components/proxmoxve.button) |
| [proxmoxve.sensor](https://www.home-assistant.io/components/proxmoxve.sensor) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [qbittorrent](https://www.home-assistant.io/components/qbittorrent) |
| [qbittorrent.sensor](https://www.home-assistant.io/components/qbittorrent.sensor) |
| [qbittorrent_alt](https://www.home-assistant.io/components/qbittorrent_alt) |
| [qbittorrent_alt.button](https://www.home-assistant.io/components/qbittorrent_alt.button) |
| [qbittorrent_alt.number](https://www.home-assistant.io/components/qbittorrent_alt.number) |
| [qbittorrent_alt.sensor](https://www.home-assistant.io/components/qbittorrent_alt.sensor) |
| [qbittorrent_alt.switch](https://www.home-assistant.io/components/qbittorrent_alt.switch) |
| [radarr](https://www.home-assistant.io/components/radarr) |
| [radarr.binary_sensor](https://www.home-assistant.io/components/radarr.binary_sensor) |
| [radarr.calendar](https://www.home-assistant.io/components/radarr.calendar) |
| [radarr.sensor](https://www.home-assistant.io/components/radarr.sensor) |
| [radarr_upcoming_media.sensor](https://www.home-assistant.io/components/radarr_upcoming_media.sensor) |
| [radio_browser](https://www.home-assistant.io/components/radio_browser) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [repairs](https://www.home-assistant.io/components/repairs) |
| [rest](https://www.home-assistant.io/components/rest) |
| [rest.sensor](https://www.home-assistant.io/components/rest.sensor) |
| [rocketlaunchlive](https://www.home-assistant.io/components/rocketlaunchlive) |
| [rocketlaunchlive.sensor](https://www.home-assistant.io/components/rocketlaunchlive.sensor) |
| [sabnzbd](https://www.home-assistant.io/components/sabnzbd) |
| [sabnzbd.sensor](https://www.home-assistant.io/components/sabnzbd.sensor) |
| [samsungtv](https://www.home-assistant.io/components/samsungtv) |
| [samsungtv.media_player](https://www.home-assistant.io/components/samsungtv.media_player) |
| [samsungtv.remote](https://www.home-assistant.io/components/samsungtv.remote) |
| [samsungtv_smart](https://www.home-assistant.io/components/samsungtv_smart) |
| [samsungtv_smart.media_player](https://www.home-assistant.io/components/samsungtv_smart.media_player) |
| [samsungtv_smart.remote](https://www.home-assistant.io/components/samsungtv_smart.remote) |
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
| [solcast_solar.sensor](https://www.home-assistant.io/components/solcast_solar.sensor) |
| [sonarr](https://www.home-assistant.io/components/sonarr) |
| [sonarr.sensor](https://www.home-assistant.io/components/sonarr.sensor) |
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
| [sql](https://www.home-assistant.io/components/sql) |
| [sql.sensor](https://www.home-assistant.io/components/sql.sensor) |
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
| [systemmonitor.sensor](https://www.home-assistant.io/components/systemmonitor.sensor) |
| [tag](https://www.home-assistant.io/components/tag) |
| [tautulli](https://www.home-assistant.io/components/tautulli) |
| [tautulli.sensor](https://www.home-assistant.io/components/tautulli.sensor) |
| [teamtracker](https://www.home-assistant.io/components/teamtracker) |
| [teamtracker.sensor](https://www.home-assistant.io/components/teamtracker.sensor) |
| [temperature_feels_like.sensor](https://www.home-assistant.io/components/temperature_feels_like.sensor) |
| [template](https://www.home-assistant.io/components/template) |
| [template.binary_sensor](https://www.home-assistant.io/components/template.binary_sensor) |
| [template.sensor](https://www.home-assistant.io/components/template.sensor) |
| [template.switch](https://www.home-assistant.io/components/template.switch) |
| [template.weather](https://www.home-assistant.io/components/template.weather) |
| [text](https://www.home-assistant.io/components/text) |
| [thermal_comfort](https://www.home-assistant.io/components/thermal_comfort) |
| [thread](https://www.home-assistant.io/components/thread) |
| [time](https://www.home-assistant.io/components/time) |
| [time_date.sensor](https://www.home-assistant.io/components/time_date.sensor) |
| [timer](https://www.home-assistant.io/components/timer) |
| [tod.binary_sensor](https://www.home-assistant.io/components/tod.binary_sensor) |
| [tomorrowio](https://www.home-assistant.io/components/tomorrowio) |
| [tomorrowio.weather](https://www.home-assistant.io/components/tomorrowio.weather) |
| [trace](https://www.home-assistant.io/components/trace) |
| [trakt_tv](https://www.home-assistant.io/components/trakt_tv) |
| [transport_nsw.sensor](https://www.home-assistant.io/components/transport_nsw.sensor) |
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
| [unifi_status.switch](https://www.home-assistant.io/components/unifi_status.switch) |
| [unifics](https://www.home-assistant.io/components/unifics) |
| [unifics.sensor](https://www.home-assistant.io/components/unifics.sensor) |
| [unifigateway.sensor](https://www.home-assistant.io/components/unifigateway.sensor) |
| [universal.media_player](https://www.home-assistant.io/components/universal.media_player) |
| [untappd.sensor](https://www.home-assistant.io/components/untappd.sensor) |
| [update](https://www.home-assistant.io/components/update) |
| [uptime](https://www.home-assistant.io/components/uptime) |
| [uptime.sensor](https://www.home-assistant.io/components/uptime.sensor) |
| [uptime_kuma](https://www.home-assistant.io/components/uptime_kuma) |
| [uptime_kuma.binary_sensor](https://www.home-assistant.io/components/uptime_kuma.binary_sensor) |
| [uptime_kuma.sensor](https://www.home-assistant.io/components/uptime_kuma.sensor) |
| [usb](https://www.home-assistant.io/components/usb) |
| [utility_meter](https://www.home-assistant.io/components/utility_meter) |
| [utility_meter.sensor](https://www.home-assistant.io/components/utility_meter.sensor) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [valve](https://www.home-assistant.io/components/valve) |
| [version](https://www.home-assistant.io/components/version) |
| [version.binary_sensor](https://www.home-assistant.io/components/version.binary_sensor) |
| [version.sensor](https://www.home-assistant.io/components/version.sensor) |
| [visualcrossing](https://www.home-assistant.io/components/visualcrossing) |
| [visualcrossing.weather](https://www.home-assistant.io/components/visualcrossing.weather) |
| [wake_on_lan](https://www.home-assistant.io/components/wake_on_lan) |
| [wake_word](https://www.home-assistant.io/components/wake_word) |
| [waqi](https://www.home-assistant.io/components/waqi) |
| [waqi.sensor](https://www.home-assistant.io/components/waqi.sensor) |
| [waste_collection_schedule](https://www.home-assistant.io/components/waste_collection_schedule) |
| [waste_collection_schedule.calendar](https://www.home-assistant.io/components/waste_collection_schedule.calendar) |
| [waste_collection_schedule.sensor](https://www.home-assistant.io/components/waste_collection_schedule.sensor) |
| [watchman](https://www.home-assistant.io/components/watchman) |
| [watchman.sensor](https://www.home-assistant.io/components/watchman.sensor) |
| [water_heater](https://www.home-assistant.io/components/water_heater) |
| [waternsw.sensor](https://www.home-assistant.io/components/waternsw.sensor) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weatherbit](https://www.home-assistant.io/components/weatherbit) |
| [weatherbit.weather](https://www.home-assistant.io/components/weatherbit.weather) |
| [weatherflow](https://www.home-assistant.io/components/weatherflow) |
| [weatherflow.sensor](https://www.home-assistant.io/components/weatherflow.sensor) |
| [weatherflow_cloud](https://www.home-assistant.io/components/weatherflow_cloud) |
| [weatherflow_cloud.binary_sensor](https://www.home-assistant.io/components/weatherflow_cloud.binary_sensor) |
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
| [workday](https://www.home-assistant.io/components/workday) |
| [workday.binary_sensor](https://www.home-assistant.io/components/workday.binary_sensor) |
| [worldclock.sensor](https://www.home-assistant.io/components/worldclock.sensor) |
| [worlds_air_quality_index](https://www.home-assistant.io/components/worlds_air_quality_index) |
| [worlds_air_quality_index.sensor](https://www.home-assistant.io/components/worlds_air_quality_index.sensor) |
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
| [zone](https://www.home-assistant.io/components/zone) |
</details>

### Custom Components Used

<details>
<summary>Expand Custom Components List</summary>

### Integrations
- [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting)
- [Anniversaries](https://github.com/pinkywafer/Anniversaries)
- [Astroweather](https://github.com/mawinkler/astroweather)
- [Auto Backup](https://github.com/jcwillox/hass-auto-backup)
- [Average Sensor](https://github.com/Limych/ha-average)
- [Blitzortung.Org Lightning Detector](https://github.com/mrk-its/homeassistant-blitzortung)
- [Browser Mod](https://github.com/thomasloven/hass-browser_mod)
- [Bureau Of Meteorology](https://github.com/bremor/bureau_of_meteorology)
- [Climacell Weather Provider](https://github.com/r-renato/ha-climacell-weather)
- [Cloudflare Tunnel Monitor](https://github.com/deadbeef3137/ha-cloudflare-tunnel-monitor)
- [Composite Device Tracker](https://github.com/pnbruckner/ha-composite-tracker)
- [Cupertino Icons](https://github.com/menahishayan/HomeAssistant-Cupertino-Icons)
- [Custom Templates](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Custom-Templates)
- [Daily Schedule](https://github.com/amitfin/daily_schedule)
- [Daily Sensor](https://github.com/jeroenterheerdt/HADailySensor)
- [Dyson](https://github.com/libdyson-wg/ha-dyson)
- [Eufy Security](https://github.com/fuatakgun/eufy_security)
- [Feedparser](https://github.com/custom-components/feedparser)
- [Flightradar24](https://github.com/AlexandrErohin/home-assistant-flightradar24)
- [Fontawesome](https://github.com/thomasloven/hass-fontawesome)
- [Generate Readme](https://github.com/custom-components/readme)
- [Google Fit](https://github.com/YorkshireIoT/ha-google-fit)
- [Gtfs Realtime](https://github.com/mark1foley/ha-gtfs-rt-v2)
- [Gtfs2 For Homeassistant](https://github.com/vingerha/gtfs2)
- [HACS](https://github.com/hacs/integration)
- [Hdhomerun](https://github.com/uvjim/hass_hdhomerun)
- [Holidays](https://github.com/bruxy70/Holidays)
- [Home Assistant Dewpoint](https://github.com/miguelangel-nubla/home-assistant-dewpoint)
- [Ical Sensor](https://github.com/tybritten/ical-sensor-homeassistant)
- [Icloud3](https://github.com/gcobb321/icloud3)
- [Icloud3 V3, Development Version](https://github.com/gcobb321/icloud3_v3)
- [Illuminance](https://github.com/pnbruckner/ha-illuminance)
- [Indoor Air Quality Uk Index](https://github.com/Limych/ha-iaquk)
- [Iphone Device Tracker](https://github.com/mudape/iphonedetect)
- [Jellyfin](https://github.com/koying/jellyfin_ha)
- [Jokes](https://github.com/LaggAt/ha-jokes)
- [Local Tuya](https://github.com/rospogrigio/localtuya)
- [Lovelace Gen](https://github.com/thomasloven/hass-lovelace_gen)
- [Mastodon Profile Stats](https://github.com/andrew-codechimp/HA-Mastodon-Profile-Stats)
- [Measureit](https://github.com/danieldotnl/ha-measureit)
- [Monitor Docker](https://github.com/ualex73/monitor_docker)
- [Multiscrape](https://github.com/danieldotnl/ha-multiscrape)
- [Myjdownloader](https://github.com/doudz/homeassistant-myjdownloader)
- [Network Scanner](https://github.com/parvez/network_scanner)
- [Node Red Companion](https://github.com/zachowj/hass-node-red)
- [Nsw Rural Fire Service   Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger)
- [Opennem (Au) Data](https://github.com/bacco007/sensor.opennem)
- [Passive Ble Monitor Integration](https://github.com/custom-components/ble_monitor)
- [Pirate Weather](https://github.com/Pirate-Weather/pirate-weather-ha)
- [Portainer](https://github.com/tomaae/homeassistant-portainer)
- [Powercalc](https://github.com/bramstroker/homeassistant-powercalc)
- [Proxmox Ve](https://github.com/dougiteixeira/proxmoxve)
- [Pyscript](https://github.com/custom-components/pyscript)
- [Qbittorrent Alt](https://github.com/chris-mc1/qBittorrent-hass)
- [Rocket Launch Live   Next 5 Launches](https://github.com/djtimca/harocketlaunchlive)
- [Samsungtv Smart](https://github.com/ollo69/ha-samsungtv-smart)
- [Satellite Tracker (N2Yo)](https://github.com/djtimca/hasatellitetracker)
- [Sensor.Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Sensor.Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Sensor.Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [Sensor.Unifigateway](https://github.com/custom-components/sensor.unifigateway)
- [Simpleicons](https://github.com/vigonotion/hass-simpleicons)
- [Smartthinq Lge Sensors](https://github.com/ollo69/ha-smartthinq-sensors)
- [Solcast Pv Solar](https://github.com/oziee/ha-solcast-solar)
- [Spook 👻 Not Your Homie](https://github.com/frenck/spook)
- [Spotcast](https://github.com/fondberg/spotcast)
- [Start Time](https://github.com/AlexxIT/StartTime)
- [Sun2](https://github.com/pnbruckner/ha-sun2)
- [Team Tracker](https://github.com/vasqued2/ha-teamtracker)
- [Temperature Feels Like](https://github.com/Limych/ha-temperature-feels-like)
- [Thermal Comfort](https://github.com/dolezsa/thermal_comfort)
- [Trakt](https://github.com/dylandoamaral/trakt-integration)
- [Tuya Local](https://github.com/make-all/tuya-local)
- [Unifi Counter Sensor](https://github.com/clyra/unifics)
- [Unifi Status](https://github.com/zvldz/unifi_status)
- [Uptime Kuma](https://github.com/meichthys/uptime_kuma)
- [Variables+History](https://github.com/enkama/hass-variables)
- [Visual Crossing Weather Integration](https://github.com/briis/visualcrossing)
- [Waste Collection Schedule](https://github.com/mampfes/hacs_waste_collection_schedule)
- [Watchman](https://github.com/dummylabs/thewatchman)
- [Waternsw Real Time Data](https://github.com/bacco007/sensor.waternsw)
- [Weatherbit Weather Forecast For Home Assistant](https://github.com/briis/weatherbit)
- [Weatherflow Forecast And Sensor Integration](https://github.com/briis/weatherflow_forecast)
- [Weatherflow Integration](https://github.com/briis/hass-weatherflow)
- [World'S Air Quality Index](https://github.com/pawkakol1/worlds-air-quality-index)
- [Yahoo Finance](https://github.com/iprak/yahoofinance)

### Lovelace
- [Apexcharts Card](https://github.com/RomRider/apexcharts-card)
- [Atomic Calendar Revive](https://github.com/totaldebug/atomic-calendar-revive)
- [Auto Entities](https://github.com/thomasloven/lovelace-auto-entities)
- [Bar Card](https://github.com/custom-cards/bar-card)
- [Battery State Card / Entity Row](https://github.com/maxwroc/battery-state-card)
- [Bom Radar Card](https://github.com/Makin-Things/bom-radar-card)
- [Bubble Card](https://github.com/Clooos/Bubble-Card)
- [Button Card](https://github.com/custom-cards/button-card)
- [Card Mod](https://github.com/thomasloven/lovelace-card-mod)
- [Card Tools](https://github.com/thomasloven/lovelace-card-tools)
- [Clock Weather Card](https://github.com/pkissling/clock-weather-card)
- [Collapsable Cards](https://github.com/RossMcMillan92/lovelace-collapsable-cards)
- [Compass Card](https://github.com/tomvanswam/compass-card)
- [Config Template Card](https://github.com/iantrich/config-template-card)
- [Custom Brand Icons](https://github.com/elax46/custom-brand-icons)
- [Decluttering Card](https://github.com/custom-cards/decluttering-card)
- [Easy Layout Card](https://github.com/kamtschatka/lovelace-easy-layout-card)
- [Expander Card](https://github.com/Alia5/lovelace-expander-card)
- [Firemote Card](https://github.com/PRProd/HA-Firemote)
- [Flex Table   Highly Customizable, Data Visualization](https://github.com/custom-cards/flex-table-card)
- [Fold Entity Row](https://github.com/thomasloven/lovelace-fold-entity-row)
- [Formula One Card](https://github.com/marcokreeft87/formulaone-card)
- [Fr24 Card](https://github.com/fratsloos/fr24_card)
- [Hatc Gauge Card](https://github.com/tagcashdev/hatc-gauge-card)
- [Heatmap Card](https://github.com/kandsten/ha-heatmap-card)
- [History Explorer Card](https://github.com/alexarch21/history-explorer-card)
- [Horizon Card](https://github.com/rejuvenate/lovelace-horizon-card)
- [Hourly Weather Card](https://github.com/decompil3d/lovelace-hourly-weather)
- [Html Jinja2 Template Card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-HTML-Jinja2-Template-card)
- [Hui Element](https://github.com/thomasloven/lovelace-hui-element)
- [Layout Card](https://github.com/thomasloven/lovelace-layout-card)
- [List Card](https://github.com/iantrich/list-card)
- [Lovelace Card Templater](https://github.com/gadgetchnnel/lovelace-card-templater)
- [Material Symbols](https://github.com/beecho01/material-symbols)
- [Mini Graph Card](https://github.com/kalkih/mini-graph-card)
- [Mini Media Player](https://github.com/kalkih/mini-media-player)
- [Multiple Entity Row](https://github.com/benct/lovelace-multiple-entity-row)
- [Mushroom](https://github.com/piitaya/lovelace-mushroom)
- [Number Box](https://github.com/htmltiger/numberbox-card)
- [Paper Buttons Row](https://github.com/jcwillox/lovelace-paper-buttons-row)
- [Platinum Weather Card](https://github.com/Makin-Things/platinum-weather-card)
- [Plotly Graph Card](https://github.com/dbuezas/lovelace-plotly-graph-card)
- [Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus)
- [Sankey Chart Card](https://github.com/MindFreeze/ha-sankey-chart)
- [Search Card](https://github.com/postlund/search-card)
- [Secondaryinfo Entity Row](https://github.com/custom-cards/secondaryinfo-entity-row)
- [Service Call Tile Feature For Home Assistant Tile Card](https://github.com/Nerwyn/service-call-tile-feature)
- [Simple Thermostat](https://github.com/nervetattoo/simple-thermostat)
- [Sonos Card](https://github.com/johanfrick/custom-sonos-card)
- [Spotify Lovelace Card](https://github.com/custom-cards/spotify-card)
- [Stack In Card](https://github.com/custom-cards/stack-in-card)
- [State Switch](https://github.com/thomasloven/lovelace-state-switch)
- [Swipe Card](https://github.com/bramkragten/swipe-card)
- [Swiss Army Knife Custom Card](https://github.com/AmoebeLabs/swiss-army-knife-card)
- [Tabbed Card](https://github.com/kinghat/tabbed-card)
- [Team Tracker Card](https://github.com/vasqued2/ha-teamtracker-card)
- [Template Entity Row](https://github.com/thomasloven/lovelace-template-entity-row)
- [Tv Remote Card (With Touchpad And Haptic Feedback)](https://github.com/usernein/tv-card)
- [Uptime Card](https://github.com/dylandoamaral/uptime-card)
- [Vertical Stack In Card](https://github.com/ofekashery/vertical-stack-in-card)
- [Weather Card](https://github.com/bramkragten/weather-card)
- [Weather Radar Card](https://github.com/Makin-Things/weather-radar-card)
- [Windrose Card](https://github.com/aukedejong/lovelace-windrose-card)
- [Zigbee2Mqtt Networkmap Card](https://github.com/azuwis/zigbee2mqtt-networkmap)

### Themes
- [Animated Weather Card](https://github.com/wowgamr/animated-weather-card)
- [Bubble](https://github.com/Clooos/Bubble)
- [Material Rounded Theme   Based On Material You By Google On Android](https://github.com/Nerwyn/material-rounded-theme)
- [Metrology   Metro + Fluent + Windows Themes   By Mmak.Es](https://github.com/Madelena/Metrology-for-Hass)
- [Noctis](https://github.com/aFFekopp/noctis)
- [Noctis Grey](https://github.com/chaptergy/noctis-grey)
- [Nordic Theme](https://github.com/coltondick/nordic-theme-main)
</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Screenshots

![Screenshot - Home](./.assets/home.png?raw=True)
![Screenshot - Devices](./.assets/devices.png?raw=True)
![Screenshot - Home Assistant](./.assets/homeassistant.png?raw=True)
![Screenshot - Sports](./.assets/sports.png?raw=True)
![Screenshot - Solar](./.assets/solar.png?raw=True)
![Screenshot - Untappd](./.assets/untappd.png?raw=True)
![Screenshot - Weather](./.assets/weather.png?raw=True)

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## HA Supervisor

### Addons

Here are the addons I use inside Home Assistant, some of the other things I run can be done inside Home Assistant, but I've elected not to do so.
- Advanced SSH & Web Terminal (17.0.0)
- Bluetooth Presence Monitor (1.0.0)
- Cloudflared (4.2.12)
- ESPHome (2023.12.5)
- eufy-security-ws (1.7.1)
- File editor (5.7.0)
- Glances (0.20.0)
- GoSungrow (3.0.7)
- Home Assistant Google Drive Backup (0.112.1)
- Home Assistant Stream Deck (2023.11.0)
- JupyterLab (0.12.1)
- MariaDB (2.6.1)
- Matter Server (5.0.1)
- Mosquitto broker (6.4.0)
- Node-RED (16.0.2)
- OpenThread Border Router (2.4.1)
- phpMyAdmin (0.9.0)
- Samba share (12.2.0)
- Silicon Labs Multiprotocol (2.3.2)
- SunGather (0.1.3)
- Zigbee2MQTT Edge (edge)
- ZigStar Silicon Labs FW Flasher (0.1.1)
- ZigStar TI CC2652P/P7 FW Flasher (0.4.0)

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Licence

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to [https://unlicense.org](https://unlicense.org)

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

Generated by the [custom readme integration](https://github.com/custom-components/readme)

[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg
[buymeacoffee]: https://www.buymeacoffee.com/bacco007