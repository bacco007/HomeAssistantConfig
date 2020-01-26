# TBSmartHome - Home Assistant Configuration

<img align="right" src="./.assets/logo.png?raw=true">

This is my [Home Assistant](https://www.home-assistant.io/) configuration - based on many of the other great configurations are out there (and listed below)

I live in ![Australia](http://flags.ox3.in/mini/au.png) so some of what you find here may not be relevent, or you may have access to better (and probably cheaper) ways.

It's very much a work-in-progress, but feel free to steal ideas or code to use for your own setup

_Please :star: this repo if you find it useful_

![Hits](http://hits.dwyl.io/bacco007/HomeAssistantConfig.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/bacco007/HomeAssistantConfig?style=flat-square) ![GitHub commit activity](https://img.shields.io/github/commit-activity/w/bacco007/HomeAssistantConfig?style=flat-square)
![Licence](https://img.shields.io/badge/license-Unlicense-blue.svg?style=flat-square)
![Twitter Follow](https://img.shields.io/twitter/follow/bacco007?style=social)

---

## Table of Contents

- [TBSmartHome - Home Assistant Configuration](#tbsmarthome---home-assistant-configuration)
  - [Table of Contents](#table-of-contents)
  - [Ecosystem](#ecosystem)
    - [Hardware](#hardware)
    - [Zigbee](#zigbee)
  - [Stats](#stats)
  - [Integrations Used](#integrations-used)
    - [Custom Components Used](#custom-components-used)
  - [Screenshots](#screenshots)
  - [Hass.io Addons](#hassio-addons)
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
  - I run two VMs from this machine, one for Hass.IO and related elements and one for other home server stuff
- Lenovo ThinkMachine M73 Tiny (Intel Pentium G3240T, 4Gb RAM, 500Gb HDD)
  - Ubuntu Server 18.10, this machine runs my UniFi controller and Nginx Reverse Proxy Setup
- Raspberry Pi 3
  - Pi-Hole

### Zigbee

I'm running a combination of Xiaomi Aqara and Samsung SmartThings sensors and a ConBee II as the host

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Stats

_Stats as at 15:58, Sunday, January 26th 2020_

| HA Version                               | No. Integrations                                        | No. Entities | No. Sensors | No. Automations |
| ---------------------------------------- | ------------------------------------------------------- | ------------ | ----------- | --------------- |
| 0.104.3 | 218     | 1252         | 995 | 20 |

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Integrations Used

Here is a list of all the integrations I use, including any Custom Components (which are also listed below)

<details>
<summary>Expand Integrations List</summary>


- [air_quality](https://www.home-assistant.io/components/air_quality)
- [air_quality.dyson](https://www.home-assistant.io/components/air_quality.dyson)
- [alarm_control_panel](https://www.home-assistant.io/components/alarm_control_panel)
- [alarm_control_panel.alexa_media](https://www.home-assistant.io/components/alarm_control_panel.alexa_media)
- [alexa_media](https://www.home-assistant.io/components/alexa_media)
- [almond](https://www.home-assistant.io/components/almond)
- [anniversaries](https://www.home-assistant.io/components/anniversaries)
- [api](https://www.home-assistant.io/components/api)
- [apple_tv](https://www.home-assistant.io/components/apple_tv)
- [auth](https://www.home-assistant.io/components/auth)
- [auto_backup](https://www.home-assistant.io/components/auto_backup)
- [automation](https://www.home-assistant.io/components/automation)
- [binary_sensor](https://www.home-assistant.io/components/binary_sensor)
- [binary_sensor.browser_mod](https://www.home-assistant.io/components/binary_sensor.browser_mod)
- [binary_sensor.cloud](https://www.home-assistant.io/components/binary_sensor.cloud)
- [binary_sensor.deconz](https://www.home-assistant.io/components/binary_sensor.deconz)
- [binary_sensor.hadockermon](https://www.home-assistant.io/components/binary_sensor.hadockermon)
- [binary_sensor.iss](https://www.home-assistant.io/components/binary_sensor.iss)
- [binary_sensor.mobile_app](https://www.home-assistant.io/components/binary_sensor.mobile_app)
- [binary_sensor.openuv](https://www.home-assistant.io/components/binary_sensor.openuv)
- [binary_sensor.proxmoxve](https://www.home-assistant.io/components/binary_sensor.proxmoxve)
- [binary_sensor.sun2](https://www.home-assistant.io/components/binary_sensor.sun2)
- [binary_sensor.template](https://www.home-assistant.io/components/binary_sensor.template)
- [binary_sensor.tod](https://www.home-assistant.io/components/binary_sensor.tod)
- [binary_sensor.updater](https://www.home-assistant.io/components/binary_sensor.updater)
- [breaking_changes](https://www.home-assistant.io/components/breaking_changes)
- [browser_mod](https://www.home-assistant.io/components/browser_mod)
- [calendar](https://www.home-assistant.io/components/calendar)
- [calendar.google](https://www.home-assistant.io/components/calendar.google)
- [camera](https://www.home-assistant.io/components/camera)
- [camera.bom](https://www.home-assistant.io/components/camera.bom)
- [camera.browser_mod](https://www.home-assistant.io/components/camera.browser_mod)
- [camera.generic](https://www.home-assistant.io/components/camera.generic)
- [cast](https://www.home-assistant.io/components/cast)
- [cert_expiry](https://www.home-assistant.io/components/cert_expiry)
- [climate](https://www.home-assistant.io/components/climate)
- [climate.deconz](https://www.home-assistant.io/components/climate.deconz)
- [climate.dyson](https://www.home-assistant.io/components/climate.dyson)
- [cloud](https://www.home-assistant.io/components/cloud)
- [config](https://www.home-assistant.io/components/config)
- [configurator](https://www.home-assistant.io/components/configurator)
- [conversation](https://www.home-assistant.io/components/conversation)
- [cover](https://www.home-assistant.io/components/cover)
- [cover.deconz](https://www.home-assistant.io/components/cover.deconz)
- [deconz](https://www.home-assistant.io/components/deconz)
- [device_automation](https://www.home-assistant.io/components/device_automation)
- [device_tracker](https://www.home-assistant.io/components/device_tracker)
- [device_tracker.icloud](https://www.home-assistant.io/components/device_tracker.icloud)
- [device_tracker.mobile_app](https://www.home-assistant.io/components/device_tracker.mobile_app)
- [device_tracker.unifi](https://www.home-assistant.io/components/device_tracker.unifi)
- [discovery](https://www.home-assistant.io/components/discovery)
- [docker_monitor](https://www.home-assistant.io/components/docker_monitor)
- [dyson](https://www.home-assistant.io/components/dyson)
- [fan](https://www.home-assistant.io/components/fan)
- [fan.dyson](https://www.home-assistant.io/components/fan.dyson)
- [favicon](https://www.home-assistant.io/components/favicon)
- [fontawesome](https://www.home-assistant.io/components/fontawesome)
- [frontend](https://www.home-assistant.io/components/frontend)
- [garbage_collection](https://www.home-assistant.io/components/garbage_collection)
- [geo_location](https://www.home-assistant.io/components/geo_location)
- [geo_location.nsw_rural_fire_service_feed](https://www.home-assistant.io/components/geo_location.nsw_rural_fire_service_feed)
- [geo_location.wwlln](https://www.home-assistant.io/components/geo_location.wwlln)
- [glances](https://www.home-assistant.io/components/glances)
- [google](https://www.home-assistant.io/components/google)
- [group](https://www.home-assistant.io/components/group)
- [hacs](https://www.home-assistant.io/components/hacs)
- [hassio](https://www.home-assistant.io/components/hassio)
- [history](https://www.home-assistant.io/components/history)
- [homeassistant](https://www.home-assistant.io/components/homeassistant)
- [homekit](https://www.home-assistant.io/components/homekit)
- [http](https://www.home-assistant.io/components/http)
- [iaquk](https://www.home-assistant.io/components/iaquk)
- [icloud](https://www.home-assistant.io/components/icloud)
- [ifttt](https://www.home-assistant.io/components/ifttt)
- [influxdb](https://www.home-assistant.io/components/influxdb)
- [ios](https://www.home-assistant.io/components/ios)
- [kodi](https://www.home-assistant.io/components/kodi)
- [lifx](https://www.home-assistant.io/components/lifx)
- [light](https://www.home-assistant.io/components/light)
- [light.browser_mod](https://www.home-assistant.io/components/light.browser_mod)
- [light.deconz](https://www.home-assistant.io/components/light.deconz)
- [light.lifx](https://www.home-assistant.io/components/light.lifx)
- [logger](https://www.home-assistant.io/components/logger)
- [lovelace](https://www.home-assistant.io/components/lovelace)
- [lovelace_gen](https://www.home-assistant.io/components/lovelace_gen)
- [map](https://www.home-assistant.io/components/map)
- [media_player](https://www.home-assistant.io/components/media_player)
- [media_player.alexa_media](https://www.home-assistant.io/components/media_player.alexa_media)
- [media_player.apple_tv](https://www.home-assistant.io/components/media_player.apple_tv)
- [media_player.braviatv](https://www.home-assistant.io/components/media_player.braviatv)
- [media_player.browser_mod](https://www.home-assistant.io/components/media_player.browser_mod)
- [media_player.cast](https://www.home-assistant.io/components/media_player.cast)
- [media_player.kodi](https://www.home-assistant.io/components/media_player.kodi)
- [media_player.plex](https://www.home-assistant.io/components/media_player.plex)
- [media_player.sonos](https://www.home-assistant.io/components/media_player.sonos)
- [media_player.spotify](https://www.home-assistant.io/components/media_player.spotify)
- [met](https://www.home-assistant.io/components/met)
- [mobile_app](https://www.home-assistant.io/components/mobile_app)
- [mqtt](https://www.home-assistant.io/components/mqtt)
- [netatmo](https://www.home-assistant.io/components/netatmo)
- [nodered](https://www.home-assistant.io/components/nodered)
- [notify](https://www.home-assistant.io/components/notify)
- [notify.alexa_media](https://www.home-assistant.io/components/notify.alexa_media)
- [notify.ios](https://www.home-assistant.io/components/notify.ios)
- [notify.mobile_app](https://www.home-assistant.io/components/notify.mobile_app)
- [notify.slack](https://www.home-assistant.io/components/notify.slack)
- [onboarding](https://www.home-assistant.io/components/onboarding)
- [openuv](https://www.home-assistant.io/components/openuv)
- [panel_custom](https://www.home-assistant.io/components/panel_custom)
- [panel_iframe](https://www.home-assistant.io/components/panel_iframe)
- [persistent_notification](https://www.home-assistant.io/components/persistent_notification)
- [person](https://www.home-assistant.io/components/person)
- [pi_hole](https://www.home-assistant.io/components/pi_hole)
- [plex](https://www.home-assistant.io/components/plex)
- [proxmoxve](https://www.home-assistant.io/components/proxmoxve)
- [python_script](https://www.home-assistant.io/components/python_script)
- [readme](https://www.home-assistant.io/components/readme)
- [recorder](https://www.home-assistant.io/components/recorder)
- [remote](https://www.home-assistant.io/components/remote)
- [remote.apple_tv](https://www.home-assistant.io/components/remote.apple_tv)
- [remote.harmony](https://www.home-assistant.io/components/remote.harmony)
- [sabnzbd](https://www.home-assistant.io/components/sabnzbd)
- [scene](https://www.home-assistant.io/components/scene)
- [scene.deconz](https://www.home-assistant.io/components/scene.deconz)
- [scene.homeassistant](https://www.home-assistant.io/components/scene.homeassistant)
- [script](https://www.home-assistant.io/components/script)
- [sensor](https://www.home-assistant.io/components/sensor)
- [sensor.alexa_media](https://www.home-assistant.io/components/sensor.alexa_media)
- [sensor.alpha_vantage](https://www.home-assistant.io/components/sensor.alpha_vantage)
- [sensor.anniversaries](https://www.home-assistant.io/components/sensor.anniversaries)
- [sensor.auto_backup](https://www.home-assistant.io/components/sensor.auto_backup)
- [sensor.bom](https://www.home-assistant.io/components/sensor.bom)
- [sensor.bom_forecast](https://www.home-assistant.io/components/sensor.bom_forecast)
- [sensor.breaking_changes](https://www.home-assistant.io/components/sensor.breaking_changes)
- [sensor.browser_mod](https://www.home-assistant.io/components/sensor.browser_mod)
- [sensor.cert_expiry](https://www.home-assistant.io/components/sensor.cert_expiry)
- [sensor.command_line](https://www.home-assistant.io/components/sensor.command_line)
- [sensor.deconz](https://www.home-assistant.io/components/sensor.deconz)
- [sensor.docker_monitor](https://www.home-assistant.io/components/sensor.docker_monitor)
- [sensor.doomsday_clock](https://www.home-assistant.io/components/sensor.doomsday_clock)
- [sensor.dyson](https://www.home-assistant.io/components/sensor.dyson)
- [sensor.feedparser](https://www.home-assistant.io/components/sensor.feedparser)
- [sensor.filter](https://www.home-assistant.io/components/sensor.filter)
- [sensor.garbage_collection](https://www.home-assistant.io/components/sensor.garbage_collection)
- [sensor.glances](https://www.home-assistant.io/components/sensor.glances)
- [sensor.hacs](https://www.home-assistant.io/components/sensor.hacs)
- [sensor.here_travel_time](https://www.home-assistant.io/components/sensor.here_travel_time)
- [sensor.iaquk](https://www.home-assistant.io/components/sensor.iaquk)
- [sensor.icloud](https://www.home-assistant.io/components/sensor.icloud)
- [sensor.ios](https://www.home-assistant.io/components/sensor.ios)
- [sensor.mobile_app](https://www.home-assistant.io/components/sensor.mobile_app)
- [sensor.moon](https://www.home-assistant.io/components/sensor.moon)
- [sensor.netatmo](https://www.home-assistant.io/components/sensor.netatmo)
- [sensor.netdata](https://www.home-assistant.io/components/sensor.netdata)
- [sensor.nodered](https://www.home-assistant.io/components/sensor.nodered)
- [sensor.nsw_air_quality](https://www.home-assistant.io/components/sensor.nsw_air_quality)
- [sensor.nsw_fuel_station](https://www.home-assistant.io/components/sensor.nsw_fuel_station)
- [sensor.nsw_rural_fire_service_fire_danger](https://www.home-assistant.io/components/sensor.nsw_rural_fire_service_fire_danger)
- [sensor.openuv](https://www.home-assistant.io/components/sensor.openuv)
- [sensor.pi_hole](https://www.home-assistant.io/components/sensor.pi_hole)
- [sensor.plex](https://www.home-assistant.io/components/sensor.plex)
- [sensor.plex_recently_added](https://www.home-assistant.io/components/sensor.plex_recently_added)
- [sensor.radarr](https://www.home-assistant.io/components/sensor.radarr)
- [sensor.radarr_upcoming_media](https://www.home-assistant.io/components/sensor.radarr_upcoming_media)
- [sensor.rest](https://www.home-assistant.io/components/sensor.rest)
- [sensor.sabnzbd](https://www.home-assistant.io/components/sensor.sabnzbd)
- [sensor.season](https://www.home-assistant.io/components/sensor.season)
- [sensor.snmp](https://www.home-assistant.io/components/sensor.snmp)
- [sensor.sonarr](https://www.home-assistant.io/components/sensor.sonarr)
- [sensor.sonarr_upcoming_media](https://www.home-assistant.io/components/sensor.sonarr_upcoming_media)
- [sensor.speedtestdotnet](https://www.home-assistant.io/components/sensor.speedtestdotnet)
- [sensor.sql](https://www.home-assistant.io/components/sensor.sql)
- [sensor.statistics](https://www.home-assistant.io/components/sensor.statistics)
- [sensor.sun2](https://www.home-assistant.io/components/sensor.sun2)
- [sensor.synologydsm](https://www.home-assistant.io/components/sensor.synologydsm)
- [sensor.systemmonitor](https://www.home-assistant.io/components/sensor.systemmonitor)
- [sensor.tautulli](https://www.home-assistant.io/components/sensor.tautulli)
- [sensor.template](https://www.home-assistant.io/components/sensor.template)
- [sensor.time_date](https://www.home-assistant.io/components/sensor.time_date)
- [sensor.transmission](https://www.home-assistant.io/components/sensor.transmission)
- [sensor.tvh_rec](https://www.home-assistant.io/components/sensor.tvh_rec)
- [sensor.unifi](https://www.home-assistant.io/components/sensor.unifi)
- [sensor.unifigateway](https://www.home-assistant.io/components/sensor.unifigateway)
- [sensor.upnp](https://www.home-assistant.io/components/sensor.upnp)
- [sensor.uptime](https://www.home-assistant.io/components/sensor.uptime)
- [sensor.version](https://www.home-assistant.io/components/sensor.version)
- [sensor.waqi](https://www.home-assistant.io/components/sensor.waqi)
- [sensor.waternsw](https://www.home-assistant.io/components/sensor.waternsw)
- [sensor.worldclock](https://www.home-assistant.io/components/sensor.worldclock)
- [sonos](https://www.home-assistant.io/components/sonos)
- [speedtestdotnet](https://www.home-assistant.io/components/speedtestdotnet)
- [ssdp](https://www.home-assistant.io/components/ssdp)
- [stt](https://www.home-assistant.io/components/stt)
- [sun](https://www.home-assistant.io/components/sun)
- [switch](https://www.home-assistant.io/components/switch)
- [switch.alexa_media](https://www.home-assistant.io/components/switch.alexa_media)
- [switch.command_line](https://www.home-assistant.io/components/switch.command_line)
- [switch.deconz](https://www.home-assistant.io/components/switch.deconz)
- [switch.docker_monitor](https://www.home-assistant.io/components/switch.docker_monitor)
- [switch.template](https://www.home-assistant.io/components/switch.template)
- [switch.transmission](https://www.home-assistant.io/components/switch.transmission)
- [switch.unifi](https://www.home-assistant.io/components/switch.unifi)
- [system_health](https://www.home-assistant.io/components/system_health)
- [system_log](https://www.home-assistant.io/components/system_log)
- [transmission](https://www.home-assistant.io/components/transmission)
- [tts](https://www.home-assistant.io/components/tts)
- [unifi](https://www.home-assistant.io/components/unifi)
- [updater](https://www.home-assistant.io/components/updater)
- [upnp](https://www.home-assistant.io/components/upnp)
- [vacuum](https://www.home-assistant.io/components/vacuum)
- [vacuum.dyson](https://www.home-assistant.io/components/vacuum.dyson)
- [weather](https://www.home-assistant.io/components/weather)
- [weather.met](https://www.home-assistant.io/components/weather.met)
- [webhook](https://www.home-assistant.io/components/webhook)
- [websocket_api](https://www.home-assistant.io/components/websocket_api)
- [wwlln](https://www.home-assistant.io/components/wwlln)
- [zeroconf](https://www.home-assistant.io/components/zeroconf)
- [zone](https://www.home-assistant.io/components/zone)</details>



### Custom Components Used

<details>
<summary>Expand Custom Components List</summary>

- [Alexa Media Player](https://github.com/custom-components/alexa_media_player/wiki)
- [Anniversaries](https://github.com/pinkywafer/Anniversaries)
- [Apple TV](https://www.home-assistant.io/integrations/apple_tv)
- [Auto Backup](https://github.com/jcwillox/hass-auto-backup)
- [BOM Forecast](https://github.com/davidfw1960/bom_forecast)
- [Breaking Changes](https://github.com/custom-components/breaking_changes)
- [Browser mod]()
- [Docker Monitor](https://github.com/Sanderhuisman/docker_monitor)
- [Doomsday Clock](https://github.com/renemarc/home-assistant-doomsday-clock)
- [Favicon changer]()
- [Feedparser](https://github.com/custom-components/feedparser/blob/master/README.md)
- [Fontawesome icons]()
- [Garbage Collection](https://github.com/bruxy70/Garbage-Collection/)
- [Generate readme](https://github.com/custom-components/readme)
- [HA Dockermon](https://github.com/custom-components/switch.hadockermon)
- [HACS (Home Assistant Community Store)](https://hacs.xyz)
- [HDHomeRun](https://github.com/burnnat/ha-hdhomerun)
- [IAQ UK](https://github.com/Limych/ha-iaquk)
- [Lovelace Gen]()
- [Node-RED](https://github.com/zachowj/node-red)
- [NSW Air Quality]()
- [NSW Rural Fire Service - Fire Danger]()
- [Plex Recently Added](https://github.com/custom-components/sensor.plex_recently_added)
- [Radarr Upcoming Media](https://github.com/custom-components/sensor.radarr_upcoming_media)
- [Sonarr Upcoming Media](https://github.com/custom-components/sensor.sonarr_upcoming_media)
- [Sun2](https://github.com/pnbruckner/ha-sun2/blob/master/README.md)
- [Tvheadend recordings sensor](https://github.com/kodi1/tvh_rec)
- [UniFi Gateway](https://github.com/custom-components/sensor.unifigateway)
- [Water NSW](https://github.com/bacco007/sensor.waternsw)
</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Screenshots

![Screenshot - Home](./.assets/screencapture-home.png?raw=True)

<details>
<summary>More Screenshots Here</summary>

![Screenshot - App Dashboard](./.assets/screencapture-appdashboard.png?raw=True)

![Screenshot - Rooms](./.assets/screencapture-rooms.png?raw=True)

![Screenshot - System](./.assets/screencapture-system.png?raw=True)

![Screenshot - Server](./.assets/screencapture-server.png?raw=True)

![Screenshot - Fire](./.assets/screencapture-fire.png?raw=True)

![Screenshot - HA](./.assets/screencapture-homeassistant.png?raw=True)

</details>

<p align="right"><a href="#top" title="Back to top">Top</a></p>

---

## Hass.io Addons

Here are the addons I use inside Hass.io, some of the other things I run can be done inside Hass.io, but I've elected not to do so.

- [AppDaemon](https://github.com/hassio-addons/addon-appdaemon3)
- [deCONZ](https://github.com/home-assistant/hassio-addons/tree/master/deconz)
- [MQTT Server & Web Client](https://github.com/hassio-addons/addon-mqtt/)
- [MariaDB](https://home-assistant.io/addons/mariadb/)
- [Node-RED](https://github.com/hassio-addons/addon-node-red/)
- [SSH & Web Terminal](https://github.com/hassio-addons/addon-ssh/)
- [Visual Studio Code](https://github.com/hassio-addons/addon-vscode)

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