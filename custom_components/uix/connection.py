import logging
from homeassistant.core import HomeAssistant, callback
from homeassistant.components.websocket_api import (
    event_message,
    async_register_command,
)
from homeassistant.components import websocket_api
import voluptuous as vol

from .helpers import get_version, resolve_foundries, get_all_foundries, validate_foundry_file, check_all_foundry_files
from .const import (
    DOMAIN,
    WS_CONNECT,
    WS_LOG,
    WS_GET_FOUNDRIES,
    WS_SET_FOUNDRY,
    WS_DELETE_FOUNDRY,
    WS_ADD_FOUNDRY_FILE,
    WS_REMOVE_FOUNDRY_FILE,
    WS_RELOAD_FOUNDRY_FILES,
    WS_CHECK_FOUNDRY_FILES,
    CONF_FOUNDRIES,
    CONF_FOUNDRY_FILES,
    CONF_HASS_THROTTLE_ENABLE,
    CONF_HASS_THROTTLE_MS,
    DEFAULT_HASS_THROTTLE_MS,
    CONF_DIALOG_APPLY_AFTER_SHOW,
    CONF_DISABLE_HASH_TEMPLATE_VARIABLE,
    EVENT_FOUNDRIES_UPDATED,
)

_LOGGER = logging.getLogger(__name__)

async def async_setup_connection(hass: HomeAssistant) -> None:
    version = await hass.async_add_executor_job(get_version, hass)

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_CONNECT,
        }
    )
    @websocket_api.async_response
    async def handle_connect(hass: HomeAssistant, connection, msg):
        """Handle a connection request."""

        @callback
        def send_update(data):
            data['version'] = version
            connection.send_message(event_message(msg["id"], {"result": data}))

        @callback
        def on_foundries_updated(event):
            """Push foundry updates to this client via the uix/connect subscription."""
            async def _push():
                try:
                    entries = hass.config_entries.async_entries(DOMAIN)
                    foundries = {}
                    file_paths: list[str] = []
                    throttle_enable = False
                    throttle_ms = DEFAULT_HASS_THROTTLE_MS
                    dialog_apply_after_show = False
                    disable_hash_template_variable = False
                    if entries:
                        foundries = dict(entries[0].options.get(CONF_FOUNDRIES, {}))
                        file_paths = list(entries[0].options.get(CONF_FOUNDRY_FILES, []))
                        throttle_enable = entries[0].options.get(CONF_HASS_THROTTLE_ENABLE, False)
                        throttle_ms = int(entries[0].options.get(CONF_HASS_THROTTLE_MS, DEFAULT_HASS_THROTTLE_MS))
                        dialog_apply_after_show = entries[0].options.get(CONF_DIALOG_APPLY_AFTER_SHOW, False)
                        disable_hash_template_variable = entries[0].options.get(CONF_DISABLE_HASH_TEMPLATE_VARIABLE, False)
                    send_update({
                        CONF_FOUNDRIES: await hass.async_add_executor_job(get_all_foundries, hass, foundries, file_paths),
                        CONF_HASS_THROTTLE_ENABLE: throttle_enable,
                        CONF_HASS_THROTTLE_MS: throttle_ms,
                        CONF_DIALOG_APPLY_AFTER_SHOW: dialog_apply_after_show,
                        CONF_DISABLE_HASH_TEMPLATE_VARIABLE: disable_hash_template_variable,
                    })
                except Exception:
                    _LOGGER.exception("Error pushing foundry update to client")
            hass.async_create_task(_push())

        remove_listener = hass.bus.async_listen(EVENT_FOUNDRIES_UPDATED, on_foundries_updated)

        @callback
        def close_connection():
            remove_listener()

        connection.subscriptions[msg["id"]] = close_connection
        connection.send_result(msg["id"])

        entries = hass.config_entries.async_entries(DOMAIN)
        throttle_enable = False
        throttle_ms = DEFAULT_HASS_THROTTLE_MS
        dialog_apply_after_show = False
        disable_hash_template_variable = False
        if entries:
            throttle_enable = entries[0].options.get(CONF_HASS_THROTTLE_ENABLE, False)
            throttle_ms = int(entries[0].options.get(CONF_HASS_THROTTLE_MS, DEFAULT_HASS_THROTTLE_MS))
            dialog_apply_after_show = entries[0].options.get(CONF_DIALOG_APPLY_AFTER_SHOW, False)
            disable_hash_template_variable = entries[0].options.get(CONF_DISABLE_HASH_TEMPLATE_VARIABLE, False)
        send_update({
            CONF_HASS_THROTTLE_ENABLE: throttle_enable,
            CONF_HASS_THROTTLE_MS: throttle_ms,
            CONF_DIALOG_APPLY_AFTER_SHOW: dialog_apply_after_show,
            CONF_DISABLE_HASH_TEMPLATE_VARIABLE: disable_hash_template_variable,
        })
    
    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_LOG,
            vol.Required("message"): str,
        }
    )
    def handle_log(hass, connection, msg):
        """Print a debug message."""
        _LOGGER.info(f"LOG MESSAGE: {msg['message']}")

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_GET_FOUNDRIES,
        }
    )
    @websocket_api.async_response
    async def handle_get_foundries(hass: HomeAssistant, connection, msg):
        """Return all stored foundries."""
        entries = hass.config_entries.async_entries(DOMAIN)
        foundries = {}
        file_paths: list[str] = []
        if entries:
            foundries = dict(entries[0].options.get(CONF_FOUNDRIES, {}))
            file_paths = list(entries[0].options.get(CONF_FOUNDRY_FILES, []))
        connection.send_result(msg["id"], {CONF_FOUNDRIES: await hass.async_add_executor_job(get_all_foundries, hass, foundries, file_paths)})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_SET_FOUNDRY,
            vol.Required("name"): str,
            vol.Required("config"): dict,
        }
    )
    @websocket_api.async_response
    async def handle_set_foundry(hass: HomeAssistant, connection, msg):
        """Create or update a foundry."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No UIX config entry found")
            return
        entry = entries[0]
        foundries = dict(entry.options.get(CONF_FOUNDRIES, {}))
        foundries[msg["name"]] = msg["config"]
        hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_FOUNDRIES: foundries}
        )
        hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        connection.send_result(msg["id"], {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_DELETE_FOUNDRY,
            vol.Required("name"): str,
        }
    )
    @websocket_api.async_response
    async def handle_delete_foundry(hass: HomeAssistant, connection, msg):
        """Delete a foundry."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No UIX config entry found")
            return
        entry = entries[0]
        foundries = dict(entry.options.get(CONF_FOUNDRIES, {}))
        if msg["name"] not in foundries:
            connection.send_error(msg["id"], "not_found", f"Foundry '{msg['name']}' not found")
            return
        del foundries[msg["name"]]
        hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_FOUNDRIES: foundries}
        )
        hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        connection.send_result(msg["id"], {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_ADD_FOUNDRY_FILE,
            vol.Required("file_path"): str,
        }
    )
    @websocket_api.async_response
    async def handle_add_foundry_file(hass: HomeAssistant, connection, msg):
        """Add a foundry YAML file path to the config entry."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No UIX config entry found")
            return
        entry = entries[0]
        file_path: str = msg["file_path"]
        file_paths: list[str] = list(entry.options.get(CONF_FOUNDRY_FILES, []))
        if file_path in file_paths:
            connection.send_error(msg["id"], "already_added", f"File '{file_path}' is already registered")
            return
        error_key = await hass.async_add_executor_job(validate_foundry_file, hass, file_path)
        if error_key is not None:
            connection.send_error(msg["id"], error_key, f"Foundry file validation failed: {error_key}")
            return
        file_paths.append(file_path)
        hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_FOUNDRY_FILES: file_paths}
        )
        hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        connection.send_result(msg["id"], {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_REMOVE_FOUNDRY_FILE,
            vol.Required("file_path"): str,
        }
    )
    @websocket_api.async_response
    async def handle_remove_foundry_file(hass: HomeAssistant, connection, msg):
        """Remove a foundry YAML file path from the config entry."""
        entries = hass.config_entries.async_entries(DOMAIN)
        if not entries:
            connection.send_error(msg["id"], "no_entry", "No UIX config entry found")
            return
        entry = entries[0]
        file_path: str = msg["file_path"]
        file_paths: list[str] = list(entry.options.get(CONF_FOUNDRY_FILES, []))
        if file_path not in file_paths:
            connection.send_error(msg["id"], "not_found", f"File '{file_path}' is not registered")
            return
        file_paths.remove(file_path)
        hass.config_entries.async_update_entry(
            entry, options={**entry.options, CONF_FOUNDRY_FILES: file_paths}
        )
        hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        connection.send_result(msg["id"], {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_RELOAD_FOUNDRY_FILES,
        }
    )
    @websocket_api.async_response
    async def handle_reload_foundry_files(hass: HomeAssistant, connection, msg):
        """Re-read all registered foundry files and push updates to connected clients."""
        hass.bus.async_fire(EVENT_FOUNDRIES_UPDATED, {})
        connection.send_result(msg["id"], {})

    @websocket_api.websocket_command(
        {
            vol.Required("type"): WS_CHECK_FOUNDRY_FILES,
        }
    )
    @websocket_api.async_response
    async def handle_check_foundry_files(hass: HomeAssistant, connection, msg):
        """Validate all registered foundry files and return errors."""
        entries = hass.config_entries.async_entries(DOMAIN)
        file_paths: list[str] = []
        if entries:
            file_paths = list(entries[0].options.get(CONF_FOUNDRY_FILES, []))
        result = await hass.async_add_executor_job(check_all_foundry_files, hass, file_paths)
        connection.send_result(msg["id"], result)

    async_register_command(hass, handle_connect)
    async_register_command(hass, handle_log)
    async_register_command(hass, handle_get_foundries)
    async_register_command(hass, handle_set_foundry)
    async_register_command(hass, handle_delete_foundry)
    async_register_command(hass, handle_add_foundry_file)
    async_register_command(hass, handle_remove_foundry_file)
    async_register_command(hass, handle_reload_foundry_files)
    async_register_command(hass, handle_check_foundry_files)