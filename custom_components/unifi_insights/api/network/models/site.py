"""Site models for UniFi Network API."""

from __future__ import annotations

from enum import Enum
from typing import Self

from pydantic import BaseModel, Field, model_validator


class SiteHealth(str, Enum):
    """Site health status."""

    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class Site(BaseModel):
    """Model representing a UniFi site."""

    id: str | None = None
    name: str | None = None
    internal_reference: str | None = Field(default=None, alias="internalReference")
    description: str | None = None
    timezone: str | None = None
    health: SiteHealth | str = SiteHealth.UNKNOWN
    device_count: int = Field(default=0, alias="deviceCount")
    client_count: int = Field(default=0, alias="clientCount")
    guest_count: int = Field(default=0, alias="guestCount")
    wan_ip: str | None = Field(default=None, alias="wanIp")
    lan_ip: str | None = Field(default=None, alias="lanIp")
    country_code: str | None = Field(default=None, alias="countryCode")
    latitude: float | None = None
    longitude: float | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}

    @model_validator(mode="after")
    def populate_fallbacks(self) -> Self:
        """Ensure id and name are populated from internalReference or defaults if missing."""
        if not self.id:
            self.id = self.internal_reference or self.name or "default"
        if not self.name:
            self.name = self.internal_reference or self.id or "Default"
        return self

    @property
    def display_name(self) -> str:
        """Get the display name for the site."""
        return self.name or self.internal_reference or self.id or "Default"
