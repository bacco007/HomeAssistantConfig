/*
 * WeatherWise Card
 * Home Assistant weather dashboard card with forecasts and optional radar.
 */

const CARD_VERSION = "0.4.0";
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
  compact: "Compact",
  radar_bottom: "Radar bottom"
};

const WEATHERWISE_LANGUAGES = {
  auto: "Auto",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português"
};

const WEATHERWISE_TEXT = {
  en: {
    am: "AM",
    pm: "PM",
    currentWeather: "Current Weather",
    selectWeatherEntity: "Select a weather entity",
    connectWeather: "Connect weather in Home Assistant",
    openEditor: "Open the card editor to finish setup",
    waitingLive: "Waiting for live weather data",
    updated: "Updated",
    forecast: "Forecast",
    daily: "Daily",
    hourly: "Hourly",
    dayPeriod: "Day",
    nightPeriod: "Night",
    humidity: "Humidity",
    wind: "Wind",
    sunrise: "Sunrise",
    sunset: "Sunset",
    waitingForecast: "Waiting for Home Assistant forecast data.",
    relativeTemp: "Relative temperature within the visible forecast rows",
    radarLoading: "Radar loading...",
    radarUnavailable: "Radar unavailable",
    radarWaiting: "Radar waiting for dashboard layout",
    rainviewerUnavailable: "RainViewer radar unavailable",
    currentRadar: "current radar",
    radarLoop: "radar loop",
    futureRadar: "future radar",
    previousRadarFrame: "Previous radar frame",
    nextRadarFrame: "Next radar frame",
    pauseRadarLoop: "Pause radar loop",
    playRadarLoop: "Play radar loop",
    weatherAlert: "Weather alert",
    activeWeatherAlert: "active weather alert",
    nwsAlertTap: "NWS alert - tap for details",
    severity: "Severity",
    unknown: "Unknown",
    forecastIntro: "Forecast",
    currently: "currently",
    withHigh: "with a high near {temp}",
    chancePrecip: "and a {chance}% chance of precipitation",
    tonight: "Tonight will be {condition}",
    withLow: "with a low near {temp}",
    tomorrow: "Tomorrow will be {condition}",
    nearTemp: "near {temp}",
    conditions: {
      sunny: "sunny",
      "clear night": "clear",
      "partly cloudy": "partly cloudy",
      cloudy: "cloudy",
      rainy: "rainy",
      pouring: "heavy rain",
      lightning: "thunderstorms possible",
      "lightning rainy": "thunderstorms possible",
      snowy: "snowy",
      "snowy rainy": "mixed wintry precipitation",
      fog: "foggy",
      windy: "windy",
      "windy variant": "windy with clouds",
      unavailable: "unavailable"
    }
  },
  fr: {
    am: "AM",
    pm: "PM",
    currentWeather: "Météo actuelle",
    selectWeatherEntity: "Sélectionnez une entité météo",
    connectWeather: "Connectez la météo dans Home Assistant",
    openEditor: "Ouvrez l'éditeur de carte pour terminer",
    waitingLive: "En attente des données météo en direct",
    updated: "Mis à jour",
    forecast: "Prévisions",
    daily: "Quotidien",
    hourly: "Heure par heure",
    dayPeriod: "Jour",
    nightPeriod: "Nuit",
    humidity: "Humidité",
    wind: "Vent",
    sunrise: "Lever du soleil",
    sunset: "Coucher du soleil",
    waitingForecast: "En attente des prévisions Home Assistant.",
    relativeTemp: "Température relative dans les lignes de prévision visibles",
    radarLoading: "Chargement du radar...",
    radarUnavailable: "Radar indisponible",
    radarWaiting: "Le radar attend la mise en page du tableau de bord",
    rainviewerUnavailable: "Radar RainViewer indisponible",
    currentRadar: "radar actuel",
    radarLoop: "boucle radar",
    futureRadar: "radar futur",
    previousRadarFrame: "Image radar précédente",
    nextRadarFrame: "Image radar suivante",
    pauseRadarLoop: "Mettre la boucle radar en pause",
    playRadarLoop: "Lancer la boucle radar",
    weatherAlert: "Alerte météo",
    activeWeatherAlert: "alerte météo active",
    nwsAlertTap: "alerte NWS - toucher pour les détails",
    severity: "Gravité",
    unknown: "Inconnue",
    forecastIntro: "Prévisions",
    currently: "actuellement",
    withHigh: "avec un maximum près de {temp}",
    chancePrecip: "et {chance} % de risque de précipitations",
    tonight: "Ce soir, le temps sera {condition}",
    withLow: "avec un minimum près de {temp}",
    tomorrow: "Demain, le temps sera {condition}",
    nearTemp: "près de {temp}",
    conditions: {
      sunny: "ensoleillé",
      "clear night": "dégagé",
      "partly cloudy": "partiellement nuageux",
      cloudy: "nuageux",
      rainy: "pluvieux",
      pouring: "forte pluie",
      lightning: "orages possibles",
      "lightning rainy": "orages possibles",
      snowy: "neigeux",
      "snowy rainy": "précipitations hivernales mixtes",
      fog: "brumeux",
      windy: "venteux",
      "windy variant": "venteux avec des nuages",
      unavailable: "indisponible"
    }
  },
  es: {
    am: "a. m.",
    pm: "p. m.",
    currentWeather: "Tiempo actual",
    selectWeatherEntity: "Selecciona una entidad meteorológica",
    connectWeather: "Conecta el tiempo en Home Assistant",
    openEditor: "Abre el editor de la tarjeta para terminar",
    waitingLive: "Esperando datos meteorológicos en vivo",
    updated: "Actualizado",
    forecast: "Pronóstico",
    daily: "Diario",
    hourly: "Por hora",
    dayPeriod: "Día",
    nightPeriod: "Noche",
    humidity: "Humedad",
    wind: "Viento",
    sunrise: "Amanecer",
    sunset: "Atardecer",
    waitingForecast: "Esperando datos de pronóstico de Home Assistant.",
    relativeTemp: "Temperatura relativa en las filas de pronóstico visibles",
    radarLoading: "Cargando radar...",
    radarUnavailable: "Radar no disponible",
    radarWaiting: "El radar espera el diseño del panel",
    rainviewerUnavailable: "Radar RainViewer no disponible",
    currentRadar: "radar actual",
    radarLoop: "bucle de radar",
    futureRadar: "radar futuro",
    previousRadarFrame: "Fotograma de radar anterior",
    nextRadarFrame: "Siguiente fotograma de radar",
    pauseRadarLoop: "Pausar bucle de radar",
    playRadarLoop: "Reproducir bucle de radar",
    weatherAlert: "Alerta meteorológica",
    activeWeatherAlert: "alerta meteorológica activa",
    nwsAlertTap: "alerta NWS - toca para ver detalles",
    severity: "Severidad",
    unknown: "Desconocida",
    forecastIntro: "Pronóstico",
    currently: "actualmente",
    withHigh: "con una máxima cerca de {temp}",
    chancePrecip: "y un {chance} % de probabilidad de precipitación",
    tonight: "Esta noche estará {condition}",
    withLow: "con una mínima cerca de {temp}",
    tomorrow: "Mañana estará {condition}",
    nearTemp: "cerca de {temp}",
    conditions: {
      sunny: "soleado",
      "clear night": "despejado",
      "partly cloudy": "parcialmente nublado",
      cloudy: "nublado",
      rainy: "lluvioso",
      pouring: "lluvia intensa",
      lightning: "posibles tormentas",
      "lightning rainy": "posibles tormentas",
      snowy: "nevado",
      "snowy rainy": "precipitación invernal mixta",
      fog: "con niebla",
      windy: "ventoso",
      "windy variant": "ventoso con nubes",
      unavailable: "no disponible"
    }
  },
  de: {
    am: "AM",
    pm: "PM",
    currentWeather: "Aktuelles Wetter",
    selectWeatherEntity: "Wetter-Entität auswählen",
    connectWeather: "Wetter in Home Assistant verbinden",
    openEditor: "Karteneditor öffnen, um die Einrichtung abzuschließen",
    waitingLive: "Warte auf Live-Wetterdaten",
    updated: "Aktualisiert",
    forecast: "Vorhersage",
    daily: "Täglich",
    hourly: "Stündlich",
    dayPeriod: "Tag",
    nightPeriod: "Nacht",
    humidity: "Luftfeuchtigkeit",
    wind: "Wind",
    sunrise: "Sonnenaufgang",
    sunset: "Sonnenuntergang",
    waitingForecast: "Warte auf Vorhersagedaten von Home Assistant.",
    relativeTemp: "Relative Temperatur in den sichtbaren Vorhersagezeilen",
    radarLoading: "Radar wird geladen...",
    radarUnavailable: "Radar nicht verfügbar",
    radarWaiting: "Radar wartet auf das Dashboard-Layout",
    rainviewerUnavailable: "RainViewer-Radar nicht verfügbar",
    currentRadar: "aktuelles Radar",
    radarLoop: "Radarschleife",
    futureRadar: "Zukunftsradar",
    previousRadarFrame: "Vorheriges Radarbild",
    nextRadarFrame: "Nächstes Radarbild",
    pauseRadarLoop: "Radarschleife pausieren",
    playRadarLoop: "Radarschleife starten",
    weatherAlert: "Wetterwarnung",
    activeWeatherAlert: "aktive Wetterwarnung",
    nwsAlertTap: "NWS-Warnung - für Details antippen",
    severity: "Schweregrad",
    unknown: "Unbekannt",
    forecastIntro: "Vorhersage",
    currently: "derzeit",
    withHigh: "mit einem Höchstwert um {temp}",
    chancePrecip: "und {chance} % Niederschlagswahrscheinlichkeit",
    tonight: "Heute Nacht wird es {condition}",
    withLow: "mit einem Tiefstwert um {temp}",
    tomorrow: "Morgen wird es {condition}",
    nearTemp: "um {temp}",
    conditions: {
      sunny: "sonnig",
      "clear night": "klar",
      "partly cloudy": "teilweise bewölkt",
      cloudy: "bewölkt",
      rainy: "regnerisch",
      pouring: "starker Regen",
      lightning: "Gewitter möglich",
      "lightning rainy": "Gewitter möglich",
      snowy: "verschneit",
      "snowy rainy": "gemischter winterlicher Niederschlag",
      fog: "neblig",
      windy: "windig",
      "windy variant": "windig mit Wolken",
      unavailable: "nicht verfügbar"
    }
  },
  pt: {
    am: "AM",
    pm: "PM",
    currentWeather: "Tempo atual",
    selectWeatherEntity: "Selecione uma entidade de meteorologia",
    connectWeather: "Ligue a meteorologia no Home Assistant",
    openEditor: "Abra o editor do cartão para terminar",
    waitingLive: "A aguardar dados meteorológicos em direto",
    updated: "Atualizado",
    forecast: "Previsão",
    daily: "Diária",
    hourly: "Por hora",
    dayPeriod: "Dia",
    nightPeriod: "Noite",
    humidity: "Humidade",
    wind: "Vento",
    sunrise: "Nascer do sol",
    sunset: "Pôr do sol",
    waitingForecast: "A aguardar dados de previsão do Home Assistant.",
    relativeTemp: "Temperatura relativa nas linhas de previsão visíveis",
    radarLoading: "A carregar radar...",
    radarUnavailable: "Radar indisponível",
    radarWaiting: "Radar à espera do layout do painel",
    rainviewerUnavailable: "Radar RainViewer indisponível",
    currentRadar: "radar atual",
    radarLoop: "ciclo de radar",
    futureRadar: "radar futuro",
    previousRadarFrame: "Imagem de radar anterior",
    nextRadarFrame: "Próxima imagem de radar",
    pauseRadarLoop: "Pausar ciclo de radar",
    playRadarLoop: "Reproduzir ciclo de radar",
    weatherAlert: "Alerta meteorológico",
    activeWeatherAlert: "alerta meteorológico ativo",
    nwsAlertTap: "alerta NWS - toque para detalhes",
    severity: "Severidade",
    unknown: "Desconhecida",
    forecastIntro: "Previsão",
    currently: "atualmente",
    withHigh: "com máxima perto de {temp}",
    chancePrecip: "e {chance}% de probabilidade de precipitação",
    tonight: "Hoje à noite estará {condition}",
    withLow: "com mínima perto de {temp}",
    tomorrow: "Amanhã estará {condition}",
    nearTemp: "perto de {temp}",
    conditions: {
      sunny: "ensolarado",
      "clear night": "limpo",
      "partly cloudy": "parcialmente nublado",
      cloudy: "nublado",
      rainy: "chuvoso",
      pouring: "chuva forte",
      lightning: "possíveis trovoadas",
      "lightning rainy": "possíveis trovoadas",
      snowy: "com neve",
      "snowy rainy": "precipitação invernal mista",
      fog: "com nevoeiro",
      windy: "ventoso",
      "windy variant": "ventoso com nuvens",
      unavailable: "indisponível"
    }
  }
};

function _wwEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function isWeatherWiseHumidityEntity(entityId, state) {
  if (!entityId) return false;
  const friendly = String(state?.attributes?.friendly_name || "").toLowerCase();
  const deviceClass = String(state?.attributes?.device_class || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "humidity" || id.includes("humidity") || friendly.includes("humidity");
}

function isWeatherWiseTemperatureEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "temperature" || unit.includes("°") || unit === "c" || unit === "f" || id.includes("temp") || friendly.includes("temp");
}

class WeatherWiseCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:weatherwise-card",
      entity: "weather.home",
      humidity_entity: "",
      temperature_entity: "",
      title: "Local Weather",
      country: "us",
      radar_provider: "auto",
      theme_mode: "weatherwise",
      units: "auto",
      language: "auto",
      layout: "auto",
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_forecast_summary: true,
      show_radar: true,
      show_map_controls: true,
      radar_controls: true,
      radar_style: "standard",
      radar_basemap: "light",
      radar_timeline: "loop",
      show_warning_overlay: true,
      show_animations: true,
      panel_order: ["clock", "weather", "radar"],
      column_widths: [25, 50, 25],
      timeline_autoscroll: false,
      stack_below: 0,
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
    this._warningPopupMarker = null;
    this._radarIndex = 0;
    this._radarPlaying = true;
    this._radarLabelText = "radar loop";
    this._radarProviderRendered = "";
    this._radarResizeObserver = null;
    this._cardResizeObserver = null;
    this._timelineScrollRaf = null;
    this._timelineScrollDir = 1;
    this._timelineScrollPauseUntil = 0;
    this._timelineScrollLast = null;
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
    this._stopTimelineScroll();
    this._cardResizeObserver?.disconnect?.();
    this._cardResizeObserver = null;
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
    const language = String(config.language || config.forecast_summary_language || "auto").toLowerCase();
    return {
      title: "Local Weather",
      humidity_entity: "",
      temperature_entity: "",
      country: WEATHERWISE_COUNTRIES[country] ? country : "global",
      radar_provider: WEATHERWISE_RADAR[radarProvider] ? radarProvider : "auto",
      theme_mode: themeMode,
      units,
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_forecast_summary: true,
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
      language: WEATHERWISE_LANGUAGES[language] ? language : "auto",
      latitude: this._numberOr(config.latitude, undefined),
      longitude: this._numberOr(config.longitude, undefined),
      hourly_count: Math.max(1, Math.min(24, Number(config.hourly_count) || 5)),
      forecast_count: Math.max(1, Math.min(7, Number(config.forecast_count) || 5)),
      show_timeline: config.show_timeline !== false,
      show_forecast: config.show_forecast !== false,
      show_forecast_summary: config.show_forecast_summary !== false,
      show_radar: config.show_radar !== false,
      show_map_controls: config.show_map_controls !== false,
      radar_controls: config.radar_controls !== false,
      show_warning_overlay: config.show_warning_overlay !== false,
      show_animations: config.show_animations !== false,
      panel_order: (() => {
        const def = ["clock", "weather", "radar"];
        const o = config.panel_order;
        if (!Array.isArray(o) || o.length !== 3) return def;
        return [...o].sort().join(",") === "clock,radar,weather" ? o : def;
      })(),
      column_widths: (() => {
        const def = [25, 50, 25];
        const w = config.column_widths;
        if (!Array.isArray(w) || w.length !== 3) return def;
        const nums = w.map((v) => Number(v) || 0);
        const sum = nums.reduce((a, b) => a + b, 0);
        // Migrate old fr-weight format (e.g. [1,2,1]) — sums are always < 60
        if (sum < 60) {
          const total = sum || 4;
          return nums.map((v) => Math.max(20, Math.min(60, Math.round((v / total * 100) / 5) * 5)));
        }
        return nums.map((v) => Math.max(20, Math.min(60, Math.round(v / 5) * 5)));
      })(),
      timeline_autoscroll: config.timeline_autoscroll === true,
      stack_below: Math.max(0, Math.round(Number(config.stack_below) || 0)),
      radar_speed: Math.max(300, Math.min(3000, Number(config.radar_speed) || 700))
    };
  }

  _renderKey() {
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    return JSON.stringify({
      entity: this._config.entity,
      humidityEntity: this._config.humidity_entity,
      temperatureEntity: this._config.temperature_entity,
      state: stateObj?.state,
      updated: stateObj?.last_updated,
      temp: attrs.temperature,
      temperatureState: this._config.temperature_entity ? this._hass?.states?.[this._config.temperature_entity]?.state : undefined,
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
        this._language(),
        this._config.show_radar,
        this._config.show_timeline,
        this._config.show_forecast,
        this._config.show_forecast_summary,
        this._config.radar_controls,
        this._config.show_warning_overlay,
        this._config.hourly_count,
        this._config.forecast_count,
        (this._config.panel_order || []).join(","),
        (this._config.column_widths || []).join(","),
        this._config.timeline_autoscroll
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

  _language() {
    const configured = String(this._config.language || this._config.forecast_summary_language || "auto").toLowerCase();
    if (WEATHERWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    const locale = String(this._hass?.locale?.language || this._hass?.language || browserLanguage || "en").toLowerCase();
    const code = locale.split(/[-_]/)[0];
    return WEATHERWISE_TEXT[code] ? code : "en";
  }

  _texts() {
    return WEATHERWISE_TEXT[this._language()] || WEATHERWISE_TEXT.en;
  }

  _localeCode() {
    const configured = String(this._config.language || "auto").toLowerCase();
    if (configured !== "auto" && WEATHERWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    return this._hass?.locale?.language || this._hass?.language || browserLanguage || "en";
  }

  _t(key) {
    return this._texts()[key] ?? WEATHERWISE_TEXT.en[key] ?? key;
  }

  _template(key, values = {}) {
    return String(this._t(key)).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  _render() {
    if (!this.shadowRoot) return;
    this._stopTimelineScroll();
    const text = this._texts();
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    const condition = stateObj?.state || "unavailable";
    const sunStateObj = this._hass?.states?.["sun.sun"];
    const displayCondition = this._displayCondition(condition, sunStateObj);
    const units = this._unitContext(attrs);
    const temp = this._displayTemp(this._currentTemperature(attrs), units);
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
    const forecastSummary = this._forecastSummary({ hourly, daily, twiceDaily, units, condition: displayCondition });

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        <div class="card-outer">
          <div class="card-grid layout-${_wwEscape(layout)} ${this._config.show_radar && provider !== "none" ? "" : "no-radar"} ${this._config.show_timeline === false ? "no-timeline" : ""} ${this._config.show_forecast === false ? "no-forecast" : ""}" style="${(() => {
  const w = this._config.column_widths || [25,50,25];
  const cl = this._sectionOrder('clock');
  const wl = this._sectionOrder('weather');
  const rl = this._sectionOrder('radar');
  const cb = cl * 10, wb = wl * 10, rb = rl * 10;
  return `--ww-col1:${w[0]}fr;--ww-col2:${w[1]}fr;--ww-col3:${w[2]}fr;--ww-left-order:${cl};--ww-center-order:${wl};--ww-right-order:${rl};--ww-ord-clock-title:${cb+1};--ww-ord-clock-hourly:${cb+2};--ww-ord-weather:${wb+1};--ww-ord-radar:${rb+1};`;
})()}--ww-hourly-count:${Math.max(1, Math.min(24, Number(this._config.hourly_count) || 5))};--ww-forecast-count:${Math.max(1, Math.min(7, Number(this._config.forecast_count) || 5))}">
            <section class="left">
              <div class="clock-panel">
                <div class="clock-row">
                  <div class="clock-time" id="clock-time">${this._clockTime(now)}</div>
                  <div class="clock-ampm" id="clock-ampm">${now.getHours() >= 12 ? this._t("pm") : this._t("am")}</div>
                </div>
                <div class="clock-date" id="clock-date">${this._longDate(now)}</div>
                ${this._config.show_forecast_summary === false ? "" : `<div class="forecast-summary" title="${_wwEscape(forecastSummary)}"><span class="forecast-summary-text">${_wwEscape(forecastSummary)}</span></div>`}
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
                  <div class="current-label">${_wwEscape(text.currentWeather)}</div>
                  <div class="cond-name">${needsEntity ? _wwEscape(text.selectWeatherEntity) : unavailable ? _wwEscape(text.connectWeather) : _wwEscape(this._conditionLabel(displayCondition))}</div>
                  <div class="updated-note">${needsEntity ? _wwEscape(text.openEditor) : unavailable ? _wwEscape(text.waitingLive) : `${_wwEscape(text.updated)} ${this._shortTime(now)}`}</div>
                </div>
                <div class="temp-block">
                  <div class="temp-now">${temp}</div>
                  <div class="temp-hilo">${hiLo}</div>
                </div>
              </div>
              ${this._config.show_forecast === false ? "" : `<div class="daily-strip">${this._renderDaily(mainPeriods, units)}</div>`}
              <div class="stats-row">
                ${this._stat("humidity", text.humidity, `${humidity}%`)}
                ${this._stat("wind", text.wind, wind)}
                ${this._stat("sunrise", text.sunrise, this._shortTime(sun.next_rising))}
                ${this._stat("sunset", text.sunset, this._shortTime(sun.next_setting))}
              </div>
              ${this._renderDebug({ stateObj, hourly, daily, twiceDaily, provider, units })}
            </section>
            ${this._config.show_radar && provider !== "none" ? `
              <section class="right">
                <div id="rmap"></div>
                ${this._config.radar_controls === false ? "" : `
                  <div class="radar-controls" aria-label="Radar playback controls">
                    <button type="button" data-radar-action="prev" title="${_wwEscape(text.previousRadarFrame)}" aria-label="${_wwEscape(text.previousRadarFrame)}">&lt;</button>
                    <button type="button" data-radar-action="play" title="${_wwEscape(text.pauseRadarLoop)}" aria-label="${_wwEscape(text.pauseRadarLoop)}">||</button>
                    <button type="button" data-radar-action="next" title="${_wwEscape(text.nextRadarFrame)}" aria-label="${_wwEscape(text.nextRadarFrame)}">&gt;</button>
                  </div>
                `}
                <div class="radar-lbl" id="radar-lbl">${_wwEscape(text.radarLoading)}</div>
                <div class="radar-alert" id="radar-alert" hidden></div>
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
    if (this._config.timeline_autoscroll && this._config.show_timeline !== false) {
      window.setTimeout(() => this._startTimelineScroll(), 400);
    }
    this._setupCardResizeObserver();
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
      else this._setRadarLabel(this._t("radarWaiting"));
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
        ${rows.map(([key, value]) => `<div class="debug-row"><span>${key}</span><code>${_wwEscape(value)}</code></div>`).join("")}
      </details>
    `;
  }

  _updateClock() {
    const now = new Date();
    const time = this.shadowRoot?.getElementById("clock-time");
    const ampm = this.shadowRoot?.getElementById("clock-ampm");
    const date = this.shadowRoot?.getElementById("clock-date");
    if (time) time.textContent = this._clockTime(now);
    if (ampm) ampm.textContent = now.getHours() >= 12 ? this._t("pm") : this._t("am");
    if (date) date.textContent = this._longDate(now);
  }

  _timelineTitle(mode) {
    if (mode === "twice_daily") return this._t("forecast");
    if (mode === "daily") return this._t("daily");
    return this._t("hourly");
  }

  _renderTimeline(periods, units, mode = "hourly") {
    if (!periods.length) return `<div class="loading-note">${_wwEscape(this._t("waitingForecast"))}</div>`;
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
          <div class="hour-bar-wrap" title="${_wwEscape(this._t("relativeTemp"))}"><div class="hour-bar-fill" style="width:${pct}%"></div></div>
          <div class="hour-precip">${this._formatPrecip(item, units)}</div>
        </div>
      `;
    }).join("");
  }

  _timelineTime(item, mode) {
    if (mode === "hourly") return this._hour(item.datetime);
    const day = this._dayName(item.datetime);
    if (mode === "twice_daily" && item.is_daytime !== undefined) return `${day} ${item.is_daytime ? this._t("dayPeriod") : this._t("nightPeriod")}`;
    return day;
  }

  _renderDaily(periods, units) {
    if (!periods.length) return `<div class="loading-note">${_wwEscape(this._t("waitingForecast"))}</div>`;
    return periods.slice(0, Number(this._config.forecast_count) || 5).map((item) => {
      const period = item.is_daytime === undefined ? "" : item.is_daytime ? this._t("dayPeriod") : this._t("nightPeriod");
      return `
        <div class="fc-slot">
          <div>
            <div class="fc-day">${this._dayName(item.datetime)}</div>
            <div class="fc-period">${period}</div>
          </div>
          <div class="fc-icon">${this._icon(item.condition || item.state, 48)}</div>
          <div class="fc-temp">${this._displayTemp(item.temperature, units, false)}</div>
          <div class="fc-precip">${this._formatPrecip(item, units)}</div>
        </div>
      `;
    }).join("");
  }

  _forecastSummary({ hourly, daily, twiceDaily, units, condition }) {
    const parts = [];
    const todayHigh = this._summaryHigh(daily, hourly, units);
    const todayChance = this._summaryPrecipChance([...(hourly || []).slice(0, 8), daily?.[0], twiceDaily?.[0]]);
    const nowPhrase = this._localizedCondition(condition);
    let opener = `${this._t("forecastIntro")}: ${this._t("currently")} ${nowPhrase}`;
    if (Number.isFinite(todayHigh)) opener += `, ${this._template("withHigh", { temp: `${Math.round(todayHigh)}°` })}`;
    if (Number.isFinite(todayChance)) opener += ` ${this._template("chancePrecip", { chance: Math.round(todayChance) })}`;
    parts.push(`${opener}.`);

    const tonight = this._firstNightPeriod(twiceDaily, daily);
    if (tonight) {
      const tonightTemp = this._tempValue(tonight.templow ?? tonight.low_temperature ?? tonight.temperature, units);
      const tonightChance = this._precipProbability(tonight);
      const tonightWords = this._localizedCondition(tonight.condition || tonight.state);
      const bits = [this._template("tonight", { condition: tonightWords })];
      if (Number.isFinite(tonightTemp)) bits.push(this._template("withLow", { temp: `${Math.round(tonightTemp)}°` }));
      if (Number.isFinite(tonightChance)) bits.push(this._template("chancePrecip", { chance: Math.round(tonightChance) }));
      parts.push(`${bits.join(", ")}.`);
    }

    const tomorrow = this._tomorrowPeriod(twiceDaily, daily, hourly);
    if (tomorrow) {
      const tomorrowTemp = this._tempValue(tomorrow.temperature ?? tomorrow.high_temperature, units);
      const tomorrowChance = this._precipProbability(tomorrow);
      const tomorrowWords = this._localizedCondition(tomorrow.condition || tomorrow.state);
      const bits = [this._template("tomorrow", { condition: tomorrowWords })];
      if (Number.isFinite(tomorrowTemp)) bits.push(this._template("nearTemp", { temp: `${Math.round(tomorrowTemp)}°` }));
      if (Number.isFinite(tomorrowChance)) bits.push(this._template("chancePrecip", { chance: Math.round(tomorrowChance) }));
      parts.push(`${bits.join(", ")}.`);
    }

    return parts.join(" ");
  }

  _summaryHigh(daily, hourly, units) {
    const dailyHigh = this._tempValue(daily?.[0]?.temperature ?? daily?.[0]?.high_temperature, units);
    if (Number.isFinite(dailyHigh)) return dailyHigh;
    const temps = (hourly || []).slice(0, 12).map((item) => this._tempValue(item.temperature, units)).filter(Number.isFinite);
    return temps.length ? Math.max(...temps) : NaN;
  }

  _summaryPrecipChance(items) {
    const values = (items || []).map((item) => this._precipProbability(item)).filter(Number.isFinite);
    return values.length ? Math.max(...values) : NaN;
  }

  _firstNightPeriod(twiceDaily, daily) {
    const fromTwiceDaily = (twiceDaily || []).find(
      (item) => item.is_daytime === false || /night/i.test(String(item.name || ""))
    );
    if (fromTwiceDaily) return fromTwiceDaily;
    const d = daily?.[0];
    return (d && (d.templow != null || d.low_temperature != null)) ? d : null;
  }

  _tomorrowPeriod(twiceDaily, daily, hourly) {
    return (twiceDaily || []).find((item, index) => index > 0 && item.is_daytime !== false)
      || daily?.[1]
      || hourly?.[12]
      || null;
  }

  _localizedCondition(condition) {
    const value = String(condition || "weather").replace(/[-_]+/g, " ").trim().toLowerCase();
    return this._texts().conditions?.[value]
      || WEATHERWISE_TEXT.en.conditions[value]
      || value
      || "weather";
  }

  _conditionLabel(condition) {
    if (this._language() === "en") return this._titleCase(condition);
    const localized = this._localizedCondition(condition);
    return localized ? localized.charAt(0).toLocaleUpperCase(this._localeCode()) + localized.slice(1) : "--";
  }

  _stat(kind, label, value) {
    const icons = {
      humidity: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3s6 6.1 6 11a6 6 0 1 1-12 0c0-4.9 6-11 6-11Z" fill="#65b8df"/><path d="M9.2 16.4c.7 1.3 1.8 2 3.4 2" stroke="white" stroke-width="1.8" stroke-linecap="round"/></svg>`,
      wind: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 8h10.4a3 3 0 1 0-2.6-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 13h15.4a3 3 0 1 1-2.6 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunrise: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#fbbf24"/><path d="M12 4v4M5 11l3 1M19 11l-3 1" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunset: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#f59e0b"/><path d="M12 8V4M5 11l3 1M19 11l-3 1" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`
    };
    return `<div class="stat"><div class="stat-ico" aria-hidden="true">${icons[kind]}</div><div><div class="stat-lbl">${label}</div><div class="stat-val">${_wwEscape(value || "--")}</div></div></div>`;
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
      this._setRadarLabel(this._t("radarUnavailable"));
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
    this._warningPopupMarker = null;
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

  _stopTimelineScroll() {
    if (this._timelineScrollRaf) cancelAnimationFrame(this._timelineScrollRaf);
    this._timelineScrollRaf = null;
    this._timelineScrollLast = null;
  }

  _setupCardResizeObserver() {
    this._cardResizeObserver?.disconnect?.();
    this._cardResizeObserver = null;
    const threshold = this._config.stack_below || 0;
    const grid = this.shadowRoot?.querySelector(".card-grid");
    if (!grid || !threshold || !window.ResizeObserver) return;
    const outer = this.shadowRoot.querySelector(".card-outer");
    if (!outer) return;
    this._cardResizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;
      if (!width) return;
      grid.classList.toggle("ww-force-stack", width < threshold);
    });
    this._cardResizeObserver.observe(outer);
  }

  _startTimelineScroll() {
    this._stopTimelineScroll();
    const container = this.shadowRoot?.querySelector(".hourly-left");
    if (!container) return;
    if (container.scrollHeight <= container.clientHeight + 4) return;
    const SPEED = 22;
    const PAUSE = 2200;
    this._timelineScrollDir = 1;
    this._timelineScrollPauseUntil = Date.now() + PAUSE;
    const tick = (timestamp) => {
      this._timelineScrollRaf = requestAnimationFrame(tick);
      const el = this.shadowRoot?.querySelector(".hourly-left");
      if (!el) { this._stopTimelineScroll(); return; }
      const now = Date.now();
      if (now < this._timelineScrollPauseUntil) { this._timelineScrollLast = timestamp; return; }
      if (this._timelineScrollLast === null) { this._timelineScrollLast = timestamp; return; }
      const dt = (timestamp - this._timelineScrollLast) / 1000;
      this._timelineScrollLast = timestamp;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll <= 0) { this._stopTimelineScroll(); return; }
      el.scrollTop += this._timelineScrollDir * SPEED * dt;
      if (this._timelineScrollDir === 1 && el.scrollTop >= maxScroll - 1) {
        el.scrollTop = maxScroll;
        this._timelineScrollDir = -1;
        this._timelineScrollPauseUntil = now + PAUSE;
      } else if (this._timelineScrollDir === -1 && el.scrollTop <= 1) {
        el.scrollTop = 0;
        this._timelineScrollDir = 1;
        this._timelineScrollPauseUntil = now + PAUSE;
      }
    };
    container.addEventListener("mouseenter", () => { this._timelineScrollPauseUntil = Date.now() + 86400000; }, { passive: true });
    container.addEventListener("mouseleave", () => { this._timelineScrollPauseUntil = Date.now() + 800; }, { passive: true });
    this._timelineScrollRaf = requestAnimationFrame(tick);
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
      this._radarLabelText = this._config.radar_timeline === "future" ? `RainViewer ${this._t("futureRadar")}` : `RainViewer ${this._t("radarLoop")}`;
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
      if (label) label.textContent = this._t("rainviewerUnavailable");
    }
  }

  async _loadNoaaLoop() {
    const frames = this._noaaFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._radarLabelText = selectedFrames.length === 1 ? `NOAA ${this._t("currentRadar")}` : `NOAA ${this._t("radarLoop")}`;
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
    this._radarLabelText = selectedFrames.length === 1 ? `Environment Canada ${this._t("currentRadar")}` : `Environment Canada ${this._t("radarLoop")}`;
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
    button.title = this._radarPlaying ? this._t("pauseRadarLoop") : this._t("playRadarLoop");
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
    this._warningPopupMarker = null;
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const alert = this.shadowRoot?.getElementById("radar-alert");
    if (alert) {
      alert.hidden = true;
      alert.textContent = "";
      alert.onclick = null;
      alert.onkeydown = null;
    }
    const { lat, lon } = this._latLon();
    try {
      const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
        headers: {
          "User-Agent": `WeatherWise/${CARD_VERSION} (github.com/TheWillMiller/weather-wise)`,
          Accept: "application/geo+json"
        }
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
      const headline = features[0]?.properties?.headline || `${features.length} ${this._t("activeWeatherAlert")}${features.length === 1 ? "" : "s"}`;
      const popupHtml = this._alertPopup(features[0]?.properties || { headline });
      const marker = window.L.circleMarker([lat, lon], {
        radius: 9,
        color: "#b91c1c",
        fillColor: "#ef4444",
        fillOpacity: 0.85,
        interactive: true,
        bubblingMouseEvents: false,
        weight: 2
      }).bindPopup(popupHtml, { closeButton: true, autoPan: true }).addTo(group);
      window.L.circleMarker([lat, lon], {
        radius: 20,
        color: "#b91c1c",
        opacity: 0,
        fillColor: "#ef4444",
        fillOpacity: 0.01,
        interactive: true,
        bubblingMouseEvents: false,
        weight: 0
      }).bindPopup(popupHtml, { closeButton: true, autoPan: true }).addTo(group);
      this._warningPopupMarker = marker;
      this._warningLayer = group.addTo(this._radarMap);
      if (alert) {
        alert.hidden = false;
        alert.setAttribute("role", "button");
        alert.setAttribute("tabindex", "0");
        alert.textContent = `${features.length} ${this._t("nwsAlertTap")}${features.length === 1 ? "" : "s"}`;
        alert.title = headline;
        alert.onclick = (event) => {
          event.stopPropagation();
          this._warningPopupMarker?.openPopup?.();
        };
        alert.onkeydown = (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this._warningPopupMarker?.openPopup?.();
          }
        };
      }
    } catch (err) {
      if (label && this._config.debug?.enabled) label.textContent = `${label.textContent} + ${this._t("radarUnavailable")}`;
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
    const event = _wwEscape(props.event || this._t("weatherAlert"));
    const headline = _wwEscape(props.headline || "");
    const severity = _wwEscape(props.severity || this._t("unknown"));
    return `<strong>${event}</strong><br>${headline}<br>${_wwEscape(this._t("severity"))}: ${severity}`;
  }

  _unitContext(attrs) {
    const nativeTemp = this._normalizedTempUnit(attrs.temperature_unit || attrs.native_temperature_unit || this._hass?.config?.unit_system?.temperature || "°F");
    const target = this._config.units === "metric" ? "°C" : this._config.units === "imperial" ? "°F" : nativeTemp;
    return {
      sourceTemperatureUnit: nativeTemp,
      temperatureUnit: target,
      windSpeedUnit: attrs.wind_speed_unit || (target === "°C" ? "km/h" : "mph"),
      precipitationUnit: attrs.precipitation_unit || attrs.native_precipitation_unit || (target === "°C" ? "mm" : "in")
    };
  }

  _normalizedTempUnit(unit) {
    const value = String(unit || "").trim().toUpperCase();
    if (value === "C" || value === "°C") return "°C";
    if (value === "F" || value === "°F") return "°F";
    return unit;
  }

  _tempValue(value, units) {
    const sourceUnit = this._normalizedTempUnit(value && typeof value === "object" ? value.unit || units.sourceTemperatureUnit : units.sourceTemperatureUnit);
    const targetUnit = this._normalizedTempUnit(units.temperatureUnit);
    const rawValue = value && typeof value === "object" ? value.value : value;
    const number = this._numberOr(rawValue, NaN);
    if (!Number.isFinite(number)) return NaN;
    if (sourceUnit === targetUnit) return number;
    if (sourceUnit === "°F" && targetUnit === "°C") return (number - 32) * 5 / 9;
    if (sourceUnit === "°C" && targetUnit === "°F") return (number * 9 / 5) + 32;
    return number;
  }

  _currentTemperature(attrs) {
    const entityId = this._config.temperature_entity;
    const state = entityId ? this._hass?.states?.[entityId] : null;
    if (state && isWeatherWiseTemperatureEntity(entityId, state)) {
      return {
        value: state.state,
        unit: state.attributes?.unit_of_measurement || state.attributes?.native_unit_of_measurement || this._hass?.config?.unit_system?.temperature
      };
    }
    return attrs.temperature;
  }

  _displayTemp(value, units, includeUnit = true) {
    const number = this._tempValue(value, units);
    const rounded = Number.isFinite(number) ? String(Math.round(number)) : "--";
    return `${rounded}°${includeUnit ? units.temperatureUnit.replace("°", "") : ""}`;
  }

  _formatPrecip(item, units) {
    const probability = this._precipProbability(item);
    const amount = this._precipAmount(item);
    const parts = [];
    if (Number.isFinite(probability)) parts.push(`${Math.round(probability)}%`);
    if (Number.isFinite(amount.value)) parts.push(this._formatPrecipAmount(amount.value, amount.unit || units.precipitationUnit));
    return parts.length ? parts.join(" / ") : "";
  }

  _precipProbability(item) {
    const value = [
      item?.precipitation_probability,
      item?.precipitationProbability,
      item?.precip_probability,
      item?.probability_of_precipitation
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return Number.isFinite(value) ? value : NaN;
  }

  _precipAmount(item) {
    const value = [
      item?.precipitation,
      item?.native_precipitation,
      item?.precipitation_amount,
      item?.rain,
      item?.rainfall
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return {
      value: Number.isFinite(value) ? value : NaN,
      unit: item?.precipitation_unit || item?.native_precipitation_unit
    };
  }

  _formatPrecipAmount(value, unit) {
    const rounded = Math.abs(value) < 1 ? Math.round(value * 100) / 100 : Math.round(value * 10) / 10;
    return `${rounded}${unit || ""}`;
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

  _sectionOrder(key) {
    const order = this._config.panel_order;
    if (!Array.isArray(order)) return key === "clock" ? 1 : key === "weather" ? 2 : 3;
    const idx = order.indexOf(key);
    return idx === -1 ? 3 : idx + 1;
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
    return `${(date.getHours() % 12) || 12}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? this._t("pm") : this._t("am")}`;
  }

  _hour(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return `${(date.getHours() % 12) || 12} ${date.getHours() >= 12 ? this._t("pm") : this._t("am")}`;
  }

  _dayName(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    return new Intl.DateTimeFormat(this._localeCode(), { weekday: "short" }).format(date);
  }

  _longDate(date) {
    return new Intl.DateTimeFormat(this._localeCode(), {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
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
      .card-grid{display:grid;grid-template-columns:minmax(0,var(--ww-col1,1fr)) minmax(0,var(--ww-col2,2fr)) minmax(0,var(--ww-col3,1fr));height:var(--weatherwise-card-height,clamp(450px,24cqw,540px));min-height:0;max-height:var(--weatherwise-card-max-height,580px)}
      .card-grid.no-radar{grid-template-columns:minmax(260px,34%) minmax(0,1fr)}
      .left{min-width:0;display:flex;flex-direction:column;padding:18px 22px 10px;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08));border-right:1px solid rgba(255,255,255,0.22);overflow:hidden;order:var(--ww-left-order,1)}
      .center{order:var(--ww-center-order,2)}.right{order:var(--ww-right-order,3)}
      .clock-panel{flex-shrink:0}
      .clock-row{display:flex;align-items:baseline;gap:8px;line-height:1}
      .clock-time{font-size:78px;font-weight:550;color:var(--ww-text);letter-spacing:0}
      .clock-ampm{font-size:22px;font-weight:850;color:var(--ww-muted)}
      .clock-date{font-size:19px;color:var(--ww-muted);font-weight:850;margin-top:10px;margin-bottom:16px}
      .forecast-summary{container-type:inline-size;margin:0 0 14px;min-height:30px;max-width:100%;overflow:hidden;border:1px solid var(--ww-line);border-radius:999px;background:rgba(255,255,255,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.20);mask-image:linear-gradient(90deg,transparent 0,#000 18px,#000 calc(100% - 18px),transparent 100%)}
      .forecast-summary-text{display:inline-block;padding:7px 18px;font-size:13px;line-height:1.15;color:var(--ww-muted);font-weight:900;white-space:nowrap}
      :host([animations]) .forecast-summary-text{animation:ww-summary-drift 34s linear infinite}
      .forecast-summary:hover .forecast-summary-text{animation-play-state:paused}
      .section-title,.current-label{font-size:16px;letter-spacing:.08em;text-transform:uppercase;color:var(--ww-muted);font-weight:850;white-space:nowrap}
      .hourly-left{display:flex;flex:1;min-height:0;flex-direction:column;gap:8px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;padding-bottom:2px}
      .hourly-left::-webkit-scrollbar{display:none}
      .hour-row{display:grid;grid-template-columns:54px 26px 48px minmax(58px,1fr) minmax(42px,max-content);align-items:center;gap:9px;flex:1 1 calc(100% / var(--ww-hourly-count,5));min-height:34px;max-height:54px;padding:5px 10px;border-radius:10px;background:var(--ww-panel);border:1px solid var(--ww-line)}
      .hour-time-left{font-size:15px;color:var(--ww-muted);font-weight:850;text-transform:uppercase}
      .hour-icon-left{width:25px;height:25px;display:flex;align-items:center;justify-content:center}
      .hour-temp-left{font-size:16px;font-weight:900;color:var(--ww-text);text-align:right}
      .hour-bar-wrap{height:8px;border-radius:999px;background:rgba(18,59,83,0.10);position:relative;overflow:hidden}
      .hour-bar-fill{position:absolute;top:0;left:0;height:100%;border-radius:999px;background:linear-gradient(90deg,#58b7c7,var(--ww-wave))}
      .hour-precip{font-size:12px;font-weight:900;color:var(--ww-muted);white-space:nowrap;text-align:right;min-width:0}
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
      .fc-precip{font-size:12px;font-weight:900;color:var(--ww-muted);line-height:1;min-height:13px;text-align:center;white-space:nowrap}
      .stats-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:6px;flex-shrink:0}
      .stat{background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:11px;min-height:66px;min-width:0}
      .stat>div:last-child{min-width:0}
      .stat-ico{width:27px;height:27px;flex:0 0 27px;color:var(--ww-wave)}
      .stat-ico svg{width:27px;height:27px}
      .stat-lbl{font-size:12px;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
      .stat-val{font-size:19px;font-weight:900;color:var(--ww-text);white-space:normal;overflow-wrap:anywhere;line-height:1.08}
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
      @keyframes ww-summary-drift{0%,8%{transform:translateX(0)}92%,100%{transform:translateX(min(0px, calc(100cqw - 100% - 38px)))}}
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
      .radar-alert{position:absolute;top:10px;left:54px;right:126px;max-width:max-content;font-size:12px;color:#7f1d1d;background:rgba(254,242,242,.9);border:1px solid rgba(185,28,28,.28);box-shadow:0 2px 10px rgba(127,29,29,.12);padding:5px 10px;border-radius:99px;font-weight:900;z-index:1000;pointer-events:auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
      .radar-alert:focus-visible{outline:2px solid #b91c1c;outline-offset:2px}
      .radar-alert[hidden]{display:none}
      .radar-controls{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:1001}
      .radar-controls button{width:31px;height:31px;border:1px solid rgba(255,255,255,.62);border-radius:999px;background:rgba(255,255,255,.78);color:#0a1e2e;box-shadow:0 2px 10px rgba(10,30,46,.12);font:800 15px/1 var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);display:grid;place-items:center;cursor:pointer;padding:0}
      .radar-controls button:hover{background:rgba(255,255,255,.94)}
      .leaflet-control-zoom{border:0!important;box-shadow:0 2px 12px rgba(10,30,46,.13)!important}
      .leaflet-control-zoom a{width:34px!important;height:34px!important;line-height:31px!important;color:#0a1e2e!important;background:rgba(255,255,255,.82)!important;border-color:rgba(10,30,46,.10)!important;font-weight:650!important}
      .leaflet-control-attribution{background:rgba(255,255,255,.70)!important;color:rgba(10,30,46,.72)!important}
      .leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}
      .leaflet-popup-content-wrapper{background:rgba(255,255,255,.96);color:#0a1e2e;border-radius:12px;box-shadow:0 4px 18px rgba(10,30,46,.22);border:1px solid rgba(10,30,46,.12);padding:1px;text-align:left}
      .leaflet-popup-content{font-size:13px;line-height:1.35;margin:12px 14px;min-width:180px;max-width:260px}
      .leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}
      .leaflet-popup-tip{width:14px;height:14px;padding:1px;margin:-8px auto 0;background:rgba(255,255,255,.96);transform:rotate(45deg);box-shadow:0 4px 14px rgba(10,30,46,.18)}
      .leaflet-popup-close-button{position:absolute;top:4px;right:8px;border:0;background:transparent;color:#0a1e2e;text-decoration:none;font-size:18px;font-weight:900;line-height:1;cursor:pointer}
      .loading-note{font-size:12px;color:var(--ww-muted);font-weight:800;opacity:.8;padding:10px}
      .daily-strip>.loading-note{grid-column:1 / -1;align-self:center}
      .debug-panel{margin-top:10px;background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:8px;font-size:12px;color:var(--ww-muted)}
      .debug-row{display:flex;justify-content:space-between;gap:12px;padding:3px 0}
      .debug-row code{color:var(--ww-text)}
      .card-grid.no-forecast .daily-strip{display:none}.card-grid.no-forecast .center{justify-content:center}
      @container(max-width:1500px){.card-grid{height:var(--weatherwise-card-height,clamp(440px,25cqw,520px))}.left{padding:14px 18px 10px}.center{padding:16px 20px}.clock-time{font-size:70px}.clock-date{font-size:18px;margin-bottom:11px}.forecast-summary{margin-bottom:11px}.forecast-summary-text{font-size:12px}.section-title,.current-label{font-size:15px}.temp-now{font-size:58px}.temp-hilo{font-size:18px}.cond-name{font-size:32px}.updated-note{font-size:13px}.daily-strip{min-height:172px;max-height:212px}.fc-day{font-size:20px}.fc-period{font-size:13px}.fc-icon{width:58px;height:58px}.fc-icon svg{width:54px;height:54px}.fc-temp{font-size:43px}.hour-row{grid-template-columns:50px 24px 42px minmax(52px,1fr) minmax(38px,max-content);gap:7px;min-height:32px}.hour-time-left{font-size:14px}.hour-temp-left{font-size:15px}.hour-precip{font-size:11px}.stat{padding:9px 11px;gap:9px;min-height:62px}.stat-lbl{font-size:11px}.stat-val{font-size:17px}}
      @container(max-width:980px){.card-grid:not(.layout-wide_panel){height:var(--weatherwise-card-height,clamp(560px,58cqw,680px))}.card-grid:not(.layout-wide_panel) .center{border-right:0}.card-grid:not(.layout-wide_panel) .right{grid-column:1 / -1;height:240px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid:not(.layout-wide_panel) #rmap{height:240px}.card-grid:not(.layout-wide_panel) .daily-strip{min-height:150px;max-height:none}}
      .card-grid.layout-wide_panel{height:var(--weatherwise-card-height,clamp(390px,22cqw,500px))}
      .card-grid.layout-stacked,.card-grid.layout-compact{display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.layout-stacked .left,.card-grid.layout-compact .left{display:contents}.card-grid.layout-stacked .clock-panel,.card-grid.layout-compact .clock-panel{order:1;padding:18px 22px 0;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}.card-grid.layout-stacked .center,.card-grid.layout-compact .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.layout-stacked .left>.section-title,.card-grid.layout-compact .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 22px;margin-top:4px}.card-grid.layout-stacked .hourly-left,.card-grid.layout-compact .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 22px 16px}.card-grid.layout-stacked .right,.card-grid.layout-compact .right{order:var(--ww-ord-radar,30);border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.layout-stacked .right,.card-grid.layout-stacked #rmap{height:300px;min-height:300px}.card-grid.layout-compact .right,.card-grid.layout-compact #rmap{height:220px;min-height:220px}.card-grid.layout-compact .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));min-height:150px}.card-grid.layout-compact .fc-slot:nth-child(n+4){display:none}
      @container(max-width:720px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}.card-grid.layout-wide_panel{display:grid;grid-template-columns:minmax(120px,24%) minmax(230px,1fr) minmax(150px,28%);height:360px;max-height:360px}.card-grid.layout-wide_panel .left{display:flex;padding:12px 10px}.card-grid.layout-wide_panel .center{padding:12px 10px}.card-grid.layout-wide_panel .clock-time{font-size:38px}.card-grid.layout-wide_panel .clock-date{font-size:12px;margin:5px 0 7px}.card-grid.layout-wide_panel .forecast-summary{min-height:26px;margin-bottom:8px}.card-grid.layout-wide_panel .forecast-summary-text{font-size:11px;padding:6px 14px}.card-grid.layout-wide_panel .current-icon{width:44px;height:44px}.card-grid.layout-wide_panel .cond-name{font-size:21px}.card-grid.layout-wide_panel .temp-now{font-size:38px}.card-grid.layout-wide_panel .daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(70px,1fr));gap:6px;overflow:hidden}.card-grid.layout-wide_panel .fc-temp{font-size:28px}.card-grid.layout-wide_panel .stats-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.card-grid.layout-wide_panel .right,.card-grid.layout-wide_panel #rmap{height:100%;min-height:0}}
      @media(max-width:760px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}}
      @media(prefers-reduced-motion:reduce){:host([animations]) .ww-sun-rays,:host([animations]) .ww-sun-core,:host([animations]) .ww-cloud,:host([animations]) .ww-rain,:host([animations]) .ww-snow,:host([animations]) .ww-bolt,:host([animations]) .ww-moon,:host([animations]) .ww-moon-glow,:host([animations]) .ww-fog,:host([animations]) .hour-row,:host([animations]) .fc-slot,:host([animations]) .forecast-summary-text{animation:none!important}:host([animations]) .hour-bar-fill{transition:none!important}}

      .card-grid.layout-radar_bottom{display:grid;grid-template-columns:minmax(310px,28%) minmax(0,1fr);grid-template-rows:clamp(420px,28cqw,540px) 340px;height:auto;max-height:none}
      .card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1;overflow:hidden}
      .card-grid.layout-radar_bottom .center{grid-column:2;grid-row:1;border-right:0;overflow:hidden}
      .card-grid.layout-radar_bottom .right{grid-column:1/-1;grid-row:2;height:340px;min-height:340px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px;position:relative;z-index:0}
      .card-grid.layout-radar_bottom #rmap{height:340px;min-height:340px}
      .card-grid.ww-force-stack:not(.layout-wide_panel),.card-grid.ww-force-stack.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .left{display:contents}.card-grid.ww-force-stack:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid.ww-force-stack:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.ww-force-stack:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid.ww-force-stack:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid.ww-force-stack:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30);height:300px;min-height:300px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.ww-force-stack:not(.layout-wide_panel) #rmap{height:300px;min-height:300px}.card-grid.ww-force-stack:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .stats-row{grid-template-columns:repeat(2,minmax(0,1fr))}
      @container(max-width:720px){.card-grid.layout-radar_bottom{grid-template-columns:1fr;grid-template-rows:auto auto 300px}.card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1}.card-grid.layout-radar_bottom .center{grid-column:1;grid-row:2;border-right:0}.card-grid.layout-radar_bottom .right{grid-column:1;grid-row:3;height:300px;min-height:300px}.card-grid.layout-radar_bottom #rmap{height:300px;min-height:300px}}
      @container(max-width:600px){.clock-time{font-size:58px}.clock-ampm{font-size:17px}.temp-now{font-size:46px}.temp-hilo{font-size:17px;margin-top:5px}.cond-name{font-size:26px}.current-icon{width:54px;height:54px}.current-row{gap:10px;flex-wrap:wrap}.temp-block{min-width:unset}.center{padding:14px 18px}.updated-note{font-size:12px;margin-top:4px}}
      @container(max-width:420px){.clock-time{font-size:48px}.temp-now{font-size:38px}.cond-name{font-size:22px}.current-icon{width:46px;height:46px}}
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
    this._config = {
      ...WeatherWiseCard.getStubConfig(),
      ...(config || {}),
      language: config?.language || config?.forecast_summary_language || "auto"
    };
    this._render();
  }

  _weatherEntities() {
    return Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("weather."))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  _sensorEntities(predicate) {
    return Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("sensor.") || entityId.startsWith("input_number."))
      .filter(([entityId, state]) => predicate(entityId, state))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  _humidityEntities() {
    return this._sensorEntities(isWeatherWiseHumidityEntity);
  }

  _temperatureEntities() {
    return this._sensorEntities(isWeatherWiseTemperatureEntity);
  }

  _editorEntitySignature() {
    const states = this._hass?.states || {};
    return Object.entries(states)
      .filter(([entityId, state]) => entityId.startsWith("weather.") || isWeatherWiseHumidityEntity(entityId, state) || isWeatherWiseTemperatureEntity(entityId, state))
      .map(([entityId, state]) => `${entityId}:${state.attributes?.friendly_name || ""}:${state.attributes?.device_class || ""}`)
      .sort()
      .join("|");
  }

  _setValue(key, value) {
    const numberKeys = ["latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"];
    const booleanKeys = ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "timeline_autoscroll"];
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
    const humiditySensors = this._humidityEntities();
    const temperatureSensors = this._temperatureEntities();
    const hasConfiguredEntity = entities.some(([entityId]) => entityId === config.entity);
    const hasConfiguredHumidityEntity = humiditySensors.some(([entityId]) => entityId === config.humidity_entity);
    const hasConfiguredTemperatureEntity = temperatureSensors.some(([entityId]) => entityId === config.temperature_entity);
    const configuredOption = config.entity && !hasConfiguredEntity
      ? `<option value="${_wwEscape(config.entity)}" selected>${_wwEscape(config.entity)}</option>`
      : "";
    const configuredHumidityOption = config.humidity_entity && !hasConfiguredHumidityEntity && isWeatherWiseHumidityEntity(config.humidity_entity, this._hass?.states?.[config.humidity_entity])
      ? `<option value="${_wwEscape(config.humidity_entity)}" selected>${_wwEscape(config.humidity_entity)}</option>`
      : "";
    const configuredTemperatureOption = config.temperature_entity && !hasConfiguredTemperatureEntity && isWeatherWiseTemperatureEntity(config.temperature_entity, this._hass?.states?.[config.temperature_entity])
      ? `<option value="${_wwEscape(config.temperature_entity)}" selected>${_wwEscape(config.temperature_entity)}</option>`
      : "";
    const weatherOptions = entities.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${config.entity === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
    const temperatureOptions = temperatureSensors.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${config.temperature_entity === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
    const humidityOptions = humiditySensors.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${config.humidity_entity === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
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
        .layout-label{font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75);margin:12px 0 8px}
        .layout-picker{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}
        .layout-tile{display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 6px;border:2px solid var(--divider-color,rgba(0,0,0,.15));border-radius:10px;cursor:pointer;background:var(--card-background-color,#fff);transition:border-color .15s,background .15s;user-select:none}
        .layout-tile:hover{border-color:var(--primary-color,#2a7a94);background:color-mix(in srgb,var(--primary-color,#2a7a94) 6%,var(--card-background-color,#fff))}
        .layout-tile.selected{border-color:var(--primary-color,#2a7a94);background:color-mix(in srgb,var(--primary-color,#2a7a94) 10%,var(--card-background-color,#fff))}
        .layout-tile svg{display:block}
        .layout-tile-name{font-size:12px;font-weight:800;color:var(--primary-text-color,#0a1e28);text-align:center;line-height:1.2}
        .layout-tile-desc{font-size:10px;font-weight:600;color:var(--secondary-text-color,#536b75);text-align:center;line-height:1.2}
        @media(max-width:480px){.layout-picker{grid-template-columns:repeat(2,1fr)}}
        .panel-order-label{font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75);margin:12px 0 6px}
        .panel-order-list{display:flex;flex-direction:column;gap:6px}
        .panel-order-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:10px;background:var(--card-background-color,#fff);cursor:grab;user-select:none;transition:box-shadow .15s,opacity .15s}
        .panel-order-item:active{cursor:grabbing}
        .panel-order-item *{pointer-events:none}
        .panel-order-item.drag-over{box-shadow:0 0 0 2px var(--primary-color,#2a7a94);border-color:var(--primary-color,#2a7a94)}
        .panel-order-item.dragging{opacity:.4}
        .drag-handle{font-size:18px;color:var(--secondary-text-color,#536b75);line-height:1;flex-shrink:0}
        .panel-order-icon{width:32px;height:32px;flex-shrink:0;display:grid;place-items:center}
        .panel-order-name{font-size:13px;font-weight:800;color:var(--primary-text-color,#0a1e28)}
        .panel-order-desc{font-size:11px;color:var(--secondary-text-color,#536b75)}
        .col-widths{display:flex;flex-direction:column;gap:8px;margin-top:12px}
        .col-width-row{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px;font-size:13px;font-weight:700;color:var(--secondary-text-color,#536b75)}
        .col-width-row input[type=range]{width:100%;accent-color:var(--primary-color,#2a7a94)}
        .col-width-val{font-size:13px;font-weight:800;color:var(--primary-text-color,#0a1e28);min-width:28px;text-align:right}
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
          <label>Current temperature entity
            <select id="temperature_entity">
              <option value="">Auto from weather entity</option>
              ${configuredTemperatureOption}
              ${temperatureOptions}
            </select>
          </label>
          <label>Humidity entity
            <select id="humidity_entity">
              <option value="">Auto from weather entity</option>
              ${configuredHumidityOption}
              ${humidityOptions}
            </select>
          </label>
          <div class="hint">WeatherWise reads an existing Home Assistant weather entity and calls Home Assistant's forecast service. Use local temperature or humidity sensors when your weather entity differs from the spot you care about.</div>
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
            <label>Title <input id="title" value="${_wwEscape(config.title || "")}" placeholder="Local Weather"></label>
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
                <option value="auto" ${config.theme_mode === "auto" ? "selected" : ""}>Match Home Assistant theme</option>
              </select>
            </label>
            <label>Language
              <select id="language">
                ${Object.entries(WEATHERWISE_LANGUAGES).map(([value, label]) => `<option value="${value}" ${(config.language || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Forecast list rows <input id="hourly_count" type="number" min="1" max="24" value="${_wwEscape(config.hourly_count || 5)}"></label>
            <label>Forecast cards <input id="forecast_count" type="number" min="1" max="7" value="${_wwEscape(config.forecast_count || 5)}"></label>
          </div>
          <div class="layout-label">Card layout</div>
          <div class="layout-picker">
            <button type="button" class="layout-tile${(config.layout || "auto") === "auto" ? " selected" : ""}" data-layout="auto" title="Automatically adapts to screen size">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="18" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="10" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".35"/>
                <rect x="6" y="17" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="6" y="23" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="27" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="31" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="24" y="4" width="26" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="33" cy="14" r="6" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="27" y="23" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="27" y="28" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="27" y="33" width="22" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="52" y="4" width="16" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M52 26 Q56 20 60 24 Q64 18 68 22" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Auto</span>
              <span class="layout-tile-desc">Adapts to screen</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "wide_panel" ? " selected" : ""}" data-layout="wide_panel" title="Optimised for wide screens — columns stay side-by-side">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="14" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="8" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".35"/>
                <rect x="6" y="17" width="9" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="6" y="21" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="25" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="29" width="10" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="20" y="4" width="30" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="30" cy="13" r="5" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="23" y="22" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="23" y="27" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="23" y="32" width="24" height="2.5" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="52" y="4" width="16" height="42" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M52 26 Q56 20 60 24 Q64 18 68 22" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Wide panel</span>
              <span class="layout-tile-desc">Always side-by-side</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "stacked" ? " selected" : ""}" data-layout="stacked" title="Sections stack vertically — good for narrow dashboards">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="64" height="13" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="7" width="16" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="28" y="8" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".3"/>
                <rect x="28" y="12" width="20" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="4" y="19" width="64" height="13" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="8" y="22" width="56" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="8" y="26" width="48" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="30" width="52" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="4" y="34" width="64" height="12" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M8 42 Q18 36 28 40 Q38 34 48 38 Q55 34 64 37" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Stacked</span>
              <span class="layout-tile-desc">Sections top to bottom</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "radar_bottom" ? " selected" : ""}" data-layout="radar_bottom" title="Hourly and current weather side-by-side on top, full-width radar below">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="18" height="22" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="6" y="7" width="10" height="4" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="6" y="13" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".3"/>
                <rect x="6" y="17" width="12" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="6" y="21" width="14" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".15"/>
                <rect x="24" y="4" width="44" height="22" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <circle cx="34" cy="13" r="5" fill="var(--primary-color,#2a7a94)" opacity=".4"/>
                <rect x="27" y="21" width="38" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".2"/>
                <rect x="4" y="28" width="64" height="18" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M6 40 Q14 33 22 37 Q30 31 38 35 Q46 30 54 34 Q60 31 66 33" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".55"/>
              </svg>
              <span class="layout-tile-name">Radar bottom</span>
              <span class="layout-tile-desc">Wide radar below</span>
            </button>
            <button type="button" class="layout-tile${(config.layout || "auto") === "compact" ? " selected" : ""}" data-layout="compact" title="Shorter stacked layout — good for sidebar or mobile">
              <svg width="72" height="50" viewBox="0 0 72 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/>
                <rect x="4" y="4" width="64" height="10" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="8" y="6" width="14" height="3" rx="1.5" fill="var(--primary-color,#2a7a94)" opacity=".7"/>
                <rect x="26" y="7" width="20" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="4" y="16" width="64" height="9" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="8" y="18" width="56" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".25"/>
                <rect x="8" y="22" width="40" height="1.5" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".18"/>
                <rect x="4" y="27" width="64" height="9" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".08"/>
                <rect x="8" y="29" width="22" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".15"/>
                <rect x="32" y="29" width="14" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".12"/>
                <rect x="48" y="29" width="14" height="5" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".1"/>
                <rect x="4" y="38" width="64" height="8" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/>
                <path d="M8 44 Q18 40 28 42 Q38 38 48 41 Q55 38 64 40" stroke="var(--primary-color,#2a7a94)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".5"/>
              </svg>
              <span class="layout-tile-name">Compact</span>
              <span class="layout-tile-desc">Condensed, less tall</span>
            </button>
          </div>
          <div class="hint" style="margin-top:10px">Auto is recommended for most dashboards — it switches between wide and stacked depending on how much space the card has.</div>
          <div class="panel-order-label">Panel order — drag to rearrange</div>
          <div class="panel-order-list" id="panel-order-list">
            ${(config.panel_order || ["clock","weather","radar"]).map((key) => {
              const meta = {
                clock:   { name: "Clock & Timeline",    desc: "Time, date, forecast summary, hourly list", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
                weather: { name: "Current Weather",     desc: "Condition, temperature, forecast cards, stats", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="10" r="4" fill="#fbbf24"/><path d="M5 17a5 5 0 0 1 14 0" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/></svg>` },
                radar:   { name: "Radar Map",           desc: "Live radar, warnings, playback controls", icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 12 L18 6" stroke="#2a7a94" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="2" fill="#2a7a94"/></svg>` }
              }[key] || { name: key, desc: "", icon: "" };
              return `<div class="panel-order-item" draggable="true" data-panel="${_wwEscape(key)}">
                <span class="drag-handle" aria-hidden="true">⠿</span>
                <span class="panel-order-icon" style="color:var(--primary-color,#2a7a94)">${meta.icon}</span>
                <div><div class="panel-order-name">${_wwEscape(meta.name)}</div><div class="panel-order-desc">${_wwEscape(meta.desc)}</div></div>
              </div>`;
            }).join("")}
          </div>
          <div class="col-widths">
            ${(config.panel_order || ["clock","weather","radar"]).map((key, i) => {
              const names = { clock: "Clock & Timeline", weather: "Current Weather", radar: "Radar Map" };
              const w = (config.column_widths || [25,50,25])[i] || 25;
              return `<div class="col-width-row">
                <span class="col-width-name">${_wwEscape(names[key] || key)}</span>
                <div style="display:flex;align-items:center;gap:4px">
                  <button type="button" class="col-width-step" data-idx="${i}" data-dir="-1" style="width:28px;height:28px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:16px;cursor:pointer;line-height:1;padding:0">−</button>
                  <span id="col_width_val_${i}" style="min-width:42px;text-align:center;font-size:15px;font-weight:700;color:var(--primary-text-color,#0a1e28)">${w}%</span>
                  <button type="button" class="col-width-step" data-idx="${i}" data-dir="1" style="width:28px;height:28px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--primary-text-color);font-size:16px;cursor:pointer;line-height:1;padding:0">+</button>
                </div>
              </div>`;
            }).join("")}
            ${(() => { const tot = (config.column_widths || [25,50,25]).reduce((a,b)=>a+b,0); const ok = tot === 100; return `<div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:12px;font-weight:${ok?"normal":"700"};color:${ok?"var(--secondary-text-color,#536b75)":"var(--error-color,#c0392b)"}">Total: ${tot}%${ok?"":" — must equal 100%"}</span><button type="button" id="col_width_reset" style="font-size:12px;padding:4px 10px;border:1px solid var(--divider-color,rgba(0,0,0,.15));border-radius:6px;background:var(--card-background-color,#fff);color:var(--secondary-text-color,#536b75);cursor:pointer">Reset widths</button></div>`; })()}
          </div>
          <div style="margin-top:14px">
            <div class="col-width-label" style="margin-bottom:2px">Collapse to vertical layout when too narrow</div>
            <div class="hint" style="margin-bottom:6px">If the card looks cramped or squished, set this to the card's approximate pixel width. The card will automatically stack vertically when it's smaller than that size. Leave at Off if the card looks fine.</div>
            <div class="col-width-row">
              <input type="range" id="stack_below" min="0" max="1200" step="50" value="${config.stack_below || 0}" style="flex:1">
              <span class="col-width-val" id="stack_below_val">${config.stack_below ? config.stack_below + "px" : "Off"}</span>
            </div>
          </div>
          <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
            <label class="check"><input id="show_forecast_summary" type="checkbox" ${config.show_forecast_summary === false ? "" : "checked"}> Show forecast summary ticker</label>
            <label class="check"><input id="show_timeline" type="checkbox" ${config.show_timeline === false ? "" : "checked"}> Show hourly / forecast list</label>
            <label class="check"><input id="show_forecast" type="checkbox" ${config.show_forecast === false ? "" : "checked"}> Show daily forecast cards</label>
            <label class="check"><input id="timeline_autoscroll" type="checkbox" ${config.timeline_autoscroll ? "checked" : ""}> Auto-scroll the forecast list</label>
            <label class="check"><input id="show_animations" type="checkbox" ${config.show_animations === false ? "" : "checked"}> Subtle weather animations</label>
          </div>
          <div class="hint">Animations automatically pause when the browser or device requests reduced motion.</div>
        </div>
        <div class="section">
          <div class="section-title">Radar location</div>
          <div class="grid">
            <label>Latitude <input id="latitude" type="number" step="0.0001" value="${_wwEscape(config.latitude ?? "")}"></label>
            <label>Longitude <input id="longitude" type="number" step="0.0001" value="${_wwEscape(config.longitude ?? "")}"></label>
            <label>Radar zoom <input id="radar_zoom" type="number" min="3" max="12" value="${_wwEscape(config.radar_zoom || 7)}"></label>
            <label>Loop speed <input id="radar_speed" type="number" min="300" max="3000" step="100" value="${_wwEscape(config.radar_speed || 700)}"></label>
          </div>
          <label class="check"><input id="show_radar" type="checkbox" ${config.show_radar === false ? "" : "checked"}> Show radar panel</label>
          <label class="check"><input id="show_map_controls" type="checkbox" ${config.show_map_controls === false ? "" : "checked"}> Show map controls</label>
          <label class="check"><input id="radar_controls" type="checkbox" ${config.radar_controls === false ? "" : "checked"}> Show radar playback controls</label>
          <label class="check"><input id="show_warning_overlay" type="checkbox" ${config.show_warning_overlay === false ? "" : "checked"}> Show US warning overlay</label>
          <div class="hint">Latitude and longitude control only the radar center. They do not change the selected weather entity.</div>
        </div>
      </div>
    `;
    ["entity", "temperature_entity", "humidity_entity", "country", "radar_provider", "radar_style", "radar_basemap", "radar_timeline", "title", "units", "theme_mode", "language", "latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.value));
    });
    ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "timeline_autoscroll"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.checked));
    });
    this.shadowRoot.querySelectorAll(".layout-tile").forEach((tile) => {
      tile.addEventListener("click", () => this._setValue("layout", tile.dataset.layout));
    });
    // Column width +/− buttons
    this.shadowRoot.querySelectorAll(".col-width-step").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.idx);
        const dir = Number(btn.dataset.dir);
        const widths = (this._config.column_widths || [25, 50, 25]).slice();
        widths[i] = Math.max(20, Math.min(60, (widths[i] || 25) + dir * 5));
        this._setValue("column_widths", widths);
      });
    });
    // Reset column widths
    this.shadowRoot.getElementById("col_width_reset")?.addEventListener("click", () => {
      this._setValue("column_widths", [25, 50, 25]);
    });
    // Stack below slider
    const stackSlider = this.shadowRoot.getElementById("stack_below");
    const stackVal = this.shadowRoot.getElementById("stack_below_val");
    if (stackSlider && stackVal) {
      stackSlider.addEventListener("change", () => {
        const v = Number(stackSlider.value);
        stackVal.textContent = v === 0 ? "Off" : `${v}px`;
        this._setValue("stack_below", v);
      });
      stackSlider.addEventListener("input", () => {
        const v = Number(stackSlider.value);
        stackVal.textContent = v === 0 ? "Off" : `${v}px`;
      });
    }
    // Drag-to-reorder panel order
    let dragKey = null;
    const allItems = () => this.shadowRoot.querySelectorAll(".panel-order-item");
    const clearOver = () => allItems().forEach((el) => el.classList.remove("drag-over"));
    this.shadowRoot.querySelectorAll(".panel-order-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        dragKey = item.dataset.panel;
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      item.addEventListener("dragend", () => {
        dragKey = null;
        allItems().forEach((el) => el.classList.remove("dragging", "drag-over"));
      });
      item.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (item.dataset.panel === dragKey) return;
        clearOver();
        item.classList.add("drag-over");
      });
      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      item.addEventListener("drop", (e) => {
        e.preventDefault();
        clearOver();
        if (!dragKey || item.dataset.panel === dragKey) return;
        const current = (this._config.panel_order || ["clock", "weather", "radar"]).slice();
        const fromIdx = current.indexOf(dragKey);
        const toIdx = current.indexOf(item.dataset.panel);
        if (fromIdx === -1 || toIdx === -1) return;
        current.splice(fromIdx, 1);
        current.splice(toIdx, 0, dragKey);
        this._setValue("panel_order", current);
      });
    });
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
