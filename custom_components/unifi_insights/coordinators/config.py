"""Config coordinator for UniFi Insights - handles slow-changing configuration data."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from unifi_official_api import (
    UniFiAuthenticationError,
    UniFiConnectionError,
    UniFiResponseError,
    UniFiTimeoutError,
)

from custom_components.unifi_insights.const import SCAN_INTERVAL_CONFIG

from .base import UnifiBaseCoordinator

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from unifi_official_api.network import UniFiNetworkClient
    from unifi_official_api.protect import UniFiProtectClient

_LOGGER = logging.getLogger(__name__)


class UnifiConfigCoordinator(UnifiBaseCoordinator):
    """
    Coordinator for slow-changing configuration data (5 minute updates).

    Handles:
    - Sites configuration
    - WiFi networks configuration
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
            "network_info": {},
        }

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch configuration data from API."""
        try:
            # Get all sites
            _LOGGER.debug("Config coordinator: Fetching sites")
            sites_models = await self.network_client.sites.get_all()
            sites = [self._model_to_dict(s) for s in sites_models]
            self.data["sites"] = {
                site.get("id"): site for site in sites if site.get("id")
            }

            _LOGGER.debug(
                "Config coordinator: Found %d sites",
                len(self.data["sites"]),
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
                    self.data["wifi"][site_id] = wifi_dict
                    _LOGGER.debug(
                        "Config coordinator: Successfully fetched %d WiFi networks "
                        "for site %s",
                        len(wifi_dict),
                        site_id,
                    )
                except Exception as err:  # noqa: BLE001
                    _LOGGER.warning(
                        "Config coordinator: Error fetching WiFi networks "
                        "for site %s: %s",
                        site_id,
                        err,
                    )
                    self.data["wifi"][site_id] = {}

            self._available = True
            _LOGGER.debug(
                "Config coordinator: Update complete - %d sites, %d WiFi configs",
                len(self.data["sites"]),
                sum(len(w) for w in self.data["wifi"].values()),
            )

            return self.data  # noqa: TRY300

        except UniFiAuthenticationError as err:
            self._handle_auth_error(err)
        except UniFiConnectionError as err:
            self._handle_connection_error(err)
        except UniFiTimeoutError as err:
            self._handle_timeout_error(err)
        except UniFiResponseError as err:
            self._handle_response_error(err)
        except Exception as err:  # noqa: BLE001
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
        return self.data.get("wifi", {}).get(site_id, {})
