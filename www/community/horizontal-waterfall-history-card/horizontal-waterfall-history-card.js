class WaterfallHistoryCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = {
      entity: config.entity,
      title: config.title || 'History',
      hours: config.hours || 24,
      intervals: config.intervals || 48,
      height: config.height || 60,
      min_value: config.min_value || null,
      max_value: config.max_value || null,
      colors: config.colors || {
        cold: '#4FC3F7',
        cool: '#81C784',
        warm: '#FFB74D',
        hot: '#FF8A65'
      },
      thresholds: config.thresholds || {
        cold: 60,
        cool: 70,
        warm: 80
      },
      show_current: config.show_current !== false,
      show_labels: config.show_labels !== false,
      show_min_max: config.show_min_max || false, // New option for min/max
      unit: config.unit || '°F'
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.updateCard();
  }

  async updateCard() {
    if (!this._hass || !this.config) return;

    const entity = this._hass.states[this.config.entity];
    if (!entity) return;

    // Get historical data
    const endTime = new Date();
    const startTime = new Date(endTime - this.config.hours * 60 * 60 * 1000);
    try {
      const history = await this._hass.callApi('GET',
        `history/period/${startTime.toISOString()}?filter_entity_id=${this.config.entity}&end_time=${endTime.toISOString()}`
      );
      if (history && history[0]) {
        this.renderCard(history[0], entity);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      this.renderError();
    }
  }

  renderCard(historyData, currentEntity) {
    const current = parseFloat(currentEntity.state);
    const intervals = this.config.intervals;
    const timeStep = (this.config.hours * 60 * 60 * 1000) / intervals;

    // Process historical data into intervals
    const processedData = this.processHistoryData(historyData, intervals, timeStep);
    // Add current value
    processedData.push(current);

    // Calculate min/max for scaling (this remains the same for internal scaling)
    const minValForScale = this.config.min_value ?? Math.min(...processedData.filter(v => v !== null));
    const maxValForScale = this.config.max_value ?? Math.max(...processedData.filter(v => v !== null));

    // Calculate actual min/max for display in footer
    const actualMin = Math.min(...processedData.filter(v => v !== null));
    const actualMax = Math.max(...processedData.filter(v => v !== null));

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

        .card-header {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--primary-text-color, black);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .current-value {
          font-size: 18px;
          font-weight: bold;
          color: var(--primary-text-color, black);
        }

        .waterfall-container {
          position: relative;
          height: ${this.config.height}px;
          border-radius: 4px;
          overflow: hidden;
          display: flex;
          margin: 8px 0;
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
          margin-top: 4px;
        }

        .time-label {
          opacity: 0.7;
        }

        .min-max-label { /* New style for min/max labels */
            font-size: 11px;
            color: var(--secondary-text-color, gray);
            margin-top: 4px;
            text-align: center;
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
        <span>${this.config.title}</span>
        ${this.config.show_current ?
          `<span class="current-value">${current}${this.config.unit}</span>` : ''}
      </div>

      <div class="waterfall-container">
        ${processedData.map((value, index) => {
          const color = this.getColorForValue(value);
          return `<div class="bar-segment"
                      style="background-color: ${color};"
                      title="${value !== null ? value.toFixed(1) + this.config.unit : 'No data'} - ${this.getTimeLabel(index, intervals)}">
                  </div>`;
        }).join('')}
        <div class="gradient-overlay"></div>
      </div>

      ${this.config.show_labels ?
        `
          <div class="labels">
            <span class="time-label">${this.config.hours}h ago</span>
            <span class="time-label">Now</span>
          </div>
        ` : ''}

      ${this.config.show_min_max ? // Conditional rendering for min/max footer
        `
          <div class="min-max-label">
            Min: ${actualMin.toFixed(1)}${this.config.unit} - Max: ${actualMax.toFixed(1)}${this.config.unit}
          </div>
        ` : ''}
    `;
  }

  processHistoryData(historyData, intervals, timeStep) {
    const processed = new Array(intervals).fill(null);
    const now = Date.now();
    const startTime = now - (this.config.hours * 60 * 60 * 1000);

    // Group history data into time buckets
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

    // Forward fill null values
    for (let i = 1; i < processed.length; i++) {
      if (processed[i] === null && processed[i-1] !== null) {
        processed[i] = processed[i-1];
      }
    }

    return processed;
  }

  getColorForValue(value) {
    if (value === null) return '#666666';

    const { thresholds, colors } = this.config;
    if (value <= thresholds.cold) return colors.cold;
    if (value <= thresholds.cool) return colors.cool;
    if (value <= thresholds.warm) return colors.warm;
    return colors.hot;
  }

  getTimeLabel(index, totalIntervals) {
    const hoursAgo = (this.config.hours * (totalIntervals - index)) / totalIntervals;
    if (hoursAgo < 1) {
      return `${Math.round(hoursAgo * 60)}m ago`;
    }
    return `${hoursAgo.toFixed(1)}h ago`;
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
        }
        .error {
          color: var(--error-color, red);
          text-align: center;
        }
      </style>
      <div class="error">Error loading historical data</div>
    `;
  }

  getCardSize() {
    return 2;
  }

  static getConfigElement() {
    return document.createElement('waterfall-history-card-editor');
  }

  static getStubConfig() {
    return {
      entity: 'sensor.temperature',
      title: 'Temperature History',
      hours: 24,
      intervals: 48,
      show_min_max: true // Added to stub config
    };
  }
}

// Register the card
customElements.define('waterfall-history-card', WaterfallHistoryCard);

// Add to custom card registry
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
