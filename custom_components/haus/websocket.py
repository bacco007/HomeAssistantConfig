"""The admin-checked websocket command behind the household detail card.

Per-user activity counts are deliberately not state attributes. An
administrator can ask for them, and only when the instance has opted in through
the options flow. Nothing here leaves the instance.
"""

from typing import Any

import voluptuous as vol
from homeassistant.components.websocket_api import async_register_command
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.const import (
    ERR_NOT_ALLOWED,
    ERR_NOT_FOUND,
)
from homeassistant.components.websocket_api.decorators import (
    async_response,
    require_admin,
    websocket_command,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util

from .const import (
    ACTIVITY_RECENT_DAYS,
    ACTIVITY_SUSTAINED_DAYS,
    CONF_EXPOSE_PER_USER_DETAIL,
    DEFAULT_EXPOSE_PER_USER_DETAIL,
    DOMAIN,
    WS_TYPE_USER_ACTIVITY,
)
from .coordinator import HausConfigEntry


@callback
def async_register(hass: HomeAssistant) -> None:
    """Register the HAUS websocket commands."""
    async_register_command(hass, ws_user_activity)


def _loaded_entry(hass: HomeAssistant) -> HausConfigEntry | None:
    """Return the loaded HAUS entry, if there is one."""
    entries: list[HausConfigEntry] = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0] if entries else None


@require_admin
@websocket_command({vol.Required("type"): WS_TYPE_USER_ACTIVITY})
@async_response
async def ws_user_activity(
    hass: HomeAssistant,
    connection: ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return per-user activity counts for the household detail card."""
    entry = _loaded_entry(hass)
    if entry is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "HAUS is not set up")
        return

    if not entry.options.get(
        CONF_EXPOSE_PER_USER_DETAIL, DEFAULT_EXPOSE_PER_USER_DETAIL
    ):
        connection.send_error(
            msg["id"],
            ERR_NOT_ALLOWED,
            "Per-user detail is turned off for this instance",
        )
        return

    store = entry.runtime_data.store
    now = dt_util.utcnow()
    recent = store.user_action_counts(ACTIVITY_RECENT_DAYS, now)
    sustained = store.user_action_counts(ACTIVITY_SUSTAINED_DAYS, now)
    last_active = store.user_last_active()

    names = {user.id: user.name for user in await hass.auth.async_get_users()}
    users = [
        {
            "user_id": user_id,
            "name": names.get(user_id),
            "actions_7d": recent.get(user_id, 0),
            "actions_30d": count,
            "last_active": last_active.get(user_id),
        }
        for user_id, count in sorted(
            sustained.items(), key=lambda item: item[1], reverse=True
        )
    ]
    connection.send_result(msg["id"], {"users": users})
