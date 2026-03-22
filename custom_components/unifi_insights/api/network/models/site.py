"""Site models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class SiteHealth(str, Enum):
    """Site health status."""

    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"


class Site(BaseModel):
    """Model representing a UniFi site."""

    id: str
    name: str
    description: str | None = None
    timezone: str | None = None
    health: SiteHealth = SiteHealth.UNKNOWN
    device_count: int = Field(default=0, alias="deviceCount")
    client_count: int = Field(default=0, alias="clientCount")
    guest_count: int = Field(default=0, alias="guestCount")
    wan_ip: str | None = Field(default=None, alias="wanIp")
    lan_ip: str | None = Field(default=None, alias="lanIp")
    country_code: str | None = Field(default=None, alias="countryCode")
    latitude: float | None = None
    longitude: float | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}
