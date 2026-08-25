"""Relay models for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Relay(BaseModel):
    """Model representing a UniFi Protect relay."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    led_settings: dict[str, Any] | None = Field(default=None, alias="ledSettings")
    outputs: list[dict[str, Any]] = Field(default_factory=list)
    inputs: list[dict[str, Any]] = Field(default_factory=list)
    wireless_connection_state: dict[str, Any] | None = Field(
        default=None, alias="wirelessConnectionState"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the relay."""
        return self.name or self.mac or self.id
