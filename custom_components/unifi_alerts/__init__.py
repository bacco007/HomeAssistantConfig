"""The UniFi Alerts integration."""

from __future__ import annotations

import logging
import secrets
from typing import Any, cast

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed, ConfigEntryNotReady
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceEntryType
from homeassistant.helpers.storage import Store

from .const import (
    ALL_CATEGORIES,
    CONF_API_KEY,
    CONF_CONTROLLER_URL,
    CONF_VERIFY_SSL,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    EXCEPTION_SETUP_AUTH_FAILED,
    EXCEPTION_SETUP_CANNOT_CONNECT,
    ISSUE_ID_APIKEY_MIGRATION,
    ISSUE_ID_AUTH_FAILED,
    ISSUE_ID_PERSIST_FAILED,
    ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH,
    ISSUE_ID_WEBHOOK_SECRET_ROTATED,
    ISSUE_ID_WEBHOOK_URLS_CHANGED,
    STORAGE_VERSION_WATERMARKS,
)
from .coordinator import UniFiAlertsCoordinator
from .models import RuntimeData, UniFiClientConfig
from .services import async_register_services, async_unregister_services
from .unifi_auth import CannotConnectError, InvalidAuthError
from .unifi_client import UniFiClient
from .webhook_handler import WebhookManager

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.BINARY_SENSOR,
    Platform.SENSOR,
    Platform.EVENT,
    Platform.BUTTON,
]


async def async_migrate_entry(hass: HomeAssistant, config_entry: ConfigEntry) -> bool:
    """Migrate old config entry versions to current."""
    if config_entry.version == 1:
        new_data = {k: v for k, v in config_entry.data.items() if k != "is_unifi_os"}
        hass.config_entries.async_update_entry(config_entry, data=new_data, version=2)
        _LOGGER.info("Migrated config entry %s from version 1 to 2", config_entry.entry_id)

    if config_entry.version == 2:
        new_data = dict(config_entry.data)
        changed = False
        suffix_backfilled = False
        if not new_data.get("webhook_secret"):
            new_data["webhook_secret"] = secrets.token_urlsafe(32)
            changed = True
        if not new_data.get("webhook_id_suffix"):
            new_data["webhook_id_suffix"] = secrets.token_hex(4)
            changed = True
            suffix_backfilled = True
        if changed:
            hass.config_entries.async_update_entry(config_entry, data=new_data, version=3)
            _LOGGER.debug(
                "Migrated config entry %s to version 3: backfilled webhook secret/suffix. "
                "Re-paste webhook URLs from Settings > Devices & Services > UniFi Alerts > Configure.",
                config_entry.entry_id,
            )
            if suffix_backfilled:
                ir.async_create_issue(
                    hass,
                    DOMAIN,
                    f"{ISSUE_ID_WEBHOOK_URLS_CHANGED}_{config_entry.entry_id}",
                    is_fixable=False,
                    severity=ir.IssueSeverity.WARNING,
                    translation_key=ISSUE_ID_WEBHOOK_URLS_CHANGED,
                    translation_placeholders={"name": config_entry.title},
                )
        else:
            hass.config_entries.async_update_entry(config_entry, version=3)

    if config_entry.version == 3:
        _migrate_v3_to_v4(hass, config_entry)

    return True


def _migrate_v3_to_v4(hass: HomeAssistant, config_entry: ConfigEntry) -> None:
    """Migrate a version-3 entry to the API-key-only version-4 schema.

    Username/password auth has been removed (epic #277). Every version-3 entry
    is moved to version 4 with any stored username/password (and the now-unused
    auth_method marker) dropped:

    - Entries that already carry a non-empty ``api_key`` migrate silently and
      keep working with no user action.
    - Entries with only username/password lose their credentials here, so
      ``async_setup_entry`` raises ``ConfigEntryAuthFailed`` and Home Assistant
      launches the reauth flow, which asks for a single API key. The reauth
      entry point (config_flow.async_step_reauth) raises an explanatory repair
      issue for these entries so the prompt does not look like a credential
      failure.

    The entry is updated in place, so entry_id, unique_id, the webhook id
    suffix, and the webhook secret are all untouched: entities, history, and
    Alarm Manager URLs survive the migration.
    """
    new_data = dict(config_entry.data)
    had_api_key = bool(new_data.get(CONF_API_KEY))
    # "username"/"password"/"auth_method" are legacy version-3 keys. The auth
    # constants were removed with the userpass code (#279), so these are dropped
    # by literal key; nothing reads auth_method any more.
    for legacy_key in ("username", "password", "auth_method"):
        new_data.pop(legacy_key, None)
    hass.config_entries.async_update_entry(config_entry, data=new_data, version=4)
    if had_api_key:
        _LOGGER.info(
            "Migrated config entry %s to version 4: API key present, no action required.",
            config_entry.entry_id,
        )
    else:
        _LOGGER.warning(
            "Migrated config entry %s to version 4: no API key stored. Username/password "
            "authentication has been removed, so re-authentication with an API key will be "
            "requested. See the integration README for how to create an API key.",
            config_entry.entry_id,
        )


def _prune_disabled_category_entities(
    hass: HomeAssistant, entry: ConfigEntry, coordinator: UniFiAlertsCoordinator
) -> None:
    """Remove registry entries for categories the user did not select.

    Entity creation is gated on the enabled set, but entities registered by a
    previous configuration - or before this behaviour existed - would otherwise
    linger as orphaned, unavailable entries. This runs on every setup and reload,
    so it also cleans up a category the user deselects later.
    """
    disabled_prefixes = tuple(
        f"{entry.entry_id}_{cat}_"
        for cat in ALL_CATEGORIES
        if (state := coordinator.get_category_state(cat)) is None or not state.enabled
    )
    if not disabled_prefixes:
        return
    registry = er.async_get(hass)
    for reg_entry in er.async_entries_for_config_entry(registry, entry.entry_id):
        if reg_entry.unique_id.startswith(disabled_prefixes):
            registry.async_remove(reg_entry.entity_id)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up UniFi Alerts from a config entry."""
    verify_ssl: bool = entry.data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
    if not verify_ssl:
        _LOGGER.warning(
            "SSL certificate verification is disabled for %s. "
            "This is a security risk — only use this for controllers with self-signed certificates.",
            entry.data.get("controller_url", "unknown"),
        )
    session = async_get_clientsession(hass, verify_ssl=verify_ssl)
    # HA's ConfigEntry.data is Mapping[str, Any]; cast at the boundary so
    # internal call sites are typed via UniFiClientConfig.
    client = UniFiClient(
        session,
        entry.data["controller_url"],
        cast(UniFiClientConfig, dict(entry.data)),
    )

    try:
        await client.authenticate()
    except InvalidAuthError as err:
        _LOGGER.error("Authentication failed for UniFi controller: %s", type(err).__name__)
        raise ConfigEntryAuthFailed(
            f"Invalid credentials for UniFi controller: {type(err).__name__}",
            translation_domain=DOMAIN,
            translation_key=EXCEPTION_SETUP_AUTH_FAILED,
            translation_placeholders={"error": type(err).__name__},
        ) from err
    except CannotConnectError as err:
        _LOGGER.error("Failed to authenticate to UniFi controller: %s", type(err).__name__)
        raise ConfigEntryNotReady(
            f"Could not connect to UniFi controller: {type(err).__name__}",
            translation_domain=DOMAIN,
            translation_key=EXCEPTION_SETUP_CANNOT_CONNECT,
            translation_placeholders={"error": type(err).__name__},
        ) from err

    # Proactively register the hub device so it appears in HA's Services section
    # immediately after setup — before any entity is registered.
    dev_reg = dr.async_get(hass)
    dev_reg.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(DOMAIN, entry.entry_id)},
        name="UniFi Alerts",
        manufacturer="Ubiquiti",
        model="UniFi Network Controller",
        entry_type=DeviceEntryType.SERVICE,
        configuration_url=entry.data.get(CONF_CONTROLLER_URL),
    )

    coordinator = UniFiAlertsCoordinator(
        hass,
        client,
        cast(UniFiClientConfig, dict(entry.data) | dict(entry.options)),
        entry,
    )

    # Restore persisted acknowledgement watermarks before first poll so that
    # open_count is filtered correctly from the very first data fetch.
    await coordinator.async_restore_watermarks()

    # Perform an initial poll so entities have data before first render.
    # async_config_entry_first_refresh() (HA core) already raises the
    # semantically correct exception on failure — ConfigEntryNotReady for a
    # connectivity/UpdateFailed outcome, or ConfigEntryAuthFailed if the
    # coordinator's own re-auth attempt failed (see coordinator._async_update_data).
    # A blanket except here would misclassify a ConfigEntryAuthFailed as
    # ConfigEntryNotReady, silently suppressing HA's reauth-repair flow.
    await coordinator.async_config_entry_first_refresh()

    # Register webhooks and capture the generated URLs for display
    webhook_manager = WebhookManager(
        hass,
        entry.entry_id,
        cast(UniFiClientConfig, dict(entry.data) | dict(entry.options)),
        coordinator.push_alert,
    )
    webhook_urls = webhook_manager.register_all()

    entry.runtime_data = RuntimeData(
        coordinator=coordinator,
        webhook_urls=webhook_urls,
        unregister_webhooks=webhook_manager.unregister_all,
        client=client,
    )

    _prune_disabled_category_entities(hass, entry, coordinator)

    try:
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
        # Register domain services (idempotent — safe for multiple entries)
        async_register_services(hass)
    except Exception:
        # HA never calls async_unload_entry for a setup that failed here, so
        # the webhooks registered above would otherwise survive to the
        # automatic retry, which then finds every deterministic webhook_id
        # already taken and silently skips re-registering all of them.
        await coordinator.async_shutdown()
        webhook_manager.unregister_all()
        await client.close()
        raise

    # Re-register webhooks and reload options when the entry is updated
    entry.async_on_unload(entry.add_update_listener(_async_update_listener))

    _LOGGER.info("UniFi Alerts set up. Registered %d webhook(s).", len(webhook_urls))
    if _LOGGER.isEnabledFor(logging.DEBUG):
        # Safe to log verbatim: register_all() no longer embeds the bearer
        # secret in these URLs (#176) — auth now travels via the
        # Authorization header (or, for legacy setups, the ?token= query
        # param, which callers add themselves and which never appears here).
        _LOGGER.debug(
            "UniFi Alerts webhook URLs: %s",
            ", ".join(f"{cat}={url}" for cat, url in webhook_urls.items()),
        )
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        runtime_data: RuntimeData = entry.runtime_data
        await runtime_data.coordinator.async_shutdown()
        runtime_data.unregister_webhooks()
        await runtime_data.client.close()
        # Unregister domain-level services only when the last entry is gone
        remaining = [
            e for e in hass.config_entries.async_entries(DOMAIN) if e.entry_id != entry.entry_id
        ]
        if not remaining:
            async_unregister_services(hass)
    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up persisted storage and repair issues after a config entry is removed.

    Fires after async_unload_entry, once HA has decided the entry itself is
    gone for good (not just reloading). Without this, the per-entry watermark
    Store file and any open repair issues keyed to entry.entry_id would remain
    orphaned forever, since nothing else ever reads or clears them again.
    """
    store: Store[dict[str, Any]] = Store(
        hass, STORAGE_VERSION_WATERMARKS, f"{DOMAIN}_watermarks_{entry.entry_id}"
    )
    await store.async_remove()

    for issue_id_base in (
        ISSUE_ID_AUTH_FAILED,
        ISSUE_ID_WEBHOOK_SECRET_ROTATED,
        ISSUE_ID_WEBHOOK_URLS_CHANGED,
        ISSUE_ID_PERSIST_FAILED,
        ISSUE_ID_APIKEY_MIGRATION,
        ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH,
    ):
        ir.async_delete_issue(hass, DOMAIN, f"{issue_id_base}_{entry.entry_id}")

    _LOGGER.debug("Cleaned up storage and repair issues for removed entry %s", entry.entry_id)


async def _async_update_listener(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the integration when options change."""
    await hass.config_entries.async_reload(entry.entry_id)
