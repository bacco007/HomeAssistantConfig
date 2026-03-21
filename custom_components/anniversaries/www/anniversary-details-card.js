console.error('🚨🚨🚨 DETAILS CARD JAVASCRIPT FILE LOADED! 🚨🚨🚨');
console.error('🚨 File timestamp:', new Date().toISOString());

/**
 * Anniversary Details Card
 * Focus on a single anniversary with rich details and all attributes
 */

class AnniversaryDetailsCard extends HTMLElement {
  constructor() {
    super();
    console.error('🚨🚨🚨 DETAILS CARD CONSTRUCTOR CALLED! 🚨🚨🚨');
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('You need to define an entity');
    }
    
    // VERY OBVIOUS DEBUG MESSAGE
    console.error('🚨🚨🚨 DETAILS CARD setConfig() WAS CALLED! 🚨🚨🚨');
    console.error('🔧 [Details Card] setConfig called with:', config);
    
    this.config = {
      entity: config.entity,
      show_attributes: config.show_attributes !== false,
      show_background: config.show_background !== false,
      show_animation: config.show_animation !== false,
      compact_mode: config.compact_mode || false,
      date_format: config.date_format || 'long',
      custom_date_format: config.custom_date_format || null,
      locale: config.locale || null,
      ...config
    };
  }

  formatDate(dateStr) {
    // Use same logic as anniversary-timeline-card.js
    const optionsMap = {
      long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      short: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
      numeric: { year: 'numeric', month: 'numeric', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    };
    try {
      const date = new Date(dateStr);
      if (this.config.date_format === 'custom' && this.config.custom_date_format) {
        // Use dayjs if available, fallback to ISO
        if (window.dayjs) {
          return window.dayjs(date).format(this.config.custom_date_format);
        }
        return dateStr;
      }
      const options = optionsMap[this.config.date_format] || optionsMap['long'];
      return date.toLocaleDateString(this.config.locale || undefined, options);
    } catch (e) {
      return dateStr;
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getZodiacEmoji(sign) {
    const zodiacEmojis = {
      'Aquarius': '♒', 'Pisces': '♓', 'Aries': '♈', 'Taurus': '♉',
      'Gemini': '♊', 'Cancer': '♋', 'Leo': '♌', 'Virgo': '♍',
      'Libra': '♎', 'Scorpio': '♏', 'Sagittarius': '♐', 'Capricorn': '♑'
    };
    return zodiacEmojis[sign] || '⭐';
  }

  getBirthstoneEmoji(stone) {
    const stoneEmojis = {
      'Garnet': '🔴', 'Amethyst': '🟣', 'Aquamarine': '🔵', 'Diamond': '💎',
      'Emerald': '🟢', 'Pearl': '⚪', 'Ruby': '♦️', 'Peridot': '🟡',
      'Sapphire': '🔷', 'Opal': '🌈', 'Topaz': '🟠', 'Turquoise': '🩵'
    };
    return stoneEmojis[stone] || '💍';
  }

  getBackgroundGradient(days) {
    if (!this.config.show_background) return 'var(--card-background-color)';
    
    if (days === 0) return 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    if (days <= 7) return 'linear-gradient(135deg, #ffa726, #ff9800)';
    if (days <= 30) return 'linear-gradient(135deg, #42a5f5, #1976d2)';
    return 'linear-gradient(135deg, #66bb6a, #4caf50)';
  }

  render() {
    if (!this._hass) return;
    const entity = this._hass.states[this.config.entity];
    if (!entity) {
      this.shadowRoot.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--error-color);">
          Entity "${this.config.entity}" not found
        </div>
      `;
      return;
    }
    const days = parseInt(entity.state);
    const attrs = entity.attributes;
    const background = this.getBackgroundGradient(days);
    const isToday = days === 0;
    const isMilestone = attrs.is_milestone;
    const category = attrs.category || 'other';

    let attributesHtml = '';
    if (this.config.show_attributes) {
      if (category === 'birthday') {
        attributesHtml = this.renderBirthdayAttributes(attrs);
      } else if (category === 'anniversary') {
        attributesHtml = this.renderAnniversaryAttributes(attrs);
      } else if (category === 'holiday') {
        attributesHtml = this.renderHolidayAttributes(attrs);
      } else {
        attributesHtml = this.renderDefaultAttributes(attrs);
      }
    }

    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: ${background};
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          padding: 24px;
          margin: 4px;
          color: ${this.config.show_background ? 'white' : 'var(--primary-text-color)'};
          position: relative;
          overflow: hidden;
        }
        .card-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .entity-name {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .countdown-display {
          text-align: center;
          margin: 20px 0;
        }
        .days-number {
          font-size: 4em;
          font-weight: bold;
          line-height: 1;
          ${isToday ? 'animation: pulse 1s infinite;' : ''}
          ${isMilestone ? 'animation: sparkle 2s infinite;' : ''}
        }
        .days-label {
          font-size: 1.2em;
          opacity: 0.9;
        }
        .anniversary-date {
          text-align: center;
          font-size: 1.1em;
          margin: 16px 0;
          opacity: 0.9;
        }
        .attributes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        .attribute-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
          backdrop-filter: blur(5px);
        }
        .attribute-icon {
          font-size: 1.5em;
          margin-bottom: 4px;
        }
        .attribute-label {
          font-size: 0.8em;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .attribute-value {
          font-weight: bold;
          margin-top: 4px;
        }
        .celebration-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          background: radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
          ${isToday && this.config.show_animation ? 'animation: celebrate 3s infinite;' : ''}
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        @keyframes celebrate {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .compact {
          padding: 16px;
        }
        .compact .days-number {
          font-size: 2.5em;
        }
        .compact .entity-name {
          font-size: 1.2em;
        }
      </style>
      <div class="card ${this.config.compact_mode ? 'compact' : ''}">
        ${isToday ? '<div class="celebration-overlay"></div>' : ''}
        <div class="card-header">
          <div class="entity-name">${attrs.friendly_name || entity.entity_id}</div>
        </div>
        <div class="countdown-display">
          <div class="days-number">${days}</div>
          <div class="days-label">${days === 1 ? 'Day' : 'Days'} ${isToday ? 'TODAY! 🎉' : ''}</div>
        </div>
        <div class="anniversary-date">
          📅 ${this.formatDate(attrs.next_date)}
          ${attrs.years_at_anniversary ? `<br>🎂 ${attrs.years_at_anniversary} years` : ''}
        </div>
        ${attributesHtml}
      </div>
    `;
  }

  // Birthday template (original, untouched)
  renderBirthdayAttributes(attrs) {
    const attributeItems = [];
    if (attrs.zodiac_sign) {
      attributeItems.push({
        icon: this.getZodiacEmoji(attrs.zodiac_sign),
        label: 'Zodiac',
        value: attrs.zodiac_sign
      });
    }
    if (attrs.birthstone) {
      attributeItems.push({
        icon: this.getBirthstoneEmoji(attrs.birthstone),
        label: 'Birthstone',
        value: attrs.birthstone
      });
    }
    if (attrs.birth_flower) {
      attributeItems.push({
        icon: '🌸',
        label: 'Birth Flower',
        value: attrs.birth_flower
      });
    }
    if (attrs.generation) {
      attributeItems.push({
        icon: '👥',
        label: 'Generation',
        value: attrs.generation
      });
    }
    if (attrs.named_anniversary) {
      attributeItems.push({
        icon: '💫',
        label: 'Anniversary',
        value: attrs.named_anniversary
      });
    }
    if (attrs.current_years !== undefined) {
      attributeItems.push({
        icon: '📊',
        label: 'Current Age',
        value: `${attrs.current_years} years`
      });
    }
    if (attrs.weeks_remaining !== undefined) {
      attributeItems.push({
        icon: '📆',
        label: 'Weeks Left',
        value: attrs.weeks_remaining
      });
    }
    if (attributeItems.length === 0) return '';
    return `
      <div class="attributes-grid">
        ${attributeItems.map(item => `
          <div class="attribute-item">
            <div class="attribute-icon">${item.icon}</div>
            <div class="attribute-label">${item.label}</div>
            <div class="attribute-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Anniversary template (no zodiac, birthstone, etc.; show named anniversary, suggested gifts)
  renderAnniversaryAttributes(attrs) {
    const attributeItems = [];
    if (attrs.named_anniversary) {
      attributeItems.push({
        icon: '💫',
        label: 'Named Anniversary',
        value: attrs.named_anniversary
      });
    }
    if (attrs.suggested_gift) {
      attributeItems.push({
        icon: '🎁',
        label: 'Suggested Gift',
        value: attrs.suggested_gift
      });
    }
    if (attrs.current_years !== undefined) {
      attributeItems.push({
        icon: '📅',
        label: 'Years Together',
        value: `${attrs.current_years} years`
      });
    }
    if (attrs.milestone) {
      attributeItems.push({
        icon: '🏆',
        label: 'Milestone',
        value: attrs.milestone
      });
    }
    if (attributeItems.length === 0) return '';
    return `
      <div class="attributes-grid">
        ${attributeItems.map(item => `
          <div class="attribute-item">
            <div class="attribute-icon">${item.icon}</div>
            <div class="attribute-label">${item.label}</div>
            <div class="attribute-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Holiday template (no years old, gemstones, generation, etc.)
  renderHolidayAttributes(attrs) {
    const attributeItems = [];
    if (attrs.holiday_type) {
      attributeItems.push({
        icon: '🎉',
        label: 'Holiday Type',
        value: attrs.holiday_type
      });
    }
    if (attrs.region) {
      attributeItems.push({
        icon: '🌍',
        label: 'Region',
        value: attrs.region
      });
    }
    if (attrs.notes) {
      attributeItems.push({
        icon: '📝',
        label: 'Notes',
        value: attrs.notes
      });
    }
    if (attributeItems.length === 0) return '';
    return `
      <div class="attributes-grid">
        ${attributeItems.map(item => `
          <div class="attribute-item">
            <div class="attribute-icon">${item.icon}</div>
            <div class="attribute-label">${item.label}</div>
            <div class="attribute-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Default template for other categories
  renderDefaultAttributes(attrs) {
    const attributeItems = [];
    if (attrs.named_anniversary) {
      attributeItems.push({
        icon: '💫',
        label: 'Anniversary',
        value: attrs.named_anniversary
      });
    }
    if (attrs.current_years !== undefined) {
      attributeItems.push({
        icon: '📊',
        label: 'Years',
        value: `${attrs.current_years} years`
      });
    }
    if (attributeItems.length === 0) return '';
    return `
      <div class="attributes-grid">
        ${attributeItems.map(item => `
          <div class="attribute-item">
            <div class="attribute-icon">${item.icon}</div>
            <div class="attribute-label">${item.label}</div>
            <div class="attribute-value">${item.value}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getCardSize() {
    return this.config.compact_mode ? 2 : 4;
  }

  // Required method for Home Assistant card validation
  static getStubConfig() {
    return {
      type: 'custom:anniversary-details-card',
      entity: 'sensor.anniversary_example'
    };
  }
}

customElements.define('anniversary-details-card', AnniversaryDetailsCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom:anniversary-details-card',
  name: 'Anniversary Details Card',
  description: 'Detailed view of a single anniversary with rich attributes',
  preview: true
});

console.info(
  '%c  ANNIVERSARY-DETAILS-CARD  %c  Version 1.0.0  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
