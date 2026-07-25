import asyncio
from typing import Any

from homeassistant.components.button import ButtonEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import DockhandConfigEntry
from .const import (
    CONF_API_URL,
    CONF_ENABLE_UPDATE_ENTITIES,
    DEFAULT_ENABLE_UPDATE_ENTITIES,
)
from .coordinator import (
    DockhandFastCoordinator,
    DockhandSlowCoordinator,
    DockhandUpdateCoordinator,
)
from .helpers import (
    _all_envs,
    _compose_project,
    _container_device,
    _container_has_pending_update,
    _coordinator_env,
    _env_device,
    _stack_device,
    _stack_has_system_container,
)

# Coordinator-based platform. 0 = no HA-level parallel update limit;
# the coordinator serialises data access.
PARALLEL_UPDATES = 0

# Same values as update.py's _poll_job — one shared job-polling budget
# across both platforms since Dockhand's job endpoint behaves identically
# either way.
_JOB_POLL_INTERVAL_SECONDS = 2
_JOB_POLL_MAX_ATTEMPTS = 900  # 900 * 2s = 30 minutes


async def async_setup_entry(
    hass: HomeAssistant,
    entry: DockhandConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    fast: DockhandFastCoordinator = entry.runtime_data.fast_coordinator
    slow: DockhandSlowCoordinator = entry.runtime_data.slow_coordinator
    update_coordinator: DockhandUpdateCoordinator | None = (
        entry.runtime_data.update_coordinator
    )
    client = entry.runtime_data.client
    base_url: str = entry.data.get(CONF_API_URL, "")
    # Tier 1's own pending-updates fetch isn't gated on this option (see
    # __init__.py's _build_live_sets for why), so pending data can still
    # be non-empty here even with the platform off — has_updatable below
    # must check this explicitly, or the bulk button could reappear from
    # Tier 1 data alone for a user who disabled update entities entirely
    # (github.com/raetha/ha-dockhand/issues/23).
    update_entities_enabled = entry.options.get(
        CONF_ENABLE_UPDATE_ENTITIES, DEFAULT_ENABLE_UPDATE_ENTITIES
    )

    known_container_keys: set[str] = set()
    known_stack_ids: set[str] = set()
    known_stack_deploy_ids: set[str] = set()
    known_env_update_ids: set[int] = set()
    known_env_bulk_update_ids: set[int] = set()
    known_git_stack_ids: set[str] = set()

    def _build_entities() -> list[ButtonEntity]:
        new: list[ButtonEntity] = []
        for env_id, env_data in _all_envs(fast.data).items():
            stats = env_data.get("stats") or {}
            env_name = stats.get("name", f"Environment {env_id}")

            # Per-environment "Check for updates" button — always present,
            # regardless of CONF_ENABLE_PRECISE_UPDATES or
            # CONF_ENABLE_UPDATE_ENTITIES (github.com/raetha/ha-dockhand/issues/23
            # design discussion): it's a read-only, user-initiated, one-off
            # forced check, not a way to perform updates, so neither option
            # needs to gate its existence. What each option controls is
            # only what happens to the *result* — see DockhandCheckUpdatesButton
            # itself.
            if env_id not in known_env_update_ids:
                known_env_update_ids.add(env_id)
                new.append(
                    DockhandCheckUpdatesButton(
                        fast,
                        client,
                        update_coordinator,
                        update_entities_enabled,
                        entry.entry_id,
                        env_id,
                        env_name,
                        base_url,
                    )
                )

            # Bulk "Update all" button — conditionally present, not just
            # conditionally enabled: only created while CONF_ENABLE_UPDATE_ENTITIES
            # is on and there is at least one non-system-container pending
            # update in this environment, matching Dockhand's own {#if
            # updatableContainersCount > 0} gating for its own "Update all"
            # button. Removed via the central cleanup system the moment
            # that's no longer true.
            #
            # Considers both Tier 1 (pending_update_container_ids) and
            # Tier 2 (update_coordinator, when configured) via the shared
            # _container_has_pending_update() helper — same definition of
            # "needs an update" the update entities themselves use, so
            # this can never disagree with what's actually shown per
            # container. Safe to fold Tier 2 in here specifically because
            # that helper looks Tier 2 up by each container's *current*
            # id: a stale entry left over from a since-recreated
            # container is keyed under an id that no longer exists on
            # any current container, so it can never cause this button
            # to appear for an update that's already resolved.
            pending = env_data.get("pending_update_container_ids") or set()
            env_containers = env_data.get("containers") or []
            system_ids = {
                c.get("id")
                for c in env_containers
                if c.get("systemContainer") and c.get("id")
            }
            update_env_data = (
                _coordinator_env(update_coordinator.data, env_id)
                if update_coordinator is not None
                else None
            )
            has_updatable = update_entities_enabled and any(
                _container_has_pending_update(c, pending, update_env_data)
                for c in env_containers
                if c.get("id") not in system_ids
            )
            if has_updatable and env_id not in known_env_bulk_update_ids:
                known_env_bulk_update_ids.add(env_id)
                new.append(
                    DockhandEnvBulkUpdateButton(
                        fast,
                        update_coordinator,
                        client,
                        entry.entry_id,
                        env_id,
                        env_name,
                        base_url,
                    )
                )

            for container in env_data.get("containers") or []:
                key = f"{env_id}_{container.get('name', '')}"
                if key not in known_container_keys and not container.get(
                    "systemContainer"
                ):
                    known_container_keys.add(key)
                    new.append(
                        DockhandContainerRestartButton(
                            fast,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            container,
                        )
                    )

            for stack in env_data.get("stacks") or []:
                sid = f"{env_id}_{stack['name']}"
                has_system = _stack_has_system_container(
                    stack, env_data.get("containers")
                )
                if sid not in known_stack_ids and not has_system:
                    known_stack_ids.add(sid)
                    new.append(
                        DockhandStackRestartButton(
                            fast,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            stack,
                        )
                    )
                if (
                    sid not in known_stack_deploy_ids
                    and not has_system
                    and stack.get("sourceType") == "internal"
                ):
                    known_stack_deploy_ids.add(sid)
                    new.append(
                        DockhandStackDeployButton(
                            fast,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            stack,
                        )
                    )

        return new

    def _build_slow_entities() -> list[ButtonEntity]:
        new: list[ButtonEntity] = []
        slow_envs = _all_envs(slow.data)
        fast_data = _all_envs(fast.data)
        for env_id, env_data in slow_envs.items():
            fast_stats = (fast_data.get(env_id) or {}).get("stats") or {}
            env_name = fast_stats.get("name", f"Environment {env_id}")
            for git_stack in env_data.get("git_stacks") or []:
                gsid = f"{env_id}_{git_stack.get('stackName', '')}"
                if gsid not in known_git_stack_ids:
                    known_git_stack_ids.add(gsid)
                    new += [
                        DockhandGitStackDeployButton(
                            fast,
                            slow,
                            client,
                            entry.entry_id,
                            env_id,
                            env_name,
                            base_url,
                            git_stack,
                        ),
                    ]
        return new

    async_add_entities(_build_entities())
    async_add_entities(_build_slow_entities())
    entry.async_on_unload(
        fast.async_add_listener(lambda: async_add_entities(_build_entities()))
    )
    entry.async_on_unload(
        slow.async_add_listener(lambda: async_add_entities(_build_slow_entities()))
    )


class _BaseFastContainerButton(
    CoordinatorEntity[DockhandFastCoordinator], ButtonEntity
):
    """Common base for per-container buttons."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        container: dict,
    ) -> None:
        super().__init__(coordinator)
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._container_name = container.get("name", "")

    def _container(self) -> dict | None:
        for c in (
            _coordinator_env(self.coordinator.data, self._env_id).get("containers")
            or []
        ):
            if c.get("name") == self._container_name:
                return c
        return None

    @property
    def device_info(self) -> DeviceInfo:
        c = self._container()
        return _container_device(
            self._container_name,
            self._env_id,
            self._env_name,
            self._base_url,
            _compose_project(c),
        )


class _BaseFastStackButton(CoordinatorEntity[DockhandFastCoordinator], ButtonEntity):
    """Common base for per-stack buttons."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        stack: dict,
    ) -> None:
        super().__init__(coordinator)
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._stack_name = stack.get("name", "")

    def _stack(self) -> dict | None:
        for s in (
            _coordinator_env(self.coordinator.data, self._env_id).get("stacks") or []
        ):
            if s.get("name") == self._stack_name:
                return s
        return None

    @property
    def device_info(self) -> DeviceInfo:
        s = self._stack()
        return _stack_device(
            self._stack_name,
            self._env_id,
            self._env_name,
            self._base_url,
            source_type=(s or {}).get("sourceType"),
        )


class DockhandContainerRestartButton(_BaseFastContainerButton):
    """Restart a running container."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "restart"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        container: dict,
    ) -> None:
        super().__init__(
            coordinator, client, entry_id, env_id, env_name, base_url, container
        )
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_container_{self._container_name}_restart"
        )

    async def async_press(self) -> None:
        c = self._container()
        if not c:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="container_not_found",
            )
        try:
            await self._client.async_restart_container(self._env_id, c["id"])
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_refresh()


class DockhandStackRestartButton(_BaseFastStackButton):
    """Restart a running compose stack."""

    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "restart"

    def __init__(
        self,
        coordinator: DockhandFastCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        stack: dict,
    ) -> None:
        super().__init__(
            coordinator, client, entry_id, env_id, env_name, base_url, stack
        )
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_stack_{self._stack_name}_restart"
        )

    async def async_press(self) -> None:
        try:
            await self._client.async_restart_stack(self._env_id, self._stack_name)
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_refresh()


class DockhandStackDeployButton(_BaseFastStackButton):
    """Redeploy an internal (non-git) stack — pull latest images and
    recreate whatever Compose's own diffing decides changed.

    Labeled "Redeploy" — confirmed as Dockhand's own literal button
    title for this exact action (RedeployPopover.svelte's own
    `title="Redeploy"`), not a name we chose. See async_deploy_stack's
    docstring for exactly which Dockhand UI default this mirrors.

    Only created for stacks with sourceType == "internal" — confirmed
    from Dockhand's own frontend source that its Redeploy control is
    hidden entirely for "external"/untracked stacks (no compose file
    location to redeploy from). Git stacks have their own Deploy button
    via a completely separate code path (DockhandGitStackDeployButton),
    which dynamically renames itself "Deploy"/"Sync from Git" to match
    Dockhand's own state-dependent labeling for that button — the two
    buttons are named independently, not required to match each other.
    """

    _attr_translation_key = "stack_deploy"

    def __init__(self, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_stack_{self._stack_name}_deploy"
        )

    async def async_press(self) -> None:
        if not self._stack():
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": "Stack not found"},
            )
        try:
            result = await self._client.async_deploy_stack(
                self._env_id, self._stack_name
            )
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        # Dockhand returns HTTP 200 with {"success": false, "error": "..."}
        # for an expected failure mode (e.g. compose file location not
        # configured) rather than an HTTP error — _request() wouldn't
        # raise on this, so check explicitly.
        if not result.get("success", True):
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={
                    "error": result.get("error", "Stack deploy failed")
                },
            )
        await self.coordinator.async_refresh()


class DockhandEnvBulkUpdateButton(
    CoordinatorEntity[DockhandFastCoordinator], ButtonEntity
):
    """Update every container in this environment with a pending update,
    in a single batch-update-stream call — matching Dockhand's own
    "Update all" button exactly (confirmed from its frontend source:
    same endpoint, same non-system-container exclusion).

    Conditionally present, not just conditionally enabled: only created
    when there is at least one non-system-container pending update in
    this environment (same as Dockhand's own `{#if updatableContainersCount
    > 0}` gating for its "Update all" button) — removed via the central
    cleanup system the moment there's nothing left to update, exactly
    mirroring how the button disappears in Dockhand's own UI rather than
    just going idle/disabled.

    "Pending update" here means either Tier 1 (Dockhand's own cached
    pending-updates check) or Tier 2 (the optional precise digest-based
    check-updates coordinator) — via the shared _container_has_pending_update()
    helper, same definition update.py's own entities use. Folding Tier 2
    in is safe against staleness specifically because that helper looks
    Tier 2 up by each container's *current* id: a container recreated
    since Tier 2 last polled (the normal effect of an image update) gets
    a new id, so Tier 2's old entry — still under the old id — is never
    found and can't keep this button alive, or its own container list,
    past the point an update actually resolved.

    Named "Update all containers" — a static name via translation_key,
    not a live count in the name. An earlier version showed "Update all
    (N)" matching Dockhand's own wording, but a changing friendly_name on
    a persistent (not recreated) entity reads as confusing entity churn
    in HA's own UI/history, so this reverted to a plain static name.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "env_bulk_update"

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        update_coordinator: DockhandUpdateCoordinator | None,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
    ) -> None:
        super().__init__(fast_coordinator)
        self._update_coordinator = update_coordinator
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._attr_unique_id = f"{entry_id}_{env_id}_bulk_update"

    def _updatable_container_ids(self) -> list[str]:
        """Pending-update container IDs for this env, excluding system
        containers — same exclusion Dockhand's own "Update all" applies
        (confirmed from its frontend: `!container.systemContainer`).

        Uses the same combined Tier 1 + Tier 2 _container_has_pending_update()
        definition as this button's own creation gate (see async_setup_entry
        above) and the update entities in update.py, so the button can
        never exist while reporting nothing to actually update, and never
        omit a container Tier 2 alone flagged. Install itself doesn't care
        which tier flagged a container — batch-update-stream only needs a
        container id — so there's no reason the trigger list should be
        more restrictive than the button's own visibility.
        """
        env_data = _coordinator_env(self.coordinator.data, self._env_id)
        containers = env_data.get("containers") or []
        pending = env_data.get("pending_update_container_ids") or set()
        system_ids = {
            c.get("id") for c in containers if c.get("systemContainer") and c.get("id")
        }
        update_env_data = (
            _coordinator_env(self._update_coordinator.data, self._env_id)
            if self._update_coordinator is not None
            else None
        )
        return [
            c["id"]
            for c in containers
            if c.get("id") not in system_ids
            and c.get("id")
            and _container_has_pending_update(c, pending, update_env_data)
        ]

    @property
    def available(self) -> bool:
        return super().available and bool(self._updatable_container_ids())

    @property
    def device_info(self) -> DeviceInfo:
        return _env_device(self._env_id, self._env_name, self._base_url)

    async def _vulnerability_criteria(self) -> str | None:
        """Same best-effort fetch-then-fall-back-to-Dockhand's-own-default
        pattern as the per-container update entities in update.py."""
        try:
            settings = await self._client.async_get_update_check_settings(self._env_id)
            return settings.get("vulnerabilityCriteria")
        except Exception:
            return None

    async def async_press(self) -> None:
        container_ids = self._updatable_container_ids()
        if not container_ids:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": "No pending updates"},
            )
        try:
            criteria = await self._vulnerability_criteria()
            job_id = await self._client.async_start_batch_update_stream(
                self._env_id, container_ids, vulnerability_criteria=criteria
            )
            await self._poll_job(job_id)
        except HomeAssistantError:
            raise
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_refresh()

    async def _poll_job(self, job_id: str) -> None:
        """Poll GET /api/jobs/{id} until the whole batch finishes.

        Unlike update.py's per-entity _poll_job, this covers multiple
        containers in one job with no single update_percentage to
        report (ButtonEntity has no progress concept) — collects every
        per-container failure/block across the batch and raises a
        single summary error covering all of them, rather than stopping
        at the first one, since a partial batch failure shouldn't hide
        that other containers in the same press may have failed too.
        """
        failures: list[str] = []
        for _ in range(_JOB_POLL_MAX_ATTEMPTS):
            job = await self._client.async_get_job(job_id)

            for line in job.get("lines") or []:
                data = line.get("data") or {}
                event_type = data.get("type")
                if event_type == "blocked":
                    reason = data.get("blockReason", "vulnerability findings")
                    cid = data.get("containerId", "?")
                    failures.append(f"{cid}: blocked ({reason})")
                elif event_type == "progress" and data.get("step") == "failed":
                    failures.append(
                        f"{data.get('containerId', '?')}: {data.get('error', 'failed')}"
                    )

            status = job.get("status")
            if status == "done":
                if failures:
                    raise HomeAssistantError(
                        translation_domain="dockhand",
                        translation_key="action_failed",
                        translation_placeholders={
                            "error": "; ".join(dict.fromkeys(failures))
                        },
                    )
                return
            if status == "error":
                result = job.get("result") or {}
                raise HomeAssistantError(
                    translation_domain="dockhand",
                    translation_key="action_failed",
                    translation_placeholders={
                        "error": result.get("error", "batch update failed")
                    },
                )
            await asyncio.sleep(_JOB_POLL_INTERVAL_SECONDS)

        raise HomeAssistantError(
            translation_domain="dockhand",
            translation_key="action_failed",
            translation_placeholders={"error": "Timed out waiting for batch update"},
        )


class DockhandCheckUpdatesButton(
    CoordinatorEntity[DockhandFastCoordinator], ButtonEntity
):
    """Trigger an immediate, one-off, user-forced image update check for
    this environment only — always present, regardless of
    CONF_ENABLE_PRECISE_UPDATES or CONF_ENABLE_UPDATE_ENTITIES.

    Design settled on for github.com/raetha/ha-dockhand/issues/23: this
    button is an isolated action, deliberately decoupled from
    DockhandUpdateCoordinator's own scheduled background polling (that
    coordinator may not even exist). Pressing it always calls Dockhand's
    real check-updates API for this environment via the client directly
    — that's the entire point of the button, forcing Dockhand to refresh
    its own cached values right now, which is useful on its own even if
    neither tier is configured to consume the result locally. What
    happens to the *result* then depends on what's actually enabled:

      - CONF_ENABLE_PRECISE_UPDATES on (update_coordinator exists): the
        result also updates Tier 2's data, via
        DockhandUpdateCoordinator.async_merge_check_results() — same
        end effect the button always had, just fed with the response
        already in hand instead of triggering a second, redundant check.

      - CONF_ENABLE_UPDATE_ENTITIES on: the result also updates Tier 1's
        pending_update_container_ids for this environment immediately,
        via DockhandFastCoordinator.async_merge_pending_updates_from_check()
        — this is new: previously Tier 1 had no way to reflect a forced
        check at all until its own next 60s poll happened to line up
        with whatever Dockhand's own cache ended up holding.

      - Neither on: the check still runs (Dockhand's cache still gets
        refreshed), but nothing local captures the response — there's
        nothing configured to show it.

    Attached to the environment device, and genuinely scoped to just
    that environment. This wasn't the original design: pressing this
    button used to call async_refresh() on the whole
    DockhandUpdateCoordinator, which always checks every environment in
    one gather — so pressing environment 1's button silently also
    re-checked environments 2 and 3. That seemed like a reasonable "be
    smart about it" shortcut at the time (Dockhand's own API doesn't
    expose a bulk endpoint, but the coordinator conveniently already
    gathers everything), but it's a real mismatch between what the
    button's device implies and what pressing it actually does — a
    button on environment 1's device visibly changing environment 3's
    update state is a legitimately confusing side effect, not a clever
    optimization. Reverted to matching Dockhand's own UI exactly, which
    has no global "check everything" action either — it's
    environment-by-environment there too. The Updates card's own "Check
    for updates" button presses every environment's button in scope, so
    the same end result (everything gets checked) is still available
    when that's what's wanted — it's just no longer a hidden side effect
    of pressing just one.

    Raises on failure — this is an explicit user action, and a failed
    check should tell the user it failed rather than silently doing
    nothing, unlike the coordinator's own resilient background refresh
    (see coordinator.py's docstrings for that distinction).
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG
    _attr_translation_key = "check_updates"

    def __init__(
        self,
        fast_coordinator: DockhandFastCoordinator,
        client: Any,
        update_coordinator: DockhandUpdateCoordinator | None,
        update_entities_enabled: bool,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
    ) -> None:
        super().__init__(fast_coordinator)
        self._client = client
        self._update_coordinator = update_coordinator
        self._update_entities_enabled = update_entities_enabled
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._attr_unique_id = f"{entry_id}_{env_id}_check_updates"

    @property
    def device_info(self) -> DeviceInfo:
        return _env_device(self._env_id, self._env_name, self._base_url)

    async def async_press(self) -> None:
        try:
            items = await self._client.async_check_container_updates(self._env_id)
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err

        if self._update_coordinator is not None:
            self._update_coordinator.async_merge_check_results(self._env_id, items)

        if self._update_entities_enabled:
            pending_ids = {
                item["containerId"]
                for item in items
                if item.get("hasUpdate") and item.get("containerId")
            }
            self.coordinator.async_merge_pending_updates_from_check(
                self._env_id, pending_ids
            )


class _BaseSlowGitStackButton(CoordinatorEntity[DockhandSlowCoordinator], ButtonEntity):
    """Common base for per-git-stack buttons (slow coordinator).

    Lives on the same device as the regular Stack — see
    sensor.BaseSlowGitStackSensor for why there's no separate device type.
    """

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.CONFIG

    def __init__(
        self,
        coordinator: DockhandSlowCoordinator,
        client: Any,
        entry_id: str,
        env_id: int,
        env_name: str,
        base_url: str,
        git_stack: dict,
    ) -> None:
        super().__init__(coordinator)
        self._client = client
        self._entry_id = entry_id
        self._env_id = env_id
        self._env_name = env_name
        self._base_url = base_url
        self._stack_name = git_stack.get("stackName", "")

    def _git_stack(self) -> dict | None:
        slow_data = self.coordinator.data or {}
        env = _coordinator_env(slow_data, self._env_id)
        for gs in env.get("git_stacks") or []:
            if gs.get("stackName") == self._stack_name:
                return gs
        return None

    @property
    def device_info(self) -> DeviceInfo:
        return _stack_device(
            self._stack_name,
            self._env_id,
            self._env_name,
            self._base_url,
            source_type="git",
        )


class DockhandGitStackDeployButton(_BaseSlowGitStackButton):
    """Pull latest and redeploy the stack.

    name and icon are live @properties matching Dockhand's own state-
    dependent labeling exactly, confirmed from its frontend source:
    "Deploy" + a rocket icon when the stack is down (status 'not
    deployed' or 'created'), "Sync from Git" + a refresh icon otherwise
    — both cases call the identical underlying action in Dockhand
    (deployGitStackWithProgress), it's purely a cosmetic change for UX
    clarity based on context, not two different operations. Our button
    mirrors that same relabeling for the same reason.

    If Dockhand ever changes this terminology or iconography, this needs
    to be updated to match — check stacks/+page.svelte's conditional
    around GitDeployProgressPopover on a future Dockhand version review.
    """

    _attr_translation_key = "git_stack_deploy"

    def __init__(
        self, fast_coordinator: DockhandFastCoordinator, *args, **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self._fast_coordinator = fast_coordinator
        self._attr_unique_id = (
            f"{self._entry_id}_{self._env_id}_stack_{self._stack_name}_git_deploy"
        )

    def _is_down(self) -> bool:
        for s in (
            _coordinator_env(self._fast_coordinator.data, self._env_id).get("stacks")
            or []
        ):
            if s.get("name") == self._stack_name:
                return s.get("status") in ("not deployed", "created")
        return False

    @property
    def name(self) -> str:
        return "Deploy" if self._is_down() else "Sync from Git"

    @property
    def icon(self) -> str:
        # Rocket for Deploy, refresh (Dockhand's own RefreshCw, styled
        # like its restart icon) for Sync from Git — same source as name.
        return "mdi:rocket-launch-outline" if self._is_down() else "mdi:refresh"

    async def async_press(self) -> None:
        gs = self._git_stack()
        if not gs:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="git_stack_not_found",
            )
        try:
            await self._client.async_deploy_git_stack(gs["id"])
        except Exception as err:
            raise HomeAssistantError(
                translation_domain="dockhand",
                translation_key="action_failed",
                translation_placeholders={"error": str(err)},
            ) from err
        await self.coordinator.async_refresh()
