const SPORTS_TICKER_EDITOR_VERSION = "0.4.0";

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

const sportForEntity = (entityId) => Object.entries(ST_SPORTS).find(([, sport]) => sport.entity === entityId)?.[0] || null;
const stableConfig = (value) => JSON.stringify(value || {}, Object.keys(value || {}).sort());

class SportsTickerCardEditorV3 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._advancedOpen = false;
    this._availabilitySignature = "";
    this._configSignature = "";
  }

  set hass(hass) {
    this._hass = hass;
    const signature = this._availableSports().map(([key]) => key).join("|");
    const first = !this.shadowRoot?.childNodes?.length;
    if (first || signature !== this._availabilitySignature) {
      this._availabilitySignature = signature;
      this._render();
    }
  }

  setConfig(config) {
    const next = { ...(config || {}) };
    const signature = stableConfig(next);
    this._config = next;
    if (signature !== this._configSignature) {
      this._configSignature = signature;
      this._render();
    }
  }

  _availableSports() {
    if (!this._hass) return [];
    return Object.entries(ST_SPORTS).filter(([, sport]) => {
      const state = this._hass.states?.[sport.entity];
      return Boolean(state && Array.isArray(state.attributes?.events));
    });
  }

  _emit(next) {
    this._config = next;
    this._configSignature = stableConfig(next);
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: next }, bubbles: true, composed: true,
    }));
    this._render();
  }

  _cardType() { return this._config.preset === "ticker" ? "ticker" : "game"; }
  _layout() { return this._config.preset === "game_compact" ? "compact" : "standard"; }
  _sportKey(available) {
    const configured = sportForEntity(this._config.entity);
    return configured && available.some(([key]) => key === configured) ? configured : available[0]?.[0] || null;
  }

  _render() {
    if (!this.shadowRoot || !this._hass) return;
    const available = this._availableSports();
    const availableKeys = available.map(([key]) => key);
    const type = this._cardType();
    const ticker = type === "ticker";
    const sportKey = this._sportKey(available);
    const layout = this._layout();
    const selectedSports = Array.isArray(this._config.sports)
      ? this._config.sports.filter((key) => availableKeys.includes(key))
      : availableKeys.slice(0, 1);

    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;color:var(--primary-text-color);font-family:var(--paper-font-body1_-_font-family,inherit)}*{box-sizing:border-box}
        .editor{display:grid;padding:2px 10px 24px}.section{display:grid;gap:15px;padding:22px 0}.section:first-child{padding-top:8px}.section+.section{border-top:1px solid var(--divider-color)}
        .eyebrow{font-size:12px;font-weight:800;letter-spacing:.105em;text-transform:uppercase;color:var(--secondary-text-color)}.field{display:grid;gap:8px}.label{font-size:14px;font-weight:650}.helper{font-size:12px;line-height:1.45;color:var(--secondary-text-color)}
        .choice-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.sport-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:9px}
        .choice{min-height:48px;padding:8px 12px;border:1px solid var(--divider-color);border-radius:11px;background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);font:inherit;font-size:14px;font-weight:650;cursor:pointer;transition:.15s ease}.choice:hover{border-color:var(--primary-color)}.choice.selected{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,var(--card-background-color,var(--ha-card-background)));color:var(--primary-color);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--primary-color) 35%,transparent)}
        .sport-grid .choice{min-height:42px;font-size:13px}.auto{display:flex;align-items:flex-start;gap:8px;font-size:12px;line-height:1.45;color:var(--secondary-text-color)}.auto ha-icon{--mdc-icon-size:17px;margin-top:1px;color:var(--primary-color)}
        .options{display:grid}.toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:52px;border-bottom:1px solid color-mix(in srgb,var(--divider-color) 75%,transparent);font-size:14px}.toggle:last-child{border-bottom:0}.toggle-text{display:flex;align-items:center;gap:10px}.toggle-text ha-icon{--mdc-icon-size:19px;color:var(--secondary-text-color)}
        .switch{position:relative;width:48px;height:28px;flex:0 0 48px}.switch input{position:absolute;opacity:0}.slider{position:absolute;inset:0;border-radius:999px;background:var(--disabled-color,#9e9e9e);cursor:pointer;transition:.18s}.slider:before{content:"";position:absolute;width:22px;height:22px;left:3px;top:3px;border-radius:50%;background:var(--card-background-color,#fff);box-shadow:0 1px 3px rgba(0,0,0,.35);transition:.18s}.switch input:checked+.slider{background:var(--primary-color)}.switch input:checked+.slider:before{transform:translateX(20px)}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}input[type="number"],input[type="text"]{width:100%;min-height:50px;padding:0 13px;border:1px solid var(--divider-color);border-radius:11px;background:var(--card-background-color,var(--ha-card-background));color:var(--primary-text-color);font:inherit;font-size:14px;outline:none}input:focus{border-color:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color)}
        .advanced{border:1px solid var(--divider-color);border-radius:11px;overflow:hidden;background:var(--card-background-color,var(--ha-card-background))}.advanced-button{width:100%;min-height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;border:0;background:transparent;color:var(--primary-text-color);font:inherit;font-size:14px;font-weight:650;cursor:pointer}.advanced-body{display:grid;gap:15px;padding:16px;border-top:1px solid var(--divider-color)}.empty{padding:13px;border:1px dashed var(--divider-color);border-radius:10px;color:var(--secondary-text-color);font-size:13px}
        @media(max-width:520px){.editor{padding-left:4px;padding-right:4px}.row{grid-template-columns:1fr}.choice-row{grid-template-columns:1fr 1fr}}
      </style>
      <div class="editor">
        <section class="section">
          <div class="eyebrow">Basic setup</div>
          <div class="field"><div class="label">Card type</div><div class="choice-row">
            <button class="choice ${!ticker ? "selected" : ""}" data-type="game" type="button">Game</button>
            <button class="choice ${ticker ? "selected" : ""}" data-type="ticker" type="button">Multi-Sport Ticker</button>
          </div><div class="helper">Choose the type of Sports Ticker card to configure.</div></div>
          ${available.length ? "" : '<div class="empty">No enabled Sports Ticker scoreboard sensors were found. Enable at least one sport in the integration options.</div>'}
          ${ticker ? `
            <div class="field"><div class="label">Sports / Leagues</div><div class="sport-grid">${available.map(([key,s]) => `<button class="choice ${selectedSports.includes(key) ? "selected" : ""}" data-ticker-sport="${key}" type="button">${s.label}</button>`).join("")}</div><div class="helper">Select one or more enabled leagues.</div></div>
          ` : `
            <div class="field"><div class="label">Sport / League</div><div class="sport-grid">${available.map(([key,s]) => `<button class="choice ${key === sportKey ? "selected" : ""}" data-game-sport="${key}" type="button">${s.label}</button>`).join("")}</div><div class="helper">Only enabled Sports Ticker leagues are shown.</div></div>
            <div class="field"><div class="label">Layout</div><div class="choice-row"><button class="choice ${layout === "standard" ? "selected" : ""}" data-layout="standard" type="button">Standard</button><button class="choice ${layout === "compact" ? "selected" : ""}" data-layout="compact" type="button">Compact</button></div></div>
            <div class="auto"><ha-icon icon="mdi:information-outline"></ha-icon><span>The card automatically uses the selected league's scoreboard data. No entity selection is required.</span></div>
          `}
        </section>
        ${ticker ? `
          <section class="section"><div class="eyebrow">Ticker options</div><div class="options">${this._toggle("show-logos","Show team logos","mdi:image-outline",this._config.show_logos !== false)}${this._toggle("pause-hover","Pause on hover","mdi:pause-circle-outline",this._config.ticker_pause_on_hover !== false)}</div><div class="row"><div class="field"><div class="label">Seconds per game</div><input id="speed" type="number" min="3" max="20" value="${Number(this._config.ticker_seconds_per_game)||8}"><div class="helper">Higher values scroll more slowly.</div></div><div class="field"><div class="label">Maximum games per sport</div><input id="max-games" type="number" min="1" max="30" value="${Number(this._config.ticker_max_games_per_sport)||20}"></div></div></section>
        ` : `
          <section class="section"><div class="eyebrow">Game options</div><div class="options">${this._toggle("show-league","Show league","mdi:earth",this._config.show_league !== false)}${this._toggle("show-records","Show team records","mdi:trophy-outline",this._config.show_records !== false)}${this._toggle("show-venue","Show venue","mdi:stadium-outline",this._config.show_venue !== false)}${this._toggle("show-broadcast","Show broadcast","mdi:television",this._config.show_broadcast !== false)}${this._toggle("show-logos","Show team logos","mdi:image-outline",this._config.show_logos !== false)}</div></section>
        `}
        <div class="advanced"><button id="advanced-button" class="advanced-button" type="button"><span>Advanced options</span><ha-icon icon="mdi:chevron-${this._advancedOpen ? "up" : "down"}"></ha-icon></button>${this._advancedOpen ? `<div class="advanced-body">${ticker ? '<div class="helper">No advanced ticker options are required right now.</div>' : `<div class="field"><div class="label">Event ID</div><input id="event-id" type="text" value="${this._escape(this._config.event_id||"")}" placeholder="Optional ESPN event ID"></div><div class="field"><div class="label">Entity override</div><input id="entity-override" type="text" value="${this._escape(this._config.entity||"")}" placeholder="sensor.espn_..."><div class="helper">Normally managed automatically.</div></div>`}</div>` : ""}</div>
      </div>`;

    this._wire(available, selectedSports);
  }

  _toggle(id,label,icon,checked){return `<label class="toggle"><span class="toggle-text"><ha-icon icon="${icon}"></ha-icon><span>${label}</span></span><span class="switch"><input id="${id}" type="checkbox" ${checked?"checked":""}><span class="slider"></span></span></label>`;}

  _wire(available, selectedSports) {
    this.shadowRoot.querySelectorAll("[data-type]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.type === this._cardType()) return;
      if (button.dataset.type === "ticker") {
        const enabled = available.map(([key]) => key);
        const sports = selectedSports.length ? selectedSports : enabled.slice(0,1);
        this._emit({...this._config,preset:"ticker",sports,show_logos:this._config.show_logos!==false,ticker_seconds_per_game:Number(this._config.ticker_seconds_per_game)||8,ticker_max_games_per_sport:Number(this._config.ticker_max_games_per_sport)||20,ticker_pause_on_hover:this._config.ticker_pause_on_hover!==false});
      } else {
        const [,sport] = available[0] || [];
        if (sport) this._emit({...this._config,preset:"game",entity:sport.entity,show_logos:true,show_league:true,show_records:true,show_venue:true,show_broadcast:true});
      }
    }));
    this.shadowRoot.querySelectorAll("[data-game-sport]").forEach((button)=>button.addEventListener("click",()=>{const def=ST_SPORTS[button.dataset.gameSport];if(def)this._emit({...this._config,entity:def.entity});}));
    this.shadowRoot.querySelectorAll("[data-layout]").forEach((button)=>button.addEventListener("click",()=>{const compact=button.dataset.layout==="compact";this._emit({...this._config,preset:compact?"game_compact":"game",...(compact?{show_league:false,show_venue:false,show_broadcast:false}:{})});}));
    this.shadowRoot.querySelectorAll("[data-ticker-sport]").forEach((button)=>button.addEventListener("click",()=>{const key=button.dataset.tickerSport;const set=new Set(selectedSports);set.has(key)?set.delete(key):set.add(key);if(!set.size)return;this._emit({...this._config,sports:[...set]});}));
    this._wireBool("show-logos","show_logos");this._wireBool("show-league","show_league");this._wireBool("show-records","show_records");this._wireBool("show-venue","show_venue");this._wireBool("show-broadcast","show_broadcast");this._wireBool("pause-hover","ticker_pause_on_hover");
    this._wireNumber("speed","ticker_seconds_per_game",3,20);this._wireNumber("max-games","ticker_max_games_per_sport",1,30);
    this.shadowRoot.getElementById("advanced-button")?.addEventListener("click",()=>{this._advancedOpen=!this._advancedOpen;this._render();});
    const eventId=this.shadowRoot.getElementById("event-id");eventId?.addEventListener("change",()=>this._emit({...this._config,event_id:eventId.value.trim()||undefined}));
    const entity=this.shadowRoot.getElementById("entity-override");entity?.addEventListener("change",()=>this._emit({...this._config,entity:entity.value.trim()||this._config.entity}));
  }

  _wireBool(id,key){const el=this.shadowRoot.getElementById(id);el?.addEventListener("change",()=>this._emit({...this._config,[key]:el.checked}));}
  _wireNumber(id,key,min,max){const el=this.shadowRoot.getElementById(id);el?.addEventListener("change",()=>this._emit({...this._config,[key]:Math.max(min,Math.min(max,Number(el.value)||min))}));}
  _escape(value){return String(value).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
}

if(!customElements.get("sports-ticker-card-editor-v3")) customElements.define("sports-ticker-card-editor-v3",SportsTickerCardEditorV3);
customElements.whenDefined("sports-ticker-card").then(()=>{
  const CardClass=customElements.get("sports-ticker-card");
  CardClass.getConfigElement=async()=>document.createElement("sports-ticker-card-editor-v3");
});
console.info(`%c SPORTS-TICKER-EDITOR %c v${SPORTS_TICKER_EDITOR_VERSION} `,"background:#444;color:#fff;font-weight:700","background:#eee;color:#444");
