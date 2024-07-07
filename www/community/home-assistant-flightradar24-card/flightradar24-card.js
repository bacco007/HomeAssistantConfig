class Flightradar24Card extends HTMLElement {
  _hass;
  _flightsData = [];
  _updateRequired = true;

  radarConfig = undefined;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this._updateRequired = true;
    this._flightsData = [];
    this.config = null;
    this._hass = null;
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Configuration is missing.');
    }

    this.config = Object.assign({}, config);
    this.config.flights_entity = config.flights_entity ?? 'sensor.flightradar24_current_in_area';
    this.config.projection_interval = config.projection_interval ?? 5;
    this.config.no_flights_message = config.no_flights_message ?? 'No flights are currently visible. Please check back later.';
    this.units = Object.assign({ altitude: 'ft', speed: 'kts', distance: 'km' }, config.units);
    this.radar = Object.assign({ range: this.units.distance === 'km' ? 35 : 25 }, config.radar);
    this.defines = Object.assign({}, config.defines);
    this.sortFn = this.getSortFn(
      config.sort ?? [
        { field: 'id', comparator: 'oneOf', value: '${selectedFlights}', order: 'DESC' },
        { field: 'altitude', comparator: 'eq', value: 0, order: 'ASC' },
        { field: 'closest_passing_distance ?? distance_to_tracker', order: 'DESC' }
      ]
    );

    this.templates = Object.assign(
      {
        img_element:
          '${flight.aircraft_photo_small ? `<img style="float: right; width: 120px; height: auto; marginLeft: 8px; border: 1px solid black;" src="${flight.aircraft_photo_small}" />` : ""}',
        icon: '${flight.altitude > 0 ? (flight.vertical_speed > 100 ? "airplane-takeoff" : flight.vertical_speed < -100 ? "airplane-landing" : "airplane") : "airport"}',
        icon_element: '<ha-icon style="float: left;" icon="mdi:${tpl.icon}"></ha-icon>',
        flight_info: '${[flight.airline_short, flight.flight_number, flight.callsign !== flight.flight_number ? flight.callsign : ""].filter((el) => el).join(" - ")}',
        flight_info_element: '<div style="font-weight: bold; padding-left: 5px; padding-top: 5px;">${tpl.flight_info}</div>',
        header: '<div>${tpl.img_element}${tpl.icon_element}${tpl.flight_info_element}</div>',
        aircraft_info: '${[flight.aircraft_registration, flight.aircraft_model].filter((el) => el).join(" - ")}',
        aircraft_info_element: '${tpl.aircraft_info ? `<div>${tpl.aircraft_info}</div>` : ""}',
        departure_info:
          '${flight.altitude === 0 && flight.time_scheduled_departure ? ` (${new Date(flight.time_scheduled_departure * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})` : ""}',
        origin_info: '${[flight.airport_origin_code_iata, tpl.departure_info, flight.origin_flag].filter((el) => el).join("")}',
        arrival_info: '',
        destination_info: '${[flight.airport_destination_code_iata, tpl.arrival_info, flight.destination_flag].filter((el) => el).join(" ")}',
        route_info: '${[tpl.origin_info, tpl.destination_info].filter((el) => el).join(" -> ")}',
        route_element: '<div>${tpl.route_info}</div>',
        flight_status: '<div>${[flight.alt_info, flight.spd_info, flight.hdg_info].filter((el) => el).join(" - ")}</div>',
        position_status: '<div>${[flight.dist_info, flight.direction_info].filter((el) => el).join(" - ")}</div>',
        proximity_info:
          '<div style="font-weight: bold; font-style: italic;">${flight.is_approaching && flight.ground_speed > 70 && flight.closest_passing_distance < 15 ? `Closest Distance: ${Math.round(flight.closest_passing_distance)} ${units.distance}, ETA: ${Math.round(flight.eta_to_closest_distance)} min` : ""}</div>',
        flight_element: '${tpl.header}${tpl.aircraft_info_element}${tpl.route_element}${tpl.flight_status}${tpl.position_status}${tpl.proximity_info}'
      },
      config.templates,
      {}
    );

    this.renderStatic();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!oldHass) {
      this.subscribeToStateChanges(hass);
    }

    if (this._updateRequired) {
      this._updateRequired = false;
      this.fetchFlightsData();
      this.renderRadarScreen();
      this.renderDynamic();
    }
  }

  renderStatic() {
    this.shadowRoot.innerHTML = '';

    this.renderStyle();

    const card = document.createElement('ha-card');
    card.id = 'flights-card';

    if (this.radar.hide !== true) {
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

      const radarScreen = document.createElement('div');
      radarScreen.id = 'radar-screen';
      radar.appendChild(radarScreen);

      const tracker = document.createElement('div');
      tracker.id = 'tracker';
      radar.appendChild(tracker);

      const planesContainer = document.createElement('div');
      planesContainer.id = 'planes';
      radar.appendChild(planesContainer);

      radarContainer.appendChild(radar);
      card.appendChild(radarContainer);

      requestAnimationFrame(() => {
        this.renderRadarScreen();
      });
    }

    const flightsContainer = document.createElement('div');
    flightsContainer.id = 'flights';

    card.appendChild(flightsContainer);

    this.shadowRoot.appendChild(card);

    this.attachEventListeners();
    this.renderToggles();
  }

  renderToggles() {
    const toggleContainer = this.shadowRoot.getElementById('toggle-container');
    if (this.config.toggles && toggleContainer) {
      for (const toggleKey in this.config.toggles) {
        if (this.config.toggles.hasOwnProperty(toggleKey)) {
          const toggle = this.config.toggles[toggleKey];

          const toggleElement = document.createElement('div');
          toggleElement.className = 'toggle';

          const label = document.createElement('label');
          label.textContent = toggle.label;

          const input = document.createElement('ha-switch');
          input.checked = toggle.default;
          input.addEventListener('change', () => {
            this.defines[toggleKey] = input.checked;
            this.renderDynamic();
          });

          toggleElement.appendChild(label);
          toggleElement.appendChild(input);

          toggleContainer.appendChild(toggleElement);
        }
      }
    }
  }

  renderDynamic() {
    const flightsContainer = this.shadowRoot.getElementById('flights');
    if (!flightsContainer) return;
    flightsContainer.innerHTML = '';

    const filter = this.config.filter
      ? this._selectedFlights && this._selectedFlights.length > 0
        ? [
            {
              type: 'OR',
              conditions: [
                { field: 'id', comparator: 'oneOf', value: this._selectedFlights },
                { type: 'AND', conditions: this.config.filter }
              ]
            }
          ]
        : this.config.filter
      : undefined;
    const flightsData = filter ? this.applyFilter(this._flightsData, filter) : this._flightsData;
    flightsData.sort(this.sortFn);

    if (this.radar.hide !== true) {
      requestAnimationFrame(() => {
        this.renderRadar(
          this.radar.filter === true
            ? flightsData
            : this.radar.filter && typeof this.radar.filter === 'object'
            ? this.applyFilter(this._flightsData, this.radar.filter)
            : this._flightsData
        );
      });
    }

    if (flightsData.length === 0) {
      if (this.config.no_flights_message !== '') {
        const noFlightsMessage = document.createElement('div');
        noFlightsMessage.className = 'no-flights-message';
        noFlightsMessage.textContent = this.config.no_flights_message;
        flightsContainer.appendChild(noFlightsMessage);
      }
    } else {
      flightsData.forEach((flight) => {
        const flightElement = this.renderFlight(flight);
        flightsContainer.appendChild(flightElement);
      });
    }
  }

  renderRadarScreen() {
    const radarInfoDisplay = this.shadowRoot.getElementById('radar-info');
    if (radarInfoDisplay) {
      const infoElements = [this.config.radar?.hide_range !== true ? `Range: ${Math.round(this.radar.range)}${this.units.distance}` : ''].filter((el) => el);
      radarInfoDisplay.innerHTML = infoElements.join('<br />');
    }

    const radarScreen = this.shadowRoot.getElementById('radar-screen');
    if (radarScreen) {
      radarScreen.innerHTML = '';
    }

    const radar = this.shadowRoot.getElementById('radar');
    if (radar) {
      const radarWidth = radar.clientWidth;
      const radarHeight = radar.clientHeight;
      const radarRange = this.radar.range;

      const scaleFactor = radarWidth / (radarRange * 2); // Adjust based on the radar width
      const clippingRange = radarRange * 1.15;

      const radarCenterX = radarWidth / 2;
      const radarCenterY = radarHeight / 2;

      const radarScreenBackground = document.createElement('div');
      radarScreenBackground.id = 'radar-screen-background';
      radarScreen.appendChild(radarScreenBackground);

      const ringDistance = 10; // Distance between rings in km or miles
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

      if (this.radar.local_features && this.hass) {
        const location = this.getLocation();
        if (location) {
          const refLat = location.latitude;
          const refLon = location.longitude;

          this.radar.local_features.forEach((feature) => {
            if (feature.type === 'outline' && feature.points && feature.points.length > 1) {
              for (let i = 0; i < feature.points.length - 1; i++) {
                const start = feature.points[i];
                const end = feature.points[i + 1];

                const startDistance = this.haversine(refLat, refLon, start.lat, start.lon);
                const endDistance = this.haversine(refLat, refLon, end.lat, end.lon);

                if (startDistance <= clippingRange || endDistance <= clippingRange) {
                  const startBearing = this.calculateBearing(refLat, refLon, start.lat, start.lon);
                  const endBearing = this.calculateBearing(refLat, refLon, end.lat, end.lon);

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
            } else {
              const { lat: featLat, lon: featLon } = feature.position;

              const distance = this.haversine(refLat, refLon, featLat, featLon);

              if (distance <= clippingRange) {
                const bearing = this.calculateBearing(refLat, refLon, featLat, featLon);

                const featureX = radarCenterX + Math.cos(((bearing - 90) * Math.PI) / 180) * distance * scaleFactor;
                const featureY = radarCenterY + Math.sin(((bearing - 90) * Math.PI) / 180) * distance * scaleFactor;

                if (feature.type === 'runway') {
                  const heading = feature.heading;
                  const lengthFeet = feature.length;

                  const lengthUnit = this.units.distance === 'km' ? lengthFeet * 0.0003048 : lengthFeet * 0.00018939;

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
  }

  renderRadar(flightsData) {
    const planesContainer = this.shadowRoot.getElementById('planes');
    planesContainer.innerHTML = '';

    const radar = this.shadowRoot.getElementById('radar');
    if (radar) {
      const radarWidth = radar.clientWidth;
      const radarHeight = radar.clientHeight;
      const radarRange = this.radar.range;

      const scaleFactor = radarWidth / (radarRange * 2); // Adjust based on the radar width
      const clippingRange = radarRange * 1.15;

      const radarCenterX = radarWidth / 2;
      const radarCenterY = radarHeight / 2;

      flightsData
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

            arrow.style.transform = `rotate(${flight.heading}deg)`; // Rotate arrow based on flight heading

            plane.appendChild(arrow);

            const label = document.createElement('div');
            label.className = 'callsign-label';
            label.textContent = flight.callsign ?? flight.aircraft_registration ?? 'n/a';

            planesContainer.appendChild(label);

            const labelRect = label.getBoundingClientRect();
            const labelWidth = labelRect.width + 3;
            const labelHeight = labelRect.height + 6;

            label.style.top = y - labelHeight + 'px'; // Offset by the label's height
            label.style.left = x - labelWidth + 'px'; // Offset by the label's width

            if (flight.altitude <= 0) {
              plane.classList.add('plane-small');
            } else {
              plane.classList.add('plane-medium');
            }
            plane.addEventListener('click', () => this.toggleSelectedFlight(flight));
            label.addEventListener('click', () => this.toggleSelectedFlight(flight));

            planesContainer.appendChild(plane);
          }
        });
    }
  }

  updateRadarRange(delta) {
    const minRange = this.radar.min_range || 1;
    const maxRange = this.radar.max_range || 100;
    let newRange = this.radar.range + delta;

    if (newRange < minRange) newRange = minRange;
    if (newRange > maxRange) newRange = maxRange;

    this.radar.range = newRange;

    this.renderRadarScreen();

    this.renderRadar(
      this.radar.filter === true
        ? this.applyFilter(this._flightsData, this.config.filter)
        : this.radar.filter && typeof this.radar.filter === 'object'
        ? this.applyFilter(this._flightsData, this.radar.filter)
        : this._flightsData
    );
  }

  renderFlight(_flight) {
    const flight = Object.assign({}, _flight);
    [
      'flight_number',
      'callsign',
      'aircraft_registration',
      'aircraft_model',
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
    flight.origin_flag = flight.airport_origin_country_code ? this.renderFlag(flight.airport_origin_country_code, flight.airport_origin_country_name).outerHTML : '';
    flight.destination_flag = flight.airport_destination_country_code
      ? this.renderFlag(flight.airport_destination_country_code, flight.airport_destination_country_name).outerHTML
      : '';

    flight.climb_descend_indicator = Math.abs(flight.vertical_speed) > 100 ? (flight.vertical_speed > 100 ? '↑' : '↓') : '';
    flight.alt_info =
      flight.altitude >= 17750
        ? `Alt: FL${Math.round(flight.altitude / 1000) * 10}${flight.climb_descend_indicator}`
        : flight.altitude > 0
        ? this.units.altitude === 'm'
          ? `Alt: ${Math.round(flight.altitude * 0.3048)} m${flight.climb_descend_indicator}`
          : `Alt: ${Math.round(flight.altitude)} ft${flight.climb_descend_indicator}`
        : undefined;

    flight.spd_info =
      flight.ground_speed > 0
        ? this.units.speed === 'kmh'
          ? `Spd: ${Math.round(flight.ground_speed * 1.852)} km/h`
          : this.units.speed === 'mph'
          ? `Spd: ${Math.round(flight.ground_speed * 1.15078)} mph`
          : `Spd: ${Math.round(flight.ground_speed)} kts`
        : undefined;

    flight.hdg_info = flight.heading !== undefined ? `Hdg: ${Math.round(flight.heading)}°` : undefined;

    flight.approach_indicator = flight.ground_speed > 70 ? (flight.is_approaching ? '↓' : '↑') : '';
    flight.dist_info = `Dist: ${Math.round(flight.distance_to_tracker)}${flight.approach_indicator} ${this.units.distance}`;
    flight.direction_info = `${Math.round(flight.heading_from_tracker)}° ${flight.cardinal_direction_from_tracker}`;

    const flightElement = document.createElement('div');
    flightElement.style.clear = 'both';
    flightElement.className = 'flight';

    if (this._selectedFlights && this._selectedFlights.includes(flight.id)) {
      flightElement.className += ' selected';
    }

    flightElement.innerHTML = this.parseTemplate('flight_element', flight);

    return flightElement;
  }

  renderFlag(countryCode, countryName) {
    const flagElement = document.createElement('img');
    flagElement.setAttribute('src', `https://flagsapi.com/${countryCode}/shiny/16.png`);
    flagElement.setAttribute('title', `${countryName}`);
    flagElement.style.position = 'relative';
    flagElement.style.top = '3px';
    flagElement.style.left = '2px';
    return flagElement;
  }

  renderStyle() {
    const radarPrimaryColor = this.radar['primary-color'] || 'var(--dark-primary-color)';
    const radarAccentColor = this.radar['accent-color'] || 'var(--accent-color)';
    const callsignLabelColor = this.radar['callsign-label-color'] || 'var(--primary-background-color)';
    const featureColor = this.radar['feature-color'] || 'var(--secondary-text-color)';

    const style = document.createElement('style');
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
        flex: 1; /* Ensure the label and switch are aligned properly */
      }
      #radar {
        position: relative;
        width: 70%;
        height: 0;
        margin: 0 15%;
        padding-bottom: 70%; /* Maintain aspect ratio (1:1) */
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
    this.shadowRoot.appendChild(style);
  }

  applyFilter(flights, filter) {
    return flights.filter((flight) => this.applyConditions(flight, filter));
  }

  applyConditions(flight, conditions) {
    if (Array.isArray(conditions)) {
      return conditions.every((condition) => this.applyCondition(flight, condition));
    } else {
      return this.applyCondition(flight, conditions);
    }
  }

  applyCondition(flight, condition) {
    const { field, defined, defaultValue, _, comparator } = condition;
    const value = this.resolvePlaceholders(condition.value);

    let result = true;

    if (condition.type === 'AND') {
      result = condition.conditions.every((cond) => this.applyCondition(flight, cond));
    } else if (condition.type === 'OR') {
      result = condition.conditions.some((cond) => this.applyCondition(flight, cond));
    } else if (condition.type === 'NOT') {
      result = !this.applyCondition(flight, condition.condition);
    } else {
      const comparand = flight[field] ?? (defined ? this.resolvePlaceholders('${' + defined + '}', defaultValue) : undefined);

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
          result = comparand && (Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((v) => v.trim()) : []).some((val) => comparand.includes(val));
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

  flightField(flight, field) {
    let text = flight[field];
    if (this.config.annotate) {
      const f = Object.assign({}, flight);
      this.config.annotate
        .filter((a) => a.field === field)
        .forEach((a) => {
          if (this.applyConditions(flight, a.conditions)) {
            f[field] = a.render.replace(/\$\{([^}]*)\}/g, (_, p1) => f[p1]);
          }
        });
      text = f[field];
    }
    return text;
  }

  parseTemplate(templateId, flight, trace = []) {
    if (trace.includes(templateId)) {
      console.error('Circular template dependencies detected. ' + trace.join(' -> ') + ' -> ' + templateId);
      return '';
    }
    let template = this.templates[templateId];
    if (template === undefined) {
      console.error('Missing template reference. tpl.' + templateId);
      return '';
    }

    const tpl = {};
    const tagRegex = /\${([^{}]*)}/g;
    const tplRegex = /tpl\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;

    let tagMatch;
    while ((tagMatch = tagRegex.exec(template)) !== null) {
      let tplMatch;
      while ((tplMatch = tplRegex.exec(tagMatch[1])) !== null) {
        tpl[tplMatch[1]] = this.parseTemplate(tplMatch[1], flight, [...trace, templateId]);
      }
    }

    try {
      const parsedTemplate = new Function('flight', 'tpl', 'units', `return \`${template.replace(/\${(.*?)}/g, (_, expr) => `\${${expr}}`)}\``)(flight, tpl, this.units);
      return parsedTemplate;
    } catch (e) {
      console.error('Error when rendering: ' + template, e);
      return '';
    }
  }

  resolvePlaceholders(value, defaultValue) {
    if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
      const key = value.slice(2, -1);
      if (key === 'selectedFlights') {
        return this._selectedFlights;
      } else if (key in this.defines) {
        return this.defines[key];
      } else if (key in this.config.toggles) {
        return this.config.toggles[key].default;
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        } else {
          console.error('Unresolved placeholder: ' + key);
          console.debug('Defines', this.defines);
        }
      }
    }

    return value;
  }

  getLocation() {
    if (this.config.location_tracker && this.config.location_tracker in this._hass.states) {
      return this._hass.states[this.config.location_tracker].attributes;
    } else if (this.config.location) {
      return { latitude: this.config.location.lat, longitude: this.config.location.lon };
    } else {
      return {
        latitude: this._hass.config.latitude,
        longitude: this._hass.config.longitude
      };
    }
  }

  subscribeToStateChanges(hass) {
    if (!this.config.test && this.config.update !== false) {
      hass.connection.subscribeEvents((event) => {
        if (event.data.entity_id === this.config.flights_entity || event.data.entity_id === this.config.location_tracker) {
          this._updateRequired = true;
        }
      }, 'state_changed');
    }
  }

  fetchFlightsData() {
    this._timer = clearInterval(this._timer);
    const entityState = this.hass.states[this.config.flights_entity];
    if (entityState) {
      try {
        this._flightsData = entityState.attributes.flights ? JSON.parse(JSON.stringify(entityState.attributes.flights)) : [];
      } catch (error) {
        console.error('Error fetching or parsing flight data:', error);
      }
    } else {
      console.error('Flights entity state is undefined. Check the configuration.');
    }

    const { moving } = this.calculateFlightData();
    if (this.config.projection_interval) {
      if (moving && !this._timer) {
        clearInterval(this._timer);
        this._timer = setInterval(() => {
          if (this._hass) {
            const { projected } = this.calculateFlightData();
            if (projected) {
              this.renderDynamic();
            }
          }
        }, this.config.projection_interval * 1000);
      } else if (!moving) {
        clearInterval(this._timer);
      }
    }
  }

  calculateFlightData() {
    let projected = false;
    let moving = false;
    const currentTime = Date.now() / 1000;

    const location = this.getLocation();
    if (location) {
      const refLat = location.latitude;
      const refLon = location.longitude;

      this._flightsData.forEach((flight) => {
        if (!flight._timestamp) {
          flight._timestamp = currentTime;
        }

        moving = moving || flight.ground_speed > 0;

        const timeElapsed = currentTime - flight._timestamp;
        if (timeElapsed > 1) {
          projected = true;

          flight._timestamp = currentTime;

          const newPosition = this.calculateNewPosition(flight.latitude, flight.longitude, flight.heading, ((flight.ground_speed * 1.852) / 3600) * timeElapsed);

          flight.latitude = newPosition.lat;
          flight.longitude = newPosition.lon;
          const newAltitude = Math.max(flight.altitude + (timeElapsed / 60) * flight.vertical_speed, 0);
          if (flight.landed || (newAltitude !== flight.altitude && newAltitude === 0)) {
            flight.landed = true;
            // Assume breaking after landing
            flight.ground_speed = Math.max(flight.ground_speed - 15 * timeElapsed, 15);
          }
          flight.altitude = newAltitude;
        }

        flight.distance_to_tracker = this.haversine(refLat, refLon, flight.latitude, flight.longitude);

        flight.heading_from_tracker = this.calculateBearing(refLat, refLon, flight.latitude, flight.longitude);
        flight.cardinal_direction_from_tracker = this.getCardinalDirection(flight.heading_from_tracker);
        const heading_to_tracker = (flight.heading_from_tracker + 180) % 360;
        flight.is_approaching = this.isApproaching(heading_to_tracker, flight.heading);

        if (flight.is_approaching) {
          let closestPassingLatLon = this.calculateClosestPassingPoint(refLat, refLon, flight.latitude, flight.longitude, flight.heading);

          flight.closest_passing_distance = this.haversine(refLat, refLon, closestPassingLatLon.lat, closestPassingLatLon.lon);
          flight.eta_to_closest_distance = this.calculateETA(flight.latitude, flight.longitude, closestPassingLatLon.lat, closestPassingLatLon.lon, flight.ground_speed);

          // If the plane is descending, calculate time to touchdown
          if (flight.vertical_speed < 0 && flight.altitude > 0) {
            const timeToTouchdown = flight.altitude / Math.abs(flight.vertical_speed);
            const touchdownLatLon = this.calculateNewPosition(flight.latitude, flight.longitude, flight.heading, (flight.ground_speed * timeToTouchdown) / 60);
            const touchdownDistance = this.haversine(refLat, refLon, touchdownLatLon.lat, touchdownLatLon.lon);

            if (timeToTouchdown < flight.eta_to_closest_distance) {
              flight.is_landing = true;
              flight.eta_to_closest_distance = timeToTouchdown;
              flight.closest_passing_distance = touchdownDistance;
              closestPassingLatLon = touchdownLatLon;
            }
          }

          flight.heading_from_tracker_to_closest_passing = Math.round(this.calculateBearing(refLat, refLon, closestPassingLatLon.lat, closestPassingLatLon.lon));
        }
      });
    } else {
      console.error('Tracker state is undefined. Make sure the location tracker entity ID is correct.');
    }

    return { projected, moving };
  }

  haversine(lat1, lon1, lat2, lon2) {
    const R = 6371.0; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.units.distance === 'km' ? R * c : (R * c) / 1.60934;
  }

  calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = this.toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(this.toRadians(lat2));
    const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) - Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (this.toDegrees(bearing) + 360) % 360; // Normalize to 0-360
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  getCardinalDirection(bearing) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  isApproaching(direction_to_tracker, heading) {
    const diff = Math.abs(direction_to_tracker - heading);
    return diff <= 45 || diff >= 315;
  }

  calculateNewPosition(lat, lon, bearing, distance) {
    const R = 6371.0; // Radius of the Earth in kilometers
    const bearingRad = this.toRadians(bearing);
    const latRad = this.toRadians(lat);
    const lonRad = this.toRadians(lon);
    const distanceRad = distance / R;

    const newLatRad = Math.asin(Math.sin(latRad) * Math.cos(distanceRad) + Math.cos(latRad) * Math.sin(distanceRad) * Math.cos(bearingRad));
    const newLonRad = lonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distanceRad) * Math.cos(latRad), Math.cos(distanceRad) - Math.sin(latRad) * Math.sin(newLatRad));

    const newLat = this.toDegrees(newLatRad);
    const newLon = this.toDegrees(newLonRad);

    return { lat: newLat, lon: newLon };
  }

  calculateClosestPassingPoint(refLat, refLon, flightLat, flightLon, heading) {
    const trackBearing = this.calculateBearing(flightLat, flightLon, refLat, refLon);
    const angle = Math.abs((heading - trackBearing + 360) % 360);

    const distanceToFlight = this.haversine(refLat, refLon, flightLat, flightLon);
    const distanceAlongPath = distanceToFlight * Math.cos(this.toRadians(angle));

    return this.calculateNewPosition(flightLat, flightLon, heading, distanceAlongPath);
  }

  calculateETA(fromLat, fromLon, toLat, toLon, groundSpeed) {
    const distance = this.haversine(fromLat, fromLon, toLat, toLon);
    if (groundSpeed === 0) {
      return Infinity;
    }

    const groundSpeedDistanceUnitsPrMin = (groundSpeed * (this.units.distance === 'km' ? 1.852 : 1.15078)) / 60;
    const eta = distance / groundSpeedDistanceUnitsPrMin; // ETA in minutes

    return eta;
  }

  parseSortField(obj, field) {
    return field.split(' ?? ').reduce((acc, cur) => acc ?? obj[cur], undefined);
  }
  getSortFn(sortConfig) {
    return ((a, b) => {
      for (let criterion of sortConfig) {
        const { field, comparator, order = 'ASC' } = criterion;
        const value = this.resolvePlaceholders(criterion.value);

        const fieldA = this.parseSortField(a, field);
        const fieldB = this.parseSortField(b, field);

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
            if (value !== undefined) {
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
            if (value !== undefined) {
              const isAContainsValue = value.some((val) => fieldA.includes(val));
              const isBContainsValue = value.some((val) => fieldB.includes(val));
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
          return order === 'DESC' ? -result : result;
        }
      }

      return 0;
    }).bind(this);
  }

  attachEventListeners() {
    if (!this._boundEventHandlers) {
      this._boundEventHandlers = {
        handleWheel: this.handleWheel.bind(this),
        handleTouchStart: this.handleTouchStart.bind(this),
        handleTouchMove: this.handleTouchMove.bind(this),
        handleTouchEnd: this.handleTouchEnd.bind(this)
      };
    }

    // Add event listeners to a higher-level container to ensure they remain active
    const radarOverlay = this.shadowRoot.getElementById('radar-overlay');
    if (radarOverlay) {
      radarOverlay.addEventListener('wheel', this._boundEventHandlers.handleWheel, { passive: false });
      radarOverlay.addEventListener('touchstart', this._boundEventHandlers.handleTouchStart, { passive: true });
      radarOverlay.addEventListener('touchmove', this._boundEventHandlers.handleTouchMove, { passive: false });
      radarOverlay.addEventListener('touchend', this._boundEventHandlers.handleTouchEnd, { passive: true });
      radarOverlay.addEventListener('touchcancel', this._boundEventHandlers.handleTouchEnd, { passive: true });
    }
  }

  toggleSelectedFlight(flight) {
    if (this._selectedFlights === undefined) {
      this._selectedFlights = [];
    }

    if (!this._selectedFlights.includes(flight.id)) {
      this._selectedFlights.push(flight.id);
    } else {
      this._selectedFlights = this._selectedFlights.filter((id) => id !== flight.id);
    }
    this.renderDynamic();
  }

  get hass() {
    return this._hass;
  }

  handleWheel(event) {
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    this.updateRadarRange(delta * 5);
  }
  handleTouchStart(event) {
    if (event.touches.length === 2) {
      this._initialPinchDistance = this.getPinchDistance(event.touches);
      this._initialRadarRange = this.radar.range;
    }
  }
  handleTouchMove(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      const currentPinchDistance = this.getPinchDistance(event.touches);
      if (currentPinchDistance > 0 && this._initialPinchDistance > 0) {
        const pinchRatio = currentPinchDistance / this._initialPinchDistance;
        const newRadarRange = this._initialRadarRange / pinchRatio;
        this.updateRadarRange(newRadarRange - this.radar.range);
      }
    }
  }
  handleTouchEnd() {
    this._initialPinchDistance = null;
    this._initialRadarRange = null;
  }
  getPinchDistance(touches) {
    const [touch1, touch2] = touches;
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

customElements.define('flightradar24-card', Flightradar24Card);
