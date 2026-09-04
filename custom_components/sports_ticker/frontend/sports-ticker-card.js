const CARD_VERSION = "0.5.3";

const htmlEscape = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const asArray = (value) => Array.isArray(value) ? value : [];

const SPORT_DEFS = {
  nfl: { label: "NFL", entity: "sensor.espn_nfl_scoreboard_raw", kind: "football", accent: "#2563eb" },
  cfb: { label: "CFB", entity: "sensor.espn_cfb_scoreboard_raw", kind: "football", accent: "#7c3aed" },
  mlb: { label: "MLB", entity: "sensor.espn_mlb_scoreboard_raw", kind: "baseball", accent: "#ef4444" },
  nba: { label: "NBA", entity: "sensor.espn_nba_scoreboard_raw", kind: "basketball", accent: "#f97316" },
  wnba: { label: "WNBA", entity: "sensor.espn_wnba_scoreboard_raw", kind: "basketball", accent: "#f59e0b" },
  nhl: { label: "NHL", entity: "sensor.espn_nhl_scoreboard_raw", kind: "hockey", accent: "#0ea5e9" },
  mls: { label: "MLS", entity: "sensor.espn_mls_scoreboard_raw", kind: "soccer", accent: "#14b8a6" },
  epl: { label: "EPL", entity: "sensor.espn_epl_scoreboard_raw", kind: "soccer", accent: "#8b5cf6" },
  laliga: { label: "LALIGA", entity: "sensor.espn_laliga_scoreboard_raw", kind: "soccer", accent: "#ec4899" },
  bundesliga: { label: "BUNDESLIGA", entity: "sensor.espn_bundesliga_scoreboard_raw", kind: "soccer", accent: "#dc2626" },
  seriea: { label: "SERIE A", entity: "sensor.espn_seriea_scoreboard_raw", kind: "soccer", accent: "#2563eb" },
  ligue1: { label: "LIGUE 1", entity: "sensor.espn_ligue1_scoreboard_raw", kind: "soccer", accent: "#1d4ed8" },
  ucl: { label: "UCL", entity: "sensor.espn_ucl_scoreboard_raw", kind: "soccer", accent: "#4338ca" },
};

const PRESETS = {
  game: {
    family: "game",
    label: "Game — Standard",
    defaults: { show_league: true, show_logos: true, show_records: true, show_venue: true, show_broadcast: true },
  },
  game_compact: {
    family: "game",
    label: "Game — Compact",
    defaults: { show_league: false, show_logos: true, show_records: true, show_venue: false, show_broadcast: false },
  },
  ticker: {
    family: "ticker",
    label: "Scoreboard — ESPN Ticker",
    defaults: {
      sports: ["nfl"],
      show_logos: true,
      ticker_seconds_per_game: 8,
      ticker_pause_on_hover: true,
      ticker_max_games_per_sport: 20,
    },
  },
};

const isSportsTickerScoreboardEntity = (hass, entityId) => {
  const state = hass?.states?.[entityId];
  return Boolean(entityId?.startsWith("sensor.espn_") && Array.isArray(state?.attributes?.events));
};

class SportsTickerCard extends HTMLElement {
  static getStubConfig(hass) {
    const entity = Object.keys(hass?.states ?? {}).find((entityId) => isSportsTickerScoreboardEntity(hass, entityId));
    return entity ? { entity, preset: "game" } : { preset: "game" };
  }

  static async getConfigElement() {
    await customElements.whenDefined("sports-ticker-card-editor");
    return document.createElement("sports-ticker-card-editor");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._renderSignature = "";
    this._tickerEpoch = Date.now();
  }

  setConfig(config) {
    if (!config) throw new Error("Sports Ticker card requires configuration");
    const presetName = PRESETS[config.preset] ? config.preset : "game";
    const family = PRESETS[presetName].family;
    if (family === "game" && !config.entity) throw new Error("Game presets require a Sports Ticker entity");
    this._config = { preset: presetName, ...PRESETS[presetName].defaults, ...config };
    this._renderSignature = "";
    this._tickerEpoch = Date.now();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const signature = this._dataSignature();
    if (signature === this._renderSignature) return;
    this._renderSignature = signature;
    this._render();
  }

  getCardSize() {
    if (this._family() === "ticker") return 1;
    return this._config?.preset === "game_compact" ? 3 : 4;
  }

  getGridOptions() {
    if (this._family() === "ticker") return { columns: 12, rows: 1, min_columns: 6, min_rows: 1 };
    if (this._config?.preset === "game_compact") return { columns: 12, rows: 3, min_columns: 6, min_rows: 2 };
    return { columns: 12, rows: 4, min_columns: 6, min_rows: 3 };
  }

  _family() {
    return PRESETS[this._config?.preset]?.family || "game";
  }

  _selectedSports() {
    const configured = asArray(this._config?.sports).filter((sport) => SPORT_DEFS[sport]);
    if (configured.length) return configured;
    if (this._config?.entity) {
      const match = Object.entries(SPORT_DEFS).find(([, sport]) => sport.entity === this._config.entity);
      if (match) return [match[0]];
    }
    return ["nfl"];
  }

  _dataSignature() {
    if (!this._hass || !this._config) return "";
    const ids = this._family() === "ticker"
      ? this._selectedSports().map((key) => SPORT_DEFS[key].entity)
      : [this._config.entity];
    return ids.map((id) => {
      const state = this._hass.states[id];
      return `${id}:${state?.last_updated || "missing"}:${state?.state || ""}`;
    }).join("|");
  }

  _render() {
    if (!this.shadowRoot || !this._config || !this._hass) return;
    if (this._family() === "ticker") {
      this._renderTicker();
      return;
    }

    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) {
      this.shadowRoot.innerHTML = this._styles() + this._message(`Entity not found: ${this._config.entity}`);
      return;
    }
    const attrs = stateObj.attributes ?? {};
    const events = asArray(attrs.events);
    if (!events.length) {
      this.shadowRoot.innerHTML = this._styles() + this._message("No games are currently available.");
      return;
    }
    this._renderGame(attrs, events);
  }

  _renderGame(attrs, events) {
    const event = this._selectEvent(events, attrs.favorite_team, this._config.event_id);
    const game = this._normalizeEvent(event, "generic");
    if (!game) {
      this.shadowRoot.innerHTML = this._styles() + this._message("Game data is not available.");
      return;
    }

    const league = attrs.league_name || attrs.league || "Sports Ticker";
    const stale = Boolean(attrs.stale);
    const compact = this._config.preset === "game_compact";
    const stateClass = game.completed ? "final" : game.live ? "live" : "scheduled";

    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card>
        <div class="card game-card ${stateClass} ${compact ? "compact" : "standard"}">
          <div class="header">
            <div class="header-left">
              ${this._config.show_league ? `<span class="league">${htmlEscape(String(league).toUpperCase())}</span>` : ""}
              ${stale ? '<span class="badge">CACHED</span>' : ""}
            </div>
            <div class="status-wrap">${game.live ? '<span class="game-live-dot" aria-hidden="true"></span>' : ""}<span class="status">${htmlEscape(game.status)}</span></div>
          </div>
          <div class="matchup">
            ${this._team(game.away, game.completed || game.live)}
            <div class="center">
              ${game.live || game.completed
                ? `<div class="scoreline"><span>${htmlEscape(game.away.score)}</span><span class="score-separator">–</span><span>${htmlEscape(game.home.score)}</span></div>`
                : '<div class="versus">@</div>'}
              <div class="detail">${htmlEscape(game.detail)}</div>
            </div>
            ${this._team(game.home, game.completed || game.live)}
          </div>
          ${this._config.show_records ? `<div class="records"><span>${htmlEscape(game.away.record)}</span><span>${htmlEscape(game.home.record)}</span></div>` : ""}
          ${(this._config.show_venue && game.venue) || (this._config.show_broadcast && game.broadcast) ? `
            <div class="footer">
              ${this._config.show_venue && game.venue ? `<span class="meta"><ha-icon icon="mdi:map-marker-outline"></ha-icon>${htmlEscape(game.venue)}</span>` : ""}
              ${this._config.show_broadcast && game.broadcast ? `<span class="meta"><ha-icon icon="mdi:television"></ha-icon>${htmlEscape(game.broadcast)}</span>` : ""}
            </div>` : ""}
        </div>
      </ha-card>`;
  }

  _renderTicker() {
    const groups = [];
    const maxPerSport = Math.max(1, Math.min(30, Number(this._config.ticker_max_games_per_sport) || 20));

    for (const key of this._selectedSports()) {
      const def = SPORT_DEFS[key];
      const stateObj = this._hass.states[def.entity];
      const events = asArray(stateObj?.attributes?.events);
      const games = events.slice(0, maxPerSport)
        .map((event) => this._normalizeEvent(event, def.kind))
        .filter(Boolean);
      if (games.length) groups.push({ key, ...def, games });
    }

    if (!groups.length) {
      this.shadowRoot.innerHTML = this._styles() + this._message("No games are available for the selected ticker sports. Make sure those leagues are enabled in Sports Ticker.");
      return;
    }

    const totalGames = groups.reduce((sum, group) => sum + group.games.length, 0);
    const secondsPerGame = Math.max(3, Math.min(20, Number(this._config.ticker_seconds_per_game) || 8));
    const duration = Math.max(12, totalGames * secondsPerGame);
    const elapsed = ((Date.now() - this._tickerEpoch) / 1000) % duration;
    const animationDelay = -elapsed;
    const allGames = groups.flatMap((group) => group.games.map((game) => this._tickerGame(game))).join("");
    const labelData = this._tickerLabelMarkup(groups, totalGames, duration, animationDelay);
    const pauseClass = this._config.ticker_pause_on_hover ? "pause-on-hover" : "";

    this.shadowRoot.innerHTML = `${this._styles()}
      <ha-card class="ticker-ha-card">
        <style>${labelData.css}</style>
        <div class="ticker-shell ${pauseClass}" style="--ticker-duration:${duration}s;--ticker-delay:${animationDelay}s">
          <div class="league-label">${labelData.html}</div>
          <div class="ticker-window">
            <div class="ticker-glow"></div>
            <div class="ticker-track">
              <div class="ticker-set">${allGames}</div>
              <div class="ticker-set" aria-hidden="true">${allGames}</div>
            </div>
          </div>
        </div>
      </ha-card>`;
  }

  _tickerLabelMarkup(groups, totalGames, duration, delay) {
    let offset = 0;
    const html = [];
    const css = [];

    groups.forEach((group, index) => {
      const start = (offset / totalGames) * 100;
      const end = ((offset + group.games.length) / totalGames) * 100;
      const fade = Math.min(0.35, Math.max(0.08, (100 / totalGames) * 0.08));
      const beforeStart = Math.max(0, start - fade);
      const afterStart = Math.min(100, start + fade);
      const beforeEnd = Math.max(0, end - fade);
      const afterEnd = Math.min(100, end + fade);

      html.push(`<div class="league-name league-${index}" style="--league-accent:${group.accent}"><span class="league-text">${htmlEscape(group.label)}</span></div>`);
      const frames = index === 0
        ? `0%,${beforeEnd}%{opacity:1;visibility:visible}${afterEnd}%,99.7%{opacity:0;visibility:hidden}100%{opacity:1;visibility:visible}`
        : `0%,${beforeStart}%{opacity:0;visibility:hidden}${afterStart}%,${beforeEnd}%{opacity:1;visibility:visible}${afterEnd}%,100%{opacity:0;visibility:hidden}`;
      css.push(`@keyframes ticker-league-${index}{${frames}} .league-${index}{animation:ticker-league-${index} ${duration}s linear infinite;animation-delay:${delay}s}`);
      offset += group.games.length;
    });

    return { html: html.join(""), css: css.join("\n") };
  }

  _tickerGame(game) {
    const awayLogo = this._tickerLogo(game.away);
    const homeLogo = this._tickerLogo(game.home);
    const score = game.live || game.completed
      ? `<span class="score">${htmlEscape(game.away.score)}</span><span class="score-separator">-</span><span class="score">${htmlEscape(game.home.score)}</span>`
      : `<span class="at">@</span>`;

    const status = game.live
      ? `<span class="live-status"><span class="ticker-live-dot"></span><span class="status-detail">${htmlEscape(game.detail || "LIVE")}</span></span>`
      : game.completed
        ? `<span class="final-status">${htmlEscape(game.status || "FINAL")}</span>`
        : `<span class="kickoff">${htmlEscape(game.detail)}</span>`;

    return `<div class="ticker-game">
      ${awayLogo}<span class="team-abbr">${htmlEscape(game.away.abbreviation || game.away.name)}</span>
      ${score}
      <span class="team-abbr">${htmlEscape(game.home.abbreviation || game.home.name)}</span>${homeLogo}
      ${status}
    </div>`;
  }

  _tickerLogo(team) {
    if (!this._config.show_logos) return "";
    const abbreviation = team.abbreviation || team.name || "TEAM";
    if (!team.logo) return `<div class="team-logo-shell"><div class="logo-fallback">${htmlEscape(abbreviation.slice(0, 4))}</div></div>`;
    return `<div class="team-logo-shell"><img class="team-logo" src="${htmlEscape(team.logo)}" alt="${htmlEscape(abbreviation)}" loading="lazy"><div class="logo-fallback logo-hidden">${htmlEscape(abbreviation.slice(0, 4))}</div></div>`;
  }

  _selectEvent(events, favoriteTeam, eventId) {
    if (eventId) {
      const configured = events.find((event) => String(event?.id) === String(eventId));
      if (configured) return configured;
    }
    if (favoriteTeam) {
      const favorite = String(favoriteTeam).toUpperCase();
      const match = events.find((event) => asArray(event?.competitions?.[0]?.competitors).some((competitor) => {
        const team = competitor?.team ?? {};
        return [team.abbreviation, team.shortDisplayName, team.displayName].filter(Boolean).some((value) => String(value).toUpperCase() === favorite);
      }));
      if (match) return match;
    }
    return events.find((event) => this._statusType(event)?.state === "in")
      || events.find((event) => this._statusType(event)?.state === "pre")
      || events[0];
  }

  _statusType(event) {
    return event?.status?.type ?? event?.competitions?.[0]?.status?.type ?? {};
  }

  _normalizeEvent(event, kind = "generic") {
    const competition = event?.competitions?.[0] ?? {};
    const competitors = asArray(competition.competitors);
    const home = competitors.find((team) => team?.homeAway === "home") ?? competitors[0];
    const away = competitors.find((team) => team?.homeAway === "away") ?? competitors[1];
    if (!home || !away) return null;

    const status = event?.status ?? competition?.status ?? {};
    const statusType = status?.type ?? this._statusType(event);
    const live = statusType?.state === "in";
    const completed = statusType?.state === "post" || Boolean(statusType?.completed);
    const statusText = statusType?.shortDetail || statusType?.detail || statusType?.description || (completed ? "Final" : live ? "Live" : "Scheduled");
    const date = competition.date || event?.date;
    const detail = live ? this._liveDetail(kind, status, statusType) : completed ? statusText.toUpperCase() : this._formatKickoff(date);
    const broadcasts = asArray(competition.broadcasts).flatMap((broadcast) => asArray(broadcast?.names)).filter(Boolean);
    const venue = competition?.venue?.fullName || competition?.venue?.address?.city || "";

    return {
      live,
      completed,
      status: statusText,
      detail,
      venue,
      broadcast: [...new Set(broadcasts)].join(", "),
      home: this._normalizeTeam(home),
      away: this._normalizeTeam(away),
    };
  }

  _normalizeTeam(competitor) {
    const team = competitor?.team ?? {};
    const records = asArray(competitor?.records);
    const overall = records.find((record) => record?.type === "total") || records.find((record) => record?.name === "overall") || records[0];
    const rank = competitor?.curatedRank?.current || competitor?.rank;
    const name = team.shortDisplayName || team.displayName || team.name || team.abbreviation || "Team";
    return {
      name: rank && Number(rank) > 0 && Number(rank) <= 25 ? `#${rank} ${name}` : name,
      abbreviation: team.abbreviation || "",
      logo: team.logo || asArray(team.logos)[0]?.href || asArray(team.logos)[0]?.url || "",
      score: competitor?.score ?? "0",
      record: overall?.summary || "",
      winner: Boolean(competitor?.winner),
    };
  }

  _liveDetail(kind, status, type) {
    const period = Number(status?.period || 0);
    const clock = status?.displayClock || "";
    const short = type?.shortDetail || type?.detail || type?.description || "";
    if (kind === "football") return [period ? (period <= 4 ? `Q${period}` : period === 5 ? "OT" : `${period - 4}OT`) : "", clock].filter(Boolean).join(" ") || short;
    if (kind === "basketball") return [period ? (period <= 4 ? `Q${period}` : "OT") : "", clock].filter(Boolean).join(" ") || short;
    if (kind === "hockey") return [period ? (["", "1ST", "2ND", "3RD"][period] || "OT") : "", clock].filter(Boolean).join(" ") || short;
    if (kind === "baseball") {
      const match = String(short).match(/^(Top|Bot|Bottom|Mid|End)\s+(\d+)/i);
      if (match) {
        const half = match[1].toLowerCase();
        if (half === "top") return `▲ TOP ${match[2]}`;
        if (half === "bot" || half === "bottom") return `▼ BOT ${match[2]}`;
        return `${match[1].toUpperCase()} ${match[2]}`;
      }
    }
    return short || clock || "LIVE";
  }

  _formatKickoff(value) {
    if (!value) return "SCHEDULED";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).toUpperCase();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    let day;
    if (date.toDateString() === now.toDateString()) day = "TODAY";
    else if (date.toDateString() === tomorrow.toDateString()) day = "TOM";
    else day = date.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
    const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    return `${day} ${time}`;
  }

  _team(team, showScoreState) {
    const logo = this._config.show_logos
      ? `<div class="logo-wrap">${team.logo
        ? `<img class="logo" src="${htmlEscape(team.logo)}" alt="${htmlEscape(team.name)} logo" loading="lazy">`
        : `<div class="logo fallback">${htmlEscape(team.abbreviation.slice(0, 3))}</div>`}</div>`
      : "";
    return `<div class="team ${showScoreState && team.winner ? "winner" : ""}">${logo}<div class="team-name" title="${htmlEscape(team.name)}">${htmlEscape(team.name)}</div></div>`;
  }

  _message(message) {
    return `<ha-card><div class="message">${htmlEscape(message)}</div></ha-card>`;
  }

  _styles() {
    return `<style>
      :host{display:block;--st-gap:16px;container-type:inline-size}ha-card{overflow:hidden}.card{color:var(--primary-text-color);background:var(--ha-card-background,var(--card-background-color));padding:16px 18px}.header,.footer,.records{display:flex;align-items:center;justify-content:space-between;gap:12px}.header{min-height:24px;margin-bottom:12px}.header-left,.status-wrap,.meta{display:inline-flex;align-items:center;gap:6px}.league{font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--secondary-text-color)}.badge{padding:2px 6px;border-radius:999px;font-size:9px;font-weight:700;background:var(--secondary-background-color);color:var(--secondary-text-color)}.status{font-size:12px;font-weight:650}.game-live-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--error-color);box-shadow:0 0 0 3px color-mix(in srgb,var(--error-color) 18%,transparent)}.matchup{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:var(--st-gap)}.team{min-width:0;text-align:center;opacity:.86}.team.winner{opacity:1}.logo-wrap{display:grid;place-items:center;height:72px;margin-bottom:7px}.logo{max-width:68px;max-height:68px;object-fit:contain}.logo.fallback{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--secondary-background-color);color:var(--secondary-text-color);font-weight:700}.team-name{font-size:14px;font-weight:650;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.center{min-width:92px;text-align:center}.scoreline{display:flex;justify-content:center;align-items:baseline;gap:8px;font-size:clamp(24px,6vw,38px);font-weight:750;font-variant-numeric:tabular-nums;line-height:1}.score-separator{color:var(--disabled-text-color);font-weight:400}.versus{font-size:20px;font-weight:700;color:var(--secondary-text-color)}.detail{margin-top:6px;max-width:145px;font-size:11px;line-height:1.3;color:var(--secondary-text-color)}.records{margin-top:8px;padding:0 max(8px,7%);font-size:11px;color:var(--secondary-text-color)}.footer{margin-top:14px;padding-top:11px;border-top:1px solid var(--divider-color);flex-wrap:wrap;justify-content:center;color:var(--secondary-text-color);font-size:11px}.meta ha-icon{--mdc-icon-size:15px}.message{padding:20px;color:var(--secondary-text-color)}.card.compact{padding:12px 14px}.card.compact .header{margin-bottom:7px;min-height:20px}.card.compact .logo-wrap{height:48px;margin-bottom:3px}.card.compact .logo{max-width:44px;max-height:44px}.card.compact .logo.fallback{width:42px;height:42px;font-size:11px}.card.compact .team-name{font-size:12px}.card.compact .center{min-width:72px}.card.compact .scoreline{font-size:clamp(22px,5vw,30px);gap:5px}.card.compact .detail{margin-top:3px;font-size:10px;max-width:110px}.card.compact .records{margin-top:5px;font-size:10px}.card.compact .footer{margin-top:8px;padding-top:7px}
      .ticker-ha-card{padding:0;background:transparent}.ticker-shell{position:relative;width:100%;height:62px;display:grid;grid-template-columns:112px minmax(0,1fr);overflow:hidden;box-sizing:border-box;color:rgba(255,255,255,.96);background:linear-gradient(135deg,rgba(16,24,38,.74),rgba(8,17,31,.60));backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);font-family:var(--paper-font-body1_-_font-family,inherit)}.ticker-shell:before{content:"";position:absolute;z-index:1;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.11),rgba(255,255,255,.025) 45%,rgba(255,255,255,.01))}.ticker-shell:after{content:"";position:absolute;z-index:50;inset:0;pointer-events:none;border:1px solid rgba(255,255,255,.09);box-sizing:border-box}.league-label{position:relative;z-index:20;width:112px;height:100%;overflow:hidden;border-right:1px solid rgba(255,255,255,.14);box-shadow:8px 0 20px rgba(0,0,0,.14)}.league-name{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0 12px;box-sizing:border-box;color:rgba(255,255,255,.99);background:linear-gradient(145deg,color-mix(in srgb,var(--league-accent) 58%,transparent),rgba(20,27,42,.64));backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%);white-space:nowrap;text-align:center;text-shadow:0 2px 4px rgba(0,0,0,.45);opacity:0;visibility:hidden}.league-name:before{content:"";position:absolute;left:0;bottom:0;width:100%;height:3px;background:var(--league-accent);box-shadow:0 0 12px color-mix(in srgb,var(--league-accent) 60%,transparent)}.league-name:first-child{opacity:1;visibility:visible}.league-text{position:relative;z-index:2;line-height:1;font-size:19px;font-weight:950;letter-spacing:1px}.ticker-window{position:relative;z-index:4;width:100%;height:100%;min-width:0;overflow:hidden}.ticker-glow{position:absolute;z-index:0;top:-60px;left:20%;width:55%;height:120px;pointer-events:none;border-radius:50%;background:rgba(255,255,255,.045);filter:blur(28px)}.ticker-track{position:absolute;z-index:3;top:0;left:0;height:100%;display:flex;align-items:stretch;width:max-content;animation:glass-sports-scroll var(--ticker-duration,90s) linear infinite;animation-delay:var(--ticker-delay,0s);will-change:transform}.ticker-set{height:100%;display:flex;align-items:stretch;flex-shrink:0}@keyframes glass-sports-scroll{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}.pause-on-hover:hover .ticker-track,.pause-on-hover:hover .league-name{animation-play-state:paused}.ticker-game{position:relative;width:255px;min-width:255px;max-width:255px;height:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;box-sizing:border-box;white-space:nowrap;overflow:hidden;border-right:1px solid rgba(255,255,255,.10);background:linear-gradient(90deg,rgba(255,255,255,.012),rgba(255,255,255,.03),rgba(255,255,255,.012))}.team-logo-shell{width:36px;height:36px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;padding:4px;box-sizing:border-box;border-radius:11px;background:linear-gradient(145deg,rgba(255,255,255,.97),rgba(235,242,250,.84));border:1px solid rgba(255,255,255,.88);box-shadow:0 3px 9px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,1)}.team-logo{width:27px;height:27px;object-fit:contain;flex:0 0 auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,.13))}.logo-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#182132;font-size:8px;font-weight:950}.logo-hidden{display:none}.team-abbr{font-size:10px;font-weight:900;letter-spacing:.2px;color:rgba(255,255,255,.88)}.score{color:rgba(255,255,255,.99);font-size:17px;font-weight:900;font-variant-numeric:tabular-nums;text-shadow:0 1px 3px rgba(0,0,0,.30);flex:0 0 auto}.ticker-game .score-separator{color:rgba(255,255,255,.25);font-size:10px;flex:0 0 auto}.at{color:rgba(255,255,255,.50);font-size:10px;font-weight:900;flex:0 0 auto}.kickoff{margin-left:3px;padding:4px 7px;border-radius:999px;color:rgba(235,244,255,.90);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.09);font-size:9px;font-weight:850;letter-spacing:.1px;flex:0 0 auto}.live-status{display:flex;align-items:center;gap:3px;margin-left:2px;padding:4px 6px;border-radius:999px;color:#ffb1b8;background:rgba(255,49,69,.11);border:1px solid rgba(255,80,95,.18);font-size:8px;font-weight:900;letter-spacing:.1px;white-space:nowrap;flex:0 0 auto}.status-detail{color:rgba(255,225,228,.84);white-space:nowrap}.ticker-live-dot{width:6px;height:6px;flex:0 0 auto;border-radius:50%;background:#ff4052;box-shadow:0 0 7px rgba(255,55,75,.70)}.final-status{margin-left:2px;padding:4px 6px;border-radius:999px;color:rgba(236,241,248,.82);background:rgba(255,255,255,.06);font-size:8px;font-weight:900}
      @media(prefers-reduced-motion:reduce){.ticker-track,.league-name{animation:none!important}.ticker-window{overflow-x:auto}.ticker-set[aria-hidden="true"]{display:none}.league-name{display:none}.league-name:first-child{display:flex;opacity:1;visibility:visible}}
      @container(max-width:600px){.ticker-shell{height:54px;grid-template-columns:86px minmax(0,1fr)}.league-label{width:86px}.league-text{font-size:15px}.ticker-game{width:220px;min-width:220px;max-width:220px;padding:0 8px;gap:4px}.team-logo-shell{width:31px;height:31px;border-radius:9px}.team-logo{width:23px;height:23px}.score{font-size:15px}.team-abbr{font-size:9px}.kickoff,.live-status,.final-status{font-size:7px;padding:3px 5px}}
      @media(max-width:420px){:host{--st-gap:8px}.card{padding:14px 12px}.logo-wrap{height:58px}.logo{max-width:54px;max-height:54px}.team-name{font-size:12px}.center{min-width:78px}.detail{max-width:105px;font-size:10px}.footer{gap:8px}.card.compact{padding:10px}.card.compact .logo-wrap{height:42px}.card.compact .logo{max-width:38px;max-height:38px}.card.compact .center{min-width:62px}}
    </style>`;
  }
}

if (!customElements.get("sports-ticker-card")) customElements.define("sports-ticker-card", SportsTickerCard);

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "sports-ticker-card")) {
  window.customCards.push({
    type: "sports-ticker-card",
    name: "Sports Ticker",
    description: "Sports Ticker dashboard cards with selectable pre-made layouts and per-card options.",
    preview: true,
    documentationURL: "https://github.com/LiquidFXX/sports-ticker",
    getEntitySuggestion: (hass, entityId) => {
      if (!isSportsTickerScoreboardEntity(hass, entityId)) return null;
      return { config: { type: "custom:sports-ticker-card", entity: entityId, preset: "game" } };
    },
  });
}

console.info(`%c SPORTS-TICKER-CARD %c v${CARD_VERSION} `, "background:#444;color:#fff;font-weight:700", "background:#eee;color:#444");
