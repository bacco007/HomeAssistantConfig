"""Constants for the UniFi Alerts integration."""

from __future__ import annotations

from typing import Final

DOMAIN = "unifi_alerts"

# ──────────────────────────────────────────────
# Config entry keys
# ──────────────────────────────────────────────
# Typed as Final so mypy resolves them to literal types when used as
# UniFiClientConfig TypedDict keys; without this, `.get(key, default)`
# returns `object` instead of the field's declared type.
CONF_CONTROLLER_URL: Final = "controller_url"
CONF_API_KEY: Final = "api_key"
CONF_POLL_INTERVAL: Final = "poll_interval"
CONF_CLEAR_TIMEOUT: Final = "clear_timeout"
CONF_ENABLED_CATEGORIES: Final = "enabled_categories"
CONF_MIN_SEVERITY: Final = "min_severity"
CONF_VERIFY_SSL: Final = "verify_ssl"
CONF_WEBHOOK_SECRET: Final = "webhook_secret"
CONF_WEBHOOK_ID_SUFFIX: Final = "webhook_id_suffix"
CONF_REGENERATE_WEBHOOK_SECRET: Final = "regenerate_webhook_secret"
CONF_SITE: Final = "site"
# Stable UPnP serial number (MAC address) captured from SSDP discovery.
# Unlike CONF_CONTROLLER_URL (what unique_id is keyed on), this survives an
# IP address change, so it is how async_step_ssdp finds and refreshes a
# previously configured entry when a known console reappears at a new
# address instead of leaving it pinned to the stale URL (#343). Only set on
# entries created via SSDP discovery; absent on entries added manually.
CONF_DEVICE_SERIAL: Final = "device_serial"

DEFAULT_POLL_INTERVAL = 60  # seconds
DEFAULT_CLEAR_TIMEOUT = 30  # minutes
DEFAULT_VERIFY_SSL = True  # disable in config flow if controller has a self-signed cert
DEFAULT_SITE = "default"
WEBHOOK_MAX_BODY_BYTES = 8192  # 8 KB ceiling on inbound webhook bodies
WEBHOOK_DEDUP_WINDOW_SECONDS = (
    5.0  # suppress duplicate (category, alert_key) pushes within this window
)

# ──────────────────────────────────────────────
# Webhook health signal
# ──────────────────────────────────────────────
# A per-category onboarding/health indicator. After pasting webhook URLs into
# Alarm Manager, a user has no proof the wiring works until a real alert fires;
# this surfaces "last webhook received" and a coarse healthy/stale/never state.
# A category is "stale" if its most recent webhook is older than this window.
# The window is deliberately generous: webhook delivery is event-driven and
# rarely-firing categories (honeypot, threat) legitimately go quiet for long
# stretches, so a short window would label healthy setups stale.
WEBHOOK_STALE_AFTER_SECONDS = 7 * 24 * 60 * 60  # 7 days

# webhook_health() return values (also used as the state-attribute string).
WEBHOOK_HEALTH_NEVER: Final = "never_received"  # no webhook ever received
WEBHOOK_HEALTH_HEALTHY: Final = "healthy"  # webhook received within the window
WEBHOOK_HEALTH_STALE: Final = "stale"  # last webhook older than the window

# v2 system-log polling parameters
SYSTEM_LOG_PAGE_SIZE = 100  # confirmed observed limit per page
MAX_SYSTEM_LOG_PAGES = 10  # safety cap: at most 100*10 = 1000 events per poll cycle
DEFAULT_SYSTEM_LOG_LOOKBACK_HOURS = 24  # hours to look back when no watermark exists

# ──────────────────────────────────────────────
# Persisted storage & repair-issue identifiers
# ──────────────────────────────────────────────
# Version for the per-entry watermark Store file (coordinator.py). Shared with
# __init__.py so async_remove_entry can address the same file for deletion
# without duplicating the version number.
STORAGE_VERSION_WATERMARKS: Final = 1

# Repair-issue id bases. Each is suffixed with f"_{entry.entry_id}" at the
# creation site (config_flow.py, coordinator.py, __init__.py) so multi-entry
# installs get independent repair cards. Centralised here, instead of as
# inline f-string literals, so the creation site and the async_remove_entry
# cleanup site can never drift apart.
ISSUE_ID_AUTH_FAILED: Final = "auth_failed"
ISSUE_ID_WEBHOOK_SECRET_ROTATED: Final = "webhook_secret_rotated"
ISSUE_ID_WEBHOOK_URLS_CHANGED: Final = "webhook_urls_changed"
ISSUE_ID_PERSIST_FAILED: Final = "watermark_persist_failed"
# Raised the first time a webhook authenticates via the legacy ?token= query
# parameter (#176) rather than the Authorization: Bearer header. Nudges
# users still on the legacy form to migrate; cleared as soon as a header-
# authenticated webhook is received for the same entry.
ISSUE_ID_WEBHOOK_LEGACY_QUERY_AUTH: Final = "webhook_legacy_query_auth"
# Raised when a username/password entry is migrated to the API-key-only schema
# (version 4) and needs an API key supplied via reauth. Distinct from
# ISSUE_ID_AUTH_FAILED so the repair card explains the upgrade rather than
# looking like a credential failure.
ISSUE_ID_APIKEY_MIGRATION: Final = "apikey_migration_required"

# Translation keys for exceptions raised during setup and polling (Gold
# quality-scale rule exception-translations, #341). These are distinct from
# the ISSUE_ID_* constants above: those key repair issues in the issue
# registry, these key the "exceptions" section in strings.json/translations
# consumed via translation_domain/translation_key/translation_placeholders on
# the raised exception itself (ConfigEntryAuthFailed, ConfigEntryNotReady,
# UpdateFailed). Scoped only to exceptions HA actually surfaces to the user;
# unifi_auth.py's internal CannotConnectError/InvalidAuthError/
# SslCertificateError are caught and re-raised as these, so they do not need
# their own translation keys.
EXCEPTION_SETUP_AUTH_FAILED: Final = "setup_auth_failed"
EXCEPTION_SETUP_CANNOT_CONNECT: Final = "setup_cannot_connect"
EXCEPTION_POLL_AUTH_FAILED: Final = "poll_auth_failed"
EXCEPTION_POLL_CANNOT_CONNECT: Final = "poll_cannot_connect"

# ──────────────────────────────────────────────
# Category identifiers
# ──────────────────────────────────────────────
CATEGORY_NETWORK_DEVICE = "network_device"
CATEGORY_NETWORK_WAN = "network_wan"
CATEGORY_NETWORK_CLIENT = "network_client"
CATEGORY_SECURITY_THREAT = "security_threat"
CATEGORY_SECURITY_HONEYPOT = "security_honeypot"
CATEGORY_SECURITY_FIREWALL = "security_firewall"
CATEGORY_POWER = "power"

ALL_CATEGORIES: list[str] = [
    CATEGORY_NETWORK_DEVICE,
    CATEGORY_NETWORK_WAN,
    CATEGORY_NETWORK_CLIENT,
    CATEGORY_SECURITY_THREAT,
    CATEGORY_SECURITY_HONEYPOT,
    CATEGORY_SECURITY_FIREWALL,
    CATEGORY_POWER,
]

CATEGORY_ICONS: dict[str, str] = {
    CATEGORY_NETWORK_DEVICE: "mdi:lan-disconnect",
    CATEGORY_NETWORK_WAN: "mdi:wan",
    CATEGORY_NETWORK_CLIENT: "mdi:account-network",
    CATEGORY_SECURITY_THREAT: "mdi:shield-bug",
    CATEGORY_SECURITY_HONEYPOT: "mdi:bee",
    CATEGORY_SECURITY_FIREWALL: "mdi:firewall",
    CATEGORY_POWER: "mdi:lightning-bolt",
}

CATEGORY_ICONS_OK: dict[str, str] = {
    CATEGORY_NETWORK_DEVICE: "mdi:lan-check",
    CATEGORY_NETWORK_WAN: "mdi:web-check",
    CATEGORY_NETWORK_CLIENT: "mdi:account-check",
    CATEGORY_SECURITY_THREAT: "mdi:shield-check",
    CATEGORY_SECURITY_HONEYPOT: "mdi:shield-check",
    CATEGORY_SECURITY_FIREWALL: "mdi:shield-check",
    CATEGORY_POWER: "mdi:power-plug",
}

# ──────────────────────────────────────────────
# UniFi event key → category mapping
# Keys are prefixes/substrings from the 'key' field in UniFi alarm payloads.
# Sourced from community reverse-engineering of the UniFi controller API.
# ──────────────────────────────────────────────
UNIFI_KEY_TO_CATEGORY: dict[str, str] = {
    # Network: device offline/online — Access Points
    "EVT_AP_Disconnected": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Connected": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Lost_Contact": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Adopted": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_AutoReadopted": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Restarted": CATEGORY_NETWORK_DEVICE,  # also matches EVT_AP_RestartedUnknown
    "EVT_AP_Upgraded": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_UpgradeFailed": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_UpgradeScheduled": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Isolated": CATEGORY_NETWORK_DEVICE,
    "EVT_AP_Deleted": CATEGORY_NETWORK_DEVICE,
    # Network: device offline/online — Switches
    "EVT_SW_Disconnected": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_Connected": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_Lost_Contact": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_Adopted": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_AutoReadopted": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_Restarted": CATEGORY_NETWORK_DEVICE,  # also matches EVT_SW_RestartedUnknown
    "EVT_SW_Upgraded": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_Deleted": CATEGORY_NETWORK_DEVICE,
    "EVT_SW_StpPortBlocking": CATEGORY_NETWORK_DEVICE,
    # Network: device offline/online — Gateways
    "EVT_GW_Disconnected": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_Connected": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_Lost_Contact": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_Adopted": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_AutoReadopted": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_Restarted": CATEGORY_NETWORK_DEVICE,  # also matches EVT_GW_RestartedUnknown
    "EVT_GW_Upgraded": CATEGORY_NETWORK_DEVICE,
    "EVT_GW_Deleted": CATEGORY_NETWORK_DEVICE,
    # Network: device offline/online — Dream Machine (DM prefix)
    "EVT_DM_Connected": CATEGORY_NETWORK_DEVICE,
    "EVT_DM_Lost_Contact": CATEGORY_NETWORK_DEVICE,
    "EVT_DM_Upgraded": CATEGORY_NETWORK_DEVICE,
    # Network: device offline/online — Smart power / outlet devices (XG prefix)
    "EVT_XG_AutoReadopted": CATEGORY_NETWORK_DEVICE,
    "EVT_XG_Connected": CATEGORY_NETWORK_DEVICE,
    "EVT_XG_Lost_Contact": CATEGORY_NETWORK_DEVICE,
    # Network: device offline/online — IPS sensor
    "EVT_IPS_IDS_Disconnected": CATEGORY_NETWORK_DEVICE,
    # Network: WAN
    "EVT_GW_WANTransition": CATEGORY_NETWORK_WAN,
    "EVT_GW_Failover": CATEGORY_NETWORK_WAN,
    "EVT_GW_WAN_Transition": CATEGORY_NETWORK_WAN,
    "EVT_GW_Internet_Access": CATEGORY_NETWORK_WAN,
    # Network: client — wireless users
    "EVT_WU_Connected": CATEGORY_NETWORK_CLIENT,
    "EVT_WU_Disconnected": CATEGORY_NETWORK_CLIENT,
    "EVT_WU_Roam": CATEGORY_NETWORK_CLIENT,  # also matches EVT_WU_RoamRadio
    # Network: client — wireless guests
    "EVT_WG_Connected": CATEGORY_NETWORK_CLIENT,
    "EVT_WG_Disconnected": CATEGORY_NETWORK_CLIENT,
    "EVT_WG_Roam": CATEGORY_NETWORK_CLIENT,  # also matches EVT_WG_RoamRadio
    "EVT_WG_AuthorizationEnded": CATEGORY_NETWORK_CLIENT,
    # Network: client — wired users
    "EVT_LU_Connected": CATEGORY_NETWORK_CLIENT,
    "EVT_LU_Disconnected": CATEGORY_NETWORK_CLIENT,
    # Network: client — LAN guests
    "EVT_LG_Connected": CATEGORY_NETWORK_CLIENT,
    "EVT_LG_Disconnected": CATEGORY_NETWORK_CLIENT,
    # Security: threat / IDS
    "EVT_IPS_ThreatDetected": CATEGORY_SECURITY_THREAT,
    "EVT_IPS_IpsAlert": CATEGORY_SECURITY_THREAT,
    "EVT_IDS_Alert": CATEGORY_SECURITY_THREAT,
    "EVT_GW_ThreatDetected": CATEGORY_SECURITY_THREAT,
    "EVT_AP_DetectRogueAP": CATEGORY_SECURITY_THREAT,
    "EVT_AP_RadarDetected": CATEGORY_SECURITY_THREAT,  # DFS radar detection
    "EVT_SW_DetectRogueDHCP": CATEGORY_SECURITY_THREAT,
    # Security: honeypot
    "EVT_GW_Honeypot": CATEGORY_SECURITY_HONEYPOT,
    "EVT_GW_HoneypotDetected": CATEGORY_SECURITY_HONEYPOT,
    # Security: firewall
    "EVT_GW_GeoIPFilteredTraffic": CATEGORY_SECURITY_FIREWALL,
    "EVT_GW_TrafficRoute": CATEGORY_SECURITY_FIREWALL,
    "EVT_GW_BlockedTraffic": CATEGORY_SECURITY_FIREWALL,
    "EVT_LC_Blocked": CATEGORY_SECURITY_FIREWALL,  # wired client blocked by admin
    "EVT_WC_Blocked": CATEGORY_SECURITY_FIREWALL,  # wireless client blocked by admin
    # Power
    "EVT_SW_PoEDisconnect": CATEGORY_POWER,
    "EVT_SW_PoeDisconnect": CATEGORY_POWER,  # alt. casing seen on some firmware
    "EVT_SW_PoeOverload": CATEGORY_POWER,
    "EVT_SW_Overheat": CATEGORY_POWER,
    "EVT_AP_PowerCycled": CATEGORY_POWER,
    "EVT_GW_PowerLoss": CATEGORY_POWER,
    "EVT_XG_OutletPowerCycle": CATEGORY_POWER,
    "EVT_USP_RpsPowerDeniedByPsuOverload": CATEGORY_POWER,
    "EVT_UPS_": CATEGORY_POWER,
}

# ──────────────────────────────────────────────
# v2 system-log event key → category mapping
# Keys are the exact `key` field values from POST /system-log/all responses.
# These use a flat descriptive format with no EVT_ prefix.
# The v2 `category` field provides broad grouping; this map provides fine-grained
# mapping to the integration's categories.
# Source: field-confirmed on UCG-Ultra running Network 10.3.58; see docs/UNIFI.md.
# NOTE: this list is intentionally incomplete. Additional keys must be added as
# they surface in the wild — see docs/TODO.md.
# ──────────────────────────────────────────────
SYSTEM_LOG_KEY_TO_CATEGORY: dict[str, str] = {
    # Security: threat / IPS / IDS — confirmed SECURITY category
    "THREAT_BLOCKED_KNOWN_DESTINATION_CLIENT": CATEGORY_SECURITY_THREAT,
    "THREAT_BLOCKED_KNOWN_SOURCE_IP": CATEGORY_SECURITY_THREAT,
    "THREAT_BLOCKED_KNOWN_DESTINATION_IP": CATEGORY_SECURITY_THREAT,
    "THREAT_BLOCKED": CATEGORY_SECURITY_THREAT,
    "THREAT_DETECTED": CATEGORY_SECURITY_THREAT,
    "IDS_ALERT": CATEGORY_SECURITY_THREAT,
    "IPS_ALERT": CATEGORY_SECURITY_THREAT,
    # Security: firewall blocks — SECURITY category
    "GEO_IP_FILTERED": CATEGORY_SECURITY_FIREWALL,
    "FIREWALL_BLOCK": CATEGORY_SECURITY_FIREWALL,
    "CLIENT_BLOCKED": CATEGORY_SECURITY_FIREWALL,
    # Security: honeypot — SECURITY category
    "HONEYPOT_DETECTED": CATEGORY_SECURITY_HONEYPOT,
    "HONEYPOT": CATEGORY_SECURITY_HONEYPOT,
    # Network: WAN — confirmed INTERNET_AND_WAN category
    "WAN_TRANSITION": CATEGORY_NETWORK_WAN,
    "WAN_FAILOVER": CATEGORY_NETWORK_WAN,
    "WAN_DISCONNECTED": CATEGORY_NETWORK_WAN,
    "WAN_CONNECTED": CATEGORY_NETWORK_WAN,
    "INTERNET_UNREACHABLE": CATEGORY_NETWORK_WAN,
    "INTERNET_RESTORED": CATEGORY_NETWORK_WAN,
    # Network: device offline/online — confirmed UNIFI_DEVICES category
    "DEVICE_DISCONNECTED": CATEGORY_NETWORK_DEVICE,
    "DEVICE_CONNECTED": CATEGORY_NETWORK_DEVICE,
    "DEVICE_LOST_CONTACT": CATEGORY_NETWORK_DEVICE,
    "DEVICE_ADOPTED": CATEGORY_NETWORK_DEVICE,
    "DEVICE_RESTARTED": CATEGORY_NETWORK_DEVICE,
    "DEVICE_UPGRADED": CATEGORY_NETWORK_DEVICE,
    "AP_DISCONNECTED": CATEGORY_NETWORK_DEVICE,
    "AP_CONNECTED": CATEGORY_NETWORK_DEVICE,
    "SWITCH_DISCONNECTED": CATEGORY_NETWORK_DEVICE,
    "SWITCH_CONNECTED": CATEGORY_NETWORK_DEVICE,
    "GATEWAY_DISCONNECTED": CATEGORY_NETWORK_DEVICE,
    "GATEWAY_CONNECTED": CATEGORY_NETWORK_DEVICE,
    # Network: client — CLIENT_DEVICES category
    "CLIENT_CONNECTED": CATEGORY_NETWORK_CLIENT,
    "CLIENT_DISCONNECTED": CATEGORY_NETWORK_CLIENT,
    "CLIENT_ROAMED": CATEGORY_NETWORK_CLIENT,
    # Power — POWER category
    "POE_OVERLOAD": CATEGORY_POWER,
    "POE_DISCONNECT": CATEGORY_POWER,
    "POWER_LOSS": CATEGORY_POWER,
    "UPS_LOW_BATTERY": CATEGORY_POWER,
    "DEVICE_OVERHEAT": CATEGORY_POWER,
}

# v2 category field values that map to integration categories.
# Used when key-level mapping fails to provide coarse-grained fallback.
SYSTEM_LOG_CATEGORY_FALLBACK: dict[str, str] = {
    "SECURITY": CATEGORY_SECURITY_THREAT,
    "INTERNET_AND_WAN": CATEGORY_NETWORK_WAN,
    "UNIFI_DEVICES": CATEGORY_NETWORK_DEVICE,
    "CLIENT_DEVICES": CATEGORY_NETWORK_CLIENT,
    "POWER": CATEGORY_POWER,
}

# Webhook IDs — one per category, auto-registered by the integration.
# The optional `suffix` (CONF_WEBHOOK_ID_SUFFIX, generated per-entry by the
# config flow) prevents two config entries from colliding on the same webhook
# ID. Entries created before the suffix was introduced pass `suffix=""` and
# fall back to the legacy format so their existing UniFi Alarm Manager URLs
# keep working — only multi-entry users need to re-paste URLs after adding a
# second entry, which they had to do anyway because that case was silently
# broken pre-fix.
WEBHOOK_ID_PREFIX = "unifi_alerts_"


def webhook_id_for_category(category: str, suffix: str = "") -> str:
    if suffix:
        return f"{WEBHOOK_ID_PREFIX}{suffix}_{category}"
    return f"{WEBHOOK_ID_PREFIX}{category}"


def classify_event_key(key: str, v2_category_enum: str = "") -> str:
    """Map a UniFi event key to an integration category string.

    Checks (in order):
    1. Exact match in SYSTEM_LOG_KEY_TO_CATEGORY (v2 system-log flat keys)
    2. Prefix match in UNIFI_KEY_TO_CATEGORY (legacy EVT_* keys)
    3. Broad enum fallback via SYSTEM_LOG_CATEGORY_FALLBACK (v2 category field)

    Returns "" when no match is found.
    """
    if result := SYSTEM_LOG_KEY_TO_CATEGORY.get(key):
        return result
    for prefix, category in UNIFI_KEY_TO_CATEGORY.items():
        if key.startswith(prefix):
            return category
    return SYSTEM_LOG_CATEGORY_FALLBACK.get(v2_category_enum, "")
