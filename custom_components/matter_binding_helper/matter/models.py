"""Data models for Matter operations."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from ..const import (
    ACL_AUTH_MODE_CASE,
    ACL_AUTH_MODE_GROUP,
    ACL_AUTH_MODE_PASE,
    ACL_PRIVILEGE_ADMINISTER,
    ACL_PRIVILEGE_MANAGE,
    ACL_PRIVILEGE_OPERATE,
    ACL_PRIVILEGE_PROXY_VIEW,
    ACL_PRIVILEGE_VIEW,
)


class OperationErrorType(Enum):
    """Error types for Matter operations."""

    SUCCESS = "success"
    PERMISSION_DENIED = "permission_denied"
    DEVICE_UNAVAILABLE = "device_unavailable"
    DEVICE_TIMEOUT = "device_timeout"
    DEVICE_REJECTED = "device_rejected"  # Silent rejection detected via verification
    INVALID_REQUEST = "invalid_request"
    UNKNOWN_ERROR = "unknown_error"


@dataclass
class BindingEntry:
    """Represents a Matter binding entry."""

    node_id: int
    endpoint_id: int
    cluster_id: int
    target_node_id: int | None = None
    target_endpoint_id: int | None = None
    target_group_id: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "node_id": self.node_id,
            "endpoint_id": self.endpoint_id,
            "cluster_id": self.cluster_id,
            "target_node_id": self.target_node_id,
            "target_endpoint_id": self.target_endpoint_id,
            "target_group_id": self.target_group_id,
        }


@dataclass
class ScheduleTransition:
    """Represents a weekly schedule transition entry."""

    transition_time: int  # Minutes from midnight (0-1439)
    heat_setpoint: float | None = None  # Temperature in °C
    cool_setpoint: float | None = None  # Temperature in °C

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "transition_time": self.transition_time,
            "heat_setpoint": self.heat_setpoint,
            "cool_setpoint": self.cool_setpoint,
        }

    @classmethod
    def from_matter(cls, matter_transition: Any) -> "ScheduleTransition":
        """Create from Matter SDK transition struct."""
        # Matter uses 0.01°C units
        heat = matter_transition.heatSetpoint
        cool = matter_transition.coolSetpoint
        return cls(
            transition_time=matter_transition.transitionTime,
            heat_setpoint=heat / 100 if heat is not None else None,
            cool_setpoint=cool / 100 if cool is not None else None,
        )


@dataclass
class WeeklySchedule:
    """Represents a thermostat weekly schedule response."""

    day_of_week: int  # Bitmap: bit 0=Sun, bit 1=Mon, ..., bit 6=Sat, bit 7=Away
    mode: int  # Bitmap: bit 0=Heat, bit 1=Cool
    transitions: list[ScheduleTransition]

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "day_of_week": self.day_of_week,
            "day_names": self._get_day_names(),
            "mode": self.mode,
            "mode_names": self._get_mode_names(),
            "transitions": [t.to_dict() for t in self.transitions],
        }

    def _get_day_names(self) -> list[str]:
        """Get list of day names from bitmap."""
        days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "away",
        ]
        return [days[i] for i in range(8) if self.day_of_week & (1 << i)]

    def _get_mode_names(self) -> list[str]:
        """Get list of mode names from bitmap."""
        modes = []
        if self.mode & 1:
            modes.append("heat")
        if self.mode & 2:
            modes.append("cool")
        return modes


@dataclass
class GroupEntry:
    """Represents a Matter group entry."""

    group_id: int
    name: str
    members: list[dict[str, int]]  # [{"node_id": x, "endpoint_id": y}]

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "group_id": self.group_id,
            "name": self.name,
            "members": self.members,
        }


@dataclass
class ACLTarget:
    """Represents an ACL target restriction."""

    cluster: int | None = None
    endpoint: int | None = None
    device_type: int | None = None

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "cluster": self.cluster,
            "endpoint": self.endpoint,
            "device_type": self.device_type,
        }


@dataclass
class ACLEntry:
    """Represents a Matter Access Control List entry."""

    privilege: int  # 1=View, 2=ProxyView, 3=Operate, 4=Manage, 5=Administer
    auth_mode: int  # 1=PASE, 2=CASE, 3=Group
    subjects: list[int]  # Node IDs or Group IDs (empty = all matching authMode)
    targets: list[ACLTarget]  # Cluster/endpoint restrictions (empty = all)
    fabric_index: int

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "privilege": self.privilege,
            "privilege_name": self._get_privilege_name(),
            "auth_mode": self.auth_mode,
            "auth_mode_name": self._get_auth_mode_name(),
            "subjects": self.subjects,
            "targets": [t.to_dict() for t in self.targets],
            "fabric_index": self.fabric_index,
        }

    def _get_privilege_name(self) -> str:
        """Get human-readable privilege name."""
        names = {
            ACL_PRIVILEGE_VIEW: "View",
            ACL_PRIVILEGE_PROXY_VIEW: "ProxyView",
            ACL_PRIVILEGE_OPERATE: "Operate",
            ACL_PRIVILEGE_MANAGE: "Manage",
            ACL_PRIVILEGE_ADMINISTER: "Administer",
        }
        return names.get(self.privilege, f"Unknown ({self.privilege})")

    def _get_auth_mode_name(self) -> str:
        """Get human-readable auth mode name."""
        names = {
            ACL_AUTH_MODE_PASE: "PASE",
            ACL_AUTH_MODE_CASE: "CASE",
            ACL_AUTH_MODE_GROUP: "Group",
        }
        return names.get(self.auth_mode, f"Unknown ({self.auth_mode})")


@dataclass
class BindingVerificationResult:
    """Result of a binding verification operation."""

    success: bool
    verified: bool  # True if binding was confirmed on device
    message: str
    bindings_found: int = 0
    error_type: OperationErrorType = field(default=OperationErrorType.SUCCESS)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "success": self.success,
            "verified": self.verified,
            "message": self.message,
            "bindings_found": self.bindings_found,
            "error_type": self.error_type.value,
        }


@dataclass
class ACLProvisioningResult:
    """Result of an ACL provisioning operation."""

    success: bool
    message: str
    acl_entries_count: int = 0
    error_type: OperationErrorType = field(default=OperationErrorType.SUCCESS)

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "success": self.success,
            "message": self.message,
            "acl_entries_count": self.acl_entries_count,
            "error_type": self.error_type.value,
        }
