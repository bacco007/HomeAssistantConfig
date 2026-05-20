import { describe, expect, it } from "vitest";

import {
  mergeTargetSelections,
  normalizeEntityIds,
  normalizeTargetSelection,
  normalizeTargetValue,
  panelConfigTarget,
  resolveEntityIdsFromTarget,
} from "@/lib/domain/target-selection";

describe("target-selection", () => {
  describe("GIVEN mixed entity id values", () => {
    describe("WHEN normalizeEntityIds is called", () => {
      it("THEN it keeps only trimmed string ids", () => {
        expect.assertions(1);

        expect(
          normalizeEntityIds([" sensor.a ", "", null, "sensor.b"])
        ).toEqual(["sensor.a", "sensor.b"]);
      });
    });
  });

  describe("GIVEN target input in different shapes", () => {
    describe("WHEN normalizeTargetValue and normalizeTargetSelection are called", () => {
      it("THEN they normalize and deduplicate each target bucket", () => {
        expect.assertions(2);

        expect(
          normalizeTargetValue({
            entity_id: ["sensor.a"],
            entity: ["sensor.b"],
            device_id: "device.one",
            area_id: ["kitchen"],
            label_id: "heating",
          })
        ).toEqual({
          entity_id: ["sensor.a", "sensor.b"],
          device_id: ["device.one"],
          area_id: ["kitchen"],
          label_id: ["heating"],
        });
        expect(
          normalizeTargetSelection({
            entity_id: ["sensor.a", "sensor.a"],
            area_id: ["kitchen", "kitchen"],
          })
        ).toEqual({
          entity_id: ["sensor.a"],
          device_id: [],
          area_id: ["kitchen"],
          label_id: [],
        });
      });
    });
  });

  describe("GIVEN multiple target objects", () => {
    describe("WHEN mergeTargetSelections is called", () => {
      it("THEN it merges all buckets without duplicates", () => {
        expect.assertions(1);

        expect(
          mergeTargetSelections(
            { entity_id: ["sensor.a"], device_id: ["device.one"] },
            {
              entity_id: ["sensor.b"],
              device_id: ["device.one"],
              label_id: ["heating"],
            }
          )
        ).toEqual({
          entity_id: ["sensor.a", "sensor.b"],
          device_id: ["device.one"],
          area_id: [],
          label_id: ["heating"],
        });
      });
    });
  });

  describe("GIVEN a registry-backed Home Assistant object", () => {
    describe("WHEN resolveEntityIdsFromTarget is called", () => {
      it("THEN it expands device, area, and label matches", () => {
        expect.assertions(1);

        const hass = {
          entities: {
            "sensor.alpha": {
              device_id: "device.one",
              area_id: "kitchen",
              labels: ["heating"],
            },
            "sensor.beta": {
              device_id: "device.two",
              area_id: "office",
              label_ids: ["power"],
            },
          },
          devices: {},
        };

        expect(
          resolveEntityIdsFromTarget(hass, {
            entity_id: ["sensor.direct"],
            device_id: ["device.one"],
            area_id: ["office"],
            label_id: ["power"],
          })
        ).toEqual(["sensor.direct", "sensor.alpha", "sensor.beta"]);
      });

      it("THEN it includes entities whose device is assigned to the selected area", () => {
        expect.assertions(1);

        // sensor.via_device has no area_id of its own — its device is in "lounge"
        const hass = {
          entities: {
            "sensor.direct_area": {
              device_id: null,
              area_id: "lounge",
              labels: [],
            },
            "sensor.via_device": {
              device_id: "device.shelf",
              area_id: null,
              labels: [],
            },
            "sensor.other_area": {
              device_id: "device.other",
              area_id: "kitchen",
              labels: [],
            },
          },
          devices: {
            "device.shelf": {
              id: "device.shelf",
              name: "Shelf",
              area_id: "lounge",
            },
            "device.other": {
              id: "device.other",
              name: "Other",
              area_id: "kitchen",
            },
          },
        };

        expect(
          resolveEntityIdsFromTarget(hass, { area_id: ["lounge"] })
        ).toEqual(["sensor.direct_area", "sensor.via_device"]);
      });
    });
  });

  describe("GIVEN panel config input", () => {
    describe("WHEN panelConfigTarget is called", () => {
      it("THEN it prefers explicit target and falls back to entities", () => {
        expect.assertions(2);

        expect(
          panelConfigTarget({ target: { entity_id: ["sensor.a"] } })
        ).toEqual({ entity_id: ["sensor.a"] });
        expect(panelConfigTarget({ entities: ["sensor.b"] })).toEqual({
          entity_id: ["sensor.b"],
        });
      });
    });
  });
});
