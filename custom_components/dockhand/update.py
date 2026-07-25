"""Update platform for Dockhand container image updates.

Whole platform gated on CONF_ENABLE_UPDATE_ENTITIES (default True, for
upgrade compatibility — Tier 1 was unconditional before this option
existed). Off entirely disables both tiers' ENTITIES below, and the
env-level bulk "Update all" button (button.py/__init__.py) since it has
nothing to act on without them — that's the actual "backdoor to
performing updates from HA" concern behind this option. It does NOT
disable the update_coordinator (Tier 2) object itself or the env-level
"Check for updates" button: that button is read-only (forces a real
registry check, refreshing Dockhand's own cached values that other
things — e.g. the stack binary sensor's pending-updates attributes —
still consume regardless of whether update entities exist), so it keeps
working whenever CONF_ENABLE_PRECISE_UPDATES is on, independent of this
toggle. See __init__.py's update_coordinator construction for that
split. Added in response to github.com/raetha/ha-dockhand/issues/23 —
some users manage container updates outside HA entirely and don't want
these entities cluttering HA's own update management.

Two-tier design for entity DISPLAY (both tiers require
CONF_ENABLE_UPDATE_ENTITIES to be on — Tier 2 alone, e.g. via a manual
"Check for updates" press with entities disabled, has nothing to show
its data on):

  Tier 1 (no separate config option beyond the platform gate above):
  update entities exist for every container in any environment where
  Dockhand itself has update-check enabled
  (env_data["stats"]["updateCheckEnabled"], from dashboard/stats,
  already polled by the fast coordinator — no separate check needed).
  installed_version shows the image tag (no digest available at this
  tier). latest_version flips to the "update-pending" sentinel when the
  fast coordinator's cheap GET /api/containers/pending-updates poll
  (Dockhand's own cached scheduled-check results, no registry query of
  its own) flags this container. Install works fully at this tier —
  POST /api/containers/batch-update-stream only needs a container ID,
  never a digest.

  Tier 2 (CONF_ENABLE_PRECISE_UPDATES, purely additive): also runs
  DockhandUpdateCoordinator, a real (deliberately infrequent, default
  24h) POST /api/containers/check-updates registry query per environment.
  When present, its data layers precise digest-based installed_version/
  latest_version onto the *same* entities Tier 1 already created — it
  does not create separate entities.

The "Install" button triggers a pull-and-recreate via
POST /api/containers/batch-update-stream, which (unlike the older
batch-update endpoint) runs vulnerability scanning when a scanner is
configured on the environment, and blocks the update per the environment's
configured vulnerabilityCriteria. Progress is reported via
update_percentage, derived from polling GET /api/jobs/{id}.

Version string strategy:
  installed_version — Tier 2: first 12 hex chars of the sha256 from
                      currentDigest ("image@sha256:<hex>"). Tier 1
                      (no Tier 2 data yet): the container's image tag.
  latest_version    — Tier 2 hasUpdate=True: first 12 hex chars of
                      newDigest ("sha256:<hex>", no image prefix).
                      Tier 1 only, cache flagged: "update-pending"
                      (deliberately not a real digest/version string).
                      Otherwise: same as installed_version.

systemContainer/updateDisabled (whether Install is offered at all) used
to only be known via check-updates. systemContainer is Dockhand's own
precomputed field on the regular containers list already (GET
/api/containers) — the same isSystemContainer(imageName) classification
Dockhand's UI itself uses, image-name matching we don't need to
replicate and can't get out of sync with (if Dockhand adds a new system
container type, this field reflects it automatically). updateDisabled
has no such precomputed field on that endpoint, so it's still computed
client-side from the `dockhand.update` label — see
helpers._is_update_disabled_by_label, kept in sync with Dockhand's own
matching logic. Both work identically whether or not Tier 2 is enabled.
"""

import asyncio
import logging
from typing import Any

from homeassistant.components.update import UpdateEntity, UpdateEntityFeature
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import CONF_ENABLE_UPDATE_ENTITIES, DEFAULT_ENABLE_UPDATE_ENTITIES, DOMAIN
from .coordinator import DockhandFastCoordinator, DockhandUpdateCoordinator
from .helpers import _all_envs, _coordinator_env, _is_update_disabled_by_label

_LOGGER = logging.getLogger(__name__)

# Updates trigger pull-and-recreate via the API — serialise to avoid concurrent
# pulls on the same host. 0 = coordinator manages updates, no HA-level limit.
PARALLEL_UPDATES = 0

# How often to poll GET /api/jobs/{id} while an install is running.
_JOB_POLL_INTERVAL_SECONDS = 2
# Upper bound on total wait — protects against a job stuck in "running"
# forever (e.g. a Dockhand-side crash mid-job). Generous because a scan
# plus a large image pull can legitimately take several minutes.
_JOB_POLL_MAX_ATTEMPTS = 900  # 900 * 2s = 30 minutes

# Dockhand's own "current"/"total" on batch-update-stream progress lines
# are a batch-index counter (current = i+1 over containerIds.length), NOT
# intra-container progress — meaningless here since we always send exactly
# one container ID, so total is always 1 and current/total hits 100% on
# the very first progress line (step="pulling"), long before the actual
# pull/scan/recreate work happens. We derive our own percentage instead,
# from the fixed, known pipeline of "step" values Dockhand's route always
# emits in this order for a single container: pulling -> scanning (only
# if a scanner is configured) -> creating -> done. Monotonically
# increasing only, in case of any out-of-order duplicate step events
# (e.g. "creating" is sent more than once via a progress callback during
# the actual recreate call).
_STEP_PERCENTAGES = {
    "pulling": 20,
    "scanning": 45,
    "creating": 75,
    "done": 100,
}


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
    """Set up container update entities.

    Tier 1 entities are created for every container in an environment
    with updateCheckEnabled=True, sourced entirely from the fast
    coordinator — independent of whether Tier 2 (update_coordinator) is
    configured at all.

    Removal (when updateCheckEnabled turns off for an environment, a
    container disappears, or CONF_ENABLE_UPDATE_ENTITIES itself is
    turned off) is centralized in __init__.py's
    _cleanup_stale_registry/_build_live_sets, alongside every other
    conditionally-present entity type (images, networks, volumes,
    runtime controls, git stack entities) — not handled here. That
    function already distinguishes "environment confirmed online but
    this item is genuinely gone" from "poll failed / environment
    offline" (which must never trigger cleanup), so update entities
    reuse that same safety logic rather than duplicating it.
    """
    if not entry.options.get(
        CONF_ENABLE_UPDATE_ENTITIES, DEFAULT_ENABLE_UPDATE_ENTITIES
    ):
        return

    data = entry.runtime_data
    fast_coordinator = data.fast_coordinator
    update_coordinator = data.update_coordinator  # Tier 2, may be None

    seen: set[str] = set()

    def _add_new_entities() -> None:
        fast_data = _all_envs(fast_coordinator.data)
        new_entities = []

        for env_id, env_data in fast_data.items():
            stats = env_data.get("stats") or {}
            if not stats.get("updateCheckEnabled"):
                continue
            env_name = stats.get("name", f"Environment {env_id}")

            for container in env_data.get("containers") or []:
                container_name = container.get("name", "")
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
                    )
                )

        if new_entities:
            async_add_entities(new_entities)

    # Add entities for initial data
    _add_new_entities()

    # Re-run on each fast-coordinator update to pick up new containers or
    # environments that just had update-check turned on in Dockhand.
    entry.async_on_unload(fast_coordinator.async_add_listener(_add_new_entities))


class ContainerUpdateEntity(CoordinatorEntity[DockhandFastCoordinator], UpdateEntity):
    """Update entity for a single container's image update status.

    Both identity (unique_id) and device attachment use (env_id, container_name).
    Docker enforces unique container names per host, so this is stable across
    container recreation (image updates), preserving historical entity data and
    automations.

    Primary coordinator is the fast one — Tier 1 works off it alone.
    update_coordinator (Tier 2) is optional and only consulted directly for
    richer digest data when present; it is never required for this entity
    to exist, be available, or support Install.
    """

    _attr_has_entity_name = True

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        update_coordinator: DockhandUpdateCoordinator | None,
        entry_id: str,
        env_id: int,
        env_name: str,
        container_name: str,
    ) -> None:
        super().__init__(fast_coordinator)
        self._update_coordinator = update_coordinator
        self._entry_id = entry_id
        self._env_id = env_id
        self._container_name = container_name

        self._attr_unique_id = f"{entry_id}_{env_id}_update_{container_name}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, f"container_{env_id}_{container_name}")},
        )

        self._update_supported_features()

    def _container(self) -> dict | None:
        """Look up the current container dict by name from the fast
        coordinator — name is stable across container recreation."""
        fast_data = _all_envs(self.coordinator.data)
        for c in (fast_data.get(self._env_id) or {}).get("containers") or []:
            if c.get("name") == self._container_name:
                return c
        return None

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"name": self._container_name}

    def _check_updates_item(self) -> dict:
        """Return the current Tier 2 (check-updates) payload for this
        container, if update_coordinator is configured and has data for
        it. Empty dict otherwise — Tier 1 properties all handle that
        gracefully, since Tier 2 is purely additive.

        Looked up by the container's *current* id (from Tier 1's fresh
        container list), not by name. Tier 2's data is keyed by
        container_id at fetch time; a container recreated since Tier 2
        last ran (the normal effect of an image update) gets a new id,
        so its stale entry — still sitting under the old id — simply
        won't be found here. Previously this scanned by containerName
        instead, which meant a resolved update kept showing as pending
        for up to 24h (Tier 2's poll interval) after the container was
        actually recreated with the update already applied, since the
        name-matched stale entry doesn't know it's describing a
        container that no longer exists. Real bug, reported by Raetha.
        """
        if self._update_coordinator is None:
            return {}
        c = self._container()
        if not c or not c.get("id"):
            return {}
        env_data = _coordinator_env(self._update_coordinator.data, self._env_id)
        return env_data.get(c["id"]) or {}

    def _update_supported_features(self) -> None:
        c = self._container() or {}
        labels = c.get("labels") or {}
        update_disabled = _is_update_disabled_by_label(labels)
        is_system = bool(c.get("systemContainer"))
        if update_disabled or is_system:
            self._attr_supported_features = UpdateEntityFeature.RELEASE_NOTES
        else:
            self._attr_supported_features = (
                UpdateEntityFeature.INSTALL
                | UpdateEntityFeature.RELEASE_NOTES
                | UpdateEntityFeature.PROGRESS
            )

    @property
    def installed_version(self) -> str | None:
        digest = self._check_updates_item().get("currentDigest", "")
        if digest:
            return _short_digest(digest)
        # Tier 1 fallback: no real digest available yet, show the image
        # tag instead — still meaningful, just not a precise version.
        c = self._container()
        return (c or {}).get("image") or None

    def _pending_via_dockhand_cache(self) -> bool:
        """True if Dockhand's own (cheap, no-registry-query) pending-updates
        cache already flags this container, keyed by its current container
        ID from the fast coordinator's container list."""
        fast_data = _all_envs(self.coordinator.data)
        env_data = fast_data.get(self._env_id) or {}
        pending_ids = env_data.get("pending_update_container_ids") or set()
        if not pending_ids:
            return False
        c = self._container()
        return bool(c) and c.get("id") in pending_ids

    @property
    def latest_version(self) -> str | None:
        item = self._check_updates_item()
        if item.get("hasUpdate"):
            new_digest = item.get("newDigest", "")
            return _short_digest(new_digest) if new_digest else self.installed_version
        if self._pending_via_dockhand_cache():
            # Deliberately not a real digest — see module docstring. This
            # is Tier 1's own signal, present whether or not Tier 2 (real
            # digest data) is configured at all.
            return "update-pending"
        return self.installed_version

    def _scanner_enabled(self) -> bool:
        """Return True if vulnerability scanning is enabled on this environment."""
        fast_data = _all_envs(self.coordinator.data)
        stats = (fast_data.get(self._env_id) or {}).get("stats") or {}
        return bool(stats.get("scannerEnabled", False))

    @property
    def release_summary(self) -> str | None:
        """Not used — release notes cover all warning content."""
        return None

    async def async_release_notes(self) -> str | None:
        """Full release notes shown in the more-info dialog — supports Markdown."""
        c = self._container()
        if not c:
            return None
        parts = []

        image_name = c.get("image")
        if image_name:
            parts.append(f"Image: {image_name}")

        if self._scanner_enabled():
            msg = (
                "This environment scans images for vulnerabilities before"
                " updating. Depending on its configured policy, this update"
                " may be blocked if findings exceed the threshold."
            )
            parts.append(f"<ha-alert alert-type='info'>{msg}</ha-alert>")

        labels = c.get("labels") or {}
        if c.get("systemContainer"):
            msg = (
                "This is a system container and must be updated"
                " directly on the docker host."
            )
            parts.append(f"<ha-alert alert-type='warning'>{msg}</ha-alert>")
        elif _is_update_disabled_by_label(labels):
            msg = "Updates disabled via `dockhand.update=false` label."
            parts.append(f"<ha-alert alert-type='info'>{msg}</ha-alert>")

        return "\n\n".join(parts) if parts else None

    @property
    def available(self) -> bool:
        return self._container() is not None and super().available

    def _handle_coordinator_update(self) -> None:
        self._update_supported_features()
        super()._handle_coordinator_update()

    async def async_install(self, version: str | None, backup: bool, **kwargs) -> None:
        """Trigger a scanned pull-and-recreate update via Dockhand's job API.

        Only ever needs the container's current ID — never a digest — so
        this works identically whether Tier 2 has ever run for this
        container or not.
        """
        c = self._container()
        container_id = c.get("id", "") if c else ""
        if not container_id:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )

        self._attr_in_progress = True
        self._attr_update_percentage = 0
        self.async_write_ha_state()

        try:
            criteria = await self._vulnerability_criteria()
            job_id = await self.coordinator.client.async_start_batch_update_stream(
                self._env_id, [container_id], vulnerability_criteria=criteria
            )
            await self._poll_job(job_id, container_id)
        except HomeAssistantError:
            raise
        except Exception as err:
            _LOGGER.error(
                "batch-update-stream failed for container '%s' (env %s, id %s): %s: %s",
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
        finally:
            self._attr_in_progress = False
            self._attr_update_percentage = None
            self.async_write_ha_state()
        # Request a refresh so the entity state reflects the result. Also
        # nudge Tier 2 if configured, so a precise digest shows up sooner
        # than its own (up to 24h) schedule would otherwise provide.
        # Deliberately async_refresh(), not async_request_refresh() — see
        # DockhandCheckUpdatesButton's docstring in button.py for why the
        # latter can silently no-op here (a live, non-obvious debouncer
        # cooldown gotcha, not a hypothetical).
        await self.coordinator.async_refresh()
        if self._update_coordinator is not None:
            await self._update_coordinator.async_refresh()

    async def _vulnerability_criteria(self) -> str | None:
        """Fetch this environment's configured vulnerability blocking policy.

        Best-effort: falls back to None (Dockhand's own server-side default,
        "never" — scan but don't block) if the settings call fails, so a
        transient error here doesn't prevent the update itself from running.
        """
        try:
            settings = await self.coordinator.client.async_get_update_check_settings(
                self._env_id
            )
            return settings.get("vulnerabilityCriteria")
        except Exception as err:
            _LOGGER.warning(
                "Could not fetch vulnerability criteria for env %s — Dockhand"
                " will use its own default ('never': scan but don't block): %s",
                self._env_id,
                err,
            )
            return None

    async def _poll_job(self, job_id: str, container_id: str) -> None:
        """Poll GET /api/jobs/{id} until the job finishes, reporting progress.

        Dockhand's job endpoint returns the full accumulated "lines" array on
        every call rather than a stream — we re-scan it each poll, which is
        cheap since a single-container update produces at most a handful of
        lines. Raises HomeAssistantError on a blocked update, a per-container
        failure, a job-level error, or a timeout.
        """
        for _ in range(_JOB_POLL_MAX_ATTEMPTS):
            job = await self.coordinator.client.async_get_job(job_id)

            for line in job.get("lines") or []:
                data = line.get("data") or {}
                if data.get("containerId") not in (container_id, None):
                    continue

                step = data.get("step")
                new_pct = _STEP_PERCENTAGES.get(step)
                if new_pct is not None and (
                    self._attr_update_percentage is None
                    or new_pct > self._attr_update_percentage
                ):
                    self._attr_update_percentage = new_pct
                    self.async_write_ha_state()

                event_type = data.get("type")
                if event_type == "blocked":
                    reason = data.get("blockReason", "vulnerability findings")
                    raise HomeAssistantError(
                        translation_domain="dockhand",
                        translation_key="action_failed",
                        translation_placeholders={"error": f"Update blocked: {reason}"},
                    )
                if event_type == "progress" and data.get("step") == "failed":
                    raise HomeAssistantError(
                        translation_domain="dockhand",
                        translation_key="action_failed",
                        translation_placeholders={
                            "error": data.get("error", "update failed")
                        },
                    )

            status = job.get("status")
            if status == "done":
                return
            if status == "error":
                result = job.get("result") or {}
                raise HomeAssistantError(
                    translation_domain="dockhand",
                    translation_key="action_failed",
                    translation_placeholders={
                        "error": result.get("error", "update job failed")
                    },
                )

            await asyncio.sleep(_JOB_POLL_INTERVAL_SECONDS)

        raise HomeAssistantError(
            translation_domain="dockhand",
            translation_key="action_failed",
            translation_placeholders={"error": "update timed out waiting for Dockhand"},
        )
