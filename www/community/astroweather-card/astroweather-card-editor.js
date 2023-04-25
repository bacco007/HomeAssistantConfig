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

if (
  !customElements.get("ha-switch") &&
  customElements.get("paper-toggle-button")
) {
  customElements.define("ha-switch", customElements.get("paper-toggle-button"));
}

const LitElement = customElements.get("hui-masonry-view")
  ? Object.getPrototypeOf(customElements.get("hui-masonry-view"))
  : Object.getPrototypeOf(customElements.get("hui-view"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

const HELPERS = window.loadCardHelpers();

export class AstroWeatherCardEditor extends LitElement {
  setConfig(config) {
    this._config = { ...config };
  }

  static get properties() {
    return { hass: {}, _config: {} };
  }

  get _entity() {
    return this._config.entity || "";
  }

  get _name() {
    return this._config.name || "";
  }

  get _current() {
    return this._config.current !== false;
  }

  get _details() {
    return this._config.details !== false;
  }

  get _deepskydetails() {
    return this._config.deepskydetails !== false;
  }

  get _forecast() {
    return this._config.forecast !== false;
  }

  get _graph() {
    return this._config.graph !== false;
  }

  get _line_color_condition() {
    return this._config.line_color_condition || "#f07178";
  }

  get _line_color_condition_night() {
    return this._config.line_color_condition_night || "#eeffff";
  }

  get _line_color_cloudless() {
    return this._config.line_color_cloudless || "#c3e88d";
  }

  get _line_color_seeing() {
    return this._config.line_color_seeing || "#ffcb6b";
  }

  get _line_color_transparency() {
    return this._config.line_color_transparency || "#82aaff";
  }

  get _hourly_forecast() {
    return true;
    // return this._config.hourly_forecast !== false;
  }

  get _number_of_forecasts() {
    return this._config.number_of_forecasts || 5;
  }

  firstUpdated() {
    HELPERS.then((help) => {
      if (help.importMoreInfoControl) {
        help.importMoreInfoControl("fan");
      }
    });
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    const entities = Object.keys(this.hass.states).filter(
      (eid) => eid.substr(0, eid.indexOf("_")) === "weather.astroweather"
    );
    // const entities = Object.keys(this.hass.states)
    //   .filter((entity_id) => entity_id.includes("weather.astroweather"))
    //   .reduce((cur, key) => {
    //     return Object.assign(cur, { [key]: entity_id[key] });
    //   }, {});
    // domain-filter="weather"

    return html`
      <div class="card-config">
        <div>
          <paper-input
            label="Name"
            .value="${this._name}"
            .configValue="${"name"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
          ${customElements.get("ha-entity-picker")
            ? html`
                <ha-entity-picker
                  .hass="${this.hass}"
                  .value="${this._entity}"
                  .configValue=${"entity"}
                  domain-filter="weather"
                  @change="${this._valueChanged}"
                  allow-custom-entity
                ></ha-entity-picker>
              `
            : html`
                <paper-dropdown-menu
                  label="Entity"
                  @value-changed="${this._valueChanged}"
                  .configValue="${"entity"}"
                >
                  <paper-listbox
                    slot="dropdown-content"
                    .selected="${entities.indexOf(this._entity)}"
                  >
                    ${entities.map((entity) => {
                      return html` <paper-item>${entity}</paper-item> `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              `}
          <div class="switches">
            <div class="switch">
              <ha-switch
                .checked=${this._current}
                .configValue="${"current"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show current</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._details}
                .configValue="${"details"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show details</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._deepskydetails}
                .configValue="${"deepskydetails"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show deepsky details</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._forecast}
                .configValue="${"forecast"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show forecast</span>
            </div>
            <div class="switch">
              <ha-switch
                .checked=${this._graph}
                .configValue="${"graph"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show graph</span>
            </div>
            <!-- <div class="switch">
              <ha-switch
                .checked=${this._hourly_forecast}
                .configValue="${"hourly_forecast"}"
                @change="${this._valueChanged}"
              ></ha-switch
              ><span>Show hourly forecast</span>
            </div> -->
          </div>
          ${this._graph == true || this._forecast == true
            ? html`<paper-input
                label="Number of future forcasts"
                type="number"
                min="1"
                max="32"
                value=${this._number_of_forecasts}
                .configValue="${"number_of_forecasts"}"
                @value-changed="${this._valueChanged}"
              ></paper-input>`
            : ""}
          ${this._graph == true
            ? html` <paper-input
                  label="Line color condition"
                  type="text"
                  value=${this._line_color_condition}
                  .configValue="${"line_color_condition"}"
                  @value-changed="${this._valueChanged}"
                ></paper-input>
                <paper-input
                  label="Line color condition night"
                  type="text"
                  value=${this._line_color_condition_night}
                  .configValue="${"line_color_condition_night"}"
                  @value-changed="${this._valueChanged}"
                ></paper-input>
                <paper-input
                  label="Line color cloudless"
                  type="text"
                  value=${this._line_color_cloudless}
                  .configValue="${"line_color_cloudless"}"
                  @value-changed="${this._valueChanged}"
                ></paper-input>
                <paper-input
                  label="Line color seeing"
                  type="text"
                  value=${this._line_color_seeing}
                  .configValue="${"line_color_seeing"}"
                  @value-changed="${this._valueChanged}"
                ></paper-input>
                <paper-input
                  label="Line color transparency"
                  type="text"
                  value=${this._line_color_transparency}
                  .configValue="${"line_color_transparency"}"
                  @value-changed="${this._valueChanged}"
                ></paper-input>`
            : ""}
        </div>
      </div>
    `;
  }

  _valueChanged(ev) {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === "") {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]:
            target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles() {
    return css`
      .switches {
        margin: 8px 0;
        display: flex;
        justify-content: space-between;
      }
      .switch {
        display: flex;
        align-items: center;
        justify-items: center;
      }
      .switches span {
        padding: 0 16px;
      }
    `;
  }
}

customElements.define("astroweather-card-editor", AstroWeatherCardEditor);
