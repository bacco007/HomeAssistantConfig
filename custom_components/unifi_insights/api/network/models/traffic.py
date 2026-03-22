"""Traffic Matching models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class TrafficMatchingType(str, Enum):
    """Traffic matching list type."""

    IP_ADDRESS = "IP_ADDRESS"
    IPV4_ADDRESSES = "IPV4_ADDRESSES"
    PORT = "PORT"
    PORTS = "PORTS"
    DOMAIN = "DOMAIN"
    APP = "APP"
    REGION = "REGION"


class MetadataOrigin(str, Enum):
    """Metadata origin type."""

    USER_DEFINED = "USER_DEFINED"
    SYSTEM_DEFINED = "SYSTEM_DEFINED"
    ORCHESTRATED = "ORCHESTRATED"


class TrafficMetadata(BaseModel):
    """Traffic matching list metadata."""

    origin: MetadataOrigin = Field(..., description="List origin")


class TrafficMatchingList(BaseModel):
    """UniFi Traffic Matching List model."""

    id: str | None = Field(None, description="Unique list identifier")
    type: TrafficMatchingType = Field(..., description="List type")
    name: str = Field(..., description="List name")
    description: str | None = Field(None, description="List description")
    entries: list[str] = Field(default_factory=list, description="List entries")
    metadata: TrafficMetadata | None = Field(None, description="List metadata")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def is_user_defined(self) -> bool:
        """Check if list is user-defined (can be modified/deleted)."""
        if self.metadata is None:
            return True
        return self.metadata.origin == MetadataOrigin.USER_DEFINED


class DPICategory(BaseModel):
    """DPI (Deep Packet Inspection) Category."""

    id: str = Field(..., description="Category identifier")
    name: str = Field(..., description="Category name")
    description: str | None = Field(None, description="Category description")


class DPIApplication(BaseModel):
    """DPI Application."""

    id: str = Field(..., description="Application identifier")
    name: str = Field(..., description="Application name")
    category_id: str | None = Field(None, alias="categoryId")
    description: str | None = Field(None, description="Application description")

    model_config = {"populate_by_name": True, "extra": "allow"}


class Country(BaseModel):
    """Country/Region model."""

    code: str = Field(..., description="ISO country code")
    name: str = Field(..., description="Country name")
