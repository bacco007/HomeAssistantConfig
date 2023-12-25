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

_Stats as at 05:00, Tuesday, December 26th 2023_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 2023.12.3 | 586     | 5226         | 3398 | 136 |

Type | Qty
-- | --
Alarm Control Panel | 2
Alert | 35
Automation | 136
Binary Sensor | 343
Camera | 5
Device Tracker | 89
Group | 43
Input Boolean | 23
Input Datetime | 0
Input Text | 3
Light | 14
Media Player | 17
Person | 4
Scene | 2
Script | 13
Sensor | 3398
Sun | 1
Switch | 308
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
| [adaptive_lighting](https://www.home-assistant.io/components/adaptive_lighting) |
| [adguard](https://www.home-assistant.io/components/adguard) |
| [airvisual](https://www.home-assistant.io/components/airvisual) |
| [airvisual_pro](https://www.home-assistant.io/components/airvisual_pro) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alarm_control_panel.eufy_security](https://www.home-assistant.io/components/alarm_control_panel.eufy_security) |
| [alarm_control_panel.mqtt](https://www.home-assistant.io/components/alarm_control_panel.mqtt) |
| [alarm_control_panel.tuya](https://www.home-assistant.io/components/alarm_control_panel.tuya) |
| [alarm_control_panel.zha](https://www.home-assistant.io/components/alarm_control_panel.zha) |
| [alert](https://www.home-assistant.io/components/alert) |
| [analytics](https://www.home-assistant.io/components/analytics) |
| [anniversaries](https://www.home-assistant.io/components/anniversaries) |
| [api](https://www.home-assistant.io/components/api) |
| [apple_tv](https://www.home-assistant.io/components/apple_tv) |
| [application_credentials](https://www.home-assistant.io/components/application_credentials) |
| [assist_pipeline](https://www.home-assistant.io/components/assist_pipeline) |
| [astroweather](https://www.home-assistant.io/components/astroweather) |
| [auth](https://www.home-assistant.io/components/auth) |
| [auto_backup](https://www.home-assistant.io/components/auto_backup) |
| [automation](https://www.home-assistant.io/components/automation) |
| [average](https://www.home-assistant.io/components/average) |
| [binary_sensor](https://www.home-assistant.io/components/binary_sensor) |
| [binary_sensor.astroweather](https://www.home-assistant.io/components/binary_sensor.astroweather) |
| [binary_sensor.bayesian](https://www.home-assistant.io/components/binary_sensor.bayesian) |
| [binary_sensor.ble_monitor](https://www.home-assistant.io/components/binary_sensor.ble_monitor) |
| [binary_sensor.browser_mod](https://www.home-assistant.io/components/binary_sensor.browser_mod) |
| [binary_sensor.cloud](https://www.home-assistant.io/components/binary_sensor.cloud) |
| [binary_sensor.command_line](https://www.home-assistant.io/components/binary_sensor.command_line) |
| [binary_sensor.dyson_local](https://www.home-assistant.io/components/binary_sensor.dyson_local) |
| [binary_sensor.eufy_security](https://www.home-assistant.io/components/binary_sensor.eufy_security) |
| [binary_sensor.hassio](https://www.home-assistant.io/components/binary_sensor.hassio) |
| [binary_sensor.hdhomerun](https://www.home-assistant.io/components/binary_sensor.hdhomerun) |
| [binary_sensor.matter](https://www.home-assistant.io/components/binary_sensor.matter) |
| [binary_sensor.mobile_app](https://www.home-assistant.io/components/binary_sensor.mobile_app) |
| [binary_sensor.mqtt](https://www.home-assistant.io/components/binary_sensor.mqtt) |
| [binary_sensor.myjdownloader](https://www.home-assistant.io/components/binary_sensor.myjdownloader) |
| [binary_sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/binary_sensor.nsw_rural_fire_service_fire_danger) |
| [binary_sensor.openuv](https://www.home-assistant.io/components/binary_sensor.openuv) |
| [binary_sensor.ping](https://www.home-assistant.io/components/binary_sensor.ping) |
| [binary_sensor.proxmoxve](https://www.home-assistant.io/components/binary_sensor.proxmoxve) |
| [binary_sensor.radarr](https://www.home-assistant.io/components/binary_sensor.radarr) |
| [binary_sensor.satellitetracker](https://www.home-assistant.io/components/binary_sensor.satellitetracker) |
| [binary_sensor.sensibo](https://www.home-assistant.io/components/binary_sensor.sensibo) |
| [binary_sensor.smartthinq_sensors](https://www.home-assistant.io/components/binary_sensor.smartthinq_sensors) |
| [binary_sensor.sonos](https://www.home-assistant.io/components/binary_sensor.sonos) |
| [binary_sensor.spook](https://www.home-assistant.io/components/binary_sensor.spook) |
| [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2) |
| [binary_sensor.synology_dsm](https://www.home-assistant.io/components/binary_sensor.synology_dsm) |
| [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template) |
| [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod) |
| [binary_sensor.trend](https://www.home-assistant.io/components/binary_sensor.trend) |
| [binary_sensor.tuya](https://www.home-assistant.io/components/binary_sensor.tuya) |
| [binary_sensor.uptime_kuma](https://www.home-assistant.io/components/binary_sensor.uptime_kuma) |
| [binary_sensor.version](https://www.home-assistant.io/components/binary_sensor.version) |
| [binary_sensor.weatherflow_cloud](https://www.home-assistant.io/components/binary_sensor.weatherflow_cloud) |
| [binary_sensor.weatherflow_forecast](https://www.home-assistant.io/components/binary_sensor.weatherflow_forecast) |
| [binary_sensor.workday](https://www.home-assistant.io/components/binary_sensor.workday) |
| [binary_sensor.zha](https://www.home-assistant.io/components/binary_sensor.zha) |
| [ble_monitor](https://www.home-assistant.io/components/ble_monitor) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [bluetooth](https://www.home-assistant.io/components/bluetooth) |
| [bluetooth_adapters](https://www.home-assistant.io/components/bluetooth_adapters) |
| [browser_mod](https://www.home-assistant.io/components/browser_mod) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [button](https://www.home-assistant.io/components/button) |
| [button.dyson_local](https://www.home-assistant.io/components/button.dyson_local) |
| [button.esphome](https://www.home-assistant.io/components/button.esphome) |
| [button.eufy_security](https://www.home-assistant.io/components/button.eufy_security) |
| [button.hdhomerun](https://www.home-assistant.io/components/button.hdhomerun) |
| [button.monitor_docker](https://www.home-assistant.io/components/button.monitor_docker) |
| [button.mqtt](https://www.home-assistant.io/components/button.mqtt) |
| [button.plex](https://www.home-assistant.io/components/button.plex) |
| [button.proxmoxve](https://www.home-assistant.io/components/button.proxmoxve) |
| [button.qbittorrent_alt](https://www.home-assistant.io/components/button.qbittorrent_alt) |
| [button.sensibo](https://www.home-assistant.io/components/button.sensibo) |
| [button.smartthinq_sensors](https://www.home-assistant.io/components/button.smartthinq_sensors) |
| [button.spook](https://www.home-assistant.io/components/button.spook) |
| [button.synology_dsm](https://www.home-assistant.io/components/button.synology_dsm) |
| [button.tuya](https://www.home-assistant.io/components/button.tuya) |
| [button.unifi](https://www.home-assistant.io/components/button.unifi) |
| [button.zha](https://www.home-assistant.io/components/button.zha) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [calendar.anniversaries](https://www.home-assistant.io/components/calendar.anniversaries) |
| [calendar.garbage_collection](https://www.home-assistant.io/components/calendar.garbage_collection) |
| [calendar.google](https://www.home-assistant.io/components/calendar.google) |
| [calendar.holidays](https://www.home-assistant.io/components/calendar.holidays) |
| [calendar.ical](https://www.home-assistant.io/components/calendar.ical) |
| [calendar.local_calendar](https://www.home-assistant.io/components/calendar.local_calendar) |
| [calendar.waste_collection_schedule](https://www.home-assistant.io/components/calendar.waste_collection_schedule) |
| [camera](https://www.home-assistant.io/components/camera) |
| [camera.browser_mod](https://www.home-assistant.io/components/camera.browser_mod) |
| [camera.eufy_security](https://www.home-assistant.io/components/camera.eufy_security) |
| [camera.mqtt](https://www.home-assistant.io/components/camera.mqtt) |
| [camera.synology_dsm](https://www.home-assistant.io/components/camera.synology_dsm) |
| [camera.tuya](https://www.home-assistant.io/components/camera.tuya) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [climate](https://www.home-assistant.io/components/climate) |
| [climate.dyson_local](https://www.home-assistant.io/components/climate.dyson_local) |
| [climate.matter](https://www.home-assistant.io/components/climate.matter) |
| [climate.mqtt](https://www.home-assistant.io/components/climate.mqtt) |
| [climate.sensibo](https://www.home-assistant.io/components/climate.sensibo) |
| [climate.smartthinq_sensors](https://www.home-assistant.io/components/climate.smartthinq_sensors) |
| [climate.tuya](https://www.home-assistant.io/components/climate.tuya) |
| [climate.zha](https://www.home-assistant.io/components/climate.zha) |
| [clock_drift](https://www.home-assistant.io/components/clock_drift) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [cloudflare_tunnel_monitor](https://www.home-assistant.io/components/cloudflare_tunnel_monitor) |
| [co2signal](https://www.home-assistant.io/components/co2signal) |
| [color_extractor](https://www.home-assistant.io/components/color_extractor) |
| [command_line](https://www.home-assistant.io/components/command_line) |
| [config](https://www.home-assistant.io/components/config) |
| [conversation](https://www.home-assistant.io/components/conversation) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cover.matter](https://www.home-assistant.io/components/cover.matter) |
| [cover.mqtt](https://www.home-assistant.io/components/cover.mqtt) |
| [cover.tuya](https://www.home-assistant.io/components/cover.tuya) |
| [cover.zha](https://www.home-assistant.io/components/cover.zha) |
| [cupertino](https://www.home-assistant.io/components/cupertino) |
| [custom_templates](https://www.home-assistant.io/components/custom_templates) |
| [daily](https://www.home-assistant.io/components/daily) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [derivative](https://www.home-assistant.io/components/derivative) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [device_tracker.ble_monitor](https://www.home-assistant.io/components/device_tracker.ble_monitor) |
| [device_tracker.bluetooth_le_tracker](https://www.home-assistant.io/components/device_tracker.bluetooth_le_tracker) |
| [device_tracker.ibeacon](https://www.home-assistant.io/components/device_tracker.ibeacon) |
| [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app) |
| [device_tracker.mqtt](https://www.home-assistant.io/components/device_tracker.mqtt) |
| [device_tracker.ping](https://www.home-assistant.io/components/device_tracker.ping) |
| [device_tracker.private_ble_device](https://www.home-assistant.io/components/device_tracker.private_ble_device) |
| [device_tracker.satellitetracker](https://www.home-assistant.io/components/device_tracker.satellitetracker) |
| [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi) |
| [device_tracker.zha](https://www.home-assistant.io/components/device_tracker.zha) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [diagnostics](https://www.home-assistant.io/components/diagnostics) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [energy](https://www.home-assistant.io/components/energy) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [eufy_security](https://www.home-assistant.io/components/eufy_security) |
| [event](https://www.home-assistant.io/components/event) |
| [event.matter](https://www.home-assistant.io/components/event.matter) |
| [event.mqtt](https://www.home-assistant.io/components/event.mqtt) |
| [event.spook](https://www.home-assistant.io/components/event.spook) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fan.dyson_local](https://www.home-assistant.io/components/fan.dyson_local) |
| [fan.mqtt](https://www.home-assistant.io/components/fan.mqtt) |
| [fan.smartthinq_sensors](https://www.home-assistant.io/components/fan.smartthinq_sensors) |
| [fan.tuya](https://www.home-assistant.io/components/fan.tuya) |
| [fan.zha](https://www.home-assistant.io/components/fan.zha) |
| [fastdotcom](https://www.home-assistant.io/components/fastdotcom) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [file_upload](https://www.home-assistant.io/components/file_upload) |
| [flightradar24](https://www.home-assistant.io/components/flightradar24) |
| [fontawesome](https://www.home-assistant.io/components/fontawesome) |
| [forecast_solar](https://www.home-assistant.io/components/forecast_solar) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [geo_location.blitzortung](https://www.home-assistant.io/components/geo_location.blitzortung) |
| [geo_location.gdacs](https://www.home-assistant.io/components/geo_location.gdacs) |
| [geo_location.nsw_rural_fire_service_feed](https://www.home-assistant.io/components/geo_location.nsw_rural_fire_service_feed) |
| [github](https://www.home-assistant.io/components/github) |
| [glances](https://www.home-assistant.io/components/glances) |
| [google](https://www.home-assistant.io/components/google) |
| [google_fit](https://www.home-assistant.io/components/google_fit) |
| [group](https://www.home-assistant.io/components/group) |
| [gtfs2](https://www.home-assistant.io/components/gtfs2) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [hardware](https://www.home-assistant.io/components/hardware) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [hdhomerun](https://www.home-assistant.io/components/hdhomerun) |
| [here_travel_time](https://www.home-assistant.io/components/here_travel_time) |
| [history](https://www.home-assistant.io/components/history) |
| [holidays](https://www.home-assistant.io/components/holidays) |
| [homeassistant](https://www.home-assistant.io/components/homeassistant) |
| [homeassistant_alerts](https://www.home-assistant.io/components/homeassistant_alerts) |
| [homeassistant_hardware](https://www.home-assistant.io/components/homeassistant_hardware) |
| [homeassistant_sky_connect](https://www.home-assistant.io/components/homeassistant_sky_connect) |
| [homekit](https://www.home-assistant.io/components/homekit) |
| [http](https://www.home-assistant.io/components/http) |
| [humidifier](https://www.home-assistant.io/components/humidifier) |
| [humidifier.mqtt](https://www.home-assistant.io/components/humidifier.mqtt) |
| [humidifier.smartthinq_sensors](https://www.home-assistant.io/components/humidifier.smartthinq_sensors) |
| [humidifier.tuya](https://www.home-assistant.io/components/humidifier.tuya) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [ibeacon](https://www.home-assistant.io/components/ibeacon) |
| [ical](https://www.home-assistant.io/components/ical) |
| [illuminance](https://www.home-assistant.io/components/illuminance) |
| [image](https://www.home-assistant.io/components/image) |
| [image.eufy_security](https://www.home-assistant.io/components/image.eufy_security) |
| [image.mqtt](https://www.home-assistant.io/components/image.mqtt) |
| [image.unifi](https://www.home-assistant.io/components/image.unifi) |
| [image_upload](https://www.home-assistant.io/components/image_upload) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_boolean](https://www.home-assistant.io/components/input_boolean) |
| [input_button](https://www.home-assistant.io/components/input_button) |
| [input_datetime](https://www.home-assistant.io/components/input_datetime) |
| [input_number](https://www.home-assistant.io/components/input_number) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [input_text](https://www.home-assistant.io/components/input_text) |
| [integration](https://www.home-assistant.io/components/integration) |
| [ios](https://www.home-assistant.io/components/ios) |
| [iss](https://www.home-assistant.io/components/iss) |
| [lastfm](https://www.home-assistant.io/components/lastfm) |
| [lawn_mower](https://www.home-assistant.io/components/lawn_mower) |
| [lawn_mower.mqtt](https://www.home-assistant.io/components/lawn_mower.mqtt) |
| [light](https://www.home-assistant.io/components/light) |
| [light.browser_mod](https://www.home-assistant.io/components/light.browser_mod) |
| [light.group](https://www.home-assistant.io/components/light.group) |
| [light.matter](https://www.home-assistant.io/components/light.matter) |
| [light.mqtt](https://www.home-assistant.io/components/light.mqtt) |
| [light.smartthinq_sensors](https://www.home-assistant.io/components/light.smartthinq_sensors) |
| [light.tuya](https://www.home-assistant.io/components/light.tuya) |
| [light.zha](https://www.home-assistant.io/components/light.zha) |
| [local_calendar](https://www.home-assistant.io/components/local_calendar) |
| [local_ip](https://www.home-assistant.io/components/local_ip) |
| [localtuya](https://www.home-assistant.io/components/localtuya) |
| [lock](https://www.home-assistant.io/components/lock) |
| [lock.eufy_security](https://www.home-assistant.io/components/lock.eufy_security) |
| [lock.matter](https://www.home-assistant.io/components/lock.matter) |
| [lock.mqtt](https://www.home-assistant.io/components/lock.mqtt) |
| [lock.zha](https://www.home-assistant.io/components/lock.zha) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [lovelace_gen](https://www.home-assistant.io/components/lovelace_gen) |
| [map](https://www.home-assistant.io/components/map) |
| [mastodon_profile_stats](https://www.home-assistant.io/components/mastodon_profile_stats) |
| [matter](https://www.home-assistant.io/components/matter) |
| [media_extractor](https://www.home-assistant.io/components/media_extractor) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv) |
| [media_player.browser_mod](https://www.home-assistant.io/components/media_player.browser_mod) |
| [media_player.cast](https://www.home-assistant.io/components/media_player.cast) |
| [media_player.plex](https://www.home-assistant.io/components/media_player.plex) |
| [media_player.samsungtv](https://www.home-assistant.io/components/media_player.samsungtv) |
| [media_player.samsungtv_smart](https://www.home-assistant.io/components/media_player.samsungtv_smart) |
| [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos) |
| [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify) |
| [media_player.universal](https://www.home-assistant.io/components/media_player.universal) |
| [media_player.webostv](https://www.home-assistant.io/components/media_player.webostv) |
| [media_source](https://www.home-assistant.io/components/media_source) |
| [met](https://www.home-assistant.io/components/met) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [moon](https://www.home-assistant.io/components/moon) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [multiscrape](https://www.home-assistant.io/components/multiscrape) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [network](https://www.home-assistant.io/components/network) |
| [network_scanner](https://www.home-assistant.io/components/network_scanner) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [notify](https://www.home-assistant.io/components/notify) |
| [notify.file](https://www.home-assistant.io/components/notify.file) |
| [notify.group](https://www.home-assistant.io/components/notify.group) |
| [notify.ios](https://www.home-assistant.io/components/notify.ios) |
| [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app) |
| [notify.slack](https://www.home-assistant.io/components/notify.slack) |
| [notify.syslog](https://www.home-assistant.io/components/notify.syslog) |
| [notify.webostv](https://www.home-assistant.io/components/notify.webostv) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [number](https://www.home-assistant.io/components/number) |
| [number.eufy_security](https://www.home-assistant.io/components/number.eufy_security) |
| [number.mqtt](https://www.home-assistant.io/components/number.mqtt) |
| [number.qbittorrent_alt](https://www.home-assistant.io/components/number.qbittorrent_alt) |
| [number.sensibo](https://www.home-assistant.io/components/number.sensibo) |
| [number.sonos](https://www.home-assistant.io/components/number.sonos) |
| [number.spook](https://www.home-assistant.io/components/number.spook) |
| [number.tuya](https://www.home-assistant.io/components/number.tuya) |
| [number.zha](https://www.home-assistant.io/components/number.zha) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [opennem](https://www.home-assistant.io/components/opennem) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [openweathermap](https://www.home-assistant.io/components/openweathermap) |
| [otbr](https://www.home-assistant.io/components/otbr) |
| [panel_custom](https://www.home-assistant.io/components/panel_custom) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [ping](https://www.home-assistant.io/components/ping) |
| [pirateweather](https://www.home-assistant.io/components/pirateweather) |
| [plex](https://www.home-assistant.io/components/plex) |
| [powercalc](https://www.home-assistant.io/components/powercalc) |
| [private_ble_device](https://www.home-assistant.io/components/private_ble_device) |
| [profiler](https://www.home-assistant.io/components/profiler) |
| [proximity](https://www.home-assistant.io/components/proximity) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [qbittorrent](https://www.home-assistant.io/components/qbittorrent) |
| [qbittorrent_alt](https://www.home-assistant.io/components/qbittorrent_alt) |
| [radarr](https://www.home-assistant.io/components/radarr) |
| [radio_browser](https://www.home-assistant.io/components/radio_browser) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv) |
| [remote.harmony](https://www.home-assistant.io/components/remote.harmony) |
| [remote.samsungtv](https://www.home-assistant.io/components/remote.samsungtv) |
| [remote.samsungtv_smart](https://www.home-assistant.io/components/remote.samsungtv_smart) |
| [repairs](https://www.home-assistant.io/components/repairs) |
| [rest](https://www.home-assistant.io/components/rest) |
| [rocketlaunchlive](https://www.home-assistant.io/components/rocketlaunchlive) |
| [sabnzbd](https://www.home-assistant.io/components/sabnzbd) |
| [samsungtv](https://www.home-assistant.io/components/samsungtv) |
| [samsungtv_smart](https://www.home-assistant.io/components/samsungtv_smart) |
| [satellitetracker](https://www.home-assistant.io/components/satellitetracker) |
| [scene](https://www.home-assistant.io/components/scene) |
| [scene.homeassistant](https://www.home-assistant.io/components/scene.homeassistant) |
| [scene.mqtt](https://www.home-assistant.io/components/scene.mqtt) |
| [scene.tuya](https://www.home-assistant.io/components/scene.tuya) |
| [schedule](https://www.home-assistant.io/components/schedule) |
| [script](https://www.home-assistant.io/components/script) |
| [search](https://www.home-assistant.io/components/search) |
| [season](https://www.home-assistant.io/components/season) |
| [select](https://www.home-assistant.io/components/select) |
| [select.dyson_local](https://www.home-assistant.io/components/select.dyson_local) |
| [select.eufy_security](https://www.home-assistant.io/components/select.eufy_security) |
| [select.harmony](https://www.home-assistant.io/components/select.harmony) |
| [select.hdhomerun](https://www.home-assistant.io/components/select.hdhomerun) |
| [select.mqtt](https://www.home-assistant.io/components/select.mqtt) |
| [select.sensibo](https://www.home-assistant.io/components/select.sensibo) |
| [select.smartthinq_sensors](https://www.home-assistant.io/components/select.smartthinq_sensors) |
| [select.spook](https://www.home-assistant.io/components/select.spook) |
| [select.tuya](https://www.home-assistant.io/components/select.tuya) |
| [select.zha](https://www.home-assistant.io/components/select.zha) |
| [sensibo](https://www.home-assistant.io/components/sensibo) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [sensor.accuweather](https://www.home-assistant.io/components/sensor.accuweather) |
| [sensor.adguard](https://www.home-assistant.io/components/sensor.adguard) |
| [sensor.airvisual](https://www.home-assistant.io/components/sensor.airvisual) |
| [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries) |
| [sensor.astroweather](https://www.home-assistant.io/components/sensor.astroweather) |
| [sensor.auto_backup](https://www.home-assistant.io/components/sensor.auto_backup) |
| [sensor.average](https://www.home-assistant.io/components/sensor.average) |
| [sensor.ble_monitor](https://www.home-assistant.io/components/sensor.ble_monitor) |
| [sensor.blitzortung](https://www.home-assistant.io/components/sensor.blitzortung) |
| [sensor.browser_mod](https://www.home-assistant.io/components/sensor.browser_mod) |
| [sensor.bureau_of_meteorology](https://www.home-assistant.io/components/sensor.bureau_of_meteorology) |
| [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry) |
| [sensor.cloudflare_tunnel_monitor](https://www.home-assistant.io/components/sensor.cloudflare_tunnel_monitor) |
| [sensor.co2signal](https://www.home-assistant.io/components/sensor.co2signal) |
| [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line) |
| [sensor.daily](https://www.home-assistant.io/components/sensor.daily) |
| [sensor.derivative](https://www.home-assistant.io/components/sensor.derivative) |
| [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock) |
| [sensor.dyson_local](https://www.home-assistant.io/components/sensor.dyson_local) |
| [sensor.energy](https://www.home-assistant.io/components/sensor.energy) |
| [sensor.esphome](https://www.home-assistant.io/components/sensor.esphome) |
| [sensor.eufy_security](https://www.home-assistant.io/components/sensor.eufy_security) |
| [sensor.fastdotcom](https://www.home-assistant.io/components/sensor.fastdotcom) |
| [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser) |
| [sensor.filter](https://www.home-assistant.io/components/sensor.filter) |
| [sensor.flightradar24](https://www.home-assistant.io/components/sensor.flightradar24) |
| [sensor.forecast_solar](https://www.home-assistant.io/components/sensor.forecast_solar) |
| [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection) |
| [sensor.gdacs](https://www.home-assistant.io/components/sensor.gdacs) |
| [sensor.github](https://www.home-assistant.io/components/sensor.github) |
| [sensor.glances](https://www.home-assistant.io/components/sensor.glances) |
| [sensor.google_fit](https://www.home-assistant.io/components/sensor.google_fit) |
| [sensor.gtfs2](https://www.home-assistant.io/components/sensor.gtfs2) |
| [sensor.gtfs_rt](https://www.home-assistant.io/components/sensor.gtfs_rt) |
| [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs) |
| [sensor.hassio](https://www.home-assistant.io/components/sensor.hassio) |
| [sensor.hdhomerun](https://www.home-assistant.io/components/sensor.hdhomerun) |
| [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time) |
| [sensor.history_stats](https://www.home-assistant.io/components/sensor.history_stats) |
| [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk) |
| [sensor.ibeacon](https://www.home-assistant.io/components/sensor.ibeacon) |
| [sensor.ical](https://www.home-assistant.io/components/sensor.ical) |
| [sensor.illuminance](https://www.home-assistant.io/components/sensor.illuminance) |
| [sensor.integration](https://www.home-assistant.io/components/sensor.integration) |
| [sensor.ios](https://www.home-assistant.io/components/sensor.ios) |
| [sensor.iss](https://www.home-assistant.io/components/sensor.iss) |
| [sensor.lastfm](https://www.home-assistant.io/components/sensor.lastfm) |
| [sensor.local_ip](https://www.home-assistant.io/components/sensor.local_ip) |
| [sensor.localtuya](https://www.home-assistant.io/components/sensor.localtuya) |
| [sensor.mastodon_profile_stats](https://www.home-assistant.io/components/sensor.mastodon_profile_stats) |
| [sensor.matter](https://www.home-assistant.io/components/sensor.matter) |
| [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app) |
| [sensor.monitor_docker](https://www.home-assistant.io/components/sensor.monitor_docker) |
| [sensor.moon](https://www.home-assistant.io/components/sensor.moon) |
| [sensor.mqtt](https://www.home-assistant.io/components/sensor.mqtt) |
| [sensor.multiscrape](https://www.home-assistant.io/components/sensor.multiscrape) |
| [sensor.myjdownloader](https://www.home-assistant.io/components/sensor.myjdownloader) |
| [sensor.network_scanner](https://www.home-assistant.io/components/sensor.network_scanner) |
| [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered) |
| [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality) |
| [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station) |
| [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger) |
| [sensor.opennem](https://www.home-assistant.io/components/sensor.opennem) |
| [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv) |
| [sensor.openweathermap](https://www.home-assistant.io/components/sensor.openweathermap) |
| [sensor.pirateweather](https://www.home-assistant.io/components/sensor.pirateweather) |
| [sensor.plex](https://www.home-assistant.io/components/sensor.plex) |
| [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added) |
| [sensor.powercalc](https://www.home-assistant.io/components/sensor.powercalc) |
| [sensor.private_ble_device](https://www.home-assistant.io/components/sensor.private_ble_device) |
| [sensor.prometheus_query](https://www.home-assistant.io/components/sensor.prometheus_query) |
| [sensor.proxmoxve](https://www.home-assistant.io/components/sensor.proxmoxve) |
| [sensor.qbittorrent](https://www.home-assistant.io/components/sensor.qbittorrent) |
| [sensor.qbittorrent_alt](https://www.home-assistant.io/components/sensor.qbittorrent_alt) |
| [sensor.radarr](https://www.home-assistant.io/components/sensor.radarr) |
| [sensor.radarr_upcoming_media](https://www.home-assistant.io/components/sensor.radarr_upcoming_media) |
| [sensor.rest](https://www.home-assistant.io/components/sensor.rest) |
| [sensor.rocketlaunchlive](https://www.home-assistant.io/components/sensor.rocketlaunchlive) |
| [sensor.sabnzbd](https://www.home-assistant.io/components/sensor.sabnzbd) |
| [sensor.satellitetracker](https://www.home-assistant.io/components/sensor.satellitetracker) |
| [sensor.season](https://www.home-assistant.io/components/sensor.season) |
| [sensor.sensibo](https://www.home-assistant.io/components/sensor.sensibo) |
| [sensor.slack](https://www.home-assistant.io/components/sensor.slack) |
| [sensor.smartthinq_sensors](https://www.home-assistant.io/components/sensor.smartthinq_sensors) |
| [sensor.snmp](https://www.home-assistant.io/components/sensor.snmp) |
| [sensor.solcast_solar](https://www.home-assistant.io/components/sensor.solcast_solar) |
| [sensor.sonarr](https://www.home-assistant.io/components/sensor.sonarr) |
| [sensor.sonarr_upcoming_media](https://www.home-assistant.io/components/sensor.sonarr_upcoming_media) |
| [sensor.sonos](https://www.home-assistant.io/components/sensor.sonos) |
| [sensor.speedtestdotnet](https://www.home-assistant.io/components/sensor.speedtestdotnet) |
| [sensor.spook](https://www.home-assistant.io/components/sensor.spook) |
| [sensor.sql](https://www.home-assistant.io/components/sensor.sql) |
| [sensor.start_time](https://www.home-assistant.io/components/sensor.start_time) |
| [sensor.statistics](https://www.home-assistant.io/components/sensor.statistics) |
| [sensor.sun](https://www.home-assistant.io/components/sensor.sun) |
| [sensor.sun2](https://www.home-assistant.io/components/sensor.sun2) |
| [sensor.synology_dsm](https://www.home-assistant.io/components/sensor.synology_dsm) |
| [sensor.systemmonitor](https://www.home-assistant.io/components/sensor.systemmonitor) |
| [sensor.tautulli](https://www.home-assistant.io/components/sensor.tautulli) |
| [sensor.teamtracker](https://www.home-assistant.io/components/sensor.teamtracker) |
| [sensor.temperature_feels_like](https://www.home-assistant.io/components/sensor.temperature_feels_like) |
| [sensor.template](https://www.home-assistant.io/components/sensor.template) |
| [sensor.thermal_comfort](https://www.home-assistant.io/components/sensor.thermal_comfort) |
| [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date) |
| [sensor.tomorrowio](https://www.home-assistant.io/components/sensor.tomorrowio) |
| [sensor.transport_nsw](https://www.home-assistant.io/components/sensor.transport_nsw) |
| [sensor.tuya](https://www.home-assistant.io/components/sensor.tuya) |
| [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi) |
| [sensor.unifics](https://www.home-assistant.io/components/sensor.unifics) |
| [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway) |
| [sensor.untappd](https://www.home-assistant.io/components/sensor.untappd) |
| [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime) |
| [sensor.uptime_kuma](https://www.home-assistant.io/components/sensor.uptime_kuma) |
| [sensor.utility_meter](https://www.home-assistant.io/components/sensor.utility_meter) |
| [sensor.version](https://www.home-assistant.io/components/sensor.version) |
| [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi) |
| [sensor.waste_collection_schedule](https://www.home-assistant.io/components/sensor.waste_collection_schedule) |
| [sensor.watchman](https://www.home-assistant.io/components/sensor.watchman) |
| [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw) |
| [sensor.weatherbit](https://www.home-assistant.io/components/sensor.weatherbit) |
| [sensor.weatherflow](https://www.home-assistant.io/components/sensor.weatherflow) |
| [sensor.weatherflow_cloud](https://www.home-assistant.io/components/sensor.weatherflow_cloud) |
| [sensor.weatherflow_forecast](https://www.home-assistant.io/components/sensor.weatherflow_forecast) |
| [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock) |
| [sensor.worlds_air_quality_index](https://www.home-assistant.io/components/sensor.worlds_air_quality_index) |
| [sensor.yahoofinance](https://www.home-assistant.io/components/sensor.yahoofinance) |
| [sensor.youtube](https://www.home-assistant.io/components/sensor.youtube) |
| [sensor.zha](https://www.home-assistant.io/components/sensor.zha) |
| [shell_command](https://www.home-assistant.io/components/shell_command) |
| [simpleicons](https://www.home-assistant.io/components/simpleicons) |
| [siren](https://www.home-assistant.io/components/siren) |
| [siren.mqtt](https://www.home-assistant.io/components/siren.mqtt) |
| [siren.tuya](https://www.home-assistant.io/components/siren.tuya) |
| [siren.zha](https://www.home-assistant.io/components/siren.zha) |
| [slack](https://www.home-assistant.io/components/slack) |
| [smartthinq_sensors](https://www.home-assistant.io/components/smartthinq_sensors) |
| [solcast_solar](https://www.home-assistant.io/components/solcast_solar) |
| [sonarr](https://www.home-assistant.io/components/sonarr) |
| [sonos](https://www.home-assistant.io/components/sonos) |
| [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet) |
| [spook](https://www.home-assistant.io/components/spook) |
| [spotify](https://www.home-assistant.io/components/spotify) |
| [sql](https://www.home-assistant.io/components/sql) |
| [ssdp](https://www.home-assistant.io/components/ssdp) |
| [start_time](https://www.home-assistant.io/components/start_time) |
| [stream](https://www.home-assistant.io/components/stream) |
| [stt](https://www.home-assistant.io/components/stt) |
| [sun](https://www.home-assistant.io/components/sun) |
| [sun2](https://www.home-assistant.io/components/sun2) |
| [switch](https://www.home-assistant.io/components/switch) |
| [switch.adaptive_lighting](https://www.home-assistant.io/components/switch.adaptive_lighting) |
| [switch.adguard](https://www.home-assistant.io/components/switch.adguard) |
| [switch.dyson_local](https://www.home-assistant.io/components/switch.dyson_local) |
| [switch.esphome](https://www.home-assistant.io/components/switch.esphome) |
| [switch.eufy_security](https://www.home-assistant.io/components/switch.eufy_security) |
| [switch.harmony](https://www.home-assistant.io/components/switch.harmony) |
| [switch.matter](https://www.home-assistant.io/components/switch.matter) |
| [switch.monitor_docker](https://www.home-assistant.io/components/switch.monitor_docker) |
| [switch.mqtt](https://www.home-assistant.io/components/switch.mqtt) |
| [switch.myjdownloader](https://www.home-assistant.io/components/switch.myjdownloader) |
| [switch.qbittorrent_alt](https://www.home-assistant.io/components/switch.qbittorrent_alt) |
| [switch.sensibo](https://www.home-assistant.io/components/switch.sensibo) |
| [switch.smartthinq_sensors](https://www.home-assistant.io/components/switch.smartthinq_sensors) |
| [switch.sonos](https://www.home-assistant.io/components/switch.sonos) |
| [switch.spook](https://www.home-assistant.io/components/switch.spook) |
| [switch.synology_dsm](https://www.home-assistant.io/components/switch.synology_dsm) |
| [switch.template](https://www.home-assistant.io/components/switch.template) |
| [switch.tuya](https://www.home-assistant.io/components/switch.tuya) |
| [switch.unifi](https://www.home-assistant.io/components/switch.unifi) |
| [switch.unifi_status](https://www.home-assistant.io/components/switch.unifi_status) |
| [switch.zha](https://www.home-assistant.io/components/switch.zha) |
| [synology_dsm](https://www.home-assistant.io/components/synology_dsm) |
| [system_health](https://www.home-assistant.io/components/system_health) |
| [system_log](https://www.home-assistant.io/components/system_log) |
| [tag](https://www.home-assistant.io/components/tag) |
| [tautulli](https://www.home-assistant.io/components/tautulli) |
| [teamtracker](https://www.home-assistant.io/components/teamtracker) |
| [template](https://www.home-assistant.io/components/template) |
| [text](https://www.home-assistant.io/components/text) |
| [text.mqtt](https://www.home-assistant.io/components/text.mqtt) |
| [thermal_comfort](https://www.home-assistant.io/components/thermal_comfort) |
| [thread](https://www.home-assistant.io/components/thread) |
| [time](https://www.home-assistant.io/components/time) |
| [time.spook](https://www.home-assistant.io/components/time.spook) |
| [timer](https://www.home-assistant.io/components/timer) |
| [tomorrowio](https://www.home-assistant.io/components/tomorrowio) |
| [trace](https://www.home-assistant.io/components/trace) |
| [trakt_tv](https://www.home-assistant.io/components/trakt_tv) |
| [tts](https://www.home-assistant.io/components/tts) |
| [tts.cloud](https://www.home-assistant.io/components/tts.cloud) |
| [tts.google_translate](https://www.home-assistant.io/components/tts.google_translate) |
| [tuya](https://www.home-assistant.io/components/tuya) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [unifics](https://www.home-assistant.io/components/unifics) |
| [update](https://www.home-assistant.io/components/update) |
| [update.esphome](https://www.home-assistant.io/components/update.esphome) |
| [update.hacs](https://www.home-assistant.io/components/update.hacs) |
| [update.hassio](https://www.home-assistant.io/components/update.hassio) |
| [update.hdhomerun](https://www.home-assistant.io/components/update.hdhomerun) |
| [update.mqtt](https://www.home-assistant.io/components/update.mqtt) |
| [update.myjdownloader](https://www.home-assistant.io/components/update.myjdownloader) |
| [update.plex](https://www.home-assistant.io/components/update.plex) |
| [update.sensibo](https://www.home-assistant.io/components/update.sensibo) |
| [update.synology_dsm](https://www.home-assistant.io/components/update.synology_dsm) |
| [update.unifi](https://www.home-assistant.io/components/update.unifi) |
| [uptime](https://www.home-assistant.io/components/uptime) |
| [uptime_kuma](https://www.home-assistant.io/components/uptime_kuma) |
| [usb](https://www.home-assistant.io/components/usb) |
| [utility_meter](https://www.home-assistant.io/components/utility_meter) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [vacuum.mqtt](https://www.home-assistant.io/components/vacuum.mqtt) |
| [vacuum.tuya](https://www.home-assistant.io/components/vacuum.tuya) |
| [version](https://www.home-assistant.io/components/version) |
| [visualcrossing](https://www.home-assistant.io/components/visualcrossing) |
| [wake_on_lan](https://www.home-assistant.io/components/wake_on_lan) |
| [wake_word](https://www.home-assistant.io/components/wake_word) |
| [waqi](https://www.home-assistant.io/components/waqi) |
| [waste_collection_schedule](https://www.home-assistant.io/components/waste_collection_schedule) |
| [watchman](https://www.home-assistant.io/components/watchman) |
| [water_heater](https://www.home-assistant.io/components/water_heater) |
| [water_heater.mqtt](https://www.home-assistant.io/components/water_heater.mqtt) |
| [water_heater.smartthinq_sensors](https://www.home-assistant.io/components/water_heater.smartthinq_sensors) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weather.accuweather](https://www.home-assistant.io/components/weather.accuweather) |
| [weather.astroweather](https://www.home-assistant.io/components/weather.astroweather) |
| [weather.bureau_of_meteorology](https://www.home-assistant.io/components/weather.bureau_of_meteorology) |
| [weather.met](https://www.home-assistant.io/components/weather.met) |
| [weather.openweathermap](https://www.home-assistant.io/components/weather.openweathermap) |
| [weather.pirateweather](https://www.home-assistant.io/components/weather.pirateweather) |
| [weather.template](https://www.home-assistant.io/components/weather.template) |
| [weather.tomorrowio](https://www.home-assistant.io/components/weather.tomorrowio) |
| [weather.visualcrossing](https://www.home-assistant.io/components/weather.visualcrossing) |
| [weather.weatherbit](https://www.home-assistant.io/components/weather.weatherbit) |
| [weather.weatherflow_cloud](https://www.home-assistant.io/components/weather.weatherflow_cloud) |
| [weather.weatherflow_forecast](https://www.home-assistant.io/components/weather.weatherflow_forecast) |
| [weatherbit](https://www.home-assistant.io/components/weatherbit) |
| [weatherflow](https://www.home-assistant.io/components/weatherflow) |
| [weatherflow_cloud](https://www.home-assistant.io/components/weatherflow_cloud) |
| [weatherflow_forecast](https://www.home-assistant.io/components/weatherflow_forecast) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [webostv](https://www.home-assistant.io/components/webostv) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
| [workday](https://www.home-assistant.io/components/workday) |
| [worlds_air_quality_index](https://www.home-assistant.io/components/worlds_air_quality_index) |
| [yahoofinance](https://www.home-assistant.io/components/yahoofinance) |
| [youtube](https://www.home-assistant.io/components/youtube) |
| [zeroconf](https://www.home-assistant.io/components/zeroconf) |
| [zha](https://www.home-assistant.io/components/zha) |
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
- [Icloud3 V3 Idevice Tracker](https://github.com/gcobb321/icloud3)
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
- ESPHome (2023.12.3)
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