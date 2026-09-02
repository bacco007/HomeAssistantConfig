"""Endpoint modules for UniFi Network API."""

from __future__ import annotations

from .acl import ACLEndpoint
from .clients import ClientsEndpoint
from .devices import DevicesEndpoint
from .dns import DNSEndpoint
from .firewall import FirewallEndpoint
from .lags import LagsEndpoint
from .networks import NetworksEndpoint
from .resources import ResourcesEndpoint
from .routes import RoutesEndpoint
from .sites import SitesEndpoint
from .stacks import StacksEndpoint
from .traffic import TrafficEndpoint
from .vouchers import VouchersEndpoint
from .vpn_clients import VpnClientsEndpoint
from .wifi import WifiEndpoint

__all__ = [
    "ACLEndpoint",
    "ClientsEndpoint",
    "DNSEndpoint",
    "DevicesEndpoint",
    "FirewallEndpoint",
    "LagsEndpoint",
    "NetworksEndpoint",
    "ResourcesEndpoint",
    "RoutesEndpoint",
    "SitesEndpoint",
    "StacksEndpoint",
    "TrafficEndpoint",
    "VouchersEndpoint",
    "VpnClientsEndpoint",
    "WifiEndpoint",
]
