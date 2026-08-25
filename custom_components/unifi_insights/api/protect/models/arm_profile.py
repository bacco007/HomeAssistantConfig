"""Arm profile models for UniFi Protect API."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ArmProfile(BaseModel):
    """Model representing a UniFi Protect arm profile."""

    id: str
    name: str | None = None
    automations: list[dict[str, Any]] | dict[str, Any] | None = None
    creator: str | None = None
    schedules: list[dict[str, Any]] | dict[str, Any] | None = None
    record_everything: bool | None = Field(default=None, alias="recordEverything")
    activation_delay: int | None = Field(default=None, alias="activationDelay")
    created_at: datetime | None = Field(default=None, alias="createdAt")
    updated_at: datetime | None = Field(default=None, alias="updatedAt")

    model_config = {"populate_by_name": True, "extra": "allow"}
