class WaterfallHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._lastHistoryFetch = 0;  // Timestamp of last fetch
    this._historyRefreshInterval = 15 * 60 * 1000; // 15min by defaut

    // Langues supportées et traductions
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

    this.language = 'en'; // Langue par défaut (sera remplacée selon Home Assistant)

    // Méthode pour récupérer la traduction selon la langue courante
    this.t = (key) => {
      return (this.translations[this.language] && this.translations[this.language][key]) || this.translations.en[key] || key;
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(this.t('error_loading_data'));
    }
    this.config = {
      entity: config.entity,
      title: config.title || this.t('history'),
      hours: config.hours || 24,
      intervals: config.intervals || 48,
      height: config.height || 60,
      min_value: config.min_value || null,
      max_value: config.max_value || null,
      thresholds: config.thresholds || [
        { value: 60, color: '#4FC3F7' },  // cold
        { value: 70, color: '#81C784' },  // cool
        { value: 80, color: '#FFB74D' },  // warm
        { value: 100, color: '#FF8A65' }  // hot
      ],
      gradient: config.gradient || false,
      show_current: config.show_current !== false,
      show_labels: config.show_labels !== false,
      show_min_max: config.show_min_max || false,
      unit: config.unit || null,
      icon: config.icon || null,
      compact: config.compact || false,
      columns: config.columns || 12,
      digits: typeof config.digits === 'number' ? config.digits : 1 // New: number of digits after decimal point
    };

    this._historyRefreshInterval = ((this.config.hours / this.config.intervals) * 60 * 60 * 1000) / 2; // take lenght of interval divided by 2 for refresh all history
  }

  set hass(hass) {
    this._hass = hass;
    if (hass.language) {
      this.language = hass.language.split('-')[0];
    }
    const entity = hass.states[this.config.entity];
    if (!entity) return;
    this._current = parseFloat(entity.state);

    const now = Date.now();
    if (now - this._lastHistoryFetch > this._historyRefreshInterval) {
      this._lastHistoryFetch = now;
      this.updateCard();  // Reload history
    } else {
      this.updateCurrentValue();  // Only update current value
    }
  }

  updateCurrentValue() {
    const current = this._current;
    if (!this.shadowRoot || !this.config.show_current) return;

    const valueElem = this.shadowRoot.querySelector('.current-value');
    if (valueElem) {
      // Use this.config.digits for toFixed()
      valueElem.textContent = `${current.toFixed(this.config.digits)}${this.unit}`;
    }

    const bars = this.shadowRoot.querySelectorAll('.bar-segment');
    if (bars.length > 0) {
      const lastBar = bars[bars.length - 1];
      if (lastBar && current != null) {
        lastBar.style.backgroundColor = this.getColorForValue(current);
        // Use this.config.digits for toFixed()
        lastBar.setAttribute('title', `${current.toFixed(this.config.digits)}${this.unit} - ${this.t('now')}`);
      }
    }
  }

  async updateCard() {
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    const endTime = new Date();
    const startTime = new Date(endTime - this.config.hours * 60 * 60 * 1000);

    const cacheKey = `waterfall-history-${this.config.entity}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey));

    if (cached && cached.data && endTime.getTime() - cached.datetime < this._historyRefreshInterval) {
        this.renderCard(cached.data, entity);
        return;
    }

    try {
      const history = await this._hass.callApi('GET',
        `history/period/${startTime.toISOString()}?filter_entity_id=${this.config.entity}&end_time=${endTime.toISOString()}&significant_changes_only=1&minimal_response&no_attributes&skip_initial_state`
      );
      if (history && history[0]) {

        const intervals = this.config.intervals;
        const timeStep = (this.config.hours * 60 * 60 * 1000) / intervals;
        const processedData = this.processHistoryData(history[0], intervals, timeStep);
        try {
          localStorage.setItem(cacheKey, JSON.stringify({data : processedData, datetime:endTime.getTime()}));
        } catch (error) {
          console.error('Error save history cache :', error);
        }
        this.renderCard(processedData, entity);
      } else {
        this.renderCard([], entity);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      this.renderError();
    }
  }

  renderCard(processedData, currentEntity) {
    const current = parseFloat(currentEntity.state);
    const intervals = this.config.intervals;
    processedData.push(current);

    const minValForScale = this.config.min_value ?? Math.min(...processedData.filter(v => v !== null));
    const maxValForScale = this.config.max_value ?? Math.max(...processedData.filter(v => v !== null));

    const actualMin = Math.min(...processedData.filter(v => v !== null && !isNaN(v)));
    const actualMax = Math.max(...processedData.filter(v => v !== null && !isNaN(v)));

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          padding: 16px;
          cursor: pointer;
          background: var(--ha-card-background, var(--card-background-color, #fff));
          backdrop-filter: var(--ha-card-backdrop-filter, none);
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
          margin-bottom: 8px;
          color: var(--primary-text-color, black);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header ha-icon {
          --mdc-icon-size : ${this.config.compact ? "12px" : "16px"};
          position:relative;
          top: -1px;
        }
        
        .current-value {
          font-size: ${this.config.compact ? "12px" : "18px"};
          font-weight: bold;
          color: var(--primary-text-color, black);
        }

        .waterfall-container {
          position: relative;
          height: ${this.config.height}px;
          border-radius: 2px;
          overflow: hidden;
          display: flex;
          /* Adjusted margin-right to align with card header.
             The host has 16px padding. By setting margin-right to 0px
             when compact, the bars will extend fully within that padding. */
          margin: ${this.config.compact ? "-10px" : "8px"} ${this.config.compact ? "0px" : "8px"} 0 0;
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

        .bar-segment:hover {
          opacity: 0.8;
          transform: scaleY(1.05);
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
          margin-top: ${this.config.compact ? "-17px" : "4px"};
          text-align: center;
          margin-right: ${this.config.compact ? "15px" : "0px"};
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          right: 0;
          width: 20px;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3));
          pointer-events: none;
        }
      </style>

      <div class="card-header">
        <span>
          ${this.icon ? `<ha-icon icon="${this.icon}"></ha-icon> ` : ''}${this.config.title}
        </span>
        ${this.config.show_current ? `<span class="current-value">${current.toFixed(1)}${this.unit}</span>` : ''}
      </div>

      <div class="waterfall-container">

        ${processedData.map((value, index) => {
          const color = this.getColorForValue(value);
          return `<div class="bar-segment"
                      style="background-color: ${color};"
                      title="${this.getTimeLabel(index, intervals)} : ${value !== null ? value.toFixed(this.config.digits) + this.unit : this.t('error_loading_data')}">
                  </div>`;
        }).join('')}
        <div class="gradient-overlay"></div>
      </div>

      ${this.config.show_labels ? `
        <div class="labels">
          <span class="time-label">${this.config.hours}${this.t('hours_ago')}</span>
          <span class="time-label">${this.t('now')}</span>
        </div>
      ` : ''}

      ${this.config.show_min_max ? `
        <div class="min-max-label">
          ${this.config.compact ? '' : this.t('min_label') + ':'} ${actualMin.toFixed(this.config.digits)}${this.unit} - ${this.config.compact ? '' : this.t('max_label') + ':'} ${actualMax.toFixed(this.config.digits)}${this.unit}
        </div>
      ` : ''}
    `;
    this.shadowRoot.host.style.cursor = 'pointer';
    this.shadowRoot.host.onclick = () => this.openMoreInfo();
  }

  processHistoryData(historyData, intervals, timeStep) {
    const processed = new Array(intervals).fill(null);
    const now = Date.now();
    const startTime = now - (this.config.hours * 60 * 60 * 1000);
    let previousValue = null;

    historyData.forEach(point => {
      const pointTime = new Date(point.last_changed || point.last_updated).getTime();
      const timeDiff = pointTime - startTime;
      if (timeDiff >= 0) {
        const bucketIndex = Math.floor(timeDiff / timeStep);
        if (bucketIndex >= 0 && bucketIndex < intervals) {
          const value = parseFloat(point.state);
          if (!isNaN(value)) {
            processed[bucketIndex] = value;
          }
        }
      }
    });

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

  getColorForValue(value) {
    if (value === null) return '#666666';
    if (isNaN(value)) return '#666666';

    const thresholds = this.config.thresholds;
    if (!thresholds || thresholds.length === 0) return '#666666';

    if (!this.config.gradient) {
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (value >= thresholds[i].value) {
          return thresholds[i].color;
        }
      }
      return thresholds[0].color;
    }
    for (let i = 0; i < thresholds.length - 1; i++) {
      const current = thresholds[i];
      const next = thresholds[i + 1];
      if (value >= current.value && value <= next.value) {
        const factor = (value - current.value) / (next.value - current.value);
        return this.interpolateColor(current.color, next.color, factor);
      }
    }
    if (value < thresholds[0].value) {
      return thresholds[0].color;
    }
    return thresholds[thresholds.length - 1].color;
  }

  get unit() {
    return this.config.unit ?? this._hass?.states?.[this.config.entity]?.attributes?.unit_of_measurement ?? '';
  }

  get icon() {
    return this.config.icon ?? this._hass?.states?.[this.config.entity]?.attributes?.icon ?? '';
  }

  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    const result = {
      r: Math.round(c1.r + (c2.r - c1.r) * factor),
      g: Math.round(c1.g + (c2.g - c1.g) * factor),
      b: Math.round(c1.b + (c2.b - c1.b) * factor),
    };
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
  }

  hexToRgb(hex) {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res ? {
      r: parseInt(res[1], 16),
      g: parseInt(res[2], 16),
      b: parseInt(res[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  getTimeLabel(index, totalIntervals) {
    const hoursAgo = (this.config.hours * (totalIntervals - index)) / totalIntervals;
    if(this.config.hours <= 24){
      const hour = (new Date(new Date() - hoursAgo * 60 * 60 * 1000)).getHours();
      return `${hour}:00 - ${hour + 1}:00`;
    }
    if (hoursAgo < 1) {
      return `${Math.round(hoursAgo * 60)}${this.t('minutes_ago')}`;
    }
    return `${hoursAgo.toFixed(1)}${this.t('hours_ago')}`;
  }

  openMoreInfo() {
    const event = new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId: this.config.entity }
    });
    this.dispatchEvent(event);
  }

  renderError() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background: var(--card-background-color, white);
          border-radius: var(--border-radius, 4px);
          box-shadow: var(--box-shadow, 0 2px 4px rgba(0,0,0,0.1));
          padding: 16px;
          font-family: var(--primary-font-family, sans-serif);
        }
        .error {
          color: var(--error-color, red);
          text-align: center;
        }
      </style>
      <div class="error">${this.t('error_loading_data')}</div>
    `;
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return {
      columns: this.config.columns
    };
  }

  static getConfigElement() {
    return document.createElement('horizontal-waterfall-history-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      title: 'Temperature History',
      hours: 24,
      intervals: 48,
      show_min_max: true,
      gradient: false,
      digits: 1,
      thresholds: [
        { value: 60, color: '#4FC3F7' },
        { value: 70, color: '#81C784' },
        { value: 80, color: '#FFB74D' },
        { value: 100, color: '#FF8A65' }
      ]
    };
  }
}

customElements.define('waterfall-history-card', WaterfallHistoryCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'waterfall-history-card',
  name: 'Waterfall History Card',
  description: 'A horizontal waterfall display for historical sensor data'
});

console.info(
  `%c WATERFALL-HISTORY-CARD %c v1.0.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
