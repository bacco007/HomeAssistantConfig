// pv-forecast-card
import { LitElement, html, css } from 'https://unpkg.com/lit@2.8.0/index.js?module';

console.info("📦 clock-pv-forecast-card v0.025 loaded");

class ClockPvForecastCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  constructor() {
    super();
    this._weekdayCache = {};
    this._dateCache = {};
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Configuration is required');
    }
    
    // Prüfe ob mindestens eine Entity definiert ist
    const hasEntity = ['entity_today', 'entity_tomorrow', 'entity_day3', 'entity_day4', 'entity_day5', 'entity_day6', 'entity_day7']
      .some(key => config[key]);
    
    if (!hasEntity) {
      throw new Error('At least one forecast entity must be defined');
    }

    // Bestimme die Spaltenbreite basierend auf dem Display-Modus
    const displayMode = config.display_mode || 'weekday';
    let dayColumnWidth;
    
    if (displayMode === 'date') {
      dayColumnWidth = config.day_column_width || '3.5em';
    } else if (displayMode === 'relative') {
      dayColumnWidth = config.day_column_width || '2.5em';
    } else { // weekday mode
      const weekdayWidth = {
        narrow: '1.5em',
        short: '2.5em',
        long: '5em',
      };
      const format = config.weekday_format || 'short';
      dayColumnWidth = weekdayWidth[format] || '2.5em';
    }

    this.config = {
      animation_duration: config.animation_duration || '1s',
      bar_color_start: config.bar_color_start || '#3498db',
      bar_color_end: config.bar_color_end || '#2ecc71',
      remaining_color_start: config.remaining_color_start || '#999999',
      remaining_color_end: config.remaining_color_end || '#cccccc',
      remaining_threshold: config.remaining_threshold ?? null,
      remaining_low_color_start: config.remaining_low_color_start || '#e74c3c',
      remaining_low_color_end: config.remaining_low_color_end || '#e67e22',
      remaining_blink: config.remaining_blink || false,
      max_value: config.max_value ?? 100,
      weekday_format: config.weekday_format || 'short',
      display_mode: displayMode, // 'weekday', 'date', or 'relative'
      date_format: config.date_format || 'short', // 'short', 'numeric'
      relative_plus_one: config.relative_plus_one || false,
      day_column_width: dayColumnWidth,
      entity_remaining: config.entity_remaining || null,
      remaining_label: config.remaining_label || 'Rest',
      remaining_indicator: config.remaining_indicator || 'bar',
      show_tooltips: config.show_tooltips ?? false,
      ...config,
    };

    // Cache leeren bei Konfigurationsänderung
    this._weekdayCache = {};
    this._dateCache = {};
  }

  shouldUpdate(changedProperties) {
    if (changedProperties.has('config')) {
      return true;
    }
    
    if (changedProperties.has('hass')) {
      const oldHass = changedProperties.get('hass');
      if (!oldHass) return true;

      const entities = [
        this.config.entity_today,
        this.config.entity_tomorrow,
        this.config.entity_day3,
        this.config.entity_day4,
        this.config.entity_day5,
        this.config.entity_day6,
        this.config.entity_day7,
        this.config.entity_remaining,
      ].filter(Boolean);
      
      return entities.some(entity => 
        this.hass.states[entity]?.state !== oldHass.states[entity]?.state ||
        this.hass.states[entity]?.last_updated !== oldHass.states[entity]?.last_updated
      );
    }
    
    return false;
  }

  render() {
    const forecast = [
      this.config.entity_today && { offset: 0, entity: this.config.entity_today },
      this.config.entity_tomorrow && { offset: 1, entity: this.config.entity_tomorrow },
      this.config.entity_day3 && { offset: 2, entity: this.config.entity_day3 },
      this.config.entity_day4 && { offset: 3, entity: this.config.entity_day4 },
      this.config.entity_day5 && { offset: 4, entity: this.config.entity_day5 },
      this.config.entity_day6 && { offset: 5, entity: this.config.entity_day6 },
      this.config.entity_day7 && { offset: 6, entity: this.config.entity_day7 },
    ].filter(Boolean);

    return html`
      <ha-card>
        <div class="forecast-rows" role="table" aria-label="PV Forecast">
          ${this.config.entity_remaining && this.config.remaining_indicator === 'bar' ? this._renderRemainingBar() : ''}
          ${forecast.map((item, index) => this._renderForecastRow(item, index))}
        </div>
      </ha-card>
    `;
  }

  _renderForecastRow(item, index) {
    const entityState = this.hass.states[item.entity];
    
    if (!entityState || entityState.state === 'unavailable' || entityState.state === 'unknown') {
      return this._renderErrorRow(item, index, this.hass.localize('state.default.unavailable'));
    }

    const value = parseFloat(entityState.state ?? '0');
    if (isNaN(value)) {
      return this._renderErrorRow(item, index, this.hass.localize('ui.card.weather.unknown'));
    }

    const dayLabel = this._getDayLabel(item.offset);
    const barStyle = `--bar-width: ${this._barWidth(value)}%; --bar-gradient: linear-gradient(to right, ${this.config.bar_color_start}, ${this.config.bar_color_end}); --animation-time: ${this.config.animation_duration}`;

    let remainingDot = '';
    if (item.offset === 0 && this.config.remaining_indicator === 'marker' && this.config.entity_remaining) {
      const remaining = parseFloat(this.hass.states[this.config.entity_remaining]?.state || '0');
      const produced = value - remaining;
      const percent = Math.max(0, Math.min(100, (produced / this.config.max_value) * 100));
      remainingDot = html`<div class="remaining-dot" style="left: ${percent}%"></div>`;
    }

    return html`
      <div class="forecast-row" role="row" aria-label="Tag ${index + 1}">
        <div class="day" role="cell" style="width: ${this.config.day_column_width}">${dayLabel}</div>
        <div class="bar-container" role="cell" aria-label="Prognose ${this._formatValue(value, item.entity)}">
          <div class="bar" style="${barStyle}" aria-hidden="true"></div>
          ${remainingDot}
          ${this.config.show_tooltips ? this._renderTooltip(value, item.entity, dayLabel) : ''}
        </div>
        <div class="value" role="cell">${this._formatValue(value, item.entity)}</div>
      </div>`;
  }

  _renderErrorRow(item, index, errorMessage) {
    const dayLabel = this._getDayLabel(item.offset);
    return html`
      <div class="forecast-row error" role="row" aria-label="Tag ${index + 1} - Fehler">
        <div class="day" role="cell" style="width: ${this.config.day_column_width}">${dayLabel}</div>
        <div class="bar-container error" role="cell">
          <div class="error-text">${errorMessage}</div>
        </div>
        <div class="value error" role="cell">-- kWh</div>
      </div>`;
  }

  _renderRemainingBar() {
    const entityState = this.hass.states[this.config.entity_remaining];
    const remainingLabel = this.config.remaining_label;
    
    if (!entityState || entityState.state === 'unavailable' || entityState.state === 'unknown') {
      return html`
        <div class="forecast-row error">
          <div class="day" style="width: ${this.config.day_column_width}">${remainingLabel}</div>
          <div class="bar-container error">
            <div class="error-text">${this.hass.localize('state.default.unavailable')}</div>
          </div>
          <div class="value error">-- kWh</div>
        </div>`;
    }

    const remaining = parseFloat(entityState.state ?? '0');
    if (isNaN(remaining)) {
      return html`
        <div class="forecast-row error">
          <div class="day" style="width: ${this.config.day_column_width}">${remainingLabel}</div>
          <div class="bar-container error">
            <div class="error-text">${this.hass.localize('ui.card.weather.unknown')}</div>
          </div>
          <div class="value error">-- kWh</div>
        </div>`;
    }

    const belowThreshold = this.config.remaining_threshold !== null && remaining <= this.config.remaining_threshold;
    const start = belowThreshold ? this.config.remaining_low_color_start : this.config.remaining_color_start;
    const end = belowThreshold ? this.config.remaining_low_color_end : this.config.remaining_color_end;
    const barStyle = `--bar-width: ${this._barWidth(remaining)}%; --bar-gradient: linear-gradient(to left, ${start}, ${end}); --animation-time: ${this.config.animation_duration}`;
    const blinkClass = belowThreshold && this.config.remaining_blink ? 'blink' : '';
    
    return html`
      <div class="forecast-row">
        <div class="day" style="width: ${this.config.day_column_width}">${remainingLabel}</div>
        <div class="bar-container rtl">
          <div class="bar ${blinkClass}" style="${barStyle}"></div>
          ${this.config.show_tooltips ? this._renderTooltip(remaining, this.config.entity_remaining, remainingLabel) : ''}
        </div>
        <div class="value">${this._formatValue(remaining, this.config.entity_remaining)}</div>
      </div>`;
  }

  _renderTooltip(value, entity, dayLabel) {
    const state = this.hass.states[entity];
    const lastUpdated = state?.last_updated ? new Date(state.last_updated).toLocaleString() : this.hass.localize('state.default.unknown');
    
    return html`
      <div class="tooltip">
        <div class="tooltip-content">
          <strong>${dayLabel}</strong><br>
          ${this.hass.localize('ui.card.energy.forecast') || 'Forecast'}: ${this._formatValue(value, entity)}<br>
          <small>${this.hass.localize('ui.card.generic.last_updated') || 'Last updated'}: ${lastUpdated}</small>
        </div>
      </div>
    `;
  }

  _formatValue(value, entity) {
    const state = this.hass.states[entity];
    const unit = state?.attributes?.unit_of_measurement || 'kWh';
    return `${value.toFixed(1)} ${unit}`;
  }

  _getDayLabel(offset) {
    switch (this.config.display_mode) {
      case 'date':
        return this._getDateLabel(offset);
      case 'relative':
        return this._getRelativeLabel(offset);
      default:
        return this._getWeekdayName(offset);
    }
  }

  _getWeekdayName(offset) {
    const locale = this.hass.locale?.language || navigator.language || 'en';
    const cacheKey = `weekday-${offset}-${locale}-${this.config.weekday_format}`;
    
    if (!this._weekdayCache[cacheKey]) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      this._weekdayCache[cacheKey] = date.toLocaleDateString(locale, { 
        weekday: this.config.weekday_format 
      });
    }
    
    return this._weekdayCache[cacheKey];
  }

  _getDateLabel(offset) {
    const locale = this.hass.locale?.language || navigator.language || 'en';
    const cacheKey = `date-${offset}-${locale}-${this.config.date_format}`;
    
    if (!this._dateCache[cacheKey]) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      
      if (this.config.date_format === 'numeric') {
        // Numerisches Format: z.B. "12.6." oder "6/12" je nach Locale
        this._dateCache[cacheKey] = date.toLocaleDateString(locale, { 
          day: 'numeric',
          month: 'numeric'
        });
      } else {
        // Kurzes Format: z.B. "12.6." oder "Jun 12" je nach Locale
        this._dateCache[cacheKey] = date.toLocaleDateString(locale, { 
          day: 'numeric',
          month: 'short'
        });
      }
    }
    
    return this._dateCache[cacheKey];
  }

  _getRelativeLabel(offset) {
    if (offset === 0) {
      return this.hass.localize('ui.components.relative_time.today') || 'Today';
    } else if (offset === 1) {
      return this.config.relative_plus_one ? '+1d' : (this.hass.localize('ui.components.relative_time.tomorrow') || 'Tomorrow');
    } else {
      return `+${offset}d`;
    }
  }

  _barWidth(value) {
    const max = parseFloat(this.config.max_value || 100);
    return Math.min((value / max) * 100, 100);
  }

  static getConfigElement() {
    return document.createElement('clock-pv-forecast-card-editor');
  }

  static getStubConfig() {
    return {
      entity_today: 'sensor.pv_forecast_today',
      entity_tomorrow: 'sensor.pv_forecast_tomorrow',
      max_value: 100,
      display_mode: 'weekday',
      weekday_format: 'short',
      date_format: 'short',
      remaining_label: 'Rest',
      relative_plus_one: false
    };
  }

  static styles = css`
    .forecast-rows {
      display: flex;
      flex-direction: column;
      gap: 0.4em;
      padding: 1em 1em 1em 1em;
    }
    
    .forecast-row {
      display: flex;
      align-items: center;
      gap: 0.8em;
    }
    
    .forecast-row.error {
      opacity: 0.6;
    }
    
    .day {
      text-align: right;
      font-weight: bold;
      color: var(--primary-text-color);
    }
    
    .bar-container {
      flex-grow: 1;
      height: 14px;
      background: var(--divider-color, #eee);
      border-radius: 7px;
      overflow: visible;
      position: relative;
    }
    
    .bar-container.rtl {
      direction: rtl;
    }
    
    .bar-container.error {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .bar {
      height: 100%;
      border-radius: 7px;
      width: 0%;
      background: var(--bar-gradient);
      animation: fill-bar var(--animation-time) ease-out forwards;
    }
    
    .bar.blink {
      animation: fill-bar var(--animation-time) ease-out forwards, blink 1s infinite;
    }

    .remaining-dot {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary-color);
    }

    .value {
      width: 4.5em;
      text-align: right;
      font-size: 0.85em;
      font-weight: bold;
      white-space: nowrap;
      color: var(--secondary-text-color);
    }
    
    .value.error {
      color: var(--error-color, #e74c3c);
    }
    
    .error-text {
      font-size: 0.7em;
      color: var(--error-color, #e74c3c);
      text-align: center;
    }

    .tooltip {
      position: absolute;
      top: -60px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--card-background-color, white);
      border: 1px solid var(--divider-color, #eee);
      border-radius: 4px;
      padding: 8px;
      font-size: 0.8em;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 1000;
      white-space: nowrap;
    }

    .bar-container:hover .tooltip {
      opacity: 1;
    }

    .tooltip-content {
      text-align: center;
    }

    @keyframes fill-bar {
      to {
        width: var(--bar-width);
      }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    @media (max-width: 480px) {
      .forecast-rows {
        gap: 0.2em;
        padding: 0.5em;
      }
      
      .value {
        font-size: 0.75em;
        width: 3.5em;
      }
      
      .day {
        font-size: 0.85em;
      }
      
      .tooltip {
        top: -50px;
        font-size: 0.7em;
      }
    }

    @media (max-width: 320px) {
      .forecast-rows {
        gap: 0.1em;
        padding: 0.3em;
      }
      
      .forecast-row {
        gap: 0.4em;
      }
    }
  `;
}

if (!customElements.get('clock-pv-forecast-card')) {
  customElements.define('clock-pv-forecast-card', ClockPvForecastCard);
}
