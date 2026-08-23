"""Button platform for Armadarr."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from homeassistant.components.button import ButtonEntity, ButtonEntityDescription

from .entity import ArmadarrEntity

if TYPE_CHECKING:
    from collections.abc import Callable

    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.entity_platform import AddEntitiesCallback

    from .data import ArmadarrConfigEntry


@dataclass(frozen=True, kw_only=True)
class ArmadarrButtonEntityDescription(ButtonEntityDescription):
    """Class describing Armadarr button entities."""

    press_fn: Callable[[Any], Any]


async def async_setup_entry(
    _hass: HomeAssistant,
    entry: ArmadarrConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the button platform."""
    coordinator = entry.runtime_data.standard_coordinator
    app_type = entry.data["app_type"]

    entities: list[ArmadarrButton] = []

    # Dispatcharr exposes no restart endpoint.
    if app_type != "Dispatcharr":
        entities.append(
            ArmadarrButton(
                coordinator,
                ArmadarrButtonEntityDescription(
                    key="restart",
                    name="Restart Application",
                    icon="mdi:restart",
                    press_fn=lambda client: client.system.request_restart(),
                ),
            )
        )

    # Bazarr has no backup endpoint; Dispatcharr names its own component "backups".
    if app_type != "Bazarr":
        entities.append(
            ArmadarrButton(
                coordinator,
                ArmadarrButtonEntityDescription(
                    key="backup",
                    name="Backup Now",
                    icon="mdi:backup-restore",
                    press_fn=(
                        (lambda client: client.backups.create())
                        if app_type == "Dispatcharr"
                        else (lambda client: client.backup.create())
                    ),
                ),
            )
        )

    if app_type == "Prowlarr":
        entities.append(
            ArmadarrButton(
                coordinator,
                ArmadarrButtonEntityDescription(
                    key="sync_indexers",
                    name="Sync App Indexers",
                    icon="mdi:sync",
                    press_fn=lambda client: client.command.execute(
                        name="AppIndexerSync"
                    ),
                ),
            )
        )
    elif app_type == "Dispatcharr":
        entities.append(
            ArmadarrButton(
                coordinator,
                ArmadarrButtonEntityDescription(
                    key="reload_plugins",
                    name="Reload Plugins",
                    icon="mdi:plugin",
                    press_fn=lambda client: client.plugins.reload(),
                ),
            )
        )
    elif app_type == "Bazarr":
        entities.append(
            ArmadarrButton(
                coordinator,
                ArmadarrButtonEntityDescription(
                    key="search_missing_subtitles",
                    name="Search Missing Subtitles",
                    icon="mdi:magnify",
                    press_fn=_bazarr_search_wanted,
                ),
            )
        )

    async_add_entities(entities)


async def _bazarr_search_wanted(client: Any) -> None:
    """Ask Bazarr to search for every wanted series and movie subtitle."""
    await client.series.run_action(action="search-wanted")
    await client.movies.run_action(action="search-wanted")


class ArmadarrButton(ArmadarrEntity, ButtonEntity):
    """Armadarr Button class."""

    entity_description: ArmadarrButtonEntityDescription

    async def async_press(self) -> None:
        """Handle the button press."""
        await self.entity_description.press_fn(self.config_entry.runtime_data.client)
