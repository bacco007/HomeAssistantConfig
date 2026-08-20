"""Repairs issues for integrations that are going to break.

None of these are fixable in place, because the code lives in someone else's
repository. What the user can do is real though: update the integration, raise
it upstream, or replace it before the deadline.
"""

from __future__ import annotations

from urllib.parse import quote_plus

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import issue_registry as ir

from .const import DOMAIN, ISSUE_ID

LEARN_MORE_URL = "https://booyaka101.github.io/hass-breakage-radar/"

BROKEN_ISSUE_PREFIX = "broken_now_"
IMMINENT_ISSUE_PREFIX = "imminent_"
#: Cards get their own prefixes: a card and a domain could share a name, and
#: the wording differs ("card" vs "integration"). Deliberately not extensions
#: of the plain prefixes, so an integration domain that happens to start with
#: "card_" can never be mistaken for one.
BROKEN_CARD_PREFIX = "card_broken_"
IMMINENT_CARD_PREFIX = "card_imminent_"
ALERT_PREFIXES = (BROKEN_ISSUE_PREFIX, IMMINENT_ISSUE_PREFIX)

#: Keeps the summary description readable when a lot is scheduled.
MAX_SCHEDULE_LINES = 8
MAX_DOMAINS_PER_LINE = 6


def format_schedule(schedule: list[dict], only: set[str] | None = None) -> str:
    """A dated timeline of what breaks when, as a markdown list.

    A list rather than a code block because Home Assistant renders repair
    descriptions as markdown, and a fenced block scrolls sideways instead of
    wrapping, which hides the integration names on narrow screens.
    """
    lines: list[str] = []
    hidden = 0
    for group in schedule:
        domains = group.get("domains") or []
        if only is not None:
            domains = [d for d in domains if d in only]
        if not domains:
            continue
        if len(lines) >= MAX_SCHEDULE_LINES:
            hidden += len(domains)
            continue
        shown = domains[:MAX_DOMAINS_PER_LINE]
        names = ", ".join(f"`{name}`" for name in shown)
        if len(domains) > len(shown):
            names += f" and {len(domains) - len(shown)} more"
        lines.append(f"- **{group['due']}** ({group['release']}): {names}")
    if hidden:
        lines.append(f"- ...and {hidden} more further out.")
    return "\n".join(lines)


def plural(count: int, singular: str, plural_form: str | None = None) -> str:
    """``1 integration`` / ``9 integrations``, since a title cannot say (s)."""
    return singular if count == 1 else (plural_form or f"{singular}s")


def describe_links(link: dict | None) -> str:
    """Where to go next, as markdown.

    Deliberately points at *existing* reports rather than a blank issue form.
    Popular integrations have thousands of users; if each one files "this
    breaks in 2027.5" the maintainer gets the same issue over and over. A
    search for the deprecated symbol lands on the report if there is one, so
    the reader can add a reaction instead of a duplicate, and shows an empty
    result with a New issue button if there is not.
    """
    link = link or {}
    repo_url = (link.get("repo_url") or "").rstrip("/")
    repository = link.get("repository") or "the integration's repository"
    symbol = link.get("symbol") or ""
    learn_more = link.get("learn_more") or ""
    report = link.get("report") or {}

    parts: list[str] = []
    if not repo_url:
        parts.append(
            "Check the integration's own repository for a newer release, and "
            "its issue tracker before reporting anything."
        )
    elif link.get("archived"):
        parts.append(
            f"[{repository}]({repo_url}) is archived, so no fix is coming. "
            "Plan to replace this integration."
        )
    else:
        parts.append(
            f"First check [{repository} releases]({repo_url}/releases) for a "
            "version that fixes it."
        )
        if report and report.get("state") == "open":
            parts.append(
                f"It is already reported: [#{report['number']} "
                f"{report['title']}]({report['url']}). Add a reaction there "
                "rather than opening another one."
            )
        elif report:
            parts.append(
                f"It was reported and closed: [#{report['number']} "
                f"{report['title']}]({report['url']}), so a fix may already "
                "have shipped."
            )
        elif link.get("issues_enabled") is False:
            parts.append(
                "That repository does not accept issues, so there is nowhere "
                "to report it."
            )
        elif symbol:
            query = quote_plus(f"is:issue {symbol}")
            parts.append(
                f"If there isn't one, [see whether it is already "
                f"reported]({repo_url}/issues?q={query}). Adding a reaction to "
                "an existing report helps the maintainer more than another "
                "copy of it does."
            )
        else:
            parts.append(
                f"If there isn't one, check [the issue tracker]({repo_url}/issues) "
                "before reporting it, so the maintainer does not get duplicates."
            )
    if learn_more.startswith("http"):
        parts.append(f"[What Home Assistant is changing]({learn_more})")
    elif learn_more:
        parts.append(f"What Home Assistant is changing: `{learn_more}`")
    return "\n\n".join(parts)


@callback
def _async_sync_alert_issues(hass: HomeAssistant, report: dict) -> None:
    """One card per integration that needs attention now, or soon.

    Everything further out stays in the single summary issue, because Repairs
    has no snooze and a wall of undismissable year-ahead cards just trains
    people to ignore the panel.
    """
    broken: dict[str, str] = report.get("broken_now") or {}
    imminent: dict[str, dict] = report.get("imminent") or {}
    broken_cards: dict[str, str] = report.get("broken_now_cards") or {}
    imminent_cards: dict[str, dict] = report.get("imminent_cards") or {}
    links: dict[str, dict] = report.get("links") or {}
    due_by_release = {
        group["release"]: group["due"] for group in report.get("schedule") or []
    }

    for prefix, bucket, key in (
        (BROKEN_ISSUE_PREFIX, broken, "integration_broken"),
        (BROKEN_CARD_PREFIX, broken_cards, "card_broken"),
    ):
        for name, release in bucket.items():
            ir.async_create_issue(
                hass,
                DOMAIN,
                f"{prefix}{name}",
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.ERROR,
                translation_key=key,
                translation_placeholders={
                    "domain": name,
                    "release": str(release),
                    "where": describe_links(links.get(name)),
                },
                learn_more_url=links.get(name, {}).get("repo_url") or LEARN_MORE_URL,
            )

    for prefix, bucket, key in (
        (IMMINENT_ISSUE_PREFIX, imminent, "integration_imminent"),
        (IMMINENT_CARD_PREFIX, imminent_cards, "card_imminent"),
    ):
        for name, entry in bucket.items():
            release = str(entry.get("release", ""))
            days = max(int(entry.get("days", 0)), 0)
            ir.async_create_issue(
                hass,
                DOMAIN,
                f"{prefix}{name}",
                is_fixable=False,
                is_persistent=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key=key,
                translation_placeholders={
                    "domain": name,
                    "release": release,
                    "days": str(days),
                    "day_word": plural(days, "day"),
                    "due": due_by_release.get(release, release),
                    "where": describe_links(links.get(name)),
                },
                learn_more_url=links.get(name, {}).get("repo_url") or LEARN_MORE_URL,
            )

    # Anything that dropped out of a level, including an uninstalled component
    # that has vanished from the report, must lose its issue.
    async_get = getattr(ir, "async_get", None)
    if async_get is None:
        return
    registry = async_get(hass)
    for issue_domain, issue_id in list(getattr(registry, "issues", {})):
        if issue_domain != DOMAIN:
            continue
        if issue_id.startswith(BROKEN_CARD_PREFIX):
            if issue_id[len(BROKEN_CARD_PREFIX):] not in broken_cards:
                ir.async_delete_issue(hass, DOMAIN, issue_id)
        elif issue_id.startswith(IMMINENT_CARD_PREFIX):
            if issue_id[len(IMMINENT_CARD_PREFIX):] not in imminent_cards:
                ir.async_delete_issue(hass, DOMAIN, issue_id)
        elif issue_id.startswith(BROKEN_ISSUE_PREFIX):
            if issue_id[len(BROKEN_ISSUE_PREFIX):] not in broken:
                ir.async_delete_issue(hass, DOMAIN, issue_id)
        elif issue_id.startswith(IMMINENT_ISSUE_PREFIX):
            if issue_id[len(IMMINENT_ISSUE_PREFIX):] not in imminent:
                ir.async_delete_issue(hass, DOMAIN, issue_id)


@callback
def async_sync_issue(hass: HomeAssistant, report: dict) -> None:
    """Create, update or clear the Breakage Radar repairs issues."""
    _async_sync_alert_issues(hass, report)

    summarised = report.get("summarised_domains") or []
    summarised_cards = report.get("summarised_cards") or []
    everything = set(summarised) | set(summarised_cards)
    if not everything:
        ir.async_delete_issue(hass, DOMAIN, ISSUE_ID)
        return

    schedule = report.get("schedule") or []
    remaining = [
        group
        for group in schedule
        if any(domain in everything for domain in group.get("domains") or [])
    ]
    first = remaining[0] if remaining else None

    if summarised and summarised_cards:
        noun = "integrations and cards"
    elif summarised_cards:
        noun = plural(len(summarised_cards), "Lovelace card")
    else:
        noun = plural(len(summarised), "integration")

    ir.async_create_issue(
        hass,
        DOMAIN,
        ISSUE_ID,
        is_fixable=False,
        is_persistent=False,
        severity=ir.IssueSeverity.WARNING,
        translation_key="integrations_affected",
        translation_placeholders={
            "count": str(len(everything)),
            "noun": noun,
            "verb": "uses" if len(everything) == 1 else "use",
            "earliest": first["release"] if first else "a future release",
            "earliest_due": first["due"] if first else "",
            "schedule": format_schedule(schedule, only=everything),
            "window": str(report.get("alert_window_days") or 0),
            "board_url": LEARN_MORE_URL,
        },
        learn_more_url=LEARN_MORE_URL,
    )
