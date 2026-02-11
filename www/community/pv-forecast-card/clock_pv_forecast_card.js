// clock_pv_forecast_card.js


const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

console.info("📦 clock-pv-forecast-card v2.0.1 loaded (Smooth Operator)");

const translations = {
  en: { forecast: "Forecast", remaining: "Remaining", last_updated: "Last updated", today: "Today", tomorrow: "Tomorrow", error_config: "Configuration Error", error_entity: "At least one forecast entity must be defined", unavailable: "Unavailable", unknown: "Unknown" },
  de: { forecast: "Prognose", remaining: "Rest", last_updated: "Zuletzt aktualisiert", today: "Heute", tomorrow: "Morgen", error_config: "Konfigurationsfehler", error_entity: "Mindestens eine Prognose-Entität muss definiert sein", unavailable: "Nicht verfügbar", unknown: "Unbekannt" },
  fr: { forecast: "Prévisions", remaining: "Restant", last_updated: "Dernière mise à jour", today: "Aujourd'hui", tomorrow: "Demain", error_config: "Erreur de configuration", error_entity: "Au moins une entité de prévision doit être définie", unavailable: "Indisponible", unknown: "Inconnu" },
  es: { forecast: "Pronóstico", remaining: "Restante", last_updated: "Última actualización", today: "Hoy", tomorrow: "Mañana", error_config: "Error de configuración", error_entity: "Debe definirse al menos una entidad de pronóstico", unavailable: "No disponible", unknown: "Desconocido" },
  it: { forecast: "Previsione", remaining: "Rimanente", last_updated: "Ultimo aggiornamento", today: "Oggi", tomorrow: "Domani", error_config: "Errore di configurazione", error_entity: "Deve essere definita almeno un'entità di previsione", unavailable: "Non disponibile", unknown: "Sconosciuto" },
  nl: { forecast: "Verwachting", remaining: "Resterend", last_updated: "Laatst bijgewerkt", today: "Vandaag", tomorrow: "Morgen", error_config: "Configuratiefout", error_entity: "Ten minste één prognose-entiteit moet worden gedefinieerd", unavailable: "Niet beschikbaar", unknown: "Onbekend" }
};

class ClockPvForecastCard extends LitElement {
  static properties = { hass: {}, config: {} };

  static getConfigElement() {
    return document.createElement("clock-pv-forecast-card-editor");
  }

  static getStubConfig() {
    return {
      entity_today: "sensor.energy_production_today",
      entity_tomorrow: "sensor.energy_production_tomorrow",
      max_value: 50,
      display_mode: "weekday",
      bar_style: "gradient",
      bar_type: "smooth"
    };
  }

  constructor() {
    super();
    this._weekdayCache = {};
    this._dateCache = {};
    this._configError = null;
  }

  _localize(key) {
    const lang = this.hass?.locale?.language || 'en';
    const dict = translations[lang] || translations[lang.split('-')[0]] || translations['en'];
    return dict[key] || translations['en'][key];
  }

  setConfig(config) {
    if (!config) { this._configError = "config_missing"; return; }
    this.config = {
      animation_duration: '1s',
      bar_color_start: '#3498db',
      bar_color_end: '#2ecc71',
      bar_style: 'gradient',
      bar_type: 'smooth',
      color_thresholds: [{ value: 0, color: '#e74c3c' }, { value: 10, color: '#f1c40f' }, { value: 20, color: '#2ecc71' }],
      remaining_color_start: '#999999',
      remaining_color_end: '#cccccc',
      remaining_threshold: null,
      remaining_low_color_start: '#e74c3c',
      remaining_low_color_end: '#e67e22',
      remaining_blink: false,
      max_value: 100,
      weekday_format: 'short',
      display_mode: 'weekday',
      date_format: 'short',
      relative_plus_one: false,
      day_column_width: '',
      entity_remaining: null,
      remaining_label: null,
      remaining_indicator: 'bar',
      remaining_inverted: false,
      marker_color: '#2c3e50',
      gradient_fixed: false,
      show_tooltips: false,
      scale_mode: 'fixed',
      forecast_attribute: null,
      show_attribute_value: false,
      attribute_color: '#f39c12',
      bar_shape: 'rounded',
      ...config
    };

    const entityKeys = ['entity_today', 'entity_tomorrow', ...Array.from({ length: 11 }, (_, i) => `entity_day${i + 3}`)];
    const hasEntity = entityKeys.some(key => this.config[key]);
    this._configError = hasEntity ? null : "entity_missing";

    if (!this.config.day_column_width) {
      if (this.config.display_mode === 'date') this.config.day_column_width = '3.5em';
      else if (this.config.display_mode === 'relative') this.config.day_column_width = '2.5em';
      else {
        const map = { narrow: '1.5em', short: '2.5em', long: '5em' };
        this.config.day_column_width = map[this.config.weekday_format] || '2.5em';
      }
    }

    this._weekdayCache = {};
    this._dateCache = {};
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('config')) return true;
    if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass');
      if (!oldHass || !this.config) return true;
      if (oldHass.locale?.language !== this.hass.locale?.language) {
        this._weekdayCache = {};
        this._dateCache = {};
        return true;
      }
      const check = ['entity_today', 'entity_tomorrow', 'entity_day3', 'entity_day4', 'entity_day5', 'entity_day6', 'entity_day7', 'entity_day8', 'entity_day9', 'entity_day10', 'entity_day11', 'entity_day12', 'entity_day13', 'entity_remaining'];
      for (const c of check) {
        const e = this.config[c];
        if (e && oldHass.states[e] !== this.hass.states[e]) return true;
      }
    }
    return false;
  }

  render() {
    if (this._configError) {
      const errorTitle = this._localize('error_config');
      const errorMsg = this._configError === 'config_missing' ? 'Configuration is required' : this._localize('error_entity');
      return html`
        <ha-card style="padding: 16px; background-color: var(--error-color, #e74c3c); color: var(--text-primary-color, white);">
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ ${errorTitle}</div>
            <div>${errorMsg}</div>
        </ha-card>`;
    }

    const forecast = [];
    const entityKeys = ['entity_today', 'entity_tomorrow', ...Array.from({ length: 11 }, (_, i) => `entity_day${i + 3}`)];

    entityKeys.forEach((key, index) => {
      if (this.config[key]) {
        forecast.push({ offset: index, entity: this.config[key] });
      }
    });

    const maxValue = this._getForecastMaxValue();

    return html`
      <ha-card>
        <div class="forecast-rows" role="table" aria-label="${this._localize('forecast')}">
          ${this.config.entity_remaining && this.config.remaining_indicator === 'bar' ? this._renderRemainingBar(maxValue) : ''}
          ${forecast.map((item, index) => this._renderForecastRow(item, index, maxValue))}
        </div>
      </ha-card>
    `;
  }

  _getThresholdColor(value) {
    const thresholds = this.config.color_thresholds || [];
    const sorted = [...thresholds].sort((a, b) => b.value - a.value);
    for (const t of sorted) {
      if (value >= t.value) return t.color;
    }
    return this.config.bar_color_start;
  }

  _renderForecastRow(item, index, maxValue) {
    const entityState = this.hass.states[item.entity];

    if (!entityState || ['unavailable', 'unknown'].includes(entityState.state)) {
      return this._renderErrorRow(item, index, this.hass.localize(`state.default.${entityState?.state}`) || this._localize(entityState?.state || 'unavailable'));
    }

    const value = parseFloat(entityState.state ?? '0');
    if (isNaN(value)) return this._renderErrorRow(item, index, this._localize('unknown'));

    const dayLabel = this._getDayLabel(item.offset);

    const rowMax = this.config.scale_mode === 'daily' ? (value > 0 ? value : 1) : maxValue;
    const barWidthVal = this._barWidth(value, rowMax);

    let backgroundValue;
    if (this.config.bar_style === 'solid') {
      backgroundValue = this._getThresholdColor(value);
    } else if (this.config.bar_style === 'tiered') {
      // For tiered, we always want the segments to be relative to the GLOBAL scale (maxValue),
      // so that "10kWh" looks the same width on every bar.
      backgroundValue = this._getTieredBackground(maxValue);
    } else {
      backgroundValue = `linear-gradient(to right, ${this.config.bar_color_start}, ${this.config.bar_color_end})`;
    }

    const barStyle = `--bar-width: ${barWidthVal}%; --bar-bg: ${backgroundValue}; --animation-time: ${this.config.animation_duration}`;
    const barTypeClass = this.config.bar_type ? `type-${this.config.bar_type}` : 'type-smooth';
    const barShapeClass = `shape-${this.config.bar_shape || 'rounded'}`;
    const isFixedGradient = this.config.gradient_fixed || this.config.bar_style === 'tiered';

    let attributeMarker = '';
    let attributeText = '';

    if (this.config.forecast_attribute && entityState.attributes[this.config.forecast_attribute] !== undefined) {
      const attrVal = parseFloat(entityState.attributes[this.config.forecast_attribute]);
      if (!isNaN(attrVal)) {
        // Markers should also be relative to global max in fixed/tiered modes for consistency? 
        // Current logic uses rowMax which is correct for bar position.
        const attrPos = this._barWidth(attrVal, rowMax);
        attributeMarker = html`<div class="attribute-marker" style="left: ${attrPos}%; --attr-color: ${this.config.attribute_color || '#f39c12'};"></div>`;
        // Optional: Add to tooltip or text? For now, just marker as requested "visual all the time"
      }
    }

    let remainingDot = '';
    let remainingText = '';

    if (item.offset === 0 && this.config.remaining_indicator === 'marker' && this.config.entity_remaining) {
      const remainingState = this.hass.states[this.config.entity_remaining];
      if (remainingState && !['unavailable', 'unknown', null].includes(remainingState.state)) {
        const remaining = parseFloat(remainingState.state);

        if (!isNaN(remaining) && remaining >= 0 && value > 0) {
          let positionPercent;
          let translateVal;

          if (this.config.remaining_inverted) {
            const ratio = Math.min(remaining / value, 1.0);
            positionPercent = ratio * barWidthVal;
            translateVal = '-100%';
          } else {
            const consumed = Math.max(0, value - remaining);
            const ratio = consumed / value;
            positionPercent = ratio * barWidthVal;
            translateVal = '0';
          }

          remainingDot = html`
            <div class="remaining-dot" 
                 style="left: ${positionPercent}%; --marker-color: ${this.config.marker_color}"
                 title="${this._localize('remaining')}: ${this._formatValue(remaining, this.config.entity_remaining)}">
            </div>`;

          remainingText = html`
            <div class="remaining-text-inside" 
                 style="left: ${positionPercent}%;">
              ${this._formatValue(remaining, this.config.entity_remaining)}
            </div>`;
        }
      }
    }

    let displayValue = this._formatValue(value, item.entity);
    if (this.config.show_attribute_value && this.config.forecast_attribute && entityState.attributes[this.config.forecast_attribute] !== undefined) {
      const attrVal = parseFloat(entityState.attributes[this.config.forecast_attribute]);
      if (!isNaN(attrVal)) {
        displayValue += ` (${this._formatNumberOnly(attrVal)})`;
      }
    }

    return html`
      <div class="forecast-row" role="row">
        <div class="day" role="cell" style="width: ${this.config.day_column_width}">${dayLabel}</div>
        <div class="bar-container ${barShapeClass} ${isFixedGradient ? 'fixed-gradient' : ''}" role="cell">
          <div class="bar ${barTypeClass} ${barShapeClass}" style="${barStyle}"></div>
          ${attributeMarker}
          ${remainingDot}${remainingText}
          ${this.config.show_tooltips ? this._renderTooltip(value, item.entity, dayLabel) : ''}
        </div>
        <div class="value" role="cell">${displayValue}</div>
      </div>`;
  }

  _getTieredBackground(max) {
    if (max <= 0) return this.config.bar_color_start;

    // Sort thresholds: e.g. [{0, red}, {10, yellow}, {20, green}]
    // We need to fill the bar from 0 to 100% (where 100% = max)
    // Range 0 -> 10 (value) : 0% -> 10/max % : Color Red
    // Range 10 -> 20 (value) : 10/max % -> 20/max % : Color Yellow
    // Range 20 -> max (value) : 20/max % -> 100% : Color Green

    let thresholds = this.config.color_thresholds || [];
    // Ensure we have a sorted list
    thresholds = [...thresholds].sort((a, b) => a.value - b.value);

    // If no thresholds, fallback
    if (thresholds.length === 0) return this.config.bar_color_start;

    let gradientStops = [];

    // Iterate thresholds
    for (let i = 0; i < thresholds.length; i++) {
      const current = thresholds[i];
      const next = thresholds[i + 1]; // undefined if last

      const startVal = current.value;
      const endVal = next ? next.value : max; // if last, go to max

      // Convert to percentages relative to max
      const startP = Math.max(0, Math.min((startVal / max) * 100, 100));
      const endP = Math.max(0, Math.min((endVal / max) * 100, 100));

      // If range is valid (start < end)
      if (endP > startP) {
        gradientStops.push(`${current.color} ${startP}%`);
        gradientStops.push(`${current.color} ${endP}%`);
      }
    }

    if (gradientStops.length === 0) return this.config.bar_color_start;

    return `linear-gradient(to right, ${gradientStops.join(', ')})`;
  }

  _renderErrorRow(item, index, errorMessage) {
    const dayLabel = this._getDayLabel(item.offset);
    return html`
        <div class="forecast-row error" role="row">
            <div class="day" role="cell" style="width: ${this.config.day_column_width}">${dayLabel}</div>
            <div class="bar-container error" role="cell">
                <div class="error-text">${errorMessage}</div>
            </div>
            <div class="value error" role="cell">--</div>
        </div>`;
  }

  _renderRemainingBar(maxValue) {
    const entityState = this.hass.states[this.config.entity_remaining];
    const remainingLabel = this.config.remaining_label || this._localize('remaining');

    if (!entityState || ['unavailable', 'unknown'].includes(entityState.state)) {
      return this._errorBar(remainingLabel, this.hass.localize(`state.default.${entityState?.state}`) || this._localize('unavailable'));
    }

    const remaining = parseFloat(entityState.state ?? '0');
    if (isNaN(remaining)) return this._errorBar(remainingLabel, this._localize('unknown'));

    const belowThreshold = this.config.remaining_threshold !== null && remaining <= this.config.remaining_threshold;
    const start = belowThreshold ? this.config.remaining_low_color_start : this.config.remaining_color_start;
    const end = belowThreshold ? this.config.remaining_low_color_end : this.config.remaining_color_end;

    const barStyle = `--bar-width: ${this._barWidth(remaining, maxValue)}%; --bar-bg: linear-gradient(to left, ${start}, ${end}); --animation-time: ${this.config.animation_duration}`;
    const blinkClass = belowThreshold && this.config.remaining_blink ? 'blink' : '';
    const barTypeClass = this.config.bar_type ? `type-${this.config.bar_type}` : 'type-smooth';
    const barShapeClass = `shape-${this.config.bar_shape || 'rounded'}`;

    return html`
        <div class="forecast-row">
            <div class="day" style="width: ${this.config.day_column_width}">${remainingLabel}</div>
            <div class="bar-container rtl ${barShapeClass} ${(this.config.gradient_fixed || this.config.bar_style === 'tiered') ? 'fixed-gradient' : ''}">
                <div class="bar ${blinkClass} ${barTypeClass} ${barShapeClass}" style="${barStyle}"></div>
                ${this.config.show_tooltips ? this._renderTooltip(remaining, this.config.entity_remaining, remainingLabel) : ''}
            </div>
            <div class="value">${this._formatValue(remaining, this.config.entity_remaining)}</div>
        </div>`;
  }

  _errorBar(label, msg) {
    return html`
        <div class="forecast-row error">
            <div class="day" style="width: ${this.config.day_column_width}">${label}</div>
            <div class="bar-container error">
                <div class="error-text">${msg}</div>
            </div>
            <div class="value error">--</div>
        </div>`;
  }

  _renderTooltip(value, entity, dayLabel) {
    const state = this.hass.states[entity];
    let lastUpdated = this._localize('unknown');
    if (state?.last_updated) lastUpdated = new Date(state.last_updated).toLocaleString(this.hass.locale?.language || undefined);

    return html`
        <div class="tooltip">
            <div class="tooltip-content">
                <strong>${dayLabel}</strong><br>
                ${this._localize('forecast')}: ${this._formatValue(value, entity)}<br>
                <small>${this._localize('last_updated')}: ${lastUpdated}</small>
            </div>
        </div>`;
  }

  _formatNumberOnly(value) { return new Intl.NumberFormat(this.hass.locale?.language || 'en', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value); }
  _formatValue(value, entity) { const unit = this.hass.states[entity]?.attributes?.unit_of_measurement || 'kWh'; return `${this._formatNumberOnly(value)} ${unit}`; }

  _getDayLabel(offset) {
    if (this.config.display_mode === 'date') return this._getDateLabel(offset);
    if (this.config.display_mode === 'relative') return this._getRelativeLabel(offset);
    return this._getWeekdayName(offset);
  }

  _getWeekdayName(offset) {
    const locale = this.hass.locale?.language || 'en';
    const cacheKey = `weekday-${offset}-${locale}-${this.config.weekday_format}`;
    if (!this._weekdayCache[cacheKey]) {
      const date = new Date(); date.setDate(date.getDate() + offset);
      this._weekdayCache[cacheKey] = date.toLocaleDateString(locale, { weekday: this.config.weekday_format });
    }
    return this._weekdayCache[cacheKey];
  }

  _getDateLabel(offset) {
    const locale = this.hass.locale?.language || 'en';
    const cacheKey = `date-${offset}-${locale}-${this.config.date_format}`;
    if (!this._dateCache[cacheKey]) {
      const date = new Date(); date.setDate(date.getDate() + offset);
      this._dateCache[cacheKey] = date.toLocaleDateString(locale, { day: 'numeric', month: this.config.date_format === 'numeric' ? 'numeric' : 'short' });
    }
    return this._dateCache[cacheKey];
  }

  _getRelativeLabel(offset) {
    if (offset === 0) return this._localize('today');
    if (offset === 1) return this.config.relative_plus_one ? '+1d' : this._localize('tomorrow');
    return `+${offset}d`;
  }

  _getForecastMaxValue() {
    if (!this.hass || !this.config) return 100;

    const configMax = parseFloat(this.config.max_value);
    const entityKeys = ['entity_today', 'entity_tomorrow', ...Array.from({ length: 11 }, (_, i) => `entity_day${i + 3}`)];
    const values = entityKeys
      .map(key => this.config[key])
      .filter(Boolean)
      .map(e => parseFloat(this.hass.states[e]?.state))
      .filter(v => !isNaN(v));

    const dataMax = values.length > 0 ? Math.max(...values) : 0;

    if (this.config.scale_mode === 'auto') {
      return dataMax > 0 ? this._roundUp5(dataMax) : 100;
    }

    if (!isNaN(configMax) && configMax > 0) {
      return Math.max(configMax, dataMax);
    }

    if (dataMax > 0) return this._roundUp5(dataMax);

    return 100;
  }

  _roundUp5(value) {
    if (value <= 0) return 5;  // fallback
    return Math.ceil(value / 5) * 5;
  }

  _barWidth(val, max) {
    if (max <= 0) return 0;
    return Math.min((val / max) * 100, 100);
  }


  static styles = css`
    .forecast-rows { display: flex; flex-direction: column; gap: 0.4em; padding: 1em; isolation: isolate; }
    .forecast-row { display: flex; align-items: center; gap: 0.8em; }
    .forecast-row.error { opacity: 0.6; }
    .day { text-align: right; font-weight: bold; color: var(--primary-text-color); }
    .bar-container { flex-grow: 1; height: 14px; background: var(--divider-color, #eee); border-radius: 7px; position: relative; overflow: visible; container-type: inline-size; }
    .bar-container.rtl { direction: rtl; }
    .bar-container.error { display: flex; align-items: center; justify-content: center; overflow: hidden; }
    
    .bar { height: 100%; border-radius: 7px; width: 0%; background: var(--bar-bg); animation: fill-bar var(--animation-time) ease-out forwards; }
    .bar-container.shape-sharp, .bar.shape-sharp { border-radius: 0; }
    .bar-container.fixed-gradient .bar { background-size: 100cqi; }
    .bar.blink { animation: fill-bar var(--animation-time) ease-out forwards, blink 1s infinite; }
    
    /* Bar Types */
    .bar.type-segmented {
      -webkit-mask-image: repeating-linear-gradient(to right, black 0, black 8px, transparent 8px, transparent 10px);
      mask-image: repeating-linear-gradient(to right, black 0, black 8px, transparent 8px, transparent 10px);
    }
    .bar.type-digital {
      -webkit-mask-image: repeating-linear-gradient(to right, black 0, black 3px, transparent 3px, transparent 4px);
      mask-image: repeating-linear-gradient(to right, black 0, black 3px, transparent 3px, transparent 4px);
    }

    .attribute-marker { position: absolute; top: 0; bottom: 0; width: 4px; background: var(--attr-color, #f39c12); opacity: 0.8; z-index: 5; transform: translateX(-50%); box-shadow: 0 0 4px rgba(0,0,0,0.4); border-radius: 2px; }
    .remaining-dot { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; border-radius: 50%; background: var(--marker-color, #2c3e50); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 2; cursor: help; }
    .remaining-text-inside { position: absolute; bottom: 100%; left: 0; transform: translate(-50%, -2px); background: rgba(0, 0, 0, 0.7); color: white; border-radius: 3px; font-size: 0.65em; font-weight: bold; padding: 1px 4px; z-index: 10; pointer-events: none; white-space: nowrap; }
    .value { min-width: 4.5em; text-align: right; font-size: 0.85em; font-weight: bold; white-space: nowrap; color: var(--secondary-text-color); }
    .value.error { color: var(--error-color, #e74c3c); }
    .error-text { font-size: 0.7em; color: var(--error-color, #e74c3c); text-align: center; }
    .tooltip { position: absolute; top: -60px; left: 50%; transform: translateX(-50%); background: var(--card-background-color, white); border: 1px solid var(--divider-color, #eee); border-radius: 4px; padding: 8px; font-size: 0.8em; box-shadow: 0 2px 8px rgba(0,0,0,0.15); opacity: 0; pointer-events: none; transition: opacity 0.2s; z-index: 20; white-space: nowrap; color: var(--primary-text-color); }
    .bar-container:hover .tooltip { opacity: 1; }
    .tooltip-content { text-align: center; }
    @keyframes fill-bar { to { width: var(--bar-width); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @media (max-width: 480px) { .forecast-rows { gap: 0.2em; padding: 0.5em; } .remaining-dot { width: 8px; height: 8px; border-width: 1px; } .remaining-text-inside { font-size: 0.6em; } .value { font-size: 0.75em; width: 3.5em; } .day { font-size: 0.85em; } .tooltip { top: -50px; font-size: 0.7em; } }
    @media (max-width: 320px) { .forecast-rows { gap: 0.1em; padding: 0.3em; } .forecast-row { gap: 0.4em; } .remaining-dot { width: 6px; height: 6px; border-width: 1px; } .remaining-text-inside { font-size: 0.55em; } }
  `;
}

//
// EDITOR CLASS (FULL OPTIONS)
//
class ClockPvForecastCardEditor extends LitElement {
  static properties = { hass: {}, _config: {} };

  setConfig(config) {
    this._config = { ...config };

    // SMART INITIALIZATION: Don't overwrite what the user is currently typing
    if (this._manualTiers === undefined) {
      if (this._config.color_thresholds) {
        this._manualTiers = this._config.color_thresholds
          .map(t => `${t.value}:${t.color}`)
          .join(', ');
      } else {
        this._manualTiers = '';
      }
    }
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    let config = { ...ev.detail.value };

    // Update our local buffer
    this._manualTiers = config.color_thresholds_manual || '';

    // Parse it ONLY for the config sync
    if (this._manualTiers.trim()) {
      config.color_thresholds = this._manualTiers
        .split(',')
        .map(s => {
          const parts = s.split(':');
          if (parts.length < 2) return null;
          const v = parseFloat(parts[0].trim());
          const c = parts[1].trim();
          return isNaN(v) ? null : { value: v, color: c };
        })
        .filter(t => t !== null);
    }

    // Optimization: avoid sending the virtual field to YAML if possible, 
    // but we need it in the 'config' object passed back to ha-form in the next render cycle.

    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config } }));
  }

  _computeLabel = (schema) => {
    const labelMap = {
      entity_today: "Today's Forecast (Required)",
      entity_tomorrow: "Tomorrow's Forecast",
      ...Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`entity_day${i + 3}`, `Day ${i + 3} Entity`])),

      entity_remaining: "Remaining Energy Entity",
      remaining_indicator: "Indicator Type",
      remaining_inverted: "Invert (Countdown Mode)",
      remaining_label: "Remaining Label (Optional)",
      remaining_threshold: "Low Threshold (kWh)",
      remaining_blink: "Blink if Low",
      scale_mode: "Scaling Mode",
      max_value: "Max Value (kWh)",
      forecast_attribute: "Info Attribute (e.g. estimate10 for solcast users)",
      show_attribute_value: "Show Attribute Value Text",
      attribute_color: "Attribute Color (Hex)",
      display_mode: "Display Mode",
      bar_style: "Bar Color Style",
      bar_type: "Bar Shape Type",
      bar_shape: "Corner Style",
      show_tooltips: "Show Tooltips",
      gradient_fixed: "Fixed Gradient (0-100%)",
      animation_duration: "Animation Duration (e.g. 1s)",

      weekday_format: "Weekday Format (short/long)",
      date_format: "Date Format",
      relative_plus_one: "Relative: Use '+1d' for tomorrow",

      bar_color_start: "Bar Color Start (Hex)",
      bar_color_end: "Bar Color End (Hex)",
      marker_color: "Marker Color (Hex)",
      remaining_color_start: "Remaining Color Start",
      remaining_color_end: "Remaining Color End",
      remaining_low_color_start: "Low Warning Color Start",
      remaining_low_color_end: "Low Warning Color End",

      color_thresholds_manual: "Color Tiers (0:red, 10:yellow)"
    };
    return labelMap[schema.name] || schema.name;
  }

  render() {
    if (!this.hass || !this._config) return html``;

    // Ensure the form shows our current typing buffer
    const formData = {
      ...this._config,
      color_thresholds_manual: this._manualTiers
    };

    const entitiesSchema = [
      { name: "entity_today", selector: { entity: {} } },
      { name: "entity_tomorrow", selector: { entity: {} } },
      ...Array.from({ length: 11 }, (_, i) => ({ name: `entity_day${i + 3}`, selector: { entity: {} } })),
    ];

    const displaySchema = [
      { name: "max_value", selector: { number: { mode: "box", min: 1 } } },
      {
        name: "scale_mode",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "fixed", label: "Fixed (Max Value)" },
              { value: "auto", label: "Auto-Scale (Data max)" },
              { value: "daily", label: "Daily (Each bar 100%)" }
            ]
          }
        }
      },
      {
        name: "display_mode",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "weekday", label: "Weekday" },
              { value: "date", label: "Date" },
              { value: "relative", label: "Relative" }
            ]
          }
        }
      },
      {
        name: "weekday_format",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "short", label: "Short (Mon)" },
              { value: "long", label: "Long (Monday)" },
              { value: "narrow", label: "Narrow (M)" }
            ]
          }
        }
      },
      {
        name: "date_format",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "short", label: "Short (12. Jun)" },
              { value: "numeric", label: "Numeric (12.6.)" }
            ]
          }
        }
      },
      { name: "relative_plus_one", selector: { boolean: {} } },
      { name: "show_tooltips", selector: { boolean: {} } },
      { name: "animation_duration", selector: { text: {} } },
    ];

    const stylingSchema = [
      {
        name: "bar_style",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "gradient", label: "Gradient" },
              { value: "solid", label: "Solid (Thresholds)" },
              { value: "tiered", label: "Tiered (Thresholds)" }
            ]
          }
        }
      },
      { name: "color_thresholds_manual", selector: { text: {} } },
      {
        name: "bar_shape",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "rounded", label: "Rounded (Soft)" },
              { value: "sharp", label: "Rectangular (Sharp)" }
            ]
          }
        }
      },
      {
        name: "bar_type",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "smooth", label: "Smooth (Default)" },
              { value: "segmented", label: "Segmented (Blocks)" },
              { value: "digital", label: "Digital (Lines)" }
            ]
          }
        }
      },
      { name: "bar_color_start", selector: { text: {} } },
      { name: "bar_color_end", selector: { text: {} } },
      { name: "gradient_fixed", selector: { boolean: {} } },
      { name: "forecast_attribute", selector: { text: {} } },
      { name: "show_attribute_value", selector: { boolean: {} } },
      { name: "attribute_color", selector: { text: {} } },
    ];

    const remainingSchema = [
      { name: "entity_remaining", selector: { entity: {} } },
      { name: "remaining_label", selector: { text: {} } },
      {
        name: "remaining_indicator",
        selector: {
          select: {
            mode: "dropdown", options: [
              { value: "bar", label: "Bar (Row)" },
              { value: "marker", label: "Marker (Dot)" }
            ]
          }
        }
      },
      { name: "remaining_inverted", selector: { boolean: {} } },
      { name: "remaining_threshold", selector: { number: { mode: "box", min: 0 } } },
      { name: "remaining_blink", selector: { boolean: {} } },
      { name: "marker_color", selector: { text: {} } },
      { name: "remaining_color_start", selector: { text: {} } },
      { name: "remaining_color_end", selector: { text: {} } },
      { name: "remaining_low_color_start", selector: { text: {} } },
      { name: "remaining_low_color_end", selector: { text: {} } }
    ];

    return html`
      <div class="editor-container">
        <div class="section">
          <div class="section-header">Forecast Entities</div>
          <ha-form
            .hass=${this.hass}
            .data=${formData}
            .schema=${entitiesSchema}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>

        <div class="section">
          <div class="section-header">Display Settings</div>
          <ha-form
            .hass=${this.hass}
            .data=${formData}
            .schema=${displaySchema}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>

        <div class="section">
          <div class="section-header">Bar Styling</div>
          <ha-form
            .hass=${this.hass}
            .data=${formData}
            .schema=${stylingSchema}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
          <div class="tip">
            Format: <strong>value:color</strong> (e.g. 0:red, 10:#f1c40f)
          </div>
        </div>

        <div class="section">
          <div class="section-header">Remaining Energy</div>
          <ha-form
            .hass=${this.hass}
            .data=${formData}
            .schema=${remainingSchema}
            .computeLabel=${this._computeLabel}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
      </div>

      <style>
        .editor-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section-header {
          font-weight: bold;
          font-size: 1.1em;
          margin-bottom: 12px;
          padding-bottom: 4px;
          border-bottom: 1px solid var(--divider-color);
          color: var(--primary-color);
        }
        .section {
          background: var(--secondary-background-color);
          padding: 12px;
          border-radius: 8px;
        }
        .tip {
          margin-top: 8px;
          font-size: 0.85em;
          color: var(--secondary-text-color);
          opacity: 0.8;
          padding-left: 4px;
        }
      </style>
    `;
  }
}

customElements.define('clock-pv-forecast-card-editor', ClockPvForecastCardEditor);
customElements.define('clock-pv-forecast-card', ClockPvForecastCard);
if (window.customCards) {
  window.customCards.push({
    type: 'clock-pv-forecast-card',
    name: 'Clock PV Forecast Card',
    description: 'A solar forecast card displaying PV yield predictions',
    preview: false,
    documentationURL: 'https://github.com/dropqube/pv-forecast-card'
  });
}
