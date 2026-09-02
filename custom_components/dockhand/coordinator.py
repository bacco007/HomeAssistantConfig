import asyncio
import logging
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import DockhandAuthError, DockhandClient
from .const import (
    CONF_ENABLE_CONTAINER_STATS,
    CONF_ENABLE_IMAGES,
    CONF_ENABLE_NETWORKS,
    CONF_ENABLE_RUNTIME_CONTROLS,
    CONF_ENABLE_SCHEDULES,
    CONF_ENABLE_VOLUMES,
    CONF_POLL_INTERVAL,
    CONF_POLL_INTERVAL_SLOW,
    CONF_POLL_INTERVAL_UPDATES,
    DEFAULT_ENABLE_CONTAINER_STATS,
    DEFAULT_POLL_INTERVAL,
    DEFAULT_POLL_INTERVAL_SLOW,
    DEFAULT_POLL_INTERVAL_UPDATES,
    DOMAIN,
)
from .helpers import (
    _all_envs,
    _compose_project,
    _coordinator_env,
    _extract_runtime_config,
)

_LOGGER = logging.getLogger(__name__)

# Seconds to wait before each successive 401 retry in DockhandFastCoordinator.
# Without retries, one transient 401 (e.g. during a brief Dockhand restart or
# a momentary connectivity hiccup) fires ConfigEntryAuthFailed immediately —
# prompting the user to "re-authenticate" with a token that is still valid.
# These delays give Dockhand time to recover before we surface a re-auth dialog
# that would turn out to be unnecessary. Total maximum wait before giving up:
# sum(_AUTH_RETRY_DELAYS) seconds = 30s across 2 retries.
_AUTH_RETRY_DELAYS: tuple[int, ...] = (5, 25)


def _safe_list(value: Any) -> list:
    return value if isinstance(value, list) else []


def _unwrap(
    val: Any,
    default: Any,
    label: str,
    failures: set[str] | None = None,
    key: str | None = None,
) -> Any:
    """Unwrap a asyncio.gather(..., return_exceptions=True) result,
    returning `default` and logging a warning if it's an Exception.

    `failures`/`key` are optional so this can still be called the old way
    for genuinely inconsequential fetches — but every call site that
    feeds into anything cleanup logic could act on (see __init__.py's
    _build_live_sets) MUST pass both. Without them, a real fetch failure
    (DNS resolution failure, timeout, connection reset, a 5xx — anything)
    silently becomes indistinguishable from "genuinely empty," and
    downstream cleanup — which exists specifically to remove entities for
    things that are actually gone — has no way to tell the difference.
    This was a real, reported bug: a transient schedules-fetch failure
    here used to just become `schedules: []`, with the coordinator update
    still reporting success, causing every schedule entity to be wrongly
    treated as confirmed-deleted. See docs/ARCHITECTURE.md §9 for the
    full mechanism and how `fetch_failures` closes it for every resource
    this coordinator fetches, not just schedules.
    """
    if isinstance(val, Exception):
        _LOGGER.warning("Dockhand: error fetching %s: %s", label, val)
        if failures is not None and key is not None:
            failures.add(key)
        return default
    return val


class DockhandFastCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls 60s: dashboard stats, containers, stacks, container resource
    stats, pending update flags.

    Pending update flags are fetched per-environment whenever that
    environment has updateCheckEnabled=True (from its own dashboard
    stats) — not gated by CONF_ENABLE_PRECISE_UPDATES. This is what backs the
    update platform's baseline (digest-free) entities, which now exist
    automatically for any environment where update-check is configured
    in Dockhand itself. CONF_ENABLE_PRECISE_UPDATES only controls whether the
    separate, opt-in DockhandUpdateCoordinator also runs (real registry
    queries) to layer precise digest-based versions onto those same
    entities.

    Shape: {
        "environments": {
            env_id: {
                "stats": {},
                "containers": [],
                "stacks": [],
                "container_stats": {name: {}},
                "pending_update_container_ids": {container_id, ...},
            }
        }
    }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        config: dict[str, Any],
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        self._enable_container_stats = bool(
            config.get(CONF_ENABLE_CONTAINER_STATS, DEFAULT_ENABLE_CONTAINER_STATS)
        )
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_fast",
            update_interval=timedelta(
                seconds=int(config.get(CONF_POLL_INTERVAL, DEFAULT_POLL_INTERVAL))
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        # Retry on 401 before surfacing ConfigEntryAuthFailed. A single transient
        # 401 — e.g. during a brief Dockhand restart or Hawser connectivity hiccup —
        # would otherwise immediately prompt the user to re-authenticate with a
        # token that is still valid. Each entry in _AUTH_RETRY_DELAYS is how long
        # to sleep before that retry attempt; only after all retries are exhausted
        # do we conclude the token is genuinely invalid and surface the re-auth
        # dialog. Non-auth exceptions (network errors, 5xx, ...) still propagate
        # immediately as UpdateFailed — no retry needed there, they don't trigger
        # re-auth anyway.
        _total_attempts = len(_AUTH_RETRY_DELAYS) + 1
        last_auth_err: DockhandAuthError | None = None
        result: dict[str, Any] | None = None

        for attempt, delay_before in enumerate((None, *_AUTH_RETRY_DELAYS), start=1):
            if delay_before is not None:
                _LOGGER.warning(
                    "Dockhand: 401 on attempt %d of %d — waiting %ds before retry "
                    "(may be a transient Dockhand restart rather than a revoked token)",
                    attempt - 1,
                    _total_attempts,
                    delay_before,
                )
                await asyncio.sleep(delay_before)
            try:
                result = await self._fetch()
                if last_auth_err is not None:
                    _LOGGER.info(
                        "Dockhand: authentication recovered on attempt %d of %d "
                        "— token is still valid",
                        attempt,
                        _total_attempts,
                    )
                break
            except DockhandAuthError as err:
                last_auth_err = err
            except Exception as err:
                raise UpdateFailed(f"Fast data error: {err}") from err
        else:
            # Every attempt returned 401 — the token is genuinely invalid or
            # revoked. Surface re-auth so the user can fix it.
            _LOGGER.error(
                "Dockhand: 401 persisted across all %d attempt(s) — surfacing "
                "re-auth. If re-entering the same token immediately resolves it, "
                "this was a transient auth issue; consider filing a report with "
                "your Dockhand logs from around this time.",
                _total_attempts,
            )
            raise ConfigEntryAuthFailed(
                "Dockhand API token is invalid or was revoked. "
                "Go to Settings → Devices & Services → Dockhand → Re-authenticate."
            ) from last_auth_err

        # stats_source is this coordinator's own result — unlike the slow
        # coordinator, which needs the fast coordinator's data to look up
        # environment names, the fast coordinator's own data already has
        # them.
        assert result is not None  # loop always breaks or raises above
        _sync_fetch_issues(self.hass, self.config_entry, "fast", result, result)
        return result

    async def _fetch(self) -> dict[str, Any]:
        # Fetch stats for all environments in a single API call — this is
        # also our only source of which environments exist. We used to
        # call /api/environments separately just for the id list, but
        # every env we need to iterate already has an "id" here, and this
        # endpoint doesn't leak decrypted secrets (tlsKey/hawserToken) the
        # way /api/environments does (see diagnostics.py's redaction
        # comment).
        #
        # A failure here must NOT be swallowed into an empty successful
        # result (previously: catch, log a warning, continue with
        # all_stats_list = []) — that fed "zero stacks/containers for
        # every environment" through every downstream consumer that
        # trusts non-empty coordinator data as authoritative, including
        # _cleanup_stale_registry's "fast coordinator data must be
        # non-empty" guard (an empty *all_stats* still produces a
        # non-empty *fast_coordinator.data*, since _fetch_env still runs
        # per known env_id with stats={} — the guard doesn't catch this).
        # A DNS resolution failure to the Dockhand host is exactly this
        # case: total, transient, and everything should stay put
        # (entities go unavailable via last_update_success, nothing gets
        # cleaned up) until it resolves — not look like every environment
        # just lost all its stacks and containers. Auth failures still
        # propagate immediately for _async_update_data's re-auth handling.
        try:
            all_stats_list = _safe_list(
                await self.client.async_get_all_dashboard_stats()
            )
        except DockhandAuthError:
            raise
        except Exception as err:
            raise UpdateFailed(
                f"Could not reach Dockhand for dashboard stats: {err}"
            ) from err
        all_stats: dict[int, dict] = {
            s["id"]: s for s in all_stats_list if isinstance(s, dict) and "id" in s
        }

        async def _fetch_env(env_id: int) -> tuple[int, dict]:
            update_check_enabled = bool(
                all_stats.get(env_id, {}).get("updateCheckEnabled")
            )

            # Named tasks rather than a positionally-indexed list — two
            # independent conditions (update_check_enabled,
            # enable_container_stats) now decide which calls happen, and
            # position-tracking a list with two independent optional
            # entries is exactly the kind of thing that's easy to get
            # subtly wrong later when a third condition gets added.
            tasks: dict[str, Any] = {
                "containers": self.client.async_get_containers(env_id),
                "stacks": self.client.async_get_stacks(env_id),
            }
            if self._enable_container_stats:
                tasks["container_stats"] = self.client.async_get_container_stats(env_id)
            if update_check_enabled:
                tasks["pending_updates"] = self.client.async_get_pending_updates(env_id)

            results = dict(
                zip(
                    tasks.keys(),
                    await asyncio.gather(*tasks.values(), return_exceptions=True),
                    strict=True,
                )
            )

            # Same tracking, same reasoning, as the slow coordinator's own
            # per-environment fetches (see docs/ARCHITECTURE.md §9) — the
            # difference here is that containers/stacks failing has the
            # highest stakes of any resource in this whole integration:
            # they're what directly determines container/stack device and
            # entity existence via _cleanup_stale_registry, the single
            # most commonly-used entities this integration creates. A
            # swallowed containers or stacks fetch failure here used to
            # be indistinguishable from "this environment genuinely has
            # none anymore," which — for an environment that stayed
            # online per its own dashboard-stats health check while just
            # this one specific fetch failed — would wrongly remove every
            # container and stack device for it. This is the exact same
            # bug class the schedules incident that prompted this whole
            # fix surfaced, just in the other coordinator, for the data
            # that mattered most.
            failures: set[str] = set()

            # Index container stats by name for O(1) lookup from sensor entities.
            # Stopped/exited containers are absent from the stats response — their
            # sensors will return None (unavailable) until the container is running.
            # Empty (not fetched at all) whenever "Enable container stats" is off —
            # nothing consumes it in that case, so there's no reason to pay for
            # the API call every 60s just to throw the result away.
            container_stats: dict[str, dict] = {}
            if "container_stats" in results:
                raw_stats = _safe_list(
                    _unwrap(
                        results["container_stats"],
                        [],
                        f"container_stats env={env_id}",
                        failures,
                        "container_stats",
                    )
                )
                container_stats = {
                    s["name"]: s
                    for s in raw_stats
                    if isinstance(s, dict) and "name" in s
                }

            pending_update_container_ids: set[str] = set()
            if "pending_updates" in results:
                pending = _safe_list(
                    _unwrap(
                        results["pending_updates"],
                        [],
                        f"pending_updates env={env_id}",
                        failures,
                        "pending_updates",
                    )
                )
                pending_update_container_ids = {
                    p["containerId"]
                    for p in pending
                    if isinstance(p, dict) and p.get("containerId")
                }
            return env_id, {
                "stats": all_stats.get(env_id, {}),
                "containers": _safe_list(
                    _unwrap(
                        results["containers"],
                        [],
                        f"containers env={env_id}",
                        failures,
                        "containers",
                    )
                ),
                "stacks": _safe_list(
                    _unwrap(
                        results["stacks"],
                        [],
                        f"stacks env={env_id}",
                        failures,
                        "stacks",
                    )
                ),
                "container_stats": container_stats,
                "pending_update_container_ids": pending_update_container_ids,
                # Which of the above failed to fetch this cycle, rather
                # than genuinely being empty — see _unwrap's own doc
                # comment. Checked by __init__.py's _build_live_sets
                # before trusting an empty containers/stacks list as
                # grounds for device/entity cleanup.
                "fetch_failures": failures,
            }

        out: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env(env_id) for env_id in all_stats], return_exceptions=True
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand fast env error: %s", result)
            else:
                env_id, data = result
                out[env_id] = data
        # Wrapped in "environments", matching the slow and update
        # coordinators' own shape — all three now share one access
        # pattern via _coordinator_env()/_all_envs() (helpers.py), and
        # this coordinator has somewhere to put any future hub-level
        # (non-per-environment) data without another reshape.
        return {"environments": out}

    def async_merge_pending_updates_from_check(
        self, env_id: int, container_ids_with_updates: set[str]
    ) -> None:
        """Merge a fresh Tier 1 pending-update signal for one environment,
        obtained from an on-demand real registry check (the env-level
        "Check for updates" button, DockhandCheckUpdatesButton), directly
        into this coordinator's existing data — without waiting for this
        environment's next scheduled 60s poll.

        Uses async_set_updated_data() rather than a full refresh, same
        reasoning as DockhandUpdateCoordinator.async_check_environment():
        replaces just this one field for this one environment, leaves
        every other environment and every other field of this
        environment's data untouched, and notifies listeners without
        triggering a full refresh of anything else.

        A no-op if this coordinator has no data yet for the environment
        (e.g. it's offline, or this coordinator hasn't completed its own
        first refresh yet) — nothing safe to merge into in that case;
        the next successful poll will populate it normally instead.
        """
        environments = dict(_all_envs(self.data))
        env_data = environments.get(env_id)
        if not env_data:
            return
        new_env_data = dict(env_data)
        new_env_data["pending_update_container_ids"] = set(container_ids_with_updates)
        environments[env_id] = new_env_data
        self.async_set_updated_data({"environments": environments})


class DockhandSlowCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls 600s: images, volumes, networks, schedules, runtime controls
    (all opt-in), git stacks/host/auto_update_settings/env_meta (always —
    cheap bulk calls, not gated), recent_events (gated on collectActivity),
    vulnerabilities (gated on scannerEnabled).

    env_meta (imagePruneEnabled, hawserAgentName/Id/LastSeen) is the one
    thing still sourced from /api/environments — the only endpoint with
    these fields. Extracted immediately into a clean per-env dict
    (env_meta below); the raw response — which includes tlsKey/hawserToken
    fully decrypted with no redaction on Dockhand's side — is never stored.
    Still not used for environment enumeration (that stays derived from
    the fast coordinator's data, per DockhandFastCoordinator).

    Shape: {
        "environments": {
            env_id: {
                "host": {}, "images": [], "networks": [],
                "volumes": [], "runtime_config": {container_name: {...}},
                "git_stacks": [], "auto_update_settings": {container_name: {...}},
                "recent_events": [{"containerName", "action", "timestamp", ...}],
                "vulnerabilities": {"total", "critical", "high", "medium",
                                    "low", "imagesScanned", "totalImages"},
                "env_meta": {"imagePruneEnabled": bool, "hawserAgentName": str|None,
                             "hawserAgentId": str|None, "hawserLastSeen": str|None,
                             "connectionHost": str|None, "connectionPort": int|None},
                # Which of this env's resource fetches failed this cycle
                # (a subset of the keys above) rather than genuinely being
                # empty — e.g. {"images"} means the images fetch itself
                # failed, not that this env has zero images. See _unwrap's
                # own doc comment; checked by __init__.py's
                # _build_live_sets before trusting an empty result as
                # grounds for cleanup. Empty set on a fully successful
                # fetch, same as every list/dict field above being empty
                # on a genuinely-empty environment.
                "fetch_failures": set(),
            }
        },
        "schedules": [],
        # Same idea as each environment's own "fetch_failures", for the
        # two top-level (not per-environment) fetches: {"environments"}
        # and/or {"schedules"}.
        "fetch_failures": set(),
    }
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        config: dict[str, Any],
        fast_coordinator: DockhandFastCoordinator,
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        self._fast_coordinator = fast_coordinator
        self._enable_schedules = bool(config.get(CONF_ENABLE_SCHEDULES, False))
        self._enable_images = bool(config.get(CONF_ENABLE_IMAGES, False))
        self._enable_volumes = bool(config.get(CONF_ENABLE_VOLUMES, False))
        self._enable_networks = bool(config.get(CONF_ENABLE_NETWORKS, False))
        self._enable_runtime_controls = bool(
            config.get(CONF_ENABLE_RUNTIME_CONTROLS, False)
        )
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_slow",
            update_interval=timedelta(
                seconds=int(
                    config.get(CONF_POLL_INTERVAL_SLOW, DEFAULT_POLL_INTERVAL_SLOW)
                )
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            result = await self._fetch()
        except DockhandAuthError as err:
            # Let the fast coordinator own reauth — just surface as transient failure.
            raise UpdateFailed(
                "API token rejected — fast coordinator will surface reauth"
            ) from err
        except Exception as err:
            raise UpdateFailed(f"Slow data error: {err}") from err
        _sync_fetch_issues(
            self.hass, self.config_entry, "slow", result, self._fast_coordinator.data
        )
        return result

    async def _fetch(self) -> dict[str, Any]:
        # Which environments exist still comes from the fast coordinator's
        # data, not from this call — fast completes its first refresh
        # before we do ours (see __init__.py setup order), so this is
        # reliably populated by the time we need it, and it means this
        # coordinator's environment enumeration doesn't depend on
        # /api/environments succeeding.
        env_ids = list(_all_envs(self._fast_coordinator.data).keys())

        # /api/environments is the only source for imagePruneEnabled and
        # the Hawser agent identity fields (agent_name/agent_id/last_seen)
        # — confirmed from Dockhand's source, no other endpoint has them.
        # It also returns tlsKey/hawserToken fully decrypted with no
        # redaction on Dockhand's side, so we extract only the four
        # fields we actually want immediately below and never store the
        # raw response — env_meta (not the raw list) is what ends up in
        # coordinator.data.
        top_coros: list = [self.client.async_get_environments()]
        if self._enable_schedules:
            top_coros.append(self.client.async_get_schedules())
        top_results = await asyncio.gather(*top_coros, return_exceptions=True)

        # /api/environments is the one call here that explicitly
        # propagates auth errors (unconditionally fetched every poll,
        # unlike schedules) — everything else is gathered with
        # return_exceptions=True and just logged.
        if isinstance(top_results[0], DockhandAuthError):
            raise top_results[0]

        top_failures: set[str] = set()
        env_meta: dict[int, dict] = {}
        envs_raw = _unwrap(
            top_results[0], [], "environments", top_failures, "environments"
        )
        if isinstance(envs_raw, list):
            for e in envs_raw:
                if isinstance(e, dict) and e.get("id") is not None:
                    env_meta[e["id"]] = {
                        "imagePruneEnabled": bool(e.get("imagePruneEnabled")),
                        "hawserAgentName": e.get("hawserAgentName"),
                        "hawserAgentId": e.get("hawserAgentId"),
                        "hawserLastSeen": e.get("hawserLastSeen"),
                        # Named connectionHost/connectionPort, not host/port,
                        # to avoid colliding with the per-env "host" key
                        # below (the *other* /api/host response dict) —
                        # this is the Docker daemon connection endpoint
                        # (environments.host/port DB columns), an
                        # unrelated concept that happens to share a name.
                        "connectionHost": e.get("host"),
                        "connectionPort": e.get("port"),
                    }

        schedules = (
            _safe_list(
                _unwrap(top_results[1], [], "schedules", top_failures, "schedules")
            )
            if self._enable_schedules and len(top_results) > 1
            else []
        )

        async def _fetch_runtime_config(env_id: int) -> dict[str, dict]:
            """Current Memory/NanoCpus/PidsLimit/RestartPolicy for every
            stack-less container in an environment.

            Two-phase: list containers, then inspect each stack-less one.
            A per-container inspect failure is logged and that container is
            simply omitted (its number/select entities read as unknown)
            rather than failing the whole environment's slow poll.
            """
            containers = _safe_list(await self.client.async_get_containers(env_id))
            stackless = [c for c in containers if not _compose_project(c)]
            inspected = await asyncio.gather(
                *[
                    self.client.async_get_container_inspect(env_id, c["id"])
                    for c in stackless
                ],
                return_exceptions=True,
            )
            result: dict[str, dict] = {}
            for c, data in zip(stackless, inspected, strict=False):
                name = c.get("name", "")
                if isinstance(data, Exception):
                    _LOGGER.warning(
                        "Dockhand: error inspecting container '%s' env=%s: %s",
                        name,
                        env_id,
                        data,
                    )
                    continue
                if isinstance(data, dict) and name:
                    result[name] = _extract_runtime_config(data)
            return result

        async def _fetch_env(env_id: int) -> tuple[int, dict]:
            # Build a named mapping of coroutines so result indexing is
            # explicit rather than fragile positional arithmetic.
            named: dict[str, Any] = {}
            if self._enable_images:
                named["images"] = self.client.async_get_images(env_id)
            if self._enable_networks:
                named["networks"] = self.client.async_get_networks(env_id)
            if self._enable_volumes:
                named["volumes"] = self.client.async_get_volumes(env_id)
            if self._enable_runtime_controls:
                named["runtime_config"] = _fetch_runtime_config(env_id)
            # Both flags below live on the same per-env "stats" blob (the
            # fast coordinator's dashboard-stats data), fetched once here
            # rather than repeating the same lookup chain twice. Every
            # level uses `or {}`, not a dict.get(key, {}) default — the
            # latter only substitutes for an *absent* key, not one Dockhand
            # sends with an explicit null (a real, reported bug: see
            # docs/ARCHITECTURE.md §6 and github.com/raetha/ha-dockhand/issues/20).
            env_stats = (
                _coordinator_env(self._fast_coordinator.data, env_id).get("stats") or {}
            )
            # Gated on collectActivity (the fast coordinator's per-env
            # dashboard-stats flag) rather than a separate CONF_ option —
            # if Dockhand isn't collecting activity for this environment,
            # querying its event list would just return nothing every
            # 600s for no reason. No setup required beyond what the user
            # already configured in Dockhand itself, same reasoning as
            # the update platform's Tier 1 entities.
            if bool(env_stats.get("collectActivity")):
                named["recent_events"] = self.client.async_get_recent_activity(
                    env_id, limit=10
                )
            # Same reasoning as recent_events: gated on Dockhand's own
            # scannerEnabled flag rather than a separate CONF_ option, and
            # cheap regardless (Dockhand serves this from its own cache,
            # not a fresh scan — see api.py).
            if bool(env_stats.get("scannerEnabled")):
                named["vulnerabilities"] = self.client.async_get_vulnerabilities_count(
                    env_id
                )
            # Always fetched: a single bulk call per environment (not
            # per-container/per-stack like runtime controls), so there's no
            # meaningful API cost to gate. Entities are only created for
            # stacks that actually appear in this list — i.e. automatically
            # whenever a stack is detected as git-tracked, no separate
            # opt-in needed.
            named["git_stacks"] = self.client.async_get_git_stacks(env_id)
            # Always fetched: one bulk call per environment, cheap, and
            # (unlike runtime controls) does not scale with container count.
            named["auto_update_settings"] = self.client.async_get_auto_update_settings(
                env_id
            )
            # Always fetched: GET /api/host is the only reliable source for
            # hawserVersion on hawser-standard connections, which live-fetch
            # from the agent on every call.
            named["host"] = self.client.async_get_host_info(env_id)

            results: dict[str, Any] = {}
            failures: set[str] = set()
            if named:
                keys = list(named)
                gathered = await asyncio.gather(*named.values(), return_exceptions=True)
                for key, val in zip(keys, gathered, strict=False):
                    if key == "host":
                        unwrapped = _unwrap(
                            val, {}, f"host env={env_id}", failures, "host"
                        )
                        results["host"] = (
                            unwrapped if isinstance(unwrapped, dict) else {}
                        )
                    elif key == "runtime_config":
                        unwrapped = _unwrap(
                            val,
                            {},
                            f"runtime_config env={env_id}",
                            failures,
                            "runtime_config",
                        )
                        results["runtime_config"] = (
                            unwrapped if isinstance(unwrapped, dict) else {}
                        )
                    elif key == "auto_update_settings":
                        unwrapped = _unwrap(
                            val,
                            {},
                            f"auto_update_settings env={env_id}",
                            failures,
                            "auto_update_settings",
                        )
                        results["auto_update_settings"] = (
                            unwrapped if isinstance(unwrapped, dict) else {}
                        )
                    elif key == "recent_events":
                        unwrapped = _unwrap(
                            val,
                            {},
                            f"recent_events env={env_id}",
                            failures,
                            "recent_events",
                        )
                        events = (
                            unwrapped.get("events")
                            if isinstance(unwrapped, dict)
                            else None
                        )
                        results["recent_events"] = (
                            events if isinstance(events, list) else []
                        )
                    elif key == "vulnerabilities":
                        unwrapped = _unwrap(
                            val,
                            {},
                            f"vulnerabilities env={env_id}",
                            failures,
                            "vulnerabilities",
                        )
                        summary = (
                            unwrapped.get("summary")
                            if isinstance(unwrapped, dict)
                            else None
                        )
                        results["vulnerabilities"] = (
                            summary if isinstance(summary, dict) else {}
                        )
                    else:
                        results[key] = _safe_list(
                            _unwrap(val, [], f"{key} env={env_id}", failures, key)
                        )

            return env_id, {
                "host": results.get("host", {}),
                "images": results.get("images", []),
                "networks": results.get("networks", []),
                "volumes": results.get("volumes", []),
                "runtime_config": results.get("runtime_config", {}),
                "git_stacks": results.get("git_stacks", []),
                "auto_update_settings": results.get("auto_update_settings", {}),
                "recent_events": results.get("recent_events", []),
                "vulnerabilities": results.get("vulnerabilities", {}),
                "env_meta": env_meta.get(env_id, {}),
                # Which of the above (if any) failed to fetch this cycle,
                # rather than genuinely being empty — see _unwrap's own
                # doc comment for why this matters. Checked by
                # __init__.py's _build_live_sets before trusting an empty
                # result here as grounds for entity/device cleanup.
                "fetch_failures": failures,
            }

        environments: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env(env_id) for env_id in env_ids], return_exceptions=True
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand slow env error: %s", result)
            else:
                env_id, data = result
                environments[env_id] = data
        return {
            "environments": environments,
            "schedules": schedules,
            # Which top-level (not per-environment) fetches failed this
            # cycle — currently just "environments" and "schedules", the
            # only two fetched via top_coros above. See _unwrap's own doc
            # comment for why this exists at all.
            "fetch_failures": top_failures,
        }


def _sync_fetch_issues(
    hass: HomeAssistant,
    config_entry: ConfigEntry | None,
    source: str,
    result: dict[str, Any],
    stats_source: dict[str, Any],
) -> None:
    """Create or clear a HA repair issue for each fetch failure this
    cycle — the "place to go" for a real, reported gap: _unwrap()
    already logs a warning when a fetch fails, but a warning in the
    log is easy to miss entirely, and gives no indication after the
    fact that anything's still degraded. An issue in Settings ->
    System -> Repairs is what actually answers "why is this entity
    unavailable" — it's there for as long as the problem persists,
    and clears itself the moment a poll succeeds again, so it never
    needs cleaning up by hand and never lingers past being useful.

    Shared between DockhandFastCoordinator and DockhandSlowCoordinator
    (called from each one's own _async_update_data) rather than a
    method on either — both need the exact same logic, just against
    their own data shape. `source` ("fast"/"slow") disambiguates issue
    ids between them so a failure in one doesn't silently overwrite or
    clear an unrelated one already raised by the other for the same
    environment. `stats_source` is whichever coordinator's data
    actually has each environment's display name in its own "stats"
    key — the fast coordinator's own result for the fast coordinator's
    calls, or the fast coordinator's already-populated data for the
    slow coordinator's calls (since slow's own result doesn't carry
    names at all).

    One issue for top-level failures (schedules/environments — not
    tied to any one environment; never fires for the fast coordinator,
    which has no top-level fetch of its own with this problem — see
    docs/ARCHITECTURE.md §9 on why dashboard-stats already raises
    correctly instead of needing this), one per environment for the
    rest — not one issue per resource per environment, which would
    mean up to 9 issues per environment during a broad outage; a
    single per-environment issue listing every currently-failing
    resource in its own description is both less noisy and, if
    several resources are failing together (e.g. the whole environment
    briefly unreachable), a clearer picture of what's actually going
    on than a wall of near-identical individual issues would be.

    No config_entry means this coordinator was constructed without
    one (only ever true in tests) — skip silently rather than raising
    on a null config_entry, since issue tracking has nothing
    meaningful to attach itself to in that case anyway.
    """
    if config_entry is None:
        return
    entry_id = config_entry.entry_id
    stats_envs = _all_envs(stats_source)

    top_failures: set[str] = result.get("fetch_failures") or set()
    top_issue_id = f"{entry_id}_fetch_failed_top_level_{source}"
    if top_failures:
        ir.async_create_issue(
            hass,
            DOMAIN,
            top_issue_id,
            is_fixable=False,
            is_persistent=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="fetch_failed_top_level",
            translation_placeholders={"resources": ", ".join(sorted(top_failures))},
        )
    else:
        ir.async_delete_issue(hass, DOMAIN, top_issue_id)

    for env_id, env_data in _all_envs(result).items():
        env_failures: set[str] = env_data.get("fetch_failures") or set()
        issue_id = f"{entry_id}_fetch_failed_env_{env_id}_{source}"
        if env_failures:
            env_name = (
                (stats_envs.get(env_id) or {})
                .get("stats", {})
                .get("name", f"Environment {env_id}")
            )
            ir.async_create_issue(
                hass,
                DOMAIN,
                issue_id,
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="fetch_failed_env",
                translation_placeholders={
                    "env_name": env_name,
                    "resources": ", ".join(sorted(env_failures)),
                },
            )
        else:
            ir.async_delete_issue(hass, DOMAIN, issue_id)


class DockhandUpdateCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Polls for container image update availability — Tier 2 only.

    Default interval: 86400s (24 hours). Only created when the user enables
    CONF_ENABLE_PRECISE_UPDATES ("Enable precise update versions" in Configure).
    This is purely additive to the update platform, which is always active
    on its own (see update.py's module docstring) — this coordinator just
    layers precise digest-based version numbers onto those already-existing
    entities. Each poll calls POST /api/containers/check-updates for every
    environment, which performs real registry queries — deliberately
    infrequent to avoid bogging down the Docker host.

    Requires a reference to the fast coordinator so it can reuse the already-
    fetched environment list rather than making a redundant API call.

    Data shape:
        {
            "environments": {
                env_id: {
                    container_id: {
                        "containerName": str,
                        "imageName": str,
                        "hasUpdate": bool,
                        "currentDigest": str,
                        "newDigest": str,          # only present when hasUpdate=True
                        "systemContainer": str | None,
                        "updateDisabled": bool,
                    }
                }
            }
        }

    Wrapped in "environments" to match the fast and slow coordinators'
    shape exactly — all three are now structurally identical, even though
    this one has no second, non-per-environment concern the way slow's
    "schedules" does. Done so a single generic accessor
    (_coordinator_env() in helpers.py) works for all three without
    needing to know which coordinator it's reading from.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        client: DockhandClient,
        fast_coordinator: DockhandFastCoordinator,
        config: dict[str, Any],
        entry: ConfigEntry | None = None,
    ) -> None:
        self.client = client
        self._fast = fast_coordinator
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_updates",
            update_interval=timedelta(
                seconds=int(
                    config.get(
                        CONF_POLL_INTERVAL_UPDATES, DEFAULT_POLL_INTERVAL_UPDATES
                    )
                )
            ),
            config_entry=entry,
        )

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            return await self._fetch()
        except DockhandAuthError as err:
            raise UpdateFailed(
                "API token rejected — fast coordinator will surface reauth"
            ) from err
        except Exception as err:
            raise UpdateFailed(f"Update check error: {err}") from err

    async def _fetch_one_env(self, env_id: int) -> dict[str, dict]:
        """Fetch and index one environment's pending updates. Raises on
        failure — callers decide how to handle that (see _fetch()'s
        resilient wrapping below vs. async_check_environment()'s
        let-it-raise-to-the-button approach)."""
        results = await self.client.async_check_container_updates(env_id)
        # Index by container ID for O(1) lookup by update entities.
        return {
            item["containerId"]: item for item in results if item.get("containerId")
        }

    async def _fetch(self) -> dict[str, Any]:
        # Reuse the fast coordinator's environment list — it is always fresher
        # than making a separate async_get_environments() call and avoids a
        # redundant API round trip on every update check.
        env_ids = list(_all_envs(self._fast.data).keys())

        async def _fetch_env_resilient(env_id: int) -> tuple[int, dict[str, dict]]:
            try:
                return env_id, await self._fetch_one_env(env_id)
            except Exception as exc:
                # Don't let a transient failure (e.g. Dockhand unreachable)
                # look like "confirmed zero pending updates" — that would
                # flip every container's update entity in this environment
                # to "up to date" when we simply don't know right now.
                # Keep whatever we already had for this environment instead
                # (same "last known good, not a false empty" principle as
                # the fast/slow coordinators — see ARCHITECTURE.md §3). This
                # resilience is deliberately only here, in the background
                # periodic-refresh path — async_check_environment() below
                # (the explicit per-button user action) lets the same
                # exception raise instead, so a press that fails actually
                # tells the user it failed rather than looking like nothing
                # happened.
                _LOGGER.warning(
                    "Dockhand: update check for env %s raised: %s", env_id, exc
                )
                return env_id, _coordinator_env(self.data, env_id)

        out: dict[int, dict] = {}
        for result in await asyncio.gather(
            *[_fetch_env_resilient(env_id) for env_id in env_ids],
            return_exceptions=True,
        ):
            if isinstance(result, Exception):
                _LOGGER.warning("Dockhand update env error: %s", result)
            else:
                env_id, data = result
                out[env_id] = data
        return {"environments": out}

    def async_merge_check_results(self, env_id: int, items: list[dict]) -> None:
        """Merge already-fetched check-updates results for one environment
        into this coordinator's data — same end effect as
        async_check_environment() below, but for a caller that already
        has the raw items in hand and shouldn't trigger a second,
        redundant registry query to get them again.

        Used by DockhandCheckUpdatesButton: since 1.8.1 that button
        always fires the real check itself directly against the client
        (so it has something to feed Tier 1 with too, even when this
        coordinator doesn't exist at all — see button.py), then hands
        the same response here to update Tier 2 if this coordinator is
        present, rather than calling async_check_environment() and
        paying for the same check twice.
        """
        indexed = {
            item["containerId"]: item for item in items if item.get("containerId")
        }
        merged_environments = dict(_all_envs(self.data))
        merged_environments[env_id] = indexed
        self.async_set_updated_data({"environments": merged_environments})

    async def async_check_environment(self, env_id: int) -> None:
        """Check just one environment for updates — the real fix for a
        design mismatch: this coordinator's periodic/full refresh
        (_fetch(), via async_refresh()) always checks every environment
        in one gather, since that's genuinely the cheapest way to keep
        the *whole* integration's update state current on a schedule.
        But the per-environment "Check for updates" button attached to
        each environment's device was calling that same full refresh —
        so pressing any one environment's button silently re-checked
        every environment, not just the one the button's device implies.
        Matches Dockhand's own UI too, which has no global "check
        everything" action either — it's environment by environment
        there as well, so this isn't us being less capable, just no
        longer pretending to be more capable than Dockhand itself.

        Raises on failure (unlike _fetch()'s per-environment resilience)
        — this is an explicit user action, and any caller should convert
        the exception into something visible to the user rather than
        silently falling back to stale data, which would make a failed
        check look like nothing happened.

        A standalone convenience wrapping a client fetch + merge in one
        call — DockhandCheckUpdatesButton itself no longer calls this
        directly (it needs the raw items for Tier 1 too, so it fetches
        once itself and calls async_merge_check_results() above instead),
        but this remains available for anything else that just wants
        "refresh this one environment's Tier 2 data" in a single call.
        """
        items = await self.client.async_check_container_updates(env_id)
        self.async_merge_check_results(env_id, items)
