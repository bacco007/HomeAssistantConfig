console.error('🚨🚨🚨 CALENDAR CARD JAVASCRIPT FILE LOADED! 🚨🚨🚨');

/**
 * Anniversary Calendar Card
 * Mini calendar view highlighting anniversary dates with popup details
 */

class AnniversaryCalendarCard extends HTMLElement {
  constructor() {
    super();
    console.error('🚨🚨🚨 CALENDAR CARD CONSTRUCTOR CALLED! 🚨🚨🚨');
    this.attachShadow({ mode: 'open' });
    this.currentMonth = new Date();
  }

  setConfig(config) {
    this.config = {
      title: config.title || 'Anniversary Calendar',
      months_to_show: config.months_to_show || 1,
      show_navigation: config.show_navigation !== false,
      show_details_popup: config.show_details_popup !== false,
      entity_filter: config.entity_filter || 'sensor.anniversary_*',
      ...config
    };
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getAnniversaryEntities() {
    if (!this._hass) return [];
    
    return Object.keys(this._hass.states)
      .filter(entityId => {
        if (this.config.entities) {
          return this.config.entities.includes(entityId);
        }
        return entityId.match(/^sensor\.anniversary_.*/) && 
               !entityId.includes('upcoming_anniversaries');
      })
      .map(entityId => this._hass.states[entityId])
      .filter(entity => entity && entity.state !== 'unavailable');
  }

  getAnniversariesForDate(date) {
    const entities = this.getAnniversaryEntities();
    const dateStr = date.toISOString().split('T')[0];
    
    return entities.filter(entity => {
      const nextDate = entity.attributes.next_date;
      return nextDate === dateStr;
    });
  }

  navigateMonth(direction) {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.render();
  }

  showDetails(event, anniversaries) {
    if (!this.config.show_details_popup || anniversaries.length === 0) return;
    
    // Remove existing popup
    const existing = this.shadowRoot.querySelector('.details-popup');
    if (existing) existing.remove();
    
    const popup = document.createElement('div');
    popup.className = 'details-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <span>Anniversaries</span>
          <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
        </div>
        ${anniversaries.map(entity => `
          <div class="popup-item">
            <div class="popup-name">${entity.attributes.friendly_name}</div>
            <div class="popup-details">
              ${entity.attributes.years_at_anniversary ? `${entity.attributes.years_at_anniversary} years` : ''}
              ${entity.attributes.zodiac_sign ? `• ${entity.attributes.zodiac_sign}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.shadowRoot.appendChild(popup);
    
    // Position popup
    const rect = event.target.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 5}px`;
  }

  renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOfWeek = new Date(firstDay);
    startOfWeek.setDate(firstDay.getDate() - firstDay.getDay());
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let calendarHTML = `
      <div class="calendar-month">
        <div class="month-header">
          ${this.config.show_navigation ? 
            `<button class="nav-btn" onclick="this.getRootNode().host.navigateMonth(-1)">‹</button>` : ''
          }
          <span class="month-title">${monthNames[month]} ${year}</span>
          ${this.config.show_navigation ? 
            `<button class="nav-btn" onclick="this.getRootNode().host.navigateMonth(1)">›</button>` : ''
          }
        </div>
        
        <div class="calendar-grid">
          ${dayNames.map(day => `<div class="day-header">${day}</div>`).join('')}
    `;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + (week * 7) + day);
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.getTime() === today.getTime();
        const anniversaries = this.getAnniversariesForDate(currentDate);
        const hasAnniversary = anniversaries.length > 0;
        
        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (hasAnniversary) dayClass += ' has-anniversary';
        
        calendarHTML += `
          <div class="${dayClass}" 
               onclick="this.getRootNode().host.showDetails(event, ${JSON.stringify(anniversaries).replace(/"/g, '&quot;')})">
            <span class="day-number">${currentDate.getDate()}</span>
            ${hasAnniversary ? `<div class="anniversary-indicator">${anniversaries.length}</div>` : ''}
          </div>
        `;
      }
    }
    
    calendarHTML += `
        </div>
      </div>
    `;
    
    return calendarHTML;
  }

  render() {
    if (!this._hass) return;
    
    const month = this.currentMonth.getMonth();
    const year = this.currentMonth.getFullYear();
    
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
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 16px;
          color: var(--primary-text-color);
          text-align: center;
        }
        .calendar-month {
          margin-bottom: 20px;
        }
        .month-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 8px;
        }
        .month-title {
          font-size: 1.1em;
          font-weight: bold;
          color: var(--primary-text-color);
        }
        .nav-btn {
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-size: 1.2em;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:hover {
          background: var(--primary-color-dark);
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--divider-color);
          border-radius: 8px;
          overflow: hidden;
        }
        .day-header {
          background: var(--secondary-background-color);
          padding: 8px 4px;
          text-align: center;
          font-size: 0.8em;
          font-weight: bold;
          color: var(--secondary-text-color);
        }
        .calendar-day {
          background: var(--card-background-color);
          min-height: 40px;
          padding: 4px;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          transition: background-color 0.2s;
        }
        .calendar-day:hover {
          background: var(--secondary-background-color);
        }
        .calendar-day.other-month {
          color: var(--disabled-text-color);
          background: var(--secondary-background-color);
        }
        .calendar-day.today {
          background: var(--primary-color);
          color: white;
          font-weight: bold;
        }
        .calendar-day.has-anniversary {
          background: linear-gradient(135deg, var(--success-color), var(--success-color-dark));
          color: white;
        }
        .calendar-day.today.has-anniversary {
          background: linear-gradient(135deg, var(--error-color), var(--error-color-dark));
          animation: pulse 2s infinite;
        }
        .day-number {
          font-size: 0.9em;
        }
        .anniversary-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(255, 255, 255, 0.9);
          color: var(--primary-color);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 0.7em;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .details-popup {
          position: fixed;
          z-index: 1000;
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--divider-color);
          max-width: 300px;
        }
        .popup-content {
          padding: 16px;
        }
        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-weight: bold;
          color: var(--primary-text-color);
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: var(--secondary-text-color);
          padding: 0;
          width: 24px;
          height: 24px;
        }
        .popup-item {
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--divider-color);
        }
        .popup-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        .popup-name {
          font-weight: bold;
          color: var(--primary-text-color);
        }
        .popup-details {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          margin-top: 2px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      </style>
      
      <div class="card">
        <div class="card-header">${this.config.title}</div>
        ${this.renderCalendar(month, year)}
      </div>
    `;
  }

  getCardSize() {
    return 3;
  }

  // Required method for Home Assistant card validation
  static getStubConfig() {
    return {
      type: 'custom:anniversary-calendar-card',
      title: 'Anniversary Calendar'
    };
  }
}

customElements.define('anniversary-calendar-card', AnniversaryCalendarCard);

// Register the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'custom:anniversary-calendar-card',
  name: 'Anniversary Calendar Card',
  description: 'Mini calendar view highlighting anniversary dates',
  preview: true
});

console.info(
  '%c  ANNIVERSARY-CALENDAR-CARD  %c  Version 1.0.0  ',
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);
