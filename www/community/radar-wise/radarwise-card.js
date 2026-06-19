/*
 * RadarWise Card
 * Home Assistant weather dashboard card with forecasts and optional radar.
 */

const CARD_VERSION = "0.8.7";
const FORECAST_REFRESH_MS = 15 * 60 * 1000;
const ENVIRONMENT_REFRESH_MS = 60 * 60 * 1000;
const CARD_TYPES = ["radarwise-card", "radar-wise-card", "weatherwise-card", "weather-wise-card"];

const RADARWISE_COUNTRIES = {
  us: "United States",
  ca: "Canada",
  uk: "United Kingdom",
  au: "Australia",
  global: "Global / other"
};

const RADARWISE_RADAR = {
  auto: "Auto",
  noaa: "US NOAA radar",
  envcanada: "Environment Canada radar",
  bom: "Australia BOM radar",
  rainviewer: "RainViewer global radar",
  none: "No radar"
};

const RADARWISE_RADAR_STYLES = {
  standard: "Standard",
  vivid: "High contrast",
  soft: "Soft"
};

const RADARWISE_BASEMAPS = {
  light: "Light map",
  dark: "Dark map",
  osm: "Street map"
};

const RADARWISE_RADAR_TIMELINES = {
  loop: "Recent loop",
  latest: "Current frame",
  future: "Future if available"
};

const RADARWISE_ENVIRONMENT_SOURCES = {
  sensors: "Home Assistant sensors",
  open_meteo: "Open-Meteo, no API key",
  disabled: "Disabled"
};

const RADARWISE_LAYOUTS = {
  auto: "Auto",
  wide_panel: "Wide panel",
  stacked: "Stacked",
  compact: "Compact",
  radar_bottom: "Radar bottom"
};

const RADARWISE_CONTENT_MODES = {
  full: "Full dashboard",
  essentials: "Essentials",
  forecast: "Forecast only",
  timeline: "Hourly only",
  radar: "Radar only",
  custom: "Custom"
};

const RADARWISE_DENSITIES = {
  comfortable: "Comfortable",
  slim: "Slim",
  large: "Large"
};

const RADARWISE_TIME_FORMATS = {
  auto: "Auto",
  "12": "12-hour",
  "24": "24-hour"
};

const RADARWISE_FONT_FAMILIES = {
  auto: "Home Assistant",
  system: "System",
  rounded: "Rounded",
  condensed: "Condensed",
  mono: "Monospace"
};

const RADARWISE_FONT_STACKS = {
  auto: 'var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif)',
  system: '-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",Roboto,Arial,sans-serif',
  rounded: '"SF Pro Rounded","Arial Rounded MT Bold","Segoe UI",Roboto,Arial,sans-serif',
  condensed: '"Aptos Narrow","Arial Narrow","Roboto Condensed","Segoe UI",Roboto,Arial,sans-serif',
  mono: '"SFMono-Regular","Cascadia Mono",Consolas,"Liberation Mono",monospace'
};

const BOM_WMTS_BASE = "https://api.bom.gov.au/apikey/v1/mapping/timeseries/wmts";
const BOM_GIF_HOST = "https://reg.bom.gov.au";
const BOM_WMTS_LAYER = {
  id: "atm_surf_air_precip_reflectivity_dbz",
  matrixSet: "GoogleMapsCompatible_BoM",
  stepMinutes: 5,
  lagMinutes: 10
};
const BOM_BASEMAPS = {
  default: "https://api.bom.gov.au/apikey/v1/mapping/basemaps/basemap_default/MapServer/tile/{z}/{y}/{x}?blankTile=false",
  dark: "https://api.bom.gov.au/apikey/v1/mapping/basemaps/basemap_dark/MapServer/tile/{z}/{y}/{x}?blankTile=false"
};
const BOM_HALF_EXTENT = 20037508.342789244;
const BOM_WORLD_EXTENT = BOM_HALF_EXTENT * 2;
const BOM_MAX_NATIVE_ZOOM = 8;
const BOM_MAX_DISPLAY_ZOOM = 10;
const BOM_AUSTRALIA_BOUNDS = [[-45.5, 108], [-8, 158]];
const BOM_TILE_MATRIX_SETS = {
  GoogleMapsCompatible_BoM: [
    { z: 0, tlx: 11584952, tly: 34168990.685578, w: 1, h: 1 },
    { z: 1, tlx: 11584952, tly: 14131482.342789, w: 1, h: 1 },
    { z: 2, tlx: 11584952, tly: 4112728.171395, w: 1, h: 1 },
    { z: 3, tlx: 11584952, tly: 4112728.171395, w: 2, h: 2 },
    { z: 4, tlx: 11584952, tly: 1608039.628546, w: 3, h: 3 },
    { z: 5, tlx: 11584952, tly: 355695.357122, w: 6, h: 5 },
    { z: 6, tlx: 11584952, tly: -270476.778591, w: 11, h: 9 },
    { z: 7, tlx: 11584952, tly: -583562.846447, w: 22, h: 17 },
    { z: 8, tlx: 11584952, tly: -740105.880375, w: 43, h: 33 }
  ]
};
const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const BOM_RADARS = [
  { id: "IDR643", name: "Adelaide (Buckland Park)", lat: -34.617, lon: 138.469 },
  { id: "IDR463", name: "Adelaide (Sellicks Hill)", lat: -35.33, lon: 138.50 },
  { id: "IDR333", name: "Ceduna", lat: -32.13, lon: 133.70 },
  { id: "IDR143", name: "Mount Gambier", lat: -37.75, lon: 140.77 },
  { id: "IDR273", name: "Woomera", lat: -31.16, lon: 136.80 },
  { id: "IDR713", name: "Sydney (Terrey Hills)", lat: -33.701, lon: 151.210 },
  { id: "IDR043", name: "Newcastle", lat: -32.730, lon: 152.027 },
  { id: "IDR033", name: "Wollongong (Appin)", lat: -34.264, lon: 150.874 },
  { id: "IDR403", name: "Canberra (Captains Flat)", lat: -35.66, lon: 149.51 },
  { id: "IDR283", name: "Grafton", lat: -29.62, lon: 152.97 },
  { id: "IDR533", name: "Moree", lat: -29.50, lon: 149.85 },
  { id: "IDR693", name: "Namoi (Blackjack Mountain)", lat: -31.024, lon: 150.1915 },
  { id: "IDR553", name: "Wagga Wagga", lat: -35.17, lon: 147.47 },
  { id: "IDR943", name: "Hillston", lat: -33.55, lon: 145.52 },
  { id: "IDR963", name: "Yeoval", lat: -32.74, lon: 148.70 },
  { id: "IDR933", name: "Brewarrina", lat: -29.96, lon: 146.81 },
  { id: "IDR023", name: "Melbourne", lat: -37.852, lon: 144.752 },
  { id: "IDR973", name: "Mildura", lat: -34.28, lon: 141.59 },
  { id: "IDR683", name: "Bairnsdale", lat: -37.89, lon: 147.56 },
  { id: "IDR953", name: "Rainbow", lat: -35.99, lon: 142.01 },
  { id: "IDR493", name: "Yarrawonga", lat: -36.03, lon: 146.03 },
  { id: "IDR663", name: "Brisbane (Mt Stapylton)", lat: -27.718, lon: 153.240 },
  { id: "IDR503", name: "Brisbane (Marburg)", lat: -27.61, lon: 152.54 },
  { id: "IDR1083", name: "Toowoomba", lat: -27.274, lon: 151.993 },
  { id: "IDR193", name: "Cairns", lat: -16.82, lon: 145.68 },
  { id: "IDR243", name: "Bowen", lat: -19.88, lon: 148.08 },
  { id: "IDR723", name: "Emerald", lat: -23.5494, lon: 148.2392 },
  { id: "IDR233", name: "Gladstone", lat: -23.86, lon: 151.26 },
  { id: "IDR743", name: "Greenvale", lat: -18.99, lon: 144.99 },
  { id: "IDR083", name: "Gympie", lat: -25.957, lon: 152.577 },
  { id: "IDR563", name: "Longreach", lat: -23.43, lon: 144.29 },
  { id: "IDR223", name: "Mackay", lat: -21.12, lon: 149.22 },
  { id: "IDR363", name: "Mornington Island", lat: -16.67, lon: 139.17 },
  { id: "IDR753", name: "Mount Isa", lat: -20.7114, lon: 139.5553 },
  { id: "IDR1073", name: "Richmond", lat: -20.75, lon: 143.14 },
  { id: "IDR983", name: "Taroom", lat: -25.696, lon: 149.898 },
  { id: "IDR673", name: "Warrego", lat: -26.44, lon: 147.35 },
  { id: "IDR783", name: "Weipa", lat: -12.67, lon: 141.92 },
  { id: "IDR413", name: "Willis Island", lat: -16.288, lon: 149.965 },
  { id: "IDR703", name: "Perth (Serpentine)", lat: -32.39, lon: 115.87 },
  { id: "IDR263", name: "Perth Airport", lat: -31.93, lon: 115.98 },
  { id: "IDR313", name: "Albany", lat: -34.94, lon: 117.80 },
  { id: "IDR173", name: "Broome", lat: -17.95, lon: 122.23 },
  { id: "IDR1143", name: "Carnarvon", lat: -24.88, lon: 113.67 },
  { id: "IDR153", name: "Dampier", lat: -20.65, lon: 116.69 },
  { id: "IDR583", name: "South Doodlakine", lat: -31.78, lon: 117.95 },
  { id: "IDR323", name: "Esperance", lat: -33.83, lon: 121.89 },
  { id: "IDR063", name: "Geraldton", lat: -28.80, lon: 114.70 },
  { id: "IDR443", name: "Giles", lat: -25.03, lon: 128.30 },
  { id: "IDR393", name: "Halls Creek", lat: -18.23, lon: 127.66 },
  { id: "IDR483", name: "Kalgoorlie-Boulder", lat: -30.79, lon: 121.45 },
  { id: "IDR1113", name: "Karratha", lat: -20.99, lon: 116.87 },
  { id: "IDR293", name: "Learmonth", lat: -22.10, lon: 114.00 },
  { id: "IDR383", name: "Newdegate", lat: -33.097, lon: 119.009 },
  { id: "IDR163", name: "Port Hedland", lat: -20.37, lon: 118.63 },
  { id: "IDR793", name: "Watheroo", lat: -30.36, lon: 116.29 },
  { id: "IDR073", name: "Wyndham", lat: -15.45, lon: 128.12 },
  { id: "IDR763", name: "Hobart (Mt Koonya)", lat: -43.1122, lon: 147.8061 },
  { id: "IDR523", name: "West Takone", lat: -41.181, lon: 145.579 },
  { id: "IDR373", name: "Hobart Airport", lat: -42.83, lon: 147.51 },
  { id: "IDR633", name: "Darwin (Berrimah)", lat: -12.46, lon: 130.93 },
  { id: "IDR253", name: "Alice Springs", lat: -23.82, lon: 133.90 },
  { id: "IDR1123", name: "Gove", lat: -12.27, lon: 136.82 },
  { id: "IDR423", name: "Katherine", lat: -14.51, lon: 132.45 },
  { id: "IDR773", name: "Warruwi", lat: -11.6494, lon: 133.382 }
];

const RADARWISE_LANGUAGES = {
  auto: "Auto",
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
  nl: "Nederlands"
};

const RADARWISE_TEXT = {
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
    dewPoint: "Dew Point",
    airQuality: "Air Quality",
    uvIndex: "UV Index",
    pollen: "Pollen",
    treePollen: "Tree Pollen",
    grassPollen: "Grass Pollen",
    weedPollen: "Weed Pollen",
    moldPollen: "Mold",
    good: "Good",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    veryHigh: "Very High",
    unhealthySensitive: "Unhealthy for Sensitive Groups",
    unhealthy: "Unhealthy",
    veryUnhealthy: "Very Unhealthy",
    hazardous: "Hazardous",
    extreme: "Extreme",
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
    nwsAlertsTap: "NWS alerts - tap for details",
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
    dewPoint: "Point de rosée",
    airQuality: "Qualite de l'air",
    uvIndex: "Indice UV",
    pollen: "Pollen",
    treePollen: "Pollen des arbres",
    grassPollen: "Pollen de graminees",
    weedPollen: "Pollen de mauvaises herbes",
    moldPollen: "Moisissures",
    good: "Bon",
    low: "Faible",
    moderate: "Modere",
    high: "Eleve",
    veryHigh: "Tres eleve",
    unhealthySensitive: "Mauvais pour les personnes sensibles",
    unhealthy: "Mauvais",
    veryUnhealthy: "Tres mauvais",
    hazardous: "Dangereux",
    extreme: "Extreme",
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
    nwsAlertsTap: "alertes NWS - toucher pour les détails",
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
    dewPoint: "Punto de rocío",
    airQuality: "Calidad del aire",
    uvIndex: "Indice UV",
    pollen: "Polen",
    treePollen: "Polen de arboles",
    grassPollen: "Polen de pastos",
    weedPollen: "Polen de malezas",
    moldPollen: "Moho",
    good: "Buena",
    low: "Bajo",
    moderate: "Moderado",
    high: "Alto",
    veryHigh: "Muy alto",
    unhealthySensitive: "Dano para grupos sensibles",
    unhealthy: "Dano",
    veryUnhealthy: "Muy danino",
    hazardous: "Peligroso",
    extreme: "Extremo",
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
    nwsAlertsTap: "alertas NWS - toca para ver detalles",
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
    dewPoint: "Taupunkt",
    airQuality: "Luftqualitat",
    uvIndex: "UV-Index",
    pollen: "Pollen",
    treePollen: "Baumpollen",
    grassPollen: "Graspollen",
    weedPollen: "Krautpollen",
    moldPollen: "Schimmel",
    good: "Gut",
    low: "Niedrig",
    moderate: "Moderat",
    high: "Hoch",
    veryHigh: "Sehr hoch",
    unhealthySensitive: "Ungesund fur empfindliche Gruppen",
    unhealthy: "Ungesund",
    veryUnhealthy: "Sehr ungesund",
    hazardous: "Gefahrlich",
    extreme: "Extrem",
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
    nwsAlertsTap: "NWS-Warnungen - für Details antippen",
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
    dewPoint: "Ponto de orvalho",
    airQuality: "Qualidade do ar",
    uvIndex: "Indice UV",
    pollen: "Polen",
    treePollen: "Polen de arvores",
    grassPollen: "Polen de graminias",
    weedPollen: "Polen de ervas",
    moldPollen: "Bolor",
    good: "Boa",
    low: "Baixo",
    moderate: "Moderado",
    high: "Alto",
    veryHigh: "Muito alto",
    unhealthySensitive: "Mau para grupos sensiveis",
    unhealthy: "Mau",
    veryUnhealthy: "Muito mau",
    hazardous: "Perigoso",
    extreme: "Extremo",
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
    nwsAlertsTap: "alertas NWS - toque para detalhes",
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
  },
  nl: {
    am: "AM",
    pm: "PM",
    currentWeather: "Huidig weer",
    selectWeatherEntity: "Selecteer een weerentiteit",
    connectWeather: "Koppel weer in Home Assistant",
    openEditor: "Open de kaarteditor om de instelling te voltooien",
    waitingLive: "Wachten op live weergegevens",
    updated: "Bijgewerkt",
    forecast: "Verwachting",
    daily: "Dagelijks",
    hourly: "Per uur",
    dayPeriod: "Dag",
    nightPeriod: "Nacht",
    humidity: "Luchtvochtigheid",
    dewPoint: "Dauwpunt",
    airQuality: "Luchtkwaliteit",
    uvIndex: "UV-index",
    pollen: "Pollen",
    treePollen: "Boompollen",
    grassPollen: "Graspollen",
    weedPollen: "Onkruidpollen",
    moldPollen: "Schimmel",
    good: "Goed",
    low: "Laag",
    moderate: "Matig",
    high: "Hoog",
    veryHigh: "Zeer hoog",
    unhealthySensitive: "Ongezond voor gevoelige groepen",
    unhealthy: "Ongezond",
    veryUnhealthy: "Zeer ongezond",
    hazardous: "Gevaarlijk",
    extreme: "Extreem",
    wind: "Wind",
    sunrise: "Zonsopkomst",
    sunset: "Zonsondergang",
    waitingForecast: "Wachten op verwachtingsgegevens van Home Assistant.",
    relativeTemp: "Relatieve temperatuur binnen de zichtbare verwachtingsregels",
    radarLoading: "Radar laden...",
    radarUnavailable: "Radar niet beschikbaar",
    radarWaiting: "Radar wacht op dashboardindeling",
    rainviewerUnavailable: "RainViewer-radar niet beschikbaar",
    currentRadar: "huidige radar",
    radarLoop: "radarlus",
    futureRadar: "toekomstige radar",
    previousRadarFrame: "Vorig radarbeeld",
    nextRadarFrame: "Volgend radarbeeld",
    pauseRadarLoop: "Radarlus pauzeren",
    playRadarLoop: "Radarlus afspelen",
    weatherAlert: "Weerwaarschuwing",
    activeWeatherAlert: "actieve weerwaarschuwing",
    nwsAlertTap: "NWS-waarschuwing - tik voor details",
    nwsAlertsTap: "NWS-waarschuwingen - tik voor details",
    severity: "Ernst",
    unknown: "Onbekend",
    forecastIntro: "Verwachting",
    currently: "momenteel",
    withHigh: "met een maximum rond {temp}",
    chancePrecip: "en {chance}% kans op neerslag",
    tonight: "Vanavond wordt het {condition}",
    withLow: "met een minimum rond {temp}",
    tomorrow: "Morgen wordt het {condition}",
    nearTemp: "rond {temp}",
    conditions: {
      sunny: "zonnig",
      "clear night": "helder",
      "partly cloudy": "gedeeltelijk bewolkt",
      cloudy: "bewolkt",
      rainy: "regenachtig",
      pouring: "zware regen",
      lightning: "kans op onweer",
      "lightning rainy": "kans op onweer",
      snowy: "sneeuw",
      "snowy rainy": "winterse neerslag",
      fog: "mistig",
      windy: "winderig",
      "windy variant": "winderig met bewolking",
      unavailable: "niet beschikbaar"
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

function isRadarWiseHumidityEntity(entityId, state) {
  if (!entityId) return false;
  const friendly = String(state?.attributes?.friendly_name || "").toLowerCase();
  const deviceClass = String(state?.attributes?.device_class || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "humidity" || id.includes("humidity") || friendly.includes("humidity");
}

function isRadarWiseTemperatureEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  return deviceClass === "temperature" || unit.includes("°") || unit === "c" || unit === "f" || id.includes("temp") || friendly.includes("temp");
}

function isRadarWiseDewPointEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const looksLikeTemperature = deviceClass === "temperature" || unit.includes("°") || unit === "c" || unit === "f";
  return id.includes("dew_point")
    || id.includes("dewpoint")
    || friendly.includes("dew point")
    || friendly.includes("dewpoint")
    || (looksLikeTemperature && (id.includes("dew") || friendly.includes("dew")));
}

function isRadarWiseAirQualityEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  return haystack.includes("aqi")
    || haystack.includes("air_quality")
    || haystack.includes("air quality")
    || haystack.includes("pm2.5")
    || haystack.includes("pm25")
    || haystack.includes("pm_2_5")
    || haystack.includes("particulate");
}

function isRadarWiseUvIndexEntity(entityId, state) {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  return deviceClass === "uv_index"
    || haystack.includes("uv_index")
    || haystack.includes("uv index")
    || haystack.includes("ultraviolet")
    || haystack.includes(" uvi");
}

function isRadarWisePollenEntity(entityId, state, kind = "") {
  if (!entityId) return false;
  const attrs = state?.attributes || {};
  const friendly = String(attrs.friendly_name || "").toLowerCase();
  const deviceClass = String(attrs.device_class || "").toLowerCase();
  const unit = String(attrs.unit_of_measurement || attrs.native_unit_of_measurement || "").toLowerCase();
  const id = String(entityId).toLowerCase();
  const haystack = `${id} ${friendly} ${deviceClass} ${unit}`;
  const pollenish = haystack.includes("pollen") || haystack.includes("allergy") || haystack.includes("allergen");
  if (!kind) return pollenish;
  const source = String(kind).toLowerCase();
  return pollenish && (haystack.includes(source) || haystack.includes(`${source}_pollen`) || haystack.includes(`${source} pollen`));
}

class RadarWiseCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:radarwise-card",
      entity: "weather.home",
      humidity_entity: "",
      temperature_entity: "",
      dew_point_entity: "",
      air_quality_entity: "",
      uv_index_entity: "",
      pollen_entity: "",
      tree_pollen_entity: "",
      grass_pollen_entity: "",
      weed_pollen_entity: "",
      mold_pollen_entity: "",
      environment_source: "sensors",
      title: "Local Weather",
      country: "us",
      radar_provider: "auto",
      theme_mode: "radarwise",
      units: "auto",
      language: "auto",
      layout: "auto",
      content_mode: "full",
      density: "comfortable",
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_forecast_summary: true,
      show_environment: true,
      show_custom_sensors: true,
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
      custom_sensors: [],
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
    return document.createElement("radarwise-card-editor");
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._forecasts = { hourly: [], daily: [], twice_daily: [] };
    this._forecastEntity = null;
    this._lastForecastLoad = 0;
    this._environmentData = null;
    this._environmentLastLoad = 0;
    this._environmentTimer = null;
    this._environmentKey = "";
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
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
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
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
    this._resumeRadarIfNeeded();
  }

  disconnectedCallback() {
    window.clearInterval(this._clockTimer);
    this._clockTimer = null;
    window.clearInterval(this._forecastRefreshTimer);
    this._forecastRefreshTimer = null;
    window.clearInterval(this._environmentTimer);
    this._environmentTimer = null;
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
    if (
      previous.environment_source !== this._config.environment_source ||
      previous.show_environment !== this._config.show_environment ||
      previous.latitude !== this._config.latitude ||
      previous.longitude !== this._config.longitude
    ) {
      this._resetEnvironmentData();
    }
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
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
    this._ensureEnvironmentRefreshTimer();
    this._refreshEnvironmentIfStale();
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

  _environmentEnabled() {
    return this._config.show_environment !== false && this._config.environment_source === "open_meteo";
  }

  _ensureEnvironmentRefreshTimer() {
    if (!this._environmentEnabled()) {
      window.clearInterval(this._environmentTimer);
      this._environmentTimer = null;
      return;
    }
    if (this._environmentTimer || !this.isConnected) return;
    this._environmentTimer = window.setInterval(() => this._refreshEnvironmentIfStale(true), ENVIRONMENT_REFRESH_MS);
  }

  _resetEnvironmentData() {
    this._environmentData = null;
    this._environmentLastLoad = 0;
    this._environmentKey = "";
    window.clearInterval(this._environmentTimer);
    this._environmentTimer = null;
  }

  _refreshEnvironmentIfStale(force = false) {
    if (!this._environmentEnabled()) return;
    const { lat, lon } = this._latLon();
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const key = `${lat.toFixed(4)},${lon.toFixed(4)}`;
    const now = Date.now();
    if (!force && this._environmentKey === key && now - this._environmentLastLoad < ENVIRONMENT_REFRESH_MS) return;
    this._environmentKey = key;
    this._environmentLastLoad = now;
    this._loadOpenMeteoEnvironment(lat, lon, key);
  }

  async _loadOpenMeteoEnvironment(lat, lon, requestKey = "") {
    const [airQualityResult, uvResult] = await Promise.allSettled([
      this._fetchOpenMeteoAirQuality(lat, lon),
      this._fetchOpenMeteoUv(lat, lon)
    ]);
    if (requestKey && this._environmentKey && requestKey !== this._environmentKey) return;
    const next = { source: "open_meteo", loaded: Date.now() };
    const errors = [];
    if (airQualityResult.status === "fulfilled") Object.assign(next, this._normalizeOpenMeteoEnvironment(airQualityResult.value));
    else errors.push(airQualityResult.reason?.message || "Open-Meteo air quality unavailable");
    if (uvResult.status === "fulfilled") next.uv = this._normalizeOpenMeteoUv(uvResult.value);
    else errors.push(uvResult.reason?.message || "Open-Meteo UV unavailable");
    if (errors.length) next.error = errors.join("; ");
    this._environmentData = next;
    this._lastRenderKey = "";
    this._render();
  }

  async _fetchOpenMeteoAirQuality(lat, lon) {
    const variables = [
      "us_aqi",
      "european_aqi",
      "pm2_5",
      "pm10",
      "alder_pollen",
      "birch_pollen",
      "grass_pollen",
      "mugwort_pollen",
      "olive_pollen",
      "ragweed_pollen"
    ].join(",");
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: variables,
      timezone: "auto"
    });
    const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Open-Meteo air quality returned ${response.status}`);
    return response.json();
  }

  async _fetchOpenMeteoUv(lat, lon) {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "uv_index",
      hourly: "uv_index",
      forecast_hours: "24",
      timezone: "auto"
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error(`Open-Meteo UV returned ${response.status}`);
    return response.json();
  }

  _normalizeOpenMeteoEnvironment(data) {
    const current = data?.current || {};
    const units = data?.current_units || {};
    const numberFor = (key) => this._numberOr(current[key], NaN);
    const aqiValue = Number.isFinite(numberFor("us_aqi")) ? numberFor("us_aqi") : numberFor("european_aqi");
    const aqiUnit = Number.isFinite(numberFor("us_aqi")) ? (units.us_aqi || "AQI") : (units.european_aqi || "AQI");
    const pollenGroups = [
      { labelKey: "treePollen", keys: ["alder_pollen", "birch_pollen", "olive_pollen"] },
      { labelKey: "grassPollen", keys: ["grass_pollen"] },
      { labelKey: "weedPollen", keys: ["mugwort_pollen", "ragweed_pollen"] }
    ].map((group) => {
      const sources = group.keys.map((key) => ({
        key,
        value: numberFor(key),
        unit: units[key] || "grains/m3"
      })).filter((source) => Number.isFinite(source.value));
      const strongest = sources.sort((a, b) => b.value - a.value)[0] || null;
      return strongest ? {
        labelKey: group.labelKey,
        key: strongest.key,
        value: strongest.value,
        unit: strongest.unit,
        sources
      } : null;
    }).filter(Boolean);
    const strongestPollen = pollenGroups.sort((a, b) => b.value - a.value)[0] || null;
    const pollenResult = strongestPollen && strongestPollen.value > 0 ? strongestPollen : (
      pollenGroups.length ? {
        labelKey: "pollen",
        key: "none",
        value: 0,
        unit: pollenGroups[0].unit || "grains/m3",
        sources: pollenGroups
      } : null
    );
    return {
      source: "open_meteo",
      loaded: Date.now(),
      aqi: Number.isFinite(aqiValue) ? {
        value: aqiValue,
        unit: aqiUnit || "AQI",
        pm25: numberFor("pm2_5"),
        pm10: numberFor("pm10")
      } : null,
      pollen: pollenResult ? {
        value: pollenResult.value,
        unit: pollenResult.unit,
        labelKey: pollenResult.labelKey,
        key: pollenResult.key,
        sources: pollenResult.sources
      } : null
    };
  }

  _normalizeOpenMeteoUv(data) {
    const current = data?.current || {};
    const hourly = data?.hourly || {};
    const unit = data?.current_units?.uv_index || data?.hourly_units?.uv_index || "";
    const currentUv = this._numberOr(current.uv_index, NaN);
    const times = Array.isArray(hourly.time) ? hourly.time : [];
    const values = Array.isArray(hourly.uv_index) ? hourly.uv_index : [];
    return {
      current: Number.isFinite(currentUv) ? currentUv : NaN,
      unit,
      hourly: times.map((time, index) => ({
        time,
        value: this._numberOr(values[index], NaN)
      })).filter((entry) => entry.time && Number.isFinite(entry.value))
    };
  }

  getCardSize() {
    const mode = this._config.content_mode || "full";
    let size = this._config.show_radar === false ? 5 : 6;
    if (mode === "radar") size = 4;
    if (mode === "forecast" || mode === "timeline") size = 4;
    if (mode === "essentials") size = 3;
    if (this._config.layout === "compact") size = Math.min(size, this._config.show_radar === false ? 4 : 6);
    if (this._config.layout === "stacked") size = this._config.show_radar === false ? Math.max(size, 7) : Math.max(size, 9);
    if (this._config.density === "slim") size = Math.max(3, size - 1);
    if (this._config.density === "large") size += 1;
    return size;
  }

  getGridOptions() {
    const layout = this._config.layout || "auto";
    const mode = this._config.content_mode || "full";
    const density = this._config.density || "comfortable";
    let rows = layout === "stacked" ? 8 : layout === "compact" ? 5 : 6;
    if (mode === "radar") rows = 4;
    if (mode === "forecast" || mode === "timeline") rows = 4;
    if (mode === "essentials") rows = 3;
    if (density === "slim") rows = Math.max(3, rows - 1);
    if (density === "large") rows += 1;
    const columns = layout === "stacked" ? 12 : 18;
    return {
      rows,
      columns,
      min_rows: Math.min(rows, layout === "compact" ? 4 : 5),
      min_columns: 8
    };
  }

  _normalizeConfig(config) {
    const country = String(config.country || "us").toLowerCase();
    const radarProvider = String(config.radar_provider || "auto").toLowerCase();
    const themeMode = String(config.theme_mode || "radarwise").toLowerCase() === "auto" ? "auto" : "radarwise";
    const units = ["auto", "imperial", "metric"].includes(String(config.units || "auto").toLowerCase())
      ? String(config.units || "auto").toLowerCase()
      : "auto";
    const radarStyle = String(config.radar_style || "standard").toLowerCase();
    const radarBasemap = String(config.radar_basemap || "light").toLowerCase();
    const radarTimeline = String(config.radar_timeline || "loop").toLowerCase();
    const layout = String(config.layout || "auto").toLowerCase();
    const language = String(config.language || config.forecast_summary_language || "auto").toLowerCase();
    const environmentSource = String(config.environment_source || "sensors").toLowerCase();
    const timeFormat = String(config.time_format || "auto").toLowerCase();
    const fontFamily = String(config.font_family || "auto").toLowerCase();
    return {
      title: "Local Weather",
      humidity_entity: "",
      temperature_entity: "",
      dew_point_entity: "",
      air_quality_entity: "",
      uv_index_entity: "",
      pollen_entity: "",
      tree_pollen_entity: "",
      grass_pollen_entity: "",
      weed_pollen_entity: "",
      mold_pollen_entity: "",
      environment_source: "sensors",
      country: RADARWISE_COUNTRIES[country] ? country : "global",
      radar_provider: RADARWISE_RADAR[radarProvider] ? radarProvider : "auto",
      theme_mode: themeMode,
      units,
      time_format: "auto",
      font_family: "auto",
      hourly_count: 5,
      forecast_count: 5,
      show_timeline: true,
      show_forecast: true,
      show_forecast_summary: true,
      show_environment: true,
      show_custom_sensors: true,
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
      radar_style: RADARWISE_RADAR_STYLES[radarStyle] ? radarStyle : "standard",
      radar_basemap: RADARWISE_BASEMAPS[radarBasemap] ? radarBasemap : "light",
      radar_timeline: RADARWISE_RADAR_TIMELINES[radarTimeline] ? radarTimeline : "loop",
      layout: RADARWISE_LAYOUTS[layout] ? layout : "auto",
      content_mode: RADARWISE_CONTENT_MODES[String(config.content_mode || "full").toLowerCase()] ? String(config.content_mode || "full").toLowerCase() : "full",
      density: RADARWISE_DENSITIES[String(config.density || "comfortable").toLowerCase()] ? String(config.density || "comfortable").toLowerCase() : "comfortable",
      language: RADARWISE_LANGUAGES[language] ? language : "auto",
      time_format: RADARWISE_TIME_FORMATS[timeFormat] ? timeFormat : "auto",
      font_family: RADARWISE_FONT_FAMILIES[fontFamily] ? fontFamily : "auto",
      environment_source: RADARWISE_ENVIRONMENT_SOURCES[environmentSource] ? environmentSource : "sensors",
      latitude: this._numberOr(config.latitude, undefined),
      longitude: this._numberOr(config.longitude, undefined),
      hourly_count: Math.max(1, Math.min(24, Number(config.hourly_count) || 5)),
      forecast_count: Math.max(1, Math.min(7, Number(config.forecast_count) || 5)),
      show_timeline: config.show_timeline !== false,
      show_forecast: config.show_forecast !== false,
      show_forecast_summary: config.show_forecast_summary !== false,
      show_environment: config.show_environment !== false,
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
      radar_speed: Math.max(300, Math.min(3000, Number(config.radar_speed) || 700)),
      custom_sensors: this._normalizeCustomSensors(config.custom_sensors),
      show_custom_sensors: config.show_custom_sensors !== false
    };
  }

  _normalizeCustomSensors(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, 6).map((item) => {
      if (!item || typeof item !== "object") return null;
      const entity = String(item.entity || "").trim();
      if (!entity) return null;
      return {
        entity,
        name: String(item.name || item.label || "").trim(),
        icon: String(item.icon || "").trim(),
        unit: String(item.unit || item.unit_of_measurement || "").trim()
      };
    }).filter(Boolean);
  }

  _renderKey() {
    const stateObj = this._hass?.states?.[this._config.entity];
    const attrs = stateObj?.attributes || {};
    return JSON.stringify({
      entity: this._config.entity,
      humidityEntity: this._config.humidity_entity,
      temperatureEntity: this._config.temperature_entity,
      dewPointEntity: this._config.dew_point_entity,
      airQualityEntity: this._config.air_quality_entity,
      uvIndexEntity: this._config.uv_index_entity,
      pollenEntity: this._config.pollen_entity,
      treePollenEntity: this._config.tree_pollen_entity,
      grassPollenEntity: this._config.grass_pollen_entity,
      weedPollenEntity: this._config.weed_pollen_entity,
      moldPollenEntity: this._config.mold_pollen_entity,
      environmentSource: this._config.environment_source,
      customSensors: (this._config.custom_sensors || []).map((sensor) => {
        const state = this._hass?.states?.[sensor.entity];
        return [
          sensor.entity,
          sensor.name,
          sensor.icon,
          sensor.unit,
          state?.state,
          state?.attributes?.friendly_name,
          state?.attributes?.unit_of_measurement,
          state?.attributes?.icon
        ].join(":");
      }).join("|"),
      environmentData: this._environmentData ? {
        loaded: this._environmentData.loaded,
        error: this._environmentData.error,
        aqi: this._environmentData.aqi?.value,
        uv: this._environmentData.uv?.current,
        pollen: this._environmentData.pollen?.value,
        pollenKind: this._environmentData.pollen?.labelKey
      } : null,
      state: stateObj?.state,
      updated: stateObj?.last_updated,
      temp: attrs.temperature,
      temperatureState: this._config.temperature_entity ? this._hass?.states?.[this._config.temperature_entity]?.state : undefined,
      humidity: attrs.humidity,
      humidityState: this._config.humidity_entity ? this._hass?.states?.[this._config.humidity_entity]?.state : undefined,
      dewPoint: attrs.dew_point ?? attrs.dewpoint ?? attrs.dewPoint,
      dewPointState: this._config.dew_point_entity ? this._hass?.states?.[this._config.dew_point_entity]?.state : undefined,
      airQualityState: this._config.air_quality_entity ? this._hass?.states?.[this._config.air_quality_entity]?.state : undefined,
      uvIndexState: this._config.uv_index_entity ? this._hass?.states?.[this._config.uv_index_entity]?.state : undefined,
      pollenState: this._config.pollen_entity ? this._hass?.states?.[this._config.pollen_entity]?.state : undefined,
      treePollenState: this._config.tree_pollen_entity ? this._hass?.states?.[this._config.tree_pollen_entity]?.state : undefined,
      grassPollenState: this._config.grass_pollen_entity ? this._hass?.states?.[this._config.grass_pollen_entity]?.state : undefined,
      weedPollenState: this._config.weed_pollen_entity ? this._hass?.states?.[this._config.weed_pollen_entity]?.state : undefined,
      moldPollenState: this._config.mold_pollen_entity ? this._hass?.states?.[this._config.mold_pollen_entity]?.state : undefined,
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
        this._config.content_mode,
        this._config.density,
        this._config.theme_mode,
        this._config.units,
        this._language(),
        this._config.time_format,
        this._config.font_family,
        this._config.show_radar,
        this._config.show_timeline,
        this._config.show_forecast,
        this._config.show_forecast_summary,
        this._config.show_environment,
        this._config.show_custom_sensors,
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
    if (RADARWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    const locale = String(this._hass?.locale?.language || this._hass?.language || browserLanguage || "en").toLowerCase();
    const code = locale.split(/[-_]/)[0];
    return RADARWISE_TEXT[code] ? code : "en";
  }

  _texts() {
    return RADARWISE_TEXT[this._language()] || RADARWISE_TEXT.en;
  }

  _localeCode() {
    const configured = String(this._config.language || "auto").toLowerCase();
    if (configured !== "auto" && RADARWISE_TEXT[configured]) return configured;
    const browserLanguage = typeof navigator !== "undefined" ? navigator.language : "en";
    return this._hass?.locale?.language || this._hass?.language || browserLanguage || "en";
  }

  _t(key) {
    return this._texts()[key] ?? RADARWISE_TEXT.en[key] ?? key;
  }

  _template(key, values = {}) {
    return String(this._t(key)).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  }

  _contentVisibility(provider = this._resolvedRadarProvider()) {
    const radarAllowed = provider !== "none";
    const base = {
      mode: this._config.content_mode || "full",
      clock: true,
      current: true,
      stats: true,
      timeline: this._config.show_timeline !== false,
      forecast: this._config.show_forecast !== false,
      forecastSummary: this._config.show_forecast_summary !== false,
      environment: this._config.show_environment !== false,
      radar: this._config.show_radar !== false && radarAllowed
    };
    const presets = {
      full: base,
      custom: base,
      essentials: {
        ...base,
        timeline: false,
        forecast: false,
        forecastSummary: false,
        radar: false
      },
      forecast: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        timeline: false,
        forecast: true,
        forecastSummary: false,
        environment: false,
        radar: false
      },
      timeline: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        forecast: false,
        forecastSummary: false,
        environment: false,
        radar: false
      },
      radar: {
        ...base,
        clock: false,
        current: false,
        stats: false,
        timeline: false,
        forecast: false,
        forecastSummary: false,
        environment: false,
        radar: radarAllowed
      }
    };
    const next = { ...(presets[base.mode] || base) };
    next.left = next.clock || next.timeline || next.forecastSummary || next.environment;
    next.center = next.current || next.forecast || next.stats;
    next.right = next.radar;
    if (!next.left && !next.center && !next.right) {
      next.center = true;
      next.current = true;
    }
    next.panelCount = [next.left, next.center, next.right].filter(Boolean).length;
    return next;
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
    const wind = this._formatWind(attrs, units);
    const hourly = this._forecasts.hourly || [];
    const daily = this._forecasts.daily || [];
    const twiceDaily = this._forecasts.twice_daily || [];
    const forecastSources = [hourly, twiceDaily, daily];
    const humidityInfo = this._humidityInfo(attrs, forecastSources);
    const dewPointInfo = this._dewPointInfo(attrs, units, forecastSources);
    const humidity = humidityInfo.display;
    const dewPoint = dewPointInfo.display;
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
    const density = this._config.density || "comfortable";
    const content = this._contentVisibility(provider);
    const forecastSummary = this._forecastSummary({ hourly, daily, twiceDaily, units, condition: displayCondition });
    const environmentTiles = content.environment ? this._renderEnvironmentTiles() : "";
    const currentUvBadge = this._renderCurrentUv(attrs);
    if (!content.right) this._teardownRadar();

    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card style="--radarwise-font-family:${_wwEscape(RADARWISE_FONT_STACKS[this._config.font_family] || RADARWISE_FONT_STACKS.auto)}">
        <div class="card-outer">
          <div class="card-grid layout-${_wwEscape(layout)} content-${_wwEscape(content.mode)} density-${_wwEscape(density)} panels-${content.panelCount} ${content.right ? "" : "no-radar"} ${content.timeline ? "" : "no-timeline"} ${content.forecast ? "" : "no-forecast"} ${content.left ? "" : "no-left"} ${content.center ? "" : "no-center"}" style="${(() => {
  const w = this._config.column_widths || [25,50,25];
  const cl = this._sectionOrder('clock');
  const wl = this._sectionOrder('weather');
  const rl = this._sectionOrder('radar');
  const cb = cl * 10, wb = wl * 10, rb = rl * 10;
  return `--ww-col1:${w[0]}fr;--ww-col2:${w[1]}fr;--ww-col3:${w[2]}fr;--ww-left-order:${cl};--ww-center-order:${wl};--ww-right-order:${rl};--ww-ord-clock-title:${cb+1};--ww-ord-clock-hourly:${cb+2};--ww-ord-weather:${wb+1};--ww-ord-radar:${rb+1};`;
})()}--ww-hourly-count:${Math.max(1, Math.min(24, Number(this._config.hourly_count) || 5))};--ww-forecast-count:${Math.max(1, Math.min(7, Number(this._config.forecast_count) || 5))}">
            ${content.left ? `
              <section class="left">
                ${(content.clock || content.environment || content.forecastSummary) ? `
                  <div class="clock-panel">
                    ${(content.clock || content.environment) ? `
                      <div class="clock-context ${environmentTiles ? "" : "no-env"}">
                        ${content.clock ? `
                          <div class="clock-main">
                            <div class="clock-row">
                              <div class="clock-time" id="clock-time">${this._clockTime(now)}</div>
                              <div class="clock-ampm" id="clock-ampm">${this._clockAmPm(now)}</div>
                            </div>
                            <div class="clock-date" id="clock-date">${this._longDate(now)}</div>
                          </div>
                        ` : ""}
                        ${environmentTiles ? `<div class="environment-strip">${environmentTiles}</div>` : ""}
                      </div>
                    ` : ""}
                    ${content.forecastSummary ? `<div class="forecast-summary" title="${_wwEscape(forecastSummary)}"><span class="forecast-summary-text">${_wwEscape(forecastSummary)}</span></div>` : ""}
                  </div>
                ` : ""}
                ${content.timeline ? `
                  <div class="section-title">${this._timelineTitle(timelineMode)}</div>
                  <div class="hourly-left">${this._renderTimeline(timeline, units, timelineMode)}</div>
                ` : ""}
              </section>
            ` : ""}
            ${content.center ? `
              <section class="center">
                ${content.current ? `
                  <div class="current-row">
                    <div class="current-icon">${this._icon(displayCondition, 62)}</div>
                    <div class="cond-block">
                      <div class="current-label">${_wwEscape(text.currentWeather)}</div>
                      <div class="cond-name-row">
                        <div class="cond-name">${needsEntity ? _wwEscape(text.selectWeatherEntity) : unavailable ? _wwEscape(text.connectWeather) : _wwEscape(this._conditionLabel(displayCondition))}</div>
                        ${currentUvBadge}
                      </div>
                      <div class="updated-note">${needsEntity ? _wwEscape(text.openEditor) : unavailable ? _wwEscape(text.waitingLive) : `${_wwEscape(text.updated)} ${this._shortTime(now)}`}</div>
                    </div>
                    <div class="temp-block">
                      <div class="temp-now">${temp}</div>
                      <div class="temp-hilo">${hiLo}</div>
                    </div>
                  </div>
                ` : ""}
                ${content.forecast ? `<div class="daily-strip">${this._renderDaily(mainPeriods, units)}</div>` : ""}
                ${content.stats ? `
                  <div class="stats-row">
                    ${this._stat("humidity", text.humidity, `${humidity}%`)}
                    ${this._stat("dewpoint", text.dewPoint, dewPoint)}
                    ${this._stat("wind", text.wind, wind)}
                    ${this._stat("sunrise", text.sunrise, this._shortTime(sun.next_rising))}
                    ${this._stat("sunset", text.sunset, this._shortTime(sun.next_setting))}
                  </div>
                  ${this._renderCustomSensors()}
                ` : ""}
              </section>
            ` : ""}
            ${content.right ? `
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
          ${this._renderDebug({ stateObj, attrs, hourly, daily, twiceDaily, provider, units, humidityInfo, dewPointInfo })}
        </div>
      </ha-card>
    `;

    if (content.right) {
      this._teardownRadar();
      this._radarProviderRendered = provider;
      this._wireRadarControls();
      window.requestAnimationFrame(() => this._scheduleRadarInit(provider));
    }
    this._updateClock();
    if (this._config.timeline_autoscroll && content.timeline) {
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
    const debugValue = (value) => {
      if (value === undefined) return "missing";
      if (value === null) return "null";
      if (typeof value === "object") {
        try {
          return JSON.stringify(value);
        } catch (err) {
          return String(value);
        }
      }
      return String(value);
    };
    const firstHourly = data.hourly?.[0] || {};
    const firstTwiceDaily = data.twiceDaily?.[0] || {};
    const firstDaily = data.daily?.[0] || {};
    const rows = [
      ["Version", CARD_VERSION],
      ["Entity", this._config.entity],
      ["Temperature entity", this._config.temperature_entity || "auto"],
      ["Humidity entity", this._config.humidity_entity || "auto"],
      ["Dew point entity", this._config.dew_point_entity || "auto"],
      ["Resolved humidity", `${data.humidityInfo?.display ?? "--"}% via ${data.humidityInfo?.source || "missing"}`],
      ["Resolved humidity raw", debugValue(data.humidityInfo?.raw)],
      ["Resolved dew point", `${data.dewPointInfo?.display ?? "--"} via ${data.dewPointInfo?.source || "missing"}`],
      ["Resolved dew point raw", debugValue(data.dewPointInfo?.raw)],
      ["Weather humidity attrs", debugValue({
        humidity: data.attrs?.humidity,
        relative_humidity: data.attrs?.relative_humidity,
        relativeHumidity: data.attrs?.relativeHumidity,
        native_humidity: data.attrs?.native_humidity
      })],
      ["Weather dew point attrs", debugValue({
        dew_point: data.attrs?.dew_point,
        dewpoint: data.attrs?.dewpoint,
        dewPoint: data.attrs?.dewPoint,
        native_dew_point: data.attrs?.native_dew_point,
        dew_point_temperature: data.attrs?.dew_point_temperature
      })],
      ["Air quality entity", this._config.air_quality_entity || "none"],
      ["UV index entity", this._config.uv_index_entity || "auto"],
      ["Pollen entity", this._config.pollen_entity || "none"],
      ["Tree pollen entity", this._config.tree_pollen_entity || "none"],
      ["Grass pollen entity", this._config.grass_pollen_entity || "none"],
      ["Weed pollen entity", this._config.weed_pollen_entity || "none"],
      ["Mold pollen entity", this._config.mold_pollen_entity || "none"],
      ["Environment source", this._config.environment_source || "sensors"],
      ["Environment updated", this._environmentData?.loaded ? new Date(this._environmentData.loaded).toLocaleString() : "never"],
      ["Environment error", this._environmentData?.error || "none"],
      ["Country", this._config.country],
      ["Radar", data.provider],
      ["Content mode", this._config.content_mode],
      ["Density", this._config.density],
      ["Time format", this._config.time_format],
      ["Font family", this._config.font_family],
      ["Units", data.units.temperatureUnit],
      ["Hourly count", data.hourly.length],
      ["Daily count", data.daily.length],
      ["Twice daily count", data.twiceDaily.length],
      ["First hourly keys", Object.keys(firstHourly).sort().join(", ") || "none"],
      ["First hourly humidity/dew", debugValue({
        humidity: firstHourly.humidity,
        relative_humidity: firstHourly.relative_humidity,
        dew_point: firstHourly.dew_point,
        dewpoint: firstHourly.dewpoint
      })],
      ["First twice daily keys", Object.keys(firstTwiceDaily).sort().join(", ") || "none"],
      ["First daily keys", Object.keys(firstDaily).sort().join(", ") || "none"],
      ["Weather attr keys", Object.keys(data.attrs || {}).sort().join(", ") || "none"],
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
    if (ampm) ampm.textContent = this._clockAmPm(now);
    if (date) date.textContent = this._longDate(now);
  }

  _timelineTitle(mode) {
    if (mode === "twice_daily") return this._t("forecast");
    if (mode === "daily") return this._t("daily");
    return this._t("hourly");
  }

  _renderCurrentUv(attrs) {
    const uv = this._currentUv(attrs);
    if (!Number.isFinite(uv)) return "";
    const severity = this._uvSeverity(uv);
    const value = this._formatUvValue(uv);
    return `
      <div class="current-uv uv-${_wwEscape(severity.level)}" title="${_wwEscape(`${this._t("uvIndex")}: ${value} ${this._t(severity.key)}`)}" aria-label="${_wwEscape(`${this._t("uvIndex")}: ${value} ${this._t(severity.key)}`)}">
        <span>${_wwEscape(this._t("uvIndex"))}</span>
        <strong>${_wwEscape(value)}</strong>
        <em>${_wwEscape(this._t(severity.key))}</em>
      </div>
    `;
  }

  _currentUv(attrs = {}) {
    const entityId = this._config.uv_index_entity;
    const state = entityId ? this._hass?.states?.[entityId] : null;
    if (state && isRadarWiseUvIndexEntity(entityId, state)) {
      const value = this._numberOr(state.state, NaN);
      if (Number.isFinite(value)) return value;
    }
    const attrValue = [
      attrs.uv_index,
      attrs.uv,
      attrs.uvi,
      attrs.ultraviolet_index
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    if (Number.isFinite(attrValue)) return attrValue;
    const openMeteoUv = this._environmentData?.uv?.current;
    return Number.isFinite(openMeteoUv) ? openMeteoUv : NaN;
  }

  _hourlyUv(item, mode = "hourly") {
    const forecastUv = this._forecastUv(item);
    if (Number.isFinite(forecastUv)) return forecastUv;
    if (mode !== "hourly" || this._config.environment_source !== "open_meteo") return NaN;
    return this._openMeteoUvForTime(item?.datetime);
  }

  _forecastUv(item) {
    const value = [
      item?.uv_index,
      item?.uv,
      item?.uvi,
      item?.ultraviolet_index
    ].map((candidate) => this._numberOr(candidate, NaN)).find(Number.isFinite);
    return Number.isFinite(value) ? value : NaN;
  }

  _openMeteoUvForTime(datetime) {
    if (!datetime) return NaN;
    const targetHour = this._hourKey(datetime);
    if (!targetHour) return NaN;
    const match = (this._environmentData?.uv?.hourly || []).find((entry) => this._hourKey(entry.time) === targetHour);
    return Number.isFinite(match?.value) ? match.value : NaN;
  }

  _hourKey(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}`;
  }

  _formatUvValue(value) {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return "--";
    return String(Math.round(number * 10) / 10).replace(/\.0$/, "");
  }

  _uvSeverity(value) {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return { key: "unknown", level: "neutral", rank: 0 };
    if (number <= 2) return { key: "low", level: "good", rank: 1 };
    if (number <= 5) return { key: "moderate", level: "moderate", rank: 2 };
    if (number <= 7) return { key: "high", level: "unhealthy", rank: 3 };
    if (number <= 10) return { key: "veryHigh", level: "very-high", rank: 4 };
    return { key: "extreme", level: "hazardous", rank: 5 };
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
      const precip = this._formatPrecip(item, units);
      const uv = this._hourlyUv(item, mode);
      const uvText = Number.isFinite(uv) ? `UV ${this._formatUvValue(uv)}` : "";
      return `
        <div class="hour-row">
          <div class="hour-time-left">${this._timelineTime(item, mode)}</div>
          <div class="hour-icon-left">${this._icon(item.condition || item.state, 23)}</div>
          <div class="hour-temp-left">${this._displayTemp(item.temperature, units, false)}</div>
          <div class="hour-bar-wrap" title="${_wwEscape(this._t("relativeTemp"))}"><div class="hour-bar-fill" style="width:${pct}%"></div></div>
          <div class="hour-precip">${_wwEscape([precip, uvText].filter(Boolean).join(" · "))}</div>
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
      const range = this._forecastRange(item, units);
      return `
        <div class="fc-slot">
          <div>
            <div class="fc-day">${this._dayName(item.datetime)}</div>
            <div class="fc-period">${period}</div>
          </div>
          <div class="fc-icon">${this._icon(item.condition || item.state, 48)}</div>
          <div class="fc-temp">${this._displayTemp(item.temperature, units, false)}</div>
          ${range ? `<div class="fc-range">${_wwEscape(range)}</div>` : ""}
          <div class="fc-precip">${this._formatPrecip(item, units)}</div>
        </div>
      `;
    }).join("");
  }

  _forecastRange(item, units) {
    const high = this._tempValue(item?.temperature ?? item?.high_temperature ?? item?.native_temperature, units);
    const low = this._tempValue(item?.templow ?? item?.low_temperature ?? item?.native_templow, units);
    if (!Number.isFinite(high) || !Number.isFinite(low)) return "";
    return `${Math.round(high)}° / ${Math.round(low)}°`;
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
      || RADARWISE_TEXT.en.conditions[value]
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
      dewpoint: `<svg viewBox="0 0 24 24" fill="none"><path d="M8 3s4.5 4.8 4.5 8.4a4.5 4.5 0 1 1-9 0C3.5 7.8 8 3 8 3Z" fill="#65b8df"/><path d="M16.5 4.5v8.2a3.7 3.7 0 1 1-3 0V4.5a1.5 1.5 0 0 1 3 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.5 16.4h.01" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/></svg>`,
      wind: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 8h10.4a3 3 0 1 0-2.6-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 13h15.4a3 3 0 1 1-2.6 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunrise: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#fbbf24"/><path d="M12 4v4M5 11l3 1M19 11l-3 1" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`,
      sunset: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 15a5 5 0 0 1 10 0" fill="#f59e0b"/><path d="M12 8V4M5 11l3 1M19 11l-3 1" stroke="#7c3aed" stroke-width="2" stroke-linecap="round"/></svg>`
    };
    return `<div class="stat"><div class="stat-ico" aria-hidden="true">${icons[kind]}</div><div><div class="stat-lbl">${label}</div><div class="stat-val">${_wwEscape(value || "--")}</div></div></div>`;
  }

  _renderCustomSensors() {
    const sensors = Array.isArray(this._config.custom_sensors) ? this._config.custom_sensors : [];
    if (this._config.show_custom_sensors === false || !sensors.length) return "";
    const tiles = sensors.map((sensor) => this._customSensorTile(sensor)).filter(Boolean).join("");
    return tiles ? `<div class="custom-sensors-row">${tiles}</div>` : "";
  }

  _customSensorTile(sensor) {
    const entityId = String(sensor?.entity || "").trim();
    if (!entityId) return "";
    const state = this._hass?.states?.[entityId];
    const attrs = state?.attributes || {};
    const label = sensor.name || attrs.friendly_name || entityId;
    const value = this._customSensorValue(state, sensor.unit);
    const icon = this._customSensorIcon(sensor.icon || attrs.icon);
    return `
      <div class="stat custom-sensor-stat" title="${_wwEscape(entityId)}">
        <div class="stat-ico custom-sensor-ico" aria-hidden="true">${icon}</div>
        <div>
          <div class="stat-lbl">${_wwEscape(label)}</div>
          <div class="stat-val">${_wwEscape(value)}</div>
        </div>
      </div>
    `;
  }

  _customSensorValue(state, overrideUnit = "") {
    if (!state || state.state === "unknown" || state.state === "unavailable") return "--";
    const raw = state.state;
    const unit = String(overrideUnit || state.attributes?.unit_of_measurement || state.attributes?.native_unit_of_measurement || "").trim();
    const number = this._numberOr(raw, NaN);
    if (Number.isFinite(number)) {
      const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
      return `${rounded}${unit ? ` ${unit}` : ""}`.trim();
    }
    return `${this._titleCase(raw)}${unit ? ` ${unit}` : ""}`.trim();
  }

  _customSensorIcon(icon) {
    const clean = String(icon || "").trim();
    if (/^mdi:[a-z0-9-]+$/i.test(clean)) {
      return `<ha-icon icon="${_wwEscape(clean)}"></ha-icon>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M5 17.5h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 14.5c1.6-4.1 3.3-6.1 5-6.1s3.4 2 5 6.1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="8.4" r="2.5" fill="#65b8df"/><path d="M12 12.5v3.5" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  _renderEnvironmentTiles() {
    if (this._config.show_environment === false || this._config.environment_source === "disabled") return "";
    const tiles = [this._airQualityTile(), this._pollenTile()].filter(Boolean);
    return tiles.map((tile) => `
      <div class="env-tile env-${_wwEscape(tile.level || "neutral")}">
        <div class="env-ico" aria-hidden="true">${this._environmentIcon(tile.kind)}</div>
        <div class="env-copy">
          <div class="env-lbl">${_wwEscape(tile.label)}</div>
          <div class="env-val">${_wwEscape(tile.value)}</div>
          <div class="env-note">${_wwEscape(tile.note)}</div>
        </div>
      </div>
    `).join("");
  }

  _airQualityTile() {
    if (this._config.environment_source === "open_meteo") {
      return this._openMeteoAirQualityTile() || this._sensorAirQualityTile();
    }
    return this._sensorAirQualityTile();
  }

  _sensorAirQualityTile() {
    const state = this._entityState(this._config.air_quality_entity, isRadarWiseAirQualityEntity);
    if (!state) return null;
    const severity = this._airQualitySeverity(state.state);
    return {
      kind: "aqi",
      label: this._t("airQuality"),
      value: this._formatSensorState(state, "AQI"),
      note: this._t(severity.key),
      level: severity.level
    };
  }

  _pollenTile() {
    if (this._config.environment_source === "open_meteo") {
      return this._openMeteoPollenTile() || this._sensorPollenTile();
    }
    return this._sensorPollenTile();
  }

  _openMeteoAirQualityTile() {
    const aqi = this._environmentData?.aqi;
    if (!aqi || !Number.isFinite(aqi.value)) return null;
    const severity = this._airQualitySeverity(aqi.value);
    return {
      kind: "aqi",
      label: this._t("airQuality"),
      value: this._formatEnvironmentNumber(aqi.value, aqi.unit || "AQI"),
      note: this._t(severity.key),
      level: severity.level
    };
  }

  _openMeteoPollenTile() {
    const pollen = this._environmentData?.pollen;
    if (!pollen || !Number.isFinite(pollen.value)) return null;
    const severity = this._pollenSeverity(pollen.value);
    return {
      kind: "pollen",
      label: this._t(pollen.labelKey || "pollen"),
      value: this._formatEnvironmentNumber(pollen.value, pollen.unit || "grains/m3"),
      note: this._t(severity.key),
      level: severity.level
    };
  }

  _sensorPollenTile() {
    const entries = [
      { configKey: "pollen_entity", labelKey: "pollen", kind: "" },
      { configKey: "tree_pollen_entity", labelKey: "treePollen", kind: "tree" },
      { configKey: "grass_pollen_entity", labelKey: "grassPollen", kind: "grass" },
      { configKey: "weed_pollen_entity", labelKey: "weedPollen", kind: "weed" },
      { configKey: "mold_pollen_entity", labelKey: "moldPollen", kind: "mold" }
    ].map((entry) => {
      const state = this._entityState(this._config[entry.configKey], (entityId, entityState) => isRadarWisePollenEntity(entityId, entityState, entry.kind));
      if (!state) return null;
      const severity = this._pollenSeverity(state.state);
      return {
        ...entry,
        state,
        severity,
        value: this._formatSensorState(state),
        rank: severity.rank
      };
    }).filter(Boolean);

    if (!entries.length) return null;
    const generic = entries.find((entry) => entry.configKey === "pollen_entity");
    const strongestSource = entries
      .filter((entry) => entry.configKey !== "pollen_entity")
      .sort((a, b) => b.rank - a.rank)[0];
    const chosen = generic || strongestSource || entries[0];
    const sourceNote = generic && strongestSource && strongestSource.rank >= 3
      ? `${this._t(strongestSource.labelKey)}: ${this._t(strongestSource.severity.key)}`
      : this._t(chosen.severity.key);

    return {
      kind: "pollen",
      label: generic ? this._t("pollen") : this._t(chosen.labelKey),
      value: chosen.value,
      note: sourceNote,
      level: (strongestSource || chosen).severity.level
    };
  }

  _formatEnvironmentNumber(value, unit = "") {
    const number = this._numberOr(value, NaN);
    if (!Number.isFinite(number)) return "--";
    const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
    const unitText = String(unit || "").trim();
    return `${rounded}${unitText ? ` ${unitText}` : ""}`.trim();
  }

  _entityState(entityId, predicate) {
    if (!entityId) return null;
    const state = this._hass?.states?.[entityId];
    if (!state || state.state === "unknown" || state.state === "unavailable") return null;
    return predicate(entityId, state) ? state : null;
  }

  _formatSensorState(state, fallbackUnit = "") {
    const raw = state?.state;
    const unit = state?.attributes?.unit_of_measurement || state?.attributes?.native_unit_of_measurement || fallbackUnit;
    const number = this._numberOr(raw, NaN);
    if (Number.isFinite(number)) {
      const rounded = Math.abs(number) < 10 ? Math.round(number * 10) / 10 : Math.round(number);
      const unitText = unit ? ` ${unit}` : "";
      return `${rounded}${unitText}`.trim();
    }
    return this._titleCase(raw);
  }

  _airQualitySeverity(value) {
    const raw = String(value || "").toLowerCase();
    const number = this._numberOr(value, NaN);
    if (Number.isFinite(number)) {
      if (number <= 50) return { key: "good", level: "good", rank: 1 };
      if (number <= 100) return { key: "moderate", level: "moderate", rank: 2 };
      if (number <= 150) return { key: "unhealthySensitive", level: "sensitive", rank: 3 };
      if (number <= 200) return { key: "unhealthy", level: "unhealthy", rank: 4 };
      if (number <= 300) return { key: "veryUnhealthy", level: "very-high", rank: 5 };
      return { key: "hazardous", level: "hazardous", rank: 6 };
    }
    if (raw.includes("hazard")) return { key: "hazardous", level: "hazardous", rank: 6 };
    if (raw.includes("very") && raw.includes("unhealthy")) return { key: "veryUnhealthy", level: "very-high", rank: 5 };
    if (raw.includes("unhealthy")) return { key: "unhealthy", level: "unhealthy", rank: 4 };
    if (raw.includes("moderate")) return { key: "moderate", level: "moderate", rank: 2 };
    if (raw.includes("good")) return { key: "good", level: "good", rank: 1 };
    return { key: "unknown", level: "neutral", rank: 0 };
  }

  _pollenSeverity(value) {
    const raw = String(value || "").toLowerCase();
    const number = this._numberOr(value, NaN);
    if (Number.isFinite(number)) {
      if (number <= 2.4) return { key: "low", level: "good", rank: 1 };
      if (number <= 4.8) return { key: "moderate", level: "moderate", rank: 2 };
      if (number <= 7.2) return { key: "high", level: "unhealthy", rank: 3 };
      return { key: "veryHigh", level: "very-high", rank: 4 };
    }
    if (raw.includes("very") || raw.includes("extreme")) return { key: "veryHigh", level: "very-high", rank: 4 };
    if (raw.includes("high")) return { key: "high", level: "unhealthy", rank: 3 };
    if (raw.includes("moderate") || raw.includes("medium")) return { key: "moderate", level: "moderate", rank: 2 };
    if (raw.includes("low")) return { key: "low", level: "good", rank: 1 };
    return { key: "unknown", level: "neutral", rank: 0 };
  }

  _environmentIcon(kind) {
    if (kind === "aqi") {
      return `<svg viewBox="0 0 24 24" fill="none"><path d="M4 14c2.6-3.2 5.4-3.2 8 0s5.4 3.2 8 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 9c2.3-2.6 4.7-2.6 7 0s4.7 2.6 7 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".65"/><circle cx="7" cy="18" r="1.6" fill="#65b8df"/><circle cx="13" cy="18" r="1.6" fill="#e8b84b"/><circle cx="19" cy="18" r="1.6" fill="#f97316"/></svg>`;
    }
    return `<svg viewBox="0 0 24 24" fill="none"><path d="M12 20c0-7 2.5-12 7-15" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M12 14C8.5 14 6 11.5 6 8c3.8 0 6 2.5 6 6Z" fill="#7ecb8f"/><path d="M13 12c3.4-.2 5.5-2.2 5.8-5.6-3.2.2-5.4 2.1-5.8 5.6Z" fill="#9bd779"/><path d="M8 18h8" stroke="#e8b84b" stroke-width="2" stroke-linecap="round"/></svg>`;
  }

  async _initRadar(provider) {
    const holder = this.shadowRoot?.getElementById("rmap");
    if (!holder || this._radarMap) return;
    try {
      await this._loadLeaflet();
      if (!window.L || !holder.isConnected) return;
      const { lat, lon } = this._latLon();
      const isBom = provider === "bom";
      this._radarMap = window.L.map(holder, {
        center: [lat, lon],
        zoom: isBom
          ? Math.max(3, Math.min(BOM_MAX_DISPLAY_ZOOM, Number(this._config.radar_zoom) || 6))
          : Number(this._config.radar_zoom) || 7,
        minZoom: isBom ? 3 : undefined,
        maxZoom: isBom ? BOM_MAX_DISPLAY_ZOOM : undefined,
        zoomControl: this._config.show_map_controls !== false,
        attributionControl: true
      });
      if (isBom) this._addBomBasemapLayer();
      else this._addBasemapLayer();
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
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
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
    if (!document.querySelector("link[data-radarwise-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.radarwiseLeaflet = "true";
      document.head.appendChild(link);
    }
    window.__weatherWiseLeafletPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-radarwise-leaflet]");
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
        script.dataset.radarwiseLeaflet = "true";
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
    if (this._config.radar_provider === "bom") return "bom";
    if (this._config.radar_provider === "rainviewer") return "rainviewer";
    if (this._config.country === "us") return "noaa";
    if (this._config.country === "ca") return "envcanada";
    if (this._config.country === "au") return "bom";
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
    if (provider === "bom") {
      await this._loadBomLoop();
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

  async _loadBomLoop() {
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const frames = this._bomFrames();
    const selectedFrames = this._config.radar_timeline === "latest" || this._config.radar_timeline === "future" ? frames.slice(-1) : frames;
    this._bomTileErrorCount = 0;
    this._bomFallbackStarted = false;
    this._radarLabelText = selectedFrames.length === 1 ? `BOM ${this._t("currentRadar")}` : `BOM ${this._t("radarLoop")}`;
    this._replaceRadarLayers(selectedFrames.map((frameTime, index, list) => ({
      time: frameTime,
      layer: this._createBomTileLayer(this._bomTimestamp(frameTime), {
        opacity: index === list.length - 1 ? this._bomOpacity() : 0,
        zIndex: 25,
        noWrap: true,
        bounds: BOM_AUSTRALIA_BOUNDS,
        maxNativeZoom: BOM_MAX_NATIVE_ZOOM,
        maxZoom: BOM_MAX_DISPLAY_ZOOM,
        attribution: "Radar &copy; Bureau of Meteorology"
      })
    })));
    if (label) label.textContent = `${this._shortTime(selectedFrames.at(-1))} ${this._radarLabelText}`;
    this._animateRadar(this._radarLabelText);
  }

  _bomFrames() {
    const stepMs = BOM_WMTS_LAYER.stepMinutes * 60 * 1000;
    const lagMs = BOM_WMTS_LAYER.lagMinutes * 60 * 1000;
    const roundedNow = Math.floor((Date.now() - lagMs) / stepMs) * stepMs;
    return Array.from({ length: 12 }, (_, i) => new Date(roundedNow - (11 - i) * stepMs));
  }

  _bomTimestamp(frameTime) {
    return frameTime.toISOString().replace(/\.\d{3}Z$/, "Z");
  }

  _createBomTileLayer(time, options = {}) {
    const card = this;
    const BomTileLayer = window.L.TileLayer.extend({
      getTileUrl(coords) {
        return card._bomTileUrl(coords, time);
      },
      createTile(coords, done) {
        const tile = document.createElement("img");
        tile.alt = "";
        const offset = card._bomTileOffset(coords.z);
        if (offset) {
          tile.style.marginLeft = `${offset.xShiftPx}px`;
          tile.style.marginTop = `${offset.yShiftPx}px`;
        }
        const url = this.getTileUrl(coords);
        if (!url) {
          tile.src = TRANSPARENT_PIXEL;
          window.setTimeout(() => done(null, tile), 0);
          return tile;
        }
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          done(null, tile);
        };
        tile.onload = finish;
        tile.onerror = () => {
          tile.onerror = null;
          card._bomTileErrorCount += 1;
          if (card._bomTileErrorCount >= 3) card._scheduleBomGifFallback();
          tile.src = TRANSPARENT_PIXEL;
          finish();
        };
        tile.src = url;
        return tile;
      }
    });
    return new BomTileLayer("", options);
  }

  _scheduleBomGifFallback() {
    if (this._bomFallbackStarted || this._resolvedRadarProvider() !== "bom") return;
    this._bomFallbackStarted = true;
    window.setTimeout(() => this._renderBomGifFallback(), 0);
  }

  _renderBomGifFallback() {
    const holder = this.shadowRoot?.getElementById("rmap");
    const label = this.shadowRoot?.getElementById("radar-lbl");
    const station = this._bomStation();
    if (!holder || !station) {
      if (label) label.textContent = this._t("radarUnavailable");
      return;
    }
    this._teardownRadar();
    this._bomFallbackStarted = true;
    const controls = this.shadowRoot?.querySelector(".radar-controls");
    if (controls) controls.setAttribute("hidden", "");
    holder.innerHTML = `
      <div class="bom-fallback-radar">
        <img class="bom-fallback-image" alt="${_wwEscape(station.name)} BOM radar loop">
      </div>
    `;
    const img = holder.querySelector(".bom-fallback-image");
    const updateImage = () => {
      const cacheKey = Math.floor(Date.now() / (5 * 60 * 1000));
      img.src = `${BOM_GIF_HOST}/radar/${station.id}.gif?_=${cacheKey}`;
    };
    img.onload = () => {
      if (label) label.textContent = `${station.name} BOM ${this._t("radarLoop")}`;
    };
    img.onerror = () => {
      if (label) label.textContent = `BOM ${this._t("radarUnavailable")}`;
    };
    updateImage();
    this._radarTimer = window.setInterval(updateImage, 5 * 60 * 1000);
  }

  _bomTileUrl(coords, time) {
    const offset = this._bomTileOffset(coords.z);
    if (!offset) return "";
    const col = coords.x - offset.xOffset;
    const row = coords.y - offset.yOffset;
    if (col < 0 || col >= offset.width || row < 0 || row >= offset.height) return "";
    return `${BOM_WMTS_BASE}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0` +
      `&LAYER=${BOM_WMTS_LAYER.id}&STYLE=default&FORMAT=image/png` +
      `&TILEMATRIXSET=${BOM_WMTS_LAYER.matrixSet}&TILEMATRIX=${coords.z}` +
      `&TILEROW=${row}&TILECOL=${col}&time=${encodeURIComponent(time)}`;
  }

  _bomTileOffset(z) {
    const info = BOM_TILE_MATRIX_SETS[BOM_WMTS_LAYER.matrixSet]?.[z];
    if (!info) return null;
    const tileSpan = BOM_WORLD_EXTENT / Math.pow(2, z);
    const xOffset = Math.round((info.tlx + BOM_HALF_EXTENT) / tileSpan);
    const yOffset = Math.round((BOM_HALF_EXTENT - info.tly) / tileSpan);
    return {
      xOffset,
      yOffset,
      xShiftPx: (((info.tlx + BOM_HALF_EXTENT) / tileSpan) - xOffset) * 256,
      yShiftPx: (((BOM_HALF_EXTENT - info.tly) / tileSpan) - yOffset) * 256,
      width: info.w,
      height: info.h
    };
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
    const opacity = this._resolvedRadarProvider() === "bom" ? this._bomOpacity() : this._radarOpacity();
    this._radarLayers.forEach((item, layerIndex) => item.layer.setOpacity(layerIndex === index ? opacity : 0));
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

  _bomStation() {
    const { lat, lon } = this._latLon();
    return BOM_RADARS.reduce((nearest, station) => {
      const distance = this._distanceKm(lat, lon, station.lat, station.lon);
      return !nearest || distance < nearest.distance ? { ...station, distance } : nearest;
    }, null);
  }

  _bomBounds(station) {
    const rangeKm = 128;
    const latRadius = rangeKm / 111.32;
    const lonRadius = rangeKm / (111.32 * Math.max(0.2, Math.cos(station.lat * Math.PI / 180)));
    return [
      [station.lat - latRadius, station.lon - lonRadius],
      [station.lat + latRadius, station.lon + lonRadius]
    ];
  }

  _distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (value) => value * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

  _bomOpacity() {
    const values = { standard: 0.9, vivid: 1, soft: 0.78 };
    return values[this._config.radar_style] ?? values.standard;
  }

  _addBasemapLayer() {
    const basemap = this._basemap();
    const fallback = this._basemap("light");
    let failed = false;
    const layer = window.L.tileLayer(basemap.url, basemap.options).addTo(this._radarMap);
    layer.on?.("tileerror", () => {
      if (failed || !this._radarMap || basemap.url === fallback.url) return;
      failed = true;
      layer.remove?.();
      window.L.tileLayer(fallback.url, fallback.options).addTo(this._radarMap);
    });
  }

  _addBomBasemapLayer() {
    const dark = this._config.radar_basemap === "dark";
    const url = dark ? BOM_BASEMAPS.dark : BOM_BASEMAPS.default;
    window.L.tileLayer(url, {
      maxNativeZoom: 10,
      maxZoom: BOM_MAX_DISPLAY_ZOOM,
      noWrap: true,
      bounds: BOM_AUSTRALIA_BOUNDS,
      attribution: "&copy; Bureau of Meteorology"
    }).addTo(this._radarMap);
  }

  _basemap(kind = this._config.radar_basemap) {
    const basemaps = {
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      },
      osm: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      },
      light: {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        options: { subdomains: "abcd", maxZoom: 19, attribution: "&copy; OpenStreetMap &copy; CARTO" }
      }
    };
    return basemaps[kind] || basemaps.light;
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
          "User-Agent": `RadarWise/${CARD_VERSION} (github.com/TheWillMiller/radar-wise)`,
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
      const popupHtml = this._alertsPopup(features);
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
        alert.textContent = `${features.length} ${this._t(features.length === 1 ? "nwsAlertTap" : "nwsAlertsTap")}`;
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

  _alertsPopup(features) {
    const items = (features || [])
      .map((feature, index) => this._alertPopup(feature?.properties || {}, index + 1, features.length))
      .join("");
    return items ? `<div class="alert-popup-list">${items}</div>` : this._alertPopup({});
  }

  _alertPopup(props, index = NaN, total = NaN) {
    const event = _wwEscape(props.event || this._t("weatherAlert"));
    const headline = _wwEscape(props.headline || "");
    const severity = _wwEscape(props.severity || this._t("unknown"));
    const alertNumber = Number(index);
    const alertTotal = Number(total);
    const count = Number.isFinite(alertNumber) && Number.isFinite(alertTotal) && alertTotal > 1
      ? `<span class="alert-popup-count">${alertNumber}/${alertTotal}</span>`
      : "";
    return `
      <div class="alert-popup-item">
        <div class="alert-popup-heading"><strong>${event}</strong>${count}</div>
        ${headline ? `<div class="alert-popup-headline">${headline}</div>` : ""}
        <div class="alert-popup-severity">${_wwEscape(this._t("severity"))}: ${severity}</div>
      </div>
    `;
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
    if (state && isRadarWiseTemperatureEntity(entityId, state)) {
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

  _candidateNumber(value) {
    if (value && typeof value === "object") {
      return this._numberOr(value.value ?? value.native_value ?? value.state, NaN);
    }
    return this._numberOr(value, NaN);
  }

  _forecastCandidate(forecastSources, keys) {
    for (const periods of forecastSources || []) {
      if (!Array.isArray(periods)) continue;
      for (const item of periods.slice(0, 12)) {
        for (const key of keys) {
          const raw = item?.[key];
          if (raw === undefined || raw === null || raw === "") continue;
          const value = this._candidateNumber(raw);
          if (Number.isFinite(value)) {
            return { raw, value, source: `forecast.${key}` };
          }
        }
      }
    }
    return { raw: undefined, value: NaN, source: "missing" };
  }

  _humidityInfo(attrs, forecastSources = []) {
    const configuredEntityId = this._config.humidity_entity;
    const configuredState = configuredEntityId ? this._hass?.states?.[configuredEntityId] : null;
    const configured = isRadarWiseHumidityEntity(configuredEntityId, configuredState) ? configuredState : null;
    const candidates = [
      { raw: configured?.state, source: configuredEntityId ? `entity.${configuredEntityId}` : "entity.auto" },
      { raw: attrs.humidity, source: "weather.attributes.humidity" },
      { raw: attrs.relative_humidity, source: "weather.attributes.relative_humidity" },
      { raw: attrs.relativeHumidity, source: "weather.attributes.relativeHumidity" },
      { raw: attrs.native_humidity, source: "weather.attributes.native_humidity" }
    ];
    for (const candidate of candidates) {
      const value = this._candidateNumber(candidate.raw);
      if (Number.isFinite(value)) {
        return { value, display: String(Math.round(value)), source: candidate.source, raw: candidate.raw };
      }
    }
    const forecast = this._forecastCandidate(forecastSources, ["humidity", "relative_humidity", "relativeHumidity", "native_humidity"]);
    if (Number.isFinite(forecast.value)) {
      return { ...forecast, display: String(Math.round(forecast.value)) };
    }
    return { value: NaN, display: "--", source: "missing", raw: undefined };
  }

  _humidity(attrs, forecastSources = []) {
    return this._humidityInfo(attrs, forecastSources).display;
  }

  _dewPointInfo(attrs, units, forecastSources = []) {
    const configuredEntityId = this._config.dew_point_entity;
    const configuredState = configuredEntityId ? this._hass?.states?.[configuredEntityId] : null;
    if (configuredState && isRadarWiseDewPointEntity(configuredEntityId, configuredState)) {
      const value = {
        value: configuredState.state,
        unit: configuredState.attributes?.unit_of_measurement || configuredState.attributes?.native_unit_of_measurement || this._hass?.config?.unit_system?.temperature
      };
      return {
        value: this._tempValue(value, units),
        display: this._displayTemp(value, units, false),
        source: `entity.${configuredEntityId}`,
        raw: configuredState.state
      };
    }
    const candidates = [
      { raw: attrs.dew_point, source: "weather.attributes.dew_point" },
      { raw: attrs.dewpoint, source: "weather.attributes.dewpoint" },
      { raw: attrs.dewPoint, source: "weather.attributes.dewPoint" },
      { raw: attrs.native_dew_point, source: "weather.attributes.native_dew_point" },
      { raw: attrs.native_dewpoint, source: "weather.attributes.native_dewpoint" },
      { raw: attrs.dew_point_temperature, source: "weather.attributes.dew_point_temperature" },
      { raw: attrs.dewpoint_temperature, source: "weather.attributes.dewpoint_temperature" }
    ];
    for (const candidate of candidates) {
      if (candidate.raw === undefined || candidate.raw === null || candidate.raw === "") continue;
      return {
        value: this._tempValue(candidate.raw, units),
        display: this._displayTemp(candidate.raw, units, false),
        source: candidate.source,
        raw: candidate.raw
      };
    }
    const forecast = this._forecastCandidate(forecastSources, ["dew_point", "dewpoint", "dewPoint", "native_dew_point", "native_dewpoint", "dew_point_temperature", "dewpoint_temperature"]);
    if (Number.isFinite(forecast.value)) {
      return {
        ...forecast,
        display: this._displayTemp(forecast.raw, units, false)
      };
    }
    return { value: NaN, display: "--", source: "missing", raw: undefined };
  }

  _dewPoint(attrs, units, forecastSources = []) {
    return this._dewPointInfo(attrs, units, forecastSources).display;
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
    if (this._uses24HourTime()) return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${(date.getHours() % 12) || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  _clockAmPm(date) {
    return this._uses24HourTime() ? "" : date.getHours() >= 12 ? this._t("pm") : this._t("am");
  }

  _shortTime(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    if (this._uses24HourTime()) return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${(date.getHours() % 12) || 12}:${String(date.getMinutes()).padStart(2, "0")} ${date.getHours() >= 12 ? this._t("pm") : this._t("am")}`;
  }

  _hour(dateLike) {
    const date = new Date(dateLike);
    if (Number.isNaN(date.getTime())) return "--";
    if (this._uses24HourTime()) return `${String(date.getHours()).padStart(2, "0")}:00`;
    return `${(date.getHours() % 12) || 12} ${date.getHours() >= 12 ? this._t("pm") : this._t("am")}`;
  }

  _uses24HourTime() {
    const configured = String(this._config.time_format || "auto");
    if (configured === "24") return true;
    if (configured === "12") return false;
    const haFormat = String(this._hass?.locale?.time_format || "").toLowerCase();
    if (haFormat.includes("24")) return true;
    if (haFormat.includes("12")) return false;
    try {
      const options = new Intl.DateTimeFormat(this._localeCode(), { hour: "numeric" }).resolvedOptions();
      if (options.hourCycle) return options.hourCycle === "h23" || options.hourCycle === "h24";
      const parts = new Intl.DateTimeFormat(this._localeCode(), { hour: "numeric" }).formatToParts(new Date(2020, 0, 1, 13));
      return !parts.some((part) => part.type === "dayPeriod");
    } catch (err) {
      return false;
    }
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
      ha-card{background:transparent!important;box-shadow:none!important;border-radius:22px!important;overflow:hidden;font-family:var(--radarwise-font-family,inherit)}
      *{box-sizing:border-box}
      .card-outer{container-type:inline-size;background:rgba(232,246,250,0.74);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:22px;border:1px solid rgba(255,255,255,0.42);box-shadow:0 4px 28px rgba(0,0,0,0.10);position:relative;overflow:hidden}
      :host([theme-mode="auto"]) .card-outer{background:linear-gradient(135deg,color-mix(in srgb,var(--card-background-color,#fff) 88%,transparent),color-mix(in srgb,var(--primary-color,#2a7a94) 14%,var(--card-background-color,#fff)))}
      .card-outer::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--ww-wave) 62%,transparent),transparent)}
      .card-grid{display:grid;grid-template-columns:minmax(0,var(--ww-col1,1fr)) minmax(0,var(--ww-col2,2fr)) minmax(0,var(--ww-col3,1fr));height:var(--radarwise-card-height,clamp(450px,24cqw,540px));min-height:0;max-height:var(--radarwise-card-max-height,580px)}
      .card-grid.no-radar{grid-template-columns:minmax(260px,34%) minmax(0,1fr)}
      .left{min-width:0;display:flex;flex-direction:column;padding:18px 22px 10px;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08));border-right:1px solid rgba(255,255,255,0.22);overflow:hidden;order:var(--ww-left-order,1)}
      .center{order:var(--ww-center-order,2)}.right{order:var(--ww-right-order,3)}
      .clock-panel{flex-shrink:0}
      .clock-context{display:grid;grid-template-columns:minmax(0,1fr) minmax(116px,.82fr);align-items:start;gap:10px;margin-bottom:12px}
      .clock-context.no-env{display:block;margin-bottom:0}
      .clock-main{min-width:0}
      .clock-row{display:flex;align-items:baseline;gap:8px;line-height:1}
      .clock-time{font-size:78px;font-weight:550;color:var(--ww-text);letter-spacing:0}
      .clock-ampm{font-size:22px;font-weight:850;color:var(--ww-muted)}
      .clock-date{font-size:19px;color:var(--ww-muted);font-weight:850;margin-top:10px;margin-bottom:0}
      .clock-context.no-env .clock-date{margin-bottom:16px}
      .environment-strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px;min-width:0}
      .env-tile{display:grid;grid-template-columns:25px minmax(0,1fr);align-items:center;gap:8px;min-width:0;min-height:56px;padding:8px 9px;border-radius:12px;background:rgba(255,255,255,.25);border:1px solid var(--ww-line);box-shadow:inset 0 1px 0 rgba(255,255,255,.22)}
      .env-ico{width:25px;height:25px;color:var(--ww-wave);display:grid;place-items:center}
      .env-ico svg{width:25px;height:25px}
      .env-copy{min-width:0}
      .env-lbl{font-size:10px;line-height:1.05;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-val{font-size:16px;line-height:1.05;color:var(--ww-text);font-weight:950;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-note{font-size:10px;line-height:1.05;color:var(--ww-muted);font-weight:850;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .env-good{border-color:rgba(34,197,94,.24)}.env-good .env-note{color:#166534}
      .env-moderate{border-color:rgba(234,179,8,.28)}.env-moderate .env-note{color:#854d0e}
      .env-sensitive,.env-unhealthy,.env-very-high,.env-hazardous{border-color:rgba(185,28,28,.30);background:rgba(254,242,242,.32)}
      .env-sensitive .env-note,.env-unhealthy .env-note,.env-very-high .env-note,.env-hazardous .env-note{color:#7f1d1d}
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
      .center{min-width:0;display:flex;flex-direction:column;padding:18px 24px;border-right:1px solid rgba(255,255,255,0.22);overflow:hidden;container-type:inline-size;container-name:ww-center}
      .current-row{display:flex;align-items:center;gap:18px;margin-bottom:12px;min-width:0;min-height:86px;overflow:visible}
      .current-icon{width:72px;height:72px;flex-shrink:0;display:grid;place-items:center}
      .cond-block{flex:1;min-width:0}
      .cond-name-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;min-width:0}
      .cond-name{font-size:36px;font-weight:800;color:var(--ww-text);line-height:1.05;overflow-wrap:anywhere}
      .current-uv{display:inline-grid;grid-template-columns:auto auto;grid-template-areas:"label value" "note note";align-items:center;column-gap:6px;row-gap:1px;padding:5px 9px;border:1px solid var(--ww-line);border-radius:999px;background:rgba(255,255,255,.24);box-shadow:inset 0 1px 0 rgba(255,255,255,.20);line-height:1;white-space:nowrap}
      .current-uv span{grid-area:label;font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--ww-muted)}
      .current-uv strong{grid-area:value;font-size:16px;font-weight:950;color:var(--ww-text)}
      .current-uv em{grid-area:note;font-size:10px;font-style:normal;font-weight:850;color:var(--ww-muted);text-align:right}
      .uv-good{border-color:rgba(34,197,94,.24)}.uv-good em{color:#166534}
      .uv-moderate{border-color:rgba(234,179,8,.28)}.uv-moderate em{color:#854d0e}
      .uv-unhealthy,.uv-very-high,.uv-hazardous{border-color:rgba(185,28,28,.30);background:rgba(254,242,242,.32)}
      .uv-unhealthy em,.uv-very-high em,.uv-hazardous em{color:#7f1d1d}
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
      .fc-range{font-size:13px;font-weight:900;color:var(--ww-muted);line-height:1;min-height:14px;text-align:center;white-space:nowrap}
      .fc-precip{font-size:12px;font-weight:900;color:var(--ww-muted);line-height:1;min-height:13px;text-align:center;white-space:nowrap}
      .stats-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:6px;flex-shrink:0}
      .custom-sensors-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:10px;margin-top:10px;flex-shrink:0}
      .stat{background:var(--ww-panel);border:1px solid var(--ww-line);border-radius:12px;padding:10px 13px;display:flex;align-items:center;gap:11px;min-height:66px;min-width:0}
      .stat>div:last-child{min-width:0}
      .stat-ico{width:27px;height:27px;flex:0 0 27px;color:var(--ww-wave)}
      .stat-ico svg{width:27px;height:27px}
      .stat-ico ha-icon{width:27px;height:27px;color:var(--ww-wave)}
      .custom-sensor-stat{min-height:60px}
      .stat-lbl{font-size:12px;color:var(--ww-muted);font-weight:900;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
      .stat-val{font-size:19px;font-weight:900;color:var(--ww-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal;word-break:normal;line-height:1.08}
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
      .bom-fallback-radar{width:100%;height:100%;display:grid;place-items:center;background:#d7dee2;overflow:hidden}
      .bom-fallback-image{display:block;width:100%;height:100%;object-fit:contain;image-rendering:auto}
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
      .radar-controls[hidden]{display:none}
      .radar-controls button{width:31px;height:31px;border:1px solid rgba(255,255,255,.62);border-radius:999px;background:rgba(255,255,255,.78);color:#0a1e2e;box-shadow:0 2px 10px rgba(10,30,46,.12);font:800 15px/1 var(--ha-font-family-body,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif);display:grid;place-items:center;cursor:pointer;padding:0}
      .radar-controls button:hover{background:rgba(255,255,255,.94)}
      .leaflet-control-zoom{border:0!important;box-shadow:0 2px 12px rgba(10,30,46,.13)!important}
      .leaflet-control-zoom a{width:34px!important;height:34px!important;line-height:31px!important;color:#0a1e2e!important;background:rgba(255,255,255,.82)!important;border-color:rgba(10,30,46,.10)!important;font-weight:650!important}
      .leaflet-control-attribution{background:rgba(255,255,255,.70)!important;color:rgba(10,30,46,.72)!important}
      .leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}
      .leaflet-popup-content-wrapper{background:rgba(255,255,255,.96);color:#0a1e2e;border-radius:12px;box-shadow:0 4px 18px rgba(10,30,46,.22);border:1px solid rgba(10,30,46,.12);padding:1px;text-align:left}
      .leaflet-popup-content{font-size:13px;line-height:1.35;margin:12px 14px;min-width:180px;max-width:320px}
      .alert-popup-list{display:flex;flex-direction:column;gap:10px;max-height:260px;overflow:auto;overscroll-behavior:contain;padding-right:2px}
      .alert-popup-item{min-width:0}
      .alert-popup-item+.alert-popup-item{border-top:1px solid rgba(10,30,46,.12);padding-top:10px}
      .alert-popup-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;font-weight:900}
      .alert-popup-count{font-size:11px;color:#7f1d1d;background:rgba(254,242,242,.86);border:1px solid rgba(185,28,28,.20);border-radius:999px;padding:1px 7px;white-space:nowrap}
      .alert-popup-headline{margin-top:4px}
      .alert-popup-severity{margin-top:4px;color:rgba(10,30,46,.74);font-weight:750}
      .leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}
      .leaflet-popup-tip{width:14px;height:14px;padding:1px;margin:-8px auto 0;background:rgba(255,255,255,.96);transform:rotate(45deg);box-shadow:0 4px 14px rgba(10,30,46,.18)}
      .leaflet-popup-close-button{position:absolute;top:4px;right:8px;border:0;background:transparent;color:#0a1e2e;text-decoration:none;font-size:18px;font-weight:900;line-height:1;cursor:pointer}
      .loading-note{font-size:12px;color:var(--ww-muted);font-weight:800;opacity:.8;padding:10px}
      .daily-strip>.loading-note{grid-column:1 / -1;align-self:center}
      .debug-panel{margin:10px 18px 18px;background:rgba(255,255,255,.78);border:1px solid var(--ww-line);border-radius:14px;padding:0;font-size:12px;color:var(--ww-muted);max-height:min(420px,52vh);overflow:auto;overscroll-behavior:contain;box-shadow:0 10px 24px rgba(10,30,46,.12)}
      .debug-panel summary{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:6px;padding:9px 12px;background:rgba(255,255,255,.92);border-bottom:1px solid var(--ww-line);cursor:pointer;font-weight:900;color:var(--ww-text)}
      .debug-row{display:grid;grid-template-columns:minmax(130px,220px) minmax(0,1fr);gap:12px;padding:7px 12px;border-bottom:1px solid rgba(10,30,46,.07);align-items:start}
      .debug-row span{font-weight:800;color:var(--ww-muted)}
      .debug-row code{color:var(--ww-text);white-space:pre-wrap;word-break:break-word;text-align:left;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:11px;line-height:1.35}
      .card-grid.no-forecast .daily-strip{display:none}.card-grid.no-forecast .center{justify-content:center}
      .card-grid.panels-1{grid-template-columns:1fr}
      .card-grid.panels-2{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
      .card-grid.panels-1 .left,.card-grid.panels-1 .center,.card-grid.panels-1 .right{border-right:0;border-radius:22px}
      .card-grid.panels-2 .center:last-child,.card-grid.panels-2 .right:last-child{border-right:0;border-radius:0 22px 22px 0}
      .card-grid.content-radar{height:var(--radarwise-card-height,clamp(310px,20cqw,460px))}
      .card-grid.content-radar .right{border-radius:22px}
      .card-grid.content-radar #rmap{height:100%;min-height:260px}
      .card-grid.content-forecast{height:var(--radarwise-card-height,clamp(260px,18cqw,390px))}
      .card-grid.content-forecast .center{border-right:0;justify-content:stretch}
      .card-grid.content-forecast .daily-strip{min-height:0;max-height:none;margin-bottom:0}
      .card-grid.content-timeline{height:var(--radarwise-card-height,clamp(280px,18cqw,420px))}
      .card-grid.content-timeline .left{border-right:0}
      .card-grid.content-essentials{height:var(--radarwise-card-height,clamp(220px,16cqw,320px))}
      .card-grid.content-essentials .center{border-right:0}
      .card-grid.content-essentials .current-row{margin-bottom:10px}
      @container(max-width:1500px){.card-grid{height:var(--radarwise-card-height,clamp(440px,25cqw,520px))}.left{padding:14px 18px 10px}.center{padding:16px 20px}.clock-time{font-size:70px}.clock-date{font-size:18px;margin-bottom:11px}.forecast-summary{margin-bottom:11px}.forecast-summary-text{font-size:12px}.section-title,.current-label{font-size:15px}.temp-now{font-size:58px}.temp-hilo{font-size:18px}.cond-name{font-size:32px}.updated-note{font-size:13px}.daily-strip{min-height:172px;max-height:212px}.fc-day{font-size:20px}.fc-period{font-size:13px}.fc-icon{width:58px;height:58px}.fc-icon svg{width:54px;height:54px}.fc-temp{font-size:43px}.hour-row{grid-template-columns:50px 24px 42px minmax(52px,1fr) minmax(38px,max-content);gap:7px;min-height:32px}.hour-time-left{font-size:14px}.hour-temp-left{font-size:15px}.hour-precip{font-size:11px}.stat{padding:9px 11px;gap:9px;min-height:62px}.stat-lbl{font-size:11px}.stat-val{font-size:17px}}
      @container ww-center (max-width:680px){.current-row{gap:14px;min-height:74px}.current-icon{width:58px;height:58px}.cond-name{font-size:clamp(24px,8cqw,32px)}.updated-note{font-size:12px;margin-top:5px}.temp-now{font-size:clamp(42px,12cqw,58px)}.temp-hilo{font-size:16px;margin-top:5px}.daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(92px,1fr));gap:8px;min-height:158px;max-height:196px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;flex:none}.daily-strip::-webkit-scrollbar{display:none}.fc-slot{padding:8px 6px}.fc-day{font-size:18px}.fc-period{font-size:11px;min-height:12px}.fc-icon{width:48px;height:48px;margin:2px 0}.fc-icon svg{width:44px;height:44px}.fc-temp{font-size:34px}.fc-range,.fc-precip{font-size:10px;min-height:11px}.stats-row,.custom-sensors-row{grid-template-columns:repeat(auto-fit,minmax(92px,1fr));gap:8px}.custom-sensors-row{margin-top:8px}.stat{min-height:52px;padding:8px 9px;gap:8px}.stat-ico,.stat-ico svg,.stat-ico ha-icon{width:22px;height:22px}.stat-ico{flex-basis:22px}.stat-lbl{font-size:10px;margin-bottom:2px}.stat-val{font-size:clamp(13px,4.8cqw,16px)}}
      @container ww-center (max-width:480px){.daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(86px,1fr));min-height:148px}.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.stat-val{font-size:14px}.current-row{align-items:flex-start;flex-wrap:wrap}.temp-block{text-align:left}}
      @container(max-width:980px){.card-grid:not(.layout-wide_panel){height:var(--radarwise-card-height,clamp(560px,58cqw,680px))}.card-grid:not(.layout-wide_panel) .center{border-right:0}.card-grid:not(.layout-wide_panel) .right{grid-column:1 / -1;height:240px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid:not(.layout-wide_panel) #rmap{height:240px}.card-grid:not(.layout-wide_panel) .daily-strip{min-height:150px;max-height:none}}
      .card-grid.layout-wide_panel{height:var(--radarwise-card-height,clamp(390px,22cqw,500px))}
      .card-grid.layout-stacked,.card-grid.layout-compact{display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.layout-stacked .left,.card-grid.layout-compact .left{display:contents}.card-grid.layout-stacked .clock-panel,.card-grid.layout-compact .clock-panel{order:1;padding:18px 22px 0;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}.card-grid.layout-stacked .center,.card-grid.layout-compact .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.layout-stacked .left>.section-title,.card-grid.layout-compact .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 22px;margin-top:4px}.card-grid.layout-stacked .hourly-left,.card-grid.layout-compact .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 22px 16px}.card-grid.layout-stacked .right,.card-grid.layout-compact .right{order:var(--ww-ord-radar,30);border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.layout-stacked .right,.card-grid.layout-stacked #rmap{height:300px;min-height:300px}.card-grid.layout-compact .right,.card-grid.layout-compact #rmap{height:220px;min-height:220px}.card-grid.layout-compact .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));min-height:150px}.card-grid.layout-compact .fc-slot:nth-child(n+4){display:none}
      @container(max-width:720px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}.card-grid.layout-wide_panel{display:grid;grid-template-columns:minmax(120px,24%) minmax(230px,1fr) minmax(150px,28%);height:360px;max-height:360px}.card-grid.layout-wide_panel .left{display:flex;padding:12px 10px}.card-grid.layout-wide_panel .center{padding:12px 10px}.card-grid.layout-wide_panel .clock-time{font-size:38px}.card-grid.layout-wide_panel .clock-date{font-size:12px;margin:5px 0 7px}.card-grid.layout-wide_panel .forecast-summary{min-height:26px;margin-bottom:8px}.card-grid.layout-wide_panel .forecast-summary-text{font-size:11px;padding:6px 14px}.card-grid.layout-wide_panel .current-icon{width:44px;height:44px}.card-grid.layout-wide_panel .cond-name{font-size:21px}.card-grid.layout-wide_panel .temp-now{font-size:38px}.card-grid.layout-wide_panel .daily-strip{grid-template-columns:repeat(var(--ww-forecast-count,5),minmax(70px,1fr));gap:6px;overflow:hidden}.card-grid.layout-wide_panel .fc-temp{font-size:28px}.card-grid.layout-wide_panel .stats-row,.card-grid.layout-wide_panel .custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.card-grid.layout-wide_panel .custom-sensors-row{margin-top:6px}.card-grid.layout-wide_panel .right,.card-grid.layout-wide_panel #rmap{height:100%;min-height:0}}
      @container(max-width:720px){.card-grid.layout-wide_panel .clock-context{grid-template-columns:1fr;gap:6px;margin-bottom:8px}.card-grid.layout-wide_panel .environment-strip{grid-template-columns:1fr;gap:5px}.card-grid.layout-wide_panel .env-tile{grid-template-columns:20px minmax(0,1fr);min-height:40px;padding:5px 7px}.card-grid.layout-wide_panel .env-ico,.card-grid.layout-wide_panel .env-ico svg{width:20px;height:20px}.card-grid.layout-wide_panel .env-lbl,.card-grid.layout-wide_panel .env-note{font-size:9px}.card-grid.layout-wide_panel .env-val{font-size:13px}.card-grid.layout-wide_panel .env-note{display:none}}
      @media(max-width:760px){.card-grid:not(.layout-wide_panel),.card-grid.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid:not(.layout-wide_panel) .left{display:contents}.card-grid:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30)}.clock-time{font-size:48px}.current-row{align-items:flex-start;gap:12px;flex-wrap:wrap}.temp-block{text-align:left}.card-grid:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.stats-row,.custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}.right,#rmap{height:300px;min-height:300px}}
      @media(prefers-reduced-motion:reduce){:host([animations]) .ww-sun-rays,:host([animations]) .ww-sun-core,:host([animations]) .ww-cloud,:host([animations]) .ww-rain,:host([animations]) .ww-snow,:host([animations]) .ww-bolt,:host([animations]) .ww-moon,:host([animations]) .ww-moon-glow,:host([animations]) .ww-fog,:host([animations]) .hour-row,:host([animations]) .fc-slot,:host([animations]) .forecast-summary-text{animation:none!important}:host([animations]) .hour-bar-fill{transition:none!important}}
      .card-grid.content-radar{height:var(--radarwise-card-height,clamp(310px,20cqw,460px));max-height:var(--radarwise-card-max-height,480px)}
      .card-grid.content-forecast{height:var(--radarwise-card-height,clamp(260px,18cqw,390px));max-height:var(--radarwise-card-max-height,420px)}
      .card-grid.content-timeline{height:var(--radarwise-card-height,clamp(280px,18cqw,420px));max-height:var(--radarwise-card-max-height,440px)}
      .card-grid.content-essentials{height:var(--radarwise-card-height,clamp(220px,16cqw,320px));max-height:var(--radarwise-card-max-height,340px)}
      .card-grid.density-slim{height:var(--radarwise-card-height,clamp(330px,18cqw,430px));max-height:var(--radarwise-card-max-height,450px)}
      .card-grid.density-slim .left{padding:11px 16px 8px}.card-grid.density-slim .center{padding:12px 18px}.card-grid.density-slim .clock-context{gap:8px;margin-bottom:8px}.card-grid.density-slim .clock-time{font-size:58px}.card-grid.density-slim .clock-ampm{font-size:18px}.card-grid.density-slim .clock-date{font-size:16px;margin-top:7px;margin-bottom:8px}.card-grid.density-slim .environment-strip{gap:6px}.card-grid.density-slim .env-tile{min-height:44px;padding:6px 8px}.card-grid.density-slim .env-ico,.card-grid.density-slim .env-ico svg{width:21px;height:21px}.card-grid.density-slim .env-lbl,.card-grid.density-slim .env-note{font-size:9px}.card-grid.density-slim .env-val{font-size:14px}.card-grid.density-slim .forecast-summary{min-height:25px;margin-bottom:8px}.card-grid.density-slim .forecast-summary-text{font-size:11px;padding:6px 14px}.card-grid.density-slim .section-title,.card-grid.density-slim .current-label{font-size:13px}.card-grid.density-slim .hourly-left{gap:6px}.card-grid.density-slim .hour-row{min-height:28px;max-height:38px;padding:4px 9px;grid-template-columns:46px 22px 38px minmax(45px,1fr) minmax(34px,max-content);gap:6px}.card-grid.density-slim .hour-time-left{font-size:13px}.card-grid.density-slim .hour-temp-left{font-size:14px}.card-grid.density-slim .hour-precip{font-size:10px}.card-grid.density-slim .current-row{min-height:64px;margin-bottom:8px;gap:12px}.card-grid.density-slim .current-icon{width:54px;height:54px}.card-grid.density-slim .cond-name{font-size:27px}.card-grid.density-slim .updated-note{font-size:11px;margin-top:4px}.card-grid.density-slim .temp-now{font-size:48px}.card-grid.density-slim .temp-hilo{font-size:15px;margin-top:4px}.card-grid.density-slim .daily-strip{min-height:130px;max-height:170px;gap:8px;margin-bottom:8px}.card-grid.density-slim .fc-slot{padding:7px 6px}.card-grid.density-slim .fc-day{font-size:17px}.card-grid.density-slim .fc-period{font-size:11px;min-height:12px}.card-grid.density-slim .fc-icon{width:46px;height:46px;margin:2px 0}.card-grid.density-slim .fc-icon svg{width:44px;height:44px}.card-grid.density-slim .fc-temp{font-size:34px}.card-grid.density-slim .fc-range,.card-grid.density-slim .fc-precip{font-size:10px;min-height:11px}.card-grid.density-slim .stats-row,.card-grid.density-slim .custom-sensors-row{gap:7px}.card-grid.density-slim .custom-sensors-row{margin-top:7px}.card-grid.density-slim .stat{min-height:48px;padding:7px 9px;gap:8px}.card-grid.density-slim .stat-ico,.card-grid.density-slim .stat-ico svg,.card-grid.density-slim .stat-ico ha-icon{width:22px;height:22px;flex-basis:22px}.card-grid.density-slim .stat-lbl{font-size:10px;margin-bottom:2px}.card-grid.density-slim .stat-val{font-size:15px}
      .card-grid.density-large{height:var(--radarwise-card-height,clamp(500px,28cqw,620px));max-height:var(--radarwise-card-max-height,660px)}
      .card-grid.density-large .clock-time{font-size:88px}.card-grid.density-large .clock-date{font-size:22px}.card-grid.density-large .cond-name{font-size:42px}.card-grid.density-large .temp-now{font-size:78px}.card-grid.density-large .daily-strip{min-height:220px;max-height:270px}.card-grid.density-large .fc-temp{font-size:58px}.card-grid.density-large .stat{min-height:76px}.card-grid.density-large .stat-val{font-size:22px}
      .card-grid.content-radar.density-slim{height:var(--radarwise-card-height,clamp(230px,16cqw,360px))}
      .card-grid.content-forecast.density-slim{height:var(--radarwise-card-height,clamp(210px,15cqw,320px))}
      .card-grid.content-timeline.density-slim{height:var(--radarwise-card-height,clamp(220px,15cqw,340px))}
      .card-grid.content-essentials.density-slim{height:var(--radarwise-card-height,clamp(190px,13cqw,270px))}

      .card-grid.layout-radar_bottom{display:grid;grid-template-columns:minmax(310px,28%) minmax(0,1fr);grid-template-rows:clamp(420px,28cqw,540px) 340px;height:auto;max-height:none}
      .card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1;overflow:hidden}
      .card-grid.layout-radar_bottom .center{grid-column:2;grid-row:1;border-right:0;overflow:hidden}
      .card-grid.layout-radar_bottom .right{grid-column:1/-1;grid-row:2;height:340px;min-height:340px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px;position:relative;z-index:0}
      .card-grid.layout-radar_bottom #rmap{height:340px;min-height:340px}
      .card-grid.ww-force-stack:not(.layout-wide_panel),.card-grid.ww-force-stack.no-radar:not(.layout-wide_panel){display:flex;flex-direction:column;height:auto;max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .left{display:contents}.card-grid.ww-force-stack:not(.layout-wide_panel) .clock-panel{order:1;padding:18px 20px 0}.card-grid.ww-force-stack:not(.layout-wide_panel) .center{order:var(--ww-ord-weather,20);border-right:0;overflow:visible}.card-grid.ww-force-stack:not(.layout-wide_panel) .left>.section-title{order:var(--ww-ord-clock-title,12);padding:0 20px}.card-grid.ww-force-stack:not(.layout-wide_panel) .hourly-left{order:var(--ww-ord-clock-hourly,13);flex:none;overflow:visible;padding:0 20px 16px}.card-grid.ww-force-stack:not(.layout-wide_panel) .right{order:var(--ww-ord-radar,30);height:300px;min-height:300px;border-top:1px solid rgba(255,255,255,0.28);border-radius:0 0 22px 22px}.card-grid.ww-force-stack:not(.layout-wide_panel) #rmap{height:300px;min-height:300px}.card-grid.ww-force-stack:not(.layout-wide_panel) .daily-strip{grid-template-columns:repeat(3,minmax(0,1fr));max-height:none}.card-grid.ww-force-stack:not(.layout-wide_panel) .stats-row,.card-grid.ww-force-stack:not(.layout-wide_panel) .custom-sensors-row{grid-template-columns:repeat(2,minmax(0,1fr))}
      @container(max-width:720px){.card-grid.layout-radar_bottom{grid-template-columns:1fr;grid-template-rows:auto auto 300px}.card-grid.layout-radar_bottom .left{grid-column:1;grid-row:1}.card-grid.layout-radar_bottom .center{grid-column:1;grid-row:2;border-right:0}.card-grid.layout-radar_bottom .right{grid-column:1;grid-row:3;height:300px;min-height:300px}.card-grid.layout-radar_bottom #rmap{height:300px;min-height:300px}}
      .card-grid.content-radar,.card-grid.content-forecast,.card-grid.content-timeline,.card-grid.content-essentials{display:grid;grid-template-columns:1fr;grid-template-rows:1fr}
      .card-grid.content-radar .right,.card-grid.content-forecast .center,.card-grid.content-timeline .left,.card-grid.content-essentials .center{grid-column:1;grid-row:1;border-right:0;border-radius:22px}
      .card-grid.content-timeline .left{display:flex;flex-direction:column;padding:18px 22px 14px;overflow:hidden;background:linear-gradient(90deg,rgba(255,255,255,0.20),rgba(255,255,255,0.08))}
      .card-grid.content-radar .right,.card-grid.content-radar #rmap{height:100%;min-height:0}
      @container(max-width:600px){.clock-context{grid-template-columns:1fr}.environment-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.clock-time{font-size:58px}.clock-ampm{font-size:17px}.temp-now{font-size:46px}.temp-hilo{font-size:17px;margin-top:5px}.cond-name{font-size:26px}.current-icon{width:54px;height:54px}.current-row{gap:10px;flex-wrap:wrap}.temp-block{min-width:unset}.center{padding:14px 18px}.updated-note{font-size:12px;margin-top:4px}}
      @container(max-width:420px){.clock-time{font-size:48px}.temp-now{font-size:38px}.cond-name{font-size:22px}.current-icon{width:46px;height:46px}}
    `;
  }
}

class RadarWiseCardEditor extends HTMLElement {
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
      ...RadarWiseCard.getStubConfig(),
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
    return this._sensorEntities(isRadarWiseHumidityEntity);
  }

  _temperatureEntities() {
    return this._sensorEntities(isRadarWiseTemperatureEntity);
  }

  _dewPointEntities() {
    return this._sensorEntities(isRadarWiseDewPointEntity);
  }

  _airQualityEntities() {
    return this._sensorEntities(isRadarWiseAirQualityEntity);
  }

  _uvIndexEntities() {
    return this._sensorEntities(isRadarWiseUvIndexEntity);
  }

  _pollenEntities(kind = "") {
    return this._sensorEntities((entityId, state) => isRadarWisePollenEntity(entityId, state, kind));
  }

  _customSensorEntities() {
    return Object.entries(this._hass?.states || {})
      .filter(([entityId]) => entityId.startsWith("sensor.") || entityId.startsWith("input_number.") || entityId.startsWith("number."))
      .sort(([a], [b]) => a.localeCompare(b));
  }

  _sensorOptions(sensors, selected) {
    return sensors.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${selected === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
  }

  _configuredSensorOption(entityId, sensors, predicate) {
    if (!entityId || sensors.some(([candidate]) => candidate === entityId)) return "";
    return predicate(entityId, this._hass?.states?.[entityId])
      ? `<option value="${_wwEscape(entityId)}" selected>${_wwEscape(entityId)}</option>`
      : "";
  }

  _editorEntitySignature() {
    const states = this._hass?.states || {};
    return Object.entries(states)
      .filter(([entityId, state]) => entityId.startsWith("weather.") || entityId.startsWith("sensor.") || entityId.startsWith("input_number.") || entityId.startsWith("number.") || isRadarWiseHumidityEntity(entityId, state) || isRadarWiseTemperatureEntity(entityId, state) || isRadarWiseDewPointEntity(entityId, state) || isRadarWiseAirQualityEntity(entityId, state) || isRadarWiseUvIndexEntity(entityId, state) || isRadarWisePollenEntity(entityId, state))
      .map(([entityId, state]) => `${entityId}:${state.attributes?.friendly_name || ""}:${state.attributes?.device_class || ""}`)
      .sort()
      .join("|");
  }

  _setValue(key, value) {
    const numberKeys = ["latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"];
    const booleanKeys = ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "show_environment", "show_custom_sensors", "timeline_autoscroll"];
    let nextValue = value;
    if (numberKeys.includes(key)) nextValue = value === "" ? undefined : Number(value);
    if (booleanKeys.includes(key)) nextValue = Boolean(value);
    const switchesToCustom = ["show_radar", "show_timeline", "show_forecast", "show_forecast_summary", "show_environment", "show_custom_sensors"].includes(key);
    const fullPresetDefaults = key === "content_mode" && nextValue === "full"
      ? { show_radar: true, show_timeline: true, show_forecast: true, show_forecast_summary: true, show_environment: true, show_custom_sensors: true }
      : {};
    this._config = { ...this._config, ...fullPresetDefaults, ...(switchesToCustom ? { content_mode: "custom" } : {}), [key]: nextValue };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    }));
    this._render();
  }

  _setCustomSensorValue(index, key, value) {
    const sensors = Array.isArray(this._config.custom_sensors)
      ? this._config.custom_sensors.map((sensor) => ({ ...(sensor || {}) }))
      : [];
    while (sensors.length <= index) sensors.push({});
    sensors[index][key] = value;
    const cleaned = sensors
      .map((sensor) => ({
        entity: String(sensor.entity || "").trim(),
        name: String(sensor.name || "").trim(),
        icon: String(sensor.icon || "").trim(),
        unit: String(sensor.unit || "").trim()
      }))
      .filter((sensor) => sensor.entity || sensor.name || sensor.icon || sensor.unit);
    this._config = { ...this._config, custom_sensors: cleaned, show_custom_sensors: true };
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
    const dewPointSensors = this._dewPointEntities();
    const airQualitySensors = this._airQualityEntities();
    const uvIndexSensors = this._uvIndexEntities();
    const pollenSensors = this._pollenEntities();
    const treePollenSensors = this._pollenEntities("tree");
    const grassPollenSensors = this._pollenEntities("grass");
    const weedPollenSensors = this._pollenEntities("weed");
    const moldPollenSensors = this._pollenEntities("mold");
    const customSensorEntities = this._customSensorEntities();
    const customSensorSlots = Array.isArray(config.custom_sensors) ? config.custom_sensors.slice(0, 3) : [];
    while (customSensorSlots.length < 3) customSensorSlots.push({});
    const hasConfiguredEntity = entities.some(([entityId]) => entityId === config.entity);
    const hasConfiguredHumidityEntity = humiditySensors.some(([entityId]) => entityId === config.humidity_entity);
    const hasConfiguredTemperatureEntity = temperatureSensors.some(([entityId]) => entityId === config.temperature_entity);
    const hasConfiguredDewPointEntity = dewPointSensors.some(([entityId]) => entityId === config.dew_point_entity);
    const hasConfiguredUvIndexEntity = uvIndexSensors.some(([entityId]) => entityId === config.uv_index_entity);
    const configuredOption = config.entity && !hasConfiguredEntity
      ? `<option value="${_wwEscape(config.entity)}" selected>${_wwEscape(config.entity)}</option>`
      : "";
    const configuredHumidityOption = config.humidity_entity && !hasConfiguredHumidityEntity && isRadarWiseHumidityEntity(config.humidity_entity, this._hass?.states?.[config.humidity_entity])
      ? `<option value="${_wwEscape(config.humidity_entity)}" selected>${_wwEscape(config.humidity_entity)}</option>`
      : "";
    const configuredTemperatureOption = config.temperature_entity && !hasConfiguredTemperatureEntity && isRadarWiseTemperatureEntity(config.temperature_entity, this._hass?.states?.[config.temperature_entity])
      ? `<option value="${_wwEscape(config.temperature_entity)}" selected>${_wwEscape(config.temperature_entity)}</option>`
      : "";
    const configuredDewPointOption = config.dew_point_entity && !hasConfiguredDewPointEntity && isRadarWiseDewPointEntity(config.dew_point_entity, this._hass?.states?.[config.dew_point_entity])
      ? `<option value="${_wwEscape(config.dew_point_entity)}" selected>${_wwEscape(config.dew_point_entity)}</option>`
      : "";
    const configuredAirQualityOption = this._configuredSensorOption(config.air_quality_entity, airQualitySensors, isRadarWiseAirQualityEntity);
    const configuredUvIndexOption = config.uv_index_entity && !hasConfiguredUvIndexEntity && isRadarWiseUvIndexEntity(config.uv_index_entity, this._hass?.states?.[config.uv_index_entity])
      ? `<option value="${_wwEscape(config.uv_index_entity)}" selected>${_wwEscape(config.uv_index_entity)}</option>`
      : "";
    const configuredPollenOption = this._configuredSensorOption(config.pollen_entity, pollenSensors, isRadarWisePollenEntity);
    const configuredTreePollenOption = this._configuredSensorOption(config.tree_pollen_entity, treePollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "tree"));
    const configuredGrassPollenOption = this._configuredSensorOption(config.grass_pollen_entity, grassPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "grass"));
    const configuredWeedPollenOption = this._configuredSensorOption(config.weed_pollen_entity, weedPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "weed"));
    const configuredMoldPollenOption = this._configuredSensorOption(config.mold_pollen_entity, moldPollenSensors, (entityId, state) => isRadarWisePollenEntity(entityId, state, "mold"));
    const weatherOptions = entities.map(([entityId, state]) => {
      const name = state.attributes?.friendly_name || entityId;
      return `<option value="${_wwEscape(entityId)}" ${config.entity === entityId ? "selected" : ""}>${_wwEscape(name)} (${_wwEscape(entityId)})</option>`;
    }).join("");
    const temperatureOptions = this._sensorOptions(temperatureSensors, config.temperature_entity);
    const humidityOptions = this._sensorOptions(humiditySensors, config.humidity_entity);
    const dewPointOptions = this._sensorOptions(dewPointSensors, config.dew_point_entity);
    const airQualityOptions = this._sensorOptions(airQualitySensors, config.air_quality_entity);
    const uvIndexOptions = this._sensorOptions(uvIndexSensors, config.uv_index_entity);
    const pollenOptions = this._sensorOptions(pollenSensors, config.pollen_entity);
    const treePollenOptions = this._sensorOptions(treePollenSensors, config.tree_pollen_entity);
    const grassPollenOptions = this._sensorOptions(grassPollenSensors, config.grass_pollen_entity);
    const weedPollenOptions = this._sensorOptions(weedPollenSensors, config.weed_pollen_entity);
    const moldPollenOptions = this._sensorOptions(moldPollenSensors, config.mold_pollen_entity);
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
        .custom-sensor-slot{border:1px solid var(--divider-color,rgba(0,0,0,.12));border-radius:10px;padding:10px;margin-top:10px;background:color-mix(in srgb,var(--primary-color,#2a7a94) 4%,var(--card-background-color,#fff))}
        .slot-title{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--secondary-text-color,#536b75);margin-bottom:8px}
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
          <label>Dew point entity
            <select id="dew_point_entity">
              <option value="">Auto from weather entity</option>
              ${configuredDewPointOption}
              ${dewPointOptions}
            </select>
          </label>
          <div class="hint">RadarWise reads an existing Home Assistant weather entity and calls Home Assistant's forecast service. Use local temperature, humidity, or dew point sensors when your weather entity differs from the spot you care about.</div>
        </div>
        <div class="section">
          <div class="section-title">Environment sensors</div>
          <label style="margin-bottom:10px">Environment source
            <select id="environment_source">
              ${Object.entries(RADARWISE_ENVIRONMENT_SOURCES).map(([value, label]) => `<option value="${value}" ${config.environment_source === value ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <div class="grid">
            <label>Air quality entity
              <select id="air_quality_entity">
                <option value="">None</option>
                ${configuredAirQualityOption}
                ${airQualityOptions}
              </select>
            </label>
            <label>UV index entity
              <select id="uv_index_entity">
                <option value="">Auto / Open-Meteo</option>
                ${configuredUvIndexOption}
                ${uvIndexOptions}
              </select>
            </label>
            <label>Pollen entity
              <select id="pollen_entity">
                <option value="">None</option>
                ${configuredPollenOption}
                ${pollenOptions}
              </select>
            </label>
            <label>Tree pollen entity
              <select id="tree_pollen_entity">
                <option value="">None</option>
                ${configuredTreePollenOption}
                ${treePollenOptions}
              </select>
            </label>
            <label>Grass pollen entity
              <select id="grass_pollen_entity">
                <option value="">None</option>
                ${configuredGrassPollenOption}
                ${grassPollenOptions}
              </select>
            </label>
            <label>Weed pollen entity
              <select id="weed_pollen_entity">
                <option value="">None</option>
                ${configuredWeedPollenOption}
                ${weedPollenOptions}
              </select>
            </label>
            <label>Mold entity
              <select id="mold_pollen_entity">
                <option value="">None</option>
                ${configuredMoldPollenOption}
                ${moldPollenOptions}
              </select>
            </label>
          </div>
          <label class="check" style="margin-top:10px"><input id="show_environment" type="checkbox" ${config.show_environment === false ? "" : "checked"}> Show AQI / pollen beside the clock</label>
          <div class="hint">Use Home Assistant sensors for fully entity-driven data, or Open-Meteo for no-key AQI, UV index, and pollen using the radar latitude/longitude. Open-Meteo does not provide mold; mold remains sensor-only.</div>
        </div>
        <div class="section">
          <div class="section-title">Optional detail blocks</div>
          <div class="hint" style="margin-top:0">Add up to three Home Assistant sensors in the visual editor. They render below Humidity, Dew Point, Wind, Sunrise, and Sunset in the weather details area. YAML can define up to six.</div>
          <label class="check" style="margin-top:10px"><input id="show_custom_sensors" type="checkbox" ${config.show_custom_sensors === false ? "" : "checked"}> Show optional detail blocks</label>
          ${customSensorSlots.map((sensor, index) => {
            const selected = sensor?.entity || "";
            const configuredCustomOption = selected && !customSensorEntities.some(([entityId]) => entityId === selected)
              ? `<option value="${_wwEscape(selected)}" selected>${_wwEscape(selected)}</option>`
              : "";
            return `
              <div class="custom-sensor-slot">
                <div class="slot-title">Detail block ${index + 1}</div>
                <label>Entity
                  <select data-custom-sensor-index="${index}" data-custom-sensor-field="entity">
                    <option value="">None</option>
                    ${configuredCustomOption}
                    ${this._sensorOptions(customSensorEntities, selected)}
                  </select>
                </label>
                <div class="grid" style="margin-top:10px">
                  <label>Label <input data-custom-sensor-index="${index}" data-custom-sensor-field="name" value="${_wwEscape(sensor?.name || "")}" placeholder="Auto name"></label>
                  <label>Icon <input data-custom-sensor-index="${index}" data-custom-sensor-field="icon" value="${_wwEscape(sensor?.icon || "")}" placeholder="mdi:pool-thermometer"></label>
                  <label>Unit override <input data-custom-sensor-index="${index}" data-custom-sensor-field="unit" value="${_wwEscape(sensor?.unit || "")}" placeholder="Auto unit"></label>
                </div>
              </div>
            `;
          }).join("")}
        </div>
        <div class="section">
          <div class="section-title">Region and radar</div>
          <div class="grid">
            <label>Country / region
              <select id="country">
                ${Object.entries(RADARWISE_COUNTRIES).map(([value, label]) => `<option value="${value}" ${config.country === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar provider
              <select id="radar_provider">
                ${Object.entries(RADARWISE_RADAR).map(([value, label]) => `<option value="${value}" ${config.radar_provider === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar style
              <select id="radar_style">
                ${Object.entries(RADARWISE_RADAR_STYLES).map(([value, label]) => `<option value="${value}" ${config.radar_style === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Map style
              <select id="radar_basemap">
                ${Object.entries(RADARWISE_BASEMAPS).map(([value, label]) => `<option value="${value}" ${config.radar_basemap === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Radar timeline
              <select id="radar_timeline">
                ${Object.entries(RADARWISE_RADAR_TIMELINES).map(([value, label]) => `<option value="${value}" ${config.radar_timeline === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="hint">Auto uses NOAA radar for the United States, Environment Canada radar for Canada, native BOM radar tiles for Australia, and RainViewer global radar for the UK and other regions. Future radar is used only when the selected provider exposes future frames.</div>
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
                <option value="radarwise" ${config.theme_mode !== "auto" ? "selected" : ""}>RadarWise</option>
                <option value="auto" ${config.theme_mode === "auto" ? "selected" : ""}>Match Home Assistant theme</option>
              </select>
            </label>
            <label>Language
              <select id="language">
                ${Object.entries(RADARWISE_LANGUAGES).map(([value, label]) => `<option value="${value}" ${(config.language || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Time format
              <select id="time_format">
                ${Object.entries(RADARWISE_TIME_FORMATS).map(([value, label]) => `<option value="${value}" ${(config.time_format || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Font
              <select id="font_family">
                ${Object.entries(RADARWISE_FONT_FAMILIES).map(([value, label]) => `<option value="${value}" ${(config.font_family || "auto") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Density
              <select id="density">
                ${Object.entries(RADARWISE_DENSITIES).map(([value, label]) => `<option value="${value}" ${(config.density || "comfortable") === value ? "selected" : ""}>${label}</option>`).join("")}
              </select>
            </label>
            <label>Forecast list rows <input id="hourly_count" type="number" min="1" max="24" value="${_wwEscape(config.hourly_count || 5)}"></label>
            <label>Forecast cards <input id="forecast_count" type="number" min="1" max="7" value="${_wwEscape(config.forecast_count || 5)}"></label>
          </div>
          <div class="layout-label">Content focus</div>
          <div class="layout-picker">
            ${Object.entries({
              full: { name: "Full", desc: "Everything", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="5" y="6" width="17" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="27" y="6" width="20" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".11"/><rect x="52" y="6" width="15" height="38" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".13"/></svg>` },
              essentials: { name: "Essentials", desc: "Clock + current", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><circle cx="18" cy="17" r="9" stroke="var(--primary-color,#2a7a94)" stroke-width="2" opacity=".55"/><path d="M18 11v7l5 3" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".55"/><circle cx="44" cy="19" r="8" fill="#fbbf24"/><rect x="35" y="32" width="26" height="4" rx="2" fill="var(--primary-color,#2a7a94)" opacity=".25"/></svg>` },
              forecast: { name: "Forecast", desc: "Daily cards", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="6" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><rect x="27" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><rect x="48" y="8" width="17" height="34" rx="4" fill="var(--primary-color,#2a7a94)" opacity=".12"/><circle cx="15" cy="19" r="4" fill="#fbbf24"/><path d="M33 22c4-4 8-4 12 0" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><path d="M53 22c4-4 8-4 12 0" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/></svg>` },
              timeline: { name: "Hourly", desc: "Timeline list", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><rect x="8" y="10" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="8" y="22" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".22"/><rect x="8" y="34" width="56" height="6" rx="3" fill="var(--primary-color,#2a7a94)" opacity=".16"/><rect x="20" y="12" width="30" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/><rect x="20" y="24" width="38" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/><rect x="20" y="36" width="24" height="2" rx="1" fill="var(--primary-color,#2a7a94)" opacity=".55"/></svg>` },
              radar: { name: "Radar", desc: "Map only", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><path d="M8 35Q18 20 30 29T52 18T66 24" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".5"/><circle cx="38" cy="25" r="12" stroke="var(--primary-color,#2a7a94)" stroke-width="2" opacity=".45"/><path d="M38 25l10-9" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round"/><circle cx="38" cy="25" r="3" fill="var(--primary-color,#2a7a94)"/></svg>` },
              custom: { name: "Custom", desc: "Use switches", icon: `<svg width="72" height="50" viewBox="0 0 72 50" fill="none"><rect x="1" y="1" width="70" height="48" rx="5" fill="var(--card-background-color,#f4f7f9)" stroke="var(--divider-color,#cdd5da)" stroke-width="1.5"/><path d="M16 14h40M16 25h40M16 36h40" stroke="var(--primary-color,#2a7a94)" stroke-width="2" stroke-linecap="round" opacity=".35"/><circle cx="28" cy="14" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/><circle cx="45" cy="25" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/><circle cx="23" cy="36" r="5" fill="var(--primary-color,#2a7a94)" opacity=".55"/></svg>` }
            }).map(([value, meta]) => `
              <button type="button" class="layout-tile${(config.content_mode || "full") === value ? " selected" : ""}" data-content-mode="${value}" title="${_wwEscape(meta.desc)}">
                ${meta.icon}
                <span class="layout-tile-name">${_wwEscape(meta.name)}</span>
                <span class="layout-tile-desc">${_wwEscape(meta.desc)}</span>
              </button>
            `).join("")}
          </div>
          <div class="hint" style="margin-top:10px">Use a focus preset for simple cards like radar-only, forecast-only, or hourly-only. Changing an individual visibility switch below moves the card to Custom.</div>
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
    ["entity", "temperature_entity", "humidity_entity", "dew_point_entity", "air_quality_entity", "uv_index_entity", "pollen_entity", "tree_pollen_entity", "grass_pollen_entity", "weed_pollen_entity", "mold_pollen_entity", "environment_source", "country", "radar_provider", "radar_style", "radar_basemap", "radar_timeline", "title", "units", "theme_mode", "language", "time_format", "font_family", "density", "latitude", "longitude", "hourly_count", "forecast_count", "radar_zoom", "radar_speed"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.value));
    });
    ["show_radar", "show_map_controls", "radar_controls", "show_warning_overlay", "show_animations", "show_timeline", "show_forecast", "show_forecast_summary", "show_environment", "show_custom_sensors", "timeline_autoscroll"].forEach((id) => {
      this.shadowRoot.getElementById(id)?.addEventListener("change", (event) => this._setValue(id, event.target.checked));
    });
    this.shadowRoot.querySelectorAll("[data-custom-sensor-index][data-custom-sensor-field]").forEach((input) => {
      input.addEventListener("change", (event) => {
        this._setCustomSensorValue(Number(input.dataset.customSensorIndex), input.dataset.customSensorField, event.target.value);
      });
    });
    this.shadowRoot.querySelectorAll("[data-layout]").forEach((tile) => {
      tile.addEventListener("click", () => this._setValue("layout", tile.dataset.layout));
    });
    this.shadowRoot.querySelectorAll("[data-content-mode]").forEach((tile) => {
      tile.addEventListener("click", () => this._setValue("content_mode", tile.dataset.contentMode));
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

class RadarWiseDashedCard extends RadarWiseCard {}
class RadarWiseDashedCardEditor extends RadarWiseCardEditor {}
class RadarWiseLegacyCard extends RadarWiseCard {}
class RadarWiseLegacyDashedCard extends RadarWiseCard {}
class RadarWiseLegacyCardEditor extends RadarWiseCardEditor {}
class RadarWiseLegacyDashedCardEditor extends RadarWiseCardEditor {}

if (!customElements.get(CARD_TYPES[0])) customElements.define(CARD_TYPES[0], RadarWiseCard);
if (!customElements.get(CARD_TYPES[1])) customElements.define(CARD_TYPES[1], RadarWiseDashedCard);
if (!customElements.get(CARD_TYPES[2])) customElements.define(CARD_TYPES[2], RadarWiseLegacyCard);
if (!customElements.get(CARD_TYPES[3])) customElements.define(CARD_TYPES[3], RadarWiseLegacyDashedCard);
if (!customElements.get("radarwise-card-editor")) customElements.define("radarwise-card-editor", RadarWiseCardEditor);
if (!customElements.get("radar-wise-card-editor")) customElements.define("radar-wise-card-editor", RadarWiseDashedCardEditor);
if (!customElements.get("weatherwise-card-editor")) customElements.define("weatherwise-card-editor", RadarWiseLegacyCardEditor);
if (!customElements.get("weather-wise-card-editor")) customElements.define("weather-wise-card-editor", RadarWiseLegacyDashedCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "radarwise-card",
  name: "RadarWise Weather",
  description: "Weather dashboard card with forecasts, theme support, and optional radar.",
  documentationURL: "https://github.com/TheWillMiller/radar-wise",
  preview: true
});

console.info(
  `%c RADARWISE-CARD %c v${CARD_VERSION} `,
  "background:#0d3a5c;color:#7ecbca;font-weight:bold;padding:2px 4px;border-radius:3px 0 0 3px",
  "background:#7ecbca;color:#0d3a5c;font-weight:bold;padding:2px 4px;border-radius:0 3px 3px 0"
);
