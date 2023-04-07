# 🏠TBSmartHome - Home Assistant Configuration

<img align="right" src="./.assets/logo.png?raw=true">

This is my [Home Assistant](https://www.home-assistant.io/) configuration - based on many of the other great configurations are out there (and listed below)

I live in ![Australia](http://flags.ox3.in/mini/au.png) so some of what you find here may not be relevent, or you may have access to better (and probably cheaper) ways.

It's very much a work-in-progress, but feel free to steal ideas or code to use for your own setup

_Please :star: this repo if you find it useful_

[![HA Version](https://img.shields.io/badge/Home%20Assistant--brightgreen)](https://github.com/home-assistant/home-assistant/releases/)
![Hits](http://hits.dwyl.io/bacco007/HomeAssistantConfig.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/bacco007/HomeAssistantConfig?style=flat-square) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/bacco007/HomeAssistantConfig?style=flat-square)
![Licence](https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square)
![Twitter Follow](https://img.shields.io/twitter/follow/bacco007?style=social)

[![Buy me a coffee][buymeacoffee-shield]][buymeacoffee]

---

## Table of Contents

- [🏠TBSmartHome - Home Assistant Configuration](#tbsmarthome---home-assistant-configuration)
  - [Table of Contents](#table-of-contents)
  - [TL;DR](#tldr)
  - [Ecosystem](#ecosystem)
    - [Hardware](#hardware)
    - [Zigbee](#zigbee)
  - [Stats](#stats)
  - [Integrations Used](#integrations-used)
    - [Custom Components Used](#custom-components-used)
  - [Screenshots](#screenshots)
  - [HA Supervisor](#ha-supervisor)
    - [Addon Repositories](#addon-repositories)
    - [Addons](#addons)
  - [Licence](#licence)
  - [Other Good HA Resources/Configs](#other-good-ha-resourcesconfigs)

---

## TL;DR

This is my Home Assistant config - documentation isn't my strongest skill, so if you've got any questions, hit me up

<p align="right"><a href="#top" title="Back to top">Top</a></p>

## Ecosystem

My smarthome setup seems to be ever-growing, but at this stage it's unlikely that I'll make any major changes from here

### Hardware

- Dell Optiplex 9020 SFF (i5, 24Gb RAM, 500Gb HDD) running Proxmox
  - I run three VMs from this machine, one for Home Assistant (Using HassOS) and the other two for other home server stuff
- Lenovo ThinkMachine M73 Tiny (Intel Pentium G3240T, 4Gb RAM, 500Gb HDD)
  - Ubuntu Server 18.10, this machine runs my UniFi controller and Nginx Reverse Proxy Setup
- Raspberry Pi 3
  - Pi-Hole

### Zigbee

I'm running a combination of Xiaomi Aqara and Samsung SmartThings sensors and a ConBee II as the host

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Stats

_Stats as at 05:00, Saturday, April 8th 2023_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 2023.4.1 | 465     | 3752         | 2575 | 101 |

Type | Qty
-- | --
Alarm Control Panel | 2
Alert | 0
Automation | 101
Binary Sensor | 186
Camera | 5
Device Tracker | 75
Group | 1
Input Boolean | 14
Input Datetime | 3
Input Text | 7
Light | 9
Media Player | 17
Person | 1
Scene | 0
Script | 6
Sensor | 2575
Sun | 1
Switch | 162
Weather | 6
Zone | 3

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)

<details>
<summary>Expand Integrations List</summary>

| Name |
| --- |
| [adaptive_lighting](https://www.home-assistant.io/components/adaptive_lighting) |
| [adguard](https://www.home-assistant.io/components/adguard) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alarm_control_panel.eufy_security](https://www.home-assistant.io/components/alarm_control_panel.eufy_security) |
| [alarm_control_panel.mqtt](https://www.home-assistant.io/components/alarm_control_panel.mqtt) |
| [alarm_control_panel.zha](https://www.home-assistant.io/components/alarm_control_panel.zha) |
| [analytics](https://www.home-assistant.io/components/analytics) |
| [androidtv](https://www.home-assistant.io/components/androidtv) |
| [anniversaries](https://www.home-assistant.io/components/anniversaries) |
| [api](https://www.home-assistant.io/components/api) |
| [apple_tv](https://www.home-assistant.io/components/apple_tv) |
| [application_credentials](https://www.home-assistant.io/components/application_credentials) |
| [astroweather](https://www.home-assistant.io/components/astroweather) |
| [auth](https://www.home-assistant.io/components/auth) |
| [automation](https://www.home-assistant.io/components/automation) |
| [average](https://www.home-assistant.io/components/average) |
| [binary_sensor](https://www.home-assistant.io/components/binary_sensor) |
| [binary_sensor.astroweather](https://www.home-assistant.io/components/binary_sensor.astroweather) |
| [binary_sensor.bayesian](https://www.home-assistant.io/components/binary_sensor.bayesian) |
| [binary_sensor.browser_mod](https://www.home-assistant.io/components/binary_sensor.browser_mod) |
| [binary_sensor.cloud](https://www.home-assistant.io/components/binary_sensor.cloud) |
| [binary_sensor.dyson_local](https://www.home-assistant.io/components/binary_sensor.dyson_local) |
| [binary_sensor.eufy_security](https://www.home-assistant.io/components/binary_sensor.eufy_security) |
| [binary_sensor.hassio](https://www.home-assistant.io/components/binary_sensor.hassio) |
| [binary_sensor.hdhomerun](https://www.home-assistant.io/components/binary_sensor.hdhomerun) |
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
| [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2) |
| [binary_sensor.synology_dsm](https://www.home-assistant.io/components/binary_sensor.synology_dsm) |
| [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template) |
| [binary_sensor.threshold](https://www.home-assistant.io/components/binary_sensor.threshold) |
| [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod) |
| [binary_sensor.trend](https://www.home-assistant.io/components/binary_sensor.trend) |
| [binary_sensor.uptime_kuma](https://www.home-assistant.io/components/binary_sensor.uptime_kuma) |
| [binary_sensor.version](https://www.home-assistant.io/components/binary_sensor.version) |
| [binary_sensor.weatherflow](https://www.home-assistant.io/components/binary_sensor.weatherflow) |
| [binary_sensor.workday](https://www.home-assistant.io/components/binary_sensor.workday) |
| [binary_sensor.xbox](https://www.home-assistant.io/components/binary_sensor.xbox) |
| [binary_sensor.zha](https://www.home-assistant.io/components/binary_sensor.zha) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [bluetooth](https://www.home-assistant.io/components/bluetooth) |
| [bluetooth_adapters](https://www.home-assistant.io/components/bluetooth_adapters) |
| [browser_mod](https://www.home-assistant.io/components/browser_mod) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [button](https://www.home-assistant.io/components/button) |
| [button.esphome](https://www.home-assistant.io/components/button.esphome) |
| [button.eufy_security](https://www.home-assistant.io/components/button.eufy_security) |
| [button.hdhomerun](https://www.home-assistant.io/components/button.hdhomerun) |
| [button.mqtt](https://www.home-assistant.io/components/button.mqtt) |
| [button.plex](https://www.home-assistant.io/components/button.plex) |
| [button.proxmoxve](https://www.home-assistant.io/components/button.proxmoxve) |
| [button.sensibo](https://www.home-assistant.io/components/button.sensibo) |
| [button.smartthinq_sensors](https://www.home-assistant.io/components/button.smartthinq_sensors) |
| [button.synology_dsm](https://www.home-assistant.io/components/button.synology_dsm) |
| [button.zha](https://www.home-assistant.io/components/button.zha) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [calendar.anniversaries](https://www.home-assistant.io/components/calendar.anniversaries) |
| [calendar.garbage_collection](https://www.home-assistant.io/components/calendar.garbage_collection) |
| [calendar.google](https://www.home-assistant.io/components/calendar.google) |
| [calendar.holidays](https://www.home-assistant.io/components/calendar.holidays) |
| [calendar.ical](https://www.home-assistant.io/components/calendar.ical) |
| [camera](https://www.home-assistant.io/components/camera) |
| [camera.browser_mod](https://www.home-assistant.io/components/camera.browser_mod) |
| [camera.eufy_security](https://www.home-assistant.io/components/camera.eufy_security) |
| [camera.mqtt](https://www.home-assistant.io/components/camera.mqtt) |
| [camera.synology_dsm](https://www.home-assistant.io/components/camera.synology_dsm) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [climate](https://www.home-assistant.io/components/climate) |
| [climate.dyson_local](https://www.home-assistant.io/components/climate.dyson_local) |
| [climate.mqtt](https://www.home-assistant.io/components/climate.mqtt) |
| [climate.sensibo](https://www.home-assistant.io/components/climate.sensibo) |
| [climate.smartthinq_sensors](https://www.home-assistant.io/components/climate.smartthinq_sensors) |
| [climate.zha](https://www.home-assistant.io/components/climate.zha) |
| [clock_drift](https://www.home-assistant.io/components/clock_drift) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [co2signal](https://www.home-assistant.io/components/co2signal) |
| [config](https://www.home-assistant.io/components/config) |
| [conversation](https://www.home-assistant.io/components/conversation) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cover.mqtt](https://www.home-assistant.io/components/cover.mqtt) |
| [cover.zha](https://www.home-assistant.io/components/cover.zha) |
| [cupertino](https://www.home-assistant.io/components/cupertino) |
| [daily](https://www.home-assistant.io/components/daily) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [derivative](https://www.home-assistant.io/components/derivative) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [device_tracker.ibeacon](https://www.home-assistant.io/components/device_tracker.ibeacon) |
| [device_tracker.icloud3](https://www.home-assistant.io/components/device_tracker.icloud3) |
| [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app) |
| [device_tracker.mqtt](https://www.home-assistant.io/components/device_tracker.mqtt) |
| [device_tracker.satellitetracker](https://www.home-assistant.io/components/device_tracker.satellitetracker) |
| [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi) |
| [device_tracker.zha](https://www.home-assistant.io/components/device_tracker.zha) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [diagnostics](https://www.home-assistant.io/components/diagnostics) |
| [dlna_dms](https://www.home-assistant.io/components/dlna_dms) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [energy](https://www.home-assistant.io/components/energy) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [eufy_security](https://www.home-assistant.io/components/eufy_security) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fan.dyson_local](https://www.home-assistant.io/components/fan.dyson_local) |
| [fan.mqtt](https://www.home-assistant.io/components/fan.mqtt) |
| [fan.smartthinq_sensors](https://www.home-assistant.io/components/fan.smartthinq_sensors) |
| [fan.zha](https://www.home-assistant.io/components/fan.zha) |
| [fastdotcom](https://www.home-assistant.io/components/fastdotcom) |
| [favicon](https://www.home-assistant.io/components/favicon) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [file_upload](https://www.home-assistant.io/components/file_upload) |
| [fontawesome](https://www.home-assistant.io/components/fontawesome) |
| [forecast_solar](https://www.home-assistant.io/components/forecast_solar) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [geo_location.blitzortung](https://www.home-assistant.io/components/geo_location.blitzortung) |
| [geo_location.gdacs](https://www.home-assistant.io/components/geo_location.gdacs) |
| [geo_location.nsw_rural_fire_service_feed](https://www.home-assistant.io/components/geo_location.nsw_rural_fire_service_feed) |
| [geo_location.usgs_earthquakes_feed](https://www.home-assistant.io/components/geo_location.usgs_earthquakes_feed) |
| [github](https://www.home-assistant.io/components/github) |
| [glances](https://www.home-assistant.io/components/glances) |
| [google](https://www.home-assistant.io/components/google) |
| [group](https://www.home-assistant.io/components/group) |
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
| [homekit](https://www.home-assistant.io/components/homekit) |
| [http](https://www.home-assistant.io/components/http) |
| [humidifier](https://www.home-assistant.io/components/humidifier) |
| [humidifier.mqtt](https://www.home-assistant.io/components/humidifier.mqtt) |
| [humidifier.smartthinq_sensors](https://www.home-assistant.io/components/humidifier.smartthinq_sensors) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [ibeacon](https://www.home-assistant.io/components/ibeacon) |
| [ical](https://www.home-assistant.io/components/ical) |
| [icloud3](https://www.home-assistant.io/components/icloud3) |
| [image_upload](https://www.home-assistant.io/components/image_upload) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_boolean](https://www.home-assistant.io/components/input_boolean) |
| [input_button](https://www.home-assistant.io/components/input_button) |
| [input_datetime](https://www.home-assistant.io/components/input_datetime) |
| [input_number](https://www.home-assistant.io/components/input_number) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [input_text](https://www.home-assistant.io/components/input_text) |
| [intent](https://www.home-assistant.io/components/intent) |
| [ios](https://www.home-assistant.io/components/ios) |
| [iss](https://www.home-assistant.io/components/iss) |
| [kodi](https://www.home-assistant.io/components/kodi) |
| [launch_library](https://www.home-assistant.io/components/launch_library) |
| [light](https://www.home-assistant.io/components/light) |
| [light.browser_mod](https://www.home-assistant.io/components/light.browser_mod) |
| [light.group](https://www.home-assistant.io/components/light.group) |
| [light.mqtt](https://www.home-assistant.io/components/light.mqtt) |
| [light.zha](https://www.home-assistant.io/components/light.zha) |
| [local_ip](https://www.home-assistant.io/components/local_ip) |
| [lock](https://www.home-assistant.io/components/lock) |
| [lock.eufy_security](https://www.home-assistant.io/components/lock.eufy_security) |
| [lock.mqtt](https://www.home-assistant.io/components/lock.mqtt) |
| [lock.zha](https://www.home-assistant.io/components/lock.zha) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [lovelace_gen](https://www.home-assistant.io/components/lovelace_gen) |
| [map](https://www.home-assistant.io/components/map) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_player.androidtv](https://www.home-assistant.io/components/media_player.androidtv) |
| [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv) |
| [media_player.browser_mod](https://www.home-assistant.io/components/media_player.browser_mod) |
| [media_player.cast](https://www.home-assistant.io/components/media_player.cast) |
| [media_player.kodi](https://www.home-assistant.io/components/media_player.kodi) |
| [media_player.plex](https://www.home-assistant.io/components/media_player.plex) |
| [media_player.samsungtv](https://www.home-assistant.io/components/media_player.samsungtv) |
| [media_player.samsungtv_smart](https://www.home-assistant.io/components/media_player.samsungtv_smart) |
| [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos) |
| [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify) |
| [media_player.universal](https://www.home-assistant.io/components/media_player.universal) |
| [media_player.xbox](https://www.home-assistant.io/components/media_player.xbox) |
| [media_source](https://www.home-assistant.io/components/media_source) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [moon](https://www.home-assistant.io/components/moon) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [multiscrape](https://www.home-assistant.io/components/multiscrape) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [network](https://www.home-assistant.io/components/network) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [notify](https://www.home-assistant.io/components/notify) |
| [notify.group](https://www.home-assistant.io/components/notify.group) |
| [notify.ios](https://www.home-assistant.io/components/notify.ios) |
| [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app) |
| [notify.slack](https://www.home-assistant.io/components/notify.slack) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [number](https://www.home-assistant.io/components/number) |
| [number.eufy_security](https://www.home-assistant.io/components/number.eufy_security) |
| [number.mqtt](https://www.home-assistant.io/components/number.mqtt) |
| [number.sensibo](https://www.home-assistant.io/components/number.sensibo) |
| [number.sonos](https://www.home-assistant.io/components/number.sonos) |
| [number.zha](https://www.home-assistant.io/components/number.zha) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [openexchangerates](https://www.home-assistant.io/components/openexchangerates) |
| [opennem](https://www.home-assistant.io/components/opennem) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [panel_custom](https://www.home-assistant.io/components/panel_custom) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [ping](https://www.home-assistant.io/components/ping) |
| [plex](https://www.home-assistant.io/components/plex) |
| [proximity](https://www.home-assistant.io/components/proximity) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [radarr](https://www.home-assistant.io/components/radarr) |
| [radio_browser](https://www.home-assistant.io/components/radio_browser) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv) |
| [remote.harmony](https://www.home-assistant.io/components/remote.harmony) |
| [remote.xbox](https://www.home-assistant.io/components/remote.xbox) |
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
| [select.zha](https://www.home-assistant.io/components/select.zha) |
| [sensibo](https://www.home-assistant.io/components/sensibo) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [sensor.adguard](https://www.home-assistant.io/components/sensor.adguard) |
| [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries) |
| [sensor.astroweather](https://www.home-assistant.io/components/sensor.astroweather) |
| [sensor.average](https://www.home-assistant.io/components/sensor.average) |
| [sensor.blitzortung](https://www.home-assistant.io/components/sensor.blitzortung) |
| [sensor.browser_mod](https://www.home-assistant.io/components/sensor.browser_mod) |
| [sensor.bureau_of_meteorology](https://www.home-assistant.io/components/sensor.bureau_of_meteorology) |
| [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry) |
| [sensor.co2signal](https://www.home-assistant.io/components/sensor.co2signal) |
| [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line) |
| [sensor.custom_qbittorrent](https://www.home-assistant.io/components/sensor.custom_qbittorrent) |
| [sensor.daily](https://www.home-assistant.io/components/sensor.daily) |
| [sensor.derivative](https://www.home-assistant.io/components/sensor.derivative) |
| [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock) |
| [sensor.dyson_local](https://www.home-assistant.io/components/sensor.dyson_local) |
| [sensor.energy](https://www.home-assistant.io/components/sensor.energy) |
| [sensor.esphome](https://www.home-assistant.io/components/sensor.esphome) |
| [sensor.eufy_security](https://www.home-assistant.io/components/sensor.eufy_security) |
| [sensor.fastdotcom](https://www.home-assistant.io/components/sensor.fastdotcom) |
| [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser) |
| [sensor.forecast_solar](https://www.home-assistant.io/components/sensor.forecast_solar) |
| [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection) |
| [sensor.gdacs](https://www.home-assistant.io/components/sensor.gdacs) |
| [sensor.github](https://www.home-assistant.io/components/sensor.github) |
| [sensor.glances](https://www.home-assistant.io/components/sensor.glances) |
| [sensor.gtfs_rt](https://www.home-assistant.io/components/sensor.gtfs_rt) |
| [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs) |
| [sensor.hassio](https://www.home-assistant.io/components/sensor.hassio) |
| [sensor.hdhomerun](https://www.home-assistant.io/components/sensor.hdhomerun) |
| [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time) |
| [sensor.history_stats](https://www.home-assistant.io/components/sensor.history_stats) |
| [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk) |
| [sensor.ibeacon](https://www.home-assistant.io/components/sensor.ibeacon) |
| [sensor.ical](https://www.home-assistant.io/components/sensor.ical) |
| [sensor.icloud3](https://www.home-assistant.io/components/sensor.icloud3) |
| [sensor.ios](https://www.home-assistant.io/components/sensor.ios) |
| [sensor.iss](https://www.home-assistant.io/components/sensor.iss) |
| [sensor.lastfm](https://www.home-assistant.io/components/sensor.lastfm) |
| [sensor.launch_library](https://www.home-assistant.io/components/sensor.launch_library) |
| [sensor.local_ip](https://www.home-assistant.io/components/sensor.local_ip) |
| [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app) |
| [sensor.monitor_docker](https://www.home-assistant.io/components/sensor.monitor_docker) |
| [sensor.moon](https://www.home-assistant.io/components/sensor.moon) |
| [sensor.mqtt](https://www.home-assistant.io/components/sensor.mqtt) |
| [sensor.mqtt_room](https://www.home-assistant.io/components/sensor.mqtt_room) |
| [sensor.multiscrape](https://www.home-assistant.io/components/sensor.multiscrape) |
| [sensor.myjdownloader](https://www.home-assistant.io/components/sensor.myjdownloader) |
| [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered) |
| [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality) |
| [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station) |
| [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger) |
| [sensor.openexchangerates](https://www.home-assistant.io/components/sensor.openexchangerates) |
| [sensor.opennem](https://www.home-assistant.io/components/sensor.opennem) |
| [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv) |
| [sensor.plex](https://www.home-assistant.io/components/sensor.plex) |
| [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added) |
| [sensor.proxmoxve](https://www.home-assistant.io/components/sensor.proxmoxve) |
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
| [sensor.template](https://www.home-assistant.io/components/sensor.template) |
| [sensor.thermal_comfort](https://www.home-assistant.io/components/sensor.thermal_comfort) |
| [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date) |
| [sensor.transport_nsw](https://www.home-assistant.io/components/sensor.transport_nsw) |
| [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi) |
| [sensor.unifics](https://www.home-assistant.io/components/sensor.unifics) |
| [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway) |
| [sensor.untappd](https://www.home-assistant.io/components/sensor.untappd) |
| [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime) |
| [sensor.uptime_kuma](https://www.home-assistant.io/components/sensor.uptime_kuma) |
| [sensor.utility_meter](https://www.home-assistant.io/components/sensor.utility_meter) |
| [sensor.version](https://www.home-assistant.io/components/sensor.version) |
| [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi) |
| [sensor.watchman](https://www.home-assistant.io/components/sensor.watchman) |
| [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw) |
| [sensor.waze_travel_time](https://www.home-assistant.io/components/sensor.waze_travel_time) |
| [sensor.weatherflow](https://www.home-assistant.io/components/sensor.weatherflow) |
| [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock) |
| [sensor.worlds_air_quality_index](https://www.home-assistant.io/components/sensor.worlds_air_quality_index) |
| [sensor.xbox](https://www.home-assistant.io/components/sensor.xbox) |
| [sensor.yahoofinance](https://www.home-assistant.io/components/sensor.yahoofinance) |
| [sensor.zha](https://www.home-assistant.io/components/sensor.zha) |
| [shell_command](https://www.home-assistant.io/components/shell_command) |
| [simpleicons](https://www.home-assistant.io/components/simpleicons) |
| [siren](https://www.home-assistant.io/components/siren) |
| [siren.mqtt](https://www.home-assistant.io/components/siren.mqtt) |
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
| [switch](https://www.home-assistant.io/components/switch) |
| [switch.adaptive_lighting](https://www.home-assistant.io/components/switch.adaptive_lighting) |
| [switch.adguard](https://www.home-assistant.io/components/switch.adguard) |
| [switch.custom_qbittorrent](https://www.home-assistant.io/components/switch.custom_qbittorrent) |
| [switch.dyson_local](https://www.home-assistant.io/components/switch.dyson_local) |
| [switch.esphome](https://www.home-assistant.io/components/switch.esphome) |
| [switch.eufy_security](https://www.home-assistant.io/components/switch.eufy_security) |
| [switch.harmony](https://www.home-assistant.io/components/switch.harmony) |
| [switch.monitor_docker](https://www.home-assistant.io/components/switch.monitor_docker) |
| [switch.mqtt](https://www.home-assistant.io/components/switch.mqtt) |
| [switch.myjdownloader](https://www.home-assistant.io/components/switch.myjdownloader) |
| [switch.sensibo](https://www.home-assistant.io/components/switch.sensibo) |
| [switch.smartthinq_sensors](https://www.home-assistant.io/components/switch.smartthinq_sensors) |
| [switch.sonos](https://www.home-assistant.io/components/switch.sonos) |
| [switch.spook](https://www.home-assistant.io/components/switch.spook) |
| [switch.synology_dsm](https://www.home-assistant.io/components/switch.synology_dsm) |
| [switch.template](https://www.home-assistant.io/components/switch.template) |
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
| [threshold](https://www.home-assistant.io/components/threshold) |
| [timer](https://www.home-assistant.io/components/timer) |
| [trace](https://www.home-assistant.io/components/trace) |
| [trakt_tv](https://www.home-assistant.io/components/trakt_tv) |
| [tts](https://www.home-assistant.io/components/tts) |
| [tts.cloud](https://www.home-assistant.io/components/tts.cloud) |
| [tts.google_translate](https://www.home-assistant.io/components/tts.google_translate) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [unifics](https://www.home-assistant.io/components/unifics) |
| [update](https://www.home-assistant.io/components/update) |
| [update.esphome](https://www.home-assistant.io/components/update.esphome) |
| [update.hacs](https://www.home-assistant.io/components/update.hacs) |
| [update.hassio](https://www.home-assistant.io/components/update.hassio) |
| [update.hdhomerun](https://www.home-assistant.io/components/update.hdhomerun) |
| [update.mqtt](https://www.home-assistant.io/components/update.mqtt) |
| [update.myjdownloader](https://www.home-assistant.io/components/update.myjdownloader) |
| [update.sensibo](https://www.home-assistant.io/components/update.sensibo) |
| [update.synology_dsm](https://www.home-assistant.io/components/update.synology_dsm) |
| [update.unifi](https://www.home-assistant.io/components/update.unifi) |
| [uptime](https://www.home-assistant.io/components/uptime) |
| [uptime_kuma](https://www.home-assistant.io/components/uptime_kuma) |
| [usb](https://www.home-assistant.io/components/usb) |
| [utility_meter](https://www.home-assistant.io/components/utility_meter) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [vacuum.mqtt](https://www.home-assistant.io/components/vacuum.mqtt) |
| [version](https://www.home-assistant.io/components/version) |
| [watchman](https://www.home-assistant.io/components/watchman) |
| [water_heater](https://www.home-assistant.io/components/water_heater) |
| [water_heater.smartthinq_sensors](https://www.home-assistant.io/components/water_heater.smartthinq_sensors) |
| [waze_travel_time](https://www.home-assistant.io/components/waze_travel_time) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weather.astroweather](https://www.home-assistant.io/components/weather.astroweather) |
| [weather.bureau_of_meteorology](https://www.home-assistant.io/components/weather.bureau_of_meteorology) |
| [weather.template](https://www.home-assistant.io/components/weather.template) |
| [weather.weatherflow](https://www.home-assistant.io/components/weather.weatherflow) |
| [weatherflow](https://www.home-assistant.io/components/weatherflow) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
| [worlds_air_quality_index](https://www.home-assistant.io/components/worlds_air_quality_index) |
| [xbox](https://www.home-assistant.io/components/xbox) |
| [yahoofinance](https://www.home-assistant.io/components/yahoofinance) |
| [zeroconf](https://www.home-assistant.io/components/zeroconf) |
| [zha](https://www.home-assistant.io/components/zha) |
| [zone](https://www.home-assistant.io/components/zone) |
</details>

### Custom Components Used

<details>
<summary>Expand Custom Components List</summary>

- [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting#readme)
- [Anniversaries](https://github.com/pinkywafer/Anniversaries)
- [Apple TV](https://www.home-assistant.io/integrations/apple_tv)
- [AstroWeather](https://github.com/mawinkler/astroweather)
- [Average Sensor](https://github.com/Limych/ha-average)
- [Blitzortung](https://github.com/mrk-its/homeassistant-blitzortung)
- [Browser mod](https://github.com/thomasloven/hass-browser_mod/blob/master/README.md)
- [Bureau of Meteorology](https://github.com/bremor/bureau_of_meteorology)
- [Clock Drift]()
- [Daily Sensor](https://github.com/jeroenterheerdt/HADailySensor)
- [Doomsday Clock](https://github.com/renemarc/home-assistant-doomsday-clock)
- [Dyson Local](https://github.com/shenxn/ha-dyson)
- [Eufy Security](https://github.com/fuatakgun/eufy_security)
- [Favicon changer](https://github.com/thomasloven/hass-favicon)
- [Feedparser](https://github.com/custom-components/feedparser/blob/master/README.md)
- [Fontawesome icons](https://github.com/thomasloven/hass-fontawesome)
- [Garbage Collection](https://github.com/bruxy70/Garbage-Collection/)
- [Generate readme](https://github.com/custom-components/readme)
- [GTFS-Realtime](https://github.com/mark1foley/ha-gtfs-rt-v2)
- [HACS](https://hacs.xyz/docs/configuration/start)
- [HDHomeRun](https://github.com/uvjim/hass_hdhomerun)
- [Holidays](https://github.com/bruxy70/Holidays/)
- [HomeAssistant Cupertino Icons](https://github.com/menahishayan/HomeAssistant-Cupertino-Icons)
- [ical Sensor](https://www.home-assistant.io/integrations/ical)
- [iCloud3 v3](https://gcobb321.github.io/icloud3_v3/#/)
- [Indoor Air Quality UK Index](https://github.com/Limych/ha-iaquk)
- [Lovelace Gen]()
- [Monitor Docker](https://github.com/ualex73/monitor_docker)
- [Multiscrape scraping component](https://github.com/danieldotnl/ha-multiscrape)
- [MyJDownloader](https://github.com/doudz/homeassistant-myjdownloader)
- [Node-RED Companion](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/custom_integration/)
- [NSW Air Quality]()
- [NSW Rural Fire Service - Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger)
- [OpenNEM](https://github.com/bacco007/sensor.opennem)
- [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Proxmox VE](https://github.com/dougiteixeira/proxmoxve)
- [Pyscript Python scripting](https://github.com/custom-components/pyscript)
- [Qbittorrent_custom](https://github.com/radsonpatrick/qbittorrent_custom_component)
- [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Rocket Launch Live - Next 5 Launches](https://github.com/djtimca/harocketlaunchlive)
- [SamsungTV Smart](https://github.com/ollo69/ha-samsungtv-smart)
- [Satellite Tracker (N2YO)](https://github.com/djtimca/hasatellitetracker)
- [Simple Icons](https://github.com/vigonotion/hass-simpleicons)
- [SmartThinQ LGE Sensors](https://github.com/ollo69/ha-smartthinq-sensors)
- [Solcast PV Forecast](https://github.com/oziee/ha-solcast-solar)
- [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [Spook](https://github.com/frenck/spook)
- [Start Time](https://github.com/AlexxIT/StartTime)
- [Sun2](https://github.com/pnbruckner/ha-sun2/blob/time_at_elevation/README.md)
- [Team Tracker](https://github.com/vasqued2/ha-teamtracker)
- [Thermal Comfort](https://github.com/dolezsa/thermal_comfort/blob/master/README.md)
- [Trakt](https://github.com/dylandoamaral/trakt-integration)
- [Unifi Counter Sensor](https://www.home-assistant.io/integrations/unifics)
- [UniFi Gateway](https://github.com/custom-components/sensor.unifigateway)
- [UniFi Status](https://github.com/zvldz/unifi_status)
- [Untappd](https://github.com/custom-components/sensor.untappd/blob/master/README.md)
- [Uptime Kuma](https://github.com/meichthys/uptime_kuma/blob/main/README.md)
- [Watchman](https://github.com/dummylabs/thewatchman)
- [Water NSW](https://github.com/bacco007/sensor.waternsw)
- [WeatherFlow Weather](https://github.com/briis/hass-weatherflow)
- [World's Air Quality Index](https://github.com/pawkakol1/worlds-air-quality-index)
- [Yahoo Finance](https://github.com/iprak/yahoofinance)</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Screenshots

![Screenshot - Home](./.assets/home.png?raw=True)

<details>
<summary>More Screenshots Here</summary>

![Screenshot - More](./.assets/more.png?raw=True)

</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## HA Supervisor

### Addons

Here are the addons I use inside Hass.io, some of the other things I run can be done inside Hass.io, but I've elected not to do so.



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

## Other Good HA Resources/Configs

These resources have either provided inspiration or some great code that has helped me get my configuration up and running

- [aFFekopp/homeassistant](https://github.com/aFFekopp/homeassistant)
  - This is where I've copied the great theme from
- [danrspencer/hass-config](https://github.com/danrspencer/hass-config)
- [JamesMcCarthy79/Home-Assistant-Config](https://github.com/JamesMcCarthy79/Home-Assistant-Config)
- [jimz011/homeassistant](https://github.com/jimz011/homeassistant)
- [Limych/HomeAssistantConfiguration](https://github.com/Limych/HomeAssistantConfiguration)

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

Generated by the [custom readme integration](https://github.com/custom-components/readme)

[buymeacoffee-shield]: https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg
[buymeacoffee]: https://www.buymeacoffee.com/bacco007