const CARD_VERSION = '3.0.0'

class VehicleOccupancyCard extends HTMLElement {
  constructor() {
    super();
    this.backendVersion = null;
    this.versionCheckDone = false;

    // Store the latest Home Assistant object so the timed rotation can
    // re-render the card without waiting for a Home Assistant state update.
    this._hass = null;

    // Used to rotate through the optional right-hand-side entities.
    this.entity2Index = 0;
    this.entity2Timer = null;
    this.entity2Key = "";
  }

  static getStubConfig() {
    return {
      entity: "",
      entity2: [],
      rotation_interval: 10,
      title: "",
      attribute: "occupancy_detail",
      max_carriage_width: 80,
    };
  }

  static getConfigForm() {
    return {
      schema: [
        {
          name: "entity",
          required: true,
          selector: {
            entity: {
              multiple: false,
              filter: [
                {
                  domain: "sensor",
                  integration: "ha_transportnsw",
                },
              ],
            },
          },
        },
        {
          name: "entity2",
          required: false,
          selector: {
            entity: {
              multiple: true,
            },
          },
        },
        {
          name: "rotation_interval",
          required: false,
          selector: {
            number: {
              min: 1,
              max: 100,
              unit_of_measurement: "s",
            },
          },
        },
        {
          name: "title",
          required: false,
          selector: {
            text: {},
          },
        },
        {
          name: "attribute",
          required: false,
          selector: {
            attribute: {},
          },
          context: {
            filter_entity: "entity",
          },
        },
        {
          name: "max_carriage_width",
          required: false,
          selector: {
            number: {
              min: 32,
              max: 80,
              unit_of_measurement: "px",
            },
          },
        },
      ],

      computeHelper: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Select a Transport NSW Mk II sensor that contains detailed occupancy information";
          case "entity2":
            return "Optional entities whose states will rotate on the right-hand side of the card";
          case "rotation_interval":
            return "How often the optional entities will rotate, in seconds - defaults to 10 seconds";
          case "title":
            return "Set a title for the card - defaults to the entity's device name if blank";
          case "attribute":
            return "The sensor attribute that holds the detailed carriage occupancy data - defaults to 'occupancy_detail' if blank";
          case "max_carriage_width":
            return "Optionally set the maximum possible render size of each carriage, depending on section size";
        }

        return undefined;
      },

      computeLabel: (schema) => {
        switch (schema.name) {
          case "entity":
            return "Detailed occupancy sensor";
          case "entity2":
            return "Right-side status entities";
          case "rotation_interval":
            return "Entity rotation interval (s)";
          case "title":
            return "Title";
          case "attribute":
            return "Detailed occupancy attribute";
          case "max_carriage_width":
            return "Max carriage width";
        }

        return undefined;
      },


    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(
        "You must specify a Transport NSW Mk II sensor that contains occupancy detail information"
      );
    }

    // Backwards compatibility: older card configs may have entity2 as a
    // single string. New configs use an array because the selector is
    // multi-selectable.
    const entity2List = Array.isArray(config.entity2)
      ? config.entity2.filter(Boolean)
      : config.entity2
        ? [config.entity2]
        : [];

    this.config = {
      title: "",
      entity2: [],
      rotation_interval: 10,
      attribute: "occupancy_detail",
      max_carriage_width: 80,
      demo: false,
      ...config,
      entity2: entity2List,
    };

    // Reset the rotation when the configuration changes.
    this.entity2Index = 0;
    this.entity2Key = entity2List.join("|");
  }

  connectedCallback() {
    if (this.entity2Timer) return;

    this.entity2Timer = window.setInterval(() => {
      const entity2List = this.getEntity2List();

      if (entity2List.length > 1) {
        this.entity2Index = (this.entity2Index + 1) % entity2List.length;

        if (this._hass) {
          this.render(this._hass);
        }
      }
    }, (this.config.rotation_interval) * 1000);
  }

  disconnectedCallback() {
    if (this.entity2Timer) {
      window.clearInterval(this.entity2Timer);
      this.entity2Timer = null;
    }
  }

  getEntity2List() {
    if (Array.isArray(this.config?.entity2)) {
      return this.config.entity2.filter(Boolean);
    }

    if (this.config?.entity2) {
      return [this.config.entity2];
    }

    return [];
  }

  async checkVersion(hass) {
      if (this.versionCheckDone) return;
      
      try {
          const result = await hass.connection.sendMessagePromise({
              type: 'ha_transportnsw/version',
          });
          
          this.backendVersion = result.version
          this.versionCheckDone = true;

          if (this.backendVersion !== CARD_VERSION) {
              this.showVersionMismatch();
          }
      } catch (err) {
          console.error('Failed to check version:', err)
      }
  }

  showVersionMismatch() {
    // Show toast notification with reload action
    // Using hass-notification event instead of persistent_notification
    // because toast only appears in current session and gets immediate attention
    const message = `Transport NSW Mk II version mismatch detected! Backend: ${this.backendVersion},  frontend: ${CARD_VERSION}`;
    
    this.dispatchEvent(
      new CustomEvent('hass-notification', {
        detail: {
          message: message,
          duration: -1,  // Persistent until dismissed
          dismissable: true,
          action: {
            text: 'Reload',
            action: this.handleReload,
          },
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Arrow function to preserve 'this' context when used as action handler
  handleReload = () => {
    // Clear application cache before reload
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      }).then(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }


  set hass(hass) {
    this._hass = hass;
    this.checkVersion(hass);
    this.render(hass);
  }

  render(hass) {
    const stateObj1 = hass.states[this.config.entity];

    const entity2List = this.getEntity2List();
    const entity2Key = entity2List.join("|");

    if (entity2Key !== this.entity2Key) {
      this.entity2Key = entity2Key;
      this.entity2Index = 0;
    }

    const selectedEntity2 = entity2List.length > 0
      ? entity2List[this.entity2Index % entity2List.length]
      : undefined;

    const stateObj2 = selectedEntity2
      ? hass.states[selectedEntity2]
      : undefined;

    if (!stateObj1) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            Sensor not found: ${this.config.entity}
          </div>
        </ha-card>
      `;
      return;
    }

    if (
      !stateObj1.attributes ||
      !(this.config.attribute in stateObj1.attributes)
    ) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            Attribute not found: ${this.config.attribute}
          </div>
        </ha-card>
      `;
      return;
    }

    const carriages = stateObj1.attributes[this.config.attribute];

    if (!Array.isArray(carriages) || carriages.length === 0) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content">
            No carriage occupancy data found in attribute: ${this.config.attribute}
          </div>
        </ha-card>
      `;
      return;
    }

    // Try to get the device name so we can use it in the title.
    const entityRegistryEntry = hass.entities?.[this.config.entity];
    const deviceId = entityRegistryEntry?.device_id;
    const device = deviceId ? hass.devices?.[deviceId] : undefined;

    const autoTitle =
      this.config.title ||
      device?.name_by_user ||
      device?.name ||
      stateObj1.attributes?.friendly_name ||
      "Vehicle occupancy";

    // The right hand field will either be empty, a timestamp that should follow
    // HA's timestamp update rules, or plain text.
    let rightSensor = "";
    let rightSensorIsTimestamp = false;
    
    if (stateObj2) {
        const isTimestamp = stateObj2?.attributes?.device_class === "timestamp";
    
        if (isTimestamp && stateObj2.state !== "unknown" && stateObj2.state !== "unavailable") {
            rightSensor = `<span id="right-sensor-relative-time"></span>`;
            rightSensorIsTimestamp = true;
        } else {
            rightSensor = `${stateObj2.state}${
                stateObj2.attributes?.unit_of_measurement
                ? " " + stateObj2.attributes.unit_of_measurement
                : ""
            }`;
        }
    }


    this.innerHTML = `
      <ha-card>
        <div class="card-content occupancy-card">
          <div class="top-region">
            <div class="top-left">${autoTitle}</div>
            <div class="top-right">${rightSensor}</div>
          </div>

          <div class="train-region">
            <div class="train">
              ${carriages
                .slice()
                .reverse()
                .map((carriage, index, array) =>
                  this.renderCarriage(
                    carriage,
                    index === array.length - 1,
                    array.length
                  )
                )
                .join("")}
            </div>
          </div>
        </div>
      </ha-card>


      <style>
        .occupancy-card {
          display: grid;
          grid-template-rows: minmax(28px, 20%) 1fr;
          box-sizing: border-box;
        }

        .top-region {
          display: grid;
          grid-template-columns: minmax(0, 7fr) minmax(0, 3fr);
          align-items: start;
          gap: 12px;
        }

        .top-left {
          font-weight: 600;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .top-right {
          text-align: right;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.9em;
        }

        .train-region {
          min-height: 0;
          display: flex;
          align-items: center;
        }

        .train {
          display: flex;
          gap: 2px;
          width: 100%;
          align-items: center;
        }

        .carriage {
          flex: 1 1 0;
          min-width: 32px;
          max-width: ${this.config.max_carriage_width || 80}px;
        }

        .carriage svg {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
        }
      </style>
    `;

    if (rightSensorIsTimestamp) {
        const target = this.querySelector("#right-sensor-relative-time");

        if (target) {
            const relativeTime = document.createElement("ha-relative-time");
            relativeTime.hass = hass;
            relativeTime.datetime = new Date(stateObj2.state);
            target.appendChild(relativeTime);
        }
    }

  }


  renderCarriage(carriage, isFrontCarriage, arrayLength) {
    if (arrayLength === 1) {
      isFrontCarriage = false;
    }

    let occupancy = carriage.occupancy || 0;

    if (this.config.demo) {
      occupancy = Math.floor(Math.random() * 3) + 1;
    }

    const svg = isFrontCarriage
      ? this.getFrontCarriageSvg(occupancy)
      : this.getStandardCarriageSvg(occupancy);

    return `
      <div class="carriage">
        ${svg}
      </div>
    `;
  }

  getStandardCarriageSvg(occupancy) {
    const map = {
      1: this.manySvg(),
      2: this.fewSvg(),
      3: this.standingSvg(),
    };

    return map[occupancy] ?? this.unknownSvg();
  }

  getFrontCarriageSvg(occupancy) {
    const map = {
      1: this.manyFrontSvg(),
      2: this.fewFrontSvg(),
      3: this.standingFrontSvg(),
    };

    return map[occupancy] ?? this.unknownFrontSvg();
  }

  manySvg() {
    return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: block;" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <rect width="1992" height="1306" x="24" y="37" rx="110" fill="rgb(1,150,75)"/>
        <path transform="translate(0,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="1022.5" cy="342" r="96" fill="white"/>
      </svg>
    `;
  }

  manyFrontSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="display:block" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <path fill="rgb(1,150,75)" d="M164 37h946q80 0 130 68l690 1125q86 113-60 113H164q-140 0-140-140V177Q24 37 164 37"/>
        <path transform="translate(-350,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="670.5" cy="342" r="96" fill="white"/>
      </svg>
    `;
  }

  fewSvg() {
    return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: block;" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <rect width="1992" height="1306" x="24" y="37" rx="110" fill="rgb(242,142,2)"/>
        <path transform="translate(210,0)" fill="rgb(254,254,254)" d="M 455.959 487.206 C 472.121 486.304 492.77 486.8 509.152 486.799 L 601.382 486.807 C 622.593 486.812 748.286 484.698 759.535 488.465 C 762.039 499.409 761.144 555.694 761.148 570.557 L 760.948 750.543 C 750.381 767.566 716.962 811.333 709.707 827.49 C 704.258 839.626 704.219 890.154 702.635 907.492 C 698.609 951.555 697.226 996.959 693.238 1041.45 C 692.29 1059.01 691.767 1084.93 688.436 1102.16 C 688.253 1103.1 687.22 1104.83 686.171 1105.43 C 684.366 1106.48 678.867 1107.47 676.903 1107.32 C 655.428 1105.67 539.457 1109.53 527.711 1105.45 C 523.437 1098.23 508.929 860.275 507.448 828.4 C 489.002 802.519 471.478 775.79 452.969 749.854 L 452.964 576.517 L 452.969 523.621 C 452.971 515.694 451.544 492.6 455.959 487.206 z"/>
        <path transform="translate(210,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="815.5" cy="342" r="96" fill="white"/>
        <circle cx="1228.5" cy="342" r="96" fill="white"/>
      </svg>
    `;
  }

  fewFrontSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="display:block" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <path fill="#f28e02" d="M164 37h946q80 0 130 68l690 1125q86 113-60 113H164q-140 0-140-140V177Q24 37 164 37"/>
        <path transform="translate(-140,0)" fill="rgb(254,254,254)" d="M 455.959 487.206 C 472.121 486.304 492.77 486.8 509.152 486.799 L 601.382 486.807 C 622.593 486.812 748.286 484.698 759.535 488.465 C 762.039 499.409 761.144 555.694 761.148 570.557 L 760.948 750.543 C 750.381 767.566 716.962 811.333 709.707 827.49 C 704.258 839.626 704.219 890.154 702.635 907.492 C 698.609 951.555 697.226 996.959 693.238 1041.45 C 692.29 1059.01 691.767 1084.93 688.436 1102.16 C 688.253 1103.1 687.22 1104.83 686.171 1105.43 C 684.366 1106.48 678.867 1107.47 676.903 1107.32 C 655.428 1105.67 539.457 1109.53 527.711 1105.45 C 523.437 1098.23 508.929 860.275 507.448 828.4 C 489.002 802.519 471.478 775.79 452.969 749.854 L 452.964 576.517 L 452.969 523.621 C 452.971 515.694 451.544 492.6 455.959 487.206 z"/>
        <path transform="translate(-140,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="465.5" cy="342" r="96" fill="#fff"/>
        <circle cx="878.5" cy="342" r="96" fill="#fff"/>
      </svg>
    `;
  }

  standingSvg() {
    return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: block;" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <rect width="1992" height="1306" x="24" y="37" rx="110" fill="rgb(229,27,35)"/>
        <path transform="translate(0,0)" fill="rgb(254,254,254)" d="M 1282.85 487.132 C 1328.32 485.032 1376.42 486.797 1422.15 486.801 C 1445.05 486.803 1573.88 484.381 1586.76 488.964 C 1589.21 497.747 1588.27 555.31 1588.28 568.533 L 1588.16 749.529 C 1577.01 767.979 1563.92 785.639 1551.71 803.424 C 1546.49 811.021 1539.83 819.059 1536.14 827.512 C 1531.48 838.167 1521.62 1014.66 1519.78 1041.67 C 1518.09 1058.28 1517.68 1074.93 1516.59 1091.59 C 1516.36 1095.23 1516.42 1102.5 1513.4 1104.95 C 1511.94 1106.14 1510.41 1106.49 1508.57 1106.65 C 1481.68 1108.95 1445.98 1107.17 1418.31 1107.17 C 1402.02 1107.17 1371.36 1109.07 1356.47 1106.45 C 1354.66 1106.14 1353.25 1106.11 1352.33 1104.44 C 1347.98 1096.54 1338.38 910.85 1337.06 888.174 C 1336.21 873.494 1336.28 840.646 1331.91 828.186 C 1328.01 817.07 1317.38 804.948 1310.64 795.196 L 1279.93 750.326 L 1279.88 578.637 L 1279.89 522.993 C 1279.89 515.092 1278.41 492.041 1282.85 487.132 z"/>
        <path transform="translate(0,0)" fill="rgb(254,254,254)" d="M 455.959 487.206 C 472.121 486.304 492.77 486.8 509.152 486.799 L 601.382 486.807 C 622.593 486.812 748.286 484.698 759.535 488.465 C 762.039 499.409 761.144 555.694 761.148 570.557 L 760.948 750.543 C 750.381 767.566 716.962 811.333 709.707 827.49 C 704.258 839.626 704.219 890.154 702.635 907.492 C 698.609 951.555 697.226 996.959 693.238 1041.45 C 692.29 1059.01 691.767 1084.93 688.436 1102.16 C 688.253 1103.1 687.22 1104.83 686.171 1105.43 C 684.366 1106.48 678.867 1107.47 676.903 1107.32 C 655.428 1105.67 539.457 1109.53 527.711 1105.45 C 523.437 1098.23 508.929 860.275 507.448 828.4 C 489.002 802.519 471.478 775.79 452.969 749.854 L 452.964 576.517 L 452.969 523.621 C 452.971 515.694 451.544 492.6 455.959 487.206 z"/>
        <path transform="translate(0,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="607.5" cy="342" r="96" fill="white"/>
        <circle cx="1022.5" cy="342" r="96" fill="white"/>
        <circle cx="1434.5" cy="342" r="96" fill="white"/>
      </svg>
    `;
  }

  standingFrontSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="display:block" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <path fill="rgb(229,27,35)" d="M164 37h946q80 0 130 68l690 1125q86 113-60 113H164q-140 0-140-140V177Q24 37 164 37"/>
        <path transform="translate(-300,0)" fill="rgb(254,254,254)" d="M 1282.85 487.132 C 1328.32 485.032 1376.42 486.797 1422.15 486.801 C 1445.05 486.803 1573.88 484.381 1586.76 488.964 C 1589.21 497.747 1588.27 555.31 1588.28 568.533 L 1588.16 749.529 C 1577.01 767.979 1563.92 785.639 1551.71 803.424 C 1546.49 811.021 1539.83 819.059 1536.14 827.512 C 1531.48 838.167 1521.62 1014.66 1519.78 1041.67 C 1518.09 1058.28 1517.68 1074.93 1516.59 1091.59 C 1516.36 1095.23 1516.42 1102.5 1513.4 1104.95 C 1511.94 1106.14 1510.41 1106.49 1508.57 1106.65 C 1481.68 1108.95 1445.98 1107.17 1418.31 1107.17 C 1402.02 1107.17 1371.36 1109.07 1356.47 1106.45 C 1354.66 1106.14 1353.25 1106.11 1352.33 1104.44 C 1347.98 1096.54 1338.38 910.85 1337.06 888.174 C 1336.21 873.494 1336.28 840.646 1331.91 828.186 C 1328.01 817.07 1317.38 804.948 1310.64 795.196 L 1279.93 750.326 L 1279.88 578.637 L 1279.89 522.993 C 1279.89 515.092 1278.41 492.041 1282.85 487.132 z"/>
        <path transform="translate(-300,0)" fill="rgb(254,254,254)" d="M 455.959 487.206 C 472.121 486.304 492.77 486.8 509.152 486.799 L 601.382 486.807 C 622.593 486.812 748.286 484.698 759.535 488.465 C 762.039 499.409 761.144 555.694 761.148 570.557 L 760.948 750.543 C 750.381 767.566 716.962 811.333 709.707 827.49 C 704.258 839.626 704.219 890.154 702.635 907.492 C 698.609 951.555 697.226 996.959 693.238 1041.45 C 692.29 1059.01 691.767 1084.93 688.436 1102.16 C 688.253 1103.1 687.22 1104.83 686.171 1105.43 C 684.366 1106.48 678.867 1107.47 676.903 1107.32 C 655.428 1105.67 539.457 1109.53 527.711 1105.45 C 523.437 1098.23 508.929 860.275 507.448 828.4 C 489.002 802.519 471.478 775.79 452.969 749.854 L 452.964 576.517 L 452.969 523.621 C 452.971 515.694 451.544 492.6 455.959 487.206 z"/>
        <path transform="translate(-300,0)" fill="rgb(254,254,254)" d="M 871.18 487.219 C 883.706 486.326 902.143 486.793 915.036 486.79 L 992.502 486.783 C 1012.99 486.785 1163.93 484.801 1174.43 488.651 C 1176.77 499.384 1175.91 555.784 1175.92 570.41 L 1175.71 749.909 C 1165.01 768.568 1150.89 786.325 1138.59 804.04 C 1133.45 811.441 1127.47 818.963 1123.83 827.221 C 1118.85 838.542 1109.29 1014.78 1107.42 1041.92 C 1106.47 1052.24 1105.18 1100.62 1100.69 1105.19 C 1091.86 1110.29 962.329 1105.81 943.354 1106.3 C 936.974 1106.47 936.939 1066.03 936.504 1059.45 L 927.014 909.856 C 925.627 885.774 925.077 852.257 921.281 828.444 C 920.752 825.125 906.03 804.439 902.998 800.059 L 868.865 750.667 L 868.789 577.908 C 868.798 549.984 868.558 521.232 869.172 493.286 C 869.221 491.085 869.984 489.077 871.18 487.219 z"/>
        <circle cx="305" cy="342" r="96" fill="white"/>
        <circle cx="720.5" cy="342" r="96" fill="white"/>
        <circle cx="1130.5" cy="342" r="96" fill="white"/>
      </svg>
    `;
  }

  unknownSvg() {
    return `
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" style="display: block;" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <rect width="1992" height="1306" x="24" y="37" rx="110" fill="rgb(192,192,192)"/>
      </svg>
    `;
  }

  unknownFrontSvg() {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" style="display:block" viewBox="0 0 2048 1375" width="740" height="497" preserveAspectRatio="none">
        <path fill="rgb(192,192,192)" d="M164 37h946q80 0 130 68l690 1125q86 113-60 113H164q-140 0-140-140V177Q24 37 164 37"/>
      </svg>
    `;
  }

  // The default height for the card in masonry view
  getCardSize() {
    return 3;
  }

  // The default rules for the card in sections view
  getGridOptions() {
    return {
      columns: 9,
      min_columns: 9,
      rows: "auto",
      min_rows: 1
    };
  }



}

customElements.define("ha-transportnsw-card", VehicleOccupancyCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "ha-transportnsw-card",
  name: "Transport NSW Mk II vehicle occupancy card",
  preview: true,
  description: "A card to show graphical per-vehicle occupancy information",
  documentationURL: "https://github.com/andystewart999/ha_transportnsw/",

  getEntitySuggestion: (hass, entityId) => {
    const domain = entityId.split(".")[0];

    if (domain !== "sensor") {
      return null;
    }

    const stateObj1 = hass.states[entityId];

    if (
      !stateObj1 ||
      !stateObj1.attributes ||
      !("occupancy_detail" in stateObj1.attributes)
    ) {
      return null;
    }

    return {
      config: {
        type: "custom:ha-transportnsw-card",
        entity: entityId,
        entity2: [],
        rotation_interval: 10,
        title: "",
        attribute: "occupancy_detail",
        max_carriage_width: 80,
      },
      label: "",
    };
  },
});
