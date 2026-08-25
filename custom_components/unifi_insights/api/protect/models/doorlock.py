"""Door lock models for UniFi Protect API.

The 7.1.87 integration REST API does not expose a dedicated ``/doorlocks``
resource; door locks are surfaced through the ``doorlock`` WebSocket
``modelKey`` (see ``WS_DEVICE_UPDATE_TYPES``). This tolerant model is used to
parse those WebSocket payloads.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class DoorLock(BaseModel):
    """Model representing a UniFi Protect door lock (WebSocket-only)."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    lock_state: str | None = Field(default=None, alias="lockState")
    battery_status: dict[str, Any] | None = Field(default=None, alias="batteryStatus")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the door lock."""
        return self.name or self.mac or self.id
