"""Viewer models for UniFi Protect API."""

from __future__ import annotations

import logging
from enum import Enum

from pydantic import BaseModel, Field

_LOGGER = logging.getLogger(__name__)


class ViewerState(str, Enum):
    """Viewer connection state."""

    CONNECTED = "CONNECTED"
    CONNECTING = "CONNECTING"
    DISCONNECTED = "DISCONNECTED"
    UNKNOWN = "UNKNOWN"

    @classmethod
    def _missing_(cls, value: object) -> ViewerState:
        """Map unrecognized states to ``UNKNOWN`` instead of raising."""
        _LOGGER.debug("Unknown ViewerState value %r; mapping to UNKNOWN", value)
        return cls.UNKNOWN


class Viewer(BaseModel):
    """UniFi Protect Viewer model."""

    id: str = Field(..., description="Viewer primary key")
    model_key: str = Field("viewer", alias="modelKey")
    state: ViewerState = Field(..., description="Connection state")
    name: str | None = Field(None, description="Viewer name")
    mac: str = Field(..., description="MAC address")
    liveview: str | None = Field(None, description="Associated liveview ID")
    stream_limit: int = Field(
        4, alias="streamLimit", description="Max parallel streams"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get display name, falling back to MAC if no name set."""
        return self.name if self.name else self.mac

    @property
    def is_connected(self) -> bool:
        """Check if viewer is connected."""
        return self.state == ViewerState.CONNECTED
