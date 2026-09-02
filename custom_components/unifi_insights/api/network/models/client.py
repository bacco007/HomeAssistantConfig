"""Client models for UniFi Network API."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ClientType(str, Enum):
    """
    Types of network clients.

    The API returns either uppercase (WIRED/WIRELESS) or lowercase (wired/wireless).
    This enum normalizes both cases to uppercase values for consistent comparisons.
    """

    WIRED = "WIRED"
    WIRELESS = "WIRELESS"
    VPN = "VPN"
    TELEPORT = "TELEPORT"

    @classmethod
    def _missing_(cls, value: object) -> ClientType | None:
        """Handle case-insensitive enum lookup."""
        if isinstance(value, str):
            upper_value = value.upper()
            for member in cls:
                if member.value == upper_value:
                    return member
        return None


class Client(BaseModel):
    """Model representing a connected network client."""

    id: str
    mac: str | None = Field(default=None, alias="macAddress")
    name: str | None = None
    hostname: str | None = None
    ip: str | None = Field(default=None, alias="ipAddress")
    type: ClientType | str | None = None
    network_id: str | None = Field(default=None, alias="networkId")
    site_id: str | None = Field(default=None, alias="siteId")
    connected: bool = True
    authorized: bool = True
    blocked: bool = False
    first_seen: datetime | str | int | float | None = Field(
        default=None, alias="firstSeen"
    )
    last_seen: datetime | str | int | float | None = Field(
        default=None, alias="lastSeen"
    )
    uptime: int | float | None = None
    tx_bytes: int | float | None = Field(default=None, alias="txBytes")
    rx_bytes: int | float | None = Field(default=None, alias="rxBytes")
    tx_rate: int | float | None = Field(default=None, alias="txRate")
    rx_rate: int | float | None = Field(default=None, alias="rxRate")
    signal: int | None = None
    noise: int | None = None
    channel: int | None = None
    radio: str | None = None
    essid: str | None = None
    bssid: str | None = None
    ap_mac: str | None = Field(default=None, alias="apMac")
    sw_mac: str | None = Field(default=None, alias="swMac")
    sw_port: int | None = Field(default=None, alias="swPort")
    vlan: int | None = None
    os_name: str | None = Field(default=None, alias="osName")
    device_name: str | None = Field(default=None, alias="deviceName")

    model_config = {"populate_by_name": True, "extra": "allow", "use_enum_values": True}

    @field_validator("type", mode="before")
    @classmethod
    def _normalize_client_type(cls, value: Any) -> Any:
        """Normalize client type to known enum where possible."""
        if isinstance(value, str):
            upper_val = value.upper()
            if upper_val in ClientType._value2member_map_:
                return ClientType(upper_val)
        return value

    @property
    def display_name(self) -> str:
        """Get the display name for the client."""
        return self.name or self.hostname or self.mac or "Unknown"
