"""LiveView models for UniFi Protect API."""

from __future__ import annotations

from pydantic import BaseModel, Field


class LiveViewSlot(BaseModel):
    """Model representing a slot in a live view layout."""

    camera_id: str | None = Field(default=None, alias="cameraId")
    cycle_mode: str | None = Field(default=None, alias="cycleMode")
    cycle_interval: int | None = Field(default=None, alias="cycleInterval")
    camera_ids: list[str] = Field(default_factory=list, alias="cameraIds")

    model_config = {"populate_by_name": True, "extra": "allow"}


class LiveView(BaseModel):
    """Model representing a UniFi Protect live view configuration."""

    id: str
    name: str
    is_default: bool = Field(default=False, alias="isDefault")
    is_global_default: bool = Field(default=False, alias="isGlobalDefault")
    layout: int = 1
    owner: str | None = None
    slots: list[LiveViewSlot] = Field(default_factory=list)

    model_config = {"populate_by_name": True, "extra": "allow"}
