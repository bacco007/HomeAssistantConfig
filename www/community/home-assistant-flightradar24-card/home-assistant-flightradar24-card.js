function renderStyle(cardState, shadowRoot) {
  const oldStyle = shadowRoot.querySelector("style[data-fr24-style]");
  if (oldStyle) oldStyle.remove();

  const radar = cardState.radar || {};
  const radarPrimaryColor = radar["primary-color"] || "var(--dark-primary-color)";
  const radarAccentColor = radar["accent-color"] || "var(--accent-color)";
  const callsignLabelColor = radar["callsign-label-color"] || "var(--primary-background-color)";
  const featureColor = radar["feature-color"] || "var(--secondary-text-color)";

  const style = document.createElement("style");
  style.setAttribute("data-fr24-style", "1");
  style.textContent = `
    :host {
      --radar-primary-color: ${radarPrimaryColor};
      --radar-accent-color: ${radarAccentColor};
      --radar-callsign-label-color: ${callsignLabelColor};
      --radar-feature-color: ${featureColor};
    }
    #flights-card {
      padding: 16px;
    }
    #flights {
      padding: 0px;
    }
    #flights .flight {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    #flights .flight.first {
      margin-top: 0px;
    }
    #flights .flight.selected {
      margin-left: -3px;
      margin-right: -3px;
      padding: 3px;
      background-color: var(--primary-background-color);
      border: 1px solid var(--fc-border-color);
      border-radius: 4px;
    }
    #flights .flight {
      margin-top: 16px;
      margin-bottom: 16px;
    }
    #flights > :first-child {
      margin-top: 0px;
    }
    #flights > :last-child {
      margin-bottom: 0px;
    }
    #flights .flight a {
      text-decoration: none;
      font-size: 0.8em;
      margin-left: 0.2em;
    }
    #flights .description {
      flex-grow: 1;
    }
    #flights .no-flights-message {
      text-align: center;
      font-size: 1.2em;
      color: gray;
      margin-top: 20px;
    }
    #radar-container {
      display: flex;
      justify-content: space-between;
    }
    #radar-overlay {
      position: absolute;
      width: 70%;
      left: 15%;
      padding: 0 0 70% 0;
      margin-bottom: 5%;
      z-index: 1;
      opacity: 0;
      pointer-events: auto;
      border-radius: 50%;
      overflow: hidden;
    }
    #radar-info {
      position: absolute;
      width: 30%;
      text-align: left;
      font-size: 0.9em;
      padding: 0;
      margin: 0;
    }
    #toggle-container {
      position: absolute;
      right: 0;
      width: 25%;
      text-align: left;
      font-size: 0.9em;
      padding: 0;
      margin: 0 15px;
    }
    .toggle {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    .toggle label {
      margin-right: 10px;
      flex: 1;
    }
    #radar {
      position: relative;
      width: 70%;
      height: 0;
      margin: 0 15%;
      padding-bottom: 70%;
      margin-bottom: 5%;
      border-radius: 50%;
      overflow: hidden;
    }
    #radar-screen {
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0%;
    }
    #radar-screen-background {
      position: absolute;
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0%;
      background-color: var(--radar-primary-color);
      opacity: 0.05;
    }
    #tracker {
      position: absolute;
      width: 3px;
      height: 3px;
      background-color: var(--info-color);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .plane {
      position: absolute;
      translate: -50% -50%;
      z-index: 2;
    }
    .plane.plane-small {
      width: 4px;
      height: 6px;
    }
    .plane.plane-medium {
      width: 6px;
      height: 8px;
    }
    .plane.plane-large {
      width: 8px;
      height: 16px;
    }
    .plane .arrow {
      position: absolute;
      width: 0;
      height: 0;
      transform-origin: center center;
    }
    .plane.plane-small .arrow {
      border-left: 2px solid transparent;
      border-right: 2px solid transparent;
      border-bottom: 6px solid var(--radar-accent-color);
    }
    .plane.plane-medium .arrow {
      border-left: 3px solid transparent;
      border-right: 3px solid transparent;
      border-bottom: 8px solid var(--radar-accent-color);
    }
    .plane.plane-large .arrow {
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 16px solid var(--radar-accent-color);
    }
    .plane.selected {
      z-index: 3;
      transform: scale(1.2);
    }
    .plane.selected .arrow {
      filter: brightness(1.4);
    }
    .callsign-label {
      position: absolute;
      background-color: var(--radar-callsign-label-color);
      opacity: 0.7;
      border: 1px solid lightgray;
      line-height: 1em;
      padding: 0px;
      margin: 0px;
      border-radius: 3px;
      font-size: 9px;
      color: var(--primary-text-color);
      z-index: 2;
    }
    .ring {
      position: absolute;
      border: 1px dashed var(--radar-primary-color);
      border-radius: 50%;
      pointer-events: none;
    }
    .dotted-line {
      position: absolute;
      top: 50%;
      left: 50%;
      border-bottom: 1px dotted var(--radar-primary-color);
      width: 50%;
      height: 0px;
      transform-origin: 0 0;
      pointer-events: none;
    }
    .runway {
      position: absolute;
      background-color: var(--radar-feature-color);
      height: 2px;
    }
    .location-dot {
      position: absolute;
      width: 4px;
      height: 4px;
      background-color: var(--radar-feature-color);
      border-radius: 50%;
    }
    .location-label {
      position: absolute;
      background: none;
      line-height: 0;
      border: none;
      padding: 0px;
      font-size: 10px;
      color: var(--radar-feature-color);
      opacity: 0.5;
    }
    .outline-line {
      position: absolute;
      background-color: var(--radar-feature-color);
      opacity: 0.35;
    }
  `;
  shadowRoot.appendChild(style);
}

function renderToggles(cardState, toggleContainer) {
    if (!toggleContainer) return;
    toggleContainer.innerHTML = '';
    const toggles = cardState.config.toggles || {};
    const haSwitchAvailable = !!window.customElements && !!customElements.get('ha-switch');

    Object.keys(toggles).forEach((toggleKey) => {
        const toggleDef = toggles[toggleKey];
        const toggleDiv = document.createElement('div');
        toggleDiv.className = 'toggle';

        const label = document.createElement('label');
        label.textContent = toggleDef.label || toggleKey;
        toggleDiv.appendChild(label);

        let input;
        if (haSwitchAvailable) {
            input = document.createElement('ha-switch');
        } else {
            input = document.createElement('input');
            input.type = 'checkbox';
        }
        input.checked = toggleDef.default === 'true';
        input.addEventListener('change', () => {
            cardState.setToggleValue(toggleKey, input.checked);
        });

        toggleDiv.appendChild(input);
        toggleContainer.appendChild(toggleDiv);
    });
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

function haversine(lat1, lon1, lat2, lon2, units = 'km') {
    const R = 6371.0; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return units === 'km' ? R * c : (R * c) / 1.60934;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) - Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (toDegrees(bearing) + 360) % 360; // Normalize to 0-360
}

function calculateNewPosition(lat, lon, bearing, distanceKm) {
    const R = 6371.0; // Radius of the Earth in kilometers
    const bearingRad = toRadians(bearing);
    const latRad = toRadians(lat);
    const lonRad = toRadians(lon);
    const distanceRad = distanceKm / R;

    const newLatRad = Math.asin(Math.sin(latRad) * Math.cos(distanceRad) + Math.cos(latRad) * Math.sin(distanceRad) * Math.cos(bearingRad));
    const newLonRad = lonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distanceRad) * Math.cos(latRad), Math.cos(distanceRad) - Math.sin(latRad) * Math.sin(newLatRad));

    const newLat = toDegrees(newLatRad);
    const newLon = toDegrees(newLonRad);

    return { lat: newLat, lon: newLon };
}

function calculateClosestPassingPoint(refLat, refLon, flightLat, flightLon, heading) {
    const trackBearing = calculateBearing(flightLat, flightLon, refLat, refLon);
    const angle = Math.abs((heading - trackBearing + 360) % 360);
    const distanceToFlight = haversine(refLat, refLon, flightLat, flightLon);
    const distanceAlongPath = distanceToFlight * Math.cos(toRadians(angle));
    return calculateNewPosition(flightLat, flightLon, heading, distanceAlongPath);
}

function getCardinalDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
}

function areHeadingsAligned(direction_to_tracker, heading, margin = 60) {
    const diff = Math.abs((direction_to_tracker - heading + 360) % 360);
    return diff <= margin || diff >= 360 - margin;
}

function getLocation(cardState) {
    if (!cardState || !cardState.config) {
        console.error('Config not set in getLocation');
        return { latitude: 0, longitude: 0 };
    }
    const { config, hass } = cardState;
    if (config.location_tracker && hass && hass.states && config.location_tracker in hass.states) {
        return hass.states[config.location_tracker].attributes;
    } else if (config.location) {
        return {
            latitude: config.location.lat,
            longitude: config.location.lon
        };
    } else if (hass && hass.config) {
        return {
            latitude: hass.config.latitude,
            longitude: hass.config.longitude
        };
    }
    return { latitude: 0, longitude: 0 };
}

/**
 * Ensures Leaflet CSS/JS are loaded into shadowRoot *if needed*.
 * Only loads if cardState wants a map background.
 */
function ensureLeafletLoadedIfNeeded(cardState, shadowRoot, onReady) {
    if (cardState.radar && cardState.radar.background_map && cardState.radar.background_map !== 'none') {
        if (window.L) {
            onReady();
            return;
        }
        if (!shadowRoot.querySelector('#leaflet-css-loader')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css-loader';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
            shadowRoot.appendChild(link);
        }
        if (!shadowRoot.querySelector('#leaflet-js-loader')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js-loader';
            script.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
            script.async = true;
            script.defer = true;
            script.onload = onReady;
            script.onerror = () => script.remove();
            shadowRoot.appendChild(script);
        } else {
            const poll = setInterval(() => {
                if (window.L) {
                    clearInterval(poll);
                    onReady();
                }
            }, 50);
        }
    } else {
        onReady();
    }
}

/**
 * Sets up or updates the radar map background and Leaflet map.
 * Expects Leaflet to be loaded (window.L)
 */
function setupRadarMapBg(cardState, radarScreen) {
    const { config, dimensions } = cardState;
    const TILE_LAYERS = {
        bw: [
            'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
            {
                api_key: '?api_key=',
                attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap',
                subdomains: []
            }
        ],
        color: [
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                attribution: '&copy; OpenStreetMap contributors',
                subdomains: ['a', 'b', 'c']
            }
        ],
        dark: [
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
            {
                attribution: '&copy; CartoDB'
            }
        ],
        outlines: [
            'https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}.png',
            {
                api_key: '?api_key=',
                attribution: 'Map tiles by Stamen Design, hosted by Stadia Maps; Data by OpenStreetMap',
                subdomains: []
            }
        ],
        system: null
    };

    let opacity = typeof config.radar.background_map_opacity === 'number' ? Math.max(0, Math.min(1, config.radar.background_map_opacity)) : 1;

    let mapBg = radarScreen.querySelector('#radar-map-bg');
    if (!mapBg) {
        mapBg = document.createElement('div');
        mapBg.id = 'radar-map-bg';
        mapBg.style.position = 'absolute';
        mapBg.style.top = '0';
        mapBg.style.left = '0';
        mapBg.style.width = '100%';
        mapBg.style.height = '100%';
        mapBg.style.zIndex = '0';
        mapBg.style.pointerEvents = 'none';
        mapBg.style.opacity = opacity;
        radarScreen.appendChild(mapBg);
    } else {
        mapBg.style.opacity = opacity;
    }

    // Make sure there are no transformation before applying "clean map"
    mapBg.style.transform = '';

    // If _leafletMap exists but is bound to wrong (detached) DOM node, destroy it
    if (cardState._leafletMap && cardState._leafletMap.getContainer() !== mapBg) {
        cardState._leafletMap.remove();
        cardState._leafletMap = null;
    }

    const location = getLocation(cardState);
    const radarRange = Math.max(dimensions.range, 1);
    const rangeKm = config.units === 'mi' ? radarRange * 1.60934 : radarRange;

    const lat = location.latitude || 0;
    const lon = location.longitude || 0;

    const rad = Math.PI / 180;
    const km_per_deg_lat = 111.13209 - 0.56605 * Math.cos(2 * lat * rad) + 0.0012 * Math.cos(4 * lat * rad);
    const km_per_deg_lon = 111.32 * Math.cos(lat * rad) - 0.094 * Math.cos(3 * lat * rad);
    const deltaLat = rangeKm / km_per_deg_lat;
    const deltaLon = rangeKm / km_per_deg_lon;
    const bounds = [
        [lat - deltaLat, lon - deltaLon],
        [lat + deltaLat, lon + deltaLon]
    ];
    let type = config.radar.background_map || 'bw';
    if (type === 'system') {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        let haDark = false;
        try {
            haDark = window.parent && window.parent.document && window.parent.document.body.classList.contains('dark');
        } catch (e) {}
        if (haDark || prefersDark) {
            type = 'dark';
        } else {
            type = 'color';
        }
    }
    let [tileUrl, tileOpts] = TILE_LAYERS[type] || TILE_LAYERS.bw;
    if (tileOpts && 'api_key' in tileOpts && config.radar.background_map_api_key) {
        tileUrl = tileUrl + tileOpts.api_key + encodeURIComponent(config.radar.background_map_api_key);
    }

    if (window.L) {
        if (!cardState._leafletMap) {
            cardState._leafletMap = window.L.map(mapBg, {
                attributionControl: false,
                zoomControl: false,
                dragging: false,
                scrollWheelZoom: false,
                boxZoom: false,
                doubleClickZoom: false,
                keyboard: false,
                touchZoom: false,
                pointerEvents: false
            });
        } else {
            cardState._leafletMap.eachLayer((layer) => {
                cardState._leafletMap.removeLayer(layer);
            });
        }
        window.L.tileLayer(tileUrl, tileOpts).addTo(cardState._leafletMap);

        cardState._leafletMap.fitBounds(bounds, { animate: false, padding: [0, 0] });

        const mapContainer = cardState._leafletMap.getContainer();
        const heightPx = mapContainer.offsetHeight;
        const widthPx = mapContainer.offsetWidth;

        const pixelLeft = window.L.point(0, heightPx / 2);
        const pixelRight = window.L.point(widthPx, heightPx / 2);

        const latLngLeft = cardState._leafletMap.containerPointToLatLng(pixelLeft);
        const latLngRight = cardState._leafletMap.containerPointToLatLng(pixelRight);

        let kmAcross = haversine(latLngLeft.lat, latLngLeft.lng, latLngRight.lat, latLngRight.lng, 'km');
        const desiredKmAcross = rangeKm * 2;

        const scaleCorrection = kmAcross / desiredKmAcross;
        mapBg.style.transform = `scale(${scaleCorrection})`;
    }
    return mapBg;
}

/**
 * Recursively compiles a template string with possible sub-template references.
 */
function compileTemplate(templates = {}, templateId, trace = []) {
    if (trace.includes(templateId)) {
        console.error('Circular template dependencies detected. ' + trace.join(' -> ') + ' -> ' + templateId);
        return '';
    }
    if (templates['compiled_' + templateId]) {
        return templates['compiled_' + templateId];
    }
    let template = templates[templateId];
    if (template === undefined) {
        console.error('Missing template reference: ' + templateId);
        return '';
    }
    const tplRegex = /tpl\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    let tplMatch;
    const compiledTemplates = {};
    while ((tplMatch = tplRegex.exec(template)) !== null) {
        const innerTemplateId = tplMatch[1];
        if (!compiledTemplates[innerTemplateId]) {
            compiledTemplates[innerTemplateId] = compileTemplate(templates, innerTemplateId, [...trace, templateId]);
        }
        template = template.replace(`tpl.${innerTemplateId}`, '(`' + compiledTemplates[innerTemplateId] + '`).replace(/^undefined$/, "")');
    }
    templates['compiled_' + templateId] = template;
    return template;
}

/**
 * Safely parses and interpolates a template string with provided context.
 * Accepts an optional joinList helper.
 * Accepts cardState object as first argument.
 */
function parseTemplate(cardState = {}, templateId, flight, joinList) {
    const templates = cardState.templates || {};
    const flightsContext = cardState.flightsContext || {};
    const units = cardState.units || {};
    const radar = cardState.radar || {};
    const compiledTemplate = compileTemplate(templates, templateId);
    try {
        const parsedTemplate = new Function(
            'flights',
            'flight',
            'tpl',
            'units',
            'radar_range',
            'joinList',
            `return \`${compiledTemplate.replace(/\${(.*?)}/g, (_, expr) => `\${${expr}}`)}\``
        )(flightsContext, flight, {}, units, Math.round(radar.range), joinList);
        return parsedTemplate !== 'undefined' ? parsedTemplate : '';
    } catch (e) {
        console.error('Error when rendering: ' + compiledTemplate, e);
        return '';
    }
}

/**
 * Substitute placeholders in a string with values from context objects.
 * Accepts cardState object as first argument.
 */
function resolvePlaceholders(cardState = {}, value, defaultValue, renderDynamicOnRangeChangeSetter) {
    const { defines = {}, config = {}, radar = {}, selectedFlights = [] } = cardState;
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const key = value.slice(2, -1);
        if (key === 'selectedFlights') return selectedFlights;
        else if (key === 'radar_range') {
            if (renderDynamicOnRangeChangeSetter) renderDynamicOnRangeChangeSetter(true);
            return radar.range;
        } else if (key in defines) return defines[key];
        else if (config.toggles && key in config.toggles) return config.toggles[key].default;
        else if (defaultValue !== undefined) return defaultValue;
        else {
            console.error('Unresolved placeholder: ' + key);
            console.debug('Defines', defines);
        }
    }
    return value;
}

/**
 * Renders the radar screen for the Flightradar24CardState object
 * @param {Object} cardState - Flightradar24Card state/context object
 */

/**
 * Renders the radar screen for the Flightradar24CardState object
 * @param {Object} cardState - Flightradar24Card state/context object
 */
function renderRadarScreen(cardState) {
    const { units, radar, dom, dimensions, hass } = cardState;

    // Use cardState.dom references if available
    const radarInfoDisplay = dom?.radarInfoDisplay || (dom && dom.radarContainer?.querySelector('#radar-info'));
    if (radarInfoDisplay) {
        const infoElements = [radar?.hide_range !== true ? parseTemplate(cardState, 'radar_range', null, null) : ''].filter((el) => el);
        radarInfoDisplay.innerHTML = infoElements.join('<br />');
    }

    const radarScreen = dom?.radarScreen || (dom && dom.radarContainer?.querySelector('#radar-screen')) || document.getElementById('radar-screen');
    if (!radarScreen) return;

    // Only remove overlays, not the background map div
    Array.from(radarScreen.childNodes).forEach((child) => {
        // Preserve Leaflet map bg
        if (!(child.id === 'radar-map-bg') && !(child.id === 'radar-screen-background')) {
            radarScreen.removeChild(child);
        }
    });

    let radarScreenBackground = radarScreen.querySelector('#radar-screen-background');
    if (!radarScreenBackground) {
        radarScreenBackground = document.createElement('div');
        radarScreenBackground.id = 'radar-screen-background';
        radarScreen.appendChild(radarScreenBackground);
    }

    setupRadarMapBg(cardState, radarScreen);

    // All geometry from cardState.dimensions
    // Dimensions must provide: width, height, range, scaleFactor, centerX, centerY
    const { width: radarWidth, height: radarHeight, range: radarRange, scaleFactor, centerX: radarCenterX, centerY: radarCenterY } = dimensions || {};

    if (!radarWidth || !radarHeight || !radarRange || !scaleFactor || radarCenterX == null || radarCenterY == null) return;

    const clippingRange = radarRange * 1.15;

    const ringDistance = radar?.ring_distance ?? 10;
    const ringCount = Math.floor(radarRange / ringDistance);
    for (let i = 1; i <= ringCount; i++) {
        const radius = i * ringDistance * scaleFactor;
        const ring = document.createElement('div');
        ring.className = 'ring';
        ring.style.width = ring.style.height = radius * 2 + 'px';
        ring.style.top = Math.floor(radarCenterY - radius) + 'px';
        ring.style.left = Math.floor(radarCenterX - radius) + 'px';
        radarScreen.appendChild(ring);
    }

    for (let angle = 0; angle < 360; angle += 45) {
        const line = document.createElement('div');
        line.className = 'dotted-line';
        line.style.transform = `rotate(${angle - 90}deg)`;
        radarScreen.appendChild(line);
    }

    const location = getLocation(cardState);
    if (radar?.local_features && hass) {
        if (location) {
            const refLat = location.latitude;
            const refLon = location.longitude;
            radar.local_features.forEach((feature) => {
                if (feature.max_range && feature.max_range <= radar.range) return;
                if (feature.type === 'outline' && feature.points?.length > 1) {
                    for (let i = 0; i < feature.points.length - 1; i++) {
                        const start = feature.points[i];
                        const end = feature.points[i + 1];
                        const startDistance = haversine(refLat, refLon, start.lat, start.lon, units.distance);
                        const endDistance = haversine(refLat, refLon, end.lat, end.lon, units.distance);
                        if (startDistance <= clippingRange || endDistance <= clippingRange) {
                            const startBearing = calculateBearing(refLat, refLon, start.lat, start.lon);
                            const endBearing = calculateBearing(refLat, refLon, end.lat, end.lon);
                            const startX = radarCenterX + Math.cos(((startBearing - 90) * Math.PI) / 180) * startDistance * scaleFactor;
                            const startY = radarCenterY + Math.sin(((startBearing - 90) * Math.PI) / 180) * startDistance * scaleFactor;
                            const endX = radarCenterX + Math.cos(((endBearing - 90) * Math.PI) / 180) * endDistance * scaleFactor;
                            const endY = radarCenterY + Math.sin(((endBearing - 90) * Math.PI) / 180) * endDistance * scaleFactor;
                            const outlineLine = document.createElement('div');
                            outlineLine.className = 'outline-line';
                            outlineLine.style.width = Math.hypot(endX - startX, endY - startY) + 'px';
                            outlineLine.style.height = '1px';
                            outlineLine.style.top = startY + 'px';
                            outlineLine.style.left = startX + 'px';
                            outlineLine.style.transformOrigin = '0 0';
                            outlineLine.style.transform = `rotate(${Math.atan2(endY - startY, endX - startX) * (180 / Math.PI)}deg)`;
                            radarScreen.appendChild(outlineLine);
                        }
                    }
                } else if (feature.position) {
                    const { lat: featLat, lon: featLon } = feature.position;
                    const distance = haversine(refLat, refLon, featLat, featLon, units.distance);
                    if (distance <= clippingRange) {
                        const bearing = calculateBearing(refLat, refLon, featLat, featLon);
                        const featureX = radarCenterX + Math.cos(((bearing - 90) * Math.PI) / 180) * distance * scaleFactor;
                        const featureY = radarCenterY + Math.sin(((bearing - 90) * Math.PI) / 180) * distance * scaleFactor;
                        if (feature.type === 'runway') {
                            const heading = feature.heading;
                            const lengthFeet = feature.length;
                            const lengthUnit = units.distance === 'km' ? lengthFeet * 0.0003048 : lengthFeet * 0.00018939;
                            const runway = document.createElement('div');
                            runway.className = 'runway';
                            runway.style.width = lengthUnit * scaleFactor + 'px';
                            runway.style.height = '1px';
                            runway.style.top = featureY + 'px';
                            runway.style.left = featureX + 'px';
                            runway.style.transformOrigin = '0 50%';
                            runway.style.transform = `rotate(${heading - 90}deg)`;
                            radarScreen.appendChild(runway);
                        }
                        if (feature.type === 'location') {
                            const locationDot = document.createElement('div');
                            locationDot.className = 'location-dot';
                            locationDot.title = feature.label ?? 'Location';
                            locationDot.style.top = featureY + 'px';
                            locationDot.style.left = featureX + 'px';
                            radarScreen.appendChild(locationDot);
                            if (feature.label) {
                                const label = document.createElement('div');
                                label.className = 'location-label';
                                label.textContent = feature.label || 'Location';
                                radarScreen.appendChild(label);
                                const labelRect = label.getBoundingClientRect();
                                const labelWidth = labelRect.width;
                                const labelHeight = labelRect.height;
                                label.style.top = featureY - labelHeight - 4 + 'px';
                                label.style.left = featureX - labelWidth / 2 + 'px';
                            }
                        }
                    }
                }
            });
        }
    }
}

function setupZoomHandlers(cardState, radarOverlay) {
    let initialPinchDistance = null;
    let initialRadarRange = null;

    function getPinchDistance(touches) {
        const [touch1, touch2] = touches;
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function handleWheel(event) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        cardState.radar.range += delta * 5; // Direct state mutation
        cardState.mainCard.updateRadarRange(0); // Should propagate updates
    }

    function handleTouchStart(event) {
        if (event.touches.length === 2) {
            initialPinchDistance = getPinchDistance(event.touches);
            initialRadarRange = cardState.radar.range;
        }
    }

    function handleTouchMove(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            const currentPinchDistance = getPinchDistance(event.touches);
            if (currentPinchDistance > 0 && initialPinchDistance > 0) {
                const pinchRatio = currentPinchDistance / initialPinchDistance;
                const newRadarRange = initialRadarRange / pinchRatio;
                cardState.radar.range = newRadarRange; // Mutate
                cardState.mainCard.updateRadarRange(0); // Trigger render with updated range
            }
        }
    }

    function handleTouchEnd() {
        initialPinchDistance = null;
        initialRadarRange = null;
        if (cardState.renderDynamicOnRangeChange && cardState.config.updateRangeFilterOnTouchEnd) {
            cardState.mainCard.renderDynamic();
        }
    }

    if (radarOverlay) {
        radarOverlay.addEventListener('wheel', handleWheel, { passive: false });
        radarOverlay.addEventListener('touchstart', handleTouchStart, { passive: true });
        radarOverlay.addEventListener('touchmove', handleTouchMove, { passive: false });
        radarOverlay.addEventListener('touchend', handleTouchEnd, { passive: true });
        radarOverlay.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }

    // Optional cleanup method
    return function cleanup() {
        if (radarOverlay) {
            radarOverlay.removeEventListener('wheel', handleWheel);
            radarOverlay.removeEventListener('touchstart', handleTouchStart);
            radarOverlay.removeEventListener('touchmove', handleTouchMove);
            radarOverlay.removeEventListener('touchend', handleTouchEnd);
            radarOverlay.removeEventListener('touchcancel', handleTouchEnd);
        }
    };
}

function renderStatic(cardState, mainCard) {
    mainCard.shadowRoot.innerHTML = '';

    const card = document.createElement('ha-card');
    card.id = 'flights-card';

    if (!cardState.radar?.hide) {
        const radarContainer = document.createElement('div');
        radarContainer.id = 'radar-container';

        const radarOverlay = document.createElement('div');
        radarOverlay.id = 'radar-overlay';
        radarContainer.appendChild(radarOverlay);

        const radarInfoDisplay = document.createElement('div');
        radarInfoDisplay.id = 'radar-info';
        radarContainer.appendChild(radarInfoDisplay);

        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'toggle-container';
        radarContainer.appendChild(toggleContainer);

        const radar = document.createElement('div');
        radar.id = 'radar';
        const radarScreenDiv = document.createElement('div');
        radarScreenDiv.id = 'radar-screen';
        radar.appendChild(radarScreenDiv);

        const tracker = document.createElement('div');
        tracker.id = 'tracker';
        radar.appendChild(tracker);

        const planesContainer = document.createElement('div');
        planesContainer.id = 'planes';
        radar.appendChild(planesContainer);

        radarContainer.appendChild(radar);
        card.appendChild(radarContainer);

        requestAnimationFrame(() => {
            renderRadarScreen(cardState);
            mainCard.observeRadarResize();
            setupZoomHandlers(cardState, radarOverlay);
        });

        cardState.dom = cardState.dom || {};
        cardState.dom.toggleContainer = toggleContainer;
        cardState.dom.planesContainer = planesContainer;
        cardState.dom.radar = radar;
        cardState.dom.radarScreen = radarScreenDiv;
        cardState.dom.radarInfoDisplay = radarInfoDisplay;
        cardState.dom.shadowRoot = mainCard.shadowRoot;
        cardState.mainCard = mainCard;
    }

    const flightsContainer = document.createElement('div');
    flightsContainer.id = 'flights';
    if (cardState.list && cardState.list.hide === true) {
        flightsContainer.style.display = 'none';
    }
    card.appendChild(flightsContainer);

    mainCard.shadowRoot.appendChild(card);

    renderStyle(cardState, mainCard.shadowRoot);

    if (cardState.dom?.toggleContainer) {
        renderToggles(cardState, cardState.dom.toggleContainer);
    }
}

function renderFlag(countryCode, countryName) {
    const flagElement = document.createElement('img');
    flagElement.setAttribute('src', `https://flagsapi.com/${countryCode}/shiny/16.png`);
    flagElement.setAttribute('title', `${countryName}`);
    flagElement.style.position = 'relative';
    flagElement.style.top = '3px';
    flagElement.style.left = '2px';
    return flagElement;
}

function renderRadar(cardState) {
    const { flights, radar, selectedFlights, dimensions, dom } = cardState;

    let flightsToRender;
    if (radar && radar.filter === true) {
        flightsToRender = cardState.flightsFiltered || flights;
    } else if (radar && radar.filter && typeof radar.filter === 'object') {
        flightsToRender = applyFilter(cardState, radar.filter);
    } else {
        flightsToRender = flights;
    }

    const planesContainer = dom?.planesContainer || document.getElementById('planes');
    if (!planesContainer) return;
    planesContainer.innerHTML = '';

    const { range: radarRange, scaleFactor, centerX: radarCenterX, centerY: radarCenterY } = dimensions;
    const clippingRange = radarRange * 1.15;

    flightsToRender
        .slice()
        .reverse()
        .forEach((flight) => {
            const distance = flight.distance_to_tracker;
            if (distance <= clippingRange) {
                const plane = document.createElement('div');
                plane.className = 'plane';

                const x = radarCenterX + Math.cos(((flight.heading_from_tracker - 90) * Math.PI) / 180) * distance * scaleFactor;
                const y = radarCenterY + Math.sin(((flight.heading_from_tracker - 90) * Math.PI) / 180) * distance * scaleFactor;

                plane.style.top = y + 'px';
                plane.style.left = x + 'px';

                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                arrow.style.transform = `rotate(${flight.heading}deg)`;
                plane.appendChild(arrow);

                const label = document.createElement('div');
                label.className = 'callsign-label';
                label.textContent = flight.callsign ?? flight.aircraft_registration ?? 'n/a';
                planesContainer.appendChild(label);

                const labelRect = label.getBoundingClientRect();
                const labelWidth = labelRect.width + 3;
                const labelHeight = labelRect.height + 6;

                label.style.top = y - labelHeight + 'px';
                label.style.left = x - labelWidth + 'px';

                if (flight.altitude <= 0) {
                    plane.classList.add('plane-small');
                } else {
                    plane.classList.add('plane-medium');
                }
                if (selectedFlights && selectedFlights.includes(flight.id)) {
                    plane.classList.add('selected');
                }

                plane.addEventListener('click', () => cardState.toggleSelectedFlight(flight));
                label.addEventListener('click', () => cardState.toggleSelectedFlight(flight));
                planesContainer.appendChild(plane);
            }
        });
}

function applyFilter$1(cardState, filter) {
    return cardState.flights.filter((flight) => applyConditions(cardState, flight, filter));
}

function applyConditions(cardState, flight, conditions) {
    if (Array.isArray(conditions)) {
        return conditions.every((condition) => applyCondition(cardState, flight, condition));
    } else {
        return applyCondition(cardState, flight, conditions);
    }
}

function applyCondition(cardState, flight, condition) {
    const { field, defined, defaultValue, _, comparator } = condition;
    const value = resolvePlaceholders(cardState, condition.value);

    let result = true;

    if (condition.type === 'AND') {
        result = condition.conditions.every((cond) => applyCondition(cardState, flight, cond));
    } else if (condition.type === 'OR') {
        result = condition.conditions.some((cond) => applyCondition(cardState, flight, cond));
    } else if (condition.type === 'NOT') {
        result = !applyCondition(cardState, flight, condition.condition);
    } else {
        const comparand = flight[field] ?? (defined ? resolvePlaceholders(cardState, '${' + defined + '}', defaultValue) : undefined);

        switch (comparator) {
            case 'eq':
                result = comparand === value;
                break;
            case 'lt':
                result = Number(comparand) < Number(value);
                break;
            case 'lte':
                result = Number(comparand) <= Number(value);
                break;
            case 'gt':
                result = Number(comparand) > Number(value);
                break;
            case 'gte':
                result = Number(comparand) >= Number(value);
                break;
            case 'oneOf': {
                result = (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((v) => v.trim()) : []).includes(comparand);
                break;
            }
            case 'containsOneOf': {
                result =
                    comparand && (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((v) => v.trim()) : []).some((val) => comparand.includes(val));
                break;
            }
            default:
                result = false;
        }
    }

    if (condition.debugIf === result) {
        console.debug('applyCondition', condition, flight, result);
    }

    return result;
}

const unitsConfig = {
    altitude: 'ft',
    speed: 'kts',
    distance: 'km'
};

const sortConfig = [
    { field: 'id', comparator: 'oneOf', value: '${selectedFlights}', order: 'DESC' },
    { field: 'altitude', comparator: 'eq', value: 0, order: 'ASC' },
    { field: 'closest_passing_distance ?? distance_to_tracker', order: 'ASC' }
];

const templateConfig = {
    img_element:
        '${flight.aircraft_photo_small ? `<img style="float: right; width: 120px; height: auto; marginLeft: 8px; border: 1px solid black;" src="${flight.aircraft_photo_small}" />` : ""}',
    icon: '${flight.altitude > 0 ? (flight.vertical_speed > 100 ? "airplane-takeoff" : flight.vertical_speed < -100 ? "airplane-landing" : "airplane") : "airport"}',
    icon_element: '<ha-icon style="float: left;" icon="mdi:${tpl.icon}"></ha-icon>',
    flight_info: '${joinList(" - ")(flight.airline_short, flight.flight_number, flight.callsign !== flight.flight_number ? flight.callsign : "")}',
    flight_info_element: '<div style="font-weight: bold; padding-left: 5px; padding-top: 5px;">${tpl.flight_info}</div>',
    header: '<div>${tpl.img_element}${tpl.icon_element}${tpl.flight_info_element}</div>',
    aircraft_info: '${joinList(" - ")(flight.aircraft_registration, flight.aircraft_model)}',
    aircraft_info_element: '${tpl.aircraft_info ? `<div>${tpl.aircraft_info}</div>` : ""}',
    departure_info:
        '${flight.altitude === 0 && flight.time_scheduled_departure ? ` (${new Date(flight.time_scheduled_departure * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}',
    origin_info: '${joinList("")(flight.airport_origin_code_iata, tpl.departure_info, flight.origin_flag)}',
    arrival_info: '',
    destination_info: '${joinList("")(flight.airport_destination_code_iata, tpl.arrival_info, flight.destination_flag)}',
    route_info: '${joinList(" -> ")(tpl.origin_info, tpl.destination_info)}',
    route_element: '<div>${tpl.route_info}</div>',
    alt_info: '${flight.alt_in_unit ? "Alt: " + flight.alt_in_unit + flight.climb_descend_indicator : undefined}',
    spd_info: '${flight.spd_in_unit ? "Spd: " + flight.spd_in_unit : undefined}',
    hdg_info: '${flight.heading ? "Hdg: " + flight.heading + "°" : undefined}',
    dist_info: '${flight.dist_in_unit ? "Dist: " + flight.dist_in_unit + flight.approach_indicator : undefined}',
    flight_status: '<div>${joinList(" - ")(tpl.alt_info, tpl.spd_info, tpl.hdg_info)}</div>',
    position_status: '<div>${joinList(" - ")(tpl.dist_info, flight.direction_info)}</div>',
    proximity_info:
        '<div style="font-weight: bold; font-style: italic;">${flight.is_approaching && flight.ground_speed > 70 && flight.closest_passing_distance < 15 ? `Closest Distance: ${flight.closest_passing_distance} ${units.distance}, ETA: ${flight.eta_to_closest_distance} min` : ""}</div>',
    flight_element: '${tpl.header}${tpl.aircraft_info_element}${tpl.route_element}${tpl.flight_status}${tpl.position_status}${tpl.proximity_info}',
    radar_range: 'Range: ${radar_range} ${units.distance}',
    list_status: '${flights.shown}/${flights.total}'
};

function parseSortField(obj, field) {
    return field.split(' ?? ').reduce((acc, cur) => acc ?? obj[cur], undefined);
}

/**
 * Returns a comparison function for sorting arrays of objects using config.
 * @param {Array} sortConfig Array of sort criteria
 * @param {Function} resolvePlaceholders Function to resolve placeholders (optional)
 */
function getSortFn(sortConfig, resolvePlaceholders = (v) => v) {
    return function (a, b) {
        for (let criterion of sortConfig) {
            const { field, comparator, order = 'ASC' } = criterion;
            const value = resolvePlaceholders(criterion.value);
            const fieldA = parseSortField(a, field);
            const fieldB = parseSortField(b, field);
            let result = 0;
            switch (comparator) {
                case 'eq':
                    if (fieldA === value && fieldB !== value) {
                        result = 1;
                    } else if (fieldA !== value && fieldB === value) {
                        result = -1;
                    }
                    break;
                case 'lt':
                    if (fieldA < value && fieldB >= value) {
                        result = 1;
                    } else if (fieldA >= value && fieldB < value) {
                        result = -1;
                    }
                    break;
                case 'lte':
                    if (fieldA <= value && fieldB > value) {
                        result = 1;
                    } else if (fieldA > value && fieldB <= value) {
                        result = -1;
                    }
                    break;
                case 'gt':
                    if (fieldA > value && fieldB <= value) {
                        result = 1;
                    } else if (fieldA <= value && fieldB > value) {
                        result = -1;
                    }
                    break;
                case 'gte':
                    if (fieldA >= value && fieldB < value) {
                        result = 1;
                    } else if (fieldA < value && fieldB >= value) {
                        result = -1;
                    }
                    break;
                case 'oneOf':
                    if (value !== undefined && value !== null && (Array.isArray(value) || typeof value === 'string')) {
                        const isAInValue = value.includes(fieldA);
                        const isBInValue = value.includes(fieldB);
                        if (isAInValue && !isBInValue) {
                            result = 1;
                        } else if (!isAInValue && isBInValue) {
                            result = -1;
                        }
                    }
                    break;
                case 'containsOneOf':
                    if (Array.isArray(value) && value.length > 0) {
                        const isAContainsValue = value.some((val) => (Array.isArray(fieldA) || typeof fieldA === 'string') && fieldA.includes(val));
                        const isBContainsValue = value.some((val) => (Array.isArray(fieldB) || typeof fieldB === 'string') && fieldB.includes(val));
                        if (isAContainsValue && !isBContainsValue) {
                            result = 1;
                        } else if (!isAContainsValue && isBContainsValue) {
                            result = -1;
                        }
                    }
                    break;
                default:
                    result = fieldA - fieldB;
                    break;
            }
            if (result !== 0) {
                return order.toUpperCase() === 'DESC' ? -result : result;
            }
        }
        return 0;
    };
}

const defaults = {
    flights_entity: 'sensor.flightradar24_current_in_area',
    projection_interval: 5,
    no_flights_message: 'No flights are currently visible. Please check back later.',
    list: { hide: false, showListStatus: true },
    units: unitsConfig,
    radar: {
        range: unitsConfig.distance === 'km' ? 35 : 25,
        background_map: 'none',
        background_map_opacity: 0,
        background_map_api_key: ''
    },
    sort: sortConfig,
    templates: templateConfig,
    defines: {}
};

class Flightradar24CardState {
    constructor() {
        this.hass = null;

        this.config = {};
        this.radar = {};
        this.list = {};

        this.templates = {};
        this.defines = {};
        this.units = {};
        this.flightsContext = {};

        this.dimensions = {};

        this.flights = [];
        this.selectedFlights = [];

        this.renderDynamicOnRangeChange = false;
        this._leafletMap = null;
    }

    setConfig(config) {
        if (!config) throw new Error('Configuration is missing.');
        this.config = Object.assign({}, config);

        this.config.flights_entity = config.flights_entity ?? defaults.flights_entity;
        this.config.projection_interval = config.projection_interval ?? defaults.projection_interval;
        this.config.no_flights_message = config.no_flights_message ?? defaults.no_flights_message;

        this.list = Object.assign({}, defaults.list, config.list);
        this.units = Object.assign({}, defaults.units, config.units);
        this.radar = Object.assign(
            {},
            {
                range: this.units.distance === 'km' ? defaults.radar.range : 25,
                background_map: config.radar?.background_map ?? defaults.radar.background_map,
                background_map_opacity: config.radar?.background_map_opacity ?? defaults.radar.background_map_opacity,
                background_map_api_key: config.radar?.background_map_api_key ?? defaults.radar.background_map_api_key
            },
            config.radar
        );
        this.radar.initialRange = this.radar.range;
        this.defines = Object.assign({}, defaults.defines, config.defines);

        this.sortFn = getSortFn(config.sort ?? defaults.sort, (value, defaultValue) =>
            resolvePlaceholders(value, this.defines, this.config, this.radar, this.selectedFlights)
        );
        this.templates = Object.assign({}, defaults.templates, config.templates);
    }

    toggleSelectedFlight(flight) {
        if (!this.selectedFlights) this.selectedFlights = [];
        if (!this.selectedFlights.includes(flight.id)) {
            this.selectedFlights.push(flight.id);
        } else {
            this.selectedFlights = this.selectedFlights.filter((id) => id !== flight.id);
        }
        if (typeof this.renderDynamicFn === 'function') {
            this.renderDynamicFn();
        }
    }

    setRenderDynamic(fn) {
        this.renderDynamicFn = fn;
    }

    setToggleValue(toggleKey, value) {
        if (this.config && this.config.toggles) {
            this.defines[toggleKey] = ['true', true, 1].includes(value);
            if (typeof this.renderDynamicFn === 'function') {
                this.renderDynamicFn();
            }
        }
    }
}

class Flightradar24Card extends HTMLElement {
    _radarResizeObserver;
    _zoomCleanup;
    _updateRequired = true;
    _timer = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cardState = new Flightradar24CardState();
        this.cardState.setRenderDynamic(() => this.renderDynamic());
    }

    setConfig(config) {
        if (!config) throw new Error('Configuration is missing.');
        this.cardState.setConfig(config);
        renderStatic(this.cardState, this);
        this.observeRadarResize();
    }

    set hass(hass) {
        this.cardState.hass = hass;
        this.subscribeToStateChanges(hass);
        if (this._updateRequired) {
            this._updateRequired = false;
            this.fetchFlightsData();
            this.updateCardDimensions();
            ensureLeafletLoadedIfNeeded(this.cardState, this.shadowRoot, () => {
                renderRadarScreen(this.cardState);
                renderRadar(this.cardState);
            });
            this.renderDynamic();
        }
    }

    connectedCallback() {
        this.observeRadarResize();
    }

    disconnectedCallback() {
        if (this._radarResizeObserver) {
            this._radarResizeObserver.disconnect();
            this._radarResizeObserver = null;
        }
        if (this.cardState._leafletMap && this.cardState._leafletMap.remove) {
            this.cardState._leafletMap.remove();
            this.cardState._leafletMap = null;
        }
        if (this._zoomCleanup) {
            this._zoomCleanup();
            this._zoomCleanup = null;
        }
    }

    updateCardDimensions() {
        const radarElem = this.shadowRoot.getElementById('radar');
        const width = radarElem?.clientWidth || 400;
        const height = radarElem?.clientHeight || 400;
        const range = this.cardState.radar.range;
        const scaleFactor = width / (range * 2);
        this.cardState.dimensions = {
            width,
            height,
            range,
            scaleFactor,
            centerX: width / 2,
            centerY: height / 2
        };
        if (this.cardState.radar.hide !== true) {
            renderRadarScreen(this.cardState);
            renderRadar(this.cardState);
        }
    }

    observeRadarResize() {
        const radar = this.shadowRoot.getElementById('radar');
        if (!radar) return;
        if (this._radarResizeObserver) this._radarResizeObserver.disconnect();
        this._radarResizeObserver = new ResizeObserver(() => {
            this.updateCardDimensions();
        });
        this._radarResizeObserver.observe(radar);
        const radarOverlay = this.shadowRoot.getElementById('radar-overlay');
        if (this._zoomCleanup) this._zoomCleanup();
        this._zoomCleanup = setupZoomHandlers(this.cardState, radarOverlay);
    }

    renderDynamic() {
        const flightsContainer = this.shadowRoot.getElementById('flights');
        if (!flightsContainer) return;

        const fragment = document.createDocumentFragment();
        if (this.cardState.list && this.cardState.list.hide === true) {
            flightsContainer.style.display = 'none';
            return;
        } else {
            flightsContainer.style.display = '';
        }

        const filter = this.cardState.config.filter
            ? this.cardState.selectedFlights && this.cardState.selectedFlights.length > 0
                ? [
                      {
                          type: 'OR',
                          conditions: [
                              {
                                  field: 'id',
                                  comparator: 'oneOf',
                                  value: this.cardState.selectedFlights
                              },
                              { type: 'AND', conditions: this.cardState.config.filter }
                          ]
                      }
                  ]
                : this.cardState.config.filter
            : undefined;

        const flightsTotal = this.cardState.flights.length;
        const flightsFiltered = filter ? applyFilter$1(this.cardState, filter) : this.cardState.flights;
        const flightsShown = flightsFiltered.length;

        flightsFiltered.sort(this.cardState.sortFn);

        if (this.cardState.radar.hide !== true) {
            requestAnimationFrame(() => {
                renderRadar(this.cardState);
            });
        }

        if (this.cardState.list && this.cardState.list.showListStatus === true && flightsTotal > 0) {
            this.cardState.flightsContext = {
                shown: flightsShown,
                total: flightsTotal,
                filtered: flightsFiltered.length
            };
            const listStatusDiv = document.createElement('div');
            listStatusDiv.className = 'list-status';
            listStatusDiv.innerHTML = parseTemplate(
                this.cardState,
                'list_status',
                null,
                (joinWith) =>
                    (...elements) =>
                        elements?.filter((e) => e).join(joinWith || ' ')
            );
            fragment.appendChild(listStatusDiv);
        }

        if (flightsShown === 0) {
            if (this.cardState.config.no_flights_message !== '') {
                const noFlightsMessage = document.createElement('div');
                noFlightsMessage.className = 'no-flights-message';
                noFlightsMessage.textContent = this.cardState.config.no_flights_message;
                fragment.appendChild(noFlightsMessage);
            }
        } else {
            flightsFiltered.forEach((flight, idx) => {
                const flightElement = this.renderFlight(flight);
                if (idx === 0) {
                    flightElement.className += ' first';
                }
                fragment.appendChild(flightElement);
            });
        }

        flightsContainer.innerHTML = '';
        flightsContainer.appendChild(fragment);
    }

    updateRadarRange(delta) {
        const minRange = this.cardState.radar.min_range || 1;
        const maxRange = this.cardState.radar.max_range || Math.max(100, this.cardState.radar.initialRange);
        let newRange = this.cardState.radar.range + delta;
        if (newRange < minRange) newRange = minRange;
        if (newRange > maxRange) newRange = maxRange;
        this.cardState.radar.range = newRange;
        this.updateCardDimensions();
        if (this.cardState.renderDynamicOnRangeChange && this.cardState.config.updateRangeFilterOnTouchEnd !== true) {
            this.renderDynamic();
        }
    }

    renderFlight(_flight) {
        const flight = Object.assign({}, _flight);
        [
            'flight_number',
            'callsign',
            'aircraft_registration',
            'aircraft_model',
            'aircraft_code',
            'airline',
            'airline_short',
            'airline_iata',
            'airline_icao',
            'airport_origin_name',
            'airport_origin_code_iata',
            'airport_origin_code_icao',
            'airport_origin_country_name',
            'airport_origin_country_code',
            'airport_destination_name',
            'airport_destination_code_iata',
            'airport_destination_code_icao',
            'airport_destination_country_name',
            'airport_destination_country_code'
        ].forEach((field) => (flight[field] = this.flightField(flight, field)));
        flight.origin_flag = flight.airport_origin_country_code ? renderFlag(flight.airport_origin_country_code, flight.airport_origin_country_name).outerHTML : '';
        flight.destination_flag = flight.airport_destination_country_code
            ? renderFlag(flight.airport_destination_country_code, flight.airport_destination_country_name).outerHTML
            : '';

        flight.climb_descend_indicator = Math.abs(flight.vertical_speed) > 100 ? (flight.vertical_speed > 100 ? '↑' : '↓') : '';
        flight.alt_in_unit =
            flight.altitude >= 17750
                ? `FL${Math.round(flight.altitude / 1000) * 10}`
                : flight.altitude > 0
                ? this.cardState.units.altitude === 'm'
                    ? `${Math.round(flight.altitude * 0.3048)} m`
                    : `${Math.round(flight.altitude)} ft`
                : undefined;

        flight.spd_in_unit =
            flight.ground_speed > 0
                ? this.cardState.units.speed === 'kmh'
                    ? `${Math.round(flight.ground_speed * 1.852)} km/h`
                    : this.cardState.units.speed === 'mph'
                    ? `${Math.round(flight.ground_speed * 1.15078)} mph`
                    : `${Math.round(flight.ground_speed)} kts`
                : undefined;

        flight.approach_indicator = flight.ground_speed > 70 ? (flight.is_approaching ? '↓' : flight.is_receding ? '↑' : '') : '';
        flight.dist_in_unit = `${Math.round(flight.distance_to_tracker)} ${this.cardState.units.distance}`;
        flight.direction_info = `${Math.round(flight.heading_from_tracker)}° ${flight.cardinal_direction_from_tracker}`;

        const flightElement = document.createElement('div');
        flightElement.style.clear = 'both';
        flightElement.className = 'flight';

        if (this.cardState.selectedFlights && this.cardState.selectedFlights.includes(flight.id)) {
            flightElement.className += ' selected';
        }

        flightElement.innerHTML = parseTemplate(
            this.cardState,
            'flight_element',
            flight,
            (joinWith) =>
                (...elements) =>
                    elements?.filter((e) => e).join(joinWith || ' ')
        );
        flightElement.addEventListener('click', () => this.cardState.toggleSelectedFlight(flight));

        return flightElement;
    }

    flightField(flight, field) {
        let text = flight[field];
        if (this.cardState.config.annotate) {
            const f = Object.assign({}, flight);
            this.cardState.config.annotate
                .filter((a) => a.field === field)
                .forEach((a) => {
                    if (
                        applyConditions(flight, a.conditions, (value, defaultValue) =>
                            resolvePlaceholders(value, this.cardState.defines, this.cardState.config, this.cardState.radar, this.cardState.selectedFlights)
                        )
                    ) {
                        f[field] = a.render.replace(/\$\{([^}]*)\}/g, (_, p1) => f[p1]);
                    }
                });
            text = f[field];
        }
        return text;
    }

    subscribeToStateChanges(hass) {
        if (!this.cardState.config.test && this.cardState.config.update !== false) {
            hass.connection.subscribeEvents((event) => {
                if (event.data.entity_id === this.cardState.config.flights_entity || event.data.entity_id === this.cardState.config.location_tracker) {
                    this._updateRequired = true;
                }
            }, 'state_changed');
        }
    }

    fetchFlightsData() {
        this._timer = clearInterval(this._timer);
        const entityState = this.cardState.hass.states[this.cardState.config.flights_entity];
        if (entityState) {
            try {
                this.cardState.flights = parseFloat(entityState.state) > 0 && entityState.attributes.flights ? JSON.parse(JSON.stringify(entityState.attributes.flights)) : [];
            } catch (error) {
                console.error('Error fetching or parsing flight data:', error);
                this.cardState.flights = [];
            }
        } else {
            throw new Error('Flights entity state is undefined. Check the configuration.');
        }

        const { moving } = this.calculateFlightData();
        if (this.cardState.config.projection_interval) {
            if (moving && !this._timer) {
                clearInterval(this._timer);
                this._timer = setInterval(() => {
                    if (this.cardState.hass) {
                        const { projected } = this.calculateFlightData();
                        if (projected) {
                            this.renderDynamic();
                        }
                    }
                }, this.cardState.config.projection_interval * 1000);
            } else if (!moving) {
                clearInterval(this._timer);
            }
        }
    }

    calculateFlightData() {
        let projected = false;
        let moving = false;
        const currentTime = Date.now() / 1000;
        const location = getLocation(this.cardState);
        if (location) {
            const refLat = location.latitude;
            const refLon = location.longitude;

            this.cardState.flights.forEach((flight) => {
                if (!flight._timestamp) {
                    flight._timestamp = currentTime;
                }

                moving = moving || flight.ground_speed > 0;

                const timeElapsed = currentTime - flight._timestamp;
                if (timeElapsed > 1) {
                    projected = true;

                    flight._timestamp = currentTime;

                    const newPosition = calculateNewPosition(flight.latitude, flight.longitude, flight.heading, ((flight.ground_speed * 1.852) / 3600) * timeElapsed);

                    flight.latitude = newPosition.lat;
                    flight.longitude = newPosition.lon;
                    const newAltitude = Math.max(flight.altitude + (timeElapsed / 60) * flight.vertical_speed, 0);
                    if (flight.landed || (newAltitude !== flight.altitude && newAltitude === 0)) {
                        flight.landed = true;
                        flight.ground_speed = Math.max(flight.ground_speed - 15 * timeElapsed, 15);
                    }
                    flight.altitude = newAltitude;
                }

                flight.distance_to_tracker = haversine(refLat, refLon, flight.latitude, flight.longitude, this.cardState.units.distance);

                flight.heading_from_tracker = calculateBearing(refLat, refLon, flight.latitude, flight.longitude);
                flight.cardinal_direction_from_tracker = getCardinalDirection(flight.heading_from_tracker);
                const heading_to_tracker = (flight.heading_from_tracker + 180) % 360;
                flight.is_approaching = areHeadingsAligned(heading_to_tracker, flight.heading);
                flight.is_receding = areHeadingsAligned(flight.heading_from_tracker, flight.heading);

                if (flight.is_approaching) {
                    let closestPassingLatLon = calculateClosestPassingPoint(refLat, refLon, flight.latitude, flight.longitude, flight.heading);

                    flight.closest_passing_distance = Math.round(haversine(refLat, refLon, closestPassingLatLon.lat, closestPassingLatLon.lon, this.cardState.units.distance));
                    const eta_to_closest_distance = this.calculateETA(flight.latitude, flight.longitude, closestPassingLatLon.lat, closestPassingLatLon.lon, flight.ground_speed);
                    flight.eta_to_closest_distance = Math.round(eta_to_closest_distance);

                    if (flight.vertical_speed < 0 && flight.altitude > 0) {
                        const timeToTouchdown = flight.altitude / Math.abs(flight.vertical_speed);
                        const touchdownLatLon = calculateNewPosition(flight.latitude, flight.longitude, flight.heading, (flight.ground_speed * timeToTouchdown) / 60);
                        const touchdownDistance = haversine(refLat, refLon, touchdownLatLon.lat, touchdownLatLon.lon, this.cardState.units.distance);

                        if (timeToTouchdown < eta_to_closest_distance) {
                            flight.is_landing = true;
                            flight.closest_passing_distance = Math.round(touchdownDistance);
                            flight.eta_to_closest_distance = Math.round(timeToTouchdown);
                            closestPassingLatLon = touchdownLatLon;
                        }
                    }

                    flight.heading_from_tracker_to_closest_passing = Math.round(calculateBearing(refLat, refLon, closestPassingLatLon.lat, closestPassingLatLon.lon));
                } else {
                    delete flight.closest_passing_distance;
                    delete flight.eta_to_closest_distance;
                    delete flight.heading_from_tracker_to_closest_passing;
                    delete flight.is_landing;
                }
            });
        } else {
            console.error('Tracker state is undefined. Make sure the location tracker entity ID is correct.');
        }

        return { projected, moving };
    }

    calculateETA(fromLat, fromLon, toLat, toLon, groundSpeed) {
        const distance = haversine(fromLat, fromLon, toLat, toLon, this.cardState.units.distance);
        if (groundSpeed === 0) {
            return Infinity;
        }

        const groundSpeedDistanceUnitsPrMin = (groundSpeed * (this.cardState.units.distance === 'km' ? 1.852 : 1.15078)) / 60;
        const eta = distance / groundSpeedDistanceUnitsPrMin;
        return eta;
    }

    toggleSelectedFlight(flight) {
        if (!this.cardState.selectedFlights) this.cardState.selectedFlights = [];
        if (!this.cardState.selectedFlights.includes(flight.id)) {
            this.cardState.selectedFlights.push(flight.id);
        } else {
            this.cardState.selectedFlights = this.cardState.selectedFlights.filter((id) => id !== flight.id);
        }
        this.renderDynamic();
    }

    get hass() {
        return this.cardState.hass;
    }
}

customElements.define('flightradar24-card', Flightradar24Card);
