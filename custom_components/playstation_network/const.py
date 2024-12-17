"""Constants for the psn integration."""

from datetime import timedelta

DOMAIN = "playstation_network"
DEVICE_SCAN_INTERVAL = timedelta(seconds=30)
PSN_COORDINATOR = "psn_coordinator"
PSN_API = "psn_api"
PSN_USER = "psn_user"
CONF_EXPOSE_ATTRIBUTES_AS_ENTITIES = "attributes_as_entities"
