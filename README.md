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

_Stats as at 05:00, Saturday, July 17th 2021_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 2021.7.2 | 341     | 2264         | 1681 | 84 |

Type | Qty
-- | --
Alarm Control Panel | 0
Alert | 0
Automation | 84
Binary Sensor | 191
Camera | 4
Device Tracker | 68
Group | 10
Input Boolean | 0
Input Datetime | 0
Input Text | 3
Light | 4
Media Player | 29
Person | 1
Scene | 1
Script | 4
Sensor | 1681
Sun | 1
Switch | 114
Weather | 7
Zone | 10

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)

<details>
<summary>Expand Integrations List</summary>

| Name |
| --- |
| [air_quality](https://www.home-assistant.io/components/air_quality) |
| [air_quality.dyson_local](https://www.home-assistant.io/components/air_quality.dyson_local) |
| [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel) |
| [alarm_control_panel.alexa_media](https://www.home-assistant.io/components/alarm_control_panel.alexa_media) |
| [alarm_control_panel.deconz](https://www.home-assistant.io/components/alarm_control_panel.deconz) |
| [alexa_media](https://www.home-assistant.io/components/alexa_media) |
| [amber_electric](https://www.home-assistant.io/components/amber_electric) |
| [amberelectric](https://www.home-assistant.io/components/amberelectric) |
| [analytics](https://www.home-assistant.io/components/analytics) |
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
| [binary_sensor.hassio](https://www.home-assistant.io/components/binary_sensor.hassio) |
| [binary_sensor.iss](https://www.home-assistant.io/components/binary_sensor.iss) |
| [binary_sensor.mobile_app](https://www.home-assistant.io/components/binary_sensor.mobile_app) |
| [binary_sensor.mqtt](https://www.home-assistant.io/components/binary_sensor.mqtt) |
| [binary_sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/binary_sensor.nsw_rural_fire_service_fire_danger) |
| [binary_sensor.openuv](https://www.home-assistant.io/components/binary_sensor.openuv) |
| [binary_sensor.pi_hole](https://www.home-assistant.io/components/binary_sensor.pi_hole) |
| [binary_sensor.ping](https://www.home-assistant.io/components/binary_sensor.ping) |
| [binary_sensor.proxmoxve](https://www.home-assistant.io/components/binary_sensor.proxmoxve) |
| [binary_sensor.satellitetracker](https://www.home-assistant.io/components/binary_sensor.satellitetracker) |
| [binary_sensor.smartthinq_sensors](https://www.home-assistant.io/components/binary_sensor.smartthinq_sensors) |
| [binary_sensor.sonos](https://www.home-assistant.io/components/binary_sensor.sonos) |
| [binary_sensor.spacex](https://www.home-assistant.io/components/binary_sensor.spacex) |
| [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2) |
| [binary_sensor.synology_dsm](https://www.home-assistant.io/components/binary_sensor.synology_dsm) |
| [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template) |
| [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod) |
| [binary_sensor.trend](https://www.home-assistant.io/components/binary_sensor.trend) |
| [binary_sensor.updater](https://www.home-assistant.io/components/binary_sensor.updater) |
| [binary_sensor.uptimerobot](https://www.home-assistant.io/components/binary_sensor.uptimerobot) |
| [binary_sensor.workday](https://www.home-assistant.io/components/binary_sensor.workday) |
| [binary_sensor.xbox](https://www.home-assistant.io/components/binary_sensor.xbox) |
| [blitzortung](https://www.home-assistant.io/components/blitzortung) |
| [blueprint](https://www.home-assistant.io/components/blueprint) |
| [breaking_changes](https://www.home-assistant.io/components/breaking_changes) |
| [browser_mod](https://www.home-assistant.io/components/browser_mod) |
| [bureau_of_meteorology](https://www.home-assistant.io/components/bureau_of_meteorology) |
| [calendar](https://www.home-assistant.io/components/calendar) |
| [calendar.garbage_collection](https://www.home-assistant.io/components/calendar.garbage_collection) |
| [calendar.google](https://www.home-assistant.io/components/calendar.google) |
| [calendar.ical](https://www.home-assistant.io/components/calendar.ical) |
| [camera](https://www.home-assistant.io/components/camera) |
| [camera.browser_mod](https://www.home-assistant.io/components/camera.browser_mod) |
| [camera.dyson_cloud](https://www.home-assistant.io/components/camera.dyson_cloud) |
| [camera.mqtt](https://www.home-assistant.io/components/camera.mqtt) |
| [camera.synology_dsm](https://www.home-assistant.io/components/camera.synology_dsm) |
| [cast](https://www.home-assistant.io/components/cast) |
| [cert_expiry](https://www.home-assistant.io/components/cert_expiry) |
| [climacell](https://www.home-assistant.io/components/climacell) |
| [climate](https://www.home-assistant.io/components/climate) |
| [climate.deconz](https://www.home-assistant.io/components/climate.deconz) |
| [climate.dyson_local](https://www.home-assistant.io/components/climate.dyson_local) |
| [climate.sensibo](https://www.home-assistant.io/components/climate.sensibo) |
| [climate.smartthinq_sensors](https://www.home-assistant.io/components/climate.smartthinq_sensors) |
| [cloud](https://www.home-assistant.io/components/cloud) |
| [config](https://www.home-assistant.io/components/config) |
| [configurator](https://www.home-assistant.io/components/configurator) |
| [coronavirus](https://www.home-assistant.io/components/coronavirus) |
| [counter](https://www.home-assistant.io/components/counter) |
| [cover](https://www.home-assistant.io/components/cover) |
| [cover.deconz](https://www.home-assistant.io/components/cover.deconz) |
| [deconz](https://www.home-assistant.io/components/deconz) |
| [default_config](https://www.home-assistant.io/components/default_config) |
| [device_automation](https://www.home-assistant.io/components/device_automation) |
| [device_tracker](https://www.home-assistant.io/components/device_tracker) |
| [device_tracker.icloud](https://www.home-assistant.io/components/device_tracker.icloud) |
| [device_tracker.icloud3](https://www.home-assistant.io/components/device_tracker.icloud3) |
| [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app) |
| [device_tracker.satellitetracker](https://www.home-assistant.io/components/device_tracker.satellitetracker) |
| [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi) |
| [dhcp](https://www.home-assistant.io/components/dhcp) |
| [dwains_dashboard](https://www.home-assistant.io/components/dwains_dashboard) |
| [dyson_cloud](https://www.home-assistant.io/components/dyson_cloud) |
| [dyson_local](https://www.home-assistant.io/components/dyson_local) |
| [esphome](https://www.home-assistant.io/components/esphome) |
| [fan](https://www.home-assistant.io/components/fan) |
| [fan.deconz](https://www.home-assistant.io/components/fan.deconz) |
| [fan.dyson_local](https://www.home-assistant.io/components/fan.dyson_local) |
| [favicon](https://www.home-assistant.io/components/favicon) |
| [feedreader](https://www.home-assistant.io/components/feedreader) |
| [ffmpeg](https://www.home-assistant.io/components/ffmpeg) |
| [fontawesome](https://www.home-assistant.io/components/fontawesome) |
| [forked_daapd](https://www.home-assistant.io/components/forked_daapd) |
| [frontend](https://www.home-assistant.io/components/frontend) |
| [garbage_collection](https://www.home-assistant.io/components/garbage_collection) |
| [gdacs](https://www.home-assistant.io/components/gdacs) |
| [geo_location](https://www.home-assistant.io/components/geo_location) |
| [geo_location.blitzortung](https://www.home-assistant.io/components/geo_location.blitzortung) |
| [geo_location.gdacs](https://www.home-assistant.io/components/geo_location.gdacs) |
| [geo_location.nsw_rural_fire_service_feed](https://www.home-assistant.io/components/geo_location.nsw_rural_fire_service_feed) |
| [glances](https://www.home-assistant.io/components/glances) |
| [google](https://www.home-assistant.io/components/google) |
| [google_assistant](https://www.home-assistant.io/components/google_assistant) |
| [group](https://www.home-assistant.io/components/group) |
| [hacs](https://www.home-assistant.io/components/hacs) |
| [harmony](https://www.home-assistant.io/components/harmony) |
| [hassio](https://www.home-assistant.io/components/hassio) |
| [history](https://www.home-assistant.io/components/history) |
| [homeassistant](https://www.home-assistant.io/components/homeassistant) |
| [homekit](https://www.home-assistant.io/components/homekit) |
| [http](https://www.home-assistant.io/components/http) |
| [iaquk](https://www.home-assistant.io/components/iaquk) |
| [ical](https://www.home-assistant.io/components/ical) |
| [icloud](https://www.home-assistant.io/components/icloud) |
| [ifttt](https://www.home-assistant.io/components/ifttt) |
| [image](https://www.home-assistant.io/components/image) |
| [influxdb](https://www.home-assistant.io/components/influxdb) |
| [input_boolean](https://www.home-assistant.io/components/input_boolean) |
| [input_datetime](https://www.home-assistant.io/components/input_datetime) |
| [input_number](https://www.home-assistant.io/components/input_number) |
| [input_select](https://www.home-assistant.io/components/input_select) |
| [input_text](https://www.home-assistant.io/components/input_text) |
| [ios](https://www.home-assistant.io/components/ios) |
| [lifx](https://www.home-assistant.io/components/lifx) |
| [light](https://www.home-assistant.io/components/light) |
| [light.alexa_media](https://www.home-assistant.io/components/light.alexa_media) |
| [light.browser_mod](https://www.home-assistant.io/components/light.browser_mod) |
| [light.deconz](https://www.home-assistant.io/components/light.deconz) |
| [light.lifx](https://www.home-assistant.io/components/light.lifx) |
| [lock](https://www.home-assistant.io/components/lock) |
| [lock.deconz](https://www.home-assistant.io/components/lock.deconz) |
| [logbook](https://www.home-assistant.io/components/logbook) |
| [logger](https://www.home-assistant.io/components/logger) |
| [lovelace](https://www.home-assistant.io/components/lovelace) |
| [map](https://www.home-assistant.io/components/map) |
| [media_player](https://www.home-assistant.io/components/media_player) |
| [media_player.alexa_media](https://www.home-assistant.io/components/media_player.alexa_media) |
| [media_player.androidtv](https://www.home-assistant.io/components/media_player.androidtv) |
| [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv) |
| [media_player.browser_mod](https://www.home-assistant.io/components/media_player.browser_mod) |
| [media_player.cast](https://www.home-assistant.io/components/media_player.cast) |
| [media_player.forked_daapd](https://www.home-assistant.io/components/media_player.forked_daapd) |
| [media_player.plex](https://www.home-assistant.io/components/media_player.plex) |
| [media_player.samsungtv](https://www.home-assistant.io/components/media_player.samsungtv) |
| [media_player.samsungtv_smart](https://www.home-assistant.io/components/media_player.samsungtv_smart) |
| [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos) |
| [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify) |
| [media_player.xbox](https://www.home-assistant.io/components/media_player.xbox) |
| [media_source](https://www.home-assistant.io/components/media_source) |
| [met](https://www.home-assistant.io/components/met) |
| [mobile_app](https://www.home-assistant.io/components/mobile_app) |
| [monitor_docker](https://www.home-assistant.io/components/monitor_docker) |
| [mqtt](https://www.home-assistant.io/components/mqtt) |
| [my](https://www.home-assistant.io/components/my) |
| [myjdownloader](https://www.home-assistant.io/components/myjdownloader) |
| [network](https://www.home-assistant.io/components/network) |
| [nodered](https://www.home-assistant.io/components/nodered) |
| [notify](https://www.home-assistant.io/components/notify) |
| [notify.alexa_media](https://www.home-assistant.io/components/notify.alexa_media) |
| [notify.group](https://www.home-assistant.io/components/notify.group) |
| [notify.ios](https://www.home-assistant.io/components/notify.ios) |
| [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app) |
| [notify.slack](https://www.home-assistant.io/components/notify.slack) |
| [nsw_fuel_station](https://www.home-assistant.io/components/nsw_fuel_station) |
| [nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/nsw_rural_fire_service_fire_danger) |
| [onboarding](https://www.home-assistant.io/components/onboarding) |
| [openuv](https://www.home-assistant.io/components/openuv) |
| [optus](https://www.home-assistant.io/components/optus) |
| [panel_iframe](https://www.home-assistant.io/components/panel_iframe) |
| [persistent_notification](https://www.home-assistant.io/components/persistent_notification) |
| [person](https://www.home-assistant.io/components/person) |
| [pi_hole](https://www.home-assistant.io/components/pi_hole) |
| [ping](https://www.home-assistant.io/components/ping) |
| [plex](https://www.home-assistant.io/components/plex) |
| [proxmoxve](https://www.home-assistant.io/components/proxmoxve) |
| [pyscript](https://www.home-assistant.io/components/pyscript) |
| [python_script](https://www.home-assistant.io/components/python_script) |
| [readme](https://www.home-assistant.io/components/readme) |
| [recorder](https://www.home-assistant.io/components/recorder) |
| [remote](https://www.home-assistant.io/components/remote) |
| [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv) |
| [remote.harmony](https://www.home-assistant.io/components/remote.harmony) |
| [remote.xbox](https://www.home-assistant.io/components/remote.xbox) |
| [rest](https://www.home-assistant.io/components/rest) |
| [rocketlaunchlive](https://www.home-assistant.io/components/rocketlaunchlive) |
| [sabnzbd](https://www.home-assistant.io/components/sabnzbd) |
| [samsungtv](https://www.home-assistant.io/components/samsungtv) |
| [samsungtv_smart](https://www.home-assistant.io/components/samsungtv_smart) |
| [satellitetracker](https://www.home-assistant.io/components/satellitetracker) |
| [scene](https://www.home-assistant.io/components/scene) |
| [scene.deconz](https://www.home-assistant.io/components/scene.deconz) |
| [scene.homeassistant](https://www.home-assistant.io/components/scene.homeassistant) |
| [script](https://www.home-assistant.io/components/script) |
| [search](https://www.home-assistant.io/components/search) |
| [sensor](https://www.home-assistant.io/components/sensor) |
| [sensor.alexa_media](https://www.home-assistant.io/components/sensor.alexa_media) |
| [sensor.amber_electric](https://www.home-assistant.io/components/sensor.amber_electric) |
| [sensor.amberelectric](https://www.home-assistant.io/components/sensor.amberelectric) |
| [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries) |
| [sensor.authenticated](https://www.home-assistant.io/components/sensor.authenticated) |
| [sensor.average](https://www.home-assistant.io/components/sensor.average) |
| [sensor.blitzortung](https://www.home-assistant.io/components/sensor.blitzortung) |
| [sensor.breaking_changes](https://www.home-assistant.io/components/sensor.breaking_changes) |
| [sensor.browser_mod](https://www.home-assistant.io/components/sensor.browser_mod) |
| [sensor.bureau_of_meteorology](https://www.home-assistant.io/components/sensor.bureau_of_meteorology) |
| [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry) |
| [sensor.climacell](https://www.home-assistant.io/components/sensor.climacell) |
| [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line) |
| [sensor.coronavirus](https://www.home-assistant.io/components/sensor.coronavirus) |
| [sensor.covid19_covidlive](https://www.home-assistant.io/components/sensor.covid19_covidlive) |
| [sensor.covid19_nswhealth](https://www.home-assistant.io/components/sensor.covid19_nswhealth) |
| [sensor.covid19_nswhealth_tests](https://www.home-assistant.io/components/sensor.covid19_nswhealth_tests) |
| [sensor.deconz](https://www.home-assistant.io/components/sensor.deconz) |
| [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock) |
| [sensor.dwains_dashboard](https://www.home-assistant.io/components/sensor.dwains_dashboard) |
| [sensor.dyson_local](https://www.home-assistant.io/components/sensor.dyson_local) |
| [sensor.esphome](https://www.home-assistant.io/components/sensor.esphome) |
| [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser) |
| [sensor.filter](https://www.home-assistant.io/components/sensor.filter) |
| [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection) |
| [sensor.gdacs](https://www.home-assistant.io/components/sensor.gdacs) |
| [sensor.github](https://www.home-assistant.io/components/sensor.github) |
| [sensor.glances](https://www.home-assistant.io/components/sensor.glances) |
| [sensor.google_fit](https://www.home-assistant.io/components/sensor.google_fit) |
| [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs) |
| [sensor.hassio](https://www.home-assistant.io/components/sensor.hassio) |
| [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time) |
| [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk) |
| [sensor.ical](https://www.home-assistant.io/components/sensor.ical) |
| [sensor.icloud](https://www.home-assistant.io/components/sensor.icloud) |
| [sensor.ios](https://www.home-assistant.io/components/sensor.ios) |
| [sensor.launch_library](https://www.home-assistant.io/components/sensor.launch_library) |
| [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app) |
| [sensor.monitor_docker](https://www.home-assistant.io/components/sensor.monitor_docker) |
| [sensor.moon](https://www.home-assistant.io/components/sensor.moon) |
| [sensor.mqtt](https://www.home-assistant.io/components/sensor.mqtt) |
| [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered) |
| [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality) |
| [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station) |
| [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger) |
| [sensor.opennem](https://www.home-assistant.io/components/sensor.opennem) |
| [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv) |
| [sensor.optus](https://www.home-assistant.io/components/sensor.optus) |
| [sensor.pi_hole](https://www.home-assistant.io/components/sensor.pi_hole) |
| [sensor.plex](https://www.home-assistant.io/components/sensor.plex) |
| [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added) |
| [sensor.pocketcasts](https://www.home-assistant.io/components/sensor.pocketcasts) |
| [sensor.radarr](https://www.home-assistant.io/components/sensor.radarr) |
| [sensor.radarr_upcoming_media](https://www.home-assistant.io/components/sensor.radarr_upcoming_media) |
| [sensor.rest](https://www.home-assistant.io/components/sensor.rest) |
| [sensor.rocketlaunchlive](https://www.home-assistant.io/components/sensor.rocketlaunchlive) |
| [sensor.sabnzbd](https://www.home-assistant.io/components/sensor.sabnzbd) |
| [sensor.satellitetracker](https://www.home-assistant.io/components/sensor.satellitetracker) |
| [sensor.scrape](https://www.home-assistant.io/components/sensor.scrape) |
| [sensor.season](https://www.home-assistant.io/components/sensor.season) |
| [sensor.smartthinq_sensors](https://www.home-assistant.io/components/sensor.smartthinq_sensors) |
| [sensor.snmp](https://www.home-assistant.io/components/sensor.snmp) |
| [sensor.solcast](https://www.home-assistant.io/components/sensor.solcast) |
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
| [sensor.temperature_feels_like](https://www.home-assistant.io/components/sensor.temperature_feels_like) |
| [sensor.template](https://www.home-assistant.io/components/sensor.template) |
| [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date) |
| [sensor.transmission](https://www.home-assistant.io/components/sensor.transmission) |
| [sensor.transport_nsw](https://www.home-assistant.io/components/sensor.transport_nsw) |
| [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi) |
| [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway) |
| [sensor.untappd](https://www.home-assistant.io/components/sensor.untappd) |
| [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime) |
| [sensor.utility_meter](https://www.home-assistant.io/components/sensor.utility_meter) |
| [sensor.version](https://www.home-assistant.io/components/sensor.version) |
| [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi) |
| [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw) |
| [sensor.waze_travel_time](https://www.home-assistant.io/components/sensor.waze_travel_time) |
| [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock) |
| [sensor.xbox](https://www.home-assistant.io/components/sensor.xbox) |
| [sensor.yahoofinance](https://www.home-assistant.io/components/sensor.yahoofinance) |
| [shell_command](https://www.home-assistant.io/components/shell_command) |
| [simpleicons](https://www.home-assistant.io/components/simpleicons) |
| [smartthinq_sensors](https://www.home-assistant.io/components/smartthinq_sensors) |
| [solcast](https://www.home-assistant.io/components/solcast) |
| [sonarr](https://www.home-assistant.io/components/sonarr) |
| [sonos](https://www.home-assistant.io/components/sonos) |
| [spacex](https://www.home-assistant.io/components/spacex) |
| [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet) |
| [spotcast](https://www.home-assistant.io/components/spotcast) |
| [spotify](https://www.home-assistant.io/components/spotify) |
| [ssdp](https://www.home-assistant.io/components/ssdp) |
| [stream](https://www.home-assistant.io/components/stream) |
| [stt](https://www.home-assistant.io/components/stt) |
| [sun](https://www.home-assistant.io/components/sun) |
| [switch](https://www.home-assistant.io/components/switch) |
| [switch.alexa_media](https://www.home-assistant.io/components/switch.alexa_media) |
| [switch.command_line](https://www.home-assistant.io/components/switch.command_line) |
| [switch.deconz](https://www.home-assistant.io/components/switch.deconz) |
| [switch.dyson_local](https://www.home-assistant.io/components/switch.dyson_local) |
| [switch.esphome](https://www.home-assistant.io/components/switch.esphome) |
| [switch.harmony](https://www.home-assistant.io/components/switch.harmony) |
| [switch.monitor_docker](https://www.home-assistant.io/components/switch.monitor_docker) |
| [switch.nodered](https://www.home-assistant.io/components/switch.nodered) |
| [switch.smartthinq_sensors](https://www.home-assistant.io/components/switch.smartthinq_sensors) |
| [switch.sonos](https://www.home-assistant.io/components/switch.sonos) |
| [switch.synology_dsm](https://www.home-assistant.io/components/switch.synology_dsm) |
| [switch.template](https://www.home-assistant.io/components/switch.template) |
| [switch.transmission](https://www.home-assistant.io/components/switch.transmission) |
| [switch.unifi](https://www.home-assistant.io/components/switch.unifi) |
| [synology_dsm](https://www.home-assistant.io/components/synology_dsm) |
| [system_health](https://www.home-assistant.io/components/system_health) |
| [system_log](https://www.home-assistant.io/components/system_log) |
| [tag](https://www.home-assistant.io/components/tag) |
| [template](https://www.home-assistant.io/components/template) |
| [timer](https://www.home-assistant.io/components/timer) |
| [trace](https://www.home-assistant.io/components/trace) |
| [transmission](https://www.home-assistant.io/components/transmission) |
| [tts](https://www.home-assistant.io/components/tts) |
| [tts.cloud](https://www.home-assistant.io/components/tts.cloud) |
| [tts.google_translate](https://www.home-assistant.io/components/tts.google_translate) |
| [unifi](https://www.home-assistant.io/components/unifi) |
| [updater](https://www.home-assistant.io/components/updater) |
| [utility_meter](https://www.home-assistant.io/components/utility_meter) |
| [waze_travel_time](https://www.home-assistant.io/components/waze_travel_time) |
| [weather](https://www.home-assistant.io/components/weather) |
| [weather.bureau_of_meteorology](https://www.home-assistant.io/components/weather.bureau_of_meteorology) |
| [weather.climacell](https://www.home-assistant.io/components/weather.climacell) |
| [weather.darksky](https://www.home-assistant.io/components/weather.darksky) |
| [weather.met](https://www.home-assistant.io/components/weather.met) |
| [weather.template](https://www.home-assistant.io/components/weather.template) |
| [webhook](https://www.home-assistant.io/components/webhook) |
| [websocket_api](https://www.home-assistant.io/components/websocket_api) |
| [xbox](https://www.home-assistant.io/components/xbox) |
| [yahoofinance](https://www.home-assistant.io/components/yahoofinance) |
| [zeroconf](https://www.home-assistant.io/components/zeroconf) |
| [zone](https://www.home-assistant.io/components/zone) |
</details>

### Custom Components Used

<details>
<summary>Expand Custom Components List</summary>

- [Alexa Media Player](https://github.com/custom-components/alexa_media_player/wiki)
- [Amber Electric](https://www.home-assistant.io/integrations/amber_electric)
- [Amber Electric](https://github.com/davewatson91/hass-amber-electric)
- [Anniversaries](https://github.com/pinkywafer/Anniversaries)
- [Authenticated](https://github.com/custom-components/authenticated)
- [Average Sensor](https://github.com/Limych/ha-average)
- [Blitzortung](https://github.com/mrk-its/homeassistant-blitzortung)
- [Breaking Changes](https://github.com/custom-components/breaking_changes)
- [Browser mod](https://github.com/thomasloven/hass-browser_mod/blob/master/README.md)
- [Bureau of Meteorology](https://github.com/bremor/bureau_of_meteorology)
- [COVID-19 NSW Health]()
- [COVID-19 NSW Health Tests]()
- [covid19_covidlive]()
- [Doomsday Clock](https://github.com/renemarc/home-assistant-doomsday-clock)
- [Dwains Dashboard](https://dwainscheeren.github.io/dwains-lovelace-dashboard/)
- [Dyson Cloud](https://github.com/shenxn/ha-dyson)
- [Dyson Local](https://github.com/shenxn/ha-dyson)
- [Favicon changer](https://github.com/thomasloven/hass-favicon)
- [Feedparser](https://github.com/custom-components/feedparser/blob/master/README.md)
- [Fontawesome icons](https://github.com/thomasloven/hass-fontawesome)
- [Garbage Collection](https://github.com/bruxy70/Garbage-Collection/)
- [Generate readme](https://github.com/custom-components/readme)
- [Google Fit](https://github.com/cyberjunky/home-assistant-google_fit)
- [HACS](https://hacs.xyz/docs/configuration/start)
- [ical Sensor](https://www.home-assistant.io/integrations/ical)
- [iCloud3 Device Tracker](https://gcobb321.github.io/icloud3/#/)
- [Indoor Air Quality UK Index](https://github.com/Limych/ha-iaquk)
- [Monitor Docker](https://github.com/ualex73/monitor_docker)
- [MyJDownloader](https://github.com/doudz/homeassistant-myjdownloader)
- [Node-RED Companion](https://zachowj.github.io/node-red-contrib-home-assistant-websocket/guide/custom_integration/)
- [NSW Air Quality]()
- [NSW Rural Fire Service - Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger)
- [OpenNEM](https://github.com/bacco007/sensor.opennem)
- [Optus](https://github.com/itchannel/optus-ha)
- [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Pyscript Python scripting](https://github.com/custom-components/pyscript)
- [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Rocket Launch Live - Next 5 Launches](https://github.com/djtimca/harocketlaunchlive)
- [SamsungTV Smart](https://github.com/ollo69/ha-samsungtv-smart)
- [Satellite Tracker (N2YO)](https://github.com/djtimca/hasatellitetracker)
- [Simple Icons]()
- [SmartThinQ LGE Sensors](https://github.com/ollo69/ha-smartthinq-sensors)
- [Solcast PV forecast](https://github.com/dannerph/homeassistant-solcast)
- [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [SpaceX Launches and Starman](https://github.com/djtimca/haspacex)
- [Spotcast](https://github.com/fondberg/spotcast)
- [Sun2](https://github.com/pnbruckner/ha-sun2/blob/master/README.md)
- [Temperature Feels Like](https://github.com/Limych/ha-temperature-feeling)
- [UniFi Gateway](https://github.com/custom-components/sensor.unifigateway)
- [Untappd](https://github.com/custom-components/sensor.untappd/blob/master/README.md)
- [Water NSW](https://github.com/bacco007/sensor.waternsw)
- [Yahoo Finance](https://github.com/iprak/yahoofinance)</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

#### HACS - Integrations

| Name | Description |
| --- | ---|
| [Abalin Name Day](https://github.com/viktak/ha-cc-abalin-nameday) | Home Assistant custom component for the abalin name day API |
| [Abfall Api (Jumomind)](https://github.com/tuxuser/abfallapi_jumomind_ha) | Abfall API (Jumomind) custom component for home assistant - Get an alert when garbage collection is due |
| [Abfall Api (Regioit)](https://github.com/tuxuser/abfallapi_regioit_ha) | Abfall API (RegioIT) custom component for home assistant - Get an alert when garbage collection is due |
| [Acv Garbage Collection Sensor](https://github.com/Cadsters/acv-hass-component) | 🗑️ Integration for bin/waste collection  by acv-groep |
| [Adaptive Lighting](https://github.com/basnijholt/adaptive-lighting) | Adaptive Lighting custom component for Home Assistant |
| [Adax Heaters](https://github.com/Danielhiversen/home_assistant_adax) | Integration for Adax heaters |
| [Adt Pulse](https://github.com/rsnodgrass/hass-adtpulse) | ADT Pulse sensor for Home Assistant |
| [Afvalinfo](https://github.com/heyajohnny/afvalinfo) | Provides Home Assistant sensors for multiple Dutch waste collectors. The idea is to add more cities and features in the future. |
| [Afvalwijzer](https://github.com/xirixiz/homeassistant-afvalwijzer) | Provides sensors for the Dutch waste collector mijnafvalwijzer.nl and/or afvalstoffendienstkalender.nl |
| [Aimp Media Player](https://github.com/xilense/aimp_custom_component) | AIMP custom component for 🏠 Home Assistant using web remote |
| [Airly](https://github.com/bieniu/ha-airly) | Airly air quality custom integration |
| [Alarmdotcom](https://github.com/uvjustin/alarmdotcom) | Custom component to allow Home Assistant to interface with Alarm.com |
| [Alarmo](https://github.com/nielsfaber/alarmo) | Easy to use alarm system integration for Home Assistant |
| [Alexa Media Player](https://github.com/custom-components/alexa_media_player) | This is a custom component to allow control of Amazon Alexa devices in Home Assistant using the unofficial Alexa API. |
| [Amazon Rekognition](https://github.com/robmarkcole/HASS-amazon-rekognition) | Home Assistant Object detection with Amazon Rekognition |
| [Amber Electric](https://github.com/troykelly/hacs-amberelectric) | Unofficial Amber Electric integration for Home Assistant |
| [Ambilight Yeelight](https://github.com/jomwells/ambilight-yeelight) | A switch component which mimics the functionality of Ambilight+Hue for all Yeelight lights/bulbs |
| [Ambilights](https://github.com/jomwells/ambilights) | Custom Home Assistant (Light) Component for Ambilight LED's on Philips Android TV's |
| [Amshan](https://github.com/toreamun/amshan-homeassistant) | Integrate HAN-port attached Aidon, Kaifa and Kamstrup meters used in Norway into Home Assistant |
| [Anniversaries](https://github.com/pinkywafer/Anniversaries) | Anniversary Countdown Sensor for Home Assistant |
| [Antistorm Sensor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Antistorm) | This sensor uses official API to get storm warnings from https://antistorm.eu. |
| [Arlo Camera Support](https://github.com/twrecked/hass-aarlo) | Asynchronous Arlo Component for Home Assistant |
| [Arpscan Device Tracker](https://github.com/cyberjunky/home-assistant-arpscan_tracker) | This component tracks devices using the arp-scan liinux command, it's very fast, and reasonably accurate. |
| [Astroweather](https://github.com/mawinkler/astroweather) | Asynchronous Astro Weather Forecast for Home Assistant |
| [Atag One](https://github.com/herikw/home-assistant-custom-components) | Atag One Custom components for Home-Assistant |
| [Attributes Extractor](https://github.com/pilotak/homeassistant-attributes) | Breaks out specified attribute from other entities to a sensor |
| [Audi Connect](https://github.com/arjenvrh/audi_connect_ha) | Adds an audi connect integration to home assistant |
| [Authenticated](https://github.com/custom-components/authenticated) | A platform which allows you to get information about sucessfull logins to Home Assistant. |
| [Auto Backup](https://github.com/jcwillox/hass-auto-backup) | 🗃️ Improved Backup Service for Hass.io that can Automatically Remove Snapshots and Supports Generational Backup Schemes. |
| [Avanza Stock](https://github.com/custom-components/sensor.avanza_stock) | Custom component to get stock data from Avanza for Home Assistant |
| [Average Sensor](https://github.com/Limych/ha-average) | Average Sensor for Home Assistant |
| [Avfallsor](https://github.com/custom-components/sensor.avfallsor) | Simple sensor for avfallsor |
| [Awb   Home Assistant Sensor For German Awb Waste Collection Schedule](https://github.com/jensweimann/awb) | Home Assistant sensor for german AWB waste collection schedule |
| [Awox Mesh Control](https://github.com/fsaris/home-assistant-awox) | AwoX mesh light integration for Home Assistant |
| [Aws Codepipeline](https://github.com/rj175/home-assistant-aws-codepipeline) | An integration to monitor and execute AWS Codepipeline projects within Home Assistant. |
| [Baby Buddy](https://github.com/jcgoette/baby_buddy_homeassistant) | This custom integration provides sensors for Baby Buddy API endpoints. |
| [Balboa Spa Client](https://github.com/garbled1/balboa_homeassistan) | Balboa spa integration for home-assistant |
| [Bar Garbage Collection](https://github.com/remco770/garbage-bar-homeassistant) | Garbage collection BAR for Home Assistant |
| [Beerbolaget](https://github.com/Ceerbeerus/beerbolaget) | Gives you information about the latest beer available at Systembolaget in Sweden, also known as "Tillfälligt sortiment". |
| [Ber Status Sensor](https://github.com/tmechen/ber_status) | A BER Status Sensor |
| [Beward Cameras & Doorbells](https://github.com/Limych/ha-beward) | Home Assistant custom component for Beward security Cameras and Doorbells |
| [Bkk Stop](https://github.com/amaximus/bkk_stop) | HomeAssistant custom component for Budapest public transportation |
| [Blitzortung.Org Lightning Detector](https://github.com/mrk-its/homeassistant-blitzortung) | Custom Component for fetching lightning data from blitzortung.org |
| [Blueiris Nvr](https://github.com/elad-bar/ha-blueiris) | Integration with Blue Iris Video Security Software |
| [BMR](https://github.com/slesinger/HomeAssistant-BMR) | Control BMR heating regulation system from Home Assistant |
| [Bom Core Replacement](https://github.com/DavidFW1960/bom_core_replacement) | None |
| [Bom Forecast](https://github.com/DavidFW1960/bom_forecast) | BOM Australian Weather Forecast via FTP |
| [Bonaire Myclimate](https://github.com/bremor/bonaire_myclimate) | Reverse engineered implementation of the Bonaire MyClimate app. |
| [Bosch Indego Mower](https://github.com/jm-73/Indego) | Home Assistant Custom Component for Bosch Indego Lawn Mower |
| [Bosch Smart Home Controller (Shc) Integration](https://github.com/tschamm/boschshc-hass) | Home Assistant component for accessing Bosch Smart Home Controller using boschshcpy python library. |
| [Bosch Thermostat](https://github.com/bosch-thermostat/home-assistant-bosch-custom-component) | HA custom component for Bosch thermostats |
| [Brandrisk Ute](https://github.com/Sha-Darim/brandriskute) | The custom compontnet  will get fire risks and fire prohibition from the Brandrisk Ute API for the supplied position. |
| [Brandstofprijzen](https://github.com/metbril/home-assistant-brandstofprijzen) | Home Assistant component for fuel prices from United Consumers |
| [Bravia Tv Psk](https://github.com/custom-components/media_player.braviatv_psk) | Sony Bravia TV (Pre-Shared Key) component for Home Assistant |
| [Breaking Changes](https://github.com/custom-components/breaking_changes) | Component to show potential breaking_changes in the current published version based on your loaded components |
| [Brematic](https://github.com/tefinger/hass-brematic) | Custom component for Home Assistant to support Brematic devices |
| [Brewdog](https://github.com/custom-components/brewdog) | 🍻 Display information about random beers from Brewdog as a sensor in Home Assistant, you can use this in a push notification next time you visit a bar. |
| [Broadlink S2C And S1C Sensors](https://github.com/nick2525/broadlink_s1c_s2c) | Broadlink s2c and  Broadlink s1c sensors for Home Assistant |
| [Browser Mod](https://github.com/thomasloven/hass-browser_mod) | 🔹 A Home Assistant integration to turn your browser into a controllable entity - and also an audio player |
| [Budova Smart Home](https://github.com/dphae/bsh) | A Home Assistant Budova Smart Home integration |
| [Buienalarm](https://github.com/gieljnssns/buienalarm-sensor-homeassistant) | Buienalarm custom_component for Home-Assistant |
| [Bunq Balance Sensor](https://github.com/ben8p/home-assistant-bunq-balance-sensors) | Home assistant custom component to provide monetary account balance sensors for Bunq |
| [Bureau Of Meteorology](https://github.com/bremor/bureau_of_meteorology) | Custom component for retrieving weather information from the Bureau of Meteorology. |
| [Burze.Dzis.Net Sensor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Burze.dzis.net) | This sensor uses official API to get weather warnings for Poland and storm warnings for Europe from https://burze.dzis.net. |
| [Calendarific](https://github.com/pinkywafer/Calendarific) | Calendarific holiday sensor for Home Assistant  |
| [Camect Integration](https://github.com/pfunkmallone/HACS-camect-integration) | A HACS integration for the Camect smart home surveillance system |
| [Car Wash](https://github.com/Limych/ha-car_wash) | Car Wash Binary Sensor for Home Assistant |
| [Carbon Intensity Uk](https://github.com/jscruz/sensor.carbon_intensity_uk) | Carbon Intensity UK Sensor for Home Assistant |
| [Cez Distribuce Cz](https://github.com/zigul/HomeAssistant-CEZdistribuce) | CEZ Distribuce - Home Assistant Sensor |
| [Cfr Sensor](https://github.com/shogunxam/Home-Assistant-custom-components-cfr-toscana) | HA Integration for Centro Funzionale Regione Toscana |
| [Channels Dvr Recently Recorded](https://github.com/rccoleman/channels_dvr_recently_recorded) | ▶️ Channels DVR component to feed Upcoming Media Card. |
| [Chargeamps](https://github.com/kirei/hass-chargeamps) | Home Assistant Component for Chargeamps |
| [Circadian Lighting](https://github.com/claytonjn/hass-circadian_lighting) | Circadian Lighting custom component for Home Assistant |
| [Clean Up Snapshots Service](https://github.com/tmonck/clean_up_snapshots) | Service to clean up your home assistant snapshots, so you don't manually have to. |
| [Clientraw Weather Parser](https://github.com/pilotak/homeassistant-clientraw) | Clientraw weather parser (clientraw.txt) for HomeAssistant |
| [Climacell Weather Provider](https://github.com/r-renato/ha-climacell-weather) | Climacell weather provider integration is a custom component for Home Assistant. The climacell platform uses the Climacell API as a source for meteorological data for your location. |
| [Climate Group](https://github.com/daenny/climate_group) | Home Assistant Climate Groupe |
| [Climate Ip](https://github.com/atxbyea/samsungrac) | Home Assistant Climate Device for controlling (not only) Samsung AC |
| [Climate.Programmable Thermostat](https://github.com/custom-components/climate.programmable_thermostat) | Programmable thermostat that let you have a smart thermostat on budget. |
| [Colorfulclouds Hass](https://github.com/jihao/colorfulclouds-hass) | A hass component to integrate with colorfulclouds (彩云天气) |
| [Combined Camera](https://github.com/custom-components/combined) | A camera platform that give you a combined feed of your defined camera entities. |
| [Compal Wifi](https://github.com/frimtec/hass-compal-wifi) | :house_with_garden::satellite: Home Assistant component to switch WiFi on/off of a Compal CH7465LG modem. |
| [Config Check](https://github.com/custom-components/config_check) | Run the CLI config_check from a service call. |
| [Consul](https://github.com/jadson179/consul) | home-assistant service for control the consul 🔴 |
| [Controlid](https://github.com/jadson179/controlid) | home-assistant service  for  control the controlid 🚪🔑 |
| [Couchpotato](https://github.com/youdroid/home-assistant-couchpotato) | 🎥 CouchPotato component to feed Upcoming Media Card. |
| [Cover Time Based Rf (Trigger Script)](https://github.com/nagyrobi/home-assistant-custom-components-cover-rf-time-based) | Time-based cover with customisable scripts to trigger opening, stopping and closing. Position is calculated based on the fraction of time spent by the cover travelling up or down. State can be updated with information based on external sensors. |
| [Cozytouch](https://github.com/Cyr-ius/hass-cozytouch) | Cozytouch support for Home Assistant |
| [Crunch O Meter](https://github.com/GuyLewin/home-assistant-crunch-o-meter) | Crunch-O-Meter API as sensors in Home Assistant. See how many people are currently at your local gym |
| [Crypto Tracker](https://github.com/PepegaBruh/CryptoTracker) | Integration for Home Assistant to implement a crypto tracking system |
| [Cryptoinfo](https://github.com/heyajohnny/cryptoinfo) | Provides Home Assistant sensors for all cryptocurrencies supported by CoinGecko |
| [Cs:Go Game State](https://github.com/lociii/homeassistant-csgo) | CS:GO gamestate reporting to Home Assistant |
| [Current Cost](https://github.com/lolouk44/CurrentCost_HA_CC) | CurrentCost Meter Reading Custom Component for Home Assistant  |
| [Cz Public Transport](https://github.com/bruxy70/CZ-Public-Transport) | 🚍 Home Assistant custom sensor for finding Czech Public Transportation Connections |
| [D Link Hnap](https://github.com/postlund/dlink_hnap) | Experimental integration to Home Assistant supporting D-Link devices |
| [D Link Presence / Device Tracker](https://github.com/ayavilevich/homeassistant-dlink-presence) | A D-Link AP/router device tracker for Home Assistant |
| [Dahua](https://github.com/rroller/dahua) | Dahua Camera and Doorbell Home Assistant Integration |
| [Dahua Vto](https://github.com/myhomeiot/DahuaVTO) | Control Dahua VTO/VTH devices from Home Assistant |
| [Dahua Vto Integration](https://github.com/elad-bar/ha-dahuavto) | Dahua VTO Integration |
| [Daily Sensor](https://github.com/jeroenterheerdt/HADailySensor) | Sensor for Home Assistant that gets reset at midnight |
| [Danfoss Ally](https://github.com/MTrab/danfoss_ally) | Danfoss Ally intragration for Home Assistant |
| [Darksky M](https://github.com/kodi1/darksky_m) | darksky - clouds cover and alerts |
| [Deebot For Home Assistant](https://github.com/And3rsL/Deebot-for-Home-Assistant) | Vacuum component for Ecovacs Deebot Vacuums |
| [Deltasol Km2](https://github.com/dm82m/hass-Deltasol-KM2) | Custom component for retrieving sensor information from Deltasol KM2 |
| [Deutscher Wetterdienst](https://github.com/FL550/dwd_weather) | Deutscher Wetterdienst integration for Home-Assistant |
| [Dijnet Integration](https://github.com/laszlojakab/homeassistant-dijnet) | Dijnet integration for Home Assistant |
| [Discord Game](https://github.com/LordBoos/discord_game) | Home Assistant custom component to get online and game status of Discord users |
| [Disk Space](https://github.com/kuchel77/diskspace) | Disk space for a path. For use with Home Assistant |
| [Dobiss](https://github.com/kesteraernoudt/dobiss) | Custom Home Assistant Integration for the Dobiss NXT platform |
| [Dpc Sensor](https://github.com/caiosweet/Home-Assistant-custom-components-DPC-Alert) | Italy METEO-HYDRO ALERT (Protezione Civile) |
| [Drk Blutspende](https://github.com/Bouni/drkblutspende) | DRK Blutspende component for Home Assistant  |
| [Dwains Dashboard](https://github.com/dwainscheeren/dwains-lovelace-dashboard) | An auto generating Home Assistant Lovelace UI dashboard for desktop, tablet and mobile by Dwains for desktop, tablet, mobile |
| [Easee Ev Charger](https://github.com/fondberg/easee_hass) | Custom component for Easee EV charger |
| [Ebeco Thermostats](https://github.com/joggs/home_assistant_ebeco) | Integration for Ebeco thermostats |
| [Ecodevices Rt2](https://github.com/pcourbin/ecodevices_rt2) | Home Assistant custom component for GCE Ecodevices RT2 |
| [Ecowitt Weather Station](https://github.com/garbled1/homeassistant_ecowitt) | Ecowitt Weather Station integration for homeassistant |
| [Edgeos (Ubiquiti)](https://github.com/elad-bar/ha-edgeos) | Integration with EdgeOS (Ubiquiti) |
| [Egauge](https://github.com/neggert/hass-egauge) | Home Assistant custom component for eGauge monitor |
| [Elasticsearch Component](https://github.com/legrego/homeassistant-elasticsearch) | Publish Home-Assistant events to Elasticsearch |
| [Electric Vehicle Charge Control](https://github.com/mletenay/home-assistant-ev-charge-control) | Home Assistant custom component for Electric Vehicle Charge Control devices by Phoenix Contact  |
| [Elkoep Lara](https://github.com/exKAjFASH/media_player.elkoep_lara) | Support for interface with an ElkoEP Lara devices |
| [Eloverblik](https://github.com/JonasPed/homeassistant-eloverblik) | Home Assistant Custom Component showing data from eloverblik.dk |
| [Email Sensor](https://github.com/ljmerza/ha-email-sensor) | Email Sensor for collecting tracking numbers from over 25 providers. |
| [Emby Latest Media](https://github.com/gcorgnet/sensor.emby_upcoming_media) | Home Assistant component to feed Upcoming Media Card with the latest releases on an Emby instance. |
| [Emsc Earthquake Rss Feed](https://github.com/msekoranja/emsc-hacs-repository) | EMSC Home Assistant Integration |
| [Emulated Color Temp Light](https://github.com/Mr-Groch/HA-Emulated-Color-Temp-Light) | Emulate SUPPORT_COLOR_TEMP for color lights that doesn't support color temp (like some Ikea Tradfri bulbs) - Home Assistant component |
| [Entidade Reguladora Dos Serviços Energéticos](https://github.com/dgomes/ha_erse) | Home Assistant Custom Component for ERSE |
| [Entities Calendar](https://github.com/gadgetchnnel/entities_calendar) | A custom component for Home Assistant to allow regular entities to be used as a calendar |
| [Entity Controller](https://github.com/danobot/entity-controller) | Entity and lighting controller for managing devices via timers, scripts, and sun-based time restrictions. |
| [Eskom Loadshedding Interface](https://github.com/swartjean/ha-eskom-loadshedding) | Fetches loadshedding data from Eskom |
| [Esp Wd](https://github.com/kodi1/esp_wd) | easyesp status sensor |
| [Ethermineinfo](https://github.com/ThomasPrior/EthermineInfo) | Provides data from Ethermine.org on a specified miner. |
| [Eva Ii Pro Wifi Midea Inventor Dehumidifier Custom Integration](https://github.com/barban-dev/homeassistant-midea-dehumidifier) | Home Assistant Custom Integration for EVA II PRO WiFi Smart Dehumidifier appliance by Midea/Inventor. |
| [Event Sensor](https://github.com/azogue/eventsensor) | HomeAssistant custom sensor to track specific events |
| [Fedex](https://github.com/custom-components/fedex) | The fedex platform allows one to track deliveries by FedEx |
| [Feedparser](https://github.com/custom-components/feedparser) | 📰 RSS Feed Integration |
| [Fitness Push](https://github.com/burnnat/ha-fitness-push) | Home Assistant integration to push fitness data to remote services. |
| [Fkf Budapest Garbage Collection](https://github.com/amaximus/fkf-garbage-collection) | FKF Budapest Garbage Collection custom component for Home Assistant |
| [Flo By Moen Smart Water Monitor](https://github.com/rsnodgrass/hass-flo-water) | Flo Water Control for Home Assistant |
| [Floureon Thermostat](https://github.com/algirdasc/hass-floureon) | Floureon (Broadlink based) thermostat integration for Home Assistant |
| [Folding@Homecontrol](https://github.com/eifinger/hass-foldingathomecontrol) | Homeassistant integration for FoldingAtHomeControl |
| [Fontawesome](https://github.com/thomasloven/hass-fontawesome) | 🔹 Use icons from fontawesome in home-assistant |
| [Fordpass](https://github.com/itchannel/fordpass-ha) | Fordpass integration for Home Assistant |
| [Fortnite Stats](https://github.com/michaellunzer/Home-Assistant-Custom-Component-Fortnite) | This is a Home-Assistant custom component that pulls Fortnite stats using the python API library from the site fortnitetracker.com |
| [Freebox Player](https://github.com/Pouzor/freebox_player) | Custom Component for Home Assistant, enable to remote Freebox Player |
| [Fritz!Box Tools](https://github.com/mammuth/ha-fritzbox-tools) | [merged into HA core] Control guest wifi, port forwardings, device profiles, ... all from within Home Assistant! 🤖✨ |
| [Fully Kiosk Browser](https://github.com/cgarwood/homeassistant-fullykiosk) | Fully Kiosk Browser integration for Home Assistant |
| [Fxmarketapi Integration](https://github.com/rob196/home-assistant-fxmarketapi) | This is a custom component to integrate into FXMarketAPI (https://fxmarketapi.com) to get the live mid-rates in Home Assistant. |
| [Garbage Collection](https://github.com/bruxy70/Garbage-Collection) | 🗑 Custom Home Assistant sensor for scheduling garbage collection (or other regularly re-occurring events - weekly on given days, semi-weekly or monthly) |
| [Garbage Nissewaard Homeassistant](https://github.com/Martinvdm/garbage-nissewaard-homeassistant) | Garbage collection Nissewaard for Home Assistant |
| [Gardena Smart System](https://github.com/py-smart-gardena/hass-gardena-smart-system) | Home Assistant custom component integration for Gardena Smart System |
| [Garo Wallbox](https://github.com/sockless-coding/garo_wallbox) | Garo wallbox - Home Assistant Component  |
| [Gce Eco Devices](https://github.com/Aohzan/ecodevices) | Home Assistant custom component for GCE Eco-Devices |
| [Gecko](https://github.com/gazoodle/gecko-home-assistant) | Home Assistant integration for spas equipped with Gecko Alliance in.touch2 modules |
| [Generate Readme](https://github.com/custom-components/readme) | Use Jinja and data from Home Assistant to generate your README.md file |
| [Generic Hygrostat](https://github.com/avdeevsv91/ha_generic_hygrostat) | Generic Thermostat climate platform for Home Assistant |
| [Georide Integration](https://github.com/ptimatth/GeorideHA) | GeoRide integration for Home Assistant |
| [Gigaset Elements](https://github.com/dynasticorpheus/gigasetelements-ha) | Gigaset Smart Home integration for Home Assistant |
| [GIOŚ](https://github.com/bieniu/ha-gios) | GIOŚ (Polish Główny Inspektorat Ochrony Środowiska) air quality data integration for Home Assistant |
| [Gismeteo](https://github.com/Limych/ha-gismeteo) | Gismeteo Weather Provider for Home Assistant |
| [Gitea](https://github.com/youdroid/home-assistant-gitea) | 🍵 Gitea component to follow your repositories |
| [Go Echarger](https://github.com/cathiele/homeassistant-goecharger) | Home Assistant custom_component for controlling the go-eCharger EV-Charger |
| [Goldair Wifi Climate Devices](https://github.com/nikrolls/homeassistant-goldair-climate) | Home Assistant integration for Goldair WiFi heaters, dehumidifiers and fans |
| [Goodwe Inverter Solar Sensor (Udp   No Cloud)](https://github.com/mletenay/home-assistant-goodwe-inverter) | Read the voltage/current/power/battery values from your GoodWe Inverter via local network (UDP - no cloud)  |
| [Goodwe Sems Home Assistant](https://github.com/TimSoethout/goodwe-sems-home-assistant) | Sensor for Home Assistant pulling data from the GoodWe SEMS API for solar panel production metrics. |
| [Google Home](https://github.com/leikoilja/ha-google-home) | Home Assistant Google Home custom component  |
| [Google Wifi](https://github.com/djtimca/hagooglewifi) | Home Assistant integration for Google Wifi systems. |
| [Googlegeocode Hass](https://github.com/gregoryduckworth/GoogleGeocode-HASS) | Google Location for HASS using the Google Geocode API |
| [Govee](https://github.com/LaggAt/hacs-govee) | A HACS repository for Govee light integration |
| [Govee Ble Hci Monitor Sensor Integration](https://github.com/Home-Is-Where-You-Hang-Your-Hack/sensor.goveetemp_bt_hci) | Govee Temperature/Humidity BLE Home Assistant Component |
| [Gpodder](https://github.com/custom-components/gpodder) | 🎧 gPodder Integration for Podcast Feed Monitoring |
| [Greenchoice](https://github.com/jessevl/homeassistant-greenchoice) | This is a Home Assistant custom component that connects to the Greenchoice API |
| [Grocy Custom Component](https://github.com/custom-components/grocy) | Custom Grocy integration for Home Assistant |
| [Growatt Solar Panels](https://github.com/timvancann/homeassistant-growatt) | None |
| [Ha Automower](https://github.com/walthowd/ha-automower) | Automower Custom Component for Home Assistant |
| [Ha Dyson](https://github.com/shenxn/ha-dyson) | HomeAssitant custom integration for dyson |
| [Ha Dyson Cloud](https://github.com/shenxn/ha-dyson-cloud) | Cloud integration for ha-dyson (https://github.com/shenxn/ha-dyson/) |
| [Ha Emfitqs](https://github.com/jxlarrea/ha-emfitqs) | Emfit QS Sleep Tracker Component for Home Assistant |
| [Ha Eufy Security](https://github.com/nonsleepr/ha-eufy-security) | Custom integration of Home Assistant with EufySecurity |
| [Ha Meural](https://github.com/GuySie/ha-meural) | Integration for Meural Canvas digital art frame in Home Assistant  |
| [Ha Our Groceries](https://github.com/ljmerza/ha-our-groceries) | Our Groceries Integration for Home Assistant |
| [Ha Philips Android Tv](https://github.com/nstrelow/ha_philips_android_tv) | Home Assistant custom component for the newer (2016+) Philips Android TVs |
| [Ha Samsungtv Custom](https://github.com/roberodin/ha-samsungtv-custom) | 📺 HomeAssistant - SamsungTV Custom Component |
| [Ha Sun2](https://github.com/pnbruckner/ha-sun2) | Home Assistant Sun2 Sensor |
| [Ha Zigbee2Mqtt Networkmap](https://github.com/rgruebel/ha_zigbee2mqtt_networkmap) | Custom Component for Homeassistant to show zigbee2mqtt Networkmap |
| [HACS](https://github.com/hacs/integration) | HACS gives you a powerful UI to handle downloads of all your custom needs. |
| [Harmony Hub Climate Controller](https://github.com/nickneos/HA_harmony_climate_component) | ❄ Use a Harmony Hub to control an IR controlled climate device |
| [Hass Amber Electric](https://github.com/lewisbenge/hass-amber-electric) | Home Assistant Component to pull the latest energy prices from Amber Electric |
| [Hass Ams](https://github.com/turbokongen/hass-AMS) | Custom component reading AMS through MBus adapter into HomeAssistant |
| [Hass Atv Beta](https://github.com/postlund/hass-atv-beta) | Beta version of new Apple TV integration in Home Assistant supporting tvOS 13 |
| [Hass Bardolph](https://github.com/JAAlperin/hass-bardolph) | HASS custom component to load and run Bardolph (simple scripting utility for LIFX light bulbs by Al Fontes, Jr.) |
| [Hass Custom Alarm](https://github.com/akasma74/Hass-Custom-Alarm) | It is a fork of "Yet another take on a home assistant custom alarm" that will exist until its author is back to our Earth |
| [Hass Deepstack Face](https://github.com/robmarkcole/HASS-Deepstack-face) | Home Assistant custom component for using Deepstack face recognition |
| [Hass Deepstack Object](https://github.com/robmarkcole/HASS-Deepstack-object) | Home Assistant custom component for using Deepstack object detection |
| [Hass Favicon](https://github.com/thomasloven/hass-favicon) | 🔹 Change the favicon of your Home Assistant instance |
| [Hass Integrations](https://github.com/rsnodgrass/hass-integrations) | Home Assistant smart home platform integrations including sensors and custom tools |
| [Hass Machinebox Classificationbox](https://github.com/robmarkcole/HASS-Machinebox-Classificationbox) | Home-Assistant image classification using Machinebox.io |
| [Hdhomerun](https://github.com/burnnat/ha-hdhomerun) | HDHomeRun integration for Home Assistant. |
| [Hdhomerun Tuners](https://github.com/Berserkir-Wolf/ha-hdhomerun) | HDHomeRun integration for Home Assistant. |
| [Healthchecks.Io](https://github.com/custom-components/healthchecksio) | Update and display the status of your healthchecks.io  checks. |
| [Heatmiser Wifi](https://github.com/midstar/heatmiser_wifi_ha) | Heatmiser Wifi Home Assistant Component |
| [Hekr Component](https://github.com/alryaz/hass-hekr-component) | Hekr integration using python-hekr |
| [Helios Easycontrols Modbus Tcp/Ip Integration](https://github.com/laszlojakab/homeassistant-easycontrols) | Helios EasyControls Modbus TCP/IP integration for Home Assistant |
| [Helios Ventilation](https://github.com/asev/homeassistant-helios) | Custom component for Home Assistant to connect Helios ventilation system. |
| [Helium Blockchain](https://github.com/rsnodgrass/hass-helium) | Helium blockchain sensors for Home Assistant |
| [Hella Onyx.Center](https://github.com/muhlba91/onyx-homeassistant-integration) | Home Assistant integration (HACS) for Hella's ONYX.CENTER appliance |
| [Hifiberry](https://github.com/willholdoway/hifiberry) | This is a custom component to allow control of HifiberryOS devices in Home Assistant using the audiocontrol2 REST API. |
| [Hive Custom Component](https://github.com/Pyhass/Hive-Custom-Component) | A custom version of the home assistant hive component |
| [Home Assisant Sensor Ovapi](https://github.com/Paul-dH/Home-Assisant-Sensor-OvApi) | None |
| [Home Assistant Casambi](https://github.com/hellqvio86/home_assistant_casambi) | Home assistant Integration for Casambi Cloud lights |
| [Home Assistant Custom Components Google Keep](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Google-Keep) | This sensor uses gkeepapi library to download a list of notes from https://keep.google.com/. |
| [Home Assistant Jumbo](https://github.com/peternijssen/home-assistant-jumbo) | :convenience_store: Integrate Jumbo.com in Home Assistant |
| [Home Assistant Omnik Solar](https://github.com/heinoldenhuis/home_assistant_omnik_solar) | Home Assistant Omnik Solar sensor component |
| [Home Assistant Sensor Afvalbeheer](https://github.com/pippyn/Home-Assistant-Sensor-Afvalbeheer) | Provides Home Assistant sensors for multiple Dutch and Belgium waste collectors |
| [Home Assistant Sensor Groningen Afvalwijzer](https://github.com/pippyn/Home-Assistant-Sensor-Groningen-Afvalwijzer) | Provides sensors for the Dutch waste collector Groningen Afvalwijzer. |
| [Home Assistant Sl Sensor (Hasl)](https://github.com/DSorlov/hasl-platform) | HomeAssistant SL Sensor (HASL) |
| [Home Connect](https://github.com/DavidMStraub/homeassistant-homeconnect) | Custom component for Home Assistant to connect appliances supporting the Home Connect standard |
| [Homeassistant Aemet Sensor](https://github.com/kalanda/homeassistant-aemet-sensor) | AEMET integration for Home Assistant |
| [Homeassistant Atrea](https://github.com/JurajNyiri/HomeAssistant-Atrea) | Custom component allowing control of Atrea ventilation units |
| [Homeassistant Custom Components Denkovi](https://github.com/rdehuyss/homeassistant-custom_components-denkovi) | Support for Denkovi IOT Relay modules in HomeAssistant |
| [Homeassistant Generic Hygrostat](https://github.com/basschipper/homeassistant-generic-hygrostat) | Generic Hygrostat for Home Assistant |
| [Homeassistant Greeclimatecomponent](https://github.com/RobHofmann/HomeAssistant-GreeClimateComponent) | Custom Gree climate component written in Python3 for Home Assistant. Controls AC's supporting the Gree protocol. |
| [Homeassistant Mikrotik](https://github.com/pilotak/homeassistant-mikrotik) | Enables you to execute scripts and perform API requests in MikroTik router |
| [Homeassistant Philipsandroid2014](https://github.com/RobHofmann/HomeAssistant-PhilipsAndroid2014) | Custom component for Philips TV's running Android which are built between 2014 and 2016. Written in Python3 for Home Assistant. |
| [Homeassistant Qbittorrentalternativespeed](https://github.com/JurajNyiri/HomeAssistant-qBitTorrentAlternativeSpeed) | Adds ability to switch alternative speed in qBittorrent through Home Assistant. |
| [Homeassistant Tavos](https://github.com/JurajNyiri/HomeAssistant-Tavos) | Sensor which gathers water outage information from Tavos (Slovakia) website |
| [Homeassistant Teslacustomcomponent](https://github.com/mlowijs/HomeAssistant-TeslaCustomComponent) | None |
| [Homeassistant Virgintivo](https://github.com/bertbert72/HomeAssistant_VirginTivo) | HomeAssistant component for control of Virgin Media Tivo boxes |
| [Homewizard Energy](https://github.com/DCSBL/ha-homewizard-energy) | Custom Home Assistant integration for HomeWizard Energy |
| [Hp Printers Integration](https://github.com/elad-bar/ha-hpprinter) | HP Printer Integration |
| [Hubitat](https://github.com/jason0x43/hacs-hubitat) | A Hubitat integration for Home Assistant |
| [Hue Sensor Advanced](https://github.com/robmarkcole/Hue-sensors-HASS) | Support for Hue motion sensors and device tracker |
| [Hue Service Advanced](https://github.com/Cyr-ius/hass-hue-service-advanced) | Service to set motion's sensors and change scan intervall for remotes and motions |
| [Hunter Douglas And Luxaflex Powerview Cover](https://github.com/safepay/cover.hd_powerview) | Control Hunter Douglas / Luxaflex PowerView Window Shades in Home Assistant |
| [Husqvarna Automower](https://github.com/Thomas55555/husqvarna_automower) | Custom component to monitor and control your Husqvrana Automower |
| [Hvcgroep](https://github.com/cyberjunky/home-assistant-hvcgroep) | :recycle: :wastebasket: This component fetches garbage pickup dates for parts of The Netherlands using HVC Groep's REST API. |
| [Ical Sensor](https://github.com/tybritten/ical-sensor-homeassistant) | an iCal Sensor for Home Assistant |
| [Icloud3 Device Tracker](https://github.com/gcobb321/icloud3) | iCloud3 - An advanced device_tracker custom_component for iPhones, iPads, etc. It monitors zone & location updates triggered by the HA iOS App and supports Apple 2fa verification. |
| [ICS](https://github.com/KoljaWindeler/ics) | Integration that displays the next event of an ics link (support reoccuring events) |
| [Icy E Thermostaat](https://github.com/custom-components/climate.e_thermostaat) | E-Thermostaat (ICY) component for Home Assistant |
| [Ima Protect Alarm](https://github.com/pcourbin/imaprotect) | Home Assistant custom component for IMA Protect Alarm |
| [Impk Sensor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-iMPK) | This sensor uses unofficial API retrieved by decompilation of iMPK application to provide a list of MPK Wrocław news available in original app. |
| [Indoor Air Quality Uk Index](https://github.com/Limych/ha-iaquk) | Indoor Air Quality Sensor Component for Home Assistant |
| [Ingv Istituto Nazionale Di Geofisica E Vulcanologia](https://github.com/caiosweet/Home-Assistant-custom-components-INGV) | INGV - National Institute of Geophysics and Volcanology [Istituto Nazionale di Geofisica e Vulcanologia] Terremoti Italia. |
| [Iphone Device Tracker](https://github.com/mudape/iphonedetect) | A custom component for Home Assistant to detect iPhones connected to local LAN, even if the phone is in deep sleep. |
| [Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) | ♒Irrigation controller for Home Assistant |
| [Jablotron 100](https://github.com/kukulich/home-assistant-jablotron100) | Home Assistant custom component for JABLOTRON 100+ alarm system |
| [Jaguar Landrover Incontrol](https://github.com/msp1974/homeassistant-jlrincontrol) | An integration for JLR InControl to Home Assistant |
| [Jellyfin](https://github.com/koying/jellyfin_ha) | Jellyfin integration for Home Assistant |
| [Jewish Sabbaths Holidays / Sensor](https://github.com/rt400/Jewish-Sabbaths-Holidays) | Jewish Shabbat Yomtov and Holidays times and event |
| [Jq 300/200/100 Indoor Air Quality Meter](https://github.com/Limych/ha-jq300) | JQ-300 Indoor Air Quality Meter Home Assistant Integration |
| [Kaco](https://github.com/KoljaWindeler/kaco) | custom integration for kaco solar inverter |
| [Kan Program](https://github.com/eyalcha/kan_program) | Home assistant custom component to fetch kan program guide |
| [Keymaster](https://github.com/FutureTense/keymaster) | Home Assistant integration for managing Z-Wave enabled locks |
| [Kodi Media Sensors](https://github.com/jtbgroup/kodi-media-sensors) | Custom component to feed multiple sensors in Home Assistan and so custom cards can be to display those sensors. This repository is a fork of https://github.com/boralyl/kodi-recently-added |
| [Kodi Recently Added Media](https://github.com/boralyl/kodi-recently-added) | Custom component to feed recently added tv shows and movies to the custom card "Upcoming Media Card" for Home Assistant.  |
| [Konke](https://github.com/5high/konke) | 控客小K 接入Home Assistant，支持最新版本HA 目前最新版本（0.103），相信未来的版本也可以支持。 |
| [Kostal Piko](https://github.com/gieljnssns/kostalpiko-sensor-homeassistant) | A custom component to get the readings of a Kostal Piko inverter |
| [Kostal Plenticore](https://github.com/ITTV-tools/homeassistant-kostalplenticore) | Home Assistant Component for Kostal Plenticore  |
| [La Marzocco](https://github.com/rccoleman/lamarzocco) | Interact with your La Marzocco espresso machine |
| [Landroid Cloud](https://github.com/MTrab/landroid_cloud) | Landroid Cloud component for Home Assistant |
| [Leaf Spy](https://github.com/jesserockz/ha-leafspy) | A Home Assistant integration to receive live data sent from the LeafSpy app |
| [Lennox Icomfort Wifi Thermostat Integration](https://github.com/thevoltagesource/LennoxiComfort) | Home Assistant custom component for controlling Lennox iComfort WiFi and AirEase Comfort Sync thermostats. |
| [Lg Hombot Vacuum Cleaner](https://github.com/ericpignet/home-assistant-lg_hombot) | LG Hombot/Roboking Component for Home Assistant. |
| [Lightwave Rf](https://github.com/bigbadblunt/homeassistant-lightwave2) | Lightwave RF custom component for Home Assistant. Requires generation 2 ("Link Plus") hub, but will control both generation 1 ("Connect Series") and generation 2 ("Smart Series") devices. |
| [Lightwaverf Ha Energysensor](https://github.com/asantaga/lightwaverf_HA_EnergySensor) | Home Assistant Sensor for the LightwaveRF energy monitor |
| [Linkplay Based Speakers And Devices](https://github.com/nagyrobi/home-assistant-custom-components-linkplay) | LinkPlay based media devices integration for Home Assistant. Fully compatible with Mini Media Player card including speaker group management. Supports snapshot and restore functionality for TTS. |
| [Linksys Ap](https://github.com/custom-components/linksys_ap) | The linksys_ap platform offers presence detection by looking at connected devices to a Linksys based access point. |
| [Linksys Velop Device Tracker](https://github.com/AdamNaj/linksys_velop) | The linksys_velop platform allows for presence detection by listing devices connected to your Linksys Velop router. |
| [Litter Robot](https://github.com/natekspencer/hacs-litterrobot) | Home Assistant integration for a Litter-Robot Connect self-cleaning litter box |
| [Livebox Tv Uhd](https://github.com/AkA57/liveboxtvuhd) | Livebox TV UHD custom component for Home Assistant |
| [Local Luftdaten Sensor](https://github.com/lichtteil/local_luftdaten) | Custom component for Home Assistant that integrates your (own) local Luftdaten sensor (air quality/particle sensor) without using the cloud. |
| [Local Tuya](https://github.com/rospogrigio/localtuya) | local handling for Tuya devices |
| [Looko2 Sensor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Looko2) | This sensor uses official API to get air quality data from https://looko2.com. |
| [Lovelace Gen](https://github.com/thomasloven/hass-lovelace_gen) | 🔹 Improve the lovelace yaml parser for Home Assistant |
| [Ltss](https://github.com/freol35241/ltss) | Long time state storage (LTSS) custom component for Home Assistant using Timescale DB |
| [Lunos Heat Recovery Ventilation](https://github.com/rsnodgrass/hass-lunos) | LUNOS HRV Ventilation Fan Control for Home Assistant |
| [Luxtronik](https://github.com/Bouni/luxtronik) | Luxtronik integration for Home Assistant |
| [Magic Areas](https://github.com/jseidl/hass-magic_areas) | Magic Areas custom_component for Home Assistant |
| [Magic Switchbot](https://github.com/ec-blaster/magicswitchbot-homeassistant) | Magic Switchbot integration component for Home Assistant |
| [Mail And Packages](https://github.com/moralmunky/Home-Assistant-Mail-And-Packages) | Home Assistant integration providing day of package counts and USPS informed delivery images. |
| [Marta / Breeze Card](https://github.com/ryanmac8/Home-Assistant-Marta) | Custom Home Assistant sensor for the Marta/Breeze Card. |
| [Media Player Template](https://github.com/Sennevds/media_player.template) | Template media_player for Home Assistant |
| [Media Player.Screenly](https://github.com/burnnat/media_player.screenly) | Screenly media player custom component for Home Assistant. |
| [Megad](https://github.com/andvikt/mega_hacs) | MegaD HomeAssistant integration |
| [Melnor Raincloud](https://github.com/vanstinator/hass-raincloud) | Melnor Raincloud Home Assistant Integration |
| [Mercedes Me Api](https://github.com/xraver/mercedes_me_api) | Script to use Mercedes Me APIs. |
| [Mercedesme 2020](https://github.com/ReneNulschDE/mbapi2020) | Custom Component to integrate MercedesME devices into Home-Assistant |
| [Meross Homeassistant](https://github.com/albertogeniola/meross-homeassistant) | Custom component that leverages the Meross IoT library to integrate with Homeassistant |
| [Meross Lan](https://github.com/krahabb/meross_lan) | Home Assistant integration for Meross devices |
| [Met Alerts Hungary](https://github.com/amaximus/met_alerts_hu) | Meteo alerts for Hungary |
| [Meteo Swiss](https://github.com/websylv/homeassistant-meteoswiss) | :sun_behind_rain_cloud: :switzerland: Meteo Swiss Integration for Home Assisant |
| [Meteoalarm](https://github.com/kodi1/meteoalarm) | meteoalarm sensor |
| [Meteoalarmeu](https://github.com/xlcnd/meteoalarmeu) | A 'custom component' for Home-Assistant for Weather Warnings from meteoalarm.eu |
| [Meteobridge Datalogger Integration](https://github.com/briis/meteobridge) | The Meteobridge Integration adds support for retrieving current weather data from a Meteobridge datalogger connected to a local Weather Station. |
| [Metlink Wellington Transport](https://github.com/make-all/metlink-nz) | Metlink Wellington Public Transport integration for Home Assistant |
| [Midea Ac Py](https://github.com/andersonshatch/midea-ac-py) | This is a library to allow communicating to a Midea appliance via the Midea cloud. |
| [Midea Smart Aircon](https://github.com/mac-zhou/midea-ac-py) | This is a custom component for Home Assistant to integrate the Midea Air Conditioners via the Local area network. |
| [Miele Integration](https://github.com/HomeAssistant-Mods/home-assistant-miele) | Miele integration for Home assistant |
| [Mikrotik Router](https://github.com/tomaae/homeassistant-mikrotik_router) | Mikrotik router integration for Home Assistant |
| [Mind Mobility](https://github.com/bramkragten/mind) | Add support for Mind Mobility vehicles in Home Assistant |
| [Minerstat](https://github.com/gilsonmandalogo/hacs-minerstat) | Minerstat mining hashrate. |
| [Mint Mobile](https://github.com/ryanmac8/HA-Mint-Mobile) | Mint Mobile Integration for Data Usage Monitoring |
| [Mitsubishi Echonet Climate And Sensor Component](https://github.com/scottyphillips/mitsubishi_hass) | A Home Assistant custom component for use with ECHONET enabled Mitsubishi HVAC systems.  |
| [Mitsubishi Kumo Cloud](https://github.com/dlarrick/hass-kumo) | Home Assistant module interfacing with Mitsubishi mini-split units |
| [Momentary Switch Component](https://github.com/twrecked/hass-momentary) | Momentary Switch Component for Home Assistant |
| [Moneydashboard](https://github.com/shutupflanders/sensor.moneydashboard) | MoneyDashboard Net Balance sensor for HomeAssistant |
| [Monitor Docker](https://github.com/ualex73/monitor_docker) | Monitor Docker containers from Home Assistant |
| [Mqtt Template Switch](https://github.com/lukich48/hass_mqtt_template_switch) | mqtt template switch for homeassistant |
| [Multiscrape   A Home Assistant Custom Scraping Component](https://github.com/danieldotnl/ha-multiscrape) | Home Assistant custom component for scraping multiple values (from a single HTTP request) with a separate sensor for each value. Support for (login) form-submit functionality. |
| [Multizone Controller](https://github.com/Petro31/ha-integration-multizone-controller) | Integration that creates a multi-zone volume controller for media_players in Home Assistant |
| [Musiccast Yamaha](https://github.com/ppanagiotis/pymusiccast) | Group MusicCast Speakers with Home Assistant |
| [Myjdownloader](https://github.com/doudz/homeassistant-myjdownloader) | myjdownloader integration for home assistant |
| [Mylar Sensor Card](https://github.com/DarkSir23/sensor.mylar) | HomeAssistant Sensor for Mylar (Compatible with Upcoming Meda Card) |
| [Narodmon.Ru Cloud Integration](https://github.com/Limych/ha-narodmon) | Component to integrate Narodmon.ru cloud into Home Assistant |
| [Nespresso Ble Coffee Machine](https://github.com/tikismoke/home-assistant-nespressoble) | NESPRESSO ble Home Assistant custom componenets and also a 2MQTT script |
| [Nexia Climate Integration](https://github.com/ryannazaretian/hacs-nexia-climate-integration) | Nexia climate integration for Trane and American Standard thermostats |
| [Next Rocket Launch](https://github.com/Verbalinsurection/next_rocket_launch) | The Next Rocket Launch sensor platform allows you to monitor the next rocket launch from Teamup. |
| [Nextbike Integration](https://github.com/syssi/nextbike) | Nextbike integration for Home Assistant |
| [NHL API](https://github.com/JayBlackedOut/hass-nhlapi) | NHL Stats API Integration Into Home Assistant |
| [Niko Home Control Ii](https://github.com/filipvh/hass-nhc2) | Niko Home Control II Home Assistant Integration |
| [Nintendo Wishlist](https://github.com/custom-components/sensor.nintendo_wishlist) | A sensor that monitors a Nintendo Switch wish list for when games are on sale. |
| [Niwa Tides](https://github.com/muxa/home-assistant-niwa-tides) | Custom integration for Home Assistant to get New Zealand tide information from NIWA Tides API |
| [Nobø Hub / Nobø Energy Control](https://github.com/echoromeo/hanobo) | Home Assistant implementation of pynobo - to control Nobø / Glen Dimplex heaters |
| [Node Red Companion](https://github.com/zachowj/hass-node-red) | Companion Component for node-red-contrib-home-assistant-websocket to help integrate Node-RED with Home Assistant Core |
| [Noonlight   Alarm Monitoring](https://github.com/konnected-io/noonlight-hass) | HomeAssistant integration for Noonlight |
| [Nordpool](https://github.com/custom-components/nordpool) | nordpool sensor for ha. |
| [Nsw Rural Fire Service   Fire Danger](https://github.com/exxamalte/home-assistant-custom-components-nsw-rural-fire-service-fire-danger) | Home Assistant Custom Component: NSW Rural Fire Service Fire Danger |
| [Nuvo Multi Zone Amplifier (Serial)](https://github.com/sprocket-9/hacs-nuvo-serial) | Custom component to control a Nuvo Grand Concerto/Essentia G multi-zone amplifier via serial connection |
| [Nws Alerts](https://github.com/finity69x2/nws_alerts) | An updated version of the nws_alerts custom integration for Home Assistant |
| [Octopus Agile](https://github.com/markgdev/home-assistant_OctopusAgile) | Octopus Agile custom component for Home Assistant |
| [Office 365 Integration](https://github.com/PTST/O365-HomeAssistant) | Office 365 integration for Home Assistant |
| [Omnik Inverter Solar Sensor (No Cloud)](https://github.com/robbinjanssen/home-assistant-omnik-inverter) | Read the current, daily and total power from your Omnik Inverter via local network (no cloud!) |
| [Open Route Service](https://github.com/eifinger/open_route_service) | Custom Component for Homeassistant Providing Travel Time Information using openrouteservice.org |
| [Openhasp](https://github.com/HASwitchPlate/openHASP-custom-component) | Home Assistant custom component for openHASP |
| [Openmediavault](https://github.com/tomaae/homeassistant-openmediavault) | OpenMediaVault integration for Home Assistant |
| [Openmensa Sensor](https://github.com/Mofeywalker/openmensa-hass-component) | A platform sensor which tells you which meals are served in your canteen. |
| [Opennem (Au) Data](https://github.com/bacco007/sensor.opennem) | OpenNEM Sensor for Home Assistant |
| [Openrgb](https://github.com/koying/openrgb_ha) | OpenRGB integration for Home Assistant |
| [Opensprinkler Integration For Home Assistant](https://github.com/vinteo/hass-opensprinkler) | OpenSprinkler Integration for Home Assistant |
| [Openweathermap All](https://github.com/viktak/ha-cc-openweathermap_all) | Home Assistant custom component combining multiple OpenWeatherMap API calls |
| [Optus](https://github.com/itchannel/optus-ha) | Optus Mobile Home Assistant Integration |
| [Orange Livebox Routeur](https://github.com/Cyr-ius/hass-livebox-component) | Livebox Component for Home assistant |
| [Orbit Bhyve](https://github.com/sebr/bhyve-home-assistant) | Orbit BHyve custom component for Home Assistant |
| [Ovh Dynhost](https://github.com/GuilleGF/hassio-ovh) | OVH DynHost Updater Component for https://www.home-assistant.io/ |
| [P2000 Sensor](https://github.com/cyberjunky/home-assistant-p2000) | :fire_engine: This component tracks P2000 emergency events in The Netherlands. |
| [Padavan Tracker](https://github.com/PaulAnnekov/home-assistant-padavan-tracker) | Device tracker component that uses Padavan-based router |
| [Panasonic Comfort Cloud](https://github.com/sockless-coding/panasonic_cc) | Panasonic Comfort Cloud - Home Assistant Component |
| [Panasonic Comfort Cloud Ha Component](https://github.com/djbulsink/panasonic_ac) | Panasonic Comfort Cloud HA component |
| [Panasonic Smart App](https://github.com/osk2/panasonic_smart_app) | 🔛 Panasonic Smart App integration for Home Assistant. |
| [Pandora Car Alarm System](https://github.com/alryaz/hass-pandora-cas) | Home Assistant custom component for Pandora Car Alarm System |
| [Pandora Car Alarm System](https://github.com/turbulator/pandora-cas) | Home Assistant custom component for Pandora Car Alarm System |
| [Passive Ble Monitor Integration (Xiaomi Mibeacon And Scale, Qingping, Atc, Kegtron And Thermoplus Sensors)](https://github.com/custom-components/ble_monitor) | Passively monitors BLE messages from Xiaomi Mijia BLE MiBeacon, Qingping, ATC, Xiaomi Scale, Kegtron and Thermoplus sensors |
| [Pfsense Gateways Monitoring](https://github.com/nagyrobi/home-assistant-custom-components-pfsense-gateways) | Monitor and react on your pfSense gateway's status with Home Assistant. |
| [Phicomm Dc1](https://github.com/5high/phicomm-dc1-homeassistant) | 斐讯DC1插排接入Home Assistant插件，本插件原作者NETYJ，此处仅为HACS安装方便之用。 |
| [Philips Airpurifier](https://github.com/xMrVizzy/philips-airpurifier) | 💨 Philips AirPurifier custom component for Home Assistant. |
| [Philips Ambilight+Hue Switch](https://github.com/Mr-Groch/ambihue) | ON/OFF Abilight+Hue (Switch) component for Philips Ambilight TV's |
| [Philips Hue Play Hdmi Sync Box](https://github.com/mvdwetering/huesyncbox) | Home Assistant integration for the Philips Hue Play HDMI Sync Box |
| [Pijuice Ups Hat](https://github.com/Racailloux/home-assistant-pijuice) | Home Assistant integration to support PiJuice UPS Hat and retrieve values to sensors. |
| [Places](https://github.com/custom-components/places) | Component to integrate with OpenStreetMap Reverse Geocode (PLACE) |
| [Plcbus Integration](https://github.com/tikismoke/home-assistant-plcbus) | a plcbus custom somponents for HomeAssistant |
| [Plex Assistant](https://github.com/maykar/plex_assistant) | ❱ Plex Assistant is a Home Assistant integration for casting Plex media to Google devices, Sonos devices, and Plex clients with Google Assistant, HA's conversation integration, and more. |
| [Plugwise](https://github.com/cyberjunky/home-assistant-plugwise) | :electric_plug: This component can read values from and control Plugwise circles and plugs. |
| [Plugwise Usb Stick](https://github.com/brefra/home-assistant-plugwise-stick) | Plugwise USB-stick integration to support Circle+, Circle and Stealth devices |
| [Pollen Information Hungary](https://github.com/amaximus/pollen_hu) | Home Assistant custom component for Pollen Information in Hungary |
| [Pool Math (Trouble Free Pool)](https://github.com/rsnodgrass/hass-poolmath) | Pool Math for Home Assistant |
| [Popular Times](https://github.com/freakshock88/hass-populartimes) | Custom component for Home Assistant which generates a sensor to show popularity for a google maps place. |
| [Power Calculation](https://github.com/bramstroker/homeassistant-powercalc) | Custom component to calculate estimated power consumption of lights and other appliances |
| [Pre Distribuce Cz](https://github.com/slesinger/HomeAssistant-PREdistribuce) | Home Assistant integration to display info about energy plan |
| [Presence Simulation](https://github.com/slashback100/presence_simulation) | Home Assistant Presence Simulation |
| [Project Three Zero (7 11 Fuel Lock Monitor)](https://github.com/atymic/project_three_zero_ha) | Project Three Zero Home Assistant Integration |
| [Proof Dashcam Integration](https://github.com/dimagoltsman/ha-proof-dashcam-integration) | HACS integration to proof.co.il dashcam |
| [Proscenic 790T Vacuum](https://github.com/deblockt/hass-proscenic-790T-vacuum) | proscenic 790T intergration for home assistant |
| [Public Transport Victoria](https://github.com/bremor/public_transport_victoria) | Custom component for retrieving departure times for Public Transport Victoria. |
| [Pyscript](https://github.com/custom-components/pyscript) | Pyscript adds rich Python scripting to HASS |
| [Qbo](https://github.com/custom-components/qbo) | None |
| [Qubino Wire Pilot](https://github.com/piitaya/home-assistant-qubino-wire-pilot) | Home Assistant Component for Qubino Wire Pilot |
| [Rad Hoekschewaard Afval Kalender](https://github.com/Johnwulp/rad-afval) | Home Assisant sensor component for RAD Hoekschewaard Afval Kalender |
| [Read Your Meter](https://github.com/eyalcha/read_your_meter) | Home Assistant sensor to read water meter |
| [Redfin](https://github.com/dreed47/redfin) | Redfin property estimate Sensor for Home Assistant |
| [Redpocket Mobile](https://github.com/mbillow/ha-redpocket) | RedPocket Integration for Data Usage Monitoring |
| [Remote Home Assistant](https://github.com/custom-components/remote_homeassistant) | Links multiple home-assistant instances together |
| [Remote Picotts](https://github.com/Poeschl/Remote-PicoTTS) | A custom component for Home Assistant which integrates my picoTTS Addon on HASS.io, |
| [Remote Syslog](https://github.com/TheByteStuff/RemoteSyslog_Service) | Home Assistant Custom Component - send Syslog message to remote server. |
| [Renault](https://github.com/hacf-fr/hassRenaultZE) | 🚗 Renault ZE sensor for home assistant |
| [Resrobot](https://github.com/TekniskSupport/home-assistant-resrobot) | Get departure times for swedish public transportation |
| [Reverso Tts / Tts](https://github.com/rt400/ReversoTTS-HA) | ReversoTTS component for HomeAssistant |
| [Rhvoice](https://github.com/definitio/ha-rhvoice) | Home Assistant integration for RHVoice - a local text-to-speech engine. |
| [Rituals Genie](https://github.com/fred-oranje/rituals-genie) | Add Rituals Genie to your HomeAssistant |
| [Rki Covid Numbers](https://github.com/thebino/rki_covid) |  🦠 Custom integration for Home Assistant to monitor covid numbers provided by Robert-Koch Institut |
| [Rocket Launch Live   Next 5 Launches](https://github.com/djtimca/harocketlaunchlive) | Home Assistant custom HACS integration to integrate the next 5 global rocket launches from https://rocketlaunch.live |
| [Rokid Webhook Hass](https://github.com/jihao/rokid-webhook-hass) | rokid webhook component for Home Assistant (若琪HA组件) |
| [Rozkładzik Sensor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Rozkladzik) | This sensor uses unofficial API to get data from https://www.rozkladzik.pl and provide information about departures for chosen stop. |
| [Ruuvitag Sensor](https://github.com/ruuvi-friends/ruuvi-hass.io) | Ruuvi tag BLE sensor for Home Assistant. |
| [Saj Inverter Modbus](https://github.com/wimb0/home-assistant-saj-modbus) | Home Assistant Component for reading data locally from SAJ (and Zonneplan) Inverters through modbus TCP. |
| [Salus It600](https://github.com/jvitkauskas/homeassistant_salus) | Home Assistant integration with Salus thermostates |
| [Samsungtv Encrypted](https://github.com/sermayoral/ha-samsungtv-encrypted) | Samsung TV Encrypted Models (H & J Series) custom component for Home Assistant |
| [Samsungtv Smart](https://github.com/ollo69/ha-samsungtv-smart) | 📺 Home Assistant SamsungTV Smart Component with simplified SmartThings API Support configurable from User Interface. |
| [Samsungtv Tizen](https://github.com/jaruba/ha-samsungtv-tizen) | 📺 HomeAssistant - For Samsung TVs 2016+, Includes SmartThings API and Channel List Support |
| [Satellite Tracker (N2Yo)](https://github.com/djtimca/hasatellitetracker) | Using the N2YO API, this Home Assistant integration will provide visible satellite passes (general) and to add specific satellites for monitoring. |
| [Saver](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Saver) | This custom component allows you to save current state of any entity and use its data later to restore it. |
| [Scheduler Component](https://github.com/nielsfaber/scheduler-component) | Custom component for HA that enables the creation of scheduler entities |
| [School Vacation](https://github.com/rt400/School-Vacation) | None |
| [Sector Alarm](https://github.com/gjohansson-ST/sector) | Integration to Sector Alarm for Home Assistant |
| [Securifi Restful Api](https://github.com/9rpp/securifi) | This is a partial implementation of the Securifi RESTful API for Home Assistant |
| [Securitas Home](https://github.com/vlumikero/home-assistant-securitas) | A Home Assistant custom component for Securitas Home Alarm, for alarms bought in Sweden before 2018-12-01 |
| [Seedboxes.Cc](https://github.com/swartjean/ha-seedboxes-cc) | Home Assistant - Seedboxes.cc Integration |
| [Sems2Mqtt](https://github.com/bouwew/sems2mqtt) | GoodWe SEMS MQTT-componenent for Home Assistant |
| [Senseme](https://github.com/mikelawrence/senseme-hacs) | Haiku with SenseME fan integration for Home Assistant |
| [Sensor.Airthings Wave](https://github.com/custom-components/sensor.airthings_wave) | hassio support for Airthings Wave BLE environmental radon sensor. |
| [Sensor.File Restore](https://github.com/custom-components/sensor.file_restore) | Improved file sensor component that let you read the whole last line content. |
| [Sensor.Fronius](https://github.com/safepay/sensor.fronius) | A Fronius Sensor for Home Assistant |
| [Sensor.Krisinformation](https://github.com/isabellaalstrom/sensor.krisinformation) | A custom component for Home Assistant to get messages from krisinformation.se |
| [Sensor.Owlintuition](https://github.com/custom-components/sensor.owlintuition) | A set of sensors to integrate the OWL Intuition devices network |
| [Sensor.Personalcapital](https://github.com/custom-components/sensor.personalcapital) | 💵 Personal Capital Integration for Bank Account Monitoring |
| [Sensor.Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added) | ▶️ Plex component to feed Upcoming Media Card. |
| [Sensor.Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media) | 🎬 Radarr component to feed Upcoming Media Card. |
| [Sensor.Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media) | 📺 Sonarr component to feed Upcoming Media Card. |
| [Sensor.Ssh](https://github.com/custom-components/sensor.ssh) | SSH Generic Sensor |
| [Sensor.Unifigateway](https://github.com/custom-components/sensor.unifigateway) | High level health status of UniFi Security Gateway devices via UniFi Controller |
| [Sensor.Untappd](https://github.com/custom-components/sensor.untappd) | 🍻 Untappd Integration |
| [Sensor.Willyweather](https://github.com/safepay/sensor.willyweather) | A WillyWeather Australian Bureau of Meteorology (BoM) integration for Home Assistant |
| [Sensor.Yandex Maps](https://github.com/custom-components/sensor.yandex_maps) | A platform which give you the time it will take to drive. |
| [Sensorpush](https://github.com/rsnodgrass/hass-sensorpush) | SensorPush integration for Home Assistant |
| [Shellyforhass (Shelly Integration)](https://github.com/StyraHem/ShellyForHASS) | Shelly smart home platform for Home Assistant |
| [Shinobi Video Nvr](https://github.com/elad-bar/ha-shinobi) | Shinobi Video custom component for HA |
| [SIA](https://github.com/eavanvalkenburg/sia) | SIA alarm systems integration into Home Assistant |
| [Sickchill](https://github.com/youdroid/home-assistant-sickchill) | 🎥 SickChill component to feed Upcoming Media Card. |
| [Simpleicons](https://github.com/vigonotion/hass-simpleicons) | Use Simple Icons in Home Assistant |
| [Sinope Gt125](https://github.com/claudegel/sinope-gt125) | Sinope custom component for Home Assistant to manage Sinopé devices directly via the GT125 gateway |
| [Sinope Neviweb](https://github.com/claudegel/sinope-1) | Neviweb Custom Component for Home Assistant to manage devices connected via GT125 |
| [Sinope Neviweb130](https://github.com/claudegel/sinope-130) | Neviweb custom component for Home Assistant to manage devices connected via a GT130  |
| [Skoda Connect](https://github.com/lendy007/homeassistant-skodaconnect) | Skoda Connect - An home assistant plugin to add integration with your car |
| [Skydance](https://github.com/tomasbedrich/home-assistant-skydance) | A Home Assistant integration for communication with Skydance lighting WiFi relay. |
| [Skyfield Panel With Sun, Moon, And Planets](https://github.com/partofthething/ha_skyfield) | See the apparent positions of the Sun, Moon, and planets in this home assistant custom component |
| [Sl Integration (Haslv3)](https://github.com/hasl-sensor/integration) | HomeAssistant SL Sensor (HASLv3) |
| [Slack User](https://github.com/GeorgeSG/ha-slack-user) | Slack User sensor for Home Assistant |
| [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) | Smart Irrigation custom component for Home Assistant |
| [Smartmi Smart Heater](https://github.com/fineemb/Smartmi-smart-heater) | 智米智能电暖器 |
| [Smartthinq Lge Sensors](https://github.com/ollo69/ha-smartthinq-sensors) | Home Assistant custom integration for SmartThinQ LG devices configurable with Lovelace User Interface. |
| [Snowtire Sensor](https://github.com/Limych/ha-snowtire) | Home Assistant sensor to predict if it's time to change car tires from summer to winter and vice versa. |
| [Solaredge Modbus](https://github.com/binsentsu/home-assistant-solaredge-modbus) | Home assistant Component for reading data locally from Solaredge inverter through modbus TCP |
| [Solcast](https://github.com/dannerph/homeassistant-solcast) | None |
| [Somfy Tahoma](https://github.com/iMicknl/ha-tahoma) | Custom component for Home Assistant to interact with smart devices via Somfy TaHoma or other OverKiz based API's. |
| [Songpal M](https://github.com/kodi1/songpal_m) | songpal - volume down workaround |
| [Sonoff Lan](https://github.com/AlexxIT/SonoffLAN) | Control Sonoff Devices with eWeLink (original) firmware over LAN and/or Cloud from Home Assistant |
| [Sonos Alarm](https://github.com/AaronDavidSchneider/SonosAlarm) | HomeAssistant custom component to control your SONOS Alarm |
| [Sox](https://github.com/definitio/ha-sox) | A Home Assistant integration to turn your vacuum into an audio player. |
| [Spacex Next Launch And Starman](https://github.com/djtimca/HASpaceX) | Home Assistant integration for SpaceX Next Launch and Starman data. |
| [Spotcast](https://github.com/fondberg/spotcast) | Home assistant custom component to start Spotify playback on an idle chromecast device as well as control spotify connect devices |
| [Spzb0001 Thermostat](https://github.com/WolfRevo/climate.spzb0001_thermostat) | A clone created from the Home Assistant generic_thermostat to use EUROTRONIC Zigbee SPZB0001 Thermostats with external temperature sensors |
| [Sql (With Json Detection)](https://github.com/crowbarz/ha-sql_json) | Updated SQL integration for Home Assistant that supports JSON attributes |
| [Srp Energy Sensor](https://github.com/custom-components/srp_energy) | The srp_energy integration shows information from Srp hourly energy usage report for their customers |
| [Stadtreinigung Hamburg](https://github.com/custom-components/sensor.stadtreinigung_hamburg) | Stadtreinigung Hamburg - get garbage collection dates in Hamburg - custom component for Home Assistant |
| [Steam Wishlist](https://github.com/boralyl/steam-wishlist) | A home assistant integration that monitors games on sale on your Steam wishlist. |
| [Sunspec](https://github.com/CJNE/ha-sunspec) | Home Assistant customcomponent for SunSpec modbus devices |
| [Svenska Trygghetslosningar](https://github.com/gjohansson-ST/stl) | Svenska Trygghetslösningar - Home Assistant |
| [Svt Play](https://github.com/lindell/home-assistant-svt-play) | Play SVT Play videos and channels via home assistant |
| [Switchbot Press](https://github.com/cagnulein/switchbot_press) | This is a simple project that manage the Switchbot ( https://amzn.to/3dnliBD ) that has only the "press" ability in Home Assistant. |
| [Sytadin](https://github.com/custom-components/sytadin) | The sytadin sensor platform allows you to monitor traffic details from Sytadin |
| [Taphome](https://github.com/martindybal/taphome-homeassistant) | TapHome integration into Home Assistant. |
| [Tapo: Cameras Control](https://github.com/JurajNyiri/HomeAssistant-Tapo-Control) | Control for Tapo cameras as a Home Assistant component |
| [Tauron Amiplus](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Tauron-AMIplus) | This sensor uses unofficial API to get energy usage and generation data from https://elicznik.tauron-dystrybucja.pl. |
| [Tdameritrade](https://github.com/prairiesnpr/hass-tdameritrade) | TDAmeritrade component for Home Assistant |
| [Technicolor](https://github.com/shaiu/technicolor) | This is an integration for HomeAssistant. It's a Device Tracker component for the Technicolor Gateway. |
| [Temperature Feels Like](https://github.com/Limych/ha-temperature-feels-like) | Sensor of Temperature Feels Like for Home Assistant. |
| [Templatebinarysensor](https://github.com/dlashua/templatebinarysensor) | Add template binary_sensors from the UI. |
| [Teufel Raumfeld](https://github.com/B5r1oJ0A9G/teufel_raumfeld) | Integration for Teufel smart speaker (aka Raumfeld Multiroom) into https://www.home-assistant.io/. |
| [Thermal](https://github.com/eyalcha/thermal) | Thermal camera for Home Assistant |
| [Thermiq Mqtt](https://github.com/ThermIQ/thermiq_mqtt-ha) | Home Assistant integration of ThermIQ-MQTT, providing control and logging of Thermia heatpumps   |
| [Tide](https://github.com/Hellowlol/ha-tide) | Tide a sensor for HASS. |
| [Toon Boiler Status](https://github.com/cyberjunky/home-assistant-toon_boilerstatus) | This component reads and displays the boiler status values from a rooted Toon thermostat. |
| [Toon Climate](https://github.com/cyberjunky/home-assistant-toon_climate) | This component provides a climate device for rooted Toon thermostats. |
| [Toon Smart Meter](https://github.com/cyberjunky/home-assistant-toon_smartmeter) | This component reads and displays sensor values from the meteradapter connected to a rooted Toon thermostat. |
| [Tplink Router](https://github.com/ericpignet/home-assistant-tplink_router) | TPLink router device tracker for Home Assistant |
| [Traccar Cn Hass](https://github.com/jihao/traccar-cn-hass) | A hass component to integrate with traccar_cn which adapts Chinese map coordinates (中文地图 traccar.cn) |
| [Trackimo Device Tracker](https://github.com/troykelly/hacs-trackimo) | Trackimo Integration for HACS Home Assistant |
| [Tractive](https://github.com/Danielhiversen/home_assistant_tractive) | Custom component for Tractive |
| [Trakt](https://github.com/custom-components/sensor.trakt) | 📺 Trakt Integration for Upcoming Media Card |
| [Tryfi Dog Monitor](https://github.com/sbabcock23/hass-tryfi) | Home Assistant integration for TryFi Dog Collar GPS monitoring. |
| [Ttn Gateway Sensor](https://github.com/cyberjunky/home-assistant-ttn_gateway) | This components reads statistics from a The Things Network Gateway. |
| [Tv4 Play](https://github.com/lindell/home-assistant-tv4-play) | Play videos from the Swedish channel 4 |
| [Tvh Rec](https://github.com/kodi1/tvh_rec) | tvheadend recorder sensor - lovelace upcoming media card |
| [Twinkly](https://github.com/dr1rrb/ha-twinkly) | Twinkly integration for Home-Assistant |
| [Ubee Router](https://github.com/kevinhaendel/ha-ubee) | This platform integrates Ubee Routers into Home Assistant. |
| [Ui Template Sensor Configuration](https://github.com/custom-components/templatesensor) | Add template sensors from the UI. |
| [Ultimaker](https://github.com/jellespijker/home-assistant-ultimaker) | Home-Assistant component for Ultimaker printers (UM3, S3, S5) |
| [Ultrasync Beta](https://github.com/caronc/ha-ultrasync) | Interlogix ZeroWire and Hills ComNav (NX-595E) UltraSync Security Panel for Integration for Home Assistant Comunity Store (HACS) |
| [Unifi Protect Integration](https://github.com/briis/unifiprotect) | Control and monitor your Unifi Protect Cameras from Home Assistant |
| [Universal Devices Isy994](https://github.com/shbatm/hacs-isy994) | Custom Integration for ISY994 with Home Assistant (for use with HACS)  |
| [Unsplash](https://github.com/custom-components/unsplash) | A camera platform that give you random images from Unsplash presented as a camera feed. |
| [Uonet+ Vulcan](https://github.com/Antoni-Czaplicki/vulcan-for-hassio) | Vulcan inegration for home assistamt |
| [Uponor Smatrix Pulse](https://github.com/asev/homeassistant-uponor) | Uponor Smatrix Pulse heating/cooling system integration for Home Assistant. |
| [Uponor Uhome Integration](https://github.com/dave-code-ruiz/uhomeuponor) | Custom Component to connect Home Assistant with Uhome Uponor Smatrix App |
| [UPS](https://github.com/custom-components/ups) | The ups platform allows one to track deliveries by the UPS |
| [USR R16 16路网络继电器](https://github.com/blindlight86/HA_USR-R16) | USR-R16 integration for Home Assistant |
| [Vapix](https://github.com/jadson179/vapix) | home-assistant service  for  control the vapix 🚪🔑 |
| [Variable](https://github.com/snarky-snark/home-assistant-variables) | A custom Home Assistant component for declaring and setting generic variable entities dynamically. |
| [Variables+History](https://github.com/Wibias/hass-variables) | Home Assistant variables component |
| [Veolia](https://github.com/tetienne/veolia-custom-component) | Home Assistant custom component to retrieve information from Veolia  |
| [Victor Smart Kill](https://github.com/toreamun/victorsmartkill-homeassistant) | Home Assistant integration for Victor Smart-Kill WI-FI electronic mouse and rat traps from VictorPest.com. |
| [Vimar By Me Hub](https://github.com/h4de5/home-assistant-vimar) | VIMAR by-me integration into home-assistant.io |
| [Viomi Robot Vacuum Cleaner Se (V Rvclm21A)](https://github.com/marotoweb/home-assistant-vacuum-viomise) | Hacky Home assistant support for Viomi SE (V-RVCLM21A) |
| [Virtual Components](https://github.com/twrecked/hass-virtual) | Virtual Components for Home Assistant |
| [Visonic/Bentel/Tyco Alarm System](https://github.com/And3rsL/VisonicAlarm-for-Hassio) | Visonic/Bentel/Tyco Alarm System integrtation for Home Assistant |
| [Vista Pool](https://github.com/tellerbop/havistapool) | Custom Vista Pool Integration for Home Assistant |
| [Volkswagen We Connect](https://github.com/robinostlund/homeassistant-volkswagencarnet) | Volkswagen Carnet Component for home assistant |
| [Warsaw Ztm Information](https://github.com/peetereczek/ztm) | Home Assistant (hass.io) custom component for Warsaw public transport |
| [Waste Collection Schedule](https://github.com/mampfes/hacs_waste_collection_schedule) | Home Assistant integration framework for (garbage collection) schedules |
| [Wasteplan Trv](https://github.com/jonkristian/wasteplan_trv) | Home Assistant component for Trondheim renholdsverk bin pickups. |
| [Waternsw Real Time Data](https://github.com/bacco007/sensor.waternsw) | Home Assistant Sensor for WaterNSW Real Time Data |
| [Wattbox](https://github.com/eseglem/hass-wattbox) | Home Assistant WattBox Component |
| [Wattio](https://github.com/dmoranf/home-assistant-wattio) | Wattio Smart Home custom integration for Home Assistant |
| [Wavin Sentio](https://github.com/djerik/wavinsentio-ha) | Home Assistant component for monitoring and administration of Wavin Sentio underfloor heating system |
| [Weatheralerts](https://github.com/custom-components/weatheralerts) | A sensor that gives you weather alerts from alerts.weather.gov. |
| [Weatherbit Weather Forecast For Home Assistant](https://github.com/briis/weatherbit) | The weatherbit integration adds support for the weatherbit.io web service as a source for meteorological data for your location. |
| [Weatherflow Smart Weather](https://github.com/briis/smartweather) | WeatherFlow Smart Weather Component for Home Assistant |
| [Weback Cloud Integration](https://github.com/opravdin/weback-hass) | Weback integration with Home Assistant |
| [Webrtc Camera](https://github.com/AlexxIT/WebRTC) | Home Assistant custom component for viewing IP cameras RTSP stream in real time using WebRTC and MSE technology |
| [Weenect](https://github.com/eifinger/hass-weenect) | Homeassistant integration for weenect |
| [Weishaupt Wem Portal](https://github.com/erikkastelec/hass-WEM-Portal) | Custom component for retrieving sensor information from Weishaupt WEM Portal |
| [Whatpulse Sensor](https://github.com/SLG/home-assistant-whatpulse) | This component retrieves the statistics from Whatpulse |
| [Wibeee   Abacao](https://github.com/abacao/hass_wibeee) | Home Assistant Component: Mirubee or Wibeee  |
| [Wienerlinien](https://github.com/custom-components/wienerlinien) | A sensor that give you information about next departure from spesified stop. |
| [Wiffi From Stall.Biz](https://github.com/mampfes/hacs_wiffi) | Support for Wiffi devices (e.g. Weatherman, Rainyman) from stall.biz |
| [Winix Purifier](https://github.com/iprak/winix) | Home Assistant component for C545 Winix Air Purifier |
| [Wiserhomeassistantplatform](https://github.com/asantaga/wiserHomeAssistantPlatform) | Platform and related climate/sensors to support the Drayton Wiser Home Heating System |
| [Worldtidesinfocustom](https://github.com/jugla/worldtidesinfocustom) | world tides info custom component for home assistant |
| [Xantech Multi Zone Audio Amplifier](https://github.com/rsnodgrass/hass-xantech) | Xantech Multi-Zone Matrix Audio for Home Assistant |
| [Xiaomi Cloud Map Extractor](https://github.com/PiotrMachowski/Home-Assistant-custom-components-Xiaomi-Cloud-Map-Extractor) | This custom integration provides a way to present a live view of a map for Xiaomi, Roborock, Viomi and Roidmi vacuums without a need for rooting. |
| [Xiaomi Gateway 3](https://github.com/AlexxIT/XiaomiGateway3) | Control Zigbee, BLE and Mesh devices from Home Assistant with Xiaomi Gateway 3 (ZNDMWG03LM) on original firmware |
| [Xiaomi Ir Climate](https://github.com/Anonym-tsk/homeassistant-climate-xiaomi-remote) | Xiaomi IR Climate Component |
| [Xiaomi Mi Air Purifier, Air Humidifier, Air Fresh And Pedestal Fan Integration](https://github.com/syssi/xiaomi_airpurifier) | Xiaomi Mi Air Purifier and Xiaomi Mi Air Humidifier integration for Home Assistant |
| [Xiaomi Mi And Aqara Air Conditioning Companion Integration](https://github.com/syssi/xiaomi_airconditioningcompanion) | Xiaomi Mi and Aqara Air Conditioning Companion integration for Home Assistant |
| [Xiaomi Mi Electric Rice Cooker Integration](https://github.com/syssi/xiaomi_cooker) | Xiaomi Mi Electric Rice Cooker integration for Home Assistant |
| [Xiaomi Mi Smart Pedestal Fan Integration](https://github.com/syssi/xiaomi_fan) | Xiaomi Mi Smart Fan integration for Home Assistant |
| [Xiaomi Mi Smart Wifi Socket Integration](https://github.com/syssi/xiaomiplug) | Xiaomi Mi Smart WiFi Socket integration for Home Assistant |
| [Xiaomi Miio For Yeelink](https://github.com/al-one/hass-miio-yeelink) | Xiaomi Miio Yeelink/Yeelight devices for Home Assistant |
| [Xiaomi Miio Raw](https://github.com/syssi/xiaomi_raw) | Custom component for Home Assistant to faciliate the reverse engeneering of Xiaomi MiIO devices |
| [Xiaomi Mijia Multifunctional Mjysh01Ym](https://github.com/fineemb/Xiaomi-Smart-Multipurpose-Kettle) | 小米养生壶 |
| [Xiaomi Miot](https://github.com/ha0y/xiaomi_miot_raw) | Universal Xiaomi MIoT integration for Home Assistant |
| [Xiaomi Miot Auto](https://github.com/al-one/hass-xiaomi-miot) | Automatic integrate all Xiaomi devices to HomeAssistant via miot-spec, support Wi-Fi, BLE, ZigBee devices. |
| [Xiaomi Philips Lights Integration](https://github.com/syssi/philipslight) | Xiaomi Philips Lights integration for Home Assistant |
| [Yahoo Finance](https://github.com/iprak/yahoofinance) | Home Assistant component which allows you to get stock updates from Yahoo finance. |
| [Yandex Smart Home](https://github.com/dmitry-k/yandex_smart_home) | Adds support for Yandex Smart Home (Alice voice assistant) into Home Assistant |
| [Yandex.Station](https://github.com/AlexxIT/YandexStation) | Управление Яндекс.Станцией и другими колонками с Алисой из Home Assistant |
| [Yeelight Bluetooth](https://github.com/hcoohb/hass-yeelightbt) | Home assistant custom component for Yeelight bluetooth |
| [Yeelight Ven Fan](https://github.com/fineemb/Yeelink-ven-fan) | 接入Hass的凉霸组件 |
| [Youless](https://github.com/reharmsen/hass-youless-component) | Custom Youless component for Home-Assistant  |
| [Youless Ls110](https://github.com/rkoebrugge/hacs-youless-component) | Custom Youless LS110 component for Home-Assistant  |
| [Youtube](https://github.com/custom-components/youtube) | A platform which give you info about the newest video on a channel |
| [Ytube Music Player](https://github.com/KoljaWindeler/ytube_music_player) | YouTube music player for homeassistant |
| [Zaptec](https://github.com/custom-components/zaptec) | zaptec charger custom component for home assistant |
| [Zigate](https://github.com/doudz/homeassistant-zigate) | zigate component for Home Assistant |
| [Ziggonext](https://github.com/Sholofly/ZiggoNext) | Custom component to integrate Arris DCX960 Horizon EOS Settopbox into Home Assistant |
| [Zonneplan One](https://github.com/fsaris/home-assistant-zonneplan-one) | Unofficial Zonneplan ONE + connect integration for Home Assistant |
| [Zoom](https://github.com/raman325/ha-zoom-automation) | Custom Home Assistant component for Zoom. Tracks when you are connected to a Zoom call by default but may allow you to track more. |
| [Zwift Sensors](https://github.com/snicker/zwift_hass) | Zwift Sensor Integration for HomeAssistant |
| [Żadnego Ale](https://github.com/bieniu/ha-zadnego-ale) | Żadnego Ale allergen concentration custom integration |
| [⛏️ Minecraft Version](https://github.com/xMrVizzy/minecraft-version) | 🌿 Minecraft Version Checker for Home Assistant. |
| [小米云服务](https://github.com/fineemb/xiaomi-cloud) | HASS的小米云服务集成 |
| [彩云天气](https://github.com/fineemb/Colorfulclouds-weather) | 用于HASS的彩云天气组件 |

#### HACS - Lovelace Cards

| Name | Description |
| --- | ---|
| [Aftership Card](https://github.com/iantrich/aftership-card) | 📦 Aftership Card for package tracking |
| [Air Purifier Card](https://github.com/fineemb/lovelace-air-filter-card) | 用于Lovelace的小米空气净化器卡片 |
| [Air Visual Card](https://github.com/dnguyen800/air-visual-card) | A Lovelace card showing air quality data from airvisual.com. Requires the AirVisual component. |
| [Analog Clock](https://github.com/tomasrudh/analogclock) | An analog clock for Home Assistant Lovelace |
| [Apexcharts Card](https://github.com/RomRider/apexcharts-card) | 📈 A Lovelace card to display advanced graphs and charts based on ApexChartsJS for Home Assistant |
| [Atomic Calendar](https://github.com/atomic7777/atomic_calendar) | Custom calendar card for Home Assistant with Lovelace |
| [Atomic Calendar Revive](https://github.com/marksie1988/atomic-calendar-revive) | Custom calendar card for Home Assistant with Lovelace |
| [Auto Entities](https://github.com/thomasloven/lovelace-auto-entities) | 🔹Automatically populate the entities-list of lovelace cards |
| [Auto Reload](https://github.com/ben8p/lovelace-auto-reload-card) | Custom home assitant lovelace for UI auto reload |
| [Badge Card](https://github.com/thomasloven/lovelace-badge-card) | 🔹 Place badges anywhere in the lovelace layout |
| [Banner Card](https://github.com/nervetattoo/banner-card) | A fluffy banner card for Home Assistant 🥰 |
| [Bar Card](https://github.com/custom-cards/bar-card) | Customizable Animated Bar card for Home Assistant Lovelace |
| [Battery Entity Row](https://github.com/benct/lovelace-battery-entity-row) | Show battery states or attributes with dynamic icon on entity rows in Home Assistant's Lovelace UI |
| [Battery State Card / Entity Row](https://github.com/maxwroc/battery-state-card) | Battery state card for Home Assistant |
| [Beer Card](https://github.com/custom-cards/beer-card) | This card give you a list of your wishlist items. |
| [Beerbolaget Card](https://github.com/Ceerbeerus/beerbolaget-card) | A custom card for displaying information provided by Beerbolaget (https://github.com/Ceerbeerus/beerbolaget). |
| [Bha Icon Pack](https://github.com/hulkhaugen/hass-bha-icons) | Additional icons for Home Assistant to accompany the MDI icons |
| [Bignumber Card](https://github.com/custom-cards/bignumber-card) | None |
| [Binary Control Button Row](https://github.com/finity69x2/binary-control-button-row) | Provides a customizable button row for binary entities in Home Assistant |
| [Bkk Stop Card](https://github.com/amaximus/bkk-stop-card) | Custom Lovelace card for Budapest Public Transportation custom component |
| [Ble Bulb Card](https://github.com/marcomow/ble-bulb-card) | Custom card for bluetooth bulb (BLE light) control for Homeassistant |
| [Bom Radar Card](https://github.com/theOzzieRat/bom-radar-card) | A rain radar card using the new tiled images from the Australian BOM |
| [Bootstrap Grid Card](https://github.com/idittansikte/bootstrap-grid-card) | Home-assistance lovelace card enabling bootstrap grid css. |
| [Button Card](https://github.com/custom-cards/button-card) | ❇️ Lovelace button-card for home assistant |
| [Button Text Card](https://github.com/Savjee/button-text-card) | Custom, "neumorphism" Lovelace card |
| [Camect Camera Card](https://github.com/pfunkmallone/HACS-camect-custom_card) | A custom card which exposes Camect video streams via the Home Assistant Lovelace interface.  To use this card, you MUST have already installed the Camect HACS integration. |
| [Canary](https://github.com/jcwillox/lovelace-canary) | 🐤 Adds many useful extensions to lovelace, such as templating secondary info, stacking within a card and more! |
| [Canvas Gauge Card](https://github.com/custom-cards/canvas-gauge-card) | The card makes it possible to use gauges from https://canvas-gauges.com/ |
| [Car Card](https://github.com/fineemb/lovelace-car-card) | 车辆仪表盘 |
| [Card Mod](https://github.com/thomasloven/lovelace-card-mod) | 🔹 Add CSS styles to (almost) any lovelace card |
| [Card Tools](https://github.com/thomasloven/lovelace-card-tools) | 🔹A collection of tools for other lovelace plugins to use |
| [Charger Card](https://github.com/tmjo/charger-card) | A lovelace card for electrical vehicle (EV) home chargers and charging robots. |
| [Check Button Card](https://github.com/custom-cards/check-button-card) | Check Button Card is a button that tracks when it is last pressed, for the Home Assistant Lovelace front-end using MQTT auto discovery. |
| [Circle Sensor Card](https://github.com/custom-cards/circle-sensor-card) | A custom component for displaying sensor values as cards or elements |
| [Climate Mode Entity Row](https://github.com/piitaya/lovelace-climate-mode-entity-row) | Climate mode entity for Lovelace |
| [Climate Thermostat Card](https://github.com/fineemb/lovelace-thermostat-card) | Thermostat Lovelace card |
| [Colorfulclouds Weather Card](https://github.com/fineemb/lovelace-colorfulclouds-weather-card) | 这是一个适用于彩云天气集成的Lovelace卡片 |
| [Compass Card](https://github.com/tomvanswam/compass-card) | A Lovelace card that shows a directional indicator on a compass for Home Assistant |
| [Config Template Card](https://github.com/iantrich/config-template-card) | 📝 Templatable Lovelace Configurations |
| [Content Card Remote Control](https://github.com/dimagoltsman/content-card-remote-control) | Home assistant remote control |
| [Cover Control Button Row](https://github.com/finity69x2/cover-control-button-row) | button row for controlling open/close covers in Home Assistant |
| [Cover Element](https://github.com/custom-cards/cover-element) | None |
| [Cover Position Preset Row](https://github.com/finity69x2/cover-position-preset-row) | pluig-in for Home Assistant that provides an easy means set 3 fixed positions for a programmable cover entity. |
| [Cupertino Icons](https://github.com/menahishayan/HomeAssistant-Cupertino-Icons) | Apple iOS-like Cupertino style icons for Home Assistant |
| [Custom Animated Weather Card](https://github.com/DavidFW1960/bom-weather-card) | Custom Animated Weather Card for any weather provider |
| [Custom Brand Icons](https://github.com/elax46/custom-brand-icons) | Custom brand icons for Home Assistant |
| [Custom Card For Warsaw Ztm Information](https://github.com/peetereczek/ztm-stop-card) | Custom Lovelace card for Warsaw public transport |
| [Custom Sidebar](https://github.com/Villhellm/custom-sidebar) | Custom Sidebar for Home Assistant |
| [Dark Sky Rich Weather Card](https://github.com/clayauld/lovelace-darksky-card) | Custom Dark Sky Weather plugin for HACS. This creates a rich weather card using the Dark Sky weather plugin. |
| [Dark Thermostat](https://github.com/ciotlosm/lovelace-thermostat-dark-card) | 🌡 Thermostat card with a round and black feel to it |
| [Decluttering Card](https://github.com/custom-cards/decluttering-card) | 🧹 Declutter your lovelace configuration with the help of this card |
| [Digital Clock](https://github.com/wassy92x/lovelace-digital-clock) | A custom digital clock card for Home Assistant |
| [Dual Gauge Card](https://github.com/custom-cards/dual-gauge-card) | Dual gauge custom card for Lovelace in Home Assistant |
| [Dummy Entity Row](https://github.com/thomasloven/lovelace-dummy-entity-row) | 🔹 An entity row with only icon and name |
| [Easy Layout Card](https://github.com/kamtschatka/lovelace-easy-layout-card) | A modified version of the layout-card with an easier way to configure cards |
| [Entities Button Group](https://github.com/wassy92x/lovelace-entities-btn-group) | A custom card for Home Assistant to group multiple buttons |
| [Entity Attributes Card](https://github.com/custom-cards/entity-attributes-card) | Entity Attributes |
| [Entur Card](https://github.com/jonkristian/entur-card) | This card is made to work with the Entur public transport component. |
| [Ext Weblink](https://github.com/custom-cards/ext-weblink) | Adds ext weblink with icon to picture-elements or entity cards |
| [Extended Banner Card](https://github.com/estevez-dev/extended-banner-card) | Banner Card with extended functionality |
| [Fan Control Entity Row](https://github.com/finity69x2/fan-control-entity-row) | Provides a means to show a compact graphical control row for 2 or 3 speed fans in Home Assistant |
| [Fan Mode Button Row](https://github.com/finity69x2/fan-mode-button-row) | Frontend plugin to control fans in Home Assistant using preset modes for speeds |
| [Fan Percent Button Row](https://github.com/finity69x2/fan-percent-button-row) | Frontend plugin to control fans in Home Assistant using percent values for speeds |
| [Favicon Counter](https://github.com/custom-cards/favicon-counter) | Show a notification count badge. |
| [Firetv Remote Card](https://github.com/marrobHD/firetv-card) | 📺 FireTV Remote Card |
| [Fitbit Card](https://github.com/ljmerza/fitbit-card) | fitbit-card for lovelace |
| [Fkf Budapest Garbage Collection Card](https://github.com/amaximus/fkf-garbage-collection-card) | FKF Budapest Garbage Collection Card for Home Assistant/Lovelace |
| [Flex Table   Highly Customizable, Data Visualization](https://github.com/custom-cards/flex-table-card) | Highly Flexible Lovelace Card - arbitrary contents/columns/rows, regex matched, perfect to show appdaemon created content and anything breaking out of the entity_id + attributes concept |
| [Flexible Horseshoe Card For Lovelace](https://github.com/AmoebeLabs/flex-horseshoe-card) | Flexible Horseshoe card for Home Assistant Lovelace UI. A card with a flexible layout,  a horseshoe-like donut graph, multiple entities or attributes, graphics and animations! |
| [Flexible Horseshoe Card For Lovelace](https://github.com/Lau-ie/flex-horseshoe-card) | Flexible Horseshoe card for Home Assistant Lovelace UI. A card with a flexible layout,  a horseshoe-like donut graph, multiple entities or attributes, graphics and animations! |
| [Floor 3D Visualization Card](https://github.com/adizanni/floor3d-card) | Floor 3D Card to visualize Home Assistant entities using objects in a 3D home model based on Three.js. |
| [Fold Entity Row](https://github.com/thomasloven/lovelace-fold-entity-row) | 🔹 A foldable row for entities card, containing other rows |
| [Folder Card](https://github.com/GeorgeSG/lovelace-folder-card) | 📂 Folder Card for Home Assistant's Lovelace UI |
| [Fullscreen Card](https://github.com/KTibow/fullscreen-card) | Make your Home Assistant browser fullscreen with one tap. |
| [Gallery Card](https://github.com/TarheelGrad1998/gallery-card) | A custom card for Home Assistant that will display images and/or videos from a folder in the style of a gallery.   |
| [Gaode Map Card](https://github.com/fineemb/lovelace-cn-map-card) | 复刻官方Lovelace地图卡片,基于高德地图 |
| [Gap Card](https://github.com/thomasloven/lovelace-gap-card) | 🔹 A lovelace card that does nothing and looks like nothing. Incredibly useful! No, really. |
| [Garbage Collection Card](https://github.com/amaximus/garbage-collection-card) | Custom Lovelace card for Garbage Collection custom component |
| [Gauge Card](https://github.com/custom-cards/gauge-card) | None |
| [Generic Remote Control Card](https://github.com/dimagoltsman/generic-remote-control-card) | a remote control card that can be used with any HA service |
| [Github Card](https://github.com/ljmerza/github-card) | Track your repo issues, starts, forks, and pull requests |
| [Github Entity Row](https://github.com/benct/lovelace-github-entity-row) | GitHub repository sensor data on entity rows in Home Assistant's Lovelace UI |
| [Github Flexi Card / Entity Row](https://github.com/maxwroc/github-flexi-card) | Github stats card for Home Assistant |
| [Group Card](https://github.com/custom-cards/group-card) | None |
| [Group Element](https://github.com/custom-cards/group-element) | A group element for picture-elements with dynamic toggle capability |
| [Gui Sandbox](https://github.com/thomasloven/lovelace-gui-sandbox) | 🔹 Lets you play around with the GUI editors even if you're using YAML mode |
| [Ha (Lovelace) Card Waze Travel Time](https://github.com/r-renato/ha-card-waze-travel-time) | Home Assistant Lovelace card for Waze Travel Time Sensor |
| [Ha (Lovelace) Card Weather Conditions](https://github.com/r-renato/ha-card-weather-conditions) | Weather condition card (Lovelace) for Home Assistant. |
| [Ha Dashboard](https://github.com/wassy92x/lovelace-ha-dashboard) | A custom dashboard for Home Assistant with sidebar |
| [Ha Floorplan](https://github.com/ExperienceLovelace/ha-floorplan) | Bring new life to Home Assistant. By mapping entities to a SVG-object, you're able to control devices, show states, calling services - and much more. Add custom styling on top, to visualize whatever you can think of. Your imagination just become the new limit. |
| [Harmony Card](https://github.com/sbryfcz/harmony-card) | A Home Assistant Lovelace Care for Harmony Integration |
| [Hasl Departure Card](https://github.com/hasl-sensor/lovelace-hasl-departure-card) | Lovelace Departure Card for the HASL Platform |
| [Hasl Traffic Status Card](https://github.com/hasl-sensor/lovelace-hasl-traffic-status-card) | Lovelace Traffic Status Card for the HASL Platform |
| [Honeycomb Menu](https://github.com/Sian-Lee-SA/honeycomb-menu) | Honeycomb menu is a Home Assistant module (not a card) that can be applied to any lovelace card. When activated by the defined action on said card, the module will display a 'rounded' list of honeycomb buttons with an optional XY pad to make interfacing with lovelace more fluent |
| [Html Jinja2 Template Card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-HTML-Jinja2-Template-card) | This card displays provided Jinja2 template as an HTML content of a card. It uses exactly the same engine as Home Assistant in Developer tools. |
| [Hui Element](https://github.com/thomasloven/lovelace-hui-element) | 🔹 Use built-in elements in the wrong place |
| [Jumbo Card](https://github.com/Voxxie/lovelace-jumbo-card) | A custom lovelace card for the custom Jumbo component. |
| [Kanji Clock Card](https://github.com/sopelj/lovelace-kanji-clock-card) | A simple clock widget using Japanese Kanji for date and time |
| [Kibibit Better Graph Colors](https://github.com/Kibibit/kb-better-graph-colors) | Replace the history graph colors with a material design color palette. |
| [Kibibit Frosted Cards](https://github.com/Kibibit/kb-frosted-cards) | Make Cards and Popups blur everything behind them. |
| [Kiosk Mode](https://github.com/maykar/kiosk-mode) | 🙈 Hides the Home Assistant header and/or sidebar |
| [Knx User Forum Icon Set](https://github.com/mampfes/ha-knx-uf-iconset) | Icon set from KNX User Forum for Home Assistant. The icon set contains more than 900 icons for home automation. |
| [Kodi Playlist Card](https://github.com/jtbgroup/kodi-playlist-card) | This repository is used to contain the code of a kodi playlist card for Home Assistant and publish it via HACS |
| [Kodi Search Card](https://github.com/jtbgroup/kodi-search-card) | Custom card for home assistant allowing to search in the libraries of kodi |
| [Krisinfo Card](https://github.com/isabellaalstrom/krisinfo-card) | A Lovelace custom card for custom component Krisinformation is Home Assistant |
| [La Marzocco Config Card](https://github.com/rccoleman/lovelace-lamarzocco-config-card) | Lovelace card to configure network-connected La Marzocco espresso machines |
| [Layout Card](https://github.com/thomasloven/lovelace-layout-card) | 🔹 Get more control over the placement of lovelace cards. |
| [Lg Webos Channel Pad](https://github.com/madmicio/channel-pad) | channel pad for LG TV Remote control |
| [Lg Webos Remote Control](https://github.com/madmicio/LG-WebOS-Remote-Control) | Remote Control for LG TV WebOS |
| [Light Brightness Preset Row](https://github.com/finity69x2/light-brightness-preset-row) | Provides a means to program 3 preset brightness settings for dimmable lights in Home Assistant |
| [Light Entity Card](https://github.com/ljmerza/light-entity-card) | Control any light or switch entity |
| [Light Entity Row](https://github.com/custom-cards/light-entity-row) | Entity row for lights with sliders for adjusting different values based on features |
| [Light Popup Card (Homekit Style)](https://github.com/DBuit/light-popup-card) | Lovelace card to use as custom pop-up for light in homekit style |
| [Light With Profiles](https://github.com/tcarlsen/lovelace-light-with-profiles) | Turn on lights based on light_profiles.csv |
| [Lightalarm Card](https://github.com/chaptergy/lightalarm-card) | ⏰ Lovelace Card to Control Light Alarm Properties |
| [Lightning Detector Card](https://github.com/ironsheep/lovelace-lightning-detector-card) | A Lightning Detection Display Card for Home Assistant Lovelace |
| [Linakdesk Card](https://github.com/IhorSyerkov/linak-desk-card) | Home Assistant Lovelace Card for controlling desks based on linak bluetooth controller. |
| [List Card](https://github.com/iantrich/list-card) | 📰 Display sensor list data in a table |
| [Local Conditional Card](https://github.com/PiotrMachowski/Home-Assistant-Lovelace-Local-Conditional-card) | This card can show and hide a specific card on current device while not affecting other windows. It does not require any integration to run. |
| [Logbook Card](https://github.com/royto/logbook-card) | Logbook card for Home Assistant UI Lovelace |
| [Lovelace Animated Background](https://github.com/Villhellm/lovelace-animated-background) | Animated backgrounds for lovelace  |
| [Lovelace Buien Rain Card](https://github.com/lukevink/lovelace-buien-rain-card) | Graph of Buienradars rain forecast  |
| [Lovelace Card Preloader](https://github.com/gadgetchnnel/lovelace-card-preloader) | Allows preloading of Lovelace cards as a work around for changes in Home Assistant 0.107 |
| [Lovelace Card Templater](https://github.com/gadgetchnnel/lovelace-card-templater) | Custom Lovelace card which allows Jinja2 templates to be applied to other cards |
| [Lovelace Clock Card](https://github.com/Villhellm/lovelace-clock-card) | Basic analog clock for Lovelace |
| [Lovelace Google Keep Card](https://github.com/PiotrMachowski/lovelace-google-keep-card) | This is a companion card for Google Keep sensor. It displays notes downloaded by integration in a friendly way, similar to Google Keep app. |
| [Lovelace Grocy Chores Card](https://github.com/isabellaalstrom/lovelace-grocy-chores-card) | A card to track chores and tasks in Grocy. |
| [Lovelace Hass Aarlo](https://github.com/twrecked/lovelace-hass-aarlo) | Lovelace card for hass-aarlo integration. |
| [Lovelace Home Feed Card](https://github.com/gadgetchnnel/lovelace-home-feed-card) | A custom Lovelace card for displaying a combination of persistent notifications, calendar events, and entities in the style of a feed. |
| [Lovelace Html Card](https://github.com/PiotrMachowski/lovelace-html-card) | This card displays provided data as an HTML content of a card. |
| [Lovelace Lock Card](https://github.com/CyrisXD/love-lock-card) | Home Assistant Lovelace card to lock entire cards behind passwords or prompts. |
| [Lovelace Media Art Background](https://github.com/TheLastProject/lovelace-media-art-background) | Sets the background of your Home Assistant to match the entity picture of a media player |
| [Lovelace Swipe Navigation](https://github.com/maykar/lovelace-swipe-navigation) | ↔️ Swipe through Lovelace views on mobile. |
| [Lovelace Text Input Row](https://github.com/gadgetchnnel/lovelace-text-input-row) | A custom Lovelace text input row for use in entities cards |
| [Lovelace Xiaomi Vacuum Map Card](https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card) | This card enables you to specify a target or start a zoned cleanup using live or static map, just like in Xiaomi Home app. Additionally you can define a list of zones and choose the ones to be cleaned. |
| [Meteoalarm Card](https://github.com/MrBartusek/MeteoalarmCard) | Meteoalarm, Météo-France and DWD weather warnings card for Home Assistant Lovelace UI ⛈️ |
| [Miflora Card](https://github.com/RodBr/miflora-card) | A Home Assistant Lovelace card to report MiFlora plant sensors based on the HA Plant Card. |
| [Mini Climate Card](https://github.com/artem-sedykh/mini-climate-card) | Minimalistic climate card for Home Assistant Lovelace UI |
| [Mini Graph Card](https://github.com/kalkih/mini-graph-card) | Minimalistic graph card for Home Assistant Lovelace UI |
| [Mini Humidifier](https://github.com/artem-sedykh/mini-humidifier) | Minimalistic humidifier card for Home Assistant Lovelace UI |
| [Mini Media Player](https://github.com/kalkih/mini-media-player) | Minimalistic media card for Home Assistant Lovelace UI |
| [More Info Card](https://github.com/thomasloven/lovelace-more-info-card) | 🔹 Display the more-info dialog of any entity as a lovelace card |
| [Multiline Entity Card](https://github.com/jampez77/Multiline-Entity-Card) | A custom entity card for Home Assistant that allows text to span multiple lines. |
| [Multiline Text Input Card](https://github.com/faeibson/lovelace-multiline-text-input-card) | A simple lovelace multiline text input card |
| [Multiple Entity Row](https://github.com/benct/lovelace-multiple-entity-row) | Show multiple entity states and attributes on entity rows in Home Assistant's Lovelace UI |
| [Météo France Weather Card](https://github.com/Imbuzi/meteo-france-weather-card) | Weather Card with animated icons for Home Assistant Lovelace adapted to display all informations from Météo France integration |
| [Neerslag Card](https://github.com/aex351/home-assistant-neerslag-card) | Display Buienalarm and/or Buienradar data in a graph for Home Assistant. |
| [Nextbus Card](https://github.com/dcramer/lovelace-nextbus-card) | A card giving richer public transit display using NextBus sensors. |
| [Nintendo Wishlist Card](https://github.com/custom-cards/nintendo-wishlist-card) | Displays a card showing Nintendo Switch games that are on sale from your wish list. |
| [Notify Card](https://github.com/bernikr/lovelace-notify-card) | Send notifications directly from the dashboard |
| [Number Box](https://github.com/htmltiger/numberbox-card) | Replace input_number sliders with plus and minus buttons |
| [Openmensa Lovelace Card](https://github.com/Mofeywalker/openmensa-lovelace-card) | A Home-Assistant Lovelace card which displays information from the openmensa-sensor. |
| [Opensprinkler Card](https://github.com/rianadon/opensprinkler-card) | Home Assistant card for collecting OpenSprinkler status |
| [Our Groceries Card](https://github.com/ljmerza/our-groceries-card) | our groceries lovelace card |
| [Ozw Network Visualization Card](https://github.com/abmantis/ozw-network-visualization-card) | Lovelace custom card for visualizing the ZWave network with the OpenZWave (beta) integration. |
| [Pandora Cas Card](https://github.com/turbulator/pandora-cas-card) | Pandora lovelace card for Home Assistant |
| [Paper Buttons Row](https://github.com/jcwillox/lovelace-paper-buttons-row) | Adds highly configurable buttons that use actions and per-state styling. |
| [Pc Card](https://github.com/custom-cards/pc-card) | 💵 Personal Capital Card |
| [Phicomm Dc1 Card](https://github.com/fineemb/lovelace-dc1-card) | 斐讯DC1排插的Lovelace卡片 |
| [Pie Chart Card](https://github.com/sdelliot/pie-chart-card) | Generalized Lovelace pie chart card |
| [Plan Coordinates](https://github.com/custom-cards/plan-coordinates) | None |
| [Plant Picture Card](https://github.com/badguy99/PlantPictureCard) | Like a picture glance card, but for plant data |
| [Plex Meets Home Assistant](https://github.com/JurajNyiri/PlexMeetsHomeAssistant) | Custom card which integrates plex into Home Assistant and makes it possible to launch movies or tv shows on TV with a simple click |
| [Podcast Card](https://github.com/iantrich/podcast-card) | 🎧 Podcast Player Card |
| [Pollen Information Card For Hungary](https://github.com/amaximus/pollen-hu-card) | Home Assistant custom Lovelace card for pollen information in Hungary |
| [Posten Card](https://github.com/ezand/lovelace-posten-card) | A Lovelace card to display Norwegian mail delivery days |
| [Power Distribution Card](https://github.com/JonahKr/power-distribution-card) | A Lovelace Card for visualizing power distributions. |
| [Power Usage Card With Regular Expressions](https://github.com/DBa2016/power-usage-card-regex) | Lovelace pie chart card that displays current energy usage |
| [Power Wheel Card](https://github.com/gurbyz/power-wheel-card) | An intuitive way to represent the power and energy that your home is consuming or producing. (A custom card for the Lovelace UI of Home Assistant.) |
| [Purifier Card](https://github.com/denysdovhan/purifier-card) | Air Purifier card for Home Assistant Lovelace UI |
| [Pvpc Hourly Pricing Card](https://github.com/danimart1991/pvpc-hourly-pricing-card) | Home Assistant Lovelace custom card to use with Spain electricity hourly pricing (PVPC) integration |
| [Radial Menu Element](https://github.com/iantrich/radial-menu) | ⭕ Radial Menu Element |
| [Reddit Card](https://github.com/ljmerza/reddit-card) | Reddit Card for Home Assistant |
| [Refreshable Picture Card](https://github.com/dimagoltsman/refreshable-picture-card) | a picture that can be loaded from url or entity attribute and refreshed every N seconds |
| [Rejseplanen Card](https://github.com/DarkFox/rejseplanen-card) | Lovelace card for listing departures from Rejseplanen sensors |
| [Rejseplanen S Tog Card](https://github.com/DarkFox/rejseplanen-stog-card) | Lovelace card for listing departures from Rejseplanen sensors, in the style of S-Tog departure boards. |
| [Restriction Card](https://github.com/iantrich/restriction-card) | 🔒 Apply restrictions to Lovelace cards |
| [Rgb Light Card](https://github.com/bokub/rgb-light-card) | 💡 A Lovelace custom card for RGB lights |
| [Rmv Card](https://github.com/custom-cards/rmv-card) | Custom card for the RMV component. |
| [Roku Card](https://github.com/iantrich/roku-card) | 📺 Roku Remote Card |
| [Roomba Vacuum Card](https://github.com/jeremywillans/lovelace-roomba-vacuum-card) | HA Lovelace Card for iRobot Roomba Vacuum Cleaner leveraging the rest980 Docker Image |
| [Rotel Remote Card](https://github.com/marrobHD/rotel-card) | 🔊 Rotel Remote Card |
| [Rpi Monitor Card](https://github.com/ironsheep/lovelace-rpi-monitor-card) | A Raspberry Pi status display Card for Home Assistant Lovelace |
| [Scheduler Card](https://github.com/nielsfaber/scheduler-card) | HA Lovelace card for control of scheduler entities |
| [Search Card](https://github.com/postlund/search-card) | Quickly search for entities from a Lovelace card. |
| [Secondaryinfo Entity Row](https://github.com/custom-cards/secondaryinfo-entity-row) | Custom entity row for HomeAssistant, providing additional types of data to be displayed in the secondary info area of the Lovelace Entities card |
| [Select List Card](https://github.com/mattieha/select-list-card) | Select List Card displays an input_select entity as a list in lovelace |
| [Shutter Card](https://github.com/Deejayfool/hass-shutter-card) | Shutter card for Home Assistant Lovelace UI |
| [Sidebar Card](https://github.com/DBuit/sidebar-card) | None |
| [Simple Clock Card](https://github.com/fufar/simple-clock-card) | Simple clock card for Home assistant lovelace |
| [Simple Thermostat](https://github.com/nervetattoo/simple-thermostat) | A different take on the thermostat card for Home Assistant ♨️ |
| [Simple Vacuum Card](https://github.com/benct/lovelace-xiaomi-vacuum-card) | Simple card for various robot vacuums in Home Assistant's Lovelace UI |
| [Simple Weather Card](https://github.com/kalkih/simple-weather-card) | Minimalistic weather card for Home Assistant |
| [Slider Button Card](https://github.com/mattieha/slider-button-card) | A button card with integrated slider |
| [Slider Entity Row](https://github.com/thomasloven/lovelace-slider-entity-row) | 🔹 Add sliders to entity cards |
| [Spotify Lovelace Card](https://github.com/custom-cards/spotify-card) | Spotify playlist card for Home Assistant card |
| [Stack In Card](https://github.com/custom-cards/stack-in-card) | 🛠 group multiple cards into one card without the borders |
| [Starline Card](https://github.com/Anonym-tsk/lovelace-starline-card) | StarLine lovelace card for Home Assistant |
| [State Attribute Element](https://github.com/custom-cards/state-attribute-element) | Give you the specified attribute of an entity |
| [State Element](https://github.com/custom-cards/state-element) | Give you the option to prefix the state-label with a formated string. |
| [State Switch](https://github.com/thomasloven/lovelace-state-switch) | 🔹Dynamically replace lovelace cards depending on occasion |
| [Steam Card](https://github.com/Kibibit/kb-steam-card) | A Home Assistant card for Steam integrations |
| [Sun Card](https://github.com/mishaaq/sun-card) | Lovelace card for sun component - Home Assistant |
| [Sun Card](https://github.com/AitorDB/home-assistant-sun-card) | Home assistant sun card based on Google weather design |
| [Surveillance Card](https://github.com/custom-cards/surveillance-card) | A custom component for displaying camera feeds in the style of a surveillance system. |
| [Swipe Card](https://github.com/bramkragten/swipe-card) | Card that allows you to swipe throught multiple cards for Home Assistant Lovelace |
| [Swipe Glance Card](https://github.com/dooz127/swipe-glance-card) | :point_up_2: Swipe Glance Card |
| [Synthwave Hass Extras](https://github.com/bbbenji/synthwave-hass-extras) | Extras for the synthwave inspired theme for Home Assistant |
| [Tab Redirect Card](https://github.com/ben8p/lovelace-tab-redirect-card) | Custom lovelace card to use in Home assistant allowing you to redirect a user to certain view based on entity states. |
| [Template Entity Row](https://github.com/thomasloven/lovelace-template-entity-row) | 🔹 Display whatever you want in an entities card row. |
| [Tempometer Gauge Card](https://github.com/SNoof85/lovelace-tempometer-gauge-card) | Home Assistant Lovelace custom card with Barometer, Thermomer themes and customs themes as well ! |
| [Tesla Style Solar Power Card](https://github.com/reptilex/tesla-style-solar-power-card) | Home assistant power card mimicking the one tesla provides for the powerwall app. |
| [Text Action Element](https://github.com/custom-cards/text-action-element) | None |
| [Text Divider Row](https://github.com/iantrich/text-divider-row) | 🗂 Text Divider Row |
| [Text Element](https://github.com/custom-cards/text-element) | An element that can be used to show static text on the `picture-elements` card |
| [Themable Grid](https://github.com/nervetattoo/themable-grid) | 🀹 Lovelace responsive grid card that can be tweaked in your theme definition. |
| [Thermostat Popup Card](https://github.com/DBuit/thermostat-popup-card) | Lovelace card to use as custom pop-up for thermostat in homekit style |
| [Time Elapsed Card](https://github.com/kirbo/ha-lovelace-elapsed-time-card) | Home Assistant Lovelace Custom Card to calculate time elapsed/left |
| [Time Picker Card](https://github.com/GeorgeSG/lovelace-time-picker-card) | 🕰️ Time Picker Card for Home Assistant's Lovelace UI |
| [Timer Bar Card](https://github.com/rianadon/timer-bar-card) | A progress bar display for Home Assistant timers |
| [Todoist Card](https://github.com/grinstantin/todoist-card) | Todoist card for Home Assistant Lovelace UI. |
| [Todoist Task List](https://github.com/tholgir/TodoIst-Task-List) | This is a custom lovelace card for displaying a todoist calendar in Home Assistant. |
| [Toggle Control Button Row](https://github.com/finity69x2/toggle-control-button-row) | A one-button control row for any Home Assistant binary entity |
| [Tracking Number Card](https://github.com/ljmerza/tracking-number-card) | Show Tracking Numbers from the Email Sensor for Home Assistant |
| [Transmission Card](https://github.com/amaximus/transmission-card) | Custom Transmission card for Home Assistant/Lovelace |
| [Travel Time Card](https://github.com/ljmerza/travel-time-card) | show travel times for you travel time sensors |
| [Tv Remote Card](https://github.com/marrobHD/tv-card) | 📺 TV Remote Card |
| [Unused Card](https://github.com/custom-cards/unused-card) | All your unused entities in a list |
| [Upcoming Media Card](https://github.com/custom-cards/upcoming-media-card) | 📺 A card to display upcoming episodes and movies from services like: Plex, Kodi, Radarr, Sonarr, and Trakt. |
| [Uptime Card](https://github.com/dylandoamaral/uptime-card) | Minimalistic uptime card for Home Assistant Lovelace UI |
| [Username Element](https://github.com/custom-cards/username-element) | Show the current logged in user. |
| [Vacuum Card](https://github.com/denysdovhan/vacuum-card) | Vacuum cleaner card for Home Assistant Lovelace UI |
| [Valetudo Map Card](https://github.com/TheLastProject/lovelace-valetudo-map-card) | Draws the map available from a Xiaomi Vacuum cleaner flashed with Valetudo in a Home Assistant Lovelace card |
| [Vertical Slider Cover Card](https://github.com/konnectedvn/lovelace-vertical-slider-cover-card) | Cover card with homekit style vertical position slider (best with panel-mode but normal-mode works also) |
| [Vertical Stack In Card](https://github.com/ofekashery/vertical-stack-in-card) | 📐 Home Assistant Card: Similar to vertical/horizontal-stack, but removes card borders |
| [Water Heater Card](https://github.com/rsnodgrass/water-heater-card) | Water Heater card for Home Assistant's Lovelace UI |
| [Weather Card](https://github.com/bramkragten/weather-card) | Weather Card with animated icons for Home Assistant Lovelace |
| [Webos Keyboard Card](https://github.com/bernikr/lovelace-webos-keyboard-card) | Type on your WebOS TV using this lovelace card |
| [Xiaomi Fan Lovelace Card](https://github.com/fineemb/lovelace-fan-xiaomi) | Xiaomi Smartmi Fan Lovelace card for HASS/Home Assistant. |
| [Xiaomi Smartmi Fan Card](https://github.com/ikaruswill/lovelace-fan-xiaomi) | Xiaomi Smartmi Fan Lovelace card with CSS fan animation |
| [Yandex Icons](https://github.com/iswitch/ha-yandex-icons) | Yandex devices icons for Home Assistant |
| [Zha Network Card](https://github.com/dmulcahey/zha-network-card) | Custom Lovelace card that displays ZHA network and device information |
| [Zigbee2Mqtt Networkmap Card](https://github.com/azuwis/zigbee2mqtt-networkmap) | Home Assistant Custom Card to show Zigbee2mqtt network map |

#### HACS - Themes

| Name | Description |
| --- | ---|
| [3Ative Blue Theme](https://github.com/3ative/3ative-blue-theme) | 😎 My Theme 'Blue' - with semi-transparent Cards |
| [Amoled Blue](https://github.com/JuanMTech/amoled_blue) | 🎨 By JuanMTech -- A true black Home Assistant theme for devices with AMOLED displays |
| [Amoled Theme](https://github.com/home-assistant-community-themes/amoled) | Amoled theme for Home Assistant |
| [Animated Weather Card](https://github.com/wowgamr/animated-weather-card) | Animated icons for default Home Assistant weather card |
| [Aqua Fiesta Theme](https://github.com/home-assistant-community-themes/aqua-fiesta) | Aqua Fiesta theme for Home Assistant |
| [Blackened Theme](https://github.com/home-assistant-community-themes/blackened) | Blackened theme for Home Assistant |
| [Blue Night Theme](https://github.com/home-assistant-community-themes/blue-night) | Blue Night theme for Home Assistant |
| [Caule Themes Pack 1   By Caulecriativo.Com](https://github.com/orickcorreia/caule-themes-pack-1) | 10 modern colors  |  4 categories of styles (Black Glass, Black, Dark, Light)  |  40 themes in total  |  Animated icons for the weather forecast card  |  And a bonus automatic theme selector for your interface. |
| [Christmas Theme](https://github.com/home-assistant-community-themes/christmas) | Christmas theme for Home Assistant |
| [Clear Theme](https://github.com/naofireblade/clear-theme) | Clear Theme for Home Assistant |
| [Clear Theme Dark](https://github.com/naofireblade/clear-theme-dark) | Dark variant of Clear Theme for Home Assistant |
| [Dark Mint Theme](https://github.com/home-assistant-community-themes/dark-mint) | Another Dark theme for Home Assistant |
| [Dark Orange Theme](https://github.com/home-assistant-community-themes/dark-orange) | Dark Orange theme for Home Assistant |
| [Dark Soft Ui Theme](https://github.com/KTibow/lovelace-dark-soft-ui-theme) | 🎨 Home Assistant soft UI dark theme, with help from @JuanMTech, @thomasloven, and @N-l1. |
| [Dark Teal](https://github.com/aFFekopp/dark_teal) | 🐵 Dark Theme based on clear-theme-dark by @naofireblade |
| [Dark Theme Pack For Home Assistant](https://github.com/awolkers/home-assistant-themes) | A collection of dark themes for Home Assistant.  |
| [Darkish Theme](https://github.com/78wesley/Darkish-Theme) | Darkish-Theme for Home Assistant |
| [Github Dark Theme](https://github.com/einschmidt/github_dark_theme) | A Home Assistant theme inspired on Github. |
| [Github Light Theme](https://github.com/einschmidt/github_light_theme) | A Home Assistant theme inspired on Github. |
| [Google Dark Theme](https://github.com/JuanMTech/google_dark_theme) | 🎨 By JuanMTech -- A Home Assistant theme inspired on the Google app dark mode. |
| [Google Light Theme](https://github.com/JuanMTech/google_light_theme) | 🎨 By JuanMTech -- A Home Assistant theme inspired on the Google app light mode. |
| [Green Dark Mode](https://github.com/JuanMTech/green_dark_mode) | 🎨 By JuanMTech -- A matte black theme with a green accent color |
| [Green Light Mode](https://github.com/JuanMTech/green_light_mode) | 🎨 By JuanMTech -- A light mode theme with a green accent color |
| [Green Slate Theme](https://github.com/pbeckcom/green_slate_theme) | Green adaptation of this Home-Assistant theme:  https://github.com/seangreen2/slate_theme |
| [Grey Night Theme](https://github.com/home-assistant-community-themes/grey-night) | Grey Night theme for Home Assistant |
| [Halloween Theme](https://github.com/home-assistant-community-themes/halloween) | Halloween theme for Home Assistant |
| [Ios Dark Mode](https://github.com/JuanMTech/ios_dark_mode_theme) | 🎨 By JuanMTech -- A Home Assistant theme inspired on the iOS dark mode interface. |
| [Ios Dark Mode Theme](https://github.com/basnijholt/lovelace-ios-dark-mode-theme) | 🏠🤖 Theme by @basnijholt based on iOS Dark Mode for Lovelace Home Assistant  |
| [Ios Light Mode](https://github.com/JuanMTech/ios_light_mode_theme) | 🎨 By JuanMTech -- A Home Assistant theme inspired on the iOS light mode interface. |
| [Ios Light Mode Theme](https://github.com/basnijholt/lovelace-ios-light-mode-theme) | 🏠🤖 Theme based on iOS Light Mode for Lovelace Home Assistant  |
| [Ios Themes   Dark Mode And Light Mode](https://github.com/basnijholt/lovelace-ios-themes) | ❤️📱🏠🤖 Themes inspired by iOS Dark ⬛️ and Light ◻️ Mode for Lovelace Home Assistant with different backgrounds by @basnijholt |
| [Kibibit Theme](https://github.com/Kibibit/hass-kibibit-theme) | A milky glass theme for Home Assistant |
| [Light Soft Ui Theme](https://github.com/KTibow/lovelace-light-soft-ui-theme) | 🎨 Home Assistant soft UI light theme, with help from @JuanMTech, @thomasloven, and @N-L1. |
| [Material Dark Green Theme](https://github.com/home-assistant-community-themes/material-dark-green) | Material Dark Green theme for Home Assistant |
| [Material Dark Pink Theme](https://github.com/home-assistant-community-themes/material-dark-pink) | Material Dark Pink theme for Home Assistant |
| [Material Dark Red Theme](https://github.com/home-assistant-community-themes/material-dark-red) | Material Dark Red theme for Home Assistant |
| [Midnight Blue Theme](https://github.com/home-assistant-community-themes/midnight-blue) | Midnight Blue theme for Home Assistant |
| [Midnight Theme](https://github.com/home-assistant-community-themes/midnight) | Midnight theme for Home Assistant |
| [Noctis](https://github.com/aFFekopp/noctis) | 🐵 Dark Blue Theme for Home Assistant |
| [Noctis Grey](https://github.com/chaptergy/noctis-grey) | Dark Grey Theme for Home Assistant |
| [Nord Theme](https://github.com/home-assistant-community-themes/nord) | Nord theme for Home Assistant |
| [Orange Dark](https://github.com/JuanMTech/orange_dark) | 🎨 By JuanMTech -- A matte black theme with an orange accent color |
| [Orange Light](https://github.com/JuanMTech/orange_light) | 🎨 By JuanMTech -- A light mode theme with an orange accent color |
| [Outline](https://github.com/frenck/home-assistant-theme-outline) | 🎨 Home Assistant Theme: Outline |
| [Oxford Blue](https://github.com/arsaboo/oxford_blue_theme) | Oxford blue theme for Home Assistant |
| [Red Slate Theme](https://github.com/Poeschl/slate_red) | My red"isch" home assistant theme. |
| [Reeder Dark Theme](https://github.com/hekm77/reeder_dark_theme) | Reeder Dark Theme for Home Assistant |
| [Slate Theme](https://github.com/seangreen2/slate_theme) | A Dark Theme for Home Assistant |
| [Solarized Light Theme](https://github.com/home-assistant-community-themes/solarized-light) | Solarized Light theme for Home Assistant |
| [Stell Blue With Colors Theme](https://github.com/home-assistant-community-themes/stell-blue-with-colors) | Stell Blue with Colors theme for Home Assistant |
| [Sundown Theme](https://github.com/am80l/sundown) | Custom theme for home assistant |
| [Swart Ninja Dark Theme](https://github.com/DickSwart/swart_ninja_dark_theme) | 🎨 Green, dark mode theme for Home Assistant, Enjoy.🤘🏻 |
| [Sweet Pink](https://github.com/estiens/sweet_pink_hass_theme) | Theme for home assistant that makes use of pinks and purples and maybe some teal |
| [Synthwave Hass](https://github.com/bbbenji/synthwave-hass) | Synthwave inspired theme for Home Assistant |
| [Teal Theme](https://github.com/home-assistant-community-themes/teal) | Teal theme for Home Assistant |
| [Transparent Blue](https://github.com/JOHLC/transparentblue) | A transparent blue theme for Home Assistant |
| [Ugly Christmas Theme](https://github.com/houtknots/UglyChristmas-Theme) | Christmas theme for Home-Assistant |
| [Ux Goodie Theme](https://github.com/fi-sch/ux_goodie_theme) | 🎨 Theme for Home Assistant inspired by iOS Dark Mode 🌖 |
| [Vaporwave Pink Theme](https://github.com/home-assistant-community-themes/vaporwave-pink) | Vaporwave Pink Theme for Home Assistant |
| [Vibrant (Dark) Clear Theme](https://github.com/myleskeeffe/clear-theme-dark-vibrant) | Vibrant (Dark) Version of Clear Theme |
| [Vintage](https://github.com/Banditen01/vintage_theme) | 🎙️ Vintage theme original colours & style designed by @surendrananup HACS adapted by @Banditen01 |
| [Windows 10 Themes](https://github.com/mikosoft83/hass-windows10-themes) | Home Assistant Windows 10 inspired themes |
| [Your Name.](https://github.com/Nihvel/your_name) | Home Assistant theme - A dark, electric blue theme that reminds the movie Your Name.  |

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
- https://github.com/MaxWinterstein/homeassistant-addons/
- https://github.com/OpenXbox/xboxone-home-assistant
- https://github.com/sabeechen/hassio-google-drive-backup
- https://github.com/Ulrar/hassio-addons


### Addons

Here are the addons I use inside Hass.io, some of the other things I run can be done inside Hass.io, but I've elected not to do so.- [Check Home Assistant configuration]()
- [ESPHome]()
- [Eufy Home Assistant MQTT Bridge]()
- [Glances]()
- [Home Assistant Google Drive Backup]()
- [JupyterLab]()
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