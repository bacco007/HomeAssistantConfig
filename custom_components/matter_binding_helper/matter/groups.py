"""Group operations for Matter devices.

Two backends:
- Demo mode: in-memory store so the UI works without hardware.
- Real fabric: groups are tracked in the persistent GroupStore (names + group
  keys), membership is provisioned on devices via Group Key Management
  (``KeySetWrite`` + ``GroupKeyMap``) followed by the Groups cluster
  (``AddGroup`` / ``RemoveGroup``). Matter has no "create group" command — a
  group exists once a device holds its key material and is added to it — so
  create/delete operate on the registry and add/remove touch the devices.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from ..const import CLUSTER_GROUPS, EVENT_GROUP_PROGRESS
from .acl import provision_group_acl, remove_group_acl
from .client import get_client
from .demo import (
    add_demo_group_member,
    create_demo_group,
    delete_demo_group,
    get_demo_groups,
    is_demo_mode,
    remove_demo_group_member,
)
from .group_keys import provision_group_key
from .group_store import get_group_store
from .models import GroupEntry, GroupOperationResult

_LOGGER = logging.getLogger(__name__)

# Stable error codes surfaced to the frontend.
GROUP_NOT_SUPPORTED_CODE = "not_supported"
GROUP_ALREADY_EXISTS_CODE = "already_exists"
GROUP_NOT_FOUND_CODE = "not_found"
GROUP_DEVICE_ERROR_CODE = "device_error"
GROUP_NOT_SUPPORTED_MESSAGE = (
    "Matter group management is not available (Matter client not connected)."
)


def _client_unavailable() -> GroupOperationResult:
    return GroupOperationResult(
        success=False,
        message=GROUP_NOT_SUPPORTED_MESSAGE,
        error_code="client_unavailable",
    )


# Matter limits group names to 16 characters; a longer name makes a device reject
# AddGroup with CONSTRAINT_ERROR (0x87). The full name is kept in our registry.
MAX_GROUP_NAME_LEN = 16


def device_group_name(name: str) -> str:
    """Clamp a group name to the Matter 16-char limit for on-device storage."""
    return name[:MAX_GROUP_NAME_LEN]


def _add_group_command(group_id: int, name: str) -> Any:
    """Build the chip Groups.AddGroup command (chip imported lazily)."""
    from chip.clusters import Objects as clusters

    return clusters.Groups.Commands.AddGroup(
        groupID=group_id, groupName=device_group_name(name)
    )


def _remove_group_command(group_id: int) -> Any:
    """Build the chip Groups.RemoveGroup command (chip imported lazily)."""
    from chip.clusters import Objects as clusters

    return clusters.Groups.Commands.RemoveGroup(groupID=group_id)


def _response_status(response: Any) -> int | None:
    """Extract the status field from a Groups command response (0 = success)."""
    if response is None:
        return None
    if isinstance(response, dict):
        val = response.get("status", response.get("0"))
    else:
        val = getattr(response, "status", None)
    try:
        return int(val) if val is not None else None
    except (TypeError, ValueError):
        return None


async def get_groups(hass: HomeAssistant) -> list[GroupEntry]:
    """Get all Matter groups (from the registry, or demo store in demo mode)."""
    if is_demo_mode(hass):
        return get_demo_groups()

    store = get_group_store(hass)
    await store.async_load()
    return [
        GroupEntry(
            group_id=r.group_id,
            name=r.name,
            members=list(r.members),
            clusters=list(r.clusters),
        )
        for r in store.list_groups()
    ]


async def create_group(
    hass: HomeAssistant,
    group_id: int | None,
    name: str,
    clusters: list[int] | None = None,
) -> GroupOperationResult:
    """Create a new Matter group (allocates a group key set in the registry).

    ``group_id`` is optional; when None the next free id is allocated so users
    don't have to invent a Matter group id. ``clusters`` records what the group is
    meant to control — the type authority for member filtering and binding
    defaults, since Matter groups themselves are untyped.
    """
    if is_demo_mode(hass):
        assigned = create_demo_group(group_id, name, clusters)
        if assigned is None:
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} already exists",
                error_code=GROUP_ALREADY_EXISTS_CODE,
            )
        return GroupOperationResult(
            success=True, message=f"Created group {assigned}", group_id=assigned
        )

    store = get_group_store(hass)
    await store.async_load()
    if group_id is not None and store.get_group(group_id) is not None:
        return GroupOperationResult(
            success=False,
            message=f"Group {group_id} already exists",
            error_code=GROUP_ALREADY_EXISTS_CODE,
        )
    record = await store.async_create_group(group_id, name, clusters)
    return GroupOperationResult(
        success=True,
        message=f"Created group {record.group_id}",
        group_id=record.group_id,
    )


async def delete_group(hass: HomeAssistant, group_id: int) -> GroupOperationResult:
    """Delete a Matter group, best-effort removing it from member devices."""
    if is_demo_mode(hass):
        if not delete_demo_group(group_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(success=True, message=f"Deleted group {group_id}")

    store = get_group_store(hass)
    await store.async_load()
    record = store.get_group(group_id)
    if record is None:
        return GroupOperationResult(
            success=False,
            message=f"Group {group_id} not found",
            error_code=GROUP_NOT_FOUND_CODE,
        )

    client = get_client(hass)
    if client:
        for member in record.members:
            try:
                await client.send_device_command(
                    node_id=member["node_id"],
                    endpoint_id=member["endpoint_id"],
                    command=_remove_group_command(group_id),
                )
            except Exception as err:  # noqa: BLE001 - best-effort cleanup
                _LOGGER.warning(
                    "delete_group: RemoveGroup failed on node %s ep %s: %s",
                    member["node_id"],
                    member["endpoint_id"],
                    err,
                )

    await store.async_delete_group(group_id)
    return GroupOperationResult(success=True, message=f"Deleted group {group_id}")


async def add_to_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> GroupOperationResult:
    """Add an endpoint to a group.

    Provisions the group key on the node (prerequisite), then issues
    ``Groups.AddGroup`` and records membership.
    """
    if is_demo_mode(hass):
        if not add_demo_group_member(group_id, node_id, endpoint_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(
            success=True,
            message=f"Added node {node_id} endpoint {endpoint_id} to group {group_id}",
        )

    store = get_group_store(hass)
    await store.async_load()
    record = store.get_group(group_id)
    if record is None:
        return GroupOperationResult(
            success=False,
            message=f"Group {group_id} not found",
            error_code=GROUP_NOT_FOUND_CODE,
        )

    client = get_client(hass)
    if not client:
        return _client_unavailable()

    # 1. Provision the group key on this node (AddGroup is rejected without it).
    key_result = await provision_group_key(
        hass, node_id, group_id, record.key_set_id, record.epoch_key
    )
    if not key_result.success:
        return key_result

    # 2. Add the endpoint to the group via the Groups cluster.
    try:
        response = await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=_add_group_command(group_id, record.name),
        )
    except Exception as err:  # noqa: BLE001 - surfaced to the user
        _LOGGER.error("add_to_group: AddGroup failed: %s", err, exc_info=True)
        return GroupOperationResult(
            success=False,
            message=f"AddGroup failed: {err}",
            error_code=GROUP_DEVICE_ERROR_CODE,
        )

    status = _response_status(response)
    if status not in (0, None):
        return GroupOperationResult(
            success=False,
            message=f"Device rejected AddGroup (status {status})",
            error_code=GROUP_DEVICE_ERROR_CODE,
        )

    # 3. Record membership.
    await store.async_add_member(group_id, node_id, endpoint_id)
    return GroupOperationResult(
        success=True,
        message=f"Added node {node_id} endpoint {endpoint_id} to group {group_id}",
    )


async def remove_from_group(
    hass: HomeAssistant, group_id: int, node_id: int, endpoint_id: int
) -> GroupOperationResult:
    """Remove an endpoint from a group via ``Groups.RemoveGroup``."""
    if is_demo_mode(hass):
        if not remove_demo_group_member(group_id, node_id, endpoint_id):
            return GroupOperationResult(
                success=False,
                message=f"Group {group_id} not found",
                error_code=GROUP_NOT_FOUND_CODE,
            )
        return GroupOperationResult(
            success=True,
            message=(
                f"Removed node {node_id} endpoint {endpoint_id} from group {group_id}"
            ),
        )

    store = get_group_store(hass)
    await store.async_load()
    if store.get_group(group_id) is None:
        return GroupOperationResult(
            success=False,
            message=f"Group {group_id} not found",
            error_code=GROUP_NOT_FOUND_CODE,
        )

    client = get_client(hass)
    if not client:
        return _client_unavailable()

    try:
        response = await client.send_device_command(
            node_id=node_id,
            endpoint_id=endpoint_id,
            command=_remove_group_command(group_id),
        )
    except Exception as err:  # noqa: BLE001 - surfaced to the user
        _LOGGER.error("remove_from_group: RemoveGroup failed: %s", err, exc_info=True)
        return GroupOperationResult(
            success=False,
            message=f"RemoveGroup failed: {err}",
            error_code=GROUP_DEVICE_ERROR_CODE,
        )

    status = _response_status(response)
    if status not in (0, None):
        return GroupOperationResult(
            success=False,
            message=f"Device rejected RemoveGroup (status {status})",
            error_code=GROUP_DEVICE_ERROR_CODE,
        )

    await store.async_remove_member(group_id, node_id, endpoint_id)
    return GroupOperationResult(
        success=True,
        message=f"Removed node {node_id} endpoint {endpoint_id} from group {group_id}",
    )


async def provision_group_for_binding(
    hass: HomeAssistant,
    source_node_id: int,
    group_id: int,
    cluster_id: int,
) -> GroupOperationResult:
    """Provision everything a groupcast binding A -> Group G needs to function.

    - Source A gets the group key so it can *send* encrypted groupcast.
    - Each member gets the group key (idempotent) and a group-auth ACL granting
      the group operate access to ``cluster_id`` so it *accepts* the commands.

    Group membership (Groups.AddGroup) is established when members are added via
    add_to_group; this focuses on the binding/cluster-specific provisioning.
    """
    if is_demo_mode(hass):
        return GroupOperationResult(
            success=True, message="Demo mode: group binding provisioned"
        )

    store = get_group_store(hass)
    await store.async_load()
    record = store.get_group(group_id)
    if record is None:
        return GroupOperationResult(
            success=False,
            message=f"Group {group_id} not found",
            error_code=GROUP_NOT_FOUND_CODE,
        )

    def _progress(status: str, message: str) -> None:
        hass.bus.async_fire(
            EVENT_GROUP_PROGRESS,
            {
                "group_id": group_id,
                "source_node_id": source_node_id,
                "cluster_id": cluster_id,
                "status": status,
                "message": message,
            },
        )

    _progress("provisioning", "Provisioning group key on source...")

    # Source needs the group key to send groupcast.
    key_result = await provision_group_key(
        hass, source_node_id, group_id, record.key_set_id, record.epoch_key
    )
    if not key_result.success:
        _progress("failed", key_result.message)
        return key_result

    # Each member needs the key (idempotent) and a group-auth ACL for the cluster.
    failures: list[str] = []
    for member in record.members:
        node_id = member["node_id"]
        endpoint_id = member["endpoint_id"]

        member_key = await provision_group_key(
            hass, node_id, group_id, record.key_set_id, record.epoch_key
        )
        if not member_key.success:
            failures.append(f"node {node_id} key: {member_key.message}")
            continue

        acl_result = await provision_group_acl(
            hass, node_id, group_id, cluster_id, endpoint_id
        )
        if not acl_result.success:
            failures.append(f"node {node_id} ACL: {acl_result.message}")

    if failures:
        msg = "; ".join(failures)
        _progress("failed", msg)
        return GroupOperationResult(
            success=False, message=msg, error_code=GROUP_DEVICE_ERROR_CODE
        )

    _progress("success", "Group binding provisioned")
    return GroupOperationResult(
        success=True,
        message=f"Provisioned groupcast binding to group {group_id}",
    )


async def teardown_group_for_binding(
    hass: HomeAssistant,
    group_id: int,
    cluster_id: int,
) -> GroupOperationResult:
    """Remove the per-member group-auth ACL for a deleted groupcast binding.

    Conservative: removes only the cluster ACL this binding added. Group key
    material and Groups.AddGroup membership are left intact (removed only when the
    group itself is deleted), so other bindings to the same group keep working.
    """
    if is_demo_mode(hass):
        return GroupOperationResult(success=True, message="Demo mode: teardown")

    store = get_group_store(hass)
    await store.async_load()
    record = store.get_group(group_id)
    if record is None:
        return GroupOperationResult(
            success=True, message=f"Group {group_id} not found; nothing to tear down"
        )

    for member in record.members:
        result = await remove_group_acl(hass, member["node_id"], group_id, cluster_id)
        if not result.success:
            _LOGGER.warning(
                "teardown_group_for_binding: ACL removal failed on node %s: %s",
                member["node_id"],
                result.message,
            )

    return GroupOperationResult(
        success=True, message=f"Tore down groupcast binding to group {group_id}"
    )


# CLUSTER_GROUPS is re-exported for callers that need the Groups cluster id.
__all__ = [
    "CLUSTER_GROUPS",
    "add_to_group",
    "create_group",
    "delete_group",
    "get_groups",
    "provision_group_for_binding",
    "remove_from_group",
    "teardown_group_for_binding",
]
