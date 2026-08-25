"""Switch stack models for UniFi Network API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from .lag import LagMember


class SwitchStackMember(BaseModel):
    """A device that is a member of a switch stack."""

    device_id: str | None = Field(default=None, alias="deviceId")

    model_config = {"populate_by_name": True, "extra": "allow"}


class SwitchStackLag(BaseModel):
    """A LAG that is local to a switch stack."""

    id: str
    members: list[LagMember] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class SwitchStack(BaseModel):
    """Model representing a switch stack."""

    id: str
    name: str | None = None
    members: list[SwitchStackMember] = Field(default_factory=list)
    lags: list[SwitchStackLag] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}
