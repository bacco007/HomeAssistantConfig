"""Support for UniFi switches (Network and Protect)."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import (
    ATTR_CAMERA_ID,
    ATTR_CAMERA_NAME,
    ATTR_HIGH_FPS_MODE,
    ATTR_MIC_ENABLED,
    ATTR_PRIVACY_MODE,
    ATTR_STATUS_LIGHT,
    DEVICE_TYPE_CAMERA,
    DOMAIN,
    MANUFACTURER,
    VIDEO_MODE_DEFAULT,
    VIDEO_MODE_HIGH_FPS,
)
from .entity import UnifiProtectEntity, async_call_coordinator_action

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from . import UnifiInsightsConfigEntry
    from .coordinators import UnifiFacadeCoordinator

_LOGGER = logging.getLogger(__name__)

# Switch entities are action-based, allow parallel execution
PARALLEL_UPDATES = 1


def _device_has_feature(device_data: dict[str, Any], *features_to_match: str) -> bool:
    """Return True when a device advertises any of the requested features."""
    features = device_data.get("features", [])
    if isinstance(features, dict):
        return any(
            bool(features.get(feature_name)) for feature_name in features_to_match
        )
    if isinstance(features, list):
        return any(feature_name in features for feature_name in features_to_match)
    return False


def _get_firewall_rule_action(rule_data: dict[str, Any]) -> str | None:
    """Return the firewall rule action regardless of payload shape."""
    action = rule_data.get("action")
    if isinstance(action, dict):
        action_type = action.get("type")
        return str(action_type) if action_type is not None else None
    return str(action) if action is not None else None


def _is_predefined_firewall_rule(rule_data: dict[str, Any]) -> bool:
    """Return True when a firewall rule appears to be system-defined."""
    metadata = rule_data.get("metadata")
    if isinstance(metadata, dict) and metadata.get("origin") == "SYSTEM_DEFINED":
        return True
    return bool(
        rule_data.get("predefined")
        or rule_data.get("isPredefined")
        or rule_data.get("isSystem")
    )


async def async_setup_entry(
    hass: HomeAssistant,  # noqa: ARG001
    entry: UnifiInsightsConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up switches for UniFi integration."""
    coordinator: UnifiFacadeCoordinator = entry.runtime_data.coordinator
    entities: list[SwitchEntity] = []

    # Add Protect switches if available
    if coordinator.protect_client:
        # Add camera switches (microphone, privacy mode, status light, high FPS)
        for camera_id, camera_data in coordinator.data["protect"]["cameras"].items():
            camera_name = camera_data.get("name", camera_id)
            _LOGGER.debug(
                "Adding camera switches for camera %s",
                camera_name,
            )
            # Microphone switch
            entities.append(
                UnifiProtectMicrophoneSwitch(
                    coordinator=coordinator,
                    camera_id=camera_id,
                )
            )
            # Privacy mode switch
            entities.append(
                UnifiProtectPrivacySwitch(
                    coordinator=coordinator,
                    camera_id=camera_id,
                )
            )
            # Status light switch
            entities.append(
                UnifiProtectStatusLightSwitch(
                    coordinator=coordinator,
                    camera_id=camera_id,
                )
            )
            # High FPS mode switch (only for cameras that support it)
            feature_flags = camera_data.get("featureFlags", {})
            if isinstance(feature_flags, dict) and feature_flags.get(
                "hasHighFpsCapability", False
            ):
                entities.append(
                    UnifiProtectHighFPSSwitch(
                        coordinator=coordinator,
                        camera_id=camera_id,
                    )
                )

    # Add client block/allow switches for each connected client
    for site_id, clients in coordinator.data.get("clients", {}).items():
        for client_id, client_data in clients.items():
            client_name = (
                client_data.get("name")
                or client_data.get("hostname")
                or client_data.get("mac", client_id)
            )
            _LOGGER.debug(
                "Adding block/allow switch for client %s",
                client_name,
            )
            entities.append(
                UnifiClientBlockSwitch(
                    coordinator=coordinator,
                    site_id=site_id,
                    client_id=client_id,
                )
            )

    # Add WiFi network enable/disable switches
    for site_id, wifi_networks in coordinator.data.get("wifi", {}).items():
        for wifi_id, wifi_data in wifi_networks.items():
            wifi_name = wifi_data.get("name") or wifi_data.get("ssid", wifi_id)
            _LOGGER.debug(
                "Adding enable/disable switch for WiFi network %s",
                wifi_name,
            )
            entities.append(
                UnifiWifiSwitch(
                    coordinator=coordinator,
                    site_id=site_id,
                    wifi_id=wifi_id,
                    wifi_data=wifi_data,
                )
            )

    # Add firewall policy enable/disable switches for user-defined rules.
    # System-defined rules (auto-generated by UniFi features like port forwarding
    # or mDNS) cannot be toggled via the Integration API and are excluded.
    skipped_system_rules = 0
    for site_id, firewall_rules in coordinator.data.get("firewall_rules", {}).items():
        for rule_id, rule_data in firewall_rules.items():
            if not isinstance(rule_data, dict):
                continue

            if _is_predefined_firewall_rule(rule_data):
                skipped_system_rules += 1
                _LOGGER.debug(
                    "Skipping system-defined firewall rule %s (%s) in site %s",
                    rule_data.get("name", rule_id),
                    rule_id,
                    site_id,
                )
                continue

            rule_name = rule_data.get("name", rule_id)
            _LOGGER.debug(
                "Adding enable/disable switch for firewall rule %s",
                rule_name,
            )
            entities.append(
                UnifiFirewallRuleSwitch(
                    coordinator=coordinator,
                    site_id=site_id,
                    rule_id=rule_id,
                )
            )

    if skipped_system_rules:
        _LOGGER.info(
            "Skipped %d system-defined firewall rules (not modifiable via API); "
            "only user-created policies are exposed as switches",
            skipped_system_rules,
        )

    _LOGGER.info("Adding %d UniFi switches", len(entities))
    async_add_entities(entities)


class UnifiFirewallRuleSwitch(
    CoordinatorEntity["UnifiFacadeCoordinator"], SwitchEntity
):
    """Switch to enable or disable a user-defined firewall rule."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        rule_id: str,
    ) -> None:
        """Initialize the firewall rule switch."""
        super().__init__(coordinator)
        self._site_id = site_id
        self._rule_id = rule_id

        rule_data = self._get_rule_data()
        rule_name = rule_data.get("name") or rule_id

        self._attr_unique_id = f"{site_id}_{rule_id}_firewall_rule"
        self._attr_name = str(rule_name)
        self._attr_device_info = self._build_device_info()

    def _get_rule_data(self) -> dict[str, Any]:
        """Get firewall rule data from the coordinator."""
        result: dict[str, Any] = (
            self.coordinator.data.get("firewall_rules", {})
            .get(self._site_id, {})
            .get(self._rule_id, {})
        )
        return result

    def _find_gateway_device_id(self) -> str | None:
        """Return the gateway-like device ID for the site if one exists."""
        site_devices = self.coordinator.data.get("devices", {}).get(self._site_id, {})
        if not isinstance(site_devices, dict):
            return None

        for device_id, device_data in site_devices.items():
            if not isinstance(device_data, dict):
                continue

            model = str(device_data.get("model", "")).upper()
            if _device_has_feature(
                device_data, "gateway", "router"
            ) or model.startswith(("UDM", "USG", "UXG", "UCG")):
                return str(device_id)

        return None

    def _build_device_info(self) -> DeviceInfo:
        """Build device info for firewall rule grouping."""
        gateway_device_id = self._find_gateway_device_id()
        if gateway_device_id is not None:
            return DeviceInfo(
                identifiers={(DOMAIN, f"{self._site_id}_{gateway_device_id}")}
            )

        site_data = self.coordinator.data.get("sites", {}).get(self._site_id, {})
        meta = site_data.get("meta", {})
        site_name = (
            meta.get("name") if isinstance(meta, dict) else None
        ) or site_data.get("name", self._site_id)

        return DeviceInfo(
            identifiers={(DOMAIN, f"firewall_policies_{self._site_id}")},
            name=f"Firewall Policies ({site_name})",
            manufacturer=MANUFACTURER,
            model="UniFi Firewall Policies",
        )

    def _update_local_state(self, *, enabled: bool) -> None:
        """Update the aggregated coordinator cache for immediate UI feedback."""
        firewall_rules = self.coordinator.data.setdefault("firewall_rules", {})
        site_rules = firewall_rules.setdefault(self._site_id, {})
        rule_data = site_rules.get(self._rule_id)
        if isinstance(rule_data, dict):
            rule_data["enabled"] = enabled

    @property
    def available(self) -> bool:
        """Return if the switch is available."""
        return bool(self.coordinator.last_update_success and self._get_rule_data())

    @property
    def is_on(self) -> bool:
        """Return True if the firewall rule is enabled."""
        rule_data = self._get_rule_data()
        return bool(rule_data.get("enabled", True))

    @property
    def icon(self) -> str:
        """Return a context-specific icon for the firewall rule state."""
        return "mdi:shield-lock" if self.is_on else "mdi:shield-off"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return firewall rule metadata useful in automations and debugging."""
        rule_data = self._get_rule_data()
        return {
            "rule_id": self._rule_id,
            "action": _get_firewall_rule_action(rule_data),
            "protocol": rule_data.get("protocol"),
            "source_zone_id": rule_data.get("sourceZoneId")
            or rule_data.get("source_zone_id"),
            "destination_zone_id": rule_data.get("destinationZoneId")
            or rule_data.get("destination_zone_id"),
            "logging": rule_data.get("logging", False),
            "index": rule_data.get("index"),
        }

    async def _async_set_enabled(self, *, enabled: bool) -> None:
        """Enable or disable the firewall rule."""
        action = "Enabling" if enabled else "Disabling"
        _LOGGER.debug(
            "%s firewall rule %s in site %s",
            action,
            self._rule_id,
            self._site_id,
        )

        await async_call_coordinator_action(
            self.coordinator,
            "async_set_firewall_rule_enabled",
            f"Unable to update firewall rule {self._rule_id}",
            self._site_id,
            self._rule_id,
            enabled=enabled,
            fallback_factory=lambda: (
                self.coordinator.network_client.firewall.update_rule(
                    self._site_id,
                    self._rule_id,
                    enabled=enabled,
                )
            ),
        )
        self._update_local_state(enabled=enabled)
        self.async_write_ha_state()
        await self.coordinator.async_request_refresh()

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable the firewall rule."""
        _ = kwargs
        await self._async_set_enabled(enabled=True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable the firewall rule."""
        _ = kwargs
        await self._async_set_enabled(enabled=False)


class UnifiProtectMicrophoneSwitch(UnifiProtectEntity, SwitchEntity):
    """Representation of a UniFi Protect Camera Microphone Switch."""

    _attr_has_entity_name = True
    _attr_translation_key = "microphone"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "microphone")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Set state
        self._attr_is_on = camera_data.get("micEnabled", False)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_MIC_ENABLED: self._attr_is_on,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the microphone on."""
        _ = kwargs
        _LOGGER.debug("Turning on microphone for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera",
            f"Unable to turn on microphone for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.update_camera(  # type: ignore[union-attr]
                camera_id=self._device_id,
                data={"micEnabled": True},
            ),
            micEnabled=True,
        )
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the microphone off."""
        _ = kwargs
        _LOGGER.debug("Turning off microphone for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera",
            f"Unable to turn off microphone for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.update_camera(  # type: ignore[union-attr]
                camera_id=self._device_id,
                data={"micEnabled": False},
            ),
            micEnabled=False,
        )
        self._attr_is_on = False
        self.async_write_ha_state()


class UnifiProtectPrivacySwitch(UnifiProtectEntity, SwitchEntity):
    """Representation of a UniFi Protect Camera Privacy Mode Switch."""

    _attr_has_entity_name = True
    _attr_translation_key = "privacy_mode"
    _attr_icon = "mdi:eye-off"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "privacy_mode")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Privacy mode is stored in privacyZones - if any exist with non-empty points,
        # privacy mode is on. The isPrivacyModeEnabled flag may also be available.
        privacy_zones = camera_data.get("privacyZones", [])
        is_privacy_enabled = camera_data.get("isPrivacyModeEnabled", False)

        # Privacy is on if explicitly enabled or if privacy zones are configured
        self._attr_is_on = is_privacy_enabled or (
            len(privacy_zones) > 0
            and any(zone.get("points", []) for zone in privacy_zones)
        )

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_PRIVACY_MODE: self._attr_is_on,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn privacy mode on."""
        _ = kwargs
        _LOGGER.debug("Enabling privacy mode for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to enable privacy mode for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                is_privacy_mode_enabled=True,
            ),
            is_privacy_mode_enabled=True,
        )
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn privacy mode off."""
        _ = kwargs
        _LOGGER.debug("Disabling privacy mode for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to disable privacy mode for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                is_privacy_mode_enabled=False,
            ),
            is_privacy_mode_enabled=False,
        )
        self._attr_is_on = False
        self.async_write_ha_state()


class UnifiProtectStatusLightSwitch(UnifiProtectEntity, SwitchEntity):
    """Representation of a UniFi Protect Camera Status Light Switch."""

    _attr_has_entity_name = True
    _attr_translation_key = "status_light"
    _attr_icon = "mdi:led-on"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "status_light")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # LED settings are stored in ledSettings
        led_settings = camera_data.get("ledSettings", {})
        # isEnabled controls whether the status LED is on
        self._attr_is_on = led_settings.get("isEnabled", True)

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_STATUS_LIGHT: self._attr_is_on,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the status light on."""
        _ = kwargs
        _LOGGER.debug("Turning on status light for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to turn on status light for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                led_settings={"isEnabled": True},
            ),
            led_settings={"isEnabled": True},
        )
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn the status light off."""
        _ = kwargs
        _LOGGER.debug("Turning off status light for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to turn off status light for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                led_settings={"isEnabled": False},
            ),
            led_settings={"isEnabled": False},
        )
        self._attr_is_on = False
        self.async_write_ha_state()


class UnifiProtectHighFPSSwitch(UnifiProtectEntity, SwitchEntity):
    """Representation of a UniFi Protect Camera High FPS Mode Switch."""

    _attr_has_entity_name = True
    _attr_translation_key = "high_fps_mode"
    _attr_icon = "mdi:fast-forward"

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        camera_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator, DEVICE_TYPE_CAMERA, camera_id, "high_fps")

        # Set entity category
        self._attr_entity_category = EntityCategory.CONFIG

        # Set initial state
        self._update_from_data()

    def _update_from_data(self) -> None:
        """Update entity from data."""
        camera_data = self.coordinator.data["protect"]["cameras"].get(
            self._device_id, {}
        )

        # Video mode indicates high FPS when set to "highFps"
        video_mode = camera_data.get("videoMode", VIDEO_MODE_DEFAULT)
        self._attr_is_on = video_mode == VIDEO_MODE_HIGH_FPS

        # Set attributes
        self._attr_extra_state_attributes = {
            ATTR_CAMERA_ID: self._device_id,
            ATTR_CAMERA_NAME: camera_data.get("name"),
            ATTR_HIGH_FPS_MODE: self._attr_is_on,
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable high FPS mode."""
        _ = kwargs
        _LOGGER.debug("Enabling high FPS mode for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to enable high FPS mode for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                video_mode=VIDEO_MODE_HIGH_FPS,
            ),
            video_mode=VIDEO_MODE_HIGH_FPS,
        )
        self._attr_is_on = True
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable high FPS mode (return to default)."""
        _ = kwargs
        _LOGGER.debug("Disabling high FPS mode for camera %s", self._device_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_camera_settings",
            f"Unable to disable high FPS mode for camera {self._device_id}",
            self._device_id,
            fallback_factory=lambda: self.coordinator.protect_client.cameras.update(  # type: ignore[union-attr]
                self._device_id,
                video_mode=VIDEO_MODE_DEFAULT,
            ),
            video_mode=VIDEO_MODE_DEFAULT,
        )
        self._attr_is_on = False
        self.async_write_ha_state()


class UnifiClientBlockSwitch(CoordinatorEntity["UnifiFacadeCoordinator"], SwitchEntity):
    """
    Switch to allow/block a network client.

    When ON (is_on=True): Client is allowed (not blocked)
    When OFF (is_on=False): Client is blocked
    """

    _attr_has_entity_name = True
    _attr_icon = "mdi:account-lock"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        client_id: str,
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator)
        self._site_id = site_id
        self._client_id = client_id

        # Get client data for naming
        client_data = self._get_client_data()
        client_name = (
            client_data.get("name")
            or client_data.get("hostname")
            or client_data.get("mac", client_id)
        )

        self._attr_unique_id = f"{site_id}_{client_id}_block_switch"
        self._attr_name = f"{client_name} Allow"

        # Device info - associate with the connected network device (switch/AP)
        # This groups client entities under their uplink device for a cleaner UI
        uplink_device_id = client_data.get("uplinkDeviceId") or client_data.get(
            "uplink_device_id"
        )
        if uplink_device_id:
            # Use the network device's identifiers to group under it
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"{site_id}_{uplink_device_id}")},
            )
        else:
            # Fallback: create a standalone client device if no uplink found
            self._attr_device_info = DeviceInfo(
                identifiers={(DOMAIN, f"client_{client_id}")},
                name=client_name,
                manufacturer=MANUFACTURER,
                model="Network Client",
            )

    def _get_client_data(self) -> dict[str, Any]:
        """Get client data from coordinator."""
        result: dict[str, Any] = (
            self.coordinator.data.get("clients", {})
            .get(self._site_id, {})
            .get(self._client_id, {})
        )
        return result

    @property
    def available(self) -> bool:
        """Return if switch is available."""
        return bool(self.coordinator.last_update_success and self._get_client_data())

    @property
    def is_on(self) -> bool:
        """Return true if client is allowed (not blocked)."""
        client_data = self._get_client_data()
        # ON = allowed (not blocked), OFF = blocked
        is_blocked = client_data.get("blocked", False)
        return not is_blocked

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Allow the client (unblock)."""
        _ = kwargs
        _LOGGER.debug(
            "Allowing client %s in site %s (unblocking)", self._client_id, self._site_id
        )

        await async_call_coordinator_action(
            self.coordinator,
            "async_unblock_client",
            f"Unable to allow client {self._client_id}",
            self._site_id,
            self._client_id,
            fallback_factory=lambda: self.coordinator.network_client.clients.unblock(
                self._site_id,
                self._client_id,
            ),
        )
        _LOGGER.info(
            "Successfully allowed client %s in site %s",
            self._client_id,
            self._site_id,
        )
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Block the client."""
        _ = kwargs
        _LOGGER.debug("Blocking client %s in site %s", self._client_id, self._site_id)

        await async_call_coordinator_action(
            self.coordinator,
            "async_block_client",
            f"Unable to block client {self._client_id}",
            self._site_id,
            self._client_id,
            fallback_factory=lambda: self.coordinator.network_client.clients.block(
                self._site_id,
                self._client_id,
            ),
        )
        _LOGGER.info(
            "Successfully blocked client %s in site %s",
            self._client_id,
            self._site_id,
        )
        await self.coordinator.async_request_refresh()


class UnifiWifiSwitch(CoordinatorEntity["UnifiFacadeCoordinator"], SwitchEntity):
    """Switch to enable/disable a WiFi network."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:wifi"
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: UnifiFacadeCoordinator,
        site_id: str,
        wifi_id: str,
        wifi_data: dict[str, Any],
    ) -> None:
        """Initialize the switch."""
        super().__init__(coordinator)
        self._site_id = site_id
        self._wifi_id = wifi_id
        self._wifi_data = wifi_data

        wifi_name = wifi_data.get("name") or wifi_data.get("ssid", wifi_id)

        self._attr_unique_id = f"{site_id}_{wifi_id}_wifi_switch"
        self._attr_name = f"WiFi {wifi_name}"

        # Create device info for WiFi network
        # Note: We don't use via_device since site_id is not a registered device
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"wifi_{wifi_id}")},
            name=f"WiFi: {wifi_name}",
            manufacturer=MANUFACTURER,
            model="WiFi Network",
        )

    def _get_wifi_data(self) -> dict[str, Any]:
        """Get WiFi data from coordinator."""
        result: dict[str, Any] = (
            self.coordinator.data.get("wifi", {})
            .get(self._site_id, {})
            .get(self._wifi_id, {})
        )
        return result or self._wifi_data

    @property
    def available(self) -> bool:
        """Return if switch is available."""
        return bool(self.coordinator.last_update_success and self._get_wifi_data())

    @property
    def is_on(self) -> bool:
        """Return true if WiFi is enabled."""
        wifi_data = self._get_wifi_data()
        return bool(wifi_data.get("enabled", True))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        wifi_data = self._get_wifi_data()
        return {
            "wifi_id": self._wifi_id,
            "ssid": wifi_data.get("ssid"),
            "security": wifi_data.get("security"),
            "hidden": wifi_data.get("hidden", False),
            "is_guest": wifi_data.get("isGuest", False),
        }

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Enable the WiFi network."""
        _ = kwargs
        _LOGGER.debug(
            "Enabling WiFi network %s in site %s", self._wifi_id, self._site_id
        )

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_wifi_network",
            f"Unable to enable WiFi network {self._wifi_id}",
            self._site_id,
            self._wifi_id,
            fallback_factory=lambda: self.coordinator.network_client.wifi.update(
                self._site_id,
                self._wifi_id,
                enabled=True,
            ),
            enabled=True,
        )
        _LOGGER.info(
            "Successfully enabled WiFi network %s in site %s",
            self._wifi_id,
            self._site_id,
        )
        await self.coordinator.async_request_refresh()

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Disable the WiFi network."""
        _ = kwargs
        _LOGGER.debug(
            "Disabling WiFi network %s in site %s", self._wifi_id, self._site_id
        )

        await async_call_coordinator_action(
            self.coordinator,
            "async_update_wifi_network",
            f"Unable to disable WiFi network {self._wifi_id}",
            self._site_id,
            self._wifi_id,
            fallback_factory=lambda: self.coordinator.network_client.wifi.update(
                self._site_id,
                self._wifi_id,
                enabled=False,
            ),
            enabled=False,
        )
        _LOGGER.info(
            "Successfully disabled WiFi network %s in site %s",
            self._wifi_id,
            self._site_id,
        )
        await self.coordinator.async_request_refresh()
