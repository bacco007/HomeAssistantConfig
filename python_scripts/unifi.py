#!/usr/local/bin/python

from datetime import timedelta
import json, yaml, requests
from datetime import datetime
import requests,time
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

resp={}
resp['data']={}


def parse_uptime(uptime):
  seconds = uptime
  days = seconds // 86400
  hours = (seconds - (days * 86400)) // 3600
  minutes = (seconds - (days * 86400) - (hours * 3600)) // 60
  uptime = str(days)+'d '+str(hours)+'h '+str(minutes)+'m'
  return uptime

ip_address = get_secret("unifi_ipaddress")
username = get_secret("unifi_user2")
password = get_secret("unifi_pass2")
controller_url = f"https://{ip_address}"
site = 'default'  # The site ID, 'default' for most installations


login_url = f'{controller_url}/api/auth/login'
login_data = {
    'username': username,
    'password': password
}

session = requests.Session()
response = session.post(login_url, json=login_data, verify=False)
response.raise_for_status()

def snake_case(s):
  return '_'.join(
    sub('([A-Z][a-z]+)', r' \1',
    sub('([A-Z]+)', r' \1',
    s.replace('-', ' '))).split()).lower()


rules_url = f'{controller_url}/proxy/network/api/s/default/stat/device'
response = session.get(rules_url, verify=False)
response.raise_for_status()
rules = response.json()

sysinfo_url = f'{controller_url}/proxy/network/api/s/default/stat/sysinfo'
response = session.get(sysinfo_url, verify=False)
response.raise_for_status()
version = response.json()

health_url = f'{controller_url}/proxy/network/api/s/default/stat/health'
response = session.get(health_url, verify=False)
response.raise_for_status()
health_data = response.json()

# keys = health_data['data'][0].keys()
# a = {k: set(d[k] for d in health_data['data']) for k in keys}
# print(json.dumps(health_data, indent = 1))
#
for h in health_data['data']:

  match h['subsystem']:
    case 'www':
      # print(json.dumps(h, indent = 1))
      resp['data'].update({
        "health_" + h['subsystem'] + ".status": h['status'],
        "health_" + h['subsystem'] + ".tx_bytes-r": h['tx_bytes-r'],
        "health_" + h['subsystem'] + ".rx_bytes-r": h['rx_bytes-r'],
        "health_" + h['subsystem'] + ".latency": h['latency'],
        "health_" + h['subsystem'] + ".uptime": h['uptime'],
        "health_" + h['subsystem'] + ".drops": h['drops'],
        "health_" + h['subsystem'] + ".xput_up": h['xput_up'],
        "health_" + h['subsystem'] + ".xput_down": h['xput_down'],
        "health_" + h['subsystem'] + ".speedtest_status": h['speedtest_status'],
        "health_" + h['subsystem'] + ".speedtest_lastrun": h['speedtest_lastrun'],
        "health_" + h['subsystem'] + ".speedtest_ping": h['speedtest_ping'],
        "health_" + h['subsystem'] + ".uptime": h['uptime']

      })

    case 'vpn':
      resp['data'].update({
        "health_" + h['subsystem'] + ".status": h['status'],
        "health_" + h['subsystem'] + ".enabled": h['remote_user_enabled'],
        "health_" + h['subsystem'] + ".users_active": h['remote_user_num_active'],
        "health_" + h['subsystem'] + ".users_inactive": h['remote_user_num_inactive'],
        "health_" + h['subsystem'] + ".tx_bytes": h['remote_user_tx_bytes'],
        "health_" + h['subsystem'] + ".rx_bytes": h['remote_user_rx_bytes'],
      })
      # test
    case 'wlan':
      resp['data'].update({
        "health_" + h['subsystem'] + ".num_user": h['num_user'],
        "health_" + h['subsystem'] + ".num_guest": h['num_guest'],
        "health_" + h['subsystem'] + ".num_iot": h['num_iot'],
        "health_" + h['subsystem'] + ".tx_bytes": h['tx_bytes-r'],
        "health_" + h['subsystem'] + ".rx_bytes": h['rx_bytes-r'],
        "health_" + h['subsystem'] + ".status": h['status'],
        "health_" + h['subsystem'] + ".num_ap": h['num_ap']
      })

    case 'lan':
      resp['data'].update({
        "health_" + h['subsystem'] + ".status": h['status'],
        "health_" + h['subsystem'] + ".num_user": h['num_user'],
        "health_" + h['subsystem'] + ".num_iot": h['num_iot'],
        "health_" + h['subsystem'] + ".num_sw": h['num_sw'],
        "health_" + h['subsystem'] + ".num_adopted": h['num_adopted']
      })

      # test
    case 'wan':
      # print(h['subsystem'])
      # print(json.dumps(h, indent = 1))
      resp['data'].update({
        "health_" + h['subsystem'] + ".status": h['status'],
        "health_" + h['subsystem'] + ".wan_ip": h['wan_ip'],
        "health_" + h['subsystem'] + ".isp_organization": h['isp_organization'],
        "health_" + h['subsystem'] + ".isp_name": h['isp_name'],
        "health_" + h['subsystem'] + ".gw_version": h['gw_version'],
        "health_" + h['subsystem'] + ".num_sta": h['num_sta'],
        "health_" + h['subsystem'] + ".cpu": h['gw_system-stats']['cpu'],
        "health_" + h['subsystem'] + ".mem": h['gw_system-stats']['mem'],
        "health_" + h['subsystem'] + ".uptime": h['gw_system-stats']['uptime'],
        "health_" + h['subsystem'] + ".tx_bytes": h['tx_bytes-r'],
        "health_" + h['subsystem'] + ".rx_bytes": h['rx_bytes-r']
      })

    case _:
      print("else")


# uptime_stats = f'{controller_url}/proxy/network/api/s/default/stat/stats'


# response_stats = session.get(uptime_stats, verify=False)
# response_stats.raise_for_status()
# data = response_stats.json()["data"][0]
# # # print(version)
# json.dumps(print(resp['data']))
# print(json.dumps(resp['data'], indent = 1))
# print(json.dumps({
#     "cpu": data["system-stats"]["cpu"],
#     "cpu_temp": round(data["temperatures"][1]["value"], 1),
#     "system_temp": round(data["temperatures"][0]["value"], 1),
#     "memory": data["system-stats"]["mem"],
#     "disk": round(data["storage"][1]["used"] / data["storage"][1]["size"] * 100, 1),
#     "internet": data["wan1"]["up"],
#     "uptime": datetime.fromtimestamp(data["startup_timestamp"]).isoformat(),
#     "availability": data["uptime_stats"]["WAN"]["availability"],
#     "average_latency": data["uptime_stats"]["WAN"]["latency_average"],
#     "down": data["uplink"]["rx_rate"] / 1000000,
#     "up": data["uplink"]["tx_rate"] / 1000000,
#     "version": data["displayable_version"],
#     "last_wan_ip": data["last_wan_ip"]
# }))
# sys.exit(2)


resp["version"]=version['data'][0]['version']
# # Find the rule to update
for client_data in rules['data']:

  ## If switch is offline ignore
  if client_data['state'] == 0:
    continue

  name=snake_case(client_data['name'])
  # print(client_data)
  # resp[name]={}

# # print(version)
  # json.dumps(print(client_data))

  internet = None
  speedtest_status = None
  # print("client_data['model'] %s",client_data['model'] )
  if client_data['model'] == "udm":
    speedtest_status = client_data['uplink']['speedtest_status'] == "Success"
    internet = client_data['uplink']['up']
    if 'uplink' in client_data.keys():
      if client_data['uplink']['uplink_source'] == 'legacy':
        internet = client_data['uplink']['up']
      else:
        internet = client_data['internet']
        print("client_data['model'] %s",client_data['model'] )
    elif 'internet' in client_data.keys():
      internet = client_data['internet']
      print("client_data['model'] %s",client_data['model'] )
  cpu=0
  ram=0
  try:
    if client_data['system-stats'] and client_data['system-stats'] != {} and len(client_data['system-stats'].keys()) != 0:
      try:
        cpu = float(client_data['system-stats']['cpu'])
      except:
        cpu = 0.0
      try:
        ram = float(client_data['system-stats']['mem'])
      except:
        ram = 0
  except:
    print("An exception occurred")
    print(json.dumps(client_data, indent = 1))
    print("------")



  activity = round(client_data['uplink']['rx_bytes-r']/125000 + client_data['uplink']['tx_bytes-r']/125000,1)
  uptime = parse_uptime(client_data['uptime'])
  update = int(client_data['upgradable'])
  model_type = client_data['model']




  # print(type)


  if client_data['is_access_point']:
      wifi0clients = client_data['radio_table_stats'][0]['user-num_sta']
      wifi1clients = client_data['radio_table_stats'][1]['user-num_sta']
      wifi0score = client_data['radio_table_stats'][0]['satisfaction']
      wifi1score = client_data['radio_table_stats'][1]['satisfaction']
      numclients = client_data['user-wlan-num_sta']
      numguests = client_data['guest-wlan-num_sta']
      score = client_data['satisfaction']

      # raise ValueError('Some error')
      resp['data'].update ({
          name+".Clients":numclients,
          name+".Guests":numguests,
          name+".Clients_wifi0":wifi0clients ,
          name+".Clients_wifi1":wifi1clients ,
          name+".Score":score,
          name+".CPU": cpu,
          name+".RAM":ram,
          name+".Uptime":uptime,
          name+".Score_wifi0":wifi0score ,
          name+".Score_wifi1":wifi1score ,
          name+".Activity":str(activity)+' Mbps',
          name+".Update":update,
      })

  else:
    cpu_temp = None
    board_temp = None
    wan_drops = None
    wan_latency = None
    if 'temperatures' in client_data.keys() and  client_data['temperatures']!={}:
      for t in client_data['temperatures']:
        if t['type'] == "cpu" : cpu_temp = t['value']
        if t['type'] == "board" : board_temp = t['value']



    # json.dumps(print(client_data))
    # print(json.dumps(client_data, indent = 1))


    storage_used = None
    storage_size = None
    if 'storage' in client_data.keys() and  client_data['storage']!=[]:
      for t in client_data['storage']:

        if t['mount_point'] == "/persistent":
          storage_size = t['size']
          storage_used = t['used']

    availability=None
    latency_average=None
    uplink_ip=None

    if 'uptime_stats' in client_data.keys() and  client_data['uptime_stats']!={}:
        for t in client_data['uptime_stats']['WAN']['alerting_monitors']:
          if t['target'] == "1.1.1.1":
            latency_average = t['latency_average']
            availability = t['availability']


    if 'uplink' in client_data.keys() and client_data['uplink']!={} and 'comment' in client_data['uplink'].keys():

        # json.dumps(print(client_data['uplink']))
        # print(json.dumps(client_data['uplink'], indent = 1))
        if client_data['uplink']['comment'] == "WAN":
          wan_latency = client_data['uplink']['latency']
          wan_drops = client_data['uplink']['drops']
          uplink_ip = client_data['uplink']['ip']


# uplink


        # print(t)
            # print(json.dumps(client_data, indent = 1))
    # if 'speedtest-status' in client_data.keys() and client_data['speedtest-status'] is not None:
    #   print("---")
    #   # print(client_data['speedtest-status'])
    #   # json.dumps(print(client_data))
    #   print(json.dumps(client_data['uplink'], indent = 1))

    #   print("---")
    # internet = client_data['internet']
    usedports = client_data['num_sta']
    userports = client_data['user-num_sta']
    guestports = client_data['guest-num_sta']


    resp['data'].update({
      name+".Activity":str(activity)+' Mbps',
      name+".CPU":cpu,
      name+".RAM":ram,
      name+".Uptime":uptime,
      name+".Ports_used":usedports,
      name+".Ports_user":userports,
      name+".Ports_guest":guestports,
      name+".Update":update,
      name+".Model": model_type
    })

    if 'speedtest_ping' in client_data['uplink'].keys() and client_data['uplink']['speedtest_ping'] is not None:

      resp['data'].update({
        name+".Speedtest_ping": client_data['uplink']['speedtest_ping'],
        name+".Speedtest_up":   client_data['uplink']['xput_up'],
        name+".Speedtest_down": client_data['uplink']['xput_down']
      })
    if storage_used is not None:
      resp['data'].update({
        name+".StorageUsed": storage_used,
        name+".StorageSize": storage_size
      })
    if internet is not None:
      resp['data'].update({
        name+".Internet": internet
      })
    if speedtest_status is not None:
      resp['data'].update({
        name+".SpeedTestPass": speedtest_status
      })
    if cpu_temp is not None:
      resp['data'].update({
        name+".CPUTemp":cpu_temp,
        name+".BoardTemp":board_temp
      })

    if wan_drops is not None:
      resp['data'].update({
        name+".WanDrops":wan_drops,
        name+".WanLatency":wan_latency
      })


    if latency_average is not None:
      resp['data'].update({
        name+".LatencyAvg":latency_average,
        name+".WanAvailability":availability
      })

    if uplink_ip is not None:
      resp['data'].update({
        name+".UplinkIP":uplink_ip
      })





# print(resp)
# formatted_json = json.dumps(resp, sort_keys=True, indent=4)
# colorful_json = highlight(formatted_json, lexers.JsonLexer(), formatters.TerminalFormatter())
# print(colorful_json)
json_formatted_str = json.dumps(resp, indent=2)
print(json_formatted_str)
# Log out of the UniFi Controller
logout_url = f'{controller_url}/api/auth/logout'
session.post(logout_url, verify=False)

sys.exit(0)