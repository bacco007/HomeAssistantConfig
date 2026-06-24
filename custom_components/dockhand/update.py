"""Update platform for Dockhand container image updates.

Each container gets an UpdateEntity that reflects whether a newer image
digest is available. The "Install" button triggers a pull-and-recreate
via POST /api/containers/batch-update. Note: this API endpoint does not
apply vulnerability scanning or criteria evaluation — that workflow is
only available through the Dockhand UI. A warning is shown in the entity's
release summary when scanning is enabled on the environment.

Version string strategy:
  installed_version — first 12 hex chars of the sha256 from currentDigest.
                      currentDigest format: "image@sha256:<hex>"
  latest_version    — same as installed_version when up to date.
                      When hasUpdate=True, first 12 hex chars of newDigest.
                      newDigest format: "sha256:<hex>" (no image prefix).

Both digest fields are present in the API response. newDigest only appears
when hasUpdate=True; it is absent (not null) when no update is available.

Install is suppressed for:
  - updateDisabled=True  (dockhand.update=false label on the container)
  - systemContainer!=None (Dockhand infrastructure containers like hawser
                           that cannot be updated through the batch-update API)
"""

import logging

from homeassistant.components.update import UpdateEntity, UpdateEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import DOMAIN
from .coordinator import DockhandFastCoordinator, DockhandUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

# Updates trigger pull-and-recreate via the API — serialise to avoid concurrent
# pulls on the same host. 0 = coordinator manages updates, no HA-level limit.
PARALLEL_UPDATES = 0


def _short_digest(digest: str) -> str:
    """Return a short human-readable version string from a digest reference.

    Handles both formats returned by the API:
      currentDigest: "ghcr.io/finsys/hawser@sha256:53bb1e23fb302f..."
      newDigest:     "sha256:79f926e8d8fe31c0dfe90858f90b69bfd4cfbb..."

    Returns the first 12 hex chars of the sha256, e.g. "53bb1e23fb30".
    Falls back to the raw digest string if parsing fails.
    """
    try:
        sha_part = digest.split("sha256:")[-1]
        return sha_part[:12] if sha_part else digest
    except Exception:
        return digest


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up container update entities."""
    data = entry.runtime_data
    update_coordinator = data.update_coordinator
    fast_coordinator = data.fast_coordinator

    if update_coordinator is None:
        return

    seen: set[str] = set()

    def _add_new_entities() -> None:
        nonlocal seen
        update_data = update_coordinator.data or {}
        fast_data = fast_coordinator.data or {}
        new_entities = []

        for env_id, by_container_id in update_data.items():
            env_fast = fast_data.get(env_id, {})
            stats = env_fast.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")

            for _container_id, item in by_container_id.items():
                container_name = item.get("containerName", "")
                if not container_name:
                    continue
                uid = f"{entry.entry_id}_{env_id}_update_{container_name}"
                if uid in seen:
                    continue
                seen.add(uid)
                new_entities.append(
                    ContainerUpdateEntity(
                        fast_coordinator=fast_coordinator,
                        update_coordinator=update_coordinator,
                        entry_id=entry.entry_id,
                        env_id=env_id,
                        env_name=env_name,
                        container_name=container_name,
                        item=item,
                    )
                )

        if new_entities:
            async_add_entities(new_entities)

    # Add entities for initial data
    _add_new_entities()

    # Re-run on each coordinator update to pick up new containers
    entry.async_on_unload(update_coordinator.async_add_listener(_add_new_entities))


class ContainerUpdateEntity(CoordinatorEntity[DockhandUpdateCoordinator], UpdateEntity):
    """Update entity for a single container's image update status.

    Both identity (unique_id) and device attachment use (env_id, container_name).
    Docker enforces unique container names per host, so this is stable across
    container recreation (image updates), preserving historical entity data and
    automations.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        update_coordinator: DockhandUpdateCoordinator,
        entry_id: str,
        env_id: int,
        env_name: str,
        container_name: str,
        item: dict,
    ) -> None:
        super().__init__(update_coordinator)
        self._fast_coordinator = fast_coordinator
        self._env_id = env_id
        self._container_name = container_name

        self._attr_unique_id = f"{entry_id}_{env_id}_update_{container_name}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"container_{env_id}_{container_name}")},
        )

        self._update_supported_features()

    def _item(self) -> dict:
        """Return the current update payload for this container.

        Looks up by container name across the current coordinator data for this
        environment, since the container_id changes after every image update.
        Returns empty dict if the container is not currently present.
        """
        update_data = self.coordinator.data or {}
        env_data = update_data.get(self._env_id, {})
        # env_data is indexed by container_id — scan for matching name.
        for item in env_data.values():
            if item.get("containerName") == self._container_name:
                return item
        return {}

    def _update_supported_features(self) -> None:
        item = self._item()
        update_disabled = item.get("updateDisabled", False)
        is_system = item.get("systemContainer") is not None
        if update_disabled or is_system:
            self._attr_supported_features = UpdateEntityFeature.RELEASE_NOTES
        else:
            self._attr_supported_features = (
                UpdateEntityFeature.INSTALL | UpdateEntityFeature.RELEASE_NOTES
            )

    @property
    def installed_version(self) -> str | None:
        item = self._item()
        digest = item.get("currentDigest", "")
        return _short_digest(digest) if digest else None

    @property
    def latest_version(self) -> str | None:
        item = self._item()
        if not item:
            return self.installed_version
        if item.get("hasUpdate"):
            new_digest = item.get("newDigest", "")
            return _short_digest(new_digest) if new_digest else self.installed_version
        return self.installed_version

    def _scanner_enabled(self) -> bool:
        """Return True if vulnerability scanning is enabled on this environment."""
        fast_data = self._fast_coordinator.data or {}
        stats = fast_data.get(self._env_id, {}).get("stats") or {}
        return bool(stats.get("scannerEnabled", False))

    @property
    def release_summary(self) -> str | None:
        """Not used — release notes cover all warning content."""
        return None

    async def async_release_notes(self) -> str | None:
        """Full release notes shown in the more-info dialog — supports Markdown."""
        item = self._item()
        if not item:
            return None
        parts = []

        image_name = item.get("imageName")
        if image_name:
            parts.append(f"Image: {image_name}")

        if self._scanner_enabled():
            msg = "Vulnerability scanning will not be performed via this update method."
            parts.append(f"<ha-alert alert-type='warning'>{msg}</ha-alert>")

        if item.get("systemContainer"):
            msg = (
                "This is a system container and must be updated"
                " directly on the docker host."
            )
            parts.append(f"<ha-alert alert-type='warning'>{msg}</ha-alert>")
        elif item.get("updateDisabled"):
            msg = "Updates disabled via `dockhand.update=false` label."
            parts.append(f"<ha-alert alert-type='info'>{msg}</ha-alert>")

        return "\n\n".join(parts) if parts else None

    @property
    def available(self) -> bool:
        # Check by name in fast data — name is stable across container recreation.
        fast_data = self._fast_coordinator.data or {}
        env_containers = fast_data.get(self._env_id, {}).get("containers") or []
        container_exists = any(
            c.get("name") == self._container_name for c in env_containers
        )
        return container_exists and super().available

    def _handle_coordinator_update(self) -> None:
        self._update_supported_features()
        super()._handle_coordinator_update()

    async def async_install(self, version: str | None, backup: bool, **kwargs) -> None:
        """Trigger a pull-and-recreate update for this container via Dockhand."""
        # Find the current container_id by name — it may have changed since init.
        item = self._item()
        container_id = item.get("containerId", "") if item else ""
        if not container_id:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            await self.coordinator.client.async_batch_update_container(
                self._env_id, container_id
            )
        except Exception as err:
            _LOGGER.error(
                "batch-update failed for container '%s' (env %s, id %s): %s: %s",
                self._container_name,
                self._env_id,
                container_id,
                type(err).__name__,
                err,
            )
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        # Request a refresh so the entity state reflects the result.
        await self.coordinator.async_request_refresh()
