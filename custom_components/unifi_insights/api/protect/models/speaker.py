"""Speaker models for UniFi Protect API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Speaker(BaseModel):
    """Model representing a UniFi Protect speaker."""

    id: str
    model_key: str | None = Field(default=None, alias="modelKey")
    state: str | None = None
    name: str | None = None
    mac: str | None = None
    volume: int | None = None
    mic_volume: int | None = Field(default=None, alias="micVolume")
    is_mic_enabled: bool | None = Field(default=None, alias="isMicEnabled")
    speaker_state: dict[str, Any] | str | None = Field(
        default=None, alias="speakerState"
    )
    feature_flags: dict[str, Any] | None = Field(default=None, alias="featureFlags")

    model_config = {"populate_by_name": True, "extra": "allow"}

    @property
    def display_name(self) -> str:
        """Get the display name for the speaker."""
        return self.name or self.mac or self.id
