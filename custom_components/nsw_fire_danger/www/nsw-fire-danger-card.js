class NSWFireDangerCard extends HTMLElement {
  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }

    this.config = config;

    if (!this.content) {
      const card = document.createElement('ha-card');
      card.style.overflow = 'hidden';
      this.content = document.createElement('div');
      this.content.style.padding = '0';
      card.appendChild(this.content);
      this.appendChild(card);
    }
  }

  set hass(hass) {
    this._hass = hass;

    const entity = hass.states[this.config.entity];
    if (!entity) {
      this.content.innerHTML = `
        <div style="color: red; padding: 16px;">Entity ${this.config.entity} not found</div>
      `;
      return;
    }

    const rating = entity.state || 'UNKNOWN';
    const areaName = entity.attributes.area_name || 'Unknown Area';
    const lastUpdated = entity.attributes.last_updated || '';

    const baseEntityId = this.config.entity.replace('_rating_today', '');
    const tobanToday = hass.states[`${baseEntityId}_total_fire_ban_today`]?.state || 'No';
    const ratingTomorrow = hass.states[`${baseEntityId}_rating_tomorrow`]?.state || 'UNKNOWN';
    const ratingDay3 = hass.states[`${baseEntityId}_rating_day_3`]?.state || 'UNKNOWN';
    const ratingDay4 = hass.states[`${baseEntityId}_rating_day_4`]?.state || 'UNKNOWN';
    const tobanTomorrow = hass.states[`${baseEntityId}_total_fire_ban_tomorrow`]?.state || 'No';
    const tobanDay3 = hass.states[`${baseEntityId}_total_fire_ban_day_3`]?.state || 'No';
    const tobanDay4 = hass.states[`${baseEntityId}_total_fire_ban_day_4`]?.state || 'No';

    let dateStr = 'Today';
    if (lastUpdated) {
      const date = new Date(lastUpdated);
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      dateStr = date.toLocaleDateString('en-AU', options);
    }

    const ratingInfo = this.getRatingInfo(rating);
    const needleAngle = this.getNeedleAngle(rating);
    const hasBan = tobanToday === 'Yes';

    const COLORS = {
      MODERATE: '#71b94b',
      HIGH: '#fef200',
      EXTREME: '#f59330',
      CATASTROPHIC: '#ce161e'
    };

    const banSvg = `
      <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.3304 26.5739C8.1986 24.2452 7.11077 22.0411 7.73271 19.0307C8.19186 16.8078 9.6953 14.9993 9.83946 12.7807C10.4817 13.9494 10.75 14.7921 10.8218 16.0134C12.8644 13.5109 14.2142 10.0464 14.2941 6.40723C14.2941 6.40723 19.6143 9.53323 19.9634 14.2551C20.4214 13.2818 20.652 11.7361 20.194 10.7343C21.568 11.7361 29.61 20.63 19.1047 26.5739C21.0798 22.7281 19.6142 17.539 16.1849 15.1425C16.4139 16.173 16.0124 20.0164 14.4952 21.7053C14.9156 18.8834 14.0953 17.6901 14.0953 17.6901C14.0953 17.6901 13.8137 19.2708 12.7213 20.8675C11.7237 22.3256 11.0325 23.8731 12.3304 26.5739Z" fill="currentColor"></path>
        <path d="M24.8596 28.057L25.2132 28.4105L25.5668 28.057L27.6881 25.9357L28.0416 25.5821L27.6881 25.2286L6.47487 4.01536L6.12132 3.66181L5.76777 4.01536L3.64645 6.13668L3.29289 6.49023L3.64645 6.84379L24.8596 28.057Z" fill="#DB4433" stroke="white" stroke-width="0.5"></path>
        <circle cx="16" cy="16.4902" r="14.5" stroke="#DB4433" stroke-width="3"></circle>
      </svg>
    `;

    // Calculate forecast day names
    const todayDate = lastUpdated ? new Date(lastUpdated) : new Date();
    const getDayName = (offset) => {
      const d = new Date(todayDate);
      d.setDate(d.getDate() + offset);
      return d.toLocaleDateString('en-AU', { weekday: 'long' });
    };

    this.content.innerHTML = `
      <style>
        .nsw-fire-card {
           padding: 16px;
           text-align: center;
           color: var(--primary-text-color);
           font-family: var(--paper-font-body1_-_font-family, inherit);
           background: var(--ha-card-background, var(--card-background-color, white));
        }
        .header-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .header-date {
          font-size: 14px;
          color: var(--secondary-text-color);
          margin-bottom: 20px;
        }
        .gauge-container {
          position: relative;
          width: 260px;
          height: 140px;
          margin: 0 auto;
        }
        .gauge-svg {
          width: 100%;
          height: 100%;
        }
        .needle-pivot {
          transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: 130px 130px;
          transform: rotate(${needleAngle}deg);
        }
        .rating-box {
          background: ${ratingInfo.color};
          color: #212121;
          padding: 8px 30px;
          font-size: 24px;
          font-weight: 900;
          border: 2px solid #212121;
          margin: 16px auto;
          display: inline-block;
          text-transform: uppercase;
        }
        .rating-message {
          font-size: 20px;
          font-weight: 700;
          line-height: 1.3;
          margin: 16px 0;
          max-width: 300px;
          margin-left: auto;
          margin-right: auto;
        }
        .ban-section {
          display: ${hasBan ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          margin-top: 20px;
        }
        .ban-logo {
          width: 42px;
          height: 42px;
          margin-right: 12px;
        }
        .ban-label {
          font-size: 20px;
          font-weight: 800;
        }
        .forecast-grid {
          display: flex;
          gap: 8px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--divider-color, rgba(0,0,0,0.1));
        }
        .forecast-item {
          flex: 1;
          background: var(--secondary-background-color, #f8f9fa);
          border-radius: 10px;
          padding: 10px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid var(--divider-color, rgba(0,0,0,0.05));
        }
        .fc-day {
          font-size: 11px;
          font-weight: 700;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
        }
        .fc-rating-tag {
          font-weight: 900;
          padding: 4px 0;
          border-radius: 4px;
          width: 90%;
          text-align: center;
          font-size: 10px;
          margin-bottom: 4px;
          color: #212121;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .fc-ban-badge {
          font-size: 8px;
          font-weight: 950;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 4px;
          color: var(--secondary-text-color);
          opacity: 0.3;
          border: 1px solid transparent;
          text-transform: uppercase;
        }
        .fc-ban-badge.active {
          color: #ce161e;
          opacity: 1;
          background: rgba(206, 22, 30, 0.1);
          border: 1px solid #ce161e;
        }
      </style>
      
      <div class="nsw-fire-card">
        <div class="header-title">${areaName}</div>
        <div class="header-date">${dateStr}</div>
        
        <div class="gauge-container">
          <svg class="gauge-svg" viewBox="0 0 260 140">
             <path d="M 30 130 A 100 100 0 0 1 59.3 59.3 L 130 130 Z" fill="${COLORS.MODERATE}" stroke="#212121" stroke-width="1.5"/>
             <path d="M 59.3 59.3 A 100 100 0 0 1 130 30 L 130 130 Z" fill="${COLORS.HIGH}" stroke="#212121" stroke-width="1.5"/>
             <path d="M 130 30 A 100 100 0 0 1 200.7 59.3 L 130 130 Z" fill="${COLORS.EXTREME}" stroke="#212121" stroke-width="1.5"/>
             <path d="M 200.7 59.3 A 100 100 0 0 1 230 130 L 130 130 Z" fill="${COLORS.CATASTROPHIC}" stroke="#212121" stroke-width="1.5"/>
             <line x1="30" y1="130" x2="230" y2="130" stroke="#212121" stroke-width="2"/>
             <g class="needle-pivot">
                <path d="M 130 130 L 126 120 L 130 40 L 134 120 Z" fill="white" stroke="#212121" stroke-width="1.5"/>
                <circle cx="130" cy="130" r="10" fill="white" stroke="#212121" stroke-width="2"/>
                <circle cx="130" cy="130" r="4" fill="#212121"/>
             </g>
          </svg>
        </div>
        
        <div class="rating-box">${rating}</div>
        <div class="rating-message">${ratingInfo.message}</div>
        
        <div class="ban-section">
          <div class="ban-logo">${banSvg}</div>
          <div class="ban-label">Total Fire Ban</div>
        </div>
        
        <div class="forecast-grid">
          ${this.createForecastItem('Tomorrow', ratingTomorrow, tobanTomorrow)}
          ${this.createForecastItem(getDayName(2), ratingDay3, tobanDay3)}
          ${this.createForecastItem(getDayName(3), ratingDay4, tobanDay4)}
        </div>
      </div>
    `;
  }

  createForecastItem(day, rating, toban) {
    const info = this.getRatingInfo(rating);
    const isBan = toban === 'Yes';
    return `
      <div class="forecast-item">
        <div class="fc-day">${day}</div>
        <div class="fc-rating-tag" style="background: ${info.color};">
          ${rating === 'NO RATING' ? 'NONE' : rating}
        </div>
        <div class="fc-ban-badge ${isBan ? 'active' : ''}">
          ${isBan ? 'FIRE BAN' : 'NO BAN'}
        </div>
      </div>
    `;
  }

  getNeedleAngle(rating) {
    const angles = {
      'MODERATE': -67.5,
      'HIGH': -22.5,
      'EXTREME': 22.5,
      'CATASTROPHIC': 67.5,
      'NO RATING': -90
    };
    return angles[rating] || -90;
  }

  getRatingInfo(rating) {
    const ratings = {
      'MODERATE': { color: '#71b94b', message: 'Plan and prepare' },
      'HIGH': { color: '#fef200', message: 'Be ready to act' },
      'EXTREME': { color: '#f59330', message: 'Take action now to protect your life and property' },
      'CATASTROPHIC': { color: '#ce161e', message: 'For your survival, leave bush fire risk areas' },
      'NO RATING': { color: '#ffffff', message: 'No rating issued' }
    };
    return ratings[rating] || { color: 'transparent', message: 'Check local conditions' };
  }

  getCardSize() {
    return 7;
  }

  static getStubConfig() {
    return {
      entity: "sensor.nsw_fire_danger_greater_sydney_region_rating_today"
    };
  }
}

if (!customElements.get('nsw-fire-danger-card')) {
  customElements.define('nsw-fire-danger-card', NSWFireDangerCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'nsw-fire-danger-card',
    name: 'NSW Fire Danger Card',
    description: 'Official NSW RFS style fire danger card.',
    preview: true,
    documentationURL: 'https://github.com/vwylaw/nsw_fire_danger'
  });
}

console.info(
  '%c NSW-FIRE-DANGER-CARD %c Version 1.3.10 ',
  'color: white; background: #ce161e; font-weight: 700;',
  'color: #ce161e; background: white; font-weight: 700;'
);
