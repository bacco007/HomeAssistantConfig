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
from pyunifi.controller import Controller

from homeassistant.components.mqtt import async_publish
from homeassistant.helpers.event import async_track_time_interval

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

# Global variable for the update listener.
UPDATE_LISTENER = None

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
    update_interval = entry.data.get(CONF_UPDATE_INTERVAL, DEFAULT_UPDATE_INTERVAL)

    def init_controller():
        return Controller(
            host, username, password, port, version, site_id=site_id, ssl_verify=verify_ssl
        )

    try:
        controller = await hass.async_add_executor_job(init_controller)
    except Exception as e:
        _LOGGER.error("Failed to initialize UniFi controller: %s", e)
        return False

    async def update_unifi_data(now):
        """Fetch data from the UniFi controller and publish MQTT discovery, state, and attribute messages."""
        try:
            unifi_devices = await hass.async_add_executor_job(controller.get_aps)
        except Exception as err:
            _LOGGER.error("Error fetching devices: %s", err)
            return

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
                    port_table = pd.DataFrame(devs.get("port_table")).sort_values("port_idx")
                    for index, row in port_table.iterrows():
                        port_status[f"port{row['port_idx']}"] = "up" if row["up"] else "down"
                        if "poe_enable" in port_table.columns:
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
                vap_table_data = devs.get("vap_table")
                if not vap_table_data:
                    continue
                vap_table = pd.DataFrame(vap_table_data)
                if "radio" not in vap_table.columns:
                    continue
                ghz2_4 = vap_table[vap_table["radio"] == "ng"]
                ghz5 = vap_table[vap_table["radio"] == "na"]
                ghz6 = vap_table[vap_table["radio"] == "6e"]

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
                port_table = pd.DataFrame(devs.get("port_table")).sort_values("port_idx")
                port_status = {}
                port_poe = {}
                port_power = {}
                for index, row in port_table.iterrows():
                    port_status[row["port_idx"]] = "up" if row["up"] else "down"
                    port_poe[f"port{row['port_idx']}"] = "power" if row["poe_enable"] else "none"
                    port_power[f"port{row['port_idx']}"] = row["poe_power"]

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
            await async_publish(hass, discovery_topic, json.dumps(sensor_payload), retain=True)

            # Publish device state (uptime)
            state_topic = f"unifi_mqtt/devices/{sanitized_name}/state"
            await async_publish(hass, state_topic, uptime, retain=True)

            # Publish device attributes
            attributes_topic = f"unifi_mqtt/devices/{sanitized_name}/attributes"
            await async_publish(hass, attributes_topic, json.dumps(attributes), retain=True)

            active_devices.append(device_name)

        # Publish device summary
        device_summary_topic = "unifi_mqtt/devices/summary"
        await async_publish(hass, device_summary_topic, json.dumps(active_devices), retain=True)

    global UPDATE_LISTENER
    UPDATE_LISTENER = async_track_time_interval(
        hass, update_unifi_data, timedelta(seconds=update_interval)
    )
    hass.async_create_task(update_unifi_data(None))

    return True

async def async_unload_entry(hass, entry):
    """Unload a config entry."""
    global UPDATE_LISTENER
    if UPDATE_LISTENER is not None:
        UPDATE_LISTENER()
        UPDATE_LISTENER = None
    return True
