"""Config flow for UniFi Alerts."""

from __future__ import annotations

import logging
import secrets
from collections.abc import Mapping
from dataclasses import dataclass
from typing import TYPE_CHECKING, Any, Final, cast

import voluptuous as vol
from homeassistant.components.webhook import async_generate_url

if TYPE_CHECKING:
    from homeassistant.helpers.service_info import ssdp
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)
from yarl import URL

from .const import (
    ALL_CATEGORIES,
    CONF_API_KEY,
    CONF_CLEAR_TIMEOUT,
    CONF_CONTROLLER_URL,
    CONF_DEVICE_SERIAL,
    CONF_ENABLED_CATEGORIES,
    CONF_MIN_SEVERITY,
    CONF_POLL_INTERVAL,
    CONF_REGENERATE_WEBHOOK_SECRET,
    CONF_SITE,
    CONF_VERIFY_SSL,
    CONF_WEBHOOK_ID_SUFFIX,
    CONF_WEBHOOK_SECRET,
    DEFAULT_CLEAR_TIMEOUT,
    DEFAULT_POLL_INTERVAL,
    DEFAULT_SITE,
    DEFAULT_VERIFY_SSL,
    DOMAIN,
    ISSUE_ID_APIKEY_MIGRATION,
    ISSUE_ID_AUTH_FAILED,
    ISSUE_ID_WEBHOOK_SECRET_ROTATED,
    webhook_id_for_category,
)
from .models import UniFiClientConfig
from .severity import (
    MIN_SEVERITY_NO_FILTER,
    SEVERITY_HIGH,
    SEVERITY_LOW,
    SEVERITY_MEDIUM,
    SEVERITY_VERY_HIGH,
)
from .unifi_auth import CannotConnectError, InvalidAuthError, SslCertificateError
from .unifi_client import InvalidSiteError, UniFiClient

_LOGGER = logging.getLogger(__name__)

# Minimum_Severity_Setting selector, shared by the Config_Flow and
# Options_Flow categories steps.
# hassfest requires translation keys to be lowercase slugs, so the widget
# offers lowercase option values with a `selector.min_severity.options`
# translation-key section (strings.json / translations/en.json) for the
# display text, while the stored config value stays the upper-case
# Severity_Level constant (e.g. "LOW") that the rest of the integration
# compares against. `_MIN_SEVERITY_TO_WIDGET`/`_WIDGET_TO_MIN_SEVERITY`
# convert between the two at the Config_Flow/Options_Flow boundary; nothing
# outside this module ever sees the widget-only lowercase form.
_MIN_SEVERITY_TO_WIDGET: Final[dict[str, str]] = {
    MIN_SEVERITY_NO_FILTER: MIN_SEVERITY_NO_FILTER,
    SEVERITY_LOW: "low",
    SEVERITY_MEDIUM: "medium",
    SEVERITY_HIGH: "high",
    SEVERITY_VERY_HIGH: "very_high",
}
_WIDGET_TO_MIN_SEVERITY: Final[dict[str, str]] = {
    widget: stored for stored, widget in _MIN_SEVERITY_TO_WIDGET.items()
}
_min_severity_selector = SelectSelector(
    SelectSelectorConfig(
        options=list(_MIN_SEVERITY_TO_WIDGET.values()),
        translation_key="min_severity",
        mode=SelectSelectorMode.DROPDOWN,
    )
)


def _create_auth_failed_issue(hass: Any, entry: Any) -> None:
    """Create a repair issue in the HA issue registry when credentials fail post-setup."""
    ir.async_create_issue(
        hass,
        DOMAIN,
        f"{ISSUE_ID_AUTH_FAILED}_{entry.entry_id}",
        is_fixable=True,
        severity=ir.IssueSeverity.ERROR,
        translation_key=ISSUE_ID_AUTH_FAILED,
        translation_placeholders={"name": entry.title},
    )


def _create_apikey_migration_issue(hass: Any, entry: Any) -> None:
    """Create a repair issue explaining that reauth is an API-key migration.

    Raised when a username/password entry has been migrated to the version-4
    API-key-only schema (see __init__._migrate_v3_to_v4). Distinct from the
    generic auth-failed issue so the repair card explains the upgrade instead
    of reading like a credential failure.
    """
    ir.async_create_issue(
        hass,
        DOMAIN,
        f"{ISSUE_ID_APIKEY_MIGRATION}_{entry.entry_id}",
        is_fixable=True,
        severity=ir.IssueSeverity.ERROR,
        translation_key=ISSUE_ID_APIKEY_MIGRATION,
        translation_placeholders={"name": entry.title},
    )


def _entry_needs_apikey_migration(entry: Any) -> bool:
    """Return True when an entry is in reauth because of the API-key migration.

    After __init__._migrate_v3_to_v4 strips username/password from a userpass
    entry, it has no API key stored. A genuine credential failure, by contrast,
    still has its api_key in entry.data. The absence of an API key therefore
    distinguishes a migration-driven reauth from an ordinary one.
    """
    return not entry.data.get(CONF_API_KEY)


def _find_entry_by_serial(hass: Any, serial: str) -> ConfigEntry | None:
    """Return the config entry whose stored device serial matches `serial`, or None.

    `unique_id` is keyed on the controller URL (see `async_step_user`), which
    changes if the controller's IP address changes. The UPnP serial number
    carried in SSDP discovery payloads does not, so it is how
    `async_step_ssdp` finds a previously configured entry to refresh when a
    known console reappears at a new address (#343).
    """
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.data.get(CONF_DEVICE_SERIAL) == serial:
            return cast(ConfigEntry, entry)
    return None


class UniFiAlertsConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup flow shown in Settings → Integrations."""

    VERSION = 4

    def __init__(self) -> None:
        self._controller_url: str = ""
        self._credentials: dict[str, Any] = {}
        self._entry_data: dict[str, Any] = {}
        # Set by async_step_ssdp when the discovery payload carries a UPnP
        # serial number; persisted onto the new entry so a future rediscovery
        # at a different address can find and refresh it (#343).
        self._device_serial: str = ""

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Step 1: controller URL + API key."""
        errors: dict[str, str] = {}

        if user_input is not None:
            url = user_input[CONF_CONTROLLER_URL].rstrip("/")
            # Trust model: the controller URL is supplied by the HA administrator
            # (a local-admin role). Loopback (127.x, ::1) and link-local (169.254.x,
            # fe80::) addresses are valid UniFi OS console locations (e.g. UDM running
            # on the same host as HA, or direct-connect adapters), so we do not
            # reject them. Scheme validation is the appropriate boundary here.
            if URL(url).scheme not in ("http", "https"):
                errors[CONF_CONTROLLER_URL] = "invalid_url_scheme"
            else:
                await self.async_set_unique_id(url)
                self._abort_if_unique_id_configured()
                session = async_get_clientsession(
                    self.hass,
                    verify_ssl=user_input.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
                )
                client = UniFiClient(session, url, cast(UniFiClientConfig, user_input))
                try:
                    await client.authenticate()
                    await client.fetch_alarms()  # validate alarm endpoint reachable
                except InvalidAuthError:
                    errors["base"] = "invalid_auth"
                except SslCertificateError:
                    errors[CONF_CONTROLLER_URL] = "invalid_ssl_cert"
                except CannotConnectError as err:
                    _LOGGER.error("Cannot reach alarm endpoint: %s", err)
                    errors["base"] = "cannot_connect"
                else:
                    self._controller_url = url
                    # CONF_WEBHOOK_ID_SUFFIX is generated per-entry so two
                    # config entries can never collide on a webhook ID.
                    # 8 hex chars = 32 bits of entropy, plenty to avoid
                    # accidental collisions inside a single HA install.
                    self._credentials = {
                        **user_input,
                        CONF_WEBHOOK_SECRET: secrets.token_urlsafe(32),
                        CONF_WEBHOOK_ID_SUFFIX: secrets.token_hex(4),
                    }
                    if self._device_serial:
                        # Carried over from async_step_ssdp so a future
                        # rediscovery at a different address can find this
                        # entry again (#343).
                        self._credentials[CONF_DEVICE_SERIAL] = self._device_serial
                    return await self.async_step_categories()

        _api_key_selector = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))
        # Use a pre-filled URL when arriving via SSDP discovery or re-showing the
        # form after a validation error; fall back to the example placeholder.
        # The API key field deliberately omits `default=` so HA does not pre-fill
        # the secret — the user must re-enter it.
        _url_default = (
            user_input[CONF_CONTROLLER_URL]
            if user_input is not None
            else (self._controller_url or "https://192.168.1.1")
        )
        _verify_ssl_default = (
            user_input.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
            if user_input is not None
            else DEFAULT_VERIFY_SSL
        )
        schema = vol.Schema(
            {
                vol.Required(CONF_CONTROLLER_URL, default=_url_default): str,
                vol.Required(CONF_API_KEY): _api_key_selector,
                vol.Optional(CONF_VERIFY_SSL, default=_verify_ssl_default): bool,
            }
        )
        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors=errors,
            description_placeholders={"docs_url": "https://github.com/PHeonix25/unifi_alerts"},
        )

    async def async_step_ssdp(self, discovery_info: ssdp.SsdpServiceInfo) -> ConfigFlowResult:
        """Handle a UniFi OS console discovered via SSDP on the local network.

        Extracts the controller IP from the SSDP location URL, pre-fills the
        controller URL field with https://{host}, and deduplicates against
        existing entries. The user still needs to enter credentials.
        """
        from urllib.parse import urlparse

        from homeassistant.helpers.service_info import ssdp as ssdp_info

        parsed = urlparse(discovery_info.ssdp_location or "")
        host = parsed.hostname or ""
        if not host:
            return self.async_abort(reason="cannot_connect")

        self._controller_url = f"https://{host}"
        await self.async_set_unique_id(self._controller_url)
        self._abort_if_unique_id_configured()

        # The unique_id check above only catches rediscovery at an unchanged
        # address, since unique_id is keyed on the controller URL (see
        # async_step_user). If the controller's IP changed (DHCP lease
        # change, console swap), the discovered UPnP serial number - stable
        # across IP changes, unlike the URL - is used to find the previously
        # configured entry and refresh its controller URL and unique_id in
        # place, instead of leaving it pinned to the stale address until a
        # human edits it manually (#343).
        serial = discovery_info.upnp.get(ssdp_info.ATTR_UPNP_SERIAL)
        if serial:
            self._device_serial = serial
            existing = _find_entry_by_serial(self.hass, serial)
            if (
                existing is not None
                and existing.data.get(CONF_CONTROLLER_URL) != self._controller_url
            ):
                self.hass.config_entries.async_update_entry(
                    existing,
                    data={
                        **existing.data,
                        CONF_CONTROLLER_URL: self._controller_url,
                        CONF_DEVICE_SERIAL: serial,
                    },
                    unique_id=self._controller_url,
                )
                return self.async_abort(reason="already_configured")

        self.context["title_placeholders"] = {"name": host}
        return await self.async_step_user()

    async def async_step_categories(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Step 2: choose which alert categories to enable."""
        errors: dict[str, str] = {}

        if user_input is not None:
            enabled = [cat for cat in ALL_CATEGORIES if user_input.get(f"cat_{cat}", False)]
            min_severity = {
                cat: _WIDGET_TO_MIN_SEVERITY.get(
                    user_input.get(f"min_severity_{cat}", MIN_SEVERITY_NO_FILTER),
                    MIN_SEVERITY_NO_FILTER,
                )
                for cat in ALL_CATEGORIES
            }
            if not enabled:
                errors["base"] = "at_least_one_category"
            else:
                site = user_input.get(CONF_SITE, DEFAULT_SITE)
                if site != DEFAULT_SITE:
                    verify_ssl = self._credentials.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
                    session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
                    client = UniFiClient(
                        session, self._controller_url, cast(UniFiClientConfig, self._credentials)
                    )
                    try:
                        await client.authenticate()
                        await client.fetch_alarms(site)
                    except InvalidSiteError:
                        errors[CONF_SITE] = "invalid_site"
                    except (InvalidAuthError, CannotConnectError) as err:
                        _LOGGER.error("Cannot validate site %r during setup: %s", site, err)
                        errors["base"] = "cannot_connect"
                if not errors:
                    self._entry_data = {
                        **self._credentials,
                        CONF_ENABLED_CATEGORIES: enabled,
                        CONF_POLL_INTERVAL: user_input.get(
                            CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL
                        ),
                        CONF_CLEAR_TIMEOUT: user_input.get(
                            CONF_CLEAR_TIMEOUT, DEFAULT_CLEAR_TIMEOUT
                        ),
                        CONF_SITE: site,
                        CONF_MIN_SEVERITY: min_severity,
                    }
                    return await self.async_step_finish()

        # Build a schema with one boolean per category
        fields: dict[Any, Any] = {}
        # Default noisy client/device categories to OFF; exceptional events ON
        _chatty = {"network_device", "network_client"}
        for cat in ALL_CATEGORIES:
            fields[vol.Optional(f"cat_{cat}", default=(cat not in _chatty))] = bool
            fields[vol.Optional(f"min_severity_{cat}", default=MIN_SEVERITY_NO_FILTER)] = (
                _min_severity_selector
            )

        fields[vol.Optional(CONF_POLL_INTERVAL, default=DEFAULT_POLL_INTERVAL)] = vol.All(
            int, vol.Range(min=10, max=3600)
        )
        fields[vol.Optional(CONF_CLEAR_TIMEOUT, default=DEFAULT_CLEAR_TIMEOUT)] = vol.All(
            int, vol.Range(min=1, max=1440)
        )
        fields[vol.Optional(CONF_SITE, default=DEFAULT_SITE)] = str

        schema = vol.Schema(fields)
        return self.async_show_form(
            step_id="categories",
            data_schema=schema,
            errors=errors,
        )

    async def async_step_finish(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Step 3: display webhook URLs, then create the entry on submit."""
        if user_input is not None:
            return self.async_create_entry(
                title=f"UniFi Alerts ({self._controller_url})",
                data=self._entry_data,
            )

        enabled: list[str] = self._entry_data.get(CONF_ENABLED_CATEGORIES, ALL_CATEGORIES)
        secret: str = self._entry_data.get(CONF_WEBHOOK_SECRET, "")
        suffix: str = self._entry_data.get(CONF_WEBHOOK_ID_SUFFIX, "")
        fields: dict[Any, Any] = {}
        for cat in ALL_CATEGORIES:
            if cat in enabled:
                url = async_generate_url(self.hass, webhook_id_for_category(cat, suffix))
                fields[vol.Optional(f"webhook_url_{cat}", default=url)] = str
        return self.async_show_form(
            step_id="finish",
            data_schema=vol.Schema(fields),
            description_placeholders={"webhook_secret": secret},
        )

    # ── Reauth flow ───────────────────────────────────────────────────────

    async def async_step_reauth(self, entry_data: dict[str, Any]) -> ConfigFlowResult:
        """Entry point called by HA when ConfigEntryAuthFailed is raised.

        Creates a repair issue so users see a repair card even if the standard
        reauth notification is missed. An entry that has just been migrated to
        the API-key-only schema (no api_key stored) gets a dedicated
        migration-explanation issue instead of the generic auth-failed one.
        """
        self._reauth_entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        # Surface a repair card in addition to the standard reauth prompt
        if self._reauth_entry is not None:
            if _entry_needs_apikey_migration(self._reauth_entry):
                _create_apikey_migration_issue(self.hass, self._reauth_entry)
            else:
                _create_auth_failed_issue(self.hass, self._reauth_entry)
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Show credential form and validate new credentials on submit."""
        errors: dict[str, str] = {}

        if user_input is not None and self._reauth_entry is not None:
            entry = self._reauth_entry
            url: str = entry.data.get(CONF_CONTROLLER_URL, "")
            session = async_get_clientsession(
                self.hass,
                verify_ssl=entry.data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL),
            )
            client = UniFiClient(session, url, cast(UniFiClientConfig, user_input))
            try:
                await client.authenticate()
            except InvalidAuthError:
                errors["base"] = "invalid_auth"
            except SslCertificateError:
                errors["base"] = "invalid_ssl_cert"
            except CannotConnectError as err:
                _LOGGER.error("Cannot reach controller during reauth: %s", err)
                errors["base"] = "cannot_connect"
            else:
                # Merge the new API key into the entry. Any legacy
                # username/password were already dropped by the version-4
                # migration; the entry is updated in place so entry_id,
                # unique_id, webhook suffix, and webhook secret are preserved.
                new_data = {
                    **entry.data,
                    **user_input,
                }
                self.hass.config_entries.async_update_entry(entry, data=new_data)
                # Clear both possible repair issues now that auth is restored.
                # Deleting a non-existent issue is a no-op, so it is safe to
                # clear both the generic auth-failed and the migration issue
                # without first working out which one was raised.
                for issue_base in (ISSUE_ID_AUTH_FAILED, ISSUE_ID_APIKEY_MIGRATION):
                    ir.async_delete_issue(self.hass, DOMAIN, f"{issue_base}_{entry.entry_id}")
                await self.hass.config_entries.async_reload(entry.entry_id)
                return self.async_abort(reason="reauth_successful")

        # API-key-only form: username/password auth is being removed (#277), so
        # reauth restores the connection with a single API key.
        _api_key_selector = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))
        schema = vol.Schema(
            {
                vol.Required(CONF_API_KEY): _api_key_selector,
            }
        )
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=schema,
            errors=errors,
        )

    # ── Reconfigure flow ─────────────────────────────────────────────────

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Entry point for HA's dedicated "Reconfigure" UI affordance.

        Distinct from the options flow's "Configure" gear icon (which also
        covers alert categories, polling, and webhook secret rotation), this
        is what the Gold-tier `reconfiguration-flow` quality-scale rule
        checks for. Lets the user update the controller URL, API key, and/or
        verify_ssl for an existing entry without deleting and re-adding it.
        Reuses the same credential-validation helpers as
        `UniFiAlertsOptionsFlow`'s credentials step
        (`_parse_credentials_form_input`, `_build_credentials_test_data`,
        `_async_validate_controller_credentials`) so the two flows apply
        identical validation instead of diverging.
        """
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}

        if user_input is not None:
            parsed = _parse_credentials_form_input(user_input, entry.data)

            if (
                not parsed.credentials_changed
                and not parsed.regenerate_secret
                and not parsed.verify_ssl_changed
            ):
                # Nothing changed - nothing to persist or reload.
                return self.async_abort(reason="reconfigure_successful")

            if not parsed.credentials_changed:
                # verify_ssl flip only - no controller round-trip needed.
                new_data = _build_verify_ssl_and_secret_only_pending(entry.data, parsed)
                return self.async_update_reload_and_abort(
                    entry, data=new_data, reason="reconfigure_successful"
                )

            effective_url = (
                parsed.new_url_raw.rstrip("/")
                if parsed.new_url_raw
                else entry.data[CONF_CONTROLLER_URL]
            )

            if not _is_valid_url_scheme(effective_url):
                errors[CONF_CONTROLLER_URL] = "invalid_url_scheme"
            else:
                test_data = _build_credentials_test_data(entry.data, effective_url, parsed)
                try:
                    await _async_validate_controller_credentials(
                        self.hass, effective_url, parsed.new_verify_ssl, test_data
                    )
                except InvalidAuthError:
                    errors["base"] = "invalid_auth"
                except SslCertificateError:
                    errors["base"] = "invalid_ssl_cert"
                except CannotConnectError as err:
                    _LOGGER.error("Cannot reach controller during reconfigure: %s", err)
                    errors["base"] = "cannot_connect"
                else:
                    url_changed = effective_url != entry.data[CONF_CONTROLLER_URL]
                    if url_changed and _find_duplicate_entry(
                        self.hass, entry.entry_id, effective_url
                    ):
                        return self.async_abort(reason="already_configured")

                    new_data = _build_credentials_pending_data(entry.data, effective_url, parsed)
                    update_kwargs: dict[str, Any] = {
                        "data": new_data,
                        "reason": "reconfigure_successful",
                    }
                    if url_changed:
                        update_kwargs["unique_id"] = effective_url
                    return self.async_update_reload_and_abort(entry, **update_kwargs)

        _api_key_selector = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))
        current_url: str = entry.data.get(CONF_CONTROLLER_URL, "")
        current_verify_ssl = entry.data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)

        schema = vol.Schema(
            {
                vol.Optional(CONF_CONTROLLER_URL): str,
                vol.Optional(CONF_API_KEY): _api_key_selector,
                vol.Optional(CONF_VERIFY_SSL, default=current_verify_ssl): bool,
            }
        )
        return self.async_show_form(
            step_id="reconfigure",
            data_schema=schema,
            errors=errors,
            description_placeholders={"current_url": current_url},
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return UniFiAlertsOptionsFlow(config_entry)


@dataclass
class _CredentialsFormInput:
    """Normalized values parsed from an options-flow credentials form submission."""

    new_url_raw: str
    new_api_key: str
    regenerate_secret: bool
    new_verify_ssl: bool
    verify_ssl_changed: bool
    credentials_changed: bool


def _parse_credentials_form_input(
    user_input: dict[str, Any], current_data: Mapping[str, Any]
) -> _CredentialsFormInput:
    """Normalize the raw options-flow credentials submission.

    Pure function: no I/O, no flow state. Isolated so the change-detection
    logic (credentials_changed / verify_ssl_changed) can be unit tested
    without driving the full flow step.
    """
    new_url_raw = (user_input.get(CONF_CONTROLLER_URL) or "").strip()
    new_api_key = (user_input.get(CONF_API_KEY) or "").strip()
    regenerate_secret = bool(user_input.get(CONF_REGENERATE_WEBHOOK_SECRET, False))
    current_verify_ssl = current_data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
    # verify_ssl always comes through as a bool (voluptuous default)
    new_verify_ssl = user_input.get(CONF_VERIFY_SSL, current_verify_ssl)
    verify_ssl_changed = new_verify_ssl != current_verify_ssl
    credentials_changed = bool(new_url_raw or new_api_key)
    return _CredentialsFormInput(
        new_url_raw=new_url_raw,
        new_api_key=new_api_key,
        regenerate_secret=regenerate_secret,
        new_verify_ssl=new_verify_ssl,
        verify_ssl_changed=verify_ssl_changed,
        credentials_changed=credentials_changed,
    )


def _is_valid_url_scheme(url: str) -> bool:
    """Return True if `url` uses the http/https scheme.

    Same trust model as `UniFiAlertsConfigFlow.async_step_user`: scheme-only
    validation, loopback/link-local hosts are accepted (see the comment
    there). `async_step_user` has equivalent inline logic that is left
    untouched here — issue #238 scopes this refactor to the options flow
    only, and unifying the two would touch the initial setup flow as well.
    """
    return URL(url).scheme in ("http", "https")


def _find_duplicate_entry(hass: Any, current_entry_id: str, url: str) -> ConfigEntry | None:
    """Return another config entry already using `url`, or None.

    Pure(ish) helper — only reads `hass.config_entries`, does not mutate
    anything — so duplicate-detection can be unit tested with a bare list of
    mock entries instead of driving the full credentials step.
    """
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.entry_id != current_entry_id and entry.data.get(CONF_CONTROLLER_URL) == url:
            return cast(ConfigEntry, entry)
    return None


def _credential_overrides(parsed: _CredentialsFormInput) -> dict[str, Any]:
    """Return the sparse dict of credential fields the user actually typed.

    Blank fields are omitted so callers can merge this over an existing
    dict without clobbering unrelated stored values.
    """
    overrides: dict[str, Any] = {}
    if parsed.new_api_key:
        overrides[CONF_API_KEY] = parsed.new_api_key
    return overrides


def _build_verify_ssl_and_secret_only_pending(
    current_data: Mapping[str, Any], parsed: _CredentialsFormInput
) -> dict[str, Any]:
    """Build the staged entry.data for a verify_ssl flip and/or secret rotation
    with no credential changes — no controller round-trip needed."""
    pending = dict(current_data)
    if parsed.verify_ssl_changed:
        pending[CONF_VERIFY_SSL] = parsed.new_verify_ssl
    if parsed.regenerate_secret:
        # WHY: Rotation replaces the `?token=...` bearer but reuses
        # the webhook ID suffix. An attacker with the old token
        # still hits a live endpoint; the token check rejects them.
        # URL-path revocation requires deleting and re-adding the
        # entry. See SECURITY.md § "Webhook secret rotation".
        pending[CONF_WEBHOOK_SECRET] = secrets.token_urlsafe(32)
    return pending


def _build_credentials_test_data(
    current_data: Mapping[str, Any], effective_url: str, parsed: _CredentialsFormInput
) -> dict[str, Any]:
    """Build the merged credential dict used to validate new credentials
    against the controller (not yet persisted)."""
    return {
        **current_data,
        CONF_CONTROLLER_URL: effective_url,
        CONF_VERIFY_SSL: parsed.new_verify_ssl,
        **_credential_overrides(parsed),
    }


def _build_credentials_pending_data(
    current_data: Mapping[str, Any],
    effective_url: str,
    parsed: _CredentialsFormInput,
) -> dict[str, Any]:
    """Build the staged entry.data after new credentials validate successfully."""
    pending = {
        **current_data,
        CONF_CONTROLLER_URL: effective_url,
        CONF_VERIFY_SSL: parsed.new_verify_ssl,
        **_credential_overrides(parsed),
    }
    if parsed.regenerate_secret:
        pending[CONF_WEBHOOK_SECRET] = secrets.token_urlsafe(32)
    return pending


async def _async_validate_controller_credentials(
    hass: Any, url: str, verify_ssl: bool, test_data: dict[str, Any]
) -> None:
    """Instantiate a UniFiClient and validate it can authenticate and reach
    the alarm endpoint.

    `InvalidAuthError`, `SslCertificateError`, and `CannotConnectError`
    propagate unchanged so the caller classifies them into its `errors` dict —
    this function does not know about the options-flow error-key mapping.
    """
    session = async_get_clientsession(hass, verify_ssl=verify_ssl)
    client = UniFiClient(session, url, cast(UniFiClientConfig, test_data))
    await client.authenticate()
    await client.fetch_alarms()


class UniFiAlertsOptionsFlow(OptionsFlow):
    """Handle re-configuration (Settings → Integrations → Configure)."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        self._config_entry = config_entry
        self._pending_options: dict[str, Any] = {}
        # Staged updates to `entry.data` (credentials, verify_ssl, rotated webhook
        # secret). Held until the user submits the finish step, then persisted
        # atomically so abandoning the flow mid-way leaves nothing behind.
        self._pending_data: dict[str, Any] = {}

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Router: always start with the credentials step."""
        return await self.async_step_credentials()

    async def async_step_credentials(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Optional step: update controller URL and/or credentials.

        All fields are optional.  If the user leaves every field blank the step
        is skipped and the flow continues straight to the categories step.  If
        any credential field is filled in, the new values are validated against
        the controller before being saved.
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            parsed = _parse_credentials_form_input(user_input, self._config_entry.data)

            if (
                not parsed.credentials_changed
                and not parsed.regenerate_secret
                and not parsed.verify_ssl_changed
            ):
                # Nothing changed — skip straight to categories
                return await self.async_step_categories()

            if not parsed.credentials_changed:
                # Verify-SSL flip and/or secret rotation only — no credentials to
                # validate against the controller. Stage the change; the finish
                # step will persist atomically when the user submits.
                self._pending_data = _build_verify_ssl_and_secret_only_pending(
                    self._config_entry.data, parsed
                )
                return await self.async_step_categories()

            # Determine the effective values to test
            effective_url = (
                parsed.new_url_raw.rstrip("/")
                if parsed.new_url_raw
                else self._config_entry.data[CONF_CONTROLLER_URL]
            )

            if not _is_valid_url_scheme(effective_url):
                errors[CONF_CONTROLLER_URL] = "invalid_url_scheme"
            else:
                test_data = _build_credentials_test_data(
                    self._config_entry.data, effective_url, parsed
                )
                try:
                    await _async_validate_controller_credentials(
                        self.hass, effective_url, parsed.new_verify_ssl, test_data
                    )
                except InvalidAuthError:
                    errors["base"] = "invalid_auth"
                except SslCertificateError:
                    errors["base"] = "invalid_ssl_cert"
                except CannotConnectError as err:
                    _LOGGER.error("Cannot reach controller during options update: %s", err)
                    errors["base"] = "cannot_connect"
                else:
                    # Check whether the new URL would collide with another entry
                    url_changed = effective_url != self._config_entry.data[CONF_CONTROLLER_URL]
                    if url_changed and _find_duplicate_entry(
                        self.hass, self._config_entry.entry_id, effective_url
                    ):
                        return self.async_abort(reason="already_configured")

                    # Stage the updated entry.data — actual persistence happens
                    # in the finish step, so abandoning the flow leaves nothing
                    # behind. async_update_entry is intentionally NOT called here.
                    self._pending_data = _build_credentials_pending_data(
                        self._config_entry.data, effective_url, parsed
                    )
                    return await self.async_step_categories()

        # Build the credentials form — all fields optional with current values as hints
        _api_key_selector = TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))
        current_url: str = self._config_entry.data.get(CONF_CONTROLLER_URL, "")
        current_verify_ssl = self._config_entry.data.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)

        schema = vol.Schema(
            {
                vol.Optional(CONF_CONTROLLER_URL): str,
                vol.Optional(CONF_API_KEY): _api_key_selector,
                vol.Optional(CONF_VERIFY_SSL, default=current_verify_ssl): bool,
                vol.Optional(CONF_REGENERATE_WEBHOOK_SECRET, default=False): bool,
            }
        )
        return self.async_show_form(
            step_id="credentials",
            data_schema=schema,
            errors=errors,
            description_placeholders={"current_url": current_url},
        )

    async def async_step_categories(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Update alert categories, poll interval, clear timeout, and site."""
        errors: dict[str, str] = {}

        if user_input is not None:
            enabled = [cat for cat in ALL_CATEGORIES if user_input.get(f"cat_{cat}", False)]
            min_severity = {
                cat: _WIDGET_TO_MIN_SEVERITY.get(
                    user_input.get(f"min_severity_{cat}", MIN_SEVERITY_NO_FILTER),
                    MIN_SEVERITY_NO_FILTER,
                )
                for cat in ALL_CATEGORIES
            }
            if not enabled:
                errors["base"] = "at_least_one_category"
            else:
                site = user_input.get(CONF_SITE, DEFAULT_SITE)
                if site != DEFAULT_SITE:
                    creds = self._pending_data or dict(self._config_entry.data)
                    controller_url = creds.get(CONF_CONTROLLER_URL, "")
                    verify_ssl = creds.get(CONF_VERIFY_SSL, DEFAULT_VERIFY_SSL)
                    session = async_get_clientsession(self.hass, verify_ssl=verify_ssl)
                    client = UniFiClient(session, controller_url, cast(UniFiClientConfig, creds))
                    try:
                        await client.authenticate()
                        await client.fetch_alarms(site)
                    except InvalidSiteError:
                        errors[CONF_SITE] = "invalid_site"
                    except (InvalidAuthError, CannotConnectError) as err:
                        _LOGGER.error(
                            "Cannot validate site %r during options update: %s", site, err
                        )
                        errors["base"] = "cannot_connect"
                if not errors:
                    self._pending_options = {
                        CONF_ENABLED_CATEGORIES: enabled,
                        CONF_POLL_INTERVAL: user_input.get(
                            CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL
                        ),
                        CONF_CLEAR_TIMEOUT: user_input.get(
                            CONF_CLEAR_TIMEOUT, DEFAULT_CLEAR_TIMEOUT
                        ),
                        CONF_SITE: site,
                        CONF_MIN_SEVERITY: min_severity,
                    }
                    return await self.async_step_finish()

        current_enabled: list[str] = self._config_entry.options.get(
            CONF_ENABLED_CATEGORIES,
            self._config_entry.data.get(CONF_ENABLED_CATEGORIES, ALL_CATEGORIES),
        )
        current_poll: int = self._config_entry.options.get(
            CONF_POLL_INTERVAL,
            self._config_entry.data.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL),
        )
        current_clear: int = self._config_entry.options.get(
            CONF_CLEAR_TIMEOUT,
            self._config_entry.data.get(CONF_CLEAR_TIMEOUT, DEFAULT_CLEAR_TIMEOUT),
        )
        current_site: str = self._config_entry.options.get(
            CONF_SITE,
            self._config_entry.data.get(CONF_SITE, DEFAULT_SITE),
        )
        current_min_severity: dict[str, str] = self._config_entry.options.get(
            CONF_MIN_SEVERITY,
            self._config_entry.data.get(CONF_MIN_SEVERITY, {}),
        )

        fields: dict[Any, Any] = {}
        for cat in ALL_CATEGORIES:
            fields[vol.Optional(f"cat_{cat}", default=(cat in current_enabled))] = bool
            fields[
                vol.Optional(
                    f"min_severity_{cat}",
                    default=_MIN_SEVERITY_TO_WIDGET.get(
                        current_min_severity.get(cat, MIN_SEVERITY_NO_FILTER),
                        MIN_SEVERITY_NO_FILTER,
                    ),
                )
            ] = _min_severity_selector
        fields[vol.Optional(CONF_POLL_INTERVAL, default=current_poll)] = vol.All(
            int, vol.Range(min=10, max=3600)
        )
        fields[vol.Optional(CONF_CLEAR_TIMEOUT, default=current_clear)] = vol.All(
            int, vol.Range(min=1, max=1440)
        )
        fields[vol.Optional(CONF_SITE, default=current_site)] = str

        return self.async_show_form(
            step_id="categories",
            data_schema=vol.Schema(fields),
            errors=errors,
        )

    async def async_step_finish(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Display webhook URLs, then save options on submit."""
        if user_input is not None:
            # Persist any staged entry.data updates atomically before writing
            # the options entry. If the user abandoned the flow before reaching
            # this step, _pending_data is empty and entry.data is untouched.
            if self._pending_data:
                old_secret = self._config_entry.data.get(CONF_WEBHOOK_SECRET, "")
                new_secret = self._pending_data.get(CONF_WEBHOOK_SECRET, old_secret)
                if new_secret != old_secret:
                    # Secret was rotated — every URL pasted into Alarm Manager is
                    # now invalid. Create a repair issue that clears automatically
                    # when the first authenticated webhook arrives after the update.
                    ir.async_create_issue(
                        self.hass,
                        DOMAIN,
                        f"{ISSUE_ID_WEBHOOK_SECRET_ROTATED}_{self._config_entry.entry_id}",
                        is_fixable=False,
                        severity=ir.IssueSeverity.WARNING,
                        translation_key=ISSUE_ID_WEBHOOK_SECRET_ROTATED,
                        translation_placeholders={"name": self._config_entry.title},
                    )
                # unique_id tracks the controller URL from initial setup (see
                # async_step_user). If the URL changed here, the entry's unique_id
                # must follow it — otherwise it stays pinned to the old URL forever,
                # which breaks both future duplicate-prevention (a fresh entry for
                # the old URL would wrongly abort as already_configured) and SSDP
                # discovery matching (keyed on unique_id) for the new controller.
                # _build_verify_ssl_and_secret_only_pending leaves
                # CONF_CONTROLLER_URL unchanged, so this only fires on an actual
                # URL change (issue #276). Passing unique_id=None here (unchanged
                # case) would be interpreted by HA as "clear the unique_id", so
                # the kwarg is omitted entirely rather than passed as None.
                update_kwargs: dict[str, Any] = {"data": self._pending_data}
                new_url = self._pending_data.get(CONF_CONTROLLER_URL)
                if new_url and new_url != self._config_entry.data.get(CONF_CONTROLLER_URL):
                    update_kwargs["unique_id"] = new_url
                self.hass.config_entries.async_update_entry(self._config_entry, **update_kwargs)
            return self.async_create_entry(title="", data=self._pending_options)

        enabled: list[str] = self._pending_options.get(CONF_ENABLED_CATEGORIES, ALL_CATEGORIES)
        # Display URLs using the staged secret (if rotation is queued) so the
        # finish step shows what the entry WILL contain after submission.
        secret: str = self._pending_data.get(
            CONF_WEBHOOK_SECRET,
            self._config_entry.data.get(CONF_WEBHOOK_SECRET, ""),
        )
        suffix: str = self._config_entry.data.get(CONF_WEBHOOK_ID_SUFFIX, "")
        fields: dict[Any, Any] = {}
        for cat in ALL_CATEGORIES:
            if cat in enabled:
                url = async_generate_url(self.hass, webhook_id_for_category(cat, suffix))
                fields[vol.Optional(f"webhook_url_{cat}", default=url)] = str
        return self.async_show_form(
            step_id="finish",
            data_schema=vol.Schema(fields),
            description_placeholders={"webhook_secret": secret},
        )
