const SPORTS_TICKER_EDITOR_VERSION = "0.3.1";

const ST_SPORTS = {
  nfl: { label: "NFL", entity: "sensor.espn_nfl_scoreboard_raw" },
  cfb: { label: "CFB", entity: "sensor.espn_cfb_scoreboard_raw" },
  mlb: { label: "MLB", entity: "sensor.espn_mlb_scoreboard_raw" },
  nba: { label: "NBA", entity: "sensor.espn_nba_scoreboard_raw" },
  wnba: { label: "WNBA", entity: "sensor.espn_wnba_scoreboard_raw" },
  nhl: { label: "NHL", entity: "sensor.espn_nhl_scoreboard_raw" },
  mls: { label: "MLS", entity: "sensor.espn_mls_scoreboard_raw" },
  epl: { label: "Premier League", entity: "sensor.espn_epl_scoreboard_raw" },
  laliga: { label: "LaLiga", entity: "sensor.espn_laliga_scoreboard_raw" },
  bundesliga: { label: "Bundesliga", entity: "sensor.espn_bundesliga_scoreboard_raw" },
  seriea: { label: "Serie A", entity: "sensor.espn_seriea_scoreboard_raw" },
  ligue1: { label: "Ligue 1", entity: "sensor.espn_ligue1_scoreboard_raw" },
  ucl: { label: "Champions League", entity: "sensor.espn_ucl_scoreboard_raw" },
};

const stSportForEntity = (entityId) => Object.entries(ST_SPORTS).find(([, sport]) => sport.entity === entityId)?.[0] || null;

class SportsTickerCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._advancedOpen = false;
  }

  set hass(hass) { this._hass = hass; this._render(); }
  setConfig(config) { this._config = { ...(config || {}) }; this._render(); }

  _availableSports() {
    if (!this._hass) return [];
    return Object.entries(ST_SPORTS).filter(([, sport]) => {
      const state = this._hass.states?.[sport.entity];
      return Boolean(state && Array.isArray(state.attributes?.events));
    });
  }

  _cardType() { return this._config.preset === "ticker" ? "ticker" : "game"; }
  _layout() { return this._config.preset === "game_compact" ? "compact" : "standard"; }

  _sportKey(available) {
    const configured = stSportForEntity(this._config.entity);
    if (configured && available.some(([key]) => key === configured)) return configured;
    return available[0]?.[0] || null;
  }

  _emit(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
    this._render();
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const available = this._availableSports();
    const availableKeys = available.map(([key]) => key);
    const cardType = this._cardType();
    const isTicker = cardType === "ticker";
    const sportKey = this._sportKey(available);
    const layout = this._layout();
    const selectedSports = Array.isArray(this._config.sports)
      ? this._config.sports.filter((key) => availableKeys.includes(key))
      : availableKeys.slice(0, 1);

    const sportOptions = available.map(([key, sport]) => `<option value="${key}">${sport.label}</option>`).join("");
    const sportChecks = available.map(([key, sport]) => `<label class="league-chip"><input type="checkbox" data-sport="${key}" ${selectedSports.includes(key) ? "checked" : ""}><span>${sport.label}</span></label>`).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}
        *{box-sizing:border-box}.editor{display:grid;gap:0;padding:2px 10px 22px}.section{display:grid;gap:16px;padding:22px 0}.section:first-child{padding-top:8px}.section+.section{border-top:1px solid var(--divider-color)}
        .eyebrow{font-size:12px;font-weight:800;letter-spacing:.105em;text-transform:uppercase;color:var(--secondary-text-color)}
        .field{display:grid;gap:8px}.label-row{display:flex;align-items:center;gap:6px}.label{font-size:14px;font-weight:650}.label-row ha-icon{--mdc-icon-size:17px;color:var(--secondary-text-color)}.helper{font-size:12px;line-height:1.45;color:var(--secondary-text-color)}
        .select-wrap{position:relative}.select-wrap ha-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;--mdc-icon-size:20px;color:var(--secondary-text-color)}
        select,input[type="number"],input[type="text"]{width:100%;min-height:52px;padding:0 44px 0 14px;border:1px solid var(--divider-color);border-radius:11px;background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);font:inherit;font-size:15px;outline:none;transition:border-color .15s ease,box-shadow .15s ease}
        input[type="number"],input[type="text"]{padding-right:14px}select{appearance:none;-webkit-appearance:none;cursor:pointer}select:focus,input:focus{border-color:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color)}
        .options{display:grid}.toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:52px;border-bottom:1px solid color-mix(in srgb,var(--divider-color) 75%,transparent);font-size:14px}.toggle:last-child{border-bottom:0}.toggle-text{display:flex;align-items:center;gap:10px}.toggle-text ha-icon{--mdc-icon-size:19px;color:var(--secondary-text-color)}
        .switch{position:relative;width:48px;height:28px;flex:0 0 48px}.switch input{position:absolute;opacity:0;pointer-events:none}.slider{position:absolute;inset:0;border-radius:999px;background:var(--disabled-color,#9e9e9e);transition:.18s ease;cursor:pointer}.slider:before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:var(--card-background-color,#fff);box-shadow:0 1px 3px rgba(0,0,0,.35);transition:.18s ease}.switch input:checked+.slider{background:var(--primary-color)}.switch input:checked+.slider:before{transform:translateX(20px)}
        .league-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:9px}.league-chip{position:relative;min-height:42px;display:flex;align-items:center;justify-content:center;padding:0 10px;border:1px solid var(--divider-color);border-radius:10px;background:var(--card-background-color,var(--ha-card-background));font-size:13px;font-weight:650;cursor:pointer}.league-chip input{position:absolute;opacity:0}.league-chip:has(input:checked){border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color,var(--ha-card-background)));color:var(--primary-color)}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}.advanced{margin-top:2px;border:1px solid var(--divider-color);border-radius:11px;overflow:hidden;background:var(--card-background-color,var(--ha-card-background))}.advanced-button{width:100%;min-height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;border:0;background:transparent;color:var(--primary-text-color);font:inherit;font-size:14px;font-weight:650;cursor:pointer}.advanced-button ha-icon{--mdc-icon-size:21px;color:var(--secondary-text-color)}.advanced-body{display:grid;gap:15px;padding:16px;border-top:1px solid var(--divider-color)}
        .empty{padding:13px;border:1px dashed var(--divider-color);border-radius:10px;color:var(--secondary-text-color);font-size:13px}.auto{display:flex;align-items:flex-start;gap:8px;padding-top:1px;font-size:12px;line-height:1.45;color:var(--secondary-text-color)}.auto ha-icon{--mdc-icon-size:17px;margin-top:1px;color:var(--primary-color)}
        @media(max-width:520px){.editor{padding-left:4px;padding-right:4px}.row{grid-template-columns:1fr}}
      </style>
      <div class="editor">
        <section class="section">
          <div class="eyebrow">Basic setup</div>
          ${this._selectField("Card type", "card-type", '<option value="game">Game</option><option value="ticker">Multi-Sport Ticker</option>', "Choose the type of Sports Ticker card to configure.")}
          ${available.length ? "" : '<div class="empty">No enabled Sports Ticker scoreboard sensors were found. Enable at least one sport in the integration options.</div>'}
          ${isTicker ? `
            <div class="field"><div class="label-row"><div class="label">Sports / Leagues</div><ha-icon icon="mdi:help-circle-outline"></ha-icon></div><div class="league-grid">${sportChecks}</div><div class="helper">Only leagues enabled in the Sports Ticker integration are shown.</div></div>
          ` : `
            ${this._selectField("Sport / League", "sport", sportOptions, "Only enabled Sports Ticker leagues are available.")}
            ${this._selectField("Layout", "layout", '<option value="standard">Standard</option><option value="compact">Compact</option>')}
            <div class="auto"><ha-icon icon="mdi:information-outline"></ha-icon><span>The card automatically uses the selected league's scoreboard data. No entity selection is required.</span></div>
          `}
        </section>

        ${isTicker ? `
          <section class="section"><div class="eyebrow">Ticker options</div><div class="options">
            ${this._toggle("show-logos", "Show team logos", "mdi:image-outline", this._config.show_logos !== false)}
            ${this._toggle("pause-hover", "Pause on hover", "mdi:pause-circle-outline", this._config.ticker_pause_on_hover !== false)}
          </div><div class="row">
            <div class="field"><div class="label-row"><div class="label">Seconds per game</div></div><input id="speed" type="number" min="3" max="20" step="1" value="${Number(this._config.ticker_seconds_per_game) || 8}"><div class="helper">Higher values scroll more slowly.</div></div>
            <div class="field"><div class="label-row"><div class="label">Maximum games per sport</div></div><input id="max-games" type="number" min="1" max="30" step="1" value="${Number(this._config.ticker_max_games_per_sport) || 20}"></div>
          </div></section>
        ` : `
          <section class="section"><div class="eyebrow">Game options</div><div class="options">
            ${this._toggle("show-league", "Show league", "mdi:earth", this._config.show_league !== false)}
            ${this._toggle("show-records", "Show team records", "mdi:trophy-outline", this._config.show_records !== false)}
            ${this._toggle("show-venue", "Show venue", "mdi:stadium-outline", this._config.show_venue !== false)}
            ${this._toggle("show-broadcast", "Show broadcast", "mdi:television", this._config.show_broadcast !== false)}
            ${this._toggle("show-logos", "Show team logos", "mdi:image-outline", this._config.show_logos !== false)}
          </div></section>
        `}

        <div class="advanced"><button id="advanced-button" class="advanced-button" type="button"><span>Advanced options</span><ha-icon icon="mdi:chevron-${this._advancedOpen ? "up" : "down"}"></ha-icon></button>
          ${this._advancedOpen ? `<div class="advanced-body">${isTicker ? '<div class="helper">No advanced ticker options are required right now.</div>' : `<div class="field"><div class="label-row"><div class="label">Event ID</div></div><input id="event-id" type="text" value="${this._escapeAttr(this._config.event_id || "")}" placeholder="Optional ESPN event ID"><div class="helper">Pin this card to one ESPN event instead of automatic game selection.</div></div><div class="field"><div class="label-row"><div class="label">Entity override</div></div><input id="entity-override" type="text" value="${this._escapeAttr(this._config.entity || "")}" placeholder="sensor.espn_..."><div class="helper">Normally managed automatically. Change only for advanced/custom configurations.</div></div>`}</div>` : ""}
        </div>
      </div>`;

    const cardTypeEl = this.shadowRoot.getElementById("card-type");
    cardTypeEl.value = cardType;
    cardTypeEl.addEventListener("change", () => this._changeType(cardTypeEl.value, available));

    const advanced = this.shadowRoot.getElementById("advanced-button");
    advanced?.addEventListener("click", () => { this._advancedOpen = !this._advancedOpen; this._render(); });

    if (isTicker) this._wireTicker();
    else this._wireGame(sportKey, layout);
  }

  _selectField(label, id, options, helper = "") {
    return `<div class="field"><div class="label-row"><div class="label">${label}</div><ha-icon icon="mdi:help-circle-outline"></ha-icon></div><div class="select-wrap"><select id="${id}">${options}</select><ha-icon icon="mdi:chevron-down"></ha-icon></div>${helper ? `<div class="helper">${helper}</div>` : ""}</div>`;
  }

  _toggle(id, label, icon, checked) {
    return `<label class="toggle"><span class="toggle-text"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></span><span class="switch"><input id="${id}" type="checkbox" ${checked ? "checked" : ""}><span class="slider"></span></span></label>`;
  }

  _changeType(type, available) {
    if (type === "ticker") {
      const enabled = available.map(([key]) => key);
      const sports = (Array.isArray(this._config.sports) ? this._config.sports : []).filter((key) => enabled.includes(key));
      this._emit({ ...this._config, preset: "ticker", sports: sports.length ? sports : enabled.slice(0, 1), show_logos: this._config.show_logos !== false, ticker_seconds_per_game: Number(this._config.ticker_seconds_per_game) || 8, ticker_max_games_per_sport: Number(this._config.ticker_max_games_per_sport) || 20, ticker_pause_on_hover: this._config.ticker_pause_on_hover !== false });
      return;
    }
    const [, sport] = available[0] || [];
    if (!sport) return;
    this._emit({ ...this._config, preset: "game", entity: sport.entity, show_logos: true, show_league: true, show_records: true, show_venue: true, show_broadcast: true });
  }

  _wireTicker() {
    this.shadowRoot.querySelectorAll("[data-sport]").forEach((input) => input.addEventListener("change", () => {
      const sports = [...this.shadowRoot.querySelectorAll("[data-sport]:checked")].map((item) => item.dataset.sport);
      if (!sports.length) { input.checked = true; return; }
      this._emit({ ...this._config, preset: "ticker", sports });
    }));
    this._wireBool("show-logos", "show_logos"); this._wireBool("pause-hover", "ticker_pause_on_hover");
    this._wireNumber("speed", "ticker_seconds_per_game", 3, 20); this._wireNumber("max-games", "ticker_max_games_per_sport", 1, 30);
  }

  _wireGame(sportKey, layoutValue) {
    const sport = this.shadowRoot.getElementById("sport");
    if (sport) {
      sport.value = sportKey || "";
      sport.addEventListener("change", () => { const def = ST_SPORTS[sport.value]; if (def) this._emit({ ...this._config, entity: def.entity }); });
    }
    const layout = this.shadowRoot.getElementById("layout");
    if (layout) {
      layout.value = layoutValue;
      layout.addEventListener("change", () => {
        const compact = layout.value === "compact";
        this._emit({ ...this._config, preset: compact ? "game_compact" : "game", ...(compact ? { show_league: false, show_venue: false, show_broadcast: false } : {}) });
      });
    }
    this._wireBool("show-logos", "show_logos"); this._wireBool("show-league", "show_league"); this._wireBool("show-records", "show_records"); this._wireBool("show-venue", "show_venue"); this._wireBool("show-broadcast", "show_broadcast");
    const eventId = this.shadowRoot.getElementById("event-id"); eventId?.addEventListener("change", () => this._emit({ ...this._config, event_id: eventId.value.trim() || undefined }));
    const override = this.shadowRoot.getElementById("entity-override"); override?.addEventListener("change", () => this._emit({ ...this._config, entity: override.value.trim() || this._config.entity }));
  }

  _wireBool(id, key) { const input = this.shadowRoot.getElementById(id); input?.addEventListener("change", () => this._emit({ ...this._config, [key]: input.checked })); }
  _wireNumber(id, key, min, max) { const input = this.shadowRoot.getElementById(id); input?.addEventListener("change", () => { const value = Math.max(min, Math.min(max, Number(input.value) || min)); this._emit({ ...this._config, [key]: value }); }); }
  _escapeAttr(value) { return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
}

if (!customElements.get("sports-ticker-card-editor")) customElements.define("sports-ticker-card-editor", SportsTickerCardEditor);
const SportsTickerCardClass = customElements.get("sports-ticker-card");
if (SportsTickerCardClass) {
  delete SportsTickerCardClass.getConfigForm;
  SportsTickerCardClass.getConfigElement = async () => document.createElement("sports-ticker-card-editor");
}
console.info(`%c SPORTS-TICKER-EDITOR %c v${SPORTS_TICKER_EDITOR_VERSION} `, "background:#444;color:#fff;font-weight:700", "background:#eee;color:#444");
