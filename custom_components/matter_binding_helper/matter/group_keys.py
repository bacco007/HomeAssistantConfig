"""Group Key Management provisioning for Matter groupcast.

Writes the shared group epoch key (``KeySetWrite``) and the
``GroupId -> GroupKeySetID`` mapping (``GroupKeyMap`` attribute) to a node so it
can encrypt/decrypt groupcast traffic. These are prerequisites for
``Groups.AddGroup`` and for a source device to send groupcast: rs-matter (and the
Matter spec) reject ``AddGroup`` unless the fabric already holds group key
material for the group.

``KeySetWrite`` is a command (``send_device_command`` with a chip struct); the
``GroupKeyMap`` write goes through :func:`matter.wire.write_fabric_scoped_list`,
which owns the camelCase/tag-key + fabricIndex + cache-lag mechanism.
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
from .client import get_client
from .demo import is_demo_mode
from .models import GroupOperationResult
from .wire import struct_field, unwrap_attr_list, write_fabric_scoped_list

_LOGGER = logging.getLogger(__name__)

GROUP_KEY_MAP_PATH = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
# GroupKeyMapStruct field name -> TLV tag.
GROUP_KEY_MAP_TAGS = {"groupId": 1, "groupKeySetID": 2}


def _group_key_map_has(
    existing: list[Any] | None, group_id: int, key_set_id: int
) -> bool:
    """True if the GroupKeyMap contains the group_id -> key_set_id mapping."""
    for entry in existing or []:
        gid = struct_field(entry, "groupId", 1)
        ksid = struct_field(entry, "groupKeySetID", 2)
        if gid is None or ksid is None:
            continue
        if int(gid) == group_id and int(ksid) == key_set_id:
            return True
    return False


def merge_group_key_map(
    existing: list[Any] | None,
    group_id: int,
    key_set_id: int,
) -> list[dict[str, int]]:
    """Return the GroupKeyMap as logical entries with the mapping ensured present.

    Pure read-modify-write helper: preserves existing mappings, is idempotent (no
    duplicate for the same group_id), and returns plain ``{groupId, groupKeySetID}``
    dicts. Encoding (key format + fabricIndex) is handled by ``wire``.
    """
    result: list[dict[str, int]] = []
    found = False
    for entry in existing or []:
        gid = struct_field(entry, "groupId", 1)
        ksid = struct_field(entry, "groupKeySetID", 2)
        if gid is None or ksid is None:
            continue
        gid, ksid = int(gid), int(ksid)
        if gid == group_id:
            found = True
            ksid = key_set_id  # update to the desired key set
        result.append({"groupId": gid, "groupKeySetID": ksid})

    if not found:
        result.append({"groupId": group_id, "groupKeySetID": key_set_id})
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

    client = get_client(hass)
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
        existing = unwrap_attr_list(
            await client.read_attribute(
                node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
            ),
            GROUP_KEY_MAP_PATH,
        )
        entries = merge_group_key_map(existing, group_id, key_set_id)
        ok, last_readback = await write_fabric_scoped_list(
            client,
            node_id,
            GROUP_KEY_MAP_PATH,
            entries,
            GROUP_KEY_MAP_TAGS,
            lambda rb: _group_key_map_has(rb, group_id, key_set_id),
        )
        if ok:
            return GroupOperationResult(
                success=True,
                message=f"Provisioned group key for group {group_id} on node {node_id}",
            )

        # Could not confirm via readback. The write itself did not error and the
        # matter-server cache can lag indefinitely, so proceed optimistically (as
        # the original non-verifying code did) rather than aborting the whole
        # groupcast flow — verification is best-effort, not a gate.
        _LOGGER.warning(
            "provision_group_key: could not confirm GroupKeyMap on node %s for "
            "group %s -> keyset %s; readback=%s. Proceeding; AddGroup will surface "
            "a real rejection if the key is absent.",
            node_id,
            group_id,
            key_set_id,
            last_readback,
        )
        return GroupOperationResult(
            success=True,
            message=(
                f"Provisioned group key for group {group_id} on node {node_id} "
                "(write not confirmed via readback)"
            ),
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
