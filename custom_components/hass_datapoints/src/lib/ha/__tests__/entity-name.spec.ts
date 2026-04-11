import { describe, expect, it } from "vitest";

import {
  areaIcon,
  areaName,
  deviceIcon,
  deviceName,
  entityIcon,
  entityName,
  labelIcon,
  labelName,
} from "@/lib/ha/entity-name";

describe("entity-name", () => {
  const hass = {
    states: {
      "sensor.alpha": {
        attributes: {
          friendly_name: "Alpha Sensor",
          icon: "mdi:thermometer",
        },
      },
      "switch.beta": {
        attributes: {},
      },
    },
    entities: {
      "sensor.alpha": {
        device_id: "device.one",
        area_id: "kitchen",
        labels: ["heating"],
      },
      "switch.beta": {
        deviceId: "device.two",
        areaId: "office",
        label_ids: ["power"],
      },
    },
    devices: {
      "device.one": { name: "Radiator" },
    },
    areas: {
      kitchen: { name: "Kitchen" },
    },
    labels: {
      heating: { name: "Heating" },
    },
  };

  describe("GIVEN entity registry and state metadata", () => {
    describe("WHEN the entity helpers are called", () => {
      it("THEN they resolve names and icons with sensible fallbacks", () => {
        expect.assertions(8);

        expect(entityName(hass, "sensor.alpha")).toBe("Alpha Sensor");
        expect(entityIcon(hass, "sensor.alpha")).toBe("mdi:thermometer");
        expect(entityIcon(hass, "switch.beta")).toBe("mdi:toggle-switch");
        expect(deviceName(hass, "device.one")).toBe("Radiator");
        expect(deviceIcon(hass, "device.one")).toBe("mdi:thermometer");
        expect(areaName(hass, "kitchen")).toBe("Kitchen");
        expect(areaIcon(hass, "kitchen")).toBe("mdi:thermometer");
        expect(labelName(hass, "heating")).toBe("Heating");
      });
    });
  });

  describe("GIVEN label relationships", () => {
    describe("WHEN labelIcon is called", () => {
      it("THEN it resolves the related entity icon or falls back", () => {
        expect.assertions(2);

        expect(labelIcon(hass, "heating")).toBe("mdi:thermometer");
        expect(labelIcon(hass, "missing")).toBe("mdi:label-outline");
      });
    });
  });
});
