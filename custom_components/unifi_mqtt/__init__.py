"""
Custom component that fetches UniFi device stats and publishes them via MQTT.

This integration queries a UniFi controller for device statistics and publishes
the data via MQTT discovery every UPDATE_INTERVAL seconds.

Due to Home Assistant’s MQTT discovery behavior, if you supply both a sensor “name”
and a device “name” that are identical, Home Assistant will concatenate them.
For example, if both are "UAP NanoHD", the friendly name becomes "UAP NanoHD UAP NanoHD".
There is currently no discovery parameter to disable this behavior.
To have the friendly name display exactly as "UAP NanoHD", you must manually override
the entity’s friendly name in the Home Assistant entity registry after discovery.
"""

import asyncio
import json
import logging
import re
from datetime import timedelta

import pandas as pd
import urllib3
from pyunifi.controller import Controller

from homeassistant.components.mqtt import async_publish
from homeassistant.helpers.event import async_track_time_interval

# Suppress urllib3's InsecureRequestWarning at import time. Users commonly run
# their UniFi controller with a self-signed cert and set verify_ssl=False, in
# which case urllib3 logs this warning on every reconnect. Applying the filter
# inside async_setup_entry is too late — the first login call races with it.
# No-op when verify_ssl is True, since no warning is emitted in that case.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from .const import (
    DOMAIN,
    CONF_HOST,
    CONF_USERNAME,
    CONF_PASSWORD,
    CONF_SITE_ID,
    CONF_PORT,
    CONF_VERIFY_SSL,
    CONF_VERSION,
    CONF_UPDATE_INTERVAL,
    DEFAULT_UPDATE_INTERVAL
)

_LOGGER = logging.getLogger(__name__)


def sanitize_name(device_name):
    """Sanitizes a string by replacing characters not in [a-zA-Z0-9_-] with '_'."""
    return re.sub(r'[^a-zA-Z0-9_-]', '_', device_name)

async def async_setup_entry(hass, entry):
    """Set up the UniFi MQTT integration from a config entry."""
    host = entry.data[CONF_HOST]
    username = entry.data[CONF_USERNAME]
    password = entry.data[CONF_PASSWORD]
    site_id = entry.data[CONF_SITE_ID]
    port = entry.data[CONF_PORT]
    verify_ssl = entry.data[CONF_VERIFY_SSL]
    version = entry.data[CONF_VERSION]
    update_interval = entry.options.get(
        CONF_UPDATE_INTERVAL,
        entry.data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL),
    )

    def init_controller():
        return Controller(
            host, username, password, port, version, site_id=site_id, ssl_verify=verify_ssl
        )

    try:
        controller = await hass.async_add_executor_job(init_controller)
    except Exception as e:
        _LOGGER.error("Failed to initialize UniFi controller: %s", e)
        return False

    entry_data = hass.data.setdefault(DOMAIN, {}).setdefault(entry.entry_id, {})
    # Cache of last-published discovery payload per MAC, so we only re-publish
    # when the payload changes (e.g. firmware or name update) instead of every cycle.
    entry_data["discovery_cache"] = {}
    # Exponential-backoff state for upstream failures. UniFi controllers apply a
    # login rate-limit; without backoff a short poll interval hits the limit and
    # the integration silently stops publishing after a few hours (issue #25).
    entry_data["consecutive_failures"] = 0
    entry_data["skip_cycles"] = 0

    async def update_unifi_data(now):
        """Fetch data from the UniFi controller and publish MQTT discovery, state, and attribute messages."""
        if entry_data["skip_cycles"] > 0:
            entry_data["skip_cycles"] -= 1
            return

        try:
            unifi_devices = await hass.async_add_executor_job(controller.get_aps)
        except Exception as err:
            entry_data["consecutive_failures"] += 1
            # Backoff cycles: 1, 3, 7, 15, 31, 60 (capped). On a 60s interval
            # that's a worst-case hour between retries after repeated failures.
            entry_data["skip_cycles"] = min(2 ** entry_data["consecutive_failures"] - 1, 60)
            if entry_data["consecutive_failures"] == 1:
                _LOGGER.warning(
                    "Error fetching UniFi devices (%s); backing off exponentially.",
                    err,
                )
            else:
                _LOGGER.debug(
                    "Error fetching UniFi devices (%d consecutive, next attempt in %d cycles): %s",
                    entry_data["consecutive_failures"],
                    entry_data["skip_cycles"] + 1,
                    err,
                )
            return

        if entry_data["consecutive_failures"] > 0:
            _LOGGER.info(
                "UniFi controller reachable again after %d failed attempts",
                entry_data["consecutive_failures"],
            )
            entry_data["consecutive_failures"] = 0

        active_devices = []

        for device in unifi_devices:
            # If the device is not a dictionary, log its value and skip processing it.
            if not isinstance(device, dict):
                continue
                
            if not device.get("adopted"):
                continue

            target_mac = device.get("mac")
            try:
                devs = await hass.async_add_executor_job(controller.get_device_stat, target_mac)
            except Exception as err:
                _LOGGER.error("Error fetching stats for %s: %s", target_mac, err)
                continue

            device_name = devs.get("name", "Unknown")
            mac = devs.get("mac", "Unknown")
            device_type = devs.get("type", "Unknown")
            uptime_seconds = devs.get("uptime", 0)

            # Sanitize the device name for use in MQTT topics
            sanitized_name = sanitize_name(device_name)

            # Calculate uptime
            days = uptime_seconds // 86400
            hours = (uptime_seconds % 86400) // 3600
            minutes = (uptime_seconds % 3600) // 60
            uptime = f"{days}d {hours}h {minutes}m"

            # Base attributes
            attributes = {
                "type": device_type,
                "status": "On" if devs.get("state") == 1 else "Off",
                "mac_address": mac,
                "model": devs.get("model", "Unknown"),
                "cpu": devs.get("system-stats", {}).get("cpu", "N/A"),
                "ram": devs.get("system-stats", {}).get("mem", "N/A"),
                "activity": round(
                    (devs.get("uplink", {}).get("rx_bytes-r", 0) / 125000)
                    + (devs.get("uplink", {}).get("tx_bytes-r", 0) / 125000),
                    1,
                ),
                "bytes_rx": devs.get("rx_bytes", 0),
                "bytes_tx": devs.get("tx_bytes", 0),
                "update": "available" if devs.get("upgradable") else "none",
                "firmware_version": devs.get("version", "Unknown"),
                "ip_address": devs.get("ip", "Unknown"),
            }

            # Add additional attributes for switches
            if device_type == "usw":
                port_status = {}
                port_poe = {}
                port_power = {}

                if devs.get("state") == 1:
                    port_table_data = devs.get("port_table") or []
                    port_table = pd.DataFrame(port_table_data)
                    if not port_table.empty and "port_idx" in port_table.columns:
                        port_table = port_table.sort_values("port_idx")
                        for index, row in port_table.iterrows():
                            port_status[f"port{row['port_idx']}"] = "up" if row["up"] else "down"
                            if "port_poe" in port_table.columns:
                                port_poe[f"port{row['port_idx']}"] = "power" if row["port_poe"] else "none"
                            if "poe_power" in port_table.columns:
                                port_power[f"port{row['port_idx']}"] = 0 if pd.isna(row["poe_power"]) else row["poe_power"]

                current_temperature = devs.get("general_temperature", 0) if devs.get("has_temperature") else "N/A"

                attributes.update({
                    "ports_used": devs.get("num_sta", 0),
                    "ports_user": devs.get("user-num_sta", 0),
                    "ports_guest": devs.get("guest-num_sta", 0),
                    "active_ports": port_status,
                    "poe_ports": port_poe,
                    "poe_power": port_power,
                    "total_used_power": devs.get("total_used_power", 0),
                    "current_temperature": current_temperature,
                })

            # Add additional attributes for access points
            elif device_type == "uap":
                vap_table_data = devs.get("vap_table") or []
                vap_table = pd.DataFrame(vap_table_data)
                if not vap_table.empty and "radio" in vap_table.columns:
                    ghz2_4 = vap_table[vap_table["radio"] == "ng"]
                    ghz5 = vap_table[vap_table["radio"] == "na"]
                    ghz6 = vap_table[vap_table["radio"] == "6e"]
                else:
                    empty = pd.DataFrame()
                    ghz2_4 = ghz5 = ghz6 = empty

                radio_24ghz = {}
                for index, row in ghz2_4.iterrows():
                    radio_24ghz[f"ssid{index}"] = {
                        "ssid": row["essid"],
                        "channel": row["channel"],
                        "number_connected": row["num_sta"],
                        "satisfaction": 0 if row["satisfaction"] == -1 else row["satisfaction"],
                        "bytes_rx": row["rx_bytes"],
                        "bytes_tx": row["tx_bytes"],
                        "guest": row["is_guest"],
                    }

                radio_5ghz = {}
                for index, row in ghz5.iterrows():
                    radio_5ghz[f"ssid{index}"] = {
                        "ssid": row["essid"],
                        "channel": row["channel"],
                        "number_connected": row["num_sta"],
                        "satisfaction": 0 if row["satisfaction"] == -1 else row["satisfaction"],
                        "bytes_rx": row["rx_bytes"],
                        "bytes_tx": row["tx_bytes"],
                        "guest": row["is_guest"],
                    }

                radio_6ghz = {}
                for index, row in ghz6.iterrows():
                    radio_6ghz[f"ssid{index}"] = {
                        "ssid": row["essid"],
                        "channel": row["channel"],
                        "number_connected": row["num_sta"],
                        "satisfaction": 0 if row["satisfaction"] == -1 else row["satisfaction"],
                        "bytes_rx": row["rx_bytes"],
                        "bytes_tx": row["tx_bytes"],
                        "guest": row["is_guest"],
                    }

                radio_table_stats = devs.get("radio_table_stats", [])
                radio_clients = {}
                radio_scores = {}
                for index, radio in enumerate(radio_table_stats):
                    user_num_sta = radio.get("user-num_sta", 0)
                    satisfaction = radio.get("satisfaction", 0)
                    radio_clients[f"clients_wifi{index}"] = user_num_sta
                    radio_scores[f"score_wifi{index}"] = 0 if satisfaction == -1 else satisfaction

                attributes.update({
                    "clients": devs.get("user-wlan-num_sta", 0),
                    "guests": devs.get("guest-wlan-num_sta", 0),
                    "score": 0 if devs.get("satisfaction", 0) == -1 else devs.get("satisfaction", 0),
                    **radio_clients,
                    **radio_scores,
                    "ssids_24ghz": radio_24ghz,
                    "ssids_5ghz": radio_5ghz,
                    "ssids_6ghz": radio_6ghz,
                })

            # Add additional attributes for UDM SE
            elif device_type == "udm":
                port_table_data = devs.get("port_table") or []
                port_table = pd.DataFrame(port_table_data)
                port_status = {}
                port_poe = {}
                port_power = {}
                if not port_table.empty and "port_idx" in port_table.columns:
                    port_table = port_table.sort_values("port_idx")
                    for index, row in port_table.iterrows():
                        port_status[row["port_idx"]] = "up" if row["up"] else "down"
                        if "poe_enable" in port_table.columns:
                            port_poe[f"port{row['port_idx']}"] = "power" if row["poe_enable"] else "none"
                        if "poe_power" in port_table.columns:
                            port_power[f"port{row['port_idx']}"] = 0 if pd.isna(row["poe_power"]) else row["poe_power"]

                temperatures = devs.get("temperatures", [])
                temperature_names = {}
                temperature_values = {}
                for index, temp in enumerate(temperatures):
                    temperature_names[f"temperature_{index}_name"] = temp.get("name", 0)
                    temperature_values[f"temperature_{index}_value"] = temp.get("value", 0)

                # Use nested lookups with defaults to avoid KeyErrors.
                wan_info = devs.get("active_geo_info", {}).get("WAN", {})
                attributes.update({
                    "isp_name": wan_info.get("isp_name", "Unknown"),
                    **temperature_names,
                    **temperature_values,
                    "hostname": devs.get("hostname", "Unknown"),
                    "total_max_power": devs.get("total_max_power", 0),
                    "speedtest_rundate": devs.get("speedtest-status", {}).get("rundate", 0),
                    "speedtest_latency": devs.get("speedtest-status", {}).get("latency", 0),
                    "speedtest_download": devs.get("speedtest-status", {}).get("xput_download", 0),
                    "speedtest_upload": devs.get("speedtest-status", {}).get("xput_upload", 0),
                    "total_used_power": devs.get("total_used_power", 0),
                    "lan_ip": devs.get("lan_ip", "Unknown"),
                    "number_of_connections": devs.get("num_sta", 0),
                    "ports_user": devs.get("user-num_sta", 0),
                    "ports_guest": devs.get("guest-num_sta", 0),
                    "active_ports": port_status,
                    "poe_ports": port_poe,
                    "poe_power": port_power,
                })

            # Build MQTT discovery payload.
            discovery_topic = f"homeassistant/sensor/unifi_mqtt/{sanitized_name}/config"
            sensor_payload = {
                "name": "Uptime",
                "default_entity_id": f"sensor.{sanitized_name}",
                "state_topic": f"unifi_mqtt/devices/{sanitized_name}/state",
                "unique_id": mac.replace(":", ""),
                "json_attributes_topic": f"unifi_mqtt/devices/{sanitized_name}/attributes",
                "device": {
                    "identifiers": [f"unifi_{mac.replace(':', '')}"],
                    "name": device_name,
                    "manufacturer": "UniFi",
                    "model": devs.get("model", "Unknown"),
                    "sw_version": devs.get("version", "Unknown"),
                },
            }
            # Only publish discovery when something in the payload has changed
            # (new device, firmware/name update). Re-publishing every cycle is
            # what caused the "already used unique_id" warning spam (issue #34).
            payload_json = json.dumps(sensor_payload, sort_keys=True)
            if entry_data["discovery_cache"].get(mac) != payload_json:
                await async_publish(hass, discovery_topic, payload_json, retain=True)
                entry_data["discovery_cache"][mac] = payload_json

            # Publish device state (uptime)
            state_topic = f"unifi_mqtt/devices/{sanitized_name}/state"
            await async_publish(hass, state_topic, uptime, retain=True)

            # Publish device attributes
            attributes_topic = f"unifi_mqtt/devices/{sanitized_name}/attributes"
            await async_publish(hass, attributes_topic, json.dumps(attributes), retain=True)

            active_devices.append(device_name)

        # Publish WAN / gateway health (issues #27 and #33). Site-level stats
        # live in /stat/health, not per-device get_aps, so we query them
        # separately and synthesise a "Gateway" MQTT sensor.
        try:
            health_info = await hass.async_add_executor_job(controller.get_healthinfo)
        except Exception as err:
            _LOGGER.debug("Could not fetch site health info: %s", err)
            health_info = []

        wan_subsystem = next(
            (s for s in (health_info or []) if isinstance(s, dict) and s.get("subsystem") == "wan"),
            None,
        )
        www_subsystem = next(
            (s for s in (health_info or []) if isinstance(s, dict) and s.get("subsystem") == "www"),
            None,
        )

        # Only publish the synthetic gateway sensor when the site actually has
        # a UniFi gateway adopted. Otherwise the `wan` subsystem is a placeholder
        # with empty fields (num_gw=0, no gw_mac) and the sensor is meaningless.
        if wan_subsystem and wan_subsystem.get("num_gw", 0) > 0:
            gw_mac = wan_subsystem.get("gw_mac") or ""
            gw_name = wan_subsystem.get("gw_name") or "UniFi Gateway"
            sanitized_wan = sanitize_name(f"{gw_name}_wan")

            wan_attributes = {
                "type": "wan",
                "status": wan_subsystem.get("status", "unknown"),
                "wan_ip": wan_subsystem.get("wan_ip", "Unknown"),
                "gateway_name": gw_name,
                "gateway_mac": gw_mac,
                "gateway_version": wan_subsystem.get("gw_version", "Unknown"),
                "isp_name": wan_subsystem.get("isp_name", "Unknown"),
                "isp_organization": wan_subsystem.get("isp_organization", "Unknown"),
                "num_connected": wan_subsystem.get("num_sta", 0),
                "rx_bytes_rate": wan_subsystem.get("rx_bytes-r", 0),
                "tx_bytes_rate": wan_subsystem.get("tx_bytes-r", 0),
                "num_gateways": wan_subsystem.get("num_gw", 0),
                "num_adopted": wan_subsystem.get("num_adopted", 0),
                "num_disconnected": wan_subsystem.get("num_disconnected", 0),
                "num_pending": wan_subsystem.get("num_pending", 0),
            }

            # Per-WAN uptime/latency stats (supports multi-WAN setups: WAN, WAN2, …)
            for wan_key, stats in (wan_subsystem.get("uptime_stats") or {}).items():
                if not isinstance(stats, dict):
                    continue
                prefix = str(wan_key).lower()
                wan_attributes[f"{prefix}_availability"] = stats.get("availability", 0)
                wan_attributes[f"{prefix}_latency_average"] = stats.get("latency_average", 0)
                wan_attributes[f"{prefix}_uptime"] = stats.get("uptime", 0)
                wan_attributes[f"{prefix}_time_period"] = stats.get("time_period", 0)
                for idx, monitor in enumerate(stats.get("monitors") or []):
                    if not isinstance(monitor, dict):
                        continue
                    wan_attributes[f"{prefix}_monitor_{idx}_target"] = monitor.get("target", "")
                    wan_attributes[f"{prefix}_monitor_{idx}_type"] = monitor.get("type", "")
                    wan_attributes[f"{prefix}_monitor_{idx}_availability"] = monitor.get("availability", 0)
                    wan_attributes[f"{prefix}_monitor_{idx}_latency"] = monitor.get("latency_average", 0)

            # Speedtest + internet uplink telemetry (from the `www` subsystem)
            if www_subsystem:
                wan_attributes.update({
                    "internet_status": www_subsystem.get("status", "unknown"),
                    "internet_latency": www_subsystem.get("latency", 0),
                    "internet_uptime": www_subsystem.get("uptime", 0),
                    "internet_rx_bytes_rate": www_subsystem.get("rx_bytes-r", 0),
                    "internet_tx_bytes_rate": www_subsystem.get("tx_bytes-r", 0),
                    "speedtest_status": www_subsystem.get("speedtest_status", "unknown"),
                    "speedtest_last_run": www_subsystem.get("speedtest_lastrun", 0),
                    "speedtest_ping": www_subsystem.get("speedtest_ping", 0),
                    "speedtest_download_mbps": www_subsystem.get("xput_down", 0),
                    "speedtest_upload_mbps": www_subsystem.get("xput_up", 0),
                })

            unique_id_base = gw_mac.replace(":", "") if gw_mac else sanitized_wan
            discovery_topic = f"homeassistant/sensor/unifi_mqtt/{sanitized_wan}/config"
            sensor_payload = {
                "name": "Status",
                "default_entity_id": f"sensor.{sanitized_wan}",
                "state_topic": f"unifi_mqtt/devices/{sanitized_wan}/state",
                "unique_id": f"{unique_id_base}_wan",
                "json_attributes_topic": f"unifi_mqtt/devices/{sanitized_wan}/attributes",
                "device": {
                    "identifiers": [f"unifi_wan_{unique_id_base}"],
                    "name": gw_name,
                    "manufacturer": "UniFi",
                    "model": "Gateway",
                    "sw_version": wan_subsystem.get("gw_version", "Unknown"),
                },
            }

            wan_cache_key = f"wan:{unique_id_base}"
            payload_json = json.dumps(sensor_payload, sort_keys=True)
            if entry_data["discovery_cache"].get(wan_cache_key) != payload_json:
                await async_publish(hass, discovery_topic, payload_json, retain=True)
                entry_data["discovery_cache"][wan_cache_key] = payload_json

            state_topic = f"unifi_mqtt/devices/{sanitized_wan}/state"
            await async_publish(hass, state_topic, wan_subsystem.get("status", "unknown"), retain=True)

            attributes_topic = f"unifi_mqtt/devices/{sanitized_wan}/attributes"
            await async_publish(hass, attributes_topic, json.dumps(wan_attributes), retain=True)

            active_devices.append(f"{gw_name} (WAN)")

        # Publish device summary
        device_summary_topic = "unifi_mqtt/devices/summary"
        await async_publish(hass, device_summary_topic, json.dumps(active_devices), retain=True)

    entry_data["unsub_interval"] = async_track_time_interval(
        hass, update_unifi_data, timedelta(seconds=update_interval)
    )
    entry_data["unsub_options"] = entry.add_update_listener(_async_options_updated)
    hass.async_create_task(update_unifi_data(None))

    return True


async def _async_options_updated(hass, entry):
    """Reload the entry so a changed update interval takes effect."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass, entry):
    """Unload a config entry."""
    entry_data = hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    if entry_data:
        unsub_interval = entry_data.get("unsub_interval")
        if unsub_interval is not None:
            unsub_interval()
        unsub_options = entry_data.get("unsub_options")
        if unsub_options is not None:
            unsub_options()
    return True
