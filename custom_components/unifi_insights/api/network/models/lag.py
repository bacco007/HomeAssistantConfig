"""Link Aggregation Group (LAG) models for UniFi Network API."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class LagType(str, Enum):
    """Type of a link aggregation group."""

    LOCAL = "LOCAL"
    MULTI_CHASSIS = "MULTI_CHASSIS"
    SWITCH_STACK = "SWITCH_STACK"


class McLagRole(str, Enum):
    """Role of a device inside a multi-chassis LAG domain."""

    TOP = "TOP"
    BOTTOM = "BOTTOM"


class LagMember(BaseModel):
    """A device/port membership entry of a LAG."""

    device_id: str | None = Field(default=None, alias="deviceId")
    port_idxs: list[int] = Field(default_factory=list, alias="portIdxs")

    model_config = {"populate_by_name": True, "extra": "allow"}


class LAG(BaseModel):
    """
    Model representing a link aggregation group.

    Covers ``LOCAL``, ``MULTI_CHASSIS`` and ``SWITCH_STACK`` LAG variants; the
    variant-specific ``mc_lag_domain_id`` / ``switch_stack_id`` references are
    optional and only present for their respective types.
    """

    id: str
    type: LagType | str | None = None
    members: list[LagMember] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None
    mc_lag_domain_id: str | None = Field(default=None, alias="mcLagDomainId")
    switch_stack_id: str | None = Field(default=None, alias="switchStackId")

    model_config = {"populate_by_name": True, "extra": "allow"}


class McLagPeer(BaseModel):
    """A peer device participating in a multi-chassis LAG domain."""

    device_id: str | None = Field(default=None, alias="deviceId")
    link_port_idxs: list[int] = Field(default_factory=list, alias="linkPortIdxs")
    role: McLagRole | str | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class McLagLocalLag(BaseModel):
    """A LAG that belongs to a multi-chassis LAG domain."""

    id: str
    members: list[LagMember] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}


class McLagDomain(BaseModel):
    """Model representing a multi-chassis (MC-LAG) domain."""

    id: str
    name: str | None = None
    lags: list[McLagLocalLag] = Field(default_factory=list)
    peers: list[McLagPeer] = Field(default_factory=list)
    metadata: dict[str, Any] | None = None

    model_config = {"populate_by_name": True, "extra": "allow"}
