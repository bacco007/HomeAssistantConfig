"""Group Key Management provisioning for Matter groupcast.

Writes the shared group epoch key (``KeySetWrite``) and the
``GroupId -> GroupKeySetID`` mapping (``GroupKeyMap`` attribute) to a node so it
can encrypt/decrypt groupcast traffic. These are prerequisites for
``Groups.AddGroup`` and for a source device to send groupcast: rs-matter (and the
Matter spec) reject ``AddGroup`` unless the fabric already holds group key
material for the group.

Both operations go through the generic matter-server primitives:
- ``KeySetWrite`` is a command → ``send_device_command`` with a chip struct.
- ``GroupKeyMap`` is a list-of-struct attribute → ``write_attribute`` with plain
  dicts (the same approach bindings.py uses for the Binding attribute).
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant

from ..const import (
    ATTR_GROUP_KEY_MAP,
    CLUSTER_GROUP_KEY_MANAGEMENT,
    GROUP_EPOCH_START_TIME,
    GROUP_KEY_SECURITY_POLICY_TRUST_FIRST,
)
from .client import get_raw_matter_client
from .demo import is_demo_mode
from .models import GroupOperationResult

_LOGGER = logging.getLogger(__name__)

GROUP_KEY_MAP_PATH = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"


def _entry_field(entry: Any, *keys: Any) -> Any:
    """Read a field from a GroupKeyMap entry (dict or chip struct)."""
    if isinstance(entry, dict):
        for k in keys:
            if k in entry and entry[k] is not None:
                return entry[k]
    else:
        for k in keys:
            if isinstance(k, str) and hasattr(entry, k):
                val = getattr(entry, k)
                if val is not None:
                    return val
    return None


def merge_group_key_map(
    existing: list[Any] | None,
    group_id: int,
    key_set_id: int,
) -> list[dict[str, int]]:
    """Return the GroupKeyMap list with (group_id -> key_set_id) ensured present.

    Pure read-modify-write helper. Preserves existing mappings, is idempotent
    (no duplicate for the same group_id), and normalizes every entry to a plain
    dict suitable for ``write_attribute``.
    """
    result: list[dict[str, int]] = []
    found = False
    for entry in existing or []:
        gid = _entry_field(entry, "groupId", "1", 1)
        ksid = _entry_field(entry, "groupKeySetID", "2", 2)
        if gid is None or ksid is None:
            continue
        gid, ksid = int(gid), int(ksid)
        if gid == group_id:
            found = True
            ksid = key_set_id  # update to the desired key set
        result.append({"groupId": gid, "groupKeySetID": ksid, "fabricIndex": 0})

    if not found:
        result.append(
            {"groupId": group_id, "groupKeySetID": key_set_id, "fabricIndex": 0}
        )
    return result


def _build_key_set_write_command(key_set_id: int, epoch_key: bytes) -> Any:
    """Build the chip KeySetWrite command (chip imported lazily; real env only)."""
    from chip.clusters import Objects as clusters
    from chip.clusters.Types import NullValue

    key_set = clusters.GroupKeyManagement.Structs.GroupKeySetStruct(
        groupKeySetID=key_set_id,
        groupKeySecurityPolicy=GROUP_KEY_SECURITY_POLICY_TRUST_FIRST,
        epochKey0=epoch_key,
        epochStartTime0=GROUP_EPOCH_START_TIME,
        epochKey1=NullValue,
        epochStartTime1=NullValue,
        epochKey2=NullValue,
        epochStartTime2=NullValue,
    )
    return clusters.GroupKeyManagement.Commands.KeySetWrite(groupKeySet=key_set)


async def provision_group_key(
    hass: HomeAssistant,
    node_id: int,
    group_id: int,
    key_set_id: int,
    epoch_key_hex: str,
) -> GroupOperationResult:
    """Provision a node with the group's key set and GroupId->KeySet mapping.

    Steps (both on the root endpoint, cluster 0x003F):
      1. ``KeySetWrite`` the epoch key under ``key_set_id``.
      2. read-modify-write ``GroupKeyMap`` to map ``group_id -> key_set_id``.
    """
    if is_demo_mode(hass):
        _LOGGER.debug(
            "provision_group_key: demo mode, skipping device writes (node %s group %s)",
            node_id,
            group_id,
        )
        return GroupOperationResult(success=True, message="Demo mode: group key set")

    client = get_raw_matter_client(hass)
    if not client:
        return GroupOperationResult(
            success=False,
            message="Matter client not available",
            error_code="client_unavailable",
        )

    try:
        epoch_key = bytes.fromhex(epoch_key_hex)
    except ValueError:
        return GroupOperationResult(
            success=False,
            message="Stored epoch key is not valid hex",
            error_code="invalid_key",
        )

    try:
        # 1. Write the group key set.
        _LOGGER.info(
            "provision_group_key: KeySetWrite node %s key_set_id %s",
            node_id,
            key_set_id,
        )
        await client.send_device_command(
            node_id=node_id,
            endpoint_id=0,
            command=_build_key_set_write_command(key_set_id, epoch_key),
        )

        # 2. Map the group id to the key set in GroupKeyMap (read-modify-write).
        existing = await client.read_attribute(
            node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
        )
        updated = merge_group_key_map(existing, group_id, key_set_id)
        await client.write_attribute(
            node_id=node_id,
            attribute_path=GROUP_KEY_MAP_PATH,
            value=updated,
        )

        return GroupOperationResult(
            success=True,
            message=f"Provisioned group key for group {group_id} on node {node_id}",
        )
    except Exception as err:  # noqa: BLE001 - surfaced to the user
        _LOGGER.error(
            "provision_group_key: failed for node %s group %s: %s",
            node_id,
            group_id,
            err,
            exc_info=True,
        )
        return GroupOperationResult(
            success=False,
            message=f"Group key provisioning failed: {err}",
            error_code="device_error",
        )
