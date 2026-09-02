"""Policy-Based Route (Traffic Route) models for UniFi Network API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class TrafficRouteTargetDevice(BaseModel):
    """
    A single entry in a Policy-Based Route's ``target_devices`` list.

    Observed on live UniFi OS 5.1.31 / Network 10.6.101 controllers as e.g.
    ``{"network_id": "...", "type": "NETWORK"}``. The shape is otherwise
    undocumented, so every field is optional and unknown extras are kept.
    """

    type: str | None = None
    network_id: str | None = Field(default=None, alias="networkId")
    client_mac: str | None = Field(default=None, alias="clientMac")
    device_mac: str | None = Field(default=None, alias="deviceMac")
    ip_address: str | None = Field(default=None, alias="ipAddress")

    model_config = {"populate_by_name": True, "extra": "allow"}


class PolicyBasedRoute(BaseModel):
    """
    Model representing a Policy-Based Route (Traffic Route) in UniFi Network.

    Traffic routes allow selective routing of traffic (by domain, IP, client,
    or network) out through a specific WAN interface or VPN Client.

    Two payload shapes are known to occur in the wild:

    - Fields below such as ``target``, ``interface``, ``vpn_client_id``,
      ``fall_back_to_default_wan``, ``kill_switch`` (singular), ``ips``,
      ``client_macs``, and ``network_ids`` (plural) come from the
      maintainer's original console/firmware observations and are kept for
      backward compatibility -- they have not been reproduced against a live
      controller during this pass.
    - Fields such as ``kill_switch_enabled``, ``network_id`` (singular),
      ``next_hop``, ``regions``, ``ip_ranges``, and ``target_devices`` were
      captured live from a UniFi Dream Machine SE (UniFi OS 5.1.31, Network
      10.6.101) via ``GET /proxy/network/v2/api/site/default/trafficroutes``
      and are verified against real hardware output.

    Both shapes are modelled as optional so either can parse successfully.
    """

    id: str = Field(default="", alias="_id")
    description: str | None = None
    name: str | None = None
    enabled: bool = True
    target: str | None = None
    matching_target: str | None = Field(default=None, alias="matchingTarget")
    interface: str | None = None
    vpn_client_id: str | None = Field(default=None, alias="vpnClientId")
    kill_switch: bool | None = Field(default=None, alias="killSwitch")
    kill_switch_enabled: bool | None = Field(default=None, alias="killSwitchEnabled")
    fall_back_to_default_wan: bool | None = Field(
        default=None, alias="fallBackToDefaultWAN"
    )
    domains: list[Any] = Field(default_factory=list)
    ip_addresses: list[Any] = Field(default_factory=list, alias="ipAddresses")
    ip_ranges: list[Any] = Field(default_factory=list, alias="ipRanges")
    ips: list[str] = Field(default_factory=list)
    client_macs: list[str] = Field(default_factory=list, alias="clientMacs")
    network_ids: list[str] = Field(default_factory=list, alias="networkIds")
    network_id: str | None = Field(default=None, alias="networkId")
    next_hop: str | None = Field(default=None, alias="nextHop")
    regions: list[Any] = Field(default_factory=list)
    target_devices: list[TrafficRouteTargetDevice] = Field(
        default_factory=list, alias="targetDevices"
    )
    site_id: str | None = Field(default=None, alias="siteId")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """
        Return human-readable display name for the route.

        Falls back to description, name, matching target/interface, or route ID.
        """
        if self.description:
            return self.description
        if self.name:
            return self.name
        if self.matching_target and self.interface:
            return f"Route {self.matching_target} to {self.interface}"
        return f"Route {self.id}"
