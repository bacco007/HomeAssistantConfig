import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const VERSION = "0.1";

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  return true;
}

class DockerCard extends LitElement {
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
    if (!config.entitypart) {
      throw new Error("Please define entity part");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  renderMain() {
    const type = this._config.sensortype || "monitor_docker";
    const entpart = this._config.entitypart;
    const logo = this._config.logo || "/local/systemicons/docker.svg";

    if (type == "hadockermon") {
      const name =
        this._config.name ||
        this.hass.states["binary_sensor." + entpart].attributes.friendly_name;
      const switchstate = this.hass.states["binary_sensor." + entpart].state;
      if (this.hass.states["binary_sensor." + entpart].state == "on") {
        var updown = "rgb(26,204,147,0.33)";
      } else {
        var updown = "rgb(255,0,0,0.33)";
      }
      var mem = this.hass.states["binary_sensor." + entpart].attributes.memory;
      var mem_icon = "mdi:memory";
      var netdown = this.hass.states["binary_sensor." + entpart].attributes
        .network_rx_total;
      var netdown_icon = "mdi:download";
      var netup = this.hass.states["binary_sensor." + entpart].attributes
        .network_tx_total;
      var netup_icon = "mdi:upload";
      const image = this.hass.states["binary_sensor." + entpart].attributes
        .image;
      const status = this.hass.states["binary_sensor." + entpart].attributes
        .status;
      return html`
        <section id="name">
          <div style="display: flex;">
            <img class="avatar" src="${logo}" />
            <div style="padding-left: 5px">
              <div><strong>${name}</strong></div>
              <div>${status}</div>
            </div>
          </div>
          <span class="dot" style="background-color: ${updown}"></span>
        </section>
        <section id="stats">
          ${mem
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${mem_icon}"></ha-icon>${mem}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:memory"></ha-icon>N/A
                </div>
              `}
          ${netdown
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netdown_icon}"></ha-icon
                  >${netdown}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:download"></ha-icon>N/A
                </div>
              `}
          ${netup
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netup_icon}"></ha-icon
                  >${netup}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:upload"></ha-icon>N/A
                </div>
              `}
        </section>
        <section class="collapseheader shade" @click=${this.toggle}>
          <h3>More Details</h3>
          <div class="toggle plusminus-button">
            <ha-icon
              icon=${this.open ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </div>
        </section>
        <section class="${this.open ? "expanded" : "collapsed"}">
          <h3>Image</h3>
          <div id="extra-div">${image}</div>
          <div id="extra-div">${switchstate}</div>
        </section>
      `;
    } else {
      const name =
        this._config.name ||
        this.hass.states["switch." + entpart].attributes.friendly_name;
      const switchstate = this.hass.states["switch." + entpart].state;
      if (this.hass.states["switch." + entpart].state == "on") {
        var updown = "rgb(26,204,147,0.33)";
      } else {
        var updown = "rgb(255,0,0,0.33)";
      }

      if (this.hass.states["sensor." + entpart].attributes.cpu_percentage) {
        var cpu = this.hass.states["sensor." + entpart].attributes
          .cpu_percentage;
        var cpu_icon = "mdi:chip";
        var cpu_uom = "%";
      }

      if (this.hass.states["sensor." + entpart].attributes.memory) {
        var mem = this.hass.states["sensor." + entpart].attributes.memory;
        var mem_icon = "mdi:memory";
        var mem_uom = "MB";
        var mempct = this.hass.states["sensor." + entpart].attributes
          .memory_percentage;
        var mempct_icon = "mdi:memory";
        var mempct_uom = "%";
      }

      if (this.hass.states["sensor." + entpart].attributes.network_speed_up) {
        var netspup = this.hass.states["sensor." + entpart].attributes
          .network_speed_up;
        var netspup_icon = "mdi:upload";
        var netspup_uom = "kB/s";
        var netspdown = this.hass.states["sensor." + entpart].attributes
          .network_speed_down;
        var netspdown_icon = "mdi:download";
        var netspdown_uom = "kB/s";
      }

      if (this.hass.states["sensor." + entpart].attributes.network_total_up) {
        var netup = this.hass.states["sensor." + entpart].attributes
          .network_total_up;
        var netup_icon = "mdi:upload";
        var netup_uom = "MB";
        var netdown = this.hass.states["sensor." + entpart].attributes
          .network_total_down;
        var netdown_icon = "mdi:download";
        var netdown_uom = "MB";
      }

      const image = this.hass.states["sensor." + entpart].attributes.image;
      const status = this.hass.states["sensor." + entpart].attributes.status;
      const health = this.hass.states["sensor." + entpart].attributes.health;
      const uptime = this.hass.states["sensor." + entpart].attributes.uptime;
      return html`
        <section id="name">
          <div style="display: flex;">
            <img class="avatar" src="${logo}" />
            <div style="padding-left: 5px">
              <div><strong>${name}</strong></div>
              <div>${status}</div>
            </div>
          </div>
          <span class="dot" style="background-color: ${updown}"></span>
        </section>
        <section id="stats">
          ${cpu
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${cpu_icon}"></ha-icon
                  >${cpu}${cpu_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:chip"></ha-icon>N/A
                </div>
              `}
          ${mempct
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${mem_icon}"></ha-icon
                  >${mem}${mem_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:memory"></ha-icon>N/A
                </div>
              `}
          ${mempct
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${mempct_icon}"></ha-icon
                  >${mempct}${mempct_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:memory"></ha-icon>N/A
                </div>
              `}
          ${netdown
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netdown_icon}"></ha-icon
                  >${netdown}${netdown_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:download"></ha-icon>N/A
                </div>
              `}
          ${netspdown
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netspdown_icon}"></ha-icon
                  >${netspdown}${netspdown_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:download"></ha-icon>N/A
                </div>
              `}
          ${netup
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netup_icon}"></ha-icon
                  >${netup}${netup_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:upload"></ha-icon>N/A
                </div>
              `}
          ${netspup
            ? html`
                <div>
                  <ha-icon class="statsicon" icon="${netspup_icon}"></ha-icon
                  >${netspup}${netspup_uom}
                </div>
              `
            : html`
                <div style="opacity: 0.5;">
                  <ha-icon class="statsicon" icon="mdi:upload"></ha-icon>N/A
                </div>
              `}
        </section>
        <section class="collapseheader shade" @click=${this.toggle}>
          <h3>More Details</h3>
          <div class="toggle plusminus-button">
            <ha-icon
              icon=${this.open ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </div>
        </section>
        <section class="${this.open ? "expanded" : "collapsed"}">
          <h3>Image</h3>
          <div id="extra-div">${image}</div>
          <h3>Health</h3>
          <div id="extra-div">${health}</div>
          <h3>Up Time</h3>
          <div id="extra-div">${uptime}</div>
          <div id="extra-div">${switchstate}</div>
        </section>
      `;
    }
  }

  toggle() {
    this.open = !this.open;
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
      ha-card {
        width: 100%;
        border-radius: 4px;
        overflow: hidden;
        background: white;
        box-shadow: 0 1px 4px 0 var(--shadow-color, hsla(0, 0%, 0%, 0.1)),
          0 0px 4px 0 var(--shadow-color, hsla(0, 0%, 0%, 0.1));
        display: block;
        color: #697785;
      }
      section {
        padding: 12px 16px;
        border-top: 1px solid #ededed;
        display: flex;
        flex: 1 0;
      }
      h3 {
        text-transform: uppercase;
        font-size: 13px;
        line-height: 14px;
        font-weight: 600;
        margin: 0;
      }
      svg {
        display: inline-block;
        vertical-align: text-top;
        fill: currentColor;
      }
      #name {
        /* line-height: 50px; */
        white-space: nowrap;
        vertical-align: top;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 4px;
        margin-right: 8px;
      }
      .shade {
        background: hsl(0, 0%, 98%);
      }
      .collapseheader {
        display: flex;
        cursor: pointer;
        align-items: center;
        justify-content: space-between;
      }
      .collapsed {
        display: none;
        flex-direction: column;
      }
      .expanded {
        display: flex;
        animation: fade 300ms cubic-bezier(0, 0, 0.2, 1);
        flex-direction: column;
      }
      .expanded h3 {
        margin-bottom: 8px;
      }
      .expanded h3:not(:first-of-type) {
        margin-top: 16px;
      }
      #stats {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding-right: 16px;
        /* color: #9eadbb; */
        border-top: none;
        padding-top: 0;
        padding-bottom: 16px;
        font-size: 12px;
      }
      #stats div {
        flex: 1 0 30%;
        align-items: center;
      }
      #plusminus-button {
        width: 16px;
        height: 16px;
        margin-left: 16px;
        flex: 0 0 16px;
      }
      .statsicon {
        display: inline-block;
        vertical-align: text-top;
        fill: currentColor;
        width: 24px;
        height: 24px;
        margin-right: 2px;
      }
      .dot {
        height: 25px;
        width: 25px;
        background-color: #bbb;
        border-radius: 50%;
        display: inline-block;
        flex: 0 0 25px;
      }
      #extra-div {
        font-size: 12px;
      }
    `;
  }

  getCardSize() {
    return 2;
  }
}

if (!customElements.get("docker-card")) {
  customElements.define("docker-card", DockerCard);
  console.info(
    `%c DOCKER-CARD \n%c Version ${VERSION} `,
    "color: #2fbae5; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray"
  );
}
