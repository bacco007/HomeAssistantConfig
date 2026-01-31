"""Matter server client for binding operations.

This module is a backwards-compatible facade that re-exports all public API
from the matter/ subpackage. All functionality has been refactored into
focused modules for better testability and maintainability.

Module structure:
- matter/models.py: Data classes (BindingEntry, ACLEntry, etc.)
- matter/client.py: Matter client protocol and factory
- matter/demo.py: Demo mode infrastructure
- matter/nodes.py: Node discovery and info extraction
- matter/bindings.py: Binding CRUD operations
- matter/acl.py: Access Control List operations
- matter/thermostat.py: Thermostat schedule operations
- matter/groups.py: Group operations (stubs)
- matter/proprietary.py: Proprietary attribute operations
- matter/ha_registry.py: Home Assistant registry integration
- matter/utils.py: Error handling and utilities
"""

from __future__ import annotations

# Re-export all public API from matter/ subpackage
# This maintains backwards compatibility for existing imports

# Models - data classes
from .matter.models import (
    ACLEntry,
    ACLProvisioningResult,
    ACLTarget,
    BindingEntry,
    BindingVerificationResult,
    GroupEntry,
    OperationErrorType,
    ScheduleTransition,
    WeeklySchedule,
)

# Client - Matter client protocol and factory
from .matter.client import (
    MatterClientProtocol,
    RealMatterClient,
    get_client,
    get_matter_client,
    get_raw_matter_client,
)

# Demo - demo mode infrastructure
from .matter.demo import (
    get_demo_acl,
    get_demo_bindings,
    get_demo_nodes,
    is_demo_mode,
)

# Nodes - node discovery and info extraction
from .matter.nodes import (
    get_device_info,
    get_endpoints_info,
    get_node_name,
    get_nodes,
)

# HA Registry - Home Assistant device/entity/area registry integration
from .matter.ha_registry import (
    get_entities_for_device,
    get_ha_device_info,
)

# Utils - error handling and utilities
from .matter.utils import (
    binding_matches,
    check_node_available,
    get_cluster_privilege,
    get_user_friendly_error,
    parse_error_type,
)

# Bindings - binding CRUD operations
from .matter.bindings import (
    create_binding,
    delete_binding,
    get_bindings,
    provision_acls_for_existing_bindings,
    verify_bindings,
)

# ACL - Access Control List operations
from .matter.acl import (
    acl_entry_exists,
    add_acl_entry,
    build_acl_entry_for_binding,
    get_acl,
    provision_acl_for_binding,
    remove_acl_entry,
    write_acl,
)

# Thermostat - schedule operations
from .matter.thermostat import (
    clear_thermostat_schedule,
    get_cluster_accepted_commands,
    get_thermostat_schedule,
    has_thermostat_schedule_feature,
    set_thermostat_schedule,
    supports_thermostat_schedule,
)

# Groups - group operations (stubs)
from .matter.groups import (
    add_to_group,
    create_group,
    delete_group,
    get_groups,
    remove_from_group,
)

# Proprietary - vendor-specific attribute operations
from .matter.proprietary import (
    get_proprietary_attributes,
)

# Backwards compatibility aliases (underscore-prefixed versions)
_is_demo_mode = is_demo_mode
_get_demo_nodes = get_demo_nodes
_parse_error_type = parse_error_type
_get_user_friendly_error = get_user_friendly_error
_check_node_available = check_node_available
_binding_matches = binding_matches
_get_entities_for_device = get_entities_for_device
_get_ha_device_info = get_ha_device_info

__all__ = [
    # Models
    "ACLEntry",
    "ACLProvisioningResult",
    "ACLTarget",
    "BindingEntry",
    "BindingVerificationResult",
    "GroupEntry",
    "OperationErrorType",
    "ScheduleTransition",
    "WeeklySchedule",
    # Client
    "MatterClientProtocol",
    "RealMatterClient",
    "get_client",
    "get_matter_client",
    "get_raw_matter_client",
    # Demo
    "is_demo_mode",
    "get_demo_nodes",
    "get_demo_bindings",
    "get_demo_acl",
    # Nodes
    "get_nodes",
    "get_node_name",
    "get_device_info",
    "get_endpoints_info",
    # HA Registry
    "get_entities_for_device",
    "get_ha_device_info",
    # Utils
    "parse_error_type",
    "get_user_friendly_error",
    "check_node_available",
    "binding_matches",
    "get_cluster_privilege",
    # Bindings
    "get_bindings",
    "create_binding",
    "delete_binding",
    "verify_bindings",
    "provision_acls_for_existing_bindings",
    # ACL
    "get_acl",
    "write_acl",
    "add_acl_entry",
    "remove_acl_entry",
    "provision_acl_for_binding",
    "acl_entry_exists",
    "build_acl_entry_for_binding",
    # Thermostat
    "get_thermostat_schedule",
    "set_thermostat_schedule",
    "clear_thermostat_schedule",
    "has_thermostat_schedule_feature",
    "supports_thermostat_schedule",
    "get_cluster_accepted_commands",
    # Groups
    "get_groups",
    "create_group",
    "delete_group",
    "add_to_group",
    "remove_from_group",
    # Proprietary
    "get_proprietary_attributes",
]
