"""Todo platform for Custom Component Monitor (Update Action Tracker)."""

from __future__ import annotations

import logging
import uuid
from typing import Any

from homeassistant.components.todo import (
    TodoItem,
    TodoItemStatus,
    TodoListEntity,
    TodoListEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.storage import Store

from .const import DOMAIN, STORAGE_KEY, STORAGE_VERSION

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the todo platform."""
    store: Store[dict[str, Any]] = Store(hass, STORAGE_VERSION, STORAGE_KEY)
    stored = await store.async_load() or {}
    items: list[dict[str, Any]] = stored.get("items", [])

    entity = UpdateActionTodoList(entry, store, items)
    hass.data[DOMAIN]["todo_entity"] = entity
    async_add_entities([entity])


class UpdateActionTodoList(TodoListEntity):
    """A to-do list that tracks HACS update actions."""

    _attr_has_entity_name = True
    _attr_name = "HACS Update Actions"
    _attr_icon = "mdi:clipboard-check-outline"
    _attr_should_poll = False
    _attr_supported_features = (
        TodoListEntityFeature.CREATE_TODO_ITEM
        | TodoListEntityFeature.DELETE_TODO_ITEM
        | TodoListEntityFeature.UPDATE_TODO_ITEM
        | TodoListEntityFeature.SET_DESCRIPTION_ON_ITEM
    )

    def __init__(
        self,
        entry: ConfigEntry,
        store: Store[dict[str, Any]],
        items: list[dict[str, Any]],
    ) -> None:
        """Initialize the todo list."""
        self._entry = entry
        self._store = store
        self._items: list[dict[str, Any]] = items
        self._attr_unique_id = f"{entry.entry_id}_todo"

    @property
    def todo_items(self) -> list[TodoItem]:
        """Return the todo items."""
        return [
            TodoItem(
                uid=item["uid"],
                summary=item["summary"],
                status=TodoItemStatus(item["status"]),
                description=item.get("description"),
            )
            for item in self._items
        ]

    async def async_create_todo_item(self, item: TodoItem) -> None:
        """Add an item to the to-do list."""
        uid = item.uid or str(uuid.uuid4())
        status = item.status or TodoItemStatus.NEEDS_ACTION
        self._items.append(
            {
                "uid": uid,
                "summary": item.summary,
                "status": status.value if isinstance(status, TodoItemStatus) else str(status),
                "description": item.description,
            }
        )
        await self._async_save()
        self.async_write_ha_state()

    async def async_update_todo_item(self, item: TodoItem) -> None:
        """Update an item in the to-do list."""
        for existing in self._items:
            if existing["uid"] == item.uid:
                if item.summary is not None:
                    existing["summary"] = item.summary
                if item.status is not None:
                    existing["status"] = item.status.value if isinstance(item.status, TodoItemStatus) else str(item.status)
                if item.description is not None:
                    existing["description"] = item.description
                await self._async_save()
                self.async_write_ha_state()
                return
        raise ValueError(f"Item {item.uid} not found")

    async def async_delete_todo_items(self, uids: list[str]) -> None:
        """Delete items from the to-do list."""
        uid_set = set(uids)
        self._items = [i for i in self._items if i["uid"] not in uid_set]
        await self._async_save()
        self.async_write_ha_state()

    async def _async_save(self) -> None:
        """Persist items to storage."""
        await self._store.async_save({"items": self._items})
