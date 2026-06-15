"""Persistent registry for Matter groups and their group keys.

Matter groupcast requires a shared symmetric *group key* (an epoch key) to be
written to every node in the group. Crucially, ``GroupKeyManagement.KeySetRead``
returns the key set with the epoch key material **nulled** for security, so a key
can never be read back off a device. To add a member to an existing group later,
the integration must re-send the *same* epoch key — therefore it must persist the
key it generated.

This module is the single source of truth for that state: per group it records
the name, the allocated group key set id, the epoch key (hex), and the member
endpoints. It is pure registry/persistence logic with no Matter I/O — the actual
device writes live in group_keys.py / groups.py.

Security note: the epoch key is a fabric secret stored in HA's ``.storage`` (the
same trust level as other HA secrets). Losing the store forces re-keying every
group.
"""

from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from typing import Any, Callable

from homeassistant.core import HomeAssistant

from ..const import DOMAIN, GROUP_ID_BASE, GROUP_KEY_SET_BASE


def get_group_store(hass: HomeAssistant) -> "GroupStore":
    """Return the cached GroupStore for this hass, creating it on first use.

    Tests can pre-seed ``hass.data[DOMAIN][_GROUP_STORE_KEY]`` with a GroupStore
    built around a fake backing store to avoid touching HA storage.
    """
    domain_data = hass.data.setdefault(DOMAIN, {})
    store = domain_data.get(_GROUP_STORE_KEY)
    if store is None:
        store = GroupStore(hass)
        domain_data[_GROUP_STORE_KEY] = store
    return store


STORAGE_KEY = f"{DOMAIN}_groups"
STORAGE_VERSION = 1
EPOCH_KEY_BYTES = 16  # Matter group epoch keys are 128-bit

# Key under hass.data[DOMAIN] for the cached GroupStore singleton.
_GROUP_STORE_KEY = "_group_store"


def _default_epoch_key() -> str:
    """Generate a fresh 128-bit epoch key as a hex string."""
    return secrets.token_bytes(EPOCH_KEY_BYTES).hex()


@dataclass
class GroupRecord:
    """A persisted Matter group and its key material."""

    group_id: int
    name: str
    key_set_id: int
    epoch_key: str  # hex of EPOCH_KEY_BYTES random bytes
    members: list[dict[str, int]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        """Serialize for storage."""
        return {
            "group_id": self.group_id,
            "name": self.name,
            "key_set_id": self.key_set_id,
            "epoch_key": self.epoch_key,
            "members": self.members,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "GroupRecord":
        """Deserialize from storage."""
        return cls(
            group_id=int(data["group_id"]),
            name=data["name"],
            key_set_id=int(data["key_set_id"]),
            epoch_key=data["epoch_key"],
            members=[
                {"node_id": int(m["node_id"]), "endpoint_id": int(m["endpoint_id"])}
                for m in data.get("members", [])
            ],
        )

    def has_member(self, node_id: int, endpoint_id: int) -> bool:
        """Return True if (node_id, endpoint_id) is already a member."""
        return any(
            m["node_id"] == node_id and m["endpoint_id"] == endpoint_id
            for m in self.members
        )


class GroupStore:
    """Async, persistent CRUD over the group registry.

    ``store`` is injectable for testing; by default it wraps HA's ``Store``.
    ``key_factory`` lets tests pin deterministic epoch keys.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        store: Any | None = None,
        key_factory: Callable[[], str] | None = None,
    ) -> None:
        if store is None:
            # Imported lazily so the module loads under the unit-test HA mocks,
            # which don't register homeassistant.helpers.storage.
            from homeassistant.helpers.storage import Store

            store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._store = store
        self._key_factory = key_factory or _default_epoch_key
        self._data: dict[str, Any] | None = None

    # -- loading / saving -------------------------------------------------

    async def async_load(self) -> None:
        """Load the registry into memory (idempotent)."""
        if self._data is not None:
            return
        raw = await self._store.async_load()
        if not raw:
            self._data = {
                "next_key_set_id": GROUP_KEY_SET_BASE,
                "next_group_id": GROUP_ID_BASE,
                "groups": {},
            }
        else:
            self._data = {
                "next_key_set_id": int(raw.get("next_key_set_id", GROUP_KEY_SET_BASE)),
                "next_group_id": int(raw.get("next_group_id", GROUP_ID_BASE)),
                "groups": dict(raw.get("groups", {})),
            }

    async def _save(self) -> None:
        await self._store.async_save(self._data)

    def _require_loaded(self) -> dict[str, Any]:
        if self._data is None:
            raise RuntimeError("GroupStore.async_load() must be called first")
        return self._data

    # -- queries ----------------------------------------------------------

    def get_group(self, group_id: int) -> GroupRecord | None:
        """Return the record for ``group_id`` or None."""
        data = self._require_loaded()
        raw = data["groups"].get(str(group_id))
        return GroupRecord.from_dict(raw) if raw else None

    def list_groups(self) -> list[GroupRecord]:
        """Return all group records, ordered by group id."""
        data = self._require_loaded()
        records = [GroupRecord.from_dict(r) for r in data["groups"].values()]
        return sorted(records, key=lambda r: r.group_id)

    # -- mutations --------------------------------------------------------

    def _allocate_group_id(self, data: dict[str, Any]) -> int:
        """Pick the next free group id, skipping any already in use."""
        gid = int(data.get("next_group_id", GROUP_ID_BASE))
        while str(gid) in data["groups"]:
            gid += 1
        data["next_group_id"] = gid + 1
        return gid

    async def async_create_group(self, group_id: int | None, name: str) -> GroupRecord:
        """Create a group, allocating a key set id and a fresh epoch key.

        If ``group_id`` is None, the next free group id is allocated automatically
        (the common case — users shouldn't have to invent a Matter group id).
        Raises ValueError if an explicitly-requested group already exists.
        """
        data = self._require_loaded()

        if group_id is None:
            group_id = self._allocate_group_id(data)
        elif str(group_id) in data["groups"]:
            raise ValueError(f"Group {group_id} already exists")

        key = str(group_id)
        key_set_id = int(data["next_key_set_id"])
        data["next_key_set_id"] = key_set_id + 1
        record = GroupRecord(
            group_id=group_id,
            name=name,
            key_set_id=key_set_id,
            epoch_key=self._key_factory(),
            members=[],
        )
        data["groups"][key] = record.to_dict()
        await self._save()
        return record

    async def async_delete_group(self, group_id: int) -> bool:
        """Delete a group. Returns True if it existed."""
        data = self._require_loaded()
        existed = data["groups"].pop(str(group_id), None) is not None
        if existed:
            await self._save()
        return existed

    async def async_add_member(
        self, group_id: int, node_id: int, endpoint_id: int
    ) -> GroupRecord:
        """Add an endpoint to a group (idempotent). Raises if group missing."""
        data = self._require_loaded()
        record = self.get_group(group_id)
        if record is None:
            raise ValueError(f"Group {group_id} does not exist")
        if not record.has_member(node_id, endpoint_id):
            record.members.append({"node_id": node_id, "endpoint_id": endpoint_id})
            data["groups"][str(group_id)] = record.to_dict()
            await self._save()
        return record

    async def async_remove_member(
        self, group_id: int, node_id: int, endpoint_id: int
    ) -> GroupRecord:
        """Remove an endpoint from a group (idempotent). Raises if group missing."""
        data = self._require_loaded()
        record = self.get_group(group_id)
        if record is None:
            raise ValueError(f"Group {group_id} does not exist")
        before = len(record.members)
        record.members = [
            m
            for m in record.members
            if not (m["node_id"] == node_id and m["endpoint_id"] == endpoint_id)
        ]
        if len(record.members) != before:
            data["groups"][str(group_id)] = record.to_dict()
            await self._save()
        return record
