"""WiFi models for UniFi Network API."""

from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field


class WifiSecurity(str, Enum):
    """WiFi security types."""

    OPEN = "open"
    OPEN_UPPER = "OPEN"
    WPA2 = "wpa2"
    WPA2_PERSONAL = "WPA2_PERSONAL"
    WPA3 = "wpa3"
    WPA3_PERSONAL = "WPA3_PERSONAL"
    WPA2_WPA3 = "wpa2-wpa3"
    WPA_ENTERPRISE = "wpa-enterprise"
    WPA2_ENTERPRISE = "WPA2_ENTERPRISE"


class WifiNetwork(BaseModel):
    """Model representing a WiFi network configuration (broadcast)."""

    id: str
    name: str
    ssid: str | None = None  # Made optional since API may not always return it
    enabled: bool = True
    type: str | None = None  # API returns type like "__STANDARD"
    site_id: str | None = Field(default=None, alias="siteId")
    network_id: str | None = Field(default=None, alias="networkId")
    security: WifiSecurity | None = None
    passphrase: str | None = None
    hidden: bool = Field(default=False, alias="hideName")
    band: str | None = None
    channel_width: int | None = Field(default=None, alias="channelWidth")
    minimum_data_rate_2g: int | None = Field(default=None, alias="minimumDataRate2g")
    minimum_data_rate_5g: int | None = Field(default=None, alias="minimumDataRate5g")
    mac_filter_enabled: bool = Field(default=False, alias="macFilterEnabled")
    mac_filter_policy: str | None = Field(default=None, alias="macFilterPolicy")
    mac_filter_list: list[str] = Field(default_factory=list, alias="macFilterList")
    pmf_mode: str | None = Field(default=None, alias="pmfMode")
    group_rekey_interval: int | None = Field(default=None, alias="groupRekeyInterval")
    is_guest: bool = Field(default=False, alias="isGuest")
    # Additional fields from the API
    multicast_to_unicast_conversion_enabled: bool | None = Field(
        default=None, alias="multicastToUnicastConversionEnabled"
    )
    client_isolation_enabled: bool | None = Field(
        default=None, alias="clientIsolationEnabled"
    )
    uapsd_enabled: bool | None = Field(default=None, alias="uapsdEnabled")

    model_config = {"populate_by_name": True, "extra": "allow"}
