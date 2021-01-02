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
      - [HACS - Integrations](#hacs---integrations)
      - [HACS - Lovelace Cards](#hacs---lovelace-cards)
      - [HACS - Themes](#hacs---themes)
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

_Stats as at 05:00, Saturday, January 2nd 2021_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 2020.12.1 | 275     | 2749         | 2292 | 53 |

Type | Qty
-- | --
Alarm Control Panel | 0
Alert | 0
Automation | 53
Binary Sensor | 71
Camera | 1
Device Tracker | 99
Group | 8
Input Boolean | 0
Input Datetime | 0
Input Text | 0
Light | 4
Media Player | 34
Person | 1
Scene | 1
Script | 2
Sensor | 2292
Sun | 1
Switch | 118
Weather | 3
Zone | 3

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)

<details>
<summary>Expand Integrations List</summary>

| Name |
| --- |
| [air_quality](https://www.home-assistant.io/components/air_quality) |
| [air_quality.dyson](https://www.home-assistant.io/components/air_quality.dyson) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alarm_control_panel.alexa_media](https://www.home-assistant.io/components/alarm_control_panel.alexa_media) |
| [alexa](https://www.home-assistant.io/components/alexa) |
| [alexa_media](https://www.home-assistant.io/components/alexa_media) |
| [amber_electric](https://www.home-assistant.io/components/amber_electric) |
| [anniversaries](https://www.home-assistant.io/components/anniversaries) |
| [api](https://www.home-assistant.io/components/api) |
| [apple_tv](https://www.home-assistant.io/components/apple_tv) |
| [auth](https://www.home-assistant.io/components/auth) |
| [automation](https://www.home-assistant.io/components/automation) |
| [binary_sensor](https://www.home-assistant.io/components/binary_sensor) |
| [binary_sensor.browser_mod](https://www.home-assistant.io/components/binary_sensor.browser_mod) |
| [binary_sensor.cloud](https://www.home-assistant.io/components/binary_sensor.cloud) |
| [binary_sensor.deconz](https://www.home-assistant.io/components/binary_sensor.deconz) |
| [binary_sensor.esphome](https://www.home-assistant.io/components/binary_sensor.esphome) |
| [binary_sensor.iss](https://www.home-assistant.io/components/binary_sensor.iss) |
| [binary_sensor.mobile_app](https://www.home-assistant.io/components/binary_sensor.mobile_app) |
| [binary_sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/binary_sensor.nsw_rural_fire_service_fire_danger) |
| [binary_sensor.openuv](https://www.home-assistant.io/components/binary_sensor.openuv) |
| [binary_sensor.pi_hole](https://www.home-assistant.io/components/binary_sensor.pi_hole) |
| [binary_sensor.proxmoxve](https://www.home-assistant.io/components/binary_sensor.proxmoxve) |
| [binary_sensor.smartthinq_sensors](https://www.home-assistant.io/components/binary_sensor.smartthinq_sensors) |
| [binary_sensor.spacex](https://www.home-assistant.io/components/binary_sensor.spacex) |
| [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2) |
| [binary_sensor.synology_dsm](https://www.home-assistant.io/components/binary_sensor.synology_dsm) |
| [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template) |
| [binary_sensor.threshold](https://www.home-assistant.io/components/binary_sensor.threshold) |
| [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod) |
| [binary_sensor.updater](https://www.home-assistant.io/components/binary_sensor.updater) |
| [binary_sensor.xbox](https://www.home-assistant.io/components/binary_sensor.xbox) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [breaking_changes](https://www.home-assistant.io/components/breaking_changes) |
| [browser_mod](https://www.home-assistant.io/components/browser_mod) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [calendar.garbage_collection](https://www.home-assistant.io/components/calendar.garbage_collection) |
| [calendar.google](https://www.home-assistant.io/components/calendar.google) |
| [camera](https://www.home-assistant.io/components/camera) |
| [camera.browser_mod](https://www.home-assistant.io/components/camera.browser_mod) |
| [camera.ha_skyfield](https://www.home-assistant.io/components/camera.ha_skyfield) |
| [camera.synology_dsm](https://www.home-assistant.io/components/camera.synology_dsm) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [climate](https://www.home-assistant.io/components/climate) |
| [climate.deconz](https://www.home-assistant.io/components/climate.deconz) |
| [climate.dyson](https://www.home-assistant.io/components/climate.dyson) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [config](https://www.home-assistant.io/components/config) |
| [configurator](https://www.home-assistant.io/components/configurator) |
| [coronavirus](https://www.home-assistant.io/components/coronavirus) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cover.deconz](https://www.home-assistant.io/components/cover.deconz) |
| [deconz](https://www.home-assistant.io/components/deconz) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app) |
| [device_tracker.tile](https://www.home-assistant.io/components/device_tracker.tile) |
| [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi) |
| [discovery](https://www.home-assistant.io/components/discovery) |
| [dwains_dashboard](https://www.home-assistant.io/components/dwains_dashboard) |
| [dyson](https://www.home-assistant.io/components/dyson) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fan.deconz](https://www.home-assistant.io/components/fan.deconz) |
| [fan.dyson](https://www.home-assistant.io/components/fan.dyson) |
| [favicon](https://www.home-assistant.io/components/favicon) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [folder_watcher](https://www.home-assistant.io/components/folder_watcher) |
| [foldingathomecontrol](https://www.home-assistant.io/components/foldingathomecontrol) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [geo_location.blitzortung](https://www.home-assistant.io/components/geo_location.blitzortung) |
| [geo_location.gdacs](https://www.home-assistant.io/components/geo_location.gdacs) |
| [geo_location.nsw_rural_fire_service_feed](https://www.home-assistant.io/components/geo_location.nsw_rural_fire_service_feed) |
| [glances](https://www.home-assistant.io/components/glances) |
| [google](https://www.home-assistant.io/components/google) |
| [group](https://www.home-assistant.io/components/group) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [history](https://www.home-assistant.io/components/history) |
| [homeassistant](https://www.home-assistant.io/components/homeassistant) |
| [homekit](https://www.home-assistant.io/components/homekit) |
| [homekit_controller](https://www.home-assistant.io/components/homekit_controller) |
| [http](https://www.home-assistant.io/components/http) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [ifttt](https://www.home-assistant.io/components/ifttt) |
| [image](https://www.home-assistant.io/components/image) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [ios](https://www.home-assistant.io/components/ios) |
| [lifx](https://www.home-assistant.io/components/lifx) |
| [light](https://www.home-assistant.io/components/light) |
| [light.browser_mod](https://www.home-assistant.io/components/light.browser_mod) |
| [light.deconz](https://www.home-assistant.io/components/light.deconz) |
| [light.lifx](https://www.home-assistant.io/components/light.lifx) |
| [lock](https://www.home-assistant.io/components/lock) |
| [lock.deconz](https://www.home-assistant.io/components/lock.deconz) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [map](https://www.home-assistant.io/components/map) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_player.alexa_media](https://www.home-assistant.io/components/media_player.alexa_media) |
| [media_player.androidtv](https://www.home-assistant.io/components/media_player.androidtv) |
| [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv) |
| [media_player.browser_mod](https://www.home-assistant.io/components/media_player.browser_mod) |
| [media_player.cast](https://www.home-assistant.io/components/media_player.cast) |
| [media_player.plex](https://www.home-assistant.io/components/media_player.plex) |
| [media_player.samsungtv](https://www.home-assistant.io/components/media_player.samsungtv) |
| [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos) |
| [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify) |
| [media_player.xbox](https://www.home-assistant.io/components/media_player.xbox) |
| [met](https://www.home-assistant.io/components/met) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [notify](https://www.home-assistant.io/components/notify) |
| [notify.alexa_media](https://www.home-assistant.io/components/notify.alexa_media) |
| [notify.ios](https://www.home-assistant.io/components/notify.ios) |
| [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app) |
| [notify.slack](https://www.home-assistant.io/components/notify.slack) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [panel_iframe](https://www.home-assistant.io/components/panel_iframe) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [pi_hole](https://www.home-assistant.io/components/pi_hole) |
| [plex](https://www.home-assistant.io/components/plex) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv) |
| [remote.harmony](https://www.home-assistant.io/components/remote.harmony) |
| [remote.xbox](https://www.home-assistant.io/components/remote.xbox) |
| [sabnzbd](https://www.home-assistant.io/components/sabnzbd) |
| [samsungtv](https://www.home-assistant.io/components/samsungtv) |
| [satellitetracker](https://www.home-assistant.io/components/satellitetracker) |
| [scene](https://www.home-assistant.io/components/scene) |
| [scene.deconz](https://www.home-assistant.io/components/scene.deconz) |
| [scene.homeassistant](https://www.home-assistant.io/components/scene.homeassistant) |
| [script](https://www.home-assistant.io/components/script) |
| [search](https://www.home-assistant.io/components/search) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [sensor.alexa_media](https://www.home-assistant.io/components/sensor.alexa_media) |
| [sensor.amber_electric](https://www.home-assistant.io/components/sensor.amber_electric) |
| [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries) |
| [sensor.average](https://www.home-assistant.io/components/sensor.average) |
| [sensor.blitzortung](https://www.home-assistant.io/components/sensor.blitzortung) |
| [sensor.breaking_changes](https://www.home-assistant.io/components/sensor.breaking_changes) |
| [sensor.browser_mod](https://www.home-assistant.io/components/sensor.browser_mod) |
| [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry) |
| [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line) |
| [sensor.coronavirus](https://www.home-assistant.io/components/sensor.coronavirus) |
| [sensor.covid19_nswhealth](https://www.home-assistant.io/components/sensor.covid19_nswhealth) |
| [sensor.covid19_nswhealth_tests](https://www.home-assistant.io/components/sensor.covid19_nswhealth_tests) |
| [sensor.deconz](https://www.home-assistant.io/components/sensor.deconz) |
| [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock) |
| [sensor.dwains_dashboard](https://www.home-assistant.io/components/sensor.dwains_dashboard) |
| [sensor.dyson](https://www.home-assistant.io/components/sensor.dyson) |
| [sensor.esphome](https://www.home-assistant.io/components/sensor.esphome) |
| [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser) |
| [sensor.foldingathomecontrol](https://www.home-assistant.io/components/sensor.foldingathomecontrol) |
| [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection) |
| [sensor.gdacs](https://www.home-assistant.io/components/sensor.gdacs) |
| [sensor.glances](https://www.home-assistant.io/components/sensor.glances) |
| [sensor.google_fit](https://www.home-assistant.io/components/sensor.google_fit) |
| [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs) |
| [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time) |
| [sensor.homekit_controller](https://www.home-assistant.io/components/sensor.homekit_controller) |
| [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk) |
| [sensor.ios](https://www.home-assistant.io/components/sensor.ios) |
| [sensor.launch_library](https://www.home-assistant.io/components/sensor.launch_library) |
| [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app) |
| [sensor.monitor_docker](https://www.home-assistant.io/components/sensor.monitor_docker) |
| [sensor.moon](https://www.home-assistant.io/components/sensor.moon) |
| [sensor.mqtt](https://www.home-assistant.io/components/sensor.mqtt) |
| [sensor.my_unifi](https://www.home-assistant.io/components/sensor.my_unifi) |
| [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered) |
| [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality) |
| [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station) |
| [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger) |
| [sensor.opennem](https://www.home-assistant.io/components/sensor.opennem) |
| [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv) |
| [sensor.pi_hole](https://www.home-assistant.io/components/sensor.pi_hole) |
| [sensor.plex](https://www.home-assistant.io/components/sensor.plex) |
| [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added) |
| [sensor.radarr](https://www.home-assistant.io/components/sensor.radarr) |
| [sensor.radarr_upcoming_media](https://www.home-assistant.io/components/sensor.radarr_upcoming_media) |
| [sensor.rest](https://www.home-assistant.io/components/sensor.rest) |
| [sensor.sabnzbd](https://www.home-assistant.io/components/sensor.sabnzbd) |
| [sensor.satellitetracker](https://www.home-assistant.io/components/sensor.satellitetracker) |
| [sensor.season](https://www.home-assistant.io/components/sensor.season) |
| [sensor.smartthinq_sensors](https://www.home-assistant.io/components/sensor.smartthinq_sensors) |
| [sensor.snmp](https://www.home-assistant.io/components/sensor.snmp) |
| [sensor.sonarr](https://www.home-assistant.io/components/sensor.sonarr) |
| [sensor.sonarr_upcoming_media](https://www.home-assistant.io/components/sensor.sonarr_upcoming_media) |
| [sensor.spacex](https://www.home-assistant.io/components/sensor.spacex) |
| [sensor.speedtestdotnet](https://www.home-assistant.io/components/sensor.speedtestdotnet) |
| [sensor.sql](https://www.home-assistant.io/components/sensor.sql) |
| [sensor.statistics](https://www.home-assistant.io/components/sensor.statistics) |
| [sensor.sun2](https://www.home-assistant.io/components/sensor.sun2) |
| [sensor.synology_dsm](https://www.home-assistant.io/components/sensor.synology_dsm) |
| [sensor.systemmonitor](https://www.home-assistant.io/components/sensor.systemmonitor) |
| [sensor.tautulli](https://www.home-assistant.io/components/sensor.tautulli) |
| [sensor.template](https://www.home-assistant.io/components/sensor.template) |
| [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date) |
| [sensor.transmission](https://www.home-assistant.io/components/sensor.transmission) |
| [sensor.transport_nsw](https://www.home-assistant.io/components/sensor.transport_nsw) |
| [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi) |
| [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway) |
| [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime) |
| [sensor.version](https://www.home-assistant.io/components/sensor.version) |
| [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi) |
| [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw) |
| [sensor.waze_travel_time](https://www.home-assistant.io/components/sensor.waze_travel_time) |
| [sensor.websocket_api](https://www.home-assistant.io/components/sensor.websocket_api) |
| [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock) |
| [sensor.xbox](https://www.home-assistant.io/components/sensor.xbox) |
| [sensor.yahoofinance](https://www.home-assistant.io/components/sensor.yahoofinance) |
| [simpleicons](https://www.home-assistant.io/components/simpleicons) |
| [smartthinq_sensors](https://www.home-assistant.io/components/smartthinq_sensors) |
| [sonarr](https://www.home-assistant.io/components/sonarr) |
| [sonos](https://www.home-assistant.io/components/sonos) |
| [spacex](https://www.home-assistant.io/components/spacex) |
| [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet) |
| [spotcast](https://www.home-assistant.io/components/spotcast) |
| [spotify](https://www.home-assistant.io/components/spotify) |
| [ssdp](https://www.home-assistant.io/components/ssdp) |
| [stt](https://www.home-assistant.io/components/stt) |
| [sun](https://www.home-assistant.io/components/sun) |
| [switch](https://www.home-assistant.io/components/switch) |
| [switch.alexa_media](https://www.home-assistant.io/components/switch.alexa_media) |
| [switch.command_line](https://www.home-assistant.io/components/switch.command_line) |
| [switch.deconz](https://www.home-assistant.io/components/switch.deconz) |
| [switch.esphome](https://www.home-assistant.io/components/switch.esphome) |
| [switch.monitor_docker](https://www.home-assistant.io/components/switch.monitor_docker) |
| [switch.nodered](https://www.home-assistant.io/components/switch.nodered) |
| [switch.synology_dsm](https://www.home-assistant.io/components/switch.synology_dsm) |
| [switch.template](https://www.home-assistant.io/components/switch.template) |
| [switch.transmission](https://www.home-assistant.io/components/switch.transmission) |
| [switch.unifi](https://www.home-assistant.io/components/switch.unifi) |
| [synology_dsm](https://www.home-assistant.io/components/synology_dsm) |
| [system_health](https://www.home-assistant.io/components/system_health) |
| [system_log](https://www.home-assistant.io/components/system_log) |
| [tag](https://www.home-assistant.io/components/tag) |
| [tile](https://www.home-assistant.io/components/tile) |
| [transmission](https://www.home-assistant.io/components/transmission) |
| [tts](https://www.home-assistant.io/components/tts) |
| [uilogs](https://www.home-assistant.io/components/uilogs) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [updater](https://www.home-assistant.io/components/updater) |
| [upnp](https://www.home-assistant.io/components/upnp) |
| [vacuum](https://www.home-assistant.io/components/vacuum) |
| [vacuum.dyson](https://www.home-assistant.io/components/vacuum.dyson) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weather.bureau_of_meteorology](https://www.home-assistant.io/components/weather.bureau_of_meteorology) |
| [weather.darksky](https://www.home-assistant.io/components/weather.darksky) |
| [weather.met](https://www.home-assistant.io/components/weather.met) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
| [xbox](https://www.home-assistant.io/components/xbox) |
| [zeroconf](https://www.home-assistant.io/components/zeroconf) |
| [zha](https://www.home-assistant.io/components/zha) |
| [zone](https://www.home-assistant.io/components/zone) |
</details>

### Custom Components Used

<details>
<summary>Expand Custom Components List</summary>

- [Alexa Media Player](https://github.com/custom-components/alexa_media_player/wiki)
- [Amber Electric](https://www.home-assistant.io/integrations/amber_electric)
- [Amber Electric](https://www.home-assistant.io/integrations/bom)
- [Anniversaries](https://github.com/pinkywafer/Anniversaries)
- [Average](https://github.com/Limych/ha-average)
- [Blitzortung](https://github.com/mrk-its/homeassistant-blitzortung)
- [Breaking Changes](https://github.com/custom-components/breaking_changes)
- [Browser mod]()
- [Bureau of Meteorology](https://github.com/bremor/bureau_of_meteorology)
- [Climacell weather](https://gitlab.com/rrenato/ha-climacell-weather)
- [COVID-19 NSW Health]()
- [COVID-19 NSW Health Tests]()
- [Doomsday Clock](https://github.com/renemarc/home-assistant-doomsday-clock)
- [Dwains Dashboard](https://dwainscheeren.github.io/dwains-lovelace-dashboard/)
- [Favicon changer]()
- [Feedparser](https://github.com/custom-components/feedparser/blob/master/README.md)
- [Folding@HomeControl](https://github.com/eifinger/hass-foldingathomecontrol)
- [Garbage Collection](https://github.com/bruxy70/Garbage-Collection/)
- [Generate readme](https://github.com/custom-components/readme)
- [Google Fit]()
- [HA Dockermon](https://github.com/custom-components/switch.hadockermon)
- [HACS](https://hacs.xyz/docs/configuration/start)
- [IAQ UK](https://github.com/Limych/ha-iaquk)
- [iCloud3 Device Tracker](https://gcobb321.github.io/icloud3_dev/#/)
- [Monitor Docker](https://github.com/ualex73/monitor_docker)
- [MyJDownloader](https://www.home-assistant.io/integrations/myjdownloader)
- [Node-RED](https://github.com/zachowj/node-red)
- [NSW Air Quality]()
- [NSW Rural Fire Service - Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger)
- [OpenNEM](https://github.com/bacco007/sensor.opennem)
- [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Polar plots of the sun, moon, and planets](https://github.com/partofthething/ha_skyfield)
- [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Satellite Tracker (N2YO)](https://github.com/djtimca/hasatellitetracker)
- [Simple Icons]()
- [SmartThinQ LGE Sensors](https://github.com/ollo69/ha-smartthinq-sensors)
- [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [SpaceX Launches and Starman](https://github.com/djtimca/haspacex)
- [Start Spotify on chromecast](https://github.com/fondberg/spotcast)
- [Sun2](https://github.com/pnbruckner/ha-sun2/blob/master/README.md)
- [UI Logs](https://github.com/custom-components/uilogs)
- [UniFi Gateway](https://github.com/custom-components/sensor.unifigateway)
- [Water NSW](https://github.com/bacco007/sensor.waternsw)
- [Yahoo Finance](https://github.com/iprak/yahoofinance)
- [ZHA Network Map](https://github.com/zha-ng/zha-map)</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

#### HACS - Integrations

| Name | Description |
| --- | ---|
| [Alexa Media Player](https://github.com/custom-components/alexa_media_player) | This is a custom component to allow control of Amazon Alexa devices in Home Assistant using the unofficial Alexa API. |
| [Amber Electric](https://github.com/troykelly/hacs-amberelectric) | Unofficial Amber Electric integration for Home Assistant |
| [Anniversaries](https://github.com/pinkywafer/Anniversaries) | Anniversary Countdown Sensor for Home Assistant |
| [Average Sensor](https://github.com/Limych/ha-average) | Average Sensor for Home Assistant |
| [Blitzortung.Org Lightning Detector](https://github.com/mrk-its/homeassistant-blitzortung) | Custom Component for fetching lightning data from blitzortung.org |
| [Breaking Changes](https://github.com/custom-components/breaking_changes) | Component to show potential breaking_changes in the current published version based on your loaded components |
| [Browser Mod](https://github.com/thomasloven/hass-browser_mod) | 🔹 A Home Assistant integration to turn your browser into a controllable entity - and also an audio player |
| [Bureau Of Meteorology](https://github.com/bremor/bureau_of_meteorology) | Custom component for retrieving weather information from the Bureau of Meteorology. |
| [Climacell Weather Provider](https://github.com/r-renato/ha-climacell-weather) | Climacell weather provider integration is a custom component for Home Assistant. The climacell platform uses the Climacell API as a source for meteorological data for your location. |
| [Feedparser](https://github.com/custom-components/feedparser) | 📰 RSS Feed Integration |
| [Folding@Homecontrol](https://github.com/eifinger/hass-foldingathomecontrol) | Homeassistant integration for FoldingAtHomeControl |
| [Garbage Collection](https://github.com/bruxy70/Garbage-Collection) | 🗑 Custom Home Assistant sensor for scheduling garbage collection (or other regularly re-occurring events - weekly on given days, semi-weekly or monthly) |
| [Ha Sun2](https://github.com/pnbruckner/ha-sun2) | Home Assistant Sun2 Sensor |
| [HACS](https://github.com/hacs/integration) | HACS gives you a powerful UI to handle downloads of all your custom needs. |
| [Hass Amber Electric](https://github.com/lewisbenge/hass-amber-electric) | Home Assistant Component to pull the latest energy prices from Amber Electric |
| [Hass Favicon](https://github.com/thomasloven/hass-favicon) | 🔹 Change the favicon of your Home Assistant instance |
| [Icloud3 Device Tracker](https://github.com/gcobb321/icloud3) | iCloud3 is a device_tracker custom_component for iPhones, iPads & iWatches that monitors zone & location events triggered by the HA iOS Companion App |
| [Indoor Air Quality Uk Index](https://github.com/Limych/ha-iaquk) | Indoor Air Quality Sensor Component for Home Assistant |
| [Monitor Docker](https://github.com/ualex73/monitor_docker) | Monitor Docker containers from Home Assistant |
| [Myjdownloader](https://github.com/doudz/homeassistant-myjdownloader) | myjdownloader integration for home assistant |
| [Node Red](https://github.com/zachowj/hass-node-red) | Companion Component for node-red-contrib-home-assistant-websocket to help integrate Node-RED with Home Assistant Core |
| [Nsw Rural Fire Service   Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger) | Home Assistant Custom Component: NSW Rural Fire Service Fire Danger |
| [Opennem (Au) Data](https://github.com/bacco007/sensor.opennem) | OpenNEM Sensor for Home Assistant |
| [Readme](https://github.com/custom-components/readme) | Use Jinja and data from Home Assistant to generate your README.md file |
| [Satellite Tracker (N2Yo)](https://github.com/djtimca/hasatellitetracker) | Using the N2YO API, this Home Assistant integration will provide visible satellite passes (general) and to add specific satellites for monitoring. |
| [Sensor.Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added) | ▶️ Plex component to feed Upcoming Media Card. |
| [Sensor.Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media) | 🎬 Radarr component to feed Upcoming Media Card. |
| [Sensor.Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media) | 📺 Sonarr component to feed Upcoming Media Card. |
| [Sensor.Unifigateway](https://github.com/custom-components/sensor.unifigateway) | High level health status of UniFi Security Gateway devices via UniFi Controller |
| [Simpleicons](https://github.com/vigonotion/hass-simpleicons) | Use Simple Icons in Home Assistant |
| [Skyfield Panel With Sun, Moon, And Planets](https://github.com/partofthething/ha_skyfield) | See the apparent positions of the Sun, Moon, and planets in this home assistant custom component |
| [Smartthinq Lge Sensors](https://github.com/ollo69/ha-smartthinq-sensors) | Home Assistant custom integration for SmartThinQ LG devices configurable with Lovelace User Interface. |
| [Spacex Next Launch And Starman](https://github.com/djtimca/HASpaceX) | Home Assistant integration for SpaceX Next Launch and Starman data. |
| [Spotcast](https://github.com/fondberg/spotcast) | Home assistant custom component to start Spotify playback on an idle chromecast device |
| [Ui Logs](https://github.com/custom-components/uilogs) | Custom panel that show colorful logs for Home Assistant (core), and the supervisor (if you have it). |
| [Waternsw Real Time Data](https://github.com/bacco007/sensor.waternsw) | Home Assistant Sensor for WaterNSW Real Time Data |
| [Yahoo Finance](https://github.com/iprak/yahoofinance) | Home Assistant component which allows you to get stock updates from Yahoo finance. |
| [ZHA-MAP](https://github.com/zha-ng/zha-map) | Build ZHA network topology map. |

#### HACS - Lovelace Cards

| Name | Description |
| --- | ---|
| [Atomic Calendar Revive](https://github.com/marksie1988/atomic-calendar-revive) | Custom calendar card for Home Assistant with Lovelace |
| [Auto Entities](https://github.com/thomasloven/lovelace-auto-entities) | 🔹Automatically populate the entities-list of lovelace cards |
| [Bar Card](https://github.com/custom-cards/bar-card) | Customizable Animated Bar card for Home Assistant Lovelace |
| [Bom Radar Card](https://github.com/theOzzieRat/bom-radar-card) | A rain radar card using the new tiled images from the Australian BOM |
| [Bom Weather Card](https://github.com/DavidFW1960/bom-weather-card) | Custom BOM Australia Animated Weather Card |
| [Button Card](https://github.com/custom-cards/button-card) | ❇️ Lovelace button-card for home assistant |
| [Button Text Card](https://github.com/Savjee/button-text-card) | Custom, "neumorphism" Lovelace card |
| [Card Mod](https://github.com/thomasloven/lovelace-card-mod) | 🔹 Add CSS styles to (almost) any lovelace card |
| [Card Tools](https://github.com/thomasloven/lovelace-card-tools) | 🔹A collection of tools for other lovelace plugins to use |
| [Compass Card](https://github.com/tomvanswam/compass-card) | A Lovelace card that shows a directional indicator on a compass for Home Assistant |
| [Config Template Card](https://github.com/iantrich/config-template-card) | 📝 Templatable Lovelace Configurations |
| [Flex Table   Highly Customizable, Data Visualization](https://github.com/custom-cards/flex-table-card) | Highly Flexible Lovelace Card - arbitrary contents/columns/rows, regex matched, perfect to show appdaemon created content and anything breaking out of the entity_id + attributes concept |
| [Flexible Horseshoe Card For Lovelace](https://github.com/Lau-ie/flex-horseshoe-card) | Flexible Horseshoe card for Home Assistant Lovelace UI. A card with a flexible layout,  a horseshoe-like donut graph, multiple entities or attributes, graphics and animations! |
| [Fold Entity Row](https://github.com/thomasloven/lovelace-fold-entity-row) | 🔹 A foldable row for entities card, containing other rows |
| [Light Entity Card](https://github.com/ljmerza/light-entity-card) | Control any light or switch entity |
| [List Card](https://github.com/iantrich/list-card) | 📰 Display sensor list data in a table |
| [Mini Graph Card](https://github.com/kalkih/mini-graph-card) | Minimalistic graph card for Home Assistant Lovelace UI |
| [Mini Media Player](https://github.com/kalkih/mini-media-player) | Minimalistic media card for Home Assistant Lovelace UI |
| [More Info Card](https://github.com/thomasloven/lovelace-more-info-card) | 🔹 Display the more-info dialog of any entity as a lovelace card |
| [Multiple Entity Row](https://github.com/benct/lovelace-multiple-entity-row) | Show multiple entity states and attributes on entity rows in Home Assistant's Lovelace UI |
| [Secondaryinfo Entity Row](https://github.com/custom-cards/secondaryinfo-entity-row) | Custom entity row for HomeAssistant, providing additional types of data to be displayed in the secondary info area of the Lovelace Entities card |
| [Slider Entity Row](https://github.com/thomasloven/lovelace-slider-entity-row) | 🔹 Add sliders to entity cards |
| [Spotify Lovelace Card](https://github.com/custom-cards/spotify-card) | Spotify playlist card for Home Assistant card |
| [Stack In Card](https://github.com/custom-cards/stack-in-card) | 🛠 group multiple cards into one card without the borders |
| [State Switch](https://github.com/thomasloven/lovelace-state-switch) | 🔹Dynamically replace lovelace cards depending on occasion |
| [Sun Card](https://github.com/mishaaq/sun-card) | Lovelace card for sun component - Home Assistant |

#### HACS - Themes

| Name | Description |
| --- | ---|

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

- https://github.com/danielwelch/hassio-zigbee2mqtt
- https://github.com/esphome/hassio
- https://github.com/hassio-addons/repository
- https://github.com/OpenXbox/xboxone-home-assistant
- https://github.com/sabeechen/hassio-google-drive-backup


### Addons

Here are the addons I use inside Hass.io, some of the other things I run can be done inside Hass.io, but I've elected not to do so.- [ADB - Android Debug Bridge]()
- [AppDaemon 4]()
- [ESPHome]()
- [Glances]()
- [Home Assistant Google Drive Backup]()
- [JupyterLab Lite]()
- [MariaDB](https://github.com/home-assistant/hassio-addons/tree/master/mariadb)
- [Mosquitto broker]()
- [Node-RED]()
- [phpMyAdmin]()
- [Portainer]()
- [Samba share](https://github.com/home-assistant/hassio-addons/tree/master/samba)
- [SSH & Web Terminal]()


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