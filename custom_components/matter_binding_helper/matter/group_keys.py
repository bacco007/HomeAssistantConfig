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

import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant

from ..const import (
    ATTR_CURRENT_FABRIC_INDEX,
    ATTR_GROUP_KEY_MAP,
    CLUSTER_GROUP_KEY_MANAGEMENT,
    CLUSTER_OPERATIONAL_CREDENTIALS,
    GROUP_EPOCH_START_TIME,
    GROUP_KEY_SECURITY_POLICY_TRUST_FIRST,
)
from .client import get_raw_matter_client
from .demo import is_demo_mode
from .models import GroupOperationResult

_LOGGER = logging.getLogger(__name__)

GROUP_KEY_MAP_PATH = f"0/{CLUSTER_GROUP_KEY_MANAGEMENT}/{ATTR_GROUP_KEY_MAP}"
CURRENT_FABRIC_INDEX_PATH = (
    f"0/{CLUSTER_OPERATIONAL_CREDENTIALS}/{ATTR_CURRENT_FABRIC_INDEX}"
)


async def _accessing_fabric_index(client: Any, node_id: int) -> int:
    """Read the device's CurrentFabricIndex (the accessing fabric).

    Fabric-scoped writes must carry the real fabric index. python-matter-server
    coerces a 0 to the accessing fabric, but matter.js writes it literally, so a
    hardcoded 0 lands the GroupKeyMap on fabric 0 and the device rejects AddGroup
    with UNSUPPORTED_ACCESS. Fabric indices are 1-based; fall back to 1.
    """
    try:
        value = await client.read_attribute(
            node_id=node_id, attribute_path=CURRENT_FABRIC_INDEX_PATH
        )
        # read_attribute may wrap the scalar as {"0/62/5": value}.
        if isinstance(value, dict):
            value = value.get(CURRENT_FABRIC_INDEX_PATH, value)
        index = int(value)
        # Log the raw value: a 0 here means the controller is reaching the device
        # without a promoted operational fabric, which makes every fabric-scoped
        # write/command (KeySetWrite, GroupKeyMap, AddGroup) fail UNSUPPORTED_ACCESS.
        _LOGGER.info(
            "provision_group_key: node %s reports CurrentFabricIndex=%s",
            node_id,
            index,
        )
        if index >= 1:
            return index
    except (ValueError, TypeError, AttributeError) as err:
        _LOGGER.warning(
            "Could not read CurrentFabricIndex for node %s (%s); assuming 1",
            node_id,
            err,
        )
    return 1


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


def _unwrap_attr_list(value: Any, path: str) -> list[Any]:
    """Normalize a read_attribute result to a bare list.

    read_attribute may return the value directly or wrapped as
    ``{"<endpoint>/<cluster>/<attr>": value}``. Unwrap so callers always see the
    list of entries.
    """
    if isinstance(value, dict) and path in value:
        value = value[path]
    return value if isinstance(value, list) else []


def _group_key_map_has(
    existing: list[Any] | None, group_id: int, key_set_id: int
) -> bool:
    """True if the GroupKeyMap contains the group_id -> key_set_id mapping."""
    for entry in existing or []:
        gid = _entry_field(entry, "groupId", "1", 1)
        ksid = _entry_field(entry, "groupKeySetID", "2", 2)
        if gid is None or ksid is None:
            continue
        if int(gid) == group_id and int(ksid) == key_set_id:
            return True
    return False


def _group_key_entry(
    group_id: int, key_set_id: int, fabric_index: int, tag_keys: bool
) -> dict[str, int]:
    """One GroupKeyMap entry, keyed by either field name or numeric TLV tag.

    python-matter-server accepts camelCase field names on write; matter.js
    silently drops entries it cannot map and only persists numeric tag keys
    (``1``=groupId, ``2``=groupKeySetID, ``254``=fabricIndex), which is also the
    shape both servers return on read.
    """
    if tag_keys:
        return {"1": group_id, "2": key_set_id, "254": fabric_index}
    return {
        "groupId": group_id,
        "groupKeySetID": key_set_id,
        "fabricIndex": fabric_index,
    }


def merge_group_key_map(
    existing: list[Any] | None,
    group_id: int,
    key_set_id: int,
    fabric_index: int = 1,
    tag_keys: bool = False,
) -> list[dict[str, int]]:
    """Return the GroupKeyMap list with (group_id -> key_set_id) ensured present.

    Pure read-modify-write helper. Preserves existing mappings, is idempotent
    (no duplicate for the same group_id), and normalizes every entry to a plain
    dict suitable for ``write_attribute``. ``fabric_index`` must be the accessing
    fabric. ``tag_keys`` selects numeric TLV tag keys over camelCase field names
    (see ``_group_key_entry``).
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
        result.append(_group_key_entry(gid, ksid, fabric_index, tag_keys))

    if not found:
        result.append(_group_key_entry(group_id, key_set_id, fabric_index, tag_keys))
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

        # 2. Map the group id to the key set in GroupKeyMap (read-modify-write),
        #    scoped to the accessing fabric. We verify the write landed by reading
        #    it back: matter.js silently drops a camelCase list-of-struct write
        #    (no error, attribute stays empty), so on the first miss we retry with
        #    numeric TLV tag keys — the shape both servers return on read.
        fabric_index = await _accessing_fabric_index(client, node_id)
        last_readback: Any = None
        for tag_keys in (False, True):
            existing = _unwrap_attr_list(
                await client.read_attribute(
                    node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
                ),
                GROUP_KEY_MAP_PATH,
            )
            updated = merge_group_key_map(
                existing, group_id, key_set_id, fabric_index, tag_keys=tag_keys
            )
            await client.write_attribute(
                node_id=node_id,
                attribute_path=GROUP_KEY_MAP_PATH,
                value=updated,
            )
            # matter-server serves attributes from a subscription cache that lags
            # a fresh fabric-scoped write, so poll the readback before concluding
            # the format was rejected (otherwise a slow cache false-negatives a
            # write that actually succeeded).
            found = False
            for attempt in range(5):
                last_readback = _unwrap_attr_list(
                    await client.read_attribute(
                        node_id=node_id, attribute_path=GROUP_KEY_MAP_PATH
                    ),
                    GROUP_KEY_MAP_PATH,
                )
                if _group_key_map_has(last_readback, group_id, key_set_id):
                    found = True
                    break
                await asyncio.sleep(1.5)
            if found:
                _LOGGER.info(
                    "provision_group_key: GroupKeyMap accepted on node %s using "
                    "%s keys (group %s -> keyset %s, fabric %s)",
                    node_id,
                    "tag" if tag_keys else "name",
                    group_id,
                    key_set_id,
                    fabric_index,
                )
                return GroupOperationResult(
                    success=True,
                    message=(
                        f"Provisioned group key for group {group_id} on node {node_id}"
                    ),
                )

        # 3. Could not confirm via readback. The write itself did not error and
        #    the matter-server cache can lag indefinitely, so proceed optimistically
        #    (as the original non-verifying code did) rather than aborting the whole
        #    groupcast flow — verification is best-effort, not a gate.
        _LOGGER.warning(
            "provision_group_key: could not confirm GroupKeyMap on node %s for "
            "group %s -> keyset %s (fabric %s) after name+tag writes; readback=%s. "
            "Proceeding; AddGroup will surface a real rejection if the key is absent.",
            node_id,
            group_id,
            key_set_id,
            fabric_index,
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
