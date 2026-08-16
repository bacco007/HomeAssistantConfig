"""Wire-format helpers for fabric-scoped Matter list-of-struct attributes.

matter.js and python-matter-server disagree on the JSON shape of fabric-scoped
list-of-struct attribute writes (GroupKeyMap, Binding):

- python-matter-server (chip) accepts camelCase field names and coerces a 0
  ``fabricIndex`` to the accessing fabric.
- matter.js requires numeric TLV tag keys and writes ``fabricIndex`` literally,
  so rs-matter rejects a 0 with CONSTRAINT_ERROR.

On top of that, matter-server serves attributes from a subscription cache that
lags a fresh fabric-scoped write.

These helpers own that mechanism so callers stay declarative: provide the
field→tag map and a verify predicate, and ``write_fabric_scoped_list`` resolves
the accessing fabric, writes camelCase, polls the readback, and retries with tag
keys on a miss. Everything here works against the ``MatterClientProtocol`` seam,
so it is unit-testable with a fake client.
"""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from typing import Any

from ..const import ATTR_CURRENT_FABRIC_INDEX, CLUSTER_OPERATIONAL_CREDENTIALS

_LOGGER = logging.getLogger(__name__)

CURRENT_FABRIC_INDEX_PATH = (
    f"0/{CLUSTER_OPERATIONAL_CREDENTIALS}/{ATTR_CURRENT_FABRIC_INDEX}"
)
# The FabricIndex field carries TLV tag 254 on every fabric-scoped struct.
FABRIC_INDEX_TAG = 254
FABRIC_INDEX_NAME = "fabricIndex"


def unwrap_attr(value: Any, path: str) -> Any:
    """Unwrap a read_attribute result that may be ``{"<path>": value}``."""
    if isinstance(value, dict) and path in value:
        return value[path]
    return value


def unwrap_attr_list(value: Any, path: str) -> list[Any]:
    """Unwrap a read_attribute result to a bare list (empty if not a list)."""
    value = unwrap_attr(value, path)
    return value if isinstance(value, list) else []


async def current_fabric_index(client: Any, node_id: int) -> int:
    """Read the device's accessing fabric index (1-based; falls back to 1).

    Fabric-scoped writes must carry this index: chip coerces a 0, but matter.js
    writes it literally and the device rejects 0.
    """
    try:
        value = unwrap_attr(
            await client.read_attribute(
                node_id=node_id, attribute_path=CURRENT_FABRIC_INDEX_PATH
            ),
            CURRENT_FABRIC_INDEX_PATH,
        )
        index = int(value)
        if index >= 1:
            return index
    except (ValueError, TypeError, AttributeError) as err:
        _LOGGER.warning(
            "Could not read CurrentFabricIndex for node %s (%s); assuming 1",
            node_id,
            err,
        )
    return 1


def encode_struct(
    fields: dict[str, Any],
    tag_map: dict[str, int],
    fabric_index: int,
    tag_keys: bool,
) -> dict[str, Any]:
    """Encode one struct as either camelCase or numeric TLV tag keys.

    ``fields`` is name→value (None values are dropped); ``tag_map`` is name→tag.
    The fabric index is always included (tag 254 / ``fabricIndex``).
    """
    result: dict[str, Any] = {}
    for name, value in fields.items():
        if value is None:
            continue
        result[str(tag_map[name]) if tag_keys else name] = value
    fabric_key = str(FABRIC_INDEX_TAG) if tag_keys else FABRIC_INDEX_NAME
    result[fabric_key] = fabric_index
    return result


def struct_field(entry: Any, name: str, tag: int) -> Any:
    """Read a struct field from a readback entry, by name or numeric tag key."""
    if isinstance(entry, dict):
        for key in (name, str(tag), tag):
            if key in entry and entry[key] is not None:
                return entry[key]
    else:
        if hasattr(entry, name):
            val = getattr(entry, name)
            if val is not None:
                return val
    return None


async def write_fabric_scoped_list(
    client: Any,
    node_id: int,
    attribute_path: str,
    entries: list[dict[str, Any]],
    tag_map: dict[str, int],
    verify: Callable[[list[Any]], bool],
    *,
    read_entries: Callable[[], Any] | None = None,
    attempts: int = 5,
    delay: float = 1.5,
) -> tuple[bool, list[Any]]:
    """Write a fabric-scoped list-of-struct, verifying it landed.

    ``entries`` are logical name→value dicts (no fabricIndex — added here).
    Writes camelCase first, polls the readback against ``verify`` (cache lag),
    and retries with tag keys on a miss. Returns ``(ok, last_readback)``.

    ``read_entries`` overrides how the readback is fetched (e.g. via a parsed
    higher-level reader); it defaults to ``read_attribute`` on ``attribute_path``.
    ``verify`` runs on whatever ``read_entries`` returns.
    """

    async def _default_read() -> list[Any]:
        return unwrap_attr_list(
            await client.read_attribute(node_id=node_id, attribute_path=attribute_path),
            attribute_path,
        )

    read = read_entries or _default_read
    fabric_index = await current_fabric_index(client, node_id)
    last_readback: list[Any] = []
    for tag_keys in (False, True):
        payload = [encode_struct(e, tag_map, fabric_index, tag_keys) for e in entries]
        await client.write_attribute(
            node_id=node_id, attribute_path=attribute_path, value=payload
        )
        for _ in range(attempts):
            last_readback = await read()
            if verify(last_readback):
                if tag_keys:
                    _LOGGER.info(
                        "write_fabric_scoped_list: %s accepted with tag keys on node %s",
                        attribute_path,
                        node_id,
                    )
                return True, last_readback
            await asyncio.sleep(delay)
    return False, last_readback
