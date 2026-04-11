import { describe, expect, it } from "vitest";
import {
  entityName,
  entityIcon,
  deviceName,
  deviceIcon,
  areaName,
  areaIcon,
  labelName,
  labelIcon,
} from "@/lib/ha/entity-name";

function makeHass(overrides: RecordWithUnknownValues = {}) {
  return {
    states: {},
    entities: {},
    devices: {},
    areas: {},
    labels: {},
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// entityName
// ─────────────────────────────────────────────────────────────────────────────

describe("entityName", () => {
  describe("GIVEN a missing hass or entityId", () => {
    it("THEN returns empty string for null hass", () => {
      expect.assertions(1);
      expect(entityName(null, "sensor.temp")).toBe("sensor.temp");
    });

    it("THEN returns empty string for null entityId", () => {
      expect.assertions(1);
      expect(entityName(makeHass(), null)).toBe("");
    });
  });

  describe("GIVEN a state with a friendly_name", () => {
    it("THEN returns the friendly name", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: {
          "sensor.temp": { attributes: { friendly_name: "Temperature" } },
        },
      });
      expect(entityName(hass, "sensor.temp")).toBe("Temperature");
    });
  });

  describe("GIVEN a state without a friendly_name", () => {
    it("THEN falls back to the entity ID", () => {
      expect.assertions(1);
      const hass = makeHass({ states: { "sensor.temp": { attributes: {} } } });
      expect(entityName(hass, "sensor.temp")).toBe("sensor.temp");
    });
  });

  describe("GIVEN an entityId not in states", () => {
    it("THEN falls back to the entity ID", () => {
      expect.assertions(1);
      expect(entityName(makeHass(), "sensor.unknown")).toBe("sensor.unknown");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// entityIcon
// ─────────────────────────────────────────────────────────────────────────────

describe("entityIcon", () => {
  describe("GIVEN a missing hass or entityId", () => {
    it("THEN returns the default fallback icon", () => {
      expect.assertions(1);
      expect(entityIcon(null, "sensor.temp")).toBe("mdi:link-variant");
    });
  });

  describe("GIVEN a state with an explicit icon attribute", () => {
    it("THEN returns the icon from state attributes", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: { icon: "mdi:custom-icon" } } },
      });
      expect(entityIcon(hass, "sensor.temp")).toBe("mdi:custom-icon");
    });
  });

  describe("GIVEN a sensor entity with no explicit icon", () => {
    it("THEN returns the domain-default icon for sensor", () => {
      expect.assertions(1);
      const hass = makeHass({ states: { "sensor.temp": { attributes: {} } } });
      expect(entityIcon(hass, "sensor.temp")).toBe("mdi:chart-line");
    });
  });

  describe("GIVEN a light entity with no explicit icon", () => {
    it("THEN returns the domain-default icon for light", () => {
      expect.assertions(1);
      const hass = makeHass({ states: { "light.main": { attributes: {} } } });
      expect(entityIcon(hass, "light.main")).toBe("mdi:lightbulb");
    });
  });

  describe("GIVEN an entity with an icon in the registry entry", () => {
    it("THEN returns the registry icon", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: {} } },
        entities: { "sensor.temp": { icon: "mdi:registry-icon" } },
      });
      expect(entityIcon(hass, "sensor.temp")).toBe("mdi:registry-icon");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deviceName
// ─────────────────────────────────────────────────────────────────────────────

describe("deviceName", () => {
  describe("GIVEN a missing hass or deviceId", () => {
    it("THEN returns empty string for null arguments", () => {
      expect.assertions(2);
      expect(deviceName(null, "dev-1")).toBe("dev-1");
      expect(deviceName(makeHass(), null)).toBe("");
    });
  });

  describe("GIVEN a device with a name", () => {
    it("THEN returns the device name", () => {
      expect.assertions(1);
      const hass = makeHass({ devices: { "dev-1": { name: "My Device" } } });
      expect(deviceName(hass, "dev-1")).toBe("My Device");
    });
  });

  describe("GIVEN an unknown device ID", () => {
    it("THEN falls back to the device ID", () => {
      expect.assertions(1);
      expect(deviceName(makeHass(), "dev-unknown")).toBe("dev-unknown");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// deviceIcon
// ─────────────────────────────────────────────────────────────────────────────

describe("deviceIcon", () => {
  describe("GIVEN null arguments", () => {
    it("THEN returns the default devices icon", () => {
      expect.assertions(1);
      expect(deviceIcon(null, "dev-1")).toBe("mdi:devices");
    });
  });

  describe("GIVEN a device with no related entities", () => {
    it("THEN returns the default devices icon", () => {
      expect.assertions(1);
      expect(deviceIcon(makeHass(), "dev-1")).toBe("mdi:devices");
    });
  });

  describe("GIVEN a device with a related sensor entity", () => {
    it("THEN returns the sensor domain icon", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: {} } },
        entities: { "sensor.temp": { device_id: "dev-1" } },
      });
      expect(deviceIcon(hass, "dev-1")).toBe("mdi:chart-line");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// areaName
// ─────────────────────────────────────────────────────────────────────────────

describe("areaName", () => {
  describe("GIVEN null arguments", () => {
    it("THEN returns empty string", () => {
      expect.assertions(1);
      expect(areaName(null, "area-1")).toBe("area-1");
    });
  });

  describe("GIVEN an area with a name", () => {
    it("THEN returns the area name", () => {
      expect.assertions(1);
      const hass = makeHass({ areas: { "area-1": { name: "Living Room" } } });
      expect(areaName(hass, "area-1")).toBe("Living Room");
    });
  });

  describe("GIVEN an unknown area ID", () => {
    it("THEN falls back to the area ID", () => {
      expect.assertions(1);
      expect(areaName(makeHass(), "area-unknown")).toBe("area-unknown");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// areaIcon
// ─────────────────────────────────────────────────────────────────────────────

describe("areaIcon", () => {
  describe("GIVEN null arguments", () => {
    it("THEN returns the default floor-plan icon", () => {
      expect.assertions(1);
      expect(areaIcon(null, "area-1")).toBe("mdi:floor-plan");
    });
  });

  describe("GIVEN an area with no related entities", () => {
    it("THEN returns the default floor-plan icon", () => {
      expect.assertions(1);
      expect(areaIcon(makeHass(), "area-1")).toBe("mdi:floor-plan");
    });
  });

  describe("GIVEN an area with a related sensor entity", () => {
    it("THEN returns the sensor domain icon", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: {} } },
        entities: { "sensor.temp": { area_id: "area-1" } },
      });
      expect(areaIcon(hass, "area-1")).toBe("mdi:chart-line");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// labelName
// ─────────────────────────────────────────────────────────────────────────────

describe("labelName", () => {
  describe("GIVEN null arguments", () => {
    it("THEN returns empty string", () => {
      expect.assertions(1);
      expect(labelName(null, "lbl-1")).toBe("lbl-1");
    });
  });

  describe("GIVEN a label with a name", () => {
    it("THEN returns the label name", () => {
      expect.assertions(1);
      const hass = makeHass({ labels: { "lbl-1": { name: "Critical" } } });
      expect(labelName(hass, "lbl-1")).toBe("Critical");
    });
  });

  describe("GIVEN an unknown label ID", () => {
    it("THEN falls back to the label ID", () => {
      expect.assertions(1);
      expect(labelName(makeHass(), "lbl-unknown")).toBe("lbl-unknown");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// labelIcon
// ─────────────────────────────────────────────────────────────────────────────

describe("labelIcon", () => {
  describe("GIVEN null arguments", () => {
    it("THEN returns the default label-outline icon", () => {
      expect.assertions(1);
      expect(labelIcon(null, "lbl-1")).toBe("mdi:label-outline");
    });
  });

  describe("GIVEN a label with no related entities", () => {
    it("THEN returns the default label-outline icon", () => {
      expect.assertions(1);
      expect(labelIcon(makeHass(), "lbl-1")).toBe("mdi:label-outline");
    });
  });

  describe("GIVEN a label with a related sensor entity via label_ids", () => {
    it("THEN returns the sensor domain icon", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: {} } },
        entities: { "sensor.temp": { label_ids: ["lbl-1"] } },
      });
      expect(labelIcon(hass, "lbl-1")).toBe("mdi:chart-line");
    });
  });

  describe("GIVEN a label with a related sensor entity via labels array", () => {
    it("THEN returns the sensor domain icon", () => {
      expect.assertions(1);
      const hass = makeHass({
        states: { "sensor.temp": { attributes: {} } },
        entities: { "sensor.temp": { labels: ["lbl-1"] } },
      });
      expect(labelIcon(hass, "lbl-1")).toBe("mdi:chart-line");
    });
  });
});
