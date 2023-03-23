const LitElement = customElements.get("ha-panel-lovelace")
  ? Object.getPrototypeOf(customElements.get("ha-panel-lovelace"))
  : Object.getPrototypeOf(customElements.get("hc-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

import { Chart, registerables } from "https://unpkg.com/chart.js@3.7.1?module";
Chart.register(...registerables);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "astroweather-card",
  name: "AstroWeather Card",
  description: "A custom weather card made for AstroWeather.",
  preview: true,
  documentationURL: "https://github.com/mawinkler/astroweather-card",
});

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed,
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

function hasConfigOrEntityChanged(element, changedProps) {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass");
  if (oldHass) {
    return (
      oldHass.states[element._config.entity] !==
        element.hass.states[element._config.entity] ||
      oldHass.states["sun.sun"] !== element.hass.states["sun.sun"]
    );
  }

  return true;
}

class AstroWeatherCard extends LitElement {
  static get properties() {
    return {
      _config: {},
      hass: {},
      forecastChart: { type: Object },
      forecastItems: { type: Number },
    };
  }

  static async getConfigElement() {
    await import("./astroweather-card-editor.js");
    return document.createElement("astroweather-card-editor");
  }

  static getStubConfig(hass, unusedEntities, allEntities) {
    let entity = unusedEntities.find((eid) => eid.split(".")[0] === "weather");
    if (!entity) {
      entity = allEntities.find((eid) => eid.split(".")[0] === "weather");
    }
    return { entity };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define an AstroWeather entity");
    }
    this._config = config;
  }

  shouldUpdate(changedProps) {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  firstUpdated() {
    if (this._config.graph !== false) {
      this.measureCard();
      this.drawChart();
    }
  }

  updated(changedProperties) {
    if (this._config.graph !== false) {
      if (changedProperties.has("config")) {
        this.drawChart();
      }
      if (changedProperties.has("weather")) {
        this.updateChart();
      }
    }
  }

  measureCard() {
    // const card = this.shadowRoot.querySelector("ha-card");
    // let fontSize = this.config.forecast.labels_font_size;
    // if (!card) {
    //   return;
    // }
    // this.forecastItems = Math.round(card.offsetWidth / (fontSize * 5.5));
  }

  render() {
    if (!this._config || !this.hass) {
      return html``;
    }

    this.numberElements = 0;

    const lang = this.hass.selectedLanguage || this.hass.language;
    const stateObj = this.hass.states[this._config.entity];

    if (!stateObj) {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity not available: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }
    if (stateObj.attributes.attribution != "Powered by 7Timer") {
      return html`
        <style>
          .not-found {
            flex: 1;
            background-color: yellow;
            padding: 8px;
          }
        </style>
        <ha-card>
          <div class="not-found">
            Entity is not an AstroWeather entity: ${this._config.entity}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card @click="${this._handleClick}">
        ${this._config.current !== false ? this.renderCurrent(stateObj) : ""}
        ${this._config.details !== false
          ? this.renderDetails(stateObj, lang)
          : ""}
        ${this._config.deepskydetails !== false
          ? this.renderDeepSkyForecast(stateObj, lang)
          : ""}
        ${this._config.forecast !== false
          ? this.renderForecast(stateObj.attributes.forecast, lang)
          : ""}
        ${this._config.graph !== false
          ? html`<div class="chart-container">
              <canvas id="forecastChart"></canvas>
            </div>`
          : ""}
      </ha-card>
    `;
  }

  renderCurrent(stateObj) {
    this.numberElements++;

    return html`
      <div class="current ${this.numberElements > 1 ? "spacer" : ""}">
        ${this._config.name
          ? html` <span class="title"> ${this._config.name} </span> `
          : ""}

        <span class="condition"> ${stateObj.attributes.condition_plain}</span>
      </div>
    `;
  }

  renderDetails(stateObj, lang) {
    const sun = this.hass.states["sun.sun"];
    let sun_next_rising;
    let sun_next_setting;
    let sun_next_rising_nautical;
    let sun_next_setting_nautical;
    let sun_next_rising_astro;
    let sun_next_setting_astro;
    let moon_next_rising;
    let moon_next_setting;

    sun_next_rising = new Date(
      stateObj.attributes.sun_next_rising
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sun_next_setting = new Date(
      stateObj.attributes.sun_next_setting
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sun_next_rising_nautical = new Date(
      stateObj.attributes.sun_next_rising_nautical
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sun_next_setting_nautical = new Date(
      stateObj.attributes.sun_next_setting_nautical
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sun_next_rising_astro = new Date(
      stateObj.attributes.sun_next_rising_astro
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    sun_next_setting_astro = new Date(
      stateObj.attributes.sun_next_setting_astro
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    moon_next_rising = new Date(
      stateObj.attributes.moon_next_rising
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    moon_next_setting = new Date(
      stateObj.attributes.moon_next_setting
    ).toLocaleTimeString(lang, {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    this.numberElements++;

    return html`
      <ul class="details ${this.numberElements > 1 ? "spacer" : ""}">
        <li>
          <ha-icon icon="mdi:weather-snowy-rainy"></ha-icon>
          <b
            >Condition: ${stateObj.attributes.condition_percentage}<span
              class="unit"
            >
              %
            </span></b
          >
        </li>
        <li>
          <ha-icon icon="mdi:weather-night-partly-cloudy"></ha-icon>
          <b
            >Cloudless: ${stateObj.attributes.cloudless_percentage}<span
              class="unit"
            >
              %
            </span></b
          >
        </li>
        <li>
          <ha-icon icon="mdi:waves"></ha-icon>
          <b
            >Seeing: ${stateObj.attributes.seeing_percentage}<span class="unit">
              %
            </span></b
          >
        </li>
        <li>
          <ha-icon icon="mdi:safety-goggles"></ha-icon>
          <b
            >Transparency: ${stateObj.attributes.transparency_percentage}<span
              class="unit"
            >
              %
            </span></b
          >
        </li>
        <li>
          <ha-icon icon="mdi:thermometer"></ha-icon>
          Temperature: ${stateObj.attributes.temperature}
          ${this.getUnit("temperature")}
        </li>
        <li>
          <ha-icon icon="mdi:water-percent"></ha-icon>
          Humidity: ${stateObj.attributes.humidity} %
        </li>
        <li>
          <ha-icon icon="mdi:windsock"></ha-icon>
          Wind: ${stateObj.attributes.wind_bearing}
          ${this.getUnit("wind_speed") == "m/s"
            ? stateObj.attributes.wind_speed
            : Math.round(stateObj.attributes.wind_speed * 2.23694)}
          ${this.getUnit("wind_speed")}
        </li>
        <li>
          ${stateObj.attributes.prec_type == "Snow"
            ? html` <ha-icon icon="mdi:weather-snowy"></ha-icon> `
            : stateObj.attributes.prec_type == "Rain"
            ? html` <ha-icon icon="mdi:weather-rainy"></ha-icon> `
            : stateObj.attributes.prec_type == "Frzr"
            ? html` <ha-icon icon="mdi:weather-snowy-rainy"></ha-icon> `
            : stateObj.attributes.prec_type == "Icep"
            ? html` <ha-icon icon="mdi:weather-hail"></ha-icon> `
            : stateObj.attributes.prec_type == "None"
            ? html` <ha-icon icon="mdi:weather-rainy"></ha-icon> `
            : ""}
          Precipitation: ${stateObj.attributes.prec_type}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
          Civil: ${sun_next_setting}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
          Civil: ${sun_next_rising}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
          Nautical: ${sun_next_setting_nautical}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
          Nautical: ${sun_next_rising_nautical}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
          Astro: ${sun_next_setting_astro}
        </li>
        <li>
          <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
          Astro: ${sun_next_rising_astro}
        </li>
        <li>
          <ha-icon icon="mdi:arrow-down-circle-outline"></ha-icon>
          Setting: ${moon_next_setting}
        </li>
        <li>
          <ha-icon icon="mdi:arrow-up-circle-outline"></ha-icon>
          Rising: ${moon_next_rising}
        </li>
        <li>
          <ha-icon icon="mdi:moon-waning-gibbous"></ha-icon>
          Moon Phase: ${stateObj.attributes.moon_phase} %
        </li>
      </ul>
    `;
  }

  renderDeepSkyForecast(stateObj) {
    this.numberElements++;

    return html`
      <ul
        class="deepskyforecast clear ${this.numberElements > 1 ? "spacer" : ""}"
      >
        ${stateObj.attributes.deepsky_forecast_today_plain
          ? html`
              <li>
                <ha-icon icon="mdi:weather-night"></ha-icon>
                ${stateObj.attributes.deepsky_forecast_today_dayname}:
                ${stateObj.attributes.deepsky_forecast_today_plain}
              </li>
              <li>
                <ha-icon icon="mdi:image-text"></ha-icon>
                ${stateObj.attributes.deepsky_forecast_today_desc}
              </li>
            `
          : ""}
        ${stateObj.attributes.deepsky_forecast_tomorrow_plain
          ? html`
              <li>
                <ha-icon icon="mdi:weather-night"></ha-icon>
                ${stateObj.attributes.deepsky_forecast_tomorrow_dayname}:
                ${stateObj.attributes.deepsky_forecast_tomorrow_plain}
              </li>
              <li>
                <ha-icon icon="mdi:image-text"></ha-icon>
                ${stateObj.attributes.deepsky_forecast_tomorrow_desc}
              </li>
            `
          : ""}
      </ul>
    `;
  }

  renderForecast(forecast, lang) {
    if (!forecast || forecast.length === 0) {
      return html``;
    }

    this.numberElements++;
    return html`
      <div class="forecast clear ${this.numberElements > 1 ? "spacer" : ""}">
        <div class="forecastrow">
          <ha-icon icon="mdi:progress-clock"></ha-icon><br />
          <ha-icon icon="mdi:weather-snowy-rainy"></ha-icon><br />
          <ha-icon icon="mdi:weather-night-partly-cloudy"></ha-icon><br />
          <ha-icon icon="mdi:waves"></ha-icon><br />
          <ha-icon icon="mdi:safety-goggles"></ha-icon><br />
          <ha-icon icon="mdi:hand-pointing-up"></ha-icon><br />
          <ha-icon icon="mdi:thermometer"></ha-icon>
        </div>
        ${forecast
          .slice(
            0,
            this._config.number_of_forecasts
              ? this._config.number_of_forecasts
              : 5
          )
          .map(
            (daily) => html`
              <div class="forecastrow">
                <div class="forecastrowname">
                  ${new Date(daily.datetime).toLocaleTimeString(lang, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  <div class="value_item_bold">${daily.condition} %</div>
                  <div class="value_item">${daily.cloudless_percentage} %</div>
                  <div class="value_item">${daily.seeing_percentage} %</div>
                  <div class="value_item">
                    ${daily.transparency_percentage} %
                  </div>
                  <div class="value_item">${daily.lifted_index} °</div>
                  <div class="value_item">
                    ${daily.temperature} ${this.getUnit("temperature")}
                  </div>
                </div>
              </div>
            `
          )}
      </div>
    `;
    // <!-- ${this._config.hourly_forecast
    //   ? new Date(daily.datetime).toLocaleTimeString(lang, {
    //       hour: "2-digit",
    //       minute: "2-digit",
    //       hour12: false,
    //     })
    //   : new Date(daily.datetime).toLocaleDateString(lang, {
    //       weekday: "short",
    //     })} -->
  }

  drawChart({ config, language, forecastItems } = this) {
    let weather;
    weather = this.hass.states[this._config.entity];
    if (!weather || !weather.attributes || !weather.attributes.forecast) {
      return [];
    }
    if (this.forecastChart) {
      this.forecastChart.destroy();
    }
    var forecast = weather.attributes.forecast.slice(
      0,
      this._config.number_of_forecasts ? this._config.number_of_forecasts : 5
    );
    // if ((new Date(forecast[1].datetime) - new Date(forecast[0].datetime)) < 864e5)
    //   var mode = 'hourly';
    // else
    //   var mode = 'daily';
    var mode = "hourly";
    var i;
    var dateTime = [];
    var condition = [];
    var clouds = [];
    var seeing = [];
    var transparency = [];
    for (i = 0; i < forecast.length; i++) {
      var d = forecast[i];
      dateTime.push(d.datetime);
      condition.push(d.condition);
      clouds.push(d.cloudless_percentage);
      seeing.push(d.seeing_percentage);
      transparency.push(d.transparency_percentage);
    }
    var style = getComputedStyle(document.body);
    var backgroundColor = style.getPropertyValue("--card-background-color");
    var textColor = style.getPropertyValue("--primary-text-color");
    var condColor = style.getPropertyValue("--primary-text-color");
    var attrColor = style.getPropertyValue("--paper-item-icon-color");
    var dividerColor = style.getPropertyValue("--divider-color");
    const ctx = this.renderRoot
      .querySelector("#forecastChart")
      .getContext("2d");

    Chart.defaults.color = textColor;
    Chart.defaults.scale.grid.color = dividerColor;
    Chart.defaults.elements.line.fill = false;
    Chart.defaults.elements.line.tension = 0.3;
    Chart.defaults.elements.line.borderWidth = 1.5;
    Chart.defaults.elements.point.radius = 2;
    Chart.defaults.elements.point.hitRadius = 10;
    Chart.defaults.plugins.legend.position = "bottom";

    this.forecastChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dateTime,
        datasets: [
          {
            label: "Condition",
            type: "line",
            data: condition,
            yAxisID: "PercentageAxis",
            fill: true,
            borderWidth: 2,
            borderColor: condColor,
            pointBorderColor: function (context) {
              var index = context.dataIndex;
              var hour = new Date(dateTime[index]).getHours();
              return hour >= 19 || hour <= 3
                ? style.getPropertyValue("--paper-item-icon-active-color")
                : condColor;
            },
            pointRadius: 5,
            pointStyle: "star",
          },
          {
            label: "Cloudless",
            type: "line",
            data: clouds,
            yAxisID: "PercentageAxis",
            fill: true,
            borderColor: attrColor,
            pointBorderColor: attrColor,
            pointRadius: 4,
            pointStyle: "rect",
          },
          {
            label: "Seeing",
            type: "line",
            data: seeing,
            yAxisID: "PercentageAxis",
            fill: true,
            borderColor: attrColor,
            pointBorderColor: attrColor,
            pointRadius: 4,
            pointStyle: "triangle",
          },
          {
            label: "Transparency",
            type: "line",
            data: transparency,
            yAxisID: "PercentageAxis",
            fill: true,
            borderColor: attrColor,
            pointBorderColor: attrColor,
            pointRadius: 4,
            pointStyle: "circle",
          },
        ],
      },
      options: {
        animation: false,
        maintainAspectRatio: false,
        layout: {
          padding: {
            bottom: 10,
          },
        },
        scales: {
          DateTimeAxis: {
            position: "top",
            grid: {
              display: false,
              drawBorder: false,
              drawTicks: false,
              zeroLineColor: dividerColor,
            },
            ticks: {
              maxRotation: 0,
              padding: 8,
              callback: function (value, index, values) {
                var datetime = this.getLabelForValue(value);
                var weekday = new Date(datetime).toLocaleDateString(language, {
                  weekday: "short",
                });
                var time = new Date(datetime).toLocaleTimeString(language, {
                  hour12: false,
                  hour: "numeric",
                  minute: "numeric",
                });
                if (mode == "hourly") {
                  return time;
                }
                return weekday;
              },
            },
          },
          PercentageAxis: {
            position: "left",
            beginAtZero: true,
            min: 0,
            max: 100,
            grid: {
              display: false,
              drawBorder: false,
              drawTicks: true,
            },
            ticks: {
              display: true,
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWitdth: 10,
              font: {
                size: 8,
              },
              padding: 5,
              usePointStyle: true,
            },
          },
          datalabels: {
            backgroundColor: backgroundColor,
            borderColor: (context) => context.dataset.backgroundColor,
            borderRadius: 8,
            borderWidth: 1.5,
            padding: 4,
            font: {
              lineHeight: 0.7,
            },
            formatter: function (value, context) {
              return context.dataset.data[context.dataIndex] + "%";
            },
          },
          tooltip: {
            caretSize: 0,
            caretPadding: 15,
            callbacks: {
              title: function (TooltipItem) {
                var datetime = TooltipItem[0].label;
                return new Date(datetime).toLocaleDateString(language, {
                  month: "short",
                  day: "numeric",
                  weekday: "short",
                  hour: "numeric",
                  minute: "numeric",
                });
              },
            },
          },
        },
      },
    });
  }

  updateChart({ forecastItems, forecastChart } = this) {
    let weather;
    weather = this.hass.states[this._config.entity];
    if (!weather || !weather.attributes || !weather.attributes.forecast) {
      return [];
    }
    var forecast = weather.attributes.forecast.slice(0, forecastItems);
    var i;
    var dateTime = [];
    var condition = [];
    var clouds = [];
    var seeing = [];
    var transparency = [];
    for (i = 0; i < forecast.length; i++) {
      var d = forecast[i];
      dateTime.push(d.datetime);
      condition.push(d.condition);
      clouds.push(d.cloudless_percentage);
      seeing.push(d.seeing_percentage);
      transparency.push(d.transparency_percentage);
    }
    if (forecastChart) {
      forecastChart.data.labels = dateTime;
      forecastChart.data.datasets[0].data = condition;
      forecastChart.data.datasets[1].data = clouds;
      forecastChart.data.datasets[2].data = seeing;
      forecastChart.data.datasets[3].data = transparency;
      forecastChart.update();
    }
  }

  getUnit(measure) {
    return this.hass.config.unit_system[measure] || "";
  }

  _handleClick() {
    fireEvent(this, "hass-more-info", { entityId: this._config.entity });
  }

  getCardSize() {
    return 3;
  }

  static get styles() {
    return css`
      ha-card {
        cursor: pointer;
        margin: auto;
        overflow: hidden;
        padding-top: 1.3em;
        padding-bottom: 1.3em;
        padding-left: 1em;
        padding-right: 1em;
        position: relative;
      }

      .spacer {
        padding-top: 1em;
      }

      .clear {
        clear: both;
      }

      .title {
        position: absolute;
        font-weight: 400;
        font-size: 2em;
        color: var(--primary-text-color);
      }

      .condition {
        font-size: 1.2rem;
        color: var(--primary-text-color);
        position: absolute;
        right: 1em;
      }

      .conditiondesc {
        font-size: 1.2rem;
        color: var(--primary-text-color);
      }

      .current {
        padding: 1.2em 0;
        margin-bottom: 3.5em;
      }

      .details {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        padding: 0 1em;
        margin: 0;
      }

      .details ha-icon {
        height: 22px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .details li {
        flex-basis: auto;
        width: 50%;
      }

      .details li:nth-child(2n) {
        text-align: right;
      }

      .details li:nth-child(2n) ha-icon {
        margin-right: 0;
        margin-left: 8px;
        float: right;
      }

      .deepskyforecast {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        font-weight: 300;
        color: var(--primary-text-color);
        list-style: none;
        padding: 0 1em;
        margin-top: 1;
      }

      .deepskyforecast ha-icon {
        height: 22px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .deepskyforecast li {
        flex-basis: auto;
        width: 100%;
      }

      .unit {
        font-size: 0.8em;
      }

      .forecast {
        width: 100%;
        margin: 0 auto;
        display: flex;
      }

      .forecast ha-icon {
        height: 22px;
        margin-right: 5px;
        color: var(--paper-item-icon-color);
      }

      .forecastrow {
        flex: 1;
        display: block;
        text-align: center;
        color: var(--primary-text-color);
        border-right: 0.1em solid #d9d9d9;
        line-height: 2;
        box-sizing: border-box;
      }

      .forecastrowname {
        text-transform: uppercase;
      }

      .forecast .forecastrow:first-child {
        margin-left: 0;
      }

      .forecast .forecastrow:nth-last-child(1) {
        border-right: none;
        margin-right: 0;
      }

      .value_item {
      }

      .value_item_bold {
        font-weight: bold;
      }

      .label {
        font-weight: bold;
        text-align: center;
      }
    `;
  }
}

customElements.define("astroweather-card", AstroWeatherCard);
