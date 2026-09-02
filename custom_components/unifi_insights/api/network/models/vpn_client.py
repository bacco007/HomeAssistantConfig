"""VPN Client data models for UniFi Network API."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class VpnClient(BaseModel):
    """VPN Client network configuration in UniFi Network."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")

    id: str = Field(alias="_id")
    name: str
    purpose: str = "vpn-client"
    vpn_type: str | None = Field(default=None, alias="vpn_type")
    enabled: bool = True
    ip_subnet: str | None = Field(default=None, alias="ip_subnet")
    openvpn_id: int | None = Field(default=None, alias="openvpn_id")
    wireguard_id: int | None = Field(default=None, alias="wireguard_id")
    remote_host: str | None = Field(default=None, alias="remote_host")
