const threshold_default_number = [
  { value: 60, color: '#4FC3F7' },  // cold
  { value: 70, color: '#81C784' },  // cool
  { value: 80, color: '#FFB74D' },  // warm
  { value: 100, color: '#FF8A65' }  // hot
];
const threshold_default_boolean = [
  { value: 0, color: '#4FC3F7' },  // cold
  { value: 1, color: '#FF8A65' },  // hot
];

class waterfallHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._lastHistoryFetch = {}; // Timestamp of last fetch per entity
    this._historyRefreshInterval = 15 * 60 * 1000; // 15min by default

    this.translations = {
      en: {
        history: 'History',
        error_loading_data: 'Error loading historical data',
        min_label: 'Min',
        max_label: 'Max',
        hours_ago: 'h ago',
        minutes_ago: 'm ago',
        now: 'Now',
      },
      fr: {
        history: 'Historique',
        error_loading_data: 'Erreur lors du chargement des données historiques',
        min_label: 'Min',
        max_label: 'Max',
        hours_ago: 'h',
        minutes_ago: 'min',
        now: 'Actuel',
      }
    };

    this.language = 'en';
    this.t = (key) => (this.translations[this.language] && this.translations[this.language][key]) || this.translations.en[key] || key;
  }

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities) || config.entities.length === 0) {
      throw new Error('Please define a list of entities.');
    }

    const globalConfig = {
        title: config.title || this.t('history'),
        hours: config.hours || 24,
        intervals: config.intervals || 48,
        height: config.height || 60,
        min_value: config.min_value || null,
        max_value: config.max_value || null,
        thresholds: config.thresholds || null,
        gradient: config.gradient || false,
        show_current: config.show_current !== false,
        show_labels: config.show_labels !== false,
        show_min_max: config.show_min_max || false,
        unit: config.unit || null,
        icon: config.icon || null,
        compact: config.compact || false,
        default_value: config.default_value ?? null,
        digits: typeof config.digits === 'number' ? config.digits : 1,
        card_mod: config.card_mod || {},
    };

    this.config = {
        ...globalConfig,
        entities: config.entities.map(entityConfig => {
            if (typeof entityConfig === 'string') {
                return { entity: entityConfig };
            }
            return entityConfig;
        }),
    };
  }

  set hass(hass) {
    this._hass = hass;
    if (hass.language) {
      this.language = hass.language.split('-')[0];
    }
    this.updateCard();
    this.updateCurrentValues();
  }

  updateCurrentValues() {
    if (!this.shadowRoot) return;

    this.config.entities.forEach(entityConfig => {
      const entityId = entityConfig.entity;
      const entity = this._hass.states[entityId];
      if (!entity) return;
      
      const showCurrent = entityConfig.show_current ?? this.config.show_current;
      if (!showCurrent) return;

      const current = this.parseState(entity.state);
      const valueElem = this.shadowRoot.querySelector(`.current-value[data-entity="${entityId}"]`);
      if (valueElem) {
        valueElem.textContent = this.displayState(current, entityConfig);
      }

      const lastBar = this.shadowRoot.querySelector(`.bar-segment[data-entity="${entityId}"].last-bar`);
      if (lastBar && current != null) {
        lastBar.style.backgroundColor = this.getColorForValue(current, entityConfig);
        lastBar.setAttribute('title', `${this.displayState(current, entityConfig)} - ${this.t('now')}`);
      }
    });
  }

  async updateCard() {
    if (!this._hass || !this.config) return;

    const now = Date.now();
    
    const entitiesToUpdate = this.config.entities.filter(entityConfig => {
        const entityId = entityConfig.entity;
        const hours = entityConfig.hours ?? this.config.hours;
        const intervals = entityConfig.intervals ?? this.config.intervals;
        const refreshInterval = ((hours / intervals) * 60 * 60 * 1000) / 2;
        return !this._lastHistoryFetch[entityId] || (now - this._lastHistoryFetch[entityId] > refreshInterval);
    });

    if (entitiesToUpdate.length === 0 && this.shadowRoot.innerHTML) {
      // Nothing to update and card is already rendered
      return;
    }
    
    const historyPromises = entitiesToUpdate.map(async (entityConfig) => {
        const entityId = entityConfig.entity;
        const hours = entityConfig.hours ?? this.config.hours;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        try {
            const history = await this._hass.callApi('GET',
                `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&end_time=${endTime.toISOString()}&significant_changes_only=1&minimal_response&no_attributes&skip_initial_state`
            );
            this._lastHistoryFetch[entityId] = now;
            return { entityId, history: history[0], entityConfig };
        } catch (error) {
            console.error(`Error fetching history for ${entityId}:`, error);
            return { entityId, history: null, entityConfig }; // Return null on error to handle it gracefully
        }
    });

    const results = await Promise.all(historyPromises);

    const processedHistories = this.processedHistories || {};
    results.forEach(({ entityId, history, entityConfig }) => {
        if(history){
            const intervals = entityConfig.intervals ?? this.config.intervals;
            const hours = entityConfig.hours ?? this.config.hours;
            const timeStep = (hours * 60 * 60 * 1000) / intervals;
            processedHistories[entityId] = this.processHistoryData(history, intervals, timeStep, entityConfig);
        }
    });
    this.processedHistories = processedHistories;

    this.renderCard(this.processedHistories);
  }

  renderCard(processedHistories) {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          padding: 16px;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          box-shadow: var(--ha-card-box-shadow, none);
          box-sizing: border-box;
          border-radius: var(--ha-card-border-radius, 12px);
          border-width: var(--ha-card-border-width, 1px);
          border-style: solid;
          border-color: var(--ha-card-border-color, var(--divider-color, #e0e0e0));
          color: var(--primary-text-color);
          display: block;
          position: relative;
        }
        .card-header {
          font-size: ${this.config.compact ? "12px" : "16px"};
          font-weight: 500;
          padding-bottom: 8px;
          color: var(--primary-text-color, black);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .entity-container {
          margin-bottom: 16px;
          cursor: pointer;
        }
        .entity-container:last-child {
            margin-bottom: 0;
        }
        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .entity-name {
          font-size: ${this.config.compact ? "12px" : "14px"};
          font-weight: 500;
        }
        .current-value {
          font-size: ${this.config.compact ? "12px" : "18px"};
          font-weight: bold;
        }
        .waterfall-container {
          position: relative;
          height: ${this.config.height}px;
          border-radius: 2px;
          overflow: hidden;
          display: flex;
        }
        .bar-segment {
          flex: 1;
          height: 100%;
          transition: all 0.3s ease;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        .bar-segment:last-child {
          border-right: none;
        }
        .labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--secondary-text-color, gray);
          margin-top: ${this.config.compact ? "0px" : "4px"};
        }
        .min-max-label {
          font-size: 11px;
          color: var(--secondary-text-color, gray);
          text-align: center;
        }
        .error {
          color: var(--error-color, red);
        }
      </style>
      <div class="card-header">
        <span>${this.config.title}</span>
      </div>
      ${this.config.entities.map(entityConfig => {
        const entityId = entityConfig.entity;
        const entity = this._hass.states[entityId];
        if (!entity) return `<div class="error">Entity not found: ${entityId}</div>`;

        const name = entityConfig.name || entity.attributes.friendly_name || entityId;
        const history = [...(processedHistories[entityId] || [])];
        const current = this.parseState(entity.state);
        history.push(current);
        
        const [actualMin, actualMax] = this.getMinMax(history);
        
        const showLabels = entityConfig.show_labels ?? this.config.show_labels;
        const showMinMax = entityConfig.show_min_max ?? this.config.show_min_max;
        const showCurrent = entityConfig.show_current ?? this.config.show_current;
        const hours = entityConfig.hours ?? this.config.hours;
        const intervals = entityConfig.intervals ?? this.config.intervals;
        
        return `
          <div class="entity-container" data-entity-id="${entityId}" @click="${() => this.openMoreInfo(entityId)}">
            <div class="entity-header">
              <span class="entity-name">${name}</span>
              ${showCurrent ? `<span class="current-value" data-entity="${entityId}">${this.displayState(current, entityConfig)}</span>` : ''}
            </div>
            <div class="waterfall-container">
              ${history.map((value, index) => {
                const isLast = index === history.length - 1;
                const color = this.getColorForValue(value, entityConfig);
                return `<div class="bar-segment ${isLast ? 'last-bar' : ''}"
                             data-entity="${entityId}"
                             style="background-color: ${color};"
                             title="${this.getTimeLabel(index, intervals, hours)} : ${value !== null ? this.displayState(value, entityConfig) : this.t('error_loading_data')}">
                        </div>`;
              }).join('')}
            </div>
            ${showLabels ? `
              <div class="labels">
                <span>${hours}${this.t('hours_ago')}</span>
                <span>${this.t('now')}</span>
              </div>
            ` : ''}
            ${showMinMax ? `
              <div class="min-max-label">
                ${this.t('min_label')}: ${this.displayState(actualMin, entityConfig)} / ${this.t('max_label')}: ${this.displayState(actualMax, entityConfig)}
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    `;

    customElements.whenDefined("card-mod").then((cardMod) => {
      cardMod.applyToElement(this, "card", this.config.card_mod);
    });
  }

  processHistoryData(historyData, intervals, timeStep, entityConfig) {
    const defaultValue = entityConfig.default_value ?? this.config.default_value;
    const processed = new Array(intervals).fill(defaultValue);
    const hours = entityConfig.hours ?? this.config.hours;
    const startTime = Date.now() - (hours * 60 * 60 * 1000);

    if (historyData) {
        historyData.forEach(point => {
          const pointTime = new Date(point.last_changed || point.last_updated).getTime();
          const timeDiff = pointTime - startTime;
          if (timeDiff >= 0) {
            const bucketIndex = Math.floor(timeDiff / timeStep);
            if (bucketIndex >= 0 && bucketIndex < intervals) {
              processed[bucketIndex] = this.parseState(point.state);
            }
          }
        });
    }

    for (let i = 1; i < processed.length; i++) {
        if (processed[i] === null && processed[i - 1] !== null) {
            processed[i] = processed[i - 1];
        }
    }
    for (let i = processed.length - 2; i >= 0; i--) {
        if (processed[i] === null && processed[i + 1] !== null) {
            processed[i] = processed[i + 1];
        }
    }

    return processed;
  }

  getMinMax(data) {
    let min = Infinity;
    let max = -Infinity;
    data.forEach(d => {
        if (d === null) return;
        if (d > max) max = d;
        if (d < min) min = d;
    });
    return [min, max];
  }

  parseState(state) {
    if (typeof state === 'number') return state;
    if (typeof state === 'string') {
      if (state.toLowerCase() === 'off') return 0;
      if (state.toLowerCase() === 'on') return 1;
      const casted = parseFloat(state);
      if (!Number.isNaN(casted)) return casted;
    }
    return null;
  }

  displayState(state, entityConfig) {
      if (state === true || state === 1 && (entityConfig.thresholds === threshold_default_boolean || this.config.thresholds === threshold_default_boolean)) return 'on';
      if (state === false || state === 0 && (entityConfig.thresholds === threshold_default_boolean || this.config.thresholds === threshold_default_boolean)) return 'off';
      if (typeof state === 'number') {
          const digits = entityConfig.digits ?? this.config.digits;
          return state.toFixed(digits) + this.getUnit(entityConfig);
      }
      return (state ?? 'N/A') + this.getUnit(entityConfig);
  }

  getColorForValue(value, entityConfig) {
    if (value === null || isNaN(value)) return '#666666';

    let thresholds = entityConfig.thresholds ?? this.config.thresholds;
    if (!thresholds) {
        thresholds = (typeof value === 'boolean' || value === 0 || value === 1) ? threshold_default_boolean : threshold_default_number;
    }
    
    if (typeof value === 'boolean') value = value ? 1 : 0;

    const gradient = entityConfig.gradient ?? this.config.gradient;
    if (!gradient) {
        let color = thresholds[0].color;
        for (const t of thresholds) {
            if (value >= t.value) {
                color = t.color;
            }
        }
        return color;
    }

    for (let i = 0; i < thresholds.length - 1; i++) {
        const current = thresholds[i];
        const next = thresholds[i + 1];
        if (value >= current.value && value <= next.value) {
            const factor = (next.value - current.value === 0) ? 0 : (value - current.value) / (next.value - current.value);
            return this.interpolateColor(current.color, next.color, factor);
        }
    }
    return value < thresholds[0].value ? thresholds[0].color : thresholds[thresholds.length - 1].color;
  }

  getUnit(entityConfig) {
      const entity = this._hass.states[entityConfig.entity];
      return entityConfig.unit ?? this.config.unit ?? entity?.attributes?.unit_of_measurement ?? '';
  }

  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }

  hexToRgb(hex) {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r: 0, g: 0, b: 0 };
  }

  getTimeLabel(index, totalIntervals, hours) {
    const hoursAgo = (hours * (totalIntervals - index)) / totalIntervals;
    if (hours <= 24) {
        const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + (hours / totalIntervals) * 60 * 60 * 1000);
        return `${date.getHours()}:00 - ${nextDate.getHours()}:00`;
    }
    if (hoursAgo < 1) {
        return `${Math.round(hoursAgo * 60)}${this.t('minutes_ago')}`;
    }
    return `${hoursAgo.toFixed(1)}${this.t('hours_ago')}`;
  }

  openMoreInfo(entityId) {
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId }
    });
    this.dispatchEvent(event);
  }

  getCardSize() {
    return this.config.entities.length * 2;
  }

  static getStubConfig() {
    return {
      title: 'Temperature History',
      hours: 24,
      show_min_max: true,
      entities: [
        {
            entity: 'sensor.outdoor_temperature',
            name: 'Outside',
            show_min_max: false, // Override global setting
        },
        {
            entity: 'sensor.indoor_temperature',
            name: 'Inside (48h)',
            hours: 48, // Override global setting
            show_labels: false,
        },
        {
            entity: 'sensor.attic_temperature',
            name: 'Attic',
        },
      ],
    };
  }
}

customElements.define('waterfall-history-card', waterfallHistoryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'waterfall-history-card',
  name: 'waterfall History Card',
  description: 'A horizontal waterfall display for historical sensor data'
});

console.info(
  `%c WATERFALL-HISTORY-CARD %c v2.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
