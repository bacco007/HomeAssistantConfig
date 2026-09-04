"""The HAUS update coordinator."""

import logging
from dataclasses import replace
from datetime import timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CoreState, HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .collectors import (
    collect_diversity,
    collect_hygiene,
    collect_usage,
    collect_users,
)
from .const import (
    ACTIVITY_RECENT_DAYS,
    ACTIVITY_SUSTAINED_DAYS,
    CONF_HAGHS_ENTITY_ID,
    DEFAULT_HAGHS_ENTITY_ID,
    DOMAIN,
    EVENT_TIER_CHANGED,
    SCORE_TIERS,
    UPDATE_INTERVAL_MINUTES,
)
from .scoring import (
    PillarScores,
    ScoreResult,
    build_result,
    diversity_details,
    score_diversity,
    score_usage,
    score_users,
    usage_details,
    usage_metrics,
    users_details,
    users_metrics,
)
from .store import HausStore

_LOGGER = logging.getLogger(__name__)

type HausConfigEntry = ConfigEntry[HausCoordinator]


class HausCoordinator(DataUpdateCoordinator[ScoreResult]):
    """Collect the signals and hold the current score."""

    def __init__(
        self, hass: HomeAssistant, entry: HausConfigEntry, store: HausStore
    ) -> None:
        """Initialise the coordinator."""
        self.store = store
        # The last tier considered trustworthy enough to compare against.
        # None until Home Assistant has finished starting: see _note_tier.
        self._tier: str | None = None
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )

    @property
    def haghs_entity_id(self) -> str:
        """Return the entity id to read the hygiene pillar from.

        Read fresh on every refresh rather than cached at setup, so an options
        change or a later HAGHS install is picked up without touching HAUS.
        """
        options = self.config_entry.options if self.config_entry else {}
        return str(options.get(CONF_HAGHS_ENTITY_ID, DEFAULT_HAGHS_ENTITY_ID))

    async def _async_update_data(self) -> ScoreResult:
        """Collect every pillar and assemble the result.

        Hygiene stays None until M4 consumes HAGHS, which means the score is
        already exercising the renormalised path that an instance without HAGHS
        will use for good.
        """
        now = dt_util.utcnow()
        usage_signals = replace(
            collect_usage(self.hass),
            notification_count=self.store.notifications_in_window(now),
            notification_history_days=self.store.history_days(now),
        )
        diversity_signals = collect_diversity(self.hass)
        users_signals = replace(
            await collect_users(self.hass),
            users_active_7d=self.store.users_active_within(ACTIVITY_RECENT_DAYS, now),
            users_active_30d=self.store.users_active_within(
                ACTIVITY_SUSTAINED_DAYS, now
            ),
            activity_history_days=self.store.history_days(now),
        )
        result = build_result(
            PillarScores(
                hygiene=collect_hygiene(self.hass, self.haghs_entity_id),
                usage=score_usage(usage_signals),
                diversity=score_diversity(diversity_signals),
                users=score_users(users_signals),
            ),
            metrics={
                "usage": usage_metrics(usage_signals),
                "users": users_metrics(users_signals),
            },
            details={
                "usage": usage_details(usage_signals),
                "diversity": diversity_details(diversity_signals),
                "users": users_details(users_signals),
            },
        )
        self.store.record_score(result.score, now)
        self._note_tier(result)
        return result

    def _note_tier(self, result: ScoreResult) -> None:
        """Fire haus_tier_changed when the tier has genuinely moved.

        Two readings are deliberately not compared against.

        The first, because a tier has not changed just because HAUS has
        started watching it - there is nothing to have moved from.

        Any reading taken before Home Assistant has finished starting, because
        entry setup runs before `automation`, `script` and `scene` have
        loaded, so that collection sees an empty house. Comparing against it
        would fire a drop to Starter and a climb back on every single restart.
        The recollect that `async_at_started` schedules is what establishes the
        baseline instead.

        A tier change that happened while Home Assistant was down is therefore
        not reported. HAUS did not observe it, and inventing the transition on
        the way up would be a notification about nothing the user did.
        """
        # Not `is_running`, which is true during CoreState.starting as well -
        # exactly the window this needs to exclude. CoreState.running is the
        # same moment `async_at_started` schedules the recollect for.
        if self.hass.state is not CoreState.running:
            return
        previous = self._tier
        self._tier = result.tier
        if previous is None or previous == result.tier:
            return

        order = [name for _, name in SCORE_TIERS]
        self.hass.bus.async_fire(
            EVENT_TIER_CHANGED,
            {
                "previous_tier": previous,
                "tier": result.tier,
                "score": result.score,
                "direction": (
                    "up" if order.index(result.tier) > order.index(previous) else "down"
                ),
            },
        )
