"""Supporting resource models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class WANStatus(str, Enum):
    """WAN interface status."""

    UP = "UP"
    DOWN = "DOWN"
    CONNECTING = "CONNECTING"


class WANInterface(BaseModel):
    """
    WAN Interface model.

    The integration API returns a simplified view with id and name.
    Additional fields like status and speeds may be available in some contexts.
    """

    id: str = Field(..., description="Interface identifier")
    name: str = Field(..., description="Interface name")
    status: WANStatus | None = Field(None, description="Interface status")
    ip_address: str | None = Field(None, alias="ipAddress")
    gateway: str | None = Field(None, description="Gateway address")
    dns: list[str] | None = Field(None, description="DNS servers")
    is_primary: bool = Field(False, alias="isPrimary")
    is_connected: bool = Field(False, alias="isConnected")
    upload_speed: int | None = Field(None, alias="uploadSpeed", description="Mbps")
    download_speed: int | None = Field(None, alias="downloadSpeed", description="Mbps")

    model_config = {"populate_by_name": True, "extra": "allow"}


class VPNTunnelStatus(str, Enum):
    """VPN tunnel status."""

    UP = "UP"
    DOWN = "DOWN"
    CONNECTING = "CONNECTING"
    ERROR = "ERROR"


class VPNTunnel(BaseModel):
    """Site-to-Site VPN Tunnel model."""

    id: str = Field(..., description="Tunnel identifier")
    name: str | None = Field(None, description="Tunnel name")
    status: VPNTunnelStatus | None = Field(None, description="Tunnel status")
    local_network: str | None = Field(None, alias="localNetwork")
    remote_network: str | None = Field(None, alias="remoteNetwork")
    remote_ip: str | None = Field(None, alias="remoteIp")
    ike_version: int | None = Field(None, alias="ikeVersion")

    model_config = {"populate_by_name": True, "extra": "allow"}


class VPNServerType(str, Enum):
    """VPN server type."""

    WIREGUARD = "WIREGUARD"
    OPENVPN = "OPENVPN"
    L2TP = "L2TP"


class VPNServer(BaseModel):
    """VPN Server model."""

    id: str = Field(..., description="Server identifier")
    name: str | None = Field(None, description="Server name")
    type: VPNServerType | str | None = Field(None, description="Server type")
    enabled: bool = Field(True, description="Whether server is enabled")
    port: int | None = Field(None, description="Server port")
    network: str | None = Field(None, description="VPN network CIDR")

    model_config = {"populate_by_name": True, "extra": "allow"}


class RADIUSProfile(BaseModel):
    """RADIUS Profile model."""

    id: str = Field(..., description="Profile identifier")
    name: str = Field(..., description="Profile name")
    auth_server: str | None = Field(None, alias="authServer")
    auth_port: int = Field(1812, alias="authPort")
    acct_server: str | None = Field(None, alias="acctServer")
    acct_port: int = Field(1813, alias="acctPort")
    enabled: bool = Field(True)

    model_config = {"populate_by_name": True, "extra": "allow"}


class DeviceTag(BaseModel):
    """Device Tag model."""

    id: str = Field(..., description="Tag identifier")
    name: str = Field(..., description="Tag name")
    color: str | None = Field(None, description="Tag color (hex)")
    device_count: int = Field(0, alias="deviceCount")

    model_config = {"populate_by_name": True, "extra": "allow"}
