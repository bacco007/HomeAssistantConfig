"""Alert store — inter-poll diffing, transition detection, HA event firing."""

from __future__ import annotations

from dataclasses import replace
from datetime import datetime, timedelta, timezone

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er

from .const import (
    DOMAIN,
    EVENT_INCIDENT_CREATED,
    EVENT_INCIDENT_REMOVED,
    EVENT_INCIDENT_UPDATED,
)
from .conventions import ABSENCE_RETAIN, conventions_for
from .model import CAPAlert

# Fields whose changes automations typically care about. Anything outside
# this allowlist (normalized timestamps, parameters dict, geometry, etc.)
# would be noise in ``changed_fields``.
CHANGED_FIELDS_ALLOWLIST: tuple[str, ...] = (
    "headline",
    "description",
    "instruction",
    "severity_normalized",
    "phase",
    "expires",
    "area_desc",
)

# How long the store remembers an ending it has already announced (issue #145).
#
# Idle time, not absolute age: a terminal record that a tombstone suppresses
# refreshes it, so the clock only runs while that record is absent from what we
# fetch. What the tombstone has to outlive is therefore an absence-and-return,
# not a poll interval — and those are long. The NAAD host-gap probe has sampled
# ``rss.alertready.ca`` every 15 minutes since 2026-07-30; across 1340 samples
# individual records went missing and came back after as much as ~21 h, ended
# alerts among them, with the persistence to rule out propagation lag. 48 h
# clears the measured worst case with headroom.
#
# Erring long is close to free. Any non-terminal sighting clears the tombstone,
# and ids are OID- or hash-derived, so one is never recycled onto a different
# incident — an over-long tombstone suppresses nothing a consumer wanted. Erring
# short re-fires a removal for an alert that already ended, which is the bug.
TOMBSTONE_IDLE_TTL = timedelta(hours=48)


class AlertStore:
    """Tracks alert state across poll cycles for transition detection."""

    def __init__(self, hass: HomeAssistant, entry_id: str, provider: str) -> None:
        self._hass = hass
        self._entry_id = entry_id
        self._provider = provider
        self._previous: dict[str, CAPAlert] = {}
        # id → ISO timestamp of the last reconciliation that observed the alert.
        # Kept beside the alerts rather than on them so that confirming an alert
        # does not rewrite an attribute every cycle: ``last_confirmed`` is only
        # stamped onto a record once it has actually gone unconfirmed, which
        # keeps steady-state polling from writing a fresh recorder row per poll.
        self._last_seen: dict[str, str] = {}
        # id → when an already-announced ending was last observed. An alert that
        # reaches a terminal phase is dropped from the active set, so it leaves
        # ``_previous`` and the next reconciliation would read the same record as
        # a first sighting that is already terminal — and announce the ending
        # again, once per cycle, for as long as the source keeps publishing it
        # (issue #145). This is the memory that ``_previous`` cannot carry.
        self._tombstones: dict[str, datetime] = {}

    def process(
        self,
        alerts: list[CAPAlert],
        *,
        scope_changed: bool = False,
        superseded_identifiers: frozenset[str] = frozenset(),
    ) -> list[CAPAlert]:
        """Diff incoming alerts against previous poll.

        ``scope_changed`` says this reconciliation asked a *different question*
        than the last one — the tracker crossed a border, a zone was
        reconfigured, the marine toggle was flipped. Retention compares like
        with like, so it is suspended for that cycle: an alert missing because
        the user moved out of its area has not gone unobserved, it has gone out
        of scope, and holding it to its expiry would strand a warning from a
        place the user has left.

        Accepts the *unfiltered* normalized list so terminal-phase alerts
        (``cancel``/``expired``) can fire ``incident_removed`` with their
        true terminal phase (RFC §2.3) before being dropped from the
        returned active set. Alerts that disappear silently between polls
        are inferred as ``expired`` if their ``expires`` timestamp is in
        the past, otherwise ``cancel``.

        Each ending is announced once. A terminal record that stays in the feed
        is reconciled again every cycle, and every one of those reconciliations
        used to fire ``incident_removed`` (issue #145); the id is tombstoned
        instead, and a repeat sighting of the same ending is a no-op. An id that
        comes back *live* clears its tombstone and fires ``incident_created``,
        because a reissue is news and swallowing it is worse than a duplicate.

        Returns only the active alerts (``phase`` ∈ ``{new, update}``),
        with ``previous_phase`` and ``phase_changed`` set.
        """
        incoming = {a.id: a for a in alerts}
        active: dict[str, CAPAlert] = {}
        result: list[CAPAlert] = []
        now = datetime.now(timezone.utc)

        # Age out tombstones before they are read, not after, so an ending the
        # store has stopped defending cannot suppress one more cycle on the
        # strength of when the last prune happened to run.
        tombstone_cutoff = now - TOMBSTONE_IDLE_TTL
        self._tombstones = {
            alert_id: seen
            for alert_id, seen in self._tombstones.items()
            if seen > tombstone_cutoff
        }

        # Build a lookup of previous-poll alerts by CAP <identifier> so that
        # cross-revision supersession can be detected via alert.references.
        prev_by_identifier: dict[str, CAPAlert] = {
            prev.identifier: prev for prev in self._previous.values() if prev.identifier
        }

        for alert_id, alert in incoming.items():
            prev = self._previous.get(alert_id)
            terminal = alert.phase in ("cancel", "expired")

            if terminal:
                if alert_id in self._tombstones:
                    # This ending has already been announced and the source is
                    # still publishing the record. Refresh so the tombstone ages
                    # from the last sighting, not the first.
                    self._tombstones[alert_id] = now
                    continue
            else:
                # Live again after an ending. The alert left the tracked set when
                # it was terminated, so it is a new incident to us and takes the
                # ordinary first-sighting path below.
                self._tombstones.pop(alert_id, None)

            if prev is None:
                # Check for cross-poll supersession: this alert's <references>
                # may contain the CAP identifier of a previous-poll alert whose
                # bilingual key differed (e.g. polygon expanded between revisions).
                superseded_prev = next(
                    (
                        prev_by_identifier[ref_id]
                        for ref_id in (alert.references or ())
                        if ref_id in prev_by_identifier
                    ),
                    None,
                )
                if superseded_prev is not None:
                    phase_changed = superseded_prev.phase != alert.phase
                    updated = replace(
                        alert,
                        previous_phase=superseded_prev.phase,
                        phase_changed=phase_changed,
                    )
                    if terminal:
                        self._tombstones[alert_id] = now
                        self._fire_event(
                            EVENT_INCIDENT_REMOVED,
                            updated,
                            phase_changed=phase_changed,
                            changed_fields=[],
                        )
                        continue
                    self._fire_event(
                        EVENT_INCIDENT_UPDATED,
                        updated,
                        phase_changed=phase_changed,
                        changed_fields=_diff_fields(superseded_prev, alert),
                    )
                else:
                    updated = replace(alert, phase_changed=True)
                    if terminal:
                        # First sight is already terminal — emit removed only.
                        self._tombstones[alert_id] = now
                        self._fire_event(
                            EVENT_INCIDENT_REMOVED,
                            updated,
                            phase_changed=True,
                            changed_fields=[],
                        )
                        continue
                    self._fire_event(
                        EVENT_INCIDENT_CREATED,
                        updated,
                        phase_changed=True,
                        changed_fields=[],
                    )
            else:
                changed = _diff_fields(prev, alert)
                phase_changed = prev.phase != alert.phase
                updated = replace(
                    alert,
                    previous_phase=prev.phase,
                    phase_changed=phase_changed,
                )
                if terminal:
                    self._tombstones[alert_id] = now
                    self._fire_event(
                        EVENT_INCIDENT_REMOVED,
                        updated,
                        phase_changed=phase_changed,
                        changed_fields=changed,
                    )
                    continue
                if changed:
                    self._fire_event(
                        EVENT_INCIDENT_UPDATED,
                        updated,
                        phase_changed=phase_changed,
                        changed_fields=changed,
                    )
            active[alert_id] = updated
            result.append(updated)

        # Set of all CAP identifiers referenced by incoming alerts. Used to
        # detect cross-poll supersession in the silent-disappearance loop.
        referenced_identifiers: set[str] = {
            ref_id for alert in incoming.values() for ref_id in (alert.references or ())
        }
        # Supersession the caller can see but this list cannot. A revision whose
        # geometry moved off the user is dropped by the region filter before it
        # reaches here, so its ``references`` never appear in ``incoming`` — yet
        # the alert it replaces has genuinely been replaced, not gone unobserved,
        # and retaining it would strand it until its expiry. Empty for every
        # caller that holds no document set of its own.
        referenced_identifiers |= superseded_identifiers

        # Silent disappearance: provider dropped the alert without a Cancel
        # message. Retained or terminated according to the source's absence
        # policy; when terminated, the phase is inferred from ``expires``.
        for alert_id, prev in self._previous.items():
            if alert_id in incoming:
                continue
            # If this alert's identifier appears in a current-poll alert's
            # references, it was superseded — skip incident_removed since
            # incident_updated was already fired for the superseding alert.
            if prev.identifier and prev.identifier in referenced_identifiers:
                continue
            if not scope_changed and _retain_on_absence(prev, now):
                retained = replace(
                    prev,
                    stale=True,
                    last_confirmed=self._last_seen.get(alert_id, ""),
                    phase_changed=False,
                )
                active[alert_id] = retained
                result.append(retained)
                continue
            # Tombstoned like an announced ending: a source that drops a record
            # and later republishes it terminal — measured behaviour on the NAAD
            # feeds, which withdraw ended alerts and return them hours later —
            # would otherwise announce the same ending twice, once here and once
            # as a first sighting that is already terminal.
            self._tombstones[alert_id] = now
            inferred = _infer_terminal_phase(prev, now)
            terminal_alert = replace(
                prev,
                previous_phase=prev.phase,
                phase=inferred,
                phase_changed=prev.phase != inferred,
            )
            self._fire_event(
                EVENT_INCIDENT_REMOVED,
                terminal_alert,
                phase_changed=terminal_alert.phase_changed,
                changed_fields=[],
            )

        now_iso = now.isoformat()
        for alert_id in incoming:
            if alert_id in active:
                self._last_seen[alert_id] = now_iso
        self._last_seen = {
            alert_id: seen
            for alert_id, seen in self._last_seen.items()
            if alert_id in active
        }

        self._previous = active
        return result

    def _fire_event(
        self,
        event_type: str,
        alert: CAPAlert,
        *,
        phase_changed: bool,
        changed_fields: list[str],
    ) -> None:
        """Fire an HA event matching RFC §2.3 (schema documented in docs/events.md).

        ``entry_id``, ``area_desc`` and ``removal_reason`` are project
        extensions not in the RFC.
        """
        payload: dict = {
            "entry_id": self._entry_id,
            "incident_id": alert.id,
            "event": alert.event,
            "severity": alert.severity_normalized,
            "phase": alert.phase,
            "phase_changed": phase_changed,
            "changed_fields": changed_fields,
            "area_desc": alert.area_desc,
        }
        if event_type == EVENT_INCIDENT_REMOVED:
            reason = _removal_reason(alert)
            if reason:
                payload["removal_reason"] = reason
        # entity_id: look up via entity registry by unique_id.
        # On first sighting the entity isn't registered yet; omit the key.
        unique_id = f"{self._entry_id}_{self._provider}_{alert.id}"
        ent_reg = er.async_get(self._hass)
        entity_id = ent_reg.async_get_entity_id("sensor", DOMAIN, unique_id)
        if entity_id is not None:
            payload["entity_id"] = entity_id

        self._hass.bus.async_fire(event_type, payload)


def _removal_reason(alert: CAPAlert) -> str:
    """Why this alert went away, or "" when the provider never said (issue #108).

    ``phase`` alone collapses two different endings: an ECCC watch upgraded to a
    warning ends the same way an all-clear does, and a consumer paying per
    message cannot tell that the successor's ``incident_created`` is already
    carrying the news. The distinction survives on ``lifecycle_status``, which
    the source's convention entry maps to a neutral reason.

    Deliberately independent of the terminal ``phase``: ``transitioned_out``
    documents are issued with ``expires`` at or before ``sent``, so most of them
    normalize to ``expired`` rather than ``cancel`` — gating this on ``cancel``
    would drop the reason in exactly the upgrade case it exists for.

    Reasons are scoped to the source that published the token, like the terminal
    set they are keyed by: a provider that publishes no lifecycle vocabulary
    cannot be labelled with another's.
    """
    if not alert.lifecycle_status:
        return ""
    conventions = conventions_for(alert.provider, alert.sender)
    return conventions.lifecycle_removal_reasons.get(alert.lifecycle_status, "")


def _diff_fields(prev: CAPAlert, curr: CAPAlert) -> list[str]:
    """Return allowlisted field names whose values differ between prev/curr."""
    return [
        name
        for name in CHANGED_FIELDS_ALLOWLIST
        if getattr(prev, name) != getattr(curr, name)
    ]


def _retain_on_absence(alert: CAPAlert, now: datetime) -> bool:
    """Whether an alert missing from this reconciliation should be kept.

    Absence is an observation, not an announcement. Two sanctioned endpoints of
    one national feed have been measured disagreeing about which alerts are
    live (RFC §2.5), and NWS never publishes a cancellation to the endpoint the
    provider polls — cancellations land on a different one entirely, which is
    why the NWS provider fetches them separately. So an alert vanishing between
    reconciliations means either "it ended" or "we failed to see it", and
    nothing in the observation itself distinguishes them.

    Retaining costs a stale warning until its published expiry. Terminating
    costs a live hazard silently cleared from the dashboard, followed by a
    *new* incident when the feed recovers, because an id that left the tracked
    set comes back unrecognized — the history fragmentation of RFC §1.2,
    self-inflicted. The second is worse, so absence alone does not terminate.

    The one thing that makes absence itself authoritative is the source's
    declared convention: ``ABSENCE_ENDS`` says withdrawing a record is
    genuinely how this source announces the end. It is a property of the
    source's contract, not of any one message, which is why an alert that
    merely *omits* ``expires`` is not terminated on that basis alone.

    **Retention requires an exit.** Keeping an alert is only safe if something
    can eventually end it, and an alert with no expiry has ruled out the
    obvious candidate. Two others remain, both declared in the convention
    table: a terminal vocabulary the source publishes
    (``lifecycle_removal_reasons``), or a provider that goes and fetches
    terminations the active feed omits (``discovers_terminations``). With
    none of the three, retention has no way to end and the entity would
    outlive the hazard by an unbounded margin — so absence stays authoritative
    for exactly that case.

    This is not hypothetical. Across 113 WMO authorities serving CAP, 20 of
    510 ``<info>`` blocks published no ``<expires>`` at all, and for two of
    them — Macao and Curaçao — it was every single alert, with nothing in the
    RSS envelope to fall back on. WMO declares no terminal vocabulary and has
    no termination lookup, so retaining those would have meant entities that
    never go away for whole countries. Deriving the rule from the table rather
    than naming those senders keeps it true for the next such source.

    Resolved per sender, not per provider, because sender-scoped convention
    entries *replace* the provider's (see ``conventions_for``) and a dialect
    must be able to carry its own absence policy.
    """
    conventions = conventions_for(alert.provider, alert.sender)
    if conventions.absence_policy != ABSENCE_RETAIN:
        return False
    expires_at = _parse_iso(alert.expires)
    if expires_at is not None:
        return now < expires_at
    return bool(conventions.lifecycle_removal_reasons) or (
        conventions.discovers_terminations
    )


def _infer_terminal_phase(alert: CAPAlert, now: datetime) -> str:
    """Infer a terminal phase for an alert that vanished between polls.

    ``expired`` if the alert's ``expires`` timestamp is in the past,
    otherwise ``cancel`` (the provider dropped the record without a Cancel
    message — treat as an implicit cancel).
    """
    expires_at = _parse_iso(alert.expires)
    if expires_at is not None and now >= expires_at:
        return "expired"
    return "cancel"


def _parse_iso(value: str) -> datetime | None:
    """Parse an ISO 8601 timestamp; return ``None`` on failure."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt
