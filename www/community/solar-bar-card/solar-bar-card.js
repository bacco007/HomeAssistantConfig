// solar-bar-card.js
// Enhanced Solar Bar Card with battery support and animated flow visualization
// Version 2.3.0 - Add custom background colors for stats tiles and card

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
      this.config.header_sensor_2?.entity
    ].filter(Boolean);

    const shouldUpdate = relevantEntities.some(
      entity => oldHass.states[entity]?.state !== hass.states[entity]?.state
    );

    if (shouldUpdate) {
      this.updateCard();
    }
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
      // Net import/export history
      import_history_entity: null,
      export_history_entity: null,
      // Usage History
      production_history_entity: null,
      consumption_history_entity: null,
      show_net_indicator: true,
      // Header sensors
      header_sensor_1: null,
      header_sensor_2: null,
      // Custom labels (object format for backward compatibility)
      custom_labels: {},
      // Tap actions (object format for backward compatibility)
      tap_actions: {},
      ...config
    };
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
        forecast_potential: 'Forecast solar potential',
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
        forecast_potential: 'Prognose Solarpotenzial',
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
        forecast_potential: 'Potentiel solaire prévu',
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
        forecast_potential: 'Potencial solar previsto',
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
        forecast_potential: 'Potenziale solare previsto',
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
        forecast_potential: 'Voorspeld zonnepotentieel',
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
        forecast_potential: 'Potencial solar previsto',
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
        forecast_potential: 'Prognozowany potencjał słoneczny',
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
        forecast_potential: 'Prognostiserad solpotential',
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
        forecast_potential: 'Forventet solpotentiale',
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
        forecast_potential: 'Forventet solpotensial',
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
        forecast_potential: 'Прогноз потенціалу сонячної енергії',
        total_usage: 'Загальне споживання',
        excess_solar_half: 'Надлишок сонячної енергії може покрити 50%+ навантаження електромобіля',
        excess_solar_full: 'Надлишок сонячної енергії може повністю покрити навантаження електромобіля'
      }
    };
  }

  getLabel(key) {
    const { custom_labels = {} } = this.config;

    // First check custom labels
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
      // Net import/export history
      import_history_entity = null,
      export_history_entity = null,
      // Usage History
      production_history_entity = null,
      consumption_history_entity = null,
      show_net_indicator = true,
      // Header sensors
      header_sensor_1 = null,
      header_sensor_2 = null
    } = this.config;

    // Get colors from palette
    const colors = getCardColors(this.config);

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

    const currentOutput = solarProduction;
    const anticipatedPotential = Math.min(forecastSolar, inverter_size);

    // Check if system is idle (no solar production and no consumption)
    const isIdle = solarProduction === 0 && selfConsumption === 0 && exportPower === 0 && gridImportPower === 0 && batteryIdle;

    // Calculate EV usage split
    const evUsage = isActuallyCharging ? actualEvCharging : 0;
    const nonEvConsumption = Math.max(0, selfConsumption - evUsage);

    // Calculate how much solar and grid power each type of consumption
    const solarToLoad = Math.min(solarProduction, selfConsumption);

    // Calculate battery contribution to load when discharging
    const batteryToLoad = batteryDischarging ? Math.abs(batteryPower) : 0;

    let solarToHome = 0;
    let solarToEv = 0;
    let batteryToHome = 0;
    let batteryToEv = 0;
    let gridToHome = 0;
    let gridToEv = 0;

    if (selfConsumption > 0) {
      const homeRatio = nonEvConsumption / selfConsumption;
      const evRatio = evUsage / selfConsumption;

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
    const excessSolar = solarProduction - selfConsumption;
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
    const batteryChargePercent = solarToBattery > 0 ? (solarToBattery / inverter_size) * 100 : 0;

    // Grid state for icon (not shown in bar anymore)
    //const hasGridImport = totalGridImport > 0.05;
    const hasGridImport = gridImportPower > 0.05;
    const hasGridExport = exportPower > 0.05;

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
    // Reserve space for grid icon (32px ~= 3% of typical container width)
    const gridIconSpace = (hasGridImport || hasGridExport) ? 3 : 0;
    // Power bar takes up remaining space
    const powerBarWidth = 100 - batteryBarWidth - gridIconSpace;

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

    // Battery flow line (between battery and solar bar)
    let batteryFlowColor = '#4CAF50';
    let batteryFlowPath = '';
    let showBatteryFlow = show_battery_flow && hasBattery && !batteryIdle && show_battery_indicator;

    if (showBatteryFlow) {
      // Use percentage-based positioning to properly align with the gap between bars
      const batteryEndPercent = batteryBarWidth;
      const gapPercent = 0.8; // ~8px gap represented as percentage (8px / ~1000px container)
      const solarStartPercent = batteryBarWidth + gapPercent;
      const barCenterY = 16;
      const batteryOverlap = 4.5; // Overlap into battery bar more
      const solarOverlap = 2.0; // Overlap into solar bar less

      if (batteryCharging) {
        batteryFlowColor = '#4CAF50'; // Green: solar → battery
        batteryFlowPath = `M ${solarStartPercent + solarOverlap} ${barCenterY} L ${batteryEndPercent - batteryOverlap} ${barCenterY}`;
      } else if (batteryDischarging) {
        batteryFlowColor = '#2196F3'; // Blue: battery → home
        batteryFlowPath = `M ${batteryEndPercent - batteryOverlap} ${barCenterY} L ${solarStartPercent + solarOverlap} ${barCenterY}`;
      }
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

        .power-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .stat {
          background: var(--secondary-background-color);
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
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
          font-size: 12px;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .stat-value {
          color: var(--primary-text-color);
          font-size: 16px;
          font-weight: 600;
        }

        .stat-history {
          color: var(--secondary-text-color);
          font-size: 11px;
          margin-top: 2px;
        }

        .net-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
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
          color: black;
        }

        .grid-icon.import {
          background: linear-gradient(135deg, var(--grid-usage-color), var(--grid-usage-color));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .grid-icon.export {
          background: linear-gradient(135deg, var(--solar-export-color), var(--solar-export-color));
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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

        .ev-ready-indicator {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          z-index: 3;
          filter: drop-shadow(0 0 3px rgba(0,0,0,0.3));
        }

        .ev-ready-indicator.half-charge {
          color: #FFB74D;
        }

        .ev-ready-indicator.full-charge {
          color: #81C784;
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

        ${show_stats ? `
          <div class="power-stats">
            <div class="stat" data-entity="${production_entity}" data-action-key="solar" title="${this.getLabel('click_history')}">
              <div class="stat-label">${this.getLabel('solar')}</div>
              <div class="stat-value">${solarProduction.toFixed(decimal_places)} kW</div>
              ${hasProdHistoryData && dailyProduction !== null ? `<div class="stat-history">${dailyProduction.toFixed(decimal_places)} kWh</div>` : ''}
            </div>
            ${exportPower > 0 ? `
              <div class="stat" data-entity="${grid_power_entity || export_entity}" data-action-key="export" title="${this.getLabel('click_history')}">
                <div class="stat-label">
                  ${this.getLabel('export')}
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator ${netPosition >= 0 ? 'net-export' : 'net-import'}"></span>` : ''}
                </div>
                <div class="stat-value">${exportPower.toFixed(decimal_places)} kW</div>
                ${hasHistoryData && netPosition !== null ? `<div class="stat-history">${netPosition >= 0 ? '+' : ''}${netPosition.toFixed(decimal_places)} kWh</div>` : hasHistoryData && dailyExport !== null ? `<div class="stat-history">+${dailyExport.toFixed(decimal_places)} kWh</div>` : ''}
              </div>
            ` : totalGridImport > 0 ? `
              <div class="stat" data-entity="${grid_power_entity || import_entity}" data-action-key="import" title="${this.getLabel('click_history')}">
                <div class="stat-label">
                  ${this.getLabel('import')}
                  ${show_net_indicator && netPosition !== null ? `<span class="net-indicator ${netPosition >= 0 ? 'net-export' : 'net-import'}"></span>` : ''}
                </div>
                <div class="stat-value">${totalGridImport.toFixed(decimal_places)} kW</div>
                ${hasHistoryData && netPosition !== null ? `<div class="stat-history">${netPosition >= 0 ? '+' : ''}${netPosition.toFixed(decimal_places)} kWh</div>` : hasHistoryData && dailyImport !== null ? `<div class="stat-history">-${dailyImport.toFixed(decimal_places)} kWh</div>` : ''}
              </div>
            ` : ''}
            <div class="stat" data-entity="${self_consumption_entity}" data-action-key="usage" title="${this.getLabel('click_history')}">
              <div class="stat-label">${this.getLabel('usage')}</div>
              <div class="stat-value">${selfConsumption.toFixed(decimal_places)} kW</div>
              ${hasConsHistoryData && dailyConsumption !== null ? `<div class="stat-history">${dailyConsumption.toFixed(decimal_places)} kWh</div>` : ''}
            </div>
            ${hasBattery && Math.abs(batteryPower) >= Math.max(evUsage, 0.1) ? `
              <div class="stat battery-stat" data-entity="${battery_power_entity || battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                <div class="stat-label">${this.getLabel('battery')}</div>
                <div class="stat-value">${batteryCharging ? '↑' : batteryDischarging ? '↓' : ''}${Math.abs(batteryPower).toFixed(decimal_places)} kW</div>
                <div class="stat-history">${batterySOC.toFixed(decimal_places)}%</div>
              </div>
            ` : isActuallyCharging ? `
              <div class="stat" data-entity="${ev_charger_sensor}" data-action-key="ev" title="${this.getLabel('click_history')}">
                <div class="stat-label">${this.getLabel('ev')}</div>
                <div class="stat-value">${evUsage.toFixed(decimal_places)} kW</div>
              </div>
            ` : ''}
          </div>
        ` : ''}


        ${(production_entity || self_consumption_entity || export_entity) ? `
          <div class="solar-bar-container">
            ${show_bar_label ? `
              <div class="solar-bar-label">
                <span>${this.getLabel('power_flow')}</span>
                <span class="capacity-label">
                  ${hasBattery && show_battery_indicator ? `${this.getLabel('battery')} ${batterySOC.toFixed(decimal_places)}% | ` : ''}0 - ${inverter_size}kW
                </span>
              </div>
            ` : ''}
            <div class="bars-container">
              ${hasBattery && show_battery_indicator ? `
                <div class="battery-bar-wrapper ${isIdle ? 'standby' : ''}" style="width: ${batteryBarWidth}%" data-entity="${battery_soc_entity}" data-action-key="battery" title="${this.getLabel('click_history')}">
                  <div class="battery-bar-fill ${batteryCharging ? 'charging' : batteryDischarging ? 'discharging' : batterySOC < 20 ? 'low' : batterySOC < 50 ? 'medium' : ''}" style="width: ${batterySOC}%"></div>
                  ${shouldShowSegmentText((batterySOC / 100) * batteryBarWidth, `${batterySOC.toFixed(decimal_places)}%`, 100) ? `<div class="bar-overlay-label">${batterySOC.toFixed(decimal_places)}%</div>` : ''}
                </div>
              ` : ''}
              <div class="solar-bar-wrapper ${isIdle ? 'standby' : ''}" style="width: ${powerBarWidth}%" data-entity="${production_entity}" data-action-key="solar" title="${this.getLabel('click_history')}">
                <div class="solar-bar">
                  ${solarHomePercent > 0 ? `<div class="bar-segment solar-home-segment" style="width: ${solarHomePercent}%">${show_bar_values && solarToHome > 0.1 && shouldShowSegmentText(solarHomePercent, `${solarToHome.toFixed(decimal_places)}kW`, powerBarWidth) ? `${solarToHome.toFixed(decimal_places)}kW` : ''}</div>` : ''}
                  ${solarEvPercent > 0 ? `<div class="bar-segment solar-ev-segment" style="width: ${solarEvPercent}%">${show_bar_values && solarToEv > 0.1 && shouldShowSegmentText(solarEvPercent, `${solarToEv.toFixed(decimal_places)}kW ${this.getLabel('ev')}`, powerBarWidth) ? `${solarToEv.toFixed(decimal_places)}kW ${this.getLabel('ev')}` : ''}</div>` : ''}
                  ${batteryChargePercent > 0 ? `<div class="bar-segment battery-charge-segment" style="width: ${batteryChargePercent}%">${show_bar_values && solarToBattery > 0.1 && shouldShowSegmentText(batteryChargePercent, `${solarToBattery.toFixed(decimal_places)}kW ${this.getLabel('battery')}`, powerBarWidth) ? `${solarToBattery.toFixed(decimal_places)}kW ${this.getLabel('battery')}` : ''}</div>` : ''}
                  ${exportPercent > 0 ? `<div class="bar-segment export-segment" style="width: ${exportPercent}%">${show_bar_values && shouldShowSegmentText(exportPercent, `${exportPower.toFixed(decimal_places)}kW ${this.getLabel('export')}`, powerBarWidth) ? `${exportPower.toFixed(decimal_places)}kW ${this.getLabel('export')}` : ''}</div>` : ''}
                  ${evPotentialPercent > 0 ? `<div class="bar-segment car-charger-segment" style="width: ${evPotentialPercent}%">${show_bar_values && shouldShowSegmentText(evPotentialPercent, `${car_charger_load}kW ${this.getLabel('ev')}`, powerBarWidth) ? `${car_charger_load}kW ${this.getLabel('ev')}` : ''}</div>` : ''}
                  ${unusedPercent > 0 ? `<div class="bar-segment unused-segment" style="width: ${unusedPercent}%"></div>` : ''}
                </div>
                ${isIdle ? `<div class="standby-label">🌙 ${this.getLabel('standby_mode')}</div>` : ''}
                ${!isIdle && hasBattery && show_battery_indicator && !show_bar_values ? `<div class="bar-overlay-label">${this.getLabel('solar')}</div>` : ''}
                ${evReadyHalf ? `
                  <div class="ev-ready-indicator ${evReadyFull ? 'full-charge' : 'half-charge'}"
                       title="${evReadyFull ? this.getLabel('excess_solar_full') : this.getLabel('excess_solar_half')}">
                    <ha-icon icon="mdi:car-electric"></ha-icon>
                  </div>
                ` : ''}
                ${anticipatedPotential > solarProduction && (forecast_entity || use_solcast) ? `
                  <div class="forecast-indicator"
                       style="left: ${anticipatedPercent}%"
                       title="${this.getLabel('forecast_potential')}: ${anticipatedPotential.toFixed(decimal_places)}kW"></div>
                ` : ''}
                ${showUsageIndicator ? `
                  <div class="usage-indicator"
                       style="left: ${usagePercent}%"
                       title="${this.getLabel('total_usage')}: ${selfConsumption.toFixed(decimal_places)}kW"></div>
                ` : ''}
              </div>
              ${(hasGridImport || hasGridExport) ? `
                <div class="grid-icon ${hasGridImport ? 'import' : 'export'}"
                     data-entity="${grid_power_entity || (hasGridImport ? import_entity : export_entity)}"
                     data-action-key="${hasGridImport ? 'import' : 'export'}"
                     title="${hasGridImport ? `${this.getLabel('grid_import')}: ${gridImportPower.toFixed(decimal_places)}kW - ${this.getLabel('click_history')}` : `${this.getLabel('grid_export')}: ${exportPower.toFixed(decimal_places)}kW - ${this.getLabel('click_history')}`}">
                  <ha-icon icon="mdi:transmission-tower"></ha-icon>
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
                  <span>${this.getLabel('usage')}${show_legend_values ? ` ${selfConsumption.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${(solarToEv > 0 || gridToEv > 0) ? `
                <div class="legend-item" data-entity="${ev_charger_sensor}" data-action-key="ev" title="${this.getLabel('click_history')}">
                  <div class="legend-color ev-charging-color"></div>
                  <span>${this.getLabel('ev')}${show_legend_values ? ` ${(solarToEv + gridToEv).toFixed(decimal_places)}kW` : ''}</span>
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
              ${exportPower > 0 ? `
                <div class="legend-item" data-entity="${grid_power_entity || export_entity}" data-action-key="export" title="${this.getLabel('click_history')}">
                  <div class="legend-color export-color"></div>
                  <span>${this.getLabel('export')}${show_legend_values ? ` ${exportPower.toFixed(decimal_places)}kW` : ''}</span>
                </div>
              ` : ''}
              ${gridToHome > 0 ? `
                <div class="legend-item" data-entity="${grid_power_entity || import_entity}" data-action-key="import" title="${this.getLabel('click_history')}">
                  <div class="legend-color grid-home-color"></div>
                  <span>${this.getLabel('import')}${show_legend_values ? ` ${gridToHome.toFixed(decimal_places)}kW` : ''}</span>
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

  getCardSize() {
    if (!this.config) return 1;

    let size = 0.8;
    if (this.config.show_header || this.config.show_weather) size += 0.5;
    if (this.config.show_stats) size += 1.2;
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
      decimal_places: 1
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
      show_stats: "Show Individual Stats",
      show_legend: "Show Legend",
      show_legend_values: "Show Legend Values",
      show_bar_label: "Show Bar Label",
      show_bar_values: "Show Bar Values",
      decimal_places: "Decimal Places",
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
      tap_action_ev: "EV Tap Action"
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
      show_stats: "Display individual power statistics above the bar (max 4 tiles)",
      show_legend: "Display color-coded legend below the bar",
      show_legend_values: "Show current kW values in the legend",
      show_bar_label: "Show 'Power Flow 0-XkW' label above the bar",
      show_bar_values: "Show kW values and labels on the bar segments",
      decimal_places: "Number of decimal places to display for all power values (kW) and battery percentage",
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
      tap_action_ev: "Action when tapping EV elements (stats tile, legend). Defaults to showing entity history."
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
          { name: "battery_soc_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "battery" }] } } },
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
          { name: "show_stats", default: false, selector: { boolean: {} } },
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
            name: "color_palette",
            default: "classic-solar",
            selector: {
              select: {
                options: getPaletteOptions(),
                mode: "dropdown"
              }
            }
          }
        ]
      },
      {
        type: "expandable",
        title: "Custom Labels",
        expanded: false,
        flatten: true,
        schema: [
          {
            type: "grid",
            schema: [
              { name: "label_solar", selector: { text: {} } },
              { name: "label_import", selector: { text: {} } }
            ]
          },
          {
            type: "grid",
            schema: [
              { name: "label_export", selector: { text: {} } },
              { name: "label_usage", selector: { text: {} } }
            ]
          },
          {
            type: "grid",
            schema: [
              { name: "label_battery", selector: { text: {} } },
              { name: "label_ev", selector: { text: {} } }
            ]
          },
          { name: "label_power_flow", selector: { text: {} } }
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
          { name: "tap_action_ev", selector: { "ui-action": {} } }
        ]
      },
      // NET PRODUCTION/CONSUMPTION HISTORY

      {
        type: "expandable",
        title: "Other",
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
          {
            type: "grid",
            schema: [
              { name: "use_solcast", default: false, selector: { boolean: {} } },
              { name: "forecast_entity", selector: { entity: { filter: [{ domain: "sensor", device_class: "power" }] } } }
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

console.info('%c🌞 Solar Bar Card v2.2.1 loaded! --- Standby mode embedded in bar', 'color: #4CAF50; font-weight: bold;');
