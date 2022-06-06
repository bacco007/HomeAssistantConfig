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

_Stats as at 05:00, Tuesday, June 7th 2022_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| unknown | 431     | 2919         | 2004 | 95 |

Type | Qty
-- | --
Alarm Control Panel | 2
Alert | 0
Automation | 95
Binary Sensor | 274
Camera | 8
Device Tracker | 68
Group | 5
Input Boolean | 1
Input Datetime | 2
Input Text | 7
Light | 5
Media Player | 20
Person | 1
Scene | 0
Script | 4
Sensor | 2004
Sun | 1
Switch | 167
Weather | 9
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
| [alarm_control_panel.tuya](https://www.home-assistant.io/components/alarm_control_panel.tuya) |
| [alarm_control_panel.zha](https://www.home-assistant.io/components/alarm_control_panel.zha) |
| [analytics](https://www.home-assistant.io/components/analytics) |
| [androidtv](https://www.home-assistant.io/components/androidtv) |
| [anniversaries](https://www.home-assistant.io/components/anniversaries) |
| [api](https://www.home-assistant.io/components/api) |
| [apple_tv](https://www.home-assistant.io/components/apple_tv) |
| [application_credentials](https://www.home-assistant.io/components/application_credentials) |
| [aus_fuel](https://www.home-assistant.io/components/aus_fuel) |
| [auth](https://www.home-assistant.io/components/auth) |
| [automation](https://www.home-assistant.io/components/automation) |
| [binary_sensor](https://www.home-assistant.io/components/binary_sensor) |
| [binary_sensor.cloud](https://www.home-assistant.io/components/binary_sensor.cloud) |
| [binary_sensor.dyson_local](https://www.home-assistant.io/components/binary_sensor.dyson_local) |
| [binary_sensor.esphome](https://www.home-assistant.io/components/binary_sensor.esphome) |
| [binary_sensor.eufy_security](https://www.home-assistant.io/components/binary_sensor.eufy_security) |
| [binary_sensor.hassio](https://www.home-assistant.io/components/binary_sensor.hassio) |
| [binary_sensor.hdhomerun](https://www.home-assistant.io/components/binary_sensor.hdhomerun) |
| [binary_sensor.iss](https://www.home-assistant.io/components/binary_sensor.iss) |
| [binary_sensor.mobile_app](https://www.home-assistant.io/components/binary_sensor.mobile_app) |
| [binary_sensor.mqtt](https://www.home-assistant.io/components/binary_sensor.mqtt) |
| [binary_sensor.myjdownloader](https://www.home-assistant.io/components/binary_sensor.myjdownloader) |
| [binary_sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/binary_sensor.nsw_rural_fire_service_fire_danger) |
| [binary_sensor.openuv](https://www.home-assistant.io/components/binary_sensor.openuv) |
| [binary_sensor.ping](https://www.home-assistant.io/components/binary_sensor.ping) |
| [binary_sensor.proxmoxve](https://www.home-assistant.io/components/binary_sensor.proxmoxve) |
| [binary_sensor.satellitetracker](https://www.home-assistant.io/components/binary_sensor.satellitetracker) |
| [binary_sensor.sensibo](https://www.home-assistant.io/components/binary_sensor.sensibo) |
| [binary_sensor.smartthinq_sensors](https://www.home-assistant.io/components/binary_sensor.smartthinq_sensors) |
| [binary_sensor.sonos](https://www.home-assistant.io/components/binary_sensor.sonos) |
| [binary_sensor.spacex](https://www.home-assistant.io/components/binary_sensor.spacex) |
| [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2) |
| [binary_sensor.synology_dsm](https://www.home-assistant.io/components/binary_sensor.synology_dsm) |
| [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template) |
| [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod) |
| [binary_sensor.tuya](https://www.home-assistant.io/components/binary_sensor.tuya) |
| [binary_sensor.upnp](https://www.home-assistant.io/components/binary_sensor.upnp) |
| [binary_sensor.upnp_availability](https://www.home-assistant.io/components/binary_sensor.upnp_availability) |
| [binary_sensor.uptime_kuma](https://www.home-assistant.io/components/binary_sensor.uptime_kuma) |
| [binary_sensor.version](https://www.home-assistant.io/components/binary_sensor.version) |
| [binary_sensor.weatherflow](https://www.home-assistant.io/components/binary_sensor.weatherflow) |
| [binary_sensor.workday](https://www.home-assistant.io/components/binary_sensor.workday) |
| [binary_sensor.xbox](https://www.home-assistant.io/components/binary_sensor.xbox) |
| [binary_sensor.zha](https://www.home-assistant.io/components/binary_sensor.zha) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [broadlink](https://www.home-assistant.io/components/broadlink) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [button](https://www.home-assistant.io/components/button) |
| [button.esphome](https://www.home-assistant.io/components/button.esphome) |
| [button.hdhomerun](https://www.home-assistant.io/components/button.hdhomerun) |
| [button.homekit_controller](https://www.home-assistant.io/components/button.homekit_controller) |
| [button.mqtt](https://www.home-assistant.io/components/button.mqtt) |
| [button.plex](https://www.home-assistant.io/components/button.plex) |
| [button.synology_dsm](https://www.home-assistant.io/components/button.synology_dsm) |
| [button.tuya](https://www.home-assistant.io/components/button.tuya) |
| [button.zha](https://www.home-assistant.io/components/button.zha) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [calendar.garbage_collection](https://www.home-assistant.io/components/calendar.garbage_collection) |
| [calendar.holidays](https://www.home-assistant.io/components/calendar.holidays) |
| [calendar.ical](https://www.home-assistant.io/components/calendar.ical) |
| [camera](https://www.home-assistant.io/components/camera) |
| [camera.eufy_security](https://www.home-assistant.io/components/camera.eufy_security) |
| [camera.mqtt](https://www.home-assistant.io/components/camera.mqtt) |
| [camera.synology_dsm](https://www.home-assistant.io/components/camera.synology_dsm) |
| [camera.tuya](https://www.home-assistant.io/components/camera.tuya) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [climate](https://www.home-assistant.io/components/climate) |
| [climate.dyson_local](https://www.home-assistant.io/components/climate.dyson_local) |
| [climate.mqtt](https://www.home-assistant.io/components/climate.mqtt) |
| [climate.sensibo](https://www.home-assistant.io/components/climate.sensibo) |
| [climate.smartthinq_sensors](https://www.home-assistant.io/components/climate.smartthinq_sensors) |
| [climate.tuya](https://www.home-assistant.io/components/climate.tuya) |
| [climate.zha](https://www.home-assistant.io/components/climate.zha) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [co2signal](https://www.home-assistant.io/components/co2signal) |
| [config](https://www.home-assistant.io/components/config) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cover.mqtt](https://www.home-assistant.io/components/cover.mqtt) |
| [cover.tuya](https://www.home-assistant.io/components/cover.tuya) |
| [cover.zha](https://www.home-assistant.io/components/cover.zha) |
| [cupertino](https://www.home-assistant.io/components/cupertino) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app) |
| [device_tracker.mqtt](https://www.home-assistant.io/components/device_tracker.mqtt) |
| [device_tracker.satellitetracker](https://www.home-assistant.io/components/device_tracker.satellitetracker) |
| [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi) |
| [device_tracker.zha](https://www.home-assistant.io/components/device_tracker.zha) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [diagnostics](https://www.home-assistant.io/components/diagnostics) |
| [dlna_dmr](https://www.home-assistant.io/components/dlna_dmr) |
| [dlna_dms](https://www.home-assistant.io/components/dlna_dms) |
| [dwains_dashboard](https://www.home-assistant.io/components/dwains_dashboard) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [energy](https://www.home-assistant.io/components/energy) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [eufy_security](https://www.home-assistant.io/components/eufy_security) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fan.dyson_local](https://www.home-assistant.io/components/fan.dyson_local) |
| [fan.mqtt](https://www.home-assistant.io/components/fan.mqtt) |
| [fan.smartthinq_sensors](https://www.home-assistant.io/components/fan.smartthinq_sensors) |
| [fan.tuya](https://www.home-assistant.io/components/fan.tuya) |
| [fan.zha](https://www.home-assistant.io/components/fan.zha) |
| [favicon](https://www.home-assistant.io/components/favicon) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
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
| [group](https://www.home-assistant.io/components/group) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [hdhomerun](https://www.home-assistant.io/components/hdhomerun) |
| [here_travel_time](https://www.home-assistant.io/components/here_travel_time) |
| [history](https://www.home-assistant.io/components/history) |
| [holidays](https://www.home-assistant.io/components/holidays) |
| [homeassistant](https://www.home-assistant.io/components/homeassistant) |
| [homekit](https://www.home-assistant.io/components/homekit) |
| [homekit_controller](https://www.home-assistant.io/components/homekit_controller) |
| [http](https://www.home-assistant.io/components/http) |
| [humidifier](https://www.home-assistant.io/components/humidifier) |
| [humidifier.mqtt](https://www.home-assistant.io/components/humidifier.mqtt) |
| [humidifier.smartthinq_sensors](https://www.home-assistant.io/components/humidifier.smartthinq_sensors) |
| [humidifier.tuya](https://www.home-assistant.io/components/humidifier.tuya) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [ical](https://www.home-assistant.io/components/ical) |
| [ifttt](https://www.home-assistant.io/components/ifttt) |
| [image](https://www.home-assistant.io/components/image) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_boolean](https://www.home-assistant.io/components/input_boolean) |
| [input_button](https://www.home-assistant.io/components/input_button) |
| [input_datetime](https://www.home-assistant.io/components/input_datetime) |
| [input_number](https://www.home-assistant.io/components/input_number) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [input_text](https://www.home-assistant.io/components/input_text) |
| [ios](https://www.home-assistant.io/components/ios) |
| [iss](https://www.home-assistant.io/components/iss) |
| [kodi](https://www.home-assistant.io/components/kodi) |
| [launch_library](https://www.home-assistant.io/components/launch_library) |
| [light](https://www.home-assistant.io/components/light) |
| [light.group](https://www.home-assistant.io/components/light.group) |
| [light.mqtt](https://www.home-assistant.io/components/light.mqtt) |
| [light.tuya](https://www.home-assistant.io/components/light.tuya) |
| [light.zha](https://www.home-assistant.io/components/light.zha) |
| [lock](https://www.home-assistant.io/components/lock) |
| [lock.eufy_security](https://www.home-assistant.io/components/lock.eufy_security) |
| [lock.mqtt](https://www.home-assistant.io/components/lock.mqtt) |
| [lock.zha](https://www.home-assistant.io/components/lock.zha) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [map](https://www.home-assistant.io/components/map) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_player.androidtv](https://www.home-assistant.io/components/media_player.androidtv) |
| [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv) |
| [media_player.cast](https://www.home-assistant.io/components/media_player.cast) |
| [media_player.dlna_dmr](https://www.home-assistant.io/components/media_player.dlna_dmr) |
| [media_player.kodi](https://www.home-assistant.io/components/media_player.kodi) |
| [media_player.plex](https://www.home-assistant.io/components/media_player.plex) |
| [media_player.samsungtv](https://www.home-assistant.io/components/media_player.samsungtv) |
| [media_player.samsungtv_smart](https://www.home-assistant.io/components/media_player.samsungtv_smart) |
| [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos) |
| [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify) |
| [media_player.xbox](https://www.home-assistant.io/components/media_player.xbox) |
| [media_source](https://www.home-assistant.io/components/media_source) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [moon](https://www.home-assistant.io/components/moon) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [network](https://www.home-assistant.io/components/network) |
| [nfl](https://www.home-assistant.io/components/nfl) |
| [nhl](https://www.home-assistant.io/components/nhl) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [notify](https://www.home-assistant.io/components/notify) |
| [notify.group](https://www.home-assistant.io/components/notify.group) |
| [notify.ios](https://www.home-assistant.io/components/notify.ios) |
| [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app) |
| [notify.slack](https://www.home-assistant.io/components/notify.slack) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [number](https://www.home-assistant.io/components/number) |
| [number.mqtt](https://www.home-assistant.io/components/number.mqtt) |
| [number.sensibo](https://www.home-assistant.io/components/number.sensibo) |
| [number.sonos](https://www.home-assistant.io/components/number.sonos) |
| [number.tuya](https://www.home-assistant.io/components/number.tuya) |
| [number.zha](https://www.home-assistant.io/components/number.zha) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [opennem](https://www.home-assistant.io/components/opennem) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [panel_iframe](https://www.home-assistant.io/components/panel_iframe) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [ping](https://www.home-assistant.io/components/ping) |
| [plex](https://www.home-assistant.io/components/plex) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [radarr](https://www.home-assistant.io/components/radarr) |
| [radio_browser](https://www.home-assistant.io/components/radio_browser) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv) |
| [remote.broadlink](https://www.home-assistant.io/components/remote.broadlink) |
| [remote.harmony](https://www.home-assistant.io/components/remote.harmony) |
| [remote.xbox](https://www.home-assistant.io/components/remote.xbox) |
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
| [script](https://www.home-assistant.io/components/script) |
| [search](https://www.home-assistant.io/components/search) |
| [season](https://www.home-assistant.io/components/season) |
| [select](https://www.home-assistant.io/components/select) |
| [select.dyson_local](https://www.home-assistant.io/components/select.dyson_local) |
| [select.eufy_security](https://www.home-assistant.io/components/select.eufy_security) |
| [select.harmony](https://www.home-assistant.io/components/select.harmony) |
| [select.mqtt](https://www.home-assistant.io/components/select.mqtt) |
| [select.sensibo](https://www.home-assistant.io/components/select.sensibo) |
| [select.tuya](https://www.home-assistant.io/components/select.tuya) |
| [select.zha](https://www.home-assistant.io/components/select.zha) |
| [sensibo](https://www.home-assistant.io/components/sensibo) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [sensor.adguard](https://www.home-assistant.io/components/sensor.adguard) |
| [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries) |
| [sensor.aus_fuel](https://www.home-assistant.io/components/sensor.aus_fuel) |
| [sensor.authenticated](https://www.home-assistant.io/components/sensor.authenticated) |
| [sensor.average](https://www.home-assistant.io/components/sensor.average) |
| [sensor.blitzortung](https://www.home-assistant.io/components/sensor.blitzortung) |
| [sensor.broadlink](https://www.home-assistant.io/components/sensor.broadlink) |
| [sensor.bureau_of_meteorology](https://www.home-assistant.io/components/sensor.bureau_of_meteorology) |
| [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry) |
| [sensor.co2signal](https://www.home-assistant.io/components/sensor.co2signal) |
| [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line) |
| [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock) |
| [sensor.dwains_dashboard](https://www.home-assistant.io/components/sensor.dwains_dashboard) |
| [sensor.dyson_local](https://www.home-assistant.io/components/sensor.dyson_local) |
| [sensor.energy](https://www.home-assistant.io/components/sensor.energy) |
| [sensor.esphome](https://www.home-assistant.io/components/sensor.esphome) |
| [sensor.eufy_security](https://www.home-assistant.io/components/sensor.eufy_security) |
| [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser) |
| [sensor.forecast_solar](https://www.home-assistant.io/components/sensor.forecast_solar) |
| [sensor.formulaone_api](https://www.home-assistant.io/components/sensor.formulaone_api) |
| [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection) |
| [sensor.gdacs](https://www.home-assistant.io/components/sensor.gdacs) |
| [sensor.github](https://www.home-assistant.io/components/sensor.github) |
| [sensor.glances](https://www.home-assistant.io/components/sensor.glances) |
| [sensor.google_fit](https://www.home-assistant.io/components/sensor.google_fit) |
| [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs) |
| [sensor.hassio](https://www.home-assistant.io/components/sensor.hassio) |
| [sensor.hdhomerun](https://www.home-assistant.io/components/sensor.hdhomerun) |
| [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time) |
| [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk) |
| [sensor.ical](https://www.home-assistant.io/components/sensor.ical) |
| [sensor.integration](https://www.home-assistant.io/components/sensor.integration) |
| [sensor.ios](https://www.home-assistant.io/components/sensor.ios) |
| [sensor.launch_library](https://www.home-assistant.io/components/sensor.launch_library) |
| [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app) |
| [sensor.monitor_docker](https://www.home-assistant.io/components/sensor.monitor_docker) |
| [sensor.moon](https://www.home-assistant.io/components/sensor.moon) |
| [sensor.mqtt](https://www.home-assistant.io/components/sensor.mqtt) |
| [sensor.myjdownloader](https://www.home-assistant.io/components/sensor.myjdownloader) |
| [sensor.nfl](https://www.home-assistant.io/components/sensor.nfl) |
| [sensor.nhl](https://www.home-assistant.io/components/sensor.nhl) |
| [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered) |
| [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality) |
| [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station) |
| [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger) |
| [sensor.opennem](https://www.home-assistant.io/components/sensor.opennem) |
| [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv) |
| [sensor.plex](https://www.home-assistant.io/components/sensor.plex) |
| [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added) |
| [sensor.radarr](https://www.home-assistant.io/components/sensor.radarr) |
| [sensor.radarr_upcoming_media](https://www.home-assistant.io/components/sensor.radarr_upcoming_media) |
| [sensor.rest](https://www.home-assistant.io/components/sensor.rest) |
| [sensor.rocketlaunchlive](https://www.home-assistant.io/components/sensor.rocketlaunchlive) |
| [sensor.sabnzbd](https://www.home-assistant.io/components/sensor.sabnzbd) |
| [sensor.satellitetracker](https://www.home-assistant.io/components/sensor.satellitetracker) |
| [sensor.scrape](https://www.home-assistant.io/components/sensor.scrape) |
| [sensor.season](https://www.home-assistant.io/components/sensor.season) |
| [sensor.sensibo](https://www.home-assistant.io/components/sensor.sensibo) |
| [sensor.smartthinq_sensors](https://www.home-assistant.io/components/sensor.smartthinq_sensors) |
| [sensor.snmp](https://www.home-assistant.io/components/sensor.snmp) |
| [sensor.solcast_solar](https://www.home-assistant.io/components/sensor.solcast_solar) |
| [sensor.sonarr](https://www.home-assistant.io/components/sensor.sonarr) |
| [sensor.sonarr_upcoming_media](https://www.home-assistant.io/components/sensor.sonarr_upcoming_media) |
| [sensor.sonos](https://www.home-assistant.io/components/sensor.sonos) |
| [sensor.spacex](https://www.home-assistant.io/components/sensor.spacex) |
| [sensor.speedtestdotnet](https://www.home-assistant.io/components/sensor.speedtestdotnet) |
| [sensor.sql](https://www.home-assistant.io/components/sensor.sql) |
| [sensor.statistics](https://www.home-assistant.io/components/sensor.statistics) |
| [sensor.sun2](https://www.home-assistant.io/components/sensor.sun2) |
| [sensor.synology_dsm](https://www.home-assistant.io/components/sensor.synology_dsm) |
| [sensor.systemmonitor](https://www.home-assistant.io/components/sensor.systemmonitor) |
| [sensor.tautulli](https://www.home-assistant.io/components/sensor.tautulli) |
| [sensor.template](https://www.home-assistant.io/components/sensor.template) |
| [sensor.thermal_comfort](https://www.home-assistant.io/components/sensor.thermal_comfort) |
| [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date) |
| [sensor.tomorrowio](https://www.home-assistant.io/components/sensor.tomorrowio) |
| [sensor.trakt_tv](https://www.home-assistant.io/components/sensor.trakt_tv) |
| [sensor.transmission](https://www.home-assistant.io/components/sensor.transmission) |
| [sensor.transport_nsw](https://www.home-assistant.io/components/sensor.transport_nsw) |
| [sensor.tuya](https://www.home-assistant.io/components/sensor.tuya) |
| [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi) |
| [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway) |
| [sensor.untappd](https://www.home-assistant.io/components/sensor.untappd) |
| [sensor.upnp](https://www.home-assistant.io/components/sensor.upnp) |
| [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime) |
| [sensor.version](https://www.home-assistant.io/components/sensor.version) |
| [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi) |
| [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw) |
| [sensor.waze_travel_time](https://www.home-assistant.io/components/sensor.waze_travel_time) |
| [sensor.weatherflow](https://www.home-assistant.io/components/sensor.weatherflow) |
| [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock) |
| [sensor.xbox](https://www.home-assistant.io/components/sensor.xbox) |
| [sensor.yahoofinance](https://www.home-assistant.io/components/sensor.yahoofinance) |
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
| [spacex](https://www.home-assistant.io/components/spacex) |
| [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet) |
| [spotify](https://www.home-assistant.io/components/spotify) |
| [sql](https://www.home-assistant.io/components/sql) |
| [ssdp](https://www.home-assistant.io/components/ssdp) |
| [stream](https://www.home-assistant.io/components/stream) |
| [stt](https://www.home-assistant.io/components/stt) |
| [sun](https://www.home-assistant.io/components/sun) |
| [switch](https://www.home-assistant.io/components/switch) |
| [switch.adaptive_lighting](https://www.home-assistant.io/components/switch.adaptive_lighting) |
| [switch.adguard](https://www.home-assistant.io/components/switch.adguard) |
| [switch.broadlink](https://www.home-assistant.io/components/switch.broadlink) |
| [switch.dyson_local](https://www.home-assistant.io/components/switch.dyson_local) |
| [switch.eufy_security](https://www.home-assistant.io/components/switch.eufy_security) |
| [switch.harmony](https://www.home-assistant.io/components/switch.harmony) |
| [switch.monitor_docker](https://www.home-assistant.io/components/switch.monitor_docker) |
| [switch.mqtt](https://www.home-assistant.io/components/switch.mqtt) |
| [switch.myjdownloader](https://www.home-assistant.io/components/switch.myjdownloader) |
| [switch.nodered](https://www.home-assistant.io/components/switch.nodered) |
| [switch.smartthinq_sensors](https://www.home-assistant.io/components/switch.smartthinq_sensors) |
| [switch.sonos](https://www.home-assistant.io/components/switch.sonos) |
| [switch.synology_dsm](https://www.home-assistant.io/components/switch.synology_dsm) |
| [switch.template](https://www.home-assistant.io/components/switch.template) |
| [switch.transmission](https://www.home-assistant.io/components/switch.transmission) |
| [switch.tuya](https://www.home-assistant.io/components/switch.tuya) |
| [switch.unifi](https://www.home-assistant.io/components/switch.unifi) |
| [switch.zha](https://www.home-assistant.io/components/switch.zha) |
| [synology_dsm](https://www.home-assistant.io/components/synology_dsm) |
| [system_health](https://www.home-assistant.io/components/system_health) |
| [system_log](https://www.home-assistant.io/components/system_log) |
| [tag](https://www.home-assistant.io/components/tag) |
| [tautulli](https://www.home-assistant.io/components/tautulli) |
| [template](https://www.home-assistant.io/components/template) |
| [thermal_comfort](https://www.home-assistant.io/components/thermal_comfort) |
| [timer](https://www.home-assistant.io/components/timer) |
| [tomorrowio](https://www.home-assistant.io/components/tomorrowio) |
| [trace](https://www.home-assistant.io/components/trace) |
| [trakt_tv](https://www.home-assistant.io/components/trakt_tv) |
| [transmission](https://www.home-assistant.io/components/transmission) |
| [tts](https://www.home-assistant.io/components/tts) |
| [tts.cloud](https://www.home-assistant.io/components/tts.cloud) |
| [tts.google_translate](https://www.home-assistant.io/components/tts.google_translate) |
| [tuya](https://www.home-assistant.io/components/tuya) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [update](https://www.home-assistant.io/components/update) |
| [update.hacs](https://www.home-assistant.io/components/update.hacs) |
| [update.hassio](https://www.home-assistant.io/components/update.hassio) |
| [update.hdhomerun](https://www.home-assistant.io/components/update.hdhomerun) |
| [update.myjdownloader](https://www.home-assistant.io/components/update.myjdownloader) |
| [update.sensibo](https://www.home-assistant.io/components/update.sensibo) |
| [update.synology_dsm](https://www.home-assistant.io/components/update.synology_dsm) |
| [update.unifi](https://www.home-assistant.io/components/update.unifi) |
| [upnp](https://www.home-assistant.io/components/upnp) |
| [upnp_availability](https://www.home-assistant.io/components/upnp_availability) |
| [uptime](https://www.home-assistant.io/components/uptime) |
| [uptime_kuma](https://www.home-assistant.io/components/uptime_kuma) |
| [usb](https://www.home-assistant.io/components/usb) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [vacuum.mqtt](https://www.home-assistant.io/components/vacuum.mqtt) |
| [vacuum.tuya](https://www.home-assistant.io/components/vacuum.tuya) |
| [version](https://www.home-assistant.io/components/version) |
| [watchman](https://www.home-assistant.io/components/watchman) |
| [waze_travel_time](https://www.home-assistant.io/components/waze_travel_time) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weather.bureau_of_meteorology](https://www.home-assistant.io/components/weather.bureau_of_meteorology) |
| [weather.darksky](https://www.home-assistant.io/components/weather.darksky) |
| [weather.template](https://www.home-assistant.io/components/weather.template) |
| [weather.tomorrowio](https://www.home-assistant.io/components/weather.tomorrowio) |
| [weather.weatherflow](https://www.home-assistant.io/components/weather.weatherflow) |
| [weatherflow](https://www.home-assistant.io/components/weatherflow) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
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
- [Australia Fuel Prices](https://github.com/tonymyatt/homeassistant-custom-components)
- [Authenticated](https://github.com/custom-components/authenticated)
- [Average Sensor](https://github.com/Limych/ha-average)
- [Blitzortung](https://github.com/mrk-its/homeassistant-blitzortung)
- [Bureau of Meteorology](https://github.com/bremor/bureau_of_meteorology)
- [Doomsday Clock](https://github.com/renemarc/home-assistant-doomsday-clock)
- [Dwains Dashboard](https://dwainscheeren.github.io/dwains-lovelace-dashboard/)
- [Dyson Local](https://github.com/shenxn/ha-dyson)
- [Eufy Security](https://github.com/fuatakgun/eufy_security)
- [Favicon changer](https://github.com/thomasloven/hass-favicon)
- [Feedparser](https://github.com/custom-components/feedparser/blob/master/README.md)
- [Fontawesome icons](https://github.com/thomasloven/hass-fontawesome)
- [Formula One API](https://github.com/delzear/hass-formulaoneapi)
- [Garbage Collection](https://github.com/bruxy70/Garbage-Collection/)
- [Generate readme](https://github.com/custom-components/readme)
- [Google Fit](https://github.com/cyberjunky/home-assistant-google_fit)
- [HACS](https://hacs.xyz/docs/configuration/start)
- [HDHomeRun](https://github.com/uvjim/hass_hdhomerun)
- [Holidays](https://github.com/bruxy70/Holidays/)
- [HomeAssistant Cupertino Icons](https://github.com/menahishayan/HomeAssistant-Cupertino-Icons)
- [ical Sensor](https://www.home-assistant.io/integrations/ical)
- [Indoor Air Quality UK Index](https://github.com/Limych/ha-iaquk)
- [Monitor Docker](https://github.com/ualex73/monitor_docker)
- [MyJDownloader](https://github.com/doudz/homeassistant-myjdownloader)
- [NFL](https://github.com/zacs/ha_nfl)
- [NHL](https://github.com/simplysynced/ha_nhl)
- [Node-RED Companion](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/custom_integration/)
- [NSW Air Quality]()
- [NSW Rural Fire Service - Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger)
- [OpenNEM](https://github.com/bacco007/sensor.opennem)
- [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Pyscript Python scripting](https://github.com/custom-components/pyscript)
- [Radarr](https://www.home-assistant.io/integrations/radarr)
- [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Rocket Launch Live - Next 5 Launches](https://github.com/djtimca/harocketlaunchlive)
- [SamsungTV Smart](https://github.com/ollo69/ha-samsungtv-smart)
- [Satellite Tracker (N2YO)](https://github.com/djtimca/hasatellitetracker)
- [Simple Icons](https://github.com/vigonotion/hass-simpleicons)
- [SmartThinQ LGE Sensors](https://github.com/ollo69/ha-smartthinq-sensors)
- [Solcast PV Forecast](https://github.com/oziee/ha-solcast-solar)
- [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [SpaceX Launches and Starman](https://github.com/djtimca/haspacex)
- [Sun2](https://github.com/pnbruckner/ha-sun2/blob/master/README.md)
- [Thermal Comfort](https://github.com/dolezsa/thermal_comfort/blob/master/README.md)
- [Trakt](https://github.com/dylandoamaral/trakt-integration)
- [UniFi Gateway](https://github.com/custom-components/sensor.unifigateway)
- [Untappd](https://github.com/custom-components/sensor.untappd/blob/master/README.md)
- [UPnP Availability Sensor](https://github.com/rytilahti/homeassistant-upnp-availability/)
- [Uptime Kuma](None)
- [Watchman](https://github.com/dummylabs/thewatchman)
- [Water NSW](https://github.com/bacco007/sensor.waternsw)
- [WeatherFlow Weather](https://github.com/briis/hass-weatherflow)
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

### Addon Repositories

- https://github.com/briis/hass-weatherflow2mqtt
- https://github.com/esphome/hassio
- https://github.com/fuatakgun/eufy_security_addon
- https://github.com/fuatakgun/rtsp_simple_server
- https://github.com/hassio-addons/repository
- https://github.com/MickMake/HomeAssistantAddons
- https://github.com/Poeschl/Hassio-Addons
- https://github.com/sabeechen/hassio-google-drive-backup
- https://github.com/Ulrar/hassio-addons
- https://github.com/zigbee2mqtt/hassio-zigbee2mqtt


### Addons

Here are the addons I use inside Hass.io, some of the other things I run can be done inside Hass.io, but I've elected not to do so.- [ESPHome]()
- [Eufy Security Add-on]()
- [Glances]()
- [GoSungrow]()
- [Home Assistant Git Exporter]()
- [Home Assistant Google Drive Backup]()
- [JupyterLab]()
- [MariaDB](https://github.com/home-assistant/hassio-addons/tree/master/mariadb)
- [Mosquitto broker]()
- [Node-RED]()
- [phpMyAdmin]()
- [Portainer]()
- [RTSP Simple Server Add-on]()
- [Samba share](https://github.com/home-assistant/hassio-addons/tree/master/samba)
- [SSH & Web Terminal]()
- [Syncthing]()
- [WeatherFlow to MQTT]()
- [Zigbee2mqtt]()


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