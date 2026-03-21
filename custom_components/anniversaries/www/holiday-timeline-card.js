/**
 * Holiday Timeline Card v1.0.1
 * Shows upcoming holidays only in chronological order
 * Now uses universal color scheme (red → orange → green → blue) for urgency
 * Emoji selection expanded and matches latest const.py
 */

class HolidayTimelineCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._renderTimeout = null;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    
    console.log('🎉 [Holiday Card] setConfig called with:', config);
    console.log('🎉 [Holiday Card] Raw config.date_format:', config.date_format);
    
    this.config = {
      title: config.title || '🎉 Upcoming Holidays',
      max_items: config.max_items || 5,
      date_format: config.date_format || 'long', // Default to long format
      show_day_of_week: config.show_day_of_week !== false,
      show_icons: config.show_icons !== false,
      color_coding: config.color_coding !== false,
      debug: config.debug || false
    };
    
    console.log('🎉 [Holiday Card] Final config:', this.config);
    
    if (this._hass) {
      this.scheduleRender();
    }
  }

  scheduleRender() {
    if (this._renderTimeout) {
      clearTimeout(this._renderTimeout);
    }
    this._renderTimeout = setTimeout(() => {
      this.render();
      this._renderTimeout = null;
    }, 0);
  }

  set hass(hass) {
    this._hass = hass;
    if (this.config) {
      this.scheduleRender();
    }
  }

  getHolidayEntities() {
    if (!this._hass || !this.config) return [];
    
    console.log('🎉 [Holiday Card] Getting holiday entities');
    
    const entities = Object.keys(this._hass.states)
      .filter(entityId => {
        const entity = this._hass.states[entityId];
        if (!entity) return false;
        
        // Must be a sensor
        if (!entityId.startsWith('sensor.')) return false;
        
        // Skip aggregation sensors
        if (entityId.includes('upcoming_anniversaries')) return false;
        
        // Check if it's a holiday entity
        return this.isHolidayEntity(entity);
      })
      .map(entityId => this._hass.states[entityId])
      .filter(entity => {
        if (!entity || entity.state === 'unavailable') return false;
        
        // Must have holiday category
        const entityCategory = entity.attributes.category || 'other';
        const isHoliday = entityCategory === 'holiday';
        
        if (this.config.debug) {
          console.log(`🎉 [Holiday Card] Entity ${entity.entity_id}: category="${entityCategory}", isHoliday=${isHoliday}`);
        }
        
        return isHoliday;
      })
      .sort((a, b) => {
        // Sort by days until holiday
        return parseInt(a.state) - parseInt(b.state);
      })
      .slice(0, this.config.max_items);
    
    console.log(`🎉 [Holiday Card] Found ${entities.length} holiday entities`);
    return entities;
  }

  isHolidayEntity(entity) {
    if (!entity || !entity.attributes) return false;
    
    const attrs = entity.attributes;
    
    // Holiday entities have these core attributes (more relaxed than birthday requirements)
    const hasHolidayAttributes = (
      attrs.next_date !== undefined &&
      attrs.category !== undefined &&
      attrs.category === 'holiday'
    );
    
    // Must have valid state (days until)
    const hasValidState = (
      entity.state !== 'unavailable' &&
      !isNaN(parseInt(entity.state)) &&
      parseInt(entity.state) >= 0
    );
    
    return hasHolidayAttributes && hasValidState;
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    if (!this.config) {
      console.warn('Holiday Card: formatDate called before config is set');
      return dateString;
    }
    
    console.log(`🎉 [Holiday Card] formatDate called with: "${dateString}", format: "${this.config.date_format}"`);
    
    try {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const locale = navigator.language || 'en-US';
      
      let formattedDate;
      
      switch (this.config.date_format) {
        case 'short':
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          break;
          
        case 'numeric':
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
          });
          break;
          
        case 'full':
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          });
          break;
          
        case 'long':
        default:
          formattedDate = date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          break;
      }
      
      // Add day of week if requested and not already included
      if (this.config.show_day_of_week && this.config.date_format !== 'full') {
        const dayOfWeek = date.toLocaleDateString(locale, { weekday: 'long' });
        formattedDate = `${dayOfWeek}, ${formattedDate}`;
      }
      
      console.log(`🎉 [Holiday Card] Final formatted date: "${formattedDate}"`);
      return formattedDate;
      
    } catch (error) {
      console.warn('Holiday Card: Date formatting error:', error);
      return dateString;
    }
  }

  getColorForDays(days) {
    if (!this.config.color_coding) return '#FF9800';
    
    // Universal time-based color scheme: Red (urgent) → Yellow (soon) → Green (safe) → Blue (distant)
    if (days === 0) return '#F44336';      // Red - today (urgent!)
    if (days <= 7) return '#FF9800';       // Orange - this week (attention needed)
    if (days <= 30) return '#4CAF50';      // Green - this month (comfortable distance)
    return '#2196F3';                      // Blue - future (distant, calm)
  }

  render() {
    if (!this.config || !this._hass) return;
    
    const entities = this.getHolidayEntities();
    
    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          padding: 16px;
          margin: 4px;
        }
        .card-header {
          font-size: 1.5em;
          font-weight: bold;
          margin-bottom: 16px;
          color: var(--primary-text-color);
        }
        .timeline-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        .timeline-item:last-child {
          border-bottom: none;
        }
        .timeline-icon {
          font-size: 24px;
          margin-right: 12px;
          min-width: 32px;
        }
        .timeline-content {
          flex: 1;
        }
        .timeline-name {
          font-weight: bold;
          color: var(--primary-text-color);
          margin-bottom: 4px;
        }
        .timeline-date {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          margin-bottom: 4px;
        }
        .timeline-attributes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .attribute-badge {
          background: var(--secondary-background-color);
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 0.8em;
          color: var(--primary-text-color);
        }
        .days-counter {
          text-align: center;
          min-width: 60px;
          font-weight: bold;
          font-size: 1.1em;
          padding: 8px;
          border-radius: 8px;
          color: white;
        }
        .no-holidays {
          text-align: center;
          color: var(--secondary-text-color);
          padding: 20px;
        }
        .debug-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 4px;
          padding: 8px;
          margin: 8px 0;
          font-size: 12px;
        }
      </style>
      
      <div class="card">
        <div class="card-header">${this.config.title}</div>
        ${this.config.debug ? this.renderDebugInfo(entities) : ''}
        ${entities.length === 0 ? 
          '<div class="no-holidays">No upcoming holidays found</div>' :
          entities.map(entity => this.renderTimelineItem(entity)).join('')
        }
      </div>
    `;
  }

  renderDebugInfo(entities) {
    const allEntities = Object.keys(this._hass.states)
      .filter(entityId => entityId.startsWith('sensor.') && !entityId.includes('upcoming_anniversaries'))
      .map(entityId => this._hass.states[entityId])
      .filter(entity => entity && entity.state !== 'unavailable' && this.isHolidayEntity(entity));
    
    const allCategories = allEntities.map(e => e.attributes.category || 'other');
    
    return `
      <div class="debug-info">
        <strong>🎉 Holiday Card Debug:</strong><br>
        <strong>Date Format:</strong> ${this.config.date_format}<br>
        <strong>Show Day of Week:</strong> ${this.config.show_day_of_week}<br>
        <strong>Max Items:</strong> ${this.config.max_items}<br>
        <strong>All Holiday Entities Found:</strong> ${allEntities.length}<br>
        <strong>Categories:</strong> ${[...new Set(allCategories)].join(', ')}<br>
        <strong>Displayed:</strong> ${entities.length}<br>
        <strong>Entity Details:</strong><br>
        ${allEntities.slice(0, 5).map(e => `&nbsp;&nbsp;• ${e.entity_id}: category="${e.attributes.category || 'other'}", days=${e.state}`).join('<br>')}
        ${allEntities.length > 5 ? `<br>&nbsp;&nbsp;... and ${allEntities.length - 5} more` : ''}
      </div>
    `;
  }

  renderTimelineItem(entity) {
    const days = parseInt(entity.state);
    const attrs = entity.attributes;
    
    // Get emoji: use custom_emoji if available, otherwise use default holiday emoji
    const icon = this.config.show_icons ? this.getDisplayEmoji(attrs) : '';
    const color = this.getColorForDays(days);
    
    return `
      <div class="timeline-item">
        ${icon ? `<div class="timeline-icon">${icon}</div>` : ''}
        <div class="timeline-content">
          <div class="timeline-name">
            ${attrs.friendly_name || attrs.name || entity.entity_id}
          </div>
          <div class="timeline-date">
            ${this.formatDate(attrs.next_date)}
            ${attrs.current_years ? ` (${attrs.current_years} years)` : ''}
          </div>
          <div class="timeline-attributes">
            ${this.renderAttributes(attrs)}
          </div>
        </div>
        <div class="days-counter" style="background-color: ${color}">
          ${days} day${days !== 1 ? 's' : ''}
        </div>
      </div>
    `;
  }

  getDisplayEmoji(attrs) {
    // Priority: custom_emoji > category-specific default > generic holiday default
    if (attrs.custom_emoji) {
      console.log(`🎉 [Holiday Card] Using custom emoji: ${attrs.custom_emoji} for ${attrs.friendly_name}`);
      return attrs.custom_emoji;
    }
    
    // Fallback to holiday default
    console.log(`🎉 [Holiday Card] Using default holiday emoji: 🎉 for ${attrs.friendly_name}`);
    return '🎉';
  }

  renderAttributes(attrs) {
    const attributes = [];
    
    // Holiday-specific attributes (no zodiac or birthstone)
    if (attrs.generation) {
      attributes.push(`<span class="attribute-badge">👥 ${attrs.generation}</span>`);
    }
    
    if (attrs.named_anniversary) {
      attributes.push(`<span class="attribute-badge">💫 ${attrs.named_anniversary}</span>`);
    }
    
    if (attrs.current_years && attrs.current_years > 0) {
      attributes.push(`<span class="attribute-badge">📆 ${attrs.current_years} years</span>`);
    }
    
    return attributes.join('');
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      type: 'custom:holiday-timeline-card',
      title: '🎉 Upcoming Holidays',
      date_format: 'long',
      max_items: 5
    };
  }
}

// Register the card
customElements.define('holiday-timeline-card', HolidayTimelineCard);

// Register with Home Assistant
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'holiday-timeline-card',
  name: 'Holiday Timeline Card',
  description: 'Display upcoming holidays in chronological order with festive theme',
  preview: true
});

console.info(
  '%c  HOLIDAY-TIMELINE-CARD  %c  Version 1.0.0 - Holiday-Only Timeline  ',
  'color: #FF9800; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: #FF5722'
);
