"""Fob models for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Fob(BaseModel):
    """Model representing a UniFi Protect key fob."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    away_state: str | None = Field(default=None, alias="awayState")
    button_labels: dict[str, Any] | list[Any] | None = Field(
        default=None, alias="buttonLabels"
    )
    feature_flags: dict[str, Any] | None = Field(default=None, alias="featureFlags")
    wireless_connection_state: dict[str, Any] | None = Field(
        default=None, alias="wirelessConnectionState"
    )

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the fob."""
        return self.name or self.mac or self.id
