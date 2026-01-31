#!/usr/local/bin/python

from datetime import timedelta
import json, yaml, requests
from datetime import datetime
import requests, time
from re import sub
import sys
from urllib3 import disable_warnings

disable_warnings()

SECRETS_FILE = "/config/secrets.yaml"


def get_secret(secret):
    try:
        with open(SECRETS_FILE, "r", encoding="utf8") as file:
            secrets = yaml.full_load(file)
            for key, value in secrets.items():
                if key == secret:
                    return value
    except FileNotFoundError:
        print("secrets.yaml not found")
        exit()


resp = {}
resp["data"] = {}


def parse_uptime(uptime):
    seconds = uptime
    days = seconds // 86400
    hours = (seconds - (days * 86400)) // 3600
    minutes = (seconds - (days * 86400) - (hours * 3600)) // 60
    uptime = str(days) + "d " + str(hours) + "h " + str(minutes) + "m"
    return uptime


ip_address = get_secret("unifi_ipaddress")
username = get_secret("unifi_user2")
password = get_secret("unifi_pass2")
controller_url = f"https://{ip_address}"
site = "default"  # The site ID, 'default' for most installations

login_url = f"{controller_url}/api/auth/login"
login_data = {"username": username, "password": password}

session = requests.Session()
response = session.post(login_url, json=login_data, verify=False)
response.raise_for_status()


def snake_case(s):
    return "_".join(
        sub(
            "([A-Z][a-z]+)", r" \1", sub("([A-Z]+)", r" \1", s.replace("-", " "))
        ).split()
    ).lower()


rules_url = f"{controller_url}/proxy/network/api/s/default/stat/device"
response = session.get(rules_url, verify=False)
response.raise_for_status()
rules = response.json()

sysinfo_url = f"{controller_url}/proxy/network/api/s/default/stat/sysinfo"
response = session.get(sysinfo_url, verify=False)
response.raise_for_status()
version = response.json()

for h in version["data"]:
    resp["data"]["sysinfo"] = {}
    resp["data"]["sysinfo"].update(
        {
            "name": h["name"],
            "version": h["version"],
            "uptime": h["uptime"],
            "device_type": h["ubnt_device_type"],
            "udm_version": h["udm_version"],
        }
    )

health_url = f"{controller_url}/proxy/network/api/s/default/stat/health"
response = session.get(health_url, verify=False)
response.raise_for_status()
health_data = response.json()

resp["data"]["subsystem"] = {}
for h in health_data["data"]:

    match h["subsystem"]:
        case "www":
            resp["data"]["subsystem"]["www"] = {}
            resp["data"]["subsystem"]["www"].update(
                {
                    "status": h["status"],
                    "tx_bytes-r": h["tx_bytes-r"],
                    "rx_bytes-r": h["rx_bytes-r"],
                    "latency": h["latency"],
                    "uptime": h["uptime"],
                    "drops": h["drops"],
                    "xput_up": h["xput_up"],
                    "xput_down": h["xput_down"],
                    "speedtest_status": h["speedtest_status"],
                    "speedtest_lastrun": h["speedtest_lastrun"],
                    "speedtest_ping": h["speedtest_ping"],
                }
            )

        case "vpn":
            resp["data"]["subsystem"]["vpn"] = {}
            resp["data"]["subsystem"]["vpn"].update(
                {
                    "status": h["status"],
                    "enabled": h["remote_user_enabled"],
                    "users_active": h["remote_user_num_active"],
                    "users_inactive": h["remote_user_num_inactive"],
                    "tx_bytes": h["remote_user_tx_bytes"],
                    "rx_bytes": h["remote_user_rx_bytes"],
                }
            )
            # test
        case "wlan":
            resp["data"]["subsystem"]["wlan"] = {}
            resp["data"]["subsystem"]["wlan"].update(
                {
                    "num_user": h["num_user"],
                    "num_guest": h["num_guest"],
                    "num_iot": h["num_iot"],
                    "tx_bytes": h["tx_bytes-r"],
                    "rx_bytes": h["rx_bytes-r"],
                    "status": h["status"],
                    "num_ap": h["num_ap"],
                    "num_ap_adopted": h["num_adopted"],
                    "num_ap_disabled": h["num_disabled"],
                    "num_ap_disconnected": h["num_disconnected"],
                    "num_ap_pending": h["num_pending"],
                }
            )

        case "lan":
            resp["data"]["subsystem"]["lan"] = {}
            resp["data"]["subsystem"]["lan"].update(
                {
                    "status": h["status"],
                    "num_user": h["num_user"],
                    "num_iot": h["num_iot"],
                    "num_sw": h["num_sw"],
                    "num_sw_adopted": h["num_adopted"],
                    "num_sw_disconnected": h["num_disconnected"],
                    "num_sw_pending": h["num_pending"],
                }
            )

            # test
        case "wan":
            resp["data"]["subsystem"]["wan"] = {}
            resp["data"]["subsystem"]["wan"].update(
                {
                    "status": h["status"],
                    "num_gw": h["num_gw"],
                    "num_gw_adopted": h["num_adopted"],
                    "num_gw_disconnected": h["num_disconnected"],
                    "num_gw_pending": h["num_pending"],
                    "wan_ip": h["wan_ip"],
                    "nameservers": h["nameservers"][0],
                    "isp_organization": h["isp_organization"],
                    "isp_name": h["isp_name"],
                    "gw_version": h["gw_version"],
                    "num_sta": h["num_sta"],
                    "cpu": h["gw_system-stats"]["cpu"],
                    "mem": h["gw_system-stats"]["mem"],
                    "uptime": h["gw_system-stats"]["uptime"],
                    "tx_bytes": h["tx_bytes-r"],
                    "rx_bytes": h["rx_bytes-r"],
                    "latency_"
                    + h["uptime_stats"]["WAN"]["alerting_monitors"][0]["target"]: h[
                        "uptime_stats"
                    ]["WAN"]["alerting_monitors"][0]["latency_average"],
                    "latency_"
                    + h["uptime_stats"]["WAN"]["monitors"][0]["target"]: h[
                        "uptime_stats"
                    ]["WAN"]["monitors"][0]["latency_average"],
                    "latency_"
                    + h["uptime_stats"]["WAN"]["monitors"][1]["target"]: h[
                        "uptime_stats"
                    ]["WAN"]["monitors"][1]["latency_average"],
                    "latency_"
                    + h["uptime_stats"]["WAN"]["monitors"][2]["target"]: h[
                        "uptime_stats"
                    ]["WAN"]["monitors"][2]["latency_average"],
                    "latency_avg": h["uptime_stats"]["WAN"]["latency_average"],
                }
            )

        case _:
            print("else")

resp["version"] = version["data"][0]["version"]
resp["data"]["device"] = {}
# # Find the rule to update
for client_data in rules["data"]:

    ## If switch is offline ignore
    if client_data["state"] == 0:
        continue

    name = snake_case(client_data["name"])
    internet = None
    speedtest_status = None
    if client_data["model"] == "UDM":
        speedtest_status = client_data["uplink"]["speedtest_status"] == "Success"
        internet = client_data["uplink"]["up"]
        if "uplink" in client_data.keys():
            if client_data["uplink"]["uplink_source"] == "legacy":
                internet = client_data["uplink"]["up"]
            else:
                internet = "UDM"
                # print("client_data['model'] %s", client_data["model"])
        elif "internet" in client_data.keys():
            internet = client_data["internet"]
            # print("client_data['model'] %s", client_data["model"])
    cpu = 0
    ram = 0
    try:
        if (
            client_data["system-stats"]
            and client_data["system-stats"] != {}
            and len(client_data["system-stats"].keys()) != 0
        ):
            try:
                cpu = float(client_data["system-stats"]["cpu"])
            except:
                cpu = 0.0
            try:
                ram = float(client_data["system-stats"]["mem"])
            except:
                ram = 0
    except:
        print("An exception occurred")
        print(json.dumps(client_data, indent=1))
        print("------")

    activity = round(
        client_data["uplink"]["rx_bytes-r"] / 125000
        + client_data["uplink"]["tx_bytes-r"] / 125000,
        1,
    )
    uptime = client_data["uptime"]
    update = int(client_data["upgradable"])
    model_type = client_data["model"]

    if client_data["is_access_point"]:
        wifi0clients = client_data["radio_table_stats"][0]["user-num_sta"]
        wifi1clients = client_data["radio_table_stats"][1]["user-num_sta"]
        wifi0score = client_data["radio_table_stats"][0]["satisfaction"]
        wifi1score = client_data["radio_table_stats"][1]["satisfaction"]
        numclients = client_data["user-wlan-num_sta"]
        numguests = client_data["guest-wlan-num_sta"]
        score = client_data["satisfaction"]

        resp["data"]["device"][name] = {}
        resp["data"]["device"][name].update(
            {
                "Clients": numclients,
                "Guests": numguests,
                "Clients_wifi0": wifi0clients,
                "Clients_wifi1": wifi1clients,
                "Score": score,
                "CPU": cpu,
                "RAM": ram,
                "Uptime": uptime,
                "Score_wifi0": wifi0score,
                "Score_wifi1": wifi1score,
                "Activity": str(activity) + " Mbps",
                "Update": update,
                "Model": model_type,
            }
        )

    else:
        cpu_temp = None
        board_temp = None
        wan_drops = None
        wan_latency = None
        if "temperatures" in client_data.keys() and client_data["temperatures"] != {}:
            for t in client_data["temperatures"]:
                if t["type"] == "cpu":
                    cpu_temp = t["value"]
                if t["type"] == "board":
                    board_temp = t["value"]

        storage_used = None
        storage_size = None
        if "storage" in client_data.keys() and client_data["storage"] != []:
            for t in client_data["storage"]:

                if t["mount_point"] == "/persistent":
                    storage_size = t["size"]
                    storage_used = t["used"]

        availability = None
        latency_average = None
        uplink_ip = None

        if "uptime_stats" in client_data.keys() and client_data["uptime_stats"] != {}:
            for t in client_data["uptime_stats"]["WAN"]["alerting_monitors"]:
                if t["target"] == "1.1.1.1":
                    latency_average = t["latency_average"]
                    availability = t["availability"]

        if (
            "uplink" in client_data.keys()
            and client_data["uplink"] != {}
            and "comment" in client_data["uplink"].keys()
        ):

            # json.dumps(print(client_data['uplink']))
            # print(json.dumps(client_data['uplink'], indent = 1))
            if client_data["uplink"]["comment"] == "WAN":
                wan_latency = client_data["uplink"]["latency"]
                wan_drops = client_data["uplink"]["drops"]
                uplink_ip = client_data["uplink"]["ip"]

        # uplink

        # print(t)
        # print(json.dumps(client_data, indent = 1))
        # if 'speedtest-status' in client_data.keys() and client_data['speedtest-status'] is not None:
        #   print("---")
        #   # print(client_data['speedtest-status'])
        #   # json.dumps(print(client_data))
        #   print(json.dumps(client_data['uplink'], indent = 1))

        #   print("---")
        internet = client_data["internet"]
        usedports = client_data["num_sta"]
        userports = client_data["user-num_sta"]
        guestports = client_data["guest-num_sta"]

        resp["data"]["device"][name] = {}
        resp["data"]["device"][name].update(
            {
                "Activity": str(activity) + " Mbps",
                "CPU": cpu,
                "RAM": ram,
                "Uptime": uptime,
                "Ports_used": usedports,
                "Ports_user": userports,
                "Ports_guest": guestports,
                "Update": update,
                "Model": model_type,
            }
        )

        if (
            "speedtest_ping" in client_data["uplink"].keys()
            and client_data["uplink"]["speedtest_ping"] is not None
        ):
            resp["data"].update(
                {
                    "Speedtest_ping": client_data["uplink"]["speedtest_ping"],
                    "Speedtest_up": client_data["uplink"]["xput_up"],
                    "Speedtest_down": client_data["uplink"]["xput_down"],
                }
            )
        if storage_used is not None:
            resp["data"].update(
                {"StorageUsed": storage_used, "StorageSize": storage_size}
            )
        if internet is not None:
            resp["data"].update({"Internet": internet})
        if speedtest_status is not None:
            resp["data"].update({"SpeedTestPass": speedtest_status})
        if cpu_temp is not None:
            resp["data"].update({"CPUTemp": cpu_temp, "BoardTemp": board_temp})

        if wan_drops is not None:
            resp["data"].update({"WanDrops": wan_drops, "WanLatency": wan_latency})

        if latency_average is not None:
            resp["data"].update(
                {"LatencyAvg": latency_average, "WanAvailability": availability}
            )

        if uplink_ip is not None:
            resp["data"].update({"UplinkIP": uplink_ip})

json_formatted_str = json.dumps(resp, indent=2)
print(json_formatted_str)
# Log out of the UniFi Controller
logout_url = f"{controller_url}/api/auth/logout"
session.post(logout_url, verify=False)

sys.exit(0)
