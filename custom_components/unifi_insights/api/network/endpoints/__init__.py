"""Endpoint modules for UniFi Network API."""

from __future__ import annotations

from .acl import ACLEndpoint
from .clients import ClientsEndpoint
from .devices import DevicesEndpoint
from .dns import DNSEndpoint
from .firewall import FirewallEndpoint
from .networks import NetworksEndpoint
from .resources import ResourcesEndpoint
from .sites import SitesEndpoint
from .traffic import TrafficEndpoint
from .vouchers import VouchersEndpoint
from .wifi import WifiEndpoint

__all__ = [
    "ACLEndpoint",
    "ClientsEndpoint",
    "DNSEndpoint",
    "DevicesEndpoint",
    "FirewallEndpoint",
    "NetworksEndpoint",
    "ResourcesEndpoint",
    "SitesEndpoint",
    "TrafficEndpoint",
    "VouchersEndpoint",
    "WifiEndpoint",
]
