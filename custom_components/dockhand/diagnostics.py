"""diagnostics.py — HA Diagnostics platform for Dockhand.

When a user opens the integration page and clicks "Download diagnostics",
HA calls async_get_config_entry_diagnostics and includes the result in a
ZIP file they can attach to a bug report.

Sensitive fields (API token, container/image labels, and — defense in
depth — tlsKey/hawserToken) are redacted before export.
"""

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.core import HomeAssistant

from . import DockhandConfigEntry
from .helpers import _all_envs, _compose_project, _coordinator_env

# Fields to redact from config entry data before including in diagnostics
TO_REDACT = {"api_token"}

# Fields to redact from raw coordinator data. Docker labels routinely carry
# secrets (e.g. Traefik basic-auth hashes, tokens in reverse-proxy config),
# and diagnostics are attached to public bug reports. The compose-vs-
# freestanding breakdown users need for debugging is already computed into
# environment_summary before redaction.
#
# tlsKey/hawserToken: the slow coordinator does call GET /api/environments
# once per poll cycle (600s) — the only source for a few fields (image-prune
# enabled, Hawser agent identity, configured connection host/port) — but it
# extracts only those specific named fields into env_meta immediately on
# receipt and never stores the raw response (which Dockhand returns with
# these two fully decrypted and no redaction on its side — confirmed from
# source, the route spreads the raw DB row straight into its JSON response).
# So neither key should ever actually appear in coordinator.data; this
# redaction is a second layer of protection in case that ever changes.
COORDINATOR_TO_REDACT = {"labels", "tlsKey", "hawserToken"}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
) -> dict[str, Any]:
    """Return diagnostics data for a Dockhand config entry.

    Includes:
    - Redacted config entry data and options
    - Per-environment summary (env count, container/stack/image/volume/network
      counts) computed via the safe coordinator-data helpers
    - Fully raw coordinator data for each of the three coordinators
      (fast/slow/update), redacted but otherwise unfiltered — deliberately
      not the same pre-extracted view used for the summary above, since
      diagnostics exists to show the actual current state for debugging,
      not a reshaped view of it
    """
    fast = entry.runtime_data.fast_coordinator
    slow = entry.runtime_data.slow_coordinator
    update = entry.runtime_data.update_coordinator

    # Used only for computing the summaries below — the raw dump further
    # down uses fast.data/slow.data directly, unfiltered, since the whole
    # point of a diagnostics dump is to show the actual current state,
    # not a reshaped view of it. If the "environments" wrapper itself
    # were ever wrong, a pre-extracted view would hide exactly that.
    fast_envs = _all_envs(fast.data)
    slow_data = slow.data or {}

    # Build a lightweight summary so the key numbers are visible at a glance
    env_summaries: dict[str, Any] = {}
    for env_id, env_data in fast_envs.items():
        stats = env_data.get("stats") or {}
        containers = env_data.get("containers") or []
        stacks = env_data.get("stacks") or []
        slow_env = _coordinator_env(slow_data, env_id)
        env_summaries[str(env_id)] = {
            "name": stats.get("name", f"env_{env_id}"),
            "online": stats.get("online"),
            "connection_type": stats.get("connectionType"),
            "container_count": len(containers),
            "stack_count": len(stacks),
            "image_count": len(slow_env.get("images") or []),
            "volume_count": len(slow_env.get("volumes") or []),
            "network_count": len(slow_env.get("networks") or []),
            # Include freestanding vs compose-managed breakdown
            "freestanding_containers": sum(
                1 for c in containers if not _compose_project(c)
            ),
            "compose_containers": sum(1 for c in containers if _compose_project(c)),
        }

    # Build a lightweight update summary
    update_envs = _all_envs(update.data) if update is not None else {}
    update_summary: dict[str, Any] = {}
    for env_id, by_container in update_envs.items():
        update_summary[str(env_id)] = {
            "container_count": len(by_container),
            "updates_available": sum(
                1 for item in by_container.values() if item.get("hasUpdate")
            ),
        }

    return {
        "config_entry": async_redact_data(dict(entry.data), TO_REDACT),
        "options": async_redact_data(dict(entry.options), TO_REDACT),
        "environment_summary": env_summaries,
        "schedule_count": len(slow_data.get("schedules") or []),
        "coordinator": {
            "fast": {
                "last_update_success": fast.last_update_success,
                "last_exception": str(fast.last_exception)
                if fast.last_exception
                else None,
                "data": async_redact_data(fast.data or {}, COORDINATOR_TO_REDACT),
            },
            "slow": {
                "last_update_success": slow.last_update_success,
                "last_exception": str(slow.last_exception)
                if slow.last_exception
                else None,
                "data": async_redact_data(slow_data, COORDINATOR_TO_REDACT),
            },
            "update": {
                "enabled": update is not None,
                "last_update_success": update.last_update_success
                if update is not None
                else None,
                "last_exception": str(update.last_exception)
                if update is not None and update.last_exception
                else None,
                "summary": update_summary,
            },
        },
    }
