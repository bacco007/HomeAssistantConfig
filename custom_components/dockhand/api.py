import logging
from typing import Any

from aiohttp import ClientSession, ClientTimeout

_LOGGER = logging.getLogger(__name__)


class DockhandError(Exception):
    """Base class for Dockhand API errors."""


class DockhandAuthError(DockhandError):
    """Authentication failed — 401 received.

    With token auth this means the token is invalid or revoked.
    With no-auth installs it means authentication was re-enabled in Dockhand.
    """


class DockhandClient:
    """Client for interacting with the Dockhand API.

    Authentication is handled via an optional Bearer token (dh_...).
    When no token is stored the client sends unauthenticated requests,
    which works when Dockhand authentication is disabled.
    """

    def __init__(self, session: ClientSession, config: dict[str, Any]) -> None:
        self._session = session
        self._api_url = config.get("api_url", "").rstrip("/")
        self._api_token: str | None = config.get("api_token")

    # ------------------------------------------------------------------ #
    # Internal helper
    # ------------------------------------------------------------------ #

    async def _request(
        self, method: str, path: str, timeout_seconds: int = 30, **kwargs
    ) -> Any:
        url = f"{self._api_url}{path}"
        headers = kwargs.pop("headers", {})

        if self._api_token:
            headers["Authorization"] = f"Bearer {self._api_token}"

        headers.setdefault("Accept", "application/json")

        timeout = ClientTimeout(total=timeout_seconds)
        async with self._session.request(
            method, url, headers=headers, timeout=timeout, **kwargs
        ) as resp:
            if resp.status == 401:
                raise DockhandAuthError("Unauthorized — token invalid or revoked")
            if resp.status >= 400:
                text = await resp.text()
                raise DockhandError(f"API error {resp.status}: {text}")
            try:
                return await resp.json(content_type=None)
            except Exception:
                return await resp.text()

    # ------------------------------------------------------------------ #
    # Connectivity probe — used by config flow to detect auth state
    # ------------------------------------------------------------------ #

    async def async_probe(self) -> None:
        """Probe the server to verify connectivity and auth state.

        Raises DockhandAuthError on 401, DockhandError on other failures,
        or an aiohttp exception if the server is unreachable.

        Uses GET /api/host with no "env" query param: confirmed from
        source that this still runs through Dockhand's shared authorize()
        helper (so a bad token still 401s correctly, unlike GET /health,
        which has no auth check at all), and without "env" it returns a
        small, fixed-size payload describing Dockhand's own host process
        (hostname, platform, arch, cpu count, memory, uptime) —
        "environment": null, no per-environment or Docker data at all.
        Smaller and more constant than /api/schedules, which returns
        however many schedules the user happens to have configured.
        """
        await self._request("GET", "/api/host")

    # ------------------------------------------------------------------ #
    # Read endpoints
    # ------------------------------------------------------------------ #

    async def async_get_environments(self) -> list[dict[str, Any]]:
        return await self._request("GET", "/api/environments")

    async def async_get_dashboard_stats(self, env_id: int) -> dict[str, Any]:
        return await self._request("GET", f"/api/dashboard/stats?env={env_id}")

    async def async_get_all_dashboard_stats(self) -> list[dict[str, Any]]:
        """Fetch dashboard stats for all environments in a single call.

        GET /api/dashboard/stats (no env parameter)

        Returns a list of environment stat objects, each identical in shape
        to the single-env response, with an 'id' field for correlation.
        More efficient than N per-environment calls on each fast poll cycle.
        """
        result = await self._request("GET", "/api/dashboard/stats")
        return result if isinstance(result, list) else []

    async def async_get_vulnerabilities_count(self, env_id: int) -> dict[str, Any]:
        """Fetch the cached vulnerability-scan summary for an environment.

        GET /api/vulnerabilities/count?env=X

        Cheap and pre-aggregated server-side (Dockhand's own dashboard
        badge uses this same endpoint) — not a fresh scan trigger, just
        reads whatever Dockhand already has cached. Shape: {total,
        summary: {total, critical, high, medium, low, imagesScanned,
        totalImages}, options: {...}}. We only use `summary`.
        """
        return await self._request("GET", f"/api/vulnerabilities/count?env={env_id}")

    async def async_get_recent_activity(
        self, env_id: int, limit: int = 10
    ) -> dict[str, Any]:
        """Fetch the most recent activity events for an environment.

        GET /api/activity?environmentId=X&limit=N

        Distinct from /api/activity/stats (today/total aggregate counts,
        already covered by async_get_all_dashboard_stats' events field) —
        this is the individual event list, param name confirmed from
        Dockhand's own +server.ts (environmentId, not env, unlike every
        other per-environment endpoint here).
        """
        return await self._request(
            "GET", f"/api/activity?environmentId={env_id}&limit={limit}"
        )

    async def async_get_host_info(self, env_id: int) -> dict[str, Any]:
        """Fetch host/agent info for an environment.

        GET /api/host?env=X

        This is the only source for hawserVersion that's reliable for
        hawser-standard (port-bind) connections: it live-fetches the
        version from the agent on every call. For hawser-edge connections
        it falls back to the value Dockhand persisted at WebSocket
        connect time. /api/environments only ever has the persisted DB
        value, which hawser-standard connections never populate outside
        of a manual "Test Connection" click in the Dockhand UI.

        Returns keys including hostname, dockerVersion, uptime, and a
        nested "environment" object with hawserVersion.
        """
        result = await self._request("GET", f"/api/host?env={env_id}")
        return result if isinstance(result, dict) else {}

    async def async_get_container_stats(self, env_id: int) -> list[dict[str, Any]]:
        """Fetch resource stats for all running containers in an environment.

        GET /api/containers/stats?env=X

        Returns one entry per running container.  Stopped, exited, or created
        containers are absent from the response — callers should treat a missing
        entry as unavailable rather than zero.

        Response fields per container:
            id            str   — full container SHA256
            name          str   — container name (used as lookup key)
            cpuPercent    float — CPU usage as a percentage of host capacity
            memoryUsage   int   — effective memory in bytes (raw minus cache),
                                  matches Docker CLI 'docker stats' display
            memoryRaw     int   — total memory bytes before cache subtraction
            memoryCache   int   — page-cache bytes (memoryRaw - memoryUsage)
            memoryLimit   int   — configured limit, or host RAM when unconstrained
            memoryPercent float — memoryUsage / memoryLimit * 100
            networkRx     int   — cumulative bytes received (resets on restart)
            networkTx     int   — cumulative bytes transmitted (resets on restart)
            blockRead     int   — cumulative bytes read from block devices
            blockWrite    int   — cumulative bytes written to block devices
        """
        result = await self._request("GET", f"/api/containers/stats?env={env_id}")
        return result if isinstance(result, list) else []

    async def async_get_containers(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/containers?env={env_id}")

    async def async_get_stacks(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/stacks?env={env_id}")

    async def async_get_networks(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/networks?env={env_id}")

    async def async_get_images(self, env_id: int) -> list[dict[str, Any]]:
        return await self._request("GET", f"/api/images?env={env_id}")

    async def async_get_schedules(self) -> list[dict[str, Any]]:
        """Return all schedules (global, not per-environment). GET /api/schedules"""
        data = await self._request("GET", "/api/schedules")
        if isinstance(data, dict):
            return data.get("schedules", [])
        return data if isinstance(data, list) else []

    async def async_get_volumes(self, env_id: int) -> list[dict[str, Any]]:
        """Return volumes for an environment. GET /api/volumes?env=X"""
        return await self._request("GET", f"/api/volumes?env={env_id}")

    # ------------------------------------------------------------------ #
    # Container actions
    # ------------------------------------------------------------------ #

    async def async_start_container(self, env_id: int, container_id: str) -> None:
        """Start a stopped container. POST /api/containers/[id]/start?env=X"""
        await self._request(
            "POST", f"/api/containers/{container_id}/start?env={env_id}"
        )

    async def async_stop_container(self, env_id: int, container_id: str) -> None:
        """Stop a running container. POST /api/containers/[id]/stop?env=X"""
        await self._request("POST", f"/api/containers/{container_id}/stop?env={env_id}")

    async def async_restart_container(self, env_id: int, container_id: str) -> None:
        """Restart a running container. POST /api/containers/[id]/restart?env=X"""
        await self._request(
            "POST", f"/api/containers/{container_id}/restart?env={env_id}"
        )

    async def async_update_container_runtime(
        self, env_id: int, container_id: str, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Apply in-place runtime property changes without recreating the container.

        POST /api/containers/{id}/update-runtime?env=X
        Body: only fields from Dockhand's IN_PLACE_UPDATE_FIELDS allow-list
        (e.g. "Memory", "NanoCpus", "PidsLimit", "RestartPolicy") — anything
        else is silently dropped server-side.

        Returns {"success": True, "warnings": [...]} on success (warnings
        are Docker Engine's own ContainerUpdate warnings, e.g. cgroup
        capability notices — not necessarily failures), or raises
        DockhandError on a non-2xx response via _request.

        Unlike a recreate-based update, Docker applies these changes to a
        live container's cgroup immediately. In particular, lowering
        Memory below the container's current usage is NOT validated or
        rejected by Docker — the new limit is enforced by the kernel right
        away, which can trigger an OOM-kill of the container's processes.
        Callers are responsible for any pre-check or rollback behavior;
        this method only performs the API call.
        """
        result = await self._request(
            "POST",
            f"/api/containers/{container_id}/update-runtime?env={env_id}",
            json=updates,
        )
        return result if isinstance(result, dict) else {}

    async def async_check_container_updates(self, env_id: int) -> list[dict[str, Any]]:
        """Check for available image updates for all containers in an environment.

        POST /api/containers/check-updates?env=X

        Sending Accept: application/json (set by _request default) causes
        Dockhand to run the registry check synchronously and return results
        directly rather than a job-ID reference for async polling.

        Response shape (confirmed fields):
          containerId     str        — Docker container ID
          containerName   str        — Container name
          imageName       str        — Full image reference
          hasUpdate       bool       — True when a newer digest is available
          currentDigest   str        — Current image digest.
                                       Format: "image@sha256:<hex>"
          newDigest       str        — New image digest.
                                       Format: "sha256:<hex>".
                                       Only present when hasUpdate=True.
          systemContainer str | None — Non-null for Dockhand infrastructure containers
                                       (e.g. "hawser"). These cannot be updated via
                                       batch-update even when hasUpdate=True.
          updateDisabled  bool       — True when dockhand.update=false label is set
        """
        # timeout_seconds well above the default 30s: this is a real
        # registry check across every container in the environment, not
        # a cheap read — it can legitimately take a minute or more.
        # Previously used the 30s default, which meant the client gave up
        # (and any UI awaiting this, like the card's "Check for updates"
        # button, saw the promise settle) well before Dockhand's server
        # actually finished — the check kept running server-side, its
        # result never retrieved, since the synchronous-mode POST has no
        # job ID to poll afterward. Confirmed via Raetha's own report: a
        # spinner that cleared after only a few seconds while the check
        # was still visibly running server-side for close to a minute.
        data = await self._request(
            "POST",
            f"/api/containers/check-updates?env={env_id}",
            timeout_seconds=180,
        )
        results = data.get("results") if isinstance(data, dict) else data
        return results if isinstance(results, list) else []

    async def async_get_pending_updates(self, env_id: int) -> list[dict[str, Any]]:
        """Read Dockhand's own cached update-check results — no registry query.

        GET /api/containers/pending-updates?env=X

        A pure DB read: Dockhand's own scheduled update-check job (if the
        user has one configured, on whatever cron they chose) writes a row
        here for each container it found an update for, and removes it once
        resolved. This does not trigger a registry query itself — that's
        the whole point, it's cheap enough to poll frequently.

        Response shape (confirmed fields, per item):
          containerId    str  — Docker container ID
          containerName  str  — Container name
          currentImage   str  — Image reference at the time Dockhand's
                                 check found the update (no digest — this
                                 endpoint doesn't carry one, only
                                 check-updates does)
          checkedAt      str  — ISO timestamp of Dockhand's own check

        Returns an empty list if the user hasn't configured update-check
        in Dockhand for this environment — that's a normal, expected state,
        not an error.

        NOTE (Dockhand 1.0.37+): Dockhand added a byte-for-byte identical
        GET handler colocated at POST /api/containers/check-updates (the
        route Tier 2 already uses for its own POST), confirmed from source
        to call the exact same underlying getPendingContainerUpdates() and
        return the same shape. Currently just a duplicate for API
        discoverability (issue #1266 in their tracker), not a deprecation
        of this route — but worth checking on future Dockhand upgrades
        whether pending-updates itself gets formally deprecated in favor
        of the colocated version, since Dockhand has no API versioning
        scheme to signal that explicitly.
        """
        data = await self._request(
            "GET", f"/api/containers/pending-updates?env={env_id}"
        )
        results = data.get("pendingUpdates") if isinstance(data, dict) else None
        return results if isinstance(results, list) else []

    async def async_get_container_inspect(
        self, env_id: int, container_id: str
    ) -> dict[str, Any]:
        """Fetch full Docker inspect data for a single container.

        GET /api/containers/{id}/inspect?env=X

        This is the only source for a container's current resource limits
        (HostConfig.Memory, .NanoCpus, .PidsLimit, .RestartPolicy.Name) —
        the containers list endpoint doesn't expose them. Used to populate
        the current value of runtime-control number/select entities.
        Unlike most of our polling, this is a per-container call with real
        cost at scale, which is why runtime controls are opt-in
        (CONF_ENABLE_RUNTIME_CONTROLS) and fetched on the slow (600s)
        coordinator rather than the fast one.
        """
        result = await self._request(
            "GET", f"/api/containers/{container_id}/inspect?env={env_id}"
        )
        return result if isinstance(result, dict) else {}

    async def async_get_update_check_settings(self, env_id: int) -> dict[str, Any]:
        """Fetch an environment's configured update-check settings.

        GET /api/environments/{id}/update-check

        Returns {"enabled", "cron", "autoUpdate", "vulnerabilityCriteria"}.
        vulnerabilityCriteria is one of "never", "any", "critical_high",
        "critical", "more_than_current" and controls whether
        batch-update-stream BLOCKS an update on scan findings (scanning
        itself is controlled separately, by whether a scanner is
        configured at all). Not exposed on /api/environments or
        /api/dashboard/stats, hence the dedicated call.
        """
        result = await self._request("GET", f"/api/environments/{env_id}/update-check")
        settings = result.get("settings") if isinstance(result, dict) else None
        return settings if isinstance(settings, dict) else {}

    async def async_start_batch_update_stream(
        self,
        env_id: int,
        container_ids: list[str],
        vulnerability_criteria: str | None = None,
    ) -> str:
        """Start a pull-and-recreate update with vulnerability scanning.

        POST /api/containers/batch-update-stream?env=X
        Body: {"containerIds": [...], "vulnerabilityCriteria": "..."}

        Unlike batch-update, this scans the pulled image (if a scanner is
        configured on the environment) and blocks the update if findings
        exceed vulnerability_criteria. Returns immediately with a job ID;
        progress and the final result are retrieved via repeated calls to
        async_get_job(), not a held-open connection — this is Dockhand's
        job pattern (POST starts work in the background, GET
        /api/jobs/{id} polls it), not raw SSE.

        vulnerability_criteria defaults to "never" (Dockhand's own
        default: scan if a scanner is configured, but never block) when
        not provided. Callers should fetch the environment's actual
        configured value via async_get_update_check_settings() first, or
        updates will silently ignore the user's configured blocking
        policy.
        """
        body: dict[str, Any] = {"containerIds": container_ids}
        if vulnerability_criteria:
            body["vulnerabilityCriteria"] = vulnerability_criteria
        result = await self._request(
            "POST",
            f"/api/containers/batch-update-stream?env={env_id}",
            json=body,
        )
        job_id = result.get("jobId") if isinstance(result, dict) else None
        if not job_id:
            raise DockhandError("batch-update-stream did not return a job ID")
        return job_id

    async def async_get_job(self, job_id: str) -> dict[str, Any]:
        """Poll a background job started by e.g. batch-update-stream.

        GET /api/jobs/{id}

        Returns {"id", "status": "running"|"done"|"error", "lines": [...],
        "result"}. Every call returns the full accumulated "lines" array
        (the caller tracks how much it has already processed) — this is
        Dockhand's own polling contract, not ours. Jobs are pruned from
        Dockhand's memory 10 minutes after they stop running, so callers
        should not expect to poll a completed job indefinitely.
        """
        result = await self._request("GET", f"/api/jobs/{job_id}")
        return result if isinstance(result, dict) else {}

    # ------------------------------------------------------------------ #
    # Stack actions
    #
    # Stack endpoints support long-running operations. Sending
    # Accept: application/json (set by _request's default) causes Dockhand
    # to run the operation synchronously and return a single JSON result
    # rather than a job-ID reference for async polling. This ensures our
    # switch/button entities surface real success or failure.
    # ------------------------------------------------------------------ #

    async def async_start_stack(self, env_id: int, stack_name: str) -> None:
        """Start a stopped stack. POST /api/stacks/[name]/start?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/start?env={env_id}")

    async def async_stop_stack(self, env_id: int, stack_name: str) -> None:
        """Stop a running stack. POST /api/stacks/[name]/stop?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/stop?env={env_id}")

    async def async_restart_stack(self, env_id: int, stack_name: str) -> None:
        """Restart a running stack. POST /api/stacks/[name]/restart?env=X"""
        await self._request("POST", f"/api/stacks/{stack_name}/restart?env={env_id}")

    # ------------------------------------------------------------------ #
    # Git stacks
    # ------------------------------------------------------------------ #

    async def async_get_git_stacks(self, env_id: int) -> list[dict[str, Any]]:
        """List git-tracked stacks for an environment. GET /api/git/stacks?env=X

        Includes lastSync, lastCommit, syncStatus ('pending'|'syncing'|
        'synced'|'error'), syncError, autoUpdate, webhookEnabled — none of
        which are present on the plain /api/stacks list.
        """
        result = await self._request("GET", f"/api/git/stacks?env={env_id}")
        return result if isinstance(result, list) else []

    async def async_deploy_git_stack(self, git_stack_id: int) -> dict[str, Any]:
        """Pull latest and redeploy the stack.

        POST /api/git/stacks/{id}/deploy — Dockhand normally streams this
        as a job, but sending Accept: application/json (our _request
        default) makes it return a single synchronous JSON result instead,
        the same backward-compat path our other stack actions rely on.
        """
        result = await self._request(
            "POST", f"/api/git/stacks/{git_stack_id}/deploy", timeout_seconds=300
        )
        return result if isinstance(result, dict) else {}

    async def async_deploy_stack(self, env_id: int, stack_name: str) -> dict[str, Any]:
        """Redeploy an internal (non-git) stack, matching Dockhand's own
        Redeploy popover's default checkbox state exactly — confirmed
        from its frontend source (RedeployPopover.svelte): pull=true,
        build=false, forceRecreate=false when a user opens the popover
        and clicks Deploy without touching any checkbox. Deliberately
        mirrors this rather than choosing our own defaults, so a press
        here behaves the same as the equivalent action in Dockhand's own
        UI — pulls the latest image for each service, but only recreates
        containers Compose's own diffing decides actually changed (e.g.
        a new image digest), not everything unconditionally.

        POST /api/stacks/{name}/deploy?env=X. Same synchronous-JSON-via-
        Accept-header pattern as async_deploy_git_stack. Requires
        Dockhand to have this stack's compose file location configured —
        for a stack it only ever discovered from running containers
        (sourceType absent/'external'), this returns HTTP 200 with
        {"success": false, "error": "..."} rather than an HTTP error, so
        callers must check the "success" key rather than relying on
        _request() raising.
        """
        result = await self._request(
            "POST",
            f"/api/stacks/{stack_name}/deploy?env={env_id}",
            json={"pull": True, "build": False, "forceRecreate": False},
            timeout_seconds=300,
        )
        return result if isinstance(result, dict) else {}

    async def async_update_git_stack(
        self, git_stack_id: int, updates: dict[str, Any]
    ) -> dict[str, Any]:
        """Partial update of a git stack's own settings (e.g. autoUpdate).

        PUT /api/git/stacks/{id} — only send the fields being changed;
        Dockhand's handler passes them straight to a partial DB update, so
        omitted fields are left alone rather than cleared.
        """
        result = await self._request(
            "PUT", f"/api/git/stacks/{git_stack_id}", json=updates
        )
        return result if isinstance(result, dict) else {}

    # ------------------------------------------------------------------ #
    # Container auto-update (Dockhand's own scheduled update feature —
    # distinct from our update entity, which is a manual/HA-triggered
    # pull-and-recreate. This toggles Dockhand's own cron-based check.)
    # ------------------------------------------------------------------ #

    async def async_get_auto_update_settings(self, env_id: int) -> dict[str, dict]:
        """Batch fetch: map of containerName -> auto-update settings.

        GET /api/auto-update?env=X

        Only contains entries for containers with auto-update currently
        enabled — a container absent from this map has it disabled.
        Persisted by Dockhand keyed on (environmentId, containerName), not
        container ID, so it survives container recreation (image updates,
        stack redeploys) the same way our own entity unique_ids do.
        """
        result = await self._request("GET", f"/api/auto-update?env={env_id}")
        return result if isinstance(result, dict) else {}

    async def async_set_container_auto_update(
        self, env_id: int, container_name: str, enabled: bool
    ) -> dict[str, Any]:
        """Enable/disable Dockhand's scheduled auto-update for one container.

        POST /api/auto-update/{containerName}?env=X
        Body: {"enabled": bool, ...defaults}. Sending enabled=false is a
        hard delete of the setting server-side, matching Dockhand's own
        semantics for "turned off".
        """
        body: dict[str, Any] = {"enabled": enabled}
        if enabled:
            # Server-side defaults if we're turning it on for the first
            # time — matches what Dockhand's own GET returns for a
            # container with no existing setting.
            body["cronExpression"] = "0 3 * * *"
            body["vulnerabilityCriteria"] = "never"
        result = await self._request(
            "POST",
            f"/api/auto-update/{container_name}?env={env_id}",
            json=body,
        )
        return result if isinstance(result, dict) else {}
