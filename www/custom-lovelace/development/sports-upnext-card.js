class SportsUpNextCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    const root = this.shadowRoot;
    if (root.lastChild) root.removeChild(root.lastChild);

    const cardConfig = Object.assign({}, config);
    const card = document.createElement("ha-card");
    const content = document.createElement("div");
    const style = document.createElement("style");

    style.textContent = `
      ha-card {
        /* css */
        padding-bottom: 5px;
      }
      body {
        margin: 0;
      }
      .grid-container {
        display: grid;
        grid-template-columns: auto auto auto;
        grid-gap: 0;
      }
      .name {
        grid-column-start: 1;
        grid-column-end: 3;
        text-align: left;
        text-indent: 0.3em;
        font-size: 1.4em;
        font-weight: 300;
        padding: .2em .2em;
        background-color: var(--background-color);
        text-color: var(--text-color);
        font-family: Oswald;
      }
      .date {
        grid-column-start: 3;
        grid-column-end: 4;
        background-color: #FFFFFF;
        text-align: right;
        font-size: 1.4em;
        font-weight: 300;
        background-color: var(--background-color);
        text-color: var(--text-color);
        padding: .2em .2em;
        font-family: Oswald;
      }
      .icon {
        grid-row-start: 2;
        grid-row-end: 3;
        grid-column-start: 1;
        grid-column-end: 2;
        justify-items: center;
        align-items: center;
        display: grid;
        width: 3em;
        min-height: 6em;
      }
      .icon img {
        display: block;
        margin-left: auto;
        margin-right: auto;
        # height: 6em;
        width: 4em;
        padding: .5em;
      }
      .nextOpponent {
        grid-row-start: 2;
        grid-row-end: 3;
        grid-column-start: 2;
        grid-column-end: 4;
        text-align: right;
        line-height: 1;
        padding: .2em .2em;
        font-size: 1.25em;
        margin: auto;
        font-family: Raleway;
      }
    `;

    content.innerHTML = `
    <div id='content'>
    </div>
    `;

    card.appendChild(content);
    card.appendChild(style);
    root.appendChild(card);
    this._config = cardConfig;
  }

  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;
    const card = root.lastChild;
    this.myhass = hass;

    const name = config.name || "";
    const nextdateSensor = { name: "nextdateSensor", config: config.nextDate || "", value: "No Date" };
    const nextOppSensor = { name: "nextOppSensor", config: config.nextOpponent || "", value: "Not Set" };
    const SensorList = [nextdateSensor, nextOppSensor];
    const logo = hass.states[nextdateSensor.config].attributes["entity_picture"] || "/local/avatar_thomas.jpg";

    SensorList.forEach(sensor => {
      if (sensor.config.split(".")[0] == "sensor") {
        try {
          sensor.value = hass.states[sensor.config].state;
        } catch (err) {
          console.log("Error in sensor: ${sensor.name}");
        }
      } else {
        sensor.value = 0;
      }
    });

    let card_content = `
      <div class="grid-container">
      <div class="name">${name}</div>
      <div class="date">${nextdateSensor.value}</div>
      <div class="icon" id="icon">
        <img src="${logo}"></img>
      </div>
      <div class="nextOpponent" id="nextOpponent">
        ${nextOppSensor.value}
      </div>
    `;

    root.lastChild.hass = hass;
    root.getElementById("content").innerHTML = card_content;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("sports-upnext-card", SportsUpNextCard);
