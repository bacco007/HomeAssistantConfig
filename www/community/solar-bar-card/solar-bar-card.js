// solar-bar-card.js
// Enhanced Solar Bar Card with battery support and animated flow visualization
// Version 2.9.1 - EV icon solid circle restyle + battery SOC entity selector fix

import { COLOR_PALETTES, getCardColors, getPaletteOptions } from './solar-bar-card-palettes.js';

class SolarBarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // Only update if relevant entities changed or first load
    if (!oldHass || !this.config) {
      if (!oldHass) this._setupLabelTemplates();
      this.updateCard();
      return;
    }

    // Check if any relevant entity states have changed
    const relevantEntities = [
      this.config.production_entity,
      this.config.self_consumption_entity,
      this.config.export_entity,
      this.config.import_entity,
      this.config.grid_power_entity,
      this.config.forecast_entity,
      this.config.peak_forecast_entity,
      this.config.weather_entity,
      this.config.ev_charger_sensor,
      this.config.battery_power_entity,
      this.config.battery_charge_entity,
      this.config.battery_discharge_entity,
      this.config.battery_soc_entity,
      this.config.production_history_entity,
      this.config.consumption_history_entity,
      this.config.import_history_entity,
      this.config.export_history_entity,
      this.config.header_sensor_1?.entity,
      this.config.header_sensor_2?.entity,
      this.config.consumer_1_entity,
      this.config.consumer_2_entity,
      this.config.ev_history_entity,
      this.config.consumer_1_history_entity,
      this.config.consumer_2_history_entity
    ].filter(Boolean);

    const shouldUpdate = relevantEntities.some(
      entity => oldHass.states[entity]?.state !== hass.states[entity]?.state
    );

    if (shouldUpdate) {
      this.updateCard();
    }
  }

  // ── HA template subscriptions for label overrides ──
  // Any label_* / custom_labels value containing {{ }} is evaluated server-side via
  // the render_template websocket. Results are cached in _labelTemplateValues and
  // getLabel() returns them in preference over the raw config string.
  async _setupLabelTemplates() {
    // Cancel existing subscriptions
    for (const unsub of Object.values(this._labelTemplateSubs || {})) {
      try { unsub(); } catch(e) {}
    }
    this._labelTemplateSubs = {};
    if (!this._hass || !this.config) return;

    const keys = ['solar', 'import', 'export', 'usage', 'battery', 'ev', 'power_flow',
                  'solar_power', 'standby_mode', 'click_history'];
    for (const key of keys) {
      const raw = this.config[`label_${key}`] || (this.config.custom_labels || {})[key];
      if (!raw || !raw.includes('{{')) continue;
      try {
        const unsub = await this._hass.connection.subscribeMessage(
          (msg) => {
            if (!this._labelTemplateValues) this._labelTemplateValues = {};
            this._labelTemplateValues[key] = msg.result;
            this.updateCard();
          },
          { type: 'render_template', template: raw }
        );
        this._labelTemplateSubs[key] = unsub;
      } catch(e) {
        console.warn(`solar-bar-card: template error for label_${key}:`, e);
      }
    }
  }

  disconnectedCallback() {
    for (const unsub of Object.values(this._labelTemplateSubs || {})) {
      try { unsub(); } catch(e) {}
    }
    this._labelTemplateSubs = {};
    this._labelTemplateValues = {};
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }

    // Validate inverter_size
    if (config.inverter_size !== undefined) {
      const inverterSize = Number(config.inverter_size);
      if (isNaN(inverterSize) || inverterSize <= 0) {
        throw new Error('inverter_size must be a positive number');
      }
    }

    // Validate battery_capacity
    if (config.battery_capacity !== undefined) {
      const batteryCapacity = Number(config.battery_capacity);
      if (isNaN(batteryCapacity) || batteryCapacity < 0) {
        throw new Error('battery_capacity must be a non-negative number');
      }
    }

    // Validate car_charger_load
    if (config.car_charger_load !== undefined) {
      const chargerLoad = Number(config.car_charger_load);
      if (isNaN(chargerLoad) || chargerLoad < 0) {
        throw new Error('car_charger_load must be a non-negative number');
      }
    }

    // Validate battery_flow_animation_speed
    if (config.battery_flow_animation_speed !== undefined) {
      const animSpeed = Number(config.battery_flow_animation_speed);
      if (isNaN(animSpeed) || animSpeed <= 0) {
        throw new Error('battery_flow_animation_speed must be a positive number');
      }
    }

    this.config = {
      inverter_size: 10,
      show_header: false,
      show_weather: false,
      show_stats: false,
      show_legend: true,
      show_legend_values: true,
      show_bar_label: true,
      show_bar_values: true,
      header_title: 'Solar Power',
      weather_entity: null,
      use_solcast: false,
      car_charger_load: 0,
      ev_charger_sensor: null,
      import_entity: null,
      grid_power_entity: null,
      invert_grid_power: false,
      color_palette: 'classic-solar',
      custom_colors: {},
      battery_power_entity: null,
      battery_charge_entity: null,
      battery_discharge_entity: null,
      invert_battery_power: false,
      battery_soc_entity: null,
      battery_capacity: 10,
      show_battery_flow: true,
      show_battery_indicator: true,
      battery_flow_animation_speed: 2,
      decimal_places: 1,
      battery_soc_decimal_places: 1,
      // Net import/export history
      import_history_entity: null,
      export_history_entity: null,
      // Usage History
      production_history_entity: null,
      consumption_history_entity: null,
      show_net_indicator: true,
      // Grid icon always visible
      show_grid_icon_always: false,
      // House icon and flow lines
      show_house_icon: false,
      show_energy_flow: false,
      energy_flow_speed: 2,
      energy_flow_threshold: 0.1,
      energy_flow_origin: "bar_center",
      // Header sensors
      header_sensor_1: null,
      header_sensor_2: null,
      // Custom labels (object format for backward compatibility)
      custom_labels: {},
      // Tap actions (object format for backward compatibility)
      tap_actions: {},
      // Stats tile border radius
      stats_border_radius: 8,
      // Stats detail row (history/kWh/battery %)
      show_stats_detail: true,
      // Stats detail position: 'below' (3rd row) or 'inline' (slash-separated on value row)
      stats_detail_position: 'below',
      // Additional consumer entities (tiles only, no bar segments)
      consumer_1_entity: null,
      consumer_1_name: null,
      consumer_2_entity: null,
      consumer_2_name: null,
      show_consumers_when_idle: false,
      // EV idle visibility
      show_ev_when_idle: false,
      // History entities for EV and consumers
      ev_history_entity: null,
      consumer_1_history_entity: null,
      consumer_2_history_entity: null,
      // Power unit display
      power_unit: 'kW',
      show_power_unit: true,
      // EV icon symbol color (mdi:car-electric color inside the circle)
      ev_icon_color: null,
      // Bar segment text templates — tokens: {value}, {label}, {percent}, {raw}
      segment_text_solar_home: null,
      segment_text_solar_ev: null,
      segment_text_battery_charge: null,
      segment_text_export: null,
      segment_text_ev_potential: null,
      ...config
    };
    // Re-subscribe label templates whenever config changes
    if (this._hass) this._setupLabelTemplates();
    this.updateCard();
  }

  getConfig() {
    return this.config;
  }

  getTranslations() {
    return {
      en: {
        solar: 'Solar',
        import: 'Import',
        export: 'Export',
        usage: 'Usage',
        battery: 'Battery',
        ev: 'EV',
        power_flow: 'Power Flow',
        solar_power: 'Solar Power',
        standby_mode: 'Standby Mode',
        click_history: 'Click to view history',
        grid_import: 'Grid Import',
        grid_export: 'Grid Export',
        grid_idle: 'Grid Idle',
        forecast_potential: 'Forecast solar potential',
        forecast_peak: 'Forecast peak solar',
        total_usage: 'Total usage',
        excess_solar_half: 'Excess solar can cover 50%+ of EV charging',
        excess_solar_full: 'Excess solar can fully power EV charging'
      },
      de: {
        solar: 'Solar',
        import: 'Import',
        export: 'Export',
        usage: 'Verbrauch',
        battery: 'Batterie',
        ev: 'EV',
        power_flow: 'Leistungsfluss',
        solar_power: 'Solarstrom',
        standby_mode: 'Standby-Modus',
        click_history: 'Klicken für Verlauf',
        grid_import: 'Netzbezug',
        grid_export: 'Netzeinspeisung',
        grid_idle: 'Netz Inaktiv',
        forecast_potential: 'Prognose Solarpotenzial',
        forecast_peak: 'Prognose Solarspitze',
        total_usage: 'Gesamtverbrauch',
        excess_solar_half: 'Überschüssiger Solarstrom kann 50%+ des EV-Ladens abdecken',
        excess_solar_full: 'Überschüssiger Solarstrom kann EV-Laden vollständig versorgen'
      },
      fr: {
        solar: 'Solaire',
        import: 'Import',
        export: 'Export',
        usage: 'Consommation',
        battery: 'Batterie',
        ev: 'VE',
        power_flow: 'Flux de puissance',
        solar_power: 'Énergie solaire',
        standby_mode: 'Mode veille',
        click_history: 'Cliquer pour voir l\'historique',
        grid_import: 'Import réseau',
        grid_export: 'Export réseau',
        grid_idle: 'Réseau Inactif',
        forecast_potential: 'Potentiel solaire prévu',
        forecast_peak: 'Pic solaire prévu',
        total_usage: 'Consommation totale',
        excess_solar_half: 'L\'excédent solaire peut couvrir 50%+ de la charge VE',
        excess_solar_full: 'L\'excédent solaire peut alimenter complètement la charge VE'
      },
      es: {
        solar: 'Solar',
        import: 'Importación',
        export: 'Exportación',
        usage: 'Consumo',
        battery: 'Batería',
        ev: 'VE',
        power_flow: 'Flujo de energía',
        solar_power: 'Energía solar',
        standby_mode: 'Modo espera',
        click_history: 'Haga clic para ver el historial',
        grid_import: 'Importación de red',
        grid_export: 'Exportación de red',
        grid_idle: 'Red Inactiva',
        forecast_potential: 'Potencial solar previsto',
        forecast_peak: 'Pico solar previsto',
        total_usage: 'Consumo total',
        excess_solar_half: 'El exceso solar puede cubrir el 50%+ de la carga VE',
        excess_solar_full: 'El exceso solar puede alimentar completamente la carga VE'
      },
      it: {
        solar: 'Solare',
        import: 'Importazione',
        export: 'Esportazione',
        usage: 'Consumo',
        battery: 'Batteria',
        ev: 'VE',
        power_flow: 'Flusso di potenza',
        solar_power: 'Energia solare',
        standby_mode: 'Modalità standby',
        click_history: 'Clicca per vedere la cronologia',
        grid_import: 'Importazione rete',
        grid_export: 'Esportazione rete',
        grid_idle: 'Rete Inattiva',
        forecast_potential: 'Potenziale solare previsto',
        forecast_peak: 'Picco solare previsto',
        total_usage: 'Consumo totale',
        excess_solar_half: 'L\'eccesso solare può coprire il 50%+ della ricarica VE',
        excess_solar_full: 'L\'eccesso solare può alimentare completamente la ricarica VE'
      },
      nl: {
        solar: 'Zonne-energie',
        import: 'Import',
        export: 'Export',
        usage: 'Verbruik',
        battery: 'Batterij',
        ev: 'EV',
        power_flow: 'Energiestroom',
        solar_power: 'Zonne-energie',
        standby_mode: 'Standby-modus',
        click_history: 'Klik voor geschiedenis',
        grid_import: 'Netimport',
        grid_export: 'Netexport',
        grid_idle: 'Net Inactief',
        forecast_potential: 'Voorspeld zonnepotentieel',
        forecast_peak: 'Voorspelde zonnepiek',
        total_usage: 'Totaal verbruik',
        excess_solar_half: 'Overschot zonne-energie kan 50%+ van EV-opladen dekken',
        excess_solar_full: 'Overschot zonne-energie kan EV-opladen volledig voorzien'
      },
      pt: {
        solar: 'Solar',
        import: 'Importação',
        export: 'Exportação',
        usage: 'Consumo',
        battery: 'Bateria',
        ev: 'VE',
        power_flow: 'Fluxo de energia',
        solar_power: 'Energia solar',
        standby_mode: 'Modo espera',
        click_history: 'Clique para ver o histórico',
        grid_import: 'Importação da rede',
        grid_export: 'Exportação da rede',
        grid_idle: 'Rede Inativa',
        forecast_potential: 'Potencial solar previsto',
        forecast_peak: 'Pico solar previsto',
        total_usage: 'Consumo total',
        excess_solar_half: 'O excesso solar pode cobrir 50%+ do carregamento VE',
        excess_solar_full: 'O excesso solar pode alimentar completamente o carregamento VE'
      },
      pl: {
        solar: 'Solarne',
        import: 'Import',
        export: 'Eksport',
        usage: 'Zużycie',
        battery: 'Bateria',
        ev: 'EV',
        power_flow: 'Przepływ energii',
        solar_power: 'Energia słoneczna',
        standby_mode: 'Tryb czuwania',
        click_history: 'Kliknij, aby zobaczyć historię',
        grid_import: 'Import z sieci',
        grid_export: 'Eksport do sieci',
        grid_idle: 'Sieć Nieaktywna',
        forecast_potential: 'Prognozowany potencjał słoneczny',
        forecast_peak: 'Prognozowany szczyt solarny',
        total_usage: 'Całkowite zużycie',
        excess_solar_half: 'Nadmiar energii słonecznej może pokryć 50%+ ładowania EV',
        excess_solar_full: 'Nadmiar energii słonecznej może w pełni zasilić ładowanie EV'
      },
      sv: {
        solar: 'Sol',
        import: 'Import',
        export: 'Export',
        usage: 'Förbrukning',
        battery: 'Batteri',
        ev: 'EV',
        power_flow: 'Energiflöde',
        solar_power: 'Solenergi',
        standby_mode: 'Viloläge',
        click_history: 'Klicka för att visa historik',
        grid_import: 'Nätimport',
        grid_export: 'Nätexport',
        grid_idle: 'Nät Inaktivt',
        forecast_potential: 'Prognostiserad solpotential',
        forecast_peak: 'Prognostiserat solarmaxeffekt',
        total_usage: 'Total förbrukning',
        excess_solar_half: 'Överskott av solenergi kan täcka 50%+ av EV-laddning',
        excess_solar_full: 'Överskott av solenergi kan helt driva EV-laddning'
      },
      da: {
        solar: 'Sol',
        import: 'Import',
        export: 'Eksport',
        usage: 'Forbrug',
        battery: 'Batteri',
        ev: 'EV',
        power_flow: 'Energiflow',
        solar_power: 'Solenergi',
        standby_mode: 'Standbytilstand',
        click_history: 'Klik for at se historik',
        grid_import: 'Netimport',
        grid_export: 'Neteksport',
        grid_idle: 'Net Inaktiv',
        forecast_potential: 'Forventet solpotentiale',
        forecast_peak: 'Forventet solarmaksimum',
        total_usage: 'Samlet forbrug',
        excess_solar_half: 'Overskydende solenergi kan dække 50%+ af EV-opladning',
        excess_solar_full: 'Overskydende solenergi kan fuldt ud forsyne EV-opladning'
      },
      no: {
        solar: 'Sol',
        import: 'Import',
        export: 'Eksport',
        usage: 'Forbruk',
        battery: 'Batteri',
        ev: 'EV',
        power_flow: 'Energiflyt',
        solar_power: 'Solenergi',
        standby_mode: 'Standby-modus',
        click_history: 'Klikk for å se historikk',
        grid_import: 'Nettimport',
        grid_export: 'Netteksport',
        grid_idle: 'Nett Inaktiv',
        forecast_potential: 'Forventet solpotensial',
        forecast_peak: 'Forventet solarmaks',
        total_usage: 'Totalt forbruk',
        excess_solar_half: 'Overskudd av solenergi kan dekke 50%+ av EV-lading',
        excess_solar_full: 'Overskudd av solenergi kan fullt ut forsyne EV-lading'
      },
      uk: {
        solar: 'Сонячна',
        import: 'Імпорт',
        export: 'Експорт',
        usage: 'Споживання',
        battery: 'Батарея',
        ev: 'Електромобіль',
        power_flow: 'Потік енергії',
        solar_power: 'Сонячна енергія',
        standby_mode: 'Режим очікування',
        click_history: 'Клацніть, щоб побачити історію',
        grid_import: 'Імпорт з мережі',
        grid_export: 'Експорт до мережі',
        grid_idle: 'Мережа Неактивна',
        forecast_potential: 'Прогноз потенціалу сонячної енергії',
        forecast_peak: 'Прогнозований пік сонячної енергії',
        total_usage: 'Загальне споживання',
        excess_solar_half: 'Надлишок сонячної енергії може покрити 50%+ навантаження електромобіля',
        excess_solar_full: 'Надлишок сонячної енергії може повністю покрити навантаження електромобіля'
      }
    };
  }

  getLabel(key) {
    // First check resolved HA template values
    if (this._labelTemplateValues?.[key] !== undefined) {
      return this._labelTemplateValues[key];
    }

    const { custom_labels = {} } = this.config;

    // Then check custom labels
    if (custom_labels[key]) {
      return custom_labels[key];
    }

    // Then check individual label config options (for UI compatibility)
    const labelKey = `label_${key}`;
    if (this.config[labelKey]) {
      return this.config[labelKey];
    }

    // Auto-detect language from Home Assistant
    const language = this._hass?.language || this._hass?.locale?.language || 'en';

    // Then check translations
    const translations = this.getTranslations();
    const langTranslations = translations[language] || translations['en'];

    return langTranslations[key] || key;
  }

  updateCard() {
    if (!this._hass || !this.config) return;

    const {
      inverter_size = 10,
      production_entity,
      self_consumption_entity,
      export_entity,
      import_entity = null,
      grid_power_entity = null,
      invert_grid_power = false,
      forecast_entity,
      peak_forecast_entity,
      show_header = false,
      show_weather = false,
      show_stats = false,
      show_legend = true,
      show_legend_values = true,
      show_bar_label = true,
      show_bar_values = true,
      header_title = 'Solar Power',
      weather_entity = null,
      use_solcast = false,
      car_charger_load = 0,
      ev_charger_sensor = null,
      battery_power_entity = null,
      battery_charge_entity = null,
      battery_discharge_entity = null,
      invert_battery_power = false,
      battery_soc_entity = null,
      battery_capacity = 10,
      show_battery_flow = true,
      show_battery_indicator = true,
      battery_flow_animation_speed = 2,
      decimal_places = 1,
      battery_soc_decimal_places = 1,
      // Net import/export history
      import_history_entity = null,
      export_history_entity = null,
      // Usage History
      production_history_entity = null,
      consumption_history_entity = null,
      show_net_indicator = true,
      show_grid_icon_always = false,
      // Header sensors
      header_sensor_1 = null,
      header_sensor_2 = null,
      // Stats tile border radius
      stats_border_radius = 8,
      // Stats detail row
      show_stats_detail = true,
      // Stats detail position
      stats_detail_position = 'below',
      // Additional consumers
      consumer_1_entity = null,
      consumer_1_name = null,
      consumer_2_entity = null,
      consumer_2_name = null,
      show_consumers_when_idle = false,
      // EV idle visibility
      show_ev_when_idle = false,
      // History entities for EV and consumers
      ev_history_entity = null,
      consumer_1_history_entity = null,
      consumer_2_history_entity = null,
      // Energy flow threshold
      energy_flow_threshold = 0.1,
      // Power unit display
      power_unit = 'kW',
      show_power_unit = true,
      // EV icon symbol color
      ev_icon_color = null,
      // Bar segment text templates
      segment_text_solar_home = null,
      segment_text_solar_ev = null,
      segment_text_battery_charge = null,
      segment_text_export = null,
      segment_text_ev_potential = null
    } = this.config;

    // Get colors from palette
    const colors = getCardColors(this.config);

    // Power value formatter: respects power_unit (kW/W) and show_power_unit
    const fmtPow = (val) => {
      if (power_unit === 'W') {
        const num = Math.round(val * 1000);
        return show_power_unit ? `${num} W` : `${num}`;
      }
      const num = val.toFixed(decimal_places);
      return show_power_unit ? `${num} kW` : `${num}`;
    };
    const powerUnitLabel = show_power_unit ? (power_unit === 'W' ? 'W' : 'kW') : '';

    // Segment text template helper: substitutes {value}, {label}, {percent}, {raw} tokens
    // Falls back to fmtPow(value) if no template configured
    const segmentText = (template, value, labelKey, percent) => {
      if (!template) return null; // use caller default
      const rawVal = power_unit === 'W' ? Math.round(value * 1000) : value;
      return template
        .replace(/\{value\}/g, fmtPow(value))
        .replace(/\{label\}/g, this.getLabel(labelKey))
        .replace(/\{percent\}/g, percent != null ? `${Math.round(percent)}%` : '')
        .replace(/\{raw\}/g, String(rawVal));
    };

    let selfConsumption = 0;
    let exportPower = 0;
    let gridImportPower = 0;
    let solarProduction = 0;

    // Battery state
    let batteryPower = 0;
    let batterySOC = 0;
    let hasBattery = false;

    // Handle battery power - can be single sensor, dual sensors, or single with invert
    if (battery_soc_entity) {
      batterySOC = Math.max(0, Math.min(100, parseFloat(this._hass.states[battery_soc_entity]?.state) || 0));

      if (battery_charge_entity && battery_discharge_entity) {
        // Dual sensor mode (charge and discharge separate)
        const chargePower = this.getSensorValue(battery_charge_entity) || 0;
        const dischargePower = this.getSensorValue(battery_discharge_entity) || 0;
        batteryPower = chargePower - dischargePower; // Positive=charging, negative=discharging
        hasBattery = true;
      } else if (battery_power_entity) {
        // Single sensor mode (with optional invert)
        batteryPower = this.getSensorValue(battery_power_entity) || 0;
        if (invert_battery_power) {
          batteryPower = -batteryPower;
        }
        hasBattery = true;
      }
    }

    const batteryCharging = batteryPower > 0.05;
    const batteryDischarging = batteryPower < -0.05;
    const batteryIdle = Math.abs(batteryPower) <= 0.05;

    // Check for actual EV charging
    const actualEvCharging = this.getSensorValue(ev_charger_sensor) || 0;
    const isActuallyCharging = actualEvCharging > 0;

    // Get weather/temperature data
    let weatherTemp = null;
    let weatherUnit = '°C';
    let weatherIcon = '🌡️';
    if (show_weather && weather_entity) {
      try {
        const weatherState = this._hass.states[weather_entity];
        if (weatherState) {
          const domain = weather_entity.split('.')[0];

          if (domain === 'weather') {
            weatherTemp = weatherState.attributes.temperature;
            weatherUnit = this._hass.config.unit_system.temperature || '°C';

            const state = weatherState.state;
            const weatherIcons = {
              'clear-night': '🌙',
              'cloudy': '☁️',
              'fog': '🌫️',
              'hail': '🌨️',
              'lightning': '⛈️',
              'lightning-rainy': '⛈️',
              'partlycloudy': '⛅',
              'pouring': '🌧️',
              'rainy': '🌦️',
              'snowy': '🌨️',
              'snowy-rainy': '🌨️',
              'sunny': '☀️',
              'windy': '💨',
              'exceptional': '⚠️'
            };
            weatherIcon = weatherIcons[state] || '🌡️';
          } else {
            const tempValue = parseFloat(weatherState.state);
            if (!isNaN(tempValue)) {
              weatherTemp = tempValue;
              weatherUnit = weatherState.attributes.unit_of_measurement || '°C';
            }
          }
        }
      } catch (error) {
        console.warn('Error reading weather entity:', error);
      }
    }

    // Use manually configured entities
    solarProduction = this.getSensorValue(production_entity) || 0;
    selfConsumption = this.getSensorValue(self_consumption_entity) || 0;

    // Handle grid power - can be a single sensor (positive=export, negative=import) or separate sensors
    if (grid_power_entity) {
      let gridPower = this.getSensorValue(grid_power_entity) || 0;

      // Invert if needed (for systems that report from meter perspective)
      if (invert_grid_power) {
        gridPower = -gridPower;
      }

      if (gridPower > 0) {
        exportPower = gridPower;
        gridImportPower = 0;
      } else {
        exportPower = 0;
        gridImportPower = Math.abs(gridPower);
      }
    } else {
      exportPower = this.getSensorValue(export_entity) || 0;
      gridImportPower = this.getSensorValue(import_entity) || 0;
    }

    let forecastSolar = 0;
    if (use_solcast && !forecast_entity) {
      forecastSolar = this.getSolcastForecast();
    } else if (forecast_entity) {
      forecastSolar = this.getSensorValue(forecast_entity) || 0;
    }

    let peakForecastPower = 0;
    if (use_solcast && !peak_forecast_entity) {
      peakForecastPower = this.getSolcastPeakForecast();
    } else if (peak_forecast_entity) {
      peakForecastPower = this.getSensorValue(peak_forecast_entity) || 0;
    }
    const peakForecastPotential = Math.min(peakForecastPower, inverter_size);

    const currentOutput = solarProduction;
    const anticipatedPotential = Math.min(forecastSolar, inverter_size);

    // Check if system is idle (no solar production and no consumption)
    const isIdle = solarProduction === 0 && selfConsumption === 0 && exportPower === 0 && gridImportPower === 0 && batteryIdle;

    // Calculate EV usage split
    const evUsage = isActuallyCharging ? actualEvCharging : 0;

    // Calculate battery flows
    const batteryToLoad = batteryDischarging ? Math.abs(batteryPower) : 0;
    const batteryChargeRate = batteryCharging ? Math.abs(batteryPower) : 0;

    // Total house consumption from energy balance (physics-based, independent of self_consumption_entity)
    // energy in = energy out: solar = export + house + batteryCharge, house = solar - export + import + batteryDischarge - batteryCharge
    const totalHouseConsumption = Math.max(0, solarProduction - exportPower + gridImportPower + batteryToLoad - batteryChargeRate);

    // Use energy-balance consumption for flow decomposition so grid contribution is never lost
    // (self_consumption_entity on many inverters reports solar self-consumption, not total house consumption)
    const effectiveConsumption = Math.max(selfConsumption, totalHouseConsumption);
    const nonEvConsumption = Math.max(0, effectiveConsumption - evUsage);

    // Calculate how much solar feeds the load directly
    const solarToLoad = Math.min(solarProduction, effectiveConsumption);

    let solarToHome = 0;
    let solarToEv = 0;
    let batteryToHome = 0;
    let batteryToEv = 0;
    let gridToHome = 0;
    let gridToEv = 0;

    if (effectiveConsumption > 0) {
      const homeRatio = nonEvConsumption / effectiveConsumption;
      const evRatio = evUsage / effectiveConsumption;

      solarToHome = solarToLoad * homeRatio;
      solarToEv = solarToLoad * evRatio;

      batteryToHome = batteryToLoad * homeRatio;
      batteryToEv = batteryToLoad * evRatio;

      gridToHome = Math.max(0, nonEvConsumption - solarToHome - batteryToHome);
      gridToEv = Math.max(0, evUsage - solarToEv - batteryToEv);
    }

    // 0211 change, from const to let
    const totalGridImport = gridImportPower;

    // EV Potential display (only when not charging)
    const evDisplayPower = isActuallyCharging ? 0 : Math.max(0, car_charger_load - exportPower);

    // Calculate excess solar for EV ready indicator
    const excessSolar = solarProduction - effectiveConsumption;
    const evReadyHalf = car_charger_load > 0 && !isActuallyCharging && excessSolar >= (car_charger_load * 0.5);
    const evReadyFull = car_charger_load > 0 && !isActuallyCharging && excessSolar >= car_charger_load;

    // Battery charging segment (calculate BEFORE unused capacity)
    // Shows in solar bar ONLY if solar is charging the battery
    const solarAvailableForBattery = Math.max(0, solarProduction - solarToLoad);
    const solarToBattery = batteryCharging ? Math.min(batteryPower, solarAvailableForBattery) : 0;

    // Calculate unused capacity - must account for all segments being shown in the bar
    // Segments: solarToHome + solarToEv + solarToBattery + exportPower + evDisplayPower + unused = inverter_size
    const unusedCapacityKw = Math.max(0, inverter_size - solarToHome - solarToEv - solarToBattery - exportPower - evDisplayPower);

    // Calculate percentages for bar segments
    // Solar bar now only shows solar-sourced power (home, EV, battery charging, export, unused)
    const solarHomePercent = (solarToHome / inverter_size) * 100;
    const solarEvPercent = (solarToEv / inverter_size) * 100;
    const exportPercent = (exportPower / inverter_size) * 100;
    const evPotentialPercent = (evDisplayPower / inverter_size) * 100;
    const unusedPercent = (unusedCapacityKw / inverter_size) * 100;
    const anticipatedPercent = (anticipatedPotential / inverter_size) * 100;
    const peakForecastPercent = (peakForecastPotential / inverter_size) * 100;
    const batteryChargePercent = solarToBattery > 0 ? (solarToBattery / inverter_size) * 100 : 0;

    // Grid state for icon (not shown in bar anymore)
    //const hasGridImport = totalGridImport > 0.05;
    const flowThreshold = Math.max(0, energy_flow_threshold || 0.1);
    const hasGridImport = gridImportPower > flowThreshold;
    const hasGridExport = exportPower > flowThreshold;

    // Net import/export history calculation
    let dailyImport = null;
    let dailyExport = null;
    let netPosition = null; // positive = net exporter, negative = net importer
    let dailyProduction = null;
    let dailyConsumption = null;
    let hasHistoryData = false;
    let hasProdHistoryData = false;
    let hasConsHistoryData = false;

    if (import_history_entity) {
      const importState = this._hass.states[import_history_entity];
      if (importState) {
        dailyImport = parseFloat(importState.state);
        if (!isNaN(dailyImport)) hasHistoryData = true;
      }
    }

    if (export_history_entity) {
      const exportState = this._hass.states[export_history_entity];
      if (exportState) {
        dailyExport = parseFloat(exportState.state);
        if (!isNaN(dailyExport)) hasHistoryData = true;
      }
    }

    if ( production_history_entity) {
      const prodState = this._hass.states[production_history_entity];
      if (prodState) {
        dailyProduction = parseFloat(prodState.state);
        if (!isNaN(dailyProduction)) hasProdHistoryData = true;
      }
    }

    if ( consumption_history_entity) {
      const consState = this._hass.states[consumption_history_entity];
      if (consState) {
        dailyConsumption = parseFloat(consState.state);
        if (!isNaN(dailyConsumption)) hasConsHistoryData = true;
      }
    }

    if (hasHistoryData && dailyImport !== null && dailyExport !== null) {
      netPosition = dailyExport - dailyImport;
    }

    // Helper to get header sensor value and format
    const getHeaderSensorData = (sensorConfig) => {
      if (!sensorConfig || !sensorConfig.entity) return null;

      const entityState = this._hass.states[sensorConfig.entity];
      if (!entityState) return null;

      const value = parseFloat(entityState.state);
      const icon = sensorConfig.icon || '📊';
      const isMdiIcon = icon.startsWith('mdi:');

      // Process icon_color - can be a direct color value or reference to an entity attribute
      let iconColor = null;
      if (sensorConfig.icon_color) {
        // Check if it's an attribute reference (e.g., "attributes.rgb_color")
        if (sensorConfig.icon_color.startsWith('attributes.')) {
          const attrPath = sensorConfig.icon_color.substring(11); // Remove "attributes."
          const attrValue = entityState.attributes[attrPath];

          // Handle RGB array format [r, g, b]
          if (Array.isArray(attrValue) && attrValue.length === 3) {
            iconColor = `rgb(${attrValue[0]}, ${attrValue[1]}, ${attrValue[2]})`;
          } else if (attrValue) {
            iconColor = attrValue;
          }
        } else if (sensorConfig.icon_color.startsWith('state')) {
          // Use the entity state as color
          iconColor = entityState.state;
        } else {
          // Direct color value (hex, rgb, named color)
          iconColor = sensorConfig.icon_color;
        }
      }

      if (isNaN(value)) {
        // Non-numeric state - just return as-is
        return {
          value: entityState.state,
          unit: sensorConfig.unit || '',
          name: sensorConfig.name || '',
          icon: icon,
          isMdiIcon: isMdiIcon,
          iconColor: iconColor
        };
      }

      // For numeric values, format appropriately
      const unit = sensorConfig.unit || entityState.attributes.unit_of_measurement || '';
      return {
        value: value.toFixed(decimal_places),
        unit: unit,
        name: sensorConfig.name || '',
        icon: icon,
        isMdiIcon: isMdiIcon,
        iconColor: iconColor
      };
    };

    const headerSensor1Data = getHeaderSensorData(header_sensor_1);
    const headerSensor2Data = getHeaderSensorData(header_sensor_2);

    // Usage indicator line (shows where total usage is on the solar bar when solar doesn't cover it)
    const usagePercent = (selfConsumption / inverter_size) * 100;
    const showUsageIndicator = selfConsumption > solarProduction && selfConsumption > 0.05;

    // Calculate proportional widths for adjacent bars (if battery configured AND visible)
    // Battery bar is capped at 30% to prevent it from dominating the display
    const totalCapacity = hasBattery ? battery_capacity + inverter_size : inverter_size;
    const rawBatteryBarWidth = hasBattery ? (battery_capacity / totalCapacity) * 100 : 0;
    // Only reserve space for battery bar if it's both configured AND the indicator is shown
    const batteryBarWidth = (hasBattery && show_battery_indicator) ? Math.min(rawBatteryBarWidth, 30) : 0;
    // Reserve space for icons (32px ~= 3% of typical container width)
    const showGridIcon = hasGridImport || hasGridExport || show_grid_icon_always;
    const gridIconSpace = showGridIcon ? 3 : 0;
    const { show_house_icon, show_energy_flow, energy_flow_speed, energy_flow_origin = "bar_center" } = this.config;
    const houseIconSpace = show_house_icon ? 3 : 0;
    // EV circle: show when ev_charger_sensor configured and charging or show_ev_when_idle
    const showEvCircle = !!(ev_charger_sensor && (isActuallyCharging || show_ev_when_idle));
    const evIconSpace = showEvCircle ? 3 : 0;
    // Power bar takes up remaining space
    const powerBarWidth = 100 - batteryBarWidth - gridIconSpace - houseIconSpace - evIconSpace;

    // Get actual container width for accurate text sizing calculations
    // Query the bars container or use the card's width
    const barsContainer = this.shadowRoot?.querySelector('.bars-container');
    const actualContainerWidth = barsContainer?.offsetWidth || this.offsetWidth || 500;

    // Helper function to determine if segment text should be shown based on width
    const shouldShowSegmentText = (segmentPercent, text, powerBarWidthPercent) => {
      // Calculate the effective percentage of the total container this segment occupies
      const effectivePercent = (segmentPercent / 100) * (powerBarWidthPercent / 100) * 100;

      // Estimate minimum width needed for text
      // Character width at 10px font size is approximately 6px
      // Add 20px for padding (10px on each side)
      const estimatedTextWidth = text.length * 6 + 20;

      // Calculate actual pixel width of this segment
      const segmentPixelWidth = (effectivePercent / 100) * actualContainerWidth;

      // Show text only if segment pixel width is larger than estimated text width
      return segmentPixelWidth >= estimatedTextWidth;
    };

    // Battery flow line (between battery and solar bar) — legacy inline flow
    let batteryFlowColor = '#4CAF50';
    let batteryFlowPath = '';
    // Only show legacy battery flow if energy flow is NOT enabled (energy flow replaces it)
    let showBatteryFlow = show_battery_flow && hasBattery && !batteryIdle && show_battery_indicator && !show_energy_flow;

    if (showBatteryFlow) {
      const batteryEndPercent = houseIconSpace + batteryBarWidth;
      const gapPercent = 0.8;
      const solarStartPercent = houseIconSpace + batteryBarWidth + gapPercent;
      const barCenterY = 16;
      const batteryOverlap = 4.5;
      const solarOverlap = 2.0;

      if (batteryCharging) {
        batteryFlowColor = '#4CAF50';
        batteryFlowPath = `M ${solarStartPercent + solarOverlap} ${barCenterY} L ${batteryEndPercent - batteryOverlap} ${barCenterY}`;
      } else if (batteryDischarging) {
        batteryFlowColor = '#2196F3';
        batteryFlowPath = `M ${batteryEndPercent - batteryOverlap} ${barCenterY} L ${solarStartPercent + solarOverlap} ${barCenterY}`;
      }
    }

    // Energy flow system — shared bus architecture
    //
    // Two buses meet at the solar bar center (T-junction):
    //   Left bus:  solar junction ← house  (consumption, battery, grid import all flow left)
    //   Right bus: solar junction → grid   (export flows right; import flows left from grid)
    //
    // Static infrastructure: one neutral dashed line for the bus + stubs
    // Animated particles: colored per-flow, traveling along the shared bus
    //
    // SVG viewBox 1000×40. x in virtual px (1000 = container width), y in real pixels.
    const energyFlowPaths = [];
    let energyBusPath = '';
    let dotRx = 8;
    let dotRy = 4;
    let svgH = 48;
    if (show_energy_flow) {
      const vw = 1000;
      const barBottom = 32;
      const busY = 40;
      const baseFlowSpeed = energy_flow_speed || 2;

      // Physical corner/dot radius (px), compensated for non-uniform SVG scaling
      const cornerPx = 4;
      const ry = cornerPx;
      const rx = cornerPx * vw / actualContainerWidth;
      const dotPx = 4;
      dotRx = dotPx * vw / actualContainerWidth;
      dotRy = dotPx;

      // Calculate actual pixel positions of element centers (flex-layout-aware)
      const iconPx = 32;
      const gapPx = 8;

      const layoutElements = [];
      if (show_house_icon) layoutElements.push({ key: 'house', fixed: true, widthPx: iconPx });
      if (showEvCircle) layoutElements.push({ key: 'ev', fixed: true, widthPx: iconPx });
      if (hasBattery && show_battery_indicator) layoutElements.push({ key: 'battery', fixed: false, pct: batteryBarWidth });
      layoutElements.push({ key: 'solar', fixed: false, pct: powerBarWidth });
      if (showGridIcon) layoutElements.push({ key: 'grid', fixed: true, widthPx: iconPx });

      const numGaps = Math.max(0, layoutElements.length - 1);
      const totalGapPx = numGaps * gapPx;
      const totalFixedPx = layoutElements.filter(e => e.fixed).reduce((s, e) => s + e.widthPx, 0);
      const totalBarPct = layoutElements.filter(e => !e.fixed).reduce((s, e) => s + e.pct, 0);
      const desiredBarPx = (totalBarPct / 100) * actualContainerWidth;
      const availableForBars = actualContainerWidth - totalFixedPx - totalGapPx;
      const barScale = availableForBars / Math.max(desiredBarPx, 1);

      const positions = {};
      let xOffset = 0;
      for (let i = 0; i < layoutElements.length; i++) {
        const el = layoutElements[i];
        const widthPx = el.fixed ? el.widthPx : (el.pct / 100) * actualContainerWidth * barScale;
        positions[el.key] = (xOffset + widthPx / 2) / actualContainerWidth * vw;
        xOffset += widthPx;
        if (i < layoutElements.length - 1) xOffset += gapPx;
      }

      const houseX = positions.house || 0;
      const battX = positions.battery !== undefined ? positions.battery : null;
      const solarBarCenter = positions.solar;
      const gridX = positions.grid !== undefined ? positions.grid : null;
      const evX = positions.ev !== undefined ? positions.ev : null;

      // Calculate solar drop origin: bar center or middle of filled production
      const hasSolar = solarProduction > 0;
      let solarX = solarBarCenter;
      if (energy_flow_origin === 'production_center' && hasSolar) {
        const productionPct = solarHomePercent + solarEvPercent + exportPercent + batteryChargePercent;
        if (productionPct > 0) {
          // Find the solar bar's left edge and width in SVG units
          const solarEl = layoutElements.find(e => e.key === 'solar');
          const solarIdx = layoutElements.indexOf(solarEl);
          let solarLeftPx = 0;
          for (let i = 0; i < solarIdx; i++) {
            const el = layoutElements[i];
            solarLeftPx += el.fixed ? el.widthPx : (el.pct / 100) * actualContainerWidth * barScale;
            solarLeftPx += gapPx;
          }
          const solarWidthPx = (solarEl.pct / 100) * actualContainerWidth * barScale;
          const filledWidthPx = solarWidthPx * (productionPct / 100);
          // Round to nearest 5 SVG units to reduce unnecessary path rebuilds
          solarX = Math.round((solarLeftPx + filledWidthPx / 2) / actualContainerWidth * vw / 5) * 5;
        }
      }

      // Flow state flags
      const solarToHomeFlow = hasSolar && totalHouseConsumption > 0 && show_house_icon;
      const exportFlow = hasSolar && exportPower > flowThreshold && gridX !== null;
      const batteryChargeFlow = hasSolar && batteryCharging && battX !== null;
      const batteryDischargeFlow = batteryDischarging && battX !== null && show_house_icon;
      const gridImportFlow = hasGridImport && gridX !== null && show_house_icon;
      const solarToEvFlow = hasSolar && solarToEv > flowThreshold && evX !== null;
      const gridToEvFlow = gridToEv > flowThreshold && evX !== null && gridX !== null;

      const leftBusActive = solarToHomeFlow || batteryDischargeFlow || gridImportFlow || batteryChargeFlow || solarToEvFlow || gridToEvFlow;
      const rightBusActive = exportFlow || gridImportFlow;

      // ── Static bus infrastructure (single neutral dashed line) ──
      // Bus lines are drawn based on element *presence*, not active flow —
      // the dashed line always connects elements; only animated dots appear/disappear.
      const busSegments = [];

      // Solar drop: vertical from solar bar center toward bus (stops short for corner curve)
      // EV is left of solar, so treat it as a left element
      const hasLeftElement = show_house_icon || battX !== null || evX !== null;
      const hasRightElement = gridX !== null;
      if (hasSolar && (hasLeftElement || hasRightElement)) {
        busSegments.push(`M ${solarX} ${barBottom} L ${solarX} ${busY - ry}`);
      }

      // Left bus: curve from solar drop → horizontal → curve up → leftmost left element (house or ev)
      const leftmostX = show_house_icon ? houseX : (evX !== null ? evX : (battX !== null ? battX : null));
      if (hasSolar && leftmostX !== null) {
        busSegments.push(`M ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX - rx} ${busY} L ${leftmostX + rx} ${busY} Q ${leftmostX} ${busY} ${leftmostX} ${busY - ry} L ${leftmostX} ${barBottom}`);
      }

      // Right bus: curve from solar drop → horizontal → curve up → grid
      if (hasSolar && gridX !== null) {
        busSegments.push(`M ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX + rx} ${busY} L ${gridX - rx} ${busY} Q ${gridX} ${busY} ${gridX} ${busY - ry} L ${gridX} ${barBottom}`);
      }

      // Battery stub: vertical from bus to battery bar
      if (battX !== null) {
        busSegments.push(`M ${battX} ${busY} L ${battX} ${barBottom}`);
      }

      // EV stub: vertical from bus to EV circle (EV is left of battery/solar)
      if (evX !== null) {
        busSegments.push(`M ${evX} ${busY} L ${evX} ${barBottom}`);
      }

      // Grid-to-house stub when no solar (grid → bus → house/ev), drawn if elements present
      if (!hasSolar && gridX !== null && show_house_icon) {
        busSegments.push(`M ${gridX} ${barBottom} L ${gridX} ${busY - ry} Q ${gridX} ${busY} ${gridX - rx} ${busY} L ${houseX + rx} ${busY} Q ${houseX} ${busY} ${houseX} ${busY - ry} L ${houseX} ${barBottom}`);
      }

      // Grid-to-EV no-solar stub (only when no house icon — otherwise covered by grid-to-house bus)
      if (!hasSolar && gridX !== null && evX !== null && !show_house_icon) {
        busSegments.push(`M ${gridX} ${barBottom} L ${gridX} ${busY - ry} Q ${gridX} ${busY} ${gridX - rx} ${busY} L ${evX + rx} ${busY} Q ${evX} ${busY} ${evX} ${busY - ry} L ${evX} ${barBottom}`);
      }

      energyBusPath = busSegments.join(' ');

      // ── Animated particle routes (follow the shared bus with rounded corners) ──

      // Solar → House: drop → curve left → bus → curve up → house
      if (solarToHomeFlow) {
        energyFlowPaths.push({
          path: `M ${solarX} ${barBottom} L ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX - rx} ${busY} L ${houseX + rx} ${busY} Q ${houseX} ${busY} ${houseX} ${busY - ry} L ${houseX} ${barBottom}`,
          color: colors.self_usage, id: 'solarToHouse',
          power: solarToHome, hDist: Math.abs(solarX - houseX)
        });
      }

      // Solar → Grid (export): drop → curve right → bus → curve up → grid
      if (exportFlow) {
        energyFlowPaths.push({
          path: `M ${solarX} ${barBottom} L ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX + rx} ${busY} L ${gridX - rx} ${busY} Q ${gridX} ${busY} ${gridX} ${busY - ry} L ${gridX} ${barBottom}`,
          color: colors.export, id: 'solarToGrid',
          power: exportPower, hDist: Math.abs(solarX - gridX)
        });
      }

      // Solar → Battery (charge): drop → curve left → bus to battery → up stub
      if (batteryChargeFlow) {
        energyFlowPaths.push({
          path: `M ${solarX} ${barBottom} L ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX - rx} ${busY} L ${battX} ${busY} L ${battX} ${barBottom}`,
          color: colors.battery_charge, id: 'solarToBatt',
          power: solarToBattery, hDist: Math.abs(solarX - battX)
        });
      }

      // Battery → House (discharge): down stub → left on bus → curve up → house
      if (batteryDischargeFlow) {
        energyFlowPaths.push({
          path: `M ${battX} ${barBottom} L ${battX} ${busY} L ${houseX + rx} ${busY} Q ${houseX} ${busY} ${houseX} ${busY - ry} L ${houseX} ${barBottom}`,
          color: colors.battery_discharge, id: 'battToHouse',
          power: batteryToLoad, hDist: Math.abs(battX - houseX)
        });
      }

      // Grid → House (import): down from grid → curve left → bus → curve up → house
      if (gridImportFlow) {
        energyFlowPaths.push({
          path: `M ${gridX} ${barBottom} L ${gridX} ${busY - ry} Q ${gridX} ${busY} ${gridX - rx} ${busY} L ${houseX + rx} ${busY} Q ${houseX} ${busY} ${houseX} ${busY - ry} L ${houseX} ${barBottom}`,
          color: colors.import, id: 'gridToHouse',
          power: gridImportPower, hDist: Math.abs(gridX - houseX)
        });
      }

      // Solar → EV: drop → curve left → bus → curve up → EV (EV is left of solar)
      if (solarToEvFlow) {
        energyFlowPaths.push({
          path: `M ${solarX} ${barBottom} L ${solarX} ${busY - ry} Q ${solarX} ${busY} ${solarX - rx} ${busY} L ${evX + rx} ${busY} Q ${evX} ${busY} ${evX} ${busY - ry} L ${evX} ${barBottom}`,
          color: colors.ev_charge, id: 'solarToEv',
          power: solarToEv, hDist: Math.abs(solarX - evX)
        });
      }

      // Grid → EV: down from grid → curve left → bus → curve up → EV
      if (gridToEvFlow) {
        energyFlowPaths.push({
          path: `M ${gridX} ${barBottom} L ${gridX} ${busY - ry} Q ${gridX} ${busY} ${gridX - rx} ${busY} L ${evX + rx} ${busY} Q ${evX} ${busY} ${evX} ${busY - ry} L ${evX} ${barBottom}`,
          color: colors.ev_charge, id: 'gridToEv',
          power: gridToEv, hDist: Math.abs(gridX - evX)
        });
      }

      // ── Per-flow speed: normalize by path length so dots move at the same
      //    visual speed, then scale by power (more power → faster dots) ──
      const refDist = 400; // reference horizontal distance in SVG units
      const maxFlowPower = Math.max(...energyFlowPaths.map(f => f.power), 0.01);
      for (const f of energyFlowPaths) {
        const pathLen = f.hDist + 24; // verticals (~16) + curve overhead (~8)
        const lengthFactor = pathLen / refDist;
        // Compress power ratio with exponent so small flows aren't painfully slow
        const powerRatio = Math.max(0.25, Math.pow(f.power / maxFlowPower, 0.35));
        const rawSpeed = baseFlowSpeed * lengthFactor / powerRatio;
        // Clamp to 0.8–5s, round to 0.25s to reduce unnecessary SVG rebuilds
        f.speed = Math.round(Math.max(0.8, Math.min(5, rawSpeed)) * 4) / 4;
        // Uniform dot spacing: vary count by path length (~1 dot per 150 SVG units)
        f.numDots = Math.max(2, Math.min(5, Math.round(pathLen / 150)));
      }
    }

    // ── Split flows into three groups ──
    // "stable" (left-side): solar→house, battery flows — never rebuild on grid changes
    // "grid" (right-side): export, import — rebuild only on grid direction change
    // "ev": EV flows — independent of grid state
    const stableFlows = energyFlowPaths.filter(f => ['solarToHouse', 'solarToBatt', 'battToHouse'].includes(f.id));
    const gridFlows = energyFlowPaths.filter(f => ['solarToGrid', 'gridToHouse'].includes(f.id));
    const evFlows = energyFlowPaths.filter(f => ['solarToEv', 'gridToEv'].includes(f.id));

    const dotDims = `${dotRx.toFixed(1)}:${dotRy}`;
    const flowGroupKey = flows => flows.map(f => `${f.id}:${f.color}:${f.speed}:${f.numDots}`).join(',');
    const energyBusKey = show_energy_flow && energyBusPath ? `bus|${energyBusPath}` : '';
    const stableFlowKey = show_energy_flow && stableFlows.length ? `stable|${flowGroupKey(stableFlows)}|${dotDims}` : '';
    const gridFlowKey = show_energy_flow && gridFlows.length ? `grid|${flowGroupKey(gridFlows)}|${dotDims}` : '';
    const evFlowKey = show_energy_flow && evFlows.length ? `ev|${flowGroupKey(evFlows)}|${dotDims}` : '';

    // Detach existing energy flow SVG before innerHTML wipes the DOM tree.
    // The SVG shell and bus lines are always preserved; only flow <g> groups
    // are selectively replaced when their key changes.
    let preservedFlowSvg = null;
    this.shadowRoot?.querySelectorAll('.energy-flow-container.fading-out').forEach(el => el.remove());
    const existingFlowSvg = this.shadowRoot?.querySelector('.energy-flow-container');
    if (existingFlowSvg) {
      preservedFlowSvg = existingFlowSvg;
      existingFlowSvg.remove();
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --solar-usage-color: ${colors.self_usage};
          --ev-charging-color: ${colors.ev_charge};
          --grid-usage-color: ${colors.import};
          --solar-export-color: ${colors.export};
          --solar-available-color: ${colors.solar};
          --solar-anticipated-color: ${colors.solar};
          --battery-charge-color: ${colors.battery_charge};
          --battery-discharge-color: ${colors.battery_discharge};
          --battery-bar-color: ${colors.battery_bar};
        }

        ha-card {
          padding: 4px 8px;
          position: relative;
          background: ${colors.card_background || 'var(--ha-card-background, var(--card-background-color, white))'};
        }

        .card-header {
          color: var(--primary-text-color);
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .card-header-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-header-sensor {
          font-size: 14px;
          color: var(--secondary-text-color);
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .card-header-sensor:hover {
          opacity: 0.7;
        }

        .card-header-sensor ha-icon {
          --mdc-icon-size: 18px;
        }

        .card-header-weather {
          font-size: 14px;
          color: var(--secondary-text-color);
        }

        .power-stats-container {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
          container-type: inline-size;
          container-name: stats;
        }

        .power-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
          gap: 6px;
        }

        .stat {
          background: var(--secondary-background-color);
          padding: 6px 8px;
          border-radius: ${stats_border_radius}px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
          overflow: hidden;
        }

        .stat:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        .stat.battery-stat {
          position: relative;
        }

        .stat-label {
          color: var(--secondary-text-color);
          font-size: 11px;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          white-space: nowrap;
        }

        .stat-value {
          color: var(--primary-text-color);
          font-size: 15px;
          font-weight: 600;
          line-height: 1.2;
          white-space: nowrap;
        }

        .stat-detail-inline {
          font-size: 11px;
          font-weight: 400;
          color: var(--secondary-text-color);
        }

        /* Scale down stat fonts on narrow containers to prevent overflow */
        @container stats (max-width: 350px) {
          .stat-value { font-size: 13px; }
          .stat-label { font-size: 10px; }
          .stat-detail-inline { font-size: 10px; }
          .stat-history { font-size: 10px; }
        }

        @container stats (max-width: 280px) {
          .stat-value { font-size: 11px; }
          .stat-label { font-size: 9px; }
          .stat-detail-inline { font-size: 9px; }
          .stat-history { font-size: 9px; }
          .stat { padding: 4px 6px; }
        }

        .stat-history {
          color: var(--secondary-text-color);
          font-size: 11px;
          margin-top: 1px;
          line-height: 1.2;
        }

        .net-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .net-indicator-spacer {
          width: 8px;
          height: 8px;
          display: inline-block;
          flex-shrink: 0;
        }

        .net-indicator.net-export {
          background-color: var(--solar-export-color);
          box-shadow: 0 0 4px var(--solar-export-color);
        }

        .net-indicator.net-import {
          background-color: var(--grid-usage-color);
          box-shadow: 0 0 4px var(--grid-usage-color);
        }

        ${colors.stats_solar_background ? `.stat[data-action-key="solar"] { background: ${colors.stats_solar_background}; }` : ''}
        ${colors.stats_export_background ? `.stat[data-action-key="export"] { background: ${colors.stats_export_background}; }` : ''}
        ${colors.stats_import_background ? `.stat[data-action-key="import"] { background: ${colors.stats_import_background}; }` : ''}
        ${colors.stats_usage_background ? `.stat[data-action-key="usage"] { background: ${colors.stats_usage_background}; }` : ''}
        ${colors.stats_battery_background ? `.stat[data-action-key="battery"] { background: ${colors.stats_battery_background}; }` : ''}
        ${colors.stats_ev_background ? `.stat[data-action-key="ev"] { background: ${colors.stats_ev_background}; }` : ''}
        ${colors.stats_consumer_1_background ? `.stat[data-action-key="consumer_1"] { background: ${colors.stats_consumer_1_background}; }` : ''}
        ${colors.stats_consumer_2_background ? `.stat[data-action-key="consumer_2"] { background: ${colors.stats_consumer_2_background}; }` : ''}

        .battery-container {
          position: relative;
          width: 100%;
          margin-bottom: 8px;
        }

        .battery-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: var(--secondary-background-color);
          border: 1px solid var(--divider-color);
          border-radius: 16px;
          padding: 0 12px;
          height: 32px;
          margin-bottom: 4px;
          transition: all 0.3s ease;
        }

        .battery-indicator.charging {
          border-color: var(--battery-charge-color);
        }

        .battery-indicator.discharging {
          border-color: var(--battery-discharge-color);
        }

        .battery-indicator.low-battery {
          border-color: #f44336;
        }

        .battery-icon-wrapper {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .battery-icon {
          width: 24px;
          height: 12px;
          border: 2px solid var(--primary-text-color);
          border-radius: 2px;
          position: relative;
          opacity: 0.7;
        }

        .battery-terminal {
          position: absolute;
          right: -3px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 6px;
          background: var(--primary-text-color);
          border-radius: 0 1px 1px 0;
          opacity: 0.7;
        }

        .battery-level {
          position: absolute;
          left: 1px;
          top: 1px;
          bottom: 1px;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          border-radius: 1px;
          transition: width 0.3s ease;
        }

        .battery-level.low {
          background: linear-gradient(90deg, #f44336, #ff9800);
        }

        .battery-level.medium {
          background: linear-gradient(90deg, #ff9800, #FFC107);
        }

        .battery-soc {
          font-size: 12px;
          font-weight: 600;
          color: var(--primary-text-color);
        }

        .flow-line-container {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          width: 100%;
          height: 32px;
          pointer-events: none;
          z-index: 2;
        }

        .flow-particle {
          /* Opacity animation handled inline via animateMotion */
        }

        .flow-arrow {
          position: absolute;
          top: 50%;
          left: ${batteryBarWidth}%;
          transform: translate(-50%, -50%);
          font-size: 16px;
          z-index: 3;
          pointer-events: none;
        }

        .solar-bar-container {
          margin: 2px 0;
        }

        .solar-bar-label {
          color: var(--primary-text-color);
          font-size: 14px;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }

        .capacity-label {
          color: var(--secondary-text-color);
          font-size: 12px;
        }

        .bars-container {
          position: relative;
          display: flex;
          gap: 8px;
          align-items: center;
          ${show_energy_flow ? 'padding-bottom: 20px;' : ''}
        }

        .battery-bar-wrapper {
          position: relative;
          height: 32px;
          background: var(--divider-color);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .battery-bar-wrapper:hover {
          opacity: 0.8;
        }

        .battery-bar-wrapper.standby {
          opacity: 0.5;
        }

        .battery-bar-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, var(--battery-bar-color), var(--battery-bar-color));
          transition: width 0.3s ease;
          border-radius: 16px;
        }

        .bar-overlay-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0,0,0,0.7);
          pointer-events: none;
          z-index: 5;
        }

        .battery-bar-fill.low {
          background: linear-gradient(90deg, #f44336, #ff9800);
        }

        .battery-bar-fill.medium {
          background: linear-gradient(90deg, #ff9800, #FFC107);
        }

        .battery-bar-fill.charging {
          background: linear-gradient(90deg, var(--battery-charge-color), var(--battery-charge-color));
        }

        .battery-bar-fill.discharging {
          background: linear-gradient(90deg, var(--battery-discharge-color), var(--battery-discharge-color));
        }

        .solar-bar-wrapper {
          position: relative;
          height: 32px;
          background: var(--divider-color);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .solar-bar-wrapper:hover {
          opacity: 0.8;
        }

        .solar-bar-wrapper.standby {
          opacity: 0.6;
        }

        .solar-bar-wrapper.standby .bar-segment {
          background: linear-gradient(90deg, #E0E0E0, #F5F5F5) !important;
        }

        .solar-bar {
          height: 100%;
          display: flex;
          border-radius: 16px;
          overflow: hidden;
        }

        .grid-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
          flex-shrink: 0;
          cursor: pointer;
        }

        .grid-icon:hover {
          transform: scale(1.1);
        }

        .grid-icon ha-icon {
          --mdc-icon-size: 20px;
          color: ${colors.grid_icon_color || 'black'};
        }

        .grid-icon.import {
          background: ${colors.grid_icon_import || 'linear-gradient(135deg, var(--grid-usage-color), var(--grid-usage-color))'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .grid-icon.export {
          background: ${colors.grid_icon_export || 'linear-gradient(135deg, var(--solar-export-color), var(--solar-export-color))'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .grid-icon.idle {
          background: ${colors.grid_icon_idle || 'var(--disabled-text-color, #9e9e9e)'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .house-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.3s ease;
          flex-shrink: 0;
          cursor: pointer;
          background: var(--solar-usage-color);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .house-icon:hover {
          transform: scale(1.1);
        }

        .house-icon ha-icon {
          --mdc-icon-size: 20px;
          color: white;
        }

        .house-icon.importing {
          background: var(--grid-usage-color);
        }

        .energy-flow-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 48px;
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.4s ease-out;
        }

        .energy-flow-container.fading-out {
          opacity: 0;
        }

        .energy-flow-stable,
        .energy-flow-grid,
        .energy-flow-ev {
          transition: opacity 0.4s ease-out;
        }

        .energy-flow-stable.fading-out,
        .energy-flow-grid.fading-out,
        .energy-flow-ev.fading-out {
          opacity: 0;
        }

        .energy-bus-line {
          stroke: var(--secondary-text-color, #999);
          stroke-width: 2;
          stroke-dasharray: 6,4;
          opacity: 0.25;
        }

        .bar-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          position: relative;
          z-index: 3;
        }

        .solar-home-segment {
          background: linear-gradient(90deg, var(--solar-usage-color), var(--solar-usage-color));
        }

        .solar-ev-segment {
          background: linear-gradient(90deg, var(--ev-charging-color), var(--ev-charging-color));
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .grid-home-segment {
          background: linear-gradient(90deg, var(--grid-usage-color), var(--grid-usage-color));
        }

        .grid-ev-segment {
          background: linear-gradient(90deg, var(--ev-charging-color), var(--ev-charging-color));
          opacity: 0.8;
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .export-segment {
          background: linear-gradient(90deg, var(--solar-export-color), var(--solar-export-color));
        }

        .battery-charge-segment {
          background: linear-gradient(90deg, var(--battery-charge-color), var(--battery-charge-color));
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .car-charger-segment {
          background: linear-gradient(90deg, #E0E0E0, #F5F5F5);
          opacity: 0.8;
          border: 1px dashed rgba(158,158,158,0.3);
          border-left: none;
          border-right: none;
          color: #424242;
          text-shadow: none;
        }

        .ev-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--disabled-text-color, #9e9e9e);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .ev-icon:hover {
          transform: scale(1.1);
        }

        .ev-icon ha-icon {
          --mdc-icon-size: 18px;
          color: ${ev_icon_color || 'black'};
        }

        .ev-icon.idle {
          opacity: 0.6;
        }

        .ev-icon.ready-half {
          background: ${colors.grid_icon_import || 'linear-gradient(135deg, var(--grid-usage-color), var(--grid-usage-color))'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          opacity: 1;
        }

        .ev-icon.ready-full {
          background: ${colors.grid_icon_export || 'linear-gradient(135deg, var(--solar-export-color), var(--solar-export-color))'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          opacity: 1;
        }

        .ev-icon.charging {
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.9), 0 0 22px rgba(251, 191, 36, 0.5);
          opacity: 1;
        }

        .standby-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--secondary-text-color, #666);
          font-size: 12px;
          font-weight: 600;
          font-style: italic;
          pointer-events: none;
          z-index: 5;
          white-space: nowrap;
        }

        .unused-segment {
          background: var(--card-background-color, var(--primary-background-color));
          opacity: 0.3;
          border: none;
        }

        .forecast-indicator {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: repeating-linear-gradient(
            to bottom,
            var(--solar-anticipated-color),
            var(--solar-anticipated-color) 4px,
            transparent 4px,
            transparent 8px
          );
          box-shadow: 0 0 6px var(--solar-anticipated-color);
          z-index: 1;
          pointer-events: none;
        }

        .forecast-indicator::before {
          content: '⚡';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--solar-anticipated-color);
          font-size: 16px;
          text-shadow: 0 0 4px rgba(255,193,7,0.8);
        }

        .peak-forecast-indicator {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: var(--solar-anticipated-color);
          box-shadow: 0 0 6px var(--solar-anticipated-color);
          z-index: 1;
          pointer-events: none;
        }

        .peak-forecast-indicator::before {
          content: '▲';
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          color: var(--solar-anticipated-color);
          font-size: 12px;
          text-shadow: 0 0 4px rgba(255,193,7,0.8);
        }

        .usage-indicator {
          position: absolute;
          top: 0;
          width: 3px;
          height: 100%;
          background: repeating-linear-gradient(
            to bottom,
            var(--solar-usage-color),
            var(--solar-usage-color) 4px,
            transparent 4px,
            transparent 8px
          );
          box-shadow: 0 0 4px var(--solar-usage-color);
          z-index: 2;
          pointer-events: none;
        }

        .tick-marks {
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 8px;
          display: flex;
          justify-content: space-between;
          padding: 0 2px;
        }

        .tick {
          width: 1px;
          height: 6px;
          background: var(--divider-color);
          position: relative;
        }

        .tick-label {
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: var(--secondary-text-color);
          white-space: nowrap;
        }

        .legend {
          display: flex;
          justify-content: space-around;
          margin-top: 4px;
          font-size: 11px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--secondary-text-color);
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .legend-item:hover {
          opacity: 0.7;
        }

        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }

        .solar-home-color { background: var(--solar-usage-color); }
        .ev-charging-color { background: var(--ev-charging-color); }
        .grid-home-color { background: var(--grid-usage-color); }
        .export-color { background: var(--solar-export-color); }
        .car-charger-color { background: #E0E0E0; opacity: 0.8; }
        .anticipated-color { background: var(--solar-anticipated-color); }
        .battery-charge-color { background: var(--battery-charge-color); }
        .battery-discharge-color { background: var(--battery-discharge-color); }

        .no-data {
          text-align: center;
          color: var(--secondary-text-color);
          padding: 20px;
          font-style: italic;
        }
      </style>

      <ha-card>
        ${show_header || show_weather || headerSensor1Data || headerSensor2Data ? `
          <div class="card-header">
            ${show_header ? `
              <div class="card-header-item">
                <span>☀️</span>
                <span>${header_title}</span>
              </div>
            ` : ''}
            ${headerSensor1Data ? `
              <div class="card-header-item card-header-sensor" data-entity="${header_sensor_1.entity}" title="Click to view history">
                ${headerSensor1Data.isMdiIcon ? `<ha-icon icon="${headerSensor1Data.icon}"${headerSensor1Data.iconColor ? ` style="color: ${headerSensor1Data.iconColor};"` : ''}></ha-icon>` : `<span${headerSensor1Data.iconColor ? ` style="color: ${headerSensor1Data.iconColor};"` : ''}>${headerSensor1Data.icon}</span>`}
                <span>${headerSensor1Data.name ? `${headerSensor1Data.name}: ` : ''}${headerSensor1Data.value}${headerSensor1Data.unit}</span>
              </div>
            ` : ''}
            ${headerSensor2Data ? `
              <div class="card-header-item card-header-sensor" data-entity="${header_sensor_2.entity}" title="Click to view history">
                ${headerSensor2Data.isMdiIcon ? `<ha-icon icon="${headerSensor2Data.icon}"${headerSensor2Data.iconColor ? ` style="color: ${headerSensor2Data.iconColor};"` : ''}></ha-icon>` : `<span${headerSensor2Data.iconColor ? ` style="color: ${headerSensor2Data.iconColor};"` : ''}>${headerSensor2Data.icon}</span>`}
                <span>${headerSensor2Data.name ? `${headerSensor2Data.name}: ` : ''}${headerSensor2Data.value}${headerSensor2Data.unit}</span>
              </div>
            ` : ''}
            ${show_weather && weatherTemp !== null ? `
              <div class="card-header-item card-header-weather">
                <span>${weatherIcon}</span>
                <span>${weatherTemp}${weatherUnit}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${show_stats ? (() => {
          // Inline mode: detail shown as " / detail" on the value line; Below mode: separate row
          const isInline = stats_detail_position === 'inline';
          const renderDetail = (detailText) => {
            if (!show_stats_detail || !detailText) return '';
            return isInline
              ? ` <span class="stat-detail-inline">/ ${detailText}</span>`
              : `<div class="stat-history">${detailText}</div>`;
          };

          // Resolve detail text for export/import tiles
          const exportDetailText = hasHistoryData && netPosition !== null ? `${netPosition >= 0 ? '+' : ''}${netPosition.toFixed(decimal_places)} kWh` : hasHistoryData && dailyExport !== null ? `+${dailyExport.toFixed(decimal_places)} kWh` : null;
          const importDetailText = hasHistoryData && netPosition !== null ? `${netPosition >= 0 ? '+' : ''}${netPosition.toFixed(decimal_places)} kWh` : hasHistoryData && dailyImport !== null ? `-${dailyImport.toFixed(decimal_places)} kWh` : null;

          // Resolve history values for EV and consumers
          const evDailyEnergy = ev_history_entity ? this.getSensorValue(ev_history_entity) : null;
          const c1DailyEnergy = consumer_1_history_entity ? this.getSensorValue(consumer_1_history_entity) : null;
          const c2DailyEnergy = consumer_2_history_entity ? this.getSensorValue(consumer_2_history_entity) : null;

          // Core tiles (always present): Solar, Usage, Export/Import
          const coreTiles = [
            `<div class="stat" data-entity="${production_entity}" data-action-key="solar" title="${this.getLabel('click_history')}">
              <div class="stat-label">${this.getLabel('solar')}</div>
              <div class="stat-value">${fmtPow(solarProduction)}${isInline ? renderDetail(hasProdHistoryData && dailyProduction !== null ? `${dailyProduction.toFixed(decimal_places)} kWh` : null) : ''}</div>
              ${!isInline ? renderDetail(hasProdHistoryData && dailyProduction !== null ? `${dailyProduction.toFixed(decimal_places)} kWh` : null) : ''}
            </div>`,
            `<div class="stat" data-entity="${self_consumption_entity}" data-action-key="usage" title="${this.getLabel('click_history')}">
              <div class="stat-label">${this.getLabel('usage')}</div>
              <div class="stat-value">${fmtPow(totalHouseConsumption)}${isInline ? renderDetail(hasConsHistoryData && dailyConsumption !== null ? `${dailyConsumption.toFixed(decimal_places)} kWh` : null) : ''}</div>
              ${!isInline ? renderDetail(hasConsHistoryData && dailyConsumption !== null ? `${dailyConsumption.toFixed(decimal_places)} kWh` : null) : ''}
            </div>`,
            exportPower > 0 ? `
              <div class="stat" data-entity="${grid_power_entity || export_entity}" data-action-key="export" title="${this.getLabel('click_history')}">
                <div class="stat-label">
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator-spacer"></span>` : ''}
                  ${this.getLabel('export')}
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator ${netPosition >= 0 ? 'net-export' : 'net-import'}"></span>` : ''}
                </div>
                <div class="stat-value">${fmtPow(exportPower)}${isInline ? renderDetail(exportDetailText) : ''}</div>
                ${!isInline ? renderDetail(exportDetailText) : ''}
              </div>
            ` : totalGridImport > 0 ? `
              <div class="stat" data-entity="${grid_power_entity || import_entity}" data-action-key="import" title="${this.getLabel('click_history')}">
                <div class="stat-label">
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator-spacer"></span>` : ''}
                  ${this.getLabel('import')}
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator ${netPosition >= 0 ? 'net-export' : 'net-import'}"></span>` : ''}
                </div>
                <div class="stat-value">${fmtPow(totalGridImport)}${isInline ? renderDetail(importDetailText) : ''}</div>
                ${!isInline ? renderDetail(importDetailText) : ''}
              </div>
            ` : null
          ].filter(Boolean);

          // Extra tiles (dynamic): Battery, EV, consumers
          const extraTiles = [];
          if (hasBattery) {
            const battDetail = `${batterySOC.toFixed(battery_soc_decimal_places)} %`;
            extraTiles.push(`
              <div class="stat battery-stat" data-entity="${battery_power_entity || battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                <div class="stat-label">${this.getLabel('battery')}</div>
                <div class="stat-value">${batteryCharging ? '↑' : batteryDischarging ? '↓' : ''}${fmtPow(Math.abs(batteryPower))}${isInline ? renderDetail(battDetail) : ''}</div>
                ${!isInline ? renderDetail(battDetail) : ''}
              </div>
            `);
          }
          if (ev_charger_sensor && (isActuallyCharging || show_ev_when_idle)) {
            const evDetailText = evDailyEnergy !== null ? `${evDailyEnergy.toFixed(decimal_places)} kWh` : null;
            extraTiles.push(`
              <div class="stat" data-entity="${ev_charger_sensor}" data-action-key="ev" title="${this.getLabel('click_history')}">
                <div class="stat-label">${this.getLabel('ev')}</div>
                <div class="stat-value">${fmtPow(evUsage)}${isInline ? renderDetail(evDetailText) : ''}</div>
                ${!isInline ? renderDetail(evDetailText) : ''}
              </div>
            `);
          }
          // Additional consumer tiles
          if (consumer_1_entity) {
            const c1Power = this.getSensorValue(consumer_1_entity) || 0;
            if (c1Power > 0 || show_consumers_when_idle) {
              const c1DetailText = c1DailyEnergy !== null ? `${c1DailyEnergy.toFixed(decimal_places)} kWh` : null;
              extraTiles.push(`
                <div class="stat" data-entity="${consumer_1_entity}" data-action-key="consumer_1" title="${this.getLabel('click_history')}">
                  <div class="stat-label">${consumer_1_name || 'Consumer 1'}</div>
                  <div class="stat-value">${fmtPow(c1Power)}${isInline ? renderDetail(c1DetailText) : ''}</div>
                  ${!isInline ? renderDetail(c1DetailText) : ''}
                </div>
              `);
            }
          }
          if (consumer_2_entity) {
            const c2Power = this.getSensorValue(consumer_2_entity) || 0;
            if (c2Power > 0 || show_consumers_when_idle) {
              const c2DetailText = c2DailyEnergy !== null ? `${c2DailyEnergy.toFixed(decimal_places)} kWh` : null;
              extraTiles.push(`
                <div class="stat" data-entity="${consumer_2_entity}" data-action-key="consumer_2" title="${this.getLabel('click_history')}">
                  <div class="stat-label">${consumer_2_name || 'Consumer 2'}</div>
                  <div class="stat-value">${fmtPow(c2Power)}${isInline ? renderDetail(c2DetailText) : ''}</div>
                  ${!isInline ? renderDetail(c2DetailText) : ''}
                </div>
              `);
            }
          }

          // Layout: ≤1 extra → single row; 2+ extras → two rows
          if (extraTiles.length <= 1) {
            return `<div class="power-stats-container"><div class="power-stats">${coreTiles.join('')}${extraTiles.join('')}</div></div>`;
          } else {
            return `<div class="power-stats-container"><div class="power-stats">${coreTiles.join('')}</div><div class="power-stats">${extraTiles.join('')}</div></div>`;
          }
        })() : ''}


        ${(production_entity || self_consumption_entity || export_entity) ? `
          <div class="solar-bar-container">
            ${show_bar_label ? `
              <div class="solar-bar-label">
                <span>${this.getLabel('power_flow')}</span>
                <span class="capacity-label">
                  ${hasBattery && show_battery_indicator ? `${this.getLabel('battery')} ${batterySOC.toFixed(battery_soc_decimal_places)} % | ` : ''}0 - ${fmtPow(inverter_size)}
                </span>
              </div>
            ` : ''}
            <div class="bars-container">
              ${show_house_icon ? `
                <div class="house-icon ${hasGridImport && solarProduction <= 0 ? 'importing' : ''}"
                     data-entity="${self_consumption_entity}"
                     data-action-key="usage"
                     title="${this.getLabel('usage')}: ${fmtPow(totalHouseConsumption)} - ${this.getLabel('click_history')}">
                  <ha-icon icon="mdi:home" style="color: white"></ha-icon>
                </div>
              ` : ''}
              ${showEvCircle ? `
                <div class="ev-icon ${isActuallyCharging ? 'charging' : evReadyFull ? 'ready-full' : evReadyHalf ? 'ready-half' : 'idle'}"
                     data-entity="${ev_charger_sensor}"
                     data-action-key="ev"
                     title="${isActuallyCharging ? `${this.getLabel('ev')}: ${fmtPow(actualEvCharging)} - ${this.getLabel('click_history')}` : evReadyFull ? this.getLabel('excess_solar_full') : evReadyHalf ? this.getLabel('excess_solar_half') : this.getLabel('ev')}">
                  <ha-icon icon="mdi:car-electric"></ha-icon>
                </div>
              ` : ''}
              ${hasBattery && show_battery_indicator ? `
                <div class="battery-bar-wrapper ${isIdle ? 'standby' : ''}" style="width: ${batteryBarWidth}%" data-entity="${battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                  <div class="battery-bar-fill ${batteryCharging ? 'charging' : batteryDischarging ? 'discharging' : batterySOC < 20 ? 'low' : batterySOC < 50 ? 'medium' : ''}" style="width: ${batterySOC}%"></div>
                  ${shouldShowSegmentText(batteryBarWidth, `${batterySOC.toFixed(battery_soc_decimal_places)} %`, 100) ? `<div class="bar-overlay-label">${batterySOC.toFixed(battery_soc_decimal_places)} %</div>` : ''}
                </div>
              ` : ''}
              <div class="solar-bar-wrapper ${isIdle ? 'standby' : ''}" style="width: ${powerBarWidth}%" data-entity="${production_entity}" data-action-key="solar" title="${this.getLabel('click_history')}">
                <div class="solar-bar">
                  ${solarHomePercent > 0 ? `<div class="bar-segment solar-home-segment" style="width: ${solarHomePercent}%">${show_bar_values && solarToHome > 0.1 && shouldShowSegmentText(solarHomePercent, segmentText(segment_text_solar_home, solarToHome, 'solar', solarHomePercent) || `${fmtPow(solarToHome)}`, powerBarWidth) ? (segmentText(segment_text_solar_home, solarToHome, 'solar', solarHomePercent) || `${fmtPow(solarToHome)}`) : ''}</div>` : ''}
                  ${solarEvPercent > 0 ? `<div class="bar-segment solar-ev-segment" style="width: ${solarEvPercent}%">${show_bar_values && solarToEv > 0.1 && shouldShowSegmentText(solarEvPercent, segmentText(segment_text_solar_ev, solarToEv, 'ev', solarEvPercent) || `${fmtPow(solarToEv)} ${this.getLabel('ev')}`, powerBarWidth) ? (segmentText(segment_text_solar_ev, solarToEv, 'ev', solarEvPercent) || `${fmtPow(solarToEv)} ${this.getLabel('ev')}`) : ''}</div>` : ''}
                  ${batteryChargePercent > 0 ? `<div class="bar-segment battery-charge-segment" style="width: ${batteryChargePercent}%">${show_bar_values && solarToBattery > 0.1 && shouldShowSegmentText(batteryChargePercent, segmentText(segment_text_battery_charge, solarToBattery, 'battery', batteryChargePercent) || `${fmtPow(solarToBattery)} ${this.getLabel('battery')}`, powerBarWidth) ? (segmentText(segment_text_battery_charge, solarToBattery, 'battery', batteryChargePercent) || `${fmtPow(solarToBattery)} ${this.getLabel('battery')}`) : ''}</div>` : ''}
                  ${exportPercent > 0 ? `<div class="bar-segment export-segment" style="width: ${exportPercent}%">${show_bar_values && shouldShowSegmentText(exportPercent, segmentText(segment_text_export, exportPower, 'export', exportPercent) || `${fmtPow(exportPower)} ${this.getLabel('export')}`, powerBarWidth) ? (segmentText(segment_text_export, exportPower, 'export', exportPercent) || `${fmtPow(exportPower)} ${this.getLabel('export')}`) : ''}</div>` : ''}
                  ${evPotentialPercent > 0 ? `<div class="bar-segment car-charger-segment" style="width: ${evPotentialPercent}%">${show_bar_values && shouldShowSegmentText(evPotentialPercent, segmentText(segment_text_ev_potential, car_charger_load, 'ev', evPotentialPercent) || `${fmtPow(car_charger_load)} ${this.getLabel('ev')}`, powerBarWidth) ? (segmentText(segment_text_ev_potential, car_charger_load, 'ev', evPotentialPercent) || `${fmtPow(car_charger_load)} ${this.getLabel('ev')}`) : ''}</div>` : ''}
                  ${unusedPercent > 0 ? `<div class="bar-segment unused-segment" style="width: ${unusedPercent}%"></div>` : ''}
                </div>
                ${isIdle ? `<div class="standby-label">🌙 ${this.getLabel('standby_mode')}</div>` : ''}
                ${!isIdle && hasBattery && show_battery_indicator && !show_bar_values ? `<div class="bar-overlay-label">${this.getLabel('solar')}</div>` : ''}
                ${anticipatedPotential > solarProduction && (forecast_entity || use_solcast) ? `
                  <div class="forecast-indicator"
                       style="left: ${anticipatedPercent}%"
                       title="${this.getLabel('forecast_potential')}: ${fmtPow(anticipatedPotential)}"></div>
                ` : ''}
                ${peakForecastPotential > 0 && (peak_forecast_entity || use_solcast) ? `
                  <div class="peak-forecast-indicator"
                       style="left: ${peakForecastPercent}%"
                       title="${this.getLabel('forecast_peak')}: ${fmtPow(peakForecastPotential)}"></div>
                ` : ''}
                ${showUsageIndicator ? `
                  <div class="usage-indicator"
                       style="left: ${usagePercent}%"
                       title="${this.getLabel('total_usage')}: ${fmtPow(totalHouseConsumption)}"></div>
                ` : ''}
              </div>
              ${showGridIcon ? `
                <div class="grid-icon ${hasGridImport ? 'import' : hasGridExport ? 'export' : 'idle'}"
                     data-entity="${grid_power_entity || (hasGridImport ? import_entity : export_entity) || import_entity || export_entity}"
                     data-action-key="${hasGridImport ? 'import' : 'export'}"
                     title="${hasGridImport ? `${this.getLabel('grid_import')}: ${fmtPow(gridImportPower)} - ${this.getLabel('click_history')}` : hasGridExport ? `${this.getLabel('grid_export')}: ${fmtPow(exportPower)} - ${this.getLabel('click_history')}` : this.getLabel('grid_idle')}">
                  <ha-icon icon="mdi:transmission-tower" style="color: ${colors.grid_icon_color || 'black'}"></ha-icon>
                </div>
              ` : ''}
              ${showBatteryFlow ? `
                <svg class="flow-line-container" width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="xMidYMid slice" style="z-index: 2;">
                  <defs>
                    <filter id="batteryGlow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <path id="batteryFlowPath"
                        d="${batteryFlowPath}"
                        stroke="${batteryFlowColor}"
                        stroke-width="4"
                        fill="none"
                        filter="url(#batteryGlow)"
                        stroke-dasharray="4,4"
                        opacity="0.7"
                        vector-effect="non-scaling-stroke">
                    <animate attributeName="stroke-dashoffset"
                             from="0"
                             to="8"
                             dur="0.6s"
                             repeatCount="indefinite"/>
                  </path>
                  ${[0, 1, 2].map(i => `
                    <circle class="flow-particle" r="0.6" fill="${batteryFlowColor}">
                      <animateMotion dur="${battery_flow_animation_speed}s" repeatCount="indefinite" begin="${i * battery_flow_animation_speed / 3}s">
                        <mpath href="#batteryFlowPath"/>
                      </animateMotion>
                      <animate attributeName="opacity"
                               values="0;0.9;0.9;0"
                               keyTimes="0;0.1;0.9;1"
                               dur="${battery_flow_animation_speed}s"
                               repeatCount="indefinite"
                               begin="${i * battery_flow_animation_speed / 3}s"/>
                    </circle>
                  `).join('')}
                </svg>
              ` : ''}
              <!-- energy flow SVG is managed separately to preserve animations -->
            </div>
          </div>

          ${show_legend ? `
            <div class="legend">
              ${solarProduction > 0 ? `
                <div class="legend-item" data-entity="${production_entity}" data-action-key="solar" title="${this.getLabel('click_history')}">
                  <span>☀️</span>
                  <span>${this.getLabel('solar')}${show_legend_values ? ` ${solarProduction.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${solarToHome > 0 ? `
                <div class="legend-item" data-entity="${self_consumption_entity}" data-action-key="usage" title="${this.getLabel('click_history')}">
                  <div class="legend-color solar-home-color"></div>
                  <span>${this.getLabel('usage')}${show_legend_values ? ` ${totalHouseConsumption.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${exportPower > 0 ? `
                <div class="legend-item" data-entity="${grid_power_entity || export_entity}" data-action-key="export" title="${this.getLabel('click_history')}">
                  <div class="legend-color export-color"></div>
                  <span>${this.getLabel('export')}${show_legend_values ? ` ${exportPower.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${totalGridImport > 0 ? `
                <div class="legend-item" data-entity="${grid_power_entity || import_entity}" data-action-key="import" title="${this.getLabel('click_history')}">
                  <div class="legend-color grid-home-color"></div>
                  <span>${this.getLabel('import')}${show_legend_values ? ` ${fmtPow(totalGridImport)}` : ''}</span>
                </div>
              ` : ''}
              ${evUsage > 0 ? `
                <div class="legend-item" data-entity="${ev_charger_sensor}" data-action-key="ev" title="${this.getLabel('click_history')}">
                  <div class="legend-color ev-charging-color"></div>
                  <span>${this.getLabel('ev')}${show_legend_values ? ` ${fmtPow(evUsage)}` : ''}</span>
                </div>
              ` : ''}
              ${hasBattery && batteryCharging ? `
                <div class="legend-item" data-entity="${battery_power_entity || battery_charge_entity || battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                  <div class="legend-color battery-charge-color"></div>
                  <span>${this.getLabel('battery')}${show_legend_values ? ` ${batteryPower.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${hasBattery && batteryDischarging ? `
                <div class="legend-item" data-entity="${battery_power_entity || battery_discharge_entity || battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                  <div class="legend-color battery-discharge-color"></div>
                  <span>${this.getLabel('battery')}${show_legend_values ? ` ${Math.abs(batteryPower).toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
            </div>
          ` : ''}
        ` : `
          <div class="no-data">
            Configure sensor entities to display solar data
          </div>
        `}
      </ha-card>
    `;

    // ── Energy flow SVG: split into static bus + two independent flow groups ──
    // Bus lines are always preserved. Stable flows (solar→house, battery) and
    // grid flows (export, import) each have their own key so import↔export
    // changes only rebuild the grid half, leaving other animations running.
    const flowContainer = this.shadowRoot.querySelector('.bars-container');

    // Helper: build a <g> group's inner HTML for a set of flows
    const flowGroupHtml = (flows) => flows.map(f => `
      <path id="path_${f.id}" d="${f.path}" fill="none" stroke="none"/>
      ${Array.from({length: f.numDots}, (_, i) => `
        <ellipse rx="${dotRx}" ry="${dotRy}" fill="${f.color}" opacity="0.9">
          <animateMotion dur="${f.speed}s" repeatCount="indefinite" begin="${i * f.speed / f.numDots}s">
            <mpath href="#path_${f.id}"/>
          </animateMotion>
        </ellipse>
      `).join('')}
    `).join('');

    if (flowContainer && show_energy_flow && energyBusPath) {
      if (preservedFlowSvg) {
        // Re-attach the preserved SVG shell (bus lines stay intact)
        flowContainer.appendChild(preservedFlowSvg);
        const svg = preservedFlowSvg;

        // Update bus lines if element layout changed (rare)
        if (energyBusKey !== this._energyBusKey) {
          const busGroup = svg.querySelector('.energy-bus-lines');
          if (busGroup) {
            busGroup.innerHTML = `<path class="energy-bus-line" d="${energyBusPath}" fill="none" vector-effect="non-scaling-stroke"/>`;
          }
          this._energyBusKey = energyBusKey;
        }

        // Selectively update each flow group
        const updateFlowGroup = (className, newKey, keyProp, flows) => {
          const oldKey = this[keyProp] || '';
          if (newKey === oldKey) return; // unchanged — keep animating
          const existing = svg.querySelector(`.${className}`);
          if (existing) {
            if (newKey && flows.length) {
              // Crossfade: fade out old group, insert new
              existing.classList.add('fading-out');
              const oldGroup = existing;
              setTimeout(() => oldGroup.remove(), 400);
              const ns = 'http://www.w3.org/2000/svg';
              const newG = document.createElementNS(ns, 'g');
              newG.setAttribute('class', className);
              newG.innerHTML = flowGroupHtml(flows);
              svg.appendChild(newG);
            } else {
              // No flows in this group anymore — remove
              existing.remove();
            }
          } else if (newKey && flows.length) {
            // Group didn't exist before — create it
            const ns = 'http://www.w3.org/2000/svg';
            const newG = document.createElementNS(ns, 'g');
            newG.setAttribute('class', className);
            newG.innerHTML = flowGroupHtml(flows);
            svg.appendChild(newG);
          }
          this[keyProp] = newKey;
        };

        updateFlowGroup('energy-flow-stable', stableFlowKey, '_stableFlowKey', stableFlows);
        updateFlowGroup('energy-flow-grid', gridFlowKey, '_gridFlowKey', gridFlows);
        updateFlowGroup('energy-flow-ev', evFlowKey, '_evFlowKey', evFlows);
      } else {
        // First render — create the full SVG
        const newFlowSvg = `
          <svg class="energy-flow-container" width="100%" height="${svgH}" viewBox="0 0 1000 ${svgH}" preserveAspectRatio="none">
            <g class="energy-bus-lines">
              <path class="energy-bus-line" d="${energyBusPath}" fill="none" vector-effect="non-scaling-stroke"/>
            </g>
            ${stableFlows.length ? `<g class="energy-flow-stable">${flowGroupHtml(stableFlows)}</g>` : ''}
            ${gridFlows.length ? `<g class="energy-flow-grid">${flowGroupHtml(gridFlows)}</g>` : ''}
            ${evFlows.length ? `<g class="energy-flow-ev">${flowGroupHtml(evFlows)}</g>` : ''}
          </svg>
        `;
        flowContainer.insertAdjacentHTML('beforeend', newFlowSvg);
        this._energyBusKey = energyBusKey;
        this._stableFlowKey = stableFlowKey;
        this._gridFlowKey = gridFlowKey;
        this._evFlowKey = evFlowKey;
      }
    } else {
      this._energyBusKey = '';
      this._stableFlowKey = '';
      this._gridFlowKey = '';
      this._evFlowKey = '';
    }

    // On first render the container width is a fallback guess (element not yet
    // laid out), which makes dotRx wrong → elliptical dots. Schedule a single
    // corrective re-render after the browser has painted and we can measure.
    if (show_energy_flow && !this._flowLayoutChecked) {
      this._flowLayoutChecked = true;
      requestAnimationFrame(() => {
        const realWidth = this.shadowRoot?.querySelector('.bars-container')?.offsetWidth;
        if (realWidth && Math.abs(realWidth - actualContainerWidth) > 20) {
          this._stableFlowKey = ''; // force SVG rebuild with correct dimensions
          this._gridFlowKey = '';
          this._evFlowKey = '';
          this._energyBusKey = '';
          if (this._hass) this.hass = this._hass;
        }
      });
    }

    // Set up event delegation for clickable elements (only once)
    if (!this._clickListenerAdded) {
      this.shadowRoot.addEventListener('click', (e) => {
        const target = e.target.closest('[data-entity]');
        if (target) {
          const entityId = target.getAttribute('data-entity');
          const actionKey = target.getAttribute('data-action-key');
          if (entityId && entityId !== 'null' && entityId !== 'undefined') {
            this.showEntityHistory(entityId, actionKey);
          }
        }
      });
      this._clickListenerAdded = true;
    }
  }

  showEntityHistory(entityId, actionKey = null) {
    if (!entityId) return;

    // Get the tap action configuration for this element
    const { tap_actions = {} } = this.config;
    let tapAction = { action: "more-info" }; // Default

    // Check individual tap_action_* config (for UI compatibility)
    if (actionKey) {
      const tapActionConfigKey = `tap_action_${actionKey}`;
      if (this.config[tapActionConfigKey]) {
        tapAction = this.config[tapActionConfigKey];
      } else if (tap_actions[actionKey]) {
        // Fallback to object format (for backward compatibility)
        tapAction = tap_actions[actionKey];
      }
    }

    // Handle different action types
    if (tapAction.action === "none") {
      return; // Do nothing
    }

    const actionConfig = {
      entity: entityId,
      tap_action: tapAction
    };

    const event = new Event("hass-action", {
      bubbles: true,
      composed: true,
    });

    event.detail = {
      config: actionConfig,
      action: "tap"
    };

    this.dispatchEvent(event);
  }

  getSensorValue(entityId) {
    if (!entityId || !this._hass.states[entityId]) return 0;
    let value = parseFloat(this._hass.states[entityId].state);

    // Handle W to kW conversion
    const unit = this._hass.states[entityId].attributes.unit_of_measurement;
    if (unit === 'W') {
      value = value / 1000;
    }

    return isNaN(value) ? 0 : value;
  }

  getSolcastForecast() {
    const solcastPatterns = [
      'sensor.solcast_pv_forecast_power_now',
      'sensor.solcast_forecast_power_now',
      'sensor.solcast_power_now'
    ];

    for (const pattern of solcastPatterns) {
      if (this._hass.states[pattern]) {
        return this.getSensorValue(pattern);
      }
    }

    const solcastSensors = Object.keys(this._hass.states).filter(entityId => 
      entityId.includes('solcast') && entityId.includes('power') && entityId.includes('now')
    );

    if (solcastSensors.length > 0) {
      return this.getSensorValue(solcastSensors[0]);
    }

    return 0;
  }

  getSolcastPeakForecast() {
    const peakEntity = 'sensor.solcast_pv_forecast_peak_forecast_today';
    if (this._hass.states[peakEntity]) {
      return this.getSensorValue(peakEntity);
    }

    const solcastPeakSensors = Object.keys(this._hass.states).filter(entityId =>
      entityId.includes('solcast') && entityId.includes('peak') && entityId.includes('today')
    );

    if (solcastPeakSensors.length > 0) {
      return this.getSensorValue(solcastPeakSensors[0]);
    }

    return 0;
  }

  getCardSize() {
    if (!this.config) return 1;

    let size = 0.8;
    if (this.config.show_header || this.config.show_weather) size += 0.5;
    if (this.config.show_stats) {
      size += 1.2;
      // Extra row possible when multiple extras are configured
      const hasBatteryConfig = this.config.battery_soc_entity && (this.config.battery_power_entity || (this.config.battery_charge_entity && this.config.battery_discharge_entity));
      const extraCount = (hasBatteryConfig ? 1 : 0) + (this.config.ev_charger_sensor ? 1 : 0) + (this.config.consumer_1_entity ? 1 : 0) + (this.config.consumer_2_entity ? 1 : 0);
      if (extraCount >= 2) size += 1.0;
    }
    if (this.config.battery_power_entity && this.config.battery_soc_entity) size += 1.5;
    if (this.config.show_bar_label) size += 0.3;
    if (this.config.show_legend) size += 0.4;

    return Math.max(1, size);
  }

  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
    };
  }

  static getConfigElement() {
    return document.createElement("solar-bar-card-editor");
  }

  static getStubConfig() {
    return {
      inverter_size: 10,
      show_header: false,
      show_stats: false,
      show_legend: true,
      header_title: 'Solar Power',
      use_solcast: false,
      color_palette: 'classic-solar',
      custom_colors: {},
      show_battery_flow: true,
      show_battery_indicator: true,
      battery_flow_animation_speed: 2,
      decimal_places: 1,
      battery_soc_decimal_places: 1,
      stats_border_radius: 8
    };
  }
}

// Solar Bar Card Editor
class SolarBarCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.render();
    } else if (this._form) {
      // Just update the form data without re-rendering
      this._form.data = config;
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) {
      this._form.hass = hass;
    }
  }

  _valueChanged(ev) {
    if (!this._config || !this._hass) {
      return;
    }
    const event = new CustomEvent('config-changed', {
      detail: { config: ev.detail.value },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  _computeLabel(schema) {
    const labels = {
      inverter_size: "Inverter Size",
      production_entity: "Solar Production Sensor",
      self_consumption_entity: "Self Consumption Sensor",
      export_entity: "Export to Grid Sensor",
      import_entity: "Import from Grid Sensor",
      grid_power_entity: "Combined Grid Power Sensor",
      invert_grid_power: "Invert Grid Power Values",
      battery_power_entity: "Battery Power Sensor (Single)",
      battery_charge_entity: "Battery Charge Sensor (Dual)",
      battery_discharge_entity: "Battery Discharge Sensor (Dual)",
      invert_battery_power: "Invert Battery Power Values",
      battery_soc_entity: "Battery State of Charge Sensor",
      battery_capacity: "Battery Capacity",
      show_battery_indicator: "Show Battery Bar",
      show_battery_flow: "Show Animated Flow Lines",
      battery_flow_animation_speed: "Battery Flow Animation Speed",
      ev_charger_sensor: "EV Charger Power Sensor",
      car_charger_load: "EV Charger Capacity",
      use_solcast: "Auto-detect Solcast",
      forecast_entity: "Forecast Solar Sensor",
      peak_forecast_entity: "Forecast Peak Solar Sensor",
      color_palette: "Color Palette",
      show_header: "Show Header",
      header_title: "Header Title",
      show_weather: "Show Weather/Temperature",
      weather_entity: "Weather or Temperature Sensor",
      header_sensor_1: "Header Sensor 1",
      header_sensor_2: "Header Sensor 2",
      import_history_entity: "Daily Import Energy Sensor",
      export_history_entity: "Daily Export Energy Sensor",
      production_history_entity: "Daily Solar Production Sensor",
      consumption_history_entity: "Daily Home Consumption Sensor",
      show_net_indicator: "Show Net Import/Export Indicator",
      show_house_icon: "Show House Icon",
      show_energy_flow: "Show Energy Flow Lines",
      energy_flow_speed: "Energy Flow Speed",
      energy_flow_threshold: "Energy Flow Threshold",
      energy_flow_origin: "Flow Drop Origin",
      show_grid_icon_always: "Always Show Grid Icon",
      grid_icon_import_color: "Grid Icon Import Color",
      grid_icon_export_color: "Grid Icon Export Color",
      grid_icon_idle_color: "Grid Icon Idle Color",
      grid_icon_color: "Grid Icon Tower Color",
      ev_icon_idle_color: "EV Icon Idle Color",
      ev_icon_charging_color: "EV Icon Charging Color",
      show_stats: "Show Individual Stats",
      show_legend: "Show Legend",
      show_legend_values: "Show Legend Values",
      show_bar_label: "Show Bar Label",
      show_bar_values: "Show Bar Values",
      decimal_places: "Decimal Places",
      battery_soc_decimal_places: "Battery SOC Decimals",
      stats_border_radius: "Stats Tile Border Radius",
      show_stats_detail: "Show Stats Detail Row",
      stats_detail_position: "Stats Detail Position",
      show_ev_when_idle: "Show EV When Idle",
      ev_history_entity: "EV Daily Energy Sensor",
      consumer_1_entity: "Consumer 1 Power Sensor",
      consumer_1_name: "Consumer 1 Name",
      consumer_1_history_entity: "Consumer 1 Daily Energy Sensor",
      consumer_2_entity: "Consumer 2 Power Sensor",
      consumer_2_name: "Consumer 2 Name",
      consumer_2_history_entity: "Consumer 2 Daily Energy Sensor",
      show_consumers_when_idle: "Show Consumers When Idle",
      // Individual label fields
      label_solar: "Solar Label",
      label_import: "Import Label",
      label_export: "Export Label",
      label_usage: "Usage Label",
      label_battery: "Battery Label",
      label_ev: "EV Label",
      label_power_flow: "Power Flow Label",
      // Individual tap action fields
      tap_action_solar: "Solar Tap Action",
      tap_action_import: "Import Tap Action",
      tap_action_export: "Export Tap Action",
      tap_action_usage: "Usage Tap Action",
      tap_action_battery: "Battery Tap Action",
      tap_action_ev: "EV Tap Action",
      tap_action_consumer_1: "Consumer 1 Tap Action",
      tap_action_consumer_2: "Consumer 2 Tap Action"
    };
    return labels[schema.name] || schema.name;
  }

  _computeHelper(schema) {
    const helpers = {
      inverter_size: "Your solar system's maximum capacity in kW",
      production_entity: "Sensor showing current solar production power",
      self_consumption_entity: "Sensor showing power used by your home (includes EV charging if active)",
      export_entity: "Sensor showing power exported to the grid",
      import_entity: "Sensor showing power imported from the grid",
      grid_power_entity: "Combined grid sensor (positive=export, negative=import) - overrides separate import/export sensors",
      invert_grid_power: "Enable if your grid sensor reports from meter perspective (positive=import, negative=export)",
      battery_soc_entity: "Battery state of charge sensor (0-100%)",
      battery_power_entity: "Single battery power sensor (positive=charging, negative=discharging) - use this OR dual sensors below",
      invert_battery_power: "Enable if your battery sensor reports opposite sign (positive=discharging, negative=charging)",
      battery_charge_entity: "Battery charging power sensor (dual sensor mode) - leave empty if using single sensor above",
      battery_discharge_entity: "Battery discharging power sensor (dual sensor mode) - leave empty if using single sensor above",
      battery_capacity: "Battery total capacity in kWh - determines proportional bar width",
      show_battery_indicator: "Show battery bar adjacent to power bar (proportional width based on capacity)",
      show_battery_flow: "Show animated flow lines indicating battery charge/discharge direction",
      battery_flow_animation_speed: "Speed of battery flow animation in seconds (lower is faster)",
      ev_charger_sensor: "Actual EV charger power sensor - automatically splits usage into solar vs grid",
      car_charger_load: "EV charger capacity in kW to show potential usage (grey dashed bar when not charging)",
      use_solcast: "Automatically detect Solcast forecast sensors",
      forecast_entity: "Sensor showing solar forecast data (ignored if Solcast auto-detect is enabled)",
      peak_forecast_entity: "Sensor showing today's forecast peak solar power — shown as a solid line. Auto-detects sensor.solcast_pv_forecast_peak_forecast_today when Solcast is enabled",
      color_palette: "Choose a preset color scheme",
      show_header: "Display a title at the top of the card",
      header_title: "Custom title for the card header",
      show_weather: "Display current temperature in the top-right corner",
      weather_entity: "Weather entity or temperature sensor (auto-detects which type)",
      header_sensor_1: "Add sensor to header. Format: {entity: 'sensor.x', name: 'Label', icon: '⚡', unit: 'kWh'}",
      header_sensor_2: "Second header sensor. Format: {entity: 'sensor.x', name: 'Label', icon: '💰', unit: '¢'}",
      import_history_entity: "Daily grid import energy sensor (kWh) for net import/export calculation",
      export_history_entity: "Daily grid export energy sensor (kWh) for net import/export calculation",
      production_history_entity: "Daily solar power production sensor (kWh) - shows total energy produced today",
      consumption_history_entity: "Daily home consumption sensor (kWh) - shows total energy used today",
      show_net_indicator: "Show colored indicator on import/export tile (green=net exporter, red=net importer)",
      show_house_icon: "Show a house icon to the left of the bar representing home consumption.",
      show_energy_flow: "Show animated flow lines below the bar visualising energy paths between solar, house, grid, and battery.",
      energy_flow_speed: "Speed of energy flow animation in seconds (lower is faster).",
      energy_flow_threshold: "Power threshold in kW below which import/export flow is ignored. Prevents flickering when the system is near idle. Default: 0.1 kW.",
      energy_flow_origin: "Where the solar drop line originates: 'bar_center' (middle of the full bar) or 'production_center' (middle of the filled solar output). Default: bar_center.",
      show_grid_icon_always: "Always show grid icon next to the solar bar, even when there is no import or export. Icon turns grey when idle.",
      grid_icon_import_color: "Custom background color for the grid icon circle when importing.",
      grid_icon_export_color: "Custom background color for the grid icon circle when exporting.",
      grid_icon_idle_color: "Custom background color for the grid icon circle when idle (no import/export).",
      grid_icon_color: "Color of the transmission tower icon inside the circle (default: black).",
      ev_icon_idle_color: "Custom color for the EV icon when idle (not charging, no excess solar).",
      ev_icon_charging_color: "Custom color for the EV icon when actively charging.",
      show_stats: "Display individual power statistics above the bar (dynamic layout - adapts to configured entities)",
      show_legend: "Display color-coded legend below the bar",
      show_legend_values: "Show current kW values in the legend",
      show_bar_label: "Show 'Power Flow 0-XkW' label above the bar",
      show_bar_values: "Show kW values and labels on the bar segments",
      decimal_places: "Number of decimal places to display for all power values (kW)",
      battery_soc_decimal_places: "Number of decimal places for battery SOC percentage (0, 1, or 2)",
      stats_border_radius: "Border radius for stats tiles in pixels (default 8px, increase to match rounded card themes like Bubble Cards)",
      show_stats_detail: "Show the detail row on stats tiles (daily kWh, net position, battery %). Disable to save vertical space.",
      stats_detail_position: "Where to show the detail: 'below' as a 3rd row, or 'inline' next to the kW value separated by a slash.",
      show_ev_when_idle: "Always show EV tile even when not charging. When off, the EV tile only appears while actively charging.",
      ev_history_entity: "Daily EV energy sensor (kWh) - shows daily total on EV tile when stats detail is enabled.",
      consumer_1_entity: "Power sensor for an additional consumer (e.g., heat pump, pool heater). Shows as a stats tile only.",
      consumer_1_name: "Display name for Consumer 1 (e.g., 'Heat Pump', 'Pool')",
      consumer_1_history_entity: "Daily energy sensor (kWh) for Consumer 1 - shows daily total on tile when stats detail is enabled.",
      consumer_2_entity: "Power sensor for a second additional consumer. Shows as a stats tile only.",
      consumer_2_name: "Display name for Consumer 2 (e.g., 'Hot Water', 'AC')",
      consumer_2_history_entity: "Daily energy sensor (kWh) for Consumer 2 - shows daily total on tile when stats detail is enabled.",
      show_consumers_when_idle: "Always show consumer tiles even when power is 0. When off, tiles only appear while the consumer is actively drawing power.",
      // Individual label helpers
      label_solar: "Custom label for Solar (leave empty to use auto-detected language translation)",
      label_import: "Custom label for Import (leave empty to use auto-detected language translation)",
      label_export: "Custom label for Export (leave empty to use auto-detected language translation)",
      label_usage: "Custom label for Usage (leave empty to use auto-detected language translation)",
      label_battery: "Custom label for Battery (leave empty to use auto-detected language translation)",
      label_ev: "Custom label for EV (leave empty to use auto-detected language translation)",
      label_power_flow: "Custom label for Power Flow (leave empty to use auto-detected language translation)",
      // Individual tap action helpers
      tap_action_solar: "Action when tapping Solar elements (stats tile, bar, legend). Defaults to showing entity history.",
      tap_action_import: "Action when tapping Import elements (stats tile, grid icon when importing, legend). Defaults to showing entity history.",
      tap_action_export: "Action when tapping Export elements (stats tile, grid icon when exporting, legend). Defaults to showing entity history.",
      tap_action_usage: "Action when tapping Usage elements (stats tile, legend). Defaults to showing entity history.",
      tap_action_battery: "Action when tapping Battery elements (stats tile, battery bar, legend). Defaults to showing entity history.",
      tap_action_ev: "Action when tapping EV elements (stats tile, legend). Defaults to showing entity history.",
      tap_action_consumer_1: "Action when tapping Consumer 1 stats tile. Defaults to showing entity history.",
      tap_action_consumer_2: "Action when tapping Consumer 2 stats tile. Defaults to showing entity history."
    };
    return helpers[schema.name];
  }

  render() {
    if (!this._config || !this.shadowRoot) {
      return;
    }

    const schema = [
      {
        type: "expandable",
        title: "General",
        expanded: true,
        flatten: true,
        schema: [
          {
            name: "inverter_size",
            default: 10,
            selector: { number: { min: 1, max: 100, step: 0.1, mode: "box", unit_of_measurement: "kW" } }
          },
          {
            type: "grid",
            schema: [
              { name: "production_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "self_consumption_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } }
            ]
          },
          { name: "grid_power_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
          { name: "invert_grid_power", default: false, selector: { boolean: {} } },
          {
            type: "grid",
            schema: [
              { name: "export_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "import_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } }
            ]
          },
          {
        type: "grid",
        name: "",
        schema: [
          {
            name: "production_history_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "energy"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["kWh", "Wh", "MWh"]
                    }
                  }
                ]
              }
            }
          },
          {
            name: "consumption_history_entity",
            selector: {
              entity: {
                filter: [
                  {
                    domain: "sensor",
                    device_class: "energy"
                  },
                  {
                    domain: "sensor",
                    attributes: {
                      unit_of_measurement: ["kWh", "Wh", "MWh"]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
        ]
      },
      {
        type: "expandable",
        title: "Battery",
        expanded: false,
        flatten: true,
        schema: [
          { name: "battery_soc_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "battery" }, { domain: "sensor", attributes: { unit_of_measurement: "%" } }] } } },
          { name: "battery_power_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
          { name: "invert_battery_power", default: false, selector: { boolean: {} } },
          {
            type: "grid",
            schema: [
              { name: "battery_charge_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "battery_discharge_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } }
            ]
          },
          { name: "battery_capacity", default: 10, selector: { number: { min: 0, max: 100, step: 0.5, mode: "box", unit_of_measurement: "kWh" } } },
          {
            type: "grid",
            schema: [
              { name: "show_battery_indicator", default: true, selector: { boolean: {} } },
              { name: "show_battery_flow", default: true, selector: { boolean: {} } }
            ]
          },
          { name: "battery_flow_animation_speed", default: 2, selector: { number: { min: 0.5, max: 10, step: 0.5, mode: "box", unit_of_measurement: "s" } } }
        ]
      },
      {
        type: "expandable",
        title: "Display",
        expanded: false,
        flatten: true,
        schema: [
          {
            type: "grid",
            schema: [
              { name: "show_header", default: false, selector: { boolean: {} } },
              { name: "header_title", default: "Solar Power", selector: { text: {} } }
            ]
          },
          { name: "show_weather", default: false, selector: { boolean: {} } },
          {
            type: "grid",
            schema: [
              { name: "show_stats", default: false, selector: { boolean: {} } },
              { name: "show_stats_detail", default: true, selector: { boolean: {} } }
            ]
          },
          {
            name: "stats_detail_position",
            default: "below",
            selector: {
              select: {
                options: [
                  { value: "below", label: "Below (3rd row)" },
                  { value: "inline", label: "Inline (/ separator)" }
                ],
                mode: "dropdown"
              }
            }
          },
          {
            type: "grid",
            schema: [
              { name: "show_bar_label", default: true, selector: { boolean: {} } },
              { name: "show_bar_values", default: true, selector: { boolean: {} } }
            ]
          },
          {
            type: "grid",
            schema: [
              { name: "show_legend", default: true, selector: { boolean: {} } },
              { name: "show_legend_values", default: true, selector: { boolean: {} } }
            ]
          },
          { name: "show_net_indicator", default: true, selector: { boolean: {} } },
          {
            type: "grid",
            schema: [
              { name: "show_house_icon", default: false, selector: { boolean: {} } },
              { name: "show_energy_flow", default: false, selector: { boolean: {} } }
            ]
          },
          { name: "energy_flow_speed", default: 2, selector: { number: { min: 0.5, max: 10, step: 0.5, mode: "box", unit_of_measurement: "s" } } },
          { name: "energy_flow_threshold", default: 0.1, selector: { number: { min: 0, max: 1, step: 0.05, mode: "box", unit_of_measurement: "kW" } } },
          { name: "energy_flow_origin", default: "bar_center", selector: { select: { options: [ { value: "bar_center", label: "Bar Center" }, { value: "production_center", label: "Production Center" } ] } } },
          { name: "show_grid_icon_always", default: false, selector: { boolean: {} } },
          {
            type: "grid",
            schema: [
              { name: "grid_icon_import_color", selector: { color_rgb: {} } },
              { name: "grid_icon_export_color", selector: { color_rgb: {} } },
              { name: "grid_icon_idle_color", selector: { color_rgb: {} } },
              { name: "grid_icon_color", selector: { color_rgb: {} } },
              { name: "ev_icon_idle_color", selector: { color_rgb: {} } },
              { name: "ev_icon_charging_color", selector: { color_rgb: {} } },
              { name: "ev_icon_color", selector: { color_rgb: {} } }
            ]
          },
          {
            type: "grid",
            schema: [
              {
                name: "power_unit",
                label: "Power Display Unit",
                default: "kW",
                selector: {
                  select: {
                    options: [
                      { value: "kW", label: "kW (kilowatts)" },
                      { value: "W", label: "W (watts)" }
                    ],
                    mode: "dropdown"
                  }
                }
              },
              { name: "show_power_unit", label: "Show Unit Suffix", default: true, selector: { boolean: {} } }
            ]
          },
          {
            type: "grid",
            schema: [
              {
                name: "decimal_places",
                default: 1,
                selector: {
                  select: {
                    options: [
                      { value: 1, label: "1 decimal place" },
                      { value: 2, label: "2 decimal places" },
                      { value: 3, label: "3 decimal places" }
                    ],
                    mode: "dropdown"
                  }
                }
              },
              {
                name: "battery_soc_decimal_places",
                label: "Battery SOC Decimals",
                default: 1,
                selector: {
                  select: {
                    options: [
                      { value: 0, label: "0 decimal places" },
                      { value: 1, label: "1 decimal place" },
                      { value: 2, label: "2 decimal places" }
                    ],
                    mode: "dropdown"
                  }
                }
              }
            ]
          },
          {
            name: "color_palette",
            default: "classic-solar",
            selector: {
              select: {
                options: getPaletteOptions(),
                mode: "dropdown"
              }
            }
          },
          { name: "stats_border_radius", default: 8, selector: { number: { min: 0, max: 28, step: 1, mode: "box", unit_of_measurement: "px" } } }
        ]
      },
      {
        type: "expandable",
        title: "Tap Actions",
        expanded: false,
        flatten: true,
        schema: [
          { name: "tap_action_solar", selector: { "ui-action": {} } },
          { name: "tap_action_import", selector: { "ui-action": {} } },
          { name: "tap_action_export", selector: { "ui-action": {} } },
          { name: "tap_action_usage", selector: { "ui-action": {} } },
          { name: "tap_action_battery", selector: { "ui-action": {} } },
          { name: "tap_action_ev", selector: { "ui-action": {} } },
          { name: "tap_action_consumer_1", selector: { "ui-action": {} } },
          { name: "tap_action_consumer_2", selector: { "ui-action": {} } }
        ]
      },
      // NET PRODUCTION/CONSUMPTION HISTORY

      {
        type: "expandable",
        title: "Forecast, Weather & History",
        expanded: false,
        flatten: true,
        schema: [
          {
            type: "grid",
            schema: [
              { name: "use_solcast", default: false, selector: { boolean: {} } },
              { name: "forecast_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "peak_forecast_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } }
            ]
          },
          { name: "weather_entity", selector: { entity: { filter: [{ domain: "weather" }, { domain: "sensor", device_class: "temperature" }] } } },
          {
            type: "grid",
            schema: [
              { name: "import_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }] } } },
              { name: "export_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }] } } }
            ]
          },
          {
            type: "grid",
            schema: [
              { name: "production_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }] } } },
              { name: "consumption_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }] } } }
            ]
          },
          { name: "header_sensor_1", selector: { object: {} } },
          { name: "header_sensor_2", selector: { object: {} } }
        ]
      },
      {
        type: "expandable",
        title: "Consumers",
        expanded: false,
        flatten: true,
        schema: [
          {
            type: "grid",
            schema: [
              { name: "ev_charger_sensor", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "car_charger_load", label: "EV Charger Capacity", default: 0, selector: { number: { min: 0, max: 50, step: 0.5, mode: "box", unit_of_measurement: "kW" } } }
            ]
          },
          { name: "ev_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }, { domain: "sensor", attributes: { unit_of_measurement: ["kWh", "Wh", "MWh"] } }] } } },
          {
            type: "grid",
            schema: [
              { name: "consumer_1_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "consumer_1_name", selector: { text: {} } }
            ]
          },
          { name: "consumer_1_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }, { domain: "sensor", attributes: { unit_of_measurement: ["kWh", "Wh", "MWh"] } }] } } },
          {
            type: "grid",
            schema: [
              { name: "consumer_2_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } },
              { name: "consumer_2_name", selector: { text: {} } }
            ]
          },
          { name: "consumer_2_history_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "energy" }, { domain: "sensor", attributes: { unit_of_measurement: ["kWh", "Wh", "MWh"] } }] } } },
          {
            type: "grid",
            schema: [
              { name: "show_ev_when_idle", default: false, selector: { boolean: {} } },
              { name: "show_consumers_when_idle", default: false, selector: { boolean: {} } }
            ]
          }
        ]
      }
    ];

    // Clear and recreate the form
    this.shadowRoot.innerHTML = '';

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config;
    form.schema = schema;
    form.computeLabel = this._computeLabel.bind(this);
    form.computeHelper = this._computeHelper.bind(this);

    form.addEventListener('value-changed', this._valueChanged.bind(this));

    this.shadowRoot.appendChild(form);
  }
}

// Register the custom elements
customElements.define('solar-bar-card', SolarBarCard);
customElements.define('solar-bar-card-editor', SolarBarCardEditor);

// Add to custom card registry
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'solar-bar-card',
  name: 'Solar Bar Card',
  description: 'A visual solar power distribution card with battery support, animated flow visualization, and customizable color palettes',
  preview: false,
  documentationURL: 'https://github.com/0xAHA/solar-bar-card'
});

console.info('%c🌞 Solar Bar Card v2.9.1 loaded!', 'color: #4CAF50; font-weight: bold;');
