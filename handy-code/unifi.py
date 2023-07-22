import json, yaml, requests
from datetime import datetime
from urllib3 import disable_warnings
disable_warnings()

SECRETS_FILE = "../secrets.yaml"
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

IP = get_secret("unifi_ipaddress")
PORT = get_secret("unifi_port")
USER = get_secret("unifi_username")
PASS = get_secret("unifi_password")
URL = f"https://{IP}:{PORT}"

login = requests.request("POST", f"{URL}/api/auth/login", \
    headers={"Content-Type": "application/json"}, \
    data=json.dumps({"username": USER, "password": PASS}), verify=False)
response = requests.request("GET", f"{URL}/proxy/network/api/s/default/stat/device/", \
    cookies=login.cookies, verify=False)

print(response.json())