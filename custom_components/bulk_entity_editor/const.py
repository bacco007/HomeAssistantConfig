"""Constants for the Bulk Entity Editor integration."""

DOMAIN = "bulk_entity_editor"

PANEL_URL_PATH = "bulk-entity-editor"
PANEL_TITLE = "Bulk Editor"
PANEL_ICON = "mdi:table-edit"

PANEL_WEBCOMPONENT_NAME = "bulk-entity-editor-panel"
PANEL_FILENAME = "bulk-entity-editor.js"

# Directory-based static path. The URL prefix intentionally uses hyphens and
# a "-static" suffix so it can't collide with the integration's DOMAIN or
# the panel's frontend URL.
PANEL_STATIC_URL_PREFIX = "/bulk-entity-editor-static"
PANEL_JS_URL = f"{PANEL_STATIC_URL_PREFIX}/{PANEL_FILENAME}"
