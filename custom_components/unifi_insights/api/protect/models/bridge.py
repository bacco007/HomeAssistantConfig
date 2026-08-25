"""Bridge models for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Bridge(BaseModel):
    """Model representing a UniFi Protect bridge."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    platform: str | None = None
    clients: list[dict[str, Any]] = Field(default_factory=list)
    max_clients: int | None = Field(default=None, alias="maxClients")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the bridge."""
        return self.name or self.mac or self.id
