class HealthBridgeCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this.content) {
      this.content = document.createElement('div');
      this.content.className = 'card-content';
      this.shadowRoot.appendChild(this.content);
      this.setupStyleElement();
    }

    this.updateCard();
  }

  setupStyleElement() {
    const style = document.createElement('style');
    style.textContent = `
      .card-content {
        padding: 16px;
      }
      .header {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 16px;
      }
      .user-section {
        margin-bottom: 24px;
      }
      .user-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
        color: var(--primary-color);
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }
      .metric-card {
        background-color: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      .metric-icon {
        font-size: 28px;
        margin-bottom: 8px;
        color: var(--primary-color);
      }
      .metric-value {
        font-size: 22px;
        font-weight: bold;
      }
      .metric-name {
        font-size: 14px;
        color: var(--secondary-text-color);
        text-align: center;
      }
      .metric-unit {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .placeholder {
        font-style: italic;
        color: var(--disabled-text-color);
        text-align: center;
        padding: 24px;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setConfig(config) {
    if (!config.title) {
      config.title = 'Health Bridge';
    }
    this.config = config;
  }

  static getStubConfig() {
    return {
      title: "Health Bridge"
    };
  }

  getCardSize() {
    return 3;
  }

  updateCard() {
    if (!this._hass || !this.config) return;

    // Clear content
    this.content.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = this.config.title;
    this.content.appendChild(header);

    // Find all health_bridge sensor entities
    const healthBridgeEntities = Object.keys(this._hass.states)
      .filter(entity_id => entity_id.startsWith('sensor.') && entity_id.includes('_'))
      .filter(entity_id => {
        const state = this._hass.states[entity_id];
        return state && state.attributes && state.attributes.friendly_name && 
          state.attributes.friendly_name.includes('(');
      });

    if (healthBridgeEntities.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder';
      placeholder.textContent = 'No health data available. Set up Health Bridge integration and start receiving data.';
      this.content.appendChild(placeholder);
      return;
    }

    // Group entities by user
    const userEntityMap = {};
    
    healthBridgeEntities.forEach(entity_id => {
      const state = this._hass.states[entity_id];
      const friendlyName = state.attributes.friendly_name;
      
      // Extract user ID from friendly name - assumes format "Metric Name (user_id)"
      const matches = friendlyName.match(/\(([^)]+)\)$/);
      if (matches && matches[1]) {
        const userId = matches[1];
        if (!userEntityMap[userId]) {
          userEntityMap[userId] = [];
        }
        userEntityMap[userId].push(entity_id);
      }
    });

    // Create section for each user's metrics
    Object.keys(userEntityMap).forEach(userId => {
      const userSection = document.createElement('div');
      userSection.className = 'user-section';
      
      const userHeader = document.createElement('div');
      userHeader.className = 'user-header';
      userHeader.textContent = `User: ${userId}`;
      userSection.appendChild(userHeader);
      
      const metricsGrid = document.createElement('div');
      metricsGrid.className = 'metrics-grid';
      
      userEntityMap[userId].forEach(entity_id => {
        const state = this._hass.states[entity_id];
        const friendlyName = state.attributes.friendly_name;
        const value = state.state;
        const unit = state.attributes.unit_of_measurement || '';
        const icon = state.attributes.icon || 'mdi:help-circle';
        
        // Extract metric name from friendly name
        const metricName = friendlyName.replace(/ \([^)]+\)$/, '');
        
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        
        const metricIcon = document.createElement('div');
        metricIcon.className = 'metric-icon';
        metricIcon.innerHTML = `<ha-icon icon="${icon}"></ha-icon>`;
        metricCard.appendChild(metricIcon);
        
        const metricValue = document.createElement('div');
        metricValue.className = 'metric-value';
        metricValue.textContent = value;
        metricCard.appendChild(metricValue);
        
        const metricNameEl = document.createElement('div');
        metricNameEl.className = 'metric-name';
        metricNameEl.textContent = metricName;
        metricCard.appendChild(metricNameEl);
        
        if (unit) {
          const metricUnit = document.createElement('div');
          metricUnit.className = 'metric-unit';
          metricUnit.textContent = unit;
          metricCard.appendChild(metricUnit);
        }
        
        metricsGrid.appendChild(metricCard);
      });
      
      userSection.appendChild(metricsGrid);
      this.content.appendChild(userSection);
    });
  }
}

customElements.define('health-bridge-card', HealthBridgeCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "health-bridge-card",
  name: "Health Bridge Card",
  description: "A card that displays health metrics from Health Bridge integration"
});