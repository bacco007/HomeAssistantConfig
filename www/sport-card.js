import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const VERSION = "0.0.1";

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  return true;
}

class SportsCard extends LitElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      hass: {},
      _config: {},
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define entity");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  renderMain() {
    const sensor = this._config.entity;

    var name = this.hass.states[sensor].attributes.friendly_name;
    var picture = this.hass.states[sensor].attributes.entity_picture;
    var nexttime = this.hass.states[sensor].attributes.nexttime;
    var nextevent = this.hass.states[sensor].attributes.nextevent;
    var nextlocation = this.hass.states[sensor].attributes.nextlocation;
    return html`
      <div class="schedule">
        <div class="schedule-main">
          <div class="schedule-main-left">
            <div class="schedule-main-left-info">
              <div class="left-title">${name}</div>
              <!-- <div class="left-subtitle">Subtitle</div> -->
            </div>
          </div>
          <div class="schedule-main-middle"></div>
          <div class="schedule-main-right">
            <div class="schedule-main-right-date">${nexttime}</div>
            <div class="schedule-main-right-logo">
              <img src="${picture}" valign="center" />
            </div>
          </div>
        </div>
        <div class="schedule-detail">${nextevent}</div>
      </div>
    `;
  }

  render() {
    //Check if config and hass is loaded
    if (!this._config || !this.hass) {
      return html``;
    }

    return html`
      ${this._config.style
        ? html`
            <style>
              ${this._config.style}
            </style>
          `
        : html``}
      <ha-card>
        <div id="container">${this.renderMain()}</div>
      </ha-card>
    `;
  }

  static get styles() {
    return css`
      body {
        font-family: Open Sans, Helvetica, Arial, Verdana, sans-serif;
        background: #f2f2f7;
      }
      .schedule {
        max-width: 100%;
        border-radius: 5px;
        overflow: hidden;
        #padding-bottom: 10px;
      }
      .schedule-main {
        background: #e2e2e2;
        display: flex;
      }
      .schedule-main-left {
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        align-items: center;
        position: relative;
        width: auto;
        min-width: 0;
        flex: 3;
      }
      .schedule-main-left-info {
        overflow: hidden;
        width: 100%;
        #white-space: nowrap;
      }
      .schedule-main-middle {
        # width: 300px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        box-sizing: border-box;
        position: relative;
        background: #fff;
      }
      .schedule-main-right {
        box-sizing: border-box;
        padding-left: 10px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        order: 3;
        width: 200px;
        min-width: auto;
      }
      .schedule-main-right-date {
        padding-right: 10px;
        white-space: nowrap;
        text-align: right;
        display: 18px;
        font-weight: 600;
      }
      .schedule-main-right-logo {
        position: relative;
        height: 60px;
        width: 105px;
        margin-left: 10px;
        overflow: hidden;
        background: #fff;
        z-index: 1;
      }
      .schedule-main-middle:before,
      .schedule-main-right-logo:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        border-color: transparent transparent transparent #e2e2e2;
        border-style: solid;
        border-width: 60px 0 0 15px;
      }
      .schedule-main-middle:after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        border-color: transparent #e2e2e2 transparent transparent;
        border-style: solid;
        border-width: 0 15px 60px 0;
      }
      .schedule-main-right-logo img {
        display: block;
        text-align: center;
        color: #212121;
        background: #fff;
        max-height: 95%;
        max-width: 80%;
        width: auto;
        height: auto;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        padding: 1px;
        z-index: -1;
      }
      .left-title {
        font-size: 16px;
      }
      .left-subtitle {
        font-size: 12px;
      }
      .left-title,
      .left-subtitle {
        # text-transform: uppercase;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .schedule-detail {
        background: #fff;
        padding: 10px !important;
        border-radius: 0 0 5px 5px;
        text-align: center;
      }
    `;
  }

  getCardSize() {
    return 2;
  }
}

if (!customElements.get("sports-card")) {
  customElements.define("sports-card", SportsCard);
  console.info(
    `%c SPORTS-CARD \n%c Version ${VERSION} `,
    "color: #2fbae5; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );
}
