"""Constants for Matter Binding Helper integration."""

DOMAIN = "matter_binding_helper"

# Config options
CONF_DEMO_MODE = "demo_mode"
DEFAULT_DEMO_MODE = False
CONF_TELEMETRY_ENABLED = "telemetry_enabled"
DEFAULT_TELEMETRY_ENABLED = True  # Opt-out model: enabled by default

# Telemetry settings
TELEMETRY_URL = "https://matter-survey.org/api/submit"
TELEMETRY_INTERVAL_HOURS = 168  # Weekly (7 days * 24 hours)
TELEMETRY_INITIAL_DELAY_MINUTES = 5  # Wait before first submission

# Panel
PANEL_URL = "/matter-binding-helper"
PANEL_TITLE = "Matter Bindings"
PANEL_ICON = "mdi:link-variant"
PANEL_NAME = "matter-binding-helper-panel"

# WebSocket commands
WS_TYPE_LIST_NODES = f"{DOMAIN}/list_nodes"
WS_TYPE_LIST_BINDINGS = f"{DOMAIN}/list_bindings"
WS_TYPE_CREATE_BINDING = f"{DOMAIN}/create_binding"
WS_TYPE_DELETE_BINDING = f"{DOMAIN}/delete_binding"
WS_TYPE_VERIFY_BINDINGS = f"{DOMAIN}/verify_bindings"
WS_TYPE_LIST_GROUPS = f"{DOMAIN}/list_groups"
WS_TYPE_CREATE_GROUP = f"{DOMAIN}/create_group"
WS_TYPE_DELETE_GROUP = f"{DOMAIN}/delete_group"
WS_TYPE_ADD_TO_GROUP = f"{DOMAIN}/add_to_group"
WS_TYPE_REMOVE_FROM_GROUP = f"{DOMAIN}/remove_from_group"

# Matter cluster IDs for bindings
CLUSTER_BINDING = 0x001E  # Binding cluster
CLUSTER_ON_OFF = 0x0006
CLUSTER_LEVEL_CONTROL = 0x0008
CLUSTER_COLOR_CONTROL = 0x0300
CLUSTER_SCENES = 0x0005
CLUSTER_DESCRIPTOR = 0x001D  # Descriptor cluster
CLUSTER_THERMOSTAT = 0x0201  # Thermostat cluster
CLUSTER_ACCESS_CONTROL = 0x001F  # Access Control cluster

# WebSocket commands for thermostat schedules
WS_TYPE_GET_SCHEDULE = f"{DOMAIN}/get_schedule"
WS_TYPE_SET_SCHEDULE = f"{DOMAIN}/set_schedule"
WS_TYPE_CLEAR_SCHEDULE = f"{DOMAIN}/clear_schedule"

# Descriptor cluster attribute IDs
ATTR_DEVICE_TYPE_LIST = 0  # DeviceTypeList
ATTR_SERVER_LIST = 1  # ServerList - cluster IDs this endpoint implements as server
ATTR_CLIENT_LIST = 2  # ClientList - cluster IDs this endpoint implements as client
ATTR_PARTS_LIST = 3  # PartsList - child endpoints

# Global cluster attribute IDs (apply to all clusters)
ATTR_FEATURE_MAP = 0xFFFC  # 65532 - Bitmask of cluster features
ATTR_ATTRIBUTE_LIST = 0xFFFB  # 65531 - List of attribute IDs supported by cluster
ATTR_ACCEPTED_COMMAND_LIST = 0xFFF9  # 65529 - List of commands the cluster accepts
ATTR_GENERATED_COMMAND_LIST = 0xFFF8  # 65528 - List of commands the cluster generates

# Thermostat cluster command IDs
CMD_SET_WEEKLY_SCHEDULE = 0x01
CMD_GET_WEEKLY_SCHEDULE = 0x02
CMD_CLEAR_WEEKLY_SCHEDULE = 0x03

# Access Control cluster
WS_TYPE_LIST_ACL = f"{DOMAIN}/list_acl"
WS_TYPE_PROVISION_ACL = f"{DOMAIN}/provision_acl"
WS_TYPE_REMOVE_ACL = f"{DOMAIN}/remove_acl"
WS_TYPE_PROVISION_ACL_FOR_BINDINGS = f"{DOMAIN}/provision_acl_for_bindings"
WS_TYPE_CREATE_AUTOMATION = f"{DOMAIN}/create_automation"
ATTR_ACL = 0  # ACL attribute ID

# ACL privilege levels
ACL_PRIVILEGE_VIEW = 1
ACL_PRIVILEGE_PROXY_VIEW = 2
ACL_PRIVILEGE_OPERATE = 3
ACL_PRIVILEGE_MANAGE = 4
ACL_PRIVILEGE_ADMINISTER = 5

# ACL auth modes
ACL_AUTH_MODE_PASE = 1  # Commissioning
ACL_AUTH_MODE_CASE = 2  # Device-to-device (certificate)
ACL_AUTH_MODE_GROUP = 3  # Group messaging

# ACL provisioning progress events
EVENT_ACL_PROGRESS = f"{DOMAIN}_acl_progress"
ACL_VERIFY_TIMEOUT = 30  # seconds
ACL_VERIFY_INTERVAL = 2  # seconds

# Cluster-to-privilege mapping for bindings
# Maps cluster IDs to the minimum privilege required to operate on them
CLUSTER_DOOR_LOCK = 0x0101
CLUSTER_PRIVILEGE_MAP: dict[int, int] = {
    CLUSTER_ON_OFF: ACL_PRIVILEGE_OPERATE,
    CLUSTER_LEVEL_CONTROL: ACL_PRIVILEGE_OPERATE,
    CLUSTER_COLOR_CONTROL: ACL_PRIVILEGE_OPERATE,
    CLUSTER_THERMOSTAT: ACL_PRIVILEGE_OPERATE,
    CLUSTER_SCENES: ACL_PRIVILEGE_OPERATE,
    CLUSTER_DOOR_LOCK: ACL_PRIVILEGE_OPERATE,
}
DEFAULT_CLUSTER_PRIVILEGE = ACL_PRIVILEGE_OPERATE
