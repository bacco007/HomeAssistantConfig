import "/football_hub/football-hub-panel.js?v=0.20.22-acca-score-refresh";

const FootballHubPanel = customElements.get("football-hub-panel");

if (FootballHubPanel && !FootballHubPanel.prototype.__lmsLiveSharePatched) {
  const fixtureKey = (panel, fixture, index = 0) => String(
    fixture?.fixture_id ??
    fixture?.id ??
    `${fixture?.home_team || ""}-${fixture?.away_team || ""}-${panel._lmsFixtureTimestamp(fixture) || index}`
  );

  const statusCode = (fixture) => String(
    fixture?.status_short ?? fixture?.status?.short ?? fixture?.status ?? ""
  ).trim().toUpperCase();

  const isPreMatch = (panel, fixture) => {
    const status = statusCode(fixture);
    if (["NS", "TBD", "SCHEDULED", "NOT STARTED"].includes(status)) return true;
    if (["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "FT", "AET", "PEN", "AWD", "WO"].includes(status)) return false;
    const kickoff = Number(panel._lmsFixtureTimestamp(fixture) || 0);
    return kickoff > Math.floor(Date.now() / 1000);
  };

  const matchEvents = (fixture) => {
    const candidates = [fixture?.events, fixture?.timeline, fixture?.incidents, fixture?.match_events];
    for (const value of candidates) {
      if (Array.isArray(value)) return value;
    }
    return [];
  };

  const normaliseFixtureForShare = (panel, fixture) => {
    const result = { ...fixture };
    if (isPreMatch(panel, result)) {
      result.home_goals = null;
      result.away_goals = null;
      if (result.goals && typeof result.goals === "object" && !Array.isArray(result.goals)) {
        result.goals = { ...result.goals, home: null, away: null };
      }
    }

    const events = matchEvents(result);
    if (events.length) result.events = events;

    result.status_short = statusCode(result) || result.status_short || "";
    result.elapsed = result.elapsed ?? result.status?.elapsed ?? null;
    return result;
  };

  const eventSignature = (fixture) => {
    const events = matchEvents(fixture);
    return events.map((event) => [
      event?.time?.elapsed ?? event?.elapsed ?? event?.minute ?? null,
      event?.time?.extra ?? event?.extra ?? null,
      event?.type ?? event?.event_type ?? "",
      event?.detail ?? event?.event_detail ?? "",
      event?.player?.name ?? event?.player ?? event?.scorer ?? "",
      event?.team?.name ?? event?.team ?? "",
    ]);
  };

  const fixtureSignature = (panel, fixtures = []) => JSON.stringify(
    fixtures.map((fixture, index) => [
      fixtureKey(panel, fixture, index),
      isPreMatch(panel, fixture) ? null : (fixture?.home_goals ?? fixture?.goals?.home ?? null),
      isPreMatch(panel, fixture) ? null : (fixture?.away_goals ?? fixture?.goals?.away ?? null),
      statusCode(fixture),
      fixture?.elapsed ?? fixture?.status?.elapsed ?? null,
      eventSignature(fixture),
    ])
  );

  const originalSharePayload = FootballHubPanel.prototype._lmsSharePayload;
  FootballHubPanel.prototype._lmsSharePayload = function () {
    const payload = originalSharePayload.call(this);
    if (!payload?.roundFixtures) return payload;

    payload.roundFixtures = payload.roundFixtures.map((group) => ({
      ...group,
      fixtures: (group.fixtures || []).map((fixture) => normaliseFixtureForShare(this, fixture)),
    }));
    return payload;
  };

  FootballHubPanel.prototype._captureLmsLeagueData = function () {
    const competition = this._lmsCompetition;
    const status = this._statusInfo();
    if (!competition?.leagues?.some((league) => league.key === status.competition_key)) return;

    const teams = this._lmsTeams();
    if (!teams.length) return;

    const leagueTeams = new Set(teams);
    const belongsToLeague = (fixture) =>
      leagueTeams.has(fixture?.home_team) || leagueTeams.has(fixture?.away_team);

    const sourceFixtures = [
      ...(this._attrs("fixtures").fixtures || []),
      ...(this._attrs("results").latest_5 || []).filter(belongsToLeague),
      ...(this._attrs("live_matches").matches || []).filter(belongsToLeague),
    ];

    const merged = new Map();
    sourceFixtures.forEach((fixture, index) => {
      const key = fixtureKey(this, fixture, index);
      const previous = merged.get(key);
      merged.set(key, previous ? { ...previous, ...fixture } : fixture);
    });

    const fixtures = [...merged.values()].sort(
      (left, right) => this._lmsFixtureTimestamp(left) - this._lmsFixtureTimestamp(right)
    );

    const previousFixtures = this._lmsLeagueCache?.[status.competition_key]?.fixtures || [];
    const previousSignature = fixtureSignature(this, previousFixtures);
    const nextSignature = fixtureSignature(this, fixtures);

    this._lmsLeagueCache[status.competition_key] = {
      teams,
      fixtures,
      updated: Date.now(),
    };
    localStorage.setItem("football_hub_lms_league_cache", JSON.stringify(this._lmsLeagueCache));

    this._ensureLmsDeadline();
    queueMicrotask(() => this._maybeAutoSettleLmsRound());

    // Push score, status, minute and event changes into the existing public competition.
    // The same shareId is always reused, so existing public/player URLs never change.
    if (competition.shareId && previousSignature !== nextSignature) {
      this._queueLmsShareSync();
    }
  };

  FootballHubPanel.prototype.__lmsLiveSharePatched = true;
}
