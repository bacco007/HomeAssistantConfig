"""Viewport models for UniFi Protect API.

The 7.1.87 integration REST API does not expose a dedicated ``/viewports``
resource; viewports are surfaced through the ``viewport`` WebSocket
``modelKey`` (see ``WS_DEVICE_UPDATE_TYPES``). This tolerant model is used to
parse those WebSocket payloads.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class Viewport(BaseModel):
    """Model representing a UniFi Protect viewport (WebSocket-only)."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    liveview: str | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the viewport."""
        return self.name or self.mac or self.id
