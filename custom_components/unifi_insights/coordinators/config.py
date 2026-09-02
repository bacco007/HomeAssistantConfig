"""Config coordinator for UniFi Insights - handles slow-changing configuration data."""

from __future__ import annotations

from datetime import UTC, datetime
from http import HTTPStatus
import logging
from typing import TYPE_CHECKING, Any

from custom_components.unifi_insights.api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiNotFoundError,
    UniFiResponseError,
    UniFiTimeoutError,
)
from custom_components.unifi_insights.const import SCAN_INTERVAL_CONFIG

from .base import UnifiBaseCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

    from custom_components.unifi_insights.api.network import UniFiNetworkClient
    from custom_components.unifi_insights.api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class UnifiConfigCoordinator(UnifiBaseCoordinator):
    """
    Coordinator for slow-changing configuration data (5 minute updates).

    Handles:
    - Sites configuration
    - WiFi networks configuration
    - Firewall policy configuration
    - Policy-based routes (traffic routes) configuration
    - Network info
    """

    def __init__(
        self,
        hass: HomeAssistant,
        network_client: UniFiNetworkClient,
        protect_client: UniFiProtectClient | None,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the config coordinator."""
        super().__init__(
            hass=hass,
            network_client=network_client,
            protect_client=protect_client,
            entry=entry,
            name="config",
            update_interval=SCAN_INTERVAL_CONFIG,
        )
        self.data: dict[str, Any] = {
            "sites": {},
            "wifi": {},
            "firewall_rules": {},
            "policy_based_routes": {},
            "vpn_clients": {},
            "network_info": {},
        }

    @staticmethod
    def _map_legacy_site_names(
        integration_sites: dict[str, dict[str, Any]],
        legacy_sites: list[dict[str, Any]],
    ) -> dict[str, str]:
        """Map integration site IDs to classic ("legacy") site names."""

        def _norm(value: Any) -> str | None:
            if not isinstance(value, str):
                return None
            stripped = value.strip().lower()
            return stripped or None

        legacy: list[tuple[str, set[str]]] = []
        for site in legacy_sites:
            name = site.get("name")
            if not isinstance(name, str) or not name:
                continue
            candidates = {
                c
                for c in (
                    _norm(name),
                    _norm(site.get("desc")),
                    _norm(site.get("description")),
                )
                if c is not None
            }
            legacy.append((name, candidates))

        mappings: dict[str, str] = {}
        for site_id, site_data in integration_sites.items():
            candidates = {
                c
                for c in (
                    _norm(site_id),
                    _norm(site_data.get("name")),
                    _norm(site_data.get("description")),
                    _norm(site_data.get("desc")),
                )
                if c is not None
            }
            for legacy_name, legacy_candidates in legacy:
                if candidates & legacy_candidates:
                    mappings[site_id] = legacy_name
                    break
            if site_id not in mappings and len(legacy) == 1:
                mappings[site_id] = legacy[0][0]
        return mappings

    @staticmethod
    def _wifi_qr_payload(
        ssid: str,
        passphrase: str | None,
        security: str | None,
        *,
        hidden: bool,
    ) -> str:
        """
        Build a standard ``WIFI:`` QR payload string.

        Follows the de-facto WiFi network config QR format consumed by phone
        cameras: ``WIFI:T:<auth>;S:<ssid>;P:<password>;H:<hidden>;;``.
        """

        def _escape(value: str) -> str:
            for char in ("\\", ";", ",", ":", '"'):
                value = value.replace(char, f"\\{char}")
            return value

        security_lower = (security or "").lower()
        if not passphrase or security_lower in ("", "open", "none"):
            auth = "nopass"
        elif "wep" in security_lower:
            auth = "WEP"
        else:
            auth = "WPA"

        parts = [f"T:{auth}", f"S:{_escape(ssid)}"]
        if auth != "nopass" and passphrase:
            parts.append(f"P:{_escape(passphrase)}")
        if hidden:
            parts.append("H:true")
        return "WIFI:" + ";".join(parts) + ";;"

    @staticmethod
    def _enrich_wifi(
        wifi_dict: dict[str, dict[str, Any]],
        legacy_configs: list[dict[str, Any]],
        active_clients: list[dict[str, Any]],
    ) -> None:
        """
        Add secrets, per-SSID client counts, and QR payloads to WiFi data.

        Secrets come from the classic ``/rest/wlanconf`` data (the official API
        redacts them); per-SSID counts are derived from active clients' essid.
        """
        configs_by_name = {
            config.get("name"): config
            for config in legacy_configs
            if config.get("name")
        }

        counts: dict[str, int] = {}
        for client in active_clients:
            if client.get("is_wired"):
                continue
            essid = client.get("essid")
            if essid:
                counts[essid] = counts.get(essid, 0) + 1

        for wifi in wifi_dict.values():
            ssid = wifi.get("name") or wifi.get("ssid")
            if not ssid:
                continue

            wifi["num_connected_clients"] = counts.get(ssid, 0)

            config = configs_by_name.get(ssid)
            if config is None:
                continue

            passphrase = config.get("x_passphrase")
            security = config.get("security")
            hidden = bool(config.get("hide_ssid"))
            wifi["ssid"] = ssid
            wifi["passphrase"] = passphrase
            wifi["security"] = security
            wifi["wpa_mode"] = config.get("wpa_mode")
            wifi["hide_ssid"] = hidden
            wifi["is_guest"] = config.get("is_guest", wifi.get("isGuest", False))
            wifi["qr_code"] = UnifiConfigCoordinator._wifi_qr_payload(
                ssid, passphrase, security, hidden=hidden
            )

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch configuration data from API."""
        try:
            # Get all sites
            _LOGGER.debug("Config coordinator: Fetching sites")
            sites_models = []
            try:
                sites_models = await self.network_client.sites.get_all()
            except (UniFiNotFoundError, UniFiAuthenticationError) as err:
                if self.protect_client is not None:
                    _LOGGER.debug(
                        "Config coordinator: Network API not available on Protect "
                        "console: %s",
                        err,
                    )
                else:
                    raise
            except UniFiResponseError as err:
                # A console with no Network application answers this endpoint
                # with 200 and an HTML body. api/base.py raises for a 2xx
                # non-JSON response rather than returning None, which is right
                # in general, but here it is a permanent property of the
                # hardware rather than a transient fault, and setup validation
                # in __init__.py already tolerates it. Left unhandled, the
                # first refresh raises UpdateFailed, then ConfigEntryNotReady,
                # and the entry never loads. Only a 200 is tolerated, so a
                # redirect or any other sub-400 status still fails.
                # UniFiNotFoundError subclasses UniFiResponseError, so this
                # clause has to stay below the tuple above.
                if self.protect_client is None or err.status_code != HTTPStatus.OK:
                    raise
                _LOGGER.debug(
                    "Config coordinator: sites endpoint returned a non-JSON "
                    "body (status %s) - console has no Network application",
                    err.status_code,
                )

            sites = [self._model_to_dict(s) for s in sites_models]
            self.data["sites"] = {
                site.get("id"): site for site in sites if site.get("id")
            }

            _LOGGER.debug(
                "Config coordinator: Found %d sites",
                len(self.data["sites"]),
            )

            if not self.data["sites"]:
                self.data["wifi"] = {}
                self.data["firewall_rules"] = {}
                self.data["policy_based_routes"] = {}
                self.data["vpn_clients"] = {}
                self.data["network_info"] = {}
                self._available = True
                self.data["last_update"] = datetime.now(tz=UTC)
                return self.data

            # Resolve classic site names so we can enrich WiFi data with secrets
            # and per-SSID client counts that the official API does not expose.
            legacy_site_names: dict[str, str] = {}
            try:
                legacy_sites = await self.network_client.sites.get_legacy_all()
                legacy_site_names = self._map_legacy_site_names(
                    self.data["sites"], legacy_sites
                )
            except Exception as err:
                _LOGGER.debug(
                    "Config coordinator: Unable to fetch legacy site mapping: %s",
                    err,
                )

            # Fetch WiFi networks for each site
            # Note: site_id cannot be None here due to dict comprehension filter above
            for site_id in self.data["sites"]:
                try:
                    _LOGGER.debug(
                        "Config coordinator: Fetching WiFi networks for site %s",
                        site_id,
                    )
                    wifi_models = await self.network_client.wifi.get_all(site_id)
                    wifi_dict = {}
                    for wifi_model in wifi_models:
                        wifi = self._model_to_dict(wifi_model)
                        wifi_id = wifi.get("id")
                        if wifi_id:
                            wifi_dict[wifi_id] = wifi
                    # Enrich with classic data (secrets, per-SSID counts, QR).
                    legacy_name = legacy_site_names.get(site_id)
                    if legacy_name:
                        try:
                            legacy_configs = (
                                await self.network_client.wifi.get_legacy_configs(
                                    legacy_name
                                )
                            )
                            active_clients = (
                                await self.network_client.clients.get_active_legacy(
                                    legacy_name
                                )
                            )
                            self._enrich_wifi(wifi_dict, legacy_configs, active_clients)
                        except Exception as err:
                            _LOGGER.debug(
                                "Config coordinator: Unable to enrich WiFi data "
                                "for site %s: %s",
                                site_id,
                                err,
                            )

                    self.data["wifi"][site_id] = wifi_dict
                    _LOGGER.debug(
                        "Config coordinator: Successfully fetched %d WiFi networks "
                        "for site %s",
                        len(wifi_dict),
                        site_id,
                    )
                except Exception as err:
                    _LOGGER.warning(
                        "Config coordinator: Error fetching WiFi networks "
                        "for site %s: %s",
                        site_id,
                        err,
                    )
                    self.data["wifi"][site_id] = {}

                try:
                    _LOGGER.debug(
                        "Config coordinator: Fetching firewall rules for site %s",
                        site_id,
                    )
                    firewall_models = await self.network_client.firewall.list_rules(
                        site_id
                    )
                    firewall_rules_dict = {}
                    for firewall_model in firewall_models:
                        firewall_rule = self._model_to_dict(firewall_model)
                        firewall_rule_id = firewall_rule.get("id")
                        if firewall_rule_id:
                            firewall_rules_dict[firewall_rule_id] = firewall_rule
                    self.data["firewall_rules"][site_id] = firewall_rules_dict
                    _LOGGER.debug(
                        "Config coordinator: Successfully fetched %d firewall rules "
                        "for site %s",
                        len(firewall_rules_dict),
                        site_id,
                    )
                except Exception as err:
                    _LOGGER.debug(
                        "Config coordinator: Firewall rules unavailable for site %s: "
                        "%s",
                        site_id,
                        err,
                    )
                    self.data["firewall_rules"][site_id] = {}

                # Fetch policy-based routes (traffic routes) via legacy v2 endpoint
                legacy_name = legacy_site_names.get(site_id)
                if legacy_name:
                    try:
                        _LOGGER.debug(
                            "Config coordinator: Fetching policy-based routes "
                            "for site %s (%s)",
                            site_id,
                            legacy_name,
                        )
                        route_models = await self.network_client.routes.list_routes(
                            legacy_name
                        )
                        routes_dict: dict[str, Any] = {}
                        for route_model in route_models:
                            route = self._model_to_dict(route_model)
                            route_id = route.get("id") or route.get("_id")
                            if route_id:
                                routes_dict[route_id] = route
                        self.data["policy_based_routes"][site_id] = routes_dict
                        _LOGGER.debug(
                            "Config coordinator: Successfully fetched %d "
                            "policy-based routes for site %s",
                            len(routes_dict),
                            site_id,
                        )
                    except UniFiAuthenticationError:
                        raise
                    except Exception as err:
                        _LOGGER.debug(
                            "Config coordinator: Policy-based routes unavailable "
                            "for site %s: %s",
                            site_id,
                            err,
                        )
                        self.data["policy_based_routes"][site_id] = {}
                else:
                    self.data["policy_based_routes"][site_id] = {}

                # Fetch VPN clients via classic networkconf endpoint
                if legacy_name:
                    try:
                        _LOGGER.debug(
                            "Config coordinator: Fetching VPN clients for site %s (%s)",
                            site_id,
                            legacy_name,
                        )
                        vpn_client_models = (
                            await self.network_client.vpn_clients.list_vpn_clients(
                                legacy_name
                            )
                        )
                        vpn_clients_dict: dict[str, Any] = {}
                        for vpn_client_model in vpn_client_models:
                            vpn_client = self._model_to_dict(vpn_client_model)
                            vpn_client_id = vpn_client.get("id") or vpn_client.get(
                                "_id"
                            )
                            if vpn_client_id:
                                vpn_clients_dict[vpn_client_id] = vpn_client
                        self.data["vpn_clients"][site_id] = vpn_clients_dict
                        _LOGGER.debug(
                            "Config coordinator: Successfully fetched %d "
                            "VPN clients for site %s",
                            len(vpn_clients_dict),
                            site_id,
                        )
                    except UniFiAuthenticationError:
                        raise
                    except Exception as err:
                        _LOGGER.debug(
                            "Config coordinator: VPN clients unavailable "
                            "for site %s: %s",
                            site_id,
                            err,
                        )
                        self.data["vpn_clients"][site_id] = {}
                else:
                    self.data["vpn_clients"][site_id] = {}

            self._available = True
            _LOGGER.debug(
                "Config coordinator: Update complete - %d sites, %d WiFi configs, "
                "%d firewall rules, %d policy-based routes, %d VPN clients",
                len(self.data["sites"]),
                sum(len(w) for w in self.data["wifi"].values()),
                sum(len(rules) for rules in self.data["firewall_rules"].values()),
                sum(
                    len(routes) for routes in self.data["policy_based_routes"].values()
                ),
                sum(len(clients) for clients in self.data["vpn_clients"].values()),
            )

            return self.data

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:
            self._handle_generic_error(err)

        # Should never reach here due to raises above
        return self.data  # pragma: no cover

    def get_site(self, site_id: str) -> dict[str, Any] | None:
        """Get site data by site ID."""
        sites = self.data.get("sites", {})
        result = sites.get(site_id)
        return result if isinstance(result, dict) else None

    def get_site_ids(self) -> list[str]:
        """Get all site IDs."""
        return list(self.data.get("sites", {}).keys())

    def get_wifi_networks(self, site_id: str) -> dict[str, Any]:
        """Get WiFi networks for a site."""
        result: dict[str, Any] = self.data.get("wifi", {}).get(site_id, {})
        return result

    def get_firewall_rules(self, site_id: str) -> dict[str, Any]:
        """Get firewall rules for a site."""
        result: dict[str, Any] = self.data.get("firewall_rules", {}).get(site_id, {})
        return result

    def get_policy_based_routes(self, site_id: str) -> dict[str, Any]:
        """Get policy-based routes for a site."""
        result: dict[str, Any] = self.data.get("policy_based_routes", {}).get(
            site_id, {}
        )
        return result

    def get_vpn_clients(self, site_id: str) -> dict[str, Any]:
        """Get VPN clients for a site."""
        result: dict[str, Any] = self.data.get("vpn_clients", {}).get(site_id, {})
        return result
