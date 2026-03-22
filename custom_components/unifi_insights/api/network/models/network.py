"""Network models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class NetworkType(str, Enum):
    """Types of networks."""

    CORPORATE = "corporate"
    GUEST = "guest"
    WAN = "wan"
    VPN = "vpn"


class NetworkPurpose(str, Enum):
    """Network purposes."""

    CORPORATE = "corporate"
    GUEST = "guest"
    VLAN_ONLY = "vlan-only"
    REMOTE_USER_VPN = "remote-user-vpn"
    SITE_VPN = "site-vpn"


class Network(BaseModel):
    """Model representing a network configuration."""

    id: str
    name: str
    site_id: str | None = Field(default=None, alias="siteId")
    type: NetworkType | None = None
    purpose: NetworkPurpose | None = None
    enabled: bool = True
    vlan_id: int | None = Field(default=None, alias="vlanId")
    subnet: str | None = None
    gateway_ip: str | None = Field(default=None, alias="gatewayIp")
    dhcp_enabled: bool = Field(default=True, alias="dhcpEnabled")
    dhcp_start: str | None = Field(default=None, alias="dhcpStart")
    dhcp_stop: str | None = Field(default=None, alias="dhcpStop")
    dhcp_lease_time: int | None = Field(default=None, alias="dhcpLeaseTime")
    domain_name: str | None = Field(default=None, alias="domainName")
    igmp_snooping: bool = Field(default=False, alias="igmpSnooping")
    ipv6_enabled: bool = Field(default=False, alias="ipv6Enabled")

    model_config = {"populate_by_name": True, "extra": "allow"}
