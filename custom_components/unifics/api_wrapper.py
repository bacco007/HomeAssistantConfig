import logging
import requests
from urllib3.exceptions import InsecureRequestWarning
requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)
import ssl
from enum import Enum

from pyunifi import controller


_LOGGER = logging.getLogger(__name__)

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
