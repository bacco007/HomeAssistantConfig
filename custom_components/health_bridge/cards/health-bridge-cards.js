/**
 * Health Bridge — built-in dashboard cards.
 *
 * A dependency-free suite of purpose-built cards (no button-card / card-mod
 * needed). Each card is a plain custom element the integration serves and
 * auto-registers, configurable by `style` (neumorphic | minimal | transparent)
 * and `theme` (dark | light | auto), and works for any Health Bridge user via
 * the `user` option (auto-detected when omitted).
 *
 * This first release ships the Sleep card, ported pixel-for-pixel from the
 * dark-neumorphic design, and establishes the shared base + token engine the
 * remaining cards (sleep-details, workout, day, heart) slot into.
 */
(function () {
  "use strict";

  const VERSION = "0.4.8";

  /* ------------------------------------------------------------------ *
   * Value helpers (ported from the original button-card field logic).  *
   * ------------------------------------------------------------------ */

  const numState = (hass, id) => {
    const v = Number(hass?.states?.[id]?.state);
    return Number.isFinite(v) ? v : null;
  };

  const rawState = (hass, id) => hass?.states?.[id]?.state;

  const fmtHours = (value) => {
    const totalMinutes = Math.round(value * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h && m) return `${h}h ${m}m`;
    if (h) return `${h}h`;
    return `${m}m`;
  };

  const fmtAwakeMinutes = (value) => {
    const totalSeconds = Math.round(value * 60);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m && s) return `${m}m ${s}s`;
    if (m) return `${m}m`;
    return `${s}s`;
  };

  const fmtClock = (raw) => {
    if (!raw || ["unknown", "unavailable"].includes(raw)) return "--:--";
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return String(raw).substring(0, 5);
  };

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* ------------------------------------------------------------------ *
   * Style x theme token engine.                                        *
   *                                                                    *
   * Neumorphic carries its own designed light/dark palettes. Minimal & *
   * transparent lean on Home Assistant's own theme variables so they   *
   * follow whatever theme the dashboard uses; an explicit light/dark   *
   * still forces text colours where it matters.                        *
   * ------------------------------------------------------------------ */

  function resolveTheme(theme, hass) {
    if (theme === "light" || theme === "dark") return theme;
    // auto → follow HA
    return hass?.themes?.darkMode ? "dark" : "light";
  }

  function tokens(style, theme, hass) {
    const t = resolveTheme(theme, hass);

    if (style === "minimal") {
      return {
        "--hb-radius": "16px",
        "--hb-pad": "16px",
        "--hb-bg": "var(--ha-card-background, var(--card-background-color, #fff))",
        "--hb-shadow": "var(--ha-card-box-shadow, 0 1px 2px rgba(0,0,0,.10))",
        "--hb-border": "1px solid var(--divider-color, rgba(127,127,127,.2))",
        "--hb-sub-bg": "rgba(127,127,127,.08)",
        "--hb-inset-window": "none",
        "--hb-inset-panel": "none",
        "--hb-sub-border": "1px solid var(--divider-color, rgba(127,127,127,.18))",
        "--hb-text": "var(--primary-text-color, #111)",
        "--hb-dim": "var(--secondary-text-color, #666)",
        "--hb-faint": "var(--disabled-text-color, #999)",
        "--hb-teal": "#00a9b7",
        "--hb-icon-color": "var(--primary-color, #ff8c00)",
        "--hb-icon-glow": "none",
      };
    }

    if (style === "transparent") {
      return {
        "--hb-radius": "22px",
        "--hb-pad": "16px",
        "--hb-bg": "transparent",
        "--hb-shadow": "none",
        "--hb-border": "none",
        "--hb-sub-bg": "rgba(127,127,127,.12)",
        "--hb-inset-window": "none",
        "--hb-inset-panel": "none",
        "--hb-sub-border": "1px solid rgba(127,127,127,.14)",
        "--hb-text": "var(--primary-text-color, #fff)",
        "--hb-dim": "var(--secondary-text-color, #9a9aa0)",
        "--hb-faint": "var(--disabled-text-color, #6a6a70)",
        "--hb-teal": "#00a9b7",
        "--hb-icon-color": "var(--primary-color, #ff8c00)",
        "--hb-icon-glow": "none",
      };
    }

    // neumorphic (default) — designed palettes
    if (t === "light") {
      return {
        "--hb-radius": "28px",
        "--hb-pad": "16px",
        "--hb-bg": "#e6e7ee",
        "--hb-shadow":
          "9px 9px 20px rgba(163,177,198,.55), -8px -8px 18px rgba(255,255,255,.90)",
        "--hb-border": "none",
        "--hb-sub-bg": "#e6e7ee",
        "--hb-inset-window":
          "inset 4px 4px 9px rgba(163,177,198,.60), inset -3px -3px 7px rgba(255,255,255,.90)",
        "--hb-inset-panel":
          "inset 3px 3px 7px rgba(163,177,198,.60), inset -2px -2px 5px rgba(255,255,255,.90)",
        "--hb-sub-border": "none",
        "--hb-text": "#2a2a2e",
        "--hb-dim": "#6b6b70",
        "--hb-faint": "#9a9aa0",
        "--hb-teal": "#008a96",
        "--hb-icon-color": "#e07b00",
        "--hb-icon-glow": "drop-shadow(0 0 8px rgba(224,123,0,.28))",
      };
    }

    // neumorphic dark — the reference design
    return {
      "--hb-radius": "28px",
      "--hb-pad": "16px",
      "--hb-bg": "#1c1c1c",
      "--hb-shadow":
        "10px 10px 24px rgba(0,0,0,.72), -6px -6px 18px rgba(255,255,255,.06)",
      "--hb-border": "none",
      "--hb-sub-bg": "#141415",
      "--hb-inset-window":
        "inset 4px 4px 9px rgba(0,0,0,.75), inset -3px -3px 7px rgba(255,255,255,.035)",
      "--hb-inset-panel":
        "inset 3px 3px 7px rgba(0,0,0,.80), inset -2px -2px 5px rgba(255,255,255,.035)",
      "--hb-sub-border": "none",
      "--hb-text": "#ffffff",
      "--hb-dim": "#888888",
      "--hb-faint": "#666666",
      "--hb-teal": "#00a9b7",
      "--hb-icon-color": "#ff8c00",
      "--hb-icon-glow": "drop-shadow(0 0 8px rgba(255,140,0,.32))",
    };
  }

  const VALID_STYLES = new Set(["neumorphic", "minimal", "transparent"]);
  const VALID_THEMES = new Set(["dark", "light", "auto"]);

  /* ------------------------------------------------------------------ *
   * Shared stylesheet — atoms reused across the whole card family.     *
   * ------------------------------------------------------------------ */

  const BASE_CSS = `
    :host { display: block; }
    * { box-sizing: border-box; }

    .hb-card {
      display: grid;
      padding: var(--hb-pad);
      border-radius: var(--hb-radius);
      border: var(--hb-border, none);
      overflow: hidden;
      background: var(--hb-bg);
      box-shadow: var(--hb-shadow);
      column-gap: 12px;
      row-gap: 8px;
      cursor: pointer;
    }

    /* Sleep / workout / day share this 5-row layout with a 54px icon rail. */
    .hb-card.hb-hero {
      grid-template-columns: 1fr 54px;
      grid-template-rows: min-content min-content auto auto auto;
      grid-template-areas:
        "eyebrow icon"
        "headline icon"
        "message message"
        "band band"
        "detail detail";
    }

    .eyebrow {
      grid-area: eyebrow;
      justify-self: start;
      align-self: center;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.8px;
      color: var(--hb-dim);
    }

    .icon {
      grid-area: icon;
      width: 48px;
      align-self: center;
      justify-self: end;
      color: var(--hb-icon-color);
      filter: var(--hb-icon-glow, none);
    }

    .headline {
      grid-area: headline;
      justify-self: start;
      display: flex;
      align-items: baseline;
      gap: 9px;
      color: var(--hb-text);
    }
    .headline b {
      font-size: clamp(28px, 7.5vw, 38px);
      font-weight: 300;
      letter-spacing: -2px;
      line-height: .9;
      white-space: nowrap;
    }
    .headline span {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 1.3px;
      color: var(--hb-teal);
    }

    .message {
      grid-area: message;
      justify-self: start;
      text-align: left;
      white-space: normal;
      font-size: 11px;
      line-height: 1.45;
      color: var(--hb-dim);
    }

    /* "band": the ASLEEP —— AWAKE inset strip. */
    .band {
      grid-area: band;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 18px;
      background: var(--hb-sub-bg);
      border: var(--hb-sub-border, none);
      box-shadow: var(--hb-inset-window);
    }
    .time-block {
      display: grid;
      grid-template-rows: auto auto;
      column-gap: 8px;
    }
    .time-block small { font-size: 7px; letter-spacing: 1.1px; color: var(--hb-faint); }
    .time-block b { font-size: 14px; color: var(--hb-text); }
    .time-block > ha-icon { grid-row: 1 / 3; width: 22px; height: 22px; --mdc-icon-size: 22px; }
    .time-line { display: flex; align-items: center; flex: 1; margin: 0 12px; }
    .time-line i { height: 1px; flex: 1; }
    .time-line ha-icon { width: 15px; height: 15px; --mdc-icon-size: 15px; margin: 0 6px; }

    /* "detail": stage bar + legend (sleep) or stat tiles (workout/day). */
    .detail { grid-area: detail; width: 100%; padding-top: 2px; }

    .stage-heading {
      display: flex;
      align-items: end;
      justify-content: space-between;
      margin-bottom: 6px;
    }
    .stage-heading b { font-size: 10px; letter-spacing: 1.4px; color: var(--hb-text); }
    .stage-heading small { font-size: 7px; letter-spacing: 1.1px; color: var(--hb-faint); }

    .stage-bar {
      display: flex;
      height: 9px;
      gap: 3px;
      padding: 3px;
      overflow: hidden;
      border-radius: 14px;
      background: var(--hb-sub-bg);
      border: var(--hb-sub-border, none);
      box-shadow: var(--hb-inset-panel);
    }
    .stage-bar i { display: block; height: 100%; border-radius: 8px; }

    .stage-legend {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 5px;
      margin-top: 7px;
    }
    .stage-legend div { display: grid; grid-template-columns: 10px 1fr; text-align: left; }
    .stage-legend span { grid-row: 1 / 3; font-size: 9px; }
    .stage-legend small { font-size: 6px; letter-spacing: .7px; color: var(--hb-faint); }
    .stage-legend b { font-size: 10px; color: var(--hb-text); white-space: nowrap; }

    /* Inline unit inside a band value, e.g. "72 bpm". */
    .time-block b i {
      font-size: 8px;
      font-style: normal;
      font-weight: 700;
      color: var(--hb-faint);
      margin-left: 2px;
    }

    /* Stat tiles (workout / day / heart). */
    .stat-grid { display: grid; gap: 8px; }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 10px 4px;
      border-radius: 14px;
      background: var(--hb-sub-bg);
      border: var(--hb-sub-border, none);
      box-shadow: var(--hb-inset-panel);
    }
    .stat ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .stat b { font-size: 15px; font-weight: 700; color: var(--hb-text); white-space: nowrap; }
    .stat b i {
      font-size: 8px;
      font-weight: 700;
      font-style: normal;
      letter-spacing: .5px;
      color: var(--hb-faint);
      margin-left: 2px;
    }
    .stat small { font-size: 6px; letter-spacing: 1px; color: var(--hb-faint); }

    /* Per-stage rows (sleep details). */
    .sd-list { display: grid; gap: 8px; }
    .sd-row { display: grid; grid-template-columns: 58px 1fr auto; align-items: center; gap: 10px; }
    .sd-label { font-size: 8px; font-weight: 800; letter-spacing: 1px; }
    .sd-track {
      height: 8px;
      border-radius: 10px;
      overflow: hidden;
      background: var(--hb-sub-bg);
      border: var(--hb-sub-border, none);
      box-shadow: var(--hb-inset-panel);
    }
    .sd-fill { display: block; height: 100%; border-radius: 10px; }
    .sd-val { font-size: 11px; color: var(--hb-text); white-space: nowrap; }
    .sd-val i { font-size: 8px; font-style: normal; color: var(--hb-faint); margin-left: 3px; }

    /* Graph cards (heart-rate trace, sleep hypnogram). */
    .hb-card.hb-graph {
      grid-template-columns: 1fr 54px;
      grid-template-rows: min-content min-content auto min-content;
      grid-template-areas:
        "eyebrow icon"
        "headline icon"
        "graph graph"
        "foot foot";
    }
    /* Pill-shaped, full-bleed graph-only card (heart-rate trace). */
    .hb-card.hb-trace {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      grid-template-areas: "graph";
      padding: 0;
      border-radius: 999px; /* clamps to half-height → pill ends */
    }
    .hb-card.hb-trace .graph svg { display: block; }
    /* Hypnogram card: eyebrow + graph + footer (no big headline). */
    .hb-card.hb-hypno {
      grid-template-columns: 1fr 54px;
      grid-template-rows: min-content auto min-content;
      grid-template-areas:
        "eyebrow icon"
        "graph graph"
        "foot foot";
    }
    .graph { grid-area: graph; width: 100%; }
    .graph svg { width: 100%; height: auto; display: block; }
    .graph .hb-axis { fill: var(--hb-faint); font-size: 10px; }
    .graph .hb-axis-strong { fill: var(--hb-dim); font-size: 11px; font-weight: 600; }
    .graph .hb-grid { stroke: var(--hb-faint); opacity: .20; stroke-width: 1; }
    .foot {
      grid-area: foot;
      width: 100%;
      font-size: 10px;
      color: var(--hb-faint);
      letter-spacing: .3px;
      padding-top: 4px;
    }

    /* A soft red glow halo rides with the sweep dot, brightening the line near
       it (mix-blend screen = additive) and fading with distance. The line
       itself stays steady; only the halo + dot move. */
    .hr-halo { mix-blend-mode: screen; }
    .hr-line { opacity: 0.92; }

    .placeholder {
      grid-column: 1 / -1;
      font-size: 12px;
      color: var(--hb-faint);
      text-align: center;
      padding: 20px 8px;
    }
  `;

  /* ------------------------------------------------------------------ *
   * User resolution — turn a `user` option (or nothing) into the       *
   * `_<user>` suffix that Health Bridge entity IDs carry.              *
   * ------------------------------------------------------------------ */

  // Anchor metrics whose names have a stable prefix, so the remainder of the
  // entity_id is exactly the user suffix. `last_sync_time` exists for every
  // user after their first sync, so it's the most reliable anchor.
  const USER_ANCHORS = [
    "last_sync_time",
    "sleep_duration",
    "steps",
    "heart_rate",
    "active_calories",
  ];

  function resolveUser(hass, config) {
    if (config && config.user) return config.user;

    // Prefer the entity registry (exposes platform) when available.
    const entities = hass && hass.entities;
    if (entities) {
      for (const ent of Object.values(entities)) {
        if (ent.platform !== "health_bridge" || typeof ent.entity_id !== "string")
          continue;
        for (const a of USER_ANCHORS) {
          const pfx = `sensor.${a}_`;
          if (ent.entity_id.startsWith(pfx)) return ent.entity_id.slice(pfx.length);
        }
      }
    }

    // Fallback: sniff the live states for a well-known metric.
    if (hass && hass.states) {
      for (const a of USER_ANCHORS) {
        const pfx = `sensor.${a}_`;
        const key = Object.keys(hass.states).find((id) => id.startsWith(pfx));
        if (key) return key.slice(pfx.length);
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------ *
   * Base card — DOM lifecycle, theming, change-detection, more-info.   *
   * Subclasses implement: metricSuffixes(), primaryEntity(user),       *
   * renderInner(hass, user) and static get kind()/label()/icon().      *
   * ------------------------------------------------------------------ */

  class HBBaseCard extends HTMLElement {
    setConfig(config) {
      if (config && config.style && !VALID_STYLES.has(config.style)) {
        throw new Error(`Invalid style '${config.style}'`);
      }
      if (config && config.theme && !VALID_THEMES.has(config.theme)) {
        throw new Error(`Invalid theme '${config.theme}'`);
      }
      this._config = Object.assign(
        { style: "neumorphic", theme: "dark" },
        config || {}
      );
      this._sig = null; // force a re-render on next hass
      if (this._card) this._applyTokens();
    }

    set hass(hass) {
      this._hass = hass;
      this._update();
    }
    get hass() {
      return this._hass;
    }

    getCardSize() {
      return 4;
    }

    _ensureDom() {
      if (this._root) return;
      this._root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = BASE_CSS;
      const card = document.createElement("div");
      card.className = `hb-card ${this.constructor.layoutClass || "hb-hero"}`;
      card.addEventListener("click", () => this._fireMoreInfo());
      this._root.append(style, card);
      this._card = card;
      this._applyTokens();
    }

    _applyTokens() {
      const cfg = this._config || {};
      const vars = tokens(cfg.style || "neumorphic", cfg.theme || "dark", this._hass);
      for (const [k, v] of Object.entries(vars)) this.style.setProperty(k, v);
    }

    _relevantSignature(hass, user) {
      const ids = this.metricSuffixes().map((m) => `sensor.${m}_${user}`);
      return ids
        .map((id) => {
          const s = hass.states[id];
          return s ? `${id}=${s.state}` : `${id}=∅`;
        })
        .join("|");
    }

    _update() {
      if (!this._config || !this._hass) return;
      this._ensureDom();

      const user = resolveUser(this._hass, this._config);
      if (!user) {
        this._card.innerHTML =
          '<div class="placeholder">No Health Bridge data found yet. Once a sync arrives, this card fills in automatically.</div>';
        this._sig = "∅";
        return;
      }

      // Re-theme in case `theme: auto` flipped with HA's dark mode.
      this._applyTokens();
      this._user = user;

      // History-driven cards (graphs) fetch asynchronously and paint themselves.
      if (this.constructor.usesHistory) {
        if (!this._card.firstChild)
          this._card.innerHTML = '<div class="placeholder">Loading…</div>';
        this._maybeRefreshHistory(user);
        return;
      }

      const sig =
        `${this._config.style}|${this._config.theme}|${user}|` +
        this._relevantSignature(this._hass, user);
      if (sig === this._sig) return;
      this._sig = sig;
      this._card.innerHTML = this.renderInner(this._hass, user);
    }

    // History cards: refetch at most once a minute, but repaint from cache
    // whenever the live value (or style) changes so the headline stays current.
    _maybeRefreshHistory(user) {
      const now = Date.now();
      const userChanged = this._histUser !== user;
      this._histUser = user;
      const liveSig =
        `${this._config.style}|${this._config.theme}|` +
        (this._hass.states[this.primaryEntity(user)] || {}).state;
      const stale = userChanged || !this._lastFetch || now - this._lastFetch > 60000;
      if (stale) {
        if (this._histInFlight) return;
        this._histInFlight = true;
        this._liveSig = liveSig;
        Promise.resolve(this._loadHistory(user))
          .catch(() => {})
          .finally(() => {
            this._histInFlight = false;
            this._lastFetch = Date.now();
          });
      } else if (this._hist && liveSig !== this._liveSig) {
        this._liveSig = liveSig;
        this._renderCached(user);
      }
    }

    async _fetchHistory(entityId, startMs, endMs) {
      try {
        const res = await this._hass.callWS({
          type: "history/history_during_period",
          start_time: new Date(startMs).toISOString(),
          end_time: new Date(endMs).toISOString(),
          entity_ids: [entityId],
          minimal_response: true,
          no_attributes: true,
        });
        const arr = (res && res[entityId]) || [];
        return arr.map((x) => ({
          t: x.lu != null ? x.lu : x.last_updated,
          v: x.s != null ? x.s : x.state,
        }));
      } catch (e) {
        return null;
      }
    }

    _fireMoreInfo() {
      const entity = this.primaryEntity(this._user);
      if (!entity) return;
      const ev = new Event("hass-more-info", { bubbles: true, composed: true });
      ev.detail = { entityId: entity };
      this.dispatchEvent(ev);
    }

    // GUI editor + stub, shared by every card in the suite.
    static getConfigElement() {
      return document.createElement("health-bridge-card-editor");
    }
    static getStubConfig() {
      return { style: "neumorphic", theme: "dark" };
    }
  }

  /* ------------------------------------------------------------------ *
   * Sleep card.                                                        *
   * ------------------------------------------------------------------ */

  class HBSleepCard extends HBBaseCard {
    static get kind() { return "sleep"; }
    metricSuffixes() {
      return [
        "sleep_duration",
        "sleep_rem_hours",
        "sleep_core_hours",
        "sleep_deep_hours",
        "sleep_awake_hours",
        "asleep_time",
        "wake_time",
      ];
    }
    primaryEntity(user) {
      return `sensor.sleep_duration_${user}`;
    }

    renderInner(hass, user) {
      const S = (m) => `sensor.${m}_${user}`;
      const hours = numState(hass, S("sleep_duration"));
      const deep = numState(hass, S("sleep_deep_hours"));
      const rem = numState(hass, S("sleep_rem_hours"));

      // Headline
      let headline;
      if (hours == null) {
        headline = `<b>—</b><span>AWAITING SLEEP DATA</span>`;
      } else {
        headline = `<b>${esc(fmtHours(hours))}</b><span>ASLEEP</span>`;
      }

      // Message
      let message;
      if (hours == null) {
        message = "Your nightly recovery summary will appear after the next sync.";
      } else {
        const restorative = (deep || 0) + (rem || 0);
        const formatted = fmtHours(restorative);
        if (hours >= 7.5)
          message = `${formatted} restorative sleep — a strong foundation for today.`;
        else if (hours >= 6)
          message = `${formatted} restorative sleep — build momentum gradually.`;
        else message = `${formatted} restorative sleep — protect your energy today.`;
      }

      // Band: ASLEEP —— AWAKE
      const band = `
        <div class="time-block" style="grid-template-columns:24px auto;text-align:left;">
          <ha-icon icon="mdi:bed-clock" style="color:var(--hb-dim);"></ha-icon>
          <small>ASLEEP</small>
          <b>${esc(fmtClock(rawState(hass, S("asleep_time"))))}</b>
        </div>
        <div class="time-line">
          <i style="background:linear-gradient(90deg,#323232,#487495);"></i>
          <ha-icon icon="mdi:star-four-points" style="color:#487495;"></ha-icon>
          <i style="background:linear-gradient(90deg,#487495,#323232);"></i>
        </div>
        <div class="time-block" style="grid-template-columns:auto 24px;text-align:right;">
          <ha-icon icon="mdi:weather-sunset-up" style="grid-column:2;color:#ff8c00;"></ha-icon>
          <small>AWAKE</small>
          <b>${esc(fmtClock(rawState(hass, S("wake_time"))))}</b>
        </div>`;

      // Detail: stage bar + legend. AWAKE is decimal minutes; others decimal hours.
      const rows = [
        ["DEEP", numState(hass, S("sleep_deep_hours")), "#487495", false],
        ["REM", numState(hass, S("sleep_rem_hours")), "#9b6fc2", false],
        ["CORE", numState(hass, S("sleep_core_hours")), "#00a9b7", false],
        ["AWAKE", numState(hass, S("sleep_awake_hours")), "#ff8c00", true],
      ];
      const rawValues = rows.map((r) => (Number.isFinite(r[1]) ? Math.max(0, r[1]) : 0));
      const asHours = rows.map((r, i) => (r[3] ? rawValues[i] / 60 : rawValues[i]));
      const total = asHours.reduce((a, b) => a + b, 0) || 1;

      const bar = rows
        .map(
          (r, i) =>
            `<i style="width:${Math.max(2, (asHours[i] / total) * 100)}%;background:${r[2]};box-shadow:0 0 8px ${r[2]}66;"></i>`
        )
        .join("");

      const legend = rows
        .map((r, i) => {
          const label = r[3] ? fmtAwakeMinutes(rawValues[i]) : fmtHours(asHours[i]);
          return `<div>
              <span style="color:${r[2]}">●</span>
              <small>${r[0]}</small>
              <b>${esc(label)}</b>
            </div>`;
        })
        .join("");

      const detail = `
        <div class="stage-heading">
          <b>LAST NIGHT’S MIX</b>
          <small>SLEEP STAGES</small>
        </div>
        <div class="stage-bar">${bar}</div>
        <div class="stage-legend">${legend}</div>`;

      return `
        <div class="eyebrow">MORNING RECOVERY</div>
        <ha-icon class="icon" icon="mdi:weather-sunset-up"></ha-icon>
        <div class="headline">${headline}</div>
        <div class="message">${esc(message)}</div>
        <div class="band">${band}</div>
        <div class="detail">${detail}</div>`;
    }
  }
  HBSleepCard.layoutClass = "hb-hero";

  /* ------------------------------------------------------------------ *
   * Shared render helpers for the hero-layout cards.                   *
   * ------------------------------------------------------------------ */

  const fmtDurationMin = (m) => {
    if (!Number.isFinite(m)) return "—";
    const h = Math.floor(m / 60);
    const r = Math.round(m % 60);
    if (h && r) return `${h}h ${r}m`;
    if (h) return `${h}h`;
    return `${r}m`;
  };

  const iconForWorkout = (t) => {
    t = t || "";
    if (t.includes("run")) return "mdi:run-fast";
    if (t.includes("walk") || t.includes("hike")) return "mdi:walk";
    if (t.includes("cycl") || t.includes("bike")) return "mdi:bike";
    if (t.includes("swim")) return "mdi:swim";
    if (t.includes("strength") || t.includes("functional") || t.includes("core"))
      return "mdi:dumbbell";
    if (t.includes("yoga") || t.includes("pilates") || t.includes("flex")) return "mdi:yoga";
    if (t.includes("hiit") || t.includes("interval") || t.includes("cardio")) return "mdi:timer";
    if (t.includes("row")) return "mdi:rowing";
    return "mdi:heart-pulse";
  };

  // Assemble the standard 5-area hero card. `headline`, `band`, `detail` are
  // trusted HTML built by the caller; `eyebrow`/`message` are plain text.
  const hero = (o) => `
    <div class="eyebrow">${esc(o.eyebrow)}</div>
    <ha-icon class="icon" icon="${o.icon}"></ha-icon>
    <div class="headline">${o.headline}</div>
    <div class="message">${esc(o.message)}</div>
    <div class="band">${o.band}</div>
    <div class="detail">${o.detail}</div>`;

  // The ASLEEP —— AWAKE style strip. `lVal`/`rVal` are trusted HTML.
  const bandStrip = (o) => `
    <div class="time-block" style="grid-template-columns:24px auto;text-align:left;">
      <ha-icon icon="${o.lIcon}" style="color:var(--hb-dim);"></ha-icon>
      <small>${esc(o.lLabel)}</small>
      <b>${o.lVal}</b>
    </div>
    <div class="time-line">
      <i style="background:linear-gradient(90deg,#323232,${o.color});"></i>
      <ha-icon icon="${o.mIcon || "mdi:star-four-points"}" style="color:${o.color};"></ha-icon>
      <i style="background:linear-gradient(90deg,${o.color},#323232);"></i>
    </div>
    <div class="time-block" style="grid-template-columns:auto 24px;text-align:right;">
      <ha-icon icon="${o.rIcon}" style="grid-column:2;color:${o.rColor || o.color};"></ha-icon>
      <small>${esc(o.rLabel)}</small>
      <b>${o.rVal}</b>
    </div>`;

  // tiles: [{label, color, icon, value, unit}] → an inset stat grid.
  const statTiles = (tiles) => {
    const cells = tiles
      .map(
        (t) => `
        <div class="stat">
          <ha-icon icon="${t.icon}" style="color:${t.color}"></ha-icon>
          <b>${esc(t.value)}${t.unit ? `<i>${esc(t.unit)}</i>` : ""}</b>
          <small>${esc(t.label)}</small>
        </div>`
      )
      .join("");
    return `<div class="stat-grid" style="grid-template-columns:repeat(${tiles.length},1fr)">${cells}</div>`;
  };

  const bpm = (v) => `${v == null ? "--" : Math.round(v)}<i>bpm</i>`;

  const fmtAxisHour = (s) => {
    try {
      return new Date(s * 1000).toLocaleTimeString([], { hour: "numeric" });
    } catch (e) {
      return "";
    }
  };

  // Apple-style sleep hypnogram: stage bands over time (Awake→Deep, top→bottom).
  // segs: [{t0, t1, v}] in epoch seconds; v: 3 awake, 2 rem, 1 core, 0 deep, -1 unspecified.
  // Colours mirror Apple Health: coral awake, cyan REM, blue Core, indigo Deep.
  function svgHypnogram(segs, startS, endS) {
    const W = 680, H = 300, padL = 8, padR = 14, padT = 6, padB = 26;
    const plotW = W - padL - padR, plotH = H - padT - padB, rowH = plotH / 4;
    const span = endS - startS || 1;
    const xS = (t) => padL + Math.max(0, Math.min(1, (t - startS) / span)) * plotW;
    const SC = { 3: "#E9724C", 2: "#53C7EC", 1: "#1E7BE5", 0: "#3A38A6" };
    const labels = ["Awake", "REM", "Core", "Deep"];
    const rowTop = (r) => padT + r * rowH;
    const yCenter = (r) => rowTop(r) + rowH * 0.62; // capsules sit below the label
    const capH = Math.min(22, rowH * 0.42);
    const sleepv = (v) => v === 0 || v === 1 || v === 2;
    const uid = "hbsl" + Math.floor(Math.random() * 1e9);

    let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Sleep stages">`;
    out += `<defs>`;
    out += `<linearGradient id="${uid}-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SC[3]}" stop-opacity="1"/><stop offset="1" stop-color="${SC[3]}" stop-opacity="0.12"/></linearGradient>`;
    out += `<linearGradient id="${uid}-u" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SC[2]}" stop-opacity="0.70"/><stop offset="0.5" stop-color="${SC[1]}" stop-opacity="0.55"/><stop offset="1" stop-color="${SC[0]}" stop-opacity="0.62"/></linearGradient>`;
    out += `</defs>`;

    // Row separators + labels inside each band (Apple layout).
    for (let r = 0; r < 4; r++) {
      const yt = rowTop(r);
      if (r > 0) out += `<line class="hb-grid" x1="${padL}" y1="${yt.toFixed(1)}" x2="${W - padR}" y2="${yt.toFixed(1)}"/>`;
      out += `<text class="hb-axis-strong" x="${padL + 2}" y="${(yt + 15).toFixed(1)}">${labels[r]}</text>`;
    }
    out += `<line class="hb-grid" x1="${padL}" y1="${(padT + plotH).toFixed(1)}" x2="${W - padR}" y2="${(padT + plotH).toFixed(1)}"/>`;

    // Time axis.
    const stepH = Math.max(1, Math.round(span / 3600 / 5)) * 3600;
    for (let t = Math.ceil(startS / 3600) * 3600; t <= endS; t += stepH) {
      const x = xS(t).toFixed(1);
      out += `<line class="hb-grid" x1="${x}" y1="${padT}" x2="${x}" y2="${(padT + plotH).toFixed(1)}" stroke-dasharray="3 4"/>`;
      out += `<text class="hb-axis" x="${x}" y="${H - 8}" text-anchor="middle">${esc(fmtAxisHour(t))}</text>`;
    }

    // Unspecified sleep → tall vertical-gradient block spanning REM→Deep (behind).
    segs.forEach((s) => {
      if (s.v !== -1) return;
      const x = xS(s.t0), w = Math.max(4, xS(s.t1) - x);
      const top = yCenter(1), bottom = yCenter(3);
      out += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${(bottom - top).toFixed(1)}" rx="8" ry="8" fill="url(#${uid}-u)"/>`;
    });

    // Connectors between consecutive sleep stages.
    for (let i = 0; i < segs.length - 1; i++) {
      const a = segs[i], b = segs[i + 1];
      if (!sleepv(a.v) || !sleepv(b.v)) continue;
      const x = xS(b.t0).toFixed(1);
      out += `<line x1="${x}" y1="${yCenter(3 - a.v).toFixed(1)}" x2="${x}" y2="${yCenter(3 - b.v).toFixed(1)}" stroke="${SC[b.v]}" stroke-width="3" stroke-linecap="round" opacity="0.5"/>`;
    }

    // Sleep-stage capsules.
    segs.forEach((s) => {
      if (!sleepv(s.v)) return;
      const r = 3 - s.v, cy = yCenter(r), x = xS(s.t0), w = Math.max(4, xS(s.t1) - x);
      out += `<rect x="${x.toFixed(1)}" y="${(cy - capH / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${capH.toFixed(1)}" rx="5" ry="5" fill="${SC[s.v]}" style="filter:drop-shadow(0 0 5px ${SC[s.v]}55)"/>`;
    });

    // Awake → tall thin coral spikes rising from the Awake band down to REM (on top).
    segs.forEach((s) => {
      if (s.v !== 3) return;
      const x = xS(s.t0), w = Math.max(5, xS(s.t1) - x);
      const top = rowTop(0) + rowH * 0.28, bottom = yCenter(1);
      out += `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${w.toFixed(1)}" height="${(bottom - top).toFixed(1)}" rx="${Math.min(w / 2, 5).toFixed(1)}" fill="url(#${uid}-a)"/>`;
    });

    return out + `</svg>`;
  }

  // Heart-rate trace with a hospital-monitor pulse at the leading edge.
  // pts: [{t, v}] in epoch seconds / bpm.
  function svgHRTrace(pts, startS, endS, opts) {
    opts = opts || {};
    const bare = !!opts.bare; // pill mode: full-bleed, no axis labels
    const W = 680, H = 104;
    const padL = bare ? 0 : 10, padR = bare ? 0 : 12, padT = 10, padB = bare ? 10 : 18;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    // Scale x to the actual data range so the trace runs edge-to-edge instead
    // of floating inside the (mostly empty) fetch window.
    if (pts.length) { startS = pts[0].t; endS = pts[pts.length - 1].t; }
    const span = endS - startS || 1;
    const vs = pts.map((p) => p.v);
    let lo = Math.min.apply(null, vs), hi = Math.max.apply(null, vs);
    if (!(hi > lo)) hi = lo + 1;
    lo = Math.floor(lo - 4);
    hi = Math.ceil(hi + 4);
    const xS = (t) => padL + Math.max(0, Math.min(1, (t - startS) / span)) * plotW;
    const yS = (v) => padT + (1 - (v - lo) / (hi - lo)) * plotH;

    let d = "";
    pts.forEach((p, i) => { d += (i ? "L" : "M") + xS(p.t).toFixed(1) + " " + yS(p.v).toFixed(1) + " "; });
    const first = pts[0], last = pts[pts.length - 1];
    const lx = xS(last.t).toFixed(1), ly = yS(last.v).toFixed(1);
    const baseY = (padT + plotH).toFixed(1);
    const area = d + `L ${xS(last.t).toFixed(1)} ${baseY} L ${xS(first.t).toFixed(1)} ${baseY} Z`;
    const C = "#ff2d55";
    // Unique ids so multiple heart cards on one dashboard don't share a
    // gradient / motion path.
    const uid = "hbhr" + Math.floor(Math.random() * 1e9);
    const pid = uid + "-p";
    // Sweep duration scales gently with how much line there is to travel.
    const sweep = Math.min(7, Math.max(3.5, pts.length / 120)).toFixed(1);

    let out = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="Heart rate, last 6 hours">`;
    out += `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity="0.35"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></linearGradient><radialGradient id="${uid}-h"><stop offset="0" stop-color="${C}" stop-opacity="0.9"/><stop offset="0.45" stop-color="${C}" stop-opacity="0.32"/><stop offset="1" stop-color="${C}" stop-opacity="0"/></radialGradient></defs>`;
    if (opts.rest != null && opts.rest >= lo && opts.rest <= hi) {
      const ryNum = yS(opts.rest);
      out += `<line class="hb-grid" x1="${padL}" y1="${ryNum.toFixed(1)}" x2="${W - padR}" y2="${ryNum.toFixed(1)}" stroke-dasharray="3 5"/>`;
      if (!bare) out += `<text class="hb-axis" x="${W - padR}" y="${(ryNum - 4).toFixed(1)}" text-anchor="end">rest ${Math.round(opts.rest)}</text>`;
    }
    if (!bare) {
      out += `<text class="hb-axis" x="${padL}" y="${padT + 6}">${hi}</text>`;
      out += `<text class="hb-axis" x="${padL}" y="${(padT + plotH).toFixed(1)}">${lo}</text>`;
      const stepH = Math.max(1, Math.round(span / 3600 / 4)) * 3600;
      for (let t = Math.ceil(startS / 3600) * 3600; t <= endS; t += stepH) {
        out += `<text class="hb-axis" x="${xS(t).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(fmtAxisHour(t))}</text>`;
      }
    }
    out += `<path d="${area}" fill="url(#${uid})"/>`;
    out += `<path id="${pid}" class="hr-line" d="${d.trim()}" fill="none" stroke="${C}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ${C})"/>`;
    // A faint static marker at the latest reading, plus the pulsing dot that
    // travels the length of the line like a monitor sweep.
    // Faint marker at the latest reading.
    out += `<circle cx="${lx}" cy="${ly}" r="2" fill="${C}" opacity="0.35"/>`;
    // Sweep dot: crosses the line left→right once per second with an
    // ease-in-out curve, trailing a glow halo that lights up the line near it.
    out += `<g>
        <circle class="hr-halo" r="18" fill="url(#${uid}-h)"/>
        <circle r="4" fill="#ffffff" opacity="0.95"/>
        <circle r="2.6" fill="${C}"/>
        <animateMotion dur="2.5s" repeatCount="indefinite" rotate="0" calcMode="spline" keyPoints="0;1;1" keyTimes="0;0.8;1" keySplines="0.45 0 0.55 1;0 0 1 1">
          <mpath href="#${pid}" xlink:href="#${pid}"/>
        </animateMotion>
      </g>`;
    return out + `</svg>`;
  }

  /* ------------------------------------------------------------------ *
   * Workout card — reads the last_apple_workout sensor's attributes.   *
   * ------------------------------------------------------------------ */

  class HBWorkoutCard extends HBBaseCard {
    static get kind() { return "workout"; }
    metricSuffixes() { return ["last_apple_workout"]; }
    primaryEntity(user) { return `sensor.last_apple_workout_${user}`; }

    renderInner(hass, user) {
      const s = hass.states[`sensor.last_apple_workout_${user}`];
      const a = (s && s.attributes) || {};
      const missing = !s || ["unknown", "unavailable"].includes(s.state);
      const type = a.workout_type;
      const mins = Number(a.duration_min);
      const icon = iconForWorkout(String(type || (s && s.state) || "").toLowerCase());

      let headline;
      if (missing || !type) headline = `<b>—</b><span>NO WORKOUT YET</span>`;
      else headline = `<b>${esc(fmtDurationMin(mins))}</b><span>${esc(String(type).toUpperCase())}</span>`;

      let message;
      if (missing) {
        message = "Your latest workout will appear here after the next sync.";
      } else {
        const kcal = Number(a.active_energy_kcal);
        const hr = Number(a.average_heart_rate_bpm);
        const parts = [];
        if (Number.isFinite(kcal)) parts.push(`${Math.round(kcal)} kcal`);
        if (Number.isFinite(hr)) parts.push(`avg HR ${Math.round(hr)}`);
        const lead = parts.length ? parts.join(" · ") + " — " : "";
        let tail;
        if (Number.isFinite(kcal) && kcal >= 400) tail = "strong work today.";
        else if (Number.isFinite(kcal) && kcal >= 200) tail = "a solid effort.";
        else tail = "every session counts.";
        message = `${lead}${tail}`;
      }

      const band = bandStrip({
        lIcon: "mdi:timer-play", lLabel: "START", lVal: esc(fmtClock(a.start_time)),
        color: "#ff8c00", mIcon: "mdi:star-four-points",
        rIcon: "mdi:flag-checkered", rLabel: "END", rVal: esc(fmtClock(a.end_time)),
      });

      const kcal = Number(a.active_energy_kcal);
      const avg = Number(a.average_heart_rate_bpm);
      const max = Number(a.max_heart_rate_bpm);
      const km = Number(a.distance_km);
      const detail = statTiles([
        { label: "CALORIES", color: "#ff8c00", icon: "mdi:fire",
          value: Number.isFinite(kcal) ? `${Math.round(kcal)}` : "—", unit: Number.isFinite(kcal) ? "kcal" : "" },
        { label: "AVG HR", color: "#e5484d", icon: "mdi:heart-pulse",
          value: Number.isFinite(avg) ? `${Math.round(avg)}` : "—", unit: Number.isFinite(avg) ? "bpm" : "" },
        { label: "MAX HR", color: "#9b6fc2", icon: "mdi:heart",
          value: Number.isFinite(max) ? `${Math.round(max)}` : "—", unit: Number.isFinite(max) ? "bpm" : "" },
        { label: "DISTANCE", color: "#00a9b7", icon: "mdi:map-marker-distance",
          value: Number.isFinite(km) && km > 0 ? `${km}` : "—", unit: Number.isFinite(km) && km > 0 ? "km" : "" },
      ]);

      return hero({ icon, eyebrow: "LATEST WORKOUT", headline, message, band, detail });
    }
  }

  /* ------------------------------------------------------------------ *
   * Your Day card — today's activity.                                  *
   * ------------------------------------------------------------------ */

  class HBDayCard extends HBBaseCard {
    static get kind() { return "day"; }
    metricSuffixes() {
      return ["steps", "heart_rate", "resting_heart_rate", "active_calories",
        "distance", "exercise_time", "flights_climbed"];
    }
    primaryEntity(user) { return `sensor.steps_${user}`; }

    renderInner(hass, user) {
      const S = (m) => `sensor.${m}_${user}`;
      const steps = numState(hass, S("steps"));
      const kcal = numState(hass, S("active_calories"));

      let headline;
      if (steps == null) headline = `<b>—</b><span>AWAITING DATA</span>`;
      else headline = `<b>${esc(Math.round(steps).toLocaleString())}</b><span>STEPS TODAY</span>`;

      let message;
      if (steps == null) {
        message = "Your daily activity summary will appear after the next sync.";
      } else {
        const kp = kcal != null ? `${Math.round(kcal)} kcal burned — ` : "";
        let tail;
        if (steps >= 10000) tail = "goal smashed today.";
        else if (steps >= 7000) tail = "great pace, keep it going.";
        else if (steps >= 4000) tail = "nicely on your way.";
        else tail = "let's get moving today.";
        message = `${kp}${tail}`;
      }

      const band = bandStrip({
        lIcon: "mdi:heart-pulse", lLabel: "HEART RATE", lVal: bpm(numState(hass, S("heart_rate"))),
        color: "#e5484d", mIcon: "mdi:heart",
        rIcon: "mdi:heart-outline", rLabel: "RESTING", rVal: bpm(numState(hass, S("resting_heart_rate"))),
      });

      const distM = numState(hass, S("distance"));
      const distTxt = distM == null
        ? ["—", ""]
        : distM >= 1000 ? [(distM / 1000).toFixed(2), "km"] : [`${Math.round(distM)}`, "m"];
      const exer = numState(hass, S("exercise_time"));
      const flights = numState(hass, S("flights_climbed"));
      const detail = statTiles([
        { label: "ACTIVE", color: "#ff8c00", icon: "mdi:fire",
          value: kcal == null ? "—" : `${Math.round(kcal)}`, unit: kcal == null ? "" : "kcal" },
        { label: "DISTANCE", color: "#00a9b7", icon: "mdi:map-marker-distance",
          value: distTxt[0], unit: distTxt[1] },
        { label: "EXERCISE", color: "#e5484d", icon: "mdi:timer",
          value: exer == null ? "—" : `${Math.round(exer)}`, unit: exer == null ? "" : "min" },
        { label: "FLIGHTS", color: "#9b6fc2", icon: "mdi:stairs-up",
          value: flights == null ? "—" : `${Math.round(flights)}`, unit: "" },
      ]);

      return hero({ icon: "mdi:run", eyebrow: "TODAY", headline, message, band, detail });
    }
  }

  /* ------------------------------------------------------------------ *
   * Heart Rate card — current / resting / walking + HRV, VO2, recovery.*
   * ------------------------------------------------------------------ */

  class HBHeartCard extends HBBaseCard {
    static get kind() { return "heart"; }
    static get usesHistory() { return true; }
    metricSuffixes() { return ["heart_rate"]; }
    primaryEntity(user) { return `sensor.heart_rate_${user}`; }

    async _loadHistory(user) {
      const end = Date.now();
      const start = end - 6 * 3600 * 1000;
      const raw = await this._fetchHistory(`sensor.heart_rate_${user}`, start, end);
      const pts = (raw || [])
        .map((x) => ({ t: Number(x.t), v: Number(x.v) }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v) && p.v > 0);
      this._hist = { pts, startS: start / 1000, endS: end / 1000 };
      this._renderCached(user);
    }

    _renderCached(user) {
      this._card.innerHTML = this._paint(user);
    }

    _paint(user) {
      const hass = this._hass, S = (m) => `sensor.${m}_${user}`;
      const rest = numState(hass, S("resting_heart_rate"));
      const h = this._hist || { pts: [] };
      const graph = h.pts.length > 1
        ? svgHRTrace(h.pts, h.startS, h.endS, { rest, bare: true })
        : `<div class="placeholder">Collecting heart-rate history…</div>`;
      return `<div class="graph">${graph}</div>`;
    }
  }
  HBHeartCard.layoutClass = "hb-trace";

  /* ------------------------------------------------------------------ *
   * Sleep Details card — per-stage breakdown with bars + percentages.  *
   * ------------------------------------------------------------------ */

  class HBSleepDetailsCard extends HBBaseCard {
    static get kind() { return "sleep-details"; }
    static get usesHistory() { return true; }
    getCardSize() { return 5; }
    metricSuffixes() { return ["sleep_details"]; }
    primaryEntity(user) { return `sensor.sleep_details_${user}`; }

    async _loadHistory(user) {
      const hass = this._hass, S = (m) => `sensor.${m}_${user}`;
      const parseTs = (id) => {
        const r = rawState(hass, S(id));
        if (!r || ["unknown", "unavailable"].includes(r)) return null;
        const d = new Date(r);
        return Number.isNaN(d.getTime()) ? null : d.getTime();
      };
      // Bound the window to the sleep session when we can; else last 14h.
      let start = parseTs("asleep_time"), end = parseTs("wake_time");
      const now = Date.now();
      if (start && end && end > start) {
        start -= 20 * 60 * 1000;
        end += 20 * 60 * 1000;
      } else {
        end = now;
        start = now - 14 * 3600 * 1000;
      }
      const raw = await this._fetchHistory(S("sleep_details"), start, end);
      const seq = (raw || [])
        .map((x) => ({ t: Number(x.t), v: parseInt(x.v, 10) }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
        .sort((a, b) => a.t - b.t);
      const segs = [];
      for (let i = 0; i < seq.length; i++) {
        const t0 = seq[i].t;
        const t1 = i + 1 < seq.length ? seq[i + 1].t : end / 1000;
        if (t1 > t0) segs.push({ t0, t1, v: seq[i].v });
      }
      this._hist = { segs, startS: start / 1000, endS: end / 1000 };
      this._renderCached(user);
    }

    _renderCached(user) {
      this._card.innerHTML = this._paint(user);
    }

    _paint(user) {
      const hass = this._hass, S = (m) => `sensor.${m}_${user}`;
      const total = numState(hass, S("sleep_duration"));
      const foot = total == null
        ? "Awaiting sleep data"
        : `${fmtHours(total)} asleep · last night`;

      const h = this._hist || { segs: [] };
      const graph = h.segs.length
        ? svgHypnogram(h.segs, h.startS, h.endS)
        : `<div class="placeholder">Collecting sleep-stage history…</div>`;

      return `
        <div class="eyebrow">SLEEP DETAILS</div>
        <ha-icon class="icon" icon="mdi:chart-timeline-variant"></ha-icon>
        <div class="graph">${graph}</div>
        <div class="foot">${esc(foot)}</div>`;
    }
  }
  HBSleepDetailsCard.layoutClass = "hb-hypno";

  /* ------------------------------------------------------------------ *
   * Minimal GUI editor (style / theme / user / title).                 *
   * ------------------------------------------------------------------ */

  class HBCardEditor extends HTMLElement {
    setConfig(config) {
      this._config = config || {};
      this._render();
    }
    set hass(hass) {
      this._hass = hass;
      if (this._form) this._form.hass = hass;
    }

    _render() {
      if (this._form) {
        this._form.data = this._config;
        return;
      }
      const form = document.createElement("ha-form");
      form.schema = [
        { name: "user", selector: { text: {} } },
        {
          name: "style",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "neumorphic", label: "Neumorphic" },
                { value: "minimal", label: "Minimal" },
                { value: "transparent", label: "Transparent" },
              ],
            },
          },
        },
        {
          name: "theme",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "dark", label: "Dark" },
                { value: "light", label: "Light" },
                { value: "auto", label: "Auto (follow HA)" },
              ],
            },
          },
        },
        { name: "title", selector: { text: {} } },
      ];
      form.computeLabel = (s) =>
        ({
          user: "User (auto-detected if blank)",
          style: "Style",
          theme: "Theme",
          title: "Title (optional)",
        }[s.name] || s.name);
      form.data = this._config;
      if (this._hass) form.hass = this._hass;
      form.addEventListener("value-changed", (ev) => {
        // Merge so `type` (and any other non-schema keys) survive edits.
        this._config = Object.assign({}, this._config, ev.detail.value);
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config: this._config } })
        );
      });
      this._form = form;
      this.appendChild(form);
    }
  }

  /* ------------------------------------------------------------------ *
   * Registration.                                                      *
   * ------------------------------------------------------------------ */

  function define(tag, cls) {
    if (!customElements.get(tag)) customElements.define(tag, cls);
  }

  define("health-bridge-card-editor", HBCardEditor);
  define("health-bridge-sleep-card", HBSleepCard);
  define("health-bridge-sleep-details-card", HBSleepDetailsCard);
  define("health-bridge-workout-card", HBWorkoutCard);
  define("health-bridge-day-card", HBDayCard);
  define("health-bridge-heart-card", HBHeartCard);

  window.customCards = window.customCards || [];
  const register = (type, name, description) => {
    if (!window.customCards.some((c) => c.type === type)) {
      window.customCards.push({
        type,
        name,
        description,
        preview: true,
        documentationURL: "https://github.com/gregt1993/Health_Bridge",
      });
    }
  };
  register(
    "health-bridge-sleep-card",
    "Health Bridge · Sleep",
    "Last night's sleep — duration, window and stage breakdown."
  );
  register(
    "health-bridge-sleep-details-card",
    "Health Bridge · Sleep Details",
    "Per-stage sleep breakdown with durations and percentages."
  );
  register(
    "health-bridge-workout-card",
    "Health Bridge · Workout",
    "Your latest Apple workout — duration, calories, heart rate and distance."
  );
  register(
    "health-bridge-day-card",
    "Health Bridge · Your Day",
    "Today's activity — steps, calories, distance and heart rate."
  );
  register(
    "health-bridge-heart-card",
    "Health Bridge · Heart Rate",
    "Current, resting and walking heart rate plus HRV and VO₂ max."
  );

  console.info(
    `%c HEALTH-BRIDGE-CARDS %c v${VERSION} `,
    "color:#fff;background:#00a9b7;border-radius:3px 0 0 3px;padding:2px 4px;",
    "color:#00a9b7;background:#141415;border-radius:0 3px 3px 0;padding:2px 4px;"
  );
})();
