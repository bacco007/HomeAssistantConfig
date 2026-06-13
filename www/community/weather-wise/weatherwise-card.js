/*
 * WeatherWise Card
 * Home Assistant weather dashboard card with forecasts and optional radar.
 */

const CARD_VERSION = "0.3.2";
const FORECAST_REFRESH_MS = 15 * 60 * 1000;
const CARD_TYPES = ["weatherwise-card", "weather-wise-card"];

const WEATHERWISE_COUNTRIES = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  global: "Global / other"
};

const WEATHERWISE_RADAR = {
  auto: "Auto",
  noaa: "US NOAA radar",
  envcanada: "Environment Canada radar",
  rainviewer: "RainViewer global radar",
  none: "No radar"
};

const WEATHERWISE_RADAR_STYLES = {
  standard: "Standard",
  vivid: "High contrast",
  soft: "Soft"
};

const WEATHERWISE_BASEMAPS = {
  light: "Light map",
  dark: "Dark map",
  osm: "Street map"
};

const WEATHERWISE_RADAR_TIMELINES = {
  loop: "Recent loop",
  latest: "Current frame",
  future: "Future if available"
};

const WEATHERWISE_LAYOUTS = {
  auto: "Auto",
  wide_panel: "Wide panel",
  stacked: "Stacked",
  compact: "Compact"
};

function isWeatherWiseHumidityEntity(entityId, state) {
  if (!entityId) return false;
  const friendly = String(state?.attributes?.friendly_name || "").toLowerCase();
  const deviceClass = String(state?.attributes?.device_class || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "humidity" || id.includes("humidity") || friendly.includes("humidity");
}

class WeatherWiseCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:weatherwise-card",
      entity: "weather.home",
      humidity_entity: "",
      title: "Local Weather",
      country: "us",
      radar_provider: "auto",
      theme_mode: "weatherwise",
      units: "auto",
      layout: "auto",
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_radar: true,
      radar_controls: true,
      radar_style: "standard",
      radar_basemap: "light",
      radar_timeline: "loop",
      show_warning_overlay: true,
      show_animations: true,
      latitude: 33.688,
      longitude: -78.886,
      grid_options: {
        rows: "full",
        columns: 18
      }
    };
  }

  static getConfigElement() {
    return document.createElement("weatherwise-card-editor");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._forecasts = { hourly: [], daily: [], twice_daily: [] };
    this._forecastEntity = null;
    this._lastForecastLoad = 0;
    this._lastRenderKey = "";
    this._clockTimer = window.setInterval(() => this._updateClock(), 1000);
    this._forecastRefreshTimer = null;
    this._radarTimer = null;
    this._radarReloadTimer = null;
    this._radarMap = null;
    this._radarLayers = [];
    this._warningLayer = null;
    this._radarIndex = 0;
    this._radarPlaying = true;
    this._radarLabelText = "radar loop";
    this._radarProviderRendered = "";
    this._radarResizeObserver = null;
  }

  connectedCallback() {
    if (!this._clockTimer) this._clockTimer = window.setInterval(() => this._updateClock(), 1000);
    this._updateClock();
    this._ensureForecastRefreshTimer();
    this._resumeRadarIfNeeded();
  }

  disconnectedCallback() {
    window.clearInterval(this._clockTimer);
    this._clockTimer = null;
    window.clearInterval(this._forecastRefreshTimer);
    this._forecastRefreshTimer = null;
    this._teardownRadar();
  }

  setConfig(config) {
    const normalized = this._normalizeConfig(config || {});
    const previous = this._config || {};
    this._config = normalized;
    this.setAttribute("theme-mode", this._config.theme_mode);
    this.toggleAttribute("animations", this._config.show_animations !== false);
    if (
      previous.entity !== this._config.entity ||
      previous.country !== this._config.country ||
      previous.radar_provider !== this._config.radar_provider ||
      previous.radar_style !== this._config.radar_style ||
      previous.radar_basemap !== this._config.radar_basemap ||
      previous.radar_timeline !== this._config.radar_timeline ||
      previous.show_warning_overlay !== this._config.show_warning_overlay ||
      previous.latitude !== this._config.latitude ||
      previous.longitude !== this._config.longitude ||
      previous.show_radar !== this._config.show_radar
    ) {
      this._teardownRadar();
    }
    this._lastRenderKey = "";
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const entityId = this._config.entity;
    const now = Date.now();
    if (entityId && this._forecastEntity !== entityId) {
      this._forecasts = { hourly: [], daily: [], twice_daily: [] };
      this._forecastEntity = entityId;
      this._lastForecastLoad = 0;
      this._lastRenderKey = "";
    }
    this._ensureForecastRefreshTimer();
    if (entityId && now - this._lastForecastLoad > 5 * 60 * 1000) {
      this._lastForecastLoad = now;
      this._loadForecasts(entityId);
    }
    const key = this._renderKey();
    if (key !== this._lastRenderKey) {
      this._lastRenderKey = key;
      this._render();
    }
  }

  _ensureForecastRefreshTimer() {
    if (this._forecastRefreshTimer || !this.isConnected || !this._config.entity) return;
    this._forecastRefreshTimer = window.setInterval(() => this._refreshForecasts(), FORECAST_REFRESH_MS);
  }

  _refreshForecasts() {
    if (!this._hass || !this._config.entity) return;
    this._lastForecastLoad = Date.now();
    this._loadForecasts(this._config.entity);
  }

  getCardSize() {
    if (this._config.layout === "compact") return this._config.show_radar === false ? 4 : 6;
    if (this._config.layout === "stacked") return this._config.show_radar === false ? 7 : 9;
    return this._config.show_radar === false ? 5 : 6;
  }

  getGridOptions() {
    const layout = this._config.layout || "auto";
    const rows = layout === "stacked" ? 8 : layout === "compact" ? 5 : 6;
    const columns = layout === "stacked" ? 12 : 18;
    return {
      rows,
      columns,
      min_rows: layout === "compact" ? 4 : 5,
      min_columns: 8
    };
  }

  _normalizeConfig(config) {
    const country = String(config.country || "us").toLowerCase();
    const radarProvider = String(config.radar_provider || "auto").toLowerCase();
    const themeMode = String(config.theme_mode || "weatherwise").toLowerCase() === "auto" ? "auto" : "weatherwise";
    const units = ["auto", "imperial", "metric"].includes(String(config.units || "auto").toLowerCase())
      ? String(config.units || "auto").toLowerCase()
      : "auto";
    const radarStyle = String(config.radar_style || "standard").toLowerCase();
    const radarBasemap = String(config.radar_basemap || "light").toLowerCase();
    const radarTimeline = String(config.radar_timeline || "loop").toLowerCase();
    const layout = String(config.layout || "auto").toLowerCase();
    return {
      title: "Local Weather",
      humidity_entity: "",
      country: WEATHERWISE_COUNTRIES[country] ? country : "global",
      radar_provider: WEATHERWISE_RADAR[radarProvider] ? radarProvider : "auto",
      theme_mode: themeMode,
      units,
      layout: "auto",
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_radar: true,
      show_map_controls: true,
      radar_controls: true,
      radar_style: "standard",
      radar_basemap: "light",
      radar_timeline: "loop",
      show_warning_overlay: true,
      show_animations: true,
      radar_zoom: 7,
      radar_speed: 700,
      debug: { enabled: false, panel: false },
      ...config,
      radar_style: WEATHERWISE_RADAR_STYLES[radarStyle] ? radarStyle : "standard",
      radar_basemap: WEATHERWISE_BASEMAPS[radarBasemap] ? radarBasemap : "light",
      radar_timeline: WEATHERWISE_RADAR_TIMELINES[radarTimeline] ? radarTimeline : "loop",
      layout: WEATHERWISE_LAYOUTS[layout] ? layout : "auto",
      latitude: this._numberOr(config.latitude, undefined),
      longitude: this._numberOr(config.longitude, undefined),
      hourly_count: Math.max(1, Math.min(24, Number(config.hourly_count) || 5)),
      forecast_count: Math.max(1, Math.min(7, Number(config.forecast_count) || 5)),
      show_timeline: config.show_timeline !== false,
      show_forecast: config.show_forecast !== false,
      show_radar: config.show_radar !== false,
      show_map_controls: config.show_map_controls !== false,
      radar_controls: config.radar_controls !== false,
      show_warning_overlay: config.show_warning_overlay !== false,
      show_animations: config.show_animations !== false,
      radar_speed: Math.max(300, Math.min(3000, Number(config.radar_speed) || 700))
    };
  }

  _renderKey() {
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    return JSON.stringify({
      entity: this._config.entity,
      humidityEntity: this._config.humidity_entity,
      state: stateObj?.state,
      updated: stateObj?.last_updated,
      temp: attrs.temperature,
      humidity: attrs.humidity,
      humidityState: this._config.humidity_entity ? this._hass?.states?.[this._config.humidity_entity]?.state : undefined,
      wind: attrs.wind_speed,
      bearing: attrs.wind_bearing,
      forecast: [
        this._forecasts.hourly?.length || 0,
        this._forecasts.daily?.length || 0,
        this._forecasts.twice_daily?.length || 0
      ],
      config: [
        this._config.title,
        this._config.country,
        this._config.radar_provider,
        this._config.radar_style,
        this._config.radar_basemap,
        this._config.radar_timeline,
        this._config.layout,
        this._config.theme_mode,
        this._config.units,
        this._config.show_radar,
        this._config.show_timeline,
        this._config.show_forecast,
        this._config.radar_controls,
        this._config.show_warning_overlay,
        this._config.hourly_count,
        this._config.forecast_count
      ]
    });
  }

  async _loadForecasts(entityId) {
    if (!this._hass?.connection?.sendMessagePromise) return;
    const types = ["hourly", "daily", "twice_daily"];
    const entries = await Promise.all(types.map(async (type) => {
      try {
        const response = await this._hass.connection.sendMessagePromise({
          type: "call_service",
          domain: "weather",
          service: "get_forecasts",
          service_data: { type },
          target: { entity_id: entityId },
          return_response: true
        });
        return [type, this._extractForecast(response, entityId)];
      } catch (err) {
        return [type, []];
      }
    }));
    this._forecasts = Object.fromEntries(entries);
    this._lastRenderKey = "";
    this._render();
  }

  _extractForecast(response, entityId) {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.forecast)) return response.forecast;
    const serviceResponse = response.service_response || response.response || response;
    const byEntity = serviceResponse?.[entityId] || Object.values(serviceResponse || {})[0];
    return Array.isArray(byEntity?.forecast) ? byEntity.forecast : [];
  }

  _render() {
    if (!this.shadowRoot) return;
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    const condition = stateObj?.state || "unavailable";
    const sunStateObj = this._hass?.states?.["sun.sun"];
    const displayCondition = this._displayCondition(condition, sunStateObj);
    const units = this._unitContext(attrs);
    const temp = this._displayTemp(attrs.temperature, units);
    const humidity = this._humidity(attrs);
    const wind = this._formatWind(attrs, units);
    const hourly = this._forecasts.hourly || [];
    const daily = this._forecasts.daily || [];
    const twiceDaily = this._forecasts.twice_daily || [];
    const timeline = hourly.length ? hourly : twiceDaily.length ? twiceDaily : daily;
    const timelineMode = hourly.length ? "hourly" : twiceDaily.length ? "twice_daily" : daily.length ? "daily" : "hourly";
    const mainPeriods = twiceDaily.length ? twiceDaily : daily.length ? daily : hourly;
    const hiLo = this._formatHiLo(daily, hourly, units);
    const sun = sunStateObj?.attributes || {};
    const now = new Date();
    const needsEntity = !this._config.entity;
    const unavailable = needsEntity || !stateObj || condition === "unavailable" || condition === "unknown";
    const provider = this._resolvedRadarProvider();
    const layout = this._config.layout || "auto";

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        <div class="card-outer">
          <div class="card-grid layout-${this._escape(layout)} ${this._config.show_radar && provider !== "none" ? "" : "no-radar"} ${this._config.show_timeline === false ? "no-timeline" : ""} ${this._config.show_forecast === false ? "no-forecast" : ""}" style="--ww-hourly-count:${Math.max(1, Math.min(24, Number(this._config.hourly_count) || 5))};--ww-forecast-count:${Math.max(1, Math.min(7, Number(this._config.forecast_count) || 5))}">
            <section class="left">
              <div class="clock-panel">
                <div class="clock-row">
                  <div class="clock-time" id="clock-time">${this._clockTime(now)}</div>
                  <div class="clock-ampm" id="clock-ampm">${now.getHours() >= 12 ? "PM" : "AM"}</div>
                </div>
                <div class="clock-date" id="clock-date">${this._longDate(now)}</div>
              </div>
              ${this._config.show_timeline === false ? "" : `
                <div class="section-title">${this._timelineTitle(timelineMode)}</div>
                <div class="hourly-left">${this._renderTimeline(timeline, units, timelineMode)}</div>
              `}
            </section>
            <section class="center">
              <div class="current-row">
                <div class="current-icon">${this._icon(displayCondition, 62)}</div>
                <div class="cond-block">
                  <div class="current-label">Current Weather</div>
                  <div class="cond-name">${needsEntity ? "Select a weather entity" : unavailable ? "Connect weather in Home Assistant" : this._escape(this._titleCase(displayCondition))}</div>
                  <div class="updated-note">${needsEntity ? "Open the card editor to finish setup" : unavailable ? "Waiting for live weather data" : `Updated ${this._shortTime(now)}`}</div>
                </div>
                <div class="temp-block">
                  <div class="temp-now">${temp}</div>
                  <div class="temp-hilo">${hiLo}</div>
                </div>
              </div>
              ${this._config.show_forecast === false ? "" : `<div class="daily-strip">${this._renderDaily(mainPeriods, units)}</div>`}
              <div class="stats-row">
                ${this._stat("humidity", "Humidity", `${humidity}%`)}
                ${this._stat("wind", "Wind", wind)}
                ${this._stat("sunrise", "Sunrise", this._shortTime(sun.next_rising))}
                ${this._stat("sunset", "Sunset", this._shortTime(sun.next_setting))}
              </div>
              ${this._renderDebug({ stateObj, hourly, daily, twiceDaily, provider, units })}
            </section>
            ${this._config.show_radar && provider !== "none" ? `
              <section class="right">
                <div id="rmap"></div>
                ${this._config.radar_controls === false ? "" : `
                  <div class="radar-controls" aria-label="Radar playback controls">
                    <button type="button" data-radar-action="prev" title="Previous radar frame" aria-label="Previous radar frame">&lt;</button>
                    <button type="button" data-radar-action="play" title="Pause radar loop" aria-label="Pause radar loop">||</button>
                    <button type="button" data-radar-action="next" title="Next radar frame" aria-label="Next radar frame">&gt;</button>
                  </div>
                `}
                <div class="radar-lbl" id="radar-lbl">Radar loading...</div>
              </section>
            ` : ""}
          </div>
        </div>
      </ha-card>
    `;

    if (this._config.show_radar && provider !== "none") {
      this._teardownRadar();
      this._radarProviderRendered = provider;
      this._wireRadarControls();
      window.requestAnimationFrame(() => this._scheduleRadarInit(provider));
    }
    this._updateClock();
  }

  _wireRadarControls() {
    this.shadowRoot?.querySelectorAll("[data-radar-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const action = button.dataset.radarAction;
        if (action === "play") this._toggleRadarPlayback();
        if (action === "prev") this._stepRadar(-1);
        if (action === "next") this._stepRadar(1);
      });
    });
  }

  _scheduleRadarInit(provider, attempt = 0) {
    const holder = this.shadowRoot?.getElementById("rmap");
    if (!holder) return;
    const rect = holder.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 50) {
      if (attempt < 24) window.setTimeout(() => this._scheduleRadarInit(provider, attempt + 1), 250);
      else this._setRadarLabel("Radar waiting for dashboard layout");
      return;
    }
    this._initRadar(provider);
  }

  _renderDebug(data) {
    const debug = this._config.debug;
    if (!debug || debug.enabled !== true || debug.panel !== true) return "";
    const rows = [
      ["Version", CARD_VERSION],
      ["Entity", this._config.entity],
      ["Country", this._config.country],
      ["Radar", data.provider],
      ["Units", data.units.temperatureUnit],
      ["Hourly count", data.hourly.length],
      ["Daily count", data.daily.length],
      ["Twice daily count", data.twiceDaily.length],
      ["State", data.stateObj?.state || "missing"]
    ];
    return `
      <details class="debug-panel">
        <summary>Debug</summary>
        ${rows.map(([key, value]) => `<div class="debug-row"><span>${key}</span><code>${this._escape(value)}</code></div>`).join("")}
      </details>
    `;
  }

  _updateClock() {
    const now = new Date();
    const time = this.shadowRoot?.getElementById("clock-time");
    const ampm = this.shadowRoot?.getElementById("clock-ampm");
    const date = this.shadowRoot?.getElementById("clock-date");
    if (time) time.textContent = this._clockTime(now);
    if (ampm) ampm.textContent = now.getHours() >= 12 ? "PM" : "AM";
    if (date) date.textContent = this._longDate(now);
  }

  _timelineTitle(mode) {
    if (mode === "twice_daily") return "Forecast";
    if (mode === "daily") return "Daily";
    return "Hourly";
  }

  _renderTimeline(periods, units, mode = "hourly") {
    if (!periods.length) return `<div class="loading-note">Waiting for Home Assistant forecast data.</div>`;
    const slice = periods.slice(0, Number(this._config.hourly_count) || 5);
    const temps = slice.map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
    const min = temps.length ? Math.min(...temps) : 0;
    const max = temps.length ? Math.max(...temps) : 10;
    const range = Math.max(max - min, 4);
    return slice.map((item) => {
      const temp = this._tempValue(item.temperature, units);
      const pct = Number.isFinite(temp) ? Math.max(12, Math.round(((temp - min) / range) * 80 + 12)) : 12;
      return `
        <div class="hour-row">
          <div class="hour-time-left">${this._timelineTime(item, mode)}</div>
          <div class="hour-icon-left">${this._icon(item.condition || item.state, 23)}</div>
          <div class="hour-temp-left">${this._displayTemp(item.temperature, units, false)}</div>
          <div class="hour-bar-wrap"><div class="hour-bar-fill" style="width:${pct}%"></div></div>
        </div>
      `;
    }).join("");
  }

  _timelineTime(item, mode) {
    if (mode === "hourly") return this._hour(item.datetime);
    const day = this._dayName(item.datetime);
    if (mode === "twice_daily" && item.is_daytime !== undefined) return `${day} ${item.is_daytime ? "Day" : "Night"}`;
    return day;
  }

  _renderDaily(periods, units) {
    if (!periods.length) return `<div class="loading-note">Waiting for Home Assistant forecast data.</div>`;
    return periods.slice(0, Number(this._config.forecast_count) || 5).map((item) => {
      const period = item.is_daytime === undefined ? "" : item.is_daytime ? "Day" : "Night";
      return `
        <div class="fc-slot">
          <div>
            <div class="fc-day">${this._dayName(item.datetime)}</div>
            <div class="fc-period">${period}</div>
          </div>
          <div class="fc-icon">${this._icon(item.condition || item.state, 48)}</div>
          <div class="fc-temp">${this._displayTemp(item.temperature, units, false)}</div>
        </div>
      `;
    }).join("");
  }

  _stat(kind, label, value) {
    const icons = {
      humidity: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.1 6 11a6 6 0 1 1-12 0c0-4.9 6-11 6-11Z" fill="#65b8df"/><path d="M9.2 16.4c.7 1.3 1.8 2 3.4 2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      wind: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 8h10.4a3 3 0 1 0-2.6-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 13h15.4a3 3 0 1 1-2.6 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunrise: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#fbbf24"/><path d="M12 4v4M5 11l3 1M19 11l-3 1" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunset: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#f59e0b"/><path d="M12 8V4M5 11l3 1M19 11l-3 1" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`
    };
    return `<div class="stat"><div class="stat-ico" aria-hidden="true">${icons[kind]}</div><div><div class="stat-lbl">${label}</div><div class="stat-val">${this._escape(value || "--")}</div></div></div>`;
  }

  async _initRadar(provider) {
    const holder = this.shadowRoot?.getElementById("rmap");
    if (!holder || this._radarMap) return;
    try {
      await this._loadLeaflet();
      if (!window.L || !holder.isConnected) return;
      const { lat, lon } = this._latLon();
      this._radarMap = window.L.map(holder, {
        center: [lat, lon],
        zoom: Number(this._config.radar_zoom) || 7,
        zoomControl: this._config.show_map_controls !== false,
        attributionControl: true
      });
      const basemap = this._basemap();
      window.L.tileLayer(basemap.url, basemap.options).addTo(this._radarMap);
      window.L.circleMarker([lat, lon], {
        radius: 5,
        color: "#1a3a50",
        fillColor: "#1a3a50",
        fillOpacity: 1,
        weight: 2
      }).addTo(this._radarMap);
      this._radarMap.invalidateSize();
      [120, 350, 800, 1600].forEach((delay) => window.setTimeout(() => this._radarMap?.invalidateSize(), delay));
      this._watchRadarSize(holder, provider);
      await this._loadRadarLoop(provider);
      await this._loadWarningOverlay();
      this._radarMap.on("moveend zoomend", () => {
        window.clearTimeout(this._radarReloadTimer);
        this._radarReloadTimer = window.setTimeout(async () => {
          await this._loadRadarLoop(provider);
          await this._loadWarningOverlay();
        }, 500);
      });
    } catch (err) {
      this._setRadarLabel("Radar unavailable");
      this._teardownRadar();
    }
  }

  _teardownRadar() {
    window.clearInterval(this._radarTimer);
    window.clearTimeout(this._radarReloadTimer);
    this._radarResizeObserver?.disconnect?.();
    this._radarResizeObserver = null;
    this._radarLayers.forEach((item) => item.layer?.remove?.());
    this._warningLayer?.remove?.();
    this._radarLayers = [];
    this._warningLayer = null;
    this._radarIndex = 0;
    if (this._radarMap) {
      this._radarMap.remove();
      this._radarMap = null;
    }
  }

  _watchRadarSize(holder, provider) {
    this._radarResizeObserver?.disconnect?.();
    if (!window.ResizeObserver) return;
    let lastSize = "";
    this._radarResizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width < 50 || rect.height < 50) return;
      const nextSize = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
      if (nextSize === lastSize) return;
      lastSize = nextSize;
      window.clearTimeout(this._radarReloadTimer);
      this._radarReloadTimer = window.setTimeout(async () => {
        if (!this._radarMap) {
          this._scheduleRadarInit(provider);
          return;
        }
        this._radarMap.invalidateSize();
        if (!this._radarLayers.length) await this._loadRadarLoop(provider);
      }, 180);
    });
    this._radarResizeObserver.observe(holder);
  }

  _resumeRadarIfNeeded() {
    const provider = this._resolvedRadarProvider();
    if (provider === "none" || this._config.show_radar === false) return;
    if (this._radarMap) {
      window.setTimeout(() => this._radarMap?.invalidateSize(), 80);
      return;
    }
    window.requestAnimationFrame(() => this._scheduleRadarInit(provider));
  }

  async _loadLeaflet() {
    if (window.L) return;
    if (window.__weatherWiseLeafletPromise) {
      try {
        await window.__weatherWiseLeafletPromise;
      } catch (err) {
        window.__weatherWiseLeafletPromise = null;
        throw err;
      }
      return;
    }
    if (!document.querySelector("link[data-weatherwise-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.weatherwiseLeaflet = "true";
      document.head.appendChild(link);
    }
    window.__weatherWiseLeafletPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-weatherwise-leaflet]");
      if (existing) {
        const started = Date.now();
        const waitForExisting = () => {
          if (window.L) resolve();
          else if (Date.now() - started > 10000) reject(new Error("Leaflet load timed out"));
          else window.setTimeout(waitForExisting, 50);
        };
        waitForExisting();
        return;
      }
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.dataset.weatherwiseLeaflet = "true";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    try {
      await window.__weatherWiseLeafletPromise;
    } catch (err) {
      window.__weatherWiseLeafletPromise = null;
      throw err;
    }
  }

  _setRadarLabel(text) {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = text;
  }

  _resolvedRadarProvider() {
    if (this._config.show_radar === false) return "none";
    if (this._config.radar_provider === "none") return "none";
    if (this._config.radar_provider === "noaa") return "noaa";
    if (this._config.radar_provider === "envcanada") return "envcanada";
    if (this._config.radar_provider === "rainviewer") return "rainviewer";
    if (this._config.country === "us") return "noaa";
    if (this._config.country === "ca") return "envcanada";
    return "rainviewer";
  }

  async _loadRadarLoop(provider) {
    if (!this._radarMap || !window.L) return;
    if (provider === "rainviewer") {
      await this._loadRainViewerLoop();
      return;
    }
    if (provider === "envcanada") {
      await this._loadEnvCanadaLoop();
      return;
    }
    await this._loadNoaaLoop();
  }

  async _loadRainViewerLoop() {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    try {
      const response = await fetch("https://api.rainviewer.com/public/weather-maps.json");
      const data = await response.json();
      const frames = this._rainViewerFrames(data);
      const host = data?.host || "https://tilecache.rainviewer.com";
      if (!frames.length) throw new Error("No RainViewer frames");
      this._radarLabelText = this._config.radar_timeline === "future" ? "RainViewer future radar" : "RainViewer radar";
      this._replaceRadarLayers(frames.slice(-12).map((frame, index, list) => ({
        time: new Date(frame.time * 1000),
        layer: window.L.tileLayer(`${host}${frame.path}/256/{z}/{x}/{y}/${this._rainViewerColor()}/1_1.png`, {
          opacity: index === list.length - 1 ? this._radarOpacity() : 0,
          zIndex: 20,
          attribution: "Radar &copy; RainViewer"
        })
      })));
      if (label) label.textContent = `${this._shortTime(this._radarLayers[this._radarLayers.length - 1].time)} ${this._radarLabelText}`;
      this._animateRadar(this._radarLabelText);
    } catch (err) {
      if (label) label.textContent = "RainViewer radar unavailable";
    }
  }

  async _loadNoaaLoop() {
    const frames = this._noaaFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._radarLabelText = selectedFrames.length === 1 ? "NOAA current radar" : "NOAA radar loop";
    this._replaceRadarLayers(selectedFrames.map((frameTime, index) => ({
      time: frameTime,
      layer: window.L.imageOverlay(this._noaaUrl(frameTime), this._radarMap.getBounds(), {
        opacity: index === selectedFrames.length - 1 ? this._radarOpacity() : 0,
        zIndex: 20,
        interactive: false
      })
    })));
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }

  async _loadEnvCanadaLoop() {
    const frames = this._envCanadaFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._radarLabelText = selectedFrames.length === 1 ? "Environment Canada current radar" : "Environment Canada radar loop";
    this._replaceRadarLayers(selectedFrames.map((frameTime, index) => ({
      time: frameTime,
      layer: window.L.tileLayer.wms("https://geo.weather.gc.ca/geomet", {
        layers: "RADAR_1KM_RRAI",
        styles: this._envCanadaStyle(),
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        time: frameTime.toISOString().replace(/\.\d{3}Z$/, "Z"),
        opacity: index === selectedFrames.length - 1 ? this._radarOpacity() : 0,
        zIndex: 20,
        attribution: "Radar &copy; Environment and Climate Change Canada"
      })
    })));
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }

  _replaceRadarLayers(layers) {
    window.clearInterval(this._radarTimer);
    this._radarLayers.forEach((item) => item.layer?.remove?.());
    this._radarLayers = layers;
    this._radarIndex = Math.max(0, layers.length - 1);
    this._radarLayers.forEach((item) => item.layer.addTo(this._radarMap));
    this._showRadarFrame(this._radarIndex);
  }

  _animateRadar(labelText) {
    this._radarLabelText = labelText;
    if (this._radarLayers.length <= 1) {
      this._radarPlaying = false;
      this._updateRadarPlayButton();
      return;
    }
    this._radarTimer = window.setInterval(() => {
      if (!this._radarPlaying) return;
      this._stepRadar(1, false);
    }, this._config.radar_speed || 700);
    this._updateRadarPlayButton();
  }

  _toggleRadarPlayback() {
    this._radarPlaying = !this._radarPlaying;
    this._updateRadarPlayButton();
  }

  _updateRadarPlayButton() {
    const button = this.shadowRoot?.querySelector('[data-radar-action="play"]');
    if (!button) return;
    button.textContent = this._radarPlaying ? "||" : ">";
    button.title = this._radarPlaying ? "Pause radar loop" : "Play radar loop";
    button.setAttribute("aria-label", button.title);
  }

  _stepRadar(delta, pause = true) {
    if (!this._radarLayers.length) return;
    if (pause) {
      this._radarPlaying = false;
      this._updateRadarPlayButton();
    }
    this._radarIndex = (this._radarIndex + delta + this._radarLayers.length) % this._radarLayers.length;
    this._showRadarFrame(this._radarIndex);
  }

  _showRadarFrame(index) {
    if (!this._radarLayers.length) return;
    this._radarLayers.forEach((item, layerIndex) => item.layer.setOpacity(layerIndex === index ? this._radarOpacity() : 0));
    const active = this._radarLayers[index];
    const label = this.shadowRoot?.getElementById("radar-lbl");
    if (label && active) label.textContent = `${this._shortTime(active.time)} ${this._radarLabelText}`;
  }

  _noaaFrames() {
    const stepMs = 5 * 60 * 1000;
    const roundedNow = Math.floor(Date.now() / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }

  _envCanadaFrames() {
    const stepMs = 6 * 60 * 1000;
    const roundedNow = Math.floor(Date.now() / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }

  _rainViewerFrames(data) {
    if (this._config.radar_timeline === "latest") return (data?.radar?.past || []).slice(-1);
    if (this._config.radar_timeline === "future") {
      const future = data?.radar?.nowcast || data?.radar?.forecast || [];
      return future.length ? future : (data?.radar?.past || []).slice(-1);
    }
    return data?.radar?.past || [];
  }

  _noaaUrl(frameTime) {
    const bounds = this._radarMap.getBounds();
    const size = this._radarMap.getSize();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const service = "https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer";
    return `${service}/exportImage?bbox=${encodeURIComponent([sw.lng, sw.lat, ne.lng, ne.lat].join(","))}&bboxSR=4326&imageSR=4326&size=${Math.max(256, Math.round(size.x))},${Math.max(256, Math.round(size.y))}&format=png32&transparent=true&f=image&time=${frameTime.getTime()}&_=${Date.now()}`;
  }

  _radarOpacity() {
    const values = { standard: 0.76, vivid: 0.9, soft: 0.58 };
    return values[this._config.radar_style] ?? values.standard;
  }

  _rainViewerColor() {
    const values = { standard: 2, vivid: 4, soft: 1 };
    return values[this._config.radar_style] ?? values.standard;
  }

  _envCanadaStyle() {
    const values = {
      standard: "Radar-Rain_14colors",
      vivid: "RADARURPPRECIPR14",
      soft: "Radar-Rain_8colors"
    };
    return values[this._config.radar_style] ?? values.standard;
  }

  _basemap() {
    const basemaps = {
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      },
      osm: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        options: { maxZoom: 19, attribution: "&copy; OpenStreetMap" }
      },
      light: {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      }
    };
    return basemaps[this._config.radar_basemap] || basemaps.light;
  }

  async _loadWarningOverlay() {
    if (!this._radarMap || !window.L || this._config.show_warning_overlay === false || this._config.country !== "us") return;
    this._warningLayer?.remove?.();
    this._warningLayer = null;
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const { lat, lon } = this._latLon();
    try {
      const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
        headers: { Accept: "application/geo+json" }
      });
      if (!response.ok) throw new Error("NWS alerts unavailable");
      const data = await response.json();
      const features = Array.isArray(data?.features) ? data.features : [];
      if (!features.length) return;
      const group = window.L.layerGroup();
      const featuresWithGeometry = features.filter((feature) => feature.geometry);
      if (featuresWithGeometry.length) {
        window.L.geoJSON({ type: "FeatureCollection", features: featuresWithGeometry }, {
          style: (feature) => this._warningStyle(feature?.properties?.severity),
          interactive: true,
          onEachFeature: (feature, layer) => layer.bindPopup?.(this._alertPopup(feature.properties || {}))
        }).addTo(group);
      }
      const headline = features[0]?.properties?.headline || `${features.length} active weather alert${features.length === 1 ? "" : "s"}`;
      window.L.circleMarker([lat, lon], {
        radius: 9,
        color: "#b91c1c",
        fillColor: "#ef4444",
        fillOpacity: 0.85,
        weight: 2
      }).bindPopup(this._escape(headline)).addTo(group);
      this._warningLayer = group.addTo(this._radarMap);
      if (label) label.textContent = `${label.textContent} + ${features.length} alert${features.length === 1 ? "" : "s"}`;
    } catch (err) {
      if (label && this._config.debug?.enabled) label.textContent = `${label.textContent} + alerts unavailable`;
    }
  }

  _warningStyle(severity) {
    const colors = {
      Extreme: "#7f1d1d",
      Severe: "#dc2626",
      Moderate: "#f97316",
      Minor: "#facc15"
    };
    const color = colors[severity] || "#dc2626";
    return { color, fillColor: color, fillOpacity: 0.16, opacity: 0.82, weight: 2 };
  }

  _alertPopup(props) {
    const event = this._escape(props.event || "Weather alert");
    const headline = this._escape(props.headline || "");
    const severity = this._escape(props.severity || "Unknown");
    return `<strong>${event}</strong><br>${headline}<br>Severity: ${severity}`;
  }

  _unitContext(attrs) {
    const nativeTemp = attrs.temperature_unit || attrs.native_temperature_unit || this._hass?.config?.unit_system?.temperature || "°F";
    const target = this._config.units === "metric" ? "°C" : this._config.units === "imperial" ? "°F" : nativeTemp;
    return {
      sourceTemperatureUnit: nativeTemp,
      temperatureUnit: target,
      windSpeedUnit: attrs.wind_speed_unit || (target === "°C" ? "km/h" : "mph")
    };
  }

  _tempValue(value, units) {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return NaN;
    if (units.sourceTemperatureUnit === units.temperatureUnit) return number;
    if (units.sourceTemperatureUnit === "°F" && units.temperatureUnit === "°C") return (number - 32) * 5 / 9;
    if (units.sourceTemperatureUnit === "°C" && units.temperatureUnit === "°F") return (number * 9 / 5) + 32;
    return number;
  }

  _displayTemp(value, units, includeUnit = true) {
    const number = this._tempValue(value, units);
    const rounded = Number.isFinite(number) ? String(Math.round(number)) : "--";
    return `${rounded}°${includeUnit ? units.temperatureUnit.replace("°", "") : ""}`;
  }

  _formatHiLo(daily, hourly, units) {
    let hi = this._tempValue(daily?.[0]?.temperature ?? daily?.[0]?.high_temperature, units);
    let lo = this._tempValue(daily?.[0]?.templow ?? daily?.[0]?.low_temperature, units);
    if ((!Number.isFinite(hi) || !Number.isFinite(lo)) && hourly.length) {
      const next24 = hourly.slice(0, 24).map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
      if (next24.length) {
        hi = Math.max(...next24);
        lo = Math.min(...next24);
      }
    }
    return `${Number.isFinite(hi) ? Math.round(hi) : "--"}° / ${Number.isFinite(lo) ? Math.round(lo) : "--"}°`;
  }

  _formatWind(attrs, units) {
    const speed = this._formatNumber(attrs.wind_speed);
    const bearing = Number(attrs.wind_bearing);
    const dir = Number.isFinite(bearing) ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(bearing / 45) % 8] : "";
    return `${dir ? `${dir} ` : ""}${speed} ${attrs.wind_speed_unit || units.windSpeedUnit}`;
  }

  _humidity(attrs) {
    const configuredEntityId = this._config.humidity_entity;
    const configuredState = configuredEntityId ? this._hass?.states?.[configuredEntityId] : null;
    const configured = isWeatherWiseHumidityEntity(configuredEntityId, configuredState) ? configuredState : null;
    const values = [
      configured?.state,
      attrs.humidity,
      attrs.relative_humidity,
      attrs.relativeHumidity
    ];
    const value = values.map((item) => this._numberOr(item, NaN)).find(Number.isFinite);
    return Number.isFinite(value) ? String(Math.round(value)) : "--";
  }

  _latLon() {
    return {
      lat: this._numberOr(this._config.latitude, this._numberOr(this._hass?.config?.latitude, 0)),
      lon: this._numberOr(this._config.longitude, this._numberOr(this._hass?.config?.longitude, 0))
    };
  }

  _numberOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  _formatNumber(value) {
    const number = this._numberOr(value, NaN);
    return Number.isFinite(number) ? String(Math.round(number)) : "--";
  }

  _clockTime(date) {
    return `${(date.getHours() % 12) || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  _shortTime(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return `${(date.getHours() % 12) || 12}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"}`;
  }

  _hour(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return `${(date.getHours() % 12) || 12} ${date.getHours() >= 12 ? "PM" : "AM"}`;
  }

  _dayName(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
  }

  _longDate(date) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  _titleCase(text) {
    const raw = String(text || "--");
    const fixed = raw.replace(/[-_]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
    const overrides = {
      partlycloudy: "Partly Cloudy",
      partly_cloudy: "Partly Cloudy",
      mostlycloudy: "Mostly Cloudy",
      mostly_cloudy: "Mostly Cloudy",
      clear_night: "Clear Night"
    };
    return overrides[raw.toLowerCase()] || fixed.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  _displayCondition(condition, sunStateObj) {
    const raw = String(condition || "");
    const normalized = raw.toLowerCase().replace(/[-_]/g, " ");
    const sunState = String(sunStateObj?.state || "").toLowerCase();
    const elevation = this._numberOr(sunStateObj?.attributes?.elevation, NaN);
    const isDaytime = sunState === "above_horizon" || elevation >= 0;
    if (!isDaytime || !normalized.includes("night")) return raw;
    if (normalized.includes("clear") || normalized.includes("sunny")) return "sunny";
    if (normalized.includes("partly") || normalized.includes("cloud")) return "partlycloudy";
    return raw.replace(/[-_ ]?night/gi, "") || raw;
  }

  _escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  _icon(condition, size = 36) {
    const c = String(condition || "").toLowerCase().replace(/[-_]/g, " ");
    const isNight = c.includes("night");
    if (c.includes("lightning") || c.includes("thunder")) return `<svg class="ww-icon ww-thunder" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="15" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="18" rx="9" ry="6" fill="#cbd5e1"/></g><polygon class="ww-bolt" points="22,22 16,34 21,31 17,41 28,27 22,30" fill="#fbbf24"/><g class="ww-rain"><line x1="14" y1="28" x2="12" y2="34" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/><line x1="27" y1="28" x2="25" y2="34" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/></g></svg>`;
    if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) return `<svg class="ww-icon ww-rainy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="14" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="17" rx="9" ry="6" fill="#cbd5e1"/></g><g class="ww-rain"><line x1="14" y1="26" x2="12" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/><line x1="20" y1="26" x2="18" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/><line x1="26" y1="26" x2="24" y2="33" stroke="#38bdf8" stroke-width="2.3" stroke-linecap="round"/></g></svg>`;
    if (c.includes("snow") || c.includes("sleet") || c.includes("hail")) return `<svg class="ww-icon ww-snowy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="22" cy="14" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="14" cy="17" rx="9" ry="6" fill="#cbd5e1"/></g><g class="ww-snow"><text x="10" y="34" font-size="13" fill="#93c5fd">*</text><text x="23" y="34" font-size="13" fill="#93c5fd">*</text></g></svg>`;
    if ((c.includes("clear") || c.includes("sunny")) && isNight) return `<svg class="ww-icon ww-moon" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-moon-glow" cx="23" cy="20" r="10" fill="#fbbf24"/><path class="ww-moon-cut" d="M24 8q-10 4-10 14 0 8 7 12Q8 31 8 20 8 8 20 5q-1 2 4 3Z" fill="#1e3a5f"/></svg>`;
    if ((c.includes("partly") || c.includes("mostly cloudy") || c.includes("mostlycloudy")) && isNight) return `<svg class="ww-icon ww-partly-night" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-moon"><circle class="ww-moon-glow" cx="16" cy="17" r="8" fill="#fbbf24"/><path class="ww-moon-cut" d="M17 8q-7 3-7 10 0 5 4 8Q6 24 6 17 6 8 15 6q-1 1 2 2Z" fill="#1e3a5f"/></g><g class="ww-cloud"><ellipse cx="27" cy="24" rx="10" ry="7" fill="#94a3b8"/><ellipse cx="20" cy="27" rx="8" ry="6" fill="#cbd5e1"/></g></svg>`;
    if (c.includes("sunny") || c.includes("clear")) return `<svg class="ww-icon ww-sunny" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-sun-core" cx="20" cy="20" r="8.5" fill="#fbbf24"/><g class="ww-sun-rays" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><line x1="20" y1="4" x2="20" y2="8"/><line x1="20" y1="32" x2="20" y2="36"/><line x1="4" y1="20" x2="8" y2="20"/><line x1="32" y1="20" x2="36" y2="20"/></g></svg>`;
    if (c.includes("partly") || c.includes("mostly cloudy") || c.includes("mostlycloudy")) return `<svg class="ww-icon ww-partly" width="${size}" height="${size}" viewBox="0 0 40 40"><circle class="ww-sun-core" cx="14" cy="19" r="7" fill="#fbbf24"/><g class="ww-cloud"><ellipse cx="26" cy="22" rx="11" ry="8" fill="#94a3b8"/><ellipse cx="18" cy="25" rx="9" ry="7" fill="#cbd5e1"/></g></svg>`;
    if (c.includes("fog") || c.includes("mist")) return `<svg class="ww-icon ww-foggy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-fog"><line x1="8" y1="16" x2="32" y2="16" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><line x1="6" y1="22" x2="34" y2="22" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="28" x2="30" y2="28" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/></g></svg>`;
    return `<svg class="ww-icon ww-cloudy" width="${size}" height="${size}" viewBox="0 0 40 40"><g class="ww-cloud"><ellipse cx="23" cy="17" rx="12" ry="9" fill="#94a3b8"/><ellipse cx="14" cy="21" rx="9" ry="7" fill="#cbd5e1"/></g></svg>`;
  }

  _styles() {
    return `
      :host{--ww-wave:#2a7a94;--ww-wave-dark:#1a5f72;--ww-gold:#e8b84b;--ww-text:#0a1e28;--ww-muted:#1e4d5e;--ww-panel:rgba(255,255,255,0.35);--ww-line:rgba(42,122,148,0.20);display:block;color:var(--ww-text);font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif)}
      :host([theme-mode="auto"]){--ww-wave:var(--primary-color,#2a7a94);--ww-wave-dark:var(--accent-color,var(--primary-color,#1a5f72));--ww-gold:var(--warning-color,#e8b84b);--ww-text:var(--primary-text-color,#0a1e28);--ww-muted:var(--secondary-text-color,#1e4d5e);--ww-panel:color-mix(in srgb,var(--card-background-color,#fff) 76%,transparent);--ww-line:color-mix(in srgb,var(--primary-color,#2a7a94) 30%,transparent)}
      ha-card{background:transparent!important;box-shadow:none!important;border-radius:22px!important;overflow:hidden}
      *{box-sizing:border-box}
      .card-outer{container-type:inline-size;background:rgba(232,246,250,0.74);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:22px;border:1px solid rgba(255,255,255,0.42);box-shadow:0 4px 28px rgba(0,0,0,0.10);position:relative;overflow:hidden}
      :host([theme-mode="auto"]) .card-outer{background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color,#fff) 88%,transparent),color-mix(in srgb,var(--primary-color,#2a7a94) 14%,var(--card-background-color,#fff)))}
      .card-outer::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ww-wave) 62%,transparent),transparent)}
      .card-grid{display:grid;grid-template-columns:minmax(330px,25%) minmax(620px,1fr) minmax(430px,31%);height:var(--weatherwise-card-height,clamp(450px,24cqw,540px));min-height:0;max-height:var(--weatherwise-card-max-height,580px)}
      .card-grid.no-radar{grid-template-columns:minmax(260px,34%) minmax(0,1fr)}
      .left{min-width:0;display:flex;flex-direction:column;padding:18px 22px 10px;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08));border-right:1px solid rgba(255,255,255,0.22);overflow:hidden}
      .clock-panel{flex-shrink:0}
      .clock-row{display:flex;align-items:baseline;gap:8px;line-height:1}
      .clock-time{font-size:78px;font-weight:550;color:var(--ww-text);letter-spacing:0}
      .clock-ampm{font-size:22px;font-weight:850;color:var(--ww-muted)}
      .clock-date{font-size:19px;color:var(--ww-muted);font-weight:850;margin-top:10px;margin-bottom:16px}
      .section-title,.current-label{font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--ww-muted);font-weight:850;white-space:nowrap}
      .hourly-left{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:2px}
      .hourly-left::-webkit-scrollbar{display:none}
      .hour-row{display:grid;grid-template-columns:54px 26px 48px 1fr;align-items:center;gap:9px;flex:1 1 calc(100% / var(--ww-hourly-count,5));min-height:34px;max-height:54px;padding:5px 10px;border-radius:10px;background:var(--ww-panel);border:1px solid var(--ww-line)}
      .hour-time-left{font-size:15px;color:var(--ww-muted);font-weight:850;text-transform:uppercase}
      .hour-icon-left{width:25px;height:25px;display:flex;align-items:center;justify-content:center}
      .hour-temp-left{font-size:16px;font-weight:900;color:var(--ww-text);text-align:right}
      .hour-bar-wrap{height:8px;border-radius:999px;background:rgba(18,59,83,0.10);position:relative;overflow:hidden}
      .hour-bar-fill{position:absolute;top:0;left:0;height:100%;border-radius:999px;background:linear-gradient(90deg,#58b7c7,var(--ww-wave))}
      .center{min-width:0;display:flex;flex-direction:column;padding:18px 24px;border-right:1px solid rgba(255,255,255,0.22);overflow:hidden}
      .current-row{display:flex;align-items:center;gap:18px;margin-bottom:12px;min-width:0;min-height:86px;overflow:visible}
      .current-icon{width:72px;height:72px;flex-shrink:0;display:grid;place-items:center}
      .cond-block{flex:1;min-width:0}
      .cond-name{font-size:36px;font-weight:800;color:var(--ww-text);line-height:1.05;overflow-wrap:anywhere}
      .updated-note{font-size:14px;color:var(--ww-muted);font-weight:850;margin-top:7px;text-transform:uppercase;letter-spacing:.04em}
      .temp-block{text-align:right;flex-shrink:0;min-width:max-content}
      .temp-now{font-size:66px;font-weight:800;color:var(--ww-text);line-height:1.08;letter-spacing:0}
      .temp-hilo{font-size:20px;color:var(--ww-muted);font-weight:800;margin-top:9px}
      .daily-strip{display:grid;grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(0,1fr));gap:12px;min-height:188px;max-height:232px;margin-bottom:12px;flex:1}
      .fc-slot{display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:10px 8px;background:var(--ww-panel);border-radius:14px;border:1px solid var(--ww-line);min-width:0}
      .fc-day{font-size:22px;font-weight:850;color:var(--ww-text);text-transform:uppercase;line-height:1.05;text-align:center}
      .fc-period{font-size:14px;font-weight:900;color:var(--ww-muted);text-transform:uppercase;letter-spacing:.045em;margin-top:2px;min-height:16px;line-height:1.05;text-align:center}
      .fc-icon{width:64px;height:64px;margin:4px 0 2px;display:flex;align-items:center;justify-content:center}
      .fc-icon svg{width:60px;height:60px}
      .fc-temp{font-size:48px;font-weight:900;color:var(--ww-text);letter-spacing:0;line-height:.95}
      .stats-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:6px;flex-shrink:0}
      .stat{background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:11px;min-height:66px;min-width:0}
      .stat-ico{width:27px;height:27px;flex:0 0 27px;color:var(--ww-wave)}
      .stat-ico svg{width:27px;height:27px}
      .stat-lbl{font-size:12px;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
      .stat-val{font-size:19px;font-weight:900;color:var(--ww-text);white-space:nowrap}
      .ww-icon{overflow:visible;transform-box:fill-box}
      :host([animations]) .current-icon .ww-icon{filter:drop-shadow(0 8px 14px rgba(42,122,148,.14))}
      :host([animations]) .ww-sun-rays{transform-origin:20px 20px;animation:ww-sun-spin 28s linear infinite}
      :host([animations]) .ww-sun-core{transform-origin:center;animation:ww-sun-breathe 4.8s ease-in-out infinite}
      :host([animations]) .ww-cloud{animation:ww-cloud-drift 7.5s ease-in-out infinite}
      :host([animations]) .ww-rain{animation:ww-rain-fall .95s ease-in-out infinite}
      :host([animations]) .ww-snow{animation:ww-snow-float 2.8s ease-in-out infinite}
      :host([animations]) .ww-bolt{animation:ww-bolt-flash 4.8s steps(1,end) infinite}
      :host([animations]) .ww-moon,:host([animations]) .ww-moon-glow{animation:ww-moon-float 6.5s ease-in-out infinite}
      :host([animations]) .ww-fog{animation:ww-fog-slide 6s ease-in-out infinite}
      :host([animations]) .hour-row{animation:ww-row-in .42s ease-out both}
      :host([animations]) .hour-row:nth-child(2){animation-delay:.03s}
      :host([animations]) .hour-row:nth-child(3){animation-delay:.06s}
      :host([animations]) .hour-row:nth-child(4){animation-delay:.09s}
      :host([animations]) .hour-row:nth-child(5){animation-delay:.12s}
      :host([animations]) .hour-row:nth-child(6){animation-delay:.15s}
      :host([animations]) .fc-slot{animation:ww-card-rise .48s ease-out both}
      :host([animations]) .fc-slot:nth-child(2){animation-delay:.04s}
      :host([animations]) .fc-slot:nth-child(3){animation-delay:.08s}
      :host([animations]) .fc-slot:nth-child(4){animation-delay:.12s}
      :host([animations]) .fc-slot:nth-child(5){animation-delay:.16s}
      :host([animations]) .hour-bar-fill{transition:width .7s cubic-bezier(.2,.8,.2,1)}
      @keyframes ww-sun-spin{to{transform:rotate(360deg)}}
      @keyframes ww-sun-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes ww-cloud-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(1.4px)}}
      @keyframes ww-rain-fall{0%{transform:translateY(-1px);opacity:.72}55%{transform:translateY(1.9px);opacity:1}100%{transform:translateY(3px);opacity:.72}}
      @keyframes ww-snow-float{0%,100%{transform:translateY(-1px)}50%{transform:translateY(2px)}}
      @keyframes ww-bolt-flash{0%,88%,100%{opacity:.92}90%,93%{opacity:.35}91%,95%{opacity:1}}
      @keyframes ww-moon-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
      @keyframes ww-fog-slide{0%,100%{transform:translateX(-1px);opacity:.76}50%{transform:translateX(2px);opacity:1}}
      @keyframes ww-row-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      @keyframes ww-card-rise{from{opacity:0;transform:translateY(6px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
      .right{min-width:0;position:relative;overflow:hidden;border-radius:0 22px 22px 0}
      #rmap{width:100%;height:100%;min-height:0}
      .leaflet-container{height:100%;width:100%;position:relative;overflow:hidden;outline-offset:1px;background:#d7dee2;font-family:inherit;font-size:12px;line-height:1.5;z-index:0}
      .leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
      .leaflet-container img.leaflet-tile,.leaflet-container img.leaflet-image-layer{max-width:none!important;max-height:none!important}
      .leaflet-tile{filter:inherit;visibility:hidden}
      .leaflet-tile-loaded{visibility:inherit}
      .leaflet-map-pane canvas{z-index:100}
      .leaflet-map-pane svg{z-index:200}
      .leaflet-tile-pane{z-index:200}
      .leaflet-overlay-pane{z-index:400}
      .leaflet-marker-pane{z-index:600}
      .leaflet-tooltip-pane{z-index:650}
      .leaflet-popup-pane{z-index:700}
      .leaflet-control{position:relative;z-index:800;pointer-events:auto;float:left;clear:both}
      .leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}
      .leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}
      .leaflet-control-zoom{margin-left:10px;margin-top:10px}
      .leaflet-control-zoom a{display:block;text-align:center;text-decoration:none}
      .leaflet-control-attribution{position:absolute;right:0;bottom:0;margin:0;padding:0 5px}
      .radar-lbl{position:absolute;bottom:10px;left:12px;font-size:12px;color:rgba(10,30,46,0.76);background:rgba(255,255,255,0.78);border:1px solid rgba(255,255,255,0.55);padding:4px 10px;border-radius:99px;font-weight:800;z-index:1000;pointer-events:none}
      .radar-controls{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:1001}
      .radar-controls button{width:31px;height:31px;border:1px solid rgba(255,255,255,.62);border-radius:999px;background:rgba(255,255,255,.78);color:#0a1e2e;box-shadow:0 2px 10px rgba(10,30,46,.12);font:800 15px/1 var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);display:grid;place-items:center;cursor:pointer;padding:0}
      .radar-controls button:hover{background:rgba(255,255,255,.94)}
      .leaflet-control-zoom{border:0!important;box-shadow:0 2px 12px rgba(10,30,46,.13)!important}
      .leaflet-control-zoom a{width:34px!important;height:34px!important;line-height:31px!important;color:#0a1e2e!important;background:rgba(255,255,255,.82)!important;border-color:rgba(10,30,46,.10)!important;font-weight:650!important}
      .leaflet-control-attribution{background:rgba(255,255,255,.70)!important;color:rgba(10,30,46,.72)!important}
      .loading-note{font-size:12px;color:var(--ww-muted);font-weight:800;opacity:.8;padding:10px}
      .daily-strip>.loading-note{grid-column:1 / -1;align-self:center}
      .debug-panel{margin-top:10px;background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:8px;font-size:12px;color:var(--ww-muted)}
      .debug-row{display:flex;justify-content:space-between;gap:12px;padding:3px 0}
      .debug-row code{color:var(--ww-text)}
      .card-grid.no-forecast .daily-strip{display:none}.card-grid.no-forecast .center{justify-content:center}
      @container(max-width:1500px){.card-grid{grid-template-columns:minmax(310px,25%) minmax(570px,1fr) minmax(410px,31%);height:var(--weatherwise-card-height,clamp(440px,25cqw,520px))}.left{padding:14px 18px 10px}.center{padding:16px 20px}.clock-time{font-size:70px}.clock-date{font-size:18px}.section-title,.current-label{font-size:15px}.temp-now{font-size:58px}.temp-hilo{font-size:18px}.cond-name{font-size:32px}.updated-note{font-size:13px}.daily-strip{min-height:172px;max-height:212px}.fc-day{font-size:20px}.fc-period{font-size:13px}.fc-icon{width:58px;height:58px}.fc-icon svg{width:54px;height:54px}.fc-temp{font-size:43px}.hour-row{grid-template-columns:50px 24px 42px 1fr;gap:7px;min-height:32px}.hour-time-left{font-size:14px}.hour-temp-left{font-size:15px}.stat{padding:9px 11px;gap:9px;min-height:62px}.stat-lbl{font-size:11px}.stat-val{font-size:17px}}
      @container(max-width:980px){.card-grid:not(.layout-wide_panel){grid-template-columns:minmax(250px,30%) minmax(0,1fr);height:var(--weatherwise-card-height,clamp(560px,58cqw,680px))}.card-grid:not(.layout-wide_panel) .center{border-right:0}.card-grid:not(.layout-wide_panel) .right{grid-column:1 / -1;height:240px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid:not(.layout-wide_panel) #rmap{height:240px}.card-grid:not(.layout-wide_panel) .daily-strip{min-height:150px;max-height:none}}
      .card-grid.layout-wide_panel{grid-template-columns:minmax(260px,25%) minmax(430px,1fr) minmax(320px,31%);height:var(--weatherwise-card-height,clamp(390px,22cqw,500px))}
      .card-grid.layout-stacked,.card-grid.layout-compact{display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.layout-stacked .left,.card-grid.layout-compact .left{display:contents}.card-grid.layout-stacked .clock-panel,.card-grid.layout-compact .clock-panel{order:1;padding:18px 22px 0;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}.card-grid.layout-stacked .center,.card-grid.layout-compact .center{order:2;border-right:0;overflow:visible}.card-grid.layout-stacked .left>.section-title,.card-grid.layout-compact .left>.section-title{order:3;padding:0 22px;margin-top:4px}.card-grid.layout-stacked .hourly-left,.card-grid.layout-compact .hourly-left{order:4;flex:none;overflow:visible;padding:0 22px 16px}.card-grid.layout-stacked .right,.card-grid.layout-compact .right{order:5;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.layout-stacked .right,.card-grid.layout-stacked #rmap{height:300px;min-height:300px}.card-grid.layout-compact .right,.card-grid.layout-compact #rmap{height:220px;min-height:220px}.card-grid.layout-compact .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));min-height:150px}.card-grid.layout-compact .fc-slot:nth-child(n+4){display:none}
      @container(max-width:720px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:2;border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:3;padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:4;flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:5}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}.card-grid.layout-wide_panel{display:grid;grid-template-columns:minmax(120px,24%) minmax(230px,1fr) minmax(150px,28%);height:360px;max-height:360px}.card-grid.layout-wide_panel .left{display:flex;padding:12px 10px}.card-grid.layout-wide_panel .center{padding:12px 10px}.card-grid.layout-wide_panel .clock-time{font-size:38px}.card-grid.layout-wide_panel .clock-date{font-size:12px;margin:5px 0 8px}.card-grid.layout-wide_panel .current-icon{width:44px;height:44px}.card-grid.layout-wide_panel .cond-name{font-size:21px}.card-grid.layout-wide_panel .temp-now{font-size:38px}.card-grid.layout-wide_panel .daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(70px,1fr));gap:6px;overflow:hidden}.card-grid.layout-wide_panel .fc-temp{font-size:28px}.card-grid.layout-wide_panel .stats-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.card-grid.layout-wide_panel .right,.card-grid.layout-wide_panel #rmap{height:100%;min-height:0}}
      @media(max-width:760px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:2;border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:3;padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:4;flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:5}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}}
      @media(prefers-reduced-motion:reduce){:host([animations]) .ww-sun-rays,:host([animations]) .ww-sun-core,:host([animations]) .ww-cloud,:host([animations]) .ww-rain,:host([animations]) .ww-snow,:host([animations]) .ww-bolt,:host([animations]) .ww-moon,:host([animations]) .ww-moon-glow,:host([animations]) .ww-fog,:host([animations]) .hour-row,:host([animations]) .fc-slot{animation:none!important}:host([animations]) .hour-bar-fill{transition:none!important}}
    `;
  }
}

class WeatherWiseCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._entitySignature = "";
  }

  set hass(hass) {
    this._hass = hass;
    const signature = this._editorEntitySignature();
    if (!this._rendered || signature !== this._entitySignature) {
      this._entitySignature = signature;
      this._render();
    }
  }

  setConfig(config) {
    this._config = { ...WeatherWiseCard.getStubConfig(), ...(config || {}) };
    this._render();
  }

  _weatherEntities() {
    return Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("weather."))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  _sensorEntities() {
    return Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("sensor.") || entityId.startsWith("input_number."))
      .filter(([entityId, state]) => isWeatherWiseHumidityEntity(entityId, state))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  _editorEntitySignature() {
    const states = this._hass?.states || {};
    return Object.entries(states)
      .filter(([entityId, state]) => entityId.startsWith("weather.") || isWeatherWiseHumidityEntity(entityId, state))
      .map(([entityId, state]) => `${entityId}:${state.attributes?.friendly_name || ""}:${state.attributes?.device_class || ""}`)
      .sort()
      .join("|");
  }

  _setValue(key, value) {
    const numberKeys = ["latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"];
    const booleanKeys = ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast"];
    let nextValue = value;
    if (numberKeys.includes(key)) nextValue = value === "" ? undefined : Number(value);
    if (booleanKeys.includes(key)) nextValue = Boolean(value);
    this._config = { ...this._config, [key]: nextValue };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
    this._render();
  }

  _render() {
    if (!this.shadowRoot) return;
    this._rendered = true;
    const config = this._config || {};
    const entities = this._weatherEntities();
    const sensors = this._sensorEntities();
    const hasConfiguredEntity = entities.some(([entityId]) => entityId === config.entity);
    const hasConfiguredHumidityEntity = sensors.some(([entityId]) => entityId === config.humidity_entity);
    const configuredOption = config.entity && !hasConfiguredEntity
      ? `<option value="${this._escape(config.entity)}" selected>${this._escape(config.entity)}</option>`
      : "";
    const configuredHumidityOption = config.humidity_entity && !hasConfiguredHumidityEntity && isWeatherWiseHumidityEntity(config.humidity_entity, this._hass?.states?.[config.humidity_entity])
      ? `<option value="${this._escape(config.humidity_entity)}" selected>${this._escape(config.humidity_entity)}</option>`
      : "";
    const weatherOptions = entities.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${this._escape(entityId)}" ${config.entity === entityId ? "selected" : ""}>${this._escape(name)} (${this._escape(entityId)})</option>`;
    }).join("");
    const humidityOptions = sensors.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${this._escape(entityId)}" ${config.humidity_entity === entityId ? "selected" : ""}>${this._escape(name)} (${this._escape(entityId)})</option>`;
    }).join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host{display:block;font-family:var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);color:var(--primary-text-color,#0a1e28)}
        .editor{display:grid;gap:14px}
        .section{border:1px solid var(--divider-color,rgba(0,0,0,.12));border-radius:12px;padding:12px;background:var(--card-background-color,#fff)}
        .section-title{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--secondary-text-color,#536b75);margin-bottom:10px}
        label{display:grid;gap:5px;font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75)}
        input,select{width:100%;box-sizing:border-box;border:1px solid var(--divider-color,rgba(0,0,0,.18));border-radius:8px;padding:9px 10px;background:var(--card-background-color,#fff);color:var(--primary-text-color,#0a1e28);font:inherit}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .hint{font-size:12px;line-height:1.4;color:var(--secondary-text-color,#536b75);margin-top:8px}
        .check{display:flex;align-items:center;gap:8px;font-weight:700;color:var(--primary-text-color,#0a1e28)}
        .check input{width:auto}
        @media(max-width:600px){.grid{grid-template-columns:1fr}}
      </style>
      <div class="editor">
        <div class="section">
          <div class="section-title">Weather source</div>
          <label>Weather entity
            <select id="entity">
              <option value="">Choose a weather entity</option>
              ${configuredOption}
              ${weatherOptions}
            </select>
          </label>
          <label>Humidity entity
            <select id="humidity_entity">
              <option value="">Auto from weather entity</option>
              ${configuredHumidityOption}
              ${humidityOptions}
            </select>
          </label>
          <div class="hint">WeatherWise reads an existing Home Assistant weather entity and calls Home Assistant's forecast service. Use a humidity sensor here when your weather entity does not expose humidity.</div>
        </div>
        <div class="section">
          <div class="section-title">Region and radar</div>
          <div class="grid">
            <label>Country / region
              <select id="country">
                ${Object.entries(WEATHERWISE_COUNTRIES).map(([value, label]) => `<option value="${value}" ${config.country === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar provider
              <select id="radar_provider">
                ${Object.entries(WEATHERWISE_RADAR).map(([value, label]) => `<option value="${value}" ${config.radar_provider === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar style
              <select id="radar_style">
                ${Object.entries(WEATHERWISE_RADAR_STYLES).map(([value, label]) => `<option value="${value}" ${config.radar_style === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Map style
              <select id="radar_basemap">
                ${Object.entries(WEATHERWISE_BASEMAPS).map(([value, label]) => `<option value="${value}" ${config.radar_basemap === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar timeline
              <select id="radar_timeline">
                ${Object.entries(WEATHERWISE_RADAR_TIMELINES).map(([value, label]) => `<option value="${value}" ${config.radar_timeline === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="hint">Auto uses NOAA radar for the United States, Environment Canada radar for Canada, and RainViewer global radar for the UK and other regions. Future radar is used only when the selected provider exposes future frames.</div>
        </div>
        <div class="section">
          <div class="section-title">Display</div>
          <div class="grid">
            <label>Title <input id="title" value="${this._escape(config.title || "")}" placeholder="Local Weather"></label>
            <label>Units
              <select id="units">
                <option value="auto" ${config.units !== "imperial" && config.units !== "metric" ? "selected" : ""}>Auto from weather entity</option>
                <option value="imperial" ${config.units === "imperial" ? "selected" : ""}>Imperial</option>
                <option value="metric" ${config.units === "metric" ? "selected" : ""}>Metric</option>
              </select>
            </label>
            <label>Theme
              <select id="theme_mode">
                <option value="weatherwise" ${config.theme_mode !== "auto" ? "selected" : ""}>WeatherWise</option>
                <option value="auto" ${config.theme_mode === "auto" ? "selected" : ""}>Home Assistant theme</option>
              </select>
            </label>
            <label>Layout
              <select id="layout">
                ${Object.entries(WEATHERWISE_LAYOUTS).map(([value, label]) => `<option value="${value}" ${(config.layout || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Forecast list rows <input id="hourly_count" type="number" min="1" max="24" value="${this._escape(config.hourly_count || 5)}"></label>
            <label>Forecast cards <input id="forecast_count" type="number" min="1" max="7" value="${this._escape(config.forecast_count || 5)}"></label>
          </div>
          <label class="check"><input id="show_timeline" type="checkbox" ${config.show_timeline === false ? "" : "checked"}> Show hourly / forecast list</label>
          <label class="check"><input id="show_forecast" type="checkbox" ${config.show_forecast === false ? "" : "checked"}> Show daily forecast cards</label>
          <label class="check"><input id="show_animations" type="checkbox" ${config.show_animations === false ? "" : "checked"}> Subtle weather animations</label>
          <div class="hint">Animations automatically pause when the browser or device requests reduced motion.</div>
        </div>
        <div class="section">
          <div class="section-title">Radar location</div>
          <div class="grid">
            <label>Latitude <input id="latitude" type="number" step="0.0001" value="${this._escape(config.latitude ?? "")}"></label>
            <label>Longitude <input id="longitude" type="number" step="0.0001" value="${this._escape(config.longitude ?? "")}"></label>
            <label>Radar zoom <input id="radar_zoom" type="number" min="3" max="12" value="${this._escape(config.radar_zoom || 7)}"></label>
            <label>Loop speed <input id="radar_speed" type="number" min="300" max="3000" step="100" value="${this._escape(config.radar_speed || 700)}"></label>
          </div>
          <label class="check"><input id="show_radar" type="checkbox" ${config.show_radar === false ? "" : "checked"}> Show radar panel</label>
          <label class="check"><input id="show_map_controls" type="checkbox" ${config.show_map_controls === false ? "" : "checked"}> Show map controls</label>
          <label class="check"><input id="radar_controls" type="checkbox" ${config.radar_controls === false ? "" : "checked"}> Show radar playback controls</label>
          <label class="check"><input id="show_warning_overlay" type="checkbox" ${config.show_warning_overlay === false ? "" : "checked"}> Show US warning overlay</label>
          <div class="hint">Latitude and longitude control only the radar center. They do not change the selected weather entity.</div>
        </div>
      </div>
    `;
    ["entity", "humidity_entity", "country", "radar_provider", "radar_style", "radar_basemap", "radar_timeline", "title", "units", "theme_mode", "layout", "latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.value));
    });
    ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.checked));
    });
  }

  _escape(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }
}

class WeatherWiseDashedCard extends WeatherWiseCard {}
class WeatherWiseDashedCardEditor extends WeatherWiseCardEditor {}

if (!customElements.get(CARD_TYPES[0])) customElements.define(CARD_TYPES[0], WeatherWiseCard);
// Keep the dashed element names as YAML-only legacy aliases for early WeatherWise users.
if (!customElements.get(CARD_TYPES[1])) customElements.define(CARD_TYPES[1], WeatherWiseDashedCard);
if (!customElements.get("weatherwise-card-editor")) customElements.define("weatherwise-card-editor", WeatherWiseCardEditor);
if (!customElements.get("weather-wise-card-editor")) customElements.define("weather-wise-card-editor", WeatherWiseDashedCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "weatherwise-card",
  name: "WeatherWise Weather",
  description: "Weather dashboard card with forecasts, theme support, and optional radar.",
  documentationURL: "https://github.com/TheWillMiller/weather-wise",
  preview: true
});

console.info(
  `%c WEATHERWISE-CARD %c v${CARD_VERSION} `,
  "background:#0d3a5c;color:#7ecbca;font-weight:bold;padding:2px 4px;border-radius:3px 0 0 3px",
  "background:#7ecbca;color:#0d3a5c;font-weight:bold;padding:2px 4px;border-radius:0 3px 3px 0"
);
