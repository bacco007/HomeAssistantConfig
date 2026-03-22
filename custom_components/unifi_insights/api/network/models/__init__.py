"""Pydantic models for UniFi Network API."""

from __future__ import annotations

from .acl import (
    ACLAction,
    ACLDestinationFilter,
    ACLDeviceFilter,
    ACLMetadata,
    ACLRule,
    ACLRuleOrdering,
    ACLRuleType,
    ACLSourceFilter,
    MetadataOrigin,
)
from .application import ApplicationInfo
from .client import Client, ClientType
from .device import (
    Device,
    DevicePort,
    DeviceState,
    DeviceType,
    LegacyPortMetrics,
    PortBytesMetrics,
)
from .dns import DNSPolicy, DNSPolicyMetadata, DNSRecordType
from .firewall import (
    FirewallActionConfig,
    FirewallPolicyOrdering,
    FirewallRule,
    FirewallZone,
    OrderedFirewallPolicyIds,
)
from .network import Network, NetworkPurpose, NetworkType
from .resources import (
    DeviceTag,
    RADIUSProfile,
    VPNServer,
    VPNServerType,
    VPNTunnel,
    VPNTunnelStatus,
    WANInterface,
    WANStatus,
)
from .site import Site, SiteHealth
from .traffic import (
    Country,
    DPIApplication,
    DPICategory,
    TrafficMatchingList,
    TrafficMatchingType,
)
from .voucher import Voucher, VoucherCreateRequest
from .wifi import WifiNetwork, WifiSecurity

__all__ = [
    # Application
    "ApplicationInfo",
    # ACL
    "ACLAction",
    "ACLDestinationFilter",
    "ACLDeviceFilter",
    "ACLMetadata",
    "ACLRule",
    "ACLRuleOrdering",
    "ACLRuleType",
    "ACLSourceFilter",
    "MetadataOrigin",
    # Client
    "Client",
    "ClientType",
    # Device
    "Device",
    "DevicePort",
    "DeviceState",
    "DeviceType",
    "LegacyPortMetrics",
    "PortBytesMetrics",
    # DNS
    "DNSPolicy",
    "DNSPolicyMetadata",
    "DNSRecordType",
    # Firewall
    "FirewallActionConfig",
    "FirewallPolicyOrdering",
    "FirewallRule",
    "FirewallZone",
    "OrderedFirewallPolicyIds",
    # Network
    "Network",
    "NetworkPurpose",
    "NetworkType",
    # Resources
    "DeviceTag",
    "RADIUSProfile",
    "VPNServer",
    "VPNServerType",
    "VPNTunnel",
    "VPNTunnelStatus",
    "WANInterface",
    "WANStatus",
    # Site
    "Site",
    "SiteHealth",
    # Traffic
    "Country",
    "DPIApplication",
    "DPICategory",
    "TrafficMatchingList",
    "TrafficMatchingType",
    # Voucher
    "Voucher",
    "VoucherCreateRequest",
    # WiFi
    "WifiNetwork",
    "WifiSecurity",
]
