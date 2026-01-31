"""Matter client abstraction for dependency injection.

Provides a protocol for Matter operations that can be implemented
by either a real Matter client or a demo client for testing.
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant

from .demo import is_demo_mode

if TYPE_CHECKING:
    from matter_server.client import MatterClient as RealMatterServerClient

_LOGGER = logging.getLogger(__name__)


class MatterClientProtocol(ABC):
    """Protocol for Matter client operations.

    This abstract base class defines the interface for Matter operations.
    Implementations can wrap the real Matter client or provide mock data.
    """

    @abstractmethod
    def get_nodes(self) -> list[Any]:
        """Get all Matter nodes on the fabric."""
        ...

    @abstractmethod
    async def read_attribute(
        self,
        node_id: int,
        attribute_path: str,
    ) -> Any:
        """Read an attribute from a node."""
        ...

    @abstractmethod
    async def write_attribute(
        self,
        node_id: int,
        attribute_path: str,
        value: Any,
    ) -> Any:
        """Write an attribute to a node."""
        ...

    @abstractmethod
    async def send_command(
        self,
        node_id: int,
        endpoint_id: int,
        command: Any,
    ) -> Any:
        """Send a command to a node."""
        ...

    @abstractmethod
    async def send_device_command(
        self,
        node_id: int,
        endpoint_id: int,
        command: Any,
    ) -> Any:
        """Send a device command to a node."""
        ...


class RealMatterClient(MatterClientProtocol):
    """Wraps the actual python-matter-server client."""

    def __init__(self, client: "RealMatterServerClient"):
        """Initialize with the real Matter client."""
        self._client = client

    @property
    def raw_client(self) -> "RealMatterServerClient":
        """Get the underlying raw Matter client."""
        return self._client

    def get_nodes(self) -> list[Any]:
        """Get all Matter nodes on the fabric."""
        return self._client.get_nodes()

    async def read_attribute(
        self,
        node_id: int,
        attribute_path: str,
    ) -> Any:
        """Read an attribute from a node."""
        return await self._client.read_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
        )

    async def write_attribute(
        self,
        node_id: int,
        attribute_path: str,
        value: Any,
    ) -> Any:
        """Write an attribute to a node."""
        return await self._client.write_attribute(
            node_id=node_id,
            attribute_path=attribute_path,
            value=value,
        )

    async def send_command(
        self,
        node_id: int,
        endpoint_id: int,
        command: Any,
    ) -> Any:
        """Send a command to a node."""
        return await self._client.send_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )

    async def send_device_command(
        self,
        node_id: int,
        endpoint_id: int,
        command: Any,
    ) -> Any:
        """Send a device command to a node."""
        return await self._client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=command,
        )


def get_raw_matter_client(hass: HomeAssistant) -> "RealMatterServerClient | None":
    """Get the raw Matter client from Home Assistant.

    This returns the actual python-matter-server client instance,
    not the wrapped protocol. Use get_client() for the protocol version.
    """
    try:
        from homeassistant.components.matter import DOMAIN as MATTER_DOMAIN
    except ImportError:
        return None

    if MATTER_DOMAIN not in hass.data:
        return None

    # Get the first Matter entry data
    matter_data = hass.data.get(MATTER_DOMAIN)
    if not matter_data:
        return None

    # Matter stores data by config entry ID
    for entry_data in matter_data.values():
        if hasattr(entry_data, "matter_client"):
            return entry_data.matter_client
        # Fallback for different HA versions
        if hasattr(entry_data, "adapter") and hasattr(
            entry_data.adapter, "matter_client"
        ):
            return entry_data.adapter.matter_client

    return None


def get_client(hass: HomeAssistant) -> MatterClientProtocol | None:
    """Get a Matter client for operations.

    Factory function that returns the appropriate client implementation:
    - In demo mode: Returns None (caller should use demo functions directly)
    - In normal mode: Returns a RealMatterClient wrapping the HA Matter client

    Args:
        hass: Home Assistant instance

    Returns:
        MatterClientProtocol implementation or None if not available
    """
    if is_demo_mode(hass):
        _LOGGER.debug("Demo mode enabled, returning None for client")
        return None

    raw_client = get_raw_matter_client(hass)
    if raw_client is None:
        return None

    return RealMatterClient(raw_client)


# Backwards compatibility alias
get_matter_client = get_raw_matter_client
