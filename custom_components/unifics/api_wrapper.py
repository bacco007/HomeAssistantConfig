import logging
import requests
import warnings
from urllib3.exceptions import InsecureRequestWarning
import ssl
from enum import Enum
from pyunifi import controller
import random
from homeassistant.helpers.update_coordinator import UpdateFailed

_LOGGER = logging.getLogger(__name__)

warnings.filterwarnings("ignore", category=InsecureRequestWarning)

def create_client( host, port, username, password, site, cert, udm):
    '''create a controller and return a error code if any'''

    if cert == True:
       ssl_verify = True
    else:
       ssl_verify = False           
    
    if udm == True:
        server_type = "UDMP-unifiOS"
    else:
      server_type = "v5"

    try:
        _LOGGER.debug('host={}, port={}, username={}, site={}, cert={}, udm={}'.format(host, port, username, site, ssl_verify, udm))
        client = controller.Controller ( host,
                              username,
                              password, 
                              port = port,
                              site_id = site,
                              ssl_verify = ssl_verify,
                              version = server_type 
                             )
    except Exception as e:
        _LOGGER.error("pyunify error: %s", e)
        if udm == True:
            _LOGGER.error("changing version to unifiOS and trying again")
            try:
                server_type = "unifiOS"
                client = controller.Controller ( host,
                              username,
                              password, 
                              port = port,
                              site_id = site,
                              ssl_verify = ssl_verify,
                              version = server_type 
                             )
            except Exception as e:
                _LOGGER.error("pyunify error: %s", e)

    _LOGGER.debug("unificontrol: OK") 
    return { 'client': client, 'error': 'ok'}

def client_get_data(client):
    '''receive a unifi client and returns a dictionary with all ap/wlans/clients'''

    data = {}
    error = [] 
    try: 
      data["aps"] = client.get_aps()
      data["wlans"] = client.get_wlan_conf()
      data["clients"] = client.get_clients()
    except Exception as e:
        _LOGGER.error("pyunify error: %s", e)

    # simulate a error
    # if random.randrange(10) == 0:
    #   data[random.choice(['aps', 'wlans', 'clients'])] = {'error': {'code': 401, 'message': 'Unauthorized'}}

    # # check if data is ok    
    if type(data["aps"]) == dict:
      if "error" in data["aps"].keys():
        error.append("aps") 
    if type(data["wlans"]) == dict:
      if "error" in data["wlans"].keys():
        error.append("wlans") 
    if type(data["clients"]) == dict:
      if "error" in data["clients"].keys():
        error.append("clients") 

    # log the error and try a to login again
    if len(error) > 0:
      _LOGGER.error("There was a error while trying to retrieve %s", error)
      _LOGGER.error("trying to login again, next poll should work")
      data = {}
      try:
            client._login()
      except Exception as e:
        _LOGGER.error("pyunify error: %s", e)
      
    if data == {}:
        raise UpdateFailed(f"Error communicating with API")

    return data


