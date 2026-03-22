"""ACL (Access Control List) models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class ACLRuleType(str, Enum):
    """ACL rule type."""

    IPV4 = "IPV4"
    MAC = "MAC"


class ACLAction(str, Enum):
    """ACL action type."""

    ALLOW = "ALLOW"
    BLOCK = "BLOCK"


class MetadataOrigin(str, Enum):
    """Metadata origin type."""

    USER_DEFINED = "USER_DEFINED"
    SYSTEM_DEFINED = "SYSTEM_DEFINED"
    DERIVED = "DERIVED"
    ORCHESTRATED = "ORCHESTRATED"


class ACLMetadata(BaseModel):
    """ACL rule metadata."""

    origin: MetadataOrigin = Field(..., description="Rule origin")


class ACLDeviceFilter(BaseModel):
    """Filter for enforcing devices."""

    device_ids: list[str] | None = Field(
        None, alias="deviceIds", description="Switch device IDs for enforcement"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}


class ACLSourceFilter(BaseModel):
    """Traffic source filtering configuration."""

    network_ids: list[str] | None = Field(None, alias="networkIds")
    mac_addresses: list[str] | None = Field(None, alias="macAddresses")
    ip_addresses: list[str] | None = Field(None, alias="ipAddresses")
    port_ranges: list[str] | None = Field(None, alias="portRanges")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ACLDestinationFilter(BaseModel):
    """Traffic destination filtering configuration."""

    network_ids: list[str] | None = Field(None, alias="networkIds")
    mac_addresses: list[str] | None = Field(None, alias="macAddresses")
    ip_addresses: list[str] | None = Field(None, alias="ipAddresses")
    port_ranges: list[str] | None = Field(None, alias="portRanges")

    model_config = {"populate_by_name": True, "extra": "allow"}


class ACLRule(BaseModel):
    """UniFi ACL Rule model."""

    id: str | None = Field(None, description="Unique rule identifier")
    type: ACLRuleType = Field(..., description="Rule type (IPV4 or MAC)")
    enabled: bool = Field(True, description="Whether rule is active")
    name: str = Field(..., description="ACL rule name")
    description: str | None = Field(None, description="ACL rule description")
    action: ACLAction = Field(..., description="Allow or block action")
    index: int = Field(
        ..., ge=0, description="Priority index; lower values = higher priority"
    )
    enforcing_device_filter: ACLDeviceFilter | None = Field(
        None, alias="enforcingDeviceFilter"
    )
    source_filter: ACLSourceFilter | None = Field(None, alias="sourceFilter")
    destination_filter: ACLDestinationFilter | None = Field(
        None, alias="destinationFilter"
    )
    metadata: ACLMetadata | None = Field(None, description="Rule metadata")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def is_user_defined(self) -> bool:
        """Check if rule is user-defined (can be modified/deleted)."""
        if self.metadata is None:
            return True
        return self.metadata.origin == MetadataOrigin.USER_DEFINED


class ACLRuleOrdering(BaseModel):
    """Model representing the ordering of user-defined ACL rules."""

    ordered_acl_rule_ids: list[str] = Field(
        default_factory=list, alias="orderedAclRuleIds"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}
