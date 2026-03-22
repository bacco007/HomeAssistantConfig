"""DNS policy models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class DNSRecordType(str, Enum):
    """DNS record types."""

    A_RECORD = "A_RECORD"
    AAAA_RECORD = "AAAA_RECORD"
    CNAME_RECORD = "CNAME_RECORD"
    MX_RECORD = "MX_RECORD"
    TXT_RECORD = "TXT_RECORD"
    SRV_RECORD = "SRV_RECORD"
    FORWARD_DOMAIN = "FORWARD_DOMAIN"


class DNSPolicyMetadata(BaseModel):
    """Metadata for a DNS policy."""

    origin: str | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class DNSPolicy(BaseModel):
    """
    Model representing a DNS policy.

    DNS policies allow custom DNS record management on a UniFi site,
    including A, AAAA, CNAME, MX, TXT, SRV records, and domain forwarding.
    """

    id: str
    type: DNSRecordType
    enabled: bool = True
    metadata: DNSPolicyMetadata | None = None
    domain: str | None = None
    ipv4_address: str | None = Field(default=None, alias="ipv4Address")
    ttl_seconds: int | None = Field(default=None, alias="ttlSeconds")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def is_user_defined(self) -> bool:
        """
        Check if this DNS policy was user-defined.

        Returns:
            True if the policy was created by a user (not system-defined).

        """
        if self.metadata and self.metadata.origin:
            return self.metadata.origin == "USER_DEFINED"
        return False
