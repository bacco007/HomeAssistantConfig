class GoogleTrendsCard extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define the entity");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (this.content) {
      this.updateContent();
    }
  }

  connectedCallback() {
    if (!this.content) {
      const card = document.createElement("ha-card");
      this.content = document.createElement("div");
      card.appendChild(this.content);
      this.appendChild(card);
    }
  }

  updateContent() {
    if (!this._hass || !this.config) {
      return;
    }

    const entity = this.config.entity;
    const fontSize = this.config.fontSize || '23px';
    const googleTrendsLogo = "/custom_components/google_trends/www/google-trends-logo.png";
    this.content.innerHTML = `
      <style>
        .google-trends-container {
          display: flex;
          align-items: center;
          padding: 8px 16px;
        }
        .google-trends-text {
          font-size: ${fontSize};
          margin-top: -10px;
          text-align: center;
          padding-bottom: 16px;
        }
      </style>
      <div class="google-trends-container">
        <img src="${googleTrendsLogo}" alt="Google Trends logo" width="150" height="35">
      </div>
      <div class="google-trends-text">${this._hass.states[entity].state}</div>
    `;
  }
}
customElements.define("google-trends-card", GoogleTrendsCard);