"""Constants for Hass Data Points."""

DOMAIN = "hass_datapoints"

STORAGE_KEY = "hass_datapoints.events"
STORAGE_VERSION = 1

EVENT_RECORDED = f"{DOMAIN}_event_recorded"

# Service fields
ATTR_MESSAGE = "message"
ATTR_ANNOTATION = "annotation"
ATTR_ENTITY_IDS = "entity_ids"
ATTR_DEVICE_IDS = "device_ids"
ATTR_AREA_IDS = "area_ids"
ATTR_LABEL_IDS = "label_ids"
ATTR_ICON = "icon"
ATTR_COLOR = "color"
ATTR_DATE = "date"
ATTR_DEV = "dev"
ATTR_AUTOMATION_ID = "automation_id"

SERVICE_RECORD = "record"

# Frontend resource URL (served by integration)
FRONTEND_URL = "/hass_datapoints/cards.js"

PANEL_COMPONENT = "hass-datapoints-history-panel"
PANEL_URL_PATH = "hass-datapoints-history"
PANEL_TITLE = "Data Points"
PANEL_ICON = "mdi:chart-timeline-variant"
