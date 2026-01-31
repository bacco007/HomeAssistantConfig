"""Matter operations package.

This package provides modular access to Matter device operations:
- models: Data classes for Matter entities
- client: Matter client protocol and factory
- demo: Demo mode infrastructure
- nodes: Node discovery and info extraction
- bindings: Binding CRUD operations
- acl: Access Control List operations
- thermostat: Thermostat schedule operations
- groups: Group operations (stubs)
- proprietary: Proprietary attribute operations
- ha_registry: Home Assistant registry integration
- utils: Error handling and utilities
"""

# Re-export public API for convenience
from .models import (
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

from .client import (
    MatterClientProtocol,
    RealMatterClient,
    get_client,
    get_matter_client,
    get_raw_matter_client,
)

from .demo import (
    is_demo_mode,
    get_demo_nodes,
    get_demo_bindings,
    get_demo_acl,
)

from .nodes import (
    get_nodes,
    get_node_name,
    get_device_info,
    get_endpoints_info,
)

from .ha_registry import (
    get_entities_for_device,
    get_ha_device_info,
)

from .utils import (
    parse_error_type,
    get_user_friendly_error,
    check_node_available,
    binding_matches,
    get_cluster_privilege,
)

from .bindings import (
    get_bindings,
    create_binding,
    delete_binding,
    verify_bindings,
    provision_acls_for_existing_bindings,
)

from .acl import (
    get_acl,
    write_acl,
    add_acl_entry,
    remove_acl_entry,
    provision_acl_for_binding,
    acl_entry_exists,
    build_acl_entry_for_binding,
)

from .thermostat import (
    get_thermostat_schedule,
    set_thermostat_schedule,
    clear_thermostat_schedule,
    has_thermostat_schedule_feature,
    supports_thermostat_schedule,
    get_cluster_accepted_commands,
)

from .groups import (
    get_groups,
    create_group,
    delete_group,
    add_to_group,
    remove_from_group,
)

from .proprietary import (
    get_proprietary_attributes,
)

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
