/**
 * Migraine Risk Card v2.0.0
 * Home Assistant Custom Lovelace Card
 *
 * Works two ways:
 *   1. With the Migraine Risk custom integration (auto-detected)
 *   2. Standalone — point it at any weather entities and the card
 *      computes the risk score internally.
 *
 * All factor entities are optional. The card only shows what you configure.
 *
 * Installation: Copy to /config/www/migraine-risk-card.js
 * Add resource: /local/migraine-risk-card.js (JavaScript Module)
 *
 * © 2026 — MIT Licence
 */

const CARD_VERSION = '2.0.0';

console.info(
  `%c🧠 Migraine Risk Card %cv${CARD_VERSION}`,
  'color: #ff6b6b; font-weight: bold; background: #1a1d23; padding: 4px 8px; border-radius: 4px;',
  'color: #888; background: #1a1d23; padding: 4px 8px; border-radius: 4px;'
);

/* ─── Factor Definitions ─────────────────────────────────────────── */

const FACTORS = {
  pressure_6h: {
    name: 'Pressure 6h',
    icon: 'mdi:gauge',
    unit: '',
    maxPts: 4,
    configKey: 'entity_pressure_6h',
    label: 'Pressure Change (6h)',
    thresholds: [[4,1],[6,2],[10,3],[14,4]],
  },
  pressure_24h: {
    name: 'Pressure 24h',
    icon: 'mdi:hours-24',
    unit: '',
    maxPts: 3,
    configKey: 'entity_pressure_24h',
    label: 'Pressure Change (24h)',
    thresholds: [[3,1],[6,2],[10,3]],
  },
  humidity: {
    name: 'Humidity',
    icon: 'mdi:water-percent',
    unit: '%',
    maxPts: 2,
    configKey: 'entity_humidity',
    label: 'Humidity',
    thresholds: [[70,1],[80,2]],
  },
  temperature: {
    name: 'Temperature',
    icon: 'mdi:thermometer',
    unit: '°',
    maxPts: 2,
    configKey: 'entity_temperature',
    label: 'Current Temperature',
    scoreFn: v => (v < 5 || v > 35) ? 2 : (v < 10 || v > 30) ? 1 : 0,
  },
  temperature_change: {
    name: 'Temp Change',
    icon: 'mdi:thermometer-chevron-up',
    unit: '°',
    maxPts: 2,
    configKey: 'entity_temperature_change',
    label: 'Temperature Change (6h)',
    thresholds: [[3,1],[6,2]],
  },
  wind: {
    name: 'Wind',
    icon: 'mdi:weather-windy',
    unit: 'km/h',
    maxPts: 2,
    configKey: 'entity_wind_speed',
    label: 'Wind Speed',
    thresholds: [[30,1],[50,2]],
  },
  uv: {
    name: 'UV',
    icon: 'mdi:sun-wireless',
    unit: '',
    maxPts: 2,
    configKey: 'entity_uv_index',
    label: 'UV Index',
    thresholds: [[5,1],[8,2]],
  },
  thunderstorm: {
    name: 'Storm',
    icon: 'mdi:weather-lightning',
    unit: '',
    maxPts: 2,
    configKey: 'entity_storm',
    label: 'Storm / Lightning',
    scoreFn: v => Math.min(Math.round(parseFloat(v) || 0), 2),
  },
  air_quality: {
    name: 'AQI',
    icon: 'mdi:air-filter',
    unit: '',
    maxPts: 3,
    configKey: 'entity_air_quality',
    label: 'Air Quality (AQI)',
    thresholds: [[50,1],[100,2],[150,3]],
  },
};

const FACTOR_KEYS = Object.keys(FACTORS);

const STORM_DISPLAY = { '0': 'Clear', '1': 'Risk', '2': 'Storm' };

const RISK_COLOURS = {
  'Low':       '#4ade80',
  'Moderate':  '#facc15',
  'High':      '#f97316',
  'Very High': '#ef4444',
};

const WEATHER_ICONS = {
  'mostly_sunny': 'mdi:weather-partly-cloudy', 'sunny': 'mdi:weather-sunny', 'clear': 'mdi:weather-sunny',
  'partly_cloudy': 'mdi:weather-partly-cloudy', 'cloudy': 'mdi:weather-cloudy', 'mostly_cloudy': 'mdi:weather-cloudy',
  'rain': 'mdi:weather-pouring', 'heavy_rain': 'mdi:weather-pouring', 'drizzle': 'mdi:weather-rainy',
  'shower': 'mdi:weather-rainy', 'showers': 'mdi:weather-rainy',
  'storm': 'mdi:weather-lightning-rainy', 'thunderstorm': 'mdi:weather-lightning',
  'snow': 'mdi:weather-snowy', 'hail': 'mdi:weather-hail', 'fog': 'mdi:weather-fog', 'wind': 'mdi:weather-windy',
};

/* ─── Scoring Engine ─────────────────────────────────────────────── */

function scoreFromThresholds(value, thresholds) {
  let pts = 0;
  for (const [min, score] of thresholds) {
    if (value >= min) pts = score;
  }
  return pts;
}

function computeFactorPoints(factorKey, rawValue) {
  const def = FACTORS[factorKey];
  if (!def || rawValue == null) return 0;
  if (def.scoreFn) return def.scoreFn(rawValue);
  if (def.thresholds) return scoreFromThresholds(Math.abs(rawValue), def.thresholds);
  return 0;
}

function scoreToLevel(score, maxScore) {
  if (maxScore === 0) return 'Low';
  const pct = score / maxScore;
  if (pct >= 0.7) return 'Very High';
  if (pct >= 0.45) return 'High';
  if (pct >= 0.25) return 'Moderate';
  return 'Low';
}

/* ─── Helpers ────────────────────────────────────────────────────── */

function pointColour(pts) {
  if (pts <= 0) return '#4ade80';
  if (pts === 1) return '#facc15';
  if (pts === 2) return '#f97316';
  return '#ef4444';
}

function riskColour(level) {
  return RISK_COLOURS[level] || '#4ade80';
}

function parseNum(val) {
  if (val == null || val === 'unavailable' || val === 'unknown') return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function fmtNum(n) {
  if (n == null) return '?';
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function ensureFonts() {
  if (document.querySelector('link[data-migraine-fonts]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.migraineFonts = '';
  link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,500;9..40,700&family=Space+Mono:wght@400;700&display=swap';
  document.head.appendChild(link);
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const CARD_STYLES = `
  :host {
    display: block;
    --risk-color: #4ade80;
    --forecast-color: #4ade80;
  }

  .card {
    background: #1a1d23;
    border-radius: 20px;
    padding: 28px 24px 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
    position: relative;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    color: #e0e0e0;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: var(--risk-color);
    opacity: 0.8;
  }

  /* ── Gauge ── */
  .gauge-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 8px;
  }

  .gauge-svg {
    width: 220px;
    height: 130px;
    overflow: visible;
  }

  .gauge-track {
    fill: none;
    stroke: #2a2d35;
    stroke-width: 14;
    stroke-linecap: round;
  }

  .gauge-fill {
    fill: none;
    stroke: var(--risk-color);
    stroke-width: 14;
    stroke-linecap: round;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1),
                stroke 0.6s ease;
    filter: drop-shadow(0 0 8px var(--risk-color));
  }

  .gauge-score {
    font-family: 'Space Mono', monospace;
    font-size: 42px;
    font-weight: 700;
    fill: #fff;
    text-anchor: middle;
    dominant-baseline: auto;
  }

  .gauge-max {
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    fill: #555;
    text-anchor: middle;
  }

  .risk-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--risk-color);
    text-align: center;
    margin-top: 2px;
  }

  /* ── Factors ── */
  .factors-header {
    font-family: 'Space Mono', monospace;
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #444;
    margin: 18px 0 10px;
  }

  .factors-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .factor {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: #22252c;
    border-radius: 10px;
    border-left: 3px solid var(--f-color, #4ade80);
    opacity: 0;
    animation: fadeUp 0.5s ease both;
  }

  .factor:nth-child(1) { animation-delay: 0.30s; }
  .factor:nth-child(2) { animation-delay: 0.37s; }
  .factor:nth-child(3) { animation-delay: 0.44s; }
  .factor:nth-child(4) { animation-delay: 0.51s; }
  .factor:nth-child(5) { animation-delay: 0.58s; }
  .factor:nth-child(6) { animation-delay: 0.65s; }
  .factor:nth-child(7) { animation-delay: 0.72s; }
  .factor:nth-child(8) { animation-delay: 0.79s; }
  .factor:nth-child(9) { animation-delay: 0.86s; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  .factor-icon {
    flex-shrink: 0;
    --mdc-icon-size: 18px;
    color: var(--f-color);
  }
  .factor-icon ha-icon {
    display: block;
    width: 18px;
    height: 18px;
  }

  .factor-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .factor-name {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .factor-value {
    font-family: 'Space Mono', monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--f-color);
  }

  /* ── Forecast ── */
  .forecast {
    margin-top: 14px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #1e2128, #22252c);
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(255,255,255,0.04);
    opacity: 0;
    animation: fadeUp 0.5s ease 1s both;
  }

  .forecast-icon {
    flex-shrink: 0;
    --mdc-icon-size: 24px;
    color: var(--forecast-color);
  }
  .forecast-icon ha-icon {
    display: block;
    width: 24px;
    height: 24px;
  }

  .forecast-details { flex: 1; min-width: 0; }

  .forecast-title {
    font-size: 10px;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .forecast-risk {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    font-weight: 700;
    color: var(--forecast-color);
  }

  .forecast-meta {
    font-size: 11px;
    color: #666;
    margin-top: 1px;
  }

  .forecast-badge {
    font-family: 'Space Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    color: var(--forecast-color);
    flex-shrink: 0;
  }

  /* ── Error / Empty ── */
  .error {
    padding: 16px;
    font-family: 'DM Sans', sans-serif;
    color: #ef4444;
    font-size: 13px;
    line-height: 1.5;
  }
  .error b { display: block; margin-bottom: 4px; }

  .empty-msg {
    text-align: center;
    padding: 20px;
    color: #555;
    font-size: 12px;
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   Card Element
   ═══════════════════════════════════════════════════════════════════ */

class MigraineRiskCard extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._built = false;
    this._prevHash = '';
  }

  static getConfigElement() {
    return document.createElement('migraine-risk-card-editor');
  }

  static getStubConfig(hass) {
    const ids = Object.keys(hass.states);
    const find = (p) => ids.find(id => id.includes(p)) || '';
    const cfg = { type: 'custom:migraine-risk-card' };
    // Auto-detect integration entities
    const rs = find('migraine_risk_score');
    if (rs) cfg.entity_risk_score = rs;
    const rl = find('migraine_risk_level');
    if (rl) cfg.entity_risk_level = rl;
    const fc = find('migraine_risk_forecast');
    if (fc) cfg.entity_forecast = fc;
    // Factor entities
    const map = {
      entity_pressure_6h: 'pressure_drop_6h',
      entity_pressure_24h: 'pressure_drop_24h',
      entity_humidity: 'migraine_humidity',
      entity_temperature: 'migraine_temperature',
      entity_temperature_change: 'temperature_change',
      entity_wind_speed: 'migraine_wind',
      entity_uv_index: 'migraine_uv',
      entity_storm: 'thunderstorm',
      entity_air_quality: 'waqi_aqi',
    };
    for (const [key, pattern] of Object.entries(map)) {
      const e = find(pattern);
      if (e) cfg[key] = e;
    }
    return cfg;
  }

  setConfig(config) {
    // No required entities — card shows what's configured
    this._config = { ...config };
  }

  set hass(hass) {
    this._hass = hass;
    const hash = this._stateHash();
    if (hash !== this._prevHash) {
      this._prevHash = hash;
      this._update();
    }
  }

  getCardSize() { return 5; }

  /* ── Which factors are configured? ── */

  _activeFactors() {
    return FACTOR_KEYS.filter(k => {
      const eid = this._config[FACTORS[k].configKey];
      return eid && eid.length > 0;
    });
  }

  /* ── State hash ── */

  _stateHash() {
    const h = this._hass;
    if (!h) return '';
    const c = this._config;
    let s = '';
    if (c.entity_risk_score) s += h.states[c.entity_risk_score]?.state || '';
    if (c.entity_risk_level) s += h.states[c.entity_risk_level]?.state || '';
    if (c.entity_forecast) s += h.states[c.entity_forecast]?.state || '';
    for (const k of FACTOR_KEYS) {
      const eid = c[FACTORS[k].configKey];
      if (eid) s += h.states[eid]?.state || '';
    }
    return s;
  }

  /* ── Determine mode: integration vs standalone ── */

  _hasIntegration() {
    const c = this._config;
    return c.entity_risk_score && this._hass.states[c.entity_risk_score];
  }

  /* ── Build / Update ── */

  _update() {
    if (!this._hass || !this._config) return;
    ensureFonts();
    if (!this._built) this._build();
    this._refresh();
  }

  _build() {
    const sr = this.shadowRoot;
    sr.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = CARD_STYLES;
    sr.appendChild(style);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="gauge-wrap">
        <svg class="gauge-svg" viewBox="0 0 200 110">
          <path class="gauge-track" d="M 20 100 A 80 80 0 0 1 180 100"/>
          <path class="gauge-fill"  d="M 20 100 A 80 80 0 0 1 180 100"
                stroke-dasharray="251.33" stroke-dashoffset="251.33"/>
          <text class="gauge-score" x="100" y="90"></text>
          <text class="gauge-max"   x="100" y="108"></text>
        </svg>
        <div class="risk-label"></div>
      </div>
      <div class="factors-header">Contributing Factors</div>
      <div class="factors-grid"></div>
    `;
    sr.appendChild(card);

    this._els = {
      card,
      gaugeFill:  card.querySelector('.gauge-fill'),
      gaugeScore: card.querySelector('.gauge-score'),
      gaugeMax:   card.querySelector('.gauge-max'),
      riskLabel:  card.querySelector('.risk-label'),
      factorsHdr: card.querySelector('.factors-header'),
      factorGrid: card.querySelector('.factors-grid'),
    };
    this._built = true;
  }

  _refresh() {
    const h = this._hass;
    const c = this._config;
    const el = this._els;
    const active = this._activeFactors();

    // Nothing configured at all
    if (active.length === 0 && !c.entity_risk_score) {
      el.factorsHdr.style.display = 'none';
      el.factorGrid.innerHTML = '<div class="empty-msg">Configure entity sensors in the card editor to get started.</div>';
      el.gaugeScore.textContent = '—';
      el.gaugeMax.textContent = '';
      el.riskLabel.textContent = 'NO DATA';
      el.card.style.setProperty('--risk-color', '#555');
      el.gaugeFill.setAttribute('stroke-dashoffset', '251.33');
      return;
    }
    el.factorsHdr.style.display = '';

    // Compute per-factor points and total score
    let totalScore = 0;
    let maxScore = 0;
    const factorData = []; // { key, pts, value, entity }

    const useIntegration = this._hasIntegration();
    const riskScoreState = useIntegration ? h.states[c.entity_risk_score] : null;

    for (const key of active) {
      const def = FACTORS[key];
      const eid = c[def.configKey];
      const entity = h.states[eid];
      const rawVal = parseNum(entity?.state);

      let pts;
      if (useIntegration && riskScoreState) {
        // Integration mode: read points from risk_score attributes
        pts = riskScoreState.attributes?.[key + '_points'] ?? computeFactorPoints(key, rawVal);
      } else {
        // Standalone mode: compute from raw value
        pts = computeFactorPoints(key, rawVal);
      }

      totalScore += pts;
      maxScore += def.maxPts;
      factorData.push({ key, pts, entity, def });
    }

    // If integration provides a pre-computed score, use that instead
    if (useIntegration && riskScoreState) {
      totalScore = parseNum(riskScoreState.state) ?? totalScore;
    }

    // Determine max_score — integration may have factors we don't show
    if (useIntegration && riskScoreState) {
      // Use configured max or sum of all possible factor maxPts
      maxScore = c.max_score || FACTOR_KEYS.reduce((sum, k) => sum + FACTORS[k].maxPts, 0);
    } else {
      maxScore = maxScore || 1; // Avoid division by zero
    }

    // Risk level
    let level;
    if (c.entity_risk_level && h.states[c.entity_risk_level]) {
      level = h.states[c.entity_risk_level].state;
    } else {
      level = scoreToLevel(totalScore, maxScore);
    }

    const colour = riskColour(level);
    el.card.style.setProperty('--risk-color', colour);

    // Gauge
    const pct = Math.min(totalScore / maxScore, 1);
    el.gaugeFill.setAttribute('stroke-dashoffset', 251.33 * (1 - pct));
    el.gaugeScore.textContent = Math.round(totalScore);
    el.gaugeMax.textContent = '/' + maxScore;
    el.riskLabel.textContent = level.toUpperCase();

    // Factor grid
    this._refreshFactors(factorData);

    // Forecast
    this._refreshForecast(el.card);
  }

  _refreshFactors(factorData) {
    const grid = this._els.factorGrid;

    if (grid.children.length !== factorData.length) {
      grid.innerHTML = '';
      factorData.forEach(() => {
        const tile = document.createElement('div');
        tile.className = 'factor';
        tile.innerHTML = `
          <div class="factor-icon"></div>
          <div class="factor-info">
            <div class="factor-name"></div>
            <div class="factor-value"></div>
          </div>`;
        grid.appendChild(tile);
      });
    }

    factorData.forEach(({ key, pts, entity, def }, i) => {
      const tile = grid.children[i];
      const colour = pointColour(pts);
      tile.style.setProperty('--f-color', colour);

      const iconEl = tile.querySelector('.factor-icon');
      if (!iconEl.querySelector('ha-icon')) {
        iconEl.innerHTML = '';
        const haIcon = document.createElement('ha-icon');
        haIcon.setAttribute('icon', def.icon);
        iconEl.appendChild(haIcon);
      } else {
        iconEl.querySelector('ha-icon').setAttribute('icon', def.icon);
      }

      tile.querySelector('.factor-name').textContent = def.name;
      tile.querySelector('.factor-value').textContent = this._fmtFactor(entity, key, def);
    });
  }

  _fmtFactor(entity, key, def) {
    if (!entity) return '?';
    const st = entity.state;
    if (st === 'unavailable' || st === 'unknown') return '—';
    if (key === 'thunderstorm') return STORM_DISPLAY[st] || st;
    const n = parseNum(st);
    if (n == null) return st;
    const unit = entity.attributes?.unit_of_measurement || def.unit || '';
    return fmtNum(n) + unit;
  }

  _refreshForecast(card) {
    const fid = this._config.entity_forecast;
    if (!fid) {
      const existing = card.querySelector('.forecast');
      if (existing) existing.remove();
      return;
    }
    const entity = this._hass.states[fid];
    if (!entity) return;

    let bar = card.querySelector('.forecast');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'forecast';
      bar.innerHTML = `
        <div class="forecast-icon"></div>
        <div class="forecast-details">
          <div class="forecast-title">Tomorrow's Forecast</div>
          <div class="forecast-risk"></div>
          <div class="forecast-meta"></div>
        </div>
        <div class="forecast-badge"></div>`;
      card.appendChild(bar);
    }

    const attrs = entity.attributes || {};
    const fScore = parseNum(entity.state) ?? 0;
    const fLevel = attrs.risk_level || 'Low';
    const fColour = riskColour(fLevel);
    card.style.setProperty('--forecast-color', fColour);

    const fIconEl = bar.querySelector('.forecast-icon');
    const fIconName = WEATHER_ICONS[attrs.icon_descriptor] || 'mdi:weather-partly-cloudy';
    if (!fIconEl.querySelector('ha-icon')) {
      fIconEl.innerHTML = '';
      const hi = document.createElement('ha-icon');
      hi.setAttribute('icon', fIconName);
      fIconEl.appendChild(hi);
    } else {
      fIconEl.querySelector('ha-icon').setAttribute('icon', fIconName);
    }

    bar.querySelector('.forecast-risk').textContent = `${fLevel} (${Math.round(fScore)} pts)`;
    bar.querySelector('.forecast-meta').textContent =
      `${attrs.temp_min || '—'}–${attrs.temp_max || '—'} · UV ${attrs.uv_index ?? '—'} · Rain ${attrs.rain_chance || '—'}`;
    bar.querySelector('.forecast-badge').textContent = Math.round(fScore);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   Config Editor — Platinum Weather Card style
   ═══════════════════════════════════════════════════════════════════ */

class MigraineRiskCardEditor extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._rendered = false;
  }

  set hass(hass) {
    this._hass = hass;
    // Update pickers with hass reference
    if (this._rendered) {
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(p => {
        p.hass = hass;
      });
    }
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  _render() {
    const sr = this.shadowRoot;
    sr.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; padding: 8px; }
      .section {
        margin-bottom: 16px;
        padding: 12px;
        background: var(--card-background-color, rgba(0,0,0,0.05));
        border-radius: 12px;
      }
      .section-title {
        font-weight: 700;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--primary-text-color);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .field {
        margin-bottom: 8px;
      }
      .field-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        margin-bottom: 2px;
      }
      ha-entity-picker {
        display: block;
        width: 100%;
      }
      .hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        font-style: italic;
        margin-top: 4px;
        opacity: 0.7;
      }
    `;
    sr.appendChild(style);

    const container = document.createElement('div');

    // ── Section: Integration (optional) ──
    container.appendChild(this._section(
      'mdi:connection', 'Integration (Optional)',
      'If you have the Migraine Risk integration, these provide pre-computed scores.',
      [
        { key: 'entity_risk_score', label: 'Risk Score Entity' },
        { key: 'entity_risk_level', label: 'Risk Level Entity' },
        { key: 'entity_forecast',   label: 'Forecast Entity' },
      ]
    ));

    // ── Section: Weather Sensors ──
    const weatherFields = FACTOR_KEYS.map(k => ({
      key: FACTORS[k].configKey,
      label: FACTORS[k].label,
    }));
    container.appendChild(this._section(
      'mdi:weather-partly-cloudy', 'Weather Sensors',
      'Select any weather entities you have. Only configured sensors will appear on the card.',
      weatherFields
    ));

    sr.appendChild(container);
    this._rendered = true;

    // Set hass on all pickers
    if (this._hass) {
      sr.querySelectorAll('ha-entity-picker').forEach(p => {
        p.hass = this._hass;
      });
    }
  }

  _section(icon, title, hint, fields) {
    const section = document.createElement('div');
    section.className = 'section';

    const titleEl = document.createElement('div');
    titleEl.className = 'section-title';
    titleEl.innerHTML = `<ha-icon icon="${icon}"></ha-icon> ${title}`;
    section.appendChild(titleEl);

    if (hint) {
      const hintEl = document.createElement('div');
      hintEl.className = 'hint';
      hintEl.textContent = hint;
      hintEl.style.marginBottom = '12px';
      section.appendChild(hintEl);
    }

    for (const { key, label } of fields) {
      const field = document.createElement('div');
      field.className = 'field';

      const lbl = document.createElement('div');
      lbl.className = 'field-label';
      lbl.textContent = label;
      field.appendChild(lbl);

      const picker = document.createElement('ha-entity-picker');
      picker.allow_custom = true;
      picker.value = this._config[key] || '';
      picker.label = label;
      picker.addEventListener('value-changed', (e) => {
        const val = e.detail?.value || '';
        if (val) {
          this._config[key] = val;
        } else {
          delete this._config[key];
        }
        this._fire();
      });
      field.appendChild(picker);

      section.appendChild(field);
    }

    return section;
  }

  _fire() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
    }));
  }
}

/* ─── Register ───────────────────────────────────────────────────── */

customElements.define('migraine-risk-card', MigraineRiskCard);
customElements.define('migraine-risk-card-editor', MigraineRiskCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'migraine-risk-card',
  name: 'Migraine Risk Card',
  description: 'Science-backed migraine risk visualisation with real-time factor tracking and forecasting.',
  preview: false,
});
