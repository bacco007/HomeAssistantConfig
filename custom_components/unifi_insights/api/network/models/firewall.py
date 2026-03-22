"""Firewall models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class FirewallZone(BaseModel):
    """Model representing a firewall zone."""

    id: str
    name: str
    site_id: str | None = Field(default=None, alias="siteId")
    network_ids: list[str] = Field(default_factory=list, alias="networkIds")

    model_config = {"populate_by_name": True, "extra": "allow"}


class FirewallAction(str, Enum):
    """Firewall rule actions."""

    ACCEPT = "accept"
    ALLOW = "ALLOW"
    DROP = "drop"
    REJECT = "reject"
    DENY = "DENY"


class FirewallActionConfig(BaseModel):
    """Firewall action configuration (structured format from API v10+)."""

    type: str = Field(description="Action type (e.g. ALLOW, DENY)")
    allow_return_traffic: bool | None = Field(default=None, alias="allowReturnTraffic")

    model_config = {"populate_by_name": True, "extra": "allow"}


class FirewallProtocol(str, Enum):
    """Firewall protocols."""

    ALL = "all"
    TCP = "tcp"
    UDP = "udp"
    ICMP = "icmp"
    TCP_UDP = "tcp_udp"


class FirewallRule(BaseModel):
    """Model representing a firewall rule."""

    id: str
    name: str
    site_id: str | None = Field(default=None, alias="siteId")
    enabled: bool = True
    action: FirewallActionConfig | str = Field(
        default="drop",
        description="Action - either a string or structured config object",
    )
    protocol: str | None = Field(default=None)
    source_zone_id: str | None = Field(default=None, alias="sourceZoneId")
    destination_zone_id: str | None = Field(default=None, alias="destinationZoneId")
    source_address: str | None = Field(default=None, alias="sourceAddress")
    destination_address: str | None = Field(default=None, alias="destinationAddress")
    source_port: str | None = Field(default=None, alias="sourcePort")
    destination_port: str | None = Field(default=None, alias="destinationPort")
    index: int | None = None
    logging: bool = False

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def action_type(self) -> str:
        """
        Get the action type as a string regardless of format.

        Returns:
            The action type string (e.g., 'ALLOW', 'DENY', 'drop').

        """
        if isinstance(self.action, FirewallActionConfig):
            return self.action.type
        return str(self.action)


class OrderedFirewallPolicyIds(BaseModel):
    """Ordered firewall policy IDs, split around system-defined rules."""

    before_system_defined: list[str] = Field(
        default_factory=list, alias="beforeSystemDefined"
    )
    after_system_defined: list[str] = Field(
        default_factory=list, alias="afterSystemDefined"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}


class FirewallPolicyOrdering(BaseModel):
    """Model representing the ordering of user-defined firewall policies."""

    ordered_firewall_policy_ids: OrderedFirewallPolicyIds = Field(
        alias="orderedFirewallPolicyIds"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}
